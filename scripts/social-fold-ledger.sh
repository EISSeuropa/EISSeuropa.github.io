#!/usr/bin/env bash
# Union the keys on a ledger branch into data/social-posted.json (#2056, from
# NetSec's social-bluesky.yml). The previous run's ledger PR can still be
# open, so master's ledger lacks keys of posts that already went out. A union
# only adds "already posted" and never resurrects an item.
# The branch is social/ledger (news) unless given, as welcome/ledger is by
# team-welcome.yml (#2219).
set -euo pipefail
BRANCH="${1:-social/ledger}"
git fetch --depth=1 origin "$BRANCH" 2>/dev/null || exit 0
git show FETCH_HEAD:data/social-posted.json > /tmp/branch-ledger.json 2>/dev/null || exit 0
BRANCH="$BRANCH" python3 - <<'PY'
import json, os, pathlib
led = pathlib.Path("data/social-posted.json")
cur = json.loads(led.read_text(encoding="utf-8"))
extra = [k for k in json.loads(pathlib.Path("/tmp/branch-ledger.json").read_text(encoding="utf-8")).get("posted", [])
         if k not in cur["posted"]]
if extra:
    cur["posted"] += extra
    led.write_text(json.dumps(cur, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"::notice::Folded {len(extra)} key(s) in from the unmerged {os.environ['BRANCH']} branch.")
PY
