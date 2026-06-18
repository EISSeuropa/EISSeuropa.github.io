#!/usr/bin/env python3
"""
Bespoke marketing assets for the European Security Studies Anthology (#639/#96
follow-up): a more marketing-oriented Open Graph card than the generic
make-share-cards.py template, plus square and story social images.

Outputs (all light-brand, official EISS lockup, name-led):
  src/assets/images/anthology-meta.jpg        OG / Twitter, 1200x630, EN
  src/assets/images/anthology-meta.fr.jpg     OG, 1200x630, FR
  src/assets/images/anthology-meta.de.jpg     OG, 1200x630, DE
  src/assets/images/social/anthology-square.jpg   1080x1080, EN (IG / LinkedIn feed)
  src/assets/images/social/anthology-story.jpg     1080x1920, EN (stories / reels)
  src/assets/images/social/anthology-poster.jpg    1240x1754, EN (A4 portrait, print + social)

Because this owns anthology-meta.jpg, the `anthology` entry is removed from
make-share-cards.py's CARDS table (single owner).

Rasterising: macOS qlmanage renders an SVG into a square thumbnail at -s S
(longer side = S), so we author each canvas at its true WxH, render at
S = max(W, H), then sips centre-crops to WxH. Same trick make-share-cards.py
uses for the 1200x630 crop, generalised to any aspect.

Re-run after editing. Reuses make-share-cards.py's font + brand-SVG helpers.
"""
from __future__ import annotations

import importlib.util
import subprocess
import sys
import tempfile
from pathlib import Path
from xml.sax.saxutils import escape

try:
    import qrcode
except ImportError:  # optional — the poster falls back to the printed URL
    qrcode = None

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "images"
SOCIAL = OUT / "social"

# Reuse the embedded-Inter + brand-SVG-inner helpers from make-share-cards.py.
_spec = importlib.util.spec_from_file_location("msc", ROOT / "scripts" / "make-share-cards.py")
_msc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_msc)

# ── palette (light brand, fixed design — same language as the OG cards) ──
NAVY = "#0C3A5E"
BLUE = "#007bc6"
SLATE = "#46627A"
MUTED = "#5C7689"
TINT = "#E6F1FB"
TINT_TEXT = "#0C447C"
TINT_LABEL = "#3C6690"
HAIR = "#E2EBF4"
NET = "#73caff"

FONT = "'Inter', -apple-system, system-ui, sans-serif"

OG = {
    "en": {
        "kicker": "Open access research archive",
        "lead": "Every EISS conference paper since 2017, and everyone who gave it.",
        "stats": "~500 papers · ~500 scholars · dozens of EISS events",
        "open": "Free · open access",
    },
    "fr": {
        "kicker": "Archive de recherche en libre accès",
        "lead": "Chaque communication des conférences EISS depuis 2017, et qui l'a présentée.",
        "stats": "~500 communications · ~500 chercheurs · des dizaines d'événements EISS",
        "open": "Libre accès",
    },
    "de": {
        "kicker": "Open-Access-Forschungsarchiv",
        "lead": "Jeder Beitrag der EISS-Konferenzen seit 2017, und alle, die ihn gehalten haben.",
        "stats": "~500 Beiträge · ~500 Wissenschaftler · Dutzende EISS-Veranstaltungen",
        "open": "Open Access",
    },
}

FEATURES = [
    "Browse by person or by paper",
    "Abstracts, with links to the published version",
    "One-click citation export (.bib / .ris)",
    "European Security Studies Prize winners",
    "Free and open: no tracking, no sign-up",
]
URL = "eiss-europa.com/anthology.html"


def _defs() -> str:
    return (
        f"<defs><style>{_msc.inter_face()}</style>"
        '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0%" stop-color="#ffffff"/>'
        '<stop offset="100%" stop-color="#E9F2FC"/></linearGradient></defs>'
    )


