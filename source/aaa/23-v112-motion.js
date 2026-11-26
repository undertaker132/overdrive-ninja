
/* --- MODULE 23: v112.0 SMOOTH MOTION — every frame between two steps, every turn eased --- */
(function () {
  'use strict';
  // The game steps at a fixed 60 per second. A 60 Hz screen refreshes at about that rate, never exactly: some refreshes
  // ran two steps and some none, and the picture hitched (judder). The in-between drawing that fixes it (Smooth) was
  // only on for screens over 75 Hz. Now AUTO turns it on for every screen (OFF still turns it off).
  // The in-between drawing now covers facing too (the hero's blade and every enemy's heading), and the 3D models turn
  // through a quick ease instead of snapping to a new heading in one frame.
  // Only the drawing changes; the simulation and the replays do not.
  const want0 = Smooth.want.bind(Smooth);
  Smooth.want = function () { const m = (Store.data && Store.data.settings.smooth) || 'auto'; return m === 'auto' ? true : want0(); };

  const lerpA = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; };
  // angles: remembered with the positions at each step, drawn in between, put back after the drawing
  const snap0 = Smooth.snap.bind(Smooth);
  Smooth.snap = function () {
    snap0();
    if (G.state !== 'PLAY') return;
    P._pa = P.ang; P._pf = P.face;
    for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; o._pa = o.ang; }
  };
  const ren0 = Smooth.render.bind(Smooth);
  Smooth.render = function (rd) {
    const act = G.state === 'PLAY' && !(REPLAY.on && (REPLAY.fast || REPLAY.paused)) && !G.photo && (this.want() || (REPLAY.on && REPLAY.speed < 1));
    if (!act) return ren0(rd);
    const a = clamp((REPLAY.on ? REPLAY.acc : acc) / CFG.step, 0, 1), keep = [];
    const one = (o, f, pf) => { const v = o[f], p = o[pf]; if (typeof v !== 'number' || typeof p !== 'number' || v === p) return; const d = Math.abs(lerpA(0, v - p, 1)); if (d > 2.6) return; keep.push(o, f, v); o[f] = lerpA(p, v, a); };
    try {
      one(P, 'ang', '_pa'); one(P, 'face', '_pf');
      for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o._pg === o.gen) one(o, 'ang', '_pa'); }
      return ren0(rd);
    } finally { for (let i = keep.length - 3; i >= 0; i -= 3) keep[i][keep[i + 1]] = keep[i + 2]; }
  };

  // 3D: a heading change eases in over a few frames (a dash still turns at once to the eye: ~50 ms)
  const ease = (g, rate) => {
    const t = g.rotation.z, dt = Math.min(.05, RDT || 1 / 60);
    if (g._yz == null || g._yf !== (R3.frame | 0) - 1 && g._yf !== (R3.frame | 0)) g._yz = t; // (first seen, or not drawn for a while: no sweep)
    else g._yz = lerpA(g._yz, t, 1 - Math.exp(-rate * dt));
    g._yf = R3.frame | 0; g.rotation.z = g._yz;
  };
  if (typeof R3 !== 'undefined') {
    const ah0 = R3.animHero.bind(R3);
    R3.animHero = function (g, o) { const r = ah0.apply(this, arguments); try { if (o && (o.x || o.y)) ease(g, 30); } catch (e) { } return r; };
    const ae0 = R3.animEnemy.bind(R3);
    R3.animEnemy = function (g, e) { const r = ae0.apply(this, arguments); try { if (!e.dead && !(e.vis < .2)) ease(g, 16); } catch (er) { } return r; };
  }
  // the human hero (the recorded motion): the dash lean came on and off in one frame, and a speed near a threshold
  // flickered between the walk and run clips every few frames. The lean now eases in and out, and each clip holds
  // until the speed is clearly past the other side (hysteresis)
  if (typeof Human !== 'undefined' && Human.anim) {
    const hn0 = Human.anim.bind(Human);
    Human.anim = function (g, o, rd, t) {
      if (!g || !o) return hn0.apply(this, arguments);
      const dt = Math.min(.05, rd || 0), dash = !!o.dashing; let sp = o.spd || 0;
      g._dk = g._dk == null ? (dash ? 1 : 0) : dash ? Math.min(1, g._dk + dt * 14) : Math.max(0, g._dk - dt * 6);
      if (!dash) { if (g._run && sp > 190) sp = Math.max(sp, 270); else if (!g._run && sp < 320) sp = Math.min(sp, 250); if (g._walk && sp > 14) sp = Math.max(sp, 36); else if (!g._walk && sp < 48) sp = Math.min(sp, 24); }
      g._run = dash || sp > 260; g._walk = sp > 30;
      const r = hn0.call(this, g, sp === o.spd ? o : Object.assign({}, o, { spd: sp }), rd, t);
      try { const B = g.human && g.human.B; if (B && B.spine) B.spine.rotation.x += .45 * ((g._dk || 0) - (dash ? 1 : 0)); } catch (e) { }
      return r;
    };
  }
  window.Motion112 = { lerpA };
})();
