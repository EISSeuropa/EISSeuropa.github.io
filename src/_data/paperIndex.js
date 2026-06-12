/* The cross-year paper index (#632).
 *
 * A single flattened, deduplicated view of every paper presented across the
 * ESSC corpus (2017–2026), so the corpus can be browsed and searched as a
 * whole rather than one programme grid at a time. The /papers page renders
 * this server-side, so Pagefind indexes every title for the site search.
 *
 * Data spine: we read the public `papers` array from corpus.js (which has
 * already flattened archiveProgrammes.js + indico.json into per-paper rows).
 * We deliberately do NOT touch corpus.js theme internals: the THEME facet
 * here is re-derived from each paper's session title via the small local
 * map below, so this feature stays independent of any corpus.js theming
 * refactor. The match map is the curation lever — refine a pattern to fix a
 * mis-tag. Confidence over coverage: a session that matches nothing stays
 * UNTAGGED rather than be force-fit into a bucket.
 *
 * `programmeUrl` is the per-edition page (e.g. /2024.html). The source
 * programmes carry no per-slot anchors, so there is no #fragment to append
 * yet. If anchors are added to the programme grids later, thread the slot id
 * through corpus.js and append it here.
 */
const corpus = require("./corpus.js");

// ── Theme facet (local to this feature) ─────────────────────────────────
// Keyword rules matched against a paper's session/panel title. A paper may
// inherit more than one theme. Kept deliberately small and local so the
// paper index never depends on corpus.js THEME_RULES.
const THEME_MATCH = [
  ["Transformations of warfare and conflict", /transformation|future war|conduct of.*war|character of war|military innovation|military technolog|military strateg|change and continuity in war|art of war|warfare/i],
  ["Emerging domains: cyber and technology", /cyber|digital|\bAI\b|artificial intelligence|information operation|outer space|\bspace\b|autonom|drone|disruptive machine|hybrid (threat|war|domain)/i],
  ["Arms acquisition and transfer", /arms (procurement|production|transfer|acquisition|trade)|defen[cs]e (industry|procurement)|weapons? (procurement|transfer|production)/i],
  ["Private military actors", /private (actor|militar|security)|mercenar|\bpmc\b|non-?state.*(armed|actor)|beyond the state/i],
  ["Defence cooperation and military assistance", /defen[cs]e cooperation|military assistance|security assistance|\balliance|burden.?sharing|\bnato\b|interoperab|coalition|realignment|\balignment/i],
  ["Military interventions", /military intervention|peace.?building|peace.?keeping|operations abroad|stabili[sz]ation|use of force|multilateral operation|conflict intervention|external sponsorship/i],
  ["Non-proliferation and arms control", /non-?proliferation|arms control|\bWMD\b|weapons of mass destruction|disarmament/i],
  ["Terrorism and counter-terrorism", /terroris|counter-?terroris|insurgenc|radicali[sz]|violent extremis/i],
  ["Theoretical developments in security studies", /theor|conceptuali[sz]|knowledge production|epistem|ontolog|methodolog|origins of war|peace.?violence/i],
  ["Deterrence", /deterrence|deterrent/i],
  ["Intelligence", /\bintelligence\b/i],
  ["European and transatlantic security", /european (security|defen[cs]e|grand strategy)|transatlantic|geopolitical power europe|military issues in europe|european deterrent/i],
  ["Regional security and area studies", /east asia|indo-?pacific|\basia\b|\bindia\b|balkans|latin america|maritime security|regional security|eastern neighbo/i],
  ["Civil–military relations and the armed forces", /civil-?military|military professional|military recruit|armed forces|psychology and emotions/i],
  ["Climate and security", /climate/i],
  ["Gender and security", /gender/i],
  ["Political economy of security", /political economy/i],
];
const THEME_ORDER = THEME_MATCH.map(([n]) => n);
const themeRank = new Map(THEME_ORDER.map((n, i) => [n, i]));

function themesOf(sessionTitle) {
  const t = String(sessionTitle || "");
  if (!t) return [];
  return THEME_MATCH.filter(([, re]) => re.test(t)).map(([n]) => n);
}

// Compact author/affiliation strings for display + search. Authors keep
// their original spelling (lang="en" on render). The affiliation line is
// the distinct set of affiliations across the paper's authors, comma-joined.
function affiliationsOf(authors) {
  const seen = [];
  for (const a of authors || []) {
    if (a.affiliation && !seen.includes(a.affiliation)) seen.push(a.affiliation);
  }
  return seen;
}

// ── Flatten + dedup ──────────────────────────────────────────────────────
// corpus.papers is already one row per contribution. Dedup defensively on
// (normalised title + year): the same paper should not appear twice for one
// edition. We keep the first occurrence (corpus orders newest-first, title
// ascending), merging author lists if a later duplicate carries extra names.
const normTitle = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const byKey = new Map();
for (const p of corpus.papers || []) {
  if (!p.title) continue;
  const key = `${normTitle(p.title)}::${p.year || ""}`;
  const authors = (p.authors || []).map((a) => a.name).filter(Boolean);
  if (byKey.has(key)) {
    // merge any author the earlier row missed (rare, but keeps the byline complete)
    const row = byKey.get(key);
    for (const name of authors) if (!row.authors.includes(name)) row.authors.push(name);
    for (const aff of affiliationsOf(p.authors)) if (!row.affiliations.includes(aff)) row.affiliations.push(aff);
    continue;
  }
  byKey.set(key, {
    title: p.title,
    authors, // array of display names
    affiliations: affiliationsOf(p.authors), // distinct affiliation strings
    year: p.year || null,
    panel: p.sessionTitle || null,
    theme: themesOf(p.sessionTitle), // array, this feature's own derivation
    conferenceLabel: p.conferenceLabel,
    programmeUrl: p.conferenceUrl, // per-edition page (no per-slot anchor available)
  });
}

const papers = [...byKey.values()].sort(
  (a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title)
);

// ── Facets ───────────────────────────────────────────────────────────────
// Years: distinct, newest first, with a paper count each.
const yearMap = new Map();
for (const p of papers) {
  if (!p.year) continue;
  yearMap.set(p.year, (yearMap.get(p.year) || 0) + 1);
}
const years = [...yearMap.entries()]
  .map(([year, count]) => ({ year, count }))
  .sort((a, b) => b.year - a.year);

// Themes: each theme that tags at least one paper, in canonical order, with
// its paper count.
const themes = THEME_ORDER.map((name) => ({
  name,
  count: papers.filter((p) => p.theme.includes(name)).length,
}))
  .filter((t) => t.count > 0)
  .sort((a, b) => themeRank.get(a.name) - themeRank.get(b.name));

module.exports = {
  papers,
  years,
  themes,
  stats: {
    paperCount: papers.length,
    editions: [...new Set(papers.map((p) => p.programmeUrl))].filter(Boolean).length,
    firstYear: years.length ? Math.min(...years.map((y) => y.year)) : null,
    lastYear: years.length ? Math.max(...years.map((y) => y.year)) : null,
    taggedPapers: papers.filter((p) => p.theme.length).length,
  },
};
