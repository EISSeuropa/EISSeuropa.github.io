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
const byDate = (a, b) => a.date.localeCompare(b.date);
const days = (d) => Date.parse(d) / 864e5;
const isoDaysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const longDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });

// One list of the year's dates feeds every date on the page: the deadline
// tile, the stages and their stepper, and the Key dates timeline. A typo that
// would show twice, or a stage the stepper cannot name, stops the build.
const keyDates = [...site.keyDates].sort(byDate);
const seen = new Set();
for (const d of keyDates) {
  const key = `${d.date} ${d.label}`;
  if (seen.has(key)) throw new Error(`[dashboard] keyDates lists "${d.label}" on ${d.date} twice`);
  seen.add(key);
  if (d.stage && !d.step) throw new Error(`[dashboard] keyDates stage "${d.stage}" has no step`);
}

// The Key dates timeline keeps the last 30 days, which the page ticks off.
const PAST_DAYS = 30;
const dates = [
  ...(edition ? [{ date: edition.startDate, label: `ESSC ${edition.year}, ${edition.city}`, roles: everyone }] : []),
  ...open.filter((m) => m.due).map((m) => ({ date: m.due, label: `Release ${m.title} due`, roles: ["staff"] })),
  ...keyDates.map(({ date, label, roles }) => ({ date, label, roles: roles || everyone })),
]
  .filter((d) => d.date >= isoDaysAgo(PAST_DAYS))
  .sort(byDate);
const nextAt = dates.findIndex((d) => d.date >= today);
dates.forEach((d, i) => { d.state = d.date < today ? "past" : i === nextAt ? "next" : "later"; });

// The deadline tile leaves out the conference and the releases, which have tiles of their own.
// Each carries the date it counts from, the deadline before it, so the tile
// can show how much time is left.
const deadlines = keyDates
  .map((d, i) => ({ date: d.date, label: d.label, start: i ? keyDates[i - 1].date : null }))
  .filter((d) => d.date >= today);

// The stages of the conference year: each date that opens one, then the
// conference itself.
const phases = [
  ...keyDates.filter((d) => d.stage).map((d) => ({ from: d.date, label: d.stage, step: d.step, links: d.links || [] })),
  ...(edition ? [{ from: edition.startDate, until: edition.endDate, label: `ESSC ${edition.year} is on`, step: site.conferenceStage.step, links: site.conferenceStage.links, conference: true }] : []),
];
const current = phases.filter((p) => p.from <= today).pop();
// The stepper under the current stage: each stage done, now or next, and how
// far along the line today sits (0 at the first stage, 1 at the last).
const at = phases.indexOf(current);
const end = phases[at + 1] ? phases[at + 1].from : current && current.until;
const within = current && end ? Math.min(Math.max((days(today) - days(current.from)) / (days(end) - days(current.from)), 0), 1) : 0;
const steps = phases.map((p, i) => ({ step: p.step, state: i < at ? "done" : i === at ? "now" : "next" }));
const fill = phases.length > 1 ? Math.min((at + within) / (phases.length - 1), 1).toFixed(3) : 0;

// The "Now" card names what comes next rather than restating a date by hand.
const upcoming = [...keyDates, ...(edition ? [{ date: edition.startDate, label: `ESSC ${edition.year} opens in ${edition.city}` }] : [])]
  .filter((d) => d.date >= today)
  .sort(byDate)[0];
const note = current && current.conference
  ? `In ${edition.city} until ${longDate(edition.endDate)}.`
  : upcoming ? `Next: ${upcoming.label}, ${longDate(upcoming.date)}.` : "";

const phase = current && (!current.until || today <= current.until)
  ? { ...current, note, links: current.links.map((l) => site.staffLinks.find((a) => a.key === l || a.label === l)), steps, fill }
  : null;

module.exports = { release, counts, dates, deadlines, phase, repo: "EISSeuropa/EISSeuropa.github.io" };
