#!/usr/bin/env python3
"""Self-check for check_external() in scripts/check-links.sh (#1367).

Runs a throwaway HTTP server and drives the real function out of the shell
script's inline Python, so the behaviours that used to be handled by growing
SKIP_HOSTS are pinned:

    429            -> reported as alive, never counted as broken
    200            -> passes
    404            -> still broken (the fix must not swallow real failures)
    ENETUNREACH    -> retried once, then takes the second answer
    5xx that clears -> retried on a widening pause, then passes (#1423)
    TLS cut        -> retried, then reported unreachable rather than broken
    conn reset     -> same, one layer down (#1628)
    502/503/504    -> retried, then reported unreachable without failing
    other 5xx/DNS -> still broken
    hanging host   -> every attempt in TIMEOUT_SCHEDULE is made, then reported
                      as slow rather than broken (#1417)

No framework and no dependencies. Run it directly:

    python3 scripts/test-check-links.py
"""
import http.server, socketserver, threading, re, sys, urllib.error, urllib.request, ssl, socket, time, errno
import subprocess, tempfile
from pathlib import Path

# Extract check_external + its helpers from the shell script's inline python.
src = open('scripts/check-links.sh', encoding='utf-8').read()
inline = src.split('<<\'PY\'\n', 1)[1].rsplit('\nPY\n', 1)[0]
start = inline.index('# ---- External link checks ----')
end = inline.index('_ssl_warned = None')
ns = {'ssl': ssl, 'socket': socket, 'time': time, 'errno': errno, 'sys': sys,
      'urllib': urllib, 'SKIP_HOSTS': set(), 'SKIP_DOMAINS': set(), 'GET_HOSTS': set()}
import urllib.parse, urllib.request, urllib.error
exec(compile(inline[start:end], 'check-links-inline', 'exec'), ns)
check_external = ns['check_external']

