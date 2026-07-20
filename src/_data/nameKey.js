/* Shared NetSec-compatible author name key.
 *
 * A faithful port of EISSeuropa/netsec.github.io scripts/sync-bios.py::name_key():
 * NFKD-folded, honorific/apostrophe-stripped, post-nominals + nobiliary
 * particles dropped, reduced to the first + last token ("" when fewer than two
 * name tokens — unmatchable). Deliberately NOT EISS's corpus keyOf() (which
 * keeps middle initials and apostrophes).
 *
 * Extracted so the two EISS surfaces that must speak NetSec's key share one
 * implementation and can't drift apart:
 *   - authorsIndex.js — the author→member join NetSec matches against.
 *   - anthologyAtlas.js — author-node dedup for the Atlas Authors lens (#1129).
 * Keep in step with NetSec if it ever changes its algorithm.
 */
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

module.exports = nameKey;
