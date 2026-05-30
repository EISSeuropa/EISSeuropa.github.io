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
    htmlNameInOwnLang: "English",

    nav: {
      home: "Home",
      conferences: "Conferences",
      programmes: "Activities",
      initiative: "The Initiative",
      people: "People",
      membership: "Membership",
      events: "Network events",
      brandLabel: "EISS",
    },
    skipLink: "Skip to content",

    themeToggle: {
      switchToDark: "Switch to dark mode",
      switchToLight: "Switch to light mode",
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
      progressLabel: "{closed} of {total} issues closed",
      underWatch: "Under watch",
      underWatchSub: "No committed release, waiting on a trigger",
      ctaLead: "Spotted something missing, or have an idea? The roadmap is public and so is the backlog.",
      ctaIssue: "Suggest or report",
      ctaMilestones: "Browse milestones",
      ctaReleases: "All releases",
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
      lastSynced: "Last refreshed",
      noEventsTitle: "No upcoming events on Indico yet",
      noEventsBody: "When EISS, NetSec, or partner institutions publish events through indico.eiss-europa.com, they'll appear here automatically.",
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
      sourceNote: "Indico holds the authoritative programme. This grid is a daily snapshot.",
      viewOnIndico: "View the event on Indico",
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

    mapEmbed: {
      // Google Maps embed on /YYYY venue sections. Only the iframe
      // title is i18n'd; the embed loads on page view, and is disclosed
      // under /policy §5. See src/_includes/map-embed.njk.
      iframeTitle: "Google Maps preview for {{address}}",
    },
  },

  fr: {
    code: "fr",
    name: "French",
    htmlLang: "fr",
    htmlNameInOwnLang: "Français",

    nav: {
      home: "Accueil",
      conferences: "Conférences",
      programmes: "Activités",
      initiative: "L'Initiative",
      people: "L'équipe",
      membership: "Adhésion",
      events: "Événements du réseau",
      brandLabel: "EISS",
    },
    skipLink: "Aller au contenu",

    themeToggle: {
      switchToDark: "Passer au mode sombre",
      switchToLight: "Passer au mode clair",
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
      progressLabel: "{closed} sur {total} tâches terminées",
      underWatch: "À surveiller",
      underWatchSub: "Aucune version engagée, en attente d’un déclencheur",
      ctaLead: "Vous avez remarqué un oubli ou vous avez une idée ? La feuille de route est publique, tout comme la liste des tâches.",
      ctaIssue: "Proposer ou signaler",
      ctaMilestones: "Voir les jalons",
      ctaReleases: "Toutes les versions",
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
      lastSynced: "Dernière mise à jour",
      noEventsTitle: "Pas encore d'événements à venir sur Indico",
      noEventsBody: "Lorsque EISS, NetSec ou nos institutions partenaires publient des événements via indico.eiss-europa.com, ils apparaîtront ici automatiquement.",
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
      sourceNote: "Indico fait foi pour le programme. Cette grille en est un instantané quotidien.",
      viewOnIndico: "Voir l'événement sur Indico",
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

    mapEmbed: {
      iframeTitle: "Aperçu Google Maps pour {{address}}",
    },
  },

  de: {
    code: "de",
    name: "German",
    htmlLang: "de",
    htmlNameInOwnLang: "Deutsch",

    nav: {
      home: "Startseite",
      conferences: "Konferenzen",
      programmes: "Aktivitäten",
      initiative: "Die Initiative",
      people: "Personen",
      membership: "Mitgliedschaft",
      events: "Netzwerk-Veranstaltungen",
      brandLabel: "EISS",
    },
    skipLink: "Zum Inhalt springen",

    themeToggle: {
      switchToDark: "Zum dunklen Modus wechseln",
      switchToLight: "Zum hellen Modus wechseln",
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
      progressLabel: "{closed} von {total} Aufgaben erledigt",
      underWatch: "Unter Beobachtung",
      underWatchSub: "Keine zugesagte Version, wartet auf einen Auslöser",
      ctaLead: "Fehlt etwas, oder haben Sie eine Idee? Die Roadmap ist öffentlich, ebenso der Aufgabenbestand.",
      ctaIssue: "Vorschlagen oder melden",
      ctaMilestones: "Meilensteine ansehen",
      ctaReleases: "Alle Versionen",
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
      lastSynced: "Zuletzt aktualisiert",
      noEventsTitle: "Noch keine kommenden Veranstaltungen auf Indico",
      noEventsBody: "Wenn EISS, NetSec oder Partnerinstitutionen Veranstaltungen über indico.eiss-europa.com veröffentlichen, erscheinen sie hier automatisch.",
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
      sourceNote: "Indico ist die maßgebliche Quelle für das Programm. Dieses Raster ist ein tägliches Abbild.",
      viewOnIndico: "Veranstaltung auf Indico ansehen",
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

    mapEmbed: {
      iframeTitle: "Google-Maps-Vorschau für {{address}}",
    },
  },
};

// Languages we ship a switcher chip for, in display order.
// Declared separately so templates can iterate without knowing the
// internal locale object shape.
const order = ["en", "fr", "de"];

module.exports = Object.assign({ _order: order }, locales);
