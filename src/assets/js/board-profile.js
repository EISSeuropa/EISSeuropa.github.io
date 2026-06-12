/* Board profile dialogs (/board).
 * ───────────────────────────────────────────────────────────────────────────
 * Each board card with a bio or recent publications renders a "View profile"
 * anchor pointing at a per-person <dialog id="dialog-<slug>"> holding the full
 * bio + ORCID publications + links. Without JavaScript the anchor is a plain
 * in-page link and the `.person-dialog:target` CSS rule reveals the dialog
 * inline, so the content is always reachable.
 *
 * With JavaScript, this intercepts the click and opens the dialog as a true
 * modal via showModal(): backdrop, focus trap and Esc-to-close are native.
 * The click is prevented so the URL hash is never set, which keeps the
 * `:target` inline rule from also matching while the modal is open.
 */
(function () {
  "use strict";
  if (!document.body) return;

  var triggers = document.querySelectorAll(".person-more[data-dialog]");
  if (!triggers.length) return;

  var supportsModal =
    typeof HTMLDialogElement === "function" &&
    typeof HTMLDialogElement.prototype.showModal === "function";

  // Tag the document so CSS can drop the no-JS `:target` affordance and lean on
  // the modal styling instead. Without this class the inline fallback stands.
  if (supportsModal) document.documentElement.classList.add("has-dialog");

  function close(dialog) {
    if (dialog.open) dialog.close();
  }

  Array.prototype.forEach.call(triggers, function (trigger) {
    var id = trigger.getAttribute("data-dialog");
    var dialog = document.getElementById(id);
    if (!dialog || !supportsModal) return;

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      dialog.showModal();
    });

    var closeBtn = dialog.querySelector("[data-dialog-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () { close(dialog); });
    }

    // Click on the backdrop (outside the dialog's content box) closes it.
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) {
        var r = dialog.getBoundingClientRect();
        var inside =
          e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) close(dialog);
      }
    });

    // Return focus to the trigger after the dialog closes.
    dialog.addEventListener("close", function () {
      if (typeof trigger.focus === "function") trigger.focus();
    });
  });
})();
