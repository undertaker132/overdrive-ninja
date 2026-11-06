/* =====================================================================
   PETS 4 (version 21) — three ancient and three futuristic companions:
     SUN SCARAB   every 9s rolls a small sun at the nearest enemy (burst)
     KOMAINU      every 12s roars: stuns every enemy near you
     FIRE PHOENIX every 14s circles you in flame: burns enemies + bullets
     MINI SAUCER  every 10s beams up a weak enemy, or zaps a strong one
     NANO SWARM   grinds at every enemy that gets close, all the time
     K9-UNIT      every 8s fires three homing missiles (four at level 4)
   Sim time only, no random numbers (replays stay exact).
   ===================================================================== */
const PET4 = {
  scarab(W) {
    const e = this.near(P.x, P.y, 380); if (!e) { this.cd = .5; return; }
    this.cd = this.period(); this.uses++; this.fx = .45; this.fxx = e.x; this.fxy = e.y; this.happy = .5;
    for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o.al <= 0 && dist(o.x, o.y, e.x, e.y) < 90 + o.r) damageEnemy(o, W * 1.3, Math.atan2(o.y - e.y, o.x - e.x), 2); }
    const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, e.x, e.y) < 90 + B.r) Boss.hitBody(B, W * 1.3, 0, false, e.x, e.y);
    FX.boom(e.x, e.y, 90, '#ffd23f'); Aud.sfx('boom', 0);
  },
  komainu(W) {
    let n = 0; const s = 1 + .2 * (this.lv() - 1);
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || dist(e.x, e.y, P.x, P.y) > 170 + e.r) continue; e.stun = Math.max(e.stun, (e.mb ? .3 : 1) * s); n++; }
    if (!n) { this.cd = .5; return; }
    this.cd = this.period(); this.uses++; this.fx = .6; this.happy = .8;
    FX.ring(P.x, P.y, 170, '#7dd8c8', 5); FX.ring(P.x, P.y, 110, '#ffffff', 2); FX.text(this.x, this.y - 22, lt('ROAR!'), '#7dd8c8', 14, true); shake(.2); Aud.tone(180, 90, .3, .08, 'sawtooth');
  },
  phoenix(W) {
    let n = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && dist(e.x, e.y, P.x, P.y) < 130 + e.r) n++; }
    for (let i = 0; i < BU.n; i++) { const b = BU.a[i]; if (b.alive && !b.rf && dist(b.x, b.y, P.x, P.y) < 130) n++; }
    if (!n) { this.cd = .5; return; }
    this.cd = this.period(); this.uses++; this.fx = .7; this.happy = .8;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && dist(e.x, e.y, P.x, P.y) < 130 + e.r) damageEnemy(e, W, Math.atan2(e.y - P.y, e.x - P.x), 2); }
    for (let i = 0; i < BU.n; i++) { const b = BU.a[i]; if (b.alive && !b.rf && dist(b.x, b.y, P.x, P.y) < 130) { b.alive = false; FX.spark(b.x, b.y, '#ff9a00', 3); } }
    const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, P.x, P.y) < 130 + B.r) Boss.hitBody(B, W, 0, false, P.x, P.y);
    FX.ring(P.x, P.y, 130, '#ff6a00', 6); FX.ring(P.x, P.y, 100, '#ffd23f', 3); Aud.sfx('boom', 0);
  },
  saucer(W) {
    const e = this.near(P.x, P.y, 340); if (!e) { this.cd = .5; return; }
    this.cd = this.period(); this.uses++; this.fx = .5; this.fxx = e.x; this.fxy = e.y; this.happy = .5;
    if (!e.mb && !e.elite && e.hp <= W * 3) { FX.text(e.x, e.y - e.r - 12, lt('BEAMED UP'), '#7dff6a', 12); damageEnemy(e, 999, -1.57, 2); }
    else damageEnemy(e, W * 1.4, -1.57, 2);
    FX.ring(e.x, e.y, e.r + 16, '#7dff6a', 3); Aud.tone(900, 1800, .25, .05, 'sine');
  },
  nano(W) {
    this.cd = this.period(); const d = W * .12;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.spawnT <= 0 && dist(e.x, e.y, P.x, P.y) < 64 + e.r) { damageEnemy(e, d, 0, 2); this.uses++; } }
  },
  k9(W) {
    let any = false; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].al <= 0) { any = true; break; }
    if (!any && !(Boss.cur && Boss.cur.dying <= 0)) { this.cd = .5; return; }
    this.cd = this.period(); this.uses++; this.happy = .5; const n = this.lv() >= 4 ? 4 : 3;
    for (let k = 0; k < n; k++) shard(this.x, this.y - 6, -1.57 + (k - (n - 1) / 2) * .6, 420, '#ff9a3d', .8 * P.w.dmg * (1 + .15 * (this.lv() - 1)));
    FX.spark(this.x, this.y - 6, '#ffd23f', 6); Aud.sfx('laser');
  }
};
const PET4D = { // world-space effects (render only; fx counts down on the render clock)
  scarab() { if (this.fx <= 0) return; const k = 1 - this.fx / .45, x = lerp(this.x, this.fxx, k), y = lerp(this.y, this.fxy, k) - Math.sin(k * Math.PI) * 30; glow(x, y, 22, '#ffd23f', .8); cx.fillStyle = '#fff3c4'; dot(x, y, 5); this.fx -= RDT; },
  komainu() { if (this.fx <= 0) return; cx.save(); cx.globalAlpha = this.fx; cx.strokeStyle = '#7dd8c8'; cx.lineWidth = 2; for (let k = 0; k < 3; k++) { cx.beginPath(); cx.arc(this.x, this.y - 4, 14 + k * 9 + (1 - this.fx) * 30, -.7, .7); cx.stroke(); } cx.restore(); this.fx -= RDT; },
  phoenix() { if (this.fx <= 0) return; const r = 130 * (1 - this.fx * .4); cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = Math.min(1, this.fx * 2);
    for (let k = 0; k < 14; k++) { const a = k * TAU / 14 + CAM.t * 3, x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r; glow(x, y, 18, k % 2 ? '#ff6a00' : '#ffd23f', .7); } cx.restore(); this.fx -= RDT; },
  saucer() { if (this.fx <= 0) return; cx.save(); cx.globalAlpha = Math.min(1, this.fx * 3) * .7; const g = cx.createLinearGradient(this.x, this.y - 14, this.fxx, this.fxy); g.addColorStop(0, 'rgba(125,255,106,.9)'); g.addColorStop(1, 'rgba(125,255,106,.1)');
    cx.fillStyle = g; cx.beginPath(); cx.moveTo(this.x - 4, this.y - 14); cx.lineTo(this.fxx - 18, this.fxy + 10); cx.lineTo(this.fxx + 18, this.fxy + 10); cx.lineTo(this.x + 4, this.y - 14); cx.closePath(); cx.fill(); cx.restore(); this.fx -= RDT; },
  nano() { cx.save(); cx.fillStyle = '#c9d6ff'; for (let k = 0; k < 18; k++) { const a = CAM.t * (1.5 + (k % 3) * .4) + k * 2.4, r = 30 + Math.sin(CAM.t * 2 + k) * 14 + (k % 4) * 5; cx.globalAlpha = .5 + .4 * Math.sin(CAM.t * 7 + k); cx.fillRect(P.x + Math.cos(a) * r - 1, P.y + Math.sin(a) * r - 1, 2, 2); } cx.restore(); }
};
const PET4ART = { // pet bodies, local frame facing right
  scarab(leg, t, att) {
    cx.strokeStyle = '#5a3a00'; cx.lineWidth = 1.2; for (let k = -1; k <= 1; k++) { const w = Math.sin(t * 14 + k) * 1.5; cx.beginPath(); cx.moveTo(k * 4, 3); cx.lineTo(k * 5 + w, 8); cx.moveTo(k * 4, -3); cx.lineTo(k * 5 - w, -7); cx.stroke(); }
    cx.fillStyle = '#c08a10'; cx.beginPath(); cx.ellipse(0, 0, 8, 6, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 1.2; cx.stroke();
    cx.strokeStyle = '#5a3a00'; cx.beginPath(); cx.moveTo(-8, 0); cx.lineTo(4, 0); cx.stroke(); cx.fillStyle = '#7dd8c8'; dot(-3, -2.6, 1); dot(-3, 2.6, 1); // lapis inlay
    cx.fillStyle = '#8a5a00'; cx.beginPath(); cx.arc(8, 0, 3, 0, TAU); cx.fill();
    hglow(0, -12, 14, '#ffd23f', att ? .9 : .5); cx.fillStyle = '#ffd23f'; dot(0, -12, 3.6); cx.strokeStyle = '#fff3c4'; cx.lineWidth = .8; cx.beginPath(); cx.arc(0, -12, 5, 0, TAU); cx.stroke(); // the sun it carries
  },
  komainu(leg, t, att) {
    cx.strokeStyle = '#3a7a6a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-6, 4); cx.lineTo(-7 + leg, 10); cx.moveTo(5, 4); cx.lineTo(6 - leg, 10); cx.stroke();
    cx.fillStyle = '#5ab8a8'; cx.beginPath(); cx.ellipse(-1, 1, 9, 6, 0, 0, TAU); cx.fill();
    cx.strokeStyle = '#5ab8a8'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(-9, -1); cx.quadraticCurveTo(-15, -8, -10, -11); cx.stroke(); cx.fillStyle = '#3a8a7a'; dot(-10, -11, 2.6); // curled tail
    cx.fillStyle = '#3a8a7a'; for (let k = 0; k < 7; k++) { const a = k * TAU / 7; dot(7 + Math.cos(a) * 5.5, -4 + Math.sin(a) * 5.5, 2.4); } // curly mane
    cx.fillStyle = '#7dd8c8'; cx.beginPath(); cx.arc(8, -4, 4.6, 0, TAU); cx.fill();
    cx.fillStyle = att ? '#ff3b3b' : '#1a3a34'; cx.beginPath(); cx.moveTo(10, -2); cx.lineTo(13.5, -1); cx.lineTo(10.5, 0); cx.closePath(); cx.fill(); // open mouth
    cx.fillStyle = '#ffd23f'; dot(9.5, -5.5, 1.1); cx.strokeStyle = '#e8fff8'; cx.lineWidth = .8; cx.beginPath(); cx.ellipse(-1, 1, 9, 6, 0, -2.5, -.6); cx.stroke();
  },
  phoenix(leg, t, att) {
    const fl = Math.sin(t * 12) * .6; cx.translate(0, -12 + Math.sin(t * 3) * 2); hglow(0, 0, 22, '#ff6a00', att ? .8 : .45);
    for (let k = -1; k <= 1; k++) { cx.strokeStyle = k ? '#ff9a00' : '#ffd23f'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-5, 0); cx.quadraticCurveTo(-12, k * 4 + Math.sin(t * 6 + k) * 2, -20, k * 7 + 3); cx.stroke(); } // tail feathers
    for (const s of [-1, 1]) { cx.save(); cx.scale(1, s); cx.rotate(fl * .5); cx.fillStyle = '#ff6a00'; cx.beginPath(); cx.moveTo(-2, 0); cx.quadraticCurveTo(-6, -10, 2, -14); cx.lineTo(0, -9); cx.lineTo(5, -11); cx.lineTo(3, -2); cx.closePath(); cx.fill(); cx.restore(); }
    cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.ellipse(0, 0, 6, 3.6, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.arc(6, -1, 3, 0, TAU); cx.fill();
    cx.fillStyle = '#ff6a00'; cx.beginPath(); cx.moveTo(5, -3.5); cx.lineTo(3, -8); cx.lineTo(7, -4); cx.closePath(); cx.fill(); // crest
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(8.5, -1.5); cx.lineTo(12, -.6); cx.lineTo(8.5, .4); cx.closePath(); cx.fill(); cx.fillStyle = '#1a0a04'; dot(7, -1.6, .8);
  },
  saucer(leg, t, att) {
    cx.translate(0, -14 + Math.sin(t * 2.5) * 2.5);
    cx.fillStyle = 'rgba(125,255,106,.25)'; cx.beginPath(); cx.arc(0, -3, 6, Math.PI, 0); cx.fill(); cx.strokeStyle = '#bfffb0'; cx.lineWidth = 1; cx.stroke(); // dome
    cx.fillStyle = '#7dff6a'; dot(0, -4, 1.8); // the tiny pilot
    cx.fillStyle = '#8a94aa'; cx.beginPath(); cx.ellipse(0, 0, 13, 4, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#e8eef8'; cx.lineWidth = 1; cx.stroke();
    for (let k = 0; k < 6; k++) { cx.fillStyle = ((t * 8 | 0) + k) % 3 === 0 ? '#7dff6a' : '#2a4a2a'; dot(-10 + k * 4, .6, 1.2); }
    hglow(0, 4, 12, '#7dff6a', att ? .8 : .35);
  },
  nano(leg, t, att) {
    cx.translate(0, -8 + Math.sin(t * 3) * 2); hglow(0, 0, 16, '#c9d6ff', .5);
    cx.fillStyle = '#1a2038'; cx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + t; k ? cx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5) : cx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); } cx.closePath(); cx.fill(); cx.strokeStyle = '#c9d6ff'; cx.lineWidth = 1.2; cx.stroke();
    cx.fillStyle = '#c9d6ff'; for (let k = 0; k < 10; k++) { const a = t * 3 + k * .63, r = 8 + (k % 3) * 2.5; cx.fillRect(Math.cos(a) * r - .8, Math.sin(a) * r * .7 - .8, 1.6, 1.6); }
  },
  k9(leg, t, att) {
    cx.strokeStyle = '#3a4458'; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(-6, 4); cx.lineTo(-7 + leg, 10); cx.moveTo(5, 4); cx.lineTo(6 - leg, 10); cx.stroke();
    cx.fillStyle = '#5a6478'; rrect(-9, -3, 17, 8, 2); cx.fill(); cx.strokeStyle = '#ff9a3d'; cx.lineWidth = 1; cx.stroke();
    cx.fillStyle = '#2a3340'; cx.fillRect(-6, -7, 9, 4); cx.fillStyle = '#ff3b3b'; for (let k = 0; k < 3; k++) dot(-4.5 + k * 3, -5, 1); // missile pack
    cx.fillStyle = '#6a7488'; rrect(6, -7, 8, 7, 2); cx.fill(); cx.fillStyle = '#ff9a3d'; cx.fillRect(10, -5.5, 3, 1.6); hglow(11.5, -4.7, 6, '#ff9a3d', .7); // visor
    cx.strokeStyle = '#8a94aa'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(7, -7); cx.lineTo(5, -12); cx.stroke(); cx.fillStyle = ((t * 3) | 0) % 2 ? '#3d8bff' : '#ff3b3b'; dot(5, -12, 1.4); // a police light
    cx.strokeStyle = '#5a6478'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-9, -1); cx.lineTo(-13, -5 + Math.sin(t * 14) * 2); cx.stroke();
  }
};
