#!/usr/bin/env node
// Self-check for the board highlights in src/_data/dashboard.js (#2047, #2083),
// with fetch stubbed and the stored file in a scratch folder: a build never
// calls the GitHub API for them, only the daily refresh (DASHBOARD_REFRESH=1)
// does, and a refresh whose calls fail keeps the stored highlights. No framework:
//
//     node scripts/test-board-highlights.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
process.env.EISS_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "board-highlights-"));
const dashboard = require("../src/_data/dashboard.js");

const published = { features: [{ n: 1, title: "Published feature" }], fixes: [{ n: 2, title: "Published fix" }], since: "2026-10-07" };
fs.writeFileSync(dashboard.HIGHLIGHTS(), JSON.stringify(published));
let prCalls = 0;
global.fetch = async (url) => {
  url = String(url);
  if (url.includes("is%3Amerged") || /\/pulls\/\d+$/.test(url)) prCalls++;
  return { ok: false, status: 403, json: async () => ({}), text: async () => "" };
};
const quiet = console.warn;
console.warn = () => {};

(async () => {
  process.env.GITHUB_TOKEN = "x";
  let d = await dashboard();
  assert.strictEqual(prCalls, 0, "a build must not search for the highlights");
  assert.deepStrictEqual(d.board.features, published.features);

  process.env.DASHBOARD_REFRESH = "1";
  d = await dashboard();
  assert.ok(prCalls > 0, "the refresh recomputes the highlights");
  assert.deepStrictEqual(d.board.features, published.features, "a failed recompute keeps the stored highlights");
  assert.deepStrictEqual(d.board.fixes, published.fixes);

  console.warn = quiet;
  console.log("board-highlights: all checks passed");
})().catch((e) => { console.warn = quiet; console.error(e); process.exit(1); });
