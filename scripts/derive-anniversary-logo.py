#!/usr/bin/env python3
"""Derive the EISS 10th-anniversary logo and its export set (#1852).

Two marks, both built on the unaltered EISS lockup:

    eiss-10-lockup   the lockup, a hairline divider, a large "10", then
                     "YEARS" over 2017–2027. The anniversary logo proper:
                     email header, signature, banners.

    eiss-10-name     "EISS10": the lockup with "10" at the wordmark's cap
                     height in the network blue. Profile pictures and the
                     #EISS10 hashtag.

New lettering is Inter (the brand typeface), outlined from the self-hosted
woff2 so every SVG renders without the font installed.

Usage
-----
    python3 scripts/derive-anniversary-logo.py <export-dir>

Writes the two SVG masters into src/assets/images/brand/ (recolourable via
CSS, same contract as the parent marks, see BRAND.md) and the full export
set, SVG plus PNG, into <export-dir>. PNGs are rendered by headless Chrome
(override the binary with $CHROME) and cropped with Pillow.

Needs `pip install fonttools brotli Pillow`. A design instrument, not a
build step: it never runs during a site build.
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

REPO = Path(__file__).resolve().parent.parent
BRAND = REPO / "src/assets/images/brand"
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

BLUE, NET = "#007bc6", "#73caff"
# theme: (wordmark and lettering, network and the name's "10", background)
THEMES = {
    "master": ("currentColor", "var(--brand-network, #73caff)", None),
    "colour": (BLUE, NET, None),
    "colour-on-white": (BLUE, NET, "#ffffff"),
    "white": ("#ffffff", NET, None),
    "on-dark": ("#ffffff", NET, "#0d1219"),
    "on-blue": ("#ffffff", "#bfe6ff", BLUE),
    "black": ("#000000", "#000000", None),
}

# ---------- the parent lockup, in the brand PDF's coordinate space ----------
PATHS = re.findall(r'<path transform="([^"]+)" d="([^"]+)" class="(logo-\w+)"',
                   (BRAND / "logo-full.svg").read_text())[:5]   # network, E, i, S, S
LOCKUP_BOX = (26.87, 43.23, 239.29, 138.41)
BASE, CAP = 132.0, 40.7          # wordmark baseline and cap height
INTER_CAP = 1490 / 2048          # Inter cap height per em


def paint(cls: str, theme: str) -> str:
    t, n, _ = THEMES[theme]
    fill = n if cls == "logo-network" else t
    return f'class="{cls}" fill="{fill}"' if theme == "master" else f'fill="{fill}"'


def lockup(theme: str) -> str:
    return "".join(f'<path transform="{tr}" d="{d}" {paint(c, theme)}/>' for tr, d, c in PATHS)


_fonts: dict[int, TTFont] = {}


def text(s: str, size: float, x: float, y: float, wght: int, track: float = 0) -> tuple[str, float]:
    """Inter outlined at baseline (x, y). Returns (path data, advance).
    ponytail: no kerning pairs, fine for digits and one capitalised word."""
    if wght not in _fonts:
        _fonts[wght] = instantiateVariableFont(
            TTFont(REPO / "src/assets/fonts/inter/latin-wght-normal.woff2"), {"wght": wght})
    f = _fonts[wght]
    gs, cmap, k = f.getGlyphSet(), f.getBestCmap(), size / f["head"].unitsPerEm
    pen, cx = SVGPathPen(gs), 0.0
    for ch in s:
        g = gs[cmap[ord(ch)]]
        g.draw(TransformPen(pen, (k, 0, 0, -k, x + cx, y)))
        cx += g.width * k + track
    return pen.getCommands(), cx - track


# ---------- the two marks: (body, content box x0 y0 x1 y1) ----------
def mark_lockup(theme: str):
    div, x10 = 254, 270
    d10, w10 = text("10", (BASE - LOCKUP_BOX[1]) / INTER_CAP, x10, BASE, 800, -2)  # "10" as tall as the lockup
    cx = x10 + w10 + 10
    dy, wy = text("YEARS", 19, cx, BASE - 26, 700, 2.2)
    dd, wd = text("2017–2027", 19, cx, BASE, 500, 0.4)
    t = paint("logo-text", theme)
    stroke = "currentColor" if theme == "master" else THEMES[theme][0]
    body = (lockup(theme)
            + f'<line x1="{div}" y1="{LOCKUP_BOX[1] + 4}" x2="{div}" y2="{BASE}" stroke="{stroke}" stroke-width="1" opacity="0.3"/>'
            + f'<path d="{d10}" {t}/><path d="{dy}" {t}/><path d="{dd}" {t} opacity="0.8"/>')
    return body, (LOCKUP_BOX[0], LOCKUP_BOX[1], cx + max(wy, wd), BASE + 1)


def mark_name(theme: str):
    d10, w10 = text("10", CAP / INTER_CAP, 247, BASE, 800, -1)
    return lockup(theme) + f'<path d="{d10}" {paint("logo-network", theme)}/>', (LOCKUP_BOX[0], LOCKUP_BOX[1], 247 + w10, BASE + 7)


MARKS = {"eiss-10-lockup": mark_lockup, "eiss-10-name": mark_name}
TITLE = "EISS, ten years, 2017–2027"


def tight(mark, theme: str, pad: float = 6) -> str:
    """The mark alone, its viewBox hugging the artwork."""
    body, (x0, y0, x1, y1) = mark(theme)
    vb = f"{x0 - pad:.2f} {y0 - pad:.2f} {x1 - x0 + 2 * pad:.2f} {y1 - y0 + 2 * pad:.2f}"
    bg = THEMES[theme][2]
    rect = f'<rect x="{x0 - pad:.2f}" y="{y0 - pad:.2f}" width="{x1 - x0 + 2 * pad:.2f}" height="{y1 - y0 + 2 * pad:.2f}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img">'
            f'<title>{TITLE}</title>{rect}{body}</svg>\n')


def canvas(mark, theme: str, w: int, h: int, fit: float, align: str = "center",
           mesh: bool = False, circle: bool = False) -> str:
    """The mark placed on a w×h canvas. `fit` is the share of the canvas height
    it may take (or, with `circle`, of the diameter its diagonal may take)."""
    body, (x0, y0, x1, y1) = mark(theme)
    mw, mh = x1 - x0, y1 - y0
    if circle:
        s = fit * w / (mw ** 2 + mh ** 2) ** 0.5
    else:
        s = min(fit * h / mh, (w - (1 - fit) * h) / mw)
    ox = (w - mw * s) / 2 if align == "center" else w - (1 - fit) / 2 * h - mw * s
    oy = (h - mh * s) / 2
    bg = THEMES[theme][2]
    ground = MESH.format(w=w, h=h) if mesh else (f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else "")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img">'
            f'<title>{TITLE}</title>{ground}'
            f'<g transform="translate({ox - x0 * s:.3f} {oy - y0 * s:.3f}) scale({s:.5f})">{body}</g></svg>\n')


# The site's light canvas and soft blue mesh (site.css --bg, --gradient-mesh-*).
MESH = ('<defs>'
        '<radialGradient id="m1" cx="0.12" cy="0.08" r="0.7"><stop offset="0" stop-color="hsl(203,88%,70%)" stop-opacity="0.22"/><stop offset="0.55" stop-color="hsl(203,88%,70%)" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="m2" cx="0.92" cy="0.04" r="0.6"><stop offset="0" stop-color="hsl(190,80%,65%)" stop-opacity="0.18"/><stop offset="0.55" stop-color="hsl(190,80%,65%)" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="m3" cx="0.5" cy="1" r="0.8"><stop offset="0" stop-color="hsl(203,80%,70%)" stop-opacity="0.12"/><stop offset="0.6" stop-color="hsl(203,80%,70%)" stop-opacity="0"/></radialGradient>'
        '</defs><rect width="{w}" height="{h}" fill="hsl(210,33%,98%)"/>'
        '<rect width="{w}" height="{h}" fill="url(#m1)"/><rect width="{w}" height="{h}" fill="url(#m2)"/><rect width="{w}" height="{h}" fill="url(#m3)"/>')

L, N = mark_lockup, mark_name
# path: (svg source, png width or None for the svg's own size)
EXPORTS = {
    # logo files: transparent, for documents, slides and partner kits
    **{f"logo/eiss-10-lockup-{t}": (tight(L, t), 2400) for t in ("colour", "white", "black")},
    **{f"logo/eiss-10-name-{t}": (tight(N, t), 2400) for t in ("colour", "white", "black")},
    # profile pictures: the platforms crop to a circle, so the name fits inside it
    "profile/profile-800-white": (canvas(N, "colour-on-white", 800, 800, 0.94, circle=True), None),
    "profile/profile-800-blue": (canvas(N, "on-blue", 800, 800, 0.94, circle=True), None),
    # banners: the profile picture overlaps bottom left on all four platforms, so the logo sits right
    "banners/x-mastodon-1500x500": (canvas(L, "colour", 1500, 500, 0.4, "right", mesh=True), None),
    "banners/x-mastodon-1500x500-blue": (canvas(L, "on-blue", 1500, 500, 0.4, "right"), None),
    "banners/bluesky-3000x1000": (canvas(L, "colour", 3000, 1000, 0.4, "right", mesh=True), None),
    "banners/bluesky-3000x1000-blue": (canvas(L, "on-blue", 3000, 1000, 0.4, "right"), None),
    "banners/linkedin-company-2256x382": (canvas(L, "colour", 2256, 382, 0.5, "right", mesh=True), None),
    "banners/linkedin-company-2256x382-blue": (canvas(L, "on-blue", 2256, 382, 0.5, "right"), None),
    # email: both at 2x, displayed at 600 and 300 px wide
    "email/email-header-1200x300": (canvas(L, "colour-on-white", 1200, 300, 0.5), None),
    "email/email-signature-600x150": (canvas(L, "colour-on-white", 600, 150, 0.8), None),
}


def render(svg: Path, png: Path, width: int | None) -> None:
    """Headless Chrome screenshot in sRGB. Its viewport runs shorter than
    --window-size, so render tall and crop to the canvas."""
    from PIL import Image

    src = svg.read_text()
    if width:  # a tight logo file: give it a pixel size
        vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', src)[1].split()]
        h = round(width * vb[3] / vb[2])
        src = src.replace("<svg ", f'<svg width="{width}" height="{h}" ', 1)
    w, h = (int(float(v)) for v in re.search(r'width="([\d.]+)" height="([\d.]+)"', src).groups())
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as tmp:
        tmp.write(src)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=1", "--force-color-profile=srgb",
                    "--default-background-color=00000000", f"--window-size={w},{h + 400}",
                    f"--screenshot={png}", f"file://{tmp.name}"],
                   check=True, capture_output=True)
    os.unlink(tmp.name)
    Image.open(png).crop((0, 0, w, h)).save(png, optimize=True)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = Path(sys.argv[1])
    for name, mark in MARKS.items():
        (BRAND / f"{name}.svg").write_text(tight(mark, "master"))
    for rel, (src, width) in EXPORTS.items():
        svg = out / f"{rel}.svg"
        svg.parent.mkdir(parents=True, exist_ok=True)
        svg.write_text(src)
        render(svg, svg.with_suffix(".png"), width)
        print(rel)


if __name__ == "__main__":
    main()
