/* Diverse Metal Products — bespoke page behaviour.
   Everything here is page JS driven off --sc-p; the engine itself is never
   touched. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- every load starts at the top, except a #directions link --------------
  // (instant, not smooth: the page sets scroll-behavior: smooth). The map
  // jump re-runs once the pinned acts and fonts have settled their heights.
  const startPosition = () => {
    const map = window.__dmpOpenAtMap && document.getElementById('visit');
    if (map) map.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };
  startPosition();
  window.addEventListener('load', startPosition);
  if (window.__dmpOpenAtMap && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(startPosition, 50));
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted) startPosition(); });

  // ---- nav bar: solid on scroll -------------------------------------------
  const bar = document.querySelector('[data-bar]');
  if (bar) {
    const onScroll = () => bar.classList.toggle('is-solid', window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- nav rail: highlight the section in view ----------------------------
  const legs = Array.from(document.querySelectorAll('.bar__rail a[data-leg]'));
  if (legs.length && 'IntersectionObserver' in window) {
    const targets = legs
      .map((a) => ({ a, el: document.querySelector(a.getAttribute('href')) }))
      .filter((t) => t.el);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const t = targets.find((x) => x.el === entry.target);
        if (!t) return;
        if (entry.isIntersecting) {
          legs.forEach((a) => a.removeAttribute('aria-current'));
          t.a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => io.observe(t.el));
  }

  // ---- signature move: live laser-cut reveal ------------------------------
  // The kerf path is drawn live from the peak act's own --sc-p (0 to 1), read
  // directly off the section element the engine already writes it to. The cut
  // exists only at the scroll position that drew it: nothing autoplays.
  const cutAct = document.getElementById('cut');
  const kerf = document.getElementById('kerfPath');
  const plateCut = document.getElementById('plateCut');
  const laserHead = document.getElementById('laserHead');
  const dimCallout = document.getElementById('dimCallout');

  if (cutAct && kerf && plateCut && laserHead) {
    const kerfLen = kerf.getTotalLength();
    kerf.style.strokeDasharray = String(kerfLen);

    // The cut phase runs across the first 62% of the act; the part separation
    // and callouts run across the remainder, so the reader sees the cut land
    // before anything moves.
    const CUT_END = 0.62;
    const DROP_START = 0.64;

    let raf = 0;
    const render = () => {
      raf = 0;
      const p = parseFloat(cutAct.style.getPropertyValue('--sc-p')) || 0;
      const cutT = Math.min(p / CUT_END, 1);

      if (reduceMotion.matches) {
        // Reduced motion: no mid-cut frames, just "not yet" and "done".
        kerf.style.strokeDashoffset = p > 0.05 ? '0' : String(kerfLen);
        plateCut.style.opacity = p > CUT_END ? '1' : '0';
        laserHead.style.opacity = '0';
        if (dimCallout) dimCallout.classList.toggle('is-on', p > DROP_START);
        return;
      }

      kerf.style.strokeDashoffset = String(kerfLen * (1 - cutT));

      // Walk the laser head along the exact path the kerf is drawing.
      const pt = kerf.getPointAtLength(kerfLen * cutT);
      laserHead.setAttribute('cx', pt.x.toFixed(2));
      laserHead.setAttribute('cy', pt.y.toFixed(2));
      laserHead.style.opacity = cutT > 0 && cutT < 1 ? '1' : cutT >= 1 ? '0' : '0';

      // Once the path closes, the cut piece drops free.
      const dropT = Math.max(0, Math.min((p - DROP_START) / (1 - DROP_START), 1));
      plateCut.style.opacity = cutT >= 1 ? '1' : '0';
      plateCut.style.transform = `translate3d(0, ${(dropT * 26).toFixed(2)}px, 0) scale(${(1 - dropT * 0.015).toFixed(4)})`;

      if (dimCallout) dimCallout.classList.toggle('is-on', dropT > 0.15);
    };

    const queue = () => { if (!raf) raf = requestAnimationFrame(render); };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    queue();
  }

  // One resize once the window and fonts have settled, so anything measured
  // against text (line boxes, act heights) is correct after the webfont swaps in.
  function relayout() { window.dispatchEvent(new Event('resize')); }
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  // Mobile browsers (DuckDuckGo, Safari, Chrome) resize the viewport live as
  // their address bar collapses or expands during scroll. The engine
  // deliberately skips a full relayout for a height-only change on mobile, to
  // avoid jumping the page under the reader's thumb, but that leaves every
  // act's travel math stale against the new viewport height. For the LAST
  // pinned act that can mean its content's opacity cues miscompute right as
  // the reader reaches the bottom of the page, since there is no further
  // section to carry the mismatch. Force one real relayout, debounced so it
  // fires only once the address bar has actually settled.
  if (window.__sc && window.__sc.layout) {
    var relayoutTimer = 0;
    var settleRelayout = function () {
      clearTimeout(relayoutTimer);
      relayoutTimer = setTimeout(function () { window.__sc.layout(); }, 220);
    };
    window.addEventListener('resize', settleRelayout, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', settleRelayout, { passive: true });
    }
  }
})();
