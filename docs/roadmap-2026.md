# EISS website: Rest-of-2026 roadmap

A planning document written to help the maintainer
think through what's worth doing next, in what order, and at what
effort. **Last update: 26 May 2026, after v2.23.0.**

<!-- AUTOSTAMP:BEGIN -->
> _Auto-tracked: **14 entries** in [`[Unreleased]`](../CHANGELOG.md#unreleased) since **v2.23.0** (1 Added, 9 Changed, 1 Removed, 3 Fixed). Last refresh by `scripts/sync-roadmap.py`: 27 May 2026. Prose in the timeline below may lag; the maintainer resynthesises on release-time §5 sweep._
<!-- AUTOSTAMP:END -->

> **Sync convention.** This file is the source of truth. The block
> above between `<!-- AUTOSTAMP:BEGIN -->` markers is machine-managed
> by `scripts/sync-roadmap.py` (fires from
> `.github/workflows/sync-roadmap.yml` on every push that touches
> `CHANGELOG.md`, plus a weekly Monday 06:00 UTC belt-and-braces run).
> The count surfaces staleness, the maintainer decides when the
> prose timeline below needs a refresh (release-time §5 cross-check
> per `CLAUDE.md`).

Effort notation:

- **S** — under 2 hours of focused work (one short Claude session)
- **M** — half-day to one day (one longer Claude session)
- **L** — multi-day or requires external input (translators, design,
  Indico API access, etc.)

Priority notation:

- **P0** — should happen next; activation of work already built
- **P1** — high value, no blocker, would land in next 1–2 months
- **P2** — nice to have, would land in late 2026
- **P3** — explicitly deferred to 2027+

Dependencies on people / external systems are flagged in line.

---

## Release history

Each tagged release at a glance — what landed, when, and the GitHub
Release link. Convention borrowed from the NetSec website's roadmap;
each entry is one short paragraph framing the release, followed by
bullets only when there are several distinct pieces. Patch releases
get a single line.

**Versioning rules**: see the *Versioning* section of
[`README.md`](../README.md) for the canonical definition of what
counts as MAJOR / MINOR / PATCH. `scripts/release.sh` enforces the
process; `CHANGELOG.md` accumulates the entries between releases. One
PR is *not* one release — PRs add to `[Unreleased]`; releases get
cut at milestones.

### v2.23.0 · 26 May 2026 — *Brand identity and Initiative depth*

The designer's EISS lockup replaces the placeholder "E" gradient tile across every header, every footer, the favicon (brand-blue rounded square with a simplified 4-dot constellation), the Apple touch icon, the Android adaptive icon, and the PWA manifest. The Schema.org `Organization.logo` JSON-LD upgrades from a stale Mobirise-era JPEG to the new high-res brand PNG with explicit dimensions and `foundingDate: "2017"`. `/initiative` deepens into a complete founding story: founder pull-quote + two founding objectives + "Filling a gap" framing, an ESSC flagship section with a 10-card grid of every annual edition, a Natural-Earth-projected host-city map, a research-themes pill row, expanded origins prose, and a *First conference* facts aside. `/board` formalises the EISS community as a first-class section with auto-expiring intern entries (19 past interns backfilled with affiliations) and a mobile photo-drop. Operator + CI conventions imported from the sister `netsec.github.io` repo: `CLAUDE.md` operator playbook, full `SECURITY.md`, hybrid CHANGELOG preamble, a `sync-roadmap.py` autostamp pattern keeping the freshness count on this very file refreshed automatically, and a `check-links.sh` workflow walking `_site/**/*.html` on every PR + Monday cron. ESSC map projection corrected for cos(latitude) so Europe no longer renders squat, plus theme-toggle blindness, label overlap, and mobile tap targets fixed. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.23.0)

### v2.22.0 · 24 May 2026 — *Live board pipeline and Initiative refresh*

The Google Form board pipeline goes live (identity-key dedup, `photoOverride` hatch for the Forms file-upload edit limitation, descriptive auto-PR titles + rich Markdown bodies, multi-submission workflow). `/board` is rebuilt around three sections (Leadership · Board Members · Support Staff) with bio teaser + Read-more, functional-responsibility pill, ESSC-speaker mic, country flag glued inline to the institution. `/initiative` is redesigned to read as concrete activities + numbers + people (stats row, four activity tiles, leadership + flag strip, 2017 AEGES origin paragraph, compact CTA). Programme grid carries colour-coded room pills; `/2026` venue embeds a Google Map. Version jumps from v2.13.0r straight to v2.22.0 because GitHub's immutable-releases tombstones permanently reserve every tag name once attached to a release — the entire v2.14.0 → v2.21.0 range is burned by the retroactive renumber. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.22.0)

### v2.10.1 · 22 May 2026 — *Live programme grid polish and parallel panels* <small>(originally v2.14.2)</small>

Post-launch polish on the v2.10.0r grid. ESSC concurrent panels now render side-by-side under a shared time gutter on wide viewports; roundtable cards drop the misleading *View papers* expander and promote discussants to a top-level meta line; contribution URLs were absolutised; PDF subtitle separator spacing was fixed; Indico's idiosyncratic break classification was tamed. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.10.1)

### v2.10.0r · 22 May 2026 — *Live programme grid (Indico as source of truth)* <small>(originally v2.14.0)</small>

Headline of the day. The conference programme on `/2026` is now two views over a single source of truth: a live grid pulled daily from Indico (sessions, contributions, speakers, abstracts) and an optional polished PDF the designer publishes alongside it. Design rationale documented at `docs/indico-programme-integration.md`, written to be transferable to the NetSec site when we wire the same pattern there. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.10.0r)

