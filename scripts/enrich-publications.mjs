#!/usr/bin/env node
/**
 * #805 enrich: backfill bibliographic detail onto the confirmed publication
 * matches in src/_data/paperLinks.json, so a paper's landing page can show a
 * full outlet line (journal, volume, issue, pages), the published author list
 * (which may differ from the conference presenters), and a complete BibTeX
 * citation.
 *
 * For every entry that carries a DOI we ask Crossref (free, no key, polite
 * pool via ?mailto) for the work and copy across:
 *   - volume, issue, pages          ("page" is already a range like "224-244")
 *   - publishedAuthors[]            ("Given Family" strings, in author order)
 *   - journal                       (refreshed from container-title if missing)
 *
 * It only ADDS fields to existing entries (never invents a match), so it is
 * safe to re-run: confirm-publication.mjs records the match, this fills in the
 * detail. New matches confirmed later are picked up on the next run.
 *
 * Usage:  node scripts/enrich-publications.mjs [--force]
 *   --force  re-fetch even entries that already have publishedAuthors.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LINKS = join(ROOT, "src", "_data", "paperLinks.json");
const MAILTO = "contact@eiss-europa.com";
const force = process.argv.includes("--force");

const links = JSON.parse(readFileSync(LINKS, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const authorList = (arr) =>
  (arr || [])
    .map((a) => `${a.given || ""} ${a.family || ""}`.trim() || a.name || "")
    .filter(Boolean);

let enriched = 0;
let skipped = 0;
for (const [slug, link] of Object.entries(links)) {
  if (!link.doi) { skipped++; continue; }
  if (link.publishedAuthors && !force) { skipped++; continue; }
  try {
    const r = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(link.doi)}?mailto=${MAILTO}`,
      { headers: { "User-Agent": `EISS-site/1.0 (mailto:${MAILTO})` } }
    );
    if (!r.ok) { console.warn(`! ${slug}: Crossref ${r.status}`); continue; }
    const m = (await r.json()).message || {};
    if (m.volume) link.volume = String(m.volume);
    if (m.issue) link.issue = String(m.issue);
    if (m.page) link.pages = String(m.page);
    const authors = authorList(m.author);
    if (authors.length) link.publishedAuthors = authors;
    if (!link.journal && (m["container-title"] || [])[0]) link.journal = m["container-title"][0];
    enriched++;
    console.log(`✓ ${slug} — ${link.journal || "?"} ${link.volume || ""}${link.issue ? `(${link.issue})` : ""}${link.pages ? `: ${link.pages}` : ""}`);
  } catch (e) {
    console.warn(`! ${slug}: ${e.message}`);
  }
  await sleep(250); // be polite to the public pool
}

// Match confirm-publication.mjs's on-disk shape: keys sorted, 2-space, newline.
const sorted = {};
for (const k of Object.keys(links).sort()) sorted[k] = links[k];
writeFileSync(LINKS, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nEnriched ${enriched}, skipped ${skipped}. Wrote ${LINKS.replace(ROOT + "/", "")}.`);
