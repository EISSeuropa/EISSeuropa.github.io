/* The seventeen-theme vocabulary as SKOS (#1249).
 *
 * THEME_RULES in corpus.js is a trilingual controlled vocabulary for
 * European security studies that exists only as a JavaScript constant.
 * This module re-expresses it as SKOS so it can be cited, reused and
 * mapped to by anyone outside the repository, and emits both
 * serialisations from ONE structure so a label fix propagates to both.
 *
 * What is deliberately NOT published: the `re` matching rules. They are
 * implementation, not meaning, and publishing them invites a reader to
 * treat a regex as the definition of a research theme.
 *
 * URI scheme: <site>/vocab/themes for the scheme, <site>/vocab/themes/<key>
 * per concept, where <key> is the stable locale-agnostic theme key already
 * used as the Atlas filter value. Minting these is a promise to keep them
 * resolving, so vocab-theme.njk emits a page for each. The key, not the
 * theme's English name: the name is display text and is translated, the key
 * is not. See docs/anthology-machine-readable.md §4.
 */
const { createHash } = require("node:crypto");
const site = require("./site.js");
const corpus = require("./corpus.js");
const themePages = require("./atlasThemePages.js");

const SCHEME_URI = `${site.url}/vocab/themes`;
const LICENCE_URI = "http://creativecommons.org/licenses/by/4.0/";
const SCHEME_TITLE = "European security studies research themes";
// The vocabulary carries its own SemVer, which moves when a concept is added,
// retired or relabelled, not when the site releases
// (docs/corpus-archiving.md). Stating it in the file is what lets a .ttl
// sitting in somebody's downloads folder be dated and ordered against another
// copy, which is the whole point of versioning it (#1607). SCHEME_ISSUED is
// the date that version was cut, never the build date: a value that moved on
// every rebuild would make two builds of one vocabulary look like two
// versions. SCHEME_DIGEST is the guard, see checkDigest below.
const SCHEME_VERSION = "1.0.0";
const SCHEME_ISSUED = "2026-08-29";
const SCHEME_DIGEST = "d3d49c2e954f399e";
const COLLECTIONS = {
  permanent: {
    uri: `${SCHEME_URI}/collection/permanent-sections`,
    label: "Permanent conference sections",
  },
  derived: {
    uri: `${SCHEME_URI}/collection/derived-themes`,
    label: "Recurring themes derived from the open panels",
  },
};

// Turtle string literal. The labels hold apostrophes, colons and an en dash
// but no quotes today; escaping anyway so a future label edit cannot emit
// broken Turtle.
const ttl = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

