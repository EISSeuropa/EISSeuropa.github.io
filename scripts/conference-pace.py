#!/usr/bin/env python3
"""Record a conference's pace from an Indico export (#2039).

Staff export the abstracts list or the registrations from Indico's
management pages as CSV. This script keeps one column, the date each item
arrived, turns it into days before the conference, and writes the sorted
list to src/data/conference-pace.json. Names, emails and titles never leave
the CSV. src/_data/dashboard.js reads the file at build and compares this
edition with the previous one at the same number of days out.

    python3 scripts/conference-pace.py --edition 2026 --measure abstracts \\
        --column "Submission date" ~/Downloads/abstracts-2026.csv

Run it once per past edition to seed the history, then again whenever a
fresh count is wanted. Each run replaces that edition's list for that
measure. Without --column the script lists the CSV's headers and stops.

ponytail: manual CSV until the Indico token is wired into the daily sync
(#2039, step 3). The output file stays the same when it is.
"""
import argparse
import csv
import datetime as dt
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "conference-pace.json"
MEASURES = ("abstracts", "registrations")
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


def edition_start(year: str) -> dt.date:
    """The conference's first day, from src/_data/conferences.js."""
    js = f"process.stdout.write(require('./src/_data/conferences.js').byYear['{year}']?.startDate || '')"
    start = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    if not start:
        sys.exit(f"No edition {year} in src/_data/conferences.js.")
    return dt.date.fromisoformat(start)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--edition", required=True, help="conference year, e.g. 2027")
    ap.add_argument("--measure", required=True, choices=MEASURES)
    ap.add_argument("--column", help="the CSV column holding the submission or registration date")
    ap.add_argument("csv", type=Path, help="the export from Indico, kept outside the repository")
    a = ap.parse_args()

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
    data = json.loads(OUT.read_text()) if OUT.exists() else {}
    data.setdefault("_documentation", "Days before each conference on which each abstract or registration arrived, latest first. Written by scripts/conference-pace.py from Indico exports (#2039). No personal data. Read by src/_data/dashboard.js.")
    data.setdefault("measures", {}).setdefault(a.measure, {})[a.edition] = {
        "start": start.isoformat(),
        "recorded": dt.date.today().isoformat(),
        "daysOut": days,
    }
    data["measures"][a.measure] = dict(sorted(data["measures"][a.measure].items()))
    text = json.dumps(data, indent=2)
    # One line per list of days, not one line per day.
    text = re.sub(r"\[\n\s+([-\d,\s]+?)\n\s+\]", lambda m: "[" + " ".join(m.group(1).split()) + "]", text)
    OUT.write_text(text + "\n")
    print(f"Recorded {len(days)} {a.measure} for {a.edition} in {OUT}.")


if __name__ == "__main__":
    main()
