# EISS website: operator and handover guide

The EISS website runs on a one-person bus factor. The maintainer (Dr
Arthur Laudrain, the EISS Technology Coordinator) holds the access and
the operating knowledge. This guide exists so the site survives that
person being unavailable. It is the map a board member or a successor
opens first.

The six per-pipeline docs alongside this one go deep on one system
each. This guide stays wide. It inventories what the site depends on,
gives recipes for the handful of routine tasks, lists first-response
steps by symptom, and closes with a handover checklist.

Cross-references, by topic:

- Board bios pipeline: [`board-bios-setup.md`](board-bios-setup.md)
- Indico programme integration: [`indico-programme-integration.md`](indico-programme-integration.md)
- Indico API token: [`indico-api-token.md`](indico-api-token.md)
- Adding a conference year: [`new-conference.md`](new-conference.md)
- Translations: [`i18n.md`](i18n.md)
- Roadmap and milestones: [`roadmap-2026.md`](roadmap-2026.md)
- Standing AI-assist rules: [`../CLAUDE.md`](../CLAUDE.md)

---

## 1. External assets and access inventory

Everything the live site leans on, what it controls, and who holds the
keys. **No secrets, tokens, or passwords appear here.** This section
records where each credential lives, not its value. When you read
"password manager", that means the maintainer's personal vault, which a
successor inherits through the handover in section 4.

### GitHub repository and Actions

- **What it is.** `github.com/EISSeuropa/EISSeuropa.github.io`, an
  Eleventy 3 + Nunjucks static site under the `EISSeuropa` GitHub
  organisation. `master` is the single long-lived branch. Every change
  lands as one squashed commit.
- **What it controls.** Source, build, the automated sync workflows,
  the release tooling, and the issue and milestone backlog. This is the
  authoritative source for the whole site.
- **Access.** The maintainer owns the org and the repo. The board
  should hold at least one further org **Owner** so the repo cannot be
  orphaned (see section 4). The automated PRs are assigned to the
  maintainer's GitHub handle so the assignee notification reaches them.
- **Secrets.** Repository secrets live under *Settings → Secrets and
  variables → Actions*. The only custom one is `INDICO_API_TOKEN` (see
  below). `GITHUB_TOKEN` is the runner's built-in token, minted per run.

### GitHub Pages deploy

- **What it is.** The build-and-deploy pipeline in
  [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).
  It runs `npm run build`, uploads `_site/` as a Pages artefact, and
  deploys to the `github-pages` environment.
- **What it controls.** What visitors actually see at the domain. It
  fires on every push to `master`, on pull requests (build validation
  only, no deploy), and on manual dispatch.
- **Access.** Tied to the repo. No separate login.
- **Known gotcha.** GitHub does not cascade a deploy when a workflow's
  own `GITHUB_TOKEN` resolves an auto-merge (the sync-roadmap loop is
  the usual culprit). Master moves, the live site stays stale, and
  `gh run list --workflow=deploy.yml` shows no run at the merge
  timestamp. Cure: `gh workflow run deploy.yml --ref master` from a
  real user account, or push any commit (an empty one works). The
  daily *Scheduled rebuild*
  ([`scheduled-rebuild.yml`](../.github/workflows/scheduled-rebuild.yml),
  04:15 UTC) re-dispatches the deploy so the site never stays stale
  more than ~24 hours regardless.

### Domain and DNS: eiss-europa.com

- **What it is.** The custom domain. `src/CNAME` carries
  `eiss-europa.com`, which Eleventy copies into `_site/`. Pages reads
  it and serves the site there.
- **What it controls.** The public address, plus the Apple Pay domain
  association file under `_site/.well-known/` that the deploy log
  checks for.
- **Access.** The domain registrar account holds the DNS records: the
  apex `A` / `AAAA` records (or `ALIAS` / `CNAME` flattening) pointing
  at GitHub Pages, plus any `www` record. Registrar login lives in the
  maintainer's password manager. **This is the single most important
  external credential to transfer in a handover.** A lapsed domain
  takes the site down and is hard to recover.
- **TLS.** GitHub Pages provisions the certificate automatically once
  DNS resolves to Pages and *Enforce HTTPS* is ticked in repo
  *Settings → Pages*. No certificate to renew by hand.

### Board bios: Google Form and Sheet pipeline

