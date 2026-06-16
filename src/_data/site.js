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
  // People, and the Membership call to action last. The Anthology (the
  // /speakers + /papers archive) is intentionally NOT in the top nav; it is
  // reached from the conference pages, /past, the footer and the homepage
  // promo. `text` here is a fallback; the visible label comes from
  // i18n.js → nav.<key>.
  nav: [
    { href: "/", text: "Home", key: "home" },
    { href: "/past.html", text: "Annual Conference", key: "conferences" },
    { href: "/events.html", text: "Events", key: "events" },
    { href: "/initiative.html", text: "The Initiative", key: "initiative" },
    { href: "/board.html", text: "People", key: "people" },
    { href: "/membership.html", text: "Membership", key: "membership" },
  ],
};
