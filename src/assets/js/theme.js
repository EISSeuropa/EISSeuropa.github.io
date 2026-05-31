(() => {
  const STORAGE_KEY = "eiss-theme";
  const root = document.documentElement;

  const applyTheme = (value) => {
    if (value === "light" || value === "dark") {
      root.setAttribute("data-theme", value);
    } else {
      root.removeAttribute("data-theme");
    }
  };

  const stored = (() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  })();
  applyTheme(stored);

  const currentEffective = () => {
    const attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const init = () => {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    const updateLabel = () => {
      const next = currentEffective() === "dark" ? "light" : "dark";
      btn.setAttribute("aria-label", `Switch to ${next} theme`);
      btn.setAttribute("title", `Switch to ${next} theme`);
    };
    updateLabel();

    // Theme-toggle handler. When the View Transitions API is available
    // (Chrome 111+, Safari 18+), wrap the swap in startViewTransition()
    // so the browser cross-fades between the old and new themes. Other
    // browsers fall back to the instant attribute swap — same end
    // state, just no animation. Respects prefers-reduced-motion: when
    // the user has asked for less motion we skip the transition wrapper
    // unconditionally.
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    btn.addEventListener("click", () => {
      const next = currentEffective() === "dark" ? "light" : "dark";
      const doSwap = () => {
        applyTheme(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
        updateLabel();
      };
      if (document.startViewTransition && !reducedMotion.matches) {
        document.startViewTransition(doSwap);
      } else {
        doSwap();
      }
    });

    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (!root.getAttribute("data-theme")) updateLabel();
    });

    const menuBtn = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (menuBtn && menu) {
      menuBtn.addEventListener("click", () => {
        const open = menu.getAttribute("data-open") === "true";
        menu.setAttribute("data-open", String(!open));
        menuBtn.setAttribute("aria-expanded", String(!open));
      });
      menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          menu.setAttribute("data-open", "false");
          menuBtn.setAttribute("aria-expanded", "false");
        })
      );
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* Bio Read-more toggle on /board. The bio paragraph is line-clamped
   to 3 lines via CSS by default; this script flips a data attribute
   on the wrapping div that removes the clamp. Button text + aria-
   expanded swap to match. Build-time decides which bios get a toggle
   (boardSorted.js `bioIsLong` boolean) so short bios stay clean. */
(function () {
  function bindBioToggle(btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.parentElement;
      var nowExpanded = wrap.dataset.expanded !== "true";
      wrap.dataset.expanded = String(nowExpanded);
      btn.setAttribute("aria-expanded", String(nowExpanded));
      btn.textContent = nowExpanded
        ? btn.dataset.labelExpanded
        : btn.dataset.labelCollapsed;
    });
  }
  function init() {
    document.querySelectorAll(".person-bio-toggle").forEach(bindBioToggle);
  }

  // ─── YouTube lazy-embed (Issue #197) ────────────────────────────────
  // Each `.youtube-embed` block ships as a poster image + a play
  // button. The iframe is mounted only when the visitor clicks. Keeps
  // YouTube's JS, cookies, and ~500 KB of CSS off the page until the
  // visitor actively asks for the video. Privacy-enhanced via
  // youtube-nocookie.com; the poster img is the only YouTube domain
  // reached before click.
  // Read only the YouTube ID + a boolean from the DOM; construct the
  // URL in JS from a hard-coded prefix. The strict allowlist regex
  // makes `javascript:` URL injection structurally impossible even
  // if someone later wires `data-youtube-id` to a runtime source.
  // Addresses CodeQL js/xss-through-dom alert #3.
  var YT_ID_RE = /^[A-Za-z0-9_-]+$/;
  var YT_BASE = "https://www.youtube-nocookie.com/embed/";
  function mountYouTube(wrap) {
    var id = wrap.getAttribute("data-youtube-id");
    var isList = wrap.getAttribute("data-youtube-list") === "true";
    var startAt = wrap.getAttribute("data-youtube-start");
    var title = wrap.getAttribute("data-title") || "YouTube video";
    if (!id || !YT_ID_RE.test(id)) return;
    var url = isList
      ? YT_BASE + "videoseries?list=" + id + "&autoplay=1&rel=0"
      : YT_BASE + id + "?autoplay=1&rel=0";
    if (!isList && startAt && /^[0-9]+$/.test(startAt)) {
      url += "&start=" + startAt;
    }
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    wrap.innerHTML = "";
    wrap.appendChild(iframe);
    wrap.dataset.mounted = "true";
  }
  function bindYouTube(wrap) {
    var btn = wrap.querySelector(".youtube-embed-play");
    if (!btn) return;
    btn.addEventListener("click", function () { mountYouTube(wrap); });
  }
  function initYouTube() {
    document.querySelectorAll(".youtube-embed").forEach(bindYouTube);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
      initYouTube();
    });
  } else {
    init();
    initYouTube();
  }
})();

