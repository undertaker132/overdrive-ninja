/* ---------------- ACT II FINAL BOSS: KUROGANE PRIME ----------------
   The founder in a war frame. Two ARM CANNONS (break them first: until then the
   body takes reduced damage) fire aimed bursts; the body fires rings and stomps
   where you stand. Phase 2 — ZERO HOUR: two clock hands sweep the roof from its
   core (stay between them or dash through), and lightning calls down on you.
   Phase 3 — LAST ORDER: blade rain, red lines across the roof that strike a
   moment later. The gold weakpoint arc staggers it as usual. */
BOSSDEF.prime = {
  init(b) {
    b.r = 52; b.hp = 620; b.hy = V.VH * .22; b.wpOn = true; b.bodyMul = .4;
    b.parts.push(mkPart('ARM CANNON', -80, 6, 22, 22), mkPart('ARM CANNON', 80, 6, 22, 22));
    b.parts[0].cd = 1.2; b.parts[1].cd = 2; b.aT = 2.2; b.hands = null; b.strT = 3; b.rain = []; b.rainT = 2; b.tx = 0; b.ty = 0;
  },
  restore(b, ck) { if (ck.ph >= 2) this.clock(b); },
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .6 : 1; if (!n) { b.stag = 2.4; b.zanN = 0; FX.call(lt('ARMS DOWN'), '#ffd700', 3); } },
  clock(b) { b.hands = [{ a: -Math.PI / 2, va: .55, len: 900, tele: 1.4 }, { a: Math.PI / 2, va: -1.25, len: 900, tele: 1.4 }]; },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; this.clock(b); b.st = 'idle'; FX.call(lt('ZERO HOUR'), '#ffd700', 3, 28); Aud.sfx('roar'); glitch(.4); Boss.saveCk(b); Comms.say('prime2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.hands = null; b.st = 'idle'; FX.call(lt('LAST ORDER'), '#ff0844', 3, 28); Aud.sfx('roar'); glitch(.7); Boss.saveCk(b); Comms.say('prime3', true); Aud.intensity = 3; }
    const fast = b.ph >= 3 ? .75 : 1;
    if (b.st === 'stomp') {
      b.stT -= dt; if (b.stT <= .4) { b.x = damp(b.x, b.tx, 10, dt); b.y = damp(b.y, b.ty, 10, dt); }
      if (b.stT <= 0) { FX.boom(b.x, b.y, 140, '#ffd700'); shake(.7); Aud.sfx('boom', 1); if (dist(P.x, P.y, b.x, b.y) < 115 + P.r * .5) hurt('stomp'); for (let k = 0; k < 12; k++) shoot(b.x, b.y, k * TAU / 12, 220, 0); b.st = 'back'; b.stT = 1; }
      return;
    }
    if (b.st === 'back') { b.stT -= dt; b.x = damp(b.x, b.hx, 3, dt); b.y = damp(b.y, b.hy, 3, dt); if (b.stT <= 0) b.st = 'idle'; return; }
    b.hx = damp(b.hx, clamp(P.x, V.L + 90, V.R - 90), .7, dt); b.x = damp(b.x, b.hx, 2, dt); b.y = b.hy + Math.sin(b.t * 1.3) * 8;
    for (const p of b.parts) if (p.alive) { // arm cannons: aimed bursts
      p.cd -= dt * G.diff.fire;
      if (p.cd <= 0) { p.cd = (b.ph >= 2 ? 2.4 : 2.8) * fast; const a = Math.atan2(P.y - p.y, P.x - p.x); for (let k = 0; k < 3; k++) shoot(p.x, p.y, a + (k - 1) * .09, 330 + k * 30, 0); Aud.sfx('laser'); }
    }
    b.aT -= dt * G.diff.fire;
    if (b.aT <= 0) {
      const pick = b.ph >= 2 ? (b.aIdx++ % 2 ? 'ring' : 'stomp') : (b.aIdx++ % 3 === 2 ? 'stomp' : 'ring');
      if (pick === 'ring') { const n = b.ph >= 3 ? 20 : 16; for (let k = 0; k < n; k++) shoot(b.x, b.y, b.t + k * TAU / n, 170, 1); b.aT = 2.4 * fast; }
      else { b.st = 'stomp'; b.stT = 1.25; b.tx = clamp(P.x, V.L + b.r, V.R - b.r); b.ty = clamp(P.y, b.r + 20, V.VH - b.r - 140); b.aT = 3 * fast; Aud.sfx('warn'); }
    }
    if (b.hands) for (const h of b.hands) { // ZERO HOUR: the clock hands
      if (h.tele > 0) { h.tele -= dt; h.a += h.va * .15 * dt; if (h.tele <= 0) Aud.sfx('laser'); continue; }
      h.a += h.va * (G.ngp ? 1.2 : 1) * dt;
      Boss.beamHits(b.x, b.y, b.x + Math.cos(h.a) * h.len, b.y + Math.sin(h.a) * h.len, 6);
    }
    if (b.ph >= 2) { b.strT -= dt; if (b.strT <= 0) { b.strT = b.ph >= 3 ? 1.8 : 2.4; Arena.storm.push({ x: P.x + (R.f() - .5) * 50, y: P.y + (R.f() - .5) * 50, t: 1.15, k: 2, sx: b.x, sy: b.y }); } }
    if (b.ph >= 3) { // LAST ORDER: blade rain
      b.rainT -= dt;
      if (b.rainT <= 0) {
        b.rainT = 1.6; b.rainN = (b.rainN | 0) + 1;
        for (let k = 0; k < 3; k++) { const a = R.f() * Math.PI, cxp = clamp(P.x + (R.f() - .5) * 160, V.L, V.R), cyp = clamp(P.y + (R.f() - .5) * 160, 40, V.VH - 140); b.rain.push({ x1: cxp - Math.cos(a) * 600, y1: cyp - Math.sin(a) * 600, x2: cxp + Math.cos(a) * 600, y2: cyp + Math.sin(a) * 600, t: .85, d: .85 }); }
        Aud.sfx('warn');
      }
    }
    for (let i = b.rain.length - 1; i >= 0; i--) {
      const r = b.rain[i]; r.t -= dt;
      if (r.t <= 0 && r.t > -dt * 1.5) { Aud.wslash('katana', 6); if (P.inv <= 0 && P.dashT <= 0 && G.odT <= 0 && distToSeg(P.x, P.y, r.x1, r.y1, r.x2, r.y2) < P.r * .6 + 6) hurt('bladerain'); }
      if (r.t <= -.25) b.rain.splice(i, 1);
    }
  },
  draw(b) {
    const col = '#ffd700';
    if (b.st === 'stomp' && b.stT > .4) { cx.strokeStyle = '#ff3b3b'; cx.lineWidth = 3; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(b.tx, b.ty, 115, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = .14; cx.fillStyle = '#ff0844'; cx.fill(); cx.globalAlpha = 1; }
    for (const r of b.rain) {
      if (r.t > 0) { cx.globalAlpha = .3 + (1 - r.t / r.d) * .5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(r.x1, r.y1); cx.lineTo(r.x2, r.y2); cx.stroke(); cx.setLineDash(NODASH); }
      else { cx.globalAlpha = 1 + r.t / .25; cx.strokeStyle = '#ffffff'; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(r.x1, r.y1); cx.lineTo(r.x2, r.y2); cx.stroke(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke(); }
      cx.globalAlpha = 1;
    }
    if (b.hands) { // the clock: a dial and two sweeping hands
      cx.strokeStyle = 'rgba(255,215,0,.35)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(b.x, b.y, b.r + 34, 0, TAU); cx.stroke();
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; cx.beginPath(); cx.moveTo(b.x + Math.cos(a) * (b.r + 28), b.y + Math.sin(a) * (b.r + 28)); cx.lineTo(b.x + Math.cos(a) * (b.r + 40), b.y + Math.sin(a) * (b.r + 40)); cx.stroke(); }
      for (const h of b.hands) {
        const ex = b.x + Math.cos(h.a) * h.len, ey = b.y + Math.sin(h.a) * h.len;
        if (h.tele > 0) { cx.globalAlpha = .5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
        else { cx.strokeStyle = '#ff3b1f'; cx.lineWidth = 12; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.strokeStyle = '#ffd700'; cx.lineWidth = 4; cx.stroke(); }
      }
    }
    for (const p of b.parts) if (p.alive) { // the arms
      cx.strokeStyle = '#3a2e10'; cx.lineWidth = 10; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(p.x, p.y); cx.stroke();
      cx.save(); cx.translate(p.x, p.y); cx.rotate(Math.atan2(P.y - p.y, P.x - p.x)); glow(0, 0, 40, col, .35);
      cx.fillStyle = p.fl > .3 ? '#ffffff' : '#1a1408'; rrect(-18, -14, 36, 28, 5); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2.5; cx.stroke();
      cx.fillStyle = col; cx.fillRect(14, -5, 18, 10); cx.restore();
    }
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.6, col, .4);
    cx.fillStyle = '#ffd700'; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .32; cx.beginPath(); cx.moveTo(Math.cos(a - .1) * b.r * .9, Math.sin(a - .1) * b.r * .9); cx.lineTo(Math.cos(a) * (b.r + 22 + (k === 2 ? 10 : 0)), Math.sin(a) * (b.r + 22 + (k === 2 ? 10 : 0))); cx.lineTo(Math.cos(a + .1) * b.r * .9, Math.sin(a + .1) * b.r * .9); cx.closePath(); cx.fill(); } // crown
    poly(0, 0, b.r, 6, Math.PI / 6); cx.fillStyle = b.fl > .3 ? '#ffffff' : '#0e0b06'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 4; cx.stroke();
    poly(0, 0, b.r * .66, 6, 0); cx.strokeStyle = 'rgba(255,215,0,.5)'; cx.lineWidth = 2; cx.stroke();
    const a = Math.atan2(P.y - b.y, P.x - b.x), ex = Math.cos(a) * b.r * .28, ey = Math.sin(a) * b.r * .28;
    cx.fillStyle = '#2a0006'; cx.beginPath(); cx.arc(0, 0, b.r * .4, 0, TAU); cx.fill();
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#ff0844'; cx.beginPath(); cx.arc(ex, ey, b.r * .2, 0, TAU); cx.fill(); hglow(ex, ey, 30, '#ff0844', .6);
    cx.restore();
  }
};
