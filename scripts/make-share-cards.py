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

import base64
import re
import shutil
import subprocess
import sys
import tempfile
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "assets" / "images"
BRAND_DIR = ROOT / "src" / "assets" / "images" / "brand"


def brand_svg_inner(name: str) -> tuple[str, str]:
    """Read a brand SVG (logo-lockup.svg / logo-mark.svg) and return its
    (viewBox, inner_markup) with the <svg> wrapper and the <title>/<desc>
    accessibility nodes stripped, so the paths can be dropped into a
    nested <svg> on the card. Reading the canonical brand files at
    generation time keeps the card logo in lockstep with the brand kit:
    re-run derive-logo-variants.py + this script and the cards inherit
    any logo change, rather than carrying a hand-copied approximation."""
    raw = (BRAND_DIR / name).read_text(encoding="utf-8")
    view_box = re.search(r'viewBox="([^"]+)"', raw).group(1)
    inner = re.sub(r"<svg\b[^>]*>", "", raw, count=1).replace("</svg>", "")
    inner = re.sub(r"<title\b[^>]*>.*?</title>", "", inner, flags=re.S)
    inner = re.sub(r"<desc\b[^>]*>.*?</desc>", "", inner, flags=re.S)
    return view_box, inner.strip()

# Each card produces:
#   src/assets/images/<slug>-meta.jpg          — English (always)
#   src/assets/images/<slug>-meta.fr.jpg       — French  (if "fr" in i18n)
#   src/assets/images/<slug>-meta.de.jpg       — German  (if "de" in i18n)
#
# `i18n` holds per-language (eyebrow, title, subtitle). For untranslated
# slugs (archive years, programmes without translated pages), only "en"
# is provided.
#
# Adding a new language:
#   1. Add the key under `i18n` for each card you want translated.
#   2. The base layout (src/_layouts/base.njk) auto-swaps the metaImage
#      suffix from -meta.jpg to -meta.<lang>.jpg on pages whose
#      `lang` front-matter matches — so the file just needs to exist.
CARDS = [
    {"slug": "index", "i18n": {
        "en": {"eyebrow": "EISS", "title": "European Initiative for Security Studies",
               "subtitle": "Europe's largest gathering on security issues"},
        "fr": {"eyebrow": "EISS", "title": "Initiative européenne pour les études de sécurité",
               "subtitle": "Le plus grand rassemblement européen sur les questions de sécurité"},
        "de": {"eyebrow": "EISS", "title": "Europäische Initiative für Sicherheitsstudien",
               "subtitle": "Europas größte Versammlung zu Sicherheitsfragen"},
    }},
    # Conference cards split two ways (see #536):
    #   - The upcoming / live edition gets its OWN card, titled with the
    #     full conference name ("European Security Studies Conference"),
    #     below as the `2026` slug; /2026 (+ .fr/.de) point their metaImage
    #     at 2026-meta.*.
    #   - The archived years (/2025, /2024) and the /past index share the
    #     `past` card, titled "EISS Annual Conference".
    # Rollover: when this edition becomes past, repoint /2026 to past-meta
    # and add the next edition here under its own slug. See
    # docs/new-conference.md.
    {"slug": "board", "i18n": {
        "en": {"eyebrow": "About", "title": "The People",
               "subtitle": "The EISS board and support team"},
        "fr": {"eyebrow": "À propos", "title": "L'équipe",
               "subtitle": "Le bureau et l'équipe de soutien d'EISS"},
        "de": {"eyebrow": "Über uns", "title": "Die Personen",
               "subtitle": "Der EISS-Vorstand und das Unterstützungsteam"},
    }},
    {"slug": "past", "i18n": {
        "en": {"eyebrow": "Conferences", "title": "EISS Annual Conference",
               "subtitle": "Every edition since 2017"},
        "fr": {"eyebrow": "Conférences", "title": "Conférence annuelle de l'EISS",
               "subtitle": "Toutes les éditions depuis 2017"},
        "de": {"eyebrow": "Konferenzen", "title": "EISS-Jahreskonferenz",
               "subtitle": "Alle Ausgaben seit 2017"},
    }},
    {"slug": "programmes", "i18n": {
        "en": {"eyebrow": "Research programmes", "title": "Programmes",
               "subtitle": "Coercive Statecraft · NetSec · Euro-SWAMOS · Global Risks"},
        "fr": {"eyebrow": "Programmes de recherche", "title": "Programmes",
               "subtitle": "Coercition étatique · NetSec · Euro-SWAMOS · Global Risks"},
        "de": {"eyebrow": "Forschungsprogramme", "title": "Programme",
               "subtitle": "Coercive Statecraft · NetSec · Euro-SWAMOS · Global Risks"},
    }},
    {"slug": "initiative", "i18n": {
        "en": {"eyebrow": "About", "title": "The Initiative",
               "subtitle": "Network and platform for European security studies"},
        "fr": {"eyebrow": "À propos", "title": "L'Initiative",
               "subtitle": "Réseau et plateforme pour les études européennes de sécurité"},
        "de": {"eyebrow": "Über uns", "title": "Die Initiative",
               "subtitle": "Netzwerk und Plattform für europäische Sicherheitsstudien"},
    }},
    {"slug": "membership", "i18n": {
        "en": {"eyebrow": "Join us", "title": "Membership",
               "subtitle": "Open · Multidisciplinary · Geographically inclusive"},
        "fr": {"eyebrow": "Rejoignez-nous", "title": "Adhésion",
               "subtitle": "Ouverte · Multidisciplinaire · Géographiquement inclusive"},
        "de": {"eyebrow": "Werden Sie Mitglied", "title": "Mitgliedschaft",
               "subtitle": "Offen · Multidisziplinär · Geografisch inklusiv"},
    }},
    {"slug": "events", "i18n": {
        "en": {"eyebrow": "For members", "title": "Members' Events",
               "subtitle": "Roundtables · Early-career seminars · Doctoral workshops"},
        "fr": {"eyebrow": "Pour les membres", "title": "Événements des membres",
               "subtitle": "Tables rondes · Séminaires jeunes chercheurs · Ateliers doctoraux"},
        "de": {"eyebrow": "Für Mitglieder", "title": "Veranstaltungen für Mitglieder",
               "subtitle": "Runde Tische · Nachwuchsseminare · Doktoranden-Workshops"},
    }},
    {"slug": "accessibility", "i18n": {
        "en": {"eyebrow": "Legal", "title": "Accessibility statement",
               "subtitle": "WCAG 2.1 AA · EN 301 549"},
        "fr": {"eyebrow": "Mentions légales", "title": "Déclaration d'accessibilité",
               "subtitle": "WCAG 2.1 AA · EN 301 549"},
        "de": {"eyebrow": "Rechtliches", "title": "Erklärung zur Barrierefreiheit",
               "subtitle": "WCAG 2.1 AA · EN 301 549"},
    }},
    {"slug": "policy", "i18n": {
        "en": {"eyebrow": "Legal", "title": "Privacy Policy",
               "subtitle": "GDPR-compliant data handling at eiss-europa.com"},
        "fr": {"eyebrow": "Mentions légales", "title": "Politique de confidentialité",
               "subtitle": "Traitement des données conforme au RGPD sur eiss-europa.com"},
        "de": {"eyebrow": "Rechtliches", "title": "Datenschutzerklärung",
               "subtitle": "DSGVO-konforme Datenverarbeitung auf eiss-europa.com"},
    }},
    {"slug": "terms", "i18n": {
        "en": {"eyebrow": "Legal", "title": "Terms & Conditions",
               "subtitle": "Registration, membership, refunds, mailings"},
        "fr": {"eyebrow": "Mentions légales", "title": "Conditions générales",
               "subtitle": "Inscription, adhésion, remboursements, envois"},
        "de": {"eyebrow": "Rechtliches", "title": "Allgemeine Geschäftsbedingungen",
               "subtitle": "Anmeldung, Mitgliedschaft, Rückerstattungen, Mailings"},
    }},
    {"slug": "NetSecSchool", "i18n": {
        "en": {"eyebrow": "Programme", "title": "NetSec Summer School",
               "subtitle": "Early-career scholars summer school"},
    }},
    {"slug": "euroswamos", "i18n": {
        "en": {"eyebrow": "Programme", "title": "Euro-SWAMOS",
               "subtitle": "Summer Workshop on Military Operations"},
    }},
    {"slug": "coercion", "i18n": {
        "en": {"eyebrow": "Programme", "title": "Coercive Statecraft",
               "subtitle": "Conditions for effective coercion · with the EUI"},
    }},
    {"slug": "GlobalRisks", "i18n": {
        "en": {"eyebrow": "Survey", "title": "Global Risks to the EU",
               "subtitle": "Annual survey of European security expert opinion"},
    }},
    {"slug": "news", "i18n": {
        "en": {"eyebrow": "Latest", "title": "News",
               "subtitle": "Conferences · publications · prizes · partnerships"},
        "fr": {"eyebrow": "Actualités", "title": "Actualités",
               "subtitle": "Conférences · publications · prix · partenariats"},
        "de": {"eyebrow": "Aktuelles", "title": "Aktuelles",
               "subtitle": "Konferenzen · Publikationen · Preise · Partnerschaften"},
    }},
    # NOTE: the `anthology` card lives in scripts/make-anthology-social.py — a
    # bespoke, marketing-oriented card (+ square/story social images). Do not
    # add an `anthology` entry here, or the two would fight over the same file.
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
# Design rationale (landscape 1200×630, the canonical Open Graph /
# summary_large_image ratio — 1.91:1):
#   - Light field (white → faint blue #E9F2FC), matching the site's own
#     airy design language, with brand-blue (#007bc6) rules at the top and
#     bottom edges of the cropped band.
#   - The REAL EISS lockup (constellation mark + EiSS wordmark) top-left,
#     embedded from src/assets/images/brand/logo-lockup.svg — not a
#     hand-drawn approximation. Constellation in network blue #73caff,
#     wordmark in brand blue #007bc6 via currentColor (the official logo).
#   - A large, soft constellation motif (the real network mark) bleeding
#     off the top-right, for brand texture.
#   - Eyebrow (brand blue) + Title (brand navy #0C3A5E) + optional Subtitle
#     (slate) stack lower-left, like the page heros. Title auto-shrinks.
#   - eiss-europa.com tagline bottom-left for context.
# The card is authored as a full-bleed 1200×1200 square (qlmanage renders
# SVGs onto a square thumbnail canvas), with all content laid out inside
# the vertically-centred band y∈[285, 915]. rasterize() then centre-crops
# to the 1200×630 landscape OG / summary_large_image ratio (1.91:1). The
# gradient fills the whole square so the crop never reveals padding.
CROP_TOP = 285  # (1200 - 630) / 2

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <style>{font_face}</style>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#E9F2FC"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="1200" fill="url(#bg)"/>

  <!-- Brand-blue rules at the top + bottom edges of the cropped band. -->
  <rect x="0" y="285" width="1200" height="10" fill="#007bc6"/>
  <rect x="0" y="905" width="1200" height="10" fill="#007bc6"/>

  <!-- Soft constellation motif (the real network mark) bleeding off the
       top-right of the visible band, as a faint watermark. -->
  <g opacity="0.5">{motif}</g>

  <!-- The official EISS lockup (constellation + EiSS wordmark), top-left,
       in brand blue on the light field. -->
  {lockup}

  <!-- Eyebrow / title / subtitle stack, lower-left -->
  <g font-family="'Inter', -apple-system, system-ui, sans-serif" fill="#0C3A5E">
    <text x="80" y="600" font-size="30" font-weight="700" letter-spacing="3" fill="#007bc6">{eyebrow}</text>
    {title_block}
    {subtitle_block}
  </g>

  <!-- Footer tagline bottom-left -->
  <text x="80" y="866" font-family="'Inter', -apple-system, system-ui, sans-serif"
        font-size="26" font-weight="500" fill="#007bc6" letter-spacing="1">
    eiss-europa.com
  </text>
</svg>
"""

# Approximate width of a bold character as a fraction of font-size, used to
# decide title line-breaks + sizing. Deliberately generous so titles never
# clip even under the wider system fallback when Inter is unavailable.
_CHAR_W = 0.60
_TITLE_RUNWAY = 1040  # px of horizontal room at x=80


def inter_face() -> str:
    """Embed Inter (the brand typeface) as a base64 @font-face so the card
    text renders in Inter rather than qlmanage's system fallback. The Latin
    subset covers the French/German accents in the titles. font-display
    block forces the renderer to wait for the (already-local) font."""
    woff2 = (ROOT / "src" / "assets" / "fonts" / "inter" / "latin-wght-normal.woff2").read_bytes()
    b64 = base64.b64encode(woff2).decode("ascii")
    return (
        "@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;"
        f"font-display:block;src:url(data:font/woff2;base64,{b64}) format('woff2');}}"
    )


def fit_subtitle_size(subtitle: str) -> int:
    """Subtitle font size for ~1040px of runway at x=80."""
    chars = len(subtitle)
    if chars <= 36:
        return 34
    if chars <= 48:
        return 30
    if chars <= 60:
        return 26
    if chars <= 74:
        return 23
    return 21


def layout_title(title: str) -> tuple[int, list[str]]:
    """Pick a font size and wrap the title to at most two lines so it never
    clips the canvas. Short titles render large on one line; longer ones
    break at the most balanced word boundary and step the size down. Sizing
    is conservative (assumes the wide system fallback) so it holds whether
    or not the embedded Inter loads."""

    def fits(text: str, size: int) -> bool:
        return len(text) * _CHAR_W * size <= _TITLE_RUNWAY

    # One line, as large as fits within a sensible cap by length.
    for size in (96, 84, 74):
        if fits(title, size):
            return size, [title]

    # Two lines: split at the word boundary that most evenly balances them.
    words = title.split()
    if len(words) > 1:
        best = None
        for i in range(1, len(words)):
            a, b = " ".join(words[:i]), " ".join(words[i:])
            score = abs(len(a) - len(b))
            if best is None or score < best[0]:
                best = (score, a, b)
        _, line_a, line_b = best
        longest = max(len(line_a), len(line_b))
        for size in (66, 58, 50, 44):
            if longest * _CHAR_W * size <= _TITLE_RUNWAY:
                return size, [line_a, line_b]
        return 40, [line_a, line_b]

    # Single very long word: shrink until it fits.
    for size in (66, 58, 50, 44, 38):
        if fits(title, size):
            return size, [title]
    return 34, [title]


def build_lockup() -> str:
    """The EISS lockup (constellation + EiSS wordmark) as a nested <svg>
    at the top-left of the visible band. `color:#007bc6` resolves the
    wordmark's currentColor to the brand blue; the constellation keeps its
    own #73caff — i.e. the official logo, on the light field."""
    view_box, inner = brand_svg_inner("logo-lockup.svg")
    return (
        f'<svg x="80" y="350" width="300" height="135" viewBox="{view_box}" '
        f'preserveAspectRatio="xMidYMid meet" style="color:#007bc6">{inner}</svg>'
    )


def build_motif() -> str:
    """The constellation mark, large and bleeding off the top-right of the
    visible band, used at low opacity as a background texture."""
    view_box, inner = brand_svg_inner("logo-mark.svg")
    return (
        f'<svg x="610" y="150" width="760" height="341" viewBox="{view_box}" '
        f'preserveAspectRatio="xMidYMid meet">{inner}</svg>'
    )


TITLE_TOP = 700  # baseline of the title's first line (within the band)


def build_title_block(title: str) -> tuple[str, int]:
    """Return (svg_text_markup, last_baseline_y) for the title, wrapped to
    one or two lines via layout_title()."""
    size, lines = layout_title(title)
    spacing = round(size * 1.12)
    tspans = "".join(
        f'<tspan x="80" dy="{0 if i == 0 else spacing}">{escape(line)}</tspan>'
        for i, line in enumerate(lines)
    )
    markup = (
        f'<text x="80" y="{TITLE_TOP}" font-size="{size}" font-weight="800" '
        f'letter-spacing="-1.5">{tspans}</text>'
    )
    return markup, TITLE_TOP + (len(lines) - 1) * spacing


def render(strings: dict, lockup: str, motif: str, font_face: str) -> Path:
    """Write the template SVG with the given language's strings, return the
    temp-file path. `strings` has `eyebrow`, `title`, and optional
    `subtitle`. `lockup`/`motif`/`font_face` are built once in main()."""
    title_block, title_bottom = build_title_block(strings["title"])
    subtitle_block = ""
    if strings.get("subtitle"):
        sub_size = fit_subtitle_size(strings["subtitle"])
        sub_y = title_bottom + sub_size + 28
        subtitle_block = (
            f'<text x="80" y="{sub_y}" font-size="{sub_size}" font-weight="500" '
            f'fill="#46627A">{escape(strings["subtitle"])}</text>'
        )
    svg = TEMPLATE.format(
        font_face=font_face,
        lockup=lockup,
        motif=motif,
        eyebrow=escape(strings["eyebrow"]).upper(),
        title_block=title_block,
        subtitle_block=subtitle_block,
    )
    tmp = Path(tempfile.mkstemp(suffix=".svg", prefix="meta-")[1])
    tmp.write_text(svg, encoding="utf-8")
    return tmp


def rasterize(svg_path: Path, dest_name: str) -> Path:
    """Render the SVG to a 1200×1200 PNG via qlmanage, centre-crop it to the
    1200×630 landscape OG ratio with sips, then re-encode as JPG. qlmanage
    renders onto a square thumbnail canvas, so the template fills the whole
    square and lays its content out in the centred band that the crop keeps.
    `dest_name` is the filename, e.g. `index-meta.jpg` / `board-meta.fr.jpg`."""
    work = Path(tempfile.mkdtemp(prefix="meta-out-"))
    subprocess.run(
        ["qlmanage", "-t", "-s", "1200", "-o", str(work), str(svg_path)],
        check=True, capture_output=True,
    )
    png_path = work / f"{svg_path.name}.png"
    if not png_path.exists():
        sys.exit(f"qlmanage didn't produce expected output at {png_path}")

    # Centre-crop the square render to the 1200×630 landscape band, then
    # encode JPG. sips `-c H W` crops to height×width anchored on centre.
    jpg_dest = OUT_DIR / dest_name
    subprocess.run(
        ["sips", "-c", "630", "1200",
         "-s", "format", "jpeg", "-s", "formatOptions", "88",
         str(png_path), "--out", str(jpg_dest)],
        check=True, capture_output=True,
    )
    return jpg_dest


def dest_filename(slug: str, lang: str) -> str:
    """English uses the bare `<slug>-meta.jpg` form (so existing
    front-matter references continue to work). Other languages get a
    suffix that base.njk auto-swaps to when `lang != "en"`."""
    return f"{slug}-meta.jpg" if lang == "en" else f"{slug}-meta.{lang}.jpg"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Optional slug filter: `make-share-cards.py news anthology` regenerates
    # only those cards, leaving the rest untouched (qlmanage/sips output can
    # drift by a few bytes between machines, so regenerating everything would
    # dirty cards you didn't mean to change). No args → regenerate all.
    only = set(sys.argv[1:])
    lockup = build_lockup()
    motif = build_motif()
    font_face = inter_face()
    for card in CARDS:
        if only and card["slug"] not in only:
            continue
        for lang, strings in card["i18n"].items():
            svg = render(strings, lockup, motif, font_face)
            try:
                out = rasterize(svg, dest_filename(card["slug"], lang))
                size_kb = out.stat().st_size // 1024
                print(f"  ✓ {out.relative_to(ROOT)}  ({size_kb} KB)")
            finally:
                svg.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
