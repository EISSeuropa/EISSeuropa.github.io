#!/usr/bin/env python3
"""
One-shot probe of Indico's API surface — round 2.

PURPOSE
=======
We want to detect registration-form state (open/closed) automatically.
Round 1 (v2.12) established that:
  - /api/v1/* doesn't exist on this Indico installation (everything
    returned ~90 KB of HTML — the standard 404 / login page)
  - /export/event/{id}.json with ?apikey=… returns 200 OK JSON

Round 2 focuses on the legacy /export/* API where authentication
actually works. It expands the candidate list with various ?detail=…
levels and probes for registration-specific endpoints. To make the
output actually useful for choosing the right endpoint:

  - For 200-OK JSON responses, we print the top-level keys (schema,
    not data — keys aren't PII).
  - For tiny responses (<300 bytes), we print the body verbatim. Tiny
    payloads are almost always error envelopes — useful to interpret.

WHAT IT NEVER PRINTS
====================
  - The token (env var, never echoed)
  - Full response bodies above 300 bytes
  - Individual field values from large JSON responses

HOW TO RUN
==========
Actions → "Probe Indico API (manual)" → Run workflow. Paste the
output back to Claude; the next PR wires the winning endpoint into
the daily sync.
"""
from __future__ import annotations

import json
import os
import sys

try:
    import requests
except ImportError:
    sys.exit("Install deps: pip install -r scripts/requirements.txt")


INDICO_BASE = "https://indico.eiss-europa.com"
TOKEN = os.environ.get("INDICO_API_TOKEN", "")
EVENT_ID = "22"

# Each row: (label, path, params, use_bearer_header)
# `params` is merged with `?apikey=…` at request time when use_bearer_header
# is False. Labels are deliberately short and don't contain the literal word
# "Bearer" — that string in the log triggers GitHub Actions' secret-masker
# in some configurations, which redacts the entire surrounding column.
CANDIDATES: list[tuple[str, str, dict, bool]] = [
    # ---- /export/event/{id}.json across detail levels ------------------
    ("qry/base",        f"/export/event/{EVENT_ID}.json", {}, False),
    ("qry/contribs",    f"/export/event/{EVENT_ID}.json", {"detail": "contributions"}, False),
    ("qry/sessions",    f"/export/event/{EVENT_ID}.json", {"detail": "sessions"}, False),
    ("qry/subcontribs", f"/export/event/{EVENT_ID}.json", {"detail": "subcontributions"}, False),
    # ---- Registration-flavoured /export/ paths -------------------------
    ("qry/regform",     f"/export/event/{EVENT_ID}/registrationForm.json", {}, False),    # camel
    ("qry/regforms",    f"/export/event/{EVENT_ID}/registrationForms.json", {}, False),   # plural camel
    ("qry/regs",        f"/export/event/{EVENT_ID}/registrations.json", {}, False),
    ("qry/regs.csv",    f"/export/event/{EVENT_ID}/registrants.csv", {}, False),
    # ---- Whatever /event/{id}/manage/registration/ actually returns ----
    ("hdr/manage-reg",  f"/event/{EVENT_ID}/manage/registration/", {}, True),
    ("qry/manage-reg",  f"/event/{EVENT_ID}/manage/registration/", {}, False),
    # ---- Newer-style endpoints worth one more try ----------------------
    ("hdr/api-evt",     f"/api/event/{EVENT_ID}", {}, True),
    ("hdr/api-evts",    f"/api/events/{EVENT_ID}", {}, True),
    ("hdr/api-reg",     f"/api/event/{EVENT_ID}/registration", {}, True),
    # ---- Category endpoint, authenticated ------------------------------
    ("qry/cat-1",       f"/export/categ/1.json", {"from": "today", "to": "today+540d"}, False),
]


