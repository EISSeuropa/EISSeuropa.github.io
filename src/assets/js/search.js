// Site search, powered by Pagefind.
//
// The search index (/pagefind/pagefind.js + wasm shards) is generated at
// deploy time by `pagefind --site _site`, so it only exists on the
// published site. On local dev the import fails and the modal shows the
// "unavailable" notice rather than throwing. The header trigger and the
// keyboard shortcuts (Cmd/Ctrl-K, "/") still open the modal locally so the
// chrome can be checked, they just can't return results without the index.
//
// Accessibility: the dialog is a real modal (background set `inert` while
// open, Tab trapped between the input and the close button) and the input
// is a WAI-ARIA combobox driving the results listbox via
// aria-activedescendant — Arrow/Home/End move a virtual selection, Enter
// follows the active result, and the options carry no nested focusable
// elements (the row itself is the option).
//
// Locale-aware UI strings ride on data-* attributes the layout writes from
// the i18n catalog (see the data block injected in base.njk).
(() => {
  const overlay = document.querySelector("[data-search-overlay]");
  if (!overlay) return;

  const dialog = overlay.querySelector("[data-search-dialog]");
  const input = overlay.querySelector("[data-search-input]");
  const resultsEl = overlay.querySelector("[data-search-results]");
  const statusEl = overlay.querySelector("[data-search-status]");
  const closeBtn = overlay.querySelector("[data-search-close]");
  const triggers = document.querySelectorAll("[data-search-trigger]");

  // Strings handed over by the layout. Fall back to plain English so a
  // missing data-attribute never renders an empty string.
  const strings = (() => {
    const el = document.querySelector("[data-search-strings]");
    let parsed = {};
    if (el) {
      try { parsed = JSON.parse(el.getAttribute("data-search-strings")); } catch (_) {}
    }
    return Object.assign({
      noResults: "No results found.",
      unavailable: "Search is available on the published site.",
      searching: "Searching…",
    }, parsed);
  })();

  let pagefind = null;
  let pagefindFailed = false;
  let lastFocused = null;
  let debounce = null;

  // Listbox state: the rendered option <li>s and the index of the active
  // one (-1 = none). The input owns DOM focus throughout; the active option
  // is communicated to assistive tech via aria-activedescendant.
  let options = [];
  let activeIndex = -1;

  const loadPagefind = async () => {
    if (pagefind || pagefindFailed) return pagefind;
    try {
      // Vite/Eleventy must not try to resolve this at build time; the path
      // is a runtime URL on the deployed origin.
      const mod = await import(/* @vite-ignore */ "/pagefind/pagefind.js");
      if (mod.options) {
        await mod.options({ excerptLength: 24 });
      }
      pagefind = mod;
    } catch (_) {
      pagefindFailed = true;
    }
    return pagefind;
  };

  const clearResults = () => {
    resultsEl.replaceChildren();
    options = [];
    activeIndex = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  };

  const setStatus = (message) => {
    statusEl.textContent = message || "";
  };

  // Move the virtual selection. Wraps at both ends. Keeps the active option
  // scrolled into view and mirrors the selection into aria-activedescendant
  // (the input keeps real focus, per the combobox + listbox pattern).
  const setActive = (idx) => {
    if (!options.length) return;
    if (idx < 0) idx = options.length - 1;
    else if (idx >= options.length) idx = 0;
    options.forEach((li, i) => li.setAttribute("aria-selected", i === idx ? "true" : "false"));
    activeIndex = idx;
    const el = options[idx];
    input.setAttribute("aria-activedescendant", el.id);
    el.scrollIntoView({ block: "nearest" });
  };

  const go = (url) => { if (url) window.location.assign(url); };

  const renderResults = async (results) => {
    clearResults();
    if (!results.length) {
      setStatus(strings.noResults);
      return;
    }
    setStatus("");
    // Cap the rendered set so a broad query doesn't flood the listbox.
    const top = results.slice(0, 8);
    const data = await Promise.all(top.map((r) => r.data()));
    const frag = document.createDocumentFragment();
    data.forEach((d, i) => {
      // The option IS the row — no nested <a>. ARIA forbids focusable
      // descendants inside role="option"; activation happens via Enter on
      // the active option or a click on the row.
      const li = document.createElement("li");
      li.className = "search-result";
      li.id = `search-result-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.dataset.url = d.url;

      const meta = d.meta || {};

      // People results (bio stubs) carry a headshot + role as Pagefind
      // metadata; render a thumbnail and a role pill. Only person results
      // get a thumbnail — regular pages otherwise show whatever image
      // Pagefind auto-extracts first (a board member's face on /board, a
      // speaker on /YYYY, a logo elsewhere), which reads as wrong.
      if (meta.image && meta.kind === "person") {
        const img = document.createElement("img");
        img.className = "search-result-thumb";
        img.src = meta.image;
        img.alt = "";
        img.loading = "lazy";
        li.appendChild(img);
      }

      const body = document.createElement("span");
      body.className = "search-result-body";

      const title = document.createElement("span");
      title.className = "search-result-title";
      title.textContent = meta.title ? meta.title : d.url;
      body.appendChild(title);

      if (meta.role) {
        const role = document.createElement("span");
        role.className = "search-result-role";
        role.textContent = meta.responsibility ? `${meta.role} · ${meta.responsibility}` : meta.role;
        body.appendChild(role);
      }

      const excerpt = document.createElement("span");
      excerpt.className = "search-result-excerpt";
      // Pagefind returns excerpt HTML with <mark> around the hit terms.
      excerpt.innerHTML = d.excerpt;
      body.appendChild(excerpt);

      li.appendChild(body);
      li.addEventListener("click", () => go(d.url));
      frag.appendChild(li);
      options.push(li);
    });
    resultsEl.appendChild(frag);
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");
    input.setAttribute("aria-expanded", "true");
  };

  const runQuery = async (term) => {
    const query = term.trim();
    clearResults();
    if (!query) {
      setStatus("");
      return;
    }
    const pf = await loadPagefind();
    if (!pf) {
      setStatus(strings.unavailable);
      return;
    }
    setStatus(strings.searching);
    const search = await pf.search(query);
    // A newer keystroke may have superseded this query while awaiting.
    if (input.value.trim() !== query) return;
    await renderResults(search.results);
  };

  // Focusable elements inside the dialog. Results are NOT here — they are
  // reached with the arrow keys via aria-activedescendant, not Tab.
  const focusables = () => [input, closeBtn].filter((el) => el && !el.disabled);

  // Seal the rest of the page off while the dialog is open: `inert` removes
  // it from the tab order and the accessibility tree, so aria-modal is
  // truthful and Tab can only land on the dialog's own controls.
  const setBackgroundInert = (on) => {
    Array.prototype.forEach.call(document.body.children, (el) => {
      if (el === overlay) return;
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "TEMPLATE" || tag === "NOSCRIPT") return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  const open = () => {
    if (!overlay.hidden) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("search-open");
    setBackgroundInert(true);
    input.setAttribute("aria-expanded", "false");
    // Warm the index as soon as the modal opens, before the first keystroke.
    loadPagefind();
    requestAnimationFrame(() => input.focus());
  };

  const close = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("search-open");
    setBackgroundInert(false);
    input.value = "";
    clearResults();
    setStatus("");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  triggers.forEach((btn) => btn.addEventListener("click", open));
  if (closeBtn) closeBtn.addEventListener("click", close);

  overlay.addEventListener("click", (e) => {
    // Click on the backdrop (outside the dialog) closes.
    if (!dialog.contains(e.target)) close();
  });

  input.addEventListener("input", () => {
    window.clearTimeout(debounce);
    const value = input.value;
    debounce = window.setTimeout(() => runQuery(value), 180);
  });

  // Combobox key handling on the input: move / follow the listbox selection.
  input.addEventListener("keydown", (e) => {
    if (!options.length) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive(activeIndex + 1); break;
      case "ArrowUp": e.preventDefault(); setActive(activeIndex - 1); break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(options.length - 1); break;
      case "Enter":
        if (activeIndex >= 0 && options[activeIndex]) {
          e.preventDefault();
          go(options[activeIndex].dataset.url);
        }
        break;
      default: break;
    }
  });

  // Focus trap: keep Tab within the dialog. `inert` on the background
  // already does this in modern browsers; this is the explicit belt-and-
  // braces for the wrap-around at each end.
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = focusables();
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (e) => {
    // Cmd/Ctrl-K opens from anywhere.
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      open();
      return;
    }
    // "/" opens, unless the user is typing in a field.
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
      if (!typing && overlay.hidden) {
        e.preventDefault();
        open();
      }
      return;
    }
    if (e.key === "Escape" && !overlay.hidden) {
      close();
    }
  });
})();
