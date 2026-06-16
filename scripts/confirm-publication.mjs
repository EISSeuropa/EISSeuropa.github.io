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
 *   node scripts/confirm-publication.mjs <slug> [<slug> ...]    # accept a match
 *   node scripts/confirm-publication.mjs --reject <slug> ...    # mark a non-match
 *   node scripts/confirm-publication.mjs --list                 # show pending candidates
 *
 * --reject records the (paper, doi) pair in data/publication-rejects.json, so
 * the matcher stops re-proposing a match a reviewer has validated as wrong.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATES = join(ROOT, "data", "publication-candidates.json");
const LINKS = join(ROOT, "src", "_data", "paperLinks.json");
const REJECTS = join(ROOT, "data", "publication-rejects.json");

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
  console.log(`\n${candidates.length} candidate(s).\n  accept: node scripts/confirm-publication.mjs <slug> ...\n  reject: node scripts/confirm-publication.mjs --reject <slug> ...`);
  process.exit(0);
}

const reject = args[0] === "--reject";
const slugs = reject ? args.slice(1) : args;
if (!slugs.length) {
  console.error("No slug given. Usage: confirm-publication.mjs [--reject] <slug> ...");
  process.exit(1);
}

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {});
function writeSorted(p, obj) {
  const sorted = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = obj[k];
  writeFileSync(p, JSON.stringify(sorted, null, 2) + "\n");
}
const today = new Date().toISOString().slice(0, 10);
let n = 0;

if (reject) {
  // Record the (paper, doi) pair as a validated non-match.
  const rejects = readJson(REJECTS);
  for (const slug of slugs) {
    const c = candidates.find((x) => x.slug === slug);
    if (!c) { console.error(`! no candidate with slug "${slug}" — skipped`); continue; }
    const list = rejects[slug] || (rejects[slug] = []);
    if (!list.includes(c.doi)) list.push(c.doi);
    n++;
    console.log(`✗ rejected ${slug} → ${c.doi}`);
  }
  writeSorted(REJECTS, rejects);
  console.log(`\n${n} non-match(es) recorded in data/publication-rejects.json. The matcher will stop proposing these (paper, doi) pairs.`);
} else {
  // Record the match so its landing page links the published version.
  const links = readJson(LINKS);
  for (const slug of slugs) {
    const c = candidates.find((x) => x.slug === slug);
    if (!c) { console.error(`! no candidate with slug "${slug}" — skipped`); continue; }
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
  writeSorted(LINKS, links);
  console.log(`\n${n} match(es) recorded in src/_data/paperLinks.json. Rebuild to surface them on the /papers/<slug> pages.`);
}
