#!/usr/bin/env node
/**
 * Sync helper: refresh src/_data/netsecDirectory.json from the NetSec site.
 *
 * NetSec publishes a slim, purpose-built directory index at
 * https://netsec-cost.eu/directory-index.json (the mirror of the
 * /data/anthology-index.json EISS publishes for NetSec to consume). Shape:
 *
 *   { "generated_at": "…", "count": 37, "members": [
 *       { "name": "Dr Mattia Sguazzini", "name_key": "mattia sguazzini",
 *         "aliases": [], "slug": "mattia-sguazzini",
 *         "url": "https://netsec-cost.eu/people/mattia-sguazzini.html",
 *         "orcid": null } ] }
 *
 * corpus.js folds these into a name → NetSec-profile lookup so an Anthology
 * author who also has a directory profile carries a link to it (#966). The
 * join key is a name key (NetSec's `name_key`, which drops middle initials,
 * plus EISS's own canonicalKey of `name` and any `aliases`). ORCID is NOT a
 * join key here: Anthology authors carry no ORCID, so it cannot match or
 * disambiguate anything. The safety net is name + the reject list in
 * src/_data/netsecDirectoryRejects.json.
 *
 * Why consume the published index rather than NetSec's raw bios.json: the
 * index pins neither NetSec's internal bio schema nor the /people/<id>.html
 * URL scheme (the `url` is published, so EISS never hardcodes it).
 *
 * This OVERWRITES src/_data/netsecDirectory.json wholesale. If the index is
 * not reachable yet (NetSec still building it, network blip), the script
 * leaves the existing snapshot untouched and exits 0 — the build keeps the
 * last-known directory. A reachable-but-malformed index exits 1.
 *
 * Run: node scripts/sync-netsec-directory.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "src", "_data", "netsecDirectory.json");
const INDEX_URL = process.env.NETSEC_DIRECTORY_URL || "https://netsec-cost.eu/directory-index.json";

async function main() {
  let res;
  try {
    res = await fetch(INDEX_URL, { headers: { accept: "application/json" } });
  } catch (err) {
    console.warn(`! could not reach ${INDEX_URL} (${err.message}); leaving the existing snapshot in place.`);
    return 0;
  }
  if (res.status === 404) {
    console.warn(`! ${INDEX_URL} is not published yet (404); leaving the existing snapshot in place.`);
    return 0;
  }
  if (!res.ok) {
    console.error(`✗ ${INDEX_URL} returned HTTP ${res.status}.`);
    return 1;
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error(`✗ ${INDEX_URL} did not return valid JSON: ${err.message}`);
    return 1;
  }
  if (!data || !Array.isArray(data.members)) {
    console.error("✗ directory index is missing a `members` array.");
    return 1;
  }

  // Keep only the fields EISS consumes, drop the rest, and sort by slug so the
  // committed file diffs cleanly when a single member changes.
  const members = data.members
    .filter((m) => m && m.name && m.url)
    .map((m) => ({
      name: m.name,
      name_key: m.name_key || "",
      aliases: Array.isArray(m.aliases) ? m.aliases : [],
      slug: m.slug || "",
      url: m.url,
      orcid: m.orcid || null,
    }))
    .sort((a, b) => (a.slug || a.name).localeCompare(b.slug || b.name));

  const out = {
    generated_at: data.generated_at || new Date().toISOString(),
    count: members.length,
    source: INDEX_URL,
    members,
  };

  const prev = (() => {
    try { return readFileSync(DEST, "utf8"); } catch { return ""; }
  })();
  const next = JSON.stringify(out, null, 2) + "\n";
  if (next === prev) {
    console.log(`✓ netsecDirectory.json already up to date (${members.length} members).`);
    return 0;
  }
  writeFileSync(DEST, next);
  console.log(`✓ wrote ${members.length} members to src/_data/netsecDirectory.json.`);
  return 0;
}

process.exit(await main());
