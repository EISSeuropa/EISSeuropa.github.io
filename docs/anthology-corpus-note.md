# The European Security Studies Anthology: a corpus description

**European Initiative for Security Studies**
Corpus state: 5 August 2026. Data: <https://doi.org/10.5281/zenodo.21776209>. Live: <https://eiss-europa.com/anthology.html>

---

## Abstract

The Anthology is a structured record of every paper presented at a
conference or workshop of the European Initiative for Security Studies
(EISS) since the association's first meeting in January 2017. It holds
**511 papers** by **494 authors** across **12 editions**, each paper
tagged against a controlled vocabulary of **17 research themes**, with an
abstract on file for **292 of the 492 papers eligible for one**.

One feature of the corpus governs how it can be used, and I put it first
rather than in a footnote. Documentation is not uniform across the
period. Abstract coverage runs at 100 per cent for the 2026 and 2025
editions and at zero for 2017, and that discontinuity tracks a change of
conference management system rather than any change in scholarly
activity. A reader who treats the corpus as an evenly documented series
will mistake an artefact of record-keeping for a finding about the field.

In what follows I describe what the corpus contains, how I assemble it,
what it cannot support, and how to cite it. The data itself is deposited
separately as a dataset under CC BY 4.0.

## Résumé

L'Anthologie est le relevé structuré de chaque communication présentée
lors d'une conférence ou d'un atelier de l'Initiative européenne pour les
études de sécurité (EISS) depuis la première rencontre de l'association
en janvier 2017. Elle rassemble **511 communications** de **494 auteurs**
réparties sur **12 éditions**, chacune indexée selon un vocabulaire
contrôlé de **17 thèmes de recherche**, un résumé étant disponible pour
**292 des 492 communications qui peuvent en comporter un**.

Une caractéristique du corpus détermine l'usage que l'on peut en faire,
et je la place en tête plutôt qu'en note. La documentation n'est pas
homogène sur la période. La couverture des résumés atteint 100 pour cent
pour les éditions 2026 et 2025 et zéro pour 2017, et cette discontinuité
suit un changement de système de gestion des conférences, non une
évolution de l'activité scientifique. Qui tiendrait le corpus pour une
série uniformément documentée prendrait un artefact d'archivage pour un
résultat sur la discipline.

Je décris dans ce qui suit le contenu du corpus, la manière dont je le
constitue, ce qu'il ne permet pas d'établir, et comment le citer. Les
données elles-mêmes font l'objet d'un dépôt distinct, sous licence
CC BY 4.0.

## 1. What the corpus is, and is not

It is a record of what was *presented*, drawn from the conference
programmes. It is not a proceedings volume and does not publish the
papers. Where a paper later appeared in a journal or an edited volume,
the corpus links to that published version rather than reproducing it:
**51 papers** currently carry a link and a DOI to their published form.

The unit of record is a paper as it appeared on a programme, with its
title, its authors, their affiliations as given at the time, the panel it
sat in, and the edition it belonged to. Rights in the papers themselves
remain with their authors and their eventual publishers.

## 2. Scope and coverage

Twelve editions, spanning 2017 to 2026. Nine are annual conferences and
three are joint events held with partner institutions.

| Year | Edition | Papers |
|---|---|---:|
| 2026 | Annual conference, Stockholm | 70 |
| 2025 | Annual conference, Thessaloniki | 44 |
| 2024 | Annual conference, Prague | 53 |
| 2024 | Joint Sciences Po–EISS Conference, Paris | 8 |
| 2024 | Joint Conference on the War in Ukraine | 2 |
| 2023 | Annual conference, Barcelona | 59 |
| 2022 | Annual conference, Berlin | 47 |
| 2021 | Annual conference, Lisbon | 41 |
| 2019 | Annual conference, Paris | 58 |
| 2019 | Joint Policy Workshop, with the NATO Defense College | 10 |
| 2018 | Annual conference, Paris (Panthéon-Assas) | 82 |
| 2017 | Inaugural conference, Paris (Panthéon-Assas) | 37 |

**There is no 2020 edition.** The conference planned for September 2020
was deferred because of the COVID-19 pandemic and held in 2021 at
ISCTE-IUL, Lisbon. The corpus records it under 2021, so a reader counting
years will find a gap where none exists in the sequence of meetings.

The annual conference carries the label `EISS` in the data for the 2017
to 2025 editions and `ESSC` from 2026, following its renaming to the
European Security Studies Conference.

