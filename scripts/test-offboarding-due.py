#!/usr/bin/env python3
"""Self-check for scripts/offboarding-due.py (#2143). No framework, no network.

    python3 scripts/test-offboarding-due.py
"""
import datetime as dt
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("due", Path(__file__).resolve().parent / "offboarding-due.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def person(name, end=None):
    return {"name": name, "role": "Support Staff", **({"roleEndDate": end} if end else {})}

board = {
    "members": [person("Open-ended"), person("Left long ago", "2026-11-01")],
    "support": [
        person("Left last week", "2026-11-09"),   # entered after the departure
        person("Leaves today", "2026-11-16"),
        person("Leaves Sunday", "2026-11-22"),
        person("Leaves in a week", "2026-11-23"),  # next Monday's run
    ],
}
names = [n for n, _, _ in mod.due(board, dt.date(2026, 11, 16))]
assert names == ["Left last week", "Leaves today", "Leaves Sunday"], names
# Two Monday runs in a row together cover every date once or twice, never zero times.
for day in range(2, 31):  # the four runs cover 2 November to 6 December
    end = dt.date(2026, 11, day)
    runs = [r for r in (dt.date(2026, 11, 9), dt.date(2026, 11, 16), dt.date(2026, 11, 23), dt.date(2026, 11, 30))
            if mod.due({"members": [person("x", end.isoformat())], "support": []}, r)]
    assert 1 <= len(runs) <= 2, (end, runs)
print("offboarding-due: checks pass")
