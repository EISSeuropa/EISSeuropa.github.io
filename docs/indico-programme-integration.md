# Indico → static-site programme integration: design rationale

This document explains *why* the EISS website surfaces the conference
programme the way it does. It's written to be transferable to the
NetSec website (and any future EISS-family site), so the structure is
intentionally general: principles first, EISS-specific implementation
second.

## The problem

A conference programme has **two lifecycles that don't fit a single
artefact**:

1. **Pre-event** (months out → day-of). The programme changes constantly:
   speakers get added, sessions move, abstracts get refined,
   roundtables are renamed. **The PDF programme is a maintenance trap
   here** — every change forces a re-export, a re-design pass, a
   re-upload. Multiply that by FR/DE versions and the friction
   compounds. Attendees who downloaded last week's PDF read stale info.

2. **Post-event** (day-after → archival). The programme is **frozen,
   citable, print-ready**. The organisation wants a polished,
   designer-made artefact attached to the conference page indefinitely.
   The HTML grid is necessary but not sufficient — referees, alumni,
   funders all expect a downloadable PDF.

A naïve approach picks one — either a permanent PDF (with the pre-event
maintenance burden) or a permanent dynamic grid (with no archival
artefact). Both leave one of the two lifecycles unhappy.

## The principle

**Indico is the source of truth. The website is two views over the
same truth, one live, one frozen.**

- The **live view** (`programme-grid.njk`) is generated from Indico's
  timetable export on every daily build. It's authoritative for the
  pre-event months. No re-export friction.
- The **frozen view** (`programme-pdf.njk`) is the polished PDF the
  designer produces. It's authoritative post-event. It's optional and
  controlled by an explicit flag — the operator marks it `"draft"`
  during the pre-event phase, `"final"` once the polished version
  ships.

Both can coexist on the page. The grid is always primary; the PDF, if
present, sits as a small download card below.

## The data flow

```
Indico /export/timetable/{event_id}.json
   │
   ▼
scripts/sync-indico.py: extract_programme()
   │  (daily cron — runs at 03:45 UTC)
   ▼
src/_data/indico.json
   │  annualConferences[year].programme.days[].slots[]
   ▼
src/_includes/programme-grid.njk
   │
   ▼
/YYYY.html (+ .fr.html + .de.html)
```

Separately:

```
Designer produces polished PDF
   │
   ▼
Operator uploads to /assets/files/EISS-YYYY-programme.pdf
   │
   ▼
Operator edits src/_data/conferences.js, sets
   programmePdf: { url, sizeKb, pages, status: "draft" | "final" }
   │
   ▼
src/_includes/programme-pdf.njk
   │
   ▼
/YYYY.html (+ .fr.html + .de.html), below the live grid
```

## Why these two are in *separate* partials

Tempting to fold the PDF into the grid partial. Resisted because:

- **They have different visibility rules.** The grid renders whenever
  Indico has any programme data; the PDF renders whenever the operator
  has uploaded one. Independent.
- **They have different data sources.** Grid = `indico.json` (synced).
  PDF = `conferences.js` (hand-maintained). Different fault domains.
- **They have different reuse trajectories.** The grid is the same shape
  for every year — we'll reuse it on `/2025`, `/2024`, … once we
  back-fill past timetables. The PDF block has the same shape too, but
  not every year has a PDF. Splitting them lets each evolve.

## What the grid actually shows

A day-by-day, slot-by-slot view of the timetable:

- **Sessions** (panels, roundtables, keynotes, intro/closing) render as
  cards with: time, title, room, chairs, and an expandable
  `<details>` block listing every contribution (paper title, speakers
  with affiliations, abstract teaser).
- **Top-level contributions** (rare — usually wrapped in a session)
  render as cards with title, speakers, abstract.
- **Breaks** (coffee, lunch, reception) render as quiet, dashed-border
  rows. They're structural — they help orient the day visually — but
  visually de-emphasised since they're not content.

Day chips at the top serve as anchor-link navigation. No JavaScript
required — `<details>` is native HTML, anchors are anchors.

## What we deliberately don't surface

- **Email hashes from Indico's person records.** Indico publishes
  email hashes (MD5 of emails) for Gravatar lookups. We strip them in
  `_normalise_person()` — they're a tracking surface we have no
  business creating.
- **Internal Indico IDs.** `db_id`, `person_id`, etc. are kept out of
  `indico.json`. The data file is meant to be human-readable; internal
  ids add noise without value to the rendered page.
- **Full abstracts.** Truncated at ~360 chars with an ellipsis + link
  to Indico for the full text. Abstracts are sometimes 2000+ chars;
  showing them all bloats both the JSON and the rendered page. The
  click-through to Indico is one tap away.

