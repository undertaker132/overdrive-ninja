/* =====================================================================
   VERSION 58: A REAL HUMAN BODY FOR THE HERO
   The hero (in runs, on the home screen and in the Hero Forge) is now a
   real human body: real proportions, a skeleton, and recorded motion for
   standing, walking and running. Every skin keeps its own look on it:
   a matte suit in the skin's colors with glowing lines at the joints,
   and the skin's own gear moved onto the body (helmets, visors, hair,
   horns, ears, hats, crests on the head; capes, coats, wings, tails,
   robes, armored skirts on the hips and back) with the weapon in the hand.
   The body leans into a dash. If the model cannot load, the hero built in code stays.
   Body model: "X Bot" from Mixamo (Adobe), free for use in games.
   ===================================================================== */
Models.src.xbot = 'models/xbot.glb';
const Human = {
  H: 46, // the hero's height in game units (the built-in hero is about as tall)
  bone(o, n) { let b = null; o.traverse(x => { if (!b && x.isBone && x.name.replace(/[:]/g, '').endsWith(n)) b = x; }); return b; },
  /* skin -> a human hero: { g (z-up, facing +x), r (mixer, clips), bones, gear } */
  build(L, wid) {
    const T = THREE, g = new T.Group(), wrap = new T.Group(); wrap.rotation.z = Math.PI / 2; g.add(wrap);
    const suit = Skin3D.tint('#14161f', L.a, .22, .25, .62), lines = R3.glow(L.a, 2.2);
    const r = Models.inst('xbot', null); wrap.add(r.o);
    r.o.traverse(m => { if (!m.isMesh) return; m.material = /Joints/i.test(m.material.name || '') ? lines : suit; m.castShadow = true; });
    // the size: measured in the idle pose (the clips carry the skeleton's own scale), head to toes along the game's up axis
    r.o.rotation.x = Math.PI / 2; Models.play(r, 'idle', .01); r.mixer.update(0); g.updateMatrixWorld(true);
    const hb = this.bone(r.o, 'Head'), fb = this.bone(r.o, 'LeftToeBase') || this.bone(r.o, 'LeftFoot'), hv = new T.Vector3(), fv = new T.Vector3(); hb.getWorldPosition(hv); fb.getWorldPosition(fv); g.worldToLocal(hv); g.worldToLocal(fv);
    const k = this.H / Math.max(1e-6, (hv.z - fv.z) * 1.12); r.o.scale.multiplyScalar(k); g.updateMatrixWorld(true); hb.getWorldPosition(hv); fb.getWorldPosition(fv); g.worldToLocal(fv); r.o.position.z -= 0; wrap.position.z = -fv.z + 1.2;
    g.updateMatrixWorld(true);
    const B = { hips: this.bone(r.o, 'Hips'), spine: this.bone(r.o, 'Spine1'), spine2: this.bone(r.o, 'Spine2'), head: hb, rArm: this.bone(r.o, 'RightArm'), rFore: this.bone(r.o, 'RightForeArm'), rHand: this.bone(r.o, 'RightHand'), lHand: this.bone(r.o, 'LeftHand') };
    // the skin's gear: built on the code hero, then moved onto the bones
    const pr = R3.hero(L.a, L.b, false); try { R3.weapon(pr, wid); R3.dress(pr, L.body || 'ninja', L.a, L.b); } catch (e) { errLog(e); }
    const map = new T.Matrix4().makeBasis(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0)); // (code-hero axes: x forward, y side, z up  ->  bone axes: z forward, x side, y up)
    const onBone = (bone, unitsWorld, up) => { const grp = new T.Group(), ws = new T.Vector3(); bone.getWorldScale(ws); grp.matrixAutoUpdate = true; grp.quaternion.setFromRotationMatrix(map); grp.scale.setScalar(unitsWorld / ws.x); grp.position.y = (up || 0) / ws.x; bone.add(grp); return grp; };
    const s0 = pr.s0 || 1.35, head = pr.head, torso = pr.torso, sway = [];
    // head: everything but the code skull, its face mask and the hood ridge (visor, hair, horns, ears, hats, crests stay)
    const hg = onBone(hb, s0 * .82, this.H * .05); const hk = [...head.children];
    hk.forEach((c, i) => { if (i === 0 || i === 2 || i === 3) return; hg.add(c); });
    // hips/back: the skin's extras on the torso (capes, wings, tails, robes, skirts, drum rings, packs) and the scarf
    const tg = onBone(B.hips, s0, -s0 * 1.2); const tk = [...torso.children].slice(pr.torsoN || torso.children.length);
    for (const c of tk) tg.add(c); if (pr.scarf && pr.scarf[0]) { const sc = pr.scarf[0]; sc.position.z -= 1; tg.add(sc); pr.scarf.forEach((s, i) => sway.push([s, 'cape2', .16, .1, i * .7])); }
    for (const sw of pr.sway || []) sway.push(sw);
    // the weapon in the right hand (and a second one in the left), pointing out of the fist
    const wg = onBone(B.rHand, s0, 0); wg.rotation.set(0, -Math.PI / 2, 0); wg.position.y = 3 / wg.scale.x; wg.add(pr.blade); pr.blade.position.set(0, 0, 0);
    if (pr.blade2) { const wl = onBone(B.lHand, s0, 0); wl.rotation.set(0, -Math.PI / 2, 0); wl.position.y = 3 / wl.scale.x; wl.add(pr.blade2); pr.blade2.position.set(0, 0, 0); }
    g.add(R3.pool(L.a, 46, .38)); g.pool = g.children[g.children.length - 1];
    g.human = { r, B, sway, dum: { torso: new T.Group(), head: new T.Group(), sway } }; g.blade = pr.blade; g.blade2 = pr.blade2; g.bladeMesh = pr.bladeMesh; g.bladeMat = pr.bladeMat || lines; g.trim = lines; g.visor = { material: R3.std({ color: 0x000000 }) }; g.plate = R3.std({ color: 0x000000 }); // (the run's color refresh writes to these; the suit keeps the skin's look) g.s0 = 1; g.wfam = pr.wfam; g.spin = pr.spin;
    return g;
  },
  /* motion: the recorded clips by speed, then the sword arm toward the aim and a lean into a dash */
  anim(g, o, rd, t) {
    const h = g.human, r = h.r, sp = o.spd || 0, dash = !!o.dashing;
    g.position.set(o.x, o.y, 0); g.rotation.z = o.face || 0; g.visible = o.alpha == null || o.alpha > .5;
    Models.play(r, dash || sp > 260 ? 'run' : sp > 30 ? 'walk' : 'idle', .22); r.mixer.update(Math.min(.05, rd || 0) * (dash ? 1.6 : 1));
    const B = h.B;
    if (dash && B.spine) B.spine.rotation.x += .45;
    try { Skin3D.anim(h.dum, o, rd, t); } catch (e) { errLog(e); }
    if (g.spin) g.spin.rotation.z = t * 14;
    if (g.pool) g.pool.material.opacity = (dash ? .55 : .38) + Math.sin(t * 4) * .04;
  }
};
{
  // the code hero remembers where its own torso ends, so the skin's extras can be told apart
  const hr8 = R3.hero.bind(R3); R3.hero = function () { const g = hr8.apply(this, arguments); if (g.torso) g.torsoN = g.torso.children.length; return g; };
  const ok = () => Models.ok('xbot') && !CALM;
  // in runs
  const ent9 = R3.ent.bind(R3);
  R3.ent = function (key, mk) {
    if (key !== 'hero' || !ok()) return ent9(key, mk);
    const body = (P.skin && P.skin.body) || 'ninja', wid = (P.w && P.w.id) || 'katana', sig = 'H' + body + '|' + wid + '|' + (P.ca || '') + (P.cb || ''), r0 = this.ents.get('hero');
    if (r0 && r0.sig !== sig) { this.root.remove(r0.g); this.ents.delete('hero'); }
    let rr = this.ents.get('hero'); // (added directly: the older hero hooks would dress it as the code-built hero)
    if (!rr) { const g = Human.build({ body, a: (W3D.ho && W3D.ho.ca) || P.ca || '#00f2fe', b: (W3D.ho && W3D.ho.cb) || P.cb || '#ff0844' }, wid); rr = { g, seen: 0, sig }; this.root.add(g); this.ents.set('hero', rr); try { Look.rim && g.traverse(o => { if (o.isMesh) Look.rim(o.material); }); } catch (e) { errLog(e); } }
    rr.seen = this.frame; rr.sig = sig; return rr.g;
  };
  const ah8 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) { if (g && g.human) { try { Human.anim(g, o, rd, t); } catch (e) { errLog(e); } return; } return ah8(g, o, rd, t); };
  // the home screen and the Hero Forge
  const bd9 = Mini.build.bind(Mini);
  Mini.build = function () {
    if (!ok()) { if (this.g && this.g.human) this.sig = ''; return bd9(); }
    const L = this.look(), sig = 'H' + L.body + L.a + L.b + L.w; if (sig === this.sig && this.g) return; this.sig = sig;
    if (this.g) this.inner.remove(this.g); const g = Human.build(L, L.w); if (g.pool) g.pool.visible = false; this.g = g; this.inner.add(g);
    this.disc.material.color.set(L.a); this.fill.color.set(L.a); try { this.studio(); } catch (e) { errLog(e); }
  };
  const mt = Mini.mount.bind(Mini); Mini.mount = function () { const r = mt.apply(this, arguments); if (r) Models.load('xbot'); return r; };
  Pipe.on('post', 'models58', () => { if (!Models.got.xbot && R3.ok && W3D.live) Models.load('xbot'); if (Models.got.xbot && Mini.g && !Mini.g.human && Mini.raf) Mini.sig = ''; }, 99);
}
