#!/usr/bin/env python3
"""Render the image card for the weekly welcome post (#2219).

The welcome post (scripts/social-post.py --kind welcome) names the people who
joined EISS. This renders one 1200x630 JPEG with their headshots and names,
the count and the EISS brand, in the light style of the site's share cards
(make-share-cards.py): the official lockup, Inter, the brand-blue rules and
the constellation motif. Only people with a headshot are pictured, and the
rest are counted in a "+N" tile (welcome_card_faces() in social-post.py).
When nobody has a headshot, the card shows initials tiles.

The people come from social-post.py's welcome_pending(), with the same ledger
and the same `since` rule, so the card shows exactly the people the post
names. The file is .cache/welcome-cards/<hash of their slugs>.jpg, which
social-post.py attaches when it exists and otherwise falls back to the
standard EISS picture. .cache/ is gitignored.

Ported from EISSeuropa/netsec.github.io scripts/build-welcome-card.py (#2237).
The photos are embedded as data URIs, and scripts/card_raster.py renders the
SVG with headless Chrome, as for the other cards.

Usage:
    python3 scripts/build-welcome-card.py                    # the next live welcome
    python3 scripts/build-welcome-card.py --since 2026-11-01 # a preview window
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import importlib.util
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import card_raster  # noqa: E402


def _load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod  # @dataclass resolves its module through sys.modules
    spec.loader.exec_module(mod)
    return mod


sp = _load("social_post", "social-post.py")
msc = _load("make_share_cards", "make-share-cards.py")

# The visible band of the 1200x1200 canvas is y 285 to 915 (card_raster keeps
# the centred 1200x630). Tiles are 132 px with 20 px gaps: seven fill the
# 1040 px between the 80 px margins.
TILE, GAP, X0, TILE_Y = 132, 20, 80, 588
NAME_Y = TILE_Y + TILE + 30
NAME_CHARS = 14  # per line at 19 px, generous for Inter

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <style>{font_face}</style>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#E9F2FC"/>
    </linearGradient>
    {clips}
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect x="0" y="285" width="1200" height="10" fill="#007bc6"/>
  <rect x="0" y="905" width="1200" height="10" fill="#007bc6"/>
  <g opacity="0.35">{motif}</g>
  {lockup}
  <g font-family="'Inter', -apple-system, system-ui, sans-serif">
    <text x="80" y="505" font-size="60" font-weight="700" fill="#0C3A5E">Welcome to EISS</text>
    <text x="80" y="549" font-size="30" font-weight="600" fill="#007bc6">{count}</text>
    {tiles}
    <text x="80" y="874" font-size="26" font-weight="500" fill="#007bc6" letter-spacing="1">eiss-europa.com/board</text>
  </g>
</svg>
"""


def display_name(name: str) -> str:
    """The name without its honorific: "Prof. Chiara Ruffa" reads "Chiara
    Ruffa" under the photo."""
    words = (name or "").split()
    while len(words) > 1 and words[0].lower().strip(".") in {
            "dr", "prof", "professor", "mr", "mrs", "ms", "mx", "m", "miss", "sir", "dame"}:
        words = words[1:]
    return " ".join(words)


def initials(name: str) -> str:
    words = [w for w in re.split(r"[\s.]+", display_name(name)) if w]
    if not words:
        return "?"
    return (words[0][0] + (words[-1][0] if len(words) > 1 else "")).upper()


def _clip(text: str) -> str:
    return text if len(text) <= NAME_CHARS else text[:NAME_CHARS - 1].rstrip() + "\u2026"


def name_lines(name: str) -> list[str]:
    """Up to two lines of about NAME_CHARS characters. The first takes as
    many whole words as fit, and the second the rest, ending in an ellipsis
    when it runs longer."""
    words = display_name(name).split()
    if not words:
        return []
    first, i = words[0], 1
    while i < len(words) and len(f"{first} {words[i]}") <= NAME_CHARS:
        first, i = f"{first} {words[i]}", i + 1
    rest = " ".join(words[i:])
    return [_clip(first)] + ([_clip(rest)] if rest else [])


