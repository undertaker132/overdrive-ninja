/* ==========================================================================
   v82 · THE CRATE IS GUARDED: a duel, staged in 3D.
   Opening a crate is a sword fight in a scene of its own: the sealed crate
   floats over its pedestal, a shadow guardian drops in before it, and your
   own hero (skin, gear and blade) fights it with the recorded sword moves,
   under a moving camera.
   The rarity stays a surprise, as with the seals before: every round the
   guardian either falls or holds. When it holds, a seal on the crate breaks
   and its light feeds the guardian, which awakens one tier higher, and how
   it awakens is the hint:
     1 (RARE or better)       blue light, it strikes back
     2 (EPIC or better)       purple lightning, it blinks to your flank
     3 (LEGENDARY or better)  gold aura, it grows and leaps with a great chop
     4 (MYTHIC)               darkness, a red moon, it splits into three
   The last round is a dash-through cut with a frozen beat: the guardian
   dissolves or is cut in two (three of them at once for a mythic), the
   last seals burst, the lid flies off and the reward rises in the light.
   Where 3D cannot run (or motion is reduced) the seals film stays.
   Display only.
   ========================================================================== */
const Duel3D = {
  EXTRA: ['Melee_Block', 'Melee_Blocking', 'Melee_2H_Attack_Chop', 'Melee_2H_Attack_Spinning'],
  TIER: ['#dfe8ff', '#00b4ff', '#c45bff', '#ffb000', '#ff2b5e'],
  dead: 0, rn: null, xc: {}, heroKey: '', hero: null, guards: [],
  ok() {
    try { if (this.dead || CALM || typeof THREE === 'undefined' || typeof THREE_EX === 'undefined' || (typeof Q !== 'undefined' && Q.lvl === 0) || !Mini.ok() || window.__noDuel82) return false;
      if (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      let ok = true; for (const id of ['xbot', 'melee']) if (!Models.ok(id)) { Models.load(id); ok = false; }
      const body = (skinLook(Store.data.skin) || {}).body || 'ninja'; if (Human.HEAVY[body] && !Models.ok('soldier')) { Models.load('soldier'); ok = false; }
      return ok; } catch (e) { return false; }
  },
  /* the extra recorded moves of the duel, carried over to a body once (the same way as the dash cuts) */
  extra(base) {
    if (this.xc[base]) return this.xc[base]; const keep = [Melee.ONE, Melee.DUAL, Melee.EXTRA, Melee.clips[base]];
    try { Melee.ONE = this.EXTRA; Melee.DUAL = []; Melee.EXTRA = []; delete Melee.clips[base]; this.xc[base] = Melee.build(base) || {}; }
    finally { Melee.ONE = keep[0]; Melee.DUAL = keep[1]; Melee.EXTRA = keep[2]; if (keep[3]) Melee.clips[base] = keep[3]; else delete Melee.clips[base]; }
    return this.xc[base];
  },
  tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; },
  init() {
    if (this.rn) return true; const T = THREE;
    try {
      const cv = document.createElement('canvas'), rn = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false });
      rn.outputColorSpace = T.SRGBColorSpace; rn.toneMapping = T.ACESFilmicToneMapping; rn.toneMappingExposure = 1.2; rn.localClippingEnabled = true; rn.shadowMap.enabled = true; rn.shadowMap.type = T.PCFSoftShadowMap;
      const sc = new T.Scene(); sc.background = new T.Color(0x04050c); sc.fog = new T.Fog(0x04050c, 8, 22);
      const hemi = new T.HemisphereLight(0x93a8ff, 0x160c26, 1.05); sc.add(hemi);
      const key = new T.DirectionalLight(0xffffff, 2.3); key.position.set(-2.6, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); const kc = key.shadow.camera; kc.left = -5; kc.right = 5; kc.top = 5; kc.bottom = -5; kc.near = 1; kc.far = 22; key.shadow.bias = -.002; sc.add(key);
      const rim = new T.DirectionalLight(0x9fc8ff, 2.4); rim.position.set(1.5, 3.2, -6); sc.add(rim);
      const glowL = new T.PointLight(0x9fc8ff, 8, 10, 1.6); glowL.position.set(0, 1.5, -2.1); sc.add(glowL);
      // the floor: dark polished stone and a neon grid that fades into the dark
      const floor = new T.Mesh(new T.PlaneGeometry(70, 70), new T.MeshStandardMaterial({ color: 0x090c1b, metalness: .6, roughness: .46 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
      const grid = new T.GridHelper(70, 70, 0x2a4aa0, 0x16264f); grid.position.y = .004; grid.material.transparent = true; grid.material.opacity = .55; sc.add(grid);
      // the light behind the crate: a soft halo and a disc (the moon of the last seal)
      const soft = this.tex(128, 128, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
      const halo = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: soft, color: 0x9fc8ff, transparent: true, opacity: .32, blending: T.AdditiveBlending, depthWrite: false, fog: false })); halo.position.set(0, 2.6, -6.5); halo.scale.set(15, 15, 1); sc.add(halo);
      const moon = new T.Mesh(new T.CircleGeometry(1.7, 48), new T.MeshBasicMaterial({ color: 0xff2b5e, transparent: true, opacity: 0, fog: false })); moon.position.set(0, 5.6, -9); sc.add(moon);
      // the world of the fighters (the game's own axes: x right, y toward the viewer, z up, 30 units to a meter)
      const root = new T.Group(); root.rotation.x = -Math.PI / 2; const inner = new T.Group(); inner.scale.set(1 / 30, -1 / 30, 1 / 30); root.add(inner); sc.add(root);
      Object.assign(this, { rn, cv, scene: sc, hemi, key, rim, glowL, halo, moon, inner, soft, cam: new T.PerspectiveCamera(42, 1, .05, 80) });
      this.crateInit(); this.fxInit(); return true;
    } catch (e) { errLog(e); this.dead = 1; return false; }
  },
  /* the crate: dark panels, lit edges, a lid of its own, four steel seals around it and the seal badge on its front */
  crateInit() {
    const T = THREE, cr = new T.Group(); cr.position.set(0, 0, -2.4); this.scene.add(cr); const S = 1.35, Hh = S * .78;
    const std = (c, m, r) => new T.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
    const ped = new T.Mesh(new T.CylinderGeometry(1.25, 1.42, .14, 40), std(0x0d1124, .65, .4)); ped.position.y = .07; ped.receiveShadow = true; cr.add(ped);
    const edgeM = new T.MeshBasicMaterial({ color: 0x00f2fe }), pedRing = new T.Mesh(new T.TorusGeometry(1.25, .028, 6, 56), edgeM); pedRing.rotation.x = Math.PI / 2; pedRing.position.y = .145; cr.add(pedRing);
    const box = new T.Group(); box.position.y = 1.38; cr.add(box);
    const face = this.tex(256, 256, (x, w) => { x.fillStyle = '#121838'; x.fillRect(0, 0, w, w); x.strokeStyle = '#2a3566'; x.lineWidth = 6; x.strokeRect(18, 18, w - 36, w - 36);
      x.strokeStyle = '#ff2bd6'; x.lineWidth = 12; x.lineCap = 'round'; x.lineJoin = 'round'; for (const dx of [-34, 30]) { x.beginPath(); x.moveTo(w / 2 + dx - 22, 78); x.lineTo(w / 2 + dx + 22, w / 2); x.lineTo(w / 2 + dx - 22, w - 78); x.stroke(); }
      x.fillStyle = '#3a4a88'; for (const [a, b] of [[34, 34], [w - 34, 34], [34, w - 34], [w - 34, w - 34]]) { x.beginPath(); x.arc(a, b, 6, 0, 7); x.fill(); } });
    const bodyM = new T.MeshStandardMaterial({ map: face, emissiveMap: face, emissive: new T.Color(0xffffff), emissiveIntensity: .55, metalness: .45, roughness: .42 });
    const body = new T.Mesh(new T.BoxGeometry(S, Hh, S), bodyM); body.castShadow = true; box.add(body);
    const bar = (par, w, h, d, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), edgeM); m.position.set(x, y, z); par.add(m); return m; }, e = .045, hs = S / 2, hh = Hh / 2;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bar(box, e, Hh, e, sx * hs, 0, sz * hs);
    for (const sy of [-1, 1]) for (const s of [-1, 1]) { bar(box, S, e, e, 0, sy * hh, s * hs); bar(box, e, e, S, s * hs, sy * hh, 0); }
    const lid = new T.Group(); lid.position.y = hh + .1; box.add(lid); const lm = new T.Mesh(new T.BoxGeometry(S * 1.07, .2, S * 1.07), std(0x1b2350, .5, .4)); lm.castShadow = true; lid.add(lm);
    for (const s of [-1, 1]) { bar(lid, S * 1.07, e, e, 0, .1, s * hs * 1.07); bar(lid, e, e, S * 1.07, s * hs * 1.07, .1, 0); }
    const gem = new T.Mesh(new T.OctahedronGeometry(.2, 0), new T.MeshBasicMaterial({ color: 0xffd23f })); gem.scale.set(1.5, .3, 1.5); gem.position.y = .13; lid.add(gem);
    // the seals: steel straps with a line of light, two around and two over
    const steel = std(0x3a4566, .85, .32), line = new T.MeshBasicMaterial({ color: 0xdfe8ff }), straps = [], full = Hh + .24, cy = .1;
    const strap = (w, h, d, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); const a = new T.Mesh(new T.BoxGeometry(w, h, d), steel.clone()); a.castShadow = true; g.add(a);
      const b = new T.Mesh(new T.BoxGeometry(w > .2 ? w + .012 : .035, h > .2 ? h + .012 : .035, d > .2 ? d + .012 : .035), line.clone()); g.add(b); box.add(g); straps.push({ g, a, b, t: -1 }); };
    strap(.13, full + .03, S + .1, -hs * .45, cy, 0); strap(.13, full + .03, S + .1, hs * .45, cy, 0); strap(S + .1, .13, S + .1, 0, -hh * .3, 0); strap(S + .1, full + .03, .13, 0, cy, 0);
    const badgeT = this.tex(128, 128, (x, w) => { x.fillStyle = '#0c1020'; x.beginPath(); for (let j = 0; j < 6; j++) { const a = j / 6 * 6.2832 + .5236; x[j ? 'lineTo' : 'moveTo'](w / 2 + Math.cos(a) * 54, w / 2 + Math.sin(a) * 54); } x.closePath(); x.fill(); x.strokeStyle = '#dfe8ff'; x.lineWidth = 7; x.stroke();
      x.fillStyle = '#ffffff'; x.font = '900 62px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('封', w / 2, w / 2 + 4); });
    const badge = new T.Mesh(new T.PlaneGeometry(.5, .5), new T.MeshBasicMaterial({ map: badgeT, transparent: true })); badge.position.set(0, cy - .1, hs + .08); box.add(badge);
    // the light of the open crate
    const beamT = this.tex(8, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.75, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const beam = new T.Mesh(new T.CylinderGeometry(.75, .5, 14, 28, 1, true), new T.MeshBasicMaterial({ map: beamT, color: 0xffffff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false })); beam.position.y = 1.38 + 7; beam.visible = false; cr.add(beam);
    Object.assign(this, { crate: cr, box, lid, edgeM, straps, badge, beam, bodyM });
  },
  /* sparks, clash stars, floor rings and the streak of the last cut */
  fxInit() {
    const T = THREE, N = 520, geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute('color', new T.BufferAttribute(new Float32Array(N * 3), 3));
    const pts = new T.Points(geo, new T.PointsMaterial({ size: .1, map: this.soft, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true })); pts.frustumCulled = false; this.scene.add(pts);
    this.pts = pts; this.P = []; for (let i = 0; i < N; i++) this.P.push({ l: 0, c: new T.Color() });
    const star = this.tex(128, 128, (x, w) => { x.translate(w / 2, w / 2); const g = x.createRadialGradient(0, 0, 1, 0, 0, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-w / 2, -w / 2, w, w);
      x.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(0, -5); x.lineTo(w / 2 - 2, 0); x.lineTo(0, 5); x.closePath(); x.fill(); } });
    const cres = this.tex(128, 128, (x, w) => { x.lineCap = 'round'; x.strokeStyle = '#ffffff'; x.shadowColor = '#ffffff'; x.shadowBlur = 10; for (const [r, lw, a] of [[50, 9, 1], [42, 4, .6]]) { x.globalAlpha = a; x.lineWidth = lw; x.beginPath(); x.arc(w / 2, w / 2, r, -2.5, -.4); x.stroke(); } });
    this.sprT = [star, cres]; this.spr = []; for (let i = 0; i < 12; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: star, blending: T.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true })); s.visible = false; s.renderOrder = 5; this.scene.add(s); this.spr.push({ s, l: 0 }); }
    this.rings = []; for (let i = 0; i < 8; i++) { const m = new T.Mesh(new T.RingGeometry(.88, 1, 56), new T.MeshBasicMaterial({ transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.visible = false; this.scene.add(m); this.rings.push({ m, l: 0 }); }
    const stT = this.tex(128, 16, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.7, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = v; x.fillRect(0, 0, w, h); });
    this.streak = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: stT, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, depthTest: false, side: T.DoubleSide })); this.streak.visible = false; this.streak.renderOrder = 4; this.scene.add(this.streak);
  },
  W(x, y, z) { return new THREE.Vector3(x / 30, (z || 0) / 30, y / 30); }, // (the fighters' units to the scene's)
  burst(p, col, n, sp, life, up, grav) { const c = new THREE.Color(col); let k = 0; for (const q of this.P) { if (q.l > 0) continue; const a = Math.random() * 6.2832, b = Math.acos(Math.random() * 2 - 1), v = sp * (.3 + Math.random() * .7);
      q.x = p.x; q.y = p.y; q.z = p.z; q.vx = Math.sin(b) * Math.cos(a) * v; q.vy = Math.cos(b) * v + (up || 0); q.vz = Math.sin(b) * Math.sin(a) * v; q.l = q.l0 = life * (.55 + Math.random() * .45); q.c.copy(c); q.g = grav == null ? 5 : grav; q.tg = null; if (++k >= n) break; } },
  motes(p, tg, col, n) { const c = new THREE.Color(col); let k = 0; for (const q of this.P) { if (q.l > 0) continue; q.x = p.x + (Math.random() - .5) * .8; q.y = p.y + (Math.random() - .5) * .8; q.z = p.z + (Math.random() - .5) * .5; q.vx = (Math.random() - .5) * 3; q.vy = 1 + Math.random() * 2.5; q.vz = 1 + Math.random() * 2; q.l = q.l0 = .55 + Math.random() * .35; q.c.copy(c); q.g = 0; q.tg = tg; if (++k >= n) break; } },
  flare(p, col, size, life, kind, rot) { let b = this.spr[0]; for (const q of this.spr) if (q.l <= 0) { b = q; break; } b.l = b.l0 = life; b.sz = size; const m = b.s.material; m.map = this.sprT[kind | 0]; m.color.set(col); m.rotation = rot == null ? Math.random() * 6.28 : rot; m.opacity = 1; b.s.position.copy(p); b.s.visible = true; b.grow = kind ? .6 : 1.4; },
  ring(p, col, r, life) { let b = this.rings[0]; for (const q of this.rings) if (q.l <= 0) { b = q; break; } b.l = b.l0 = life; b.r = r; b.m.material.color.set(col); b.m.position.set(p.x, .03, p.z); b.m.visible = true; },
  fxTick(dt) {
    const pos = this.pts.geometry.attributes.position, col = this.pts.geometry.attributes.color; let i = 0;
    for (const q of this.P) { if (q.l > 0) { q.l -= dt; if (q.tg) { const k = 1 - q.l / q.l0, s = Math.min(1, dt * (3 + k * 14)); q.x += (q.tg.x - q.x) * s + q.vx * dt * (1 - k); q.y += (q.tg.y - q.y) * s + q.vy * dt * (1 - k); q.z += (q.tg.z - q.z) * s + q.vz * dt * (1 - k); }
        else { q.vy -= q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; if (q.y < .03 && q.g > 0) { q.y = .03; q.vy *= -.35; q.vx *= .6; q.vz *= .6; } }
        const k = Math.max(0, q.l / q.l0); pos.setXYZ(i, q.x, q.y, q.z); col.setXYZ(i, q.c.r * k, q.c.g * k, q.c.b * k); } else { pos.setXYZ(i, 0, -50, 0); col.setXYZ(i, 0, 0, 0); } i++; }
    pos.needsUpdate = true; col.needsUpdate = true;
    for (const b of this.spr) { if (b.l <= 0) continue; b.l -= dt; const k = Math.max(0, b.l / b.l0), s = b.sz * (1 + (1 - k) * b.grow); b.s.scale.set(s, s, 1); b.s.material.opacity = k; if (b.l <= 0) b.s.visible = false; }
    for (const b of this.rings) { if (b.l <= 0) continue; b.l -= dt; const k = Math.max(0, b.l / b.l0), e = 1 - k * k, s = b.r * (.15 + .85 * e); b.m.scale.set(s, s, 1); b.m.material.opacity = k * .9; if (b.l <= 0) b.m.visible = false; }
    if (this.streak.visible) { this.streak.material.opacity = Math.max(0, this.streak.material.opacity - dt * 2.6); if (this.streak.material.opacity <= 0) this.streak.visible = false; }
  },
  /* a fighter: a hero body with its gear; the guardian wears its own copies of every material (it changes color, fades and is cut) */
  fighter(L, wid, own) {
    const g = Human.build(L, wid); if (g.pool) g.pool.visible = false; try { Look.dress(g); } catch (e) { errLog(e); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = !o.userData.ink; o.frustumCulled = false; } });
    if (own) { const U = { c: { value: new THREE.Color('#dfe8ff') } }, sh = this.shadow(U), map = new Map(); g.U82 = U; // (a shadow: black, a rim of light in its tier's color, lit eyes and blade)
      g.traverse(o => { if (!o.isMesh || !o.material) return; if (o.userData.ink) { o.visible = false; o.userData.off82 = 1; return; } const src = o.material, lit = src.emissive && src.emissiveIntensity > 1;
        if (!lit) { o.material = sh; return; } let m = map.get(src); if (!m) { m = src.clone(); m.userData.lit = 1; map.set(src, m); } o.material = m; }); g.own = [sh, ...map.values()]; }
    this.inner.add(g); return { g, x: 0, y: 0, z: 0, face: 0, spd: 0, hp: 9, win: false, vis: 1, sc: 1, s0: g.scale.x };
  },
  shadow(U, planes) { const m = new THREE.MeshStandardMaterial({ color: 0x05060b, roughness: .5, metalness: .35, side: THREE.DoubleSide }); m.userData.sh82 = U; if (planes) { m.clippingPlanes = planes; m.transparent = true; }
    m.onBeforeCompile = sh => { sh.uniforms.uRim82 = U.c; sh.fragmentShader = 'uniform vec3 uRim82;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{ float fr82 = 1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0); totalEmissiveRadiance += uRim82 * (pow(fr82, 2.2) * 2.1 + 0.035); }'); };
    m.customProgramCacheKey = () => 'sh82'; return m; },
  arm(F) { const h = F.g.human; if (!Melee.arm(F.g)) return false; if (!h.x82) { h.x82 = 1; const C = this.extra(h.r.base); for (const k in C) { const a = h.r.mixer.clipAction(C[k]); a.setLoop(THREE.LoopOnce, 1); h.melee[k] = a; } } return true; },
  fire(F, name, ts) { try { return Moves75.fire(F.g.human, name, ts || 1.8); } catch (e) { return false; } },
  guard(F, w, dt) { const h = F.g.human, a = h.melee && h.melee.Melee_2H_Idle; if (!a) return; if (!a.isRunning()) { a.setLoop(THREE.LoopRepeat, Infinity); a.reset(); a.setEffectiveWeight(0); a.play(); }
    F.gw = (F.gw || 0) + (w - (F.gw || 0)) * Math.min(1, dt * 8); a.setEffectiveWeight(h.cutA ? 0 : F.gw); const loco = h.r.acts[h.r.cur]; if (loco && !h.cutA) loco.setEffectiveWeight(Math.max(.05, 1 - F.gw)); },
  drive(F, dt, t) { const g = F.g; Human.anim(g, { x: F.x, y: F.y, face: F.face, spd: F.spd, dashing: false, alpha: 1, hp: F.hp, win: F.win }, dt, t); this.guard(F, F.win || F.spd > 40 ? 0 : 1, dt);
    g.position.set(F.x, F.y, F.z || 0); g.rotation.z = F.face; g.scale.setScalar(F.s0 * F.sc); g.visible = F.vis > .02;
    if (g.own && F.vis !== F.pv) { F.pv = F.vis; for (const m of g.own) { m.transparent = F.vis < 1; m.opacity = F.vis; } } },
  tint(F, col) { const c = new THREE.Color(col); if (F.g.U82) F.g.U82.c.value.copy(c); for (const m of F.g.own || []) if (m.userData.lit && m.emissive) m.emissive.copy(c); },
  /* the cut: two copies of the body as it stands, each keeping one side of the blade's plane, sliding apart */
  slice(F, ang) {
    const T = THREE, g = F.g; g.updateMatrixWorld(true); const c = new T.Vector3(); g.getWorldPosition(c); c.y += 1.0 * F.sc; const n = new T.Vector3(Math.sin(ang), Math.cos(ang), 0).normalize(), out = [];
    for (const sd of [1, -1]) { const h = THREE_EX.SkeletonUtils.clone(g), pl = new T.Plane().setFromNormalAndCoplanarPoint(n.clone().multiplyScalar(sd), c), mats = new Map();
      h.traverse(o => { if (!o.isMesh) return; if (o.userData.ink || !o.material) { o.visible = false; return; } let m = mats.get(o.material); if (!m) { m = o.material.userData.sh82 ? this.shadow(o.material.userData.sh82, [pl]) : o.material.clone(); m.clippingPlanes = [pl]; m.transparent = true; m.opacity = 1; mats.set(o.material, m); } o.material = m; o.castShadow = false; o.frustumCulled = false; });
      this.inner.add(h); out.push({ h, pl, mats: [...mats.values()], sd, p0: h.position.clone() }); }
    F.vis = 0; g.visible = false; this.cuts.push({ out, n, c, t: 0, d: .85 });
  },
  cutTick(dt) { for (let i = this.cuts.length - 1; i >= 0; i--) { const q = this.cuts[i]; q.t += dt; const k = Math.min(1, q.t / q.d), e = 1 - Math.pow(1 - k, 2);
      for (const o of q.out) { const dx = q.n.x * o.sd * e * .5 + o.sd * e * .12, dy = q.n.y * o.sd * e * .35 - k * k * .7; o.h.position.set(o.p0.x + dx * 30, o.p0.y, o.p0.z + dy * 30); // (the fighters' space: x right, z up)
        o.pl.setFromNormalAndCoplanarPoint(q.n.clone().multiplyScalar(o.sd), new THREE.Vector3(q.c.x + dx, q.c.y + dy, q.c.z)); for (const m of o.mats) m.opacity = 1 - k * k; }
      if (k >= 1) { for (const o of q.out) { this.inner.remove(o.h); for (const m of o.mats) m.dispose(); } this.cuts.splice(i, 1); } } },
  plan(r) { const L = [{ k: 'intro', d: 1.2 }]; for (let i = 1; i <= r; i++) { L.push({ k: 'round', i, d: 1.1 }); L.push({ k: 'awaken', i, d: [0, .75, .85, 1.0, 1.45][i] }); L.push({ k: 'counter', i, d: .82 }); }
    L.push({ k: 'round', i: r + 1, fin: 1, d: .4 }); L.push({ k: 'finish', d: r >= 3 ? 1.5 : 1.0 }); L.push({ k: 'fall', d: .7 }); L.push({ k: 'open', d: 1.85 }); let t = 0; for (const s of L) { s.t0 = t; t += s.d; } return { L, dur: t }; },
  /* ---------- the film ---------- */
  run(res, done) {
    const T = THREE, D = this, r = res.r | 0, R0 = RAR[r], T0 = CRATE_T[res.t || 'neon'] || CRATE_T.neon, sk = skinLook(Store.data.skin), wid = Store.data.weapon || 'katana';
    const ov = el('div', 'cr-film'), cv2 = document.createElement('canvas'); ov.appendChild(D.cv); ov.appendChild(cv2); const skip = el('button', 'chip cr-skip', lt('SKIP')); ov.appendChild(skip); document.body.appendChild(ov);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight, k = Math.min(W / 400, H / 700), ox = (W - 400 * k) / 2, oy = (H - 700 * k) / 2; cv2.width = W * dpr; cv2.height = H * dpr; const g2 = cv2.getContext('2d');
    D.rn.setPixelRatio(Math.min(dpr, Q.lvl >= 2 ? 1.5 : 1)); D.rn.setSize(W, H, false); D.rn.shadowMap.enabled = Q.lvl >= 2; D.cam.aspect = W / H;
    // the fighters
    const hk = (sk.id || '') + '|' + (sk.body || 'ninja') + '|' + sk.a + '|' + sk.b + '|' + wid; if (D.heroKey !== hk) { if (D.hero) D.inner.remove(D.hero.g); D.hero = D.fighter({ body: sk.body || 'ninja', a: sk.a, b: sk.b }, wid, false); D.heroKey = hk; }
    const need = r >= 4 ? 3 : 1; while (D.guards.length < need) D.guards.push(D.fighter({ body: 'shinobi2', a: '#dfe8ff', b: '#1a1f30' }, 'katana', true));
    const Hf = D.hero, G = D.guards, Gd = G[0], HX = -5, HY = 64, EX = -5, EY = 33, GX = 5, GY = -5;
    Object.assign(Hf, { x: HX, y: 150, z: 0, face: -Math.PI / 2, spd: 300, win: false, hp: 9, vis: 1, sc: 1 }); Hf.g.mv = null;
    G.forEach((F, i) => { Object.assign(F, { x: GX, y: GY, z: 170, face: Math.PI / 2, spd: 0, hp: 9, vis: 0, sc: 1, pv: -1, win: false, fade: 0 }); F.g.mv = null; D.tint(F, D.TIER[0]); F.on = i === 0; F.g.visible = false; });
    // the scene, reset
    D.cuts = D.cuts || []; for (const q of D.cuts) for (const o of q.out) D.inner.remove(o.h); D.cuts.length = 0; for (const q of D.P) q.l = 0; for (const b of D.spr) { b.l = 0; b.s.visible = false; } for (const b of D.rings) { b.l = 0; b.m.visible = false; }
    D.edgeM.color.set(T0.c || '#00f2fe'); D.box.position.set(0, 9, 0); D.box.rotation.set(0, .5, 0); D.lid.position.set(0, 1.35 * .39 + .1, 0); D.lid.rotation.set(0, 0, 0); D.lid.visible = true; D.beam.visible = false; D.beam.material.opacity = 0; D.badge.visible = true; D.bodyM.emissiveIntensity = .55;
    for (const s of D.straps) { s.t = -1; s.g.visible = true; s.g.scale.setScalar(1); s.a.material.opacity = 1; s.a.material.transparent = false; s.b.material.opacity = 1; s.b.material.transparent = false; }
    D.moon.material.opacity = 0; D.scene.fog.color.set(0x04050c); D.scene.background.set(0x04050c); D.hemi.intensity = 1.05; D.key.intensity = 2.3; D.streak.visible = false;
    const S = { t: 0, rt: 0, shake: 0, flash: 0, fc: '#ffffff', sfx: {}, lvl: 0, col: D.TIER[0], lines: 0, stop: 0, parts: [], cap: '', capT: 0 }, P = D.plan(r), col = new T.Color(D.TIER[0]), colTo = new T.Color(D.TIER[0]);
    const C = { p: new T.Vector3(.5, 3.6, 8), t: new T.Vector3(0, 1.3, -1.8), fov: 44, roll: 0 }, aimP = new T.Vector3(), aimT = new T.Vector3(); let aimF = 44, aimR = 0;
    const aim = (p, t, fov, roll, snap) => { aimP.set(p[0], p[1], p[2]); aimT.set(t[0], t[1], t[2]); aimF = fov; aimR = roll || 0; if (snap) { C.p.copy(aimP); C.t.copy(aimT); C.fov = fov; C.roll = aimR; } };
    const once = (key, f) => { if (!S.sfx[key]) { S.sfx[key] = 1; try { f(); } catch (e) { errLog(e); } } }, sfx = n => { try { Aud.sfx(n); } catch (e) { } };
    const lerp = (a, b, u) => a + (b - a) * u, ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, sat = u => Math.max(0, Math.min(1, u)), seg = (u, a, b) => sat((u - a) / (b - a));
    const chest = F => D.W(F.x, F.y, 34 * F.sc + F.z), mid = (A, B) => { const a = chest(A), b = chest(B); return a.lerp(b, .5); };
    const clash = (p, c, big) => { D.flare(p, '#ffffff', big ? 1.5 : .95, .22, 0); D.flare(p, c, big ? 1.7 : 1.1, .26, 1); D.burst(p, '#ffffff', big ? 26 : 14, big ? 6 : 4.2, .5); D.burst(p, c, big ? 22 : 10, big ? 5 : 3.4, .6); sfx('clash'); S.shake = Math.max(S.shake, big ? .7 : .36); S.punch = Math.max(S.punch || 0, big ? .9 : .5); try { vibe('hit'); } catch (e) { } };
    const face = (A, B) => Math.atan2(B.y - A.y, B.x - A.x);
    const breakSeal = (i, c) => { const s = D.straps[[2, 0, 1, 3][i - 1]]; if (!s || s.t >= 0) return; s.t = 0; const p = new T.Vector3(0, D.box.position.y, -2.4 + .7); D.burst(p, '#dfe8ff', 18, 4, .7); if (c) D.motes(p, chest(Gd), c, 40); };
    let last = performance.now(), end = false; const finish = () => { if (end) return; end = true; ov.remove(); done(); };
    skip.onclick = e => { e.stopPropagation(); finish(); }; ov.addEventListener('click', () => { if (S.rt > .6) finish(); });
    let icon = null; const side = i => (i % 2 ? 1 : -1);
    const frame = now => {
      const rdt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; S.rt += rdt;
      let ts = 1; if (S.stop > 0) { S.stop -= rdt; ts = .03; } else if (S.sm > 0) { S.sm -= rdt; ts = .35; } S.slow = 0; const dt = rdt * ts; S.t += dt; const t = S.t; /* (its own beats of slow motion: the frozen cut, the awakenings) */
      let st = P.L[P.L.length - 1]; for (const s of P.L) if (t >= s.t0 && t < s.t0 + s.d) { st = s; break; } const u = sat((t - st.t0) / st.d), lt0 = t - st.t0, i = st.i | 0, K = st.k + i;
      const tc = D.TIER[Math.min(4, S.lvl)]; Hf.spd = 0; Gd.spd = 0;
      // ----- the crate: it lands, then floats and turns slowly -----
      if (st.k === 'intro') { const e = sat(lt0 / .42); D.box.position.y = lerp(9, 1.38, e * e); if (e >= 1) once('land', () => { S.shake = .8; sfx('wall'); D.ring(new T.Vector3(0, 0, -2.4), '#9fb3d9', 3.2, .6); D.burst(new T.Vector3(0, .3, -2.4), '#8a93a8', 30, 3.5, .8); }); }
      if (st.k !== 'open' && st.k !== 'intro') D.box.position.y = 1.38 + Math.sin(S.rt * 1.7) * .06;
      D.box.rotation.y = .5 + Math.sin(S.rt * .6) * .12;
      for (const s of D.straps) if (s.t >= 0 && s.g.visible) { s.t += rdt; const q = sat(s.t / .4); s.g.scale.setScalar(1 + q * .7); for (const m of [s.a.material, s.b.material]) { m.transparent = true; m.opacity = 1 - q; } if (q >= 1) s.g.visible = false; }
      // ----- the fight -----
      if (st.k === 'intro') {
        aim([lerp(.5, 1.25, ease(u)), lerp(3.6, 2.55, ease(u)), lerp(8, 6.3, ease(u))], [0, lerp(1.3, 1.0, u), lerp(-1.8, -.2, u)], 44, 0, lt0 < .02);
        Hf.y = lerp(150, HY, ease(seg(u, .1, .85))); Hf.spd = u > .1 && u < .85 ? 320 : 0; Hf.face = -Math.PI / 2;
        const q = seg(u, .42, .6); Gd.vis = q > 0 ? Math.min(1, q * 3) : 0; Gd.z = lerp(170, 0, q * q); Gd.face = Math.PI / 2;
        if (q >= 1) once('gland', () => { D.ring(D.W(GX, GY), '#dfe8ff', 1.7, .45); D.burst(D.W(GX, GY, 8), '#cfd6e6', 26, 2.6, .7, .5); sfx('warp'); S.shake = Math.max(S.shake, .3); });
      } else if (st.k === 'round') {
        const sd = side(i); aim([2.95 * sd, 1.42, 4.0], [0, 1.0, .45], 43, 0, lt0 < .02 && !st.fin);
        if (st.fin) { Hf.x = HX; Hf.y = HY; Hf.face = face(Hf, Gd); Gd.face = face(Gd, Hf); aim([.55 * sd, 3.3, 5.0], [0, .75, .9], 44, 0, lt0 < .02); } // (the last round: they measure each other, seen from above the hero's shoulder)
        else { const a1 = .15, h1 = a1 + .27, a2 = .54, h2 = a2 + .27, inn = ease(seg(lt0, 0, a1 + .1)), outK = ease(seg(lt0, .9, 1.1)), push = (lt0 > h1 ? 5 : 0) + (lt0 > h2 ? 9 : 0);
          Hf.x = lerp(HX, EX, inn - outK); Hf.y = lerp(HY, EY - push * .5, inn - outK); Hf.spd = lt0 < a1 ? 420 : 0; Hf.face = face(Hf, Gd);
          Gd.x = GX; Gd.y = lerp(Gd.y, GY - push, Math.min(1, dt * 14)); Gd.face = face(Gd, Hf);
          if (lt0 >= a1) once('a1' + K, () => { D.fire(Hf, Melee.ONE[(i * 2) % 4], 1.9); sfx('slash'); }); if (lt0 >= h1 - .1) once('b1' + K, () => D.fire(Gd, 'Melee_Block_Hit', 1.9)); if (lt0 >= h1) once('h1' + K, () => clash(mid(Hf, Gd), tc));
          if (lt0 >= a2) once('a2' + K, () => { D.fire(Hf, Melee.ONE[(i * 2 + 1) % 4], 1.9); sfx('slash'); }); if (lt0 >= h2 - .1) once('b2' + K, () => D.fire(Gd, 'Melee_Block_Hit', 1.7)); if (lt0 >= h2) once('h2' + K, () => { clash(mid(Hf, Gd), tc, true); Gd.hp--; }); }
      } else if (st.k === 'awaken') {
        const c = D.TIER[i]; Hf.x = HX; Hf.y = HY; Hf.face = face(Hf, Gd); Gd.face = face(Gd, Hf); Gd.y = lerp(Gd.y, GY, Math.min(1, dt * 5));
        aim([lerp(1.7, 1.35, u) * side(i + 1), lerp(.95, 1.05, u), lerp(3.5, 3.1, u)], [GX / 30, 1.0 + (i >= 3 ? .1 : 0), -.5], 42, .05 * side(i), lt0 < .02);
        if (u >= .22) once('aw' + K, () => { breakSeal(i, c); S.lvl = i; S.col = c; colTo.set(c); S.flash = .28 + i * .1; S.fc = c; D.tint(Gd, c); D.ring(D.W(Gd.x, Gd.y), c, 2 + i * .5, .6); D.burst(chest(Gd), c, 20 + i * 12, 3 + i, .9); S.cap = lt(['', 'IT HOLDS…', 'SOMETHING STIRS', 'THE SEALS ARE BREAKING', '…'][i]); S.capT = 1.4; S.sm = .22;
          if (i === 1) { sfx('lock'); S.shake = .5; } if (i === 2) { sfx('boom'); S.shake = .8; } if (i === 3) { sfx('od'); S.shake = 1; } if (i === 4) { sfx('tick'); } });
        if (i === 3 && u > .22) { Gd.sc = lerp(Gd.sc, 1.16, Math.min(1, dt * 4)); if (Math.random() < dt * 5) D.ring(D.W(Gd.x, Gd.y), c, 1.5, .5); }
        if (i === 4) { const dk = seg(u, .22, .5); D.hemi.intensity = lerp(1.05, .35, dk); D.key.intensity = lerp(2.3, .9, dk); D.moon.material.opacity = seg(u, .4, .7) * .95; if (u > .45) once('tk2', () => sfx('tick'));
          if (u >= .62) once('split', () => { sfx('roar'); S.shake = 1.2; S.flash = .7; S.fc = c; for (const F of [G[1], G[2]]) { F.on = true; F.vis = .01; F.x = Gd.x; F.y = Gd.y; F.z = 0; D.tint(F, c); } D.burst(chest(Gd), c, 60, 6, 1.1); });
          if (u >= .62) { const q = ease(seg(u, .62, .95)); [G[1], G[2]].forEach((F, j) => { F.x = Gd.x + (j ? 1 : -1) * 36 * q; F.y = Gd.y + 10 * q; F.vis = Math.min(1, q * 2.5); F.face = face(F, Hf); }); } }
      } else if (st.k === 'counter') {
        const c = D.TIER[i], sd = side(i + 1); aim([2.95 * sd, 1.42, 5.0], [0, 1.0, 1.5], 43, 0, lt0 < .02); Hf.x = HX; Hf.face = face(Hf, Gd);
        if (i === 1) { const q = Math.sin(seg(lt0, .02, .62) * Math.PI); Gd.y = lerp(GY, HY - 37, q); Gd.spd = lt0 < .25 ? 420 : 0; Gd.face = face(Gd, Hf);
          if (lt0 >= .08) once('ca' + K, () => { D.fire(Gd, 'Melee_1H_Attack_Chop', 1.9); sfx('slash'); }); if (lt0 >= .24) once('cb' + K, () => D.fire(Hf, 'Melee_Block_Hit', 1.9)); if (lt0 >= .34) once('ch' + K, () => clash(mid(Hf, Gd), c, true)); Hf.y = lerp(Hf.y, HY + (lt0 > .34 && lt0 < .6 ? 7 : 0), Math.min(1, dt * 12)); }
        if (i === 2) { const o1 = seg(lt0, 0, .1), in1 = seg(lt0, .16, .24), o2 = seg(lt0, .56, .64), in2 = seg(lt0, .68, .78); Gd.vis = lt0 < .16 ? 1 - o1 : lt0 < .56 ? in1 : lt0 < .68 ? 1 - o2 : in2;
          if (lt0 >= .02) once('bk' + K, () => { D.burst(chest(Gd), c, 24, 3, .5); sfx('warp'); }); if (lt0 >= .13 && lt0 < .66) { Gd.x = HX - 25 * sd; Gd.y = HY - 8; } /* (on the hero's far flank, in the camera's view) */ else if (lt0 >= .66) { Gd.x = GX; Gd.y = GY; } Gd.face = face(Gd, Hf);
          if (lt0 >= .16) once('bk2' + K, () => { D.burst(chest(Gd), c, 24, 3, .5); D.fire(Gd, 'Melee_1H_Attack_Slice_Horizontal', 2.1); sfx('slash'); }); if (lt0 >= .3) once('cb' + K, () => D.fire(Hf, 'Melee_Block_Hit', 2)); if (lt0 >= .43) once('ch' + K, () => clash(mid(Hf, Gd), c, true)); if (lt0 >= .57) once('bk3' + K, () => { D.burst(chest(Gd), c, 20, 3, .5); sfx('warp'); }); }
        if (i === 3) { const q = seg(lt0, .04, .46), back = ease(seg(lt0, .56, .8)); Gd.y = lerp(lerp(GY, HY - 36, ease(q)), GY, back); Gd.z = Math.sin(q * Math.PI) * 58 + Math.sin(back * Math.PI) * 20; Gd.face = face(Gd, Hf);
          if (lt0 >= .1) once('ca' + K, () => { D.fire(Gd, 'Melee_2H_Attack_Chop', 2.3); sfx('slash'); }); if (lt0 >= .34) once('cb' + K, () => D.fire(Hf, 'Melee_Block_Hit', 1.6));
          if (lt0 >= .46) once('ch' + K, () => { clash(mid(Hf, Gd), c, true); D.ring(D.W(Hf.x, Hf.y), c, 4.2, .7); D.ring(D.W(Hf.x, Hf.y), '#ffffff', 2.4, .45); S.shake = 1; S.flash = .35; S.fc = c; sfx('boom'); }); Hf.y = lerp(Hf.y, HY + (lt0 > .46 && lt0 < .8 ? 13 : 0), Math.min(1, dt * 10)); }
        if (i === 4) { const q = Math.sin(seg(lt0, .02, .7) * Math.PI), at = [[GX, HY - 38], [HX - 36, HY + 2], [HX + 40, HY + 2]], home = [[GX, GY], [GX - 36, GY + 10], [GX + 36, GY + 10]];
          G.forEach((F, j) => { F.x = lerp(home[j][0], at[j][0], q); F.y = lerp(home[j][1], at[j][1], q); F.face = face(F, Hf); F.spd = lt0 < .25 ? 420 : 0; });
          if (lt0 >= .1) once('ca' + K, () => { G.forEach(F => D.fire(F, 'Melee_1H_Attack_Chop', 1.9)); sfx('slash'); }); if (lt0 >= .14) once('cb' + K, () => { D.fire(Hf, 'Melee_2H_Attack_Spinning', 1.5); sfx('slash'); });
          if (lt0 >= .36) once('ch' + K, () => { G.forEach(F => clash(mid(Hf, F), c, true)); D.ring(D.W(Hf.x, Hf.y), '#ffffff', 3.4, .5); D.ring(D.W(Hf.x, Hf.y), c, 4.6, .7); S.flash = .4; S.fc = '#ffffff'; }); }
      } else if (st.k === 'finish') {
        const big = r >= 3, wind = big ? .62 : .5, hc = sk.a || '#00f2fe'; aim([.6, lerp(3.5, 3.1, u), lerp(5.0, 4.5, u)], [0, .75, .9], 44, 0, lt0 < .02); Gd.face = face(Gd, Hf); for (const F of G) if (F.on && F !== Gd) F.face = face(F, Hf);
        if (u < wind) { Hf.x = HX; Hf.y = HY; Hf.face = face(Hf, Gd); if (Math.random() < rdt * (big ? 9 : 5)) D.ring(D.W(Hf.x, Hf.y), hc, big ? 2.2 : 1.4, .45); if (big) { S.shake = Math.max(S.shake, .25); once('pw', () => { sfx('od'); S.lines = .6; }); if (Math.random() < rdt * 20) D.burst(D.W(Hf.x + (Math.random() - .5) * 40, Hf.y + (Math.random() - .5) * 40, 2), hc, 2, 1.2, .6, 3, -2); } }
        else { const q = seg(u, wind, wind + .09); Hf.x = lerp(HX, GX - 24, q); Hf.y = lerp(HY, GY - 36, q); Hf.face = -Math.PI / 2;
          once('dash', () => { D.fire(Hf, 'Melee_1H_Attack_Slice_Horizontal', 2.6); sfx('slash'); });
          if (q >= .55) once('cut', () => { const a = D.W(HX, HY, 34), b = D.W(GX - 24, GY - 36, 34), m = a.clone().lerp(b, .5); const dir = b.clone().sub(a).normalize(), toCam = D.cam.position.clone().sub(m).normalize(), up = new T.Vector3().crossVectors(toCam, dir).normalize(), zz = new T.Vector3().crossVectors(dir, up); D.streak.position.copy(m); D.streak.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(dir, up, zz)); D.streak.scale.set(a.distanceTo(b) * 1.7, big ? .9 : .55, 1); D.streak.material.color.set(big ? R0.c : '#ffffff'); D.streak.material.opacity = 1; D.streak.visible = true;
            for (const F of G) if (F.on) { D.flare(chest(F), '#ffffff', big ? 2.6 : 1.7, .4, 0); D.flare(chest(F), hc, 2.2, .45, 1, -.6); } S.stop = big ? .42 : .26; S.flash = big ? .85 : .55; S.fc = '#ffffff'; S.shake = big ? 1.1 : .6; S.lines = .5; sfx('zan'); try { vibe('crit'); } catch (e) { } });
        }
      } else if (st.k === 'fall') {
        aim([1.0, 1.15, 3.1], [.05, 1.0, -.5], 44, .04, lt0 < .02); Hf.x = GX - 24; Hf.y = GY - 36; Hf.face = -Math.PI / 2;
        once('fall', () => { G.forEach((F, j) => { if (!F.on) return; if (r >= 2) { D.slice(F, [.75, -.6, .5][j]); D.burst(chest(F), tc, 30 + r * 10, 4 + r, 1); D.burst(chest(F), '#ffffff', 14, 3, .6); } else { F.fade = 1; D.burst(chest(F), tc, 26, 2.4, 1, 1.5, -1.5); } }); if (r >= 3) { S.shake = .9; S.flash = .4; S.fc = tc; D.ring(D.W(Gd.x, Gd.y), tc, 4, .8); } sfx(r >= 2 ? 'boom' : 'hit'); });
        for (const F of G) if (F.fade) { F.vis = Math.max(0, F.vis - rdt * 2.2); F.z -= rdt * 12; if (Math.random() < rdt * 30) D.burst(chest(F), tc, 2, 1, .8, 1.6, -1.2); }
        for (let j = r + 1; j <= 4; j++) if (u >= .25 + (j - r - 1) * .16) once('ls' + j, () => { breakSeal(j, null); sfx('lock'); S.shake = Math.max(S.shake, .35); }); // (the seals that still held burst one after another)
        D.box.position.x = (Math.random() - .5) * .05 * u; D.bodyM.emissiveIntensity = .55 + u * 1.2;
      } else if (st.k === 'open') {
        aim([lerp(.6, .25, u), lerp(.85, .66, u), lerp(3.7, 3.2, u)], [0, lerp(1.6, 2.5, ease(seg(u, 0, .6))), -2.4], 50, 0); Hf.x = GX - 24; Hf.y = GY - 36; Hf.face = -Math.PI / 2 + .35; Hf.win = u > .25; for (const F of G) F.vis = F.fade ? Math.max(0, F.vis - rdt * 3) : F.vis;
        once('open', () => { sfx('boom'); sfx('star'); S.flash = 1; S.fc = R0.c; S.col = R0.c; colTo.set(R0.c); S.lvl = Math.max(S.lvl, r); D.badge.visible = false; D.beam.visible = true; D.beam.material.color.set(R0.c); const p = new T.Vector3(0, 1.9, -2.4); D.burst(p, R0.c, 110 + r * 30, 7 + r, 1.4, 4); D.burst(p, '#ffffff', 50, 5, .9, 3); D.ring(new T.Vector3(0, 0, -2.4), R0.c, 5 + r, .9); D.ring(new T.Vector3(0, 0, -2.4), '#ffffff', 3, .6); S.shake = 1; D.edgeM.color.set(R0.c); try { vibe('crit'); } catch (e) { } });
        D.moon.material.opacity = Math.min(D.moon.material.opacity, Math.max(.22, .95 - u * 3)); D.box.position.x = 0; D.lid.position.y = 1.35 * .39 + .1 + ease(seg(u, 0, .5)) * 3.4; D.lid.position.x = seg(u, 0, .6) * 1.3; D.lid.rotation.z = -u * 2.4; D.lid.rotation.x = u * 1.1; D.beam.material.opacity = Math.min(.8, u * 4) * (.85 + Math.sin(S.rt * 9) * .15);
        if (r >= 3 && Math.random() < rdt * 14) D.burst(new T.Vector3((Math.random() - .5) * 5, 3 + Math.random() * 2, -2.4 - Math.random() * 2), R0.c, 3, 1.5, 1, 0, 2);
      }
      // ----- everyone moves -----
      const act = [Hf].concat(G.filter(F => F.on)); for (const F of act) { try { if (!F.armed) F.armed = D.arm(F); D.drive(F, dt, t); } catch (e) { errLog(e); } } for (const F of G) if (!F.on) F.g.visible = false;
      D.cutTick(dt); D.fxTick(dt);
      // ----- light and camera -----
      col.lerp(colTo, Math.min(1, rdt * 5)); D.rim.color.copy(col); D.glowL.color.copy(col); D.halo.material.color.copy(col); D.glowL.intensity = st.k === 'open' ? 26 : 8 + S.lvl * 2; D.halo.material.opacity = st.k === 'open' ? .6 : .3 + S.lvl * .05;
      const ck = Math.min(1, rdt * 6.5); C.p.lerp(aimP, ck); C.t.lerp(aimT, ck); C.fov += (aimF - C.fov) * ck; C.roll += (aimR - C.roll) * ck; S.punch = Math.max(0, (S.punch || 0) - rdt * 4); S.shake = Math.max(0, S.shake - rdt * 2.6);
      const sh = S.shake * .09; D.cam.position.set(C.p.x + (Math.random() - .5) * sh, C.p.y + (Math.random() - .5) * sh, C.p.z + (Math.random() - .5) * sh); D.cam.up.set(Math.sin(C.roll), Math.cos(C.roll), 0); D.cam.lookAt(C.t); D.cam.fov = C.fov - S.punch * 5; D.cam.updateProjectionMatrix();
      D.rn.render(D.scene, D.cam);
      // ----- in front of the scene: the reward, the words, the flash -----
      g2.setTransform(dpr, 0, 0, dpr, 0, 0); g2.clearRect(0, 0, W, H);
      if (i === 2 && st.k === 'awaken' && u > .2 && u < .7 && Math.random() < .5) { const v = chest(Gd).project(D.cam), sx = (v.x * .5 + .5) * W, sy = (1 - (v.y * .5 + .5)) * H; g2.save(); g2.setTransform(dpr, 0, 0, dpr, 0, 0); try { CrateFilm.bolt(g2, sx + (Math.random() - .5) * 160, -20, sx, sy, D.TIER[2]); } catch (e) { } g2.restore(); }
      if (st.k === 'open' && u > .16) { try { if (!icon) { const c = document.createElement('canvas'); c.width = c.height = 220; const ig = c.getContext('2d'); if (res.item) drawIcon(ig, { tab: res.item.tab, id: res.item.id, tier: r + 1 }, 220); else Crates.drawLoot(ig, 220, res, R0.c);
            const I = ig.getImageData(0, 0, 220, 220), q = I.data; for (let j = 0; j < q.length; j += 4) { const m = Math.max(q[j], q[j + 1], q[j + 2]); if (m < 70) q[j + 3] = Math.max(0, (m - 30) * 6); } ig.putImageData(I, 0, 0); icon = c; }
          const v = new T.Vector3(0, D.box.position.y + .5, -2.4).project(D.cam), sx = (v.x * .5 + .5) * W, sy0 = (1 - (v.y * .5 + .5)) * H, q = sat((u - .16) / .5), e = 1 - Math.pow(1 - q, 3), sz = (50 + e * 130) * k, sy = lerp(sy0, H * .36, e), turn = Math.cos((u - .16) * 10 * (1 - e * .88));
          g2.save(); g2.globalCompositeOperation = 'lighter'; const hg = g2.createRadialGradient(sx, sy, 4, sx, sy, sz); hg.addColorStop(0, hexA(R0.c, .65 * e)); hg.addColorStop(1, hexA(R0.c, 0)); g2.fillStyle = hg; g2.fillRect(sx - sz, sy - sz, sz * 2, sz * 2); g2.restore();
          g2.save(); g2.translate(sx, sy); g2.scale(Math.max(.08, Math.abs(turn)), 1); g2.globalAlpha = Math.min(1, q * 2.5); g2.shadowColor = R0.c; g2.shadowBlur = 26; g2.drawImage(icon, -sz / 2, -sz / 2, sz, sz); g2.restore(); } catch (e) { errLog(e); } }
      g2.save(); g2.translate(ox, oy); g2.scale(k, k);
      if (st.k === 'open') CrateFilm.title(g2, lt(R0.n), R0.c, u * 1.7 - .05, 118);
      if (S.capT > 0) { S.capT -= rdt; const a = Math.min(1, S.capT * 3) * Math.min(1, (1.4 - S.capT) * 5); g2.globalAlpha = Math.max(0, a); g2.font = 'italic 700 21px ' + FONT_D; g2.textAlign = 'center'; g2.fillStyle = S.col; g2.shadowColor = S.col; g2.shadowBlur = 16; g2.fillText(S.cap, 200, 640); }
      g2.restore();
      if (S.flash > 0) { g2.fillStyle = hexA(S.fc || '#ffffff', Math.min(1, S.flash) * .85); g2.fillRect(0, 0, W, H); }
      try { CineFX.front(g2, W, H, dpr, S, S.col, Math.max(0, S.lvl - 1), P.dur, lt(T0.n)); } catch (e) { errLog(e); }
      S.flash = Math.max(0, S.flash - rdt * 2.4);
    };
    const step = now => { if (end) return; try { frame(now); } catch (e) { errLog(e); D.dead = 1; return finish(); } if (S.t >= P.dur) return finish(); requestAnimationFrame(step); }; // (a failure ends the film, never the reward)
    sfx('coin'); requestAnimationFrame(step);
  }
};
{
  // the duel where it can run, the seals film elsewhere; a failure in the duel never costs the reward
  const run0 = Seals.run.bind(Seals);
  Seals.run = function (res, done) {
    let ok = false; try { ok = Duel3D.ok() && Duel3D.init(); } catch (e) { errLog(e); }
    if (!ok) return run0(res, done);
    let fin = false; const d1 = () => { if (fin) return; fin = true; done(); };
    try { return Duel3D.run(res, d1); } catch (e) { errLog(e); Duel3D.dead = 1; document.querySelectorAll('.cr-film').forEach(x => x.remove()); return fin ? undefined : run0(res, done); }
  };
  const mt = Mini.mount.bind(Mini); Mini.mount = function () { const r = mt.apply(this, arguments); try { if (r && !CALM) Models.load('melee'); } catch (e) { errLog(e); } return r; }; // (the sword moves are ready before the first crate)
}
