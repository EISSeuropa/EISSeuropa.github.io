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
  // The label page, not `/issues?q=`: `help wanted` sits on both issues and
  // pull requests, and the issues search hides PRs.
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
    // The same reference in fields rather than prose, for the citation
    // metadata in base.njk. A reference manager saving /anthology.html
    // should record what `citation` below prints, so these two must agree.
    title: "The European Security Studies Anthology",
    author: "Laudrain, Arthur",
    year: "2026",
    publisher: "European Initiative for Security Studies",
    rights: "CC BY 4.0",
    abstract:
      "Every paper presented at a European Initiative for Security Studies " +
      "conference or workshop since 2017, and everyone who presented it, with " +
      "abstracts, research themes and citation details where they are on file. " +
      "Compiled from the conference programmes, and from Indico for recent editions.",
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
    // The site source code archived in Software Heritage. The SWHID is the
    // bare directory identifier, computed from the content. The URL carries
    // the origin / visit / anchor qualifiers that let the archive resolve it
    // in context. Cited on /licensing and beside the DOI on the Anthology.
    swhid: "swh:1:dir:482a1c89d5fa36abcd5719d994c1261ce31c602e",
    // The archive's landing page for the repository as a whole, as opposed
    // to the pinned directory above. Behind the "archived software
    // repository" badge.
    swhOriginUrl:
      "https://archive.softwareheritage.org/browse/origin/?origin_url=" +
      "https://github.com/EISSeuropa/EISSeuropa.github.io",
    swhidUrl:
      "https://archive.softwareheritage.org/swh:1:dir:482a1c89d5fa36abcd5719d994c1261ce31c602e" +
      ";origin=https://github.com/EISSeuropa/EISSeuropa.github.io" +
      ";visit=swh:1:snp:fe6fce477add39ff7d70595c1dc8c6788f2e235e" +
      ";anchor=swh:1:rev:1a8ca570193389c2ac9a603accfe4db1765f4898",
  },

  social: {
    youtube: "https://www.youtube.com/channel/UCfdVczE8X2iDPsIaadtP57Q",
    twitter: "https://twitter.com/EISSnetwork",
    twitterHandle: "@EISSnetwork",
    linkedin: "https://www.linkedin.com/company/eiss-europa/",
  },
  newsletterUrl,
  // Annual membership fees in euros, per tier. Read by /membership and the
  // homepage join panel, so a price change is made once, here.
  membershipPrices: { student: 30, early: 50, established: 80 },
  membershipPortalUrl: "https://billing.stripe.com/p/login/3cscOuaesfHceC4dQQ",
  // Homepage partner strip (home-partners.njk). Only partners whose logo is
  // already published on the site, with their agreement: add one when both
  // the file and the OK are in hand. Names in each locale are the forms the
  // conference organiser lines already use. The strip sits under the
  // host-city timeline and names the next conference's partners, so the
  // host institution changes at each rollover (docs/new-conference.md).
  homePartners: [
    {
      name: { en: "COST Action NetSec", fr: "Action COST NetSec", de: "COST-Aktion NetSec" },
      url: "https://netsec-cost.eu/",
      logo: "/assets/images/partners/netsec.svg",
    },
    {
      name: { en: "Journal of Strategic Studies", fr: "Journal of Strategic Studies", de: "Journal of Strategic Studies" },
      url: "https://www.tandfonline.com/journals/fjss20",
      logo: "/assets/images/brand/jss-logo.svg",
    },
    {
      name: {
        en: "University of Belgrade, Faculty of Political Science",
        fr: "Université de Belgrade, Faculté de sciences politiques",
        de: "Universität Belgrad, Fakultät für Politikwissenschaften",
      },
      url: "https://www.fpn.bg.ac.rs/",
      logo: "/assets/images/partners/belgrade-fpn.png",
    },
  ],

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
        { href: "/blog.html", text: "Belvedere – the EISS Blog", key: "blog" },
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
        { href: "/internship.html", text: "Volunteering", key: "internship" },
        { href: newsletterUrl, text: "Newsletter", key: "newsletter", external: true },
      ],
    },
  ]),

  // The apps on /internal.html and, where `menu` is set, in the header
  // padlock menu, ordered by that number. Labels are `t.staffMenu.<key>`. `roles` drives the
  // dashboard's role filter (a convenience, not access control: every app
  // asks for sign-in), and an entry without `roles` is menu-only. The
  // `/a/eiss-europa.com` form steers sign-in to the EISS account (Meet 404s
  // on it, so it goes bare). The
  // mail./groups. custom domains are http only, so they are not linked.
  staffLinks: [
    { href: "https://indico.eiss-europa.com", key: "indico", icon: "ticket", roles: ["staff", "management", "board", "volunteer"] },
    { href: "https://mail.google.com/a/eiss-europa.com", key: "mail", icon: "mail", roles: ["staff", "management", "board", "volunteer"], menu: 2 },
    // contact@ and internship@ are collaborative inboxes, worked in Groups.
    { href: "https://groups.google.com/a/eiss-europa.com", key: "groups", icon: "inbox", roles: ["staff", "management", "volunteer"], menu: 3 },
    { href: "https://calendar.google.com/a/eiss-europa.com", key: "calendar", icon: "calendar", roles: ["staff", "management", "board", "volunteer"], menu: 5 },
    { href: "https://drive.google.com/a/eiss-europa.com", key: "drive", icon: "folder", roles: ["staff", "management", "board", "volunteer"], menu: 4 },
    { href: "https://meet.google.com/", key: "meet", icon: "video", roles: ["staff", "management", "board", "volunteer"] },
    { href: "/internal.html", key: "allApps", icon: "layout-grid", menu: 6, sep: true },
    {
      href: "https://docs.google.com/forms/d/e/1FAIpQLSevC0tbQwCA4ZNfdk_pCY5xUvmFjuQbIIpddDXLF5TdSoKfcw/viewform",
      key: "internForm",
      icon: "user-plus",
      roles: ["staff", "management"],
    },
    // Daily tasks live in Chat spaces.
    { href: "https://chat.google.com/", key: "chat", icon: "users", roles: ["staff", "management", "volunteer"], menu: 1 },
  ],

  // The guides on /internal.html. Roles work as in staffLinks.
  guideLinks: [
    { href: "#welcome", label: "Joining steps", icon: "user-plus", roles: ["staff", "management", "board", "volunteer"] },
    { href: "https://docs.google.com/document/d/1nnUBgds6CUM5fLHmhDwB1osklx-99lXzKv2OhPF0SXo/edit", label: "Joining Guide", icon: "book-open", roles: ["staff", "management", "board", "volunteer"] },
    { href: "https://docs.google.com/document/d/1ETe9RCqFLRExvyRCouYKHyIl0xEZNXJ-aUIMZNpwue4/edit", label: "How the team works", icon: "file-text", roles: ["staff", "management", "volunteer"] },
    { href: "https://docs.google.com/document/d/1c3_KX7Hm-57OQZh3soo-JCQ_HaaEekqwlhXMW0C42Xs/edit", label: "Volunteer handbook", icon: "graduation-cap", roles: ["staff", "volunteer"] },
    { href: "https://docs.google.com/document/d/1v1XXmCYhJoFn8gJopP0vIXKc6m37ecjSDXM2F11ykNk/edit", label: "Staff handbook", icon: "file-text", roles: ["staff", "management"] },
    { href: "https://github.com/EISSeuropa/EISSeuropa.github.io/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22", label: "Website tasks", icon: "git-branch", roles: ["staff", "volunteer"] },
    { href: "https://drive.google.com/drive/folders/1J2MqJ_1cwHgL9V2wNpPlU4sCT5SWwrcd", label: "Guides and procedures", icon: "folder", roles: ["staff", "management", "volunteer"] },
    { href: "https://github.com/EISSeuropa/EISSeuropa.github.io/blob/master/docs/news-publishing.md", label: "Publishing news", icon: "rss", roles: ["staff"] },
    { href: "https://github.com/EISSeuropa/EISSeuropa.github.io/blob/master/docs/admin-guide.md", label: "Operator and handover guide", icon: "book-open", roles: ["staff", "management", "board"] },
  ],

  // The welcome dialog on /internal.html: what someone joining (or moving
  // over from the old set-up) does, in order. `links` name staffLinks by key
  // or guideLinks by label, or are { href, label, icon, roles }. `moving` is
  // shown to people already with EISS, and `key` badges the step that
  // matters most. A step's roles pick who is shown it. A link's roles apply
  // only when written here or carried by a guide. Public page, so nothing
  // confidential.
  // The order follows the people lifecycle script in EISSeuropa/workspace-ops
  // (intern-lifecycle/Code.gs): the Joining Form, an approval, the account
  // within the hour, then the welcome email. Change both together.
  onboarding: [
    {
      stage: "Before your account",
      steps: [
        { id: "form", title: "Fill in the Joining Form", roles: ["staff", "management", "board", "volunteer"], text: "Give your role, your personal email and your dates. Once your entry is approved, your EISS account is created within the hour.", links: ["internForm"], moving: "Fill it in too if you do not have an eiss-europa.com account yet." },
        { id: "welcome", title: "Look out for the welcome email", roles: ["staff", "management", "board", "volunteer"], text: "It arrives at your personal address, with your new EISS address and a temporary password." },
      ],
    },
    {
      stage: "Day one",
      steps: [
        { id: "chrome", key: "Do this first", title: "Make a Chrome profile for EISS", roles: ["staff", "management", "board", "volunteer"], text: "In Chrome, add a new profile and sign in to your EISS account there, never in the window you use for your personal Google account. Open EISS apps, Drive links and this dashboard only from that profile. Mixed accounts are the cause of most \"no access\" errors.", links: [{ href: "https://support.google.com/chrome/answer/2364824", label: "Add a Chrome profile", icon: "user-plus" }] },
        { id: "account", title: "Sign in and choose your password", roles: ["staff", "management", "board", "volunteer"], text: "In your EISS profile, sign in to Gmail with your EISS address and the temporary password. Google then asks you to choose your own.", links: ["mail"] },
        { id: "guide", title: "Follow the Joining Guide", roles: ["staff", "management", "board", "volunteer"], text: "It opens once you are signed in, and takes you through 2-Step Verification.", links: ["Joining Guide"] },
        { id: "role", title: "Read the guide for your role", roles: ["staff", "management", "board", "volunteer"], links: [
          "Volunteer handbook",
          "Staff handbook",
          { href: "https://drive.google.com/file/d/1J1Z-oDGrO7EqYyIw0I_dql8U65lzFMoM/view", label: "Writing as management@", icon: "file-text", roles: ["management"] },
          { href: "https://drive.google.com/file/d/1blou9JjBbdzbuCxOHkxPbg9oDO3Ii-Xt/view", label: "Writing to board@", icon: "file-text", roles: ["board"] },
          "How the team works",
        ] },
        { id: "profile", title: "Check your card on the People page", roles: ["staff", "management", "board", "volunteer"], text: "If you gave a profile on the Joining Form, your card is made from it. To add a photo or change your details, use the bios form, signed in with your EISS account.", links: [{ href: "https://docs.google.com/forms/d/e/1FAIpQLSdL-DGd5SV7awb56Wh8G71w5oCpXWwlvJKYKyEr0r3oZExKvg/viewform", label: "Bios form", icon: "user" }, { href: "/board.html", label: "The People", icon: "users" }] },
        { id: "chat", title: "Join your rooms in Team chat", roles: ["staff", "management", "volunteer"], text: "Accept the invitations to your rooms. Each room's Tasks tab holds its daily work: assign, comment and tick off tasks there.", links: ["chat"], moving: "The Project Manager is now an archive. Add any open task to the Tasks tab of the room it belongs to." },
      ],
    },
    {
      stage: "First week",
      steps: [
        { id: "bookmark", title: "Bookmark this dashboard", roles: ["staff", "management", "board", "volunteer"], text: "internal.eiss-europa.com brings you back here, to every app and guide." },
        { id: "inbox", title: "Answer the shared inboxes", roles: ["staff", "management", "volunteer"], text: "internship@ is the volunteers' shared inbox in Groups, and contact@ is answered by the staff members added to it. In either, take a conversation so others see it is yours, reply, then mark it complete. On internship@, reply from your own address.", links: ["groups"] },
        { id: "management", title: "Send as management@", roles: ["management"], text: "Co-Directors and the treasurer can send as management@. Choose it in the From line in Gmail.", links: ["mail"] },
        { id: "board", title: "Write to the board", roles: ["board"], text: "board@ reaches every board member. Nobody sends as board@: reply from your own address.", links: ["mail"], moving: "For a week after your EISS address joins board@, its messages reach your usual address too. After that, only the new one. To keep reading them in your usual inbox, set up forwarding in your EISS Gmail." },
        { id: "drive", title: "Keep EISS files in a shared drive", roles: ["staff", "management", "board", "volunteer"], text: "Your role's group opens its shared drive: EISS Team, or EISS Board for board members. Save EISS work there, not in My Drive.", links: ["drive"], moving: "Move EISS files from a personal account into the shared drive." },
        { id: "calendar", title: "Meet in Calendar and Meet", roles: ["staff", "management", "board", "volunteer"], text: "Invitations arrive at your EISS address. Join calls with that account.", links: ["calendar", "meet"] },
        { id: "indico", title: "Find the conference in Indico", roles: ["staff", "management", "board", "volunteer"], text: "Submissions, reviews and the programme of each ESSC live in Indico. Indico has its own account, apart from Google: create one with your EISS address, or add that address to the account you already have, under My profile, then Emails.", links: ["indico"] },
        { id: "github", title: "Pick up a website task", roles: ["staff", "volunteer"], text: "Changes to the website are GitHub issues, and those marked help wanted are open to volunteers. Team work with an owner and a date goes in Chat instead.", links: ["Website tasks"] },
      ],
    },
    {
      stage: "When you leave",
      steps: [
        { id: "leave", title: "Hand over before your end date", roles: ["volunteer"], text: "A reminder arrives a week before. Move EISS files from My Drive into the EISS Team shared drive, update your role section in the Volunteer handbook, reassign your open tasks in Chat and hand over every internship@ message you took. Your account is suspended the day after your end date.", links: ["Volunteer handbook"] },
        { id: "leave-other", title: "Move your files before you go", roles: ["staff", "management", "board"], text: "Move any EISS files still in My Drive into a shared drive. Arthur then closes your access.", links: ["drive"] },
      ],
    },
  ],

  // The year's dates for /internal.html, one edition at a time, added there to
  // the conference and the release due dates. The "EISS dates" calendar takes
  // over once it has events (see docs/admin-guide.md), and this list is then
  // only the fallback. This page is public, so nothing confidential:
  // { date: "2027-01-31", label: "...", roles: ["staff"] }.
  // A date that opens a stage of the conference year also carries `stage` (its
  // name on the "Now" card), `step` (its short name on the stepper) and
  // `links` (staffLinks by key or label). A stage runs until the next date
  // that opens one. The last stage, the conference itself, comes from
  // conferences.js with `conferenceStage` below.
  keyDates: [
    { date: "2026-06-13", label: "Preparations for ESSC 2027 begin", stage: "Preparing the call for papers", step: "Prepare call", links: ["drive", "chat"] },
    { date: "2026-11-10", label: "Issue the ESSC 2027 call for papers", stage: "Call for papers open", step: "Call open", links: ["indico", "groups"] },
    { date: "2027-01-26", label: "Panel, poster and paper proposals due on Indico", stage: "Reviewing proposals", step: "Review", links: ["indico", "drive"] },
    { date: "2027-02-20", label: "Decisions on open panels (organising committee) and on papers for closed panels (chairs)", stage: "Finalising the programme", step: "Programme", links: ["indico", "groups"] },
    { date: "2027-02-27", label: "Final programme sent to participants", stage: "Programme out, papers next", step: "Papers", links: ["indico", "groups"] },
    { date: "2027-05-27", label: "Papers due to panel chairs for the Best Paper Prize" },
    { date: "2027-06-03", label: "Papers due to panel chairs", stage: "Final preparations", step: "Final prep", links: ["drive", "calendar"] },
  ],
  conferenceStage: { step: "Conference", links: ["indico", "groups"] },
  // The "EISS internal deadlines" calendar, linked under Key dates once it
  // exists. The dates above are only the public ones.
  deadlinesCalendar: "",

  // The unlisted /internal.html#admin view. Hidden from view, not secret: the
  // links are in the page source and each app's own sign-in protects it.
  adminLinks: [
    { href: "https://admin.google.com/", label: "Admin console", icon: "shield" },
    { href: "https://indico.eiss-europa.com/admin/", label: "Indico administration", icon: "settings" },
    { href: "https://docs.google.com/spreadsheets/d/1upTZe9BrEj_pVAXDCGBHFLHhXwzvSK5nHrz_nuXT4-Y/edit", label: "Project Manager Sheet (archive)", icon: "file-text" },
    { href: "https://script.google.com/home", label: "Apps Script", icon: "code" },
    { href: "https://ap.www.namecheap.com/", label: "Namecheap", icon: "globe" },
    { href: "https://github.com/EISSeuropa", label: "GitHub", icon: "git-branch" },
  ],
};
