# Changelog

All notable changes to this repository are recorded here.

This project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) and the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. What "MAJOR / MINOR / PATCH" means in the context of this repo is spelt out in the **Versioning** section of [`README.md`](README.md).

## Release-notes format (applies to `[Unreleased]` + every `[X.Y.Z]` section)

Release notes here follow a **hybrid format**: a short prose lede, two-to-five themed sub-sections carrying the actual narrative, and a canonical **index of changes** at the bottom grouped by Keep-a-Changelog categories. The themes are where the writing happens; the index is the audit trail.

### Shape (minor / major releases)

```markdown
## [X.Y.Z] · YYYY-MM-DD — <short title>

> One- to three-sentence lede in voice. What is this release
> *about*? Who's it for? Why ship it now?

### <First theme — name it for the thing that changed>

Prose intro (~2-4 sentences). Inline links to docs / issues where
relevant. Add bullets only if the theme has multiple distinct
pieces; otherwise let the prose carry it.

### <Second theme>

Same shape.

### Index of changes

The themed sections above are the story; the index below is the
audit trail. Same content, terser.

#### Added
- (one-line pointer bullets — what, not why)

#### Changed
- (…)

#### Fixed
- (…)
```

### Shape (patch releases)

Patches skip the lede + themed sections; ship the index only. People reading patch notes care about specifics, not narrative.

```markdown
## [X.Y.Z] · YYYY-MM-DD — <short title>

### Index of changes

#### Fixed
- (…)
```

### Rules

1. **Each release section has at most one `### Index of changes` block and at most one of each `#### Added` / `#### Changed` / `#### Deprecated` / `#### Removed` / `#### Fixed` / `#### Security` sub-heading inside it**, in that order. When a PR adds an entry to `[Unreleased]` during the release cycle, the bullet goes into the existing index sub-heading; do not create a second one.
2. **Themes are written at release-cutting time** — not when the PR lands. PRs accumulate raw bullets in `[Unreleased]`'s index; when the maintainer cuts the release, they read back through the index and shape it into a release story (the lede + themed sections).
3. **`scripts/release.sh` extracts `[Unreleased]` verbatim** into the GitHub Release notes. Whatever lives in `[Unreleased]` lands on the public release page — eyeball the body before confirming the prompt.
4. **No hard wraps in prose.** Each prose paragraph, blockquote lede, and multi-line bullet must be a single source line. GitHub Releases renders markdown with the *break-on-newline* GFM variant; every soft `\n` becomes a `<br>` and forces prose to render visibly narrow.

---

## [Unreleased]

> Adopts the versioning rules + release-cutting machinery from the sibling NetSec site, after a candid look at the last ten EISS releases revealed several were tagged MINOR but would be PATCH under those rules. Tags are immutable; this lands the convention so future releases are signal, not noise.

### Versioning rules now documented

New `## Versioning` section in [`README.md`](README.md) translates SemVer 2.0.0 to the static-site context: MAJOR = foundational reset, MINOR = a big new project (new page / new pipeline / new locale / new top-level feature), PATCH = bug fixes / copy edits / small UX tweaks. Includes a worked example of past EISS releases against the rules — v2.13, v2.15, v2.16, v2.18, v2.20 were tagged MINOR but were PATCH-shaped (small visual polish on existing components).

### Release tooling

New `scripts/release.sh` ports NetSec's release helper for EISS. Validates SemVer, refuses to run from non-master / dirty trees / mismatched origin, promotes `[Unreleased]` into a dated `[X.Y.Z] · YYYY-MM-DD — title` block, creates the annotated tag, pushes, and publishes the GitHub Release with the `[X.Y.Z]` section as the body. Has a `--dry-run` mode and a `y`-confirmation prompt before any mutation. Minor / major releases trigger an additional four-point cross-check reminder (roadmap / sitemap / translations / README).

### Changelog format

New `CHANGELOG.md` follows Keep a Changelog 1.1.0 + the hybrid release-notes format from NetSec: lede + 2-5 themed sub-sections + canonical `### Index of changes` block (with `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security` sub-headings, each at most once, in that order). Patches skip the lede + themes; minor / major ship the full hybrid. PRs add entries to `[Unreleased]`; releases promote.

Releases v1.0.0 → v2.20.0 are not back-filled into the changelog. The canonical record for those stays on the GitHub Releases page and the *Release history* section above.

### Index of changes

#### Added

- `CHANGELOG.md` following Keep a Changelog 1.1.0 + NetSec's hybrid release-notes format. PRs accumulate into `[Unreleased]` between releases.
- `scripts/release.sh` — bash helper that ports the NetSec workflow. Validates SemVer, enforces clean working tree + sync with origin, promotes the changelog, tags + pushes + publishes the GitHub Release in one pass. Supports `--dry-run`.
- `## Versioning` section in `README.md` with the SemVer-for-static-sites translation, release-cadence guidance ("one PR is not one release"), the title-format rule (3-8 words, sentence case, no trailing punctuation), and a candid caveat acknowledging the recent over-versioning.
- Cross-reference paragraph at the top of `docs/roadmap-2026.md` § *Release history* pointing at README → Versioning for the canonical definitions.

#### Changed

- Going forward, release-cutting goes through `scripts/release.sh` rather than ad-hoc `gh release create` calls. The script enforces the conventions automatically.

## [Pre-2.21.0] · see GitHub Releases

This changelog was introduced at v2.21.0 alongside `scripts/release.sh` and the `## Versioning` README section. Releases v1.0.0 through v2.20.0 are not back-filled here — the canonical record for those is on the [GitHub Releases](https://github.com/EISSeuropa/EISSeuropa.github.io/releases) page and the *Release history* section of [`docs/roadmap-2026.md`](docs/roadmap-2026.md).

Notable bumps from that pre-changelog era:

- **v2.14.0** — Live programme grid (the headline minor of the Indico-integration arc)
- **v2.11.0** — Authenticated Indico sync pipeline
- **v2.7.0** — Registration override + live keynotes
- **v2.5.0** — Announcement → data-driven + registration status badge
- **v2.0.0** — i18n plumbing + FR/DE chrome
- **v1.0.0** — PWA + favicon + per-page OG + footer socials + button icons

Several historical releases (v2.13, v2.15, v2.16, v2.18, v2.20) were tagged as MINOR under a looser version-bumping habit but would be PATCH under the rules formally adopted at v2.21.0 — they shipped small visual polish or UX tweaks on existing components, not "big new projects". Tags are immutable; those releases stay where they are.

[Unreleased]: https://github.com/EISSeuropa/EISSeuropa.github.io/compare/v2.20.0...HEAD
