#!/usr/bin/env bash
# Merge a bot PR once the four required checks pass (#2109).
#
# The "Restrict updates" ruleset lets only the repository owner update
# master, and auto-merge never applies that bypass, so an armed bot PR
# would wait forever. The bots' AUTOPR_TOKEN belongs to the owner, so they
# wait for the required checks here and merge with --admin. A failing or
# missing check stops the merge. See docs/branch-protection.md.
#
# Usage: GH_TOKEN=... GH_REPO=owner/repo scripts/merge-bot-pr.sh <pr-number>

set -euo pipefail

pr="${1:?usage: merge-bot-pr.sh <pr-number>}"
repo="${GH_REPO:?GH_REPO must be set}"

# Keep in step with the required_status_checks of ruleset 17259266.
required=(
  "build"
  "axe-core in headless Chrome"
  "Verify translations match their English sources"
  "Duplicate data keys + empty href/src"
)

deadline=$((SECONDS + 1800))
while :; do
  json=$(gh pr view "$pr" --repo "$repo" --json state,statusCheckRollup)
  state=$(jq -r .state <<<"$json")
  case "$state" in
    MERGED) echo "PR #$pr is already merged."; exit 0 ;;
    OPEN) ;;
    *) echo "::error::PR #$pr is $state, not merging."; exit 1 ;;
  esac

  pending=0
  for name in "${required[@]}"; do
    result=$(jq -r --arg n "$name" '
      [.statusCheckRollup[] | select(.name == $n)]
      | if length == 0 then "MISSING"
        elif (last.status // "COMPLETED") != "COMPLETED" then "PENDING"
        else (last.conclusion // "PENDING") end' <<<"$json")
    case "$result" in
      SUCCESS) ;;
      MISSING|PENDING|"") pending=1 ;;
      *) echo "::error::Required check \"$name\" ended $result on PR #$pr."; exit 1 ;;
    esac
  done
  [ "$pending" -eq 0 ] && break

  if [ "$SECONDS" -ge "$deadline" ]; then
    echo "::error::Required checks on PR #$pr did not pass within 30 minutes."
    exit 1
  fi
  sleep 20
done
echo "All required checks passed on PR #$pr."

# Retry transient API errors (a 504 has failed this call before).
for attempt in 1 2 3 4 5; do
  if gh pr merge "$pr" --repo "$repo" --squash --admin; then
    echo "Merged PR #$pr (attempt $attempt)."
    exit 0
  fi
  if [ "$(gh pr view "$pr" --repo "$repo" --json state -q .state || true)" = MERGED ]; then
    echo "PR #$pr is already merged."
    exit 0
  fi
  echo "Merge attempt $attempt failed, retrying."
  sleep 15
done
echo "::error::Could not merge PR #$pr after 5 attempts."
exit 1
