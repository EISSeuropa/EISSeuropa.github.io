#!/usr/bin/env python3
"""
Publication matcher for ESSC papers (#805).

Searches ORCID works (already synced in orcidWorks.json) and OpenAlex for
confirmed published versions of ESSC conference papers. Emits
data/publication-candidates.json for human review. Never auto-writes to
src/_data/paperLinks.json — the maintainer reviews candidates and confirms
matches manually (or via a helper that prompts per-candidate and writes
the confirmed slug→doi to paperLinks.json).

Usage:
    python3 scripts/match-publications.py [options]

Options:
    --year YEAR      Only process papers from this year (e.g. --year 2024)
    --dry-run        Print candidates to stdout instead of writing the file
    --limit N        Cap the number of papers sent to OpenAlex (default 200)
    --mailto EMAIL   Polite-pool email for OpenAlex requests (default: reads
                     from site contactEmail if resolvable, else required)

Phases:
    1. ORCID: match each member-authored paper against the member's own
       ORCID works (orcidWorks.json). Near-zero false positives.
    2. OpenAlex: author-anchored search for papers not covered by Phase 1.
       Candidate scores combine title similarity and author overlap.

A candidate is NOT output if:
    - Its paper slug already appears in src/_data/paperLinks.json (already matched).
    - Title similarity is below the discard threshold (<50 token-set ratio).
    - No author name overlap (surname-set Jaccard = 0).

Output format (data/publication-candidates.json):
    [
      {
        "paperSlug": "2024-deterrence-and-coercion",
        "paperTitle": "Deterrence and Coercion in ...",
        "paperYear": 2024,
        "paperAuthors": ["Jane Smith", "Pieter van Houten"],
        "phase": "orcid" | "openalex",
        "confidence": "high" | "review" | "low",
        "candidate": {
          "title": "...",
          "doi": "https://doi.org/...",
          "url": "...",
          "year": 2025,
          "journal": "...",
          "authors": ["..."],
          "scores": { "titleSim": 0.87, "authorJaccard": 0.5 }
        }
      },
      ...
    ]
"""

import argparse
import difflib
import json
import os
import subprocess
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORCID_WORKS_PATH = os.path.join(REPO_ROOT, "src", "_data", "orcidWorks.json")
PAPER_LINKS_PATH = os.path.join(REPO_ROOT, "src", "_data", "paperLinks.json")
BOARD_PATH = os.path.join(REPO_ROOT, "src", "_data", "board.json")
OUTPUT_PATH = os.path.join(REPO_ROOT, "data", "publication-candidates.json")

OPENALEX_BASE = "https://api.openalex.org"
# Polite pool: requests with mailto get faster, more reliable service.
DEFAULT_MAILTO = "webmaster@eiss-europa.com"

# Score bands: titles + author overlap together decide the confidence label.
THRESHOLD_HIGH = 0.82   # title sim + both-side author overlap → auto-accept candidate
THRESHOLD_REVIEW = 0.55  # above this → present for review
THRESHOLD_DISCARD = 0.45  # below this → dropped silently

# OpenAlex publication window: conference year +/- this many years.
PUB_WINDOW = 4

# Sleep between OpenAlex requests to be polite.
REQUEST_DELAY = 0.5  # seconds


# ── Utilities ────────────────────────────────────────────────────────────


def norm_str(s):
    """Normalise: NFD → strip diacritics → lowercase → collapse whitespace."""
    s = unicodedata.normalize("NFD", str(s or ""))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return " ".join(s.lower().split())


def title_sim(a, b):
    """Difflib token-set ratio (0–1) between two normalised title strings."""
    na, nb = norm_str(a), norm_str(b)
    # Token-set ratio: sort + dedupe tokens, then compare.
    ta = " ".join(sorted(set(na.split())))
    tb = " ".join(sorted(set(nb.split())))
    return difflib.SequenceMatcher(None, ta, tb).ratio()


def surname_set(names):
    """Return a set of normalised last-name tokens from a list of full names."""
    result = set()
    for name in names:
        parts = norm_str(name).split()
        if parts:
            result.add(parts[-1])  # last token as surname approximation
    return result


