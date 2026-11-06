/* ---------------- ACT V BOSS: TENKAI.SYS — the orbital judge ----------------
   A great eye of white-gold glass with four MIRROR PANELS orbiting it. While any
   panel lives the eye takes reduced damage.
   Phase 1 — SOLAR LANCE: a panel focuses the sun. A thin red line shows where,
   then a beam burns along it. Shots from every panel in between.
   Phase 2 — PRISM RAIN (below 66%): columns of light fall from the top of the
   roof, with gaps to slip through. The lance keeps coming.
   Phase 3 — SUPERNOVA (below 33%): the eye charges and bursts in rings of
   light; two lances at a time. With every panel broken, the lances are slow
   and come from the eye itself. */
BOSSDEF.tenkai = {
  init(b) {
    b.r = 34; b.hp = 700; b.hy = V.VH * .24; b.wpOn = true; b.bodyMul = .5; b.st = 'judge'; b.mA = 0; b.fT = 1.8; b.lT = 2.6; b.lances = []; b.rT = 3; b.nT = 4; b.nova = 0;
    for (let k = 0; k < 4; k++) { const p = mkPart('MIRROR PANEL', 0, 0, 17, 34); p.abs = true; p.k = k; b.parts.push(p); }
  },
  restore(b) { b.lances = []; b.nova = 0; b.lT = 2; b.rT = 3; b.nT = 4; },
  pos(b) { for (const p of b.parts) { const a = b.mA + p.k * TAU / 4; p.x = b.x + Math.cos(a) * 86; p.y = b.y + Math.sin(a) * 70; } },
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .5 + .1 * (4 - n) : 1; if (!n) { b.stag = 2.4; b.zanN = 0; FX.call(lt('TENKAI IS BLIND'), '#fff3c4', 2, 22); } },
  lance(b, a0) {
    const live = b.parts.filter(p => p.alive), blind = !live.length, src = blind ? b : live[(R.f() * live.length) | 0];
    const a = a0 != null ? a0 : Math.atan2(P.y - src.y, P.x - src.x);
    b.lances.push({ x: src.x, y: src.y, a, t: blind ? 1.4 : 1.05, on: 0 }); Aud.sfx('warn'); Boss.teleCue(b);
  },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; b.rT = 1.5; FX.call(lt('PRISM RAIN'), '#7df9ff', 3, 26); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('tenkai2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.nT = 1.5; FX.call(lt('SUPERNOVA'), '#ffd700', 3, 28); Aud.sfx('roar'); glitch(.6); Boss.saveCk(b); Comms.say('tenkai3', true); Aud.intensity = 3; }
    const fast = b.ph >= 3 ? .75 : 1, W = V.R - V.L;
    b.mA += dt * (.5 + .25 * b.ph);
    b.x = V.CX + Math.sin(b.t * .45) * W * .26; b.y = b.hy + Math.sin(b.t * .8) * 18;
    // shots from every living panel
    b.fT -= dt * G.diff.fire; if (b.fT <= 0) { b.fT = 2.3 * fast; for (const p of b.parts) if (p.alive) shoot(p.x, p.y, Math.atan2(P.y - p.y, P.x - p.x), 230, 0); }
    // the solar lance
    b.lT -= dt; if (b.lT <= 0) { b.lT = (b.ph >= 3 ? 3 : 3.6) * (bossPartsAlive(b) ? 1 : 1.3); this.lance(b); if (b.ph >= 3) this.lance(b, Math.atan2(P.y - b.y, P.x - b.x) + (R.f() < .5 ? .45 : -.45)); Tut.check('tenkai', P.x, P.y, 50); }
    for (let i = b.lances.length - 1; i >= 0; i--) { const L = b.lances[i];
      if (L.t > 0) { L.t -= dt; if (L.t <= 0) { L.on = .45; shake(.3); Aud.sfx('laser'); } continue; }
      L.on -= dt; Boss.beamHits(L.x, L.y, L.x + Math.cos(L.a) * 1400, L.y + Math.sin(L.a) * 1400, 11); if (L.on <= 0) b.lances.splice(i, 1); }
    // PRISM RAIN: columns of light with gaps
    if (b.ph >= 2) { b.rT -= dt; if (b.rT <= 0) { b.rT = 3.4 * fast; const n = 8, gap = (R.f() * n) | 0; for (let k = 0; k < n; k++) { if (k === gap || k === (gap + 1) % n) continue; const x = V.L + 20 + (W - 40) * k / (n - 1); shoot(x, 10, Math.PI / 2, 190, 4); shoot(x, -30, Math.PI / 2, 190, 4); } Aud.sfx('laser'); } }
    // SUPERNOVA: charge, then rings
    if (b.ph >= 3) {
      if (b.nova > 0) { b.nova -= dt; if (b.nova <= 0) { for (let k = 0; k < 18; k++) shoot(b.x, b.y, k * TAU / 18 + b.t, 200, 0); for (let k = 0; k < 18; k++) shoot(b.x, b.y, k * TAU / 18 + b.t + TAU / 36, 150, 0); FX.ring(b.x, b.y, 140, '#ffd700', 6); shake(.4); Aud.sfx('boom', 1); } }
      else { b.nT -= dt; if (b.nT <= 0) { b.nT = 5.2; b.nova = .9; Boss.teleCue(b); } }
    }
  },
  draw(b) {
    for (const L of b.lances) { // the lance: a thin warning line, then the beam
      const ex = L.x + Math.cos(L.a) * 1400, ey = L.y + Math.sin(L.a) * 1400;
      if (L.t > 0) { cx.globalAlpha = .35 + .4 * Math.sin(CAM.t * 30); cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(L.x, L.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
      else { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round'; cx.strokeStyle = 'rgba(255,215,0,.5)'; cx.lineWidth = 30; cx.beginPath(); cx.moveTo(L.x, L.y); cx.lineTo(ex, ey); cx.stroke(); cx.strokeStyle = '#fff3c4'; cx.lineWidth = 12; cx.stroke(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.stroke(); cx.restore(); }
    }
    // the orbit ring and the panels
    cx.strokeStyle = 'rgba(255,243,196,.25)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(b.x, b.y, 86, 70, 0, 0, TAU); cx.stroke();
    for (const p of b.parts) { if (!p.alive) continue; const a = b.mA + p.k * TAU / 4;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(a + Math.PI / 2); hglow(0, 0, 30, '#7df9ff', .35);
      cx.fillStyle = p.fl > .3 ? '#ffffff' : '#1a2a40'; cx.fillRect(-15, -9, 30, 18); cx.strokeStyle = '#fff3c4'; cx.lineWidth = 2; cx.strokeRect(-15, -9, 30, 18);
      const sh = ((CAM.t * .7 + p.k * .25) % 1) * 40 - 20; cx.save(); cx.beginPath(); cx.rect(-15, -9, 30, 18); cx.clip(); cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(sh - 6, -10); cx.lineTo(sh + 6, 10); cx.stroke(); cx.restore();
      cx.strokeStyle = '#8a94aa'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, 9); cx.lineTo(0, 16); cx.stroke(); cx.restore(); }
    // the eye
    const nova = b.nova > 0 ? 1 - b.nova / .9 : 0;
    glow(b.x, b.y, b.r * 3 + nova * 60, '#ffd700', .4 + nova * .4);
    for (let k = 0; k < 12; k++) { const a = k * TAU / 12 + b.t * .3; cx.fillStyle = k % 2 ? '#ffd700' : '#fff3c4'; cx.beginPath(); cx.moveTo(b.x + Math.cos(a - .08) * b.r, b.y + Math.sin(a - .08) * b.r); cx.lineTo(b.x + Math.cos(a) * (b.r + 14 + nova * 10), b.y + Math.sin(a) * (b.r + 14 + nova * 10)); cx.lineTo(b.x + Math.cos(a + .08) * b.r, b.y + Math.sin(a + .08) * b.r); cx.closePath(); cx.fill(); } // sun rays
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#f4ecd0'; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill(); cx.strokeStyle = '#ffd700'; cx.lineWidth = 3; cx.stroke();
    const la = Math.atan2(P.y - b.y, P.x - b.x), ix = b.x + Math.cos(la) * b.r * .35, iy = b.y + Math.sin(la) * b.r * .35;
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#2a6aff'; cx.beginPath(); cx.arc(ix, iy, b.r * .45, 0, TAU); cx.fill();
    cx.fillStyle = '#05060f'; cx.beginPath(); cx.arc(ix, iy, b.r * (.18 + nova * .12), 0, TAU); cx.fill(); cx.fillStyle = '#ffffff'; dot(ix - 4, iy - 5, 3);
    cx.strokeStyle = 'rgba(42,106,255,.6)'; cx.lineWidth = 1; for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + b.t; cx.beginPath(); cx.moveTo(ix + Math.cos(a) * b.r * .2, iy + Math.sin(a) * b.r * .2); cx.lineTo(ix + Math.cos(a) * b.r * .44, iy + Math.sin(a) * b.r * .44); cx.stroke(); }
  }
};
