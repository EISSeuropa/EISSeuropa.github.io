#!/usr/bin/env python3
"""Generate the anniversary year's social posts from the site's data (#1865).

Every 2027 #EISS10 post that can be written from data, as a 1200 × 1200 card
plus a LinkedIn caption and a shorter X caption:

    launch       13 January: the anniversary itself
    throwback    one past edition a month, no post in June or August (#1853)
    board        "Meet the board", one member each Thursday, February to May
    theme        "From the Anthology", one research theme a month

Figures come from src/_data/facts.js (#1864), never typed here. Captions are
English only: French and German versions are translated by hand or not at all.

Usage
-----
    python3 scripts/make-anniversary-posts.py <out-dir> [--quarter 2027Q1]

Writes <out-dir>/<date>-<kind>-<slug>.png for each post in range and
<out-dir>/queue.md, the checklist the quarterly queue issue is made of
(.github/workflows/social-queue.yml, #1866). With no --quarter, the whole year.

Cards are HTML pages rendered by headless Chrome (override with $CHROME) and
cropped with Pillow. A design instrument, not a build step.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SITE = "https://eiss-europa.com"
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
TAG = "#EISS10"
ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]


def load() -> dict:
    """Read the facts, board and themes through Node, as the site does."""
    js = """
    const facts = require('./src/_data/facts.js');
    const board = require('./src/_data/board.json');
    const pi = require('./src/_data/paperIndex.js');
    const t = require('./src/_data/atlasThemePages.js');
    const pages = typeof t === 'function' ? t() : t;
    const themes = pages.map(p => ({
      name: p.label.en, slug: p.slug, count: p.count, firstYear: p.firstYear,
      byYear: Object.fromEntries(pi.years.map(y => [y.year,
        pi.papers.filter(x => x.year === y.year && (x.theme || []).includes(p.name)).length])),
    }));
    console.log(JSON.stringify({facts, members: board.members, themes}));
    """
    out = subprocess.run(["node", "-e", js], cwd=REPO, check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


def slugify(name: str) -> str:
    import re
    import unicodedata
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")


def long_date(d: dt.date) -> str:
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"


def nth_weekday(year: int, month: int, weekday: int, n: int) -> dt.date:
    d = dt.date(year, month, 1)
    d += dt.timedelta(days=(weekday - d.weekday()) % 7)
    return d + dt.timedelta(weeks=n - 1)


# ---------- the year's plan ----------
LAUNCH = dt.date(2027, 1, 13)
# Month of 2027 -> edition year (2020 is the deferred one). #1853.
THROWBACKS = {1: 2017, 2: 2018, 3: 2019, 4: 2020, 5: 2021, 7: 2022, 9: 2023, 10: 2024, 11: 2025, 12: 2026}
THEME_MONTHS = [2, 3, 4, 5, 7, 9, 10, 11, 12]
LEADERSHIP = 3   # the first three board entries lead the launch post instead


def posts(data: dict) -> list[dict]:
    facts = data["facts"]
    eds = {e["year"]: e for e in facts["conferences"]["editions"]}
    a = facts["anthology"]
    out = []
    cities = len({e["city"] for e in eds.values() if e["year"] < 2027})

    out.append(dict(
        date=LAUNCH, kind="launch", slug="eiss-at-ten", title="EISS turns ten",
        card=dict(eyebrow="Since 13 January 2017", headline="Ten years of security studies in Europe",
                  lines=[f"{facts['conferences']['held']} conferences in {cities} cities, the tenth in Belgrade in June",
                         f"{a['papers']} papers by {a['authors']} authors in the Anthology"]),
        caption=(f"Ten years ago today, the first EISS conference opened at University Panthéon-Assas in Paris. "
                 f"Since then: {facts['conferences']['held']} conferences across Europe, {a['papers']} papers by {a['authors']} authors in the Anthology, "
                 f"and a COST Action, NetSec, that EISS co-founded. The tenth conference meets in Belgrade on 10–11 June 2027. "
                 f"Thank you to everyone who made the first ten years. {TAG}\n{SITE}/"),
        short=f"Ten years ago today, the first EISS conference opened in Paris. {facts['conferences']['held']} conferences and {a['papers']} papers later, the tenth meets in Belgrade in June. {TAG} {SITE}/",
    ))

    for month, year in THROWBACKS.items():
        date = LAUNCH if month == 1 else nth_weekday(2027, month, 1, 2)   # second Tuesday
        if year == 2020:
            out.append(dict(
                date=date, kind="throwback", slug="2020", title="Throwback: 2020, deferred",
                card=dict(eyebrow="Throwback · 2020", headline="The conference that waited a year",
                          lines=["Deferred by the pandemic", "Met in Lisbon, September 2021, in person and online"]),
                caption=(f"{TAG} throwback: 2020. The conference planned for that year was deferred by the pandemic. "
                         f"It met a year later in Lisbon, on 3–4 September 2021, in person and online.\n{SITE}/2020.html"),
                short=f"{TAG} throwback: 2020, the conference that waited a year. It met in Lisbon in September 2021, in person and online. {SITE}/2020.html",
            ))
            continue
        e = eds[year]
        when = e.get("dates") or long_date(dt.date.fromisoformat(e["startDate"]))
        ago = 2027 - year
        # Some venues are only "City, Country" in conferences.js: say "in" for those.
        at = f"in {e['city']}" if e["venue"] == f"{e['city']}, {e['country']}" else f"at {e['venue']}"
        out.append(dict(
            date=date, kind="throwback", slug=str(year), title=f"Throwback: {e['city']} {year}",
            card=dict(eyebrow=f"Throwback · {ago} year{'s' if ago > 1 else ''} ago", headline=f"{e['city']} {year}",
                      lines=[f"The {ORDINALS[e['ordinal'] - 1]} annual conference", e["venue"] if at.startswith("at") else e["country"],
                             f"{e['papers']} papers, now in the Anthology"]),
            caption=(f"{TAG} throwback: {e['city']}, {when}. The {ORDINALS[e['ordinal'] - 1]} annual conference met {at}. "
                     f"{e['papers']} of its papers are in the Anthology.\n{SITE}/{year}.html"),
            short=f"{TAG} throwback: {e['city']}, {year}, the {ORDINALS[e['ordinal'] - 1]} annual conference. {e['papers']} of its papers are in the Anthology. {SITE}/{year}.html",
        ))

    board = [m for m in data["members"] if not m.get("formerMember")][LEADERSHIP:]
    for i, m in enumerate(board):
        date = nth_weekday(2027, 2, 3, 1) + dt.timedelta(weeks=i)   # Thursdays from 4 February
        where = ", ".join(x for x in (m.get("position"), m.get("institution")) if x)
        out.append(dict(
            date=date, kind="board", slug=m.get("slug") or slugify(m["name"]), title=f"Meet the board: {m['name']}",
            card=dict(eyebrow="Meet the board", headline=m["name"], lines=[m["role"], where], photo=m.get("photo")),
            caption=f"{TAG} Meet the board: {m['name']}, {m['role'].lower()} of EISS. {where}.\n{SITE}/board.html",
            short=f"{TAG} Meet the board: {m['name']}, {where}. {SITE}/board.html",
        ))

    themes = sorted(data["themes"], key=lambda t: -t["count"])
    for month, t in zip(THEME_MONTHS, themes):
        date = nth_weekday(2027, month, 1, 4)   # fourth Tuesday
        url = f"{SITE}/anthology-atlas/theme/{t['slug']}.html"
        out.append(dict(
            date=date, kind="theme", slug=t["slug"], title=f"From the Anthology: {t['name']}",
            card=dict(eyebrow="From the Anthology", headline=t["name"],
                      lines=[f"{t['count']} papers since {t['firstYear']}"], bars=t["byYear"]),
            caption=f"{TAG} From the Anthology: {t['count']} papers on “{t['name']}” have been presented at EISS conferences since {t['firstYear']}. Explore them in the Atlas.\n{url}",
            short=f"{TAG} From the Anthology: {t['count']} papers on “{t['name']}” since {t['firstYear']}. {url}",
        ))
    return sorted(out, key=lambda p: (p["date"], p["kind"]))


# ---------- cards ----------
FONT = (REPO / "src/assets/fonts/inter/latin-wght-normal.woff2").as_uri()
LOCKUP = (REPO / "src/assets/images/brand/eiss-10-lockup.svg").read_text()

CSS = """
@font-face { font-family: Inter; src: url('%s') format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 1200px; font-family: Inter, sans-serif; color: hsl(222 28%% 12%%);
  background: radial-gradient(900px circle at 12%% 8%%, hsl(203 88%% 70%% / .22), transparent 55%%),
              radial-gradient(800px circle at 92%% 4%%, hsl(190 80%% 65%% / .18), transparent 55%%),
              hsl(210 33%% 98%%);
  padding: 96px; display: flex; flex-direction: column; }
