/**
 * Computed view over src/_data/news.json — the hand-curated news feed
 * behind the homepage "Latest" surface (#96), the /news archive, and the
 * Atom feed at /feed.xml (#605).
 *
 * news.json is the raw store: a flat array of items, each
 *   { date: "YYYY-MM-DD", type, title, url?, excerpt? }
 * It is what the issue-driven publisher (#634) appends to, so it stays a
 * plain array with no computed fields. This module is the read side: it
 * sorts newest-first, derives a stable slug + ISO timestamp per item, and
 * splits out the `recent` window the homepage shows.
 *
 * Item shape consumed by templates:
 *   date     ISO "YYYY-MM-DD" (sort key + displayed)
 *   type     one of paper | event | press | podcast (drives the chip label
 *            via the i18n catalog; an unknown type renders verbatim)
 *   title    plain text, authored once in English (per-locale news pages
 *            show the same item titles, like the Anthology paper pages)
 *   url      optional; when present the headline links out, else it's text
 *   excerpt  optional ~2-line summary
 *   slug     derived from the title, used for the /news anchor + feed id
 *   isoDate  date as a full ISO instant (midnight UTC) for <time> + Atom
 *
 * Decay (#96): items older than RECENT_MONTHS rotate off the homepage but
 * stay on /news forever. The homepage shows at most HOMEPAGE_MAX recent
 * items.
 */

const raw = require("./news.json");

const RECENT_MONTHS = 18;
const HOMEPAGE_MAX = 5;
const FEED_MAX = 20;

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

module.exports = function () {
  // Annotate + sort newest-first. A stable tiebreak on slug keeps the
  // order deterministic when two items share a date (e.g. several items
  // filed on a conference day).
  const items = raw
    .filter((it) => it && it.date && it.title)
    .map((it) => ({
      ...it,
      slug: slugify(it.title),
      isoDate: new Date(it.date + "T00:00:00Z").toISOString(),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1));

  // Guard against duplicate slugs (two items with near-identical titles):
  // suffix later collisions so anchors + feed ids stay unique.
  const seen = new Set();
  for (const it of items) {
    let s = it.slug;
    let n = 2;
    while (seen.has(s)) s = `${it.slug}-${n++}`;
    it.slug = s;
    seen.add(s);
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RECENT_MONTHS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const recent = items.filter((it) => it.date >= cutoffIso);

  return {
    items, // full archive, newest-first
    recent, // within the decay window
    homepage: recent.slice(0, HOMEPAGE_MAX),
    feed: items.slice(0, FEED_MAX),
    updated: items.length ? items[0].isoDate : new Date().toISOString(),
    count: items.length,
  };
};
