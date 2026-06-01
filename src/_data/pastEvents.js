/**
 * Past members' events, for the "Past events" section on /events.
 *
 * Sourced from the Indico "Members' Events" category
 * (https://indico.eiss-europa.com/category/2/), which is members-only and
 * so is NOT reachable from the public export API the rest of the Indico
 * pipeline uses. The titles, dates, conveners and affiliations below were
 * read from the authenticated category export and transcribed here by
 * hand. The "Call for Abstracts: Members' Events" container (event id 3)
 * is excluded. Automating this refresh from the authenticated API is
 * tracked in issue #401; until then this list is maintained by hand.
 *
 * NOTE: the raw Indico descriptions carry members-only logistics (a Zoom
 * link + passcode, members-only recording links). Those are deliberately
 * NOT reproduced here — this file holds only non-sensitive facts.
 *
 * Newest first. Each entry:
 *   { date: "YYYY-MM-DD", title, eventId, presenters?: [{name, affiliation}],
 *     tag?, href? }
 *
 * `eventId` is the Indico event id, kept for the future automated sync
 * (#401); it is NOT rendered as a public link, because these events are
 * members-only on Indico (a public visitor would hit a login wall).
 * `href` is set only when a public destination exists (the joint
 * Sciences Po–EISS conference has its own archive page). Titles are the
 * event names as they appear on Indico (English); the template marks
 * them lang="en" on the FR / DE pages.
 */
module.exports = [
  {
    date: "2025-11-19",
    title: "Joint Seminar on Election Interference and Disinformation",
    eventId: 23,
  },
  {
    date: "2024-11-19",
    title: "The Dynamics of Contemporary Coercive Statecraft",
    eventId: 20,
    presenters: [{ name: "Nicolas Blarel", affiliation: "Leiden University" }],
    tag: "Coercive Statecraft Programme",
  },
  {
    date: "2024-06-25",
    title: "The Origins of War and Diplomacy: Interdisciplinary Perspectives",
    eventId: 19,
    presenters: [
      { name: "Chiara Ruffa", affiliation: "Sciences Po" },
      { name: "Christian Lequesne", affiliation: "Sciences Po CERI" },
      { name: "Hugo Meijer", affiliation: "Sciences Po CERI" },
    ],
    href: "/joint-2024.html",
  },
  {
    date: "2024-02-18",
    title: "American Power's Staying Power: Why Multipolarity is a Myth and Why it Matters?",
    eventId: 18,
    presenters: [
      { name: "Stephen G. Brooks", affiliation: "Dartmouth College" },
      { name: "William C. Wohlforth", affiliation: "Dartmouth College" },
    ],
  },
  {
    date: "2023-06-20",
    title: "Forecasting Finlandization: How will Xi's China seek to revise East Asia's regional order?",
    eventId: 11,
    presenters: [
      { name: "Friso Stevens", affiliation: "University of Helsinki / European University Institute" },
      { name: "Andrew Chubb", affiliation: "Lancaster University" },
      { name: "Julie Yu-Wen Chen", affiliation: "University of Helsinki" },
      { name: "Xiaoyu Pu", affiliation: "University of Nevada" },
    ],
    tag: "Early-Career Seminar",
  },
];