def _lockup(x: float, y: float, w: float) -> str:
    vb, inner = _msc.brand_svg_inner("logo-lockup.svg")
    h = w * 95.18 / 212.42
    return (
        f'<svg x="{x}" y="{y}" width="{w}" height="{h:.1f}" viewBox="{vb}" '
        f'preserveAspectRatio="xMidYMid meet" style="color:{BLUE}">{inner}</svg>'
    )


def _motif(x: float, y: float, w: float, opacity: float = 0.45) -> str:
    vb, inner = _msc.brand_svg_inner("logo-mark.svg")
    h = w * 95.18 / 212.42
    return (
        f'<g opacity="{opacity}"><svg x="{x}" y="{y}" width="{w}" height="{h:.1f}" '
        f'viewBox="{vb}" preserveAspectRatio="xMidYMid meet">{inner}</svg></g>'
    )


def _text(x, y, size, fill, content, weight=400, anchor="start", spacing=None):
    ls = f' letter-spacing="{spacing}"' if spacing is not None else ""
    return (
        f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
        f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{ls}>{escape(content)}</text>'
    )


def _stat_cell(x, y, w, h, big, small):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{TINT}"/>'
        + _text(x + w / 2, y + h * 0.52, h * 0.34, TINT_TEXT, big, weight=700, anchor="middle")
        + _text(x + w / 2, y + h * 0.78, h * 0.17, TINT_LABEL, small, anchor="middle")
    )


def _feature(x, y, size, content):
    # a small filled brand dot + label
    return (
        f'<circle cx="{x + size*0.35}" cy="{y - size*0.32}" r="{size*0.28}" fill="{BLUE}"/>'
        + _text(x + size * 1.1, y, size, "#103A5A", content)
    )


def build_og(strings: dict) -> str:
    # qlmanage only renders square thumbnails, so author a 1200x1200 canvas and
    # lay the content in the centred 630-tall band [285, 915]; rasterize() then
    # crops to 1200x630. (Same trick as make-share-cards.py.)
    C, top = 1200, 285
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {C} {C}" width="{C}" height="{C}">', _defs()]
    s.append(f'<rect width="{C}" height="{C}" fill="url(#bg)"/>')
    s.append(_motif(770, top - 70, 560, 0.4))
    s.append(f'<rect x="0" y="{top}" width="{C}" height="10" fill="{BLUE}"/>')
    s.append(f'<rect x="0" y="{top+620}" width="{C}" height="10" fill="{BLUE}"/>')
    s.append(_lockup(64, top + 50, 248))
    s.append(_text(1136, top + 86, 22, MUTED, strings["kicker"], weight=600, anchor="end"))
    s.append(_text(64, top + 262, 54, NAVY, "The European Security Studies", weight=600, spacing="-1"))
    s.append(_text(64, top + 356, 92, BLUE, "Anthology", weight=700, spacing="-2"))
    s.append(_text(64, top + 426, 26, SLATE, strings["lead"], weight=400))
    s.append(_text(64, top + 494, 30, NAVY, strings["stats"], weight=600))
    s.append(_text(64, top + 568, 30, BLUE, URL, weight=500))
    s.append(_text(1136, top + 568, 24, MUTED, strings["open"], weight=500, anchor="end"))
    s.append("</svg>")
    return "".join(s)


def build_square() -> str:
    W = H = 1080
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', _defs()]
    s.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    s.append(_motif(640, -80, 620, 0.4))
    s.append(f'<rect x="0" y="0" width="{W}" height="12" fill="{BLUE}"/>')
    s.append(f'<rect x="0" y="{H-12}" width="{W}" height="12" fill="{BLUE}"/>')
    s.append(_lockup(80, 80, 232))
    s.append(_text(80, 250, 20, MUTED, "Open access research archive", weight=600, spacing="1"))
    s.append(_text(80, 372, 56, NAVY, "The European Security Studies", weight=600, spacing="-1"))
    s.append(_text(80, 470, 104, BLUE, "Anthology", weight=700, spacing="-2"))
    s.append(_text(80, 540, 30, SLATE, "Every EISS conference paper since 2017,", weight=400))
    s.append(_text(80, 580, 30, SLATE, "and everyone who gave it.", weight=400))
    s.append(_stat_cell(80, 632, 290, 130, "~500", "papers"))
    s.append(_stat_cell(395, 632, 290, 130, "~500", "scholars"))
    s.append(_stat_cell(710, 632, 290, 130, "dozens", "of EISS events"))
    for i, feat in enumerate(FEATURES[:3]):
        s.append(_feature(82, 838 + i * 56, 28, feat))
    s.append(_text(80, 1008, 34, BLUE, URL, weight=500))
    s.append("</svg>")
    return "".join(s)