/* What's New banner — sparingly-used site-wide announcement.
   ──────────────────────────────────────────────────────────
   Reads /data/whats-new.json. If `active: true` and the visitor
   hasn't dismissed this exact `version`, renders a dismissible
   banner fixed at the top of the viewport. Dismissal is saved to
   localStorage so the visitor sees each version at most once.
   See CLAUDE.md §12 for the discipline rules (use 3-4× per year
   max; natural activation: new visible sections, live programme,
   content milestones). Silent no-op on fetch error or JSON 404. */
(function () {
  fetch("/data/whats-new.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.active || !data.version) return;
      var dismissed = null;
      try { dismissed = localStorage.getItem("eiss-whats-new-dismissed-" + data.version); } catch (e) {}
      if (dismissed) return;
      renderWhatsNewBanner(data);
    })
    .catch(function () {});

  function renderWhatsNewBanner(data) {
    var lang = (document.documentElement.lang || "en").toLowerCase().slice(0, 2);
    var headline = (data.headline && (data.headline[lang] || data.headline.en)) || "";
    if (!headline) return;
    var ctaLabel = data.cta && data.cta.i18n && (data.cta.i18n[lang] || data.cta.i18n.en);
    var rawHref = data.cta && data.cta.href;
    var ctaHref = typeof rawHref === "string"
      ? rawHref
      : (rawHref && (rawHref[lang] || rawHref.en)) || "";

    var banner = document.createElement("div");
    banner.className = "whats-new-banner";
    banner.setAttribute("role", "status");

    var sparkle = document.createElement("span");
    sparkle.className = "whats-new-sparkle";
    sparkle.setAttribute("aria-hidden", "true");
    sparkle.textContent = "✦";
    banner.appendChild(sparkle);

    var text = document.createElement("span");
    text.className = "whats-new-text";
    text.textContent = headline;
    banner.appendChild(text);

    if (ctaLabel && ctaHref) {
      var cta = document.createElement("a");
      cta.className = "whats-new-cta";
      cta.href = ctaHref;
      cta.textContent = ctaLabel;
      if (data.cta.external) {
        cta.target = "_blank";
        cta.rel = "noopener";
      }
      banner.appendChild(cta);
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "whats-new-close";
    var closeLabel = { en: "Dismiss", fr: "Fermer", de: "Schließen" }[lang] || "Dismiss";
    close.setAttribute("aria-label", closeLabel);
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    close.addEventListener("click", function () {
      try { localStorage.setItem("eiss-whats-new-dismissed-" + data.version, "1"); } catch (e) {}
      banner.classList.add("whats-new-banner--closing");
      setTimeout(function () {
        document.documentElement.style.removeProperty("--whats-new-h");
        banner.remove();
      }, 240);
    });
    banner.appendChild(close);

    document.body.insertBefore(banner, document.body.firstChild);

    var syncH = function () {
      var h = banner.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty("--whats-new-h", h + "px");
      }
      if (window.eissSyncScrollPadding) window.eissSyncScrollPadding();
    };
    syncH();
    if (document.readyState !== "complete") {
      window.addEventListener("load", syncH, { once: true });
    }
    window.addEventListener("resize", syncH, { passive: true });
    if (typeof ResizeObserver === "function") {
      try { new ResizeObserver(syncH).observe(banner); } catch (e) {}
    }
  }
})();

