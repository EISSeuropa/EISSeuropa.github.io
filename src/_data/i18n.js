/**
 * Multilingual string catalog for chrome + UI labels.
 *
 * Architecture overview
 * ---------------------
 * EISS ships three locale variants per translated page, using NetSec's
 * file-suffix pattern:
 *   /board.html       (English, authoritative)
 *   /board.fr.html    (French,  beta until native-speaker review)
 *   /board.de.html    (German,  beta until native-speaker review)
 *
 * Page prose lives in those per-locale .njk files (src/board.fr.njk etc.).
 * THIS file holds the chrome strings — nav labels, footer labels, buttons,
 * common UI — looked up from base.njk + includes via `{{ t.nav.home }}`
 * style. Adding a new chrome string: add it under each language key here;
 * surface it from a template with `{% set t = i18n[page.lang or "en"] %}`
 * (already plumbed in base.njk).
 *
 * NOT translated here
 * -------------------
 * - Anything inside per-page .njk source — that goes in the page itself.
 * - Anything inside src/_data/board.json — member bios stay in whichever
 *   language the member submitted them (matches NetSec's approach).
 * - Personal names, dates, URLs, ESSC / EISS / Stripe brand strings.
 *
 * Maintenance
 * -----------
 * - The English catalog is the source of truth.
 * - When you add a key, ADD IT TO ALL THREE LANGUAGE OBJECTS. The drift
 *   script (scripts/check-i18n-drift.py) doesn't validate this catalog
 *   structure — that's a manual discipline.
 * - The `betaRibbon` strings appear on every FR/DE page until a native
 *   reviewer signs off and changes `status` in data/i18n-state.json.
 */

