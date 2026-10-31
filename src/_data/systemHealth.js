// The "IT System Monitoring" section of /internal.html: the latest run of each
// active workflow in both site repos, read from GitHub when the site builds
// (daily at the least, see deploy.yml). A build that cannot reach GitHub hides
// the section and still succeeds. The repos are public, so nothing here is private.

const REPOS = [
  { label: "EISS website", slug: "EISSeuropa/EISSeuropa.github.io", branch: "master" },
  { label: "NetSec website", slug: "EISSeuropa/netsec.github.io", branch: "main" },
];

async function api(path) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${path}`, { headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

const STATUS = { success: "Passed", skipped: "Skipped", cancelled: "Cancelled" };

async function repoHealth({ label, slug, branch }) {
  const { workflows } = await api(`${slug}/actions/workflows?per_page=100`);
  const active = workflows.filter((w) => w.state === "active" && w.path.startsWith(".github/workflows/"));
  const latest = await Promise.all(active.map(async (w) => {
    const { workflow_runs: runs } = await api(`${slug}/actions/workflows/${w.id}/runs?branch=${branch}&status=completed&per_page=1`);
    return { w, run: runs[0] };
  }));
  const items = latest
    // A workflow with no run on the main branch only checks pull requests, which GitHub reports on the PR.
    .filter(({ run }) => run)
    .map(({ w, run }) => {
      const failed = ["failure", "timed_out", "startup_failure"].includes(run.conclusion);
      return {
        name: w.name,
        failed,
        status: failed ? "Failed" : STATUS[run.conclusion] || run.conclusion,
        date: run.created_at.slice(0, 10),
        url: run.html_url,
      };
    })
    .sort((a, b) => b.failed - a.failed || a.name.localeCompare(b.name));
  return {
    label,
    url: `https://github.com/${slug}/actions`,
    items,
    failedCount: items.filter((i) => i.failed).length,
  };
}

module.exports = async function () {
  try {
    return { repos: await Promise.all(REPOS.map(repoHealth)), checked: new Date().toISOString().slice(0, 10) };
  } catch (e) {
    console.warn(`[systemHealth] section hidden: ${e.message}`);
    return null;
  }
};
