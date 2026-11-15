/* =====================================================================
   R3 — THE 3D VIEW ON THREE.JS (version 39). Render only: it reads the
   simulation and never writes to it, so replays and leaderboards are
   untouched.
   · the camera is the game's own 3D camera (GL3D.cam / th / yaw), built as
     an orthographic three.js camera that projects every point to exactly
     the same pixel as W3D.proj: the 2D layer (rings, numbers, aim lines,
     bullets, effects) stays glued to the 3D world
   · a lit night scene: a moon with soft shadows, a sky light, the hero's
     neon light, boss and kill lights, physically based materials with
     reflections, ACES tone mapping and bloom on everything that glows
   · the train: a plated roof with seams, vents, puddles and neon rails,
     the cars before and after, the track far below, a city of lit towers
     streaming past, signs, rain
   · models built in code for this game: an animated ninja (run, dash,
     the blade follows every swing, scarf), every enemy family, bosses
     (serpents get their whole body), breakable parts, pets, echo clones,
     arena props, and debris when something is cut down
   Falls back to the old 3D layer if three.js cannot start.
   ===================================================================== */
const R3 = {
  ok: false, failed: false, on: false, cv: null, rn: null, scene: null, root: null, cam: null, comp: null, bloom: null,
  M: {}, ents: new Map(), deb: [], t: 0, q: -1, theme: '', flashes: [],
  want() { return typeof THREE !== 'undefined' && !this.failed && !(Store.data && Store.data.settings.r3 === 0); },
  /* ---------------- setup ---------------- */
  init() {
    if (this.ok || this.failed) return this.ok;
    try {
      const T = THREE, c = document.createElement('canvas'); c.id = 'r3cv'; c.setAttribute('aria-hidden', 'true');
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none';
      cv.parentNode.insertBefore(c, cv); this.cv = c;
      const rn = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: false, powerPreference: 'high-performance' });
      rn.outputColorSpace = T.SRGBColorSpace; rn.toneMapping = T.ACESFilmicToneMapping; rn.toneMappingExposure = 1;
      rn.shadowMap.enabled = true; rn.shadowMap.type = T.PCFSoftShadowMap; this.rn = rn;
      const sc = new T.Scene(); this.scene = sc; sc.fog = new T.Fog(0x0b1030, 3500, 6200);
      const root = new T.Group(); root.scale.y = -1; sc.add(root); this.root = root; // game coordinates: x right, y down the roof, z up
      this.cam = new T.OrthographicCamera(-1, 1, 1, -1, 1, 7000);
      try { const pm = new T.PMREMGenerator(rn); sc.environment = pm.fromScene(this.envScene(), .02).texture; pm.dispose(); } catch (e) { errLog(e); }
      // light
      this.hemi = new T.HemisphereLight(0x7d8cff, 0x1a0a24, .45); this.hemi.position.set(0, 0, 1); sc.add(this.hemi);
      const moon = new T.DirectionalLight(0xc8d6ff, 1.1); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -.0006; moon.shadow.normalBias = .6;
      const sc2 = moon.shadow.camera; sc2.left = -520; sc2.right = 520; sc2.top = 620; sc2.bottom = -620; sc2.near = 10; sc2.far = 2600;
      sc.add(moon); sc.add(moon.target); this.moon = moon; // (lights live outside the mirrored root: their y is flipped by hand)
      const rim = new T.DirectionalLight(0xff4fd8, .9); rim.position.set(300, 900, 500); sc.add(rim); sc.add(rim.target); this.rim = rim;
      this.heroL = new T.PointLight(0x00f2fe, 300, 200, 1.6); sc.add(this.heroL);
      this.bossL = new T.PointLight(0xff0844, 0, 420, 1.4); sc.add(this.bossL);
      this.fl = [0, 1].map(() => { const l = new T.PointLight(0xffffff, 0, 200, 1.6); sc.add(l); return l; });
      // post
      this.comp = new T.EffectComposer(rn); this.comp.addPass(new T.RenderPass(sc, this.cam));
      this.bloom = new T.UnrealBloomPass(new T.Vector2(512, 512), .45, .35, .92); this.comp.addPass(this.bloom); this.comp.addPass(new T.OutputPass());
      this.mats(); this.world();
      this.ok = true;
    } catch (e) { errLog(e); this.failed = true; try { if (this.cv) this.cv.remove(); } catch (er) { } }
    return this.ok;
  },
  show(use) { this.on = !!use && this.ok; if (this.cv) this.cv.style.display = this.on ? 'block' : 'none'; if (GL3D.cv) GL3D.cv.style.display = W3D.live && !this.on ? 'block' : 'none'; },
  quality() { // 0 low (no shadows, no bloom), 1 bloom, 2 bloom + shadows, 3 ultra
    const s = Store.data.settings, m = s.fx; let q = m === 'low' ? 0 : m === 'ultra' ? 3 : m === 'high' ? 2 : Q.lvl >= 2 ? (PC.isPC ? 2 : 1) : Q.lvl;
    if (q !== this.q) { this.q = q; this.rn.shadowMap.enabled = q >= 2; this.moon.castShadow = q >= 2; this.moon.shadow.mapSize.set(q >= 3 ? 2048 : 1024, q >= 3 ? 2048 : 1024); if (this.moon.shadow.map) { this.moon.shadow.map.dispose(); this.moon.shadow.map = null; }
      this.scene.traverse(o => { if (o.material) { const a = Array.isArray(o.material) ? o.material : [o.material]; for (const mm of a) mm.needsUpdate = true; } }); }
    return q;
  },
  envScene() {
    const T = THREE, s = new T.Scene(), sky = new T.Mesh(new T.SphereGeometry(100, 32, 16), new T.MeshBasicMaterial({ side: T.BackSide, map: this.tex(4, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a0f3a'); g.addColorStop(.45, '#0a1030'); g.addColorStop(.55, '#05060c'); g.addColorStop(1, '#020205'); x.fillStyle = g; x.fillRect(0, 0, w, h); }) }));
    s.add(sky); const cols = [0xff2bd6, 0x00f2fe, 0xffd23f, 0x4d7cff, 0xff0844];
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, m = new T.Mesh(new T.PlaneGeometry(10 + (i % 3) * 6, 3 + (i % 2) * 4), new T.MeshBasicMaterial({ color: new T.Color(cols[i % 5]).multiplyScalar(.9), side: T.DoubleSide })); m.position.set(Math.cos(a) * 60, 6 + (i % 4) * 9, Math.sin(a) * 60); m.lookAt(0, 0, 0); s.add(m); }
    const moon = new T.Mesh(new T.CircleGeometry(6, 24), new T.MeshBasicMaterial({ color: 0xdfe8ff })); moon.position.set(-30, 60, -50); moon.lookAt(0, 0, 0); s.add(moon);
    return s;
  },
  /* ---------------- materials and textures ---------------- */
  tex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; },
  std(o) { return new THREE.MeshStandardMaterial(Object.assign({ color: 0x222233, metalness: .5, roughness: .45, envMapIntensity: .8 }, o)); },
  glow(col, k) { return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(col), emissiveIntensity: (k == null ? 2.2 : k) * .55, metalness: 0, roughness: 1 }); },
  mats() {
    const M = this.M;
    M.armor = this.std({ color: 0x343a55, metalness: .7, roughness: .3 });
    M.armor2 = this.std({ color: 0x4a5272, metalness: .65, roughness: .35 });
    M.cloth = this.std({ color: 0x1c2032, metalness: .1, roughness: .75 });
    M.metal = this.std({ color: 0x5a6378, metalness: .9, roughness: .28 });
    M.dark = this.std({ color: 0x07080f, metalness: .4, roughness: .6 });
    M.gold = this.std({ color: 0xffc23d, metalness: 1, roughness: .22, emissive: 0x442800, emissiveIntensity: .5 });
    M.wood = this.std({ color: 0x6a4a2a, metalness: 0, roughness: .85 });
    M.mirror = this.std({ color: 0xdfefff, metalness: 1, roughness: .04, envMapIntensity: 1.6 });
    M.white = this.glow('#ffffff', 3); M.blade = this.glow('#bff8ff', 3.2);
    M.bigeom = {};
  },
  pool(col, size, op) { // a soft pool of neon light on the roof under a character
    if (!this.radT) this.radT = this.tex(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const m = new THREE.Mesh(this.poolG || (this.poolG = new THREE.PlaneGeometry(1, 1)), new THREE.MeshBasicMaterial({ map: this.radT, color: new THREE.Color(col), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.scale.set(size, size, 1); m.position.z = .6; m.renderOrder = 2; return m;
  },
  colMat(key, col, kind) { // cached per color
    const k = kind + col; let m = this.M[k]; if (m) return m;
    if (kind === 'g') m = this.glow(col, 2.4); else if (kind === 'b') m = this.std({ color: new THREE.Color(col).multiplyScalar(.55), metalness: .55, roughness: .35, emissive: new THREE.Color(col), emissiveIntensity: .18 });
    else m = this.std({ color: new THREE.Color(col), metalness: .3, roughness: .5 });
    return (this.M[k] = m);
  },
  /* ---------------- the world ---------------- */
  world() {
    const T = THREE, g = new T.Group(); this.root.add(g); this.W = g;
    // roof texture: steel plates, seams, rivets, vents, hazard stripes, puddles (rough/smooth)
    this.roofTex = this.tex(512, 1024, (x, w, h) => {
      x.fillStyle = '#2c3350'; x.fillRect(0, 0, w, h);
      for (let py = 0; py < h; py += 128) for (let px = 0; px < w; px += 128) { const v = 52 + ((px * 7 + py * 13) % 19); x.fillStyle = `rgb(${v},${v + 8},${v + 30})`; x.fillRect(px + 2, py + 2, 124, 124); }
      x.strokeStyle = 'rgba(0,0,0,.65)'; x.lineWidth = 4; for (let py = 0; py <= h; py += 128) { x.beginPath(); x.moveTo(0, py); x.lineTo(w, py); x.stroke(); } for (let px = 0; px <= w; px += 128) { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, h); x.stroke(); }
      x.fillStyle = 'rgba(160,180,220,.35)'; for (let py = 8; py < h; py += 128) for (let px = 8; px < w; px += 128) for (const [ox, oy] of [[0, 0], [110, 0], [0, 110], [110, 110]]) { x.beginPath(); x.arc(px + ox, py + oy, 2.5, 0, 6.3); x.fill(); }
      for (const [vx, vy] of [[160, 300], [300, 700], [60, 900]]) { x.fillStyle = '#0a0c14'; x.fillRect(vx, vy, 80, 44); x.fillStyle = '#2c3348'; for (let k = 0; k < 6; k++) x.fillRect(vx + 6, vy + 5 + k * 6.5, 68, 2.5); }
    }, true);
    this.roofRough = (() => { const t = this.tex(256, 512, (x, w, h) => { x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { const px = (i * 97) % w, py = (i * 173) % h, r = 18 + (i * 31) % 40; const gr = x.createRadialGradient(px, py, 2, px, py, r); gr.addColorStop(0, '#101010'); gr.addColorStop(1, 'rgba(154,154,154,0)'); x.fillStyle = gr; x.fillRect(px - r, py - r, r * 2, r * 2); } }, true); t.colorSpace = THREE.NoColorSpace; return t; })();
    this.roofMat = this.std({ map: this.roofTex, roughnessMap: this.roofRough, metalness: .35, roughness: .8, color: 0xffffff, envMapIntensity: 1.2 });
    // cars: the one you stand on and its neighbours
    this.cars = [];
    for (let i = -1; i <= 1; i++) {
      const car = new T.Group(); g.add(car);
      const roof = new T.Mesh(new T.BoxGeometry(1, 1, 40), this.roofMat); roof.position.z = -20; roof.receiveShadow = true; car.add(roof); car.roof = roof;
      const side = this.std({ color: 0x141826, metalness: .7, roughness: .35 }); const body = new T.Mesh(new T.BoxGeometry(1, 1, 140), side); body.position.z = -110; car.add(body); car.body = body;
      const winMat = this.glow('#ffd36e', 1.4); car.win = []; for (const s of [-1, 1]) { const w = new T.Mesh(new T.BoxGeometry(2, 1, 22), winMat); w.position.z = -70; car.add(w); car.win.push([w, s]); }
      car.rails = []; for (const s of [-1, 1]) { const r = new T.Mesh(new T.CylinderGeometry(1.7, 1.7, 1, 10), this.glow('#00f2fe', 2.2)); r.rotation.x = Math.PI / 2; r.position.z = 3; car.add(r); car.rails.push([r, s]);
        const post = new T.Mesh(new T.BoxGeometry(6, 1, 6), M3(this, 'metal')); post.position.z = -1; car.add(post); car.rails.push([post, s * 1.0001]); }
      this.cars.push(car);
    }
    // far below: the streets of Neo Edo, with traffic streaking along them
    this.streetTex = this.tex(256, 512, (x, w, h) => { x.fillStyle = '#06070d'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#0d1020'; for (let yy = 0; yy < h; yy += 128) x.fillRect(0, yy, w, 18); for (let xx = 0; xx < w; xx += 128) x.fillRect(xx, 0, 18, h);
      for (let yy = 0; yy < h; yy += 128) for (let xx = 0; xx < w; xx += 16) { x.fillStyle = (xx / 16) % 3 ? 'rgba(255,190,90,.55)' : 'rgba(120,200,255,.5)'; x.fillRect(xx, yy + 8, 2, 2); }
      for (let k = 0; k < 26; k++) { const xx = (k * 53) % w, yy = (k * 97) % h, red = k % 2; x.fillStyle = red ? 'rgba(255,40,80,.9)' : 'rgba(255,240,200,.9)'; if (k % 3) x.fillRect((xx >> 7 << 7) + 4 + red * 8, yy, 2, 14); else x.fillRect(xx, (yy >> 7 << 7) + 4 + red * 8, 14, 2); } }, true);
    const ground = new T.Mesh(new T.PlaneGeometry(6000, 9000), new T.MeshStandardMaterial({ color: 0x0a0c16, emissive: 0xffffff, emissiveMap: this.streetTex, emissiveIntensity: .9, map: this.streetTex, roughness: .9, metalness: 0 }));
    ground.position.z = -420; g.add(ground); this.ground = ground; this.streetTex.repeat.set(6000 / 256 / 1.2, 9000 / 512 / 1.2);
    this.trackRails = []; for (const s of [-1, 1]) { const r = new T.Mesh(new T.BoxGeometry(2.5, 9000, 2), this.glow('#00f2fe', 1.6)); g.add(r); this.trackRails.push([r, s]); }
    // the elevated guideway under the train and the pylons that carry it
    const gw = new T.Mesh(new T.BoxGeometry(1, 9000, 30), this.std({ color: 0x1a1e2e, metalness: .6, roughness: .5 })); g.add(gw); this.guide = gw;
    this.pylons = new T.InstancedMesh(new T.BoxGeometry(46, 30, 1), this.std({ color: 0x151827, metalness: .5, roughness: .6 }), 12); this.pylons.frustumCulled = false; g.add(this.pylons);
    // the city: towers that rise to just under the train, windows at true scale, roofs with beacons
    const winTex = this.tex(128, 128, (x, w, h) => { x.fillStyle = '#070811'; x.fillRect(0, 0, w, h); x.fillStyle = '#0b0e1a'; for (let yy = 0; yy < h; yy += 32) x.fillRect(0, yy, w, 3); for (let yy = 8; yy < h; yy += 32) for (let xx = 6; xx < w; xx += 14) { const r = Math.abs(Math.sin(xx * 12.9898 + yy * 78.233) * 43758.5453 % 1); if (r > .62) { x.fillStyle = r > .95 ? '#7dfff0' : r > .9 ? '#ff7ad9' : '#e0b060'; x.globalAlpha = .55 + (r - .62); x.fillRect(xx, yy, 8, 14); x.globalAlpha = 1; } } }, true);
    const side = new T.MeshStandardMaterial({ color: 0x0d1020, metalness: .5, roughness: .55, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: .55, map: winTex });
    const top = new T.MeshStandardMaterial({ color: 0x141828, metalness: .4, roughness: .7 });
    const V0 = [[120, 110, 260], [90, 150, 180], [160, 120, 330], [110, 90, 140], [140, 140, 230], [80, 80, 300]];
    this.cityV = V0.map(([w, d, h]) => { const geo = new T.BoxGeometry(w, d, h), uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, h], [w, h], [w, d], [w, d]];
      for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const k = f * 4 + v; uv.setXY(k, uv.getX(k) * dims[f][0] / 64, uv.getY(k) * dims[f][1] / 64); }
      const im = new T.InstancedMesh(geo, [side, side, side, side, top, top], 14); im.frustumCulled = false; g.add(im); return { im, w, d, h, n: 14 }; });
    this.cityD = []; let ci = 0; for (const cvv of this.cityV) for (let i = 0; i < cvv.n; i++, ci++) { const r = n => Math.abs(Math.sin(ci * 91.7 + n * 13.3) * 4375.85 % 1); this.cityD.push({ v: cvv, i, side: ci % 2 ? 1 : -1, off: 40 + r(1) * 900, y: r(2) * 6200, top: -60 - r(3) * 160 }); }
    this.beacons = new T.InstancedMesh(new T.SphereGeometry(3, 8, 6), this.glow('#ff2244', 3), this.cityD.length); this.beacons.frustumCulled = false; g.add(this.beacons);
    // neon signs on tower faces
    this.signs = []; const sc = ['#ff2bd6', '#00f2fe', '#ffd23f', '#ff0844', '#00ff88'];
    for (let i = 0; i < 16; i++) { const m = new T.Mesh(new T.BoxGeometry(70, 4, 22), this.glow(sc[i % 5], 2.6)); g.add(m); this.signs.push({ m, i: i * 5 + 2 }); }
    // rain
    const rn = 520, pos = new Float32Array(rn * 6); this.rainG = new T.BufferGeometry(); this.rainG.setAttribute('position', new T.BufferAttribute(pos, 3));
    this.rain = new T.LineSegments(this.rainG, new T.LineBasicMaterial({ color: 0x9fb8ff, transparent: true, opacity: .22 })); this.rain.frustumCulled = false; g.add(this.rain);
    this.drops = []; for (let i = 0; i < rn; i++) this.drops.push([Math.random(), Math.random(), Math.random() * 500]);
    // the moon (a glowing disc far away, seen through the fog-free sky behind the cars)
    this.skyTex = null;
  },
  themeSet(T0) {
    const k = BG.theme || 'maglev'; if (k === this.theme) return; this.theme = k;
    const sky1 = new THREE.Color(T0.sky1 || '#0b1030'), sky2 = new THREE.Color(T0.sky2 || '#22093a');
    this.skyTex = this.tex(4, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#' + sky2.getHexString()); gr.addColorStop(.7, '#' + sky1.getHexString()); gr.addColorStop(1, '#03040a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
    this.scene.background = this.skyTex; this.scene.fog.color.copy(sky1).multiplyScalar(.8);
    const rail = new THREE.Color(T0.rail || '#00f2fe');
    for (const car of this.cars) for (const [r, s] of car.rails) if (r.material.emissive) r.material.emissive.copy(rail);
    for (const [r] of this.trackRails) r.material.emissive.copy(rail);
    this.hemi.color.copy(sky2).lerp(new THREE.Color('#8090ff'), .6); this.hemi.groundColor.copy(sky1).multiplyScalar(.6);
    for (const car of this.cars) for (const [w] of car.win) w.material.emissive.set(T0.win || '#ffd36e');
  },
  layout(rd) { // place the world around the current arena and the camera
    const L = V.L, R = V.R, AW = R - L, CX = (L + R) / 2, Th = BG.T || {}, sp = (Th.speed || 400) * (G.state === 'PLAY' ? 1 : .3);
    this.scroll = (this.scroll || 0) + rd * sp;
    const carLen = V.VH + 120, gap = 46;
    this.cars.forEach((car, i) => { const k = i - 1, y0 = k * (carLen + gap) + V.VH / 2;
      car.position.set(CX, y0, 0); car.roof.scale.set(AW + 30, carLen, 1); car.body.scale.set(AW + 22, carLen - 10, 1);
      this.roofTex.repeat.set((AW + 30) / 256, carLen / 512);
      for (const [w, s] of car.win) { w.position.x = s * (AW / 2 + 12); w.scale.y = carLen - 60; }
      for (const [r, s] of car.rails) { r.position.x = Math.sign(s) * (AW / 2 + 1); if (r.geometry.type === 'CylinderGeometry') r.scale.y = carLen - 4; else { r.scale.y = carLen - 4; } } });
    this.ground.position.set(CX, V.VH / 2, -420); this.streetTex.offset.y = (this.scroll * .55 / 512 / 1.2) % 1;
    for (const [r, s] of this.trackRails) r.position.set(CX + s * (AW / 2 - 30), V.VH / 2, -232);
    this.guide.scale.x = AW - 40; this.guide.position.set(CX, V.VH / 2, -215);
    const m4 = new THREE.Matrix4(), span = 6200, pyS = 520;
    for (let i = 0; i < 12; i++) { const y = ((i * pyS + this.scroll) % (12 * pyS)) - 2600; m4.makeScale(1, 1, 190); m4.setPosition(CX, y, -230 - 95); this.pylons.setMatrixAt(i, m4); } this.pylons.instanceMatrix.needsUpdate = true;
    this.cityD.forEach((d, k) => { const y = ((d.y + this.scroll * .55) % span + span) % span - 2400, half = d.v.w / 2, x = d.side < 0 ? L - 60 - d.off - half : R + 60 + d.off + half;
      m4.makeTranslation(x, y, d.top - d.v.h / 2); d.v.im.setMatrixAt(d.i, m4); d.cx = x; d.cy = y; m4.makeTranslation(x + half * .5, y, d.top + 3); this.beacons.setMatrixAt(k, m4); });
    for (const cvv of this.cityV) cvv.im.instanceMatrix.needsUpdate = true; this.beacons.instanceMatrix.needsUpdate = true;
    for (const s of this.signs) { const d = this.cityD[s.i % this.cityD.length]; s.m.position.set(d.cx, d.cy + d.v.d / 2 + 2, d.top - 30); }
    // rain around the camera
    const T0 = BG.T || {}; this.rain.visible = !!T0.rain && Q.rain > 0 && !CALM;
    if (this.rain.visible) { const P0 = this.rainG.attributes.position.array, C = GL3D.cam, w = V.VW / C.z * 1.4, h = V.VH / C.z * 1.6;
      for (let i = 0; i < this.drops.length; i++) { const d = this.drops[i]; d[2] -= 900 * rd; if (d[2] < 0) { d[2] = 420 + Math.random() * 80; d[0] = Math.random(); d[1] = Math.random(); }
        const x = C.x + (d[0] - .5) * w, y = C.y + (d[1] - .55) * h, o = i * 6; P0[o] = x; P0[o + 1] = y; P0[o + 2] = d[2]; P0[o + 3] = x - 3; P0[o + 4] = y + 2; P0[o + 5] = d[2] + 22; }
      this.rainG.attributes.position.needsUpdate = true; }
  },
  /* ---------------- the camera: the same pixels as W3D.proj ---------------- */
  syncCam() {
    const C = GL3D.cam, th = GL3D.th, yaw = GL3D.yaw, K = Math.cos(th), S = Math.sin(th), cy = Math.cos(yaw), sy = Math.sin(yaw), cz = C.z;
    const k = V.s * V.dpr, W = cv.width / k, H = cv.height / k, lb = W3D.lb(), ctrX = V.VW / 2 + lb[0] / V.s, ctrY = V.VH / 2 + lb[1] / V.s, oy = C.offY || 0;
    // three.js space is the game space with y flipped (the root group); the basis below is written in three.js coordinates
    const Rt = new THREE.Vector3(cy, sy, 0), Up = new THREE.Vector3(-K * sy, K * cy, S), Bk = new THREE.Vector3(S * sy, -S * cy, K);
    const tgt = new THREE.Vector3(C.x, -C.y, 0), cam = this.cam;
    cam.position.copy(tgt).addScaledVector(Bk, 3000);
    const m = new THREE.Matrix4().makeBasis(Rt, Up, Bk); cam.quaternion.setFromRotationMatrix(m);
    cam.left = -ctrX / cz; cam.right = (W - ctrX) / cz; cam.top = (ctrY + oy) / cz; cam.bottom = (ctrY + oy - H) / cz; cam.near = 100; cam.far = 7000;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    // the moon's shadow camera follows the view
    this.moon.position.set(C.x - 420, -(C.y + 620), 1100); this.moon.target.position.set(C.x, -C.y, 0); this.moon.target.updateMatrixWorld(); this.rim.position.set(C.x + 300, -(C.y - 900), 500); this.rim.target.position.set(C.x, -C.y, 0); this.rim.target.updateMatrixWorld();
  },
  /* ---------------- models ---------------- */
  part(geo, mat, x, y, z, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; (parent || null) && parent.add(m); return m; },
  zUp(g) { g.rotateX(Math.PI / 2); return g; }, // three.js shapes stand along y; ours stand along z
  hero(col, col2, ghost) {
    const T = THREE, g = new T.Group(), P0 = this.part.bind(this), zU = this.zUp;
    const bodyM = ghost ? this.ghostMat(col) : this.M.armor, trim = ghost ? this.ghostMat(col) : this.glow(col, 2.4), cloth = ghost ? this.ghostMat(col) : this.M.cloth;
    const hips = new T.Group(); hips.position.z = 13; g.add(hips); g.hips = hips;
    g.legs = []; for (const s of [-1, 1]) { const hip = new T.Group(); hip.position.set(0, s * 3.2, 0); hips.add(hip);
      P0(zU(new T.CylinderGeometry(2, 1.7, 7, 8)), cloth, 0, 0, -3.5, hip); const knee = new T.Group(); knee.position.z = -7; hip.add(knee);
      P0(zU(new T.CylinderGeometry(1.7, 1.5, 6, 8)), bodyM, 0, 0, -3, knee); P0(new T.BoxGeometry(5, 3, 2.2), this.M.armor2, 1, 0, -6.4, knee); g.legs.push([hip, knee, s]); }
    const torso = new T.Group(); torso.position.z = 13; g.add(torso); g.torso = torso;
    P0(zU(new T.CapsuleGeometry(4.6, 6, 4, 12)), bodyM, 0, 0, 7, torso);
    const plate = ghost ? bodyM : this.std({ color: new T.Color(col2).multiplyScalar(.5), metalness: .7, roughness: .3, emissive: new T.Color(col2), emissiveIntensity: .12 }); g.plate = plate;
    P0(new T.BoxGeometry(5.4, 7.4, 6), plate, 1.2, 0, 8, torso);
    P0(new T.BoxGeometry(.8, 5.8, 1.2), trim, 4.1, 0, 9.5, torso); P0(new T.BoxGeometry(.8, 5.8, 1.2), trim, 4.1, 0, 6.5, torso);
    const head = new T.Group(); head.position.z = 17; torso.add(head); g.head = head;
    P0(new T.SphereGeometry(4.2, 18, 14), bodyM, 0, 0, 0, head); const visor = P0(new T.BoxGeometry(2.4, 6.4, 1.9), ghost ? trim : this.glow(col, 4.5), 3.3, 0, .7, head); g.visor = visor;
    P0(new T.ConeGeometry(1.2, 4, 6), bodyM, -.5, 2.6, 3.6, head).rotation.x = -.6;
    // scarf: a chain of segments that trails and waves
    g.scarf = []; let prev = torso; for (let i = 0; i < 6; i++) { const s = new T.Group(); s.position.set(i ? -3.2 : -3, 0, i ? 0 : 13); prev.add(s); P0(new T.BoxGeometry(3.4, 2.6 - i * .2, .9), ghost ? cloth : this.glow(col2, .6), -1.7, 0, 0, s); g.scarf.push(s); prev = s; }
    // arms; the right hand holds the blade group
    g.arms = []; for (const s of [-1, 1]) { const sh = new T.Group(); sh.position.set(0, s * 5.6, 11); torso.add(sh); P0(new T.SphereGeometry(2.3, 10, 8), this.M.armor2, 0, 0, 0, sh);
      P0(new T.CylinderGeometry(1.4, 1.2, 7, 8), bodyM, 0, 0, 0, sh).geometry.rotateZ(Math.PI / 2).translate(3.5, 0, 0); g.arms.push(sh); }
    const blade = new T.Group(); g.arms[1].add(blade); blade.position.set(7, 0, 0); g.blade = blade;
    P0(new T.CylinderGeometry(.9, .9, 5, 8), this.M.dark, -1, 0, 0, blade).geometry.rotateZ(Math.PI / 2);
    P0(new T.BoxGeometry(1.2, 5, 1.6), this.M.gold, 1.6, 0, 0, blade);
    const bm = ghost ? this.ghostMat(col) : this.glow(col, 3.4); g.bladeMat = bm; const bl = P0(new T.BoxGeometry(30, .9, 2.4), bm, 17, 0, 0, blade); g.bladeMesh = bl;
    P0(new T.ConeGeometry(1.2, 4, 4), bm, 34, 0, 0, blade).geometry.rotateZ(-Math.PI / 2);
    if (!ghost) { g.pool = this.pool(col, 46, .38); g.add(g.pool); }
    g.trim = trim; g.scale.setScalar(1.45); g.s0 = 1.45; return g;
  },
  ghostMat(col) { return new THREE.MeshBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: .45, depthWrite: false }); },
  animHero(g, o, rd, t) {
    g.position.set(o.x, o.y, 0); g.rotation.z = o.face;
    const sp = clamp((o.spd || 0) / 420, 0, 1), dash = !!o.dashing, ph = o.ph || t * 10, swing = Math.sin(ph);
    for (const [hip, knee, s] of g.legs) { const k = dash ? .9 : swing * s * .9 * sp; hip.rotation.y = -k; knee.rotation.y = Math.max(0, -k) * .9 + (dash ? .6 : 0); }
    g.torso.rotation.y = dash ? .5 : sp * .18; g.hips.position.z = 13 + (dash ? -2 : Math.abs(swing) * sp * 1.2) + Math.sin(t * 3) * (1 - sp) * .25; g.torso.position.z = g.hips.position.z;
    const rel = angDiff(o.blade, o.face); // the blade points where the 2D swing says
    g.arms[1].rotation.z = rel; g.arms[1].rotation.y = dash ? -.15 : -.35; g.arms[0].rotation.y = dash ? .9 : swing * .5 * sp; g.arms[0].rotation.z = -.4;
    for (let i = 0; i < g.scarf.length; i++) { const s = g.scarf[i]; s.rotation.z = Math.sin(t * 7 - i * .8) * (.15 + sp * .25); s.rotation.y = (dash ? -.12 : .1) + Math.sin(t * 5 + i) * .05; }
    if (g.bladeMesh) g.bladeMesh.scale.x = clamp((o.bl || 52) / 52, .6, 2.2);
    if (g.pool) g.pool.material.opacity = (o.dashing ? .55 : .38) + Math.sin(t * 4) * .04;
    g.visible = (o.alpha == null || o.alpha > .5);
  },
  /* enemies: one family per look; size 1 = the enemy's radius */
  enemyModel(e) {
    const T = THREE, g = new T.Group(), P0 = this.part.bind(this), zU = this.zUp, col = e.col || '#ff3b5c', body = this.colMat('', col, 'b').clone(), glow = this.glow(col, 2.6), t = e.type, E = ET;
    g.bodyMat = body; g.anim = []; const legs = (n, len, z) => { for (let i = 0; i < n; i++) { const a = i / n * TAU + .3, L = new T.Group(); L.rotation.z = a; L.position.z = z; g.add(L); const th = P0(zU(new T.CylinderGeometry(.06, .05, len, 5)), this.M.metal, len * .45, 0, .15, L); th.rotation.y = 1.1; const sh = P0(zU(new T.CylinderGeometry(.05, .03, len, 5)), this.M.metal, len * .95, 0, -.25, L); sh.rotation.y = -.5; g.anim.push(['leg', L, a, i]); } };
    if (t === E.DRONE || t === E.MINI || t === E.SPIDER) {
      P0(new T.OctahedronGeometry(.85, 0), body, 0, 0, .75, g).scale.set(1.1, 1, .6); P0(new T.SphereGeometry(.32, 12, 10), glow, .62, 0, .8, g); legs(t === E.SPIDER ? 8 : 6, .9, .7);
    } else if (t === E.SNIPER) {
      for (let i = 0; i < 3; i++) { const L = P0(zU(new T.CylinderGeometry(.07, .07, 1.1, 5)), this.M.metal, 0, 0, .45, g); L.rotation.set(0, .5, i * TAU / 3); L.position.set(Math.cos(i * TAU / 3) * .35, Math.sin(i * TAU / 3) * .35, .45); }
      P0(new T.ConeGeometry(.75, 1.1, 3), body, 0, 0, 1.25, g).rotation.x = Math.PI / 2;
      P0(new T.CylinderGeometry(.12, .12, 2.4, 8), this.M.dark, 1.2, 0, 1.25, g).rotation.z = Math.PI / 2; P0(new T.SphereGeometry(.22, 10, 8), glow, .2, 0, 1.6, g);
    } else if (t === E.BRUTE || t === E.ENFORCER) {
      P0(zU(new T.CylinderGeometry(.95, 1.05, 1.3, 6)), body, 0, 0, .9, g); P0(new T.BoxGeometry(.7, 2.3, .55), this.M.armor2, 0, 0, 1.55, g);
      P0(new T.SphereGeometry(.38, 12, 10), this.M.armor, .35, 0, 1.85, g); P0(new T.BoxGeometry(.14, .5, .14), glow, .7, 0, 1.9, g);
      const sh = P0(new T.TorusGeometry(1.35, .12, 8, 24, 1.8), glow, 0, 0, .9, g); sh.rotation.z = -.9; // the front shield
      for (const s of [-1, 1]) P0(new T.BoxGeometry(.5, .5, 1.1), this.M.armor, .3, s * 1.15, .7, g);
    } else if (t === E.BOMBER) {
      P0(new T.SphereGeometry(.9, 18, 14), body, 0, 0, .95, g); const core = P0(new T.SphereGeometry(.45, 12, 10), glow, .55, 0, 1.05, g); g.anim.push(['blink', core]);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, sp = P0(new T.ConeGeometry(.16, .5, 6), this.M.gold, Math.cos(a) * .9, Math.sin(a) * .9, .95, g); sp.rotation.set(0, 0, a - Math.PI / 2); sp.rotation.x = 0; sp.lookAt(Math.cos(a) * 9, Math.sin(a) * 9, .95); sp.rotateX(Math.PI / 2); }
    } else if (t === E.WEAVER || t === E.MEDIC) {
      const d = P0(new T.OctahedronGeometry(.85, 0), body, 0, 0, 1.6, g); g.anim.push(['spin', d]);
      if (t === E.MEDIC) { P0(new T.BoxGeometry(.25, 1.1, .25), this.glow('#00ff88', 3), 0, 0, 2.7, g); P0(new T.BoxGeometry(.25, .25, 1.1), this.glow('#00ff88', 3), 0, 0, 2.7, g); }
      else for (let i = 0; i < 3; i++) { const o = new T.Group(); o.position.z = 1.6; g.add(o); P0(new T.BoxGeometry(.28, .28, .28), this.M.white, 1.4, 0, 0, o); o.rotation.z = i * TAU / 3; g.anim.push(['orbit', o]); }
    } else if (t === E.PHANTOM || t === E.WRAITH || t === E.MIMIC) {
      const gm = new T.MeshStandardMaterial({ color: new T.Color(col), emissive: new T.Color(col), emissiveIntensity: .9, transparent: true, opacity: .62, roughness: .3, metalness: .2 }); g.bodyMat = gm;
      const b = P0(new T.ConeGeometry(.9, 2.2, t === E.MIMIC ? 4 : 3, 1), gm, 0, 0, 1.4, g); b.rotation.x = Math.PI; b.rotation.y = 0; g.anim.push(['float', b]);
      P0(new T.SphereGeometry(.18, 8, 8), M3(this, 'white'), .45, .22, 2.1, g); P0(new T.SphereGeometry(.18, 8, 8), M3(this, 'white'), .45, -.22, 2.1, g);
    } else if (t === E.SPLITTER) {
      for (const s of [-1, 1]) P0(new T.SphereGeometry(.68, 14, 12), body, 0, s * .45, .75, g); P0(new T.BoxGeometry(.12, .1, 1.2), glow, .5, 0, .8, g);
    } else if (t === E.WARDEN) {
      P0(zU(new T.CylinderGeometry(.9, 1, 1.4, 5)), body, 0, 0, .8, g); P0(zU(new T.CylinderGeometry(.06, .06, 1, 5)), this.M.metal, 0, 0, 1.9, g); P0(new T.SphereGeometry(.18, 8, 8), this.M.white, 0, 0, 2.45, g);
      const ring = P0(new T.TorusGeometry(1.45, .07, 6, 32), this.glow('#4d7cff', 2.6), 0, 0, .9, g); g.anim.push(['spin', ring]);
    } else if (t === E.COURIER) {
      P0(new T.CapsuleGeometry(.55, 1.2, 4, 10), body, 0, 0, .9, g).rotation.z = Math.PI / 2; P0(new T.BoxGeometry(.2, 1.6, .1), this.M.armor2, -.5, 0, 1.1, g); P0(new T.SphereGeometry(.3, 10, 8), glow, -1.1, 0, .9, g);
    } else if (t === E.TREASURE) {
      const c = P0(zU(new T.CylinderGeometry(1, 1, .3, 8)), this.M.gold, 0, 0, 1.4, g); c.rotation.x = Math.PI / 2; g.anim.push(['coin', c]);
    } else if (t === E.DUMMY) {
      P0(zU(new T.CylinderGeometry(.75, .85, 1.8, 14)), this.M.wood, 0, 0, .9, g); P0(new T.BoxGeometry(.25, 2.2, .25), this.M.wood, 0, 0, 1.4, g); P0(zU(new T.CylinderGeometry(.4, .4, .08, 16)), this.colMat('', '#c0102e', 'g'), .78, 0, 1.2, g).rotation.y = Math.PI / 2;
    } else if (t === E.MINER) {
      P0(new T.BoxGeometry(1.4, 1.3, .9), body, 0, 0, .6, g); const d = P0(new T.ConeGeometry(.45, 1.2, 10), this.M.metal, 1.1, 0, .6, g); d.rotation.z = -Math.PI / 2; g.anim.push(['drill', d]); P0(new T.SphereGeometry(.2, 8, 8), glow, .4, 0, 1.15, g);
    } else if (t === E.MIRROR) {
      P0(zU(new T.CylinderGeometry(.8, .9, 1.2, 8)), body, 0, 0, .6, g); const p = P0(new T.CylinderGeometry(1.2, 1.2, .12, 6), this.M.mirror, 0, 0, 1.6, g); p.rotation.z = Math.PI / 2; g.anim.push(['face', p]);
    } else if (t === E.CLONE) {
      const h = this.hero('#c45bff', '#00f2fe', false); h.scale.setScalar(1 / 14); g.add(h); g.heroCl = h;
    } else {
      P0(new T.SphereGeometry(.85, 16, 12), body, 0, 0, .9, g); P0(new T.SphereGeometry(.3, 10, 8), glow, .6, 0, 1, g);
    }
    // elite marks: a gold ring; THORNS: a crown of spikes
    if (e.elite) { P0(new T.TorusGeometry(1.25, .06, 6, 30), this.M.gold, 0, 0, .12, g); }
    if (e.aff === 5) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, s = P0(new T.ConeGeometry(.14, .55, 5), this.glow('#ff3b5c', 2), Math.cos(a) * 1.15, Math.sin(a) * 1.15, .9, g); s.lookAt(Math.cos(a) * 9, Math.sin(a) * 9, .9); s.rotateX(Math.PI / 2); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    const pl = this.pool(col, 3.2, .3); pl.castShadow = false; pl.position.z = .04; g.add(pl);
    return g;
  },
  /* enemy models are built once per look, merged into few draw calls, then cloned per enemy (shared geometry) */
  bake(g) {
    const keep = new Set((g.anim || []).map(a => a[1])), by = new Map();
    for (const c of [...g.children]) { if (!c.isMesh || keep.has(c) || c.material.blending === THREE.AdditiveBlending) continue; c.updateMatrix(); const geo = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); geo.applyMatrix4(c.matrix); if (!by.has(c.material)) by.set(c.material, []); by.get(c.material).push([c, geo]); }
    for (const [m, list] of by) { if (list.length < 2) continue; let merged = null; try { merged = THREE.mergeGeometries(list.map(x => x[1])); } catch (e) { merged = null; } if (!merged) continue;
      for (const [c] of list) { g.remove(c); c.geometry.dispose(); } const mm = new THREE.Mesh(merged, m); mm.castShadow = true; g.add(mm); }
  },
  enemyInst(e) {
    if (e.type === ET.CLONE) return this.enemyModel(e);
    const key = e.type + '|' + (e.col || '') + '|' + (e.elite ? 1 : 0) + '|' + (e.aff | 0); this.protos = this.protos || new Map(); let p = this.protos.get(key);
    if (!p) { p = this.enemyModel(e); this.bake(p); p.anim.forEach((a, i) => { a[1].name = 'a' + i; }); p.traverse(o => { if (o.geometry) o.geometry.userData.shared = 1; }); this.protos.set(key, p); }
    const g = p.clone(true), bm = p.bodyMat.clone(); g.traverse(o => { if (o.material === p.bodyMat) o.material = bm; }); g.bodyMat = bm;
    g.anim = p.anim.map((a, i) => { const o = g.getObjectByName('a' + i); if (a[0] === 'blink' && o) o.material = o.material.clone(); return [a[0], o, a[2], a[3]]; });
    return g;
  },
  animEnemy(g, e, t) {
    const s = (e.r || 14) * (e.scale == null ? 1 : e.scale), lift = W3D.inLift(e);
    g.position.set(e.x, e.y, lift); g.scale.setScalar(Math.max(.01, s)); g.rotation.z = e.ang != null && e.type !== ET.BRUTE ? e.ang : Math.atan2(P.y - e.y, P.x - e.x);
    const fl = e.fl > .3, mat = g.bodyMat; if (mat && mat.emissive) { if (fl) { mat.emissive.setRGB(1, 1, 1); mat.emissiveIntensity = 1.6; } else { mat.emissive.set(e.al > 0 ? '#00f2fe' : (e.col || '#ff3b5c')); mat.emissiveIntensity = mat.transparent ? .9 : .18; } }
    const vis = e.vis == null ? 1 : e.vis; g.visible = vis > .05; if (mat && mat.transparent) mat.opacity = .62 * vis;
    for (const a of g.anim) { const k = a[0], o = a[1];
      if (k === 'leg') o.rotation.y = Math.sin(t * 14 + a[3] * 1.7) * .25;
      else if (k === 'spin') o.rotation.z = t * 1.6; else if (k === 'orbit') o.rotation.z += .05; else if (k === 'coin') o.rotation.z = t * 3;
      else if (k === 'float') o.position.z = 1.4 + Math.sin(t * 3 + (e.uid | 0)) * .15; else if (k === 'drill') o.rotation.x = t * 20;
      else if (k === 'blink') o.material.emissiveIntensity = e.fuse > 0 && ((e.fuse * 14) | 0) % 2 ? 6 : 2.2; else if (k === 'face') o.rotation.y = 0; }
    if (g.heroCl) this.animHero(g.heroCl, { x: 0, y: 0, face: 0, spd: Math.hypot(e.vx || 0, e.vy || 0), ph: t * 12, dashing: false, blade: .8, bl: 52, alpha: 1 }, 0, t);
    if (g.heroCl) { g.heroCl.position.set(0, 0, 0); g.heroCl.rotation.z = 0; }
  },
  bossKind(id) { return { kage: 'ronin', renull: 'ronin', izanami: 'ronin', hydra: 'ship', valkyrie: 'ship', tenkai: 'ship', raijin: 'core', chimera: 'core', genesis: 'mech', prime: 'mech' }[id] || 'mech'; },
  bossModel(b) {
    const T = THREE, g = new T.Group(), P0 = this.part.bind(this), zU = this.zUp, col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844', body = this.colMat('', col, 'b').clone(), glow = this.glow(col, 2.8), kind = this.bossKind(b.id);
    g.bodyMat = body; g.kind = kind; g.anim = [];
    if (Array.isArray(b.seg)) { g.serpent = true; const hm = P0(new T.SphereGeometry(1, 24, 18), body, 0, 0, 1, g); hm.scale.set(1.35, 1, .85);
      P0(new T.ConeGeometry(.5, 1.2, 4), this.M.armor2, 1.3, 0, .85, g).rotation.z = -Math.PI / 2;
      for (const s of [-1, 1]) { P0(new T.SphereGeometry(.2, 10, 8), glow, .95, s * .42, 1.3, g); const h = P0(new T.ConeGeometry(.16, 1, 6), this.M.gold, -.3, s * .55, 1.75, g); h.rotation.x = s * .6; }
      g.segs = []; g.add(this.pool(col, 4, .35)); return g; }
    if (kind === 'ronin') { // a giant swordsman: the hero's own model in the boss's colours
      const h = this.hero(col, b.id === 'renull' ? '#ff0844' : '#14141e', false); h.scale.setScalar(1 / 9); g.add(h); g.ronin = h; g.bodyMat = h.plate; return g; }
    // base plinth and rim light for every other boss
    P0(zU(new T.CylinderGeometry(1.15, 1.3, .3, 8)), this.M.armor, 0, 0, .15, g); P0(zU(new T.CylinderGeometry(1.2, 1.2, .05, 8)), glow, 0, 0, .32, g);
    if (kind === 'mech') { // a walking war machine: legs, armoured hull, cannon arms, a sensor head
      for (const s of [-1, 1]) { const leg = P0(new T.BoxGeometry(.5, .35, 1.1), this.M.armor2, -.1, s * .55, .75, g); leg.rotation.x = s * .15; P0(new T.BoxGeometry(.75, .45, .25), this.M.armor, .1, s * .62, .2, g); }
      P0(new T.BoxGeometry(1.2, 1.6, .9), body, 0, 0, 1.55, g); P0(new T.BoxGeometry(.5, 1.2, .5), this.M.armor2, .5, 0, 1.75, g);
      P0(new T.BoxGeometry(.12, 1.25, .12), glow, .78, 0, 1.55, g);
      const head = P0(new T.SphereGeometry(.4, 16, 12), this.M.armor, .15, 0, 2.2, g); P0(new T.BoxGeometry(.16, .5, .1), this.glow(col, 4), .5, 0, 2.25, g); void head;
      for (const s of [-1, 1]) { const arm = new T.Group(); arm.position.set(0, s * 1.05, 1.7); g.add(arm); P0(new T.BoxGeometry(.7, .55, .6), this.M.armor2, 0, 0, 0, arm);
        P0(new T.CylinderGeometry(.16, .16, 1.2, 12).rotateZ(Math.PI / 2), this.M.dark, .65, 0, 0, arm); P0(new T.CylinderGeometry(.2, .2, .12, 12).rotateZ(Math.PI / 2), glow, 1.25, 0, 0, arm); g.anim.push(['arm', arm, s]); }
      if (b.id === 'shogun' || b.id === 'prime' || b.id === 'genesis') { P0(new T.ConeGeometry(.22, .8, 4), this.M.gold, .1, -.35, 2.65, g).rotation.x = .5; P0(new T.ConeGeometry(.22, .8, 4), this.M.gold, .1, .35, 2.65, g).rotation.x = -.5; }
    } else if (kind === 'ship') { // a hovering gunship: hull, wings, engines
      const hull = new T.Group(); hull.position.z = 1.4; g.add(hull); g.hover = hull;
      P0(new T.CapsuleGeometry(.55, 1.4, 6, 14).rotateZ(Math.PI / 2), body, 0, 0, 0, hull); P0(new T.SphereGeometry(.38, 14, 10), this.M.mirror, .8, 0, .25, hull);
      for (const s of [-1, 1]) { const w = P0(new T.BoxGeometry(.9, 1.5, .1), this.M.armor2, -.2, s * 1, 0, hull); w.rotation.x = s * .15; P0(new T.CylinderGeometry(.22, .26, .7, 12).rotateZ(Math.PI / 2), this.M.armor, -.5, s * 1.55, 0, hull); P0(new T.CircleGeometry(.2, 14).rotateY(-Math.PI / 2), this.glow(col, 4.5), -.86, s * 1.55, 0, hull); }
      P0(new T.TorusGeometry(1.5, .04, 6, 40), glow, 0, 0, -.6, hull);
    } else { // core: a floating orb in rotating rings
      const c = new T.Group(); c.position.z = 1.6; g.add(c); g.hover = c;
      P0(new T.IcosahedronGeometry(.75, 1), body, 0, 0, 0, c); P0(new T.SphereGeometry(.42, 16, 12), this.glow(col, 3.5), 0, 0, 0, c);
      for (let i = 0; i < 3; i++) { const r = P0(new T.TorusGeometry(1.1 + i * .22, .05, 6, 48), i === 1 ? this.M.gold : glow, 0, 0, 0, c); r.rotation.set(i * .9, i * .5, 0); g.anim.push(['ring', r, i]); }
    }
    g.add(this.pool(col, 4.2, .32));
    g.traverse(o => { if (o.isMesh && !o.material.blending) o.castShadow = true; }); return g;
  },
  petKind(id) { return { kaya: 'dog', buchi: 'dog', tiger: 'dog', fox: 'dog', komainu: 'dog', k9: 'dog', raven: 'bird', owl: 'bird', phoenix: 'bird', batling: 'bird', drake: 'bird', shark: 'fish', koi: 'fish', scarab: 'bug', turtle: 'bug', mantis: 'bug', saucer: 'saucer', nano: 'swarm', penguin: 'penguin' }[id] || 'dog'; },
  petModel(id) {
    const T = THREE, g = new T.Group(), P0 = this.part.bind(this), zU = this.zUp, pc = (PET_BY_ID[id] && PET_BY_ID[id].col) || '#ffd23f', k = this.petKind(id);
    const fur = this.std({ color: new T.Color(pc).multiplyScalar(id === 'kaya' ? .85 : .6), metalness: id === 'k9' || id === 'turtle' ? .7 : .1, roughness: id === 'k9' || id === 'turtle' ? .3 : .7, emissive: new T.Color(pc), emissiveIntensity: id === 'shark' || id === 'koi' || id === 'fox' ? .5 : .08, transparent: id === 'shark', opacity: id === 'shark' ? .7 : 1 });
    const eye = this.glow(id === 'tiger' ? '#ffd23f' : '#ffffff', 3), dark = this.M.dark; g.anim = []; g.kind = k;
    if (k === 'dog') {
      const bd = P0(new T.CapsuleGeometry(2.4, 4.5, 4, 10).rotateZ(Math.PI / 2), fur, 0, 0, 6, g); void bd;
      const head = new T.Group(); head.position.set(4.6, 0, 8.6); g.add(head); P0(new T.SphereGeometry(2.4, 14, 10), fur, 0, 0, 0, head); P0(new T.BoxGeometry(2.2, 1.8, 1.6), fur, 2, 0, -.6, head); P0(new T.SphereGeometry(.45, 6, 6), dark, 3.1, 0, -.3, head);
      for (const s of [-1, 1]) { P0(new T.SphereGeometry(.45, 8, 6), eye, 1.7, s * 1, .6, head); const ear = P0(new T.ConeGeometry(.8, id === 'kaya' || id === 'fox' ? 2.6 : 1.6, 4), fur, -.2, s * 1.3, 2.2, head); ear.rotation.x = s * .35; }
      g.legs = []; for (const [lx, ly] of [[2.4, 1.3], [2.4, -1.3], [-2.4, 1.3], [-2.4, -1.3]]) { const L = new T.Group(); L.position.set(lx, ly, 5); g.add(L); P0(zU(new T.CylinderGeometry(.6, .5, 5, 6)), fur, 0, 0, -2.5, L); g.legs.push(L); }
      const tails = id === 'fox' ? 3 : 1; for (let i = 0; i < tails; i++) { const tl = new T.Group(); tl.position.set(-4.4, (i - (tails - 1) / 2) * 1.2, 7); g.add(tl); const tm = P0(new T.ConeGeometry(id === 'fox' ? 1 : .5, id === 'fox' ? 5 : 3.4, 6), id === 'fox' ? this.glow(pc, 1.6) : fur, 0, 0, 1.7, tl); tm.rotation.x = 0; tl.rotation.y = -.7; g.anim.push(['tail', tl, i]); }
    } else if (k === 'bird') {
      const bd = P0(new T.SphereGeometry(2.6, 16, 12), fur, 0, 0, 0, g); bd.scale.set(1.3, .9, .9); P0(new T.SphereGeometry(1.8, 14, 10), fur, 2.8, 0, 1.2, g);
      P0(new T.ConeGeometry(.6, 1.8, 6).rotateZ(-Math.PI / 2), this.M.gold, 4.8, 0, 1, g); for (const s of [-1, 1]) P0(new T.SphereGeometry(.4, 8, 6), eye, 3.8, s * .9, 1.8, g);
      g.wings = []; for (const s of [-1, 1]) { const w = new T.Group(); w.position.set(0, s * 1.8, .8); g.add(w); const wm = P0(new T.BoxGeometry(3.2, 5.5, .35), id === 'phoenix' || id === 'drake' ? this.glow(pc, 1.4) : fur, -.4, s * 2.7, 0, w); void wm; g.wings.push([w, s]); }
      P0(new T.BoxGeometry(3, 2.2, .3), fur, -3.4, 0, .2, g); g.hover = true;
    } else if (k === 'fish') {
      const bd = P0(new T.SphereGeometry(2.4, 18, 12), fur, 0, 0, 0, g); bd.scale.set(2, .8, .9); P0(new T.ConeGeometry(1, 2.6, 4).rotateX(Math.PI / 2), fur, -.5, 0, 2.6, g);
      const tl = new T.Group(); tl.position.x = -4.4; g.add(tl); P0(new T.ConeGeometry(1.9, 3, 4).rotateZ(Math.PI / 2), id === 'koi' ? this.glow(pc, 1.6) : fur, -1.3, 0, 0, tl); g.anim.push(['fin', tl]);
      for (const s of [-1, 1]) P0(new T.SphereGeometry(.4, 8, 6), eye, 3.4, s * 1.1, .6, g); g.hover = true;
    } else if (k === 'bug') {
      const sh = P0(new T.SphereGeometry(3, 18, 12, 0, TAU, 0, Math.PI / 2).rotateX(Math.PI / 2), fur, 0, 0, 1.2, g); sh.scale.set(1.2, 1, .8); P0(new T.BoxGeometry(.25, 5, .4), this.glow(pc, 2), 0, 0, 3.6, g);
      P0(new T.SphereGeometry(1.3, 12, 8), dark, 3.6, 0, 1.6, g); for (const s of [-1, 1]) P0(new T.SphereGeometry(.38, 8, 6), eye, 4.5, s * .6, 2, g);
      g.legs = []; for (let i = 0; i < 6; i++) { const L = new T.Group(), a = (i % 3 - 1) * .8, s = i < 3 ? 1 : -1; L.position.set(a * 2, s * 2.4, 1.4); g.add(L); P0(new T.BoxGeometry(.3, 2.4, .3), dark, 0, s * 1, -.4, L); g.legs.push(L); }
      if (id === 'mantis') for (const s of [-1, 1]) { const sc = P0(new T.BoxGeometry(4, .4, .6), this.glow(pc, 2), 4, s * 1.8, 2.6, g); sc.rotation.z = s * .5; }
    } else if (k === 'saucer') {
      const d = P0(new T.SphereGeometry(4, 20, 8), this.M.metal, 0, 0, 0, g); d.scale.set(1, 1, .28); P0(new T.SphereGeometry(1.8, 16, 10, 0, TAU, 0, Math.PI / 2).rotateX(Math.PI / 2), this.std({ color: new T.Color(pc), transparent: true, opacity: .7, emissive: new T.Color(pc), emissiveIntensity: .6 }), 0, 0, .8, g);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; P0(new T.SphereGeometry(.4, 6, 6), this.glow(pc, 3), Math.cos(a) * 3.6, Math.sin(a) * 3.6, 0, g); } g.hover = true; g.anim.push(['spin', g]);
    } else if (k === 'swarm') {
      g.bits = []; for (let i = 0; i < 9; i++) { const m = P0(new T.OctahedronGeometry(.9, 0), this.glow(pc, 2), 0, 0, 0, g); g.bits.push(m); } g.hover = true;
    } else { // penguin
      const bd = P0(new T.CapsuleGeometry(2.3, 2.6, 4, 12), this.M.dark, 0, 0, 4, g); bd.rotation.x = Math.PI / 2; bd.rotation.z = 0; bd.geometry.rotateX(0);
      P0(new T.SphereGeometry(2, 14, 10), this.M.white.clone(), 1.1, 0, 3.6, g).scale.set(.6, 1, 1.1); P0(new T.ConeGeometry(.6, 1.6, 6).rotateZ(-Math.PI / 2), this.M.gold, 2.6, 0, 6.6, g);
      for (const s of [-1, 1]) P0(new T.SphereGeometry(.35, 8, 6), this.glow(pc, 3), 2, s * .8, 7.2, g);
    }
    g.add(this.pool(pc, 18, .3)); g.scale.setScalar(2.1);
    return g;
  },
  animPet(g, t, moving) {
    if (g.legs) g.legs.forEach((L, i) => { L.rotation.y = moving ? Math.sin(t * 14 + i * 1.6) * .55 : 0; });
    if (g.wings) for (const [w, s] of g.wings) w.rotation.x = s * Math.sin(t * 16) * .7;
    if (g.bits) g.bits.forEach((m, i) => { const a = t * (1.5 + i * .13) + i * 2.1; m.position.set(Math.cos(a) * (3 + i % 3), Math.sin(a * 1.3) * (3 + i % 2), Math.sin(a * .7) * 2); m.rotation.set(a, a * .6, 0); });
    for (const a of g.anim) { if (a[0] === 'tail') a[1].rotation.z = Math.sin(t * 10 + a[2]) * .5; else if (a[0] === 'fin') a[1].rotation.z = Math.sin(t * 8) * .5; else if (a[0] === 'spin') { } }
  },
  /* ---------------- the frame ---------------- */
  ent(key, mk) { let r = this.ents.get(key); if (!r) { r = { g: mk(), seen: 0 }; this.root.add(r.g); this.ents.set(key, r); } r.seen = this.frame; return r.g; },
  sweep() { for (const [k, r] of this.ents) if (r.seen !== this.frame) { this.root.remove(r.g); r.g.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); if (r.g.bodyMat) r.g.bodyMat.dispose(); this.ents.delete(k); } },
  debris(e) { if (!this.on || this.deb.length > 80) return; const c = e.col || '#ff3b5c', m = this.colMat('', c, 'b'), n = 7;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + Math.random() * .6, sp = 60 + Math.random() * 140, s = (e.r || 14) * (.18 + Math.random() * .18); const mesh = new THREE.Mesh(this.dg || (this.dg = new THREE.BoxGeometry(1, 1, 1)), m); mesh.scale.setScalar(s); mesh.castShadow = true; this.root.add(mesh);
      this.deb.push({ m: mesh, x: e.x, y: e.y, z: 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 140 + Math.random() * 160, rx: Math.random() * 8, ry: Math.random() * 8, t: 0 }); }
    this.flashes.push({ x: e.x, y: e.y, c, t: 0 }); if (this.flashes.length > 2) this.flashes.shift(); },
  render(rd) {
    if (!this.ok) return; const T0 = BG.T || {}; this.t += rd; const t = this.t; this.frame = (this.frame | 0) + 1;
    const W = Math.max(2, cv.clientWidth || V.W), H = Math.max(2, cv.clientHeight || V.H), q = this.quality(), pr = Math.max(.5, Math.min(window.devicePixelRatio || 1, resK() || (q >= 2 ? 2 : q >= 1 ? 1.5 : 1)) * (this.dyn || 1)); // (version 41: dyn drops on a slow phone) // (version 40: Settings > SCREEN > RESOLUTION sets it)
    if (this.W0 !== W || this.H0 !== H || this.pr0 !== pr) { this.W0 = W; this.H0 = H; this.pr0 = pr; this.rn.setPixelRatio(pr); this.rn.setSize(W, H, false); this.comp.setPixelRatio(pr); this.comp.setSize(W, H); this.bloom.setSize(W * pr, H * pr); }
    this.themeSet(T0); this.syncCam(); this.layout(rd);
    // the hero (and its echo clones)
    const o = W3D.ho; if (o) { const hg = this.ent('hero', () => this.hero(o.ca || P.ca || '#00f2fe', o.cb || '#ff0844')); if (hg.c0 !== o.ca + o.cb) { hg.c0 = o.ca + o.cb; hg.trim.emissive.set(o.ca || '#00f2fe'); hg.visor.material.emissive.set(o.ca || '#00f2fe'); if (hg.pool) hg.pool.material.color.set(o.ca || '#00f2fe'); hg.plate.color.set(o.cb || '#ff0844').multiplyScalar(.5); hg.plate.emissive.set(o.cb || '#ff0844'); hg.bladeMat.emissive.set(o.fx && o.fx.blade && o.fx.blade[0] === '#' ? o.fx.blade : (o.ca || '#00f2fe')); }
      this.animHero(hg, { x: P.x, y: P.y, face: o.face, spd: o.spd != null ? o.spd : P.spd, ph: o.ph != null ? o.ph : P.walkPh, dashing: o.dashing, blade: o.blade, bl: o.bl, alpha: o.alpha }, rd, t);
      this.heroL.position.set(P.x, -P.y, 34); this.heroL.color.set(G.odT > 0 ? '#ffd700' : (o.ca || '#00f2fe')); this.heroL.intensity = 300; }
    for (let i = 0; i < ECHO.n; i++) { const e = ECHO.a[i]; if (!e.alive) continue; const eg = this.ent('echo' + i, () => this.hero('#c45bff', '#00f2fe', true)); this.animHero(eg, { x: e.x, y: e.y, face: e.ang, spd: Math.hypot(e.vx, e.vy), ph: t * 18, dashing: Math.hypot(e.vx, e.vy) > 600, blade: e.ang + .4, bl: 52, alpha: 1 }, rd, t); }
    // enemies
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 && e.vis < .05) continue; const eg = this.ent('e' + e.uid + ':' + e.type + ':' + (e.elite ? 1 : 0) + (e.aff | 0), () => this.enemyInst(e)); this.animEnemy(eg, e, t); }
    // the boss and its parts
    const b = Boss.cur; this.bossL.intensity = 0;
    if (b && !(b.dying > 1.6)) { const bg = this.ent('boss' + b.id + (b.lvl || ''), () => this.bossModel(b)), col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
      const sink = b.dying > 0 ? (b.dying / 1.6) * b.r * 1.2 : 0, ent = clamp(b.enter == null ? 1 : b.enter, 0, 1); bg.position.set(b.x, b.y, -sink + (1 - ent) * 260); bg.scale.setScalar(b.r); bg.rotation.z = Math.atan2(P.y - b.y, P.x - b.x);
      if (bg.ronin) { const sp = Math.hypot(b.vx || 0, b.vy || 0); this.animHero(bg.ronin, { x: 0, y: 0, face: 0, spd: sp, ph: t * 9, dashing: sp > 500, blade: sp > 500 ? -.4 : 1.8 + Math.sin(t * 2) * .2, bl: 52, alpha: 1 }, rd, t); bg.ronin.position.set(0, 0, 0); bg.ronin.rotation.z = 0; }
      if (bg.hover) bg.hover.position.z = (bg.kind === 'ship' ? 1.4 : 1.6) + Math.sin(t * 2) * .12;
      for (const a of bg.anim || []) { if (a[0] === 'arm') a[1].rotation.y = Math.sin(t * 2 + a[2]) * .12; else if (a[0] === 'ring') a[1].rotation.z += .015 * (a[2] + 1); }
      const fl = b._fl > .02; if (bg.bodyMat) { bg.bodyMat.emissive.set(fl ? '#ffffff' : col); bg.bodyMat.emissiveIntensity = fl ? 1.4 : .2; }
      if (bg.serpent) { const segs = b.seg || []; while (bg.segs.length < segs.length) { const m = new THREE.Mesh(this.sg || (this.sg = new THREE.SphereGeometry(1, 16, 12)), bg.bodyMat); m.castShadow = true; this.root.add(m); bg.segs.push(m); }
        bg.segs.forEach((m, i) => { const s = segs[i]; m.visible = !!s; if (s) { m.position.set(s.x, s.y, (s.r || 20) * .8 - sink); m.scale.setScalar(s.r || 20); } }); bg.onRemove = () => { for (const m of bg.segs) this.root.remove(m); }; }
      this.bossL.position.set(b.x, -b.y, b.r * 2.4); this.bossL.color.set(col); this.bossL.intensity = 420;
      for (let i = 0; i < (b.parts || []).length; i++) { const p = b.parts[i]; if (!p.alive) continue; const pg = this.ent('bp' + b.id + i, () => { const g = new THREE.Group(); const so = this.part(new THREE.CylinderGeometry(1, 1.1, .6, 8).rotateX(Math.PI / 2), this.M.armor, 0, 0, .3, g); const c = this.part(new THREE.SphereGeometry(.62, 14, 12), this.glow(col, 2.8), 0, 0, .95, g); g.core = c; return g; });
        const pr0 = p.r || 14; pg.position.set(p.x, p.y, -sink + (1 - ent) * 260); pg.scale.setScalar(pr0); pg.core.material.emissiveIntensity = (p.fl || 0) > .3 ? 7 : 2.8; } }
    // the pet
    if (G.pet && G.pet !== 'none' && G.mode !== 'puzzle' && typeof Pet !== 'undefined') { const pg = this.ent('pet' + G.pet, () => this.petModel(G.pet)), mv = Math.hypot(P.vx, P.vy) > 40;
      pg.position.set(Pet.x, Pet.y, pg.hover ? 20 + Math.sin(t * 3) * 3 : 0); pg.rotation.z = Pet.ang || 0; if (pg.kind === 'saucer') pg.rotation.z = t * 2; this.animPet(pg, t, mv); }
    // arena props
    const A = Arena; let k = 0;
    for (const tu of A.turrets || []) { const g = this.ent('tu' + (k++), () => { const g = new THREE.Group(); this.part(new THREE.CylinderGeometry(14, 16, 12, 6).rotateX(Math.PI / 2), this.M.armor, 0, 0, 6, g); g.dome = this.part(new THREE.SphereGeometry(9, 16, 10, 0, TAU, 0, Math.PI / 2).rotateX(Math.PI / 2), this.std({ color: 0x802030, metalness: .4, roughness: .3, emissive: 0xff2244, emissiveIntensity: .3 }), 0, 0, 12, g); g.gun = this.part(new THREE.CylinderGeometry(1.6, 1.6, 16, 8).rotateZ(Math.PI / 2), this.M.dark, 8, 0, 16, g); return g; });
      g.position.set(tu.x, tu.y, 0); g.rotation.z = tu.a != null ? tu.a : Math.atan2(P.y - tu.y, P.x - tu.x); g.dome.material.emissive.set(tu.hacked ? '#00ff88' : '#ff2244'); }
    k = 0; for (const br of A.barrels || []) { if (br.alive === false) continue; const r0 = br.r || 14; const g = this.ent('br' + (k++), () => { const g = new THREE.Group(); this.part(new THREE.CylinderGeometry(1, 1, 2.2, 18).rotateX(Math.PI / 2), this.std({ color: 0xb02414, metalness: .5, roughness: .35 }), 0, 0, 1.1, g); for (const z of [.5, 1.7]) this.part(new THREE.CylinderGeometry(1.03, 1.03, .16, 18).rotateX(Math.PI / 2), this.glow('#ffb020', 2.2), 0, 0, z, g); this.part(new THREE.CylinderGeometry(.9, .9, .06, 18).rotateX(Math.PI / 2), this.M.dark, 0, 0, 2.22, g); return g; });
      g.position.set(br.x, br.y, 0); g.scale.setScalar(r0); }
    k = 0; for (const n of A.nodes || []) { if (!n.alive) continue; const g = this.ent('nd' + (k++), () => { const g = new THREE.Group(); this.part(new THREE.CylinderGeometry(13, 14, 8, 6).rotateX(Math.PI / 2), this.M.armor, 0, 0, 4, g); g.c = this.part(new THREE.OctahedronGeometry(9, 0), this.glow('#33e6ff', 2.6), 0, 0, 24, g); return g; }); g.position.set(n.x, n.y, 0); g.c.rotation.z = t * 2; g.c.position.z = 24 + Math.sin(t * 3) * 3; }
    k = 0; for (const tm of A.terms || []) { const g = this.ent('tm' + (k++), () => { const g = new THREE.Group(); this.part(new THREE.BoxGeometry(24, 16, 26), this.M.armor2, 0, 0, 13, g); g.s = this.part(new THREE.BoxGeometry(18, 1, 12), this.glow('#ffb020', 2.4), 0, 8.4, 18, g); return g; }); g.position.set(tm.x, tm.y, 0); g.s.material.emissive.set(tm.done ? '#00ff88' : '#ffb020'); }
    // (version 40) the rest of the roof things are 3D too: mines, the uplink and the escorted drone, data shards, pickups, coins, portals
    const T = THREE, cyl = (r1, r2, h, n) => this.zUp(new T.CylinderGeometry(r1, r2, h, n || 16));
    k = 0; for (const m of A.mines || []) { const g = this.ent('mn' + (k++), () => { const g = new T.Group(); this.part(cyl(12, 13, 4, 8), this.std({ color: 0x2e2008, metalness: .6, roughness: .4 }), 0, 0, 2, g); this.part(cyl(7.5, 7.5, 1.6), this.glow('#ffb000', 1.2), 0, 0, 4.6, g); g.l = this.part(new T.SphereGeometry(3.4, 12, 8), this.glow('#ff2244', 4), 0, 0, 6, g); return g; });
      const on = m.arm <= 0, bl = m.fuse > 0 ? ((m.fuse * 30) | 0) % 2 : ((t * (on ? 3 : 8)) | 0) % 2; g.position.set(m.x, m.y, 0); g.rotation.z = Math.PI / 8; g.l.material.emissive.set(m.fuse > 0 ? '#ffffff' : '#ff2244'); g.l.material.emissiveIntensity = bl ? 3 : .25; }
    const u = A.uplink;
    if (u && !u.esc) { const g = this.ent('up', () => { const g = new T.Group(); this.part(cyl(1, 1.1, 10 / 20, 6), this.M.armor, 0, 0, .25, g); g.ring = this.part(cyl(.68, .68, .4, 24), this.glow('#ff4fd8', 1.6), 0, 0, .7, g);
        this.part(cyl(.16, .2, 2.6, 10), this.M.armor2, 0, 0, 2.2, g); const d = this.part(new T.ConeGeometry(1.3, .55, 18, 1, true), this.std({ color: 0x9aa0b8, metalness: .8, roughness: .25, side: T.DoubleSide }), 0, 0, 3.4, g); d.rotation.x = -Math.PI / 2;
        g.tip = this.part(new T.SphereGeometry(.38, 14, 10), this.glow('#ff4fd8', 4), 0, 0, 3.7, g); return g; });
      g.position.set(u.x, u.y, 0); g.scale.setScalar(u.r || 20); const c = u.fl > .3 ? '#ffffff' : '#ff4fd8'; g.ring.material.emissive.set(c); g.tip.material.emissive.set(c); g.tip.material.emissiveIntensity = 2 + Math.sin(t * 6) * .8; }
    if (u && u.esc) { const g = this.ent('drone', () => { const g = new T.Group(), h = new T.Group(); g.add(h); g.h = h; g.body = this.part(new T.BoxGeometry(48, 32, 10), this.std({ color: 0x0d2a30, metalness: .6, roughness: .35, emissive: 0x2ee6c8, emissiveIntensity: .15 }), 0, 0, 0, h);
        this.part(new T.BoxGeometry(30, 14, 8), this.std({ color: 0xffc23a, metalness: .4, roughness: .4 }), 0, 0, 9, h); g.rot = [];
        for (const [rx, ry] of [[-26, -20], [26, -20], [-26, 20], [26, 20]]) { this.part(cyl(3, 3, 6, 10), this.M.armor2, rx, ry, 4, h); g.rot.push(this.part(new T.BoxGeometry(22, 2.4, .8), this.M.dark, rx, ry, 8, h)); }
        g.add(this.pool('#2ee6c8', 40, .35)); return g; });
      g.position.set(u.x, u.y, 0); g.h.position.z = 22 + Math.sin(t * 3) * 3; for (const r of g.rot) r.rotation.z = t * 30; g.body.material.emissiveIntensity = u.fl > .3 ? 1.2 : .15; }
    if (typeof Obj2 !== 'undefined' && G.mode === 'story' && G.obj && G.obj.t === 'collect') { k = 0; for (const sh of Obj2.sh) { const g = this.ent('sh' + (k++), () => { const g = new T.Group(); g.c = this.part(new T.OctahedronGeometry(9, 0), this.glow('#9fffe8', 3), 0, 0, 0, g); g.c.scale.z = 1.45;
        const bm = new T.MeshBasicMaterial({ color: 0x2ee6c8, transparent: true, opacity: .22, depthWrite: false, blending: T.AdditiveBlending }); const b = this.part(cyl(3, 6, 260, 12), bm, 0, 0, 130, g); b.castShadow = false; return g; });
      const a = Math.min(1, sh.t * 3); g.position.set(sh.x, sh.y, 0); g.c.position.z = 16 + Math.sin(sh.t * 3) * 4; g.c.rotation.z = sh.t * 1.5; g.c.scale.set(a, a, 1.45 * a); } }
    for (let i = 0; i < PU.n; i++) { const p = PU.a[i]; const g = this.ent('pu' + i + ':' + p.k, () => { const g = new T.Group(); g.c = this.part(p.k === 0 ? cyl(8, 8, 7, 6) : new T.OctahedronGeometry(8, 0), this.glow(p.k === 0 ? '#00ff88' : '#88ffbb', 2.6), 0, 0, 0, g); g.add(this.pool(p.k === 0 ? '#00ff88' : '#88ffbb', 26, .3)); return g; });
      g.position.set(p.x, p.y, 0); g.c.position.z = 12 + Math.sin(p.t * 5) * 3; g.c.rotation.z = p.t * 2; g.visible = !(p.l < 3 && ((p.l * 8) | 0) % 2); }
    const coinM = this.M.coin || (this.M.coin = this.std({ color: 0xffc83a, metalness: 1, roughness: .25, emissive: 0x6a4800, emissiveIntensity: .6 })), coinG = this.coinG || (this.coinG = new T.CylinderGeometry(4.5, 4.5, 1.2, 18));
    coinG.userData.shared = true; for (let i = 0; i < CO.n; i++) { const o = CO.a[i]; const g = this.ent('co' + i, () => { const g = new T.Group(); g.c = this.part(coinG, coinM, 0, 0, 0, g); return g; }); g.position.set(o.x, o.y, 6); g.c.rotation.set(0, 0, o.t * 9); }
    k = 0; for (const p of A.portals || []) { const g = this.ent('pt' + (k++) + (p.c || ''), () => { const g = new T.Group(); this.part(new T.TorusGeometry(1, .12, 10, 40), this.glow(p.c || '#7df9ff', 3), 0, 0, .1, g);
        const bm = new T.MeshBasicMaterial({ color: new T.Color(p.c || '#7df9ff'), transparent: true, opacity: .2, depthWrite: false, blending: T.AdditiveBlending }); const b = this.part(cyl(.8, .5, 3, 24), bm, 0, 0, 1.5, g); b.castShadow = false; return g; });
      g.position.set(p.x, p.y, 2); g.scale.setScalar(p.r || 20); g.rotation.z = t * 1.5; }
    // friends in a live game: their own ninja, in their colors (LivePlus fills the list from their presence)
    if (Live.r && (G.mode === 'race' || G.mode === 'raid')) for (const f of Live.r3f || []) { const fg = this.ent('fr' + f.peer + f.ca + f.cb, () => this.hero(f.ca, f.cb)); this.animHero(fg, f, rd, t); }
    // debris
    for (let i = this.deb.length - 1; i >= 0; i--) { const d = this.deb[i]; d.t += rd; if (d.t > 1.2) { this.root.remove(d.m); this.deb.splice(i, 1); continue; }
      d.vz -= 620 * rd; d.x += d.vx * rd; d.y += d.vy * rd; d.z = Math.max(1, d.z + d.vz * rd); if (d.z <= 1) { d.vz *= -.35; d.vx *= .6; d.vy *= .6; }
      d.m.position.set(d.x, d.y, d.z); d.m.rotation.set(d.t * d.rx, d.t * d.ry, 0); if (d.t > .9) d.m.scale.multiplyScalar(.9); }
    // kill flashes
    for (let i = 0; i < this.fl.length; i++) { const f = this.flashes[i], L = this.fl[i]; if (!f) { L.intensity = 0; continue; } f.t += rd; const a = Math.max(0, 1 - f.t / .4); L.position.set(f.x, -f.y, 26); L.color.set(f.c); L.intensity = 900 * a; }
    this.flashes = this.flashes.filter(f => f.t < .4);
    for (const [kk, r] of this.ents) if (r.seen !== this.frame && r.g.onRemove) r.g.onRemove();
    this.sweep();
    const lit = BG.flash > 0 && T0.rain ? BG.flash : 0; this.hemi.intensity = .45 + lit * 1.6;
    if (q >= 1 && !CALM) { this.bloom.strength = q >= 3 ? .55 : .45; this.comp.render(); } else this.rn.render(this.scene, this.cam);
  }
};
function M3(r, k) { return r.M[k]; }
{ // R3 hooks: 3D = the three.js view; CLASSIC 3D = the old view; the old layer stays as the fallback
  const mo0 = W3D.models.bind(W3D); W3D.models = function () { return R3.on || mo0(); };
  const dr1 = W3D.draw.bind(W3D);
  W3D.draw = function (rd) {
    const s = Store.data.settings; if (s.r3m == null) { s.r3m = 1; if (s.d3 === 2) s.d3 = 1; Store.touch(); }
    const use = s.d3 === 1 && R3.want() && (R3.ok || R3.init()); if (use !== R3.on) R3.show(use);
    if (use) { this.camera(); try { R3.render(rd); } catch (e) { errLog(e); R3.err = String(e && e.stack || e).slice(0, 600); R3.failed = true; R3.show(false); } } else dr1(rd);
  };
  Pipe.on('pre', 'r3-off', () => { if (!W3D.live && R3.on) R3.show(false); }, 11);
  const hs0 = W3D.heroStand; W3D.heroStand = function (h, f) { if (R3.on) { const o = W3D.ho; if (o) { o.spd = h.spd; o.ph = h.ph; o.mvA = h.mvA; } return; } hs0.call(this, h, f); };
  const dpt1 = drawPet; drawPet = function (id, x, y) { if (R3.on && W3D.live && cx === W3D.cx0) return; return dpt1.apply(null, arguments); };
  const db0 = W3D.debris.bind(W3D); W3D.debris = function (e) { if (R3.on) R3.debris(e); else db0(e); };
}