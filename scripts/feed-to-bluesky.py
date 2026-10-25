#!/usr/bin/env python3
"""Post new /feed.xml entries to the EISS Bluesky account (#1867).

Dormant until the board opens an account (#1856): with no $BLUESKY_HANDLE
and $BLUESKY_APP_PASSWORD it exits quietly. Use an app password, never the
account password.

Stateless: before posting, it reads the account's own recent posts and skips
any feed entry whose link is already there, so a rerun never doubles up.
Only entries published in the last MAX_AGE_DAYS are considered, so the first
run does not backfill the whole feed. During 2027 posts carry #EISS10.

Usage: feed-to-bluesky.py [--dry-run]
"""
from __future__ import annotations

import datetime as dt
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET

FEED = "https://eiss-europa.com/feed.xml"
PDS = "https://bsky.social/xrpc"
ATOM = "{http://www.w3.org/2005/Atom}"
MAX_AGE_DAYS = 3
TAG = "#EISS10"


def call(method: str, endpoint: str, body: dict | None = None, token: str | None = None) -> dict:
    headers = {"Content-Type": "application/json", "User-Agent": "eiss-feed-to-bluesky"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{PDS}/{endpoint}", method=method, headers=headers,
                                 data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def recent_entries(now: dt.datetime) -> list[dict]:
    req = urllib.request.Request(FEED, headers={"User-Agent": "eiss-feed-to-bluesky"})
    root = ET.fromstring(urllib.request.urlopen(req, timeout=30).read())
    out = []
    for e in root.iter(f"{ATOM}entry"):
        published = dt.datetime.fromisoformat((e.findtext(f"{ATOM}published") or e.findtext(f"{ATOM}updated")).replace("Z", "+00:00"))
        if now - published <= dt.timedelta(days=MAX_AGE_DAYS):
            out.append(dict(title=e.findtext(f"{ATOM}title").strip(), url=e.find(f"{ATOM}link").get("href"),
                            summary=(e.findtext(f"{ATOM}summary") or "").strip()))
    return out


def post_record(entry: dict, now: dt.datetime) -> dict:
    tag = f" {TAG}" if now.year == 2027 else ""
    title = entry["title"]
    if len(title) + len(tag) > 290:
        title = title[: 289 - len(tag)] + "…"
    text = title + tag
    record = {
        "$type": "app.bsky.feed.post",
        "text": text,
        "createdAt": now.isoformat().replace("+00:00", "Z"),
        "langs": ["en"],
        "embed": {"$type": "app.bsky.embed.external",
                  "external": {"uri": entry["url"], "title": entry["title"], "description": entry["summary"][:300]}},
    }
    if tag:  # facets index UTF-8 bytes, not characters
        start = len(title.encode()) + 1
        record["facets"] = [{"index": {"byteStart": start, "byteEnd": start + len(TAG.encode())},
                             "features": [{"$type": "app.bsky.richtext.facet#tag", "tag": TAG[1:]}]}]
    return record


def main() -> None:
    dry = "--dry-run" in sys.argv
    handle, password = os.environ.get("BLUESKY_HANDLE"), os.environ.get("BLUESKY_APP_PASSWORD")
    if not dry and not (handle and password):
        print("No Bluesky credentials: nothing to do (#1856)")
        return
    now = dt.datetime.now(dt.timezone.utc)
    entries = recent_entries(now)
    if dry:
        for e in entries:
            print(json.dumps(post_record(e, now), ensure_ascii=False))
        return
    session = call("POST", "com.atproto.server.createSession", {"identifier": handle, "password": password})
    token, did = session["accessJwt"], session["did"]
    mine = call("GET", f"app.bsky.feed.getAuthorFeed?actor={did}&limit=50", token=token)
    posted = {p["post"]["record"].get("embed", {}).get("external", {}).get("uri") for p in mine.get("feed", [])}
    for e in reversed(entries):  # oldest first, so the account reads in order
        if e["url"] in posted:
            continue
        call("POST", "com.atproto.repo.createRecord",
             {"repo": did, "collection": "app.bsky.feed.post", "record": post_record(e, now)}, token=token)
        print("Posted", e["url"])


if __name__ == "__main__":
    main()
