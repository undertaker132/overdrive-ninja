/* =====================================================================
   VERSION 54: BOSSES AND ENEMIES WITH LIFE, AND ANIME-STYLE HEROES
   · the war-machine bosses become armored giants with real bodies (the
     hero's body at boss size), each with its own armor and weapon:
     WARDEN a paladin with a hammer, SHOGUN.EXE a samurai lord with a
     nodachi, BENKEI the warrior monk with his spear, KUROGANE PRIME a
     war frame with a cleaver, DEUS EX KUROGANE a winged sovereign with a
     scythe. They walk, breathe, swing and stagger like the hero does.
   · the gunships get engines that flare, turrets that track you and
     blinking running lights; the cores get a ring of thunder drums
     (RAIJIN) or three serpent heads on swaying necks (CHIMERA); the
     LEVIATHAN gets a jaw that opens, fins and glowing gills
   · enemies: drones beat insect wings and their eye pulses, snipers get
     a hooded cloak, bombers a lit fuse and a breathing body, weavers
     trailing ribbons, phantoms and wraiths tattered cloaks that float,
     splitters wobble like jelly, wardens spin their shield, couriers and
     treasure drones burn their thrusters, medics pulse
   · eight new heroes in the style of the great fighting anime (original
     designs, not copies): SUPER SURGE, SOUL CLEAVER, WILD HUNTER,
     STORM KID, FOX SAGE, VEIL SORCERER, WAVE BREATHER, SEA CAPTAIN,
     each with its own hair, outfit, aura and motion in 3D and in 2D
   Display only (the new heroes are cosmetic, like every skin).
   ===================================================================== */
