# Archiving the Anthology corpus

How the Anthology is deposited outside this repository, so it can be
cited and so it outlives the website. Tracked in
[#1221](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1221)
(Zenodo) and
[#1222](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1222)
(HAL).

## The two DOIs, and which one to use

Zenodo mints **two** DOIs for the same record, and they are not
interchangeable:

| DOI | Points at | Use it for |
|---|---|---|
| `10.5281/zenodo.21776209` | **Concept.** Always resolves to the newest deposited version. | Everything. Citations, the README badge, the site. |
| `10.5281/zenodo.21776210` | **Version.** Pinned to `v2.26.0` forever. | Only when a reader must reach that exact snapshot. |

The concept DOI is the one in `src/_data/site.js` (`site.corpus.doi`)
and the one the README badge links. **Do not cite the version DOI**: a
reference minted against it silently goes stale the moment the next
version is deposited, and the reader lands on an old corpus with no
signal that a newer one exists.

The record lives in the `eiss` Zenodo community, typed **Dataset**,
licensed CC BY 4.0.

## Where the DOI surfaces

- `README.md` — the badge at the top.
- `/anthology.html` (+ FR + DE) — the "Cite this corpus" disclosure in
  the page header, rendered by `src/_includes/archive-page.njk` from
  `site.corpus`. The reference string stays in English in every locale:
  a bibliographic reference is reproduced, not translated. Only the
  surrounding chrome is in `i18n.js` → `navigator.cite*`.

- `/licensing.html` (+ FR + DE) — a "Citing the Anthology" section with the
  same reference, the concept DOI, and a pointer to the HAL record. It
  renders from `site.corpus` too, so it cannot drift from the Anthology
  block.

The "Cite this corpus" disclosure lists all three deposits, one row each:
the Zenodo DOI, the HAL note, and the Software Heritage SWHID of the code
that builds the corpus. They share the `.cite-corpus-doi` row so the panel
reads as one list.

One place to edit when the DOI changes: `site.corpus` in
`src/_data/site.js`, plus the README badge (markdown, not templated).
`site.corpus` also holds `halId` and `halUrl`, so the HAL reference has
a single source in the same way.

## Citation metadata: saving the page into a reference manager

The three Anthology pages set `corpusMeta: true` in their front matter,
which makes `src/_layouts/base.njk` emit a Highwire `citation_*` block
plus two Dublin Core tags in the head. A reader who clicks the Zotero
connector on `/anthology.html` gets the deposited dataset, with the
title, author, year, publisher, DOI, abstract, language and rights the
"Cite this corpus" panel prints, rather than a bare web-page record.
The fields come from `site.corpus`, so they cannot drift from the
reference string beside them. They stay in English on the FR and DE
pages: what is described is one English-language dataset, whichever
page you save it from.

**The item type is the fragile part.** Zotero resolves it in the
Embedded Metadata translator, then the RDF one, in this order:

1. a type-forcing Highwire tag (`citation_journal_title`,
   `citation_conference_title`, `citation_technical_report_institution`,
   `citation_book_title`, `citation_inbook_title`,
   `citation_dissertation_institution`),
2. `eprints.type`,
3. `og:type`,
4. `DC.type`.

This site emits `og:type=website` on every page, which on its own files
the save as a web page and loses the `[Data set]` framing and the DOI.
`eprints.type=dataset` outranks it, and is the reason a save comes back
typed as a dataset. `DC.type=Dataset` says the same in the vocabulary
everything else reads. Zotero 6 has no dataset type and lands the save
as a document instead, which is the intended fallback.

Adding a forcing tag to that block would silently retype every save
with a green build and no visible change on the page, so
`scripts/check-build-sanity.mjs` asserts the forcing tags stay absent
and `eprints.type` stays present. If the deposit is ever retyped, for
instance to a report, change it there deliberately rather than by
adding a tag.

## Cutting a new version: the procedure

**Start here whenever the dataset is updated.** The single step most
easily forgotten is the first one: the files on Zenodo are a *generated*
export, not the live corpus, so they do not update themselves when the
site does. Depositing without regenerating ships the previous edition's
numbers under a new version label.

1. **Regenerate the export.**

   ```bash
   node scripts/export-corpus-json.mjs
   ```

   Writes `data/anthology-corpus.json` (gitignored) and prints the
   headline counts. Check them against the previous deposit before going
   further: if the paper, author or abstract counts have not moved, there
   may be nothing to deposit.

2. **Regenerate the corpus-description note's figures.** Every number in
   [anthology-corpus-note.md](anthology-corpus-note.md) is a statement
   about one version, and the note says so. Update the counts, the three
   tables (editions, themes, per-year coverage) and the "Corpus state"
   date in the header from the export. Do not hand-edit a figure without
   checking it against `data/anthology-corpus.json`.

3. **Rebuild the note PDF** for the HAL deposit.

   ```bash
   ./scripts/build-corpus-note-pdf.sh
   ```

4. **Cut the Zenodo version.** Use the record's "New version" button,
   which keeps the concept DOI and mints a fresh version DOI. Attach the
   regenerated JSON. Files cannot be changed on an already-published
   version, so any file correction requires a new version.

5. **Set the version metadata.** See the cadence question below, plus a
   `Collected` date range covering the corpus span and an `Updated` date
   for the deposit itself.

6. **Update the HAL record** with the new note PDF, keeping the concept
   DOI as the related identifier.

7. **Check whether the DOI changed.** It should not: the concept DOI is
   stable across versions. If it ever does, `site.corpus` in
   `src/_data/site.js` and the README badge are the two places to edit.

### What the export contains

One self-describing JSON file, so a reuser needs no interpreter:

| Key | Holds |
|---|---|
| `meta` | DOI, licence, canonical attribution, generation date, coverage years, headline counts, and the four caveats a reader has to know. |
| `editions` | One row per edition: key, label, year, paper count. |
| `themes` | The 17 themes: stable key, per-locale labels (EN/FR/DE), paper count, speaker count. |
| `coverageByYear` | Per year: papers, papers eligible for an abstract, papers with one, percentage. |
| `papers` | 511 rows. Title, authors, affiliations, year, panel, theme keys, abstract, published URL and DOI, prize, URLs. |
| `authors` | 494 rows, deduplicated. Name, affiliation, theme keys, paper count, first and last year, profile URL. |

Theme references are the **stable keys**, not display labels, so
`papers[].themeKeys` joins to `themes[].key` and survives a label being
retranslated.

**One trap the script deliberately avoids.** It does not use
`paperIndex.stats.editions`. That field counts distinct `programmeUrl`,
and the string carries a per-paper `#anchor`, so it reports 509
"editions" for 511 papers. `corpus.stats.editions` (12) is the real
count, which is why the site renders that one. Anything else deriving
edition counts should do the same.

The script is **not** wired into the Eleventy build. Deposits happen by
hand a couple of times a year, so a build step firing on every commit
would be waste. The published, build-time export with its data
dictionary and licence note on `/licensing` is a separate piece of work,
tracked in
[#641](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/641).

### The cadence

**Open question, not yet settled.** The current deposit is versioned
`v2.26.0` and dated 25 June 2026, which follows this repo's SemVer
rather than the conference calendar. #1221 specified one version per
**annual edition**, cut once that edition's programme is complete.
Those two cadences disagree, and the site has already shipped releases
past v2.26.0. Settle it in #1221 before the next deposit:

- **Per edition** — one version a year, each a stable citable state of
  the corpus. Fewer, more meaningful versions. The deposit then carries
  an edition label, not a site version.
- **Per site release** — matches the attached files to a known build,
  but mints versions that say nothing about the corpus, and needs
  re-depositing on a cadence nobody will keep up.

## Known gap: the deposited files

The record currently attaches `corpus.js` and `paperIndex.js`, the raw
Eleventy data modules. They are JavaScript, so reading them means
running Node and knowing the module shape. That is not a dataset in any
useful sense, and a record typed *Dataset* should not need an
interpreter.

The fix is the machine-readable export in
[#641](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/641)
(JSON/CSV of the corpus), with the analytical layer in
[#1227](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1227).
Once that export exists, deposit it in place of the `.js` files. Until
then the record is honest about what it holds (its description says the
files are "raw JS files, included for archiving purposes") but it is not
yet reusable.

## HAL

[hal-05711925](https://hal.science/hal-05711925) holds the
**corpus-description note** ([anthology-corpus-note.md](anthology-corpus-note.md)),
typed **Research report** (`REPORT`). The data itself stays on Zenodo.
That split is deliberate: HAL takes the readable description, Zenodo
takes the dataset, and the two reference each other. It is the standard
data-paper arrangement for an archive that does not accept datasets.

The record was first deposited as conference *proceedings* and retyped
to Research report on 6 August 2026. Proceedings was the wrong claim:
it asserts an edited volume of conference papers that does not exist,
and it implies EISS published papers whose rights sit with their authors
and their journals.

**Collections.** The record sits in eight HAL collections, all assigned
automatically from its type and its subject domains: `SHS`, `LARA`
(HAL's portal for scientific and technical reports, which the Research
report typing earned it), `AO-SCIENCEPOLITIQUE`, `AO-HISTOIRE`,
`AO-ECONOMIE`, `AO-SOCIOLOGIE`, `HISTOIRE` and `SOCIOLOGIE`.

None of those is a **dedicated EISS collection**, which is what #1222
originally asked for. A collection of that kind needs a structure
registered in AuréHAL, and that is not available to the association at
present. The door is not permanently shut: an association can in
principle be registered as an organisation rather than a laboratory, so
this is deferred rather than refused.

Worth an occasional check: the economics, sociology and history domains
came from the subject classification at deposit time. If those are
broader than intended, narrowing them changes which disciplinary portals
surface the record.

**Two things still wrong on that record**, both small:

1. It cites `10.5281/zenodo.21776210`, the **version** DOI. It should
   cite the concept DOI, `10.5281/zenodo.21776209`, for the reason given
   at the top of this document.
2. No licence is set. The note is CC BY 4.0, like everything else in the
   deposit chain, and the record should say so.

The reverse link is also missing: the Zenodo record carries no related
identifier pointing back at the HAL record, so the pairing is currently
visible from one side only.

## Software Heritage: the code, not the corpus

The **source code** is archived separately from the corpus, in
[Software Heritage](https://www.softwareheritage.org/), the universal
archive of software source code. This is a different object from the
dataset and carries a different kind of identifier.

SWHIDs are *intrinsic*: computed from the content itself rather than
assigned by a registry, so they can be verified offline and survive the
repository being renamed, transferred or deleted.

| SWHID | What it pins |
|---|---|
| `swh:1:dir:482a1c89d5fa36abcd5719d994c1261ce31c602e` | The **directory**, the file tree as archived. This is the one displayed. |
| `swh:1:rev:1a8ca570193389c2ac9a603accfe4db1765f4898` | The **revision**, the specific commit. |
| `swh:1:snp:fe6fce477add39ff7d70595c1dc8c6788f2e235e` | The **snapshot**, the state of all branches at visit time. |

Archived from `https://github.com/EISSeuropa/EISSeuropa.github.io`.

### Where the SWHID surfaces

- `README.md`, as a badge next to the DOI badge.
- `/licensing.html` (+ FR + DE), in the MIT code section, with a sentence
  explaining what it identifies.
- `/anthology.html` (+ FR + DE), as the third row of the "Cite this corpus"
  disclosure.

Both pages render it from `site.corpus.swhid` / `site.corpus.swhidUrl`, so
refreshing the identifier is one edit in `src/_data/site.js` plus the README
badge.

### The badges are checked-in copies

The three stickers on the README and at the foot of the "Cite this corpus"
panel (Zenodo DOI, archived repository, archived source tree) are static
SVGs in `src/assets/images/badges/`, not hotlinks. Zenodo rate-limits
GitHub's image proxy, which returned 429 often enough that the DOI badge
rendered as a broken image on the README, and hotlinking on the site would
have added a third-party request for every visitor on top of that.

The cost is that they no longer refresh themselves. Re-fetch them in the
same release-time pass that re-collects the SWHID:

```bash
cd src/assets/images/badges
curl -sSo zenodo-doi.svg "https://zenodo.org/badge/DOI/<concept DOI>.svg"
curl -sSo swh-origin.svg "https://archive.softwareheritage.org/badge/origin/https://github.com/EISSeuropa/EISSeuropa.github.io/"
curl -sSo swh-dir.svg "https://archive.softwareheritage.org/badge/<SWHID>/"
```

Zenodo answers an empty user agent with a 403, so keep curl's default one.

### When to refresh it

**Re-collect the directory SWHID at each release**, not on every commit.
Software Heritage re-visits the repository on its own schedule, so the
archive keeps up without being asked. What ages is the *published*
identifier: leave it and the site will keep pointing at a 2026 file tree
indefinitely.

Practically, this belongs in the release-time §5 sweep. Load the origin
in Software Heritage, take the current directory SWHID, and update
`site.corpus` plus the README badge if it has moved. An identifier that silently ages is
worse than none, because a reader has no way of telling.

### Not the same as the Zenodo GitHub integration

Zenodo's GitHub integration is deliberately **off**. It would mint a
separate software DOI on every release, competing with the corpus DOI
and producing a permanent record per release from a 117 MB repository,
with default metadata. Software Heritage archives continuously, mints no
DOI, and is the identifier HAL accepts for a software deposit. That is
why this is the route taken.
