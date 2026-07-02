# Architecture & data flow

A slim map of how the EISS site is built and where its content comes
from. For component-level detail see [design-system.md](design-system.md);
for conventions see the repo-root `CLAUDE.md`.

## Build pipeline

Static site, **Eleventy 3 + Nunjucks**, output to `_site/`, served by
**GitHub Pages**.

```
src/*.njk (pages)  +  src/_includes/*.njk (components)  +  src/_data/* (data)
        │  Eleventy build (.eleventy.js)
        ▼
     _site/**.html  +  passthrough assets (src/assets → /assets)
        │  deploy.yml: build → `pagefind --site _site` → upload-pages-artifact → Pages
        ▼
   eiss-europa.com
```

- **Pages**: `src/*.njk`. English is `page.njk`; translations are
  `page.fr.njk` / `page.de.njk` (same permalink stem, `.fr`/`.de`
  infix). Archive `/YYYY` pages and special events (`/Ukraine`,
  `/JPW2019`, `/joint-2024`) are EN-only.
- **Layout**: `src/_layouts/base.njk` wraps every page (head/SEO, nav,
  footer, sticky chrome, the search modal, ribbons).
- **Asset cache-busting**: the `bust` filter appends the first 8 hex of
  a file's SHA-256 (`site.css?v=…`), recomputed at build. A sitewide
  asset change therefore ripples into the i18n drift + link gates —
  trace it (CLAUDE.md §14).
- **`.eleventy.js`** owns: passthrough copies (`src/assets`, `src/data`,
  CNAME, etc.), the `bust` / `inlineSvg` / `localizedHref` /
  `daysUntil` filters, and the inline-SVG icon helper.

## Data sources (`src/_data/`)

| File | Feeds | Source of truth |
|---|---|---|
| `conferences.js` | Conference cycle: `next`, `past[]`, `byYear{}`, ordinals, dates, venues, `registrationStatus`, `youtubePlaylist`. | Hand-maintained. |
| `indico.json` | Live ESSC programme grid + upcoming events. | `sync-indico.py` (Indico API). |
| `archiveProgrammes.js` | Past programmes (2017–2025, joint-2024, Ukraine, JPW2019) in the live-grid shape, rendered by `archive-programme.njk`. | Hand-transcribed from final programme PDFs. |
| `board.json` | Board + support people. | `sync-board.py` (the Google Form). |
| `boardSorted.js` | Computed view over `board.json` + roles table + Indico: `leadership` / `boardMembers` / `support` / `pastMembers`, plus `slug`, `initials`, `isEsscActive`, counts. | Derived. |
| `searchBios.js` | One Pagefind stub record per person per locale (see search.md). | Derived from `board.json`. |
| `i18n.js` | The chrome-string catalog (`en`/`fr`/`de`): nav, footer, search, ribbons, badges. Key parity enforced by `check-i18n-keys.js`. | Hand-maintained. |
| `roadmap.js` | The public `/roadmap` cards (per locale). | Hand-maintained. |
| `netsec.js` | NetSec leadership held by EISS people. | Hand-maintained. |
| `netsecDirectory.json` | Mirror of NetSec's published `directory-index.json`; `corpus.js` matches it to authors to render the "NetSec profile" link. See `netsec-directory-integration.md`. | `sync-netsec-directory.mjs`. |
| `netsecDirectoryRejects.json` | Suppresses a wrong homonym match in the above. | Hand-maintained. |
| `announcement.js` | The data-driven announcement/quote blocks. | Hand-maintained. |
| `panels2022.js`, `countryFlags.js`, `site.js` | 2022 panels, flag lookup, site-wide config (nav array, URLs). | Hand-maintained. |

## Sync pipelines (scheduled GitHub Actions → auto-PR)

- **`sync-indico.yml`** → `sync-indico.py` → `indico.json` (programme +
  events). Needs the Indico API token (`indico-api-token.md`).
- **`sync-board.yml`** → `sync-board.py` → `board.json` (Form pipeline;
  tuned to produce zero dirty files when nobody changed their entry).
