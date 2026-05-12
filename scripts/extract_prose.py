"""Extract the prose body of a Mobirise content section as clean HTML.

Mobirise stores all body text in a single <p> tag with <br><br> as paragraph
separators and <br>- as list markers. This converts that into proper
<p>/<h3>/<ul>/<li> structure suitable for the new design system's .prose
container.

Usage:
    python3 scripts/extract_prose.py <legacy-html> <section-id>
"""

import re
import sys
from html import unescape


def to_clean_html(raw: str) -> str:
    """Convert Mobirise <br>-soup into structured HTML."""
    # Drop any inline tags that survived (other than <a> and <em>/<strong>/<b>/<i>)
    raw = re.sub(r"</?(?:span|div|figure|h[1-6])[^>]*>", "", raw)
    raw = raw.replace("&nbsp;", " ").replace(" ", " ")

    # split on <br><br>
    chunks = re.split(r"(?:<br\s*/?>\s*){2,}", raw, flags=re.I)
    out = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        # split on single <br>
        lines = [l.strip() for l in re.split(r"<br\s*/?>", chunk, flags=re.I)]
        lines = [l for l in lines if l]

        # numbered section header? a single line like "1. Foo" with no body
        if len(lines) == 1 and re.match(r"^\d+\.\s+[A-Z]", lines[0]):
            out.append(f"<h3>{lines[0]}</h3>")
            continue

        # bulleted list (all lines starting with "- " or "•")?
        if all(re.match(r"^[-•]\s+", l) for l in lines):
            items = [re.sub(r"^[-•]\s+", "", l) for l in lines]
            out.append(
                "<ul>\n" + "\n".join(f"  <li>{i}</li>" for i in items) + "\n</ul>"
            )
            continue

        # mixed? one line followed by bullets
        if len(lines) > 1 and re.match(r"^[-•]\s+", lines[1]):
            head = lines[0]
            rest = lines[1:]
            if all(re.match(r"^[-•]\s+", l) for l in rest):
                items = [re.sub(r"^[-•]\s+", "", l) for l in rest]
                out.append(f"<p>{head}</p>")
                out.append(
                    "<ul>\n" + "\n".join(f"  <li>{i}</li>" for i in items) + "\n</ul>"
                )
                continue

        # multi-line paragraph (address block etc.)
        text = "<br>\n  ".join(lines)
        out.append(f"<p>{text}</p>")

    return "\n\n".join(out)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    path, sid = sys.argv[1], sys.argv[2]
    html = open(path).read()
    m = re.search(
        rf'<section[^>]*id="{re.escape(sid)}"[^>]*>(.*?)</section>',
        html,
        flags=re.S,
    )
    if not m:
        print(f"!!! section {sid} not found")
        sys.exit(1)
    body = m.group(1)
    body = re.sub(r"<style[^>]*>.*?</style>", "", body, flags=re.S)
    body = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<svg[^>]*>.*?</svg>", "", body, flags=re.S)
    body = re.sub(
        r'<span class="[^"]*mbr-iconfont[^"]*"[^>]*>.*?</span>', "", body, flags=re.S
    )

    # pull main heading (h2 or h3)
    h = re.search(r"<(h[2-4])[^>]*>(.*?)</\1>", body, flags=re.S)
    if h:
        htxt = re.sub(r"<[^>]+>", " ", h.group(2))
        htxt = re.sub(r"\s+", " ", htxt).strip()
        print(f"<!-- HEADING ({h.group(1)}): {htxt} -->")
        # remove that heading from body
        body = body[: h.start()] + body[h.end() :]

    # pull main paragraph (the <p> with the real content — usually the longest)
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", body, flags=re.S)
    if not paragraphs:
        print("<!-- no <p> body found -->")
        return
    longest = max(paragraphs, key=len)
    print(to_clean_html(longest))


if __name__ == "__main__":
    main()
