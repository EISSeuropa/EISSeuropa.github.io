// Pagination source for the per-person profile pages (#756 phase 2).
// Flattens every board / community member (with a slug) from boardSorted and
// crosses them with the three locales, so board-profile.njk can paginate one
// page per (person, locale): /board/<slug>.html, /board/<slug>.fr.html,
// /board/<slug>.de.html. The People grid stays the overview; each card links
// here. Profile content (bio, name, publications) is the member's own and
// renders in its original language on every locale; only the chrome is
// translated, so per-page hreflang alternates are deferred (the locale pages
// share identical content). The board grid is the canonical entry point.
const boardSorted = require("./boardSorted.js")();

const LOCALES = [
  { lang: "en", suffix: "" },
  { lang: "fr", suffix: ".fr" },
  { lang: "de", suffix: ".de" },
];

module.exports = function () {
  const seen = new Set();
  const people = [];
  // pastMembers carry `isFormer` so the profile page can label the role
  // "Former Board Member" rather than the raw, still-current-sounding role.
  // Active sections are pushed first, so a person is only ever tagged from
  // the section they actually belong to (the `seen` set dedups).
  for (const { section, isFormer } of [
    { section: boardSorted.leadership },
    { section: boardSorted.boardMembers },
    { section: boardSorted.support },
    { section: boardSorted.pastMembers, isFormer: true },
  ]) {
    for (const p of section || []) {
      if (!p.slug || seen.has(p.slug)) continue;
      seen.add(p.slug);
      people.push(isFormer ? { ...p, isFormer: true } : p);
    }
  }

  const pages = [];
  for (const person of people) {
    for (const L of LOCALES) {
      pages.push({ slug: person.slug, lang: L.lang, suffix: L.suffix, person });
    }
  }
  return pages;
};
