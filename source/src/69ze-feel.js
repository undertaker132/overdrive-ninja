/* ---------------- FEEL — sliced kills, impact holds, blade shockwaves, a tidy screen ----------------
   All of it is drawn on top of the game and never read back by the simulation,
   so replays and ghosts stay exact.
   - SLICED KILLS: an enemy cut down splits in two along the blade's path; the
     halves slide apart, spin and fade, with a white cut line.
   - IMPACT HOLD: a critical kill holds the picture for two frames (the game
     keeps running underneath), the way fighting games sell a big hit.
   - SHOCKWAVE: a heavy weapon's dash bends the air: a ring of slightly
     magnified picture travels out from the hero.
   - A TIDY SCREEN: the multi-kill call waits while a big callout or the stage
     card is showing, and achievement pop-ups move below the HUD during a run. */
const SLICE_SKIP = {}; // these already have their own death (dissolve, split)
for (const k of ['PHANTOM', 'WRAITH', 'MIMIC', 'SPLITTER']) if (ET[k] != null) SLICE_SKIP[ET[k]] = 1;
const HEAVY_W = { hammer: 1, cleaver: 1, staff: 1, nodachi: 1, drill: 1 };
const Feel = {
  sl: [], hold: 0, waves: [], dash0: 0, k0: 0, c0: 0,
  on() { return !CALM && Q.lvl > 0 && Juice.flashMode() !== 'off'; },
  slice(e, a) {
    if (!this.on() || SLICE_SKIP[e.type] || e.mb || this.sl.length >= 18) return;
    const c = Object.assign({}, e); c.x = 0; c.y = 0; c.fl = 0; c.hpBar = 0; c.mark = 0; c.bub = 0; c.stun = 0; c.al = 0; c.vis = 1; c.alive = true; c.fuse = 0;
    this.sl.push({ e: c, x: e.x, y: e.y, a: a || 0, t: 0, d: .55, sp: 90 + e.r * 3, rot: (cmRand(e.uid | 0) - .5) * 5 });
  },
  watch(rd) {
    if (!inRun()) { this.sl.length = 0; this.waves.length = 0; return; }
    const k = G.kills | 0, cr = G.crits | 0;
    if (k > this.k0 && cr > this.c0 && !CALM && Juice.flashMode() === 'full' && G.state === 'PLAY') this.hold = 2; // a critical hit that killed
    this.k0 = k; this.c0 = cr;
    const sq = P.seq | 0; // a new dash (or a wall bounce)
    if (sq > this.dash0 && this.on() && HEAVY_W[P.w && P.w.id] && this.waves.length < 4) this.waves.push({ x: P.x, y: P.y, t: 0 });
    this.dash0 = sq;
  },
  drawSlices(rd) {
    if (!this.sl.length) return;
    cx.save(); const k = V.s * V.dpr; W3D.flatT(k);
    for (let i = this.sl.length - 1; i >= 0; i--) {
      const S = this.sl[i]; S.t += rd; if (S.t > S.d) { this.sl.splice(i, 1); continue; }
      const p = S.t / S.d, ease = 1 - Math.pow(1 - p, 2), na = S.a + Math.PI / 2, off = ease * S.sp * .35, R = (S.e.r || 12) * 3;
      for (const sd of [-1, 1]) {
        cx.save(); cx.translate(S.x + Math.cos(na) * off * sd + Math.cos(S.a) * ease * 20, S.y + Math.sin(na) * off * sd + Math.sin(S.a) * ease * 20 + p * p * 30);
        cx.rotate(sd * S.rot * ease * .4); cx.globalAlpha = 1 - p * p;
        cx.save(); cx.rotate(S.a); cx.beginPath(); cx.rect(-R, sd < 0 ? -R : 0, R * 2, R); cx.restore(); cx.clip();
        S.e.vis = 1 - p * p; try { EDRAW = ED_BODY; drawEnemy(S.e); } catch (er) { errLog(er); } finally { EDRAW = 7; }
        cx.restore();
      }
      if (S.t < .14) { // the cut line
        const q = 1 - S.t / .14, L = (S.e.r || 12) * 2.6; cx.save(); cx.globalAlpha = q; cx.strokeStyle = '#ffffff'; cx.lineWidth = 3 * q + .5; cx.shadowColor = P.ca || '#00f2fe'; cx.shadowBlur = 12;
        cx.beginPath(); cx.moveTo(S.x - Math.cos(S.a) * L, S.y - Math.sin(S.a) * L); cx.lineTo(S.x + Math.cos(S.a) * L, S.y + Math.sin(S.a) * L); cx.stroke(); cx.restore();
      }
    }
    cx.restore();
  },
  drawWaves(rd) {
    if (!this.waves.length) return;
    const k = V.s * V.dpr, W = cv.width, H = cv.height;
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i]; w.t += rd; if (w.t > .35) { this.waves.splice(i, 1); continue; }
      const p = w.t / .35, r = (30 + p * 170) * k, th = 16 * k * (1 - p), q = W3D.proj(w.x, w.y, 10), sx = q[0], sy = q[1], m = 1.06;
      cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.beginPath(); cx.arc(sx, sy, r + th, 0, TAU); cx.arc(sx, sy, Math.max(0, r - th), 0, TAU, true); cx.clip('evenodd');
      cx.globalAlpha = .55 * (1 - p); cx.drawImage(cv, sx - sx * m, sy - sy * m, W * m, H * m); // the magnified ring: air bending
      cx.globalAlpha = .35 * (1 - p); cx.strokeStyle = '#ffffff'; cx.lineWidth = 2 * k; cx.beginPath(); cx.arc(sx, sy, r, 0, TAU); cx.stroke(); cx.restore();
    }
  }
};
{
  const d0 = EAnim.death.bind(EAnim); EAnim.death = function (e, a) { d0(e, a); try { if (!(REPLAY.on && REPLAY.fast)) Feel.slice(e, a); } catch (er) { errLog(er); } };
  Pipe.on('pre', 'feel-hold', () => { if (Feel.hold > 0 && G.state === 'PLAY' && !G.photo) { Feel.hold--; return false; } }, 0); // keep the last picture (2D and 3D): an impact hold
  Pipe.on('post', 'feel', rd => { if (G.photo || (REPLAY.on && REPLAY.fast) || !inRun()) { Feel.watch(rd); return; } Feel.watch(rd); Feel.drawWaves(rd); Feel.drawSlices(rd); }, 20);
  // the multi-kill call waits for the big callouts and the stage card
  const jd0 = Juice.draw.bind(Juice);
  Juice.draw = function (rd) { if (this.call && ((CALL.l > 0 && CALL.p >= 3) || (G.cine && G.cine.k === 'stage'))) { const c = this.call; this.call = null; jd0(rd); this.call = c; if (c.t > .5) c.t = .5; return; } jd0(rd); };
  // achievement pop-ups sit below the HUD during a run
  const t0 = UI.tick.bind(UI); UI.tick = function (rd) { t0(rd); const on = G.state === 'PLAY' || G.state === 'PAUSE'; if (on !== this._inRun) { this._inRun = on; document.body.classList.toggle('inrun', on); } };
}
