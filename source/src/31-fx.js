/* =====================================================================
   FX — pooled particles, shockwaves, sliced halves, damage numbers,
   slash crescents, afterimages, lightning; camera trauma/zoom/flash/glitch
   ===================================================================== */
const FONT_D = "'Chakra Petch', 'Rubik', 'Cairo', 'Segoe UI', system-ui, sans-serif"; // Rubik covers Hebrew and Cyrillic, Cairo covers Arabic
const FONT_M = "'Share Tech Mono', 'Rubik', 'Cairo', ui-monospace, monospace";
const PT = new Pool(300, () => ({ x: 0, y: 0, vx: 0, vy: 0, l: 0, dl: 2, c: '#fff', s: 3, k: 0, dr: 1 }));
const SW = new Pool(28, () => ({ x: 0, y: 0, r: 0, mr: 100, l: 0, c: '#fff', w: 4 }));
const HV = new Pool(28, () => ({ x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, r: 10, c: '#fff', sides: 5, cut: 0, side: 1, l: 0 }));
const TX = new Pool(44, () => ({ x: 0, y: 0, vy: 0, l: 0, t: '', c: '#fff', f: '', sz: 16, pop: 0, key: '', ltr: true }));
const RTL_CH = /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/;
const ARC = new Pool(20, () => ({ x: 0, y: 0, a: 0, r: 50, l: 0, c: '#fff', w: 7 }));
const AIM = new Pool(40, () => ({ x: 0, y: 0, a: 0, l: 0, c: '#fff' }));
const DEC = new Pool(48, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, c: '#00f2fe', l: 0, ml: 3.5, w: 3 })); // scorch marks a dash leaves on the roof
const LZ = new Pool(20, () => ({ ax: 0, ay: 0, bx: 0, by: 0, l: 0, c: '#fff', sd: 0 }));
const CALL = { t: '', c: '#fff', l: 0, p: 0, age: 9, sz: 26 };
const CAM = { tr: 0, zoom: 0, flash: 0, fc: '#ffffff', glitch: 0, t: 0, ox: 0, oy: 0, rot: 0, slow: 0, slowK: 1, fin: 0, finD: 1.8, fx: 0, fy: 0 };

