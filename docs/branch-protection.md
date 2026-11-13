# Branch protection on `master`

How the default branch is protected, why it's configured this way, and
what's deliberately deferred. Protection is implemented with **GitHub
rulesets** (not classic branch-protection rules) because rulesets support
a per-actor **bypass list**, which is what lets `release.sh` and the
automation keep working while everything else is gated.

Manage these under **Settings → Rules → Rulesets**, or via
`gh api repos/EISSeuropa/EISSeuropa.github.io/rulesets`.

## What's live

Two active rulesets target the default branch (`~DEFAULT_BRANCH`, i.e.
`master`):

### Phase 1 — safety (no bypass; applies to everyone, including the owner)
- **`deletion`** — `master` cannot be deleted.
- **`non_fast_forward`** — no force-pushes to `master`.
- **`required_linear_history`** — no merge commits (matches the
  squash-merge convention in `CLAUDE.md` §2).

These touch nothing in the merge flow: squash-merges and fast-forward
pushes (including `release.sh`'s release commit) proceed normally. They
just remove the foot-guns.

### Phase 2 — PR gate
- **`pull_request`** with **`required_approving_review_count: 0`** —
  changes reach `master` through a pull request, but **no human approval
  is required**. Zero approvals is deliberate: this is a single-maintainer
  repo, you cannot approve your own PR, and the sync bots / Dependabot
  cannot produce a human review, so requiring approvals would deadlock
  every merge.
- **Bypass: the Admin repository role** (`RepositoryRole` id 5). This
  keeps `release.sh` working (it pushes the release commit + tag straight
  to `master`) and prevents lock-out. Trade-off: as an admin you *can*
  still direct-push. To force even yourself through PRs, drop this bypass
  and route releases through a PR instead.

### Phase 3: required status checks (live since 5 October 2026)

_Closed [#501](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/501)._ The same ruleset (`17259266`) adds **`required_status_checks`** for four contexts from the GitHub Actions app (integration id `15368`):

- `build` (`deploy.yml`)
- `axe-core in headless Chrome` (`a11y-browser.yml`)
- `Verify translations match their English sources` (`i18n-drift.yml`)
- `Duplicate data keys + empty href/src` (`sanity-check.yml`)

All four run on every `pull_request` with no path filter, so none can fail to report. `strict_required_status_checks_policy` is `false` (see below). The bots' merge script waits for the four to pass before merging (see *Restrict updates* below).

**Bot PRs.** The sync bots open and merge their PRs with the `AUTOPR_TOKEN` fine-grained PAT of the owner account (this repo, contents + pull-requests read/write), so their `pull_request` runs start without an approval. The four required checks run on bot PRs like any other, so a bad sync stops at its PR and never reaches `master`. `scripts/merge-bot-pr.sh` waits for the four, then merges with `--admin`, about two minutes after the PR opens. When a required check fails, the script stops and the workflow fails, and on a `*/auto` branch the failure alarm opens an issue titled with that branch. The `--admin` merge needs the owner's PAT: with the secret missing or expired, the merge step fails and the failure alarm assigns an issue. The same script merges a news PR when an account in `NEWS_APPROVERS` applies the `publish` label (`news-merge.yml`), limited to PRs that change only `src/_data/news.json`, since the mobile app offers no bypass. It merges a board profile PR the same way for an account in `PROFILE_APPROVERS`, limited to PRs that change only `src/_data/board.json` and headshots in `src/assets/images/board/` (#2135).

**Left out on purpose.** Link-check is path-filtered (third-party bandwidth), so it would not report on every PR. CodeQL reports failure when cancelled and neutral on bot PRs.

**Admin bypass.** The Admin role still bypasses the ruleset, so `release.sh` can push the release commit, and an admin can override a stuck check from the merge box. Auto-merge never bypasses: it always waits.

### Restrict updates (live since 9 November 2026)

Ruleset `26861118` has one rule, `update`, on the default branch, with the Admin role as its only bypass. Only bypass actors can update `master`, so a collaborator cannot merge a PR, even with the four checks green. The repository belongs to a personal account, where every collaborator can push and merge and only the owner is admin. A ruleset is the only way to keep merging with the owner.

Auto-merge does not apply the bypass, so an armed PR waits forever with "Cannot update this protected ref" (seen on #2108). Consequences:

- Nobody arms auto-merge. The maintainer merges from the merge box by ticking *Merge without waiting for requirements to be met (bypass rules)*, after the four checks pass. On a PR where auto-merge is armed, disable it first: the box is hidden until then.
- The bots merge with `scripts/merge-bot-pr.sh`, which waits for the four required checks and then runs `gh pr merge --squash --admin` as the owner. It never merges past a failing or missing check. Its list of four checks must stay in step with ruleset `17259266`.
- CLAUDE.md §2 forbids `--admin` for people. The bot script is the one exception, because it waits for the checks itself.

## Who can merge

Only the owner account, through the bypass of ruleset `26861118`, by hand or through the bots' PAT. Collaborators can push branches, open PRs and label issues, but their PRs wait for the maintainer (`docs/repositories-and-workflow.md`, *Collaborators*). Zero required approvals stays: the maintainer's own PRs and the bots would deadlock on a review nobody else can give.

## Not enabled (and why)
- **Required reviews / approvals** — would deadlock a solo repo.
- **Merge queue.** Not needed at this volume. It would serialise merges and ease the §4 CHANGELOG race if that ever recurs.
- **"Require branches up to date before merging"** — without a merge
  queue, the bot volume causes constant re-run thrash, and it aggravates
  the §4 CHANGELOG concurrency trap.
- **Signed-commit enforcement** — would block the bots' and merge commits
  and add GPG/SSH-signing friction for little gain on a solo repo.
