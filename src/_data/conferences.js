/**
 * Central conferences data source.
 *
 * What this file is
 * -----------------
 * One structured entry per annual conference, sorted reverse-chronologically.
 * Drives:
 *   - the "Next conference" featured card on src/index{,.fr,.de}.njk
 *   - the archive list on src/past{,.fr,.de}.njk
 *   - (longer-term) the share-card generator and Indico sync, both of which
 *     can read from here instead of carrying their own duplicated copy.
 *
 * What this file is NOT
 * ---------------------
 * The per-year content pages (src/2026.njk, src/2025.njk, …) still live on
 * their own. Each year has substantial unique content — venue maps, partner
 * logos, programme PDFs, neighbourhood tile grids — that wouldn't fit a
 * one-size-fits-all template. Those pages can OPTIONALLY consume fields
 * from here to avoid restating dates / city / etc., but they're not
 * forced to.
 *
 * Adding a new conference
 * -----------------------
 * See docs/new-conference.md. The short version: prepend a new entry to
 * the `conferences` array below with `startDate` and `endDate` in
 * ISO-8601, then create the per-year .njk page (template at
 * docs/new-conference-template.njk). The featured card on / and the
 * archive list on /past automatically pick up the change on the next build.
 *
 * The "today" cut-off
 * -------------------
 * `next` is whichever entry has the earliest `startDate` that's strictly
 * in the future relative to the build's wall-clock day. `past` is everything
 * with `endDate` < today. Eleventy builds happen on every push and on a
 * daily cron (.github/workflows/scheduled-rebuild.yml), so the cut-off
 * advances within ~24 hours of a conference ending without any manual edit.
 */

