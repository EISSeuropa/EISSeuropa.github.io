/**
 * Public roadmap content for /roadmap.html (+ FR + DE).
 *
 * This is the curated, public mirror of docs/roadmap-2026.md and the
 * GitHub milestones. The internal doc is the authoritative planning
 * source; this file is what visitors see. Keep them in step at the
 * §5 release cross-check.
 *
 * Each entry's localised strings (`when`, `title`, `desc`) are
 * hand-translated per CLAUDE.md §1 (no machine translation). FR / DE
 * roadmap pages carry the `status: beta` ribbon accordingly.
 *
 * Card statuses: "shipped" | "in-progress" | "planned" | "deferred".
 * - `version`  — the SemVer tag; drives the GitHub release-notes link
 *                on shipped cards.
 * - `milestone`— set on planned / in-progress cards so the in-flight
 *                progress bar (assets/js/roadmap-progress.js, reading
 *                src/data/roadmap-progress.json) can attach to the
 *                matching GitHub milestone. Dropped on shipped cards.
 * - `event: true` — a non-version calendar marker (e.g. the conference
 *                itself); renders without a version or progress bar.
 *
 * roadmap-progress.js auto-promotes the first still-planned version
 * card to "In progress", so we leave the next release as "planned"
 * here rather than hard-coding the in-progress state.
 */

const REPO = "https://github.com/EISSeuropa/EISSeuropa.github.io";
const notes = (v) => `${REPO}/releases/tag/${v}`;

