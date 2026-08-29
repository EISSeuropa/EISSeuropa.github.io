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
- **Once a PR is opened, treat its branch as frozen.** Any commit
  pushed after PR creation can be orphaned: a squash merge ships only
  the commits GitHub saw at merge time, so anything pushed afterwards
  never reaches `master`. **This is not only an auto-merge problem,
  and that framing is the trap.** A maintainer (or you) can merge
  manually at any moment, so none of these are safe windows:
  "auto-merge isn't armed", "CI is still red", "it still has
  conflicts", "I only opened it a second ago". By the time `git push`
  returns, the PR has often already merged underneath you. It has bit
  repeatedly, both ways: orphaned fix-ups under auto-merge (PR #199 →
  #201, #202 → #204) **and** a maintainer manually merging a visual PR
  while a refinement was mid-push (#314, the contrast fix stranded and
  re-landed as #317). So the default for **any** post-creation change,
  whether a CI fix, a review tweak, or a design refinement, is: **new
  branch off current `master`, cherry-pick the commit, fresh PR.** Do
  not push to the open PR's branch to "save a PR". The one unavoidable
  exception is resolving merge conflicts on a PR that is *blocked* from
  merging (GitHub shows it dirty, or a required check is failing):
  there, rebase and force-push that branch, because it cannot merge
  underneath you until the block clears. When in doubt, fresh branch.
- **Branch off *freshly-fetched* `origin/master`, never local `master`.**
  Always `git fetch origin && git checkout -b <branch> origin/master`
  (or `git checkout master && git pull` first). A bare
  `git checkout master` without a pull is the trap. Branching off a stale
  local `master` is worse than orphaning a late push: your branch
  silently *excludes* whatever merged since your last pull, and its
  squash-merge ships the whole file as of that stale base, **reverting
  those merges on production**. This bit live: a one-line tweak branched
  off a stale master (PR #974) reverted the per-author anchor an earlier
  PR (#971) had shipped, breaking a cross-repo contract until it was
  caught and re-landed (#317-class, but a revert not an orphan). After a
  merge you expected, confirm it's actually on `master`
  (`git show origin/master:<file> | grep …`) rather than trusting the PR
  body.
- **SHA-pin GitHub Actions.** Every `uses:` in `.github/workflows/`
  is pinned to a full 40-character commit SHA with a trailing
  `# vN` comment (e.g. `uses: actions/checkout@de0fac2… # v6`).
  Dependabot's `github-actions` block keeps the pins current and the
  comment human-readable. New workflows pin by default.

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
The target release, e.g. `v2.25.0`, or `Backlog — Under watch` when
there's no committed release (rule §10). Never leave it blank.
```

**Set the GitHub milestone at creation time** (rule §10):
`gh issue create --milestone v2.25.0 ...`. The body's milestone
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

**Mechanical backstop (`.gitattributes`).** A rule cannot stop a
merge-time race, so the repo pins `CHANGELOG.md merge=union` in
`.gitattributes`. On a conflicting hunk Git's `union` driver keeps
**both** sides instead of discarding one, so concurrent bullet
additions concatenate rather than vanish. **Confirmed in practice
(PRs #364 / #365): GitHub's server-side squash does *not* apply the
driver** — it just reports the PR as conflicted. `union` only runs in a
*local* Git. So the working recipe when two open PRs both added
`[Unreleased]` bullets and the second now shows conflicts: on that
branch, `git merge origin/master` locally (the driver concatenates both
bullet sets, usually with zero manual editing), push, then squash-merge.
Either path avoids a *silent* loss: GitHub surfaces a conflict to
resolve rather than quietly keeping one side, and the local union
resolves it cleanly. The cross-check recipe above stays the net for the
residual cases the driver can't help (identical-line edits). Trade-off:
union can land bullets slightly out of order or leave a stray duplicate,
both visible and cheap to tidy at release. The NetSec sister repo should
carry the same `.gitattributes` line. If drops ever recur despite this,
escalate to per-PR changelog fragments (`changelog.d/`, one file per PR,
collated by `release.sh`), which removes the shared-file conflict
entirely.

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

**No second person in the CHANGELOG.** Release notes describe what
changed, they do not address the reader. "The Atlas can show you what two
themes share" becomes "The Atlas shows what two themes share", and "a view
you found is a view you can send" becomes "a view that was found is a view
that can be sent". This covers the lede, the themed sections, the index
bullets and the release title, which is reused verbatim as the GitHub
Release title and on the public roadmap card. Site pages are a different
surface and keep their own voice: a page is spoken to a reader, a
changelog is a record of what happened.

**No synonym cycling.** Pick one referent for an entity and reuse it
across consecutive sentences. Writing "the script" then "the sync"
then "the workflow" for the same thing in three sentences is an AI
tell, even when each label is technically accurate.

**Don't justify the fact you just stated.** State it and stop. The
tell is a trailing clause arguing for the decision the sentence has
already described: "because our reviewing capacity is the real
limit", "it exists so that working alone does not mean working in
silence", "not favours we extend if there is time". Cut it, headings
included: "Unpaid, and we say so plainly" is "Unpaid". **Site pages
only.** The CHANGELOG, PR bodies and maintainer docs are where
reasoning belongs. Grep a page you are editing for `because`, `so
that`, `rather than`, `which is why`: each hit is a question, not a
verdict, since some are real cause ("Because NetSec is COST-funded,
all its..."). #1370 and #1372 cut `/blog.html` and `/internship.html`
by about a fifth this way, with no fact removed.

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
- **Delete scratch / probe files before staging.** One-off probe pages
  (`jprobe.html`, `rmm.html`, `swatch.html`, and the like) and throwaway
  scripts get swept into a commit by `git add -A` / `git add -u`. Remove
  them (or keep them outside the repo) and eyeball `git status` before
  every commit, rather than trusting `.gitignore` to catch each one.
  **Mechanical backstop:** `.gitignore` pins `* [0-9].*` to drop the
  Finder/iCloud duplicate class (`name 2.ext`), which twice got committed
  by `git add -A` this way (a 20 MB `essc-2025 2.mp4`, a stray
  `conference-media 2.njk`). The `git status` eyeball stays the primary
  habit; the glob is the net for that one recurring class.

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
§3) and the planned releases on the roadmap; without it, the backlog
drifts.

### The milestone set (version-tied, SemVer)

EISS uses **version-numbered milestones** matching the planned
releases on the roadmap, plus a single catch-all for uncommitted
work. This mirrors the sister NetSec site. EISS switched from
thematic milestones to this scheme after v2.24.0, so the milestone
now answers "which release is this for?" rather than "what kind of
work is this?". The set:

- **One milestone per planned release** (`v2.25.0`, `v2.26.0`,
  `v2.27.0`, …), created from the version-tagged rows of the roadmap
  (the *At a glance* timeline in [`docs/roadmap-2026.md`](docs/roadmap-2026.md),
  surfaced publicly on `/roadmap.html`). A patch milestone
  (`v2.24.1`) exists only when a reactive patch is anticipated, such
  as the post-conference cut.
- **`Backlog — Under watch`**: items waiting on an external trigger
  (Indico write-API access, NetSec coordination, source research) or
  with no committed release. Mirrors the *Under watch* section of the
  roadmap.

**Every milestone title is a SemVer version, or the backlog.** No
sentence-titled milestones. A conference cycle has phases with their own
deadlines (*save the date*, *call for papers*, *selection and
notifications*, *programme and logistics*, *conference*), and those are
real, but they are named in the roadmap and in the issues rather than
minted as milestones. The prep work rides whichever release is open when
its deadline falls, which is what NetSec does and says in its own §10.

This was tried the other way in August 2026 and reverted the same month:
five `ESSC 2027: <phase>` milestones existed briefly, and the reason
against them is that they answer a different question from the rest of
the set. A milestone here answers "which release is this for?", and a
board where some rows answer that and others answer "which phase of a
conference is this?" cannot be read as one queue. The phase rows live in
[`docs/roadmap-2026.md`](docs/roadmap-2026.md) beside the release
timeline, which is where a date owned by somebody else belongs.

Due dates on the version milestones come from the roadmap timeline.
When the roadmap shifts a planned release, **bump the milestone's due
date in the same commit that updates the roadmap row**: they are two
views of one schedule. A conference deadline that lands between releases
moves the nearest release's date or waits for it, and the roadmap says
which.

Create a new version milestone when the roadmap gains a release row.
Don't pre-create far-future majors.

### When to set the milestone

- **At issue creation.** Whenever rule §3 fires, set the milestone
  alongside the title and body. `gh issue create --milestone v2.25.0 ...`
  keeps it inline.
- **When an issue slips to a later release.** Update the milestone in
  the same edit that records the reslip, with a one-line reason in
  the thread.
- **Never leave an open issue without one.** A milestone-less open
  issue is invisible to roadmap planning. If it has no committed
  release, it belongs in `Backlog — Under watch`.

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

## 14. Ship-completeness: a green build is not "it works"

`npx @11ty/eleventy` succeeding proves the templates *compile*, not that
the feature *renders*. A whole feature can ship with complete markup,
JS, and i18n strings and still be invisible or broken in the browser.
The QA pass that added this rule found two such cases live on the site:
the **press kit** and the **site-search modal** had every class name in
their markup but **not one of those classes was defined in
`site.css`**, so the search overlay rendered as an unstyled block and
the press-kit logos spilled full-width. Both had passed CI and shipped
"done" (this is the same failure mode the NetSec sister repo hit with
its undefined `.grid-2`).

Before calling any UI work done:

- **Grep that every new class the markup references is actually defined**
  in `site.css`. New `.foo` in a `.njk` with zero hits in the stylesheet
  is the tell. A cheap CI lint could assert this (tracked separately).
- **Render it.** Build, serve, and check the component in the preview at
  desktop *and* a phone width. For JS-driven UI (modals, video, menus),
  exercise the interaction, don't just confirm the element exists.
- **Test the actual device class the user reported**, not a proxy.
  iOS Safari/Chrome autoplay, tap targets, and the collapsed mobile nav
  behave differently from a desktop window resized narrow.
- When a feature is built by a parallel/worktree workflow, treat its CSS
  and its render state as the first things to verify on merge: a fan-out
  agent that wrote the markup may never have written the styles.

The lesson generalises: verification must target the user-visible
behaviour the change promises, on the surface the user actually uses.

### Standing verification habits

Carried over from the NetSec sister repo, where the same gotchas were
re-derived more than once. These are **default behaviour, not
on-request**:

- **Grep for the bug's siblings before closing.** When you fix a bug,
  search the codebase for the same pattern and fix every instance in the
  same pass. Don't wait to be asked "check elsewhere too". This has
  recurred: the deep-link-scroll and sticky-chrome scroll-padding fixes
  both had siblings, as did the dead YouTube-Shorts URL and the
  GitHub-Release `octet-stream` video content-type (both needed fixing
  on `/2025` *and* `/past` ×3).
- **A sitewide change ripples into the CI gates, so trace it first.** A
  change touching every page (a chrome include, a shared CSS class, the
  `bust` filter's `?v=` cache-buster) flows into the i18n drift checker
  and the link checker. The `?v=` cache-buster once silently tripped the
  drift checker until it was normalised. Before pushing anything
  sitewide, run `check-i18n-drift.py` and the build locally and reason
  about which gates it touches.
- **Trust the Preview MCP's computed reads, not its screenshots.**
  `preview_screenshot` can return blank or dark (e.g. when the page is
  `visibilityState: hidden`, or before first paint) and doesn't reliably
  scroll-to-fragment or settle layout. `preview_eval` reads —
  `getComputedStyle`, `getBoundingClientRect`, element / attribute
  checks — are reliable, and are how the search modal, press-kit grids,
  iOS film playback, gallery crop, and `/past` ordering were all
  verified. Prefer them; treat a screenshot as a loose sanity check, not
  proof. (NetSec hit the raw-headless-Chrome equivalents:
  `--screenshot` / `--dump-dom` don't fire `requestAnimationFrame` or
  scroll to a fragment, and backgrounded stdout doesn't flush — read the
  dumped DOM file instead; `--force-prefers-reduced-motion=reduce` and
  computed-style reads are the dependable parts.)

## 15. CSS namespacing: one prefix per component

`site.css` is a single global stylesheet with no scoping, so two
unrelated components can quietly fight over the same class name. The
last selector in the file wins the cascade, so a later component that
reuses an earlier one's class silently rewrites it. This shipped once:
the `/2021` archive programme list redefined `.programme-slot` /
`.programme-day`, the names the live `/2026` grid (`programme-grid.njk`)
already owned, and broke the live grid in production (#231 → fixed in
#239). The build was green throughout, because the §14 sanity guard
catches a class used in markup but **undefined** in CSS, not a class
**defined twice** by different components.

So: **each component owns a unique class prefix, and never reuses
another component's prefix.** The live programme grid reserves
`programme-*`; the archive list uses `archive-programme-*`; the
by-person view uses `speaker-*`; and so on. When adding a component,
pick a fresh prefix and confirm it isn't already claimed
(`grep -n '\.your-prefix' src/assets/css/site.css`) before defining it.
Reuse another component's base class only when you genuinely mean to
extend that component, not by accident.

The enforcement half shipped in #241: `scripts/check-build-sanity.mjs`
(already run in CI) attributes every selector to the `/* ---------- name
---------- */` section it sits in and flags a class styled bare
(unscoped) as the selector subject in two different sections, which is
what the #231 regression looked like. Scoped extensions (`.btn .icon`)
and a short allowlist of cross-cutting sweep sections (print, mobile
tap-targets, the global reset) don't count as collisions.

## 16. Ponytail: the lazy ladder, tuned to this repo

The `ponytail` plugin (laziest solution that works) is customised here by
this section rather than by editing the global plugin (which updates
out from under us). The generic ladder is code-centric. For two static
Eleventy sites it reads:

1. **Does it need to exist?** Most "features" here are content, not
   mechanism. A one-off page or a single edition's quirk is data plus an
   existing partial, not a new component. Build mechanism only when the
   second caller actually arrives.
2. **Native HTML/CSS before JS.** Progressive enhancement is already the
   house style: `<details>` for disclosure, `:target` and anchors for
   deep links, click-to-load for embeds. Reach for JS only when the
   feature still degrades without it (the abstract clamp, the parallel
   panels). No framework, ever.
3. **No new npm dependency.** The build is `npx @11ty/eleventy` plus a
   few `scripts/*.py`. Every dependency becomes a Dependabot lane and an
   `npm audit` line (rule §2). A few lines of Nunjucks or vanilla JS beats
   pulling a package.
4. **One data-driven include, not N hand-wired copies.** A repeated block
   reads `_data` through a single partial. The drift this prevents is
   real and has bitten: `conference-media.njk` replaced three near-identical
   per-year sections (#358).
5. **Reuse the cross-repo JSON contract, don't rebuild a NetSec system**
   (the `cross-repo-project` skill, and the "don't duplicate NetSec-unique
   systems" memory). The
   directory and Anthology link by published index files, not scraping.
6. **Then** the shortest diff: one CSS prefix per component (§15), delete
   over add.

Repo-specific "when NOT to be lazy": a green `npx @11ty/eleventy` is not
"it works" (§14). The ponytail "one runnable check" here is a render plus a
computed-style read at desktop and phone width, not a screenshot. And no
machine translation as a shortcut (§1): FR/DE are hand-translated or they
do not ship. Mark deliberate simplifications with a `ponytail:` comment
(fits the existing one-line `# label` comment style).

---

## Lazy-loaded procedures

Three task-specific procedures live as skills rather than in this file, so they
load when invoked instead of costing context every session. Invoke by name.

- `release-cross-check` — the five-point cross-check before cutting a minor or
  major release, plus milestone hygiene (was §5).
- `whats-new-banner` — when to activate the site-wide announcement banner, and
  how (was §12).
- `cross-repo-project` — the EISS + NetSec GitHub Project, its scope and its
  boundary against milestones (was §13).

---

*This file is short on purpose. If you need to add a rule, add it
here; if you need to add an example, prefer linking a PR / commit /
issue so this file stays a reference rather than a tutorial.*
