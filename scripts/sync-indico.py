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


# Description (abstract) length cap. Indico abstracts can run several
# thousand characters; the grid only needs a teaser. The full text is
# always one click away via the linked Indico session/contribution page.
ABSTRACT_TEASER_CHARS = 360


def _strip_html(s: str) -> str:
    """Crude HTML → text. Indico's description fields contain inline
    formatting (<p>, <em>, <a>) which we don't want to display verbatim
    in the grid; we keep the text content and let the template render
    it as a plain paragraph."""
    import re
    if not s:
        return ""
    no_tags = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", no_tags).strip()


def _normalise_person(p: dict) -> dict:
    """Strip Indico-internal fields from a person dict (presenter,
    convener, author). Notably drops `emailHash`, which is a tracking
    surface we don't need on the site."""
    return {
        "name": p.get("name") or p.get("fullName") or "",
        "affiliation": p.get("affiliation") or "",
    }


def _absolutize_indico_url(url: str) -> str:
    """Indico's timetable export is inconsistent: session URLs come
    back absolute (https://…), contribution URLs come back relative
    (/event/22/contributions/521/). Browsers resolve the latter against
    the EISS site domain, so the "Read full abstract" links 404. Fix
    by prepending INDICO_BASE whenever we see a relative path."""
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return f"{INDICO_BASE}{url}" if url.startswith("/") else f"{INDICO_BASE}/{url}"


def _normalise_contribution(c: dict) -> dict:
    """Turn an Indico contribution (a single paper / talk) into a
    compact dict for the grid. Authors include both `presenters` (who
    actually talks) and `primaryauthors` if no presenters are listed."""
    start = c.get("startDate") or {}
    end = c.get("endDate") or {}
    speakers_src = c.get("presenters") or c.get("speakers") or c.get("primaryauthors") or []
    abstract = _strip_html(c.get("description") or "")
    teaser = abstract[:ABSTRACT_TEASER_CHARS]
    if len(abstract) > ABSTRACT_TEASER_CHARS:
        # Trim back to the previous word boundary so we don't slice
        # mid-word, then append an ellipsis.
        cut = teaser.rsplit(" ", 1)[0]
        teaser = cut + "…"
    return {
        "title": c.get("title") or "(untitled contribution)",
        "startTime": (start.get("time") or "")[:5],
        "endTime": (end.get("time") or "")[:5],
        "speakers": [_normalise_person(p) for p in speakers_src],
        "abstract": teaser,
        "hasFullAbstract": len(abstract) > len(teaser),
        "url": _absolutize_indico_url(c.get("url") or ""),
    }


# Slot types we deliberately surface in the programme grid.
PROGRAMME_SLOT_ENTRY_TYPES = {"Session", "Contribution", "Break"}


def _looks_like_break(title: str) -> bool:
    """Indico inconsistently marks coffee breaks: morning registration
    coffee comes through as entryType=Break, but mid-day coffee breaks
    are entryType=Session with no inner contributions. Recognise the
    latter by title so the grid renders them in the quiet "break"
    style rather than as full session cards."""
    t = (title or "").strip().lower()
    return t.startswith("coffee") or t.startswith("tea break") or t == "lunch"


def _room_identity(room: str) -> str:
    """Collapse a room string to its most specific segment for
    cross-format identity. Indico operators sometimes enter
    `D House, Lecture Hall 8` and sometimes just `Lecture Hall 8`;
    both should bucket to the same room for colour-coding purposes
    (the operator can fix the textual inconsistency on Indico without
    the grid flipping colours).

    Strategy: lowercase + take the last comma-separated segment.
    `"D House, Lecture Hall 8"` → `"lecture hall 8"`.
    `"Lecture Hall 8"`           → `"lecture hall 8"`.
    `"D House, Lecture Hall 9"`  → `"lecture hall 9"`."""
    if not room:
        return ""
    return room.rsplit(",", 1)[-1].strip().lower()


