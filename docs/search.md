# Site search (Pagefind)

How the site-wide search works, and why it looks "broken" locally.

## Architecture

- **UI**: the header search button (`[data-search-trigger]`) and the
  shortcuts Cmd/Ctrl-K and `/` open the modal in
  `src/_includes/search-modal.njk`. Behaviour + result rendering live in
  `src/assets/js/search.js`; styling is in `site.css` under
  `/* site search modal */`.
- **Index**: [Pagefind](https://pagefind.app). The index
  (`/pagefind/pagefind.js` + wasm shards) is generated **at deploy
  time** by `npx pagefind --site _site` in
  `.github/workflows/deploy.yml`, after the Eleventy build. It is **not**
  committed and is **not** produced by the local `eleventy` build.
- **Scope**: site chrome carries `data-pagefind-ignore` (the
  sticky-chrome in `base.njk`, the footer, the search modal), so only
  `<main>` content is indexed.

## Why local search shows "unavailable"

`search.js` lazy-imports `/pagefind/pagefind.js` on first open. That file
only exists on the deployed site, so on a local `eleventy --serve` the
import fails and the modal shows the "available on the published site"
notice instead of erroring. **This is expected.** The modal chrome,
keyboard shortcuts, and open/close still work locally for layout checks;
only results need the deployed index.

## Per-person search (bio stubs)

`/board` is one page, so indexing it whole means a name search returns
the board page, not the person. To make individual people searchable
(NetSec parity), `src/_data/searchBios.js` flattens `board.json`
(members + support) into one record per person per locale, and
`src/search-bios.njk` emits a minimal stub at
`/search/bios/<lang>/<slug>.html` for each. Pagefind indexes the stub's
body (name, role, affiliation, themes); the stub is `noindex` for search
engines and redirects a human click to the canonical board anchor
`/board[.lang].html#<slug>`. The anchor id is rendered by
`person-card.njk` from the same slug (`boardSorted.js`), so the two
always line up — keep the two `slugify` copies identical.

Stubs are `eleventyExcludeFromCollections`, so they never reach
`sitemap.xml` or the visual sitemap.

## Verifying after deploy (issue #359)

The bio-stub indexing can only be confirmed on the deployed site (the
index isn't built locally). After a deploy, check on
<https://eiss-europa.com>:

1. Searching a board member's name (e.g. "Hugo Meijer") returns that
   person as a top result, and clicking it lands on their card on
   `/board`.
2. Searching a research theme (e.g. "deterrence") surfaces the relevant
   people.
3. The same holds on the FR and DE sites (the per-locale stubs).

If results don't appear, confirm the deploy ran `pagefind --site _site`
after the build and that `/search/bios/` is present in the published
output.
