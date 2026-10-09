// Guess the language of a publication title for its lang attribute (RGAA 8.8).
// ORCID's language-code is empty on most works, so the guess comes from the
// short function words each language cannot avoid.
// ponytail: stopword vote, fine for titles in en/fr/it/de/es; a title mixing
// languages or quoting another one gets the majority vote.
const WORDS = {
  en: "the of and in on for to a an with from by is at as its into between",
  fr: "le la les des du de et un une au aux en pour sur dans par l d qu est ou entre après",
  it: "il lo la gli le dei degli delle del della di e un una nell nella dell per sul con tra nel alla",
  de: "der die das und den dem des ein eine im zur zum für mit von auf ist zwischen",
  es: "el los las del y un una en para por con entre sobre",
};
const SETS = Object.fromEntries(Object.entries(WORDS).map(([k, v]) => [k, new Set(v.split(" "))]));

module.exports = function titleLang(title) {
  const tokens = String(title || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  let best = "en", bestScore = 0;
  const score = {};
  for (const [lang, set] of Object.entries(SETS)) {
    score[lang] = tokens.filter((t) => set.has(t)).length;
    if (score[lang] > bestScore) { best = lang; bestScore = score[lang]; }
  }
  // Two hits and a clear lead over English before calling a title foreign.
  return best !== "en" && bestScore >= 2 && bestScore > score.en ? best : "en";
};
