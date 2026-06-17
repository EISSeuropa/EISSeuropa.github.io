/* Paper landing page citation export (#805).
 *
 * Every paper page carries a "Cite this paper" block: copy the BibTeX, or
 * download a .bib or .ris file. RIS is the format Zotero, Mendeley, EndNote
 * and RefWorks import on open, so the download is the friendly path; the copy
 * stays for LaTeX users. The citation describes the published version when one
 * is confirmed, else the conference presentation itself.
 *
 * Progressive enhancement: the control row is rendered hidden and this script
 * reveals it, so with no JS the buttons never appear as dead ends — and the
 * page's citation_* metadata still lets reference-manager browser connectors
 * save the record without any button at all.
 */
(function () {
  "use strict";

  // Reveal the control rows now that JS is running.
  document.querySelectorAll("[data-cite]").forEach(function (row) {
    row.hidden = false;
  });

  // Show / hide the BibTeX entry.
  document.querySelectorAll("[data-cite-toggle]").forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    if (!box) return;
    btn.addEventListener("click", function () {
      var willOpen = box.hidden;
      box.hidden = !willOpen;
      btn.setAttribute("aria-expanded", String(willOpen));
      var label = btn.querySelector("[data-cite-toggle-label]");
      if (label) label.textContent = willOpen ? "Hide BibTeX" : "Show BibTeX";
    });
  });

  function flash(btn, msg) {
    var label = btn.querySelector("[data-cite-label]") || btn;
    var prev = label.textContent;
    label.textContent = msg;
    setTimeout(function () { label.textContent = prev; }, 1500);
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); flash(btn, "Copied"); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-bibtex-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.parentElement.querySelector("pre");
      if (!pre) return;
      var text = pre.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flash(btn, "Copied"); }, function () { fallbackCopy(text, btn); });
      } else {
        fallbackCopy(text, btn);
      }
    });
  });

  // Download a .bib / .ris file, built client-side from the page (a Blob), so
  // no per-paper files need shipping. The OS file association opens the
  // reader's reference manager.
  var MIME = { bib: "application/x-bibtex", ris: "application/x-research-info-systems" };
  document.querySelectorAll("[data-cite-download]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fmt = btn.getAttribute("data-cite-download");
      var name = btn.getAttribute("data-cite-name") || "citation";
      var text;
      if (fmt === "ris") {
        text = btn.getAttribute("data-cite-ris") || "";
      } else {
        var section = btn.closest(".paper-cite");
        var pre = section && section.querySelector("[data-cite-bibtex]");
        text = pre ? pre.innerText : "";
      }
      if (!text) return;
      try {
        var blob = new Blob([text], { type: (MIME[fmt] || "text/plain") + ";charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = name + "." + fmt;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } catch (e) { /* no-op */ }
    });
  });
}());
