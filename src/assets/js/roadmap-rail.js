/* Public roadmap quarter rail: scroll-spy + phone pinning.
 *
 * The rail is plain anchor links (.rm-rail a[href="#q2-2027"]), so it
 * works without JS and the browser's own smooth scroll does the jump.
 * This file adds two things:
 *   1. aria-current="location" on the link whose quarter is in view,
 *      keeping that chip scrolled into sight on the phone strip,
 *   2. on phones, pins the strip just under the sticky chrome. The
 *      chrome's height varies (What's New banner, beta ribbon, the
 *      header's scroll-shrink), so its bottom edge is measured and
 *      published as --rm-rail-top.
 */
(function () {
  "use strict";

  var rail = document.querySelector(".rm-rail");
  if (!rail) return;

  var list = rail.querySelector(".rm-rail-list");
  var links = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (a) {
    return document.getElementById(decodeURIComponent(a.hash.slice(1)));
  });
  var phone = window.matchMedia("(max-width: 55.99rem)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var chrome = document.querySelector(".sticky-chrome");
  var current = -1;

  rail.classList.add("rm-rail--pinned");

  function pin() {
    var bottom = chrome ? chrome.getBoundingClientRect().bottom : 0;
    rail.style.setProperty("--rm-rail-top", Math.max(0, Math.round(bottom)) + "px");
  }

  function update() {
    if (phone.matches) pin();
    // The reading line sits just below the chrome (and the strip on phones).
    var line = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) +
      (phone.matches ? rail.offsetHeight : 0) + 32;
    var idx = 0;
    targets.forEach(function (t, i) {
      if (t && t.getBoundingClientRect().top <= line) idx = i;
    });
    // At the very bottom the last section may never reach the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      idx = targets.length - 1;
    }
    if (idx === current) return;
    current = idx;
    links.forEach(function (a, i) {
      if (i === idx) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    if (phone.matches && list.scrollWidth > list.clientWidth) {
      var a = links[idx];
      list.scrollTo({
        left: a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2,
        behavior: reduce.matches ? "auto" : "smooth",
      });
    }
  }

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      update();
    });
  }

  pin();
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { pin(); current = -1; onScroll(); }, { passive: true });
  if (chrome && typeof ResizeObserver === "function") {
    try { new ResizeObserver(pin).observe(chrome); } catch (e) {}
  }
})();
