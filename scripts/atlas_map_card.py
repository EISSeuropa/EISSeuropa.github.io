"""The Atlas share card, drawn from the corpus rather than captured by hand.

The English card used to be a screenshot of the live map, composed by hand
(#1156). That worked while the Atlas was English-only. #1495 published it in
French and German, and a screenshot does not translate: the hub labels on the
map are the reader's language now, so each locale needs its own picture.

Rather than three hand captures that go stale the next time the corpus grows
(#1545), this redraws the map from `anthologyAtlas.js` using the same layout
the browser uses: same seeded PRNG, same ring of hubs, same forces, same
colours. The result is an SVG, which the existing qlmanage pipeline in
make-share-cards.py already knows how to rasterise, so no new dependency
enters the build (§16.3).

It will not be pixel-identical to any given moment of the live map, because
the live one keeps simulating while you watch it. It is the same corpus under
the same rules, which is what the card is claiming to show.
"""
from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Mirrors THEME_WHEEL in src/assets/js/anthology-atlas.js. A hub keeps its
# colour across locales because the wheel is indexed by theme order, not name.
THEME_WHEEL = [
    "#0973de", "#10b981", "#8457ea", "#f59e0b", "#e2568c",
    "#0aa2c0", "#7a9a01", "#b3562e", "#5867dd", "#2e9e6a",
    "#a855f7", "#d97706", "#3b82f6", "#14b8a6", "#ef4444",
    "#6366f1", "#059669",
]
INACTIVE = "#9aa7bd"      # --atlas-inactive, the Untagged hub
INK = "#e8edf7"
BG = "#0b0f1a"

W, H = 1200, 630          # the card, and the box the simulation runs in
BAND_TOP = (1200 - H) // 2  # qlmanage renders a square; sips keeps the middle


def mulberry32(a: int):
    """The PRNG from the browser, so the seeded layout matches."""
    state = a & 0xFFFFFFFF

    def rand() -> float:
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        t = state
        t = (t ^ (t >> 15)) * (1 | t) & 0xFFFFFFFF
        t = (t + ((t ^ (t >> 7)) * (61 | t) & 0xFFFFFFFF)) & 0xFFFFFFFF ^ t
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return rand


