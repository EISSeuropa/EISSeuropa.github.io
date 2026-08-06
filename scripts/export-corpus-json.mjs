#!/usr/bin/env node
/**
 * Emit the Anthology corpus as plain JSON, for the Zenodo deposit (#1221).
 *
 * The record is typed *Dataset* but currently carries corpus.js and
 * paperIndex.js, which are Eleventy data modules: reading them means running
 * Node and knowing their shape. This writes what a dataset record should hold
 * instead — one self-describing JSON file, no interpreter needed.
 *
 *   node scripts/export-corpus-json.mjs [outfile]
 *
 * Default outfile: data/anthology-corpus.json, which .gitignore excludes:
 * it is derived from data already in the repo, so regenerate it rather than
 * commit it.
 *
 * ponytail: not wired into the Eleventy build. The deposit is cut by hand a
 * couple of times a year, so a build step that runs on every commit would be
 * pure overhead. #641 is where the published, build-time /data/*.json export
 * belongs, with its data dictionary and its licence note on /licensing.
 *
 * Deliberately does NOT use paperIndex.stats.editions: it counts distinct
 * `programmeUrl`, and that string carries a per-paper #anchor, so it returns
 * ~one "edition" per paper (509). corpus.stats.editions (12) is the real
 * count, which is why the site renders that one.
 */

import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);
const corpus = require("../src/_data/corpus.js");
const paperIndex = require("../src/_data/paperIndex.js");

const OUT = process.argv[2] || "data/anthology-corpus.json";

// Stable theme vocabulary: key + every locale label + how many papers carry it.
const themeCounts = new Map(paperIndex.themes.map((t) => [t.name, t.count]));
const themes = corpus.themes.map((t) => ({
  key: t.key,
  label: t.label,
  papers: themeCounts.get(t.label.en) ?? 0,
  speakers: t.count,
}));

// Papers. `theme` holds locale-agnostic English labels in paperIndex; map them
// back to the stable keys so the export joins to `themes` above.
const keyByLabel = new Map(corpus.themes.map((t) => [t.label.en, t.key]));
const papers = paperIndex.papers.map((p) => ({
  slug: p.slug,
  title: p.title,
  authors: p.authors,
  affiliations: p.affiliations,
  year: p.year,
  conference: p.conferenceLabel,
  panel: p.panel,
  themeKeys: (p.theme || []).map((l) => keyByLabel.get(l) ?? l),
  abstract: p.abstract || null,
  abstractEligible: Boolean(p.abstractEligible),
  publishedUrl: p.publishedUrl || null,
  doi: p.doi || null,
  prize: p.prize || null,
  url: p.paperUrl || null,
  programmeUrl: p.programmeUrl || null,
}));

// Authors, deduplicated on the same conservative name key the site uses.
const authors = corpus.speakers.map((s) => ({
  key: s.key,
  name: s.display || s.name,
  affiliation: s.affiliation || null,
  themeKeys: s.themes,
  paperCount: s.count,
  firstYear: s.firstYear,
  lastYear: s.lastYear,
  url: s.profileUrl || null,
}));

const payload = {
  meta: {
    title: "The European Security Studies Anthology",
    publisher: "European Initiative for Security Studies",
    source: "https://eiss-europa.com/anthology.html",
    doi: "10.5281/zenodo.21776209",
    doiNote:
      "Concept DOI: always resolves to the newest deposited version. " +
      "Version DOIs pin to a single snapshot and should not be cited.",
    licence: "CC BY 4.0",
    attribution: "European Initiative for Security Studies, eiss-europa.com",
    generated: new Date().toISOString().slice(0, 10),
    coverage: { firstYear: paperIndex.stats.firstYear, lastYear: paperIndex.stats.lastYear },
    counts: {
      papers: paperIndex.stats.paperCount,
      authors: corpus.stats.speakerCount,
      editions: corpus.stats.editions,
      themes: themes.length,
      papersWithTheme: paperIndex.stats.taggedPapers,
      papersEligibleForAbstract: paperIndex.stats.eligiblePaperCount,
      papersWithAbstract: paperIndex.stats.abstractCount,
    },
    caveats: [
      "Papers are deduplicated; a paper shown twice in a programme (e.g. a poster on both days) is counted once.",
      "Authors are matched conservatively on a normalised name key, so one person appearing under noticeably different spellings across years may appear more than once.",
      "Themes are inferred from the panel a paper sat in, so every paper on a panel inherits that panel's themes, and a paper matching no rule stays untagged rather than being force-fit.",
      "Abstract coverage is measured against papers eligible for one; keynotes, roundtables, posters and workshop sessions are excluded.",
    ],
  },
  editions: paperIndex.editions.map((e) => ({
    key: e.key,
    label: e.label,
    year: e.year,
    papers: e.count,
  })),
  themes,
  coverageByYear: paperIndex.years.map((y) => ({
    year: y.year,
    papers: y.count,
    eligibleForAbstract: y.eligible,
    withAbstract: y.withAbstract,
    coveragePercent: y.coverage,
  })),
  papers,
  authors,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

const { counts } = payload.meta;
console.log(
  `wrote ${OUT}: ${counts.papers} papers, ${counts.authors} authors, ` +
    `${counts.editions} editions, ${counts.themes} themes ` +
    `(${counts.papersWithAbstract}/${counts.papersEligibleForAbstract} abstracts)`
);

// The rest of the deposit procedure, printed here because this is the step
// people actually run. Forgetting step 2 is the expensive one: the note's
// figures are a statement about one version, so a deposit with stale numbers
// misdescribes the data it ships with. Full procedure in
// docs/corpus-archiving.md.
console.log(`
Depositing this? The remaining steps (docs/corpus-archiving.md):
  1. Compare the counts above against the last deposit. Unchanged means
     there may be nothing to deposit.
  2. Refresh the figures, the three tables and the "Corpus state" date in
     docs/anthology-corpus-note.md from this file.
  3. ./scripts/build-corpus-note-pdf.sh
  4. Zenodo "New version" (keeps the concept DOI), attach the JSON above.
  5. Update the HAL record with the new PDF.`);
