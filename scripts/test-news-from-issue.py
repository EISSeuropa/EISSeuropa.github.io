#!/usr/bin/env python3
"""Self-check for scripts/news-from-issue.py (#634, #2058).

No framework. Run it directly:

    python3 scripts/test-news-from-issue.py
"""
import importlib.util
import json
import os
import re
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

No collaborator

### Newsletter

- [ ] Include in the newsletter
"""
item = mod.parse_issue("news: From the title", MINIMAL, TODAY)
assert item == {"date": TODAY, "type": "news", "title": "From the title", "excerpt": "Short.",
                "image": "/assets/img/x.png", "social": {"text": "Short."}}, item

# A summary over 300 characters stops the run and says by how much (#2189).
def stops(title, body, *needles):
    try:
        mod.parse_issue(title, body, TODAY)
    except SystemExit as e:
        for n in needles:
            assert n in str(e), (n, str(e))
        return
    raise AssertionError("expected the run to stop")

stops("Long", MINIMAL.replace("Short.", "word " * 100), "Summary is 499 characters", "limit is 300", "at least 199")

# Exactly 300 characters passes, whole.
item = mod.parse_issue("Fits", MINIMAL.replace("Short.", "x" * 300), TODAY)
assert len(item["excerpt"]) == 300 and item["social"]["text"] == item["excerpt"]

# A headline over 100 characters stops the run, from the field or the title.
stops("news:", MINIMAL.replace("_No response_\n\n### Summary", "h" * 101 + "\n\n### Summary", 1),
      "Headline is 101 characters", "limit is 100")
stops("news: " + "h" * 101, MINIMAL, "Headline is 101 characters")
item = mod.parse_issue("news: " + "h" * 100, MINIMAL, TODAY)
assert item["title"] == "h" * 100

# No headline and the form's default title (#2189).
stops("news:", MINIMAL, "Headline is empty")

# The form requires the headline and gives every field a description.
# Stdlib only: each field is a block starting at "  - type:".
form_text = (HERE.parent / ".github" / "ISSUE_TEMPLATE" / "news.yml").read_text()
blocks = re.split(r"^  - type: ", form_text, flags=re.M)[1:]
fields = {re.search(r"^    id: (\S+)", b, re.M).group(1): b for b in blocks if not b.startswith("markdown")}
assert len(fields) == 10, sorted(fields)
for fid, b in fields.items():
    assert re.search(r"^      description: \S", b, re.M), f"{fid} has no description"
assert "required: true" in fields["headline"], "the Headline is not required"

# A NetSec item stops the run.
try:
    mod.parse_issue("x", MINIMAL.replace("EISS\n", "NetSec\n", 1), TODAY)
    raise AssertionError("a NetSec item must stop the run")
except SystemExit as e:
    assert str(e).startswith("The Site is NetSec"), str(e)

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

# GitHub hides the whole form from the issue chooser when a dropdown with a
# default lists "None" or "n/a" as an option (#2058 shipped one and the form
# never appeared). The option text is also what the script reads back.
import re
form = (HERE.parent / ".github" / "ISSUE_TEMPLATE" / "news.yml").read_text()
bad = re.findall(r"^\s+-\s*[\"']?(none|n/a)[\"']?\s*$", form, re.M | re.I)
assert not bad, f"news.yml lists a reserved dropdown option: {bad}"

print("test-news-from-issue: all checks passed")
