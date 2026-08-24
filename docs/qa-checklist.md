# Release / pre-conference QA checklist

A repeatable Go/No-Go pass for two moments: **cutting a release** and the
**run-up to an ESSC** (when traffic peaks and stale copy or a broken link
is most costly). It strings the tools EISS already owns into one audit.
It does **not** assume tools the repo lacks (no axe-core CLI, no
Lighthouse score floors) — only what's in `scripts/`.

Pair this with the release-time five-point cross-check, which now lives in
the `release-cross-check` skill rather than in CLAUDE.md (roadmap, sitemap,
translations, repo docs, Anthology abstract coverage). This doc is the
*mechanical* gate and that one is the *editorial* gate.

## Phase 0 — automation (run from the repo root)

```bash
npx @11ty/eleventy                       # 1. clean build (no errors)
python3 scripts/check-i18n-drift.py      # 2. FR/DE in sync with EN sources
python3 scripts/a11y_lint.py             # 3. accessibility lint
./scripts/check-links.sh                 # 4. internal + external links resolve in _site/
node scripts/check-build-sanity.mjs      # 5. undefined CSS classes, cross-block class
                                         #    collisions, sitemap coverage, share cards
# 6. privacy grep — no third party contacted on page load:
grep -rIn 'fonts.googleapis\|fonts.gstatic\|google.com/maps/embed\|googletagmanager\|google-analytics\|youtube.com/embed' _site/ \
  | grep -v 'data-pagefind-ignore' || echo "clean"
```

Notes:
- The privacy grep targets **load-time** third-party requests (embeds,
  font CDNs, analytics). A plain *click-through* link (e.g. "Open in
  Google Maps", a Google Form on `/register`, a `youtube-nocookie`
  player that only loads on click) is fine and expected — eyeball each
  hit rather than treating any match as a fail.
- CI already runs the build, drift checker, link checker and build-sanity
  on every PR (and CodeQL). This phase is the *local, all-at-once*
  rehearsal before stamping a release or the day before a conference.
- `check-build-sanity.mjs` takes upwards of ten minutes locally against
  well under two on CI, so it is fair to let CI hold that gate and run the
  rest here. If it does fail locally with "sitemap lists half the paper
  pages", clear the Finder duplicate files first
  (`find _site -name "* [0-9].*" -delete`) and re-run, because the checker
  counts each duplicate as a real page.

## Go / No-Go

| Check | Tool | No-Go if… |
|---|---|---|
| Build | `eleventy` | any build error |
| Translation drift | `check-i18n-drift.py` | any FR/DE page stale against its EN source |
| Accessibility | `a11y_lint.py` | new errors vs the last clean run |
| Links | `check-links.sh` | any internal link 404s; external 404s triaged (some are flaky) |
| Privacy | the grep above | any **load-time** third-party request that isn't click-gated |
| Build sanity | `check-build-sanity.mjs` | any undefined CSS class, cross-block class collision, or missing paper page in the sitemap |
| Working tree | `git status` | stray scratch / probe files staged (CLAUDE.md §8) |

## The Anthology Atlas (open a browser, at two widths)

The map is the one surface on the site that a green build says nothing
about, and the two worst defects it has shipped, a phone that would not
scroll past the map and a desktop trackpad that zoomed instead of
scrolling, were both invisible to every check in Phase 0. So it gets its
own pass at a desktop width and at 375px, on `/anthology-atlas.html`:

- The **map is on screen** without scrolling, on a first visit
  (`localStorage.removeItem('eiss-atlas-tour-seen')`) as well as a
  returning one.
- **Scrolling past the map** works: a plain wheel or trackpad scroll over
  the canvas moves the page, and ctrl or command with the wheel zooms.
- On a phone, a **swipe over the map** scrolls the page while the map is
  at rest, and pans the map once it is zoomed in.
- A **tap on a dot** opens its card rather than navigating, and a second
  tap follows the link.
- **All, None and Clear** move every chip in their row, and an empty map
  says why it is empty.
- **Browse this view as a list** matches the filters, and its links are
  out of the tab order while it is closed.
- Check the **French and German maps too**, at 375px. Longer words cost
  height above the map, and the fold was measured in English (#1548).
- The **tour** runs to the end at both widths.

### After an edition lands

The Atlas share cards are drawn from the corpus, so they show last year's
figures until they are redrawn (#1545). One command, three languages:

```bash
python3 scripts/make-share-cards.py anthology-atlas
```

Look at the output rather than trusting the exit code, and check the figures
line matches the corpus. `check-build-sanity.mjs` catches a card that is
missing, not one that is out of date.

## Pre-conference extras (the weeks before an ESSC)

- `/index` featured card and `/YYYY` show the correct **registration
  status** (`conferences.js` `registrationStatus`), and the countdown
  reads right.
- The `/YYYY` **programme grid** reflects the latest Indico sync; the
  livestream pills and the "how to take part" framing are present while
  registration is closed.
- The conference **film** plays inline on iOS (served same-origin from
  `/assets/video/`, `video/mp4`) — see `docs/search.md`'s sibling note on
  why hosting matters, and verify on a real iPhone.
- Spot-check the host-city map link, venue address, and dates against the
  official Indico page.

## Findings log

Record a one-line entry per issue found during the pass, in the PR or
release thread: `surface · what · severity · fix/issue#`. Anything not
fixed before the gate becomes a tracked issue (CLAUDE.md §3) with a
milestone (§10), never a loose note.
