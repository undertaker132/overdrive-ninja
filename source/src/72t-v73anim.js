/* =====================================================================
   VERSION 73: ANIMATION FIXES
   · the blade sits in the fist: the weapon was turned twice when it was
     put in the hand (the second turn replaced the first), so on the real
     3D bodies it stuck out sideways from the hip, at an angle that kept
     changing, and it was drawn twice the length it should be. It now
     comes out of the fist pointing forward and a little low, the way a
     sword is held, and a katana is about half the hero's height (long
     weapons stay longer, short ones shorter, in proportion).
   · the scarf is tied at the neck: it hung from the hips with an upward
     offset, its trail stood over the head like a crest and fell in front
     of the chest. It now hangs down the back from the neck, lifts when
     the hero runs and streams out flat behind on a dash.
   · the slime and the yeti no longer stand inside a giant ball: the round
     body of the old drawn hero was left on the real body's hips.
   · an executed elite showed a damage number of a hundred million; it
     shows the health the cut really took.
   · enemies walk and run: their 3D bodies read a speed of zero (they move
     by position, not velocity) and glided along in a standing pose; the
     animation now measures how far each one really moved.
   Both are aimed from the body itself (where the toes point is forward)
   on the first frame each hero moves, so they sit right on every body.
   Display only.
   ===================================================================== */
