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
import errno, os, re, socket, sys, time, urllib.parse, urllib.request, urllib.error, ssl
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
    "www.tandfonline.com",      # Taylor & Francis, the publisher hosting the
                                # Journal of Strategic Studies (linked from the
                                # /prizes co-branding, since EISS awards the
                                # prize with the journal). Returns 403 to
                                # anonymous HEAD/GET, same academic-publisher
                                # anti-bot class as doi.org / shs.cairn.info.
                                # The journal page opens fine in a browser.
}

# Board members' personal sites used to accumulate here, one entry per member,
# whenever small hosting rate-limited the runner. www.hugomeijer.com (PR #1007)
# and www.sanneverschuren.com (PR #1365) are both gone now: a 429 is handled in
# check_external() as the "alive" answer it is, so the skip is no longer needed
# and their links are checked again like everyone else (#1367).

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


# A timeout is not an answer, so it earns more patience than a 5xx before the
# checker calls a link broken. Three attempts on a widening clock, with a
# widening pause between them.
#
# hal.science is what forced this (#1417). It carries the Anthology's
# corpus-description note, is cited from /licensing, the cite panel and
# site.corpus, and answers in about half a second from a laptop, but it timed
# out twice in a row from GitHub's runners and took two unrelated PRs red. One
# retry at the same 15s clock was not enough, and the alternative on offer was
# SKIP_HOSTS, which trades a false red for a permanent blind spot on a link we
# very much want checked.
TIMEOUT_SCHEDULE = (15, 30, 45)  # client timeout, seconds, per attempt
TIMEOUT_PAUSES = (3, 10)         # pause before attempts 2 and 3
# Pauses before the second and third attempt at a host answering 5xx. Longer
# than the timeout pauses because a 5xx answers immediately: the wall cost of
# waiting is the pause itself, and the wobbles seen in practice have lasted
# minutes rather than seconds.
SERVER_ERROR_PAUSES = (3, 12)


