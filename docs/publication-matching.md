# Publication matching

How an ESSC paper gets linked to the journal article or book chapter it
was later published as, so the archive reads as a "presented at ESSC,
published here" record. Tracked in
[#805](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/805).

## The shape of the problem

It is fuzzy record-linkage, not a lookup. A conference paper is often
retitled before publication, the published version appears nought to a
few years later, and prolific authors have many works. So matching is
multi-signal, anchored on the author, and **always confirmed by a human
before anything is recorded**. A wrong "published as" link is a
mis-citation on a scholarly site, which is worse than a blank field, so
the pipeline biases to under-matching (the same posture as the speaker
de-duplication in `corpus.js`).

## The pipeline

```
match-publications.mjs   →  data/publication-candidates.json   (proposals, a review queue)
        ↓ human reviews
confirm-publication.mjs  →  src/_data/paperLinks.json          (confirmed, keyed by paper slug)
        ↓ build
corpus.js merges by slug →  /papers/<slug> shows the published link + DOI
```

Two files, two roles:

- **`data/publication-candidates.json`** — the review queue. Machine
  output. Never read by the build. Safe to regenerate or discard.
- **`src/_data/paperLinks.json`** — the confirmed store. Hand-curated
  (via the confirm step). `corpus.js` merges it onto papers by slug, so
  a paper with a confirmed link gains a `/papers/<slug>` landing page
  (with a "Read the published version" link, the DOI, and a
  `citation_doi` meta tag) even when it has no abstract.

## The matcher: `scripts/match-publications.mjs`

Proposes matches into the review queue. Two phases, both fuzzy title
matches (token-set Dice) over a publication-lag year window, banded
high / review / discard. It only ever **proposes** — it does not write
`paperLinks.json`.

- **ORCID (phase 1).** For papers by a member with an ORCID iD on file
  (`src/_data/orcidWorks.json`), it matches the title against that
  member's own ORCID works. The author match is exact, so it is the
  highest-precision phase.
- **OpenAlex (phase 2).** For any paper, it resolves each author to an
  OpenAlex author, pulls their works, and title-matches against them.
  Anchoring on the author (not the title) is deliberate: a title search
  cannot find a paper that was retitled on publication, which is the
  case that matters. Homonym contamination (OpenAlex sometimes lumps two
  people under one author entity) is filtered out by the title bar.

Both sources are free and need no key (OpenAlex uses the polite pool via
a `mailto`). Author lookups and works are cached, so each distinct
author costs two requests regardless of how many papers they wrote.

```bash
node scripts/match-publications.mjs                 # ORCID only (fast, default)
node scripts/match-publications.mjs --openalex      # OpenAlex sweep (all papers; slower)
node scripts/match-publications.mjs --all           # both phases
node scripts/match-publications.mjs --openalex --since 2017 --until 2020 --limit 40
```

The queue accumulates across runs (one entry per paper slug, ORCID
preferred) and excludes papers that already have a confirmed link, so it
shrinks as matches are confirmed.

## Confirming a match: `scripts/confirm-publication.mjs`

The human-in-the-loop step. Review the queue, then record the matches
you accept:

```bash
node scripts/confirm-publication.mjs --list           # show pending candidates
node scripts/confirm-publication.mjs <slug> [<slug> ...]   # accept
node scripts/confirm-publication.mjs --reject <slug> ...   # mark a non-match
```

Each accepted slug is copied into `src/_data/paperLinks.json`. Rebuild
to surface it.

A match you have checked and decided is **wrong** should be rejected, not
just left alone: `--reject` records the (paper, doi) pair in
`data/publication-rejects.json`, and the matcher skips it from then on, so
a validated non-match does not keep coming back in the weekly queue.
Rejection is per pair, not per paper, so a genuinely better match for the
same paper can still surface later. (A match you simply have not looked at
yet just stays in the queue.)

Judge each one on the merits. A strong match keeps most of the title and
the same author across a plausible gap. A weak one shares only a theme
word and drifts in focus or by many years. The first review found one such
case: a 2019 paper on European perceptions of nuclear deterrence proposed
against a 2024 piece on European strategic autonomy — same author (Tara
Varma), shared theme, but a different work. It was rejected.

## Confidence tiers

A candidate's `band` (set by the matcher from the title score) decides how
it is handled:

- **High (title ≥ 0.80)** — a near-verbatim title by the resolved author.
  Treated as high-confidence and **auto-confirmed**
  (`confirm-publication.mjs --auto-high`): recorded in `paperLinks.json` and
  published, each carrying the "Early-access preview" badge that warns it
  may be inaccurate. Shown to the maintainer for information, who can reject
  any. (Auto-confirmed entries carry `"auto": true` in `paperLinks.json`.)
- **Review (0.50–0.79)** — titles that drifted on publication. Left in the
  queue for a human accept/reject. An optional LLM judge (Phase 3, below)
  can annotate these with an advisory verdict.

The threshold is the maintainer's chosen policy: high enough that the
auto-published set is near-exact, low enough that genuine same-title
publications are not held up.

## LLM judge (Phase 3): `scripts/judge-publications.mjs`

An optional pre-assessment of the review band, so a human reviewer sees a
verdict and a one-line rationale alongside each row instead of judging every
candidate cold. It annotates each review-band candidate with an
`llmVerdict` (`same_work`, `different_work`, or `uncertain`) plus a
rationale, weighing author identity, topical overlap, retitle plausibility,
and the publication-lag window. It looks up the conference abstract when one
is on file, and always asks the model to answer `uncertain` rather than
guess.

**Advisory only.** The judge never writes `src/_data/paperLinks.json` and
never changes a candidate's `band`. `confirm-publication.mjs` stays the only
path to a confirmed match, and the auto-high tier is untouched. Judge each
row on the merits, the same way as before, the verdict is a second opinion,
not a decision.

Gated on a secret:

```bash
node scripts/judge-publications.mjs
```

- Requires the `ANTHROPIC_API_KEY` repository secret. **Without it, the step
  is a silent no-op** (prints one line, exits 0) — the monthly sync keeps
  running clean either way.
- Optional `PUBLICATION_JUDGE_MODEL` env var overrides the model (default
  `claude-opus-4-8`).
- Idempotent: re-runs skip any candidate that already carries an
  `llmVerdict`, so it is safe to run more than once against the same queue.

`sync-publications.yml` runs the judge between the matcher and the
review-PR body composer; `publication-review-md.mjs` renders the verdict
in the review table when one is present.

**Operative path: the maintainer's scheduled routine, not the API.** The
maintainer opted against adding the `ANTHROPIC_API_KEY` secret, so the CI
step stays a no-op. Instead a weekly Claude Code scheduled task on the
maintainer's machine (Mondays, after the 07:00 UTC sync) reads the review
band, judges each unjudged candidate, and lands the same `llmVerdict`
annotations through a small auto-merged PR. Because the annotation shape is
identical, `publication-review-md.mjs` renders routine verdicts exactly as
it would API ones, and the same advisory-only constraints apply. The script
above remains as the alternative if a secret is ever added.

## Sanity-checking a match against the published abstract

The matcher scores on title + author, which can't tell a renamed-but-genuine
match from a wrong one. [`scripts/check-publication-similarity.mjs`](../scripts/check-publication-similarity.mjs)
is the abstract-level backstop: for every confirmed publication it fetches the
**published** abstract from Crossref by DOI and scores its similarity to the
**conference** abstract, flagging anything below a threshold (default `0.35`)
to read by hand.

```
node scripts/check-publication-similarity.mjs [--threshold 0.35] [--quiet]
```

It is advisory, not a gate (exit 0), like `check-abstract-coverage.mjs`. Two
limits to keep in mind: it can only score a paper that has both a conference
abstract on file and a published abstract on Crossref (Taylor & Francis often
omits the latter), and conference abstracts here carry inline citations that
depress the score, so a genuine match can still read modestly — the threshold
is a prompt to look, not a verdict.

## The scheduled refresh

[`.github/workflows/sync-publications.yml`](../.github/workflows/sync-publications.yml)
runs weekly on Mondays (and on manual dispatch): it runs the matcher,
auto-confirms the high band (`--auto-high`), and opens a PR on
`publications-sync/auto` that it **auto-merges**, so the high-confidence
matches go live and the queue is refreshed. The PR body lists the
auto-confirmed matches for information and the review band for a human
decision. When the run leaves any review-band candidates in the queue, the
PR is tagged `needs-review` so the pending accept/reject call is visible at
a glance. Auto-merging does **not** publish the review band — those stay
queue data until confirmed by hand.

## Known limitation: renamed-title publications need a manual add

The matcher anchors on title similarity, so a paper **published under a
substantially different title is invisible to the auto-confirm tier**: its
score falls well below the 0.80 high band, and often below the 0.50 review
band too, so it never surfaces in the queue. Phase 1 can still catch it when
the author is a member and the work is on their ORCID record; otherwise it
will not be found automatically.

The 2024 Best Paper Prize winner is the worked example: presented as
"Inter-alliance Security Dilemmas: Korean Counterforce Systems…" (Samuel
Seitz), published in the *Journal of Strategic Studies* as "When competition
becomes contagious…" with a new co-author (Elliot Ji). Different title,
different byline, so it had to be added by hand.

To add one manually: put the entry in `src/_data/paperLinks.json` keyed by
the paper's slug, with `doi`, `publishedUrl`, `publishedTitle`, `journal`,
`publishedYear` and `publishedAuthors` (the *published* byline, which can
add or drop authors versus the conference presenters). Set `"source":
"manual"`. The next `enrich-publications.mjs` run backfills volume / issue /
pages / BibTeX from Crossref by DOI, and the paper's page shows the
published title and "Published as" byline. Prize winners are the highest-value
candidates to check by hand, since the prize publishes them in the *Journal
of Strategic Studies* (often retitled).

## Growing coverage

- Phase 1 coverage grows as members add their ORCID iD to the directory
  Form (see [board-bios-setup.md](board-bios-setup.md)).
- Minting our own DOIs for ESSC papers is a separate, heavier option
  ([#795](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/795)).
- The LLM judge (Phase 3, above) shipped in [#805](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/805).
