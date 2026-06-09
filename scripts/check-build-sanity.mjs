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
 * Exit 0 when clean, 1 (with a report) on any finding. Run after the
 * build so _site/ exists; the data-key + board-link checks work without
 * a build.
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

checkDataKeys();
checkBoardLinks();
checkBuiltHtml();
checkUndefinedClasses();

if (problems.length) {
  console.error(`\n✗ build-sanity check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):\n`);
  for (const p of problems) console.error("  - " + p);
  console.error("");
  process.exit(1);
}
console.log("✓ build-sanity check passed (no duplicate data keys, no scheme-less board links, no empty/junk href/src, no undefined CSS classes).");
