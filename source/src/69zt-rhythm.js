/* =====================================================================
   BOSS MUSIC LAYERS and the RHYTHM COMBO (v29)
   - the music follows the boss fight: phase 2 adds an off-beat pulse and
     open hats, phase 3 pushes the tempo up 6% with an octave bass and a
     riser every 8 bars, and when the boss is nearly down a heartbeat kick
     and a rising sweep take over; the kill lands on a crash
   - rhythm combo: a dash released on the beat (you hear it) is ON BEAT;
     on-beat dashes in a row build x2, x3, x4 for score, style and
     Overdrive. The beat is judged live from the music clock and recorded
     as its own action (RA.BEAT), so replays apply exactly the same bonus;
     replays recorded before v29 have no beat actions and stay exact.
   ===================================================================== */
const Rhythm = {
  win: .095,
  /* how far (in seconds) the present moment is from the nearest beat the player hears */
  offset() {
    const A = Aud, c = A.c, m = A.mus; if (!c || c.state !== 'running' || !m || !m.on || !m.tr || A.quiet) return 9;
    if (((Store.data.settings.music) || 0) < .05) return 9; // music off: no beat to follow
    const sd = 60 / (m.tr.bpm * (A.bpmMul || 1)) / 4, lat = (c.outputLatency || c.baseLatency || 0), now = c.currentTime - lat;
    const pos = m.step - (m.next - now) / sd, q = pos / 4, ph = q - Math.round(q); return Math.abs(ph * 4 * sd);
  },
  onBeat() { return G.state === 'PLAY' && G.mode !== 'puzzle' && G.mode !== 'dojo' && this.offset() < this.win; },
  /* (sim) the dash just started: on the beat or not */
  apply(on) {
    if (!on) { P.beatK = 0; return; }
    P.beatK = Math.min(4, (P.beatK | 0) + 1); const k = P.beatK;
    G.score += Math.round(60 * k * G.diff.score * G.scoreMul); addOD(2 + k); if (typeof styleAdd === 'function') styleAdd(ST_GRAZE, 6 * k);
    FX.text(P.x, P.y - 40, k > 1 ? ltf('ON BEAT x{0}', k) : lt('ON BEAT'), k >= 4 ? '#ff4fd8' : '#7df9ff', 12 + k * 1.5, 0, 'beat'); P.beatT = .25;
  },
  /* drawing: a soft pulse under the hero on each beat, so the rhythm can be seen too */
  draw() {
    if (G.state !== 'PLAY' || CALM) return; const o = this.offset(); if (o > .2) return; const a = 1 - o / .2;
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .18 * a * a; cx.strokeStyle = (P.beatK | 0) >= 2 ? '#ff4fd8' : '#7df9ff'; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(P.x, P.y, P.r + 14 + (1 - a) * 10, 0, TAU); cx.stroke(); cx.restore();
  }
};
{
  RA.BEAT = 17;
  const sl0 = slash; slash = function (a) {
    if (!REPLAY.on && !(REC.depth > 0) && Rhythm.onBeat()) { P.beatNext = 1; REC.act(RA.BEAT); } // only a dash you released yourself (not one the simulation starts) can be on the beat
    const nb = P.beatNext | 0, s0 = P.seq; P.beatNext = 0;
    const r = sl0(a); if (P.seq !== s0 && (nb || P.beatK)) Rhythm.apply(nb); return r;
  };
  const ap0 = REPLAY.apply.bind(REPLAY); REPLAY.apply = function (e) { if ((e[1] & 63) === RA.BEAT) { P.beatNext = 1; return; } return ap0(e); };
  const rs0 = resetPlayer; resetPlayer = function () { const r = rs0.apply(this, arguments); P.beatK = 0; P.beatNext = 0; return r; };
  Pipe.on('post', 'rhythm', () => { if (inRun() && !(REPLAY.on && REPLAY.fast)) { const k = V.s * V.dpr; cx.save(); W3D.flatT(k); Rhythm.draw(); cx.restore(); } }, 25);
}
/* ---- the boss fight drives the music ---- */
const BossMusic = {
  ph: 0, low: false, dead: false,
  sync() { // per frame (drawing side)
    const b = Boss.cur, A = Aud; let ph = 0, low = false;
    if (b && b.enter >= 1 && !(b.dying > 0)) { ph = b.ph | 0; low = b.hp < b.mhp * .15; }
    if (b && b.dying > 0 && !this.dead) { this.dead = true; try { const t = A.c && A.c.currentTime; if (t) { A.crash(t + .02, .12); A.kick(t + .02, .4); } } catch (e) { errLog(e); } }
    if (!b) this.dead = false;
    this.ph = ph; this.low = low; A.bpmMul = ph >= 3 ? 1.06 : 1;
  },
  step(T, t, step, sd) { // extra layers on top of the track
    const A = Aud, s = step & 15, bar = step >> 4; if (!this.ph) return;
    if (this.ph >= 2) { if (s % 4 === 2) { A.hat(t, .04, true); A.thump(t, 70, 45, .12, .12); } }
    if (this.ph >= 3) { if (s % 2 === 0) { const sc = SCALES[T.sc], cd = T.prog[((bar / (T.chordLen || 1)) | 0) % T.prog.length], f = T.root * Math.pow(2, (sdeg(sc, cd) - 12) / 12); A.voice(t, f, sd * 1.4, .05, VOX[(T.bass && T.bass.type) || 'saw'] || VOX.saw, false); }
      if (s === 0 && bar % 8 === 7) A.riser(t, sd * 16); }
    if (this.low && s % 4 === 0) { A.thump(t, 58, 36, .2, .26); A.thump(t + sd * .9, 52, 34, .16, .18); }
  }
};
{
  const st0 = Aud.step16.bind(Aud); Aud.step16 = function (T, t0, step, sd) { st0(T, t0, step, sd); try { if (!this.lite) BossMusic.step(T, t0, step, sd); } catch (e) { errLog(e); } };
  Pipe.on('pre', 'boss-music', () => { if (inRun()) BossMusic.sync(); else if (Aud.bpmMul !== 1) Aud.bpmMul = 1; }, 3);
}
