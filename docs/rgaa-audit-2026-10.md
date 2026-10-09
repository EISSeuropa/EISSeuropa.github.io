# RGAA 4.1.2 self-audit, October 2026

The criterion-by-criterion record behind §8 of `/accessibility.html` (#1225). The page states **partially conformant** until the screen-reader checks in #1796 have been run. Improvements the audit noted without failing anything are in #1797. When the declaration changes, update `src/_data/rgaaAudit.json` and this file together.

## Result

| | Conformant | Non-conformant | Not applicable | Rate |
|---|---|---|---|---|
| First pass, 8 October 2026 | 51 | 33 | 22 | 60.71 % |
| After the fixes, 9 October 2026 | 84 | 0 | 22 | 100 % |

The rate is the RGAA global rate: conformant criteria divided by applicable criteria (conformant plus non-conformant), over the whole sample. A criterion is non-conformant if any of its tests fails on any sampled page, and not applicable if no sampled page contains what it targets.

## Sample

Built to the RGAA method: the mandatory page types first, then one page of each distinct template and every page carrying a process, a form, a media player, a data table or a scripted component.

| Page | Why it is in the sample |
|---|---|
| `/` | Accueil (mandatory) |
| `/accessibility.html` | Déclaration d'accessibilité (mandatory) |
| `/sitemap.html` | Plan du site (mandatory) |
| `/policy.html` | Privacy notice, legal information (mentions légales equivalent) |
| `/terms.html` | Terms and conditions (legal) |
| `/2026.html` | Current conference: live programme grid, registration badge, PDF embed |
| `/2027.html` | Next conference: venue card, call for papers |
| `/2025.html` | Past conference with film, photo gallery, media block |
| `/2021.html` | Archive conference template with archive programme list |
| `/past.html` | Conference archive index |
| `/board.html` | Board directory with hovercards |
| `/board/alisa-kerschbaum.html` | Generated board profile template |
| `/anthology.html` | Anthology: filters, stats, by-paper panel |
| `/papers/2018-a-weapon-of-the-weak-cyberwarfare-and-china-s-threat-perception.html` | Generated paper page with abstract and citation downloads |
| `/anthology-atlas.html` | Atlas canvas, filters, tour, list alternative |
| `/anthology-atlas/theme/arms-acquisition-and-transfer.html` | Generated Atlas theme page |
| `/news.html` | News listing |
| `/blog.html` | Blog / Belvedere page |
| `/membership.html` | Membership process page |
| `/register.html` | Registration process page |
| `/speakers.html` | Speakers index with search field |
| `/publications.html` | Publications with filter form |
| `/press-kit.html` | Press kit: downloadable logos |
| `/index.fr.html` | French locale variant of the home page |
| `/404.html` | Error page |
| `/assets/files/EISS-2026-programme.pdf` | The downloadable document offered on `/2026.html` |

## Method

- **Browser.** Headless Google Chrome driven over the DevTools protocol, serving the built `_site/`. Each page was read at 1280px in light and dark and at 320px, with 640px standing in for 200 % zoom.
- **Per page, recorded once.** axe-core 4.13 violations and incomplete items in the three configurations, Chrome's computed accessibility tree, the DOM facts each criterion needs (images and their alternatives, frames, media, tables, fields and labels, links, roles, landmarks, headings, language changes), the real Tab order from top to bottom with the focus style at each stop, overflow at 320px and 640px, and clipping under WCAG 1.4.12 text spacing.
- **Per criterion.** Five auditors each took a slice of the 13 themes and ran every RGAA test on every page, probing further with live key presses and computed styles where the recorded facts did not settle a test. Contrast for non-text elements was computed from rendered colours.
- **Re-test.** After the fixes a separate pass re-ran every failed criterion on the rebuilt site, adversarially, and looked for anything the changes broke. Six criteria failed again, were fixed, and were checked a third time. Every top-level page in English, French and German was then measured at 320px.
- **Not done.** No screen reader, no voice control and no Nu HTML validator. Tests about what assistive technology announces were judged from the accessibility tree. The checks a person should repeat are listed in #1796.

## Grid

C conformant, NC non-conformant, NA not applicable. The first column links each criterion to its official text.

### 1. Images

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1) | NC | C | Home map: all city links named (verifier). Atlas canvas: role=application with a localised aria-label, and immediately followed by a.atlas-list-jump, a link that opens the table of the current view (test 1.1.8, third condition). Checked live: canvas.nextElementSibling is the link, clicking it opens #atlas-list. |
| [1.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.2) | NC | C | Board placeholders (21 on /board.html) are now div.person-photo-placeholder[aria-hidden=true] without role/aria-label. Scan of all 25 pages: no <img alt=''> carries title/aria-label/role, no exposed decorative svg (home map svg is a labelled group of links, informative), no [role=img] without a name. the only non-svg role=img is span.coverage-tip (informative, named). |
| [1.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.3) | NC | C | /2025.html: venue PNG removed, replaced by real HTML (h2 'University of Macedonia, Thessaloniki', h3 Getting around / From the main train station / From the airport, bus lines, fares, taxi). /register.html sponsor image alt now names AEGES and Sciences Po CERI. Home map links now carry the city. Banner alt on /2025 describes cover text and scene. |
| [1.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.4) | NA | NA | No image is used as a CAPTCHA or test image on any of the 25 pages (no CAPTCHA widget, no form with challenge image). |
| [1.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.5) | NA | NA | No CAPTCHA image anywhere in the sample. |
| [1.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.6) | NC | C | /2025.html venue image removed, its content is now HTML text. No other sampled image needs a detailed description. |
| [1.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.7) | NA | NA | No image in the sample has a detailed description (aria-describedby on the Atlas canvas points to a keyboard-usage hint, not a description), so there is nothing to judge. Becomes applicable once 1.6 is fixed on /2025.html. |
| [1.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.8) | NC | C | /2025.html venue block is now styled HTML text. The 2025 programme banner (essc-2025-banner.jpg) still bakes the title and prize line into the picture, but it is now an image of the programme cover (alt: 'Cover of the 2025 programme: ...' giving all the text) and the page repeats the title in the h1. Judgement: C, a depiction of a printed cover where the lettering is part of the artwork (essential presentation). |
| [1.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.9) | NA | NA | No <img> or <svg> in the sample has a caption. The only <figcaption> elements in the sample belong to the conference films (<video>) on /, /index.fr.html, /2025.html, /2026.html and /past.html, which are not images. |

