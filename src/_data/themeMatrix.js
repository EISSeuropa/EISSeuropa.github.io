/* Theme co-occurrence, every pair at once (#1567).
 *
 * The bridge view (#1468) answers "what do these two themes share", one pair
 * at a time, and it is the most interesting thing the map knows. 70 of the 136
 * possible pairs are used, so a reader working the hub panel press by press is
 * walking a structure nothing shows them whole.
 *
 * Built from anthologyAtlas.js, the same data the bridge view reads, so the
 * matrix and the bridge cannot disagree about a count.
 *
 * Not a canvas. The whole point of this view is that it is markup: it survives
 * a screenshot, a slide and a screen reader, none of which the map does.
 */
const atlas = require("./anthologyAtlas.js");
const themePages = require("./atlasThemePages.js");

module.exports = function () {
  const data = typeof atlas === "function" ? atlas() : atlas;
  const names = data.themes || [];
  const pageByName = new Map(themePages().map((t) => [t.name, t]));
  const at = new Map(names.map((n, i) => [n, i]));

  // Upper triangle only, mirrored on read. A pair is a pair.
  const counts = names.map(() => names.map(() => 0));
  const totals = names.map(() => 0);
  for (const p of data.papers || []) {
    const t = [...new Set(p.themes || [])].filter((n) => at.has(n));
    for (const n of t) totals[at.get(n)] += 1;
    for (let x = 0; x < t.length; x++) {
      for (let y = x + 1; y < t.length; y++) {
        const i = at.get(t[x]);
        const j = at.get(t[y]);
        counts[i][j] += 1;
        counts[j][i] += 1;
      }
    }
  }

  const max = Math.max(0, ...counts.flat());
  const rows = names.map((name, i) => ({
    i,
    number: i + 1,
    name,
    label: (pageByName.get(name) || {}).label || { en: name },
    slug: (pageByName.get(name) || {}).slug || "",
    total: totals[i],
    cells: names.map((other, j) => ({
      j,
      other,
      otherLabel: (pageByName.get(other) || {}).label || { en: other },
      n: counts[i][j],
      diagonal: i === j,
      // 0 to 1, for the cell shading. Linear on the busiest pair: the
      // distribution is shallow (18 at the top, most of the used pairs in
      // single figures), so a log scale would flatten the thing the reader
      // is looking for.
      weight: max ? counts[i][j] / max : 0,
    })),
  }));

  // The same pairs ranked. This is the grid's data in the shape a phone can
  // read, and site.css shows exactly one of the two at a time, so a screen
  // reader is never handed both.
  const pairs = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (!counts[i][j]) continue;
      pairs.push({
        a: names[i],
        b: names[j],
        labelA: rows[i].label,
        labelB: rows[j].label,
        n: counts[i][j],
      });
    }
  }
  pairs.sort((x, y) => y.n - x.n || x.a.localeCompare(y.a));

  return {
    rows,
    pairs,
    max,
    pairsUsed: pairs.length,
    pairsPossible: (names.length * (names.length - 1)) / 2,
  };
};
