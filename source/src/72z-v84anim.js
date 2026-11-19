/* ==========================================================================
   v84 · NO MORE MANNEQUIN POSE. On a dash the hero's body clock runs 1.6
   times faster, but the cut's own countdown ran on the plain frame clock:
   the recorded cut finished and stopped while the game still thought it was
   playing, so for a few frames nothing held the body and it fell back
   toward the mannequin's arms-out rest pose. The countdown now reads how
   much of the cut is really left, and the body is never left with less
   than a full pose: whatever is missing goes to the walk or run under it.
   Display only.
   ========================================================================== */
const Anim84 = {
  /* how long the cut playing on this body really has left, in frame time */
  left(a, dash) { const c = a.getClip(), ts = Math.abs(a.getEffectiveTimeScale()) || 1; return Math.max(0, c.duration - a.time) / ts / (dash ? 1.6 : 1); },
  /* the running actions must add up to a whole pose: top the locomotion up */
  fill(h) {
    const r = h.r, loco = r.acts[r.cur]; if (!loco) return; let s = 0;
    for (const a of r.mixer._actions) if (a.isRunning()) s += a.getEffectiveWeight();
    if (s < .999) { if (!loco.isRunning()) loco.play(); loco.setEffectiveWeight(Math.min(1, loco.getEffectiveWeight() + (1 - s))); }
  }
};
{
  const ap = Moves.apply.bind(Moves);
  Moves.apply = function (g, o, rd) {
    const h = g && g.human;
    try { if (h && h.cutA && h.melee) { const a = h.cutA; h.cutT = a.isRunning() ? Anim84.left(a, !!o.dashing) + (rd || 0) : 0; } } catch (e) { errLog(e); }
    const r = ap(g, o, rd);
    try { if (h && h.r && h.r.mixer) Anim84.fill(h); } catch (e) { errLog(e); }
    return r;
  };
}
/* the scarf on the classic hero: each of its six links bent up to a radian on a dash, so the
   whole scarf rolled into a ring around the head. Now the links only wave a little and the
   scarf streams straight back the faster the hero goes (its hinge at the neck does the aiming) */
{
  const an = Human.anim.bind(Human);
  Human.anim = function (g, o, rd, t) {
    const r = an(g, o, rd, t);
    try { const h = g && g.human; if (h && g.scarf73 && h.sway) { const sp = clamp((o.spd || 0) / 420, 0, 1), dash = !!o.dashing, k = dash ? 1 : sp; let i = 0;
      for (const s of h.sway) { if (s[1] !== 'cape2') continue; s[0].rotation.y = (i ? .1 * (1 - k) : 0) + Math.sin(t * (3 + k * 10) - i * .9) * (.05 + .1 * k) * Math.min(1, i * .5 + .3); i++; } } } catch (e) { errLog(e); }
    return r;
  };
}
/* the impact holds: in a hit-stop the world stands still, but the 3D bodies, blades and sparks
   kept moving at full speed through it, which softened every big hit. Now the 3D picture
   follows the game's own clock: frozen in a hit-stop, slowed (never below 40%) while aiming */
