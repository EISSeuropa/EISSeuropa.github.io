/* Public author index, emitted to /data/authors-index.json by
 * src/authors-index.njk.
 *
 * The symmetric counterpart of the NetSec directory-index.json EISS consumes
 * (#966): NetSec links a member's profile to that person's Anthology entry by
 * matching its member `name_key` against this file's `authors[].name_key`,
 * then linking to `url`. So the two contracts are mirror images, and the same
 * "publish a small JSON, sibling consumes it" pattern as anthology-index.json
 * (CLAUDE.md §13).
 *
 * `name_key` MUST be produced the same way both sides canonicalise names, or
 * the keys won't meet. So this replicates NetSec's sync-bios.py::name_key()
 * verbatim — NOT EISS's corpus keyOf() (which keeps middle initials and
 * apostrophes). Keep the two in step if NetSec ever changes its algorithm.
 *
 * One record per deduplicated Anthology author:
 *   name        display name (honorific-stripped, as shown in the by-person view)
 *   name_key    "first last" — NFKD-folded, honorific/apostrophe-stripped,
 *               post-nominals + nobiliary particles dropped, first + last
 *               token only ("" when fewer than two name tokens — unmatchable)
 *   aliases     alternate name_keys (none for now; reserved for name-variant
 *               enrichment if NetSec hits misses)
 *   url         absolute URL of the author's by-person entry (?person=<slug>)
 *   paper_count deduplicated contribution count
 *
 * Build-output only (a permalink, never committed), regenerated from corpus.js
 * on every build, so it can't lag the author list. No sync workflow on this
 * side — NetSec fetches it, exactly as EISS fetches their directory-index.json.
 */
const corpus = require("./corpus.js");
const site = require("./site.js");

const base = String(site.url || "").replace(/\/$/, "");

// Faithful port of EISSeuropa/netsec.github.io scripts/sync-bios.py::name_key().
const HONORIFIC_RE = /^(professor|prof|doctor|dr|mr|mrs|ms|mx)(?:\.\s*|\s+)/i;
const POST_NOMINALS = new Set(["phd", "jr", "sr", "ii", "iii", "iv", "esq"]);
const PARTICLES = new Set([
  "de", "del", "della", "di", "da", "das", "dos",
  "van", "von", "vom", "der", "den", "ter", "ten",
  "la", "le", "el", "al", "ibn", "bin", "bint",
  "zu", "auf", "af",
]);
function nameKey(name) {
  let s = String(name || "").normalize("NFKD").replace(/[̀-ͯ]/g, "");
  s = s.replace(HONORIFIC_RE, "");
  s = s.replace(/[‘’ʼ'`]/g, ""); // ' ' ʼ ' `
  let tokens = s.split(/[^A-Za-z]+/).filter(Boolean).map((t) => t.toLowerCase());
  tokens = tokens.filter((t) => !POST_NOMINALS.has(t) && !PARTICLES.has(t));
  if (tokens.length < 2) return "";
  return tokens[0] + " " + tokens[tokens.length - 1];
}

const authors = (corpus.speakers || [])
  .map((s) => ({
    name: s.name,
    name_key: nameKey(s.name),
    aliases: [],
    url: `${base}/anthology.html?person=${s.slug}`,
    paper_count: s.count || 0,
  }))
  .sort((a, b) => a.name_key.localeCompare(b.name_key) || a.name.localeCompare(b.name));

module.exports = {
  generated_at: new Date().toISOString(),
  source: `${base}/anthology.html`,
  count: authors.length,
  authors,
};
