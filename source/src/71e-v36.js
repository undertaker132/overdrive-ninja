/* =====================================================================
   VERSION 36 — two weapons (WX) and two pets. Simulation on sim time with
   no random numbers (replays and ghosts stay exact); art and swing come
   from a base weapon, tinted in the weapon's own colors.
     SOLAR LANCE        dash end: light falls on the 3 nearest enemies
                        0.45 s later (SUNFALL: 5)
     MIRROR TWINBLADES  every dash also cuts the same line behind you
                        (KALEIDOSCOPE: and to both sides)
     NEON KOI           every 11 s a wave ahead of you hits a whole line
     MANTIS DRONE       every 7 s cuts the 2 nearest enemies and finishes
                        any below 30% health
   ===================================================================== */
const W5_BASE = { solarlance: 'spear', mirrorblade: 'daggers' };
const W5_TINT = { solarlance: { id: 'w5sol', blade: '#ffd23f', edge: '#fff4c2' }, mirrorblade: { id: 'w5mir', blade: '#bfe8ff', edge: '#ffffff' } };
for (const k in W5_BASE) { const b = W5_BASE[k]; GRIP[k] = GRIP[b]; if (SW_DUR[b] != null) SW_DUR[k] = SW_DUR[b]; }
Object.assign(SW_COL, { solarlance: '#ffd23f', mirrorblade: '#bfe8ff' });
Object.assign(HAPTIC, { w_solarlance: [1, [4, 60, 20]], w_mirrorblade: [1, [6, 40, 6]] });
Object.assign(W4SND.slash, {
  solarlance(b, t) { this.tone(520 + b * .4, 1040 + b * .4, .14, .06, 'triangle'); this.noise(.1, .05, 6000, 2500, 'bandpass'); },
  mirrorblade(b, t) { this.tone(1500 + b, 2600 + b, .05, .06, 'sawtooth'); this.tone(2600 + b, 1500 + b, .05, .05, 'sawtooth', t + .07); }
});
{ const ss0 = SWING.start.bind(SWING); SWING.start = function (s, w, a, now) { return ss0(s, W5_BASE[w] || w, a, now); }; }
{ const dh0 = drawHeld; drawHeld = function (o) {
    const b = W5_BASE[o.w]; if (!b) return dh0(o);
    const w = o.w, fx = o.fx; o.w = b; if (!fx || !fx.blade) o.fx = W5_TINT[w];
    try { return dh0(o); } finally { o.w = w; o.fx = fx; } }; }
