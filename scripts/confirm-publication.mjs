#!/usr/bin/env node
/**
 * #805 confirm-and-record: turn reviewed publication matches into the
 * confirmed store (src/_data/paperLinks.json), which corpus.js merges onto
 * papers so their landing pages link the published version.
 *
 * scripts/match-publications.mjs writes proposals to
 * data/publication-candidates.json, each banded "high" (title ≥ 0.80, a
 * near-verbatim match) or "review" (0.50–0.79, needs judgement).
 *
 * Usage:
 *   node scripts/confirm-publication.mjs --list                 # show pending candidates
 *   node scripts/confirm-publication.mjs <slug> [<slug> ...]    # accept a match
 *   node scripts/confirm-publication.mjs --reject <slug> ...    # mark a non-match
 *   node scripts/confirm-publication.mjs --auto-high            # accept ALL high-band matches
 *
 * --auto-high is the scheduled workflow's hands-off path: high-confidence
 * matches are recorded automatically (and removed from the queue), surfacing
 * under the "Beta feature" badge that warns they may be inaccurate.
 * --reject records a (paper, doi) pair in data/publication-rejects.json so the
 * matcher stops re-proposing a match validated as wrong. A match left alone
 * just stays in the queue.
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
const today = new Date().toISOString().slice(0, 10);

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {});
function writeSorted(p, obj) {
  const sorted = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = obj[k];
  writeFileSync(p, JSON.stringify(sorted, null, 2) + "\n");
}
// A paperLinks entry from a candidate. `auto` flags the hands-off path.
const linkOf = (c, auto) => ({
  doi: c.doi || null,
  publishedUrl: c.publishedUrl || (c.doi ? `https://doi.org/${c.doi}` : null),
  publishedTitle: c.candidateTitle || null,
  journal: c.journal || null,
  publishedYear: c.candidateYear || null,
  source: c.matchedVia || "manual",
  ...(auto ? { auto: true } : {}),
  verifiedOn: today,
});

// ── --list ───────────────────────────────────────────────────────────────
if (!args.length || args[0] === "--list") {
  for (const c of candidates) {
    console.log(`[${c.band}] ${c.slug}\n    "${c.paperTitle}" (${c.paperYear})\n    → ${c.doi}  "${c.candidateTitle}" (${c.candidateYear})`);
  }
  const high = candidates.filter((c) => c.band === "high").length;
  console.log(`\n${candidates.length} candidate(s) (${high} high, ${candidates.length - high} review).\n  accept:    node scripts/confirm-publication.mjs <slug> ...\n  reject:    node scripts/confirm-publication.mjs --reject <slug> ...\n  auto-high: node scripts/confirm-publication.mjs --auto-high`);
  process.exit(0);
}

// ── --auto-high: record every high-band match, drop them from the queue ────
if (args[0] === "--auto-high") {
  const links = readJson(LINKS);
  const remaining = [];
  let n = 0;
  for (const c of candidates) {
    if (c.band === "high" && c.doi) {
      links[c.slug] = linkOf(c, true);
      n++;
    } else {
      remaining.push(c);
    }
  }
  writeSorted(LINKS, links);
  writeFileSync(CANDIDATES, JSON.stringify(remaining, null, 2) + "\n");
  console.log(`Auto-confirmed ${n} high-confidence match(es) into src/_data/paperLinks.json; ${remaining.length} left in the review queue.`);
  process.exit(0);
}

// ── accept / reject by slug ────────────────────────────────────────────────
const reject = args[0] === "--reject";
const slugs = reject ? args.slice(1) : args;
if (!slugs.length) {
  console.error("No slug given. Usage: confirm-publication.mjs [--reject] <slug> ...");
  process.exit(1);
}
let n = 0;

if (reject) {
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
  const links = readJson(LINKS);
  for (const slug of slugs) {
    const c = candidates.find((x) => x.slug === slug);
    if (!c) { console.error(`! no candidate with slug "${slug}" — skipped`); continue; }
    links[slug] = linkOf(c, false);
    n++;
    console.log(`✓ recorded ${slug} → ${links[slug].doi}`);
  }
  writeSorted(LINKS, links);
  console.log(`\n${n} match(es) recorded in src/_data/paperLinks.json. Rebuild to surface them on the /papers/<slug> pages.`);
}
