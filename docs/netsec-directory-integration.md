# EISS Anthology ↔ NetSec directory cross-links

This document explains how the EISS Anthology and the NetSec member
directory link to each other, in both directions, and how those links
stay correct as either side grows. It's the companion to
`indico-programme-integration.md` and `publication-matching.md`: another
case of two EISS-family static sites exchanging small, stable JSON
contracts rather than coupling to each other's internals (CLAUDE.md §13).
Tracked in [#966](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/966).

## The problem

Two separate surfaces describe overlapping people:

- The **EISS Anthology** (`/anthology.html`, the by-person view) lists
  every ESSC author — ~490 of them — derived in `corpus.js` from the
  programme data.
- The **NetSec member directory** (`netsec-cost.eu/people/`) holds richer
  per-member profiles (bio, themes, links), one page per member.

Many people appear in both. A reader on one should be able to jump to
the other. But the two systems share **no identifier**: the Anthology
keys people by a normalised name, the directory by its own member `id`.
And NetSec's directory is its own system, which EISS deliberately does
not rebuild (CLAUDE.md, "don't duplicate NetSec-unique systems").

## Principles

1. **Each side owns its data and publishes a thin index; the other side
   consumes it.** EISS never scrapes NetSec's bios, NetSec never scrapes
   the Anthology. Same inversion as `anthology-index.json` (which NetSec
   already consumes for paper links).
2. **The join key is a name key, computed the same way on both sides.**
   There is no shared ID and — importantly — **no ORCID join**: Anthology
   authors carry no ORCID, so it cannot match or disambiguate anything.
   The safety net is the name match plus a reject list.
3. **Link to the published `url`, never reconstruct it.** Each index row
   carries the absolute profile/entry URL, so a URL-scheme change on
   either side doesn't break the join.
4. **Freshness is automatic on both sides.** The Anthology regenerates
   from the Indico sync; the directory index is re-fetched on a schedule.
   Neither link set can silently rot.

## The two contracts

Both are small JSON files published at each site's root, mirror images
of each other.

### NetSec publishes `directory-index.json` (EISS consumes)

`https://netsec-cost.eu/directory-index.json`

```json
{ "generated_at": "…", "count": 37,
  "members": [
    { "name": "Dr Mattia Sguazzini", "name_key": "mattia sguazzini",
      "aliases": [], "slug": "mattia-sguazzini",
      "url": "https://netsec-cost.eu/people/mattia-sguazzini.html",
      "orcid": null,
      "role": "…", "affiliation": "…", "photo": "https://…" } ] }
```

`role` / `affiliation` / `photo` are optional display fields (null when
unset), used to enrich the forward chip into a hovercard (below). The
`name_key` → `url` join is unaffected by them.

### EISS publishes `authors-index.json` (NetSec consumes)

`https://eiss-europa.com/data/authors-index.json` — emitted by
`src/authors-index.njk` from `src/_data/authorsIndex.js`.

```json
{ "generated_at": "…", "source": "https://eiss-europa.com/anthology.html",
  "count": 492,
  "authors": [
    { "name": "Moritz Weiss", "name_key": "moritz weiss", "aliases": [],
      "url": "https://eiss-europa.com/anthology.html?person=moritz-weiss",
      "paper_count": 2 } ] }
```

### The join key: `name_key`

`name_key` is the agreed canonicalisation, produced **identically on
both sides** so the keys meet by construction:

- NFKD-fold and strip diacritics, lowercase.
- Drop a leading honorific (`Dr`, `Prof`, …) and apostrophes.
- Tokenise on any non-letter, drop post-nominals (`PhD`, `Jr`, …) and
  nobiliary particles (`van`, `de`, `von`, …).
- Keep the **first and last token only**. So `Dr John N.T. Helferich` →
  `john helferich`, `Silvia D'Amato` → `silvia damato`,
  `Paul van Hooft` → `paul hooft`.

The authoritative implementation is NetSec's `sync-bios.py::name_key()`.
The EISS side replicates it **verbatim** in `src/_data/authorsIndex.js`
(`nameKey()`); if NetSec ever changes its algorithm, update that
function to match. `aliases` carries extra keys (declared name variants,
maiden names) for fallback matching.

## EISS implementation

### Forward: Anthology author → NetSec profile

The "NetSec profile" link on a by-person entry.

- **Data**: `scripts/sync-netsec-directory.mjs` fetches
  `directory-index.json` and writes the fields EISS uses to
  `src/_data/netsecDirectory.json`. It is **soft-fail**: if the index is
  unreachable (or not published yet) it leaves the last snapshot in place
  and exits 0; a reachable-but-malformed index exits 1.
- **Match**: `corpus.js` folds each member under every key it can be
  reached by — `canonicalKey(member.name)`, NetSec's published
  `name_key`, and each `alias` — into `netsecByKey`, then attaches
  `speaker.netsecUrl` to any author whose `canonicalKey` lands on one of
  those keys. Keying under *both* sides' derivations is deliberate: it
  survives a middle-initial or maiden-name mismatch in either direction.
- **Suppress a wrong match**: add the author's canonical name key to
  `src/_data/netsecDirectoryRejects.json` (`{ "<key>": "reason" }`).
- **Render**: `speakers-index.njk` shows the link (`.speaker-netsec-link`)
  in NetSec's network blue, EN/FR/DE. The literal `#73caff` is too light
  for accessible text on white, so text/border use a readable same-hue
  blue over a soft `#73caff` fill, with a dark-mode override. When the
  member carries `role`/`affiliation`/`photo`, the chip gains a **hovercard**
  (`.speaker-netsec-card`) showing them. The card is `display:none` until
  hover/focus, so the cross-origin photo on `netsec-cost.eu` is **not
  fetched on page load** (it would otherwise leak the visitor's IP to the
  sibling site against the no-third-party-on-first-paint stance); the
  `<img>` also carries `referrerpolicy="no-referrer"`. The card is
  `aria-hidden` — the chip link already carries the accessible name.

### Reverse: NetSec profile → Anthology author

NetSec links a member profile to that person's Anthology entry.

- EISS publishes `authors-index.json` (above). NetSec matches its member
  `name_key` against `authors[].name_key`, then links to `url`.
- The `url` is `/anthology.html?person=<slug>`. For that to resolve for
  **every** author (not just the board-member subset that historically
  had an anchor), `corpus.js` gives each speaker a stable `slug` —
  the existing board slug for board/community members (so their
  pre-existing deep links are unchanged), otherwise a kebab of the
  unique `canonicalKey` (so slugs can't collide) — and
  `speakers-index.njk` emits `id="person-<slug>"` on every entry.
  `speaker-filter.js` already scrolls `?person=<slug>` into view.

## Freshness

- **Anthology side** (author list): no extra job. `corpus.js` is rebuilt
  on every deploy / scheduled rebuild / Indico sync, so both
  `speaker.netsecUrl` and `authors-index.json` recompute automatically.
- **Directory side**: `sync-netsec-directory.yml` re-fetches
  `directory-index.json` weekly and opens an auto-PR if
  `netsecDirectory.json` moved. It also listens for
  `repository_dispatch: netsec-directory-changed` — the fast path NetSec
  can fire on a directory change for a ~1-minute refresh (mirror of the
  `netsec-indico-dispatch` EISS fires the other way). The weekly cron is
  the floor; the dispatch is a latency optimisation, not load-bearing.

## Files at a glance

| Path | Role |
|---|---|
| `src/_data/netsecDirectory.json` | Mirror of NetSec's `directory-index.json` (consumed). |
| `scripts/sync-netsec-directory.mjs` | Fetches + rewrites the mirror. Soft-fail on an unreachable index. |
| `.github/workflows/sync-netsec-directory.yml` | Weekly + `repository_dispatch` re-fetch → auto-PR. |
| `src/_data/netsecDirectoryRejects.json` | `{ "<name key>": "reason" }` to suppress a wrong homonym match. |
| `src/_data/corpus.js` | Builds `netsecByKey`, attaches `speaker.netsecUrl` and `speaker.slug`. |
| `src/_includes/speakers-index.njk` | Renders the "NetSec profile" link + the per-author `id="person-<slug>"` anchor. |
| `src/_data/authorsIndex.js` + `src/authors-index.njk` | Publishes `/data/authors-index.json` (the reverse contract; `nameKey()` replicates NetSec's). |

## Maintenance & troubleshooting

- **A member isn't getting a link though they're an author.** It's a
  name-variant mismatch the `name_key` first+last reduction didn't
  bridge. Add a `name_alias` on the NetSec bio (it flows through
  `aliases`), or as a last resort an entry in `corpus.js`'s `ALIASES`.
- **A wrong person is linked** (two scholars share a name). Add the
  author's key to `netsecDirectoryRejects.json`.
- **The links all disappeared.** The sync probably soft-failed on an
  unreachable `directory-index.json` and an older snapshot has fewer
  members, or the file moved. Check `directory-index.json` is still
  served, then run `node scripts/sync-netsec-directory.mjs`.
- **NetSec changed its `name_key()` algorithm.** Update `nameKey()` in
  `src/_data/authorsIndex.js` to match, or the reverse-direction keys
  stop meeting.
