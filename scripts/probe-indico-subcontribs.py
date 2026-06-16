#!/usr/bin/env python3
"""
One-shot probe: which authenticated Indico endpoint exposes SUBCONTRIBUTION
abstracts (descriptions)?

WHY
===
scripts/sync-abstracts.mjs reads contribution-level descriptions from the
anonymous /export/ API. Several ESSC panels are modelled as a contribution
(the panel) with subcontributions (the actual papers), and the paper
abstracts live on the subcontributions. The anonymous export returns
subcontribution *titles* but no description field at all, so those abstracts
never sync. This probe finds the endpoint + field that does carry them, so
sync-abstracts.mjs can be wired to it (the same probe-first discipline used
for the registration-state work in v2.12/v2.13; see scripts/probe-indico-api.py).

TEST CASE
=========
Event 1 (EISS 2023), contribution 72 ("Addressing Wicked Problems in Cyber
Conflict"), whose four subcontribution abstracts were just entered in Indico.
If an endpoint returns a non-empty description for those subcontributions,
it wins.

WHAT IT NEVER PRINTS
====================
  - The token (env var, never echoed; sent as ?apikey= or a bearer header).
  - Full bodies of large responses. For the matched description field it
    prints only the length and a 60-char prefix, enough to confirm it is the
    abstract and not some other text.

HOW TO RUN
==========
Locally:  INDICO_API_TOKEN=… python3 scripts/probe-indico-subcontribs.py
Or:       Actions → "Probe Indico subcontributions (manual)" → Run workflow.
Paste the output back; the follow-up PR wires the winning endpoint into
sync-abstracts.mjs.
"""
from __future__ import annotations

import os
import sys

try:
    import requests
except ImportError:
    sys.exit("Install deps: pip install -r scripts/requirements.txt")

INDICO_BASE = "https://indico.eiss-europa.com"
TOKEN = os.environ.get("INDICO_API_TOKEN", "")
EVENT_ID = "1"
CONTRIB_ID = "72"  # "Addressing Wicked Problems in Cyber Conflict" — has the 4 new abstracts

# (label, path, params, use_bearer_header). When use_bearer is False the token
# is sent as ?apikey=…; when True it goes in an Authorization: Bearer header.
#
# Round 1 result: ?apikey=<this token> → 400 "Malformed API key" on every
# /export/ route, i.e. the token is NOT a legacy HTTP-API key — it is a newer
# Personal Access Token, which authenticates via the Bearer header. And
# /api/events/{id}/… returned 405 HTML (no such JSON route on this install).
# Round 2 therefore tests Bearer on the /export/ endpoints (the combo round 1
# never tried), which is what a PAT needs and which recent Indico accepts.
CANDIDATES: list[tuple[str, str, dict, bool]] = [
    # Bearer (PAT) on the legacy export across detail levels — the key test.
    ("hdr/evt-subcontribs", f"/export/event/{EVENT_ID}.json", {"detail": "subcontributions"}, True),
    ("hdr/evt-contribs",    f"/export/event/{EVENT_ID}.json", {"detail": "contributions"}, True),
    ("hdr/contrib",         f"/export/event/{EVENT_ID}/contribution/{CONTRIB_ID}.json", {}, True),
    ("hdr/contrib-sub",     f"/export/event/{EVENT_ID}/contribution/{CONTRIB_ID}.json", {"detail": "subcontributions"}, True),
    # Indico's abstracts module sometimes carries the paper abstract text.
    ("hdr/abstracts",       f"/export/event/{EVENT_ID}/abstracts.json", {}, True),
    # Sanity: does Bearer even authenticate the export at all? A plain event
    # call should still be 200 JSON; if this 400s, Bearer isn't accepted here.
    ("hdr/evt-base",        f"/export/event/{EVENT_ID}.json", {}, True),
]


def _find_subcontribs(data) -> list[dict]:
    """Pull every subcontribution-looking dict out of an Indico payload,
    wherever it sits (results[0].contributions[].subContributions[], or a
    contribution payload's own subContributions, or a bare list)."""
    found: list[dict] = []

    def walk(node):
        if isinstance(node, dict):
            for key in ("subContributions", "subcontributions"):
                subs = node.get(key)
                if isinstance(subs, list):
                    found.extend(s for s in subs if isinstance(s, dict))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(data)
    return found


def _describe_field(value) -> str:
    """Strip tags, report length + a short prefix. Abstracts aren't PII, but
    keep the dump small."""
    import re

    text = re.sub(r"<[^>]+>", " ", str(value or ""))
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return "(empty)"
    return f"{len(text)} chars | {text[:60]!r}…"


def probe(label: str, path: str, params: dict, use_bearer: bool) -> None:
    url = f"{INDICO_BASE}{path}"
    headers = {"Accept": "application/json"}
    req_params = dict(params)
    if use_bearer:
        headers["Authorization"] = f"Bearer {TOKEN}"
    else:
        req_params["apikey"] = TOKEN

    try:
        r = requests.get(url, params=req_params, headers=headers, timeout=25)
    except Exception as exc:  # noqa: BLE001
        print(f"{label:<18} EXC     {str(exc)[:80]}")
        return

    ct = (r.headers.get("content-type") or "").split(";")[0].strip()
    param_str = "  ?" + "&".join(f"{k}={v}" for k, v in params.items()) if params else ""
    print(f"{label:<18} {r.status_code:<5} {ct:<20} {len(r.content):>8}b  {path}{param_str}")

    if r.status_code != 200 or "json" not in ct.lower():
        if len(r.content) <= 300:
            print(f"    body: {r.text.strip().replace(chr(10), ' ')[:300]}")
        return

    try:
        data = r.json()
    except Exception as exc:  # noqa: BLE001
        print(f"    ! json-parse: {exc}")
        return

    subs = _find_subcontribs(data)
    if not subs:
        print("    (no subcontributions found in payload)")
        return

    # Which keys do subcontribution objects expose, and does any of them carry
    # the abstract text?
    sample_keys = sorted(subs[0].keys())
    print(f"    subcontributions: {len(subs)} | keys: {sample_keys}")
    abstract_keys = ("description", "abstract", "content", "text")
    for key in abstract_keys:
        nonempty = [s for s in subs if str(s.get(key) or "").strip()]
        if nonempty:
            print(f"    ✓ field '{key}' is populated on {len(nonempty)}/{len(subs)} subcontributions:")
            for s in nonempty[:2]:
                print(f"        - {s.get('title', '?')[:50]!r}: {_describe_field(s.get(key))}")


def main() -> None:
    if not TOKEN:
        sys.exit("No INDICO_API_TOKEN in env. Set it (export INDICO_API_TOKEN=…) and re-run.")
    print(f"Probing {INDICO_BASE} for subcontribution abstracts "
          f"(event {EVENT_ID}, contribution {CONTRIB_ID}).")
    print("Status + content-type + bytes; for JSON, subcontribution keys and "
          "any populated abstract field (length + 60-char prefix only).\n")
    print(f"{'LABEL':<18} {'CODE':<5} {'CONTENT-TYPE':<20} {'BYTES':>9}  PATH")
    print("-" * 100)
    for label, path, params, use_bearer in CANDIDATES:
        probe(label, path, params, use_bearer)
    print("\nThe winning row is the one that prints a populated abstract field. "
          "Paste this output back to wire it into sync-abstracts.mjs.")


if __name__ == "__main__":
    main()