/* Sticky-chrome scroll offset — keep anchored headings clear of the chrome.
   ─────────────────────────────────────────────────────────────────────────
   The sticky chrome (.sticky-chrome) is variable height: the What's New
   banner shifts it down via --whats-new-h, and FR/DE pages add the beta
   ribbon. A static scroll-margin-top can't track that, so in-page anchors
   used to land under the chrome on those states. Measure the chrome's real
   rendered bottom and publish it as scroll-padding-top on <html>, recomputed
   on load, resize, and whenever the banner mounts or is dismissed (the
   banner's syncH calls window.eissSyncScrollPadding). */
(function () {
  var GAP = 12; /* px of breathing room below the chrome */
  function sync() {
    var chrome = document.querySelector(".sticky-chrome");
    var h = chrome ? chrome.getBoundingClientRect().height : 0;
    document.documentElement.style.scrollPaddingTop = (h > 0 ? h + GAP : 0) + "px";
  }
  window.eissSyncScrollPadding = sync;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }
  window.addEventListener("load", sync);
  window.addEventListener("resize", sync, { passive: true });
})();

/* Print prep for the live programme grid.

   Each session's papers (titles + presenter + co-authors) live inside a
   collapsed <details class="programme-contribs"> ("View papers"). Modern
   browsers hide closed-<details> content at the content-visibility layer,
   which the print stylesheet cannot override with `display`. The result:
   panels printed with only their chair, while roundtables (whose
   discussants render inline) printed in full — the inconsistency the
   maintainer flagged.

   Open every contributions <details> just before the browser paints the
   print/PDF output so the full panel composition appears, then restore the
   on-screen state afterwards. Covers both Chrome/Firefox (`beforeprint` /
   `afterprint`) and Safari (the `print` media-query change event). */
(function () {
  var SEL = "details.programme-contribs";
  function openForPrint() {
    document.querySelectorAll(SEL).forEach(function (d) {
      if (d.dataset.printPrev === undefined) d.dataset.printPrev = d.open ? "1" : "0";
      d.open = true;
    });
  }
  function restoreAfterPrint() {
    document.querySelectorAll(SEL).forEach(function (d) {
      if (d.dataset.printPrev === "0") d.open = false;
      delete d.dataset.printPrev;
    });
  }
  window.addEventListener("beforeprint", openForPrint);
  window.addEventListener("afterprint", restoreAfterPrint);
  if (window.matchMedia) {
    try {
      var mq = window.matchMedia("print");
      var onChange = function (e) { (e.matches ? openForPrint : restoreAfterPrint)(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    } catch (e) {}
  }
})();

/* Conference countdown. Recomputes the day count live from the target
   date in [data-countdown] so the server-rendered fallback (built daily)
   never drifts, and hides itself once the conference has started. Locale
   strings ride on data-* attributes, so this stays language-agnostic. */
(function () {
  "use strict";
  var els = document.querySelectorAll(".countdown[data-countdown]");
  if (!els.length) return;
  var now = new Date();
  var todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  Array.prototype.forEach.call(els, function (el) {
    var p = String(el.getAttribute("data-countdown")).split("-");
    if (p.length !== 3) return;
    var targetUTC = Date.UTC(+p[0], +p[1] - 1, +p[2]);
    var days = Math.round((targetUTC - todayUTC) / 86400000);
    if (days < 0) { el.hidden = true; el.style.display = "none"; return; }
    var year = el.getAttribute("data-cd-year");
    var tpl = days > 1 ? el.getAttribute("data-cd-days")
            : days === 1 ? el.getAttribute("data-cd-one")
            : el.getAttribute("data-cd-today");
    var textEl = el.querySelector(".countdown__text") || el;
    if (tpl) textEl.textContent = tpl.replace("{n}", days).replace("{year}", year);
  });
})();
