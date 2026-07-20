/* Anthology Atlas data feed, emitted to /data/anthology-atlas.json by
 * src/anthology-atlas.njk, consumed by src/assets/js/anthology-atlas.js.
 *
 * A soft-launch proof of concept (#1124): a force-directed map of the paper
 * corpus, papers ↔ theme hubs. It is a SIBLING of the NetSec Atlas
 * (netsec.github.io#1394) — where NetSec maps *people*, this maps *papers*,
 * so the two don't duplicate each other (CLAUDE.md: don't rebuild NetSec's
 * systems).
 *
 * There is no new derivation pipeline: paperIndex.js already carries the
 * 17-theme multi-tag facet, and that facet *is* the bipartite hub structure.
 * This module just projects the fields the canvas renderer needs into a lean,
 * build-generated JSON — the same emit-a-JSON-permalink pattern as
 * anthologyIndex.js. Nothing here is hand-maintained: change a paper or a
 * theme rule in paperIndex.js and the map (and its stats strip) follow.
 *
 * One record per deduplicated paper:
 *   title      canonical programme title (alias-resolved upstream)
 *   year       conference edition (drives the dot colour ramp)
 *   themes     theme-facet names for this paper (its hub links; [] = UNTAGGED)
 *   authors    display names (byline shown in the hover card)
 *   panel      session/panel title (hover card context)
 *   url        landing page when one exists, else the programme deep-link
 *   hasPage    true when the paper has an Anthology landing page (315/511)
 *   published  true when a confirmed published version is on record (51)
 *   prize      true for a Best Paper Prize winner (4)
 */
const paperIndex = require("./paperIndex.js");

// Canonical theme order = the order themes appear in paperIndex's facet
// (its THEME_MATCH order), so the hub ring is laid out stably build-to-build.
const themes = (paperIndex.themes || []).map((t) => t.name);

// Distinct editions, newest first, for the year colour ramp + chips.
const years = (paperIndex.years || []).map((y) => y.year);

const papers = (paperIndex.papers || []).map((p) => ({
  title: p.title,
  year: p.year || null,
  themes: p.theme || [],
  authors: p.authors || [],
  panel: p.panel || null,
  url: p.paperUrl || p.programmeUrl || null,
  hasPage: !!p.paperUrl,
  published: !!p.publishedUrl,
  prize: !!p.prize,
}));

module.exports = {
  _doc:
    "Build-generated from src/_data/paperIndex.js for the Anthology Atlas " +
    "canvas renderer (src/assets/js/anthology-atlas.js, #1124). Do not edit " +
    "by hand — regenerated on every build.",
  themes,
  years,
  papers,
};
