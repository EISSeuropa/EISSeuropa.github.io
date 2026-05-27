# Claude project rules: EISSeuropa.github.io

Read by Claude Code on every session in this repository. Codifies the
standing constraints the maintainer has set for AI-assisted work, so
they survive context-window expiry. Update via PR when a rule shifts.

The single human reader of this file is the maintainer (Dr Arthur
Laudrain). Keep it terse: every word here is read once per session
and costs context.

Adapted from the sister repository
[`EISSeuropa/netsec.github.io`](https://github.com/EISSeuropa/netsec.github.io)'s
`CLAUDE.md`. Where rules differ between the two sites, this file is
authoritative for EISS.

---

## 1. Language & translation

- **British English** in user-facing copy (site pages, the accessibility
  statement, the privacy notice, CHANGELOG release notes, GitHub Release
  bodies, PR descriptions that an external reader might see). Internal
  commit messages and code comments can be more relaxed but should not
  flip mid-document.
- **No machine translation, ever.** FR and DE variants are translated
  by hand. The `status: beta` ribbon on `*.fr.njk` / `*.de.njk` carries
  the manual-translation framing. If you find any user-facing copy that
  implies machine translation, fix it.

## 2. Pull-request workflow

- **Auto-merge by default.** Open the PR with `gh pr create`, then arm
  auto-merge with `gh pr merge --auto --squash`. CI checks (the i18n
  drift checker on every HTML-touching PR, plus CodeQL) hold the merge
  if something is wrong.
- **Carve-out: visual changes need preview review.** When the PR
  changes something a human will see (layout shifts, new components,
  copy that's visible above the fold, anything affecting brand
  identity), do NOT arm auto-merge. Leave the PR open and ask the
  maintainer to eyeball the Cloudflare or Netlify deploy preview
  before merging. The brand rollout (PRs #154 / #155 / #156) is the
  canonical example of the carve-out done well.
- **Carve-out: release notes.** When cutting a release via
  `scripts/release.sh`, eyeball the lede + themes + index before
  confirming the publish prompt. Publication to GitHub Releases is
  harder to undo than a merge.
- **Squash, not merge commits.** Every PR ends as a single commit on
  `master`. The release-cutter then writes the release commit on top.
- **Once a PR is opened, treat its branch as frozen.** Auto-merge
  plus a fast-merging maintainer means any commit pushed after PR
  creation can be left orphaned: the squash fires off the commits
  GitHub saw at merge time, and anything pushed afterwards never
  reaches `master`. The pattern bit three times in one session
  (PR #199 → #201, #202 → #204, also lost commits in #199
  pre-merge). Default for any post-creation fix-up: **new branch
  off current master, cherry-pick the fix-up commit, fresh PR**.
  Don't push more commits to a branch whose PR is already open,
  even if "the merge hasn't happened yet" — by the time `git push`
  returns, it often has.

## 3. Open a GitHub issue for every deferred item

Whenever you identify work that won't ship *this turn* (a bug, a
feature need, a structural follow-up, a "queued for later" finding),
**open a GitHub issue before the session ends.** The audit trail
self-references that way; loose ends survive context-window expiry
and release cycles.

### When to open an issue

- A **bug** you've spotted but aren't fixing now, because it's out of
  scope for the current PR, needs further investigation, or pairs
  better with future work. Example: the brand rollout (#156) left
  the OG-card overlay watermark out of scope; the deeper question
  of "how do we keep the iconmark on every social card going forward"
  became [#157](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/157).
- A **feature need** that surfaced from a user journey or maintainer
  conversation but isn't being scoped this turn.
- A **structural follow-up**: the current PR papered over a symptom
  but the root cause needs a different fix.
- A **deferral with a tag**: "queued for the next minor", "after the
  brand rollout", "needs design pass". Anything that sits in
  audit-trail prose anywhere in the repo belongs in an issue too.

### When **not** to open an issue

- Work that's shipping *this turn*. The PR is the record.
- Pure observations that need no action.
- Duplicates: always
  `gh issue list --state open --search "..."` first, and prefer
  linking + commenting on an existing issue.
- Trivial inline fixes you can do in seconds without context switch.

### Issue template (informal, no `.github/ISSUE_TEMPLATE/` files)

```markdown
## What's happening
One paragraph + a concrete repro or pointer.

## Why it matters
One paragraph. User impact, audit-trail context, or accessibility /
compliance angle.

## Fix path (or fix options)
Specific enough that a future maintainer can pick it up without
re-deriving the analysis. Code paths, file names, line numbers.

## Milestone
One of the thematic milestones (rule §10). Never leave it blank.
```

**Set the GitHub milestone at creation time** (rule §10):
`gh issue create --milestone "<milestone>" ...`. The body's milestone
line is human-readable context; the milestone is the queryable
commitment.

Labels: use the existing set already present in this repo (`bug`,
`enhancement`, `documentation`, `data-sync`, `automated`,
`known-issue`, etc.). Don't invent new labels without asking; the
label set is small on purpose.

### Cross-reference

When an issue closes a deferred row in an audit doc (e.g. an entry
in `docs/roadmap-2026.md`, or a "needs follow-up" note in the
accessibility statement), **edit the audit doc to link the new
issue.** Status should read e.g. "open (tracked in #157)" rather
than the dangling "deferred".

## 4. Release-notes format

The hybrid format is documented at the top of `CHANGELOG.md` and
restated in `README.md` under *Versioning*. Every release section
follows it.

Short version: **lede + 2-4 themed `### sub-sections` + canonical
`### Index of changes`**. Self-policing tier: patch releases skip
the lede + themes and ship the index only.

**Minor vs patch: the feature test** (see `README.md` for the full
table). A minor ships at least one new user-visible feature or a
significantly improved existing feature. Anything else (content
additions on an existing page, copy edits, translation refreshes,
accessibility passes, dependency bumps) is a patch. Read the lede
aloud: *"we polished / fixed / refreshed X"* means patch; *"you can
now do X"* means minor. When in doubt, patch.

Hard rule: **no hard wraps in prose.** One source line per
paragraph / bullet / blockquote. GitHub Releases renders soft `\n`
as `<br>` and otherwise produces visibly narrow prose.

**Keep `[Unreleased]` current.** Every PR that introduces a
user-visible change adds at least one bullet under
`[Unreleased]` → `### Added` / `### Changed` / `### Fixed` in the
same PR. Reconstructing a release batch from the git log at release
time loses nuance and burns time; capturing the bullet while the
context is fresh is cheap. Exempt: Dependabot PRs, the automated
`indico-sync/auto` and `bios-sync/auto` data refresh PRs, and any
internal-only commit (docs-only refresh, CI tooling, working-tree
hygiene). When in doubt, add the bullet. Cutting a release becomes:
review what's already there, decide on the title,
`scripts/release.sh`.

**Concurrent-PR CHANGELOG conflict trap.** When two PRs both add a
bullet to the same `### Added` / `### Changed` / `### Fixed` /
`### Removed` sub-section in close succession, GitHub's auto-merge
can resolve the conflict by keeping only one side. The dropped
bullet's code change still lands on `master`, but the CHANGELOG no
longer records it and the audit trail breaks silently. Caught in
v2.23.1 prep: PR #179 added two `### Changed` entries (Champs de
Mars citation drop, map projection re-tune), PR #180 added its own
bullet, the merge wiped the #179 lines. Recipe at release-cut time:
cross-check the `[Unreleased]` bullet count against
`git log v<prev>..HEAD --merges --oneline`. Mismatches mean a
bullet was lost. Use `git log -G '<headline phrase>' -- CHANGELOG.md`
to trace where, then restore in the release-prep commit.

## 5. Release-time four-point cross-check (minor / major only)

Every **minor (`X.Y.0` where `Y > prev`) or major (`X.0.0`)
release** should trigger a deliberate check across four surfaces
before `scripts/release.sh` runs. Skip the cross-check on **patch
releases** (`X.Y.Z` where `Z > 0`); they're scoped to small fixes
and the overhead isn't justified. The release script's
*self-policing tier* mirrors this: patches ship the index only.

For each surface, the question is the same: *"Did anything in this
release change what this surface documents?"* If yes, edit in the
same release. If yes but too big to fit, open a tracking issue
(rule §3) and reference it from the surface itself.

### 1. Roadmap (`docs/roadmap-2026.md`)

- Is the next planned release on the timeline still accurate?
- Anything in the deferred-items section ready to promote to a
  dated entry?
- The autostamp on the document (when wired in, see rule §11) keeps
  the `[Unreleased]` bullet count fresh automatically. The prose
  timeline rows stay maintainer-edited.

### 2. Sitemap (`src/sitemap.xml.njk` + `src/sitemap.njk` + FR + DE)

- New pages added in this release? Confirm they show up in
  `src/sitemap.xml.njk` (the XML index for search engines) and in
  the visual `src/sitemap.njk` inventory + its FR / DE siblings.
- The visual sitemap is hand-edited; confirm new pages land in the
  correct branch (*About* / *Programmes* / *Conferences* / etc.).

### 3. Translations (FR + DE variants)

- Run `python3 scripts/check-i18n-drift.py` locally. CI catches drift
  on HTML-touching PRs, but a release moment is the right place to
  confirm zero drift before stamping a version.
- Did any EN copy change in this release? FR / DE need manual updates
  (no machine translation per rule §1).
- The `status: beta` ribbon on `*.fr.njk` / `*.de.njk` carries the
  manual-translation framing; if a translation has been re-verified
  against current EN, consider whether the *beta* marker still applies.

### 4. Repo docs

- Maintainer-facing markdown docs under `docs/`
  (`board-bios-setup.md`, `i18n.md`, `indico-api-token.md`,
  `indico-programme-integration.md`, `new-conference.md`,
  `roadmap-2026.md`): does anything in this release contradict what's
  documented?
- `BRAND.md` and the brand SVGs under `src/assets/images/brand/`:
  refresh if the visual identity changes.

### 5. Milestone hygiene (gate, not a surface)

- Every issue closed by this release carries the matching milestone.
- Every issue still open and tagged with a milestone that just shipped
  has either been ticked off in the release notes or moved to the
  next milestone with a one-line reason in the issue thread.
- The release should not ship with its own milestone holding open work.
  See rule §10.

This is a deliberate friction-point: cutting a minor release here is
**slightly more work than running release.sh**, by design. The
release script's confirmation prompt is the last moment to bail if
the cross-check surfaces something that needs to land in the same
release.

## 6. Voice for public-facing copy

Public-facing copy means anything that appears on `eiss-europa.com`
pages, the beta ribbon, the accessibility statement, the privacy
notice, OG card descriptions. Readers are scholars, journalists,
prospective board / community members, and partner-institution staff.
None of them are developers; none of them care how the site is built.

**No "source of truth".** It is developer jargon. Acceptable
substitutes by context: "authoritative source", "Indico", "the
Form", "the directory".

**Show, don't tell, for feature mechanics.** If a page surfaces
synced data, don't write a sentence explaining the sync. Surface
liveness with a visual cue. The pulsing accent ring on the
registration badge in `/2026.njk` is the canonical example.
Mechanism descriptions belong in the maintainer docs.

## 7. Prose voice (em dashes, semicolons, AI patterns)

These apply to every piece of prose I author in this project: the
public site, the CHANGELOG, PR descriptions, the documentation pack
body text, multi-paragraph code comments. (One-line `# label` code
comments stay flexible. Code itself is out of scope: a JavaScript
`for (;;) {}` or CSS `color: red;` keeps its semicolons.)

**Minimise em dashes.** Default to commas, parentheses, full stops,
or colons. Em dashes pattern-match to AI-generated prose. A careful
reader notices. Rare deliberate use is fine when no other punctuation
fits cleanly, but the default should be "not an em dash".

**No semicolons.** Use a full stop and a new sentence, or restructure.
Semicolons read as overly formal in the site's voice and, like em
dashes, pattern-match to AI prose. (This rule covers prose only. Code
inside fenced blocks keeps its language-required semicolons.)

**No rule-of-three rhythm.** If there are two items, write two. If
there are five, write five. Manufactured triplets for cadence are
the most reliable AI tell.

**No synonym cycling.** Pick one referent for an entity and reuse it
across consecutive sentences. Writing "the script" then "the sync"
then "the workflow" for the same thing in three sentences is an AI
tell, even when each label is technically accurate.

The rules are forward-looking. They apply to prose authored from the
PR that introduces them onwards. Pre-existing em dashes and semicolons
in the repo aren't retroactively scrubbed unless the surrounding text
is being edited anyway.

## 8. Working tree hygiene

- Never leave the working tree dirty across PR boundaries. If a
  script (e.g. `sync-board.py`, `sync-indico.py`, `derive-logo-variants.py`)
  modifies tracked files as a side-effect of a verification run,
  decide whether the modification is part of the current PR (include
  it) or an unrelated drift (revert before committing).
- The weekly bios-sync workflow (`sync-board.yml`) is structurally
  tuned to produce zero dirty files when no submitter has
  substantively changed their entry. If you see the workflow trip an
  apparently-empty PR, that's a regression. Open an issue and
  investigate before silencing.

## 9. Accessibility & i18n cadence

- The accessibility statement at `src/accessibility.njk` (+ FR + DE)
  is bumped on every release that touches a11y conformance, audit
  results, or a known-limitations list.
- FR / DE drift checker (`scripts/check-i18n-drift.py`) runs in CI on
  every HTML-touching PR. When it flags drift, refresh the
  translation manually before merging.

## 10. Milestone tagging

Every open issue belongs to exactly one milestone. The milestone is
the bridge between the *Milestone* line in the issue template (rule
§3) and the planned work on the roadmap; without it, the backlog
drifts.

### The milestone set (thematic, not version-tied)

EISS uses **thematic milestones** rather than per-release version
milestones (NetSec's convention is different). The current set:

- **NetSec & shared infra**: anything touching the NetSec relationship
  or shared scripts / tokens / data sources between the two sister sites.
- **Indico integration deepening**: sync-indico work, live programme
  grids, Indico API probing.
- **ESSC 2026 ops**: anything specific to the current annual
  conference cycle.
- **i18n native-speaker review**: FR / DE translation refreshes,
  native-reviewer feedback.
- **Maintenance & reliability**: CI, build hygiene, dependency
  bumps, accessibility fixes, security hardening.

When the active work no longer fits any of these, propose a new
milestone in a PR (or to the maintainer directly), don't silently
spawn one.

### When to set the milestone

- **At issue creation.** Whenever rule §3 fires, set the milestone
  alongside the title and body.
- **When an issue moves between themes.** Update the milestone in
  the same edit that records the reframe.
- **Never leave an open issue without one.** A milestone-less open
  issue is invisible to roadmap planning.

## 11. Documentation currency

The site has two classes of documentation, each with a different
cadence for staying current.

### Repo `.md` docs

1. **Inline at PR time.** If a PR changes something a doc describes
   (an architectural component, a documented procedure, the public
   surface of a script that has its own `.md` doc), the same PR
   updates that doc. Same posture as the per-PR `[Unreleased]` rule
   in §4. Examples: `board-bios-setup.md` for Form / board.json
   pipeline changes, `indico-programme-integration.md` for sync
   changes, `new-conference.md` for the per-year-page rollover
   procedure.

2. **Catch-up sweep at every release** (patch, minor, major). Walk
   the `docs/` index, spot-check each against what shipped, fix
   what's wrong. Lightweight by design: most PRs already updated
   their target doc inline, so the sweep is the safety net rather
   than the workhorse.

#### Automation note: roadmap autostamp

`.github/workflows/sync-roadmap.yml` keeps the AUTOSTAMP block near
the top of `docs/roadmap-2026.md` in sync with `CHANGELOG.md`'s
`[Unreleased]` section. It counts the bullets per Keep-a-Changelog
category, records the freshness date, and anchors against the most
recent SemVer tag. Triggers on every push to `master` that touches
`CHANGELOG.md` (plus weekly Monday 06:00 UTC + manual dispatch),
opens an auto-PR on `roadmap-sync/auto` with auto-merge armed.

So the maintainer never has to manually refresh the count or
freshness stamp; that's handled. **What the automation does not
do**: rewrite the prose timeline rows. When the count visibly
diverges from what the prose says is in flight, the maintainer
resynthesises by hand (also a §5 cross-check item at release time).
The autostamp is the staleness alarm; humans write the synthesis.

---

*This file is short on purpose. If you need to add a rule, add it
here; if you need to add an example, prefer linking a PR / commit /
issue so this file stays a reference rather than a tutorial.*
