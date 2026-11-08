#!/usr/bin/env node
// Self-check for the calendar tiles in src/_data/dashboard.js (#2028), with
// fetch stubbed. The "EISS dates" calendar feeds the tiles beside the key
// dates, and NetSec's events.json fills in what the calendar lacks. No framework:
//
//     node scripts/test-dashboard-agenda.js
const assert = require("assert");
const dashboard = require("../src/_data/dashboard.js");
const { next: edition } = require("../src/_data/conferences.js");

// Dates a few days ahead, so the tiles' cap of 20 never cuts them.
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const [D1, D2, D3, D4, D5, D6, D7] = [1, 2, 3, 4, 5, 6, 7].map(inDays);
let calendar = null;
const netsec = {
  events: [
    { summary: "NetSec workshop", start: D2 + "T09:00", end: D2 + "T18:00", url: "https://netsec-cost.eu/w.html", indicoEventId: 41, status: "CONFIRMED" },
    { summary: "MC plenary", start: D4 + "T09:00", end: D4 + "T11:00", url: "https://netsec-cost.eu/#events", status: "CONFIRMED" },
    { summary: "NetSec Training School", start: D5 + "T09:00", end: D7 + "T18:00", url: "https://netsec-cost.eu/s.html", status: "TENTATIVE" },
    { summary: "2099 European Security Studies Conference", start: D6 + "T09:00", end: D7 + "T18:00", url: "x", status: "TENTATIVE" },
  ],
};
global.fetch = async (url) => {
  url = String(url);
  if (url.includes("view=dates")) return calendar ? { ok: true, json: async () => ({ dates: calendar }) } : { ok: false, status: 500 };
  if (url.includes("events.json")) return { ok: true, json: async () => netsec };
  return { ok: false, status: 403, json: async () => ({}), text: async () => "" };
};
const quiet = console.warn;
console.warn = () => {};
const tiles = (d) => d.agenda.filter((x) => x.cat === "event").map((x) => [x.date, x.label, x.site, x.end || null, x.url || null, !!x.tentative]);

(async () => {
  // No calendar: the tiles fall back to events.json, as before.
  let d = await dashboard();
  assert.strictEqual(d.datesSource, "site");
  assert.deepStrictEqual(tiles(d), [
    [D2, "NetSec workshop", "NetSec", null, "https://netsec-cost.eu/w.html", false],
    [D4, "MC plenary", "NetSec", null, "https://netsec-cost.eu/#events", false],
    [D5, "NetSec Training School", "NetSec", D7, "https://netsec-cost.eu/s.html", true],
  ]);

  // The calendar: key dates stay key dates, Indico copies and NetSec dates become tiles.
  calendar = [
    { date: D2, label: "Issue the call", stage: "Call open", step: "Call", links: ["indico"], url: "https://drive.google.com/drive/folders/cfp" },
    { date: D3, label: "Decisions", stage: "Programme", step: "Programme", links: ["indico", "groups"] },
    { date: inDays(-1), label: "Proposals due", stage: "Reviewing", step: "Review", fr: { label: "Propositions", stage: "Évaluation", step: "Évaluation", extra: "x" }, de: { label: " " } },
    { date: D2, label: "NetSec workshop", site: "netsec", indico: "41", url: "https://indico.eiss-europa.com/event/41/" },
    { date: D3, end: D4, label: "EISS workshop", site: "eiss", indico: "42", url: "https://indico.eiss-europa.com/event/42/", roles: ["staff"] },
    { date: D4, label: "MC plenary", site: "netsec" },
    { date: edition.startDate, end: edition.endDate, label: `ESSC ${edition.year}`, site: "joint", indico: "30" },
    { date: D6, label: "Bad site", site: "nato", url: "javascript:alert(1)" },
  ];
  d = await dashboard();
  assert.strictEqual(d.datesSource, "calendar");
  assert.ok(d.dates.some((x) => x.label === "Proposals due"), "a typed EISS date is a key date");
  assert.ok(d.dates.some((x) => x.label === "Bad site"), "an unknown site is dropped and the date kept");
  const tile = (label) => d.agenda.find((x) => x.label === label) || {};
  assert.strictEqual(tile("Issue the call").url, "https://drive.google.com/drive/folders/cfp", "a key date opens its own url");
  assert.strictEqual(tile("Decisions").url, "https://indico.eiss-europa.com", "without a url, the app named first in its links");
  const release = d.agenda.find((x) => x.kind === "release");
  if (release) assert.match(release.url, /\/(milestone\/\d+|issues\?q=)/, "a release opens its milestone");
  const essc = d.agenda.find((x) => x.kind === "essc");
  if (essc) assert.strictEqual(essc.url, `/${edition.year}.html`, "the ESSC opens its page");
  const proposals = d.dates.find((x) => x.label === "Proposals due");
  assert.deepStrictEqual(proposals.fr, { label: "Propositions", stage: "Évaluation", step: "Évaluation" }, "French wording is kept, without unknown keys");
  assert.strictEqual(proposals.de, undefined, "blank wording is dropped");
  assert.strictEqual(d.phase && d.phase.fr && d.phase.fr.label, "Évaluation", "the stage keeps its French name");
  assert.ok(!d.dates.some((x) => x.label === "EISS workshop" || x.label === "MC plenary"), "Indico copies and NetSec dates are not key dates");
  assert.deepStrictEqual(tiles(d), [
    [D2, "NetSec workshop", "NetSec", null, "https://indico.eiss-europa.com/event/41/", false],
    [D3, "EISS workshop", "EISS", D4, "https://indico.eiss-europa.com/event/42/", false],
    [D4, "MC plenary", "NetSec", null, null, false],
    [D5, "NetSec Training School", "NetSec", D7, "https://netsec-cost.eu/s.html", true],
  ], "events.json fills in only what the calendar lacks, and the ESSC copy is left out");
  assert.deepStrictEqual(d.agenda.find((x) => x.label === "EISS workshop").roles, ["staff"]);
  assert.ok(d.agenda.filter((x) => (x.label || "").startsWith(`ESSC ${edition.year}`)).length <= 1, "the ESSC shows once at most");

  // Only Indico copies in the calendar: the key dates fall back to site.js, the tiles still read the calendar.
  calendar = calendar.filter((x) => x.indico);
  d = await dashboard();
  assert.strictEqual(d.datesSource, "site");
  assert.ok(tiles(d).some((t) => t[1] === "EISS workshop"));

  console.warn = quiet;
  console.log("dashboard-agenda: all checks passed");
})().catch((e) => { console.warn = quiet; console.error(e); process.exit(1); });
