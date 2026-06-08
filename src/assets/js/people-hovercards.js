/* People hovercards.
 * ───────────────────────────────────────────────────────────────────────────
 * Whenever a known People-page person's name appears in page prose, this
 * turns it into a subtle link to their profile that, on hover or keyboard
 * focus, shows a small profile card (photo, role, affiliation, "View profile").
 *
 * Systematic by construction: it loads /data/people-index.json (generated from
 * board.json via boardSorted) and scans the page itself, so ANY page — present
 * or future — that names a known person gets the behaviour with zero per-page
 * markup. Add someone to the People page and they're covered everywhere.
 *
 * Matching is deliberately conservative: exact, case-sensitive "First Last"
 * names (middle initials dropped at index time), only in body prose. It skips
 * existing links, headings of the page, nav/header/footer, code, the People
 * cards themselves, and anything inside [data-no-hovercard]. Names are matched
 * on whole-word boundaries so "…" inside a longer token never triggers.
 *
 * Opt out for a subtree: add data-no-hovercard to an ancestor element.
 */
(function () {
  "use strict";
  if (!("fetch" in window) || !document.body) return;

  var SKIP_TAGS = { A: 1, BUTTON: 1, CODE: 1, PRE: 1, KBD: 1, SCRIPT: 1, STYLE: 1, TEXTAREA: 1, OPTION: 1, H1: 1 };
  // Containers we never scan: site chrome and the People cards (which already
  // show the full profile), plus an explicit opt-out hook.
  var SKIP_CLOSEST = ".site-header, .site-footer, nav, .person, .person-hovercard, [data-no-hovercard]";

  var lang = (document.documentElement.getAttribute("lang") || "en").slice(0, 2);

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function profileUrl(person) {
    if (lang !== "en") return "/board." + lang + ".html#" + person.slug;
    return person.url;
  }

  // ── The shared hovercard element ─────────────────────────────────────────
  var card, cardImg, cardName, cardRole, cardAff, cardLink, hideTimer, activeRef;

  function buildCard() {
    card = document.createElement("div");
    card.className = "person-hovercard";
    card.setAttribute("role", "tooltip");
    card.id = "person-hovercard";
    card.hidden = true;
    card.innerHTML =
      '<div class="person-hovercard-media"></div>' +
      '<div class="person-hovercard-body">' +
      '<p class="person-hovercard-name"></p>' +
      '<p class="person-hovercard-role"></p>' +
      '<p class="person-hovercard-aff"></p>' +
      '<a class="person-hovercard-link" href="#"></a>' +
      "</div>";
    cardImg = card.querySelector(".person-hovercard-media");
    cardName = card.querySelector(".person-hovercard-name");
    cardRole = card.querySelector(".person-hovercard-role");
    cardAff = card.querySelector(".person-hovercard-aff");
    cardLink = card.querySelector(".person-hovercard-link");
    // Keep the card open while the pointer is over it (so the link is reachable).
    card.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    card.addEventListener("mouseleave", scheduleHide);
    document.body.appendChild(card);
  }

  function populate(person) {
    if (person.photo) {
      cardImg.innerHTML = "";
      cardImg.style.backgroundImage = 'url("' + person.photo + '")';
      cardImg.classList.remove("is-initials");
    } else {
      cardImg.style.backgroundImage = "";
      cardImg.classList.add("is-initials");
      cardImg.textContent = person.initials || "?";
    }
    cardName.textContent = person.name;
    cardRole.textContent = person.role || "";
    cardRole.hidden = !person.role;
    cardAff.textContent = person.affiliation || "";
    cardAff.hidden = !person.affiliation;
    cardLink.href = profileUrl(person);
    cardLink.textContent = "View profile";
  }

  function positionCard(ref) {
    // Measure off-screen first so width/height are known.
    card.hidden = false;
    var r = ref.getBoundingClientRect();
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var margin = 8;
    var left = Math.min(Math.max(margin, r.left), window.innerWidth - cw - margin);
    var top = r.bottom + margin;
    if (top + ch > window.innerHeight - margin && r.top - ch - margin > 0) {
      top = r.top - ch - margin; // flip above when no room below
    }
    card.style.left = Math.round(left + window.scrollX) + "px";
    card.style.top = Math.round(top + window.scrollY) + "px";
  }

  function show(ref) {
    clearTimeout(hideTimer);
    var person = ref._person;
    if (!person) return;
    activeRef = ref;
    populate(person);
    positionCard(ref);
    card.classList.add("is-visible");
    ref.setAttribute("aria-describedby", "person-hovercard");
  }

  function hide() {
    card.classList.remove("is-visible");
    card.hidden = true;
    if (activeRef) { activeRef.removeAttribute("aria-describedby"); activeRef = null; }
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 180);
  }

  // ── Wrap matched names into .person-ref links ────────────────────────────
  function enhance(people) {
    if (!people.length) return;
    buildCard();

    var bySorted = people.slice().sort(function (a, b) { return b.detect.length - a.detect.length; });
    var byDetect = {};
    bySorted.forEach(function (p) { byDetect[p.detect] = p; });
    var re;
    try {
      re = new RegExp(
        "(?<![\\p{L}\\p{N}])(" + bySorted.map(function (p) { return escapeRe(p.detect); }).join("|") + ")(?![\\p{L}\\p{N}])",
        "gu"
      );
    } catch (e) {
      return; // engine without lookbehind/unicode property escapes — skip silently
    }

    var root = document.querySelector("main") || document.body;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS[el.tagName]) return NodeFilter.FILTER_REJECT;
        if (el.closest(SKIP_CLOSEST)) return NodeFilter.FILTER_REJECT;
        re.lastIndex = 0;
        return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    var targets = [];
    var n;
    while ((n = walker.nextNode())) targets.push(n);

    targets.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        var person = byDetect[m[1]];
        if (!person) continue;
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var a = document.createElement("a");
        a.className = "person-ref";
        a.href = profileUrl(person);
        a.textContent = m[1];
        a._person = person;
        // Resolve the trigger from the event target (`this`), NOT a captured
        // `a` — several names can share one text node, and a `var a` closure
        // would point every handler at the LAST link created here (so every
        // name in a paragraph showed the last person's card).
        a.addEventListener("mouseenter", function () { show(this); });
        a.addEventListener("mouseleave", scheduleHide);
        a.addEventListener("focus", function () { show(this); });
        a.addEventListener("blur", scheduleHide);
        frag.appendChild(a);
        last = m.index + m[1].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    window.addEventListener("scroll", function () { if (card && card.classList.contains("is-visible")) hide(); }, { passive: true });
  }

  function init() {
    fetch("/data/people-index.json", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data && Array.isArray(data.people)) enhance(data.people); })
      .catch(function () { /* non-fatal: names just stay plain text */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