Anim84.k = function () { if (typeof G === 'undefined' || G.state !== 'PLAY' || G.freeze > 0) return 1; if (G.hs > 0) return .05; return Math.max(.4, Math.min(1, G.ts == null ? 1 : G.ts)); };
{
  const rr = R3.render.bind(R3);
  R3.render = function (rd) { const k = CALM ? 1 : Anim84.k(), r0 = RDT; if (k < 1) RDT = (r0 || 1 / 60) * k; try { return rr((rd || 0) * k); } finally { RDT = r0; } };
}
/* the signature arts in the body, not only in the light: the samurai sinks into a low two-handed
   guard while its iai is ready and draws it as one wide horizontal cut; the shinobi's death
   marks land as a lunging stab; the onmyoji turns on its heel when it lays a spirit ward; the
   ninja's shadow clone steps out of a burst of smoke */
{
  const ai = Arts.iai.bind(Arts), as = Arts.strike.bind(Arts), ak = Arts.kill.bind(Arts), sl = Arts.slash.bind(Arts);
  Arts.iai = function () { Anim84.art = 'Melee_1H_Attack_Slice_Horizontal'; Anim84.ats = 1.45; return ai.apply(this, arguments); };
  Arts.strike = function () { const r = as.apply(this, arguments); if (this.mcd > 0) { Anim84.art = 'Melee_1H_Attack_Stab'; Anim84.ats = 1.7; } return r; };
  Arts.kill = function (e) { const w = this.wards.length, r = ak(e); if (this.wards.length > w) { Anim84.art = 'Melee_2H_Attack_Spin'; Anim84.ats = 1.6; } return r; };
  Arts.slash = function (a) { const cd = this.cd, r = sl(a); try { if (this.cd > cd && !CALM) { for (let i = 0; i < 14; i++) { const q = i / 14 * TAU; FX.spark(P.x + Math.cos(q) * 22, P.y + Math.sin(q) * 22, i % 2 ? '#00f2fe' : '#9aa3b5', 2); } FX.ring(P.x, P.y, 46, '#9aa3b5', 6); } } catch (e) { errLog(e); } return r; };
  const ap = Moves.apply.bind(Moves);
  Moves.apply = function (g, o, rd) {
    const r = ap(g, o, rd);
    try { const h = g && g.human; if (!h || !h.melee || !Moves75.isRunHero(g)) return r;
      if (Anim84.art && (g.mvDash || (Anim84.artT = (Anim84.artT || 0) + (rd || 0)) > .3)) { if (g.mvDash) Moves75.fire(h, Anim84.art, Anim84.ats); Anim84.art = null; Anim84.artT = 0; } // (once the dash's own cut has started, so the art's move takes this dash over)
      const ready = Arts.on() && Arts.cls() === 'samurai' && Arts.ready && !h.cutA, st = h.melee.Melee_2H_Idle;
      g.iai84 = (g.iai84 || 0) + ((ready ? 1 : 0) - (g.iai84 || 0)) * Math.min(1, (rd || .016) * 7); const k = g.iai84;
      if (k > .01) { if (st) { if (!st.isRunning()) { st.setLoop(THREE.LoopRepeat, Infinity); st.reset(); st.play(); } st.setEffectiveWeight(Math.max(st.getEffectiveWeight(), k)); }
        const B = h.B; if (B.spine) B.spine.rotateX(.32 * k); if (B.spine2) B.spine2.rotateY(-.3 * k); }
    } catch (e) { errLog(e); }
    return r;
  };
}
/* one bad pixel blacked out the whole picture: when a lit surface gives a value that is not a
   number (or an infinite one, past what the bloom's buffers hold), the bloom's blur spread it
   over every pixel and the frame came out black: the hero on the home screen and in the Hero
   Forge, and now and then a whole frame of a run. The bloom now drops such values first */
{
  const BP = THREE.UnrealBloomPass && THREE.UnrealBloomPass.prototype, rd = BP && BP.render;
  if (rd) BP.render = function () {
    if (!this.safe84) { this.safe84 = 1; try { const m = this.materialHighPassFilter, k = 'vec4 texel = texture2D( tDiffuse, vUv );';
      if (m && m.fragmentShader.indexOf(k) >= 0) { m.fragmentShader = m.fragmentShader.replace(k, k + ' texel.r = (texel.r >= 0.0 && texel.r < 1e4) ? texel.r : 0.0; texel.g = (texel.g >= 0.0 && texel.g < 1e4) ? texel.g : 0.0; texel.b = (texel.b >= 0.0 && texel.b < 1e4) ? texel.b : 0.0;'); m.needsUpdate = true; } } catch (e) { errLog(e); } }
    return rd.apply(this, arguments);
  };
}
/* the wolf's and the dragon's tails: every link bent upward, so the tail rose over the back and
   curled into a loop above the head. They now hang down behind and stream out straight when the
   hero runs (the cat keeps its tail raised) */
{
  const bd = Skin3D.build.bind(Skin3D);
  Skin3D.build = function (g, body) { const r = bd.apply(this, arguments); try { if (body === 'wolf' || body === 'dragon') for (const s of g.sway || []) if (s[1] === 'tail') s[1] = 'tailD'; } catch (e) { errLog(e); } return r; };
  const an = Skin3D.anim.bind(Skin3D);
  Skin3D.anim = function (g, o, rd, t) {
    const r = an.apply(this, arguments);
    try { const sp = clamp((o && o.spd || 0) / 420, 0, 1), dash = !!(o && o.dashing);
      for (const [p, k, amp, , ph] of g.sway || []) if (k === 'tailD') { p.rotation.z = Math.sin(t * (2.4 + sp * 6) - ph) * amp * (.6 - sp * .3); p.rotation.y = dash ? -.02 : -.2 + sp * .17; } } catch (e) { errLog(e); }
    return r;
  };
}
/* the wolf's and the viking's fur collars stood upright around the head like a halo: they now lie around the neck */
Anim84.collar = function (g) {
  const T = THREE; let ring = null, neck = null, sh = null;
  g.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'TorusGeometry' && ((Math.abs(o.geometry.parameters.radius - 3.4) < .01 && Math.abs(o.geometry.parameters.tube - 1.2) < .01) || (Math.abs(o.geometry.parameters.radius - 3.6) < .01 && Math.abs(o.geometry.parameters.tube - 1.3) < .01))) ring = o; /* (the wolf's and the viking's fur collars) */ if (o.isBone) { const n = o.name.replace(/[:]/g, ''); if (/Neck$/.test(n)) neck = o; else if (/LeftShoulder$/.test(n)) sh = o; } });
  if (!ring || !neck || !sh || g.parent) return; g.updateMatrixWorld(true); // (the body on its own: its frame is the world here, up is z)
  const W = o => o.getWorldPosition(new T.Vector3()), nk = W(neck), s = W(sh), target = new T.Vector3(nk.x, nk.y, s.z + (nk.z - s.z) * .55), q0 = ring.quaternion.clone(), box = new T.Box3(), c = new T.Vector3(), sz = new T.Vector3();
  let best = null, bz = 1e9; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) { const q = q0.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(i * Math.PI / 2, j * Math.PI / 2, k * Math.PI / 2))); ring.quaternion.copy(q); ring.updateMatrixWorld(true); box.setFromObject(ring).getSize(sz); if (sz.z < bz - 1e-6) { bz = sz.z; best = q; } }
  ring.quaternion.copy(best); ring.scale.multiplyScalar(.7); ring.updateMatrixWorld(true); box.setFromObject(ring).getCenter(c);
  const P = ring.parent; ring.position.add(P.worldToLocal(target.clone()).sub(P.worldToLocal(c.clone())));
};
{ const hb = Human.build.bind(Human); Human.build = function () { const g = hb.apply(this, arguments); try { if (g && g.human) Anim84.collar(g); } catch (e) { errLog(e); } return g; }; }
/* the yeti wore no fur on the real body (its old fur ball swallowed the body and was taken off):
   shaggy white fur now hangs on its shoulders, chest, forearms and shins */
