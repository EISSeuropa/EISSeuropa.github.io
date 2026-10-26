#!/usr/bin/env python3
"""Monthly #EISS10 campaign measures, as a Markdown table (#1870).

Fills in what an open API allows and leaves the rest for a person:

    automatic   Anthology papers and abstracts (src/_data/facts.js), news
                items and Belvedere posts published last month (/feed.xml),
                Bluesky followers ($BLUESKY_HANDLE, public API)
    by hand     LinkedIn and X followers, newsletter subscribers

A source that is not configured or does not answer prints "not set up" or
"unavailable" rather than failing the run.

Usage: campaign-metrics.py YYYY-MM   (the month being reported)
"""
from __future__ import annotations

import datetime as dt
import json
import os
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FEED = "https://eiss-europa.com/feed.xml"
ATOM = "{http://www.w3.org/2005/Atom}"


def get(url: str, headers: dict | None = None) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "eiss-campaign-metrics", **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def feed_counts(month: str) -> tuple[int, int]:
    root = ET.fromstring(get(FEED))
    news = blog = 0
    for e in root.iter(f"{ATOM}entry"):
        published = (e.findtext(f"{ATOM}published") or e.findtext(f"{ATOM}updated") or "")[:7]
        if published == month:
            href = e.find(f"{ATOM}link").get("href", "")
            if "/blog/" in href:
                blog += 1
            else:
                news += 1
    return news, blog


def bluesky() -> str:
    handle = os.environ.get("BLUESKY_HANDLE")
    if not handle:
        return "not set up (#1856)"
    data = json.loads(get(f"https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor={handle}"))
    return str(data["followersCount"])


def safe(fn, *args):
    try:
        return fn(*args)
    except Exception as exc:  # one dead source must not sink the report
        return f"unavailable ({type(exc).__name__})"


def main() -> None:
    month = sys.argv[1] if len(sys.argv) > 1 else (dt.date.today().replace(day=1) - dt.timedelta(days=1)).strftime("%Y-%m")
    facts = json.loads(subprocess.run(["node", "-e", "console.log(JSON.stringify(require('./src/_data/facts.js')))"],
                                      cwd=REPO, check=True, capture_output=True, text=True).stdout)
    a = facts["anthology"]
    counts = safe(feed_counts, month)
    news, blog = counts if isinstance(counts, tuple) else (counts, counts)
    rows = [
        ("LinkedIn followers", "_type it in_"),
        ("X followers", "_type it in_"),
        ("Newsletter subscribers", "_type it in_"),
        (f"News items published in {month}", news),
        (f"Belvedere posts published in {month}", blog),
        ("Anthology papers with an abstract", f"{a['abstracts']} of {a['abstractsEligible']}"),
        ("Alumni (past board and staff)", facts["people"]["alumni"]),
    ]
    if os.environ.get("BLUESKY_HANDLE"):  # Bluesky is put aside (#1856)
        rows.insert(2, ("Bluesky followers", safe(bluesky)))
    print("| Measure | Value |\n| --- | --- |")
    for name, value in rows:
        print(f"| {name} | {value} |")


if __name__ == "__main__":
    main()
