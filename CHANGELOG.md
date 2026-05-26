# Changelog

All notable changes to this repository are recorded here.

This project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) and the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. What "MAJOR / MINOR / PATCH" means in the context of this repo is spelt out in the **Versioning** section of [`README.md`](README.md).

## Release-notes format (applies to `[Unreleased]` + every `[X.Y.Z]` section)

Release notes here follow a **hybrid format**: a short prose lede, two-to-five themed sub-sections carrying the actual narrative, and a canonical **index of changes** at the bottom grouped by Keep-a-Changelog categories. The themes are where the writing happens; the index is the audit trail.

### Shape

```markdown
## [X.Y.Z] · YYYY-MM-DD — <short title>

> One- to three-sentence lede in voice. What is this release *about*?
> Who's it for? Why ship it now?

### <First theme — name it for the thing that changed>

Prose intro (~2-4 sentences). Inline links to docs / issues where
relevant. Add bullets only if the theme has multiple distinct pieces;
otherwise let the prose carry it.

### <Second theme>

Same shape.

### Index of changes

The themed sections above are the story; the index below is the
audit trail. Same content, terser.

#### Added
- (one-line pointer bullets, what not why)

#### Changed
- (…)

#### Fixed
- (…)
```

### Rules

1. **One Index block per release.** Each release section has at most one `### Index of changes` block and at most one of each `#### Added` / `#### Changed` / `#### Deprecated` / `#### Removed` / `#### Fixed` / `#### Security` sub-heading inside it, in that order. When a PR adds an entry to `[Unreleased]`, the bullet goes inside the *existing* sub-heading, never a new one with the same name below it.

2. **The lede + themes are written when the release is cut**, not accumulated bullet-by-bullet through the development cycle. The release-cutting moment is where the maintainer reads back through `[Unreleased]`, picks the 2-5 most coherent themes, drafts the lede, and weaves the bullets into prose sections.

3. **Self-policing tier**:
   - **Patch** (`X.Y.Z` with `Z > 0`) ships the Index block only, no lede or themes. People reading patch notes care about specifics.
   - **Minor / major** ships the full hybrid: lede + themes + index.
   - If you can't write a meaningful lede about a release, it's a patch. The format mirrors the actual significance.

4. **Within a theme**, order content by user impact: headline first, smaller polish after. Within the index, same ordering inside each `####` block.

5. **The release script (`scripts/release.sh`) extracts the `[Unreleased]` body verbatim** into the GitHub Release notes. Eyeball the body before confirming the script's prompt.

6. **No hard wraps in prose.** Each prose paragraph, blockquote lede, and multi-line bullet must be a single source line. Do not break mid-sentence with a `\n`. GitHub Releases renders markdown with the *break-on-newline* GFM variant; every soft `\n` becomes a `<br>` and forces the prose to render narrow on the Releases page (even though it looks flowing on the `github.com` file view). One long line per paragraph keeps both renderings correct. Code fences, headings, blank lines, and the compare-link footer are unaffected.

See [`CLAUDE.md`](CLAUDE.md) §4 for the operator-facing version of these rules.

## Retroactive renumber

At v2.13.0r (formerly v2.21.0) we adopted the NetSec-style versioning rules spelt out in [`README.md`](README.md). Several pre-v2.13 tags had been bumped too liberally — features that should have been patches got minor labels. The renumbering swept through every existing release; the original tag is noted in italics under each section below. The corresponding git tags + GitHub Releases were re-cut at the same commit SHAs.

## [Unreleased]

### Changed

