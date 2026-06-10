/* The ESSC corpus — one assembled view of every conference paper across
 * all editions, plus a deduplicated speaker aggregation.
 *
 * This is the shared data spine for the speaker index (#635), the paper
 * index (#632), and the open-data export (#641). Built once here so those
 * surfaces don't each re-walk the programme data.
 *
 * Sources:
 *   - archiveProgrammes.js — the transcribed past programmes (2017–2025,
 *     plus the joint Sciences Po conference, the Ukraine conference, and
 *     the 2019 Joint Policy Workshop). No abstracts.
 *   - indico.json — the live 2026 programme synced from Indico.
 * Both expose contributions with an `authors[]` array of
 * { name, affiliation, isSpeaker }. (Live data also carries a `speakers`
 * subset; `authors` is the superset, so we read `authors`.)
 *
 * Dedup philosophy (see #635): names are inconsistent across a decade of
 * data, so the match key normalises diacritics, case, whitespace, and a
 * bounded set of leading honorifics — but deliberately does NOT drop
 * middle initials or merge across affiliations. We bias to UNDER-merging:
 * a wrong merge (two different people fused) is worse and harder to spot
 * than a split. The `ALIASES` map below is the manual hatch to fix known
 * splits/merges by hand without touching the algorithm (mirrors the
 * `photoOverride` escape hatch in board.json).
 */
const archive = require("./archiveProgrammes.js");
const indico = require("./indico.json");
const peopleIndexFn = require("./peopleIndex.js");

// ── Name normalisation ──────────────────────────────────────────────────
const HONORIFIC = /^(prof(?:essor)?\.?|dr\.?|sir|dame|mr\.?|mrs\.?|ms\.?|mx\.?)\s+/;

function keyOf(name) {
  let s = String(name || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/, "");
  // strip leading honorifics repeatedly ("professor sir hew strachan")
  let prev;
  do {
    prev = s;
    s = s.replace(HONORIFIC, "");
  } while (s !== prev);
  return s.trim();
}

// Manual same-person merges. Key: a normalised variant; value: the
// normalised canonical to fold it into. Empty until a real collision is
// spotted — add entries as the index surfaces split duplicates.
//   e.g. "jon smith": "jonathan smith"
const ALIASES = {};

function canonicalKey(name) {
  const k = keyOf(name);
  return ALIASES[k] || k;
}

// ── Surname parsing (for a by-lastname index) ───────────────────────────
const HONORIFIC_DISP = /^(Prof(?:essor)?\.?|Dr\.?|Sir|Dame|Mr\.?|Mrs\.?|Ms\.?|Mx\.?)\s+/;
const PARTICLES = new Set([
  "van", "von", "de", "der", "den", "del", "della", "di", "da", "dos",
  "das", "du", "la", "le", "el", "al", "ten", "ter", "bin", "ibn",
]);
const stripDiacritics = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "");

function cleanDisplay(name) {
  let s = String(name).trim();
  let prev;
  do {
    prev = s;
    s = s.replace(HONORIFIC_DISP, "");
  } while (s !== prev);
  return s.trim();
}

// Split a "Given … Surname" string into given + surname, folding a
// trailing particle run into the surname ("Paul van Hooft" → given "Paul",
// surname "van Hooft"). Single-token names are treated as the surname.
function splitName(full) {
  const tokens = cleanDisplay(full).split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return { given: "", surname: tokens[0] || "" };
  let i = tokens.length - 1;
  const surname = [tokens[i]];
  while (i - 1 >= 1 && PARTICLES.has(tokens[i - 1].toLowerCase().replace(/\.$/, ""))) {
    i--;
    surname.unshift(tokens[i]);
  }
  return { given: tokens.slice(0, i).join(" "), surname: surname.join(" ") };
}

// Sort/group key: the first non-particle surname word governs the letter
// ("van Hooft" files under H), then the rest of the surname, then given.
function nameSort(name) {
  const { given, surname } = splitName(name);
  const words = surname.split(/\s+/);
  const lead = words.find((w) => !PARTICLES.has(w.toLowerCase())) || words[0] || "";
  const norm = (s) => stripDiacritics(s).toLowerCase().replace(/[^a-z ]/g, "").trim();
  const letterChar = norm(lead).charAt(0).toUpperCase();
  return {
    given,
    surname,
    display: given ? `${surname}, ${given}` : surname,
    letter: /[A-Z]/.test(letterChar) ? letterChar : "#",
    sortKey: `${norm(lead)} ${norm(surname)} ${norm(given)}`.trim(),
  };
}

