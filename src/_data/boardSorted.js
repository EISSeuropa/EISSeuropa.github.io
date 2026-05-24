// Computed view over board.json + the Form-pipeline roles table +
// indico.json. Produces three arrays the template iterates over:
//
//   - leadership   — tier < 100 (Founding Director / Treasurer /
//                    Secretary-General; plus any future named officer
//                    roles, since they live in board-source.json with
//                    explicit tiers)
//   - boardMembers — tier ≥ 100 (the rank-and-file "Board Member"
//                    entries plus any future low-tier roles)
//   - support      — the existing src/_data/board.json `support` list,
//                    unchanged in ordering but annotated like the
//                    board entries
//
// Each entry also carries an `isEsscActive` boolean, true when the
// person's name (after stripping titles like Dr / Prof / Mr / Ms)
// matches anyone in the current ESSC programme as a chair, discussant,
// or speaker. The template renders a small star next to those.
//
// This module owns the augmentation; board.json itself stays the raw
// Form-pipeline contract so `scripts/sync-board.py` can overwrite it
// without thinking about display concerns. Same for board-source.json
// (roles table) and indico.json (Indico sync).

const board = require("./board.json");
const indico = require("./indico.json");
const boardSource = require("../../scripts/board-source.json");

// Reduce a name to a "first-token + last-token" identity key.
// Board.json stores full forms ("Dr Arthur PB Laudrain") with titles
// and middle initials; Indico exports shorter forms ("Arthur Laudrain")
// without either. Mapping both sides to first-and-last collapses the
// difference so "Arthur Laudrain" matches "Dr Arthur PB Laudrain".
//
// Edge cases this doesn't handle:
//   - Multi-word surnames ("van der Waals" → "van waals"). Rare in
//     the EISS board; trade-off for the simpler keying.
//   - Honorifics that aren't comma-separated and the rest of the
//     world's titles. The honorific-stripping regex covers Dr, Prof,
//     Mr/Ms/Mrs/Mx, and the military ranks that have shown up in
//     ESSC programmes (Lt Gen, General, Colonel, Admiral).
const HONORIFIC_RE = /^(?:dr|prof(?:essor)?|mr|ms|mrs|mx|lt\s+gen(?:eral)?|lieutenant\s+general|general|colonel|admiral)\.?\s+/i;
function identityKey(name) {
  if (!name) return "";
  let n = String(name).trim();
  // Strip up to two leading honorifics (rank + Dr).
  for (let i = 0; i < 2; i++) {
    const m = n.match(HONORIFIC_RE);
    if (!m) break;
    n = n.slice(m[0].length).trim();
  }
  const tokens = n.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "";
  if (tokens.length === 1) return tokens[0];
  return tokens[0] + " " + tokens[tokens.length - 1];
}

// Walk every programme slot in every annual conference, collecting
// names of people who are convening (chairing), discussing, or
// speaking (any contribution speaker). The user explicitly asked for
// chairs + discussants + panelists / speakers without distinction.
function collectEsscNames() {
  const names = new Set();
  const annual = (indico && indico.annualConferences) || {};
  for (const year of Object.keys(annual)) {
    const conf = annual[year];
    const days = (conf && conf.programme && conf.programme.days) || [];
    for (const day of days) {
      for (const row of day.rows || []) {
        for (const slot of row.items || []) {
          for (const c of slot.conveners || []) names.add(identityKey(c.name));
          for (const d of slot.discussants || []) names.add(identityKey(d.name));
          for (const c of slot.contributions || []) {
            for (const sp of c.speakers || []) names.add(identityKey(sp.name));
          }
          // Standalone contributions at the slot level (no parent
          // session) carry speakers directly on the slot.
          for (const sp of slot.speakers || []) names.add(identityKey(sp.name));
        }
      }
    }
  }
  names.delete(""); // never positive-match the empty string
  return names;
}

// Build a role → tier lookup. Roles not in board-source.json fall to a
// large default so unknown roles sort to the bottom of the board grid
// rather than the leadership row.
function buildTierMap() {
  const map = {};
  for (const r of boardSource.roles || []) {
    if (r && r.label) map[r.label] = r.tier ?? 999;
  }
  return map;
}

module.exports = function () {
  const esscNames = collectEsscNames();
  const tierByRole = buildTierMap();

  function annotate(person) {
    return {
      ...person,
      tier: tierByRole[person.role] ?? 999,
      isEsscActive: esscNames.has(identityKey(person.name)),
    };
  }

  // Stable sort within each section: tier ascending, then surname-
  // alphabetical (split on last space, fall back to full name).
  function bySurname(a, b) {
    const sa = (a.name || "").trim().split(/\s+/).pop() || "";
    const sb = (b.name || "").trim().split(/\s+/).pop() || "";
    return sa.localeCompare(sb);
  }
  function sortMembers(arr) {
    return arr.slice().sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return bySurname(a, b);
    });
  }

  const annotated = (board.members || []).map(annotate);
  const leadership = sortMembers(annotated.filter((m) => m.tier < 100));
  const boardMembers = sortMembers(annotated.filter((m) => m.tier >= 100));
  const support = (board.support || []).map(annotate); // ordering preserved

  return { leadership, boardMembers, support };
};
