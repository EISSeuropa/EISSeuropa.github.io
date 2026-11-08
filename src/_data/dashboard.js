// The "Where things stand" section of /internal.html. Everything here is
// public: the page has no sign-in, so private work stays out of it.

const progress = require("../data/roadmap-progress.json");
const conferences = require("./conferences.js");
const site = require("./site.js");

const REPO = "https://github.com/EISSeuropa/EISSeuropa.github.io";
// The dashboard's own version, shown at the foot of the page. Semantic
// versioning, rules and history in docs/internal-dashboard.md.
const VERSION = "2.30.0";
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
  { key: "issues", value: c.openIssues, label: "open issues", url: `${REPO}/issues`, roles: ["staff"] },
  { key: "prs", value: c.openPRs, label: "open pull requests", url: `${REPO}/pulls`, roles: ["staff"] },
  { key: "tasks", value: c.helpWanted, label: "tasks to pick up", url: `${REPO}/labels/help%20wanted`, roles: ["staff", "volunteer"] },
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
// skips or simplifies the entry and the site still deploys. An entry may also
// carry site (eiss, netsec or joint), url, end and indico, which the
// workspace-ops indico-dates script writes on its copies of Indico events.
const CALENDAR_SITES = new Set(["eiss", "netsec", "joint"]);
const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");
function calendarDates(list) {
  const seen = new Set();
  const out = [];
  for (const d of list) {
    const label = String(d.label || "").trim();
    if (!isDay(d.date) || !label) {
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
    if (d.site) {
      if (CALENDAR_SITES.has(String(d.site).toLowerCase())) entry.site = String(d.site).toLowerCase();
      else console.warn(`[dashboard] calendar site "${d.site}" on "${label}" is not eiss, netsec or joint, left out`);
    }
    if (/^https?:\/\//.test(d.url || "")) entry.url = d.url;
    if (isDay(d.end) && d.end > d.date) entry.end = d.end;
    if (d.indico) entry.indico = String(d.indico);
    // The FR and DE pages' wording, from label_fr, stage_fr, step_fr (and _de) lines.
    for (const lang of ["fr", "de"]) {
      const words = Object.fromEntries(["label", "stage", "step"].filter((k) => d[lang] && typeof d[lang][k] === "string" && d[lang][k].trim()).map((k) => [k, d[lang][k].trim()]));
      if (Object.keys(words).length) entry[lang] = words;
    }
    out.push(entry);
  }
  return out.sort(byDate);
}

// The calendar holds every public EISS and NetSec date. The year's key dates
// are the EISS ones typed in by staff. Copies of Indico events and NetSec dates
// go to the calendar tiles only.
const isKeyDate = (d) => !d.indico && d.site !== "netsec";

async function fetchDates() {
  let events = [];
  try {
    const res = await fetch(`${WORKSPACE_STATUS}?view=dates`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(String(res.status));
    const { dates } = await res.json();
    const list = Array.isArray(dates) ? calendarDates(dates) : [];
    events = list.filter((d) => !isKeyDate(d));
    const keyDates = list.filter(isKeyDate);
    if (keyDates.length) return { keyDates, source: "calendar", events };
    console.warn("[dashboard] the dates calendar gave no key dates, keyDates in site.js used");
  } catch (e) {
    console.warn(`[dashboard] dates calendar unavailable (${e.message}), keyDates in site.js used`);
  }
  return { keyDates: siteDates(), source: "site", events };
}

// Where a tile leads. A release opens its milestone (number from the daily
// roadmap refresh, or a search until it has one). A key date opens its url,
// or else the app named first in its links.
const milestoneUrl = (m) => m.number ? `${REPO}/milestone/${m.number}` : `${REPO}/issues?q=${encodeURIComponent(`is:issue milestone:${m.title}`)}`;
const linkHref = (links) => {
  const first = (links || [])[0];
  const app = first && site.staffLinks.find((a) => a.key === first || a.label === first);
  return app ? app.href : undefined;
};

// A date's fr/de overrides, renamed for a stage: its stage is the label.
const stageLangs = (d) => Object.fromEntries(["fr", "de"].filter((l) => d[l]).map((l) => [l, { label: d[l].stage, step: d[l].step }]));

function assemble(keyDates, source, events = []) {
  // The Key dates timeline keeps the last 30 days, which the page ticks off.
  const PAST_DAYS = 30;
  const dates = [
    ...(edition ? [{ date: edition.startDate, label: `ESSC ${edition.year}, ${edition.city}`, kind: "essc", year: edition.year, city: edition.city, roles: everyone, url: `/${edition.year}.html` }] : []),
    ...open.filter((m) => m.due).map((m) => ({ date: m.due, label: `Release ${m.title} due`, kind: "release", title: m.title, roles: ["staff"], url: milestoneUrl(m) })),
    ...keyDates.map(({ date, label, roles, fr, de, url, links }) => ({ date, label, roles: roles || everyone, fr, de, url: url || linkHref(links) })),
  ]
    .filter((d) => d.date >= isoDaysAgo(PAST_DAYS))
    .sort(byDate);
  const nextAt = dates.findIndex((d) => d.date >= today);
  dates.forEach((d, i) => { d.state = d.date < today ? "past" : i === nextAt ? "next" : "later"; });

  // The deadline tile leaves out the conference and the releases, which have tiles of their own.
  // Each carries the date it counts from, the deadline before it, so the tile
  // can show how much time is left.
  const deadlines = keyDates
    .map((d, i) => ({ date: d.date, label: d.label, fr: d.fr, de: d.de, start: i ? keyDates[i - 1].date : null }))
    .filter((d) => d.date >= today);

  // The stages of the conference year: each date that opens one, then the
  // conference itself.
  const phases = [
    ...keyDates.filter((d) => d.stage).map((d) => ({ from: d.date, label: d.stage, step: d.step, links: d.links || [], ...stageLangs(d) })),
    ...(edition ? [{ from: edition.startDate, until: edition.endDate, label: `ESSC ${edition.year} is on`, year: edition.year, step: site.conferenceStage.step, links: site.conferenceStage.links, conference: true, ...stageLangs(site.conferenceStage) }] : []),
  ];
  const current = phases.filter((p) => p.from <= today).pop();
  // The stepper under the current stage: each stage done, now or next, and how
  // far along the line today sits (0 at the first stage, 1 at the last).
  const at = phases.indexOf(current);
  const end = phases[at + 1] ? phases[at + 1].from : current && current.until;
  const within = current && end ? Math.min(Math.max((days(today) - days(current.from)) / (days(end) - days(current.from)), 0), 1) : 0;
  const steps = phases.map((p, i) => ({ step: p.step, fr: p.fr, de: p.de, state: i < at ? "done" : i === at ? "now" : "next" }));
  const fill = phases.length > 1 ? Math.min((at + within) / (phases.length - 1), 1).toFixed(3) : 0;

  // The "Now" card names what comes next rather than restating a date by hand.
  const upcoming = [...keyDates, ...(edition ? [{ date: edition.startDate, label: `ESSC ${edition.year} opens in ${edition.city}`, kind: "essc", year: edition.year, city: edition.city }] : [])]
    .filter((d) => d.date >= today)
    .sort(byDate)[0];
  const note = current && current.conference
    ? `In ${edition.city} until ${longDate(edition.endDate)}.`
    : upcoming ? `Next: ${upcoming.label}, ${longDate(upcoming.date)}.` : "";
  // The same note in parts, for the FR and DE pages to word it themselves.
  const noteParts = current && current.conference
    ? { kind: "until", city: edition.city, date: edition.endDate }
    : upcoming ? { kind: "next", ...upcoming } : null;

  const phase = current && (!current.until || today <= current.until)
    ? { ...current, note, noteParts, links: current.links.map((l) => site.staffLinks.find((a) => a.key === l || a.label === l) || console.warn(`[dashboard] stage link "${l}" is not in staffLinks, left out`)).filter(Boolean), steps, fill }
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

  // The open release milestones with a due date, soonest first, for the
  // "Next milestones" card in Platform development.
  const milestones = open.filter((m) => m.due).map((m, i) => ({
    date: m.due, title: m.title, closed: m.closed, total: m.total, percent: m.percent,
    state: i ? "later" : "next",
    url: milestoneUrl(m),
  }));

  return { version: VERSION, milestones, release, counts, dates, deadlines, phase, onboarding, agenda: agenda(dates, events), datesSource: source, calendar: site.deadlinesCalendar || null, repo: "EISSeuropa/EISSeuropa.github.io" };
}

// The five newest issues still open and the last five closed as done, for the Today
// box when the browser's own GitHub calls are refused (the unauthenticated
// limit is 60 an hour per address). Same queries as the page's live load.
// Automated issues (failure alarms, sync reports) stay out of the opened list.
const RECENT = [
  { kind: "opened", q: "is:issue is:open -label:automated", sort: "created", at: "created_at" },
  { kind: "closed", q: "is:issue is:closed reason:completed", sort: "updated", at: "closed_at" },
];
function ghHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}
async function fetchRecent() {
  try {
    const lists = await Promise.all(RECENT.map(async ({ kind, q, sort, at }) => {
      const query = encodeURIComponent(`repo:EISSeuropa/EISSeuropa.github.io ${q}`);
      const { items } = await api(`search/issues?per_page=10&sort=${sort}&order=desc&q=${query}`);
      return items.filter((x) => x[at])
        .map((x) => ({ n: x.number, title: x.title, url: x.html_url, at: x[at], kind }))
        .sort((x, y) => Date.parse(y.at) - Date.parse(x.at)).slice(0, 5);
    }));
    return lists.flat().sort((x, y) => Date.parse(y.at) - Date.parse(x.at));
  } catch (e) {
    console.warn(`[dashboard] recent issues unavailable (${e.message}), the Today roll waits for the live load`);
    return [];
  }
}

// The conference's pace (#2039): for each measure, how many abstracts or
// registrations this edition had when last recorded, against the previous
// recorded edition at the same distance from its conference. With nothing
// recorded for this edition yet, the distance is today's. The figures come
// from scripts/conference-pace.py and show in the conference timeline.
function pace() {
  let file;
  try { file = require("../data/conference-pace.json"); } catch { return null; }
  if (!edition) return null;
  const at = (list, out) => list.filter((d) => d >= out).length;
  const result = {};
  for (const [measure, byEdition] of Object.entries(file.measures || {})) {
    const cur = byEdition[edition.year];
    const prevYear = Object.keys(byEdition).filter((y) => y < String(edition.year)).sort().pop();
    const prev = prevYear && byEdition[prevYear];
    if (!cur && !prev) continue;
    const out = Math.round(days(edition.startDate) - days(cur ? cur.recorded : today));
    result[measure] = {
      edition: edition.year, daysOut: out,
      count: cur ? at(cur.daysOut, out) : null, recorded: cur ? cur.recorded : null,
      previous: prev ? { edition: Number(prevYear), count: at(prev.daysOut, out), total: prev.daysOut.length } : null,
    };
  }
  if (!Object.keys(result).length) return null;
  const recorded = Object.values(result).map((m) => m.recorded).filter(Boolean).sort().pop() || null;
  return { recorded, measures: result };
}

// The three newest tasks to pick up, listed under their count for staff and
// volunteers. The live load refreshes them with the same search.
async function fetchHelp() {
  try {
    const query = encodeURIComponent('repo:EISSeuropa/EISSeuropa.github.io is:issue is:open label:"help wanted"');
    const { items } = await api(`search/issues?per_page=3&sort=created&order=desc&q=${query}`);
    return items.map((x) => ({ n: x.number, title: x.title, url: x.html_url }));
  } catch (e) {
    console.warn(`[dashboard] help-wanted issues unavailable (${e.message}), the list waits for the live load`);
    return [];
  }
}

// The board's view: the five largest features and fixes merged in the last
// 30 days across both site repos, ranked by lines changed as the NetSec monthly
// report ranks them, and the last five formal audits from audits.json.
// The private workspace-ops repo stays out: this page is public.
const SITES = [
  { slug: "EISSeuropa/EISSeuropa.github.io", site: "EISS" },
  { slug: "EISSeuropa/netsec.github.io", site: "NetSec" },
];
const KINDS = { feature: /^feat\b/i, fix: /^fix\b/i };
// "feat(home): cut the home page (#12)" reads "Cut the home page".
const plainTitle = (t) => t.replace(/^\w+(\([^)]*\))?!?:\s*/, "").replace(/\s*\(#\d+\)$/, "").replace(/^./, (c) => c.toUpperCase());

async function api(url) {
  const res = await fetch(`https://api.github.com/${url}`, { headers: ghHeaders(), signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${url.split("?")[0]}: ${res.status}`);
  return res.json();
}

// The highlights the live site published (/internal/board-highlights.json),
// kept when they cannot be recomputed. The same rule as netsecReport.js (#2047).
const LIVE_HIGHLIGHTS = "https://eiss-europa.com/internal/board-highlights.json";
async function liveHighlights() {
  try {
    const r = await fetch(LIVE_HIGHLIGHTS, { signal: AbortSignal.timeout(10000) });
    const j = r.ok ? await r.json() : null;
    return j && Array.isArray(j.features) && Array.isArray(j.fixes) ? j : null;
  } catch (e) { return null; } // first build with the file, or offline
}
async function fetchHighlights() {
  // ponytail: one call per candidate PR for its line count, about 80 a month.
  // Pull-request builds share the deploys' hourly API allowance, so they reuse
  // the published highlights, as does a build without a token or one whose calls fail.
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_EVENT_NAME === "pull_request") {
    console.warn(`[dashboard] ${process.env.GITHUB_TOKEN ? "pull-request build" : "no GITHUB_TOKEN"}, the board highlights are the published ones`);
    return liveHighlights();
  }
  const since = isoDaysAgo(30);
  try {
    const found = await Promise.all(SITES.flatMap(({ slug, site }) => Object.entries(KINDS).map(async ([kind, re]) => {
      const q = encodeURIComponent(`repo:${slug} is:pr is:merged merged:>=${since} ${kind === "feature" ? "feat" : "fix"} in:title`);
      const { items } = await api(`search/issues?per_page=100&q=${q}`);
      const prs = items.filter((p) => re.test(p.title) && p.user.type !== "Bot");
      return Promise.all(prs.map(async (p) => {
        const { additions, deletions, merged_at } = await api(`repos/${slug}/pulls/${p.number}`);
        return { kind, site, n: p.number, title: plainTitle(p.title), url: p.html_url, at: merged_at.slice(0, 10), lines: additions + deletions };
      }));
    })));
    const top = (kind) => found.flat().filter((p) => p.kind === kind).sort((a, b) => b.lines - a.lines).slice(0, 5);
    return { features: top("feature"), fixes: top("fix"), since };
  } catch (e) {
    const kept = await liveHighlights();
    console.warn(`[dashboard] board highlights unavailable (${e.message}), ${kept ? "the published ones are kept" : "left out"}`);
    return kept;
  }
}

const audits = [...require("./audits.json")].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

// The calendar tiles under the conference timeline, soonest first: the coming
// EISS dates (the Key dates list, internship cohorts), the other dates in the
// "EISS dates" calendar (Indico events and NetSec dates, #2028), and NetSec's
// events.json for any NetSec event the calendar does not have yet.
const cohorts = require("./cohorts.json");
let netsecEvents = [];
const ESSC = /European Security Studies Conference/;
const sameEvent = (a, b) => a.date === b.date && a.label.trim().toLowerCase() === b.label.trim().toLowerCase();
function agenda(dates, events = []) {
  const eiss = dates.filter((d) => d.date >= today)
    .map((d) => ({ ...d, site: "EISS", cat: d.kind === "release" ? "release" : "conference", end: d.kind === "essc" && edition ? edition.endDate : undefined, state: undefined }));
  const intern = cohorts.flatMap((c) => [
    { date: c.callOpens, kind: "cohortCall", cohort: c.name },
    { date: c.applyBy, kind: "cohortApply", cohort: c.name },
    { date: c.start, kind: "cohortStart", cohort: c.name },
  ]).filter((d) => d.date >= today).map((d) => ({ ...d, site: "EISS", cat: "internship", roles: everyone, url: "/internship.html" }));
  // The ESSC has its own tile from conferences.js, so its Indico copy is left out.
  const calendar = events.filter((d) => d.date >= today && !(edition && d.indico && d.date === edition.startDate) && !ESSC.test(d.label))
    .map(({ date, end, label, url, site: from, roles, fr, de }) => ({ date, end, label, url, site: from === "netsec" ? "NetSec" : "EISS", cat: "event", roles: roles || everyone, fr, de }));
  const indicoIds = new Set(events.map((d) => d.indico).filter(Boolean));
  // NetSec lists ESSC too, which EISS already shows.
  const netsec = netsecEvents.filter((e) => e.start.slice(0, 10) >= today && !ESSC.test(e.summary))
    .map((e) => ({ date: e.start.slice(0, 10), end: e.end && e.end.slice(0, 10) > e.start.slice(0, 10) ? e.end.slice(0, 10) : undefined,
      label: e.summary, url: e.url, site: "NetSec", cat: "event", roles: everyone, tentative: e.status === "TENTATIVE", indico: e.indicoEventId }))
    .filter((e) => !(e.indico && indicoIds.has(String(e.indico))) && !events.some((d) => sameEvent(d, e)))
    .map(({ indico, ...e }) => e);
  return [...eiss, ...intern, ...calendar, ...netsec].sort(byDate).slice(0, 20);
}
// netsecEvents.js fetches NetSec's events.json once per build and warns when
// it cannot, in which case the calendar tiles show EISS dates only.
async function fetchNetsecEvents() {
  netsecEvents = (await require("./netsecEvents.js")()).events;
}

module.exports = async function () {
  const [{ keyDates, source, events }, recent, highlights, , help] = await Promise.all([fetchDates(), fetchRecent(), fetchHighlights(), fetchNetsecEvents(), fetchHelp()]);
  return { ...assemble(keyDates, source, events), recent, help, built: today, pace: pace(), board: { ...highlights, audits } };
};
