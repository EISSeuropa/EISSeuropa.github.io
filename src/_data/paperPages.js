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
const nameKey = require("./nameKey.js"); // shared author dedup key (Atlas + authorsIndex)

// Related papers (#1148): the Atlas adjacency (shared authors, panel-mates,
// shared themes) rendered as a short static list on each landing page, so a
// paper page is no longer a dead end. Scored, not clustered: shared author 5,
// same panel 3, each shared theme 2. Ties break toward the nearer edition.
// ponytail: O(n²) pairwise scan over ~560 pages at build time, fine at this
// corpus size; precompute a theme->papers index if the corpus ever 10×es.
const RELATED_MAX = 4;
function computeRelated(pages) {
  const meta = pages.map((p) => ({
    authorKeys: new Set((p.authors || []).map(nameKey).filter(Boolean)),
    themes: new Set(p.theme || []),
  }));
  return pages.map((p, i) => {
    const scored = [];
    for (let j = 0; j < pages.length; j++) {
      if (j === i) continue;
      const q = pages[j];
      let sharedAuthors = 0;
      for (const k of meta[j].authorKeys) if (meta[i].authorKeys.has(k)) sharedAuthors++;
      let sharedThemes = 0;
      for (const t of meta[j].themes) if (meta[i].themes.has(t)) sharedThemes++;
      const samePanel = p.panel && q.panel === p.panel && q.year === p.year;
      const score = sharedAuthors * 5 + (samePanel ? 3 : 0) + sharedThemes * 2;
      if (score > 0) scored.push({ q, score, dist: Math.abs((q.year || 0) - (p.year || 0)) });
    }
    scored.sort((a, b) => b.score - a.score || a.dist - b.dist || a.q.title.localeCompare(b.q.title));
    return scored.slice(0, RELATED_MAX).map(({ q }) => ({
      slug: q.slug,
      title: q.title,
      year: q.year,
      conferenceLabel: q.conferenceLabel,
    }));
  });
}

// Every paper page offers a citation export (#805). When a confirmed
// publication exists, the citation describes the PUBLISHED work (title,
// authors, year, outlet prefer the published values, each of which can differ
// from the conference paper). Otherwise it describes the conference
// presentation itself — a citable @inproceedings / RIS conference paper.
// Two formats are produced: BibTeX (LaTeX) and RIS (the format Zotero,
// Mendeley, EndNote and RefWorks all import). Single braces around BibTeX
// values keep the string free of the `{{` that would collide with Nunjucks.
const CONF_NAME = (p) => `European Security Studies Conference ${p.year}`;
const pageUrl = (p) => `${String(site.url || "").replace(/\/$/, "")}/papers/${p.slug}.html`;
// Split a "1-23" / "1--23" page range into [start, end] for RIS SP/EP.
function pageParts(pages) {
  if (!pages) return [null, null];
  const m = String(pages).split(/\s*-+\s*/);
  return [m[0] || null, m[1] || null];
}

function toBibtex(p, link) {
  const published = !!(link.publishedUrl || link.doi);
  const authors = (link.publishedAuthors && link.publishedAuthors.length ? link.publishedAuthors : p.authors) || [];
  const year = link.publishedYear || p.year;
  const type = link.pubType || "";
  const title = link.publishedTitle || p.title;
  const fields = [`author = {${authors.join(" and ")}}`, `title = {${title}}`];
  let entry = "article";
  if (!published) {
    // The conference presentation itself.
    entry = "inproceedings";
    fields.push(`booktitle = {${CONF_NAME(p)}}`);
  } else if (/preprint|working paper/i.test(type)) {
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
  fields.push(`url = {${published ? link.publishedUrl || (link.doi ? "https://doi.org/" + link.doi : pageUrl(p)) : pageUrl(p)}}`);
  return `@${entry}{eiss-${p.slug},\n  ${fields.join(",\n  ")}\n}`;
}

// RIS — the import format Zotero / Mendeley / EndNote / RefWorks open on
// download. CRLF line endings per the RIS spec; TY first, ER last.
function toRis(p, link) {
  const published = !!(link.publishedUrl || link.doi);
  const authors = (link.publishedAuthors && link.publishedAuthors.length ? link.publishedAuthors : p.authors) || [];
  const year = link.publishedYear || p.year;
  const type = link.pubType || "";
  const title = link.publishedTitle || p.title;
  let ty = "JOUR";
  if (!published) ty = "CPAPER";
  else if (/preprint|working paper/i.test(type)) ty = "GEN";
  else if (/book chapter|edited/i.test(type)) ty = "CHAP";
  else if (/^book$/i.test(type)) ty = "BOOK";
  const lines = [["TY", ty], ["TI", title]];
  for (const a of authors) lines.push(["AU", a]);
  if (year) lines.push(["PY", year]);
  // T2 = the container: journal/book for a publication, else the conference.
  lines.push(["T2", published ? link.journal || link.publisher || "" : CONF_NAME(p)]);
  if (link.volume) lines.push(["VL", link.volume]);
  if (link.issue) lines.push(["IS", link.issue]);
  const [sp, ep] = pageParts(link.pages);
  if (sp) lines.push(["SP", sp]);
  if (ep) lines.push(["EP", ep]);
  if (link.doi) lines.push(["DO", link.doi]);
  lines.push(["UR", published ? link.publishedUrl || (link.doi ? "https://doi.org/" + link.doi : pageUrl(p)) : pageUrl(p)]);
  // Body lines (drop any empty ones), then the mandatory ER terminator.
  const body = lines.filter(([, v]) => v !== "").map(([t, v]) => `${t}  - ${v}`).join("\r\n");
  return body + "\r\nER  - \r\n";
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
        authorNames: p.authors || [], // display-name strings (for citation meta + JSON-LD)
        authorsLinked: p.authorsLinked || [], // { name, url } — members link to their profile
        affiliations: p.affiliations || [], // distinct affiliation strings
      };
    });
};
