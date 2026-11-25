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
// The editors' "Belvedere tracker" Sheet in the EISS shared drive. Its counts
// reach the tab through the status web app (?view=belvedere).
const BELVEDERE = "https://docs.google.com/spreadsheets/d/1t0teYNLVrH1pskoAvtUm01LA6TX1KQVl0xnaLtOtyxs/edit";
// "Volunteer applications", the application form's responses in EISS Restricted.
// Its counts reach the tab through the status web app (#2268).
const APPLICATIONS = "https://docs.google.com/spreadsheets/d/1VjfSUfTWyzw9bo2x5UW0FuoS7o5L_rs_g0_Ntd3OHXk/edit";
// The lifecycle script counts applications for the earliest cohort whose call has
// opened and whose reply week, this many days after applyBy, has not passed.
const REPLY_DAYS = 7;
// The tab's cohort dates: the call, the deadline, the start and the end of the
// cohort under way or next, and of the one after it (#2235).
const DATE_KEYS = ["callOpens", "applyBy", "start", "end"];

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
  const dates = cohorts
    .filter((c) => c.end >= today)
    .slice(0, 2)
    .flatMap((c) => DATE_KEYS.filter((k) => c[k]).map((k) => ({ date: c[k], key: k, cohort: c.name })))
    .sort((a, b) => a.date.localeCompare(b.date));
  // The cohort under way, if any: the Belvedere card counts its posts.
  const current = cohorts.find((c) => c.start <= today && c.end >= today) || null;
  // The call the Applications tiles count, by the lifecycle script's rule, and
  // whether its closing date has passed, which turns unreviewed applications orange.
  const replyEnd = (c) => {
    const d = new Date(c.applyBy + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + REPLY_DAYS);
    return d.toISOString().slice(0, 10);
  };
  const call = cohorts
    .filter((c) => c.callOpens <= today && replyEnd(c) >= today)
    .sort((a, b) => a.applyBy.localeCompare(b.applyBy))[0] || null;
  const applications = { sheet: APPLICATIONS, call: call ? call.name : null, closed: call ? call.applyBy < today : false };
  return { groups: list, listed: list.reduce((n, g) => n + g.people.length, 0), sheet: SHEET, belvedere: BELVEDERE, dates, current, applications };
};
