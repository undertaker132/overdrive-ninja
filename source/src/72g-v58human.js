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
Models.src.xbot = 'models/xbot.glb'; Models.src.soldier = 'models/soldier.glb';
const Human = {
  H: 46, // the hero's height in game units (the built-in hero is about as tall)
  bone(o, n) { let b = null; o.traverse(x => { if (!b && x.isBone && x.name.replace(/[:]/g, '').endsWith(n)) b = x; }); return b; },
  /* skin -> a human hero: { g (z-up, facing +x), r (mixer, clips), bones, gear } */
  /* which body suits which skin: the armored and heavy ones wear the soldier (armor, helmet, gear), the agile ones the smooth body */
  HEAVY: { knight: 1, shogun: 1, chromesam: 1, sovereign: 1, mecha: 1, exo: 1, viking: 1, rider: 1, oni: 1, raijin: 1, ashura: 1 },
  base(body) { return this.HEAVY[body] && Models.ok('soldier') ? 'soldier' : 'xbot'; },
  SW: { a1: new THREE.Vector3(0, 1, 0), k1: 1.3, a2: new THREE.Vector3(0, 0, 1), k2: 0, tw: 1 }, // (the swing: axes of the arm bones, found by eye)
  clip(r, n) { return r.acts[n] ? n : r.acts[n[0].toUpperCase() + n.slice(1)] ? n[0].toUpperCase() + n.slice(1) : n; },
  build(L, wid) {
    const T = THREE, g = new T.Group(), wrap = new T.Group(); wrap.rotation.z = Math.PI / 2; g.add(wrap);
    const body = L.body || 'ninja', base = this.base(body), lines = R3.glow(L.a, 2.2), suit = Skin3D.tint('#14161f', L.a, .22, .25, .62);
    const r = Models.inst(base, null); r.base = base; wrap.add(r.o); if (base === 'soldier') wrap.rotation.z = -Math.PI / 2; // (the soldier faces the other way)
    if (base === 'xbot') r.o.traverse(m => { if (!m.isMesh) return; m.material = /Joints/i.test(m.material.name || '') ? lines : suit; m.castShadow = true; });
    else { const done = new Map(); r.o.traverse(m => { if (!m.isMesh) return; let c = done.get(m.material); if (!c) { c = m.material.clone(); if (c.color) c.color.lerp(new T.Color(L.a), .3); c.emissive = new T.Color(L.a); c.emissiveIntensity = .06; c.side = T.DoubleSide; done.set(m.material, c); } m.material = c; m.castShadow = true; }); }
    // the size: measured in the idle pose (the clips carry the skeleton's own scale), head to toes along the game's up axis
    r.o.rotation.x = Math.PI / 2; Models.play(r, this.clip(r, 'idle'), .01); r.mixer.update(0); g.updateMatrixWorld(true);
    const hb = this.bone(r.o, 'Head'), fb = this.bone(r.o, 'LeftToeBase') || this.bone(r.o, 'LeftFoot'), hv = new T.Vector3(), fv = new T.Vector3(); hb.getWorldPosition(hv); fb.getWorldPosition(fv); g.worldToLocal(hv); g.worldToLocal(fv);
    const k = this.H / Math.max(1e-6, (hv.z - fv.z) * 1.12); r.o.scale.multiplyScalar(k); g.updateMatrixWorld(true); fb.getWorldPosition(fv); g.worldToLocal(fv); wrap.position.z = -fv.z + 1.2; g.updateMatrixWorld(true);
    const B = { hips: this.bone(r.o, 'Hips'), spine: this.bone(r.o, 'Spine1'), spine2: this.bone(r.o, 'Spine2'), head: hb, top: this.bone(r.o, 'HeadTop_End'), rArm: this.bone(r.o, 'RightArm'), rFore: this.bone(r.o, 'RightForeArm'), rHand: this.bone(r.o, 'RightHand'), lHand: this.bone(r.o, 'LeftHand') };
    // the skin's gear: built on the code hero, then moved onto the bones
    const pr = R3.hero(L.a, L.b, false); try { R3.weapon(pr, wid); R3.dress(pr, body, L.a, L.b); } catch (e) { errLog(e); }
    const map = new T.Matrix4().makeBasis(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0)); // (code-hero axes: x forward, y side, z up  ->  bone axes: z forward, x side, y up)
    const onBone = (bone, unitsWorld, up) => { const grp = new T.Group(), ws = new T.Vector3(); bone.getWorldScale(ws); grp.quaternion.setFromRotationMatrix(map); grp.scale.setScalar(unitsWorld / ws.x); grp.position.y = (up || 0) / ws.x; bone.add(grp); return grp; };
    const s0 = pr.s0 || 1.35, head = pr.head, torso = pr.torso, sway = [];
    // the head, fitted: its center halfway to the top of the skull, its size from the real head
    const tp = B.top ? B.top.position.clone() : new T.Vector3(0, 20, 0), hr = tp.length() * .5, hg = new T.Group(); hg.quaternion.setFromRotationMatrix(map); hg.position.copy(tp).multiplyScalar(.5); hg.position.z += hr * .12; hg.scale.setScalar(hr / 3.7 * 1.02); hb.add(hg);
    const F = typeof FACE !== 'undefined' && FACE[body], A = typeof ANIME !== 'undefined' && ANIME[body], heavy = base === 'soldier';
    [...head.children].forEach((c, i) => { if (i === 0 || i === 3 || c.userData.hair || c.userData.eye) return; if (i === 1 && (F || heavy)) return; if (i === 2 && (F || heavy)) return; // (the skull, the hood ridge, the old hair and eyes; no visor or mask over a painted face or a helmet)
      if (heavy && c.isMesh && c.geometry && c.geometry.type === 'SphereGeometry') return; hg.add(c); });
    if (A) this.hair(hg, A); if (F) { this.face(hg, F, A); g.headK = .78; hg.scale.multiplyScalar(1 / .78); hg.position.multiplyScalar(1 / .78); } // (a painted face: the mannequin's own head shrinks inside it)
    // hips/back: the skin's extras on the torso (capes, wings, tails, robes, skirts, drum rings, packs) and the scarf
    const tg = onBone(B.hips, s0, -s0 * 1.2); const tk = [...torso.children].slice(pr.torsoN || torso.children.length);
    for (const c of tk) tg.add(c); if (pr.scarf && pr.scarf[0] && !heavy) { const sc = pr.scarf[0]; sc.position.z -= 1; tg.add(sc); pr.scarf.forEach((sg, i) => sway.push([sg, 'cape2', .16, .1, i * .7])); }
    for (const sw of pr.sway || []) sway.push(sw);
    // the weapon in the right hand (and a second one in the left), pointing out of the fist
    const wg = onBone(B.rHand, s0, 0); wg.rotation.set(0, -Math.PI / 2, 0); wg.position.y = 3 / wg.scale.x; wg.add(pr.blade); pr.blade.position.set(0, 0, 0);
    if (pr.blade2) { const wl = onBone(B.lHand, s0, 0); wl.rotation.set(0, -Math.PI / 2, 0); wl.position.y = 3 / wl.scale.x; wl.add(pr.blade2); pr.blade2.position.set(0, 0, 0); }
    g.add(R3.pool(L.a, 46, .38)); g.pool = g.children[g.children.length - 1];
    g.human = { r, B, sway, dum: { torso: new T.Group(), head: new T.Group(), sway } };
    g.blade = pr.blade; g.blade2 = pr.blade2; g.bladeMesh = pr.bladeMesh; g.bladeMat = pr.bladeMat || lines; g.trim = lines; g.s0 = 1; g.wfam = pr.wfam; g.spin = pr.spin;
    g.visor = { material: R3.std({ color: 0x000000 }) }; g.plate = R3.std({ color: 0x000000 }); // (the run's color refresh writes to these two; the suit keeps the skin's look)
    return g;
  },
  /* real hair: a cap over the skull and many thin layered spikes, swept back, with bangs */
  hair(hg, A) {
    const T = THREE, P0 = R3.part.bind(R3), up = new T.Vector3(0, 0, 1), m = Skin3D.tint('#000000', A.hair, 1, .05, .5), tip = A.tip ? Skin3D.tint('#000000', A.tip, 1, .05, .5) : m;
    const cap = P0(new T.SphereGeometry(4.35, 22, 12, 0, TAU, 0, Math.PI * .4).rotateX(Math.PI / 2), m, -.7, 0, .45, hg); void cap; // (the crown and the back only: the face stays clear)
    if (A.hat) return;
    const n = 30 + (A.spikes | 0) * 2, len = 3.4 + A.len * .8;
    for (let i = 0; i < n; i++) { const u = i / n, ring = i % 3, az = Math.PI + (u - .5) * (2.2 + ring * .5), el = .25 + ring * .32 + A.up * .3 + Math.sin(i * 7.3) * .08;
      const d = new T.Vector3(Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)).normalize(), L = len * (.7 + ((i * 37) % 10) / 22) * (1 + A.up * .35 * Math.sin(el));
      const q = P0(new T.ConeGeometry(.95 - ring * .12, L, 5).rotateX(Math.PI / 2).translate(0, 0, L / 2), (A.tip && ring === 2) ? tip : m, d.x * 3.8 - .4, d.y * 3.8, d.z * 3.8 + .3, hg); q.quaternion.setFromUnitVectors(up, d); }
    for (let i = 0; i < 6; i++) { const d = new T.Vector3(.75, (i - 2.5) * .28, .15 - (i % 2) * .15).normalize(), L = 1.8 + (i % 3) * .5; const q = P0(new T.ConeGeometry(.45, L, 5).rotateX(Math.PI / 2).translate(0, 0, L / 2), m, d.x * 3.3, d.y * 3.3, 1.6, hg); q.quaternion.setFromUnitVectors(up, new T.Vector3(.5, (i - 2.5) * .12, -.85).normalize()); }
  },
  /* a painted face on the front of the head: skin, anime eyes with an iris and a shine, brows, a mouth */
  face(hg, F, A) {
    const T = THREE, cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d'), cx0 = 256, cy0 = 128;
    x.fillStyle = F.skin; x.fillRect(0, 0, 512, 256); const sh = x.createLinearGradient(0, 0, 512, 0); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(.3, 'rgba(0,0,0,0)'); sh.addColorStop(.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)'); x.fillStyle = sh; x.fillRect(0, 0, 512, 256); // (skin over the whole front and sides, a little shade toward the ears)
    x.setTransform(1.9, 0, 0, 1.45, cx0 * (1 - 1.9), cy0 * (1 - 1.45)); // (the features drawn around the middle, enlarged to a real face's size)
    if (!F.blind) for (const s of [-1, 1]) { const ex = cx0 + s * 26, ey = cy0 + 4; x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(ex, ey, 13, F.round ? 12 : 9, 0, 0, TAU); x.fill();
      x.fillStyle = F.iris; x.beginPath(); x.ellipse(ex + s, ey + 1, F.cat ? 5 : 8, 9, 0, 0, TAU); x.fill(); x.fillStyle = '#05050a'; x.beginPath(); x.ellipse(ex + s, ey + 1, F.cat ? 2 : 4, F.cat ? 8 : 5, 0, 0, TAU); x.fill();
      x.fillStyle = '#ffffff'; x.beginPath(); x.arc(ex - 3, ey - 3, 2.5, 0, TAU); x.fill(); x.strokeStyle = '#1a1010'; x.lineWidth = 3; x.beginPath(); x.ellipse(ex, ey, 13, F.round ? 12 : 9, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
      if (F.brow !== 'none') { x.strokeStyle = '#2a1a14'; x.lineWidth = 4; x.beginPath(); const tl = F.brow === 'fierce' || F.brow === 'frown' ? 6 : 1; x.moveTo(ex - s * 14, ey - 18 - tl * .3); x.lineTo(ex + s * 12, ey - 16 + tl); x.stroke(); } }
    if (F.blind) { x.fillStyle = '#0a0a10'; x.fillRect(cx0 - 66, cy0 - 12, 132, 26); }
    if (F.whisker) { x.strokeStyle = '#6a3a1a'; x.lineWidth = 2; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(cx0 + s * 28, cy0 + 26 + i * 6); x.lineTo(cx0 + s * 48, cy0 + 24 + i * 7); x.stroke(); } }
    x.strokeStyle = '#7a3a2a'; x.lineWidth = 3; const my = cy0 + 44; x.beginPath(); if (F.mouth === 'grin') { x.fillStyle = '#5a1a1a'; x.moveTo(cx0 - 16, my - 3); x.quadraticCurveTo(cx0, my + 12, cx0 + 16, my - 3); x.closePath(); x.fill(); } else if (F.mouth === 'smirk') { x.moveTo(cx0 - 10, my); x.quadraticCurveTo(cx0 + 2, my + 4, cx0 + 14, my - 4); x.stroke(); } else { x.moveTo(cx0 - 10, my); x.lineTo(cx0 + 10, my); x.stroke(); }
    if (A && A.mask) { x.fillStyle = '#f4f4f4'; x.beginPath(); x.ellipse(cx0 + 30, cy0 + 10, 40, 74, 0, -Math.PI / 2, Math.PI / 2); x.fill(); x.fillStyle = '#c81e2a'; for (let i = 0; i < 3; i++) x.fillRect(cx0 + 36 + i * 10, cy0 - 50 + i * 4, 4, 50); }
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
    const geo = new T.SphereGeometry(4.2, 40, 24, Math.PI * .45, Math.PI * 1.1, Math.PI * .12, Math.PI * .84).rotateX(Math.PI / 2).scale(1.04, 1, 1.2).translate(.6, 0, -.75), /* (a mask-shaped segment just in front of the real face) */ mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, roughness: .7, metalness: 0, side: T.DoubleSide })); mesh.castShadow = false; hg.add(mesh);
  },
  /* motion: the recorded clips by speed, then the sword arm toward the aim and a lean into a dash */
  anim(g, o, rd, t) {
    const h = g.human, r = h.r, sp = o.spd || 0, dash = !!o.dashing;
    g.position.set(o.x, o.y, 0); g.rotation.z = o.face || 0; g.visible = o.alpha == null || o.alpha > .5;
    Models.play(r, this.clip(r, dash || sp > 260 ? 'run' : sp > 30 ? 'walk' : 'idle'), .22); r.mixer.update(Math.min(.05, rd || 0) * (dash ? 1.6 : 1));
    const B = h.B; if (g.headK && B.head) B.head.scale.setScalar(g.headK);
    if (dash && B.spine) B.spine.rotation.x += .45;
    // the cut: on a dash (or a tap in the Hero Forge) the sword arm swings across, on top of the recorded motion
    g.sw = dash ? Math.min(1, (g.sw || 0) + (rd || 0) * 6) : Math.max(0, (g.sw || 0) - (rd || 0) * 3);
    if (g.sw > 0 && B.rArm) { const e = Math.sin(g.sw * Math.PI * .5), ax = this.SW;
      B.rArm.rotateOnAxis(ax.a1, ax.k1 * e); if (B.rFore) B.rFore.rotateOnAxis(ax.a2, ax.k2 * e); if (B.spine2) B.spine2.rotateY(.45 * e * ax.tw); }
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
    const body = (P.skin && P.skin.body) || 'ninja', wid = (P.w && P.w.id) || 'katana', sig = 'H' + body + '|' + wid + '|' + (P.ca || '') + (P.cb || '') + Human.base(body), r0 = this.ents.get('hero');
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
    const L = this.look(), sig = 'H' + L.body + L.a + L.b + L.w + Human.base(L.body); if (sig === this.sig && this.g) return; this.sig = sig;
    if (this.g) this.inner.remove(this.g); const g = Human.build(L, L.w); if (g.pool) g.pool.visible = false; this.g = g; this.inner.add(g);
    this.disc.material.color.set(L.a); this.fill.color.set(L.a); try { this.studio(); } catch (e) { errLog(e); }
  };
  const mt = Mini.mount.bind(Mini); Mini.mount = function () { const r = mt.apply(this, arguments); if (r) { Models.load('xbot'); Models.load('soldier'); } return r; };
  Pipe.on('post', 'models58', () => { if (R3.ok && W3D.live) { if (!Models.got.xbot) Models.load('xbot'); if (!Models.got.soldier && Human.HEAVY[(P.skin && P.skin.body) || 'ninja']) Models.load('soldier'); } if (Models.got.xbot && Mini.g && !Mini.g.human && Mini.raf) Mini.sig = ''; }, 99);
}

