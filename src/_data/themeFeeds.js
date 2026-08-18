// Per-theme Atom feed data (#1256).
//
// One feed per research theme, so someone who follows a subject learns when
// the corpus gains something in it. The Anthology grows in bursts (an edition
// lands, or a batch of recovered abstracts attaches) and between bursts there
// is no reason to return. A feed is the lowest-commitment subscription there
// is: no account, no personal data, nothing stored on our side, which suits a
// site that runs without tracking.
//
// ENTRY DATE. The corpus carries a year, not a date. #1256 weighed three
// options and took the tracked added-date, because "an abstract you were
// waiting for is now on file" is the notification with real value and a
// conference date cannot express it. src/_data/corpusLedger.json holds
// firstSeen and abstractSeen per paper; an entry takes the LATER of the two,
// which is what makes a recovered abstract surface years after its edition.
//
// The <updated> on each feed derives from its newest entry, never from build
// time. This repo has a scheduled rebuild, so a build-time timestamp would
// tell every subscriber that everything changed, on a timer.
const paperIndex = require("./paperIndex.js");
const ledger = require("./corpusLedger.json");
const atlasThemePages = require("./atlasThemePages.js");
const site = require("./site.js");

// A feed carrying all 76 warfare-transformation papers on every fetch is
// wasteful and no reader wants it (#1256 step 3).
const MAX_ENTRIES = 50;

// RFC 3339, which Atom requires. The ledger stores plain dates, so noon UTC
// keeps an entry on its intended day in every timezone a reader might be in.
const rfc3339 = (day) => `${day}T12:00:00Z`;

module.exports = function () {
  const index = typeof paperIndex === "function" ? paperIndex() : paperIndex;
  const themes = typeof atlasThemePages === "function" ? atlasThemePages() : atlasThemePages;
  const dates = ledger.papers || {};
  const base = String(site.url || "").replace(/\/$/, "");

  return themes.map((theme) => {
    const entries = (index.papers || [])
      .filter((p) => p.slug && (p.theme || []).includes(theme.name))
      .map((p) => {
        const d = dates[p.slug] || {};
        // The later of the two dates: a paper that gained an abstract is news
        // again, on the day the abstract landed.
        const day = [d.firstSeen, d.abstractSeen].filter(Boolean).sort().pop() || null;
        const isNewAbstract = !!(d.abstractSeen && d.abstractSeen === day && d.firstSeen !== day);
        return {
          slug: p.slug,
          title: p.title,
          authors: p.authors || [],
          year: p.year,
          conferenceLabel: p.conferenceLabel,
          abstract: p.abstract || null,
          // Papers with a landing page link there; the rest deep-link into the
          // by-paper view, which is where they are readable.
          url: p.paperUrl ? base + p.paperUrl : `${base}/anthology.html?view=papers#paper-${p.slug}`,
          id: `${base}/papers/${p.slug}`,
          day,
          updated: day ? rfc3339(day) : null,
          isNewAbstract,
        };
      })
      .filter((e) => e.updated)
      .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : a.title < b.title ? -1 : 1))
      .slice(0, MAX_ENTRIES);

    return {
      ...theme,
      entries,
      // Newest entry wins. No entries means no feed-level date, and the
      // template omits the feed rather than emitting an invalid one.
      updated: entries.length ? entries[0].updated : null,
      feedUrl: `${base}/feeds/themes/${theme.slug}.xml`,
      pageUrl: `${base}/anthology-atlas/theme/${theme.slug}.html`,
    };
  });
};
