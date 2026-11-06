/* =====================================================================
   FRIEND CHALLENGE — the share text now carries a code (ODC1.…) with the
   mode, the run's seed, the score and the name. A friend pastes it on the
   Arcade screen and plays the very same roof: same seed, same cars, same
   tower curses. The result screen then says who won.
   ===================================================================== */
const CHAL_MODES = { endless: 1, tower: 1, highway: 1, mayhem: 1, timeattack: 1 };
const FChal = {
  cur: null, // the challenge being played: { m, s, sc, n, ev }
  code() {
    if (!CHAL_MODES[G.mode] || G.assist || REPLAY.on) return '';
    const o = { m: G.mode, s: G.seed >>> 0, sc: ii(G.score), n: String((Store.data.user && Store.data.user.name) || 'PLAYER').slice(0, 16), ev: G.twEv || '' };
    const b = new TextEncoder().encode(JSON.stringify(o)); let s = ''; for (const c of b) s += String.fromCharCode(c);
    return 'ODC1.' + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode(code) {
    try {
      const m = /ODC1\.([A-Za-z0-9_+\/=-]+)/.exec(String(code || '')); if (!m) return null;
      let s = m[1].replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
      const bin = atob(s), b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
      const o = JSON.parse(new TextDecoder().decode(b)); if (!o || !CHAL_MODES[o.m]) return null;
      return { m: o.m, s: (+o.s >>> 0) || 1, sc: Math.max(0, Math.min(1e10, +o.sc || 0)), n: String(o.n || 'PLAYER').replace(/[<>]/g, '').slice(0, 16), ev: TOWER_EVENTS.some(e => e.id === o.ev) ? o.ev : '' };
    } catch (e) { return null; }
  },
  play(c) { this.cur = c; Store.data.mode = c.m; Store.touch(); Flow.startArcade(c.m); },
  seed() { const c = this.cur; return c && G.mode === c.m ? c.s : 0; }, // read by Director.begin
  note() { // the result line, then the challenge is over
    const c = this.cur; if (!c || c.m !== G.mode) return null; // RETRY keeps the same challenge; leaving to the menu ends it
    return G.score > c.sc ? { t: ltf('You beat {0}! {1} vs {2}.', c.n, fmtNum(G.score), fmtNum(c.sc)), c: 'gold' } : { t: ltf('{0} scored {1}. {2} more to beat it.', c.n, fmtNum(c.sc), fmtNum(c.sc - G.score + 1)), c: 'mute' };
  }
};
Object.assign(UI, {
  renderFChal() {
    const wrap = $('arFc'); if (!wrap) return; 
    $('arFcGo').onclick = () => { const c = FChal.decode($('arFcCode').value); if (!c) { Aud.sfx('deny'); toastDom(lt('THAT CODE DOES NOT WORK')); return; } $('arFcCode').value = ''; Aud.sfx('buy'); FChal.play(c); };
  }
});
