/* =====================================================================
   WORLD 3D — the run drawn in 3D on GL3D (settings: GRAPHICS 2D / 3D).
   The simulation, replays, ghosts and every rule stay exactly the same;
   this only changes how the roof, the train, the city, the hero, the
   enemies, the pet and the bosses are drawn. The 2D layer keeps the
   effects, rings, numbers and the HUD, squashed onto the tilted roof.
   ===================================================================== */
const W3D = {
  /* an enemy still outside the roof is flying in: it comes down from above as it crosses the edge */
  inLift(e) { return e.y < 0 ? Math.min(110, -e.y * 1.6) : e.y > V.VH ? Math.min(110, (e.y - V.VH) * 1.6) : 0; }, zoff: 0,
  tall: { add(m, x, y, z, yaw, sx, sy, sz, col, em, reg, pitch) { GL3D.add(m, x, y, z * 1.25 + W3D.zoff, yaw, sx * 1.12, sy * 1.12, sz * 1.25, [col[0] * .82, col[1] * .82, col[2] * .82], (em || 0) * .55, reg, pitch); }, glow(x, y, z, r, c, a, ring) { GL3D.glow(x, y, z * 1.25 + W3D.zoff, r * 1.12, c, a * .5, ring); }, floorGlow() { } }, // (3D MODELS enemies: softer, so the bloom does not wash them out)
  live: false, slow: false, slowN: 0, skipHero: 0, ho: null, deb: [], city: null,
  want() { const s = Store.data && Store.data.settings; return !!(s && s.d3) && !window.__NO3D && !(navigator.webdriver && !window.__TEST3D); }, // automated test browsers check gameplay in 2D unless a test asks for 3D
  /* GRAPHICS 3D: solid 3D models (the hero and the pet keep their own animated art, standing); 3D ART: every character's drawing stands on the 3D roof */
  models() { const s = Store.data && Store.data.settings; return !!(s && (s.d3 === 1 || s.d3 === 2)); }, // (v32: 3D means real models; 3 = 3D ART, the standing drawings; 2 was 3D MODELS before)
  /* draw a top-down sprite upright: undo the roof tilt around its feet */
  stand(x, y, f, lift) { const K = GL3D.k, c = GL3D.cy, s = GL3D.sy; cx.save(); cx.translate(x, y); cx.transform(c, -s, s / K, c / K, 0, 0); cx.translate(-x, -y - (lift == null ? 3 : lift)); try { f(); } finally { cx.restore(); } }, // undo the roof's tilt and turn around the feet (relative, so cut halves keep their own motion)
  cx0: cx, heroStand(h, f) { this.stand(h.x, h.y, f); },
  /* the boss art stands up like the other characters; its breakable parts (and a serpent's body) are moved, for this drawing only,
     to where the tilted roof really shows them, so what you see is exactly what you can hit */
  standBoss(b, f) {
    const K = GL3D.k, c = GL3D.cy, s = GL3D.sy, bx = b.x, by = b.y, keep = [];
    const at = o => { const dx = o.x - bx, dy = o.y - by; keep.push(o, o.x, o.y); o.x = bx + dx * c - dy * s; o.y = by + (dx * s + dy * c) * K; };
    try { for (const p of b.parts || []) at(p); if (Array.isArray(b.seg)) for (const q of b.seg) at(q); this.stand(bx, by, f, 0); }
    finally { for (let i = 0; i < keep.length; i += 3) { keep[i].x = keep[i + 1]; keep[i].y = keep[i + 2]; } }
  },
  heroShadow() { const g = GL3D, o = this.ho; if (o) { g.add('cyl', o.x + 3, o.y + 5, .15, 0, 22, 14, .2, [.01, .01, .03], 0, 0); g.floorGlow(o.x, o.y, .3, 30, rgb3(o.ca || P.ca || '#00f2fe'), .3); } if (G.pet && G.pet !== 'none' && G.mode !== 'puzzle') g.add('cyl', Pet.x + 2, Pet.y + 4, .12, 0, 14, 9, .2, [.01, .01, .03], 0, 0); },
  shadows() { const g = GL3D, SH = [.035, .04, .09], skip = this.models() && g.P && g.P.sm; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (skip || !e.alive || e.vis < .2 || e.y < 0 || e.y > V.VH || (e.alt || 0) > .35) continue; const r = Math.max(4, e.r * (e.scale || 1)) * .85; g.add('cyl', e.x + r * .25, e.y + r * .35, .12, 0, r * 2.1, r * 1.35, .2, SH, 0, 0); }
    const b = Boss.cur; if (b && !(b.dying > 1.6)) { g.add('cyl', b.x + b.r * .25, b.y + b.r * .4, .1, 0, b.r * 2.2, b.r * 1.5, .2, [.035, .04, .09], 0, 0); g.floorGlow(b.x, b.y, .3, b.r * 2.2, rgb3((BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844'), .22); }
    const o = this.ho; if (o) { g.add('cyl', o.x + 3, o.y + 5, .15, 0, 20, 12, .2, [.035, .04, .09], 0, 0); g.floorGlow(o.x, o.y, .3, 34, rgb3(o.ca || P.ca || '#00f2fe'), .38); }
    if (G.pet && G.pet !== 'none' && G.mode !== 'puzzle') g.add('cyl', Pet.x + 2, Pet.y + 4, .12, 0, 12, 8, .2, [.035, .04, .09], 0, 0); },
  active() {
    return this.want() && !this.slow && !(typeof Power !== 'undefined' && Power.on()) && !CALM_3D() && inRun() && !(REPLAY.on && REPLAY.fast) && G.mode !== 'highway' && G.mode !== 'puzzle' && G.mode !== 'dojo' && !G.photoLock && (GL3D.ok || GL3D.init());
  },
  /* a replay letterboxes the recorded arena: the screen offset of that box, in css pixels */
  lb() { return REPLAY.on && !REPLAY.fast ? [REPLAY.ox || 0, REPLAY.oy || 0] : [0, 0]; },
  k() { return this.live ? GL3D.k : 1; },
  offY() { return this.live ? V.VH / 2 * (1 - GL3D.k) * .45 : 0; }, // (the tilted roof sits between the HUD and the skill buttons: less empty sky above, the hero clear of the buttons below)
  /* screen point (game units) to roof point, for touch aiming */
  unproj(sx, sy) { if (!this.live) return [sx, sy]; const C = GL3D.cam, o = this.lb(); sx -= o[0] / V.s; sy -= o[1] / V.s; const rx = (sx - V.VW / 2) / C.z, ry = (sy - V.VH / 2 - this.offY()) / (C.z * GL3D.k), c = GL3D.cy, s = GL3D.sy; return [C.x + rx * c + ry * s, C.y - rx * s + ry * c]; },
  /* roof point to canvas pixels (for effects drawn in screen space) */
  proj(x, y, h) { const k = V.s * V.dpr; if (!this.live) return [x * k, y * k]; const C = GL3D.cam, dx = x - C.x, dy = y - C.y, c = GL3D.cy, s = GL3D.sy, rx = dx * c - dy * s, ry = dx * s + dy * c;
    const o = this.lb(); return [(V.VW / 2 + rx * C.z) * k + o[0] * V.dpr, (V.VH / 2 + this.offY() + (ry * GL3D.k - (h || 0) * GL3D.s) * C.z) * k + o[1] * V.dpr]; },
  /* the flat roof transform for 2D effects drawn in world units */
  flatT(k) { if (!this.live) return cx.setTransform(k, 0, 0, k, 0, 0); const C = GL3D.cam, K = GL3D.k, c = GL3D.cy, s = GL3D.sy, z = C.z * k;
    const o = this.lb(); cx.setTransform(z * c, z * K * s, -z * s, z * K * c, k * (V.VW / 2 + C.z * (-C.x * c + C.y * s)) + o[0] * V.dpr, k * (V.VH / 2 + this.offY() + C.z * K * (-C.x * s - C.y * c)) + o[1] * V.dpr); },
  camera() { // the same framing as the 2D view (finisher zoom, aim zoom, shake)
    const fk = CAM.fin > 0 ? Math.sin(clamp(Math.min((CAM.finD - CAM.fin) / .35, CAM.fin / .5), 0, 1) * 1.5708) : 0;
    const z = 1 + CAM.zoom + fk * .2, // (v32: no zoom while aiming, a gentler finisher zoom)
      hw = V.VW / (2 * z), hh = V.VH / (2 * z);
    const fx = clamp(V.VW / 2 + (CAM.fx - V.VW / 2) * fk * .65, hw, V.VW - hw), fy = clamp(V.VH / 2 + (CAM.fy - V.VH / 2) * fk * .65, hh, V.VH - hh);
    const v = this.view ? this.view(fk) : null; if (v) GL3D.setView(v[0], v[1]); else GL3D.setView(GL3D.th0, 0);
    const C = GL3D.cam; C.x = fx - CAM.ox; C.y = fy - CAM.oy; C.z = z; C.offY = this.offY();
  },
  /* ---------------- the world ---------------- */
  buildCity() {
    const B = []; let seed = 7;
    for (let i = 0; i < 70; i++) { const side = i % 2 ? 1 : -1, r1 = cmRand(seed++), r2 = cmRand(seed++), r3 = cmRand(seed++);
      B.push({ side, dx: 30 + r1 * 260, y: -900 + i * 26 + r2 * 20, w: 40 + r3 * 70, d: 40 + r1 * 60, h: 60 + Math.pow(r2, 1.6) * 420, win: r3 > .25, col: r1 > .7 ? 1 : 0 }); }
    this.city = B;
  },
  world(T) {
    const g = GL3D, L = V.L, R = V.R, VH = V.VH, sc = BG.scroll || 0, roof = rgb3(T.roof || '#0b0f22'), rail = rgb3(T.rail || '#00f2fe'), b1 = rgb3(T.b1 || '#ff0844'), b2 = rgb3(T.b2 || '#b537f2');
    const W = R - L, cx0 = (L + R) / 2, carH = 70;
    // the train: this car and the next one ahead, with a gap between them
    for (const [y0, y1] of [[-8, VH + 260]]) { // one car: the roof ends at the front of the arena (nothing ahead that you cannot reach)
      const yc = (y0 + y1) / 2, len = y1 - y0;
      g.add('box', cx0, yc, -carH, 0, W + 8, len, carH - 1, [.05, .06, .11], 0, 0); // the car body
      const rl = roof[0] * .3 + roof[1] * .55 + roof[2] * .15, rk = 2.6 - 1.9 * Math.min(1, rl * 2.2), rc = [Math.min(.82, roof[0] * rk + .1), Math.min(.82, roof[1] * rk + .1), Math.min(.85, roof[2] * rk + .14)] /* bright worlds keep their roof from washing out */, TL = 96, ph = ((sc % TL) + TL) % TL;
      for (let ty = y0 - TL + ph; ty < y1; ty += TL) { const a0 = Math.max(y0, ty), a1 = Math.min(y1, ty + TL); if (a1 - a0 < 2) continue; g.tgt = g.wet > 0 ? 'T' : 'A'; g.add('box', cx0, (a0 + a1) / 2, -.5, 0, W, a1 - a0, .5, rc, 0, 2); g.tgt = 'A'; } // textured roof plates (translucent when wet: the reflections show through)
      g.mir = true;
      for (const sd of [-1, 1]) for (let ty = y0 + ((sc * 1) % 120 + 120) % 120; ty < y1; ty += 120) g.floorGlow(cx0 + sd * (W / 2 - 14), ty, .2, 26, rail, .22); // rail light spill
      for (const sd of [-1, 1]) { // rails along the roof edges and a window band on the car sides
        g.add('box', cx0 + sd * (W / 2 - 2), yc, 0, 0, 4, len, 3, rail, .9, 0);
        g.add('box', cx0 + sd * (W / 2 + 4.2), yc, -carH * .55, 0, .6, len, carH * .3, [.8, .85, 1], .55, 1);
      }
      // roof panels and vents, scrolling with the train
      for (let k = 0; k * 96 < len + 96; k++) { const py = y0 + ((k * 96 + sc) % (len + 96)); if (py < y0 + 6 || py > y1 - 6) continue;
        g.add('box', cx0, py, 0, 0, W, 2, .9, [.02, .03, .06], 0, 0);
        if (k % 3 === 0) { g.add('box', L + W * .18, py + 40, 0, 0, 26, 16, 6, [.12, .14, .22], 0, 0); g.add('box', L + W * .18, py + 40, 6, 0, 22, 2, .6, rail, .6, 0); }
        if (k % 4 === 2) { g.add('cyl', R - W * .16, py + 30, 0, 0, 14, 14, 8, [.15, .17, .26], 0, 0); g.glow(R - W * .16, py + 30, 10, 8, b1, .5); } }
      g.mir = false;
    }
    // the track bed and the city beside and ahead
    // the front of the car: a raised edge with a neon rail, so the end of the play area is plain to see
    g.add('box', cx0, -10, -carH, 0, W + 8, 6, carH + 6, [.06, .07, .12], 0, 0); g.mir = true; g.add('box', cx0, -10, 6, 0, W + 8, 4, 3, rail, .9, 0); g.mir = false;
    for (let i = 0; i < 7; i++) g.glow(L + (i + .5) * W / 7, -10, 8, 10, rail, .35);
    // the track bed, the sleepers and the city are static layers: built once per world and size, then only moved
    const key = (BG.theme || '') + '|' + Math.round(L) + '|' + Math.round(R) + '|' + Math.round(VH);
    g.layer('track', key, () => { for (const sd of [-1, 1]) { const x = sd < 0 ? L - 40 : R + 40;
      g.add('box', x, VH / 2 - 200, -carH - 10, 0, 70, VH + 1400, 10, [.03, .03, .05], 0, 0);
      g.add('box', x - 14, VH / 2 - 200, -carH + 1, 0, 3, VH + 1400, 3, rail, .5, 0); g.add('box', x + 14, VH / 2 - 200, -carH + 1, 0, 3, VH + 1400, 3, rail, .5, 0); } });
    g.layer('sleepers', key, () => { for (const sd of [-1, 1]) { const x = sd < 0 ? L - 40 : R + 40; for (let k = 0; k < 40; k++) g.add('box', x, -700 + k * 40, -carH - 2, 0, 60, 8, 3, [.09, .08, .1], 0, 0); } });
    if (!this.city) this.buildCity();
    g.layer('city', key, () => { for (const b of this.city) { const x = b.side < 0 ? L - 80 - b.dx : R + 80 + b.dx, col = b.col ? b2 : [.07, .08, .14];
      g.add('box', x, b.y, -carH - 240, 0, b.w, b.d, b.h + 240, b.col ? [col[0] * .3, col[1] * .3, col[2] * .3] : col, b.win ? .55 : .1, b.win ? 1 : 0); } });
    g.drawLayer('track', 0, 0); const so = ((sc * 1.4) % 1600 + 1600) % 1600; g.drawLayer('sleepers', 0, so); g.drawLayer('sleepers', 0, so - 1600);
    const drift = ((sc * .35) % 1800 + 1800) % 1800; for (const o of [-1800, 0, 1800]) g.drawLayer('city', 0, drift + o);
    for (const b of this.city) { if (b.h <= 260) continue; let y = b.y + drift; if (y > VH + 300) y -= 1800; g.glow(b.side < 0 ? L - 80 - b.dx : R + 80 + b.dx, y, b.h - carH, 10, b1, .5); }
  },
  /* ---------------- the hero ---------------- */
  hero(o) {
    const g = GL3D; if (!o) return; const a = rgb3(o.ca || P.ca || '#00f2fe'), b = rgb3(o.cb || P.cb || '#ff0844'), x = o.x, y = o.y, f = o.face != null ? o.face : -Math.PI / 2;
    const dash = !!o.dashing, ph = (P.walkPh || 0), step = Math.sin(ph) * (P.spd > 30 && !dash ? 1 : 0), lean = dash ? .45 : 0, sx = dash ? 1.25 : 1;
    const cf = Math.cos(f), sf = Math.sin(f), px = -sf, py = cf, dark = [.08, .09, .16], body = [a[0] * .25 + .05, a[1] * .25 + .05, a[2] * .25 + .08];
    const flick = o.alpha != null && o.alpha < .5; if (flick && ((CAM.t * 20) | 0) % 2) return;
    g.add('cyl', x + 3, y + 5, .15, 0, 22, 14, .2, [.01, .01, .03], 0, 0); // contact shadow
    for (const sd of [-1, 1]) { const st = step * sd * 6; g.add('box', x + px * sd * 4 + cf * st, y + py * sd * 4 + sf * st, 0, f, 5.5, 5, 14, dark, 0, 0); g.add('box', x + px * sd * 4 + cf * (st + 1.5), y + py * sd * 4 + sf * (st + 1.5), 0, f, 7, 5.5, 3, b, .2, 0); } // legs and boots
    const tz = 14; g.add('box', x - cf * lean * 4, y - sf * lean * 4, tz, f, 9 * sx, 13, 15, body, 0, 0, lean); // torso
    g.add('box', x - cf * lean * 4, y - sf * lean * 4, tz + 8, f, 9.4 * sx, 13.6, 3, a, .45, 0); // chest light
    for (const sd of [-1, 1]) g.add('sph', x + px * sd * 8, y + py * sd * 8, tz + 10, f, 6, 6, 6, [body[0] * 1.4, body[1] * 1.4, body[2] * 1.4], 0, 0); // shoulders
    const hz = tz + 15; g.add('sph', x + cf * lean * 4, y + sf * lean * 4, hz, f, 12, 12, 12, dark, 0, 0); // head
    g.add('box', x + cf * (5 + lean * 4), y + sf * (5 + lean * 4), hz + 5, f, 2.6, 9, 2.6, a, 1, 0); g.glow(x + cf * 6, y + sf * 6, hz + 6, 9, a, .55); // visor
    // headgear by body type
    const bd = P.skin && P.skin.body, kind = (typeof BUST_KIND !== 'undefined' && BUST_KIND[bd]) || 'hood';
    if (kind === 'kasa') g.add('cone', x, y, hz + 6, 0, 22, 22, 6, [.8, .62, .35], 0, 0);
    else if (kind === 'oni' || kind === 'dragon' || kind === 'viking' || kind === 'raijin' || kind === 'yeti') for (const sd of [-1, 1]) g.add('cone', x + px * sd * 4, y + py * sd * 4, hz + 6, 0, 3, 3, 7, kind === 'dragon' ? a : [.95, .9, .8], kind === 'dragon' ? .6 : 0, 0);
    else if (kind === 'ears' || kind === 'fox' || kind === 'wolf') for (const sd of [-1, 1]) g.add('tri', x + px * sd * 3.5, y + py * sd * 3.5, hz + 6, f, 4, 4, 6, kind === 'fox' ? [1, 1, 1] : a, .2, 0);
    else if (kind === 'crown' || kind === 'kabuto') g.add('frustum', x, y, hz + 7, 0, 10, 10, 4, [1, .82, .25], .6, 0);
    else if (kind === 'seraph') g.glow(x, y, hz + 12, 9, [1, .9, .5], .7, true);
    else if (kind === 'witch') g.add('cone', x, y, hz + 6, 0, 12, 12, 14, b, 0, 0);
    else g.add('sph', x - cf * 1, y - sf * 1, hz + 2, f, 10, 10, 8, [a[0] * .2, a[1] * .2, a[2] * .25], 0, 0); // a hood
    // scarf: two trailing strips
    for (let i = 1; i <= 5; i++) { const w = Math.sin(CAM.t * 9 + i) * 1.8 * i * .4; g.add('box', x - cf * (5 + i * 5) + px * w, y - sf * (5 + i * 5) + py * w, hz - 2 - i * .9, f, 5, 4, 2, b, .4, 0); }
    // the blade: from the hand outward along the blade angle, glowing
    const bl = o.blade != null ? o.blade : f + 1.8, L = (o.bl || 40) * 1.05, hx = x + Math.cos(bl) * 9, hy = y + Math.sin(bl) * 9, hzz = tz + 9;
    const fx = o.fx || P.fx || {}, bc = rgb3(fx.blade && fx.blade[0] === '#' ? fx.blade : (o.ca || P.ca || '#00f2fe'));
    g.add('box', hx + Math.cos(bl) * L / 2, hy + Math.sin(bl) * L / 2, hzz, bl + Math.PI / 2, 2.4, L, 2, [Math.min(1, bc[0] * .6 + .4), Math.min(1, bc[1] * .6 + .4), Math.min(1, bc[2] * .6 + .4)], 1, 0);
    g.add('box', hx, hy, hzz - .6, bl + Math.PI / 2, 5, 2, 2.6, [.9, .75, .3], .3, 0); // guard
    for (let i = 1; i <= 4; i++) g.glow(hx + Math.cos(bl) * L * i / 4, hy + Math.sin(bl) * L * i / 4, hzz + 1, 6 + (dash ? 4 : 0), bc, dash ? .55 : .3);
    g.floorGlow(x, y, .3, 30, a, .3); if (G.odT > 0) g.glow(x, y, 14, 34, [1, .8, .2], .45);
  },
  /* ---------------- the enemies ---------------- */
  enemy(e) {
    if (!e.alive || e.vis < .2) return; W3D.zoff = W3D.inLift(e); const g = W3D.tall, T = ET, r = Math.max(4, e.r * (e.scale || 1)), x = e.x, y = e.y, an = e.ang || 0, fl = e.fl > .3;
    let c = rgb3(e.al > 0 ? '#00f2fe' : (e.col || '#ff3b5c')); if (fl) c = [1, 1, 1]; const dk = [c[0] * .22, c[1] * .22, c[2] * .22], em = fl ? .7 : .12; // (low glow: the bloom adds the rest)
    const bob = Math.sin((e.t || 0) * 4 + (e.uid | 0)) * 1.5, t = e.type; 
    g.add('cyl', x + r * .3, y + r * .5, .12, 0, r * 2.4, r * 1.6, .2, [.01, .01, .03], 0, 0);
    if (t === T.DRONE || t === T.MINI) { g.add('pent', x, y, 6 + bob, an, r * 1.8, r * 1.8, r * .6, c, em, 0); g.add('sph', x + Math.cos(an) * r * .3, y + Math.sin(an) * r * .3, 8 + bob, an, r * .7, r * .7, r * .5, [.03, .03, .06], 0, 0);
      g.glow(x + Math.cos(an) * r * .5, y + Math.sin(an) * r * .5, 10 + bob, 5, [1, .1, .25], .7);
      for (let l = -1; l <= 1; l++) for (const sd of [-1, 1]) { const la = an + Math.PI / 2 * sd + l * .5 + Math.sin((e.t || 0) * 14 + l) * .15; g.add('box', x + Math.cos(la) * r * .9, y + Math.sin(la) * r * .9, 2, la, r * 1.1, 1.2, 1.2, dk, 0, 0, .5); } }
    else if (t === T.SNIPER) { g.add('tri', x, y, 0, an, r * 2, r * 2, r * 1.4, c, em, 0); g.add('box', x + Math.cos(an) * r, y + Math.sin(an) * r, r * .9, an + Math.PI / 2, 2.4, r * 2, 2.4, [.2, .12, .05], 0, 0); g.glow(x + Math.cos(an) * r * 2, y + Math.sin(an) * r * 2, r, 6, [1, .6, .2], .8); }
    else if (t === T.BRUTE || t === T.ENFORCER) { g.add('hex', x, y, 0, (e.t || 0) * .6, r * 2.1, r * 2.1, r * 1.3, dk, 0, 0); g.add('hex', x, y, r * 1.3, (e.t || 0) * .6, r * 1.6, r * 1.6, r * .4, c, em, 0);
      for (const sd of [-1, 1]) g.add('box', x + Math.cos(an + sd * 1.57) * r, y + Math.sin(an + sd * 1.57) * r, r * .8, an, r * .8, r * .6, r * .6, c, em * .6, 0); }
    else if (t === T.BOMBER) { g.add('sph', x, y, 1 + bob, 0, r * 2, r * 2, r * 2, (e.fuse > 0 && ((e.fuse * 14) | 0) % 2) ? [1, .95, .8] : c, (e.fuse > 0 && ((e.fuse * 14) | 0) % 2) ? .6 : em, 0);
      for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + (e.t || 0); g.add('cone', x + Math.cos(a) * r, y + Math.sin(a) * r, r + bob, 0, 3, 3, 5, [1, .84, 0], .5, 0); } g.glow(x, y, r * 2.2, 6, [1, .6, .1], .8); }
    else if (t === T.WEAVER) { g.add('box', x, y, 8 + bob, an + .785, r * 1.4, r * 1.4, r * 1.2, c, em, 0); for (let k = 0; k < 3; k++) { const a = (e.t || 0) * 5 + k * TAU / 3; g.glow(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8), 12 + bob, 4, [1, 1, 1], .9); } }
    else if (t === T.PHANTOM || t === T.WRAITH) { g.add('cone', x, y, 4 + bob * 2, an, r * 1.8, r * 1.8, r * 2.6, c, .3, 0); g.glow(x, y, 10 + bob, r * 2, c, .2); g.glow(x + Math.cos(an) * r * .4, y + Math.sin(an) * r * .4, r * 1.6, 4, [1, 1, 1], .9); }
    else if (t === T.WARDEN) { g.add('hex', x, y, 0, an, r * 2, r * 2, r * 1.4, dk, 0, 0); g.add('sph', x, y, r * 1.2, 0, r * 1.2, r * 1.2, r * 1.2, c, em, 0); g.glow(x, y, r, r * 2.6, [.3, .5, 1], .35, true); }
    else if (t === T.MEDIC) { g.add('box', x, y, 0, an, r * 1.8, r * 1.8, r * 1.4, [.6, .66, .7], 0, 0); g.add('box', x, y, r * 1.4, 0, r * 1.4, r * .4, .6, [0, 1, .5], .6, 0); g.add('box', x, y, r * 1.4, 0, r * .4, r * 1.4, .6, [0, 1, .5], .6, 0); }
    else if (t === T.MIRROR) { g.add('box', x, y, 0, an + 1.57, r * 2.4, r * .7, r * 2.6, [.12, .14, .2], 0, 0); g.add('box', x + Math.cos(an) * r * .42, y + Math.sin(an) * r * .42, r * .2, an + 1.57, r * 2, 1, r * 2.2, [.6, .8, 1], .35, 0); // a dark frame holding a bright pane
      g.glow(x + Math.cos(an) * r * .5, y + Math.sin(an) * r * .5, r * 1.3, r * .9, [.7, .9, 1], .25); }
    else if (t === T.SPIDER) { g.add('sph', x, y, 4, an, r * 2, r * 2, r * 1.4, [c[0] * .55, c[1] * .55, c[2] * .55], em * .5, 0); g.add('sph', x, y, r * 1.2, an, r * 1.1, r * 1.1, r * .5, c, em, 0); for (let k = 0; k < 8; k++) { const la = an + (k - 3.5) * .55 + Math.sin((e.t || 0) * 10 + k) * .12; g.add('box', x + Math.cos(la) * r * 1.3, y + Math.sin(la) * r * 1.3, 3, la, r * 1.6, 2, 2, dk, 0, 0, .4); } g.glow(x + Math.cos(an) * r, y + Math.sin(an) * r, r, 5, [1, .1, .2], .8); }
    else if (t === T.TREASURE) { g.add('box', x, y, 6 + bob, (e.t || 0) * 3, r * 1.4, r * 1.4, r * 1.4, [1, .82, .2], .35, 0); g.glow(x, y, 10, r * 2.4, [1, .8, .2], .25); }
    else if (t === T.MINER) { g.add('cyl', x, y, 0, an, r * 1.8, r * 1.8, r * 1.2, c, em, 0); g.add('cone', x + Math.cos(an) * r, y + Math.sin(an) * r, r * .6, 0, r * .8, r * .8, r, [.8, .8, .85], 0, 0); }
    else if (t === T.DUMMY) { g.add('cyl', x, y, 0, 0, 4, 4, r * 1.4, [.5, .4, .3], 0, 0); g.add('sph', x, y, r * 1.3, 0, r * 1.4, r * 1.4, r * 1.4, c, em, 0); }
    else if (t === T.SPLITTER) { for (const sd of [-1, 1]) g.add('sph', x + Math.cos(an + 1.57) * r * .45 * sd, y + Math.sin(an + 1.57) * r * .45 * sd, 2 + bob, an, r * 1.25, r * 1.25, r * 1.4, c, em, 0); // two halves held together by a dark seam
      g.add('box', x, y, r * .8 + bob, an, r * 1.4, 2, r * 1.2, dk, 0, 0); g.add('sph', x + Math.cos(an) * r * .7, y + Math.sin(an) * r * .7, r * .9 + bob, an, r * .5, r * .5, r * .5, [.03, .03, .06], 0, 0); }
    else if (t === T.COURIER) { g.add('box', x, y, 2, an, r * 2.2, r * 1.5, r * 1.1, dk, 0, 0); g.add('box', x, y, r * 1.1, an, r * 1.6, r * 1.2, r * .9, c, em, 0); // a cargo carrier with a gold crate
      g.add('box', x, y, r * 1.5, an, r * 1.65, 2.5, r * .2, [.2, .14, 0], 0, 0); g.glow(x - Math.cos(an) * r * 1.2, y - Math.sin(an) * r * 1.2, r * .6, 7, [1, .7, .2], .7); }
    else if (t === T.CLONE) { g.add('sph', x, y, 2 + bob, an, r * 1.9, r * 1.9, r * 2, [.08, .03, .14], 0, 0); g.glow(x, y, r, r * 1.8, c, .35); // a dark shadow with violet eyes
      for (const sd of [-1, 1]) g.glow(x + Math.cos(an) * r * .6 + Math.cos(an + 1.57) * r * .3 * sd, y + Math.sin(an) * r * .6 + Math.sin(an + 1.57) * r * .3 * sd, r * 1.2 + bob, 3, [.85, .6, 1], .9); }
    else if (t === T.MIMIC) { const o = Math.max(0, Math.sin((e.t || 0) * 5)) * .5; g.add('box', x, y, 0, an, r * 1.9, r * 1.6, r * .9, c, em, 0); // a chest whose lid snaps open
      g.add('box', x, y, r * .95, an, r * 1.9, r * 1.6, r * .5, [c[0] * .7, c[1] * .7, c[2] * .7], em, 0, o); for (let k = -1; k <= 1; k++) g.add('cone', x + Math.cos(an) * r * .7 + Math.cos(an + 1.57) * k * r * .5, y + Math.sin(an) * r * .7 + Math.sin(an + 1.57) * k * r * .5, r * .9, 0, 2.5, 2.5, 4, [1, 1, 1], .3, 0); }
    else { g.add('sph', x, y, 2 + bob, an, r * 2, r * 2, r * 2, c, em, 0); g.add('sph', x + Math.cos(an) * r * .75, y + Math.sin(an) * r * .75, r + bob, an, r * .55, r * .55, r * .55, [.03, .03, .06], 0, 0); g.glow(x, y, r * 1.5, r * 1.6, c, .2); }
    if (e.elite) g.glow(x, y, r * 2.4, r + 8, [1, .82, .25], .55, true);
  },
  /* ---------------- the boss ---------------- */
  boss(b) {
    if (!b || b.dying > 1.6) return; const g = GL3D, col = rgb3((BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844'), r = b.r, x = b.x, y = b.y, t = b.t || CAM.t;
    const fl = b._fl > .06, dk = [col[0] * .18 + .03, col[1] * .18 + .03, col[2] * .18 + .05], h = (b.id.length * 7) % 4, shape = ['hex', 'pent', 'cyl', 'box'][h];
    const sink = b.dying > 0 ? (1 - b.dying / 1.6) * r : 0, ent = clamp(b.enter == null ? 1 : b.enter, 0, 1);
    g.floorGlow(x, y, .4, r * 2.4, col, .25);
    g.add(shape, x, y, -sink + (1 - ent) * 200, t * .3, r * 2.1, r * 2.1, r * 1.1, fl ? [1, 1, 1] : dk, fl ? 1 : 0, 0);
    g.add(shape, x, y, r * 1.1 - sink + (1 - ent) * 200, t * .3, r * 1.6, r * 1.6, r * .3, col, .6, 0);
    g.add('sph', x, y, r * 1.2 - sink + (1 - ent) * 200, 0, r * .9, r * .9, r * .9, col, 1, 0); g.glow(x, y, r * 1.6, r * 1.3, col, .7);
    for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + t * .3; g.add('cone', x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95, r * .7 - sink, 0, r * .25, r * .25, r * .7, dk, 0, 0); }
    for (const p of b.parts) if (p.alive) { const pr = p.r || 14; g.add('cyl', p.x, p.y, 6, 0, pr * 1.9, pr * 1.9, pr * 1.2, dk, 0, 0); g.add('sph', p.x, p.y, pr * 1.2 + 4, 0, pr * 1.2, pr * 1.2, pr * 1.2, (p.fl || 0) > .3 ? [1, 1, 1] : col, .9, 0); g.glow(p.x, p.y, pr * 1.6, pr * 1.4, col, .5); }
  },
  pet() { if (!G.pet || G.pet === 'none' || G.mode === 'puzzle') return; const p = PET_BY_ID[G.pet], c = rgb3((p && p.col) || '#ffd23f'), x = Pet.x, y = Pet.y, z = 16 + Math.sin(CAM.t * 3) * 3;
    GL3D.add('cyl', x + 2, y + 4, .12, 0, 14, 9, .2, [.01, .01, .03], 0, 0); GL3D.add('sph', x, y, z, Pet.ang || 0, 10, 10, 9, c, .35, 0); GL3D.glow(x, y, z + 6, 5, [1, 1, 1], .8); GL3D.glow(x, y, z + 4, 14, c, .35); },
  props() { // simple 3D bodies under the arena things that the 2D layer draws on top
    const g = GL3D, A = Arena;
    for (const t of A.turrets || []) { g.add('hex', t.x, t.y, 0, 0, 30, 30, 12, [.16, .17, .24], 0, 0); g.add('cyl', t.x, t.y, 12, 0, 18, 18, 10, t.hacked ? [0, .6, .4] : [.5, .12, .18], .4, 0); }
    for (const b of A.barrels || []) if (b.alive !== false) { const r = (b.r || 14) * 2; g.add('cyl', b.x, b.y, 0, 0, r, r, 30, [.75, .16, .1], .1, 0); g.add('cyl', b.x, b.y, 10, 0, r * 1.04, r * 1.04, 3, [1, .8, .2], .7, 0); g.add('cyl', b.x, b.y, 30, 0, r * .9, r * .9, 1, [.3, .06, .04], 0, 0); }
    for (const n of A.nodes || []) if (n.alive) { g.add('hex', n.x, n.y, 0, 0, 26, 26, 8, [.12, .14, .22], 0, 0); g.add('cone', n.x, n.y, 8, CAM.t, 18, 18, 40, [.2, .9, 1], .7, 0); g.glow(n.x, n.y, 18, 22, [.2, .9, 1], .4); }
    for (const t of A.terms || []) { g.add('box', t.x, t.y, 0, 0, 24, 16, 26, [.16, .18, .26], 0, 0); g.add('box', t.x, t.y + 8.2, 10, 0, 18, .6, 12, t.done ? [0, .8, .5] : [.9, .7, .1], .9, 0); }
  },
  debris(e) { // a cut-down enemy breaks into tumbling chunks
    if (this.deb.length > 90) return; const c = rgb3(e.col || '#ff3b5c'), n = 6;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + cmRand((e.uid | 0) + i) * .6, sp = 60 + cmRand(i * 7 + (e.uid | 0)) * 120; this.deb.push({ x: e.x, y: e.y, z: 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 120 + cmRand(i + 3) * 120, t: 0, s: 3 + cmRand(i * 3) * (e.r || 10) * .35, c, rot: a }); }
  },
  drawDebris(rd) {
    const g = GL3D; for (let i = this.deb.length - 1; i >= 0; i--) { const d = this.deb[i]; d.t += rd; if (d.t > 1.1) { this.deb.splice(i, 1); continue; }
      d.vz -= 520 * rd; d.x += d.vx * rd; d.y += d.vy * rd; d.z = Math.max(0, d.z + d.vz * rd); if (d.z === 0) { d.vz *= -.35; d.vx *= .6; d.vy *= .6; }
      g.add('box', d.x, d.y, d.z, d.rot + d.t * 9, d.s, d.s, d.s, d.c, .4 * (1 - d.t), 0); }
  },
  draw(rd) {
    const T = BG.T || {}; GL3D.begin(); this.camera();
    this.world(T); this.props();
    if (this.models()) { for (let i = 0; i < EN.n; i++) this.enemy(EN.a[i]); this.boss(Boss.cur); this.heroShadow(); } else this.shadows();
    this.drawDebris(rd);
    const s0 = rgb3(T.sky1 || '#0b1030'); GL3D.flush(s0);
  }
};
function CALM_3D() { return false; }
{
  // render: the GL layer first, then the 2D layer on a clear canvas
  // a phone that cannot hold 30 fps in 3D even at the lowest quality drops to 2D for this session
  const gv0 = governor; governor = function (rd) { gv0(rd); if (W3D.live && Q.n === 0 && Q.fps) { if (Q.lvl === 0 && Q.fps < 30) { if (++W3D.slowN >= 3) { W3D.slow = true; try { FX.call(lt('3D OFF FOR SPEED'), '#7df9ff', 1, 15); } catch (e) { errLog(e); } } } else W3D.slowN = 0; } };
  // in 3D the quality steps take resolution from the GL layer first, so the 2D layer (numbers, text, rings) stays sharp
  const sq0 = setQuality; setQuality = function (l) { sq0(l); if (W3D.live && Q.dprCap < 1.5 && !resK()) { Q.dprCap = 1.5; applyDpr(); } };
  Pipe.on('pre', 'world-3d', rd => {
    const on = W3D.active();
    if (on !== W3D.live) { W3D.live = on; if (GL3D.cv) GL3D.cv.style.display = on ? 'block' : 'none'; document.body.classList.toggle('mode3d', on); Q.applied = 0; setQuality(Q.lvl); }
    if (on) { try { W3D.draw(rd); } catch (e) { errLog(e); } cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); }
  }, 10);
  // in 3D the 2D layer skips what the 3D layer draws
  const bg0 = BG.draw.bind(BG); BG.draw = function (arena) { if (W3D.live && arena) return; bg0(arena); };
  const de0 = drawEnemy; W3D.de0 = de0; drawEnemy = function (e) {
    if (!W3D.live || cx !== W3D.cx0 || EDRAW !== 7) return de0(e);
    try { EDRAW = W3D.models() ? ED_LABEL : ED_BODY | ED_LABEL; W3D.stand(e.x, e.y, () => de0(e), 3 + W3D.inLift(e)); // the body (and its labels) stand up; in 3D MODELS the 3D layer draws the body
      EDRAW = ED_FLOOR; de0(e); } finally { EDRAW = 7; } // rings, links and aim lines stay on the roof
  };
  const dp0 = drawPlayer; drawPlayer = function () { if (!W3D.live) return dp0(); W3D.skipHero = 1; try { dp0(); } finally { W3D.skipHero = 0; } };
  const dh0 = drawHero; drawHero = function (h) { if (!W3D.live || cx !== W3D.cx0) return dh0(h); if (W3D.skipHero) { if (h.main) W3D.ho = { x: h.x, y: h.y, face: h.face, blade: h.blade, bl: h.bl, dashing: h.dashing, alpha: h.alpha, ca: h.ca, cb: h.cb, fx: h.fx }; return W3D.heroStand(h, () => dh0(h)); } if (!R3.on) W3D.stand(h.x, h.y, () => dh0(h)); }; // the hero always keeps its own skin, weapon art and swing animations
  const dpt0 = drawPet; drawPet = function (id, x, y) { if (W3D.live && cx === W3D.cx0) { const a = arguments; return W3D.stand(x, y, () => dpt0.apply(null, a)); } return dpt0.apply(null, arguments); }; // the pet stands up; its shell rings and marks stay on the roof
  const bd0 = Boss.draw.bind(Boss); Boss.draw = function () { const b = this.cur; if (!W3D.live || !b || !W3D.models() || cx !== W3D.cx0) return bd0();
    // the 3D layer draws the body; the boss's own drawing still runs for its attack marks (rings, beams, aim lines), cut away where the body stands
    const d = b.def.draw, hr = b.r * ((BOSS3D.hole && BOSS3D.hole[b.id.replace(/^(ex_|ev_)/, '')]) || 1.9);
    cx.save(); cx.beginPath(); cx.rect(-5000, -5000, 10000, 10000); const hole = (x, y, r) => { cx.moveTo(x + r, y); cx.arc(x, y, r, 0, TAU, true); };
    hole(b.x, b.y, hr); for (const p of b.parts) if (p.alive) hole(p.x, p.y, (p.r || 14) * 1.6 + 6); if (Array.isArray(b.seg)) for (const q of b.seg) hole(q.x, q.y, (q.r || 12) * 1.4 + 3);
    cx.clip('evenodd'); try { d.call(b.def, b); } finally { cx.restore(); }
    b.def.draw = () => { }; try { bd0(); } finally { b.def.draw = d; } }; // then the core marks (weak point, shield, stagger ring, part health) over the model
  const ed0 = EAnim.death.bind(EAnim); EAnim.death = function (e, a) { ed0(e, a); if (W3D.live && W3D.models() && !(REPLAY.on && REPLAY.fast)) W3D.debris(e); };
  // touch: the tilted roof maps back to the flat one
  const pos0 = In.pos.bind(In); In.pos = function (e) { pos0(e); if (W3D.live) { const q = W3D.unproj(this.px, this.py); this.px = q[0]; this.py = q[1]; } };

}
