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
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
