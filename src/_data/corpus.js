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
// Enriched programmes = the transcribed archive with Indico abstracts merged
// on by title (see archiveProgrammesEnriched.js / paperAbstracts.json), so a
// paper's abstract flows through to the Navigator and per-paper pages.
const archive = require("./archiveProgrammesEnriched.js")();
const indico = require("./indico.json");
const peopleIndexFn = require("./peopleIndex.js");
// Confirmed external publications (#805): a human-reviewed map of paper slug →
// { publishedUrl, doi, publishedTitle, journal, publishedYear }. Matches are
// proposed by scripts/match-publications.mjs into a review queue and only
// land here once confirmed; merged onto papers below so the landing page can
// link the published version. Empty {} until the first confirmed match.
const paperLinks = require("./paperLinks.json");

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
// normalised canonical to fold it into. Add entries as the index
// surfaces split duplicates.
//   e.g. "jon smith": "jonathan smith"
// keyOf normalises case, diacritics and honorifics, but not apostrophe
// style or intra-surname spacing, so those variants stay split until
// listed here. Surfaced by the June 2026 speaker-index QA pass (#655):
// affiliations confirmed each pair is one person.
const ALIASES = {
  "marc r. devore": "marc devore",     // "Marc R. DeVore" (St Andrews)
  "marc de vore": "marc devore",       // "Marc De Vore" spacing variant
  "marc r. de vore": "marc devore",    // both variants at once
  "silvia d’amato": "silvia d'amato",  // curly apostrophe → straight
  "rupal n. mehta": "rupal mehta",     // middle initial on one year only
  "tristan a. volpe": "tristan volpe", // middle initial on one year only
  "ilaria paris": "ilaria parisi",     // "Paris" truncates "Parisi" (ENS)
};

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
  // The annual conference was the "EISS Annual Conference" (EISS 2017…2025)
  // until it was renamed the European Security Studies Conference (ESSC)
  // from the 2026 Stockholm edition onwards.
  const year = Number(slug);
  return { label: year < 2026 ? "EISS" : "ESSC", year, url: `/${slug}.html` };
}

