/* Bulk citation export for the Anthology's by-paper view (#1254).
 *
 * The by-paper filter is client-side, so there is no server-rendered file per
 * filter combination to link to. This builds one instead, from the rows the
 * filter is currently showing.
 *
 * The citation strings are NOT embedded in the page: /data/citations.json is
 * 436 KB and the by-paper view already renders 500+ rows, so it is fetched on
 * the first export click and cached for the rest of the session. Most readers
 * never export, and they should not pay for the ones who do.
 *
 * Progressive enhancement: the control ships `hidden` and this file reveals it,
 * so a no-JS reader sees no button. Their fallback is the per-paper .bib / .ris
 * sibling linked from each paper page, which needs no scripting at all.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-paper-export]");
  var list = document.querySelector("[data-paper-list]");
  if (!root || !list) return;

  var MIME = { bib: "application/x-bibtex", ris: "application/x-research-info-systems" };
  var cache = null; // slug -> { bib, ris }, fetched once

  // The rows the filter is showing, in the order the page lists them. Reading
  // the DOM rather than mirroring the filter's state keeps this file from
  // having to know how filtering works.
  function visibleSlugs() {
    var out = [];
    list.querySelectorAll("[data-paper-entry]").forEach(function (li) {
      if (li.hidden) return;
      // The row id is `paper-<slug>`; entries with no slug have no id and
      // cannot be cited, so they are skipped rather than exported blank.
      if (li.id && li.id.indexOf("paper-") === 0) out.push(li.id.slice(6));
    });
    return out;
  }

  function refresh() {
    var n = visibleSlugs().length;
    root.hidden = n === 0;
    root.querySelectorAll("[data-export-format]").forEach(function (btn) {
      btn.disabled = n === 0;
      btn.setAttribute("aria-label", btn.querySelector("[data-export-text]").textContent.trim() + " (" + n + ")");
    });
  }

  function download(fmt, text, count) {
    var blob = new Blob([text], { type: MIME[fmt] + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "eiss-anthology-" + count + "-references." + fmt;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke on the next tick: revoking synchronously can cancel the download
    // in Safari before it starts.
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  root.querySelectorAll("[data-export-format]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fmt = btn.getAttribute("data-export-format");
      var slugs = visibleSlugs();
      if (!slugs.length) return;

      var run = function () {
        var parts = slugs
          .map(function (s) { return cache[s] && cache[s][fmt]; })
          .filter(Boolean);
        // BibTeX entries are separated by a blank line; RIS records already end
        // with their own ER terminator and CRLF, so they concatenate directly.
        download(fmt, parts.join(fmt === "bib" ? "\n\n" : ""), parts.length);
        btn.disabled = false;
      };

      if (cache) return run();
      btn.disabled = true;
      fetch("/data/citations.json")
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (json) { cache = json; run(); })
        .catch(function () {
          // Leave the reader a working path rather than a dead button.
          btn.disabled = false;
          root.querySelector(".paper-export__hint").textContent =
            "Export unavailable just now. Each paper page offers its own .bib and .ris.";
        });
    });
  });

  // Track the filter. It has no event of its own, so watch the rows for the
  // hidden-attribute flips it makes.
  new MutationObserver(refresh).observe(list, {
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"],
  });
  refresh();
})();
