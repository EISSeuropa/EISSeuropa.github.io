// The seventeen theme views, once per locale (#1495).
//
// atlasThemePages is the corpus-derived list of themes. The Atlas is
// published in English, French and German, so each theme needs a page per
// locale: same data, different language, its own URL and alternates. Doing it
// here rather than in three templates keeps one pagination source, so a new
// theme appears in all three languages at once.
const atlasThemePages = require("./atlasThemePages.js");

const LOCALES = ["en", "fr", "de"];

module.exports = function () {
  const themes = typeof atlasThemePages === "function" ? atlasThemePages() : atlasThemePages;
  const out = [];
  for (const lang of LOCALES) {
    for (const theme of themes) {
      out.push(Object.assign({}, theme, {
        lang,
        // English keeps the bare path it has always had, so no URL moves.
        suffix: lang === "en" ? "" : "." + lang,
      }));
    }
  }
  return out;
};
