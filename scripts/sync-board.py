#!/usr/bin/env python3
"""
Sync helper: refresh src/_data/board.json from a Google Sheet linked to
the EISS board-member bios Google Form.

Usage:
    python3 scripts/sync-board.py

What it does:
  1. Reads scripts/board-source.json for the Sheet's published-CSV URL,
     the column mapping, and the list of allowed roles. If `csv_url`
     is empty (initial state), exits cleanly — so the workflow stays
     green while the Form is still being set up.
  2. Fetches the Sheet as CSV; for each row, checks consent, then
     builds a per-person entry. `role` comes from the Form dropdown;
     `kind` (board / support) and `tier` (display order) come from the
     `roles` table in board-source.json — looked up by role label.
     A row whose role label isn't in the table is published as a
     Board Member at the bottom (so a typo in the Form doesn't drop the
     entry; you'll see it at PR-review time).
  3. Merges with the existing src/_data/board.json:
       - Submissions are deduped first by email (newest wins), then by
         name slug across the email-deduped set (so the same person
         submitting from two emails doesn't appear twice).
       - Existing entries that don't match any submission (by name
         slug) are preserved — this is the transitional state while
         board members are still filling the Form.
       - Existing entries whose role label still exists in the roles
         table inherit their tier from there; otherwise they default
         to Board Member (tier 100).
       - No entries are removed by the sync. To remove someone, edit
         src/_data/board.json directly in a PR (see docs/board-bios-setup.md).
  4. Sorts each output section by (tier ASC, surname ASC).
  5. Writes src/_data/board.json only if the content has actually
     changed — so re-running the script when nothing has moved leaves
     a clean working tree.
  6. Prints a human-readable diff (added / removed / updated) plus
     warnings for likely-bad submissions (unknown role, two people
     claiming the same leadership title).

Requires: requests. Pillow is optional — used to optimise photos if
available; if not, photos are saved as-is.
"""
from __future__ import annotations

import csv
import io
import json
import os
import re
import sys
import unicodedata
from collections import Counter
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    import requests
except ImportError:
    sys.exit("Install deps: pip install -r scripts/requirements.txt")

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "scripts" / "board-source.json"
BOARD = ROOT / "src" / "_data" / "board.json"
PHOTO_DIR = ROOT / "src" / "assets" / "images" / "board"

MAX_PHOTO_WIDTH = 600
DEFAULT_ROLE = {"label": "Board Member", "kind": "board", "tier": 100}

# Repo-relative paths of photo files whose bytes were rewritten during
# the current run. Filled by download_photo() each time a new image
# differs from what's already on disk. Used by main()'s "did anything
# change?" check so a photo update doesn't get silently swallowed when
# the board.json `photo` field string is unchanged (path stays the
# same; only the file bytes change).
PHOTOS_CHANGED: list[str] = []

# ──────────────────────────── helpers ────────────────────────────


def norm_email(s: str) -> str:
    return (s or "").strip().lower()


# Honorific tokens we strip from the *start* of a name before keying.
# Case-insensitive at match time. Mirrors the equivalent regex in
# src/_data/boardSorted.js — keep the two in lockstep. Covers academic
# titles, French/Spanish/Portuguese variants, and the military ranks
# that have shown up in ESSC programmes. Multiple consecutive titles
# (e.g. "Lt Gen Dr Thomas Nilsson") are stripped via the two-pass loop
# in identity_key().
HONORIFIC_RE = re.compile(
    r"^(?:dr|prof(?:essor)?|pr|mr|ms|mrs|mx|"
    r"lic|lt\s+gen(?:eral)?|lieutenant\s+general|general|"
    r"colonel|admiral)\.?\s+",
    re.IGNORECASE,
)


