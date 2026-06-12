/* Recent publications on /board cards (Issue #719).
 * ───────────────────────────────────────────────────────────────────────────
 * Each detailed board card ships an empty, hidden
 *   <div class="member-pub-recent" data-pubs-for="<slug>" data-pubs-heading="…">
 * placeholder. This script fetches /data/orcid-works.json ONCE (cached in a
 * module-level promise), the first time any such placeholder scrolls into
 * view, then fills the region for every member who has works. /board therefore
 * carries zero extra weight at first paint: no JSON, no markup, no styles fire
 * until the visitor reaches the cards.
 *
 * The lookup key is the card's slug (data-pubs-for), which person-card.njk
 * renders from the same `person.slug || slugify(name)` spine that
 * scripts/sync-orcid.py writes into the data file's `slug`. No JS slugify is
 * needed, so the two can never drift.
 *
 * If a member has no entry, or an empty works list, nothing is injected and
 * the placeholder stays hidden (no empty heading). DOIs in the data are
 * already absolute https://doi.org/… URLs.
 */
(function () {
  "use strict";
  if (!("fetch" in window) || !document.body) return;

  var placeholders = document.querySelectorAll(".member-pub-recent[data-pubs-for]");
  if (!placeholders.length) return;

  var dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch("/data/orcid-works.json", { credentials: "same-origin" })
        .then(function (r) { return r.ok ? r.json() : []; })
        .catch(function () { return []; });
    }
    return dataPromise;
  }

  function renderWork(work) {
    var li = document.createElement("li");

    var title = document.createElement("span");
    title.className = "member-pub-title";
    title.setAttribute("lang", "en");
    if (work.doi) {
      var a = document.createElement("a");
      a.href = work.doi;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = work.title || "";
      title.appendChild(a);
    } else {
      title.textContent = work.title || "";
    }
    li.appendChild(title);

    if (work.year || work.journal) {
      var meta = document.createElement("span");
      meta.className = "member-pub-meta muted";
      var parts = "";
      if (work.year) parts += work.year;
      if (work.year && work.journal) parts += " · ";
      meta.appendChild(document.createTextNode(parts));
      if (work.journal) {
        var j = document.createElement("span");
        j.setAttribute("lang", "en");
        j.textContent = work.journal;
        meta.appendChild(j);
      }
      li.appendChild(meta);
    }
    return li;
  }

  function fill(el, entry) {
    if (!entry || !entry.works || !entry.works.length) return;

    var heading = document.createElement("p");
    heading.className = "member-pub-recent-heading";
    heading.textContent = el.getAttribute("data-pubs-heading") || "Recent publications";

    var list = document.createElement("ul");
    list.className = "member-pub-works";
    list.setAttribute("role", "list");

    entry.works.slice(0, 3).forEach(function (w) {
      list.appendChild(renderWork(w));
    });

    el.appendChild(heading);
    el.appendChild(list);
    el.hidden = false;
  }

  function fillAll(data) {
    var bySlug = {};
    if (Array.isArray(data)) {
      data.forEach(function (m) { if (m && m.slug) bySlug[m.slug] = m; });
    }
    Array.prototype.forEach.call(placeholders, function (el) {
      fill(el, bySlug[el.getAttribute("data-pubs-for")]);
    });
  }

  function trigger() {
    loadData().then(fillAll);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          obs.disconnect();
          trigger();
          break;
        }
      }
    }, { rootMargin: "200px" });
    // Observe the visible card, NOT the placeholder itself: the placeholder
    // ships `hidden` (display:none), which has no layout box, so an observer
    // on it never reports an intersection and the fetch never fires. Observe
    // the enclosing `.person` card (always visible) instead.
    Array.prototype.forEach.call(placeholders, function (el) {
      io.observe(el.closest(".person") || el.parentElement || el);
    });
  } else {
    // No observer: fall back to a single deferred fetch so the feature still works.
    trigger();
  }
})();
