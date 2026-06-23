/* /publications — search + year filtering over the members-publications feed
 * (#718). Imports the by-paper filter pattern (paper-filter.js / #632):
 *
 * Progressive enhancement — with JS off the page shows every publication and
 * the controls do nothing. With JS on:
 *   - a search box narrows by author / title / journal (diacritic-insensitive);
 *   - a year <select> narrows to one year;
 *   - the two combine (AND);
 *   - a member group with no visible works is hidden, so the grouping stays tidy;
 *   - a role=status region announces the new count to assistive tech;
 *   - a Clear button resets both.
 *
 * Each work carries data-year and data-search (author + title + journal);
 * matching is on those attributes, not visible text, so the JS stays
 * locale-agnostic.
 */
(function () {
  "use strict";
  var list = document.querySelector("[data-pub-list]");
  if (!list) return;

  var findEl = document.querySelector("[data-pub-find]");
  var yearSel = document.querySelector("[data-pub-year]");
  var clearEl = document.querySelector("[data-pub-clear]");
  var statusEl = document.querySelector("[data-pub-status]");
  var entries = [].slice.call(list.querySelectorAll("[data-pub-entry]"));
  var groups = [].slice.call(list.querySelectorAll("[data-pub-group]"));

  var norm = function (s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  };

  function apply() {
    var year = yearSel ? yearSel.value : "";
    var q = norm(findEl && findEl.value);
    var visible = 0;
    entries.forEach(function (el) {
      var okYear = !year || el.getAttribute("data-year") === year;
      var okText = !q || norm(el.getAttribute("data-search")).indexOf(q) !== -1;
      var show = okYear && okText;
      el.hidden = !show;
      if (show) visible++;
    });
    // Collapse member groups that have no visible works left.
    groups.forEach(function (g) {
      g.hidden = !g.querySelector("[data-pub-entry]:not([hidden])");
    });

    var filtering = !!(year || q);
    if (clearEl) clearEl.hidden = !filtering;
    if (statusEl) {
      statusEl.classList.toggle("speaker-status--empty", filtering && visible === 0);
      if (!filtering) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      } else {
        statusEl.hidden = false;
        var d = statusEl.dataset;
        if (visible === 0) {
          statusEl.textContent = d.msgNone || "No publications match.";
        } else if (visible === 1) {
          statusEl.textContent = d.msgOne || "Showing 1 publication.";
        } else {
          statusEl.textContent = (d.msgMany || "Showing {n} publications.").replace("{n}", visible);
        }
      }
    }
  }

  if (findEl) findEl.addEventListener("input", apply);
  if (yearSel) yearSel.addEventListener("change", apply);
  if (clearEl) {
    clearEl.addEventListener("click", function () {
      if (findEl) findEl.value = "";
      if (yearSel) yearSel.value = "";
      apply();
      if (findEl) findEl.focus();
    });
  }
})();
