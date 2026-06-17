/* Adaptive "Back" control for a paper landing page (#889, item 1).
 *
 * A paper page is reached from many entry paths (the /papers or /speakers
 * index at some filter, an event programme, a board profile, an external
 * link), so a single fixed target can't be right for everyone. Progressive
 * enhancement, three layers:
 *   1. No-JS baseline — the control is a real anchor to papers.html#paper-<slug>
 *      (set in the template). Crawlers and no-JS readers get a working link.
 *   2. Same-origin history — if the referrer is same-origin and there's history
 *      to go back to, intercept the click and call history.back(). That returns
 *      the reader to their EXACT prior scroll + filter state (the index mirrors
 *      year/theme/published/view in the URL and restores it), for free.
 *   3. Referrer-aware label — relabel to name the real destination when the
 *      referrer is a page we recognise; otherwise a neutral "Back".
 * Empty/stripped referrer (privacy settings) falls through to layer 1 unchanged.
 */
(function () {
  "use strict";
  var els = document.querySelectorAll("[data-paper-back]"); // in-article + mobile sticky
  if (!els.length) return;

  var ref = document.referrer;
  if (!ref) return; // no referrer — keep the baseline anchor + label

  var refUrl;
  try {
    refUrl = new URL(ref);
  } catch (e) {
    return;
  }
  if (refUrl.origin !== window.location.origin) return; // external — keep baseline
  if (window.history.length <= 1) return; // nothing to go back to

  var path = refUrl.pathname;

  Array.prototype.forEach.call(els, function (el) {
    // Referrer-aware label. The template supplies the paper's own conference
    // path and label, so "Back to EISS 2025" is only shown when that's truly
    // where the reader came from; the Anthology index pages collapse to one.
    var confPath = el.getAttribute("data-back-conf-path");
    var label;
    if (confPath && path === confPath) {
      label = "Back to " + (el.getAttribute("data-back-event") || "the conference");
    } else if (/\/(anthology|papers|speakers)(\.(fr|de))?\.html$/.test(path)) {
      label = el.getAttribute("data-back-anthology") || "Back to the Anthology";
    } else {
      label = el.getAttribute("data-back-generic") || "Back";
    }

    var labelEl = el.querySelector("[data-back-label]");
    if (labelEl) labelEl.textContent = label;
    else el.textContent = label;
    el.setAttribute("aria-label", label);

    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.history.back();
    });
  });
}());