def _photo_uri(p: dict) -> str:
    rel = (p.get("photoOverride") or p.get("photo") or "").strip().lstrip("/")
    path = sp.SRC / rel
    mime = "image/png" if path.suffix.lower() == ".png" else "image/webp" if path.suffix.lower() == ".webp" else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def _caption(x: int, lines: list[str]) -> str:
    return "".join(
        f'<text x="{x}" y="{NAME_Y + i * 24}" font-size="19" font-weight="500" fill="#0C3A5E">{escape(ln)}</text>'
        for i, ln in enumerate(lines))


def tile(i: int, p: dict) -> tuple[str, str]:
    """(clipPath, markup) for one person's tile."""
    x = X0 + i * (TILE + GAP)
    clip = f'<clipPath id="t{i}"><rect x="{x}" y="{TILE_Y}" width="{TILE}" height="{TILE}" rx="22"/></clipPath>'
    frame = (f'<rect x="{x}" y="{TILE_Y}" width="{TILE}" height="{TILE}" rx="22" fill="none" '
             f'stroke="#B9D3EC" stroke-width="2"/>')
    if sp.has_photo(p):
        body = (f'<image x="{x}" y="{TILE_Y}" width="{TILE}" height="{TILE}" clip-path="url(#t{i})" '
                f'preserveAspectRatio="xMidYMid slice" href="{_photo_uri(p)}"/>')
    else:
        body = (f'<rect x="{x}" y="{TILE_Y}" width="{TILE}" height="{TILE}" rx="22" fill="#DCEAF8"/>'
                f'<text x="{x + TILE // 2}" y="{TILE_Y + 82}" text-anchor="middle" font-size="48" '
                f'font-weight="700" fill="#007bc6">{escape(initials(p.get("name", "")))}</text>')
    return clip, body + frame + _caption(x, name_lines(p.get("name", "")))


def more_tile(i: int, n: int) -> str:
    """The last tile, counting everyone not pictured."""
    x = X0 + i * (TILE + GAP)
    return (f'<rect x="{x}" y="{TILE_Y}" width="{TILE}" height="{TILE}" rx="22" fill="#DCEAF8" '
            f'stroke="#B9D3EC" stroke-width="2"/>'
            f'<text x="{x + TILE // 2}" y="{TILE_Y + 82}" text-anchor="middle" font-size="44" '
            f'font-weight="700" fill="#007bc6">+{n}</text>'
            + _caption(x, ["more member" if n == 1 else "more members"]))


def card_svg(people: list[dict]) -> str:
    faces = sp.welcome_card_faces(people)
    clips, tiles = [], []
    for i, p in enumerate(faces):
        c, t = tile(i, p)
        clips.append(c)
        tiles.append(t)
    if len(people) > len(faces):
        tiles.append(more_tile(len(faces), len(people) - len(faces)))
    view_box, inner = msc.brand_svg_inner("logo-lockup.svg")
    lockup = (f'<svg x="80" y="318" width="210" height="95" viewBox="{view_box}" '
              f'preserveAspectRatio="xMinYMid meet" style="color:#007bc6">{inner}</svg>')
    count = sp._count_words(len(people), "new member", "new members").capitalize()
    return TEMPLATE.format(font_face=msc.inter_face(), clips="".join(clips), motif=msc.build_motif(),
                           lockup=lockup, count=escape(count), tiles="".join(tiles))


def main() -> int:
    ap = argparse.ArgumentParser(description="Render the weekly welcome post's image card (#2219).")
    ap.add_argument("--since", metavar="YYYY-MM-DD",
                    help="preview: people who joined on or after this date, in place of data/welcome.json `since`")
    args = ap.parse_args()
    if args.since:
        try:
            dt.date.fromisoformat(args.since)
        except ValueError:
            ap.error(f"--since must be a date as YYYY-MM-DD, not {args.since!r}")
    posted = set(sp.load_ledger().get("posted", []))
    people = sp.welcome_pending(posted, args.since)
    if not people:
        print("Nobody to welcome, so no card.")
        return 0
    out = sp.welcome_card_path(people)
    card_raster.rasterize(card_svg(people), 1200, 630, out)
    print(f"wrote {out.relative_to(ROOT)} for {len(people)} person(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
