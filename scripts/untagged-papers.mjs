#!/usr/bin/env node
/**
 * The untagged queue (#1570).
 *
 * Tagging is confidence over coverage: a panel that matches no rule leaves its
 * papers UNTAGGED rather than force-fit into a bucket (see the comment above
 * THEME_RULES in src/_data/corpus.js). That is the right call, and it means
 * the untagged set is where the vocabulary's gaps live, with nothing pointing
 * at them.
 *
 * This prints them, split by what a maintainer would actually do about each.
 * The split is on the PANEL TITLE, not on `abstractEligible`: that flag looks
 * like the classifier and is not one. Poster sessions are modelled as break
 * slots in some editions and as ordinary slots in others, and the 2024 joint
 * event's "Panel 1: Cooperation & Conflict in the Natural World" is flagged
 * ineligible while being a real paper panel.
 *
 * Four classes, and only one of them is a queue:
 *
 *   ceremonial   Keynotes, roundtables, opening and concluding remarks.
 *                Expected. They are not papers and were never going to carry
 *                a research theme. Do nothing.
 *
 *   poster       Poster sessions. Expected as a class. Worth knowing that the
 *                editions disagree about how a poster slot is modelled.
 *
 *   placeholder  The panel title carries no subject at all ("Session I",
 *                "Panel 1"). Nothing could have matched it, so only the
 *                abstract had a chance, and the prose rules in paperIndex.js
 *                deliberately drop the vocabulary these papers lean on
 *                ("NATO" fires in 19% of abstracts, "alliance" in 15%, so
 *                both are ambient rather than topical). Accepted, unless the
 *                programme's real panel titles can be recovered.
 *
 *   miss         A real panel title that matched nothing. THIS is the queue.
 *                Each one is either a rule that is too narrow or a subject
 *                the seventeen themes do not cover, and the two want
 *                different fixes: widen the pattern, or write a scope note on
 *                the published vocabulary (#1249) saying the boundary is
 *                deliberate.
 *
 * Run: node scripts/untagged-papers.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const index = require("../src/_data/paperIndex.js");
const data = typeof index === "function" ? index() : index;
const papers = data.papers || [];

const CEREMONIAL = /keynote|roundtable|opening remarks|introductory remarks|concluding|closing/i;
const POSTER = /poster/i;
// A panel title that is a slot number and nothing else.
const PLACEHOLDER = /^(session|panel|paper session)\s*[IVXLC0-9]+\s*$/i;

function classify(panel) {
  const t = String(panel || "").trim();
  if (!t) return "placeholder";
  if (POSTER.test(t)) return "poster";
  if (CEREMONIAL.test(t)) return "ceremonial";
  if (PLACEHOLDER.test(t)) return "placeholder";
  return "miss";
}

const untagged = papers.filter((p) => !p.theme.length);
const groups = { miss: [], placeholder: [], poster: [], ceremonial: [] };
for (const p of untagged) groups[classify(p.panel)].push(p);

const total = Object.values(groups).reduce((n, g) => n + g.length, 0);
if (total !== untagged.length) {
  throw new Error(`classifier lost papers: ${total} classified, ${untagged.length} untagged`);
}

const HEADINGS = {
  miss: "MISS — the queue. Widen a rule, or write a scope note saying the boundary is deliberate.",
  placeholder: "PLACEHOLDER — the panel title carries no subject. Accepted.",
  poster: "POSTER — expected.",
  ceremonial: "CEREMONIAL — not papers. Expected.",
};

console.log(
  `${untagged.length} of ${papers.length} papers carry no research theme ` +
    `(${((100 * untagged.length) / papers.length).toFixed(1)}%).\n`
);

for (const kind of ["miss", "placeholder", "poster", "ceremonial"]) {
  const g = groups[kind];
  console.log(`── ${HEADINGS[kind]}  [${g.length}]`);
  const byPanel = new Map();
  for (const p of g) {
    if (!byPanel.has(p.panel)) byPanel.set(p.panel, []);
    byPanel.get(p.panel).push(p);
  }
  for (const [panel, ps] of [...byPanel.entries()].sort()) {
    const years = [...new Set(ps.map((p) => p.year))].join(", ");
    console.log(`   ${years}  ${panel || "(no panel title)"}  [${ps.length}]`);
    for (const p of ps) {
      // Whether an abstract is on file decides whether the prose rules had a
      // chance at this paper or never saw it.
      console.log(`      ${p.abstract ? "abstract" : "no abstract"}  ${p.title}`);
    }
  }
  console.log("");
}
