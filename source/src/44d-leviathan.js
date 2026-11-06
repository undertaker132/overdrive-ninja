/* ---------------- ACT II BOSS 1: LEVIATHAN — the harbor serpent mech ----------------
   A long segmented body follows the head around the roof. Six HULL PLATES fire
   broadsides out of both flanks; while they live the head takes reduced damage.
   It lunges at you along a red line. Phase 2: it dives under the roof and breaches
   where the circle marks. Phase 3: faster, double lunges, spiral broadsides.
   Touching the body hurts unless you are dashing through it. */
const LEV_SEG = 9, LEV_GAP = 9; // body segments, frames of path between them
BOSSDEF.leviathan = {
  init(b) {
    b.r = 30; b.hp = 380; b.hy = V.VH * .3; b.wpOn = true; b.bodyMul = .35; b.shieldMsg = 'IT IS UNDER THE ROOF';
    b.hist = []; b.seg = []; for (let i = 0; i < LEV_SEG; i++) b.seg.push({ x: b.x, y: b.y - 40 - i * 20, r: 26 - i * 1.4 });
    b.ang = Math.PI / 2; b.turn = 0; b.vis = 1; b.st = 'swim'; b.stT = 3; b.bsT = 2.4; b.lunge = 0; b.dvT = 9; b.bx = 0; b.by = 0;
    for (let k = 0; k < 6; k++) { const p = mkPart('HULL PLATE', 0, 0, 15, 12); p.abs = true; p.si = k + 1; b.parts.push(p); }
  },
  restore(b, ck) { b.st = 'swim'; b.stT = 2; },
  noContact: true,
  noBody(b) { return b.st === 'dive'; },
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .35 + (6 - n) * .1 : 1; if (!n) { b.stag = 2.4; b.zanN = 0; FX.call(lt('HULL BREACHED'), '#ffd700', 3); } },
  pos(b) {
    const h = b.hist;
    for (let i = 0; i < LEV_SEG; i++) { const q = h[Math.min(h.length - 1, (i + 1) * LEV_GAP)]; if (q) { b.seg[i].x = q.x; b.seg[i].y = q.y; } }
    for (const p of b.parts) { const s = b.seg[p.si]; p.x = s.x; p.y = s.y; }
  },
  steer(b, dt, sp) { // swim: drift toward a point that circles you, bounce off the rails
    const tx = P.x + Math.cos(b.t * .7) * 160, ty = clamp(P.y + Math.sin(b.t * .9) * 120, 70, V.VH - 200);
    const want = Math.atan2(ty - b.y, tx - b.x), d = angDiff(want, b.ang), mx = 2.2 * dt; b.ang += clamp(d, -mx, mx);
    b.x += Math.cos(b.ang) * sp * dt; b.y += Math.sin(b.ang) * sp * dt;
    if (b.x < V.L + 40 || b.x > V.R - 40) { b.ang = Math.PI - b.ang; b.x = clamp(b.x, V.L + 40, V.R - 40); }
    if (b.y < 50 || b.y > V.VH - 180) { b.ang = -b.ang; b.y = clamp(b.y, 50, V.VH - 180); }
  },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .6) { b.ph = 2; b.dvT = 2; FX.call(lt('DEEP DIVE'), '#2fe6c8', 3); Aud.sfx('roar'); Boss.saveCk(b); Comms.say('lev2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .3) { b.ph = 3; FX.call(lt('RIPTIDE'), '#ff0844', 3); glitch(.3); Aud.sfx('roar'); Boss.saveCk(b); Comms.say('lev3', true); Aud.intensity = 3; }
    const fast = b.ph >= 3 ? 1.35 : b.ph >= 2 ? 1.15 : 1;
    if (b.st === 'swim') {
      this.steer(b, dt, 140 * fast); b.stT -= dt; b.dvT -= dt;
      if (b.ph >= 2 && b.dvT <= 0) { b.st = 'dive'; b.diveN = (b.diveN | 0) + 1; b.stT = 1.7; b.shield = true; b.wpOn = false; b.bx = P.x; b.by = P.y; Aud.sfx('warp'); }
      else if (b.stT <= 0) { b.st = 'tele'; b.stT = .8 / fast; b.lunge = b.ph >= 3 ? 2 : 1; b.da = Math.atan2(P.y - b.y, P.x - b.x); Aud.sfx('warn'); }
    } else if (b.st === 'tele') {
      b.stT -= dt; if (b.stT > .25) b.da = Math.atan2(P.y - b.y, P.x - b.x); b.ang += angDiff(b.da, b.ang) * Math.min(1, 10 * dt);
      if (b.stT <= 0) { b.st = 'lunge'; b.stT = .42; b.ang = b.da; b.lungeN = (b.lungeN | 0) + 1; Aud.sfx('roar'); shake(.2); }
    } else if (b.st === 'lunge') {
      b.stT -= dt; b.x += Math.cos(b.ang) * 880 * G.diff.espd * dt; b.y += Math.sin(b.ang) * 880 * G.diff.espd * dt; b.x = clamp(b.x, V.L + 30, V.R - 30); b.y = clamp(b.y, 40, V.VH - 170);
      FX.ghost(b.x, b.y, b.ang, '#2fe6c8');
      if (b.stT <= 0) { b.lunge--; if (b.lunge > 0) { b.st = 'tele'; b.stT = .45; b.da = Math.atan2(P.y - b.y, P.x - b.x); } else { b.st = 'swim'; b.stT = (b.ph >= 3 ? 3.4 : 4.6) + R.f() * 1.5; } }
    } else if (b.st === 'dive') { // under the roof: only the breach circle shows where it comes up
      b.stT -= dt; b.vis = Math.max(.08, b.vis - dt * 3); if (b.stT > .9) { b.bx = damp(b.bx, P.x, 3, dt); b.by = damp(b.by, P.y, 3, dt); }
      if (b.stT <= 0) {
        b.x = b.bx; b.y = clamp(b.by, 50, V.VH - 180); b.hist.length = 0; b.vis = 1; b.shield = false; b.wpOn = true; b.st = 'swim'; b.stT = 2.2; b.dvT = b.ph >= 3 ? 7 : 9;
        FX.boom(b.x, b.y, 120, '#2fe6c8'); shake(.6); Aud.sfx('boom', 1);
        if (dist(P.x, P.y, b.x, b.y) < 75 + P.r * .5) hurt('breach');
        for (let k = 0; k < 12; k++) shoot(b.x, b.y, k * TAU / 12 + b.t, 190, 0);
      }
    }
    if (b.st !== 'dive') { b.vis = Math.min(1, b.vis + dt * 3); b.hist.unshift({ x: b.x, y: b.y }); if (b.hist.length > LEV_SEG * LEV_GAP + 2) b.hist.length = LEV_SEG * LEV_GAP + 2; }
    // broadsides from every plate still on the hull
    if (b.st !== 'dive') {
      b.bsT -= dt * G.diff.fire;
      if (b.bsT <= 0) {
        b.bsT = b.ph >= 3 ? 1.7 : b.ph >= 2 ? 2.1 : 2.6; let n = 0;
        for (const p of b.parts) if (p.alive) {
          const s0 = b.seg[p.si - 1] || b, a = Math.atan2(p.y - s0.y, p.x - s0.x) + Math.PI / 2;
          for (const sd of [0, Math.PI]) shoot(p.x, p.y, a + sd + (b.ph >= 3 ? b.t : 0) * .3, 180, 0); n++;
        }
        if (!n) for (let k = 0; k < 8; k++) shoot(b.x, b.y, k * TAU / 8 + b.t, 200, 1); // a bare hull spits rings instead
      }
    }
    // the body hurts on touch
    if (b.st !== 'dive' && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0) {
      for (let i = 0; i < LEV_SEG; i += 2) { const s = b.seg[i]; if (dist(P.x, P.y, s.x, s.y) < s.r + P.r * .6) { if (hurt('leviathan')) { const a = Math.atan2(P.y - s.y, P.x - s.x); P.vx = Math.cos(a) * 600; P.vy = Math.sin(a) * 600; } break; } }
      if (dist(P.x, P.y, b.x, b.y) < b.r * .8 + P.r * .6) hurt('leviathan');
    }
  },
  draw(b) {
    if (b.st === 'tele') { const k = 1 - b.stT / .8; cx.globalAlpha = .35 + k * .5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 4; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.cos(b.da) * 420, b.y + Math.sin(b.da) * 420); cx.stroke(); cx.globalAlpha = 1; }
    if (b.st === 'dive') { // the breach mark
      const k = 1 - b.stT / 1.7; cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(b.bx, b.by, 75, 0, TAU); cx.stroke(); cx.setLineDash(NODASH);
      cx.globalAlpha = .12 + k * .25; cx.fillStyle = '#2fe6c8'; cx.beginPath(); cx.arc(b.bx, b.by, 75 * k, 0, TAU); cx.fill(); cx.globalAlpha = 1;
      for (let k2 = 0; k2 < 3; k2++) { const q = ((CAM.t * 1.3 + k2 / 3) % 1); cx.globalAlpha = 1 - q; cx.strokeStyle = '#bffcf2'; cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(b.bx, b.by, 20 + q * 60, (20 + q * 60) * .5, 0, 0, TAU); cx.stroke(); } cx.globalAlpha = 1;
    }
    cx.globalAlpha = b.vis;
    for (let i = LEV_SEG - 1; i >= 0; i--) { // tail first so the head sits on top
      const s = b.seg[i], nx = i ? b.seg[i - 1] : b, a = Math.atan2(nx.y - s.y, nx.x - s.x);
      cx.save(); cx.translate(s.x, s.y); cx.rotate(a);
      cx.fillStyle = b.fl > .3 ? '#ffffff' : '#0b2a2e'; cx.beginPath(); cx.ellipse(0, 0, s.r, s.r * .82, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#2fe6c8'; cx.lineWidth = 2; cx.stroke();
      cx.strokeStyle = 'rgba(47,230,200,.45)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(-s.r * .6, -s.r * .5); cx.lineTo(s.r * .4, 0); cx.lineTo(-s.r * .6, s.r * .5); cx.stroke();
      cx.fillStyle = '#ff0844'; cx.fillRect(-2, -s.r * .82 - 4, 4, 6); cx.fillRect(-2, s.r * .82 - 2, 4, 6); // fin lights
      cx.restore();
    }
    for (const p of b.parts) if (p.alive) { cx.save(); cx.translate(p.x, p.y); cx.rotate(CAM.t * .5 + p.si); poly(0, 0, p.r, 6, 0); cx.fillStyle = p.fl > .3 ? '#ffffff' : '#1d4a50'; cx.fill(); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2.5; cx.stroke(); cx.fillStyle = '#ffd23f'; dot(0, 0, 3.5); cx.restore(); }
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.ang); glow(0, 0, 70, '#2fe6c8', .35);
    const jaw = b.st === 'lunge' || b.st === 'tele' ? .55 : .2 + Math.sin(b.t * 4) * .08;
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#0f3a40';
    for (const sd of [-1, 1]) { cx.beginPath(); cx.moveTo(-14, 0); cx.lineTo(38, sd * 6); cx.lineTo(30, sd * (16 + jaw * 24)); cx.lineTo(-8, sd * 22); cx.closePath(); cx.fill(); cx.strokeStyle = '#2fe6c8'; cx.lineWidth = 2.5; cx.stroke(); }
    cx.fillStyle = '#f0e6c8'; for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { const x = 6 + k * 8; cx.beginPath(); cx.moveTo(x, sd * (7 + jaw * 8)); cx.lineTo(x + 3, sd * (1 + jaw * 4)); cx.lineTo(x + 6, sd * (7 + jaw * 8)); cx.closePath(); cx.fill(); }
    cx.beginPath(); cx.arc(-8, 0, b.r * .8, 0, TAU); cx.fillStyle = b.fl > .3 ? '#ffffff' : '#0b2a2e'; cx.fill(); cx.strokeStyle = '#2fe6c8'; cx.lineWidth = 3; cx.stroke();
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#ff0844'; dot(4, -12, 4); dot(4, 12, 4); hglow(4, 0, 22, '#ff0844', .5);
    cx.restore(); cx.globalAlpha = 1;
  }
};
