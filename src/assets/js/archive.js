/* Conference Navigator view toggle (#756) + the second view's loader (#1641).
 * ───────────────────────────────────────────────────────────────────────────
 * The page server-renders one panel, the default view (set per wrapper). The
 * other arrives as an empty placeholder carrying data-archive-src, and is
 * fetched from /fragments/anthology-<view>.<lang>.html the first time its tab
 * is activated. Shipping both cost 1,530,626 bytes for a page where half of
 * it sat behind `hidden` and `data-pagefind-ignore`.
 *
 * This wires the tablist: activating a tab loads its panel if it has not been
 * loaded, shows it, mirrors the choice in ?view= (shareable, survives Back),
 * and supports arrow-key navigation with a roving tabindex.
 *
 * Progressive enhancement is unchanged in substance: the tablist has always
 * been JS, and the non-default panel has always been `hidden`, so a reader
 * without scripting saw the default view then and sees it now.
 */
(function () {
  "use strict";
  var toggle = document.querySelector(".archive-toggle");
  if (!toggle) return;
  var tabs = toggle.querySelectorAll("[data-archive-tab]");
  if (!tabs.length) return;

  function panelFor(name) {
    return document.getElementById("archive-panel-" + name);
  }

  // A panel whose markup has not arrived yet. Cleared by load(), so a failed
  // fetch leaves the panel loadable and pressing the tab again retries.
  function pending(panel) {
    return !!(panel && panel.getAttribute("data-archive-src"));
  }

  function status(panel, key, fallback) {
    var el = panel.querySelector("[data-archive-status]");
    if (!el) return;
    var msg = toggle.getAttribute(key);
    el.textContent = msg || fallback;
  }

  // A <script> that arrives as parsed HTML never executes, so the panel's own
  // scripts (paper-filter, paper-export, speaker-filter) are recreated here.
  // They are plain IIFEs that bind to the list on run, and they bailed out on
  // page load because their list was not in the document yet.
  function runScripts(panel) {
    Array.prototype.forEach.call(panel.querySelectorAll("script"), function (old) {
      var fresh = document.createElement("script");
      if (old.src) fresh.src = old.src; else fresh.textContent = old.textContent;
      old.parentNode.replaceChild(fresh, old);
    });
  }

  function load(panel) {
    var src = panel.getAttribute("data-archive-src");
    if (!src) return Promise.resolve();
    // Dropped before the request, not after: two quick presses of the tab
    // would otherwise start two fetches and inject the panel twice.
    panel.removeAttribute("data-archive-src");
    return fetch(src, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var incoming = doc.getElementById(panel.id);
        if (!incoming) throw new Error("panel missing");
        panel.replaceChildren.apply(panel, Array.prototype.slice.call(incoming.childNodes));
        runScripts(panel);
        // The fragment brings the rows a deep link was aiming at, and the
        // browser resolved the URL before they existed.
        revealTarget(true);
      })
      .catch(function () {
        panel.setAttribute("data-archive-src", src);
        status(panel, "data-msg-failed", "This view could not be loaded. Press the tab again to retry.");
      });
  }

  function show(name, focusTab) {
    var target = panelFor(name);
    if (pending(target)) load(target);
    Array.prototype.forEach.call(tabs, function (tab) {
      var sel = tab.getAttribute("data-archive-tab") === name;
      tab.setAttribute("aria-selected", sel ? "true" : "false");
      tab.tabIndex = sel ? 0 : -1;
      var p = panelFor(tab.getAttribute("data-archive-tab"));
      if (p) p.hidden = !sel;
      if (sel && focusTab) tab.focus();
    });
  }

  // Honour ?view= on load if valid; otherwise leave the server-rendered default.
  try {
    var v = new URLSearchParams(location.search).get("view");
    if (v === "people" || v === "papers") show(v, false);
  } catch (e) {}

  Array.prototype.forEach.call(tabs, function (tab, i) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-archive-tab");
      show(name, false);
      try {
        var u = new URL(location.href);
        u.searchParams.set("view", name);
        history.replaceState(null, "", u);
      } catch (e) {}
    });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var step = e.key === "ArrowRight" ? 1 : tabs.length - 1;
      var next = tabs[(i + step) % tabs.length];
      next.click();
      next.focus();
    });
  });

  /* Focus-return (#889, item 4). When the reader arrives at a specific entry —
   * the Back link from a paper page, or a deep link to a person — move focus
   * to that row so keyboard and screen-reader users resume where they left
   * off rather than at the top of the page.
   *
   * The by-paper view names its row in a query parameter, `?paper=<slug>`,
   * rather than a fragment (#1641). That view is fetched now, so its rows are
   * not in the served document and 511 `#paper-` links from the paper pages
   * would have pointed at anchors a crawler, a link checker and a reader
   * without scripting could not resolve. A query parameter makes no promise
   * the document does not keep, and it matches the `?person=` deep link
   * speaker-filter.js already handles. The fragment form is still honoured,
   * for links made before this and for the by-person rows, which are still
   * server-rendered.
   *
   * On a first render the browser's native anchor scroll has already
   * positioned a fragment target and preventScroll keeps that position. A row
   * that arrived with a fetched panel, or one named by a query parameter, was
   * never positioned, so those paths pass `scroll` and do it themselves. */
  function reveal(el, scroll) {
    if (!el) return;
    if (scroll) el.scrollIntoView({ block: "center" });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
  }

  function revealTarget(scroll) {
    var h = location.hash;
    if (h && /^#(paper|person)-/.test(h)) {
      reveal(document.getElementById(h.slice(1)), scroll);
      return;
    }
    var slug;
    try {
      slug = new URLSearchParams(location.search).get("paper");
    } catch (e) {}
    if (slug) reveal(document.getElementById("paper-" + slug), true);
  }
  revealTarget(false);
  window.addEventListener("hashchange", function () { revealTarget(false); });
})();