const FX = {
  spark(x, y, c, n, sp, kind) {
    n = Math.ceil(n * Q.parts * (CALM ? .5 : 1)); sp = sp || 1;
    for (let i = 0; i < n; i++) {
      const p = PT.get(); if (!p) return;
      const a = rnd() * TAU, s = (90 + rnd() * 320) * sp;
      p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.l = 1; p.dl = 1.8 + rnd() * 1.6; p.c = c; p.s = 2 + rnd() * 3; p.k = kind || 0; p.dr = .9;
    }
  },
  streak(x, y, a, c, n) { // directional speed sparks
    n = Math.ceil(n * Q.parts * (CALM ? .5 : 1));
    for (let i = 0; i < n; i++) {
      const p = PT.get(); if (!p) return; const b = a + (rnd() - .5) * .8, s = 300 + rnd() * 500;
      p.x = x; p.y = y; p.vx = Math.cos(b) * s; p.vy = Math.sin(b) * s; p.l = 1; p.dl = 3 + rnd() * 2; p.c = c; p.s = 1.5 + rnd() * 1.5; p.k = 1; p.dr = .86;
    }
  },
  ember(x, y, c, n) {
    n = Math.ceil(n * Q.parts * (CALM ? .5 : 1));
    for (let i = 0; i < n; i++) {
      const p = PT.get(); if (!p) return;
      p.x = x + (rnd() - .5) * 20; p.y = y + (rnd() - .5) * 20; p.vx = (rnd() - .5) * 60; p.vy = -30 - rnd() * 80; p.l = 1; p.dl = .7 + rnd() * .6; p.c = c; p.s = 3 + rnd() * 4; p.k = 2; p.dr = .97;
    }
  },
  ring(x, y, mr, c, w) { const s = SW.get(); if (!s) return; s.x = x; s.y = y; s.r = 6; s.mr = mr; s.l = 1; s.c = c; s.w = w || 4; },
  text(x, y, t, c, sz, pop, key) { // key: a newer label with the same key replaces the older one (no stacks of the same message)
    if (key) for (let i = 0; i < TX.n; i++) if (TX.a[i].key === key) TX.a[i].l = Math.min(TX.a[i].l, .12);
    const o = TX.get(); if (!o) return;
    o.x = x; o.y = y; o.vy = -60; o.l = 1; o.t = t; o.c = c || '#fff'; o.sz = sz || 16; o.f = '900 ' + o.sz + 'px ' + FONT_D; o.pop = pop ? 1 : 0; o.key = key || ''; o.ltr = !RTL_CH.test(t); // (numbers like '400!' read left to right even in Hebrew and Arabic)
  },
  slice(e, a) { // two halves of the enemy fly apart along the cut
    const perp = a + Math.PI / 2;
    for (let s = -1; s <= 1; s += 2) {
      const h = HV.get(); if (!h) return;
      h.x = e.x; h.y = e.y; h.vx = Math.cos(perp) * s * 245 + Math.cos(a) * 110; h.vy = Math.sin(perp) * s * 245 + Math.sin(a) * 110;
      h.rot = e.ang || 0; h.vr = s * (8 + rnd() * 6); h.r = e.r * .92; h.c = e.col; h.sides = SIDES[e.type] || 6; h.cut = a; h.side = s; h.l = 1.35;
    }
  },
  decal(x1, y1, x2, y2, c, w) { // a fading neon scorch line along a dash
    if (CALM || Q.lvl === 0) return; const d = DEC.get(); if (!d) return;
    d.x1 = x1; d.y1 = y1; d.x2 = x2; d.y2 = y2; d.c = c || '#00f2fe'; d.l = d.ml = 3.5; d.w = w || 3;
  },
  arc(x, y, a, r, c, w) { const o = ARC.get(); if (!o) return; o.x = x; o.y = y; o.a = a; o.r = r; o.l = 1; o.c = c; o.w = w || 7; },
  call(t, c, p, sz) { // one big action callout at a time; higher priority (or stale) replaces
    p = p || 1; if (CALL.l > 0 && p < CALL.p && CALL.age < .45) return;
    CALL.t = t; CALL.c = c || '#ffd700'; CALL.p = p; CALL.l = 1; CALL.age = 0; CALL.sz = sz ? Math.min(sz, 26) : (p >= 3 ? 26 : p === 2 ? 18 : 15); CALL.f = 'italic 700 ' + CALL.sz + 'px ' + FONT_D;
  },
  trail(x, y, a, kind) { // blade-skin trail particles behind a dash
    const n = Q.parts >= .75 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const p = PT.get(); if (!p) return;
      const b = a + Math.PI + (rnd() - .5) * 1.3, s = 40 + rnd() * 90;
      p.x = x + (rnd() - .5) * 8; p.y = y + (rnd() - .5) * 8; p.vx = Math.cos(b) * s; p.vy = Math.sin(b) * s; p.l = 1; p.dl = 1.5 + rnd(); p.dr = .94; p.k = 0; p.s = 3;
      switch (kind) {
        case 'petal': p.k = 3; p.c = rnd() < .5 ? '#ffb7d5' : '#ffe0ee'; p.s = 3 + rnd() * 2; p.vy += 25; p.dl = 1.1; break;
        case 'ember': p.k = 2; p.c = rnd() < .5 ? '#ff6a00' : '#ffd700'; p.s = 2 + rnd() * 2; p.vy -= 40; break;
        case 'snow': p.k = 4; p.c = '#e8fbff'; p.s = 3 + rnd() * 2; p.dl = 1.2; break;
        case 'spark': p.k = 1; p.c = rnd() < .5 ? '#ffe14d' : '#ffffff'; p.s = 1.6; p.vx *= 3; p.vy *= 3; p.dl = 3; break;
        case 'prism': p.k = 1; p.c = PRISM[(rnd() * 24) | 0]; p.s = 1.8; p.vx *= 3; p.vy *= 3; p.dl = 3; break;
        case 'pixel': p.k = 5; p.c = rnd() < .33 ? '#ff2bd6' : rnd() < .5 ? '#00f2fe' : '#ffffff'; p.s = 3; break;
        case 'smoke': p.k = 6; p.c = '#4a4a5c'; p.s = 4 + rnd() * 3; p.dl = 1.3; break;
        case 'gold': p.k = 2; p.c = '#ffd700'; p.s = 2.2; break;
        case 'void': p.k = 9; p.c = rnd() < .5 ? '#b537f2' : '#00f2fe'; p.s = 2.6; break;
        default: if (TRAIL_FX4[kind]) TRAIL_FX4[kind](p);
      }
    }
  },
  bladeKill(e, a, kind) { // blade-skin kill effect (cosmetic only)
    const x = e.x, y = e.y, m = Q.parts * (CALM ? .5 : 1);
    const burst = (n, k, c1, c2, sp, s0) => {
      n = Math.ceil(n * m);
      for (let i = 0; i < n; i++) {
        const p = PT.get(); if (!p) return; const b = rnd() * TAU, s = (60 + rnd() * 220) * sp;
        p.x = x; p.y = y; p.vx = Math.cos(b) * s; p.vy = Math.sin(b) * s; p.l = 1; p.dl = 1.2 + rnd() * .9; p.c = rnd() < .5 ? c1 : c2; p.s = s0 + rnd() * 2; p.k = k; p.dr = .9;
      }
    };
    switch (kind) {
      case 'petal': burst(16, 3, '#ffb7d5', '#ffffff', .9, 3); this.ring(x, y, e.r * 2.6, '#ffb7d5', 3); break;
      case 'burn': burst(12, 2, '#ff6a00', '#ffd700', 1, 3); this.ember(x, y, '#ff5500', 6); this.ring(x, y, e.r * 3.2, '#ff9a00', 4); break;
      case 'shatter': burst(12, 7, '#bff4ff', '#ffffff', 1.3, 3); this.ring(x, y, e.r * 2.8, '#e8fbff', 3); break;
      case 'ink': burst(12, 6, '#07070d', '#2a0010', .7, 5); this.ring(x, y, e.r * 2.4, '#ff0844', 3); break;
      case 'rainbow': for (let k = 0; k < 3; k++) this.ring(x, y, e.r * (2 + k), PRISM[(k * 8 + ((CAM.t * 18) | 0)) % 24], 3); burst(10, 0, PRISM[3], PRISM[15], 1, 2); break;
      case 'pixel': burst(18, 5, '#ff2bd6', '#00f2fe', 1.1, 3); glitch(.06); break;
      case 'coins': burst(10, 8, '#ffd700', '#ffe58a', .8, 5); break;
      case 'shred': burst(14, 1, '#ffd700', '#ff9a00', 1.6, 1.6); burst(6, 7, '#55606e', '#8a94aa', .9, 3); this.ring(x, y, e.r * 2.4, '#ff9a00', 3); break;
      case 'bones': burst(11, 7, '#efe9d8', '#c9c0a8', 1.1, 3.5); this.ring(x, y, e.r * 2.2, '#efe9d8', 2); break;
      case 'zap': for (let k = 0; k < 3; k++) { const b = rnd() * TAU, r = 50 + rnd() * 50; this.bolt(x, y, x + Math.cos(b) * r, y + Math.sin(b) * r, '#ffe14d', .9); } break;
      case 'implode': {
        const n = Math.ceil(14 * m);
        for (let i = 0; i < n; i++) { const p = PT.get(); if (!p) break; const b = i * TAU / n; p.x = x + Math.cos(b) * 46; p.y = y + Math.sin(b) * 46; p.vx = -Math.cos(b) * 150; p.vy = -Math.sin(b) * 150; p.l = 1; p.dl = 3; p.c = i % 2 ? '#b537f2' : '#00f2fe'; p.s = 2.6; p.k = 9; p.dr = .98; }
        this.ring(x, y, 30, '#b537f2', 3); break;
      }
      default: if (KILL4[kind]) KILL4[kind].call(this, e, x, y, burst);
    }
  },
  ghost(x, y, a, c) { if (CALM) return; const o = AIM.get(); if (!o) return; o.x = x; o.y = y; o.a = a; o.l = 1; o.c = c; },
  bolt(ax, ay, bx, by, c, l) { const o = LZ.get(); if (!o) return; o.ax = ax; o.ay = ay; o.bx = bx; o.by = by; o.l = l || 1; o.c = c || '#7df9ff'; o.sd = rnd() * 1000; },
  boom(x, y, r, c) { this.ring(x, y, r, c || '#ff6a00', 6); this.ring(x, y, r * .6, '#ffd700', 3); this.spark(x, y, '#ff9a00', 22, 1.3); this.ember(x, y, '#ff5500', 8); shake(.45); flash(.18, '#ff9a00'); },
  update(dt, rd) {
    for (let i = 0; i < PT.n; i++) {
      const p = PT.a[i]; p.x += p.vx * dt; p.y += p.vy * dt; const k = Math.pow(p.dr, dt * 60); p.vx *= k; p.vy *= k; p.l -= p.dl * dt; if (p.l <= 0) p.alive = false;
    }
    PT.sweep();
    for (let i = 0; i < SW.n; i++) { const s = SW.a[i]; s.r += (s.mr - s.r) * Math.min(1, 9 * dt); s.l -= 2.2 * dt; if (s.l <= 0) s.alive = false; }
    SW.sweep();
    for (let i = 0; i < HV.n; i++) { const h = HV.a[i]; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; h.vx *= Math.pow(.2, dt); h.vy *= Math.pow(.2, dt); h.l -= 1.6 * dt; if (h.l <= 0) h.alive = false; }
    HV.sweep();
    for (let i = 0; i < TX.n; i++) { const o = TX.a[i]; o.y += o.vy * rd; o.vy *= Math.pow(.15, rd); o.l -= 1.1 * rd; if (o.pop > 0) o.pop -= rd * 6; if (o.l <= 0) o.alive = false; }
    TX.sweep();
    for (let i = 0; i < ARC.n; i++) { const o = ARC.a[i]; o.l -= 6.5 * rd; if (o.l <= 0) o.alive = false; }
    ARC.sweep();
    for (let i = 0; i < AIM.n; i++) { const o = AIM.a[i]; o.l -= 4 * rd; if (o.l <= 0) o.alive = false; }
    AIM.sweep();
    for (let i = 0; i < LZ.n; i++) { const o = LZ.a[i]; o.l -= 4.5 * rd; if (o.l <= 0) o.alive = false; }
    LZ.sweep();
    for (let i = 0; i < DEC.n; i++) { const d = DEC.a[i]; d.l -= rd; if (d.l <= 0) d.alive = false; }
    DEC.sweep();
    WFX.update(rd);
    if (CALL.l > 0) { CALL.age += rd; CALL.l -= rd * (CALL.p >= 3 ? .9 : 1.25); }
  },
  drawLow() { // under entities: shockwaves, halves, afterimages
    if (DEC.n) {
      cx.lineCap = 'round';
      for (let i = 0; i < DEC.n; i++) { const d = DEC.a[i]; cx.globalAlpha = Math.max(0, d.l / d.ml) * .45; cx.strokeStyle = d.c; cx.lineWidth = d.w; cx.beginPath(); cx.moveTo(d.x1, d.y1); cx.lineTo(d.x2, d.y2); cx.stroke(); }
      cx.lineCap = 'butt'; cx.globalAlpha = 1;
    }
    for (let i = 0; i < SW.n; i++) {
      const s = SW.a[i]; cx.globalAlpha = s.l; cx.strokeStyle = s.c; cx.lineWidth = s.w * s.l + 1;
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, TAU); cx.stroke();
    }
    cx.globalAlpha = 1;
    for (let i = 0; i < HV.n; i++) {
      const h = HV.a[i]; cx.save(); cx.translate(h.x, h.y); cx.globalAlpha = h.l;
      cx.rotate(h.cut); cx.beginPath(); cx.rect(-h.r * 2, h.side > 0 ? 0 : -h.r * 2, h.r * 4, h.r * 2); cx.clip();
      cx.rotate(h.rot - h.cut); poly(0, 0, h.r, h.sides, 0); cx.fillStyle = h.c; cx.fill();
      cx.restore();
    }
    cx.globalAlpha = 1;
    for (let i = 0; i < AIM.n; i++) {
      const o = AIM.a[i];
      if (Q.glow) glow(o.x, o.y, 20, o.c, o.l * .55);
      else { cx.globalAlpha = o.l * .25; cx.fillStyle = o.c; cx.beginPath(); cx.arc(o.x, o.y, 9, 0, TAU); cx.fill(); }
    }
    cx.globalAlpha = 1;
  },
  drawHigh() { // over entities: crescents, bolts, particles, numbers
    WFX.draw(); cx.lineCap = 'round';
    for (let i = 0; i < ARC.n; i++) {
      const o = ARC.a[i]; cx.globalAlpha = o.l; cx.strokeStyle = o.c; cx.lineWidth = o.w * o.l + 1;
      const rr = o.r * (1.25 - o.l * .25); cx.beginPath(); cx.arc(o.x, o.y, rr, o.a - 1.05, o.a + 1.05); cx.stroke();
      cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.5 * o.l; cx.beginPath(); cx.arc(o.x, o.y, rr - 2, o.a - .8, o.a + .8); cx.stroke();
    }
    cx.globalAlpha = 1;
    for (let i = 0; i < LZ.n; i++) {
      const o = LZ.a[i]; cx.globalAlpha = o.l; cx.strokeStyle = o.c; cx.lineWidth = 2.5;
      cx.beginPath(); cx.moveTo(o.ax, o.ay);
      for (let k = 1; k < 6; k++) { const t = k / 6, j = Math.sin(o.sd + k * 12.9 + CAM.t * 40) * 9; cx.lineTo(o.ax + (o.bx - o.ax) * t + j, o.ay + (o.by - o.ay) * t - j); }
      cx.lineTo(o.bx, o.by); cx.stroke();
    }
    cx.globalAlpha = 1;
    for (let i = 0; i < PT.n; i++) {
      const p = PT.a[i]; cx.globalAlpha = p.l > 1 ? 1 : p.l; cx.fillStyle = p.c;
      switch (p.k) {
        case 1: cx.strokeStyle = p.c; cx.lineWidth = p.s; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * .025, p.y - p.vy * .025); cx.stroke(); break;
        case 2: glow(p.x, p.y, p.s * 3, p.c, p.l * .8); break;
        case 3: cx.beginPath(); cx.ellipse(p.x, p.y, p.s, p.s * .55, (p.x + p.y) * .06, 0, TAU); cx.fill(); break; // petal
        case 4: cx.fillRect(p.x - p.s * .5, p.y - .7, p.s, 1.4); cx.fillRect(p.x - .7, p.y - p.s * .5, 1.4, p.s); break; // snowflake
        case 6: cx.globalAlpha *= .45; cx.beginPath(); cx.arc(p.x, p.y, p.s * (2.2 - p.l), 0, TAU); cx.fill(); break; // smoke / ink
        case 7: { const a = Math.atan2(p.vy, p.vx), c = Math.cos(a), s = Math.sin(a); cx.beginPath(); cx.moveTo(p.x + c * p.s * 1.6, p.y + s * p.s * 1.6); cx.lineTo(p.x - s * p.s * .7, p.y + c * p.s * .7); cx.lineTo(p.x + s * p.s * .7, p.y - c * p.s * .7); cx.closePath(); cx.fill(); break; } // shard
        case 8: { const w = p.s * Math.abs(Math.sin(p.l * 18)) + .8; cx.fillRect(p.x - w * .5, p.y - p.s * .5, w, p.s); break; } // spinning coin
        case 9: glow(p.x, p.y, p.s * 2.6, p.c, p.l * .7); cx.fillRect(p.x - 1, p.y - 1, 2, 2); break; // void mote
        case 10: case 11: case 12: case 13: case 14: PART4(p); break;
        default: cx.fillRect(p.x - p.s * .5, p.y - p.s * .5, p.s, p.s);
      }
    }
    cx.globalAlpha = 1; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (let i = 0; i < TX.n; i++) {
      const o = TX.a[i]; cx.globalAlpha = o.l > .3 ? 1 : o.l / .3; cx.font = o.f; if (LANG.rtl) cx.direction = o.ltr ? 'ltr' : 'rtl';
      const sc = 1 + (o.pop > 0 ? o.pop * .6 : 0);
      if (W3D.live) W3D.stand(o.x, o.y + 3, () => { cx.translate(o.x, o.y); cx.scale(sc, sc); cx.fillStyle = '#000'; cx.fillText(o.t, 1.5, 1.5); cx.fillStyle = o.c; cx.fillText(o.t, 0, 0); }); // 3D: numbers stand up instead of lying on the roof
      else if (sc !== 1) { cx.save(); cx.translate(o.x, o.y); cx.scale(sc, sc); cx.fillStyle = '#000'; cx.fillText(o.t, 1.5, 1.5); cx.fillStyle = o.c; cx.fillText(o.t, 0, 0); cx.restore(); }
      else { cx.fillStyle = '#000'; cx.fillText(o.t, o.x + 1.5, o.y + 1.5); cx.fillStyle = o.c; cx.fillText(o.t, o.x, o.y); }
    }
    if (LANG.rtl) cx.direction = 'rtl';
    cx.globalAlpha = 1; cx.textBaseline = 'alphabetic';
  },
  drawCall() { // screen space, center
    if (CALL.l <= 0) return;
    const big = CALL.p >= 3, s = 1 + Math.max(0, .18 - CALL.age) * (big ? 4 : 2);
    const x = big ? V.CX : (HUD.xr || V.VW - 12) - 2, y = big ? V.VH * .36 : 182;
    cx.save(); cx.globalAlpha = Math.min(1, CALL.l * 2.5); cx.translate(x, y); cx.scale(s, s); cx.font = CALL.f; cx.textAlign = big ? 'center' : 'right'; cx.textBaseline = 'middle';
    cx.fillStyle = '#000'; cx.fillText(CALL.t, 2, 2); cx.fillStyle = CALL.c; cx.fillText(CALL.t, 0, 0); cx.restore(); cx.textBaseline = 'alphabetic';
  },
  clear() { CALL.l = 0; PT.reset(); SW.reset(); HV.reset(); TX.reset(); ARC.reset(); AIM.reset(); LZ.reset(); DEC.reset(); WFX.clear(); }
};
const SIDES = [5, 3, 6, 8, 4, 3, 7, 5, 4, 6, 8, 3, 8];
const Refl = { m() { return (Store.data && Store.data.settings.refl) || 'soft'; }, chars() { return this.m() === 'full'; }, k() { const m = this.m(); return m === 'off' ? 0 : m === 'soft' ? .55 : 1; } }; // v38: reflections SOFT (lights only) / FULL / OFF
let CBM = 0; // colorblind palette on
let CALM = 0; // 'calm effects' setting: half particles, no afterimages, rain, glitch; soft flashes
function dmgNum(x, y, n, crit, big) { // damage numbers respect the ALL / CRITS / OFF setting
  const m = Store.data.settings.nums; if (m === 'off' || (m === 'crit' && !crit && !big)) return;
  FX.text(x, y, crit ? n + '!' : '' + n, crit ? '#ffd700' : '#ffffff', big ? 26 : crit ? 22 : 15, crit);
}
function poly(x, y, r, n, rot) {
  cx.beginPath();
  for (let k = 0; k < n; k++) { const a = rot + k * TAU / n, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (k) cx.lineTo(px, py); else cx.moveTo(px, py); }
  cx.closePath();
}
function shake(t) { CAM.tr = Math.min(1, CAM.tr + t * Store.data.settings.shake); }
function punch(z) { const k = .45 * (Store.data ? +Store.data.settings.shake : 1); z *= k; if (z > CAM.zoom) CAM.zoom = z; } // (v32: a small kick, and none with screen shake OFF: big zoom pulses made the screen seem to change size)
function flash(a, c) { if (CALM) a *= .3; if (a >= CAM.flash) { CAM.flash = a; CAM.fc = c || '#ffffff'; } }
function glitch(t) { if (CALM) return; if (t > CAM.glitch) CAM.glitch = t; }
function camUpdate(rd) {
  CAM.t += rd; CAM.tr = Math.max(0, CAM.tr - rd * 1.6);
  const s = CAM.tr * CAM.tr * 16;
  CAM.ox = s * (Math.sin(CAM.t * 51.3) + Math.sin(CAM.t * 23.7) * .5);
  CAM.oy = s * (Math.sin(CAM.t * 47.1 + 1.3) + Math.sin(CAM.t * 19.3) * .5);
  CAM.rot = CAM.tr * CAM.tr * .025 * Math.sin(CAM.t * 31.1);
  CAM.zoom *= Math.pow(.02, rd); CAM.flash = Math.max(0, CAM.flash - rd * 2.6); CAM.glitch = Math.max(0, CAM.glitch - rd); if (CAM.fin > 0) CAM.fin = Math.max(0, CAM.fin - rd);
}
function drawGlitch() { // canvas-to-canvas strip offsets in device pixels
  if (CAM.glitch <= 0) return;
  const w = cv.width, h = cv.height, n = 3 + (rnd() * 4 | 0);
  cx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const y = rnd() * h, sh = 4 + rnd() * h * .06, off = (rnd() - .5) * w * .08 * Math.min(1, CAM.glitch * 2);
    cx.drawImage(cv, 0, y, w, sh, off, y, w, sh);
  }
  cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = Math.min(.25, CAM.glitch * .3);
  cx.fillStyle = rnd() < .5 ? '#ff0844' : '#00f2fe'; cx.fillRect(0, rnd() * h, w, h * .08);
  cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
}
