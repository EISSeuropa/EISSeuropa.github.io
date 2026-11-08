#!/usr/bin/env python3
"""Self-check for scripts/news-from-issue.py (#634, #2058).

No framework. Run it directly:

    python3 scripts/test-news-from-issue.py
"""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("news_from_issue", HERE / "news-from-issue.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

TODAY = "2026-11-08"

# The free-text shape keeps working: header lines, then the excerpt.
item = mod.parse_issue("news: Call for papers", "Type: event\nURL: /2027.html\nDate: 2026-12-01\n\nFirst paragraph.\n\nSecond.", TODAY)
assert item == {"date": "2026-12-01", "type": "event", "title": "Call for papers",
                "url": "/2027.html", "excerpt": "First paragraph."}, item

# Free text with no headers falls back to today and type news.
item = mod.parse_issue("Plain", "Just text.", TODAY)
assert item == {"date": TODAY, "type": "news", "title": "Plain", "excerpt": "Just text."}, item

# The issue form, as GitHub renders it.
FORM = """### Site

Joint (EISS and NetSec)

### Headline

ESSC 2027 call opens

### Summary

The call for the 2027 conference
is open until 15 January.

### Body

Longer text for the newsletter.

Second paragraph.

### Type

event

### Link

https://indico.eiss-europa.com/event/9/

### Image

_No response_

### Publication date

2026-11-10

### Collaborator page

NetSec

### Newsletter

- [X] Include in the newsletter
"""
item = mod.parse_issue("news: ignored when a headline is given", FORM, TODAY)
assert item == {
    "date": "2026-11-10",
    "type": "event",
    "title": "ESSC 2027 call opens",
    "site": "joint",
    "url": "https://indico.eiss-europa.com/event/9/",
    "excerpt": "The call for the 2027 conference is open until 15 January.",
    "body": "Longer text for the newsletter.\n\nSecond paragraph.",
    "social": {"text": "The call for the 2027 conference is open until 15 January.",
               "collaborator": "netsec"},
    "newsletter": True,
}, item

# Blank optional fields: the issue title is the headline, today is the date,
# no collaborator, no newsletter flag, no site key for an EISS item.
MINIMAL = """### Site

EISS

### Headline

_No response_

### Summary

Short.

### Body

_No response_

### Type

_No response_

### Link

not a link

### Image

/assets/img/x.png

### Publication date

next week

### Collaborator page

None

### Newsletter

- [ ] Include in the newsletter
"""
item = mod.parse_issue("news: From the title", MINIMAL, TODAY)
assert item == {"date": TODAY, "type": "news", "title": "From the title", "excerpt": "Short.",
                "image": "/assets/img/x.png", "social": {"text": "Short."}}, item

# A long summary is cut to 300 characters.
long_form = MINIMAL.replace("Short.", "word " * 100)
item = mod.parse_issue("Long", long_form, TODAY)
assert len(item["excerpt"]) == 300 and item["excerpt"].endswith("…"), len(item["excerpt"])
assert item["social"]["text"] == item["excerpt"]

# A NetSec item stops the run.
try:
    mod.parse_issue("x", MINIMAL.replace("EISS\n", "NetSec\n", 1), TODAY)
    raise AssertionError("a NetSec item must stop the run")
except SystemExit as e:
    assert "netsec.github.io" in str(e)

# End to end on a copy of the repo layout: appends once, then is idempotent.
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    (root / "scripts").mkdir()
    (root / "src" / "_data").mkdir(parents=True)
    (root / "scripts" / "news-from-issue.py").write_text((HERE / "news-from-issue.py").read_text())
    news = root / "src" / "_data" / "news.json"
    news.write_text("[]\n")
    env = {**os.environ, "ISSUE_TITLE": "news: x", "ISSUE_BODY": FORM, "ISSUE_NUMBER": "1", "TODAY": TODAY}
    for _ in range(2):
        subprocess.run([sys.executable, str(root / "scripts" / "news-from-issue.py")], env=env, check=True,
                       capture_output=True)
    data = json.loads(news.read_text())
    assert len(data) == 1 and data[0]["newsletter"] is True, data

print("test-news-from-issue: all checks passed")
