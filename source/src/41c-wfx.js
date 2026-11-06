/* =====================================================================
   WEAPON FX — every weapon has its own look in motion. All of it is
   cosmetic (no simulation state), so replays and ghosts are unaffected.
     · a blade-tip swoosh ribbon while dashing, shaped per weapon
     · a swing effect when the dash starts
     · an impact effect on every hit, and a finisher effect on kills
   Pools: WL (straight slash lines), WS (shell casings / debris chips),
   WW (rising souls / runes). Drawn in FX.drawHigh, aged in FX.update.
   ===================================================================== */
const WL = new Pool(40, () => ({ x: 0, y: 0, a: 0, len: 0, w: 3, c: '#fff', l: 0, dl: 4 }));
const WS = new Pool(40, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, w: 3, h: 1.5, c: '#ffd23f', l: 0 }));
const WW = new Pool(24, () => ({ x: 0, y: 0, vx: 0, vy: 0, l: 0, c: '#9b5bff', k: 0, t: 0 }));
const TIP = { n: 0, x: new Float32Array(14), y: new Float32Array(14), w: '', c: '' };
const WFX_STYLE = { // ribbon width and colors per weapon
  katana: { w: 7, c: '#e8fbff' }, muramasa: { w: 8, c: '#ff0844' }, daggers: { w: 4, c: '' }, hammer: { w: 12, c: '#ffb347' },
  scythe: { w: 14, c: '#b537f2' }, kunai: { w: 3, c: '#c9d6ff' }, whip: { w: 3, c: '' }, spear: { w: 5, c: '#7df9ff' },
  fists: { w: 10, c: '#ffd23f' }, monarch: { w: 6, c: '#9b5bff' }, dominator: { w: 9, c: '#ff9a3d' },
  nodachi: { w: 13, c: '#9fe8ff' }, chakram: { w: 4, c: '#ff4fd8' }, tessen: { w: 11, c: '#bff3ff' }
};
const WFX = {
  line(x, y, a, len, c, w, dl) { const o = WL.get(); if (!o) return; o.x = x; o.y = y; o.a = a; o.len = len; o.c = c; o.w = w || 3; o.l = 1; o.dl = (dl || 4) * .7; }, // lines linger a little longer so hits read clearly
  chip(x, y, a, s, c, w, h) { const o = WS.get(); if (!o) return; o.x = x; o.y = y; o.vx = Math.cos(a) * s; o.vy = Math.sin(a) * s; o.r = rnd() * TAU; o.vr = (rnd() - .5) * 24; o.c = c; o.w = w || 3; o.h = h || 1.5; o.l = 1; },
  soul(x, y, c, k) { const o = WW.get(); if (!o) return; o.x = x; o.y = y; o.vx = (rnd() - .5) * 30; o.vy = -40 - rnd() * 30; o.l = 1; o.c = c; o.k = k || 0; o.t = 0; },
  W: '', F: null, C: '', // the weapon, blade skin and hero color in use (the run, or the Arsenal preview)
  use(w, f, c) { this.W = w; this.F = f; this.C = c; },
  wid() { return this.W || (P.w && P.w.id) || 'katana'; },
  col() { const f = this.W ? this.F : P.fx, c = this.W ? this.C : P.ca; return f && f.blade && f.blade !== 'prism' && f.blade !== 'glitch' ? (f.id === 'obsidian' ? '#ff0844' : f.blade) : c; },
  /* ---- the tip ribbon (called every frame from drawPlayer) ---- */
  tip(x, y, dashing) {
    if (CALM) { TIP.n = 0; return; }
    if (dashing) { for (let i = Math.min(13, TIP.n); i > 0; i--) { TIP.x[i] = TIP.x[i - 1]; TIP.y[i] = TIP.y[i - 1]; } TIP.x[0] = x; TIP.y[0] = y; TIP.n = Math.min(14, TIP.n + 1); }
    else if (TIP.n > 0) TIP.n = Math.max(0, TIP.n - 2);
  },
  ribbon() {
    if (TIP.n < 3) return;
    const wd = this.wid(), st = WFX_STYLE[wd] || WFX_STYLE.katana, c = G.odT > 0 && !this.W ? '#ffd700' : st.c || this.col(), W = st.w * (G.combo >= 30 && !this.W ? 1.3 : 1);
    cx.save(); cx.globalCompositeOperation = 'lighter';
    for (let pass = 0; pass < 2; pass++) { // a soft wide glow, then a bright core
      cx.beginPath();
      for (let i = 0; i < TIP.n; i++) { const k = 1 - i / TIP.n, nx = i < TIP.n - 1 ? TIP.x[i] - TIP.x[i + 1] : TIP.x[i - 1] - TIP.x[i], ny = i < TIP.n - 1 ? TIP.y[i] - TIP.y[i + 1] : TIP.y[i - 1] - TIP.y[i], d = Math.hypot(nx, ny) || 1, w = W * k * (pass ? .35 : 1);
        const px = -ny / d * w, py = nx / d * w; i ? cx.lineTo(TIP.x[i] + px, TIP.y[i] + py) : cx.moveTo(TIP.x[i] + px, TIP.y[i] + py); }
      for (let i = TIP.n - 1; i >= 0; i--) { const k = 1 - i / TIP.n, nx = i < TIP.n - 1 ? TIP.x[i] - TIP.x[i + 1] : TIP.x[i - 1] - TIP.x[i], ny = i < TIP.n - 1 ? TIP.y[i] - TIP.y[i + 1] : TIP.y[i - 1] - TIP.y[i], d = Math.hypot(nx, ny) || 1, w = W * k * (pass ? .35 : 1);
        cx.lineTo(TIP.x[i] - (-ny / d * w), TIP.y[i] - (nx / d * w)); }
      cx.closePath(); cx.globalAlpha = pass ? .9 : .32; cx.fillStyle = pass ? '#ffffff' : c; cx.fill();
    }
    if (wd === 'monarch' && TIP.n > 4) { // dark lightning crackles along the ribbon
      cx.strokeStyle = '#c9a8ff'; cx.lineWidth = 1.4; cx.globalAlpha = .8; cx.beginPath(); cx.moveTo(TIP.x[0], TIP.y[0]);
      for (let i = 1; i < TIP.n; i += 2) cx.lineTo(TIP.x[i] + (rnd() - .5) * 10, TIP.y[i] + (rnd() - .5) * 10); cx.stroke();
    }
    cx.restore();
  },
  /* ---- swing: the moment a dash starts ---- */
  cnt: { s: 0, h: 0 }, // counters for the test suite
  swing(a, x0, y0) {
    this.cnt.s++; if (CALM) return; const w = this.wid(), x = x0 == null ? P.x : x0, y = y0 == null ? P.y : y0, c = this.col();
    switch (w) {
      case 'katana': FX.arc(x + Math.cos(a) * 18, y + Math.sin(a) * 18, a, 52, '#ffffff', 3); break; // a second, thinner crescent
      case 'muramasa': FX.arc(x + Math.cos(a) * 16, y + Math.sin(a) * 16, a, 58, '#ff0844', 4); for (let k = 0; k < 4; k++) FX.spark(x, y, '#3a0610', 2); break;
      case 'daggers': case 'monarch': FX.arc(x + Math.cos(a + .5) * 12, y + Math.sin(a + .5) * 12, a + .5, 34, c, 3); FX.arc(x + Math.cos(a - .5) * 12, y + Math.sin(a - .5) * 12, a - .5, 34, w === 'monarch' ? '#9b5bff' : c, 3); break;
      case 'hammer': FX.arc(x, y, a, 70, '#ffb347', 9); FX.ring(x, y, 40, 'rgba(255,179,71,.6)', 4); break;
      case 'scythe': FX.arc(x - Math.cos(a) * 10, y - Math.sin(a) * 10, a, 86, '#b537f2', 10); FX.arc(x, y, a, 70, '#e0ccff', 2); break;
      case 'spear': this.line(x + Math.cos(a) * 20, y + Math.sin(a) * 20, a, 170, '#7df9ff', 3, 5); this.line(x + Math.cos(a) * 20, y + Math.sin(a) * 20, a, 120, '#ffffff', 1.4, 4); break;
      case 'fists': for (let k = -1; k <= 1; k++) this.line(x + Math.cos(a) * 16, y + Math.sin(a) * 16, a + k * .22, 46, '#ffd23f', 2, 6); FX.ring(x + Math.cos(a) * 26, y + Math.sin(a) * 26, 24, '#ffd23f', 3); break;
      case 'dominator': FX.arc(x + Math.cos(a) * 14, y + Math.sin(a) * 14, a, 50, '#ff9a3d', 5); break;
      case 'kunai': for (let k = -1; k <= 1; k++) this.line(x + Math.cos(a + k * .22) * 18, y + Math.sin(a + k * .22) * 18, a + k * .22, 60, '#c9d6ff', 1.2, 5); break;
      case 'whip': FX.arc(x + Math.cos(a) * 30, y + Math.sin(a) * 30, a, 44, c, 2); break;
      case 'nodachi': FX.arc(x, y, a, 96, '#9fe8ff', 9); FX.arc(x, y, a, 78, '#ffffff', 3); break;
      case 'chakram': for (let k = -1; k <= 1; k += 2) this.line(x + Math.cos(a) * 20, y + Math.sin(a) * 20, a + k * .12, 50, '#ff4fd8', 1.6, 6); break;
      case 'tessen': FX.arc(x + Math.cos(a) * 8, y + Math.sin(a) * 8, a, 60, '#bff3ff', 5); break;
      default: WFX4.swing(w, a, x, y, c);
    }
  },
  /* ---- impact: every blade hit on an enemy or boss ---- */
  hit(ex, ey, a, crit) {
    this.cnt.h++; if (CALM) return; const w = this.wid(), c = this.col();
    switch (w) {
      case 'katana': case 'muramasa': // a clean line straight through the target
        this.line(ex, ey, a, crit ? 120 : 80, w === 'muramasa' ? '#ff0844' : '#ffffff', crit ? 4 : 2.5, crit ? 3 : 5);
        if (crit) this.line(ex, ey, a, 160, c, 1.2, 2.5); break;
      case 'daggers': case 'monarch': // an X of two quick cuts
        this.line(ex, ey, a + .78, 46, w === 'monarch' ? '#c9a8ff' : '#ffffff', 2.4, 6); this.line(ex, ey, a - .78, 46, w === 'monarch' ? '#9b5bff' : c, 2.4, 6); break;
      case 'hammer': // cracks in the roof and flying chips
        for (let k = 0; k < 4; k++) { const b = a + (k - 1.5) * .9 + (rnd() - .5) * .4, L = 22 + rnd() * 20; FX.decal(ex, ey, ex + Math.cos(b) * L, ey + Math.sin(b) * L, '#ffb347', 2); }
        for (let k = 0; k < 6; k++) this.chip(ex, ey, a + (rnd() - .5) * 2.4, 160 + rnd() * 160, '#8a7a68', 3, 3); FX.ring(ex, ey, 46, 'rgba(255,179,71,.8)', 5); break;
      case 'scythe': for (let k = 0; k < 2; k++) this.soul(ex + (rnd() - .5) * 14, ey, '#b537f2', 0); FX.arc(ex, ey, a, 30, '#e0ccff', 2); break;
      case 'spear': FX.ring(ex, ey, 26, '#7df9ff', 2); this.line(ex, ey, a, 90, '#7df9ff', 2, 6); break; // the thrust carries on through
      case 'fists': // a comic impact star
        FX.ring(ex, ey, crit ? 54 : 38, '#ffffff', 5); for (let k = 0; k < 8; k++) { const b = k * TAU / 8 + .2; this.line(ex + Math.cos(b) * 14, ey + Math.sin(b) * 14, b, crit ? 34 : 24, '#ffd23f', 2.4, 8); } break;
      case 'dominator': for (let k = 0; k < 3; k++) this.chip(ex, ey, a + Math.PI + (rnd() - .5) * 1.6, 120, '#ffd23f', 2, 2); FX.spark(ex, ey, '#ff9a3d', 6); break;
      case 'whip': FX.ring(ex, ey, 22, c, 2); for (let k = 0; k < 4; k++) { const b = rnd() * TAU; this.line(ex, ey, b, 14, '#ffffff', 1.6, 9); } break;
      case 'kunai': this.line(ex, ey, a, 30, '#c9d6ff', 1.6, 7); break;
      case 'nodachi': this.line(ex, ey, a + 1.57, crit ? 130 : 100, '#9fe8ff', crit ? 4 : 3, 4); for (let k = 0; k < 3; k++) this.chip(ex, ey, a + (rnd() - .5) * 1.4, 160, '#e8fbff', 4, 1.2); break;
      case 'chakram': FX.ring(ex, ey, 18, '#ff4fd8', 2); this.line(ex, ey, a + 1.2, 28, '#ffd6f3', 1.6, 8); break;
      case 'tessen': for (let k = -1; k <= 1; k++) this.line(ex + Math.cos(a + 1.57) * k * 8, ey + Math.sin(a + 1.57) * k * 8, a, 40, '#bff3ff', 1.4, 7); break;
      default: WFX4.hit(w, ex, ey, a, crit, c);
    }
    if (crit && w !== 'fists') FX.ring(ex, ey, 30 + rnd() * 10, '#ffd700', 3);
  },
  /* ---- finisher: a slash kill ---- */
  kill(e, a) {
    if (CALM) return; const w = this.wid();
    if (w === 'scythe') { this.soul(e.x, e.y, '#e0ccff', 1); this.soul(e.x, e.y, '#b537f2', 1); }
    else if (w === 'monarch') { this.soul(e.x, e.y, '#1a0830', 2); FX.ring(e.x, e.y, 34, '#9b5bff', 3); }
    else if (w === 'muramasa') { this.soul(e.x, e.y, '#ff0844', 3); }
    else if (w === 'hammer') { shake(.12); for (let k = 0; k < 6; k++) this.chip(e.x, e.y, rnd() * TAU, 220, '#c9b8a0', 4, 4); }
    else if (w === 'katana' && G.lastCrit) { FX.text(e.x, e.y - e.r - 20, '斬', '#ffffff', 22, true); } // the kanji for "cut", one beat on crit kills
    else if (w === 'fists') { punch(.03); }
    else if (w === 'nodachi') { FX.ring(e.x, e.y, 46, '#9fe8ff', 3); for (let k = 0; k < 4; k++) this.line(e.x, e.y, k * Math.PI / 4 + a, 44, '#ffffff', 2, 6); }
    else if (w === 'chakram') { for (let k = 0; k < 4; k++) this.line(e.x, e.y, k * Math.PI / 2 + .4, 30, '#ff4fd8', 2, 7); }
    else if (w === 'tessen') { for (let k = 0; k < 6; k++) this.chip(e.x, e.y, rnd() * TAU, 110, '#e8fbff', 5, 1.6); }
    else WFX4.kill(w, e, a);
  },
  /* the dominator's spent shells fly out sideways */
  shells(a) { if (CALM) return; for (let k = 0; k < 3; k++) this.chip(P.x, P.y, a + 1.6 + (rnd() - .5) * .6, 150 + rnd() * 80, '#ffd23f', 3.4, 1.6); this.line(P.x + Math.cos(a) * 24, P.y + Math.sin(a) * 24, a, 40, '#fff3c4', 6, 9); },
  update(dt) {
    for (let i = 0; i < WL.n; i++) { const o = WL.a[i]; o.l -= o.dl * dt; if (o.l <= 0) o.alive = false; } WL.sweep();
    for (let i = 0; i < WS.n; i++) { const o = WS.a[i]; o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= Math.pow(.05, dt); o.vy *= Math.pow(.05, dt); o.r += o.vr * dt; o.l -= 1.2 * dt; if (o.l <= 0) o.alive = false; } WS.sweep();
    for (let i = 0; i < WW.n; i++) { const o = WW.a[i]; o.t += dt; o.x += o.vx * dt + Math.sin(o.t * 6) * 18 * dt; o.y += o.vy * dt; o.l -= .9 * dt; if (o.l <= 0) o.alive = false; } WW.sweep();
  },
  draw() {
    cx.lineCap = 'round';
    for (let i = 0; i < WL.n; i++) { // tapered slash lines that grow then thin out
      const o = WL.a[i], k = 1 - o.l, h = o.len * (.35 + Math.min(1, k * 4) * .65) / 2, c = Math.cos(o.a), s = Math.sin(o.a);
      cx.globalAlpha = Math.min(1, o.l * 1.6); cx.strokeStyle = o.c; cx.lineWidth = o.w * o.l + .5; cx.beginPath(); cx.moveTo(o.x - c * h, o.y - s * h); cx.lineTo(o.x + c * h, o.y + s * h); cx.stroke();
    }
    for (let i = 0; i < WS.n; i++) { const o = WS.a[i]; cx.globalAlpha = Math.min(1, o.l * 2); cx.save(); cx.translate(o.x, o.y); cx.rotate(o.r); cx.fillStyle = o.c; cx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h); cx.restore(); }
    for (let i = 0; i < WW.n; i++) { // souls, shadows and cursed runes drifting up
      const o = WW.a[i]; cx.globalAlpha = o.l * .85;
      if (o.k === 3) { cx.strokeStyle = o.c; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(o.x, o.y, 8 + (1 - o.l) * 14, 0, TAU); cx.stroke(); cx.font = '700 10px ' + FONT_M; cx.fillStyle = o.c; cx.textAlign = 'center'; cx.fillText('呪', o.x, o.y + 4); }
      else { glow(o.x, o.y, 18, o.k === 2 ? '#9b5bff' : o.c, .5 * o.l); cx.fillStyle = o.c; cx.beginPath(); cx.ellipse(o.x, o.y, 4, 6, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.moveTo(o.x - 3, o.y + 4); cx.quadraticCurveTo(o.x + Math.sin(o.t * 9) * 4, o.y + 12, o.x, o.y + 16); cx.quadraticCurveTo(o.x + 2, o.y + 10, o.x + 3, o.y + 4); cx.fill(); }
    }
    cx.globalAlpha = 1;
  },
  clear() { WL.reset(); WS.reset(); WW.reset(); TIP.n = 0; }
};