const Grip = {
  K: .52, DOWN: .35, // blade: length factor, how far below level it points (radians)
  SC: { rest: .6, walk: .45, run: .25, dash: .05 }, // scarf: radians below level, behind the hero
  fix(g) {
    if (!g || !g.human || g.grip73) return; g.grip73 = 1; const T = THREE;
    for (const bl of [g.blade, g.blade2]) { const wg = bl && bl.parent; if (wg) wg.scale.multiplyScalar(this.K); }
    // the old drawn hero's round body (the slime's blob, the yeti's fur ball) sat on the hips and swallowed the real body: off
    let hips = null; g.human.r.o.traverse(o => { if (!hips && o.isBone && /Hips$/.test(o.name)) hips = o; });
    if (hips) hips.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && o.geometry && o.geometry.type === 'SphereGeometry') { const sc = o.scale; if (o.geometry.parameters.radius * Math.max(sc.x, sc.y, sc.z) > 4) o.visible = false; } });
    // the scarf: off the hips, onto the neck, on a hinge it hangs from
    const h = g.human, sc = h.sway.filter(s => s[1] === 'cape2').map(s => s[0]), root = sc[0], tg = root && root.parent; let neck = null;
    h.r.o.traverse(o => { if (!neck && o.isBone && /Neck$/.test(o.name.replace(/[:]/g, ''))) neck = o; });
    if (root && tg && neck) { const grp = new T.Group(); grp.quaternion.copy(tg.quaternion); grp.scale.copy(tg.scale); neck.add(grp); const pv = new T.Group(); pv.position.set(-1.6, 0, 1); grp.add(pv); pv.add(root); root.position.set(0, 0, 0); g.scarf73 = pv; }
  },
  /* aim the blade and the scarf from the body: forward is where the toes point, up is up */
  cal(g) {
    const T = THREE, h = g.human, W = o => o.getWorldPosition(new T.Vector3()); let toe = null, foot = null;
    h.r.o.traverse(o => { if (!o.isBone) return; const n = o.name.replace(/[:]/g, ''); if (/LeftToeBase$/.test(n)) toe = o; else if (/LeftFoot$/.test(n)) foot = o; });
    if (!toe || !foot) return false; g.updateMatrixWorld(true);
    const fwd = W(toe).sub(W(foot)); fwd.y = 0; if (fwd.lengthSq() < 1e-8) return false; fwd.normalize(); const up = new T.Vector3(0, 1, 0);
    const aim = k => fwd.clone().multiplyScalar(Math.cos(k)).addScaledVector(up, -Math.sin(k)), back = k => fwd.clone().multiplyScalar(-Math.cos(k)).addScaledVector(up, -Math.sin(k));
    // (a search, not a rotation sum: the scene's mirrored root makes world rotations unreliable to invert)
    const tgt = aim(this.DOWN), cand = []; for (let i = 0; i < 400; i++) { const y = 1 - (i + .5) / 200, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996; cand.push(new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); }
    for (const bl of [g.blade, g.blade2]) { const wg = bl && bl.parent; if (!wg || !wg.parent) continue; bl.rotation.set(0, 0, 0); bl.updateMatrix();
      // which way the blade's own mesh runs from the grip (measured, in the blade's frame)
      const inv = new T.Matrix4(), c = new T.Vector3(), bb = new T.Box3(); bl.updateMatrixWorld(true); inv.copy(bl.matrixWorld).invert();
      bl.traverse(o => { if (o.isMesh && o.geometry) { o.geometry.computeBoundingBox(); const b2 = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).applyMatrix4(inv); bb.union(b2); } });
      bb.getCenter(c); const pr = new T.Object3D(); pr.position.copy(c.lengthSq() > 1e-6 ? c.normalize().multiplyScalar(10) : new T.Vector3(10, 0, 0)); bl.add(pr);
      let best = null, bs = -2; const nx = new T.Vector3(-1, 0, 0);
      for (const d of cand) { wg.quaternion.setFromUnitVectors(nx, d); wg.updateMatrixWorld(true); const v = W(pr).sub(W(wg)).normalize(), s = v.dot(tgt); if (s > bs) { bs = s; best = d; } }
      wg.quaternion.setFromUnitVectors(nx, best); bl.remove(pr); }
    const pv = g.scarf73; if (pv) { let tip = null; pv.traverse(o => { if (o.isMesh) tip = o; });
      if (tip) { const want = {}; for (const k in this.SC) want[k] = back(this.SC[k]); const best = {}, sc = {};
        for (let a = 0; a < 6.283; a += .04) { pv.rotation.y = a; pv.updateMatrixWorld(true); const d = W(tip).sub(W(pv)).normalize();
          for (const k in want) { const s = d.dot(want[k]); if (sc[k] == null || s > sc[k]) { sc[k] = s; best[k] = a; } } }
        for (const k in best) { let a = best[k]; while (a - best.rest > Math.PI) a -= 6.283; while (best.rest - a > Math.PI) a += 6.283; best[k] = a; } // (all on the same side of the turn, so the scarf swings the short way)
        g.sc73 = best; pv.rotation.y = best.rest; } }
    return true;
  }
};
{
  const hb3 = Human.build.bind(Human);
  Human.build = function () { const g = hb3.apply(this, arguments); try { Grip.fix(g); } catch (e) { errLog(e); } return g; };
  const an3 = Human.anim.bind(Human);
  Human.anim = function (g, o, rd, t) {
    const r = an3(g, o, rd, t);
    try { if (g && g.grip73 && !g.cal73) g.cal73 = Grip.cal(g) ? 1 : 0;
      const pv = g && g.scarf73, A = g && g.sc73; if (pv && A) { const sp = o.spd || 0, want = o.dashing ? A.dash : sp > 200 ? A.run : sp > 30 ? A.walk : A.rest; pv.rotation.y += (want - pv.rotation.y) * Math.min(1, (rd || .016) * 8); } } catch (e) { errLog(e); }
    return r;
  };
}
/* the number over an executed elite: the execution deals the elite's health plus a million (so nothing survives it), and the number showed that million.
   It now shows the health the cut actually took. (Display only: the hit itself is unchanged.) */
{ const dn0 = dmgNum; dmgNum = function (x, y, n, crit, big) { if (n >= 1e8) n -= 1e8; return dn0(x, y, n, crit, big); }; }
/* enemies walk: most enemies move by changing their position, not by a velocity, so every 3D enemy (the robots, the oni and demons, the
   drawn bodies' legs) read a speed of zero and glided across the roof in its standing pose. The animation now measures how far each enemy
   really moved since the last frame. (It lends that speed to the animation for the moment it is drawn, then puts the enemy's own values back.) */
{
  const ae9 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) {
    if (!g || !e) return ae9(g, e, t);
    const m = g.mv73 || (g.mv73 = { x: e.x, y: e.y, t, vx: 0, vy: 0, uid: e.uid }); if (m.uid !== e.uid) { m.x = e.x; m.y = e.y; m.t = t; m.vx = m.vy = 0; m.uid = e.uid; }
    const dt = t - m.t; if (dt > .001) { const k = Math.min(1, dt * 10), jump = Math.hypot(e.x - m.x, e.y - m.y) > 200; const vx = jump ? 0 : (e.x - m.x) / dt, vy = jump ? 0 : (e.y - m.y) / dt; m.vx += (vx - m.vx) * k; m.vy += (vy - m.vy) * k; m.x = e.x; m.y = e.y; m.t = t; }
    const ovx = e.vx, ovy = e.vy, own = Math.hypot(ovx || 0, ovy || 0) > 1;
    if (!own) { e.vx = m.vx; e.vy = m.vy; }
    try { return ae9(g, e, t); } finally { if (!own) { e.vx = ovx; e.vy = ovy; } }
  };
}
/* in the studio (home screen, Hero Forge, results) a tap's cut plays at a showing pace: at the dash's pace it was over in a blink */
{
  const ap7 = Moves.apply.bind(Moves);
  Moves.apply = function (g, o, rd) { const r = ap7(g, o, rd); try { const h = g && g.human, a = h && h.cutA; if (a && g === Mini.g && a.timeScale > 1.5) { a.setEffectiveTimeScale(1.05); h.cutT = (a.getClip().duration - a.time) / 1.05; } } catch (e) { errLog(e); } return r; };
}
/* (also in this version: the crate films and the crate landing could start on a frame stamped a moment before they began; that negative step
   opened the seals film on its last scene, a flash and burst in the crate's true rarity color, before the seals had even been struck) */
