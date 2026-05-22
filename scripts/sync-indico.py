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
  2. Splits events into two buckets:
     - `upcoming`: members' events, workshops, anything NOT in
       ANNUAL_CONFERENCE_CATEGORY_IDS. Rendered on /index and /events.
     - `annualConferences`: dict keyed by year ("2026", "2027", ...)
       holding the registration page event for that year's ESSC,
       enriched with a `livestreamed` list of plenary + roundtable
       sessions pulled from the event timetable. Consumed by /2026,
       /2027, … to derive the registration status badge ("Registration
       open", "Happening now", "Past") and the Livestreamed sessions
       block (introduction, roundtables, keynote, closing — each
       with an "Online room TBA" / "Join online" CTA).
     The hand-maintained src/_data/conferences.js still owns dates,
     venues, organisers, programme tiles — Indico only contributes
     the registration link and a live signal of whether it's open.
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
import os
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

# Indico API token (read-only, on a dedicated service account). Only
# used on the newer `/api/*` endpoints — Indico's legacy `/export/*`
# API rejects Bearer auth with 400 on some versions, so call sites
# must opt in via `_get(url, authenticate=True)`. The token is
# detected here so the startup mode banner can confirm in CI logs
# that the secret was wired up correctly.
#
# Storage: GitHub Actions secret named `INDICO_API_TOKEN`, surfaced
# to the workflow step via `env:`. NEVER hardcode the token here.
INDICO_API_TOKEN = os.environ.get("INDICO_API_TOKEN")
ANNUAL_CONFERENCE_CATEGORY_IDS = {1}  # ESSC editions — routed into `annualConferences` bucket

# Classification — three signals, in priority order. A session ends
# up in the livestreamed list if ANY of them resolves to a known type.
#
# 1. Indico session "Type" (visible in Indico as: Round Table / Plenary
#    / Closed Panel / Open Panel / Poster / Plenary / "No type
#    selected"). This is the EISS operator's preferred convention going
#    forward — it's clicked from a dropdown rather than typed, so it's
#    less prone to typos than session codes. NOTE: the timetable export
#    does NOT include this field; we have to fetch each session's
#    detail endpoint separately to read it. One HTTP call per session,
#    daily — fine.
LIVESTREAM_SESSION_TYPES = {
    "Round Table": "roundtable",
    # "Plenary" alone is ambiguous (keynote vs. closing vs. intro), so
    # it's only resolved with help from the sessionCode below.
}

# 2. Indico session code — the original signal. Kept as a second
#    source of truth because (a) the introductory remarks slot has
#    no Type set in 2026, (b) it disambiguates the otherwise
#    overloaded "Plenary" type. The 2026 ESSC uses:
#      "INTRO" — opening / introductory remarks
#      "KEY"   — keynote talk
#      "RT"    — roundtable
#      "CONC"  — concluding remarks
LIVESTREAM_SESSION_CODES = {
    "INTRO": "introduction",
    "KEY": "keynote",
    "RT": "roundtable",
    "CONC": "conclusion",
}

# 3. Title-prefix safety net — applied only when neither Type nor
#    sessionCode resolve. Lets a roundtable whose Indico title still
#    starts with "Roundtable:" appear before someone tags it. The
#    prefix is stripped from the displayed title since the type is
#    conveyed by the row's eyebrow.
TITLE_PREFIX_FALLBACKS = {
    "Roundtable:": "roundtable",
}

# Substring tokens we look for in URL fields when extracting video-room
# links from Indico's timetable. The Indico Zoom integration stores the
# join URL in a per-session `videoRooms` block; older sessions sometimes
# embed it in the description. The match is generous so MS Teams / Webex
# / Google Meet keep working if EISS swaps backends in the future.
VC_URL_TOKENS = ("zoom.us", "meet.google", "teams.microsoft", "webex.com")

# Common Eleventy/JS will compare ISO strings lexicographically and this works
# fine for "is this future" comparisons as long as we always include the time.
ISO_FMT = "%Y-%m-%dT%H:%M:%S"


def _get(url: str, authenticate: bool = False) -> requests.Response:
    """One-stop HTTP GET. Adds the bearer token only when explicitly
    requested via `authenticate=True`, because Indico has two parallel
    APIs that disagree about auth headers:

      - legacy `/export/*` endpoints (everything this script currently
        hits) accept anonymous access, OR an `?apikey=…` query
        parameter scheme. They reject `Authorization: Bearer …` with
        a 400 on some Indico versions.
      - newer `/api/*` endpoints accept Bearer tokens and require them
        for protected resources (registration state, private events).

    Default `authenticate=False` keeps every existing call site
    anonymous — which is what they need. New call sites that hit
    `/api/*` pass `authenticate=True` to opt in. The token is NEVER
    logged regardless of mode.
    """
    headers = {"Accept": "application/json"}
    if authenticate and INDICO_API_TOKEN:
        headers["Authorization"] = f"Bearer {INDICO_API_TOKEN}"
    return requests.get(url, timeout=30, headers=headers)


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


def _find_vc_url(blob) -> str | None:
    """Walk a nested dict/list and return the first URL that looks like
    a video-conference link. Generous matcher so EISS isn't locked to
    Zoom — any of Zoom/Meet/Teams/Webex counts. Returns None if nothing
    matches."""
    import re
    url_re = re.compile(r"https?://[^\s\"'<>]+")
    def walk(o):
        if isinstance(o, dict):
            for v in o.values():
                hit = walk(v)
                if hit:
                    return hit
        elif isinstance(o, list):
            for v in o:
                hit = walk(v)
                if hit:
                    return hit
        elif isinstance(o, str):
            for url in url_re.findall(o):
                low = url.lower()
                if any(tok in low for tok in VC_URL_TOKENS):
                    return url
        return None
    return walk(blob)


def fetch_timetable(event_id: str) -> dict:
    """Pull the public timetable for a single event. Returns the raw
    Indico results-dict (keyed by event id, then by YYYYMMDD day) or an
    empty dict if anything goes wrong — we never want a missing timetable
    to abort the wider sync."""
    url = f"{INDICO_BASE}/export/timetable/{event_id}.json"
    print(f"GET {url}", file=sys.stderr)
    try:
        r = _get(url)
        r.raise_for_status()
        payload = r.json()
    except Exception as exc:  # noqa: BLE001 — sync is best-effort
        print(f"  ! timetable fetch failed: {exc}", file=sys.stderr)
        return {}
    return payload.get("results", {}) or {}


def fetch_session_type(event_id: str, session_id) -> str | None:
    """Pull a single session's metadata to read the Indico `type`
    field — the bulk timetable export doesn't include it. Returns the
    raw type string ("Round Table", "Plenary", "Closed Panel", …) or
    None if the field is unset / the call failed."""
    if not session_id:
        return None
    url = f"{INDICO_BASE}/export/event/{event_id}/session/{session_id}.json"
    try:
        r = _get(url)
        r.raise_for_status()
        payload = r.json()
    except Exception as exc:  # noqa: BLE001 — best-effort enrichment
        print(f"  ! session {session_id} detail fetch failed: {exc}", file=sys.stderr)
        return None
    results = payload.get("results") or []
    if not results:
        return None
    return (results[0].get("session") or {}).get("type")


def _classify_session(slot: dict, indico_type: str | None) -> str | None:
    """Return the livestream-type label for a session slot, or None
    if it isn't livestreamed. Three signals checked in order:

      1. Indico session Type (preferred — picked from a dropdown,
         less prone to typos). "Plenary" alone is ambiguous, so we
         disambiguate it with sessionCode (INTRO/KEY/CONC); without
         a code it defaults to "keynote", which is the dominant
         use of "Plenary" at EISS.
      2. sessionCode — works when Type is unset (e.g. the 2026
         INTRO slot has no Type in Indico).
      3. Title prefix ("Roundtable:") — last-resort safety net.
    """
    code = (slot.get("sessionCode") or "").strip()

    # 1. Indico Type
    if indico_type:
        mapped = LIVESTREAM_SESSION_TYPES.get(indico_type)
        if mapped:
            return mapped
        if indico_type == "Plenary":
            # Resolve the overloaded "Plenary" type via sessionCode.
            # Without a code, default to keynote — that's the most
            # common use of "Plenary" at EISS (e.g. invited speaker).
            return LIVESTREAM_SESSION_CODES.get(code) or "keynote"
        # Otherwise (Closed Panel / Open Panel / Poster / …) skip.
        return None

    # 2. sessionCode (when Type isn't set)
    mapped = LIVESTREAM_SESSION_CODES.get(code)
    if mapped:
        return mapped

    # 3. Title prefix
    title = (slot.get("title") or "").strip()
    for prefix, kind in TITLE_PREFIX_FALLBACKS.items():
        if title.startswith(prefix):
            return kind
    return None


def extract_livestreamed(timetable_results: dict, event_id: str) -> list[dict]:
    """Pick out livestreamed sessions (introduction / roundtable /
    keynote / conclusion) from a timetable export. Returns a sorted
    list of normalised dicts.

    For each timetable slot that's a Session, we first need the
    session's Type field — which only the per-session detail endpoint
    exposes. We cache by sessionId so each session is fetched once,
    even when it spans multiple slots (e.g. coffee breaks).
    """
    sessions: list[dict] = []
    type_cache: dict = {}  # sessionId → Indico type string (or None)
    event_block = timetable_results.get(str(event_id), {})
    for day_key, day in event_block.items():
        if not isinstance(day, dict):
            continue
        for slot_id, slot in day.items():
            if not isinstance(slot, dict):
                continue
            if slot.get("entryType") != "Session":
                continue
            session_id = slot.get("sessionId")
            if session_id not in type_cache:
                type_cache[session_id] = fetch_session_type(event_id, session_id)
            indico_type = type_cache[session_id]
            session_type = _classify_session(slot, indico_type)
            if not session_type:
                continue
            start = slot.get("startDate") or {}
            end = slot.get("endDate") or {}
            # Strip the "Roundtable:" prefix from the displayed title —
            # we already convey the type via the eyebrow.
            raw_title = slot.get("title") or slot.get("slotTitle") or "(untitled session)"
            display_title = raw_title
            for prefix in TITLE_PREFIX_FALLBACKS:
                if display_title.startswith(prefix):
                    display_title = display_title[len(prefix):].strip()
                    break
            sessions.append({
                "type": session_type,
                "id": str(slot.get("id", slot_id)),
                "title": display_title,
                "slotTitle": slot.get("slotTitle") or "",
                "startDate": start.get("date", ""),
                "startTime": (start.get("time") or "")[:5],  # HH:MM
                "endTime": (end.get("time") or "")[:5],
                "tz": start.get("tz", ""),
                "location": slot.get("location") or "",
                "room": slot.get("room") or "",
                "url": (slot.get("url") or "").lstrip("/") and (
                    slot["url"] if slot["url"].startswith("http")
                    else f"{INDICO_BASE}{slot['url']}"
                ),
                # Conveners: short list of {name, affiliation}
                "conveners": [
                    {
                        "name": c.get("name") or c.get("fullName") or "",
                        "affiliation": c.get("affiliation") or "",
                    }
                    for c in (slot.get("conveners") or [])
                ],
                # Video-conference URL if Indico has one for this slot.
                # None when the link hasn't been published yet — templates
                # show a "TBA" placeholder in that case.
                "videoUrl": _find_vc_url(slot),
            })
    # Sort by start date+time so sessions appear in programme order
    # (introduction → roundtables/keynotes → conclusion, day by day).
    sessions.sort(key=lambda k: (k["startDate"], k["startTime"]))
    return sessions


def fetch_events() -> list[dict]:
    today = dt.date.today()
    to_date = today + dt.timedelta(days=LOOK_AHEAD_DAYS)
    url = (
        f"{INDICO_BASE}/export/categ/{ROOT_CATEGORY_ID}.json"
        f"?from={today.isoformat()}&to={to_date.isoformat()}"
        f"&detail=events&order=start"
    )
    print(f"GET {url}", file=sys.stderr)
    r = _get(url)
    r.raise_for_status()
    payload = r.json()
    if payload.get("_type") != "HTTPAPIResult":
        sys.exit(
            f"Unexpected payload shape from Indico: top-level _type is "
            f"{payload.get('_type')!r}, expected 'HTTPAPIResult'"
        )
    return payload.get("results", []) or []


def main() -> None:
    # Log whether we're authenticated — without ever printing the token.
    # Useful to confirm in CI that the secret is wired correctly.
    mode = "authenticated" if INDICO_API_TOKEN else "anonymous"
    print(f"Indico sync running in {mode} mode", file=sys.stderr)

    raw_events = fetch_events()
    print(f"Fetched {len(raw_events)} event(s) from Indico", file=sys.stderr)

    upcoming: list[dict] = []
    annual_by_year: dict[str, dict] = {}
    for ev in raw_events:
        norm = normalise(ev)
        if norm["categoryId"] in ANNUAL_CONFERENCE_CATEGORY_IDS:
            # Key by the year of the start date so /2026, /2027, … can each
            # pick out their own registration page. If multiple events
            # exist in the same year (e.g. a prep meeting AND the main
            # event), keep the latest-starting one — the main conference
            # usually starts later in the year than scaffolding events.
            year = (norm["startDateOnly"] or "")[:4]
            if not year:
                continue
            existing = annual_by_year.get(year)
            if existing is None or (norm["start"] or "") > (existing["start"] or ""):
                annual_by_year[year] = norm
        else:
            upcoming.append(norm)

    # Sort upcoming events by start time. Indico already orders by start
    # when `order=start` is requested, but be defensive.
    upcoming.sort(key=lambda e: (e["start"] or "9999-12-31T23:59:59"))

    # Enrich each Annual Conference with its timetable-derived
    # livestreamed-sessions list (introduction + roundtables +
    # keynotes + conclusion). One extra HTTP request per ESSC year —
    # currently 1 call. If a future edition adds half-a-dozen Indico
    # events under the Annual Conferences category, this stays
    # bounded because we only fetch timetables for the events we've
    # kept (the latest per year).
    for year, event in annual_by_year.items():
        tt = fetch_timetable(event["id"])
        livestreamed = extract_livestreamed(tt, event["id"])
        event["livestreamed"] = livestreamed
        with_video = sum(1 for k in livestreamed if k.get("videoUrl"))
        by_type: dict[str, int] = {}
        for k in livestreamed:
            by_type[k["type"]] = by_type.get(k["type"], 0) + 1
        print(
            f"  {year}: {len(livestreamed)} livestreamed session(s) "
            f"[{', '.join(f'{n} {t}' for t, n in sorted(by_type.items()))}]; "
            f"{with_video} with video link; "
            f"{len(livestreamed) - with_video} TBA",
            file=sys.stderr,
        )

    output = {
        "_documentation": (
            "Read-only snapshot of upcoming events from "
            f"{INDICO_BASE}/export/categ/{ROOT_CATEGORY_ID}.json. "
            "Generated by scripts/sync-indico.py (run daily by "
            ".github/workflows/sync-indico.yml). DO NOT EDIT BY HAND — "
            "the next sync will overwrite. `upcoming` holds members' "
            "events; `annualConferences` is a year-keyed map of ESSC "
            "registration pages, each enriched with a `livestreamed` "
            "list (introduction + roundtables + keynotes + conclusion, "
            "derived from the Indico timetable). Consumed by /2026, "
            "/2027 to drive the registration status badge and the "
            "Livestreamed sessions block."
        ),
        "syncedAt": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "source": f"{INDICO_BASE}/export/categ/{ROOT_CATEGORY_ID}.json",
        "lookaheadDays": LOOK_AHEAD_DAYS,
        "upcoming": upcoming,
        "annualConferences": annual_by_year,
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
        f"{len(upcoming)} upcoming members' event(s); "
        f"{len(annual_by_year)} Annual Conference page(s) by year: "
        f"{sorted(annual_by_year.keys())}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
