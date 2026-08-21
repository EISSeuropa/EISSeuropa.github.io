#!/usr/bin/env node
/**
 * The declared scope of the Anthology holds (#1499).
 *
 * `/anthology.html` no longer says "early access" across the whole page. It
 * names the editions that are complete and the ones still filling in, and
 * that claim is only safe while it stays true. A recovered abstract landing
 * in the wrong edition, a newly ingested paper arriving without one, or a
 * change to what counts as eligible can all push a declared edition back
 * under the threshold with a green build and no visible change on the page.
 *
 * So this asserts the claim rather than the mechanism: every edition the page
 * declares complete is still at or above the threshold, and the sentence on
 * the built page names the same editions the data does.
 *
 * Run from the repo root, after a build. Exits non-zero on a problem.
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const problems = [];

const scopeFn = require("../src/_data/releaseScope.js");
const scope = typeof scopeFn === "function" ? scopeFn() : scopeFn;
const indexFn = require("../src/_data/paperIndex.js");
const index = typeof indexFn === "function" ? indexFn() : indexFn;
const byYear = new Map((index.years || []).map((y) => [y.year, y]));

// 1. Every declared edition still clears the threshold.
for (const year of scope.editions) {
  const y = byYear.get(year);
  if (!y) {
    problems.push(`${year} is declared complete but no longer appears in the corpus.`);
    continue;
  }
  if (y.coverage < scope.coverageThreshold) {
    problems.push(
      `${year} is declared complete on /anthology.html but its abstract coverage is ${y.coverage}%, ` +
        `under the ${scope.coverageThreshold}% threshold (${y.withAbstract} of ${y.eligible} eligible papers). ` +
        "Recover the missing abstracts, or drop the edition from the declared scope in src/_data/releaseScope.js."
    );
  }
}

// 2. The page says what the data says. The note is built from the same
//    source, so a mismatch means the sentence was hand-edited away from it.
const page = "_site/anthology.html";
if (existsSync(page)) {
  const html = readFileSync(page, "utf8");
  const noticed = html.match(/anthology-notice-text">([\s\S]*?)<a /);
  const text = noticed ? noticed[1].replace(/<[^>]+>/g, " ") : "";
  const ends = scope.inScopeYears;
  for (const year of [ends.first, ends.last].filter(Boolean)) {
    if (!text.includes(String(year))) {
      problems.push(
        `/anthology.html does not name ${year} in its scope note, though releaseScope.js declares ` +
          `${ends.first} to ${ends.last} complete. The note and the data have drifted apart.`
      );
    }
  }
  if (scope.interfaceReady && /class="atlas-proto-pill"/.test(readFileSync("_site/anthology-atlas.html", "utf8"))) {
    problems.push(
      "releaseScope.js declares the interface ready, but /anthology-atlas.html still renders the Beta pill."
    );
  }
}

if (problems.length) {
  console.error(`✗ release-scope check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  `✓ release-scope check passed (${scope.editions.join(", ")} declared complete at or above ` +
    `${scope.coverageThreshold}% abstract coverage; the note on /anthology.html agrees).`
);
