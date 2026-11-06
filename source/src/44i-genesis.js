/* ---------------- ACT III FINAL BOSS: DEUS EX KUROGANE — the omniscient machine ----------------
   A golden angel-machine ringed by four HALO NODES. While nodes live they fire
   and armor the core. JUDGEMENT: a red line, then it dashes along it; dash into
   its dash head-on to CLASH and stagger it. Phase 2 — COMPILATION: the roof
   breaks inward from both rails and two judgement beams turn around the core.
   Phase 3 — FINAL SCRIPT: code rain falls in columns while it dashes faster. */
BOSSDEF.genesis = {
  init(b) {
    b.r = 46; b.hp = 900; b.hy = V.VH * .24; b.wpOn = true; b.bodyMul = .4; b.st = 'idle'; b.stT = 3; b.da = 0; b.nT = 1.2; b.ni = 0; b.rainT = 1; b.beams = null; b.stun = 0; b.dashN = 0;
    for (let k = 0; k < 4; k++) { const p = mkPart('HALO NODE', 0, 0, 16, 24); p.abs = true; p.k = k; b.parts.push(p); }
  },
  restore(b, ck) { b.st = 'idle'; b.stT = 2; if (ck.ph >= 2) { G.narrow = 1; this.beamsOn(b); } },
  noContact: true,
  noBody(b) { return b.st === 'dash'; },
  pos(b) { const n = b.parts.length; for (const p of b.parts) { const a = b.t * .9 + p.k * TAU / n; p.x = b.x + Math.cos(a) * 74; p.y = b.y + Math.sin(a) * 52; } },
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = [1, .75, .6, .5, .4][n]; if (!n) { b.stag = 2.6; b.zanN = 0; FX.call(lt('HALO SHATTERED'), '#ffd700', 3); } },
  beamsOn(b) { b.beams = [{ a: 0, va: .5 }, { a: Math.PI, va: .5 }]; },
  clash(b) {
    b.stun = 1.6; b.stag = 1.8; b.zanN = 0; b.st = 'recover'; b.stT = 1.8; b.vx = b.vy = 0; styleAdd(ST_CLASH, 140); G.clashes++;
    P.inv = Math.max(P.inv, .5); P.vx *= -.4; P.vy *= -.4; P.ch = P.maxCh; if (simV(33)) G.hs = .05; else { G.hs = .18; G.slowT = .5; G.slowK = .3; }
    flash(.55, '#ffd700'); shake(.7); punch(.1); Aud.sfx('clash'); vibe('clash');
    FX.ring((b.x + P.x) / 2, (b.y + P.y) / 2, 160, '#ffffff', 6); FX.streak((b.x + P.x) / 2, (b.y + P.y) / 2, 0, '#ffd700', 14); FX.call(lt('CLASH — STRIKE THE CORE'), '#ffd700', 3);
  },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; G.narrow = 1; this.beamsOn(b); b.st = 'idle'; b.stT = 2; FX.call(lt('COMPILATION'), '#ffd700', 3, 28); Aud.sfx('roar'); glitch(.6); shake(.8); Boss.saveCk(b); Comms.say('gen2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.st = 'idle'; b.stT = 1.5; FX.call(lt('FINAL SCRIPT'), '#ff0844', 3, 30); Aud.sfx('roar'); glitch(1); Boss.saveCk(b); Comms.say('gen3', true); Aud.intensity = 3; }
    if (G.narrow) { V.L = damp(V.L, V.L0 + 52, 1.1, dt); V.R = damp(V.R, V.R0 - 52, 1.1, dt); }
    if (b.stun > 0) b.stun -= dt;
    const fast = b.ph >= 3 ? .72 : 1;
    if (b.st === 'idle') {
      b.hx = damp(b.hx, clamp(P.x, V.L + 80, V.R - 80), .6, dt); b.x = damp(b.x, b.hx, 2, dt); b.y = damp(b.y, b.hy + Math.sin(b.t * 1.4) * 10, 2, dt);
      b.stT -= dt; if (b.stT <= 0) { b.st = 'tele'; b.stT = b.teleD = b.ph >= 3 ? .6 : .8; b.da = Math.atan2(P.y - b.y, P.x - b.x); Aud.sfx('warn'); Tut.check('clash', b.x, b.y, 56); }
    } else if (b.st === 'tele') {
      b.stT -= dt; if (b.stT > .22) b.da = Math.atan2(P.y - b.y, P.x - b.x);
      if (b.stT <= 0) { b.st = 'dash'; b.stT = .34; b.dashN++; b.vx = Math.cos(b.da) * 1400 * G.diff.espd; b.vy = Math.sin(b.da) * 1400 * G.diff.espd; FX.streak(b.x, b.y, b.da + Math.PI, '#ffd700', 10); Aud.sfx('warp'); }
    } else if (b.st === 'dash') {
      b.stT -= dt; b.x += b.vx * dt; b.y += b.vy * dt; FX.ghost(b.x, b.y, b.da, '#ffd700');
      if (dist(b.x, b.y, P.x, P.y) < b.r + P.r + 4) { if (P.dashT > 0) { this.clash(b); return; } if (hurt('judgement')) { b.st = 'recover'; b.stT = .8; } }
      if (b.x < V.L + b.r || b.x > V.R - b.r || b.y < b.r + 10 || b.y > V.VH - b.r - 130) b.stT = 0;
      if (b.stT <= 0) { b.st = 'recover'; b.stT = .7; const a = Math.atan2(P.y - b.y, P.x - b.x); for (let k = -3; k <= 3; k++) shoot(b.x, b.y, a + k * .16, 300, 0); }
    } else if (b.st === 'recover') {
      b.stT -= dt; b.vx *= Math.pow(.01, dt); b.vy *= Math.pow(.01, dt); b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.stT <= 0 && b.stun <= 0) { b.st = 'return'; b.stT = .9; }
    } else if (b.st === 'return') { b.stT -= dt; b.x = damp(b.x, b.hx, 3, dt); b.y = damp(b.y, b.hy, 3, dt); if (b.stT <= 0) { b.st = 'idle'; b.stT = (2.4 + R.f() * .8) * fast; } }
    b.x = clamp(b.x, V.L + b.r, V.R - b.r); b.y = clamp(b.y, b.r + 10, V.VH - b.r - 130);
    if (b.st !== 'dash') { b.nT -= dt * G.diff.fire; if (b.nT <= 0) { // the nodes take turns firing
      b.nT = .9 * fast; const alive = b.parts.filter(p => p.alive); if (alive.length) { const p = alive[b.ni++ % alive.length], a = Math.atan2(P.y - p.y, P.x - p.x); shoot(p.x, p.y, a, 340, 0); shoot(p.x, p.y, a + .12, 320, 0); shoot(p.x, p.y, a - .12, 320, 0); }
    } }
    if (b.beams && b.st !== 'dash') for (const h of b.beams) { h.a += h.va * (b.ph >= 3 ? 1.3 : 1) * dt; Boss.beamHits(b.x, b.y, b.x + Math.cos(h.a) * 900, b.y + Math.sin(h.a) * 900, 6); }
    if (b.ph >= 3) { b.rainT -= dt; if (b.rainT <= 0) { b.rainT = .55; const x = V.L + 20 + R.f() * (V.AW - 40); for (let k = 0; k < 3; k++) shoot(x, -10 - k * 26, Math.PI / 2, 250, 0); } }
  },
  draw(b) {
    const col = '#ffd700';
    if (b.st === 'tele') { const k = 1 - b.stT / (b.teleD || .8); cx.globalAlpha = .35 + k * .55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 5; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.cos(b.da) * 800, b.y + Math.sin(b.da) * 800); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
    if (b.beams && b.st !== 'dash') for (const h of b.beams) { const ex = b.x + Math.cos(h.a) * 900, ey = b.y + Math.sin(h.a) * 900; cx.strokeStyle = '#ff0844'; cx.lineWidth = 12; cx.globalAlpha = .55; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.globalAlpha = 1; cx.strokeStyle = '#fff3c4'; cx.lineWidth = 4; cx.stroke(); }
    if (G.narrow) { cx.fillStyle = 'rgba(255,8,68,.12)'; cx.fillRect(V.L0, 0, V.L - V.L0, V.VH); cx.fillRect(V.R, 0, V.R0 - V.R, V.VH); cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(V.L, 0); cx.lineTo(V.L, V.VH); cx.moveTo(V.R, 0); cx.lineTo(V.R, V.VH); cx.stroke(); }
    cx.strokeStyle = 'rgba(255,215,0,.3)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(b.x, b.y, 74, 52, 0, 0, TAU); cx.stroke(); // the halo orbit
    for (const p of b.parts) { if (!p.alive) continue; cx.save(); cx.translate(p.x, p.y); cx.rotate(b.t * 2 + p.k); glow(0, 0, 30, col, .45); cx.fillStyle = p.fl > .3 ? '#fff' : '#1a1406'; poly(0, 0, p.r, 4, 0); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2.5; cx.stroke(); cx.fillStyle = '#fff3c4'; dot(0, 0, 4); cx.restore(); }
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.8, col, .45);
    for (let s = -1; s <= 1; s += 2) { // six golden wing-blades
      for (let k = 0; k < 3; k++) { cx.save(); cx.rotate(s * (.5 + k * .38) + (b.st === 'dash' ? 0 : Math.sin(b.t * 3 + k) * .06) - Math.PI / 2 * 0); cx.scale(s, 1); cx.beginPath(); cx.moveTo(b.r * .7, -4); cx.lineTo(b.r + 38 - k * 8, -10 - k * 6); cx.lineTo(b.r + 46 - k * 8, 0); cx.lineTo(b.r * .7, 6); cx.closePath(); cx.fillStyle = '#2a2008'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke(); cx.restore(); }
    }
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#120e04'; poly(0, 0, b.r, 8, b.t * .2); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 4; cx.stroke();
    cx.strokeStyle = 'rgba(255,215,0,.5)'; cx.lineWidth = 1.5; for (let k = 0; k < 3; k++) { cx.beginPath(); cx.arc(0, 0, b.r * (.35 + k * .18), b.t * (k % 2 ? -1 : 1), b.t * (k % 2 ? -1 : 1) + 4.2); cx.stroke(); } // turning rings of script
    const a = Math.atan2(P.y - b.y, P.x - b.x); cx.fillStyle = '#fff3c4'; cx.beginPath(); cx.arc(Math.cos(a) * 6, Math.sin(a) * 6, b.r * .22, 0, TAU); cx.fill();
    cx.fillStyle = b.stag > 0 ? '#ff0844' : col; cx.beginPath(); cx.arc(Math.cos(a) * 9, Math.sin(a) * 9, b.r * .11, 0, TAU); cx.fill(); hglow(0, 0, 40, '#fff3c4', .5);
    cx.restore();
  }
};
