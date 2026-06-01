# Release / pre-conference QA checklist

A repeatable Go/No-Go pass for two moments: **cutting a release** and the
**run-up to an ESSC** (when traffic peaks and stale copy or a broken link
is most costly). It strings the tools EISS already owns into one audit.
It does **not** assume tools the repo lacks (no axe-core CLI, no
Lighthouse score floors) — only what's in `scripts/`.

Pair this with the release-time four-point cross-check in CLAUDE.md §5
(roadmap / sitemap / translations / repo docs); this doc is the
*mechanical* gate, §5 is the *editorial* one.

## Phase 0 — automation (run from the repo root)

```bash
npx @11ty/eleventy                       # 1. clean build (no errors)
python3 scripts/check-i18n-drift.py      # 2. FR/DE in sync with EN sources
python3 scripts/a11y_lint.py             # 3. accessibility lint
./scripts/check-links.sh                 # 4. internal + external links resolve in _site/
# 5. privacy grep — no third party contacted on page load:
grep -rIn 'fonts.googleapis\|fonts.gstatic\|google.com/maps/embed\|googletagmanager\|google-analytics\|youtube.com/embed' _site/ \
  | grep -v 'data-pagefind-ignore' || echo "clean"
```

Notes:
- The privacy grep targets **load-time** third-party requests (embeds,
  font CDNs, analytics). A plain *click-through* link (e.g. "Open in
  Google Maps", a Google Form on `/register`, a `youtube-nocookie`
  player that only loads on click) is fine and expected — eyeball each
  hit rather than treating any match as a fail.
- CI already runs the build, drift checker, and link checker on every
  HTML-touching PR (and CodeQL). This phase is the *local, all-at-once*
  rehearsal before stamping a release or the day before a conference.

## Go / No-Go

| Check | Tool | No-Go if… |
|---|---|---|
| Build | `eleventy` | any build error |
| Translation drift | `check-i18n-drift.py` | any FR/DE page stale against its EN source |
| Accessibility | `a11y_lint.py` | new errors vs the last clean run |
| Links | `check-links.sh` | any internal link 404s; external 404s triaged (some are flaky) |
| Privacy | the grep above | any **load-time** third-party request that isn't click-gated |
| Working tree | `git status` | stray scratch / probe files staged (CLAUDE.md §8) |

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