module.exports = function () {
  const c = typeof corpus === "function" ? corpus() : corpus;
  const permanent = new Set(c.themePermanentKeys);
  const pageByName = new Map(themePages().map((p) => [p.name, p]));

  const concepts = Object.entries(c.themeLabels).map(([key, label]) => {
    const page = pageByName.get(label.en);
    // A theme with no Atlas view would mint a concept URI that resolves
    // nowhere, and a concept missing a language would publish an incomplete
    // vocabulary. Both are build-breaking rather than silent, because the
    // failure is invisible in the built output.
    if (!page) throw new Error(`themeVocab: no Atlas theme page for "${label.en}" (${key})`);
    for (const lang of ["en", "fr", "de"]) {
      if (!label[lang]) throw new Error(`themeVocab: theme "${key}" has no ${lang} label`);
    }
    return {
      key,
      uri: `${SCHEME_URI}/${key}`,
      prefLabel: label,
      tier: permanent.has(key) ? "permanent" : "derived",
      slug: page.slug,
      count: page.count,
      pages: {
        en: `/anthology-atlas/theme/${page.slug}.html`,
        fr: `/anthology-atlas/theme/${page.slug}.fr.html`,
        de: `/anthology-atlas/theme/${page.slug}.de.html`,
      },
    };
  });

  // A hand-maintained version drifts the moment somebody edits THEME_RULES and
  // forgets to bump it, so the meaning-bearing content is digested and pinned.
  // Anything that changes what the vocabulary says (a key, a label in any
  // language, a collection membership) fails the build until SCHEME_VERSION,
  // SCHEME_ISSUED and this digest are all reconsidered together. The digest is
  // not the version: it cannot be ordered by a human, it only detects that one
  // is owed.
  const digest = createHash("sha256")
    .update(
      JSON.stringify(
        concepts.map((x) => [x.key, x.tier, x.prefLabel.en, x.prefLabel.fr, x.prefLabel.de])
      )
    )
    .digest("hex")
    .slice(0, 16);
  if (digest !== SCHEME_DIGEST) {
    throw new Error(
      `themeVocab: the vocabulary content changed but SCHEME_VERSION is still ${SCHEME_VERSION}.\n` +
        `  Bump SCHEME_VERSION, set SCHEME_ISSUED to today, and set SCHEME_DIGEST to "${digest}"\n` +
        "  in src/_data/themeVocab.js. A relabelled or retired concept is a new version of the\n" +
        "  vocabulary (docs/corpus-archiving.md). Adding a paper is not."
    );
  }

  const membersOf = (tier) => concepts.filter((x) => x.tier === tier);

  const turtle = [
    "@prefix skos: <http://www.w3.org/2004/02/skos/core#> .",
    "@prefix dct:  <http://purl.org/dc/terms/> .",
    "@prefix foaf: <http://xmlns.com/foaf/0.1/> .",
    "@prefix owl:  <http://www.w3.org/2002/07/owl#> .",
    "@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .",
    "",
    `<${SCHEME_URI}> a skos:ConceptScheme ;`,
    `  dct:title ${ttl(SCHEME_TITLE)}@en ;`,
    `  dct:creator ${ttl(site.fullName)} ;`,
    `  dct:license <${LICENCE_URI}> ;`,
    `  owl:versionInfo ${ttl(SCHEME_VERSION)} ;`,
    `  dct:issued "${SCHEME_ISSUED}"^^xsd:date ;`,
    "  skos:hasTopConcept",
    concepts.map((x) => `    <${x.uri}>`).join(" ,\n") + " .",
    "",
    ...Object.entries(COLLECTIONS).map(([tier, col]) =>
      [
        `<${col.uri}> a skos:Collection ;`,
        `  skos:prefLabel ${ttl(col.label)}@en ;`,
        "  skos:member",
        membersOf(tier).map((x) => `    <${x.uri}>`).join(" ,\n") + " .",
        "",
      ].join("\n")
    ),
    ...concepts.map((x) =>
      [
        `<${x.uri}> a skos:Concept ;`,
        `  skos:inScheme <${SCHEME_URI}> ;`,
        `  skos:topConceptOf <${SCHEME_URI}> ;`,
        `  skos:prefLabel ${ttl(x.prefLabel.en)}@en , ${ttl(x.prefLabel.fr)}@fr , ${ttl(x.prefLabel.de)}@de ;`,
        `  foaf:page <${site.url}${x.pages.en}> .`,
        "",
      ].join("\n")
    ),
  ].join("\n");

  const jsonld = {
    "@context": {
      skos: "http://www.w3.org/2004/02/skos/core#",
      dct: "http://purl.org/dc/terms/",
      foaf: "http://xmlns.com/foaf/0.1/",
      owl: "http://www.w3.org/2002/07/owl#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
    },
    "@graph": [
      {
        "@id": SCHEME_URI,
        "@type": "skos:ConceptScheme",
        "dct:title": { "@value": SCHEME_TITLE, "@language": "en" },
        "dct:creator": site.fullName,
        "dct:license": { "@id": LICENCE_URI },
        "owl:versionInfo": SCHEME_VERSION,
        "dct:issued": { "@value": SCHEME_ISSUED, "@type": "xsd:date" },
        "skos:hasTopConcept": concepts.map((x) => ({ "@id": x.uri })),
      },
      ...Object.entries(COLLECTIONS).map(([tier, col]) => ({
        "@id": col.uri,
        "@type": "skos:Collection",
        "skos:prefLabel": { "@value": col.label, "@language": "en" },
        "skos:member": membersOf(tier).map((x) => ({ "@id": x.uri })),
      })),
      ...concepts.map((x) => ({
        "@id": x.uri,
        "@type": "skos:Concept",
        "skos:inScheme": { "@id": SCHEME_URI },
        "skos:topConceptOf": { "@id": SCHEME_URI },
        "skos:prefLabel": ["en", "fr", "de"].map((lang) => ({
          "@value": x.prefLabel[lang],
          "@language": lang,
        })),
        "foaf:page": { "@id": `${site.url}${x.pages.en}` },
      })),
    ],
  };

  return {
    schemeUri: SCHEME_URI,
    title: SCHEME_TITLE,
    version: SCHEME_VERSION,
    issued: SCHEME_ISSUED,
    concepts,
    // English theme name to its concept URI, for the surfaces that hold a
    // theme's name rather than its key (#1571). The name is the join key
    // everywhere else on the Atlas, so this is the lookup those templates
    // can actually perform.
    uriByName: Object.fromEntries(concepts.map((c) => [c.prefLabel.en, c.uri])),
    turtle,
    jsonld,
  };
};
