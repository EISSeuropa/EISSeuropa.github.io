#!/usr/bin/env node
/**
 * Match the corpus's free-text affiliation strings to ROR identifiers (#1248).
 *
 *   node scripts/match-ror.mjs            # match, using the cache
 *   node scripts/match-ror.mjs --refresh  # ignore the cache and re-query
 *
 * Affiliations enter the corpus exactly as printed on the programme, so the
 * corpus holds hundreds of distinct strings and knows nothing about the
 * institution or country behind any of them. This asks ROR's affiliation
 * matcher (https://ror.org, free, no key, no registration) to resolve each
 * one, and writes two files:
 *
 *   data/ror-candidates.json      every candidate with its score, for review
 *   src/_data/affiliationRor.json the accepted mapping the site reads
 *
 * Two rules this script holds to, both from the issue:
 *
 * 1. The programme string stays authoritative. The ROR match is an
 *    annotation beside it, never a replacement. Nothing rendered changes.
 * 2. A string with no confident match resolves to null, explicitly, rather
 *    than to a guess. Any figure derived from the mapping has to be able to
 *    state its own coverage.
 *
 * Affiliations are historical and ROR is current: a person listed at their
 * 2018 institution has often moved. We resolve the institution as printed,
 * and do not update anyone.
 *
 * ponytail: no npm client for ROR, just fetch. The cache is a JSON file, not
 * a database, because this runs a handful of times a year.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const CORPUS = "data/anthology-corpus.json";
const CACHE = "data/ror-cache.json";
const CANDIDATES = "data/ror-candidates.json";
const OUT = "src/_data/affiliationRor.json";

// ROR sets `chosen` on the candidate it believes is the match. We additionally
// require a score floor: `chosen` alone accepts some loose matches, and a wrong
// institution is worse than an honest null.
const SCORE_FLOOR = 0.8;
const DELAY_MS = 120;

const refresh = process.argv.includes("--refresh");

if (!existsSync(CORPUS)) {
  console.error(`error: ${CORPUS} not found. Run: node scripts/export-corpus-json.mjs`);
  process.exit(1);
}

const corpus = JSON.parse(readFileSync(CORPUS, "utf8"));

// Distinct affiliation strings, exactly as printed. One paper can list several.
const strings = [
  ...new Set(
    corpus.papers.flatMap((p) => (p.affiliations || []).filter(Boolean).map((s) => s.trim()))
  ),
]
  .filter((s) => s.length > 2)
  .sort();

const cache = !refresh && existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const displayName = (org) =>
  (org.names || []).find((n) => (n.types || []).includes("ror_display"))?.value ||
  (org.names || [])[0]?.value ||
  null;

const country = (org) => {
  const g = (org.locations || [])[0]?.geonames_details;
  return g ? { code: g.country_code, name: g.country_name } : null;
};

console.log(`matching ${strings.length} distinct affiliation strings against ROR`);

let queried = 0;
for (const s of strings) {
  if (cache[s]) continue;
  try {
    const res = await fetch(`https://api.ror.org/organizations?affiliation=${encodeURIComponent(s)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    cache[s] = (body.items || []).slice(0, 3).map((it) => ({
      chosen: it.chosen,
      score: it.score,
      matchingType: it.matching_type,
      rorId: it.organization.id,
      name: displayName(it.organization),
      country: country(it.organization),
    }));
  } catch (err) {
    // Cache the failure shape so a re-run retries it rather than silently
    // treating a network blip as "no match".
    console.warn(`  ! ${s.slice(0, 50)}: ${err.message}`);
    cache[s] = null;
  }
  queried++;
  if (queried % 25 === 0) {
    console.log(`  ${queried} queried…`);
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  }
  await sleep(DELAY_MS);
}

mkdirSync(dirname(CACHE), { recursive: true });
writeFileSync(CACHE, JSON.stringify(cache, null, 2));

const mapping = {};
const review = [];
let accepted = 0;

for (const s of strings) {
  const cands = cache[s];
  const best = (cands || []).find((c) => c.chosen) || (cands || [])[0] || null;
  if (best && best.chosen && best.score >= SCORE_FLOOR) {
    mapping[s] = {
      rorId: best.rorId,
      name: best.name,
      countryCode: best.country?.code ?? null,
      matchedOn: best.matchingType,
      score: Number(best.score.toFixed(3)),
    };
    accepted++;
  } else {
    mapping[s] = null;
    review.push({ affiliation: s, candidates: (cands || []).slice(0, 3) });
  }
}

mkdirSync(dirname(CANDIDATES), { recursive: true });
writeFileSync(CANDIDATES, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), review }, null, 2));
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      _doc:
        "Affiliation string -> ROR identifier. Generated by scripts/match-ror.mjs (#1248). " +
        "The programme string stays authoritative and is what renders; this is an annotation " +
        "beside it. null means no confident match, which is deliberate: do not guess. " +
        `Auto-accepted at chosen && score >= ${SCORE_FLOOR}; everything else is in ` +
        "data/ror-candidates.json for review.",
      generated: new Date().toISOString().slice(0, 10),
      mapping,
    },
    null,
    2
  ) + "\n"
);

const pct = (n) => `${Math.round((n / strings.length) * 100)}%`;
console.log(`\nauto-accepted : ${accepted}/${strings.length} (${pct(accepted)})`);
console.log(`needs review  : ${review.length}/${strings.length} (${pct(review.length)})`);
console.log(`wrote ${OUT} and ${CANDIDATES}`);

const countries = {};
for (const v of Object.values(mapping)) {
  if (v?.countryCode) countries[v.countryCode] = (countries[v.countryCode] || 0) + 1;
}
const top = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log(`\ncountries resolved (distinct strings): ${top.map(([c, n]) => `${c}:${n}`).join("  ")}`);
