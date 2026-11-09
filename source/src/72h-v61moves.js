/* =====================================================================
   VERSION 61: REAL COMBAT MOVES FOR THE HUMAN HERO
   Moves keyed on the skeleton, played on top of the recorded motion:
   · a three-cut combo, one cut per dash: an overhead chop, a wide
     horizontal sweep, a rising cut (the combo resets after a pause)
   · a flinch when you lose a shield
   · a victory pose (the blade raised) when a stage is cleared
   On the home screen and in the Hero Forge a tap plays the next cut.
   Display only.
   ===================================================================== */
const Moves = {
  ease(u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; },
  /* each move: duration and, for u in 0..1, offsets [arm raise, chest twist, forward bend] */
  M: {
    chop: { d: .42, f(u) { const w = Math.min(1, u / .35), c = Math.max(0, Math.min(1, (u - .35) / .2)), r = Math.max(0, (u - .7) / .3); const raise = 1.9 * Moves.ease(w) - 2.3 * Moves.ease(c) + .4 * r; return [raise, .15 * w - .15 * c, .45 * c * (1 - r)]; } },
    sweep: { d: .42, f(u) { const w = Math.min(1, u / .3), c = Math.max(0, Math.min(1, (u - .3) / .25)), r = Math.max(0, (u - .7) / .3); return [1.1 * Math.sin(Math.min(1, u * 1.4) * Math.PI * .5) * (1 - r), .95 * Moves.ease(w) - 1.9 * Moves.ease(c) + .95 * r, .15 * c * (1 - r)]; } },
    rise: { d: .46, f(u) { const w = Math.min(1, u / .25), c = Math.max(0, Math.min(1, (u - .25) / .3)), r = Math.max(0, (u - .7) / .3); return [-.5 * Moves.ease(w) + 2.5 * Moves.ease(c) - 2 * r, -.5 * w + .9 * c - .4 * r, .3 * w - .5 * c + .2 * r]; } },
    flinch: { d: .35, f(u) { const k = Math.sin(u * Math.PI); return [-.3 * k, .25 * k, -.4 * k]; } },
    win: { d: 1.2, hold: 1, f(u) { const k = Moves.ease(Math.min(1, u * 2.5)); return [1.45 * k, -.2 * k, -.15 * k]; } }
  },
  COMBO: ['chop', 'sweep', 'rise'],
  start(g, k) { g.mv = { k, t: 0 }; },
  /* called after the recorded motion of a human hero */
  apply(g, o, rd) {
    const B = g.human.B, dash = !!o.dashing;
    if (dash && !g.mvDash) { const n = (g.mvT || 0) > 1.2 ? 0 : ((g.mvN || 0) + 1) % 3; g.mvN = n; this.start(g, this.COMBO[n]); } // (a new dash: the next cut of the combo)
    g.mvDash = dash; g.mvT = dash ? 0 : (g.mvT || 0) + (rd || 0);
    if (o.hp != null) { if (g.mvHp != null && o.hp < g.mvHp) this.start(g, 'flinch'); g.mvHp = o.hp; }
    if (o.win && (!g.mv || g.mv.k !== 'win')) this.start(g, 'win');
    const m = g.mv; if (!m) return; const M = this.M[m.k]; m.t += rd || 0; let u = m.t / M.d; if (u >= 1) { if (M.hold && o.win) u = 1; else { g.mv = null; return; } }
    const [raise, twist, bend] = M.f(Math.min(1, u));
    if (B.rArm) B.rArm.rotateOnAxis(this.Y, raise); if (B.spine2) B.spine2.rotateY(twist); if (B.spine) B.spine.rotateX(bend);
  },
  Y: null
};
{
  Moves.Y = new THREE.Vector3(0, 1, 0);
  Human.SW.k1 = 0; Human.SW.tw = 0; // (the single swing of version 60 gives way to the combo)
  const an0 = Human.anim.bind(Human);
  Human.anim = function (g, o, rd, t) { an0(g, o, rd, t); try { Moves.apply(g, o, rd); } catch (e) { errLog(e); } };
  // in runs: the shields and a cleared stage reach the moves
  const ah9 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) { if (g && g.human && this.ents.get('hero') && this.ents.get('hero').g === g) { o.hp = P.hp; o.win = G.state === 'CLEAR'; } return ah9(g, o, rd, t); };
}
