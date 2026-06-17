/**
 * Archive programmes, enriched (abstracts) AND linked to the Anthology.
 *
 * archiveProgrammesEnriched.js attaches each session/paper's abstract. This
 * leaf module goes one step further and attaches `paperUrl` — the paper's own
 * /papers/<slug> landing page — to every contribution (and session) that has
 * one, so the programme grid can signpost from a paper to its Anthology entry.
 *
 * It must be a SEPARATE module, not part of archiveProgrammesEnriched: corpus.js
 * consumes the enriched programmes and paperIndex.js consumes corpus, so having
 * the enriched step require paperIndex would close a require cycle. This module
 * sits downstream of both (nothing requires it but the template), so the join
 * is safe. The title normaliser MUST match archiveProgrammesEnriched.js /
 * paperIndex.js / sync-abstracts.mjs.
 */
const enriched = require("./archiveProgrammesEnriched.js")();
const paperIndex = require("./paperIndex.js");

function normTitle(t) {
  return String(t || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// `<year>::<normTitle>` → /papers/<slug>.html, for the deduplicated papers that
// actually have a landing page (an abstract or a confirmed published version).
const urlByKey = {};
for (const p of paperIndex.papers || []) {
  if (p.hasPage && p.slug) urlByKey[`${p.year}::${normTitle(p.title)}`] = `/papers/${p.slug}.html`;
}

function link(node, year) {
  if (!node || !node.title) return;
  const url = urlByKey[`${year}::${normTitle(node.title)}`];
  if (url) node.paperUrl = url;
}

module.exports = function () {
  const linked = structuredClone(enriched);
  for (const entry of Object.values(linked)) {
    const year = String(entry.year || entry.slug || "");
    for (const day of entry.days || []) {
      for (const row of day.rows || []) {
        for (const item of row.items || []) {
          link(item, year);
          for (const contrib of item.contributions || []) link(contrib, year);
        }
      }
    }
  }
  return linked;
};
