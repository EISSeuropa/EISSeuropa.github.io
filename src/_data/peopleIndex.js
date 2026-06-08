// Index of known People-page profiles, consumed by
// src/assets/js/people-hovercards.js (emitted to /data/people-index.json by
// src/people-index.njk). It powers the profile hovercard that appears on any
// known person's name wherever it shows up in page prose.
//
// Built from boardSorted (derived from src/_data/board.json), so it stays in
// lockstep with the People page: add or edit a person there and they
// automatically get hovercards everywhere their name appears — no per-page
// work. That is the systematic guarantee. A new page that names a known
// person inherits the behaviour for free.
//
// `detect` is the honorific-stripped "First Last" form prose actually uses
// (middle initials dropped), e.g. "Dr Arthur PB Laudrain" -> "Arthur
// Laudrain". Single-token names and names shared by two people are skipped so
// the client-side matcher stays exact and low-false-positive.

const boardSorted = require("./boardSorted.js")();

// Mirror of the honorific stripping in boardSorted.js / sync-board.py.
const HONORIFIC = /^(?:dr|prof(?:essor)?|pr|mr|mrs|ms|mx|lic|lt\s+gen(?:eral)?|lieutenant\s+general|general|colonel|admiral)\.?\s+/i;

function stripHonorifics(name) {
  let n = String(name || "").trim();
  for (let i = 0; i < 2; i++) {
    const m = n.match(HONORIFIC);
    if (!m) break;
    n = n.slice(m[0].length).trim();
  }
  return n;
}

function detectName(name) {
  const n = stripHonorifics(name);
  const toks = n.split(/\s+/).filter(Boolean);
  if (toks.length < 2) return null; // need First + Last to match safely
  return toks[0] + " " + toks[toks.length - 1];
}

module.exports = function () {
  const sections = [
    boardSorted.leadership,
    boardSorted.boardMembers,
    boardSorted.support,
    boardSorted.pastMembers,
  ];
  const seenSlug = new Set();
  const detectCount = new Map();
  const people = [];

  for (const sec of sections) {
    for (const p of sec || []) {
      const detect = detectName(p.name);
      if (!detect || seenSlug.has(p.slug)) continue;
      seenSlug.add(p.slug);
      detectCount.set(detect, (detectCount.get(detect) || 0) + 1);
      people.push({
        slug: p.slug,
        name: p.name,
        detect,
        role: p.role || "",
        affiliation: [p.position, p.institution].filter(Boolean).join(", "),
        country: p.country || "",
        photo: p.photoOverride || p.photo || "",
        initials: p.initials || "",
        url: "/board.html#" + p.slug,
      });
    }
  }

  // Drop any detect-name held by two people — can't disambiguate from prose.
  return { people: people.filter((p) => detectCount.get(p.detect) === 1) };
};
