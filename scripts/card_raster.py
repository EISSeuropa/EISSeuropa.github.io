"""Rasterise a share-card SVG to a JPEG, on any machine (#2153).

The card scripts (make-share-cards.py, make-anthology-social.py, and the Atlas
map card through make-share-cards.py) author each image as an SVG on a square
canvas S = max(W, H), with the content in the centred W×H band, and keep that
band as a JPEG. Until #2153 the only renderer was macOS qlmanage plus sips, so
no card could be regenerated in CI, in a cloud session or on any other laptop.

Renderers, in order of preference:

1. Headless Chrome or Chromium. Installed on GitHub's Ubuntu runners and in
   Claude Code cloud sessions, and on most desktops. Set CHROME_BIN to pick a
   binary. Crop and JPEG encoding use Pillow (scripts/requirements.txt), or
   sips on a Mac without Pillow.
2. macOS qlmanage + sips, the original pipeline.

SHARE_CARD_RENDERER=chrome or =qlmanage forces one. Chrome is the default
wherever it is found, so a card looks the same whoever regenerates it.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from xml.etree import ElementTree

JPEG_QUALITY = 88

_CHROME_NAMES = ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome")
_CHROME_MAC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def chrome_binary() -> str | None:
    env = os.environ.get("CHROME_BIN")
    if env:
        return env
    for name in _CHROME_NAMES:
        found = shutil.which(name)
        if found:
            return found
    return _CHROME_MAC if Path(_CHROME_MAC).exists() else None


def renderer() -> str:
    forced = os.environ.get("SHARE_CARD_RENDERER")
    if forced in ("chrome", "qlmanage"):
        return forced
    if chrome_binary():
        return "chrome"
    if shutil.which("qlmanage"):
        return "qlmanage"
    sys.exit("No SVG renderer: install Chrome or Chromium (or set CHROME_BIN), "
             "or run on macOS for qlmanage.")


def _render_png(svg_path: Path, size: int, work: Path) -> Path:
    """Render the square SVG canvas to a size×size PNG in `work`."""
    png = work / f"{svg_path.stem}.png"
    if renderer() == "chrome":
        subprocess.run(
            [chrome_binary(), "--headless", "--no-sandbox", "--disable-gpu",
             "--hide-scrollbars", "--force-device-scale-factor=1",
             f"--window-size={size},{size}",
             # Lets the embedded @font-face (font-display: block) load before
             # the capture, so the text is Inter and never the fallback face.
             "--virtual-time-budget=3000",
             f"--screenshot={png}", svg_path.resolve().as_uri()],
            check=True, capture_output=True, timeout=120,
        )
    else:
        subprocess.run(["qlmanage", "-t", "-s", str(size), "-o", str(work), str(svg_path)],
                       check=True, capture_output=True)
        png = work / f"{svg_path.name}.png"
    if not png.exists():
        sys.exit(f"{renderer()} produced no output for {svg_path.name}")
    return png


def _crop_to_jpeg(png: Path, w: int, h: int, dest: Path) -> None:
    try:
        from PIL import Image
    except ImportError:
        if not shutil.which("sips"):
            sys.exit("Cropping needs Pillow: pip install -r scripts/requirements.txt")
        subprocess.run(["sips", "-c", str(h), str(w), "-s", "format", "jpeg",
                        "-s", "formatOptions", str(JPEG_QUALITY), str(png), "--out", str(dest)],
                       check=True, capture_output=True)
        return
    with Image.open(png) as im:
        left, top = (im.width - w) // 2, (im.height - h) // 2
        im.crop((left, top, left + w, top + h)).convert("RGB").save(
            dest, "JPEG", quality=JPEG_QUALITY, optimize=True)


def rasterize(svg: str | Path, w: int, h: int, dest: Path) -> Path:
    """Render `svg` (markup, or a path to an .svg file) authored on a
    max(w, h) square canvas, keep the centred w×h band, write it to `dest`
    as a JPEG and return `dest`."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="card-"))
    try:
        if isinstance(svg, Path):
            svg_path = svg
        else:
            svg_path = work / "card.svg"
            svg_path.write_text(svg, encoding="utf-8")
        # Chrome draws malformed SVG as an HTML page with the text missing,
        # and still exits 0. It shipped blank French Atlas cards in testing.
        try:
            ElementTree.parse(svg_path)
        except ElementTree.ParseError as exc:
            raise SystemExit(f"{dest.name}: the card SVG is not well-formed XML ({exc})")
        png = _render_png(svg_path, max(w, h), work)
        _crop_to_jpeg(png, w, h, dest)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    return dest


def rasterize_many(jobs: list[tuple[str, int, int, Path]], workers: int | None = None) -> None:
    """Render (svg_markup, w, h, dest) jobs in parallel: one Chrome process
    per card takes about 1.5 s, so the paper cards run four or more at once."""
    workers = workers or max(2, min(8, os.cpu_count() or 2))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for future in [pool.submit(rasterize, *job) for job in jobs]:
            future.result()
