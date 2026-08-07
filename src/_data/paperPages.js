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
const site = require("./site.js");
const { neighbours } = require("./paperAdjacency.js"); // shared corpus adjacency (#1148/#1188)

// Related papers (#1148): the corpus adjacency rendered as a short static
// list on each landing page, so a paper page is no longer a dead end. The
// scoring lives in paperAdjacency.js, shared with the Atlas edge layer.
const RELATED_MAX = 4;
function computeRelated(pages) {
  return neighbours(pages, RELATED_MAX).map((list) =>
    list.map(({ index }) => ({
      slug: pages[index].slug,
      title: pages[index].title,
      year: pages[index].year,
      conferenceLabel: pages[index].conferenceLabel,
    }))
  );
}

const { toBibtex, toRis, confName } = require("./citations.js");

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
  const relatedOf = computeRelated(pages);

  return pages
    .map((p, idx) => {
      const grp = byYear[p.year];
      const i = grp.indexOf(p);
      const link = paperLinks[p.slug] || {};
      // Drop related entries the prev/next nav already shows, so the two
      // blocks never repeat a link.
      const prevNextSlugs = [i > 0 ? grp[i - 1].slug : null, i < grp.length - 1 ? grp[i + 1].slug : null];
      const related = relatedOf[idx].filter((r) => !prevNextSlugs.includes(r.slug));
      return {
        themes: p.theme || [], // research-theme tags (#1149)
        related, // { slug, title, year, conferenceLabel } (#1148)
        // { slug, title } | null — previous / next paper in this edition.
        editionPrev: linkOf(i > 0 ? grp[i - 1] : null),
        editionNext: linkOf(i < grp.length - 1 ? grp[i + 1] : null),
        slug: p.slug,
        title: p.title,
        year: p.year,
        conferenceLabel: p.conferenceLabel,
        conferenceUrl: p.conferenceUrl, // bare edition page; paper-page-body appends #panel-/#programme
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
        // Citation export, on every paper page: the published version when one
        // is confirmed, else the conference presentation itself. BibTeX (copy
        // or download) + RIS (download; Zotero/Mendeley/EndNote import it).
        bibtex: toBibtex(p, link),
        ris: toRis(p, link),
        // The event name, exposed so base.njk's citation_conference_title meta
        // tag reads the same value the BibTeX booktitle does (#1254). Google
        // Scholar and Zotero's Embedded Metadata translator both read that tag,
        // so a joint-workshop paper labelled as the annual conference was
        // feeding the wrong container to every downstream reference manager.
        conferenceName: confName(p),
        authorNames: p.authors || [], // display-name strings (for citation meta + JSON-LD)
        authorsLinked: p.authorsLinked || [], // { name, url } — members link to their profile
        affiliations: p.affiliations || [], // distinct affiliation strings
      };
    });
};
