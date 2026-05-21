#!/usr/bin/env python3
"""
Generate 1200×630 Open Graph / Twitter share cards for the EISS site
from a parameterised SVG template.

Why this exists
---------------
Several /assets/images/*-meta.jpg files in the repo were nominally
"per-page" but were identical copies of the index logo image. This
script produces genuinely page-specific cards so a LinkedIn / Twitter
preview of /board.html looks different from /membership.html.

Pipeline
--------
1. For each entry in CARDS below, write a temp SVG with the page's
   eyebrow / title / subtitle substituted into TEMPLATE.
2. Convert each SVG to a 1200×630 PNG using macOS qlmanage (no extra
   dependencies). The output PNG is saved into src/assets/images/
   alongside the existing -meta files.
3. Optionally re-encode to JPG via `sips` for smaller file sizes,
   matching the existing .jpg convention.

Re-run after editing CARDS or TEMPLATE. Outputs are deterministic
unless qlmanage's renderer changes — small libpng quantisation drift
is possible between macOS versions, which is fine for share cards.

Usage
-----
    python3 scripts/make-share-cards.py
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "assets" / "images"

# Each card produces <slug>-meta.jpg in src/assets/images/.
# Eyebrow is the small label above the title.
# Title is the prominent headline.
# Subtitle (optional) is a single supporting line below.
CARDS = [
    {"slug": "index",       "eyebrow": "EISS",         "title": "European Initiative for Security Studies",
                            "subtitle": "Europe's largest gathering on security issues"},
    {"slug": "2026",        "eyebrow": "Annual conference",
                            "title": "ESSC 2026 — Stockholm",
                            "subtitle": "11–12 June 2026 · Stockholm University"},
    {"slug": "2025",        "eyebrow": "Annual conference",
                            "title": "ESSC 2025 — Thessaloniki",
                            "subtitle": "University of Macedonia"},
    {"slug": "2024",        "eyebrow": "Annual conference",
                            "title": "ESSC 2024 — Prague",
                            "subtitle": "Charles University"},
    {"slug": "board",       "eyebrow": "About",
                            "title": "The People",
                            "subtitle": "The EISS board and support team"},
    {"slug": "past",        "eyebrow": "Conferences",
                            "title": "Past conferences",
                            "subtitle": "Annual conferences 2017 → today"},
    {"slug": "programmes",  "eyebrow": "Research programmes",
                            "title": "Programmes",
                            "subtitle": "Coercive Statecraft · NetSec · Euro-SWAMOS · Global Risks"},
    {"slug": "initiative",  "eyebrow": "About",
                            "title": "The Initiative",
                            "subtitle": "Network and platform for European security studies"},
    {"slug": "membership",  "eyebrow": "Join us",
                            "title": "Membership",
                            "subtitle": "Open · Multidisciplinary · Geographically inclusive"},
    {"slug": "events",      "eyebrow": "For members",
                            "title": "Members' Events",
                            "subtitle": "Roundtables · Early-career seminars · Doctoral workshops"},
    {"slug": "accessibility", "eyebrow": "Legal",
                              "title": "Accessibility statement",
                              "subtitle": "WCAG 2.1 AA · EN 301 549"},
    {"slug": "policy",      "eyebrow": "Legal",
                            "title": "Privacy Policy",
                            "subtitle": "GDPR-compliant data handling at eiss-europa.com"},
    {"slug": "terms",       "eyebrow": "Legal",
                            "title": "Terms & Conditions",
                            "subtitle": "Registration, membership, refunds, mailings"},
    {"slug": "NetSecSchool", "eyebrow": "Programme",
                             "title": "NetSec Summer School",
                             "subtitle": "Early-career scholars summer school"},
    {"slug": "euroswamos",  "eyebrow": "Programme",
                            "title": "Euro-SWAMOS",
                            "subtitle": "Summer Workshop on Military Operations"},
    {"slug": "coercion",    "eyebrow": "Programme",
                            "title": "Coercive Statecraft",
                            "subtitle": "Conditions for effective coercion · with the EUI"},
    {"slug": "GlobalRisks", "eyebrow": "Survey",
                            "title": "Global Risks to the EU",
                            "subtitle": "Annual survey of European security expert opinion"},
]

# 1200×1200 square share card SVG template.
#
# Why square (1:1) and not 1200×630 (1.91:1):
#   - macOS qlmanage (the only SVG rasteriser available without extra deps)
#     does not honour SVG width/height attributes when those differ from
#     the requested -s thumbnail size; it pads to a square canvas with
#     unexpected scaling. Rather than fight it, we author at 1:1.
#   - 1200×1200 is accepted by every major preview crawler (Facebook /
#     LinkedIn / Twitter / Mastodon / Bluesky). The crop is less
#     billboard-shaped on Twitter than 2:1, but the image is rendered
#     at full resolution everywhere.
#
# Design rationale:
#   - Deep navy gradient background — readable against both light and
#     dark social feeds.
#   - Light EISS network motif top-right (the dots from the brand) for
#     instant recognition.
#   - Eyebrow + Title + Subtitle stack center-left, like the page heros.
#   - Title font-size auto-shrinks for long strings (see render()).
#   - eiss-europa.com tagline bottom-left for context.
TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(216, 88%, 22%)"/>
      <stop offset="60%" stop-color="hsl(216, 88%, 14%)"/>
      <stop offset="100%" stop-color="hsl(216, 60%, 8%)"/>
    </linearGradient>
    <radialGradient id="logoBg" cx="30%" cy="30%" r="80%">
      <stop offset="0%" stop-color="hsl(216, 95%, 65%)"/>
      <stop offset="60%" stop-color="hsl(216, 88%, 40%)"/>
      <stop offset="100%" stop-color="hsl(216, 88%, 28%)"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="1200" fill="url(#bg)"/>

  <!-- EISS network motif (light dots + connecting lines) top-right. -->
  <g opacity="0.4" stroke="hsl(196, 90%, 70%)" stroke-width="3" fill="hsl(196, 90%, 70%)">
    <line x1="760" y1="160" x2="940"  y2="120"/>
    <line x1="940" y1="120" x2="1100" y2="180"/>
    <line x1="940" y1="120" x2="1020" y2="260"/>
    <line x1="1020" y1="260" x2="1100" y2="180"/>
    <line x1="1020" y1="260" x2="1140" y2="340"/>
    <line x1="760"  y1="160" x2="880"  y2="280"/>
    <line x1="880"  y1="280" x2="1020" y2="260"/>
    <circle cx="760"  cy="160" r="11"/>
    <circle cx="940"  cy="120" r="17"/>
    <circle cx="1100" cy="180" r="13"/>
    <circle cx="1020" cy="260" r="15"/>
    <circle cx="880"  cy="280" r="10"/>
    <circle cx="1140" cy="340" r="13"/>
  </g>

  <!-- EISS brand mark top-left -->
  <g transform="translate(120, 140)">
    <rect width="100" height="100" rx="20" fill="url(#logoBg)"/>
    <rect x="2" y="2" width="96" height="3" rx="1.5" fill="hsl(0 0% 100% / 0.25)"/>
    <path d="M 31 28 L 69 28 L 69 38 L 41 38 L 41 46 L 67 46 L 67 56 L 41 56 L 41 64 L 69 64 L 69 74 L 31 74 Z" fill="white"/>
  </g>

  <!-- Eyebrow / title / subtitle stack, centred vertically in the design -->
  <g font-family="-apple-system, system-ui, 'Inter', sans-serif" fill="white">
    <text x="120" y="560" font-size="32" font-weight="700" letter-spacing="3" fill="hsl(196, 90%, 80%)">{eyebrow}</text>
    <text x="120" y="680" font-size="{title_size}" font-weight="800" letter-spacing="-2">{title}</text>
    {subtitle_block}
  </g>

  <!-- Footer tagline bottom-left -->
  <text x="120" y="1080" font-family="-apple-system, system-ui, 'Inter', sans-serif"
        font-size="28" font-weight="500" fill="hsl(196, 60%, 75%)" letter-spacing="1">
    eiss-europa.com
  </text>
</svg>
"""

