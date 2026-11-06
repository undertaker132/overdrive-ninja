/* ---------------- IMPACT 2 — anime impact frames, multi-kill calls, flash safety, text size ----------------
   Everything here is drawn on top of a finished frame and only reads the game
   state, so the simulation, replays and ghosts never change.
   - A perfect parry and a broken boss part flash an IMPACT FRAME: two frames
     of inverted colors with speed lines bursting from the hit, then a quick
     zoom punch.
   - Kills close together are called out: DOUBLE, TRIPLE, QUAD, RAMPAGE,
     MASSACRE, with a voice line for the big ones.
   - FLASHES: FULL / SOFT / OFF for photosensitive players (flashes, glitches
     and impact frames).
   - TEXT SIZE: 100% / 115% / 130% for every menu. */
const MK_CALLS = [[2, 'DOUBLE', '#00f2fe'], [3, 'TRIPLE', '#00ff88'], [4, 'QUAD', '#ffd23f'], [5, 'RAMPAGE', '#ff8a00'], [8, 'MASSACRE', '#ff0844'], [12, 'UNSTOPPABLE', '#ff4fd8']];
const Juice = {
  k0: 0, p0: 0, parts0: -1, bossId: '', streak: 0, lastKill: -9, call: null, imp: null, tNow: 0,
  flashMode() { const m = Store.data && Store.data.settings.flashes; return m === 'soft' || m === 'off' ? m : 'full'; },
  reset() { this.k0 = G.kills | 0; this.p0 = G.parries | 0; this.parts0 = -1; this.bossId = ''; this.streak = 0; this.call = null; this.imp = null; },
  impact(x, y, col, big) {
    if (this.flashMode() !== 'full' || CALM) { punch(big ? .05 : .03); return; }
    this.imp = { x, y, t: 0, d: big ? .3 : .22, col: col || '#ffffff', big: !!big, seed: (x * 7 + y * 13) | 0 };
    punch(big ? .08 : .05);
  },
  watch(rd) { // compare the game state with the last frame
    if (!inRun() || G.state !== 'PLAY') { if (G.state === 'MENU') this.reset(); return; }
    this.tNow += rd;
    const k = G.kills | 0, p = G.parries | 0;
    if (k < this.k0 || p < this.p0) { this.reset(); return; } // a new run
    if (p > this.p0) this.impact(P.x, P.y, '#00f2fe', false);
    if (k > this.k0) {
      const n = k - this.k0; this.streak = this.tNow - this.lastKill < .75 ? this.streak + n : n; this.lastKill = this.tNow;
      let c = null; for (const q of MK_CALLS) if (this.streak >= q[0]) c = q;
      if (c && (!this.call || this.call.n !== c[0])) { this.call = { n: c[0], txt: lt(c[1]), col: c[2], t: 0 }; if (c[0] >= 5) Aud.say(c[1].charAt(0) + c[1].slice(1).toLowerCase()); vibe(c[0] >= 5 ? 'crit' : 'kill'); }
    }
    const b = Boss.cur;
    if (b && b.parts && b.parts.length) {
      const a = bossPartsAlive(b);
      if (this.bossId === b.id + b.lvl && a < this.parts0) { const pt = b.parts.find(q => !q.alive && !q.juiced) || b; if (pt !== b) pt.juiced = 1; this.impact(pt.x, pt.y, '#ffd23f', true); }
      this.bossId = b.id + b.lvl; this.parts0 = a;
    } else { this.bossId = ''; this.parts0 = -1; }
    this.k0 = k; this.p0 = p;
  },
  draw(rd) {
    const W = cv.width, H = cv.height, k = V.s * V.dpr;
    if (this.imp) {
      const I = this.imp; I.t += rd;
      if (I.t > I.d) this.imp = null;
      else {
        cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
        const q = W3D.proj(I.x, I.y, 20), sx = q[0], sy = q[1];
        if (I.t < .05) { cx.globalCompositeOperation = 'difference'; cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, W, H); cx.globalCompositeOperation = 'source-over'; } // the inverted frame
        const a = 1 - I.t / I.d, R = Math.hypot(W, H);
        cx.globalAlpha = a * (I.t < .05 ? 1 : .75); cx.strokeStyle = I.t < .05 ? '#000000' : I.col; cx.lineCap = 'round';
        for (let i = 0; i < (I.big ? 44 : 30); i++) {
          const an = i / (I.big ? 44 : 30) * TAU + cmRand(I.seed + i) * .12, r0 = (60 + 140 * cmRand(I.seed + i * 3)) * k * (.6 + I.t * 3), r1 = R;
          cx.lineWidth = (1.5 + 4 * cmRand(I.seed + i * 5)) * k * a;
          cx.beginPath(); cx.moveTo(sx + Math.cos(an) * r0, sy + Math.sin(an) * r0); cx.lineTo(sx + Math.cos(an) * r1, sy + Math.sin(an) * r1); cx.stroke();
        }
        cx.globalAlpha = a * .9; cx.lineWidth = 6 * k * a; cx.strokeStyle = I.col; cx.beginPath(); cx.arc(sx, sy, (30 + I.t * 900) * k, 0, TAU); cx.stroke();
        cx.restore();
      }
    }
    if (this.call) {
      const C = this.call; C.t += rd; if (C.t > 1.1) { this.call = null; return; }
      const a = C.t < .9 ? 1 : 1 - (C.t - .9) / .2, s = C.t < .12 ? 1.6 - C.t * 5 : 1, fs = Math.round(Math.min(W * .11, 46 * V.dpr));
      cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = a; cx.translate(W / 2, H * .32); cx.scale(s, s); cx.transform(1, 0, -.18, 1, 0, 0);
      cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = 'italic 900 ' + fs + 'px ' + FONT_D; cx.lineJoin = 'round';
      cx.lineWidth = fs * .16; cx.strokeStyle = 'rgba(5,6,15,.9)'; cx.strokeText(C.txt, 0, 0);
      cx.shadowColor = C.col; cx.shadowBlur = fs * .5; cx.fillStyle = C.col; cx.fillText(C.txt, 0, 0); cx.shadowBlur = 0; cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillText(C.txt, 0, -fs * .04);
      cx.font = '700 ' + Math.round(fs * .3) + 'px ' + FONT_M; cx.fillStyle = '#e8fbff'; cx.fillText(ltf('{0} KILLS', C.n === 12 ? '12+' : C.n), 0, fs * .62);
      cx.restore();
    }
  }
};
{
  Pipe.on('post', 'juice', rd => { if (G.photo || (REPLAY.on && REPLAY.fast)) return; Juice.watch(rd); Juice.draw(rd); }, 10);
  const flash0 = flash; flash = function (a, c) { const m = Juice.flashMode(); if (m === 'off') return; flash0(m === 'soft' ? a * .35 : a, c); };
  const glitch0 = glitch; glitch = function (t) { if (Juice.flashMode() !== 'full') return; glitch0(t); };
  const ui0 = applyUiSettings; applyUiSettings = function () {
    try { const s = Store.data.settings, z = [1, 1.15, 1.3][clamp(s.tsz | 0, 0, 2)]; document.documentElement.style.setProperty('--tz', String(z)); document.body.classList.toggle('tz', z > 1); } catch (e) { errLog(e); }
    return ui0();
  };
}
/* ---------------- app shortcuts: ?go=story / ?go=endless (long-press the home-screen icon) ---------------- */
{
  let go = ''; try { go = new URLSearchParams(location.search).get('go') || ''; } catch (e) { errLog(e); }
  const t0 = UI.openTitle.bind(UI);
  UI.openTitle = function () {
    t0(); if (!go) return; const g = go; go = '';
    setTimeout(() => { try { if (this.cur !== 'title') return; if (g === 'story') this.openStory(); else if (g === 'endless' && Gate.open('arcade')) Flow.startArcade('endless'); } catch (e) { errLog(e); } }, 60);
  };
}
