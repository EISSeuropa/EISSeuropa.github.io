/* Guided-tour engine — window.eissTour({steps, labels, onStep, onComplete})
   ────────────────────────────────────────────────────────────────────────
   A self-contained, dependency-free coachmark walkthrough. Ported from the
   NetSec directory's netsecTour engine (netsec.github.io assets/js/site.js,
   #1394) and renamed for EISS; the Anthology Atlas wires it up in
   anthology-atlas.js (#1134). Kept generic so any page could reuse it.

   Each `step` is { target, title, body, scroll?, lens? }:
     - target : CSS selector for the element to spotlight.
     - title  : short heading shown above the body.
     - body   : one or two short sentences.
     - scroll : optional bool — scroll the target into view before positioning
                (for targets below the fold).
     - lens   : optional opaque value handed back to onStep(step) so the page
                can put itself in the right state (e.g. switch the atlas lens
                and un-hide a lens-specific control) before the step renders.

   `labels` carries the localised UI strings: next / prev / done / skip /
   stepOf (e.g. "Step 2 of 5") / closeLabel. The engine never synthesises
   copy; everything visible comes from labels.

   `onStep(step, idx)` fires at the top of each render, before the target is
   measured — the hook the atlas uses to switch lens for a lens-specific step.
   `onComplete(reason)` fires when the user finishes or skips ('done'|'skip')
   — the caller sets localStorage so the first-visit welcome strip stays
   dismissed.

   Behaviour: dimming backdrop + glowing spotlight ring + tooltip card with
   Prev / Skip / Next(Done). Tooltip flips above/below to stay in view; full
   width minus a 12px margin on narrow viewports. Focus trap keeps Tab inside
   the tooltip. Enter advances, Esc skips, Left/Right step. prefers-reduced-
   motion is handled in the stylesheet (transitions are pure CSS). Resize and
   scroll reposition. A step whose target resolves to nothing (or is hidden)
   is skipped silently so the tour keeps going. */
