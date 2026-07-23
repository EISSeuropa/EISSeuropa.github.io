/* Co-authors per speaker (#1150).
 *
 * The Atlas already computes co-authorship for its Authors lens; this is the
 * same relation joined back onto the by-person view, so an author's entry
 * lists who they wrote with. Pairs are counted over paperIndex.papers (the
 * deduplicated list, so a paper duplicated across corpus rows can't double-
 * count) and keyed by corpus.canonicalKey — the SAME key speakerMap dedups
 * on, so every co-author resolves to a speaker entry and its #person-<slug>
 * anchor on the page.
 *
 * Shape: { [speakerKey]: [{ name, slug, shared }] }, ordered by shared paper
 * count (desc) then name. Speakers with no co-authored paper are absent.
 */
const corpus = require("./corpus.js");
const paperIndex = require("./paperIndex.js");

module.exports = (() => {
  const speakerByKey = new Map(corpus.speakers.map((s) => [s.key, s]));

  // key -> Map(otherKey -> shared paper count)
  const pairs = new Map();
  for (const p of paperIndex.papers || []) {
    const keys = [...new Set((p.authors || []).map(corpus.canonicalKey).filter(Boolean))];
    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        if (i === j) continue;
        const m = pairs.get(keys[i]) || new Map();
        m.set(keys[j], (m.get(keys[j]) || 0) + 1);
        pairs.set(keys[i], m);
      }
    }
  }

  const out = {};
  for (const [key, m] of pairs) {
    const list = [...m.entries()]
      .map(([other, shared]) => {
        const s = speakerByKey.get(other);
        return s ? { name: s.name, slug: s.slug, shared } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.shared - a.shared || a.name.localeCompare(b.name));
    if (list.length) out[key] = list;
  }
  return out;
})();
