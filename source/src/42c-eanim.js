/* =====================================================================
   ENEMY ANIMATION — purely visual (no simulation state is read back):
     · breathing: every enemy pulses a little while it lives
     · wind-up: right before an attack the body squashes, glows and a
       shrinking ring closes in, so you can read the attack coming
     · hit reaction: a hit squashes the body along the blow and flashes
     · deaths: every enemy type breaks apart its own way
   ===================================================================== */
const EA_SHOOT = (() => { const s = {}; for (const k of ['WEAVER', 'WARDEN', 'MEDIC', 'MIMIC', 'MINER', 'MIRROR', 'ENFORCER', 'SPIDER', 'WRAITH']) s[ET[k]] = 1; return s; })();
const EA_ST = (() => { const s = {}; for (const k of ['SNIPER', 'PHANTOM']) s[ET[k]] = 1; return s; })();
const EAnim = {
  windup(e) { // 0..1, how close the next attack is
    if (e.spawnT > 0 || e.al > 0 || e.stun > 0) return 0;
    if (EA_ST[e.type]) return e.st === 1 ? clamp(1 - e.stT / .7, 0, 1) : 0;
    if (EA_SHOOT[e.type] && e.cd > 0 && e.cd < .4) return 1 - e.cd / .4;
    return 0;
  },
  /* called inside drawEnemy after translate, before the type art (scale already set) */
  pre(e) {
    if (CALM) return;
    const br = 1 + Math.sin((e.t || 0) * 5 + (e.uid | 0)) * .03, w = this.windup(e);
    let sx = br, sy = br;
    if (w > 0) { const q = Math.sin(w * Math.PI * 6) * .05 * w; sx *= 1 - .12 * w + q; sy *= 1 + .14 * w - q; }
    if (e.fl > .05 && e.ha != null) { const k = Math.min(1, e.fl); cx.rotate(e.ha); cx.scale(1 - .22 * k, 1 + .18 * k); cx.rotate(-e.ha); cx.translate(Math.cos(e.ha) * 4 * k, Math.sin(e.ha) * 4 * k); }
    cx.scale(sx, sy);
  },
  /* the telegraph ring, drawn in world space after the body */
  post(e) {
    if (CALM) return; const w = this.windup(e); if (w <= .05) return;
    const r = e.r * (1 + 1.6 * (1 - w)) + 4, c = e.type === ET.SNIPER ? '#ff9a3d' : '#ff3b5c';
    cx.save(); cx.globalAlpha = .25 + .6 * w; cx.strokeStyle = c; cx.lineWidth = 1.5 + 2 * w; cx.beginPath(); cx.arc(e.x, e.y, r, 0, TAU); cx.stroke();
    if (w > .7) { cx.globalAlpha = (w - .7) * 2.5; glow(e.x, e.y, e.r * 2, c, .5); }
    cx.restore();
  },
  /* per-type deaths, on top of the shared slice and sparks */
  death(e, a) {
    if (CALM) return; const x = e.x, y = e.y, c = e.col, T = ET;
    switch (e.type) {
      case T.DRONE: case T.MINI: for (let k = 0; k < 6; k++) WFX.chip(x, y, k * TAU / 6 + rnd() * .4, 140 + rnd() * 80, c, 6, 1.4); break; // the legs fly off
      case T.SNIPER: WFX.line(x, y, e.ang, 50, '#ff9a3d', 2, 4); for (let k = 0; k < 5; k++) WFX.chip(x, y, rnd() * TAU, 120 + rnd() * 120, '#cfe8ff', 2.5, 2.5); break; // scope glass shatters
      case T.BRUTE: case T.ENFORCER: for (let k = 0; k < 6; k++) WFX.chip(x, y, a + (rnd() - .5) * 2.2, 90 + rnd() * 120, c, 7, 5); FX.ring(x, y, e.r * 2.2, c, 4); break; // armor plates fall
      case T.WEAVER: for (let k = 0; k < 3; k++) WFX.line(x, y, k * TAU / 3 + e.t, 34, '#ffffff', 1.6, 6); break;
      case T.PHANTOM: case T.WRAITH: WFX.soul(x, y, c, 0); WFX.soul(x + 6, y, '#e0ccff', 0); break; // it dissolves upward
      case T.WARDEN: for (let k = 0; k < 8; k++) WFX.chip(x, y, k * TAU / 8, 160, '#4d7cff', 5, 2); FX.ring(x, y, e.r * 2.6, '#4d7cff', 3); break; // its shield bursts
      case T.MEDIC: for (let k = 0; k < 4; k++) WFX.line(x, y, k * Math.PI / 2, 26, '#00ff88', 4, 5); FX.ring(x, y, 40, '#00ff88', 3); break; // a green cross flash
      case T.MIRROR: for (let k = 0; k < 8; k++) WFX.chip(x, y, rnd() * TAU, 100 + rnd() * 180, '#e8fbff', 4, 3); break; // glass
      case T.MIMIC: WFX.soul(x, y, '#ff2bd6', 3); FX.ring(x, y, 46, '#ff2bd6', 2); break;
      case T.MINER: for (let k = 0; k < 5; k++) WFX.chip(x, y, rnd() * TAU, 140, '#ffb347', 3, 3); break;
      case T.SPIDER: for (let k = 0; k < 8; k++) WFX.chip(x, y, k * TAU / 8, 200, c, 10, 2); FX.ring(x, y, 90, c, 5); break;
      case T.SPLITTER: FX.ring(x, y, e.r * 1.8, c, 2); break;
    }
  }
};
