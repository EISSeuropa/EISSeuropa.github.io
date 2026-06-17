#!/usr/bin/env node
/**
 * Sanity-check the "presented at EISS, later published at X" claim.
 *
 * For every confirmed publication (src/_data/paperLinks.json, surfaced through
 * paperIndex.js) this compares the CONFERENCE abstract against the PUBLISHED
 * abstract fetched live from Crossref by DOI, and scores their similarity. A
 * genuine match shares most of its distinctive vocabulary even after the
 * rewording a paper gets on the way to publication; a low score is a prompt to
 * read the pair by hand and confirm it is the same work.
 *
 * Caveats, by design:
 *   - It can only score a paper that has BOTH a conference abstract on file and
 *     a published abstract deposited on Crossref. Many publishers (Taylor &
 *     Francis among them) omit the abstract from Crossref, and renamed papers
 *     were often added by hand without a conference abstract — those are listed
 *     separately as "could not compare", not as failures.
 *   - The score is advisory triage, not a gate. Conference abstracts here often
 *     carry inline citations ("Kuo and Blankenship, 2022") that dilute the
 *     overlap, so a real match can still score modestly. Read anything the
 *     threshold flags rather than trusting the number.
 *
 * Usage:
 *   node scripts/check-publication-similarity.mjs [--threshold 0.35] [--quiet]
 *
 * Exit code is always 0 (informational); it is an alarm, not a gate — the same
 * posture as scripts/check-abstract-coverage.mjs.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const paperIndex = require(join(ROOT, "src", "_data", "paperIndex.js"));

const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const tIdx = args.indexOf("--threshold");
const THRESHOLD = tIdx !== -1 && args[tIdx + 1] ? Number(args[tIdx + 1]) : 0.35;
const MAILTO = "contact@eiss-europa.com"; // Crossref polite-pool identifier.

// Content-word bag: strip tags/entities, lowercase, drop short words, stopwords
// and bare numbers / 4-digit years (the latter are mostly inline citations,
// which would otherwise depress the score on a genuine match).
const STOP = new Set(
  ("the a an and or of to in on for with as is are was were be been by that this it its from at into their which we our they these those than then also can may will not but using based study paper article chapter analysis research how why what when between within across over more most such each other both via per have has had do does new use used this these we our their about whether across".split(/\s+/))
);
const strip = (s) =>
  String(s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const toks = (s) =>
  strip(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));

function cosine(a, b) {
  const fa = {}, fb = {};
  a.forEach((w) => (fa[w] = (fa[w] || 0) + 1));
  b.forEach((w) => (fb[w] = (fb[w] || 0) + 1));
  const keys = new Set([...Object.keys(fa), ...Object.keys(fb)]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const x = fa[k] || 0, y = fb[k] || 0;
    dot += x * y; na += x * x; nb += y * y;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

async function crossrefAbstract(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`;
  const r = await fetch(url, { headers: { "User-Agent": `EISS-publication-similarity/1.0 (mailto:${MAILTO})` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return (j.message && j.message.abstract) || null;
}

const published = (paperIndex.papers || []).filter((p) => p.publishedUrl || p.doi);
const scored = [];
const noConfAbstract = [];
const noPubAbstract = [];
const errors = [];

for (const p of published) {
  if (!p.abstract) { noConfAbstract.push(p); continue; }
  if (!p.doi) { noPubAbstract.push({ p, why: "no DOI" }); continue; }
  let pubAbs = null;
  try {
    pubAbs = await crossrefAbstract(p.doi);
  } catch (e) {
    errors.push({ p, err: e.message });
    continue;
  }
  await new Promise((r) => setTimeout(r, 350)); // polite to Crossref
  if (!pubAbs) { noPubAbstract.push({ p, why: "no abstract on Crossref" }); continue; }
  scored.push({ p, sim: cosine(toks(p.abstract), toks(pubAbs)) });
}

scored.sort((a, b) => a.sim - b.sim);
const flagged = scored.filter((s) => s.sim < THRESHOLD);

console.log(`Publication-similarity check (conference abstract vs Crossref published abstract)`);
console.log(`  confirmed publications:        ${published.length}`);
console.log(`  scored (both abstracts found): ${scored.length}`);
console.log(`  no conference abstract on file: ${noConfAbstract.length}`);
console.log(`  no published abstract on Crossref / no DOI: ${noPubAbstract.length}`);
if (errors.length) console.log(`  fetch errors: ${errors.length}`);
console.log(`  threshold for a flag: ${THRESHOLD}\n`);

if (flagged.length) {
  console.log(`⚠ ${flagged.length} below ${THRESHOLD} — read these pairs by hand to confirm they are the same work:`);
  for (const { p, sim } of flagged) console.log(`  ${sim.toFixed(2)}  ${p.slug}`);
  console.log("");
} else {
  console.log(`✓ every scored match is at or above ${THRESHOLD}.\n`);
}

if (!quiet) {
  console.log("All scores (low → high):");
  for (const { p, sim } of scored) console.log(`  ${sim.toFixed(2)}  ${p.slug}`);
  if (noPubAbstract.length) {
    console.log(`\nCould not compare (no published abstract available) — title/author-matched only:`);
    for (const { p, why } of noPubAbstract) console.log(`  [${why}] ${p.slug}`);
  }
  if (noConfAbstract.length) {
    console.log(`\nNo conference abstract on file (nothing to compare against):`);
    for (const p of noConfAbstract) console.log(`  ${p.slug}`);
  }
  if (errors.length) {
    console.log(`\nFetch errors:`);
    for (const { p, err } of errors) console.log(`  [${err}] ${p.slug}`);
  }
}

process.exit(0);
