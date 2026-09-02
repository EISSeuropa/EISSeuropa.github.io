// The six fetch targets behind the Anthology's second view (#1641): the
// by-person and by-paper panels across the three locales. anthology-
// fragment.njk paginates over this, and archive.js builds the same URL from
// the panel name and the page's own lang attribute.
const LANGS = ["en", "fr", "de"];
const VIEWS = ["people", "papers"];

const canonical = (lang) =>
  lang === "en" ? "/anthology.html" : `/anthology.${lang}.html`;

module.exports = () =>
  LANGS.flatMap((lang) =>
    VIEWS.map((view) => ({ lang, view, canonical: canonical(lang) }))
  );
