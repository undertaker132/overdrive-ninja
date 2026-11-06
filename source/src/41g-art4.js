/* =====================================================================
   WEAPONS 4 — ART: the held weapon, the swing animation, the swing /
   hit / kill effects, the sounds and the haptic feel of the twelve
   version-21 blades. Cosmetic only (render clock, cosmetic RNG).
   ===================================================================== */
Object.assign(GRIP, { cleaver: [10, 4], thunder: [9, 3], zerocut: [9, 3], staff: [18, 26], monowire: [3, 0], drill: [6, 0], bow: [10, 0], claws: [3, 0], glaive: [6, 20], phoenix: [9, 3], beamsaber: [8, 3], cryo: [9, 3] });
Object.assign(SW_DUR, { cleaver: .6, thunder: .3, zerocut: .46, staff: .55, monowire: .42, drill: .4, bow: .46, claws: .36, glaive: .6, phoenix: .42, beamsaber: .46, cryo: .36 });
Object.assign(SW_COL, { cleaver: '#ff9a3d', thunder: '#ffe14d', zerocut: '#ffffff', staff: '#ffd23f', monowire: '#7df9ff', drill: '#3dff9a', bow: '#7dff9a', claws: '#ff2a4a', glaive: '#b48cff', phoenix: '#ff6a00', beamsaber: '#ff3df0', cryo: '#bff4ff' });
Object.assign(WFX_STYLE, { cleaver: { w: 15, c: '#ff9a3d' }, thunder: { w: 6, c: '#ffe14d' }, zerocut: { w: 3, c: '#ffffff' }, staff: { w: 8, c: '#ffd23f' }, monowire: { w: 2, c: '#7df9ff' }, drill: { w: 9, c: '#3dff9a' },
  bow: { w: 4, c: '#7dff9a' }, claws: { w: 5, c: '#ff2a4a' }, glaive: { w: 12, c: '#b48cff' }, phoenix: { w: 11, c: '#ff6a00' }, beamsaber: { w: 7, c: '#ff3df0' }, cryo: { w: 7, c: '#bff4ff' } });
Object.assign(HAPTIC, { w_cleaver: [2, [10, 140, 50]], w_thunder: [1, [4, 20, 4, 20, 6]], w_zerocut: [1, [2, 200, 30]], w_staff: [1, [6, 40, 6, 40, 12]], w_monowire: [1, [3, 60, 3]], w_drill: [2, [5, 15, 5, 15, 5, 15, 5, 15, 20]],
  w_bow: [1, [4, 160, 16]], w_claws: [1, [6, 40, 8]], w_glaive: [2, [8, 50, 8, 120, 30]], w_phoenix: [1, [10, 50, 20]], w_beamsaber: [1, [6, 30, 6]], w_cryo: [1, [10, 90, 6]] });
