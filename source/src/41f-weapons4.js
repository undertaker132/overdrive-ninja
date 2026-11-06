/* =====================================================================
   WEAPONS 4 — twelve new blades (version 21). Original designs on the
   classic anime weapon archetypes:
     TITAN CLEAVER    a slab of iron: every hit cleaves the enemies around
                      the target (signature RAGE: every 5th hit a quake)
     THUNDER FANG     hits jump as lightning to 2 more enemies
                      (signature STORMCALLER: 4 jumps that stun)
     ZERO-CUT         the delayed cut: when the dash ends, the whole path
                      you ran is cut a beat later (AFTERIMAGE: twice)
     NYOI STAFF       a staff that shoots out far ahead when the dash ends,
                      knocking a line of enemies away (HEAVEN PILLAR: stuns)
     MONO-WIRE        a monofilament wire stays strung along your dash and
                      cuts whatever crosses it (CAT'S CRADLE: lasts longer)
     SPIRAL DRILL     pierces like the spear, and every enemy pierced in one
                      dash makes the drill hit harder (GIGA SPIRAL: burst)
     SPIRIT BOW       when a dash ends, a piercing arrow flies at the nearest
                      enemy (HUNDRED ARROWS: three arrows)
     BEAST CLAWS      fast claws; every hit makes the enemy bleed
                      (FERAL: a bleeding enemy that dies spreads the bleed)
     SINGULARITY      a glaive that leaves a small black hole where the dash
                      ends: it pulls enemies in, then collapses (EVENT HORIZON)
     PHOENIX BLADE    the dash leaves burning ground behind it
                      (FIREBIRD: kills in the fire launch homing fire)
     PHOTON SABER     every dash throws a crescent sword beam ahead
                      (OVERCHARGE: a beam twice as wide)
     CRYO KATANA      every hit freezes the enemy for a moment
                      (SHATTER: frozen enemies burst into ice shards)
   All of it is simulation on sim time with no random numbers, so replays
   and ghosts stay exact. The art lives in 41g-art4.js.
   ===================================================================== */
WEAPONS.push( // version 36: art and swing borrowed from a base weapon, mechanics of their own (WX)
  { id: 'solarlance', name: 'SOLAR LANCE', desc: 'A spear of sunlight. When a dash ends, light falls from the sky on the three nearest enemies.', dmg: 1.05, speed: 1420, ch: 2, crit: .14, cm: 2.1, heat: 22, reach: 12, cost: 5600, v: 36 },
  { id: 'mirrorblade', name: 'MIRROR TWINBLADES', desc: 'Two mirrored daggers. Every dash also cuts the same distance behind you.', dmg: .8, speed: 1480, ch: 4, crit: .24, cm: 1.9, heat: 24, reach: 0, cost: 6200, v: 36 });