const FX54 = {
  /* moving parts on any 3D model: g.fx54 = [[object, kind, a, b]] */
  tick(t) {
    for (const r of R3.ents.values()) { const L = r.g && r.g.fx54; if (!L) continue;
      for (const [o, k, a, b] of L) {
        if (k === 'flap') o.rotation.x = b * (.25 + Math.sin(t * a) * .6);
        else if (k === 'pulse') { const s = 1 + Math.sin(t * a + (b || 0)) * .18; o.scale.setScalar(s); }
        else if (k === 'blink') o.visible = Math.sin(t * a + (b || 0)) > .2;
        else if (k === 'flame') { o.scale.set(1 + Math.random() * .4, 1, 1); o.visible = true; }
        else if (k === 'spin') o.rotation.z = t * a;
        else if (k === 'spinx') o.rotation.x = t * a;
        else if (k === 'sway') { o.rotation.y = Math.sin(t * a + (b || 0)) * .35; o.rotation.z = Math.cos(t * a * .7 + (b || 0)) * .25; }
        else if (k === 'float') o.position.z = b + Math.sin(t * a) * .12;
        else if (k === 'wobble') { const s = Math.sin(t * a); o.scale.set(1 + s * .08, 1 - s * .06, 1 - s * .08); }
        else if (k === 'track') { const w = r.g; o.rotation.z = Math.sin(t * .8 + (b || 0)) * .6 + (w.trackA || 0); }
        else if (k === 'jaw') o.rotation.y = .15 + Math.max(0, Math.sin(t * a)) * .5;
      } }
  }
};
{
  const T = () => THREE;
  /* ---------- bosses ---------- */
  const GIANT = { warden: ['knight', 'hammer', '#c8d4ff'], shogun: ['shogun', 'nodachi', '#ffd23f'], benkei: ['oni', 'spear', '#ff9a3d'], prime: ['mecha', 'cleaver', '#ff2a4a'], genesis: ['sovereign', 'scythe', '#ffd700'] };
  const bm0 = R3.bossModel.bind(R3);
  R3.bossModel = function (b) {
    const G0 = GIANT[b.id];
    if (G0 && !Array.isArray(b.seg)) { // an armored giant with a real body
      const Th = T(), g = new Th.Group(), col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
      const h = this.hero(col, G0[2], false); try { this.weapon(h, G0[1]); this.dress(h, G0[0], col, G0[2]); } catch (e) { errLog(e); }
      if (h.pool) h.pool.visible = false; const k = (h.bulk || 1) * (b.id === 'genesis' ? 1.3 : 1.18) / 9; h.scale.setScalar(k); h.s0 = k; g.add(h); g.ronin = h; g.bodyMat = h.plate; g.kind = 'ronin';
      g.add(this.pool(col, 4.2, .32)); return g;
    }
    const g = bm0(b), Th = T(), P0 = this.part.bind(this), col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844', glow = c => this.glow(c, 3), fx = g.fx54 = [];
    try {
      if (g.serpent) { // the leviathan's head: a jaw, fins, gills
        const jaw = new Th.Group(); jaw.position.set(.6, 0, .7); g.add(jaw); P0(new Th.BoxGeometry(1.1, .8, .22), g.bodyMat, .45, 0, -.05, jaw); for (const s of [-1, 1]) P0(new Th.ConeGeometry(.08, .3, 4), this.M.white, .8, s * .28, .15, jaw).rotation.x = Math.PI; fx.push([jaw, 'jaw', 3]);
        for (const s of [-1, 1]) { const fin = P0(new Th.BoxGeometry(.8, .06, .5), glow(col), -.6, s * .9, 1.1, g); fin.rotation.x = s * .6; fx.push([fin, 'flap', 4, s]); for (let i = 0; i < 3; i++) { const gl = P0(new Th.BoxGeometry(.05, .04, .3), glow('#7df9ff'), -.2 - i * .18, s * .78, 1, g); fx.push([gl, 'blink', 3, i]); } }
      } else if (g.kind === 'ship') {
        const hull = g.hover; for (const s of [-1, 1]) { const fl = P0(new Th.ConeGeometry(.18, .9, 10).rotateZ(Math.PI / 2), this.glow('#7df9ff', 4), -1.55, s * .95, 0, hull); fx.push([fl, 'flame']);
          const lt = P0(new Th.SphereGeometry(.06, 6, 5), this.glow(s > 0 ? '#00ff88' : '#ff2a4a', 5), -.3, s * 1.75, .05, hull); fx.push([lt, 'blink', 6, s]); }
        const tur = new Th.Group(); tur.position.set(.2, 0, .45); hull.add(tur); P0(new Th.SphereGeometry(.28, 12, 8, 0, TAU, 0, Math.PI / 2), this.M.armor2, 0, 0, 0, tur).rotation.x = Math.PI / 2; P0(new Th.CylinderGeometry(.05, .05, .7, 8).rotateZ(Math.PI / 2), this.M.dark, .4, 0, .1, tur); fx.push([tur, 'track', 0]);
        const rad = new Th.Group(); rad.position.set(-.6, 0, .55); hull.add(rad); P0(new Th.BoxGeometry(.05, .5, .12), this.M.metal, 0, 0, 0, rad); fx.push([rad, 'spin', 3]);
      } else if (g.kind === 'core') {
        const c = g.hover;
        if (b.id === 'raijin') { const ring = new Th.Group(); c.add(ring); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = P0(new Th.CylinderGeometry(.22, .22, .2, 14), this.std({ color: 0x3a1010, metalness: .3, roughness: .5 }), Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0, ring); d.rotation.x = Math.PI / 2; P0(new Th.TorusGeometry(.2, .03, 6, 16), this.M.gold, 0, 0, .11, d); }
          fx.push([ring, 'spin', .8]); for (let i = 0; i < 4; i++) { const arc = P0(new Th.BoxGeometry(.03, .03, 1.4), glow('#7df9ff'), Math.cos(i * 1.6) * .9, Math.sin(i * 1.6) * .9, 0, c); arc.rotation.set(Math.random() * 3, Math.random() * 3, 0); fx.push([arc, 'blink', 13, i * 2]); } }
        else { for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, neck = new Th.Group(); neck.position.set(Math.cos(a) * .6, Math.sin(a) * .6, 0); neck.rotation.z = a; c.add(neck); let par = neck;
            for (let j = 0; j < 4; j++) { const s = new Th.Group(); s.position.x = j ? .35 : .2; par.add(s); P0(new Th.SphereGeometry(.17 - j * .015, 10, 8), g.bodyMat, .17, 0, 0, s); fx.push([s, 'sway', 1.6 + i * .3, j * .6 + i]); par = s; }
            const hd = P0(new Th.ConeGeometry(.2, .5, 6).rotateZ(-Math.PI / 2), this.M.armor2, .35, 0, 0, par); P0(new Th.SphereGeometry(.05, 6, 5), glow('#ffd23f'), .1, .1, .1, hd); } }
      }
    } catch (e) { errLog(e); }
    return g;
  };
  /* ---------- enemies ---------- */
  const em1 = R3.enemyModel.bind(R3);
  R3.enemyModel = function (e) {
    const g = em1(e), Th = T(), P0 = this.part.bind(this), E = ET, t = e.type, col = e.col || '#ff3b5c', fx = g.fx54 = [], gl = c => this.glow(c, 3);
    try {
      if (t === E.DRONE || t === E.MINI) { for (const s of [-1, 1]) for (const f of [0, 1]) { const w = new Th.Group(); w.position.set(-.1 - f * .35, s * .45, 1.05); g.add(w); P0(new Th.BoxGeometry(.5, .9, .02), new Th.MeshBasicMaterial({ color: new Th.Color(col), transparent: true, opacity: .35, side: Th.DoubleSide, depthWrite: false }), 0, s * .45, 0, w); fx.push([w, 'flap', 38 + f * 5, s]); } }
      else if (t === E.SNIPER) { P0(this.zUp(new Th.ConeGeometry(.75, 1.3, 10, 1, true)), this.std({ color: 0x1a1d2a, roughness: .9, side: Th.DoubleSide }), -.1, 0, .9, g); const hd = P0(new Th.SphereGeometry(.32, 12, 10), this.std({ color: 0x14161f, roughness: .9 }), 0, 0, 1.75, g); P0(new Th.BoxGeometry(.1, .3, .08), gl(col), .28, 0, .02, hd); const sc = P0(new Th.SphereGeometry(.07, 8, 6), gl('#ff2a4a'), 2.4, 0, 1.25, g); fx.push([sc, 'blink', 5]); }
      else if (t === E.BOMBER) { const fu = new Th.Group(); fu.position.set(0, 0, 1.85); g.add(fu); P0(new Th.CylinderGeometry(.04, .04, .3, 6).rotateX(Math.PI / 2), this.M.dark, 0, 0, 0, fu); const sp = P0(new Th.SphereGeometry(.09, 8, 6), gl('#ffd23f'), 0, 0, .2, fu); fx.push([sp, 'flame']); fx.push([g.children[0], 'pulse', 6]); }
      else if (t === E.WEAVER) { for (let i = 0; i < 3; i++) { const r = new Th.Group(); r.position.set(-.5, (i - 1) * .3, 1.6); g.add(r); P0(new Th.BoxGeometry(1.4, .08, .02), gl(col), -.7, 0, 0, r); fx.push([r, 'sway', 3 + i, i]); } }
      else if (t === E.PHANTOM || t === E.WRAITH) { const cl = new Th.Group(); cl.position.z = 1.5; g.add(cl); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, s = P0(new Th.ConeGeometry(.28, 1.3, 4), new Th.MeshStandardMaterial({ color: 0x0a0a14, transparent: true, opacity: .75, roughness: 1 }), Math.cos(a) * .45, Math.sin(a) * .45, -.6, cl); s.rotation.x = Math.PI; fx.push([s, 'sway', 2 + i * .3, i]); }
        for (const s of [-1, 1]) P0(new Th.SphereGeometry(.07, 8, 6), gl(col), .45, s * .15, 1.85, g); fx.push([cl, 'float', 2, 1.5]); }
      else if (t === E.SPLITTER) { for (const c of g.children) if (c.isMesh) { fx.push([c, 'wobble', 5]); break; } }
      else if (t === E.WARDEN) { const ring = P0(new Th.TorusGeometry(1.15, .05, 6, 32), gl('#4d7cff'), 0, 0, 1, g); fx.push([ring, 'spin', 2]); }
      else if (t === E.COURIER || t === E.TREASURE) { for (const s of [-1, 1]) { const f = P0(new Th.ConeGeometry(.15, .7, 8).rotateZ(Math.PI / 2), gl('#ffd23f'), -1, s * .35, .8, g); fx.push([f, 'flame']); } }
      else if (t === E.MEDIC) { for (const c of g.children) if (c.isMesh && c.material && c.material.emissive) { fx.push([c, 'pulse', 4]); break; } }
    } catch (er) { errLog(er); }
    return g;
  };
  const sw0 = R3.sweep.bind(R3); R3.sweep = function () { try { FX54.tick(this.t || 0); } catch (e) { errLog(e); } return sw0.apply(this, arguments); };
}
/* ---------- anime-style heroes ---------- */
SKINS.push(
  { id: 'surge', name: 'SUPER SURGE', body: 'saiyan', a: '#ff7a1a', b: '#1f4fff', cost: 5200, desc: 'Golden hair that stands on end and an aura that crackles. Power level: rising.' },
  { id: 'cleaver', name: 'SOUL CLEAVER', body: 'reaper', a: '#1a1a22', b: '#f2f2f2', cost: 4800, desc: 'A black robe, a white sash, half a mask and a blade as big as a door.' },
  { id: 'wildhunter', name: 'WILD HUNTER', body: 'hunter', a: '#1e9a4a', b: '#ffd23f', cost: 3200, desc: 'Spiky hair, a green jacket and an aura that never runs dry.' },
  { id: 'stormkid', name: 'STORM KID', body: 'stormkid', a: '#5a5aff', b: '#7df9ff', cost: 3600, desc: 'White hair, quick feet and lightning dancing on the skin.' },
  { id: 'foxsage', name: 'FOX SAGE', body: 'foxsage', a: '#ff8a00', b: '#1a1a2a', cost: 4400, desc: 'A metal headband, an orange jacket and a fox cloak of flame.' },
  { id: 'veil', name: 'VEIL SORCERER', body: 'veil', a: '#20243a', b: '#7ab8ff', cost: 5600, desc: 'White hair, a blindfold and a blue orb that bends space.' },
  { id: 'breather', name: 'WAVE BREATHER', body: 'breather', a: '#1e8a5a', b: '#2a9cff', cost: 3000, desc: 'A long coat, a calm breath, and water that follows the blade.' },
  { id: 'captain', name: 'SEA CAPTAIN', body: 'captain', a: '#d81e2a', b: '#ffd23f', cost: 2600, desc: 'A straw hat, an open red vest and a grin that never leaves.' }
);
const ANIME = {
  saiyan: { hair: '#ffd23f', spikes: 11, up: 1.2, aura: '#ffd23f', len: 6 },
  reaper: { hair: '#a8341e', spikes: 9, up: .5, len: 4.2, robe: 1, mask: 1, cleaver: 1 },
  hunter: { hair: '#14161c', tip: '#1e9a4a', spikes: 9, up: 1.4, len: 5.6, aura: '#3dff8a', soft: 1 },
  stormkid: { hair: '#eef2ff', spikes: 13, up: .6, len: 3.8, aura: '#7df9ff', bolts: 1 },
  foxsage: { hair: '#ffd23f', spikes: 10, up: .7, len: 4.4, band: 1, aura: '#ff8a00' },
  veil: { hair: '#f4f6ff', spikes: 9, up: 1.1, len: 4.6, blind: 1, orb: '#7ab8ff' },
  breather: { hair: '#5a1a22', spikes: 7, up: .4, len: 3.4, coat: 1, ribbons: '#2a9cff' },
  captain: { hair: '#14161c', spikes: 7, up: .2, len: 2.6, hat: 1 }
};
{
  const b0 = Skin3D.build.bind(Skin3D);
  Skin3D.build = function (g, body, ca, cb) {
    b0(g, body, ca, cb); const A = ANIME[body]; if (!A) return;
    const Th = THREE, P0 = R3.part.bind(R3), H = g.head, torso = g.torso, sway = g.sway, glow = (c, k) => R3.glow(c, k || 2.4);
    const hairM = this.tint('#000000', A.hair, 1, .1, .55), tipM = A.tip ? this.tint('#000000', A.tip, 1, .1, .55) : hairM;
    // hair: spikes that grow out of the head (up, back and to the sides), a few bangs over the visor
    const up = new Th.Vector3(0, 0, 1), V = (x, y, z) => new Th.Vector3(x, y, z).normalize();
    const spike = (d, len, r, m) => { const q = P0(new Th.ConeGeometry(r, len, 6).rotateX(Math.PI / 2).translate(0, 0, len / 2), m, d.x * 2.6, d.y * 2.6, d.z * 2.6 + .4, H); q.quaternion.setFromUnitVectors(up, d); };
    for (let i = 0; i < A.spikes; i++) { const u = A.spikes > 1 ? i / (A.spikes - 1) : .5, az = Math.PI + (u - .5) * 3.4, el = .35 + A.up * .35 + (i % 2) * .25;
      spike(V(Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el) + .15), A.len * (.8 + (i % 3) * .2), 1.25, i % 2 && A.tip ? tipM : hairM); }
    for (let i = 0; i < 3; i++) spike(V(.55, (i - 1) * .5, A.up > .9 ? .9 : .35), A.len * .55, .9, hairM); // bangs
    if (A.up > 1) for (let i = 0; i < 3; i++) spike(V((i - 1) * .3, (i - 1) * .2, 1), A.len * 1.1, 1.3, i === 1 && A.tip ? tipM : hairM); // the crown stands straight up
    if (A.aura) { const am = new Th.MeshBasicMaterial({ color: new Th.Color(A.aura), transparent: true, opacity: .22, blending: Th.AdditiveBlending, depthWrite: false });
      const au = new Th.Group(); g.add(au); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, f = P0(new Th.ConeGeometry(2.2, 16 + (i % 3) * 5, 6).rotateX(Math.PI / 2).translate(0, 0, 8), am, Math.cos(a) * 6.5, Math.sin(a) * 6.5, 4, au); f.castShadow = false; f.userData.ph = i; }
      sway.push([au, 'aura', 1, 0, 0]);
      if (A.bolts) for (let i = 0; i < 5; i++) { const bo = P0(new Th.BoxGeometry(.35, .35, 7), glow(A.aura, 4), Math.cos(i * 1.3) * 5, Math.sin(i * 1.3) * 5, 12 + i * 2, au); bo.rotation.set(Math.random() * 2, Math.random() * 2, 0); bo.castShadow = false; bo.userData.bolt = 1; } }
    if (A.robe) { const r = new Th.Group(); r.position.z = 1.4; torso.add(r); P0(R3.zUp(new Th.CylinderGeometry(3.9, 6.8, 9, 14, 1, true)), this.tint('#0a0a0f', ca, .2, .05, .9), 0, 0, -4.5, r); sway.push([r, 'robe', .06, 0, 0]); P0(R3.zUp(new Th.CylinderGeometry(4, 4, 1.4, 14)), this.tint('#ffffff', cb, .1, 0, .8), 0, 0, 1.8, torso); }
    if (A.mask) P0(new Th.SphereGeometry(3.85, 12, 10, -Math.PI / 2, Math.PI / 2, 0, Math.PI), this.tint('#ffffff', '#ffffff', 0, .1, .4), 0, 0, 0, H).rotation.z = .1;
    if (A.cleaver) { const c = P0(new Th.BoxGeometry(1, 7, 30), R3.M.dark, -4.6, 0, 9, torso); c.rotation.x = .5; P0(new Th.BoxGeometry(1.1, .8, 30), glow('#ffffff', 1.4), 0, 3.6, 0, c); }
    if (A.band) { P0(R3.zUp(new Th.TorusGeometry(3.9, .45, 6, 24)), R3.M.dark, 0, 0, 1.4, H); P0(new Th.BoxGeometry(.5, 3, 1.4), R3.M.metal, 3.9, 0, 1.4, H); for (const s of [-1, 1]) { const tl = new Th.Group(); tl.position.set(-3.6, s * .8, 1.4); H.add(tl); P0(new Th.BoxGeometry(5, .6, .5), R3.M.dark, -2.5, 0, 0, tl); sway.push([tl, 'tail2', .3, .4, s]); } }
    if (A.blind) P0(R3.zUp(new Th.TorusGeometry(3.85, .7, 6, 24)), R3.M.dark, .1, 0, .6, H);
    if (A.orb) { const o = new Th.Group(); o.position.set(4, -7, 12); torso.add(o); P0(new Th.SphereGeometry(1.4, 16, 12), glow(A.orb, 4), 0, 0, 0, o); P0(new Th.TorusGeometry(2.2, .15, 6, 24), glow('#c45bff', 3), 0, 0, 0, o); sway.push([o, 'orb', 1, 0, 0]); }
    if (A.coat) { const c = new Th.Group(); c.position.set(-3.9, 0, 12); torso.add(c); P0(new Th.BoxGeometry(.5, 9, 15), this.tint('#101418', ca, .5, .05, .9), 0, 0, -7.5, c); sway.push([c, 'cape', .14, .1, 0]); }
    if (A.ribbons) for (let i = 0; i < 3; i++) { const rb = new Th.Group(); rb.position.set(0, 0, 0); g.blade.add(rb); P0(new Th.TorusGeometry(4 + i * 2, .25, 6, 20, Math.PI * 1.2), glow(A.ribbons, 2), 12 + i * 6, 0, 0, rb).rotation.y = Math.PI / 2; sway.push([rb, 'orb', 1 + i * .3, 0, 0]); }
    if (A.hat) { P0(R3.zUp(new Th.CylinderGeometry(7.4, 7.4, .5, 22)), this.tint('#e8c66a', '#e8c66a', 0, 0, .9), 0, 0, 2.2, H); P0(R3.zUp(new Th.CylinderGeometry(3.6, 3.9, 2.6, 18)), this.tint('#e8c66a', '#e8c66a', 0, 0, .9), 0, 0, 3.4, H); P0(R3.zUp(new Th.CylinderGeometry(3.95, 3.95, .8, 18)), this.tint('#c81e2a', '#c81e2a', 0, .1, .7), 0, 0, 2.7, H); }
    if (A.soft) g.bulk = .96;
  };
  const a0 = Skin3D.anim.bind(Skin3D);
  Skin3D.anim = function (g, o, rd, t) { a0(g, o, rd, t);
    for (const [p, k] of g.sway || []) { if (k === 'aura') { p.rotation.z = t * .5; for (const c of p.children) { if (c.userData.bolt) { c.visible = Math.random() < .5; c.rotation.x = Math.random() * 3; continue; } const ph = c.userData.ph || 0; c.scale.set(1, 1, .7 + Math.abs(Math.sin(t * 7 + ph * 1.7)) * .6 + (o.dashing ? .4 : 0)); } }
      else if (k === 'orb') { p.rotation.x = t * 1.4; p.rotation.y = t; p.position.z = (p.position.z || 0) + Math.sin(t * 2) * .02; } } };
  // the same heroes in 2D: the ninja's body with their own hair, outfit and aura
  const hair2d = (o, A) => { cx.fillStyle = A.hair; spikyRing(2, A.spikes * 2, 6, 7 + A.len * .9); cx.fill(); if (A.tip) { cx.fillStyle = A.tip; spikyRing(1, A.spikes * 2, 5, 6.5 + A.len * .5); cx.fill(); } cx.fillStyle = A.hair; cx.beginPath(); cx.arc(3, 0, 6.2, 0, TAU); cx.fill(); };
  for (const body of Object.keys(ANIME)) {
    const A = ANIME[body];
    BODY[body] = function (o, sw) {
      if (A.aura) { const p = .5 + Math.sin(o.t * 9) * .2; hglow(0, 0, 30, A.aura, .35 * p); cx.strokeStyle = A.aura; cx.globalAlpha *= .5 * p; spikyRing(0, 16, 16, 21 + Math.sin(o.t * 12) * 2); cx.lineWidth = 1.5; cx.stroke(); cx.globalAlpha = o.alpha; }
      if (A.cleaver) { cx.fillStyle = '#0a0a10'; cx.fillRect(-16, -14, 6, 28); cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.strokeRect(-16, -14, 6, 28); }
      if (A.coat || A.robe) { cx.fillStyle = A.robe ? '#0c0c12' : o.ca; cx.beginPath(); cx.moveTo(-4, -13); cx.quadraticCurveTo(-22 - Math.sin(o.t * 6) * 2, 0, -4, 13); cx.closePath(); cx.fill(); }
      BODY.ninja(o, sw);
      if (A.hat) { cx.fillStyle = '#e8c66a'; cx.beginPath(); cx.arc(3, 0, 12, 0, TAU); cx.fill(); cx.strokeStyle = '#c81e2a'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(3, 0, 7.5, 0, TAU); cx.stroke(); cx.fillStyle = '#d9b558'; cx.beginPath(); cx.arc(3, 0, 6, 0, TAU); cx.fill(); return; }
      hair2d(o, A);
      if (A.band) { cx.fillStyle = '#9aa4b8'; cx.fillRect(7, -4, 2.5, 8); }
      if (A.blind) { cx.fillStyle = '#0a0a10'; cx.fillRect(6.5, -5.5, 3, 11); }
      if (A.mask) { cx.fillStyle = '#f2f2f2'; cx.beginPath(); cx.arc(5, 2, 4.5, -Math.PI / 2, Math.PI / 2); cx.fill(); }
      if (A.orb) { hglow(10, -14, 10, A.orb, .7); cx.fillStyle = A.orb; dot(10, -14, 3.2); }
    };
  }
}
{ // the portraits (shop, arsenal, cut-ins): hair, headband, blindfold, mask or straw hat over the head, aura behind
  const hb0 = heroBust;
  heroBust = function (g, sk, S, t) {
    const A = sk && ANIME[sk.body]; if (!A) return hb0(g, sk, S, t); t = t || 0;
    if (A.aura) { g.save(); g.scale(S / 200, S / 200); g.translate(100, 104); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i - 5.5) * .26, l = 70 + Math.abs(Math.sin(t * 6 + i)) * 26; g.fillStyle = hexA(A.aura, .16); g.beginPath(); g.moveTo(Math.cos(a - .12) * 40, -20 + Math.sin(a - .12) * 40); g.lineTo(Math.cos(a) * l * 1.3, -20 + Math.sin(a) * l * 1.3); g.lineTo(Math.cos(a + .12) * 40, -20 + Math.sin(a + .12) * 40); g.closePath(); g.fill(); } g.restore(); }
    hb0(g, sk, S, t);
    g.save(); g.scale(S / 200, S / 200); g.translate(100, 104 + Math.sin(t * 2) * 1.2);
    if (A.hat) { g.fillStyle = '#e8c66a'; g.beginPath(); g.ellipse(0, -52, 74, 16, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, -66, 38, 26, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c81e2a'; g.fillRect(-38, -60, 76, 8); g.restore(); return; }
    const n = A.spikes + 4; for (let i = 0; i < n; i++) { const u = i / (n - 1), a = -Math.PI + .25 + u * (Math.PI - .5), l = 40 + A.len * 5 * (.75 + (i % 3) * .2) + A.up * 10 * Math.sin(u * Math.PI);
      g.fillStyle = A.tip && i % 2 ? A.tip : A.hair; g.beginPath(); g.moveTo(Math.cos(a - .22) * 30, -34 + Math.sin(a - .22) * 30); g.lineTo(Math.cos(a) * l, -34 + Math.sin(a) * l); g.lineTo(Math.cos(a + .22) * 30, -34 + Math.sin(a + .22) * 30); g.closePath(); g.fill(); }
    g.fillStyle = A.hair; g.beginPath(); g.ellipse(0, -40, 34, 22, 0, Math.PI, 0); g.fill();
    if (A.band) { g.fillStyle = '#20202a'; g.fillRect(-34, -40, 68, 9); g.fillStyle = '#b8c2d8'; g.fillRect(-14, -41, 28, 11); }
    if (A.blind) { g.fillStyle = '#0a0a10'; g.fillRect(-32, -26, 64, 13); }
    if (A.mask) { g.fillStyle = '#f2f2f2'; g.beginPath(); g.ellipse(12, -14, 18, 24, 0, -Math.PI / 2, Math.PI / 2); g.fill(); g.fillStyle = '#c81e2a'; g.fillRect(14, -30, 3, 22); }
    g.restore();
  };
}
