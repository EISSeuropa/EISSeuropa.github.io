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
 * `programmeUrl` is the deep link to the paper's slot on its edition page
 * (e.g. /2024.html#paper-<slug>), computed in corpus.js off the per-paper
 * anchor the programme grids now emit (#676 / #738). Poster (break-slot) papers
 * have no rendered anchor, so corpus leaves their programmeUrl at the bare
 * edition page.
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
    // A paper counts as eligible if any of its merged instances sits in a
    // paper slot, and as having an abstract if any instance carries one.
    if (p.abstractEligible) row.abstractEligible = true;
    if (p.abstract && !row.abstract) row.abstract = p.abstract;
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
    programmeUrl: p.programmeUrl || p.conferenceUrl, // deep link to the slot (#738)
    conferenceUrl: p.conferenceUrl, // bare edition page (base for #panel-/#programme links)
    slug: p.slug, // stable per-paper slug from corpus (anchor + landing page)
    abstract: p.abstract || null,
    abstractEligible: !!p.abstractEligible,
    abstractUrl: p.abstractUrl || null,
    publishedUrl: p.publishedUrl || null,
    doi: p.doi || null,
    prize: p.prize || null, // Best Paper Prize winner (badge + always a landing page)
  });
}

const papers = [...byKey.values()].sort(
  (a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title)
);

// A paper gets its own landing page (#794) only when there is something to
// land on: an abstract or an external published-version link. The rest are
// still deep-linkable by their slug anchor in the list below.
for (const p of papers) {
  p.hasPage = !!(p.abstract || p.publishedUrl || p.doi || p.prize);
  p.paperUrl = p.hasPage && p.slug ? `/papers/${p.slug}.html` : null;
}

// Resolve each author to their profile page when they are a known board /
// community member, so the by-paper view can link author names through to the
// by-person side (the cross-link the Conference Navigator is built around).
// Matched the same way speakers are: profileByKey[canonicalKey(name)].
for (const p of papers) {
  p.authorsLinked = p.authors.map((name) => {
    const profile = corpus.profileByKey[corpus.canonicalKey(name)];
    return { name, url: profile ? profile.url : null };
  });
}

// ── Facets ───────────────────────────────────────────────────────────────
// Years: distinct, newest first, with a paper count each.
// Each carries its paper count plus the abstract-coverage pair (abstracts on
// file / papers eligible for one), which the Anthology renders as a per-year
// progress bar (#abstract-coverage).
const yearMap = new Map();
for (const p of papers) {
  if (!p.year) continue;
  const y = yearMap.get(p.year) || { count: 0, eligible: 0, withAbstract: 0 };
  y.count += 1;
  if (p.abstractEligible) {
    y.eligible += 1;
    if (p.abstract) y.withAbstract += 1;
  }
  yearMap.set(p.year, y);
}
const years = [...yearMap.entries()]
  .map(([year, y]) => ({
    year,
    count: y.count,
    eligible: y.eligible,
    withAbstract: y.withAbstract,
    coverage: y.eligible ? Math.round((y.withAbstract / y.eligible) * 100) : 0,
  }))
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
    // Abstract coverage across papers eligible for one (excludes roundtables,
    // keynotes, posters and workshop sessions).
    eligiblePaperCount: papers.filter((p) => p.abstractEligible).length,
    abstractCount: papers.filter((p) => p.abstractEligible && p.abstract).length,
  },
};
