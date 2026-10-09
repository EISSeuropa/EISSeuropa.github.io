// Escape an abstract and mark each “curly-quoted” passage as <q> (RGAA 9.4),
// with a lang attribute when the quotation is in another language (RGAA 8.7).
// The typed quotation marks stay in the text, so q.quote-inline sets
// `quotes: none` in site.css rather than letting the browser add a second pair.
// ponytail: scare quotes become <q> too, harmless to a screen reader; only
// matched “…” pairs are touched, so a truncated teaser never breaks.
const titleLang = require("./titleLang.js");

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function markQuotes(text, pageLang = "en") {
  const safe = String(text ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
  return safe.replace(/“([^“”]+)”/g, (_, inner) => {
    const lang = inner.length >= 12 ? titleLang(inner) : pageLang;
    const attr = lang !== pageLang ? ` lang="${lang}"` : "";
    return `“<q class="quote-inline"${attr}>${inner}</q>”`;
  });
}

module.exports = markQuotes;

if (require.main === module) {
  const assert = require("node:assert");
  assert.equal(markQuotes("a <b> & c"), "a &lt;b&gt; &amp; c");
  assert.equal(markQuotes("it “enjoyed remarkable continuity” (2018)"),
    "it “<q class=\"quote-inline\">enjoyed remarkable continuity</q>” (2018)");
  assert.match(markQuotes("the saying “Plus ça change, plus c’est la même chose,” holds"), /<q class="quote-inline" lang="fr">/);
  assert.equal(markQuotes("an unmatched “opening"), "an unmatched “opening");
  console.log("markQuotes ok");
}
