/* How related are two papers? (#1148, #1188)
 *
 * One definition of corpus adjacency, shared by the two surfaces that render
 * it, so the weights cannot drift apart:
 *   - paperPages.js  — the "Related in the Anthology" list on each landing
 *                      page, over the ~315 papers that have one.
 *   - anthologyAtlas.js — the optional paper-to-paper edge layer on the
 *                      Atlas's Papers lens, over all 511 papers.
 *
 * Scored, not clustered. A shared author is the strongest signal (people
 * carry research agendas across editions), a shared panel next (a programme
 * committee put them in the same room), a shared research theme weakest
 * because many papers share one. Ties break toward the nearer edition.
 *
 * Input is paperIndex-shaped rows: { authors[], theme[], panel, year }.
 * Author identity goes through the shared NetSec-compatible nameKey, so
 * spelling and diacritic variants of the same person still join.
 *
 * ponytail: O(n²) pairwise scan, ~130k comparisons at 511 papers, a few ms
 * at build time. Precompute a theme -> papers index if the corpus 10×es.
 */
const nameKey = require("./nameKey.js");

const WEIGHT_AUTHOR = 5;
const WEIGHT_PANEL = 3;
const WEIGHT_THEME = 2;

// Per-paper matching sets, built once so the pairwise loop stays cheap.
function indexOf(papers) {
  return papers.map((p) => ({
    authorKeys: new Set((p.authors || []).map(nameKey).filter(Boolean)),
    themes: new Set(p.theme || []),
  }));
}

// For each paper, its top `max` neighbours as { index, score, dist }, best
// first. Papers with no shared anything get an empty list.
function neighbours(papers, max) {
  const meta = indexOf(papers);
  return papers.map((p, i) => {
    const scored = [];
    for (let j = 0; j < papers.length; j++) {
      if (j === i) continue;
      const q = papers[j];
      let sharedAuthors = 0;
      for (const k of meta[j].authorKeys) if (meta[i].authorKeys.has(k)) sharedAuthors++;
      let sharedThemes = 0;
      for (const t of meta[j].themes) if (meta[i].themes.has(t)) sharedThemes++;
      const samePanel = p.panel && q.panel === p.panel && q.year === p.year;
      const score =
        sharedAuthors * WEIGHT_AUTHOR +
        (samePanel ? WEIGHT_PANEL : 0) +
        sharedThemes * WEIGHT_THEME;
      if (score > 0) scored.push({ index: j, score, dist: Math.abs((q.year || 0) - (p.year || 0)) });
    }
    scored.sort(
      (a, b) =>
        b.score - a.score ||
        a.dist - b.dist ||
        String(papers[a.index].title).localeCompare(String(papers[b.index].title))
    );
    return scored.slice(0, max);
  });
}

module.exports = { neighbours, WEIGHT_AUTHOR, WEIGHT_PANEL, WEIGHT_THEME };
