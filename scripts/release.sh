#!/usr/bin/env bash
# scripts/release.sh — cut a tagged release of this repository.
#
# Usage:
#   scripts/release.sh <version> "<title>"           # cut the release
#   scripts/release.sh <version> "<title>" --dry-run # preview only
#
#   <version>  X.Y.Z, no leading "v" (e.g. 2.21.0)
#   <title>    short phrase summarising the key contribution of this
#              release — appears in BOTH the CHANGELOG heading
#              (`## [2.21.0] · YYYY-MM-DD — <title>`) AND the GitHub
#              Release title (`v2.21.0 — <title>`). Convention: 3-8
#              words, sentence case, no trailing punctuation.
#              The title is REQUIRED; the script will not run without it.
#
# Before running:
#
#   ❗ `[Unreleased]` in CHANGELOG.md must follow the hybrid release-
#      notes format documented at the top of that file. Patch releases
#      ship the index only; minor / major ship lede + themed sections
#      + index.
#
#      The script extracts `[Unreleased]` *verbatim* into the GitHub
#      Release notes. The confirmation prompt below prints the body —
#      eyeball it. Whatever lives in `[Unreleased]` lands on the
#      public release page.
#
# What it does, in order:
#   1.  Validate <version> against SemVer 2.0.0 (X.Y.Z, no leading "v").
#   2.  Validate <title> is non-empty and isn't a flag.
#   3.  Refuse to run if anything is uncommitted, or if local master is
#       behind/ahead of origin/master.
#   4.  Read the [Unreleased] body from CHANGELOG.md; refuse if empty
#       or still the "_Nothing yet._" placeholder.
#   5.  Print the body + title and prompt for "y" confirmation. Last
#       point an abort leaves everything untouched.
#   6.  Promote [Unreleased] → [<version>] · today — <title>; start a
#       fresh [Unreleased] section. Update the compare-link block.
#   7.  Commit + push.
#   8.  Annotated tag v<version>, push.
#   9.  `gh release create` with the [<version>] section as notes.
#
# Pre-conditions:
#   - `gh` CLI installed and authenticated against
#     EISSeuropa/EISSeuropa.github.io.
#   - Working tree is clean and local master matches origin/master.
#   - The work that is *in* this release is already merged to master.
#
# The convention for what counts as MAJOR / MINOR / PATCH is in
# README.md → "Versioning". Short version:
#   MAJOR — foundational reset of scope, identity, or platform.
#   MINOR — a big new project: new page, new pipeline, new locale,
#           or a new top-level feature.
#   PATCH — bug fixes, copy edits, content refreshes, small UX tweaks.
#
# Exit codes:
#   0  success.
#   1  bad usage / preconditions not met.
#   2  changelog had no [Unreleased] entries (nothing to release).

set -euo pipefail

# ────────────────────────────────────────────────────────────────────
# Argument parsing
# ────────────────────────────────────────────────────────────────────

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "usage: $0 <version> \"<title>\" [--dry-run]"
  echo "       <version>  X.Y.Z, e.g. 2.21.0"
  echo "       <title>    short phrase summarising the key contribution,"
  echo "                  e.g. \"Adopt NetSec versioning and release tooling\""
  exit 1
fi

VERSION="$1"
TITLE="$2"
DRY_RUN="${3:-}"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "✗ Version must match X.Y.Z (got '$VERSION')."
  echo "  Don't prefix with 'v'; the script adds it for the tag."
  exit 1
fi

if [[ -z "$TITLE" ]]; then
  echo "✗ Release title is required (got empty string)."
  echo "  Pick a short phrase that reflects the key contribution."
  echo "  Convention: 3-8 words, sentence case, no trailing punctuation."
  exit 1
fi

if [[ "$TITLE" == --* ]]; then
  echo "✗ Title looks like a flag ('$TITLE'). Did you forget to quote it,"
  echo "  or are you missing the title argument?"
  exit 1
fi

if [[ -n "$DRY_RUN" && "$DRY_RUN" != "--dry-run" ]]; then
  echo "✗ Third argument, if given, must be --dry-run (got '$DRY_RUN')."
  exit 1
fi

run() {
  echo "  \$ $*"
  if [[ "$DRY_RUN" != "--dry-run" ]]; then
    eval "$@"
  fi
}

