// Slug-keyed lookup over orcidWorks.json so a Nunjucks template can pull a
// person's recent ORCID works by their board slug without a loop (Nunjucks
// `{% set %}` inside a `{% for %}` is loop-scoped and would not leak the
// match back out). The board profile dialog on /board reads
// `orcidWorksBySlug[person.slug]` to render "Recent publications" server-side.
//
// Same data file that powers the /outputs members section. Refreshed weekly
// by scripts/sync-orcid.py (see .github/workflows/sync-orcid.yml). Fail-soft:
// an absent or malformed file yields an empty map rather than breaking the build.
let works = [];
try {
  works = require("./orcidWorks.json");
} catch (e) {
  works = [];
}

module.exports = Object.fromEntries(
  (Array.isArray(works) ? works : [])
    .filter((e) => e && e.slug && Array.isArray(e.works) && e.works.length)
    .map((e) => [e.slug, e.works])
);
