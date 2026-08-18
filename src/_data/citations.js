// Citation export strings for the corpus (#805, #1254).
//
// Extracted from paperPages.js so ONE builder serves every surface that emits
// a citation: the cite block on a paper page, the /papers/<slug>.bib and .ris
// siblings, and the bulk export on the by-paper view. Before the extraction the
// builders were private to paperPages.js and therefore only reachable for the
// 315 papers that have a landing page, which would have made a bulk export
// silently drop the other 196.
//
// Behaviour deliberately unchanged from #805: when a confirmed publication
// exists the citation describes the PUBLISHED work, because that is the version
// a reader is expected to cite. #1254 proposed flipping this to the
// presentation record; the maintainer kept the published record, so that
// acceptance criterion is withdrawn rather than implemented.

const paperIndex = require("./paperIndex.js");
const paperLinks = require("./paperLinks.json");
const site = require("./site.js");

// Every paper page offers a citation export (#805). When a confirmed
// publication exists, the citation describes the PUBLISHED work (title,
// authors, year, outlet prefer the published values, each of which can differ
// from the conference paper). Otherwise it describes the conference
// presentation itself — a citable @inproceedings / RIS conference paper.
// Two formats are produced: BibTeX (LaTeX) and RIS (the format Zotero,
// Mendeley, EndNote and RefWorks all import). Single braces around BibTeX
// values keep the string free of the `{{` that would collide with Nunjucks.
// The event a paper was actually presented at (#1254). The annual conference
// keeps the name it is cited under across its whole history, whether the
// corpus labels the edition EISS (2017-2025) or ESSC (2026 on), because the
// event is continuous and 421 citations already carry that name. The joint
// events are NOT the annual conference, and calling them one was wrong in the
// booktitle, in the RIS container and in the citation_conference_title meta
// tag that Google Scholar and Zotero both read.
const ANNUAL_LABELS = new Set(["EISS", "ESSC"]);
const confName = (p) =>
  ANNUAL_LABELS.has(p.conferenceLabel)
    ? `European Security Studies Conference ${p.year}`
    : `${p.conferenceLabel}${p.year ? ` ${p.year}` : ""}`;

// BibTeX values are LaTeX source, so a raw & or % from a title breaks the
// reader's compile, and an unprotected acronym gets down-cased to "nato" by
// any style that title-cases (#1254). Escape first, then brace-protect: the
// escape pass emits backslash sequences that the acronym pass cannot match,
// so the order is what keeps them from interfering.
const LATEX_ESCAPES = { "\\": "\\textbackslash{}", "&": "\\&", "%": "\\%", $: "\\$", "#": "\\#", _: "\\_", "{": "\\{", "}": "\\}", "~": "\\textasciitilde{}", "^": "\\textasciicircum{}" };
function bibtexValue(s) {
  return String(s == null ? "" : s)
    .replace(/[\\&%$#_{}~^]/g, (c) => LATEX_ESCAPES[c])
    .replace(/\b[A-Z][A-Z0-9]+\b/g, (m) => `{${m}}`);
}
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
  // Author names go through the escaper too: " and " is BibTeX's separator, so
  // the join has to happen on already-escaped parts rather than after.
  const fields = [
    `author = {${authors.map(bibtexValue).join(" and ")}}`,
    `title = {${bibtexValue(title)}}`,
  ];
  let entry = "article";
  if (!published) {
    // The conference presentation itself.
    entry = "inproceedings";
    fields.push(`booktitle = {${bibtexValue(confName(p))}}`);
  } else if (/preprint|working paper/i.test(type)) {
    entry = "misc";
    const how = ["Preprint", link.publisher].filter(Boolean).join(", ");
    if (how) fields.push(`howpublished = {${bibtexValue(how)}}`);
  } else if (/book chapter|edited/i.test(type)) {
    entry = "incollection";
    if (link.journal) fields.push(`booktitle = {${bibtexValue(link.journal)}}`);
    if (link.publisher) fields.push(`publisher = {${bibtexValue(link.publisher)}}`);
  } else if (/^book$/i.test(type)) {
    entry = "book";
    if (link.publisher) fields.push(`publisher = {${bibtexValue(link.publisher)}}`);
  } else if (link.journal) {
    fields.push(`journal = {${bibtexValue(link.journal)}}`);
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
  lines.push(["T2", published ? link.journal || link.publisher || "" : confName(p)]);
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

// Every paper in the corpus, keyed by slug, for the bulk export on the
// by-paper view. Papers with no landing page still get citation strings here:
// they are real presentations and a reader filtering to a theme expects the
// whole filtered set, not the subset that happens to have an abstract on file.
// Papers with no slug cannot be cited or linked, so they are skipped.
function bySlug() {
  const out = {};
  for (const p of paperIndex.papers || []) {
    if (!p.slug) continue;
    const link = paperLinks[p.slug] || {};
    out[p.slug] = { bib: toBibtex(p, link), ris: toRis(p, link) };
  }
  return out;
}

module.exports = { toBibtex, toRis, confName, bySlug };
