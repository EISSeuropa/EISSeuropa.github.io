/* /papers — year + theme + published + free-text filtering over the
 * cross-year paper index (#632).
 *
 * Progressive enhancement: with JS off the page shows every paper (the
 * controls simply do nothing). With JS on:
 *   - a year <select> narrows to one edition's papers;
 *   - a theme <select> narrows to papers carrying that theme;
 *   - a "Published only" checkbox narrows to papers with a confirmed
 *     published version (data-published="1");
 *   - a search box narrows by title / author / affiliation (diacritic-
 *     insensitive);
 *   - all four combine (AND);
 *   - a role=status region announces the new count to assistive tech (no
 *     focus move);
 *   - a Clear button resets all four;
 *   - year + theme + published are mirrored in the URL so a filtered view
 *     is shareable and survives Back. The served page's <link rel=canonical>
 *     stays the clean /papers.html (the params are added client-side only),
 *     so this introduces no duplicate-content URL for crawlers.
 *
 * Entries carry data-year, data-themes="A|B", data-published="1" (when a
 * published version exists) and data-search (title + authors + affiliations).
 * Matching is on those attributes, not visible text, so the JS stays
 * locale-agnostic.
 */
(function () {
  "use strict";
  var list = document.querySelector("[data-paper-list]");
  var yearSel = document.querySelector("[data-paper-year]");
  var themeSel = document.querySelector("[data-paper-theme]");
  if (!list || (!yearSel && !themeSel)) return;

  var findEl = document.querySelector("[data-paper-find]");
  var pubCheck = document.querySelector("[data-paper-published]");
  var clearEl = document.querySelector("[data-paper-clear]");
  var statusEl = document.querySelector("[data-paper-status]");
  var entries = [].slice.call(list.querySelectorAll("[data-paper-entry]"));

  var norm = function (s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  };

  function apply() {
    var year = yearSel ? yearSel.value : "";
    var theme = themeSel ? themeSel.value : "";
    var pub = pubCheck && pubCheck.checked;
    var q = norm(findEl && findEl.value);
    var visible = 0;
    entries.forEach(function (el) {
      var okYear = !year || el.getAttribute("data-year") === year;
      var okTheme = !theme || (el.getAttribute("data-themes") || "").split("|").indexOf(theme) !== -1;
      var okPub = !pub || el.getAttribute("data-published") === "1";
      var okText = !q || norm(el.getAttribute("data-search")).indexOf(q) !== -1;
      var show = okYear && okTheme && okPub && okText;
      el.hidden = !show;
      if (show) visible++;
    });

    var filtering = !!(year || theme || pub || q);
    if (clearEl) clearEl.hidden = !filtering;
    if (statusEl) {
      if (!filtering) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      } else {
        statusEl.hidden = false;
        var d = statusEl.dataset;
        if (visible === 0) {
          statusEl.textContent = d.msgNone || "No papers match.";
        } else {
          var tmpl = visible === 1
            ? (d.msgOne || "{n} paper")
            : (d.msgMany || "{n} papers");
          var bits = [];
          if (year) bits.push(year);
          if (theme) bits.push(theme);
          if (pub && pubCheck && pubCheck.dataset.label) bits.push(pubCheck.dataset.label);
          if (q) {
            var matchTmpl = d.msgMatching || 'matching "{q}"';
            bits.push(matchTmpl.replace("{q}", (findEl.value || "").trim()));
          }
          statusEl.textContent =
            tmpl.replace("{n}", visible) +
            (bits.length ? " · " + bits.join(" · ") : "");
        }
      }
    }
  }

  // Mirror year + theme + published in the URL (shareable / Back-restorable).
  // Free-text search stays out of the URL — it's an ephemeral accelerator.
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var url = new URL(window.location.href);
    if (yearSel && yearSel.value) url.searchParams.set("year", yearSel.value);
    else url.searchParams.delete("year");
    if (themeSel && themeSel.value) url.searchParams.set("theme", themeSel.value);
    else url.searchParams.delete("theme");
    if (pubCheck && pubCheck.checked) url.searchParams.set("published", "1");
    else url.searchParams.delete("published");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  if (yearSel) yearSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (themeSel) themeSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (pubCheck) pubCheck.addEventListener("change", function () { syncUrl(); apply(); });
  if (findEl) findEl.addEventListener("input", apply);
  if (clearEl) {
    clearEl.addEventListener("click", function () {
      if (yearSel) yearSel.value = "";
      if (themeSel) themeSel.value = "";
      if (pubCheck) pubCheck.checked = false;
      if (findEl) findEl.value = "";
      syncUrl();
      apply();
      (yearSel || themeSel).focus();
    });
  }

  // Restore year + theme + published from the URL on load (deep link / Back).
  function restore(param, sel) {
    if (!sel) return;
    var v = new URL(window.location.href).searchParams.get(param);
    if (v && [].some.call(sel.options, function (o) { return o.value === v; })) sel.value = v;
  }
  restore("year", yearSel);
  restore("theme", themeSel);
  if (pubCheck && new URL(window.location.href).searchParams.get("published") === "1") pubCheck.checked = true;
  apply();
})();