- **`sync-roadmap.yml`** → autostamps `docs/roadmap-2026.md` from the
  CHANGELOG `[Unreleased]` section; `roadmap-progress.yml` →
  `sync-roadmap-progress.py` → `data/roadmap-progress.json` (closed/total
  per milestone, drives the `/roadmap` progress bars).
- **`sync-orcid.yml`** → `sync-orcid.py` → `orcidWorks.json` (members'
  recent public ORCID works; weekly).
- **`sync-publications.yml`** → `match-publications.mjs` +
  `confirm-publication.mjs --auto-high` → `paperLinks.json` (high-confidence
  matches, published) + `data/publication-candidates.json` (review band,
  queued; monthly). See `publication-matching.md`.
- **`sync-netsec-directory.yml`** → `sync-netsec-directory.mjs` →
  `netsecDirectory.json` (NetSec member directory, for the Anthology
  cross-links; weekly + a `repository_dispatch` fast path). See
  `netsec-directory-integration.md`.
- **`scheduled-rebuild.yml`** redeploys daily so build-time values
  (countdown, registration status) don't drift between content changes.

**Outbound contracts (EISS publishes, siblings consume).** Two build-time
permalinks let the NetSec site link into EISS: `/data/anthology-index.json`
(per-paper, for programme links) and `/data/authors-index.json` (per-author,
for directory profile links). Both regenerate from `corpus.js` every build.
See `netsec-directory-integration.md`.

Each sync opens an auto-PR (auto-merge armed, CI-gated) rather than
pushing to `master`. `sync-publications.yml` auto-merges too, but only the
**high-confidence** matches are published; its mid-confidence "review band"
rides along as queue data and is published only when a human confirms it by
hand (`confirm-publication.mjs <slug>`), since a wrong match mis-cites.

**`failure-alarm.yml`** watches those scheduled workflows plus the
deploy: on a `failure` conclusion it opens (or threads a comment onto)
a `CI alarm` tracking issue, labelled `automated` + `bug`, so a silent
cron failure surfaces instead of going unnoticed. It ignores
`cancelled` (the sync workflows use `cancel-in-progress` concurrency,
so supersession is normal). Pure `gh` CLI, no third-party actions
(#56).

## CI gates (on PRs)

| Workflow | Gate |
|---|---|
| `deploy.yml` (build job) | Eleventy build succeeds. |
| `link-check.yml` → `check-links.sh` | Every internal/external link + `#fragment` in `_site/` resolves. |
| `i18n-drift.yml` → `check-i18n-drift.py` | Every FR/DE page matches its EN source hash (`data/i18n-state.json`). |
| `i18n-drift.yml` → `check-i18n-keys.js` | EN/FR/DE chrome catalogs have identical key sets. |
| `sanity-check.yml` → `check-build-sanity.mjs` | No duplicate `_data` object keys, no empty/junk `href`/`src`, no scheme-less `board.json` links, no markup class left undefined in `site.css` (§14 unstyled-feature guard), and no class styled bare as the selector subject in two different `site.css` sections (§15 cross-block collision guard, CLAUDE.md issue #241). |
| `sanity-check.yml` → `a11y_lint.py` | No accessibility findings (missing landmarks / alt / labels, heading-hierarchy gaps, duplicate IDs, accessible-name absence). |
| CodeQL | Static analysis. |

`CHANGELOG.md` is pinned `merge=union` in `.gitattributes` so concurrent
`[Unreleased]` bullet additions concatenate instead of one being dropped
(CLAUDE.md §4 — note GitHub's server-side squash doesn't apply the
driver; resolve locally).

## Deploy

`deploy.yml`: on push to `master`, build → generate the Pagefind index
into `_site/pagefind/` → `upload-pages-artifact` → Pages. The Pagefind
index is **not** committed; it exists only on the deployed site (hence
local search shows "unavailable", see search.md). All `uses:` are
SHA-pinned (CLAUDE.md §2).
