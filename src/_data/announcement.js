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
  src: "/assets/images/1760518013943-1280x720.jpg",
  width: 1280,
  height: 720,
};

const sharedCtaUrl = "https://netsec-cost.eu/";

module.exports = {
  // Set to false to hide the announcement section entirely.
  visible: true,

  en: {
    eyebrow: "Brussels, 10 October 2025",
    headline: "EISS launches major initiative to network European Security Studies",
    body: [
      'Thanks to the generous support of the <a href="https://www.cost.eu" target="_blank" rel="noopener">European Cooperation in Science and Technology</a> (COST) organisation, EISS — together with a dozen institutions throughout Europe — launches <a href="https://netsec-cost.eu/" target="_blank" rel="noopener">"Networking European Security Knowledge" (NetSec)</a>, a four-year programme to address the fragmentation of the continent\'s intellectual and analytical base in the field of security studies.',
      "Dr Hugo Meijer, Founding Director of EISS, and Dr Marie Robin, EISS Treasurer, serve as NetSec Action Chair and Vice-Chair, respectively.",
    ],
    pullquote: {
      text: "“The launch of NetSec is a huge step in the development of EISS and its partners. Watch out for policy workshops, summer schools and conferences in the next four years.”",
      cite: "— Dr Hugo Meijer, NetSec Action Chair and Founding Director of EISS",
    },
    cta: {
      label: "Learn more about NetSec",
      url: sharedCtaUrl,
      external: true,
    },
    image: {
      ...sharedImage,
      alt: "Members of the NetSec Management Committee at the launch event in Brussels.",
      caption: "Members of the NetSec Management Committee at the launch event in Brussels — Dr Moritz Weiss (Leader of WG1, top) and Dr Hugo Meijer (Action Chair and Founding Director of EISS, bottom).",
    },
  },

  fr: {
    eyebrow: "Bruxelles, 10 octobre 2025",
    headline: "EISS lance une initiative majeure pour mettre en réseau les études européennes de sécurité",
    body: [
      'Grâce au généreux soutien de l\'organisation <a href="https://www.cost.eu" target="_blank" rel="noopener">European Cooperation in Science and Technology</a> (COST), EISS — aux côtés d\'une douzaine d\'institutions à travers l\'Europe — lance <a href="https://netsec-cost.eu/" target="_blank" rel="noopener">« Networking European Security Knowledge » (NetSec)</a>, un programme de quatre ans visant à remédier à la fragmentation de la base intellectuelle et analytique du continent dans le domaine des études de sécurité.',
      "Le Dr Hugo Meijer, directeur fondateur d'EISS, et la Dre Marie Robin, trésorière d'EISS, assurent respectivement la présidence et la vice-présidence de l'Action NetSec.",
    ],
    pullquote: {
      text: "« Le lancement de NetSec représente une étape majeure dans le développement d'EISS et de ses partenaires. Restez attentifs aux ateliers politiques, écoles d'été et conférences à venir au cours des quatre prochaines années. »",
      cite: "— Dr Hugo Meijer, président de l'Action NetSec et directeur fondateur d'EISS",
    },
    cta: {
      label: "En savoir plus sur NetSec",
      url: sharedCtaUrl,
      external: true,
    },
    image: {
      ...sharedImage,
      alt: "Membres du comité de gestion NetSec lors du lancement à Bruxelles.",
      caption: "Membres du comité de gestion NetSec lors de l'événement de lancement à Bruxelles — Dr Moritz Weiss (responsable du WG1, en haut) et Dr Hugo Meijer (président de l'Action et directeur fondateur d'EISS, en bas).",
    },
  },

  de: {
    eyebrow: "Brüssel, 10. Oktober 2025",
    headline: "EISS startet Großinitiative zur Vernetzung der europäischen Sicherheitsstudien",
    body: [
      'Dank der großzügigen Unterstützung der Organisation <a href="https://www.cost.eu" target="_blank" rel="noopener">European Cooperation in Science and Technology</a> (COST) startet EISS — gemeinsam mit einem Dutzend Institutionen in ganz Europa — <a href="https://netsec-cost.eu/" target="_blank" rel="noopener">„Networking European Security Knowledge" (NetSec)</a>, ein vierjähriges Programm zur Bewältigung der Fragmentierung der intellektuellen und analytischen Basis des Kontinents im Bereich der Sicherheitsstudien.',
      "Dr. Hugo Meijer, Gründungsdirektor von EISS, und Dr. Marie Robin, Schatzmeisterin von EISS, fungieren als Vorsitzender bzw. stellvertretende Vorsitzende der NetSec-Aktion.",
    ],
    pullquote: {
      text: '„Der Start von NetSec ist ein großer Schritt in der Entwicklung von EISS und seinen Partnern. Achten Sie auf politische Workshops, Sommerschulen und Konferenzen in den nächsten vier Jahren.“',
      cite: "— Dr. Hugo Meijer, Vorsitzender der NetSec-Aktion und Gründungsdirektor von EISS",
    },
    cta: {
      label: "Mehr über NetSec erfahren",
      url: sharedCtaUrl,
      external: true,
    },
    image: {
      ...sharedImage,
      alt: "Mitglieder des NetSec-Managementkomitees bei der Auftaktveranstaltung in Brüssel.",
      caption: "Mitglieder des NetSec-Managementkomitees bei der Auftaktveranstaltung in Brüssel — Dr. Moritz Weiss (Leiter der WG1, oben) und Dr. Hugo Meijer (Vorsitzender der Aktion und Gründungsdirektor von EISS, unten).",
    },
  },
};
