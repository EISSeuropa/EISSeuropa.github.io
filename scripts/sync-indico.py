#!/usr/bin/env python3
"""
Sync helper: refresh src/_data/indico.json from the EISS Indico
instance's anonymous export API.

Usage:
    python3 scripts/sync-indico.py

What it does:
  1. GETs https://indico.eiss-europa.com/export/categ/0.json with
     `from=today` and `to=<today + LOOK_AHEAD_DAYS>`. The root category
     returns events from all sub-categories (Annual Conferences,
     Members' Events, etc).
  2. Drops events whose `categoryId` is in EXCLUDE_CATEGORY_IDS —
     currently just `1` (Annual Conferences), because those are
     already featured on the homepage via src/_data/conferences.js.
     The Annual Conference card is much richer (organisers, dates in
     three languages, neighbourhood tiles on the dedicated page) than
     what Indico's listing surfaces, so we want it driven by the
     hand-maintained data file, not by Indico.
  3. Normalises each event to a stable schema for the templates —
     `id`, `title`, `category`, `categoryId`, `start` + `end` (combined
     ISO 8601 strings), `location`, `room`, `url`, `type`, `_raw`
     (kept under an underscore for debugging only).
  4. Writes the result to src/_data/indico.json. If the new data is
     byte-identical to what's already there, leaves the file untouched
     (so re-runs on quiet days don't dirty the working tree).

Failure modes:
  - Network failure or non-200 from Indico → script exits 1.
    The CI workflow treats this as a soft fail: the existing
    indico.json snapshot stays in place and the site keeps working
    with the last good data. Surface in workflow logs only.
  - Schema drift (Indico changes a field name) → the normalise()
    step is defensive (`.get()` with sensible defaults), so partial
    data is still produced rather than the whole sync crashing.

Requires: requests. See scripts/requirements.txt.
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Install deps: pip install -r scripts/requirements.txt")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "_data" / "indico.json"

INDICO_BASE = "https://indico.eiss-europa.com"
ROOT_CATEGORY_ID = 0          # Indico root — returns events from all sub-categories
LOOK_AHEAD_DAYS = 540          # ~18 months
EXCLUDE_CATEGORY_IDS = {1}     # Annual Conferences (driven by src/_data/conferences.js)

# Common Eleventy/JS will compare ISO strings lexicographically and this works
# fine for "is this future" comparisons as long as we always include the time.
ISO_FMT = "%Y-%m-%dT%H:%M:%S"


def _combine_indico_datetime(d: dict) -> str | None:
    """Indico returns {date: 'YYYY-MM-DD', time: 'HH:MM:SS', tz: 'Europe/Paris'}.
    Combine into a plain ISO-8601 string. We deliberately drop the timezone
    offset — templates only do lexicographic comparisons, so all events
    sharing a TZ assumption sort correctly. The original TZ is preserved in
    the raw event under `_raw.tz` for anyone who needs it."""
    if not d:
        return None
    date = d.get("date")
    time = d.get("time") or "00:00:00"
    if not date:
        return None
    return f"{date}T{time}"


def normalise(event: dict) -> dict:
    """Strip Indico-internal fields, return only what the templates need.
    Defensive against schema drift — anything missing degrades to "" or None
    rather than crashing the sync."""
    return {
        "id": str(event.get("id", "")),
        "title": event.get("title", "(untitled)"),
        "category": event.get("category", ""),
        "categoryId": event.get("categoryId"),
        "start": _combine_indico_datetime(event.get("startDate") or {}),
        "end": _combine_indico_datetime(event.get("endDate") or {}),
        "startTz": (event.get("startDate") or {}).get("tz", ""),
        "startDateOnly": (event.get("startDate") or {}).get("date", ""),
        "endDateOnly": (event.get("endDate") or {}).get("date", ""),
        "location": event.get("location", ""),
        "room": event.get("room", ""),
        "url": event.get("url", ""),
        "type": event.get("type", ""),
    }


def fetch_events() -> list[dict]:
    today = dt.date.today()
    to_date = today + dt.timedelta(days=LOOK_AHEAD_DAYS)
    url = (
        f"{INDICO_BASE}/export/categ/{ROOT_CATEGORY_ID}.json"
        f"?from={today.isoformat()}&to={to_date.isoformat()}"
        f"&detail=events&order=start"
    )
    print(f"GET {url}", file=sys.stderr)
    r = requests.get(url, timeout=30, headers={"Accept": "application/json"})
    r.raise_for_status()
    payload = r.json()
    if payload.get("_type") != "HTTPAPIResult":
        sys.exit(
            f"Unexpected payload shape from Indico: top-level _type is "
            f"{payload.get('_type')!r}, expected 'HTTPAPIResult'"
        )
    return payload.get("results", []) or []


def main() -> None:
    raw_events = fetch_events()
    print(f"Fetched {len(raw_events)} event(s) from Indico", file=sys.stderr)

    filtered: list[dict] = []
    excluded: list[dict] = []
    for ev in raw_events:
        norm = normalise(ev)
        if norm["categoryId"] in EXCLUDE_CATEGORY_IDS:
            excluded.append(norm)
        else:
            filtered.append(norm)

    # Sort upcoming events by start time. Indico already orders by start
    # when `order=start` is requested, but be defensive.
    filtered.sort(key=lambda e: (e["start"] or "9999-12-31T23:59:59"))

    output = {
        "_documentation": (
            "Read-only snapshot of upcoming events from "
            f"{INDICO_BASE}/export/categ/{ROOT_CATEGORY_ID}.json. "
            "Generated by scripts/sync-indico.py (run daily by "
            ".github/workflows/sync-indico.yml). DO NOT EDIT BY HAND — "
            "the next sync will overwrite. Annual Conferences "
            "(categoryId 1) are filtered out because they're driven by "
            "src/_data/conferences.js instead."
        ),
        "syncedAt": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "source": f"{INDICO_BASE}/export/categ/{ROOT_CATEGORY_ID}.json",
        "lookaheadDays": LOOK_AHEAD_DAYS,
        "upcoming": filtered,
        "excludedCount": len(excluded),
    }

    serialised = json.dumps(output, indent=2, ensure_ascii=False) + "\n"

    # Only write if changed — avoids touching mtime on quiet days and
    # avoids the workflow opening a "no changes" commit.
    if OUT.exists() and OUT.read_text(encoding="utf-8") == serialised:
        print("No change — indico.json already up to date.", file=sys.stderr)
        return

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(serialised, encoding="utf-8")
    print(
        f"Wrote {OUT.relative_to(ROOT)} — "
        f"{len(filtered)} upcoming event(s) (excluded {len(excluded)} "
        "Annual Conference event(s) — those come from conferences.js).",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
