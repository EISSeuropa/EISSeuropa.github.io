// Laureate roll for the /prizes page (#639), derived entirely from the
// Anthology corpus so it stays in step with the paper data and needs no
// second source of truth. A paper wins by being keyed in paperPrizes.json
// (corpus.js attaches the `prize` object); this module simply gathers those
// papers and shapes them for display. Adding a laureate is still a one-line
// edit to paperPrizes.json — nothing here changes.
//
// Each laureate carries the link to its Anthology paper page, so the prize
// page leans on the entries that already hold the abstract, the published
// version, and the citation export.

const corpus = require("./corpus.js");

module.exports = function () {
  const v = typeof corpus === "function" ? corpus() : corpus;

  const bestPaper = (v.papers || [])
    .filter((p) => p.prize)
    .map((p) => {
      const authors = (p.authors || []).map((a) => a.name || a);
      return {
        year: p.year,
        url: `/papers/${p.slug}.html`,
        // The title the paper is known by: the published title when there is
        // one, otherwise the conference title.
        title: p.publishedTitle || p.title,
        authors,
        affiliation: (p.authors && p.authors[0] && p.authors[0].affiliation) || "",
        award: p.prize.award,
        partner: p.prize.partner,
        published: !!p.publishedUrl,
      };
    })
    // Newest year first; within a year, alphabetical by title so a tie
    // (two winners in 2026) is deterministic.
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  return {
    bestPaper,
    years: [...new Set(bestPaper.map((l) => l.year))],
  };
};
