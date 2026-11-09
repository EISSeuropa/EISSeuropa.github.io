#!/usr/bin/env node
// Dependency-free CLI regression tests. Fixtures never modify the repository.
// Run: node --test scripts/test-board-flags.mjs
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const checker = fileURLToPath(new URL("./check-board-flags.mjs", import.meta.url));

function fixture(t, { board = { members: [], support: [] }, byName = { india: "in" }, source = ["in"], built = ["in"] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "eiss-board-flags-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, text) => {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  };
  write("src/_data/board.json", JSON.stringify(board));
  write("src/_data/countryFlags.js", `module.exports = { byName: ${JSON.stringify(byName)} };\n`);
  for (const code of source) write(`src/assets/images/flags/${code}.svg`, "<svg/>");
  for (const code of built) write(`_site/assets/images/flags/${code}.svg`, "<svg/>");
  return () => {
    const result = spawnSync(process.execPath, [checker], { cwd: root, encoding: "utf8" });
    assert.ifError(result.error);
    return { status: result.status, output: result.stdout + result.stderr };
  };
}

test("accepts case/space variants, aliases, both sections and optional countries", (t) => {
  const run = fixture(t, {
    board: { members: [{ country: " INDIA " }, {}, { country: null }, { country: "" }, { country: "  " }], support: [{ country: "Bharat" }] },
    byName: { india: "in", bharat: "in" },
  });
  assert.equal(run().status, 0);
});

test("rejects the original missing-mapping-and-SVG case with the person's name", (t) => {
  const result = fixture(t, {
    board: { support: [{ name: "Astha Dhal", country: "India" }] },
    byName: {}, source: [], built: [],
  })();
  assert.equal(result.status, 1);
  assert.match(result.output, /support\[0\] \(Astha Dhal\).*no flag mapping for "India"/);
});

test("rejects an unmapped country in members, including former members", (t) => {
  const result = fixture(t, { board: { members: [{ name: "Former member", formerMember: true, country: "New country" }] } })();
  assert.equal(result.status, 1);
  assert.match(result.output, /members\[0\].*no flag mapping/);
});

test("rejects a missing source SVG even if stale build output exists", (t) => {
  const result = fixture(t, { source: [] })();
  assert.equal(result.status, 1);
  assert.match(result.output, /src\/assets\/images\/flags\/in.svg: flag SVG missing/);
});

test("rejects a missing built SVG even when the source exists", (t) => {
  const result = fixture(t, { built: [] })();
  assert.equal(result.status, 1);
  assert.match(result.output, /_site\/assets\/images\/flags\/in.svg: flag SVG missing/);
});

test("checks unused mappings even with an empty roster", (t) => {
  const run = fixture(t, { source: [], built: [] });
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.output, /flag SVG missing/);
});

test("rejects a directory masquerading as an SVG", (t) => {
  // This writes a child below in.svg/, creating a directory at the SVG path.
  const result = fixture(t, { source: ["in.svg/child"] })();
  assert.equal(result.status, 1);
  assert.match(result.output, /src\/assets\/images\/flags\/in.svg: flag SVG missing/);
});

test("does not accept inherited Object properties as country aliases", (t) => {
  const result = fixture(t, { board: { members: [{ country: "constructor" }] } })();
  assert.equal(result.status, 1);
  assert.match(result.output, /no flag mapping/);
});

test("rejects malformed country values and unsafe mapping codes", (t) => {
  const result = fixture(t, { board: { members: [{ country: 42 }] }, byName: { india: "../in" } })();
  assert.equal(result.status, 1);
  assert.match(result.output, /country must be a string/);
  assert.match(result.output, /invalid flag code/);
});

test("fails when required inputs cannot be loaded", (t) => {
  const result = fixture(t, { board: null })();
  assert.equal(result.status, 2);
  assert.match(result.output, /could not run/);
});
