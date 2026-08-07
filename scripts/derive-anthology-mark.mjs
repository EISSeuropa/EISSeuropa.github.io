#!/usr/bin/env node
/**
 * Candidate marks for the Anthology and the Atlas, derived from the corpus (#1253).
 *
 *   node scripts/derive-anthology-mark.mjs            # candidates + review page
 *   node scripts/derive-anthology-mark.mjs --seeds=8  # more to choose from
 *
 * A DESIGN INSTRUMENT, NOT A BUILD STEP. #1253 pulls two ways: it wants a mark
 * derived from the real co-authorship graph, and it also says a mark that
 * shifts each edition is not a mark. Both are right. So this emits candidates,
 * a person picks one, and the winner is frozen as a committed SVG in
 * src/assets/images/brand/. Nothing here runs during a site build, and the
 * frozen mark does not change when the corpus does.
 *
 * The idea it is testing: the EISS iconmark is already a constellation of
 * nodes and lines, and the Atlas is a force-directed graph. They are the same
 * visual idea at different scales, so the sub-brand should reveal that rather
 * than invent a second language.
 *
 * Output (all gitignored, regenerate freely):
 *   data/mark-candidates/<variant>-n<nodes>-s<seed>.svg
 *   data/mark-candidates/index.html   review page, every candidate at every
 *                                     size on a light and a dark surface
 *
 * Freezing a winner:
 *   1. Copy its .svg into src/assets/images/brand/anthology-mark.svg
 *   2. Record the variant, node count and seed in BRAND.md, so it can be
 *      re-derived. That record is what makes this reproducible rather than
 *      merely deterministic.
 *
 * Constraints held, from BRAND.md and #1253:
 *   - Two brand colours only, no new hue. Nodes and edges carry
 *     class="logo-network" + var(--brand-network, #73caff); the Atlas's lit
 *     node uses class="logo-text" + currentColor, so it follows its surface
 *     exactly like the wordmark does.
 *   - No dependency: the layout is ~40 lines of force simulation with a
 *     seeded PRNG (rule §16.3).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const atlas = require("../src/_data/anthologyAtlas.js");

const OUT = "data/mark-candidates";
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
const SEEDS = arg("seeds", 4);
// Three sizes on purpose. 17 is the largest real cluster and the most
// "made of the corpus"; the smaller cuts exist because #1253 requires the mark
// to survive 16px, and seventeen dots almost certainly will not. Generating
// all three is how that question gets answered by looking instead of arguing.
const NODE_COUNTS = [17, 12, 8];

/* ---------- the subgraph ---------- */

// Largest connected component of the co-authorship graph. This is the corpus's
// biggest genuine collaboration cluster, which is the part worth standing for.
function largestComponent() {
  const adj = new Map();
  for (const e of atlas.coauthorEdges) {
    for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) {
      if (!adj.has(x)) adj.set(x, new Set());
      adj.get(x).add(y);
    }
  }
  const seen = new Set();
  let best = [];
  for (const n of adj.keys()) {
    if (seen.has(n)) continue;
    const comp = [];
    const stack = [n];
    while (stack.length) {
      const c = stack.pop();
      if (seen.has(c)) continue;
      seen.add(c);
      comp.push(c);
      for (const m of adj.get(c) || []) if (!seen.has(m)) stack.push(m);
    }
    if (comp.length > best.length) best = comp;
  }
  return { nodes: best, adj };
}

// Trim to the n best-connected nodes, keeping the edges induced between them.
// Degree rather than paper count: the mark is about the shape of collaboration,
// and dropping a hub would leave a structure that does not read as a network.
function trim(nodeIds, adj, n) {
  const kept = [...nodeIds]
    .sort((a, b) => (adj.get(b)?.size || 0) - (adj.get(a)?.size || 0))
    .slice(0, n);
  const set = new Set(kept);
  const edges = atlas.coauthorEdges
    .filter((e) => set.has(e.a) && set.has(e.b))
    .map((e) => ({ a: kept.indexOf(e.a), b: kept.indexOf(e.b), weight: e.weight || 1 }));
  return { ids: kept, edges };
}

/* ---------- layout ---------- */

// mulberry32: small, seedable, and good enough for scattering start positions.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function layout(count, edges, seed) {
  const rand = rng(seed);
  const pts = Array.from({ length: count }, () => ({ x: rand() * 100, y: rand() * 100, vx: 0, vy: 0 }));

  for (let step = 0; step < 400; step++) {
    const cooling = 1 - step / 400;
    // Repulsion, every pair.
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        let d2 = dx * dx + dy * dy || 0.01;
        const f = 220 / d2;
        const d = Math.sqrt(d2);
        const ux = (dx / d) * f;
        const uy = (dy / d) * f;
        pts[i].vx -= ux; pts[i].vy -= uy;
        pts[j].vx += ux; pts[j].vy += uy;
      }
    }
    // Spring attraction along real co-authorship edges. A pair that co-wrote
    // more than once pulls harder, so repeat collaborators sit closer.
    for (const e of edges) {
      const p = pts[e.a], q = pts[e.b];
      const dx = q.x - p.x, dy = q.y - p.y;
      const d = Math.hypot(dx, dy) || 0.01;
      const f = (d - 26) * 0.012 * Math.min(e.weight, 3);
      const ux = (dx / d) * f, uy = (dy / d) * f;
      p.vx += ux; p.vy += uy;
      q.vx -= ux; q.vy -= uy;
    }
    for (const p of pts) {
      p.x += p.vx * cooling; p.y += p.vy * cooling;
      p.vx *= 0.82; p.vy *= 0.82;
    }
  }
  return pts;
}

