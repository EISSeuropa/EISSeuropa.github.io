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

# From Indico: the bot's views are stood in for by made-up responses, as
# Indico 3.3 shapes them. Only the dates reach the file.
paris = mod.ZoneInfo("Europe/Paris")
# 23:30 UTC on 9 June is 10 June in Paris, one day before an 11 June start.
assert mod.local_days(["2026-06-09T23:30:00+00:00", None, "2026-01-15T10:00:00.123456+00:00"],
                      dt.date(2026, 6, 11), paris) == [147, 1]

today = dt.date.today()
start = today + dt.timedelta(days=200)
responses = {
    "/export/categ/1.json": {"results": [
        {"id": 25, "startDate": {"date": start.isoformat(), "time": "08:00:00", "tz": "Europe/Paris"}}]},
    "/event/25/manage/abstracts/abstracts.json": {"version": 1, "questions": [], "abstracts": [
        {"id": 1, "title": "On deterrence", "submitter": {"email": "ada@example.org"}, "state": "submitted",
         "submitted_dt": f"{today - dt.timedelta(days=3)}T10:00:00+00:00"},
        {"id": 2, "title": "On alliances", "submitter": {"email": "bo@example.org"}, "state": "invited",
         "submitted_dt": f"{today}T10:00:00+00:00"},
        {"id": 3, "title": "On borders", "submitter": {"email": "cy@example.org"}, "state": "accepted",
         "submitted_dt": f"{today - dt.timedelta(days=1)}T10:00:00+00:00"}]},
    "/api/checkin/event/25/forms/": [{"id": 7, "title": "Registration"}],
    "/api/checkin/event/25/forms/7/registrations/": [
        {"id": 1, "full_name": "Ada Example", "email": "ada@example.org", "state": "complete",
         "registration_date": f"{today}T09:00:00+00:00"}],
}
calls = []


def fake_get_json(path, token=None):
    calls.append((path, token))
    return responses[path]


mod.get_json = fake_get_json
mod.editions = lambda: {"2026": dt.date(2026, 6, 11), str(start.year): start}
os_env = mod.os.environ
os_env["INDICO_PACE_TOKEN"] = "made-up"
with tempfile.TemporaryDirectory() as tmp:
    out = Path(tmp) / "pace.json"
    out.write_text(json.dumps({"measures": {"abstracts": {"2026": {"start": "2026-06-11", "recorded": "2026-11-09",
                                                                   "daysOut": [174, 95]}}}}))
    mod.OUT = out
    assert mod.from_indico() == 0
    data = json.loads(out.read_text())
    year = str(start.year)
    assert data["measures"]["abstracts"][year]["daysOut"] == [203, 201], data
    assert data["measures"]["registrations"][year]["daysOut"] == [200], data
    assert data["measures"]["abstracts"][year]["recorded"] == today.isoformat()
    # A past edition outside the window is left as it was.
    assert data["measures"]["abstracts"]["2026"]["daysOut"] == [174, 95]
    text = out.read_text()
    assert "Example" not in text and "@" not in text and "deterrence" not in text
    # The category export goes without the token, the management views with it.
    assert ("/export/categ/1.json", None) in calls
    assert all(t == "made-up" for p, t in calls if p != "/export/categ/1.json")

    # An unchanged list keeps its recorded date and the file is not rewritten.
    data["measures"]["abstracts"][year]["recorded"] = "2000-01-01"
    out.write_text(json.dumps(data))
    before = out.read_text()
    assert mod.from_indico() == 0
    assert out.read_text() == before

    # A view the bot cannot read leaves that list alone and fails the run.
    def denied(path, token=None):
        if "registrations" in path or "forms" in path:
            raise PermissionError("Indico sent a page, not data")
        return responses[path]
    mod.get_json = denied
    assert mod.from_indico() == 1
    assert json.loads(out.read_text())["measures"]["registrations"][year]["daysOut"] == [200]

del os_env["INDICO_PACE_TOKEN"]
print("conference-pace: all checks passed")
