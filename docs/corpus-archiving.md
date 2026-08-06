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

One place to edit when the DOI changes: `site.corpus` in
`src/_data/site.js`, plus the README badge (markdown, not templated).

## Cutting a new version

Zenodo's "New version" button on the record, which keeps the concept
DOI and mints a fresh version DOI.

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
