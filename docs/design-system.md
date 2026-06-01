# Design system — components & interactions

A reference for the reusable UI on the EISS site: the `src/_includes/`
partials, their key CSS classes (all in the single `src/assets/css/site.css`),
and the JavaScript interactions (`src/assets/js/theme.js`, plus the
self-contained `search.js`). Not exhaustive styling docs — a map so you
know what exists and where to look before building something new.

> **Before adding a component:** grep that every class your markup
> references is actually defined in `site.css`. Markup shipping with
> undefined classes is the failure that left the search modal and press
> kit invisible (CLAUDE.md §14). Render it in the preview at desktop
> **and** phone width.

## Chrome (every page, via `base.njk`)

- **`nav.njk`** — primary nav. Items come from `site.js` `nav[]`; labels
  resolve from `t.nav[key]`. Collapses behind `.menu-toggle` (hamburger)
  on mobile. Carries the theme toggle, language switcher, and search
  trigger (`[data-search-trigger]`).
- **`footer.njk`** — co-branding, funding-style credit, legal-links row
  (terms / privacy / accessibility / sitemap / licensing / roadmap /
  press kit), socials. `data-pagefind-ignore`.
- **`theme-toggle.njk`** + theme.js — light/dark, persisted in
  `localStorage`; honours `prefers-color-scheme` on first visit.
- **`beta-ribbon.njk`** (FR/DE pages) / **`archive-ribbon.njk`**
  (`status: archive` pages) — the two disclaimer ribbons. Archive ribbon
  is hardcoded EN (archive pages are EN-only).
- **Sticky chrome + scroll-padding**: theme.js measures the chrome's
  real height and publishes `scroll-padding-top` so in-page `#anchors`
  don't land under it. Scroll-driven hero shrink on `/index` / `/2026`.

## Conference & programme

- **`programme-grid.njk`** — the live ESSC grid from `indico.json`
  (time-gutter day grid, parallel panels side by side, expandable paper
  lists, presenter marked with a mic, livestream pills). Classes:
  `.programme`, `.programme-day`, `.programme-*`.
- **`archive-programme.njk`** — past programmes in the **same** `.programme-*`
  markup, keyed by `archiveSlug` into `archiveProgrammes.js`. Used by
  every `/YYYY` archive page + `/Ukraine` + `/JPW2019` + `/joint-2024`.
- **`registration-badge.njk`** — status pill (`upcoming` / `registration-closed`
  / `happening-now` / `past`) computed from `conferences.js` dates +
  `registrationStatus`. On `/2026` and the homepage featured card.
- **`countdown.njk`** — "N days until ESSC" pill; rendered at build
  (`daysUntil`) and recomputed live in theme.js.
- **`conference-media.njk`** — data-driven "Session recordings" block;
  reads `youtubePlaylist` from `conferences.js`, renders the lazy
  `youtube-embed.njk`. Renders nothing without a playlist.
- **`joint-orgs.njk`**, **`speaking-chairing.njk`**, **`livestream-list.njk`**,
  **`programme-pdf.njk`** — the `/2026` supporting strips.

## People

- **`person-card.njk`** — shared board/support card. `id="{{ slug }}"`
  (deep-linkable; slug from `boardSorted.js`), photo or initials
  placeholder, role + optional functional-responsibility pill + ESSC-mic,
  affiliation, Read-more bio, themes, social-icon row. `.person`, `.person-*`.
- **`netsec-leaders.njk`** — EISS people in NetSec roles, on `/initiative`.

## Media

- **`film-embed.njk`** + theme.js film IIFE — portrait conference film in
  a phone-style frame (`.film`, `.film-frame` 9:16). Self-hosted MP4
  (same-origin `/assets/video/`, so iOS gets `video/mp4` and plays
  inline). Muted autoplay on scroll-into-view via IntersectionObserver;
  centre play button (`.film-play`) appears if autoplay is blocked; sound
  toggle; "tap for sound" hint. `prefers-reduced-motion` → native controls.
- **`youtube-embed.njk`** — lazy, cookieless (`youtube-nocookie.com`)
  player; loads the iframe only on click.
- **`.photo-gallery`** — uniform 3:2 `object-fit: cover` grid for
  conference photos (fixes ragged mixed-dimension crops).
- **`map-embed.njk`** — address card + OpenStreetMap link (no Google
  Maps iframe, for privacy).

## Search

- **`search-modal.njk`** + `search.js` — Pagefind modal. `.search-overlay`
  (the `[hidden]` guard is essential so `display:flex` doesn't defeat the
  native `hidden`), `.search-dialog` (full-screen sheet on phones),
  `.search-results` listbox, highlighted `<mark>` excerpts. Opens via the
  header trigger, Cmd/Ctrl-K, or `/`. Degrades to an "unavailable" notice
  when the index is absent (local dev). See [search.md](search.md).

## Misc

- **`press-kit.njk`** + `.press-*` — logo grid, colour swatches,
  typography sample, do/don't columns, copy-to-clipboard attribution.
- **`roadmap-timeline.njk`** + `roadmap-progress.js` — `/roadmap` cards
  with live progress bars from `data/roadmap-progress.json`.
- **`announcement-card.njk`**, **`indico-events-list.njk`**,
  **`notfound-illustration.njk`** (the 404 broken-stars SVG),
  **`europe-outline.njk`**, **`redirect-body.njk`**.
- **`icons.njk`** — inline-SVG Lucide icon set via the `icon()` macro.

## Interaction inventory (theme.js)

Theme toggle · scroll-padding sync · scroll-driven hero/header shrink ·
countdown live recompute · film lazy-load + autoplay/pause + sound +
play-overlay · What's-New banner · mobile menu toggle. Search is in its
own `search.js`. Verify interactions with `preview_eval` computed reads,
not screenshots (CLAUDE.md §14).