step() {
  echo
  echo "── $1"
}

# ────────────────────────────────────────────────────────────────────
# Pre-flight checks
# ────────────────────────────────────────────────────────────────────

step "Pre-flight"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if ! gh auth status >/dev/null 2>&1; then
  echo "✗ gh CLI is not authenticated. Run 'gh auth login' first."
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "master" ]]; then
  echo "✗ You must be on branch 'master' to cut a release (currently on '$BRANCH')."
  echo "  Tip: merge your release-prep PR first, then run this from master."
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "✗ Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

git fetch origin master --quiet
LOCAL_SHA="$(git rev-parse master)"
REMOTE_SHA="$(git rev-parse origin/master)"
if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  echo "✗ Local master ($LOCAL_SHA) does not match origin/master ($REMOTE_SHA)."
  echo "  Run: git pull --ff-only origin master"
  exit 1
fi

if git rev-parse "v$VERSION" >/dev/null 2>&1; then
  echo "✗ Tag v$VERSION already exists locally."
  exit 1
fi
if git ls-remote --tags origin "refs/tags/v$VERSION" | grep -q .; then
  echo "✗ Tag v$VERSION already exists on origin."
  exit 1
fi

echo "✓ On master, clean, in sync with origin, v$VERSION is fresh."

# ────────────────────────────────────────────────────────────────────
# Promote [Unreleased] → [<version>] in CHANGELOG.md
# ────────────────────────────────────────────────────────────────────

step "Promote CHANGELOG.md [Unreleased] → [$VERSION]"

CHANGELOG="$REPO_ROOT/CHANGELOG.md"
if [[ ! -f "$CHANGELOG" ]]; then
  echo "✗ CHANGELOG.md not found at $CHANGELOG"
  exit 1
fi

TODAY="$(date -u +%Y-%m-%d)"

UNRELEASED_BODY="$(awk '
  /^## \[Unreleased\]/ { inblock = 1; next }
  /^## \[/            { inblock = 0 }
  inblock             { print }
' "$CHANGELOG")"

TRIMMED="$(printf '%s\n' "$UNRELEASED_BODY" | sed -e 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$' || true)"

if [[ -z "$TRIMMED" ]] || [[ "$TRIMMED" == "_Nothing yet._" ]]; then
  echo "✗ [Unreleased] is empty (or just '_Nothing yet._')."
  echo "  Add release notes there first, then re-run."
  exit 2
fi

echo "  [Unreleased] body found, $(printf '%s' "$UNRELEASED_BODY" | wc -l) lines."
echo "  Promoting to [$VERSION] · $TODAY and resetting [Unreleased]."

# ────────────────────────────────────────────────────────────────────
# Final-review confirmation
# ────────────────────────────────────────────────────────────────────
if [[ "$DRY_RUN" != "--dry-run" ]]; then
  step "Preview & confirm — the release notes that will be published"
  printf '\n'
  printf '  Title:   v%s — %s\n' "$VERSION" "$TITLE"
  printf '  ──────────────────────────────────────────────────────────────\n'
  printf '%s\n' "$UNRELEASED_BODY" | sed 's/^/  /'
  printf '  ──────────────────────────────────────────────────────────────\n\n'

  # For minor / major releases (X.Y.Z where Z == 0), print the
  # cross-check reminder before the prompt. Skipped for patch
  # releases — they're scoped to small fixes.
  PATCH_PART="${VERSION##*.}"
  if [[ "$PATCH_PART" == "0" ]]; then
    printf '  Minor / major release — cross-check before publishing:\n'
    printf '    1. Roadmap       — docs/roadmap-2026.md release-history section up to date?\n'
    printf '    2. Sitemap       — sitemap.xml + /sitemap.html include any new pages?\n'
    printf '    3. Translations  — python3 scripts/check-i18n-drift.py reports zero drift?\n'
    printf '    4. README        — Versioning section reflects any convention change?\n'
    printf '\n'
    printf '  Land any edits in the same release, or open tracking issues.\n'
    printf '  ──────────────────────────────────────────────────────────────\n\n'
  fi

  printf '  Publish v%s — %s with the title + notes above?\n' "$VERSION" "$TITLE"
  printf '  Type "y" to publish, anything else to abort: '
  read -r CONFIRM
  case "$CONFIRM" in
    [yY]|[yY][eE][sS]) ;;
    *)
      printf '\n  Aborted. No commits, tags, or release were made.\n'
      printf '  CHANGELOG.md is unchanged. Edit [Unreleased] and re-run when ready.\n'
      exit 0
      ;;
  esac
