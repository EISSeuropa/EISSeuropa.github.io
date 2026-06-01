/**
 * Past members' events, for the "Past events" section on /events.
 *
 * Transcribed by hand from the Indico "Members' Events" category
 * (https://indico.eiss-europa.com/category/2/). That category is
 * members-only, so it is NOT reachable from the public export API the
 * rest of the Indico pipeline uses (the public export returns only the
 * "Call for Abstracts: Members' Events" container, which is excluded
 * here). Automating this refresh from the authenticated API is tracked
 * in issue #401; until then this list is maintained by hand.
 *
 * Newest first. Each entry:
 *   { date: "YYYY-MM-DD", title, presenters?: [..], tag?, href? }
 *
 * The events are members-only on Indico, so we do NOT link to Indico
 * (it would send a public visitor to a login wall). `href` is set only
 * when a public destination exists, e.g. the joint Sciences Po–EISS
 * conference has its own archive page.
 *
 * Titles are the event names as they appear on Indico (English); the
 * template marks them lang="en" on the FR / DE pages.
 */
module.exports = [
  {
    date: "2025-11-19",
    title: "Joint Seminar on Election Interference and Disinformation",
  },
  {
    date: "2024-11-19",
    title: "The Dynamics of Contemporary Coercive Statecraft",
    tag: "Coercive Statecraft Programme",
  },
  {
    date: "2024-06-25",
    title: "The Origins of War and Diplomacy: Interdisciplinary Perspectives",
    presenters: ["Chiara Ruffa", "Christian Lequesne", "Hugo Meijer"],
    href: "/joint-2024.html",
  },
  {
    date: "2024-02-18",
    title: "American Power's Staying Power: Why Multipolarity is a Myth and Why it Matters?",
    presenters: ["Stephen G. Brooks", "William C. Wohlforth"],
  },
  {
    date: "2023-06-20",
    title: "Forecasting Finlandization: How will Xi's China seek to revise East Asia's regional order?",
    presenters: ["Andrew Chubb", "Friso Stevens", "Julie Yu-Wen Chen", "Xiaoyu Pu"],
    tag: "Early-Career Seminar",
  },
];
