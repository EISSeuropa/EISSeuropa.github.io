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
  papers.push({
    title: c.title,
    authors,
    abstract: c.abstract || null,
    year: conf.year,
    conferenceSlug: conf.slug || slug,
    conferenceLabel: conf.label,
    conferenceUrl: conf.url,
    sessionTitle: slot.title || slot.slotTitle || null,
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
        affiliations: new Set(),
        profileUrl: profileByKey[key] || null,
        papers: [],
      };
      speakerMap.set(key, s);
    }
    // track display-name variants to pick the most common spelling
    s.nameVariants[a.name] = (s.nameVariants[a.name] || 0) + 1;
    if (a.affiliation) s.affiliations.add(a.affiliation);
    s.papers.push({
      title: paper.title,
      year: paper.year,
      conferenceLabel: paper.conferenceLabel,
      conferenceUrl: paper.conferenceUrl,
      isSpeaker: a.isSpeaker,
    });
  }
}

const speakers = [...speakerMap.values()]
  .map((s) => {
    // display name = most frequent original spelling (tie → longest)
    const name = Object.entries(s.nameVariants).sort(
      (a, b) => b[1] - a[1] || b[0].length - a[0].length
    )[0][0];
    const papersByYear = s.papers.sort((a, b) => (b.year || 0) - (a.year || 0));
    const years = papersByYear.map((p) => p.year).filter(Boolean);
    const first = name.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
    return {
      name,
      sortKey: s.key,
      letter: /[A-Z]/.test(first) ? first : "#",
      affiliations: [...s.affiliations],
      profileUrl: s.profileUrl,
      papers: papersByYear,
      count: papersByYear.length,
      firstYear: years.length ? Math.min(...years) : null,
      lastYear: years.length ? Math.max(...years) : null,
    };
  })
  // alphabetical by family-name-ish key (the normalised key starts with given name;
  // good enough for a first cut — A–Z grouping is done in the template)
  .sort((a, b) => a.name.localeCompare(b.name));

const letters = [...new Set(speakers.map((s) => s.letter))].sort();

module.exports = {
  papers,
  speakers,
  letters,
  stats: {
    paperCount: papers.length,
    speakerCount: speakers.length,
    editions: [...new Set(papers.map((p) => p.conferenceLabel))].length,
  },
};