- **What it is.** A Google Form feeds a linked Google Sheet, published
  as a CSV. The *Sync board bios from Google Form* workflow
  ([`sync-board.yml`](../.github/workflows/sync-board.yml)) reads that
  CSV, rebuilds `src/_data/board.json`, downloads any new headshots,
  and opens a PR. Full setup in
  [`board-bios-setup.md`](board-bios-setup.md).
- **What it controls.** Everything on `/board.html`.
- **Access.** The Form, the Sheet, and the Drive folder of uploaded
  photos all live in the maintainer's Google account. The published
  CSV URL and the public Form URL are recorded in
  `scripts/board-source.json` (committed, not secret: the CSV URL is
  long and unguessable, and every sync produces a reviewable PR). The
  Form URL is shared with board members directly, not published.
- **Quirk.** The photo Drive folder must be set to *Anyone with the
  link → Viewer* so the sync can download headshots without auth.

### Indico instance and INDICO_API_TOKEN

- **What it is.** `indico.eiss-europa.com`, the conference-management
  instance. The *Sync events from Indico* workflow
  ([`sync-indico.yml`](../.github/workflows/sync-indico.yml), daily at
  03:45 UTC) pulls the timetable export into `src/_data/indico.json`.
- **What it controls.** The live programme grid on `/2026` (and future
  year pages), the registration-status badge, and the livestreamed
  sessions block. Indico is the authoritative source for the
  programme. The website is a view over it.
- **Access.** The sync uses a **read-only** token issued to a dedicated
  *EISS Website Sync Bot* service account, never the maintainer's
  personal Indico login. The token sits in the repo secret
  `INDICO_API_TOKEN`. Its value lives only in that secret and in the
  maintainer's password manager. Full lifecycle, rotation, and
  revocation steps in [`indico-api-token.md`](indico-api-token.md).
- **Fallback.** With no token, the sync runs in anonymous mode and
  still surfaces public timetable data. The token unlocks auth-gated
  fields only, so an expired token degrades the site rather than
  breaking it.

### Mailchimp newsletter

- **What it is.** The newsletter sign-up. The footer link points at
  `site.newsletterUrl` in [`src/_data/site.js`](../src/_data/site.js),
  currently `https://eepurl.com/h40Gkr`, a Mailchimp hosted sign-up
  short-link.
- **What it controls.** Newsletter subscriptions only. It is fully
  hosted by Mailchimp. The repo holds just the outbound link, no API
  key, no embedded form.
- **Access.** The Mailchimp account login lives in the maintainer's
  password manager. Subscriber data and campaign history live entirely
  in Mailchimp, not in this repo.

### Deploy previews

- **What it is.** There is no third-party preview service wired in.
  Pull requests run the deploy workflow's **build** job only (the
  deploy step is gated to non-PR events), so a green check confirms the
  PR builds cleanly. Visual review happens by building locally
  (`npm run build`, open `_site/`) or by eyeballing the live site after
  merge.
- **Access.** None to hold. This is noted so a successor does not go
  hunting for a Cloudflare or Netlify dashboard that does not exist.

### Contact and social

- **Contact address.** `contact@eiss-europa.com`, set in
  `src/_data/site.js`. Routing for that mailbox is managed wherever the
  domain's mail is hosted, outside this repo.
- **Social accounts.** YouTube, X / Twitter (`@EISSnetwork`), and
  LinkedIn, all linked from `src/_data/site.js`. Their logins live in
  the maintainer's password manager and are part of the handover.

---

## 2. Routine-task recipes

The everyday operations, each as a short recipe. None needs more than
the GitHub web UI plus, for a release, a local clone.

### Review and merge a board-sync auto-PR

A board member submitted or updated their bio. To publish it:

1. Run the sync. *Actions → Sync board bios from Google Form → Run
   workflow* on `master`. Wait ~30 seconds.
2. If anything changed, a PR opens on the `board-sync/auto` branch,
   labelled `automated` and `data-sync`, and you are assigned to it
   (you get the notification). If nothing changed, the run is a clean
   no-op and no PR appears.
3. Open the PR. The body carries a human-readable "What changed"
   summary plus the run log. The diff touches only
   `src/_data/board.json` and any new files under
   `src/assets/images/board/`.
4. Read the diff. Confirm the change is one you expect and the bio copy
   is sensible. The Form URL is private and every run is reviewed here,
   so there is no allowlist: if something unexpected arrives, you simply
   do not merge.
5. Merge with **Squash and merge**. Deploy fires and `/board.html`
   updates within a couple of minutes.

### Expire or remove a board member

How a member leaves depends on which kind they are.

