#!/usr/bin/env python3
"""Self-check for scripts/conference-pace.py (#2039).

No framework. Run it directly:

    python3 scripts/test-conference-pace.py
"""
import datetime as dt
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("conference_pace", HERE / "conference-pace.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

# Dates as Indico writes them, and as a spreadsheet rewrites them.
day = dt.date(2026, 1, 15)
for v in ("2026-01-15 10:23:00", "2026-01-15T10:23:00", "2026-01-15T23:30:00+01:00", "2026-01-15",
          "15/01/2026 10:23", "15/01/2026", "15.01.2026"):
    assert mod.parse_day(v) == day, v
try:
    mod.parse_day("January the fifteenth")
    raise AssertionError("an unreadable date must stop the run")
except ValueError:
    pass

# Days before the conference, latest first. A row with no date is skipped.
rows = [{"Submitted": "2026-06-01"}, {"Submitted": ""}, {"Submitted": "2026-01-15 09:00:00"}, {"Submitted": "2026-06-11"}]
assert mod.days_out(rows, "Submitted", dt.date(2026, 6, 11)) == [147, 10, 0]

# End to end: only the days reach the output, never a name or an email.
with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / "abstracts.csv"
    src.write_text("ID,Title,Submitter,Email,Submitted\n"
                   "1,On deterrence,Ada Example,ada@example.org,2026-01-15 10:00:00\n"
                   "2,On alliances,Bo Example,bo@example.org,2026-03-01 08:00:00\n", encoding="utf-8")
    out = Path(tmp) / "pace.json"
    mod.OUT = out
    sys.argv = ["conference-pace.py", "--edition", "2026", "--measure", "abstracts", "--column", "Submitted", str(src)]
    mod.main()
    data = json.loads(out.read_text())
    assert data["measures"]["abstracts"]["2026"]["daysOut"] == [147, 102], data
    assert data["measures"]["abstracts"]["2026"]["start"] == "2026-06-11"
    text = out.read_text()
    assert "Example" not in text and "@" not in text
    assert "[147, 102]" in text, "each list of days sits on one line"

# An export inside the repository is refused before it is read.
inside = subprocess.run([sys.executable, str(HERE / "conference-pace.py"), "--edition", "2026", "--measure", "abstracts",
                         "--column", "Submitted", str(HERE / "conference-pace.py")], capture_output=True, text=True)
assert inside.returncode != 0 and "inside the repository" in inside.stderr, inside.stderr

print("conference-pace: all checks passed")
