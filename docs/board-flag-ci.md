# Board flag validation: investigation of #1836

Investigated on 9 November 2026 against `master` at `6f811f0b98a3f0132cbd1b086bd2c08b2f51c3f2`. Local changes and destructive test mutations were confined to `fix/1836-board-flag-ci`. Test mutations were restored after each experiment. No remote default-branch changes, deployment or protection changes were made.

## Finding and evidence

This is a missing validation gate, rather than evidence that a workflow crashed. [Issue #1836](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1836) explicitly separates two problems: the flag was not created, and the CI gate did not catch it. The only direct request in its comments asks Giovanni to investigate. [PR #1990](https://github.com/EISSeuropa/EISSeuropa.github.io/pull/1990) supplied the `india` alias and `in.svg`, and explicitly left the CI question for follow-up. It merged on 2 November 2026. The issue remains open.

GitHub's check-run records for PR #1990 head `3e916d52f1c69471db094655f9b2ce601703263c` show five successful jobs: build, Build sanity, link check, translation drift and browser accessibility. The deployment job was skipped, as expected for a pull request. The [build run](https://github.com/EISSeuropa/EISSeuropa.github.io/actions/runs/41433106929) and [Build sanity run](https://github.com/EISSeuropa/EISSeuropa.github.io/actions/runs/41433107014) are successful. These results are consistent with a missing assertion. They do not establish that CI would reject the original defect.

Current branch names and open PRs were inspected. No open PR addresses this gate. The older `ci/required-checks-prep` branch concerns required-check preparation and contains no board-flag assertion. The current `master` deployment and translation runs also succeeded. There is no identified failing workflow run to repair for this issue.

## Root cause and scope

- `scripts/sync-board.py` accepts the optional, free-text country from the Form. It does not create flags.
- `src/_data/countryFlags.js` is a manually maintained, case-insensitive alias table. PR #1990 repaired the missing India alias and asset. The current table has 53 aliases for 36 codes, with no missing source SVGs.
- `src/_includes/person-card.njk` and `board-profile-body.njk` use `lower | trim` for the lookup. When a country is unmapped, they render readable map-pin/text fallback where the country line is supported. No flag image URL is emitted. `boardSorted.js` also uses the same table for its country data. Former members remain published through the board and profile generators.
- `.eleventy.js` copies the existing `src/assets` tree. A missing optional SVG does not itself make copying fail.
- `check-build-sanity.mjs` checks empty/junk URL attributes, among other invariants. A valid text fallback and a non-empty image URL both pass. It has no country-to-asset completeness assertion.
- `scripts/check-links.sh` extracts `<a href>` only. It cannot detect an omitted image or a missing `<img src>` target. Accessibility checks do not assert country-flag coverage either.

The observed gap affects any new non-empty roster country without an alias, and missing SVGs for mapped countries. It affects both roster sections and their published former members, across the shared EN/FR/DE templates. This is broader than Astha's record, but it does not establish a general defect in all image handling.

## Controlled negative tests

Each scenario started with a clean `_site`. The India alias and/or `in.svg` were temporarily removed on the dedicated branch, then Eleventy, the unchanged sanity checker and the internal link checker were run. Exit codes below are actual local results under Node 20.20.2.

| Scenario | Eleventy | Existing sanity | Internal links | New flag check | Observed Astha card |
|---|---:|---:|---:|---:|---|
| India alias and SVG absent | 0 | 0 | 0 | 1 | map-pin/text fallback, no India image |
| Alias present, SVG absent | 0 | 0 | 0 | 1 | India image URL emitted, target absent |
| Restored alias and SVG | 0 | 0 | 0 | 0 | India image and copied SVG present |

The new check was also run with the source intact and only the built SVG removed, and rejected that missing built asset. The file was restored afterwards. The final EN/FR/DE board pages and all three Astha profile pages were parsed to confirm exactly one India flag with `alt="India"` and an existing copied SVG in each.

## Options and chosen change

| Option | Assessment |
|---|---|
| Make unknown-country rendering throw | Couples display resilience to editorial completeness and removes the intentional fallback. Not selected. |
| Extend the general link checker to image sources | Would cover missing emitted SVGs, but cannot detect the original unmapped-country case. Broader than this issue. |
| Add a focused roster-to-map-to-files check to Build sanity | Covers both observed cases with no dependency, template or deployment change. Selected. |

`scripts/check-board-flags.mjs` checks every non-empty country in `board.json` members and support, including former members. It uses the templates' lowercase/trim normalisation, requires an own alias entry, and checks every advertised flag code for a regular SVG file in both `src/assets/images/flags/` and `_site/assets/images/flags/`. A non-empty unknown country fails with the person's name and correction paths. Missing input or unreadable data fails rather than skipping the check.

The new check and its CLI regression suite run after the build inside the existing, unfiltered `Duplicate data keys + empty href/src` job. The live ruleset `17259266`, inspected read-only, already requires that context. No context rename or protection change is needed. No auto-merge is requested.

## Local verification

Commands were run from the repository root. In this table `node` denotes the downloaded Node 20.20.2 executable, matching CI's Node 20 major version. Dependency installation used the host's npm 11.9.0 and succeeded.

| Command | Actual result |
|---|---|
| `npm ci --no-audit --no-fund` | exit 0, 114 packages installed |
| `node node_modules/@11ty/eleventy/cmd.cjs` (clean output) | exit 0, 347 copied and 1,475 written files |
| `node --test scripts/test-board-flags.mjs` | exit 0, 10 tests passed |
| `node scripts/check-board-flags.mjs` | exit 0 |
| `node scripts/check-build-sanity.mjs` | exit 0 |
| `node scripts/check-citations.mjs` | exit 0, 511 papers |
| `python3 scripts/check-feeds.py` | exit 0, 18 feeds |
| `node scripts/check-release-scope.mjs` | exit 0 |
| `node scripts/sync-corpus-ledger.mjs --check` | exit 0, 511 papers current |
| `python3 scripts/a11y_lint.py` | exit 0, 662 scanned pages, zero pages with issues |
| `python3 scripts/test-social-post.py` | exit 0, 19/19 |
| `python3 scripts/test-check-linkedin-version.py` | exit 0, 14/14 |
| `python3 scripts/test-guard-bulk-read.py` | exit 0, ten behaviours correct |
| `python3 scripts/test-news-from-issue.py` | exit 0 |
| `python3 scripts/check-i18n-drift.py` | exit 0, all translations fresh |
| `bash scripts/check-links.sh --internal` | exit 0, 41,813 internal references resolved |
| `node --check` on both new scripts | exit 0 |
| `git diff --check` | exit 0 |

The local build reported unavailable remote dashboard/status feeds and used their existing fallbacks. The shallow clone omitted sitemap last-modified dates as designed. Browser accessibility and the full external-link check were not executed locally. Their GitHub PR results must be read separately, rather than inferred from this table.

## False positives and limits

Missing, null, empty and whitespace-only country fields remain allowed. Case, surrounding whitespace and declared aliases are accepted. The templates' fallback is unchanged, so incomplete data can still render locally. Publishing a non-empty new country now requires adding its alias and SVG. A deliberately non-country or composite label would be rejected and requires an explicit data-policy decision rather than a guessed flag.

All advertised mapping codes are checked, including unused ones. Removing an unused SVG therefore requires removing its aliases too. This is intentional consistency checking. The check validates file presence, not SVG artwork, nationality accuracy or visual rendering. It is not a general image crawler and does not prove every future template emits a flag. Direct administrative bypasses and production delivery remain governed by the existing repository rules. The issue should remain open until the maintainer reviews the PR and its checks.