fi

if [[ "$DRY_RUN" != "--dry-run" ]]; then
  python3 - "$CHANGELOG" "$VERSION" "$TODAY" "$TITLE" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
version = sys.argv[2]
today   = sys.argv[3]
title   = sys.argv[4]
src     = path.read_text(encoding="utf-8")

# 1. Replace the [Unreleased] heading with two headings: a fresh
#    [Unreleased] (with placeholder body) and the promoted [version].
new_block = (
    f"## [Unreleased]\n\n"
    f"_Nothing yet._\n\n"
    f"## [{version}] · {today} — {title}"
)
src, n = re.subn(r"^## \[Unreleased\]", new_block, src, count=1, flags=re.M)
if n != 1:
    raise SystemExit("Could not find a unique [Unreleased] heading.")

# 2. Update the compare-link block at the bottom.
# The tag-name group allows letters and dashes after the dotted
# numerics so "r"-suffixed renumbered tags (v2.13.0r) match too.
# Earlier the regex was v([0-9.]+), which silently failed to update
# the link past a v2.13.0r baseline and left
# "[Unreleased]: …/compare/v2.13.0r...HEAD" stale through v2.22.0.
m = re.search(
    r"^\[Unreleased\]:\s*(https://github\.com/[^/]+/[^/]+)/compare/v([0-9A-Za-z.\-]+?)\.\.\.HEAD\s*$",
    src,
    flags=re.M,
)
if m:
    repo_url = m.group(1)
    previous = m.group(2)
    new_link_block = (
        f"[Unreleased]: {repo_url}/compare/v{version}...HEAD\n"
        f"[{version}]: {repo_url}/compare/v{previous}...v{version}"
    )
    src = re.sub(
        r"^\[Unreleased\]:.*$",
        new_link_block,
        src,
        count=1,
        flags=re.M,
    )

path.write_text(src, encoding="utf-8")
PY
fi

# ────────────────────────────────────────────────────────────────────
# Commit + tag + push
# ────────────────────────────────────────────────────────────────────

step "Commit, tag, push"

run git add CHANGELOG.md
run git commit -m \"Release v$VERSION — $TITLE\" \
       -m \"Promotes the CHANGELOG.md [Unreleased] section to [$VERSION] · $TODAY — $TITLE and resets [Unreleased].\"
run git tag -a \"v$VERSION\" \
       -m \"v$VERSION — $TITLE\" \
       -m \"See CHANGELOG.md and https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v$VERSION\"

run git push origin master
run git push origin \"v$VERSION\"

# ────────────────────────────────────────────────────────────────────
# Slice the changelog entry and publish the Release
# ────────────────────────────────────────────────────────────────────

step "Publish GitHub Release v$VERSION"

NOTES_FILE="$(mktemp -t "release-v$VERSION-XXXXXX.md")"

if [[ "$DRY_RUN" != "--dry-run" ]]; then
  python3 - "$CHANGELOG" "$VERSION" >"$NOTES_FILE" <<'PY'
import re
import sys

src = open(sys.argv[1], encoding="utf-8").read()
version = sys.argv[2]

pat = re.compile(
    rf"^## \[{re.escape(version)}\][^\n]*\n(.*?)(?=^## \[|\Z)",
    re.M | re.S,
)
m = pat.search(src)
if not m:
    raise SystemExit(f"Could not find [{version}] section in changelog.")
print(m.group(1).strip())
PY
else
  echo "  [dry-run] would extract [$VERSION] body to $NOTES_FILE"
fi

run gh release create \"v$VERSION\" \
       --title \"v$VERSION — $TITLE\" \
       --notes-file \"$NOTES_FILE\" \
       --latest

if [[ "$DRY_RUN" != "--dry-run" ]]; then
  rm -f "$NOTES_FILE"
fi

step "Done"
echo "  ✓ Released v$VERSION."
echo "  https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v$VERSION"