## What we deliberately *do* surface, accepting a tradeoff

- **Speaker names + affiliations.** These are already public on
  Indico's event page; the EISS site is just a second view of the same
  public fact. If a speaker withdraws, the next daily sync removes
  them — there's a ~24h lag, but that mirrors how Indico itself
  propagates changes.

This is a deliberate posture worth restating in the NetSec context:
**we treat Indico's public surface as the canonical disclosure
decision**. The website doesn't widen exposure — it reflects what
Indico already exposes. If something shouldn't appear on the website,
the right fix is to change its visibility on Indico, where the
disclosure decision actually lives.

## The PDF flag — operator workflow

In `src/_data/conferences.js`, the relevant year's entry can carry an
optional `programmePdf` field:

```js
programmePdf: {
  url: "/assets/files/EISS-2026-programme.pdf",
  sizeKb: 107,
  pages: 2,
  status: "draft" | "final",
}
```

- **No `programmePdf` field (or `null`)** → no PDF block renders. The
  live grid carries the page. This is the right state until you've
  produced a downloadable.
- **`status: "draft"`** → PDF block renders with the heading "Working
  programme — printable PDF (subject to change)" and a muted
  description noting the live grid above reflects the latest.
- **`status: "final"`** → PDF block renders with the heading "Final
  programme — printable PDF". Description says "A polished,
  print-friendly version of the programme."

Day-after-conference flip: change `"draft"` → `"final"` in a one-line
commit. Done.

## Why not auto-detect "draft vs final" from the conference end date

It's tempting to say "if today > endDate, treat the PDF as final."
Resisted because the polished version often **lags** the end date by
days or weeks — the designer needs time to finalise. Operator-driven
status is the right semantic: "this PDF is now what we want people to
cite" is a human decision, not a calendar one.

## Reuse: applying this to the NetSec website

The pattern transfers cleanly:

1. **Add the same `extract_programme()` to NetSec's `sync-indico.py`.**
   The function is generic over event id; the only NetSec-specific bit
   is which Indico category id to enumerate.
2. **Reuse the data shape exactly.** `programme.days[].slots[]` with
   `kind: "session" | "contribution" | "break"`. The partial doesn't
   care which conference series it's rendering.
3. **Copy `programme-grid.njk` and `programme-pdf.njk` verbatim.**
   Both partials only depend on `i18n.programme.*` strings and the
   `indico.annualConferences[year]` shape — no EISS-specific
   coupling.
4. **i18n catalog** — copy the `programme: {…}` block under each
   locale (or whichever languages NetSec supports).
5. **`conferences.js`-equivalent** — NetSec's hand-maintained metadata
   file gets the same `programmePdf` field with the same `status`
   semantics.

The only EISS-specific bits in the implementation are:
- The Indico **category id** (currently `1` for Annual Conferences) —
  set per site.
- The Indico **base URL** (currently `https://indico.eiss-europa.com`).
  If NetSec ends up using the same Indico instance, this stays. If
  NetSec has its own Indico, swap.
- **`LIVESTREAM_SESSION_TYPES` and `LIVESTREAM_SESSION_CODES`** — these
  govern the *livestreamed sessions* block, not the programme grid.
  Keep separate per site; the conventions may differ.

## Operational checklist for a new conference year

Roughly the lifecycle, in order:

1. **6–12 months out**: Create the Indico event under the Annual
   Conferences category. Add the new year to `src/_data/conferences.js`
   with dates and venue. The daily sync starts surfacing the event on
   the registration-status badge (`/index` and `/YYYY`).
2. **3–6 months out**: Tag the livestreamed session types in Indico
   (`INTRO` / `KEY` / `RT` / `CONC`). The Livestreamed sessions block
   on `/YYYY` starts populating.
3. **1–3 months out**: As sessions and contributions get added to
   Indico, the live programme grid auto-fills. **No website update
   needed** — that's the point.
4. **2–4 weeks out**: Designer drafts the printable PDF. Upload to
   `/assets/files/EISS-YYYY-programme.pdf`, set `programmePdf` on the
   conferences.js entry with `status: "draft"`.
5. **Day-of**: Flip `registrationStatus` if needed; flip badge to
   "Happening now" via the date logic (automatic).
6. **Day-after**: Designer finalises the PDF; replace the file in
   place (same path) and flip `status: "draft"` → `"final"` in a
   one-line commit.
7. **Indefinitely after**: The grid stays live (with the post-event
   tense — same data, different framing in the lead paragraph if you
   want to localise that). The PDF stays as the citable artefact.

Most steps after step 1 are **zero website changes** — that's the
explicit goal of this design.
