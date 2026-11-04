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
// tile, the stages and their stepper, and the Key dates timeline. It comes from
// the "EISS dates" calendar, through the EISS status web app's ?view=dates, and
// falls back to keyDates in site.js when that gives nothing.
const { WORKSPACE_STATUS } = require("./systemHealth.js");
const ROLES = new Set(everyone);

// keyDates in site.js is code, so a typo that would show twice, or a stage the
// stepper cannot name, stops the build.
function siteDates() {
  const list = [...site.keyDates].sort(byDate);
  const seen = new Set();
  for (const d of list) {
    const key = `${d.date} ${d.label}`;
    if (seen.has(key)) throw new Error(`[dashboard] keyDates lists "${d.label}" on ${d.date} twice`);
    seen.add(key);
    if (d.stage && !d.step) throw new Error(`[dashboard] keyDates stage "${d.stage}" has no step`);
  }
  return list;
}

// The calendar is edited by staff, so the same slips only warn: the build
// skips or simplifies the entry and the site still deploys.
function calendarDates(list) {
  const seen = new Set();
  const out = [];
  for (const d of list) {
    const label = String(d.label || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date || "") || !label) {
      console.warn(`[dashboard] calendar entry skipped: "${label}" on "${d.date}"`);
      continue;
    }
    if (seen.has(`${d.date} ${label}`)) {
      console.warn(`[dashboard] calendar lists "${label}" on ${d.date} twice, kept once`);
      continue;
    }
    seen.add(`${d.date} ${label}`);
    const entry = { date: d.date, label };
    const roles = (Array.isArray(d.roles) ? d.roles : []).filter((r) => ROLES.has(r));
    if (roles.length) entry.roles = roles;
    if (d.stage && d.step) Object.assign(entry, { stage: d.stage, step: d.step, links: Array.isArray(d.links) ? d.links : [] });
    else if (d.stage) console.warn(`[dashboard] calendar stage "${d.stage}" has no step, shown as a plain date`);
    out.push(entry);
  }
  return out.sort(byDate);
}

async function fetchDates() {
  try {
    const res = await fetch(`${WORKSPACE_STATUS}?view=dates`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(String(res.status));
    const { dates } = await res.json();
    const list = Array.isArray(dates) ? calendarDates(dates) : [];
    if (list.length) return { keyDates: list, source: "calendar" };
    console.warn("[dashboard] the dates calendar gave nothing, keyDates in site.js used");
  } catch (e) {
    console.warn(`[dashboard] dates calendar unavailable (${e.message}), keyDates in site.js used`);
  }
  return { keyDates: siteDates(), source: "site" };
}

function assemble(keyDates, source) {
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
    ? { ...current, note, links: current.links.map((l) => site.staffLinks.find((a) => a.key === l || a.label === l) || console.warn(`[dashboard] stage link "${l}" is not in staffLinks, left out`)).filter(Boolean), steps, fill }
    : null;

  // Onboarding links by staffLinks key or guideLinks label, as for stages.
  // A staffLinks entry's roles say who sees the app, not who needs the step,
  // so they are dropped. A guide keeps its roles: the role guides rely on them.
  const app = (l) => { const a = site.staffLinks.find((x) => x.key === l); return a && { ...a, roles: undefined }; };
  const link = (l) => typeof l === "object" ? l
    : app(l) || site.guideLinks.find((g) => g.label === l)
      || console.warn(`[dashboard] onboarding link "${l}" is not in staffLinks or guideLinks, left out`);
  const onboarding = site.onboarding.map((s) => ({
    ...s,
    steps: s.steps.map((st) => ({ ...st, links: (st.links || []).map(link).filter(Boolean) })),
  }));

  return { release, counts, dates, deadlines, phase, onboarding, datesSource: source, calendar: site.deadlinesCalendar || null, repo: "EISSeuropa/EISSeuropa.github.io" };
}

// The last five issues closed as done, for the Today box when the browser's
// own GitHub calls are refused (the unauthenticated limit is 60 an hour per
// address). Same query as the page's live load.
async function fetchRecent() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const q = encodeURIComponent("repo:EISSeuropa/EISSeuropa.github.io is:issue is:closed reason:completed");
  try {
    const res = await fetch(`https://api.github.com/search/issues?per_page=10&sort=updated&order=desc&q=${q}`, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(String(res.status));
    const { items } = await res.json();
    return items.filter((x) => x.closed_at)
      .map((x) => ({ n: x.number, title: x.title, url: x.html_url, at: x.closed_at }))
      .sort((x, y) => Date.parse(y.at) - Date.parse(x.at)).slice(0, 5);
  } catch (e) {
    console.warn(`[dashboard] closed issues unavailable (${e.message}), the Today roll waits for the live load`);
    return [];
  }
}

module.exports = async function () {
  const [{ keyDates, source }, recent] = await Promise.all([fetchDates(), fetchRecent()]);
  return { ...assemble(keyDates, source), recent };
};
