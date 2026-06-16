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
