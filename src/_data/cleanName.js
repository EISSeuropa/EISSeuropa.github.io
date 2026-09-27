/* A person's display name with leading honorifics removed (#1715):
 * "Prof. Jane Doe" -> "Jane Doe", "Professor Sir Hew Strachan" -> "Hew
 * Strachan". Case-sensitive on purpose, so only a capitalised title at the
 * start goes, never part of a name. Matching is separate (corpus.js keyOf,
 * nameKey.js), which already ignores titles.
 *
 * One implementation for the two places names are printed: corpus.js cleans
 * the Anthology's copy (paper pages, lists, Atlas, citation exports), and
 * .eleventy.js registers it as the `cleanName` filter for the programme
 * grids, which print the programme data as transcribed. Like nameKey.js it
 * sits in _data only to be required; Eleventy calling it yields "".
 */
const HONORIFIC = /^(Prof(?:essor)?\.?|Dr\.?|Sir|Dame|Mr\.?|Mrs\.?|Ms\.?|Mx\.?)\s+/;

function cleanName(name) {
  let s = String(name || "").trim();
  let prev;
  do {
    prev = s;
    s = s.replace(HONORIFIC, "");
  } while (s !== prev);
  return s.trim();
}

module.exports = cleanName;
