/**
 * Archive programmes, enriched with the abstracts that the printed
 * programmes dropped.
 *
 * src/_data/archiveProgrammes.js holds the hand-transcribed programmes (no
 * abstracts). Abstracts come from two files, both keyed
 * `<year>::<normalised-title>`:
 *   - paperAbstracts.json — pulled from Indico by scripts/sync-abstracts.mjs
 *     (the 2023+ editions). REGENERATED wholesale on every sync run.
 *   - paperAbstractsManual.json — hand-recovered abstracts for pre-Indico
 *     editions (2022 and earlier), which the sync never touches. Kept separate
 *     precisely so the sync overwrite can't strand them.
 * This module clones the programmes and attaches `abstract` (+ `abstractUrl`)
 * to every session/contribution whose title matches, so archive-programme.njk
 * can render them while archiveProgrammes.js stays a pristine data file.
 *
 * The title normaliser MUST stay identical to the one in
 * scripts/sync-abstracts.mjs.
 */
const programmes = require("./archiveProgrammes.js");
// Manual wins on the (rare) collision, so a hand-correction can override a bad
// synced abstract if it ever needs to.
const abstracts = { ...require("./paperAbstracts.json"), ...require("./paperAbstractsManual.json") };

function normTitle(t) {
  return String(t || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function attach(node, year) {
  if (!node || !node.title) return;
  const hit = abstracts[`${year}::${normTitle(node.title)}`];
  if (hit) {
    node.abstract = hit.abstract;
    node.abstractUrl = hit.url;
  }
}

module.exports = function () {
  const enriched = structuredClone(programmes);
  for (const entry of Object.values(enriched)) {
    const year = String(entry.year || entry.slug || "");
    for (const day of entry.days || []) {
      for (const row of day.rows || []) {
        for (const item of row.items || []) {
          attach(item, year);
          for (const contrib of item.contributions || []) attach(contrib, year);
        }
      }
    }
  }
  return enriched;
};
