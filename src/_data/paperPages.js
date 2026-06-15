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

module.exports = function () {
  return (paperIndex.papers || [])
    .filter((p) => p.hasPage && p.slug)
    .map((p) => ({
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
      authorNames: p.authors || [], // display-name strings (for citation meta + JSON-LD)
      authorsLinked: p.authorsLinked || [], // { name, url } — members link to their profile
      affiliations: p.affiliations || [], // distinct affiliation strings
    }));
};