def check_external(url, _retry=True, _attempt=1):
    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""
    if host in SKIP_HOSTS or any(host == d or host.endswith("." + d) for d in SKIP_DOMAINS):
        return (url, "skip")
    method = "GET" if parsed.hostname in GET_HOSTS else "HEAD"
    headers = {
        "User-Agent": "Mozilla/5.0 (EISS link checker; +https://eiss-europa.com)",
        "Accept": "*/*",
    }

    timeout = TIMEOUT_SCHEDULE[min(_attempt, len(TIMEOUT_SCHEDULE)) - 1]

    def _do(method, ctx):
        req = urllib.request.Request(url, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.status

    def _again(verdict="timeout"):
        """Next attempt on the widening clock, or the verdict once patience
        runs out. `verdict` distinguishes a host that never answered from one
        that cut the connection, so the report can say which happened."""
        if _attempt < len(TIMEOUT_SCHEDULE):
            time.sleep(TIMEOUT_PAUSES[_attempt - 1])
            return check_external(url, _retry=_retry, _attempt=_attempt + 1)
        return (url, verdict)

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
        # A 5xx is the server faltering, not the link being wrong. Academic
        # and institutional hosts routinely 503 under automated load while
        # serving visitors perfectly well, and with no retry a single blip
        # turns into a hard CI red on an unrelated PR. That is how the
        # SKIP_HOSTS list above accumulated gess.ethz.ch and www.cnil.fr:
        # neither is broken, both just flaked once.
        #
        # One retry after three seconds was not enough. On 21 August 2026
        # softwareheritage.org 503'd twice in a row here and failed an
        # unrelated pull request, then answered normally on a re-run of the
        # same commit minutes later: a wobble measured in minutes, not in
        # seconds. So a 5xx now gets the same shape of patience a timeout got
        # in #1417, three attempts on a widening pause. A genuine outage still
        # fails, because all three attempts have to 5xx, which is what
        # separates this from the 429 and timeout cases below: those report
        # the host as alive, this one still counts as broken.
        if 500 <= e.code < 600 and _attempt < len(SERVER_ERROR_PAUSES) + 1:
            time.sleep(SERVER_ERROR_PAUSES[_attempt - 1])
            return check_external(url, _retry=_retry, _attempt=_attempt + 1)
        # 429 is the server saying "you are asking too often", which is
        # affirmative evidence that the host is up and answering. It is never
        # a broken link, and treating it as one is what grew the SKIP_HOSTS
        # list a board member at a time (#1367). Reported, not silent, so a
        # host that rate-limits every run is still visible.
        if e.code == 429:
            return (url, 429)
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
        # A TLS connection cut mid-handshake or mid-read is the same class of
        # event as a timeout: the runner could not complete a conversation
        # with the host, which says nothing about whether the link is right.
        # europeangovernanceandpolitics.eui.eu does this from GitHub's runners
        # intermittently (the scheduled run on master passed the same morning
        # a pull request went red on it) while answering in half a second from
        # a laptop. It was on the skip list for the same underlying reason
        # until #1423 took it off, and a skip is a permanent blind spot, so it
        # gets patience and a warning instead of a skip or a red build.
        if "UNEXPECTED_EOF_WHILE_READING" in str(e) or "SSLEOFError" in e.__class__.__name__:
            return _again("unreachable")
        # A connect timeout arrives wrapped in URLError; a read timeout does
        # not (see the TimeoutError branch below). Both go to the schedule.
        # Matched on the message as well as the type: urllib does not promise
        # the reason is a TimeoutError instance, and a reason that stringifies
        # to "timed out" is a timeout whatever its class.
        reason = getattr(e, "reason", None)
        if isinstance(reason, (TimeoutError, socket.timeout)) or "timed out" in str(reason).lower():
            return _again()
        # "Network is unreachable" (errno 101) is the runner's own networking
        # hiccuping, not the destination being wrong. Seen once mid-run on
        # PR #1365 against a host that answered on the retry. Same treatment
        # as a 5xx: try again and take the second answer.
        if _retry and isinstance(getattr(e, "reason", None), OSError) \
                and getattr(e.reason, "errno", None) == errno.ENETUNREACH:
            time.sleep(3)
            return check_external(url, _retry=False)
        return (url, f"err: {e.__class__.__name__}: {e}")
    except (TimeoutError, socket.timeout):
        # A timeout is the same class of flake as a 5xx: the host is reachable,
        # it just did not answer inside 15s under a burst. #1282 added the 5xx
        # retry and stopped there, so a timeout still failed a PR outright —
        # which is what took #1291 red on hal.science, a link with nothing to
        # do with that PR.
        #
        # This needs its own branch: urlopen raises a bare socket.timeout on a
        # read timeout rather than wrapping it in URLError, so it lands in the
        # generic handler below. Verified against a server that hangs past the
        # client timeout — without this branch, no retry fires at all.
        return _again()
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
            elif status == 429:
                # Not broken: the host answered, it just wants fewer requests.
                print(f"  ⚠ {url}  (429 rate-limited — host is up, not counted as broken)")
            elif status == "timeout":
                # Not broken either, on the same reasoning as the skip list it
                # replaces: a host that will not answer inside 45s under a
                # burst is slow, and calling that a broken link fails unrelated
                # PRs. Printed unconditionally so a host that does this every
                # run stays visible rather than quietly excused (#1417).
                print(
                    f"  ⚠ {url}  (timed out on {len(TIMEOUT_SCHEDULE)} attempts, "
                    f"last at {TIMEOUT_SCHEDULE[-1]}s — slow host, not counted as broken)"
                )
            elif status == "unreachable":
                # The runner could not hold a TLS connection open long enough
                # to get an answer. Same treatment as a timeout, and printed
                # unconditionally for the same reason: a host that does this
                # every run should be visible, not quietly excused (#1423).
                print(
                    f"  ⚠ {url}  (connection cut on {len(TIMEOUT_SCHEDULE)} attempts — "
                    f"unreachable from CI, not counted as broken)"
                )
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
