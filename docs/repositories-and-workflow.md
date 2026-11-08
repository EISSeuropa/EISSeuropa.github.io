# EISS repositories and team workflow

**Audience: anyone starting work on EISS's code, including a new Claude
session.** One page on what each repository is, how the three depend on
each other, and how the team decides where work lives. Each repository's
`CLAUDE.md` carries a short version of this page and links here. When
something below changes, update this page and the short version in all
three `CLAUDE.md` files in the same round of PRs.

This repository is public, so nothing private goes here. The private
details (script IDs, the credential, the operating procedures) are in
`EISSeuropa/workspace-ops` and in the EISS DevOps handbook on Drive.

## The three repositories

| | `EISSeuropa.github.io` | `netsec.github.io` | `workspace-ops` |
|---|---|---|---|
| What it is | eiss-europa.com: the EISS site, the Anthology and Atlas, the conference pages, the internal dashboard | netsec-cost.eu: the site of COST Action CA24154 and its member Directory | The Apps Script projects behind EISS's Google Workspace: joining and leaving, backups, the status web app |
| Visibility | Public | Public | Private |
| Default branch | `master` | `main` | `main` |
| Built with | Eleventy 3 and Nunjucks (`src/`) | Hand-written HTML in three locales, JSON read in the browser, Python builders | Apps Script (`.gs`), deployed with clasp 3 |
| Deploys | GitHub Pages, on every push to `master` | GitHub Pages, on every push to `main` | "Deploy Apps Script" workflow, on every merge to `main` |
| Merging | Squash, auto-merge, four required checks | Squash, auto-merge | Merge commit, by the maintainer |
| Releases | SemVer, `scripts/release.sh`, `CHANGELOG.md` | SemVer, `scripts/release.sh`, `CHANGELOG.md` | None |
| Rules | `CLAUDE.md` and `.claude/skills/` | `CLAUDE.md`, `.github/CLAUDE.md` and `.claude/skills/` | `CLAUDE.md` and `README.md` |

A fourth repository, `EISSeuropa/internal-redirect`, holds only the
redirect that makes `internal.eiss-europa.com` lead to `/internal.html`
here (`docs/admin-guide.md`). GitHub Pages also publishes it at
`eiss-europa.com/internal-redirect/`, so its name must not match a path
on this site.

Dr Arthur Laudrain maintains all three and is the person who merges.

## How they depend on each other

Each row is a contract: the consumer reads a file or address the
producer publishes. Renaming, moving or reshaping one breaks the
consumer, usually without failing the producer's CI. Before changing a
producer's side, find the consumer in the other repository
(`gh api -X GET search/code -f q='<file name> org:EISSeuropa'`) and
change both, or keep the old shape.

