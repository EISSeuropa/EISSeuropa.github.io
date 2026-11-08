#!/usr/bin/env node
// Recomputes the internal dashboard's two API-heavy datasets and commits them
// as files, so no deploy spends the Actions token's hourly API allowance on
// them (#2047, #2083):
//
//   src/data/netsec-reports.json   the NetSec report's months (netsecReport.js)
//   src/data/board-highlights.json the board's features and fixes (dashboard.js)
//
// Run daily by .github/workflows/roadmap-refresh.yml with GITHUB_TOKEN set.
// A file is written only when the new result keeps everything the stored one
// had, so a failed or rate-limited run leaves the last good commit in place.
//
//     GITHUB_TOKEN=... node scripts/refresh-dashboard-data.js
const fs = require("fs");

process.env.DASHBOARD_REFRESH = "1";
const netsecReport = require("../src/_data/netsecReport.js");
const dashboard = require("../src/_data/dashboard.js");

const read = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return fallback; }
};
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.log("No GITHUB_TOKEN: nothing recomputed, the stored files stay as they are.");
    return;
  }

  const reportsFile = netsecReport.STORE();
  const before = read(reportsFile, []);
  const months = (await netsecReport()) || [];
  const lost = before.filter((b) => b && b.start && !months.some((m) => m.start === b.start));
  if (lost.length) console.log(`NetSec report: kept the stored file, the new run lacks ${lost.map((m) => m.start).join(", ")}.`);
  else if (JSON.stringify(months) === JSON.stringify(before)) console.log(`NetSec report: unchanged, ${months.length} months.`);
  else { write(reportsFile, months); console.log(`NetSec report: ${before.length} → ${months.length} months.`); }

  const highlightsFile = dashboard.HIGHLIGHTS();
  const was = read(highlightsFile, { features: [], fixes: [] });
  const now = await dashboard.fetchHighlights();
  const count = (h) => (h && Array.isArray(h.features) && Array.isArray(h.fixes) ? h.features.length + h.fixes.length : -1);
  if (count(now) < 0 || (count(now) === 0 && count(was) > 0)) console.log("Board highlights: kept the stored file, the new run found none.");
  else if (JSON.stringify(now) === JSON.stringify(was)) console.log(`Board highlights: unchanged, ${now.features.length} features and ${now.fixes.length} fixes.`);
  else { write(highlightsFile, now); console.log(`Board highlights: ${now.features.length} features and ${now.fixes.length} fixes since ${now.since}.`); }
}

main().catch((e) => { console.error(e); process.exit(1); });
