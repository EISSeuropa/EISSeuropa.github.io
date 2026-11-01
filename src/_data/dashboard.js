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

// The deadline tile leaves out the conference and the releases, which have tiles of their own.
const deadlines = site.keyDates.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date));

const phases = site.conferencePhases;
const current = phases.filter((p) => p.from <= today).pop();
// The stepper under the current stage: each stage done, now or next, and how
// far along the line today sits (0 at the first stage, 1 at the last).
const at = phases.indexOf(current);
const days = (d) => Date.parse(d) / 864e5;
const end = phases[at + 1] ? phases[at + 1].from : current && current.until;
const within = current && end ? Math.min(Math.max((days(today) - days(current.from)) / (days(end) - days(current.from)), 0), 1) : 0;
const steps = phases.map((p, i) => ({ step: p.step, state: i < at ? "done" : i === at ? "now" : "next" }));
const fill = phases.length > 1 ? Math.min((at + within) / (phases.length - 1), 1).toFixed(3) : 0;

const phase = current && (!current.until || today <= current.until)
  ? { ...current, links: current.links.map((l) => site.staffLinks.find((a) => a.key === l || a.label === l)), steps, fill }
  : null;

module.exports = { release, counts, dates, deadlines, phase, repo: "EISSeuropa/EISSeuropa.github.io" };