def build_story() -> str:
    # Portrait 1080x1920. qlmanage renders square, so author a 1920x1920 canvas
    # with the content in the centred 1080-wide band [420, 1500]; rasterize()
    # crops to 1080x1920. bx offsets every x into that band.
    C, bx, M = 1920, 420, 50
    L = bx + M
    R = bx + 1080 - M
    CW = R - L            # 980
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {C} {C}" width="{C}" height="{C}">', _defs()]
    s.append(f'<rect width="{C}" height="{C}" fill="url(#bg)"/>')
    s.append(_motif(R - 320, 50, 700, 0.38))
    s.append(f'<rect x="0" y="0" width="{C}" height="14" fill="{BLUE}"/>')
    s.append(f'<rect x="0" y="{C-14}" width="{C}" height="14" fill="{BLUE}"/>')
    s.append(_lockup(L, 150, 280))
    s.append(_text(L, 340, 24, MUTED, "Open access research archive", weight=600, spacing="1.5"))
    s.append(_text(L, 564, 58, NAVY, "The European Security Studies", weight=600, spacing="-1"))
    s.append(_text(L, 684, 124, BLUE, "Anthology", weight=700, spacing="-3"))
    s.append(_text(L, 784, 34, SLATE, "Every EISS conference paper since 2017,", weight=400))
    s.append(_text(L, 832, 34, SLATE, "and everyone who gave it.", weight=400))
    gap = 24
    cw = (CW - 2 * gap) / 3
    s.append(_stat_cell(L, 908, cw, 158, "~500", "papers"))
    s.append(_stat_cell(L + cw + gap, 908, cw, 158, "~500", "scholars"))
    s.append(_stat_cell(L + 2 * (cw + gap), 908, cw, 158, "dozens", "events"))
    for i, feat in enumerate(FEATURES):
        s.append(_feature(L + 4, 1176 + i * 84, 34, feat))
    s.append(f'<line x1="{L}" y1="1636" x2="{R}" y2="1636" stroke="{HAIR}" stroke-width="2"/>')
    s.append(_text(L, 1696, 42, BLUE, URL, weight=500))
    s.append(_text(L, 1748, 28, MUTED, "Free · open access · no sign-up", weight=500, spacing="0.5"))
    s.append("</svg>")
    return "".join(s)


def _qr(x: float, y: float, size: float, data: str) -> str:
    """A scannable QR for `data`, rendered as SVG rects (dark modules in navy
    on a white rounded card). Needs the qrcode lib (matrix only, no Pillow);
    returns "" when it's unavailable so the poster still builds."""
    if qrcode is None:
        return ""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    n = len(matrix)
    mod = size / n
    parts = [f'<rect x="{x:.1f}" y="{y:.1f}" width="{size:.1f}" height="{size:.1f}" rx="10" fill="#ffffff"/>']
    parts.append(f'<g fill="{NAVY}">')
    for r, row in enumerate(matrix):
        for c, dark in enumerate(row):
            if dark:
                parts.append(f'<rect x="{x + c*mod:.2f}" y="{y + r*mod:.2f}" width="{mod:.2f}" height="{mod:.2f}"/>')
    parts.append("</g>")
    return "".join(parts)


