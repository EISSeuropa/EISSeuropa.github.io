#!/usr/bin/env python3
"""Record a conference's pace from Indico (#2039, #2101).

For each abstract or registration, the script keeps the date it arrived,
turns it into days before the conference, and writes the sorted list to
src/data/conference-pace.json. Names, emails and titles are dropped.
src/_data/dashboard.js reads the file at build and compares this edition
with the previous one at the same number of days out.

Two sources:

    python3 scripts/conference-pace.py --from-indico

reads Indico with the bot's token (INDICO_PACE_TOKEN) for every edition in
src/_data/conferences.js whose conference starts within the next year or
began less than a month ago. The daily "Sync conference pace" workflow runs
it. A list is rewritten, with today as its recorded date, only when it
changed.

    python3 scripts/conference-pace.py --edition 2026 --measure abstracts \\
        --column "Submission date" ~/Downloads/abstracts-2026.csv

reads a CSV exported from Indico's management pages, for an edition the
token cannot reach. Without --column it lists the CSV's headers and stops.
Each run replaces that edition's list for that measure.
"""
import argparse
import csv
import datetime as dt
import json
import re
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "conference-pace.json"
MEASURES = ("abstracts", "registrations")
INDICO = "https://indico.eiss-europa.com"
CATEGORY = 1  # Annual Conferences
# Editions read from Indico: conferences starting in the next year, or that
# began less than this many days ago (late registrations).
AFTER_START = 30
DOC = ("Days before each conference on which each abstract or registration arrived, latest first. "
       "Written by scripts/conference-pace.py from Indico (#2039, #2101). No personal data. "
       "Read by src/_data/dashboard.js.")
# Indico writes ISO dates in its CSV exports. The day-first forms cover a
# file that has been through a spreadsheet on the way.
FORMATS = ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d",
           "%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%d/%m/%Y", "%d.%m.%Y %H:%M", "%d.%m.%Y")


def parse_day(value: str) -> dt.date:
    v = value.strip()
    # An ISO timestamp with a zone ("2026-01-15T10:23:00+01:00") keeps its own day.
    try:
        return dt.datetime.fromisoformat(v).date()
    except ValueError:
        pass
    for f in FORMATS:
        try:
            return dt.datetime.strptime(v, f).date()
        except ValueError:
            continue
    raise ValueError(f"unreadable date {value!r}")


def days_out(rows, column: str, start: dt.date) -> list[int]:
    """Days before `start` for each row with a date, latest first. A row
    without a date (a withdrawn abstract, say) is skipped."""
    days = [(start - parse_day(r[column])).days for r in rows if (r.get(column) or "").strip()]
    return sorted(days, reverse=True)


def editions() -> dict[str, dt.date]:
    """Each edition's first day, by year, from src/_data/conferences.js."""
    js = ("const c = require('./src/_data/conferences.js').byYear;"
          "process.stdout.write(JSON.stringify(Object.fromEntries("
          "Object.entries(c).filter(([, e]) => e.startDate).map(([y, e]) => [y, e.startDate]))))")
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return {y: dt.date.fromisoformat(d) for y, d in json.loads(out).items()}


def edition_start(year: str) -> dt.date:
    """The conference's first day, from src/_data/conferences.js."""
    start = editions().get(year)
    if not start:
        sys.exit(f"No edition {year} in src/_data/conferences.js.")
    return start


def load() -> dict:
    data = json.loads(OUT.read_text()) if OUT.exists() else {}
    data["_documentation"] = DOC
    data.setdefault("measures", {})
    return data


def record(data: dict, measure: str, edition: str, start: dt.date, days: list[int], always: bool = True) -> bool:
    """Put one edition's list in `data`. With always=False an unchanged list
    keeps its recorded date, so a quiet day writes nothing."""
    by_edition = data["measures"].setdefault(measure, {})
    old = by_edition.get(edition)
    if not always and old and old.get("daysOut") == days and old.get("start") == start.isoformat():
        return False
    by_edition[edition] = {"start": start.isoformat(), "recorded": dt.date.today().isoformat(), "daysOut": days}
    data["measures"][measure] = dict(sorted(by_edition.items()))
    return True


def save(data: dict) -> None:
    data["measures"] = {m: data["measures"][m] for m in sorted(data["measures"], reverse=True)}
    text = json.dumps(data, indent=2)
    # One line per list of days, not one line per day.
    text = re.sub(r"\[\n\s+([-\d,\s]+?)\n\s+\]", lambda m: "[" + " ".join(m.group(1).split()) + "]", text)
    OUT.write_text(text + "\n")


