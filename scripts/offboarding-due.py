#!/usr/bin/env python3
"""List board.json entries whose roleEndDate falls within a week of today (#1869).

Prints one tab-separated line per leaver: name, role, roleEndDate. Read by
.github/workflows/offboarding.yml, which opens an "Offboarding: <name>"
issue for each (inviting them to the EISS Alumni LinkedIn group, #1861).

The window runs from seven days before today to seven days after. The forward
week lines the issue up with the leaver checklist email, which the lifecycle
script in workspace-ops sends seven days before the end date, while the person
still has their account. The backward week catches an end date entered by hand
after the departure. The weekly run sees most dates twice, and the workflow
skips a title it has already filed (#2143).

Usage: offboarding-due.py [YYYY-MM-DD]   (default: today, UTC)
"""
import datetime as dt
import json
import sys
from pathlib import Path

WEEK = dt.timedelta(days=7)


def due(board: dict, today: dt.date) -> list[tuple[str, str, str]]:
    return [
        (p["name"], p["role"], p["roleEndDate"])
        for p in board["members"] + board["support"]
        if p.get("roleEndDate") and today - WEEK <= dt.date.fromisoformat(p["roleEndDate"]) < today + WEEK
    ]


if __name__ == "__main__":
    today = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.datetime.now(dt.timezone.utc).date()
    board = json.loads((Path(__file__).resolve().parent.parent / "src/_data/board.json").read_text())
    for row in due(board, today):
        print("\t".join(row))
