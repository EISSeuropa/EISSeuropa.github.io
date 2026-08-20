/* The Anthology Atlas — proof of concept renderer (#1124, #1129).
   Vanilla, no dependencies. Reads /data/anthology-atlas.json (projected from
   src/_data/paperIndex.js by src/_data/anthologyAtlas.js): one deduplicated
   paper universe drawn as a bipartite map — nodes ↔ the 17 research-theme
   hubs (+ an UNTAGGED hub). Two lenses over the SAME universe:

     Papers  — one dot per paper, coloured by the research theme it is drawn
               to; multi-theme papers settle between hubs, so the bridges show.
     Authors — one dot per deduplicated author (#1129), anchored to the
               theme hubs their papers touch, with co-author edges drawn on
               top so collaboration clusters settle out. Dot size = papers.

   Sibling of the NetSec Atlas (atlas-poc.js), which maps *people* across the
   whole Action; this one maps the Anthology corpus (CLAUDE.md: don't rebuild
   NetSec's systems). Hand-rolled force layout, deterministic seed, DPR-aware
   canvas, dark/light read from EISS CSS variables (re-read on theme flip),
   reduced motion renders the settled layout without animating.

   Markers (Papers lens):
     · has an Anthology landing page → solid theme-coloured dot (315/511);
       papers without a page render as a faint ring, so curation gaps show.
     · Best Paper Prize winner            → gold ring.
     · published version on record (DOI)  → subtle inner ring. */
