
/* --- MODULE 9: v104.0 DAILY GHOST — race your own best attempt of today's daily (and this week's weekly), offline --- */
(function () {
  'use strict';
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "YOUR BEST TODAY": "השיא שלך היום",
    "YOUR BEST THIS WEEK": "השיא שלך השבוע",
    "RACE YOUR BEST TODAY: {0}": "התחרה בשיא שלך היום: {0}",
    "RACE YOUR BEST THIS WEEK: {0}": "התחרה בשיא שלך השבוע: {0}",
    "NEW GHOST SAVED": "רוח חדשה נשמרה"
  });
  const MODES = { daily: 1, weekly: 1 };
  const L = s => (typeof lt === 'function' ? lt(s) : s);
  const slot = m => 'overdrive_ghost104_' + m;
  const period = m => m === 'daily' ? G.dayKey | 0 : G.weekKey | 0; // the same seed for everyone that day / week
  const load = m => { try { const g = JSON.parse(localStorage.getItem(slot(m)) || 'null'); return g && g.k === period(m) && typeof g.p === 'string' ? g : null; } catch (e) { return null; } };

  // at the start: no challenge or rival ghost picked -> your own best of this period runs beside you
  const b0 = Ghost.begin.bind(Ghost);
  Ghost.begin = function (mode) {
    const r = b0.apply(this, arguments);
    try {
      if (REPLAY.on || !MODES[mode] || this.playOn) return r;
      const g = load(mode); if (!g) return r;
      const pos = this.dec(g.p);
      this.play = { id: 'self104', name: L(mode === 'daily' ? 'YOUR BEST TODAY' : 'YOUR BEST THIS WEEK'), mode, pos, n: pos.length >> 1, sc: Array.isArray(g.sc) ? g.sc : [], sk: g.sk, bf: g.bf, s: g.s | 0 };
      this.playOn = true; this.wasAhead = null;
      setTimeout(() => { if (G.state === 'PLAY' && G.mode === mode && typeof toast === 'function') toast(ltf(mode === 'daily' ? 'RACE YOUR BEST TODAY: {0}' : 'RACE YOUR BEST THIS WEEK: {0}', fmtNum(g.s | 0)), '#ff4fd8'); }, 1200);
    } catch (e) { errLog(e); }
    return r;
  };

  // at the end: a better score than this period's ghost becomes the new ghost
  const o0 = Flow.over.bind(Flow);
  Flow.over = function () {
    const m = G.mode, score = G.score | 0, rec = Ghost.rec, ok = !REPLAY.on && MODES[m] && rec && rec.n >= 10 && !G.assist && G.state === 'PLAY';
    const r = o0.apply(this, arguments);
    try {
      if (ok) {
        const old = load(m);
        if (!old || score > (old.s | 0)) {
          localStorage.setItem(slot(m), JSON.stringify({ k: period(m), s: score, sk: Store.data.skin, bf: Store.data.blade, p: Ghost.enc(rec.pos.subarray(0, rec.n * 2)), sc: rec.sc.slice(0, 900) }));
          if (old && typeof toastDom === 'function') setTimeout(() => toastDom('👻 ' + L('NEW GHOST SAVED')), 900);
        }
      }
    } catch (e) { errLog(e); }
    return r;
  };
})();
