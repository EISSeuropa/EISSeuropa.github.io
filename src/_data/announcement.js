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
  width: 1200,
  height: 630,
};

module.exports = {
  // Set to false to hide the announcement section entirely.
  visible: true,

  en: {
    eyebrow: "Leadership announcement · 13 July 2026",
    headline: "A new leadership team for the EISS",
    body: [
      'After nine years as its Director, <strong>Hugo Meijer</strong> (CERI, Sciences Po &ndash; CNRS) is stepping down and becomes the <strong>Founding and Honorary Director</strong> of the European Initiative for Security Studies. Since 2017 he has built what is today Europe\'s largest community of security studies scholars.',
      'The EISS will now be led jointly by <strong>Chiara Ruffa</strong> (CERI, Sciences Po) and <strong>Moritz Weiss</strong> (LMU Munich) as new <strong>Co-Directors</strong>, while longstanding staff <strong>Arthur Laudrain</strong> and <strong>John Helferich</strong> join the Board.',
    ],
    pullquote: {
      text: "We extend our deepest gratitude to Hugo, and look forward to building on the strong foundations he has established.",
      cite: "The European Initiative for Security Studies",
    },
    cta: {
      label: "Read the announcement",
      url: "/leadership-2026.html",
      external: false,
    },
    image: {
      ...sharedImage,
      src: "/assets/images/board-meta.jpg",
      alt: "The people of the European Initiative for Security Studies.",
      caption: "Meet the EISS board and leadership.",
    },
  },

  fr: {
    eyebrow: "Annonce — direction · 13 juillet 2026",
    headline: "Une nouvelle direction pour l'EISS",
    body: [
      'Après neuf ans à sa direction, <strong>Hugo Meijer</strong> (CERI, Sciences Po &ndash; CNRS) quitte ses fonctions et devient <strong>Directeur fondateur et honoraire</strong> de l\'Initiative européenne pour les études de sécurité. Depuis 2017, il a bâti la plus grande communauté européenne de chercheuses et chercheurs en études de sécurité.',
      'L\'EISS sera désormais dirigée conjointement par <strong>Chiara Ruffa</strong> (CERI, Sciences Po) et <strong>Moritz Weiss</strong> (LMU Munich) en qualité de <strong>Co-Directeurs</strong>, tandis que deux membres de longue date, <strong>Arthur Laudrain</strong> et <strong>John Helferich</strong>, rejoignent le Conseil.',
    ],
    pullquote: {
      text: "Nous exprimons notre plus profonde gratitude à Hugo et sommes impatients de bâtir sur les solides fondations qu'il a établies.",
      cite: "L'Initiative européenne pour les études de sécurité",
    },
    cta: {
      label: "Lire l'annonce",
      url: "/leadership-2026.fr.html",
      external: false,
    },
    image: {
      ...sharedImage,
      src: "/assets/images/board-meta.fr.jpg",
      alt: "Les membres de l'Initiative européenne pour les études de sécurité.",
      caption: "Découvrez le conseil et la direction de l'EISS.",
    },
  },

  de: {
    eyebrow: "Ankündigung — Leitung · 13. Juli 2026",
    headline: "Eine neue Leitung für die EISS",
    body: [
      'Nach neun Jahren an ihrer Spitze tritt <strong>Hugo Meijer</strong> (CERI, Sciences Po &ndash; CNRS) zurück und wird <strong>Gründungs- und Ehrendirektor</strong> der Europäischen Initiative für Sicherheitsstudien. Seit 2017 hat er die heute größte europäische Gemeinschaft von Sicherheitsforscherinnen und -forschern aufgebaut.',
      'Die EISS wird künftig gemeinsam von <strong>Chiara Ruffa</strong> (CERI, Sciences Po) und <strong>Moritz Weiss</strong> (LMU München) als neue <strong>Co-Direktoren</strong> geleitet, während mit <strong>Arthur Laudrain</strong> und <strong>John Helferich</strong> zwei langjährige Mitarbeiter dem Vorstand beitreten.',
    ],
    pullquote: {
      text: "Wir danken Hugo von Herzen und freuen uns darauf, auf den starken Fundamenten aufzubauen, die er geschaffen hat.",
      cite: "Die Europäische Initiative für Sicherheitsstudien",
    },
    cta: {
      label: "Zur Ankündigung",
      url: "/leadership-2026.de.html",
      external: false,
    },
    image: {
      ...sharedImage,
      src: "/assets/images/board-meta.de.jpg",
      alt: "Die Menschen der Europäischen Initiative für Sicherheitsstudien.",
      caption: "Lernen Sie den Vorstand und die Leitung der EISS kennen.",
    },
  },
};