def author_jaccard(a_names, b_names):
    """Surname-set Jaccard between two author-name lists."""
    sa, sb = surname_set(a_names), surname_set(b_names)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def confidence_label(title_s, author_j):
    """Map (title_sim, author_jaccard) to a confidence label."""
    combined = title_s * 0.6 + author_j * 0.4
    if combined >= THRESHOLD_HIGH and author_j > 0:
        return "high"
    if combined >= THRESHOLD_REVIEW:
        return "review"
    return "low"


# ── Corpus loading ───────────────────────────────────────────────────────


def load_corpus_papers():
    """Dump corpus.papers via Node.js and return as a list of dicts."""
    script = (
        "try {"
        "  const c = require('./src/_data/corpus.js');"
        "  console.log(JSON.stringify(c.papers));"
        "} catch(e) {"
        "  process.stderr.write(e.message + '\\n');"
        "  process.exit(1);"
        "}"
    )
    result = subprocess.run(
        ["node", "-e", script],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"corpus.js dump failed: {result.stderr.strip()}")
    return json.loads(result.stdout)


def load_paper_links():
    """Return the set of paper slugs already confirmed in paperLinks.json."""
    if not os.path.exists(PAPER_LINKS_PATH):
        return set()
    with open(PAPER_LINKS_PATH) as f:
        return set(json.load(f).keys())


def load_orcid_works():
    """Return {slug: [{title, year, journal, doi}]} from orcidWorks.json."""
    if not os.path.exists(ORCID_WORKS_PATH):
        return {}
    with open(ORCID_WORKS_PATH) as f:
        entries = json.load(f)
    result = {}
    for e in entries:
        slug = e.get("slug", "")
        if slug and e.get("works"):
            result[slug] = e["works"]
    return result


def load_member_name_to_slug():
    """
    Build a {canonical_name_key → orcid_slug} lookup from board.json +
    orcidWorks.json. Used to match a paper author to their ORCID slug when
    corpus.papers doesn't carry a profileUrl (pre-PR #828 corpora).
    """
    # Prefer the orcidWorks.json name field (already canonical) keyed to slug.
    mapping = {}
    if os.path.exists(ORCID_WORKS_PATH):
        with open(ORCID_WORKS_PATH) as f:
            for e in json.load(f):
                slug = e.get("slug", "")
                name = e.get("name", "")
                if slug and name:
                    mapping[norm_str(name)] = slug
                    # Also store surname-only key for looser matching below.
                    parts = norm_str(name).split()
                    if parts:
                        mapping[parts[-1]] = slug  # surname fallback (overwritten by later if clash)
    return mapping


def derive_slug(paper):
    """
    Return paper['slug'] if present (post-PR #828 corpus), otherwise derive
    one from year + title to use as a stable key within one run.
    """
    if paper.get("slug"):
        return paper["slug"]
    year = paper.get("year") or "0"
    title = norm_str(paper.get("title", "unknown"))
    slug_body = "-".join(title.split()[:10]).replace("'", "").replace(",", "").replace(":", "")
    return f"{year}-{slug_body}"


# ── ORCID phase ──────────────────────────────────────────────────────────


