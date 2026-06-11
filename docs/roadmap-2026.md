# EISS website: 2026 roadmap

A planning document to help the maintainer think through what's worth
doing next, in what order, and at what effort. Organised by **release
version** (SemVer), the same axis as the GitHub milestones and the
public [`/roadmap.html`](https://eiss-europa.com/roadmap.html).
**Last update: 3 June 2026 (v2.24.1 milestone resync).**

<!-- AUTOSTAMP:BEGIN -->
> _Auto-tracked: **11 entries** in [`[Unreleased]`](../CHANGELOG.md#unreleased) since **v2.25.0** (4 Added, 3 Changed, 4 Fixed). Last refresh by `scripts/sync-roadmap.py`: 11 Jun 2026. Prose in the timeline below may lag; the maintainer resynthesises on release-time §5 sweep._
<!-- AUTOSTAMP:END -->

> **Sync convention.** This file is the authoritative planning source.
> The block above between `<!-- AUTOSTAMP:BEGIN -->` markers is
> machine-managed by `scripts/sync-roadmap.py` (fires from
> `.github/workflows/sync-roadmap.yml` on every push that touches
> `CHANGELOG.md`, plus a weekly Monday 06:00 UTC belt-and-braces run).
> The count surfaces staleness, the maintainer decides when the prose
> timeline below needs a refresh (release-time §5 cross-check per
> `CLAUDE.md`). The public `/roadmap.html` cards are a curated mirror
> of the *At a glance* table and version sections here.

Status notation:

- **Shipped** — released and live.
- **In progress** — actively being built for the next cut.
- **Planned** — committed to a dated release, not yet started.
- **Under watch** — no committed release, waiting on a trigger.

Effort notation:

- **S** — under 2 hours of focused work (one short session).
- **M** — half-day to one day (one longer session).
- **L** — multi-day or requires external input (translators, design,
  Indico API access, etc.).

Dependencies on people or external systems are flagged in line.

---

## At a glance

The version-tagged timeline. Each planned row has a matching GitHub
[milestone](https://github.com/EISSeuropa/EISSeuropa.github.io/milestones)
(same title, due date from the *Target* column) and a card on
`/roadmap.html`. Milestones are created from this table, not the
other way round, so this is where a new release first appears.

| Release | Target | Status | Headline |
| --- | --- | --- | --- |
| v2.24.0 | 30 May 2026 | **Shipped** | Live programme depth and a print overhaul |
| v2.25.0 | 9 Jun 2026 | **Shipped** | Ready for Stockholm (pre-conference release) |
| v2.26.0 | Sep 2026 | Planned | Post-conference: activation, content & feedback |
| v2.27.0 | Dec 2026 | Planned | Polish and ESSC 2027 prep |

(`v2.24.1` was planned as a pre-ESSC patch but the work grew into a feature-rich minor, so it shipped as the **v2.25.0** *Ready for Stockholm* release instead; the `v2.24.1` milestone is closed as superseded.)

**Versioning rules**: see the *Versioning* section of
[`README.md`](../README.md) for the canonical definition of MAJOR /
MINOR / PATCH (the feature test, not size). `scripts/release.sh`
enforces the process. `CHANGELOG.md` accumulates entries between
releases. One PR is *not* one release: PRs add to `[Unreleased]`, and
releases get cut at milestones.

---

## Planned work

### v2.25.0 — Ready for Stockholm · shipped 9 June 2026

The pre-conference release. Planned originally as the v2.24.1 patch,
but the brand alignment, the new site search and the new public pages
together cleared the feature bar for a minor. What shipped: site-wide
Pagefind search, a public roadmap, a licensing page and a press kit,
the interface pulled onto the brand blue with redesigned landscape
share cards, profile hovercards, fully clickable cards, a mobile-UX
pass, and the ESSC 2026 run-up (countdown, downloadable programmes,
add-to-calendar links). Full notes in the `[2.25.0]` section of
[`CHANGELOG.md`](../CHANGELOG.md).

**Native-speaker FR / DE review** (L, depends on volunteers) runs as
an opportunistic track alongside these releases rather than a single
milestone. All 24 translated pages carry `status: "beta"` and a
yellow ribbon. A native reader reviews a page, the edits are applied,
`status` flips to `"reviewed"` in `data/i18n-state.json`, the ribbon
drops. Sequence: legal pages first (highest accuracy bar), then
`/index` + `/initiative` + `/membership` (highest traffic), then the
rest. Per [`docs/i18n.md`](i18n.md). Each reviewed page can ship in
any patch.

### v2.26.0 — Post-conference: activation, content and feedback · target September 2026

The first release after ESSC 2026. It turns conference-week feedback
into fixes and builds out the public-content surfaces (a news feed, an
outputs list, the working groups). The polish and brand-card work that
the old v2.25.0 plan held moved to v2.27.0, and the Indico-data and
NetSec-coordination items moved to *Under watch*, so this release stays
focused. (The Node-24 Actions pin the plan once tracked was resolved
early by Dependabot, closing #76.) The full, current list
lives on the
[v2.26.0 milestone](https://github.com/EISSeuropa/EISSeuropa.github.io/milestone/9);
the headline items:

- **Speaker index across every edition** — a surname-ordered,
  theme-filterable directory of everyone who has presented at an ESSC,
  on the new `corpus.js` spine, with summary cards and a locale-aware
  link-card signpost from the sitemap, the conference programmes and the
  People page. In EN + FR + DE (interface hand-translated, names and
  themes stay original). Built early (originally a v2.27.0 item) and
  already in `[Unreleased]`, so it ships with this release.
  [#635](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/635), done.
- **Conference-week QA pass** — work the ESSC 2026 feedback checklist
  on production and fix what it surfaces.
  [#655](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/655), M.
- **News / Latest on the homepage** — a surface for Action news and
  cross-links to NetSec items relevant to EISS members.
  [#96](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/96), M.
- **Atom / RSS feed** — a machine-readable feed alongside the News
  surface.
  [#605](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/605), S.
- **Issue-driven news publishing** — label an issue and have it
  auto-PR a news post, so an update doesn't need a hand-built page.
  [#634](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/634), M.
- **Outputs / Publications page** — list the network's outputs (book
  series, the Prix Bastien Irondelle, deliverables) on a dedicated
  page.
  [#97](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/97), M.
- **Working Groups page** — render each group's objective and people.
  The NetSec sister site ships its own, this mirrors it for EISS.
  [#94](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/94), M.
- **`/initiative` founding nuance** — reconcile the founding story,
  the conference numbering and the deferred-2020 edition.
  [#329](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/329), M.

### v2.27.0 — Polish and ESSC 2027 prep · target December 2026

- **CSS class-collision guard** — a build check so an archive
  component can never again override the live grid (the regression
  fixed in v2.24.0).
  [#241](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/241), S.
- **Expand the open-panel examples on `/initiative`** — more recent
  open-panel titles from the conference programmes.
  [#249](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/249), S.
- **ESSC 2027 announcement** — drop one entry into
  `src/_data/conferences.js` per [`docs/new-conference.md`](new-conference.md)
  once the date and venue firm up. S.
- **Social-card polish** — keep the EISS iconmark on every OG card
  ([#157](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/157)),
  and add bespoke cards for `/roadmap`
  ([#272](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/272))
  and the `/2017`, `/2018`, `/joint-2024` archive pages
  ([#474](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/474)). S each.
- **Responsive images** — finish the `srcset` / `sizes` rollout so
  phones stop downloading full-resolution JPGs (the hero slice shipped
  in the v2.26.0 run-up).
  [#554](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/554), M.
- **Brand-palette polish** — re-tune the off-palette hero gradient
  blobs onto the brand blue.
  [#519](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/519), S.
- **Branch-protection Phase 3** — enforce required status checks on
  `master`.
  [#501](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/501), S.
- **Legacy Mobirise alias pages to true redirects** — finish the
  migration so old URLs 301 instead of serving alias pages.
  [#607](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/607), M.

Candidates without committed scope yet, pulled in if a release has
room: a conference countdown widget, View Transitions API page
crossfades, an acknowledgments / contributors page, a newsletter
archive page, `rel="me"` verification if EISS gets a Mastodon or
Bluesky account.

---

## Under watch

No committed release. Waiting on an external trigger or further
research. Tracked under the **Backlog — Under watch** milestone and
mirrored in the *Under watch* section of `/roadmap.html`.

- **Auto-detect registration state from Indico**
  ([#55](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/55)) —
  blocked. This Indico build doesn't expose form state on the
  anonymous or the authenticated `/export/` API, so the
  `registrationStatus` override in `conferences.js` stays manual.
- **Bearer-auth spike on `/export/`**
  ([#74](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/74))
  and **refresh `docs/indico-api-token.md`**
  ([#75](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/75)) —
  wait on the fine-grained-PAT era of the Indico instance.
- **Indico write API (`/api/v1` POST)**
  ([#64](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/64)) —
  future automation, no near-term need.
- **Generalise `sync-indico.py` for NetSec reuse**
  ([#57](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/57)) —
  depends on coordination with the NetSec maintainers.
- **Archive date / narrative contradictions**
  ([#230](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/230)) —
  needs source research before any contested fact is edited.
- **Google Forms file-upload edit lock**
  ([#102](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/102)) —
  upstream Google limitation, no fix path; a documented known issue.

**Deferred to 2027+** (won't schedule without a specific trigger):
custom-domain board emails, a self-hosted newsletter replacing
Mailchimp, a multi-author CMS, analytics (the privacy notice's
no-analytics stance is a deliberate positioning choice), a multi-page
member directory (the full membership list lives in Stripe / Indico
and isn't appropriate to publish), conference-proceedings hosting
(those go to Zenodo, the site links out), and a reverse-proxy custom
domain for `indico.eiss-europa.com` (already at the right subdomain).
The reasoning for each is in this file's git history.

---

## Status as of v2.24.0

Where the site stands today, so the plan above makes sense:

- **Stack**: Eleventy 3 + Nunjucks. GH Actions builds + deploys. No
  client-side framework. A small amount of hand-written JS for theme,
  mobile menu, lazy YouTube, and print preparation.
- **Pages**: 72 `.njk` templates including the FR / DE locales. All
  URLs preserved from the original Mobirise export. `src/legacy/`
  fully retired in v1.0.
- **Brand identity**: real EISS lockup (constellation + EiSS wordmark)
  across header, footer, favicon, Apple touch icon, Android adaptive
  icon, PWA manifest, joint-organisers strip. Schema.org
  `Organization.logo` points at the high-res brand PNG. OG-card
  iconmark overlay still outstanding ([#157](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/157)).
- **Design**: Apple-style glass, auto + manual dark mode, Inter font,
  reveal animations gated on `prefers-reduced-motion`. Brand-blue
  (`#007bc6`) is the canonical accent.
- **Accessibility**: WCAG 2.1 AA, axe-core clean across light + dark.
- **SEO**: full OG + Twitter Card meta, JSON-LD Organization with
  `ImageObject` logo + `foundingDate: "2017"`, per-page bespoke share
  cards in all three languages, favicon stack, webmanifest,
  robots.txt + sitemap.xml.
- **i18n**: EN / FR / DE. Chrome strings in `src/_data/i18n.js`. 12+
  fully translated pages × 3 langs. Beta ribbon on FR / DE pages until
  native-speaker review. Drift detection in CI on every HTML-touching
  PR. A `localizedHref` filter falls cross-locale links back to the
  English page when the target locale doesn't exist.
- **Conference cycle**: driven by `src/_data/conferences.js`. The
  homepage "next conference" card and the `/past` archive both read
  from this single data source; the cut-off advances automatically
  once a conference's end-date passes (daily-rebuild workflow). The
  live ESSC programme grid on `/2026` pulls the full programme from
  Indico daily, now with co-authors, a presenter microphone, a
  livestream pill, and a clean print path.
- **Board page**: driven by `src/_data/board.json`, Google-Form
  populated. Three sections (Leadership · Board Members · Support
  Staff) plus an *EISS community* footer for former members and past
  interns (auto-expiring via `roleEndDate` + 7-day grace).
- **Indico events sync**: `scripts/sync-indico.py` runs daily, writes
  upcoming events to `src/_data/indico.json`; homepage and `/events`
  show them automatically (ESSC filtered out, already in
  `conferences.js`).
- **Operator + CI conventions** (imported from `netsec.github.io`):
  `CLAUDE.md` operator playbook, full `SECURITY.md`, hybrid CHANGELOG
  format, roadmap autostamp via `sync-roadmap.py`, link checker on
  every PR + Monday cron. Dependabot watches GitHub Actions and Python
  deps weekly. Version-numbered milestones drive release planning
  (switched from thematic after v2.24.0). Cross-repo GitHub Project
  ([#1](https://github.com/users/EISSeuropa/projects/1)) spans open
  enhancement issues across EISS + NetSec.
- **What's New banner**: `src/data/whats-new.json`-driven dismissible
  site-wide announcement, currently pointing visitors at the live
  ESSC 2026 programme. CLAUDE.md §12 governs the discipline.

---

## Release history

Each tagged release at a glance: what landed, when, and the GitHub
Release link. Each entry is one short paragraph framing the release,
with bullets only when there are several distinct pieces. Patch
releases get a single line.

### v2.24.0 · 30 May 2026 — *Live programme depth and a print overhaul*

The ESSC 2026 programme grid on `/2026` now shows the full panel
line-ups with every co-author, the presenter marked first with a
microphone, and a *Livestream* pill on each plenary and roundtable
that goes out online. Printing the programme includes every panel's
composition (abstracts dropped, concurrent panels side by side,
post-programme sections omitted), down from roughly 20 pages to 13. A
discreet *"Speaking or chairing?"* banner before the grid points
contributors to the shared NetSec conference FAQ and the official
programme PDF, and a joint-organisers strip below the hero carries the
EISS / NetSec / Stockholm University logos. The archive fills out: a
2025 Thessaloniki gallery, lazy YouTube embeds on `/2019`, `/2023`,
`/2024`, and reconnected imagery across `/2021`, `/2022`, `/2024`,
`/GlobalRisks`, `/panels`. Four former board members join the EISS
community, `/initiative` names the yearly open panels, a 404
illustration shows a piece of the Union drifting away, and a voice
pass removed 140 em-dashes and 50 prose semicolons across the English
pages and docs. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.24.0)

### v2.23.1 · 27 May 2026 — *Archive banner and post-release polish*

Sticky archive-page disclaimer ribbon on all past-conference and past-workshop pages. Beta-ribbon *View English* link fixed (was bouncing FR/DE visitors back to the translated page via `localStorage`). Link-checker skip list expanded for three bot-blocking hosts. `sync-roadmap.yml` self-feeding loop broken. Two Mobirise-era utility scripts retired, closing two CodeQL alerts. Meijer pull-quote attribution corrected on `/initiative`. ESSC host-city map projection re-tuned (1.4× y-scale, was 1.82×). README + roadmap refreshed against current site state. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.23.1)

### v2.23.0 · 26 May 2026 — *Brand identity and Initiative depth*

The designer's EISS lockup replaces the placeholder "E" gradient tile across every header, every footer, the favicon (brand-blue rounded square with a simplified 4-dot constellation), the Apple touch icon, the Android adaptive icon, and the PWA manifest. The Schema.org `Organization.logo` JSON-LD upgrades from a stale Mobirise-era JPEG to the new high-res brand PNG with explicit dimensions and `foundingDate: "2017"`. `/initiative` deepens into a complete founding story: founder pull-quote + two founding objectives + "Filling a gap" framing, an ESSC flagship section with a 10-card grid of every annual edition, a Natural-Earth-projected host-city map, a research-themes pill row, expanded origins prose, and a *First conference* facts aside. `/board` formalises the EISS community as a first-class section with auto-expiring intern entries (19 past interns backfilled with affiliations) and a mobile photo-drop. Operator + CI conventions imported from the sister `netsec.github.io` repo: `CLAUDE.md` operator playbook, full `SECURITY.md`, hybrid CHANGELOG preamble, a `sync-roadmap.py` autostamp pattern keeping the freshness count on this very file refreshed automatically, and a `check-links.sh` workflow walking `_site/**/*.html` on every PR + Monday cron. ESSC map projection corrected for cos(latitude) so Europe no longer renders squat, plus theme-toggle blindness, label overlap, and mobile tap targets fixed. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.23.0)

### v2.22.0 · 24 May 2026 — *Live board pipeline and Initiative refresh*

The Google Form board pipeline goes live (identity-key dedup, `photoOverride` hatch for the Forms file-upload edit limitation, descriptive auto-PR titles + rich Markdown bodies, multi-submission workflow). `/board` is rebuilt around three sections (Leadership · Board Members · Support Staff) with bio teaser + Read-more, functional-responsibility pill, ESSC-speaker mic, country flag glued inline to the institution. `/initiative` is redesigned to read as concrete activities + numbers + people (stats row, four activity tiles, leadership + flag strip, 2017 AEGES origin paragraph, compact CTA). Programme grid carries colour-coded room pills. `/2026` venue embeds a Google Map. Version jumps from v2.13.0r straight to v2.22.0 because GitHub's immutable-releases tombstones permanently reserve every tag name once attached to a release, so the entire v2.14.0 → v2.21.0 range is burned by the retroactive renumber. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.22.0)

### v2.10.1 · 22 May 2026 — *Live programme grid polish and parallel panels* <small>(originally v2.14.2)</small>

Post-launch polish on the v2.10.0r grid. ESSC concurrent panels now render side-by-side under a shared time gutter on wide viewports. Roundtable cards drop the misleading *View papers* expander and promote discussants to a top-level meta line. Contribution URLs were absolutised, PDF subtitle separator spacing was fixed, and Indico's idiosyncratic break classification was tamed. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.10.1)

### v2.10.0r · 22 May 2026 — *Live programme grid (Indico as authoritative source)* <small>(originally v2.14.0)</small>

Headline of the day. The conference programme on `/2026` is now two views over a single authoritative source: a live grid pulled daily from Indico (sessions, contributions, speakers, abstracts) and an optional polished PDF the designer publishes alongside it. Design rationale documented at `docs/indico-programme-integration.md`, written to be transferable to the NetSec site when we wire the same pattern there. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.10.0r)

### v2.9.1 · 22 May 2026 — *Indico API probe round 2* <small>(originally v2.13.0)</small>

Second iteration of the manual probe workflow used to discover which Indico endpoint exposes registration-form state. Round 1 narrowed the field to the legacy `/export/` API. Round 2 added schema inspection for 200-OK JSON responses and verbatim body preview for tiny responses, decisive enough to confirm that authenticated `/export/` doesn't actually unlock registration state on this Indico build. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.9.1)

### v2.9.0r · 22 May 2026 — *Indico API probe (manual)* <small>(originally v2.12.0)</small>

Read-only `workflow_dispatch` workflow that hits a curated list of candidate Indico URLs and reports status codes + content-types only, with no response bodies. Built to take the guesswork out of writing production code against an undocumented API surface. Folded a small `datetime.utcnow()` Python 3.12 deprecation fix into the same PR. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.9.0r)

### v2.8.0r · 22 May 2026 — *Authenticated Indico sync pipeline* <small>(originally v2.11.0)</small>

Plumbing for an optional `INDICO_API_TOKEN`. The sync script reads it from env, attaches a `Authorization: Bearer …` header to opted-in calls, and falls back to anonymous mode when the secret is absent. The token is never logged. Only a startup mode banner reports `authenticated` / `anonymous`. Operator setup documented end-to-end at `docs/indico-api-token.md`. Followed by a hotfix (originally v2.11.1) once we discovered the legacy `/export/*` endpoints reject Bearer auth with 400. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.8.0r)

### v2.7.1 · 22 May 2026 — *Type-field-first detection* <small>(originally v2.10.0)</small>

Switched the livestreamed-sessions classifier to prefer Indico's session `Type` dropdown (Round Table / Plenary / Closed Panel / …) over freeform session codes. The bulk timetable export doesn't include Type, so the sync now fetches each session's detail endpoint (`~25 extra HTTP calls per daily run`, cached by `sessionId`), which is anonymous, small, and fine. Session codes remain as a fallback when Type is unset. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.7.1)

### v2.7.0r · 22 May 2026 — *Livestreamed sessions (intro + roundtables + keynote + closing)* <small>(originally v2.9.0)</small>

The live block on `/2026` was renamed "Livestreamed sessions" and extended to include roundtables. Detection accepts `sessionCode` in `{INTRO, RT, KEY, CONC}` or a `Roundtable:` title prefix as a safety net. For 2026 this surfaces four rows in programme order, each ready to swap its "Online room TBA" placeholder for a real "Join online" CTA as Indico publishes Zoom links. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.7.0r)

### v2.6.1 · 22 May 2026 — *Intro + concluding plenaries on /2026* <small>(originally v2.8.0)</small>

Extended the live block from keynotes-only to surface introduction and closing plenary sessions too, the full plenary spine of the conference. Each row gains a small `Introduction` / `Keynote` / `Closing` eyebrow so attendees can scan the type at a glance. Localised in EN / FR / DE. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.6.1)

### v2.6.0r · 22 May 2026 — *Registration override and live keynotes* <small>(originally v2.7.0)</small>

Two follow-ups after v2.5.0r met production: a manual `registrationStatus` override on each conference entry in `conferences.js` (because Indico's anonymous API doesn't expose form state and the date-only logic was wrong by months), and a live keynote-sessions block above the static PDF programme on `/2026`. Keynotes carry an "Online room TBA" placeholder until Indico publishes Zoom links, swapped automatically by the next sync. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.6.0r)

### v2.5.1 · 22 May 2026 — *Footer cleanup and authorship credit* <small>(originally v2.6.0)</small>

Light footer trim (image credits and legal status collapsed from two paragraphs into one fine-print line), plus a discreet authorship credit on the very last row: *Site designed and built by [Dr Arthur PB Laudrain](https://eiss-europa.com/board.html#arthur-laudrain)*, locale-aware. Anchored on a new opt-in `slug` field in `board.json` so future board members can deep-link in the same pattern. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.5.1)

### v2.5.0r · 22 May 2026 — *Announcement card data-driven and registration status badge* <small>(originally v2.5.0)</small>

Two pieces. (1) The homepage NetSec announcement card moved from three hand-edited templates into `src/_data/announcement.js`, so rotating the news item is now a one-file edit. (2) A glassy registration-status pill in the `/2026` hero reflects today vs. the conference dates: *Registration open* / *Happening now* / *Past edition*. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.5.0r)

Earlier releases (v1.0 → v2.4.0r, all `r`-suffixed for the renumber) covered the site migration off Mobirise: i18n plumbing + FR/DE chrome (originally v2.0, now v2.0.0r), Tier 1 + Tier 2 page translations (v2.1 → v2.1.0r), localised share cards (v2.2 → v2.2.0r), conference cycle automation (v2.3 → v2.3.0r), Indico API sync for members' events on `/index` + `/events` (v2.4 → v2.4.0r). Full list on [GitHub Releases](https://github.com/EISSeuropa/EISSeuropa.github.io/releases). The original-tag → renumbered-tag mapping is documented in the *Originally tagged as …* footer of each `CHANGELOG.md` section.

---

_This document lives in the repo. Treat it as a living plan: revise
freely as priorities shift. The git history tracks changes._