// ── Themes (#658) ───────────────────────────────────────────────────────
// The nine permanent EISS panel sections (the spine) plus recurring themes
// derived from the open-panel remainder. A paper is tagged by keyword-
// matching its session/panel title — it inherits its panel's theme(s) and
// may carry more than one. Confidence over coverage: a session that matches
// nothing stays UNTAGGED rather than be force-fit into a bucket. The rule
// map is the curation lever — refine a pattern to fix a mis-tag.
// Each theme carries a STABLE KEY (locale-agnostic, used as the filter
// value and in the `data-themes` attribute), a per-locale display `label`,
// and the `re` keyword-match rule. The filter matches on the key, so the
// label can be translated without breaking the filter (#693). The FR/DE
// wording of the nine permanent sections is taken verbatim from the
// official translations on /initiative.fr and /initiative.de.
const THEME_RULES = [
  // The nine permanent sections (from /initiative)
  {
    key: "warfare-transformations",
    label: {
      en: "Transformations of warfare and conflict",
      fr: "Transformations du phénomène guerrier et de la conflictualité",
      de: "Transformationen des Krieges und der Konfliktualität",
    },
    re: /transformation|future war|conduct of.*war|character of war|military innovation|military technolog|military strateg|change and continuity in war|art of war|warfare/i,
  },
  {
    key: "emerging-domains",
    label: {
      en: "Emerging domains: cyber and technology",
      fr: "Domaines émergents : cyber et technologie",
      de: "Aufkommende Domänen: Cyber und Technologie",
    },
    re: /cyber|digital|\bAI\b|artificial intelligence|information operation|outer space|\bspace\b|autonom|drone|disruptive machine|hybrid (threat|war|domain)/i,
  },
  {
    key: "arms-acquisition",
    label: {
      en: "Arms acquisition and transfer",
      fr: "Acquisition et transfert d'armement",
      de: "Rüstungsbeschaffung und Rüstungstransfer",
    },
    re: /arms (procurement|production|transfer|acquisition|trade)|defen[cs]e (industry|procurement)|weapons? (procurement|transfer|production)/i,
  },
  {
    key: "private-military-actors",
    label: {
      en: "Private military actors",
      fr: "Acteurs militaires privés",
      de: "Private militärische Akteure",
    },
    re: /private (actor|militar|security)|mercenar|\bpmc\b|non-?state.*(armed|actor)|beyond the state/i,
  },
  {
    key: "defence-cooperation",
    label: {
      en: "Defence cooperation and military assistance",
      fr: "Coopération de défense et assistance militaire",
      de: "Verteidigungskooperation und militärische Unterstützung",
    },
    re: /defen[cs]e cooperation|military assistance|security assistance|\balliance|burden.?sharing|\bnato\b|interoperab|coalition|realignment|\balignment/i,
  },
  {
    key: "military-interventions",
    label: {
      en: "Military interventions",
      fr: "Interventions militaires",
      de: "Militärische Interventionen",
    },
    re: /military intervention|peace.?building|peace.?keeping|operations abroad|stabili[sz]ation|use of force|multilateral operation|conflict intervention|external sponsorship/i,
  },
  {
    key: "non-proliferation",
    label: {
      en: "Non-proliferation and arms control",
      fr: "Non-prolifération et maîtrise des armements",
      de: "Nichtverbreitung und Rüstungskontrolle",
    },
    re: /non-?proliferation|arms control|\bWMD\b|weapons of mass destruction|disarmament/i,
  },
  {
    key: "terrorism",
    label: {
      en: "Terrorism and counter-terrorism",
      fr: "Terrorisme et contre-terrorisme",
      de: "Terrorismus und Terrorismusbekämpfung",
    },
    re: /terroris|counter-?terroris|insurgenc|radicali[sz]|violent extremis/i,
  },
  {
    key: "security-studies-theory",
    label: {
      en: "Theoretical developments in security studies",
      fr: "Développements théoriques dans les études de sécurité",
      de: "Theoretische Entwicklungen in den Sicherheitsstudien",
    },
    re: /theor|conceptuali[sz]|knowledge production|epistem|ontolog|methodolog|origins of war|peace.?violence/i,
  },
  // Derived recurring themes (open-panel remainder), hand-translated
  {
    key: "deterrence",
    label: { en: "Deterrence", fr: "Dissuasion", de: "Abschreckung" },
    re: /deterrence|deterrent/i,
  },
  {
    key: "intelligence",
    label: { en: "Intelligence", fr: "Renseignement", de: "Nachrichtendienste" },
    re: /\bintelligence\b/i,
  },
  {
    key: "european-transatlantic-security",
    label: {
      en: "European and transatlantic security",
      fr: "Sécurité européenne et transatlantique",
      de: "Europäische und transatlantische Sicherheit",
    },
    re: /european (security|defen[cs]e|grand strategy)|transatlantic|geopolitical power europe|military issues in europe|european deterrent/i,
  },
  {
    key: "regional-security",
    label: {
      en: "Regional security and area studies",
      fr: "Sécurité régionale et études aréales",
      de: "Regionale Sicherheit und Regionalstudien",
    },
    re: /east asia|indo-?pacific|\basia\b|\bindia\b|balkans|latin america|maritime security|regional security|eastern neighbo/i,
  },
  {
    key: "civil-military-relations",
    label: {
      en: "Civil–military relations and the armed forces",
      fr: "Relations civilo-militaires et forces armées",
      de: "Zivil-militärische Beziehungen und Streitkräfte",
    },
    re: /civil-?military|military professional|military recruit|armed forces|psychology and emotions/i,
  },
  {
    key: "climate-security",
    label: {
      en: "Climate and security",
      fr: "Climat et sécurité",
      de: "Klima und Sicherheit",
    },
    re: /climate/i,
  },
  {
    key: "gender-security",
    label: {
      en: "Gender and security",
      fr: "Genre et sécurité",
      de: "Geschlecht und Sicherheit",
    },
    re: /gender/i,
  },
  {
    key: "political-economy-security",
    label: {
      en: "Political economy of security",
      fr: "Économie politique de la sécurité",
      de: "Politische Ökonomie der Sicherheit",
    },
    re: /political economy/i,
  },
];
const THEME_BY_KEY = new Map(THEME_RULES.map((th) => [th.key, th]));
const THEME_ORDER = THEME_RULES.map((th) => th.key);
const themeRank = new Map(THEME_ORDER.map((k, i) => [k, i]));

// Returns the stable theme KEYS a session title matches (locale-agnostic).
function themesOf(sessionTitle) {
  const t = String(sessionTitle || "");
  if (!t) return [];
  return THEME_RULES.filter((th) => th.re.test(t)).map((th) => th.key);
}

// ── Flatten both sources into one paper list ────────────────────────────
// Slugs with a live Indico programme are authoritative; skip the same slug
// from the static archive so contributions are not emitted twice.
const liveIndicoSlugs = new Set(
  Object.entries(indico.annualConferences || {})
    .filter(([, conf]) => conf && conf.programme)
    .map(([year]) => year)
);

