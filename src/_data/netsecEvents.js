// NetSec's events, read from data/events.json in netsec.github.io when the site
// builds. The NetSec Training School pages and the 2027 page take the School's
// dates and application deadline from here (netsec.github.io#2133). NetSec sets
// them from the "EISS dates" calendar, so a moved date is edited there once.
//
// byUid[uid] gives { displayDate: { en, fr, de }, deadline: { en, fr, de } },
// written the way NetSec writes them. A build that cannot reach GitHub uses
// FALLBACK and warns, so the pages keep the last dates known here.

const SOURCE = "https://raw.githubusercontent.com/EISSeuropa/netsec.github.io/main/data/events.json";

// ponytail: the one entry the pages read, as of 8 November 2026. Refresh it
// when a warning above shows it in use and the dates have moved.
const FALLBACK = [
  {
    uid: "summer-school-2027@netsec-cost.eu",
    displayDate: { en: "8–11 June 2027", fr: "8–11 juin 2027", de: "8.–11. Juni 2027" },
    applicationDeadline: "2026-12-07",
  },
];

const LOCALES = { en: "en-GB", fr: "fr", de: "de" };

// "7 December 2026", "7 décembre 2026", "7. Dezember 2026", with NetSec's "1er".
function day(iso, lang) {
  const text = new Intl.DateTimeFormat(LOCALES[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${iso}T00:00:00Z`));
  return lang === "fr" ? text.replace(/^1 /, "1er ") : text;
}

function index(events) {
  return Object.fromEntries(events.map((e) => [e.uid, {
    displayDate: e.displayDate || {},
    deadline: e.applicationDeadline ? Object.fromEntries(Object.keys(LOCALES).map((l) => [l, day(e.applicationDeadline, l)])) : null,
  }]));
}

let pending;
async function load() {
  try {
    const res = await fetch(SOURCE, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(String(res.status));
    const events = (await res.json()).events || [];
    // A field the fetched entry lacks keeps its FALLBACK value, so a NetSec
    // deploy that has not caught up never leaves a blank on a page.
    const fetched = new Map(events.map((e) => [e.uid, e]));
    const merged = [...FALLBACK.map((f) => ({ ...f, ...fetched.get(f.uid) })), ...events.filter((e) => !FALLBACK.some((f) => f.uid === e.uid))];
    return { events, byUid: index(merged) };
  } catch (e) {
    console.warn(`[netsecEvents] NetSec events unavailable (${e.message}), the Training School dates as of 8 November 2026 used`);
    return { events: [], byUid: index(FALLBACK) };
  }
}

// One fetch per build, shared with dashboard.js.
module.exports = () => (pending ||= load());
module.exports.day = day;