/* ---------- render ---------- */

function svg(variant, ids, edges, pts) {
  const S = 64, PAD = 6;
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const k = (S - PAD * 2) / span;
  // Centre the drawing rather than the bounding box origin, so an asymmetric
  // cluster does not sit off to one side of the viewBox.
  const offX = (S - (maxX - minX) * k) / 2;
  const offY = (S - (maxY - minY) * k) / 2;
  const at = (p) => [ (p.x - minX) * k + offX, (p.y - minY) * k + offY ];

  const counts = ids.map((i) => atlas.authors[i].paperCount || 1);
  const maxCount = Math.max(...counts);
  // sqrt so a 7-paper author reads as bigger without dwarfing everyone else.
  const radius = (c) => 1.5 + Math.sqrt(c / maxCount) * 2.2;

  // The Atlas lights its most-connected node: "you are here" on the map.
  const hub = counts.indexOf(Math.max(...counts));

  const lines = edges.map((e) => {
    const [x1, y1] = at(pts[e.a]);
    const [x2, y2] = at(pts[e.b]);
    return `<line class="logo-network" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="var(--brand-network, #73caff)" stroke-width="${(0.5 * Math.min(e.weight, 3)).toFixed(2)}" stroke-opacity="0.55"/>`;
  });

  const dots = pts.map((p, i) => {
    const [x, y] = at(p);
    const lit = variant === "atlas" && i === hub;
    const cls = lit ? "logo-text" : "logo-network";
    const fill = lit ? "currentColor" : "var(--brand-network, #73caff)";
    const r = radius(counts[i]) * (lit ? 1.35 : 1);
    return `<circle class="${cls}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}"/>`;
  });

  const label = variant === "atlas" ? "Anthology Atlas mark" : "Anthology mark";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="${label}">
  <title>${label}</title>
${lines.map((l) => "  " + l).join("\n")}
${dots.map((d) => "  " + d).join("\n")}
</svg>
`;
}

/* ---------- run ---------- */

const { nodes, adj } = largestComponent();
mkdirSync(OUT, { recursive: true });

const made = [];
for (const n of NODE_COUNTS) {
  if (n > nodes.length) continue;
  const { ids, edges } = trim(nodes, adj, n);
  for (let s = 1; s <= SEEDS; s++) {
    const pts = layout(ids.length, edges, s * 7919);
    for (const variant of ["anthology", "atlas"]) {
      const name = `${variant}-n${n}-s${s}.svg`;
      writeFileSync(`${OUT}/${name}`, svg(variant, ids, edges, pts));
      made.push({ name, variant, n, s, edges: edges.length });
    }
  }
}

/* Review page. Self-contained, opened directly from disk: the site build has
   no business knowing about candidates, and only the frozen winner ever
   reaches src/assets/images/brand/. */
const sizes = [128, 64, 32, 16];
const card = (m) => `
  <figure class="c">
    <figcaption><code>${m.name}</code><span>${m.n} nodes · ${m.edges} edges · seed ${m.s}</span></figcaption>
    <div class="row light">${sizes.map((px) => `<span><img src="${m.name}" width="${px}" height="${px}" alt=""><em>${px}</em></span>`).join("")}</div>
    <div class="row dark">${sizes.map((px) => `<span><img src="${m.name}" width="${px}" height="${px}" alt=""><em>${px}</em></span>`).join("")}</div>
  </figure>`;

writeFileSync(
  `${OUT}/index.html`,
  `<!doctype html><meta charset="utf-8"><title>Anthology mark candidates</title>
<style>
 body{font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:2rem;background:#fff;color:#16202b}
 h1{font-size:1.4rem} p{max-width:60ch;color:#5a6b7d}
 .c{border:1px solid #d9e2ec;border-radius:10px;padding:1rem;margin:0 0 1rem}
 figcaption{display:flex;gap:.75rem;align-items:baseline;margin-bottom:.6rem;font-size:.85rem}
 figcaption span{color:#5a6b7d}
 .row{display:flex;gap:1.5rem;align-items:flex-end;padding:1rem;border-radius:8px}
 .row span{display:flex;flex-direction:column;align-items:center;gap:.25rem}
 .row em{font-style:normal;font-size:.7rem;opacity:.6}
 .light{background:#fff;color:#16202b}
 .dark{background:#0d1017;color:#eff2f5;margin-top:.5rem}
</style>
<h1>Anthology &amp; Atlas mark candidates</h1>
<p>Derived from the corpus's largest co-authorship cluster. Each row is one candidate on a light and a dark surface, at the sizes the mark is actually used. <strong>The 16px column is the decision</strong>: if it does not read there, the favicon variant does not exist.</p>
<p>The <em>atlas</em> variants light their most-connected node in <code>currentColor</code>, so it follows the surface like the wordmark. Everything else is the network blue.</p>
${made.map(card).join("")}
`
);

console.log(`wrote ${made.length} candidates + index.html to ${OUT}/`);
console.log(`node counts: ${NODE_COUNTS.join(", ")} · seeds: ${SEEDS} · variants: anthology, atlas`);
console.log(`\nreview:  open ${OUT}/index.html`);
console.log(`freeze:  cp ${OUT}/<winner>.svg src/assets/images/brand/anthology-mark.svg`);
console.log(`         then record variant + node count + seed in BRAND.md`);
