#!/usr/bin/env node
// Self-check for the release card's data, src/_data/latestReleases.js, with
// fetch stubbed. No framework:
//
//     node scripts/test-latest-releases.js
const assert = require("assert");
const R = require("../src/_data/latestReleases.js");

const minor = `> The lede, on
> two lines with a [link](https://x).

### For the team

The Atlas has a **list view**. Staff can share a view by its link.

Second paragraph.

### A theme

Theme prose.

### Index of changes
`;
const patch = "### Index of changes\n\n#### Fixed\n\n- A fix.\n";
const ledeOnly = "> Only a lede.\n\n### A theme\n\nProse.\n";

assert.deepEqual(R.note(minor), { team: true, text: ["The Atlas has a list view. Staff can share a view by its link.", "Second paragraph."] }, "the team section wins over the lede");
assert.deepEqual(R.note(ledeOnly), { team: false, text: ["Only a lede."] }, "the lede when there is no team section");
assert.deepEqual(R.note(patch), { team: false, text: [] }, "patch notes have neither");
assert.deepEqual(R.note("### For the team\n\nLast section.").text, ["Last section."], "a team section at the end of the body");

const changelog = `# Changelog\n\n## [Unreleased]\n\n_Nothing yet._\n\n## [2.29.0] · 2026-11-10 — A title\n\n${minor}\n## [2.28.0] · 2026-08-29 — Older\n\n> Old.\n`;
const eiss = R.fromChangelog(changelog);
assert.equal(eiss.version, "2.29.0");
assert.equal(eiss.title, "A title");
assert.equal(eiss.url, "https://github.com/EISSeuropa/EISSeuropa.github.io/releases/tag/v2.29.0");
assert.ok(!eiss.body.includes("Old."), "the body stops at the next release");

const netsec = R.fromGithub({ tag_name: "v1.4.0", name: "v1.4.0 — Directory search", published_at: "2026-11-05T10:00:00Z", html_url: "https://g/r", body: ledeOnly });
assert.deepEqual([netsec.site, netsec.version, netsec.title, netsec.date], ["NetSec", "1.4.0", "Directory search", "2026-11-05"]);
assert.equal(R.fromGithub({ tag_name: "v1.5.0", draft: true }), null, "drafts are left out");

// The window and the minor-or-team-note rule.
assert.ok(R.card(eiss, "2026-11-10"), "shows on the day");
assert.equal(R.card(eiss, "2026-11-24").until, "2026-11-24", "shows for 14 days");
assert.equal(R.card(eiss, "2026-11-25"), null, "gone after 14 days");
assert.equal(R.card(eiss, "2026-11-09"), null, "not before its date");
assert.equal(R.card({ ...eiss, version: "2.29.1", body: patch }, "2026-11-11"), null, "a patch without a team note stays off");
assert.ok(R.card({ ...eiss, version: "2.29.1", body: "### For the team\n\nThe Form moved.\n\n" + patch }, "2026-11-11"), "a patch with a team note shows");
assert.equal(R.card(eiss, "2026-11-10").body, undefined, "the body is not passed to the page");

// The whole loader, with NetSec's API stubbed and failing.
global.fetch = async () => ({ ok: false, status: 403 });
const quiet = console.warn;
console.warn = () => {};
R().then((cards) => {
  console.warn = quiet;
  assert.ok(Array.isArray(cards), "a failed NetSec call still returns the EISS card list");
  console.log("✓ latestReleases checks passed");
});