function* iterContributions() {
  // archive editions (skip any year Indico covers live)
  for (const [slug, prog] of Object.entries(archive)) {
    if (liveIndicoSlugs.has(slug)) continue;
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
  // live editions from Indico
  for (const [year, conf] of Object.entries(indico.annualConferences || {})) {
    if (!conf || !conf.programme) continue;
    for (const day of conf.programme.days || []) {
      for (const row of day.rows || []) {
        for (const slot of row.items || []) {
          for (const c of slot.contributions || []) {
            yield { slug: year, slot, c };
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
    abstractUrl: c.abstractUrl || null, // Indico record, when the abstract came from there
    publishedUrl: c.publishedUrl || null, // "later published at" link (hand-curated; growth lever)
    doi: c.doi || null,
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

// Stable per-paper slug, for the deep-link anchor in the Navigator and the
// per-paper landing pages (#794). `<conferenceSlug>-<kebab-title>`, deduped
// with a numeric suffix, assigned in the (deterministic) sorted order so a
// paper keeps its slug build-to-build. Frozen once shipped.
const kebab = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
const slugSeen = Object.create(null);
for (const p of papers) {
  const base = `${p.conferenceSlug}-${kebab(p.title)}`.replace(/-+$/, "");
  let slug = base;
  let i = 2;
  while (slugSeen[slug]) slug = `${base}-${i++}`;
  slugSeen[slug] = true;
  p.slug = slug;
}

// Merge confirmed external publications onto papers by slug (#805). A paper
// with a confirmed publishedUrl/doi gains a landing page even when it has no
// abstract, turning the archive into a "presented at ESSC → published here" hub.
for (const p of papers) {
  const link = paperLinks[p.slug];
  if (!link) continue;
  p.publishedUrl = link.publishedUrl || p.publishedUrl;
  p.doi = link.doi || p.doi;
}

// ── Aggregate speakers ──────────────────────────────────────────────────
// Build the board name→profile lookup from peopleIndex (keyed on the same
// normalisation) so a speaker who is a board/community member links to
// their profile.
const profileByKey = {};
try {
  const people = (peopleIndexFn() || {}).people || [];
  for (const p of people) {
    // Keep the photo + initials too, so a member's speaker entry can show
    // a headshot bubble (falling back to initials when there's no photo).
    profileByKey[canonicalKey(p.detect || p.name)] = {
      url: p.url,
      photo: p.photo || null,
      initials: p.initials || "",
    };
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
      const profile = profileByKey[key] || null;
      s = {
        key,
        name: a.name,
        nameVariants: {},
        profileUrl: profile ? profile.url : null,
        photo: profile ? profile.photo : null,
        initials: profile ? profile.initials : "",
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
    // Distinct years (newest first) for the at-a-glance pills, and the
    // distinct edition URLs the person presented at, for the event filter.
    const yearList = [...new Set(years)].sort((a, b) => b - a);
    const editionKeys = [...new Set(papersByYear.map((p) => p.conferenceUrl).filter(Boolean))];
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
      photo: s.photo, // member headshot (null for non-members / no photo)
      initials: s.initials,
      years: yearList, // distinct years, newest first (pills)
      editionKeys, // distinct edition URLs attended (event filter)
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
// speaker, in canonical order, with its speaker count. `key` is the stable
// filter value, `label` the per-locale display string (#693).
const themes = THEME_ORDER.map((key) => ({
  key,
  label: THEME_BY_KEY.get(key).label,
  count: speakers.filter((s) => s.themes.includes(key)).length,
})).filter((t) => t.count > 0);

// Editions for the event filter: one per conference page (keyed on its
// URL), newest first, with the speaker count. `display` distinguishes the
// nine ESSC years from the joint events ("EISS 2024" vs the full joint name).
const editionMap = new Map();
for (const p of papers) {
  if (!p.conferenceUrl) continue;
  let e = editionMap.get(p.conferenceUrl);
  if (!e) {
    e = { key: p.conferenceUrl, label: p.conferenceLabel, year: p.year, speakers: new Set() };
    editionMap.set(p.conferenceUrl, e);
  }
  for (const a of p.authors) if (a.name) e.speakers.add(canonicalKey(a.name));
}
const editions = [...editionMap.values()]
  .map((e) => ({
    key: e.key,
    year: e.year,
    label: e.label,
    display: e.year ? `${e.label} ${e.year}` : e.label,
    count: e.speakers.size,
  }))
  .sort((a, b) => (b.year || 0) - (a.year || 0) || a.display.localeCompare(b.display));

module.exports = {
  papers,
  speakers,
  letters,
  themes,
  // Exposed so paperIndex.js can resolve a paper author to their profile the
  // same way speakers are matched: profileByKey[canonicalKey(name)].url.
  profileByKey,
  canonicalKey,
  // Stable theme key → per-locale label, for resolving the localised chip
  // text on a speaker entry (whose `themes` array holds keys, not labels).
  themeLabels: Object.fromEntries(THEME_RULES.map((th) => [th.key, th.label])),
  editions,
  stats: {
    paperCount: papers.length,
    speakerCount: speakers.length,
    // Distinct editions, keyed by the per-edition page URL. (Keying on
    // conferenceLabel under-counts: every ESSC year shares the label
    // "ESSC", so all nine collapse to one.)
    editions: [...new Set(papers.map((p) => p.conferenceUrl))].length,
    taggedSpeakers: speakers.filter((s) => s.themes.length).length,
  },
};
