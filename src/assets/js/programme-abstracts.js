/* Progressive disclosure for contribution abstracts in the archive programme
 * (#889). Each paper's full abstract is in the page; with JS we clamp it to a
 * short preview and let a "Read full abstract" toggle reveal the rest IN PLACE
 * (no trip to Indico). With no JS the full text simply shows and the toggle
 * stays hidden — progressive enhancement.
 *
 * Abstracts live inside <details class="programme-contribs"> ("View papers"),
 * which is closed by default, so a clamped element measures 0 height until the
 * panel opens. We therefore set each panel up on its first open.
 */
(function () {
  "use strict";

  function setup(wrap) {
    if (wrap.dataset.abstractReady) return;
    wrap.dataset.abstractReady = "1";
    var text = wrap.querySelector("[data-abstract-text]");
    var btn = wrap.querySelector("[data-abstract-toggle]");
    if (!text || !btn) return;

    wrap.classList.add("is-collapsible"); // applies the CSS line-clamp
    // If the clamped text isn't actually overflowing, it already fits — drop the
    // clamp and leave the toggle hidden.
    if (text.scrollHeight - text.clientHeight < 4) {
      wrap.classList.remove("is-collapsible");
      return;
    }
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var expanded = wrap.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      btn.textContent = expanded
        ? btn.getAttribute("data-collapse-label") || "Show less"
        : btn.getAttribute("data-expand-label") || "Read full abstract";
    });
  }

  function setupAll(root) {
    var wraps = (root || document).querySelectorAll("[data-abstract]");
    Array.prototype.forEach.call(wraps, setup);
  }

  var panels = document.querySelectorAll("details.programme-contribs");
  Array.prototype.forEach.call(panels, function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) setupAll(d);
    });
    if (d.open) setupAll(d); // already open (e.g. deep-linked / no summary collapse)
  });
}());