// Entries: most recent first. New conferences go at the top.
// All language-specific strings are pre-composed (cheaper to maintain than
// localising via a date-format library — adding a conference is annual).
const conferences = [
  {
    slug: "2026",
    year: 2026,
    ordinal: 9,
    startDate: "2026-06-11",
    endDate: "2026-06-12",
    city: "Stockholm",
    country: "Sweden",
    venue: {
      en: "Stockholm University",
      fr: "Université de Stockholm",
      de: "Universität Stockholm",
    },
    dates: {
      en: "11 — 12 June 2026",
      fr: "11 — 12 juin 2026",
      de: "11. — 12. Juni 2026",
    },
    // Compact line used in archive lists (past.html). Includes ordinal +
    // dates + venue.
    archiveMeta: {
      en: "9th Annual Conference · 11 — 12 June 2026 · Stockholm University, Stockholm",
      fr: "9e conférence annuelle · 11 — 12 juin 2026 · Université de Stockholm, Stockholm",
      de: "9. Jahreskonferenz · 11. — 12. Juni 2026 · Universität Stockholm, Stockholm",
    },
    // The "Jointly organised by ..." line on the featured card.
    organisers: {
      en: "Jointly organised by the COST Action NetSec, the European Initiative for Security Studies (EISS), and Stockholm University.",
      fr: "Organisée conjointement par l'Action COST NetSec, l'Initiative européenne pour les études de sécurité (EISS), et l'Université de Stockholm.",
      de: "Gemeinsam organisiert von der COST-Aktion NetSec, der Europäischen Initiative für Sicherheitsstudien (EISS) und der Universität Stockholm.",
    },
    monthLabel: {
      en: "June",
      fr: "Juin",
      de: "Juni",
    },
    dayRange: "11–12",     // for the featured-card .day block
    yearLine: "2026 · Stockholm",
    // Optional polished programme PDF. The live grid on /YYYY is the
    // primary programme display (pulled daily from Indico); the PDF is
    // the designer-made, print-friendly companion. See
    // docs/indico-programme-integration.md for the rationale.
    //
    // - `status: "draft"`  → labelled "Working programme (subject to
    //                        change)"; rendered as a small download
    //                        block under the live grid.
    // - `status: "final"`  → labelled "Final programme"; the polished
    //                        archival artefact.
    // - Omit the field entirely (or set to null) for years where you
    //   don't have a PDF.
    programmePdf: {
      url: "/assets/files/EISS-2026-programme.pdf",
      sizeKb: 279,
      pages: 9,
      status: "final",
    },
    // Manual override for the registration-status badge on /YYYY pages.
    //   "open"   — show the "Registration open" pill regardless of dates
    //   "closed" — show "Registration closed"; useful between the form
    //              closing and the conference starting (the date-only
    //              fallback would incorrectly say "open" in that window)
    //   null / unset — derive from today vs. start/end dates
    // We don't pull this from Indico because the anonymous API doesn't
    // expose registration-form state. Flip it by hand when the form
    // opens or closes; the daily rebuild picks up the change.
    registrationStatus: "closed",
    // Embedded Google Maps preview for the venue. Click-to-load so the
    // page doesn't ping Google's servers before the visitor opts in
    // (cf. /policy §3: no third-party widgets that load before you
    // click them). `src` is the standard Google Maps embed URL; copy it
    // from the "Share → Embed a map" panel on maps.google.com. `address`
    // is the human-readable label shown next to the map-pin in the
    // placeholder card.
    mapEmbed: {
      src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2274.1344933006794!2d18.057771781723034!3d59.36268050463061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f9d0ff22ee405%3A0x99d65521c5c27afe!2sUniversitetsv%C3%A4gen%2010D%2C%20114%2018%20Stockholm%2C%20Sweden!5e1!3m2!1sen!2sse!4v1779536831179!5m2!1sen!2sse",
      address: {
        en: "Universitetsvägen 10D, 114 18 Stockholm, Sweden",
        fr: "Universitetsvägen 10D, 114 18 Stockholm, Suède",
        de: "Universitetsvägen 10D, 114 18 Stockholm, Schweden",
      },
    },
    // Conference FAQ on the NetSec sister site. The shared ESSC FAQ holds
    // the per-role links chairs and speakers need (edit My Session / My
    // Contributions) plus visa-letter guidance, so the "Speaking or
    // chairing?" note on /YYYY points here. Per-year because a future
    // edition may host its FAQ elsewhere.
    faqUrl: "https://netsec-cost.eu/faq.html#conference",
    programmePdf: "EISS-2026-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2025",
    year: 2025,
    ordinal: 8,
    startDate: "2025-06-26",
    endDate: "2025-06-27",
    city: "Thessaloniki",
    country: "Greece",
    venue: {
      en: "University of Macedonia",
      fr: "Université de Macédoine",
      de: "Universität Mazedonien",
    },
    archiveMeta: {
      en: "8th Annual Conference · 26 — 27 June 2025 · University of Macedonia, Thessaloniki",
      fr: "8e conférence annuelle · 26 — 27 juin 2025 · Université de Macédoine, Thessalonique",
      de: "8. Jahreskonferenz · 26. — 27. Juni 2025 · Universität Mazedonien, Thessaloniki",
    },
    displayCity: { en: "Thessaloniki", fr: "Thessalonique", de: "Thessaloniki" },
    programmePdf: "EISS-2025-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2024",
    year: 2024,
    ordinal: 7,
    startDate: "2024-06-27",
    endDate: "2024-06-28",
    city: "Prague",
    country: "Czech Republic",
    venue: {
      en: "Charles University",
      fr: "Université Charles",
      de: "Karls-Universität",
    },
    archiveMeta: {
      en: "7th Annual Conference · 27 — 28 June 2024 · Charles University, Prague",
      fr: "7e conférence annuelle · 27 — 28 juin 2024 · Université Charles, Prague",
      de: "7. Jahreskonferenz · 27. — 28. Juni 2024 · Karls-Universität, Prag",
    },
    displayCity: { en: "Prague", fr: "Prague", de: "Prag" },
    youtubePlaylist: "PLkI2R8FsFqV6bNS0LmU-TxWNY7-fBXDOa",
    programmePdf: "EISS-2024-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2023",
    year: 2023,
    ordinal: 6,
    // Approximate — fill in if known exactly. Used for sort, not display.
    startDate: "2023-06-22",
    endDate: "2023-06-23",
    city: "Barcelona",
    country: "Spain",
    venue: {
      en: "Barcelona, Spain",
      fr: "Barcelone, Espagne",
      de: "Barcelona, Spanien",
    },
    archiveMeta: {
      en: "6th Annual Conference · Barcelona, Spain",
      fr: "6e conférence annuelle · Barcelone, Espagne",
      de: "6. Jahreskonferenz · Barcelona, Spanien",
    },
    displayCity: { en: "Barcelona", fr: "Barcelone", de: "Barcelona" },
    youtubePlaylist: "PLkI2R8FsFqV4zwz12-ZFd_dV_ENX14--6",
    programmePdf: "EISS-2023-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2022",
    year: 2022,
    ordinal: 5,
    startDate: "2022-06-30",
    endDate: "2022-07-01",
    city: "Berlin",
    country: "Germany",
    venue: {
      en: "Hertie School, Berlin",
      fr: "Hertie School, Berlin",
      de: "Hertie School, Berlin",
    },
    archiveMeta: {
      en: "5th Annual Conference · Hertie School, Berlin",
      fr: "5e conférence annuelle · Hertie School, Berlin",
      de: "5. Jahreskonferenz · Hertie School, Berlin",
    },
    displayCity: { en: "Berlin", fr: "Berlin", de: "Berlin" },
    programmePdf: "EISS-2022-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2021",
    year: 2021,
    ordinal: 4,
    startDate: "2021-09-03",
    endDate: "2021-09-04",
    city: "Lisbon",
    country: "Portugal",
    venue: {
      en: "Lisbon, Portugal",
      fr: "Lisbonne, Portugal",
      de: "Lissabon, Portugal",
    },
    archiveMeta: {
      en: "4th Annual Conference · Lisbon, Portugal",
      fr: "4e conférence annuelle · Lisbonne, Portugal",
      de: "4. Jahreskonferenz · Lissabon, Portugal",
    },
    displayCity: { en: "Lisbon", fr: "Lisbonne", de: "Lissabon" },
    hasOwnPage: true,
  },
  {
    slug: "2020",
    year: 2020,
    // The 2020 conference was DEFERRED to 2021 due to COVID-19 — it is
    // not a separate numbered edition. The deferred conference was held
    // at ISCTE-IUL, Lisbon on 3–4 September 2021 and counts as the 4th
    // (see the 2021 entry). `deferred: true` excludes it from the
    // edition count (see `editionCount` below). No `ordinal`.
    deferred: true,
    // startDate kept in 2020 only so /past sorts this entry between 2019
    // and 2021; the conference was actually held in September 2021.
    startDate: "2020-09-03",
    endDate: "2020-09-04",
    city: "",
    country: "Portugal",
    venue: {
      en: "Deferred to 2021 — held at ISCTE-IUL, Lisbon",
      fr: "Reportée à 2021 — tenue à l'ISCTE-IUL, Lisbonne",
      de: "Auf 2021 verschoben — abgehalten an der ISCTE-IUL, Lissabon",
    },
    archiveMeta: {
      en: "Deferred to 2021 due to the COVID-19 pandemic · held at ISCTE-IUL, Lisbon",
      fr: "Reportée à 2021 en raison de la pandémie de COVID-19 · tenue à l'ISCTE-IUL, Lisbonne",
      de: "Wegen der COVID-19-Pandemie auf 2021 verschoben · abgehalten an der ISCTE-IUL, Lissabon",
    },
    displayCity: {
      en: "Deferred to 2021",
      fr: "Reportée à 2021",
      de: "Auf 2021 verschoben",
    },
    hasOwnPage: true,
  },
  {
    slug: "2019",
    year: 2019,
    ordinal: 3,
    startDate: "2019-06-13",
    endDate: "2019-06-14",
    city: "Paris",
    country: "France",
    venue: {
      en: "Sciences Po CERI, Paris",
      fr: "Sciences Po CERI, Paris",
      de: "Sciences Po CERI, Paris",
    },
    archiveMeta: {
      en: "3rd Annual Conference · Sciences Po CERI, Paris",
      fr: "3e conférence annuelle · Sciences Po CERI, Paris",
      de: "3. Jahreskonferenz · Sciences Po CERI, Paris",
    },
    displayCity: { en: "Paris", fr: "Paris", de: "Paris" },
    youtubePlaylist: "PLkI2R8FsFqV4_TVOCV5qfPFAmZn1KbWGv",
    programmePdf: "Programme2019.pdf",
    hasOwnPage: true,
  },
  // The 2017 and 2018 conferences are kept in the historical-image
  // section at the bottom of past.html — they predate the standalone
  // /YYYY.html convention. Not listed here.
];

