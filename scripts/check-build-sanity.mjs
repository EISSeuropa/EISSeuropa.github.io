#!/usr/bin/env node
/**
 * Build-sanity guard. Catches the class of bug that the link checker and
 * Eleventy build both miss, and that bit /2026's programme-PDF buttons
 * (issues #478, #479):
 *
 *   1. Duplicate keys in an object literal in src/_data/*.js. JavaScript
 *      silently keeps the last duplicate, so a key declared twice (e.g.
 *      `programmePdf` as both an object and a string) drops one value
 *      with no error anywhere. Parsed with acorn (already a locked dep).
 *
 *   2. Empty or junk href / src attributes in the built _site/. An
 *      `href=""` looks like a link but only reloads the page ("reactive
 *      but not clickable"); a literal `undefined` / `[object Object]`
 *      in an attribute means a template read a missing or wrong-typed
 *      value. The link checker treats an empty href as a no-op, not a
 *      broken link, so it slips through.
 *
 *   3. Scheme-less profile links in src/_data/board.json. The board card
 *      template renders `links.*` straight into href, so a value without
 *      a URL scheme (a bare domain, or a bare ORCID iD) resolves as a
 *      path on eiss-europa.com and 404s (#522). The .eleventy.js
 *      `extLink` filter and sync-board.py both normalise these, but this
 *      asserts the stored data is already clean so a hand-edit can't
 *      lean silently on the render-time backstop.
 *
 *   4. Classes referenced in built markup with no matching selector in
 *      site.css (#241 / §14: the search modal and press kit both shipped
 *      with complete markup and zero styles, twice).
 *
 *   5. Cross-block class collisions in site.css (#241): a class styled as
 *      the selector subject in two different component sections, using
 *      the file's `/* ---------- name ---------- *\/` section headers for
 *      attribution. This is the failure mode that broke the live /2026
 *      programme grid in production when the /2021 archive block reused
 *      `.programme-slot` (#231 -> #239). See checkCssCollisions() below.
 *
 * Exit 0 when clean, 1 (with a report) on any finding. Run after the
 * build so _site/ exists; the data-key + board-link + CSS checks work
 * without a build.
 *
 * Usage: node scripts/check-build-sanity.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import * as acorn from "acorn";

const problems = [];
const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

// ── 1. Duplicate object keys in src/_data/*.js ──────────────────────────
function checkDataKeys() {
  const dir = "src/_data";
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".js"))) {
    const file = join(dir, f);
    const src = readFileSync(file, "utf8");
    let ast;
    try {
      ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" });
    } catch (e) {
      problems.push(`${file}: could not parse (${e.message})`);
      continue;
    }
    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "ObjectExpression") {
        const seen = new Map();
        for (const p of node.properties) {
          if (p.type !== "Property" || p.computed) continue;
          const key = p.key.name ?? p.key.value;
          if (seen.has(key)) {
            problems.push(
              `${file}:${lineOf(src, p.start)}: duplicate key "${key}" ` +
                `(first defined on line ${lineOf(src, seen.get(key))}) — ` +
                `JS keeps only the last, silently dropping a value`
            );
          } else {
            seen.set(key, p.start);
          }
        }
      }
      for (const k in node) {
        const v = node[k];
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === "object" && v.type) walk(v);
      }
    };
    walk(ast);
  }
}

// ── 2. Empty / junk href|src in built HTML ──────────────────────────────
function htmlFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) htmlFiles(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function checkBuiltHtml() {
  const files = htmlFiles("_site");
  if (!files.length) {
    console.warn("note: _site/ not found — skipping built-HTML checks (run `npm run build` first)");
    return;
  }
  // Empty href/src, and literal undefined / null / [object Object] / NaN
  // landing in a URL-ish attribute. None of these is ever legitimate.
  const empty = /\s(href|src)=""/g;
  const junk = /\s(href|src|srcset|poster|action|content)="(undefined|null|NaN|\[object Object\])"/g;
  const objObj = /\[object Object\]/g;
  for (const file of files) {
    const txt = readFileSync(file, "utf8");
    const rel = file.replace(/^_site\//, "");
    for (const m of txt.matchAll(empty)) problems.push(`${rel}:${lineOf(txt, m.index)}: empty ${m[1]}="" (looks interactive, does nothing)`);
    for (const m of txt.matchAll(junk)) problems.push(`${rel}:${lineOf(txt, m.index)}: ${m[1]}="${m[2]}" (template read a missing/wrong-typed value)`);
    for (const m of txt.matchAll(objObj)) problems.push(`${rel}:${lineOf(txt, m.index)}: "[object Object]" in output (an object rendered where a string was expected)`);
  }
}

// ── 3. Scheme-less profile links in src/_data/board.json ────────────────
function checkBoardLinks() {
  const file = "src/_data/board.json";
  if (!existsSync(file)) return;
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    problems.push(`${file}: could not parse (${e.message})`);
    return;
  }
  const entries = [...(data.members ?? []), ...(data.support ?? [])];
  for (const p of entries) {
    const links = p.links;
    if (!links || typeof links !== "object") continue;
    for (const [key, value] of Object.entries(links)) {
      // publicEmail is rendered as mailto: — not a URL with a scheme.
      if (key === "publicEmail") continue;
      if (typeof value !== "string" || !value) continue;
      if (!/^(https?:)?\/\//.test(value)) {
        problems.push(
          `${file}: ${p.name ?? "?"} → links.${key} = "${value}" is missing a ` +
            `URL scheme; it would render as a relative path and 404 ` +
            `(use https://… , or for orcid the full https://orcid.org/<id>)`
        );
      }
    }
  }
}

// ── 4. Classes referenced in built markup but defined nowhere in CSS ────
// The §14 failure mode: a whole feature ships with complete markup and
// not one of its classes in site.css (the unstyled search modal and
// press-kit, plus the NetSec .grid-2). Scans the modernised built pages
// (legacy passthroughs keep their own bundled styles) and asserts every
// class token has a `.class` selector in src/assets/css/site.css.
// Scanning _site/ rather than the .njk sources means Nunjucks-composed
// names (e.g. programme-slot-room--c3) arrive fully resolved.
function checkUndefinedClasses() {
  const cssFile = "src/assets/css/site.css";
  if (!existsSync(cssFile)) return;
  const files = htmlFiles("_site");
  if (!files.length) return; // checkBuiltHtml already warned

  const css = readFileSync(cssFile, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const defined = new Set();
  for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)/g)) defined.add(m[1]);

  // Classes referenced from the site JS (querySelector hooks, classList
  // toggles, composed names). A class the JS knows about is intentional
  // even when no selector styles it directly.
  let jsBlob = "";
  const jsDir = "src/assets/js";
  if (existsSync(jsDir)) {
    for (const f of readdirSync(jsDir).filter((n) => n.endsWith(".js"))) {
      jsBlob += readFileSync(join(jsDir, f), "utf8");
    }
  }

  // Classes that legitimately appear in markup with no selector of their
  // own. Keep this list short; a new entry needs a one-line justification.
  const allow = new Set([
    "pagefind-ignore", // consumed by the Pagefind indexer, not CSS
    "hero-watch-live", // semantic marker on a .btn; only its __dot child is styled
    "press-copy", // wrapper around the styled .press-copy-* children
    "person-role-primary", // sync-pipeline semantic marker inside .person-role
    "notfound-search", // wrapper around the styled .search-* form on /404
  ]);

  const isKnown = (cls) => {
    if (defined.has(cls) || allow.has(cls)) return true;
    if (jsBlob.includes(cls)) return true; // JS hook
    // An unstyled variant or element of a styled BEM-ish family
    // (programme-slot--plenary, countdown__text): fine when the family
    // base carries the styles.
    const base = cls.split(/--|__/)[0];
    if (base !== cls && defined.has(base)) return true;
    // A bare namespace token whose family is styled (class="section
    // programme" where .programme-grid etc. carry the styles): treat a
    // token as known when site.css defines any `.token-` descendant.
    if (css.includes(`.${cls}-`)) return true;
    return false;
  };

  const seen = new Map(); // class -> first "file:line"
  for (const file of files) {
    let txt = readFileSync(file, "utf8");
    if (!txt.includes('class="site-header"')) continue; // legacy passthrough
    const rel = file.replace(/^_site\//, "");
    // Inline SVG internals style themselves (presentation attributes,
    // currentColor); their classes are not site.css's job.
    txt = txt.replace(/<svg[\s\S]*?<\/svg>/g, "");
    for (const m of txt.matchAll(/\sclass="([^"]*)"/g)) {
      for (const cls of m[1].split(/\s+/)) {
        if (!cls || !/^[A-Za-z_][\w-]*$/.test(cls)) continue;
        if (isKnown(cls) || seen.has(cls)) continue;
        seen.set(cls, `${rel}:${lineOf(txt, m.index)}`);
      }
    }
  }
  for (const [cls, where] of [...seen].sort()) {
    problems.push(`${where}: class "${cls}" is not defined in site.css (markup shipped without styles? — §14 / #241)`);
  }
}

// ── 5. Cross-block CSS class collisions in site.css (#241) ──────────────
// site.css is one ~7000-line global stylesheet with no scoping, so two
// unrelated components can silently fight over the same class name — the
// last selector in the file wins the cascade. This shipped once: PR #231's
// /2021 archive block redefined `.programme-slot`/`.programme-day`, the
// names the live /2026 programme grid already owned, and broke the live
// grid in production (fixed in #239). CLAUDE.md §15 is the convention (one
// class prefix per component); this is the enforcement half.
//
// site.css is already organised into ~55 component sections delimited by
// `/* ---------- name ---------- */` (and a few `/* ==== */` banner)
// comments, so this reuses that structure for attribution rather than
// requiring new metadata: a class is a collision only when it is the
// *subject* (rightmost compound) of a selector in two or more DIFFERENT
// sections. A naive "same class defined twice anywhere" detector flags
// ~105 classes on this stylesheet, almost all legitimate dark-mode /
// responsive / print / variant repeats within one component's own section.
function checkCssCollisions() {
  const cssFile = "src/assets/css/site.css";
  if (!existsSync(cssFile)) return;
  const raw = readFileSync(cssFile, "utf8");

  // Section headers: `/* ---------- name ---------- */`, `/* ==== ... ==== */`,
  // or `/* ──── ... */` (box-drawing, used for sub-sections within a larger
  // umbrella section, e.g. "People hovercards"), possibly multi-line. The
  // first line (minus comment markers and rule characters) is the section
  // name used for attribution.
  const headerRe = /\/\*\s*[-=─]{3,}[\s\S]*?\*\//g;
  const sections = []; // { name, headerEnd }
  for (const m of raw.matchAll(headerRe)) {
    const lines = m[0].split("\n");
    let name = lines[0].replace(/^\/\*+[-=─\s]*/, "").replace(/[-=─\s]+\*?\/?$/, "").trim();
    // The box-drawing (───) style puts the rule on its own line, with the
    // section name starting on the next line — fall back to it.
    if (!name && lines[1]) name = lines[1].replace(/^\s*/, "").split(/[.(]/)[0].trim();
    if (!name) continue; // a bare `/* ---- */` rule (design-token sub-divider), not a section
    sections.push({ name, headerEnd: m.index + m[0].length });
  }
  const sectionOf = (idx) => {
    let name = "(preamble)";
    for (const s of sections) {
      if (s.headerEnd <= idx) name = s.name;
      else break;
    }
    return name;
  };

  // Override-sweep sections deliberately restyle other components' classes
  // wholesale and are never the "owner" of a class for collision purposes.
  // Identified empirically by reading every candidate this check flagged.
  const sweepSections = new Set([
    "print stylesheet", // forces light theme + strips chrome across every component for paper
    "Mobile tap-target + layout floors", // lifts touch targets across every component at <=480px
    "reset / base", // global element reset + cross-cutting a11y focus ring (a:focus-visible, button:focus-visible, .btn:focus-visible together)
    "scroll-driven hero + header treatments", // animation-only: adds a scroll-linked animation to .hero-bg/.site-header/.nav, no property collides with their base definitions
    "/board — mobile compact card layout", // documented <=36rem responsive collapse of the shared person-card component (see its own header comment)
    "/board — EISS community alumni", // documented alumni-register variant of the shared person-card component (see its own header comment)
  ]);

  // Residual legitimate cross-section reuse on the current stylesheet.
  // Each entry needs a one-line reason; investigate before adding one.
  const knownException = new Set([
    "btn:structured grids (programmes, who-are-you)", // `.btn.stretched-link:active` — a compound state variant on the shared .btn, not a redefinition
    // The four below predate the CLAUDE.md §15 convention (v2.14.2) and sit
    // bare in a section they don't belong to, but every property is
    // additive (no conflicting property with the owning section) —
    // confirmed by reading both definitions side by side. #241 follow-up:
    // relocating them into their owning section is a separate, purely
    // cosmetic diff, tracked rather than folded into this lint.
    "programme-row:Speaker index (/speakers)", // 720px collapse of the shared live-programme-grid row, landed under Speaker index
    "programme-when-time:Speaker index (/speakers)",
    "programme-contrib:Speaker index (/speakers)",
    "programme-contrib-when:Speaker index (/speakers)",
    "photo-gallery:Public roadmap", // `@media print { display: none }` for the shared photo-gallery component, landed just past the print stylesheet's own section boundary
    "people-grid:Board card footer + the \"View profile\" link", // `align-items: stretch` on the shared person-card grid, additive
    "person-themes:Board card footer + the \"View profile\" link", // line-clamp on the shared person-card themes line, additive
    // .member-pubs / .member-pub-name: the "Speaker index" definition (line
    // 4104) is DEAD CSS — none of its sibling selectors (.member-pub,
    // .member-pub-title, .member-pub-works, .member-pub-meta) appear in any
    // .njk template; the live /publications markup (publications-body.njk)
    // only ever uses the first definition's classes (.member-pub-head,
    // .member-pub-group). Allowlisted rather than deleted here to keep this
    // diff to the lint; flagged to the maintainer for cleanup.
    "member-pubs:Speaker index (/speakers)",
    "member-pub-name:Speaker index (/speakers)",
  ]);

  // Blank out comments (preserving offsets/line numbers) so brace-depth
  // tracking and selector text never see comment content.
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  const lineOf = (idx) => raw.slice(0, idx).split("\n").length;

  const splitTopLevel = (str, sep) => {
    const out = [];
    let depth = 0, cur = "";
    for (const ch of str) {
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      if (ch === sep && depth === 0) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };
  // The subject of a selector is its rightmost compound (after the last
  // combinator outside parens) — the element/class actually being styled,
  // as opposed to an ancestor scoping it (`.foo .bar` styles `.bar`).
  // Also reports whether an ancestor combinator was present: `.foo .bar`
  // (scoped == true) is a legitimate contextual extension of `.bar` from
  // wherever `.foo` lives — CLAUDE.md §15's "reuse another component's base
  // class only when you genuinely mean to extend it" — not a competing
  // definition. Only an UNSCOPED rule (bare `.bar { }`, or a same-element
  // compound like `.bar.baz { }`) makes a real ownership claim; that's what
  // the #231 regression looked like (`.programme-slot { color: red }`
  // landing bare in the wrong section).
  const rightmostCompound = (sel) => {
    let depth = 0, splitAt = -1;
    for (let i = sel.length - 1; i >= 0; i--) {
      const ch = sel[i];
      if (ch === ")") depth++;
      else if (ch === "(") depth--;
      if (depth === 0 && /[\s>+~]/.test(ch)) { splitAt = i; break; }
    }
    return { compound: splitAt === -1 ? sel : sel.slice(splitAt + 1), scoped: splitAt !== -1 };
  };

  // owner: class -> Map(sectionName -> first line number)
  const owners = new Map();
  let i = 0, selectorStart = 0;
  const atRuleStack = [];
  while (i < src.length) {
    const ch = src[i];
    if (ch === "{") {
      const sel = src.slice(selectorStart, i).trim();
      // Attribute by where the selector TEXT starts, not selectorStart
      // (which includes trailing whitespace/blanked comments from the
      // previous rule) — a comment sitting right before a rule would
      // otherwise misattribute that rule to the section above the comment.
      const selOffset = src.slice(selectorStart, i).search(/\S/);
      const selIdx = selOffset === -1 ? selectorStart : selectorStart + selOffset;
      if (sel.startsWith("@")) {
        atRuleStack.push(sel.match(/^@([a-zA-Z-]+)/)?.[1] ?? "");
      } else {
        atRuleStack.push(null);
        const inSkipBody = atRuleStack.slice(0, -1).some((a) => a === "keyframes" || a === "-webkit-keyframes" || a === "font-face");
        if (!inSkipBody && sel) {
          const section = sectionOf(selIdx);
          for (const part of splitTopLevel(sel, ",")) {
            const { compound, scoped } = rightmostCompound(part.trim());
            if (scoped) continue; // contextual extension, not an ownership claim
            for (const m of compound.matchAll(/\.([A-Za-z0-9_-]+)/g)) {
              const cls = m[1];
              if (!owners.has(cls)) owners.set(cls, new Map());
              const bySection = owners.get(cls);
              if (!bySection.has(section)) bySection.set(section, lineOf(selIdx));
            }
          }
        }
      }
      i++;
      selectorStart = i;
      continue;
    } else if (ch === "}") {
      atRuleStack.pop();
      i++;
      selectorStart = i;
      continue;
    }
    i++;
  }

  for (const [cls, bySection] of owners) {
    const realOwners = [...bySection.entries()].filter(([name]) => !sweepSections.has(name));
    if (realOwners.length < 2) continue;
    const flagged = realOwners.filter(([name]) => !knownException.has(`${cls}:${name}`));
    if (flagged.length < 2) continue;
    const where = flagged.map(([name, line]) => `"${name}" (line ${line})`).join(" and ");
    problems.push(
      `${cssFile}: .${cls} is styled as the subject of a selector in two different sections: ${where} — ` +
        `each component should own a unique class prefix (CLAUDE.md §15); confirm this isn't a #231-class collision`
    );
  }
}

