/**
 * Homepage announcement card.
 *
 * Single-announcement-at-a-time pattern: the homepage shows ONE current
 * announcement card under the featured-conference card. To rotate the
 * content (a new programme launch, a press release, a partnership
 * milestone), edit this file in place rather than touching the three
 * src/index{,.fr,.de}.njk templates.
 *
 * To temporarily hide the section without deleting the data, flip
 * `visible: false`. The section disappears on the next build.
 *
 * Structure
 * ---------
 * Each language object has the same shape so the templates can iterate
 * generically. `body` is an array of paragraphs; HTML is allowed (links,
 * emphasis) and rendered with `| safe`. Keep names, brands, dates, and
 * URLs identical across languages — only translate prose.
 *
 * Image
 * -----
 * The image is shared across languages (same file, same dimensions).
 * Only the alt text and caption translate.
 */

const sharedImage = {
  src: "/assets/images/2026/essc2026-06-960.jpg",
  width: 960,
  height: 721,
};

module.exports = {
  // Set to false to hide the announcement section entirely.
  visible: true,

  en: {
    eyebrow: "Stockholm, 12 June 2026",
    headline: "The European Security Studies Conference closes in Stockholm",
    body: [
      'The annual conference has closed two days of panels and roundtables at Stockholm University. From this 2026 edition it carries a new name, the <strong>European Security Studies Conference</strong> (ESSC), marking its first year jointly organised by the <a href="https://netsec-cost.eu/" target="_blank" rel="noopener">COST Action NetSec</a>, the European Initiative for Security Studies (EISS), and Stockholm University.',
      'The full programme, the conference film and a photo gallery from the event are now on the <a href="/2026.html">2026 conference page</a>.',
    ],
    cta: {
      label: "See the 2026 conference",
      url: "/2026.html",
      external: false,
    },
    image: {
      ...sharedImage,
      alt: "The keynote at the 2026 European Security Studies Conference, Stockholm University.",
      caption: "Lieutenant General Ulf Thomas Nilsson, Director of Military Intelligence and Security, gives the keynote at Stockholm University.",
    },
  },

  fr: {
    eyebrow: "Stockholm, 12 juin 2026",
    headline: "La Conférence européenne d'études de sécurité s'achève à Stockholm",
    body: [
      'La conférence annuelle vient de clore deux journées de panels et de tables rondes à l\'Université de Stockholm. Depuis cette édition 2026, elle porte un nouveau nom, la <strong>Conférence européenne d\'études de sécurité</strong> (European Security Studies Conference, ESSC), et marque sa première année d\'organisation conjointe par l\'<a href="https://netsec-cost.eu/" target="_blank" rel="noopener">Action COST NetSec</a>, l\'Initiative européenne pour les études de sécurité (EISS) et l\'Université de Stockholm.',
      'Le programme complet, le film de la conférence et une galerie de photos de l\'événement sont désormais disponibles sur la <a href="/2026.fr.html">page de la conférence 2026</a>.',
    ],
    cta: {
      label: "Voir la conférence 2026",
      url: "/2026.fr.html",
      external: false,
    },
    image: {
      ...sharedImage,
      alt: "La conférence inaugurale de la Conférence européenne d'études de sécurité 2026, Université de Stockholm.",
      caption: "Le général de corps d'armée Ulf Thomas Nilsson, directeur du renseignement et de la sécurité militaires, prononce la conférence inaugurale à l'Université de Stockholm.",
    },
  },

  de: {
    eyebrow: "Stockholm, 12. Juni 2026",
    headline: "Die European Security Studies Conference geht in Stockholm zu Ende",
    body: [
      'Die Jahreskonferenz hat zwei Tage mit Panels und Round Tables an der Universität Stockholm abgeschlossen. Seit dieser Ausgabe 2026 trägt sie einen neuen Namen, die <strong>European Security Studies Conference</strong> (ESSC), und wird erstmals gemeinsam von der <a href="https://netsec-cost.eu/" target="_blank" rel="noopener">COST-Aktion NetSec</a>, der Europäischen Initiative für Sicherheitsstudien (EISS) und der Universität Stockholm ausgerichtet.',
      'Das vollständige Programm, der Konferenzfilm und eine Fotogalerie der Veranstaltung sind jetzt auf der <a href="/2026.de.html">Seite der Konferenz 2026</a> verfügbar.',
    ],
    cta: {
      label: "Zur Konferenz 2026",
      url: "/2026.de.html",
      external: false,
    },
    image: {
      ...sharedImage,
      alt: "Die Keynote der European Security Studies Conference 2026, Universität Stockholm.",
      caption: "Generalleutnant Ulf Thomas Nilsson, Direktor des militärischen Nachrichten- und Sicherheitsdienstes, hält die Keynote an der Universität Stockholm.",
    },
  },
};
