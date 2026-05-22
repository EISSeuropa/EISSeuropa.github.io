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
      programmes: "Programmes",
      initiative: "The Initiative",
      membership: "Membership",
      events: "Events",
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
      },
    },

    betaRibbon: {
      text: "Beta translation — the English version is authoritative.",
      goToEnglish: "View in English",
      // English never shows the ribbon, but the strings still need to
      // exist for symmetry with fr/de.
    },

    untranslatedNotice: {
      // Shown when the user lands on /something.fr.html for a page that
      // doesn't actually have a French translation yet — they get
      // redirected to the language homepage instead, with this banner.
      text: "This page is not yet available in {{language}}. You're seeing the {{language}} home page; the original page is available in English.",
      backToOriginal: "View the original page in English",
    },

    indicoEvents: {
      // Section heading + actions for the auto-synced upcoming-events
      // list pulled from indico.eiss-europa.com. Visible on /index and
      // /events when src/_data/indico.json has upcoming entries; the
      // whole section is hidden when the list is empty.
      sectionEyebrow: "Upcoming events",
      sectionHeading: "Events on Indico",
      sectionLead: "Members' events, summer schools, and policy workshops. Registration and full details on Indico.",
      viewAll: "View all events on Indico",
      lastSynced: "Last refreshed",
      noEventsTitle: "No upcoming events on Indico yet",
      noEventsBody: "When members publish events through indico.eiss-europa.com, they'll appear here automatically.",
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
      programmes: "Programmes",
      initiative: "L'Initiative",
      membership: "Adhésion",
      events: "Événements",
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
      sectionLead: "Événements des membres, écoles d'été et ateliers politiques. Inscriptions et détails complets sur Indico.",
      viewAll: "Voir tous les événements sur Indico",
      lastSynced: "Dernière mise à jour",
      noEventsTitle: "Pas encore d'événements à venir sur Indico",
      noEventsBody: "Lorsque les membres publient des événements via indico.eiss-europa.com, ils apparaîtront ici automatiquement.",
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
      programmes: "Programme",
      initiative: "Die Initiative",
      membership: "Mitgliedschaft",
      events: "Veranstaltungen",
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
      sectionLead: "Mitgliederveranstaltungen, Sommerschulen und politische Workshops. Anmeldung und vollständige Details auf Indico.",
      viewAll: "Alle Veranstaltungen auf Indico ansehen",
      lastSynced: "Zuletzt aktualisiert",
      noEventsTitle: "Noch keine kommenden Veranstaltungen auf Indico",
      noEventsBody: "Wenn Mitglieder Veranstaltungen über indico.eiss-europa.com veröffentlichen, erscheinen sie hier automatisch.",
    },
  },
};

// Languages we ship a switcher chip for, in display order.
// Declared separately so templates can iterate without knowing the
// internal locale object shape.
const order = ["en", "fr", "de"];

module.exports = Object.assign({ _order: order }, locales);
