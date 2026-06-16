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
node scripts/confirm-publication.mjs --list         # show pending candidates
node scripts/confirm-publication.mjs <slug> [<slug> ...]
```

Each accepted slug is copied into `src/_data/paperLinks.json`. Rebuild
to surface it. Reject a match simply by not confirming it (it stays in
the queue for a later call, or is dropped on the next matcher run).

Judge each one on the merits. A strong match keeps most of the title and
the same author across a plausible gap. A weak one shares only a theme
word and drifts in focus or by many years — leave those unconfirmed. The
first confirmed batch held back one such case (a 2019 nuclear-deterrence
paper proposed against a 2024 strategic-autonomy piece).

## The scheduled refresh

[`.github/workflows/sync-publications.yml`](../.github/workflows/sync-publications.yml)
runs the matcher monthly (and on manual dispatch), and opens a PR on
`publications-sync/auto` with the refreshed queue when it changes.
**That PR does not auto-merge** — unlike the orcid / bios / roadmap
syncs, the queue is a review surface, not data the site consumes. Read
the proposals, confirm the good ones with `confirm-publication.mjs`, and
merge the PR only to keep the committed queue current (it does not change
the live site).

## Growing coverage

- Phase 1 coverage grows as members add their ORCID iD to the directory
  Form (see [board-bios-setup.md](board-bios-setup.md)).
- Minting our own DOIs for ESSC papers is a separate, heavier option
  ([#795](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/795)).
- An optional LLM judge for the ambiguous (review) band is a possible
  later refinement, noted in #805.
