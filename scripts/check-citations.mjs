#!/usr/bin/env node
/**
 * Citation-export sanity check (#1254).
 *
 * The BibTeX escaper is the one piece of non-trivial logic in the citation
 * path: it escapes LaTeX specials and then brace-protects acronyms, and the
 * order matters, so a regression there is silent. A broken .bib does not fail
 * the Eleventy build, it fails in a reader's LaTeX compile weeks later.
 *
 * Asserts over the whole corpus rather than a fixture, because the corpus is
 * what actually ships and it grows every edition.
 *
 *   node scripts/check-citations.mjs      # exit 0 clean, 1 on any failure
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { bySlug } = require("../src/_data/citations.js");

const entries = Object.entries(bySlug());
const fail = [];
const note = (slug, msg) => fail.push(`${slug}: ${msg}`);

// `doi` and `url` are verbatim fields: BibTeX readers and Crossref's own
// exports leave underscores raw in a DOI, and escaping one breaks resolution.
// So the unescaped-special check skips those two lines rather than pretending
// a raw `_` there is a defect.
const isVerbatimField = (line) => /^\s*(doi|url)\s*=/.test(line);

for (const [slug, { bib, ris }] of entries) {
  // Braces must balance once escaped ones are discounted, or the entry
  // swallows whatever follows it in a concatenated bulk export.
  const noEscaped = bib.replace(/\\[{}]/g, "");
  const open = (noEscaped.match(/\{/g) || []).length;
  const close = (noEscaped.match(/\}/g) || []).length;
  if (open !== close) note(slug, `unbalanced braces (${open} open, ${close} close)`);

  for (const line of bib.split("\n")) {
    if (isVerbatimField(line)) continue;
    const stripped = line.replace(/\\[&%#$_]/g, "");
    if (/(^|[^\\])[&%#$_]/.test(stripped)) note(slug, `unescaped LaTeX special: ${line.trim()}`);
  }

  if (!/^@\w+\{eiss-/.test(bib)) note(slug, "entry does not open with @type{eiss-…");

  // RIS: TY must be first and ER must terminate, or importers reject the record.
  if (!/^TY {2}- /.test(ris)) note(slug, "RIS does not start with TY");
  if (!/^ER {2}- /m.test(ris)) note(slug, "RIS has no ER terminator");
  if (!ris.includes("\r\n")) note(slug, "RIS is not CRLF-terminated");
}

// An acronym somewhere in the corpus must be brace-protected, or the
// protection pass has silently stopped running.
const anyProtected = entries.some(([, { bib }]) => /\{[A-Z][A-Z0-9]+\}/.test(bib));
if (!anyProtected) fail.push("no brace-protected acronym found anywhere — is the protection pass running?");

if (fail.length) {
  console.error(`✗ citation check failed (${fail.length} problem${fail.length === 1 ? "" : "s"}):`);
  for (const f of fail.slice(0, 20)) console.error("  " + f);
  if (fail.length > 20) console.error(`  … and ${fail.length - 20} more`);
  process.exit(1);
}
console.log(`✓ citation check passed (${entries.length} papers: braces balanced, specials escaped, RIS well-formed, acronyms protected).`);