SUBTITLE_TEMPLATE = (
    '<text x="120" y="770" font-size="38" font-weight="500" '
    'fill="hsl(216, 30%, 85%)" letter-spacing="0">{subtitle}</text>'
)


def fit_title_size(title: str) -> int:
    """Heuristic font size for the title so long strings don't clip the
    right edge of the 1200px canvas. Tuned empirically against
    qlmanage's font rendering (which falls back to a system serif when
    Inter isn't installed — sufficient for this use). Designed assuming
    the title sits at x=120 with ~1080px of horizontal runway."""
    chars = len(title)
    if chars <= 14:
        return 120  # "Membership", "Programmes"
    if chars <= 22:
        return 96   # "Past conferences"
    if chars <= 30:
        return 76   # "ESSC 2026 — Stockholm"
    if chars <= 38:
        return 60
    if chars <= 48:
        return 52
    return 44


def render(card: dict) -> Path:
    """Write the template SVG with substitutions, return its path."""
    subtitle_block = ""
    if card.get("subtitle"):
        subtitle_block = SUBTITLE_TEMPLATE.format(subtitle=escape(card["subtitle"]))
    svg = TEMPLATE.format(
        eyebrow=escape(card["eyebrow"]).upper(),
        title=escape(card["title"]),
        title_size=fit_title_size(card["title"]),
        subtitle_block=subtitle_block,
    )
    tmp = Path(tempfile.mkstemp(suffix=".svg", prefix="meta-")[1])
    tmp.write_text(svg, encoding="utf-8")
    return tmp


def rasterize(svg_path: Path, slug: str) -> Path:
    """Render the SVG to a 1200-wide PNG via qlmanage, then re-encode as
    JPG to match the existing -meta.jpg convention and shave file size."""
    work = Path(tempfile.mkdtemp(prefix="meta-out-"))
    subprocess.run(
        ["qlmanage", "-t", "-s", "1200", "-o", str(work), str(svg_path)],
        check=True, capture_output=True,
    )
    png_path = work / f"{svg_path.name}.png"
    if not png_path.exists():
        sys.exit(f"qlmanage didn't produce expected output at {png_path}")

    # sips converts PNG → JPG with quality control and keeps original alpha
    # collapsed against a black background, which matches the navy template.
    jpg_dest = OUT_DIR / f"{slug}-meta.jpg"
    subprocess.run(
        ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "85",
         str(png_path), "--out", str(jpg_dest)],
        check=True, capture_output=True,
    )
    return jpg_dest


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for card in CARDS:
        svg = render(card)
        try:
            out = rasterize(svg, card["slug"])
            size_kb = out.stat().st_size // 1024
            print(f"  ✓ {out.relative_to(ROOT)}  ({size_kb} KB)")
        finally:
            svg.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