const locales = {
  en: {
    code: "en",
    name: "English",
    htmlLang: "en",
    news: {
      eyebrow: "Latest",
      heading: "Latest news",
      lead: "Recent news from the EISS network: conferences, publications, and milestones.",
      viewAll: "All news",
      readMore: "Read more",
      pageTitle: "News",
      pageLead: "News from the European Initiative for Security Studies: conferences, publications, prizes, and partnership milestones.",
      empty: "No news yet.",
      feedTitle: "EISS news",
      feedLabel: "RSS feed",
      types: { paper: "Publication", event: "Event", press: "In the press", podcast: "Podcast", news: "News" },
    },
    prizes: {
      eyebrow: "Recognition",
      title: "The European Security Studies Prize",
      lead: "Awarded each year at the conference for the best paper by an early-career researcher, jointly with the Journal of Strategic Studies.",
      bestPaperHeading: "Laureates",
      bestPaperIntro: "Each laureate's paper sits in the Anthology, with its abstract, published version and citation.",
      readEntry: "Read in the Anthology",
      partner: "In partnership with the Journal of Strategic Studies",
      seeAll: "See all prize papers in the Anthology",
    },
    htmlNameInOwnLang: "English",

    nav: {
      home: "Home",
      conferences: "Annual Conference",
      navigator: "Navigator",
      programmes: "Activities",
      initiative: "The Initiative",
      people: "People",
      membership: "Membership",
      events: "Events",
      brandLabel: "EISS",
    },
    skipLink: "Skip to content",

    themeToggle: {
      switchToDark: "Switch to dark mode",
      switchToLight: "Switch to light mode",
    },

    search: {
      buttonLabel: "Search the site",
      title: "Search",
      placeholder: "Search conferences, people, programmes…",
      inputLabel: "Search the site",
      resultsLabel: "Search results",
      close: "Close search",
      hint: "Press Esc to close",
      noResults: "No results found. Try a different search.",
      unavailable: "Search is available on the published site.",
      searching: "Searching…",
    },

    langSwitcher: {
      label: "Language",
      en: "EN",
      fr: "FR",
      de: "DE",
      enTitle: "English",
      frTitle: "Français (bêta)",
      deTitle: "Deutsch (Beta)",
    },

    roadmap: {
      eyebrow: "Where we're headed",
      heading: "Roadmap",
      lead: "What's shipped, what's in progress, and what's planned for this website. Each version below maps to a release on GitHub; the in-flight ones show live progress from their issue milestones.",
      updatedLabel: "Last updated",
      statusKey: "Status",
      status: {
        shipped: "Shipped",
        inProgress: "In progress",
        planned: "Planned",
        deferred: "Under watch",
      },
      releaseNotes: "Release notes",
      changesNoun: "changes",
      progressLabel: "{closed} of {total} issues closed so far",
      underWatch: "Under watch",
      underWatchSub: "No committed release, waiting on a trigger",
      ctaLead: "Spotted something missing, or have an idea? The roadmap is public and so is the backlog.",
      ctaIssue: "Suggest or report",
      ctaMilestones: "Browse milestones",
      ctaReleases: "All releases",
    },

    film: {
      tapForSound: "Tap for sound",
      toggleSound: "Toggle sound",
      watchOnYouTube: "Watch on YouTube",
      play: "Play the film",
    },

    pressKit: {
      eyebrow: "Brand and media",
      heading: "Press kit",
      lead: "Logos, colours, and the rules for reusing the EISS brand. For journalists, partner institutions, and anyone publishing about the Initiative.",
      logosHeading: "Logos",
      logosLead: "Use the mark on its own where space is tight, the lockup in headers, and the full logo where the tagline reads clearly. SVG is preferred wherever the renderer supports it.",
      downloadLabel: "Download",
      logoMarkName: "Constellation mark",
      logoMarkDesc: "The network symbol on its own. Favicons, app icons, tight spaces.",
      logoLockupName: "Lockup",
      logoLockupDesc: "Mark plus the EiSS wordmark, no tagline. Headers and navigation.",
      logoFullName: "Full logo",
      logoFullDesc: "Mark, wordmark, and tagline together. Hero areas and printed material.",
      logoFullPngName: "Full logo (PNG)",
      logoFullPngDesc: "High-resolution raster for contexts that cannot use SVG.",
      coloursHeading: "Colours",
      coloursLead: "Two blues carry the brand. The lighter tone draws the constellation, the darker carries the wordmark and tagline.",
      colourNetworkName: "Network blue",
      colourNetworkUse: "Constellation dots and connecting lines",
      colourBrandName: "Brand blue",
      colourBrandUse: "Wordmark and tagline",
      typographyHeading: "Typography",
      typographyLead: "The site sets its copy in Inter, a humanist sans-serif chosen for clarity on screen at small sizes. Where Inter is unavailable, fall back to the system sans-serif stack.",
      doDontHeading: "Do and don't",
      doHeading: "Please do",
      dontHeading: "Please don't",
      do1: "Keep clear space around the logo equal to the height of the constellation mark.",
      do2: "Use the supplied files at native proportions, scaling width and height together.",
      do3: "Place the logo on a plain light or dark background with enough contrast.",
      dont1: "Recolour the mark or apply gradients, shadows, or other effects.",
      dont2: "Stretch, squash, or rotate the logo, or crop the constellation.",
      dont3: "Set the logo on a busy photograph or a low-contrast background.",
      attributionHeading: "Attribution",
      attributionLead: "When citing or crediting the Initiative, use the canonical name and link. This is the same wording carried on our licensing terms.",
      attributionString: "European Initiative for Security Studies — eiss-europa.com",
      copyLabel: "Copy",
      copiedLabel: "Copied",
    },

    licensing: {
      eyebrow: "Licensing & reuse",
      heading: "Licensing & reuse",
      lead: "How you may reuse what's on this site. The code is open source, the content is yours to share with credit, and a few things are kept aside.",
      codeHeading: "The code: MIT",
      contentHeading: "The content: CC BY 4.0",
      attributionLabel: "When you reuse the content, please credit it as:",
      carveoutHeading: "Member photos and biographies",
      carveoutBody: "The Creative Commons licence above does not cover the photographs and biographies of our board, community, and contributing members. Those entries belong to the people they depict, who have shared them with their consent for use on this site. Please do not reuse a member's photo or biography without that person's agreement.",
      thirdPartyHeading: "Bundled third-party assets",
      thirdPartyLead: "Some assets we ship with the site are the work of others and keep their own licences:",
      thirdPartyImages: "Conference and programme photographs credited in the site footer remain the property of their respective owners and are not covered by CC BY 4.0.",
      questionsHeading: "Questions",
      questionsBody: "If you would like to reuse something and you are not sure which terms apply, write to us at",
    },

    footer: {
      tagline: "The largest and most diverse European gathering of scholars and practitioners on security issues.",
      conferencesHeading: "Conferences",
      programmesHeading: "Programmes",
      aboutHeading: "About",
      conferencesItems: {
        c2026: "2026 — Stockholm",
        c2025: "2025 — Thessaloniki",
        c2024: "2024 — Prague",
        allPast: "All past conferences",
        navigator: "Anthology",
      },
      programmesItems: {
        netsec: "NetSec Summer School",
        euroswamos: "Euro-SWAMOS",
        coercion: "Coercive Statecraft",
        globalRisks: "Global Risks Survey",
      },
      aboutItems: {
        initiative: "The Initiative",
        people: "The People",
        membership: "Membership",
        newsletter: "Newsletter",
        contact: "Contact",
      },
      followUs: "Follow us",
      socialLabel: {
        linkedin: "EISS on LinkedIn",
        twitter: "EISS on Twitter / X",
        youtube: "EISS on YouTube",
      },
      copyright: "© Copyright 2018 — {{year}} European Initiative for Security Studies — All rights reserved | Tous droits réservés. Any third-party image and content remains the property of its owners as indicated in their respective description, unless specified otherwise below.",
      imageCredits: "Euro-SWAMOS images © Marine Nationale, EEAS, État-Major des Armées, NATO CCDCOE. Prague image cc-by-2.0 Moyan Brenn. Barcelona image royalty-free stock photo (ID: 1795930126 Pajor Pawel).",
      legalStatus: "EISS is a registered charity (W751263001) under French law. | L'EISS est une association loi 1901 enregistrée sous le numéro W751263001 au Répertoire National des Associations, et appartenant au champ de l'économie sociale et solidaire.",
      legalLinks: {
        terms: "Terms and Conditions",
        privacy: "Privacy Policy",
        accessibility: "Accessibility",
        sitemap: "Site map",
        roadmap: "Roadmap",
        licensing: "Licensing",
        pressKit: "Press kit",
      },
      // Authorship credit shown on the very last line of the footer, next
      // to the legal-links row. The name itself links to the author's
      // board card at /board.html#<slug>. Locale-specific verb + author
      // name; the linked label is constant.
      authorship: {
        prefix: "Site designed and built by",
        authorName: "Dr Arthur PB Laudrain",
        authorSlug: "arthur-laudrain",
      },
    },

    betaRibbon: {
      text: "Beta translation. The English version is authoritative.",
      goToEnglish: "View in English",
      // English never shows the ribbon, but the strings still need to
      // exist for symmetry with fr/de.
    },

    untranslatedNotice: {
      // Shown when the user lands on /something.fr.html for a page that
      // doesn't actually have a French translation yet — they get
      // redirected to the language homepage instead, with this banner.
      text: "This page is not yet available in {{language}}. You're seeing the {{language}} home page. The original page is available in English.",
      backToOriginal: "View the original page in English",
    },

    indicoEvents: {
      // Section heading + actions for the auto-synced upcoming-events
      // list pulled from indico.eiss-europa.com. Visible on /index and
      // /events when src/_data/indico.json has upcoming entries; the
      // whole section is hidden when the list is empty.
      sectionEyebrow: "Upcoming events",
      sectionHeading: "Events on Indico",
      sectionLead: "Network roundtables, summer schools, and policy workshops. Free and open to all. Registration and full details on Indico.",
      viewAll: "View all events on Indico",
      addToCalendar: "Add to calendar",
      lastSynced: "Last refreshed",
      noEventsTitle: "No upcoming events on Indico yet",
      noEventsBody: "When EISS, NetSec, or partner institutions publish events through indico.eiss-europa.com, they'll appear here automatically.",
    },

    pastEvents: {
      // The "Past events" section on /events: a hand-maintained record of
      // past members' events (src/_data/pastEvents.js). These are
      // members-only on Indico, so they are not linked there. Automating
      // the refresh is tracked in issue #401.
      sectionEyebrow: "Past events",
      sectionHeading: "Members' events",
      sectionLead: "A record of recent members' events, the seminars and book talks proposed and hosted by the EISS community.",
    },

    netsec: {
      // Labels for the "EISS people leading NetSec" strip on /initiative.
      // The role titles themselves live in src/_data/netsec.js (English,
      // shared across locales). These keys localise the framing + the
      // dual-affiliation tag under each person.
      leadEyebrow: "EISS people leading NetSec",
      leadIntro: "The two organisations share more than a founding link. Almost everyone steering NetSec also sits on the EISS board, holding a role in each.",
      dualBoard: "EISS board",
      dualSupport: "EISS support team",
      officerRoles: {
        "Secretary-General": "EISS Secretary-General",
        "Treasurer": "EISS Treasurer",
        "Founding Director": "EISS Founding Director",
      },
    },

    confTour: {
      // ESSC edition tour list on /initiative, extracted into the shared
      // src/_includes/conf-tour.njk partial (issue #606). The markup is
      // identical across locales; only the text below differs. `editions`
      // is reverse-chronological (most recent first). Each entry carries
      // its own year, ordinal label, host, link label, and an optional
      // `flag` (ISO-3166 alpha-2, drives the flag SVG + alt). The 2020
      // edition was DEFERRED to 2021 (COVID-19), so it has no flag and an
      // `online` flag for the muted styling; the 2017 inaugural carries
      // `inaugural` for its accent. The key set (not the array contents)
      // is what the parity checker compares, so the array stays drift-clean.
      ariaLabel: "ESSC editions, most recent first",
      editions: [
        { year: "2026", ordinal: "9th", flag: "se", country: "Sweden", city: "Stockholm", host: "Stockholm University", slug: "/2026.html", link: "Programme" },
        { year: "2025", ordinal: "8th", flag: "gr", country: "Greece", city: "Thessaloniki", host: "University of Macedonia", slug: "/2025.html", link: "Recap" },
        { year: "2024", ordinal: "7th", flag: "cz", country: "Czech Republic", city: "Prague", host: "Charles University", slug: "/2024.html", link: "Recap" },
        { year: "2023", ordinal: "6th", flag: "es", country: "Spain", city: "Barcelona", host: "IBEI (Institut Barcelona d'Estudis Internacionals)", slug: "/2023.html", link: "Recap" },
        { year: "2022", ordinal: "5th", flag: "de", country: "Germany", city: "Berlin", host: "Hertie School", slug: "/2022.html", link: "Recap" },
        { year: "2021", ordinal: "4th", flag: "pt", country: "Portugal", city: "Lisbon", host: "ISCTE — University Institute of Lisbon", slug: "/2021.html", link: "Recap" },
        { year: "2020", ordinal: "Deferred", online: true, city: "Deferred to 2021", host: "Postponed (COVID-19); held in Lisbon in 2021", slug: "/2020.html", link: "Details" },
        { year: "2019", ordinal: "3rd", flag: "fr", country: "France", city: "Paris", host: "Sciences Po CERI", slug: "/2019.html", link: "Recap" },
        { year: "2018", ordinal: "2nd", flag: "fr", country: "France", city: "Paris", host: "Université Panthéon-Assas", slug: "/2018.html", link: "Recap" },
        { year: "2017", ordinal: "Inaugural", inaugural: true, flag: "fr", country: "France", city: "Paris", host: "Université Panthéon-Assas", slug: "/2017.html", link: "Recap" },
      ],
    },

    programme: {
      // Live programme grid on /YYYY pages. Pulled from Indico's
      // timetable every day and rendered alongside the polished PDF
      // (see docs/indico-programme-integration.md for the rationale).
      eyebrow: "Live from Indico",
      heading: "Programme",
      lead: "This programme is synchronised on a daily basis from Indico. Changes may appear with a slight delay.",
      daysNav: "Jump to a day",
      chairedBy: "Chair",
      discussants: "Discussants",
      showContributions: "View papers",
      presenter: "Presenter",
      readFullAbstract: "Read full abstract",
      showLess: "Show less",
      openInAnthology: "Open in the Anthology",
      sourceNote: "Indico holds the authoritative programme. This grid is a daily snapshot.",
      viewOnIndico: "View the event on Indico",
      speakersLink: "Anthology",
      speakersSignpostEdition: "This edition's papers and speakers, within the full archive since 2017.",
      // Livestream signpost + per-session pill (replaces the old standalone
      // "Livestreamed sessions" block).
      livestreamPill: "Livestream",
      livestreamNote: "The plenary sessions are livestreamed, tagged below.",
      livestreamNoteCta: "Join online on Indico",
      // Static PDF block — surfaces the polished designer-made
      // programme when the operator has uploaded one (see
      // conferences.js `programmePdf` field). The grid above is
      // always live; this block is the archival / printable artefact.
      pdfHeading: "Final programme (printable PDF)",
      pdfHeadingDraft: "Working programme (printable PDF, subject to change)",
      pdfDescription: "A polished, print-friendly version of the programme.",
      pdfDescriptionDraft: "A working version of the programme. The live grid above reflects the latest changes.",
      pdfOpen: "Open in new tab",
      pdfDownload: "Download",
    },

    // "Speaking or chairing?" card shown just before the programme on
    // /YYYY pages, pointing speakers/chairs to Indico + a one-click print.
    speakerCard: {
      heading: "Speaking or chairing?",
      body: "Edit your session or contributions and request a visa letter in the",
      ctaFaq: "conference FAQ",
      ctaPdf: "download the programme (PDF)",
    },

    livestream: {
      // Livestreamed-sessions block above the static PDF programme on
      // /YYYY pages. Populated from src/_data/indico.json by
      // scripts/sync-indico.py — sessions whose sessionCode is in
      // LIVESTREAM_SESSION_CODES (INTRO / RT / KEY / CONC), plus a
      // title-prefix fallback for roundtables. Hidden when the year
      // has no livestreamed sessions.
      sectionEyebrow: "Live from Indico",
      sectionHeading: "Livestreamed sessions",
      sectionLead: "The plenary spine of the conference (introduction, roundtables, keynote, and closing), streamed online. Join-online links appear here as soon as they're published in Indico.",
      onlineRoomTba: "Online room TBA",
      joinOnline: "Join online",
      viewSession: "View on Indico",
      lastSynced: "Last refreshed",
      // Per-session type labels — surfaced as a small eyebrow on each
      // card so attendees can scan the type at a glance.
      types: {
        introduction: "Introduction",
        roundtable: "Roundtable",
        keynote: "Keynote",
        conclusion: "Closing",
      },
    },

    notFound: {
      // 404 page strings. GitHub Pages auto-serves /404.html for any
      // unmatched path on the apex domain, so this surfaces whenever
      // someone hits a typo'd URL or follows a stale link.
      eyebrow: "404",
      heading: "We couldn't find that page",
      body: "The page you tried to reach doesn't exist, or it moved during the migration off Mobirise. The links below cover most of what people look for.",
      backHome: "Back to the home page",
      tryInstead: "Try one of these instead",
      quickLinks: {
        nextConference: "Next ESSC conference",
        pastConferences: "Past conferences",
        membership: "Membership",
        board: "The board",
        events: "Network events",
        initiative: "About the Initiative",
      },
    },

    boardPage: {
      // Strings used by src/_includes/person-card.njk on /board.
      researchThemes: "Research themes",
      readMore: "Read more",
      readLess: "Read less",
      linksAriaLabel: "Links",
      // Tooltip + accessible name for the mic icon shown next to people
      // who are chairing, discussing, or speaking at the live ESSC
      // edition (matched against the Indico programme at build time).
      esscSpeakerTitle: "Chairing or speaking at the current ESSC",
      // Profile dialog (board cards with a bio or recent publications):
      // the trigger label, the close button, and the heading above a
      // member's recent ORCID publications inside the dialog.
      viewProfile: "View profile",
      close: "Close",
      recentPublications: "Recent publications",
      backToPeople: "Back to People",
      // Heading + link for the embedded list of a member's conference papers
      // on their profile page. esscContributions is the "see also" link to
      // their filterable entry in the Conference Navigator.
      esscPapers: "Conference papers",
      esscContributions: "View in the Anthology",
    },

    registrationBadge: {
      // Live status badge on annual conference pages (/2026, /2027, ...).
      // Status is computed at build time from conferences.js dates and
      // today's date, with a manual `registrationStatus` override on
      // each conference entry (the Indico anonymous API doesn't expose
      // registration-form state). The Indico URL comes from
      // src/_data/indico.json (annualConferences[year].url).
      upcoming: "Registration open",
      closed: "Registration closed",
      happeningNow: "Happening now",
      past: "Past edition",
      registerOnIndico: "Register on Indico",
      daysToGo: "{{n}} days to go",
      oneDayToGo: "Tomorrow",
      today: "Today",
      onIndico: "View on Indico",
    },

    navigator: {
      // The European Security Studies Anthology (#756): the unified archive
      // over every EISS annual conference and workshop. Short form "Anthology"
      // / "the Anthology". (The i18n key stays `navigator` and the URLs stay
      // /speakers + /papers; only the public name changed.) These cover the
      // page header + the by-person / by-paper view toggle; the two panels
      // reuse the speakers.* and papers.* blocks below.
      eyebrow: "EISS conferences & workshops",
      title: "The European Security Studies Anthology",
      lead: "Every paper presented at an EISS annual conference or workshop since 2017, and everyone who presented it. Many now carry an abstract, citation details and a link to the published version where we have one. Browse by person or by paper, and filter by year or theme.",
      byPerson: "By person",
      byPaper: "By paper",
      promoBody: "The full record of EISS scholarship: every speaker and every paper from our annual conferences and workshops since 2017, with abstracts, citation details and links to the published versions. Browse by person or by paper.",
      cta: "Open the Anthology",
      initiativeLink: "Browse every speaker and paper in the Anthology",
      // Module-level "early access" notice, rendered once by archive-page.njk
      // (so it covers /speakers and /papers in every locale). The FR/DE bodies
      // also note that the individual paper pages are English-only.
      earlyAccessBadge: "Early access",
      earlyAccessBody: "The Anthology is an early-access preview. We are still filling it in, edition by edition, with abstracts, citation details and links to published versions, so some entries are still sparse. Found a gap or a mistake?",
      earlyAccessCta: "Let us know",
    },

    speakers: {
      // /speakers index (EN + FR + DE share one include, this is the
      // chrome). Speaker names, paper titles, affiliations and the theme
      // labels stay in their original language (see `note`).
      eyebrow: "The ESSC corpus",
      title: "Speakers",
      lead: "Everyone who has presented at a European Security Studies Conference, drawn from the programmes of every edition. Listed by surname, with the most recent affiliation on record. Use the site search to find a specific name.",
      statSpeakers: "speakers",
      statConferences: "conferences",
      statConferencesSince: "since 2017",
      statPapers: "papers presented",
      findPlaceholder: "Find by name…",
      findLabel: "Find a speaker by name",
      themeLabel: "Theme",
      allThemes: "All themes",
      clear: "Clear",
      jumpToLetter: "Jump to letter",
      memberBadge: "EISS member",
      netsecProfile: "NetSec profile",
      contributionOne: "contribution",
      contributionMany: "contributions",
      note: "Assembled from the published conference programmes. Names are matched conservatively, so a person who appears under noticeably different spellings across years may show more than once. Themes are inferred from the panel each paper sat in (the nine permanent EISS sections plus recurring themes). Names, affiliations and theme labels stay in their original language.",
      // Live-region status strings, read by speaker-filter.js. {n}/{q}
      // are substituted client-side.
      resultsOne: "{n} speaker",
      resultsMany: "{n} speakers",
      noMatch: "No speakers match.",
      matching: 'matching "{q}"',
      eventLabel: "Event",
      allEvents: "All events",
      attendedLabel: "Editions attended",
    },

    papers: {
      // /papers index (EN + FR + DE share one include, this is the
      // chrome). Paper titles, author names, affiliations, panel names and
      // theme labels stay in their original language (see `note`).
      eyebrow: "The ESSC corpus",
      title: "Papers",
      lead: "Every paper presented at a European Security Studies Conference, drawn from the programmes of every edition. Browse the whole corpus, or filter by year and theme. Use the site search to find a specific title or author.",
      statPapers: "papers presented",
      statEditions: "editions",
      statEditionsSince: "since 2017",
      findPlaceholder: "Find by title or author…",
      findLabel: "Find a paper by title or author",
      yearLabel: "Year",
      allYears: "All years",
      themeLabel: "Theme",
      allThemes: "All themes",
      publishedOnly: "Published only",
      prizeOnly: "European Security Studies Prize",
      clear: "Clear",
      note: "Assembled from the published conference programmes. Themes are inferred from the panel each paper sat in (the nine permanent EISS sections plus recurring themes), so a paper may carry more than one or none. Titles, author names, affiliations and theme labels stay in their original language.",
      // Live-region status strings, read by paper-filter.js. {n}/{q} are
      // substituted client-side.
      resultsOne: "{n} paper",
      resultsMany: "{n} papers",
      noMatch: "No papers match.",
      matching: 'matching "{q}"',
    },

    outputs: {
      // /outputs (EN + FR + DE share one include). Member publication
      // titles/journals stay in their original language (lang="en").
      eyebrow: "What we produce",
      title: "Publications & outputs",
      lead: "The work the EISS network produces, and the research our members publish in their own right.",
      networkHeading: "EISS publications",
      networkIntro: "The network's own outputs: the book series, policy briefs, white papers, and survey results. This catalogue is being assembled.",
      globalRisksLabel: "Global Risks to the EU — survey results",
      membersHeading: "Recent publications by our members",
      membersIntro: "Distinct from the network's own publications above, these are recent works our board and community members have published in their own right, drawn live from their public ORCID records.",
      sourceNote: "Pulled from members' public ORCID records and refreshed weekly. Members who add their ORCID iD to the directory form appear here automatically.",
      empty: "No member works to show yet.",
    },

    mapEmbed: {
      // Google Maps embed on /YYYY venue sections. Only the iframe
      // title is i18n'd; the embed loads on page view, and is disclosed
      // under /policy §5. See src/_includes/map-embed.njk.
      viewOnMap: "View on OpenStreetMap",
    },

    countdown: {
      daysToGo: "{n} days until ESSC {year}",
      oneDay: "ESSC {year} starts tomorrow",
      today: "ESSC {year} starts today",
    },

    archiveProgramme: {
      eyebrow: "From the archive",
      heading: "Conference programme",
      lead: "The full programme of panels, roundtables and papers, as it ran. Open a session to see its papers and speakers.",
      reconstructedNote: "Reconstructed from the conference's final printed programme.",
    },
  },

  fr: {
    code: "fr",
    news: {
      eyebrow: "Actualités",
      heading: "Dernières actualités",
      lead: "Les actualités récentes du réseau EISS : conférences, publications et temps forts.",
      viewAll: "Toutes les actualités",
      readMore: "Lire la suite",
      pageTitle: "Actualités",
      pageLead: "Les actualités de l'Initiative européenne pour les études de sécurité : conférences, publications, prix et étapes du partenariat.",
      empty: "Aucune actualité pour l'instant.",
      feedTitle: "Actualités EISS",
      feedLabel: "Flux RSS",
      types: { paper: "Publication", event: "Événement", press: "Dans la presse", podcast: "Podcast", news: "Actualité" },
    },
    prizes: {
      eyebrow: "Distinctions",
      title: "European Security Studies Prize",
      lead: "Décerné chaque année lors de la conférence pour le meilleur article d'un jeune chercheur, conjointement avec le Journal of Strategic Studies.",
      bestPaperHeading: "Lauréats",
      bestPaperIntro: "L'article de chaque lauréat figure dans l'Anthologie, avec son résumé, sa version publiée et sa citation.",
      readEntry: "Lire dans l'Anthologie",
      partner: "En partenariat avec le Journal of Strategic Studies",
      seeAll: "Voir tous les articles primés dans l'Anthologie",
    },
    name: "French",
    htmlLang: "fr",
    htmlNameInOwnLang: "Français",

    nav: {
      home: "Accueil",
      conferences: "Conférence annuelle",
      navigator: "Navigateur",
      programmes: "Activités",
      initiative: "L'Initiative",
      people: "L'équipe",
      membership: "Adhésion",
      events: "Événements",
      brandLabel: "EISS",
    },
    skipLink: "Aller au contenu",

    themeToggle: {
      switchToDark: "Passer au mode sombre",
      switchToLight: "Passer au mode clair",
    },

    search: {
      buttonLabel: "Rechercher sur le site",
      title: "Recherche",
      placeholder: "Rechercher conférences, personnes, activités…",
      inputLabel: "Rechercher sur le site",
      resultsLabel: "Résultats de recherche",
      close: "Fermer la recherche",
      hint: "Appuyez sur Échap pour fermer",
      noResults: "Aucun résultat. Essayez une autre recherche.",
      unavailable: "La recherche est disponible sur le site publié.",
      searching: "Recherche en cours…",
    },

    langSwitcher: {
      label: "Langue",
      en: "EN",
      fr: "FR",
      de: "DE",
      enTitle: "English",
      frTitle: "Français (bêta)",
      deTitle: "Deutsch (Beta)",
    },

    roadmap: {
      eyebrow: "Où nous allons",
      heading: "Feuille de route",
      lead: "Ce qui est publié, en cours et prévu pour ce site. Chaque version ci-dessous correspond à une publication sur GitHub ; celles en cours affichent l’avancement en direct de leurs jalons.",
      updatedLabel: "Dernière mise à jour",
      statusKey: "Statut",
      status: {
        shipped: "Publié",
        inProgress: "En cours",
        planned: "Prévu",
        deferred: "À surveiller",
      },
      releaseNotes: "Notes de version",
      changesNoun: "changements",
      progressLabel: "{closed} sur {total} tâches terminées à ce jour",
      underWatch: "À surveiller",
      underWatchSub: "Aucune version engagée, en attente d’un déclencheur",
      ctaLead: "Vous avez remarqué un oubli ou vous avez une idée ? La feuille de route est publique, tout comme la liste des tâches.",
      ctaIssue: "Proposer ou signaler",
      ctaMilestones: "Voir les jalons",
      ctaReleases: "Toutes les versions",
    },

    film: {
      tapForSound: "Touchez pour le son",
      toggleSound: "Activer ou couper le son",
      watchOnYouTube: "Voir sur YouTube",
      play: "Lire le film",
    },

    pressKit: {
      eyebrow: "Marque et médias",
      heading: "Kit presse",
      lead: "Logos, couleurs et règles de réutilisation de la marque EISS. À destination des journalistes, des institutions partenaires et de toute personne qui publie au sujet de l’Initiative.",
      logosHeading: "Logos",
      logosLead: "Utilisez le symbole seul lorsque l’espace est restreint, le verrouillage dans les en-têtes et le logo complet là où la signature reste lisible. Le format SVG est à privilégier dès que le moteur de rendu le permet.",
      downloadLabel: "Télécharger",
      logoMarkName: "Symbole constellation",
      logoMarkDesc: "Le symbole de réseau seul. Favicons, icônes d’application, espaces restreints.",
      logoLockupName: "Verrouillage",
      logoLockupDesc: "Le symbole et le logotype EiSS, sans signature. En-têtes et navigation.",
      logoFullName: "Logo complet",
      logoFullDesc: "Symbole, logotype et signature réunis. Zones d’en-tête et supports imprimés.",
      logoFullPngName: "Logo complet (PNG)",
      logoFullPngDesc: "Image matricielle haute résolution pour les contextes qui ne peuvent pas utiliser le SVG.",
      coloursHeading: "Couleurs",
      coloursLead: "Deux bleus portent la marque. Le ton le plus clair dessine la constellation, le plus foncé porte le logotype et la signature.",
      colourNetworkName: "Bleu réseau",
      colourNetworkUse: "Points de la constellation et lignes de connexion",
      colourBrandName: "Bleu de marque",
      colourBrandUse: "Logotype et signature",
      typographyHeading: "Typographie",
      typographyLead: "Le site compose son texte en Inter, une sans-serif humaniste choisie pour sa lisibilité à l’écran en petites tailles. Là où Inter n’est pas disponible, on revient à la pile sans-serif du système.",
      doDontHeading: "À faire et à éviter",
      doHeading: "À faire",
      dontHeading: "À éviter",
      do1: "Conservez autour du logo un espace de protection égal à la hauteur du symbole constellation.",
      do2: "Utilisez les fichiers fournis à leurs proportions natives, en redimensionnant largeur et hauteur ensemble.",
      do3: "Placez le logo sur un fond clair ou foncé uni offrant un contraste suffisant.",
      dont1: "Ne modifiez pas la couleur du symbole et n’appliquez ni dégradé, ni ombre, ni autre effet.",
      dont2: "N’étirez pas, ne comprimez pas et ne faites pas pivoter le logo, et ne recadrez pas la constellation.",
      dont3: "Ne posez pas le logo sur une photographie chargée ou sur un fond à faible contraste.",
      attributionHeading: "Attribution",
      attributionLead: "Pour citer ou créditer l’Initiative, utilisez le nom et le lien officiels. C’est la formulation reprise dans nos conditions de licence.",
      attributionString: "European Initiative for Security Studies — eiss-europa.com",
      copyLabel: "Copier",
      copiedLabel: "Copié",
    },

    licensing: {
      eyebrow: "Licences et réutilisation",
      heading: "Licences et réutilisation",
      lead: "Comment réutiliser ce qui se trouve sur ce site. Le code est libre, le contenu est à partager avec mention de la source, et quelques éléments sont réservés.",
      codeHeading: "Le code : MIT",
      contentHeading: "Le contenu : CC BY 4.0",
      attributionLabel: "Lorsque vous réutilisez le contenu, merci de le créditer ainsi :",
      carveoutHeading: "Photos et biographies des membres",
      carveoutBody: "La licence Creative Commons ci-dessus ne couvre pas les photographies ni les biographies de notre conseil, de notre communauté et de nos membres contributeurs. Ces éléments appartiennent aux personnes qu'ils représentent, qui les ont partagés avec leur consentement pour une utilisation sur ce site. Merci de ne pas réutiliser la photo ou la biographie d'un membre sans son accord.",
      thirdPartyHeading: "Ressources tierces intégrées",
      thirdPartyLead: "Certaines ressources que nous intégrons au site sont l'œuvre d'autres personnes et conservent leur propre licence :",
      thirdPartyImages: "Les photographies de conférences et de programmes créditées dans le pied de page restent la propriété de leurs détenteurs respectifs et ne sont pas couvertes par la licence CC BY 4.0.",
      questionsHeading: "Questions",
      questionsBody: "Si vous souhaitez réutiliser un élément et que vous ne savez pas quelles conditions s'appliquent, écrivez-nous à",
    },

    footer: {
      tagline: "Le plus grand et le plus divers rassemblement européen de chercheurs et praticiens sur les questions de sécurité.",
      conferencesHeading: "Conférences",
      programmesHeading: "Programmes",
      aboutHeading: "À propos",
      conferencesItems: {
        c2026: "2026 — Stockholm",
        c2025: "2025 — Thessalonique",
        c2024: "2024 — Prague",
        allPast: "Toutes les conférences passées",
        navigator: "Anthologie",
      },
      programmesItems: {
        netsec: "École d'été NetSec",
        euroswamos: "Euro-SWAMOS",
        coercion: "Coercition étatique",
        globalRisks: "Sondage Global Risks",
      },
      aboutItems: {
        initiative: "L'Initiative",
        people: "L'équipe",
        membership: "Adhésion",
        newsletter: "Lettre d'information",
        contact: "Contact",
      },
      followUs: "Suivez-nous",
      socialLabel: {
        linkedin: "EISS sur LinkedIn",
        twitter: "EISS sur Twitter / X",
        youtube: "EISS sur YouTube",
      },
      copyright: "© Copyright 2018 — {{year}} European Initiative for Security Studies — All rights reserved | Tous droits réservés. Toute image et tout contenu tiers restent la propriété de leurs détenteurs respectifs comme indiqué dans leur description, sauf mention contraire ci-dessous.",
      imageCredits: "Images Euro-SWAMOS © Marine Nationale, EEAS, État-Major des Armées, OTAN CCDCOE. Image de Prague cc-by-2.0 Moyan Brenn. Image de Barcelone photo de stock libre de droits (ID : 1795930126 Pajor Pawel).",
      legalStatus: "EISS is a registered charity (W751263001) under French law. | L'EISS est une association loi 1901 enregistrée sous le numéro W751263001 au Répertoire National des Associations, et appartenant au champ de l'économie sociale et solidaire.",
      legalLinks: {
        terms: "Conditions générales",
        privacy: "Politique de confidentialité",
        accessibility: "Accessibilité",
        sitemap: "Plan du site",
        roadmap: "Feuille de route",
        licensing: "Licences",
        pressKit: "Kit presse",
      },
      authorship: {
        prefix: "Site conçu et développé par",
        authorName: "Dr Arthur PB Laudrain",
        authorSlug: "arthur-laudrain",
      },
    },

    betaRibbon: {
      text: "Traduction bêta — la version anglaise fait foi.",
      goToEnglish: "Voir en anglais",
    },

    untranslatedNotice: {
      text: "Cette page n'est pas encore disponible en {{language}}. Vous voyez la page d'accueil en {{language}} ; la page originale est disponible en anglais.",
      backToOriginal: "Voir la page originale en anglais",
    },

    indicoEvents: {
      sectionEyebrow: "Événements à venir",
      sectionHeading: "Événements sur Indico",
      sectionLead: "Tables rondes du réseau, écoles d'été et ateliers politiques. Gratuits et ouverts à tous — inscriptions et détails complets sur Indico.",
      viewAll: "Voir tous les événements sur Indico",
      addToCalendar: "Ajouter au calendrier",
      lastSynced: "Dernière mise à jour",
      noEventsTitle: "Pas encore d'événements à venir sur Indico",
      noEventsBody: "Lorsque EISS, NetSec ou nos institutions partenaires publient des événements via indico.eiss-europa.com, ils apparaîtront ici automatiquement.",
    },

    pastEvents: {
      sectionEyebrow: "Événements passés",
      sectionHeading: "Événements des membres",
      sectionLead: "Un aperçu des événements récents des membres, séminaires et présentations d'ouvrages proposés et organisés par la communauté EISS.",
    },

    netsec: {
      leadEyebrow: "Des membres d'EISS à la direction de NetSec",
      leadIntro: "Les deux organisations partagent bien plus qu'un lien fondateur. Presque toutes les personnes qui pilotent NetSec siègent aussi au bureau d'EISS, avec une fonction dans chacune.",
      dualBoard: "Bureau d'EISS",
      dualSupport: "Équipe de soutien d'EISS",
      officerRoles: {
        "Secretary-General": "Secrétaire général d'EISS",
        "Treasurer": "Trésorière d'EISS",
        "Founding Director": "Directeur fondateur d'EISS",
      },
    },

    confTour: {
      // Voir le fichier EN pour la logique du partial conf-tour.njk (#606).
      ariaLabel: "Éditions de l'ESSC, de la plus récente à la première",
      editions: [
        { year: "2026", ordinal: "9<sup>e</sup>", flag: "se", country: "Suède", city: "Stockholm", host: "Université de Stockholm", slug: "/2026.html", link: "Programme" },
        { year: "2025", ordinal: "8<sup>e</sup>", flag: "gr", country: "Grèce", city: "Thessalonique", host: "Université de Macédoine", slug: "/2025.html", link: "Compte-rendu" },
        { year: "2024", ordinal: "7<sup>e</sup>", flag: "cz", country: "République tchèque", city: "Prague", host: "Université Charles", slug: "/2024.html", link: "Compte-rendu" },
        { year: "2023", ordinal: "6<sup>e</sup>", flag: "es", country: "Espagne", city: "Barcelone", host: "IBEI (Institut Barcelona d'Estudis Internacionals)", slug: "/2023.html", link: "Compte-rendu" },
        { year: "2022", ordinal: "5<sup>e</sup>", flag: "de", country: "Allemagne", city: "Berlin", host: "Hertie School", slug: "/2022.html", link: "Compte-rendu" },
        { year: "2021", ordinal: "4<sup>e</sup>", flag: "pt", country: "Portugal", city: "Lisbonne", host: "ISCTE — Institut Universitaire de Lisbonne", slug: "/2021.html", link: "Compte-rendu" },
        { year: "2020", ordinal: "Reportée", online: true, city: "Reportée à 2021", host: "Reportée (COVID-19), tenue à Lisbonne en 2021", slug: "/2020.html", link: "Détails" },
        { year: "2019", ordinal: "3<sup>e</sup>", flag: "fr", country: "France", city: "Paris", host: "Sciences Po CERI", slug: "/2019.html", link: "Compte-rendu" },
        { year: "2018", ordinal: "2<sup>e</sup>", flag: "fr", country: "France", city: "Paris", host: "Université Panthéon-Assas", slug: "/2018.html", link: "Compte-rendu" },
        { year: "2017", ordinal: "Inaugurale", inaugural: true, flag: "fr", country: "France", city: "Paris", host: "Université Panthéon-Assas", slug: "/2017.html", link: "Compte-rendu" },
      ],
    },

    programme: {
      eyebrow: "En direct depuis Indico",
      heading: "Programme",
      lead: "Ce programme est synchronisé quotidiennement depuis Indico. Les modifications peuvent apparaître avec un léger délai.",
      daysNav: "Aller à une journée",
      chairedBy: "Présidence",
      discussants: "Intervenants",
      showContributions: "Voir les communications",
      presenter: "Intervenant·e",
      readFullAbstract: "Lire le résumé complet",
      showLess: "Réduire",
      openInAnthology: "Ouvrir dans l'Anthologie",
      sourceNote: "Indico fait foi pour le programme. Cette grille en est un instantané quotidien.",
      viewOnIndico: "Voir l'événement sur Indico",
      speakersLink: "Anthologie",
      speakersSignpostEdition: "Les communications et intervenants de cette édition, au sein de l'archive complète depuis 2017.",
      livestreamPill: "En direct",
      livestreamNote: "Les sessions plénières sont diffusées en direct, signalées ci-dessous.",
      livestreamNoteCta: "Suivre en ligne sur Indico",
      pdfHeading: "Programme final — PDF imprimable",
      pdfHeadingDraft: "Programme provisoire — PDF imprimable (susceptible de changer)",
      pdfDescription: "Une version mise en page et imprimable du programme.",
      pdfDescriptionDraft: "Une version provisoire du programme — la grille en direct ci-dessus reflète les dernières modifications.",
      pdfOpen: "Ouvrir dans un nouvel onglet",
      pdfDownload: "Télécharger",
    },

    speakerCard: {
      heading: "Vous intervenez ou présidez ?",
      body: "Modifiez votre session ou vos communications et demandez une lettre de visa dans la",
      ctaFaq: "FAQ de la conférence",
      ctaPdf: "télécharger le programme (PDF)",
    },

    livestream: {
      sectionEyebrow: "En direct depuis Indico",
      sectionHeading: "Sessions diffusées en direct",
      sectionLead: "La colonne vertébrale de la conférence — introduction, tables rondes, conférence plénière et clôture — diffusée en ligne. Les liens de connexion apparaissent ici dès leur publication dans Indico.",
      onlineRoomTba: "Salle en ligne à venir",
      joinOnline: "Rejoindre en ligne",
      viewSession: "Voir sur Indico",
      lastSynced: "Dernière mise à jour",
      types: {
        introduction: "Introduction",
        roundtable: "Table ronde",
        keynote: "Conférence plénière",
        conclusion: "Clôture",
      },
    },

    notFound: {
      eyebrow: "404",
      heading: "Page introuvable",
      body: "La page que vous cherchez n'existe pas, ou a été déplacée lors de la migration depuis Mobirise. Les liens ci-dessous couvrent la plupart des destinations recherchées.",
      backHome: "Retour à l'accueil",
      tryInstead: "Essayez plutôt l'une de ces pages",
      quickLinks: {
        nextConference: "Prochaine conférence ESSC",
        pastConferences: "Conférences passées",
        membership: "Adhésion",
        board: "L'équipe",
        events: "Événements du réseau",
        initiative: "À propos de l'Initiative",
      },
    },

    boardPage: {
      researchThemes: "Thèmes de recherche",
      readMore: "Lire la suite",
      readLess: "Réduire",
      linksAriaLabel: "Liens",
      esscSpeakerTitle: "Préside ou intervient à l'ESSC en cours",
      viewProfile: "Voir le profil",
      close: "Fermer",
      recentPublications: "Publications récentes",
      backToPeople: "Retour à l'équipe",
      esscPapers: "Communications en conférence",
      esscContributions: "Voir dans l'Anthologie",
    },

    registrationBadge: {
      upcoming: "Inscriptions ouvertes",
      closed: "Inscriptions fermées",
      happeningNow: "En cours",
      past: "Édition passée",
      registerOnIndico: "S'inscrire sur Indico",
      daysToGo: "Dans {{n}} jours",
      oneDayToGo: "Demain",
      today: "Aujourd'hui",
      onIndico: "Voir sur Indico",
    },

    navigator: {
      eyebrow: "Conférences et ateliers de l'EISS",
      title: "L'Anthologie des études de sécurité européennes",
      lead: "Chaque communication présentée lors d'une conférence annuelle ou d'un atelier de l'EISS depuis 2017, et toutes les personnes qui les ont présentées. Beaucoup comportent désormais un résumé, des références de citation et un lien vers la version publiée lorsque nous en disposons. Parcourez par personne ou par communication, et filtrez par année ou par thème.",
      byPerson: "Par personne",
      byPaper: "Par communication",
      promoBody: "Le relevé complet des travaux de l'EISS : chaque intervenant et chaque communication de nos conférences annuelles et ateliers depuis 2017, avec les résumés, les références de citation et des liens vers les versions publiées. Parcourez par personne ou par communication.",
      cta: "Ouvrir l'Anthologie",
      initiativeLink: "Parcourez chaque intervenant et chaque communication dans l'Anthologie",
      earlyAccessBadge: "Accès anticipé",
      earlyAccessBody: "L'Anthologie est une version préliminaire en accès anticipé. Nous la complétons édition après édition (résumés, références de citation et liens vers les versions publiées), si bien que certaines entrées restent succinctes. Les pages individuelles des communications sont consultables en anglais. Vous avez repéré un manque ou une erreur ?",
      earlyAccessCta: "Signalez-le-nous",
    },

    speakers: {
      eyebrow: "Le corpus de l'ESSC",
      title: "Intervenants",
      lead: "Toutes les personnes ayant présenté lors d'une European Security Studies Conference, à partir des programmes de chaque édition. Classées par nom de famille, avec l'affiliation la plus récente connue. Utilisez la recherche du site pour trouver un nom précis.",
      statSpeakers: "intervenants",
      statConferences: "conférences",
      statConferencesSince: "depuis 2017",
      statPapers: "communications présentées",
      findPlaceholder: "Rechercher par nom…",
      findLabel: "Rechercher un intervenant par nom",
      themeLabel: "Thème",
      allThemes: "Tous les thèmes",
      clear: "Effacer",
      jumpToLetter: "Aller à une lettre",
      memberBadge: "Membre de l'EISS",
      netsecProfile: "Profil NetSec",
      contributionOne: "communication",
      contributionMany: "communications",
      note: "Constitué à partir des programmes publiés des conférences. Les noms sont rapprochés avec prudence : une personne apparaissant sous des graphies sensiblement différentes selon les années peut figurer plusieurs fois. Les thèmes sont déduits du panel dans lequel chaque communication a été présentée (les neuf sections permanentes de l'EISS et des thèmes récurrents). Les noms, affiliations et intitulés de thèmes restent dans leur langue d'origine.",
      resultsOne: "{n} intervenant",
      resultsMany: "{n} intervenants",
      noMatch: "Aucun intervenant ne correspond.",
      matching: 'correspondant à « {q} »',
      eventLabel: "Événement",
      allEvents: "Tous les événements",
      attendedLabel: "Éditions",
    },

    papers: {
      eyebrow: "Le corpus de l'ESSC",
      title: "Communications",
      lead: "Toutes les communications présentées lors d'une European Security Studies Conference, à partir des programmes de chaque édition. Parcourez l'ensemble du corpus ou filtrez par année et par thème. Utilisez la recherche du site pour trouver un titre ou un auteur précis.",
      statPapers: "communications présentées",
      statEditions: "éditions",
      statEditionsSince: "depuis 2017",
      findPlaceholder: "Rechercher par titre ou auteur…",
      findLabel: "Rechercher une communication par titre ou auteur",
      yearLabel: "Année",
      allYears: "Toutes les années",
      themeLabel: "Thème",
      allThemes: "Tous les thèmes",
      publishedOnly: "Publiées uniquement",
      prizeOnly: "European Security Studies Prize",
      clear: "Effacer",
      note: "Constitué à partir des programmes publiés des conférences. Les thèmes sont déduits du panel dans lequel chaque communication a été présentée (les neuf sections permanentes de l'EISS et des thèmes récurrents) : une communication peut en porter plusieurs ou aucun. Les titres, noms d'auteurs, affiliations et intitulés de thèmes restent dans leur langue d'origine.",
      resultsOne: "{n} communication",
      resultsMany: "{n} communications",
      noMatch: "Aucune communication ne correspond.",
      matching: 'correspondant à « {q} »',
    },

    outputs: {
      eyebrow: "Ce que nous produisons",
      title: "Publications et productions",
      lead: "Les travaux produits par le réseau EISS, et les recherches que nos membres publient à titre personnel.",
      networkHeading: "Publications de l'EISS",
      networkIntro: "Les productions propres du réseau : la collection d'ouvrages, des notes d'analyse, des livres blancs et des résultats d'enquêtes. Ce catalogue est en cours de constitution.",
      globalRisksLabel: "Risques globaux pour l'UE — résultats de l'enquête",
      membersHeading: "Publications récentes de nos membres",
      membersIntro: "Distinctes des publications propres du réseau ci-dessus, voici des travaux récents que les membres de notre bureau et de notre communauté ont publiés à titre personnel, tirés en direct de leurs fiches ORCID publiques.",
      sourceNote: "Extrait des fiches ORCID publiques des membres et actualisé chaque semaine. Les membres qui ajoutent leur identifiant ORCID au formulaire du répertoire apparaissent ici automatiquement.",
      empty: "Aucune publication de membre à afficher pour l'instant.",
    },

    mapEmbed: {
      viewOnMap: "Voir sur OpenStreetMap",
    },

    countdown: {
      daysToGo: "{n} jours avant l'ESSC {year}",
      oneDay: "L'ESSC {year} commence demain",
      today: "L'ESSC {year} commence aujourd'hui",
    },

    archiveProgramme: {
      eyebrow: "Depuis les archives",
      heading: "Programme de la conférence",
      lead: "Le programme complet des panels, tables rondes et communications, tel qu'il s'est déroulé. Ouvrez une session pour voir ses communications et intervenants.",
      reconstructedNote: "Reconstitué à partir du programme final imprimé de la conférence.",
    },
  },

  de: {
    code: "de",
    news: {
      eyebrow: "Aktuelles",
      heading: "Neuigkeiten",
      lead: "Aktuelle Neuigkeiten aus dem EISS-Netzwerk: Konferenzen, Publikationen und Meilensteine.",
      viewAll: "Alle Neuigkeiten",
      readMore: "Mehr lesen",
      pageTitle: "Aktuelles",
      pageLead: "Neuigkeiten der Europäischen Initiative für Sicherheitsstudien: Konferenzen, Publikationen, Preise und Meilensteine der Partnerschaft.",
      empty: "Noch keine Neuigkeiten.",
      feedTitle: "EISS-Neuigkeiten",
      feedLabel: "RSS-Feed",
      types: { paper: "Publikation", event: "Veranstaltung", press: "In der Presse", podcast: "Podcast", news: "Neuigkeit" },
    },
    prizes: {
      eyebrow: "Auszeichnungen",
      title: "European Security Studies Prize",
      lead: "Jährlich auf der Konferenz für den besten Beitrag einer Nachwuchswissenschaftlerin oder eines Nachwuchswissenschaftlers verliehen, gemeinsam mit dem Journal of Strategic Studies.",
      bestPaperHeading: "Preisträger",
      bestPaperIntro: "Der Beitrag jedes Preisträgers steht in der Anthologie, mit Abstract, veröffentlichter Fassung und Zitation.",
      readEntry: "In der Anthologie lesen",
      partner: "In Partnerschaft mit dem Journal of Strategic Studies",
      seeAll: "Alle prämierten Beiträge in der Anthologie ansehen",
    },
    name: "German",
    htmlLang: "de",
    htmlNameInOwnLang: "Deutsch",

    nav: {
      home: "Startseite",
      conferences: "Jahreskonferenz",
      navigator: "Navigator",
      programmes: "Aktivitäten",
      initiative: "Die Initiative",
      people: "Personen",
      membership: "Mitgliedschaft",
      events: "Veranstaltungen",
      brandLabel: "EISS",
    },
    skipLink: "Zum Inhalt springen",

    themeToggle: {
      switchToDark: "Zum dunklen Modus wechseln",
      switchToLight: "Zum hellen Modus wechseln",
    },

    search: {
      buttonLabel: "Website durchsuchen",
      title: "Suche",
      placeholder: "Konferenzen, Personen, Aktivitäten suchen…",
      inputLabel: "Website durchsuchen",
      resultsLabel: "Suchergebnisse",
      close: "Suche schließen",
      hint: "Esc zum Schließen drücken",
      noResults: "Keine Ergebnisse. Versuchen Sie eine andere Suche.",
      unavailable: "Die Suche ist auf der veröffentlichten Website verfügbar.",
      searching: "Suche läuft…",
    },

    langSwitcher: {
      label: "Sprache",
      en: "EN",
      fr: "FR",
      de: "DE",
      enTitle: "English",
      frTitle: "Français (bêta)",
      deTitle: "Deutsch (Beta)",
    },

    roadmap: {
      eyebrow: "Wohin es geht",
      heading: "Roadmap",
      lead: "Was veröffentlicht ist, in Arbeit ist und für diese Website geplant ist. Jede Version unten entspricht einer Veröffentlichung auf GitHub; die laufenden zeigen den Live-Fortschritt ihrer Meilensteine.",
      updatedLabel: "Zuletzt aktualisiert",
      statusKey: "Status",
      status: {
        shipped: "Veröffentlicht",
        inProgress: "In Arbeit",
        planned: "Geplant",
        deferred: "Unter Beobachtung",
      },
      releaseNotes: "Versionshinweise",
      changesNoun: "Änderungen",
      progressLabel: "{closed} von {total} Aufgaben bislang erledigt",
      underWatch: "Unter Beobachtung",
      underWatchSub: "Keine zugesagte Version, wartet auf einen Auslöser",
      ctaLead: "Fehlt etwas, oder haben Sie eine Idee? Die Roadmap ist öffentlich, ebenso der Aufgabenbestand.",
      ctaIssue: "Vorschlagen oder melden",
      ctaMilestones: "Meilensteine ansehen",
      ctaReleases: "Alle Versionen",
    },

    film: {
      tapForSound: "Für Ton tippen",
      toggleSound: "Ton ein- oder ausschalten",
      watchOnYouTube: "Auf YouTube ansehen",
      play: "Film abspielen",
    },

    pressKit: {
      eyebrow: "Marke und Medien",
      heading: "Pressekit",
      lead: "Logos, Farben und die Regeln für die Wiederverwendung der EISS-Marke. Für Journalistinnen und Journalisten, Partnereinrichtungen und alle, die über die Initiative veröffentlichen.",
      logosHeading: "Logos",
      logosLead: "Verwenden Sie das Symbol allein, wenn der Platz knapp ist, die Wort-Bild-Marke in Kopfzeilen und das vollständige Logo dort, wo der Claim gut lesbar bleibt. SVG ist zu bevorzugen, sobald das Ausgabegerät es unterstützt.",
      downloadLabel: "Herunterladen",
      logoMarkName: "Konstellationssymbol",
      logoMarkDesc: "Das Netzwerksymbol allein. Favicons, App-Icons, enge Räume.",
      logoLockupName: "Wort-Bild-Marke",
      logoLockupDesc: "Symbol und EiSS-Schriftzug, ohne Claim. Kopfzeilen und Navigation.",
      logoFullName: "Vollständiges Logo",
      logoFullDesc: "Symbol, Schriftzug und Claim zusammen. Hero-Bereiche und Druckmaterial.",
      logoFullPngName: "Vollständiges Logo (PNG)",
      logoFullPngDesc: "Hochauflösende Rastergrafik für Kontexte, die kein SVG verwenden können.",
      coloursHeading: "Farben",
      coloursLead: "Zwei Blautöne tragen die Marke. Der hellere Ton zeichnet die Konstellation, der dunklere trägt Schriftzug und Claim.",
      colourNetworkName: "Netzwerkblau",
      colourNetworkUse: "Punkte der Konstellation und Verbindungslinien",
      colourBrandName: "Markenblau",
      colourBrandUse: "Schriftzug und Claim",
      typographyHeading: "Typografie",
      typographyLead: "Die Website setzt ihren Text in Inter, einer humanistischen serifenlosen Schrift, die für die Lesbarkeit am Bildschirm in kleinen Größen gewählt wurde. Wo Inter nicht verfügbar ist, greift der serifenlose System-Schriftstapel.",
      doDontHeading: "Bitte beachten",
      doHeading: "Bitte tun",
      dontHeading: "Bitte vermeiden",
      do1: "Halten Sie um das Logo herum einen Schutzraum frei, der der Höhe des Konstellationssymbols entspricht.",
      do2: "Verwenden Sie die gelieferten Dateien in ihren nativen Proportionen und skalieren Sie Breite und Höhe gemeinsam.",
      do3: "Platzieren Sie das Logo auf einem schlichten hellen oder dunklen Hintergrund mit ausreichendem Kontrast.",
      dont1: "Färben Sie das Symbol nicht um und wenden Sie weder Verläufe noch Schatten oder andere Effekte an.",
      dont2: "Strecken, stauchen oder drehen Sie das Logo nicht und beschneiden Sie die Konstellation nicht.",
      dont3: "Setzen Sie das Logo nicht auf eine unruhige Fotografie oder einen kontrastarmen Hintergrund.",
      attributionHeading: "Namensnennung",
      attributionLead: "Verwenden Sie zum Zitieren oder Nennen der Initiative den offiziellen Namen und Link. Es ist dieselbe Formulierung, die unsere Lizenzbedingungen tragen.",
      attributionString: "European Initiative for Security Studies — eiss-europa.com",
      copyLabel: "Kopieren",
      copiedLabel: "Kopiert",
    },

    licensing: {
      eyebrow: "Lizenzen & Weiterverwendung",
      heading: "Lizenzen & Weiterverwendung",
      lead: "Wie Sie weiterverwenden dürfen, was auf dieser Website steht. Der Code ist quelloffen, die Inhalte dürfen Sie mit Quellenangabe teilen, und einige Dinge bleiben vorbehalten.",
      codeHeading: "Der Code: MIT",
      contentHeading: "Die Inhalte: CC BY 4.0",
      attributionLabel: "Wenn Sie die Inhalte weiterverwenden, nennen Sie bitte die Quelle so:",
      carveoutHeading: "Mitgliederfotos und Biografien",
      carveoutBody: "Die obige Creative-Commons-Lizenz gilt nicht für die Fotografien und Biografien unseres Vorstands, unserer Gemeinschaft und unserer beitragenden Mitglieder. Diese Einträge gehören den dargestellten Personen, die sie mit ihrer Zustimmung zur Nutzung auf dieser Website geteilt haben. Bitte verwenden Sie das Foto oder die Biografie eines Mitglieds nicht ohne dessen Einverständnis weiter.",
      thirdPartyHeading: "Eingebundene Ressourcen Dritter",
      thirdPartyLead: "Einige Ressourcen, die wir mit der Website ausliefern, stammen von anderen und behalten ihre eigene Lizenz:",
      thirdPartyImages: "Die im Seitenfuß genannten Konferenz- und Programmfotografien bleiben Eigentum ihrer jeweiligen Inhaber und fallen nicht unter die Lizenz CC BY 4.0.",
      questionsHeading: "Fragen",
      questionsBody: "Wenn Sie etwas weiterverwenden möchten und nicht sicher sind, welche Bedingungen gelten, schreiben Sie uns an",
    },

    footer: {
      tagline: "Die größte und vielfältigste europäische Versammlung von Wissenschaftlern und Praktikern zu Sicherheitsfragen.",
      conferencesHeading: "Konferenzen",
      programmesHeading: "Programme",
      aboutHeading: "Über uns",
      conferencesItems: {
        c2026: "2026 — Stockholm",
        c2025: "2025 — Thessaloniki",
        c2024: "2024 — Prag",
        allPast: "Alle vergangenen Konferenzen",
        navigator: "Anthologie",
      },
      programmesItems: {
        netsec: "NetSec Sommerschule",
        euroswamos: "Euro-SWAMOS",
        coercion: "Coercive Statecraft",
        globalRisks: "Global Risks-Umfrage",
      },
      aboutItems: {
        initiative: "Die Initiative",
        people: "Die Personen",
        membership: "Mitgliedschaft",
        newsletter: "Newsletter",
        contact: "Kontakt",
      },
      followUs: "Folgen Sie uns",
      socialLabel: {
        linkedin: "EISS auf LinkedIn",
        twitter: "EISS auf Twitter / X",
        youtube: "EISS auf YouTube",
      },
      copyright: "© Copyright 2018 — {{year}} European Initiative for Security Studies — All rights reserved | Tous droits réservés. Alle Drittanbieter-Bilder und -Inhalte bleiben das Eigentum ihrer jeweiligen Besitzer, wie in ihrer Beschreibung angegeben, sofern nicht anders unten vermerkt.",
      imageCredits: "Euro-SWAMOS Bilder © Marine Nationale, EEAS, État-Major des Armées, NATO CCDCOE. Prag-Bild cc-by-2.0 Moyan Brenn. Barcelona-Bild lizenzfreies Stockfoto (ID: 1795930126 Pajor Pawel).",
      legalStatus: "EISS is a registered charity (W751263001) under French law. | L'EISS est une association loi 1901 enregistrée sous le numéro W751263001 au Répertoire National des Associations, et appartenant au champ de l'économie sociale et solidaire.",
      legalLinks: {
        terms: "Allgemeine Geschäftsbedingungen",
        privacy: "Datenschutzerklärung",
        accessibility: "Barrierefreiheit",
        sitemap: "Sitemap",
        roadmap: "Roadmap",
        licensing: "Lizenzen",
        pressKit: "Pressekit",
      },
      authorship: {
        prefix: "Website konzipiert und entwickelt von",
        authorName: "Dr Arthur PB Laudrain",
        authorSlug: "arthur-laudrain",
      },
    },

    betaRibbon: {
      text: "Beta-Übersetzung — die englische Version ist verbindlich.",
      goToEnglish: "Auf Englisch anzeigen",
    },

    untranslatedNotice: {
      text: "Diese Seite ist noch nicht auf {{language}} verfügbar. Sie sehen die {{language}}-Startseite; die Originalseite ist auf Englisch verfügbar.",
      backToOriginal: "Originalseite auf Englisch ansehen",
    },

    indicoEvents: {
      sectionEyebrow: "Kommende Veranstaltungen",
      sectionHeading: "Veranstaltungen auf Indico",
      sectionLead: "Netzwerk-Runde-Tische, Sommerschulen und politische Workshops. Kostenlos und offen für alle — Anmeldung und vollständige Details auf Indico.",
      viewAll: "Alle Veranstaltungen auf Indico ansehen",
      addToCalendar: "Zum Kalender hinzufügen",
      lastSynced: "Zuletzt aktualisiert",
      noEventsTitle: "Noch keine kommenden Veranstaltungen auf Indico",
      noEventsBody: "Wenn EISS, NetSec oder Partnerinstitutionen Veranstaltungen über indico.eiss-europa.com veröffentlichen, erscheinen sie hier automatisch.",
    },

    pastEvents: {
      sectionEyebrow: "Vergangene Veranstaltungen",
      sectionHeading: "Veranstaltungen der Mitglieder",
      sectionLead: "Ein Rückblick auf die jüngsten Veranstaltungen der Mitglieder, Seminare und Buchvorstellungen, die von der EISS-Gemeinschaft vorgeschlagen und ausgerichtet wurden.",
    },

    netsec: {
      leadEyebrow: "EISS-Mitglieder in der NetSec-Leitung",
      leadIntro: "Die beiden Organisationen verbindet mehr als die gemeinsame Gründung. Fast alle, die NetSec leiten, sitzen auch im EISS-Vorstand und üben in beiden eine Funktion aus.",
      dualBoard: "EISS-Vorstand",
      dualSupport: "EISS-Unterstützungsteam",
      officerRoles: {
        "Secretary-General": "EISS-Generalsekretär",
        "Treasurer": "EISS-Schatzmeisterin",
        "Founding Director": "EISS-Gründungsdirektor",
      },
    },

    confTour: {
      // Siehe EN-Datei für die Logik des conf-tour.njk-Partials (#606).
      ariaLabel: "ESSC-Editionen, neueste zuerst",
      editions: [
        { year: "2026", ordinal: "9.", flag: "se", country: "Schweden", city: "Stockholm", host: "Universität Stockholm", slug: "/2026.html", link: "Programm" },
        { year: "2025", ordinal: "8.", flag: "gr", country: "Griechenland", city: "Thessaloniki", host: "Universität Makedonien", slug: "/2025.html", link: "Rückblick" },
        { year: "2024", ordinal: "7.", flag: "cz", country: "Tschechien", city: "Prag", host: "Karls-Universität", slug: "/2024.html", link: "Rückblick" },
        { year: "2023", ordinal: "6.", flag: "es", country: "Spanien", city: "Barcelona", host: "IBEI (Institut Barcelona d'Estudis Internacionals)", slug: "/2023.html", link: "Rückblick" },
        { year: "2022", ordinal: "5.", flag: "de", country: "Deutschland", city: "Berlin", host: "Hertie School", slug: "/2022.html", link: "Rückblick" },
        { year: "2021", ordinal: "4.", flag: "pt", country: "Portugal", city: "Lissabon", host: "ISCTE — Universitätsinstitut Lissabon", slug: "/2021.html", link: "Rückblick" },
        { year: "2020", ordinal: "Verschoben", online: true, city: "Auf 2021 verschoben", host: "Verschoben (COVID-19), 2021 in Lissabon abgehalten", slug: "/2020.html", link: "Details" },
        { year: "2019", ordinal: "3.", flag: "fr", country: "Frankreich", city: "Paris", host: "Sciences Po CERI", slug: "/2019.html", link: "Rückblick" },
        { year: "2018", ordinal: "2.", flag: "fr", country: "Frankreich", city: "Paris", host: "Université Panthéon-Assas", slug: "/2018.html", link: "Rückblick" },
        { year: "2017", ordinal: "Eröffnung", inaugural: true, flag: "fr", country: "Frankreich", city: "Paris", host: "Université Panthéon-Assas", slug: "/2017.html", link: "Rückblick" },
      ],
    },

    programme: {
      eyebrow: "Live von Indico",
      heading: "Programm",
      lead: "Dieses Programm wird täglich aus Indico synchronisiert. Änderungen können mit leichter Verzögerung erscheinen.",
      daysNav: "Zu einem Tag springen",
      chairedBy: "Vorsitz",
      discussants: "Diskutant:innen",
      showContributions: "Beiträge anzeigen",
      presenter: "Vortragende:r",
      readFullAbstract: "Vollständiges Abstract lesen",
      showLess: "Weniger anzeigen",
      openInAnthology: "In der Anthologie öffnen",
      sourceNote: "Indico ist die maßgebliche Quelle für das Programm. Dieses Raster ist ein tägliches Abbild.",
      viewOnIndico: "Veranstaltung auf Indico ansehen",
      speakersLink: "Anthologie",
      speakersSignpostEdition: "Die Beiträge und Vortragenden dieser Ausgabe, innerhalb des Gesamtarchivs seit 2017.",
      livestreamPill: "Livestream",
      livestreamNote: "Die Plenarsitzungen werden live übertragen, unten gekennzeichnet.",
      livestreamNoteCta: "Online auf Indico teilnehmen",
      pdfHeading: "Endgültiges Programm — druckbares PDF",
      pdfHeadingDraft: "Arbeitsversion des Programms — druckbares PDF (Änderungen vorbehalten)",
      pdfDescription: "Eine gestaltete und druckfreundliche Version des Programms.",
      pdfDescriptionDraft: "Eine Arbeitsversion des Programms — das Live-Raster oben zeigt den aktuellen Stand.",
      pdfOpen: "In neuem Tab öffnen",
      pdfDownload: "Herunterladen",
    },

    speakerCard: {
      heading: "Vortragen oder Vorsitz führen?",
      body: "Bearbeiten Sie Ihre Sitzung oder Beiträge und fordern Sie ein Visumschreiben an, in der",
      ctaFaq: "Konferenz-FAQ",
      ctaPdf: "Programm herunterladen (PDF)",
    },

    livestream: {
      sectionEyebrow: "Live von Indico",
      sectionHeading: "Live übertragene Sitzungen",
      sectionLead: "Das Rückgrat der Konferenz — Eröffnung, Runde Tische, Keynote und Abschluss — wird online übertragen. Beitritts-Links erscheinen hier, sobald sie in Indico veröffentlicht werden.",
      onlineRoomTba: "Online-Raum folgt",
      joinOnline: "Online beitreten",
      viewSession: "Auf Indico ansehen",
      lastSynced: "Zuletzt aktualisiert",
      types: {
        introduction: "Eröffnung",
        roundtable: "Runder Tisch",
        keynote: "Keynote",
        conclusion: "Abschluss",
      },
    },

    notFound: {
      eyebrow: "404",
      heading: "Seite nicht gefunden",
      body: "Die gesuchte Seite existiert nicht oder wurde während der Migration von Mobirise verschoben. Die folgenden Links decken die meisten Ziele ab.",
      backHome: "Zurück zur Startseite",
      tryInstead: "Versuchen Sie stattdessen eine dieser Seiten",
      quickLinks: {
        nextConference: "Nächste ESSC-Konferenz",
        pastConferences: "Vergangene Konferenzen",
        membership: "Mitgliedschaft",
        board: "Das Team",
        events: "Netzwerk-Veranstaltungen",
        initiative: "Über die Initiative",
      },
    },

    boardPage: {
      researchThemes: "Forschungsthemen",
      readMore: "Mehr lesen",
      readLess: "Weniger anzeigen",
      linksAriaLabel: "Links",
      esscSpeakerTitle: "Leitet oder spricht beim aktuellen ESSC",
      viewProfile: "Profil ansehen",
      close: "Schließen",
      recentPublications: "Neueste Veröffentlichungen",
      backToPeople: "Zurück zu den Personen",
      esscPapers: "Konferenzbeiträge",
      esscContributions: "In der Anthologie ansehen",
    },

    registrationBadge: {
      upcoming: "Anmeldung offen",
      closed: "Anmeldung geschlossen",
      happeningNow: "Findet jetzt statt",
      past: "Vergangene Ausgabe",
      registerOnIndico: "Auf Indico anmelden",
      daysToGo: "Noch {{n}} Tage",
      oneDayToGo: "Morgen",
      today: "Heute",
      onIndico: "Auf Indico ansehen",
    },

    navigator: {
      eyebrow: "EISS-Konferenzen und -Workshops",
      title: "Die Anthologie der europäischen Sicherheitsstudien",
      lead: "Jeder Beitrag, der seit 2017 auf einer EISS-Jahreskonferenz oder einem Workshop vorgestellt wurde, und alle, die ihn vorgestellt haben. Viele tragen inzwischen ein Abstract, Zitationsangaben und einen Link zur veröffentlichten Fassung, soweit vorhanden. Durchsuchen Sie nach Person oder nach Beitrag und filtern Sie nach Jahr oder Thema.",
      byPerson: "Nach Person",
      byPaper: "Nach Beitrag",
      promoBody: "Die vollständige Aufzeichnung der EISS-Arbeiten: jeder Vortragende und jeder Beitrag unserer Jahreskonferenzen und Workshops seit 2017, mit Abstracts, Zitationsangaben und Links zu den veröffentlichten Fassungen. Durchsuchen Sie nach Person oder nach Beitrag.",
      cta: "Anthologie öffnen",
      initiativeLink: "Durchsuchen Sie jeden Vortragenden und jeden Beitrag in der Anthologie",
      earlyAccessBadge: "Vorabversion",
      earlyAccessBody: "Die Anthologie ist eine Vorabversion mit frühem Zugang. Wir vervollständigen sie Konferenz für Konferenz mit Abstracts, Zitationsangaben und Links zu den veröffentlichten Fassungen, sodass einige Einträge noch lückenhaft sind. Die einzelnen Beitragsseiten sind auf Englisch verfügbar. Eine Lücke oder einen Fehler entdeckt?",
      earlyAccessCta: "Sagen Sie uns Bescheid",
    },

    speakers: {
      eyebrow: "Das ESSC-Korpus",
      title: "Vortragende",
      lead: "Alle Personen, die auf einer European Security Studies Conference vorgetragen haben, zusammengestellt aus den Programmen jeder Ausgabe. Nach Nachnamen geordnet, mit der jeweils jüngsten bekannten Zugehörigkeit. Nutzen Sie die Seitensuche, um einen bestimmten Namen zu finden.",
      statSpeakers: "Vortragende",
      statConferences: "Konferenzen",
      statConferencesSince: "seit 2017",
      statPapers: "vorgestellte Beiträge",
      findPlaceholder: "Nach Namen suchen…",
      findLabel: "Vortragende nach Namen suchen",
      themeLabel: "Thema",
      allThemes: "Alle Themen",
      clear: "Zurücksetzen",
      jumpToLetter: "Zu Buchstabe springen",
      memberBadge: "EISS-Mitglied",
      netsecProfile: "NetSec-Profil",
      contributionOne: "Beitrag",
      contributionMany: "Beiträge",
      note: "Zusammengestellt aus den veröffentlichten Konferenzprogrammen. Namen werden konservativ zusammengeführt: Wer über die Jahre unter deutlich verschiedenen Schreibweisen auftritt, kann mehrfach erscheinen. Themen werden aus dem Panel abgeleitet, in dem der jeweilige Beitrag stand (die neun ständigen EISS-Sektionen sowie wiederkehrende Themen). Namen, Zugehörigkeiten und Themenbezeichnungen bleiben in ihrer Originalsprache.",
      resultsOne: "{n} Vortragende:r",
      resultsMany: "{n} Vortragende",
      noMatch: "Keine Vortragenden gefunden.",
      matching: 'passend zu „{q}“',
      eventLabel: "Veranstaltung",
      allEvents: "Alle Veranstaltungen",
      attendedLabel: "Ausgaben",
    },

    papers: {
      eyebrow: "Das ESSC-Korpus",
      title: "Beiträge",
      lead: "Alle Beiträge, die auf einer European Security Studies Conference vorgestellt wurden, zusammengestellt aus den Programmen jeder Ausgabe. Durchsuchen Sie das gesamte Korpus oder filtern Sie nach Jahr und Thema. Nutzen Sie die Seitensuche, um einen bestimmten Titel oder Autor zu finden.",
      statPapers: "vorgestellte Beiträge",
      statEditions: "Ausgaben",
      statEditionsSince: "seit 2017",
      findPlaceholder: "Nach Titel oder Autor suchen…",
      findLabel: "Beitrag nach Titel oder Autor suchen",
      yearLabel: "Jahr",
      allYears: "Alle Jahre",
      themeLabel: "Thema",
      allThemes: "Alle Themen",
      publishedOnly: "Nur veröffentlichte",
      prizeOnly: "Best-Paper-Preis",
      clear: "Zurücksetzen",
      note: "Zusammengestellt aus den veröffentlichten Konferenzprogrammen. Themen werden aus dem Panel abgeleitet, in dem der jeweilige Beitrag stand (die neun ständigen EISS-Sektionen sowie wiederkehrende Themen): ein Beitrag kann mehrere oder gar keines tragen. Titel, Autorennamen, Zugehörigkeiten und Themenbezeichnungen bleiben in ihrer Originalsprache.",
      resultsOne: "{n} Beitrag",
      resultsMany: "{n} Beiträge",
      noMatch: "Keine Beiträge gefunden.",
      matching: 'passend zu „{q}“',
    },

    outputs: {
      eyebrow: "Was wir hervorbringen",
      title: "Publikationen und Ergebnisse",
      lead: "Die Arbeiten des EISS-Netzwerks und die Forschung, die unsere Mitglieder in eigenem Namen veröffentlichen.",
      networkHeading: "EISS-Publikationen",
      networkIntro: "Die eigenen Ergebnisse des Netzwerks: die Buchreihe, Policy Briefs, Weißbücher und Umfrageergebnisse. Dieser Katalog wird derzeit zusammengestellt.",
      globalRisksLabel: "Globale Risiken für die EU — Umfrageergebnisse",
      membersHeading: "Neueste Veröffentlichungen unserer Mitglieder",
      membersIntro: "Anders als die eigenen Publikationen des Netzwerks oben sind dies neuere Arbeiten, die unsere Vorstands- und Community-Mitglieder in eigenem Namen veröffentlicht haben, live aus ihren öffentlichen ORCID-Datensätzen gezogen.",
      sourceNote: "Aus den öffentlichen ORCID-Datensätzen der Mitglieder gezogen und wöchentlich aktualisiert. Mitglieder, die ihre ORCID-iD im Verzeichnisformular angeben, erscheinen hier automatisch.",
      empty: "Noch keine Mitgliederpublikationen anzuzeigen.",
    },

    mapEmbed: {
      viewOnMap: "Auf OpenStreetMap ansehen",
    },

    countdown: {
      daysToGo: "Noch {n} Tage bis zur ESSC {year}",
      oneDay: "Die ESSC {year} beginnt morgen",
      today: "Die ESSC {year} beginnt heute",
    },

    archiveProgramme: {
      eyebrow: "Aus dem Archiv",
      heading: "Konferenzprogramm",
      lead: "Das vollständige Programm aus Panels, Roundtables und Vorträgen, wie es stattfand. Öffnen Sie eine Sitzung, um ihre Beiträge und Vortragenden zu sehen.",
      reconstructedNote: "Rekonstruiert aus dem finalen gedruckten Programm der Konferenz.",
    },
  },
};

// Languages we ship a switcher chip for, in display order.
// Declared separately so templates can iterate without knowing the
// internal locale object shape.
const order = ["en", "fr", "de"];

module.exports = Object.assign({ _order: order }, locales);
