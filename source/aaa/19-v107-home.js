
/* --- MODULE 19: v107.0 A TIDIER HOME — the story first, the rest folded away, one window at a time --- */
(function () {
  'use strict';
  // the story button sat right under the bottom navigation bar on a phone (604-700 px under a bar at 588-701):
  // it moves up under the logo, and the screen keeps room for the bar at the bottom
  const tidy = () => {
    try {
      if (UI.cur !== 'title') return;
      const L = document.querySelector('#s-title .deckL'), logo = L && L.querySelector('.logo'), st = document.getElementById('bStory');
      if (L && logo && st && logo.nextElementSibling !== st) L.insertBefore(st, logo.nextSibling);
      const nav = document.getElementById('tNav'); if (nav) document.documentElement.style.setProperty('--tnav107', Math.round(nav.getBoundingClientRect().height || 110) + 'px');
    } catch (e) { }
  };
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () { const r = ot0.apply(this, arguments); tidy(); return r; };
  Sim98.menu.push(tidy);

  // TODAY stays folded until you open it (its header already says REWARD READY); it used to open itself, 630 px tall
  const ts0 = Today.sync.bind(Today);
  Today.sync = function () {
    const r = ts0.apply(this, arguments);
    try { const box = $('tToday'), h = $('tTodayH'), s = Store.data.settings; if (box && h) { const open = !!s.today; box.classList.toggle('open', open); h.setAttribute('aria-expanded', open ? 'true' : 'false'); } } catch (e) { }
    return r;
  };

  // one window at a time: a reward card, a guide tip or a crate reveal waits for the one already on screen
  const OV = '.unlock39, .coach46';
  const waiting = [];
  const visible = except => [...document.querySelectorAll(OV)].some(e => e !== except && e.isConnected && e.style.display !== 'none' && getComputedStyle(e).display !== 'none');
  new MutationObserver(muts => {
    for (const m of muts) {
      for (const n of m.addedNodes) if (n.nodeType === 1 && n.matches && n.matches(OV) && !n.classList.contains('cr-rev') && visible(n)) { n.style.display = 'none'; waiting.push(n); }
      if (m.removedNodes.length && waiting.length && !visible()) { const n = waiting.shift(); if (n.isConnected) n.style.display = ''; }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
