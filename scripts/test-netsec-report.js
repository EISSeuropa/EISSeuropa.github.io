#!/usr/bin/env node
// Self-check for the month list in src/_data/netsecReport.js (#2047), with
// fetch stubbed: pull-request builds never call the GitHub API, and a build
// that cannot recompute a month keeps its live copy. No framework:
//
//     node scripts/test-netsec-report.js
const assert = require("assert");
const report = require("../src/_data/netsecReport.js");

const all = report.months();
const [newest, older] = all;
// The live copy: the newest month at the current VERSION, the one before at an old one.
const published = [{ version: 1, start: newest.start, end: newest.end, tag: "live-current" },
                   { version: 0, start: older.start, end: older.end, tag: "live-old" }];
let apiCalls = 0;
global.fetch = async (url) => {
  if (String(url).includes("netsec-reports.json")) return { ok: true, json: async () => published };
  apiCalls++;
  return { ok: false, status: 403, json: async () => ({}) };
};
const quiet = console.warn;
console.warn = () => {};

(async () => {
  // A pull-request build with a token: no API call, every live month kept.
  process.env.GITHUB_TOKEN = "x";
  process.env.GITHUB_EVENT_NAME = "pull_request";
  apiCalls = 0;
  let out = await report();
  assert.strictEqual(apiCalls, 0, "a pull-request build must not call the API");
  assert.deepStrictEqual(out.map((r) => r.tag), ["live-current", "live-old"]);

  // A deploy that is rate-limited: it tries, fails, and keeps what was live.
  process.env.GITHUB_EVENT_NAME = "push";
  apiCalls = 0;
  out = await report();
  assert.ok(apiCalls > 0, "a deploy recomputes the months it lacks");
  assert.deepStrictEqual(out.map((r) => r.tag), ["live-current", "live-old"]);

  // No token: the live months only.
  delete process.env.GITHUB_TOKEN;
  apiCalls = 0;
  out = await report();
  assert.strictEqual(apiCalls, 0);
  assert.strictEqual(out.length, 2);

  // Nothing live and nothing computable: no months, so the tab hides.
  published.length = 0;
  process.env.GITHUB_TOKEN = "x";
  assert.strictEqual(await report(), null);

  console.warn = quiet;
  console.log(`netsec-report: all checks passed (${all.length} months since ${all[all.length - 1].start})`);
})().catch((e) => { console.warn = quiet; console.error(e); process.exit(1); });
