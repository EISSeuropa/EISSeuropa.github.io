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
appends an item and opens an auto-merging PR. The PR body carries
`Closes #<issue>`, so the merge closes the issue. With no required checks yet
(#501), the PR merges as soon as auto-merge is armed, so check the issue
before labelling it.

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
  today, `URL` to none. A typo that has already merged is a one-line edit to
  `src/_data/news.json`.

- **Dry run.** Start the title with `[test]` and the workflow opens the PR
  without arming auto-merge, so nothing publishes. Read the PR, then close it
  and the issue.

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

## LinkedIn and Bluesky

Each new item in `src/_data/news.json` is posted to the EISS LinkedIn page and
to the EISS Bluesky account (`eissnetwork.bsky.social`) once a reviewer
approves it. Tracked in
[#2056](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/2056).
The pipeline is a port of NetSec's (`EISSeuropa/netsec.github.io`,
`scripts/social-post.py`), cut down to news.

### How a post goes out

1. A news item merges to `master`, by the issue form or by hand.
2. `Post news to LinkedIn and Bluesky`
   ([`.github/workflows/social-post.yml`](../.github/workflows/social-post.yml))
   runs `scripts/social-post.py --dry-run` and writes the exact text of each
   pending post to the run summary.
3. The publish job waits in the `social` environment for a required
   reviewer. The reviewer reads the preview in the run summary and approves.
4. The script posts the headline, the caption and the link, with the item's
   image (a file under `src/`) or the site card
   (`src/assets/images/index-meta.jpg`). It posts as the EISS page
   (`urn:li:organization:{LINKEDIN_ORG_ID}`).
5. The keys of the posted items go to `data/social-posted.json` through an
   auto-merging PR on `social/ledger`. A rerun posts nothing twice.

### What each item can say

The optional `social` field of a news item:

| Value | Effect |
|---|---|
| absent | Posted, with the `excerpt` as caption |
| `{"text": "..."}` | Posted, with this caption (the form's summary) |
| `"skip"` or `{"skip": true}` | Never posted |
| `{"collaborator": "netsec"}` | Posted from the EISS page. The run summary lists the LinkedIn post with a reminder to add the NetSec page as collaborator by hand. LinkedIn's API cannot do it |

A joint item goes out from the organiser's page only, and the other page is
added as collaborator. NetSec's pipeline does the same with
`"collaborator": "eiss"`.

The ledger key is `news::<date>::<slug>`. Changing the title or date of an
item that was already posted makes a new key, so the item is offered again.
The reviewer can reject that run. The ledger was seeded on 8 November 2026
with every item then in `news.json`.

### Set-up (done once, by the maintainer)

1. LinkedIn: check in the developer portal whether NetSec's app, which holds
   the Community Management API, can post for the EISS page when the
   authorising member administers both pages. If it cannot, request the same
   product for an EISS app.
2. Create the token with `scripts/linkedin-token.py` (`auth-url`, then
   `exchange`), signed in as an administrator of the EISS page. The scope is
   `w_organization_social`.
3. Create a Bluesky app password for `eissnetwork.bsky.social` (Settings >
   Privacy and security > App passwords). Never the account password.
4. Create the `social` environment (Settings > Environments) with a required
   reviewer, and add its secrets: `BSKY_HANDLE` (`eissnetwork.bsky.social`),
   `BSKY_APP_PASSWORD`, `LINKEDIN_ORG_ID` (the EISS page's numeric id),
   `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_REFRESH_TOKEN`, `LINKEDIN_CLIENT_ID`,
   `LINKEDIN_CLIENT_SECRET`.
5. Set the repository variable `SOCIAL_ENABLED` to `true`.

Until step 5 the preview runs and the publish job is skipped. With
`SOCIAL_ENABLED` on and a channel's secrets missing, that channel is skipped.
With no channel configured, nothing is posted and the ledger is untouched.

### Upkeep

- **The LinkedIn token** lasts about 60 days. The script renews it with the
  refresh token on a 401. When the refresh token expires too (about a year),
  run `scripts/linkedin-token.py` again and replace the two token secrets.
  NetSec's `docs/admin-guide.md` has the same procedure.
- **The LinkedIn API version** is pinned in `data/linkedin-api-version.json`.
  `linkedin-version-check.yml` reads LinkedIn's list of active versions on
  the 5th of each month and opens an auto-merging PR when the pin nears its
  end. A version past its end returns HTTP 426.
- **Tests.** `python3 scripts/test-social-post.py` and
  `python3 scripts/test-check-linkedin-version.py`, run by Build sanity. No
  network and no posting.
- Both workflows are on the failure alarm list.

