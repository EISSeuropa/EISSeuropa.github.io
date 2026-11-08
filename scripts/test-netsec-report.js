#!/usr/bin/env node
// Self-check for the month list in src/_data/netsecReport.js (#2047, #2083),
// with fetch stubbed and the stored file in a scratch folder: a build never
// calls the GitHub API, only the daily refresh (DASHBOARD_REFRESH=1) does, and
// a refresh that cannot recompute a month keeps its stored copy. No framework:
//
//     node scripts/test-netsec-report.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
process.env.EISS_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "netsec-report-"));
const report = require("../src/_data/netsecReport.js");

const all = report.months();
const [newest, older] = all;
// The stored file: the newest month at the current VERSION, the one before at an old one.
const published = [{ version: 1, start: newest.start, end: newest.end, tag: "live-current" },
                   { version: 0, start: older.start, end: older.end, tag: "live-old" }];
const store = (list) => fs.writeFileSync(report.STORE(), JSON.stringify(list));
store(published);
let apiCalls = 0;
global.fetch = async () => {
  apiCalls++;
  return { ok: false, status: 403, json: async () => ({}) };
};
const quiet = console.warn;
console.warn = () => {};

(async () => {
  // A build with a token (a deploy): no API call, the stored months as they are.
  process.env.GITHUB_TOKEN = "x";
  apiCalls = 0;
  let out = await report();
  assert.strictEqual(apiCalls, 0, "a build must not call the API");
  assert.deepStrictEqual(out.map((r) => r.tag), ["live-current", "live-old"]);

  // The refresh, rate-limited: it tries, fails, and keeps what was stored.
  process.env.DASHBOARD_REFRESH = "1";
  apiCalls = 0;
  out = await report();
  assert.ok(apiCalls > 0, "the refresh recomputes the months it lacks");
  assert.deepStrictEqual(out.map((r) => r.tag), ["live-current", "live-old"]);

  // The refresh without a token: the stored months only.
  delete process.env.GITHUB_TOKEN;
  apiCalls = 0;
  out = await report();
  assert.strictEqual(apiCalls, 0);
  assert.strictEqual(out.length, 2);
  delete process.env.DASHBOARD_REFRESH;

  // No stored file and nothing computable: no months, so the tab hides.
  fs.rmSync(report.STORE());
  process.env.GITHUB_TOKEN = "x";
  assert.strictEqual(await report(), null);

  // The per-commit calls go ten at a time, in order: GitHub refuses a burst of 140.
  let inFlight = 0, peak = 0;
  const got = await report.inBatches([...Array(140).keys()], 10, async (i) => {
    peak = Math.max(peak, ++inFlight);
    await new Promise((r) => setTimeout(r, 1));
    inFlight--;
    return i * 2;
  });
  assert.strictEqual(peak, 10, "no more than ten calls at once");
  assert.deepStrictEqual(got, [...Array(140).keys()].map((i) => i * 2));

  console.warn = quiet;
  console.log(`netsec-report: all checks passed (${all.length} months since ${all[all.length - 1].start})`);
})().catch((e) => { console.warn = quiet; console.error(e); process.exit(1); });
