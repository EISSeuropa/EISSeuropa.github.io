/* Public roadmap progress bars + next-up promotion.
 *
 * Reads /data/roadmap-progress.json (closed / total issues per GitHub
 * milestone, refreshed by scripts/sync-roadmap-progress.py via the
 * roadmap-progress workflow) and, for each in-flight roadmap card
 * carrying data-milestone="vX.Y.Z":
 *   1. injects a progress bar (closed / total),
 *   2. promotes the first still-"planned" version card to "In progress".
 *
 * Pure progressive enhancement: if the fetch fails or JS is off, the
 * cards still render, just without bars. All copy is passed in from
 * the server via data-* attributes so this file stays locale-agnostic.
 */
(function () {
  "use strict";

  var section = document.querySelector(".rm-section[data-roadmap-progress]");
  if (!section) return;

  var url = section.getAttribute("data-roadmap-progress");
  var tpl = section.getAttribute("data-progress-tpl") || "{closed} / {total}";
  var inProgressLabel = section.getAttribute("data-inprogress-label") || "In progress";

  fetch(url, { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("roadmap-progress " + r.status);
      return r.json();
    })
    .then(function (data) {
      var milestones = (data && data.milestones) || {};
      var cards = Array.prototype.slice.call(
        section.querySelectorAll(".rm-card[data-milestone]")
      );
      var promoted = false;

      cards.forEach(function (card) {
        var key = card.getAttribute("data-milestone");
        var m = milestones[key];
        var entry = card.closest(".rm-entry");

        // Promote the first still-planned version card to "In progress".
        if (!promoted && entry && entry.classList.contains("planned")) {
          entry.classList.remove("planned");
          entry.classList.add("in-progress");
          var pill = card.querySelector(".rm-pill");
          if (pill) {
            pill.classList.remove("planned");
            pill.classList.add("in-progress");
            // Preserve the leading dot, replace the trailing text node.
            var dot = pill.querySelector(".rm-dot");
            pill.textContent = "";
            if (dot) pill.appendChild(dot);
            pill.appendChild(document.createTextNode(inProgressLabel));
          }
          promoted = true;
        }

        if (!m || !m.total || m.percent === null || m.percent === undefined) return;

        var pct = Math.max(0, Math.min(100, Math.round(m.percent)));
        var label = tpl
          .replace("{closed}", m.closed)
          .replace("{total}", m.total);

        var wrap = document.createElement("div");
        wrap.className = "rm-progress";
        wrap.setAttribute("role", "progressbar");
        wrap.setAttribute("aria-valuemin", "0");
        wrap.setAttribute("aria-valuemax", "100");
        wrap.setAttribute("aria-valuenow", String(pct));
        wrap.setAttribute("aria-label", label);

        var track = document.createElement("div");
        track.className = "rm-progress-track";
        var fill = document.createElement("div");
        fill.className = "rm-progress-fill";
        fill.style.width = pct + "%";
        track.appendChild(fill);

        var text = document.createElement("span");
        text.className = "rm-progress-label";
        text.textContent = label;

        wrap.appendChild(track);
        wrap.appendChild(text);
        card.appendChild(wrap);
      });
    })
    .catch(function () {
      /* Network or parse error: leave the cards bar-less. */
    });
})();
