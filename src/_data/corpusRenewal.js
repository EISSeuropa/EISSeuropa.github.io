/* Renewal and collaboration, per annual edition (#1566).
 *
 * Two questions the corpus can answer and no surface asks: is the conference
 * meeting the same people again, and are they writing together. Both are
 * counts over corpus.papers, so this module derives and does not store.
 *
 * Scope: the ANNUAL editions only (label EISS / ESSC). The joint events and
 * the Ukraine workshop are a different kind of object and would read as a
 * collapsed year in a row set about renewal.
 *
 * But first appearance is computed over the WHOLE corpus, joint events
 * included. Somebody who presented at the 2024 joint conference and again at
 * ESSC 2025 is not a first-timer in 2025, and counting them as one would
 * flatter the figure.
 *
 * The caveat that has to travel with these numbers: `canonicalKey` under-
 * merges on purpose (see the dedup philosophy in corpus.js), so one person
 * spelled two ways is two people here, and both are first-timers. The
 * direction of the error is known — first-timers are over-counted, never
 * under-counted — which is why the template says so rather than implying a
 * precision the matching cannot deliver.
 */
const corpus = require("./corpus.js");

const ANNUAL = new Set(["EISS", "ESSC"]);

module.exports = function () {
  const c = typeof corpus === "function" ? corpus() : corpus;
  const dated = c.papers.filter((p) => p.year);
  const authorsOf = (p) =>
    [...new Set((p.authors || []).map((a) => c.canonicalKey(a.name || a)).filter(Boolean))];

  // Earliest year each author appears anywhere in the corpus.
  const firstSeen = new Map();
  for (const p of [...dated].sort((a, b) => a.year - b.year)) {
    for (const k of authorsOf(p)) if (!firstSeen.has(k)) firstSeen.set(k, p.year);
  }

  const years = [
    ...new Set(dated.filter((p) => ANNUAL.has(p.conferenceLabel)).map((p) => p.year)),
  ].sort();

  const rows = years.map((year) => {
    const ps = dated.filter((p) => p.year === year && ANNUAL.has(p.conferenceLabel));
    const people = new Set(ps.flatMap(authorsOf));
    const newcomers = [...people].filter((k) => firstSeen.get(k) === year).length;
    const solo = ps.filter((p) => authorsOf(p).length === 1).length;
    const bylines = ps.reduce((n, p) => n + authorsOf(p).length, 0);
    return {
      year,
      // The label moved from EISS to ESSC in 2026, so it is read off the data
      // rather than assumed.
      label: ps[0].conferenceLabel,
      url: ps[0].conferenceUrl,
      papers: ps.length,
      authors: people.size,
      newcomers,
      newcomerPct: Math.round((100 * newcomers) / people.size),
      soloPct: Math.round((100 * solo) / ps.length),
      authorsPerPaper: (bylines / ps.length).toFixed(2),
    };
  });

  if (!rows.length) throw new Error("corpusRenewal: no annual editions found");

  const first = rows[0];
  const last = rows[rows.length - 1];
  return {
    rows,
    // The two ends, for a sentence that does not have to be re-derived in
    // three locales' worth of template.
    span: { first: first.year, last: last.year },
    newcomerPctFirst: first.newcomerPct,
    newcomerPctLast: last.newcomerPct,
    soloPctFirst: first.soloPct,
    soloPctLast: last.soloPct,
    // The lowest first-timer share on record, which is the more useful end of
    // the trend than the latest edition: a single year can bounce.
    newcomerPctLow: Math.min(...rows.map((r) => r.newcomerPct)),
  };
};
