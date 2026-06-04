# EISS website — documentation index

Maintainer-facing docs for [eiss-europa.com](https://eiss-europa.com)
(Eleventy 3 + Nunjucks, deployed to GitHub Pages). Start with
`architecture.md` for the big picture, then dive into the topic docs.

| Doc | What it covers |
|---|---|
| [architecture.md](architecture.md) | Build pipeline, data sources, sync jobs, CI gates, deploy — the data-flow map. |
| [design-system.md](design-system.md) | UI components and interaction patterns (the `.njk` partials + their CSS/JS). |
| [qa-checklist.md](qa-checklist.md) | Release / pre-conference Go/No-Go audit using the repo's own tooling. |
| [i18n.md](i18n.md) | Translation model (EN source + FR/DE), the drift checker, the beta ribbon. |
| [search.md](search.md) | Pagefind search: deploy-time index, bio stubs, why local search is "unavailable". |
| [board-bios-setup.md](board-bios-setup.md) | The Form → `board.json` → board page bios pipeline. |
| [indico-programme-integration.md](indico-programme-integration.md) | The live ESSC programme grid from the Indico sync. |
| [indico-api-token.md](indico-api-token.md) | Indico API token setup for the authenticated sync. |
| [new-conference.md](new-conference.md) | Per-year-page rollover procedure for a new ESSC. |
| [roadmap-2026.md](roadmap-2026.md) | The internal roadmap (autostamped from the CHANGELOG). |
| [branch-protection.md](branch-protection.md) | The `master` rulesets (force-push/deletion/linear + PR gate), the bypass design, and the deferred required-checks plan. |

Project-wide conventions (British English, the PR / merge workflow,
release format, milestone tagging, verification habits) live in the
repo-root **`CLAUDE.md`**, not here.
