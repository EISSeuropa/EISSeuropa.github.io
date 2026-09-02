/* /speakers — theme + name filtering.
 *
 * Progressive enhancement: with JS off the page shows every speaker (the
 * controls simply do nothing). With JS on:
 *   - a theme <select> narrows to speakers carrying that theme;
 *   - a name search box narrows by surname/given (diacritic-insensitive, and
 *     every whitespace-separated word has to match, so a name typed in either
 *     order finds its entry);
 *   - the two combine (AND);
 *   - empty letter headings are hidden, and a role=status region carries the
 *     count at all times, announcing a change to assistive tech (no focus
 *     move);
 *   - a Clear button resets both;
 *   - theme, event and the name query are mirrored in the URL so a filtered
 *     view is shareable and survives Back. The served page's <link rel=canonical>
 *     stays the clean /speakers.html (the param is added client-side only),
 *     so this introduces no duplicate-content URL for crawlers.
 *
 * Entries carry data-name and data-themes="key-a|key-b" (stable theme
 * keys, locale-agnostic, matched against the <option value>); letter rows
 * carry data-speaker-letter.
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

  // Every word of the query has to appear in the name, in any order (#1637).
  // A single indexOf matched one contiguous run, so a surname typed before a
  // given name found nothing.
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
    var theme = themeSel.value;
    var ev = eventSel ? eventSel.value : "";
    var q = norm(findEl && findEl.value);
    var tokens = tokenise(q);
    var visible = 0;
    entries.forEach(function (el) {
      var okTheme = !theme || (el.getAttribute("data-themes") || "").split("|").indexOf(theme) !== -1;
      var okEvent = !ev || (el.getAttribute("data-events") || "").split("|").indexOf(ev) !== -1;
      var okName = !q || matches(norm(el.getAttribute("data-name")), tokens);
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
      // Box + centre the "nothing matched" message so the empty list reads as
      // intentional, not broken.
      statusEl.classList.toggle("speaker-status--empty", filtering && visible === 0);
      var d = statusEl.dataset;
      if (!filtering) {
        // The unfiltered state keeps a count rather than going blank (#1640).
        setStatus((d.msgAll || "All {n} speakers").replace("{n}", visible));
      } else {
        if (visible === 0) {
          setStatus(d.msgNone || "No speakers match.");
        } else {
          var tmpl = visible === 1
            ? (d.msgOne || "{n} speaker")
            : (d.msgMany || "{n} speakers");
          var bits = [];
          if (theme) {
            // Use the selected option's visible (localised) label in the
            // status line, not the stable key value. Strip the count suffix.
            bits.push(themeSel.options[themeSel.selectedIndex].text.replace(/\s*\(\d+\)\s*$/, ""));
          }
          if (ev && eventSel) {
            bits.push(eventSel.options[eventSel.selectedIndex].text.replace(/\s*\(\d+\)\s*$/, ""));
          }
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

  // Mirror theme, event and the name query in the URL (shareable /
  // Back-restorable). The query used to be left out as an ephemeral
  // accelerator, but it is the control people reach for first and the one
  // result they most want to send on (#1638).
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var url = new URL(window.location.href);
    if (themeSel.value) url.searchParams.set("theme", themeSel.value);
    else url.searchParams.delete("theme");
    if (eventSel && eventSel.value) url.searchParams.set("event", eventSel.value);
    else url.searchParams.delete("event");
    if (findEl && findEl.value.trim()) url.searchParams.set("q", findEl.value.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  themeSel.addEventListener("change", function () { syncUrl(); apply(); });
  if (eventSel) eventSel.addEventListener("change", function () { syncUrl(); apply(); });
  // replaceState on every keystroke rather than pushState, so typing swaps the
  // current entry instead of filling the history stack.
  if (findEl) findEl.addEventListener("input", function () { syncUrl(); apply(); });
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

  // Restore theme, event and the name query from the URL on load (deep link /
  // Back).
  function restore(param, sel) {
    if (!sel) return;
    var v = new URL(window.location.href).searchParams.get(param);
    if (v && [].some.call(sel.options, function (o) { return o.value === v; })) sel.value = v;
  }
  restore("theme", themeSel);
  restore("event", eventSel);
  var qParam = new URL(window.location.href).searchParams.get("q");
  if (findEl && qParam) findEl.value = qParam;
  apply();

  // Deep-link to a specific person: ?person=<profile-slug> scrolls to their
  // entry and opens their papers list. Only member entries carry an id.
  var personSlug = new URL(window.location.href).searchParams.get("person");
  if (personSlug) {
    var personEl = document.getElementById("person-" + personSlug);
    if (personEl) {
      personEl.scrollIntoView({ behavior: "smooth", block: "center" });
      var det = personEl.querySelector("details.speaker-papers");
      if (det) det.open = true;
      // Move focus to the entry so keyboard and screen-reader users land on it,
      // matching the #paper-/#person- hash focus-return in archive.js (#889).
      // preventScroll keeps the centred position the scrollIntoView just set.
      if (!personEl.hasAttribute("tabindex")) personEl.setAttribute("tabindex", "-1");
      try {
        personEl.focus({ preventScroll: true });
      } catch (e) {
        personEl.focus();
      }
    }
  }
})();
