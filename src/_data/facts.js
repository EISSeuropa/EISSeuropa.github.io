// EISS in numbers (#1864): one computed fact sheet that every anniversary
// post, press release and the metrics issue draw on, so no figure is typed
// twice and none can disagree with the page it describes. Each number is
// read from the data file the site itself renders, never retyped here.
// Published as /data/facts.json (src/facts-json.njk) and read directly by
// scripts/make-anniversary-posts.py.
//
// ponytail: no page renders it yet. The press kit block waits until the
// anniversary launch (#1862), so this ships with nothing front facing.

const conferences = require("./conferences.js");
const paperIndex = require("./paperIndex.js");
const corpus = require("./corpus.js");
const netsec = require("./netsec.js");
const board = require("./board.json");
const prizeLaureates = require("./prizeLaureates.js")();

// Held editions have an ordinal. 2020 has none: it was deferred to Lisbon 2021.
const held = conferences.all.filter((e) => e.ordinal).sort((a, b) => a.year - b.year);
const past = held.filter((e) => conferences.past.some((p) => p.slug === e.slug));
const next = conferences.next;

const unique = (xs) => [...new Set(xs)];

// Per-edition paper counts, as the Anthology page shows them.
const papersByYear = Object.fromEntries(paperIndex.years.map((y) => [y.year, y.count]));

module.exports = {
  founded: 2017,
  firstConference: { city: held[0].city, startDate: held[0].startDate },
  conferences: {
    held: past.length,
    cities: unique(held.map((e) => e.city)),
    countries: unique(held.map((e) => e.country)).length,
    next: next && {
      ordinal: next.ordinal,
      city: next.city,
      startDate: next.startDate,
      endDate: next.endDate,
    },
    // `attendance` stays absent until #1858 records a sourced figure.
    editions: held.map((e) => ({
      year: e.year,
      ordinal: e.ordinal,
      city: e.city,
      country: e.country,
      venue: e.venue?.en,
      dates: e.dates?.en,
      startDate: e.startDate,
      papers: papersByYear[e.year] || 0,
      ...(e.attendance ? { attendance: e.attendance } : {}),
    })),
  },
  anthology: {
    // paperIndex, not corpus.stats: corpus counts one entry per contribution
    // (519), the Anthology and /initiative show papers (511).
    papers: paperIndex.stats.paperCount,
    authors: corpus.stats.speakerCount,
    editions: corpus.stats.editions,
    themes: corpus.themes.length,
    abstracts: paperIndex.stats.abstractCount,
    abstractsEligible: paperIndex.stats.eligiblePaperCount,
    doi: "10.5281/zenodo.21776209",
  },
  netsec: {
    action: "CA24154",
    start: "2025-10-10",
    end: "2029-10-09",
    foundingInstitutions: netsec.partnerInstitutions,
    managementCommittee: netsec.managementCommittee,
    asOfDate: netsec.asOfDate,
  },
  people: {
    board: board.members.filter((m) => !m.formerMember).length,
    // Everyone who has left a role: former board members and support staff
    // with an end date. Entries are never deleted, so this only grows.
    alumni:
      board.members.filter((m) => m.formerMember).length +
      board.support.filter((s) => s.roleEndDate).length,
  },
  prize: { laureates: prizeLaureates.bestPaper.length, since: Math.min(...prizeLaureates.years) },
};