## 3. How the corpus is assembled

I generate the corpus at build time from the conference programmes
themselves. I do not maintain it by hand as a separate database, so a
correction to a programme propagates to every view of it and the record
cannot silently drift away from the source it claims to describe.

Sources differ by era. This is the single most important thing to know
about the data, and it explains the coverage pattern in section 6:

- **2023 onwards** synchronise from Indico, the conference management
  system the association uses. Titles, authors, affiliations, panels and
  abstracts come from what presenters themselves submitted.
- **2017 to 2022 pre-date that system.** Those programmes were
  transcribed from the published documents, and their abstracts are being
  recovered edition by edition from the organisers' proposal and
  submission files.

A third path exists for papers that ran as subcontributions of a panel.
The Indico export interface exposes no description at that level, so
those abstracts are added from the panel convener's own file. This is why
recent editions can be complete on paper counts while still missing
abstracts.

## 4. The theme vocabulary

Every paper is tagged against a fixed vocabulary of 17 themes. Nine are
the permanent panel sections the association organises its calls around.
Eight were derived from the recurring subjects of the open-panel
remainder.

Each theme carries a stable, language-independent key, so the display
label can be translated without breaking the tagging. Labels exist in
English, French and German.

| Theme | Papers |
|---|---:|
| Transformations of warfare and conflict | 76 |
| Emerging domains: cyber and technology | 76 |
| Defence cooperation and military assistance | 68 |
| European and transatlantic security | 49 |
| Military interventions | 48 |
| Deterrence | 46 |
| Private military actors | 44 |
| Regional security and area studies | 42 |
| Non-proliferation and arms control | 38 |
| Arms acquisition and transfer | 35 |
| Terrorism and counter-terrorism | 34 |
| Intelligence | 29 |
| Theoretical developments in security studies | 25 |
| Civil–military relations and the armed forces | 19 |
| Political economy of security | 12 |
| Climate and security | 10 |
| Gender and security | 6 |

**How a paper gets its themes, and why this matters.** I match themes
against the title of the *panel* a paper sat in, not against the paper's
own title or abstract. Every paper on a panel therefore inherits that
panel's themes. A paper may carry more than one: **132 papers** do.

I have kept the rule set deliberately conservative. Where a panel title
matches no rule, I leave its papers untagged rather than force them into
an approximate bucket, which is why **29 papers** carry no theme at all.
I would rather under-claim than tag confidently and wrongly.

Those 29 are not one kind of thing, and `scripts/untagged-papers.mjs`
prints them split by what could be done about each. Eight are keynotes,
roundtables and opening remarks, which are not papers. Eight are poster
sessions. Eight sat on 2019 panels titled only "Session I" to "Session
IV", where the panel title carries no subject at all and only an abstract
could have tagged them. The remaining five sat on two panels whose
subject the vocabulary does not cover: the evolutionary anthropology of
war, at the 2024 joint conference, and the domestic politics of security
and defence, in 2019. Both are boundaries I am content with rather than
gaps I intend to close.

This has a consequence I want to state plainly, because the table above
invites the opposite reading. These counts are a reliable floor on each
theme's presence in the corpus. They are not a measurement of what
European security studies is about, and they should not be cited as one.
Panel-level inheritance makes the tagging coarser than abstract-level
classification would be, and the 511 papers resolve to only 92 distinct
theme combinations. A finer-grained classification drawn from abstract
text is possible for the 294 papers that now carry an abstract, and I
have not attempted it here.

## 5. Authors and co-authorship

The corpus holds 494 distinct authors after deduplication.

Most appear once. **397 authors** have a single paper in the corpus, 60
have two, 22 have three, 10 have four, and 5 have five or more, the
largest being 7. **89 authors** appear in more than one year, which is
the closest the data comes to a measure of a returning community.

Security studies as practised at these conferences is predominantly
single-authored: **408 of 511 papers** have one author, 75 have two, and
27 have three or more, the largest being six.

Co-authorship none the less forms a visible structure. The corpus records
**184 co-author pairs** among **194 authors**, leaving **300 authors**
with no co-author in the corpus. Those pairs resolve into **64 separate
clusters**, the largest containing 17 authors and the second 12. Only
**10 pairs** co-wrote more than once.

I record affiliations as free text exactly as given on the programme,
which produces **389 distinct affiliation strings** across 511 papers. I
have not reconciled them to a controlled list of institutions, and I have
inferred no country from them. Any analysis by institution or by country
therefore requires a normalisation step the corpus does not yet provide,
and I would treat any such figure derived from these strings as
unreliable until it does.