- **An intern, time-based.** The Form's *Internship end date* field
  writes `roleEndDate` into `board.json`.
  [`src/_data/boardSorted.js`](../src/_data/boardSorted.js) applies a
  7-day grace at build time, then moves the entry into the folded
  *Past board members and interns* footer automatically. No operator
  action. The daily rebuild advances the cut-off.
- **A board member or leadership departure, by hand.** Their terms are
  open-ended, so expiry is a deliberate edit. Open
  `src/_data/board.json`, find the entry, and either set its
  `roleEndDate` to the departure date (to fold it into the past-members
  footer after the grace window) or delete the entry outright. Open a
  small PR, review, squash-merge.
- **Full removal.** Two steps, both deliberate. First delete the
  member's row in the Google Sheet, or the next sync re-adds them.
  Then remove their entry from `board.json` in a PR. The sync never
  deletes entries on its own. Their old photo file stays under
  `src/assets/images/board/` until you delete it manually.

### Make a copy edit and run the drift mark-fresh

You fixed a typo or reworded a sentence on an English page that has FR
and DE siblings.

1. Edit the English source, e.g. `src/initiative.njk`.
2. Decide whether the change is substantive. If the same wording exists
   in the FR / DE siblings, hand-translate it there too (no machine
   translation, per CLAUDE.md §1). For a trivial edit you may let the
   translation lag and just re-stamp.
3. Re-stamp the drift state so CI passes:

   ```bash
   python3 scripts/check-i18n-drift.py --mark-fresh src/initiative.njk fr
   python3 scripts/check-i18n-drift.py --mark-fresh src/initiative.njk de
   ```
4. Confirm the result:

   ```bash
   python3 scripts/check-i18n-drift.py
   ```

   It must end on *All translations match*.
5. Add a `[Unreleased]` bullet to `CHANGELOG.md` if the change is
   user-visible. Open a PR, review, squash-merge. Full mechanics in
   [`i18n.md`](i18n.md).

### Cut a release with scripts/release.sh

Releases are scripted. Before you run it, the relevant work is already
merged to `master` and `CHANGELOG.md`'s `[Unreleased]` section is
populated in the hybrid format (see the top of `CHANGELOG.md`).

1. From a clean local `master` that matches `origin/master`:

   ```bash
   scripts/release.sh 2.26.0 "Short release title"
   ```

   The version is `X.Y.Z` with no leading `v`. Pass `--dry-run` first
   if you want a preview that touches nothing.
2. For a **minor or major** (`X.Y.0`), the script prints the four-point
   cross-check reminder (roadmap, sitemap, translations, README) before
   the confirmation prompt. Walk CLAUDE.md §5 if anything in the
   release changed one of those surfaces. Patch releases skip this.
3. The script prints the exact release notes it will publish. Read the
   lede, the themed sections, and the index aloud. This is the last
   point to abort cleanly, because publishing to GitHub Releases is
   harder to undo than a merge (CLAUDE.md §2).
4. Type `y` to confirm. The script promotes `[Unreleased]`, commits,
   tags `v<version>`, pushes, and runs `gh release create`. It needs
   `gh` authenticated against the repo.

After a minor or major, also flip the just-shipped card on
`/roadmap.html` (and its FR / DE siblings) from *Planned* to *Shipped*,
per CLAUDE.md §5.

---

## 3. Escalation by symptom

First-response steps when something breaks. The aim is to stop the
bleeding and gather enough to diagnose, not to fix every root cause
here.

