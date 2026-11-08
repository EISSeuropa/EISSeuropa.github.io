# Annual report drafts

`/annual-report-YYYY.html` is a draft of the EISS annual report for each calendar year from 2025. The current year reads "year to date". Every figure sits beside the year before's, with the change. Staff write the prose, the build supplies the figures, and the page prints or saves as PDF from the browser. It is linked from the foot of `/internal.html` for staff, management and the board. It is in English only.

## Sections and sources

| Section | Figures | Source |
|---|---|---|
| The conference | The edition held in the year: papers, sessions, people on the programme, affiliations named, prizes | `facts.js`, `archiveProgrammes.js`, `prizeLaureates.js` |
| The Anthology | Papers and abstracts added in the year, papers at the year's end, the Zenodo DOI | `corpusLedger.json`, `facts.js` |
| NetSec | The year's monthly reports summed: Directory at the end, joined and left, Management Committee at the end, website changes | `netsecReport.js`, summed by the `netsecYear` filter |
| The website | Releases and feature releases, audits, news posts, with the lists | `CHANGELOG.md` headings, `audits.json`, `news.json` |
| Looking ahead | The next conference, next year's internship cohorts | `facts.js`, `cohorts.json` |

People are counted once each by `nameKey.js`. Affiliations are counted as written on the programme, so two spellings of one institution count twice.

A dash means the source keeps no record for that year: releases, audits and news start in 2026, NetSec's monthly reports in June 2026. A dash is never a zero. The Anthology's dates before its launch in June 2026 are each paper's conference date, so "papers added" in those years is the edition's papers.

## Writing the prose

Add paragraphs to `src/_data/annualReportNotes.json` under the year, one list per section:

```json
"2026": {
  "foreword": ["First paragraph.", "Second paragraph."],
  "conference": ["..."]
}
```

The keys are `foreword`, `conference`, `anthology`, `netsec`, `website` and `ahead`. Plain text only. A section without prose shows a dashed "to be written" marker on screen, left out of print. Commit the change in a PR. The page rebuilds with the next deploy.

## Adding a year

Nothing to do. `src/_data/annualReport.js` makes a page for every year from `FIRST` (2025) to the current one. On 1 January the new year's draft appears, and the year just ended loses its "year to date" mark.

## Checks

`node scripts/test-annual-report.js` covers the NetSec yearly sums, an empty year and the year list.
