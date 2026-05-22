# EISS website — rest-of-2026 roadmap

A planning document, not a commitment. Written to help the maintainer
think through what's worth doing next, in what order, and at what
effort. **Last update: 22 May 2026, after v2.4.0.**

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

## Status as of v2.4.0

Where the site stands today, so the roadmap below makes sense:

- **Stack** — Eleventy 3 + Nunjucks. GH Actions builds + deploys.
  No client-side framework. ~30 lines of hand-written JS for theme
  + mobile menu.
- **Pages** — 47 modernised templates. Last 5 Mobirise/AMP files
  retired in v1.0; `src/legacy/` is empty. All URLs preserved from
  the original export.
- **Design** — Apple-style glass, auto + manual dark mode, Inter font,
  reveal animations gated on `prefers-reduced-motion`.
- **Accessibility** — WCAG 2.1 AA, axe-core clean across light + dark.
- **SEO** — full OG + Twitter Card meta, JSON-LD Organization,
  per-page bespoke share cards (in all three languages), favicon stack,
  webmanifest, robots.txt + sitemap.xml.
- **Icons** — Lucide via `src/_includes/icons.njk` macro. Semantic
  vocabulary across the site (globe = international, map-pin =
  location, etc.).
- **i18n** — EN / FR / DE. Chrome strings in `src/_data/i18n.js`;
  12 fully translated pages × 3 langs. Beta ribbon on FR/DE pages
  until native-speaker review. Drift detection in CI.
- **Board page** — driven by `src/_data/board.json` (data-driven loop
  in `src/board.njk`). Member entries hand-edited today, will be
  Form-driven once activated.
- **Conference cycle** — driven by `src/_data/conferences.js`. The
  homepage "next conference" card and the `/past` archive list both
  read from this single data source; the cut-off between `next` and
  `past` advances automatically once a conference's end-date passes
  (daily-rebuild workflow keeps quiet weeks from getting stale).
- **Google Form pipeline** — built, dormant. `scripts/sync-board.py` +
  `.github/workflows/sync-board.yml` will write to `board.json` from
  a Form-linked Sheet, once `csv_url` is filled in.
- **Indico events sync** — `scripts/sync-indico.py` runs daily, writes
  the upcoming-events list to `src/_data/indico.json`. Homepage and
  `/events` show those events automatically; the section hides if
  none are pending. ESSC events filtered out (already in
  `conferences.js`).

---

## P0 — activate what's already built

These are the things sitting idle. Doing them turns existing code into
visible value.

### Google Form for board bios — finally activate

**Effort: M (mostly your time — Google Forms UI)**
**Depends on: you.**

Pipeline (`scripts/sync-board.py`, `.github/workflows/sync-board.yml`,
`scripts/board-source.json`) has been built since [PR #22] and updated
in #32. While `csv_url` is empty the workflow runs but no-ops cleanly.

Step-by-step in [`docs/board-bios-setup.md`](board-bios-setup.md).
Roughly: create the Google Form (8 questions in a specific order),
link it to a Sheet, publish the Sheet as CSV, drop the URL into
`scripts/board-source.json`. Then the script can produce PRs against
`src/_data/board.json` on demand.

**Why P0**: smallest activation cost of any pending work; gives every
board member a one-time link to keep their bio fresh without you
hand-editing JSON.

[PR #22]: https://github.com/EISSeuropa/EISSeuropa.github.io/pull/22

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

### ⏳ Conference registration status indicator (P1, deferred to v2.5+)

**Effort: M**

On `/2026.html` and `/membership.html`, show a small badge:
- "Registration open · {N} attendees"
- "Registration closed"

Pulled from the same Indico data. Updates on every workflow run.
Needs more API exploration to confirm what fields are returned for
the EISS conference type — defer to v2.5.

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

### Print stylesheet for conference programmes

**Effort: S**

The 2026 programme PDF is the canonical printable artefact, but a
print CSS rule (`@media print`) on `/2026.html` would let users
hit Cmd+P and get a clean two-page summary. Hides nav, footer,
beta ribbon; flattens the PDF embed; tunes margins.

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

### Stale README

**Effort: S**

`README.md` line 53 still says "5 ticket-* URLs remain on legacy
passthrough" — they were retired in v1.0 (PR #23). Sweep for similar
stale claims after each release.

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

### Consolidate `scripts/`

**Effort: S**

`a11y_lint.py`, `extract_legacy.py`, `extract_prose.py` are utility
scripts from the migration. The first is still useful, the latter
two are likely dead. Audit, remove the dead ones, document the
survivors in `scripts/README.md`.

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

- P0: Google Form for board bios
- Cleanups: stale README, macOS duplicate files, unused assets
- P1: NetSec announcement card → data-driven (small win)
- P2: print stylesheet on /2026.html (before the conference)

**June → August 2026** (post-ESSC 2026)

- P0: Native-speaker review pass — start with legal pages
- P1: YouTube embeds on archive pages (2025, 2024, 2023 first)
- ~~P1: Conference cycle automation~~ — **done** in v2.3.0
- P2: Conference countdown widget

**September → November 2026**

- ~~P1: Indico API integration~~ — **done** in v2.4.0 (basic sync; registration-status badge still pending v2.5)
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

## Things I'd love to know before next iteration

A short list — would inform what to prioritise:

1. **Indico API access** — is there an existing admin token, or
   would you need to create one? Determines whether Indico
   integration is M or L.
2. **NetSec maintainer overlap** — am I (Claude) able to also push
   changes to `netsec.github.io`, or is that a separate
   coordination? Determines whether shared-design-tokens makes sense.
3. **Board enthusiasm for translations** — do you have specific
   French- or German-speaking board members who'd review the beta
   translations? Without that, the beta ribbons stay for a while.
4. **Conference photography** — do conferences typically get a
   group photo + venue shots? Those would lift the share cards
   from typographic-only to photo-based for v2.3.
5. **Sponsorship visibility expectations** — does COST require
   specific logo placement for the NetSec funding? Today the
   "Funded by the European Union" image is on `/2026.html`; might
   need to surface on more pages.

No rush on any of these — write me back when convenient.

---

_This document lives in the repo. Treat it as a living plan: revise
freely as priorities shift. The git history will track changes._
