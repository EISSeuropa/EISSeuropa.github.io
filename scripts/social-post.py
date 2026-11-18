#!/usr/bin/env python3
"""
Post EISS news items to the EISS LinkedIn page and Bluesky account (#2056),
and the weekly welcome to people who joined EISS (#2219, --kind welcome).

Ported from EISSeuropa/netsec.github.io scripts/social-post.py (its #1072
pipeline), cut down to news: EISS has no member spotlight and no curated
threads. The LinkedIn and Bluesky adapters, the LinkedIn "little text"
escaping and the token refresh are NetSec's code unchanged.

Source: src/_data/news.json, the one record the News item form writes
(#2058). Each item is one post. Optional per-item `social`:
  "skip" or {"skip": true}   never post this item
  {"text": "..."}            the caption (default: the item's excerpt)
  {"collaborator": "netsec"} after a LinkedIn post, the run summary asks for
                             the NetSec page to be added as collaborator by
                             hand. LinkedIn's API offers no way to do it.
  {"networks": ["linkedin"]} post on these networks only (the form's "Post
                             on" boxes). Absent: every configured network.

A ledger (data/social-posted.json) records the key of every item posted, so
re-runs publish nothing. The key is news::<date>::<slug>, with the slug built
as src/_data/news.js builds it. Editing a posted item's title or date makes
a new key, so the item would be offered again (the approval gate catches it).

The welcome (#2219) names the people in src/_data/board.json who agreed to
appear in EISS's social media posts (`socialConsent`, from the Joining Form or
the bios form) and whose `joined` date is on or after data/welcome.json
`since`, the go-live date. A person waits WELCOME_WAIT_DAYS after `joined`,
and a volunteer whose roleEndDate is a cohort's end waits for that cohort's
start. Each person named is recorded as welcome::<slug>. Ported from
EISSeuropa/netsec.github.io's weekly welcome (#2236).

Usage:
    python3 scripts/social-post.py --dry-run          # preview what is pending
    python3 scripts/social-post.py --dry-run --kind welcome --since 2026-11-01
    python3 scripts/social-post.py --count            # number pending (for CI)
    python3 scripts/social-post.py --live --channel all   # behind the `social` gate
    python3 scripts/social-post.py --seed             # mark every current item posted

Stdlib only. See docs/news-publishing.md for the secrets and the set-up.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field as dataclass_field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEWS_JSON = ROOT / "src" / "_data" / "news.json"
LEDGER = ROOT / "data" / "social-posted.json"
LINKEDIN_VERSION_FILE = ROOT / "data" / "linkedin-api-version.json"
ACCOUNTS_JSON = ROOT / "data" / "social-accounts.json"
BOARD_JSON = ROOT / "src" / "_data" / "board.json"
COHORTS_JSON = ROOT / "src" / "_data" / "cohorts.json"
WELCOME = ROOT / "data" / "welcome.json"
# The welcome card, rendered per post by scripts/build-welcome-card.py (gitignored).
WELCOME_CARDS = ROOT / ".cache" / "welcome-cards"
SITE = "https://eiss-europa.com"
SRC = ROOT / "src"
SITE_OG = SRC / "assets" / "images" / "index-meta.jpg"
SITE_OG_ALT = "European Initiative for Security Studies"

# Bluesky posts are capped at 300 graphemes. len() counts code points, which
# is never fewer, so a text that passes here passes on Bluesky.
BLUESKY_LIMIT = 300
# LinkedIn's limit for a post's commentary.
LINKEDIN_LIMIT = 3000
HASHTAGS = ""

# Last-resort LinkedIn version if the pin file is unreadable. The file is the
# real source, kept current by .github/workflows/linkedin-version-check.yml.
_LINKEDIN_VERSION_FALLBACK = "202607"


def _pinned_api_version() -> str:
    try:
        v = str(json.loads(LINKEDIN_VERSION_FILE.read_text(encoding="utf-8"))["version"]).strip()
        return v if re.fullmatch(r"\d{6}", v) else _LINKEDIN_VERSION_FALLBACK
    except (OSError, ValueError, KeyError, TypeError):
        return _LINKEDIN_VERSION_FALLBACK


def _gha_warning(msg: str) -> None:
    if os.environ.get("GITHUB_ACTIONS") == "true":
        print(f"::warning title=Social post::{msg}")


# --------------------------------------------------------------------------
# Post model
# --------------------------------------------------------------------------
@dataclass
class Post:
    key: str
    title: str
    summary: str
    link: str
    image: Path | None = None
    image_alt: str = ""
    hashtags: str = HASHTAGS
    collaborator: str = ""
    # The form's LinkedIn post and Bluesky post, verbatim with their line
    # breaks and @tags. Blank: the post is built from the title and summary.
    linkedin_text: str = ""
    bluesky_text: str = ""
    # The networks the item is for, from social.networks. Empty: all of them.
    networks: tuple[str, ...] = ()
    # False when the item has no photo of its own and the posts use the site card.
    own_image: bool = False
    # Welcome only: the finished text for each channel, keyed "bluesky" and
    # "linkedin", and the welcome::<slug> key of every person it names,
    # recorded in the ledger with `key` once the post goes out.
    texts: dict = dataclass_field(default_factory=dict)
    member_keys: tuple[str, ...] = ()

    def wants(self, channel: str) -> bool:
        return not self.networks or channel in self.networks

    def custom(self, channel: str) -> str:
        return self.linkedin_text if channel == "linkedin" else self.bluesky_text

    def render(self, channel: str) -> str:
        """Channel text as the network shows it. A post written for the
        channel is used as it is, with the link added at the end when the
        text does not hold it, and its @tags shown as the network shows them.
        Otherwise the post is built from the title and summary: Bluesky is
        trimmed to its limit, and the link is always kept whole."""
        if self.texts:
            return self.texts.get(channel, "")
        own = self.custom(channel)
        if own:
            text, _ = tagged(with_link(own, self.link), channel, load_accounts())
            return text[:BLUESKY_LIMIT] if channel == "bluesky" else text
        head = self.title
        tail = f"\n\n{self.link}"
        if channel == "bluesky":
            budget = BLUESKY_LIMIT - len(head) - len(tail) - 2
            summary = _truncate(self.summary, max(0, budget))
            body = f"{head}\n\n{summary}{tail}" if summary else f"{head}{tail}"
            return body[:BLUESKY_LIMIT]
        parts = [head, "", self.summary, "", self.link] if self.summary else [head, "", self.link]
        if self.hashtags:
            parts += ["", self.hashtags]
        return "\n".join(parts)


# LinkedIn reads `commentary` as "little text": these characters are markup,
# and the API silently drops everything from the first unescaped one.
_LI_RESERVED = re.compile(r"([\\|{}@\[\]()<>#*_~])")
_LI_HASHTAG = re.compile(r"(?<!\S)#(\w+)")


def li_little_text(text: str) -> str:
    """Escape LinkedIn's reserved characters with a backslash, and write each
    hashtag (a # at the start of a word, so never a URL fragment) as
    {hashtag|\\#|Name} so it stays a clickable tag."""
    out, last = [], 0
    for m in _LI_HASHTAG.finditer(text):
        out.append(_LI_RESERVED.sub(r"\\\1", text[last:m.start()]))
        out.append("{hashtag|\\#|" + m.group(1) + "}")
        last = m.end()
    out.append(_LI_RESERVED.sub(r"\\\1", text[last:]))
    return "".join(out)


def _truncate(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    if limit <= 1:
        return ""
    cut = text[: limit - 1].rsplit(" ", 1)[0]
    return (cut or text[: limit - 1]).rstrip(",.;:") + "…"


def _truncate(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    if limit <= 1:
        return ""
    cut = text[: limit - 1].rsplit(" ", 1)[0]
    return (cut or text[: limit - 1]).rstrip(",.;:") + "…"


def slugify(s: str) -> str:
    """The anchor slug, as slugify() in src/_data/news.js builds it."""
    s = unicodedata.normalize("NFKD", (s or "").lower())
    s = re.sub(r"[̀-ͯ]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:80] or "item"


def item_key(item: dict) -> str:
    return f"news::{item.get('date', '')}::{slugify(item.get('title', ''))}"


def _social(item: dict) -> dict:
    s = item.get("social")
    if isinstance(s, str):
        return {"skip": True} if s.strip().lower() == "skip" else {}
    return s if isinstance(s, dict) else {}


def _image(item: dict) -> tuple[Path | None, str]:
    """A site image the item names (/assets/...), with its imageAlt (the
    form's Image description, else the title), else the site card."""
    img = (item.get("image") or "").strip()
    if img.startswith("/"):
        path = (SRC / img.lstrip("/")).resolve()
        if path.is_file() and SRC.resolve() in path.parents:
            return path, (item.get("imageAlt") or item.get("title", "")).strip()
    return (SITE_OG if SITE_OG.exists() else None), SITE_OG_ALT


def post_link(item: dict) -> str:
    """The address a post ends with: the item's link, else its place in the
    news archive, made absolute."""
    url = (item.get("url") or "").strip()
    if not url:
        url = f"/news.html#news-{slugify(item.get('title', ''))}"
    return url if "://" in url else SITE + url


def read_news() -> list[Post]:
    if not NEWS_JSON.exists():
        return []
    data = json.loads(NEWS_JSON.read_text(encoding="utf-8"))
    posts = []
    for it in data if isinstance(data, list) else []:
        if not (it.get("date") and it.get("title")):
            continue
        social = _social(it)
        if social.get("skip"):
            continue
        url = post_link(it)
        image, alt = _image(it)
        posts.append(Post(
            key=item_key(it),
            title=it["title"].strip(),
            summary=(social.get("text") or it.get("excerpt") or "").strip(),
            link=url,
            image=image,
            image_alt=alt,
            collaborator=(social.get("collaborator") or "").strip().lower(),
            linkedin_text=str(social.get("linkedin") or "").strip(),
            bluesky_text=str(social.get("bluesky") or "").strip(),
            networks=tuple(n for n in (social.get("networks") or []) if n in NETWORKS),
            own_image=image is not None and image != SITE_OG,
        ))
    return posts


NETWORKS = ("linkedin", "bluesky")

URL_RE = re.compile(r"https?://[^\s\]\)]+")


# A tag is @Key from data/social-accounts.json. Not after a word character,
# @, dot, slash or colon, so an email address or a URL is never read as one.
TAG_RE = re.compile(r"(?<![\w@./:])@([A-Za-z][A-Za-z0-9_-]*)")
HASHTAG_RE = re.compile(r"(?<!\S)#(\w+)")


def load_accounts(path: Path | None = None) -> dict:
    """{lower-cased key: {name, linkedin, bluesky}} from social-accounts.json."""
    try:
        data = json.loads((path or ACCOUNTS_JSON).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return {k.lower(): v for k, v in (data.get("accounts") or {}).items() if isinstance(v, dict)}


def unknown_tags(text: str, accounts: dict) -> list[str]:
    return sorted({"@" + m.group(1) for m in TAG_RE.finditer(text or "") if m.group(1).lower() not in accounts})


def with_link(text: str, link: str) -> str:
    """The post text, with the link added after a blank line unless the text
    already holds it."""
    text = (text or "").rstrip()
    return text if (not link or link in text) else f"{text}\n\n{link}"


def tagged(text: str, channel: str, accounts: dict) -> tuple[str, list]:
    """The text with each known @Key written as the channel shows it (the
    Bluesky handle, else the account's name), and [(start, end, account)]
    for each, as character offsets in the returned text."""
    out, spans, last, pos = [], [], 0, 0
    for m in TAG_RE.finditer(text):
        acc = accounts.get(m.group(1).lower())
        if not acc:
            continue
        out.append(text[last:m.start()])
        pos += m.start() - last
        if channel == "bluesky" and acc.get("bluesky"):
            shown = "@" + str(acc["bluesky"]).lstrip("@")
        else:
            shown = str(acc.get("name") or m.group(1))
        out.append(shown)
        spans.append((pos, pos + len(shown), acc))
        pos += len(shown)
        last = m.end()
    out.append(text[last:])
    return "".join(out), spans


def li_commentary(text: str, accounts: dict) -> str:
    """LinkedIn little text for a post written for LinkedIn: each tag with a
    URN becomes a mention, @[Name](urn), and the rest is escaped."""
    out, last = [], 0
    for m in TAG_RE.finditer(text):
        acc = accounts.get(m.group(1).lower())
        if not acc:
            continue
        out.append(li_little_text(text[last:m.start()]))
        name = str(acc.get("name") or m.group(1))
        urn = acc.get("linkedin")
        if urn:
            out.append("@[" + _LI_RESERVED.sub(r"\\\1", name) + "](" + urn + ")")
        else:
            out.append(li_little_text(name))
        last = m.end()
    out.append(li_little_text(text[last:]))
    return "".join(out)


def untagged_notes(post: "Post") -> list[str]:
    """For the preview: each tag that goes out as a plain name, because its
    account has no LinkedIn URN or Bluesky handle in social-accounts.json."""
    accounts, notes = load_accounts(), []
    for channel, label, field in (("linkedin", "LinkedIn", "linkedin"), ("bluesky", "Bluesky", "bluesky")):
        for m in TAG_RE.finditer(post.custom(channel)):
            acc = accounts.get(m.group(1).lower())
            if acc and not acc.get(field):
                notes.append(f"@{m.group(1)} is plain text on {label}: no {label} account for it "
                             f"in data/social-accounts.json")
    return notes


def _byte(text: str, i: int) -> int:
    return len(text[:i].encode("utf-8"))


def hashtag_facets(text: str) -> list:
    """Bluesky tag facets, so #Name is a clickable hashtag."""
    return [{"index": {"byteStart": _byte(text, m.start()), "byteEnd": _byte(text, m.end())},
             "features": [{"$type": "app.bsky.richtext.facet#tag", "tag": m.group(1)}]}
            for m in HASHTAG_RE.finditer(text)]


def find_links(text: str) -> list[tuple[str, int, int]]:
    """(url, byteStart, byteEnd) for each link, over the UTF-8 bytes."""
    out = []
    for m in URL_RE.finditer(text):
        url = m.group(0).rstrip(").,;")
        bs = len(text[:m.start()].encode("utf-8"))
        out.append((url, bs, bs + len(url.encode("utf-8"))))
    return out


# --------------------------------------------------------------------------
# Weekly welcome to people who joined EISS (#2219)
# --------------------------------------------------------------------------
WELCOME_TITLE = "Welcome to EISS"
BOARD_LINK = f"{SITE}/board.html"
# Days after `joined` before a person is welcomed: a newcomer adds their photo
# through the bios form after approval, so the card has more photos.
WELCOME_WAIT_DAYS = 7
# Tiles on the welcome card. When everyone pictured fits, each has a tile.
# Otherwise the last tile reads "+N" for everyone not pictured.
WELCOME_CARD_TILES = 7
_NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]


def _number_word(n: int) -> str:
    """"one" to "ten" in words, larger numbers in figures."""
    return _NUMBER_WORDS[n] if 0 <= n < len(_NUMBER_WORDS) else str(n)


def _count_words(n: int, noun: str, plural: str = "") -> str:
    """"one person", "seven people", "16 people"."""
    return f"{_number_word(n)} {noun}" if n == 1 else f"{_number_word(n)} {plural or noun + 's'}"


def _join_and(items: list[str]) -> str:
    """"a", "a and b", "a, b and c" (no Oxford comma)."""
    items = [i for i in items if i]
    if len(items) <= 1:
        return "".join(items)
    return ", ".join(items[:-1]) + " and " + items[-1]


def welcome_since() -> str | None:
    """data/welcome.json `since` (YYYY-MM-DD), or None while the welcome is
    off (no file, or `since` null or malformed)."""
    try:
        since = json.loads(WELCOME.read_text(encoding="utf-8")).get("since")
        return dt.date.fromisoformat(str(since)).isoformat() if since else None
    except (OSError, ValueError, AttributeError):
        return None


def _cohorts() -> list[dict]:
    try:
        return json.loads(COHORTS_JSON.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def person_slug(p: dict) -> str:
    return p.get("slug") or slugify(p.get("name", ""))


def person_cohort(p: dict, cohorts: list[dict]) -> dict | None:
    """The volunteer cohort a Support Staff entry belongs to: the one whose
    end is the entry's roleEndDate (sync-board.py writes it from the cohort
    answer)."""
    end = p.get("roleEndDate")
    if p.get("_section") != "support" or not end:
        return None
    return next((c for c in cohorts if c.get("end") == end), None)


def welcome_due(p: dict, cohorts: list[dict]) -> str:
    """The first date the person may be welcomed (YYYY-MM-DD)."""
    due = (dt.date.fromisoformat(p["joined"]) + dt.timedelta(days=WELCOME_WAIT_DAYS)).isoformat()
    c = person_cohort(p, cohorts)
    return max(due, c["start"]) if c and c.get("start") else due


def welcome_people(posted: set[str], since: str, today: dt.date) -> list[dict]:
    """Everyone in board.json who agreed to social media posts, joined on or
    after `since`, is due by `today` and has not been welcomed, oldest first.
    Each carries `_section` ("members" or "support")."""
    try:
        board = json.loads(BOARD_JSON.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    cohorts = _cohorts()
    out = []
    for section in ("members", "support"):
        for p in board.get(section, []):
            p = {**p, "_section": section}
            joined = str(p.get("joined") or "")
            try:
                dt.date.fromisoformat(joined)
            except ValueError:
                continue
            if not (p.get("socialConsent") is True and p.get("name") and joined >= since):
                continue
            if p.get("formerMember") or f"welcome::{person_slug(p)}" in posted:
                continue
            if welcome_due(p, cohorts) > today.isoformat():
                continue
            out.append(p)
    return sorted(out, key=lambda p: (p["joined"], p["name"].lower()))


def welcome_pending(posted: set[str], since: str | None = None,
                    today: dt.date | None = None) -> list[dict]:
    """The people the next welcome names. Empty while the welcome is off (no
    `since`, or a go-live date still to come) or nobody is due. `since`
    overrides data/welcome.json for previews, and is the only way to compose
    a welcome before the go-live date. scripts/build-welcome-card.py calls
    this too, so the card and the post name the same people."""
    today = today or dt.datetime.now(dt.timezone.utc).date()
    if not since:
        since = welcome_since()
        if not since or today.isoformat() < since:
            return []
    return welcome_people(posted, since, today)


def _role_line(p: dict) -> str:
    """"Position, Institution", whichever is set, without a stutter when the
    position already names the institution."""
    pos = (p.get("position") or "").strip()
    inst = (p.get("institution") or "").strip()
    if inst and inst.lower() in pos.lower():
        return pos
    return ", ".join(x for x in (pos, inst) if x)


def welcome_groups(people: list[dict]) -> list[tuple[str, list[dict]]]:
    """(heading, people) in the post's order: each volunteer cohort, then the
    board, then everyone else in the team. Empty groups are left out."""
    cohorts = _cohorts()
    groups: dict[str, list[dict]] = {}
    for p in people:
        c = person_cohort(p, cohorts)
        if c:
            phrase = ((c.get("phrase") or {}).get("en") or "the new cohort").strip()
            heading = phrase[:1].upper() + phrase[1:]
        elif p["_section"] == "members":
            heading = "The board"
        else:
            heading = "The team"
        groups.setdefault(heading, []).append(p)
    order = [h for h in groups if h not in ("The board", "The team")] + ["The board", "The team"]
    return [(h, groups[h]) for h in order if h in groups]


def welcome_linkedin(people: list[dict]) -> str:
    """A heading per group and one line per person: name, role in EISS when
    it is not the group's own, position and institution, and country. Over
    LinkedIn's limit, the positions go first, then the tail of each group."""

    def line(p: dict, full: bool) -> str:
        parts = [p["name"].strip()]
        if p.get("role") not in ("Board Member", "Support Staff"):
            parts.append(p.get("role", ""))
        if full:
            parts.append(_role_line(p))
        text = ", ".join(x for x in parts if x)
        country = (p.get("country") or "").strip()
        if country and country.lower() not in text.lower():
            text += f" ({country})"
        return f"- {text}"

    def build(cap: int | None, full: bool) -> str:
        out = [WELCOME_TITLE, "", f"{_count_words(len(people), 'person', 'people').capitalize()} joined EISS:"]
        for heading, group in welcome_groups(people):
            shown = group if cap is None else group[:cap]
            out += ["", f"{heading}:"] + [line(p, full) for p in shown]
            if len(shown) < len(group):
                out.append(f"- and {_count_words(len(group) - len(shown), 'other')}")
        return "\n".join(out + ["", f"Meet them at {BOARD_LINK}"])

    attempts = [(None, True), (None, False)] + [(k, False) for k in range(len(people), 0, -1)]
    for cap, full in attempts:
        text = build(cap, full)
        if len(li_little_text(text)) <= LINKEDIN_LIMIT:
            return text
    return build(0, False)


def welcome_bluesky(people: list[dict]) -> str:
    """One sentence with as many names as fit and "and N more", then the
    link, within 300 graphemes."""
    groups = welcome_groups(people)
    n = len(people)
    names = [p["name"].strip() for p in people]
    if n == 1:
        heading = groups[0][0]
        where = {"The board": "the EISS board", "The team": "the EISS team"}.get(
            heading, f"{heading[:1].lower()}{heading[1:]} of EISS volunteers")
        lead = f"Welcome to {names[0]}, who joined {where}."
        return f"{lead}\n\n{BOARD_LINK}"
    if len(groups) == 1 and groups[0][0] not in ("The board", "The team"):
        who = f"{groups[0][0][:1].lower()}{groups[0][0][1:]} of EISS volunteers"
    else:
        who = f"the {_count_words(n, 'person', 'people')} who joined EISS"
    for shown in range(n, -1, -1):
        listed = names[:shown] + ([f"{_number_word(n - shown)} more"] if shown < n else [])
        lead = f"Welcome to {who}: {_join_and(listed)}." if shown else f"Welcome to {who}."
        text = f"{lead}\n\n{BOARD_LINK}"
        if len(text) <= BLUESKY_LIMIT:
            return text
    return f"Welcome to {who}.\n\n{BOARD_LINK}"


def has_photo(p: dict) -> bool:
    """True when the person's headshot is in the repository."""
    rel = (p.get("photoOverride") or p.get("photo") or "").strip().lstrip("/")
    return bool(rel) and (SRC / rel).is_file()


def welcome_card_faces(people: list[dict]) -> list[dict]:
    """The people pictured on the welcome card, in the post's order. Only
    people with a headshot are pictured, and the rest are counted in the
    "+N" tile. When nobody has one, the card falls back to initials tiles."""
    pool = [p for p in people if has_photo(p)] or people
    if len(pool) == len(people) and len(people) <= WELCOME_CARD_TILES:
        return list(people)
    return pool[:WELCOME_CARD_TILES - 1]


def welcome_card_path(people: list[dict]) -> Path:
    """The welcome card for exactly these people. The name hashes their
    slugs, so a card left over from another week is never attached."""
    digest = hashlib.sha256(",".join(person_slug(p) for p in people).encode("utf-8")).hexdigest()[:12]
    return WELCOME_CARDS / f"{digest}.jpg"


def welcome_card_alt(people: list[dict]) -> str:
    faces = welcome_card_faces(people)
    shown = [p["name"].strip() for p in faces]
    what = "photos of " if any(has_photo(p) for p in faces) else "tiles for "
    n = len(people)
    noun = _count_words(n, "new member of EISS", "new members of EISS")
    if len(shown) == n:
        return f"Welcome to EISS: {what}the {noun}, {_join_and(shown)}"
    return (f"Welcome to EISS: {what}{_number_word(len(shown))} of the {n} new members of EISS, "
            f"{_join_and(shown)}, and a tile for {_number_word(n - len(shown))} more")


def read_welcome(posted: set[str], since: str | None = None,
                 today: dt.date | None = None) -> Post | None:
    """The weekly welcome post, or None when nobody is to be welcomed."""
    today = today or dt.datetime.now(dt.timezone.utc).date()
    people = welcome_pending(posted, since, today)
    if not people:
        return None
    y, w, _ = today.isocalendar()
    card = welcome_card_path(people)
    return Post(
        key=f"welcome::{y}-W{w:02d}",
        title=WELCOME_TITLE,
        summary=_join_and([p["name"].strip() for p in people]),
        link=BOARD_LINK,
        image=card if card.exists() else (SITE_OG if SITE_OG.exists() else None),
        image_alt=welcome_card_alt(people) if card.exists() else SITE_OG_ALT,
        hashtags="",
        own_image=card.exists(),
        texts={"bluesky": welcome_bluesky(people), "linkedin": welcome_linkedin(people)},
        member_keys=tuple(f"welcome::{person_slug(p)}" for p in people),
    )


# --------------------------------------------------------------------------
# Ledger
# --------------------------------------------------------------------------
def load_ledger() -> dict:
    data = json.loads(LEDGER.read_text(encoding="utf-8")) if LEDGER.exists() else {}
    data.setdefault("posted", [])
    return data


def save_ledger(data: dict) -> None:
    LEDGER.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def pending(ledger: dict, kind: str = "news", since: str | None = None) -> list[Post]:
    """The posts still to go out: the news items, or the week's welcome.
    `since` applies to the welcome only."""
    posted = set(ledger.get("posted", []))
    if kind == "welcome":
        wp = read_welcome(posted, since)
        return [wp] if wp else []
    return [p for p in read_news() if p.key not in posted]


# --------------------------------------------------------------------------
# Channels
# --------------------------------------------------------------------------
@dataclass
class Channel:
    name: str

    def configured(self) -> bool:
        return False

    def publish(self, post: Post) -> str:
        raise NotImplementedError


def _http_json(url: str, payload: dict | None = None, headers: dict | None = None,
               raw: bytes | None = None, content_type: str | None = None) -> dict:
    import urllib.error
    import urllib.request

    hdrs = dict(headers or {})
    data = None
    if raw is not None:
        data = raw
        hdrs["Content-Type"] = content_type or "application/octet-stream"
    elif payload is not None:
        data = json.dumps(payload).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=hdrs, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        raise SystemExit(f"HTTP {e.code} from {url}: {detail}") from e


def _img_mime(path: Path) -> str:
    return "image/jpeg" if path.suffix.lower() in (".jpg", ".jpeg") else "image/png"


def image_size(path: Path) -> tuple[int, int] | None:
    """(width, height) of a PNG or JPEG, stdlib-only. None if unreadable.
    Bluesky letterboxes an image embed unless it carries the aspect ratio, so
    the embed sends this so the card renders edge-to-edge at the true ratio."""
    data = path.read_bytes()
    if data[:8] == b"\x89PNG\r\n\x1a\n":  # IHDR width/height at bytes 16..24
        import struct
        w, h = struct.unpack(">II", data[16:24])
        return int(w), int(h)
    if data[:2] == b"\xff\xd8":  # JPEG: walk segments to a Start-Of-Frame marker
        import struct
        i = 2
        while i + 9 < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return int(w), int(h)
            i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    return None


class BlueskyChannel(Channel):
    PDS = "https://bsky.social"

    def _handle(self) -> str:
        return (os.environ.get("BSKY_HANDLE") or "").strip().lstrip("@")

    def configured(self) -> bool:
        return bool(self._handle() and os.environ.get("BSKY_APP_PASSWORD"))

    def _login(self) -> tuple[dict, str]:
        sess = _http_json(f"{self.PDS}/xrpc/com.atproto.server.createSession",
                          payload={"identifier": self._handle(), "password": os.environ["BSKY_APP_PASSWORD"]})
        return {"Authorization": f"Bearer {sess['accessJwt']}"}, sess["did"]

    def _upload(self, auth: dict, image: Path) -> dict:
        return _http_json(f"{self.PDS}/xrpc/com.atproto.repo.uploadBlob",
                          raw=image.read_bytes(), content_type=_img_mime(image),
                          headers=auth)["blob"]

    def _resolve(self, handle: str) -> str:
        """The DID behind a handle, or "" when it cannot be found: the post
        then goes out with the handle as plain text."""
        try:
            return _http_json(f"{self.PDS}/xrpc/com.atproto.identity.resolveHandle?handle={handle}").get("did", "")
        except SystemExit as e:
            print(f"  ! Bluesky handle {handle} not resolved: {e}", file=sys.stderr)
            return ""

    def _image_embed(self, auth: dict, image: Path, alt: str) -> dict:
        img = {"alt": alt, "image": self._upload(auth, image)}
        size = image_size(image)
        if size:
            img["aspectRatio"] = {"width": size[0], "height": size[1]}
        return {"$type": "app.bsky.embed.images", "images": [img]}

    def publish(self, post: Post) -> str:
        auth, did = self._login()
        text = post.render("bluesky")
        mentions = []
        if post.bluesky_text:
            text, spans = tagged(with_link(post.bluesky_text, post.link), "bluesky", load_accounts())
            text = text[:BLUESKY_LIMIT]
            mentions = [(s, e, acc) for s, e, acc in spans if acc.get("bluesky") and e <= len(text)]
        record = {
            "$type": "app.bsky.feed.post",
            "text": text,
            "langs": ["en"],
            "createdAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        }
        facets = [{"index": {"byteStart": bs, "byteEnd": be},
                   "features": [{"$type": "app.bsky.richtext.facet#link", "uri": url}]}
                  for url, bs, be in find_links(text)]
        for s, e, acc in mentions:
            did_of = self._resolve(str(acc["bluesky"]).lstrip("@"))
            if did_of:
                facets.append({"index": {"byteStart": _byte(text, s), "byteEnd": _byte(text, e)},
                               "features": [{"$type": "app.bsky.richtext.facet#mention", "did": did_of}]})
        facets += hashtag_facets(text)
        if facets:
            record["facets"] = facets
        if post.image and post.image.exists():
            record["embed"] = self._image_embed(auth, post.image, post.image_alt or post.title)
        resp = _http_json(f"{self.PDS}/xrpc/com.atproto.repo.createRecord",
                          payload={"repo": did, "collection": "app.bsky.feed.post", "record": record},
                          headers=auth)
        rkey = resp.get("uri", "").rsplit("/", 1)[-1]
        return f"https://bsky.app/profile/{self._handle()}/post/{rkey}" if rkey else resp.get("uri", "posted")


class _Unauthorized(Exception):
    """Raised by _li_request on a 401 so the caller can refresh + retry once."""


def _li_request(url: str, method: str = "GET", headers: dict | None = None,
                json_body: dict | None = None, data: bytes | None = None,
                content_type: str | None = None) -> tuple[int, dict, object]:
    """LinkedIn HTTP via stdlib urllib. Returns (status, lower-cased headers,
    parsed JSON or raw text). Raises _Unauthorized on 401 (caller refreshes the
    token), SystemExit on any other HTTP error (with the API's error body)."""
    import urllib.error
    import urllib.parse  # noqa: F401  (used by callers for form-encoding)
    import urllib.request

    hdrs = dict(headers or {})
    payload = data
    if json_body is not None:
        payload = json.dumps(json_body).encode("utf-8")
        hdrs.setdefault("Content-Type", "application/json")
    elif content_type:
        hdrs.setdefault("Content-Type", content_type)
    req = urllib.request.Request(url, data=payload, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8", "replace")
            rh = {k.lower(): v for k, v in resp.headers.items()}
            body = json.loads(raw) if raw.strip()[:1] in ("{", "[") else raw
            return resp.status, rh, body
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        if e.code == 401:
            raise _Unauthorized(detail) from e
        raise SystemExit(f"LinkedIn HTTP {e.code} from {url}: {detail}") from e


class LinkedInChannel(Channel):
    """Post to a LinkedIn Company Page via the Community-Management Posts API
    (POST /rest/posts), uploading the OG image through the Images API first.
    Image upload → create post is the same shape Bluesky uses. The access token
    expires ~60 days; on a 401 we refresh it once with the refresh token + app
    credentials and retry. See docs/news-publishing.md."""

    API = "https://api.linkedin.com"
    OAUTH = "https://www.linkedin.com/oauth/v2/accessToken"
    # LinkedIn versions the API monthly (YYYYMM) and sunsets a version after
    # ~12 months; a sunset version returns HTTP 426 and the post fails. The
    # pin lives in data/linkedin-api-version.json, kept current by the
    # linkedin-version-check workflow (auto-PR before sunset). LINKEDIN_API_VERSION
    # overrides it at runtime; the literal is a last-resort fallback if the
    # file is missing or unreadable, never the routine source of the value.
    VERSION = os.environ.get("LINKEDIN_API_VERSION") or _pinned_api_version()

    def _org(self) -> str:
        return (os.environ.get("LINKEDIN_ORG_ID") or "").strip()

    def _token(self) -> str:
        return (os.environ.get("LINKEDIN_ACCESS_TOKEN") or "").strip()

    def configured(self) -> bool:
        return bool(self._org() and self._token())

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self._token()}",
            "LinkedIn-Version": self.VERSION,
            "X-Restli-Protocol-Version": "2.0.0",
        }

    def _refresh(self) -> bool:
        """Swap the refresh token for a fresh access token, updating the process
        env so the retry uses it. Returns False when the refresh token or app
        credentials aren't set (so the caller can fail with a clear message)."""
        import urllib.parse
        rt = os.environ.get("LINKEDIN_REFRESH_TOKEN")
        cid = os.environ.get("LINKEDIN_CLIENT_ID")
        cs = os.environ.get("LINKEDIN_CLIENT_SECRET")
        if not (rt and cid and cs):
            return False
        body = urllib.parse.urlencode({
            "grant_type": "refresh_token", "refresh_token": rt,
            "client_id": cid, "client_secret": cs,
        }).encode("utf-8")
        _, _, data = _li_request(self.OAUTH, method="POST", data=body,
                                 content_type="application/x-www-form-urlencoded")
        tok = (data or {}).get("access_token") if isinstance(data, dict) else None
        if tok:
            os.environ["LINKEDIN_ACCESS_TOKEN"] = tok
            return True
        return False

    def _upload_image(self, image: Path, alt: str) -> str:
        """initializeUpload (owner = the org) → PUT the bytes to the signed
        uploadUrl → return the urn:li:image URN to attach to the post."""
        owner = f"urn:li:organization:{self._org()}"
        _, _, init = _li_request(
            f"{self.API}/rest/images?action=initializeUpload", method="POST",
            headers=self._headers(), json_body={"initializeUploadRequest": {"owner": owner}})
        value = (init or {}).get("value", {}) if isinstance(init, dict) else {}
        upload_url, urn = value.get("uploadUrl"), value.get("image")
        if not (upload_url and urn):
            raise SystemExit(f"LinkedIn initializeUpload returned no uploadUrl/image: {init}")
        _li_request(upload_url, method="PUT", data=image.read_bytes(),
                    content_type=_img_mime(image),
                    headers={"Authorization": f"Bearer {self._token()}"})
        return urn

    def _do_publish(self, post: Post) -> str:
        body = {
            "author": f"urn:li:organization:{self._org()}",
            "commentary": (li_commentary(with_link(post.linkedin_text, post.link), load_accounts())
                           if post.linkedin_text else li_little_text(post.render("linkedin"))),
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": [],
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
        }
        if post.image and post.image.exists():
            urn = self._upload_image(post.image, post.image_alt or post.title)
            body["content"] = {"media": {"altText": post.image_alt or post.title, "id": urn}}
        _, headers, _ = _li_request(f"{self.API}/rest/posts", method="POST",
                                    headers=self._headers(), json_body=body)
        pid = headers.get("x-restli-id", "")
        # No first comment: comment creation needs a partner-tier product
        # (NetSec #1630).
        return f"https://www.linkedin.com/feed/update/{pid}/" if pid else "posted"

    def publish(self, post: Post) -> str:
        try:
            return self._do_publish(post)
        except _Unauthorized:
            if self._refresh():
                return self._do_publish(post)  # retry once with the fresh token
            raise SystemExit(
                "LinkedIn returned 401 and no usable refresh token. Set "
                "LINKEDIN_REFRESH_TOKEN, LINKEDIN_CLIENT_ID and "
                "LINKEDIN_CLIENT_SECRET, or regenerate the access token."
            )


CHANNELS = {"bluesky": BlueskyChannel, "linkedin": LinkedInChannel}


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------
def _summary(lines: list[str]) -> None:
    """Append to the GitHub run summary when there is one, and print."""
    for ln in lines:
        print(ln)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path and lines:
        with open(path, "a", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="Post EISS news and the weekly welcome to LinkedIn and Bluesky (#2056, #2219).")
    ap.add_argument("--dry-run", action="store_true", help="print posts, publish nothing (default)")
    ap.add_argument("--live", action="store_true", help="publish through the configured channels")
    ap.add_argument("--channel", choices=["bluesky", "linkedin", "all"], default="all")
    ap.add_argument("--count", action="store_true", help="print the number of pending items only")
    ap.add_argument("--seed", action="store_true", help="record every current item as posted")
    ap.add_argument("--kind", choices=["news", "welcome"], default="news",
                    help="news items (default), or the weekly welcome (#2219)")
    ap.add_argument("--since", metavar="YYYY-MM-DD",
                    help="welcome previews only: people who joined on or after this date, "
                         "in place of data/welcome.json `since`. Refused with --live")
    args = ap.parse_args()
    # The welcome is not retroactive: a live post names only people who joined
    # on or after data/welcome.json `since`, the go-live date.
    if args.since and (args.live or args.seed):
        ap.error("--since is for dry-run previews. A live welcome uses data/welcome.json `since`")
    if args.since:
        try:
            dt.date.fromisoformat(args.since)
        except ValueError:
            ap.error(f"--since must be a date as YYYY-MM-DD, not {args.since!r}")

    ledger = load_ledger()
    posts = pending(ledger, args.kind, args.since)

    if args.seed:
        ledger["posted"] += [k for p in posts for k in (p.key, *p.member_keys)]
        save_ledger(ledger)
        print(f"Recorded {len(posts)} item(s) as posted.")
        return 0

    if args.count:
        print(len(posts))
        return 0

    if not posts:
        print("Nothing pending.")
        return 0

    live = args.live and not args.dry_run
    if not live:
        print(f"DRY RUN: {len(posts)} post(s) pending.\n")
        posted = set(ledger.get("posted", []))
        for p in posts:
            print(f"* {p.title}  (key: {p.key})")
            if not p.own_image:
                what = "No welcome card" if p.texts else "NO PHOTO"
                print(f"  {what}: the posts use the standard EISS picture.\n")
            for ch in ("bluesky", "linkedin"):
                if not p.wants(ch):
                    print(f"  -- not posted to {ch}: the item is for {' and '.join(p.networks)} only --\n")
                    continue
                if f"{p.key}#{ch}" in posted:
                    print(f"  -- already posted to {ch} --\n")
                    continue
                print(f"  -- would post to {ch} --")
                for line in p.render(ch).splitlines():
                    print(f"    {line}")
                print()
            if p.image:
                print(f"    [image: {p.image.relative_to(ROOT)} | alt: {p.image_alt}]")
            for note in untagged_notes(p):
                print(f"    [{note}]")
            if p.collaborator and p.wants("linkedin"):
                print(f"    [then add the {p.collaborator} LinkedIn page as collaborator by hand]")
            print()
        print("Nothing was published.")
        return 0

    wanted = list(CHANNELS) if args.channel == "all" else [args.channel]
    active = [c for c in (CHANNELS[name](name) for name in wanted) if c.configured()]
    if not active:
        # The secrets are not set yet: skip cleanly and leave the ledger alone.
        print("::notice::No channel is configured (secrets missing). Nothing posted.")
        return 0

    # Each network is tried on its own: one that fails (a wrong password, an
    # expired token, an API error) does not stop the other. The ledger then
    # records the network that posted as "<key>#<network>", so the next run
    # retries only the one that failed. An item every configured network has
    # posted is recorded by its key alone, as before. The run reports the
    # failure through GITHUB_OUTPUT (failed=true) and returns 0, so the
    # workflow still persists the ledger and fails the job afterwards.
    notes, failures = [], []
    for p in posts:
        posted = set(ledger.get("posted", []))
        chans = [c for c in active if p.wants(c.name)]
        done = [c.name for c in chans if f"{p.key}#{c.name}" in posted]
        failed = []
        for c in chans:
            if c.name in done:
                continue
            try:
                url = c.publish(p)
            except (SystemExit, Exception) as e:  # noqa: BLE001 (any failure stays on its network)
                msg = str(e) or e.__class__.__name__
                print(f"::error title=Social post::{c.name} did not post {p.title}: {msg}")
                failures.append(f"- {p.title}: {c.name} failed ({msg}). The next run tries {c.name} again.")
                failed.append(c.name)
                continue
            print(f"posted to {c.name}: {p.title}: {url}")
            done.append(c.name)
            if c.name == "linkedin" and p.collaborator:
                notes.append(f"- {p.title}: {url} Add the {p.collaborator} LinkedIn page as collaborator.")
        if failed:
            ledger.setdefault("posted", []).extend(
                f"{p.key}#{n}" for n in done if f"{p.key}#{n}" not in posted)
        else:
            ledger.setdefault("posted", []).append(p.key)
            ledger["posted"].extend(k for k in p.member_keys if k not in ledger["posted"])
        save_ledger(ledger)
    if notes:
        _summary(["### Collaborators to add by hand", ""] + notes)
    if failures:
        _summary(["### Posts that failed", ""] + failures)
        out = os.environ.get("GITHUB_OUTPUT")
        if out:
            with open(out, "a", encoding="utf-8") as fh:
                fh.write("failed=true\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
