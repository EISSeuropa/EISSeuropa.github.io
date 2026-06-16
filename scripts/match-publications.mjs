#!/usr/bin/env node
/**
 * Publication matcher for #805 — proposes the later-published version (with a
 * DOI) of each ESSC paper, into a review queue (data/publication-candidates.json).
 * It NEVER records publishedUrl/doi: a human confirms a candidate with
 * scripts/confirm-publication.mjs, which writes it to src/_data/paperLinks.json.
 *
 * Two phases:
 *   - ORCID (phase 1): for papers authored by a member with an ORCID iD,
 *     match the title against that member's own ORCID works. Author match is
 *     exact (anchored to their record), so title similarity is the only
 *     discriminator. Cheap, high precision.
 *   - OpenAlex (phase 2): for any paper, search OpenAlex by title within a
 *     publication-lag year window, then keep only candidates that share an
 *     author surname with our paper (the "same author" anchor) and clear a
 *     title-similarity bar. Free, no key (polite pool via mailto).
 *
 * Usage:
 *   node scripts/match-publications.mjs                 # ORCID only (fast, default)
 *   node scripts/match-publications.mjs --openalex      # OpenAlex sweep (all papers; slow)
 *   node scripts/match-publications.mjs --all           # both phases
 *   node scripts/match-publications.mjs --openalex --since 2023 --limit 40
 *
 * The review queue accumulates: a phase regenerates its own entries and keeps
 * the other phase's. One entry per paper slug (ORCID preferred, then higher score).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const corpus = require("../src/_data/corpus.js");
const orcidMembers = require("../src/_data/orcidWorks.json");
// Human-validated NON-matches: { slug: [doi, …] }. A reviewer who decides a
// proposal is wrong records it here (confirm-publication.mjs --reject) so the
// matcher stops re-proposing that (paper, doi) pair. Keyed on the pair, not
// the paper, so a genuinely better match can still surface later.
let rejects = {};
try { rejects = require("../data/publication-rejects.json"); } catch { /* none yet */ }
const isRejected = (slug, doi) => (rejects[slug] || []).includes(doi);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "publication-candidates.json");
const MAILTO = "site@eiss-europa.com"; // OpenAlex polite pool

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const optNum = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : d; };
const runOrcid = has("--all") || !has("--openalex");
const runOpenAlex = has("--all") || has("--openalex");
const since = optNum("--since", 0);
const until = optNum("--until", 0);
const limit = optNum("--limit", 0);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Similarity helpers ───────────────────────────────────────────────────
const STOP = new Set(["the", "a", "an", "of", "and", "or", "in", "on", "to", "for", "with", "as", "at", "by", "from", "is", "are"]);
const norm = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
function tokens(s) {
  return new Set(norm(s).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t)));
}
function dice(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return (2 * inter) / (A.size + B.size);
}
const HIGH = 0.8, REVIEW = 0.5;
const band = (s) => (s >= HIGH ? "high" : s >= REVIEW ? "review" : "discard");

// ── ORCID phase ────────────────────────────────────────────────────────────
const orcidIdOf = (url) => (String(url || "").match(/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/) || [])[1] || null;
async function fetchOrcidWorks(id) {
  const res = await fetch(`https://pub.orcid.org/v3.0/${id}/works`, {
    headers: { Accept: "application/json", "User-Agent": "eiss-europa.com publication-matcher" },
  });
  if (!res.ok) throw new Error(`ORCID ${id}: HTTP ${res.status}`);
  const data = await res.json();
  const out = [];
  for (const g of data.group || []) {
    const s = (g["work-summary"] || [])[0];
    const title = s?.title?.title?.value;
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
    if (doi) out.push({ title: title.trim(), year: /^\d{4}$/.test(yearRaw || "") ? Number(yearRaw) : null, doi, doiUrl, journal: s["journal-title"]?.value || null });
  }
  return out;
}

async function orcidPhase() {
  const found = [];
  for (const member of orcidMembers) {
    const id = orcidIdOf(member.orcid);
    if (!id) continue;
    const key = corpus.canonicalKey(member.name);
    const papers = (corpus.papers || []).filter((p) => !p.publishedUrl && (p.authors || []).some((a) => corpus.canonicalKey(a.name) === key));
    if (!papers.length) continue;
    let works;
    try { works = await fetchOrcidWorks(id); } catch (e) { console.error(`! ${member.name}: ${e.message}`); continue; }
    console.log(`ORCID ${member.name} — ${papers.length} paper(s), ${works.length} work(s) w/ DOI`);
    for (const p of papers) {
      let best = null;
      for (const w of works) {
        if (w.year && (w.year < p.year - 1 || w.year > p.year + 6)) continue;
        if (isRejected(p.slug, w.doi)) continue; // human-validated non-match
        const score = dice(p.title, w.title);
        if (!best || score > best.score) best = { w, score };
      }
      if (best && band(best.score) !== "discard") {
        found.push(candidate(p, "orcid", best.w.title, best.w.year, best.w.journal, best.w.doi, best.w.doiUrl, best.score, member.name));
      }
    }
  }
  return found;
}

