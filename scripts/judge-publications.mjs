#!/usr/bin/env node
/**
 * #805 Phase 3 — an LLM pre-assessment of the review band, so a human still
 * confirms every match but sees a verdict + rationale alongside each row.
 * Advisory only: it never writes src/_data/paperLinks.json and never changes
 * a candidate's band. confirm-publication.mjs stays the only path to
 * paperLinks.json; the auto-high tier is untouched.
 *
 * Reads data/publication-candidates.json, selects review-band candidates
 * that don't already carry an llmVerdict (so re-runs are idempotent), and
 * asks Claude whether the candidate is the later-published version of the
 * conference paper. Each verdict is written back onto its candidate as:
 *   llmVerdict: { verdict, rationale, model, judgedOn }
 *
 * Self-gating: with no ANTHROPIC_API_KEY (or ANTHROPIC_AUTH_TOKEN) set, this
 * is a no-op (exit 0) so the scheduled workflow runs clean before the
 * maintainer adds the secret.
 *
 * Usage:  node scripts/judge-publications.mjs
 * Env:    ANTHROPIC_API_KEY (required to run, unless ANTHROPIC_AUTH_TOKEN is set)
 *         ANTHROPIC_AUTH_TOKEN (alternative: an OAuth bearer token, e.g. from
 *           `ant auth print-credentials --access-token`; sent as
 *           `Authorization: Bearer` + `anthropic-beta: oauth-2025-04-20`
 *           instead of `x-api-key`)
 *         PUBLICATION_JUDGE_MODEL (optional, default claude-opus-4-8)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATES = join(ROOT, "data", "publication-candidates.json");
const MODEL = process.env.PUBLICATION_JUDGE_MODEL || "claude-opus-4-8";
const API_KEY = process.env.ANTHROPIC_API_KEY;
const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Never log the credential itself — only whether one is present, and which kind.
function authHeaders() {
  if (API_KEY) return { "x-api-key": API_KEY };
  if (AUTH_TOKEN) return { authorization: `Bearer ${AUTH_TOKEN}`, "anthropic-beta": "oauth-2025-04-20" };
  return null;
}

// Same key convention as corpus.js / paperAbstracts.json: `${year}::${normAbsTitle(title)}`.
function normAbsTitle(t) {
  return String(t || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function loadAbstracts() {
  let base = {};
  let manual = {};
  try { base = require("../src/_data/paperAbstracts.json"); } catch { /* none yet */ }
  try { manual = require("../src/_data/paperAbstractsManual.json"); } catch { /* none yet */ }
  return { ...base, ...manual };
}

function abstractFor(abstracts, candidate) {
  const key = `${candidate.paperYear}::${normAbsTitle(candidate.paperTitle)}`;
  return abstracts[key]?.abstract || null;
}

const SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["same_work", "different_work", "uncertain"] },
    rationale: { type: "string" },
  },
  required: ["verdict", "rationale"],
  additionalProperties: false,
};

function buildPrompt(candidate, abstract) {
  const ourPaper = [
    `Title: "${candidate.paperTitle}"`,
    `Authors: ${candidate.member || "(see conference programme)"}`,
    `Conference: ${candidate.conference}`,
    abstract ? `Abstract: ${abstract}` : "Abstract: (not on file)",
  ].join("\n");
  const candidateWork = [
    `Title: "${candidate.candidateTitle}"`,
    `Venue: ${candidate.journal || "(unknown)"}`,
    `Publication year: ${candidate.candidateYear || "(unknown)"}`,
    `DOI: ${candidate.doi || "(none)"}`,
    `Source: ${candidate.matchedVia}`,
  ].join("\n");
  return [
    "You are helping a small academic conference site decide whether a candidate publication is the later-published version of a conference paper.",
    "",
    "Conference paper:",
    ourPaper,
    "",
    "Candidate published work:",
    candidateWork,
    "",
    "Is the candidate the later-published version of the conference paper? Weigh author identity, topical overlap, the plausibility of the title having changed on the way to print, and whether the publication-lag window is reasonable.",
    "Answer uncertain rather than guess when the evidence is thin.",
  ].join("\n");
}

async function judgeOne(candidate, abstract) {
  const body = {
    model: MODEL,
    max_tokens: 2000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(candidate, abstract) }],
  };

  let res;
  for (let attempt = 0; attempt < 2; attempt++) {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status === 529) {
      if (attempt === 0) { await sleep(5000); continue; }
    }
    break;
  }

  if (!res.ok) {
    console.error(`! ${candidate.slug}: HTTP ${res.status} — skipped`);
    return null;
  }

  const data = await res.json();
  if (data.stop_reason === "refusal" || data.stop_reason === "max_tokens") {
    console.error(`! ${candidate.slug}: stop_reason "${data.stop_reason}" — no verdict recorded`);
    return null;
  }

  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) {
    console.error(`! ${candidate.slug}: no text block in response — skipped`);
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch (e) {
    console.error(`! ${candidate.slug}: could not parse verdict JSON — ${e.message}`);
    return null;
  }

  return {
    verdict: parsed.verdict,
    rationale: parsed.rationale,
    model: MODEL,
    judgedOn: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  if (!authHeaders()) {
    console.log("ANTHROPIC_API_KEY (or ANTHROPIC_AUTH_TOKEN) not set — LLM judge skipped (Phase 3 is a no-op until the secret is added).");
    process.exit(0);
  }

  if (!existsSync(CANDIDATES)) {
    console.log("No data/publication-candidates.json — nothing to judge.");
    process.exit(0);
  }

  const candidates = JSON.parse(readFileSync(CANDIDATES, "utf8"));
  const toJudge = candidates.filter((c) => c.band === "review" && !c.llmVerdict);

  if (!toJudge.length) {
    console.log("Nothing to judge — no review-band candidates without an existing llmVerdict.");
    process.exit(0);
  }

  const abstracts = loadAbstracts();
  let judged = 0;
  for (const candidate of toJudge) {
    const abstract = abstractFor(abstracts, candidate);
    const verdict = await judgeOne(candidate, abstract);
    if (verdict) {
      candidate.llmVerdict = verdict;
      judged++;
      console.log(`✓ ${candidate.slug} → ${verdict.verdict}`);
    }
    await sleep(1100);
  }

  writeFileSync(CANDIDATES, JSON.stringify(candidates, null, 2) + "\n");
  console.log(`\n${judged}/${toJudge.length} review-band candidate(s) judged. Verdicts are advisory — confirm-publication.mjs is still the only path to paperLinks.json.`);
}

await main();
