/* =====================================================================
   VERSION 53: EVERY SKIN ITS OWN 3D DESIGN, AND BODIES THAT MOVE
   · color: the armor, the shoulder and knee plates and the suit take the
     skin's own two colors (66 skins, 66 looks), not one shared dark grey
   · shape: every body type gets its own silhouette on top of the details
     it already had: capes and long coats, samurai shoulder guards and
     armored skirts, hoods, robes, wings, tails, beards, a cube head,
     the Ashura's second pair of arms, the Raijin's drum ring, jet packs,
     big fists, twin tails, heavier builds for the big ones
   · motion: capes and coats fly back when running, tails sway, wings beat,
     skirts and robes swing with the stride; the torso twists against the
     legs, the head steadies itself, the body leans into a dash
   Display only.
   ===================================================================== */
const Skin3D = {
  mats: {},
  tint(base, col, k, metal, rough) { const key = base + col + k + metal; if (this.mats[key]) return this.mats[key];
    const c = new THREE.Color(base).lerp(new THREE.Color(col), k); return (this.mats[key] = R3.std({ color: c, metalness: metal, roughness: rough })); },
  /* the extra shapes of each body type; every part that should move goes into g.sway */
  build(g, body, ca, cb) {
    const T = THREE, P0 = R3.part.bind(R3), zU = R3.zUp, M = R3.M, glow = c => R3.glow(c, 2.4), torso = g.torso, H = g.head, sway = g.sway = [];
    const cloth = c => this.tint('#14161f', c, .35, .05, .9), dark = M.dark;
    const flap = (par, x, y, z, w, len, mat, kind, amp, base, ph) => { const p = new T.Group(); p.position.set(x, y, z); par.add(p); P0(new T.BoxGeometry(.5, w, len), mat, 0, 0, -len / 2, p); sway.push([p, kind, amp, base || 0, ph || 0]); return p; };
    const cape = (w, len, mat) => { const c = flap(torso, -3.9, 0, 12, w, len * .55, mat, 'cape', .12, .12, 0); flap(c, 0, 0, -len * .55, w * .96, len * .45, mat, 'cape2', .18, .1, .8); return c; };
    const skirt = (mat, n, len) => { for (let i = 0; i < n; i++) { const a = (i / n) * TAU + Math.PI / n, p = new T.Group(); p.position.set(Math.cos(a) * 3.7, Math.sin(a) * 3.7, 1.2); p.rotation.z = a; torso.add(p); P0(new T.BoxGeometry(.6, 2.6, len), mat, 0, 0, -len / 2, p); sway.push([p, 'skirt', .2, .18, a]); } };
    const sode = (mat, trimC) => { for (const [i, s] of [[0, -1], [1, 1]]) { const p = P0(new T.BoxGeometry(4.4, .8, 3.8), mat, .4, s * 2.2, -.3, g.arms[i]); p.rotation.x = s * .55; P0(new T.BoxGeometry(4.4, .3, .4), glow(trimC), 0, 0, -1.8, p); } };
    const hood = c => { const h = P0(new T.SphereGeometry(4.3, 16, 12, 0, TAU, 0, Math.PI * .62), cloth(c), -.5, 0, .4, H); h.rotation.y = -.35; };
    const robe = (mat, len) => { const r = new T.Group(); r.position.z = 1.4; torso.add(r); P0(zU(new T.CylinderGeometry(3.9, 6.4, len, 14, 1, true)), mat, 0, 0, -len / 2, r); sway.push([r, 'robe', .06, 0, 0]); };
    const tail = (n, r, mat, z) => { let par = torso, p0 = null; for (let i = 0; i < n; i++) { const s = new T.Group(); s.position.set(i ? -2.6 : -3.4, 0, i ? 0 : z); par.add(s); P0(new T.SphereGeometry(r * (1 - i * .12), 10, 8), mat, -1.3, 0, 0, s).scale.set(1.6, 1, 1); sway.push([s, 'tail', .35, .25, i * .7]); par = s; p0 = p0 || s; } return p0; };
    const wings = (mat, n) => { for (const s of [-1, 1]) { const w = new T.Group(); w.position.set(-3.6, s * 2.4, 10.5); torso.add(w); for (let i = 0; i < n; i++) { const f = P0(new T.BoxGeometry(.6, 9 - i * 1.6, 2.2), mat, -i * .4, s * (4 - i * .4), -i * 2.1, w); f.rotation.x = s * (.35 + i * .18); } sway.push([w, 'wing', .35, 0, s > 0 ? 0 : Math.PI]); w.userData.s = s; } };
    const bulk = k => { g.bulk = k; };
    const A = ca, B = cb;
    switch (body) {
      case 'ninja': hood(B); break;
      case 'shinobi2': hood(A); cape(7, 9, cloth(B)); for (const i of [0, 1]) P0(new T.BoxGeometry(5, .4, 1.2), glow(A), 4.5, 0, 1.6, g.elbows[i]); break;
      case 'shogun': case 'chromesam': sode(this.tint('#2a2f45', A, .55, .8, .3), B); skirt(this.tint('#232838', A, .45, .7, .35), 6, 3.8); bulk(1.06); break;
      case 'sovereign': sode(this.tint('#1a1530', A, .4, .8, .3), B); cape(9, 14, cloth(A)); for (let i = -1; i <= 1; i++) P0(new T.ConeGeometry(.6, 2.6 - Math.abs(i) * .6, 6).rotateX(Math.PI / 2), glow(B), .4, i * 1.6, 4.2, H); bulk(1.05); break;
      case 'ronin': cape(8, 12, cloth(B)); skirt(cloth(B), 4, 5.5); break;
      case 'knight': sode(this.tint('#8a93a8', A, .2, .9, .25), B); cape(9, 14, cloth(B)); bulk(1.08); break;
      case 'seraph': skirt(this.tint('#d8dce8', A, .2, .6, .3), 6, 3.2); break;
      case 'oni': case 'ashura': case 'raijin': bulk(1.1); flap(torso, 3.9, 0, 1.4, 3.4, 5, cloth(B), 'skirt', .25, 0, 0);
        if (body === 'ashura') for (const s of [-1, 1]) { const sh = new T.Group(); sh.position.set(-.6, s * 5, 7.6); torso.add(sh); P0(new T.CapsuleGeometry(1.15, 4, 4, 8).rotateZ(-Math.PI / 2), M.armor2, 3, 0, 0, sh); P0(new T.BoxGeometry(2.2, 2, 2.2), dark, 6.6, 0, 0, sh); sh.rotation.z = s * .9; sh.rotation.y = .3; sway.push([sh, 'arm', .4, 0, s > 0 ? 0 : 2]); }
        if (body === 'raijin') { const ring = new T.Group(); ring.position.set(-4.6, 0, 10); torso.add(ring); P0(new T.TorusGeometry(7.5, .5, 8, 32).rotateY(Math.PI / 2), M.gold, 0, 0, 0, ring); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; P0(zU(new T.CylinderGeometry(1.2, 1.2, 1.2, 12)).rotateY(Math.PI / 2), this.tint('#3a1010', B, .4, .3, .5), 0, Math.cos(a) * 7.5, Math.sin(a) * 7.5, ring); } sway.push([ring, 'spin', .5, 0, 0]); }
        break;
      case 'dragon': tail(5, 1.6, this.tint('#202838', B, .5, .5, .4), 2); for (let i = 0; i < 4; i++) P0(new T.ConeGeometry(.7, 2.2, 5).rotateZ(Math.PI / 2), glow(A), -4.3, 0, 4 + i * 2.2, torso); break;
      case 'kitsune': cape(7, 8, cloth(B)); break;
      case 'neko': tail(5, .9, cloth(A), 2); break;
      case 'wolf': tail(4, 1.3, this.tint('#3a4262', A, .2, .1, .9), 2); P0(zU(new T.TorusGeometry(3.4, 1.2, 8, 18)), this.tint('#4a5478', A, .2, .05, .95), 0, 0, 12, torso); break;
      case 'tengu': wings(this.tint('#101016', B, .25, .2, .6), 4); break;
      case 'witch': robe(cloth(A), 8); cape(8, 11, cloth(B)); break;
      case 'lich': hood(B); robe(cloth(B), 10); break;
      case 'skull': robe(cloth(A), 9); break;
      case 'mecha': case 'exo': bulk(1.12); for (const s of [-1, 1]) { const j = P0(zU(new T.CylinderGeometry(1.1, 1.5, 4.5, 10)), this.tint('#30384e', A, .3, .85, .3), -4.4, s * 2, 8.6, torso); P0(new T.SphereGeometry(1, 8, 6), glow(B), 0, 0, -2.6, j); }
        for (const [i, s] of [[0, -1], [1, 1]]) P0(new T.BoxGeometry(4.6, 3, 4.2), this.tint('#3a4262', A, .4, .85, .3), .2, s * 1.4, .6, g.arms[i]); break;
      case 'pixel': { const cube = P0(new T.BoxGeometry(7.4, 7.4, 7.4), this.tint('#30384e', A, .45, .2, .6), 0, 0, 0, H); void cube; P0(new T.BoxGeometry(1, 5.4, 1.4), glow(B), 3.75, 0, .6, H); H.children[0].visible = false; break; }
      case 'netrunner': hood(A); P0(new T.BoxGeometry(1, 6.6, .9), glow(B), 3.3, 0, 1.6, H); cape(7, 10, cloth(A)); break;
      case 'rider': P0(zU(new T.CylinderGeometry(2.6, 2.6, 1.4, 12)), cloth(B), 0, 0, 12.6, torso); break;
      case 'pumpkin': cape(8, 12, cloth(B)); break;
      case 'yurei': { const hair = flap(H, -2.6, 0, 1.6, 6, 12, this.tint('#05050a', A, .05, 0, .9), 'cape', .1, .2, 0); void hair; break; }
      case 'blaze': for (const hd of g.hands) { hd.scale.setScalar(1.55); P0(new T.ConeGeometry(1, 3, 6).rotateZ(-Math.PI / 2), glow('#ff6a00'), 2.4, 0, .6, hd); } bulk(1.04); break;
      case 'idol': for (const s of [-1, 1]) flap(H, -.6, s * 3.6, 2, 1.6, 9, this.tint('#202030', A, .7, .1, .6), 'tail2', .25, .3, s); break;
      case 'yeti': bulk(1.14); break;
      case 'viking': { const beard = P0(new T.ConeGeometry(2.4, 5, 8).rotateX(-Math.PI / 2), this.tint('#5a3a20', B, .25, 0, .95), 2.6, 0, -3.4, H); void beard; cape(9, 12, this.tint('#3a2a20', A, .15, 0, .95)); P0(zU(new T.TorusGeometry(3.6, 1.3, 8, 18)), this.tint('#6a5a48', A, .1, 0, 1), 0, 0, 12.2, torso); bulk(1.08); break; }
      case 'goo': break;
    }
  },
  /* moving parts and a more natural body */
  anim(g, o, rd, t) {
    const sp = clamp((o.spd || 0) / 420, 0, 1), dash = !!o.dashing, sw = Math.sin(o.ph || t * 10), still = sp < .05 && !dash;
    if (!still) { g.torso.rotation.z = -sw * .14 * sp; g.head.rotation.z = sw * .1 * sp; } // shoulders against hips, the head steadies itself
    if (dash) { g.torso.rotation.y = .5; g.head.rotation.y = -.25; }
    for (const [p, k, amp, base, ph] of g.sway || []) {
      if (k === 'cape' || k === 'cape2') p.rotation.y = base + sp * (k === 'cape' ? .9 : .4) + (dash ? .5 : 0) + Math.sin(t * (2.2 + sp * 7) + ph) * amp * (.5 + sp);
      else if (k === 'skirt') p.rotation.y = (Math.sin(t * 10 * Math.max(.2, sp) + ph) * amp * sp) + (dash ? .3 : 0);
      else if (k === 'robe') { p.rotation.y = sp * .12 + (dash ? .2 : 0); p.rotation.x = Math.sin(o.ph || 0) * amp * sp; }
      else if (k === 'tail') { p.rotation.z = Math.sin(t * 2.4 - ph) * amp * (1 - sp * .5); p.rotation.y = base - sp * .3 - (dash ? .3 : 0); }
      else if (k === 'tail2') p.rotation.y = base + sp * .5 + Math.sin(t * 3 + ph) * amp * .4;
      else if (k === 'wing') { const s = p.userData.s, f = dash ? -.6 : Math.sin(t * (2 + sp * 8) + ph) * amp * (.4 + sp); p.rotation.x = s * f; p.rotation.y = .1 + sp * .3; }
      else if (k === 'arm') p.rotation.y = .3 + Math.sin(t * 3 + ph) * amp * (.4 + sp);
      else if (k === 'spin') p.rotation.x = t * amp;
    }
  }
};
{
  // the skin's colors on the armor (built before the body extras, so skins that recolor the head still win)
  const hr7 = R3.hero.bind(R3);
  R3.hero = function (col, col2, ghost) {
    const g = hr7(col, col2, ghost); if (ghost) return g;
    try { const M = this.M, ar = Skin3D.tint('#1c2238', col, .38, .62, .34), a2 = Skin3D.tint('#262c46', col2, .5, .72, .3), su = Skin3D.tint('#151926', col, .14, .25, .7);
      g.traverse(o => { if (!o.isMesh) return; if (o.material === M.armor) o.material = ar; else if (o.material === M.armor2) o.material = a2; else if (o.material === M.suit) o.material = su; });
      g.ca = col; g.cb = col2; } catch (e) { errLog(e); }
    return g;
  };
  const dr7 = R3.dress.bind(R3);
  R3.dress = function (g, body, ca, cb) {
    dr7(g, body, ca, cb);
    try { if (g.torso && g.elbows) { Skin3D.build(g, body || 'ninja', ca, cb); if (g.bulk) { g.s0 = (g.s0 || 1.35) * g.bulk; g.scale.setScalar(g.s0); } } } catch (e) { errLog(e); }
  };
  const ah7 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) { ah7(g, o, rd, t); if (g.elbows) try { Skin3D.anim(g, o, rd, t); } catch (e) { errLog(e); } };
}
