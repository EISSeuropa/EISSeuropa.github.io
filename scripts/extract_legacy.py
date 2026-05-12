"""Extract clean content blocks from a Mobirise/AMP legacy page.

Reads a legacy HTML file, strips the Mobirise chrome (menu, footer, sidebar,
scroll-to-top, all scripts/styles/svgs/AMP boilerplate), and prints content
sections in order with their text + images + links extracted.

Intended as input for hand-writing the new .njk template — NOT a code generator.

Usage:
    python3 scripts/extract_legacy.py src/legacy/initiative.html
"""

import re
import sys
from html import unescape

DROP_SECTION_PREFIXES = ("menu", "footer", "image1-1c", "image1-1d")  # menu + footer chrome


def clean_block(block: str) -> str:
    """Remove all scripts, styles, svgs, comments, and Mobirise icon spans."""
    block = re.sub(r"<!--.*?-->", "", block, flags=re.S)
    block = re.sub(r"<script[^>]*>.*?</script>", "", block, flags=re.S)
    block = re.sub(r"<style[^>]*>.*?</style>", "", block, flags=re.S)
    block = re.sub(r"<svg[^>]*>.*?</svg>", "", block, flags=re.S)
    # Mobirise icon wrappers
    block = re.sub(r'<span class="[^"]*mbr-iconfont[^"]*"[^>]*>.*?</span>', "", block, flags=re.S)
    return block


def block_text(block: str) -> str:
    txt = re.sub(r"<[^>]+>", " ", block)
    txt = unescape(txt)
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]
    html = open(path).read()

    # whole-document cleanup
    html = clean_block(html)

    sec_re = re.compile(r'<section[^>]*id="([^"]+)"[^>]*>')
    matches = list(sec_re.finditer(html))
    if not matches:
        print("NO SECTIONS FOUND")
        return

    for i, m in enumerate(matches):
        sid = m.group(1)
        if any(sid.startswith(p) for p in DROP_SECTION_PREFIXES):
            continue
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(html)
        body = html[start:end]

        # background image (hero candidate)
        bg = re.search(r'background-image: url\("(assets/images/[^"]+)"\)', body)
        bg_url = bg.group(1) if bg else None

        # headings
        headings = []
        for hm in re.finditer(r"<(h[1-4])[^>]*>(.*?)</\1>", body, flags=re.S):
            txt = block_text(hm.group(2))
            if txt:
                headings.append((hm.group(1), txt))

        # paragraphs
        paragraphs = []
        for pm in re.finditer(r"<p[^>]*>(.*?)</p>", body, flags=re.S):
            txt = block_text(pm.group(1))
            if txt and len(txt) > 1:
                paragraphs.append(txt)

        # blockquotes
        quotes = []
        for qm in re.finditer(r"<blockquote[^>]*>(.*?)</blockquote>", body, flags=re.S):
            txt = block_text(qm.group(1))
            if txt:
                quotes.append(txt)

        # images (excluding amp-anim placeholders, sponsor logos at top, etc.)
        images = []
        for im in re.finditer(r'src="(assets/images/[^"]+)"(?:[^>]*alt="([^"]*)")?', body):
            images.append((im.group(1), im.group(2) if im.lastindex == 2 else ""))

        # outgoing links
        links = []
        for am in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', body, flags=re.S):
            href = am.group(1)
            if href.startswith("#") or "mobirise" in href:
                continue
            txt = block_text(am.group(2))
            if txt:
                links.append((href, txt))

        # buttons (mbr-section-btn)
        # already captured in links above

        # tab structure (terms/practical pages)
        tabs = []
        for tm in re.finditer(
            r'<div[^>]*role="tab"[^>]*>(.*?)</div>', body, flags=re.S
        ):
            txt = block_text(tm.group(1))
            if txt:
                tabs.append(txt)

        print(f"\n========= section {sid} =========")
        if bg_url:
            print(f"  BG: {bg_url}")
        for lvl, t in headings:
            print(f"  {lvl.upper():3}  {t}")
        for p in paragraphs:
            print(f"  P    {p}")
        for q in quotes:
            print(f"  Q    {q}")
        for img, alt in images:
            print(f"  IMG  {img}  alt={alt!r}")
        for href, t in links:
            print(f"  A    {href}  -> {t[:80]}")
        for t in tabs:
            print(f"  TAB  {t[:120]}")


if __name__ == "__main__":
    main()
