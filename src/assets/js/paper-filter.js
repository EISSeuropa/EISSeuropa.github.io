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
 *     insensitive, and every whitespace-separated word has to match
 *     somewhere in the row, so "deterrence sciences po" works);
 *   - a sort <select> reorders the list by edition (either direction) or by
 *     title, and the edition headings + jump nav step aside for the title
 *     order, where an edition anchor means nothing (#1642, #1643);
 *   - all combine (AND);
 *   - a role=status region carries the count at all times and announces a
 *     change to assistive tech (no focus move);
 *   - a Clear button resets them all;
 *   - all five controls are mirrored in the URL so a filtered view is
 *     shareable and survives Back. The served page's
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
  var sortEl = document.querySelector("[data-paper-sort]");
  var editionsNavEl = document.querySelector("[data-paper-editions]");
  var clearEl = document.querySelector("[data-paper-clear]");
  var statusEl = document.querySelector("[data-paper-status]");
  var entries = [].slice.call(list.querySelectorAll("[data-paper-entry]"));
  var headings = [].slice.call(list.querySelectorAll("[data-paper-edition]"));

  // The list as it arrives: edition headings, each followed by its papers,
  // newest edition first. Captured once, so reordering is a matter of
  // re-appending known groups rather than re-reading the DOM (#1642).
  var groups = headings.map(function (h) {
    var rows = [];
    var node = h.nextElementSibling;
    while (node && !node.hasAttribute("data-paper-edition")) {
      if (node.hasAttribute("data-paper-entry")) rows.push(node);
      node = node.nextElementSibling;
    }
    return { heading: h, rows: rows };
  });

  // Built on first use, not here: norm() is declared below, and sorting by
  // title is the order nobody starts on.
  var titleSorted = null;
  function byTitle() {
    if (!titleSorted) {
      titleSorted = entries.slice().sort(function (a, b) {
        return norm(a.getAttribute("data-sort-title"))
          .localeCompare(norm(b.getAttribute("data-sort-title")));
      });
    }
    return titleSorted;
  }

  var currentOrder = null;

  function order(sort) {
    if (sort === currentOrder) return;
    currentOrder = sort;
    var frag = document.createDocumentFragment();
    if (sort === "title") {
      byTitle().forEach(function (el) { frag.appendChild(el); });
    } else {
      var seq = sort === "edition-asc" ? groups.slice().reverse() : groups;
      seq.forEach(function (g) {
        frag.appendChild(g.heading);
        g.rows.forEach(function (el) { frag.appendChild(el); });
      });
    }
    list.appendChild(frag);
    // An edition anchor points at nothing in a title order, and a heading
    // between two unrelated titles is a false grouping.
    var byEdition = sort !== "title";
    headings.forEach(function (h) { h.hidden = !byEdition; });
    if (editionsNavEl) editionsNavEl.hidden = !byEdition;
  }

  var norm = function (s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  };

  // Every word of the query has to appear somewhere in the row, in any order
  // (#1637). data-search is title + authors + affiliations joined by spaces,
  // so a single indexOf over the whole string only ever matched one
  // contiguous run and "deterrence sciences po" found nothing.
  var tokenise = function (s) {
    var n = norm(s);
    return n ? n.split(/\s+/) : [];
  };
  var matches = function (hay, tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (hay.indexOf(tokens[i]) === -1) return false;
    }
    return true;
  };

  function apply() {
    var event = eventSel ? eventSel.value : "";
    var theme = themeSel ? themeSel.value : "";
    var pub = pubCheck && pubCheck.checked;
    var prize = prizeCheck && prizeCheck.checked;
    var q = norm(findEl && findEl.value);
    var tokens = tokenise(q);
    var sort = sortEl ? sortEl.value : "edition-desc";
    order(sort);
    var visible = 0;
    entries.forEach(function (el) {
      var okEvent = !event || el.getAttribute("data-event") === event;
      var okTheme = !theme || (el.getAttribute("data-themes") || "").split("|").indexOf(theme) !== -1;
      var okPub = !pub || el.getAttribute("data-published") === "1";
      var okPrize = !prize || el.getAttribute("data-prize") === "1";
      var okText = !q || matches(norm(el.getAttribute("data-search")), tokens);
      var show = okEvent && okTheme && okPub && okPrize && okText;
      el.hidden = !show;
      if (show) visible++;
    });
    // Hide an edition heading when every paper under it is filtered out, the
    // way speaker-filter.js already hides an empty letter (#1643).
    if (sort !== "title") {
      groups.forEach(function (g) {
        g.heading.hidden = !g.rows.some(function (el) { return !el.hidden; });
      });
    }

    var filtering = !!(event || theme || pub || prize || q);
    if (clearEl) clearEl.hidden = !filtering;
    if (statusEl) {
      // Give the "nothing matched" message presence (boxed, centred) so the
      // empty list below doesn't read as broken.
      statusEl.classList.toggle("speaker-status--empty", filtering && visible === 0);
      var d = statusEl.dataset;
      if (!filtering) {
        // The unfiltered state keeps a count rather than going blank (#1640),
        // so clearing a filter confirms the whole list came back.
        setStatus((d.msgAll || "All {n} papers").replace("{n}", visible));
      } else {
        if (visible === 0) {
          setStatus(d.msgNone || "No papers match.");
        } else {
          var tmpl = visible === 1
            ? (d.msgOne || "{n} paper")
            : (d.msgMany || "{n} papers");
          var bits = [];
          if (event && eventSel) {
            bits.push((eventSel.options[eventSel.selectedIndex].text || "").replace(/\s*\(\d+\)\s*$/, ""));
          }
          // The value is the English theme name, which is the join key. The
          // status line is prose for a reader, so it takes the option's own
          // text instead, which is localised (#1492), minus its count.
          if (theme && themeSel) {
            bits.push((themeSel.options[themeSel.selectedIndex].text || theme).replace(/\s*\(\d+\)\s*$/, ""));
          }
          if (pub && pubCheck && pubCheck.dataset.label) bits.push(pubCheck.dataset.label);
          if (prize && prizeCheck && prizeCheck.dataset.label) bits.push(prizeCheck.dataset.label);
          if (q) {
            var matchTmpl = d.msgMatching || 'matching "{q}"';
            bits.push(matchTmpl.replace("{q}", (findEl.value || "").trim()));
          }
          setStatus(
            tmpl.replace("{n}", visible) +
            (bits.length ? " · " + bits.join(" · ") : "")
          );
        }
      }
    }
  }

  // Only touch the live region when the text actually changes. The status is
  // server-rendered with the unfiltered count, so writing an identical string
  // during the load-time apply() would announce it for no reason.
  function setStatus(text) {
    if (statusEl.textContent.trim() !== text) statusEl.textContent = text;
  }

  // Mirror all five controls in the URL (shareable / Back-restorable). The
  // query used to be left out as an ephemeral accelerator, but it is the
  // control people reach for first and the one result they most want to send
  // on, so a searched view is now a shareable view like any other (#1638).
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
    if (findEl && findEl.value.trim()) url.searchParams.set("q", findEl.value.trim());
    else url.searchParams.delete("q");
    if (sortEl && sortEl.value && sortEl.value !== "edition-desc") url.searchParams.set("sort", sortEl.value);
    else url.searchParams.delete("sort");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  if (eventSel) eventSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (themeSel) themeSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (pubCheck) pubCheck.addEventListener("change", function () { syncUrl(); apply(); });
  if (prizeCheck) prizeCheck.addEventListener("change", function () { syncUrl(); apply(); });
  if (sortEl) sortEl.addEventListener("change", function () { syncUrl(); apply(); });
  // replaceState on every keystroke rather than pushState, so typing swaps the
  // current entry instead of filling the history stack.
  if (findEl) findEl.addEventListener("input", function () { syncUrl(); apply(); });
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

  // Restore all five controls from the URL on load (deep link / Back).
  function restore(param, sel) {
    if (!sel) return;
    var v = new URL(window.location.href).searchParams.get(param);
    if (v && [].some.call(sel.options, function (o) { return o.value === v; })) sel.value = v;
  }
  restore("event", eventSel);
  restore("theme", themeSel);
  restore("sort", sortEl);
  if (pubCheck && new URL(window.location.href).searchParams.get("published") === "1") pubCheck.checked = true;
  if (prizeCheck && new URL(window.location.href).searchParams.get("prize") === "1") prizeCheck.checked = true;
  var qParam = new URL(window.location.href).searchParams.get("q");
  if (findEl && qParam) findEl.value = qParam;
  apply();
})();