| Producer | What | Consumer |
|---|---|---|
| NetSec | `directory-index.json` at the site root | EISS `sync-netsec-directory.yml` and `scripts/sync-netsec-directory.mjs`: Anthology authors link to NetSec profiles |
| EISS | `/data/authors-index.json` | NetSec `scripts/build-profile-pages.py`: profiles link to the Anthology |
| EISS | `/data/anthology-index.json` | NetSec `assets/js/essc-programme.js`: the ESSC programme links papers |
| NetSec | `data/events.json` on `main` (`uid`, `displayDate`, `applicationDeadline`) | EISS `src/_data/netsecEvents.js`: the Training School dates on `/2027` (EN, FR, DE) and `/NetSecSchool.html`, and through it `src/_data/dashboard.js`: Timeline tiles on the internal dashboard |
| NetSec | `data/bios.json`, `data/wg.json`, `data/mc-members.json` and the git history of `main` | EISS `src/_data/netsecReport.js`: the NetSec report tab |
| NetSec and EISS | Workflow runs | EISS `src/_data/systemHealth.js`: Platform status tab |
| workspace-ops (`status`) | The EISS status web app, and its `?view=dates` | EISS `src/_data/systemHealth.js` (Workspace card) and the Key dates on the dashboard (fallback: `keyDates` in `src/_data/site.js`) |
| workspace-ops (`status`) | `?view=dates`: the `uid` and `deadline` keys of the "EISS dates" calendar | NetSec `scripts/sync-calendar-dates.py`, in the daily Indico sync: the `start`, `end` and `applicationDeadline` of events not on Indico (netsec.github.io#2133) |
| EISS | `src/_data/cohorts.json` and `src/_data/board.json` on `master` | workspace-ops `intern-lifecycle`: cohort dates and the Website check column |
| workspace-ops (`intern-lifecycle`) | A row in the board entries Form's response sheet | EISS `sync-board.yml` (Mondays): the PR that updates `board.json` |
| EISS | `roleEndDate` in `board.json` | EISS `offboarding.yml`: the website-side leaver issue |
| NetSec | Its latest GitHub Release (`releases/latest`): the name `vX.Y.Z — Title`, the body's `### For the team` section or its lede | EISS `src/_data/latestReleases.js`: the release card on the internal dashboard |
| EISS and NetSec | The `releases.atom` feed of each repository, and the `For the team` heading in a release body | workspace-ops `release-notes`: the release email to staff@, board@ and internship@ |
| Indico (`indico.eiss-europa.com`, hosted apart from all three) | Category exports | `sync-indico.py` in both sites. Neither repository changes Indico |

The name key that joins people across the two sites is `name_key()`,
defined in NetSec's `scripts/sync-bios.py` and ported unchanged to the
Anthology build. NetSec's `docs/cross-repo-workflow.md` covers the
two sites' shared patterns and the "Ported from" convention for a fix
that both need.

## Where work lives

- A change to a website, its code or an automation, including
  `workspace-ops`, is a GitHub issue in the repository it touches, with
  a milestone. Work for the cross-repo Project board is described in
  the `cross-repo-project` skill.
- Team work with an owner and a date, or a manual step in an app, is a
  task in the Tasks tab of the project's Google Chat space, with one
  assignee who is a direct member of the space. The Project Manager app
  was retired on 1 November 2026.
- Never copy one into the other. A Chat task that depends on an issue
  links to it.
- Website work offered to volunteers carries `help wanted` (and
  `good first issue` for tasks that assume no knowledge of the
  repository). `needs-review` means a maintainer reads the result.
  A volunteer claims a task by commenting on the issue.
  `docs/internship-handbook.md` has the rest.

## Where documents live

| Kind | Place |
|---|---|
| How a system works, and why it changed | The repository's `docs/` or `README.md`, updated in the same PR |
| How EISS operates a system, and who holds access | EISS DevOps handbook, in EISS Restricted > DevOps |
| Staff guides | EISS Team > Guides and procedures |
| Drafts | Google Docs in the EISS Team shared drive |
| Admin, finance, board papers, personal data | EISS Restricted |
| Passwords, tokens, recovery codes | The password manager only |
| Routine IT reports | Issue #1939 here, in wording safe for a public repository |

## Changing each repository

- The two sites: branch from a freshly fetched default branch, set the
  milestone, add an `[Unreleased]` bullet for a visible change, open the
  PR, arm squash auto-merge, and leave a visual change for a preview
  review. After the PR opens, its branch is frozen: follow-ups go in a
  fresh PR. Each `CLAUDE.md` §2 has the detail.
- `workspace-ops`: open a PR. The "Tests" workflow runs every project's
  `test*.mjs`. Merging deploys the changed projects, and stops on a
  project whose live code was edited in the browser. A change of
  permissions, a one-off function and triggers still need admin@ in the
  Apps Script editor. Its `README.md` has the detail.
- Translations (both sites): FR and DE copy may come from Claude or any
  other machine-translation tool. Merging the PR approves the
  translation. The PR says which strings are machine translations.

## Claude sessions

A session runs either on the maintainer's Mac (Claude Code desktop or
CLI) or in the cloud (claude.ai/code). The rules are the same, and the
tools differ.

| Step | On the Mac | In a cloud session |
|---|---|---|
| Branch | `git fetch origin && git checkout -b <branch> origin/<default>` | The session names a `claude/...` branch. Create or reset it from freshly fetched `origin/<default>` before the first edit |
| Open a PR | `gh pr create --milestone ...` | GitHub connector `create_pull_request`, then `issue_write` (method `update`, the PR number, the milestone number) to set the milestone |
| Auto-merge | `gh pr merge --auto --squash` | `enable_pr_auto_merge` with `mergeMethod: SQUASH` |
| Auto-fix | `set_monitor` in the desktop app | `subscribe_pr_activity` |
| Issues | `gh issue create --milestone ...` | `issue_write` (method `create`, `milestone` number) |
| Search | `gh` | `gh api -X GET search/issues` or `search/code` (search only) |
| Deploy Apps Script | `clasp push` by hand, or merge | Merge only: no clasp credential reaches a session |
| Another repository | Already cloned | `add_repo`, if the session was not started with it |

A cloud session can read and change all three repositories when they
are attached. It cannot read Drive's EISS Restricted unless the Google
Drive connector is on, and it never holds the clasp credential.