// ── 6. People hovercard index present, non-empty, and resolvable ────────
// The site-wide hovercard (src/assets/js/people-hovercards.js) fetches
// /data/people-index.json at runtime; if that file goes missing or empty,
// every name silently loses its card with no build error. And each entry's
// `url` must point at a real built profile page, or the card's "View
// profile" link 404s. Both the index (peopleIndex.js) and the profile pages
// (profilePages.js) derive from boardSorted, so this asserts the two stay in
// lockstep across any board.json edit.
function checkPeopleIndex() {
  const file = "_site/data/people-index.json";
  if (!existsSync(file)) {
    // Only a problem if a build actually ran; otherwise checkBuiltHtml warned.
    if (htmlFiles("_site").length) {
      problems.push(`${file}: missing — the people hovercard index was not built`);
    }
    return;
  }
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    problems.push(`${file}: could not parse (${e.message})`);
    return;
  }
  if (!Array.isArray(data.people) || data.people.length === 0) {
    problems.push(`${file}: no people in the hovercard index — every name would silently lose its card`);
    return;
  }
  for (const p of data.people) {
    if (!p.detect || !p.slug || !p.url) {
      problems.push(`${file}: entry ${JSON.stringify(p.name || p.slug || "?")} is missing detect/slug/url`);
      continue;
    }
    const page = join("_site", p.url.replace(/^\//, ""));
    if (!existsSync(page)) {
      problems.push(
        `${file}: ${p.name || p.detect} → ${p.url} has no built profile page ` +
          `(hovercard "View profile" would 404 — peopleIndex.js and profilePages.js out of sync)`
      );
    }
  }
}

checkDataKeys();
checkBoardLinks();
checkBuiltHtml();
checkUndefinedClasses();
checkCssCollisions();
checkPeopleIndex();

if (problems.length) {
  console.error(`\n✗ build-sanity check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):\n`);
  for (const p of problems) console.error("  - " + p);
  console.error("");
  process.exit(1);
}
console.log("✓ build-sanity check passed (no duplicate data keys, no scheme-less board links, no empty/junk href/src, no undefined CSS classes, no cross-block CSS class collisions, people hovercard index resolvable).");