### v2.9.1 · 22 May 2026 — *Indico API probe round 2* <small>(originally v2.13.0)</small>

Second iteration of the manual probe workflow used to discover which Indico endpoint exposes registration-form state. Round 1 narrowed the field to the legacy `/export/` API; round 2 added schema inspection for 200-OK JSON responses and verbatim body preview for tiny responses, decisive enough to confirm that authenticated `/export/` doesn't actually unlock registration state on this Indico build. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.9.1)

### v2.9.0r · 22 May 2026 — *Indico API probe (manual)* <small>(originally v2.12.0)</small>

Read-only `workflow_dispatch` workflow that hits a curated list of candidate Indico URLs and reports status codes + content-types only — no response bodies. Built to take the guesswork out of writing production code against an undocumented API surface. Folded a small `datetime.utcnow()` Python 3.12 deprecation fix into the same PR. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.9.0r)

### v2.8.0r · 22 May 2026 — *Authenticated Indico sync pipeline* <small>(originally v2.11.0)</small>

Plumbing for an optional `INDICO_API_TOKEN`. The sync script reads it from env, attaches a `Authorization: Bearer …` header to opted-in calls, and falls back to anonymous mode when the secret is absent. The token is never logged — only a startup mode banner reports `authenticated` / `anonymous`. Operator setup documented end-to-end at `docs/indico-api-token.md`. Followed by a hotfix (originally v2.11.1) once we discovered the legacy `/export/*` endpoints reject Bearer auth with 400. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.8.0r)

### v2.7.1 · 22 May 2026 — *Type-field-first detection* <small>(originally v2.10.0)</small>

Switched the livestreamed-sessions classifier to prefer Indico's session `Type` dropdown (Round Table / Plenary / Closed Panel / …) over freeform session codes. The bulk timetable export doesn't include Type, so the sync now fetches each session's detail endpoint (`~25 extra HTTP calls per daily run`, cached by `sessionId`) — anonymous, small, fine. Session codes remain as a fallback when Type is unset. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.7.1)

