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

Two body shapes are read.

1. The News item issue form (.github/ISSUE_TEMPLATE/news.yml, #2058). GitHub
   renders each field as a `### Label` heading followed by the answer. The
   fields map as follows:
     Site               EISS | Joint (EISS and NetSec) | NetSec. A joint item
                        gets "site": "joint". A NetSec item stops the run: it
                        belongs in the NetSec repository.
     Headline           the title (falls back to the issue title)
     Summary            the excerpt, and social.text (the LinkedIn and
                        Bluesky caption), capped at SUMMARY_MAX characters
     Body               "body", kept whole for the newsletter
     Type / Link / Publication date   as the header keys below
     Image              "image" (http(s) or site-root path)
     Collaborator page  social.collaborator ("netsec")
     Newsletter         "newsletter": true when the box is ticked

2. Free text, the original shape (#634). Optional header keys, any case, in
   the first lines of the body:
     Type: paper | event | press | podcast   (default: news)
     URL: https://…  or  /internal-page.html  (default: none, text-only item)
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
SUMMARY_MAX = 300
FORM_HEADING_RE = re.compile(r"^###\s+(.+?)\s*$")
NO_RESPONSE = "_No response_"
HEADER_RE = re.compile(r"^\s*(type|url|date)\s*:\s*(.+?)\s*$", re.IGNORECASE)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def clean_title(title: str) -> str:
    return re.sub(r"^\s*news\s*:\s*", "", (title or "").strip(), flags=re.IGNORECASE)


def parse_free_text(title: str, body: str, today: str) -> dict:
    title = clean_title(title)
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


def form_sections(body: str) -> dict[str, str]:
    """{lower-cased heading: answer} when the body is an issue form, else {}.
    A form body opens with a `### ` heading. GitHub writes "_No response_"
    for a blank optional field, which reads here as an empty answer."""
    lines = (body or "").replace("\r\n", "\n").split("\n")
    first = next((ln for ln in lines if ln.strip()), "")
    if not FORM_HEADING_RE.match(first):
        return {}
    sections: dict[str, list[str]] = {}
    current = None
    for ln in lines:
        m = FORM_HEADING_RE.match(ln)
        if m:
            current = m.group(1).strip().lower()
            sections[current] = []
        elif current is not None:
            sections[current].append(ln)
    out = {}
    for key, val in sections.items():
        text = "\n".join(val).strip()
        out[key] = "" if text == NO_RESPONSE else text
    return out


def _cap(text: str, limit: int) -> str:
    text = " ".join(text.split())
    if len(text) > limit:
        print(f"news-from-issue: summary is {len(text)} characters, cut to {limit}.")
        text = text[: limit - 1].rstrip() + "…"
    return text


def _link(val: str) -> str:
    val = (val or "").strip()
    return val if val.startswith(("http://", "https://", "/")) else ""


def parse_form(title: str, f: dict[str, str], today: str) -> dict:
    site = f.get("site", "").strip().lower()
    if site.startswith("netsec"):
        sys.exit("news-from-issue: a NetSec item belongs in EISSeuropa/netsec.github.io. "
                 "Nothing was added here.")

    headline = " ".join(f.get("headline", "").split()) or clean_title(title)
    if not headline:
        sys.exit("news-from-issue: no headline and an empty issue title.")

    date = f.get("publication date", "").strip()
    t = f.get("type", "").strip().lower()
    item: dict = {
        "date": date if DATE_RE.match(date) else today,
        "type": t if t in ALLOWED_TYPES else "news",
        "title": headline,
    }
    if site.startswith("joint"):
        item["site"] = "joint"
    url = _link(f.get("link", ""))
    if url:
        item["url"] = url
    summary = _cap(f.get("summary", ""), SUMMARY_MAX)
    if summary:
        item["excerpt"] = summary
    body = f.get("body", "").strip()
    if body:
        item["body"] = body
    image = _link(f.get("image", ""))
    if image:
        item["image"] = image

    social: dict = {}
    if summary:
        social["text"] = summary
    if f.get("collaborator page", "").strip().lower() == "netsec":
        social["collaborator"] = "netsec"
    if social:
        item["social"] = social
    if re.search(r"^\s*-\s*\[[xX]\]", f.get("newsletter", ""), re.M):
        item["newsletter"] = True
    return item


def parse_issue(title: str, body: str, today: str) -> dict:
    form = form_sections(body)
    if form:
        return parse_form(title, form, today)
    return parse_free_text(title, body, today)


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
