# News publishing

How the News surface works, and how to add an item. Covers the homepage
"Latest" section, the `/news` archive, the Atom feed at `/feed.xml`, and the
label-an-issue automation. Tracked in
[#96](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/96),
[#605](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/605),
[#634](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/634).

## The data

One hand-curated store, `src/_data/news.json` — a flat array of items:

```json
{ "date": "2026-06-12", "type": "event", "title": "…", "url": "/2026.html", "excerpt": "…" }
```

- **date** — ISO `YYYY-MM-DD`. The sort key and the displayed date.
- **type** — `paper` | `event` | `press` | `podcast` (anything else renders
  verbatim). Drives the chip label, localised via `i18n.js` → `news.types`.
- **title** — plain text, authored once in English. The per-locale `/news`
  pages show the same item titles, like the Anthology paper pages.
- **url** — optional. When present the headline links out (external links
  open in a new tab); when absent the item is text-only.
- **excerpt** — optional, ~2 lines.

`src/_data/news.js` is the read side: it sorts newest-first, derives a stable
`slug` + ISO timestamp per item, and splits out the homepage window. Decay:
items older than 18 months rotate off the homepage (capped at 5) but stay on
`/news` forever. The feed carries the most recent 20.

## Adding an item — two ways

### 1. Label an issue (the phone path)

File a GitHub issue, give it the **`news`** label. The
`Publish news from issue` workflow
([`.github/workflows/news-publish.yml`](../.github/workflows/news-publish.yml))
runs [`scripts/news-from-issue.py`](../scripts/news-from-issue.py), which
appends an item and opens an auto-merging PR (CI-gated). The PR body carries
`Closes #<issue>`, so the merge closes the issue.

- **Title** → the headline (a leading `news:` is stripped).
- **Body** → the excerpt (first paragraph), unless it opens with optional
  header lines:

  ```
  Type: paper
  URL: https://doi.org/…
  Date: 2026-06-20

  The paragraph that becomes the excerpt.
  ```

  All three header lines are optional. `Type` defaults to `news`, `Date` to
  today, `URL` to none. The PR is editable before it merges, so a typo in the
  issue is a one-line fix on the branch rather than a re-file.

### 2. Edit the JSON directly

Add an object to `src/_data/news.json` in a normal PR. Same shape as above.

## The surfaces

- **Homepage** — `src/_includes/news-latest.njk`, inserted after the
  announcement card on `/index{,.fr,.de}`. Top 5 recent items; hidden
  entirely when nothing is recent.
- **Archive** — `src/news{,.fr,.de}.njk`, each thin page setting its locale
  front matter and including `src/_includes/news-archive.njk`. Full list,
  newest-first, with `#news-<slug>` anchors.
- **Feed** — `src/feed.njk` → `/feed.xml`, a plain Atom template (no plugin).
  Linked from `<head>` (`rel="alternate"`) and the footer.

Chrome strings (headings, the type-chip labels, the page title/lead) live in
`src/_data/i18n.js` under each locale's `news` key, and the displayed dates
are localised by the `newsDate` filter in `.eleventy.js`. Item titles and
excerpts are English-only by design (the FR/DE pages keep the beta ribbon).