.eyebrow { font-size: 30px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #0071b8; }
h1 { font-size: 104px; font-weight: 800; letter-spacing: -.03em; line-height: 1.02; margin-top: 28px; text-wrap: balance; }
.lines { margin-top: 40px; display: grid; gap: 14px; font-size: 40px; line-height: 1.25; color: hsl(222 16%% 34%%); }
.photo { width: 300px; height: 300px; border-radius: 50%%; object-fit: cover; object-position: top; margin-bottom: 48px;
  border: 6px solid #73caff; }
.bars { margin-top: auto; display: flex; align-items: flex-end; gap: 14px; height: 220px; }
.bar { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 10px;
  font-size: 22px; color: hsl(222 16%% 34%%); height: 100%%; }
.bar i { display: block; width: 100%%; background: #73caff; border-radius: 6px 6px 0 0; }
footer { margin-top: auto; padding-top: 48px; display: flex; justify-content: space-between; align-items: flex-end; }
footer svg { height: 120px; width: auto; color: #007bc6; }
footer span { font-size: 30px; font-weight: 600; color: #007bc6; }
""" % FONT


def card_html(card: dict) -> str:
    e = html.escape
    photo = ""
    if card.get("photo"):
        photo = f'<img class="photo" src="{(REPO / "src" / card["photo"].lstrip("/")).as_uri()}" alt="">'
    bars = ""
    if card.get("bars"):
        top = max(card["bars"].values()) or 1
        bars = '<div class="bars">' + "".join(
            f'<div class="bar"><i style="height:{max(4, round(160 * n / top))}px"></i>{y}</div>'
            for y, n in sorted(card["bars"].items())) + "</div>"
    lines = "".join(f"<div>{e(x)}</div>" for x in card["lines"] if x)
    return (f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><body>{photo}'
            f'<div class="eyebrow">{e(card["eyebrow"])}</div><h1>{e(card["headline"])}</h1>'
            f'<div class="lines">{lines}</div>{bars}'
            f'<footer>{LOCKUP}<span>{TAG}</span></footer></body>')


def render(page: str, png: Path, size: int = 1200) -> None:
    """Headless Chrome screenshot, sRGB. Its viewport runs shorter than
    --window-size, so render tall and crop."""
    from PIL import Image

    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
        tmp.write(page)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
                    "--force-device-scale-factor=1", "--force-color-profile=srgb", "--allow-file-access-from-files",
                    f"--window-size={size},{size + 400}", f"--screenshot={png}", Path(tmp.name).as_uri()],
                   check=True, capture_output=True)
    os.unlink(tmp.name)
    Image.open(png).convert("RGB").crop((0, 0, size, size)).save(png, optimize=True)


def quarter_range(q: str | None) -> tuple[dt.date, dt.date]:
    if not q:
        return dt.date(2027, 1, 1), dt.date(2027, 12, 31)
    year, n = int(q[:4]), int(q[-1])
    start = dt.date(year, 3 * n - 2, 1)
    end = dt.date(year + (n == 4), (3 * n) % 12 + 1, 1) - dt.timedelta(days=1)
    return start, end


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("out", type=Path)
    ap.add_argument("--quarter", help="e.g. 2027Q1; default the whole year")
    ap.add_argument("--no-images", action="store_true", help="captions and queue only")
    args = ap.parse_args()

    start, end = quarter_range(args.quarter)
    todo = [p for p in posts(load()) if start <= p["date"] <= end]
    args.out.mkdir(parents=True, exist_ok=True)
    md = [f"{len(todo)} posts, {long_date(start)} to {long_date(end)}. Schedule each one in LinkedIn's and X's own schedulers, then tick it.\n"]
    for p in todo:
        name = f"{p['date'].isoformat()}-{p['kind']}-{p['slug']}.png"
        if not args.no_images:
            render(card_html(p["card"]), args.out / name)
        assert len(p["short"]) <= 280, (name, len(p["short"]))
        md.append(f"### {p['date'].strftime('%a')} {long_date(p['date'])} · {p['title']}\n\n"
                  f"- [ ] LinkedIn\n- [ ] X\n\nImage: `{name}`\n\n**LinkedIn**\n\n```text\n{p['caption']}\n```\n\n"
                  f"**X** ({len(p['short'])} characters)\n\n```text\n{p['short']}\n```\n")
        print(name)
    (args.out / "queue.md").write_text("\n".join(md), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
