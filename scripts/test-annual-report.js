#!/usr/bin/env node
// Self-check for netsecYear() in src/_data/annualReport.js: NetSec's monthly
// reports summed over a calendar year. No framework:
//
//     node scripts/test-annual-report.js
const assert = require("assert");
const { netsecYear, years } = require("../src/_data/annualReport.js");

const month = (start, end, d, c, w) => ({
  start, end,
  directory: { from: d[0], to: d[1], joined: Array(d[2]).fill({}), left: Array(d[3]).fill({}) },
  committee: { from: c[0], to: c[1] },
  website: { merged: w[0], features: w[1], fixes: w[2] },
});
// Out of order on purpose: the archive is newest first.
const reports = [
  month("2026-07-01", "2026-08-01", [105, 110, 6, 1], [49, 50], [30, 5, 9]),
  month("2027-01-01", "2027-02-01", [140, 141, 1, 0], [55, 55], [10, 1, 2]),
  month("2026-06-01", "2026-07-01", [100, 105, 7, 2], [48, 49], [20, 3, 4]),
];
const y = netsecYear(reports, 2026);
assert.deepStrictEqual(y, {
  months: 2, from: "2026-06-01", to: "2026-07-31",
  directory: { from: 100, to: 110, joined: 13, left: 3 },
  committee: { from: 48, to: 50 },
  merged: 50, features: 8, fixes: 13,
});
// No month in the year, or no archive at all: no figure, never a zero.
assert.strictEqual(netsecYear(reports, 2025), null);
assert.strictEqual(netsecYear(null, 2026), null);

// Every year carries itself and the year before, and only the current one is to date.
assert.ok(years.length >= 2);
assert.strictEqual(years.filter((r) => r.toDate).length, 1);
for (const r of years) assert.ok(r.now && r.before);

console.log("annual-report: all checks passed");
