/* =====================================================================
   EVENT REWARDS ART (version 22): the PUMPKIN KING and NEON YETI heroes,
   the BATLING and PENGUIN BOT pets, and the CANDY CORN and FROSTBITE
   blade skins (decoration, trail, kill burst).
   ===================================================================== */
Object.assign(FOOT, { pumpkin: 'boot', yeti: 'claw' });
Object.assign(FOOTC, { pumpkin: '#2a1a40', yeti: '#e8f4ff' });
Object.assign(HANDC, { pumpkin: ['#2a1a40', '#0a0614'], yeti: ['#f4f8ff', '#8aa4c0'] });
Object.assign(TRAIL4, {
  pumpkin(sc, ca, cb) { // a tattered purple cape
    cx.strokeStyle = '#1a0a2a'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 7; i++) cx.lineTo(sc[i * 2] + (i % 2 ? 3 : -3), sc[i * 2 + 1]); cx.stroke();
    cx.strokeStyle = cb; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 7; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
  },
  yeti(sc, ca, cb) { const ga = cx.globalAlpha; cx.fillStyle = '#ffffff'; for (let i = 2; i < 10; i += 2) { cx.globalAlpha = ga * (.5 - i * .04); dot(sc[i * 2], sc[i * 2 + 1], 3 - i * .2); } cx.globalAlpha = ga; } // a puff of snow
});
Object.assign(BODY, {
  pumpkin(o, sw) {
    pads(sw, '#2a1a40', o.cb, 12, 7, -8);
    cx.beginPath(); cx.arc(-2, 0, 11.5, 0, TAU); cx.fillStyle = '#1a0a2a'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.6; cx.stroke(); // cloak
    hglow(4, 0, 22, '#ff9a1a', .4 + .15 * Math.sin(o.t * 7));
    for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.ellipse(4, k * 2.6, 9.5, 3.8, 0, 0, TAU); cx.fillStyle = k % 2 ? '#e8661a' : o.ca; cx.fill(); } // ridged pumpkin head
    cx.strokeStyle = '#8a3a00'; cx.lineWidth = 1; for (let k = -1; k <= 1; k += 2) { cx.beginPath(); cx.ellipse(4, 0, 9.5, 9, 0, k < 0 ? 1.8 : -1.3, k < 0 ? 4.4 : 1.3); cx.stroke(); }
    const fl = .7 + .3 * Math.sin(o.t * 11); cx.fillStyle = 'rgba(255,225,77,' + fl.toFixed(2) + ')'; // the carved face glows
    for (const sd of [-1, 1]) { cx.beginPath(); cx.moveTo(8, sd * 1.5); cx.lineTo(11.5, sd * 4.5); cx.lineTo(8, sd * 6); cx.closePath(); cx.fill(); }
    cx.beginPath(); cx.moveTo(12.5, -3.5); cx.lineTo(13.5, 0); cx.lineTo(12.5, 3.5); cx.lineTo(11.5, 1.5); cx.lineTo(12.2, 0); cx.lineTo(11.5, -1.5); cx.closePath(); cx.fill();
    cx.strokeStyle = '#3a6a10'; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(-4, 0); cx.quadraticCurveTo(-8, -2, -9, -6); cx.stroke(); // the stem points back
  },
  yeti(o, sw) {
    spikyRing(-2, 20, 12, 16); cx.fillStyle = '#e8f4ff'; cx.fill(); cx.strokeStyle = '#8aa4c0'; cx.lineWidth = 1.2; cx.stroke(); // shaggy fur
    pads(sw, '#f4f8ff', '#bfd4e8', 12, 8, -8);
    cx.beginPath(); cx.arc(-2, 0, 11, 0, TAU); cx.fillStyle = '#f4f8ff'; cx.fill();
    cx.beginPath(); cx.ellipse(5, 0, 7.5, 7, 0, 0, TAU); cx.fillStyle = '#5a8ab0'; cx.fill(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.stroke(); // blue face
    for (const sd of [-1, 1]) { cx.fillStyle = o.ca; cx.beginPath(); cx.moveTo(2, sd * 6); cx.quadraticCurveTo(-2, sd * 13, 4, sd * 15); cx.lineTo(5, sd * 7); cx.fill(); } // ice horns
    hglow(8, 0, 12, o.ca, .7); cx.fillStyle = o.ca; dot(8, -2.6, 1.6); dot(8, 2.6, 1.6);
    cx.fillStyle = '#ffffff'; cx.fillRect(10.5, -2, 1.4, 1.6); cx.fillRect(10.5, .4, 1.4, 1.6); // tusks
  }
});
Object.assign(PET4, {
  batling(W) {
    const near = []; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.type !== ET.COURIER) { const d = dist(e.x, e.y, P.x, P.y); if (d < 320) near.push([d, e]); } }
    if (!near.length) { this.cd = .5; return; }
    near.sort((a, b) => a[0] - b[0] || a[1].uid - b[1].uid); this.cd = this.period(); this.uses++; this.fx = .5; this.happy = .6; const s = 1.2 + .2 * (this.lv() - 1);
    for (const [, e] of near.slice(0, 2)) { e.stun = Math.max(e.stun, e.mb ? .3 : s); FX.ring(e.x, e.y, e.r + 14, '#b537f2', 3); FX.text(e.x, e.y - e.r - 12, lt('SCREECH!'), '#d9a8ff', 11); }
    Aud.tone(2400, 3200, .12, .05, 'square');
  },
  penguin(W) {
    const e = this.near(P.x, P.y, 360); if (!e) { this.cd = .5; return; }
    this.cd = this.period(); this.uses++; this.act = .45; this.ax = e.x; this.ay = e.y; this.happy = .6;
    if (!damageEnemy(e, W * 1.3, Math.atan2(e.y - this.y, e.x - this.x), 2) && e.alive) e.stun = Math.max(e.stun, e.mb ? .3 : 1.2);
    FX.ring(e.x, e.y, 34, '#bff4ff', 3); FX.spark(e.x, e.y, '#ffffff', 10); Aud.tone(1600, 900, .2, .05, 'sine');
  }
});
Object.assign(PET4D, {
  batling() { if (this.fx <= 0) return; cx.save(); cx.globalAlpha = this.fx * 1.6; cx.strokeStyle = '#d9a8ff'; cx.lineWidth = 2; for (let k = 0; k < 3; k++) { cx.beginPath(); cx.arc(this.x, this.y - 14, 10 + k * 8 + (1 - this.fx) * 30, 0, TAU); cx.stroke(); } cx.restore(); this.fx -= RDT; }
});
Object.assign(PET4ART, {
  batling(leg, t, att) {
    const fl = Math.sin(t * 18); cx.translate(0, -14 + Math.sin(t * 4) * 3); hglow(0, 0, 16, '#b537f2', att ? .8 : .4);
    for (const s of [-1, 1]) { cx.save(); cx.scale(1, s); cx.rotate(fl * .4); cx.fillStyle = '#2a0a3a'; cx.beginPath(); cx.moveTo(0, -2); cx.quadraticCurveTo(-4, -10, -2, -14); cx.lineTo(1, -10); cx.lineTo(3, -13); cx.lineTo(5, -9); cx.lineTo(8, -11); cx.quadraticCurveTo(6, -5, 2, -2); cx.fill(); cx.strokeStyle = '#b537f2'; cx.lineWidth = 1; cx.stroke(); cx.restore(); }
    cx.fillStyle = '#1a0624'; cx.beginPath(); cx.ellipse(1, 0, 5, 4, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.moveTo(2, -3); cx.lineTo(1, -7); cx.lineTo(4, -3.5); cx.fill(); cx.beginPath(); cx.moveTo(4, -3); cx.lineTo(6, -6.5); cx.lineTo(6, -2.5); cx.fill();
    cx.fillStyle = '#ff2bd6'; dot(3, -1, .9); dot(5.5, -1, .9); cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(3.5, 1.5); cx.lineTo(4, 3); cx.lineTo(4.5, 1.5); cx.fill();
  },
  penguin(leg, t, att) {
    const sl = att ? .9 : 0; cx.save(); cx.rotate(sl * 1.4);
    cx.fillStyle = '#1a2436'; cx.beginPath(); cx.ellipse(0, 0, 7, 9, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#9fe8ff'; cx.lineWidth = 1.2; cx.stroke();
    cx.fillStyle = '#f4f8ff'; cx.beginPath(); cx.ellipse(1.5, 1.5, 4.5, 6.5, 0, 0, TAU); cx.fill(); // white belly
    cx.fillStyle = '#ffb347'; cx.beginPath(); cx.moveTo(6, -4); cx.lineTo(10, -3); cx.lineTo(6, -2); cx.closePath(); cx.fill(); // beak
    cx.fillStyle = '#9fe8ff'; dot(3.5, -5, 1.6); hglow(3.5, -5, 6, '#9fe8ff', .7); // visor eye
    cx.fillStyle = '#ffb347'; cx.fillRect(-3 + leg * .5, 8, 3, 2); cx.fillRect(1 - leg * .5, 8, 3, 2);
    cx.strokeStyle = '#8aa4c0'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(-2, -9); cx.lineTo(-3, -13); cx.stroke(); cx.fillStyle = '#e02030'; dot(-3, -13, 1.3); // antenna
    cx.restore();
  }
});
Object.assign(TRAIL_FX4, {
  candy(p) { p.k = rnd() < .5 ? 0 : 3; p.c = ['#ff9a1a', '#ffe14d', '#fff4d0', '#b537f2'][(rnd() * 4) | 0]; p.s = 2.6 + rnd() * 1.4; p.dl = 1.3; },
  snowstar(p) { p.k = rnd() < .5 ? 10 : 4; p.c = rnd() < .6 ? '#ffffff' : '#bff4ff'; p.s = 2.6 + rnd() * 1.6; p.dl = 1.2; p.vy += 30; }
});
Object.assign(KILL4, {
  candy(e, x, y, burst) { burst(16, 0, '#ff9a1a', '#ffe14d', 1.1, 3); burst(8, 3, '#fff4d0', '#b537f2', .8, 3); this.ring(x, y, e.r * 2.6, '#ff9a1a', 3); },
  snowburst(e, x, y, burst) { burst(16, 10, '#ffffff', '#bff4ff', .9, 3); burst(10, 6, '#e8f4ff', '#ffffff', .6, 5); this.ring(x, y, e.r * 2.6, '#bff4ff', 3); }
});
Object.assign(DECO4, {
  stripes(c, s, r0, r1, o, px, py, L) { const cols = ['#ffe14d', '#fff4d0']; for (let k = 0; k < 6; k++) { const d0 = r0 + L * k / 6, d1 = d0 + L / 12; cx.strokeStyle = cols[k % 2]; cx.lineWidth = 3.4; cx.beginPath(); cx.moveTo(c * d0, s * d0); cx.lineTo(c * d1, s * d1); cx.stroke(); } },
  snowflake(c, s, r0, r1, o, px, py, L) { for (let k = 0; k < 2; k++) { const d = r0 + L * ((k * .5 + o.t * .4) % 1), x = c * d, y = s * d, a0 = o.t * 3 + k; cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.beginPath(); for (let j = 0; j < 3; j++) { const a = a0 + j * Math.PI / 3; cx.moveTo(x - Math.cos(a) * 4.5, y - Math.sin(a) * 4.5); cx.lineTo(x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5); } cx.stroke(); } }
});
