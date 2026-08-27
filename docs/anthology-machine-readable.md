# The Anthology's machine-readable surfaces

Everything the corpus emits for something other than a human reading a page:
citation files, pre-filtered Atlas pages with their own share cards, and Atom
feeds. Three features that shipped together and share one property worth stating
up front: **each fails silently.** A malformed `.bib` fails in a reader's LaTeX
compile weeks later, a wrong `<link rel="alternate">` sends a subscriber to
another theme's feed, and a page missing from the sitemap is simply never
crawled. None of them fails the build. So each has its own CI gate, and this
doc says what those gates protect.

Companion to [`publication-matching.md`](publication-matching.md) (where the
published-version data comes from) and
[`corpus-archiving.md`](corpus-archiving.md) (depositing the corpus outside the
repo). Tracked in
[#1254](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1254),
[#1255](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1255) and
[#1256](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1256).

---

## 1. Citation exports

### What a reader gets

| Surface | URL | Needs JavaScript |
|---|---|---|
| Cite block on a paper page | `/papers/<slug>.html` | No (copy button does) |
| BibTeX file | `/papers/<slug>.bib` | No |
| RIS file | `/papers/<slug>.ris` | No |
| Bulk export of a filtered set | control on `/anthology.html?view=papers` | Yes |

The per-paper files are the no-JavaScript path. The bulk control is the only
part that needs scripting, and it degrades to those files.

### One builder, four callers

`src/_data/citations.js` builds every citation string. It exports
`toBibtex`, `toRis`, `confName` and `bySlug`, and is consumed by:

- `paperPages.js` — the cite block on each paper page
- `paper-bib.njk` / `paper-ris.njk` — the sibling files
- `citationsBySlug.js` → `citations-json.njk` — `/data/citations.json`, the bulk source

**Do not add a second builder.** The builders lived inside `paperPages.js`
until #1254 and were therefore reachable only for the 315 papers that have a
landing page, so a bulk export built on them silently dropped the other 196.
They cover all 511 now.

### Published version vs presentation

When a paper has a confirmed publication, the citation describes the
**published work**, not the conference presentation. #1254 proposed the
opposite and the maintainer kept this behaviour: a reader citing a paper that
reached a journal is expected to cite the journal. The reasoning is repeated in
`citations.js` so it is not re-litigated by whoever reads that file next.

### Escaping, and the order it happens in

BibTeX values are LaTeX source. Two passes, and the order matters:

1. **Escape** `\ & % $ # _ { } ~ ^`. A raw `&` in a title breaks the reader's compile.
2. **Brace-protect** acronyms (`NATO` → `{NATO}`). Without this, any
   title-casing style renders it "nato". 64 titles in the corpus need it.

Escaping first is required, because it emits backslash sequences that the
acronym pass then cannot match. Reversing them corrupts both.

**`doi` and `url` stay verbatim.** A BibTeX `doi` field is not LaTeX-escaped by
convention and Crossref's own exports leave underscores raw, so escaping
`10.1007/978-3-319-54118-1_18` would break resolution. `check-citations.mjs`
skips those two fields deliberately, not by oversight.

### The conference name

`confName()` decides the `booktitle`, the RIS container and the
`citation_conference_title` meta tag from one place. The rule:

- `EISS` or `ESSC` label → `European Security Studies Conference <year>`
- anything else → the edition's own label (the three joint events)

The annual conference keeps one name across its whole history because the event
is continuous and 421 citations already carry it. Before #1254 the name was
hardcoded, so 20 joint-event papers were telling Google Scholar and every
reference manager they had been presented at the annual conference.

### Zotero

**No custom translator is needed and none should be written.** The paper pages
emit `citation_title`, `citation_author`, `citation_publication_date`,
`citation_conference_title` and `citation_doi`, which is exactly the set
Zotero's built-in *Embedded Metadata* translator reads.
`citation_conference_title` is what makes it classify the item as a conference
paper rather than a web page.

### Gate

```bash
node scripts/check-citations.mjs
```

Asserts brace balance, escaping, RIS well-formedness and acronym protection
across all 511 papers. Runs in `sanity-check.yml`.

---

## 2. Per-theme Atlas pages

`/anthology-atlas/theme/<slug>.html`, one per research theme (17).

### Why they exist

A query string cannot carry Open Graph tags. Crawlers do not run JavaScript and
do not distinguish `?themes=Deterrence` from the bare Atlas URL, so every shared
filtered view produced the same generic card. Real URLs are the only shape that
works.

### How the pre-filter works

The page sets `data-atlas-theme="<theme name>"` on `.atlas-shell`.
`anthology-atlas.js` reads it inside `applyUrlState()`, **before the chips
render**, so the map arrives filtered rather than flashing the whole corpus.
A `?themes=` param still wins, so a link shared off a theme page with extra
filtering behaves as the sharer left it.

### One body, eighteen pages

`src/_includes/atlas-body.njk` is the map. Both `anthology-atlas-page.njk` (the
canonical page) and `atlas-theme.njk` (the 17) include it. The `atlasTheme`
variable is what switches it into pre-filtered mode: it changes the H1, the
lede, the back link and adds the feed control. Do not fork it.

### Themes only, not editions

#1255 originally proposed 29 pages (17 themes + 12 editions) and flagged the
cost. Editions were dropped: theme views are what people share, and the
per-year conference pages already serve editions.

### Share cards

Generated by `scripts/make-share-cards.py`, which pulls the theme list from
`src/_data/atlasThemePages.js` **via node** rather than a retyped Python list,
so a new theme yields a page and a card from one source.

```bash
# all 17 themes, in all three languages
node -e "require('./src/_data/atlasThemePages.js')().forEach(t=>console.log('atlas-theme-'+t.slug))" \
  | xargs python3 scripts/make-share-cards.py
```

Since #1495 the Atlas is published in English, French and German, so each
theme yields **three** cards, not one. The labels and the figures come from
the same catalogs the pages read (`i18n.js` → `atlas`, and the per-theme
labels on `atlasThemePages`), so a card cannot say something its page does
not. `base.njk` rewrites `-meta.jpg` to `-meta.<lang>.jpg` on a non-English
page **without checking the file exists**, which is how 36 pages once
advertised cards that had never been generated (#1546); `check-build-sanity.mjs`
now fails the build on that, so a missing locale is loud rather than silent.

### The Atlas card is the map

The card for `/anthology-atlas.html` is not the house template. It is the map
itself, which is what makes it worth sharing, and it used to be a screenshot
of the running page composed by hand (#1156). A screenshot cannot be
translated, and the hub labels are the reader's language now, so all three are
**drawn from the corpus at build time** (#1545):

```bash
python3 scripts/make-share-cards.py anthology-atlas
```

`scripts/atlas_map_card.py` redraws the map using the browser's own layout:
the same `mulberry32` seed, the same ring of hubs, the same attraction,
repulsion, damping and clamping, the same theme wheel, and the same 320 ticks
`anthology-atlas.js` runs on load. It emits SVG, which `make-share-cards.py`
rasterises through the same qlmanage pipeline as every other card, so no
dependency joins the build (rule §16.3).

Run it when the corpus changes visibly, e.g. after a new edition lands. It
regenerates English as well as French and German: the card is no longer a
manual step that goes stale on its own.

> **Two things to know before editing it.** The drawing applies a `0.9` scale
> about the centre, because the ring of hubs reaches the edges of the box the
> simulation settles in and the labels would sit half off the card;
> simulating in a smaller box instead changes the spacing the forces settle
> into. And the output is not pixel-identical to any given moment of the live
> map, because the live one keeps simulating while you watch it. It is the
> same corpus under the same rules, which is what the card claims to show.

If the layout in `anthology-atlas.js` changes — the seed, the ring geometry,
the force constants, the tick count — the card drifts from the page until
`atlas_map_card.py` is changed to match. The two are deliberately parallel
implementations rather than one shared module, because the page draws to a
canvas in a browser and the card draws to SVG in a build script.

They use `anthology-mark.svg`, not the EISS wordmark, because a mark that is
itself a network map says what the page is without words.

> **Gotcha.** That mark paints its hub with `fill="currentColor"` so one asset
> recolours per surface. A card SVG has nothing to inherit from, so the hub
> renders **grey** unless `build_motif()` pins `color`. If a regenerated card
> shows a grey centre node, that is this.

### Sitemap and search: opposite answers, both deliberate

- **In the sitemap.** The point is crawler visibility.
- **Out of site search** (`data-pagefind-ignore`), or 17 near-identical bodies
  flood the results.

> **Gotcha, and it is a trap for any paginated template.** Eleventy's
> `pagination.addAllPagesToCollections` defaults to **`false`**, so only a
> paginated template's *first* page reaches `collections.all` — which is exactly
> what `sitemap.xml.njk` walks. Sixteen of the seventeen theme pages would have
> been silently absent. `atlas-theme.njk` opts in explicitly.
>
> The same default hid **314 of the 315 paper pages** from the sitemap until
> [#1293](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1293).
> `.bib` and `.ris` must stay out, and do, via `eleventyExcludeFromCollections`.

### The two sitemaps are different surfaces

Worth stating, because conflating them leads to the wrong fix:

| | `/sitemap.xml` | `/sitemap.html` |
|---|---|---|
| Audience | Crawlers | People |
| Built from | `collections.all` | **Hand-written**, `src/sitemap.njk` (+ FR + DE) |
| Anthology coverage | all 315 paper pages | one line for the whole corpus |

`/sitemap.html` is deliberately NOT generated from the same list. 315 paper URLs
are what a crawler wants and the last thing a reader wants. Adding papers to the
XML does not touch it, and it should stay that way.

`<lastmod>` covers all 418 URLs, from two sources (#620):

| Pages | Source | Why |
|---|---|---|
| The 315 paper pages | `corpusLedger.json` via `src/_data/sitemapDates.js` | Records when the paper or its abstract actually landed |
| Everything else | Last git commit of the source file, via the `gitLastmod` filter | The only honest date a template has |

The ledger wins where it exists, because a git date would track edits to the
data module that happens to contain a paper rather than the paper itself.

> **The shallow-clone trap, and why the feature can silently do nothing.**
> `git log` in a depth-1 checkout reports the checkout commit for *every* file,
> so all 418 pages would claim to have changed today, on every build. That is
> worse than no `lastmod`: it teaches crawlers to ignore the signal. The filter
> calls `git rev-parse --is-shallow-repository` and returns `""` when shallow,
> so the element is omitted rather than faked. `deploy.yml`'s checkout sets
> `fetch-depth: 0` to make the real dates available; other workflows do not need
> it and legitimately produce a dateless sitemap.
>
> `check-build-sanity.mjs` asserts the dates are not all identical, which is the
> shape this mistake takes.

`board-profile.njk` (138 pages) hits the same pagination default and is
deliberately still out, pending a decision on whether every historical and
per-locale profile variant belongs in a sitemap.

`scripts/check-build-sanity.mjs` now asserts the paper-page count on disk equals
the count in the built sitemap, since this class of failure is invisible.

---

## 3. Per-theme Atom feeds

`/feeds/themes/<slug>.xml`, one per theme, capped at 50 entries.

### The entry date, and why it needed a new file

The corpus carries a `year`, not a date, and had no record of when anything was
added. #1256 weighed three options and took a tracked added-date, because
*"an abstract you were waiting for is now on file"* is the notification with
real value and a conference date cannot express it.

`src/_data/corpusLedger.json` holds two dates per paper:

| Field | Meaning |
|---|---|
| `firstSeen` | the day the paper entered the corpus |
| `abstractSeen` | the day an abstract first attached, if one has |

A feed entry takes the **later** of the two, which is what makes a recovered
abstract surface as fresh years after its conference. Entries whose date came
from `abstractSeen` are prefixed *"Abstract now on file."*

> **The ledger is committed and authoritative.** It is the only record of these
> dates. Never regenerate it from scratch: every subscriber would get a burst of
> false updates. `sync-corpus-ledger.mjs` only ever *adds*, and existing entries
> keep their dates.

The initial backfill dated papers to their edition's start date, not to the day
the script first ran, so the feeds read as a plausible history rather than 511
items dated the same afternoon.

### Maintaining it

```bash
node scripts/sync-corpus-ledger.mjs           # add new papers / newly attached abstracts
node scripts/sync-corpus-ledger.mjs --check   # CI: report drift, change nothing
```

Run it after any sync that adds papers or abstracts, and commit the result.

### `<updated>` never comes from the build

This repo has a scheduled rebuild workflow. A build-time `<updated>` would tell
every subscriber that everything changed, on a timer. Each feed's `<updated>` is
its newest entry's, and `check-feeds.py` asserts exactly that.

### Discovery

- `<link rel="alternate">` in the head of each theme page, built in `base.njk`
- a visible "Follow this theme" control under the map

> **Gotcha.** Nunjucks has **no `selectattr` filter** — that is Jinja2. A chain
> using it does not narrow anything, and a trailing `| first` silently returns
> the first item. This shipped briefly: every theme page advertised the same
> wrong feed while its visible link stayed correct. `check-feeds.py` now asserts
> each page advertises its own feed.

Feeds are excluded from the sitemap and from site search: a subscription
endpoint is not a page to index.

### Gate

```bash
python3 scripts/check-feeds.py    # needs a build first
```

Parses every feed under `_site/` and asserts required Atom elements, RFC 3339
dates (fractional seconds allowed — the news feed emits them), unique entry ids,
the 50-entry cap, newest-first ordering, content-derived `<updated>`, and the
per-page alternate link. Runs in `sanity-check.yml`.

---

## 4. The theme vocabulary as SKOS

`THEME_RULES` in `src/_data/corpus.js` is a controlled vocabulary of seventeen
research themes, translated by hand into French and German, and it tags 479 of
the 511 papers. Until #1249 it existed only as a JavaScript constant inside a
website build, which nobody outside the repository could cite, reuse or map
their own data to. `src/_data/themeVocab.js` re-expresses it as SKOS.

### The URI scheme

This is the one irreversible decision in the feature, so it is written down
here rather than left to be read off a template.

| Object | URI |
|---|---|
| The concept scheme | `https://eiss-europa.com/vocab/themes` |
| A concept | `https://eiss-europa.com/vocab/themes/<key>` |
| The two tier collections | `https://eiss-europa.com/vocab/themes/collection/{permanent-sections,derived-themes}` |

`<key>` is the **stable theme key** (`warfare-transformations`), not the theme's
English name and not the Atlas page slug (`transformations-of-warfare-and-conflict`).
The key is locale-agnostic and is already what the Atlas filter and the
`data-themes` attribute match on. The name is display text, and it is
translated, so it cannot name a concept.

Minting a URI is a promise to keep it resolving. Every one of them does:
`src/vocab-themes.njk` renders the scheme URI as the vocabulary's own page, and
`src/vocab-theme.njk` renders one stub per concept that carries the canonical
link and hands over to that theme's view in the Atlas. The stubs are excluded
from the sitemap, so seventeen near-empty pages do not compete with the theme
views they point at.

One known impurity: a static host cannot content-negotiate, and GitHub Pages
cannot answer 303, so a concept URI resolves to a document rather than
distinguishing the concept from its description. Linked-data purists call that
wrong, and the alternative is a server we do not run. The serialisations are
unaffected.

### One structure, two serialisations

`themeVocab.js` builds the graph once and emits both Turtle and JSON-LD from
it, so a label fix lands in both or in neither. Verified isomorphic with
`rdflib` at 161 triples each when the feature shipped.

| Surface | URL |
|---|---|
| Turtle | `/vocab/themes.ttl` |
| JSON-LD | `/vocab/themes.jsonld` |
| Human-readable | `/vocab/themes/` |

**Where a reader meets it.** A vocabulary nobody can find is barely better
than one never minted, and the map is where the people who would reuse this
already are (#1571). The theme list on every Atlas view links to
`/vocab/themes/`, a theme's hub panel on the map links to that theme's
identifier, and each of the seventeen theme pages prints its own URI in full,
since that is the page a crawler or a reader is likeliest to arrive at. The
hub panel links by path rather than by the absolute URI, and asserts the key's
shape first, the same way the existing slug links do.

**The `re` matching rules are deliberately not published.** They are how a
paper gets tagged, not what a theme means, and shipping them invites a reader
to treat a regex as the definition of a research field. If a theme needs
disambiguating, the place for it is a `skos:scopeNote` in prose.

**The two tiers are modelled, not flattened.** Nine themes are the permanent
conference sections and eight are derived from the open-panel remainder. That
distinction is real, so it rides in the output as two `skos:Collection`s rather
than as a note. `corpus.js` exports `themePermanentKeys` for the split, since
the nine come first in `THEME_RULES` and counting them in two places would
drift.

### The gate

There is no separate CI script. `themeVocab.js` **throws at build time** if a
theme has no Atlas page (a concept URI that resolves nowhere) or is missing one
of its three labels (an incomplete vocabulary). Both failures are invisible in
the built output, which is exactly why they fail the build instead.

### Still open

The deposit steps in
[#1249](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1249) are
external and unfinished: a Zenodo record of its own in the `eiss` community
with its own concept DOI, a submission to Loterre, and the row in
[`corpus-archiving.md`](corpus-archiving.md) saying which identifier belongs to
which object. The vocabulary is published and citable by URI in the meantime.

---

## Files at a glance

| Path | Role |
|---|---|
| `src/_data/citations.js` | The only BibTeX/RIS builder. All 511 papers. |
| `src/_data/citationsBySlug.js` | Data-cascade bridge for the bulk JSON. |
| `src/paper-bib.njk` / `src/paper-ris.njk` | The per-paper sibling files. |
| `src/citations-json.njk` | `/data/citations.json`, fetched on first bulk export. |
| `src/assets/js/paper-export.js` | The bulk control on the by-paper view. |
| `src/_data/atlasThemePages.js` | Theme slugs, counts, year ranges. Drives pages *and* cards. |
| `src/_includes/atlas-body.njk` | The Atlas map, shared by the canonical page and all 17. |
| `src/atlas-theme.njk` | The 17 theme pages. |
| `src/_data/corpusLedger.json` | **Committed.** When each paper and abstract landed. |
| `src/_data/themeFeeds.js` | Feed entries, capped and sorted. |
| `src/theme-feed.njk` | The 17 Atom feeds. |
| `scripts/sync-corpus-ledger.mjs` | Maintains the ledger. |
| `scripts/check-citations.mjs` | CI gate for the citation exports. |
| `scripts/check-feeds.py` | CI gate for the feeds. |
| `src/_data/themeVocab.js` | The SKOS graph, and the build-time gate on it. |
| `src/vocab-themes.njk` | `/vocab/themes/`, the vocabulary's own page. |
| `src/vocab-themes-ttl.njk` / `src/vocab-themes-jsonld.njk` | The two serialisations. |
| `src/vocab-theme.njk` | The 17 concept URIs. |


---

## Finder / iCloud duplicate files

`~/Documents` is iCloud-synced, and iCloud silently produces `name 2.ext` copies
of files while they are being edited. Forty-one appeared during one session on
this repo. They never reach git — `.gitignore` pins `* [0-9].*` — but **Eleventy
does not apply that pattern**, so they do affect a local build. Three classes,
and they fail very differently:

| Duplicate of | What happens | Caught by |
|---|---|---|
| A template (`.njk`) | Build **fails fatally**: Eleventy's `DuplicatePermalinkOutputError` | Eleventy itself |
| A data file (`_data/*.js`) | **Silent.** Build succeeds, an extra data global is loaded | `check-build-sanity.mjs` |
| An asset (`.jpg`, `.svg`, `.js`) | **Silent.** Copied straight into `_site/` | `check-build-sanity.mjs` |

The silent two are the dangerous ones, because rule §14 leans on rendering and
verifying locally, and a build with doubled inputs cannot be trusted to prove
anything. `check-build-sanity.mjs` fails on any `name 2.ext` under `src/` or
`scripts/` and names the offenders.

An `.eleventyignore` entry was tried and **does not work**: its glob syntax does
not match the pattern, and assets are copied through a passthrough rather than
templated. The sanity check is the working guard.

Clean-up, when the check fires:

```bash
find src scripts -name '* [0-9].*' -delete
```
