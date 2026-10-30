// The "Where things stand" section of /internal.html. Everything here is
// public: the page has no sign-in, so private work stays out of it.

const progress = require("../data/roadmap-progress.json");
const conferences = require("./conferences.js");
const site = require("./site.js");

const REPO = "https://github.com/EISSeuropa/EISSeuropa.github.io";
const everyone = ["staff", "management", "board", "volunteer"];
const today = new Date().toISOString().slice(0, 10);

// The JSON is ordered by version, so the first open milestone is the next one.
const open = Object.entries(progress.milestones || {})
  .filter(([, m]) => m.state === "open")
  .map(([title, m]) => ({ title, ...m }));
const next = open[0];
const release = next && next.total
  ? { ...next, url: `${REPO}/issues?q=${encodeURIComponent(`is:issue is:open milestone:${next.title}`)}` }
  : null;

const c = progress.counts;
const counts = c && [
  { value: c.openIssues, label: "open issues", url: `${REPO}/issues`, roles: ["staff"] },
  { value: c.openPRs, label: "open pull requests", url: `${REPO}/pulls`, roles: ["staff"] },
  { value: c.helpWanted, label: "tasks to pick up", url: `${REPO}/labels/help%20wanted`, roles: ["staff", "volunteer"] },
];

const edition = conferences.next;
const dates = [
  ...(edition ? [{ date: edition.startDate, label: `ESSC ${edition.year}, ${edition.city}`, roles: everyone }] : []),
  ...open.filter((m) => m.due).map((m) => ({ date: m.due, label: `Release ${m.title} due`, roles: ["staff"] })),
  ...site.keyDates.map((d) => ({ roles: everyone, ...d })),
]
  .filter((d) => d.date >= today)
  .sort((a, b) => a.date.localeCompare(b.date));

module.exports = { release, counts, dates };