| Symptom | First response |
|---|---|
| **Build red on a PR or on master.** | Open the failed run under *Actions → Build and deploy site*. The failing step is almost always `npm run build`. Reproduce locally: `npm install --no-audit --no-fund` then `npm run build`. Read the Eleventy / Nunjucks error, which names the offending template and line. A common cause is a leaf template using `t.*` without `{%- set t = i18n[lang or "en"] -%}` at the top of its body (CLAUDE.md note). Fix on a branch, open a PR, confirm the build goes green. |
| **A sync PR is failing or empty.** | *Board sync:* an empty run is normal when no submitter changed anything. A failing run usually means the published CSV URL in `scripts/board-source.json` went stale or the Drive photo folder lost its *Anyone with the link* sharing. Re-check both per [`board-bios-setup.md`](board-bios-setup.md). *Indico sync:* check the run log's first line for the mode banner. A genuinely empty no-op is fine. A failure points at the token or the Indico endpoint, see the Indico token row below. *An unexpectedly empty bios PR* is a regression, not noise: open an issue and investigate (CLAUDE.md §8). |
| **DNS or Pages down (site unreachable or serving the wrong content).** | First isolate the layer. Is `master` healthy and is the latest deploy green under *Actions*? If the deploy is stale, force one: `gh workflow run deploy.yml --ref master` (the cascade gotcha in section 1). If deploys are green but the domain does not resolve, the problem is DNS or the registrar: confirm `src/CNAME` still reads `eiss-europa.com`, confirm the registrar's apex records still point at GitHub Pages, and confirm *Settings → Pages* shows the custom domain verified with *Enforce HTTPS* on. A recently lapsed or transferred domain is the worst case, handled by the registrar login in the handover. |
| **Indico token expired or revoked.** | The site keeps working: the sync falls back to anonymous mode and public programme data still flows, so this is degraded, not down. The tell is the run log reading `anonymous mode` when you expect `authenticated`, or auth-gated fields going blank. Issue a fresh read-only token under the bot account, update the `INDICO_API_TOKEN` repo secret, delete the old token in Indico, then re-run the sync to confirm the `authenticated mode` banner. Full steps in [`indico-api-token.md`](indico-api-token.md). |
| **i18n drift check failing.** | The drift checker found an English source whose recorded SHA no longer matches, so a translation is stale or missing. Run `python3 scripts/check-i18n-drift.py` locally to see which page and language. Either hand-translate the FR / DE sibling to match the English change and re-stamp, or, for a trivial edit, re-stamp to silence CI as a deliberate maintainer override: `python3 scripts/check-i18n-drift.py --mark-fresh src/<page>.njk fr` (and `de`). The final state must be *All translations match*. See [`i18n.md`](i18n.md). |

When the fix is not immediate, open a GitHub issue with a milestone
before the session ends (CLAUDE.md §3 and §10) so the loose end
survives.

---

## 4. Bus-factor handover checklist

What a successor needs to take over the site cleanly. Work top to
bottom. The domain and the org ownership are the two that, if missed,
make recovery genuinely hard.

**Accounts and credentials to transfer** (from the maintainer's
password manager):

- [ ] **GitHub org ownership.** Add the successor as an **Owner** of
      the `EISSeuropa` organisation, not just a repo collaborator. The
      board should always keep at least two Owners so the org can never
      be orphaned.
- [ ] **Domain registrar login.** The account holding `eiss-europa.com`
      and its DNS records. This is the single most critical transfer. A
      lapsed domain takes the site down.
- [ ] **Google account** behind the board-bios Form, the linked Sheet,
      and the Drive photo folder.
- [ ] **Indico admin** for `indico.eiss-europa.com`, plus the *EISS
      Website Sync Bot* service-account login.
- [ ] **Mailchimp account** for the newsletter.
- [ ] **Social logins:** YouTube, X / Twitter, LinkedIn.
- [ ] **The `contact@eiss-europa.com` mailbox** and wherever its
      routing is configured.

**Secrets to re-confirm or rotate:**

- [ ] Confirm `INDICO_API_TOKEN` is present under *Settings → Secrets
      and variables → Actions*, and rotate it as part of the handover
      (issue a new read-only token, update the secret, delete the old
      one). Treat any offboarding as a rotation trigger
      ([`indico-api-token.md`](indico-api-token.md)).

**Operating knowledge to read:**

- [ ] This guide, then the six per-pipeline docs linked at the top.
- [ ] [`../CLAUDE.md`](../CLAUDE.md): the standing rules for any work on
      the repo, AI-assisted or not. British English, the PR and release
      workflow, the per-PR `[Unreleased]` and per-issue milestone
      discipline.
- [ ] The release flow: read `scripts/release.sh`'s header comment and
      the *Versioning* section of `README.md`.
- [ ] The roadmap and milestone scheme:
      [`roadmap-2026.md`](roadmap-2026.md) and CLAUDE.md §10.

**A first dry run, to prove the access works:**

- [ ] Trigger the board-bios sync from the Actions tab and confirm it
      either opens a reviewable PR or no-ops cleanly.
- [ ] Trigger the Indico sync and confirm the run log reads
      `authenticated mode`.
- [ ] Make a one-character copy edit on a local branch, run the build
      and the drift checker, and open then close a throwaway PR to
      confirm the full edit-to-deploy loop.

Once every box is ticked, the successor can keep the site running and,
in turn, hand it on.
