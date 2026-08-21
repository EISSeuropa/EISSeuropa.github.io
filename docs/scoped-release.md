# Scoped release: taking a surface out of early access

How the Anthology declares what is finished, and why it stopped saying
"early access" across the whole page. Written for #1499, and the model
#1224 uses for the French Anthology.

## The problem with a page-wide marker

"Finish the Anthology" is not a finishable task. The corpus grows by an
edition a year, and the older editions are recovered by hand from
programmes and author copies, so a label saying the whole thing is
provisional is a label that never comes off. A reader meets it on every
visit, learns it never changes, and stops reading it. Meanwhile it
discounts the parts that *are* finished: the 2023 to 2026 editions carry an
abstract for every paper eligible for one.

A finite scope can be finished. So the page declares one, states what falls
outside it, and a build gate keeps the declaration honest.

## The scope

`src/_data/releaseScope.js` holds it, in two halves.

**The editions are derived, never hand-maintained.** An edition is in scope
when its abstract coverage is at or above `COVERAGE_THRESHOLD`, counted over
the papers eligible for an abstract. Keynotes and roundtables are not
eligible and are excluded, which is the same rule the coverage bars on the
page use.

The threshold is not a fine judgement. The data is bimodal:

| Edition | Coverage |
|---|---|
| 2026 | 100% |
| 2025 | 100% |
| 2023 | 97% |
| 2024 | 94% |
| 2022 | 40% |
| 2019 | 39% |
| 2018 | 25% |
| 2021 | 25% |
| 2017 | 0% |

Any threshold between 41 and 94 selects the same four editions. It is set at
90 because that is a round number in the gap, not because 90 is meaningful.

**The interface is a judgement, so it is a switch.** `INTERFACE_READY` says
the chrome, the controls and the seventeen theme labels are finished work.
It is what removes the Beta pill from the Atlas.

It is `false` today, and that is a decision rather than an oversight: the
Atlas is still early-stage development (maintainer, 21 August 2026), so the
pill stays. Nothing measures this half, so nothing should flip it but a
person. When it is flipped, the gate checks the pill actually went.

The two halves are independent on purpose. The corpus can declare four
editions complete while the map that draws them is still being built, which
is exactly the current position.

## What the reader sees

The blanket notice on `/anthology.html` is replaced by a sentence naming
both sides: which editions are all but complete and at what coverage, which
are still filling in, and how many abstracts are outstanding.

The sentence says "all but complete, at 94% or better" rather than
"complete", and the 94 is derived from the weakest edition in scope. The
first draft of this work said "complete: every paper eligible for an
abstract has one", which is false for 2023 at 97% and 2024 at 94%. Replacing
a page-wide overclaim with a scoped one would have missed the point. The figures come from the same derivation as
the coverage bars below them, so the sentence cannot drift from the bars.

The sentence lives in `src/_data/i18n.js` per locale, with `{in}`, `{out}`,
`{missing}` and `{eligible}` filled at render time. The word joining two
years is a word, so it lives in the catalog too (`editionRangeJoiner`)
rather than being built in English and pasted into a French page.

## The gate

`scripts/check-release-scope.mjs`, run in `sanity-check.yml` beside the
other build gates. It asserts the claim rather than the mechanism:

1. Every edition declared complete is still at or above the threshold. A
   newly ingested paper without an abstract, or a change to what counts as
   eligible, can push a declared edition back under it with a green build and
   nothing visible on the page.
2. The built page names the same editions the data declares, so a
   hand-edited sentence cannot drift from the source.
3. When the interface is declared ready, the Beta pill is actually gone.

Both halves were verified by breaking them deliberately: declaring 2022
complete fails on coverage, and lowering the threshold to 20 fails on drift.

## Extending or retiring a scope

- **An edition joins on its own** once its coverage crosses the threshold,
  because the list is derived. Nothing to edit.
- **To declare the interface ready**, set `INTERFACE_READY` to `true`. The
  pill goes and the gate starts checking that it did.
- **To retire the model entirely**, when every edition is complete: the note
  reduces to one clause and the gate can go with it.

## Related

- #1499, this model.
- #1224, the same problem on the French Anthology, where the scope is a set
  of strings rather than a set of editions.
- #1498 and #886, the abstract recovery that moves editions into scope.
