// The active volunteers for the Volunteers card on /internal.html (#2230): the
// people on /board's support list whose end date has not passed, grouped by
// that date and named after the cohort that ends on it. Names come from
// board.json, which publishes only people who chose a profile. The count of
// everyone active, and of joining requests waiting for approval, comes from
// the EISS status web app through systemHealth.js.

const boardSorted = require("./boardSorted.js");
// The "EISS people lifecycle" Sheet, where a joining request is approved. Opens
// only for those with access, like the other Google links in site.js.
const SHEET = "https://docs.google.com/spreadsheets/d/1IhVaMsP-3t9TQr5mQJfOxstSOTUGyZA8b-wLBglVPr0/edit";
const cohorts = require("./cohorts.json");

module.exports = function () {
  const today = new Date().toISOString().slice(0, 10);
  const groups = new Map();
  for (const p of boardSorted().support) {
    if (!p.roleEndDate || p.roleEndDate < today) continue;
    if (!groups.has(p.roleEndDate)) groups.set(p.roleEndDate, []);
    groups.get(p.roleEndDate).push({ name: p.name, slug: p.slug });
  }
  const list = [...groups.keys()].sort().map((end) => {
    const cohort = cohorts.find((c) => c.end === end);
    return { end, cohort: cohort ? cohort.name : null, people: groups.get(end) };
  });
  return { groups: list, listed: list.reduce((n, g) => n + g.people.length, 0), sheet: SHEET };
};
