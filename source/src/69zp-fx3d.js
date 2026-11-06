/* =====================================================================
   FX 3D — the high-end layer of the 3D view (render only).
   - quality tiers: LOW (no post), MEDIUM (bloom, grading, FXAA, rain
     reflections), HIGH (+ shadows, wide bloom, gloss reflections
     everywhere, motion blur, heat haze, aberration, grain), ULTRA (+ the
     2D layer goes through the post too)
   - moving lights: the blade, Overdrive, the pet, bosses, every kill,
     flying cars, police searchlights; lightning lights the whole scene
   - the hero is drawn into its own small canvas so it can get a soft
     neon rim and a reflection on the wet roof
   - world life: 3D rain with splashes, sparks, the dash ribbon, flying
     cars, searchlight drones, an overpass that passes over the train,
     neon signs and holograms on the towers, a sky with a moon
   - cinematic camera: the view turns and lowers when a boss enters and
     during the finisher (touch aiming follows the turn exactly)
   Nothing here touches the simulation: replays stay exact.
   ===================================================================== */
const FX3D = {
  sp: [], rb: [], rain: [], spl: [], cars: [], drones: [], flashes: [], over: null, t: 0, cineV: [GL3D.th0, 0],
  tier() { const s = Store.data && Store.data.settings; if (s && s.fx === 'ultra') return 3; if (s && s.fx === 'high') return 2; if (s && s.fx === 'low') return 0; return Q.lvl; },
  setup(T) { // per frame: quality, wetness, grading
    const g = GL3D, P = g.P, t = this.tier(), rainy = !!T.rain;
    P.on = t >= 1; P.bloom = t >= 2 ? 2 : t >= 1 ? 1 : 0; P.fxaa = t >= 1 ? 1 : 0; P.sm = t >= 2; P.ultra = t >= 3; P.grain = t >= 2 ? .028 : 0; P.vig = t >= 1 ? .38 : 0;
    g.nlMax = t >= 2 ? 8 : t >= 1 ? 6 : 3;
    g.wet = (t >= 1 && rainy ? 1 : t >= 2 ? .35 : 0) * Refl.k(); g.rip = rainy ? 1.6 : .5; g.t = CAM.t;
    if (!P.grade || P.gk !== BG.theme) { P.gk = BG.theme; const a = rgb3(T.b1 || '#ff0844'), b = rgb3(T.sky2 || '#22093a'), m = (q, w) => 1 + (q - .5) * w;
      P.grade = { t: [m(a[0] * .5 + b[0] * .5, .14), m(a[1] * .5 + b[1] * .5, .14), m(a[2] * .5 + b[2] * .5 + (rainy ? .15 : 0), .14)], l: [b[0] * .18, b[1] * .18, b[2] * .22], s: 1.14, c: 1.08 }; }
    document.body.classList.toggle('ultra3d', P.ultra && P.on);
  },
  /* the camera for cinematic moments: [tilt, turn] */
  view(fk) {
    const b = Boss.cur, th0 = GL3D.th0; let th = th0, yw = 0;
    if (b && b.enter != null && b.enter < 1 && !b.dying) { const e = clamp(b.enter, 0, 1), k = Math.pow(1 - e, 1.5); th = th0 - k * .25; yw = k * .22 * (b.x < V.CX ? -1 : 1); }
    if (fk > 0) { th = Math.min(th, th0 - fk * .12); yw += fk * .06; }
    if (b && b.dying > 0) { const k = clamp((1.6 - b.dying) / 1.6, 0, 1), w = Math.sin(k * Math.PI); th = Math.min(th, th0 - w * .2); yw += w * .3 * (b.x < V.CX ? 1 : -1); } // the kill-cam circles the falling boss
    const now = performance.now(), dt = Math.min(.1, Math.max(0, (now - (this.vt || now)) / 1000)); this.vt = now; const C = this.cineV, d = Math.min(1, dt * 5); C[0] += (th - C[0]) * d; C[1] += (yw - C[1]) * d;
    if (Math.abs(C[0] - th0) < .001 && Math.abs(C[1]) < .001) { C[0] = th0; C[1] = 0; }
    return C;
  },
  /* ---- moving lights ---- */
  lights() {
    const g = GL3D, o = W3D.ho; if (o) { const fx = o.fx || P.fx || {}, bc = rgb3(fx.blade && fx.blade[0] === '#' ? fx.blade : (o.ca || P.ca || '#00f2fe')), d = o.dashing ? 1 : 0;
      g.light(o.x, o.y, 18, 110 + d * 50, bc, 1 + d * .7); if (G.odT > 0) g.light(o.x, o.y, 30, 190, [1, .8, .25], 1.3); }
    const b = Boss.cur; if (b && !(b.dying > 1.6)) { const c = rgb3((BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844'); g.light(b.x, b.y, b.r * 1.2, b.r * 3.4, c, .9 + (b._fl > 0 ? 1 : 0)); }
    if (G.pet && G.pet !== 'none' && G.mode !== 'puzzle') { const p = PET_BY_ID[G.pet]; g.light(Pet.x, Pet.y, 14, 60, rgb3((p && p.col) || '#ffd23f'), .45); }
    for (let i = this.flashes.length - 1; i >= 0; i--) { const f = this.flashes[i]; f.t += RDT; if (f.t > .4) { this.flashes.splice(i, 1); continue; } g.light(f.x, f.y, 22, 150, f.c, 2.2 * (1 - f.t / .4)); }
    let fl = BG.flash > 0 && BG.T && BG.T.rain ? BG.flash : 0; g.lmul = (1.22 + fl * .8) * (this.over ? this.over.dim : 1); // v38: brighter base light, so shapes and colors read
  },
  /* ---- arrivals: every new enemy comes down a beam of its own color, onto a ring on the roof ---- */
  spawns() { // a beam of light, a floor ring and a light mark every new enemy for its first .9 s on screen (drawn only)
    const g = GL3D, B = this.born || (this.born = new Map()), now = performance.now() / 1000, seen = new Set();
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0) continue; seen.add(e.uid);
      if (!B.has(e.uid)) B.set(e.uid, e.spawnT > 0 ? now : now - 9); const age = now - B.get(e.uid); if (age > .9) continue;
      if (e.y < 0 || e.y > V.VH || age > .55) continue; // v38: enemies flying in from outside show their own flight; on the roof, a short mark
      const k = age / .55, c = rgb3(e.col || '#ff3b5c'), x = e.x, y = e.y, r = (e.r || 14), f = 1 - k;
      g.beam(x, y, 150 * f + 20, x, y, 0, 2 + f * 4, 1 + f * 2, c, .0, .45 * f); g.floorRing(x, y, .5, r * (1.1 + k * 1.4), c, .7 * f); g.floorGlow(x, y, .4, r * 2, c, .3 * f);
      g.light(x, y, 30, 100, c, .8 * f); }
    if (B.size > 64) for (const u of B.keys()) if (!seen.has(u)) B.delete(u);
  },
  /* ---- particles ---- */
  burst(x, y, c, n, sp, z) { if (this.sp.length > 260) return; for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (.4 + Math.random()), up = 60 + Math.random() * 200; this.sp.push({ x, y, z: z || 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: up, t: 0, l: .45 + Math.random() * .4, c: Math.random() < .35 ? [1, 1, 1] : c }); } },
  particles(rd) {
    const g = GL3D; g.mir = Refl.chars();
    for (let i = this.sp.length - 1; i >= 0; i--) { const p = this.sp[i]; p.t += rd; if (p.t > p.l) { this.sp.splice(i, 1); continue; }
      p.vz -= 700 * rd; const x0 = p.x, y0 = p.y, z0 = p.z; p.x += p.vx * rd; p.y += p.vy * rd; p.z += p.vz * rd; if (p.z < .5) { p.z = .5; p.vz *= -.4; p.vx *= .7; p.vy *= .7; }
      const a = 1 - p.t / p.l; g.beam(x0, y0, z0, p.x, p.y, p.z, .9, .6, p.c, a, a * .6); g.glow(p.x, p.y, p.z, 3, p.c, a * .8); }
    // the dash ribbon: a fading band of light along the last dash
    const o = W3D.ho; if (o && o.dashing) { const L = this.rb[this.rb.length - 1]; if (!L || Math.hypot(L.x - o.x, L.y - o.y) > 4) this.rb.push({ x: o.x, y: o.y, t: 0 }); }
    for (let i = this.rb.length - 1; i >= 0; i--) { this.rb[i].t += rd; if (this.rb[i].t > .35) this.rb.splice(i, 1); }
    if (this.rb.length > 1) { const c = rgb3((o && (o.fx && o.fx.blade && o.fx.blade[0] === '#' ? o.fx.blade : o.ca)) || P.ca || '#00f2fe');
      for (let i = 1; i < this.rb.length; i++) { const p0 = this.rb[i - 1], p1 = this.rb[i], a0 = 1 - p0.t / .35, a1 = 1 - p1.t / .35; g.beam(p0.x, p0.y, 14, p1.x, p1.y, 14, 6 * a0, 6 * a1, c, a0 * .55, a1 * .55); g.beam(p0.x, p0.y, 14, p1.x, p1.y, 14, 2 * a0, 2 * a1, [1, 1, 1], a0 * .5, a1 * .5); } }
    g.mir = false;
  },
  weather(rd, T) {
    const g = GL3D, C = g.cam; if (!T.rain || !Q.rain || CALM) { this.rain.length = 0; return; }
    const n = Math.round(150 * T.rain * Q.rain), vw = V.VW / C.z, vh = V.VH / C.z;
    while (this.rain.length < n) this.rain.push({ x: C.x + (Math.random() - .5) * vw * 1.3, y: C.y + (Math.random() - .6) * vh * 1.5, z: Math.random() * 360 });
    if (this.rain.length > n) this.rain.length = n;
    const c = [.55, .7, .95];
    for (const d of this.rain) { d.z -= 820 * rd; d.x -= 70 * rd;
      if (d.z <= 0) { if (this.spl.length < 60 && Math.random() < .6) this.spl.push({ x: d.x, y: d.y, t: 0 }); d.x = C.x + (Math.random() - .5) * vw * 1.3; d.y = C.y + (Math.random() - .6) * vh * 1.5; d.z = 300 + Math.random() * 80; }
      g.beam(d.x, d.y, d.z, d.x + 3, d.y, d.z + 30, .8, .8, c, .34, 0); }
    for (let i = this.spl.length - 1; i >= 0; i--) { const s = this.spl[i]; s.t += rd; if (s.t > .3) { this.spl.splice(i, 1); continue; } const p = s.t / .3; g.floorRing(s.x, s.y, .4, 2 + p * 7, c, (1 - p) * .45); }
  },
  /* ---- the city around: flying cars, searchlight drones, an overpass, signs and holograms, the sky ---- */
  traffic(rd, T) {
    const g = GL3D, C = g.cam, L = V.L, R = V.R, VH = V.VH; this.t += rd;
    if (Math.random() < rd / 5 && this.cars.length < 3) { const dir = Math.random() < .5 ? 1 : -1; this.cars.push({ x: dir > 0 ? L - 420 : R + 420, y: C.y + (Math.random() - .55) * VH * .9, z: 170 + Math.random() * 110, dir, v: 220 + Math.random() * 160, c: Math.random() < .5 ? rgb3(T.b1 || '#ff0844') : rgb3(T.rail || '#00f2fe') }); }
    for (let i = this.cars.length - 1; i >= 0; i--) { const q = this.cars[i]; q.x += q.dir * q.v * rd; if (q.x < L - 480 || q.x > R + 480) { this.cars.splice(i, 1); continue; }
      const bob = Math.sin(this.t * 3 + i) * 2, z = q.z + bob, f = q.dir > 0 ? 0 : Math.PI;
      g.add('box', q.x, q.y, z, f, 34, 14, 7, [.08, .09, .14], 0, 0); g.add('box', q.x - q.dir * 2, q.y, z + 7, f, 18, 12, 5, [.12, .14, .22], .1, 0); g.add('box', q.x, q.y + 7.2, z + 2, f, 30, .6, 2, q.c, 1, 0);
      g.glow(q.x + q.dir * 18, q.y, z + 3, 7, [1, .95, .85], .9); g.glow(q.x - q.dir * 18, q.y, z + 3, 5, [1, .1, .2], .8);
      g.beam(q.x + q.dir * 18, q.y, z + 2, q.x + q.dir * 90, q.y + 30, 0, 3, 34, [.9, .9, 1], .1, 0); g.floorGlow(q.x + q.dir * 90, q.y + 30, .3, 46, [.9, .9, 1], .12);
      g.light(q.x + q.dir * 60, q.y + 20, 60, 140, [.9, .92, 1], .55); }
    // a police searchlight drone now and then, sweeping the roof (not in boss fights)
    if (!Boss.cur && Math.random() < rd / 14 && !this.drones.length) this.drones.push({ t: 0, d: 9, side: Math.random() < .5 ? -1 : 1, y: C.y - VH * .2 });
    for (let i = this.drones.length - 1; i >= 0; i--) { const q = this.drones[i]; q.t += rd; if (q.t > q.d) { this.drones.splice(i, 1); continue; }
      const e = Math.min(1, q.t, q.d - q.t), x = (L + R) / 2 + q.side * (R - L) * (.7 - .3 * e), y = q.y + Math.sin(q.t * .6) * 120, z = 260;
      const fx = (L + R) / 2 + Math.sin(q.t * .9) * (R - L) * .35, fy = y + 60 + Math.cos(q.t * .7) * 160, blink = ((this.t * 4) | 0) % 2;
      g.add('box', x, y, z, q.t, 22, 22, 6, [.1, .1, .14], 0, 0); for (const s of [-1, 1]) g.add('cyl', x + s * 14, y, z + 3, 0, 10, 10, 1.5, [.2, .2, .26], 0, 0);
      g.glow(x, y, z - 2, 6, blink ? [1, .1, .2] : [.2, .4, 1], .9);
      g.beam(x, y, z - 3, fx, fy, 0, 2, 30, [.85, .9, 1], .08 * e, .02 * e); g.floorGlow(fx, fy, .35, 42, [.85, .9, 1], .12 * e); g.light(fx, fy, 50, 130, [.85, .9, 1], .4 * e); }
    // an overpass: every so often the train runs under a bridge; the light dims as it passes
    const per = 34, ph = (this.t % per) / per; this.over = null;
    if (ph > .78) { const p = (ph - .78) / .22, y = C.y - VH * .9 + p * VH * 2.2, dist = Math.abs(y - C.y) / (VH * .6); this.over = { dim: .55 + .45 * clamp(dist, 0, 1) };
      for (const s of [-1, 1]) { const x = s < 0 ? L - 90 : R + 90; g.add('box', x, y, -80, 0, 30, 40, 400, [.1, .1, .14], 0, 0); g.add('box', s < 0 ? L - 260 : R + 260, y, 300, 0, 330, 60, 18, [.09, .09, .13], 0, 0); g.add('box', s < 0 ? L - 260 : R + 260, y + 30.5, 304, 0, 320, .6, 3, rgb3(T.rail || '#00f2fe'), 1, 0); } }
  },
  city(T) { // neon signs on the towers that face the tracks and holograms over the tallest ones
    const g = GL3D, B = W3D.city; if (!B) return; const L = V.L, R = V.R, VH = V.VH, drift = ((BG.scroll || 0) * .35) % 1800, cols = [rgb3(T.b1 || '#ff0844'), rgb3(T.b2 || '#b537f2'), rgb3(T.rail || '#00f2fe')];
    for (let i = 0; i < B.length; i++) { const b = B[i]; let y = b.y + drift; if (y > VH + 300) y -= 1800; if (b.h < 150) continue; const x = b.side < 0 ? L - 80 - b.dx : R + 80 + b.dx, c = cols[i % 3];
      const fl = (i * 7 + ((this.t * (1 + i % 3)) | 0)) % 23 === 0 ? .25 : 1;
      if (i % 2 === 0) g.add('plane', x - b.side * (b.w / 2 + .5), y, b.h - 70 - 60, b.side < 0 ? -Math.PI / 2 : Math.PI / 2, b.d * .9, 1, 26, [c[0] * fl, c[1] * fl, c[2] * fl], 1, 3 + i % 3);
      if (i % 5 === 1 && b.h > 300) { const z = b.h - 70 + 40 + Math.sin(this.t + i) * 6, w = 90, h = 30; g.holo(x, y + b.d / 2 + 4, z, w, h, c, .55 + Math.sin(this.t * 7 + i) * .1, 3 + (i % 3)); g.beam(x, y + b.d / 2, b.h - 70, x, y + b.d / 2 + 4, z - h / 2, 4, 40, c, .18, .02); } }
  },
  sky(T) { // only seen when the camera lowers: a glowing horizon, a moon and clouds that light up with the lightning
    const g = GL3D, C = g.cam; if (g.th > g.th0 - .05) return; const s2 = rgb3(T.sky2 || '#22093a'), fl = BG.flash || 0, y = C.y - 2600;
    g.beam(C.x, y, -200, C.x, y, 900, 2600, 2600, s2, .55, 0);
    g.add('sph', C.x - 500, y + 10, 820, 0, 110, 110, 110, [.95, .93, .86], 1, 0); g.glow(C.x - 500, y + 10, 875, 260, [.7, .75, 1], .35);
    for (let i = 0; i < 7; i++) g.glow(C.x - 900 + i * 300 + Math.sin(this.t * .05 + i) * 60, y + 40, 520 + (i % 3) * 90, 260, [.25 + fl, .27 + fl, .4 + fl], .12 + fl * .4);
  },
  /* ---- the hero: its own canvas for a neon rim and a reflection on the wet roof ---- */
  hero(h, f) {
    const t = this.tier(); if (t < 1) return W3D.stand(h.x, h.y, f);
    const zz = V.s * V.dpr * GL3D.cam.z, E = 110, S = Math.ceil(E * 2 * zz), q = W3D.proj(h.x, h.y, 0);
    let c = this.hc; if (!c) c = this.hc = document.createElement('canvas'); if (c.width !== S) { c.width = c.height = S; this.hg = c.getContext('2d'); }
    const hg = this.hg; hg.setTransform(1, 0, 0, 1, 0, 0); hg.clearRect(0, 0, S, S); hg.setTransform(zz, 0, 0, zz, S / 2 - zz * h.x, S / 2 - zz * (h.y + 3));
    withCtx(hg, f);
    const X = q[0] - S / 2, Y = q[1] - S / 2, col = h.ca || P.ca || '#00f2fe';
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
    if (GL3D.wet > 0 && Refl.chars()) { cx.globalAlpha = .26 * GL3D.wet; cx.globalCompositeOperation = 'lighter'; const by = q[1] + zz * 16; cx.setTransform(1, 0, 0, -.8, 0, by * 1.8); cx.drawImage(c, X, Y); cx.setTransform(1, 0, 0, 1, 0, 0); } // the reflection: flipped under the feet, a little shorter
    cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = t >= 2 ? .2 : .12; const o = 1.6 * V.dpr; for (const [dx, dy] of [[o, 0], [-o, 0], [0, o], [0, -o]]) cx.drawImage(c, X + dx, Y + dy); // neon rim
    cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1; cx.drawImage(c, X, Y); cx.restore(); void col;
  }
};
/* extra GL3D primitives used here */
GL3D.floorRing = function (x, y, z, r, col, a) { const Bf = this.bf.B; if (Bf.n + 6 >= Bf.cap) return; for (let gi = 0; gi < 6; gi++) { const G = this.GQ[gi]; this.putB(Bf, x + G[0] * r, y + G[1] * r * .9, z, col, a, .5 + G[2] * .5, G[3]); } };
GL3D.holo = function (x, y, z, w, h, col, a, reg) { // a hologram: the sign texture as light (additive), facing the camera
  const Bf = this.bf.B; if (Bf.n + 6 >= Bf.cap) return; const U = this.REG[reg], ex = this.cy, ey = -this.sy;
  const P = [[-1, -1, U[0], U[3]], [1, -1, U[1], U[3]], [1, 1, U[1], U[2]], [-1, -1, U[0], U[3]], [1, 1, U[1], U[2]], [-1, 1, U[0], U[2]]];
  for (const [px, py, u, v] of P) this.putB(Bf, x + ex * px * w / 2, y + ey * px * w / 2, z + py * h / 2, col, -a, u, v);
};
{
  // frame: setup, lights and world life before the batch is flushed
  const dr0 = W3D.draw.bind(W3D);
  W3D.draw = function (rd) {
    const T = BG.T || {}; FX3D.setup(T);
    const f0 = GL3D.flush.bind(GL3D);
    GL3D.flush = function (sky) { try { const tr = FX3D.tier(); FX3D.lights(); FX3D.spawns(); FX3D.particles(rd); if (tr >= 1) { FX3D.weather(rd, T); FX3D.traffic(rd, T); FX3D.city(T); } FX3D.sky(T); FX3D.post(); } catch (e) { console.error(e); } f0(sky); };
    try { dr0(rd); } finally { GL3D.flush = f0; }
  };
  FX3D.post = function () { // post effects that follow the action
    const PP = GL3D.P, t = this.tier(), o = W3D.ho, q = o ? W3D.proj(o.x, o.y, 12) : [cv.width / 2, cv.height / 2];
    PP.mbC = [q[0] / cv.width, 1 - q[1] / cv.height]; PP.mb = t >= 2 && o && o.dashing && !CALM ? .9 : 0; PP.haze = t >= 2 && G.odT > 0 && !CALM ? 1 : 0;
    const imp = Juice.imp ? 1 - Juice.imp.t / Juice.imp.d : 0; PP.ca = t >= 2 && !CALM ? .12 + imp * 1.2 + (P.lock > 0 ? .4 : 0) : 0;
  };
  W3D.view = fk => FX3D.view(fk);
  // the hero gets its rim and reflection
  W3D.heroStand = function (h, f) { FX3D.hero(h, f); };
  // every kill: a flash of light and sparks; every hit: a few sparks
  const ed0 = EAnim.death.bind(EAnim); EAnim.death = function (e, a) { ed0(e, a); if (W3D.live && !(REPLAY.on && REPLAY.fast)) { const c = rgb3(e.col || '#ff3b5c'); FX3D.flashes.push({ x: e.x, y: e.y, c, t: 0 }); if (FX3D.flashes.length > 6) FX3D.flashes.shift(); FX3D.burst(e.x, e.y, c, FX3D.tier() >= 2 ? 14 : 8, 160, 10); } };
  const dn1 = dmgNum; dmgNum = function (x, y, n, crit, big) { dn1(x, y, n, crit, big); if (W3D.live && !(REPLAY.on && REPLAY.fast) && FX3D.tier() >= 1) FX3D.burst(x, y + 8, crit ? [1, .85, .3] : [1, .95, .8], crit ? 6 : 3, 120, 12); };
  // enemies: no flat 2D drop shadow in 3D (the 3D layer casts one); a faint reflection on the wet roof
  const mp0 = Monster.pre.bind(Monster); Monster.pre = function (e) { if (W3D.live) return; mp0(e); };
  // every alpha the enemy art sets is scaled while its reflection draws (the art sets its own globalAlpha, so e.vis alone left the reflection almost as bright as the enemy)
  const GA = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'globalAlpha');
  FX3D.amul = function (c, m) { if (m === 1) { delete c.globalAlpha; return; } const a0 = GA.get.call(c); Object.defineProperty(c, 'globalAlpha', { configurable: true, get() { return GA.get.call(this) / m; }, set(v) { GA.set.call(this, Math.min(1, v) * m); } }); GA.set.call(c, Math.min(1, a0) * m); };
  const de2 = drawEnemy; drawEnemy = function (e) {
    if (W3D.live && cx === W3D.cx0 && !W3D.models() && GL3D.wet > 0 && Refl.chars() && FX3D.tier() >= 1 && e.alive && e.vis > .3) { const ym = e.y + e.r * (e.scale || 1) * .9;
      W3D.stand(e.x, e.y, () => { cx.translate(0, ym * 1.8); cx.scale(1, -.8); cx.globalCompositeOperation = 'lighter'; FX3D.amul(cx, .32 * GL3D.wet); EDRAW = ED_BODY; try { W3D.de0(e); } finally { FX3D.amul(cx, 1); EDRAW = 7; cx.globalCompositeOperation = 'source-over'; } }); }
    de2(e);
  };
  // 3D rain replaces the 2D rain streaks
  const br0 = BG.rain.bind(BG); BG.rain = function (dt) { if (W3D.live && FX3D.tier() >= 1) return; br0(dt); };
  // post runs after the 2D layer (ULTRA takes it in)
  Pipe.on('post', 'gl-post', () => { if (W3D.live && GL3D.ok && !R3.on) { try { GL3D.post(); } catch (e) { errLog(e); GL3D.P.on = false; } } else document.body.classList.remove('ultra3d'); }, 90);
}
/* ---- photo mode: camera angles for the 3D view (the paused scene re-renders from the chosen angle) ---- */
const PH_ANGLES = [['STANDARD', 0, 0], ['LOW ANGLE', -.34, 0], ['FROM THE LEFT', -.26, .55], ['FROM THE RIGHT', -.26, -.55], ['HIGH ANGLE', .36, 0]];
{
  const v0 = W3D.view; W3D.view = function (fk) { if (G.photo && Photo.ang) { const a = PH_ANGLES[Photo.ang]; const C = FX3D.cineV; C[0] = GL3D.th0 + a[1]; C[1] = a[2]; return C; } return v0(fk); };
  const ru0 = Photo.renderUi.bind(Photo); Photo.renderUi = function () { ru0();
    let b = $('phAng'); const row = $('phLogo') && $('phLogo').parentNode;
    if (!b && row) { b = el('button', 'chip'); b.id = 'phAng'; row.appendChild(b); b.onclick = () => { Aud.sfx('ui'); this.ang = ((this.ang | 0) + 1) % PH_ANGLES.length; this.dirty = true; this.dirtyN = 3; this.renderUi(); }; }
    if (b) { b.classList.toggle('hidden', !W3D.live); b.textContent = lt(PH_ANGLES[this.ang | 0][0]); } };
  const po0 = Photo.open.bind(Photo); Photo.open = function () { this.ang = 0; po0(); };
  const pc0 = Photo.close.bind(Photo); Photo.close = function () { this.ang = 0; pc0(); };
  const pt0 = Photo.tick.bind(Photo); Photo.tick = function (rd) { if (this.dirtyN > 0) { this.dirtyN--; this.dirty = true; } pt0(rd); }; // the new angle shows after the scene redraws
}
