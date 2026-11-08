# News publishing

How the News surface works, and how to add an item. Covers the homepage
"Latest" section, the `/news` archive, the Atom feed at `/feed.xml`, and the
label-an-issue automation. Tracked in
[#96](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/96),
[#605](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/605),
[#634](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/634),
[#2058](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/2058).

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

The News item form (#2058) can also write these. The site pages ignore them.

- **site** — `"joint"` for an item shared with NetSec. Absent means EISS.
- **body** — the longer text, kept whole for the newsletter.
- **image** — an image address for the newsletter.
- **social** — an object. `text` is the LinkedIn and Bluesky caption (the
  form's summary). `collaborator: "netsec"` names the NetSec page, which is
  added by hand as collaborator after the post goes out.
- **newsletter** — `true` when the item goes in the monthly newsletter. The
  feed tags such an entry with `<category term="newsletter"/>`.

`src/_data/news.js` is the read side: it sorts newest-first, derives a stable
`slug` + ISO timestamp per item, and splits out the homepage window. Decay:
items older than 18 months rotate off the homepage (capped at 5) but stay on
`/news` forever. The feed carries the most recent 20.

## Adding an item — two ways

### 1. File the News item form (the phone path)

Open a new issue and pick **News item**
([`.github/ISSUE_TEMPLATE/news.yml`](../.github/ISSUE_TEMPLATE/news.yml)).
Only the headline (or the issue title) and the summary are needed.

| Field | Goes to |
|---|---|
| Site | EISS: nothing extra. Joint: `"site": "joint"`. NetSec: the run stops, file it in the NetSec repository |
| Headline | `title` (blank: the issue title, minus a leading `news:`) |
| Summary | `excerpt` and `social.text`, cut to 300 characters |
| Body | `body` |
| Type | `type` (default `news`) |
| Link | `url` |
| Image | `image` |
| Publication date | `date` (blank or not `YYYY-MM-DD`: the day the label is applied) |
| Collaborator page | `social.collaborator` |
| Newsletter | `"newsletter": true` |

A publisher reads the issue and applies the **`news`** label. The
`Publish news from issue` workflow
([`.github/workflows/news-publish.yml`](../.github/workflows/news-publish.yml))
runs [`scripts/news-from-issue.py`](../scripts/news-from-issue.py), which
appends the item and opens an auto-merging PR. The PR body carries
`Closes #<issue>`, so the merge closes the issue. The PR merges once the
required checks pass, so check the issue before labelling it. A typo that has
already merged is a one-line edit to `src/_data/news.json`.

**Who can publish.** Only the GitHub accounts listed in the repository
variable `NEWS_PUBLISHERS` (Settings > Secrets and variables > Actions >
Variables), separated by commas or spaces. When anyone else applies the label,
the workflow comments on the issue and publishes nothing. With the variable
unset, nobody can publish. Applying a label also needs Triage access to the
repository.

**Free text still works.** An issue that does not use the form becomes an
item the original way: the title is the headline and the body's first
paragraph is the excerpt, unless the body opens with optional header lines.

```
Type: paper
URL: https://doi.org/…
Date: 2026-06-20

The paragraph that becomes the excerpt.
```

**Dry run.** Start the title with `[test]` and the workflow opens the PR
without arming auto-merge, so nothing publishes. Read the PR, then close it
and the issue.

**Tests.** `python3 scripts/test-news-from-issue.py` checks both body shapes.
The Build sanity workflow runs it on every PR.

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
