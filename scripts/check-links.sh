#!/usr/bin/env bash
# scripts/check-links.sh: broken-link checker for EISS.
#
# Walks every *.html under `_site/` (the Eleventy build output),
# collects:
#   - every internal <a href="…"> target (relative paths)
#   - every external <a href="http(s)://…"> target
# …and verifies each resolves. Internal checks are file-system based
# (does the target file + #fragment exist?). External checks are
# HEAD requests with a fallback to GET for hosts that refuse HEAD.
#
# Usage:
#   ./scripts/check-links.sh                # full check, prints summary
#   ./scripts/check-links.sh --internal     # internal links only (fast)
#   ./scripts/check-links.sh --quiet        # only print failures
#
# Requires the site to be built first (`npm run build` produces
# `_site/`). The script exits 2 with a clear error if `_site/` is
# missing. Exits 1 if any link is broken. Exits 0 on success.
# Safe to run in CI.
#
# Adapted from the sister repo EISSeuropa/netsec.github.io's
# scripts/check-links.sh. Two material adaptations for EISS context:
#   - NetSec walks `repo_root/*.html` (hand-authored static site);
#     EISS is Eleventy-built, so we walk `_site/**/*.html` instead.
#   - NetSec validates `people.html#<slug>` against `data/bios.json`
#     (the directory is JS-rendered at runtime so static id= checks
#     would miss); EISS pre-renders board slugs as id= attributes via
#     `src/_includes/person-card.njk`, so a plain id= check suffices.
#     The bio-slug cache layer is dropped.
#
# No dependencies beyond Python 3 (uses urllib).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$HERE/.." && pwd)"
cd "$REPO_ROOT"

SITE_ROOT="$REPO_ROOT/_site"
if [ ! -d "$SITE_ROOT" ]; then
  echo "error: _site/ not found at $SITE_ROOT" >&2
  echo "       run \`npm run build\` first, then re-run this script." >&2
  exit 2
fi

INTERNAL_ONLY=0
QUIET=0
for arg in "$@"; do
  case "$arg" in
    --internal) INTERNAL_ONLY=1 ;;
    --quiet) QUIET=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# Resolve a python3 that actually runs. On some macOS setups the first
# python3 on PATH is an x86 framework build that aborts with "Bad CPU
# type in executable" on Apple silicon, so test each candidate before
# committing to it rather than trusting `command -v`.
PY3=""
for _cand in python3 /usr/bin/python3 /opt/homebrew/bin/python3 python; do
  if command -v "$_cand" >/dev/null 2>&1 && "$_cand" -c '' >/dev/null 2>&1; then
    PY3="$_cand"; break
  fi
done
if [ -z "$PY3" ]; then
  echo "error: no working python3 found (tried python3, /usr/bin/python3, /opt/homebrew/bin/python3, python)." >&2
  echo "       install python3 or fix the broken interpreter on PATH, then re-run." >&2
  exit 2
fi

"$PY3" - "$SITE_ROOT" $INTERNAL_ONLY $QUIET <<'PY'
"""Inline-Python link checker. Avoids extra deps; portable across
the maintainer's macOS laptop and Ubuntu CI."""
import os, re, sys, urllib.parse, urllib.request, urllib.error, ssl
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

site_root = Path(sys.argv[1])
internal_only = sys.argv[2] == "1"
quiet = sys.argv[3] == "1"

