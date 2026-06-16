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
  nav: [
    { href: "/", text: "Home", key: "home" },
    { href: "/past.html", text: "Conferences", key: "conferences" },
    { href: "/speakers.html", text: "Navigator", key: "navigator" },
    { href: "/events.html", text: "Events", key: "events" },
    { href: "/initiative.html", text: "The Initiative", key: "initiative" },
    { href: "/board.html", text: "People", key: "people" },
    { href: "/membership.html", text: "Membership", key: "membership" },
  ],
};