def build_poster() -> str:
    # A4 portrait 1240x1754 (print + social). Authored in a 1754 square with the
    # content in the centred 1240-wide band; rasterize() crops to 1240x1754.
    # L/R are the actual left/right content edges (80px poster margins), so the
    # stats span the full width and the footer QR stays in bounds.
    C, bx, M = 1754, 257, 80
    L = bx + M            # left content edge
    R = bx + 1240 - M     # right content edge
    CW = R - L            # 1080
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {C} {C}" width="{C}" height="{C}">', _defs()]
    s.append(f'<rect width="{C}" height="{C}" fill="url(#bg)"/>')
    s.append(_motif(R - 360, 36, 760, 0.38))
    s.append(f'<rect x="0" y="0" width="{C}" height="14" fill="{BLUE}"/>')
    s.append(f'<rect x="0" y="{C-14}" width="{C}" height="14" fill="{BLUE}"/>')
    s.append(_lockup(L, 110, 300))
    s.append(_text(L, 302, 26, MUTED, "Open access research archive", weight=600, spacing="1.5"))
    s.append(_text(L, 462, 58, NAVY, "The European Security Studies", weight=600, spacing="-1"))
    s.append(_text(L, 584, 116, BLUE, "Anthology", weight=700, spacing="-3"))
    s.append(_text(L, 682, 32, SLATE, "Every EISS conference paper since 2017,", weight=400))
    s.append(_text(L, 730, 32, SLATE, "and everyone who gave it.", weight=400))
    gap = 24
    cw = (CW - 2 * gap) / 3
    s.append(_stat_cell(L, 804, cw, 162, "~500", "papers"))
    s.append(_stat_cell(L + cw + gap, 804, cw, 162, "~500", "scholars"))
    s.append(_stat_cell(L + 2 * (cw + gap), 804, cw, 162, "dozens", "of EISS events"))
    for i, feat in enumerate(FEATURES):
        s.append(_feature(L + 4, 1066 + i * 82, 34, feat))
    # Footer: hairline, CTA text left, scannable QR right — all above the rule.
    s.append(f'<line x1="{L}" y1="1452" x2="{R}" y2="1452" stroke="{HAIR}" stroke-width="2"/>')
    qr = 230
    s.append(_qr(R - qr, 1474, qr, "https://eiss-europa.com/anthology.html"))
    s.append(_text(L, 1520, 32, NAVY, "Scan to explore the archive", weight=600))
    s.append(_text(L, 1580, 40, BLUE, URL, weight=500))
    s.append(_text(L, 1632, 26, MUTED, "Free · open access · no sign-up", weight=500, spacing="0.5"))
    s.append("</svg>")
    return "".join(s)


def rasterize(svg: str, w: int, h: int, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkstemp(suffix=".svg", prefix="anth-")[1])
    tmp.write_text(svg, encoding="utf-8")
    work = Path(tempfile.mkdtemp(prefix="anth-out-"))
    try:
        s = max(w, h)
        subprocess.run(["qlmanage", "-t", "-s", str(s), "-o", str(work), str(tmp)],
                       check=True, capture_output=True)
        png = work / f"{tmp.name}.png"
        if not png.exists():
            sys.exit(f"qlmanage produced no output for {dest.name}")
        subprocess.run(["sips", "-c", str(h), str(w), "-s", "format", "jpeg",
                        "-s", "formatOptions", "88", str(png), "--out", str(dest)],
                       check=True, capture_output=True)
        print(f"  ✓ {dest.relative_to(ROOT)}  ({dest.stat().st_size // 1024} KB)")
    finally:
        tmp.unlink(missing_ok=True)


def main() -> None:
    for lang, strings in OG.items():
        name = "anthology-meta.jpg" if lang == "en" else f"anthology-meta.{lang}.jpg"
        rasterize(build_og(strings), 1200, 630, OUT / name)
    rasterize(build_square(), 1080, 1080, SOCIAL / "anthology-square.jpg")
    rasterize(build_story(), 1080, 1920, SOCIAL / "anthology-story.jpg")
    rasterize(build_poster(), 1240, 1754, SOCIAL / "anthology-poster.jpg")


if __name__ == "__main__":
    main()