// ── Conference labelling ────────────────────────────────────────────────
const SPECIAL = {
  "joint-2024": { label: "Joint Sciences Po–EISS Conference", year: 2024 },
  Ukraine: { label: "Joint Conference on the War in Ukraine", year: 2024 },
  JPW2019: { label: "Joint Policy Workshop", year: 2019 },
};

function confMeta(slug) {
  if (SPECIAL[slug]) {
    return { ...SPECIAL[slug], slug, url: `/${slug}.html` };
  }
  return { label: "ESSC", year: Number(slug), url: `/${slug}.html` };
}

// ── Themes (#658) ───────────────────────────────────────────────────────
// The nine permanent EISS panel sections (the spine) plus recurring themes
// derived from the open-panel remainder. A paper is tagged by keyword-
// matching its session/panel title — it inherits its panel's theme(s) and
// may carry more than one. Confidence over coverage: a session that matches
// nothing stays UNTAGGED rather than be force-fit into a bucket. The rule
// map is the curation lever — refine a pattern to fix a mis-tag.
const THEME_RULES = [
  // The nine permanent sections (from /initiative)
  ["Transformations of warfare and conflict", /transformation|future war|conduct of.*war|character of war|military innovation|military technolog|military strateg|change and continuity in war|art of war|warfare/i],
  ["Emerging domains: cyber and technology", /cyber|digital|\bAI\b|artificial intelligence|information operation|outer space|\bspace\b|autonom|drone|disruptive machine|hybrid (threat|war|domain)/i],
  ["Arms acquisition and transfer", /arms (procurement|production|transfer|acquisition|trade)|defen[cs]e (industry|procurement)|weapons? (procurement|transfer|production)/i],
  ["Private military actors", /private (actor|militar|security)|mercenar|\bpmc\b|non-?state.*(armed|actor)|beyond the state/i],
  ["Defence cooperation and military assistance", /defen[cs]e cooperation|military assistance|security assistance|\balliance|burden.?sharing|\bnato\b|interoperab|coalition|realignment|\balignment/i],
  ["Military interventions", /military intervention|peace.?building|peace.?keeping|operations abroad|stabili[sz]ation|use of force|multilateral operation|conflict intervention|external sponsorship/i],
  ["Non-proliferation and arms control", /non-?proliferation|arms control|\bWMD\b|weapons of mass destruction|disarmament/i],
  ["Terrorism and counter-terrorism", /terroris|counter-?terroris|insurgenc|radicali[sz]|violent extremis/i],
  ["Theoretical developments in security studies", /theor|conceptuali[sz]|knowledge production|epistem|ontolog|methodolog|origins of war|peace.?violence/i],
  // Derived recurring themes (open-panel remainder)
  ["Deterrence", /deterrence|deterrent/i],
  ["Intelligence", /\bintelligence\b/i],
  ["European and transatlantic security", /european (security|defen[cs]e|grand strategy)|transatlantic|geopolitical power europe|military issues in europe|european deterrent/i],
  ["Regional security and area studies", /east asia|indo-?pacific|\basia\b|\bindia\b|balkans|latin america|maritime security|regional security|eastern neighbo/i],
  ["Civil–military relations and the armed forces", /civil-?military|military professional|military recruit|armed forces|psychology and emotions/i],
  ["Climate and security", /climate/i],
  ["Gender and security", /gender/i],
  ["Political economy of security", /political economy/i],
];
const THEME_ORDER = THEME_RULES.map(([n]) => n);
const themeRank = new Map(THEME_ORDER.map((n, i) => [n, i]));

function themesOf(sessionTitle) {
  const t = String(sessionTitle || "");
  if (!t) return [];
  return THEME_RULES.filter(([, re]) => re.test(t)).map(([n]) => n);
}

// ── Flatten both sources into one paper list ────────────────────────────
function* iterContributions() {
  // archive editions
  for (const [slug, prog] of Object.entries(archive)) {
    for (const day of prog.days || []) {
      for (const row of day.rows || []) {
        for (const slot of row.items || []) {
          for (const c of slot.contributions || []) {
            yield { slug, slot, c };
          }
        }
      }
    }
  }
  // live 2026 from Indico
  const live = (indico.annualConferences || {})["2026"];
  if (live && live.programme) {
    for (const day of live.programme.days || []) {
      for (const row of day.rows || []) {
        for (const slot of row.items || []) {
          for (const c of slot.contributions || []) {
            yield { slug: "2026", slot, c };
          }
        }
      }
    }
  }
}