### v2.7.0r · 22 May 2026 — *Livestreamed sessions (intro + roundtables + keynote + closing)* <small>(originally v2.9.0)</small>

The live block on `/2026` was renamed "Livestreamed sessions" and extended to include roundtables. Detection accepts `sessionCode` in `{INTRO, RT, KEY, CONC}` or a `Roundtable:` title prefix as a safety net. For 2026 this surfaces four rows in programme order, each ready to swap its "Online room TBA" placeholder for a real "Join online" CTA as Indico publishes Zoom links. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.7.0r)

### v2.6.1 · 22 May 2026 — *Intro + concluding plenaries on /2026* <small>(originally v2.8.0)</small>

Extended the live block from keynotes-only to surface introduction and closing plenary sessions too — the full plenary spine of the conference. Each row gains a small `Introduction` / `Keynote` / `Closing` eyebrow so attendees can scan the type at a glance. Localised in EN / FR / DE. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.6.1)

### v2.6.0r · 22 May 2026 — *Registration override and live keynotes* <small>(originally v2.7.0)</small>

Two follow-ups after v2.5.0r met production: a manual `registrationStatus` override on each conference entry in `conferences.js` (because Indico's anonymous API doesn't expose form state and the date-only logic was wrong by months), and a live keynote-sessions block above the static PDF programme on `/2026`. Keynotes carry an "Online room TBA" placeholder until Indico publishes Zoom links, swapped automatically by the next sync. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.6.0r)

### v2.5.1 · 22 May 2026 — *Footer cleanup and authorship credit* <small>(originally v2.6.0)</small>

