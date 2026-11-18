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
     Headline           the title, up to HEADLINE_MAX characters (falls back
                        to the issue title, for issues filed before the
                        form required it)
     Website summary    the excerpt on the site, one line, up to SUMMARY_MAX
                        characters ("Summary" on issues filed before it was
                        split). Also the post text when a post box is blank
     LinkedIn post      social.linkedin, verbatim with its line breaks, up
                        to LINKEDIN_LIMIT characters with the link and tags
                        as LinkedIn shows them
     Bluesky post       social.bluesky, the same, up to BLUESKY_LIMIT
                        characters with the link and the tags as handles
                        (@Key tags come from data/social-accounts.json)

   Every text box has a limit, and a box over it, an unknown @tag, a Link
   that is not an address or a date not written YYYY-MM-DD stops the run.
   The message is written for the person who filed the form: the workflow
   posts it on the issue.
     Body               "body", kept whole for the newsletter (off the form
                        for now, still read for older issues)
     Type / Link / Publication date   as the header keys below
     Image              a photo dragged into the field (an https address),
                        downloaded, shrunk to IMAGE_MAX_BYTES as a JPEG
                        without its camera data, and saved in
                        src/assets/images/news/. Or a site image (/assets/...).
                        "image" is its site path: the picture of the social
                        posts.
     Image description  "imageAlt", the photo's alt text. Required with a
                        photo, up to IMAGE_ALT_MAX characters
     Collaborator page  social.collaborator ("netsec")
     Newsletter         "newsletter": true when the box is ticked (off the
                        form for now, still read for older issues)

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

import io
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEWS = ROOT / "src" / "_data" / "news.json"
IMAGE_DIR = ROOT / "src" / "assets" / "images" / "news"

ALLOWED_TYPES = {"paper", "event", "press", "podcast", "news"}
EXCERPT_MAX = 320
HEADLINE_MAX = 100
SUMMARY_MAX = 300
IMAGE_ALT_MAX = 300
# Bluesky refuses an image over 1,000,000 bytes. LinkedIn takes more, so the
# smaller limit sets the size of the saved photo.
IMAGE_MAX_BYTES = 950_000
IMAGE_MAX_SIDE = 2000
DOWNLOAD_MAX_BYTES = 25_000_000
FORM_HEADING_RE = re.compile(r"^###\s+(.+?)\s*$")
NO_RESPONSE = "_No response_"
HEADER_RE = re.compile(r"^\s*(type|url|date)\s*:\s*(.+?)\s*$", re.IGNORECASE)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def clean_title(title: str) -> str:
    return re.sub(r"^\s*news\s*:\s*", "", (title or "").strip(), flags=re.IGNORECASE)


def parse_free_text(title: str, body: str, today: str) -> dict:
    title = clean_title(title)
    if not title:
        sys.exit("The issue title is empty after 'news:'. Edit the issue and write the headline in its title.")

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


def _check_length(field: str, text: str, limit: int) -> None:
    if len(text) > limit:
        sys.exit(f"The {field} is {len(text)} characters long, and the limit is {limit}. "
                 f"Edit the issue and shorten the {field} by at least {len(text) - limit} characters.")


def _link(val: str) -> str:
    val = (val or "").strip()
    return val if val.startswith(("http://", "https://", "/")) else ""


def image_source(text: str) -> str:
    """The photo in the Image field: an https address, or a site image path
    (/assets/...). GitHub writes a dragged photo as <img ... src="..."> or
    ![name](...), and either is read. An empty field gives ""."""
    text = (text or "").strip()
    if not text:
        return ""
    for pattern in (r'src="(https://[^"\s]+)"', r"\]\((https://[^)\s]+)\)", r"(https://\S+)"):
        m = re.search(pattern, text)
        if m:
            return m.group(1)
    if re.fullmatch(r"/assets/\S+", text):
        return text
    sys.exit("The Image field has no photo in it. Edit the issue and drag a photo into the Image "
             "field, then wait until the upload finishes. Or empty the field to post without a photo.")


