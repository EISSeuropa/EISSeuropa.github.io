#!/usr/bin/env python3
"""
Post EISS news items to the EISS LinkedIn page and Bluesky account (#2056).

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

A ledger (data/social-posted.json) records the key of every item posted, so
re-runs publish nothing. The key is news::<date>::<slug>, with the slug built
as src/_data/news.js builds it. Editing a posted item's title or date makes
a new key, so the item would be offered again (the approval gate catches it).

Usage:
    python3 scripts/social-post.py --dry-run          # preview what is pending
    python3 scripts/social-post.py --count            # number pending (for CI)
    python3 scripts/social-post.py --live --channel all   # behind the `social` gate
    python3 scripts/social-post.py --seed             # mark every current item posted

Stdlib only. See docs/news-publishing.md for the secrets and the set-up.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEWS_JSON = ROOT / "src" / "_data" / "news.json"
LEDGER = ROOT / "data" / "social-posted.json"
LINKEDIN_VERSION_FILE = ROOT / "data" / "linkedin-api-version.json"
SITE = "https://eiss-europa.com"
SRC = ROOT / "src"
SITE_OG = SRC / "assets" / "images" / "index-meta.jpg"
SITE_OG_ALT = "European Initiative for Security Studies"

# Bluesky posts are capped at 300 graphemes.
BLUESKY_LIMIT = 300
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

    def render(self, channel: str) -> str:
        """Channel text. Bluesky is trimmed to its limit, and the link is
        always kept whole."""
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
    """A site image the item names (/assets/...), else the site card."""
    img = (item.get("image") or "").strip()
    if img.startswith("/"):
        path = (SRC / img.lstrip("/")).resolve()
        if path.is_file() and SRC.resolve() in path.parents:
            return path, item.get("title", "")
    return (SITE_OG if SITE_OG.exists() else None), SITE_OG_ALT


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
        url = (it.get("url") or "").strip()
        if not url:
            url = f"/news.html#news-{slugify(it['title'])}"
        if "://" not in url:
            url = SITE + url
        image, alt = _image(it)
        posts.append(Post(
            key=item_key(it),
            title=it["title"].strip(),
            summary=(social.get("text") or it.get("excerpt") or "").strip(),
            link=url,
            image=image,
            image_alt=alt,
            collaborator=(social.get("collaborator") or "").strip().lower(),
        ))
    return posts


URL_RE = re.compile(r"https?://[^\s\]\)]+")


def find_links(text: str) -> list[tuple[str, int, int]]:
    """(url, byteStart, byteEnd) for each link, over the UTF-8 bytes."""
    out = []
    for m in URL_RE.finditer(text):
        url = m.group(0).rstrip(").,;")
        bs = len(text[:m.start()].encode("utf-8"))
        out.append((url, bs, bs + len(url.encode("utf-8"))))
    return out


# --------------------------------------------------------------------------
# Ledger
# --------------------------------------------------------------------------
def load_ledger() -> dict:
    data = json.loads(LEDGER.read_text(encoding="utf-8")) if LEDGER.exists() else {}
    data.setdefault("posted", [])
    return data


def save_ledger(data: dict) -> None:
    LEDGER.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def pending(ledger: dict) -> list[Post]:
    posted = set(ledger.get("posted", []))
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

    def _image_embed(self, auth: dict, image: Path, alt: str) -> dict:
        img = {"alt": alt, "image": self._upload(auth, image)}
        size = image_size(image)
        if size:
            img["aspectRatio"] = {"width": size[0], "height": size[1]}
        return {"$type": "app.bsky.embed.images", "images": [img]}

    def publish(self, post: Post) -> str:
        auth, did = self._login()
        text = post.render("bluesky")
        record = {
            "$type": "app.bsky.feed.post",
            "text": text,
            "langs": ["en"],
            "createdAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        }
        facets = [{"index": {"byteStart": bs, "byteEnd": be},
                   "features": [{"$type": "app.bsky.richtext.facet#link", "uri": url}]}
                  for url, bs, be in find_links(text)]
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
            "commentary": li_little_text(post.render("linkedin")),
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
    ap = argparse.ArgumentParser(description="Post EISS news to LinkedIn and Bluesky (#2056).")
    ap.add_argument("--dry-run", action="store_true", help="print posts, publish nothing (default)")
    ap.add_argument("--live", action="store_true", help="publish through the configured channels")
    ap.add_argument("--channel", choices=["bluesky", "linkedin", "all"], default="all")
    ap.add_argument("--count", action="store_true", help="print the number of pending items only")
    ap.add_argument("--seed", action="store_true", help="record every current item as posted")
    args = ap.parse_args()

    ledger = load_ledger()
    posts = pending(ledger)

    if args.seed:
        ledger["posted"] += [p.key for p in posts]
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
        for p in posts:
            print(f"* {p.title}  (key: {p.key})")
            for ch in ("bluesky", "linkedin"):
                print(f"  -- would post to {ch} --")
                for line in p.render(ch).splitlines():
                    print(f"    {line}")
                print()
            if p.image:
                print(f"    [image: {p.image.relative_to(ROOT)} | alt: {p.image_alt}]")
            if p.collaborator:
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

    notes = []
    for p in posts:
        posted_any = False
        for c in active:
            try:
                url = c.publish(p)
            except SystemExit:
                if posted_any:  # keep the channel that succeeded from re-posting
                    ledger.setdefault("posted", []).append(p.key)
                    save_ledger(ledger)
                raise
            print(f"posted to {c.name}: {p.title}: {url}")
            posted_any = True
            if c.name == "linkedin" and p.collaborator:
                notes.append(f"- {p.title}: {url} Add the {p.collaborator} LinkedIn page as collaborator.")
        if posted_any:
            ledger.setdefault("posted", []).append(p.key)
            save_ledger(ledger)
    if notes:
        _summary(["### Collaborators to add by hand", ""] + notes)
    return 0


if __name__ == "__main__":
    sys.exit(main())
