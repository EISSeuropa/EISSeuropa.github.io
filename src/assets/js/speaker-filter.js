/* /speakers theme filter.
 *
 * Progressive enhancement: with JS off the page shows every speaker (the
 * <select> simply does nothing). With JS on, choosing a theme hides the
 * speaker entries that don't carry it, hides any letter heading left with
 * no visible entries, and shows a "no match" note if nothing remains.
 *
 * Entries carry data-themes="Theme A|Theme B"; letter rows carry
 * data-speaker-letter. Filtering is by exact theme membership (the same
 * canonical labels emitted by corpus.js).
 */
(function () {
  "use strict";
  var select = document.querySelector("[data-speaker-theme]");
  var list = document.querySelector("[data-speaker-list]");
  if (!select || !list) return;

  var noResult = document.querySelector("[data-speaker-noresult]");
  var entries = Array.prototype.slice.call(list.querySelectorAll("[data-speaker-entry]"));
  var letters = Array.prototype.slice.call(list.querySelectorAll("[data-speaker-letter]"));

  function apply(theme) {
    var anyVisible = false;
    entries.forEach(function (el) {
      var themes = (el.getAttribute("data-themes") || "").split("|");
      var show = !theme || themes.indexOf(theme) !== -1;
      el.hidden = !show;
      if (show) anyVisible = true;
    });
    // Hide a letter heading when every entry under it (up to the next
    // heading) is hidden.
    letters.forEach(function (letterEl) {
      var visible = false;
      var node = letterEl.nextElementSibling;
      while (node && !node.hasAttribute("data-speaker-letter")) {
        if (node.hasAttribute("data-speaker-entry") && !node.hidden) {
          visible = true;
          break;
        }
        node = node.nextElementSibling;
      }
      letterEl.hidden = !visible;
    });
    if (noResult) noResult.hidden = anyVisible;
  }

  select.addEventListener("change", function () {
    apply(select.value);
  });
})();
