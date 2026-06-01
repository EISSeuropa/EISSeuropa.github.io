// Flattens board.json (members + support) into one record per person
// per locale, consumed by src/search-bios.njk to emit lightweight
// Pagefind index stubs at /search/bios/<lang>/<slug>.html. Each stub is
// noindex (search engines skip it) but Pagefind indexes its body, so a
// name/affiliation/theme query returns the individual person rather than
// the whole /board page. The stub redirects to the canonical board
// anchor (/board[.lang].html#<slug>), whose id is rendered by
// person-card.njk from the same slug (boardSorted.js).
//
// The slugify here is deliberately identical to the one in
// boardSorted.js — keep the two in sync so the stub's canonical anchor
// always matches the rendered card id.
const board = require("./board.json");

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LOCALES = [
  { lang: "en", board: "/board.html" },
  { lang: "fr", board: "/board.fr.html" },
  { lang: "de", board: "/board.de.html" },
];

module.exports = function () {
  const people = [...(board.members || []), ...(board.support || [])].filter(
    (p) => p && p.name
  );
  const out = [];
  for (const loc of LOCALES) {
    for (const p of people) {
      const slug = p.slug || slugify(p.name);
      out.push({
        lang: loc.lang,
        slug,
        name: p.name,
        role: p.role || "",
        functionalResponsibility: p.functionalResponsibility || "",
        photo: p.photoOverride || p.photo || "",
        position: p.position || "",
        institution: p.institution || "",
        country: p.country || "",
        themes: p.themes || "",
        canonical: loc.board + "#" + slug,
      });
    }
  }
  return out;
};
