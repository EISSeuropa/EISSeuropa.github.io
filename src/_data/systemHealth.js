// The "IT System Monitoring" section of /internal.html: the latest run of each
// active workflow in both site repos, read from GitHub when the site builds
// (daily at the least, see deploy.yml). A build that cannot reach GitHub hides
// the section and still succeeds. The repos are public, so nothing here is private.

const REPOS = [
  { label: "EISS website", site: "https://eiss-europa.com/", slug: "EISSeuropa/EISSeuropa.github.io", branch: "master" },
  { label: "NetSec website", site: "https://netsec-cost.eu/", slug: "EISSeuropa/netsec.github.io", branch: "main" },
];

async function api(path) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const get = () => fetch(`https://api.github.com/repos/${path}`, { headers, signal: AbortSignal.timeout(15000) });
  // ponytail: one retry, since a single network blip among ~30 calls hid the whole section (4 Nov 2026).
  const res = await get().catch(get);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

const LABELS = { nominal: "Nominal", issue: "Issue", critical: "Critical", unknown: "No report yet" };

// The "EISS status" Apps Script web app (workspace-ops/status), which is public
// and returns only each check's level and last good date.
const WORKSPACE_STATUS = "https://script.google.com/macros/s/AKfycbyUPZHKz0SQ0eNN6jfvy7TWvS_LtVFMnir2Q4D-QJEjjJXoGS7VbK63m7MIhUFBp4QN/exec";

async function workspaceChecks() {
  try {
    const res = await fetch(WORKSPACE_STATUS, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(String(res.status));
    const { checks } = await res.json();
    return checks.map((c) => ({ name: c.name, level: c.level, label: LABELS[c.level] || c.level, date: c.lastOk }));
  } catch (e) {
    console.warn(`[systemHealth] Workspace status unavailable: ${e.message}`);
    return null;
  }
}

// The worst of the levels given. No report yet counts for nothing.
function worst(levels) {
  return ["critical", "issue", "nominal"].find((l) => levels.includes(l)) || "unknown";
}

// A failing site deploy is critical, since the live site stops updating. So are
// three or more failures at once. Any other failure is an issue.
const CRITICAL_AT = 3;

async function repoHealth({ label, site, slug, branch }) {
  const { workflows } = await api(`${slug}/actions/workflows?per_page=100`);
  const active = workflows.filter((w) => w.state === "active" && w.path.startsWith(".github/workflows/"));
  const latest = await Promise.all(active.map(async (w) => {
    const { workflow_runs: runs } = await api(`${slug}/actions/workflows/${w.id}/runs?branch=${branch}&status=completed&per_page=5`);
    // The run that finished last, so a re-run that succeeds clears an earlier-started failure.
    const run = runs.reduce((a, r) => (!a || r.updated_at > a.updated_at ? r : a), null);
    return { w, run };
  }));
  const items = latest
    // A workflow with no run on the main branch only checks pull requests, which GitHub reports on the PR.
    .filter(({ run }) => run)
    .map(({ w, run }) => {
      const failed = ["failure", "timed_out", "startup_failure"].includes(run.conclusion);
      const level = !failed ? "nominal" : /deploy/i.test(w.name) ? "critical" : "issue";
      return {
        name: w.name,
        failed,
        level,
        label: LABELS[level],
        date: run.updated_at.slice(0, 10),
        url: run.html_url,
      };
    })
    .sort((a, b) => b.failed - a.failed || a.name.localeCompare(b.name));
  const failedCount = items.filter((i) => i.failed).length;
  const level = failedCount >= CRITICAL_AT || items.some((i) => i.level === "critical") ? "critical" : failedCount ? "issue" : "nominal";
  return { label, site, slug, branch, url: `https://github.com/${slug}/actions`, items, failedCount, level, levelLabel: LABELS[level] };
}

// Google's public status feed, which needs no sign-in. Only the services EISS uses count.
const GOOGLE_SERVICES = /gmail|drive|docs|sheets|calendar|meet|groups|forms|apps script|admin console/i;

async function googleHealth() {
  try {
    const res = await fetch("https://www.google.com/appsstatus/dashboard/incidents.json", { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(String(res.status));
    const open = (await res.json()).filter((i) => !i.end && i.status_impact !== "SERVICE_INFORMATION" && GOOGLE_SERVICES.test(i.service_name));
    const level = open.some((i) => i.status_impact === "SERVICE_OUTAGE") ? "critical" : open.length ? "issue" : "nominal";
    return { level, levelLabel: LABELS[level], services: [...new Set(open.map((i) => i.service_name))] };
  } catch (e) {
    console.warn(`[systemHealth] Google status unavailable: ${e.message}`);
    return null;
  }
}

// GitHub's public status page, which needs no sign-in. Only the components EISS
// uses count. Actions runs every sync and Pages serves the deploy, so a major
// outage there is critical. The dashboard's script repeats this in the browser.
const GITHUB_COMPONENTS = ["Actions", "Pages", "Git Operations", "API Requests", "Pull Requests", "Webhooks"];

function githubLevel(components) {
  const hit = components.filter((c) => GITHUB_COMPONENTS.includes(c.name) && c.status !== "operational");
  const major = hit.filter((c) => c.status === "major_outage");
  const level = major.some((c) => c.name === "Actions" || c.name === "Pages") ? "critical" : hit.length ? "issue" : "nominal";
  return { level, components: hit.map((c) => c.name) };
}

async function githubHealth() {
  try {
    const res = await fetch("https://www.githubstatus.com/api/v2/summary.json", { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(String(res.status));
    return githubLevel((await res.json()).components);
  } catch (e) {
    console.warn(`[systemHealth] GitHub status unavailable: ${e.message}`);
    return null;
  }
}

module.exports = async function () {
  try {
    const [repos, google, checks, github] = await Promise.all([Promise.all(REPOS.map(repoHealth)), googleHealth(), workspaceChecks(), githubHealth()]);
    const level = worst([...(google ? [google.level] : []), ...(checks || []).map((c) => c.level)]);
    const workspace = { level, levelLabel: LABELS[level], checks };
    const failed = repos.flatMap((r) => r.items.filter((i) => i.failed));
    const overall = worst([...repos.map((r) => r.level), level, ...(github ? [github.level] : [])]);
    const link = failed.length ? failed[0].url : ["issue", "critical"].includes(github?.level) ? "https://www.githubstatus.com/" : "https://script.google.com/home/executions";
    const summary = { level: overall, label: LABELS[overall], failed: failed.map((i) => i.name), url: ["issue", "critical"].includes(overall) ? link : null };
    return { repos, google, github, workspace, summary, checked: new Date().toISOString().slice(0, 10) };
  } catch (e) {
    console.warn(`[systemHealth] section hidden: ${e.message}`);
    return null;
  }
};

// The dashboard reads the same web app for the year's dates (?view=dates).
module.exports.WORKSPACE_STATUS = WORKSPACE_STATUS;
module.exports.githubLevel = githubLevel;
