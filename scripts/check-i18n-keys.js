#!/usr/bin/env node
// Chrome-string key-parity check for src/_data/i18n.js.
//
// The drift checker (check-i18n-drift.py) watches the translated *page*
// sources, but the shared chrome catalog (nav, footer, search, ribbons,
// the registration badge, …) lives as three sibling objects en/fr/de in
// i18n.js, which it can't see. So a new EN key could ship without its
// FR/DE translations and nothing would flag it — exactly how `pressKit`
// and `film.play` nearly slipped through. This asserts the three
// catalogs carry the *same* set of (nested) keys. It does NOT check the
// values are actually translated — only that no key is missing or
// orphaned. Run by CI (i18n-drift.yml) and locally.
//
// Exit 0 = parity; exit 1 = mismatch (prints the offending keys).
const path = require("path");
const i18n = require(path.join("..", "src", "_data", "i18n.js"));

function keyPaths(obj, prefix = "") {
  let out = [];
  for (const k of Object.keys(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (v && typeof v === "object" && !Array.isArray(v)) out = out.concat(keyPaths(v, p));
    else out.push(p);
  }
  return out;
}

const LANGS = ["en", "fr", "de"];
const sets = Object.fromEntries(LANGS.map((l) => [l, new Set(keyPaths(i18n[l] || {}))]));
const ref = sets.en;
let bad = false;

for (const l of ["fr", "de"]) {
  const missing = [...ref].filter((k) => !sets[l].has(k));
  const extra = [...sets[l]].filter((k) => !ref.has(k));
  if (missing.length) { bad = true; console.error(`✗ ${l}: missing ${missing.length} key(s) present in EN:\n   ${missing.join("\n   ")}`); }
  if (extra.length) { bad = true; console.error(`✗ ${l}: has ${extra.length} key(s) not in EN:\n   ${extra.join("\n   ")}`); }
}

if (bad) {
  console.error("\ni18n.js chrome-string key sets differ across locales. Add the missing translations (or remove the orphan) so en/fr/de stay in parity.");
  process.exit(1);
}
console.log(`✓ i18n.js chrome strings: en / fr / de in key parity (${ref.size} keys each).`);