def fetch(url: str) -> bytes:
    """The photo's bytes. Any failure is the person's to retry, so the
    message is theirs."""
    req = urllib.request.Request(url, headers={"User-Agent": "eiss-news-publisher"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read(DOWNLOAD_MAX_BYTES + 1)
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        print(f"news-from-issue: download of {url} failed: {e}")
        sys.exit("The photo in the Image field could not be downloaded. Edit the issue, delete the "
                 "photo, drag it in again and wait until the upload finishes. Or empty the Image "
                 "field to post without a photo.")
    if len(data) > DOWNLOAD_MAX_BYTES:
        sys.exit(f"The photo is larger than {DOWNLOAD_MAX_BYTES // 1_000_000} MB. Edit the issue and use a smaller photo.")
    return data


def shrink(data: bytes) -> bytes:
    """The photo as a JPEG of at most IMAGE_MAX_BYTES and IMAGE_MAX_SIDE
    pixels on its longer side, turned the way the camera held it. The
    camera data (EXIF, with the place it was taken) is not copied."""
    try:
        from PIL import Image, ImageOps
    except ImportError:
        sys.exit("news-from-issue: Pillow is missing. Run pip install -r scripts/requirements.txt.")
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
        img = ImageOps.exif_transpose(img)
    except Exception:
        sys.exit("The file in the Image field is not a photo that can be read. "
                 "Edit the issue and use a JPEG or PNG photo.")
    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        flat = Image.new("RGB", rgba.size, "white")
        flat.paste(rgba, mask=rgba.getchannel("A"))
        img = flat
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.thumbnail((IMAGE_MAX_SIDE, IMAGE_MAX_SIDE), Image.LANCZOS)
    quality = 85
    while True:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
        out = buf.getvalue()
        if len(out) <= IMAGE_MAX_BYTES:
            return out
        if quality > 70:
            quality -= 5
        else:
            img = img.resize((max(1, img.width * 4 // 5), max(1, img.height * 4 // 5)), Image.LANCZOS)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:60].rstrip("-") or "item"


def save_photo(item: dict, data: bytes, image_dir: Path | None = None) -> str:
    """Writes the shrunk photo and returns its site path."""
    image_dir = image_dir or IMAGE_DIR
    out = shrink(data)
    image_dir.mkdir(parents=True, exist_ok=True)
    name = f"{item['date']}-{slugify(item['title'])}.jpg"
    (image_dir / name).write_bytes(out)
    print(f"news-from-issue: photo saved as src/assets/images/news/{name} ({len(out) // 1000} kB).")
    return f"/assets/images/news/{name}"


def _social_post_module():
    """scripts/social-post.py, for the post helpers: the link a post ends
    with, the accounts, and the text as each network shows it. Loaded once."""
    global _SP
    if _SP is None:
        import importlib.util
        spec = importlib.util.spec_from_file_location("social_post", Path(__file__).with_name("social-post.py"))
        _SP = importlib.util.module_from_spec(spec)
        sys.modules["social_post"] = _SP
        spec.loader.exec_module(_SP)
    return _SP


_SP = None
POST_BOXES = (("linkedin", "LinkedIn post", "linkedin post"), ("bluesky", "Bluesky post", "bluesky post"))


def post_text(text: str) -> str:
    """A post as written, with its paragraphs: line ends trimmed, at most one
    blank line between paragraphs."""
    lines = [ln.rstrip() for ln in (text or "").replace("\r\n", "\n").split("\n")]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()


def check_post(network: str, label: str, text: str, item: dict) -> None:
    """Stops the run when a post box tags an unknown account or is over the
    network's limit once the link is added and the tags are written out."""
    sp = _social_post_module()
    accounts = sp.load_accounts()
    unknown = sp.unknown_tags(text, accounts)
    if unknown:
        known = ", ".join("@" + k for k in sorted(
            (json.loads(sp.ACCOUNTS_JSON.read_text(encoding="utf-8")).get("accounts") or {})))
        sys.exit(f"The {label} tags {', '.join(unknown)}, which is not in the list of accounts. "
                 f"Edit the issue and use {known}, or write the name without @.")
    shown, _ = sp.tagged(sp.with_link(text, sp.post_link(item)), network, accounts)
    limit = sp.LINKEDIN_LIMIT if network == "linkedin" else sp.BLUESKY_LIMIT
    if len(shown) > limit:
        extra = " with the link and the tags as Bluesky shows them" if network == "bluesky" else " with the link"
        sys.exit(f"The {label} is {len(shown)} characters long{extra}, and the limit is {limit}. "
                 f"Edit the issue and shorten the {label} by at least {len(shown) - limit} characters.")


def parse_form(title: str, f: dict[str, str], today: str) -> dict:
    site = f.get("site", "").strip().lower()
    if site.startswith("netsec"):
        sys.exit("The Site is NetSec, and this form publishes on the EISS website only. "
                 "Edit the issue and pick EISS or Joint, or ask the maintainer to post a NetSec-only item.")

    headline = " ".join(f.get("headline", "").split()) or clean_title(title)
    if not headline:
        sys.exit("The Headline is empty. Edit the issue and write a headline.")
    _check_length("Headline", headline, HEADLINE_MAX)

    date = f.get("publication date", "").strip()
    if date and not DATE_RE.match(date):
        sys.exit(f"The Publication date \"{date}\" is not a date the site can read. Edit the issue and "
                 "write it as year-month-day with dashes, for example 2026-11-08, or leave it empty for today.")
    t = f.get("type", "").strip().lower()
    item: dict = {
        "date": date or today,
        "type": t if t in ALLOWED_TYPES else "news",
        "title": headline,
    }
    if site.startswith("joint"):
        item["site"] = "joint"
    raw_link = f.get("link", "").strip()
    url = _link(raw_link)
    if raw_link and (not url or any(c.isspace() for c in raw_link)):
        sys.exit("The Link is not a web address. Edit the issue and paste the full address, starting "
                 "with https://, or a page on this site starting with /, or leave it empty.")
    if url:
        item["url"] = url
    label = "Website summary" if "website summary" in f else "Summary"
    summary = " ".join(f.get("website summary", f.get("summary", "")).split())
    if not summary and "website summary" in f:
        sys.exit("The Website summary is empty. Edit the issue and write one or two sentences for the website.")
    _check_length(label, summary, SUMMARY_MAX)
    if summary:
        item["excerpt"] = summary
    body = f.get("body", "").strip()
    if body:
        item["body"] = body
    image = image_source(f.get("image", ""))
    if image:
        alt = " ".join(f.get("image description", "").split())
        if not alt:
            sys.exit("The item has a photo but the Image description is empty. Edit the issue and "
                     "write one sentence saying what the photo shows, for people who cannot see it.")
        _check_length("Image description", alt, IMAGE_ALT_MAX)
        item["imageAlt"] = alt
        if image.startswith("/"):
            item["image"] = image
        else:
            # Downloaded by main(), after the duplicate check.
            item["_image_url"] = image

    social: dict = {}
    if "website summary" not in f and summary:
        social["text"] = summary  # an issue filed before the post boxes
    for network, box_label, key in POST_BOXES:
        text = post_text(f.get(key, ""))
        if text:
            check_post(network, box_label, text, item)
            social[network] = text
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

    url = item.pop("_image_url", "")
    if url:
        item["image"] = save_photo(item, fetch(url))
    data.append(item)
    NEWS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    issue = os.environ.get("ISSUE_NUMBER", "?")
    print(f"news-from-issue: added from #{issue}: [{item['type']}] {item['date']} — {item['title']}")


if __name__ == "__main__":
    main()