def probe(label: str, path: str, params: dict, use_bearer: bool) -> dict:
    """Make the request; return a small descriptor. No bodies above
    PEEK_LIMIT bytes are returned, and key listings only — never field
    values from anything larger."""
    PEEK_LIMIT = 300

    url = f"{INDICO_BASE}{path}"
    headers = {"Accept": "application/json"}
    if use_bearer:
        headers["Authorization"] = f"Bearer {TOKEN}"
        req_params = dict(params)
    else:
        req_params = dict(params)
        req_params["apikey"] = TOKEN

    try:
        r = requests.get(url, params=req_params, headers=headers, timeout=20)
    except Exception as exc:  # noqa: BLE001
        return {"status": "EXC", "ct": "", "bytes": 0, "error": str(exc)[:80]}

    descriptor = {
        "status": r.status_code,
        "ct": (r.headers.get("content-type") or "").split(";")[0].strip(),
        "bytes": len(r.content),
        "keys": None,
        "preview": None,
    }

    # For 200-OK JSON responses, surface the top-level shape so we can
    # tell at a glance whether a response carries registration data.
    if r.status_code == 200 and "json" in descriptor["ct"].lower():
        try:
            data = r.json()
            descriptor["keys"] = _top_level_schema(data)
        except Exception as exc:  # noqa: BLE001
            descriptor["error"] = f"json-parse: {exc!s:.80}"

    # For tiny responses, print the body verbatim — almost certainly
    # an error envelope. 300 bytes is too small for any PII payload.
    if descriptor["bytes"] <= PEEK_LIMIT:
        descriptor["preview"] = r.text.strip().replace("\n", " ")[:PEEK_LIMIT]

    return descriptor


def _top_level_schema(data) -> str:
    """Render a one-line summary of a JSON payload's shape so we can
    spot a registration-relevant response without showing values.
    Recurses one level into the standard Indico HTTPAPIResult envelope."""
    if isinstance(data, dict):
        keys = sorted(data.keys())
        # Drill into Indico's HTTPAPIResult shape if present.
        if "results" in data and isinstance(data.get("results"), list) and data["results"]:
            first = data["results"][0]
            if isinstance(first, dict):
                nested = sorted(first.keys())
                return (
                    "{" + ", ".join(keys) + "} ; results[0]: {"
                    + ", ".join(nested) + "}"
                )
        return "{" + ", ".join(keys) + "}"
    if isinstance(data, list):
        return f"[len={len(data)}]"
    return type(data).__name__


def main() -> None:
    if not TOKEN:
        sys.exit("No INDICO_API_TOKEN in env. Set the repo secret and re-run.")

    print(f"Probing {INDICO_BASE} (event id={EVENT_ID}) — round 2.")
    print("Status codes + content-types + top-level keys only.")
    print("Tiny responses (<300 bytes) are printed verbatim; "
          "larger ones never are.\n")

    print(f"{'LABEL':<14} {'STATUS':<7} {'CONTENT-TYPE':<22} {'BYTES':>7}  PATH")
    print("-" * 130)

    rows = []
    for label, path, params, use_bearer in CANDIDATES:
        res = probe(label, path, params, use_bearer)
        rows.append((label, path, params, res))
        param_str = ""
        if params:
            param_str = "  ?" + "&".join(f"{k}={v}" for k, v in params.items() if k != "apikey")
        print(
            f"{label:<14} {str(res['status']):<7} {res['ct']:<22} {res['bytes']:>7}  "
            f"{path}{param_str}"
        )
        if res.get("keys"):
            print(f"  ↳ shape: {res['keys']}")
        if res.get("preview"):
            print(f"  ↳ body : {res['preview']}")
        if res.get("error"):
            print(f"  ! err  : {res['error']}")

    print()
    winners = [
        (label, path, res)
        for label, path, _, res in rows
        if isinstance(res["status"], int) and 200 <= res["status"] < 300
        and "json" in (res["ct"] or "").lower()
    ]
    if winners:
        print(f"✓ {len(winners)} JSON 200-OK endpoint(s):")
        for label, path, res in winners:
            print(f"    {label:<14} {path}  ({res['bytes']} bytes)")
    else:
        print("✗ Still no JSON 200-OK endpoint with this token.")


if __name__ == "__main__":
    main()