Object.assign(SIGS, { solarlance: { n: 'SUNFALL', d: 'Five beams of light instead of three' }, mirrorblade: { n: 'KALEIDOSCOPE', d: 'The mirror cut also fans out to both sides' } });
const W4_IDS = { cleaver: 1, thunder: 1, zerocut: 1, staff: 1, monowire: 1, drill: 1, bow: 1, claws: 1, glaive: 1, phoenix: 1, beamsaber: 1, cryo: 1 };
const W4 = {
  cnt: {}, // counters for the test suite
  t: 0, ar: [], wr: [], fi: [], ho: [], cu: [], bl: [], fr: [], st: [], wcd: {}, wx: 0, wy: 0, wT: 0, fT: 0, n5: 0,
  reset() {
    this.t = 0; this.ar.length = 0; this.wr.length = 0; this.fi.length = 0; this.ho.length = 0; this.cu.length = 0; this.bl.length = 0; this.fr.length = 0; this.st.length = 0;
    this.wcd = {}; this.n5 = 0; this.wT = 0; this.fT = 0; P.w4e = 0; P.drN = 0; P.w4p = [];
  },
  D() { return P.w.dmg * P.dmgMul * G.dmgMod; },
  ok(e) { return e.alive && e.al <= 0 && e.spawnT <= 0 && e.vis >= .3; },
  hitE(e, d, a) { e.sh = 0; return damageEnemy(e, d, a, 3); },
  boss(x, y, r, d, a) { const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, x, y) < r + B.r) { Boss.hitBody(B, d, a, false, x, y); return true; } return false; },
  segD(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy || 1; let t = ((px - x1) * dx + (py - y1) * dy) / L; t = t < 0 ? 0 : t > 1 ? 1 : t; const qx = x1 + dx * t - px, qy = y1 + dy * t - py; return Math.sqrt(qx * qx + qy * qy); },
  polyD(px, py, p) { let m = 1e9; for (let i = 0; i + 3 < p.length; i += 2) { const d = this.segD(px, py, p[i], p[i + 1], p[i + 2], p[i + 3]); if (d < m) m = d; } return m; },
  /* ---- hooks from slash() / updatePlayer() / hitEnemy() / killEnemy() ---- */
  onSlash(a) {
    const id = P.w.id; if (!W4_IDS[id]) return;
    if (id === 'zerocut') { if (!P.w4e) P.w4p.length = 0; P.w4p.push(P.x, P.y); if (P.w4p.length > 16) P.w4p.splice(0, 2); }
    if (id === 'drill' && !P.w4e) P.drN = 0;
    if (id === 'monowire') { this.wx = P.x; this.wy = P.y; this.wT = 0; }
    if (id === 'phoenix') this.fT = .07;
    if (id === 'beamsaber') this.beam(a);
    if (id === 'zerocut' || id === 'staff' || id === 'glaive' || id === 'bow' || id === 'drill') P.w4e = 1;
  },
  dashEnd() {
    const id = P.w.id, a = P.ang, D = this.D();
    if (id === 'zerocut') {
      P.w4p.push(P.x, P.y); this.cu.push({ p: P.w4p.slice(), t: .32, n: P.sig === 'zerocut' ? 2 : 1, d: 1.1 * D, l: 0 }); P.w4p.length = 0;
      Aud.bell(2400, .08, .03, 'triangle');
    } else if (id === 'staff') this.staff(a, D);
    else if (id === 'glaive') {
      const sig = P.sig === 'glaive';
      this.ho.push({ x: clamp(P.x + Math.cos(a) * 60, V.L + 20, V.R - 20), y: clamp(P.y + Math.sin(a) * 60, 40, V.VH - 60), t: .9, T: .9, R: sig ? 260 : 180, d: (sig ? 1.8 : 1.2) * D });
      FX.ring(P.x + Math.cos(a) * 60, P.y + Math.sin(a) * 60, 40, '#b48cff', 3);
    } else if (id === 'bow') this.arrows(D);
    else if (id === 'drill' && P.sig === 'drill') this.spiral(D);
  },
  onHit(e, d, a, killed) {
    const id = P.w.id; if (!W4_IDS[id]) return;
    if (id === 'cleaver') {
      for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o === e || !this.ok(o) || dist(o.x, o.y, e.x, e.y) > 80 + o.r) continue; this.hitE(o, d * .45, Math.atan2(o.y - e.y, o.x - e.x)); FX.spark(o.x, o.y, '#ff9a3d', 4); }
      FX.ring(e.x, e.y, 80, 'rgba(255,154,61,.7)', 3);
      if (P.sig === 'cleaver' && ++this.n5 >= 5) { this.n5 = 0; this.quake(e.x, e.y, 130, 1.2 * this.D()); FX.text(e.x, e.y - 40, lt('RAGE!'), '#ff6a3d', 15, true); }
    } else if (id === 'thunder') {
      const sig = P.sig === 'thunder', m = sig ? 4 : 2; let n = 0;
      for (let i = 0; i < EN.n && n < m; i++) { const o = EN.a[i]; if (o === e || !this.ok(o) || dist(o.x, o.y, e.x, e.y) > 170) continue; FX.bolt(e.x, e.y, o.x, o.y, '#ffe14d', 1); this.hitE(o, d * .5, Math.atan2(o.y - e.y, o.x - e.x)); if (sig && o.alive) o.stun = Math.max(o.stun, o.mb ? .2 : .5); n++; }
      if (n) Aud.bell(3000, .06, .025, 'square');
    } else if (id === 'claws') { if (!killed && e.alive) this.bleed(e, .2 * this.D()); }
    else if (id === 'cryo') { if (!killed && e.alive) { e.stun = Math.max(e.stun, e.mb ? .15 : .5); this.frost(e); } }
  },
  onKill(e) {
    const id = P.w && P.w.id; if (!W4_IDS[id] || P.sig !== id) return;
    if (id === 'cryo' && this.has(this.fr, e)) { for (let k = 0; k < 4; k++) shard(e.x, e.y, k * TAU / 4 + .4, 460, '#bff4ff', .8 * P.w.dmg); FX.ring(e.x, e.y, 40, '#e8fbff', 3); }
    else if (id === 'claws' && this.has(this.bl, e)) { for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o !== e && this.ok(o) && dist(o.x, o.y, e.x, e.y) < 120 + o.r) this.bleed(o, .2 * this.D()); } FX.ring(e.x, e.y, 120, '#ff2a4a', 2); }
    else if (id === 'phoenix') { for (const f of this.fi) if (dist(f.x, f.y, e.x, e.y) < f.r + e.r) { shard(e.x, e.y, P.ang, 480, '#ff9a3d', P.w.dmg); break; } }
  },
  has(L, e) { for (const q of L) if (q.e === e && q.uid === e.uid && q.t > 0) return true; return false; },
  bleed(e, dps) { this.cnt.bl = (this.cnt.bl | 0) + 1; for (const q of this.bl) if (q.e === e && q.uid === e.uid) { q.t = 3; q.dps = Math.max(q.dps, dps); return; } if (this.bl.length < 40) this.bl.push({ e, uid: e.uid, t: 3, dps, tk: 0 }); },
  frost(e) { this.cnt.fr = (this.cnt.fr | 0) + 1; for (const q of this.fr) if (q.e === e && q.uid === e.uid) { q.t = .6; return; } if (this.fr.length < 40) this.fr.push({ e, uid: e.uid, t: .6 }); },
  /* ---- the moves ---- */
  quake(x, y, r, d) {
    FX.ring(x, y, r, '#ff6a3d', 6); FX.ring(x, y, r * .6, '#ffd23f', 3); shake(.3);
    for (let k = 0; k < 6; k++) { const b = k * TAU / 6; FX.decal(x, y, x + Math.cos(b) * r * .7, y + Math.sin(b) * r * .7, '#ff6a3d', 2.5); }
    for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (this.ok(o) && dist(o.x, o.y, x, y) < r + o.r) this.hitE(o, d, Math.atan2(o.y - y, o.x - x)); }
    this.boss(x, y, r, d, 0);
  },
  staff(a, D) {
    const L = 280 + (P.reach - 1) * 60, x2 = P.x + Math.cos(a) * L, y2 = P.y + Math.sin(a) * L, sig = P.sig === 'staff'; let n = 0;
    this.st.push({ x: P.x, y: P.y, a, L, l: .3 });
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i]; if (!this.ok(e) || this.segD(e.x, e.y, P.x, P.y, x2, y2) > 26 + e.r) continue;
      n++; const dead = this.hitE(e, 1.1 * D, a); if (!dead && e.alive && !e.mb) { e.kbx = Math.cos(a) * 640; e.kby = Math.sin(a) * 640; if (sig) e.stun = Math.max(e.stun, 1); }
      FX.spark(e.x, e.y, '#ffd23f', 6);
    }
    const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && this.segD(B.x, B.y, P.x, P.y, x2, y2) < 26 + B.r) { Boss.hitBody(B, 1.1 * D, a, false, B.x, B.y); n++; }
    FX.ring(x2, y2, 30, '#ffd23f', 4); if (n) { shake(.2); G.hs = Math.max(G.hs, .03); }
    if (sig && n) FX.text(x2, y2 - 20, lt('HEAVEN PILLAR'), '#ffd23f', 12);
  },
  arrows(D) {
    let tx = 0, ty = 0, bd = 760, f = false;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!this.ok(e)) continue; const d = dist(e.x, e.y, P.x, P.y); if (d < bd) { bd = d; tx = e.x; ty = e.y; f = true; } }
    const B = Boss.cur; if (!f && B && B.dying <= 0) { tx = B.x; ty = B.y; f = true; }
    const a0 = f ? Math.atan2(ty - P.y, tx - P.x) : P.ang, n = P.sig === 'bow' ? 3 : 1;
    for (let k = 0; k < n; k++) { const a = a0 + (k - (n - 1) / 2) * .16; this.ar.push({ k: 0, x: P.x + Math.cos(a) * 14, y: P.y + Math.sin(a) * 14, vx: Math.cos(a) * 1250, vy: Math.sin(a) * 1250, a, l: 1.1, r: 9, d: 1.05 * D, hit: [] }); }
    Aud.bell(1800, .07, .04, 'triangle');
  },
  beam(a) {
    const sig = P.sig === 'beamsaber';
    this.ar.push({ k: 1, x: P.x + Math.cos(a) * 20, y: P.y + Math.sin(a) * 20, vx: Math.cos(a) * 860, vy: Math.sin(a) * 860, a, l: .55, r: sig ? 44 : 24, d: .8 * this.D(), hit: [] });
  },
  spiral(D) {
    FX.ring(P.x, P.y, 110, '#3dff9a', 5); for (let k = 0; k < 8; k++) { const b = k * TAU / 8 + this.t * 6; WFX.line(P.x + Math.cos(b) * 50, P.y + Math.sin(b) * 50, b + 1.2, 50, '#bfffe0', 2, 6); }
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (this.ok(e) && dist(e.x, e.y, P.x, P.y) < 110 + e.r) this.hitE(e, 1.3 * D, Math.atan2(e.y - P.y, e.x - P.x)); }
    this.boss(P.x, P.y, 110, 1.3 * D, P.ang); FX.text(P.x, P.y - 36, lt('GIGA SPIRAL'), '#3dff9a', 13, true);
  },
  /* ---- per sim step ---- */
  update(dt) {
    this.t += dt; const id = P.w && P.w.id, dash = P.dashT > 0, D = W4_IDS[id] ? this.D() : 1;
    if (dash && id === 'monowire') { this.wT += dt; if (this.wT >= .03) { this.wT = 0; if (this.wr.length >= 70) this.wr.shift(); this.wr.push({ x1: this.wx, y1: this.wy, x2: P.x, y2: P.y, l: P.sig === 'monowire' ? 2.6 : 1.3 }); this.wx = P.x; this.wy = P.y; } }
    if (dash && id === 'phoenix') { this.fT += dt; if (this.fT >= .07) { this.fT = 0; if (this.fi.length >= 22) this.fi.shift(); this.fi.push({ x: P.x, y: P.y, l: 2.2, r: 30, tk: 0 }); } }
    // arrows and sword beams: they pierce, every enemy is hit once
    for (let i = this.ar.length - 1; i >= 0; i--) {
      const p = this.ar[i]; p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.l <= 0 || p.x < V.L - 30 || p.x > V.R + 30 || p.y < -30 || p.y > V.VH + 30) { this.ar.splice(i, 1); continue; }
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!this.ok(e) || p.hit.indexOf(e.uid) >= 0 || dist(e.x, e.y, p.x, p.y) > p.r + e.r) continue; p.hit.push(e.uid); this.hitE(e, p.d, p.a); FX.spark(e.x, e.y, p.k ? '#ff3df0' : '#bfffd0', 5); }
      if (p.hit.indexOf(-1) < 0 && this.boss(p.x, p.y, p.r, p.d, p.a)) p.hit.push(-1);
    }
    // mono-wire segments
    if (this.wr.length) {
      const dm = (P.sig === 'monowire' ? .6 : .45) * D;
      for (let i = this.wr.length - 1; i >= 0; i--) { const s = this.wr[i]; s.l -= dt; if (s.l <= 0) { this.wr.splice(i, 1); continue; }
        for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!this.ok(e) || (this.wcd[e.uid] || 0) > this.t || this.segD(e.x, e.y, s.x1, s.y1, s.x2, s.y2) > 10 + e.r) continue; this.wcd[e.uid] = this.t + .4; this.hitE(e, dm, Math.atan2(s.y2 - s.y1, s.x2 - s.x1) + 1.57); FX.spark(e.x, e.y, '#e8fbff', 4); }
        const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && (this.wcd.b || 0) <= this.t && this.segD(B.x, B.y, s.x1, s.y1, s.x2, s.y2) < 10 + B.r) { this.wcd.b = this.t + .4; Boss.hitBody(B, dm, 0, false, B.x, B.y); }
      }
      if (!this.wr.length) this.wcd = {};
    }
    // burning ground
    for (let i = this.fi.length - 1; i >= 0; i--) {
      const f = this.fi[i]; f.l -= dt; if (f.l <= 0) { this.fi.splice(i, 1); continue; } f.tk += dt; if (f.tk < .25) continue; f.tk -= .25;
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (this.ok(e) && dist(e.x, e.y, f.x, f.y) < f.r + e.r) damageEnemy(e, .22 * D, 0, 3); }
      this.boss(f.x, f.y, f.r, .22 * D, 0);
    }
    // singularities: pull, then collapse
    for (let i = this.ho.length - 1; i >= 0; i--) {
      const h = this.ho[i]; h.t -= dt; const k = Math.min(.5, 2.6 * dt);
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!this.ok(e) || e.type === ET.COURIER) continue; const d = dist(e.x, e.y, h.x, h.y); if (d < h.R && d > 8) { const kk = e.mb ? k * .3 : k; e.x += (h.x - e.x) * kk; e.y += (h.y - e.y) * kk; } }
      if (h.t <= 0) {
        const r = h.R > 200 ? 130 : 95; FX.ring(h.x, h.y, r, '#b48cff', 6); FX.ring(h.x, h.y, r * .5, '#ffffff', 3); shake(.25);
        for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (this.ok(e) && dist(e.x, e.y, h.x, h.y) < r + e.r) this.hitE(e, h.d, Math.atan2(e.y - h.y, e.x - h.x)); }
        this.boss(h.x, h.y, r, h.d, 0); Aud.sfx('boom', 0); this.ho.splice(i, 1);
      }
    }
    // delayed cuts along the dash path
    for (let i = this.cu.length - 1; i >= 0; i--) {
      const c = this.cu[i]; if (c.l > 0) c.l -= dt; c.t -= dt;
      if (c.n <= 0) { if (c.l <= 0) this.cu.splice(i, 1); continue; }
      if (c.t > 0) continue;
      c.n--; c.t = .28; c.l = .3; let n = 0;
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!this.ok(e) || this.polyD(e.x, e.y, c.p) > 30 + e.r) continue; this.hitE(e, c.d, 0); FX.spark(e.x, e.y, '#ffffff', 6); n++; }
      const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && this.polyD(B.x, B.y, c.p) < 30 + B.r) { Boss.hitBody(B, c.d, 0, false, B.x, B.y); n++; }
      if (n) { shake(.18); G.hs = Math.max(G.hs, .04); } Aud.bell(3400, .1, .04, 'sine');
    }
    // bleeding and frozen enemies
    for (let i = this.bl.length - 1; i >= 0; i--) { const q = this.bl[i]; if (q.e.uid !== q.uid || !q.e.alive) { this.bl.splice(i, 1); continue; } q.t -= dt; q.tk += dt; if (q.tk >= .3) { q.tk -= .3; damageEnemy(q.e, q.dps * .3, 0, 3); } if (q.t <= 0) this.bl.splice(i, 1); }
    for (let i = this.fr.length - 1; i >= 0; i--) { const q = this.fr[i]; q.t -= dt; if (q.t <= 0 || q.e.uid !== q.uid || !q.e.alive) this.fr.splice(i, 1); }
    for (let i = this.st.length - 1; i >= 0; i--) { this.st[i].l -= dt; if (this.st[i].l <= 0) this.st.splice(i, 1); }
  },
  /* ---- drawing (render only) ---- */
  draw() {
    const T = CAM.t;
    for (const f of this.fi) { const k = Math.min(1, f.l); glow(f.x, f.y, f.r * 1.6, '#ff6a00', .45 * k); cx.fillStyle = 'rgba(255,154,0,' + (.5 * k).toFixed(2) + ')';
      for (let j = 0; j < 3; j++) { const ox = Math.sin(T * 7 + f.x + j * 2) * 6, h = 10 + Math.sin(T * 11 + j + f.y) * 5; cx.beginPath(); cx.moveTo(f.x + ox - 6, f.y + 4); cx.quadraticCurveTo(f.x + ox, f.y - h, f.x + ox + 6, f.y + 4); cx.fill(); } }
    if (this.wr.length) { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
      for (const s of this.wr) { cx.globalAlpha = Math.min(1, s.l * 2) * .9; cx.strokeStyle = '#7df9ff'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); cx.stroke(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.stroke(); }
      cx.restore(); }
    for (const h of this.ho) { const k = 1 - h.t / h.T, r = 16 + k * 10; glow(h.x, h.y, h.R * .5, '#7a3cff', .35);
      cx.strokeStyle = '#b48cff'; cx.lineWidth = 2; for (let j = 0; j < 3; j++) { cx.beginPath(); cx.arc(h.x, h.y, r + 8 + j * 9, T * (4 + j) , T * (4 + j) + 2.2); cx.stroke(); }
      cx.fillStyle = '#05010c'; dot(h.x, h.y, r); cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(h.x, h.y, r, 0, TAU); cx.stroke(); }
    for (const c of this.cu) { const p = c.p; if (p.length < 4) continue; cx.save(); cx.lineCap = 'round';
      if (c.l > 0) { cx.globalAlpha = Math.min(1, c.l * 4); cx.strokeStyle = '#ffffff'; cx.lineWidth = 7 * c.l / .3 + 1; } else { cx.globalAlpha = .45 + .25 * Math.sin(T * 30); cx.strokeStyle = '#c9e6ff'; cx.lineWidth = 1.2; cx.setLineDash([6, 6]); }
      cx.beginPath(); cx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) cx.lineTo(p[i], p[i + 1]); cx.stroke(); cx.restore(); }
    for (const s of this.st) { const k = s.l / .3, L = s.L * Math.min(1, (1 - k) * 4 + .2), c = Math.cos(s.a), sn = Math.sin(s.a);
      cx.save(); cx.globalAlpha = Math.min(1, k * 2); cx.lineCap = 'round'; cx.strokeStyle = '#8a1b1b'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x + c * L, s.y + sn * L); cx.stroke();
      cx.strokeStyle = '#ffd23f'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(s.x + c * (L - 16), s.y + sn * (L - 16)); cx.lineTo(s.x + c * L, s.y + sn * L); cx.stroke(); glow(s.x + c * L, s.y + sn * L, 30, '#ffd23f', .6); cx.restore(); }
    for (const p of this.ar) {
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a);
      if (p.k === 0) { glow(0, 0, 20, '#7dff9a', .55); cx.strokeStyle = '#bfffd0'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-22, 0); cx.lineTo(10, 0); cx.stroke();
        cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(14, 0); cx.lineTo(6, -4); cx.lineTo(6, 4); cx.closePath(); cx.fill(); cx.strokeStyle = '#7dff9a'; cx.beginPath(); cx.moveTo(-22, 0); cx.lineTo(-28, -5); cx.moveTo(-22, 0); cx.lineTo(-28, 5); cx.stroke(); }
      else { const r = p.r; cx.globalCompositeOperation = 'lighter'; glow(0, 0, r * 1.4, '#ff3df0', .5); cx.fillStyle = 'rgba(255,61,240,.75)'; cx.beginPath(); cx.arc(-r * .5, 0, r, -1.2, 1.2); cx.arc(-r * .9, 0, r * .8, 1.1, -1.1, true); cx.closePath(); cx.fill();
        cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(-r * .5, 0, r, -1.1, 1.1); cx.stroke(); }
      cx.restore();
    }
    for (const q of this.bl) { const e = q.e; if (!e.alive) continue; cx.fillStyle = '#ff2a4a'; for (let j = 0; j < 2; j++) { const u = (T * 1.6 + j * .5 + e.uid * .37) % 1; cx.globalAlpha = 1 - u; dot(e.x + (j ? 5 : -4), e.y + e.r * .3 + u * 14, 2); } cx.globalAlpha = 1; }
    for (const q of this.fr) { const e = q.e; if (!e.alive) continue; cx.save(); cx.globalAlpha = Math.min(1, q.t * 3) * .8; cx.strokeStyle = '#e8fbff'; cx.lineWidth = 2; cx.beginPath();
      for (let j = 0; j < 6; j++) { const b = j * TAU / 6, r = e.r + 6; cx.moveTo(e.x + Math.cos(b) * (e.r - 2), e.y + Math.sin(b) * (e.r - 2)); cx.lineTo(e.x + Math.cos(b) * r, e.y + Math.sin(b) * r); } cx.stroke();
      cx.fillStyle = 'rgba(191,244,255,.25)'; dot(e.x, e.y, e.r + 2); cx.restore(); }
  }
};
