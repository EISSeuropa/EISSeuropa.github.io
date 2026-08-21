# EISS website — documentation index

Maintainer-facing docs for [eiss-europa.com](https://eiss-europa.com)
(Eleventy 3 + Nunjucks, deployed to GitHub Pages). Start with
`architecture.md` for the big picture, then dive into the topic docs.

| Doc | What it covers |
|---|---|
| [architecture.md](architecture.md) | Build pipeline, data sources, sync jobs, CI gates, deploy — the data-flow map. |
| [admin-guide.md](admin-guide.md) | Operator and handover guide: who holds what access, what runs unattended, and what a successor needs on day one. |
| [design-system.md](design-system.md) | UI components and interaction patterns (the `.njk` partials + their CSS/JS). |
| [a11y-audit-2026-08.md](a11y-audit-2026-08.md) | The August 2026 accessibility audit for #1225: method, the five defect classes found, what the tooling could not check, and what declaring conformance would take. |
| [scoped-release.md](scoped-release.md) | How a surface declares what is finished instead of carrying a page-wide "early access" label: the derived edition scope, the interface switch, and the build gate that keeps the claim honest. |
| [qa-checklist.md](qa-checklist.md) | Release / pre-conference Go/No-Go audit using the repo's own tooling. |
| [qa-audit-2026-06.md](qa-audit-2026-06.md) | The June 2026 site-wide QA audit across seven dimensions: method, the 19 confirmed findings, and what each one turned into. |
| [i18n.md](i18n.md) | Translation model (EN source + FR/DE), the drift checker, the beta ribbon. |
| [search.md](search.md) | Pagefind search: deploy-time index, bio stubs, why local search is "unavailable". |
| [board-bios-setup.md](board-bios-setup.md) | The Form → `board.json` → board page bios pipeline. |
| [indico-programme-integration.md](indico-programme-integration.md) | The live ESSC programme grid from the Indico sync. |
| [indico-api-token.md](indico-api-token.md) | Indico API token setup for the authenticated sync. |
| [new-conference.md](new-conference.md) | Per-year-page rollover procedure for a new ESSC. |
| [news-publishing.md](news-publishing.md) | The News surface: the homepage "Latest" section, the `/news` archive, the Atom feed, and how an item gets added. |
| [publication-matching.md](publication-matching.md) | Linking ESSC papers to their later-published versions: the matcher, the review queue, the confirm step, the monthly sync. |
| [anthology-corpus-note.md](anthology-corpus-note.md) | The public corpus-description note: scope, sources, the theme vocabulary, co-authorship, coverage, limitations. Drafted for deposit. |
| [corpus-archiving.md](corpus-archiving.md) | Depositing the Anthology outside the repo: the Zenodo concept vs version DOI, where the DOI surfaces, the versioning cadence, HAL. |
| [anthology-machine-readable.md](anthology-machine-readable.md) | What the corpus emits for machines: `.bib`/`.ris` exports and the bulk control, the per-theme Atlas pages and their generated cards, the per-theme Atom feeds and the committed date ledger behind them. |
| [netsec-directory-integration.md](netsec-directory-integration.md) | Anthology authors ↔ NetSec member directory cross-links (both directions): the two JSON contracts, the name-key join, the sync, per-author addressability. |
| [internship-handbook.md](internship-handbook.md) | For volunteers and interns: first week, claiming a task, the two review jobs in detail, house style, how writing gets published. The operational half of `/internship.html`. |
| [roadmap-2026.md](roadmap-2026.md) | The internal roadmap (autostamped from the CHANGELOG). |
| [branch-protection.md](branch-protection.md) | The `master` rulesets (force-push/deletion/linear + PR gate), the bypass design, and the deferred required-checks plan. |

Project-wide conventions (British English, the PR / merge workflow,
release format, milestone tagging, verification habits) live in the
repo-root **`CLAUDE.md`**, not here.
