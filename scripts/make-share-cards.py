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
1. For each entry in CARDS below (and each Atlas theme), fill TEMPLATE
   with the page's eyebrow / title / subtitle.
2. scripts/card_raster.py renders the SVG with headless Chrome (or macOS
   qlmanage), keeps the 1200×630 band and writes the JPEG to
   src/assets/images/ (#2153). Chrome is on GitHub's runners and in cloud
   sessions, so any machine can regenerate a card.
3. src/_data/shareCardAlt.json records the text of every card, for
   og:image:alt and for --refresh.

Re-run after editing CARDS or TEMPLATE. Needs Chrome or Chromium (or
CHROME_BIN), node, and Pillow from scripts/requirements.txt.

Usage
-----
    python3 scripts/make-share-cards.py              # every template and Atlas card
    python3 scripts/make-share-cards.py board news   # only those slugs
    python3 scripts/make-share-cards.py --alt-only   # only src/_data/shareCardAlt.json
    python3 scripts/make-share-cards.py --refresh    # cards whose text changed (daily, #2157)
    python3 scripts/make-share-cards.py --papers     # one card per paper page (deploy, #2156)
"""
from __future__ import annotations

import base64
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
from html import escape
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import card_raster  # noqa: E402
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
    #     below as the `2027` slug; /2027 (+ .fr/.de) point their metaImage
    #     at 2027-meta.*.
    #   - The archived years (/2025, /2024) and the /past index share the
    #     `past` card, titled "EISS Annual Conference".
    # Rollover: when this edition becomes past, repoint /2027 to past-meta
    # and add the next edition here under its own slug. See
    # docs/new-conference.md.
    {"slug": "2027", "i18n": {
        "en": {"eyebrow": "ESSC 2027", "title": "European Security Studies Conference",
               "subtitle": "10–11 June 2027 · University of Belgrade"},
        "fr": {"eyebrow": "ESSC 2027", "title": "Conférence européenne d'études de sécurité",
               "subtitle": "10–11 juin 2027 · Université de Belgrade"},
        "de": {"eyebrow": "ESSC 2027", "title": "Europäische Konferenz für Sicherheitsstudien",
               "subtitle": "10.–11. Juni 2027 · Universität Belgrad"},
    }},
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
    # English only, like the blog itself (#1259). Posts inherit it through
    # src/blog/blog.11tydata.js.
    {"slug": "blog", "i18n": {
        "en": {"eyebrow": "The EISS Blog", "title": "Belvedere",
               "subtitle": "Writing from the EISS network on European security studies"},
        "fr": {"eyebrow": "Le blog de l'EISS", "title": "Belvédère",
               "subtitle": "Des textes du réseau EISS sur les études de sécurité européennes"},
        "de": {"eyebrow": "Der EISS-Blog", "title": "Belvedere",
               "subtitle": "Beiträge aus dem EISS-Netzwerk zu europäischen Sicherheitsstudien"},
    }, "motif": "belvedere-mark.svg", "motif_opacity": 1},
    {"slug": "roadmap", "i18n": {
        "en": {"eyebrow": "Development", "title": "Roadmap",
               "subtitle": "Shipped · in progress · planned"},
        "fr": {"eyebrow": "Développement", "title": "Feuille de route",
               "subtitle": "Publié · en cours · prévu"},
        "de": {"eyebrow": "Entwicklung", "title": "Roadmap",
               "subtitle": "Veröffentlicht · in Arbeit · geplant"},
    }},
    # NOTE: the `anthology` card lives in scripts/make-anthology-social.py — a
    # bespoke, marketing-oriented card (+ square/story social images). Do not
    # add an `anthology` entry here, or the two would fight over the same file.
]


def atlas_theme_cards() -> list[dict]:
    """One card per Atlas research theme (#1255), in all three languages.

    It was EN-only while the theme pages were. #1495 published them in French
    and German, and base.njk rewrites `-meta.jpg` to `-meta.<lang>.jpg` for a
    non-English page without checking the file exists, so the 34 new pages
    advertised cards that were never generated: a shared French Atlas link
    previewed as a blank card. The labels and the joining word come from the
    same catalogs the pages use, so the card cannot say something the page
    does not.

    The themes come from src/_data/atlasThemePages.js via node, rather than
    being retyped here: that module is what the pages paginate over, so a theme
    added to the corpus produces a page and a card from one source. Retyping
    seventeen names into this file would be a drift bug waiting to happen."""
    try:
        out = subprocess.run(
            ["node", "-e",
             "const m=require('./src/_data/atlasThemePages.js');"
             "process.stdout.write(JSON.stringify(m()))"],
            cwd=ROOT, capture_output=True, text=True, timeout=60, check=True,
        ).stdout
        themes = json.loads(out)
    except Exception as exc:  # node missing, module broken, malformed JSON
        print(f"  ! skipping Atlas theme cards: {exc}", file=sys.stderr)
        return []
    # Read from the i18n catalog rather than retyped here, for the same reason
    # the theme list is read from its module: two copies of a string drift.
    try:
        cat = json.loads(subprocess.run(
            ["node", "-e",
             "const i=require('./src/_data/i18n.js');const d=typeof i==='function'?i():i;"
             "process.stdout.write(JSON.stringify({en:d.en.atlas,fr:d.fr.atlas,de:d.de.atlas}))"],
            cwd=ROOT, capture_output=True, text=True, timeout=60, check=True,
        ).stdout)
    except Exception as exc:
        print(f"  ! Atlas theme cards fall back to English: {exc}", file=sys.stderr)
        cat = {}

    def entry(t: dict, lang: str) -> dict:
        a = cat.get(lang) or {}
        label = (t.get("label") or {}).get(lang) or t["name"]
        first, last = t.get("firstYear"), t.get("lastYear")
        joiner = a.get("yearRangeJoiner", "to")
        span = str(first) if first == last else f"{first} {joiner} {last}"
        return {
            "eyebrow": a.get("title", "Anthology Atlas"),
            "title": label,
            "subtitle": f"{t['count']} {a.get('papers', 'papers')} · {span}",
        }

    return [
        {
            "slug": f"atlas-theme-{t['slug']}",
            "motif": "anthology-mark.svg",
            "i18n": {lang: entry(t, lang) for lang in ("en", "fr", "de")},
        }
        for t in themes
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
  <g opacity="{motif_opacity}">{motif}</g>

  <!-- The official EISS lockup (constellation + EiSS wordmark), top-left,
       in brand blue on the light field. -->
  {lockup}

  <!-- Eyebrow / title / subtitle stack, lower-left -->
  <g font-family="'Inter', -apple-system, system-ui, sans-serif" fill="#0C3A5E">
    <text x="80" y="{eyebrow_y}" font-size="30" font-weight="700" letter-spacing="3" fill="#007bc6">{eyebrow}</text>
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


# Sub-brand marks: square, with a currentColor part pinned to the brand blue.
SQUARE_MARKS = {"anthology-mark.svg", "belvedere-mark.svg"}


def build_motif(name: str = "logo-mark.svg") -> str:
    """The constellation mark, large and bleeding off the top-right of the
    visible band, used at low opacity as a background texture.

    The Atlas theme cards (#1255) pass anthology-mark.svg instead: that mark IS
    a network map of the corpus, so on a card about one research theme it says
    what the page is without words. It is square where logo-mark is wide, so it
    gets its own box rather than being letterboxed into the wide one."""
    view_box, inner = brand_svg_inner(name)
    box = (
        # The Belvedere viewpoint only reads with its hub, so the whole mark
        # sits inside the band rather than bleeding off the top.
        'x="820" y="370" width="320" height="320"'
        if name == "belvedere-mark.svg"
        else 'x="800" y="120" width="400" height="400"'
        if name in SQUARE_MARKS
        # Low enough that the band shows most of the constellation. At
        # y=150 the crop kept only a few stray lines and half a node (#2153).
        else 'x="690" y="236" width="640" height="287"'
    )
    # anthology-mark.svg paints its hub with fill="currentColor" so one asset
    # can recolour per surface. Inside this card there is nothing to inherit
    # from, so the hub rendered grey against a blue network. Pin it to the
    # brand blue, which is what the mark shows everywhere else on the site.
    colour = ' color="#007bc6"' if name in SQUARE_MARKS else ""
    return (
        f'<svg {box} viewBox="{view_box}"{colour} '
        f'preserveAspectRatio="xMidYMid meet">{inner}</svg>'
    )


# The text stack is laid out from the bottom up (#2153). It used to start at a
# fixed title baseline, so a two-line title pushed the subtitle down to 9 px
# above the eiss-europa.com line while a one-line card kept 78 px. Anchoring
# the subtitle to the footer keeps that gap the same on every card, and a
# longer title grows upwards into the empty space under the lockup.
FOOTER_Y = 866        # baseline of the eiss-europa.com line
SUBTITLE_Y = 812      # baseline of the subtitle, or of the title's last line
EYEBROW_MIN_Y = 560   # keeps the eyebrow clear of the lockup (bottom at 485)


def layout_long_title(title: str, max_lines: int = 4) -> tuple[int, list[str]]:
    """Greedy wrap for paper titles, which run to 190 characters: the largest
    size at which the title fits in `max_lines`, with an ellipsis on the last
    line if it does not fit even at the smallest size."""
    words = title.split()
    for size in (60, 54, 48, 44, 40, 36):
        per_line = int(_TITLE_RUNWAY / (_CHAR_W * size))
        lines, line = [], ""
        for word in words:
            if line and len(line) + 1 + len(word) > per_line:
                lines.append(line)
                line = word
            else:
                line = f"{line} {word}".strip()
        lines.append(line)
        if len(lines) <= max_lines and all(len(x) <= per_line for x in lines):
            return size, lines
    kept = lines[:max_lines]
    kept[-1] = kept[-1][: per_line - 1].rstrip(" ,:;") + "\u2026"
    return size, kept


def build_title_block(title: str, last_baseline: int, max_lines: int = 2) -> tuple[str, int, int]:
    """Return (svg_text_markup, first_baseline_y, font_size) for the title,
    with its last line on `last_baseline`."""
    size, lines = layout_title(title) if max_lines <= 2 else layout_long_title(title, max_lines)
    spacing = round(size * 1.12)
    first = last_baseline - (len(lines) - 1) * spacing
    tspans = "".join(
        f'<tspan x="80" dy="{0 if i == 0 else spacing}">{escape(line)}</tspan>'
        for i, line in enumerate(lines)
    )
    markup = (
        f'<text x="80" y="{first}" font-size="{size}" font-weight="800" '
        # -1.5 suits the 66 to 96 px titles. A paper title at 36 px needs
        # proportionally less, or the letters run together.
        f'letter-spacing="{max(-1.5, round(-size / 64, 1))}">{tspans}</text>'
    )
    return markup, first, size


def svg_markup(strings: dict, lockup: str, motif: str, font_face: str,
               motif_opacity: float = 0.5, max_title_lines: int = 2) -> str:
    """The template filled with one language's strings. `strings` has
    `eyebrow`, `title`, and optional `subtitle`. `lockup`/`motif`/`font_face`
    are built once by the caller."""
    subtitle_block = ""
    last_title_baseline = SUBTITLE_Y
    if strings.get("subtitle"):
        sub_size = fit_subtitle_size(strings["subtitle"])
        subtitle_block = (
            f'<text x="80" y="{SUBTITLE_Y}" font-size="{sub_size}" font-weight="500" '
            f'fill="#46627A">{escape(strings["subtitle"])}</text>'
        )
        last_title_baseline = SUBTITLE_Y - sub_size - 26
    title_block, first, size = build_title_block(strings["title"], last_title_baseline, max_title_lines)
    # Cap height of Inter is about 0.73 em; 40 px from the title's cap line.
    eyebrow_y = max(EYEBROW_MIN_Y, round(first - 0.73 * size - 40))
    return TEMPLATE.format(
        font_face=font_face,
        lockup=lockup,
        motif=motif,
        motif_opacity=motif_opacity,
        # Uppercase first: escape() writes an apostrophe as &#x27;, and .upper()
        # made that &#X27;, which is not XML. qlmanage let it pass, Chrome does not.
        eyebrow=escape(strings["eyebrow"].upper()),
        eyebrow_y=eyebrow_y,
        title_block=title_block,
        subtitle_block=subtitle_block,
    )


def render(strings: dict, lockup: str, motif: str, font_face: str,
           motif_opacity: float = 0.5) -> Path:
    """svg_markup() written to a temp file; returns its path."""
    tmp = Path(tempfile.mkstemp(suffix=".svg", prefix="meta-")[1])
    tmp.write_text(svg_markup(strings, lockup, motif, font_face, motif_opacity), encoding="utf-8")
    return tmp


def rasterize(svg_path: Path, dest_name: str) -> Path:
    """Render the 1200×1200 SVG and keep the centred 1200×630 band as
    `src/assets/images/<dest_name>`, e.g. `index-meta.jpg`. Chrome or
    qlmanage, whichever card_raster finds (#2153)."""
    return card_raster.rasterize(svg_path, 1200, 630, OUT_DIR / dest_name)


def dest_filename(slug: str, lang: str) -> str:
    """English uses the bare `<slug>-meta.jpg` form (so existing
    front-matter references continue to work). Other languages get a
    suffix that base.njk auto-swaps to when `lang != "en"`."""
    return f"{slug}-meta.jpg" if lang == "en" else f"{slug}-meta.{lang}.jpg"


def atlas_catalog() -> dict:
    return json.loads(subprocess.run(
        ["node", "-e",
         "const i=require('./src/_data/i18n.js');const d=typeof i==='function'?i():i;"
         "process.stdout.write(JSON.stringify({en:d.en.atlas,fr:d.fr.atlas,de:d.de.atlas}))"],
        cwd=ROOT, capture_output=True, text=True, check=True).stdout)


def atlas_map_strings(corpus: dict | None = None, cat: dict | None = None) -> dict:
    """{lang: (title, subtitle)} for the Atlas map card. Shared by the card
    and its alt text, so the two cannot disagree (#2158)."""
    from atlas_map_card import load_corpus

    corpus = corpus or load_corpus()
    cat = cat or atlas_catalog()
    papers = len(corpus.get("papers", []))
    authors = len(corpus.get("authors", []))
    theme_count = len(corpus.get("themes", []))
    return {
        lang: (a["title"], f"{papers} {a['papers']} · {authors} {a['authors']} · "
                           f"{theme_count} {a['statThemes']}")
        for lang, a in cat.items()
    }


def anthology_module():
    """make-anthology-social.py, which owns the anthology-meta cards."""
    spec = importlib.util.spec_from_file_location(
        "make_anthology_social", ROOT / "scripts" / "make-anthology-social.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def make_atlas_map_cards() -> None:
    """The Atlas card is the map itself, redrawn per locale (#1545).

    Every other card here is the house template: lockup, title, subtitle. The
    Atlas one is a picture of the corpus, because that is what sells the map,
    and it used to be a hand capture of the running page (#1156). A capture
    cannot be translated, and the hub labels are the reader's language since
    #1495, so all three are generated from the corpus by
    scripts/atlas_map_card.py using the layout the browser uses."""
    from atlas_map_card import load_corpus, write_card

    corpus = load_corpus()
    cat = json.loads(subprocess.run(
        ["node", "-e",
         "const i=require('./src/_data/i18n.js');const d=typeof i==='function'?i():i;"
         "process.stdout.write(JSON.stringify({en:d.en.atlas,fr:d.fr.atlas,de:d.de.atlas}))"],
        cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    themes = json.loads(subprocess.run(
        ["node", "-e", "const m=require('./src/_data/atlasThemePages.js');"
         "process.stdout.write(JSON.stringify(m()))"],
        cwd=ROOT, capture_output=True, text=True, check=True).stdout)

    strings = atlas_map_strings(corpus, cat)
    work = Path(tempfile.mkdtemp(prefix="atlas-map-"))
    for lang in ("en", "fr", "de"):
        a = cat[lang]
        labels = {t["name"]: (t.get("label") or {}).get(lang, t["name"]) for t in themes}
        labels["__untagged__"] = a["untagged"]
        title, subtitle = strings[lang]
        svg_path = write_card(lang, title, subtitle, labels,
                              work / f"atlas-map-{lang}.svg")
        out = rasterize(svg_path, dest_filename("anthology-atlas", lang))
        print(f"  \u2713 {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)")


ALT_INDEX = ROOT / "src" / "_data" / "shareCardAlt.json"
LOGO = {"en": "EISS logo", "fr": "Logo de l'EISS", "de": "EISS-Logo"}
COLON = {"en": ":", "fr": " :", "de": ":"}


def card_alt(lang: str, t: dict) -> str:
    """The alt text of a house-template card: what the card says, in order."""
    subtitle = t.get("subtitle", "").replace(" · ", ", ")
    return (f"{LOGO[lang]}. {t['eyebrow']}{COLON[lang]} {t['title']}."
            + (f" {subtitle}." if subtitle else ""))


def alt_index() -> dict:
    """The text each card shows, keyed by its file name, so base.njk can give
    og:image:alt the words on the card rather than the page title. The shared
    cards (home, past, board) carry other words than most pages that use them,
    and Bluesky, Mastodon and LinkedIn read this alt to screen-reader users.

    It is also the fingerprint `--refresh` compares: a data-derived card whose
    entry changes is a card whose figures changed (#2157)."""
    index = {}
    for card in CARDS + atlas_theme_cards():
        for lang, t in card["i18n"].items():
            index[dest_filename(card["slug"], lang)] = card_alt(lang, t)
    # The two cards drawn by other code (#2158).
    for lang, t in anthology_module().og_strings().items():
        index[dest_filename("anthology", lang)] = (
            f"{LOGO[lang]}. {t['kicker']}{COLON[lang]} The European Security Studies Anthology. "
            f"{t['lead']} {t['stats'].replace(' · ', ', ')}.")
    for lang, (title, subtitle) in atlas_map_strings().items():
        index[dest_filename("anthology-atlas", lang)] = (
            f"{title}{COLON[lang]} {subtitle.replace(' · ', ', ')}.")
    return index


def write_alt_index(index: dict | None = None) -> dict:
    index = index if index is not None else alt_index()
    ALT_INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2,
                                    sort_keys=True) + "\n", encoding="utf-8")
    print(f"  ✓ {ALT_INDEX.relative_to(ROOT)}  ({len(index)} cards)")
    return index


def render_cards(only: set[str] | None = None, langs: dict | None = None) -> None:
    """Regenerate house-template cards. `only` limits to slugs, `langs`
    ({slug: {lang, ...}}) to some languages of a slug."""
    lockup, motif, font_face = build_lockup(), build_motif(), inter_face()
    jobs = []
    # Atlas theme cards are appended rather than written into CARDS, since they
    # are derived from the corpus rather than authored here (#1255).
    for card in CARDS + atlas_theme_cards():
        if only is not None and card["slug"] not in only:
            continue
        card_motif = build_motif(card["motif"]) if card.get("motif") else motif
        for lang, strings in card["i18n"].items():
            if langs and card["slug"] in langs and lang not in langs[card["slug"]]:
                continue
            # A card whose mark is its subject (the blog) shows it at full strength.
            svg = svg_markup(strings, lockup, card_motif, font_face, card.get("motif_opacity", 0.5))
            jobs.append((svg, 1200, 630, OUT_DIR / dest_filename(card["slug"], lang)))
    card_raster.rasterize_many(jobs)
    for *_, dest in jobs:
        print(f"  ✓ {dest.relative_to(ROOT)}  ({dest.stat().st_size // 1024} KB)")


def refresh() -> None:
    """Regenerate only the cards whose text changed, and the alt index.

    Run daily by roadmap-refresh.yml (#2157). The Atlas theme, Atlas map and
    Anthology cards print figures from the corpus, so they go stale whenever
    the corpus grows. Comparing the alt index before and after finds exactly
    those cards, and a card whose text is unchanged is never re-encoded, so
    the daily pull request stays empty on a quiet day."""
    old = json.loads(ALT_INDEX.read_text(encoding="utf-8")) if ALT_INDEX.exists() else {}
    new = alt_index()
    changed = sorted(f for f in new if new[f] != old.get(f)
                     or not (OUT_DIR / f).exists())
    if not changed and old == new:
        print("  share cards current")
        return
    by_slug: dict[str, set[str]] = {}
    for f in changed:
        m = re.match(r"(.+)-meta(?:\.([a-z]{2}))?\.jpg$", f)
        by_slug.setdefault(m.group(1), set()).add(m.group(2) or "en")
    if "anthology" in by_slug:
        anthology_module().main()  # the OG cards and the social images share the figures
    if "anthology-atlas" in by_slug:
        make_atlas_map_cards()
    rest = {k: v for k, v in by_slug.items() if k not in ("anthology", "anthology-atlas")}
    if rest:
        render_cards(set(rest), rest)
    write_alt_index(new)


# ---------------------------------------------------------------------------
# One card per paper page (#2156).
#
# 315 cards are not committed: at about 60 KB each they would add 20 MB to the
# repository every time the template changes. The deploy job makes them before
# Eleventy runs, into the gitignored src/assets/images/papers/, and keeps them
# in the Actions cache. src/_data/paperCards.js lists the cards present, and
# paper.njk falls back to the Anthology card for a paper without one, so a
# deploy preview or a local build without Chrome still builds.
PAPER_DIR = OUT_DIR / "papers"
PAPER_MANIFEST = PAPER_DIR / "manifest.json"


def paper_card_strings(p: dict) -> dict:
    conf = re.sub(r"^European Security Studies Conference (\d{4})$", r"ESSC \1",
                  p["conferenceName"])
    authors = p["authorNames"]
    byline = ", ".join(authors)
    if len(byline) > 80 and len(authors) > 3:
        byline = ", ".join(authors[:3]) + " et al."
    return {"eyebrow": f"Anthology · {conf}", "title": p["title"], "subtitle": byline}


def make_paper_cards() -> None:
    papers = json.loads(subprocess.run(
        ["node", "-e",
         "const m=require('./src/_data/paperPages.js');"
         "process.stdout.write(JSON.stringify((typeof m==='function'?m():m).map("
         "p=>({slug:p.slug,title:p.title,conferenceName:p.conferenceName,authorNames:p.authorNames}))))"],
        cwd=ROOT, capture_output=True, text=True, check=True, timeout=120).stdout)
    # A card is redrawn when its text or the drawing code changes.
    code = hashlib.sha256(b"".join(
        (ROOT / "scripts" / f).read_bytes() for f in ("make-share-cards.py", "card_raster.py"))
    ).hexdigest()[:12]
    PAPER_DIR.mkdir(parents=True, exist_ok=True)
    old = json.loads(PAPER_MANIFEST.read_text(encoding="utf-8")) if PAPER_MANIFEST.exists() else {}
    lockup, motif, font_face = build_lockup(), build_motif("anthology-mark.svg"), inter_face()
    manifest, jobs = {}, []
    for p in papers:
        strings = paper_card_strings(p)
        key = hashlib.sha256((code + json.dumps(strings, sort_keys=True)).encode()).hexdigest()[:16]
        # Title first: a screen reader should reach the paper before the edition.
        alt = (f"{LOGO['en']}. {strings['title']}. {strings['subtitle']}. "
               f"{strings['eyebrow'].replace(' · ', ', ')}.")
        manifest[p["slug"]] = {"key": key, "alt": alt}
        dest = PAPER_DIR / f"{p['slug']}.jpg"
        if old.get(p["slug"], {}).get("key") != key or not dest.exists():
            jobs.append((svg_markup(strings, lockup, motif, font_face, 0.5, 4), 1200, 630, dest))
    for stale in PAPER_DIR.glob("*.jpg"):
        if stale.stem not in manifest:
            stale.unlink()
    card_raster.rasterize_many(jobs)
    PAPER_MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True),
                              encoding="utf-8")
    print(f"  ✓ {PAPER_DIR.relative_to(ROOT)}  ({len(jobs)} drawn, "
          f"{len(manifest) - len(jobs)} cached, {len(manifest)} papers)")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    args = sys.argv[1:]
    if args == ["--alt-only"]:
        write_alt_index()
        return
    if args == ["--refresh"]:
        refresh()
        return
    if args == ["--papers"]:
        make_paper_cards()
        return
    # Optional slug filter: `make-share-cards.py news board` regenerates only
    # those cards. No args → regenerate all house-template and Atlas cards.
    only = set(args) or None
    if only is None or "anthology-atlas" in only:
        make_atlas_map_cards()
    render_cards(only)
    write_alt_index()


if __name__ == "__main__":
    main()
