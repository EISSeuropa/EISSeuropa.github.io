# Internship and volunteering handbook

For people who have joined the EISS as a volunteer or on a
*convention de stage*, and want to know how the work is actually done.
[/internship.html](https://eiss-europa.com/internship.html) covers the
terms of the placement, what you get out of it, and the shape of the
year. This file covers everything operational, and it is the one to
come back to once the induction call is over.

English only. Rule §1 of `CLAUDE.md` forbids machine translation, and
this file changes every cycle, so hand-translating it into French and
German would be a permanent cost for no reader benefit. The public page
is translated. This is not.

---

## Your first week

**Nothing here is a test.** If a step does not work, say so and we fix
it. That is the whole of the expectation.

1. **You have a point of contact.** They wrote to you when you joined.
   Ask them anything, including whether something is worth doing at
   all. There is no question that is too basic, and there is no
   check-in you are failing by not sending.
2. **Send us your GitHub account name.** We add you to the repository
   with it. If you have never used GitHub, say so. We set it up with
   you on a call, and it is not a prerequisite for anything.
3. **Put the weekly call in your calendar.** It is short. Missing one
   is fine and needs no explanation.
4. **Have a look around the corpus.** [The Anthology](https://eiss-europa.com/anthology.html)
   is what most of the work here touches. Ten minutes clicking through
   it will make the task list mean something.

## Claiming a task

Open work lives on the
[`help wanted` label](https://github.com/EISSeuropa/EISSeuropa.github.io/labels/help%20wanted).
Everything there is real outstanding work with a tracked issue behind
it. None of it is an exercise invented for a volunteer, and if we run
out of real work we will tell you rather than making some up.

**To take something**, comment on the issue or pull request saying you
are picking it up. That is the whole protocol. Nobody assigns you work
you did not choose.

**When you get stuck**, say so early rather than late. A question after
twenty minutes costs the project nothing. A week of quiet silence costs
it a volunteer, which is the failure mode we actually see.

**To hand something back**, comment saying you would rather not carry
on with it. No reason needed, and it counts against nothing. Work you
started and stopped is still work you did, and we would rather know
than have it sit there looking claimed.

## The two review jobs, in detail

Both are open pull requests waiting on a named person. Both are
judgement work, which is why they are waiting on a person rather than
being merged.

### PR #1264 — the ROR affiliation matches

The corpus holds 389 distinct affiliation strings as the authors wrote
them. `scripts/match-ror.mjs` resolves them against the
[Research Organization Registry](https://ror.org), which gives each
institution a stable identifier and, usefully, a country. That is what
finally makes questions about the geography of the corpus answerable.

The automated pass accepted 291 of 389 and left 98 for review.

**The thing to understand before you start: the confidence score is not
a proxy for correctness.** Two errors are already sitting in the
*accepted* set:

- `Geschwister-Scholl-Institute for Political Science` matched an
  unrelated Hungarian institute at 0.97. It is LMU Munich.
- `European University Institute, Italy / Paris 1` matched the EUI
  alone, silently dropping the French half of a dual affiliation.

And in the review tail, 26 entries have a top candidate scoring 0.99 or
better that ROR itself declined to choose. Some of those are wrong in a
way the high score conceals:

- `European Council of Foreign Relations` matched `European Council`.
- `European Union Institute for Security` matched `European Union`.

Those are different organisations. So reading the score and clicking
accept produces confident wrong numbers on the site, which is worse
than the honest "we do not know" it would replace.

**Two rules the review has to hold**, both settled in #1248:

- The programme string stays authoritative and is what renders on the
  site. The ROR match is an annotation next to it, never a replacement.
  Affiliations are historical and ROR is current, so resolve the
  institution as printed and do not update anyone to where they work
  now.
- An unmatched string resolves to `null`, explicitly. No guessing.
  Anything derived from this mapping has to be able to state its own
  coverage, and a guess breaks that.

The tail is defence academies, ministries and think tanks, which is
exactly the set an automated matcher is worst at. Expect to search for
the institution rather than recognise it.

### PR #1265 — the French abstract translations

Thirty-six papers have a French-affiliated author and thirteen of those
carry an abstract. The pull request holds draft French for all
thirteen, held back from the site until a French speaker signs them
off.

Two things to know before reading them.

**These are EISS translations, not the authors' words.** The English
abstract stays authoritative and is what the site renders. Whether an
author should be asked before we publish a French version of their own
abstract is still open in #1224.

**Five of the thirteen English originals are themselves defective**,
and each is flagged per slug under `sourceIssues` rather than quietly
smoothed over:

| Paper | Defect |
|---|---|
| Nuclear Futures (2026) | Switches person mid-text |
| Multilateral Maritime Exercises (2024) | Garbled clauses and a stray parenthesis |
| Changing Threat Perceptions (2023) | Truncated, stops mid-argument |
| Climate Change and the US Military (2019) | Grammatical error in the source |
| Norway and the Arctic (2019) | An escaping artefact in the text |

The drafts translate for sense rather than reproducing the errors.
**That is a judgement you are expected to be able to overrule**, which
is the reason each one is flagged instead of hidden. If you think a
defect should be carried across rather than tidied, say so on the pull
request.

The truncated one is worth chasing at source. The corpus is carrying a
partial abstract, which is a data problem rather than a translation
problem.

## House style

The full rules are in `CLAUDE.md` §6 and §7. The short version:

- **British English.** Not American, and not mixed within a document.
- **No em dashes and no semicolons.** Use a comma, a full stop, or
  parentheses. Both patterns read as machine-written and a careful
  reader notices.
- **No manufactured triplets.** If there are two items, write two.
- **Pick one name for a thing and reuse it.** Calling the same object
  "the script", then "the sync", then "the workflow" across three
  sentences is the most reliable tell that nobody reread the paragraph.
- **Say the thing plainly.** Short beats elaborate. Our readers are
  scholars and journalists, not developers, and none of them care how
  the site is built.

## How your writing gets published

If your track produces a brief, this is the path it takes.

1. **You agree the piece at induction.** One output per person. The cap
   is real, and it exists because our reviewing capacity is the binding
   constraint rather than your willingness.
2. **First draft before April.** Not after. Conference logistics
   absorbs the spring, and a draft that arrives in May does not get the
   attention it deserves.
3. **We read it and come back to you.** Expect substantive comments
   rather than a yes or no, and expect at least one round.
4. **We may decide not to publish a piece.** This is stated in advance
   on purpose. Anything published carries the EISS name and a permanent
   URL, so it cannot be quietly withdrawn later. A decision not to
   publish is a judgement about a text and nothing else, and it does
   not affect your credit for the rest of your work.
5. **Where deserved, we offer co-authorship** with the coordinator. It
   is offered where the contribution earns it rather than by default.

## Where your name ends up

- **A byline** on anything you write that we publish.
- **The contributors list** on the internship page, for the tracks that
  produce no byline. Indexing and data review are credited by name with
  a link to what you did. We ask before adding anyone, because a
  published name is not something you can quietly withdraw later.
- **The CHANGELOG**, per batch of work, which is the durable record in
  the repository itself.

## Where else to look

| Doc | Why you would read it |
|---|---|
| [`architecture.md`](architecture.md) | What the site is built from and how the data flows. |
| [`anthology-corpus-note.md`](anthology-corpus-note.md) | What the corpus contains, where it came from, and what it cannot support. |
| [`publication-matching.md`](publication-matching.md) | The matcher and review queue behind linking papers to published versions. |
| [`i18n.md`](i18n.md) | How French and German work here, and the drift checker. |
| `CLAUDE.md` (repo root) | Project-wide conventions. §6 and §7 are the writing ones. |