def load_corpus() -> dict:
    out = subprocess.run(
        ["node", "-e",
         "const m=require('./src/_data/anthologyAtlas.js');"
         "process.stdout.write(JSON.stringify(typeof m==='function'?m():m))"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    return json.loads(out)


def build(corpus: dict, labels: dict) -> tuple[list, list]:
    """Hubs and paper nodes, in the same order and shape as the browser's."""
    hubs = []
    for i, name in enumerate(corpus.get("themes", [])):
        hubs.append({"id": f"t{i}", "type": "theme", "name": name, "wheel": i,
                     "count": 0, "label": labels.get(name, name)})
    by_theme = {h["name"]: h["id"] for h in hubs}
    untagged = {"id": "untagged", "type": "untagged", "name": "Untagged",
                "wheel": 0, "count": 0, "label": labels.get("__untagged__", "Untagged")}

    nodes, need_untagged = [], False
    for p in corpus.get("papers", []):
        ids = [by_theme[t] for t in (p.get("themes") or []) if t in by_theme]
        if not ids:
            ids = ["untagged"]
            need_untagged = True
        nodes.append({"hubs": ids, "r": 4.6 if p.get("hasPage") else 3.6,
                      "hasPage": bool(p.get("hasPage")),
                      "x": 0.0, "y": 0.0, "vx": 0.0, "vy": 0.0})
    if need_untagged:
        hubs.append(untagged)

    by_id = {h["id"]: h for h in hubs}
    for n in nodes:
        for hid in n["hubs"]:
            by_id[hid]["count"] += 1
    for h in hubs:
        h["r"] = max(16.0, math.sqrt(h["count"]) * 3.6)
    return hubs, nodes


def layout(hubs: list, nodes: list, ticks: int = 320) -> None:
    """seedPositions() then reheat(320), as the page does on load."""
    rand = mulberry32(19172)          # the Papers lens seed
    cx, cy = W / 2, H / 2
    for i, h in enumerate(hubs):
        ang = (i / len(hubs)) * math.pi * 2 - math.pi / 2
        h["x"] = cx + math.cos(ang) * W * 0.36
        h["y"] = cy + math.sin(ang) * H * 0.38
    by_id = {h["id"]: h for h in hubs}
    for n in nodes:
        linked = [by_id[i] for i in n["hubs"]]
        mx = sum(h["x"] for h in linked) / len(linked)
        my = sum(h["y"] for h in linked) / len(linked)
        n["x"] = mx + (rand() - 0.5) * 120
        n["y"] = my + (rand() - 0.5) * 120

    for _ in range(ticks):
        for n in nodes:
            for hid in n["hubs"]:
                h = by_id[hid]
                dx, dy = h["x"] - n["x"], h["y"] - n["y"]
                d = math.hypot(dx, dy) or 1
                f = (d - (h["r"] + 46)) * 0.004
                n["vx"] += (dx / d) * f * 60
                n["vy"] += (dy / d) * f * 60
            n["vx"] += (W / 2 - n["x"]) * 0.0004
            n["vy"] += (H / 2 - n["y"]) * 0.0004
        for i in range(len(nodes)):
            a = nodes[i]
            for j in range(i + 1, len(nodes)):
                b = nodes[j]
                dx, dy = b["x"] - a["x"], b["y"] - a["y"]
                d2 = dx * dx + dy * dy
                if d2 > 4600 or d2 == 0:
                    continue
                d = math.sqrt(d2)
                f = 24 / d2
                dx /= d
                dy /= d
                a["vx"] -= dx * f * 60
                a["vy"] -= dy * f * 60
                b["vx"] += dx * f * 60
                b["vy"] += dy * f * 60
        for n in nodes:
            for h in hubs:
                dx, dy = n["x"] - h["x"], n["y"] - h["y"]
                d = math.hypot(dx, dy) or 1
                lo = h["r"] + 12
                if d < lo:
                    n["x"] = h["x"] + (dx / d) * lo
                    n["y"] = h["y"] + (dy / d) * lo
            n["vx"] *= 0.82
            n["vy"] *= 0.82
            n["x"] += n["vx"] * 0.016
            n["y"] += n["vy"] * 0.016
            n["x"] = max(10, min(W - 10, n["x"]))
            n["y"] = max(10, min(H - 10, n["y"]))


def esc(s: str) -> str:
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def hub_fill(h: dict) -> str:
    return INACTIVE if h["type"] == "untagged" else THEME_WHEEL[h["wheel"] % len(THEME_WHEEL)]


def svg(hubs: list, nodes: list, title: str, subtitle: str, mark: str) -> str:
    by_id = {h["id"]: h for h in hubs}
    o = BAND_TOP
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" '
        f'width="1200" height="1200">',
        f'<rect width="1200" height="1200" fill="{BG}"/>',
        # The ring of hubs reaches the edges of the box it was simulated in,
        # so their labels would sit half off the card. A small scale about the
        # centre keeps the layout faithful and brings the extremes inside the
        # frame; the alternative, simulating in a smaller box, changes the
        # spacing the forces settle into.
        f'<g transform="translate({W / 2:.0f} {o + H / 2:.0f}) scale(0.9) '
        f'translate({-W / 2:.0f} {-H / 2:.0f})">',
    ]
    # Edges first, so the dots sit on top, exactly as the canvas paints them.
    for n in nodes:
        for hid in n["hubs"]:
            h = by_id[hid]
            parts.append(
                f'<line x1="{n["x"]:.1f}" y1="{n["y"]:.1f}" x2="{h["x"]:.1f}" '
                f'y2="{h["y"]:.1f}" stroke="{hub_fill(h)}" stroke-width="1" '
                f'stroke-opacity="0.14"/>')
    for n in nodes:
        fill = hub_fill(by_id[n["hubs"][0]])
        if n["hasPage"]:
            parts.append(f'<circle cx="{n["x"]:.1f}" cy="{n["y"]:.1f}" '
                         f'r="{n["r"]}" fill="{fill}"/>')
        else:
            parts.append(f'<circle cx="{n["x"]:.1f}" cy="{n["y"]:.1f}" '
                         f'r="{n["r"]}" fill="none" stroke="{fill}" '
                         f'stroke-width="1.4" stroke-opacity="0.85"/>')
    for h in hubs:
        parts.append(f'<circle cx="{h["x"]:.1f}" cy="{h["y"]:.1f}" '
                     f'r="{h["r"]:.1f}" fill="{hub_fill(h)}"/>')
        parts.append(
            f'<text x="{h["x"]:.1f}" y="{h["y"] + 5:.1f}" text-anchor="middle" '
            f'font-family="Inter, sans-serif" font-size="12" font-weight="700" '
            f'fill="#fff">{h["count"]}</text>')
        label = h["label"]
        if len(label) > 26:
            label = label[:25] + "…"
        parts.append(
            f'<text x="{h["x"]:.1f}" y="{h["y"] + h["r"] + 15:.1f}" '
            f'text-anchor="middle" font-family="Inter, sans-serif" '
            f'font-size="11" font-weight="600" fill="#93a0b8">{esc(label)}</text>')
    parts.append("</g>")
    # Scrim under the type, so the words stay readable over a busy corner.
    parts.append(
        f'<defs><linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{BG}" stop-opacity="0"/>'
        f'<stop offset="0.55" stop-color="{BG}" stop-opacity="0.72"/>'
        f'<stop offset="1" stop-color="{BG}" stop-opacity="0.96"/>'
        f'</linearGradient></defs>')
    parts.append(f'<rect x="0" y="{o + H * 0.35:.0f}" width="1200" '
                 f'height="{H * 0.65:.0f}" fill="url(#scrim)"/>')
    parts.append(f'<g transform="translate(56 {o + H - 150})">{mark}</g>')
    parts.append(
        f'<text x="176" y="{o + H - 84}" font-family="Inter, sans-serif" '
        f'font-size="58" font-weight="700" fill="{INK}">{esc(title)}</text>')
    parts.append(
        f'<text x="176" y="{o + H - 44}" font-family="Inter, sans-serif" '
        f'font-size="27" fill="#aab6cc">{esc(subtitle)}</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def mark_svg(size: float = 96.0) -> str:
    """The EISS network mark, scaled into a box, as the English card carries."""
    raw = (ROOT / "src/assets/images/brand/logo-mark.svg").read_text(encoding="utf-8")
    import re
    vb = re.search(r'viewBox="([\d.\- ]+)"', raw)
    inner = raw[raw.index(">", raw.index("<svg")) + 1:raw.rindex("</svg>")]
    # Drop the accessibility titles: the card is one flat image, and the alt
    # text belongs to the <img> that carries it, not to a group inside it.
    inner = re.sub(r"<title.*?</title>|<desc.*?</desc>", "", inner, flags=re.S)
    x0, y0, w, h = (float(v) for v in vb.group(1).split())
    s = size / max(w, h)
    return (f'<g transform="scale({s:.4f}) translate({-x0:.2f} {-y0:.2f})">'
            f'{inner}</g>')


def write_card(lang: str, title: str, subtitle: str, labels: dict,
               dest: Path, ticks: int = 320) -> Path:
    corpus = load_corpus()
    hubs, nodes = build(corpus, labels)
    layout(hubs, nodes, ticks=ticks)
    dest.write_text(svg(hubs, nodes, title, subtitle, mark_svg()), encoding="utf-8")
    return dest