## 6. Abstract coverage

**292 of the 492 papers eligible for an abstract carry one**, or 59 per
cent. Nineteen entries are not eligible: keynotes, roundtables, posters
and workshop sessions do not have submitted abstracts, and are excluded
from the ratio rather than counted as gaps.

Coverage tracks the change of source described in section 3 almost
exactly:

| Year | Eligible | With abstract | Coverage |
|---|---:|---:|---:|
| 2026 | 70 | 70 | 100% |
| 2025 | 41 | 41 | 100% |
| 2023 | 59 | 57 | 97% |
| 2024 | 52 | 49 | 94% |
| 2022 | 47 | 19 | 40% |
| 2019 | 66 | 26 | 39% |
| 2021 | 40 | 10 | 25% |
| 2018 | 81 | 20 | 25% |
| 2017 | 36 | 0 | 0% |

The recent editions are effectively complete. The earlier ones are an
active recovery effort, and the 2017 edition holds no abstracts at all.
The 2022 and 2019 figures, at 40 and 39 per cent, are the current
frontier of that work rather than a settled state.

My recommendation follows directly. Anyone using abstract text as an
analytical input should treat the corpus as covering 2023 onwards and
treat the earlier editions as a programme-level record of who presented
what. Mixing the two produces a series in which the apparent volume of
scholarship on any theme rises sharply after 2022, and that rise would be
an artefact of the sources described in section 3.

## 7. Known limitations

I state these plainly, because they bound what the data can support:

1. **Author matching is conservative.** I normalise names to a comparison
   key. A person appearing under noticeably different spellings across
   editions may still surface as two authors. The deduplication errs
   towards splitting rather than wrongly merging two different people,
   which means the count of 494 authors is an upper bound.
2. **Themes are panel-level**, as described in section 4.
3. **Affiliations are unnormalised free text**, as described in section 5.
4. **Abstract coverage is uneven by design of the sources**, as described
   in section 6.
5. **Paper counts are deduplicated.** An entry appearing twice in a
   programme, such as a poster shown on both days, is counted once. Raw
   programme totals will therefore run slightly higher.
6. **Presentation is not publication.** A paper in the corpus was
   presented. It may never have been published, and absence of a
   published link does not establish that it was not.

## 8. Availability, licence and citation

The corpus is deposited on Zenodo as a dataset under Creative Commons
Attribution 4.0 International, and is browsable at
<https://eiss-europa.com/anthology.html>, where it can also be read as an
interactive map of papers, authors and themes.

Cite it as:

> Laudrain, A. (2026). *The European Security Studies Anthology* [Data
> set]. European Initiative for Security Studies.
> <https://doi.org/10.5281/zenodo.21776209>

That DOI is the **concept DOI**: it always resolves to the most recent
deposited version. Each version also receives its own DOI, which should
be used only when a reader must reach one exact snapshot.

Abstracts are reproduced as submitted by their authors. Rights in the
papers and in their published versions rest with the authors and their
publishers, and are not covered by the licence on the dataset.

## 9. Versioning, and what comes next

The corpus grows as each edition is added and as the recovery of earlier
abstracts continues, so every figure in this note is a statement about
one version. The figures here describe the corpus as of 5 August 2026:
511 papers, 494 authors, 12 editions, 292 abstracts. I cut a new
deposited version as the corpus reaches a stable state, and the concept
DOI resolves to the most recent one.

Three lines of work will change what the corpus can support, and I set
them out so that a reader can judge when to return to it.

The first is the recovery of the pre-2023 abstracts, which is the
binding constraint on everything else. Until 2017 to 2022 are documented
at something approaching the 2023 to 2026 level, the corpus supports
descriptive work on the full period and analytical work only on the
recent editions. The second is the normalisation of the 389 affiliation
strings to institutions and countries, which is what would make questions
about the geography of the field answerable at all. The third is a
thematic classification drawn from abstract text rather than panel
titles, which would replace a floor with a measurement.

Two smaller notes for anyone using the data. Four papers carry the
European Security Studies Prize, awarded with the *Journal of Strategic
Studies*, across the 2024, 2025 and 2026 editions. Fifty-one papers link
to a published version with a DOI, which is a lower bound on how much of
this scholarship reached print rather than a count of it: I add those
links as I find them, and I have not searched systematically for the
earlier editions.