def orcid_match(paper, orcid_works_by_slug, name_to_slug):
    """
    Match a paper against its authors' ORCID work lists.

    Returns a list of candidate dicts (may be empty).
    For each author that maps to an ORCID slug (via profileUrl if present,
    else via the name-to-slug lookup built from orcidWorks.json), compare
    every ORCID work within the publication window against the paper title.
    """
    candidates = []
    year = paper.get("year") or 0
    paper_title = paper.get("title", "")
    paper_authors = [a["name"] for a in (paper.get("authors") or []) if a.get("name")]

    for author in paper.get("authors") or []:
        # Prefer profileUrl (post-PR #828 corpus); fall back to name lookup.
        profile_url = author.get("profileUrl") or ""
        if "/board/" in profile_url:
            member_slug = profile_url.split("/board/")[-1].replace(".html", "")
        else:
            # Try exact canonical name, then surname-only.
            aname = author.get("name", "")
            member_slug = (
                name_to_slug.get(norm_str(aname))
                or name_to_slug.get(norm_str(aname).split()[-1] if aname else "")
            )
        if not member_slug:
            continue

        works = orcid_works_by_slug.get(member_slug, [])
        for work in works:
            work_year = work.get("year") or 0
            if work_year and (work_year < year - 1 or work_year > year + PUB_WINDOW):
                continue
            ts = title_sim(paper_title, work.get("title", ""))
            if ts < THRESHOLD_DISCARD:
                continue
            doi = work.get("doi") or ""
            url = doi if doi.startswith("http") else (f"https://doi.org/{doi}" if doi else "")
            candidates.append({
                "title": work.get("title", ""),
                "doi": doi,
                "url": url,
                "year": work_year,
                "journal": work.get("journal") or "",
                "authors": [author.get("name", "")],
                "scores": {
                    "titleSim": round(ts, 3),
                    "authorJaccard": 1.0,  # exact member match
                },
            })

    return candidates


# ── OpenAlex phase ───────────────────────────────────────────────────────


def openalex_search(paper, mailto):
    """
    Query OpenAlex for published versions of a conference paper.

    Strategy: build a title-keyword query + author name + year window.
    OpenAlex returns works; we score each by title sim + author Jaccard.
    """
    year = paper.get("year") or 0
    paper_title = paper.get("title", "")
    paper_authors = [a["name"] for a in (paper.get("authors") or []) if a.get("name")]
    if not paper_title or not year:
        return []

    # Use first 6 words of title to avoid over-constraining the search.
    title_words = " ".join(norm_str(paper_title).split()[:6])
    # Primary author surname for anchoring.
    first_author = ""
    if paper_authors:
        parts = norm_str(paper_authors[0]).split()
        first_author = parts[-1] if parts else ""

    year_lo, year_hi = year - 1, year + PUB_WINDOW

    filters = [
        f"publication_year:{year_lo}-{year_hi}",
        f"title.search:{urllib.parse.quote(title_words)}",
    ]
    if first_author:
        filters.append(f"author.display_name.search:{urllib.parse.quote(first_author)}")

    params = {
        "filter": ",".join(filters),
        "select": "id,doi,title,publication_year,primary_location,authorships",
        "per-page": "10",
        "mailto": mailto,
    }
    url = f"{OPENALEX_BASE}/works?" + "&".join(f"{k}={v}" for k, v in params.items())

    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read())
    except Exception as exc:
        print(f"  [warn] OpenAlex request failed for '{paper_title[:60]}': {exc}", file=sys.stderr)
        return []

    results = data.get("results", [])
    candidates = []
    for work in results:
        work_title = (work.get("title") or "").strip()
        ts = title_sim(paper_title, work_title)
        if ts < THRESHOLD_DISCARD:
            continue
        work_authors = [
            a.get("author", {}).get("display_name", "")
            for a in (work.get("authorships") or [])
        ]
        aj = author_jaccard(paper_authors, work_authors)
        if aj == 0 and paper_authors:
            continue  # require at least one shared surname
        doi_raw = work.get("doi") or ""
        doi_url = doi_raw if doi_raw.startswith("http") else (f"https://doi.org/{doi_raw}" if doi_raw else "")
        source = (work.get("primary_location") or {}).get("source") or {}
        journal = source.get("display_name") or ""
        candidates.append({
            "title": work_title,
            "doi": doi_raw,
            "url": doi_url or f"https://openalex.org/{work.get('id','').split('/')[-1]}",
            "year": work.get("publication_year"),
            "journal": journal,
            "authors": work_authors,
            "scores": {
                "titleSim": round(ts, 3),
                "authorJaccard": round(aj, 3),
            },
        })

    return candidates


