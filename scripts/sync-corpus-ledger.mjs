#!/usr/bin/env node
/**
 * Corpus ledger: when each paper entered the Anthology, and when its abstract
 * first attached (#1256).
 *
 *   node scripts/sync-corpus-ledger.mjs           # update the ledger in place
 *   node scripts/sync-corpus-ledger.mjs --check   # report drift, change nothing
 *
 * WHY THIS EXISTS
 *
 * The corpus carries a `year`, not a date, and no record of when anything was
 * added. #1256 needed an entry date for the per-theme Atom feeds and weighed
 * three options: the conference date (honest, but silent about the abstract
 * recovery where most real change happens), a tracked added-date, or a single
 * git-derived recent-changes feed. The second was chosen, because "an abstract
 * you were waiting for is now on file" is the notification with real value and
 * the conference date cannot express it.
 *
 * So the ledger records two dates per paper:
 *
 *   firstSeen     - the day the paper first appeared in the corpus
 *   abstractSeen  - the day an abstract first attached to it, if one has
 *
 * A feed entry takes the later of the two, which is what makes a recovered
 * abstract surface as a fresh item years after its conference.
 *
 * BACKFILL
 *
 * Existing papers are backdated to their edition's start date rather than to
 * the day this script first ran, so the feeds read as a plausible history
 * instead of 511 items all dated today. Abstracts already on file are
 * backdated the same way: dating them today would fire a notification for
 * every abstract recovered over the past year. History starts now for
 * everything after this first run.
 *
 * The ledger is COMMITTED. It is the only record of these dates: derive it
 * once, then it is authoritative, and a rebuild must never regenerate it from
 * scratch or every subscriber gets a burst of false updates.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const paperIndex = require("../src/_data/paperIndex.js");
const conferences = require("../src/_data/conferences.js");

const LEDGER = new URL("../src/_data/corpusLedger.json", import.meta.url);
const check = process.argv.includes("--check");
const today = new Date().toISOString().slice(0, 10);

// Edition start dates for the backfill. The annual conferences carry a real
// startDate; the joint events do not appear in conferences.js, so they fall
// back to mid-year of their edition year, which is honest to the day and
// wrong only about the day.
const confs = typeof conferences === "function" ? conferences() : conferences;
const byYear = {};
for (const c of confs.all || []) if (c.startDate) byYear[c.year || Number(c.slug)] = c.startDate;
const editionDate = (year) => byYear[year] || (year ? `${year}-06-15` : today);

const index = typeof paperIndex === "function" ? paperIndex() : paperIndex;
const papers = (index.papers || []).filter((p) => p.slug);

const prev = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : { _doc: "", papers: {} };
const known = prev.papers || {};
const next = {};
let added = 0;
let abstracts = 0;

for (const p of papers) {
  const was = known[p.slug];
  const hasAbstract = !!p.abstract;
  // A paper already in the ledger keeps its dates: they are history, and
  // recomputing them would rewrite what subscribers already saw.
  const firstSeen = was ? was.firstSeen : (Object.keys(known).length ? today : editionDate(p.year));
  let abstractSeen = was ? was.abstractSeen || null : null;
  if (hasAbstract && !abstractSeen) {
    // First run backdates to the edition; later runs date it today, which is
    // the whole point of tracking it.
    abstractSeen = Object.keys(known).length ? today : editionDate(p.year);
    if (was) abstracts++;
  }
  if (!was) added++;
  next[p.slug] = abstractSeen ? { firstSeen, abstractSeen } : { firstSeen };
}

const removed = Object.keys(known).filter((s) => !next[s]);

if (check) {
  const drift = added || abstracts || removed.length;
  console.log(
    drift
      ? `✗ ledger is stale: ${added} new paper(s), ${abstracts} new abstract(s), ${removed.length} dropped. Run: node scripts/sync-corpus-ledger.mjs`
      : `✓ corpus ledger current (${Object.keys(next).length} papers).`
  );
  process.exit(drift ? 1 : 0);
}

writeFileSync(
  LEDGER,
  JSON.stringify(
    {
      _doc:
        "When each paper entered the Anthology (firstSeen) and when its abstract first attached (abstractSeen). " +
        "Feed entries take the later of the two, so a recovered abstract surfaces as a fresh item. " +
        "COMMITTED and authoritative: regenerating from scratch would fire a false update to every subscriber. " +
        "Maintained by scripts/sync-corpus-ledger.mjs. See #1256.",
      updated: today,
      papers: Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]])),
    },
    null,
    2
  ) + "\n"
);
console.log(
  `wrote corpus ledger: ${Object.keys(next).length} papers` +
    (added ? `, ${added} newly tracked` : "") +
    (abstracts ? `, ${abstracts} abstract(s) newly on file` : "") +
    (removed.length ? `, ${removed.length} dropped` : "")
);
