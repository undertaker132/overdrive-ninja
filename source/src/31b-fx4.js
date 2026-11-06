/* =====================================================================
   BLADE SKINS 4 (version 21) — ten new blade looks: the decoration on
   the blade, the dash trail and the kill burst. Cosmetic only.
   New particle shapes: 10 star, 11 binary digit, 12 leaf, 13 drop,
   14 wireframe cube.
   ===================================================================== */
function PART4(p) {
  const s = p.s;
  switch (p.k) {
    case 10: cx.beginPath(); for (let j = 0; j < 8; j++) { const q = j * Math.PI / 4 + p.l * 3, r = j % 2 ? s * .35 : s; j ? cx.lineTo(p.x + Math.cos(q) * r, p.y + Math.sin(q) * r) : cx.moveTo(p.x + Math.cos(q) * r, p.y + Math.sin(q) * r); } cx.closePath(); cx.fill(); break;
    case 11: cx.font = '700 ' + (s * 2.2 | 0) + 'px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(((p.s * 10) | 0) % 2 ? '1' : '0', p.x, p.y); break;
    case 12: { const a = Math.atan2(p.vy, p.vx) + p.l * 4; cx.save(); cx.translate(p.x, p.y); cx.rotate(a); cx.beginPath(); cx.ellipse(0, 0, s, s * .45, 0, 0, TAU); cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = .6; cx.beginPath(); cx.moveTo(-s, 0); cx.lineTo(s, 0); cx.stroke(); cx.restore(); break; }
    case 13: { const a = Math.atan2(p.vy, p.vx), c = Math.cos(a), sn = Math.sin(a); cx.beginPath(); cx.arc(p.x, p.y, s * .6, 0, TAU); cx.fill(); cx.beginPath(); cx.moveTo(p.x - sn * s * .55, p.y + c * s * .55); cx.lineTo(p.x - c * s * 1.6, p.y - sn * s * 1.6); cx.lineTo(p.x + sn * s * .55, p.y - c * s * .55); cx.fill(); break; }
    case 14: { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.l * 5); cx.strokeStyle = p.c; cx.lineWidth = 1; cx.strokeRect(-s, -s, s * 2, s * 2); cx.strokeRect(-s * .4, -s * 1.4, s * 2, s * 2); cx.beginPath(); cx.moveTo(-s, -s); cx.lineTo(-s * .4, -s * 1.4); cx.moveTo(s, -s); cx.lineTo(s * 1.6, -s * 1.4); cx.moveTo(s, s); cx.lineTo(s * 1.6, s * .6); cx.stroke(); cx.restore(); break; }
  }
}
const TRAIL_FX4 = {
  plasma(p) { p.k = 1; p.c = rnd() < .5 ? '#7a5cff' : '#e0d4ff'; p.s = 1.6; p.vx *= 3; p.vy *= 3; p.dl = 3; },
  acid(p) { p.k = 13; p.c = rnd() < .6 ? '#7dff3a' : '#c8ff9a'; p.s = 2.4 + rnd() * 1.5; p.vy += 60; p.dl = 1.4; },
  holo(p) { p.k = 14; p.c = '#00f2fe'; p.s = 2 + rnd() * 1.5; p.dl = 1.6; },
  sun(p) { p.k = 2; p.c = rnd() < .5 ? '#fff3c4' : '#ffd700'; p.s = 2.6; p.dl = 1.8; },
  blood(p) { p.k = 13; p.c = rnd() < .5 ? '#c0001a' : '#ff2a4a'; p.s = 2.2 + rnd(); p.dl = 1.5; },
  stars(p) { p.k = 10; p.c = rnd() < .7 ? '#ffffff' : '#9fb8ff'; p.s = 2.4 + rnd() * 2; p.dl = 1.3; },
  leaf(p) { p.k = 12; p.c = rnd() < .5 ? '#2ecf8a' : '#9fe85a'; p.s = 3 + rnd() * 1.5; p.vy += 20; p.dl = 1.1; },
  data(p) { p.k = 11; p.c = '#3dff6a'; p.s = 3.5 + rnd() * .4; p.dl = 1.4; p.vx *= .6; p.vy *= .6; },
  aurora(p) { p.k = 2; p.c = ['#5effc8', '#7df9ff', '#b48cff', '#3dff9a'][(rnd() * 4) | 0]; p.s = 2.4; p.dl = 1.6; },
  shadow(p) { p.k = 6; p.c = rnd() < .5 ? '#1a0626' : '#4a1a6a'; p.s = 4 + rnd() * 2; p.dl = 1.4; }
};
const KILL4 = {
  plasma(e, x, y, burst) { burst(14, 1, '#7a5cff', '#e0d4ff', 1.6, 1.6); this.ring(x, y, e.r * 3, '#7a5cff', 4); for (let k = 0; k < 2; k++) { const b = rnd() * TAU; this.bolt(x, y, x + Math.cos(b) * 50, y + Math.sin(b) * 50, '#b8a0ff', .7); } },
  acid(e, x, y, burst) { burst(14, 13, '#7dff3a', '#c8ff9a', 1, 3); this.ring(x, y, e.r * 2.4, '#7dff3a', 3); this.decal(x - 14, y + 4, x + 14, y - 4, '#4a9a20', 6); },
  holo(e, x, y, burst) { burst(10, 14, '#00f2fe', '#ffffff', .9, 2.5); this.ring(x, y, e.r * 2.6, '#00f2fe', 2); glitch(.04); },
  nova(e, x, y, burst) { glow(x, y, 80, '#fff3c4', .9); this.ring(x, y, e.r * 3.6, '#ffffff', 5); this.ring(x, y, e.r * 2.2, '#ffd700', 3); burst(12, 2, '#fff3c4', '#ffd700', 1.4, 2); },
  moon(e, x, y, burst) { burst(8, 13, '#c0001a', '#ff2a4a', 1, 2.5); this.arc(x, y, rnd() * TAU, e.r * 3, '#ff2a4a', 6); this.arc(x, y, rnd() * TAU, e.r * 2.2, '#ffffff', 2); },
  stars(e, x, y, burst) { burst(16, 10, '#ffffff', '#9fb8ff', 1.1, 3); this.ring(x, y, e.r * 2.6, '#9fb8ff', 2); },
  jade(e, x, y, burst) { burst(12, 7, '#2ecf8a', '#ffd23f', 1.2, 3); this.ring(x, y, e.r * 2.4, '#ffd23f', 2); burst(6, 12, '#2ecf8a', '#9fe85a', .7, 3); },
  data(e, x, y, burst) { burst(16, 11, '#3dff6a', '#b8ffcc', .8, 3.5); this.ring(x, y, e.r * 2.2, '#3dff6a', 2); },
  aurora(e, x, y, burst) { for (let k = 0; k < 3; k++) this.ring(x, y, e.r * (2 + k * .8), ['#5effc8', '#7df9ff', '#b48cff'][k], 3); burst(10, 2, '#5effc8', '#b48cff', 1, 2); },
  shadow(e, x, y, burst) { burst(14, 6, '#1a0626', '#4a1a6a', .8, 5); this.ring(x, y, e.r * 2.4, '#c45bff', 3); burst(6, 9, '#c45bff', '#7a2aa0', .6, 2.4); }
};
const DECO4 = {
  arc(c, s, r0, r1, o, px, py, L) { if (rnd() < .7) { cx.strokeStyle = '#e0d4ff'; cx.lineWidth = 1; cx.beginPath(); let d = r0 + rnd() * L * .4; cx.moveTo(c * d + px * 3, s * d + py * 3); for (let k = 0; k < 3; k++) { d += L * .15; const sd = (k % 2 ? -1 : 1) * (3 + rnd() * 4); cx.lineTo(c * d + px * sd, s * d + py * sd); } cx.stroke(); } },
  drip(c, s, r0, r1, o, px, py, L) { cx.fillStyle = '#7dff3a'; for (let k = 0; k < 3; k++) { const d = r0 + L * (k + .5) / 3, u = (o.t * 1.2 + k * .37) % 1; dot(c * d + px * (2 + u * 7), s * d + py * (2 + u * 7), 1.6 * (1 - u * .5)); } },
  scan(c, s, r0, r1, o, px, py, L) { cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = .8; for (let k = 0; k < 4; k++) { const d = r0 + L * ((k / 4 + o.t * .9) % 1); cx.beginPath(); cx.moveTo(c * d + px * 3, s * d + py * 3); cx.lineTo(c * d - px * 3, s * d - py * 3); cx.stroke(); } },
  rays(c, s, r0, r1, o, px, py, L) { const d = r0 + L * .85, x = c * d, y = s * d; hglow(x, y, 16, '#fff3c4', .7); cx.strokeStyle = '#ffd700'; cx.lineWidth = 1; cx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + o.t * 2; cx.moveTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); cx.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); } cx.stroke(); },
  moon(c, s, r0, r1, o, px, py, L) { const x = c * (r0 + 2), y = s * (r0 + 2); cx.fillStyle = '#ff2a4a'; cx.beginPath(); cx.arc(x, y, 4.6, 0, TAU); cx.fill(); cx.fillStyle = '#1a0006'; cx.beginPath(); cx.arc(x + px * 2, y + py * 2, 3.8, 0, TAU); cx.fill(); },
  stars(c, s, r0, r1, o, px, py, L) { for (let k = 0; k < 5; k++) { const d = r0 + L * ((k * .23 + .1) % 1), sd = Math.sin(k * 7.1) * 2, tw = .5 + .5 * Math.sin(o.t * 6 + k * 2); cx.globalAlpha = o.alpha * tw; cx.fillStyle = '#ffffff'; dot(c * d + px * sd, s * d + py * sd, 1.1); } cx.globalAlpha = o.alpha; },
  runes(c, s, r0, r1, o, px, py, L) { cx.strokeStyle = '#ffd23f'; cx.lineWidth = 1; for (let k = 1; k < 4; k++) { const d = r0 + L * k / 4, x = c * d, y = s * d; cx.beginPath(); cx.moveTo(x + px * 2 - c * 2, y + py * 2 - s * 2); cx.lineTo(x - px * 2, y - py * 2); cx.lineTo(x + c * 2, y + s * 2); cx.stroke(); } },
  circuit(c, s, r0, r1, o, px, py, L) { cx.strokeStyle = '#3dff6a'; cx.lineWidth = .9; cx.beginPath(); for (let k = 0; k < 3; k++) { const d0 = r0 + L * (k * .3 + .05), d1 = d0 + L * .18, sd = k % 2 ? 2 : -2; cx.moveTo(c * d0, s * d0); cx.lineTo(c * d0 + px * sd, s * d0 + py * sd); cx.lineTo(c * d1 + px * sd, s * d1 + py * sd); } cx.stroke(); cx.fillStyle = '#d8ffe0'; for (let k = 0; k < 3; k++) { const d = r0 + L * (k * .3 + .23); dot(c * d + px * (k % 2 ? 2 : -2), s * d + py * (k % 2 ? 2 : -2), 1); } },
  aurora(c, s, r0, r1, o, px, py, L) { const cols = ['#5effc8', '#b48cff']; for (let j = 0; j < 2; j++) { cx.strokeStyle = cols[j]; cx.lineWidth = 1.4; cx.globalAlpha = o.alpha * .8; cx.beginPath(); for (let k = 0; k <= 8; k++) { const d = r0 + L * k / 8, sd = Math.sin(o.t * 4 + k * .9 + j * 2) * 3.5; k ? cx.lineTo(c * d + px * sd, s * d + py * sd) : cx.moveTo(c * d + px * sd, s * d + py * sd); } cx.stroke(); } cx.globalAlpha = o.alpha; },
  sflame(c, s, r0, r1, o, px, py, L) { cx.fillStyle = 'rgba(196,91,255,.75)'; for (let k = 0; k < 5; k++) { const d = r0 + L * (k + .5) / 5, h = 4 + Math.abs(Math.sin(o.t * 9 + k * 1.3)) * 6, bx = c * d, by = s * d; cx.beginPath(); cx.moveTo(bx + c * 2.2, by + s * 2.2); cx.lineTo(bx + px * h, by + py * h); cx.lineTo(bx - c * 2.2, by - s * 2.2); cx.closePath(); cx.fill(); } }
};
