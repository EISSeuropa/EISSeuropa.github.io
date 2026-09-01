# EISS website: 2026 roadmap

A planning document to help the maintainer think through what's worth
doing next, in what order, and at what effort. Organised by **release
version** (SemVer), the same axis as the GitHub milestones and the
public [`/roadmap.html`](https://eiss-europa.com/roadmap.html).
**Last update: 1 September 2026 (resynchronised with v2.27.0 and
v2.28.0 after the autostamp flagged the drift, #1619).**

<!-- AUTOSTAMP:BEGIN -->
> _Auto-tracked: **3 entries** in [`[Unreleased]`](../CHANGELOG.md#unreleased) since **v2.28.0** (1 Changed, 1 Removed, 1 Fixed). Last refresh by `scripts/sync-roadmap.py`: 1 Sep 2026. Prose in the timeline below may lag; the maintainer resynthesises on release-time §5 sweep._
<!-- AUTOSTAMP:END -->

> **Sync convention.** This file is the authoritative planning source.
> The block above between `<!-- AUTOSTAMP:BEGIN -->` markers is
> machine-managed by `scripts/sync-roadmap.py`, which
> `.github/workflows/roadmap-refresh.yml` runs once a day at 05:00 UTC
> alongside the milestone-progress refresh, in a single auto-merged PR.
> `scripts/release.sh` runs it too, so a release never ships a stale stamp.
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
| v2.26.0 | 25 Jun 2026 | **Shipped** | Introducing the Anthology |
| v2.27.0 | 19 Aug 2026 | **Shipped** | The Anthology Atlas and the recovered back catalogue |
| v2.28.0 | 29 Aug 2026 | **Shipped** | A usable Atlas, and a citable theme vocabulary |
| v2.29.0 | 8 Dec 2026 | Planned | The corpus in French, and the data behind it |
| v2.30.0 | 30 Apr 2027 | Planned | ESSC 2027 programme and logistics |
| v2.31.0 | 11 Jun 2027 | Planned | ESSC 2027, and the archive rollover after it |

(`v2.24.1` was planned as a pre-ESSC patch but the work grew into a feature-rich minor, so it shipped as the **v2.25.0** *Ready for Stockholm* release instead; the `v2.24.1` milestone is closed as superseded.)

### ESSC 2027 preparation

The next European Security Studies Conference is jointly organised
with the COST Action NetSec and its host university. The joint
organising group met in August 2026 and meets again on 7 September
2026 to settle the panels and the roundtables. Dates and venue are
confirmed at that meeting, and this repository carries two different
placeholder editions until then (see issue #1522).

The prep work rides the release milestones rather than a calendar of
its own (CLAUDE.md §10), so each phase lands in whichever release is
open when its deadline falls. The deadlines themselves live in the
issues, and they are the organising group's, not ours.

| Release | Due | Conference work in it |
| --- | --- | --- |
| v2.29.0 | 8 Dec 2026 | *Save the date*, due 30 September: the edition settled and entered in `conferences.js` (#1522) · *Call for papers*, due 6 November: the parked 2027 page activated (#1524), the edition share cards generated (#1525), the call published and announced (#1526) · *Selection and notifications*, due 31 December: the prize jury confirmed and the terms published (#1527) |
| v2.30.0 | 30 Apr 2027 | *Programme and logistics*: programme content once the accepted papers are known (#1528) |
| v2.31.0 | 11 Jun 2027 | *The conference itself*: the archive rollover and the abstract pull afterwards (#1529) |

The phase names are the joint group's vocabulary and the NetSec
roadmap uses the same five, so a deadline can be named across the two
repositories without either of them minting a milestone for it.

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

### v2.26.0 — Introducing the Anthology · shipped 25 June 2026

Shipped as [v2.26.0 — Introducing the Anthology](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.26.0)
on 25 June 2026. The European Security Studies Anthology became the
site's flagship at `/anthology`, the unified home for every paper and
every scholar across nine editions, carried in the main navigation and
linked out to the NetSec member directory. Members' own published
research gained a dedicated `/publications` page, a `/prizes` page
landed for the European Security Studies Prize, and a round of polish
ran through the navigation, the share cards, the Initiative page and the
board. The post-conference content surfaces that did not make this cut
(the Working Groups page [#94](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/94),
the RSS feed [#605](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/605),
issue-driven news publishing [#634](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/634))
moved on to later milestones. See [`CHANGELOG.md`](../CHANGELOG.md) for the full index of changes.

### v2.27.0 — The Anthology Atlas and the recovered back catalogue · shipped 19 August 2026

The cycle outgrew its original "polish" framing and shipped as
[v2.27.0](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.27.0)
on 19 August 2026, ahead of the September target. What landed:

- **The Anthology Atlas** — a force-directed map of the corpus at
  `/anthology-atlas.html`, with a Papers lens (511 papers pulled toward
  the 17 research-theme hubs) and an Authors lens (co-authorship
  clusters across 494 deduplicated authors). Indexed, signposted from
  the Anthology header, with a first-visit welcome strip and a guided
  tour.
  [#1124](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1124),
  [#1129](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1129),
  [#1134](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1134).
- **The Anthology and the Atlas, wired together** — the map stopped
  being a standalone artefact. Paper pages gained related-paper
  suggestions and theme-tag links, the by-person view gained a
  co-author line, and the Atlas gained deep-linkable filter state, an
  abstract-coverage overlay, edition chips that separate the joint
  events from their calendar year, find-and-spotlight search, a
  visible list alternative for its canvas, and its own share card.
  [#1148](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1148),
  [#1149](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1149),
  [#1150](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1150),
  [#1151](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1151),
  [#1152](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1152),
  [#1153](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1153),
  [#1154](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1154),
  [#1155](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1155),
  [#1156](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1156).
- **The abstract back catalogue** — EISS 2026 coverage complete (69 of
  69), and the pre-Indico recovery well under way from the organisers'
  archives (2019, 2018, 2021, 2022, 2023 and the 2019 Joint Policy
  Workshop all gained abstracts). The Anthology header now shows
  per-year coverage at a glance.
  [#794](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/794),
  [#886](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/886),
  [#1040](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1040).
- **New pages and refreshed content** — the internship page
  (`/internship.html`, EN/FR/DE), the Global Risks 2026 survey wave on
  `/GlobalRisks`, the leadership announcement at
  `/leadership-2026.html`, and an Event filter on the Anthology's
  by-paper view.
- **From the original polish list, already shipped in-cycle** — the CSS
  class-collision guard
  ([#241](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/241)),
  expanded open-panel examples
  ([#249](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/249)),
  responsive images
  ([#554](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/554)),
  the brand-palette gradient re-tune
  ([#519](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/519)),
  and the legacy Mobirise redirects
  ([#607](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/607)).

The [v2.27.0 milestone](https://github.com/EISSeuropa/EISSeuropa.github.io/milestone/10)
closed with 129 issues in it and none open. Along the way nine were
reslipped to *Under watch* in one pass, each blocked on something
outside the release (repo settings, a statutes PDF, working-group names
nobody has written down), premature (attendee features that need an ESSC
2027 programme that does not exist yet), or resting on a premise that
had gone stale. Reasons are recorded per issue. Of what this section
last listed as still open, all but one shipped:

- **Per-paper theme derivation** — themes had been matched against a
  paper's *panel* title, so every paper in a panel inherited the same
  set and the whole corpus collapsed into 30 distinct theme
  combinations. Abstracts are read too now, so a paper is tagged for
  what it argues rather than for the room it was presented in: 91
  distinct combinations, and papers touching more than one theme rise
  from 56 to 131. The panel title stays the trusted prior and abstract
  evidence is additive, clearing a two-mention threshold, so the average
  holds at 1.28 themes per paper rather than becoming tag soup. The
  threshold mattered more than the coverage gain (the "confidence over
  coverage" principle in `paperIndex.js`).
  [#1186](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1186).
- **Atlas follow-ons** — paper-to-paper edges reusing the adjacency
  #1148 already computes
  ([#1188](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1188)),
  reciprocal "See this on the Atlas" links from paper pages and author
  entries
  ([#1189](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1189)),
  an author's papers shown in place on the Papers lens rather than
  navigating away
  ([#1190](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1190)),
  and a collapsed filter stack on phones
  ([#1191](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1191)).
- **Social-card polish** — the EISS iconmark now sits on every OG card
  ([#157](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/157))
  and `/roadmap` has a bespoke one
  ([#272](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/272)).
  The per-edition archive cards
  ([#474](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/474))
  moved to *Under watch*: no per-edition card exists anywhere, so the job
  is eleven pages or a close, not the three the issue assumed.

The one item on that list which did not ship is the **ESSC 2027
announcement**, the single entry in `src/_data/conferences.js` per
[`docs/new-conference.md`](new-conference.md). It waits on a date and a
venue rather than on us, and is now
[#1522](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1522)
against v2.29.0.

### v2.28.0 — A usable Atlas, and a citable theme vocabulary · shipped 29 August 2026

Ten days after v2.27.0, and mostly the map catching up with the promise
of it. Shipped as
[v2.28.0](https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.28.0)
on 29 August 2026.

- **The Atlas, from something to look at to something to work with** —
  it opens on the map rather than below a screen of chrome, zooms and
  pans, and holds still while it is read. Clicking a hub filters to that
  theme. The view a reader arrives at is the view a link carries, so a
  filtered map can be sent to somebody else. It is also no longer
  keyboard-inaccessible or English-only: the whole current view exists
  as a list under the canvas, the map announces its state through a live
  region, and the French and German interfaces are complete.
- **A vocabulary other people can use** — the seventeen research themes
  were a JavaScript constant inside a website's build and are now a
  published SKOS concept scheme at `/vocab/themes/`, in Turtle and
  JSON-LD, each theme carrying a permanent identifier and a preferred
  label in all three languages. The matching rules stay unpublished on
  purpose: they are how a paper gets tagged, not what a theme means, and
  a regex is not a definition. Part of
  [#1249](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1249),
  which stays open for the Zenodo deposit itself.
- **The Anthology says more about itself** — the header set out every
  annual edition against five figures rather than four aggregate counts,
  which is what shows whether the Initiative is meeting the same people
  again or new ones. Two figures were quietly wrong and were corrected:
  poster papers had been counted in the abstract-coverage ratio in some
  editions and not others, depending on how each programme was
  transcribed.
- **The phone, and the reader without JavaScript** — a run of fixes with
  one cause, a map built at desktop width with scripts running. It now
  reaches the first screen in all three languages, and a tap previews
  rather than navigating away.

The [v2.28.0 milestone](https://github.com/EISSeuropa/EISSeuropa.github.io/milestone/11)
closed with 72 issues in it and none open.

Three things landed just after the cut, against v2.29.0. The SKOS files
now state their own version and issue date, so a deposited copy can be
dated
([#1607](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1607)).
`release.sh` reports a failed roadmap-card flip instead of reading it as
nothing to do
([#1604](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1604)),
which is the bug that let this release ship with a stale card on the
public roadmap. And 102 orphaned Mobirise-era images, about 25 MB, came
out of the repository
([#471](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/471)).

### v2.29.0 — The corpus in French, and the data behind it · target 8 December 2026

The identifier strand that gave this release its old name shipped early,
inside v2.27.0: the Zenodo DOI, the HAL note and the Software Heritage
archive are all live and shown on the site. What names the release now
is the second strand, making the corpus usable in French, which is where
a large part of the network reads, alongside the metadata work that
turns the corpus into something other projects can analyse and cite.
Two further strands ride this release. The first three ESSC 2027 phases
land here because their deadlines fall inside it, and the accessibility
declaration lands here as the follow-through the Atlas owes (rule §9).

The
[v2.29.0 milestone](https://github.com/EISSeuropa/EISSeuropa.github.io/milestone/24)
is the queryable commitment (rule §10). It holds **16** open issues,
which is more than one December cut can carry, so part of preparing this
release is deciding what does not make it. Two things cannot be the
answer: the ESSC 2027 phases have dates owned by the joint organising
group, and the French scope is what the release is named after.
Everything else is negotiable, and the negotiation belongs to the
release rather than to this document.

- **Persistent identifiers and long-term archiving (shipped in v2.27.0)** — the corpus is
  deposited on Zenodo as a *dataset* in the `eiss` community, under the
  concept DOI [10.5281/zenodo.21776209](https://doi.org/10.5281/zenodo.21776209),
  and `/anthology` carries a "Cite this corpus" block in all three
  locales. What remains on
  [#1221](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1221)
  is the deposited payload: the record still attaches the raw `.js` data
  modules rather than the JSON export, which arrives with #641. On HAL,
  the corpus-description note is deposited at
  [hal-05711925](https://hal.science/hal-05711925) as a **Research
  report**, which also placed it in LARA, HAL's report portal. A
  dedicated EISS collection needs a structure registered in AuréHAL and
  is **deferred, not refused**
  ([#1222](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1222), M).
  Still open there: the record cites the version DOI rather than the
  concept DOI, and carries no licence. The source is archived in Software
  Heritage, with the SWHID shown in `README.md`, on `/licensing` and
  beside the DOI on `/anthology`, and the per-release refresh rule
  written down in `docs/corpus-archiving.md`. What keeps
  [#1223](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1223)
  open is its last criterion, the HAL software deposit by SWHID, which
  waits on #1222.
  This is the cheap path: #795 weighs the Crossref per-paper
  alternative, which carries a recurring membership cost and stays
  undecided. The Zenodo GitHub integration was deliberately left off, to
  avoid minting a competing software DOI on every release.
- **The corpus, readable in French** — the French Anthology comes out
  of beta on a finite declared scope (the interface, the seventeen
  theme labels, and the abstracts of papers with at least one
  French-affiliated author), with a CI check that fails when an
  in-scope entry loses its translation
  ([#1224](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1224), L).
  Per-theme annotated bibliographies in French follow, generated from
  the corpus, printable, and licensed for teaching use
  ([#1226](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1226),
  L, now *Under watch* rather than committed here).
  A French-language note on the corpus, published annually, is the
  companion piece
  ([#1250](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1250), M).
- **The corpus as data** — an analytical export layered on the raw
  open-data export (#641): per edition, affiliation shares by country
  and thematic distribution, plus co-authorship edges, versioned with
  the corpus and documented in `docs/`
  ([#1227](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1227), M).
  Underneath it, corpus affiliations resolve to ROR identifiers so that
  any country figure can state its own coverage instead of guessing
  ([#1248](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1248),
  M). The automated pass is drafted in
  [#1264](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1264)
  and waits on human review, which is the point: two wrong matches
  scored above 0.97, so publishing country figures off the unreviewed
  mapping would put confident wrong numbers on the site.
- **The theme vocabulary, deposited** — v2.28.0 published the seventeen
  themes as SKOS at `/vocab/themes/`. What remains is making that
  artefact citable rather than merely fetchable: the Zenodo deposit
  under its own SemVer, prepared in
  [#1606](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1606)
  and still to be cut
  ([#1249](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1249)),
  and an entry for the corpus dataset in Recherche Data Gouv, the French
  national research-data platform
  ([#1251](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1251), M).
- **ESSC 2027, the first three phases** — *save the date*, *call for
  papers* and *selection and notifications*, five issues with deadlines
  between 30 September and 31 December. These are set out in the *ESSC
  2027 preparation* table above rather than repeated here, because the
  dates belong to the joint organising group.
- **Accessibility, conformant rather than partial** — the statement
  declares partial conformance today, which is the honest label while
  the Atlas's canvas has a mitigation rather than an equivalent. Closing
  that, and declaring against RGAA 4.1 alongside EN 301 549, is
  [#1225](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1225)
  (L). It pairs with the French strand: RGAA is the framework applicable
  to a French-registered organisation, and it requires a declaration to
  name its escalation route.

Also carried in the milestone and not belonging to any strand:
the joint-event programmes for `/JPW2019` and a new `/joint-2024`
([#328](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/328)),
the HAL collection and the Software Heritage software deposit that the
identifier strand still owes
([#1222](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1222),
[#1223](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1223)),
and the resynchronisation of this document
([#1619](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1619)).

The French strand depends on a reviewer's time, which is the main risk
to the date. If it slips, the ESSC 2027 phases still have to land on
their own deadlines, so they are the part of this release that cannot
wait for the rest.

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
- **Atlas edition scrubber**
  ([#1192](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1192)) —
  reading the corpus across 2017-2026 rather than as a snapshot.
  Parked behind
  [#1186](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1186):
  with 30 theme signatures across the whole corpus a scrub would
  animate almost nothing, and the feature would read as a demo toy.

- **Reslipped from v2.27.0** (August 2026), each with its reason on the
  issue: branch-protection Phase 3
  ([#501](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/501))
  behind CodeQL's cancellation behaviour
  ([#1341](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1341),
  GitHub default setup, no workflow of ours to tune); the governance page
  ([#638](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/638))
  and the Working Groups page
  ([#94](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/94)),
  both waiting on source material that does not exist yet (`board.json`
  names only WG1 and WG2, for 5 of 25 members); the year-round CfP surface
  ([#797](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/797)),
  the happening-now view
  ([#636](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/636))
  and the personal programme builder
  ([#637](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/637)),
  all of which need an ESSC 2027 programme that is still a scaffold in
  `.eleventyignore`; the recordings thread
  ([#798](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/798)),
  which needs films that may not exist for the older editions; and the
  per-edition share cards
  ([#474](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/474)),
  whose premise was wrong.

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

## Status as of v2.28.0

Where the site stands today, so the plan above makes sense:

- **Stack**: Eleventy 3 + Nunjucks. GH Actions builds + deploys. No
  client-side framework. A small amount of hand-written JS for theme,
  mobile menu, lazy YouTube, and print preparation.
- **Pages**: 136 page templates at the top level of `src/`, 26 of them
  French and 26 German, plus the generated per-paper, per-person and
  per-theme pages the Anthology emits. All URLs preserved from the
  original Mobirise export. `src/legacy/` fully retired in v1.0.
- **Brand identity**: real EISS lockup (constellation + EiSS wordmark)
  across header, footer, favicon, Apple touch icon, Android adaptive
  icon, PWA manifest, joint-organisers strip. Schema.org
  `Organization.logo` points at the high-res brand PNG. The iconmark
  overlay reached every OG card in v2.27.0
  ([#157](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/157)).
- **Design**: Apple-style glass, auto + manual dark mode, Inter font,
  reveal animations gated on `prefers-reduced-motion`. Brand-blue
  (`#007bc6`) is the canonical accent.
- **Accessibility**: `/accessibility.html` §7 declares **partial**
  conformance with WCAG 2.1 AA, aligned with EN 301 549. axe-core is
  clean across light and dark. The limitation that is ours is the
  Atlas's `<canvas>`, which v2.28.0 mitigated with a keyboard path, a
  live region and a list alternative rather than replaced with an
  equivalent. Moving to conformant, and declaring against RGAA 4.1 as a
  French-registered organisation should, is
  [#1225](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1225).
- **SEO**: full OG + Twitter Card meta, JSON-LD Organization with
  `ImageObject` logo + `foundingDate: "2017"`, per-page bespoke share
  cards in all three languages, favicon stack, webmanifest,
  robots.txt + sitemap.xml.
- **i18n**: EN / FR / DE. Chrome strings in `src/_data/i18n.js`. 26
  French and 26 German page files, 16 English sources tracked in
  `data/i18n-state.json`. All 32 tracked translations are still
  `status: "beta"`, so **no page has cleared native-speaker review yet**
  and every FR / DE page still carries the ribbon. Drift detection in CI
  on every HTML-touching PR. A `localizedHref` filter falls cross-locale
  links back to the English page when the target locale doesn't exist.
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
  every PR + Monday cron. Both roadmap surfaces refresh in one daily
  workflow rather than on every merge. The board-bios sync runs weekly.
  Dependabot watches GitHub Actions and Python deps weekly. Version-numbered milestones drive release planning
  (switched from thematic after v2.24.0). Cross-repo GitHub Project
  ([#1](https://github.com/users/EISSeuropa/projects/1)) spans open
  enhancement issues across EISS + NetSec.
- **The Anthology**: `/anthology` is the site's flagship, 519 papers and
  494 named people across 12 editions, indexed by 17 research themes.
  The Atlas at `/anthology-atlas.html` maps it, deep-linkably and in all
  three languages. The themes are published as a SKOS vocabulary at
  `/vocab/themes/` in Turtle and JSON-LD, each with a permanent
  identifier and its own SemVer.
- **Corpus archiving**: deposited on Zenodo as a dataset under the
  concept DOI `10.5281/zenodo.21776209`, described in a HAL research
  report at `hal-05711925`, and the source archived in Software Heritage
  with the SWHID shown on `/licensing` and `/anthology`. Procedure in
  [`docs/corpus-archiving.md`](corpus-archiving.md).
- **What's New banner**: `src/data/whats-new.json`-driven dismissible
  site-wide announcement. **Currently off**, since 13 June 2026, the day
  after ESSC 2026 closed. The `whats-new-banner` skill governs the
  discipline (it was CLAUDE.md §12 until the lazy-loaded procedures
  split out).

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