const papers = [];
for (const { slug, slot, c } of iterContributions()) {
  if (!c.title) continue;
  const conf = confMeta(slug);
  const authors = (c.authors && c.authors.length ? c.authors : c.speakers || []).map(
    (a) => ({ name: a.name, affiliation: a.affiliation || null, isSpeaker: !!a.isSpeaker })
  );
  const sessionTitle = slot.title || slot.slotTitle || null;
  papers.push({
    title: c.title,
    authors,
    abstract: c.abstract || null,
    year: conf.year,
    conferenceSlug: conf.slug || slug,
    conferenceLabel: conf.label,
    conferenceUrl: conf.url,
    sessionTitle,
    themes: themesOf(sessionTitle),
  });
}

// Stable ordering: newest edition first, then title.
papers.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));

// ── Aggregate speakers ──────────────────────────────────────────────────
// Build the board name→profile lookup from peopleIndex (keyed on the same
// normalisation) so a speaker who is a board/community member links to
// their profile.
const profileByKey = {};
try {
  const people = (peopleIndexFn() || {}).people || [];
  for (const p of people) {
    profileByKey[canonicalKey(p.detect || p.name)] = p.url;
  }
} catch (_) {
  /* peopleIndex unavailable — speakers just won't carry a profile link */
}

const speakerMap = new Map();
for (const paper of papers) {
  for (const a of paper.authors) {
    if (!a.name) continue;
    const key = canonicalKey(a.name);
    if (!key) continue;
    let s = speakerMap.get(key);
    if (!s) {
      s = {
        key,
        name: a.name,
        nameVariants: {},
        profileUrl: profileByKey[key] || null,
        themes: new Set(),
        papers: [],
      };
      speakerMap.set(key, s);
    }
    // track display-name variants to pick the most common spelling
    s.nameVariants[a.name] = (s.nameVariants[a.name] || 0) + 1;
    for (const th of paper.themes) s.themes.add(th);
    s.papers.push({
      title: paper.title,
      year: paper.year,
      affiliation: a.affiliation || null,
      conferenceLabel: paper.conferenceLabel,
      conferenceUrl: paper.conferenceUrl,
      isSpeaker: a.isSpeaker,
    });
  }
}

const speakers = [...speakerMap.values()]
  .map((s) => {
    // display name = most frequent original spelling (tie → longest)
    const rawName = Object.entries(s.nameVariants).sort(
      (a, b) => b[1] - a[1] || b[0].length - a[0].length
    )[0][0];
    const papersByYear = s.papers.sort((a, b) => (b.year || 0) - (a.year || 0));
    const years = papersByYear.map((p) => p.year).filter(Boolean);
    // Most-recent affiliation: the one from the latest paper that carries
    // one (not a cumulative list — a person's affiliation changes over the
    // years, and the current one is what's useful).
    const affiliation = (papersByYear.find((p) => p.affiliation) || {}).affiliation || null;
    const n = nameSort(rawName);
    const themes = [...s.themes].sort((a, b) => themeRank.get(a) - themeRank.get(b));
    return {
      name: cleanDisplay(rawName), // honorific-stripped natural name
      display: n.display, // "Surname, Given" for the by-lastname list
      surname: n.surname,
      sortKey: n.sortKey,
      letter: n.letter,
      affiliation,
      themes, // permanent + derived themes, in canonical order
      profileUrl: s.profileUrl,
      papers: papersByYear,
      count: papersByYear.length,
      firstYear: years.length ? Math.min(...years) : null,
      lastYear: years.length ? Math.max(...years) : null,
    };
  })
  // alphabetical by surname (then given name), via the normalised sort key
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

const letters = [...new Set(speakers.map((s) => s.letter))].sort();

// Theme list for the filter UI: each theme that actually tags at least one
// speaker, in canonical order, with its speaker count.
const themes = THEME_ORDER.map((name) => ({
  name,
  count: speakers.filter((s) => s.themes.includes(name)).length,
})).filter((t) => t.count > 0);

module.exports = {
  papers,
  speakers,
  letters,
  themes,
  stats: {
    paperCount: papers.length,
    speakerCount: speakers.length,
    editions: [...new Set(papers.map((p) => p.conferenceLabel))].length,
    taggedSpeakers: speakers.filter((s) => s.themes.length).length,
  },
};
