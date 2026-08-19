#!/usr/bin/env node
/**
 * Flip a /roadmap card from planned to shipped (#280).
 *
 *   node scripts/flip-roadmap-card.mjs v2.27.0                  # dry run, prints the diff
 *   node scripts/flip-roadmap-card.mjs v2.27.0 --write          # apply
 *   node scripts/flip-roadmap-card.mjs v2.27.0 --write --date 2026-09-14 --changes 31
 *
 * WHY
 *
 * The release cross-check asks the maintainer to flip the shipped card on
 * /roadmap.html by hand at every release: set the status, add the release-notes
 * link, drop the milestone so the progress bar stops rendering, and restate the
 * date in three locales. Four coordinated edits across EN, FR and DE, done
 * under release pressure, which is exactly when a hand-edit goes wrong and the
 * public roadmap drifts from reality.
 *
 * HOW, AND WHY NOT AN AST REWRITE
 *
 * #280 suggested an AST rewrite or a move to structured data. Both are worse
 * here. src/_data/roadmap.js is hand-written, hand-translated and heavily
 * commented; regenerating it from an AST would reformat the whole file and
 * throw away the comments, turning a four-line change into an unreviewable
 * diff. Moving to JSON would strip the comments and the notes() helper.
 *
 * So: acorn LOCATES and VALIDATES the entry (exact character range, current
 * field set), and the edit itself is textual within that range. The formatting
 * and every comment survive, and the diff is the four lines a human would have
 * written. The parser is what makes that safe rather than a regex guess.
 *
 * Nothing is written until the result has been re-parsed AND re-required, and
 * the resulting object checked field by field against what was asked for.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import * as acorn from "acorn";

const require = createRequire(import.meta.url);
const FILE = new URL("../src/_data/roadmap.js", import.meta.url);
const PATH = "src/_data/roadmap.js";

const argv = process.argv.slice(2);
// Accept "v2.27.0" and "2.27.0" alike. scripts/release.sh holds the version in
// the bare form its own usage documents and passed it straight through, so the
// guard that offers this flip mid-release got a usage message instead of a
// diff and skipped the offer without a word, for every release since #280
// (#1415). Normalising here fixes every caller at once, including the command
// the release script prints for the maintainer to run by hand.
const version = (argv.find((a) => /^v?\d+\.\d+\.\d+$/.test(a)) || "").replace(/^v?/, "v") || undefined;
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
};
const write = argv.includes("--write");
const date = flag("date") || new Date().toISOString().slice(0, 10);

if (!version) {
  console.error("usage: node scripts/flip-roadmap-card.mjs [v]X.Y.Z [--write] [--date YYYY-MM-DD] [--changes N]");
  process.exit(2);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`error: --date must be YYYY-MM-DD, got ${date}`);
  process.exit(2);
}

// Change count for the card. Counts the bullets the card is reporting, and
// stays overridable because the release commit may add or fold bullets
// afterwards.
//
// Two headings, in order, because the flip happens on either side of the
// promotion. Run before the release commit and [Unreleased] holds the batch.
// Run after it, which is what scripts/release.sh does, and [Unreleased] is an
// empty shell while the bullets sit under [X.Y.Z]. Reading only the first
// wrote `changes: 0` onto the v2.27.0 card until the count was passed by hand
// (#1415).
function changeCount() {
  const explicit = flag("changes");
  if (explicit) return Number(explicit);
  try {
    const md = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
    for (const heading of ["## [Unreleased]", `## [${version.slice(1)}]`]) {
      const start = md.indexOf(heading);
      if (start === -1) continue;
      const block = md.slice(start);
      const next = block.indexOf("\n## [", 1);
      const bullets = (block.slice(0, next === -1 ? undefined : next).match(/^- /gm) || []).length;
      if (bullets > 0) return bullets;
    }
    return null;
  } catch {
    return null;
  }
}

// Same formatter the news surface uses (.eleventy.js `newsDate`), so a flipped
// card reads identically to every hand-written one: "14 September 2026",
// "14 septembre 2026", "14. September 2026".
const longDate = (iso, lang) =>
  new Intl.DateTimeFormat({ en: "en-GB", fr: "fr-FR", de: "de-DE" }[lang], {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(iso + "T00:00:00Z"));

const src = readFileSync(FILE, "utf8");
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", ranges: true });

// Find the object literal whose `version` property is the target release.
let node = null;
(function walk(n) {
  if (!n || typeof n !== "object" || node) return;
  if (n.type === "ObjectExpression") {
    const v = n.properties.find((p) => p.key && (p.key.name || p.key.value) === "version");
    if (v && v.value.type === "Literal" && v.value.value === version) { node = n; return; }
  }
  for (const k of Object.keys(n)) {
    const c = n[k];
    if (Array.isArray(c)) c.forEach(walk);
    else if (c && typeof c.type === "string") walk(c);
  }
})(ast);

if (!node) {
  console.error(`error: no roadmap card with version "${version}" in ${PATH}.`);
  process.exit(1);
}

const prop = (name) => node.properties.find((p) => p.key && (p.key.name || p.key.value) === name);
const statusProp = prop("status");
const current = statusProp && statusProp.value.value;
if (current === "shipped") {
  console.log(`✓ ${version} is already shipped — nothing to do.`);
  process.exit(0);
}
if (current !== "planned" && current !== "in-progress") {
  console.error(`error: ${version} has status "${current}"; expected planned or in-progress.`);
  process.exit(1);
}

const [start, end] = node.range;
const block = src.slice(start, end);
const changes = changeCount();

// ── the edit, line by line inside the located block ─────────────────────────
let out = block;

// 1. status
out = out.replace(/status:\s*"(planned|in-progress)"/, 'status: "shipped"');

// 2. notesUrl + changes, inserted after `version:` so the field order matches
//    every hand-written shipped card.
const versionLine = out.match(/^(\s*)version:\s*"[^"]+",\s*$/m);
const indent = versionLine ? versionLine[1] : "          ";
let insert = `\n${indent}notesUrl: notes("${version}"),`;
if (changes != null) insert += `\n${indent}changes: ${changes},`;
out = out.replace(/^(\s*version:\s*"[^"]+",)\s*$/m, `$1${insert}`);

// 3. drop `milestone` — a shipped card must not render a progress bar
out = out.replace(/^\s*milestone:\s*"[^"]+",\s*\n/m, "");

// 4. the date, in all three locales. The existing `when` carries a planning
//    label ("September 2026 · v2.27.0"); shipped cards carry the real date.
const when = `when: { en: "${longDate(date, "en")} · ${version}", fr: "${longDate(date, "fr")} · ${version}", de: "${longDate(date, "de")} · ${version}" },`;
if (!/^\s*when:\s*\{[^}]*\},\s*$/m.test(out)) {
  console.error("error: could not find a single-line `when:` object to rewrite; roadmap.js formatting has changed.");
  process.exit(1);
}
out = out.replace(/^(\s*)when:\s*\{[^}]*\},\s*$/m, `$1${when}`);

const updated = src.slice(0, start) + out + src.slice(end);

// ── verify before writing ───────────────────────────────────────────────────
try {
  acorn.parse(updated, { ecmaVersion: "latest", sourceType: "script" });
} catch (e) {
  console.error(`error: the edit produced invalid JavaScript (${e.message}). Nothing written.`);
  process.exit(1);
}

// Re-require in a child process so a broken module cannot poison this one, and
// assert the card actually says what was asked for. A diff that looks right is
// not the same as a module that loads right.
const tmp = new URL("../src/_data/.roadmap-flip-check.js", import.meta.url);
writeFileSync(tmp, updated);
let verified;
try {
  verified = JSON.parse(
    execFileSync(process.execPath, ["-e",
      `const r=require(${JSON.stringify(new URL(tmp).pathname)});const d=typeof r==='function'?r():r;` +
      `let all=[];for(const g of (Object.values(d).find(Array.isArray)||[]))if(g.entries)all=all.concat(g.entries);` +
      `process.stdout.write(JSON.stringify(all.find(e=>e.version===${JSON.stringify(version)})||null));`,
    ], { encoding: "utf8" })
  );
} catch (e) {
  console.error(`error: the edited module failed to load (${e.message.split("\n")[0]}). Nothing written.`);
  process.exit(1);
} finally {
  try { execFileSync("rm", ["-f", new URL(tmp).pathname]); } catch {}
}

const problems = [];
if (!verified) problems.push("the card disappeared from the parsed output");
else {
  if (verified.status !== "shipped") problems.push(`status is "${verified.status}", expected "shipped"`);
  if (!verified.notesUrl || !verified.notesUrl.endsWith(version)) problems.push("notesUrl missing or wrong");
  if (verified.milestone) problems.push(`milestone "${verified.milestone}" survived; the progress bar would still render`);
  for (const l of ["en", "fr", "de"]) {
    if (!verified.when || !String(verified.when[l]).includes(version)) problems.push(`when.${l} does not carry ${version}`);
  }
}
if (problems.length) {
  console.error("error: the edit did not produce the expected card. Nothing written:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

// ── report ─────────────────────────────────────────────────────────────────
const before = block.split("\n");
const after = out.split("\n");
console.log(`${write ? "flipping" : "would flip"} ${version} to shipped in ${PATH}:\n`);
for (const l of before) if (!after.includes(l)) console.log("  - " + l.trim());
for (const l of after) if (!before.includes(l)) console.log("  + " + l.trim());
console.log();
console.log(`  date:    ${date}`);
console.log(`  changes: ${changes == null ? "(omitted — CHANGELOG unreadable)" : changes}`);

if (!write) {
  console.log("\ndry run. Re-run with --write to apply.");
  process.exit(0);
}
writeFileSync(FILE, updated);
console.log(`\n✓ written. Rebuild and eyeball /roadmap.html (+ FR + DE) before committing.`);
