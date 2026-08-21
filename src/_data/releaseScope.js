// The declared scope of the Anthology and the Atlas (#1499).
//
// "Finish the Anthology" is not a finishable task, so a page-wide marker that
// says early access never comes off, and a reader learns to ignore it. A
// finite, declared scope can be finished, and the parts still filling in can
// be named per edition rather than smeared across the whole page.
//
// The edition half is derived, never hand-maintained: an edition is in scope
// when its abstract coverage is at or above the threshold, counted over the
// papers that are eligible for an abstract (keynotes and roundtables are not).
// The gap in the data is wide, so the threshold is not a fine judgement: the
// four editions from 2023 on sit at 94% and above, and every earlier one at
// 40% and below. Any number between 41 and 94 selects the same four.
//
// scripts/check-release-scope.mjs fails the build if an edition that the page
// declares complete drops back below the threshold.
const paperIndex = require("./paperIndex.js");

const COVERAGE_THRESHOLD = 90;

// The interface half is a judgement rather than a measurement: it says the
// chrome, the controls and the seventeen theme labels are finished work. It
// is the switch that removes the Beta pill from the Atlas.
//
// It is false, and deliberately so: the maintainer's position (21 Aug 2026)
// is that the Atlas is still early-stage development, so the pill stays. The
// switch exists for when that changes, and the gate then checks the pill
// actually went. Nothing measures this, so nothing should flip it but a
// person.
const INTERFACE_READY = false;

module.exports = function () {
  const index = typeof paperIndex === "function" ? paperIndex() : paperIndex;
  const years = index.years || [];
  const inScope = years.filter((y) => y.coverage >= COVERAGE_THRESHOLD);
  const outOfScope = years.filter((y) => y.coverage < COVERAGE_THRESHOLD);
  // First and last year only. The word between them is a word, so it lives in
  // the i18n catalog with the sentence it belongs to rather than being built
  // in English here and pasted into a French page.
  const ends = (list) => {
    const ys = list.map((y) => y.year).sort((a, b) => a - b);
    return { first: ys[0] || null, last: ys[ys.length - 1] || null };
  };
  return {
    coverageThreshold: COVERAGE_THRESHOLD,
    interfaceReady: INTERFACE_READY,
    editions: inScope.map((y) => y.year).sort((a, b) => b - a),
    editionsOut: outOfScope.map((y) => y.year).sort((a, b) => b - a),
    inScopeYears: ends(inScope),
    outOfScopeYears: ends(outOfScope),
    // What is still missing, for the sentence that replaces the blanket note.
    // The weakest edition in scope, so the sentence can state what is true of
    // all of them rather than rounding four editions up to "complete". At the
    // time of writing that is 94%, not 100%: 2024 is 49 of 52 and 2023 is 57
    // of 59.
    minCoverage: inScope.length ? Math.min(...inScope.map((y) => y.coverage)) : 0,
    missingAbstracts: outOfScope.reduce((n, y) => n + (y.eligible - y.withAbstract), 0),
    eligibleOut: outOfScope.reduce((n, y) => n + y.eligible, 0),
  };
};