CODE = {'/rate': 429, '/gone': 404, '/ok': 200}
class H(http.server.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(CODE.get(self.path, 500)); self.end_headers()
    do_GET = do_HEAD
    def log_message(self, *a): pass

srv = socketserver.TCPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{port}'

fails = []
u, st = check_external(f'{base}/rate')
print(f'  429 -> {st!r}'); fails += [] if st == 429 else ['429 should return 429 (treated as alive)']
u, st = check_external(f'{base}/ok')
print(f'  200 -> {st!r}'); fails += [] if st == 200 else ['200 should pass']
u, st = check_external(f'{base}/gone')
print(f'  404 -> {st!r}'); fails += [] if st == 'HTTP 404' else ['404 must still be broken']

# ENETUNREACH must be retried once, not returned on first sight.
calls = {'n': 0}
real = urllib.request.urlopen
def flaky(req, **kw):
    calls['n'] += 1
    if calls['n'] == 1:
        raise urllib.error.URLError(OSError(errno.ENETUNREACH, 'Network is unreachable'))
    return real(req, **kw)
urllib.request.urlopen = ns['urllib'].request.urlopen = flaky
u, st = check_external(f'{base}/ok')
urllib.request.urlopen = ns['urllib'].request.urlopen = real
print(f'  ENETUNREACH then 200 -> {st!r} after {calls["n"]} attempt(s)')
fails += [] if (st == 200 and calls['n'] == 2) else ['ENETUNREACH should be retried once and then succeed']

# A 5xx that clears must pass. A repeated 503 keeps its final HTTP status
# after three attempts, then the report treats it as unreachable (#2092).
# Shrink the pauses while preserving the retry schedule.
ns['SERVER_ERROR_PAUSES'] = (0.05, 0.05)
flap = {'n': 0}
class Flap(H):
    def do_HEAD(self):
        flap['n'] += 1
        # 503 twice, then answer: the softwareheritage.org shape.
        self.send_response(503 if flap['n'] < 3 else 200); self.end_headers()
    do_GET = do_HEAD
srv2 = socketserver.TCPServer(('127.0.0.1', 0), Flap); port2 = srv2.server_address[1]
threading.Thread(target=srv2.serve_forever, daemon=True).start()
u, st = check_external(f'http://127.0.0.1:{port2}/flap')
print(f'  503, 503, then 200 -> {st!r} after {flap["n"]} attempt(s)')
fails += [] if (st == 200 and flap['n'] == 3) else ['a 5xx that clears must pass after three attempts']

down = {'n': 0}
class Down(H):
    def do_HEAD(self):
        down['n'] += 1
        self.send_response(503); self.end_headers()
    do_GET = do_HEAD
srv3 = socketserver.TCPServer(('127.0.0.1', 0), Down); port3 = srv3.server_address[1]
threading.Thread(target=srv3.serve_forever, daemon=True).start()
u, st = check_external(f'http://127.0.0.1:{port3}/down')
print(f'  503 every time -> {st!r} after {down["n"]} attempt(s)')
fails += [] if (st == 'HTTP 503' and down['n'] == 3) else ['repeated 503 must preserve the final status after three attempts']

# Exercise the complete inline checker, including the result loop and exit
# status. Fake only network responses and sleeps, so retries still execute.
# No public hosts are contacted, including for the DNS failure.
def report_case(status, expected_exit, attempts, internal=False, quiet=False):
    prefix = f'''
import socket, time, urllib.error, urllib.request
def response(req, **kw):
    print("NETWORK_ATTEMPT", flush=True)
    if {status!r} == "dns":
        raise urllib.error.URLError(socket.gaierror(socket.EAI_NONAME, "Name or service not known"))
    raise urllib.error.HTTPError(req.full_url, {status!r}, "test response", {{}}, None)
urllib.request.urlopen = response
time.sleep = lambda seconds: None
'''
    with tempfile.TemporaryDirectory() as tmp:
        href = '/missing.html' if internal else 'https://checker.invalid/test'
        Path(tmp, 'index.html').write_text(f'<a href="{href}">test</a>', encoding='utf-8')
        result = subprocess.run(
            [sys.executable, '-c', prefix + inline, tmp, '0', str(int(quiet))],
            capture_output=True, text=True, timeout=10,
        )
    label = f'{status}, internal={internal}, quiet={quiet}'
    print(f'  report {label} -> exit {result.returncode}')
    errors = []
    if result.returncode != expected_exit or result.stdout.count('NETWORK_ATTEMPT') != attempts:
        errors.append(f'{label}: wrong exit status or retry count: {result.stdout} {result.stderr}')
    if expected_exit == 0:
        if f'HTTP {status}' not in result.stdout or 'unreachable from CI, not counted as broken' not in result.stdout or 'EXTERNAL BROKEN' in result.stdout:
            errors.append(f'{label}: final status must be visibly reported as unreachable')
    elif ('INTERNAL BROKEN' if internal else 'EXTERNAL BROKEN') not in result.stdout:
        errors.append(f'{label}: broken links must remain in the failure report')
    return errors

for status in (502, 503, 504):
    for quiet in (False, True):
        fails += report_case(status, 0, 3, quiet=quiet)
for status in (404, 410, 500, 501, 505, 'dns'):
    fails += report_case(status, 1, 3 if isinstance(status, int) and status >= 500 else 1)
fails += report_case(503, 1, 0, internal=True)

# A TLS connection cut mid-read must be retried and then reported as
# unreachable, not counted as broken (#1423). Simulated by raising the same
# URLError urllib produces, on every attempt.
import ssl as _ssl
calls = {'n': 0}
def tls_cut(req, **kw):
    calls['n'] += 1
    raise urllib.error.URLError(
        _ssl.SSLError(1, '[SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol'))
ns['TIMEOUT_PAUSES'] = (0.05, 0.05)
urllib.request.urlopen = ns['urllib'].request.urlopen = tls_cut
u, st = check_external(f'{base}/ok')
urllib.request.urlopen = ns['urllib'].request.urlopen = real
print(f'  TLS cut every time -> {st!r} after {calls["n"]} attempt(s)')
fails += [] if st == 'unreachable' else ['a cut TLS connection should report unreachable, not broken']

# The same event one layer down: the peer resets the connection instead of
# closing the TLS session, so urllib raises ConnectionResetError rather than an
# SSL error. It was not classified, so one flaky host could warn for its page
# and fail the build for a large PDF beside it in a single run (#1628).
resets = {'n': 0}
def conn_reset(req, **kw):
    resets['n'] += 1
    raise urllib.error.URLError(ConnectionResetError(104, 'Connection reset by peer'))
ns['TIMEOUT_PAUSES'] = (0.05, 0.05)
urllib.request.urlopen = ns['urllib'].request.urlopen = conn_reset
u, st = check_external(f'{base}/ok')
urllib.request.urlopen = ns['urllib'].request.urlopen = real
print(f'  connection reset every time -> {st!r} after {resets["n"]} attempt(s)')
fails += [] if st == 'unreachable' else ['a reset connection should report unreachable, not broken']

# A host that accepts the connection and never answers must exhaust the
# schedule and come back as the "timeout" sentinel, which the report prints as
# a slow host rather than counting as broken (#1417). The clock is shrunk here
# so the case runs in about a second; the shape is what is being pinned.
ns['TIMEOUT_SCHEDULE'], ns['TIMEOUT_PAUSES'] = (0.3, 0.3, 0.3), (0, 0)
hangs, connections = socket.socket(), []
hangs.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
hangs.bind(('127.0.0.1', 0))
hangs.listen(8)
def hang():
    while True:
        try:
            connections.append(hangs.accept()[0])   # connected, then no reply
        except OSError:
            return
threading.Thread(target=hang, daemon=True).start()
u, st = check_external(f'http://127.0.0.1:{hangs.getsockname()[1]}/hangs')
hangs.close()
print(f'  hanging host -> {st!r} after {len(connections)} attempt(s)')
fails += [] if (st == 'timeout' and len(connections) == 3) else \
    ['a hanging host should exhaust TIMEOUT_SCHEDULE and report "timeout", not broken']

srv.shutdown()
srv2.shutdown()
srv3.shutdown()
print('\nFAIL: ' + '; '.join(fails) if fails else '\nall link-check behaviours correct')
sys.exit(1 if fails else 0)
