/* Paper landing page (#805): BibTeX disclosure + copy-to-clipboard.
 *
 * Progressive enhancement: with JS off the BibTeX block is simply hidden (the
 * outlet line and the DOI link still tell the visitor where it was published).
 * With JS on, "Cite (BibTeX)" reveals the entry and a Copy button puts it on
 * the clipboard.
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-bibtex-toggle]").forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    if (!box) return;
    btn.addEventListener("click", function () {
      var willOpen = box.hidden;
      box.hidden = !willOpen;
      btn.setAttribute("aria-expanded", String(willOpen));
    });
  });

  function flash(btn) {
    var prev = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(function () { btn.textContent = prev; }, 1500);
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); flash(btn); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-bibtex-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.parentElement.querySelector("pre");
      if (!pre) return;
      var text = pre.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flash(btn); }, function () { fallbackCopy(text, btn); });
      } else {
        fallbackCopy(text, btn);
      }
    });
  });
})();
