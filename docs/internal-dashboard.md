# Internal dashboard: versions

`/internal.html` (with `/internal.fr.html` and `/internal.de.html`) carries its own version number, shown at the foot of the page as "Internal dashboard v2.30.0". It is separate from the site's release numbers in `CHANGELOG.md`, so a reader can tell which build of the dashboard they are looking at.

The number lives once, as `VERSION` in `src/_data/dashboard.js`.

## Semantic versioning

The number is MAJOR.MINOR.PATCH, after [Semantic Versioning 2.0.0](https://semver.org/).

- **MAJOR** goes up for a redesign that changes the page's structure, so that a reader has to find things again. The role-based layout of #1951 and the apps-first order of 3.0.0 are the major changes so far.
- **MINOR** goes up for anything new a reader can see or use: a section, a tab, a roll, a control. This is the `feat(internal)` PRs.
- **PATCH** goes up for a fix that changes no feature: a layout bug, a broken interaction, a wrong figure. This is the `fix(internal)` PRs.

Copy edits, translations, documentation and data refreshes leave the number alone.

## Bumping it

1. The PR that changes the dashboard sets `VERSION` in `src/_data/dashboard.js`.
2. The same PR adds a row at the top of the table below.
3. When two dashboard PRs are open at once, the one that merges second takes the next number and rebases its row.

## Where the history starts

The page was created in #1902 on 30 October 2026, which is 1.0.0. The numbers up to 2.19.0 were assigned on 6 November 2026 by replaying the history of `src/internal.njk`, `src/_includes/internal-body.njk` and `src/_data/dashboard.js`: each `feat(internal)` PR is a minor step, each `fix(internal)` PR a patch step, and #1951 the major step. Roadmap refreshes and dependency bumps were left out.

## History

Newest first. Rows for 2.20.0 and later were added as each PR was opened.

| Version | Date | PR | Change |
|---|---|---|---|
| 3.8.0 | 2026-11-20 | | The Volunteers card leaves Platform development and becomes a Volunteers tab, after Platform status, for staff and management. The tab carries an orange dot while a joining request waits for approval, and such a request sets the header's Systems tile to Issue, linked to the tab. More space above the tab bar |
| 3.7.0 | 2026-11-20 | | A Volunteers card under Platform development, for staff and management: joining requests waiting for approval, with an orange dot while there is one and a link to the people lifecycle Sheet, the number of active volunteers, and their names by cohort from the board page. The counts come from the EISS status web app (#2230) |
| 3.6.0 | 2026-11-20 | | Guides goes from eleven tiles to eight. Joining Guide, Writing to board@ and Website tasks leave the tab and stay as links in the joining steps, whose tile note names the Joining Guide. A Design systems in Claude tile, for staff, management and volunteers, opens the Drive guide to the EISS and NetSec design systems. Publishing news opens the Drive guide to the News item form, in place of `docs/news-publishing.md`, and shows to management and volunteers as well as staff. The French and German notes are machine translations |
| 3.5.0 | 2026-11-18 | | Your apps groups its tiles under Work together, Conference and news, and People and account for a role that sees more than eight, and under Most used for the tiles moved up by use. Board members see eight tiles and keep a flat grid. Filtering flattens the list |
| 3.4.0 | 2026-11-18 | | The News Composer tile is two tiles, EISS News Composer and NetSec News Composer, for staff, management and volunteers. Each opens its site's News item form on GitHub |
| 3.3.0 | 2026-11-18 | | A News Composer tile under Your apps, for staff, management and volunteers, opens the News item form on GitHub. A composer with live character counts and post previews is #2196 |
| 3.2.1 | 2026-11-17 | | The calendar tiles open the Updates tab, above the activity rolls and the conference timeline. They were last, under the conference pace, 1,591px down on desktop. The right-edge fade on the tiles, measured while the tab was hidden since 3.1.0, is measured again when the tab shows |
| 3.2.0 | 2026-11-17 | | The release card opens folded: its eyebrow, title and "Read the release notes" link. A "Show summary" button beside the link unfolds the note. Without JS the note shows in full. The phone-only four-line cut of the note is gone |
| 3.1.0 | 2026-11-17 | | An Updates tab, second after Apps, holds the activity rolls (with "since your last visit") and then the conference timeline, stepper, pace and deadline tiles. Both sat below the tab panels, 3.3 screens down on desktop and up to 9.9 on a phone. The tab shows a count of what changed since the last visit, for the role in view, until it is opened. The deadline figure in the strip links to Updates instead of Platform development, which stays its own tab. #2185 |
| 3.0.0 | 2026-11-17 | | The tabs and Your apps follow the figures strip and the release card. Timeline and the activity rolls move below the tab panels. The first app tile starts about 1,200px down at 1280×800, from 2,270px, and about 1,350px down on a phone, from 3,170px. The header drops its welcome sentence and its lockup is smaller. On a phone the tabs stay on one row that scrolls sideways, and the release note is cut at four lines. Guide tiles carry a note. The deadline tiles fade at the right edge while more lie beyond. Next milestones leaves the progress of the next release to the Next release card. The Platform development cards keep their own heights. Counts of issues, pull requests and tasks take a singular for one (French: for 0 and 1), and "Issues closed: 64 of 101" replaces "64 of 101 issues closed". The NetSec Month and Annual Year menus are styled like Viewing as. The Year menu lists "2026 (draft)". "No annual report has been published yet" shows only to a role that sees no year. Small links on a phone have at least 24px to tap. Issues #2179 to #2182 |
| 2.36.1 | 2026-11-17 | | The "Can't sign in?" password line links "Reset my password" to Google's account recovery, the page the Apps tile opens, in place of the steps on Google's sign-in page. The tile's note says Google sends a code to the recovery email or phone. admin@eiss-europa.com is a mail link. A milestone with no issues no longer shows "(%)" in Next milestones |
| 2.36.0 | 2026-11-17 | | An Annual reports tab after NetSec reports (renamed from "NetSec report") replaces the annual report link at the foot of the page. A Year menu shows one year at a time (`?year=2025` links to one) and opens its report. Drafts show to staff and management only. A year marked `"final": true` in `annualReportNotes.json` shows to every role. The board, which saw the draft link, no longer sees drafts |
| 2.35.0 | 2026-11-17 | [#2175](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2175) | A "Reset my password" tile under Your apps opens Google's account recovery page. The last "Can't sign in?" item sends people without recovery details to admin@eiss-europa.com and links "add a recovery email to your account" in the sentence. A link to `#signin` opens the box: the padlock menu's note links "Guide" there |
| 2.34.0 | 2026-11-17 | [#2175](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2175) | A "Can't sign in?" disclosure under the hero: where to find a forgotten EISS address, Google's "Forgot password?" route, and whom to ask when recovery fails. A joining step asks everyone to add a recovery email. Follows Google's [password recovery article](https://knowledge.workspace.google.com/admin/users/set-up-password-recovery-for-users): self-service recovery works only while it is on in the Admin console and the account has recovery details |
| 2.33.5 | 2026-11-16 | [#2167](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2167) | The Conference pace card says what it compares: a line under the heading names both editions and the scale of the bars, this edition's figure reads "so far", and the previous edition's reads "of 162 at the same time last year". On a phone each figure sits under its bar |
| 2.33.4 | 2026-11-09 | #2096 | The hero opens with a welcome line and asks people to log in only with their EISS account, with "dedicated Chrome profile" linked to Google's help page. The release figure and "Next milestones" skip a milestone left open after its release: a version with its own section in `CHANGELOG.md` has shipped. v2.29.0, released on 8 November with its milestone still open, had kept both at 100% |
| 2.33.3 | 2026-11-09 | #2094 | The hero says that Google asking to request access means a personal account is signed in, and to switch to the eiss-europa.com account, with "EISS Chrome profile" linked to Google's help page on adding one. The header's staff sign-in menu opens with the same reminder. In the NetSec report, a Directory card links its profile only while the NetSec directory index lists it, so a renamed or departed member's card is plain text |
| 2.33.2 | 2026-11-08 | [#2085](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2085) | The NetSec report months and the board highlights are stored in `src/data/` and refreshed by the daily roadmap workflow. Deploys no longer call the GitHub API for them, so a busy day no longer hides the NetSec tab or the features and fixes rolls |
| 2.33.1 | 2026-11-08 | [#2083](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2083) | The NetSec report keeps its Month menu: its months, and the board highlights, are published under `/data/`, since every `/internal/` address goes to internal.eiss-europa.com and was never read back. The annual report link opens `/annual-report-YYYY.html`. The sources note under each NetSec view has more space above it and is justified. The history rows for #2075 to #2077 carry their own numbers |
| 2.33.0 | 2026-11-08 | [#2077](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2077) | A release card under the status strip: an EISS or NetSec release of the last 14 days, with its "For the team" note or its lede and a link to the notes, hidden once dismissed. The version at the foot links to this history |
| 2.32.0 | 2026-11-08 | [#2076](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2076) | The NetSec report's long lists (Directory profiles, the website's features, fixes and contributors) show six items and a "Show all" button. Working groups sit under Leadership in one column, and the Timeline heading gets the space above it the other sections have |
| 2.31.0 | 2026-11-08 | [#2075](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2075) | Board and management see a Board drive tile for the EISS Board shared drive, and board members find "Writing to board@" under Guides (#1987) |
| 2.30.0 | 2026-11-08 | [#2074](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2074) | Each Timeline tile opens its own resource: a key date its `url` (the CfP or ESSC folder on Drive, Indico) or the app first in its `links`, a release its milestone page, the ESSC its year page; "Next milestones" opens milestone pages too |
| 2.29.1 | 2026-11-08 | [#2073](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2073) | Dates read from the "EISS dates" calendar keep their French and German label, stage and step, so the FR and DE pages are not left in English (#2053) |
| 2.29.0 | 2026-11-08 | [#2067](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2067) | The Timeline tiles read the "EISS dates" calendar: copies of Indico events and dates marked `site: netsec` become tiles tagged EISS or NetSec, and NetSec's `events.json` fills in only what the calendar lacks (#2028) |
| 2.28.0 | 2026-11-07 | [#2051](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2051) | The NetSec report tab takes the email's look (blue band with the NetSec logo and gold stripe, gold-ruled summary, stat tiles, working-group colour bars), adds an "All months" view with a chart of Directory joiners per month since launch, and the Systems light reads the newest deploy run, so a re-run that passed clears Critical |
| 2.27.3 | 2026-11-07 | [#2050](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2050) | The NetSec months are computed again: the per-commit calls go ten at a time, under GitHub's burst limit (#2047) |
| 2.27.2 | 2026-11-06 | [#2049](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2049) | Main new features and Main bug fixes survive a rate-limited build: pull-request builds reuse the published highlights, and a failed recompute keeps them (#2047) |
| 2.27.1 | 2026-11-06 | [#2048](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2048) | The NetSec months survive a rate-limited build: pull-request builds no longer recompute them, and a month that cannot be recomputed keeps its live copy (#2047) |
| 2.27.0 | 2026-11-06 | [#2045](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2045) | A Month menu on the NetSec report tab for past months (`?month=2026-09`), the Recent activity lights to the left of each roll's label, the Platform status lights merged into the level dots, and the "Live from GitHub, checked" line under the header removed |
| 2.26.0 | 2026-11-06 | [#2046](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2046) | A link to the annual report draft at the foot of the page (staff, management, board) |
| 2.25.0 | 2026-11-06 | [#2043](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2043) | A "Conference pace" card in the conference timeline (staff and management): abstracts and registrations against the previous edition at the same distance from the conference (#2039) |
| 2.24.0 | 2026-11-06 | [#2041](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2041) | Both "Recent activity" boxes (the issue rolls and the board's rolls) show for every role, "Platform development status" becomes "Platform development", NetSec report moves to the last tab, and `netsecReport` keeps every month since June 2026 for a month dropdown |
| 2.23.0 | 2026-11-06 | [#2040](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2040) | A light on each data block (dark green stored, light green live) with a legend at the foot, the three newest tasks to pick up under their count, the role in the address (`?role=board`), and `dashboard.pace` for #2039 |
| 2.22.1 | 2026-11-06 | [#2038](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2038) | A roll's full list glides open and shut, and its extra lines fade in |
| 2.22.0 | 2026-11-06 | [#2037](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2037) | "Key dates" in Platform development status becomes "Next milestones": the release milestones only, each with its progress |
| 2.21.0 | 2026-11-06 | [#2033](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2033) | A version number on the dashboard, and this history |
| 2.20.1 | 2026-11-06 | [#2032](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2032) | An opened roll keeps its chevron in its box, and long titles wrap |
| 2.20.0 | 2026-11-06 | [#2031](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2031) | One "Timeline" section with a "Conference timeline" card, tiles marked by kind (conference, internship, release, NetSec event), and the tabs renamed and reordered (Apps, Guides, Platform development status, NetSec report, Platform status) |
| 2.19.0 | 2026-11-06 | [#2029](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2029) | A "Conference timeline" section with calendar tiles for coming dates |
| 2.18.0 | 2026-11-06 | [#2027](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2027) | Slower rolls, and a chevron that unfolds each roll's full list |
| 2.17.0 | 2026-11-06 | [#2026](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2026) | A "Recent activity" section of one-line rolls for issues, features, audits and fixes |
| 2.16.0 | 2026-11-06 | [#2025](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2025) | A NetSec tab with the last monthly report, recomputed at build |
| 2.15.0 | 2026-11-06 | [#2023](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2023) | A board view of features, fixes and audits, and opened issues in the roll |
| 2.14.1 | 2026-11-05 | [#2018](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2018) | Roll the last issues closed for every role |
| 2.14.0 | 2026-11-04 | [#2013](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2013) | GitHub's service status in the IT monitoring panel |
| 2.13.0 | 2026-11-04 | [#2010](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2010) | French and German versions of the dashboard |
| 2.12.2 | 2026-11-04 | [#2011](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2011) | Closed-issues roll falls back to the build when GitHub refuses the browser |
| 2.12.1 | 2026-11-03 | [#2003](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2003) | Welcome dialog QA (focus, steady height, phone layout) |
| 2.12.0 | 2026-11-03 | [#2002](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/2002) | First-visit welcome that walks a joiner through their role's steps |
| 2.11.0 | 2026-11-02 | [#1984](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1984) | Roll the last five issues closed, not those since the last visit |
| 2.10.0 | 2026-11-02 | [#1983](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1983) | Read the year's dates from the EISS dates calendar |
| 2.9.0 | 2026-11-01 | [#1981](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1981) | One list of dates, and Key dates as a timeline |
| 2.8.0 | 2026-11-01 | [#1979](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1979) | Chart the release's closures over 30 days |
| 2.7.0 | 2026-11-01 | [#1971](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1971) | Crossfade panels on tab change |
| 2.6.0 | 2026-11-01 | [#1970](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1970) | Filter the apps grid and put the most-used apps first |
| 2.5.0 | 2026-11-01 | [#1969](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1969) | Drain a bar along the deadline tile's foot |
| 2.4.0 | 2026-11-01 | [#1968](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1968) | Add a conference-year stepper to the Now card |
| 2.3.0 | 2026-11-01 | [#1972](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1972) | Show each automation's last ten runs |
| 2.2.0 | 2026-11-01 | [#1966](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1966) | Show what moved since the last visit on the strip |
| 2.1.1 | 2026-11-01 | [#1964](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1964) | Roll closed issues for visits stored before timestamps |
| 2.1.0 | 2026-11-01 | [#1963](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1963) | Roll the issues closed since the last visit like end credits |
| 2.0.1 | 2026-10-31 | [#1954](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1954) | Drop the deadline from the Today line |
| 2.0.0 | 2026-10-31 | [#1951](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1951) | Role-based dashboard with live status and ESSC 2027 dates |
| 1.8.0 | 2026-10-31 | [#1946](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1946) | Show that an app is opening after a click |
| 1.7.0 | 2026-10-31 | [#1945](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1945) | EISS and NetSec logos in IT System Monitoring |
| 1.6.0 | 2026-10-31 | [#1944](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1944) | Show Workspace automations in IT System Monitoring |
| 1.5.0 | 2026-10-31 | [#1941](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1941) | Status dots for IT System Monitoring, with Google's status feed |
| 1.4.0 | 2026-10-31 | [#1927](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1927) | IT System Monitoring section, and the task tracker becomes the Project Manager |
| 1.3.0 | 2026-10-30 | [#1912](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1912) | Beta bubble on the task tracker tile, and its access rules in the docs |
| 1.2.0 | 2026-10-30 | [#1911](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1911) | Interns and volunteers share one Volunteer profile |
| 1.1.0 | 2026-10-30 | [#1907](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1907) | Status, key dates, guides and a task tracker placeholder |
| 1.0.0 | 2026-10-30 | [#1902](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1902) | Dashboard design with the 10-year logo |
