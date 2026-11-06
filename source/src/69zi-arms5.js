/* ---------------- WEAPONS 5 — four MYTHIC blades (version 25) ----------------
   ECLIPSE ODACHI   a black moon blade: when a dash ends, a dark crescent wave
                    rolls forward and cuts everything in its arc (TOTAL ECLIPSE:
                    a second wave right behind it)
   NOVA GAUNTLETS   every hit bursts into a small nova that hits the enemies
                    around it; every 4th hit is a big nova that stuns
                    (SUPERNOVA: every 3rd)
   SERPENT CHAIN    hits poison; when a dash ends, the chain lashes all around
                    you (VIPER PIT: a wider lash that pulls enemies in)
   CHRONO EDGE      every 3rd dash ends in a time field: everything inside
                    stops for a moment and takes damage (PARADOX: a bigger
                    field that gives a dash charge back)
   Simulation on sim time with no random numbers (replays stay exact); the
   art, swing poses, effects and sounds follow. */
WEAPONS.push(
  { id: 'eclipse', name: 'ECLIPSE ODACHI', desc: 'A black moon blade. When a dash ends, a dark crescent wave rolls forward and cuts everything in its arc.', dmg: 2.05, speed: 1250, ch: 2, crit: .14, cm: 2.6, heat: 26, reach: 14, cost: 15000, v: 25 },
  { id: 'nova', name: 'NOVA GAUNTLETS', desc: 'Star-core fists. Every hit bursts into a nova that hits the enemies around it; every 4th hit stuns them.', dmg: 1.25, speed: 1300, ch: 3, crit: .16, cm: 2.2, heat: 22, reach: 2, cost: 13500, v: 25 },
  { id: 'serpent', name: 'SERPENT CHAIN', desc: 'A living chain with a viper head. Hits poison, and when a dash ends the chain lashes all around you.', dmg: 1.05, speed: 1450, ch: 3, crit: .15, cm: 2.1, heat: 20, reach: 20, cost: 12500, v: 25 },
  { id: 'chrono', name: 'CHRONO EDGE', desc: 'A blade cut from stopped time. Every 3rd dash ends in a time field that freezes and cuts everything inside.', dmg: 1.3, speed: 1600, ch: 3, crit: .2, cm: 2.3, heat: 22, reach: 6, cost: 18000, v: 25 }
);
Object.assign(SIGS, {
  eclipse: { n: 'TOTAL ECLIPSE', d: 'A second crescent wave follows the first' },
  nova: { n: 'SUPERNOVA', d: 'Every 3rd hit is a big nova' },
  serpent: { n: 'VIPER PIT', d: 'A wider lash that pulls enemies in' },
  chrono: { n: 'PARADOX', d: 'A bigger time field that gives a dash charge back' }
});
const W5_IDS = { eclipse: 1, nova: 1, serpent: 1, chrono: 1 };
const W5 = {
  wv: [], nv: [], lash: [], tf: [], n: 0, dN: 0, cnt: {},
  reset() { this.wv.length = 0; this.nv.length = 0; this.lash.length = 0; this.tf.length = 0; this.n = 0; this.dN = 0; },
  D() { return W4.D(); },
  hitAll(x, y, r, d, pred, stun) {
    let k = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!W4.ok(e) || dist(e.x, e.y, x, y) > r + e.r || (pred && !pred(e))) continue; const a = Math.atan2(e.y - y, e.x - x); if (!W4.hitE(e, d, a) && stun && e.alive) e.stun = Math.max(e.stun, e.mb ? stun * .3 : stun); k++; }
    W4.boss(x, y, r, d * .8, 0); return k;
  },
  onSlash(a) { const id = P.w.id; if (!W5_IDS[id]) return; if (id === 'eclipse' || id === 'serpent' || id === 'chrono') P.w4e = 1; },
  dashEnd() {
    const id = P.w.id, a = P.ang, D = this.D(), sig = P.sig === id;
    if (id === 'eclipse') { this.wv.push({ x: P.x, y: P.y, a, r: 20, hit: {}, d: 1.25 * D, dl: 0 }); if (sig) this.wv.push({ x: P.x, y: P.y, a, r: 20, hit: {}, d: .9 * D, dl: .16 }); }
    else if (id === 'serpent') { const R = sig ? 150 : 115; this.lash.push({ x: P.x, y: P.y, t: .3, R });
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!W4.ok(e) || dist(e.x, e.y, P.x, P.y) > R + e.r) continue; const ea = Math.atan2(e.y - P.y, e.x - P.x); if (!W4.hitE(e, .8 * D, ea) && e.alive) { W4.bleed(e, .25 * D); if (sig && !e.mb) { e.x += (P.x - e.x) * .35; e.y += (P.y - e.y) * .35; } } }
      W4.boss(P.x, P.y, R, .6 * D, a); Aud.sfx('hit', 1); }
    else if (id === 'chrono' && ++this.dN % 3 === 0) { const R = sig ? 240 : 190; this.tf.push({ x: P.x, y: P.y, t: .7, R }); this.hitAll(P.x, P.y, R, .6 * D, null, .9); if (sig && P.ch < P.maxCh) P.ch++; FX.call(lt('TIME STOP'), '#7df9ff', 2, 18); }
  },
  onHit(e, d, a, killed) {
    const id = P.w.id; this.cnt[id] = (this.cnt[id] | 0) + 1; if (id === 'nova') { const D = this.D(), big = ++this.n % (P.sig === 'nova' ? 3 : 4) === 0, R = big ? 120 : 55;
      this.nv.push({ x: e.x, y: e.y, t: big ? .4 : .25, R, big });
      for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o === e || !W4.ok(o) || dist(o.x, o.y, e.x, e.y) > R + o.r) continue; if (!W4.hitE(o, (big ? .9 : .45) * D, Math.atan2(o.y - e.y, o.x - e.x)) && big && o.alive) o.stun = Math.max(o.stun, .4); }
      if (big) { FX.ring(e.x, e.y, R, '#ffb000', 5); shake(.2); } }
    else if (id === 'serpent' && !killed && e.alive) W4.bleed(e, .2 * this.D());
  },
  update(dt) {
    for (let i = this.wv.length - 1; i >= 0; i--) { const w = this.wv[i]; if (w.dl > 0) { w.dl -= dt; continue; } w.r += 620 * dt; if (w.r > 330) { this.wv.splice(i, 1); continue; }
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!W4.ok(e) || w.hit[e.uid]) continue; const dd = dist(e.x, e.y, w.x, w.y); if (Math.abs(dd - w.r) > 24 + e.r) continue; const ea = Math.atan2(e.y - w.y, e.x - w.x); let da = ea - w.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; if (Math.abs(da) > .75) continue; w.hit[e.uid] = 1; W4.hitE(e, w.d, ea); }
      const B = Boss.cur; if (B && !w.hit.boss && B.dying <= 0 && B.enter >= 1 && Math.abs(dist(B.x, B.y, w.x, w.y) - w.r) < B.r) { w.hit.boss = 1; Boss.hitBody(B, w.d * .8, w.a, false, B.x, B.y); } }
    for (const L of [this.nv, this.lash, this.tf]) for (let i = L.length - 1; i >= 0; i--) { L[i].t -= dt; if (L[i].t <= 0) L.splice(i, 1); }
  },
  draw() {
    for (const w of this.wv) { if (w.dl > 0) continue; const p = w.r / 330; cx.save(); cx.globalAlpha = 1 - p * .8; cx.lineCap = 'round';
      cx.strokeStyle = '#1a0630'; cx.lineWidth = 16 * (1 - p * .5); cx.beginPath(); cx.arc(w.x, w.y, w.r, w.a - .75, w.a + .75); cx.stroke();
      cx.strokeStyle = '#c99bff'; cx.lineWidth = 4; cx.shadowColor = '#b537f2'; cx.shadowBlur = 14; cx.beginPath(); cx.arc(w.x, w.y, w.r + 6, w.a - .7, w.a + .7); cx.stroke(); cx.restore(); }
    for (const n of this.nv) { const p = 1 - n.t / (n.big ? .4 : .25); cx.save(); cx.globalCompositeOperation = 'lighter'; glow(n.x, n.y, n.R * (.6 + p * .6), n.big ? '#ffb000' : '#ff7a3d', .6 * (1 - p)); cx.strokeStyle = '#fff2c0'; cx.globalAlpha = 1 - p; cx.lineWidth = 3; cx.beginPath(); cx.arc(n.x, n.y, n.R * p, 0, TAU); cx.stroke(); cx.restore(); }
    for (const l of this.lash) { const p = 1 - l.t / .3; cx.save(); cx.strokeStyle = '#5dff7a'; cx.globalAlpha = 1 - p; cx.lineWidth = 5; cx.setLineDash([10, 7]); cx.lineDashOffset = -p * 60; cx.beginPath(); cx.arc(l.x, l.y, l.R * (.7 + p * .3), 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.restore(); }
    for (const f of this.tf) { const p = 1 - f.t / .7; cx.save(); cx.globalAlpha = (1 - p) * .5; cx.fillStyle = 'rgba(125,249,255,.18)'; cx.beginPath(); cx.arc(f.x, f.y, f.R, 0, TAU); cx.fill();
      cx.globalAlpha = 1 - p; cx.strokeStyle = '#7df9ff'; cx.lineWidth = 3; cx.beginPath(); cx.arc(f.x, f.y, f.R, 0, TAU); cx.stroke();
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU - p * 2; cx.beginPath(); cx.moveTo(f.x + Math.cos(a) * (f.R - 12), f.y + Math.sin(a) * (f.R - 12)); cx.lineTo(f.x + Math.cos(a) * f.R, f.y + Math.sin(a) * f.R); cx.stroke(); }
      cx.lineWidth = 4; cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(f.x + Math.cos(-Math.PI / 2 + p * TAU) * f.R * .6, f.y + Math.sin(-Math.PI / 2 + p * TAU) * f.R * .6); cx.stroke(); cx.restore(); }
  }
};
{ // hook into the weapon pipeline next to WEAPONS 4
  const r0 = W4.reset.bind(W4); W4.reset = function () { r0(); W5.reset(); };
  const s0 = W4.onSlash.bind(W4); W4.onSlash = function (a) { s0(a); W5.onSlash(a); };
  const e0 = W4.dashEnd.bind(W4); W4.dashEnd = function () { if (W5_IDS[P.w.id]) W5.dashEnd(); else e0(); };
  const h0 = W4.onHit.bind(W4); W4.onHit = function (e, d, a, k) { h0(e, d, a, k); if (W5_IDS[P.w.id]) W5.onHit(e, d, a, k); };
  const u0 = W4.update.bind(W4); W4.update = function (dt) { u0(dt); W5.update(dt); };
  const d0 = W4.draw.bind(W4); W4.draw = function () { d0(); W5.draw(); };
}
/* ---------------- art: held weapons, swings, effects, sounds ---------------- */
Object.assign(GRIP, { eclipse: [10, 4], nova: [3, 0], serpent: [3, 0], chrono: [9, 3] });
Object.assign(SW_DUR, { eclipse: .58, nova: .34, serpent: .44, chrono: .38 });
Object.assign(SW_COL, { eclipse: '#c99bff', nova: '#ffb000', serpent: '#5dff7a', chrono: '#7df9ff' });
Object.assign(WFX_STYLE, { eclipse: { w: 14, c: '#b537f2' }, nova: { w: 9, c: '#ffb000' }, serpent: { w: 4, c: '#5dff7a' }, chrono: { w: 6, c: '#7df9ff' } });
Object.assign(HAPTIC, { w_eclipse: [2, [12, 120, 40]], w_nova: [1, [8, 30, 14]], w_serpent: [1, [4, 50, 4, 50, 8]], w_chrono: [1, [3, 120, 3, 120, 20]] });
Object.assign(SW4R, { eclipse: [.55, 1.15], nova: [.3, .8], serpent: [.5, 1.05], chrono: [.45, 1.05] });
Object.assign(SW4, {
  eclipse(o, u, d) { const w = seg(u, 0, .32), cut = seg(u, .32, .52); o.r = cut <= 0 ? .9 - .1 * eo(w) : .8 + .45 * eo(cut); if (u > .6) o.r = 1.25 - .25 * seg(u, .6, 1); o.sx = cut > 0 && cut < 1 ? 1.25 : 1; o.sy = cut > 0 && cut < 1 ? .85 : 1;
    const off = cut <= 0 ? -d * 2.6 * eo(w) : -d * 2.6 + d * 5.2 * eo(cut); o.face = off * .35; return off; }, // a long wind-up, then one huge arc
  nova(o, u, d) { const k = u < .45 ? 0 : 1, lu = k ? seg(u, .45, .75) : seg(u, 0, .3); o.r = .7 + .55 * Math.sin(Math.PI * lu); o.sx = 1 + .25 * Math.sin(Math.PI * lu); o.sy = 1 - .12 * Math.sin(Math.PI * lu); return (k ? d : -d) * (.35 - .2 * eo(lu)); }, // a jab, then a cross
  serpent(o, u, d) { o.lash = u; o.r = .7 + .65 * Math.sin(Math.PI * seg(u, 0, .7)); const off = d * (-2.4 + 4.4 * eo(u / .5)) + Math.sin(u * 18) * .12 * (1 - u); o.face = off * .15; return off; }, // a wide whipping S
  chrono(o, u, d) { const a = seg(u, 0, .2), hold = u >= .2 && u < .34, b = seg(u, .34, .5); o.r = 1.05; const off = hold ? d * 1.4 : u < .2 ? -d * 1.8 + d * 3.2 * eo(a) : d * 1.4 - d * 3.6 * eo(b); o.face = off * .25; o.sx = hold ? 1.08 : 1; return off; } // a cut, a frozen beat, a cut back
});
Object.assign(W4ART, {
  eclipse(o, c, s, L, bc, edge, gc, glitch, own) { // a long black odachi, violet edge, a crescent-moon guard
    const px = -s, py = c, r0 = 13, r1 = L * 1.2;
    cx.strokeStyle = '#2a1a3a'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(-c * 4, -s * 4); cx.lineTo(c * r0, s * r0); cx.stroke();
    cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2.4; cx.beginPath(); cx.arc(c * 11, s * 11, 6, Math.atan2(s, c) + .6, Math.atan2(s, c) + 5.7); cx.stroke();
    cx.fillStyle = glitch ? '#ff2bd6' : '#120618'; cx.beginPath(); cx.moveTo(c * r0 + px * 4, s * r0 + py * 4); cx.quadraticCurveTo(c * (r1 * .6) + px * 7, s * (r1 * .6) + py * 7, c * r1 + px * 1.5, s * r1 + py * 1.5); cx.lineTo(c * r1, s * r1); cx.quadraticCurveTo(c * (r1 * .6) + px * 1, s * (r1 * .6) + py * 1, c * r0 - px * 3, s * r0 - py * 3); cx.closePath(); cx.fill();
    cx.save(); cx.strokeStyle = own ? '#e0c8ff' : bc; cx.shadowColor = '#b537f2'; cx.shadowBlur = 10; cx.lineWidth = 1.8; cx.beginPath(); cx.moveTo(c * r0 + px * 4, s * r0 + py * 4); cx.quadraticCurveTo(c * (r1 * .6) + px * 7, s * (r1 * .6) + py * 7, c * r1 + px * 1.5, s * r1 + py * 1.5); cx.stroke(); cx.restore();
    hglow(c * r1 * .7, s * r1 * .7, 34, own ? '#b537f2' : gc, .4); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  },
  nova(o, c, s, L, bc, edge, gc, glitch, own) { // a star-core gauntlet with four burning knuckles
    const a = Math.atan2(s, c), cl = own ? '#ffb000' : bc, pul = .7 + .3 * Math.sin(o.t * 20);
    cx.save(); cx.rotate(a); rrect(-6, -8, 16, 16, 4); cx.fillStyle = '#2a1a0a'; cx.fill(); cx.strokeStyle = cl; cx.lineWidth = 1.8; cx.stroke();
    for (let k = -1.5; k <= 1.5; k++) { cx.fillStyle = glitch ? '#ff2bd6' : '#ffe9a0'; cx.globalAlpha = pul; dot(11, k * 3.6, 2.2); } cx.globalAlpha = 1;
    cx.fillStyle = '#fff6d0'; dot(2, 0, 3); cx.restore(); hglow(c * 10, s * 10, 26, own ? '#ff7a00' : gc, .5 * pul);
  },
  serpent(o, c, s, L, bc, edge, gc, glitch, own) { // a scaled chain that waves, with a viper head at the tip
    const px = -s, py = c, n = 9, len = L * 1.25, cl = own ? '#5dff7a' : bc; let lx = 0, ly = 0;
    for (let k = 1; k <= n; k++) { const d = k / n * len, w = Math.sin(o.t * 12 - k * .9) * 4 * (k / n); const x = c * d + px * w, y = s * d + py * w;
      cx.strokeStyle = k % 2 ? '#1a3a20' : cl; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(x, y); cx.stroke(); lx = x; ly = y; }
    cx.fillStyle = glitch ? '#ff2bd6' : cl; cx.beginPath(); cx.moveTo(lx + c * 9, ly + s * 9); cx.lineTo(lx + px * 5, ly + py * 5); cx.lineTo(lx - px * 5, ly - py * 5); cx.closePath(); cx.fill();
    cx.fillStyle = '#ff2a4a'; dot(lx + c * 3 + px * 2, ly + s * 3 + py * 2, 1.2); hglow(lx, ly, 18, gc, .35);
  },
  chrono(o, c, s, L, bc, edge, gc, glitch, own) { // a clock-gear guard and a segmented blade of stopped seconds
    const r0 = 12, r1 = L * 1.05, cl = own ? '#7df9ff' : bc;
    cx.strokeStyle = '#3a3a52'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(-c * 3, -s * 3); cx.lineTo(c * 8, s * 8); cx.stroke();
    cx.save(); cx.translate(c * 10, s * 10); cx.rotate(o.t * 3); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, 5, 0, TAU); cx.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; cx.beginPath(); cx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); cx.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5); cx.stroke(); } cx.restore();
    for (let k = 0; k < 6; k++) { const a0 = r0 + (r1 - r0) * k / 6 + 1, a1 = r0 + (r1 - r0) * (k + 1) / 6 - 1; cx.strokeStyle = glitch ? '#ff2bd6' : k % 2 ? cl : '#e8ffff'; cx.lineWidth = 4.2 - k * .3; cx.beginPath(); cx.moveTo(c * a0, s * a0); cx.lineTo(c * a1, s * a1); cx.stroke(); }
    hglow(c * r1 * .6, s * r1 * .6, 30, own ? '#7df9ff' : gc, .4); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  }
});
{
  const sw0 = WFX4.swing.bind(WFX4); WFX4.swing = function (w, a, x, y, c) {
    if (w === 'eclipse') { FX.arc(x, y, a, 92, '#b537f2', 12); FX.arc(x, y, a, 70, '#e0c8ff', 3); return; }
    if (w === 'nova') { FX.ring(x + Math.cos(a) * 24, y + Math.sin(a) * 24, 26, '#ffb000', 3); return; }
    if (w === 'serpent') { FX.arc(x, y, a, 64, '#5dff7a', 4); return; }
    if (w === 'chrono') { FX.arc(x, y, a, 60, '#7df9ff', 5); FX.ring(x, y, 36, 'rgba(125,249,255,.5)', 2); return; }
    sw0(w, a, x, y, c);
  };
  Object.assign(W4SND.slash, {
    eclipse(b, t) { this.tone(90, 40, .4, .14, 'sawtooth'); this.noise(.3, .1, 400, 2400, 'bandpass'); this.tone(1800, 600, .2, .03, 'sine', t + .05); },
    nova(b, t) { this.noise(.08, .14, 1200, 200); this.tone(160 + b * .3, 60, .12, .14, 'square'); },
    serpent(b, t) { this.noise(.1, .08, 5000, 1500, 'bandpass'); this.tone(700 + b, 1400 + b, .08, .04, 'sawtooth', t + .03); },
    chrono(b, t) { this.tone(2000, 2000, .02, .06, 'square'); this.tone(1500, 1500, .02, .05, 'square', t + .08); this.tone(600 + b, 1200 + b, .2, .04, 'sine', t + .1); }
  });
}
/* ---------------- six MYTHIC heroes ---------------- */
SKINS.push(
  { id: 'neonshogun', name: 'NEON SHOGUN', body: 'shogun', a: '#ffd23f', b: '#1a1a2a', cost: 12000, desc: 'Black lacquer armor with gold neon seams and a crescent crest.' },
  { id: 'chromeoni', name: 'CHROME ONI', body: 'oni', a: '#e8f0ff', b: '#ff0844', cost: 12500, desc: 'A mirror-chrome demon mask over red armor.' },
  { id: 'phantomfox', name: 'PHANTOM FOX', body: 'kitsune', a: '#ff4fd8', b: '#ffffff', cost: 15000, desc: 'A pink spirit fox that leaves a glowing tail of light.' },
  { id: 'starseraph', name: 'STAR SERAPH', body: 'seraph', a: '#ffd23f', b: '#7a3aff', cost: 14000, desc: 'Golden wings and a violet halo of starlight.' },
  { id: 'voidking', name: 'VOID SOVEREIGN', body: 'sovereign', a: '#b537f2', b: '#0a0614', cost: 16000, desc: 'A crowned war frame of black void steel.' },
  { id: 'stormdragon', name: 'STORM DRAGON', body: 'dragon', a: '#7df9ff', b: '#1a2a6a', cost: 17000, desc: 'A lightning-blue dragon helm with crackling horns.' }
);
