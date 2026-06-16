#!/usr/bin/env node
/**
 * Sync helper: refresh src/_data/paperAbstracts.json from EISS Indico.
 *
 * The archive programmes in src/_data/archiveProgrammes.js were transcribed
 * from the printed programmes, which omit abstracts. Indico holds the
 * abstracts for the editions that were run through it. This script fetches
 * each edition's contributions (anonymous /export/* endpoint, no token) and
 * writes a flat lookup keyed by `<year>::<normalised-title>`:
 *
 *   { "2024::how effective were us attempts at reassuring": { abstract, url } }
 *
 * src/_data/archiveProgrammesEnriched.js merges these onto the matching
 * programme contribution by the same key, so the build stays offline and
 * archiveProgrammes.js stays pristine. Matching is exact-on-normalised-title
 * and year-scoped, so a stray match across two different papers is
 * effectively impossible; the cost is that a handful of abstracts whose
 * Indico title differs from the transcription simply don't attach.
 *
 * IMPORTANT — this script OVERWRITES paperAbstracts.json wholesale (it rebuilds
 * the map from the Indico EVENTS below, it does not merge). So this file may
 * only ever hold abstracts for the editions listed in EVENTS. Hand-recovered
 * abstracts for pre-Indico editions (2022 and earlier) live in the sibling
 * src/_data/paperAbstractsManual.json, which this script never reads or writes,
 * precisely so the overwrite cannot strand them. Both files are merged at build
 * time by corpus.js and archiveProgrammesEnriched.js.
 *
 * To see which synced abstracts fail to attach to a paper (Indico-vs-transcription
 * title drift, or a paper missing from the programme), run on demand:
 *   node scripts/check-abstract-coverage.mjs
 *
 * SUBCONTRIBUTIONS ARE OUT OF REACH. This reads contribution-level descriptions
 * only. Papers run as subcontributions of a panel (the panel is the
 * contribution, each paper a subcontribution) keep their abstract on the
 * subcontribution, and Indico's export API does NOT expose subcontribution
 * descriptions at any detail level or auth — the fossil has no description
 * field at all (confirmed by scripts/probe-indico-subcontribs.py, both
 * anonymous and with a Personal Access Token). So a panel's own description
 * syncs (and then strands, matching no single paper) while its papers get
 * nothing. Hand-add those abstracts to paperAbstractsManual.json instead.
 *
 * Editions → Indico event ids (EISS adopted Indico around 2023; add older
 * editions here if/when they gain an Indico event):
 *
 * Usage:  node scripts/sync-abstracts.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = "https://indico.eiss-europa.com";
const EVENTS = { 2023: 1, 2024: 15, 2025: 21, 2026: 22 };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "_data", "paperAbstracts.json");

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&hellip;": "…",
  "&ldquo;": "“", "&rdquo;": "”", "&lsquo;": "‘", "&rsquo;": "’",
};

function stripHtml(s) {
  return String(s || "")
    .replace(/<br\s*\/?>(?=\S)/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&[a-z#0-9]+;/gi, (m) => (m in ENTITIES ? ENTITIES[m] : " "))
    .replace(/\s+/g, " ")
    .trim();
}

// Mirror of the normaliser in archiveProgrammesEnriched.js — keep in step.
function normTitle(t) {
  return String(t || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function abs(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : BASE + (url.startsWith("/") ? url : "/" + url);
}

const out = {};
let totalWithAbstract = 0;
let collisions = 0;

for (const [year, id] of Object.entries(EVENTS)) {
  const url = `${BASE}/export/event/${id}.json?detail=contributions`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`! ${year} (event ${id}): HTTP ${res.status} — skipped`);
    continue;
  }
  const json = await res.json();
  const contribs = json?.results?.[0]?.contributions || [];
  let n = 0;
  for (const c of contribs) {
    const abstract = stripHtml(c.description);
    if (!abstract) continue;
    const key = `${year}::${normTitle(c.title)}`;
    if (out[key]) { collisions++; continue; } // keep first; year-scoped collisions are rare
    out[key] = { abstract, url: abs(c.url) };
    n++;
  }
  totalWithAbstract += n;
  console.log(`  ${year} (event ${id}): ${contribs.length} contributions, ${n} abstracts`);
}

// Stable key order so diffs stay readable across re-syncs.
const sorted = {};
for (const k of Object.keys(out).sort()) sorted[k] = out[k];
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`✓ wrote ${totalWithAbstract} abstracts to src/_data/paperAbstracts.json${collisions ? ` (${collisions} title collisions skipped)` : ""}`);