# Collect every <a href="…">. The regex matches single OR double
# quotes and ignores attribute order. Permissive by design; the
# Eleventy build output is fairly uniform but we're not parsing
# strict HTML.
HREF_RE = re.compile(r'<a\s+[^>]*?\bhref\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)

# Hosts that refuse HEAD and need GET instead. Add to this list when
# we see a 405 or 403 from a known-good URL.
GET_HOSTS = {
    "docs.google.com", "forms.google.com",
}

# Hosts we deliberately skip. Three categories collapse here. (a)
# Auth-gated services that require login (the form/page works for
# real visitors but returns 4xx to anonymous HEAD/GET). (b) Anti-bot
# filters that block automated requests regardless of method, the
# destination still works fine for human visitors. (c) Hosts that the
# GitHub Actions runners cannot reach on a persistent network route
# (the URL is valid and resolves for visitors; CI just can't connect).
SKIP_HOSTS = {
    "docs.google.com",          # Google Forms require user auth. The
                                # form works for real visitors but
                                # returns 401 to unauthenticated HEAD
                                # /GET from this checker.
    "indico.eiss-europa.com",   # Indico HEADs return 400, works for
                                # visitors. Real-URL health is
                                # confirmed manually.
    "twitter.com",              # X/Twitter 403s unauthenticated bots
                                # (same class as LinkedIn). The EISS
                                # profile link in the footer resolves
                                # fine for visitors.
    "shs.cairn.info",           # Cairn (academic publisher hosting
                                # the Champs de Mars article in /
                                # initiative) returns 403 to anonymous
                                # HEAD/GET. Article reads fine in a
                                # browser.
    "doi.org",                  # DOI resolver for the member-publication
                                # links on /outputs (and the board cards),
                                # sourced from ORCID. It 302-redirects to
                                # the publisher, which then 403s the bot
                                # (West European Politics, JCMS, Cairn and
                                # the like, same anti-bot class as the
                                # academic hosts here). The DOIs are
                                # machine-sourced and resolve fine in a
                                # browser. Skipping covers every current
                                # and future synced DOI without a per-link
                                # allowlist.
    "www.berlin-airport.de",    # Anti-bot UA filter, returns 403 to
                                # unrecognised User-Agent strings.
                                # The transit-info page works for
                                # visitors heading to ESSC 2022.
    "eur-lex.europa.eu",        # EU's official law portal returns 403
                                # to automated HEAD/GET regardless of
                                # UA. The GDPR citation in the privacy
                                # notice (all three locales) opens fine
                                # in a browser.
    "www.su.se",                # Stockholm University (the ESSC 2026
                                # venue, linked from /2026). Persistently
                                # "Network is unreachable" from GitHub's
                                # runners — a CI-side routing/firewall
                                # issue, not a 4xx; the URL is valid and
                                # loads for visitors. Skipping trades away
                                # CI verification of this one link to stop
                                # the recurring false-red; re-check the
                                # link by hand if the venue URL changes.
    "europeangovernanceandpolitics.eui.eu",
                                # EUI's European Governance and Politics
                                # programme (the Global Risks report,
                                # linked from /GlobalRisks). Repeatedly
                                # times out from GitHub's runners (same
                                # CI-side reachability class as su.se, a
                                # timeout not a 4xx). Loads for visitors;
                                # skipping stops the recurring false-red.
    "stockholmuniversity.zoom.us",
                                # The ESSC 2026 livestream (Zoom webinar,
                                # linked from /2026 while the conference
                                # is live). Zoom join links 403 anonymous
                                # bots (anti-bot, same class as Twitter);
                                # the link opens the webinar fine for
                                # visitors. The link auto-hides once the
                                # edition is past, so this skip is moot
                                # after the conference.
    "gess.ethz.ch",             # ETH Zürich's GESS department person page
                                # (a board member's profile, linked from
                                # the board cards). Intermittently 503s
                                # under automated load: returns 200 from a
                                # browser and on a manual re-probe, but
                                # flaked a PR's link-check with a transient
                                # 503. Same intermittent-5xx class as the
                                # academic hosts above; skipping stops the
                                # recurring false-red.
    "www.cnil.fr",              # France's data-protection regulator (CNIL),
                                # cited from the privacy notice (`/policy` +
                                # FR/DE). Returns HTTP 503 to the checker
                                # under automated load while loading fine for
                                # visitors — same intermittent-5xx class as
                                # gess.ethz.ch. Flaked the link-check on
                                # PR #814; skipping stops the recurring
                                # false-red on every src-touching PR.
}

# Domains skipped together with ALL their subdomains. SKIP_HOSTS matches an
# exact hostname, which misses country subdomains. LinkedIn serves member
# profiles on www. and on country hosts (tr., fr., de., …, sourced from board
# submissions); every one returns HTTP 999 to automated requests regardless of
# UA but opens fine for any logged-out visitor. Skipping the whole domain
# covers present and future board members without a per-subdomain allowlist.
SKIP_DOMAINS = {
    "linkedin.com",
}

internal_links = {}  # (file, target) for de-dupe display
external_links = {}  # url -> first-seen source file
broken_internal = []
broken_external = []

html_files = sorted(p for p in site_root.rglob("*.html") if p.is_file())
print(f"→ scanning {len(html_files)} HTML files under {site_root.name}/...")

for f in html_files:
    rel = f.relative_to(site_root)
    text = f.read_text(encoding="utf-8", errors="replace")
    for m in HREF_RE.finditer(text):
        href = m.group(1).strip()
        # Schemes the checker has nothing useful to say about:
        #   mailto: + tel:     no URL to fetch
        #   javascript:        not a navigation target
        #   webcal:            calendar subscribe, OS-handled
        #   #anchor            pure same-page fragment, browser-handled
        if not href or href.startswith((
                "mailto:", "tel:", "javascript:", "webcal:", "#")):
            continue
        if href.startswith(("http://", "https://")):
            external_links.setdefault(href, str(rel))
        else:
            # Strip query/fragment for FS check; remember fragment
            url, _, frag = href.partition("#")
            if url.startswith(("//", "data:")):
                continue
            internal_links[(str(rel), href)] = (url, frag, str(rel))

# ---- Internal link resolution ----
print(f"  internal targets: {len(internal_links)}")
for (src, href), (url, frag, src_rel) in internal_links.items():
    if not url:
        # purely #fragment, must exist on the same page
        target_path = site_root / src_rel
    else:
        # Strip query, then resolve.
        url_no_q = url.split("?")[0]
        if url_no_q.startswith("/"):
            # Repo-root absolute (GitHub Pages serves `_site/` as root).
            # Drop the leading slash and join with site_root.
            target_path = (site_root / url_no_q.lstrip("/")).resolve()
        else:
            # Relative to the source file's directory.
            target_path = (site_root / src_rel).parent / url_no_q
            target_path = target_path.resolve()
        # GitHub Pages serves `/foo/` as `/foo/index.html`. Mirror that
        # so links like `/2026/` resolve when only `/2026/index.html`
        # exists on disk.
        if target_path.is_dir():
            index = target_path / "index.html"
            if index.exists():
                target_path = index
    if not target_path.exists():
        broken_internal.append(f"  ✗ {src} → {href}  (file not found: {target_path})")
        continue
    # If there's a fragment, see if any element has id="frag" or name="frag".
    if frag and target_path.suffix.lower() == ".html":
        body = target_path.read_text(encoding="utf-8", errors="replace")
        ok = re.search(
            rf'\b(?:id|name)\s*=\s*["\']{re.escape(frag)}["\']',
            body,
        )
        if not ok:
            broken_internal.append(
                f"  ✗ {src} → {href}  (anchor #{frag} not found in {target_path.name})"
            )

# ---- External link checks ----
def _make_ssl_ctx(verify=True):
    """Build an SSL context. Default uses the system CA store; the
    caller can retry with verify=False on macOS-empty-trust-store
    failures. We're checking link health, not authenticating the
    server."""
    if not verify:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return ssl.create_default_context()


def check_external(url):
    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""
    if host in SKIP_HOSTS or any(host == d or host.endswith("." + d) for d in SKIP_DOMAINS):
        return (url, "skip")
    method = "GET" if parsed.hostname in GET_HOSTS else "HEAD"
    headers = {
        "User-Agent": "Mozilla/5.0 (EISS link checker; +https://eiss-europa.com)",
        "Accept": "*/*",
    }

    def _do(method, ctx):
        req = urllib.request.Request(url, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            return resp.status

    try:
        return (url, _do(method, _make_ssl_ctx(verify=True)))
    except urllib.error.HTTPError as e:
        # 4xx + 5xx are errors; 3xx is followed by urllib by default.
        # Some hosts 403/405 on HEAD but 200 on GET, so retry with GET.
        if method == "HEAD" and e.code in (403, 405) and parsed.hostname not in GET_HOSTS:
            try:
                return (url, _do("GET", _make_ssl_ctx(verify=True)))
            except Exception as e2:
                return (url, f"err: {e2}")
        return (url, f"HTTP {e.code}")
    except urllib.error.URLError as e:
        # On macOS the default Python install often ships with an
        # empty trust store, so every https:// fetch trips
        # CERTIFICATE_VERIFY_FAILED. CI (Linux) doesn't have this
        # problem. Retry once with verification off; we're not trying
        # to authenticate the server, only see if the URL responds.
        if "CERTIFICATE_VERIFY_FAILED" in str(e):
            global _ssl_warned
            try:
                _ssl_warned
            except NameError:
                _ssl_warned = True
                print(
                    "  ⚠ local Python trust store rejected the server cert "
                    "(common on macOS); retrying with verification off. "
                    "Install certificates with /Applications/Python\\ 3.*/"
                    "Install\\ Certificates.command to fix this.",
                    file=sys.stderr,
                )
            try:
                return (url, _do(method, _make_ssl_ctx(verify=False)))
            except Exception as e2:
                return (url, f"err: {e2.__class__.__name__}: {e2}")
        return (url, f"err: {e.__class__.__name__}: {e}")
    except Exception as e:
        return (url, f"err: {e.__class__.__name__}: {e}")


_ssl_warned = None  # forward declaration; first SSL failure flips it

if not internal_only and external_links:
    print(f"  external targets: {len(external_links)}")
    # Concurrency set to 3 (not higher) because GitHub rate-limits
    # unauthenticated HEAD requests from a single IP and starts
    # timing out / RST'ing when we burst. 3 parallel requests at 15 s
    # timeout means a worst-case wall time of (N / 3) × 15 s, which
    # for ~70 external links is ~6 minutes. Acceptable for a CI run.
    with ThreadPoolExecutor(max_workers=3) as ex:
        futures = {ex.submit(check_external, url): url for url in external_links}
        for fut in as_completed(futures):
            url, status = fut.result()
            if status == "skip":
                if not quiet:
                    print(f"  - {url}  (skipped: auth-gated)")
            elif isinstance(status, int) and 200 <= status < 400:
                if not quiet:
                    print(f"  ✓ {url}  ({status})")
            else:
                broken_external.append(
                    f"  ✗ {external_links[url]} → {url}  ({status})"
                )

# ---- Summary ----
print()
if broken_internal:
    print(f"INTERNAL BROKEN ({len(broken_internal)}):")
    for line in broken_internal:
        print(line)
if broken_external:
    print(f"EXTERNAL BROKEN ({len(broken_external)}):")
    for line in broken_external:
        print(line)
if not broken_internal and not broken_external:
    print(f"✓ All links resolved ({len(internal_links)} internal, "
          f"{len(external_links) if not internal_only else 0} external).")
    sys.exit(0)
sys.exit(1)
PY
