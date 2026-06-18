#!/usr/bin/env python3
"""
Append a news item to src/_data/news.json from a labelled GitHub issue (#634).

The publishing mechanism behind the News surface (#96) + Atom feed (#605):
the maintainer files an issue labelled `news` (from a phone, in two minutes),
a GitHub Action runs this script, and it opens the standard auto-PR. The
issue title becomes the headline; the body becomes the excerpt, with a few
optional `Key: value` lines at the top steering the type / link / date.

Inputs (environment variables, set by .github/workflows/news-publish.yml):
  ISSUE_TITLE   the headline (a leading "news:" prefix is stripped)
  ISSUE_BODY    the post body; see the optional header keys below
  ISSUE_NUMBER  for the log line only
  TODAY         ISO YYYY-MM-DD, the fallback date (the Action passes the
                runner's date so this script never calls a clock — keeps it
                deterministic + testable)

Optional header keys, any case, anywhere in the first lines of the body:
  Type: paper | event | press | podcast   (default: news)
  URL: https://…  or  /internal-page.html  (default: none — text-only item)
  Date: YYYY-MM-DD                          (default: TODAY)

Everything that isn't a recognised header line becomes the excerpt (first
paragraph, collapsed to a single line, capped at EXCERPT_MAX chars).

Usage (local test): ISSUE_TITLE=… ISSUE_BODY=… TODAY=2026-06-20 \
    python3 scripts/news-from-issue.py
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEWS = ROOT / "src" / "_data" / "news.json"

ALLOWED_TYPES = {"paper", "event", "press", "podcast", "news"}
EXCERPT_MAX = 320
HEADER_RE = re.compile(r"^\s*(type|url|date)\s*:\s*(.+?)\s*$", re.IGNORECASE)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_issue(title: str, body: str, today: str) -> dict:
    title = re.sub(r"^\s*news\s*:\s*", "", (title or "").strip(), flags=re.IGNORECASE)
    if not title:
        sys.exit("news-from-issue: empty title after stripping the 'news:' prefix.")

    meta = {"type": "news", "url": "", "date": today}
    excerpt_lines: list[str] = []
    # Header keys are only honoured while they appear at the top, before the
    # first prose line — so a "URL:" mentioned mid-paragraph isn't hijacked.
    in_header = True
    for raw in (body or "").replace("\r\n", "\n").split("\n"):
        m = HEADER_RE.match(raw) if in_header else None
        if m:
            key, val = m.group(1).lower(), m.group(2).strip()
            meta[key] = val
            continue
        if raw.strip():
            in_header = False
            excerpt_lines.append(raw.strip())
        elif excerpt_lines:
            break  # stop at the blank line after the first paragraph

    item: dict = {"date": "", "type": "news", "title": title}

    date = meta["date"].strip()
    item["date"] = date if DATE_RE.match(date) else today

    t = meta["type"].strip().lower()
    item["type"] = t if t in ALLOWED_TYPES else "news"

    url = meta["url"].strip()
    # Accept absolute http(s) links or site-root-relative paths; ignore junk.
    if url and (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        item["url"] = url

    excerpt = " ".join(excerpt_lines).strip()
    if excerpt:
        if len(excerpt) > EXCERPT_MAX:
            excerpt = excerpt[: EXCERPT_MAX - 1].rstrip() + "…"
        item["excerpt"] = excerpt

    # Preserve key order: date, type, title, url?, excerpt?
    ordered = {"date": item["date"], "type": item["type"], "title": item["title"]}
    if item.get("url"):
        ordered["url"] = item["url"]
    if item.get("excerpt"):
        ordered["excerpt"] = item["excerpt"]
    return ordered


def main() -> None:
    title = os.environ.get("ISSUE_TITLE", "")
    body = os.environ.get("ISSUE_BODY", "")
    today = os.environ.get("TODAY", "").strip()
    if not DATE_RE.match(today):
        sys.exit("news-from-issue: TODAY must be set to an ISO date (YYYY-MM-DD).")

    item = parse_issue(title, body, today)

    data = json.loads(NEWS.read_text()) if NEWS.exists() else []
    if not isinstance(data, list):
        sys.exit("news-from-issue: news.json is not a JSON array.")

    # Idempotency guard: skip if an item with the same date + title already
    # exists (a re-run on an edited issue shouldn't duplicate the post).
    for existing in data:
        if existing.get("title") == item["title"] and existing.get("date") == item["date"]:
            print(f"news-from-issue: '{item['title']}' ({item['date']}) already present — no change.")
            return

    data.append(item)
    NEWS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    issue = os.environ.get("ISSUE_NUMBER", "?")
    print(f"news-from-issue: added from #{issue}: [{item['type']}] {item['date']} — {item['title']}")


if __name__ == "__main__":
    main()
