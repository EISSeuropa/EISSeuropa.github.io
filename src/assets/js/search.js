// Site search, powered by Pagefind.
//
// The search index (/pagefind/pagefind.js + wasm shards) is generated at
// deploy time by `pagefind --site _site`, so it only exists on the
// published site. On local dev the import fails and the modal shows the
// "unavailable" notice rather than throwing. The header trigger and the
// keyboard shortcuts (Cmd/Ctrl-K, "/") still open the modal locally so the
// chrome can be checked, they just can't return results without the index.
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
  };

  const setStatus = (message) => {
    statusEl.textContent = message || "";
  };

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
    data.forEach((d) => {
      const li = document.createElement("li");
      li.className = "search-result";
      li.setAttribute("role", "option");

      const a = document.createElement("a");
      a.className = "search-result-link";
      a.href = d.url;

      const meta = d.meta || {};

      // People results (bio stubs) carry a headshot + role as Pagefind
      // metadata; render a thumbnail and a role pill. Other pages have
      // neither and render as before.
      if (meta.image) {
        const img = document.createElement("img");
        img.className = "search-result-thumb";
        img.src = meta.image;
        img.alt = "";
        img.loading = "lazy";
        a.appendChild(img);
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

      a.appendChild(body);
      li.appendChild(a);
      frag.appendChild(li);
    });
    resultsEl.appendChild(frag);
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

  const open = () => {
    if (!overlay.hidden) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("search-open");
    // Warm the index as soon as the modal opens, before the first keystroke.
    loadPagefind();
    requestAnimationFrame(() => input.focus());
  };

  const close = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("search-open");
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
