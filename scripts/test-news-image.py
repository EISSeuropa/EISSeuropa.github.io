#!/usr/bin/env python3
"""Self-check for the photo of a news item (scripts/news-from-issue.py).

Needs Pillow (scripts/requirements.txt), so it is apart from the stdlib
test-news-from-issue.py. No network: the download is replaced.

    python3 scripts/test-news-image.py
"""
import importlib.util
import io
import json
import os
import random
import tempfile
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("news_from_issue", HERE / "news-from-issue.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def photo(w, h, fmt="JPEG", mode="RGB", exif=None, noise=True) -> bytes:
    """Random noise compresses badly, like a detailed phone photo."""
    img = Image.new(mode, (w, h), (40, 90, 160, 0) if mode == "RGBA" else (40, 90, 160))
    if noise:
        img = Image.frombytes("RGB", (w, h), random.randbytes(w * h * 3))
        if mode == "RGBA":
            img = img.convert("RGBA")
    buf = io.BytesIO()
    kw = {"quality": 95} if fmt == "JPEG" else {}
    if exif is not None:
        kw["exif"] = exif
    img.save(buf, format=fmt, **kw)
    return buf.getvalue()


def stops(fn, *needles):
    try:
        fn()
    except SystemExit as e:
        for n in needles:
            assert n in str(e), (n, str(e))
        return
    raise AssertionError("expected the run to stop")


random.seed(1)

# A large, detailed photo ends under Bluesky's limit, at most 2000px a side.
big = photo(4032, 3024)
assert len(big) > 5_000_000, len(big)
out = mod.shrink(big)
img = Image.open(io.BytesIO(out))
assert img.format == "JPEG" and len(out) <= mod.IMAGE_MAX_BYTES, len(out)
assert max(img.size) <= mod.IMAGE_MAX_SIDE and img.size[0] > img.size[1], img.size

# A small photo keeps its size.
img = Image.open(io.BytesIO(mod.shrink(photo(800, 600, noise=False))))
assert img.size == (800, 600), img.size

# The camera data goes: no EXIF, so no GPS position. The orientation tag is
# applied first, so a portrait photo stays upright.
exif = Image.Exif()
exif[0x0112] = 6  # rotate 90° clockwise to display
exif[0x8825] = {1: "N", 2: (48.0, 51.0, 24.0)}  # GPS
src = photo(1200, 900, exif=exif, noise=False)
assert Image.open(io.BytesIO(src)).getexif().get(0x0112) == 6
img = Image.open(io.BytesIO(mod.shrink(src)))
assert img.size == (900, 1200), img.size
assert not img.getexif() and "exif" not in img.info, img.info

# A PNG with transparency becomes a JPEG on white.
img = Image.open(io.BytesIO(mod.shrink(photo(600, 400, fmt="PNG", mode="RGBA", noise=False))))
assert img.format == "JPEG" and img.mode == "RGB" and img.getpixel((10, 10)) == (255, 255, 255)

# A file that is not a photo stops the run with a message for the person.
stops(lambda: mod.shrink(b"<html>Not found</html>"), "not a photo that can be read")

# End to end: the photo is fetched after the duplicate check, saved under
# src/assets/images/news/ and named after the item.
FORM = """### Site

EISS

### Headline

ESSC 2027: save the date

### Summary

Belgrade, 10 and 11 June 2027.

### Type

event

### Link

_No response_

### Image

<img width="4032" height="3024" alt="IMG_1" src="https://github.com/user-attachments/assets/0b1c2d3e-0000-4000-8000-000000000000" />

### Image description

The Faculty of Political Science building in Belgrade.

### Publication date

2026-11-18

### Collaborator page

No collaborator
"""
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    mod.NEWS = root / "news.json"
    mod.NEWS.write_text("[]\n")
    mod.IMAGE_DIR = root / "images" / "news"
    fetched = []
    mod.fetch = lambda url: fetched.append(url) or big
    os.environ.update(ISSUE_TITLE="news:", ISSUE_BODY=FORM, ISSUE_NUMBER="1", TODAY="2026-11-18")
    mod.main()
    mod.main()  # a re-run finds the item and fetches nothing
    data = json.loads(mod.NEWS.read_text())
    assert len(data) == 1 and len(fetched) == 1, (data, fetched)
    it = data[0]
    assert it["image"] == "/assets/images/news/2026-11-18-essc-2027-save-the-date.jpg", it
    assert it["imageAlt"] == "The Faculty of Political Science building in Belgrade."
    assert "_image_url" not in it
    saved = mod.IMAGE_DIR / "2026-11-18-essc-2027-save-the-date.jpg"
    assert saved.stat().st_size <= mod.IMAGE_MAX_BYTES

print("test-news-image: all checks passed")
