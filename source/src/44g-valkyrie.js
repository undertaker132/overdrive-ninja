/* ---------------- ACT III BOSS 1: VALKYRIE.SYS — the orbital guardian ----------------
   An armored angel-frame with two great blade WINGS. While the wings live they
   fire feather fans and the body takes reduced damage; each broken wing grounds
   her a little more. SPEAR DIVE: a red line, then she dives along it. If she hits
   a rail she is stunned (and the gold weakpoint opens). Phase 2 — ORBITAL LANCE:
   marked columns of the roof are burned from orbit a moment later. Phase 3 —
   RAGNAROK: double dives that leave a trail of feathers, and feather rings. */
BOSSDEF.valkyrie = {
  init(b) {
    b.r = 34; b.hp = 560; b.hy = V.VH * .22; b.wpOn = true; b.bodyMul = .45; b.st = 'hover'; b.stT = 2.6; b.fT = 1.4; b.da = 0; b.dvN = 0; b.lanceT = 4; b.cols = []; b.ringT = 3; b.chain = 0;
    b.parts.push(mkPart('BLADE WING', -58, -6, 22, 26), mkPart('BLADE WING', 58, -6, 22, 26));
  },
  restore(b) { b.st = 'hover'; b.stT = 2; b.cols = []; },
  noContact: true,
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .7 : 1; FX.call(lt(n ? 'WING DOWN' : 'GROUNDED'), '#00f2fe', 2, 22); if (!n) { b.stag = 2.2; b.zanN = 0; } },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; b.st = 'hover'; b.stT = 1.6; FX.call(lt('ORBITAL LANCE'), '#00f2fe', 3, 26); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('valk2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.st = 'hover'; b.stT = 1.2; FX.call(lt('RAGNAROK'), '#ff0844', 3, 28); Aud.sfx('roar'); glitch(.6); Boss.saveCk(b); Comms.say('valk3', true); Aud.intensity = 3; }
    const wings = bossPartsAlive(b), fast = b.ph >= 3 ? .75 : 1;
    if (b.st === 'hover') {
      b.hx = damp(b.hx, clamp(P.x, V.L + 70, V.R - 70), .8, dt); b.x = damp(b.x, b.hx + Math.sin(b.t * 1.6) * 40, 2.4, dt); b.y = damp(b.y, b.hy + Math.sin(b.t * 2.1) * 12, 2.4, dt);
      if (wings) { b.fT -= dt * G.diff.fire; if (b.fT <= 0) { b.fT = 1.7 * fast; for (const p of b.parts) if (p.alive) { const a = Math.atan2(P.y - p.y, P.x - p.x); for (let k = -2; k <= 2; k++) shoot(p.x, p.y, a + k * .16, 300, 0); } Aud.sfx('laser'); } }
      if (b.ph >= 3) { b.ringT -= dt; if (b.ringT <= 0) { b.ringT = 2.6; for (let k = 0; k < 18; k++) shoot(b.x, b.y, b.t + k * TAU / 18, 190, 1); } }
      b.stT -= dt;
      if (b.stT <= 0) { Tut.check('valk', b.x, b.y, 50); b.st = 'tele'; b.stT = b.teleD = b.ph >= 3 ? .55 : .75; b.da = Math.atan2(P.y - b.y, P.x - b.x); b.chain = b.ph >= 3 ? 1 : 0; Aud.sfx('warn'); }
    } else if (b.st === 'tele') {
      b.stT -= dt; if (b.stT > .2) b.da = Math.atan2(P.y - b.y, P.x - b.x);
      if (b.stT <= 0) { b.st = 'dive'; b.stT = .55; b.dvN++; b.vx = Math.cos(b.da) * 1250 * G.diff.espd; b.vy = Math.sin(b.da) * 1250 * G.diff.espd; FX.streak(b.x, b.y, b.da + Math.PI, '#00f2fe', 10); Aud.sfx('warp'); }
    } else if (b.st === 'dive') {
      b.stT -= dt; b.x += b.vx * dt; b.y += b.vy * dt; FX.ghost(b.x, b.y, b.da, '#00f2fe');
      if (b.ph >= 3 && ((b.t * 20) | 0) % 3 === 0) shoot(b.x, b.y, b.da + Math.PI / 2 * (((b.t * 20) | 0) % 2 ? 1 : -1), 90, 0); // feather trail
      if (dist(b.x, b.y, P.x, P.y) < b.r + P.r && P.dashT <= 0 && P.inv <= 0) hurt('valkdive');
      const hitRail = b.x < V.L + b.r || b.x > V.R - b.r || b.y < b.r + 10 || b.y > V.VH - b.r - 130;
      if (hitRail) { b.x = clamp(b.x, V.L + b.r, V.R - b.r); b.y = clamp(b.y, b.r + 10, V.VH - b.r - 130); b.st = 'stunned'; b.stT = 1.3; shake(.5); FX.boom(b.x, b.y, 90, '#00f2fe'); Aud.sfx('boom', 1); FX.text(b.x, b.y - 46, lt('CRASHED'), '#00f2fe', 14); }
      else if (b.stT <= 0) { if (b.chain) { b.chain = 0; b.st = 'tele'; b.stT = b.teleD = .38; } else { b.st = 'return'; b.stT = 1; } }
    } else if (b.st === 'stunned') { b.stT -= dt; if (b.stT <= 0) { b.st = 'return'; b.stT = 1; } }
    else if (b.st === 'return') { b.stT -= dt; b.x = damp(b.x, b.hx, 3, dt); b.y = damp(b.y, b.hy, 3, dt); if (b.stT <= 0) { b.st = 'hover'; b.stT = (b.ph >= 2 ? 2.2 : 2.8) * fast; } }
    if (b.ph >= 2) { // ORBITAL LANCE: columns burned from orbit
      b.lanceT -= dt;
      if (b.lanceT <= 0) {
        b.lanceT = b.ph >= 3 ? 3.4 : 4.4; const n = b.ph >= 3 ? 3 : 2, w = V.AW / 7;
        for (let k = 0; k < n; k++) { const x = k === 0 ? clamp(P.x, V.L + w / 2, V.R - w / 2) : V.L + w / 2 + R.f() * (V.AW - w); b.cols.push({ x, w: w * .8, t: 1.1, d: 1.1 }); }
        Aud.sfx('warn'); Boss.teleCue(b);
      }
    }
    for (let i = b.cols.length - 1; i >= 0; i--) {
      const c = b.cols[i]; c.t -= dt;
      if (c.t <= 0 && c.t > -dt * 1.5) { shake(.35); Aud.sfx('laser'); if (Math.abs(P.x - c.x) < c.w / 2 && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0) hurt('lance'); }
      if (c.t <= -.35) b.cols.splice(i, 1);
    }
  },
  draw(b) {
    const col = '#00f2fe';
    for (const c of b.cols) {
      if (c.t > 0) { const k = 1 - c.t / c.d; cx.globalAlpha = .12 + k * .25; cx.fillStyle = '#00f2fe'; cx.fillRect(c.x - c.w / 2, 0, c.w, V.VH); cx.globalAlpha = .5 + k * .5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.strokeRect(c.x - c.w / 2, 0, c.w, V.VH); cx.setLineDash(NODASH); }
      else { cx.globalAlpha = Math.max(0, 1 + c.t / .35); cx.fillStyle = '#e8fbff'; cx.fillRect(c.x - c.w / 2, 0, c.w, V.VH); cx.fillStyle = col; cx.fillRect(c.x - c.w * .2, 0, c.w * .4, V.VH); }
      cx.globalAlpha = 1;
    }
    if (b.st === 'tele') { const k = 1 - b.stT / (b.teleD || .75); cx.globalAlpha = .35 + k * .55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 4; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.cos(b.da) * 700, b.y + Math.sin(b.da) * 700); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
    const flap = b.st === 'dive' ? -.5 : Math.sin(b.t * 5) * .18, face = b.st === 'dive' || b.st === 'tele' ? b.da : Math.PI / 2;
    for (const p of b.parts) { // the wings: a fan of blade-feathers from each shoulder
      const side = p.ox < 0 ? -1 : 1;
      cx.save(); cx.translate(b.x + side * 14, b.y - 4); cx.rotate(side * (flap + .1));
      if (p.alive) {
        hglow(side * 40, -6, 50, col, .3);
        for (let k = 0; k < 5; k++) { const a = side > 0 ? -.6 + k * .28 : Math.PI + .6 - k * .28, L = 34 + k * 9 - (k > 3 ? 12 : 0);
          cx.save(); cx.rotate(a); cx.beginPath(); cx.moveTo(4, -3); cx.lineTo(L, -1.5); cx.lineTo(L + 8, 0); cx.lineTo(L, 2.5); cx.lineTo(4, 4); cx.closePath();
          cx.fillStyle = p.fl > .3 ? '#ffffff' : '#0c1a2e'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 1.6; cx.stroke(); cx.restore(); }
      } else { cx.strokeStyle = 'rgba(0,242,254,.35)'; cx.lineWidth = 2; for (let k = 0; k < 3; k++) { cx.beginPath(); cx.moveTo(6, 0); cx.lineTo(side * (14 + k * 6), 8 + k * 5); cx.stroke(); } }
      cx.restore();
    }
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.4, col, .4);
    cx.strokeStyle = 'rgba(232,251,255,.7)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(0, -b.r - 10, 20, 6, 0, 0, TAU); cx.stroke(); // halo
    cx.rotate(face - Math.PI / 2);
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#0c1424'; cx.beginPath(); cx.moveTo(0, b.r + 6); cx.lineTo(b.r * .8, b.r * .2); cx.lineTo(b.r * .55, -b.r * .8); cx.lineTo(-b.r * .55, -b.r * .8); cx.lineTo(-b.r * .8, b.r * .2); cx.closePath(); cx.fill();
    cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    cx.fillStyle = '#1e3a5a'; cx.beginPath(); cx.arc(0, -2, b.r * .45, 0, TAU); cx.fill(); cx.strokeStyle = '#e8fbff'; cx.lineWidth = 1.5; cx.stroke(); // helm
    cx.fillStyle = b.stag > 0 || b.st === 'stunned' ? '#ffd700' : '#ff0844'; cx.fillRect(-b.r * .3, 2, b.r * .6, 3.5); hglow(0, 4, 24, '#ff0844', .5); // visor
    cx.strokeStyle = '#e8fbff'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(b.r * .5, b.r * .3); cx.lineTo(b.r * .5, b.r + 30); cx.stroke(); cx.fillStyle = col; cx.beginPath(); cx.moveTo(b.r * .5 - 4, b.r + 30); cx.lineTo(b.r * .5, b.r + 44); cx.lineTo(b.r * .5 + 4, b.r + 30); cx.closePath(); cx.fill(); // the lance
    cx.restore();
  }
};
