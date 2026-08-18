// <lastmod> dates for the sitemap, keyed by page URL (#1293).
//
// Opting the 315 paper pages into the sitemap quadruples it, and without dates
// they read as undifferentiated bulk: a crawler learns that 420 URLs exist but
// nothing about which are worth revisiting. The corpus ledger (#1256) already
// records when each paper appeared and when its abstract attached, so the data
// for a real per-page lastmod is on hand.
//
// Paper pages only. <lastmod> is optional per URL in the sitemap protocol, so
// pages with no trustworthy date simply omit it, which is honest. Deriving a
// date for the hand-written pages would mean build time or git mtime: build
// time is a lie that changes on every scheduled rebuild, and git mtime is not
// available at build time without shelling out per file.
const ledger = require("./corpusLedger.json");

module.exports = function () {
  const out = {};
  for (const [slug, dates] of Object.entries(ledger.papers || {})) {
    // The later of the two, matching what the feeds use as an entry date: a
    // paper whose abstract landed later genuinely changed later.
    const day = [dates.firstSeen, dates.abstractSeen].filter(Boolean).sort().pop();
    if (day) out[`/papers/${slug}.html`] = day;
  }
  return out;
};
