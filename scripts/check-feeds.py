#!/usr/bin/env python3
"""
Atom feed validator for the built site (#1256).

`grep` proving a file contains "<feed>" is not validation. This parses every
feed under _site/ and asserts what RFC 4287 actually requires, plus the two
rules #1256 added on top:

  - <updated> must never be the build time, or the scheduled rebuild notifies
    every subscriber on a timer. Checked by asserting the feed's <updated>
    equals its newest entry's.
  - Entries are capped, so a feed is not re-sending the whole corpus on every
    fetch.

Run after a build:
    python3 scripts/check-feeds.py           # exit 0 clean, 1 on any failure
"""
from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "_site"
ATOM = "{http://www.w3.org/2005/Atom}"
MAX_ENTRIES = 50
# RFC 3339, which Atom date constructs require. A bare "2026-06-11" is the
# common mistake and feed readers reject it. Fractional seconds are permitted
# by the grammar (time-secfrac) and the news feed emits them, so they are
# allowed here rather than flagged.
RFC3339 = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$")

if not SITE.is_dir():
    print(f"error: {SITE} not found — run the build first.", file=sys.stderr)
    sys.exit(2)

feeds = sorted(SITE.rglob("*.xml"))
feeds = [f for f in feeds if f.name != "sitemap.xml"]
if not feeds:
    print("error: no feeds found under _site/", file=sys.stderr)
    sys.exit(2)

failures: list[str] = []
checked = 0


def fail(path: Path, msg: str) -> None:
    failures.append(f"{path.relative_to(SITE)}: {msg}")


for path in feeds:
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        fail(path, f"not well-formed XML ({exc})")
        continue
    if root.tag != f"{ATOM}feed":
        continue  # not an Atom feed (e.g. an RSS file); nothing to assert here
    checked += 1

    # Feed-level required elements.
    for req in ("id", "title", "updated"):
        if root.find(f"{ATOM}{req}") is None:
            fail(path, f"feed is missing required <{req}>")

    fu = root.find(f"{ATOM}updated")
    if fu is not None and not RFC3339.match((fu.text or "").strip()):
        fail(path, f"feed <updated> is not RFC 3339: {fu.text!r}")

    # A self link is required in practice for a feed served at a URL.
    if not [l for l in root.findall(f"{ATOM}link") if l.get("rel") == "self"]:
        fail(path, "feed has no rel=self link")

    entries = root.findall(f"{ATOM}entry")
    if len(entries) > MAX_ENTRIES:
        fail(path, f"{len(entries)} entries exceeds the {MAX_ENTRIES} cap")

    seen_ids: set[str] = set()
    entry_dates: list[str] = []
    for e in entries:
        for req in ("id", "title", "updated"):
            if e.find(f"{ATOM}{req}") is None:
                fail(path, f"entry is missing required <{req}>")
        eid = (e.findtext(f"{ATOM}id") or "").strip()
        if not eid:
            fail(path, "entry has an empty <id>")
        elif eid in seen_ids:
            fail(path, f"duplicate entry id: {eid}")
        else:
            seen_ids.add(eid)
        eu = (e.findtext(f"{ATOM}updated") or "").strip()
        if not RFC3339.match(eu):
            fail(path, f"entry <updated> is not RFC 3339: {eu!r}")
        else:
            entry_dates.append(eu)

    # The rule that matters most here: a feed's date is its content's date, so
    # a rebuild cannot masquerade as new material.
    if entry_dates and fu is not None:
        newest = max(entry_dates)
        if (fu.text or "").strip() != newest:
            fail(path, f"feed <updated> {fu.text!r} is not the newest entry date {newest!r}")

    # Entries newest-first, which is what a reader shows without re-sorting.
    if entry_dates != sorted(entry_dates, reverse=True):
        fail(path, "entries are not ordered newest-first")

# Each Atlas theme page must advertise ITS OWN theme's feed. This shipped wrong
# once: base.njk used a Jinja2-style `selectattr`, which Nunjucks does not
# implement, so the chain never narrowed and `| first` handed every theme page
# the same feed while its visible link stayed correct. Cheap to assert,
# invisible to the eye, and the two URLs are built in different files.
#
# The theme pages exist per locale since #1495, and the locale suffix is
# stripped before matching. A theme feed is deliberately NOT translated: its
# entries are paper titles and links, which are the source language wherever
# you subscribe, so thirty-four near-identical feeds would buy a translated
# <title> and nothing else. What the check still guarantees is the thing that
# broke: deterrence.fr.html advertises the deterrence feed, not intelligence's.
ALT_RE = re.compile(
    r'<link rel="alternate" type="application/atom\+xml" title="EISS Anthology[^"]*" href="([^"]+)"'
)
theme_pages = sorted((SITE / "anthology-atlas" / "theme").glob("*.html"))
for page in theme_pages:
    m = ALT_RE.search(page.read_text(encoding="utf-8"))
    if not m:
        failures.append(f"{page.relative_to(SITE)}: no Anthology feed <link rel=alternate>")
        continue
    # deterrence.fr -> deterrence, deterrence -> deterrence
    slug = re.sub(r"\.(fr|de)$", "", page.stem)
    want = f"/feeds/themes/{slug}.xml"
    if not m.group(1).endswith(want):
        failures.append(
            f"{page.relative_to(SITE)}: advertises {m.group(1)}, expected a link ending {want}"
        )

if failures:
    print(f"✗ feed check failed ({len(failures)} problem(s)):", file=sys.stderr)
    for f in failures[:20]:
        print("  " + f, file=sys.stderr)
    if len(failures) > 20:
        print(f"  … and {len(failures) - 20} more", file=sys.stderr)
    sys.exit(1)

print(f"✓ feed check passed ({checked} Atom feeds: required elements, RFC 3339 dates, unique ids, capped, newest-first, content-derived <updated>).")
