
/* --- MODULE 8: v104.0 LIGHT HOME — the home screen costs less on phones --- */
(function () {
  'use strict';
  // The home screen's own night scene (TitleDeck) paints an opaque sky over the whole screen,
  // so the game canvas underneath was drawn every frame for nothing. Skip it while the scene covers it.
  const covered = () => {
    try {
      if (UI.cur !== 'title' || G.state === 'PLAY' || !TitleDeck.on || !TitleDeck.cv) return false;
      const c = TitleDeck.cv, cs = getComputedStyle(c); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 1) return false;
      const r = c.getBoundingClientRect(); return r.left <= 1 && r.top <= 1 && r.right >= innerWidth - 1 && r.bottom >= innerHeight - 1;
    } catch (e) { return false; }
  };
  let hidden = false;
  const r0 = Smooth.render.bind(Smooth);
  Smooth.render = function (rd) {
    const skip = covered(), c = document.getElementById('c');
    if (skip !== hidden && c) { c.style.visibility = skip ? 'hidden' : ''; hidden = skip; }
    if (skip) return;
    return r0(rd);
  };

  // If the home screen still runs slowly (under ~40 frames a second for two seconds), its glass blur and glow
  // are turned off there: the look stays, only the frosted backgrounds and soft shadows go. Once per session.
  const st = document.createElement('style');
  st.textContent = 'body.lighthome #s-title *,body.lighthome #s-title *::before,body.lighthome #s-title *::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;text-shadow:none!important}';
  document.head.appendChild(st);
  let n = 0, t0 = 0, done = false;
  const watch = ts => {
    if (done) return;
    if (UI.cur === 'title' && !document.hidden) {
      if (!t0) { t0 = ts; n = 0; } n++;
      if (ts - t0 > 2000) { const fps = n * 1000 / (ts - t0); if (fps < 40) { document.body.classList.add('lighthome'); done = true; window.__lightHome = Math.round(fps); return; } t0 = ts; n = 0; }
    } else t0 = 0;
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);
})();
