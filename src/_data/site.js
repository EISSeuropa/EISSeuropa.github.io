const newsletterUrl = "https://eepurl.com/h40Gkr";

/**
 * Give every top-nav item the list of `navKey` values that should light it
 * up. A group is "current" when the open page is any of its children, so
 * the parent stays highlighted while you read /prizes.html or /news.html.
 * `match` on a leaf item covers pages whose navKey predates the nav key
 * (e.g. the Anthology pages still declare `navKey: "navigator"`).
 * Computed once at data load rather than in the template: Nunjucks cannot
 * accumulate a value across a `{% for %}` frame.
 */
function withMatchKeys(items) {
  return items.map((item) => ({
    ...item,
    match: [
      item.key,
      ...(item.match || []),
      ...(item.children || []).map((c) => c.key),
    ],
  }));
}

module.exports = {
  title: "EISS",
  fullName: "European Initiative for Security Studies",
  description:
    "The largest and most diverse European gathering of scholars and practitioners on security issues.",
  url: "https://eiss-europa.com",
  contactEmail: "contact@eiss-europa.com",

  // Volunteer-facing GitHub surfaces, linked from /internship.html in all
  // three locales (#1352). Kept here so the three hand-maintained language
  // variants cannot drift apart on a URL.
  //
  // The label page, not `/issues?q=`: `help wanted` currently sits on pull
  // requests rather than issues, and the issues search hides PRs.
  helpWantedUrl:
    "https://github.com/EISSeuropa/EISSeuropa.github.io/labels/help%20wanted",
  handbookUrl:
    "https://github.com/EISSeuropa/EISSeuropa.github.io/blob/master/docs/internship-handbook.md",

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
  newsletterUrl,

  // Top-nav order follows arrival intent (#1319): the Conference, which is
  // why most visitors come, then the Anthology as the citable research
  // asset, then what else the Initiative runs, who it is, and how to take
  // part. Items carrying `children` render as a `<details>` disclosure
  // group in nav.njk; `editions: true` makes that group prepend the
  // conference editions generated from conferences.js at render time, so
  // the list follows the yearly rollover on its own.
  //
  // `text` here is a fallback; the visible label comes from
  // i18n.js → nav.<key>, for children too.
  nav: withMatchKeys([
    { href: "/", text: "Home", key: "home" },
    {
      href: "/past.html",
      text: "Conference",
      key: "conferences",
      editions: true,
      children: [
        { href: "/past.html", text: "All past conferences", key: "allPast" },
      ],
    },
    { href: "/anthology.html", text: "Anthology", key: "anthology", match: ["navigator"] },
    {
      href: "/events.html",
      text: "Activities",
      key: "activities",
      children: [
        { href: "/events.html", text: "All activities", key: "events" },
        { href: "/NetSecSchool.html", text: "NetSec Summer School", key: "netsec" },
        { href: "/euroswamos.html", text: "Euro-SWAMOS", key: "euroswamos" },
        { href: "/coercion.html", text: "Coercive Statecraft", key: "coercion" },
        { href: "/GlobalRisks.html", text: "Global Risks Survey", key: "globalRisks" },
        { href: "/events.html#propose", text: "Propose an event", key: "proposeEvent" },
      ],
    },
    {
      href: "/initiative.html",
      text: "About",
      key: "about",
      children: [
        { href: "/initiative.html", text: "The Initiative", key: "initiative" },
        { href: "/board.html", text: "The People", key: "people" },
        { href: "/news.html", text: "News", key: "news" },
        { href: "/prizes.html", text: "European Security Studies Prize", key: "prizes" },
        { href: "/publications.html", text: "Members' publications", key: "publications" },
        { href: "/press-kit.html", text: "Press kit", key: "pressKit" },
      ],
    },
    {
      href: "/membership.html",
      text: "Get involved",
      key: "getInvolved",
      children: [
        { href: "/membership.html", text: "Membership", key: "membership" },
        { href: "/internship.html", text: "Volunteering and internships", key: "internship" },
        { href: newsletterUrl, text: "Newsletter", key: "newsletter", external: true },
      ],
    },
  ]),
};