{ // the human-shaped bosses on the real bodies: the ronin swordsmen and the armored giants
  const BODY = { kage: ['shinobi2', 'katana', '#14141e', 1], renull: ['ninja', 'katana', '#ff0844', 1], izanami: ['lich', 'katana', '#14141e', 1],
    warden: ['knight', 'hammer', '#c8d4ff', 1.18], shogun: ['shogun', 'nodachi', '#ffd23f', 1.18], benkei: ['oni', 'spear', '#ff9a3d', 1.18], prime: ['mecha', 'cleaver', '#ff2a4a', 1.18], genesis: ['sovereign', 'scythe', '#ffd700', 1.3] };
  const bm9 = R3.bossModel.bind(R3);
  R3.bossModel = function (b) {
    const D = BODY[b.id]; if (!D || Array.isArray(b.seg) || !Models.ok('xbot') || CALM) return bm9(b);
    if (Human.HEAVY[D[0]] && !Models.ok('soldier')) Models.load('soldier');
    try { const T = THREE, g = new T.Group(), col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844', h = Human.build({ body: D[0], a: col, b: D[2] }, D[1]);
      if (h.pool) h.pool.visible = false; const k = D[3] / 9; h.scale.setScalar(k); h.s0 = k; g.add(h); g.ronin = h; g.kind = 'ronin';
      let bm = null; h.traverse(o => { if (!bm && o.isSkinnedMesh && o.material && o.material.emissive) { bm = o.material.clone(); } }); // (the boss's own copy, so its hit flash does not light up the hero)
      if (bm) { const src = []; h.traverse(o => { if (o.isSkinnedMesh) src.push(o); }); for (const o of src) if (o.material && o.material.emissive && !/Joints/i.test(o.material.name || '')) o.material = bm; g.bodyMat = bm; } else g.bodyMat = h.plate;
      g.add(this.pool(col, 4.2, .32)); return g; } catch (e) { errLog(e); return bm9(b); }
  };
  Pipe.on('post', 'models59', () => { if (Boss.cur && BODY[Boss.cur.id] && R3.ok && W3D.live && !Models.got.xbot) Models.load('xbot'); }, 99);
}
