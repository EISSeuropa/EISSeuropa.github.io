# The #EISS10 anniversary automation

How the machinery behind the 2027 tenth-anniversary campaign works, what to
set up, how to regenerate its assets and what to switch off afterwards. The
campaign itself (the plan, the drafts, who does what) lives in shared docs
outside the repository, because the people who run it do not all use GitHub.
Tracker: [#1871](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1871).
Every related issue and PR carries the `EISS10` label.

## What runs on its own

| Workflow | When | What it does |
| --- | --- | --- |
| `social-queue.yml` | 1 March, June, September and December, 07:00 UTC | Renders the next quarter's post cards, uploads them as a 90-day run artifact, and opens an issue *Social queue: 2027Qn #EISS10 posts* with every caption and a checkbox per platform. |
| `campaign-metrics.yml` | 1st of each month, 07:00 UTC | Opens *Campaign metrics: YYYY-MM* with last month's figures filled in where they can be read (news items and Belvedere posts from `/feed.xml`, Anthology abstract coverage, alumni count) and rows to type in by hand (LinkedIn and X followers, newsletter subscribers). Reports January to December 2027 only. |
| `offboarding.yml` | Mondays, 07:00 UTC | Opens *Offboarding: name* for every `roleEndDate` in `src/_data/board.json` that passed in the previous seven days: invite to the EISS Alumni LinkedIn group, confirm the *EISS community* listing. |
| `feed-to-bluesky.yml` | After each deploy of `master` | Dormant. Bluesky is put aside ([#1856](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1856)), and the job is skipped while `vars.BLUESKY_HANDLE` is unset. |

All four are on the failure alarm list (`failure-alarm.yml`). Every issue they
open is labelled `automated`, gets the nearest open release milestone and is
assigned to the maintainer accounts. A rerun never files the same issue twice.

The monthly newsletter digest is not in the repository. Mailchimp builds it
from `/feed.xml` as an RSS campaign, set up and owned by the newsletter owner
([#1868](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1868)).

## Settings to fill in

| Setting | Where | Value |
| --- | --- | --- |
| `SOCIAL_ASSIGNEE` | Repository variable | The social media owner's GitHub handle (Eugenio Sanchez). The queue, metrics and offboarding issues are then also assigned to him. |
| `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD` | Variable, secret | Only if Bluesky is taken up. An app password, never the account password. |

Set `SOCIAL_ASSIGNEE` only once the person has accepted repository access
(Triage role is enough). `gh issue create --assignee` fails for a handle
without access, and the issue is then not filed at all. Access set-up is
tracked in [#1883](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1883).

## The pieces in the repository

- `src/_data/facts.js`, published as `/data/facts.json`: every figure the
  campaign quotes (editions, cities, Anthology papers, authors and themes,
  NetSec, board, prize laureates), computed from the data files the site
  already renders. Posts, captions and the press release read their numbers
  from here, so none is typed twice. The Anthology counts papers (511 in
  October 2026), not contributions.
- `scripts/make-anniversary-posts.py`: the 37 post cards and captions of 2027
  (launch, ten throwbacks, *Meet the board*, nine Anthology themes), with the
  schedule (throwback on the second Tuesday, board members on Thursdays from
  4 February, a theme on the fourth Tuesday, nothing in June or August).
  English captions only.
- `scripts/derive-anniversary-logo.py`: the two marks
  (`src/assets/images/brand/eiss-10-lockup.svg`, the anniversary logo, and
  `eiss-10-roundel.svg`, the profile picture) and the export set of logos,
  profile pictures, banners and email images. See `BRAND.md` for the marks.
- `scripts/campaign-metrics.py`, `scripts/offboarding-due.py`,
  `scripts/feed-to-bluesky.py`: the logic behind the workflows, each runnable
  locally.

## Regenerating assets

Both generators render through headless Chrome (macOS default path, or set
`$CHROME`) and need Python with `fonttools`, `brotli` and `Pillow`:

```bash
python3 scripts/derive-anniversary-logo.py <export-dir>
```

```bash
python3 scripts/make-anniversary-posts.py <export-dir>/posts-2027
```

`make-anniversary-posts.py` takes `--quarter 2027Q2` for one quarter and
`--no-images` to rewrite only the captions (`queue.md`). Rerun it after a
board change or a large Anthology update so the figures stay current. The
export set lives off-repo, in the shared *EISS-10-years* folder, with a README
saying where each file goes.

## Things that have gone wrong once

- **The `news` label publishes.** An issue labelled `news` becomes a public
  news item and a feed entry. A planning issue went live this way and had to
  be withdrawn ([#1872](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1872)).
  Never put `news` on campaign planning issues.
- **Chrome can finish writing a screenshot after it exits.** Both generators
  crop from a side file and assert the final size for this reason. If an
  export ever comes out 400 px too tall, that is the cause.

## After the campaign

Plan this for January 2028:

- The queue and metrics workflows go quiet on their own: the post schedule
  ends in December 2027, and the metrics report stops after December 2027.
  Delete `social-queue.yml`, `campaign-metrics.yml` and `make-anniversary-posts.py`
  at leisure.
- Keep `offboarding.yml`: the alumni invitation is worth keeping after 2027.
- Revert profile pictures and banners to the regular logo on 1 January 2028.
  Keep the anniversary marks in `src/assets/images/brand/` as an archive.
- Keep `facts.js`: the press kit and future releases can use it.
