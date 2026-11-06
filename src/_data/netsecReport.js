// The NetSec tab of /internal.html: the NetSec monthly report for every
// complete month since FIRST, newest first, recomputed at build from public
// data in the NetSec repo.
// The Directory, Core Group and MC come from data/bios.json, data/wg.json and
// data/mc-members.json at the last commit before each end of the month. The
// website section comes from the month's commits on main (one per squashed PR).
// A past month never changes, so the build first reuses the months the live
// site published (/internal/netsec-reports.json) and recomputes only those it
// lacks or holds at an older VERSION. Pull-request builds never recompute: they
// share the Actions token's hourly API allowance with the deploys, and about
// 140 calls a month used it up on 6 November 2026 (#2047). A month that cannot
// be recomputed keeps its live copy, even at an older VERSION, so a build never
// publishes fewer months than it read. A month with neither is left out. With
// no month at all the tab is hidden, never the build.

const REPO = "EISSeuropa/netsec.github.io";
const LIVE = "https://eiss-europa.com/internal/netsec-reports.json";
// The first month with data/wg.json at both ends (it was added on 30 May 2026).
const FIRST = "2026-06-01";
// Bump when the report's logic changes, so the live copy is not reused.
const VERSION = 1;

function headers() {
  const h = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}
async function get(url, auth = true) {
  const res = await fetch(url, { headers: auth ? headers() : {}, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url.replace(/\?.*/, "")}: ${res.status}`);
  return res.json();
}
const api = (path) => get(`https://api.github.com/repos/${REPO}/${path}`);
// raw.githubusercontent.com is outside the API rate limit and needs no token.
const file = (sha, path) => get(`https://raw.githubusercontent.com/${REPO}/${sha}/${path}`, false);

// The month before the one the build runs in, as [first day, first day of the next].
function lastMonth(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

// Added and removed entries between two lists, by key.
function diff(before, after, key) {
  const a = new Set(before.map(key)), b = new Set(after.map(key));
  return { joined: after.filter((x) => !a.has(key(x))), left: before.filter((x) => !b.has(key(x))) };
}

const person = (m) => ({ name: m.name, country: m.country });
const byNameCountry = (m) => `${m.name}|${m.country}`;

function directory(b0, b1) {
  const { joined, left } = diff(b0.members, b1.members, (m) => m.id);
  const card = (m) => ({ name: m.name, affiliation: m.affiliation, country: m.country, url: `https://netsec-cost.eu/people/${m.id}.html` });
  // A to Z by name, titles aside, as the email lists them.
  const bare = (n) => n.replace(/^((Prof|Dr|Mr|Ms|Mrs|Mx)\.?\s+)+/, "");
  const az = (a, b) => bare(a.name).localeCompare(bare(b.name), "en");
  return { from: b0.members.length, to: b1.members.length, joined: joined.map(card).sort(az), left: left.map(card).sort(az) };
}

// Core Group: every role in bios.json other than an MC seat, per person.
function coreGroup(b0, b1, w0, w1) {
  const roles = (b) => b.members.flatMap((m) => m.roles.filter((r) => !/^Management Committee/.test(r)).map((role) => ({ name: m.name, role })));
  const { joined, left } = diff(roles(b0), roles(b1), (x) => `${x.name}|${x.role}`);
  const changes = [
    ...joined.map((x) => ({ kind: "appointed", ...x })),
    ...left.map((x) => ({ kind: "left", ...x })),
  ];
  // A WG leadership post that changed hands, vacant included.
  for (const g of w1.groups) {
    const old = w0.groups.find((x) => x.number === g.number) || {};
    for (const [k, label] of [["lead", "Leader"], ["coLead", "Co-Leader"]]) {
      const was = old[k] && old[k].name, now = g[k] && g[k].name;
      if (was !== now) changes.push({ kind: "post", role: `WG${g.number} ${label}`, was: was || null, now: now || null });
    }
  }
  return changes;
}

function committee(m0, m1) {
  const { joined, left } = diff(m0.members, m1.members, byNameCountry);
  return { from: m0.members.length, to: m1.members.length, joined: joined.map(person), left: left.map(person) };
}

function groups(w0, w1) {
  return w1.groups.map((g) => {
    const old = w0.groups.find((x) => x.number === g.number) || { members: [] };
    const { joined, left } = diff(old.members, g.members, byNameCountry);
    return {
      // The members listed, as the report counts them (memberCount runs higher).
      number: g.number, name: g.name, from: old.members.length, to: g.members.length,
      lead: g.lead && g.lead.name, coLead: g.coLead && g.coLead.name,
      joined: joined.map(person), left: left.map(person),
    };
  });
}

// One commit per squashed PR. Its first line carries the title and "(#n)".
const KIND = [["feature", /^feat\b/i], ["fix", /^fix\b/i], ["data", /^(data|chore\((roadmap|data|bios|indico|cost)\))\b|^(data|bios|indico|cost)[- ]sync/i]];
async function website(base, head, start, end) {
  const commits = [];
  for (let page = 1; ; page++) {
    const r = await api(`compare/${base}...${head}?per_page=250&page=${page}`);
    commits.push(...r.commits);
    if (r.commits.length < 250) break;
  }
  // ponytail: one call per commit for its line count, about 140 a month, once a
  // month thanks to the live copy. GraphQL would do it in one if this bites.
  const rows = await Promise.all(commits.map(async (c) => {
    const { stats } = await api(`commits/${c.sha}`);
    const line = c.commit.message.split("\n")[0];
    const pr = (line.match(/\(#(\d+)\)\s*$/) || [])[1];
    const kind = (KIND.find(([, re]) => re.test(line)) || ["other"])[0];
    const who = c.commit.author.name;
    return { title: line.replace(/\s*\(#\d+\)\s*$/, ""), pr: pr ? Number(pr) : null, kind, who, add: stats.additions, del: stats.deletions };
  }));
  const q = encodeURIComponent(`repo:${REPO} is:pr is:merged merged:${start}..${isoDayBefore(end)}`);
  const { total_count: merged } = await get(`https://api.github.com/search/issues?per_page=1&q=${q}`);
  const count = (k) => rows.filter((r) => r.kind === k).length;
  const top = (k, n) => rows.filter((r) => r.kind === k).sort((a, b) => b.add + b.del - (a.add + a.del)).slice(0, n)
    .map(({ title, pr, add, del }) => ({ title, url: pr && `https://github.com/${REPO}/pull/${pr}`, pr, add, del }));
  const tally = {};
  for (const r of rows) tally[r.who] = (tally[r.who] || 0) + 1;
  return {
    merged, features: count("feature"), fixes: count("fix"), data: count("data"),
    add: rows.reduce((s, r) => s + r.add, 0), del: rows.reduce((s, r) => s + r.del, 0),
    majorFeatures: top("feature", 10), notableFixes: top("fix", 8),
    contributors: Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([who, commits]) => ({ who, commits })),
  };
}
function isoDayBefore(d) { return new Date(Date.parse(d) - 864e5).toISOString().slice(0, 10); }

async function compute({ start, end }) {
  const shaAt = async (t) => (await api(`commits?sha=main&until=${t}T00:00:00Z&per_page=1`))[0].sha;
  const [s0, s1] = await Promise.all([shaAt(start), shaAt(end)]);
  const read = (sha) => Promise.all(["data/bios.json", "data/wg.json", "data/mc-members.json"].map((p) => file(sha, p)));
  const [[b0, w0, m0], [b1, w1, m1]] = await Promise.all([read(s0), read(s1)]);
  return {
    version: VERSION, start, end, commits: [s0.slice(0, 8), s1.slice(0, 8)],
    directory: directory(b0, b1),
    coreGroup: coreGroup(b0, b1, w0, w1),
    committee: committee(m0, m1),
    groups: groups(w0, w1),
    website: await website(s0, s1, start, end),
  };
}

// Every complete month from FIRST to the one before the build, newest first.
function months(now = new Date()) {
  const out = [];
  for (let m = lastMonth(now); m.start >= FIRST; m = lastMonth(new Date(Date.parse(m.start)))) out.push(m);
  return out;
}

async function live(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const j = r.ok ? await r.json() : null;
    return Array.isArray(j) ? j : null;
  } catch (e) { return null; } // first build with the archive, or offline
}

module.exports = async function () {
  const published = ((await live(LIVE)) || []).filter((r) => r && r.start);
  const recompute = Boolean(process.env.GITHUB_TOKEN) && process.env.GITHUB_EVENT_NAME !== "pull_request";
  const out = [];
  let warned = false;
  // ponytail: one month at a time keeps a backfill under the API's burst limit.
  for (const month of months()) {
    const kept = published.find((r) => r.start === month.start);
    if (kept && kept.version === VERSION) { out.push(kept); continue; }
    if (!recompute) {
      if (!warned) console.warn(`[netsecReport] ${process.env.GITHUB_TOKEN ? "pull-request build" : "no GITHUB_TOKEN"}, months are not recomputed`);
      warned = true;
      if (kept) out.push(kept);
      continue;
    }
    try {
      out.push(await compute(month));
    } catch (e) {
      console.warn(`[netsecReport] ${month.start} unavailable (${e.message}), ${kept ? "the live copy is kept" : "left out"}`);
      if (kept) out.push(kept);
    }
  }
  return out.length ? out : null;
};
module.exports.compute = compute;
module.exports.lastMonth = lastMonth;
module.exports.months = months;
