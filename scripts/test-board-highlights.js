#!/usr/bin/env node
// Self-check for the board highlights in src/_data/dashboard.js (#2047), with
// fetch stubbed: pull-request builds never call the GitHub API for them, and a
// build whose calls fail keeps the published highlights. No framework:
//
//     node scripts/test-board-highlights.js
const assert = require("assert");
const dashboard = require("../src/_data/dashboard.js");

const published = { features: [{ n: 1, title: "Published feature" }], fixes: [{ n: 2, title: "Published fix" }], since: "2026-10-07" };
let prCalls = 0;
global.fetch = async (url) => {
  url = String(url);
  if (url.includes("board-highlights.json")) return { ok: true, json: async () => published };
  if (url.includes("is%3Amerged") || /\/pulls\/\d+$/.test(url)) prCalls++;
  return { ok: false, status: 403, json: async () => ({}), text: async () => "" };
};
const quiet = console.warn;
console.warn = () => {};

(async () => {
  process.env.GITHUB_TOKEN = "x";
  process.env.GITHUB_EVENT_NAME = "pull_request";
  let d = await dashboard();
  assert.strictEqual(prCalls, 0, "a pull-request build must not search for the highlights");
  assert.deepStrictEqual(d.board.features, published.features);

  process.env.GITHUB_EVENT_NAME = "push";
  d = await dashboard();
  assert.ok(prCalls > 0, "a deploy recomputes the highlights");
  assert.deepStrictEqual(d.board.features, published.features, "a failed recompute keeps the published highlights");
  assert.deepStrictEqual(d.board.fixes, published.fixes);

  console.warn = quiet;
  console.log("board-highlights: all checks passed");
})().catch((e) => { console.warn = quiet; console.error(e); process.exit(1); });
