#!/usr/bin/env node
/**
 * Phase 1 of #805: ORCID-anchored publication matcher.
 *
 * For each ESSC paper authored by an EISS member who has an ORCID iD on file,
 * propose the member's later-published version (with a DOI) by fuzzy-matching
 * the conference title against that member's own ORCID works. Anchoring to the
 * member's own record makes the author match exact, so title similarity is the
 * only discriminator and false positives are rare.
 *
 * It does NOT write publishedUrl/doi anywhere. It emits a REVIEW QUEUE
 * (data/publication-candidates.json) plus a console report; a human confirms a
 * match before it is ever recorded (the design in #805). Phases 2/3
 * (OpenAlex/Crossref for non-members, optional LLM judge) are future work.
 *
 * Sources: corpus.js (the paper list, with slugs), src/_data/orcidWorks.json
 * (the members who have an ORCID iD), and the public ORCID API (fetched live
 * for a fuller works list than the light 3-work sidecar).
 *
 * Usage:  node scripts/match-publications.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const corpus = require("../src/_data/corpus.js");
const orcidMembers = require("../src/_data/orcidWorks.json");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "publication-candidates.json");

// Title similarity: Dice coefficient over normalised token sets. Handles
// reordering, subtitle drift and added/dropped words better than a raw edit
// distance, which is what conference→publication retitling does.
const STOP = new Set(["the", "a", "an", "of", "and", "or", "in", "on", "to", "for", "with", "as", "at", "by", "from", "is", "are"]);
function tokens(s) {
  return new Set(
    String(s || "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t && !STOP.has(t))
  );
}
function dice(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return (2 * inter) / (A.size + B.size);
}

const orcidIdOf = (url) => (String(url || "").match(/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/) || [])[1] || null;

async function fetchWorks(id) {
  const res = await fetch(`https://pub.orcid.org/v3.0/${id}/works`, {
    headers: { Accept: "application/json", "User-Agent": "eiss-europa.com publication-matcher" },
  });
  if (!res.ok) throw new Error(`ORCID ${id}: HTTP ${res.status}`);
  const data = await res.json();
  const out = [];
  for (const g of data.group || []) {
    const s = (g["work-summary"] || [])[0];
    if (!s) continue;
    const title = s.title?.title?.value;
    if (!title) continue;
    const yearRaw = s["publication-date"]?.year?.value;
    let doi = null, doiUrl = null;
    for (const eid of s["external-ids"]?.["external-id"] || []) {
      if ((eid["external-id-type"] || "").toLowerCase() === "doi") {
        doi = eid["external-id-value"] || null;
        doiUrl = eid["external-id-url"]?.value || (doi ? `https://doi.org/${doi}` : null);
        break;
      }
    }
    out.push({ title: title.trim(), year: /^\d{4}$/.test(yearRaw || "") ? Number(yearRaw) : null, doi, doiUrl, journal: s["journal-title"]?.value || null });
  }
  return out;
}

const HIGH = 0.8, REVIEW = 0.5;
const band = (s) => (s >= HIGH ? "high" : s >= REVIEW ? "review" : "discard");

const candidates = [];
for (const member of orcidMembers) {
  const id = orcidIdOf(member.orcid);
  if (!id) continue;
  const key = corpus.canonicalKey(member.name);
  const papers = (corpus.papers || []).filter(
    (p) => !p.publishedUrl && (p.authors || []).some((a) => corpus.canonicalKey(a.name) === key)
  );
  if (!papers.length) continue;

  let works;
  try {
    works = await fetchWorks(id);
  } catch (e) {
    console.error(`! ${member.name}: ${e.message} — skipped`);
    continue;
  }
  const dois = works.filter((w) => w.doi);
  console.log(`\n${member.name} (${id}) — ${papers.length} ESSC paper(s), ${dois.length} ORCID work(s) with a DOI`);

  for (const p of papers) {
    let best = null;
    for (const w of dois) {
      if (w.year && (w.year < p.year - 1 || w.year > p.year + 6)) continue; // publication lag window
      const score = dice(p.title, w.title);
      if (!best || score > best.score) best = { work: w, score };
    }
    const b = best ? band(best.score) : "discard";
    const mark = b === "high" ? "✓" : b === "review" ? "?" : "·";
    console.log(`  ${mark} [${b}] "${p.title.slice(0, 56)}" (${p.year})`);
    if (best && b !== "discard") {
      console.log(`      → ${best.score.toFixed(2)}  "${best.work.title.slice(0, 56)}" (${best.work.year || "?"})  ${best.work.doi}`);
      candidates.push({
        slug: p.slug,
        paperTitle: p.title,
        paperYear: p.year,
        conference: `${p.conferenceLabel} ${p.year}`,
        matchedVia: "orcid",
        member: member.name,
        candidateTitle: best.work.title,
        candidateYear: best.work.year,
        journal: best.work.journal,
        doi: best.work.doi,
        publishedUrl: best.work.doiUrl,
        titleScore: Number(best.score.toFixed(3)),
        band: b,
        verified: false, // a human confirms before this is recorded as publishedUrl/doi
      });
    }
  }
}

candidates.sort((a, b) => b.titleScore - a.titleScore);
writeFileSync(OUT, JSON.stringify(candidates, null, 2) + "\n");
const high = candidates.filter((c) => c.band === "high").length;
console.log(`\n✓ ${candidates.length} candidate(s) written to data/publication-candidates.json (${high} high-confidence, ${candidates.length - high} for review). None recorded as publishedUrl until confirmed.`);
