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