def _strip_honorifics_and_diacritics(name: str) -> str:
    """Lower-case, strip diacritics, drop up to two leading honorifics
    (covers e.g. 'Lt Gen Dr X'). Used by both slugify() and
    identity_key()."""
    s = unicodedata.normalize("NFKD", name or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    for _ in range(2):  # at most two leading honorifics
        m = HONORIFIC_RE.match(s)
        if not m:
            break
        s = s[m.end():]
    return s.lower().strip()


def slugify(name: str) -> str:
    """Stable slug from a person's name. Lowercases, strips diacritics
    + honorifics + apostrophes, collapses non-alphanumerics to hyphens.
    Used for photo filenames + as a secondary identity key during
    dedup (after identity_key() does the heavy lifting)."""
    s = _strip_honorifics_and_diacritics(name)
    s = re.sub(r"[‘’ʼ'`]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "member"


def identity_key(name: str) -> str:
    """First-token + last-token identity key for cross-format matching.
    Collapses middle initials and middle names so 'Dr Arthur PB Laudrain'
    and 'Arthur Laudrain' map to the same key 'arthur laudrain'.
    Two people on the EISS board who share both first and last name
    would collide here; we surface that case as a warning rather than
    silently merging.

    Mirrors the equivalent helper in src/_data/boardSorted.js — keep
    the two in lockstep."""
    s = _strip_honorifics_and_diacritics(name)
    s = re.sub(r"[‘’ʼ'`]", "", s)
    tokens = re.findall(r"[a-z0-9]+", s)
    if not tokens:
        return ""
    if len(tokens) == 1:
        return tokens[0]
    return f"{tokens[0]} {tokens[-1]}"


def surname_key(name: str) -> str:
    """Best-effort surname extraction for alphabetical sorting. Strips
    the title prefix (Dr / Prof / etc.) then takes the last whitespace-
    separated token, lowercased and stripped of diacritics. Works for
    common cases ('Dr Hugo Meijer' → 'meijer', 'Prof. Silvia D'Amato'
    → 'damato'); names with multi-word surnames may sort by the last
    word only, which is acceptable for a 22-person list."""
    s = re.sub(r"^(Dr|Prof|Mr|Ms|Mrs)\.?\s+", "", (name or "").strip())
    if not s:
        return ""
    last = s.split()[-1]
    last = unicodedata.normalize("NFKD", last)
    last = "".join(c for c in last if not unicodedata.combining(c))
    last = re.sub(r"[‘’ʼ'`]", "", last).lower()
    return re.sub(r"[^a-z0-9]+", "", last)


def parse_timestamp(raw: str) -> float:
    """Google-Forms timestamp string → epoch seconds. Format depends on
    form-owner's locale at sheet creation. Returns 0.0 for unparseable
    values so older entries lose to newer ones in dedup."""
    if not raw:
        return 0.0
    raw = raw.strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
    ):
        try:
            return datetime.strptime(raw, fmt).timestamp()
        except ValueError:
            continue
    return 0.0


def consent_ok(raw: str) -> bool:
    """Treat anything explicit-looking as consent. The Form requires
    consent, so a blank value would only happen if the column rename
    slipped past us — fail open rather than silently drop everything."""
    if not raw:
        return True
    v = raw.strip().lower()
    return any(t in v for t in ("yes", "agree", "✓", "consent", "true", "oui", "ja"))


# ──────────────────────────── Drive photos ────────────────────────────


def drive_file_id(url: str) -> str | None:
    """Extract a Google Drive file ID from any common URL form."""
    if not url:
        return None
    m = re.search(r"/file/d/([a-zA-Z0-9_-]+)", url)
    if m:
        return m.group(1)
    qs = parse_qs(urlparse(url).query)
    if "id" in qs:
        return qs["id"][0]
    return None


def download_photo(url: str, dest_no_ext: Path) -> str | None:
    """Download a photo, optimise if Pillow available, return path
    relative to site root (e.g. '/assets/images/board/meijer.jpg') or
    None on failure. Writes to disk only if the bytes differ from
    what's already there — libjpeg quantisation is not bit-stable
    across PIL runs, so unconditional rewrites would dirty the tree
    on every idempotent rerun."""
    if not url:
        return None
    file_id = drive_file_id(url)
    fetch_url = (
        f"https://drive.google.com/uc?export=download&id={file_id}"
        if file_id else url
    )
    try:
        r = requests.get(fetch_url, timeout=30, allow_redirects=True)
        r.raise_for_status()
        data = r.content
    except Exception as e:
        print(f"  ! photo download failed for {url}: {e}", file=sys.stderr)
        return None

    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    dest = dest_no_ext.with_suffix(".jpg")
    out_bytes: bytes

    if HAS_PIL:
        try:
            img = Image.open(io.BytesIO(data))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            if img.width > MAX_PHOTO_WIDTH:
                ratio = MAX_PHOTO_WIDTH / img.width
                img = img.resize(
                    (MAX_PHOTO_WIDTH, int(img.height * ratio)),
                    Image.LANCZOS,
                )
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=82, optimize=True)
            out_bytes = buf.getvalue()
        except Exception as e:
            print(f"  ! photo decode failed: {e}", file=sys.stderr)
            out_bytes = data
    else:
        out_bytes = data

    bytes_changed = not (dest.exists() and dest.read_bytes() == out_bytes)
    if bytes_changed:
        dest.write_bytes(out_bytes)
        # Track on the module so main() can include photo-file changes
        # in its "did anything change?" decision. board.json paths
        # don't change when only the photo bytes change (the URL path
        # stays the same), so without this we'd silently swallow new
        # uploads.
        PHOTOS_CHANGED.append(dest.relative_to(ROOT).as_posix())

    rel = dest.relative_to(ROOT).as_posix()
    # board.json paths are absolute-from-site-root (e.g. /assets/...);
    # rel is repo-relative (src/assets/...), so swap the prefix.
    return "/" + rel.removeprefix("src/")


# ──────────────────────────── core build ────────────────────────────