# --- Indico ---------------------------------------------------------------
# The bot reads two management views with a read-only token (scope
# read:everything, GET only). Both need a permission on each edition's event:
#   - Abstracts: GET /event/<id>/manage/abstracts/abstracts.json returns every
#     abstract with its submitted_dt.
#   - Registration (check-in only): GET /api/checkin/event/<id>/forms/ and
#     .../forms/<form>/registrations/ return every registration with its
#     registration_date.
# Both responses hold names and emails. Only the dates are kept, and nothing
# from a response is printed.

def get_json(path: str, token: str | None = None):
    headers = {"Accept": "application/json", "User-Agent": "eiss-site-conference-pace"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(INDICO + path, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as r:
        # Without the permission, Indico answers a management URL with its
        # login page rather than an error.
        if "json" not in r.headers.get("Content-Type", ""):
            raise PermissionError("Indico sent a page, not data: the bot lacks the permission on this event")
        return json.load(r)


def local_days(stamps, start: dt.date, tz: ZoneInfo) -> list[int]:
    """Days before `start` for each ISO timestamp, in the event's time zone, latest first."""
    days = [(start - dt.datetime.fromisoformat(s).astimezone(tz).date()).days for s in stamps if s]
    return sorted(days, reverse=True)


def fetch_abstracts(event_id, token: str) -> list[str]:
    abstracts = get_json(f"/event/{event_id}/manage/abstracts/abstracts.json", token)["abstracts"]
    # An invited abstract has not been submitted yet.
    return [a.get("submitted_dt") for a in abstracts if a.get("state") != "invited"]


def fetch_registrations(event_id, token: str) -> list[str]:
    stamps = []
    for form in get_json(f"/api/checkin/event/{event_id}/forms/", token):
        regs = get_json(f"/api/checkin/event/{event_id}/forms/{form['id']}/registrations/", token)
        stamps += [r.get("registration_date") for r in regs]
    return stamps


FETCH = {"abstracts": fetch_abstracts, "registrations": fetch_registrations}


def from_indico() -> int:
    token = os.environ.get("INDICO_PACE_TOKEN")
    if not token:
        sys.exit("INDICO_PACE_TOKEN is not set (docs/conference-pace.md).")
    today = dt.date.today()
    wanted = {y: d for y, d in editions().items()
              if today - dt.timedelta(days=AFTER_START) <= d <= today + dt.timedelta(days=366)}
    # The category export is public, and the legacy API refuses a bearer token.
    events = get_json(f"/export/categ/{CATEGORY}.json")["results"]
    by_start = {e["startDate"]["date"]: e for e in events}
    data, changed, failed = load(), [], []
    for year, start in sorted(wanted.items()):
        event = by_start.get(start.isoformat())
        if not event:
            print(f"::warning::No Indico event in category {CATEGORY} starts on {start} (edition {year}).")
            failed.append(f"{year}: no Indico event")
            continue
        tz = ZoneInfo(event["startDate"].get("tz") or "Europe/Paris")
        for measure in MEASURES:
            try:
                days = local_days(FETCH[measure](event["id"], token), start, tz)
            except (urllib.error.URLError, PermissionError, KeyError, TypeError, ValueError) as e:
                # The message names the URL and the status, never a response body.
                print(f"::warning::{measure} for {year} (event {event['id']}): {e}")
                failed.append(f"{year} {measure}: {e}")
                continue
            if record(data, measure, year, start, days, always=False):
                changed.append(f"{year} {measure}: {len(days)}")
            print(f"{year} {measure}: {len(days)} from event {event['id']}")
    if changed:
        save(data)
        print("Updated " + ", ".join(changed) + f" in {OUT}.")
    else:
        print("No change.")
    return 1 if failed else 0


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--from-indico", action="store_true", help="read every current edition from Indico")
    ap.add_argument("--edition", help="conference year, e.g. 2027")
    ap.add_argument("--measure", choices=MEASURES)
    ap.add_argument("--column", help="the CSV column holding the submission or registration date")
    ap.add_argument("csv", type=Path, nargs="?", help="the export from Indico, kept outside the repository")
    a = ap.parse_args()
    if a.from_indico:
        sys.exit(from_indico())
    if not (a.edition and a.measure and a.csv):
        ap.error("give --from-indico, or --edition, --measure and a CSV file")

    src = a.csv.expanduser().resolve()
    # The export holds names and emails, and this repository is public.
    if src.is_relative_to(ROOT):
        sys.exit(f"{src} is inside the repository. Keep Indico exports outside it, e.g. in ~/Downloads.")
    with src.open(newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.DictReader(fh))
    headers = list(rows[0].keys()) if rows else []
    if not a.column or a.column not in headers:
        sys.exit(("Unknown column. " if a.column else "") + "Columns in this file: " + ", ".join(headers))

    start = edition_start(a.edition)
    days = days_out(rows, a.column, start)
    data = load()
    record(data, a.measure, a.edition, start, days)
    save(data)
    print(f"Recorded {len(days)} {a.measure} for {a.edition} in {OUT}.")


if __name__ == "__main__":
    main()
