
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
    cx0 = clamp(cx0, tx - 70, tx + 70); cy0 = clamp(cy0, ty - 140, ty + 12);
    lean += (clamp((P.vx || 0) / 900, -1, 1) * .09 - lean) * k;
    // a boss on the roof: back and up, so the hero and the boss are both in frame (never closer than the hero view)
    const B = Boss.cur && Boss.cur.enter >= 1 ? Boss.cur : null, sep = B ? clamp(cy0 - B.y, 0, 620) : 0;
    // the closer the boss stands, the higher the camera: a tall boss next to the hero must not fill the frame
    const nearB = B ? clamp(1 - sep / 420, 0, 1) : 0;
    bk += ((B ? 330 + sep * .3 + nearB * 60 : 240) - bk) * k; ht += ((B ? 320 + sep * .32 + nearB * 170 : 175) - ht) * k; lk += ((B ? sep * .5 + 40 : 200) - lk) * k;
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
    Walls.update(dt); Floor.place();
  };
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
      this.mesh = new t.Mesh(new t.PlaneGeometry(w, h), new t.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
      this.mesh.renderOrder = 5; this.mesh.frustumCulled = false; R3.scene.add(this.mesh); this.place();
    },
    place() { if (this.mesh) this.mesh.position.set(this.x0 + this.w / 2, -(this.y0 + this.h / 2), 1.5); },
    show(v) { if (this.mesh) this.mesh.visible = v; }
  };
  let main = null, stands = [], active = false, cx0Saved = null, darkNow = false;
  window.ChaseLayer = {
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
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.type !== ET.CLONE && e.type !== ET.DUMMY) list.push([e.x, e.y, e.col || '#ff3b5c', Math.hypot(e.x - P.x, e.y - P.y)]); }
    if (Boss.cur) list.push([Boss.cur.x, Boss.cur.y, (Boss.cur.info && Boss.cur.info.col) || '#ff0844', 0]);
    list.sort((a, b) => a[3] - b[3]);
    let n = 0;
    for (const [x, y, col] of list) {
      if (n >= 7) break;
      const v = V3().set(x, -y, 20); v.project(persp); const behind = v.z > 1;
      let sx = (v.x * .5 + .5) * W, sy = (-v.y * .5 + .5) * H;
      if (!behind && sx > m && sx < W - m && sy > m && sy < H - m * 3) continue; // on screen
      if (behind) { sx = W - sx; sy = H + 200; } // (behind the camera: below the screen)
      const a = Math.atan2(sy - hero.y, sx - hero.x), r = Math.min((W / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - m * 2) / Math.abs(Math.sin(a) || 1e-6));
      const ax = W / 2 + Math.cos(a) * r, ay = H / 2 + Math.sin(a) * r;
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.translate(ax, ay); cx.rotate(a);
      cx.globalAlpha = .55 + .35 * Math.sin(CAM.t * 8 + n); cx.fillStyle = col; cx.beginPath(); const s = 9 * V.dpr; cx.moveTo(s, 0); cx.lineTo(-s * .7, s * .75); cx.lineTo(-s * .35, 0); cx.lineTo(-s * .7, -s * .75); cx.closePath(); cx.fill();
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