def _cell(row: dict, cols: dict, key: str) -> str:
    """Read a cell from the form row by mapped column name. Returns the
    trimmed string, or "" when missing."""
    col_name = cols.get(key, "")
    if not col_name:
        return ""
    return (row.get(col_name, "") or "").strip()


# Google Forms' Date question writes values as YYYY-MM-DD by default in
# the linked Sheet, but the respondent can also type free-text into a
# Short-answer question. _normalize_date() accepts the common shapes
# we've actually seen (YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY, MM/DD/YYYY)
# and emits a canonical ISO `YYYY-MM-DD` string. Anything it can't parse
# returns "" so boardSorted.js leaves the entry permanent rather than
# silently expiring it on garbage input.
_DATE_PATTERNS = [
    "%Y-%m-%d",       # 2026-06-30 (Google Forms default)
    "%d/%m/%Y",       # 30/06/2026 (FR/UK)
    "%d.%m.%Y",       # 30.06.2026 (DE)
    "%Y/%m/%d",       # 2026/06/30
    "%m/%d/%Y",       # 06/30/2026 (US — accept last because it's most
                      # ambiguous with the FR form)
]


def _normalize_date(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        return ""
    from datetime import datetime
    for fmt in _DATE_PATTERNS:
        try:
            d = datetime.strptime(s, fmt)
            return d.strftime("%Y-%m-%d")
        except ValueError:
            continue
    print(
        f"  ⚠ unparseable roleEndDate {s!r} — leaving entry permanent.",
        file=sys.stderr,
    )
    return ""


## (No-op kept for git-history clarity.)
##
## _join_affiliation() used to merge the Form's separate Position +
## Institution fields into a single "Position — Institution" string
## stored as `affiliation` on each entry. Removed when the card
## switched to rendering Position + Institution on separate lines
## (with the country flag inline on the institution line). The two
## fields are now stored as-is in board.json.


# Map of board.json `links` keys → board-source.json `columns` keys.
# Centralised here so the form-driven URL set stays in sync between
# extract (build_from_row) and merge (carry_over).
LINK_FIELDS = {
    "publicEmail": "publicEmail",
    "website": "website",
    "orcid": "orcid",
    "linkedin": "linkedin",
    "twitter": "twitter",
    "bluesky": "bluesky",
    "mastodon": "mastodon",
}

# ORCID iDs are 16 characters in NNNN-NNNN-NNNN-NNNC form (the final
# character is a checksum digit, occasionally "X").
_ORCID_ID_RE = re.compile(r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$")


def _normalize_link(out_key: str, value: str) -> str:
    """Normalise a profile-link value to an absolute URL.

    The board card template (`src/_includes/person-card.njk`) drops
    `links.*` straight into `href`, so a value without a scheme (a bare
    domain like "example.com", or a bare ORCID iD like
    "0000-0001-9311-6480") would resolve as a path on eiss-europa.com and
    404. A respondent typing either into the Form is the likely source.
    Mirror of the `extLink` Nunjucks filter in .eleventy.js, applied here
    so board.json is stored clean at the source rather than relying on
    the render-time backstop.

    `publicEmail` is left untouched (the template renders it as mailto:).
    Idempotent: an already-absolute URL is returned unchanged."""
    v = (value or "").strip()
    if not v or out_key == "publicEmail":
        return v
    if v.startswith(("http://", "https://", "//")):
        return v
    if out_key == "orcid" and _ORCID_ID_RE.match(v):
        return f"https://orcid.org/{v}"
    return f"https://{v}"


def build_from_row(row: dict, cols: dict, role_info: dict, prior: dict | None) -> dict:
    """Build a board.json entry from one form submission, falling back
    to fields from `prior` (the existing board.json entry for this
    person, if any) when the submission left a field blank.

    The form collects much richer data than the page currently surfaces
    (working-group involvement, country, social-media URLs). Everything
    is captured into board.json; the template decides what to render
    based on field presence."""
    # Name + honorific title. The Form collects the title as a separate
    # dropdown (Prof. / Dr / M / Mr / Mx / None) from the full name, so we
    # prepend it here to keep the rendered "Prof. Jane Doe" format the card
    # has always shown. A "None"/blank title prepends nothing. slugify() and
    # identity_key() strip honorifics, so splitting the title out of the name
    # field doesn't move a person's anchor. A submission with no name at all
    # keeps the prior entry's name verbatim (already title-prefixed).
    TITLE_NULL_SENTINELS = {"", "none"}
    full_name = _cell(row, cols, "name")
    title = _cell(row, cols, "title")
    if full_name:
        name = f"{title} {full_name}".strip() if title.lower() not in TITLE_NULL_SENTINELS else full_name
    else:
        name = (prior or {}).get("name", "")
    person: dict = {
        "name": name,
        "role": role_info["label"],
        "alt": name,
    }

    # Photo: new upload wins; otherwise inherit prior.
    photo_url = _cell(row, cols, "photo")
    photo_path = None
    if photo_url:
        photo_path = download_photo(photo_url, PHOTO_DIR / slugify(name))
    if photo_path:
        person["photo"] = photo_path
    elif prior and prior.get("photo"):
        person["photo"] = prior["photo"]
    else:
        person["photo"] = ""

    # Functional responsibility — separate from role, rendered as a
    # pill alongside the role on the card. Optional; we accept any
    # string the form provides but warn when it's outside the known
    # set (forward-compatible if the operator adds new options).
    #
    # The "I don't have one" sentinels are dropped here rather than
    # stored — otherwise the template renders a meaningless "NONE"
    # pill alongside the role. We normalise case + whitespace so
    # variants ("none", "None", "(None — leave blank)", etc.) all
    # collapse to "no field set".
    FUNC_RESP_NULL_SENTINELS = {
        "", "none", "(none)", "(none — leave blank)",
        "(none - leave blank)", "n/a", "na",
    }
    func_resp = _cell(row, cols, "functionalResponsibility")
    if not func_resp and prior:
        func_resp = prior.get("functionalResponsibility", "")
    if func_resp and func_resp.strip().lower() not in FUNC_RESP_NULL_SENTINELS:
        person["functionalResponsibility"] = func_resp

    # Position + institution stay as separate fields on the entry so
    # the card can render them on dedicated lines (with the country
    # flag inline on the institution line). Each falls back to the
    # prior value when blank in the new submission.
    position = _cell(row, cols, "position") or (prior or {}).get("position", "")
    institution = _cell(row, cols, "institution") or (prior or {}).get("institution", "")
    if position:
        person["position"] = position
    if institution:
        person["institution"] = institution

    # Country: separate field rendered as a flag icon inline on the
    # institution line (or as a fallback map-pin + text line when no
    # flag SVG is mapped for the country).
    country = _cell(row, cols, "country") or (prior or {}).get("country", "")
    if country:
        person["country"] = country

    # Bio is now available for every entry (board members AND support
    # staff). The card decides what to render: teaser + Read-more
    # expander when long, single paragraph when short.
    bio = _cell(row, cols, "bio") or (prior or {}).get("bio", "")
    if bio:
        person["bio"] = bio

    # Themes (was "research themes" — the form calls them keywords).
    themes = _cell(row, cols, "themes") or (prior or {}).get("themes", "")
    if themes:
        person["themes"] = themes

    # Social-media + ORCID + website links. Nested under `links` so
    # they're easy to spot in board.json + don't clutter the top-level
    # entry. Each key is independent — any subset may be present.
    links: dict = {}
    prior_links = (prior or {}).get("links", {}) or {}
    for out_key, col_key in LINK_FIELDS.items():
        v = _cell(row, cols, col_key) or prior_links.get(out_key, "")
        if v:
            links[out_key] = _normalize_link(out_key, v)
    if links:
        person["links"] = links

    # Working-group involvement — comma-separated list from the form's
    # multi-select checkboxes. Stored verbatim; the template doesn't
    # render it yet (deferred until WG structure is settled).
    working_groups = _cell(row, cols, "workingGroups") or (prior or {}).get("workingGroups", "")
    if working_groups:
        person["workingGroups"] = working_groups

    # Role end-date for time-bound roles (interns, visiting fellows,
    # fixed-term contracts). Normalised to ISO `YYYY-MM-DD` if the
    # respondent typed a recognisable date; left out of the entry if
    # the field is blank or unparseable. boardSorted.js applies a
    # 7-day grace then moves the entry to the folded "Past board
    # members and interns" footer.
    role_end_raw = _cell(row, cols, "roleEndDate")
    role_end = _normalize_date(role_end_raw) if role_end_raw else ""
    if not role_end:
        role_end = (prior or {}).get("roleEndDate", "")
    if role_end:
        person["roleEndDate"] = role_end

    # Slug + alt are preserved across syncs if the prior entry has them
    # (a hand-set slug for deep linking, or a custom alt for a11y).
    #
    # `photoOverride` is also preserved as-is. Google Forms doesn't let
    # respondents replace a file upload when editing an existing
    # response, so the only path to swap a headshot is hand-editing
    # board.json: the operator uploads a new file to
    # src/assets/images/board/ and sets `photoOverride` to its path.
    # The template prefers photoOverride > photo, and the sync never
    # touches this field — so a manual swap survives every future
    # Form-driven update.
    if prior:
        if prior.get("slug"):
            person["slug"] = prior["slug"]
        if prior.get("alt"):
            person["alt"] = prior["alt"]
        if prior.get("photoOverride"):
            person["photoOverride"] = prior["photoOverride"]

    return person


def carry_over(prior: dict, roles_map: dict[str, dict]) -> tuple[dict, dict]:
    """Existing entry has no matching submission yet: return it
    unchanged, paired with a synthesised role_info for sorting (looked
    up from the roles table by the entry's existing `role` string)."""
    role_info = roles_map.get(prior.get("role", ""), DEFAULT_ROLE)
    return dict(prior), role_info


# ──────────────────────────── orchestration ────────────────────────────


def load_prior() -> tuple[dict, dict[str, dict], dict[str, dict]]:
    """Return (raw board.json data, slug → entry, identity_key → entry)
    for every existing entry across both members + support.

    Two indices: `slug` is the strict legacy match (used for the
    URL-fragment anchor + photo filenames), `identity_key` is the
    first-token-last-token fuzzy match that survives middle-initial
    drift, honorific changes, etc. The sync prefers identity-key when
    the two diverge — and logs the divergence so the reviewer sees it."""
    raw = json.loads(BOARD.read_text())
    by_slug: dict[str, dict] = {}
    by_identity: dict[str, dict] = {}
    for p in raw.get("members", []) + raw.get("support", []):
        by_slug[slugify(p["name"])] = p
        ik = identity_key(p["name"])
        if ik:
            by_identity[ik] = p
    return raw, by_slug, by_identity


def dedupe_submissions(rows: list[dict], cols: dict) -> list[dict]:
    """Reduce CSV rows to a list of one submission per person. Three-
    pass dedup, in priority order:
      1. email — same Google account → keep latest by timestamp
      2. identity_key (first + last token) — same person from two
         different Google accounts, or with middle initials added /
         removed, or honorific changed
      3. slug — strict fallback, mostly redundant with (2) but cheap

    Each later pass only sees submissions the earlier passes haven't
    already collapsed away. Logs a `~ collapsed` line when (2) catches
    a near-match across email boundaries — surfaces the assumption
    that two different emails belong to the same person so the PR
    reviewer can sanity-check."""
    ts_col = cols.get("timestamp", "")
    name_col = cols.get("name", "")

    def ts_of(r: dict) -> float:
        return parse_timestamp(r.get(ts_col, ""))

    # Pass 1: email dedup
    by_email: dict[str, dict] = {}
    no_email: list[dict] = []
    for raw_row in rows:
        row = {(k or "").strip(): v for k, v in raw_row.items()}
        if not consent_ok(row.get(cols.get("consent", ""), "")):
            print(
                f"  · skipping (no consent): "
                f"{row.get(name_col, '') or '<unnamed>'}",
                file=sys.stderr,
            )
            continue
        email = norm_email(row.get(cols.get("email", ""), ""))
        if not email:
            no_email.append(row)
            continue
        if email in by_email and ts_of(by_email[email]) >= ts_of(row):
            continue
        by_email[email] = row

    # Pass 2: identity-key dedup across the email-pass survivors.
    # When two different emails resolve to the same first+last name,
    # we treat them as the same person and keep the latest. We log
    # the collapse so the reviewer can spot a false positive (very
    # rare but worth surfacing).
    by_identity: dict[str, dict] = {}
    for row in list(by_email.values()) + no_email:
        name = row.get(name_col, "")
        ik = identity_key(name)
        if not ik:
            continue
        if ik in by_identity:
            other = by_identity[ik]
            other_name = other.get(name_col, "")
            other_email = norm_email(other.get(cols.get("email", ""), ""))
            this_email = norm_email(row.get(cols.get("email", ""), ""))
            # Same identity key + different emails OR different names
            # → loud "collapsed" note. The script keeps the newer one
            # silently, the reviewer eyeballs the warning.
            if other_email != this_email or other_name != name:
                kept = row if ts_of(row) > ts_of(other) else other
                dropped = other if kept is row else row
                print(
                    f"  ~ collapsed {dropped.get(name_col, '')!r} "
                    f"<{norm_email(dropped.get(cols.get('email', ''), ''))}> "
                    f"into {kept.get(name_col, '')!r} "
                    f"<{norm_email(kept.get(cols.get('email', ''), ''))}> "
                    f"(same first+last name). Verify they're the same "
                    "person before merging.",
                    file=sys.stderr,
                )
            if ts_of(by_identity[ik]) >= ts_of(row):
                continue
        by_identity[ik] = row

    # Pass 3: slug fallback. Mostly redundant with identity-key but
    # cheap insurance for the edge case where two submissions have
    # *no* email AND identity_key returns "" (e.g. CJK names).
    by_slug: dict[str, dict] = {}
    for row in by_identity.values():
        slug = slugify(row.get(name_col, ""))
        if not slug:
            continue
        if slug in by_slug and ts_of(by_slug[slug]) >= ts_of(row):
            continue
        by_slug[slug] = row

    return list(by_slug.values())


def warn_on_duplicates(entries: list[dict], roles_map: dict[str, dict]) -> None:
    """Print a loud warning if two submissions claim the same
    leadership role (unique tiers — anything below 100). Doesn't
    block; surfaces the conflict for the PR reviewer."""
    counts = Counter(e["role"] for e in entries)
    for role, n in counts.items():
        info = roles_map.get(role)
        if not info or info["tier"] >= 100:
            continue
        if n > 1:
            print(
                f"  ⚠ {n} submissions claim role {role!r} — verify "
                "this is intended before merging.",
                file=sys.stderr,
            )


def diff_summary(old: dict, new: dict) -> str:
    def by_name(d: dict, key: str) -> dict[str, dict]:
        return {p["name"]: p for p in d.get(key, [])}

    lines: list[str] = []
    for kind_key in ("members", "support"):
        old_p = by_name(old, kind_key)
        new_p = by_name(new, kind_key)
        added = sorted(set(new_p) - set(old_p))
        removed = sorted(set(old_p) - set(new_p))
        changed = [
            n for n in sorted(set(old_p) & set(new_p))
            if json.dumps(old_p[n], sort_keys=True)
            != json.dumps(new_p[n], sort_keys=True)
        ]
        lines.append(f"{kind_key}: {len(new_p)} (was {len(old_p)})")
        for n in added:
            lines.append(f"  + {n}")
        for n in removed:
            lines.append(f"  - {n}")
        for n in changed:
            lines.append(f"  ~ {n}")
    return "\n".join(lines)


def compute_pr_title(
    prior_raw: dict, new_data: dict, photos_changed: list[str]
) -> str | None:
    """Compose a short, situation-specific PR title for the auto-sync
    PR that the workflow opens. Returns None when nothing changed
    (the workflow won't open a PR in that case anyway).

    Cases:
      - photo-only, 1 person: "data: refresh headshot for <name>"
      - photo-only, N people: "data: refresh N headshots"
      - 1 addition:           "data: add <name> to the board"
      - 1 removal:            "data: remove <name> from the board"
      - 1 update:             "data: update bio for <name>"
      - everything else:      "data: sync board bios (N changes)"
    """
    def by_name(d: dict) -> dict[str, dict]:
        return {p["name"]: p for p in d.get("members", []) + d.get("support", [])}

    old_p, new_p = by_name(prior_raw), by_name(new_data)
    added = sorted(set(new_p) - set(old_p))
    removed = sorted(set(old_p) - set(new_p))
    changed = sorted(
        n for n in (set(old_p) & set(new_p))
        if json.dumps(old_p[n], sort_keys=True)
        != json.dumps(new_p[n], sort_keys=True)
    )
    n_json = len(added) + len(removed) + len(changed)
    n_photo = len(photos_changed)

    if n_json == 0 and n_photo == 0:
        return None

    # Photo-only change(s) — surface the case the previous version of
    # this script swallowed.
    if n_json == 0 and n_photo > 0:
        if n_photo == 1:
            slug = Path(photos_changed[0]).stem  # e.g. "arthur-laudrain"
            name = next(
                (n for n in new_p if slugify(n) == slug),
                slug.replace("-", " ").title(),
            )
            return f"data: refresh headshot for {name}"
        return f"data: refresh {n_photo} headshots"

    # Single, unambiguous JSON change → describe it specifically.
    if n_photo == 0 and len(added) == 1 and not removed and not changed:
        return f"data: add {added[0]} to the board"
    if n_photo == 0 and not added and len(removed) == 1 and not changed:
        return f"data: remove {removed[0]} from the board"
    if n_photo == 0 and not added and not removed and len(changed) == 1:
        return f"data: update bio for {changed[0]}"

    # Everything else (multi-change runs, mixed JSON + photo) — fall
    # back to a count.
    total = n_json + n_photo
    plural = "" if total == 1 else "s"
    return f"data: sync board bios ({total} change{plural})"


def emit_github_output(key: str, value: str) -> None:
    """Write `key=value` to $GITHUB_OUTPUT when running under GitHub
    Actions, so the next workflow step can read it as a step output.
    No-op outside CI."""
    path = os.environ.get("GITHUB_OUTPUT")
    if not path:
        return
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"{key}={value}\n")


# Human-readable labels for the fields the form populates. Used by the
# rich PR body to describe what changed on an updated entry. Keep the
# label short — these end up in a comma-separated list per person.
FIELD_LABELS: dict[str, str] = {
    "bio": "bio",
    "affiliation": "affiliation",
    "themes": "research keywords",
    "country": "country",
    "role": "role",
    "functionalResponsibility": "functional responsibility",
    "photo": "headshot path",
    "alt": "alt text",
    "workingGroups": "working groups",
    "roleEndDate": "role end-date",
}
LINK_LABELS: dict[str, str] = {
    "publicEmail": "public email",
    "website": "website",
    "orcid": "ORCID",
    "linkedin": "LinkedIn",
    "twitter": "X / Twitter",
    "bluesky": "Bluesky",
    "mastodon": "Mastodon",
}


def describe_field_changes(old: dict, new: dict) -> list[str]:
    """Return a list of human-readable field names that differ between
    `old` and `new` entries. Used in the rich PR body's "Updated
    members" section to surface exactly what each respondent changed."""
    changes: list[str] = []
    for key, label in FIELD_LABELS.items():
        if old.get(key) != new.get(key):
            changes.append(label)
    old_links = old.get("links") or {}
    new_links = new.get("links") or {}
    for key, label in LINK_LABELS.items():
        if old_links.get(key) != new_links.get(key):
            changes.append(label)
    return changes


def compose_rich_body(
    prior_raw: dict, new_data: dict, photos_changed: list[str]
) -> str:
    """Build a Markdown-rich auto-PR body. Sections cover:
      - New members (name · country · _affiliation_)
      - Updated members (name: comma-separated field labels)
      - Removed members (name)
      - Headshot files updated (paths)

    Excludes the run-log section — that's appended by the workflow
    from the script's stdout, after this body is composed."""
    def by_name(d: dict) -> dict[str, dict]:
        return {p["name"]: p for p in d.get("members", []) + d.get("support", [])}

    old, new = by_name(prior_raw), by_name(new_data)
    added = sorted(set(new) - set(old))
    removed = sorted(set(old) - set(new))
    # Map photo paths to person slugs so we can annotate each Updated
    # entry with "+ headshot" when their image was rewritten.
    photo_slugs = {Path(p).stem for p in photos_changed}
    persons_with_photo_change = {
        n for n in (set(old) & set(new)) if slugify(n) in photo_slugs
    }
    # "Updated" = anyone whose entry's JSON differs OR whose photo
    # bytes changed on disk. The latter alone won't appear in the
    # JSON diff (the `photo` path string stays the same), so we union
    # them in to catch the photo-only case.
    json_changed = {
        n for n in (set(old) & set(new))
        if json.dumps(old[n], sort_keys=True)
        != json.dumps(new[n], sort_keys=True)
    }
    changed = sorted(json_changed | persons_with_photo_change)

    lines: list[str] = ["## What changed", ""]

    if added:
        lines.append(f"### New members ({len(added)})")
        for n in added:
            p = new[n]
            extras: list[str] = []
            if p.get("country"):
                extras.append(p["country"])
            if p.get("affiliation"):
                extras.append(f"_{p['affiliation']}_")
            line = f"- **{n}**"
            if extras:
                line += " · " + " · ".join(extras)
            lines.append(line)
        lines.append("")

    if changed:
        lines.append(f"### Updated members ({len(changed)})")
        for n in changed:
            field_changes = describe_field_changes(old[n], new[n])
            person_slug = slugify(n)
            photo_changed = person_slug in photo_slugs
            if photo_changed:
                # Photo bytes changed on disk but the `photo` path
                # string might be unchanged — promote it as an
                # explicit "+ headshot" suffix instead of mixing in
                # with the per-field list.
                suffix = " + headshot"
            else:
                suffix = ""
            if field_changes:
                lines.append(f"- **{n}**: {', '.join(field_changes)}{suffix}")
            elif photo_changed:
                lines.append(f"- **{n}**: headshot replaced")
            else:
                # Shouldn't reach here (changed implies *something*
                # differs), but stay defensive.
                lines.append(f"- **{n}**: (other)")
        lines.append("")

    if removed:
        lines.append(f"### Removed members ({len(removed)})")
        for n in removed:
            lines.append(f"- **{n}**")
        lines.append("")

    # Standalone "Headshot files" section gives the paths for code
    # review. Includes photos whose person's other fields didn't
    # change too — useful so reviewers see the file diff list at a
    # glance even when the JSON diff hides it.
    if photos_changed:
        lines.append(f"### Headshot files updated ({len(photos_changed)})")
        for p in photos_changed:
            lines.append(f"- `{p}`")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def emit_pr_body_file(prior_raw: dict, new_data: dict, photos_changed: list[str]) -> None:
    """Write the rich PR body to $SYNC_BOARD_BODY_FILE when set (the
    workflow points it at /tmp/...). The workflow appends its own
    run-log footer."""
    path = os.environ.get("SYNC_BOARD_BODY_FILE")
    if not path:
        return
    body = compose_rich_body(prior_raw, new_data, photos_changed)
    Path(path).write_text(body, encoding="utf-8")


def main() -> None:
    config = json.loads(CONFIG.read_text())
    csv_url = (config.get("sheet", {}).get("csv_url") or "").strip()
    if not csv_url:
        print("board-source.json has no csv_url set — exiting cleanly.")
        print("See docs/board-bios-setup.md to wire up the Google Form.")
        return

    cols = config.get("columns", {})
    # Two indices into the roles table:
    #  - roles_map: canonical-label → role row (used everywhere downstream)
    #  - roles_by_form_label: every "Form-side" name (label OR any alias)
    #    → the same role row. Form dropdowns sometimes get cosmetic edits
    #    (e.g. "Support Staff" → "Support Staff (incl. intern)") to clarify
    #    for respondents; aliases let those edits land without rewriting
    #    board.json or splitting the canonical taxonomy.
    roles_map = {r["label"]: r for r in config.get("roles", [])}
    if not roles_map:
        sys.exit("board-source.json has no `roles` table — refusing to run.")
    roles_by_form_label = dict(roles_map)
    for r in config.get("roles", []):
        for alias in r.get("aliases", []) or []:
            roles_by_form_label.setdefault(alias, r)

    prior_raw, prior_by_slug, prior_by_identity = load_prior()

    # Fetch the Sheet
    print(f"Fetching {csv_url}")
    r = requests.get(csv_url, timeout=30)
    r.raise_for_status()
    text = r.content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    submissions = dedupe_submissions(list(reader), cols)

    # Build entries. Each entry gets a hidden `_sort` tuple stripped
    # before writing.
    members: list[dict] = []
    support: list[dict] = []
    matched_priors: set[int] = set()  # id() of prior entries we've claimed

    for row in submissions:
        name = (row.get(cols.get("name", ""), "") or "").strip()
        if not name:
            print("  · skipping submission with empty name", file=sys.stderr)
            continue
        slug = slugify(name)
        ik = identity_key(name)

        # Prior match: identity_key first (fuzzy, survives middle-
        # initial drift), slug fallback (strict). When identity_key
        # finds a prior whose strict slug differs from the new name's
        # slug, log it — the operator should see the rename happening.
        prior = prior_by_identity.get(ik) if ik else None
        if prior is None:
            prior = prior_by_slug.get(slug)
        elif slugify(prior["name"]) != slug:
            print(
                f"  ~ matched submission {name!r} to existing entry "
                f"{prior['name']!r} via first+last name. The entry's "
                "displayed name will be updated to the new form.",
                file=sys.stderr,
            )

        role_label = (row.get(cols.get("role", ""), "") or "").strip()
        # Match against canonical labels first, then any registered
        # aliases (cosmetic Form-side variants like "Support Staff
        # (incl. intern)"). The canonical role row is what gets stored.
        role_info = roles_by_form_label.get(role_label)
        if role_info is None:
            print(
                f"  ⚠ {name!r}: unknown role {role_label!r} — falling back "
                "to 'Board Member'. Add an entry (or alias) to the roles "
                "table in scripts/board-source.json if this Form value "
                "is intentional.",
                file=sys.stderr,
            )
            role_info = DEFAULT_ROLE

        entry = build_from_row(row, cols, role_info, prior)
        entry["_sort"] = (role_info["tier"], surname_key(name))

        if role_info["kind"] == "support":
            support.append(entry)
        else:
            members.append(entry)
        if prior is not None:
            matched_priors.add(id(prior))

    # Carry over existing entries that no submission matched. Using
    # id() so we don't re-add an entry that two indices both pointed at.
    for prior in prior_raw.get("members", []) + prior_raw.get("support", []):
        if id(prior) in matched_priors:
            continue
        entry, role_info = carry_over(prior, roles_map)
        entry["_sort"] = (role_info["tier"], surname_key(entry["name"]))
        if role_info["kind"] == "support":
            support.append(entry)
        else:
            members.append(entry)

    # Sort and strip the sort key
    members.sort(key=lambda e: e["_sort"])
    support.sort(key=lambda e: e["_sort"])
    for e in members + support:
        e.pop("_sort", None)

    warn_on_duplicates(members + support, roles_map)

    new_data = dict(prior_raw)
    new_data["members"] = members
    new_data["support"] = support

    json_unchanged = new_data == prior_raw

    if json_unchanged and not PHOTOS_CHANGED:
        print()
        print("No substantive changes — leaving src/_data/board.json untouched.")
        return

    # Emit the PR title + rich body for the workflow's create-pull-
    # request step. Computed before we mutate anything so the
    # functions see the before/after pair cleanly.
    title = compute_pr_title(prior_raw, new_data, PHOTOS_CHANGED)
    if title:
        emit_github_output("title", title)
    emit_pr_body_file(prior_raw, new_data, PHOTOS_CHANGED)

    if json_unchanged and PHOTOS_CHANGED:
        print()
        print(
            "board.json bytes unchanged, but headshot file(s) updated "
            "on disk — the create-pull-request action below will commit them:"
        )
        for p in PHOTOS_CHANGED:
            print(f"  ~ {p}")
        return

    print()
    print(diff_summary(prior_raw, new_data))
    if PHOTOS_CHANGED:
        print()
        print("Headshot file(s) updated on disk:")
        for p in PHOTOS_CHANGED:
            print(f"  ~ {p}")

    BOARD.write_text(
        json.dumps(new_data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
