#!/usr/bin/env python3
"""
Sync helper: refresh src/_data/board.json from a Google Sheet linked to
the EISS board-member bios Google Form.

Usage:
    python3 scripts/sync-board.py

What it does:
  1. Reads scripts/board-source.json for the sheet's published CSV URL.
     If the URL is empty (initial state), the script exits cleanly
     without touching anything — so the workflow stays green while the
     Google Form is still being set up.
  2. Reads scripts/board-roles.json — the canonical roster (who is on
     the board, their organisational role, and display order). Any form
     submission whose email isn't listed in the roster is dropped:
     board membership is by invitation, not self-signup.
  3. Fetches the Sheet as CSV; for each row, validates consent + email,
     downloads the headshot from Google Drive (if present), and assembles
     a per-person entry whose `role`/`order`/`kind` come from the roster,
     not the form.
  4. Merges with the existing src/_data/board.json:
       - Roster members who submitted: rebuilt from the submission, but
         photo + affiliation + themes fall back to the prior entry's
         values if the submission left them blank (so re-submitting
         with just a name update doesn't wipe their photo).
       - Roster members who haven't submitted yet: preserved from the
         prior board.json (matched by slug of name) — this is the
         transitional state where some members have filled the form
         and others haven't.
       - Anyone in the prior board.json who isn't in the roster: dropped.
  5. Writes src/_data/board.json deterministically, but only if the
     content actually changed — so re-running the script when nothing
     has moved leaves a clean working tree.
  6. Prints a human-readable diff (added / removed / updated).

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
ROSTER = ROOT / "scripts" / "board-roles.json"
BOARD = ROOT / "src" / "_data" / "board.json"
PHOTO_DIR = ROOT / "src" / "assets" / "images" / "board"
PHOTO_REL_PREFIX = "/assets/images/board"

MAX_PHOTO_WIDTH = 600

# ──────────────────────────── helpers ────────────────────────────


def norm_email(s: str) -> str:
    return (s or "").strip().lower()


def slugify(name: str) -> str:
    """Stable slug from a person's name. Strips diacritics, titles, and
    apostrophes before collapsing non-alphanumerics to hyphens. Used both
    for photo filenames and for matching existing board.json entries
    against the roster during the transitional period before everyone
    has submitted via the Form."""
    s = unicodedata.normalize("NFKD", name or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"^(Dr|Prof|Mr|Ms|Mrs)\.?\s+", "", s)
    s = s.lower()
    s = re.sub(r"[‘’ʼ'`]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "member"


def parse_timestamp(raw: str) -> float:
    """Parse a Google-Forms timestamp string to epoch seconds. The
    format depends on the form-owner's locale at sheet creation. Returns
    0.0 for an unparseable value, so older entries lose to newer ones in
    dedup comparison."""
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
    """Treat anything explicit-looking as consent. We err on the side of
    publishing — the form requires consent to submit, so a blank value
    here would only happen if the column rename slipped past us."""
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
    None on failure. Writes to disk only if the bytes differ from what's
    already there — without this, every re-encode would dirty the tree
    on idempotent reruns (libjpeg quantisation is not bit-stable)."""
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


def build_from_row(
    row: dict, cols: dict, roster_entry: dict, prior: dict | None
) -> dict:
    """Build a board.json entry for one person, merging:
      - submitted content (name, affiliation, themes, bio, photo) from `row`
      - organisational facts (role) from `roster_entry`
      - fallback values (photo, affiliation, themes) from `prior` so
        a partial submission doesn't wipe a previously-set field."""
    name = (row.get(cols["name"], "") or "").strip() or roster_entry["name"]
    kind = roster_entry["kind"]
    person: dict = {
        "name": name,
        "role": roster_entry["role"],
        "alt": name,
    }

    # Photo: submission wins; otherwise inherit from prior entry.
    photo_url = (row.get(cols.get("photo", ""), "") or "").strip()
    photo_path = None
    if photo_url:
        photo_path = download_photo(photo_url, PHOTO_DIR / slugify(name))
    if photo_path:
        person["photo"] = photo_path
    elif prior and prior.get("photo"):
        person["photo"] = prior["photo"]
    else:
        person["photo"] = ""

    if kind == "support":
        bio = (row.get(cols.get("bio", ""), "") or "").strip()
        if not bio and prior:
            bio = prior.get("bio", "")
        person["bio"] = bio
    else:
        affiliation = (row.get(cols.get("affiliation", ""), "") or "").strip()
        if not affiliation and prior:
            affiliation = prior.get("affiliation", "")
        person["affiliation"] = affiliation

        themes = (row.get(cols.get("themes", ""), "") or "").strip()
        if not themes and prior:
            themes = prior.get("themes", "")
        if themes:
            person["themes"] = themes

    return person


