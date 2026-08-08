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
# all 17
node -e "require('./src/_data/atlasThemePages.js')().forEach(t=>console.log('atlas-theme-'+t.slug))" \
  | xargs python3 scripts/make-share-cards.py
```

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
> The same default is why **314 of the 315 paper pages are missing from the
> sitemap**, tracked in
> [#1293](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1293).
> `.bib` and `.ris` must stay out, and do, via `eleventyExcludeFromCollections`.

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
