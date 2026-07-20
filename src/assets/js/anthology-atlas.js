/* The Anthology Atlas — proof of concept renderer (#1124).
   Vanilla, no dependencies. Reads /data/anthology-atlas.json (projected from
   src/_data/paperIndex.js by src/_data/anthologyAtlas.js): one deduplicated
   paper universe drawn as a bipartite map — papers ↔ the 17 research-theme
   hubs (+ an UNTAGGED hub). Multi-theme papers settle between hubs, so the
   thematic bridges of the field are visible; each paper dot is coloured by
   its edition year, so the map doubles as a field-over-time view.

   Sibling of the NetSec Atlas (atlas-poc.js), which maps *people*; this one
   maps *papers*, deliberately not a people graph (CLAUDE.md: don't rebuild
   NetSec's systems). Hand-rolled force layout, deterministic seed, DPR-aware
   canvas, dark/light read from EISS CSS variables (re-read on theme flip),
   reduced motion renders the settled layout without animating.

   Markers:
     · has an Anthology landing page → solid year-coloured dot (315/511);
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
    };
  }

  // Stable year→colour ramp: evenly spaced hues around the wheel, keyed by the
  // year's position in the ascending edition list, so it is deterministic and
  // survives a new edition being added. Lightness lifts a touch in dark mode.
  let yearColour = {};
  function buildYearColours(yearsAsc) {
    const dark = theme.dark;
    const L = dark ? 62 : 48, S = dark ? 62 : 66;
    yearColour = {};
    yearsAsc.forEach((y, i) => {
      const hue = (205 + i * 40) % 360;
      yearColour[y] = `hsl(${hue} ${S}% ${L}%)`;
    });
  }

  // ── State ──
  let hubs = [], hubById = {};
  let papers = [];
  let yearsAsc = [];
  const activeYears = new Set();   // edition years currently shown
  const activeHubs = new Set();    // theme hubs currently shown
  let hovered = null, draggingHub = null;
  let W = 0, H = 0, dpr = 1;

  function hubColour(h) { return THEME_WHEEL[h.wheel % THEME_WHEEL.length]; }

  function paperVisible(p) {
    if (!activeYears.has(p.year)) return false;
    return p.hubs.some((id) => activeHubs.has(id));
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ── Layout ──
  function seedPositions() {
    const rand = mulberry32(19172);
    const cx = W / 2, cy = H / 2;
    hubs.forEach((h, i) => {
      const ang = (i / hubs.length) * Math.PI * 2 - Math.PI / 2;
      h.x = cx + Math.cos(ang) * W * 0.36;
      h.y = cy + Math.sin(ang) * H * 0.38;
      h.r = Math.max(16, Math.sqrt(h.count) * 3.6);
    });
    papers.forEach((p) => {
      const linked = p.hubs.map((id) => hubById[id]).filter(Boolean);
      if (!linked.length) { p.x = -50; p.y = -50; p.vx = p.vy = 0; return; }
      const mx = linked.reduce((s, h) => s + h.x, 0) / linked.length;
      const my = linked.reduce((s, h) => s + h.y, 0) / linked.length;
      p.x = mx + (rand() - 0.5) * 120;
      p.y = my + (rand() - 0.5) * 120;
      p.vx = 0; p.vy = 0;
    });
  }

  function tick() {
    const visible = papers.filter((p) => p.hubs.length);
    visible.forEach((p) => {
      p.hubs.forEach((id) => {
        const h = hubById[id];
        const dx = h.x - p.x, dy = h.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const rest = h.r + 46;
        const f = (d - rest) * 0.004;
        p.vx += (dx / d) * f * 60;
        p.vy += (dy / d) * f * 60;
      });
      p.vx += (W / 2 - p.x) * 0.0004;
      p.vy += (H / 2 - p.y) * 0.0004;
    });
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
    visible.forEach((p) => {
      hubs.forEach((h) => {
        const dx = p.x - h.x, dy = p.y - h.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = h.r + 12;
        if (d < min) { p.x = h.x + (dx / d) * min; p.y = h.y + (dy / d) * min; }
      });
      p.vx *= 0.82; p.vy *= 0.82;
      p.x += p.vx * 0.016; p.y += p.vy * 0.016;
      p.x = Math.max(10, Math.min(W - 10, p.x));
      p.y = Math.max(10, Math.min(H - 10, p.y));
    });
  }

  // ── Paint ──
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const hoverIds = hovered
      ? new Set([hovered.id].concat(
          hovered.type === 'paper' ? hovered.hubs : (hovered.papers || [])))
      : null;

    // Edges: paper → each of its theme hubs.
    papers.forEach((p) => {
      if (!paperVisible(p)) return;
      const lit = hoverIds && hoverIds.has(p.id);
      p.hubs.forEach((id) => {
        const h = hubById[id];
        if (!activeHubs.has(id)) return;
        const litEdge = lit && (hovered.type === 'paper' || hovered.id === id);
        ctx.strokeStyle = hubColour(h);
        ctx.globalAlpha = litEdge ? 0.5 : (hoverIds ? 0.035 : (theme.dark ? 0.14 : 0.11));
        ctx.lineWidth = litEdge ? 1.3 : 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo((p.x + h.x) / 2 + (p.y - h.y) * 0.08,
          (p.y + h.y) / 2 + (h.x - p.x) * 0.08, h.x, h.y);
        ctx.stroke();
      });
    });
    ctx.globalAlpha = 1;

    // Papers.
    papers.forEach((p) => {
      if (!paperVisible(p)) return;
      const dim = hoverIds && !hoverIds.has(p.id);
      const r = (hovered && hovered.id === p.id) ? p.r + 2 : p.r;
      ctx.globalAlpha = dim ? 0.14 : 1;
      const col = yearColour[p.year] || theme.muted;
      if (p.hasPage) {
        // Curated: solid year-coloured dot with a crisp rim.
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.9)';
        ctx.stroke();
      } else {
        // No page yet: hollow ring, so the gap is legible against solid dots.
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = theme.dark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.5)';
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = col;
        ctx.globalAlpha = dim ? 0.14 : 0.85;
        ctx.stroke();
        ctx.globalAlpha = dim ? 0.14 : 1;
      }
      // Published version on record → subtle inner ring.
      if (p.published) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.4, r - 2), 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = theme.dark ? 'rgba(10,12,20,.75)' : 'rgba(255,255,255,.95)';
        ctx.stroke();
      }
      // Best Paper Prize → gold ring.
      if (p.prize) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 3, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = theme.warning;
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;

    // Hubs on top.
    hubs.forEach((h) => {
      const dim = (hoverIds && !hoverIds.has(h.id)) || !activeHubs.has(h.id);
      ctx.globalAlpha = dim ? 0.22 : 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fillStyle = h.type === 'untagged' ? '#8a94a6' : hubColour(h);
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
  function nodeAt(mx, my) {
    for (const h of hubs) if (Math.hypot(mx - h.x, my - h.y) <= h.r) return h;
    let best = null, bd = 13;
    for (const p of papers) {
      if (!paperVisible(p)) continue;
      const d = Math.hypot(mx - p.x, my - p.y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  function showCard(node, mx, my) {
    if (!node) { card.classList.remove('is-on'); card.setAttribute('aria-hidden', 'true'); return; }
    if (node.type !== 'paper') {
      card.replaceChildren();
      const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = node.name;
      const meta = document.createElement('div'); meta.className = 'meta';
      meta.textContent = node.count + (node.count === 1 ? ' paper' : ' papers');
      card.append(nm, meta);
    } else {
      card.replaceChildren();
      const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = node.title;
      card.append(nm);
      const meta = document.createElement('div'); meta.className = 'meta';
      const who = node.authors.length
        ? node.authors.slice(0, 3).join(', ') + (node.authors.length > 3 ? ' +' + (node.authors.length - 3) : '')
        : '';
      meta.textContent = [who, node.year].filter(Boolean).join(' · ');
      card.append(meta);
      if (node.panel) {
        const pn = document.createElement('div'); pn.className = 'panel'; pn.textContent = node.panel;
        card.append(pn);
      }
      if (node.hubs.length) {
        const pills = document.createElement('div'); pills.className = 'pills';
        node.hubs.slice(0, 3).forEach((id) => {
          const h = hubById[id];
          const s = document.createElement('span');
          s.className = 'pill';
          s.style.background = h.type === 'untagged' ? '#8a94a6' : hubColour(h);
          s.textContent = h.type === 'untagged' ? 'Untagged' : h.name;
          pills.append(s);
        });
        if (node.hubs.length > 3) {
          const s = document.createElement('span'); s.className = 'pill';
          s.style.background = theme.subtle; s.textContent = '+' + (node.hubs.length - 3);
          pills.append(s);
        }
        card.append(pills);
      }
      if (node.prize || node.published) {
        const b = document.createElement('div'); b.className = 'badges';
        if (node.prize) { const s = document.createElement('span'); s.className = 'badge-prize'; s.textContent = '★ Best Paper Prize'; b.append(s); }
        if (node.published) { const s = document.createElement('span'); s.className = 'badge-pub'; s.textContent = 'Published version'; b.append(s); }
        card.append(b);
      }
      if (node.hasPage) {
        const go = document.createElement('div'); go.className = 'go'; go.textContent = 'Read more →';
        card.append(go);
      }
    }
    const stage = canvas.parentElement.getBoundingClientRect();
    card.style.left = Math.min(mx + 16, stage.width - 300) + 'px';
    card.style.top = Math.max(8, my - 14) + 'px';
    card.classList.add('is-on');
    card.setAttribute('aria-hidden', 'false');
  }

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    if (draggingHub) { draggingHub.x = mx; draggingHub.y = my; draw(); return; }
    hovered = nodeAt(mx, my);
    canvas.classList.toggle('is-link', !!(hovered && hovered.type === 'paper' && hovered.url));
    showCard(hovered, mx, my);
    draw();
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; showCard(null); draw(); });
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    const n = nodeAt(e.clientX - r.left, e.clientY - r.top);
    if (n && n.type !== 'paper') { draggingHub = n; canvas.setPointerCapture(e.pointerId); }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (draggingHub) { draggingHub = null; return; }
    const r = canvas.getBoundingClientRect();
    const n = nodeAt(e.clientX - r.left, e.clientY - r.top);
    if (n && n.type === 'paper' && n.url) location.href = n.url;
  });

  // ── Controls ──
  function chip(label, pressed, onClick, bg) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'atlas-chip';
    if (bg) b.style.background = bg; else b.classList.add('is-plain');
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

  function buildYearChips() {
    yearsAsc.slice().reverse().forEach((y) => {
      yearsEl.appendChild(chip(String(y), activeYears.has(y), (b) => {
        if (activeYears.has(y)) activeYears.delete(y); else activeYears.add(y);
        b.setAttribute('aria-pressed', activeYears.has(y) ? 'true' : 'false');
        draw();
      }, yearColour[y]));
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
          draw();
        },
        h.type === 'untagged' ? '#8a94a6' : hubColour(h)));
    });
  }

  function buildStats(data) {
    const total = papers.length;
    const withPage = papers.filter((p) => p.hasPage).length;
    const rows = [
      ['' + total, 'papers'],
      ['' + yearsAsc.length, 'editions, ' + yearsAsc[0] + '–' + yearsAsc[yearsAsc.length - 1]],
      ['' + data.themes.length, 'research themes'],
      [withPage + ' / ' + total, 'with an Anthology page'],
    ];
    rows.forEach(([b, s]) => {
      const el = document.createElement('div');
      el.className = 'atlas-stat';
      const bb = document.createElement('b'); bb.textContent = b;
      const ss = document.createElement('span'); ss.textContent = s;
      el.append(bb, ss);
      statsEl.appendChild(el);
    });
  }

  // ── Boot ──
  fetch('/data/anthology-atlas.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((data) => {
      readTheme();

      // Hubs: one per theme (canonical order), plus UNTAGGED if any paper has
      // no theme. wheel index keys the colour, kept off the theme's position
      // so the palette is stable as themes are added.
      const themeName = new Set(data.themes);
      data.themes.forEach((name, i) => {
        const h = { id: 't' + i, type: 'theme', name, wheel: i, count: 0 };
        hubs.push(h); hubById[h.id] = h;
      });
      const untaggedHub = { id: 'untagged', type: 'untagged', name: 'Untagged', wheel: 0, count: 0 };
      const idOfTheme = {};
      hubs.forEach((h) => { if (h.type === 'theme') idOfTheme[h.name] = h.id; });

      let needUntagged = false;
      papers = data.papers.map((p, i) => {
        const hubIds = (p.themes || []).filter((t) => themeName.has(t)).map((t) => idOfTheme[t]);
        if (!hubIds.length) { hubIds.push('untagged'); needUntagged = true; }
        return {
          id: 'p' + i, type: 'paper',
          title: p.title, authors: p.authors || [], year: p.year, panel: p.panel,
          url: p.url, hasPage: !!p.hasPage, published: !!p.published, prize: !!p.prize,
          hubs: hubIds, r: p.hasPage ? 4.6 : 3.6, x: 0, y: 0, vx: 0, vy: 0,
        };
      });
      if (needUntagged) { hubs.push(untaggedHub); hubById.untagged = untaggedHub; }

      // Hub counts + reverse membership (for hover spotlight).
      hubs.forEach((h) => { h.papers = []; });
      papers.forEach((p) => p.hubs.forEach((id) => {
        if (hubById[id]) { hubById[id].count++; hubById[id].papers.push(p.id); }
      }));

      yearsAsc = data.years.slice().sort((a, b) => a - b);
      buildYearColours(yearsAsc);

      yearsAsc.forEach((y) => activeYears.add(y));
      hubs.forEach((h) => activeHubs.add(h.id));

      buildStats(data);
      buildYearChips();
      buildThemeChips();

      resize();
      seedPositions();
      reheat(320);
    })
    .catch(() => { statsEl.textContent = 'The atlas data could not be loaded.'; });

  window.addEventListener('resize', () => { resize(); seedPositions(); reheat(140); });

  // Re-read colours on a manual theme flip (data-theme) and repaint. Year
  // colours depend on light/dark, so rebuild the ramp too.
  new MutationObserver(() => {
    readTheme(); buildYearColours(yearsAsc);
    // Recolour the year chips in place to match the new ramp.
    Array.prototype.forEach.call(yearsEl.querySelectorAll('.atlas-chip'), (b, i) => {
      const y = yearsAsc.slice().reverse()[i];
      if (y != null) b.style.background = yearColour[y];
    });
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
