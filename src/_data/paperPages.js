// Pagination source for the per-paper landing pages (#794).
//
// One page per ESSC paper that has something to land on — an abstract or an
// external published-version link (or DOI). Title-only papers are skipped:
// they would be thin content Google Scholar won't index, and they remain
// deep-linkable by their slug anchor in the Conference Navigator. Pages are
// EN-only (titles and abstracts are in their original language; no machine
// translation, no ×3 explosion).
//
// Driven by paperIndex.js — the SAME deduplicated paper list the Navigator
// renders — so every landing page is reachable from the Navigator (its title
// links here) and there are no near-duplicate pages. Each page carries the
// citation_* meta (rendered in <head> by base.njk) and a ScholarlyArticle
// JSON-LD block, the basis of Google Scholar indexing.
const paperIndex = require("./paperIndex.js");
const paperLinks = require("./paperLinks.json"); // confirmed publication matches, keyed by slug

// Build a BibTeX @article entry for a confirmed published version. The entry
// describes the PUBLISHED work, so title, authors and year prefer the
// published values (each can differ from the conference paper): the published
// title when known else the conference title, the published byline when known
// else the conference authors, the published year else the conference year.
// Optional fields are emitted only when present. Single braces around values:
// valid BibTeX, and it keeps the string free of the `{{` that would collide
// with Nunjucks if built in-template.
function toBibtex(p, link) {
  const authors = (link.publishedAuthors && link.publishedAuthors.length ? link.publishedAuthors : p.authors) || [];
  const year = link.publishedYear || p.year;
  const type = link.pubType || "";
  const title = link.publishedTitle || p.title;
  const fields = [`author = {${authors.join(" and ")}}`, `title = {${title}}`];
  let entry = "article";
  if (/preprint|working paper/i.test(type)) {
    entry = "misc";
    const how = ["Preprint", link.publisher].filter(Boolean).join(", ");
    if (how) fields.push(`howpublished = {${how}}`);
  } else if (/book chapter|edited/i.test(type)) {
    entry = "incollection";
    if (link.journal) fields.push(`booktitle = {${link.journal}}`);
    if (link.publisher) fields.push(`publisher = {${link.publisher}}`);
  } else if (/^book$/i.test(type)) {
    entry = "book";
    if (link.publisher) fields.push(`publisher = {${link.publisher}}`);
  } else if (link.journal) {
    fields.push(`journal = {${link.journal}}`);
  }
  if (year) fields.push(`year = {${year}}`);
  if (link.volume) fields.push(`volume = {${link.volume}}`);
  if (link.issue) fields.push(`number = {${link.issue}}`);
  if (link.pages) fields.push(`pages = {${String(link.pages).replace(/-+/g, "--")}}`);
  if (link.doi) fields.push(`doi = {${link.doi}}`);
  return `@${entry}{eiss-${p.slug},\n  ${fields.join(",\n  ")}\n}`;
}

module.exports = function () {
  const pages = (paperIndex.papers || []).filter((p) => p.hasPage && p.slug);
  // Within-edition prev/next (#889). The reader pages through one edition's
  // papers in the SAME order the Anthology's by-paper view lists them (the
  // paperIndex order, alphabetical within year), so it matches what they'd see
  // filtering /papers to that year. True programme order isn't carried in the
  // data spine, so this is the index order rather than the running order.
  const byYear = {};
  pages.forEach((p) => {
    (byYear[p.year] = byYear[p.year] || []).push(p);
  });
  const linkOf = (p) => (p ? { slug: p.slug, title: p.title } : null);

  return pages
    .map((p) => {
      const grp = byYear[p.year];
      const i = grp.indexOf(p);
      const link = paperLinks[p.slug] || {};
      return {
        // { slug, title } | null — previous / next paper in this edition.
        editionPrev: linkOf(i > 0 ? grp[i - 1] : null),
        editionNext: linkOf(i < grp.length - 1 ? grp[i + 1] : null),
        slug: p.slug,
        title: p.title,
        year: p.year,
        conferenceLabel: p.conferenceLabel,
        conferenceUrl: p.programmeUrl,
        panel: p.panel,
        abstract: p.abstract || null,
        abstractUrl: p.abstractUrl || null,
        publishedUrl: p.publishedUrl || null,
        doi: p.doi || null,
        prize: p.prize || null, // Best Paper Prize winner

        // Published-version detail, for the "followed by a publication in …"
        // line on the page. Only set when a match has been confirmed.
        publishedTitle: link.publishedTitle || null,
        publishedJournal: link.journal || null,
        publishedYear: link.publishedYear || null,
        // Bibliographic detail backfilled from Crossref by DOI
        // (scripts/enrich-publications.mjs): the outlet line + BibTeX export.
        // publishedAuthors is the published byline, which can differ from the
        // conference presenters. Any of these may be absent.
        publishedVolume: link.volume || null,
        publishedIssue: link.issue || null,
        publishedPages: link.pages || null,
        publishedType: link.pubType || null, // "Journal article", "Preprint", …
        publishedPublisher: link.publisher || null, // outlet fallback for preprints
        publishedAuthors: link.publishedAuthors || [],
        // Ready-to-copy BibTeX for the published version (null when unmatched).
        bibtex: link.publishedUrl || link.doi ? toBibtex(p, link) : null,
        authorNames: p.authors || [], // display-name strings (for citation meta + JSON-LD)
        authorsLinked: p.authorsLinked || [], // { name, url } — members link to their profile
        affiliations: p.affiliations || [], // distinct affiliation strings
      };
    });
};
