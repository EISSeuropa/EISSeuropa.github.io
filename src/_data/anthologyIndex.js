/* Public Anthology index, emitted to /data/anthology-index.json by
 * src/anthology-index.njk.
 *
 * A small, stable data contract for sibling sites (the NetSec repo consumes
 * it to stamp its ESSC programme papers with a link into the Anthology and a
 * "published" marker). The slug algorithm and the publication review both
 * live here, so consumers read the result rather than re-deriving it: trying
 * to reconstruct the slug downstream is a trap (it depends on corpus-wide
 * collision suffixes and the title-drift aliases resolved on this side), and
 * the publication signal lives in paperLinks.json, which is ours to own. This
 * inverts the coupling: EISS owns the computation, siblings consume the data.
 * Same "read a sibling JSON" pattern the codebase already runs on for
 * indico.json and bios.json (CLAUDE.md §13, the paired NetSec ↔ EISS repos).
 *
 * One record per deduplicated paper in paperIndex.js:
 *   title      canonical programme title (already alias-resolved)
 *   year       conference edition
 *   slug       stable per-paper slug ("<conferenceSlug>-<kebab(title)>", deduped)
 *   url        absolute URL of the paper's Anthology page, or null when the
 *              paper has no page (no abstract and no confirmed publication)
 *   published  true when a confirmed published version is on record
 *
 * Match downstream on title (+ year to disambiguate same-title editions);
 * the titles here are the resolved programme titles, so a shared Indico-sourced
 * title matches exactly.
 */
const paperIndex = require("./paperIndex.js");
const site = require("./site.js");

const base = String(site.url || "").replace(/\/$/, "");

module.exports = (paperIndex.papers || []).map((p) => ({
  title: p.title,
  year: p.year || null,
  slug: p.slug || null,
  url: p.paperUrl ? base + p.paperUrl : null,
  published: !!p.publishedUrl,
}));
