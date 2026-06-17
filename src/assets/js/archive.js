/* Conference Navigator view toggle (#756).
 * ───────────────────────────────────────────────────────────────────────────
 * The page ships two server-rendered panels (by-person, by-paper); one is
 * visible by default (set per wrapper: /speakers → people, /papers → papers),
 * the other carries `hidden`. This wires the tablist: clicking a tab shows its
 * panel, mirrors the choice in ?view= (shareable, survives Back), and supports
 * arrow-key navigation with a roving tabindex. With no JS the default panel
 * still renders fully — progressive enhancement.
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

  function show(name, focusTab) {
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
})();

/* Focus-return (#889, item 4). When the reader arrives at a specific entry —
 * the Back link from a paper page lands on /papers#paper-<slug>, or a deep
 * link targets a person — move focus to that row so keyboard and screen-reader
 * users resume where they left off rather than at the top of the page. The
 * browser's native anchor scroll already positions it; preventScroll keeps
 * that position so focusing doesn't jump. */
(function () {
  "use strict";
  function focusFromHash() {
    var h = location.hash;
    if (!h || !/^#(paper|person)-/.test(h)) return;
    var el = document.getElementById(h.slice(1));
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
  }
  focusFromHash();
  window.addEventListener("hashchange", focusFromHash);
})();