const WX = {
  pil: [], mir: [],
  reset() { this.pil.length = 0; this.mir.length = 0; },
  D() { return P.w.dmg * P.dmgMul * G.dmgMod; },
  onSlash(a) {
    if (P.w.id === 'solarlance') { P.w4e = 1; return; } // so dashEnd() fires when this dash ends
    if (P.w.id !== 'mirrorblade') return;
    const L = 150, sig = P.sig === 'mirrorblade', dirs = sig ? [a + Math.PI, a + Math.PI / 2, a - Math.PI / 2] : [a + Math.PI];
    for (const d of dirs) this.mir.push({ x: P.x, y: P.y, a: d, L, t: .08, l: .35, d: .85 * this.D() });
  },
  dashEnd() {
    if (P.w.id !== 'solarlance') return;
    const n = P.sig === 'solarlance' ? 5 : 3, list = [];
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!W4.ok(e)) continue; const d = dist(e.x, e.y, P.x, P.y); if (d < 340) list.push([d, i, e]); }
    list.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    for (const [, , e] of list.slice(0, n)) this.pil.push({ x: e.x, y: e.y, t: .45, l: .45, r: 46, d: 1.3 * this.D(), hit: 0 });
    const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && list.length < n && dist(B.x, B.y, P.x, P.y) < 360) this.pil.push({ x: B.x, y: B.y, t: .45, l: .45, r: 46, d: 1.3 * this.D(), hit: 0 });
    if (this.pil.length) Aud.tone(1600, 2400, .2, .04, 'sine');
  },
  update(dt) {
    for (const p of this.pil) { p.t -= dt; if (p.t <= 0 && !p.hit) { p.hit = 1;
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (W4.ok(e) && dist(e.x, e.y, p.x, p.y) < p.r + e.r) W4.hitE(e, p.d, -1.57); }
      W4.boss(p.x, p.y, p.r, p.d, -1.57); FX.ring(p.x, p.y, p.r * 1.6, '#ffd23f', 5); FX.spark(p.x, p.y, '#fff4c2', 10); shake(.12); Aud.tone(900, 300, .18, .06, 'triangle'); } }
    this.pil = this.pil.filter(p => p.t > -.35);
    for (const m of this.mir) { m.t -= dt; if (m.t <= 0 && !m.hit) { m.hit = 1; const x2 = m.x + Math.cos(m.a) * m.L, y2 = m.y + Math.sin(m.a) * m.L;
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (W4.ok(e) && W4.segD(e.x, e.y, m.x, m.y, x2, y2) < e.r + 14) W4.hitE(e, m.d, m.a); }
      W4.boss((m.x + x2) / 2, (m.y + y2) / 2, m.L / 2, m.d, m.a); } }
    this.mir = this.mir.filter(m => m.t > -m.l);
  },
  draw() { // world space, render only
    for (const p of this.pil) {
      if (p.t > 0) { const k = 1 - p.t / p.l; cx.save(); cx.globalAlpha = .4 + .5 * k; cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(p.x, p.y, p.r * (1.6 - .6 * k), CAM.t * 2, CAM.t * 2 + TAU); cx.stroke(); cx.setLineDash(NODASH); cx.restore(); }
      else { const k = Math.min(1, -p.t / .35); cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 1 - k; const g = cx.createLinearGradient(p.x, p.y - 260, p.x, p.y); g.addColorStop(0, 'rgba(255,210,63,0)'); g.addColorStop(1, 'rgba(255,244,194,.9)'); cx.fillStyle = g; cx.fillRect(p.x - 14 * (1 - k * .5), p.y - 260, 28 * (1 - k * .5), 260); glow(p.x, p.y, 60, '#ffd23f', .8 * (1 - k)); cx.restore(); }
    }
    for (const m of this.mir) { if (m.t > 0) continue; const k = Math.min(1, -m.t / m.l), x2 = m.x + Math.cos(m.a) * m.L, y2 = m.y + Math.sin(m.a) * m.L;
      cx.save(); cx.globalAlpha = 1 - k; cx.lineCap = 'round'; cx.strokeStyle = '#bfe8ff'; cx.lineWidth = 6 * (1 - k) + 1; cx.beginPath(); cx.moveTo(m.x, m.y); cx.lineTo(x2, y2); cx.stroke(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.5; cx.stroke(); cx.restore(); }
  }
};
{ const r0 = W4.reset.bind(W4); W4.reset = function () { r0(); WX.reset(); };
  const s0 = W4.onSlash.bind(W4); W4.onSlash = function (a) { s0(a); WX.onSlash(a); };
  const e0 = W4.dashEnd.bind(W4); W4.dashEnd = function () { e0(); WX.dashEnd(); };
  const u0 = W4.update.bind(W4); W4.update = function (dt) { u0(dt); WX.update(dt); };
  const d0 = W4.draw.bind(W4); W4.draw = function () { d0(); WX.draw(); }; }
/* the pets */
PETS.push( // version 36
  { id: 'koi', name: 'NEON KOI', kind: 'Spirit fish', col: '#ff8a3d', cost: 5400, desc: 'A glowing koi that swims through the air. Every 11 seconds it sends a wave ahead of you that hits everything in a line.' },
  { id: 'mantis', name: 'MANTIS DRONE', kind: 'Blade bug', col: '#7dff6a', cost: 6400, desc: 'A green drone with scythe arms. Every 7 seconds it cuts the two nearest enemies, and finishes off any that are badly hurt.' });
PET_BY_ID.koi = PETS[PETS.length - 2]; PET_BY_ID.mantis = PETS[PETS.length - 1];
{ const pr0 = Pet.period.bind(Pet); Pet.period = function () { const b = { koi: 11, mantis: 7 }[G.pet]; return b ? b * (1 - .08 * (this.lv() - 1)) : pr0(); };
  const pl0 = petLevelText; petLevelText = function (id, lv) { const n = lv - 1; if (id === 'koi' || id === 'mantis') return ltf('Every {0}s · damage +{1}%', ({ koi: 11, mantis: 7 }[id] * (1 - .08 * n)).toFixed(1), n * 15); return pl0(id, lv); }; }
