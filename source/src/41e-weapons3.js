/* =====================================================================
   WEAPONS 3 — three new blades (version 20):
     STORM NODACHI  a huge two-handed blade; when a dash ends it cuts a
                    full circle around you (signature TEMPEST: twice)
     NEON CHAKRAM   every dash throws a bladed ring that flies out and
                    comes back, cutting everything on the way both ways
                    (signature ORBIT: it flies a second loop)
     STEEL FAN      wider perfect-parry window; parried shots split into
                    three (signature GALE: perfect parries blow nearby
                    enemies away and stun them)
   All of it is simulation (seeded, replay-exact); the art and the swing
   animations live in 41b-hero.js / 41d-swing.js / 41c-wfx.js.
   ===================================================================== */
function nodachiSweep(second) {
  const R0 = 120 + (P.reach - 1) * 40, dmg = .9 * P.w.dmg * P.dmgMul * G.dmgMod; let n = 0;
  FX.ring(P.x, P.y, R0, '#9fe8ff', 6); FX.ring(P.x, P.y, R0 - 16, '#ffffff', 3); Aud.sfx('slash', 4);
  for (let i = 0; i < EN.n; i++) {
    const e = EN.a[i]; if (!e.alive || e.al > 0 || e.spawnT > 0 || e.vis < .3) continue;
    const dx = e.x - P.x, dy = e.y - P.y, rr = R0 + e.r; if (dx * dx + dy * dy > rr * rr) continue;
    const crit = R.f() < P.w.crit + P.critAdd + (P.heat >= 75 ? .1 : 0); e.sh = 0; n++;
    damageEnemy(e, dmg * (crit ? P.w.cm : 1), Math.atan2(dy, dx), 3); FX.spark(e.x, e.y, crit ? '#ffd700' : '#9fe8ff', 6);
  }
  const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, P.x, P.y) < R0 + B.r) { Boss.hitBody(B, dmg, Math.atan2(B.y - P.y, B.x - P.x), false, P.x, P.y); n++; }
  if (n) { G.hs = Math.max(G.hs, .03); shake(.2); }
  if (!second && P.sig === 'nodachi') P.ncr2 = .18; // TEMPEST: a second sweep a beat later
}
const CHAKRAM = { a: [], max: 3 };
const Chakram = {
  reset() { CHAKRAM.a.length = 0; },
  toss(a) {
    if (CHAKRAM.a.length >= CHAKRAM.max) CHAKRAM.a.shift();
    CHAKRAM.a.push({ x: P.x + Math.cos(a) * 16, y: P.y + Math.sin(a) * 16, a, t: 0, out: .34, loops: P.sig === 'chakram' ? 2 : 1, back: false, hit: [], spin: 0, l: 2.6 });
  },
  update(dt) {
    const L = CHAKRAM.a, dmg = .7 * P.w.dmg * P.dmgMul * G.dmgMod;
    for (let i = L.length - 1; i >= 0; i--) {
      const c = L[i]; c.t += dt; c.l -= dt; c.spin += dt * 24;
      if (!c.back) { const sp = 920 * Math.max(.15, 1 - c.t / c.out); c.x += Math.cos(c.a) * sp * dt; c.y += Math.sin(c.a) * sp * dt; if (c.t >= c.out || c.x < V.L || c.x > V.R || c.y < 20 || c.y > V.VH - 60) { c.back = true; c.hit.length = 0; } }
      else { const dx = P.x - c.x, dy = P.y - c.y, d = Math.hypot(dx, dy) || 1, sp = 980; c.x += dx / d * sp * dt; c.y += dy / d * sp * dt;
        if (d < 20) { if (--c.loops > 0) { c.back = false; c.t = 0; c.hit.length = 0; c.a = P.ang; } else { L.splice(i, 1); continue; } } }
      if (c.l <= 0) { L.splice(i, 1); continue; }
      for (let j = 0; j < EN.n; j++) {
        const e = EN.a[j]; if (!e.alive || e.al > 0 || e.spawnT > 0 || c.hit.indexOf(e.uid) >= 0) continue;
        if (dist(e.x, e.y, c.x, c.y) < e.r + 12) { c.hit.push(e.uid); damageEnemy(e, dmg, Math.atan2(e.y - c.y, e.x - c.x), 3); FX.spark(c.x, c.y, '#ff4fd8', 5); }
      }
      const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && c.hit.indexOf(-1) < 0 && dist(B.x, B.y, c.x, c.y) < B.r + 12) { c.hit.push(-1); Boss.hitBody(B, dmg, Math.atan2(B.y - c.y, B.x - c.x), false, c.x, c.y); }
    }
  },
  draw() {
    for (const c of CHAKRAM.a) {
      cx.save(); cx.translate(c.x, c.y); cx.rotate(c.spin); glow(0, 0, 26, '#ff4fd8', .5);
      cx.strokeStyle = '#ff4fd8'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 10, 0, TAU); cx.stroke();
      cx.fillStyle = '#ffd6f3'; for (let k = 0; k < 4; k++) { cx.rotate(TAU / 4); cx.beginPath(); cx.moveTo(10, -2); cx.lineTo(16, 0); cx.lineTo(10, 3); cx.closePath(); cx.fill(); }
      cx.restore();
    }
  }
};
function tessenParry(b, perfect) { // STEEL FAN: a parried shot splits into three; GALE on perfect parries
  const a = Math.atan2(b.vy, b.vx); for (let k = -1; k <= 1; k += 2) shard(b.x, b.y, a + k * .35, 520, '#bff3ff', .8 * P.w.dmg);
  if (perfect && P.sig === 'tessen') {
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || e.mb) continue; const d = dist(e.x, e.y, P.x, P.y); if (d < 170) { const q = Math.atan2(e.y - P.y, e.x - P.x); e.kbx = Math.cos(q) * 700; e.kby = Math.sin(q) * 700; e.stun = Math.max(e.stun, .6); } }
    FX.ring(P.x, P.y, 170, '#bff3ff', 5); FX.text(P.x, P.y - 34, lt('GALE!'), '#bff3ff', 15, true);
  }
}
