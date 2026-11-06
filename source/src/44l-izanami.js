/* ---------------- ACT VI BOSS: IZANAMI — the first code ----------------
   The first machine mind: a figure in a robe half white, half black, with a halo
   of old circuit script. Two great hands float beside her: the HAND OF LIFE
   (creates drones) and the HAND OF DEATH (slams down where you stand). Cut a hand
   and its attack stops; with both cut she takes full damage.
   Phase 1 — CREATION: petal fans; the hands create and destroy.
   Phase 2 — YOMI GATES (below 66%): two gates open at the edges of the roof and
   spit homing shots.
   Phase 3 — BIRTH OF GODS (below 33%): twin spirals of light pour from her
   while the slams come faster. */
BOSSDEF.izanami = {
  init(b) {
    b.r = 38; b.hp = 820; b.hy = V.VH * .22; b.wpOn = true; b.bodyMul = .55; b.st = 'float'; b.fT = 2; b.cT = 4; b.sT = 3.4; b.gT = 1; b.gates = []; b.slam = null; b.spT = 0; b.spOn = 0;
    const L = mkPart('HAND OF LIFE', -92, 26, 19, 48), D = mkPart('HAND OF DEATH', 92, 26, 19, 48); L.abs = D.abs = true; L.side = -1; D.side = 1; L.life = 1; b.parts.push(L, D);
  },
  restore(b) { b.slam = null; b.gates = []; b.gT = 1; b.spOn = 0; b.spT = 2; },
  pos(b) { for (const p of b.parts) { const sl = b.slam && p.side === 1 && b.slam.t < b.slam.d * .4; p.x = sl ? b.slam.x : b.x + p.side * 92 + Math.sin(b.t * 1.3 + p.side) * 8; p.y = sl ? b.slam.y - 30 * (b.slam.t / (b.slam.d * .4)) : b.y + 26 + Math.cos(b.t * 1.6 + p.side) * 10; } },
  hand(b, life) { return b.parts.find(p => p.alive && !!p.life === life); },
  onPart(b, p) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .75 : 1; FX.call(lt(p.life ? 'CREATION SEVERED' : 'DEATH SEVERED'), '#f4f4f4', 2, 22); if (p.side === 1) b.slam = null; if (!n) { b.stag = 2.4; b.zanN = 0; } },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; b.gT = .5; FX.call(lt('YOMI GATES'), '#b537f2', 3, 26); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('izanami2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.spT = .8; FX.call(lt('BIRTH OF GODS'), '#ffd700', 3, 28); Aud.sfx('roar'); glitch(.6); Boss.saveCk(b); Comms.say('izanami3', true); Aud.intensity = 3; }
    const fast = b.ph >= 3 ? .72 : 1;
    b.x += clamp(P.x - b.x, -60 * dt, 60 * dt); b.x = clamp(b.x, V.L + 110, V.R - 110); b.y = b.hy + Math.sin(b.t * .9) * 14;
    // petal fans
    b.fT -= dt * G.diff.fire; if (b.fT <= 0) { b.fT = 2.4 * fast; const a = Math.atan2(P.y - b.y, P.x - b.x); for (let k = -3; k <= 3; k++) shoot(b.x, b.y + 10, a + k * .16, 230, k ? 3 : 1); Aud.sfx('laser'); }
    // HAND OF LIFE: creates drones (never more than a few)
    const L = this.hand(b, true); if (L) { b.cT -= dt; if (b.cT <= 0) { b.cT = 6.5 * fast; let al = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive) al++; if (al < 6) for (let k = 0; k < 2; k++) { const e = spawnEnemy(ET.DRONE, clamp(L.x + (k ? 30 : -30), V.L + 20, V.R - 20), L.y + 20, 0); if (e) FX.ring(e.x, e.y, 30, '#9fffcf', 2); } FX.ring(L.x, L.y, 46, '#9fffcf', 3); } }
    // HAND OF DEATH: a slam where you stand
    const D = this.hand(b, false);
    if (D && !b.slam) { b.sT -= dt; if (b.sT <= 0) { b.sT = (b.ph >= 3 ? 2.6 : 3.8); b.slam = { x: P.x, y: P.y, t: b.ph >= 3 ? .85 : 1.05, d: b.ph >= 3 ? .85 : 1.05 }; b.slamN = (b.slamN | 0) + 1; Aud.sfx('warn'); Boss.teleCue(b); Tut.check('izanami', P.x, P.y, 72); } }
    if (b.slam) { const s = b.slam; s.t -= dt; if (s.t <= 0) {
      if (dist(P.x, P.y, s.x, s.y) < 72 && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0) hurt('palm', 54);
      FX.ring(s.x, s.y, 80, '#b537f2', 7); FX.ring(s.x, s.y, 50, '#05010c', 4); shake(.5); Aud.sfx('boom', 1); for (let q = 0; q < 10; q++) shoot(s.x, s.y, q * TAU / 10 + b.t, 160, 0); b.slam = null; } }
    // YOMI GATES
    if (b.ph >= 2) { b.gT -= dt; if (b.gT <= 0 && !b.gates.length) { b.gT = 8; for (const sd of [-1, 1]) b.gates.push({ x: sd < 0 ? V.L + 34 : V.R - 34, y: V.VH * (.4 + R.f() * .25), l: 6, fT: 1 }); FX.call(lt('THE GATES OPEN'), '#b537f2', 1, 16); }
      for (let i = b.gates.length - 1; i >= 0; i--) { const g = b.gates[i]; g.l -= dt; g.fT -= dt * G.diff.fire; if (g.fT <= 0) { g.fT = 1.5; shoot(g.x, g.y, Math.atan2(P.y - g.y, P.x - g.x), 200, 2); } if (g.l <= 0) b.gates.splice(i, 1); } }
    // BIRTH OF GODS: twin spirals
    if (b.ph >= 3) { if (b.spOn > 0) { b.spOn -= dt; b.spT -= dt; if (b.spT <= 0) { b.spT = .11; for (const sd of [-1, 1]) shoot(b.x, b.y, sd * b.t * 2.6, 190, 0); } if (b.spOn <= 0) b.spT = 2.2; }
      else { b.spT -= dt; if (b.spT <= 0) { b.spOn = 3; b.spT = 0; } } }
  },
  draw(b) {
    const s = b.slam; if (s) { const k = 1 - s.t / s.d; cx.globalAlpha = .25 + .5 * k; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + 3 * k; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(s.x, s.y, 72, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.fillStyle = 'rgba(181,55,242,.18)'; cx.beginPath(); cx.arc(s.x, s.y, 72 * k, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
    for (const g of b.gates) { const k = Math.min(1, g.l, (6 - g.l) * 3); cx.save(); cx.translate(g.x, g.y); cx.globalAlpha = k; glow(0, 0, 50, '#b537f2', .5); cx.fillStyle = '#05010c'; cx.beginPath(); cx.ellipse(0, 0, 16, 34, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#b537f2'; cx.lineWidth = 3; cx.stroke();
      cx.strokeStyle = '#c0102e'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(-24, -38); cx.lineTo(24, -38); cx.moveTo(-18, -38); cx.lineTo(-18, 38); cx.moveTo(18, -38); cx.lineTo(18, 38); cx.stroke(); cx.restore(); cx.globalAlpha = 1; } // a dark torii gate
    // the halo of old script
    cx.save(); cx.translate(b.x, b.y - 6); cx.rotate(b.t * .2); cx.strokeStyle = 'rgba(255,215,0,.55)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, b.r + 26, 0, TAU); cx.stroke();
    cx.fillStyle = '#ffd700'; cx.font = '700 11px ' + FONT_M; cx.textAlign = 'center'; const GL = '天地生死陰陽始終'; for (let k = 0; k < 8; k++) { const a = k * TAU / 8; cx.save(); cx.rotate(a); cx.fillText(GL[k], 0, -b.r - 21); cx.restore(); } cx.restore();
    glow(b.x, b.y, b.r * 2.6, b.ph >= 3 ? '#ffd700' : '#f4f4f4', .3);
    // long hair falling behind
    cx.fillStyle = '#0a0a10'; cx.beginPath(); cx.moveTo(b.x - 20, b.y - 20); for (let k = 0; k <= 6; k++) { const x = b.x - 26 + k * 8.6, y = b.y + 30 + Math.sin(b.t * 2 + k) * 6 + (k % 2) * 10; cx.lineTo(x, y); } cx.lineTo(b.x + 20, b.y - 20); cx.closePath(); cx.fill();
    // the robe: left half white, right half black
    cx.save(); cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.clip(); cx.fillStyle = b.fl > .3 ? '#ffffff' : '#f0ece4'; cx.fillRect(b.x - b.r, b.y - b.r, b.r, b.r * 2); cx.fillStyle = b.fl > .3 ? '#ffffff' : '#0c0a12'; cx.fillRect(b.x, b.y - b.r, b.r, b.r * 2);
    cx.strokeStyle = '#c0102e'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(b.x - 14, b.y - b.r); cx.lineTo(b.x, b.y + 4); cx.lineTo(b.x + 14, b.y - b.r); cx.stroke(); cx.restore(); // the collar
    cx.strokeStyle = '#ffd700'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.stroke();
    // the mask
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.ellipse(b.x, b.y - 10, 13, 16, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#8a8270'; cx.lineWidth = 1; cx.stroke();
    cx.strokeStyle = '#c0102e'; cx.lineWidth = 2; for (const sd of [-1, 1]) { cx.beginPath(); cx.moveTo(b.x + sd * 4, b.y - 14); cx.quadraticCurveTo(b.x + sd * 8, b.y - 17, b.x + sd * 11, b.y - 12); cx.stroke(); }
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#05060f'; for (const sd of [-1, 1]) { cx.beginPath(); cx.ellipse(b.x + sd * 6, b.y - 11, 2.6, 1.6, 0, 0, TAU); cx.fill(); }
    cx.fillStyle = '#c0102e'; dot(b.x, b.y - 2, 1.6);
    // the hands
    for (const p of b.parts) { if (!p.alive) continue; const life = !!p.life, col = life ? '#9fffcf' : '#b537f2';
      cx.save(); cx.translate(p.x, p.y); hglow(0, 0, 40, col, .45); cx.fillStyle = p.fl > .3 ? '#ffffff' : life ? '#f4f0e0' : '#140a20';
      cx.beginPath(); cx.ellipse(0, 4, 15, 13, 0, 0, TAU); cx.fill(); for (let k = 0; k < 4; k++) { const x = -10 + k * 6.6; cx.beginPath(); cx.ellipse(x, -10, 3, 8, 0, 0, TAU); cx.fill(); } cx.beginPath(); cx.ellipse(p.side * 15, 2, 7, 3.5, p.side * .5, 0, TAU); cx.fill();
      cx.strokeStyle = col; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(0, 4, 15, 13, 0, 0, TAU); cx.stroke();
      cx.fillStyle = col; cx.font = '700 12px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(life ? '生' : '死', 0, 9); cx.restore(); }
  }
};
