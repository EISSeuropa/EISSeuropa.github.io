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

    btn.addEventListener("click", () => {
      const next = currentEffective() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
      updateLabel();
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
