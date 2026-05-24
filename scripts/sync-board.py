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

# ──────────────────────────── helpers ────────────────────────────


def norm_email(s: str) -> str:
    return (s or "").strip().lower()


def slugify(name: str) -> str:
    """Stable slug from a person's name. Strips diacritics, titles, and
    apostrophes before collapsing non-alphanumerics to hyphens. Used
    for photo filenames AND for matching submissions against existing
    board.json entries during the transitional period."""
    s = unicodedata.normalize("NFKD", name or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"^(Dr|Prof|Mr|Ms|Mrs)\.?\s+", "", s)
    s = s.lower()
    s = re.sub(r"[‘’ʼ'`]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "member"


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

    if not (dest.exists() and dest.read_bytes() == out_bytes):
        dest.write_bytes(out_bytes)

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


def _join_affiliation(position: str, institution: str) -> str:
    """Join the two free-text fields into the single `affiliation` line
    that the card renders ("Position — Institution"). Either may be
    empty; in that case we render what we have without a stray dash."""
    p, i = position.strip(), institution.strip()
    if p and i:
        return f"{p} — {i}"
    return p or i


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


def build_from_row(row: dict, cols: dict, role_info: dict, prior: dict | None) -> dict:
    """Build a board.json entry from one form submission, falling back
    to fields from `prior` (the existing board.json entry for this
    person, if any) when the submission left a field blank.

    The form collects much richer data than the page currently surfaces
    (working-group involvement, country, social-media URLs). Everything
    is captured into board.json; the template decides what to render
    based on field presence."""
    name = _cell(row, cols, "name") or (prior or {}).get("name", "")
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
    func_resp = _cell(row, cols, "functionalResponsibility")
    if not func_resp and prior:
        func_resp = prior.get("functionalResponsibility", "")
    if func_resp:
        person["functionalResponsibility"] = func_resp

    # Affiliation is now stitched from the form's split fields. Falls
    # back to the prior single-field value if neither half is present
    # (i.e. existing entries that pre-date this Form shape).
    position = _cell(row, cols, "position")
    institution = _cell(row, cols, "institution")
    affiliation = _join_affiliation(position, institution)
    if not affiliation and prior:
        affiliation = prior.get("affiliation", "")
    if affiliation:
        person["affiliation"] = affiliation

    # Country: optional separate field, rendered as a small line below
    # the affiliation. Not joined into the affiliation string itself.
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
            links[out_key] = v
    if links:
        person["links"] = links

    # Working-group involvement — comma-separated list from the form's
    # multi-select checkboxes. Stored verbatim; the template doesn't
    # render it yet (deferred until WG structure is settled).
    working_groups = _cell(row, cols, "workingGroups") or (prior or {}).get("workingGroups", "")
    if working_groups:
        person["workingGroups"] = working_groups

    # Slug + alt are preserved across syncs if the prior entry has them
    # (a hand-set slug for deep linking, or a custom alt for a11y).
    if prior:
        if prior.get("slug"):
            person["slug"] = prior["slug"]
        if prior.get("alt"):
            person["alt"] = prior["alt"]

    return person


def carry_over(prior: dict, roles_map: dict[str, dict]) -> tuple[dict, dict]:
    """Existing entry has no matching submission yet: return it
    unchanged, paired with a synthesised role_info for sorting (looked
    up from the roles table by the entry's existing `role` string)."""
    role_info = roles_map.get(prior.get("role", ""), DEFAULT_ROLE)
    return dict(prior), role_info


# ──────────────────────────── orchestration ────────────────────────────


def load_prior() -> tuple[dict, dict[str, dict]]:
    """Return (raw board.json data, slug → existing entry across both
    members + support)."""
    raw = json.loads(BOARD.read_text())
    by_slug: dict[str, dict] = {}
    for p in raw.get("members", []) + raw.get("support", []):
        by_slug[slugify(p["name"])] = p
    return raw, by_slug


def dedupe_submissions(rows: list[dict], cols: dict) -> list[dict]:
    """Reduce CSV rows to a list of one submission per person. Two-pass
    dedup: first by email (newest wins), then by name slug across what
    survived (catches the case where the same person submitted from
    two different Google accounts)."""
    ts_col = cols.get("timestamp", "")

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
                f"{row.get(cols.get('name', ''), '') or '<unnamed>'}",
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

    # Pass 2: name-slug dedup across the survivors
    by_slug: dict[str, dict] = {}
    name_col = cols.get("name", "")
    for row in list(by_email.values()) + no_email:
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


def main() -> None:
    config = json.loads(CONFIG.read_text())
    csv_url = (config.get("sheet", {}).get("csv_url") or "").strip()
    if not csv_url:
        print("board-source.json has no csv_url set — exiting cleanly.")
        print("See docs/board-bios-setup.md to wire up the Google Form.")
        return

    cols = config.get("columns", {})
    roles_map = {r["label"]: r for r in config.get("roles", [])}
    if not roles_map:
        sys.exit("board-source.json has no `roles` table — refusing to run.")

    prior_raw, prior_by_slug = load_prior()

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
    matched_slugs: set[str] = set()

    for row in submissions:
        name = (row.get(cols.get("name", ""), "") or "").strip()
        if not name:
            print("  · skipping submission with empty name", file=sys.stderr)
            continue
        slug = slugify(name)
        prior = prior_by_slug.get(slug)
        role_label = (row.get(cols.get("role", ""), "") or "").strip()
        role_info = roles_map.get(role_label)
        if role_info is None:
            print(
                f"  ⚠ {name!r}: unknown role {role_label!r} — falling back "
                "to 'Board Member'. Fix the Form dropdown or the roles "
                "table in scripts/board-source.json if this is wrong.",
                file=sys.stderr,
            )
            role_info = DEFAULT_ROLE

        entry = build_from_row(row, cols, role_info, prior)
        entry["_sort"] = (role_info["tier"], surname_key(name))

        if role_info["kind"] == "support":
            support.append(entry)
        else:
            members.append(entry)
        matched_slugs.add(slug)

    # Carry over existing entries that no submission matched yet.
    for slug, prior in prior_by_slug.items():
        if slug in matched_slugs:
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

    if new_data == prior_raw:
        print()
        print("No substantive changes — leaving src/_data/board.json untouched.")
        return

    print()
    print(diff_summary(prior_raw, new_data))

    BOARD.write_text(
        json.dumps(new_data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