(function () {
  'use strict';

  function eissTour(config) {
    const steps = (config && config.steps) || [];
    const labels = Object.assign(
      { next: 'Next', prev: 'Back', done: 'Done', skip: 'Skip',
        stepOf: 'Step %1 of %2', closeLabel: 'Close tour' },
      (config && config.labels) || {}
    );
    const onStep = (config && config.onStep) || function () {};
    const onComplete = (config && config.onComplete) || function () {};

    let idx = -1;
    let backdrop = null, spotlight = null, tooltip = null;
    let prevFocus = null;
    let resizeBound = null;

    function $el(tag, cls, html) {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      if (html !== undefined) el.innerHTML = html;
      return el;
    }

    function mount() {
      backdrop  = $el('div', 'tour-backdrop');
      spotlight = $el('div', 'tour-spotlight');
      tooltip   = $el('div', 'tour-tooltip', '');
      tooltip.setAttribute('role', 'dialog');
      tooltip.setAttribute('aria-modal', 'true');
      tooltip.setAttribute('aria-live', 'polite');
      tooltip.setAttribute('aria-label', labels.closeLabel);
      document.body.appendChild(backdrop);
      document.body.appendChild(spotlight);
      document.body.appendChild(tooltip);
      // Click outside the tooltip (i.e. on the backdrop) is a skip.
      backdrop.addEventListener('click', skip);
    }

    function unmount() {
      [backdrop, spotlight, tooltip].forEach((n) => n && n.remove());
      backdrop = spotlight = tooltip = null;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', resizeBound);
      window.removeEventListener('scroll', resizeBound, true);
      if (prevFocus && typeof prevFocus.focus === 'function') {
        try { prevFocus.focus(); } catch (e) {}
      }
    }

    function start() {
      if (!steps.length) return;
      prevFocus = document.activeElement;
      mount();
      resizeBound = () => positionForStep(steps[idx]);
      window.addEventListener('resize', resizeBound);
      // Use capture so we catch any container's scroll, not only window's.
      window.addEventListener('scroll', resizeBound, true);
      document.addEventListener('keydown', onKey);
      idx = 0;
      render();
    }

    function next() {
      if (idx >= steps.length - 1) return done();
      idx++;
      render();
    }
    function prev() {
      if (idx <= 0) return;
      idx--;
      render();
    }
    function done() { unmount(); onComplete('done'); }
    function skip() { unmount(); onComplete('skip'); }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); return skip(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); return next();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); return prev();
      }
      // Focus trap: keep Tab inside the tooltip's buttons.
      if (e.key === 'Tab' && tooltip) {
        const focusables = tooltip.querySelectorAll('button');
        if (!focusables.length) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }

    // True when the element sits comfortably within the viewport, below the
    // fixed nav and above the fold, so the tour need not scroll to it.
    function isTargetInView(el) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false;
      const nav = document.querySelector('.nav');
      const navBottom = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
      return r.top >= navBottom + 8 && r.bottom <= window.innerHeight - 8;
    }

    function render() {
      const step = steps[idx];
      if (!step) return done();
      // Let the page put itself in the state this step describes (switch the
      // atlas lens, reveal a lens-specific control) before we measure.
      try { onStep(step, idx); } catch (e) {}
      const target = document.querySelector(step.target);
      if (!target || target.hidden) {
        // Target missing, or present but hidden — advance silently.
        if (idx < steps.length - 1) return next();
        return done();
      }
      // If the target sits inside a collapsed disclosure, open it so the step
      // has a real, measurable rectangle.
      const host = target.closest('details');
      if (host && !host.open) host.open = true;
      // The tour can launch from any scroll position (the "?" lives in the
      // toolbar), so always bring the target into view before positioning.
      if (isTargetInView(target)) {
        positionForStep(step);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => positionForStep(step), 360);
      }
      // Tooltip content. Buttons in DOM order: Prev → Skip → Next/Done.
      const showPrev = idx > 0;
      const isLast   = idx === steps.length - 1;
      const stepLabel = labels.stepOf
        .replace('%1', String(idx + 1)).replace('%2', String(steps.length));
      tooltip.innerHTML = '';
      const titleEl = $el('h3', 'tour-title');
      titleEl.textContent = step.title || '';
      const bodyEl = $el('p', 'tour-body');
      bodyEl.textContent = step.body || '';
      const footerEl = $el('div', 'tour-footer');
      const progress = $el('span', 'tour-progress');
      progress.textContent = stepLabel;
      const actions = $el('div', 'tour-actions');
      if (showPrev) {
        const b = $el('button', 'tour-btn tour-btn-ghost');
        b.type = 'button'; b.textContent = labels.prev;
        b.addEventListener('click', prev);
        actions.appendChild(b);
      }
      const skipBtn = $el('button', 'tour-btn tour-btn-ghost');
      skipBtn.type = 'button'; skipBtn.textContent = labels.skip;
      skipBtn.addEventListener('click', skip);
      actions.appendChild(skipBtn);
      const nextBtn = $el('button', 'tour-btn tour-btn-primary');
      nextBtn.type = 'button';
      nextBtn.textContent = isLast ? labels.done : labels.next;
      nextBtn.addEventListener('click', isLast ? done : next);
      actions.appendChild(nextBtn);
      footerEl.appendChild(progress);
      footerEl.appendChild(actions);
      tooltip.appendChild(titleEl);
      tooltip.appendChild(bodyEl);
      tooltip.appendChild(footerEl);
      // Focus the Next/Done button so Enter advances.
      requestAnimationFrame(() => nextBtn.focus());
      // Reveal the backdrop on the first render (it mounts hidden).
      backdrop.classList.add('tour-visible');
    }

    function positionForStep(step) {
      if (!step || !tooltip || !spotlight) return;
      const target = document.querySelector(step.target);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      // Spotlight is fixed-positioned in the viewport, padded 6px so the ring
      // sits just outside the target.
      const pad = 6;
      spotlight.style.top    = (rect.top - pad) + 'px';
      spotlight.style.left   = (rect.left - pad) + 'px';
      spotlight.style.width  = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ttRect = tooltip.getBoundingClientRect();
      const ttH = ttRect.height || 180;
      const ttW = Math.min(360, vw - 24);
      tooltip.style.width = ttW + 'px';
      const gap = 14;
      const placeBelow = (rect.bottom + ttH + gap) < vh - 8;
      let top  = placeBelow ? (rect.bottom + gap) : (rect.top - ttH - gap);
      top = Math.max(8, Math.min(top, vh - ttH - 8));
      let left = rect.left + (rect.width / 2) - (ttW / 2);
      left = Math.max(12, Math.min(left, vw - ttW - 12));
      tooltip.style.top  = top + 'px';
      tooltip.style.left = left + 'px';
    }

    return { start };
  }

  window.eissTour = eissTour;
})();
