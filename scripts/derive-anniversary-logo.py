#!/usr/bin/env python3
"""Derive the EISS 10th-anniversary logo and its export set (#1852).

Two marks, both built on the unaltered EISS lockup:

    eiss-10-lockup   the lockup, a hairline divider, a large "10", then
                     "YEARS" over 2017–2027. The anniversary logo proper:
                     email header, signature, banners.

    eiss-10-roundel  a seal: the full name round the ring, the lockup and
                     "10 YEARS" inside, 2017 · 2027 at the foot. Made for
                     the circular crop of social profile pictures.

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

import math
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


def arc(s: str, size: float, wght: int, track: float, r: float, top: bool, c: float = 200) -> str:
    """Set `s` on a circle of radius r round (c, c), centred on its top or foot, reading left to right."""
    total = text(s, size, 0, 0, wght, track)[1]
    out, pos = [], 0.0
    for ch in s:
        adv = text(ch, size, 0, 0, wght)[1]
        mid = pos + adv / 2 - total / 2
        th = -math.pi / 2 + mid / r if top else math.pi / 2 - mid / r
        rot = math.degrees(th) + (90 if top else -90)
        d, _ = text(ch, size, -adv / 2, 0, wght)
        out.append(f'<path transform="translate({c + r * math.cos(th):.2f} {c + r * math.sin(th):.2f}) rotate({rot:.2f})" d="{d}"/>')
        pos += adv + track
    return "".join(out)


def mark_roundel(theme: str):
    """The seal, in a 400 × 400 box: concept C of #1852."""
    t, n, _ = THEMES[theme]
    master = theme == "master"
    ink = 'class="logo-text" fill="currentColor"' if master else f'fill="{t}"'
    net = paint("logo-network", theme)
    ring_t = 'class="logo-text" stroke="currentColor"' if master else f'stroke="{t}"'
    ring_n = 'class="logo-network" stroke="var(--brand-network, #73caff)"' if master else f'stroke="{n}"'
    s = 196 / (LOCKUP_BOX[2] - LOCKUP_BOX[0])
    lock = f'<g transform="translate({200 - 98 + 6 - LOCKUP_BOX[0] * s:.2f} {124 - LOCKUP_BOX[1] * s:.2f}) scale({s:.4f})">{lockup(theme)}</g>'
    w10 = text("10 YEARS", 32, 0, 0, 800, 1.5)[1]
    d10, _ = text("10 YEARS", 32, 200 - w10 / 2, 268, 800, 1.5)
    dots = "".join(f'<circle cx="{200 + 159 * math.cos(math.radians(a)):.2f}" cy="{200 + 159 * math.sin(math.radians(a)):.2f}" r="4" {net}/>' for a in (22, 158))
    body = (f'<circle cx="200" cy="200" r="186" fill="none" {ring_t} stroke-width="5"/>'
            f'<circle cx="200" cy="200" r="136" fill="none" {ring_n} stroke-width="2"/>'
            f'<g {ink}>{arc("EUROPEAN INITIATIVE FOR SECURITY STUDIES", 20.5, 700, 1.6, 150, True)}'
            f'{arc("2017 · 2027", 21, 700, 3, 165, False)}</g>'
            + dots + lock + f'<path d="{d10}" {ink}/>')
    return body, (11.5, 11.5, 388.5, 388.5)


MARKS = {"eiss-10-lockup": mark_lockup, "eiss-10-roundel": mark_roundel}
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

L, R = mark_lockup, mark_roundel
# path: (svg source, png width or None for the svg's own size)
EXPORTS = {
    # logo files: transparent, for documents, slides and partner kits
    **{f"logo/eiss-10-lockup-{t}": (tight(L, t), 2400) for t in ("colour", "white", "black")},
    **{f"logo/eiss-10-roundel-{t}": (tight(R, t), 2400) for t in ("colour", "white", "black")},
    # profile pictures: the platforms crop to a circle, and the roundel is one
    "profile/profile-800-white": (canvas(R, "colour-on-white", 800, 800, 0.97), None),
    "profile/profile-800-blue": (canvas(R, "on-blue", 800, 800, 0.97), None),
    # banners: the profile picture overlaps bottom left on all four platforms, so the logo sits right
    "banners/x-mastodon-1500x500": (canvas(L, "colour", 1500, 500, 0.4, "right", mesh=True), None),
    "banners/x-mastodon-1500x500-blue": (canvas(L, "on-blue", 1500, 500, 0.4, "right"), None),
    "banners/bluesky-3000x1000": (canvas(L, "colour", 3000, 1000, 0.4, "right", mesh=True), None),
    "banners/bluesky-3000x1000-blue": (canvas(L, "on-blue", 3000, 1000, 0.4, "right"), None),
    "banners/linkedin-company-2256x382": (canvas(L, "colour", 2256, 382, 0.5, "right", mesh=True), None),
    "banners/linkedin-company-2256x382-blue": (canvas(L, "on-blue", 2256, 382, 0.5, "right"), None),
    # YouTube channel art: 2560 × 1440, but only the central 1546 × 423 shows on every device, so the logo stays inside it
    "banners/youtube-2560x1440": (canvas(L, "colour", 2560, 1440, 0.175, mesh=True), None),
    "banners/youtube-2560x1440-blue": (canvas(L, "on-blue", 2560, 1440, 0.175), None),
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
    shot = png.with_suffix(".shot.png")  # Chrome can finish writing after it exits: crop from a copy
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=1", "--force-color-profile=srgb",
                    "--default-background-color=00000000", f"--window-size={w},{h + 400}",
                    f"--screenshot={shot}", f"file://{tmp.name}"],
                   check=True, capture_output=True)
    os.unlink(tmp.name)
    Image.open(shot).crop((0, 0, w, h)).save(png, optimize=True)
    shot.unlink()
    assert Image.open(png).size == (w, h), png


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
