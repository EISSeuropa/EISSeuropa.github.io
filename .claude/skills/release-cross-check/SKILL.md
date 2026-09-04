---
name: release-cross-check
description: "Release-time five-point cross-check for EISS: the roadmap, sitemap, translations, repo docs and Anthology abstract-coverage surfaces to verify before cutting a minor or major release, plus milestone hygiene. Use when cutting a release, running scripts/release.sh, or asked what to check before a release. Skip for patch releases."
---

# 5. Release-time five-point cross-check (minor / major only)

Every **minor (`X.Y.0` where `Y > prev`) or major (`X.0.0`)
release** should trigger a deliberate check across five surfaces
before `scripts/release.sh` runs. Skip the cross-check on **patch
releases** (`X.Y.Z` where `Z > 0`); they're scoped to small fixes
and the overhead isn't justified. The release script's
*self-policing tier* mirrors this: patches ship the index only.

For each surface, the question is the same: *"Did anything in this
release change what this surface documents?"* If yes, edit in the
same release. If yes but too big to fit, open a tracking issue
(rule §3) and reference it from the surface itself.

### 1. Roadmap (`/roadmap.html` + FR + DE + `docs/roadmap-2026.md`)

- Is the next planned release on the *At a glance* timeline still
  accurate? Do the version milestones and their due dates match it?
- On the public `/roadmap.html` (+ FR + DE), flip the card for the
  release just cut from *Planned* / *In progress* to *Shipped*: set
  its date, add the release-notes link, and drop the `data-milestone`
  attribute so it no longer renders a progress bar. The next planned
  card is auto-promoted to *In progress* by `roadmap-progress.js`.

  **`scripts/release.sh` now offers to do this**, showing the diff and
  applying it only on an explicit `y` (#280). To do it outside a
  release, or to check what it would change:

  ```bash
  node scripts/flip-roadmap-card.mjs v2.27.0            # dry run
  node scripts/flip-roadmap-card.mjs v2.27.0 --write
  ```

  It edits `src/_data/roadmap.js`, which the three locale pages render
  from, so one command covers EN, FR and DE. The dates come from the
  same `Intl` formatter the news surface uses, so a flipped card reads
  identically to a hand-written one. Still eyeball the rendered page:
  the script guarantees the data is right, not that the prose around
  it still is.
- Anything in the *Under watch* section ready to promote to a dated
  release row (and its own milestone)?
- The autostamp on `docs/roadmap-2026.md` (rule §11) keeps the
  `[Unreleased]` bullet count fresh automatically. The prose timeline
  rows and the public cards stay maintainer-edited.

### 2. Sitemap (`src/sitemap.xml.njk` + `src/sitemap.njk` + FR + DE)

- New pages added in this release? Confirm they show up in
  `src/sitemap.xml.njk` (the XML index for search engines) and in
  the visual `src/sitemap.njk` inventory + its FR / DE siblings.
- The visual sitemap is hand-edited; confirm new pages land in the
  correct branch (*About* / *Programmes* / *Conferences* / etc.).

### 3. Translations (FR + DE variants)

- Run `python3 scripts/check-i18n-drift.py` locally. CI catches drift
  on HTML-touching PRs, but a release moment is the right place to
  confirm zero drift before stamping a version.
- Did any EN copy change in this release? FR / DE need manual updates
  (no machine translation per rule §1).
- The `status: beta` ribbon on `*.fr.njk` / `*.de.njk` carries the
  manual-translation framing; if a translation has been re-verified
  against current EN, consider whether the *beta* marker still applies.

### 4. Repo docs

- Maintainer-facing markdown docs under `docs/`
  (`board-bios-setup.md`, `i18n.md`, `indico-api-token.md`,
  `indico-programme-integration.md`, `new-conference.md`,
  `roadmap-2026.md`): does anything in this release contradict what's
  documented?
- `BRAND.md` and the brand SVGs under `src/assets/images/brand/`:
  refresh if the visual identity changes.

### 5. Abstract coverage (Anthology)

- Run `node scripts/check-abstract-coverage.mjs`. It lists every paper
  abstract that fails to attach to an Anthology paper, by year, with the
  closest programme title and a similarity score. A high score is title
  drift; a low score means the paper is absent from the programme (or is a
  panel-level abstract, which correctly matches nothing). Informational, not
  a gate. The `abstract-coverage.yml` workflow also runs it every four months
  and files a tracking issue if it finds likely drift, so this is a backstop
  more than a chore.
- Reconcile drift one of two ways. If the **programme** title is the one to
  keep (correct British spelling, or a clean version of a garbled Indico
  title), add the synced→programme mapping to
  `src/_data/paperAbstractAliases.json`. If the **programme** has the typo,
  fix it in `src/_data/archiveProgrammes.js`.
- Abstracts the sync can't pull live in `src/_data/paperAbstractsManual.json`,
  never in `paperAbstracts.json` (the sync overwrites the latter wholesale, so
  anything hand-added there is silently dropped on the next run). Two cases:
  pre-Indico editions (2022 and earlier), and **subcontribution-level
  abstracts** — papers run as subcontributions of a panel. Indico's export API
  does not expose subcontribution descriptions at any detail level or auth
  (confirmed by `scripts/probe-indico-subcontribs.py`), so those paper
  abstracts must be hand-added here from the organisers' files.

### 6. Milestone hygiene (gate, not a surface)

- Every issue closed by this release carries the matching milestone.
- Every issue still open and tagged with a milestone that just shipped
  has either been ticked off in the release notes or moved to the
  next milestone with a one-line reason in the issue thread.
- The release should not ship with its own milestone holding open work.
  See rule §10.

This is a deliberate friction-point: cutting a minor release here is
**slightly more work than running release.sh**, by design. The
release script's confirmation prompt is the last moment to bail if
the cross-check surfaces something that needs to land in the same
release.
