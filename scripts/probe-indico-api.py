#!/usr/bin/env python3
"""
One-shot probe of Indico's API surface.

PURPOSE
=======
We want to detect registration-form state (open/closed) automatically.
Indico exposes data through several overlapping APIs, and which one
returns what is version-dependent. Rather than guessing in production
code, this script tries a handful of candidate URLs and reports back
how each responded.

WHAT IT LOGS
============
Status code, content-type, and response size — never bodies. Bodies
might contain attendee names, emails, or other PII; even with a private
GitHub Actions log it's better to keep them out.

HOW TO RUN
==========
Via GitHub Actions: Actions → "Probe Indico API (manual)" → Run
workflow. The token comes from the same INDICO_API_TOKEN repo secret
as the daily sync.

Read the log; share the summary table back with Claude. The PR
following this one wires the winning endpoint into the daily sync.

WHAT IT DOES NOT DO
===================
- Doesn't modify any Indico state (every call is GET)
- Doesn't write to the repo
- Doesn't print response bodies
- Doesn't print the token (the token is in env; we never echo env)
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

# The 2026 ESSC event (id=22) is the working example — that's the
# event whose registration state we eventually want to read.
EVENT_ID = "22"

# Candidate endpoints to probe. Each row: (path, attempt_bearer,
# attempt_apikey). The two flags decide which auth strategies to try
# for that path — some endpoints accept Bearer, some accept the
# legacy ?apikey= query parameter, some accept both.
CANDIDATES: list[tuple[str, bool, bool]] = [
    # ---- Newer REST API (Bearer-token-friendly) -----------------------
    (f"/api/v1/events/{EVENT_ID}",                          True,  False),
    (f"/api/v1/event/{EVENT_ID}",                            True,  False),
    (f"/api/v1/events/{EVENT_ID}/registration-forms",        True,  False),
    (f"/api/v1/event/{EVENT_ID}/registration-forms",         True,  False),
    (f"/api/v1/events/{EVENT_ID}/registrations",             True,  False),
    (f"/api/v1/event/{EVENT_ID}/registrations",              True,  False),
    # ---- Indico's management URL family (sometimes JSON) -------------
    (f"/event/{EVENT_ID}/manage/registration/",              True,  False),
    # ---- Legacy /export/ API (apikey query param) --------------------
    (f"/export/event/{EVENT_ID}.json",                       False, True),
    (f"/export/event/{EVENT_ID}/registrants.json",           False, True),
    (f"/export/event/{EVENT_ID}/registrationform.json",      False, True),
]


def probe(url: str, params: dict | None = None, headers: dict | None = None) -> dict:
    """Return a small dict describing the response without echoing
    the body. `status` covers HTTP errors too; we never raise."""
    try:
        r = requests.get(url, params=params, headers=headers, timeout=20)
        return {
            "status": r.status_code,
            "content_type": (r.headers.get("content-type") or "").split(";")[0].strip(),
            "bytes": len(r.content),
        }
    except Exception as exc:  # noqa: BLE001
        return {"status": "EXC", "content_type": "", "bytes": 0, "error": str(exc)[:80]}


def main() -> None:
    if not TOKEN:
        sys.exit("No INDICO_API_TOKEN in env. Set the repo secret and re-run.")

    print(f"Probing {INDICO_BASE} with bot token (event id={EVENT_ID}).")
    print("Status codes only; no response bodies will be printed.\n")

    headers_bearer = {
        "Accept": "application/json",
        "Authorization": f"Bearer {TOKEN}",
    }
    headers_anon = {"Accept": "application/json"}

    rows: list[tuple[str, str, dict]] = []

    for path, try_bearer, try_apikey in CANDIDATES:
        url = f"{INDICO_BASE}{path}"
        if try_bearer:
            rows.append((path, "Bearer", probe(url, headers=headers_bearer)))
        if try_apikey:
            rows.append((
                path,
                "?apikey",
                probe(url, params={"apikey": TOKEN}, headers=headers_anon),
            ))

    # Pretty-print a markdown-ish summary that's easy to copy-paste
    # back into a chat / PR comment.
    print(f"{'PATH':<58} {'AUTH':<8} {'STATUS':<8} {'CONTENT-TYPE':<24} {'BYTES':>8}")
    print("-" * 110)
    for path, auth, res in rows:
        print(
            f"{path:<58} {auth:<8} {str(res['status']):<8} "
            f"{res['content_type']:<24} {res['bytes']:>8}"
        )
        if "error" in res:
            print(f"  ! {res['error']}")

    # Heuristic verdict
    print()
    winners = [r for r in rows if isinstance(r[2]["status"], int) and 200 <= r[2]["status"] < 300]
    if winners:
        print(f"✓ {len(winners)} endpoint(s) returned 2xx:")
        for path, auth, res in winners:
            print(f"    {auth:<8} {path}  ({res['content_type']}, {res['bytes']} bytes)")
        print("\nNext: paste this table into chat. Claude will wire the "
              "best-fit endpoint into scripts/sync-indico.py in v2.13.")
    else:
        print("✗ No endpoint returned 2xx with this token.")
        print("  Likely causes:")
        print("    - token scope too narrow (issue a new one with read:user "
              "and/or read:registrants)")
        print("    - bot user not a manager on the event/category")
        print("    - this Indico version uses paths not in the candidate list")


if __name__ == "__main__":
    main()
