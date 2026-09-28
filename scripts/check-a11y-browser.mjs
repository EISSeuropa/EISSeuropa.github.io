#!/usr/bin/env node
/* Browser accessibility pass (#1626).
 *
 * scripts/a11y_lint.py and axe under jsdom both read the built HTML, so they
 * cannot see anything that needs layout, computed colour, a real viewport or
 * scripting: the phantom tab stop on every page, the accent contrast on tinted
 * cards and the pages that scrolled sideways at 375px all shipped past them.
 * This runs axe-core in headless Chrome over the built _site/, at a phone and
 * a desktop width, in light and dark, and fails only on violations that are
 * not in the checked-in baseline.
 *
 * No client library: Node 22+ ships WebSocket, which speaks the Chrome
 * DevTools Protocol directly. Chrome's --window-size has a 500px floor, so the
 * viewport is set over CDP (Emulation.setDeviceMetricsOverride).
 *
 * Usage (after `npm run build`):
 *   node scripts/check-a11y-browser.mjs                    check against baseline
 *   node scripts/check-a11y-browser.mjs --update-baseline  accept the current state
 *   node scripts/check-a11y-browser.mjs --pages /,/board.html
 * Chrome: $CHROME_PATH, else google-chrome / chromium on PATH, else the macOS
 * app, else the newest Puppeteer-cached chrome-headless-shell.
 *
 * The baseline counts violations per page, configuration and rule rather than
 * listing selectors, so a markup change that renumbers an nth-child does not
 * read as a new failure. A count that goes up, or a rule that appears, does.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.resolve("_site");
const BASELINE = path.resolve("data/a11y-baseline.json");
const AXE_SRC = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const AXE_VERSION = require("axe-core/package.json").version;

const CONFIGS = [
  { name: "375-light", width: 375, height: 812, scheme: "light" },
  { name: "375-dark", width: 375, height: 812, scheme: "dark" },
  { name: "1280-light", width: 1280, height: 900, scheme: "light" },
  { name: "1280-dark", width: 1280, height: 900, scheme: "dark" },
];

const args = process.argv.slice(2);
const UPDATE = args.includes("--update-baseline");
const pagesArg = args.find((a, i) => args[i - 1] === "--pages");

if (!fs.existsSync(path.join(ROOT, "index.html"))) {
  console.error("No _site/index.html: run `npm run build` first.");
  process.exit(2);
}

// ── Pages: every real top-level English page, the FR and DE home pages, and
// one of each generated kind (paper, board profile, Atlas theme). A redirect
// stub or an HTML fragment has no <main> and is skipped.
function isPage(file) {
  const html = fs.readFileSync(file, "utf8");
  return html.includes("<main") && !html.includes('http-equiv="refresh"');
}
function firstPage(dir) {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) return null;
  const f = fs.readdirSync(d).filter((n) => n.endsWith(".html") && !/\.(fr|de)\.html$/.test(n)).sort()[0];
  return f ? `/${dir}/${f}` : null;
}
function pageList() {
  if (pagesArg) return pagesArg.split(",").map((p) => p.trim()).filter(Boolean);
  const top = fs
    .readdirSync(ROOT)
    .filter((n) => n.endsWith(".html") && !/\.(fr|de)\.html$/.test(n))
    .filter((n) => isPage(path.join(ROOT, n)))
    .sort()
    .map((n) => (n === "index.html" ? "/" : `/${n}`));
  const extra = ["/index.fr.html", "/index.de.html", firstPage("papers"), firstPage("board"), firstPage("anthology-atlas")];
  return [...top, ...extra.filter((p) => p && fs.existsSync(path.join(ROOT, p === "/" ? "index.html" : p)))];
}

// ── A static server over _site/, so pages load their CSS, JS and images the
// way they do in production.
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".woff2": "font/woff2", ".mp4": "video/mp4", ".xml": "application/xml", ".webmanifest": "application/manifest+json" };
function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

// ── Chrome over CDP.
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const bin of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const r = spawnSync("which", [bin], { encoding: "utf8" });
    if (r.status === 0) return r.stdout.trim();
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(mac)) return mac;
  const cache = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
  if (fs.existsSync(cache)) {
    for (const v of fs.readdirSync(cache).sort().reverse()) {
      const hit = spawnSync("find", [path.join(cache, v), "-type", "f", "-name", "chrome-headless-shell"], { encoding: "utf8" }).stdout.split("\n")[0];
      if (hit) return hit;
    }
  }
  throw new Error("No Chrome found: set CHROME_PATH.");
}

async function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "a11y-chrome-"));
  const proc = spawn(findChrome(), [
    "--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-gpu",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows", "--hide-scrollbars",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: "ignore" });
  const portFile = path.join(profile, "DevToolsActivePort");
  for (let i = 0; i < 200 && !fs.existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 50));
  const [port, wsPath] = fs.readFileSync(portFile, "utf8").trim().split("\n");
  const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
  await new Promise((ok, ko) => { ws.onopen = ok; ws.onerror = ko; });

  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { ok, ko } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? ko(new Error(m.error.message)) : ok(m.result);
    } else for (const l of listeners) l(m);
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((ok, ko) => {
      const id = ++seq;
      pending.set(id, { ok, ko });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const next = (method, sessionId, ms) =>
    new Promise((ok) => {
      const l = (m) => { if (m.method === method && m.sessionId === sessionId) done(true); };
      const t = setTimeout(() => done(false), ms);
      function done(v) { clearTimeout(t); listeners.delete(l); ok(v); }
      listeners.add(l);
    });
  const exited = new Promise((ok) => proc.once("exit", ok));
  const close = async () => {
    try { ws.close(); } catch {}
    proc.kill();
    await exited;
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  };
  return { send, next, close };
}

async function runConfig(cdp, base, pages, cfg, results) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Page.enable", {}, s);
  await cdp.send("Emulation.setDeviceMetricsOverride",
    { width: cfg.width, height: cfg.height, deviceScaleFactor: 1, mobile: cfg.width < 768 }, s);
  // Reduced motion stops the entrance animations, so axe never measures text
  // mid-fade at partial opacity.
  await cdp.send("Emulation.setEmulatedMedia", { features: [
    { name: "prefers-color-scheme", value: cfg.scheme },
    { name: "prefers-reduced-motion", value: "reduce" },
  ] }, s);
  for (const page of pages) {
    const loaded = cdp.next("Page.loadEventFired", s, 30000);
    await cdp.send("Page.navigate", { url: base + page }, s);
    if (!(await loaded)) { results.push({ page, cfg: cfg.name, rule: "load-timeout", count: 1, targets: [] }); continue; }
    await new Promise((r) => setTimeout(r, 300));
    await cdp.send("Runtime.evaluate", { expression: AXE_SRC }, s);
    const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
      expression: `axe.run(document, { resultTypes: ["violations"] }).then((r) =>
        r.violations.map((v) => ({ rule: v.id, count: v.nodes.length, targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) })))`,
      awaitPromise: true, returnByValue: true,
    }, s);
    if (exceptionDetails) { results.push({ page, cfg: cfg.name, rule: "axe-error", count: 1, targets: [exceptionDetails.text] }); continue; }
    for (const v of result.value) results.push({ page, cfg: cfg.name, ...v });
    process.stdout.write(".");
  }
  await cdp.send("Target.closeTarget", { targetId });
}

const pages = pageList();
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const cdp = await launch();
const results = [];
const t0 = Date.now();
console.log(`axe-core ${AXE_VERSION}: ${pages.length} pages x ${CONFIGS.length} configurations`);
try {
  await Promise.all(CONFIGS.map((cfg) => runConfig(cdp, base, pages, cfg, results)));
} finally {
  await cdp.close();
  server.close();
}
console.log(`\ndone in ${Math.round((Date.now() - t0) / 1000)}s`);

const key = (r) => `${r.page} ${r.cfg} ${r.rule}`;
const current = Object.fromEntries(results.map((r) => [key(r), r.count]).sort(([a], [b]) => a.localeCompare(b)));

if (UPDATE) {
  fs.writeFileSync(BASELINE, JSON.stringify({ axe: AXE_VERSION, pages: pages.length, configs: CONFIGS.map((c) => c.name), violations: current }, null, 2) + "\n");
  console.log(`Baseline written: ${Object.keys(current).length} page/config/rule entries, ${results.reduce((a, r) => a + r.count, 0)} nodes.`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, "utf8")).violations : {};
const worse = results.filter((r) => r.count > (baseline[key(r)] || 0));
const better = Object.entries(baseline).filter(([k, n]) => (current[k] || 0) < n);

for (const r of worse) {
  console.log(`NEW  ${r.page}  [${r.cfg}]  ${r.rule}: ${r.count} node(s), baseline ${baseline[key(r)] || 0}`);
  for (const t of r.targets) console.log(`       ${t}`);
}
if (better.length) console.log(`${better.length} baseline entr${better.length === 1 ? "y" : "ies"} improved: run with --update-baseline to lock that in.`);
console.log(worse.length ? `FAIL: ${worse.length} new or worse violation group(s).` : "OK: nothing new against the baseline.");
process.exit(worse.length ? 1 : 0);
