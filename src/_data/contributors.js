/**
 * Volunteers and interns credited on /internship.html (+ FR + DE).
 *
 * Two of the four volunteer tracks produce no byline: corpus and abstract
 * indexing, and the database work. This is where those people are named,
 * since the blog's author field never reaches them (#1354).
 *
 * Adding someone is one object here and no other edit. The section renders
 * only when this array is non-empty, so an empty list is invisible rather
 * than an empty heading.
 *
 * ASK FIRST. A published name carries a permanent URL and the person cannot
 * quietly withdraw it later. Record that you asked.
 *
 *   {
 *     name:  "Family name as the person writes it",
 *     did:   "One line on what they did. English, shown in every locale
 *             unless didFr / didDe are supplied.",
 *     didFr: "Optional French version of `did`.",
 *     didDe: "Optional German version of `did`.",
 *     url:   "Optional link to the work: a paper page, a PR, a brief.",
 *   }
 *
 * Order is display order. Newest last reads as a growing list rather than a
 * ranking, which is the intent.
 *
 * ponytail: a plain array, not a sync or a profile system. Volunteers are not
 * board members and need no profile page. If this ever outgrows a section on
 * the internship page, that is the moment to give it its own page, not before.
 */
module.exports = [];
