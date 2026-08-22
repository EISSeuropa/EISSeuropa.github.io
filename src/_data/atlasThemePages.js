// Pagination source for the per-theme Atlas pages (#1255).
//
// #1151 made the Atlas deep-linkable, but a query string cannot carry Open
// Graph tags: crawlers do not run JavaScript and do not distinguish
// ?themes=Deterrence from the bare URL, so every shared view produced the same
// card. These are real URLs with their own <title>, description and share
// card, which is the only shape that works with a crawler.
//
// Themes only, not editions. #1255 offered both and flagged 29 pages as a real
// cost in build time, sitemap weight and search noise; the maintainer took the
// issue's own alternative, since theme views are the ones people share and
// edition views are already well served by the per-year conference pages.
//
// The query-string form keeps working exactly as before. These pages are an
// addition, and each links to its equivalent ?themes= view so the two cannot
// drift apart.
const atlas = require("./anthologyAtlas.js");
const corpus = require("./corpus.js");
const paperIndex = require("./paperIndex.js");

// URL key for a theme name. Deliberately not the display name: theme names
// carry spaces, commas and slashes ("Arms acquisition and transfer",
// "Intelligence, surveillance and privacy"), none of which belong in a path.
// The name itself stays the join key everywhere else, because that is what
// the Atlas JS and the ?themes= param already agree on.
function themeSlug(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = function () {
  const data = typeof atlas === "function" ? atlas() : atlas;
  const index = typeof paperIndex === "function" ? paperIndex() : paperIndex;
  const counts = Object.fromEntries((index.themes || []).map((t) => [t.name, t.count]));

  // The theme vocabulary is ours, so it is translated (#1492). The English
  // name stays the key everywhere, and the label rides alongside it (#1495).
  const corpusData = typeof corpus === "function" ? corpus() : corpus;
  const labelByName = new Map(
    Object.values(corpusData.themeLabels || {}).map((l) => [l.en, l])
  );
  return (data.themes || []).map((name) => {
    const papers = (data.papers || []).filter((p) => (p.themes || []).includes(name));
    const years = papers.map((p) => p.year).filter(Boolean).sort();
    const first = years[0] || null;
    const last = years[years.length - 1] || null;
    return {
      name,
      label: labelByName.get(name) || { en: name },
      slug: themeSlug(name),
      count: counts[name] || papers.length,
      // Ends only, so the word between them can come from the locale's own
      // catalog rather than being built in English here (#1495). yearRange
      // stays for the English surfaces that already read it.
      firstYear: first,
      lastYear: last,
      yearRange: first && last ? (first === last ? String(first) : `${first} to ${last}`) : "",
      authorCount: new Set(papers.flatMap((p) => p.authors || [])).size,
    };
  });
};

module.exports.themeSlug = themeSlug;