### 2. Cadres

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [2.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#2.1) | NA | NA | No <iframe> or <frame> on any of the 25 sampled pages (dom.iframes empty everywhere). The YouTube click-to-load and map embeds (src/_includes/youtube-embed.njk, map-embed.njk) are not used on sampled pages (2019, 2024, 2026-map includes only). |
| [2.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#2.2) | NA | NA | Same as 2.1: no frames in the sample, so no frame titles to judge. Re-test if a page with youtube-embed.njk (its iframe title comes from youtubeTitle) is added to the sample. |

### 3. Couleurs

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1) | NC | C | The one remaining instance, the oasth.gr link in the new /2025 venue text, is underlined by `.card p a:not([class])` (computed text-decoration-line: underline in dark mode). The other in-text link fixes hold (verifier). |
| [3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2) | NC | C | Re-measured every visible text run on all 25 pages (rendered-pixel method, text hidden, 15 samples per run) in light 1280, dark 1280 and light 320. Remaining 'bad' items are measurement artefacts, checked by computed values: gradient-clipped h1/404 text (press-kit h1 gradient #161b27 to #495165 on near-white, 404 accent gradient at 0.85 opacity at 112px) and SVG map year labels (probe reads CSS color. real fill … |
| [3.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.3) | NC | C | The Atlas stage lost its accent-soft radial wash, so dots sit on --bg-elev. Every theme hue then measures 3.02 to 4.92:1 on white and 3.64 to 5.92:1 on the dark surface. edges 3.08 (light) and 9.19 (dark). the prize ring has its own token, hsl(36 95% 36%) light 4.1:1 and hsl(36 95% 60%) dark 9.4:1, and the legend swatch follows it. Field borders, search bar, banner and map dots fixed (verifier). |

### 4. Multimédia

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [4.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.1) | NC | C | All five film instances (/ , /index.fr.html, /2026, /2025, /past) now carry an adjacent <details class=film-desc><summary>What the film shows</summary> with a scene-by-scene text description (localised: FR and DE versions exist on /index.fr.html, /index.de.html, /past.fr.html, /past.de.html, /2026.de.html), placed directly under the figcaption: title/poster, panel, stairs, old town, poster session, closing logos and … |
| [4.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.2) | NA | NA | No film has a transcript, audio description or alternative version to judge (see 4.1). |
| [4.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.3) | C | C | Only /2025.html and /past.html have a synchronised medium (video plus audio track). Its track is a music bed with no speech or significant sound (spectrogram and the muted playback), so captions are not necessary. It cannot be heard in the default path (muted property forced in theme.js) and only reachable via native controls under prefers-reduced-motion. The 2026 film has no audio. axe 'video-caption' is only an … |
| [4.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.4) | NA | NA | No synchronised captions exist on any film (no <track> elements), see 4.3 for why none are needed. |
| [4.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.5) | NC | C | The five silent/music-only films have no synchronised audio description, but each now has an adjacent text description of the visuals including text and logos. Judgement call: 'si nécessaire' is read as satisfied by the text alternative of 4.1 because the film has no speech to describe around. Strictly, 4.5.1 names an audio description or an alternative version with audio description. |
| [4.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.6) | NA | NA | No synchronised audio description exists on any film. |
| [4.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.7) | C | C | Each film sits under a heading and a lead paragraph naming it ('Two days in Stockholm', 'The short film below was shot and edited on site') and has a figcaption ('ESSC 2026, Stockholm.', 'EISS 2025, Thessaloniki.'). The <video> carries a matching aria-label and the Chrome AX tree gives role Video with that name. On /past.html the figcaption is the only text but names the edition. The control is named 'Play the film' … |
| [4.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.8) | NC | C | a.atlas-list-jump follows the canvas directly and opens the list alternative. it is shown on keyboard focus. |
| [4.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.9) | C | C | The list alternative is rebuilt by renderList() on every filter, lens or time change (Papers lens: paper, authors, year, linked. Authors lens: author, paper count, linked) and capped with a 'showing the first N' note. Filters, lens switch, find field, edition slider and theme hub panel are native HTML controls outside the canvas, so the map's functions are available without it. Co-authorship edges and theme … |
| [4.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.10) | C | C | No sound starts on any sampled page. Films are `muted`, theme.js re-asserts `v.muted = true` before play, the 2026 film has no audio stream and the 2025 audio track is never unmuted by the page (there is no sound control). No <audio>, no embedded players with autoplay. |
| [4.11](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.11) | C | C | Exercised with real events in headless Chrome (non-reduced motion): the film plays once 40% visible, the `button.film-play` (4rem, tabindex 0) stays in the AX tree while playing, its name flips between 'Pause the film' and 'Play the film', it takes :focus-visible with a 2px accent outline and fades to opacity 1 on focus, and click or Enter toggles playback. Under prefers-reduced-motion the video gets native controls … |
| [4.12](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.12) | C | C | Atlas canvas operated by keyboard: Tab reaches `canvas#atlas-canvas[tabindex=0]` with a 3px accent outline, ArrowRight/Down/Left/Up step through nodes with the card text pushed to the sr-only live region (checked: '... · 1 of 511', '... · 2 of 511'), Enter opens the node (navigates), Escape closes the pinned card (live region cleared). Zoom in/out/reset are buttons, find, chips, slider and play are native controls. … |
| [4.13](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#4.13) | C | C | Videos: native <video> with accessible name (AX role Video) and a real <button> companion with state-dependent name. Atlas: Chrome exposes the canvas (role Canvas, name, aria-describedby keyboard hint, focusable) and mirrors the focused node and filter changes into `p#atlas-live[role=status]`. Home map: SVG links have names (empty city names are tracked under 1.1). No plugin content. |

### 5. Tableaux

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [5.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.1) | NA | NA | Three kinds of data table exist in the sample: table.atlas-list__table (/anthology-atlas.html and the theme page), table.atlas-matrix__table (/anthology-atlas.html) and table.renewal-table (/anthology.html, source archive-page.njk:110). All are simple grids with one header row and, for the matrix and renewal tables, one row-header column. No rowspan/colspan, no multi-level or merged headers, no headers/id … |
| [5.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.2) | NA | NA | No complex data table in the sample, so no summary to judge (see 5.1). |
| [5.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.3) | NA | NA | No layout table in the sample. Every <table> in the 25 pages is a data table with <th scope>. The programme grid is built from <ol role=list> (programme-grid.njk:84), not from a table. /speakers.html is a meta-refresh stub to /anthology.html. |
| [5.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.4) | NC | C | All four data tables (renewal-table on /anthology.html, atlas-list__table and atlas-matrix__table on the Atlas, atlas-list__table on the theme page) now have aria-labelledby pointing to the id of the visible summary title (renewal-summary, atlas-list-summary, atlas-matrix-summary). Scan of all 25 pages: no table without caption/aria-label/aria-labelledby. |
| [5.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.5) | C | C | The visible titles that exist ('Renewal and collaboration by edition', 'How the research themes overlap (71 of 136 pairs)', 'Browse this view as a list (511 papers)') identify the table content clearly and concisely. The programmatic association is the defect, handled in 5.4. |
| [5.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.6) | C | C | All headers are <th>: column headers in <thead> on every table (atlas-list 3 th scope=col, matrix 17 th scope=col, renewal 6 th scope=col) and row headers as <th scope=row> in the matrix and renewal tables (role of the row label is carried by the th, with the link inside). The Atlas list script (anthology-atlas.js:1160) rebuilds the header row for the Authors lens with <th scope=col> too. The corner cell of the … |
| [5.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.7) | C | C | Simple tables use scope: th scope=col for column headers and th scope=row for row headers (renewal-table, atlas-matrix). No th that does not span a whole row or column, no headers/id attributes needed, no scope misuse (verified in dom.tables: thScope values are only col/row, headersAttr:false). |
| [5.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.8) | NA | NA | No layout table in the sample (see 5.3), so there is nothing that could misuse data-table elements. |

### 6. Liens

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [6.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#6.1) | NC | C | /board.html: 49 a.person-more links now read 'View profile' + sr-only ': <name>' (unique names). /anthology.html NetSec links: visible 'NetSec profile' + sr-only suffix naming the person. /press-kit.html: 'Download SVG' + sr-only ', Constellation mark'. /accessibility.html WCAG badge aria-label starts with 'WCAG 2.1 AA'. Atlas ranked-pair links no longer carry an aria-label (name = visible text). A scan of every … |
| [6.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#6.2) | C | C | Every link of the 25 sample pages has an accessible name: dom.links shows 0 empty links except one on every page, a.person-hovercard-link href=# created by people-hovercards.js inside the shared tooltip div, which is `hidden` until the script fills it with 'View profile' and an href (populate() runs before positionCard()), so it is never rendered or exposed empty. Icon-only links (social icons, board … |

### 7. Scripts

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1) | NC | C | Re-tested each defect. (1) Theme toggle keeps its localised label after click: /index.fr.html 'Passer au mode sombre' then 'Passer au mode clair', /index.de.html German. (2) summary.lang-menu-summary is now 'EN' + sr-only ', Language' (name contains visible text). (3) Atlas tour dialog uses aria-labelledby='tour-title' (atlas-tour.js l.68). (4) Mobile drawer at 375 px: Enter on button.nav-menu-toggle moves focus to … |
| [7.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.2) | C | C | Scripts with an alternative: the Atlas canvas has a text twin (table#atlas-list-table inside details.atlas-list, 200 rows rendered at build time on the canonical page, all rows on a theme page, header and rows rewritten by renderList() on every filter or lens change, with a note saying the whole corpus is on /anthology.html). Because the table is server-rendered it is also there with JavaScript off. The canvas is … |
| [7.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.3) | C | C | 7.3.1: every scripted control is a native button/link/summary/input or has a keyboard route. The Atlas canvas is a tab stop with arrow keys, Home/End, Enter and Escape (anthology-atlas.js:955), pinned cards are announced via #atlas-live, and the pointer-only parts (dragging or clicking the theme hubs on the canvas, panning) have equivalents: theme chips, 'Show only this theme' and theme pages in the 'Browse by … |
| [7.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.4) | C | C | Every navigation or window change is started by a link or button, or by Enter/click on a chosen item. Filters and selects (paper-filter.js, speaker-filter.js, publications-filter.js, atlas chips) update the page in place on change and never navigate or move focus (apply() only toggles hidden and the status text). Search results are listbox options that navigate on Enter or click (search.js:98). The options are … |
| [7.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.5) | NC | C | Atlas: clicking the 2026 chip writes '441 papers in this view.' and the Authors lens '418 authors in this view.' into p#atlas-live[role=status] (observed with a MutationObserver). Paper page: first Copy click creates a span.sr-only[role=status] and writes 'Copied' (50 ms after it is created) in paper-cite.js flash(). /publications.html: p[data-pub-status][role=status][aria-live=polite] is no longer hidden, typing … |

### 8. Éléments obligatoires

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [8.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.1) | C | C | All 25 built pages start with `<!doctype html>` (exactly one, preceded only by a newline) before `<html>`. Checked in _site/ for every sample page including /404.html and /index.fr.html. |
| [8.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.2) | NC | C | Fresh axe runs (light 1280, dark 1280, light 320) report zero violations on all 25 pages (previously aria-prohibited-attr everywhere). Fixed: div.footer-social now role=group, p.speaker-years has no aria-label (sr-only 'Editions attended:' prefix), span.community-alumni-count uses an sr-only ' members' suffix, /past.html conference list is ul.conference-list > li with conference-meta inside a div. DOM scan of all … |
| [8.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.3) | C | C | Every sample page has `lang` on `<html>`: `en` on 24 pages and `fr` on /index.fr.html (dom.htmlLang). |
| [8.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.4) | C | C | The codes `en` and `fr` are valid BCP 47 and match the language of the content: body copy of the English pages is English and /index.fr.html is French (checked by scanning every text node for foreign function words). |
| [8.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.5) | C | C | All 25 pages have a non-empty `<title>` (dom.title). |
| [8.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.6) | C | C | Titles follow `<page name>, EISS` and describe the page, for example 'Anthology Atlas, EISS', 'Arms acquisition and transfer, Anthology Atlas, EISS' and '2026 Conference, Stockholm, EISS'. They are unique across the sample except /speakers.html, which repeats the title of /anthology.html. That page is a zero-second meta-refresh stub that carries the Anthology content, so its title matches what it shows. … |
| [8.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.7) | NC | C | Footer: the bilingual legal sentence is now two spans, <span lang=en> and <span lang=fr>, on EN, FR and DE pages (checked /, /index.fr.html, /index.de.html). /2026.html abstract: the aphorism is output as <q class=quote-inline lang=fr>Plus ça change, plus c’est la même chose,</q> (new src/_data/markQuotes.js, which also tags other-language quotations by stopword vote, none other found). A stopword language scan of … |
| [8.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.8) | NC | C | /publications.html: the five non-English works now carry the right lang on span.member-work-title (fr: 'Les systèmes d’alerte précoce...', 'Un an après le coup d’État au Niger', 'Objectifs rationnels...', 'Le Risque Cyber...'. it: 'L’Europa nell’era dell’IA...'), via src/_data/titleLang.js (stopword vote). 62 titles remain lang=en and none is foreign. Same helper is in initiative-outputs and board-profile-body. |
| [8.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.9) | NC | C | No <b>, <i>, <u>, <font> or <center> on any of the 25 pages. Atlas stats no longer use <b> (div.atlas-stat now has a span value), the footer fine print and the programme affiliation no longer use <em>. The few remaining <em> are real stress (the word 'not' on /terms.html and /policy.html), a law title, a Latin term and work titles. Judgement: not presentational misuse. |
| [8.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.10) | NA | NA | No sample page contains right-to-left text (no Arabic, Hebrew or other RTL characters in the built HTML of the 25 pages) and no `dir` attribute is used. |

### 9. Structuration de l’information

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [9.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.1) | NC | C | Programme session titles are now <h4 class=programme-slot-title> under the h3 day heading on /2026.html, /2025.html and /2021.html (0 p.programme-slot-title left. outline H1, H2, H3 day, H4 sessions, no skipped level, one h1). The PDF card title on /2026.html is now an h2.pdf-doc-title#programme-pdf-title. No empty or skipped headings on any of the 25 pages. |
| [9.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.2) | NC | C | Footer link columns are now four nav landmarks: nav aria-labelledby footer-h-conferences / footer-h-programmes / footer-h-about, and nav.footer-meta-links aria-label 'Legal and site information' (FR 'Informations légales et sur le site'), on /, /index.fr.html, /accessibility.html and /board.html. One main, one banner, one contentinfo per page. Only the social-icon group (role=group, aria-label 'Follow us') and the … |
| [9.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.3) | NC | C | /past.html conferences are ul.conference-list > li > a. A to Z jump bars are nav > ul > li > a (25 items on /anthology and /speakers, 13 on /publications). Footer legal links are nav.footer-meta-links > ul.footer-meta-list > li (9) with no typed separators. Scan for 3 or more sibling links outside a list found only groups of components (language switcher, hero buttons, deposit badges, theme chips, social group), as … |
| [9.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.4) | NC | C | src/_data/markQuotes.js wraps each curly-quoted passage in abstracts in <q class=quote-inline> (16 on /2026.html, 8 on /2025.html), with quotes:none in CSS so marks are not doubled. Examples: <q>enjoyed remarkable continuity</q>, <q lang=fr>Plus ça change, plus c’est la même chose,</q> and its translation, 'whole-of-government and whole-of-society'. Scare quotes and titles in quotation marks are also tagged <q> … |

### 10. Présentation de l’information

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [10.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.1) | C | C | Generated HTML of the 25 sample pages searched for presentational tags (basefont, big, blink, center, font, marquee, s, strike, tt) and presentational attributes (align, bgcolor, border, valign, cellpadding, etc.): none. dom.presentational reports only 4 `<b>` on the Atlas pages (`div.atlas-stat`), which is not in the RGAA list of presentational tags. The only hits for `font-size`/`color` attributes are on inline … |
| [10.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.2) | C | C | With every stylesheet and inline style disabled (via the harness) the main content of /2026.html, /board.html, /anthology-atlas.html and /2025.html is all still in the text flow (6124, 7217, 2007 and 5458 characters of main innerText). The only CSS-generated content in site.css is decorative: breadcrumb separator `›`, disclosure arrow `▸`, `·` in .rm-changes and the print-only `(url)`. `data-tooltip` text is … |
| [10.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.3) | C | C | DOM order matches the visual order. The only reordering rules in site.css are `.archive-film { order: -1 }` (past.html: film card is after the conference list in the DOM, which stays coherent) and no `*-reverse` flex directions or `grid-area` placement. Absolute positioning is limited to tooltips and cards. With CSS off, headings, lists, tables and links read in a logical sequence on the pages tested. Cosmetic only: … |
| [10.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.4) | C | C | zoom200_640 (1280 px at 200 percent) shows scrollWidth equal to viewport and no overflowing element on all 25 pages. Clipping probe at 640 px without text spacing found no text lost by zoom: the only clipped text is by-design truncation that is identical at 100 percent (research themes line-clamp on /board.html, breadcrumb ellipsis on the paper page). The viewport meta is `width=device-width, initial-scale=1` (no … |
| [10.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.5) | C | C | body declares both `color: var(--text)` and `background: var(--bg)` in light and dark token sets, so every text-bearing element has a background colour inherited from a parent (10.5.1, 10.5.2). Inline `style` attributes set no colour without a background, and one `background` without a colour. Elements that paint a gradient or image behind text (.whats-new-banner, .pdf-doc-icon, .featured, the 135deg icon badge) set … |
| [10.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.6) | NC | C | Same fix as 3.1: the oasth.gr link is underlined. |
| [10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7) | NC | C | Re-tested focus indicators: tabOrder facts (fresh build, 24 pages) show a visible changed indicator on every stop (2px accent outline, 2px white on the banner, UA ring on video and span.coverage-tip). What's New banner: CTA and close ring are 2px white on #0071b8 (5.2:1) in light and 2px #0e121b on #52bdff (8.99:1) in dark. Search dialog: focus puts a 2px accent outline on div.search-bar (rgb 0,113,184 on white … |
| [10.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.8) | C | C | dom.aria.hiddenFocusable is empty on all 25 pages: no focusable element sits inside aria-hidden or a hidden container. aria-hidden text on the pages is decoration or duplicated: brand logo lockups, `.featured-date` on the home page (date and venue repeated in the h2, countdown and Dates/Venue lines), `.atlas-matrix__n` row/column numbers beside sr-only theme names, `.wcag-badge` letters, `.press-type-sample`, the … |
| [10.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.9) | C | C | No instruction relying on shape, size, position or colour alone was found in the rendered text of the sample pages (searched for left/right/above/below/round/red/big button style wording: only 'below the threshold of war' in paper titles and the logo alt). Charts that encode data by size or position have a text equivalent: the Atlas canvas (dot size, position, colour) has the details#atlas-list table and the theme … |
| [10.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.10) | C | C | Where position, size or shape is used (Atlas dots, coverage bars, programme grid, essc map) the same information is available as text in the same page, so the way it is implemented is relevant: coverage bars are decorative (`.coverage-track`) next to a figure, programme slots show the time as text, map dots are `a.essc-map-link` with visible year/city labels. No information is carried by the position of an … |
| [10.11](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.11) | NC | C | Sweep of every top-level page in EN, FR and DE at 320px: scrollWidth 320 on all. Causes fixed: hyphens:auto for FR/DE main and banner, overflow-wrap:break-word on body, the What's New link wraps under 560px, coverage-detail and cite-corpus summaries capped at 100%, edition links may wrap. |
| [10.12](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.12) | NC | C | Fresh textSpacing_1280/640 facts: only the empty absolutely-positioned #atlas-card in div.atlas-stage (unchanged, identical without spacing) and the breadcrumb ellipsis span on the paper page (full title in the h1). p.person-themes and span.paper-prevnext__title no longer use line-clamp or overflow hidden (computed -webkit-line-clamp none, overflow visible, scrollHeight = clientHeight) so nothing is lost on … |
| [10.13](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.13) | NC | C | Exercised on the build. .coverage-tip (/anthology, /speakers): focus shows ::after (display block), Escape (theme.js l.29-43 sets data-tip-dismissed) hides it (display none) and it returns on re-focus after blur. ::after now has an 8 px transparent border bridge and pointer-events auto, hit-testing at 3 points inside the bubble returns the tip itself, so it is hoverable and persistent. .speaker-netsec-card: focus … |
| [10.14](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.14) | C | C | Every CSS-only reveal found (scan of all `:hover`/`:focus` rules that change display, visibility or opacity of a descendant or pseudo-element) has a keyboard equivalent: `.coverage-tip` and `.person-essc-speaker` are `tabindex=0` and also reveal on :focus-visible, `.speaker-netsec-card` reveals on :focus-within of the chip link, `.film-play[data-state=playing]` shows on :focus-visible, people hovercards also open on … |

### 11. Formulaires

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1) | NC | C | input.search-input now has title='Search the site' in addition to aria-label (11.1.3 third condition), localised on FR. All other fields unchanged (labels with for/id, wrapping labels for checkboxes, aria-label + visible text for the range). |
| [11.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.2) | C | C | 11.2.1: labels are explicit for the filters ('Find a speaker by name', 'Find a paper by title or author', 'Theme', 'Event', 'Sort', 'Year', 'Published only', 'European Security Studies Prize'). 'Find' on /publications.html (#pub-find, placeholder 'Author, title or journal') and /anthology-atlas.html (#atlas-find, placeholder 'Author or paper title', inside a role=search region named 'Find an author or paper on the … |
| [11.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.3) | C | C | Same-function fields use the same label wherever repeated: 'Theme' and 'Event' label the same filters in both Anthology views (by person and by paper), 'Search the site' names the search input on all 25 pages (and its French equivalent on /index.fr.html), and the 'Find' fields on different pages filter different content ('speaker', 'paper', publications, map) so are not the same function. |
| [11.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.4) | C | C | Measured with getBoundingClientRect at 1280 and 375 px: on /anthology.html (both views) and /publications.html every label sits directly above its field with a 5 px gap (e.g. speaker-find label bottom 1404, field top 1409). On the Atlas the 'Find' label is immediately left of #atlas-find (10 px gap). The checkboxes #paper-published and #paper-prize wrap the input in the label, with the text to the right of the box, … |
| [11.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.5) | C | C | Related controls are grouped when grouping matters: the Atlas toggle chips sit in `role="group"` wrappers (#atlas-lens 'Choose a lens', #atlas-authoropts, #atlas-paperopts, #atlas-years 'Filter by edition year', #atlas-themes 'Spotlight a research theme', #atlas-time, .atlas-zoom). The Anthology filter bars are `role="search"` regions. The two checkboxes 'Published only' and 'European Security Studies Prize' are … |
| [11.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.6) | C | C | Each group has an accessible name through aria-label: 'Choose a lens', 'Author options', 'Paper options', 'Filter by edition year', 'Spotlight a research theme', 'Zoom the map', 'Read the corpus over time', 'Anthology statistics', 'Language'. There is no `<fieldset>` in the sample, and the `role="group"` wrappers all carry a name. |
| [11.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.7) | C | C | The group names listed under 11.6 describe the controls they contain accurately ('Filter by edition year' for the year chips, 'Spotlight a research theme' for the theme chips, 'Choose a lens' for Papers and Authors). |
| [11.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.8) | C | C | There are six `<select>` elements in the sample (#speaker-theme, #speaker-event, #paper-event, #paper-theme, #paper-sort, #pub-year). None uses `<optgroup>`. The lists are short and homogeneous: 12 editions in chronological order (annual conferences interleaved with joint events, which is intentional and clearer than splitting them), 17 research themes (one flat taxonomy), 3 sort orders, 11 years. Grouping is not … |
| [11.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.9) | C | C | All buttons in the sample have a name that states the action: text buttons ('Clear', 'Take the tour', 'Got it', 'Copy link to this view', 'Show only this theme', 'Download .bib', 'Read full abstract'), icon buttons with aria-label ('Search the site', 'Close search', 'Switch to dark theme', 'Dismiss', 'Play the film', 'Zoom in', 'Zoom out', 'Play through the editions') and toggle chips whose text is the filter … |
| [11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10) | NA | NA | No field in the sample is required, none uses `required`, `aria-required`, `pattern`, a constrained type or any validation (dom.forms shows required null on every field), and no error message exists. The only fields are search and filter controls. Third-party forms (Mailchimp newsletter sign-up at eepurl.com/h40Gkr, Stripe checkout at buy.stripe.com for membership, Indico registration at indico.eiss-europa.com) are … |
| [11.11](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.11) | NA | NA | No field in the sample validates input or produces an input error, so there is nothing to suggest corrections for. Third-party forms (Mailchimp, Stripe, Indico) are outside the sample. |
| [11.12](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.12) | NA | NA | No form in the sample modifies or deletes data, submits an exam, or has financial or legal consequences. Registration (Indico), membership payment (Stripe) and the newsletter (Mailchimp) are hosted on third-party services reached through links, and are outside the sample. Their confirmation steps should be checked in a separate audit of those services. |
| [11.13](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.13) | NA | NA | No field in the sample asks for information about the user (name, email, address, phone and so on). All fields are search or filter controls, correctly set to `autocomplete="off"` or left at default. Mailchimp, Stripe and Indico forms, which do collect personal data, are third-party and outside the sample. |

### 12. Navigation

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [12.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.1) | C | C | Every sampled page (25/25) carries three navigation systems in the same markup: the primary menu (nav[aria-label=Primary]), the search modal opened by button[data-search-trigger] in the header, and a footer link to /sitemap.html (/sitemap.fr.html on the FR page). Condition 'menu + plan du site' and 'menu + moteur de recherche' are both met. |
| [12.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.2) | C | C | Header/nav/footer markup was reduced to a structural signature (tags, classes, hrefs, language switcher excluded): 24 EN pages are identical, the FR home differs only by localised hrefs. DOM order is skip-link, header (brand, menu, language, search, theme), main, footer on every page. Measured positions: header, search button (x=1136,w=36 at 1280 / x=211,w=44 at 375), theme toggle and menu toggle are at identical … |
| [12.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.3) | C | C | /sitemap.html has 50 links in 7 groups (annual conferences 2017-2027, Anthology, Atlas, vocab, activities, joint events, About, membership, archive pages, legal). Every internal href resolves to a file in _site/ (0 missing) and the labels match the target h1 (e.g. 'Anthology Atlas' -> Anthology Atlas, 'Press kit' -> Press kit). Cross-check with sitemap.xml: all non-generated HTML pages are listed except Home ('/'), … |
| [12.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.4) | C | C | The footer 'Site map' link (footer .footer-meta-links) is present on 25/25 sampled pages, same markup, same position in the footer's legal line and same relative source order. Target is /sitemap.html (/sitemap.fr.html on the FR page). |
| [12.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.5) | C | C | button.icon-btn[data-search-trigger] (aria-label 'Search the site') sits in .nav-actions on 25/25 pages at identical coordinates and source order (after the language switcher, before the theme toggle). Every page also loads search.js and the same dialog (role=dialog, input, close). Ctrl/Cmd+K and '/' are extra shortcuts, not a different route. |
| [12.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.6) | C | C | All pages expose banner (header.site-header), navigation ('Primary'), main#main and contentinfo (footer role=contentinfo) in the Chrome AX tree (checked on all 25 fact files). The search zone is a labelled dialog (role=dialog, aria-labelledby -> h2 'Search') opened from the header button, and in-page filter areas on /speakers, /publications, /anthology and the Atlas use role=search. A visible-on-focus 'Skip to … |
| [12.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.7) | NC | C | Skip link: first focusable on all pages, targets #main, z-index now 300 (banner 200). Focused with the banner showing, the link box (16,16)-(188,66) has 99% of sampled points hit-testing to the link at both 1280 and 375 px, with 9:1 text contrast in dark and 5.2:1 in light. |
| [12.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.8) | NC | C | Desktop tab order unchanged (banner right after the skip link, no positive tabindex). Mobile drawer at 375 px, real keys: Tab to button.nav-menu-toggle, Enter, focus lands on the first drawer item ('Conference'), Tab walks Anthology, Activities, About, Get involved, then the header controls (language, search, theme, toggle) and then the page content below the drawer (y=459 'Discover ESSC 2027'). Escape closes the … |
| [12.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.9) | C | C | tabOrder facts: 0 traps on 25/25 pages (the two 400-entry runs on /anthology and /speakers are the harness cap, not a trap). Exercised by keys: search modal opened with '/' or Enter on the trigger cycles input <-> close button with Tab/Shift+Tab, Escape closes and focus returns to the trigger (the JS focus trap is intentional and has an exit). Nav drawer at 375px closes with Escape and returns focus to the toggle. … |
| [12.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.10) | NC | C | search.js (l.283-292) now only handles Ctrl/Cmd+K and Escape. Pressing '/' after Tab x4 on /board.html leaves the dialog closed and focus on the brand link. A grep of every keydown handler in src/assets/js: remaining single-key handling is Escape (hovercards, tooltips, Atlas, hub panel, drawer, nav groups) and arrow/Enter keys inside focused widgets (archive tabs, Atlas canvas, tour). No printable one-character … |
| [12.11](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.11) | NC | C | The microphone icon in the programme (79 on /2026, 42 on /2025 and /2021) is now explained by a visible legend line at the top of each programme (p.programme-legend: icon + 'Presenter', programme-grid.njk l.77, archive-programme.njk l.51), and each icon is followed by sr-only 'Presenter:'. The native title='Presenter' on span.programme-author-mic remains as a duplicate, no information depends on it. Other extra … |

### 13. Consultation

| Criterion | First pass | Now | Evidence |
|---|---|---|---|
| [13.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.1) | NA | NA | No sampled page uses a refresh or redirect: metaRefresh false on 25/25, no setTimeout/location redirect in src/assets/js (location.href only in Atlas click handlers), no session timer, setInterval only drives the user-started Atlas timeline. The site's retired pages (e.g. /NDC.html, /refund.html, /speakers.fr.html) are <meta http-equiv=refresh content="0;url=..."> stubs, which would pass 13.1.2 (immediate), but none … |
| [13.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.2) | C | C | No window.open anywhere in src/assets/js or templates. New tabs only come from user-activated links with target="_blank" rel="noopener" (e.g. footer social, newsletter, programme PDF 'Open in new tab'). No popup, no script-opened window on any of the 25 pages. |
| [13.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.3) | C | C | Office documents offered in the sample: the programme PDFs only (/assets/files/EISS-2026-programme.pdf on /2026.html via programme-pdf.njk, EISS-2025-programme.pdf on /2025.html). The 2026 PDF is untagged (no StructTreeRoot, /Lang or title) and the 2025 one has wrong /Lang, so the documents themselves are not accessibility-compatible. Third condition applies: an HTML alternative on the same page. /2026.html and … |
| [13.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.4) | C | C | Compared the 2026 PDF text (9 pages, extracted) with /2026.html: day 1 and day 2 timetable, rooms (Lecture Hall 8/9, D House), chairs, keynote (Thomas Nilsson), concluding remarks, European Security Studies Prize award, poster session/cocktail, every panel and its paper list are all present in the HTML, which adds abstracts and links. Nothing in the PDF's content is missing from the HTML. The 2025 page also carries … |
| [13.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.5) | NA | NA | Searched the rendered text of all 25 pages for ASCII art, emoticons (:) ;-) <3 etc.), kaomoji, box-drawing and repeated-symbol runs, plus arrow/dingbat glyphs: no hits except a '(8)' count false positive. The 404 illustration is an inline SVG, and decorative marks (sparkle, middle dots) are aria-hidden. |
| [13.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.6) | NA | NA | No cryptic content found on any sampled page (see 13.5). |
| [13.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.7) | C | C | No flashing CSS or script. site.css keyframes: registrationBadgePulse 1.6 s (0.6 Hz, box-shadow ring of a 0.5rem dot, only on the 'happening-now' state, not present in the sample), targetHighlight 1.6 s once, whatsNewIn 0.35 s once. The two conference films were analysed with ffmpeg (per-frame mean luma, 25/50 fps): 0 opposing luminance swings >=10% in any 1 s window for essc-2026.mp4 and essc-2025.mp4. |
| [13.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.8) | C | C | Automatic motion found: the conference film (video.film-video on /, /2026, /2025, /past, /index.fr) autoplays muted and loops when scrolled into view (46 s / 91 s, >5 s). Controls: button.film-play (real <button>, aria-label toggles 'Pause the film'/'Play the film') stays in the accessibility tree and Tab order, becomes visible on :focus-visible/hover (opacity 0 -> 1, verified), plus click/tap on the video toggles. … |
| [13.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.9) | C | C | No orientation lock anywhere: no screen.orientation.lock, no `orientation` media query, no max-height/aspect-ratio media queries in site.css, no web manifest orientation. Rendered at 667 and 812 px wide on /, /2026.html, /anthology-atlas.html, /anthology.html: scrollWidth equals viewport width, same content in both. |
| [13.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.10) | C | C | Only the Anthology Atlas has gestures. Multipoint: no touch/pinch handlers, wheel zoom only with ctrl/meta (trackpad pinch) and real buttons #atlas-zoom-in / #atlas-zoom-out / reset exist. Path-based: drag to pan the zoomed canvas and drag theme hubs use pointer events where only the displacement matters, and every function has a single-point or keyboard route: zoom buttons, canvas arrow/Home/End/Enter keys … |
| [13.11](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.11) | C | C | Pointer-triggered actions complete on up/click: native links and buttons everywhere, Atlas node activation runs in pointerup (pointerdown only starts a pan or a hub drag, and a moved gesture is not treated as a click), tour backdrop uses click. No mousedown/touchstart/pointerdown handler commits an action (grep over src/assets/js and templates). |
| [13.12](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.12) | NA | NA | No use of devicemotion, deviceorientation, accelerometer, shake or vibrate in src (the only 'accelerometer' string is the Permissions allow attribute for the YouTube embed, third party). No motion-actuated feature on any sampled page. |


## Screen-reader pass

The checks in #1796, the ones the grid above judged from Chrome's accessibility tree. The declaration stays **partially conformant** until a person has run the VoiceOver + Safari script below and the NVDA + Firefox equivalent. Only the flashing check has a result so far.

### Flashing (13.7), 9 October 2026: pass

Both films were checked frame by frame against the WCAG 2.3.1 thresholds that RGAA 13.7 uses, going further than the mean-luma estimate recorded under 13.7 in the grid.

- **Files.** `src/assets/video/essc-2025.mp4` (720 × 1280, 50 fps, 91.5 s, 4,573 frames) and `src/assets/video/essc-2026.mp4` (1080 × 1920, 25 fps, 46.5 s, 1,162 frames).
- **Method.** Every frame decoded with ffmpeg and downscaled to 36 × 64 by area averaging. Relative luminance from linearised sRGB per pixel, then averaged over sliding regions of one ninth of the frame (a third of the width by a third of the height, stepped by half a region), which is about the size of the 341 × 256 px area WCAG names for a 1024 × 768 screen. A general flash is a pair of opposing luminance changes of at least 0.1 where the darker state is below 0.8. A red flash is a pair of opposing changes of at least 20 in (R − G − B) × 320 on pixels where R / (R + G + B) ≥ 0.8. Flashes were counted in every one-second window of every region.
- **Control.** A generated black and white strobe at 6.25 Hz and a red strobe at the same rate both read as 6 flashes in a second, so the check catches what it is meant to catch.
- **Result.** At most 1 general flash in any second in any region of either film, and no red flash. The limit is 3. Pass.

This is still an automated reading. Watching both films once with the script below (step 5) confirms it by eye.

### VoiceOver + Safari script (to run)

Run on the deployed site, `https://eiss-europa.com`, which carries the fixes from PR #1798. The search count needs the Pagefind index, which only the deployed site has. Fill in the **Heard** and **Result** lines with what VoiceOver actually said, not what it should have said. VO means Control + Option.

**Setup.**

1. Record the macOS and Safari versions: Apple menu → About This Mac, and Safari → About Safari.
2. Safari → Settings → Advanced: tick "Press Tab to highlight each item on a webpage", or Tab skips links.
3. Turn VoiceOver on with Command + F5. Turn the caption panel on with VO + Command + F10, so the spoken text can be read and copied.
4. VoiceOver Utility → Speech → Voices: check that a French and an Italian voice are installed, or the language checks cannot pass.
5. Make sure Quick Nav is off (press Left and Right arrows together until VoiceOver says "Quick Nav off"), so arrow keys reach the Atlas.

**1. Atlas (1.1, 4.8, 4.9, 4.12, 4.13, 7.5).** Open `/anthology-atlas.html`. Close the welcome panel if it shows.

- a. Tab until the map has focus. Expected: the label starting "Force-directed map of the European Security Studies Anthology", announced as an application or web application, then the hint "Use the arrow keys to move through the map, Enter to open, Escape to close."
  Heard: ______ Result: ______
- b. Press Right Arrow, then Right Arrow again. Expected: a paper card read out each time, ending "· 1 of 511" then "· 2 of 511". Press Escape: the card closes.
  Heard: ______ Result: ______
- c. Press Tab once from the map. Expected: "Browse this view as a list, link". Press VO + Space. Expected: focus lands on "Browse this view as a list (511 papers)", one or two keystrokes from the map.
  Heard: ______ Result: ______
- d. Shift + Tab back up to the edition chips, Tab to the "2026" toggle button and press Space. Expected, without moving focus: "441 papers in this view." Then switch to the "Authors" lens. Expected: a count ending "authors in this view."
  Heard: ______ Result: ______

**2. Films (4.1, 4.3, 4.7).** Open `/2026.html`, then `/2025.html`, then `/`.

- a. Move with VO + Right Arrow through the film block. Expected: the video named "ESSC 2026, Stockholm." (or "EISS 2025, Thessaloniki."), the "Play the film" button, the caption, then a collapsed disclosure "What the film shows". Press VO + Space on it. Expected: "expanded", and the description reads on.
  Heard (2026): ______ Heard (2025): ______ Heard (home): ______ Result: ______
- b. Open `/assets/video/essc-2025.mp4` directly in a Safari tab with the sound on and listen to the whole film once. Expected: music only, no speech and no sound that carries information.
  Heard: ______ Result: ______

**3. Mobile menu (7.1, 12.8).** Safari → Develop → Enter Responsive Design Mode, pick a 375 px wide iPhone preset, and open `/`. VoiceOver on iOS Safari is the better test if an iPhone is to hand.

- a. Tab to the menu button. Expected: "EISS — menu, button, collapsed". Press Space. Expected: "expanded" and focus on the first drawer item, "Conference".
  Heard: ______ Result: ______
- b. Tab on through the drawer, then press Escape. Expected: Anthology, Activities, About and Get involved in order, then Escape closes the drawer and focus returns to the menu button.
  Heard: ______ Result: ______

**4. Status messages (7.5).**

- a. Open `/papers/2018-a-weapon-of-the-weak-cyberwarfare-and-china-s-threat-perception.html`, Tab to the "Copy" button under the BibTeX and press Space. Expected, without moving focus: "Copied".
  Heard: ______ Result: ______
- b. On any page, activate "Search the site" (or press Command + K) and type `nuclear`. Expected: "Searching…" then "Results:" and a number. Deployed site only.
  Heard: ______ Result: ______
- c. Open `/publications.html` and type in the filter field. Expected: "Showing N publications." as the list narrows.
  Heard: ______ Result: ______

**5. Flashing (13.7).** Watch both films once from start to end (`/2026.html` and `/2025.html`). Expected: no flashing, in line with the frame-level check above.
  Seen: ______ Result: ______

**6. Language changes (8.7, 8.8).** VO + F opens VoiceOver's find, which jumps to a phrase.

- a. On `/`, go to the end of the footer and read the legal sentence with VO + Right Arrow. Expected: the English sentence in the English voice, then "L'EISS est une association loi 1901…" in a French voice.
  Heard: ______ Result: ______
- b. On `/2026.html`, find "Plus ça change". Expected: the quotation read in a French voice, the rest of the abstract in English.
  Heard: ______ Result: ______
- c. On `/publications.html`, find "Les systèmes d’alerte précoce" and then "L’Europa nell’era dell’IA". Expected: the first title in a French voice, the second in an Italian voice.
  Heard: ______ Result: ______

**7. Link names (6.1).**

- a. On `/board.html`, open the rotor with VO + U and move to the Links list. Expected: entries such as "View profile: Dr Hugo Meijer", every one naming its person.
  Heard: ______ Result: ______
- b. On `/anthology.html`, the same. Expected: entries such as "NetSec profile: Vasiliki Plessia Aravani on the NetSec member directory (opens in a new tab)".
  Heard: ______ Result: ______
- c. Turn VoiceOver off and Voice Control on (System Settings → Accessibility → Voice Control). On `/board.html` say "Click View profile", and on `/anthology.html` say "Click NetSec profile". Expected: Voice Control finds the links (it numbers them when several match).
  Result: ______

### NVDA + Firefox (to run)

NVDA runs only on Windows, so it needs a Windows machine and a person. Run the same seven steps there with the latest NVDA and Firefox, using NVDA's own keys (Insert + F7 for the elements list, browse mode for reading, focus mode on the Atlas map).

### Results so far

| Check | VoiceOver + Safari | NVDA + Firefox |
|---|---|---|
| 1. Atlas | to run | to run |
| 2. Films | to run | to run |
| 3. Mobile menu | to run | to run |
| 4. Status messages | to run (search needs the deployed site) | to run |
| 5. Flashing | pass by frame-level analysis (above). Watching once still to do | not screen-reader dependent |
| 6. Language changes | to run | to run |
| 7. Link names and voice control | to run | to run |
