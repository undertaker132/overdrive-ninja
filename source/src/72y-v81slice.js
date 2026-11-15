/* ==========================================================================
   v81 · A CUT IN 3D IS A CUT IN 3D. Cutting an enemy split its flat 2D
   drawing in two over the 3D roof (the halves effect drew the 2D body even
   in the 3D view). In 3D the enemy's own model now splits along the cut:
   two clipped halves slide apart, spin, sink and fade, with the white cut
   line on the roof. Enemies that have a recorded death (the robots and the
   monsters) keep falling as before. Display only.
   ========================================================================== */
const Slice3D = {
  L: [], MAX: 12,
  on() { return typeof R3 !== 'undefined' && R3.on && W3D.live && W3D.models(); },
  find(uid) { for (const S of Feel.sl) if (S.e && S.e.uid === uid && !S.h3) return S; return null; },
  /* one half: a copy whose materials keep only the side of the cut plane (a plane fixed to the half, so it moves and spins with it) */
  half(g, n, root) {
    const T = THREE, h = g.clone(true), mats = [];
    h.traverse(o => { if (!o.isMesh || !o.material) return; const m = o.material.clone(); m.transparent = true; m.clippingPlanes = []; m.clipShadows = true; o.material = m; mats.push(m); o.castShadow = false; });
    root.add(h); h.updateMatrixWorld(true);
    const inv = h.matrixWorld.clone().invert(), c = new T.Vector3(); g.getWorldPosition(c);
    const local = new T.Plane().setFromNormalAndCoplanarPoint(n.clone().negate(), c).applyMatrix4(inv); // (keeps the side the normal points to)
    return { h, mats, local, world: new T.Plane() };
  },
  start(g, S) {
    const T = THREE, root = R3.root; R3.rn.localClippingEnabled = true; g.updateMatrixWorld(true);
    const na = S.a + Math.PI / 2, perp = new T.Vector3(Math.cos(na), Math.sin(na), 0);
    for (const c of g.children) if (c.isMesh && c.material && c.material.blending === T.AdditiveBlending) c.visible = false; // (no glow pool under the halves)
    const H = [this.half(g, perp, root), this.half(g, perp.clone().negate(), root)];
    root.remove(g); S.h3 = 1;
    this.L.push({ H, S, x: g.position.x, y: g.position.y, z: g.position.z, rz: g.rotation.z, sc: g.scale.clone(), t: 0, last: performance.now() });
  },
  tick() {
    const now = performance.now();
    for (let i = this.L.length - 1; i >= 0; i--) {
      const q = this.L[i], dt = Math.min(.05, Math.max(0, (now - q.last) / 1000)); q.last = now; q.t += dt;
      const S = q.S, d = S.d || .55, p = Math.min(1, q.t / d), ease = 1 - Math.pow(1 - p, 2), na = S.a + Math.PI / 2, off = ease * (S.sp || 120) * .35;
      q.H.forEach((hf, k) => { const sd = k ? -1 : 1, h = hf.h;
        h.position.set(q.x + Math.cos(na) * off * sd + Math.cos(S.a) * ease * 20, q.y + Math.sin(na) * off * sd + Math.sin(S.a) * ease * 20, q.z - p * p * 18);
        h.rotation.set(0, 0, q.rz + sd * (S.rot || 1) * ease * .4); h.scale.copy(q.sc); h.updateMatrixWorld(true);
        hf.world.copy(hf.local).applyMatrix4(h.matrixWorld); const a = 1 - p * p;
        for (const m of hf.mats) { m.clippingPlanes[0] = hf.world; m.opacity = a * (m.userData.op0 == null ? (m.userData.op0 = m.opacity) : m.userData.op0); } });
      if (p >= 1) { for (const hf of q.H) { R3.root.remove(hf.h); for (const m of hf.mats) m.dispose(); } this.L.splice(i, 1); }
    }
  },
  clear() { for (const q of this.L) for (const hf of q.H) { if (hf.h.parent) hf.h.parent.remove(hf.h); for (const m of hf.mats) m.dispose(); } this.L.length = 0; }
};
{
  // the 3D layer: a cut enemy that left the roof splits instead of vanishing (the corpse hook keeps the ones with a death clip)
  const sw = R3.sweep.bind(R3);
  R3.sweep = function () {
    try { if (Slice3D.on() && !CALM) for (const [k, r] of this.ents) { if (r.seen === this.frame || k[0] !== 'e' || !/^e\d+:/.test(k)) continue; const g = r.g; if (!g || g.mon || g.rob || Slice3D.L.length >= Slice3D.MAX) continue;
        const uid = +(k.slice(1).split(':')[0]), S = Slice3D.find(uid); if (!S) continue; let alive = false; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.uid === uid && e.alive) { alive = true; break; } } if (alive) continue;
        Slice3D.start(g, S); this.ents.delete(k); } } catch (e) { errLog(e); }
    try { Slice3D.tick(); } catch (e) { errLog(e); }
    return sw();
  };
  // the 2D halves: in the 3D view only the cut line is drawn on the roof (the 3D layer draws the halves)
  const ds0 = Feel.drawSlices.bind(Feel);
  Feel.drawSlices = function (rd) {
    if (!Slice3D.on() || !this.sl.length) return ds0(rd);
    cx.save(); const k = V.s * V.dpr; W3D.flatT(k);
    for (let i = this.sl.length - 1; i >= 0; i--) { const S = this.sl[i]; S.t += rd; if (S.t > S.d) { this.sl.splice(i, 1); continue; }
      if (S.t < .14) { const q = 1 - S.t / .14, L = (S.e.r || 12) * 2.6; cx.save(); cx.globalAlpha = q; cx.strokeStyle = '#ffffff'; cx.lineWidth = 3 * q + .5; cx.shadowColor = P.ca || '#00f2fe'; cx.shadowBlur = 12;
        cx.beginPath(); cx.moveTo(S.x - Math.cos(S.a) * L, S.y - Math.sin(S.a) * L); cx.lineTo(S.x + Math.cos(S.a) * L, S.y + Math.sin(S.a) * L); cx.stroke(); cx.restore(); } }
    cx.restore();
  };
  Pipe.on('pre', 'slice3d', () => { if (Slice3D.L.length && !(typeof R3 !== 'undefined' && R3.on && W3D.live)) Slice3D.clear(); }, 12);
}
