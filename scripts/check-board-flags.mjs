#!/usr/bin/env node
// Run after `npm run build`. The text fallback keeps rendering resilient,
// but a non-empty country in the published roster must have a flag (#1836).
import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const problems = [];
const isFile = (file) => {
  try { return statSync(file).isFile(); }
  catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
};

try {
  const board = JSON.parse(readFileSync("src/_data/board.json", "utf8"));
  const { byName } = require(resolve("src/_data/countryFlags.js"));
  // Include former members: their cards and profiles are still published.
  for (const section of ["members", "support"]) {
    for (const [index, person] of (board[section] || []).entries()) {
      const country = person.country;
      if (country == null) continue; // the Form field is optional
      const where = `src/_data/board.json: ${section}[${index}] (${person.name || "unnamed"})`;
      if (typeof country !== "string") {
        problems.push(`${where}: country must be a string when supplied`);
        continue;
      }
      const key = country.toLowerCase().trim(); // same as the templates
      if (!key) continue;
      if (!Object.hasOwn(byName, key) || !byName[key]) {
        problems.push(`${where}: no flag mapping for ${JSON.stringify(country)}. Add an alias in src/_data/countryFlags.js and its SVG in src/assets/images/flags/.`);
      }
    }
  }
  // Every advertised code must exist, even if not used by today's roster.
  // Checking the build output also catches a broken passthrough-copy rule.
  for (const code of new Set(Object.values(byName))) {
    if (typeof code !== "string" || !/^[a-z]{2}$/.test(code)) {
      problems.push(`src/_data/countryFlags.js: invalid flag code ${JSON.stringify(code)} (expected two lowercase letters)`);
      continue;
    }
    for (const prefix of ["src", "_site"]) {
      const file = `${prefix}/assets/images/flags/${code}.svg`;
      if (!isFile(file)) problems.push(`${file}: flag SVG missing${prefix === "_site" ? " (run npm run build and check asset passthrough)" : ""}`);
    }
  }
} catch (error) {
  console.error(`Board flag check could not run: ${error.message}`);
  process.exit(2);
}

if (problems.length) {
  console.error(`Board flag check failed (${problems.length}):\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log("Board flag check passed (all supplied countries mapped, all mapped SVGs present in source and build).");
