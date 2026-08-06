module.exports = {
  title: "EISS",
  fullName: "European Initiative for Security Studies",
  description:
    "The largest and most diverse European gathering of scholars and practitioners on security issues.",
  url: "https://eiss-europa.com",
  contactEmail: "contact@eiss-europa.com",
  newsletterUrl: "https://eepurl.com/h40Gkr",

  // Default Open Graph / Twitter Card image, used whenever a page
  // doesn't set its own `metaImage` in front-matter. 1200×630, lives
  // at src/assets/images/index-meta.jpg.
  defaultMetaImage: "/assets/images/index-meta.jpg",

  // The Anthology corpus as a citable dataset on Zenodo (#1221).
  //
  // `doi` is the CONCEPT DOI, not a version DOI. Zenodo mints both: the
  // concept DOI (…209) always resolves to the newest deposited version,
  // the version DOI (…210 for v2.26.0) pins to one snapshot forever.
  // Citations must use the concept one, or every reference we mint goes
  // stale at the next deposit. See docs/corpus-archiving.md.
  //
  // `citation` is deliberately English in every locale: a bibliographic
  // reference is reproduced as-is, not translated. Only the surrounding
  // chrome is localised (i18n.js → navigator.cite*).
  corpus: {
    doi: "10.5281/zenodo.21776209",
    doiUrl: "https://doi.org/10.5281/zenodo.21776209",
    citation:
      "Laudrain, A. (2026). The European Security Studies Anthology [Data set]. " +
      "European Initiative for Security Studies. https://doi.org/10.5281/zenodo.21776209",
    // The corpus-description note in HAL, typed Research report. A separate
    // object from the dataset: HAL holds the readable description, Zenodo
    // holds the data. See docs/corpus-archiving.md.
    halId: "hal-05711925",
    halUrl: "https://hal.science/hal-05711925",
  },

  social: {
    youtube: "https://www.youtube.com/channel/UCfdVczE8X2iDPsIaadtP57Q",
    twitter: "https://twitter.com/EISSnetwork",
    twitterHandle: "@EISSnetwork",
    linkedin: "https://www.linkedin.com/company/eiss-europa/",
  },
  // Top-nav order is flagship → identity → rest: the Annual Conference (the
  // draw most visitors come for), then other Events, then who EISS is, the
  // People, and the Anthology (the unified /anthology archive of every
  // speaker and paper) last. Membership is no longer a top-nav item; the
  // membership page stays reachable from the footer and the homepage.
  // `text` here is a fallback; the visible label comes from
  // i18n.js → nav.<key>.
  nav: [
    { href: "/", text: "Home", key: "home" },
    { href: "/past.html", text: "Annual Conference", key: "conferences" },
    { href: "/events.html", text: "Events", key: "events" },
    { href: "/initiative.html", text: "The Initiative", key: "initiative" },
    { href: "/board.html", text: "People", key: "people" },
    { href: "/anthology.html", text: "Anthology", key: "anthology" },
  ],
};