def carry_over(prior: dict, roster_entry: dict) -> dict:
    """Roster member hasn't submitted yet: keep their prior entry exactly
    as it stood in board.json, but force role to whatever the roster
    currently says (so a role change in the overlay takes effect on the
    next sync even without a re-submission)."""
    out = dict(prior)
    out["role"] = roster_entry["role"]
    return out


# ──────────────────────────── orchestration ────────────────────────────


def load_prior() -> tuple[dict, dict, dict]:
    """Return (raw board.json data, members-by-slug, support-by-slug)."""
    raw = json.loads(BOARD.read_text())
    members_by_slug = {slugify(p["name"]): p for p in raw.get("members", [])}
    support_by_slug = {slugify(p["name"]): p for p in raw.get("support", [])}
    return raw, members_by_slug, support_by_slug


def dedupe_submissions(
    rows: list[dict], cols: dict, valid_emails: set[str]
) -> dict[str, dict]:
    """Reduce CSV rows to {email → newest valid submission}. Drops rows
    whose email isn't in the roster (logged), and rows that explicitly
    decline consent."""
    out: dict[str, dict] = {}
    for raw_row in rows:
        row = {(k or "").strip(): v for k, v in raw_row.items()}
        email = norm_email(row.get(cols.get("email", ""), ""))
        if not email:
            print("  · skipping row with empty email", file=sys.stderr)
            continue
        if email not in valid_emails:
            print(
                f"  · skipping submission from {email!r}: "
                "not in scripts/board-roles.json (board membership is by invitation)",
                file=sys.stderr,
            )
            continue
        if not consent_ok(row.get(cols.get("consent", ""), "")):
            print(f"  · skipping {email!r}: no consent recorded", file=sys.stderr)
            continue
        ts = parse_timestamp(row.get(cols.get("timestamp", ""), ""))
        if email in out:
            prev_ts = parse_timestamp(out[email].get(cols.get("timestamp", ""), ""))
            if prev_ts >= ts:
                continue  # already have a newer submission for this email
        out[email] = row
    return out


def diff_summary(old: dict, new: dict) -> str:
    """Human-readable summary of what changed across the two structures."""
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
            if json.dumps(old_p[n], sort_keys=True) != json.dumps(new_p[n], sort_keys=True)
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
    roster = json.loads(ROSTER.read_text()).get("members", [])
    if not roster:
        sys.exit("scripts/board-roles.json has no members — nothing to sync.")

    valid_emails = {norm_email(m["email"]) for m in roster}
    # Strip the invalid.eiss-europa.com placeholders — they exist so the
    # roster is shaped from day one, but a submission must never match
    # one (the domain is unroutable, but be paranoid anyway).
    valid_emails = {e for e in valid_emails if "invalid.eiss-europa.com" not in e}

    prior_raw, prior_members_by_slug, prior_support_by_slug = load_prior()

    # Fetch the Sheet
    print(f"Fetching {csv_url}")
    r = requests.get(csv_url, timeout=30)
    r.raise_for_status()
    text = r.content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    submissions = dedupe_submissions(list(reader), cols, valid_emails)

    # Build the new board.json content. Iterate the roster in declared
    # order, splitting by kind into the two output buckets.
    new_members: list[dict] = []
    new_support: list[dict] = []

    for roster_entry in sorted(
        roster, key=lambda m: (m["kind"], m["order"], m["name"])
    ):
        email = norm_email(roster_entry["email"])
        kind = roster_entry["kind"]
        slug = slugify(roster_entry["name"])
        prior_pool = (
            prior_members_by_slug if kind == "board" else prior_support_by_slug
        )
        prior = prior_pool.get(slug)

        if email in submissions:
            person = build_from_row(submissions[email], cols, roster_entry, prior)
        elif prior:
            person = carry_over(prior, roster_entry)
        else:
            print(
                f"  · {roster_entry['name']}: no submission and no prior "
                "board.json entry — skipping until they submit.",
                file=sys.stderr,
            )
            continue

        if kind == "support":
            new_support.append(person)
        else:
            new_members.append(person)

    new_data = dict(prior_raw)
    new_data["members"] = new_members
    new_data["support"] = new_support

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
