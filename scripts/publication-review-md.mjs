#!/usr/bin/env node
/**
 * Render the publication-match review band (data/publication-candidates.json)
 * as a readable Markdown table for the monthly sync PR body
 * (sync-publications.yml). The high-confidence matches are auto-confirmed
 * before this runs, so the queue here is the review band — the part a human
 * actually decides. Prints to stdout.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "data", "publication-candidates.json");
const clip = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

const all = existsSync(QUEUE) ? JSON.parse(readFileSync(QUEUE, "utf8")) : [];
const review = all.filter((x) => x.band === "review").sort((a, b) => b.titleScore - a.titleScore);

if (!review.length) {
  console.log("**Nothing to review this month** — no mid-confidence candidates in the queue.");
  process.exit(0);
}

const out = [];
out.push(`### ${review.length} match${review.length > 1 ? "es" : ""} to review`);
out.push("");
out.push("Each row is a *proposed* link (same author, similar title) that needs a human call — probably the same paper, but check. Decide per row with the slug in the last column:");
out.push("");
out.push("```");
out.push("accept:  node scripts/confirm-publication.mjs <slug>");
out.push("reject:  node scripts/confirm-publication.mjs --reject <slug>");
out.push("```");
out.push("");
out.push("| Score | ESSC paper | Proposed published version | Slug |");
out.push("|:--:|---|---|---|");
for (const x of review) {
  const venue = [x.candidateYear, x.journal ? clip(x.journal, 28) : null].filter(Boolean).join(", ");
  const pub = clip(x.candidateTitle, 56) + (venue ? ` *(${venue})*` : "");
  const paper = clip(x.paperTitle, 56) + `<br><sub>${x.conference}</sub>`;
  out.push(`| ${x.titleScore.toFixed(2)} | ${paper} | ${pub} | \`${x.slug}\` |`);
}
out.push("");
out.push("_Anything you don't act on stays in the queue for next month._");
console.log(out.join("\n"));