const roadmap = {
  repo: REPO,
  issuesUrl: `${REPO}/issues/new/choose`,
  milestonesUrl: `${REPO}/milestones`,
  releasesUrl: `${REPO}/releases`,
  updated: { en: "9 June 2026", fr: "9 juin 2026", de: "9. Juni 2026" },

  quarters: [
    {
      label: { en: "Q2 2026", fr: "T2 2026", de: "Q2 2026" },
      sub: {
        en: "April · May · June",
        fr: "avril · mai · juin",
        de: "April · Mai · Juni",
      },
      entries: [
        {
          status: "shipped",
          version: "v2.22.0",
          notesUrl: notes("v2.22.0"),
          changes: 29,
          when: { en: "24 May 2026 · v2.22.0", fr: "24 mai 2026 · v2.22.0", de: "24. Mai 2026 · v2.22.0" },
          title: {
            en: "Live board pipeline and Initiative refresh",
            fr: "Pipeline du conseil en direct et refonte de l’Initiative",
            de: "Live-Vorstandspipeline und überarbeitete Initiative-Seite",
          },
          desc: {
            en: "The Google Form board pipeline went live, and the People and Initiative pages were rebuilt around their data.",
            fr: "Le pipeline du conseil via formulaire Google est entré en service, et les pages Équipe et Initiative ont été reconstruites autour de leurs données.",
            de: "Die Vorstandspipeline über das Google-Formular ging in Betrieb, und die Seiten Team und Initiative wurden um ihre Daten herum neu aufgebaut.",
          },
        },
        {
          status: "shipped",
          version: "v2.23.0",
          notesUrl: notes("v2.23.0"),
          changes: 48,
          when: { en: "26 May 2026 · v2.23.0", fr: "26 mai 2026 · v2.23.0", de: "26. Mai 2026 · v2.23.0" },
          title: {
            en: "Brand identity and Initiative depth",
            fr: "Identité de marque et approfondissement de l’Initiative",
            de: "Markenidentität und vertiefte Initiative-Seite",
          },
          desc: {
            en: "The EISS brand identity replaced the placeholder mark across the site, and the Initiative page grew into a full founding story.",
            fr: "L’identité de marque de l’EISS a remplacé le logo provisoire sur tout le site, et la page Initiative est devenue un récit fondateur complet.",
            de: "Die EISS-Markenidentität ersetzte das Platzhalterlogo auf der gesamten Website, und die Initiative-Seite wurde zu einer vollständigen Gründungsgeschichte.",
          },
        },
        {
          status: "shipped",
          version: "v2.23.1",
          notesUrl: notes("v2.23.1"),
          changes: 14,
          when: { en: "27 May 2026 · v2.23.1", fr: "27 mai 2026 · v2.23.1", de: "27. Mai 2026 · v2.23.1" },
          title: {
            en: "Archive banner and post-release polish",
            fr: "Bandeau d’archive et finitions post-publication",
            de: "Archiv-Hinweis und Feinschliff nach der Veröffentlichung",
          },
          desc: {
            en: "An archive disclaimer ribbon on past-event pages, a translation-ribbon fix, and post-release housekeeping.",
            fr: "Un bandeau d’avertissement sur les pages d’événements passés, une correction du bandeau de traduction, et divers ajustements.",
            de: "Ein Archiv-Hinweisband auf Seiten vergangener Veranstaltungen, eine Korrektur am Übersetzungsband und Aufräumarbeiten nach der Veröffentlichung.",
          },
        },
        {
          status: "shipped",
          version: "v2.24.0",
          notesUrl: notes("v2.24.0"),
          changes: 32,
          when: { en: "30 May 2026 · v2.24.0", fr: "30 mai 2026 · v2.24.0", de: "30. Mai 2026 · v2.24.0" },
          title: {
            en: "Live programme depth and a print overhaul",
            fr: "Programme en direct enrichi et impression repensée",
            de: "Erweitertes Live-Programm und überarbeiteter Druck",
          },
          desc: {
            en: "The ESSC 2026 programme grid gained co-authors and livestream pills, the printed programme was overhauled, and the conference archive filled out.",
            fr: "La grille du programme de l’ESSC 2026 affiche désormais les co-auteurs et des pastilles de diffusion en direct, l’impression a été repensée, et les archives des conférences ont été étoffées.",
            de: "Das Programmraster der ESSC 2026 zeigt nun Koautoren und Livestream-Plaketten, der Druck wurde überarbeitet, und das Konferenzarchiv wurde ergänzt.",
          },
        },
        {
          status: "planned",
          version: "v2.25.0",
          milestone: "v2.25.0",
          when: { en: "9 June 2026 · v2.25.0", fr: "9 juin 2026 · v2.25.0", de: "9. Juni 2026 · v2.25.0" },
          title: {
            en: "Ready for Stockholm",
            fr: "Prêt pour Stockholm",
            de: "Bereit für Stockholm",
          },
          desc: {
            en: "The pre-conference release: site-wide search, a public roadmap and a press kit, the whole interface pulled onto one brand blue with redesigned share cards, a markedly better mobile experience, and the ESSC 2026 run-up (countdown, downloadable programmes, add-to-calendar links).",
            fr: "La version d’avant-conférence : recherche sur tout le site, feuille de route publique et kit de presse, interface entièrement alignée sur le bleu de la marque avec des cartes de partage repensées, expérience mobile nettement améliorée, et la préparation de l’ESSC 2026 (compte à rebours, programmes téléchargeables, liens d’ajout au calendrier).",
            de: "Die Version vor der Konferenz: websiteweite Suche, eine öffentliche Roadmap und ein Pressekit, die gesamte Oberfläche auf das Markenblau ausgerichtet mit überarbeiteten Sharing-Karten, eine deutlich bessere mobile Nutzung und der Vorlauf zur ESSC 2026 (Countdown, herunterladbare Programme, Kalenderlinks).",
          },
        },
        {
          status: "planned",
          event: true,
          when: { en: "11 - 12 June 2026 · Stockholm", fr: "11 - 12 juin 2026 · Stockholm", de: "11. - 12. Juni 2026 · Stockholm" },
          title: {
            en: "ESSC 2026 — Stockholm",
            fr: "ESSC 2026 — Stockholm",
            de: "ESSC 2026 — Stockholm",
          },
          desc: {
            en: "The 9th Annual European Security Studies Conference at Stockholm University. The flagship gathering of the year; the website is the canonical entry point for new arrivals.",
            fr: "La 9e Conférence annuelle d’études de sécurité européenne à l’Université de Stockholm. Le grand rendez-vous de l’année ; le site web en est le point d’entrée de référence.",
            de: "Die 9. Jährliche Konferenz für Europäische Sicherheitsstudien an der Universität Stockholm. Das wichtigste Treffen des Jahres; die Website ist der zentrale Einstiegspunkt für Neuankömmlinge.",
          },
        },
      ],
    },
    {
      label: { en: "Q3 2026", fr: "T3 2026", de: "Q3 2026" },
      sub: {
        en: "July · August · September",
        fr: "juillet · août · septembre",
        de: "Juli · August · September",
      },
      entries: [
        {
          status: "planned",
          version: "v2.26.0",
          milestone: "v2.26.0",
          when: { en: "September 2026 · v2.26.0", fr: "septembre 2026 · v2.26.0", de: "September 2026 · v2.26.0" },
          title: {
            en: "Post-conference: activation, content and feedback",
            fr: "Après la conférence : activation, contenus et retours",
            de: "Nach der Konferenz: Aktivierung, Inhalte und Feedback",
          },
          desc: {
            en: "The first release after ESSC 2026, folding in feedback from the conference: new public surfaces (a News surface, an Outputs / Publications page, a Working Groups page, a NetSec co-branding strip), the live programme grid on past conferences with calendar links, and the reliability and accessibility follow-ups carried over from the pre-conference push.",
            fr: "La première version après l’ESSC 2026, intégrant les retours de la conférence : de nouvelles pages publiques (un espace Actualités, une page Publications, une page Groupes de travail, un bandeau de co-marquage NetSec), la grille du programme en direct sur les conférences passées avec liens calendrier, et les suites de fiabilité et d’accessibilité reportées depuis la préparation d’avant-conférence.",
            de: "Die erste Version nach der ESSC 2026, die das Feedback der Konferenz aufnimmt: neue öffentliche Seiten (ein Aktuelles-Bereich, eine Publikationen-Seite, eine Arbeitsgruppen-Seite, ein NetSec-Co-Branding-Streifen), das Live-Programmraster auf vergangenen Konferenzen mit Kalenderlinks sowie die Zuverlässigkeits- und Barrierefreiheits-Folgearbeiten aus der Vorbereitung vor der Konferenz.",
          },
        },
      ],
    },
    {
      label: { en: "Q4 2026", fr: "T4 2026", de: "Q4 2026" },
      sub: {
        en: "October · November · December",
        fr: "octobre · novembre · décembre",
        de: "Oktober · November · Dezember",
      },
      entries: [
        {
          status: "planned",
          version: "v2.27.0",
          milestone: "v2.27.0",
          when: { en: "December 2026 · v2.27.0", fr: "décembre 2026 · v2.27.0", de: "Dezember 2026 · v2.27.0" },
          title: {
            en: "Polish and ESSC 2027 prep",
            fr: "Finitions et préparation de l’ESSC 2027",
            de: "Feinschliff und Vorbereitung der ESSC 2027",
          },
          desc: {
            en: "A build-time guard against CSS class collisions, the mobile nav-drawer alignment refinement, expanded open-panel examples, and the ESSC 2027 announcement rollover. (Site-wide search shipped early, in v2.25.0.)",
            fr: "Une protection à la compilation contre les collisions de classes CSS, l’ajustement de l’alignement du tiroir de navigation mobile, des exemples de panels ouverts enrichis, et l’annonce de l’ESSC 2027. (La recherche sur tout le site est arrivée plus tôt, dans la v2.25.0.)",
            de: "Ein Build-Schutz gegen CSS-Klassenkollisionen, die Feinjustierung der mobilen Navigationsschublade, erweiterte Beispiele offener Panels und die Ankündigung der ESSC 2027. (Die websiteweite Suche kam früher, in v2.25.0.)",
          },
        },
      ],
    },
  ],

  underWatch: [
    {
      status: "deferred",
      when: { en: "Trigger · Indico exposes form state", fr: "Déclencheur · Indico expose l’état du formulaire", de: "Auslöser · Indico gibt den Formularstatus preis" },
      title: {
        en: "Auto-detect registration state from Indico",
        fr: "Détection automatique de l’état des inscriptions depuis Indico",
        de: "Automatische Erkennung des Anmeldestatus aus Indico",
      },
      desc: {
        en: "Blocked: this Indico build doesn't expose registration-form state on the public or authenticated API, so the status pill stays a manual override.",
        fr: "Bloqué : cette instance Indico n’expose pas l’état du formulaire d’inscription via l’API publique ou authentifiée ; la pastille de statut reste donc réglée à la main.",
        de: "Blockiert: Diese Indico-Instanz gibt den Status des Anmeldeformulars weder über die öffentliche noch über die authentifizierte API preis, daher bleibt die Status-Plakette eine manuelle Einstellung.",
      },
    },
    {
      status: "deferred",
      when: { en: "Trigger · NetSec coordination", fr: "Déclencheur · coordination avec NetSec", de: "Auslöser · Abstimmung mit NetSec" },
      title: {
        en: "Generalise the Indico sync for NetSec",
        fr: "Généraliser la synchronisation Indico pour NetSec",
        de: "Indico-Synchronisierung für NetSec verallgemeinern",
      },
      desc: {
        en: "Reusing the live programme sync on the sister NetSec site. Waiting on coordination with the NetSec maintainers.",
        fr: "Réutiliser la synchronisation du programme en direct sur le site jumeau NetSec. En attente d’une coordination avec les responsables de NetSec.",
        de: "Die Live-Programmsynchronisierung auf der Schwesterseite NetSec wiederverwenden. Wartet auf Abstimmung mit den NetSec-Betreuern.",
      },
    },
    {
      status: "deferred",
      when: { en: "Trigger · source research", fr: "Déclencheur · recherche de sources", de: "Auslöser · Quellenrecherche" },
      title: {
        en: "Reconcile archive dates and narratives",
        fr: "Harmoniser les dates et récits des archives",
        de: "Archivdaten und -texte abgleichen",
      },
      desc: {
        en: "A few contradictory dates and narratives across the older archive pages. Needs source research before any contested fact is edited.",
        fr: "Quelques dates et récits contradictoires sur les anciennes pages d’archive. Nécessite une recherche de sources avant toute modification d’un fait contesté.",
        de: "Einige widersprüchliche Daten und Texte auf den älteren Archivseiten. Erfordert Quellenrecherche, bevor ein strittiger Fakt geändert wird.",
      },
    },
    {
      status: "deferred",
      when: { en: "Trigger · a concrete need", fr: "Déclencheur · un besoin concret", de: "Auslöser · ein konkreter Bedarf" },
      title: {
        en: "Parked until there's a reason",
        fr: "En attente d’une raison de les construire",
        de: "Zurückgestellt bis es einen Grund gibt",
      },
      desc: {
        en: "Ideas held back without a trigger: custom-domain board emails, a self-hosted newsletter, a multi-author CMS, analytics (the no-analytics stance is deliberate), and a multi-page member directory.",
        fr: "Des idées mises de côté faute de déclencheur : des adresses e-mail sur le domaine pour le conseil, une lettre d’information auto-hébergée, un CMS multi-auteurs, des statistiques de fréquentation (l’absence de suivi est un choix assumé), et un annuaire des membres.",
        de: "Ohne Auslöser zurückgestellte Ideen: E-Mail-Adressen auf der eigenen Domain für den Vorstand, ein selbst gehosteter Newsletter, ein Mehrautoren-CMS, Web-Analyse (der Verzicht darauf ist bewusst gewählt) und ein Mitgliederverzeichnis.",
      },
    },
  ],
};

// The most recent shipped release (last shipped entry in timeline order).
// The timeline renders every other shipped release collapsed by default and
// leaves this one expanded.
roadmap.lastShipped = roadmap.quarters
  .flatMap((q) => q.entries)
  .filter((e) => e.status === "shipped" && e.version)
  .map((e) => e.version)
  .pop() || null;

module.exports = roadmap;
