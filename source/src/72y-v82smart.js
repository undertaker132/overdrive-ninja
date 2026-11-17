/* ==========================================================================
   v82 · SMARTER ENEMIES (simulation, version-gated: replays recorded before
   82 play back exactly as before).
     DRONE / MINI  close in from the sides instead of in a line, each on its
                   own side; a dash aimed straight at one may be sidestepped
                   (it hops aside once, then must recover)
     SNIPER        leads its shot: it aims where you are going
     BRUTE         turns slowly: get behind its shield
   ========================================================================== */
const Smart82 = {
  on() { return simV(82); },
  /* after the enemy's own step */
  post(e, dt, x0, y0, a0) {
    const t = e.type;
    if (t === ET.DRONE || t === ET.MINI) {
      const dx = P.x - e.x, dy = P.y - e.y, d = Math.sqrt(dx * dx + dy * dy) || 1, side = (e.uid & 1) ? 1 : -1;
      if (d > 110) { const k = e.spd * .38 * dt * Math.min(1, (d - 110) / 160); e.x += -dy / d * side * k; e.y += dx / d * side * k; } // (a flank: drift to its side while closing in)
      if (e.dg82 > 0) e.dg82 -= dt;
      else if (P.dashT > .18 && e.spawnT <= 0 && d < 200) { // a dash coming straight at it
        const off = Math.abs(angDiff(P.ang, Math.atan2(e.y - P.y, e.x - P.x)));
        if (off < .3) { e.dg82 = 2.2; if (R.f() < .4) { const hop = 58 * side; e.x += -Math.sin(P.ang) * hop; e.y += Math.cos(P.ang) * hop; FX.ghost(x0, y0, 0, e.col); FX.text(e.x, e.y - e.r - 10, lt('DODGE'), '#ffffff', 11); } }
      }
      e.x = clamp(e.x, V.L + e.r, V.R - e.r);
    }
    if (t === ET.BRUTE && a0 != null) { const lim = 2.1 * dt, da = angDiff(e.ang, a0); if (Math.abs(da) > lim) e.ang = a0 + Math.sign(da) * lim; } // (a slow turn: its shield lags behind you)
  }
};
{
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    if (!Smart82.on() || !e || e.al > 0) return ue(e, dt);
    const x0 = e.x, y0 = e.y, a0 = e.type === ET.BRUTE ? (e.a82 == null ? e.ang : e.a82) : null;
    const r = ue(e, dt);
    if (e.alive && !(e.stun > 0)) Smart82.post(e, dt, x0, y0, a0);
    if (e.type === ET.BRUTE) e.a82 = e.ang;
    return r;
  };
  const sh = shoot;
  shoot = function (x, y, a, s, kind) { // the sniper leads you: it aims where you will be when the shot arrives
    if (Smart82.on() && G.shooter === ET.SNIPER && s > 0) { const d = Math.hypot(P.x - x, P.y - y), tt = Math.min(.9, d / s), px = P.x + P.vx * tt * .6, py = P.y + P.vy * tt * .6; a = Math.atan2(py - y, px - x); }
    return sh.apply(this, [x, y, a, s].concat([].slice.call(arguments, 4)));
  };
}
{ const se = spawnEnemy; spawnEnemy = function () { const e = se.apply(this, arguments); if (e) { e.dg82 = 0; e.a82 = null; e.mk82 = 0; } return e; }; } // (pooled enemies start clean)