(function () {
  'use strict';
  const canvas = document.getElementById('atlas-canvas');
  const card = document.getElementById('atlas-card');
  const statsEl = document.getElementById('atlas-stats');
  const yearsEl = document.getElementById('atlas-years');
  const themesEl = document.getElementById('atlas-themes');
  const lensEl = document.getElementById('atlas-lens');
  const authorOptsEl = document.getElementById('atlas-authoropts');
  const paperOptsEl = document.getElementById('atlas-paperopts');
  const findEl = document.getElementById('atlas-find');
  const findListEl = document.getElementById('atlas-find-list');
  const findMsgEl = document.getElementById('atlas-find-msg');
  const filtersEl = document.getElementById('atlas-filters');
  const filtersSummaryEl = document.getElementById('atlas-filters-label') || document.getElementById('atlas-filters-summary');
  const filtersClearEl = document.getElementById('atlas-filters-clear');
  const yearsBulkEl = document.getElementById('atlas-years-bulk');
  const themesBulkEl = document.getElementById('atlas-themes-bulk');
  const liveEl = document.getElementById('atlas-live');
  const legendPapers = document.getElementById('atlas-legend');
  const legendAuthors = document.getElementById('atlas-legend-authors');
  // Welcome strip + guided-tour controls (#1134).
  const welcomeEl = document.getElementById('atlas-welcome');
  const welcomeDismiss = document.getElementById('atlas-welcome-dismiss');
  const welcomeTour = document.getElementById('atlas-welcome-tour');
  const tourTrigger = document.getElementById('atlas-help');
  // Zoom cluster (#1433) + the reset that also undoes a hub drag (#1434).
  const zoomInBtn = document.getElementById('atlas-zoom-in');
  const zoomOutBtn = document.getElementById('atlas-zoom-out');
  const zoomResetBtn = document.getElementById('atlas-zoom-reset');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // A stable colour per theme hub, drawn from a small brand-adjacent wheel so
  // the ring of hubs is legible rather than monochrome. Same wheel the NetSec
  // Atlas uses for its theme lens.
  const THEME_WHEEL = ['#0973de', '#10b981', '#8457ea', '#f59e0b', '#e2568c',
    '#0aa2c0', '#7a9a01', '#b3562e', '#5867dd', '#2e9e6a', '#a855f7', '#d97706',
    '#3b82f6', '#14b8a6', '#ef4444', '#6366f1', '#059669'];

  // Effective theme: honour the site's manual toggle (data-theme), else the
  // OS preference — mirrors theme.js's currentEffective().
  function isDark() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  let theme = {};
  function readTheme() {
    theme = {
      dark: isDark(),
      muted: cssVar('--text-muted') || '#5a6679',
      subtle: cssVar('--text-subtle') || '#7a8598',
      accent: cssVar('--accent') || '#0a84ff',
      ink: cssVar('--text') || '#0b1220',
      warning: cssVar('--warning') || '#f59e0b',
      // Graph chrome, read from the same tokens the legend swatches use, so
      // the map and its key cannot drift apart.
      edge: cssVar('--atlas-edge') || '#2f9fe0',
      inactive: cssVar('--atlas-inactive') || '#9aa7bd',
    };
  }

  // A paper takes the colour of the theme hub it is drawn to, so hue means one
  // thing on this page. Papers used to be coloured by edition year off a second
  // full-spectrum wheel, which put twelve edition hues and seventeen theme hues
  // in the same visual field with no way to tell which scale a colour belonged
  // to. Edition now lives in the chips, the hover card and the URL, where it is
  // read as a label rather than guessed from a hue. Multi-theme papers take
  // their first hub and settle between hubs by position, which is what makes
  // the thematic bridges legible.
  function paperColour(n) {
    const h = n.hubs && n.hubs.length ? hubById[n.hubs[0]] : null;
    return h ? hubFill(h) : theme.muted;
  }

  // ── State ──
  let hubs = [], hubById = {};
  let papers = [], authors = [];
  let coEdges = [];                // {a, b, weight} — author node refs (#1129)
  let paperEdges = [];             // {a, b, weight} — paper node refs (#1188)
  let yearsAsc = [];
  let editions = [];               // {key, label, short, year, count}, newest first (#1153)
  let lens = 'papers';             // 'papers' | 'authors'
  let collabOnly = false;          // Authors lens: hide solo-only authors
  let abstractsOnly = false;       // Papers lens: dim papers without an abstract (#1152)
  let paperEdgesOn = false;        // Papers lens: draw paper-to-paper adjacency (#1188)
  const activeEditions = new Set(); // edition keys currently shown (#1153)
  const activeHubs = new Set();    // theme hubs currently shown
  let hovered = null, draggingHub = null;
  // View transform (#1433). One world-space layout, scaled and translated at
  // paint time, so the force simulation never learns about zoom. Screen =
  // world * view.k + view.{x,y}.
  const view = { k: 1, x: 0, y: 0 };
  const MIN_K = 1, MAX_K = 8;
  let panning = null;               // {sx, sy, ox, oy} while a pan drag is live
  let gestureMoved = false;         // a pan/drag happened, so pointerup is not a click
  let hubsMoved = false;            // a theme hub has been dragged out of its seeded spot
  // Touch (#1431): there is no hover, so the first tap on a node pins its card
  // and the second follows the link.
  let pinned = null;
  let loadFailed = false;          // the fetch failed, so the stage says so
  const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  let spotlight = null;            // node pinned by the Find control (#1154)
  let spotlightSet = null;         // {ids:Set, label:string} pinned by an author click (#1190)
  let W = 0, H = 0, dpr = 1;

  const items = () => (lens === 'authors' ? authors : papers);

  function hubColour(h) { return THEME_WHEEL[h.wheel % THEME_WHEEL.length]; }
  function hubFill(h) { return h.type === 'untagged' ? theme.inactive : hubColour(h); }

  function nodeVisible(n) {
    // Edition (#1153): a paper falls in one edition; an author in several
    // (#1129) — shown when ANY of their editions is selected. Joint events
    // are their own chips rather than lumped into their calendar year.
    const edOk = n.type === 'author'
      ? n.editions.some((k) => activeEditions.has(k))
      : activeEditions.has(n.edition);
    if (!edOk) return false;
    if (lens === 'authors' && collabOnly && !n.coCount) return false;
    return n.hubs.some((id) => activeHubs.has(id));
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Per-lens hub membership + counts (a hub's dot label shows how many of the
  // current lens's nodes touch it). Recomputed on every lens switch.
  function recountHubs() {
    hubs.forEach((h) => { h.count = 0; h.members = []; });
    items().forEach((n) => n.hubs.forEach((id) => {
      const h = hubById[id];
      if (h) { h.count++; h.members.push(n.id); }
    }));
  }

  // ── Layout ──
  function seedPositions() {
    const rand = mulberry32(lens === 'authors' ? 40517 : 19172);
    const cx = W / 2, cy = H / 2;
    hubs.forEach((h, i) => {
      const ang = (i / hubs.length) * Math.PI * 2 - Math.PI / 2;
      h.x = cx + Math.cos(ang) * W * 0.36;
      h.y = cy + Math.sin(ang) * H * 0.38;
      h.r = Math.max(16, Math.sqrt(h.count) * 3.6);
    });
    items().forEach((n) => {
      const linked = n.hubs.map((id) => hubById[id]).filter(Boolean);
      if (!linked.length) { n.x = -50; n.y = -50; n.vx = n.vy = 0; return; }
      const mx = linked.reduce((s, h) => s + h.x, 0) / linked.length;
      const my = linked.reduce((s, h) => s + h.y, 0) / linked.length;
      n.x = mx + (rand() - 0.5) * 120;
      n.y = my + (rand() - 0.5) * 120;
      n.vx = 0; n.vy = 0;
    });
  }

  function tick() {
    const visible = items().filter((n) => n.hubs.length);
    visible.forEach((n) => {
      n.hubs.forEach((id) => {
        const h = hubById[id];
        const dx = h.x - n.x, dy = h.y - n.y;
        const d = Math.hypot(dx, dy) || 1;
        const rest = h.r + 46;
        const f = (d - rest) * 0.004;
        n.vx += (dx / d) * f * 60;
        n.vy += (dy / d) * f * 60;
      });
      n.vx += (W / 2 - n.x) * 0.0004;
      n.vy += (H / 2 - n.y) * 0.0004;
    });
    // Authors lens: a gentle spring along each co-author edge, so the 65
    // collaboration clusters settle into tight clumps on top of the hub
    // anchoring (heavier for pairs that share >1 paper). #1129.
    if (lens === 'authors') {
      coEdges.forEach((e) => {
        const a = e.a, b = e.b;
        if (!nodeVisible(a) || !nodeVisible(b)) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 34) * 0.01 * Math.min(2, e.weight);
        const ux = (dx / d) * f * 60, uy = (dy / d) * f * 60;
        a.vx += ux; a.vy += uy;
        b.vx -= ux; b.vy -= uy;
      });
    }
    // O(n²) repulsion. ~530 nodes ≈ 140k pairs/tick — acceptable for a PoC.
    // ponytail: if this visibly chugs, bucket nodes into a uniform spatial
    // grid and only test neighbours within the cutoff radius (√4600 ≈ 68px);
    // that drops the pass to near-linear without changing the settled layout.
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i], b = visible[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 4600 || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const f = 24 / d2;
        dx /= d; dy /= d;
        a.vx -= dx * f * 60; a.vy -= dy * f * 60;
        b.vx += dx * f * 60; b.vy += dy * f * 60;
      }
    }
    visible.forEach((n) => {
      hubs.forEach((h) => {
        const dx = n.x - h.x, dy = n.y - h.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = h.r + 12;
        if (d < min) { n.x = h.x + (dx / d) * min; n.y = h.y + (dy / d) * min; }
      });
      n.vx *= 0.82; n.vy *= 0.82;
      n.x += n.vx * 0.016; n.y += n.vy * 0.016;
      n.x = Math.max(10, Math.min(W - 10, n.x));
      n.y = Math.max(10, Math.min(H - 10, n.y));
    });
  }

  // ── Paint ──
  // A message painted across the middle of the stage, in screen space, for
  // the states where the map itself has nothing to say: every edition or
  // every theme toggled off, or the data failing to load. Without it the
  // reader gets a blank rectangle and no account of why.
  function drawNotice(title, hint) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.ink;
    ctx.font = '600 15px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillText(title, W / 2, H / 2 - 10);
    if (hint) {
      ctx.fillStyle = theme.muted;
      ctx.font = '13px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillText(hint, W / 2, H / 2 + 14);
    }
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  function draw() {
    // Clear in screen space, then paint in world space (#1433). Everything
    // below this line keeps working in the layout's own coordinates.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (loadFailed) { drawNotice('The atlas data could not be loaded.', 'Every paper and author on this map is browsable in the Anthology.'); return; }
    // Nothing passes the filters: say so rather than showing a blank stage.
    if (items().length && !items().some(nodeVisible)) {
      drawNotice(lens === 'authors' ? 'No authors match these filters.' : 'No papers match these filters.',
        activeEditions.size === 0 ? 'Every edition is switched off. Turn one back on to see the map.'
          : activeHubs.size === 0 ? 'Every research theme is switched off. Turn one back on to see the map.'
            : 'Widen the editions or themes above to bring the map back.');
      return;
    }
    ctx.setTransform(dpr * view.k, 0, 0, dpr * view.k, dpr * view.x, dpr * view.y);
    // Focus = the hovered node, falling back to the Find spotlight (#1154):
    // both light the same neighbourhood and dim the rest.
    const focus = hovered || spotlight;
    const hoverIds = focus
      ? new Set([focus.id].concat(
          focus.type === 'paper' ? focus.hubs
            : focus.type === 'author' ? focus.hubs.concat(focus.coPeers || [])
            : (focus.members || [])))
      : (spotlightSet ? spotlightSet.ids : null);

    // Edges: node → each of its theme hubs.
    items().forEach((n) => {
      if (!nodeVisible(n)) return;
      const lit = hoverIds && hoverIds.has(n.id);
      n.hubs.forEach((id) => {
        const h = hubById[id];
        if (!activeHubs.has(id)) return;
        const litEdge = lit && (focus.type !== 'theme' && focus.type !== 'untagged' || focus.id === id);
        ctx.strokeStyle = hubFill(h);
        ctx.globalAlpha = litEdge ? 0.5 : (hoverIds ? 0.035 : (theme.dark ? 0.14 : 0.11));
        ctx.lineWidth = litEdge ? 1.3 : 1;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.quadraticCurveTo((n.x + h.x) / 2 + (n.y - h.y) * 0.08,
          (n.y + h.y) / 2 + (h.x - n.x) * 0.08, h.x, h.y);
        ctx.stroke();
      });
    });
    ctx.globalAlpha = 1;

    // Paper-to-paper edges (#1188, Papers lens, opt-in). The corpus adjacency
    // the landing pages list as "Related in the Anthology": shared authors,
    // panel-mates, shared themes. Drawn under the nodes in a neutral ink so it
    // reads as structure behind the year-coloured dots rather than competing
    // with them, with a heavier stroke for a stronger relationship.
    if (lens === 'papers' && paperEdgesOn) {
      ctx.strokeStyle = theme.subtle;
      paperEdges.forEach((e) => {
        const a = e.a, b = e.b;
        if (!nodeVisible(a) || !nodeVisible(b)) return;
        const lit = hoverIds && hoverIds.has(a.id) && hoverIds.has(b.id);
        ctx.globalAlpha = lit ? 0.85 : (hoverIds ? 0.04 : Math.min(0.42, 0.12 + e.weight * 0.03));
        ctx.lineWidth = e.weight >= 10 ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    // Co-author edges, on top of the hub anchoring (Authors lens). Heavier
    // stroke for a pair that shares more than one paper. #1129.
    if (lens === 'authors') {
      coEdges.forEach((e) => {
        const a = e.a, b = e.b;
        if (!nodeVisible(a) || !nodeVisible(b)) return;
        const lit = hoverIds && hoverIds.has(a.id) && hoverIds.has(b.id);
        ctx.strokeStyle = theme.edge;
        ctx.globalAlpha = lit ? 0.9 : (hoverIds ? 0.05 : (e.weight > 1 ? 0.6 : 0.4));
        ctx.lineWidth = e.weight > 1 ? 1.2 + e.weight * 0.7 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo((a.x + b.x) / 2 + (a.y - b.y) * 0.12,
          (a.y + b.y) / 2 + (b.x - a.x) * 0.12, b.x, b.y);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    // Nodes.
    items().forEach((n) => {
      if (!nodeVisible(n)) return;
      // Coverage overlay (#1152): with "Abstract on file" on, papers without
      // one fade to background so the recovery gaps show spatially. A hovered
      // node stays bright either way.
      const noAbstract = abstractsOnly && lens === 'papers'
        && n.type === 'paper' && !n.hasAbstract
        && !(focus && focus.id === n.id);
      const dim = (hoverIds && !hoverIds.has(n.id)) || noAbstract;
      const r = (focus && focus.id === n.id) ? n.r + 2 : n.r;
      ctx.globalAlpha = dim ? 0.14 : 1;

      if (n.type === 'author') {
        // Author dot: accent fill, sized by paper count; a collaborator (has a
        // co-author edge) gets a crisp white rim so clusters read as people.
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.coCount ? theme.accent : theme.inactive;
        ctx.fill();
        if (n.coCount) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.9)';
          ctx.stroke();
        }
        return;
      }

      const col = paperColour(n);
      if (n.hasPage) {
        // Curated: solid theme-coloured dot with a crisp rim.
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.9)';
        ctx.stroke();
      } else {
        // No page yet: hollow ring, so the gap is legible against solid dots.
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = theme.dark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.5)';
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = col;
        ctx.globalAlpha = dim ? 0.14 : 0.85;
        ctx.stroke();
        ctx.globalAlpha = dim ? 0.14 : 1;
      }
      // Published version on record → subtle inner ring.
      if (n.published) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1.4, r - 2), 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = theme.dark ? 'rgba(10,12,20,.75)' : 'rgba(255,255,255,.95)';
        ctx.stroke();
      }
      // Best Paper Prize → gold ring.
      if (n.prize) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = theme.warning;
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;

    // Find spotlight (#1154): a steady accent halo on the found node, in
    // whichever lens carries it.
    if (spotlight && spotlight.type === (lens === 'authors' ? 'author' : 'paper')
        && nodeVisible(spotlight)) {
      ctx.beginPath();
      ctx.arc(spotlight.x, spotlight.y, spotlight.r + 6, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = theme.accent;
      ctx.stroke();
    }
    // An author's papers, pinned by clicking their dot on the Authors lens.
    if (spotlightSet && !hovered && lens === 'papers') {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = theme.accent;
      items().forEach((n) => {
        if (!spotlightSet.ids.has(n.id) || !nodeVisible(n)) return;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Hubs on top.
    hubs.forEach((h) => {
      const dim = (hoverIds && !hoverIds.has(h.id)) || !activeHubs.has(h.id);
      ctx.globalAlpha = dim ? 0.22 : 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fillStyle = hubFill(h);
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.font = '700 12px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(String(h.count), h.x, h.y + 4);
      ctx.globalAlpha = 1;
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = theme.muted;
      const label = h.name.length > 26 ? h.name.slice(0, 25) + '…' : h.name;
      ctx.fillText(label, h.x, h.y + h.r + 15);
    });
  }

  // ── Interaction ──
  // Pointer coordinates arrive in screen space; the layout lives in world
  // space. Everything that hit-tests or drags converts first (#1433).
  const toWorldX = (px) => (px - view.x) / view.k;
  const toWorldY = (py) => (py - view.y) / view.k;
  const toScreenX = (wx) => wx * view.k + view.x;
  const toScreenY = (wy) => wy * view.k + view.y;

  // A fingertip is about three times the width of a mouse cursor's useful
  // aim, and the dots are the same size either way (#1431). The radius is a
  // screen measurement, so it shrinks in world terms as the map zooms in,
  // which is what makes zooming a way to pick one dot out of a cluster.
  const HIT = coarse ? 22 : 13;

  function nodeAt(px, py) {
    const mx = toWorldX(px), my = toWorldY(py);
    for (const h of hubs) if (Math.hypot(mx - h.x, my - h.y) <= h.r) return h;
    let best = null, bd = HIT / view.k;
    for (const n of items()) {
      if (!nodeVisible(n)) continue;
      const d = Math.hypot(mx - n.x, my - n.y);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  // Zoom about a fixed screen point, so the map grows under the cursor (or
  // the centre, for the buttons) rather than sliding away from it.
  function zoomTo(k, px, py) {
    const next = Math.max(MIN_K, Math.min(MAX_K, k));
    if (next === view.k) return;
    const wx = toWorldX(px), wy = toWorldY(py);
    view.k = next;
    view.x = px - wx * next;
    view.y = py - wy * next;
    clampView();
    unpin();
    syncTouchAction();
    updateZoomUi();
    draw();
  }

  // Keep the layout from being panned off into empty space: at k=1 the view
  // is locked to the stage, and beyond that the world edges stay outside it.
  function clampView() {
    const maxX = 0, minX = W - W * view.k;
    const maxY = 0, minY = H - H * view.k;
    view.x = Math.min(maxX, Math.max(minX, view.x));
    view.y = Math.min(maxY, Math.max(minY, view.y));
  }

  function resetView() {
    view.k = 1; view.x = 0; view.y = 0;
    unpin();
    syncTouchAction();
    updateZoomUi();
    // Dragged hubs are part of "the view I have made", so a reset puts the
    // layout back too, but only when a hub has actually been moved (#1434).
    if (hubsMoved) { hubsMoved = false; seedPositions(); reheat(200); }
    else draw();
  }

  // Zoomed out, the map is one block of a phone screen and a swipe belongs to
  // the page (#1428). Zoomed in, the reader is inside the map and the same
  // swipe should pan it. touch-action is read when a gesture starts, so
  // flipping it on a zoom change is safe.
  function syncTouchAction() {
    canvas.style.touchAction = view.k > 1 ? 'none' : '';
  }

  function updateZoomUi() {
    if (zoomOutBtn) zoomOutBtn.disabled = view.k <= MIN_K;
    if (zoomInBtn) zoomInBtn.disabled = view.k >= MAX_K;
    if (zoomResetBtn) zoomResetBtn.hidden = view.k === MIN_K && !hubsMoved;
  }

  function unpin() {
    if (!pinned) return;
    pinned = null;
    card.classList.remove('is-pinned');
    showCard(null);
  }

  // The "go" line is a real link, so a card pinned by a tap can be tapped
  // through (#1431). On a mouse the card is pointer-events:none and the
  // canvas click does the navigating, so this is inert there.
  function addGo(parent, text, href) {
    if (!href) return addEl(parent, 'go', text);
    const a = document.createElement('a');
    a.className = 'go';
    a.href = href;
    a.textContent = text;
    parent.append(a);
    return a;
  }

  function addEl(parent, cls, text) {
    const el = document.createElement('div');
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    parent.append(el);
    return el;
  }

  function showCard(node, mx, my) {
    if (!node) { card.classList.remove('is-on'); card.setAttribute('aria-hidden', 'true'); return; }
    card.replaceChildren();

    if (node.type === 'theme' || node.type === 'untagged') {
      addEl(card, 'nm', node.name);
      addEl(card, 'meta', node.count + (node.count === 1 ? ' ' : ' ')
        + (lens === 'authors' ? (node.count === 1 ? 'author' : 'authors')
                              : (node.count === 1 ? 'paper' : 'papers')));
    } else if (node.type === 'author') {
      addEl(card, 'nm', node.name);
      const bits = [node.paperCount + (node.paperCount === 1 ? ' paper' : ' papers')];
      if (node.years.length) bits.push(node.years.slice().sort((a, b) => a - b).join(', '));
      addEl(card, 'meta', bits.join(' · '));
      if (node.hubs.length) {
        const pills = addEl(card, 'pills');
        node.hubs.slice(0, 3).forEach((id) => {
          const h = hubById[id];
          const s = document.createElement('span');
          s.className = 'pill';
          // Same rule as the filter chips: theme colour on the dot, label on
          // the card's own ink token.
          s.style.setProperty('--chip-dot', hubFill(h));
          s.textContent = h.type === 'untagged' ? 'Untagged' : h.name;
          pills.append(s);
        });
        if (node.hubs.length > 3) {
          const s = document.createElement('span'); s.className = 'pill is-plain';
          s.textContent = '+' + (node.hubs.length - 3);
          pills.append(s);
        }
      }
      if (node.coCount) {
        const names = node.coPeerNodes.map((c) => c.name);
        const shown = names.slice(0, 4).join(', ') + (names.length > 4 ? ', +' + (names.length - 4) : '');
        addEl(card, 'coauth', 'With ' + shown);
      }
      if (node.paperIdx && node.paperIdx.length) {
        addEl(card, 'go', (coarse ? 'Tap again' : 'Click') + ' to map their papers →');
      }
    } else {
      addEl(card, 'nm', node.title);
      const who = node.authors.length
        ? node.authors.slice(0, 3).join(', ') + (node.authors.length > 3 ? ' +' + (node.authors.length - 3) : '')
        : '';
      addEl(card, 'meta', [who, node.year].filter(Boolean).join(' · '));
      if (node.panel) addEl(card, 'panel', node.panel);
      if (node.hubs.length) {
        const pills = addEl(card, 'pills');
        node.hubs.slice(0, 3).forEach((id) => {
          const h = hubById[id];
          const s = document.createElement('span');
          s.className = 'pill';
          // Same rule as the filter chips: theme colour on the dot, label on
          // the card's own ink token.
          s.style.setProperty('--chip-dot', hubFill(h));
          s.textContent = h.type === 'untagged' ? 'Untagged' : h.name;
          pills.append(s);
        });
        if (node.hubs.length > 3) {
          const s = document.createElement('span'); s.className = 'pill is-plain';
          s.textContent = '+' + (node.hubs.length - 3);
          pills.append(s);
        }
      }
      if (node.prize || node.published) {
        const b = addEl(card, 'badges');
        if (node.prize) { const s = document.createElement('span'); s.className = 'badge-prize'; s.textContent = '★ Best Paper Prize'; b.append(s); }
        if (node.published) { const s = document.createElement('span'); s.className = 'badge-pub'; s.textContent = 'Published version'; b.append(s); }
      }
      if (node.hasPage) addGo(card, coarse ? 'Read this paper →' : 'Read more →', node.url);
    }

    const stage = canvas.parentElement.getBoundingClientRect();
    // Flip the card off whichever edge it would otherwise run past. The stage
    // is overflow:hidden, so an unflipped card loses the theme pills and the
    // "Read more" line to the crop. Vertical flip fixed in #1428, horizontal
    // in #1434, where the card used to clamp and sit on top of its own dot.
    const ch = card.offsetHeight, cw = card.offsetWidth;
    const right = mx + 16;
    const left = right + cw > stage.width - 8 ? mx - 16 - cw : right;
    const below = my - 14;
    const top = below + ch > stage.height - 8 ? my - 10 - ch : below;
    card.style.left = Math.max(8, left) + 'px';
    card.style.top = Math.max(8, top) + 'px';
    card.classList.add('is-on');
    card.setAttribute('aria-hidden', 'false');
  }

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    if (draggingHub) {
      draggingHub.x = toWorldX(mx); draggingHub.y = toWorldY(my);
      hubsMoved = true; gestureMoved = true; updateZoomUi(); draw();
      return;
    }
    if (panning) {
      view.x = panning.ox + (mx - panning.sx);
      view.y = panning.oy + (my - panning.sy);
      if (Math.hypot(mx - panning.sx, my - panning.sy) > 4) gestureMoved = true;
      clampView(); draw();
      return;
    }
    // A pinned card belongs to a tap, not to whatever the pointer passes over
    // afterwards, so hover stops driving the card while one is up (#1431).
    if (pinned) return;
    hovered = nodeAt(mx, my);
    canvas.classList.toggle('is-link', !!(hovered && (hovered.type === 'paper' || hovered.type === 'author') && hovered.url));
    showCard(hovered, mx, my);
    draw();
  });
  canvas.addEventListener('pointerleave', () => {
    if (pinned) return;
    hovered = null; showCard(null); draw();
  });
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const n = nodeAt(mx, my);
    gestureMoved = false;
    if (n && (n.type === 'theme' || n.type === 'untagged')) {
      draggingHub = n; canvas.setPointerCapture(e.pointerId);
      return;
    }
    // Empty canvas drags the view (#1433). Starting a pan on a node would
    // make a dot impossible to click, so nodes are left alone.
    if (!n) {
      panning = { sx: mx, sy: my, ox: view.x, oy: view.y };
      canvas.setPointerCapture(e.pointerId);
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (draggingHub) { draggingHub = null; return; }
    if (panning) {
      panning = null;
      if (gestureMoved) return;
    }
    const r = canvas.getBoundingClientRect();
    const n = nodeAt(e.clientX - r.left, e.clientY - r.top);
    // Touch has no hover, so a tap used to navigate off the page before the
    // card it opened could be read, and a fingertip on a dense cluster often
    // opened the wrong paper. The first tap pins the card, the second acts
    // on it (#1431).
    if (coarse && n && n !== pinned && (n.type === 'paper' || n.type === 'author')) {
      pinned = n;
      hovered = n;
      card.classList.add('is-pinned');
      showCard(n, toScreenX(n.x), toScreenY(n.y));
      // The card is a canvas overlay, so nothing announces it on its own.
      announce(card.textContent.replace(/\s+/g, ' ').trim());
      draw();
      return;
    }
    unpin();
    // Author (#1190): stay on the map and show their papers, rather than
    // navigating away. Papers still follow their link.
    if (n && n.type === 'author' && n.paperIdx && n.paperIdx.length) { showAuthorPapers(n); return; }
    if (n && n.type === 'paper' && n.url) { location.href = n.url; return; }
    // Clicking empty canvas clears a pinned spotlight.
    if (!n && (spotlightSet || spotlight)) {
      spotlightSet = null; spotlight = null;
      if (findEl) findEl.value = '';
      syncUrl(); draw();
    }
  });

  // Wheel zoom about the cursor, held behind a modifier. An unconditional
  // preventDefault here turned 640px of the page into a desktop scroll trap:
  // a trackpad flick that happened to cross the map zoomed it instead of
  // scrolling past it, which is the same complaint as the phone trap the
  // touch-action fix cured. A trackpad pinch arrives as ctrlKey, so pinching
  // works as it reads, and the buttons cover everyone else.
  canvas.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return; // plain scroll belongs to the page
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    zoomTo(view.k * Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomTo(view.k * 1.6, W / 2, H / 2));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomTo(view.k / 1.6, W / 2, H / 2));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetView);

  // ── Controls ──
  function chip(label, pressed, onClick, bg) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'atlas-chip';
    // The series colour goes on the chip's dot, not its fill. A saturated fill
    // with white text failed WCAG AA on most chips in both themes; the label
    // now wears the surface ink token and the dot carries identity.
    if (bg) b.style.setProperty('--chip-dot', bg); else b.classList.add('is-plain');
    b.textContent = label;
    b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', () => onClick(b));
    return b;
  }

  let animFrames = 0;
  function reheat(frames) {
    if (reduceMotion) { for (let i = 0; i < 360; i++) tick(); draw(); return; }
    const wasRunning = animFrames > 0;
    animFrames = frames;
    if (wasRunning) return;
    (function loop() {
      tick(); draw();
      if (--animFrames > 0) requestAnimationFrame(loop);
    })();
  }

  // ── URL state (#1151) ────────────────────────────────────────────────────
  // lens / years / themes / collab mirrored into the query string (same
  // pattern as the by-paper Event filter), so the Anthology and anyone
  // sharing a link can deep-link a filtered view of the map. Only
  // non-default state is written, so the bare URL stays canonical.
  // Filter disclosure summary (#1191): on phones the rows are collapsed, so
  // the summary has to say whether anything is filtering.
  const bulkRefreshers = [];   // All/None buttons that follow the chip state (#1442)

  function updateFilterSummary() {
    const eds = activeEditions.size, ths = activeHubs.size;
    const all = eds === editions.length && ths === hubs.length;
    if (filtersSummaryEl) {
      filtersSummaryEl.textContent = all
        ? 'Filters'
        : 'Filters · ' + eds + '/' + editions.length + ' editions, ' + ths + '/' + hubs.length + ' themes';
    }
    // The summary is the only filter control visible while the rows are
    // collapsed, so the way out of a filtered view belongs beside the count.
    if (filtersClearEl) filtersClearEl.hidden = all;
    bulkRefreshers.forEach((fn) => fn());
  }

  function syncUrl() {
    updateFilterSummary();
    if (!window.history || !history.replaceState) return;
    const url = new URL(location.href);
    const sp = url.searchParams;
    if (lens !== 'papers') sp.set('lens', lens); else sp.delete('lens');
    if (activeEditions.size && activeEditions.size !== editions.length) {
      sp.set('editions', editions.filter((e) => activeEditions.has(e.key)).map((e) => e.key).join(','));
    } else sp.delete('editions');
    if (activeHubs.size && activeHubs.size !== hubs.length) {
      sp.set('themes', hubs.filter((h) => activeHubs.has(h.id)).map((h) => h.name).join(','));
    } else sp.delete('themes');
    if (collabOnly) sp.set('collab', '1'); else sp.delete('collab');
    if (abstractsOnly) sp.set('abstracts', '1'); else sp.delete('abstracts');
    if (paperEdgesOn) sp.set('links', '1'); else sp.delete('links');
    if (spotlightSet) { sp.set('author', spotlightSet.label); sp.delete('find'); }
    else if (spotlight && findEl && findEl.value.trim()) { sp.set('find', findEl.value.trim()); sp.delete('author'); }
    else { sp.delete('find'); sp.delete('author'); }
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  // Restore filters from the URL on load. Unknown years/themes are ignored;
  // an empty match leaves the default (everything shown). Returns 'authors'
  // when the lens param asks for the Authors lens, so boot can switch after
  // the initial build.
  function applyUrlState() {
    let sp;
    try { sp = new URL(location.href).searchParams; } catch (e) { return null; }
    // `editions=` is the native param; a bare `years=` from an older link is
    // honoured by expanding each year to every edition inside it.
    const known = new Set(editions.map((e) => e.key));
    const wantedEds = (sp.get('editions') || '').split(',').filter((k) => known.has(k));
    (sp.get('years') || '').split(',').map(Number).forEach((y) => {
      editions.forEach((e) => { if (e.year === y) wantedEds.push(e.key); });
    });
    if (wantedEds.length) { activeEditions.clear(); wantedEds.forEach((k) => activeEditions.add(k)); }
    // Theme pages (#1255) pre-filter from the page itself rather than the URL,
    // so /anthology-atlas/theme/<slug>.html arrives already filtered instead of
    // flashing the whole corpus first. A ?themes= param still wins, so a link
    // shared off a theme page with extra filtering behaves as the sharer left it.
    const shell = document.querySelector('.atlas-shell[data-atlas-theme]');
    const pageTheme = shell ? shell.getAttribute('data-atlas-theme') : '';
    const wantedParam = (sp.get('themes') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const wanted = wantedParam.length ? wantedParam : (pageTheme ? [pageTheme] : []);
    const ids = hubs.filter((h) => wanted.indexOf(h.name) !== -1).map((h) => h.id);
    if (ids.length) { activeHubs.clear(); ids.forEach((id) => activeHubs.add(id)); }
    collabOnly = sp.get('collab') === '1';
    abstractsOnly = sp.get('abstracts') === '1';
    paperEdgesOn = sp.get('links') === '1';
    return sp.get('lens') === 'authors' ? 'authors' : null;
  }

  // "All" and "None" for a chip row (#1442). They reuse the plain chip style
  // (no colour dot, no pressed state) because they name no series: they are
  // actions, not a filter that can be on or off.
  function buildBulk(host, apply, isAll, isNone) {
    if (!host) return function () {};
    const all = document.createElement('button');
    const none = document.createElement('button');
    [all, none].forEach((b) => { b.type = 'button'; b.className = 'atlas-chip is-plain'; });
    all.textContent = 'All';
    none.textContent = 'None';
    const refresh = function () { all.disabled = isAll(); none.disabled = isNone(); };
    all.addEventListener('click', () => { apply(true); refresh(); });
    none.addEventListener('click', () => { apply(false); refresh(); });
    host.append(all, none);
    refresh();
    return refresh;
  }

  // Every chip in a row set at once, with the pressed state on each button
  // brought along, since the chips are the readable record of the filter.
  function setAllChips(host, set, keys, on) {
    if (on) keys.forEach((k) => set.add(k)); else set.clear();
    if (host) {
      host.querySelectorAll('.atlas-chip[aria-pressed]').forEach((b) => {
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    syncUrl();
    draw();
  }

  function buildEditionChips() {
    // One chip per edition (#1153), newest first, coloured by its calendar
    // year (node colour stays on the year ramp, so a joint event's chip
    // shares its year's hue). The full edition name rides on the tooltip.
    editions.forEach((e) => {
      const b = chip(e.short, activeEditions.has(e.key), (bb) => {
        if (activeEditions.has(e.key)) activeEditions.delete(e.key); else activeEditions.add(e.key);
        bb.setAttribute('aria-pressed', activeEditions.has(e.key) ? 'true' : 'false');
        syncUrl();
        draw();
      });
      b.title = e.label + ' · ' + e.count + ' papers';
      yearsEl.appendChild(b);
    });
  }

  function buildThemeChips() {
    hubs.forEach((h) => {
      themesEl.appendChild(chip(
        h.type === 'untagged' ? 'Untagged' : h.name,
        activeHubs.has(h.id),
        (b) => {
          if (activeHubs.has(h.id)) activeHubs.delete(h.id); else activeHubs.add(h.id);
          b.setAttribute('aria-pressed', activeHubs.has(h.id) ? 'true' : 'false');
          syncUrl();
          draw();
        },
        hubFill(h)));
    });
  }

  function buildLensChips() {
    [['papers', 'Papers'], ['authors', 'Authors']].forEach(([v, label]) => {
      // No dot: the lens pair is a mode switch, not a series, so it reads as a
      // plain segmented control and the pressed state carries the selection.
      const b = chip(label, v === lens, () => switchLens(v));
      b.dataset.lens = v;
      lensEl.appendChild(b);
    });
  }

  // ── Find and spotlight (#1154) ───────────────────────────────────────────
  // A native datalist over every author name and paper title (both are
  // already client-side in the atlas JSON). Picking or typing a match pins a
  // spotlight: the node gets an accent halo, its neighbourhood lights the
  // same way hover does, and the query mirrors into the URL (find=) so a
  // found node is shareable. Clearing the field clears the spotlight.
  function buildFindOptions() {
    if (!findListEl) return;
    const frag = document.createDocumentFragment();
    const seen = new Set();
    authors.concat(papers).forEach((n) => {
      const label = n.type === 'author' ? n.name : n.title;
      if (!label || seen.has(label)) return;
      seen.add(label);
      const o = document.createElement('option');
      o.value = label;
      frag.appendChild(o);
    });
    findListEl.appendChild(frag);
  }

  function resolveFind(q) {
    const s = String(q || '').trim().toLowerCase();
    if (!s) return null;
    const eq = (v) => String(v || '').toLowerCase() === s;
    const has = (v) => String(v || '').toLowerCase().indexOf(s) !== -1;
    return authors.find((a) => eq(a.name)) || papers.find((p) => eq(p.title))
      || authors.find((a) => has(a.name)) || papers.find((p) => has(p.title))
      || null;
  }

  // Say what happened. A search that matches nothing, or matches a paper the
  // current filters are hiding, reads as a broken control otherwise: the map
  // simply does not move.
  function setFindMsg(text) {
    if (!findMsgEl) return;
    findMsgEl.textContent = text || '';
    findMsgEl.hidden = !text;
    if (findEl) {
      if (text) findEl.setAttribute('aria-invalid', 'true');
      else findEl.removeAttribute('aria-invalid');
    }
  }

  // Anyone who cannot see the map move gets told what happened (#1446). The
  // region is polite, so it waits its turn rather than cutting across.
  function announce(text) {
    if (!liveEl) return;
    liveEl.textContent = text || '';
  }

  function applyFind(q) {
    const node = resolveFind(q);
    spotlight = node;
    spotlightSet = null; // an explicit Find supersedes a pinned author
    // The Find message is a status region of its own, so the failure paths
    // announce through it and this one is cleared rather than left holding a
    // stale spotlight.
    if (!String(q || '').trim()) { setFindMsg(''); announce(''); }
    else if (!node) { setFindMsg('No match in the corpus.'); announce(''); }
    else if (!nodeVisible(node)) { setFindMsg('Found, but hidden by the current filters.'); announce(''); }
    else {
      setFindMsg('');
      announce(node.type === 'author'
        ? 'Spotlighting ' + node.name + ', ' + node.paperCount + (node.paperCount === 1 ? ' paper.' : ' papers.')
        : 'Spotlighting ' + node.title + '.');
    }
    if (node) {
      const wantLens = node.type === 'author' ? 'authors' : 'papers';
      if (lens !== wantLens) { switchLens(wantLens); return; } // switchLens syncs + draws
    }
    syncUrl();
    draw();
  }

  // Cross-lens jump (#1190): pin an author's papers on the Papers lens. The
  // author's name goes into the Find field so it is visible WHY the view
  // changed, and into the URL as author= so the state is shareable.
  function showAuthorPapers(node) {
    const ids = new Set(node.paperIdx.map((i) => papers[i] && papers[i].id).filter(Boolean));
    if (!ids.size) return;
    spotlight = null;
    spotlightSet = { ids, label: node.name };
    if (findEl) findEl.value = node.name;
    hovered = null; showCard(null);
    if (lens !== 'papers') switchLens('papers'); else { syncUrl(); draw(); }
  }

  function buildAuthorOpts() {
    authorOptsEl.appendChild(chip('Collaborators only', collabOnly, (b) => {
      collabOnly = !collabOnly;
      b.setAttribute('aria-pressed', collabOnly ? 'true' : 'false');
      syncUrl();
      draw();
    }));
  }

  // Coverage overlay (#1152): dim papers without an abstract on file, so the
  // recovery work's remaining gaps show WHERE they sit — which themes and
  // editions are still dark — not just when (the per-year bars on /anthology).
  function buildPaperOpts() {
    if (!paperOptsEl) return;
    paperOptsEl.appendChild(chip('Abstract on file', abstractsOnly, (b) => {
      abstractsOnly = !abstractsOnly;
      b.setAttribute('aria-pressed', abstractsOnly ? 'true' : 'false');
      syncUrl();
      draw();
    }));
    // Paper-to-paper adjacency (#1188), off by default: 890 edges is a lot of
    // ink, and the hub anchoring is the primary reading of this lens.
    paperOptsEl.appendChild(chip('Link related papers', paperEdgesOn, (b) => {
      paperEdgesOn = !paperEdgesOn;
      b.setAttribute('aria-pressed', paperEdgesOn ? 'true' : 'false');
      syncUrl();
      draw();
    }));
  }

  // Connected components over the co-author edges (size ≥ 2) — the headline
  // "clusters" figure, derived, never hardcoded. #1129.
  function clusterCount() {
    const parent = new Map();
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const touched = new Set();
    coEdges.forEach((e) => {
      [e.a.id, e.b.id].forEach((id) => { if (!parent.has(id)) parent.set(id, id); touched.add(id); });
      const ra = find(e.a.id), rb = find(e.b.id);
      if (ra !== rb) parent.set(ra, rb);
    });
    const roots = new Set([...touched].map(find));
    return roots.size;
  }

  function buildStats() {
    statsEl.replaceChildren();
    let rows;
    if (lens === 'authors') {
      const collaborating = authors.filter((a) => a.coCount).length;
      rows = [
        ['' + authors.length, 'authors'],
        ['' + collaborating, 'with a co-author'],
        ['' + coEdges.length, 'co-author pairs'],
        ['' + clusterCount(), 'collaboration clusters'],
      ];
    } else {
      const withPage = papers.filter((p) => p.hasPage).length;
      rows = [
        ['' + papers.length, 'papers'],
        ['' + editions.length, 'editions, ' + yearsAsc[0] + '–' + yearsAsc[yearsAsc.length - 1]],
        ['' + hubs.filter((h) => h.type === 'theme').length, 'research themes'],
        [withPage + ' / ' + papers.length, 'with an Anthology page'],
      ];
    }
    rows.forEach(([b, s]) => {
      const el = document.createElement('div');
      el.className = 'atlas-stat';
      const bb = document.createElement('b'); bb.textContent = b;
      const ss = document.createElement('span'); ss.textContent = s;
      el.append(bb, ss);
      statsEl.appendChild(el);
    });
  }

  function switchLens(next) {
    if (next === lens) return;
    lens = next;
    syncUrl();
    hovered = null; showCard(null);
    lensEl.querySelectorAll('button').forEach((b) =>
      b.setAttribute('aria-pressed', b.dataset.lens === lens ? 'true' : 'false'));
    const authorMode = lens === 'authors';
    if (authorOptsEl) authorOptsEl.hidden = !authorMode;
    if (paperOptsEl) paperOptsEl.hidden = authorMode;
    if (legendPapers) legendPapers.hidden = authorMode;
    if (legendAuthors) legendAuthors.hidden = !authorMode;
    recountHubs();
    buildStats();
    seedPositions();
    reheat(320);
  }

  // ── Boot ──
  fetch('/data/anthology-atlas.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((data) => {
      readTheme();

      // Hubs: one per theme (canonical order), plus UNTAGGED if any paper or
      // author has no theme. wheel index keys the colour, kept off the theme's
      // position so the palette is stable as themes are added.
      const themeName = new Set(data.themes);
      data.themes.forEach((name, i) => {
        const h = { id: 't' + i, type: 'theme', name, wheel: i, count: 0, members: [] };
        hubs.push(h); hubById[h.id] = h;
      });
      const untaggedHub = { id: 'untagged', type: 'untagged', name: 'Untagged', wheel: 0, count: 0, members: [] };
      const idOfTheme = {};
      hubs.forEach((h) => { if (h.type === 'theme') idOfTheme[h.name] = h.id; });

      let needUntagged = false;
      const hubIdsFor = (themeList) => {
        const ids = (themeList || []).filter((t) => themeName.has(t)).map((t) => idOfTheme[t]);
        if (!ids.length) { ids.push('untagged'); needUntagged = true; }
        return ids;
      };

      papers = data.papers.map((p, i) => ({
        id: 'p' + i, type: 'paper',
        title: p.title, authors: p.authors || [], year: p.year, panel: p.panel,
        edition: p.edition, url: p.url, hasPage: !!p.hasPage, hasAbstract: !!p.hasAbstract,
        published: !!p.published, prize: !!p.prize,
        hubs: hubIdsFor(p.themes), r: p.hasPage ? 4.6 : 3.6, x: 0, y: 0, vx: 0, vy: 0,
      }));

      authors = (data.authors || []).map((a, i) => ({
        id: 'a' + i, type: 'author',
        name: a.name, url: a.url, years: a.years || [], editions: a.editions || [],
        paperIdx: a.paperIdx || [],
        paperCount: a.paperCount || 0,
        hubs: hubIdsFor(a.themes),
        // Dot radius scales with paper count, capped at 7 (floor 3 keeps the
        // hover/click target usable for one-paper authors). #1129.
        r: Math.max(3, Math.min(7, 2 + Math.sqrt(a.paperCount || 1) * 1.5)),
        coCount: 0, coPeers: [], coPeerNodes: [], x: 0, y: 0, vx: 0, vy: 0,
      }));
      if (needUntagged) { hubs.push(untaggedHub); hubById.untagged = untaggedHub; }

      // Co-author edges: resolve index pairs to author node refs, and record
      // each author's co-peers for the hover card + collaborators-only filter.
      coEdges = (data.coauthorEdges || [])
        .map((e) => ({ a: authors[e.a], b: authors[e.b], weight: e.weight }))
        .filter((e) => e.a && e.b);
      coEdges.forEach((e) => {
        e.a.coPeers.push(e.b.id); e.a.coPeerNodes.push(e.b); e.a.coCount++;
        e.b.coPeers.push(e.a.id); e.b.coPeerNodes.push(e.a); e.b.coCount++;
      });

      // Paper-to-paper edges (#1188): resolve index pairs to paper node refs.
      paperEdges = (data.paperEdges || [])
        .map((e) => ({ a: papers[e.a], b: papers[e.b], weight: e.weight }))
        .filter((e) => e.a && e.b);

      yearsAsc = data.years.slice().sort((a, b) => a - b);
      editions = data.editions || [];

      editions.forEach((e) => activeEditions.add(e.key));
      hubs.forEach((h) => activeHubs.add(h.id));
      // Deep link (#1151): restore lens/years/themes/collab from the URL
      // before the chips render, so their pressed state matches.
      const urlLens = applyUrlState();

      recountHubs();
      buildStats();
      buildEditionChips();
      buildThemeChips();
      bulkRefreshers.push(buildBulk(
        yearsBulkEl,
        (on) => setAllChips(yearsEl, activeEditions, editions.map((e) => e.key), on),
        () => activeEditions.size === editions.length,
        () => activeEditions.size === 0));
      bulkRefreshers.push(buildBulk(
        themesBulkEl,
        (on) => setAllChips(themesEl, activeHubs, hubs.map((h) => h.id), on),
        () => activeHubs.size === hubs.length,
        () => activeHubs.size === 0));
      if (filtersClearEl) {
        filtersClearEl.addEventListener('click', (e) => {
          // The button lives inside the <summary>, so its click would
          // otherwise toggle the disclosure on the way up.
          e.preventDefault();
          e.stopPropagation();
          setAllChips(yearsEl, activeEditions, editions.map((x) => x.key), true);
          setAllChips(themesEl, activeHubs, hubs.map((h) => h.id), true);
          announce('Filters cleared. The whole corpus is on the map.');
        });
      }
      buildLensChips();
      buildAuthorOpts();
      buildPaperOpts();

      // Collapse the filter rows on load, at every width (#1430). Phones got
      // this in #1191; a 1280x900 desktop had the same problem, with 12
      // edition chips and 18 theme chips putting the top of the map at
      // y=1074 on a first visit. The summary carries the active-filter count,
      // and the no-JS case keeps the markup's `open`.
      if (filtersEl) filtersEl.open = false;
      updateFilterSummary();

      resize();
      seedPositions();
      updateZoomUi();
      reheat(320);
      if (urlLens) switchLens(urlLens);

      // Find control (#1154): options, events, and the find= deep link.
      buildFindOptions();
      if (findEl) {
        findEl.addEventListener('change', () => applyFind(findEl.value));
        findEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFind(findEl.value); });
        findEl.addEventListener('input', () => {
          setFindMsg('');
          if (!findEl.value.trim() && (spotlight || spotlightSet)) {
            spotlight = null; spotlightSet = null; syncUrl(); draw();
          }
        });
        const sp = new URL(location.href).searchParams;
        const urlAuthor = sp.get('author');
        const urlFind = sp.get('find');
        if (urlAuthor) {
          const a = authors.find((x) => x.name === urlAuthor)
            || authors.find((x) => x.name.toLowerCase() === urlAuthor.toLowerCase());
          if (a) showAuthorPapers(a);
        } else if (urlFind) { findEl.value = urlFind; applyFind(urlFind); }
      }
    })
    .catch(() => {
      // The corpus figures moved below the map in #1430, so a failure message
      // dropped in there would sit under an empty stage, off the fold. It
      // belongs where the map should have been.
      loadFailed = true;
      statsEl.textContent = '';
      readTheme();  // the success path reads the tokens; this path never got there
      resize();
      draw();
    });

  window.addEventListener('resize', () => {
    resize(); seedPositions(); clampView(); reheat(140);
  });

  // Re-read colours on a manual theme flip (data-theme) and repaint. Year
  // colours depend on light/dark, so rebuild the ramp too.
  new MutationObserver(() => {
    readTheme();
    // Theme hub colours are fixed hexes, so only the ink/chrome tokens change.
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── Welcome strip + guided tour (#1134) ──────────────────────────────────
  // First-visit welcome strip + a coachmark tour, both keyed on the same
  // localStorage flag. The engine is the reusable window.eissTour (atlas-
  // tour.js, loaded with defer before this script); we build the step list
  // lazily at click time — viewport-aware, and filtering steps whose target
  // is hidden so "Step X of N" stays honest. Ported from the NetSec directory
  // pattern (people-directory.js). The Atlas is EN-only (#1124), so the step
  // copy is English inline rather than routed through i18n.
  const TOUR_KEY = 'eiss-atlas-tour-seen';

  function markSeen() {
    try { localStorage.setItem(TOUR_KEY, 'true'); } catch (e) {}
    if (welcomeEl) welcomeEl.hidden = true;
    // Drop the pre-paint reveal class, or the CSS override would keep the
    // dismissed strip visible despite the hidden attribute.
    document.documentElement.classList.remove('atlas-welcome');
  }

  function startTour() {
    if (!window.eissTour) return; // engine missing — fail gracefully
    if (welcomeEl) welcomeEl.hidden = true;
    // The filter rows start collapsed now (#1430), and a step whose target is
    // inside a closed <details> measures zero and gets dropped below, which
    // would quietly cost the tour its editions and themes steps. The tour is
    // the one moment the filters are the subject, so open them for it.
    if (filtersEl) filtersEl.open = true;
    // Viewport-aware split (NetSec's isPhone pattern): phones get a shorter
    // walkthrough that skips the lens-switching Authors step, whose control
    // row wraps off-screen at 375px.
    const isPhone = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    const lensStep = { target: '#atlas-lens',
      title: 'Two lenses over one archive',
      body: 'Switch between Papers — one dot per paper, coloured by edition year — and Authors — one dot per person, with co-authorship drawn on top.' };
    const themesStep = { target: '#atlas-themes',
      title: 'Spotlight a research theme',
      body: 'Each labelled hub is one research theme. Toggle a chip to fade the rest; drag a hub on the map to pull its cluster apart.' };
    const stageStep = { target: '.atlas-stage',
      title: 'Read the map',
      body: 'Solid dots have an Anthology page; hollow rings are programme entries without one yet. Hover any dot for details, and click through to the Anthology.' };
    const statsStep = { target: '#atlas-stats',
      title: 'The corpus at a glance',
      body: 'These figures are generated from the same data as the Anthology, so they update as the archive grows.' };
    const editionsStep = { target: '#atlas-years',
      title: 'Filter by edition',
      body: 'Toggle editions on and off to narrow the map — the annual conferences by year, and the joint events on their own chips. All and None do a whole row at once.' };
    const desktopSteps = [
      lensStep,
      editionsStep,
      themesStep,
      stageStep,
      { target: '#atlas-legend',
        title: 'What the markers mean',
        body: 'The legend decodes the dot styles: a landing page vs a programme-only entry, a Best Paper Prize ring, and a published version on record.' },
      statsStep,
      { target: '#atlas-authoropts', lens: 'authors',
        title: 'Collaboration, up close',
        body: '‘Collaborators only’ hides solo authors so the co-authorship clusters stand out. We’ve switched you to the Authors lens to show it.' },
    ];
    // The welcome strip used to teach the editions filter in its tip list, and
    // that list went in #1444, so the phone tour picks the step up rather than
    // letting the lesson fall between the two.
    const mobileSteps = [lensStep, editionsStep, themesStep, stageStep, statsStep];
    const rawSteps = isPhone ? mobileSteps : desktopSteps;
    // Drop steps whose target is absent/hidden/zero-size. A lens:'authors'
    // step is kept (onStep un-hides its row) as long as there are authors.
    const tourSteps = rawSteps.filter(function (s) {
      if (s.lens === 'authors') return authors.length > 0 && !!authorOptsEl;
      const el = document.querySelector(s.target);
      if (!el || el.hidden) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 || r.height > 0;
    });
    window.eissTour({
      steps: tourSteps.length ? tourSteps : rawSteps,
      labels: {
        next: 'Next', prev: 'Back', done: 'Done', skip: 'Skip',
        stepOf: 'Step %1 of %2', closeLabel: 'Close tour',
      },
      // Put the atlas in the lens each step describes, so back/forward keep the
      // right view and the Authors step's control row is visible.
      onStep: function (step) { switchLens(step.lens === 'authors' ? 'authors' : 'papers'); },
      onComplete: function () { markSeen(); switchLens('papers'); },
    }).start();
  }

  // Auto-show the strip on first visit. The inline head script already made it
  // visible pre-paint via html.atlas-welcome (so it never pops in and shifts
  // the layout); here we reconcile the real hidden attribute and retire the
  // bridging class.
  if (welcomeEl && welcomeDismiss) {
    let seen = false;
    try { seen = localStorage.getItem(TOUR_KEY) === 'true'; } catch (e) {}
    if (!seen) welcomeEl.hidden = false;
    document.documentElement.classList.remove('atlas-welcome');
    welcomeDismiss.addEventListener('click', markSeen);
    if (welcomeTour) welcomeTour.addEventListener('click', startTour);
  }
  // The `?` button re-opens the tour any time, even after dismissal.
  if (tourTrigger) tourTrigger.addEventListener('click', startTour);
})();
