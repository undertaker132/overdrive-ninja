
/* --- MODULE 20: v108.0 CHASE CAMERA — 3D seen from behind the hero, every marking in its place --- */
(function () {
  'use strict';
  // Settings > Graphics > 3D CAMERA: TOP (the classic view) or CHASE. Only the view changes; the simulation, replays and
  // tests do not. A perspective camera behind and above the hero looks up the roof where the enemies come from. It does not
  // turn with every dash (up on the screen stays forward); it leans with sideways moves and pulls back to frame a boss.
  //  · the world layer (rings, warnings, aim lines, effects) is drawn into a roof-sized canvas laid on the roof as a texture
  //  · numbers and labels that stand up (W3D.stand) are drawn on the screen above their spot, sized by distance
  //  · an energy wall marks every edge of the play area: no invisible walls
  //  · arrows at the screen edge point at enemies out of view
  //  · a touch is cast onto the roof through the perspective camera
  if (typeof HE !== 'undefined') Object.assign(HE, { "3D camera": "מצלמת 3D", "TOP": "מלמעלה", "CHASE": "מרדף" });
  const T = () => THREE;
  const on = () => { try { return Store.data.settings.chase108 === 1 && W3D.live && R3.ok && !CALM && inRun() && !(REPLAY.on && REPLAY.fast); } catch (e) { return false; } };
  const Rear = { v: 0 };
  let persp = null, ortho = null, ready = false, cx0 = 0, cy0 = 0, lean = 0, bk = 240, ht = 175, lk = 200, fog0 = null, fogOn = false;
  const V3 = () => new (T().Vector3)();

  /* ---------------- the camera ---------------- */
  const sc0 = R3.syncCam.bind(R3);
  R3.syncCam = function () {
    const live = on();
    Walls.show(live); Floor.show(live);
    if (!live) {
      if (ortho && this.cam !== ortho) { this.cam = ortho; try { this.comp.passes[0].camera = ortho; } catch (e) { } }
      if (fogOn) { this.scene.fog = fog0; fogOn = false; }
      roofLook(false);
      try { const sc = this.moon.shadow.camera; if (sc.top === 900) { sc.left = -520; sc.right = 520; sc.top = 620; sc.bottom = -620; sc.updateProjectionMatrix(); } } catch (e) { }
      ready = false; return sc0.apply(this, arguments);
    }
    if (!ortho) ortho = this.cam;
    if (this.cam !== ortho) this.cam = ortho;
    sc0.apply(this, arguments); // (the lights and the shadow camera follow as before)
    const W = this.rn.domElement.width, H = this.rn.domElement.height, dt = Math.min(.05, RDT || 1 / 60), k = ready ? 1 - Math.exp(-6 * dt) : 1; ready = true;
    if (!persp) persp = new (T().PerspectiveCamera)(58, W / H, 20, 3400);
    persp.aspect = W / H;
    const tx = clamp(P.x * .8 + V.CX * .2, V.L, V.R), ty = P.y;
    cx0 += (tx - cx0) * k; cy0 += (ty - cy0) * k;
    // smooth, but the hero never leaves the frame: a dash back toward the camera pulls the camera with it at once
    cx0 = clamp(cx0, tx - 70, tx + 70); cy0 = clamp(cy0, ty - 55, ty + 12); // (v109: a run toward the camera kept the hero at the bottom edge)
    lean += (clamp((P.vx || 0) / 900, -1, 1) * .09 - lean) * k;
    // a boss on the roof: back and up, so the hero and the boss are both in frame (never closer than the hero view)
    const B = Boss.cur && Boss.cur.enter >= 1 ? Boss.cur : null, sep = B ? clamp(cy0 - B.y, 0, 620) : 0;
    // the closer the boss stands, the higher the camera: a tall boss next to the hero must not fill the frame
    const nearB = B ? clamp(1 - sep / 420, 0, 1) : 0;
    // v110: a threat behind the hero (between the hero and the camera, out of view): the camera rises toward the top view
    // until it is in frame, and settles back once it is gone; one that is winding up an attack counts double
    let rear = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || e.type === ET.DUMMY || e.y < ty + 30) continue; const d = Math.hypot(e.x - P.x, e.y - ty); if (d > 320) continue;
      let w = 0; try { w = EAnim.windup(e); } catch (er) { } rear = Math.max(rear, clamp(1 - (d - 80) / 280, 0, 1) * (.9 + w * .4) + (e.st === 4 && e.type === ET.PHANTOM ? .4 : 0)); }
    rear = clamp(rear, 0, 1); Rear.v += (rear - Rear.v) * (rear > Rear.v ? k * 1.6 : k * .5); const rv = Rear.v;
    bk += ((B ? 330 + sep * .3 + nearB * 60 : 240 + rv * 50) - bk) * k; ht += ((B ? 320 + sep * .32 + nearB * 170 : 175 + rv * 270) - ht) * k; lk += ((B ? sep * .5 + 40 : 200 - rv * 175) - lk) * k;
    const sx = (typeof CAM !== 'undefined' ? CAM.ox || 0 : 0) * .6, sy = (typeof CAM !== 'undefined' ? CAM.oy || 0 : 0) * .6; // (screen shake)
    const px = clamp(cx0 - lean * 300, V.L - 20, V.R + 20) + sx;
    persp.position.set(px, -(cy0 + bk) - sy, Math.max(150, ht));
    persp.up.set(0, 0, 1);
    persp.lookAt(cx0 + lean * 120 + (B ? (B.x - cx0) * .35 : 0), -(cy0 - lk), 18);
    const fv = G.odT > 0 ? 64 : 58; persp.fov += (fv - persp.fov) * k;
    persp.updateProjectionMatrix(); persp.updateMatrixWorld();
    this.cam = persp; try { this.comp.passes[0].camera = persp; } catch (e) { }
    // fog hides the far end of the train (and spares the far draw calls)
    if (!fogOn) { fog0 = this.scene.fog; const bg = this.scene.background && this.scene.background.isColor ? this.scene.background : new (T().Color)('#070a1c'); this.scene.fog = new (T().Fog)(bg.clone(), 1100, 3000); fogOn = true; }
    // the moon's shadow covers what this camera sees: centred ahead of the hero, a wider area than the top view needs
    try { const sc = this.moon.shadow.camera, fx = cx0, fy = cy0 - 260; this.moon.position.set(fx - 420, -(fy + 620), 1100); this.moon.target.position.set(fx, -fy, 0); this.moon.target.updateMatrixWorld();
      if (sc.top !== 900) { sc.left = -640; sc.right = 640; sc.top = 900; sc.bottom = -900; sc.updateProjectionMatrix(); } } catch (e) { }
    roofLook(true); Walls.update(dt); Floor.place();
  };
  // the 3D roof past the play area: seen at a grazing angle its wet metal mirrored the sky, a white glare with black puddles
  let roof0 = null;
  function roofLook(v) {
    const m = R3.roofMat; if (!m) return;
    if (v && !roof0) { roof0 = { rm: m.roughnessMap, r: m.roughness, mt: m.metalness, e: m.envMapIntensity }; m.roughnessMap = null; m.roughness = .88; m.metalness = .2; m.envMapIntensity = .45; m.needsUpdate = true; }
    else if (!v && roof0) { m.roughnessMap = roof0.rm; m.roughness = roof0.r; m.metalness = roof0.mt; m.envMapIntensity = roof0.e; m.needsUpdate = true; roof0 = null; }
  }
  // the finisher camera of v96 moves the camera itself: not in the chase view (the chase view frames the kill already)
  try { const FC = window.__V96 && window.__V96.FinisherCam96; if (FC) { const t0 = FC.tick.bind(FC); FC.tick = function () { if (on()) { this.t = 0; return; } return t0.apply(this, arguments); }; } } catch (e) { }

  /* ---------------- the roof layer: the 2D world drawing, laid on the roof ---------------- */
  const Floor = {
    cv: null, g: null, tex: null, mesh: null, k: 1.25, x0: -80, y0: -170, w: 0, h: 0,
    ensure() {
      const lv = typeof Q !== 'undefined' ? Q.lvl | 0 : 2, w = V.VW + 160, h = V.VH + 260, k = lv >= 3 ? 1.3 : lv >= 2 ? 1.15 : lv >= 1 ? .95 : .8; // (texture detail follows the quality level)
      if (this.mesh && this.w === w && this.h === h && this.k === k) return;
      this.w = w; this.h = h; this.k = k;
      if (!this.cv) { this.cv = document.createElement('canvas'); this.g = this.cv.getContext('2d'); }
      this.cv.width = Math.round(w * k); this.cv.height = Math.round(h * k);
      if (this.mesh) { R3.scene.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.tex.dispose(); }
      const t = T(); this.tex = new t.CanvasTexture(this.cv); this.tex.colorSpace = t.SRGBColorSpace; this.tex.anisotropy = 4; this.tex.generateMipmaps = false; this.tex.minFilter = t.LinearFilter;
      // v109: the layer is the roof itself, drawn first: an opaque surface just above the 3D roof (alpha-tested at its edges).
      // Before it lay at 1.5 units as a see-through sheet drawn after the models: it hid every shadow and the soles of the
      // feet, and the hero seemed to hover over the roof.
      // (its color a shade under white: the bloom pass lights only what is brighter, so the 2D slashes, already drawn with their
      // own glow, no longer flood the near half of the screen; the 3D neon still blooms)
      this.mesh = new t.Mesh(new t.PlaneGeometry(w, h), new t.MeshBasicMaterial({ map: this.tex, color: new t.Color(.86, .86, .86), transparent: false, alphaTest: .03, depthWrite: true, toneMapped: false, fog: false }));
      this.mesh.renderOrder = -10; this.mesh.frustumCulled = false; R3.scene.add(this.mesh);
      // the shadows of the models fall on the layer through a shadow catcher laid on top of it
      if (!this.sh) { this.sh = new t.Mesh(new t.PlaneGeometry(1, 1), new t.ShadowMaterial({ opacity: .5, transparent: true, depthWrite: false })); this.sh.receiveShadow = true; this.sh.renderOrder = -9; this.sh.frustumCulled = false; R3.scene.add(this.sh); }
      this.sh.scale.set(w, h, 1);
      this.place();
    },
    place() { if (this.mesh) { const x = this.x0 + this.w / 2, y = -(this.y0 + this.h / 2); this.mesh.position.set(x, y, .12); this.sh.position.set(x, y, .3); } },
    show(v) { if (this.mesh) this.mesh.visible = v; if (this.sh) this.sh.visible = v && R3.rn.shadowMap.enabled; Contact.show(v); }
  };
  /* ---------------- contact: where the feet meet the roof ---------------- */
  // a soft dark patch under the hero and the boss (ambient occlusion), on every quality level, shadows or not
  const Contact = {
    list: [],
    make(size) {
      const t = T();
      if (!this.tex) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.5, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); this.tex = new t.CanvasTexture(c); }
      const m = new t.Mesh(new t.PlaneGeometry(1, 1), new t.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
      m.renderOrder = 3; m.frustumCulled = false; m.base = size; /* (above the neon pool under the hero, which lit it away) */ R3.scene.add(m); this.list.push(m); return m;
    },
    show(v) { for (const m of this.list) m.visible = false; if (!v) return;
      if (!this.hero) this.hero = this.make(24); if (!this.boss) this.boss = this.make(1);
      const h = this.hero; h.visible = true;
      // off the roof (a launch, a helm breaker) the patch shrinks and fades: a jump reads as a jump, not as floating
      let air = 0; try { const hg = R3.ents.get('hero'); if (hg) air = clamp((hg.g.position.z + 1.95) / 60, 0, 1); } catch (e) { }
      const k = 1 - air * .45; h.position.set(P.x, -P.y, .8); h.scale.set(h.base * 1.15 * k, h.base * k, 1); h.material.opacity = .9 * (1 - air * .55);
      const B = Boss.cur; if (B && B.enter >= 1) { const b = this.boss, r = (B.r || 40) * 2.1; b.visible = true; b.position.set(B.x, -B.y, .8); b.scale.set(r, r, 1); b.material.opacity = .5; }
    }
  };
  // the hero's model stood with its soles 2 units over the roof (no one could tell from above): on the roof in this view
  const ah0 = R3.animHero.bind(R3);
  R3.animHero = function (g) { const r = ah0.apply(this, arguments); if (active3() && g.human) g.position.z -= 1.95; return r; };
  const active3 = () => persp && R3.cam === persp;
  let main = null, stands = [], active = false, cx0Saved = null, darkNow = false;
  window.ChaseLayer = {
    get canvas() { return Floor.cv; }, // (tests look at the roof layer)
    begin() {
      if (!on() || !persp) return false;
      try { Floor.ensure(); } catch (e) { errLog(e); return false; }
      main = cx; const g = Floor.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, Floor.cv.width, Floor.cv.height);
      g.setTransform(Floor.k, 0, 0, Floor.k, -Floor.x0 * Floor.k, -Floor.y0 * Floor.k); g.direction = main.direction;
      cx = g; cx0Saved = W3D.cx0; W3D.cx0 = g; /* (drawHero and friends tell the game canvas from a shop preview by this) */ stands = []; active = true; return true;
    },
    end() {
      if (!active) return; active = false; cx = main; W3D.cx0 = cx0Saved;
      // the one extra cost of this view is sending the roof layer to the GPU: every frame on high quality, every other one below
      Floor.n = (Floor.n | 0) + 1; if (!(typeof Q !== 'undefined' && Q.lvl < 2) || Floor.n % 2 === 0) Floor.tex.needsUpdate = true;
      cx.save(); try { drawStands(); if (darkNow) drawDarkScreen(); drawArrows(); } catch (e) { errLog(e); } cx.restore(); darkNow = false;
    }
  };
  // what stands up (numbers, labels, bars): on the screen above its spot, a size that follows the distance
  const st0 = W3D.stand.bind(W3D);
  W3D.stand = function (x, y, f, lift) {
    if (!active) return st0(x, y, f, lift);
    const g = cx; stands.push({ x, y, f, lift: lift == null ? 3 : lift, font: g.font, ta: g.textAlign, tb: g.textBaseline, ga: g.globalAlpha, fs: g.fillStyle, ss: g.strokeStyle, lw: g.lineWidth, op: g.globalCompositeOperation });
  };
  const toScreen = (x, y, z) => { const v = V3().set(x, -y, z); const d = v.distanceTo(persp.position); v.project(persp); if (v.z > 1 || v.z < -1) return null; return { x: (v.x * .5 + .5) * cv.width, y: (-v.y * .5 + .5) * cv.height, d }; };
  function drawStands() {
    const ref = Math.hypot(bk, ht), base = V.s * V.dpr;
    for (const s of stands) {
      const p = toScreen(s.x, s.y, 0); if (!p) continue;
      const k = base * clamp(ref / p.d, .5, 1.6);
      cx.setTransform(k, 0, 0, k, p.x - k * s.x, p.y - k * (s.y + s.lift));
      cx.font = s.font; cx.textAlign = s.ta; cx.textBaseline = s.tb; cx.globalAlpha = s.ga; cx.fillStyle = s.fs; cx.strokeStyle = s.ss; cx.lineWidth = s.lw; cx.globalCompositeOperation = s.op;
      try { s.f(); } catch (e) { }
    }
    cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
  }
  // enemies out of view: an arrow at the screen edge, in the enemy's color, the nearest first
  function drawArrows() {
    const W = cv.width, H = cv.height, m = 26 * V.dpr, hero = toScreen(P.x, P.y, 0); if (!hero) return;
    const list = [];
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.type !== ET.CLONE && e.type !== ET.DUMMY) { let w = 0; try { w = EAnim.windup(e); } catch (er) { } list.push([e.x, e.y, w > .05 ? '#ff0844' : e.col || '#ff3b5c', Math.hypot(e.x - P.x, e.y - P.y) - w * 400, w]); } }
    if (Boss.cur) list.push([Boss.cur.x, Boss.cur.y, (Boss.cur.info && Boss.cur.info.col) || '#ff0844', 0]);
    list.sort((a, b) => a[3] - b[3]);
    let n = 0;
    for (const [x, y, col, , w] of list) {
      if (n >= 7) break;
      const v = V3().set(x, -y, 20); v.project(persp); const behind = v.z > 1;
      let sx = (v.x * .5 + .5) * W, sy = (-v.y * .5 + .5) * H;
      if (!behind && sx > m && sx < W - m && sy > m && sy < H - m * 3) continue; // on screen
      if (behind) { sx = W - sx; sy = H + 200; } // (behind the camera: below the screen)
      const a = Math.atan2(sy - hero.y, sx - hero.x), r = Math.min((W / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - m * 2) / Math.abs(Math.sin(a) || 1e-6));
      const ax = W / 2 + Math.cos(a) * r, ay = H / 2 + Math.sin(a) * r;
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.translate(ax, ay); cx.rotate(a);
      // (v110: an enemy out of view that is about to attack: a big red arrow that beats fast, with a ring)
      const hot = w > .05; cx.globalAlpha = hot ? .75 + .25 * Math.sin(CAM.t * 22) : .55 + .35 * Math.sin(CAM.t * 8 + n); cx.fillStyle = col;
      if (hot) { cx.strokeStyle = col; cx.lineWidth = 2 * V.dpr; cx.beginPath(); cx.arc(-4 * V.dpr, 0, (14 + 8 * (1 - w)) * V.dpr, 0, TAU); cx.stroke(); }
      cx.beginPath(); const s = (hot ? 13 + 3 * w : 9) * V.dpr; cx.moveTo(s, 0); cx.lineTo(-s * .7, s * .75); cx.lineTo(-s * .35, 0); cx.lineTo(-s * .7, -s * .75); cx.closePath(); cx.fill();
      cx.globalAlpha = 1; n++;
    }
    cx.setTransform(1, 0, 0, 1, 0, 0);
  }


  // the blackout: darkness over the whole screen with a light around the hero (on the roof layer it lay there like a black rug)
  const dd0 = drawDark;
  drawDark = function () { if (active) { if (G.dark && !(G.odT > 0)) darkNow = true; return; } return dd0.apply(this, arguments); };
  function drawDarkScreen() {
    const h = toScreen(P.x, P.y, 20), e = toScreen(P.x + 185, P.y, 20); if (!h) return;
    const W = cv.width, H = cv.height, r = clamp(e ? Math.hypot(e.x - h.x, e.y - h.y) * .6 : W * .3, W * .2, W * .32); // (near the camera the 185-unit light would cover the screen)
    cx.setTransform(1, 0, 0, 1, 0, 0);
    const g = cx.createRadialGradient(h.x, h.y, r * .55, h.x, h.y, r * 1.15); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.96)');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < EN.n; i++) { const en = EN.a[i]; if (!en.alive || en.al > 0 || dist(en.x, en.y, P.x, P.y) < 150) continue; const q = toScreen(en.x, en.y, 24); if (!q) continue; const k = clamp(Math.hypot(bk, ht) / q.d, .5, 1.5) * V.dpr; cx.fillStyle = '#ff0844'; cx.fillRect(q.x - 5 * k, q.y, 3 * k, 2 * k); cx.fillRect(q.x + 2 * k, q.y, 3 * k, 2 * k); }
  }
  /* ---------------- no invisible walls: an energy wall on every edge of the play area ---------------- */
  const Walls = {
    g: null, list: [], edges: [], flash: [0, 0, 0, 0],
    build() {
      const t = T(), c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d');
      const gr = x.createLinearGradient(0, 64, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64);
      const tex = new t.CanvasTexture(c); this.g = new t.Group();
      for (let i = 0; i < 4; i++) {
        const mat = new t.MeshBasicMaterial({ map: tex, color: new t.Color('#00f2fe'), transparent: true, opacity: .1, blending: t.AdditiveBlending, depthWrite: false, side: t.DoubleSide, fog: false, toneMapped: false });
        const m = new t.Mesh(new t.PlaneGeometry(1, 1), mat); m.frustumCulled = false; this.g.add(m); this.list.push(m);
        const e = new t.Mesh(new t.PlaneGeometry(1, 1), new t.MeshBasicMaterial({ color: new t.Color('#00f2fe'), transparent: true, opacity: .6, blending: t.AdditiveBlending, depthWrite: false, side: t.DoubleSide, fog: false, toneMapped: false })); e.frustumCulled = false; this.g.add(e); this.edges.push(e); // (a bright line along the top of the wall)
      }
      R3.scene.add(this.g);
    },
    show(v) { if (this.g) this.g.visible = v; },
    update(dt) {
      if (!this.g) this.build();
      const L = V.L, R = V.R, top = 0, bot = V.VH, h = 46, sides = [[L, top, L, bot, Math.abs(P.x - L)], [R, top, R, bot, Math.abs(R - P.x)], [L, top, R, top, Math.abs(P.y - top)], [L, bot, R, bot, Math.abs(bot - P.y)]];
      sides.forEach((s, i) => {
        const m = this.list[i], [x1, y1, x2, y2, d] = s, len = Math.hypot(x2 - x1, y2 - y1);
        // the back edge is behind the hero, between them and the camera: a glowing strip on the roof instead of a wall
        const wh = i === 3 ? 5 : h;
        m.scale.set(len, wh, 1); m.position.set((x1 + x2) / 2, -(y1 + y2) / 2, wh / 2); m.rotation.set(Math.PI / 2, 0, 0); m.rotateOnWorldAxis(new (T().Vector3)(0, 0, 1), -Math.atan2(y2 - y1, x2 - x1));
        if (d < P.r + 3) this.flash[i] = 1; this.flash[i] = Math.max(0, this.flash[i] - dt * 2.5);
        const near = clamp(1 - (d - P.r) / 110, 0, 1);
        m.material.opacity = .14 + near * .46 + this.flash[i] * .5;
        const e = this.edges[i]; e.scale.set(len, 2.2, 1); e.position.set((x1 + x2) / 2, -(y1 + y2) / 2, i === 3 ? 5 : h); e.rotation.copy(m.rotation); e.material.opacity = .45 + near * .5 + this.flash[i] * .5; e.material.color.copy(m.material.color); m.material.color.set(this.flash[i] > .3 ? '#ffffff' : G.odT > 0 ? '#ffd700' : '#00f2fe');
      });
    }
  };

  /* ---------------- a touch lands where it points on the roof ---------------- */
  const up0 = W3D.unproj.bind(W3D);
  W3D.unproj = function (sx, sy) {
    if (!on() || !persp) return up0(sx, sy);
    const t = T(), rc = new t.Raycaster(); rc.setFromCamera(new t.Vector2(sx / V.VW * 2 - 1, -(sy / V.VH * 2 - 1)), persp);
    const hit = new t.Vector3(); if (!rc.ray.intersectPlane(new t.Plane(new t.Vector3(0, 0, 1), 0), hit)) return up0(sx, sy);
    return [hit.x, -hit.y];
  };

  // every screen marker the game places over a world spot (tutorial spotlights, element orbs, execution marks, ripples)
  const pj0 = W3D.proj.bind(W3D);
  W3D.proj = function (x, y, h) { if (!on() || !persp) return pj0(x, y, h); const p = toScreen(x, y, h || 0); return p ? [p.x, p.y] : [-9999, -9999]; };

  // the tutorial's spotlight took a roof point as a screen point: off target in any 3D view (classic 3D included)
  const tdr0 = Tut.draw.bind(Tut);
  Tut.draw = function () {
    const c = this.cur;
    if (c && W3D.live) { if (c.wx == null) { c.wx = c.x; c.wy = c.y; } const q = W3D.proj(c.wx, c.wy, 10), k = V.s * V.dpr; c.x = q[0] / k; c.y = q[1] / k; }
    return tdr0.apply(this, arguments);
  };

  /* ---------------- the switch: Settings > Graphics > 3D CAMERA ---------------- */
  const os0 = UI.openSettings.bind(UI);
  UI.openSettings = function () {
    const r = os0.apply(this, arguments);
    try {
      const s = Store.data.settings, d3 = document.getElementById('set-d3'), row = d3 && (d3.closest('.set') || d3.parentElement);
      if (row && !document.getElementById('set-chase108')) {
        const rr = el('div', 'set'); rr.appendChild(el('span', '', lt('3D camera')));
        const b = el('button', 'tog on'); b.id = 'set-chase108'; b.type = 'button'; b.textContent = lt(s.chase108 === 1 ? 'CHASE' : 'TOP');
        b.onclick = () => { s.chase108 = s.chase108 === 1 ? 0 : 1; if (s.chase108 === 1 && !(s.d3 >= 2)) s.d3 = 2; /* (the chase view needs the 3D models) */ Aud.sfx('ui'); Store.touch(); UI.openSettings(); };
        rr.appendChild(b); row.parentElement.insertBefore(rr, row.nextSibling); if (!(s.d3 > 0)) rr.style.display = 'none';
      }
    } catch (e) { errLog(e); }
    return r;
  };
  window.ChaseCam108 = { on };
})();
