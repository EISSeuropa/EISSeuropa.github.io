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

All four run on every `pull_request` with no path filter, so none can fail to report. `strict_required_status_checks_policy` is `false` (see below). Auto-merge now waits for the four to pass before merging.

**Bot PRs.** The sync bots open and merge their PRs with the `AUTOPR_TOKEN` fine-grained PAT (this repo, contents + pull-requests read/write), so their `pull_request` runs start without an approval. The four jobs skip on `*/auto` branches, a skipped job counts as passing, and the bot's auto-merge goes through in seconds. If the secret goes missing the bots fall back to `GITHUB_TOKEN`, whose PRs wait for an approval nobody gives, so their auto-merge would hang. When the PAT expires, the sync workflows fail and the failure alarm assigns an issue.

**Left out on purpose.** Link-check is path-filtered (third-party bandwidth), so it would not report on every PR. CodeQL reports failure when cancelled and neutral on bot PRs.

**Admin bypass.** The Admin role still bypasses the ruleset, so `release.sh` can push the release commit, and an admin can override a stuck check from the merge box. Auto-merge never bypasses: it always waits.

## Not enabled (and why)
- **Required reviews / approvals** — would deadlock a solo repo.
- **Merge queue.** Not needed at this volume. It would serialise merges and ease the §4 CHANGELOG race if that ever recurs.
- **"Require branches up to date before merging"** — without a merge
  queue, the bot volume causes constant re-run thrash, and it aggravates
  the §4 CHANGELOG concurrency trap.
- **Signed-commit enforcement** — would block the bots' and merge commits
  and add GPG/SSH-signing friction for little gain on a solo repo.
