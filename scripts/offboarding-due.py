#!/usr/bin/env python3
"""List board.json entries whose roleEndDate fell in the last week (#1869).

Prints one tab-separated line per leaver: name, role, roleEndDate. Read by
.github/workflows/offboarding.yml, which opens an "Offboarding: <name>"
issue for each (inviting them to the EISS Alumni LinkedIn group, #1861).

Usage: offboarding-due.py [YYYY-MM-DD]   (default: today, UTC)
"""
import datetime as dt
import json
import sys
from pathlib import Path

today = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.datetime.now(dt.timezone.utc).date()
board = json.loads((Path(__file__).resolve().parent.parent / "src/_data/board.json").read_text())
for person in board["members"] + board["support"]:
    end = person.get("roleEndDate")
    # The weekly run covers the seven days before it, so each date is seen once.
    if end and today - dt.timedelta(days=7) <= dt.date.fromisoformat(end) < today:
        print(f"{person['name']}\t{person['role']}\t{end}")
