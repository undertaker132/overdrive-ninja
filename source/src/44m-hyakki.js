/* ---------------- ACT VII BOSS: HYAKKI — the night parade ----------------
   A giant lantern ox-cart with a demon face in front, rolling along the top
   of the roof. Three SPIRIT LANTERNS swing from its roof and spit fireballs;
   while any lantern burns the cart takes reduced damage.
   Phase 1 — THE PARADE: it rolls side to side, then marks a lane (a red
   column) and charges straight down it. Get out of the lane.
   Phase 2 — HUNDRED DEMONS (below 66%): it calls yokai phantoms into the
   fight and turns its wheel of fire.
   Phase 3 — BLOOD MOON (below 33%): the moon turns red, the roof goes dark
   and every charge comes twice. */
BOSSDEF.hyakki = {
  init(b) {
    b.r = 44; b.hp = 900; b.hy = V.VH * .2; b.wpOn = true; b.bodyMul = .5; b.st = 'roll'; b.stT = 3.2; b.fT = 1.8; b.dir = 1; b.lane = null; b.cT = 5; b.whT = 0; b.whOn = 0; b.chN = 0; b.moon = 0; b.spin = 0;
    for (let k = 0; k < 3; k++) { const p = mkPart('SPIRIT LANTERN', 0, 0, 15, 36); p.abs = true; p.k = k; b.parts.push(p); }
  },
  restore(b) { b.st = 'roll'; b.stT = 2; b.lane = null; b.y = b.hy; b.whOn = 0; if (b.ph >= 3) { b.moon = 1; G.dark = 1; } },
  pos(b) { for (const p of b.parts) { const sw = Math.sin(b.t * 2.4 + p.k * 2.1) * .35, ax = b.x + (p.k - 1) * 52; p.x = ax + Math.sin(sw) * 30; p.y = b.y + 40 + Math.cos(sw) * 30; } },
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .5 + .15 * (3 - n) : 1; if (!n) { b.stag = 2.4; b.zanN = 0; FX.call(lt('THE LANTERNS ARE OUT'), '#ff7a1a', 2, 22); } },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; b.cT = 1.5; FX.call(lt('HUNDRED DEMONS'), '#ff7a1a', 3, 26); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('hyakki2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.moon = 1; G.dark = 1; FX.call(lt('BLOOD MOON'), '#ff2a2a', 3, 28); Aud.sfx('roar'); glitch(.6); Boss.saveCk(b); Comms.say('hyakki3', true); Aud.intensity = 3; }
    const fast = b.ph >= 3 ? .75 : 1, top = b.hy;
    b.spin += dt * (b.st === 'charge' ? 14 : 3);
    // fireballs from the lanterns
    b.fT -= dt * G.diff.fire; if (b.fT <= 0 && b.st !== 'charge') { b.fT = 2.4 * fast; for (const p of b.parts) if (p.alive) shoot(p.x, p.y, Math.atan2(P.y - p.y, P.x - p.x), 220, 0); Aud.sfx('laser'); }
    if (b.st === 'roll') {
      b.x += b.dir * 150 * G.diff.espd * dt; if (b.x > V.R - 80) { b.x = V.R - 80; b.dir = -1; } if (b.x < V.L + 80) { b.x = V.L + 80; b.dir = 1; }
      b.y += (top - b.y) * Math.min(1, dt * 3);
      b.stT -= dt; if (b.stT <= 0) { b.st = 'aim'; b.stT = b.ph >= 3 ? .85 : 1.1; b.lane = { x: clamp(P.x, V.L + 50, V.R - 50) }; b.chN = b.ph >= 3 ? 2 : 1; Aud.sfx('warn'); Tut.check('hyakki', P.x, P.y, 60); }
    } else if (b.st === 'aim') { // slide over the lane, then charge
      b.x += (b.lane.x - b.x) * Math.min(1, dt * 6); b.stT -= dt; if (b.stT <= 0) { b.st = 'charge'; shake(.4); Aud.sfx('boom', 0); }
    } else if (b.st === 'charge') {
      b.y += 980 * dt; FX.spark(b.x + (rnd() - .5) * 60, b.y - b.r, '#ff7a1a', 2);
      if (b.y >= V.VH - 150) { b.y = V.VH - 150; FX.ring(b.x, b.y, 120, '#ff7a1a', 7); shake(.6); Aud.sfx('boom', 1); for (let q = 0; q < 14; q++) shoot(b.x, b.y, q * TAU / 14, 180, q % 2 ? 0 : 3);
        if (--b.chN > 0) { b.st = 'back2'; } else b.st = 'back'; }
    } else if (b.st === 'back' || b.st === 'back2') {
      b.y -= 420 * dt; if (b.y <= top) { b.y = top; if (b.st === 'back2') { b.st = 'aim'; b.stT = .7; b.lane = { x: clamp(P.x, V.L + 50, V.R - 50) }; Aud.sfx('warn'); } else { b.st = 'roll'; b.stT = 3.4 * fast; b.lane = null; if (b.ph >= 2) { b.whOn = 1.8; b.whT = 0; } } }
    } else if (b.st === 'stunned') { b.stT -= dt; if (b.stT <= 0) { b.st = 'roll'; b.stT = 2.4; } }
    // HUNDRED DEMONS: yokai join, the wheel of fire turns
    if (b.ph >= 2) {
      b.cT -= dt; if (b.cT <= 0) { b.cT = 7.5 * fast; let al = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive) al++; if (al < 7) for (let k = -1; k <= 1; k++) { const e = spawnEnemy(ET.PHANTOM, clamp(b.x + k * 80, V.L + 30, V.R - 30), b.y + 70, 0); if (e) FX.ring(e.x, e.y, 30, '#ff7a1a', 2); } FX.text(b.x, b.y - b.r - 20, lt('YOKAI RISE'), '#ff7a1a', 13); }
      if (b.st === 'roll' && b.whOn > 0) { b.whOn -= dt; b.whT -= dt; if (b.whT <= 0) { b.whT = .32; for (let k = 0; k < 4; k++) shoot(b.x, b.y, b.spin * .3 + k * TAU / 4, 170, 0); } }
    }
  },
  draw(b) {
    if (b.lane && (b.st === 'aim' || b.st === 'charge')) { // the lane it will charge down
      const a = b.st === 'aim' ? .25 + .25 * Math.sin(CAM.t * 24) : .15; cx.fillStyle = 'rgba(255,8,68,' + a.toFixed(2) + ')'; cx.fillRect(b.lane.x - b.r - 6, b.hy, (b.r + 6) * 2, V.VH - 150 - b.hy + b.r);
      cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.strokeRect(b.lane.x - b.r - 6, b.hy, (b.r + 6) * 2, V.VH - 150 - b.hy + b.r); cx.setLineDash(NODASH);
    }
    if (b.moon) { cx.save(); cx.globalAlpha = .5; glow(V.CX, 60, 140, '#ff2a2a', .5); cx.fillStyle = '#ff2a2a'; dot(V.CX, 60, 34); cx.fillStyle = '#3a0006'; dot(V.CX + 12, 54, 30); cx.restore(); }
    // the lanterns on their cords
    for (const p of b.parts) { if (!p.alive) continue; const ax = b.x + (p.k - 1) * 52;
      cx.strokeStyle = '#3a2410'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(ax, b.y + 10); cx.lineTo(p.x, p.y - 12); cx.stroke();
      glow(p.x, p.y, 34, '#ff9a1a', .6); cx.fillStyle = p.fl > .3 ? '#ffffff' : '#ff7a1a'; cx.beginPath(); cx.ellipse(p.x, p.y, 12, 15, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#7a2a00'; cx.lineWidth = 1.5; cx.stroke();
      cx.strokeStyle = 'rgba(122,42,0,.6)'; cx.lineWidth = 1; for (const y of [-8, 0, 8]) { cx.beginPath(); cx.moveTo(p.x - 11, p.y + y); cx.quadraticCurveTo(p.x, p.y + y + 2, p.x + 11, p.y + y); cx.stroke(); }
      cx.fillStyle = '#2a0a00'; cx.fillRect(p.x - 6, p.y - 17, 12, 4); cx.fillRect(p.x - 6, p.y + 13, 12, 4);
      cx.fillStyle = '#2a0a00'; cx.font = '700 11px ' + FONT_M; cx.textAlign = 'center'; cx.fillText('百鬼夜'[p.k], p.x, p.y + 4); }
    // the cart: two wheels, a roof, and the demon face in front
    for (const sd of [-1, 1]) { const wx = b.x + sd * (b.r + 6), wy = b.y + 6; cx.save(); cx.translate(wx, wy); cx.rotate(b.spin * sd);
      cx.strokeStyle = '#5a3a1a'; cx.lineWidth = 6; cx.beginPath(); cx.arc(0, 0, 22, 0, TAU); cx.stroke(); cx.strokeStyle = '#ff7a1a'; cx.lineWidth = 1.5; cx.stroke();
      cx.strokeStyle = '#3a2410'; cx.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); cx.stroke(); }
      if (b.st === 'charge' || b.ph >= 2) { glow(0, 0, 36, '#ff4a00', .4); for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + .5; cx.fillStyle = k % 2 ? '#ffd23f' : '#ff6a00'; cx.beginPath(); cx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22); cx.lineTo(Math.cos(a + .2) * 32, Math.sin(a + .2) * 32); cx.lineTo(Math.cos(a + .4) * 22, Math.sin(a + .4) * 22); cx.fill(); } }
      cx.fillStyle = '#2a1a0a'; dot(0, 0, 5); cx.restore(); }
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#3a1a0a'; rrect(b.x - b.r, b.y - b.r * .8, b.r * 2, b.r * 1.5, 6); cx.fill(); cx.strokeStyle = '#ff7a1a'; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = '#1a0a04'; cx.beginPath(); cx.moveTo(b.x - b.r - 10, b.y - b.r * .8); cx.lineTo(b.x, b.y - b.r * 1.35); cx.lineTo(b.x + b.r + 10, b.y - b.r * .8); cx.closePath(); cx.fill(); cx.strokeStyle = '#c0102e'; cx.lineWidth = 2; cx.stroke(); // roof
    const fy = b.y + 6; glow(b.x, fy, b.r * 1.6, '#ff2a00', .35);
    cx.fillStyle = '#8a1010'; cx.beginPath(); cx.ellipse(b.x, fy, b.r * .72, b.r * .62, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.stroke(); // the face
    cx.strokeStyle = '#1a0000'; cx.lineWidth = 4; for (const sd of [-1, 1]) { cx.beginPath(); cx.moveTo(b.x + sd * 6, fy - 16); cx.lineTo(b.x + sd * 24, fy - 22); cx.stroke(); } // brows
    for (const sd of [-1, 1]) { glow(b.x + sd * 14, fy - 8, 14, '#ffd23f', .8); cx.fillStyle = b.stag > 0 ? '#ffffff' : '#ffd23f'; cx.beginPath(); cx.ellipse(b.x + sd * 14, fy - 8, 7, 4.5, 0, 0, TAU); cx.fill(); cx.fillStyle = '#1a0000'; dot(b.x + sd * 14, fy - 8, 2); }
    const open = b.st === 'charge' ? 1 : b.st === 'aim' ? .7 : .35; cx.fillStyle = '#1a0000'; cx.beginPath(); cx.ellipse(b.x, fy + 12, 18, 6 + open * 8, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#f0e6c8'; for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.moveTo(b.x + k * 7 - 3, fy + 6); cx.lineTo(b.x + k * 7, fy + 12 + (k % 2 ? 2 : 5)); cx.lineTo(b.x + k * 7 + 3, fy + 6); cx.fill(); }
    for (const sd of [-1, 1]) { cx.fillStyle = '#f0e6c8'; cx.beginPath(); cx.moveTo(b.x + sd * 14, fy - 30); cx.quadraticCurveTo(b.x + sd * 26, fy - 50, b.x + sd * 34, fy - 44); cx.quadraticCurveTo(b.x + sd * 24, fy - 38, b.x + sd * 20, fy - 26); cx.fill(); } // horns
  }
};
{ const kill0 = Boss.kill.bind(Boss); Boss.kill = function (b) { const was = b && b.dying > 0; kill0(b); if (b && !was && b.id === 'hyakki' && b.moon) G.dark = G.mods.dark || (G.stage && G.stage.mod && G.stage.mod.dark && G.mode === 'story') ? 1 : 0; }; } // the blood moon ends with the parade
