#!/usr/bin/env node
/**
 * Coverage alarm for paper abstracts. Run on demand (a §5 release cross-check
 * step), NOT in the build or CI.
 *
 * Every abstract in paperAbstracts.json / paperAbstractsManual.json is keyed
 * `<year>::<normalised-title>` and attaches to an Anthology paper only on an
 * EXACT normalised-title match (see corpus.js / archiveProgrammesEnriched.js).
 * An abstract that matches nothing renders nowhere — it is stranded. Two causes:
 *
 *   - title drift: the Indico title differs slightly from the transcribed
 *     programme title (punctuation, a typo, singular/plural). Fixable by
 *     reconciling the title. Shown below with its closest corpus paper.
 *   - missing paper: the programme (archiveProgrammes.js) or the live Indico
 *     snapshot simply doesn't list that paper, so there is nothing to attach
 *     to. Some are panel-level abstracts that correctly match no single paper.
 *
 * This script reports every stranded abstract, grouped by year, with the
 * closest corpus title and a similarity score so drift is easy to spot.
 *
 * Usage:  node scripts/check-abstract-coverage.mjs
 * Exit code is always 0 (informational); it is an alarm, not a gate.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const load = (p) => JSON.parse(readFileSync(join(ROOT, "src", "_data", p), "utf8"));

// MUST stay identical to the normaliser in corpus.js / sync-abstracts.mjs.
function normTitle(t) {
  return String(t || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Token-set Jaccard, for surfacing the closest corpus paper to a stranded key.
function jaccard(a, b) {
  const A = new Set(a.split(" ")), B = new Set(b.split(" "));
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / new Set([...A, ...B]).size;
}

const abstracts = { ...load("paperAbstracts.json"), ...load("paperAbstractsManual.json") };
// Drift aliases re-point a synced key onto the programme key at build time, so
// an aliased source key is reconciled, not stranded; don't flag it. See
// paperAbstractAliases.json.
const aliases = load("paperAbstractAliases.json");
const aliasedSources = new Set(Object.keys(aliases).filter((k) => k.includes("::")));
// paperIndex.js is the deduplicated paper list that the Anthology and the
// per-paper landing pages actually render, so it is the right attach target.
const corpus = require(join(ROOT, "src", "_data", "paperIndex.js")).papers || [];

// Corpus normalised titles, grouped by year.
const corpusByYear = {};
for (const p of corpus) {
  const y = String(p.year);
  (corpusByYear[y] = corpusByYear[y] || []).push({ title: p.title, nt: normTitle(p.title) });
}

const keysByYear = {};
for (const key of Object.keys(abstracts)) {
  if (!key.includes("::")) continue; // skip _documentation and any meta keys
  const [year, nt] = key.split("::");
  (keysByYear[year] = keysByYear[year] || []).push(nt);
}

let totalStranded = 0;
const years = Object.keys(keysByYear).sort();
console.log("Abstract coverage — stranded entries by year\n");
for (const year of years) {
  const corpusNts = new Set((corpusByYear[year] || []).map((c) => c.nt));
  const keys = keysByYear[year];
  // An aliased source key reconciles at build time, so it is attached, not stranded.
  const reconciled = keys.filter((nt) => aliasedSources.has(`${year}::${nt}`));
  const stranded = keys.filter((nt) => !corpusNts.has(nt) && !aliasedSources.has(`${year}::${nt}`));
  const attached = keys.length - stranded.length;
  const flag = stranded.length ? "⚠ " : "✓ ";
  const recNote = reconciled.length ? ` (${reconciled.length} reconciled via alias)` : "";
  console.log(`${flag}${year}: ${attached}/${keys.length} attached, ${stranded.length} stranded${recNote}`);
  totalStranded += stranded.length;
  for (const nt of stranded.sort()) {
    let best = null, score = 0;
    for (const c of corpusByYear[year] || []) {
      const s = jaccard(nt, c.nt);
      if (s > score) { score = s; best = c; }
    }
    const verdict = score >= 0.6 ? "LIKELY DRIFT" : score >= 0.35 ? "possible drift" : "no near match — paper likely absent from programme";
    console.log(`    • ${nt}`);
    console.log(`      closest (${score.toFixed(2)}, ${verdict}): ${best ? best.nt : "—"}`);
  }
  if (stranded.length) console.log();
}
console.log(`\nTotal stranded: ${totalStranded} across ${years.length} years.`);
console.log("LIKELY/possible drift → reconcile the title. No near match → the paper is missing from the programme (or is a panel-level abstract).");
