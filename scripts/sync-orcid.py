#!/usr/bin/env python3
"""Sync recent publications from members' public ORCID records.

For each board / community member in src/_data/board.json who carries an
ORCID iD (links.orcid), fetch their public works list and write the most
recent few to src/_data/orcidWorks.json. That sidecar powers the
"Recent publications by our members" section on /outputs (issue #718) and,
later, the board-card treatment (#719).

Design notes
------------
- **Public API, no auth.** GET https://pub.orcid.org/v3.0/<iD>/works with
  Accept: application/json returns 200 unauthenticated. ORCID works are
  public records the member chose to publish under their public iD.
- **Fail soft, per member.** A 404 / timeout / parse error on one member
  skips that member and keeps the rest, so one bad record never empties
  the file. On a total failure the existing file is left untouched.
- **Self-contained output.** Each entry carries the member's display name
  and #anchor slug (matching boardSorted.js: person.slug or slugify(name)),
  so the template needs no join back to board.json.
- **Idempotent.** Same inputs → same file (stable ordering, capped works).

Run by the weekly board-sync workflow (a step after sync-board.py) and
on demand: `python3 scripts/sync-orcid.py`.
"""

import json
import re
import sys
import time
import unicodedata
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
BOARD = ROOT / "src" / "_data" / "board.json"
OUT = ROOT / "src" / "_data" / "orcidWorks.json"

ORCID_ID_RE = re.compile(r"(\d{4}-\d{4}-\d{4}-\d{3}[\dX])")
API = "https://pub.orcid.org/v3.0/{}/works"
HEADERS = {"Accept": "application/json", "User-Agent": "eiss-europa.com sync-orcid"}
TIMEOUT = 20
MAX_WORKS = 3  # top N by year per member — keeps the sidecar light


def slugify(name: str) -> str:
    """Stable #anchor slug. Kept in sync with slugify() in boardSorted.js
    and scripts/sync-board.py: lowercase, strip diacritics, non-alphanumeric
    runs to a single hyphen, trim leading/trailing hyphens."""
    n = unicodedata.normalize("NFD", name)
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    n = n.lower()
    n = re.sub(r"[^a-z0-9]+", "-", n)
    return n.strip("-")


def members_with_orcid():
    data = json.loads(BOARD.read_text(encoding="utf-8"))
    people = [*(data.get("members") or []), *(data.get("support") or [])]
    for p in people:
        url = ((p.get("links") or {}).get("orcid")) or p.get("orcid") or ""
        m = ORCID_ID_RE.search(url)
        if not m:
            continue
        yield {
            "name": p.get("name", "").strip(),
            "slug": p.get("slug") or slugify(p.get("name", "")),
            "orcid_id": m.group(1),
        }


def _val(obj, *path):
    """Safe nested getter; returns None if any hop is missing."""
    for key in path:
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj


def parse_works(payload):
    """ORCID /works → [{title, year, journal, doi}], newest first, top N."""
    works = []
    for group in payload.get("group", []) or []:
        summaries = group.get("work-summary") or []
        if not summaries:
            continue
        s = summaries[0]
        title = _val(s, "title", "title", "value")
        if not title:
            continue
        year = _val(s, "publication-date", "year", "value")
        journal = _val(s, "journal-title", "value")
        doi = None
        for eid in (_val(s, "external-ids", "external-id") or []):
            if (eid.get("external-id-type") or "").lower() == "doi":
                v = eid.get("external-id-value")
                if v:
                    doi = v if v.startswith("http") else f"https://doi.org/{v}"
                    break
        works.append(
            {
                "title": title.strip(),
                "year": int(year) if (year or "").isdigit() else None,
                "journal": journal.strip() if journal else None,
                "doi": doi,
            }
        )
    works.sort(key=lambda w: (w["year"] or 0), reverse=True)
    return works[:MAX_WORKS]


def main():
    entries = []
    failures = 0
    for m in members_with_orcid():
        try:
            r = requests.get(API.format(m["orcid_id"]), headers=HEADERS, timeout=TIMEOUT)
            r.raise_for_status()
            works = parse_works(r.json())
        except Exception as exc:  # noqa: BLE001 — fail soft per member
            failures += 1
            print(f"  skip {m['name']} ({m['orcid_id']}): {exc}", file=sys.stderr)
            continue
        if not works:
            print(f"  skip {m['name']} ({m['orcid_id']}): no public works", file=sys.stderr)
            continue
        entries.append(
            {
                "name": m["name"],
                "slug": m["slug"],
                "orcid": f"https://orcid.org/{m['orcid_id']}",
                "works": works,
            }
        )
        time.sleep(0.5)  # be polite to the public API

    if not entries:
        print("No member works fetched; leaving orcidWorks.json untouched.", file=sys.stderr)
        return 0 if failures == 0 else 1

    entries.sort(key=lambda e: e["name"].lower())
    OUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(entries)} members, {failures} skipped.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
