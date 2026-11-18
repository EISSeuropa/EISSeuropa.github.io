# News publishing

How the News surface works, and how to add an item. Covers the homepage
"Latest" section, the `/news` archive, the Atom feed at `/feed.xml`, and the
label-an-issue automation. Tracked in
[#96](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/96),
[#605](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/605),
[#634](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/634),
[#2058](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/2058).

## Status (11 November 2026)

Ready:

- The News item form is in the issue chooser
  ([#2116](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2116)).
- A form filed by a publisher opens its PR at once, and the PR waits for the
  maintainer ([#2121](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2121)).
  Tested on 11 November with issue #2120, whose PR #2122 was closed unmerged.
- `NEWS_PUBLISHERS` and `SOCIAL_ENABLED` (`true`) are set. The maintainer set
  up the `social` environment and the LinkedIn token the same day. The
  repository cannot read secrets, so check Settings > Environments > `social`
  for all seven before the first post.
- The PR preview comment, the `publish` label merge and the
  `publish-news-item` skill. The first run of `news-publish.yml` creates the
  `news` and `publish` labels when they are missing
  ([#2142](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/2142)).

Not yet done:

- No item has been posted through the pipeline. The first real news item is
  the live test: read the preview in the run summary, approve, then check both
  accounts. A LinkedIn 403 means NetSec's app cannot post for the EISS page,
  and EISS needs its own app (Set-up, step 1).
- The Seville workshop item (11 November) merged before `SOCIAL_ENABLED` was
  set. It carries `"social": "skip"`, so the next run does not post it.
- The newsletter does not use the pipeline yet. The form has no Newsletter box
  and no Body field for now. The script still reads both, so an older issue
  that has them still works, and a `"newsletter": true` added by hand still
  tags the item in the feed.

### Handing approval to someone else

Three settings, all under Settings in the repository, let a second person run
news without the maintainer (#2142). Each takes GitHub logins.

| Setting | Where | What it lets them do |
|---|---|---|
| `NEWS_PUBLISHERS` | Secrets and variables > Actions > Variables | File a News item that opens a PR, or start one with the `news` label |
| `NEWS_APPROVERS` | Secrets and variables > Actions > Variables | Merge the PR with the `publish` label, and be assigned to it |
| Required reviewers of `social` | Environments > `social` | Approve the LinkedIn and Bluesky posts after the merge |

They also need collaborator access to apply a label. Leaving any one out stops
the item at that step and leaves it for the maintainer.

The step-by-step guide for publishers is "How to publish a news item" in EISS
Team > Communications on the Drive.

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
- **image** — an image on the site (`/assets/...`), used as the picture of the
  LinkedIn and Bluesky posts. Blank, or an `https://` address: the site card.
  A photo from the form is saved in `src/assets/images/news/` (see *Photos*
  below).
- **imageAlt** — the image's alt text on both networks (the form's Image
  description). Blank: the headline.
- **social** — an object. `linkedin` and `bluesky` are the posts written for
  each network (the form's LinkedIn post and Bluesky post), kept with their
  line breaks and `@Key` tags. A network without one gets the headline, the
  summary and the link. `text` is the caption of items filed before the post
  boxes. `collaborator: "netsec"` names the NetSec page, which is added by
  hand as collaborator after the post goes out.
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
Only the headline and the summary are needed. Every field has a description
written for someone who has never filed the form. The intro says that the
issue title ("Add a title") only names the issue and the PR, and that the
Headline is the title on the site and in the posts.

| Field | Goes to |
|---|---|
| Site | EISS: nothing extra. Joint: `"site": "joint"`. NetSec: the run stops, file it in the NetSec repository |
| Headline | `title`. Required, up to 100 characters. A longer one stops the run |
| Website summary | `excerpt`, one line. Required, up to 300 characters. Also the post text for a network whose box is empty |
| LinkedIn post | `social.linkedin`, as written with its line breaks. Up to 3,000 characters, counted with the link added at the end (unless the text holds it) and the tags as LinkedIn shows them |
| Bluesky post | `social.bluesky`, the same. Up to 300 characters, counted with the link and each tag written as its Bluesky handle |
| Type | `type` (default `news`) |
| Link | `url`: an existing page, never a new one. The headline links to it and the social posts end with it. Blank: the posts link to the item in `/news`. Not an address: the run stops |
| Image | A photo dragged into the field: saved in `src/assets/images/news/`, and `image` is its path, the picture of the social posts. A site image (`/assets/...`) is used as it is |
| Image description | `imageAlt`. Required with a photo, up to 300 characters |
| Publication date | `date` (blank: the day the run starts). Not `YYYY-MM-DD`: the run stops |
| Collaborator page | `social.collaborator` |

GitHub drops the form from the issue chooser, without an error, when a
dropdown that sets `default` also lists `None` or `n/a` as an option. The
Collaborator page dropdown says `No collaborator` for that reason, and
`scripts/test-news-from-issue.py` fails on either word.

The `Publish news from issue` workflow
([`.github/workflows/news-publish.yml`](../.github/workflows/news-publish.yml))
runs [`scripts/news-from-issue.py`](../scripts/news-from-issue.py), which
adds the item to `src/_data/news.json` and opens a PR. It starts in two ways:

- A publisher files the form. The run starts as soon as the issue is opened.
- A publisher applies the **`news`** label, to a form issue someone else
  filed or to a free-text issue.

The PR waits for the maintainer or an approver (see *Merging with the
`publish` label* below), and is assigned to the accounts in `NEWS_APPROVERS`,
so GitHub notifies them. Merging it publishes the item on the site and
the feed, and queues the LinkedIn and Bluesky posts for approval in the
`social` environment. To change the item first, edit the entry on the PR's
branch. To drop it, close the PR and the issue. The PR body mentions the
person who filed the issue, so GitHub notifies them, and carries
`Closes #<issue>`, so the merge closes the issue.

**When a run fails.** The run comments on the issue, names the person who
started it and links the run. Nothing was published. When the script stopped
on the form's content (an empty or too long headline, a too long summary, Site
set to NetSec), the comment quotes the reason, how to edit the issue, and that
a publisher re-applies `news` to try again. Those messages are the plain ones
in `scripts/news-from-issue.py`. A message prefixed `news-from-issue:` is a
fault in the repository and gets the generic comment. The failure alarm also
opens an issue for the maintainer (#2134).

**Photos.** GitHub stores a photo dragged into the Image field and writes its
address there (`<img ... src="https://github.com/user-attachments/assets/...">`
or `![...](...)`). `news-from-issue.py` downloads it after the duplicate check,
turns it upright from its EXIF orientation, and saves it as a JPEG of at most
950,000 bytes and 2,000 pixels a side (Bluesky refuses an image over 1 MB). It
shrinks the quality to 70, then the size, until it fits. The EXIF data, with
the place the photo was taken, is not copied. The file is
`src/assets/images/news/<date>-<headline slug>.jpg` and goes in the news PR, so
the approver sees it in the Files changed tab, and its description in the post
preview. A photo that cannot be downloaded or read, or one without a
description, stops the run with a comment saying what to change. The website
does not show the photo. `scripts/test-news-image.py` checks the shrinking and
needs Pillow, so `sanity-check.yml` runs it last, after installing
`scripts/requirements.txt`.

**Post preview.** Every PR that changes `src/_data/news.json`, from the form or
by hand, gets a comment with the exact LinkedIn and Bluesky text
(`.github/workflows/news-preview.yml`). The comment is updated on each push, so
the item and its posts are read in one place before the merge.

**Merging with the `publish` label.** Only the owner can merge into `master`,
and the GitHub app does not offer the owner's bypass. Applying the
**`publish`** label to a news PR merges it instead
(`.github/workflows/news-merge.yml`): `scripts/merge-bot-pr.sh` waits for the
four required checks and merges with the owner's `AUTOPR_TOKEN`. It merges only
when the label comes from an account in the repository variable
`NEWS_APPROVERS` (GitHub logins separated by commas, or the repository owner
when the variable is unset) and the PR
changes `src/_data/news.json`, and photos in `src/assets/images/news/`, and
nothing else. Otherwise it comments, removes
the label and merges nothing. A merge that fails, for example on a required
check, comments with a link to the run and removes the label, so it can be
applied again. An approver other than the owner needs collaborator access to
apply a label. The same label merges a board profile PR for the accounts in
`PROFILE_APPROVERS` (`docs/board-bios-setup.md`). `python3
scripts/test-news-merge.py` checks which PRs the label may merge, and Build
sanity runs it.

**Asking a Claude session.** A request such as "announce the call" goes through
the `publish-news-item` skill (`.claude/skills/publish-news-item/SKILL.md`). It
builds the item with `scripts/news-from-issue.py`, the same mapping as the form,
and opens one PR, which then gets the same preview and merge.

**Publishers.** The GitHub accounts listed in the repository variable
`NEWS_PUBLISHERS` (Settings > Secrets and variables > Actions > Variables),
separated by commas, semicolons or spaces. A form issue opened by anyone else waits, with
no comment, until a publisher applies the label. A label applied by anyone
else gets a comment saying nothing was published. With the variable unset,
nobody can publish. Applying a label also needs Triage access to the
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
6. Each network is tried on its own. When one fails (a wrong Bluesky app
   password, an expired LinkedIn token, an API error), the other still posts.
   The ledger records the network that posted as `<key>#<network>`, the run
   summary lists the failure, and the job fails after the ledger PR. The next
   run tries only the network that failed, so a fixed secret catches the post
   up. Deleting a network's secrets skips that network instead: the item is
   then recorded as posted, and that network never gets it.

### What each item can say

The optional `social` field of a news item:

| Value | Effect |
|---|---|
| absent | Posted, with the `excerpt` as caption |
| `{"linkedin": "...", "bluesky": "..."}` | Each network gets its own post, as written. A network left out gets the headline, the `excerpt` and the link |
| `{"text": "..."}` | Posted, with this caption (items filed before the post boxes) |
| `"skip"` or `{"skip": true}` | Never posted |
| `{"collaborator": "netsec"}` | Posted from the EISS page. The run summary lists the LinkedIn post with a reminder to add the NetSec page as collaborator by hand. LinkedIn's API cannot do it |

**Tags.** A post box may tag an account as `@Key`, any case, where the key is
in `data/social-accounts.json` (EISS, NetSec and COST for now).
`social-post.py` writes a LinkedIn mention, `@[Name](urn:li:organization:N)`,
and a Bluesky mention facet on the handle, resolved to its DID at post time.
An account without a URN or a handle goes out as its plain name on that
network, and the post preview says so. `#Name` hashtags get Bluesky tag
facets. `news-from-issue.py` stops on a tag that is not in the file. An email
address or an `@` inside a URL is not a tag. The NetSec repository keeps the
same file. The two post boxes have `render: text`, so the issue shows them
as code blocks and GitHub notifies no user called NetSec or COST for a tag.
`post_text()` drops the code-block fence.

**Re-runs.** A publisher who edits an open form issue starts the run again,
and the news PR is rebuilt from the edited form. Anyone else's edit starts
nothing, and so does an edit to a closed issue, whose item has merged.

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
   `w_organization_social`. What caught the first run on a Mac:
   - Run it from the repository folder with `/usr/bin/python3`. A python.org
     build fails with `CERTIFICATE_VERIFY_FAILED`.
   - Replace each `<...>` placeholder, brackets included, with the value in
     single quotes. zsh reads a bare `<` or `>` as a redirection
     (`parse error near \n`), and an unmatched quote leaves it at `quote>`.
   - `exchange` needs all four values: `--client-id`, `--client-secret`,
     `--redirect-uri` (the same one as `auth-url`) and `--code`.
   - The code is the `code=` value in the address bar after approving, up to
     the `&state=eiss`. An unquoted `&` sends the command to the background
     and cuts the code. Copy the whole address into `URL='...'` and extract
     it with Python's `urllib.parse.parse_qs` to avoid copying by hand.
   - A code works once and expires after about 30 minutes. "authorization
     code not found" means it expired, was used, or was cut short: approve
     again for a fresh one.
   - Clear the shell history afterwards (`history -p`), since it holds the
     client secret.
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

- **When a post fails at sign-in**, run "Check the LinkedIn and Bluesky
  credentials" from the Actions tab
  (`.github/workflows/check-social-credentials.yml`). It waits for the same
  approval as a post, posts nothing and shows no secret. Its run summary marks
  each value ✅ or ❌: a value stored with quotes, a space or a line break; a
  Bluesky handle written with `@` or as an address; an account password where
  an app password belongs; a LinkedIn token that is no longer active, was
  issued to another app than `LINKEDIN_CLIENT_ID`, or lacks
  `w_organization_social`. Replace the ❌ values, run the check again, then
  start the post. An expired access token is not a failure while the refresh
  token works: the check renews it as a post does (EISSeuropa/netsec.github.io#2228).
  A revoked access token, a refused renewal or an inactive refresh token is ❌,
  and a refresh token with fewer than 60 days left is ⚠️.
- **The LinkedIn token** lasts about 60 days. The script renews it with the
  refresh token on a 401. When the refresh token expires too (about a year),
  run `scripts/linkedin-token.py` again and replace the two token secrets.
  If `exchange` printed no refresh token, the access token cannot renew
  itself: repeat step 2 of the set-up every 60 days or so.
  NetSec's `docs/admin-guide.md` has the same procedure.
- **The LinkedIn API version** is pinned in `data/linkedin-api-version.json`.
  `linkedin-version-check.yml` reads LinkedIn's list of active versions on
  the 5th of each month and opens an auto-merging PR when the pin nears its
  end. A version past its end returns HTTP 426.
- **Tests.** `python3 scripts/test-social-post.py` and
  `python3 scripts/test-check-linkedin-version.py`, run by Build sanity. No
  network and no posting.
- Both workflows are on the failure alarm list.

