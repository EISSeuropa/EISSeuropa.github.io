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

Auto-merge stays enabled and still waits for whatever CI runs on a PR
(`build`, `link-check`, `i18n` drift, `build-sanity`, CodeQL), so those
checks continue to gate the normal merge path.

## What's deferred to Phase 3, and why

_Tracked in [#501](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/501)._

**Required status checks are intentionally *not* enforced yet.** On this
repo they would strand the daily automation:

1. **The sync bots open PRs with `GITHUB_TOKEN`** (roadmap, board, indico,
   via `peter-evans/create-pull-request`). Such PRs do **not** trigger the
   `pull_request` workflows, so `build` / `link-check` / `build-sanity` /
   `i18n` never report on them. A required check that never reports blocks
   the PR forever → the bot's auto-merge hangs.
2. **CodeQL reports `NEUTRAL` on those bot PRs** (only the `Analyze (…)`
   sub-jobs succeed), so even requiring CodeQL is unsafe.
3. **The GitHub Actions app cannot be added to the bypass list** on a
   *user-owned* repo (GitHub rejects it: "must be part of the ruleset
   source or owner organization"), so we can't simply exempt the bots.
4. Several checks are **path-filtered** (`src/**`), so they don't run on
   docs-only PRs either — another way a required check fails to report.

**To enable required checks safely (Phase 3):**
- Switch the bots' `peter-evans/create-pull-request` token from
  `GITHUB_TOKEN` to a **fine-grained PAT** (or a GitHub App). PRs opened
  with a PAT trigger the full `pull_request` CI, so the bots report the
  same checks as a human PR.
- Then add a **single always-run "CI gate" aggregator job** (one that
  `needs:` the real jobs and passes when they pass *or* are skipped) and
  require **only that one context** — this sidesteps the path-filter
  problem and the multiple-context matching.
- Optionally add a **merge queue** (serialises merges; also mitigates the
  §4 CHANGELOG concurrent-merge race).

## Not enabled (and why)
- **Required reviews / approvals** — would deadlock a solo repo.
- **"Require branches up to date before merging"** — without a merge
  queue, the bot volume causes constant re-run thrash, and it aggravates
  the §4 CHANGELOG concurrency trap.
- **Signed-commit enforcement** — would block the bots' and merge commits
  and add GPG/SSH-signing friction for little gain on a solo repo.
