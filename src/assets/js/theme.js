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
    // Assigned below when the drawer exists, so the group code further
    // down can shut the drawer before opening a dropdown over it.
    let closeMenu = null;
    if (menuBtn && menu) {
      const setOpen = (open) => {
        menu.setAttribute("data-open", String(open));
        menuBtn.setAttribute("aria-expanded", String(open));
        // Lock body scroll while the drawer is open so a swipe outside it
        // doesn't scroll the page behind the menu (mirrors body.search-open
        // for the search modal). June 2026 mobile-UX audit.
        document.body.classList.toggle("nav-open", open);
      };
      closeMenu = () => setOpen(false);
      menuBtn.addEventListener("click", () => {
        setOpen(menu.getAttribute("data-open") !== "true");
      });
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
      // Escape closes the open menu and returns focus to the toggle.
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.getAttribute("data-open") === "true") {
          closeMenu();
          menuBtn.focus();
        }
      });
    }

    /* Nav dropdown groups (#1319). The `<details>` elements already open,
       close, and announce themselves without any of this — the page is
       usable with JS off. What follows adds only what a native disclosure
       has no opinion about on a menu bar: opening one group closes its
       siblings, and a click outside or Escape closes the open one.
       The exception is a group that is currently an accordion inside the
       mobile drawer, where auto-closing siblings would fight the reader.
       That is a per-element test, not a breakpoint one (#1322): the
       language menu is also a `[data-nav-group]` but lives in the bar,
       not the drawer, so on a phone it still needs Escape and
       outside-click while the nav groups beside it do not. */
    /* Carry the reader's view across a language switch (#1492).
       The switcher is server-rendered, so its hrefs are the bare page and a
       reader filtering the Anthology by theme lands on the unfiltered page
       in the other language, having lost the thing they were looking at.
       The filter state is in the query string and its values are
       language-independent by design: the edition is a programme URL and the
       theme is the English name, which is what the option values carry in
       every locale (#1492). So the whole query string travels, along with
       the fragment.

       Progressive enhancement on purpose: with JS off the links keep working
       and only lose the state, which is where they started. Untranslated
       pages point their FR/DE links at the language homepage, where a
       filter would mean nothing, so those are left alone. */
    const langLinks = Array.from(document.querySelectorAll(".lang-chip, .lang-menu-link"));
    if (langLinks.length && (location.search || location.hash)) {
      langLinks.forEach((a) => {
        const href = a.getAttribute("href") || "";
        // The fallback to a language homepage is not an equivalent of this
        // page, so it must not inherit this page's state.
        if (/^\/(index\.[a-z]{2}\.html)?$/.test(href)) return;
        a.setAttribute("href", href.split("#")[0].split("?")[0] + location.search + location.hash);
      });
    }

    const groups = Array.from(document.querySelectorAll("[data-nav-group]"));
    if (groups.length) {
      const drawerBp = matchMedia("(max-width: 880px)");
      const isAccordion = (g) => drawerBp.matches && menu !== null && menu.contains(g);
      const closeGroups = (except) => {
        groups.forEach((g) => {
          if (g !== except && !isAccordion(g)) g.open = false;
        });
      };

      groups.forEach((g) => {
        g.addEventListener("toggle", () => {
          if (!g.open || isAccordion(g)) return;
          closeGroups(g);
          // A bar dropdown and the drawer both hang off the header, so an
          // open drawer would sit underneath this panel. Shut it.
          if (closeMenu && menu.getAttribute("data-open") === "true") closeMenu();
        });
      });

      document.addEventListener("click", (e) => {
        if (!(e.target instanceof Element)) return;
        if (!e.target.closest("[data-nav-group]")) closeGroups(null);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const open = groups.find((g) => g.open && !isAccordion(g));
        if (open) {
          open.open = false;
          open.querySelector("summary").focus();
        }
      });
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
    // Minimal YouTube chrome for a seamless in-page feel: play on click
    // (autoplay), related videos limited to the same channel (rel=0),
    // reduced logo (modestbranding), no annotation cards (iv_load_policy=3),
    // inline playback on mobile (playsinline), neutral progress colour.
    var params = "autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&color=white";
    var url = isList
      ? YT_BASE + "videoseries?list=" + id + "&" + params
      : YT_BASE + id + "?" + params;
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
    // The activated facade button is gone, so move focus onto the player
    // rather than letting it fall back to <body> (keeps keyboard users oriented).
    iframe.tabIndex = -1;
    iframe.focus();
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

/* Conference film: lazy, self-hosted portrait video. The src is only set
   (and muted-autoplay started) when the video scrolls into view, so the
   ~20 MB file never downloads for visitors who don't reach it; it pauses
   off-screen. prefers-reduced-motion: no autoplay, native controls instead.
   The film is muted (no sound control). A tap or the keyboard (Space /
   Enter) toggles play/pause. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(document.querySelectorAll(".film"), function (fig) {
    var v = fig.querySelector(".film-video[data-film]");
    if (!v) return;
    var playBtn = fig.querySelector("[data-film-play]");
    var loaded = false;
    // iOS only honours muted inline autoplay if `muted` is set as a
    // property (not just the attribute) and the source is (re)loaded
    // before play(). Setting src on a preload="none" element without a
    // load() leaves Safari with nothing to play.
    function load() {
      if (loaded) return;
      loaded = true;
      v.muted = true;
      v.setAttribute("muted", "");
      v.src = v.getAttribute("data-film");
      v.load();
    }
    // `on` means the film is stopped, so the control offers Play. The button
    // is the accessible control: its name says which action it performs, and
    // unlike before it stays in the accessibility tree while the film plays,
    // which is when a pause control is actually needed (WCAG 2.2.2). CSS
    // fades it out of the picture and brings it back on hover or focus.
    function showPlay(on) {
      if (!playBtn) return;
      playBtn.hidden = false;
      playBtn.dataset.state = on ? "paused" : "playing";
      var label = on ? playBtn.dataset.labelPlay : playBtn.dataset.labelPause;
      if (label) playBtn.setAttribute("aria-label", label);
    }
    function tryPlay() {
      load();
      var p = v.play();
      // If the browser blocks muted autoplay (iOS Low Power Mode, Safari
      // policy), surface the centre play button so a tap can start it.
      if (p && p.then) { p.then(function () { showPlay(false); }, function () { showPlay(true); }); }
    }
    function toggle() { if (v.paused) { tryPlay(); } else { v.pause(); } }

    if (reduce) {
      // Native controls take over, so the overlay button would be a second
      // control for the same thing. This is the one path where it stays
      // hidden outright.
      load();
      v.controls = true;
      if (playBtn) playBtn.hidden = true;
      return;
    }

    // Keep the overlay in sync with the real play state.
    v.addEventListener("play", function () { showPlay(false); });
    v.addEventListener("pause", function () { showPlay(true); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { tryPlay(); }
          else if (!v.paused) { v.pause(); }
        });
      }, { threshold: 0.4 }).observe(v);
    } else {
      tryPlay();
    }

    // Tapping the film toggles play/pause, as a pointer convenience. The
    // keyboard and assistive-technology path is the .film-play button, which
    // is a real <button> with a name that changes with the state.
    //
    // This used to put role="button", aria-pressed and tabindex on the <video>
    // itself. ARIA does not allow role="button" there: the element has its own
    // semantics and its own interactive descendants, so a screen reader was
    // told "button" about something that is a video (#1625). Moving the
    // semantics onto the button that was already in the markup makes the
    // control valid and gives it something to announce.
    v.addEventListener("click", toggle);
    if (playBtn) {
      playBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    }
    showPlay(v.paused);
  });
})();