// Build-time cut-off. Eleventy re-runs this whenever the build runs;
// the scheduled-rebuild workflow guarantees a daily build so the
// cut-off advances even on quiet weeks.
const today = new Date().toISOString().slice(0, 10);

const upcomingOrCurrent = conferences
  .filter((c) => c.endDate >= today)
  .sort((a, b) => a.startDate.localeCompare(b.startDate));

const past = conferences
  .filter((c) => c.endDate < today)
  .sort((a, b) => b.startDate.localeCompare(a.startDate));

// Year-keyed lookup for per-year content pages (/2026, /2027, ...) that
// want to read structured data — e.g. the registration-status badge in
// src/_includes/registration-badge.njk pulls `conferences.byYear[year]`.
const byYear = Object.fromEntries(conferences.map((c) => [String(c.year), c]));

// Distinct numbered editions, for display counts like /initiative's
// "N annual conferences" stat. Excludes the deferred 2020 (folded into
// the 2021 edition, `deferred: true`) and adds the two founding-era
// editions (2017, 2018) that have their own pages but predate this
// array. Today: 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026 = 9.
const editionCount = conferences.filter((c) => !c.deferred).length + 2;

module.exports = {
  all: conferences,
  byYear,
  next: upcomingOrCurrent[0] || null,   // closest upcoming (or in-progress)
  upcoming: upcomingOrCurrent,
  past,
  editionCount,
  today,
};
