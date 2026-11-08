// The latest EISS and NetSec website releases, for the release card at the
// top of /internal.html (docs/internal-dashboard.md). EISS reads its own
// CHANGELOG.md, NetSec its latest GitHub Release. A release shows for DAYS
// after its date when it is a minor or major release, or when its notes have
// a "### For the team" section. The card shows that section, or the lede when
// there is none. workspace-ops/release-notes emails the same text.
const fs = require("fs");
const path = require("path");

const DAYS = 14;
const EISS = "EISSeuropa/EISSeuropa.github.io";
const NETSEC = "EISSeuropa/netsec.github.io";

// Markdown to plain paragraphs: links keep their text, emphasis and code marks go.
function paragraphs(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/^>\s?/gm, "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p && !p.startsWith("#") && p !== "_Nothing yet._");
}

// A release body's "For the team" section, or else its lede (the text before
// the first heading). Patch notes start with the index, so they have neither.
function note(body) {
  const team = body.match(/^###\s+For the team[ \t]*\n([\s\S]*?)(?=^#{1,4}\s|(?![\s\S]))/m);
  return { team: Boolean(team), text: paragraphs(team ? team[1] : body.split(/^#{1,4}\s/m)[0]).slice(0, 3) };
}

const isMinor = (version) => /^\d+\.\d+\.0\b/.test(version);

// The newest released section of CHANGELOG.md:
// "## [2.28.0] · 2026-08-29 — A usable Atlas".
function fromChangelog(src) {
  const m = src.match(/^## \[(\d+\.\d+\.\d+[^\]]*)\] · (\d{4}-\d{2}-\d{2}) — (.+)\n([\s\S]*?)(?=^## \[|(?![\s\S]))/m);
  if (!m) return null;
  const [, version, date, title, body] = m;
  return { site: "EISS", version, date, title: title.trim(), url: `https://github.com/${EISS}/releases/tag/v${version}`, body };
}

// A GitHub Release: tag "v1.4.0", name "v1.4.0 — Title".
function fromGithub(r) {
  if (!r || !r.tag_name || r.draft || r.prerelease) return null;
  const version = r.tag_name.replace(/^v/, "");
  const title = String(r.name || "").replace(/^v?\d+\.\d+\.\d+\S*\s*[—–-]\s*/, "").trim() || r.tag_name;
  return { site: "NetSec", version, date: String(r.published_at || "").slice(0, 10), title, url: r.html_url, body: r.body || "" };
}

function card(release, today) {
  if (!release || !release.date) return null;
  const age = (Date.parse(today) - Date.parse(release.date)) / 864e5;
  const { team, text } = note(release.body);
  if (age < 0 || age > DAYS || !(isMinor(release.version) || team)) return null;
  const { body, ...rest } = release;
  return { ...rest, note: text, until: new Date(Date.parse(release.date) + DAYS * 864e5).toISOString().slice(0, 10) };
}

async function netsecLatest() {
  try {
    const headers = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${NETSEC}/releases/latest`, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(String(res.status));
    return fromGithub(await res.json());
  } catch (e) {
    console.warn(`[latestReleases] NetSec release unavailable (${e.message}), the card shows EISS only`);
    return null;
  }
}

module.exports = async function () {
  const today = new Date().toISOString().slice(0, 10);
  const changelog = fs.readFileSync(path.join(__dirname, "../../CHANGELOG.md"), "utf8");
  return [fromChangelog(changelog), await netsecLatest()]
    .map((r) => card(r, today))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
};
Object.assign(module.exports, { note, fromChangelog, fromGithub, card, DAYS });