// ── OpenAlex phase (author-anchored) ───────────────────────────────────────
// Searching by title misses retitled papers — the case we care about. Instead
// resolve each paper author to an OpenAlex author, pull THEIR works, and
// title-match our paper against them. Author-anchoring narrows the pool; the
// title-Dice bar then picks the right work and filters out any homonym's works
// that OpenAlex lumped under the same author entity. Resolutions + works are
// cached, so each distinct author costs two requests regardless of paper count.
const authorIdCache = new Map(); // canonicalKey -> { id, name } | null
const worksCache = new Map(); // openalex author id -> [{ title, year, doi, journal }]
const oaHeaders = { "User-Agent": `eiss-europa.com publication-matcher (${MAILTO})` };

async function resolveAuthor(name) {
  const ck = corpus.canonicalKey(name);
  if (authorIdCache.has(ck)) return authorIdCache.get(ck);
  let out = null;
  try {
    const r = await fetch(`https://api.openalex.org/authors?search=${encodeURIComponent(name)}&per-page=1&mailto=${MAILTO}`, { headers: oaHeaders });
    if (r.ok) {
      const a = ((await r.json()).results || [])[0];
      if (a) out = { id: String(a.id).split("/").pop(), name: a.display_name };
    }
  } catch { /* leave null */ }
  authorIdCache.set(ck, out);
  await sleep(110);
  return out;
}

async function authorWorks(id) {
  if (worksCache.has(id)) return worksCache.get(id);
  let works = [];
  try {
    const r = await fetch(`https://api.openalex.org/works?filter=author.id:${id},from_publication_date:2015-01-01,to_publication_date:2027-12-31&per-page=100&select=display_name,publication_year,doi,primary_location&mailto=${MAILTO}`, { headers: oaHeaders });
    if (r.ok) {
      works = ((await r.json()).results || [])
        .filter((w) => w.doi)
        .map((w) => ({
          title: w.display_name,
          year: w.publication_year,
          doi: String(w.doi).replace(/^https?:\/\/doi\.org\//i, ""),
          journal: w.primary_location?.source?.display_name || null,
        }));
    }
  } catch { /* leave empty */ }
  worksCache.set(id, works);
  await sleep(110);
  return works;
}

async function openAlexPhase() {
  let papers = (corpus.papers || []).filter((p) => !p.publishedUrl && p.slug && p.year >= since && (!until || p.year <= until));
  const seen = new Set();
  papers = papers.filter((p) => !seen.has(p.slug) && seen.add(p.slug));
  if (limit) papers = papers.slice(0, limit);
  console.log(`OpenAlex — ${papers.length} paper(s)${since ? ` since ${since}` : ""}${until ? ` until ${until}` : ""}${limit ? ` (limit ${limit})` : ""}`);

  const found = [];
  for (const p of papers) {
    const pool = [];
    for (const a of p.authors || []) {
      if (!a.name) continue;
      const author = await resolveAuthor(a.name);
      if (author) pool.push(...(await authorWorks(author.id)));
    }
    let best = null;
    for (const w of pool) {
      if (w.year && (w.year < p.year - 1 || w.year > p.year + 6)) continue; // publication-lag window
      if (isRejected(p.slug, w.doi)) continue; // human-validated non-match
      const score = dice(p.title, w.title);
      if (!best || score > best.score) best = { w, score };
    }
    if (best && band(best.score) !== "discard") {
      found.push(candidate(p, "openalex", best.w.title, best.w.year, best.w.journal, best.w.doi, `https://doi.org/${best.w.doi}`, best.score, null));
      console.log(`  ? [${band(best.score)}] "${p.title.slice(0, 44)}" → ${best.score.toFixed(2)} ${best.w.doi}`);
    }
  }
  return found;
}

function candidate(p, via, candTitle, candYear, journal, doi, url, score, member) {
  return {
    slug: p.slug,
    paperTitle: p.title,
    paperYear: p.year,
    conference: `${p.conferenceLabel} ${p.year}`,
    matchedVia: via,
    member: member || null,
    candidateTitle: candTitle,
    candidateYear: candYear || null,
    journal: journal || null,
    doi,
    publishedUrl: url,
    titleScore: Number(score.toFixed(3)),
    band: band(score),
    verified: false,
  };
}

// ── Run + merge into the review queue ──────────────────────────────────────
const fresh = [];
if (runOrcid) fresh.push(...(await orcidPhase()));
if (runOpenAlex) fresh.push(...(await openAlexPhase()));

// Keep prior candidates from phases we did NOT run this time.
const ranPhases = new Set([runOrcid && "orcid", runOpenAlex && "openalex"].filter(Boolean));
const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const kept = prior.filter((c) => !ranPhases.has(c.matchedVia));

// One entry per slug: prefer ORCID, then higher title score.
const bySlug = new Map();
for (const c of [...kept, ...fresh]) {
  const cur = bySlug.get(c.slug);
  if (!cur || (cur.matchedVia !== "orcid" && (c.matchedVia === "orcid" || c.titleScore > cur.titleScore))) {
    bySlug.set(c.slug, c);
  }
}
const candidates = [...bySlug.values()].sort((a, b) => b.titleScore - a.titleScore);
writeFileSync(OUT, JSON.stringify(candidates, null, 2) + "\n");
const high = candidates.filter((c) => c.band === "high").length;
console.log(`\n✓ ${candidates.length} candidate(s) in data/publication-candidates.json (${high} high, ${candidates.length - high} review). Confirm with scripts/confirm-publication.mjs.`);
