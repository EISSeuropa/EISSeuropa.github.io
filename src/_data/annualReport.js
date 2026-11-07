// The annual report drafts at /internal/report-YYYY.html: one per calendar year
// from FIRST, each figure beside the year before's, read from the data files
// the site already renders. Staff add the prose in annualReportNotes.json.
// NetSec comes from netsecReport, summed per year by the netsecYear filter
// below (registered in .eleventy.js), since that data is built once per run.
//
// A figure whose source keeps no record for a year is null, shown as a dash,
// so a year before the records began never reads as a zero.

const fs = require("fs");
const path = require("path");
const facts = require("./facts.js");
const conferences = require("./conferences.js");
const programmes = require("./archiveProgrammes.js");
const ledger = require("./corpusLedger.json");
const audits = require("./audits.json");
const news = require("./news.json");
const cohorts = require("./cohorts.json");
const nameKey = require("./nameKey.js");
const prizeLaureates = require("./prizeLaureates.js")();

const FIRST = 2025;
const today = new Date().toISOString().slice(0, 10);
const thisYear = Number(today.slice(0, 4));
const inYear = (d, y) => typeof d === "string" && d.startsWith(String(y));
// Each source's first dated record: years before it have no figure.
const since = (dates) => dates.filter(Boolean).sort()[0] || "9999";
const first = {
  audits: since(audits.map((a) => a.date)),
  news: since(news.map((n) => n.date)),
};
const countIn = (dates, y, from) => (String(y) < from.slice(0, 4) ? null : dates.filter((d) => inYear(d, y)).length);

// "26–27 June 2025", for an edition whose facts entry has no dates string.
function range(start, end) {
  const f = (d, o) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", ...o });
  if (!end || end === start) return f(start, { day: "numeric", month: "long", year: "numeric" });
  return start.slice(0, 7) === end.slice(0, 7)
    ? `${f(start, { day: "numeric" })}–${f(end, { day: "numeric", month: "long", year: "numeric" })}`
    : `${f(start, { day: "numeric", month: "long" })} – ${f(end, { day: "numeric", month: "long", year: "numeric" })}`;
}
const datesOf = (e) => e.dates || range(e.startDate, (conferences.byYear[String(e.year)] || {}).endDate);

// The edition held in a year, with its programme's sessions, people and affiliations.
function conference(y) {
  const e = facts.conferences.editions.find((x) => x.year === y && x.startDate <= today);
  if (!e) return null;
  const p = programmes[String(y)];
  let sessions = null, people = null, affiliations = null;
  if (p && p.days) {
    const items = p.days.flatMap((d) => d.rows.flatMap((r) => r.items));
    const names = new Set(), places = new Set();
    const add = (x) => { if (x && x.name) { names.add(nameKey(x.name) || x.name); if (x.affiliation) places.add(x.affiliation.trim()); } };
    for (const it of items) {
      (it.conveners || []).forEach(add);
      for (const c of it.contributions || []) (c.authors || []).forEach(add);
    }
    sessions = items.filter((i) => i.kind === "session").length;
    people = names.size;
    affiliations = places.size;
  }
  const prizes = Object.values(prizeLaureates).flat().filter((l) => l && l.year === y);
  const n = e.ordinal, tail = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
  return { ordinal: n, nth: n + tail, city: e.city, country: e.country, venue: e.venue, dates: datesOf(e), papers: e.papers, sessions, people, affiliations, prizes };
}

// The Anthology: papers that entered it in the year, its size at the year's end,
// and abstracts attached in the year.
function anthology(y) {
  const papers = Object.values(ledger.papers);
  const end = `${y}-12-31`;
  return {
    added: papers.filter((p) => inYear(p.firstSeen, y)).length,
    total: papers.filter((p) => p.firstSeen && p.firstSeen <= end).length,
    abstracts: papers.filter((p) => inYear(p.abstractSeen, y)).length,
  };
}

