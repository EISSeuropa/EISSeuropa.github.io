/* /speakers — theme + name filtering.
 *
 * Progressive enhancement: with JS off the page shows every speaker (the
 * controls simply do nothing). With JS on:
 *   - a theme <select> narrows to speakers carrying that theme;
 *   - a name search box narrows by surname/given (diacritic-insensitive);
 *   - the two combine (AND);
 *   - empty letter headings are hidden, and a role=status region announces
 *     the new count to assistive tech (no focus move);
 *   - a Clear button resets both;
 *   - the theme is mirrored in the URL (?theme=…) so a filtered view is
 *     shareable and survives Back. The served page's <link rel=canonical>
 *     stays the clean /speakers.html (the param is added client-side only),
 *     so this introduces no duplicate-content URL for crawlers.
 *
 * Entries carry data-name and data-themes="A|B"; letter rows carry
 * data-speaker-letter.
 */
(function () {
  "use strict";
  var list = document.querySelector("[data-speaker-list]");
  var themeSel = document.querySelector("[data-speaker-theme]");
  if (!list || !themeSel) return;

  var eventSel = document.querySelector("[data-speaker-event]");
  var findEl = document.querySelector("[data-speaker-find]");
  var clearEl = document.querySelector("[data-speaker-clear]");
  var statusEl = document.querySelector("[data-speaker-status]");
  var entries = [].slice.call(list.querySelectorAll("[data-speaker-entry]"));
  var letters = [].slice.call(list.querySelectorAll("[data-speaker-letter]"));

  var norm = function (s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  };

  function apply() {
    var theme = themeSel.value;
    var ev = eventSel ? eventSel.value : "";
    var q = norm(findEl && findEl.value);
    var visible = 0;
    entries.forEach(function (el) {
      var okTheme = !theme || (el.getAttribute("data-themes") || "").split("|").indexOf(theme) !== -1;
      var okEvent = !ev || (el.getAttribute("data-events") || "").split("|").indexOf(ev) !== -1;
      var okName = !q || norm(el.getAttribute("data-name")).indexOf(q) !== -1;
      var show = okTheme && okEvent && okName;
      el.hidden = !show;
      if (show) visible++;
    });
    // Hide a letter heading when no entry under it (to the next heading) shows.
    letters.forEach(function (letterEl) {
      var any = false;
      var node = letterEl.nextElementSibling;
      while (node && !node.hasAttribute("data-speaker-letter")) {
        if (node.hasAttribute("data-speaker-entry") && !node.hidden) { any = true; break; }
        node = node.nextElementSibling;
      }
      letterEl.hidden = !any;
    });

    var filtering = !!(theme || ev || q);
    if (clearEl) clearEl.hidden = !filtering;
    if (statusEl) {
      if (!filtering) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      } else {
        statusEl.hidden = false;
        var d = statusEl.dataset;
        if (visible === 0) {
          statusEl.textContent = d.msgNone || "No speakers match.";
        } else {
          var tmpl = visible === 1
            ? (d.msgOne || "{n} speaker")
            : (d.msgMany || "{n} speakers");
          var bits = [];
          if (theme) bits.push(theme);
          if (ev && eventSel) {
            bits.push(eventSel.options[eventSel.selectedIndex].text.replace(/\s*\(\d+\)\s*$/, ""));
          }
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

  // Mirror the theme in the URL (shareable / Back-restorable). Name search
  // stays out of the URL — it's an ephemeral accelerator, not a view.
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var url = new URL(window.location.href);
    if (themeSel.value) url.searchParams.set("theme", themeSel.value);
    else url.searchParams.delete("theme");
    if (eventSel && eventSel.value) url.searchParams.set("event", eventSel.value);
    else url.searchParams.delete("event");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  themeSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (eventSel) eventSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (findEl) findEl.addEventListener("input", apply);
  if (clearEl) {
    clearEl.addEventListener("click", function () {
      themeSel.value = "";
      if (eventSel) eventSel.value = "";
      if (findEl) findEl.value = "";
      syncUrl();
      apply();
      themeSel.focus();
    });
  }

  // Restore theme + event from the URL on load (deep link / Back).
  function restore(param, sel) {
    if (!sel) return;
    var v = new URL(window.location.href).searchParams.get(param);
    if (v && [].some.call(sel.options, function (o) { return o.value === v; })) sel.value = v;
  }
  restore("theme", themeSel);
  restore("event", eventSel);
  apply();
})();
