/* =====================================================================
   VERSION 65: RECORDED SOUND
   Recorded effects (Kenney's free audio packs, CC0) now play on top of the
   game's synthesized sounds: steel being drawn and slicing on every cut,
   metal impacts on hits and clashes, a heavy chop on Zandatsu, body hits
   when you are struck, crunching explosions, a force field on Overdrive,
   coins, a latch, lasers, a warp, a power-up chime, and short jingles for
   winning and losing. Each event picks one of its takes at random with a
   slightly different pitch, so nothing sounds repeated. They follow the
   game's volume settings; where a browser cannot play them the
   synthesized sounds stay as they were.
   ===================================================================== */
const Rec = {
  buf: {}, ready: false, busy: false, last: {},
  VOL: { slash: .5, hit: .55, clash: .6, zan: .8, hurt: .7, boom: .45, od: .6, coin: .5, buy: .55, lock: .55, laser: .3, warp: .5, star: .45, win: .6, lose: .55 },
  GATE: { slash: 50, hit: 45, clash: 70, hurt: 120, boom: 90, laser: 60, coin: 60 },
  load(c) {
    if (this.busy || this.ready || typeof SFXDATA === 'undefined' || !c || !c.decodeAudioData) return; this.busy = true;
    const jobs = []; for (const k in SFXDATA) { this.buf[k] = []; for (const b64 of SFXDATA[k]) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
      jobs.push(new Promise(res => { try { const p = c.decodeAudioData(u.buffer, d => { this.buf[k].push(d); res(); }, () => res()); if (p && p.catch) p.catch(() => res()); } catch (e) { res(); } })); } }
    Promise.all(jobs).then(() => { this.ready = true; this.busy = false; });
  },
  play(n, p) {
    const A = Aud, c = A.c, L = this.buf[n]; if (!this.ready || !c || !L || !L.length || A.quiet || !A.sfxBus) return;
    const now = performance.now(), g = this.GATE[n] || 30; if (now - (this.last[n] || 0) < g) return; this.last[n] = now;
    try { const s = c.createBufferSource(), v = c.createGain(); s.buffer = L[Math.floor(Math.random() * L.length)]; s.playbackRate.value = .93 + Math.random() * .14 + (n === 'hit' && p ? .12 : 0);
      v.gain.value = (this.VOL[n] || .5); s.connect(v); v.connect(A.sfxBus); s.start(); } catch (e) { errLog(e); }
  }
};
{
  const sf0 = Aud.sfx.bind(Aud);
  Aud.sfx = function (n, p) { sf0(n, p); if (this.c) { if (!Rec.ready) Rec.load(this.c); else Rec.play(n, p); } };
}
