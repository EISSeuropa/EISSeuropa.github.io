/* /papers — event + theme + published + free-text filtering over the
 * cross-year paper index (#632).
 *
 * Progressive enhancement: with JS off the page shows every paper (the
 * controls simply do nothing). With JS on:
 *   - an event <select> narrows to one edition's papers (the annual EISS /
 *     ESSC conference, or a joint event such as the 2019 EISS–NDC Joint
 *     Policy Workshop that shares a year with the annual conference);
 *   - a theme <select> narrows to papers carrying that theme;
 *   - a "Published only" checkbox narrows to papers with a confirmed
 *     published version (data-published="1");
 *   - a "Prize" checkbox narrows to prize-winning papers;
 *   - a search box narrows by title / author / affiliation (diacritic-
 *     insensitive);
 *   - all combine (AND);
 *   - a role=status region announces the new count to assistive tech (no
 *     focus move);
 *   - a Clear button resets them all;
 *   - event + theme + published + prize are mirrored in the URL so a filtered
 *     view is shareable and survives Back. The served page's
 *     <link rel=canonical> stays the clean /anthology.html (the params are
 *     added client-side only), so this introduces no duplicate-content URL
 *     for crawlers.
 *
 * Entries carry data-event (the edition URL), data-themes="A|B",
 * data-published="1" (when a published version exists), data-prize="1" and
 * data-search (title + authors + affiliations). Matching is on those
 * attributes, not visible text, so the JS stays locale-agnostic.
 */
(function () {
  "use strict";
  var list = document.querySelector("[data-paper-list]");
  var eventSel = document.querySelector("[data-paper-event]");
  var themeSel = document.querySelector("[data-paper-theme]");
  if (!list || (!eventSel && !themeSel)) return;

  var findEl = document.querySelector("[data-paper-find]");
  var pubCheck = document.querySelector("[data-paper-published]");
  var prizeCheck = document.querySelector("[data-paper-prize]");
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
    var event = eventSel ? eventSel.value : "";
    var theme = themeSel ? themeSel.value : "";
    var pub = pubCheck && pubCheck.checked;
    var prize = prizeCheck && prizeCheck.checked;
    var q = norm(findEl && findEl.value);
    var visible = 0;
    entries.forEach(function (el) {
      var okEvent = !event || el.getAttribute("data-event") === event;
      var okTheme = !theme || (el.getAttribute("data-themes") || "").split("|").indexOf(theme) !== -1;
      var okPub = !pub || el.getAttribute("data-published") === "1";
      var okPrize = !prize || el.getAttribute("data-prize") === "1";
      var okText = !q || norm(el.getAttribute("data-search")).indexOf(q) !== -1;
      var show = okEvent && okTheme && okPub && okPrize && okText;
      el.hidden = !show;
      if (show) visible++;
    });

    var filtering = !!(event || theme || pub || prize || q);
    if (clearEl) clearEl.hidden = !filtering;
    if (statusEl) {
      // Give the "nothing matched" message presence (boxed, centred) so the
      // empty list below doesn't read as broken.
      statusEl.classList.toggle("speaker-status--empty", filtering && visible === 0);
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
          if (event && eventSel) {
            bits.push((eventSel.options[eventSel.selectedIndex].text || "").replace(/\s*\(\d+\)\s*$/, ""));
          }
          if (theme) bits.push(theme);
          if (pub && pubCheck && pubCheck.dataset.label) bits.push(pubCheck.dataset.label);
          if (prize && prizeCheck && prizeCheck.dataset.label) bits.push(prizeCheck.dataset.label);
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

  // Mirror event + theme + published + prize in the URL (shareable /
  // Back-restorable). Free-text search stays out of the URL — it's an
  // ephemeral accelerator.
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var url = new URL(window.location.href);
    if (eventSel && eventSel.value) url.searchParams.set("event", eventSel.value);
    else url.searchParams.delete("event");
    if (themeSel && themeSel.value) url.searchParams.set("theme", themeSel.value);
    else url.searchParams.delete("theme");
    if (pubCheck && pubCheck.checked) url.searchParams.set("published", "1");
    else url.searchParams.delete("published");
    if (prizeCheck && prizeCheck.checked) url.searchParams.set("prize", "1");
    else url.searchParams.delete("prize");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  if (eventSel) eventSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (themeSel) themeSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (pubCheck) pubCheck.addEventListener("change", function () { syncUrl(); apply(); });
  if (prizeCheck) prizeCheck.addEventListener("change", function () { syncUrl(); apply(); });
  if (findEl) findEl.addEventListener("input", apply);
  if (clearEl) {
    clearEl.addEventListener("click", function () {
      if (eventSel) eventSel.value = "";
      if (themeSel) themeSel.value = "";
      if (pubCheck) pubCheck.checked = false;
      if (prizeCheck) prizeCheck.checked = false;
      if (findEl) findEl.value = "";
      syncUrl();
      apply();
      (eventSel || themeSel).focus();
    });
  }

  // Restore event + theme + published + prize from the URL on load (deep link
  // / Back).
  function restore(param, sel) {
    if (!sel) return;
    var v = new URL(window.location.href).searchParams.get(param);
    if (v && [].some.call(sel.options, function (o) { return o.value === v; })) sel.value = v;
  }
  restore("event", eventSel);
  restore("theme", themeSel);
  if (pubCheck && new URL(window.location.href).searchParams.get("published") === "1") pubCheck.checked = true;
  if (prizeCheck && new URL(window.location.href).searchParams.get("prize") === "1") prizeCheck.checked = true;
  apply();
})();
