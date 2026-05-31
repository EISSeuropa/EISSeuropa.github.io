# eiss-europa.com

Static site for the **European Initiative for Security Studies**, served at <https://eiss-europa.com>.

## Stack

- [Eleventy 3](https://www.11ty.dev/) static site generator with Nunjucks templates.
- Single design-system CSS file in [src/assets/css/site.css](src/assets/css/site.css), holding design tokens, auto + manual dark mode, Apple-style frosted surfaces, motion gated on `prefers-reduced-motion`, Inter font.
- GitHub Actions builds `_site/` on every push to `master` and deploys it to GitHub Pages: no Jekyll, no runtime dependencies, no client-side JS frameworks.
- ~30 lines of vanilla JS for the theme toggle and mobile menu drawer ([src/assets/js/theme.js](src/assets/js/theme.js)).

## Repo layout

```
src/
  _layouts/base.njk      page shell (head, OG/Twitter meta, theme bootstrap)
  _includes/             partials: nav, footer, theme toggle, content
                         partials shared between pages (terms-body, jpw-2019-body,
                         redirect-body)
  _data/                 site identity, conferences, i18n catalogs, NetSec
                         stats, the board roster, Indico events, country
                         flags lookup
  assets/
    css/site.css         the design system, design tokens + every component
    js/theme.js          theme toggle + mobile menu logic
    images/              photos, logos, OG cards, brand/ for the EISS lockup
    files/               PDFs (conference programmes, etc.)
  .well-known/           Apple Pay merchant verification
  CNAME, robots.txt, sitemap.xml, .nojekyll
  *.njk                  one file per page (~72 templates including FR / DE
                         locales)
.eleventy.js             Eleventy config (passthrough rules, year filter,
                         inlineSvg shortcode, localizedHref filter)
.github/workflows/       CI: build, deploy, link check, i18n drift, roadmap
                         autostamp, scheduled rebuild, Indico + board sync
scripts/                 dev helpers (a11y_lint.py, sync-board.py,
                         sync-indico.py, sync-roadmap.py, release.sh,
                         check-links.sh, derive-logo-variants.py, etc.),
                         not part of the deployed site
docs/                    maintainer-facing markdown documentation
                         (board-bios-setup, i18n, indico-api-token,
                         indico-programme-integration, new-conference,
                         roadmap-2026)

CLAUDE.md                operator-facing convention for AI-assisted work
                         (read by Claude Code on every session)
SECURITY.md              vulnerability disclosure policy
CHANGELOG.md             release history with hybrid lede + themes + index
                         format
```

The site is fully built by Eleventy. Every page lives as a `.njk` template under `src/`. URLs are preserved from the original Mobirise export (`/2019.html`, `/JPW2022.html`, `/.well-known/apple-developer-merchantid-domain-association`, and friends) so external bookmarks survive.

## Working on the site

Install Node 20+ once, then:

```bash
npm install
npm run serve     # local dev server with live reload at http://localhost:8080
npm run build     # one-off build into _site/
```

Push to `master` to deploy. GitHub Actions runs the build and publishes via GitHub Pages.

### Editing pages

- **Add a new page:** create `src/your-page.njk`, set frontmatter (`layout: base.njk`, `permalink: /your-page.html`, `title:`, `description:`, `metaImage:`, `navKey:`), then write the content as plain HTML inside.
- **Edit an existing page:** find it in `src/` (or in `src/_includes/` if its content is shared between URLs — terms.html + refund.html, JPW2019 + NDC). Look for the matching `<h1>` to confirm.
- **Add a PDF embed:** ship the PDF in `src/assets/files/`, then drop an `<article class="card pdf-doc">` block using the `.pdf-doc-*` class set from [site.css](src/assets/css/site.css) (see `src/2026.njk` for the canonical example).
- **Change nav links:** edit [src/_data/site.js](src/_data/site.js).
- **Change design tokens (colours, type scale, radii, motion):** edit the `:root` block at the top of [src/assets/css/site.css](src/assets/css/site.css). Tokens cascade through every component.

### Accessibility lint

`scripts/a11y_lint.py` walks every built HTML file and checks for missing landmarks, alt-less images, heading-hierarchy gaps, duplicate IDs, accessible-name absence, etc. Run after any template change:

```bash
npm run build
python3 scripts/a11y_lint.py
```

Should always say `Pages with issues: 0`. axe-core 4.10 also runs cleanly across light + dark modes on the modernised pages, with no contrast violations as of phase 6.

## Versioning

This repository follows **[Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)** from `v1.0.0` onwards. Tagged releases are visible under [*Releases*](https://github.com/EISSeuropa/EISSeuropa.github.io/releases) on GitHub. Every release entry mirrors the relevant section of [`CHANGELOG.md`](CHANGELOG.md).

Because the deliverable here is a website (not a software library), the three SemVer components translate as follows:

| Bump | When | Examples |
| --- | --- | --- |
| **MAJOR** (`x.0.0`) | A foundational reset of scope, identity, or platform. Rare. | A full site redesign, switching off GitHub Pages, a new legal entity replacing EISS. |
| **MINOR** (`1.x.0`) | A **big new project**: a new top-level page, a new automated pipeline, a new locale, a new top-level feature. The default for substantive work. | Adding a new language, a new public page (`/2026`, `/404`), introducing the Indico sync, the live programme grid. |
| **PATCH** (`1.0.x`) | Bug fixes, copy edits, content refreshes, dependency bumps, small UX tweaks. | Fixing a typo, refreshing a member bio, tightening a CSS rule, polish on an existing component. |

A release is cut whenever a milestone is worth marking, typically at the close of a sprint of work, or after a noteworthy fix. **One PR does not equal one release.** PRs add their entries to the `[Unreleased]` section of `CHANGELOG.md`. A release is cut when the cumulative change reads as one. Could be three PRs in a day, could be ten over a month.

**Every release has a short title** that summarises the key contribution in 3–8 words, sentence case, no trailing punctuation. The title appears in three places: the CHANGELOG heading (`## [2.14.0] · 2026-05-22 — Live programme grid`), the GitHub Release name (`v2.14.0 — Live programme grid`), and the release-cutting commit message. `scripts/release.sh` requires the title as a positional argument so the rule cannot be silently skipped:

```sh
./scripts/release.sh 2.21.0 "Adopt NetSec versioning and release tooling"
./scripts/release.sh 2.21.0 "Adopt NetSec versioning and release tooling" --dry-run
```

The format of `[Unreleased]` notes adapts to the release tier:

- **Patch releases** ship the `### Index of changes` block only, with no lede and no themed sections. People reading patch notes care about specifics, not narrative.
- **Minor / major releases** ship the full hybrid: a one- to three-sentence lede, two-to-four themed sub-sections, and the index of changes.

If you can't write a meaningful lede about a release, it's a patch. The format mirrors the actual significance.

**On the `r` suffix in older tag names.** At v2.13.0r the convention here was formally adopted. The earlier history had been bumped too liberally: several releases were tagged as MINOR but were PATCH-shaped (small visual polish or UX tweaks on existing components). A retroactive renumber swept through every existing release and re-cut tags at the same commit SHAs. GitHub's tag-immutability protection blocks reusing previously-deleted tag names, so the renumbered MINORs land with an `r` suffix (`v2.0.0r`, `v2.5.0r`, …, `v2.13.0r`), `r` for "renumbered". PATCH tags that didn't collide with previously-existing names stayed clean (`v2.5.1`, `v2.10.1`, …). The full mapping with the original tag for each entry lives at the bottom of [`CHANGELOG.md`](CHANGELOG.md).

**The v2.14.0 → v2.21.0 burn.** A consequence of the renumber, only fully visible when we tried to cut the next forward-going MINOR after v2.13.0r: GitHub's **immutable-releases** feature permanently reserves every tag name once attached to a Release, even after deletion and even after the feature itself is turned off at the repo level. The retroactive renumber deleted the original `v2.14.0`, `v2.15.0`, …, `v2.21.0` tags, so every one of those names is now an unrecoverable tombstone. Pushing any of them fails with `GH013: Cannot create ref due to creations being restricted`, with no ruleset visible in the UI to explain it. The v2.22.0 release ceremony hit this on v2.14.0, then again on v2.15.0, before probing confirmed the whole range was burned and skipping forward to v2.22.0 (the smallest safe next MINOR). The CHANGELOG footer for `[2.22.0]` documents the discovery for future readers. **Going forward, expect clean `vX.Y.Z` tags from v2.22.0 onwards** via `scripts/release.sh`. The burned range is closed. v2.23.0 cut cleanly in May 2026. The next bump will be v2.24.0 (MINOR) or v2.23.1 (PATCH).

## History

Until May 2026 the site was generated by [Mobirise](https://mobirise.com), exported as 43 standalone AMP HTML files (~80–150 KB each, with the entire Mobirise CSS framework inlined into every file). It was migrated to Eleventy in seven phases (PRs #5 → #14) while keeping the site live throughout. The Mobirise project file has been preserved as `project.mobirise.archived` for reference but is **no longer edited**. All future content changes happen by editing files in `src/`.

## Licensing

Two licences, split by what the file is:

- **Code**: the Eleventy templates, configuration, build scripts, and stylesheets are under the [MIT licence](LICENSE).
- **Content**: the site's text, page layout, and original imagery are under [Creative Commons Attribution 4.0 International](LICENSE-CONTENT) (CC BY 4.0). Attribution: *European Initiative for Security Studies, eiss-europa.com*.

**Carve-out: member photos and biographies.** The CC BY licence does **not** cover the photographs and biographies of board, community, and contributing members (sourced from `board.json`). Those remain the rights of the individuals and may not be reused without their consent.

**Bundled third-party assets** keep their own licences: Lucide icons under ISC, the Inter typeface under OFL. Conference and programme photographs credited in the footer remain the property of their owners.

The `LICENSE` and `LICENSE-CONTENT` files are the verbatim licence texts, so GitHub detects them as MIT and CC BY 4.0. The plain-language version for visitors is on the site at [/licensing](https://eiss-europa.com/licensing.html).
