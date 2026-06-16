#!/usr/bin/env node
/**
 * #805 confirm-and-record: promote a reviewed publication match into the
 * confirmed store.
 *
 * scripts/match-publications.mjs writes proposals to
 * data/publication-candidates.json. A human reviews them, then runs this with
 * the slug(s) they accept; each is copied into src/_data/paperLinks.json
 * (keyed by slug), which corpus.js merges onto the paper so its landing page
 * links the published version. Nothing is recorded until a human runs this.
 *
 * Usage:
 *   node scripts/confirm-publication.mjs <slug> [<slug> ...]
 *   node scripts/confirm-publication.mjs --list           # show pending candidates
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATES = join(ROOT, "data", "publication-candidates.json");
const LINKS = join(ROOT, "src", "_data", "paperLinks.json");

if (!existsSync(CANDIDATES)) {
  console.error("No data/publication-candidates.json — run scripts/match-publications.mjs first.");
  process.exit(1);
}
const candidates = JSON.parse(readFileSync(CANDIDATES, "utf8"));
const args = process.argv.slice(2);

if (!args.length || args[0] === "--list") {
  for (const c of candidates) {
    console.log(`[${c.band}] ${c.slug}\n    "${c.paperTitle}" (${c.paperYear})\n    → ${c.doi}  "${c.candidateTitle}" (${c.candidateYear})`);
  }
  console.log(`\n${candidates.length} candidate(s). Confirm with: node scripts/confirm-publication.mjs <slug> ...`);
  process.exit(0);
}

const links = existsSync(LINKS) ? JSON.parse(readFileSync(LINKS, "utf8")) : {};
const today = new Date().toISOString().slice(0, 10);
let n = 0;
for (const slug of args) {
  const c = candidates.find((x) => x.slug === slug);
  if (!c) {
    console.error(`! no candidate with slug "${slug}" — skipped`);
    continue;
  }
  links[slug] = {
    doi: c.doi || null,
    publishedUrl: c.publishedUrl || (c.doi ? `https://doi.org/${c.doi}` : null),
    publishedTitle: c.candidateTitle || null,
    journal: c.journal || null,
    publishedYear: c.candidateYear || null,
    source: c.matchedVia || "manual",
    verifiedOn: today,
  };
  n++;
  console.log(`✓ recorded ${slug} → ${links[slug].doi}`);
}
// Stable key order for readable diffs.
const sorted = {};
for (const k of Object.keys(links).sort()) sorted[k] = links[k];
writeFileSync(LINKS, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\n${n} match(es) recorded in src/_data/paperLinks.json. Rebuild to surface them on the /papers/<slug> pages.`);