Object.assign(PET4, {
  koi(W) { // a wave along your facing that hits everything in a line
    const a = P.face, L = 280, x2 = P.x + Math.cos(a) * L, y2 = P.y + Math.sin(a) * L; let n = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (W4.ok(e) && W4.segD(e.x, e.y, P.x, P.y, x2, y2) < e.r + 30) { damageEnemy(e, W * 1.1, a, 2); n++; } }
    if (W4.boss((P.x + x2) / 2, (P.y + y2) / 2, L / 2, W * 1.1, a)) n++;
    if (!n) { this.cd = .5; return; }
    this.cd = this.period(); this.uses = (this.uses | 0) + 1; this.fx = .6; this.fxx = x2; this.fxy = y2; this.fxa = a; this.happy = .6;
    Aud.noise(.4, .1, 400, 2400, 'bandpass');
  },
  mantis(W) { // two quick cuts; badly hurt enemies are finished off
    const list = []; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!W4.ok(e) || e.type === ET.COURIER) continue; const d = dist(e.x, e.y, P.x, P.y); if (d < 300) list.push([d, i, e]); }
    if (!list.length) { this.cd = .5; return; }
    list.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    this.cd = this.period(); this.uses = (this.uses | 0) + 1; this.fx = .4; this.happy = .5; this.mt = [];
    for (const [, , e] of list.slice(0, 2)) { this.mt.push(e.x, e.y); const low = !e.mb && !e.elite && e.hp < e.mhp * .3; damageEnemy(e, low ? 999 : W * 1.2, Math.atan2(e.y - P.y, e.x - P.x), 2); if (low) FX.text(e.x, e.y - e.r - 12, lt('FINISHED'), '#7dff6a', 12); }
    Aud.tone(3200, 1800, .06, .05, 'sawtooth');
  }
});
Object.assign(PET4D, {
  koi() { if (this.fx <= 0) return; const k = 1 - this.fx / .6; cx.save(); cx.globalAlpha = Math.min(1, this.fx * 3); cx.translate(lerp(this.x, this.fxx, k), lerp(this.y, this.fxy, k)); cx.rotate(this.fxa || 0);
    cx.strokeStyle = '#7df9ff'; cx.lineWidth = 3; for (let s = -1; s <= 1; s += 2) { cx.beginPath(); cx.arc(-8, 0, 26, s * .3, s * 1.2, s < 0); cx.stroke(); } glow(0, 0, 30, '#ff8a3d', .6); cx.restore(); this.fx -= RDT; },
  mantis() { if (this.fx <= 0 || !this.mt) return; cx.save(); cx.globalAlpha = this.fx * 2.5; cx.strokeStyle = '#7dff6a'; cx.lineWidth = 3; cx.lineCap = 'round';
    for (let i = 0; i < this.mt.length; i += 2) { const x = this.mt[i], y = this.mt[i + 1]; cx.beginPath(); cx.moveTo(x - 18, y - 18); cx.lineTo(x + 18, y + 18); cx.moveTo(x + 18, y - 18); cx.lineTo(x - 18, y + 18); cx.stroke(); } cx.restore(); this.fx -= RDT; }
});
Object.assign(PET4ART, {
  koi(leg, t, att) { // a glowing koi swimming in the air
    cx.translate(0, -12 + Math.sin(t * 2.2) * 2); const sw = Math.sin(t * 7) * .35;
    cx.fillStyle = '#ff8a3d'; cx.beginPath(); cx.moveTo(-8, 0); cx.lineTo(-15, -5 + sw * 6); cx.lineTo(-13, 0); cx.lineTo(-15, 5 + sw * 6); cx.closePath(); cx.fill();
    cx.fillStyle = '#fff1e6'; cx.beginPath(); cx.ellipse(0, 0, 9, 4.6, sw * .15, 0, TAU); cx.fill();
    cx.fillStyle = '#ff5a1f'; cx.beginPath(); cx.ellipse(1, -1, 4, 2.4, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.ellipse(-4, 1.2, 2.6, 1.6, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#ffb07a'; cx.beginPath(); cx.moveTo(0, -4); cx.lineTo(-4, -8); cx.lineTo(-3, -3.5); cx.fill();
    cx.fillStyle = '#05060f'; dot(6, -1.2, .9); hglow(0, 0, 16, '#ff8a3d', att ? .9 : .4);
  },
  mantis(leg, t, att) { // a green drone with folded scythe arms
    cx.translate(0, -10 + Math.sin(t * 6) * 1.5); const f = att ? 1 : .25 + .1 * Math.sin(t * 3);
    cx.fillStyle = 'rgba(200,255,200,.35)'; for (const s of [-1, 1]) { cx.beginPath(); cx.ellipse(-3, s * 5, 7, 2.2, s * (.5 + Math.sin(t * 40) * .2), 0, TAU); cx.fill(); }
    cx.fillStyle = '#2f7a28'; cx.beginPath(); cx.ellipse(-2, 0, 7, 3.4, 0, 0, TAU); cx.fill(); cx.fillStyle = '#7dff6a'; cx.beginPath(); cx.arc(6, 0, 3.4, 0, TAU); cx.fill();
    cx.strokeStyle = '#c8ffb8'; cx.lineWidth = 1.6; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(4, s * 2); cx.lineTo(9, s * (3 + 4 * f)); cx.lineTo(13, s * (1 + 6 * f)); cx.stroke(); }
    cx.fillStyle = '#05060f'; dot(7.5, -1.4, .8); dot(7.5, 1.4, .8); hglow(0, 0, 14, '#7dff6a', att ? .9 : .35);
  }
});