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
    hasOwnPage: true,
  },
  {
    slug: "2022",
    year: 2022,
    ordinal: 5,
    startDate: "2022-06-23",
    endDate: "2022-06-24",
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
    hasOwnPage: true,
  },
  {
    slug: "2021",
    year: 2021,
    ordinal: 4,
    startDate: "2021-06-24",
    endDate: "2021-06-25",
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
    ordinal: 3,
    startDate: "2020-06-25",
    endDate: "2020-06-26",
    // Online edition due to COVID — keep city blank, use displayCity to
    // surface the "Online edition" label in the archive heading slot.
    city: "",
    country: "",
    venue: {
      en: "Online — held online due to the COVID-19 pandemic",
      fr: "En ligne — tenue en ligne en raison de la pandémie de COVID-19",
      de: "Online — aufgrund der COVID-19-Pandemie online abgehalten",
    },
    archiveMeta: {
      en: "3rd Annual Conference — held online due to the COVID-19 pandemic",
      fr: "3e conférence annuelle — tenue en ligne en raison de la pandémie de COVID-19",
      de: "3. Jahreskonferenz — aufgrund der COVID-19-Pandemie online abgehalten",
    },
    displayCity: {
      en: "Online edition",
      fr: "Édition en ligne",
      de: "Online-Ausgabe",
    },
    hasOwnPage: true,
  },
  {
    slug: "2019",
    year: 2019,
    ordinal: 2,
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
      en: "2nd Annual Conference · Sciences Po CERI, Paris",
      fr: "2e conférence annuelle · Sciences Po CERI, Paris",
      de: "2. Jahreskonferenz · Sciences Po CERI, Paris",
    },
    displayCity: { en: "Paris", fr: "Paris", de: "Paris" },
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

module.exports = {
  all: conferences,
  next: upcomingOrCurrent[0] || null,   // closest upcoming (or in-progress)
  upcoming: upcomingOrCurrent,
  past,
  today,
};
