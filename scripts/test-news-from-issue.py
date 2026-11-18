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

### Website summary

The call for the 2027 conference
is open until 15 January.

### LinkedIn post

📣 The call is open!   

With @NetSec and @cost.



#ESSC2027

### Bluesky post

The call is open, with @NetSec. #ESSC2027

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
    "social": {"linkedin": "📣 The call is open!\n\nWith @NetSec and @cost.\n\n#ESSC2027",
               "bluesky": "The call is open, with @NetSec. #ESSC2027",
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

_No response_

### Image

/assets/img/x.png

### Image description

A test picture.

### Publication date

_No response_

### Collaborator page

No collaborator

### Newsletter

- [ ] Include in the newsletter
"""
item = mod.parse_issue("news: From the title", MINIMAL, TODAY)
assert item == {"date": TODAY, "type": "news", "title": "From the title", "excerpt": "Short.",
                "image": "/assets/img/x.png", "imageAlt": "A test picture.",
                "social": {"text": "Short."}}, item

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

# The Image field: GitHub writes a dragged photo as <img ... src> or ![](...).
UUID = "https://github.com/user-attachments/assets/0b1c2d3e-0000-4000-8000-000000000000"
for text in (f'<img width="1024" height="768" alt="IMG_1234" src="{UUID}" />',
             f"![IMG_1234]({UUID})", UUID, f"  {UUID}  "):
    assert mod.image_source(text) == UUID, text
assert mod.image_source("") == "" and mod.image_source("/assets/images/x.jpg") == "/assets/images/x.jpg"
try:
    mod.image_source("Uploading IMG_1234.jpg…")
    raise AssertionError("an upload still in progress should stop the run")
except SystemExit as e:
    assert "no photo in it" in str(e), e

# A photo needs a description, up to 300 characters, and is fetched later.
with_photo = MINIMAL.replace("/assets/img/x.png", f"![p]({UUID})")
item = mod.parse_issue("news: P", with_photo, TODAY)
assert item["_image_url"] == UUID and item["imageAlt"] == "A test picture." and "image" not in item, item
stops("news: P", with_photo.replace("A test picture.", "_No response_"), "Image description is empty")
stops("news: P", with_photo.replace("A test picture.", "d" * 301), "Image description is 301 characters")
# A description without a photo is dropped.
item = mod.parse_issue("news: P", MINIMAL.replace("/assets/img/x.png", "_No response_"), TODAY)
assert "imageAlt" not in item and "image" not in item, item

# Every other box has its limit or its format, and stops the run with a
# message for the person who filed the form.
stops("x", FORM.replace("https://indico.eiss-europa.com/event/9/", "indico event page"), "The Link is not a web address")
stops("x", FORM.replace("https://indico.eiss-europa.com/event/9/", "https://example.org/a b"), "The Link is not a web address")
stops("x", FORM.replace("2026-11-10", "next week"), 'Publication date "next week"', "2026-11-08")
stops("x", FORM.replace("The call for the 2027 conference\nis open until 15 January.", "_No response_"),
      "Website summary is empty")
stops("x", FORM.replace("The call for the 2027 conference\nis open until 15 January.", "w" * 301),
      "Website summary is 301 characters")
stops("x", FORM.replace("With @NetSec", "With @Nope"), "LinkedIn post tags @Nope", "@COST, @EISS, @NetSec")
stops("x", FORM.replace("with @NetSec. #ESSC2027", "with @Nobody."), "Bluesky post tags @Nobody")
# An email address and a URL are not tags.
item = mod.parse_issue("x", FORM.replace("With @NetSec", "Write to info@eiss-europa.com or https://x.com/@a, with @NetSec"), TODAY)
assert "info@eiss-europa.com" in item["social"]["linkedin"]

# The post limits count the post as the network shows it: the link added at
# the end, and on Bluesky each tag written as the account's handle.
sp = mod._social_post_module()
LINK = "https://indico.eiss-europa.com/event/9/"
room = 300 - len("\n\n" + LINK) - len(" @netsec-cost.eu")
ok = mod.parse_issue("x", FORM.replace("The call is open, with @NetSec. #ESSC2027", "b" * room + " @NetSec"), TODAY)
assert len(sp.tagged(sp.with_link(ok["social"]["bluesky"], LINK), "bluesky", sp.load_accounts())[0]) == 300
stops("x", FORM.replace("The call is open, with @NetSec. #ESSC2027", "b" * (room + 1) + " @NetSec"),
      "Bluesky post is 301 characters long with the link", "at least 1 characters")
# A post that already holds the link is not given it twice.
ok = mod.parse_issue("x", FORM.replace("The call is open, with @NetSec. #ESSC2027", "b" * 250 + " " + LINK), TODAY)
assert ok["social"]["bluesky"].endswith(LINK)
room = 3000 - len("\n\n" + LINK)
mod.parse_issue("x", FORM.replace("📣 The call is open!   \n\nWith @NetSec and @cost.\n\n\n\n#ESSC2027", "l" * room), TODAY)
stops("x", FORM.replace("📣 The call is open!   \n\nWith @NetSec and @cost.\n\n\n\n#ESSC2027", "l" * (room + 1)),
      "LinkedIn post is 3001 characters long with the link", "limit is 3000")
# A post box left empty: the post is built from the headline and summary.
item = mod.parse_issue("x", FORM.replace("The call is open, with @NetSec. #ESSC2027", "_No response_"), TODAY)
assert "bluesky" not in item["social"] and "linkedin" in item["social"]

# The post boxes come as code blocks (`render: text`), so an @tag in the
# issue notifies nobody on GitHub. The fence is dropped, the text kept.
fenced = FORM.replace("The call is open, with @NetSec. #ESSC2027", "```text\nThe call is open, with @NetSec. #ESSC2027\n```")
assert mod.parse_issue("x", fenced, TODAY)["social"]["bluesky"] == "The call is open, with @NetSec. #ESSC2027"
assert mod.post_text("```text\nA\n\n\n\nB\n```") == "A\n\nB"
assert mod.post_text("```\nA\n```") == "A" and mod.post_text("Use ``` here") == "Use ``` here"

# No headline and the form's default title (#2189).
stops("news:", MINIMAL, "Headline is empty")

# The form requires the headline and gives every field a description.
# Stdlib only: each field is a block starting at "  - type:".
form_text = (HERE.parent / ".github" / "ISSUE_TEMPLATE" / "news.yml").read_text()
blocks = re.split(r"^  - type: ", form_text, flags=re.M)[1:]
fields = {re.search(r"^    id: (\S+)", b, re.M).group(1): b for b in blocks if not b.startswith("markdown")}
assert len(fields) == 11, sorted(fields)
for fid, b in fields.items():
    assert re.search(r"^      description: \S", b, re.M), f"{fid} has no description"
assert "required: true" in fields["headline"], "the Headline is not required"
# The post boxes render as code blocks, so an @tag in the issue notifies nobody.
assert "render: text" in fields["linkedin-post"] and "render: text" in fields["bluesky-post"]

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
    (root / "scripts" / "social-post.py").write_text((HERE / "social-post.py").read_text())
    (root / "data").mkdir()
    (root / "data" / "social-accounts.json").write_text((HERE.parent / "data" / "social-accounts.json").read_text())
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