- **`/initiative` Meijer pull-quote replaced** with the longer founder quote on European fragmentation in security studies (EN, FR, DE). Reads as a clearer statement of what EISS was set up to do: overcome the fragmentation of European security studies by federating and consolidating a Europe-wide field. The previous quote, "EISS aims to fill this gap by contributing to the formation of a European community of researchers in security studies", was the closing line of the same Meijer 2017 *Champs de Mars* piece; the new quote opens with the problem framing and lands on the solution. Citation link unchanged.
- **`/initiative` origins section recentred on EISS rather than AEGES** (EN, FR, DE). The two paragraphs previously dwelled on AEGES history (Holeindre's 2015 founding, the CNRS Éditions + Armand Colin book series, the Prix Bastien Irondelle) before pivoting to EISS. Recast to keep AEGES as the founding context in one short sentence, then foreground what EISS has become independently: a Europe-wide network spanning N countries, N+ ESSC editions across the continent, founding member of the NetSec COST Action in 2025. AEGES is acknowledged as a sister organisation; EISS's centre of gravity is now European.

## [2.23.0] · 2026-05-26 — Brand identity and Initiative depth

> This release brings the real EISS brand identity to the site, expands `/initiative` from a thin About into a full founding story, formalises the EISS community on `/board` as a first-class section with auto-expiring intern entries, and imports operator + CI conventions from the sister `netsec.github.io` repo. A careful set of ESSC host-city map projection fixes lands alongside.

### Brand identity rollout

The placeholder "E" gradient tile is retired across every header, every footer, the favicon, the Apple touch icon, the Android adaptive icon, and the PWA manifest. The deployed mark is the constellation + EiSS wordmark from the designer's brand bundle, sized contextually per surface: the desktop header carries the lockup, mobile collapses to the iconmark + a small text label below 600 px, the footer carries the full lockup with tagline as a polished closing sign-off, and the favicon ships as a brand-blue rounded square with a simplified 4-dot constellation (verified legible at 16 / 32 / 180 / 192 / 512). `theme-color` and PWA `background_color` move from the placeholder `#1e6bcb` to the canonical brand `#007bc6` sampled from the master PDF, so the OS chrome around the page matches the rounded-square favicon.

The work shipped in three carved PRs ([#154](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/154) brand assets, [#155](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/155) chrome swap, [#156](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/156) Schema.org logo + `/initiative` hero banner) plus a follow-up size tweak. The Schema.org `Organization.logo` JSON-LD upgrades from a stale Mobirise-era JPEG to the new high-res brand PNG (`logo-full-1024.png`, 1024 × 712, within Google's 1:1-to-4:1 aspect window for Knowledge Panel logos), with explicit width / height and `foundingDate: "2017"` so the Knowledge Panel can disambiguate EISS from other "EISS" acronyms in search results.

### `/initiative` deepened

The about page expands from a thin "what is this" landing into a complete founding story. New blocks: a *"What EISS was founded to do"* card carrying Hugo Meijer's 2017 *Champs de Mars* pull-quote alongside the two founding objectives and a *"Filling a gap"* framing that names the four European IR associations not covering security studies; an ESSC flagship section with a 10-card grid of every annual edition since 2017 (year + ordinal pill, country flag + city, host institution, link to the per-year page where one exists); a research-themes pill row listing the nine permanent thematic sections from the inaugural conference; expanded origins prose naming Jean-Vincent Holeindre (AEGES, Poitiers), the CNRS Éditions + Armand Colin book series, the planned English-language series, and the Prix Bastien Irondelle; a *First conference* facts aside with date, venue, attendance, keynote speaker, and co-organisers.

The page also gets a new ESSC host-city map: an inline SVG of mainland Europe rendered from the [Natural Earth](https://github.com/nvkelso/natural-earth-vector) 110m admin-0 countries dataset, with each host city as an accented dot linked to the per-edition page. The map picked up several fixes during dogfooding, captured in the *ESSC map projection fixes* theme below. NetSec wording is also nuanced across all five touchpoints per locale ([#158](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/158)): EISS was a founding member of NetSec rather than the founder, and much of NetSec's leadership sits within or has long been associated with the EISS community.

### EISS community on `/board`

Former board members, support staff, and past interns now have a dedicated *"EISS community"* section at the bottom of `/board`. The mechanism is an optional `roleEndDate` field on each entry, populated by the Google Form for new interns (Form question 18) and hand-set on the rare board departure. `boardSorted.js` applies a 7-day grace after that date, then moves the entry from the active sections into a `pastMembers` array; the daily-rebuild workflow re-evaluates each build so the transition is automatic, no manual gardening required.

19 past interns from a 2022–2026 internship export landed in this release, with affiliations attached (14 × Sciences Po, 2 × The University of Edinburgh, 1 each × Harvard Kennedy School, Columbia SIPA, College of Europe, Università Cattolica del Sacro Cuore). Each card carries a `· YYYY` active-year suffix. The section sorts most-recent-first, uses compact "directory" tiles (no bio / themes / links rendered, data still in `board.json`), and on mobile drops the photo column entirely (most past members carry only an initials placeholder, which ate ~40 % of the card width at narrow viewports). The `/board` active sections also collapse to a horizontal directory layout at `≤ 36rem`, fixing photos that used to eat 400 px of vertical height per card on a phone.

### NetSec-convention imports

Three convention imports from the sister `netsec.github.io` repo, staged as separate PRs ([#159](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/159) docs foundation, [#160](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/160) roadmap autostamp, [#164](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/164) link checker). The headline import is `CLAUDE.md`, ~270 lines of operator-facing convention read by Claude Code on every session: language rules (British English, no machine translation), PR workflow (auto-merge default with a visual-changes carve-out), the "open an issue for every deferred item" rule with an informal template, the release-notes hybrid format, the four-point release cross-check, voice rules for public copy, the prose-voice rules that disallow em dashes / rule-of-three rhythm / synonym cycling, working-tree hygiene, milestone tagging, and documentation currency.

`SECURITY.md` upgrades from an 84-byte stub to a full disclosure policy (scope, private channels, SLAs, safe harbour). The `CHANGELOG.md` preamble gains the hybrid release-notes shape spec and six numbered rules including the critical "no hard wraps in prose" rule. A new `sync-roadmap.py` script + `.github/workflows/sync-roadmap.yml` keep the `[Unreleased]` count + freshness stamp on `docs/roadmap-2026.md` refreshed automatically; the current autostamp reports 35 entries in `[Unreleased]` between v2.22.0 and v2.23.0, broken down as 16 Added, 9 Changed, 10 Fixed. A new `check-links.sh` + `link-check.yml` walks `_site/**/*.html` on every PR + Monday cron, advisory until [#162](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/162) clears the pre-existing untranslated-page link breakage. And `sync-board.yml` now auto-assigns the maintainer on every PR it opens, hooking GitHub's standard PR-assignee notification into the bios-sync flow.

### ESSC map projection fixes

The host-city map shipped in v2.22.0 used a naïve Plate-Carrée projection (`lat[35,71]→y[700,0]`, `lon[-12,32]→x[0,1000]`) with no cos(latitude) correction. At central latitude 50°N this stretched the map horizontally by ~1.82×, making Europe look visibly squat. The fix wraps the outline `<g>` in `transform="scale(1, 1.82)"` and pre-multiplies all dot `cy` + label `y` values, preserving the existing Natural Earth path data; CSS aspect-ratio updates to `1000 / 1274` (≈ 0.785 W/H, matching Europe's real geographic ratio).

Three smaller fixes landed in the same window: dark-mode rules now honour the explicit theme toggle (was `@media (prefers-color-scheme: dark)` only, which ignored the sun-icon override), city labels no longer overlap year sublabels at narrow viewports (font-size moved from CSS pixels to SVG attributes so it scales with viewBox alongside the offset), and mobile dot radii bumped from r=9–14 to r=16–20 with thicker strokes so each dot is a tappable target at the ~0.34× viewBox scale of a 360 px viewport.

### Index of changes

#### Added

- **`scripts/check-links.sh` + `.github/workflows/link-check.yml` (Import PR 3 of 3-4)**, a broken-link checker adapted from the sister repo [`netsec.github.io`](https://github.com/EISSeuropa/netsec.github.io). Walks every `*.html` under the built `_site/`, collects internal `<a href>` targets (verified by filesystem lookup, with `id=` / `name=` anchor checks) and external targets (verified by HEAD with a GET fallback for hosts that 403/405 on HEAD), and reports broken links with file-and-target context. Runs on every PR that touches build-affecting files plus a weekly Monday 07:00 UTC cron, so external link rot (academic and COST URLs sometimes shuffle) is caught within a week rather than weeks later. Status: advisory (`continue-on-error: true`) until the pre-existing untranslated-page nav-synthesis breakage is resolved ([#162](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/162)); the headline value during the advisory window is the weekly external-rot detection. Adapted from NetSec on two axes: needs an Eleventy build step before walking `_site/` (NetSec walks repo-root HTML directly); cron sequenced at 07:00 UTC Monday to avoid colliding with the 06:00 sync-roadmap autostamp.
- **`scripts/sync-roadmap.py` + `.github/workflows/sync-roadmap.yml` (Import PR 2 of 3-4)**, a roadmap autostamp pattern adapted from the sister repo [`netsec.github.io`](https://github.com/EISSeuropa/netsec.github.io). A machine-managed `<!-- AUTOSTAMP:BEGIN -->` block near the top of `docs/roadmap-2026.md` is now refreshed automatically: the script counts bullets in `CHANGELOG.md`'s `[Unreleased]` section by Keep-a-Changelog category (Added / Changed / Fixed and the rest), looks up the most recent SemVer tag, and rewrites the block with a freshness-stamped breakdown. The workflow fires on every push to `master` that touches `CHANGELOG.md`, plus a weekly Monday 06:00 UTC belt-and-braces run, and opens an auto-PR on `roadmap-sync/auto` with auto-merge armed. Prose timeline rows below the autostamp stay maintainer-written; the count surfaces staleness without claiming to resynthesise the narrative (that lands in the release-time §5 cross-check). Adapted from NetSec on two axes: EISS's `[Unreleased]` uses `### Added` at three-hash depth rather than NetSec's four-hash nested inside an Index block, so the parser was retuned; and the workflow targets `master` rather than `main`, sequenced after the existing daily sync-indico (03:45) + scheduled-rebuild (04:15) crons.
- **`CLAUDE.md` at repo root**, ~270 lines of operator-facing convention adapted from the sister repo [`netsec.github.io`](https://github.com/EISSeuropa/netsec.github.io)'s `CLAUDE.md`. Codifies eleven numbered rule sections: language (British English, no machine translation), PR workflow (auto-merge default, visual carve-out, squash), the "open an issue for every deferred item" rule with informal template, release-notes hybrid format, the four-point release cross-check (roadmap, sitemap, translations, repo docs + the milestone hygiene gate), public-copy voice (no developer jargon, show-don't-tell), prose voice (no em dashes, no rule-of-three rhythm, no synonym cycling), working-tree hygiene, accessibility + i18n cadence, milestone tagging (every issue carries one of the five thematic milestones), and documentation currency. Adapted where the EISS convention diverges from NetSec's: thematic milestones rather than per-release version milestones; `master` branch rather than `main`; no Wiki or stakeholder PDF; sync-board + sync-indico data pipelines rather than sync-cost + sync-bios. Future Claude sessions read this on every invocation, so the conventions survive context-window expiry.
- **`/initiative` hero brand banner (PR C of 3)** — the full EISS lockup (constellation + EiSS wordmark + "The European Initiative for Security Studies" tagline) renders above the eyebrow on the about page in all three locales, sized for a one-line tagline on desktop and graceful wrap on mobile. Acts as a visual statement of identity right where new visitors land. Left-aligned to flow with the existing eyebrow + H1 + page-lead stack rather than competing with them; `aria-hidden` because the H1 already names the section. Uses the same `inlineSvg` shortcode added in PR B so the wordmark's `currentColor` cascades from the `.initiative-hero-brand { color: #007bc6 }` rule.
- **EISS brand-logo assets** in a new `src/assets/images/brand/` directory — three SVG variants (`logo-mark` = constellation only; `logo-lockup` = constellation + EiSS wordmark; `logo-full` = everything incl. the tagline) plus two PNG rasters (`logo-full-1024.png` for the Schema.org Organization logo URL + future OG-card overlays, `logo-lockup-512.png` for any header context that can't use SVG). Each SVG uses `fill="currentColor"` on the wordmark/tagline paths and a literal `#73caff` on the constellation, so the parent stylesheet can recolour per surface (header / footer / dark mode) without forking the file. The variants are derived from the canonical RGB PDF in the brand bundle by a new reproducible script (`scripts/derive-logo-variants.py`, ~200 lines of Python, only requires `pip install pymupdf`). `src/assets/images/brand/BRAND.md` documents the variants, colour palette, recolouring patterns, accessibility notes, and what's deliberately NOT in the repo (the source AI / TIF / CMYK print variants). **No visible change yet** — this PR is asset-only; site chrome still uses the placeholder "E" mark. PR B (chrome swap) and PR C (Schema.org + `/initiative` hero) follow.
- **EISS community: 19 past interns backfilled** from a 2022–2026 internship-dates export. Each entry adds a name + `roleEndDate` to `board.json` `support[]`. Affiliations: 14 × Sciences Po (France), 2 × The University of Edinburgh (United Kingdom), 1 × Harvard Kennedy School (United States), 1 × Columbia SIPA (United States), 1 × College of Europe (Belgium), 1 × Università Cattolica del Sacro Cuore (Italy). Roster: Kim Hirsch-Hoffmann, Yiqi Yu, Francisco Ferreira, Camilo Torres Casanova, Ulysse Richard, Robin Staes-Polet, Giulia Bretel De Simone, Haoyu Wang (2023); Eva Castelletti, Federico Pirino (2024); Teresa Marzo, Trinabh Banerjee, Gillian Gonnord, Raaghavi Tandon, Adam Gajdosik (2025); Shirley Tian, Ali Gohar, Lise Mai, James Roughan (2026).
- **`person.activeYear`** field on past members — `boardSorted.js` derives the year-of-`roleEndDate` and attaches it only to the `pastMembers` array. Renders inline on the community card's role line as a quiet `· YYYY` suffix indicating when the person was active with EISS. Per spec: when an internship spans two calendar years, the year is the most recent one (i.e. the year of the end date). Active section cards never show the badge (the field is template-conditional and never set on the active arrays).
- **Auto-expiring intern cards** — a new optional `roleEndDate` field on each board entry, populated from Form question 18 *"Internship end date (optional)"* (Date type). `src/_data/boardSorted.js` applies a **7-day grace** after that date, then moves the entry from the active sections into a new `pastMembers` array. The daily-rebuild workflow re-evaluates each build so the transition is automatic, no manual gardening required. Board Members + Leadership have elected ~3-year terms and aren't expected to fill the field — their ins and outs are tracked by hand-editing `board.json` from election minutes. The internal field key stays generic (`roleEndDate`) so we can also hand-set it on a former Board Member's entry to move them into the past-members footer without a second mechanism. (#126)
- **"EISS community" section on `/board`** — visible section (was a folded `<details>` footer; promoted to first-class section per user feedback) rendering everyone whose `roleEndDate` has passed by more than the 7-day grace: former board members + support staff + interns. Uses `people-grid--compact` for denser tile packing, so the section reads as a quieter register rather than competing with the active team. Title shows a count chip. Copy in EN / FR / DE: *"People who have shaped EISS over the years — former board members, support staff, and interns. They remain part of our wider European security studies network."* The section was originally titled *"EISS community alumni"* but renamed because *alumni* reads as a student-only label and former board members aren't students; the rebrand is visible-copy-only (internal `community-alumni-*` CSS class names retained for diff stability). The mechanism is shared across all three categories — interns arrive automatically via the Form pipeline from #126; board + support entries get `roleEndDate` set by hand-editing `board.json` when the user reports a departure (operator workflow documented in `memory/user_preferences.md`). (#126, #140, #146)
- **Date-shape tolerance in `scripts/sync-board.py`** — accepts `YYYY-MM-DD` (Forms default), `DD/MM/YYYY`, `DD.MM.YYYY`, `YYYY/MM/DD`, and `MM/DD/YYYY`; normalises everything to ISO. Unparseable values log a warning and leave the entry permanent (no silent expiry on garbage input). (#126)
- **`/initiative` — founder pull-quote, two founding objectives, and "Filling a gap" framing** in a new *"What EISS was founded to do"* card that replaces the generic *"How we work"* block. Quote attribution links to Meijer's 2017 *Champs de Mars* article on Cairn — the page now signposts its own founding document.
- **`/initiative` — research-themes pill grid** listing the nine permanent thematic sections from the 2017 inaugural conference. Renders as a wrapped row of accented pills below NetSec. Localised EN / FR / DE.
- **`/initiative` — *First conference* facts aside** on the *How EISS started* section: a side card with the 13–14 January 2017 date, Panthéon-Assas venue, attendance figures, Sir Hew Strachan keynote, AEGES · Centre Thucydide · CERSA co-organisers, and a footer citation to the Cairn article.
- **`/initiative` — expanded origins prose** names Jean-Vincent Holeindre (AEGES president, Univ. Poitiers), the CNRS Éditions + Armand Colin book series, the planned English-language series, and the **Prix Bastien Irondelle** PhD thesis prize. Adds *legal scholars / juristes* to the multidisciplinary list.
- **`.theme-pills` + `.origin-layout` + `.inaugural-facts` styles** in `src/assets/css/site.css` — pill row, two-column prose-plus-aside grid that collapses on narrow viewports, and a compact two-column definition list for the facts aside.
- **`/initiative` — ESSC flagship section** — new *"ESSC — The European Security Studies Conference"* block above NetSec, framing the Annual Conference as the flagship event and explaining the rotating-host convention. Renders a 10-card grid covering every edition from the 2017 inaugural at Panthéon-Assas through the 2026 Stockholm gathering, each card carrying year + ordinal pill, country flag + city, host institution, and a link to the per-year page where one exists. The 2017 card is accented as the founding edition; the 2020 online (COVID) edition is muted.
- **`src/_data/netsec.js`** — small data file holding NetSec headline stats (Management Committee size, MC country count, founding-partner count, as-of date). Single source of truth so future bumps are one-file edits.
- **`.conf-tour` + `.stats-row--inset` styles** in `src/assets/css/site.css` — wrapping card grid for the ESSC edition tiles + a quieter `.stats-row` variant used inline inside the NetSec card.
- **ESSC host-city map on `/initiative`** — inline SVG of a stylized Europe outline (mainland + UK + Ireland, hand-drawn at ~25 path points to keep the asset under 5 KB instead of using a 400+ KB Wikimedia blank-Europe SVG). Each host city renders as an accented dot inside a `<g>` linked to the per-edition page, with `<text>` labels above the dot (city) + below (year). 2017 Paris cluster is a single dot covering 2017/2018/2019 per the design call; 2020 online edition is acknowledged in the figcaption rather than placed on the map; 2026 Stockholm uses a "next" accent variant to flag it as upcoming. Wrapped in a glass-card `<figure>` consistent with the rest of the page. Localised EN / FR / DE. Closes #131. (#131)
- **`.essc-map` + `.essc-map-*` styles** in `src/assets/css/site.css` — outline path styling (soft-accent fill + border stroke, both light + dark mode), three dot variants (default / inaugural / next), hover-and-focus lift, label typography in viewBox units, narrow-viewport rule that hides the SVG text labels so the conf-tour grid below carries the names.

#### Changed

- **NetSec relationship wording nuanced across `/initiative` (EN / FR / DE)** ([#158](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/158)). The page previously read as though EISS founded NetSec; in reality EISS was one of twelve founding members of the COST Action, and much of NetSec's leadership comes from (or has long been associated with) the EISS community. Five touchpoints per locale updated: page meta description, page lead, the NetSec tile in the "EISS at a glance" grid, the NetSec section lead, and the origins prose. The "EISS is centrally involved in NetSec" signal is preserved.
- **`sync-board.yml` auto-assigns the maintainer on every PR it opens**, so each new bios-sync run fires GitHub's standard PR-assignee notification (email + mobile push via the GitHub app, per the user's global notification preferences) without any webhook or third-party integration. The same notification fires on follow-up commits to the existing `board-sync/auto` branch, so multi-submission sync runs stay visible. The other auto-PR workflow (`sync-roadmap.yml`) deliberately keeps no assignee, since it auto-merges and the maintainer doesn't need to look at it.
- **`SECURITY.md` rewritten from an 84-byte stub to a full security policy** adapted from the sister repo `netsec.github.io`'s template, ~110 lines covering scope (in-scope vs out-of-scope, listed third-party vendors with their own reporting URLs), the private-disclosure channels (GitHub Security Advisories preferred, email fallback), expected acknowledgement and resolution SLAs by severity, safe-harbour terms for good-faith researchers, and a list of the security hygiene the repo already maintains (pinned dependencies, no production secrets in-repo, least-privilege Actions, no tracking pixels).
- **`CHANGELOG.md` preamble expanded** with the full hybrid release-notes shape (template + six rules), so the format is documented in the same file that uses it rather than only in `README.md` and `CLAUDE.md`. The new rules cover one-Index-per-release, write-themes-at-release-time-not-PR-time, self-policing patch vs minor tier, content ordering by user impact, the release-script verbatim extraction guarantee, and the critical "no hard wraps in prose" rule (every soft `
` becomes a `<br>` in GitHub Releases). Links to `CLAUDE.md` §4 for the operator-facing version.
- **Schema.org `Organization` `logo` upgraded from a stale Mobirise-era JPEG to the new high-res brand PNG (PR C of 3)** — the JSON-LD in `base.njk` head now points at `/assets/images/brand/logo-full-1024.png` (1024×712, ≈1.44:1 aspect — within Google's required 1:1-to-4:1 range for Knowledge Panel logos) and uses an `ImageObject` with explicit `width` / `height` so Google's parser can size it without an extra fetch. Also adds `foundingDate: "2017"` to tie the org to the inaugural Panthéon-Assas conference — helps disambiguate from other "EISS" acronyms in the Knowledge Panel and surfaces the founding year on rich-results cards.
- **EISS logo replaces the placeholder "E" mark across site chrome (PR B of 3)** — every header, every footer, the favicon, the Apple touch icon, the Android adaptive icon, and the PWA manifest theme colour now use the real brand identity from `src/assets/images/brand/` (shipped in PR A). The header inlines the constellation + EiSS wordmark lockup on desktop and collapses to just the iconmark + a small text label below 600 px (the breakpoint where the nav's lang switcher + menu button start crowding the brand). The footer carries the full lockup including the tagline as a polished closing sign-off. The favicon is a brand-blue rounded square containing a simplified 4-dot constellation (the full 7-dot constellation is illegible at 16-32 px; this captures the network metaphor with strokes thick enough to survive downscaling — verified at 16 / 32 / 180 / 192 / 512). `theme-color` and PWA `background_color` switch from `#1e6bcb` to the canonical brand `#007bc6`, sampled from the master PDF in the brand bundle. A new `inlineSvg` Eleventy shortcode reads the SVG bytes at build time so the inlined markup picks up cascading `color:` from the parent — that's how the wordmark's `currentColor` fills resolve to brand blue (set on `.brand-logo`) without forking the SVG per surface. Maintains brand blue in both light + dark modes per the agreed identity rule.
- **`scripts/derive-logo-variants.py`: unique title/desc IDs per variant** (`t-mark/d-mark`, `t-lockup/d-lockup`, `t-full/d-full`) so the lockup + iconmark can be inlined on the same page (as `nav.njk` does for desktop/mobile responsive swap) without producing duplicate HTML IDs in the rendered page.
- **EISS community section now sorted most-recent-first** instead of alphabetically. `boardSorted.js` sorts `pastMembers` by `roleEndDate` descending (with surname as a tie-breaker). The 2026 cohort lands at the top, 2023's at the bottom — newcomers see who left recently rather than scrolling alphabetically through a roster.
- **EISS community cards trimmed to compact "directory" tiles** — the section was reading too heavy because each card carried a full bio, themes, and social-link icons. Hidden bio / themes / links inside `.community-alumni` via `display: none` (data still in `board.json`, just not rendered here). Photo aspect dropped from 4:5 portrait to 1:1 square, grid column min-width tightened from 16 rem to 11 rem (~5 cards per row at desktop vs ~3.5), body padding tightened. At-a-glance recognition is the goal: photo + role + name + position + institution.
- **`/initiative` map outline now reads as a real map of Europe** — the hand-drawn ~25-point blob from #132 was flagged as under-defined on review. Swapped for path data projected from the [Natural Earth](https://github.com/nvkelso/natural-earth-vector) 110m admin-0 countries dataset (CC0, public domain). Each of 36 European countries gets its own `<path>` with the canonical lat/lon coastline + border data projected into the existing 1000×700 viewBox; partial lives at `src/_includes/europe-outline.njk` (~18 KB inline) so the geometry isn't duplicated across the three locale files. Dot positions, glass-card frame, hover behaviour, and narrow-viewport handling unchanged. Figcaptions in all three locales credit Natural Earth.
- **ESSC map polish — vertical room, light-mode contrast, mobile tap targets**: the `.essc-map` block drops its `max-height: 28rem` clip (which was vertically compressing the SVG on laptop viewports) for an `aspect-ratio: 10/7` rule that lets the SVG fill its natural ratio. Country polygons get a slightly stronger fill so borders read in light mode. City labels gain a `paint-order: stroke fill` halo (matched to the surface token in light mode, near-background in dark) so text stays readable when it crosses a country fill. Mobile (`<38rem`) bumps dot radii from r=9–14 to r=16–20 with a thicker stroke so each dot is a tappable target even at viewBox scale ~0.34.
- **ESSC map — light mode now actually readable**: the #134 halo used `var(--surface)` which is 72%-opaque white in light mode, letting 28% of the country fill bleed through the text halo and making the labels look fuzzy. Switched the label + dot strokes to fully-opaque white in light mode (with a new dark-mode override that keeps the near-black halo + dark dot stroke unchanged from #134). Country fill also dropped from `hsl(216 60% 88%)` to a near-neutral `hsl(216 30% 94%)` so the dark text and saturated dots register as clearly distinct foreground elements. Dark mode unchanged from #134.
- **`/initiative` polish — laptop map size, mobile city labels, NetSec card buttons**: three follow-up fixes after dogfooding the page on a MacBook Pro + iPhone. (1) The map was filling the full container width on laptop (~717 px tall at 1024 px container × 10/7), dominating the viewport — added `max-width: 48rem` on `.essc-map-figure` so the map sits at a more comfortable ~768 × 538 on wider screens. (2) Mobile labels were hidden via `display: none` at `<38rem`, which left dots without context — switched to keeping labels visible at beefier viewBox sizes (font-size 38/30 vs 22/17) so they render legibly at the ~0.34× viewBox scale of a 360 px viewport. Dark-mode dot ring is back to opaque white in dark mode too so each dot has a clear edge against the dark country fill. (3) New `.btn-row` class for the NetSec card's button row (was bare `<p>` with inline margin-left, which wrapped the second button awkwardly on narrow viewports); flex + wrap + gap handles narrow layouts cleanly.
- **`/initiative` — NetSec block reframed as *"Our wider network"*** — the standalone *Our network* section (which only counted the EISS board) is removed; its content moves into the NetSec card alongside a new inset stats row showing **49 MC members across 30 countries** plus the founding-partner count, pulled from `src/_data/netsec.js`. Copy makes the point that the network EISS convenes runs far beyond its own board. EISS leadership strip still renders inside the card; the standalone country-flag strip (which only counted EISS board countries, inconsistent with the wider-network framing) is dropped.
- **`boardSorted.counts.peopleTotal` / `countriesTotal` now count active members only** — past members no longer show up in the `/initiative` stats row, so the **N people across M countries** headline reflects the present team rather than the cumulative roster. `counts.pastTotal` exposes the alumni count for any future template that wants it. (#126)
- **`/board` mobile cards collapse to a horizontal "directory" layout** at `≤ 36 rem` viewports (≈ 576 px). Inspired by the NetSec member directory: photo shrinks to a 96 px square column on the left of each card, body content flows in the remaining space on the right. Photos no longer eat 400 px of vertical height per card on a phone (was ~700 px per card; now ~150 px). Applies to both the active sections and the *EISS community alumni* footer since they share `.person`. Position + institution lines truncate to one line each with `text-overflow: ellipsis` to stop long institution names breaking the layout; hover-lift transform is dropped at this breakpoint (jarring on touch). Desktop layout untouched.

#### Fixed

- **`sync-board.yml` auto-assigns the maintainer on the PR it opens**, so each new bios-sync run fires GitHub's standard PR-assignee notification (email + mobile push, per global notification prefs) without any webhook or third-party integration. Same notification fires on follow-up commits to the existing `board-sync/auto` branch. The other auto-PR workflow (`sync-roadmap.yml`) deliberately doesn't assign, since it auto-merges and adds nothing the maintainer needs to look at.
- **EISS community cards drop the photo column on mobile** at the `≤ 36rem` breakpoint. The previous layout (96 px square photo column to the left, body text to the right) read fine when each card carried a real headshot, but most community-section cards carry only an initials placeholder rather than an upload; at narrow widths the placeholder column ate ~40 % of the card while the text wrapped awkwardly into the remaining ~55 %. Now mobile community cards render as single-column text only (role line + active year, name, institution), giving each card a compact and readable shape. The image elements stay in the DOM with their existing `aria-hidden` so screen-reader behaviour is unchanged; only the visible photo / placeholder hides. Active sections (Leadership / Board Members / Support Staff) keep their photos at this breakpoint, since those entries almost always carry a real headshot.
- **ESSC map no longer compressed vertically** — the existing `1000 × 700` viewBox came from a naïve Plate-Carrée projection (`lat[35,71]→y[700,0]`, `lon[-12,32]→x[0,1000]`) with no cos(latitude) correction. At central latitude 50°N the actual geographic ratio of this slice of Europe is ~0.785 W/H, but the viewBox displayed it at 1.43 W/H — a horizontal stretch of ~1.82×, or equivalently a vertical compression of the same factor. Fix preserves the existing path data (avoiding a full re-projection) by wrapping the outline `<g>` in `transform="scale(1, 1.82)"` and bumping all dot `cy` + label `y` values by 1.82 into the new `1000 × 1274` viewBox. CSS aspect-ratio updated to match, and `.essc-map-figure` `max-width` tightened from `48rem` to `40rem` so the now-taller map doesn't dominate the page (~640 × 815 on a desktop — taller than the old 768 × 538, narrower to give each city dot some breathing room). Verified with Berlin (52.52°N, 13.40°E) coordinates round-tripping through the formulas to confirm the projection model.
- **ESSC map honours the site's theme toggle** — the dark-mode rules for `.essc-map-outline`, `.essc-map-label`, and `.essc-map-years` used only `@media (prefers-color-scheme: dark)`, so a user whose OS prefers dark mode but who clicked the sun icon to force the site to light mode still saw a dark map (dark country fills, dark text halo) while the rest of the page rendered light. Refactored each block to the same pattern the design tokens already use: a `[data-theme="dark"]` selector AND a `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) … }` selector — so the explicit toggle wins when both apply. Two duplicate dark-mode halo blocks (different `hsl` values) consolidated to one. Same fix applied to `.person-photo-placeholder` which had the same bug.
- **`/board` mobile photo no longer stretches / zooms when a bio expands** — the #144 mobile layout used `align-items: stretch` on the new `.person` grid, so the photo column took the card's full height; with `object-fit: cover` and `height: 100%`, expanding a long bio grew the card and cropped more of the head as the card got taller. Switched to `align-items: start` + explicit `height: 96px` so the photo pins to the top-left of the card at a fixed 96 × 96 regardless of how tall the body gets. Bottom-left corner radius dropped (photo no longer reaches the card's bottom-left edge).
- **`sync-board.yml` was an invalid workflow file** since PR #107 (2026-05-24) — line 106 was `title: ${{ steps.sync.outputs.title || 'data: sync board bios from Google Form' }}` without enclosing quotes, and the colon inside the fallback string made the YAML parser treat it as a mapping separator. Every push to `master` since then triggered a workflow-validation failure (68 failed runs by the time it was spotted), and GitHub hid the **Run workflow** button on the Actions page, leaving the board-bios sync un-triggerable from the UI. Wrapped the `${{ … }}` expression in double quotes so YAML reads the whole thing as a single scalar; added an inline comment explaining the why.
- **ESSC map labels no longer overlap with year sublabels** at narrow-to-medium viewports. Cause: city / year text sizes were set in CSS pixels (fixed regardless of SVG scale) but the vertical offset between them was 20 viewBox units (which shrink when the SVG renders smaller). Below ~700 px wide, the 20-unit offset collapsed to ~13 px while the city text stayed at 22 px — guaranteed overlap. Fix: move `font-size` from CSS to SVG attributes (`font-size="26"` for city, `font-size="20"` for year), so text scales with the viewBox alongside the offset. Bumped the city↔year y-gap from 20 → 32 user-space units for extra clearance. Paris cluster sublabel shortened from `2017 · 2018 · 2019` to `2017 – 2019` (en-dash range) to give the long Paris label less horizontal weight.
- **Role-label aliases in the bios pipeline** — `scripts/board-source.json` now supports an optional `aliases` array on each role entry, and `scripts/sync-board.py` checks both canonical labels and aliases when looking up which role a Form submission picked. Cosmetic Form edits ("Support Staff" → "Support Staff (incl. intern)") no longer cause the script to fall back to `Board Member` and misclassify the entry. The canonical role label (`Support Staff`) is still what gets stored in `board.json`, so cards render the clean label regardless of which alias the Form used.
- **`functionalResponsibility: "None"` no longer renders a meaningless pill** — `scripts/sync-board.py` now drops the field at sync time when the Form value is one of the null sentinels (`None`, `(None — leave blank)`, `n/a`, empty, case-insensitive). The card layer was already skipping the pill when the field was absent; this fix prevents the literal string `"None"` from sneaking through as a stored value.
- **Photo placeholder for members without a headshot** — when `photo` and `photoOverride` are both empty, the card renders a gradient-tinted box with the member's initials (computed from name, with honorifics stripped via `boardSorted.js`) instead of a broken-image icon. Same `aspect-ratio: 4/5` as the `<img>` so the card layout doesn't shift. Dark-mode override included.
- **Angela Sajewicz's board.json entry corrected** — moved from `members[]` to `support[]`, role set to canonical `Support Staff`, dropped the `functionalResponsibility: "None"` field. The pipeline fixes above prevent the same misclassification on the next sync.
- **`scripts/release.sh` compare-link regex** now accepts letters and dashes after the dotted numerics, so `v2.13.0r` and any future suffixed tags update cleanly. Previous regex `v([0-9.]+)` silently failed to bind on `v2.13.0r`, leaving `[Unreleased]: …/compare/v2.13.0r...HEAD` stale across v2.22.0. Same PR repoints the live compare link at v2.22.0. (#121)

## [2.22.0] · 2026-05-24 — Live board pipeline and Initiative refresh

> The Google Form board pipeline goes live, the `/board` page is rebuilt around it, and `/initiative` is redesigned to read as concrete activities + numbers + people. Same scope-cycle also tightens the programme grid (per-slot rooms, Google Maps embed) and the sync workflow itself (descriptive PR titles, honest reporting, country flags).

### Live board pipeline

`scripts/sync-board.py` is now wired to the production Google Form (18 questions, five-role table, social-link URLs, country, public email, functional responsibility). A first-token + last-token identity key replaces the strict-slug dedup, collapsing middle-initial drift, honorific changes, and same-person-different-Google-account submissions. The Google Form's *Limit to 1 response* is off + *Collect email addresses* is Verified, so members re-submit when they want to change their photo — the documented workaround for the Forms file-upload edit limitation. A `photoOverride` field on board entries lets the operator hand-set a headshot path that survives every future sync.

Auto-PR titles are situation-specific (`data: refresh headshot for Dr Arthur Laudrain`, `data: add Dr Jane Doe to the board`, `data: sync board bios (5 changes)`); bodies group changes by type — New members · Updated members · Removed members · Headshot files updated — with field-level diffs. The script's "No substantive changes" guard now considers photo-file diffs on disk, not just `board.json`, so photo-only updates are reported honestly.

### Board page rebuilt

`/board` is split into three sections (Leadership · Board Members · Support Staff) using the existing `tier` field. Same card size across all sections; hierarchy comes from headings, not card sizing. Each card carries a bio teaser with CSS `line-clamp: 3` + a JS Read-more toggle (full bio renders as one continuous paragraph — no sentence-cut by the button). A quiet `functionalResponsibility` pill sits beside the primary role; an amber 🎤 marks anyone chairing or speaking at the live ESSC edition. Affiliation now splits into `position` + `institution` rendered on two lines, with a round circle-flag SVG glued inline to the institution (35 flags shipped, mapped via a new `src/_data/countryFlags.js`). A muted "Update your bio" footer link nudges members toward self-service.

### `/initiative` redesigned

The page now opens with a stats row (**10 · 22 · 12 · 1** — conferences / people / countries / COST Action), then four activity tiles (ESSC, NetSec, Summer School + Training, Surveys + Workshops), then a "Our network" strip showing leadership headshots inline with country flags, then "How EISS started" with the 2017 AEGES origin paragraph, then a compact CTA strip (Become member · Newsletter · Get in touch). Replaces the previous restatements of "multidisciplinary inclusive network" with concrete activities + numbers + people.

### Programme grid + workflow polish

The programme grid carries colour-coded room pills (blue / purple / amber for the three rooms at ESSC 2026), assigned in frequency-descending order and stable across parallel rows so a given room always lands in the same column. Coffee breaks and lunches now show their Indico room (previously dropped). `/2026` venue section embeds a Google Map inside a frosted-glass 16:9 card (disclosed in `/policy` §5). Together with the sync-script honesty fix above, the workflow now produces release-quality auto-PRs.

### Index of changes

#### Added

- **`/board` modernised** — three sections (Leadership, Board Members, Support Staff) split from the previous flat 19-card grid using the existing `tier` field on `scripts/board-source.json`. Same card size across all sections; visual hierarchy comes from the section headings, not card sizing. Each section's cards sort by tier then surname. The new `src/_data/boardSorted.js` is a pure-derived view: `board.json` (the Form-pipeline contract) and `scripts/board-source.json` stay untouched. (#86)
- **ESSC-speaker mic icon** on board cards — a small amber 🎤 appears next to the role on any card whose person is chairing, discussing, or speaking at the live ESSC edition. Matched at build time between `board.json` and `indico.json` programme data via a "first-token + last-token" identity key (handles "Dr Arthur PB Laudrain" matching "Arthur Laudrain"). Styled CSS tooltip on hover/focus reads "Chairing or speaking at the current ESSC". (#86, #92, #103)
- **`functionalResponsibility` field** on board members — renders as a quiet pill alongside the primary role (`BOARD MEMBER · Technology Coordinator`). Frosted bg, 999px radius, neutral hue so it doesn't fight the accent-coloured role. (#88, #89)
- **Bio teaser + Read-more expander** on every board card. CSS `line-clamp: 3` truncates the bio visually; a JS toggle (~10 lines in `theme.js`) removes the clamp on click. Full bio always renders as one continuous paragraph — no sentence-cut by the button. Build-time gating via `boardSorted.js` `bioIsLong` so short bios skip the toggle. (#89, #92, #99)
- **Country backfill** — every existing board entry now has a `country` field, inferred from the primary institution name (Sciences Po → France, Leiden → Netherlands, etc.). 22/22 entries covered. (#110)
- **Form-pipeline backend** for `scripts/sync-board.py` — matched to the live Google Form's 18 questions (renamed columns, added Country, Public email, Functional responsibility, Working-group involvement, social-link URLs). Five-role table (Founding Director / Treasurer / Secretary-General / Board Member / Support Staff); the old coordinator titles moved into a separate `functional_responsibilities` list. Social URLs nested under `links: {}`. (#89)
- **Identity-key dedup hardening** in `scripts/sync-board.py` — a first-token-plus-last-token identity key replaces the strict slug as the primary dedup mechanism. Collapses middle-initial drift (`Arthur PB Laudrain` ↔ `Arthur Laudrain`), case-insensitive honorific changes (`Dr` ↔ `Prof` ↔ `Lt Gen`), and same-person-different-Google-account submissions. Honorific regex covers `Dr / Prof / Pr / Mr / Ms / Mrs / Mx / Lic / Lt Gen / Lieutenant General / General / Colonel / Admiral`. Logs a `~ collapsed` warning when a near-match assumption is made. Verified against 16 drift cases (was 6/14 failing). (#89)
- **`photoOverride` field** on board entries — operator can hand-set a headshot path that survives every future Form sync. Documented workaround for the Google Forms file-upload limitation (members can't replace a file when editing). Template prefers `photoOverride` > `photo`; the sync never touches the field. (#100)
- **"Update your bio" footer link** at the bottom of `/board`, pointing to the live Google Form. Quiet typography — muted text, dotted underline, accent on hover — so it nudges members toward self-service without reading as a CTA. URL sourced from `scripts/board-source.json` `form_url`. Localised EN / FR / DE. (#89)
- **Optional country line, social-link icon row, ORCID / Bluesky / Mastodon brand glyphs** — all gated on field presence so they appear automatically when Form data arrives. (#89)
- **Descriptive auto-PR titles + rich Markdown body** for the sync workflow. Titles are situation-specific (`data: refresh headshot for Dr Arthur Laudrain`, `data: add Dr Jane Doe to the board`, `data: sync board bios (5 changes)`). Bodies group changes by type — New members · Updated members · Removed members · Headshot files updated — with field-level diffs for each entry. (#107, #108)
- **Country flag SVGs** — 35 round circle-flag SVGs (from HatScripts/circle-flags, MIT) shipped in `src/assets/images/flags/` covering EU + UK + US + Switzerland + Norway + Iceland + likely-non-EU candidates. New `src/_data/countryFlags.js` maps lowercased country names → ISO codes (with aliases for common variants). (#109)
- **Country flags + leadership-faces strip on `/initiative`** — new "Our network" section shows 3 leadership headshots inline + 12 country flags as a row. Data-driven from `boardSorted.countries` + `boardSorted.leadership`. (#113)
- **Hero stats row + 4-tile "What we do" + origin paragraph on `/initiative`** — page now opens with **10 · 22 · 12 · 1** (conferences / people / countries / COST Action), then four activity tiles (ESSC, NetSec, Summer School + Training, Surveys + Workshops), then "How EISS started" with the 2017 AEGES origin. Replaces the old two-fold-aims abstraction + the redundant "Our ambition" bullet list. (#113)

#### Changed

- **Arthur and John moved from Support Team to Board** — their old Technology / Events Coordinator titles become `functionalResponsibility`. Eugenio remains in Support Staff (now with `role: "Support Staff"` + `functionalResponsibility: "Communications Coordinator"`). (#88)
- **`Support Team` → `Support Staff`** (EN), `Équipe de soutien → Personnel de soutien` (FR), `Unterstützungsteam → Support-Personal` (DE). (#88)
- **Programme room badges** unified — every slot's room renders as a colour-coded pill (blue / purple / amber for the three rooms at ESSC 2026), assigned in frequency-descending order at sync time. Parallel-row column sort uses the same index so a given room always lands in the same column row-to-row. Indico is now the single source of truth for room strings. (#83, #84, #85)
- **Google Maps embed on `/2026`** — venue section now embeds a Google Map inside a frosted-glass 16:9 card. Loads on page view (not click-to-load) — the `/policy` §3 no-social-widgets stance is preserved because Maps isn't a social-media widget. `/policy` §5 discloses Maps as a third-party embed (EN / FR / DE). Hidden in print. Reusable for any future `/YYYY` via a `mapEmbed` field on `conferences.js`. (#77, #78)
- **Per-slot room display in the programme grid** — coffee breaks and lunches now show their Indico room (previously dropped); rooms split per slot with a colour pill. Localised EN / FR / DE. (#79, #80)
- **Bio Read-more mechanism** rewritten — old design rendered teaser + button + rest as separate paragraphs, which made the prose read as one sentence cut by a button. Now: single paragraph + CSS line-clamp + JS toggle. No more visible sentence break. (#99)
- **Country text replaced by a round flag icon** on board cards. Country name lives in `alt` + `title` for screen readers and hover tooltips. Falls back to a labelled `📍 Country` line when no flag SVG is mapped. (#109)
- **`affiliation` → `position` + `institution` (separate fields)** on board entries, rendered on two lines (position quieter on top, institution + flag inline below). Every card now has the same anatomy regardless of institution length. The legacy `affiliation` field is kept as a template-side fallback. (#111)
- **`/policy` §5** discloses Google Maps as a third-party embed on conference pages (EN / FR / DE). §3 no-social-media-widgets bullet unchanged. (#78)
- **`scripts/sync-indico.py`** sorts parallel-panel groups by frequency-based room colour index so the most-used room is always in the left column. Computes `roomDiffersFromDefault` per slot for templates. (#79, #80)
- **`scripts/sync-board.py` no-substantive-changes guard** now considers photo-file diffs on disk, not just `board.json`. Photo-only updates used to be silently swallowed — the script said "No substantive changes" while the create-pull-request action correctly committed the new photo bytes. Now the script honestly reports the photo-only path. (#106)
- **`/initiative` substantially redesigned** — see *Added* above. Page now reads as concrete activities + numbers + people rather than three restatements of "multidisciplinary inclusive network". (#113)
- **Google Form settings** — *Limit to 1 response* unchecked; *Collect email addresses* set to Verified. Members re-submit the form when they want to change their photo (workaround for the Google Forms file-upload edit limitation). Disclaimer copy added to the Form description and to the Headshot photo question. Documented in `docs/board-bios-setup.md`. (#101)

#### Fixed

- Translation drift on `/2026` (fr + de) and `/policy` (fr + de) accumulated from PRs #77 → #80. The map-embed include propagated; the Google Maps disclosure already in place from #77 → #78 was re-stamped. CI `i18n drift check` green again. (#81)
- **ESSC-speaker tooltip clipped** by the card's `overflow: hidden`. Moved the corner-clipping responsibility onto `.person-photo` via `border-top-{left,right}-radius`; the card becomes `overflow: visible` so the tooltip can escape. Tooltip max-width raised + z-index bumped to clear neighbouring cards. (#103)
- **Country flag wrapping alone on narrow cards** — on 4K-ish viewports the institution wrapped to multiple lines and the flag, sitting as a separate flex item, got pushed onto a fresh flex line. Switched the institution line to plain inline flow with a non-breaking space gluing the last word to the flag — flag never lands alone now. (#112)

*Version number jumps from v2.13.0r straight to v2.22.0: GitHub's **immutable-releases** feature permanently reserves any tag name that was once attached to a release, and every number from `v2.14.0` through `v2.21.0` had been used by the **original** (now-renumbered) releases — `v2.14.0` was "live programme grid on /2026" (now v2.10.0r), `v2.15.0` was "visual polish ported from NetSec" (now v2.10.3), and so on. Their tags are unrecoverable; we skip the whole burned range rather than try to work around individual tombstones. From this point onward releases follow the v2.22.0-line cleanly.*

## [2.13.0r] · 2026-05-23 — Adopt NetSec versioning and release tooling

> Adopts the versioning rules + release-cutting machinery from the sibling NetSec site, after a candid look at the last ten EISS releases revealed several were tagged MINOR but would be PATCH under those rules. Tags are immutable; this lands the convention so future releases are signal, not noise.

### Versioning rules now documented

New `## Versioning` section in [`README.md`](README.md) translates SemVer 2.0.0 to the static-site context: MAJOR = foundational reset, MINOR = a big new project (new page / new pipeline / new locale / new top-level feature), PATCH = bug fixes / copy edits / small UX tweaks. Includes a worked example of past EISS releases against the rules — v2.13, v2.15, v2.16, v2.18, v2.20 were tagged MINOR but were PATCH-shaped (small visual polish on existing components).

### Release tooling

New `scripts/release.sh` ports NetSec's release helper for EISS. Validates SemVer, refuses to run from non-master / dirty trees / mismatched origin, promotes `[Unreleased]` into a dated `[X.Y.Z] · YYYY-MM-DD — title` block, creates the annotated tag, pushes, and publishes the GitHub Release with the `[X.Y.Z]` section as the body. Has a `--dry-run` mode and a `y`-confirmation prompt before any mutation. Minor / major releases trigger an additional four-point cross-check reminder (roadmap / sitemap / translations / README).

### Changelog format

New `CHANGELOG.md` follows Keep a Changelog 1.1.0 + the hybrid release-notes format from NetSec: lede + 2-5 themed sub-sections + canonical `### Index of changes` block (with `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security` sub-headings, each at most once, in that order). Patches skip the lede + themes; minor / major ship the full hybrid. PRs add entries to `[Unreleased]`; releases promote.

Releases v1.0.0 → v2.20.0 are not back-filled into the changelog. The canonical record for those stays on the GitHub Releases page and the *Release history* section above.

### Index of changes

#### Added

- `CHANGELOG.md` following Keep a Changelog 1.1.0 + NetSec's hybrid release-notes format. PRs accumulate into `[Unreleased]` between releases.
- `scripts/release.sh` — bash helper that ports the NetSec workflow. Validates SemVer, enforces clean working tree + sync with origin, promotes the changelog, tags + pushes + publishes the GitHub Release in one pass. Supports `--dry-run`.
- `## Versioning` section in `README.md` with the SemVer-for-static-sites translation, release-cadence guidance ("one PR is not one release"), the title-format rule (3-8 words, sentence case, no trailing punctuation), and a candid caveat acknowledging the recent over-versioning.
- Cross-reference paragraph at the top of `docs/roadmap-2026.md` § *Release history* pointing at README → Versioning for the canonical definitions.

#### Changed

- Going forward, release-cutting goes through `scripts/release.sh` rather than ad-hoc `gh release create` calls. The script enforces the conventions automatically.

*Originally tagged as **v2.21.0**; renumbered to **v2.13.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.12.1] · 2026-05-23 — Scroll-driven hero + nav shrink

### Index of changes

#### Added

- Hero parallax: the homepage hero photo drifts ~12% downward as you scroll past, via CSS \`animation-timeline: scroll()\`.
- Nav shrink + drop shadow: past the first ~80-300px of scroll, the sticky header gains a soft shadow and the nav padding tightens by one step. The header feels more \"present\" once you're below the hero.

Both effects:

- Pure CSS, ~40 lines. No JS, no new templates, no new dependencies.
- Wrapped in \`@supports (animation-timeline: scroll())\` — browsers without the modern API see the existing static nav and hero, unchanged.
- Wrapped in \`@media (prefers-reduced-motion: no-preference)\` — fully skipped for users who request less motion.
- Compositor-driven, so there's no scroll-thread cost.

Supported on Chrome/Edge 115+, Safari 26+, Firefox behind a flag. Older browsers degrade gracefully to the v2.15 static visuals.

*Originally tagged as **v2.20.0**; renumbered to **v2.12.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.12.0r] · 2026-05-23 — Custom 404 page

### Index of changes

#### Added

- \`src/404.njk\` permalinked to \`/404.html\`. GitHub Pages auto-serves this for any unmatched path on the apex domain.
- New \`notFound.*\` i18n catalog in EN/FR/DE (only EN renders today — GH Pages serves a single 404.html).
- \`.notfound*\` CSS block: gradient \"404\" eyebrow, centered layout, auto-fit grid of six destination cards with icon + accent-on-hover border, back-home primary CTA.

The destinations covered: next ESSC conference, past conferences, membership, the board, members' events, about the Initiative. Each has its Lucide icon. Hover lifts the card with a brand-coloured border.

*Originally tagged as **v2.19.0**; renumbered to **v2.12.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.11.1] · 2026-05-23 — /events empty-state polish

### Index of changes

#### Added

- Opt-in empty-state placeholder on \`indico-events-list.njk\`: a calendar-icon card + short explanation + Indico CTA, rendered when the parent template sets \`showEmptyState = true\`.
- \`/events.{en,fr,de}\` now opts in. Homepage stays unchanged (no section on empty).

#### Fixed

- Previously-dead i18n strings \`indicoEvents.noEventsTitle\` and \`noEventsBody\` (defined in v2.4.0 but never rendered) are now live in EN/FR/DE.

*Originally tagged as **v2.18.0**; renumbered to **v2.11.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.11.0r] · 2026-05-23 — Print stylesheet for /YYYY

### Index of changes

#### Added

- \`@media print\` block covering the full site, with surgical rules around the programme grid on \`/YYYY\` conference pages.
- 1.5 cm page margin via \`@page\`.

#### Changed

- On print, the v2.15 gradient-text headline is overridden to solid ink (gradient-text renders transparent on paper).
- Forces light theme on print regardless of toggle / OS setting.

Operational ahead of ESSC 2026: attendees printing \`/2026.html\` get a clean two-page programme.

*Originally tagged as **v2.17.0**; renumbered to **v2.11.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.10.4] · 2026-05-23 — Polish-lift bundle

### Index of changes

#### Added

- Anchor offset (\`scroll-margin-top\`) so deep links like \`/board.html#arthur-laudrain\` land below the sticky nav, not behind it.
- \`:target\` highlight pulse — soft accent ring around the destination element after a deep-link arrival, ~1.6s, then fades.
- Theme-toggle view transition via \`document.startViewTransition()\`. Cross-fades on supporting browsers; instant on others.

#### Changed

- Focus-visible ring gains a brand-aligned \`--accent-soft\` halo via \`box-shadow\`. Same outline, more presence.

All respect \`prefers-reduced-motion\`. No template, build, or backend changes.

*Originally tagged as **v2.16.0**; renumbered to **v2.10.4** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.10.3] · 2026-05-22 — Visual polish ported from NetSec

> NetSec's sibling site does a handful of small things right that EISS didn't. Six borrowed treatments, all CSS-only, all within the existing design language.

### Borrowed polish

- **Inner-page H1 gradient** — a subtle vertical `--text → --text-muted` gradient via `background-clip: text` on every `.page-header h1`. Skipped on the photo-overlay hero on `/index` and `/YYYY` because gradient + photo is muddy.
- **Primary-button hover glow** — every primary CTA now lifts with a soft accent-coloured glow shadow on the lower edge. Cumulative polish across the whole site.
- **Gradient tile-icon badges** — `.tile-icon` shifts from flat `--accent-soft` to a 135° gradient with white glyphs. Tiles on `/membership`, `/events`, `/board`, `/programmes` all gain visible weight.
- **Deeper card hover lift** — `translateY(-4px)` instead of `-2px`, paired with the next shadow tier up. Cards now actually feel like they raise on hover.
- **Dark-mode accent recovery** — `--accent` saturation bumped from 95% to 100%; recovers the punch the previous value lost on a dark canvas. Applied in both the media-query and the explicit-toggle dark-mode blocks.
- **Featured-card radial halo** — homepage \"Next conference\" card now carries a soft accent halo at its top-right corner, matching the idiom `.page-header` already uses.

### Boundaries respected

Per the operator's framing — *don't change the design language or the backend structure*:

- Blue stays the only chromatic accent
- Glass-card paradigm untouched
- No new tokens introduced
- No template, script, or workflow changes
- No new dependencies

Total diff: 53 insertions, 15 deletions, all in `src/assets/css/site.css`.

*Originally tagged as **v2.15.0**; renumbered to **v2.10.3** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.10.2] · 2026-05-22 — Pad the PDF description

### Index of changes

#### Fixed

- The printable-PDF card's description paragraph (*"A working version of the programme — the live grid above reflects the latest changes."*) was bleeding to the card's left edge, with the first character clipped behind the border. `.pdf-doc` carries `padding: 0` to let the header band span edge-to-edge; the description paragraph added in v2.14.0 sat directly inside the card with no padding of its own. Replaced the inline-styled `<p>` with a `.pdf-doc-description` class that mirrors the header's horizontal inset.

*Originally tagged as **v2.14.3**; renumbered to **v2.10.2** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.10.1] · 2026-05-22 — Live programme grid polish and parallel panels

> Polish on the v2.14.0 live programme grid: parallel panels now render side-by-side, roundtable cards stop pretending to have papers, and a handful of bugs around URLs, breaks, and PDF metadata spacing were tidied up.

### Index of changes

#### Added

- **Parallel-panel layout** on the live programme grid. ESSC concurrent panels render side-by-side under a shared time gutter on wide viewports, collapsing to a column on phones. 9 of 20 time slots across ESSC 2026 carry parallel pairs.
- **Inline discussant list** on roundtable session cards (previously hidden behind a misleading *View papers (1)* expander). Promoted to a top-level meta line alongside *Chair*.
- New i18n string `programme.discussants` in EN / FR / DE (*Discussants* / *Intervenants* / *Diskutant:innen*).

#### Changed

- Roundtables (Indico `sessionCode=RT` or title prefix `Roundtable:`) are now classified with a `subtype` field in `indico.json` and rendered without a contributions expander — Indico stores a single placeholder *Contributors* entry, not real papers, so the toggle was misleading.
- *Roundtable:* prefix stripped from displayed titles in the grid. The subtype already conveys the type; the prefix is redundant noise on the card.
- Mid-day coffee breaks that Indico marks as `entryType=Session` (rather than `Break`) are now detected via a title heuristic (`coffee…` / `tea break` / `lunch`) and rendered in the quiet dashed-border break style. Six break slots across the two days instead of four.

#### Fixed

- Contribution URLs across the grid (including *Read full abstract* links) were relative — `/event/22/contributions/521/` — and browsers resolved them against eiss-europa.com, returning 404. Now absolutised at sync time, so they correctly target `https://indico.eiss-europa.com/event/22/contributions/521/`.
- PDF subtitle metadata dots had no surrounding whitespace, rendering as *"2 pages·107 KB·"*. The old `display: inline-block` + literal-text-separator approach was collapsing the separator spaces; replaced with flex `gap` for deterministic separation.
- `datetime.utcnow()` `DeprecationWarning` in the sync workflow log cleared (Python 3.12 noise).

*Originally tagged as **v2.14.2**; renumbered to **v2.10.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.10.0r] · 2026-05-22 — live programme grid (Indico as source of truth)

The conference programme on \`/2026\` is now a live, browsable, searchable grid pulled daily from Indico — alongside the polished printable PDF.

## Why two views, not one

A programme has two lifecycles:
- **Pre-event months**: changes constantly. The PDF is a maintenance trap.
- **Post-event**: frozen, citable, print-ready. The HTML alone isn't enough.

So the design is: **Indico is the source of truth, the website shows two views over it.** The live grid carries the pre-event months without any PDF maintenance; the polished PDF arrives when it's ready and stays as the archival artefact.

## What's live on /2026 today

- 2 days, 29 timetable slots (25 sessions + 4 breaks)
- 66 contributions with speakers, affiliations, abstract teasers
- Day chips, expandable per-session contribution lists, deep-linkable
- EN / FR / DE — full i18n

## For NetSec, later

The design rationale is documented at [\`docs/indico-programme-integration.md\`](https://github.com/EISSeuropa/EISSeuropa.github.io/blob/master/docs/indico-programme-integration.md) — written to be transferable verbatim to the NetSec website when we wire the same pattern there. The data shape, the partials, and the operator workflow all generalise.

*Originally tagged as **v2.14.0**; renumbered to **v2.10.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.9.1] · 2026-05-22 — Indico API probe round 2

Second pass over the API probe. Round 1 narrowed the field to Indico's legacy \`/export/\` API; round 2 looks for the exact path that carries registration-form state.

Two new affordances in the output:
- **Top-level keys** for 200-OK JSON responses (schema only, no field values — no PII).
- **Body preview** for tiny responses (<300 bytes), useful to read error envelopes.

## Run it

Actions → **Probe Indico API (manual)** → **Run workflow**. Paste the resulting table back to Claude; v2.14 wires the winning endpoint into the daily sync.

*Originally tagged as **v2.13.0**; renumbered to **v2.9.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.9.0r] · 2026-05-22 — Indico API probe (manual)

Operator-triggered, read-only workflow that probes Indico's API surface to discover which endpoint exposes registration-form state on your Indico version. Different installations expose different paths; this lets us land the right one in v2.13 instead of guessing.

## Run it

**Actions → Probe Indico API (manual) → Run workflow.** Read-only, no commits, status codes only. Paste the summary table back to Claude and v2.13 wires the winning endpoint into the daily sync.

## Also

- Cleared the Python 3.12 \`DeprecationWarning\` on \`datetime.utcnow()\` from the sync log.

*Originally tagged as **v2.12.0**; renumbered to **v2.9.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.8.0r] · 2026-05-22 — authenticated Indico sync pipeline

Plumbing for read-only authenticated Indico access. No behaviour changes today; the runway lands once the secret is set.

## Highlights

- Optional \`INDICO_API_TOKEN\` env var → \`Authorization: Bearer …\` header on every Indico call.
- Mode banner at sync startup confirms in CI logs whether the secret reached the runner. Token value is never printed.
- Anonymous fallback preserved — local runs and emergencies don't need the credential.
- New operator guide: [docs/indico-api-token.md](https://github.com/EISSeuropa/EISSeuropa.github.io/blob/master/docs/indico-api-token.md) — create a dedicated service account, scope to Reader on Annual Conferences, issue a read-only token, drop into GitHub secret, rotation cadence.

## After this release: what unlocks once the token is set

1. **Registration form state auto-detect** → drop the manual \`registrationStatus\` override in \`src/_data/conferences.js\`
2. **Auth-gated Zoom join URLs** for any session whose video link Indico keeps behind auth
3. Future: live attendee counts on /2026, deeper programme metadata

*Originally tagged as **v2.11.0**; renumbered to **v2.8.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.7.1] · 2026-05-22 — type-field-first detection

EISS leans on Indico's session **Type** dropdown rather than freeform session codes — clicks beat typing for reliability. This release makes \`session.type\` the primary signal for what's livestreamed on /2026.

## New precedence

1. \`session.type\` — \`Round Table\` → roundtable; \`Plenary\` (with code disambiguating intro/keynote/closing) → mapped; everything else (Closed Panel, Open Panel, Poster) → skip
2. \`sessionCode\` — fallback when Type isn't set (e.g. 2026's INTRO slot has no Type)
3. Title prefix \`"Roundtable:"\` — last-resort safety net

## Cost

The bulk timetable export doesn't include Type, so we fetch each session's detail endpoint and cache by \`sessionId\`. ~25 extra HTTP calls per daily sync — anonymous, small payload, fine.

## Operator implications

Going forward, set Types only and the sync still works. The one Plenary edge case still benefits from a code (KEY / INTRO / CONC) — without a code, Plenary defaults to **Keynote**.

*Originally tagged as **v2.10.0**; renumbered to **v2.7.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.7.0r] · 2026-05-22 — livestreamed sessions (intro + roundtables + keynote + closing)

The live block on \`/2026\` is now called **Livestreamed sessions** and includes everything EISS plans to stream online for ESSC 2026: introduction, roundtables, keynote, closing.

## Detection

Sessions are picked up if either holds:
- \`sessionCode\` is \`INTRO\` / \`RT\` / \`KEY\` / \`CONC\` (preferred)
- Title starts with \`"Roundtable:"\` (safety net — the prefix is stripped from the displayed title)

## What's surfaced today

- **Introductory Remarks** — Day 1, 09:30–09:45 (INTRO)
- **Lt Gen Thomas Nilsson** — Day 1, 13:30–14:30 (KEY)
- **Navigating the Job Market** — Day 2, 09:00–10:15 (title-prefix)
- **Concluding Remarks** — Day 2, 17:30–18:00 (CONC)

The Day-1 roundtable ("Taking Stock of European Security…") doesn't have either marker in Indico yet — tag it with \`sessionCode=RT\` and the next daily sync will pick it up.

All four currently show "Online room TBA". As Zoom join links are published in Indico, the sync swaps placeholders for "Join online" CTAs automatically.

*Originally tagged as **v2.9.0**; renumbered to **v2.7.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.6.1] · 2026-05-22 — intro + concluding plenaries on /2026

The live block on \`/2026\` used to show only keynotes. Now it also surfaces the opening and closing plenary slots — the full plenary spine of the conference, in programme order.

For ESSC 2026, that means three rows where there used to be one:

- **Introductory Remarks** — Day 1, 09:30–09:45
- **Lt Gen Thomas Nilsson** (keynote) — Day 1, 13:30–14:30
- **Concluding Remarks** — Day 2, 17:30–18:00

Each row carries a small eyebrow (\`Introduction\` / \`Keynote\` / \`Closing\`) so attendees can scan the type at a glance. Localised in EN/FR/DE.

Detection still uses Indico's \`sessionCode\` field — \`INTRO\`, \`KEY\`, or \`CONC\`. If you ever want to surface another type (a roundtable, a discussant), just add a new code → label mapping in \`PLENARY_SESSION_CODES\` in \`scripts/sync-indico.py\` and the corresponding i18n string.

*Originally tagged as **v2.8.0**; renumbered to **v2.6.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.6.0r] · 2026-05-22 — registration override + live keynotes

Two follow-ups after v2.5 met production.

## Fixed: badge said "Registration open" when it wasn't
The pure date-based logic was wrong for the realistic case where EISS closes the registration form weeks before the conference starts. Added a manual override field `registrationStatus` on each conference entry in `src/_data/conferences.js`:

- `"open"` — force "Registration open"
- `"closed"` — show "Registration closed" with a "View on Indico" CTA
- `null` / unset — derive from today vs. start/end dates (previous behaviour)

2026 is now set to `"closed"`. Flip it back if the form reopens — the daily rebuild picks it up.

## Added: live keynote programme above the PDF
`scripts/sync-indico.py` now also pulls the timetable for each Annual Conference and extracts every session flagged with `sessionCode == "KEY"`. The conference page (`/2026`, `/2026.fr`, `/2026.de`) renders these as a card list above the existing PDF programme — showing speaker, time, location, and either a "Join online" CTA (when Indico publishes the Zoom/Meet/Teams/Webex link in any field) or an "Online room TBA" placeholder. When you populate the Indico join URLs, the next daily sync swaps placeholders for real CTAs automatically.

New Lucide icons `video` and `video-off`. New i18n catalog `keynotes.*` in EN/FR/DE.

*Originally tagged as **v2.7.0**; renumbered to **v2.6.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.5.1] · 2026-05-22 — footer cleanup + authorship credit

Two small footer changes.

## Highlights

### Light footer trim
Image credits and legal status used to be two separate paragraphs in the footer fine-print. They're now folded into a single line — same content, less visual weight at the bottom of every page.

### Authorship credit
A new last-row line: **Site designed and built by [Dr Arthur PB Laudrain](https://eiss-europa.com/board.html#arthur-laudrain)**, with the name deep-linking to his card on `/board.html`. Locale-aware: "Site conçu et développé par" in French, "Website konzipiert und entwickelt von" in German.

## Implementation notes

- `src/_data/board.json` gains an opt-in `slug` field on board entries; templates only render an `id` attribute when the field is set, so other board members are unaffected.
- New i18n catalog keys `footer.authorship.{prefix, authorName, authorSlug}` in EN/FR/DE.
- Footer uses a flex row for legal links + authorship — wraps gracefully on narrow viewports.

*Originally tagged as **v2.6.0**; renumbered to **v2.5.1** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.5.0r] · 2026-05-22 — announcement → data-driven + conference registration badge

Two improvements that unblock a wider class of content edits without template surgery.

## Highlights

### Announcement card → data-driven
The homepage NetSec announcement card now reads from `src/_data/announcement.js` — one structured object per language with a shared image and CTA URL. The three `index{,.fr,.de}.njk` templates each include `src/_includes/announcement-card.njk`, so rotating the news item (a new programme launch, press release, partnership milestone) is a one-file edit instead of three. Flip `visible: false` in the data file to hide the section without deleting the content.

### Conference registration status badge
A glassy pill in the `/2026` hero (and any future `/YYYY` page) now reflects today's state vs. the conference dates from `src/_data/conferences.js`:

- **Registration open** — green dot + "Register on Indico" CTA in brand blue
- **Happening now** — pulsing red dot + "View on Indico"
- **Past edition** — neutral pill (with an Indico link if the page is still around)

Status flips automatically because the daily scheduled rebuild advances the today-cutoff in `conferences.js`. The Indico URL is pulled from `src/_data/indico.json`, populated by `scripts/sync-indico.py` v2.5.

## Implementation notes

- `scripts/sync-indico.py` v2.5 now routes Annual Conference events (categoryId 1) into a separate `annualConferences = {year: event}` bucket in `indico.json` instead of dropping them. The hand-maintained `conferences.js` still owns dates / venues / organisers; Indico only contributes the registration link.
- `conferences.js` gains a `byYear` lookup keyed on `String(year)`.
- New partials: `src/_includes/announcement-card.njk`, `src/_includes/registration-badge.njk`. Both re-derive `t = i18n[lang or "en"]` internally to stay independent of `base.njk` scoping.
- i18n catalog keys `registrationBadge.{upcoming, happeningNow, past, registerOnIndico, onIndico, daysToGo, oneDayToGo, today}` added in EN/FR/DE.
- CSS for the pill under `/* ---------- registration-status badge ---------- */` in `site.css`. Respects `prefers-reduced-motion`.

## Roadmap

Closes two items: "NetSec announcement card → data-driven" and "Conference registration status indicator" (deferred from v2.4 pending API exploration).

*Originally tagged as **v2.5.0**; renumbered to **v2.5.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.4.0r] · 2026-05-22 — Indico API sync

First Indico integration. The website now surfaces upcoming events from `indico.eiss-europa.com` automatically, without manual edits.

## How it works

```
indico.eiss-europa.com              ← system of record (event management)
        │
        │  daily cron at 03:45 UTC + workflow_dispatch
        ▼
scripts/sync-indico.py              ← fetches /export/categ/0.json
        │
        ▼
src/_data/indico.json               ← committed snapshot in git
        │
        ▼
/index, /events  (EN / FR / DE)     ← rendered as upcoming-events list
```

**No API token needed** — the Indico export API is anonymously accessible for public events.

**Filter logic**: Annual Conferences (`categoryId 1`) are excluded because they're already driven by `src/_data/conferences.js` with much richer per-language strings than Indico provides. Members' Events and any future sub-categories pass through.

## What appears on the site

- **Homepage** — section beneath the featured-conference card, top 5 upcoming events. Each event = clickable card → deep link to the Indico event page.
- **`/events.html`** — full upcoming-events list above the existing "Roundtables / Early Career / Doctoral Workshops" format tiles. Concrete examples to complement the abstract format descriptions.
- **All three languages** — section labels translated via `src/_data/i18n.js`. Event titles render as Indico provides them (typically English-only; Indico doesn't store multilingual event titles).

## Resilience

- **Indico unreachable** → sync script exits 1, workflow fails, existing snapshot stays. Site doesn't break.
- **No upcoming events** → section hides entirely; no awkward "0 events" placeholder.
- **Schema drift** → defensive `.get()` calls produce partial data rather than crashing.

## Current state

Only event currently in Indico is ESSC 2026 (excluded as Annual Conference). `indico.upcoming` is empty; the new section is hidden. When Members' Events get published to Indico, they appear within ~24h, or immediately if you trigger **Run workflow** on `sync-indico.yml` from the Actions tab.

## Roadmap updated

`docs/roadmap-2026.md` now marks Indico integration as ✅ done. Conference-registration-status badge (`"Registration open · N attendees"`) is deferred to v2.5 — needs more API exploration to confirm Indico returns those fields for the EISS conference type.

*Originally tagged as **v2.4.0**; renumbered to **v2.4.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.3.0r] · 2026-05-22 — Conference cycle automation

Conference cycle automation — single source of truth + daily auto-cutoff.

## What changed

**Before**: the "Next conference" card on `/`, the archive list on `/past`, and the upcoming-conference card on `/past` were all hardcoded in twelve separate places (3 languages × {1 upcoming + 7 past}). Adding ESSC 2027 would have meant editing 12+ blocks across 6 files. Moving 2026 from "upcoming" to "past" after the conference was a manual chore.

**Now**: one `src/_data/conferences.js` file holds every conference entry with per-language strings. Templates loop over it. `conferences.next` is the closest upcoming conference; `conferences.past` is everything whose end-date is in the past. **Both update automatically** as the world moves past conference dates.

## What's shipped

| | |
|---|---|
| **`src/_data/conferences.js`** | Central data source — 8 conferences (2019–2026) with structured fields and EN/FR/DE strings |
| **Homepage + `/past` refactor** | 12 hardcoded blocks → 1 data file + 2 short loops. Net **−127 lines** across the PR |
| **`.github/workflows/scheduled-rebuild.yml`** | Daily cron at 04:15 UTC re-runs the build so the next-vs-past cut-off advances even on quiet weeks |
| **`docs/new-conference.md`** | 5-step playbook for ESSC 2027 — ~30-minute job |

## What's still hand-managed (by design)

- The unique content of each `/<year>.html` page (programme, venue description, neighbourhood tile grid, partner logos, funding attribution). Too much per-conference variation to template.
- 2017 and 2018 — kept in the historical-image section at the bottom of `/past.html` because they predate the standalone-page convention.

## Roadmap updated + validated

`docs/roadmap-2026.md` now reflects that Conference-cycle automation is done. Q4/Jan-2027 quarterly item rephrased: ESSC 2027 announcement is now a 30-minute drop-in, not a multi-page hand-edit. Several "future work" sentences that this PR makes obsolete have been rewritten.

*Originally tagged as **v2.3.0**; renumbered to **v2.3.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.2.0r] · 2026-05-22 — Localised share cards

Localised share cards for the [v2.1.0](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.1.0) translated pages.

## What changed

When you share a translated page (e.g. `/index.fr.html`, `/membership.de.html`) on LinkedIn, Twitter/X, Mastodon, or Bluesky, the preview card now shows up in the page's language — title and subtitle translated, design unchanged.

## How it works

- **22 new `-meta.{fr,de}.jpg` files** under `src/assets/images/`, one per translated page slug × language.
- **`scripts/make-share-cards.py`**: each `CARDS` entry now carries `i18n: { en, fr, de }` with per-language `eyebrow`, `title`, and `subtitle` strings. The driver loops over (slug × language).
- **`src/_layouts/base.njk`**: auto-swaps `-meta.jpg` → `-meta.fr.jpg` / `-meta.de.jpg` in og:image and twitter:image when the page's `lang` is `fr` or `de`. The English `metaImage` front-matter in each `.fr.njk` / `.de.njk` stays unchanged — the layer handles it.
- **Subtitle auto-shrink** added to the generator. French and German subtitles often run 50–65 characters where English would be 40, so the previous fixed 38pt was clipping.

## Coverage

| Slug | EN | FR | DE |
|---|---|---|---|
| index, 2026, board, past, programmes, initiative, membership, events, accessibility, policy, terms | ✅ | ✅ | ✅ |
| 2025, 2024 (archive only) | ✅ | — | — |
| NetSecSchool, euroswamos, coercion, GlobalRisks (untranslated programme pages) | ✅ | — | — |

## Verified

- og:image tag on `/index.fr.html` → `/assets/images/index-meta.fr.jpg` ✅
- og:image tag on `/membership.de.html` → `/assets/images/membership-meta.de.jpg` ✅
- All 22 localised assets serve HTTP 200 in the local Eleventy build
- Build clean: 71 HTML files (unchanged from v2.1.0); +22 image assets

*Originally tagged as **v2.2.0**; renumbered to **v2.2.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.1.0r] · 2026-05-22 — Tier 1 + Tier 2 page translations

Extends [v2.0.0](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.0.0)'s i18n plumbing with **full FR + DE translations for 9 additional pages**.

## Coverage after this release

Every core user-facing page is now available in English, French, and German:

| Page | EN | FR | DE |
|---|---|---|---|
| `/` (home) | ✅ | ✅ beta | ✅ beta |
| `/initiative` | ✅ | ✅ beta | ✅ beta |
| `/membership` | ✅ | ✅ beta | ✅ beta |
| `/board` | ✅ | ✅ beta | ✅ beta |
| `/2026` | ✅ | ✅ beta | ✅ beta |
| `/programmes` | ✅ | ✅ beta | ✅ beta |
| `/events` | ✅ | ✅ beta | ✅ beta |
| `/policy` | ✅ | ✅ beta | ✅ beta |
| `/terms` | ✅ | ✅ beta | ✅ beta |
| `/accessibility` | ✅ | ✅ beta | ✅ beta |
| `/sitemap` | ✅ | ✅ beta | ✅ beta |
| `/past` | ✅ | ✅ beta | ✅ beta |

**Out of scope (English-only by design)**: archive conference pages 2019–2025, JPW2019, JPW2022, JPW23, NDC, Ukraine, panels, practical, page7/9/20/23 redirects, ticket-* redirects, individual programme pages (NetSecSchool, euroswamos, coercion, GlobalRisks).

## Translation provenance

All 24 new translation entries are marked `status: beta` — DeepL-quality machine translations produced during the PR work, awaiting native-speaker review. The beta ribbon flags every translated page, with an extra inline disclaimer on legal pages (`/policy`, `/terms`, `/accessibility`) noting that the English version remains the legally binding text.

`scripts/check-i18n-drift.py` shows all 24 entries currently fresh against their source SHA-1.

## Notes on specific pages

- **`/board`** — chrome translated; member names, affiliations, and research themes stay in the language they were originally submitted in (matches NetSec's approach to member bios)
- **`/policy`, `/terms`, `/accessibility`** — fully translated GDPR/WCAG documents; extra "translation in good faith" disclaimer at the top, beta ribbon below
- **Conference and programme content** referencing English-only archive pages still link to those English pages from FR/DE — the language-switcher chips on those archive pages route back to the language homepage

## What's next

- **Native-speaker review pass** to promote the 24 beta translations to `status: reviewed` (especially the three legal pages)
- **Localised share cards** — `scripts/make-share-cards.py` could produce `*-meta.{fr,de}.jpg` variants

*Originally tagged as **v2.1.0**; renumbered to **v2.1.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

## [2.0.0r] · 2026-05-22 — Multilingual site (EN / FR / DE)

First multilingual release.

The EISS site is now available in **English (canonical)**, **French (beta)**, and **German (beta)** — with the full i18n plumbing in place for any future page to be translated.

## URL convention

| URL | Locale |
|---|---|
| `/page.html` | English (authoritative) |
| `/page.fr.html` | French (beta until native-speaker review) |
| `/page.de.html` | German (beta until native-speaker review) |

Pattern borrowed from [netsec-cost.eu](https://netsec-cost.eu/) and adapted to EISS's Eleventy/Nunjucks layout.

## What's translated

### Chrome (site-wide)
Nav labels, footer labels, button strings, theme-toggle aria text, beta-ribbon copy — all translated to FR + DE via `src/_data/i18n.js`. Appears on every page.

### Page content (PoC)
- `/index.{fr,de}.html` — homepage
- `/initiative.{fr,de}.html` — about EISS
- `/membership.{fr,de}.html` — pricing tiers + management portal

All marked `status: beta` — they show a yellow ribbon at the top noting that the English version is authoritative.

### Not translated (by design)
35+ archive pages stay English-only: conferences 2019–2025, JPW, NDC, Ukraine, panel/practical details, ticket-flow redirects. The language-switcher chips remain visible on those pages and route FR/DE clicks to the language homepage as a friendly fallback.

## User-facing features

- **Language switcher** in the top nav — three pill chips (EN / FR / DE). Active chip highlighted in EISS blue.
- **Beta ribbon** at the top of every translated page, with a "View in English" link back to the source.
- **Saved preference** — clicking a chip sets `localStorage.eiss-lang`. Subsequent visits to the English version auto-redirect to the saved language *if* a translation exists for that page. Never auto-redirects away from English.
- **hreflang link tags** on every translated page for search engines.
- **og:locale meta tag** for social-media preview crawlers.

## Maintainer tooling

- **`scripts/check-i18n-drift.py`** — hashes each English source `.njk` and compares to `data/i18n-state.json`. Reports stale/missing translations.
- **`.github/workflows/i18n-drift.yml`** — runs the drift checker on every push + PR. Fails the build if a translation has drifted, blocking the PR until either a re-translation lands or a `--mark-fresh` re-stamp is committed.
- **`docs/i18n.md`** — full maintainer guide (adding a translation, refreshing after source changes, promoting beta → reviewed, translation policy, cost model).

## What's next (v2.1+)

- Translate remaining Tier-1 pages: `/board`, `/2026`, `/programmes`, `/events`, `/policy`
- Translate Tier-2 (legal) pages: `/terms`, `/accessibility`, `/sitemap`, `/past`
- Native-speaker review pass on the 6 PoC translations to promote `status: beta` → `reviewed`
- Per-page localised share cards (currently English regardless of page locale)

Each follow-up translation is one file copy + DeepL pass + `--mark-fresh` away.

## Verified locally

Preview MCP screenshots of `/index.fr.html`, `/index.de.html`, `/initiative.de.html` — all show the correct language for chrome + content, active chip highlighted, beta ribbon present, hreflang tags in place.

*Originally tagged as **v2.0.0**; renumbered to **v2.0.0r** in the v2.13.0r retroactive cleanup so the SemVer signal matches the actual scope of the change.*

[Unreleased]: https://github.com/EISSeuropa/EISSeuropa.github.io/compare/v2.23.0...HEAD
[2.23.0]: https://github.com/EISSeuropa/EISSeuropa.github.io/compare/v2.22.0...v2.23.0
[2.22.0]: https://github.com/EISSeuropa/EISSeuropa.github.io/compare/v2.13.0r...v2.22.0