const SW4R = { cleaver: [.5, 1.12], thunder: [.4, 1], zerocut: [.6, 1.08], staff: [.2, 1.15], monowire: [.5, 1.05], bow: [.5, .7], claws: [.3, .8], glaive: [.55, 1.15], phoenix: [.4, 1.05], beamsaber: [.35, 1.05], cryo: [.4, 1] };
/* ---------------- the held weapons ---------------- */
const W4ART = {
  cleaver(o, c, s, L, bc, edge, gc, glitch, own) { // a slab of raw iron: square tip, rivets, a hole near the spine
    const px = -s, py = c, r0 = 14, r1 = L * 1.1, wa = 9.5, wb = -6.5, P = (d, w) => [c * d + px * w, s * d + py * w];
    cx.strokeStyle = '#2a1a10'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(-c * 3, -s * 3); cx.lineTo(c * r0, s * r0); cx.stroke();
    cx.strokeStyle = '#8a5a2a'; cx.lineWidth = 1.4; for (let k = 0; k < 3; k++) { const d = k * 4; cx.beginPath(); cx.moveTo(c * d + px * 3, s * d + py * 3); cx.lineTo(c * (d + 2) - px * 3, s * (d + 2) - py * 3); cx.stroke(); }
    let q = P(r0, wa); cx.beginPath(); cx.moveTo(q[0], q[1]); q = P(r1 - 4, wa); cx.lineTo(q[0], q[1]); q = P(r1, wa - 4); cx.lineTo(q[0], q[1]); q = P(r1, wb); cx.lineTo(q[0], q[1]); q = P(r0, wb); cx.lineTo(q[0], q[1]); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : '#3a3a46'; cx.fill(); cx.strokeStyle = own ? '#8a94aa' : bc; cx.lineWidth = 2; cx.stroke();
    q = P(r0 + 2, wb + .5); const q2 = P(r1 - 1, wb + .5); cx.strokeStyle = edge; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(q[0], q[1]); cx.lineTo(q2[0], q2[1]); cx.stroke();
    cx.fillStyle = '#1a1a22'; q = P(r0 + 7, 4); dot(q[0], q[1], 2.4); cx.fillStyle = '#c9b8a0'; for (let k = 1; k < 4; k++) { q = P(r0 + (r1 - r0) * k / 4, 6.5); dot(q[0], q[1], 1.1); }
    hglow(c * r1 * .7, s * r1 * .7, 30, own ? '#ff9a3d' : gc, .35); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  },
  thunder(o, c, s, L, bc, edge, gc, glitch, own) { // a katana with lightning crawling along it
    bladeLine(c, s, 9, L, own ? '#fff3a0' : bc, edge, 5, glitch);
    const px = -s, py = c; cx.strokeStyle = '#ffe14d'; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(c * 12, s * 12);
    for (let k = 1; k <= 6; k++) { const d = 12 + (L - 12) * k / 6, j = Math.sin(o.t * 40 + k * 2.3) * 3.5; cx.lineTo(c * d + px * j, s * d + py * j); } cx.stroke();
    if (((o.t * 9) | 0) % 3 === 0) { const d = L * (.4 + .5 * Math.abs(Math.sin(o.t * 5))); cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(c * d, s * d); cx.lineTo(c * d + px * 9 + c * 4, s * d + py * 9 + s * 4); cx.lineTo(c * d + px * 6 + c * 9, s * d + py * 6 + s * 9); cx.stroke(); }
    cx.fillStyle = '#ffd23f'; cx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + o.t, r = k % 2 ? 3 : 5.5; const x = c * 12 + Math.cos(a) * r, y = s * 12 + Math.sin(a) * r; k ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.closePath(); cx.fill(); // star guard
    cx.strokeStyle = '#2a2a50'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(c * 4, s * 4); cx.lineTo(c * 11, s * 11); cx.stroke();
    hglow(c * L * .6, s * L * .6, 30, '#ffe14d', .45);
  },
  zerocut(o, c, s, L, bc, edge, gc, glitch, own) { // a hair-thin white blade, black grip and a red tassel
    const px = -s, py = c, r1 = L * 1.05;
    cx.strokeStyle = own ? '#f4f8ff' : bc; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(c * 11, s * 11); cx.lineTo(c * r1, s * r1); cx.stroke();
    if (glitch) { cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(c * 11 + px * 1.5, s * 11 + py * 1.5); cx.lineTo(c * r1 + px * 1.5, s * r1 + py * 1.5); cx.stroke(); }
    cx.strokeStyle = '#ffffff'; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(c * 14 + px, s * 14 + py); cx.lineTo(c * (r1 - 2) + px, s * (r1 - 2) + py); cx.stroke();
    cx.strokeStyle = '#0a0a10'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(-c * 2, -s * 2); cx.lineTo(c * 10, s * 10); cx.stroke();
    cx.fillStyle = '#c0c8d8'; cx.fillRect(c * 10.5 - 2, s * 10.5 - 2, 4, 4);
    const sw = Math.sin(o.t * 5) * 3; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-c * 2, -s * 2); cx.quadraticCurveTo(-c * 7 + px * sw, -s * 7 + py * sw, -c * 12 + px * sw * 1.6, -s * 12 + py * sw * 1.6); cx.stroke();
    hglow(c * r1 * .6, s * r1 * .6, 22, own ? '#ffffff' : gc, .3); if (DECO.f) bladeDeco(DECO.f, c, s, 11, r1, o);
  },
  staff(o, c, s, L, bc, edge, gc, glitch, own) { // a long red staff with gold caps at both ends
    const px = -s, py = c, r0 = -L * .45, r1 = L * 1.08;
    cx.strokeStyle = glitch ? '#ff2bd6' : '#a01818'; cx.lineWidth = 4.5; cx.beginPath(); cx.moveTo(c * r0, s * r0); cx.lineTo(c * r1, s * r1); cx.stroke();
    cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(c * r0 + px * 1.2, s * r0 + py * 1.2); cx.lineTo(c * r1 + px * 1.2, s * r1 + py * 1.2); cx.stroke();
    for (const [d0, d1] of [[r0, r0 + 9], [r1 - 9, r1]]) { cx.strokeStyle = own ? '#ffd23f' : bc; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(c * d0, s * d0); cx.lineTo(c * d1, s * d1); cx.stroke(); cx.strokeStyle = '#7a5a00'; cx.lineWidth = 1; for (let k = 1; k < 3; k++) { const d = d0 + k * 3; cx.beginPath(); cx.moveTo(c * d + px * 3, s * d + py * 3); cx.lineTo(c * d - px * 3, s * d - py * 3); cx.stroke(); } }
    hglow(c * r1, s * r1, 18, own ? '#ffd23f' : gc, .45); if (DECO.f) bladeDeco(DECO.f, c, s, r1 - 26, r1, o);
  },
  monowire(o, c, s, L, bc, edge, gc, glitch, own) { // a wrist launcher and a near-invisible glowing filament with a weight
    const px = -s, py = c; cx.fillStyle = '#1a1f34'; cx.save(); cx.translate(c * 2, s * 2); cx.rotate(Math.atan2(s, c)); rrect(-5, -4, 11, 8, 2); cx.fill(); cx.strokeStyle = own ? '#7df9ff' : bc; cx.lineWidth = 1.4; cx.stroke(); cx.fillStyle = '#7df9ff'; cx.fillRect(1, -1, 3, 2); cx.restore();
    const ext = o.dashing ? 1.2 : o.swing ? .7 + .5 * Math.sin(Math.PI * Math.min(1, (o.lash >= 0 ? o.lash : 0) * 1.6)) : .55, n = 10, cl = own ? '#bff8ff' : bc; let x = c * 7, y = s * 7;
    cx.strokeStyle = cl; cx.lineWidth = 1.1; cx.globalCompositeOperation = 'lighter'; cx.beginPath(); cx.moveTo(x, y);
    for (let k = 1; k <= n; k++) { const d = 7 + L * ext * k / n, wv = Math.sin(o.t * 6 - k * .8) * (o.dashing ? .4 : 1.6) * k * .5 * (o.swd || 1); x = c * d + px * wv; y = s * d + py * wv; cx.lineTo(x, y); } cx.stroke(); cx.globalCompositeOperation = 'source-over';
    hglow(x, y, 12, '#7df9ff', .7); cx.fillStyle = '#e8fbff'; dot(x, y, 2.2);
    if (DECO.f) bladeDeco(DECO.f, c, s, 8, L * ext, o);
  },
  drill(o, c, s, L, bc, edge, gc, glitch, own) { // a cone drill with spinning spiral grooves on a piston arm
    const px = -s, py = c, r0 = 10, r1 = L * .98, w0 = 9, spin = o.t * (o.dashing || o.swing ? 26 : 3), col = own ? '#3dff9a' : bc;
    cx.fillStyle = '#4a5478'; cx.fillRect(c * 2 - 3, s * 2 - 3, 6, 6); cx.strokeStyle = '#2a3150'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(c * 1, s * 1); cx.lineTo(c * r0, s * r0); cx.stroke();
    cx.beginPath(); cx.moveTo(c * r0 + px * w0, s * r0 + py * w0); cx.lineTo(c * r1, s * r1); cx.lineTo(c * r0 - px * w0, s * r0 - py * w0); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : '#1a3a2a'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 1.8; cx.stroke();
    cx.save(); cx.clip(); cx.strokeStyle = col; cx.lineWidth = 2.2;
    for (let k = 0; k < 6; k++) { const u = ((k / 6 + spin * .05) % 1), d = r0 + (r1 - r0) * u, w = w0 * (1 - u); cx.beginPath(); cx.moveTo(c * d + px * w, s * d + py * w); cx.lineTo(c * (d + 7) - px * w, s * (d + 7) - py * w); cx.stroke(); }
    cx.restore(); cx.fillStyle = edge; dot(c * r1, s * r1, 1.5); hglow(c * r1 * .7, s * r1 * .7, 26, own ? '#3dff9a' : gc, .4);
    if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  },
  bow(o, c, s, L, bc, edge, gc, glitch, own) { // a recurve bow of light held across the body; the string draws back in the swing
    const px = -s, py = c, R = L * .5, d0 = 6, pull = o.swing ? o.p1 || 0 : 0, cl = own ? '#7dff9a' : bc;
    cx.strokeStyle = glitch ? '#ff2bd6' : '#2a4a34'; cx.lineWidth = 4; cx.beginPath();
    for (let k = 0; k <= 12; k++) { const u = k / 12 * 2 - 1, w = u * R, f = d0 + 6 * (1 - u * u) - 4 * Math.pow(Math.abs(u), 3); const x = c * f + px * w, y = s * f + py * w; k ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.stroke();
    cx.strokeStyle = cl; cx.lineWidth = 1.8; cx.stroke(); hglow(c * d0, s * d0, 24, own ? '#7dff9a' : gc, .4);
    const tx = c * (d0 + 2) + px * R, ty = s * (d0 + 2) + py * R, bx = c * (d0 + 2) - px * R, by = s * (d0 + 2) - py * R, sx = c * (d0 - 2 - pull * 16), sy = s * (d0 - 2 - pull * 16);
    cx.strokeStyle = '#e8fff0'; cx.lineWidth = .9; cx.beginPath(); cx.moveTo(tx, ty); cx.lineTo(sx, sy); cx.lineTo(bx, by); cx.stroke();
    if (!o.dashing && (!o.swing || pull > .05)) { cx.strokeStyle = '#bfffd0'; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(c * (d0 + 22), s * (d0 + 22)); cx.stroke(); cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(c * (d0 + 26), s * (d0 + 26)); cx.lineTo(c * (d0 + 20) + px * 2.5, s * (d0 + 20) + py * 2.5); cx.lineTo(c * (d0 + 20) - px * 2.5, s * (d0 + 20) - py * 2.5); cx.closePath(); cx.fill(); }
    if (DECO.f) bladeDeco(DECO.f, c, s, d0, d0 + R, o);
  },
  claws(o, c, s, L, bc, edge, gc, glitch, own) { // a beast gauntlet with three long curved talons
    const px = -s, py = c, a = Math.atan2(s, c), cl = own ? '#ff2a4a' : bc;
    cx.save(); cx.rotate(a); rrect(-4, -6, 12, 12, 3); cx.fillStyle = '#2a1a1e'; cx.fill(); cx.strokeStyle = cl; cx.lineWidth = 1.6; cx.stroke(); cx.restore();
    for (let k = -1; k <= 1; k++) { const b0 = 7, b1 = L * .62 + (k ? 0 : 5), off = k * 4.2, cv = 4;
      cx.beginPath(); cx.moveTo(c * b0 + px * (off + 1.6), s * b0 + py * (off + 1.6)); cx.quadraticCurveTo(c * (b0 + b1) * .5 + px * (off + cv), s * (b0 + b1) * .5 + py * (off + cv), c * b1 + px * (off + cv * .4), s * b1 + py * (off + cv * .4));
      cx.quadraticCurveTo(c * (b0 + b1) * .5 + px * (off + cv * .3), s * (b0 + b1) * .5 + py * (off + cv * .3), c * b0 + px * (off - 1.6), s * b0 + py * (off - 1.6)); cx.closePath();
      cx.fillStyle = glitch ? '#ff2bd6' : '#e8e2e6'; cx.fill(); cx.strokeStyle = cl; cx.lineWidth = 1; cx.stroke(); }
    hglow(c * L * .4, s * L * .4, 20, own ? '#ff2a4a' : gc, .35); if (DECO.f) bladeDeco(DECO.f, c, s, 7, L * .62, o);
  },
  glaive(o, c, s, L, bc, edge, gc, glitch, own) { // a pole with a crescent blade and a tiny black hole spinning in it
    const px = -s, py = c, r1 = L * 1.02, cl = own ? '#b48cff' : bc;
    cx.strokeStyle = '#3a2a5a'; cx.lineWidth = 3.5; cx.beginPath(); cx.moveTo(-c * 10, -s * 10); cx.lineTo(c * (r1 - 10), s * (r1 - 10)); cx.stroke();
    const hx = c * (r1 - 6), hy = s * (r1 - 6);
    cx.beginPath(); cx.moveTo(hx - px * 3, hy - py * 3); cx.quadraticCurveTo(hx + c * 22 + px * 4, hy + s * 22 + py * 4, hx + c * 4 + px * 22, hy + s * 4 + py * 22); cx.quadraticCurveTo(hx + c * 10 + px * 8, hy + s * 10 + py * 8, hx - px * 3, hy - py * 3);
    cx.fillStyle = glitch ? '#ff2bd6' : '#1a0e30'; cx.fill(); cx.strokeStyle = cl; cx.lineWidth = 1.8; cx.stroke();
    cx.beginPath(); cx.moveTo(hx + px * 3, hy + py * 3); cx.quadraticCurveTo(hx + c * 16 - px * 10, hy + s * 16 - py * 10, hx + c * 2 - px * 14, hy + s * 2 - py * 14); cx.strokeStyle = edge; cx.lineWidth = 1.5; cx.stroke();
    const ox = hx + c * 5 + px * 6, oy = hy + s * 5 + py * 6; hglow(ox, oy, 18, '#7a3cff', .7); cx.fillStyle = '#05010c'; dot(ox, oy, 3.4); cx.strokeStyle = '#ffffff'; cx.lineWidth = .8; cx.beginPath(); cx.arc(ox, oy, 5, o.t * 6, o.t * 6 + 2); cx.stroke();
    if (DECO.f) bladeDeco(DECO.f, c, s, r1 - 10, r1 + 14, o);
  },
  phoenix(o, c, s, L, bc, edge, gc, glitch, own) { // a blade of living fire: flame serrations and a feather guard
    const px = -s, py = c, r0 = 10, r1 = L * 1.02;
    cx.beginPath(); cx.moveTo(c * r0 + px * 3, s * r0 + py * 3);
    for (let k = 1; k <= 5; k++) { const d = r0 + (r1 - r0) * k / 5, fl = 3 + 3.5 * Math.abs(Math.sin(o.t * 9 + k)); cx.lineTo(c * (d - 4) + px * (3 + fl), s * (d - 4) + py * (3 + fl)); cx.lineTo(c * d + px * 2.6, s * d + py * 2.6); }
    cx.lineTo(c * (r1 + 4), s * (r1 + 4)); cx.lineTo(c * r0 - px * 3, s * r0 - py * 3); cx.closePath();
    const g = cx.createLinearGradient(c * r0, s * r0, c * r1, s * r1); g.addColorStop(0, own ? '#ff2a00' : bc); g.addColorStop(1, own ? '#ffd23f' : '#ffffff');
    cx.fillStyle = glitch ? '#ff2bd6' : g; cx.fill(); cx.strokeStyle = '#7a1a00'; cx.lineWidth = 1; cx.stroke();
    for (let sd = -1; sd <= 1; sd += 2) { cx.fillStyle = sd > 0 ? '#ff6a00' : '#ffd23f'; cx.beginPath(); cx.moveTo(c * r0, s * r0); cx.quadraticCurveTo(c * (r0 - 4) + px * 9 * sd, s * (r0 - 4) + py * 9 * sd, c * (r0 - 9) + px * 6 * sd, s * (r0 - 9) + py * 6 * sd); cx.lineTo(c * (r0 - 2), s * (r0 - 2)); cx.closePath(); cx.fill(); }
    cx.strokeStyle = '#2a1008'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(c * 1, s * 1); cx.lineTo(c * 8, s * 8); cx.stroke();
    hglow(c * r1 * .6, s * r1 * .6, 34, own ? '#ff6a00' : gc, .5); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  },
  beamsaber(o, c, s, L, bc, edge, gc, glitch, own) { // a metal hilt and a beam blade with a white-hot core
    const px = -s, py = c, r0 = 12, r1 = L * 1.04, cl = own ? '#ff3df0' : bc;
    cx.strokeStyle = '#8a94aa'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(-c * 3, -s * 3); cx.lineTo(c * r0, s * r0); cx.stroke();
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 1.2; for (let k = 0; k < 3; k++) { const d = k * 4; cx.beginPath(); cx.moveTo(c * d + px * 3, s * d + py * 3); cx.lineTo(c * d - px * 3, s * d - py * 3); cx.stroke(); }
    cx.fillStyle = '#ff2a4a'; dot(c * 6 + px * 3.2, s * 6 + py * 3.2, 1.2);
    const fl = 1 + Math.sin(o.t * 50) * .06; cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
    cx.strokeStyle = glitch ? '#ff2bd6' : cl; cx.globalAlpha *= .55; cx.lineWidth = 9 * fl; cx.beginPath(); cx.moveTo(c * r0, s * r0); cx.lineTo(c * r1, s * r1); cx.stroke();
    cx.globalAlpha /= .55; cx.lineWidth = 4.5; cx.stroke(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.stroke(); cx.restore();
    hglow(c * r1 * .6, s * r1 * .6, 40, own ? '#ff3df0' : gc, .55); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  },
  cryo(o, c, s, L, bc, edge, gc, glitch, own) { // an ice-blue katana with frost crystals and a snowflake guard
    const px = -s, py = c; bladeLine(c, s, 9, L, own ? '#bff4ff' : bc, edge, 5, glitch);
    cx.fillStyle = 'rgba(232,251,255,.9)'; for (let k = 0; k < 4; k++) { const d = 16 + (L - 18) * k / 3.4, sd = k % 2 ? 1 : -1, sz = 3 + (k % 2) * 1.5; cx.beginPath(); cx.moveTo(c * d, s * d); cx.lineTo(c * (d + 2) + px * sd * (2.5 + sz), s * (d + 2) + py * sd * (2.5 + sz)); cx.lineTo(c * (d + 4), s * (d + 4)); cx.closePath(); cx.fill(); }
    cx.strokeStyle = '#e8fbff'; cx.lineWidth = 1.4; cx.beginPath(); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + .3; cx.moveTo(c * 12 + Math.cos(a) * 5, s * 12 + Math.sin(a) * 5); cx.lineTo(c * 12 - Math.cos(a) * 5, s * 12 - Math.sin(a) * 5); } cx.stroke();
    cx.strokeStyle = '#2a3a60'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(c * 4, s * 4); cx.lineTo(c * 10, s * 10); cx.stroke();
    hglow(c * L * .6, s * L * .6, 30, '#bff4ff', .45);
  }
};
/* ---------------- swing animations (pose: return the angle offset) ---------------- */
const SW4 = {
  cleaver(o, u, d) { const w1 = seg(u, 0, .3), sm = seg(u, .3, .5); o.r = sm <= 0 ? 1 - .15 * eo(w1) : .85 + .3 * sm; if (u > .5) o.r = 1.15 - .15 * seg(u, .5, 1);
    if (sm <= 0) { o.sx = 1 - .12 * w1; o.sy = 1 + .14 * w1; } else if (u < .66) { const k = 1 - seg(u, .5, .66); o.sx = 1 + .3 * k; o.sy = 1 - .2 * k; }
    const off = sm <= 0 ? -d * 2.3 * eo(w1) : -d * 2.3 + d * 4.3 * ei(sm); o.face = off * .3; return off; },
  thunder(o, u, d) { const off = d * (-2.4 + 4.5 * eo(u / .25)) - d * .25 * seg(u, .25, .6); o.r = 1.08; o.face = off * .25; o.sx = 1 + .18 * (1 - seg(u, 0, .3)); return off; },
  zerocut(o, u, d) { const dr = seg(u, .28, .36); o.r = u < .28 ? .62 : .62 + .5 * eo(dr); if (u > .6) o.r = 1.12 - .12 * seg(u, .6, 1); const off = u < .28 ? -d * 1.9 : -d * 1.9 + d * 4.3 * eo(dr); o.face = u < .28 ? -d * .3 : off * .2; return off; },
  staff(o, u, d) { const sp = eo(u / .75); o.r = 1 + .12 * Math.sin(Math.PI * u); o.face = d * .3 * Math.sin(Math.PI * u); return d * (-.8 + TAU * 1.5 * sp); },
  monowire(o, u, d) { o.lash = u; o.r = .8 + .45 * Math.sin(Math.PI * seg(u, 0, .65)); const off = d * (-1.8 + 3.5 * eo(u / .4)); o.face = off * .2; return off; },
  drill(o, u, d) { const pb = seg(u, 0, .16), th = seg(u, .16, .36), rt = seg(u, .55, 1); o.r = pb < 1 ? 1 - .25 * eo(pb) : th < 1 ? .75 + .65 * eo(th) : 1.4 - .4 * eo(rt); o.sx = th > 0 && th < 1 ? 1.22 : 1; o.sy = th > 0 && th < 1 ? .86 : 1; return d * .06 * Math.sin(u * 40); },
  bow(o, u, d) { o.p1 = u < .5 ? eo(u / .5) : Math.max(0, 1 - seg(u, .5, .56) * 1); o.r = .92; o.face = -d * .12 * o.p1; return d * .08 * Math.sin(u * 12) * (u > .5 ? 1 - seg(u, .5, 1) : 0); },
  claws(o, u, d) { const k = u < .5 ? 0 : 1, lu = k ? seg(u, .5, .85) : seg(u, 0, .35); const off = (k ? -d : d) * (-1.6 + 3.2 * eo(lu)); o.r = 1 + .25 * Math.sin(Math.PI * lu); o.face = off * .3; o.sx = 1 + .1 * Math.sin(Math.PI * lu); return off; },
  glaive(o, u, d) { const sp = eo(u / .78); o.r = 1.08; o.face = d * TAU * .6 * sp; o.sx = 1 + .1 * Math.sin(Math.PI * u); return d * (-1 + (TAU + 1.2) * sp); },
  phoenix(o, u, d) { const off = d * (-2.3 + 4.2 * eo(u / .45)); o.r = 1 + .14 * Math.sin(Math.PI * seg(u, 0, .45)); o.face = off * .25; o.sy = 1 + .1 * Math.sin(Math.PI * seg(u, 0, .45)); return off; },
  beamsaber(o, u, d) { const sp = eo(u / .62); o.r = 1.04; o.face = d * 1.2 * Math.sin(Math.PI * sp); return d * (-2 + 6.6 * sp); },
  cryo(o, u, d) { const off = d * (-2.1 + 3.9 * eo(u / .42)) - d * .3 * seg(u, .42, .7); o.r = 1 + .08 * Math.sin(Math.PI * seg(u, 0, .42)); o.face = off * .25; return off; }
};
/* one-off beats inside a swing */
function sw4Beat(s, o, u, x, y, tx, ty, bl, quiet) {
  const w = s.w, once = (at, f) => { if (u >= at && !(s.ev & 1)) { s.ev |= 1; f(); if (!quiet) Aud.wbeat(w, 0); } };
  switch (w) {
    case 'cleaver': once(.5, () => { FX.ring(tx, ty, 64, 'rgba(255,154,61,.9)', 7); for (let k = 0; k < 5; k++) { const b = o.a + (k - 2) * .6; FX.decal(tx, ty, tx + Math.cos(b) * 30, ty + Math.sin(b) * 30, '#ff9a3d', 2.5); } for (let k = 0; k < 5; k++) WFX.chip(tx, ty, rnd() * TAU, 180, '#8a7a68', 3, 3); if (!quiet) shake(.15); }); break;
    case 'thunder': once(.12, () => { for (let k = 0; k < 2; k++) { const b = o.a + (rnd() - .5) * 1.4; FX.bolt(tx, ty, tx + Math.cos(b) * 40, ty + Math.sin(b) * 40, '#ffe14d', .7); } }); break;
    case 'zerocut': once(.32, () => { WFX.line(x + Math.cos(o.a) * bl * .6, y + Math.sin(o.a) * bl * .6, o.a + 1.57, 120, '#ffffff', 2, 3); FX.text(x, y - 34, '一閃', '#ffffff', 16, true); }); break;
    case 'staff': if (u >= .25 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat('staff', 0); } if (u >= .6 && !(s.ev & 2)) { s.ev |= 2; if (!quiet) Aud.wbeat('staff', 1); FX.ring(x, y, bl * 1.1, '#ffd23f', 2); } break;
    case 'monowire': once(.4, () => { FX.spark(tx, ty, '#e8fbff', 5); WFX.line(tx, ty, o.a, 40, '#7df9ff', 1, 6); }); break;
    case 'drill': once(.22, () => { for (let k = 0; k < 4; k++) WFX.chip(tx, ty, o.a + Math.PI + (rnd() - .5) * 1.8, 160, '#3dff9a', 2, 2); FX.ring(tx, ty, 20, '#3dff9a', 2); }); break;
    case 'bow': once(.5, () => { WFX.line(x + Math.cos(s.a) * 30, y + Math.sin(s.a) * 30, s.a, 70, '#bfffd0', 1.6, 6); FX.ring(x + Math.cos(s.a) * 14, y + Math.sin(s.a) * 14, 16, '#7dff9a', 2); }); break;
    case 'claws': for (let k = 0; k < 2; k++) { const at = k ? .65 : .18; if (u >= at && !(s.ev & (2 << k))) { s.ev |= 2 << k; if (!quiet) Aud.wbeat('claws', k); for (let j = -1; j <= 1; j++) WFX.line(tx + Math.cos(o.a + 1.57) * j * 6, ty + Math.sin(o.a + 1.57) * j * 6, o.a + 1.57, 26, '#ff2a4a', 1.6, 7); } } break;
    case 'glaive': once(.4, () => { FX.ring(x, y, bl * 1.15, '#b48cff', 3); }); break;
    case 'phoenix': once(.3, () => { FX.ember(tx, ty, '#ff6a00', 6); FX.ring(tx, ty, 30, '#ffd23f', 3); }); break;
    case 'beamsaber': if (u >= .2 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat('beamsaber', 0); } if (u >= .45 && !(s.ev & 2)) { s.ev |= 2; if (!quiet) Aud.wbeat('beamsaber', 1); } break;
    case 'cryo': once(.34, () => { FX.ring(tx, ty, 26, '#e8fbff', 2); for (let k = 0; k < 4; k++) WFX.chip(tx, ty, rnd() * TAU, 120, '#e8fbff', 3, 1.4); }); break;
  }
}
/* ---------------- swing / hit / kill effects ---------------- */
const WFX4 = {
  swing(w, a, x, y, c) {
    const L = (d, A, len, col, wd, dl) => WFX.line(x + Math.cos(A) * d, y + Math.sin(A) * d, A, len, col, wd, dl);
    switch (w) {
      case 'cleaver': FX.arc(x, y, a, 84, '#ff9a3d', 11); FX.arc(x, y, a, 64, '#ffffff', 3); break;
      case 'thunder': FX.arc(x + Math.cos(a) * 16, y + Math.sin(a) * 16, a, 54, '#ffe14d', 4); FX.bolt(x, y, x + Math.cos(a) * 70, y + Math.sin(a) * 70, '#ffe14d', .6); break;
      case 'zerocut': L(18, a, 90, '#ffffff', 1.2, 6); break;
      case 'staff': FX.ring(x, y, 50, 'rgba(255,210,63,.6)', 3); break;
      case 'monowire': for (let k = -1; k <= 1; k++) L(10, a + k * .3, 50, '#7df9ff', .9, 7); break;
      case 'drill': L(20, a, 140, '#3dff9a', 3, 5); FX.ring(x + Math.cos(a) * 26, y + Math.sin(a) * 26, 18, '#3dff9a', 2); break;
      case 'bow': FX.ring(x, y, 30, 'rgba(125,255,154,.6)', 2); break;
      case 'claws': for (let k = -1; k <= 1; k++) FX.arc(x + Math.cos(a) * 12 + Math.cos(a + 1.57) * k * 7, y + Math.sin(a) * 12 + Math.sin(a + 1.57) * k * 7, a, 30, '#ff2a4a', 2); break;
      case 'glaive': FX.arc(x, y, a, 80, '#b48cff', 8); FX.arc(x, y, a, 60, '#1a0e30', 4); break;
      case 'phoenix': FX.arc(x + Math.cos(a) * 12, y + Math.sin(a) * 12, a, 60, '#ff6a00', 7); FX.ember(x, y, '#ffd23f', 4); break;
      case 'beamsaber': FX.arc(x + Math.cos(a) * 12, y + Math.sin(a) * 12, a, 62, '#ff3df0', 6); FX.arc(x + Math.cos(a) * 12, y + Math.sin(a) * 12, a, 48, '#ffffff', 2); break;
      case 'cryo': FX.arc(x + Math.cos(a) * 16, y + Math.sin(a) * 16, a, 52, '#bff4ff', 4); for (let k = 0; k < 3; k++) WFX.chip(x, y, a + (rnd() - .5), 120, '#e8fbff', 2.5, 1.2); break;
    }
  },
  hit(w, ex, ey, a, crit, c) {
    switch (w) {
      case 'cleaver': WFX.line(ex, ey, a + 1.57, crit ? 140 : 110, '#ff9a3d', crit ? 6 : 4, 4); for (let k = 0; k < 5; k++) WFX.chip(ex, ey, a + (rnd() - .5) * 2, 180, '#8a7a68', 3.4, 3); break;
      case 'thunder': for (let k = 0; k < 2; k++) { const b = rnd() * TAU; FX.bolt(ex, ey, ex + Math.cos(b) * 34, ey + Math.sin(b) * 34, '#ffe14d', .6); } WFX.line(ex, ey, a, 80, '#fff3a0', 2.4, 5); break;
      case 'zerocut': WFX.line(ex, ey, a, crit ? 150 : 110, '#ffffff', 1.6, 3); break;
      case 'staff': FX.ring(ex, ey, 30, '#ffd23f', 4); for (let k = 0; k < 6; k++) { const b = k * TAU / 6; WFX.line(ex + Math.cos(b) * 10, ey + Math.sin(b) * 10, b, 18, '#ffd23f', 2, 8); } break;
      case 'monowire': WFX.line(ex, ey, a + 1.57, 70, '#bff8ff', 1, 6); FX.spark(ex, ey, '#7df9ff', 4); break;
      case 'drill': for (let k = 0; k < 6; k++) WFX.chip(ex, ey, a + Math.PI + (rnd() - .5) * 2.4, 200, '#3dff9a', 2, 2); FX.ring(ex, ey, 24, '#3dff9a', 2); break;
      case 'bow': FX.ring(ex, ey, 20, '#7dff9a', 2); break;
      case 'claws': for (let k = -1; k <= 1; k++) WFX.line(ex + Math.cos(a + 1.57) * k * 7, ey + Math.sin(a + 1.57) * k * 7, a + .5, 40, '#ff2a4a', 2, 6); break;
      case 'glaive': FX.ring(ex, ey, 26, '#b48cff', 3); WFX.line(ex, ey, a + 1.2, 60, '#e0ccff', 2, 6); break;
      case 'phoenix': FX.ember(ex, ey, '#ff6a00', 5); WFX.line(ex, ey, a, 70, '#ffd23f', 3, 5); break;
      case 'beamsaber': WFX.line(ex, ey, a + 1.57, 90, '#ff3df0', 3, 5); WFX.line(ex, ey, a + 1.57, 70, '#ffffff', 1.2, 5); break;
      case 'cryo': for (let k = 0; k < 5; k++) WFX.chip(ex, ey, rnd() * TAU, 130, '#e8fbff', 3, 1.5); WFX.line(ex, ey, a, 80, '#bff4ff', 2.4, 5); break;
    }
  },
  kill(w, e, a) {
    switch (w) {
      case 'cleaver': shake(.14); WFX.line(e.x, e.y, a + 1.57, 160, '#ffffff', 3, 4); for (let k = 0; k < 6; k++) WFX.chip(e.x, e.y, rnd() * TAU, 240, '#c9b8a0', 4, 4); break;
      case 'thunder': for (let k = 0; k < 4; k++) { const b = k * TAU / 4 + rnd(); FX.bolt(e.x, e.y, e.x + Math.cos(b) * 60, e.y + Math.sin(b) * 60, '#ffe14d', .8); } break;
      case 'zerocut': if (G.lastCrit) FX.text(e.x, e.y - e.r - 20, '斬', '#ffffff', 22, true); WFX.line(e.x, e.y, a + .8, 90, '#ffffff', 1.4, 4); WFX.line(e.x, e.y, a - .8, 90, '#ffffff', 1.4, 4); break;
      case 'staff': FX.ring(e.x, e.y, 44, '#ffd23f', 4); break;
      case 'drill': FX.ring(e.x, e.y, 40, '#3dff9a', 3); for (let k = 0; k < 8; k++) WFX.chip(e.x, e.y, k * TAU / 8, 200, '#bfffe0', 2.4, 2); break;
      case 'bow': WFX.soul(e.x, e.y, '#7dff9a', 0); break;
      case 'claws': for (let k = -1; k <= 1; k++) FX.decal(e.x + Math.cos(a + 1.57) * k * 8 - Math.cos(a) * 20, e.y + Math.sin(a + 1.57) * k * 8 - Math.sin(a) * 20, e.x + Math.cos(a + 1.57) * k * 8 + Math.cos(a) * 20, e.y + Math.sin(a + 1.57) * k * 8 + Math.sin(a) * 20, '#ff2a4a', 2.5); break;
      case 'glaive': FX.bladeKill(e, a, 'implode'); break;
      case 'phoenix': FX.ember(e.x, e.y, '#ff6a00', 8); FX.ring(e.x, e.y, 46, '#ff9a00', 4); break;
      case 'beamsaber': FX.ring(e.x, e.y, 40, '#ff3df0', 3); WFX.line(e.x, e.y, a + 1.57, 120, '#ff3df0', 2, 4); break;
      case 'cryo': FX.bladeKill(e, a, 'shatter'); break;
    }
  }
};
/* ---------------- sounds (pure synthesis, never the seeded RNG) ---------------- */
const W4SND = {
  slash: {
    cleaver(b, t) { this.noise(.24, .16, 600, 120); this.tone(110, 48, .26, .16, 'sine'); this.tone(300 + b * .3, 160, .14, .06, 'sawtooth'); },
    thunder(b, t) { this.noise(.05, .1, 9000, 4000, 'highpass'); this.tone(2600 + b, 900, .08, .06, 'square'); this.noise(.12, .06, 3000, 800, 'bandpass', t + .04); },
    zerocut(b, t) { this.tone(4200, 3800, .03, .05, 'sine'); this.tone(3000 + b, 5200 + b, .06, .05, 'sine', t + .12); },
    staff(b, t) { this.noise(.16, .07, 600, 2400, 'bandpass'); this.tone(220 + b * .3, 440 + b * .3, .14, .06, 'triangle'); },
    monowire(b, t) { this.tone(6000, 5200, .1, .03, 'sine'); this.tone(6100, 5300, .1, .025, 'sine'); },
    drill(b, t) { for (let k = 0; k < 6; k++) this.tone(180 + k * 20 + b * .4, 220 + k * 20 + b * .4, .03, .07, 'sawtooth', t + k * .025); },
    bow(b, t) { this.tone(160, 120, .1, .08, 'triangle'); this.noise(.05, .06, 4000, 1500, 'bandpass'); },
    claws(b, t) { this.noise(.05, .1, 7000, 2500, 'highpass'); this.noise(.05, .08, 6000, 2200, 'highpass', t + .07); },
    glaive(b, t) { this.tone(140 + b * .3, 60, .3, .1, 'sawtooth'); this.tone(900, 300, .25, .04, 'sine'); },
    phoenix(b, t) { this.noise(.25, .12, 300, 3000, 'bandpass'); this.tone(330 + b, 660 + b, .12, .06, 'sawtooth'); },
    beamsaber(b, t) { this.tone(110, 140, .18, .08, 'sawtooth'); this.tone(113, 150, .18, .07, 'sawtooth'); this.tone(900 + b, 600 + b, .12, .04, 'sine'); },
    cryo(b, t) { this.tone(2800 + b, 3600 + b, .07, .05, 'sine'); this.noise(.08, .06, 9000, 6000, 'highpass'); this.tone(5200, 4800, .14, .02, 'sine', t + .05); }
  },
  beat: {
    cleaver(k, t) { this.tone(70, 30, .36, .22, 'sine'); this.noise(.26, .2, 500, 80); },
    thunder(k, t) { this.noise(.18, .16, 2400, 200); this.tone(60, 40, .2, .1, 'square'); },
    zerocut(k, t) { this.tone(5200, 2600, .08, .07, 'sine'); this.noise(.04, .12, 9500, 6000, 'highpass'); },
    staff(k, t) { this.noise(.12, .08, 800, 2600, 'bandpass'); },
    monowire(k, t) { this.tone(7000, 4000, .05, .03, 'square'); },
    drill(k, t) { this.tone(260, 520, .1, .06, 'sawtooth'); },
    bow(k, t) { this.tone(1400, 900, .05, .06, 'triangle'); this.noise(.06, .05, 5000, 2000, 'bandpass'); },
    claws(k, t) { this.tone(2600 - k * 300, 1800, .04, .05, 'sawtooth'); },
    glaive(k, t) { this.tone(80, 50, .4, .12, 'sine'); this.tone(1600, 2400, .2, .03, 'sine'); },
    phoenix(k, t) { this.noise(.3, .12, 200, 2000, 'bandpass'); this.tone(500, 900, .15, .05, 'triangle'); },
    beamsaber(k, t) { this.tone(140 + k * 40, 90, .12, .07, 'sawtooth'); },
    cryo(k, t) { this.tone(4400, 5400, .08, .04, 'sine'); this.tone(3300, 4100, .1, .03, 'sine', t + .04); }
  }
};