Light footer trim — image credits and legal status collapsed from two paragraphs into one fine-print line — plus a discreet authorship credit on the very last row: *Site designed and built by [Dr Arthur PB Laudrain](https://eiss-europa.com/board.html#arthur-laudrain)*, locale-aware. Anchored on a new opt-in `slug` field in `board.json` so future board members can deep-link in the same pattern. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.5.1)

### v2.5.0r · 22 May 2026 — *Announcement card data-driven and registration status badge* <small>(originally v2.5.0)</small>

Two pieces. (1) The homepage NetSec announcement card moved from three hand-edited templates into `src/_data/announcement.js` — rotating the news item is now a one-file edit. (2) A glassy registration-status pill in the `/2026` hero reflects today vs. the conference dates: *Registration open* / *Happening now* / *Past edition*. [Release notes →](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.5.0r)

Earlier releases (v1.0 → v2.4.0r, all `r`-suffixed for the renumber) covered the site migration off Mobirise: i18n plumbing + FR/DE chrome (originally v2.0, now v2.0.0r), Tier 1 + Tier 2 page translations (v2.1 → v2.1.0r), localised share cards (v2.2 → v2.2.0r), conference cycle automation (v2.3 → v2.3.0r), Indico API sync for members' events on `/index` + `/events` (v2.4 → v2.4.0r). Full list on [GitHub Releases](https://github.com/EISSeuropa/EISSeuropa.github.io/releases); the original-tag → renumbered-tag mapping is documented in the *Originally tagged as …* footer of each `CHANGELOG.md` section.

---

## Status as of v2.23.0

Where the site stands today, so the roadmap below makes sense:

- **Stack**: Eleventy 3 + Nunjucks. GH Actions builds + deploys. No
  client-side framework. ~30 lines of hand-written JS for theme +
  mobile menu.
- **Pages**: 72 `.njk` templates including the FR / DE locales. All
  URLs preserved from the original Mobirise export. `src/legacy/`
  fully retired in v1.0.
- **Brand identity**: real EISS lockup (constellation + EiSS wordmark)
  deployed across header, footer, favicon, Apple touch icon, Android
  adaptive icon, PWA manifest, OG card watermark target. Schema.org
  `Organization.logo` points at the high-res brand PNG. Shipped in
  v2.23.0.
- **Design**: Apple-style glass, auto + manual dark mode, Inter font,
  reveal animations gated on `prefers-reduced-motion`. Brand-blue
  (`#007bc6`) is the canonical accent.
- **Accessibility**: WCAG 2.1 AA, axe-core clean across light + dark.
- **SEO**: full OG + Twitter Card meta, JSON-LD Organization with
  `ImageObject` logo + `foundingDate: "2017"`, per-page bespoke
  share cards (in all three languages), favicon stack, webmanifest,
  robots.txt + sitemap.xml.
- **Icons**: Lucide via `src/_includes/icons.njk` macro. Semantic
  vocabulary across the site (globe = international, map-pin =
  location, and so on).
- **i18n**: EN / FR / DE. Chrome strings in `src/_data/i18n.js`. 12+
  fully translated pages × 3 langs. Beta ribbon on FR/DE pages until
  native-speaker review. Drift detection in CI. A `localizedHref`
  filter on the Eleventy config falls cross-locale links back to the
  English page when the target locale doesn't exist (added in #168).
- **Board page**: driven by `src/_data/board.json`, Form-pipeline
  populated. Three sections (Leadership · Board Members · Support
  Staff) plus an *EISS community* footer for former members and past
  interns (auto-expiring via `roleEndDate` + 7-day grace).
- **Conference cycle**: driven by `src/_data/conferences.js`. The
  homepage "next conference" card and the `/past` archive list both
  read from this single data source. The cut-off between `next` and
  `past` advances automatically once a conference's end-date passes
  (daily-rebuild workflow keeps quiet weeks from getting stale).
- **Archive pages**: past-conference and past-workshop `.njk` pages
  carry `status: archive` in frontmatter, which renders a sticky
  grey banner above the nav. Sets expectations that the content
  won't be as polished as live pages.
- **Google Form board pipeline**: live. Weekly + on-demand sync via
  `scripts/sync-board.py`, opens auto-PR with rich descriptive body.
  Maintainer auto-assigned for notification.
- **Indico events sync**: `scripts/sync-indico.py` runs daily,
  writes upcoming-events to `src/_data/indico.json`. Homepage and
  `/events` show those events automatically. ESSC events filtered
  out (already in `conferences.js`). Live programme grid on `/2026`
  pulls the full ESSC programme.
- **Operator + CI conventions** (imported from `netsec.github.io`):
  `CLAUDE.md` operator playbook, full `SECURITY.md`, hybrid
  CHANGELOG format, roadmap autostamp via `sync-roadmap.py`, link
  checker on every PR + Monday cron.

---

## P0 — activate what's already built

These are the things sitting idle. Doing them turns existing code into
visible value.

### ~~Google Form for board bios — finally activate~~ — _done in v2.22.0_

The Google Form pipeline went live in v2.22.0. `scripts/sync-board.py`
+ `.github/workflows/sync-board.yml` now read the live Google Sheet,
diff against `src/_data/board.json`, and open a rich auto-PR with a
*What changed* summary. Identity-key dedup, `photoOverride` hatch for
the Forms file-upload edit limitation, multi-submission workflow,
maintainer auto-assigned on the PR for notification (#165). Operator
walkthrough in [`docs/board-bios-setup.md`](board-bios-setup.md).

### Native-speaker review pass on the 24 beta FR/DE pages

**Effort: L (per language — calendar time, not your hours)**
**Depends on: a native French speaker + a native German speaker.**

All 24 translated pages currently carry `status: "beta"` and a yellow
ribbon noting that the English version is authoritative. The legal
pages (`/policy`, `/terms`, `/accessibility`) carry a second inline
disclaimer for the same reason.

A volunteer from the board / membership who reads French (or German)
natively reviews one page, suggests edits, you apply them, flip
`status: "beta"` → `"reviewed"` in `data/i18n-state.json`, drop the
ribbon. Per [`docs/i18n.md`](i18n.md).

**Sequencing suggestion**: legal pages first (highest accuracy
requirement), then `/index` + `/initiative` + `/membership` (highest
traffic), then the rest.

---

## P1 — Socials integration

### YouTube embeds on conference archive pages

**Effort: M**

Several past conferences likely have YouTube recordings (the EISS
channel has a playlist). Embed the playlist or specific videos on
each `/202x.html` archive page — single `<iframe>` per page, sized
responsively. Plays through privacy-enhanced `youtube-nocookie.com`
embeds to avoid third-party cookie chatter.

Concrete change:

- New include `src/_includes/youtube-embed.njk` taking a video or
  playlist ID
- Drop into `/2025.html`, `/2024.html`, `/2023.html` where recordings
  exist
- Update `/policy.html` §5 with a note on the YouTube embed

Privacy posture: only loads the player when the user clicks the
poster image (lazy-load via `loading="lazy"` and ideally
[`lite-youtube-embed`](https://github.com/paulirish/lite-youtube-embed)
or its lighter-weight ~3 KB equivalent).

### LinkedIn cross-posting workflow (manual, gentle)

**Effort: S**

Not auto-post — but: every release tag could include a suggested
LinkedIn post in the GitHub release notes, copy-pasteable. Or a
`docs/announcements.md` with a template:

```
{conf name}, {date}, {city} ·
Final programme published at https://eiss-europa.com/{slug}.html ·
{eyebrow line}.
```

This is more of a habit than a feature. Adds zero infra. Could be a
small enhancement to the release-creation script (if we add one).

### Rel=me / Mastodon + Bluesky verification

**Effort: S**

Mastodon and Bluesky both support cross-verification via `rel="me"`
links. If EISS gets a Mastodon or Bluesky account, adding
`<a rel="me" href="https://mastodon.social/@EISSnetwork">` to the
footer lets that platform display a green checkmark next to the
EISS profile, proving the link is bidirectional.

Trivially small change. Add when (if) those accounts exist.

### Newsletter archive page

**Effort: M**

Currently the only newsletter touchpoint is the Mailchimp signup link.
A `/newsletter.html` page that lists past newsletter editions
(linking to the Mailchimp campaign archive) would let prospective
subscribers browse before signing up. Mailchimp publishes the archive
as a public URL — just iframe it or link out.

---

## ✅ Indico integration (basic) — shipped in v2.4.0

`indico.eiss-europa.com` runs the EISS event-management system. v2.4.0
adds a one-way read-only sync that surfaces Indico events on the static
site without changing the source of truth (events are still managed in
Indico — the website just signposts them).

**What landed:**

- **`scripts/sync-indico.py`** — fetches the public-export API
  (`/export/categ/0.json?from=today&to=<today+18mo>`), filters out
  Annual Conferences (already driven by `src/_data/conferences.js`),
  writes the rest to `src/_data/indico.json`. Anonymous access — no
  API token needed.
- **`.github/workflows/sync-indico.yml`** — daily cron at 03:45 UTC
  + `workflow_dispatch`. Uses direct-to-master commits (unlike
  `sync-board.yml`'s PR pattern) because the data is already
  fully public on Indico; human review adds nothing.
- **`src/_includes/indico-events-list.njk`** — shared partial. Renders
  the upcoming-events list as styled rows; hides the entire section
  when `indico.upcoming` is empty.
- **Surfaces on the site:** homepage shows up to 5 upcoming events
  beneath the featured-conference card; `/events.html` shows the full
  list above the existing format tiles. Both pages in EN / FR / DE.
- **i18n catalog:** new `indicoEvents.*` keys in all three languages.

**Current real-world state:** Indico has 1 upcoming event (ESSC 2026)
which is filtered out as an Annual Conference. Once Members' Events
get published to Indico, they'll appear within ~24h.

### ✅ Conference registration status indicator — shipped in v2.5.0

On `/2026.html` (and any future `/YYYY.html`), a glassy pill in the
hero now shows one of three states based on today's date vs. the
conference dates in `src/_data/conferences.js`:

- **Registration open** — green dot + "Register on Indico" CTA
- **Happening now** — pulsing red dot + "View on Indico"
- **Past edition** — neutral pill (no link unless Indico still has the page)

Implementation:
- `scripts/sync-indico.py` v2.5 now routes Annual Conference events
  (categoryId 1) into a separate `annualConferences = {year: event}`
  bucket in `src/_data/indico.json`, instead of dropping them.
- `src/_data/conferences.js` exposes a new `byYear` lookup.
- The badge logic lives in `src/_includes/registration-badge.njk`.
  Year pages pass `{% set year = "2026" %}` and include the partial.
- i18n strings under `registrationBadge.*` in `src/_data/i18n.js`.
- CSS in `src/assets/css/site.css` under `/* registration-status badge */`.

The attendee count was dropped from the initial spec — Indico's
anonymous export doesn't expose registration counts without auth, and
the CTA pill already communicates the actionable status. If we ever
add an authenticated sync, attendee counts can be appended trivially.

### Board member → Indico profile links

**Effort: M**

If board members have Indico profiles, link the photo card on
`/board.html` to their profile URL. Requires adding an `indicoId`
field to each entry in `board.json` (or the Google Form). Then
`board.njk` wraps the photo in `<a href="https://indico.eiss-europa.com/user/{id}">`.

Low priority — most users won't follow these links. Worth it for
the consistency more than the traffic.

---

## P1 — NetSec integration & signposting

[NetSec](https://netsec-cost.eu/) is the sister COST Action where
EISS hosts the Chair. Currently the EISS site links to it from a few
places (homepage announcement card, programmes index, footer).

### Co-branding strip on shared events

**Effort: M**

When an event involves both EISS and NetSec (which all 2026+
conferences will, given the COST Action), show a small "Jointly
organised with" strip on the relevant page. Currently this is in the
page prose; making it a structured component would:

- Standardise the visual treatment
- Allow easy iteration ("Jointly organised with NetSec + Stockholm
  University")
- Let it appear in the homepage hero too

New include `src/_includes/joint-orgs.njk` taking a list. Style as a
horizontal row of small institutional logos.

### Cross-link news

**Effort: S**

When the netsec-cost.eu site publishes a news item relevant to EISS
members (e.g. a Working Group call), cross-link from the EISS
homepage announcement card. Currently the announcement is hardcoded
in `src/index.njk`.

A small enhancement: move the announcement to a data file
(`src/_data/announcement.js`) so changes are a one-line edit. Could
later be Indico-driven or hand-edited.

### Shared design tokens (long-term)

**Effort: L**
**Depends on: agreement with NetSec.**

If both sites use the same EISS blue + Inter font + glass design,
publishing a tiny shared CSS bundle (or copy-pasting the design
tokens) would keep them visually coherent. Not urgent. Worth
mentioning to NetSec maintainers next time you sync.

---

## ✅ Conference-cycle automation — shipped in v2.3.0

The annual conference is the highest-touch artifact. Automating its
publication cycle saves work every year.

**Shipped:**

- **`src/_data/conferences.js`** — central data source for all
  conferences (2019 onward, structured entries with EN/FR/DE strings
  for venue, dates, organisers, archive meta line). Exposes
  `conferences.next` (the closest upcoming or in-progress) and
  `conferences.past` (everything whose end-date is past today).
- **Homepage + `/past` refactor** — the "Next conference" featured
  card on `/index.{en,fr,de}.html` and the archive list on
  `/past.{en,fr,de}.html` both iterate over the data file. Two
  hardcoded conference blocks in three languages each (twelve
  blocks total) collapsed into one data file plus two short
  templates.
- **Auto cut-off** — entries move from `next` → `past` automatically
  on the first build after their `endDate`. No manual edit needed
  when a conference ends.
- **Daily scheduled rebuild** — `.github/workflows/scheduled-rebuild.yml`
  fires every day at 04:15 UTC and dispatches the deploy workflow.
  Conferences transition within ~24 hours of their end date even on
  quiet weeks with no commits.
- **`docs/new-conference.md`** — playbook for the next conference year.
  Adding `/2027.html` is now: add one object to `conferences.js`, copy
  `2026.njk` for the content, add one entry to `make-share-cards.py`,
  run the drift-mark-fresh command. ~30 minutes total, no template
  spelunking.

**Out of scope** (still hand-managed, by design):

- The unique content of each `/<year>.html` page (programme, venue
  description, neighbourhood tile grid, partner logos, funding
  attribution). Too much per-conference variation to template.
- 2017 and 2018 — kept in the historical-image section at the bottom
  of `/past.html` because they predate the standalone-page convention.

---

## P2 — Quality-of-life features

### Site search

**Effort: M**

Currently no search. For a ~50-page site with mostly static content,
a client-side search index (e.g. [Pagefind](https://pagefind.app/))
would add a search box at very low cost — no backend, no service fee.
Built at deploy time into `_site/pagefind/`, ~200 KB of JS pulled
in only when the user opens the search modal.

Worth considering when content volume grows; right now you can
honestly find any page from the nav or sitemap.

### ~~Print stylesheet for conference programmes~~ — _shipped in v2.17.0_

Print CSS for `/YYYY` pages went in as the v2.17.0 release. Cmd+P
on the conference page now drops nav, footer, beta ribbon, archive
ribbon, livestream block, and social buttons. Expands the programme
grid into a paper-friendly single-column flow with sensible page
breaks. Page 1 carries a full cover masthead, pages 2+ get a thin
running header and a bottom-right page counter (locale-aware).

### Conference countdown widget

**Effort: S**

Small pure-CSS-or-1-line-JS widget on `/index.html` and `/2026.html`:
"73 days until ESSC 2026". Could appear in the hero or as a quiet
note near the date. Updates automatically without any data feed.

### Page transitions via View Transitions API

**Effort: S**

The View Transitions API is now stable in Chromium-based browsers
and shipping in Safari/Firefox. A handful of lines in `base.njk`
would give smooth crossfades between pages — Apple-style polish.
Progressive enhancement; older browsers see today's behaviour.

### Acknowledgments / contributors page

**Effort: S**

A `/acknowledgments.html` listing institutional partners, funders,
and contributors (with photo/logo permissions clarified). Currently
some of this is in the footer fineprint; surfacing it dedicated
helps with sponsorship outreach and recognition.

---

## P2 — Cleanups

### ~~Stale README~~ — _swept_

The stale `src/legacy/` references were removed, the repo-layout
diagram refreshed, the §Versioning "next bump" line updated to
reflect v2.23.0 having shipped, and pointers added to the new
root-level docs (`CLAUDE.md`, `SECURITY.md`, `docs/`).

### macOS Finder duplicate files in the repo root

**Effort: S**

`README 2.md`, `.eleventy 2.js`, `package 2.json`, `.gitignore 2`,
`board 2.html`, etc. — gitignored, but they exist on your local
checkout. Add `* 2.*` and `* 3.*` to `.gitignore` and rm the existing
ones. One-shot cleanup. Won't affect the site or CI; just tidies
your local view.

### Unused assets in `src/assets/images/`

**Effort: S**

A few images are no longer referenced from any `.njk`. A quick
`grep -r "image-name"` pass identifies them. Removing them shrinks
the deployed `_site/` modestly and the repo more substantially.
Don't delete photos with potential historical/sentimental value
(conference group shots, etc.) without checking.

### ~~Consolidate `scripts/`~~ — _done_

`extract_legacy.py` and `extract_prose.py`, two Mobirise-era
utility scripts, were retired in
[#170](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/170)
after CodeQL flagged their `<script>` / `<style>` regex patterns
as vulnerable to the classic bad-tag-filter bypass. Both scripts
targeted `src/legacy/`, which itself was retired in v1.0; nothing
referenced them. `a11y_lint.py` stays as the useful survivor.

### Accessibility statement: tighten the audit date

**Effort: S**

The accessibility page says "axe-core was run on 14 May 2026". After
each significant template change, that audit should be re-run and
the date refreshed (or the text revised to "axe-core runs as a
pre-commit lint, last full report 14 May 2026").

### a11y_lint.py: catch more issues

**Effort: M**

Current lint catches basic alt-text / heading-structure issues. Could
extend to:
- Form-label associations
- Skip-link presence
- Lang attribute on `<html>`
- Open Graph required fields
- hreflang correctness (matches `i18n-state.json`)

---

## P3 — explicitly deferred to 2027+

These came up while thinking through the roadmap but I'd hold off:

### Custom domain emails (e.g. board-individual@eiss-europa.com)

Out of scope for the website. Goes through your email provider
(Google Workspace / Fastmail / etc.), not GitHub Pages.

### Replacing Mailchimp with self-hosted newsletter

Mailchimp's free tier is fine, GDPR-compliant, and removes from your
shoulders. Self-hosting (Listmonk, etc.) would save €0 and add
infrastructure. Don't.

### Multi-author CMS / admin UI

You and 2-3 maintainers can edit JSON / Markdown in GitHub directly
via the web editor. Adding a Netlify CMS or similar adds complexity
without removing meaningful friction.

### Analytics integration

The privacy policy explicitly states "no analytics" and that's a
strong positioning choice for an academic security network. Don't
revisit unless there's a specific question only analytics can
answer (and even then, prefer the GitHub Pages access logs aggregated
by GitHub itself).

### Multi-page member directory (like NetSec's /people.html)

EISS has ~22 board members in a static page. The full membership
list is in Stripe / Indico, not appropriate to publish. NetSec's
member directory makes sense because the COST Action grant
specifically asks for visibility of researchers; EISS doesn't have
that pressure.

### Conference paper repository / proceedings hosting

If the COST Action publishes proceedings, they go on Zenodo
(EU-hosted, OAI-compliant). The EISS site links out; doesn't host.

### Reverse-proxy custom domain for indico.eiss-europa.com

The Indico instance is already at the right subdomain. Don't fuss.

---

## Suggested ordering

A rough calendar, but skip/swap as needed:

**Now → June 2026** (mostly activating what's built)

- ~~P0: Google Form for board bios~~ — **done** in v2.22.0
- Cleanups: ~~stale README~~ (swept), macOS duplicate files, unused assets
- ~~P1: NetSec announcement card → data-driven~~ — **done** in v2.5.0
- ~~P2: print stylesheet on /2026.html~~ — **done** in v2.17.0

**June → August 2026** (post-ESSC 2026)

- P0: Native-speaker review pass — start with legal pages
- P1: YouTube embeds on archive pages (2025, 2024, 2023 first)
- ~~P1: Conference cycle automation~~ — **done** in v2.3.0
- P2: Conference countdown widget

**September → November 2026**

- ~~P1: Indico API integration~~ — **done** in v2.4.0 (basic sync) + v2.5.0 (registration-status badge)
- P1: NetSec co-branding strip standardised
- P2: View Transitions API
- P2: a11y_lint.py extensions

**December 2026 → January 2027** (ESSC 2027 prep)

- P1: ESSC 2027 announcement — drop one entry into
  `src/_data/conferences.js`, follow `docs/new-conference.md`. Now
  a ~30-minute job rather than a multi-page hand-edit.
- P0: refresh accessibility audit + update date
- P1: Newsletter archive page if Mailchimp still hosting

---

_This document lives in the repo. Treat it as a living plan: revise
freely as priorities shift. The git history will track changes._