Anim84.fur = function (g, ca) {
  const T = THREE, h = g.human; if (!h || g.fur84 || g.parent) return; g.fur84 = 1; g.updateMatrixWorld(true);
  const bb = new T.Box3().setFromObject(h.r.o), H = bb.getSize(new T.Vector3()).z || 1, mat = new T.MeshStandardMaterial({ color: new T.Color('#eef3ff').lerp(new T.Color(ca || '#9fd8ff'), .18), roughness: 1, metalness: 0, flatShading: true });
  const geo = new T.IcosahedronGeometry(1, 1), bones = {}; h.r.o.traverse(o => { if (o.isBone) bones[o.name.replace(/mixamorig:?/, '')] = o; });
  const tuft = (bn, k, sx, sy, sz) => { const b = bones[bn]; if (!b) return; const ws = b.getWorldScale(new T.Vector3()), r = H * k; for (let i = 0; i < 3; i++) { const m = new T.Mesh(geo, mat); m.castShadow = true; const a = i / 3 * TAU; m.position.set(Math.cos(a) * r * .35 / Math.abs(ws.x), (i - 1) * r * .25 / Math.abs(ws.y), Math.sin(a) * r * .35 / Math.abs(ws.z)); m.scale.set(r * sx / Math.abs(ws.x), r * sy / Math.abs(ws.y), r * sz / Math.abs(ws.z)); m.rotation.set(i * 1.3, i * .7, i * 2.1); b.add(m); } };
  tuft('Neck', .058, 1.5, .7, 1.3); tuft('LeftShoulder', .06, 1, 1, 1); tuft('RightShoulder', .06, 1, 1, 1); tuft('Spine2', .07, 1.3, 1, 1.1);
  tuft('LeftForeArm', .035, 1, 1.2, 1); tuft('RightForeArm', .035, 1, 1.2, 1); tuft('LeftLeg', .04, 1, 1.3, 1); tuft('RightLeg', .04, 1, 1.3, 1);
};
{ const hb = Human.build.bind(Human); Human.build = function (L) { const g = hb.apply(this, arguments); try { if (L && L.body === 'yeti' && g && g.human) Anim84.fur(g, L.a); } catch (e) { errLog(e); } return g; }; }
