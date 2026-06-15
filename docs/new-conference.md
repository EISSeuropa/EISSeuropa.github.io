# Adding a new conference year

Step-by-step playbook for publishing a new annual conference page
(`/<year>.html`) and making it visible everywhere else on the site.

After ESSC 2026, the next conference will be ESSC 2027 (or whichever
year is announced next). This guide walks through exactly what to
change. **Total time: about 30–45 minutes for the initial scaffolding,
plus whatever programme content you have ready.**

## 1. Add a structured entry to `src/_data/conferences.js`

This drives the "Next conference" card on the homepage and the archive
list on `/past`. The featured-card UI on the homepage swaps automatically
once `startDate` is in the future relative to today.

Prepend a new object to the `conferences` array, newest first:

```js
{
  slug: "2027",
  year: 2027,
  ordinal: 10,
  startDate: "2027-06-23",        // YYYY-MM-DD, ISO 8601
  endDate: "2027-06-24",
  city: "Amsterdam",
  country: "Netherlands",
  venue: {
    en: "University of Amsterdam",
    fr: "Université d'Amsterdam",
    de: "Universität Amsterdam",
  },
  dates: {
    en: "23 — 24 June 2027",
    fr: "23 — 24 juin 2027",
    de: "23. — 24. Juni 2027",
  },
  archiveMeta: {
    en: "10th Annual Conference · 23 — 24 June 2027 · University of Amsterdam, Amsterdam",
    fr: "10e conférence annuelle · 23 — 24 juin 2027 · Université d'Amsterdam, Amsterdam",
    de: "10. Jahreskonferenz · 23. — 24. Juni 2027 · Universität Amsterdam, Amsterdam",
  },
  organisers: {
    en: "Jointly organised by the COST Action NetSec, the European Initiative for Security Studies (EISS), and the University of Amsterdam.",
    fr: "Organisée conjointement par l'Action COST NetSec, l'Initiative européenne pour les études de sécurité (EISS), et l'Université d'Amsterdam.",
    de: "Gemeinsam organisiert von der COST-Aktion NetSec, der Europäischen Initiative für Sicherheitsstudien (EISS) und der Universität Amsterdam.",
  },
  monthLabel: { en: "June", fr: "Juin", de: "Juni" },
  dayRange: "23–24",
  yearLine: "2027 · Amsterdam",
  displayCity: { en: "Amsterdam", fr: "Amsterdam", de: "Amsterdam" },
  hasOwnPage: true,
},
```

After this lands, the homepage featured card and `/past` archive list
update on the next build. No template edits needed.

## 2. Create the per-year page

Copy `src/2026.njk` to `src/2027.njk` (and its FR/DE siblings) and:

- Replace dates / city / venue / partner-logo references in the prose
- Replace the neighbourhoods tile grid with the new city's neighbourhoods
  (or the equivalent travel guidance)
- Update the programme PDF reference (or leave the path empty until
  the programme is finalised, the `<object>` embed degrades gracefully)
- Update the front-matter `metaImage` reference to a new share card
  (see step 3)

## 3. Generate the share card

The upcoming / live edition gets its own card, titled with the full
conference name. The eyebrow (`ESSC <year>`) and subtitle (dates + venue)
identify the edition; the title stays constant year to year. The archived
years and `/past` keep the shared `past` card ("EISS Annual Conference"),
so you don't touch those.

Add a new entry to `scripts/make-share-cards.py` → `CARDS`:

```python
{"slug": "2027", "i18n": {
    "en": {"eyebrow": "ESSC 2027", "title": "European Security Studies Conference",
           "subtitle": "23–24 June 2027 · University of Amsterdam"},
    "fr": {"eyebrow": "ESSC 2027", "title": "Conférence européenne d'études de sécurité",
           "subtitle": "23–24 juin 2027 · Université d'Amsterdam"},
    "de": {"eyebrow": "ESSC 2027", "title": "Europäische Konferenz für Sicherheitsstudien",
           "subtitle": "23.–24. Juni 2027 · Universität Amsterdam"},
}},
```

Then:

```
python3 scripts/make-share-cards.py
```

The script writes `2027-meta.jpg`, `2027-meta.fr.jpg`, `2027-meta.de.jpg`
to `src/assets/images/`. Point the new page's front-matter `metaImage`
(EN + FR + DE) at `/assets/images/2027-meta.jpg`.

## 4. Update the i18n drift state

Each new `.njk` source page that has translations needs to be tracked
by the drift checker:

```bash
python3 scripts/check-i18n-drift.py --mark-fresh src/2027.njk fr
python3 scripts/check-i18n-drift.py --mark-fresh src/2027.njk de
```

This stamps the source hash so CI doesn't immediately flag the new
translations as stale. The script will fail with a "no entry for…"
error until you add the entry — open `data/i18n-state.json` and add:

```json
"src/2027.njk": {
  "fr": { "file": "src/2027.fr.njk", "source_sha1": "...", "translated_on": "2027-MM-DD", "status": "beta" },
  "de": { "file": "src/2027.de.njk", "source_sha1": "...", "translated_on": "2027-MM-DD", "status": "beta" }
}
```

Then run `--mark-fresh` for each language to fill in the SHA.

## 5. Verify and ship

```bash
npx @11ty/eleventy
python3 scripts/check-i18n-drift.py
```

Both should succeed. Open `_site/index.html` and `_site/past.html` to
check the featured card and archive list. Commit, push, merge.

## When the conference is over

The page placement is automatic: the `endDate` field in `conferences.js`
moves the entry from `next`/`upcoming` to `past` on the next build, and
the daily-rebuild workflow
([`.github/workflows/scheduled-rebuild.yml`](../.github/workflows/scheduled-rebuild.yml))
advances the cut-off within ~24 hours of the end date without any manual
action.

One manual step for the **share card**: retire the just-past edition's
bespoke card so the archive reads with the shared "EISS Annual
Conference" card.

- Point that year's page front-matter `metaImage` (EN + FR + DE) back at
  `/assets/images/past-meta.jpg`.
- Remove the year's entry from `CARDS` in `scripts/make-share-cards.py`
  and delete its `<year>-meta.*` files (otherwise the generator keeps
  producing an unreferenced per-year card — a `check-build-sanity` /
  orphan check will flag it).

This is the same swap, in reverse, that step 3 does for the new edition,
so at any time exactly one edition (the upcoming / live one) carries the
full-name card and everything else shares the archive card.

**Pull the abstracts.** The printed programmes transcribed into
`src/_data/archiveProgrammes.js` carry no abstracts, but Indico holds
them. Add the edition's year → Indico event id to the `EVENTS` map in
[`scripts/sync-abstracts.mjs`](../scripts/sync-abstracts.mjs) and run
`node scripts/sync-abstracts.mjs`. It refreshes
`src/_data/paperAbstracts.json`; `archiveProgrammesEnriched.js` merges
each abstract onto the matching programme entry by title, and the
archive programme grid renders it. Matching is exact on the normalised
title, so an abstract whose Indico title differs from the transcription
simply does not attach (no harm, just a gap).

If you want to keep the just-past year visible in the homepage hero
for a few days after, edit `src/_data/conferences.js` and bump that
year's `endDate` to a date a week or two later. Reset when you're
ready to switch the highlight to next year.