# ── Main ─────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--year", type=int, help="Process only this conference year")
    parser.add_argument("--dry-run", action="store_true", help="Print to stdout, do not write file")
    parser.add_argument("--limit", type=int, default=200, help="Max papers to send to OpenAlex")
    parser.add_argument("--mailto", default=DEFAULT_MAILTO, help="Polite-pool email for OpenAlex")
    args = parser.parse_args()

    print("Loading corpus …", file=sys.stderr)
    papers = load_corpus_papers()
    already_matched = load_paper_links()
    orcid_works = load_orcid_works()
    name_to_slug = load_member_name_to_slug()

    if args.year:
        papers = [p for p in papers if p.get("year") == args.year]
        print(f"Filtered to {len(papers)} papers from {args.year}.", file=sys.stderr)

    # Assign a stable slug to every paper (uses corpus slug if available,
    # derives one from year+title otherwise for pre-#828 corpora).
    for p in papers:
        p["_slug"] = derive_slug(p)

    # Skip papers already confirmed in paperLinks.json.
    unmatched = [p for p in papers if p["_slug"] not in already_matched]
    print(f"  {len(papers)} total, {len(already_matched)} already matched, "
          f"{len(unmatched)} to process.", file=sys.stderr)

    output = []
    openalex_count = 0

    for paper in unmatched:
        slug = paper["_slug"]
        title = paper.get("title", "")
        year = paper.get("year")
        authors_raw = paper.get("authors") or []
        author_names = [a["name"] for a in authors_raw if a.get("name")]

        # Phase 1 — ORCID (members only, highest precision).
        orcid_candidates = orcid_match(paper, orcid_works, name_to_slug)
        for c in orcid_candidates:
            conf = confidence_label(c["scores"]["titleSim"], c["scores"]["authorJaccard"])
            if conf == "low":
                continue
            output.append({
                "paperSlug": slug,
                "paperTitle": title,
                "paperYear": year,
                "paperAuthors": author_names,
                "phase": "orcid",
                "confidence": conf,
                "candidate": c,
            })

        # Phase 2 — OpenAlex (all papers, rate-limited).
        if openalex_count < args.limit:
            time.sleep(REQUEST_DELAY)
            oa_candidates = openalex_search(paper, args.mailto)
            openalex_count += 1
            for c in oa_candidates:
                conf = confidence_label(c["scores"]["titleSim"], c["scores"]["authorJaccard"])
                if conf == "low":
                    continue
                # De-duplicate against ORCID candidates by DOI.
                already_doi = {r["candidate"].get("doi") for r in output if r["paperSlug"] == slug}
                if c.get("doi") and c["doi"] in already_doi:
                    continue
                output.append({
                    "paperSlug": slug,
                    "paperTitle": title,
                    "paperYear": year,
                    "paperAuthors": author_names,
                    "phase": "openalex",
                    "confidence": conf,
                    "candidate": c,
                })

    # Sort: high confidence first, then by year descending, then title.
    order = {"high": 0, "review": 1, "low": 2}
    output.sort(key=lambda r: (order.get(r["confidence"], 9), -(r["paperYear"] or 0), r["paperTitle"]))

    summary = {
        "total": len(output),
        "high": sum(1 for r in output if r["confidence"] == "high"),
        "review": sum(1 for r in output if r["confidence"] == "review"),
    }
    print(f"\nCandidates found: {summary['total']} "
          f"({summary['high']} high, {summary['review']} review).", file=sys.stderr)

    result_json = json.dumps(output, indent=2, ensure_ascii=False)

    if args.dry_run:
        print(result_json)
    else:
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w") as f:
            f.write(result_json + "\n")
        print(f"Written to {OUTPUT_PATH}", file=sys.stderr)
        print("\nNext steps:", file=sys.stderr)
        print("  1. Review the candidates file — check title/DOI/journal for each.", file=sys.stderr)
        print("  2. For confirmed matches, add an entry to src/_data/paperLinks.json:", file=sys.stderr)
        print("       \"<slug>\": { \"doi\": \"...\", \"publishedUrl\": \"...\", \"publishedTitle\": \"...\", \"journal\": \"...\", \"publishedYear\": ... }", file=sys.stderr)
        print("  3. Re-run to update the candidate list (confirmed slugs are skipped).", file=sys.stderr)


if __name__ == "__main__":
    main()