def extract_programme(timetable_results: dict, event_id: str) -> dict:
    """Turn the full Indico timetable into a normalised programme
    structure: days → slots → (per-session) contributions.

    Stored under indico.annualConferences[year].programme and consumed
    by src/_includes/programme-grid.njk to render the live, browsable
    programme. PII surface is bounded: we keep names + affiliations
    (already public on Indico) and drop email hashes / internal ids.

    Top-level shape:
      { "days": [
          { "date": "2026-06-11", "label": "Day 1",
            "slots": [ ...slot dicts in chronological order... ] },
          ...
      ] }

    A slot is one of:
      - kind="session"     — chaired panel / roundtable / keynote
        with conveners[] and contributions[]
      - kind="contribution"— a standalone contribution at the top level
      - kind="break"       — coffee/lunch/reception
    """
    days: list[dict] = []
    event_block = timetable_results.get(str(event_id), {})

    for idx, day_key in enumerate(sorted(event_block.keys()), start=1):
        day_block = event_block[day_key]
        if not isinstance(day_block, dict):
            continue
        date_str = f"{day_key[:4]}-{day_key[4:6]}-{day_key[6:8]}"
        slots: list[dict] = []

        for slot_id, slot in day_block.items():
            if not isinstance(slot, dict):
                continue
            entry_type = slot.get("entryType")
            if entry_type not in PROGRAMME_SLOT_ENTRY_TYPES:
                continue

            start = slot.get("startDate") or {}
            end = slot.get("endDate") or {}
            raw_slot_title = slot.get("title") or slot.get("slotTitle") or ""
            display_title = raw_slot_title
            # Strip the "Roundtable:" prefix from the displayed title —
            # the subtype field below conveys the type so the prefix is
            # redundant noise on the card.
            for prefix in TITLE_PREFIX_FALLBACKS:
                if display_title.startswith(prefix):
                    display_title = display_title[len(prefix):].strip()
                    break
            slot_room = slot.get("room") or ""
            base = {
                "id": str(slot.get("id", slot_id)),
                "title": display_title,
                "startTime": (start.get("time") or "")[:5],
                "endTime": (end.get("time") or "")[:5],
                "room": slot_room,
                # roomColorIndex is assigned in a post-pass below, once
                # all slots have been collected and room frequencies
                # can be counted. Most-used room gets index 0 (the
                # primary accent colour); ties broken alphabetically.
                "url": _absolutize_indico_url(slot.get("url") or ""),
            }

            if entry_type == "Session":
                # Inner `entries` carries the contributions making up
                # the session (5-paper panels, single-talk plenaries, …).
                inner_entries = slot.get("entries") or {}

                # Indico models some coffee breaks as Session entries
                # with no contributions. Reclassify them as breaks so
                # the grid renders them in the quiet style instead of
                # mistaking them for a 0-paper panel.
                if not inner_entries and _looks_like_break(raw_slot_title):
                    slots.append({**base, "kind": "break"})
                    continue

                contribs = [
                    _normalise_contribution(c)
                    for c in inner_entries.values()
                    if isinstance(c, dict) and c.get("entryType") == "Contribution"
                ]
                # Sort contributions chronologically for readability.
                contribs.sort(key=lambda c: c["startTime"])

                # Classify subtype from sessionCode + title-prefix.
                # Drives the template's decision to hide the
                # "View papers" expander on roundtables (which carry a
                # single placeholder "Contributors" entry, not real
                # papers) and on plenaries (typically zero/one talk).
                code = (slot.get("sessionCode") or "").strip()
                subtype: str | None = None
                if code == "RT" or raw_slot_title.startswith("Roundtable:"):
                    subtype = "roundtable"
                elif code in {"INTRO", "KEY", "CONC"}:
                    subtype = "plenary"

                # For roundtables, flatten the single "Contributors"
                # placeholder into a top-level discussants list. That's
                # the actually-useful info on the card; the placeholder
                # itself doesn't add anything.
                discussants: list[dict] = []
                if subtype == "roundtable" and len(contribs) == 1:
                    discussants = contribs[0]["speakers"]
                    contribs = []  # suppress the expander entirely

                slots.append({
                    **base,
                    "kind": "session",
                    "subtype": subtype,
                    "slotTitle": slot.get("slotTitle") or "",
                    "sessionCode": code,
                    "conveners": [_normalise_person(c) for c in slot.get("conveners") or []],
                    "discussants": discussants,
                    "contributions": contribs,
                })
            elif entry_type == "Contribution":
                speakers_src = slot.get("presenters") or slot.get("speakers") or []
                slots.append({
                    **base,
                    "kind": "contribution",
                    "speakers": [_normalise_person(p) for p in speakers_src],
                    "abstract": _strip_html(slot.get("description") or "")[:ABSTRACT_TEASER_CHARS],
                })
            else:  # Break
                slots.append({**base, "kind": "break"})

        slots.sort(key=lambda s: s["startTime"])

        # Group consecutive slots that share a startTime into "rows".
        # Two panels happening in parallel (same start) get rendered
        # side-by-side in the grid; solo slots get a full-width row.
        # Breaks always sit on their own row regardless of timing.
        rows: list[dict] = []
        i = 0
        while i < len(slots):
            current = slots[i]
            if current["kind"] == "break":
                rows.append({
                    "startTime": current["startTime"],
                    "endTime": current["endTime"],
                    "parallel": False,
                    "items": [current],
                })
                i += 1
                continue
            # Greedy-collect every following non-break slot with the
            # same startTime into a parallel row.
            group = [current]
            j = i + 1
            while j < len(slots) and slots[j]["kind"] != "break" \
                    and slots[j]["startTime"] == current["startTime"]:
                group.append(slots[j])
                j += 1
            # End-time of the row is the latest among grouped items —
            # parallel panels often end at the same minute but be safe.
            row_end = max(s["endTime"] for s in group)
            rows.append({
                "startTime": current["startTime"],
                "endTime": row_end,
                "parallel": len(group) > 1,
                "items": group,
            })
            i = j

        days.append({
            "date": date_str,
            "label": f"Day {idx}",
            # `rows` is the new structure templates iterate over.
            # `slots` is kept for backwards compatibility / debugging
            # — same data, ungrouped.
            "rows": rows,
            "slots": slots,
        })

    # Colour-index post-pass. Count how often each distinct room is
    # used across the whole programme, then assign indices in
    # frequency-descending order (alphabetical tie-break for
    # determinism). The most-used room gets index 0 — the primary
    # accent colour. This way the "main panel hall" anchors visually
    # regardless of which room happens to appear earliest in time.
    from collections import Counter
    counts: Counter = Counter()
    for d in days:
        for row in d["rows"]:
            for s in row["items"]:
                key = _room_identity(s.get("room") or "")
                if key:
                    counts[key] += 1
    room_order = sorted(counts.keys(), key=lambda k: (-counts[k], k))
    index_map = {k: i for i, k in enumerate(room_order)}

    for d in days:
        for row in d["rows"]:
            for s in row["items"]:
                key = _room_identity(s.get("room") or "")
                s["roomColorIndex"] = index_map.get(key) if key else None
            # Re-sort parallel rows now that indices are set: items
            # with the lower colour index (= more-frequent room) land
            # in the left column. The most-used room therefore always
            # appears in the leftmost column across all parallel rows.
            if row.get("parallel"):
                row["items"].sort(key=lambda s: (
                    s.get("roomColorIndex") if s.get("roomColorIndex") is not None else 9999,
                    s.get("room") or "",
                    s.get("title") or "",
                ))
        # Keep `slots` (debug surface) in sync with rebuilt rows.
        d["slots"] = [s for row in d["rows"] for s in row["items"]]

    return {"days": days}


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
        # Full normalised programme — drives the live programme grid
        # on /YYYY pages. Same timetable, different shape: every slot,
        # not just livestreamed ones.
        event["programme"] = extract_programme(tt, event["id"])
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
        # `utcnow()` is deprecated in Python 3.12 — prefer a timezone-
        # aware UTC datetime. Render as the same compact "Z"-suffixed
        # ISO-8601 string the previous version emitted, so consumers
        # comparing strings lexicographically still work.
        "syncedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
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
