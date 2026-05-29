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

// Heuristic threshold for "this bio is long enough to need a
// Read-more toggle". The actual visual truncation is done by CSS
// line-clamp (3 lines), not by character count — but we need a
// build-time signal to decide whether to render the toggle button
// at all, so short bios don't get a pointless "Read more" they
// can't expand into anything new.
const BIO_LONG_THRESHOLD = 180;

// Time-bound roles (interns, visiting fellows, fixed-term contracts)
// carry a `roleEndDate` (ISO `YYYY-MM-DD`). We hide a person from the
// active sections one week after that date — the grace period keeps
// the card visible for ~7 days past departure so anyone bookmarking
// the page just after the end date still finds them. Entries without
// `roleEndDate` are permanent and never filtered.
//
// Past entries move to `pastMembers` so the template can render them
// as a folded "Past board members and interns" footer — they remain
// part of the broader European security studies family, just not the
// active team.
const GRACE_PERIOD_DAYS = 7;
function isExpired(person, todayMs) {
  if (!person) return false;
  // Explicit former-member flag: a person who has left but whose exact
  // departure date isn't recorded (e.g. former board members migrated
  // from an older roster). They move to the community section without a
  // "· YYYY" suffix, since boardSorted only derives `activeYear` from a
  // real `roleEndDate`.
  if (person.formerMember === true) return true;
  if (!person.roleEndDate) return false;
  // Treat the end-date as end-of-day UTC so a same-day check returns
  // false (the person is still active on their last day).
  const endMs = Date.parse(person.roleEndDate + "T23:59:59Z");
  if (Number.isNaN(endMs)) return false; // malformed → never expire
  const cutoffMs = endMs + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  return todayMs > cutoffMs;
}

module.exports = function () {
  const esscNames = collectEsscNames();
  const tierByRole = buildTierMap();
  const todayMs = Date.now();

  // Two-letter initials derived from the person's full name, used by
  // person-card.njk to render a placeholder when they haven't uploaded
  // a photo (the Form's headshot question is optional). Strips
  // honorifics via the same regex as identityKey() so "Ms. Angela
  // Sajewicz" → "AS", not "MS". Falls back to "?" if a name is
  // somehow empty after stripping.
  function computeInitials(name) {
    if (!name) return "?";
    let n = String(name).trim();
    for (let i = 0; i < 2; i++) {
      const m = n.match(HONORIFIC_RE);
      if (!m) break;
      n = n.slice(m[0].length).trim();
    }
    const tokens = n.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return "?";
    if (tokens.length === 1) return tokens[0].charAt(0).toUpperCase();
    return (tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)).toUpperCase();
  }

  function annotate(person) {
    const bio = (person.bio || "").trim();
    return {
      ...person,
      tier: tierByRole[person.role] ?? 999,
      isEsscActive: esscNames.has(identityKey(person.name)),
      bioIsLong: bio.length > BIO_LONG_THRESHOLD,
      initials: computeInitials(person.name),
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

  // Annotate everyone (board members + support), then split into
  // active vs. past based on `roleEndDate` + 7-day grace.
  const allMembersAnnotated = (board.members || []).map(annotate);
  const allSupportAnnotated = (board.support || []).map(annotate);

  const activeMembers = allMembersAnnotated.filter((m) => !isExpired(m, todayMs));
  const activeSupport = allSupportAnnotated.filter((m) => !isExpired(m, todayMs));

  const leadership = sortMembers(activeMembers.filter((m) => m.tier < 100));
  const boardMembers = sortMembers(activeMembers.filter((m) => m.tier >= 100));
  const support = activeSupport; // ordering preserved

  // Past members: union of expired entries from both sources, sorted
  // by surname for the community section. Tier is preserved so the
  // template can show their last role. `activeYear` is the year of
  // the entry's roleEndDate — per spec, when an internship spans
  // two calendar years, this picks the most recent one. Only set
  // on past members (the field is template-conditional, so active
  // entries don't get a misleading "until YYYY" badge).
  const pastMembers = [...allMembersAnnotated, ...allSupportAnnotated]
    .filter((m) => isExpired(m, todayMs))
    .map((m) => ({
      ...m,
      activeYear: m.roleEndDate ? m.roleEndDate.slice(0, 4) : null,
    }))
    // Sort most-recent-end-date first, then by surname within a tie.
    // The community section reads better when 2026's interns appear
    // above 2023's — newcomers see "who left recently" first.
    // ISO YYYY-MM-DD strings sort lexicographically = chronologically,
    // so localeCompare(b, a) gives descending date order.
    .sort((a, b) => {
      const dateA = a.roleEndDate || "";
      const dateB = b.roleEndDate || "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return bySurname(a, b);
    });

  // Exposed for the page footer link ("Update your bio"). Sourced
  // from scripts/board-source.json so the URL stays in sync with the
  // Form configuration the sync workflow uses.
  const formUrl = (boardSource.form_url || "").trim();

  // Distinct countries across the whole active team, alphabetised.
  // Each entry includes the iso code so the /initiative page's flag
  // strip can render them without re-doing the countryFlags lookup at
  // template time. Skips empty country fields. Past members are
  // excluded so the stats row reflects only the active team.
  const countryFlags = require("./countryFlags.js");
  const seen = new Set();
  const countries = [];
  for (const p of [...activeMembers, ...activeSupport]) {
    if (!p.country) continue;
    const key = p.country.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const iso = countryFlags.byName[key] || null;
    countries.push({ name: p.country, iso });
  }
  countries.sort((a, b) => a.name.localeCompare(b.name));

  // Top-line counts the /initiative page uses in the stats row.
  // peopleTotal includes everyone *active* (board + support);
  // countriesTotal is the distinct count above. Past members are not
  // counted — the "N people across M countries" headline reflects the
  // present team, not the cumulative roster.
  const counts = {
    peopleTotal: leadership.length + boardMembers.length + support.length,
    countriesTotal: countries.length,
    leadershipTotal: leadership.length,
    pastTotal: pastMembers.length,
  };

  return {
    leadership,
    boardMembers,
    support,
    pastMembers,
    formUrl,
    countries,
    counts,
  };
};
