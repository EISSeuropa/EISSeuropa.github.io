#!/usr/bin/env python3
"""Derive the three web-ready logo SVG variants from the EISS brand bundle.

The brand kit (logo-EISS-base/) ships as AI / PDF / PNG / JPG / TIF
but **no SVG** — we need clean vector files for the site chrome so the
mark scales crisply at every size + recolours via CSS for light/dark
themes. This script reads the canonical RGB PDF, splits its 44 drawing
operations into three logical groups by bounding-box y-position, and
emits three SVG files plus matching raster fallbacks:

    logo-full.svg     constellation + EiSS wordmark + tagline
                      (used in the /initiative page hero + press kit)

    logo-lockup.svg   constellation + EiSS wordmark, no tagline
                      (used in the site header on desktop)

    logo-mark.svg     constellation only, no text
                      (used in the mobile header + as the canonical
                       Schema.org Organization logo URL)

Each SVG uses CSS-friendly fills so the parent stylesheet can recolour
per surface (header / footer / hero / dark mode) without forking the
file:

    .logo-text     paths use `fill="currentColor"` — set `color:` on
                   the parent and the EiSS wordmark + tagline follow.

    .logo-network  paths use the literal brand light blue (#73caff)
                   so the constellation keeps its identity even on
                   dark backgrounds; override via CSS where needed
                   (e.g. `.site-footer .logo-network { fill: white; }`).

Using `currentColor` + classes (rather than `var()` in `fill=` attrs)
is the maximally-compatible pattern — works in every SVG renderer,
not just CSS-aware browsers.

The script is idempotent — re-run it any time the brand bundle changes
to regenerate the variants. It does NOT commit the original AI/PDF
files (kept out of the repo per size + license hygiene); the operator
must have the brand bundle available at the path passed via --src.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


# Brand colours sampled from the source PDF (verified via
# `page.get_drawings()` fill tuples → hex).
NETWORK_BLUE = "#73caff"   # the constellation dots + lines (light)
BRAND_BLUE = "#007bc6"     # the EiSS wordmark + tagline (medium)

# Path-index ranges, identified by bbox y-position in the source PDF
# (235.275-unit page). Keep these as constants — they describe the
# *structure* of the artwork, not just the current export, and the
# brand kit is unlikely to be re-laid-out.
WORDMARK_INDICES = range(0, 5)   # paths 0–4: constellation + E + i + S + S
FULL_INDICES = range(0, 44)      # paths 0–43: everything


def extract_drawings(pdf_path: Path) -> tuple[list[str], list[tuple[float, float, float, float]]]:
    """Convert the PDF page to SVG and parse out each `<path>` plus bbox.

    Returns parallel lists of (path_xml, bbox) so callers can pick a
    subset and re-emit a fresh SVG with a tight viewBox.
    """
    import fitz  # PyMuPDF

    doc = fitz.open(pdf_path)
    page = doc[0]
    svg = page.get_svg_image(text_as_path=True)
    drawings = page.get_drawings()

    # PyMuPDF emits one <path .../> per drawing in document order,
    # preceded by a `<defs><clipPath>` block that ALSO contains a
    # <path> (the page-rect clip we don't want to render). Drop
    # everything up to and including </defs> before harvesting paths.
    body = svg.split("</defs>", 1)[-1] if "</defs>" in svg else svg
    paths = re.findall(r'<path[^/]+?/>', body)
    if len(paths) != len(drawings):
        raise RuntimeError(
            f"path count mismatch: {len(paths)} <path> elements vs "
            f"{len(drawings)} drawings from get_drawings(). The PyMuPDF "
            f"export format may have changed — inspect the SVG by hand."
        )

    bboxes = [(d['rect'].x0, d['rect'].y0, d['rect'].x1, d['rect'].y1)
              for d in drawings]
    return paths, bboxes


def emit_svg(paths: list[str], bbox: tuple[float, float, float, float],
             title: str, desc: str, id_suffix: str,
             pad: float = 4.0) -> str:
    """Build a clean SVG document around the given paths.

    `bbox` is the union of the chosen paths' bboxes (in source PDF
    coordinates). We pad it slightly so dot strokes don't kiss the
    edge, then emit a viewBox tight to that padded bbox so the SVG
    scales without dead whitespace.

    Hardcoded fills are rewritten to CSS custom properties with the
    sampled brand colours as fallbacks — lets the host stylesheet
    recolour per surface without needing multiple SVG copies.
    """
    x0, y0, x1, y1 = bbox
    vx = x0 - pad
    vy = y0 - pad
    vw = (x1 - x0) + 2 * pad
    vh = (y1 - y0) + 2 * pad

    # Rewrite fills: constellation keeps the literal light-blue (with
    # a class for CSS overrides); wordmark + tagline switch to
    # currentColor (with a class) so parent `color:` recolours them.
    rewritten = []
    for p in paths:
        q = p.replace(
            f'fill="{NETWORK_BLUE}"',
            f'class="logo-network" fill="{NETWORK_BLUE}"',
        ).replace(
            f'fill="{BRAND_BLUE}"',
            f'class="logo-text" fill="currentColor"',
        )
        rewritten.append(q)

    # Title/desc IDs need a per-variant suffix because nav.njk inlines
    # the lockup AND the mark on the same page (one shown desktop, one
    # mobile via CSS) — sharing "id=t" and "id=d" between them would
    # produce duplicate IDs in the rendered HTML, which validators
    # flag and which break `getElementById()` lookups against the
    # ARIA description.
    title_id = f"t-{id_suffix}"
    desc_id = f"d-{id_suffix}"
    body = "\n  ".join(rewritten)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{vx:.2f} {vy:.2f} {vw:.2f} {vh:.2f}" '
        f'role="img" aria-labelledby="{title_id} {desc_id}">\n'
        f'  <title id="{title_id}">{title}</title>\n'
        f'  <desc id="{desc_id}">{desc}</desc>\n'
        f'  {body}\n'
        f'</svg>\n'
    )


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--src",
        type=Path,
        default=Path.home() / "Downloads" / "logo-EISS-base"
                / "1-principal" / "logo-EISS-RVB.pdf",
        help="Path to the canonical RGB logo PDF in the brand bundle.",
    )
    ap.add_argument(
        "--out",
        type=Path,
        default=Path("src/assets/images/brand"),
        help="Output directory inside the repo.",
    )
    args = ap.parse_args()

    if not args.src.exists():
        print(f"error: source PDF not found at {args.src}", file=sys.stderr)
        print(f"  (pass --src </path/to/logo-EISS-RVB.pdf>)", file=sys.stderr)
        return 1

    args.out.mkdir(parents=True, exist_ok=True)
    paths, bboxes = extract_drawings(args.src)
    print(f"parsed {len(paths)} drawings from {args.src.name}")

    def bbox_union(indices):
        xs0 = min(bboxes[i][0] for i in indices)
        ys0 = min(bboxes[i][1] for i in indices)
        xs1 = max(bboxes[i][2] for i in indices)
        ys1 = max(bboxes[i][3] for i in indices)
        return xs0, ys0, xs1, ys1

    variants = [
        (
            "logo-mark.svg",
            "mark",
            [0],  # constellation only
            "EISS — network mark",
            "Constellation of dots and connecting lines representing the "
            "EISS network of European security studies researchers.",
        ),
        (
            "logo-lockup.svg",
            "lockup",
            list(WORDMARK_INDICES),  # constellation + EiSS wordmark
            "EISS",
            "The EISS network mark above the EiSS wordmark.",
        ),
        (
            "logo-full.svg",
            "full",
            list(FULL_INDICES),  # everything
            "EISS — The European Initiative for Security Studies",
            "The EISS network mark, the EiSS wordmark, and the "
            "'The European Initiative for Security Studies' tagline.",
        ),
    ]

    for name, id_suffix, indices, title, desc in variants:
        bbox = bbox_union(indices)
        chosen = [paths[i] for i in indices]
        svg = emit_svg(chosen, bbox, title, desc, id_suffix)
        (args.out / name).write_text(svg)
        size = len(svg)
        print(f"  wrote {name:18s}  paths={len(indices):2d}  "
              f"bbox=({bbox[0]:.0f},{bbox[1]:.0f},{bbox[2]:.0f},{bbox[3]:.0f})"
              f"  {size:5d} bytes")

    # Raster fallbacks for surfaces that can't use SVG (Schema.org
    # Organization logo URL, social-card overlays in the OG-card
    # regeneration script, future use). Render via PyMuPDF after
    # substituting currentColor for the brand blue — PyMuPDF doesn't
    # cascade `color:` through SVG so we resolve it at render time.
    import fitz
    rasters = [
        ("logo-full.svg", "logo-full-1024.png", 1024),
        ("logo-lockup.svg", "logo-lockup-512.png", 512),
    ]
    for svg_name, png_name, target_w in rasters:
        svg = (args.out / svg_name).read_text()
        rendered = svg.replace('fill="currentColor"', f'fill="{BRAND_BLUE}"')
        # PyMuPDF can open an SVG file path; round-trip through a temp.
        tmp = args.out / ".render-tmp.svg"
        tmp.write_text(rendered)
        doc = fitz.open(tmp)
        page = doc[0]
        scale = target_w / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=True)
        pix.save(args.out / png_name)
        tmp.unlink()
        print(f"  wrote {png_name:22s}  {pix.width}x{pix.height}  "
              f"{(args.out / png_name).stat().st_size:5d} bytes")

    return 0


if __name__ == "__main__":
    sys.exit(main())