// Releases from CHANGELOG.md headings: "## [2.28.0] · 2026-08-29 — Title".
const changelog = fs.readFileSync(path.join(__dirname, "../../CHANGELOG.md"), "utf8");
const releases = [...changelog.matchAll(/^## \[(\d+)\.(\d+)\.(\d+)\] · (\d{4}-\d{2}-\d{2})(?: — (.+))?$/gm)]
  .map((m) => ({ version: `${m[1]}.${m[2]}.${m[3]}`, minor: m[3] === "0", date: m[4], title: m[5] || "" }));
const firstRelease = since(releases.map((r) => r.date));

function website(y) {
  const inY = releases.filter((r) => inYear(r.date, y));
  return {
    releases: String(y) < firstRelease.slice(0, 4) ? null : inY.length,
    features: inY.filter((r) => r.minor).sort((a, b) => a.date.localeCompare(b.date)),
    audits: countIn(audits.map((a) => a.date), y, first.audits),
    auditList: audits.filter((a) => inYear(a.date, y)),
    news: countIn(news.map((n) => n.date), y, first.news),
  };
}

function year(y) {
  return { conference: conference(y), anthology: anthology(y), website: website(y) };
}

const years = [];
for (let y = thisYear; y >= FIRST; y--) {
  const next = facts.conferences.editions.filter((c) => c.startDate > `${y}-12-31`).sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  years.push({
    year: y,
    toDate: y === thisYear,
    asOf: y === thisYear ? today : `${y}-12-31`,
    now: year(y),
    before: year(y - 1),
    ahead: {
      edition: next ? { year: next.year, city: next.city, country: next.country, dates: datesOf(next) } : null,
      cohorts: cohorts.filter((c) => inYear(c.start, y + 1)).map((c) => c.name),
    },
  });
}

module.exports = { years, anthologyDoi: facts.anthology.doi };

// NetSec's monthly reports summed over a calendar year: the Directory and the
// Management Committee from the first month's start to the last month's end,
// and the website's merged PRs. Null when no month of the year is held.
module.exports.netsecYear = function (reports, y) {
  const months = (reports || []).filter((r) => inYear(r.start, y)).sort((a, b) => a.start.localeCompare(b.start));
  if (!months.length) return null;
  const sum = (f) => months.reduce((s, r) => s + (f(r) || 0), 0);
  const firstM = months[0], lastM = months[months.length - 1];
  return {
    // A month's end is the first day of the next, so the last day covered is the one before.
    months: months.length, from: firstM.start, to: new Date(Date.parse(lastM.end) - 864e5).toISOString().slice(0, 10),
    directory: { from: firstM.directory.from, to: lastM.directory.to, joined: sum((r) => r.directory.joined.length), left: sum((r) => r.directory.left.length) },
    committee: { from: firstM.committee.from, to: lastM.committee.to },
    merged: sum((r) => r.website.merged), features: sum((r) => r.website.features), fixes: sum((r) => r.website.fixes),
  };
};

// Every NetSec month since launch folded into one report of the same shape, so
// the dashboard renders it with the month markup. Lists are concatenated in
// date order, totals summed, contributors merged by name. `series` holds one
// row per month for the joiners chart: `h` is the bar height as a share of the
// tallest, `label` marks the first peak and the latest bar. `last` is the
// latest month's first day (`end` is exclusive).
module.exports.netsecAll = function (reports) {
  const ms = (reports || []).slice().sort((a, b) => a.start.localeCompare(b.start));
  if (!ms.length) return null;
  const a = ms[0], z = ms[ms.length - 1];
  const cat = (f) => ms.flatMap((r) => f(r) || []);
  const sum = (k) => ms.reduce((s, r) => s + (r.website[k] || 0), 0);
  const who = {};
  cat((r) => r.website.contributors).forEach((c) => { who[c.who] = (who[c.who] || 0) + c.commits; });
  const series = ms.map((r) => ({ start: r.start, joined: r.directory.joined.length, left: r.directory.left.length, profiles: r.directory.to }));
  const peak = Math.max(1, ...series.map((s) => s.joined));
  series.forEach((s, i) => { s.h = s.joined / peak; s.label = i === ms.length - 1 || i === series.findIndex((x) => x.joined === peak); });
  return {
    all: true, start: a.start, end: z.end, last: z.start, commits: [a.commits[0], z.commits[1]],
    directory: { from: a.directory.from, to: z.directory.to, joined: cat((r) => r.directory.joined), left: cat((r) => r.directory.left) },
    coreGroup: cat((r) => r.coreGroup),
    committee: { from: a.committee.from, to: z.committee.to, joined: cat((r) => r.committee.joined), left: cat((r) => r.committee.left) },
    groups: z.groups.map((g) => {
      const all = ms.map((r) => r.groups.find((x) => x.number === g.number)).filter(Boolean);
      return { ...g, from: all[0].from, joined: all.flatMap((x) => x.joined), left: all.flatMap((x) => x.left) };
    }),
    website: {
      merged: sum("merged"), features: sum("features"), fixes: sum("fixes"), data: sum("data"), add: sum("add"), del: sum("del"),
      majorFeatures: cat((r) => r.website.majorFeatures), notableFixes: cat((r) => r.website.notableFixes),
      contributors: Object.entries(who).map(([w, n]) => ({ who: w, commits: n })).sort((x, y) => y.commits - x.commits),
    },
    series,
  };
};
