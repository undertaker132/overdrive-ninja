/* ---------------- BONUS BOSS: RAIJIN.SYS, the orbital storm god ----------------
   Six thunder drums orbit the body and call lightning onto you; while they
   live the body takes reduced damage. Phase 2 sweeps lightning curtains across
   the roof (pass through the gap, or dash straight through). Phase 3 adds
   lightning dashes that leave strikes along their path. */
BOSSDEF.raijin = {
  init(b) {
    b.r = 46; b.hp = 260; b.hy = V.VH * .22; b.wpOn = true; b.spin = 0; b.boltT = 1.6; b.curT = 5; b.cur = null; b.dsh = 0; b.dshT = 7; b.da = 0; b.trailT = 0;
    for (let k = 0; k < 6; k++) { const p = mkPart('THUNDER DRUM', 0, 0, 15, 12); p.abs = true; p.da = k * TAU / 6; p.cd = 2.2 + k * .55; b.parts.push(p); }
    b.bodyMul = .4; b.shieldMsg = 'BREAK THE DRUMS';
  },
  restore(b, ck) { if (ck.ph >= 2) b.curT = 2; },
  onPart(b) {
    G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .4 + (6 - n) * .08 : 1;
    if (!n) { b.stag = 2.4; b.zanN = 0; FX.call(lt('DRUMS SILENCED'), '#ffd700', 3); Aud.say('Drums silenced', 1); }
  },
  pos(b) { for (const p of b.parts) { const a = b.spin + p.da; p.x = b.x + Math.cos(a) * 78; p.y = b.y + Math.sin(a) * 60; } },
  update(b, dt) {
    const ng = G.ngp ? .75 : 1;
    if (b.ph === 1 && b.hp < b.mhp * .6) { b.ph = 2; b.curT = 1.5; FX.call(lt('STORM CALL'), '#9fd8ff', 3); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('raijin2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .3) { b.ph = 3; b.dshT = 2; FX.call(lt('THUNDER GOD'), '#ffe14d', 3); Aud.sfx('roar'); glitch(.5); Boss.saveCk(b); Comms.say('raijin3', true); Aud.intensity = 3; }
    b.spin += dt * (b.ph >= 2 ? 1.1 : .7);
    if (b.dsh > 0) { // lightning dash across the roof
      b.dsh -= dt;
      if (b.st === 'tele') { if (b.dsh <= 0) { b.st = 'dash'; b.dsh = .38; b.vx = Math.cos(b.da) * 1050 * G.diff.espd; b.vy = Math.sin(b.da) * 1050 * G.diff.espd; Aud.sfx('laser'); } }
      else {
        b.x += b.vx * dt; b.y += b.vy * dt; b.x = clamp(b.x, V.L + b.r, V.R - b.r); b.y = clamp(b.y, b.r + 20, V.VH - b.r - 120); FX.ghost(b.x, b.y, b.da, '#9fd8ff');
        b.trailT -= dt; if (b.trailT <= 0) { b.trailT = .09; Arena.storm.push({ x: b.x, y: b.y, t: .9, k: 2 }); }
        if (b.dsh <= 0) { b.st = 'idle'; b.dshT = (5.5 + R.f() * 2) * ng; }
      }
      this.pos(b); return;
    }
    b.x = damp(b.x, V.CX + Math.sin(b.t * .6) * 80, 2, dt); b.y = damp(b.y, b.hy + Math.sin(b.t * 1.1) * 12, 2, dt);
    this.pos(b);
    for (const p of b.parts) if (p.alive) { // each drum calls a strike on you
      p.cd -= dt * G.diff.fire; if (p.cd <= 0) { p.cd = (b.ph >= 2 ? 4 : 5) * ng + R.f(); Arena.storm.push({ x: P.x + (R.f() - .5) * 40, y: P.y + (R.f() - .5) * 40, t: 1.15, k: 2, sx: p.x, sy: p.y }); FX.ring(p.x, p.y, 34, '#9fd8ff', 2); }
    }
    b.boltT -= dt * G.diff.fire;
    if (b.boltT <= 0) {
      b.boltT = b.ph >= 3 ? 1.2 : 1.7; const a = Math.atan2(P.y - b.y, P.x - b.x);
      for (let k = -1; k <= 1; k++) shoot(b.x, b.y, a + k * .2, 320, 0);
      if (b.ph >= 2) for (let k = 0; k < 12; k++) shoot(b.x, b.y, b.t + k * TAU / 12, 150, 1);
    }
    if (b.ph >= 2) { // lightning curtains
      if (b.cur) {
        const c = b.cur;
        if (c.tele > 0) c.tele -= dt;
        else {
          c.y += c.v * dt;
          if (Math.abs(P.y - c.y) < 10 && (P.x < c.gx || P.x > c.gx + c.gw)) hurt('curtain');
          if (c.y > V.VH + 20 || c.y < -20) { b.cur = null; b.curT = (b.ph >= 3 ? 5 : 7) * ng; }
        }
      } else { b.curT -= dt; if (b.curT <= 0) { const top = P.y > V.VH * .5, gw = G.ngp ? 80 : 100; b.cur = { y: top ? 40 : V.VH - 150, v: top ? 190 : -190, gx: V.L + 20 + R.f() * (V.AW - 40 - gw), gw, tele: 1.1 }; Aud.sfx('warn'); toast(lt('LIGHTNING CURTAIN — FIND THE GAP OR DASH THROUGH'), '#9fd8ff'); } }
    }
    if (b.ph >= 3) { b.dshT -= dt; if (b.dshT <= 0) { b.st = 'tele'; b.dsh = .8; b.da = Math.atan2(P.y - b.y, P.x - b.x); Aud.sfx('warn'); } }
  },
  draw(b) {
    const col = '#9fd8ff', c = b.cur;
    if (c) { // curtain: dashed while warning, crackling once live
      const live = c.tele <= 0, L = V.L, Rr = V.R;
      cx.globalAlpha = live ? 1 : .45 + .3 * Math.sin(CAM.t * 20); cx.strokeStyle = live ? '#e8f6ff' : '#9fd8ff'; cx.lineWidth = live ? 4 : 2;
      if (!live) cx.setLineDash(DASH8);
      cx.beginPath();
      for (let seg = 0; seg < 2; seg++) {
        const x0 = seg ? c.gx + c.gw : L, x1 = seg ? Rr : c.gx; if (x1 - x0 < 4) continue;
        cx.moveTo(x0, c.y); for (let x = x0 + 14; x < x1; x += 14) cx.lineTo(x, c.y + (live ? Math.sin(x * .7 + CAM.t * 50) * 5 : 0)); cx.lineTo(x1, c.y);
      }
      cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1;
      if (live) { glow(L + (c.gx - L) / 2, c.y, 70, col, .5); glow(c.gx + c.gw + (Rr - c.gx - c.gw) / 2, c.y, 70, col, .5); }
      cx.strokeStyle = '#00ff88'; cx.lineWidth = 2; cx.strokeRect(c.gx, c.y - 12, c.gw, 24);
    }
    if (b.st === 'tele' && b.dsh > 0) { cx.globalAlpha = .5 + .4 * Math.sin(CAM.t * 25); cx.strokeStyle = '#ffe14d'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.cos(b.da) * 600, b.y + Math.sin(b.da) * 600); cx.stroke(); cx.globalAlpha = 1; }
    cx.strokeStyle = 'rgba(159,216,255,.35)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(b.x, b.y, 78, 60, 0, 0, TAU); cx.stroke(); // drum ring
    for (const p of b.parts) if (p.alive) {
      glow(p.x, p.y, 36, col, .4);
      cx.fillStyle = p.fl > .3 ? '#ffffff' : '#2a1046'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2.5; cx.stroke();
      cx.save(); cx.translate(p.x, p.y); cx.rotate(CAM.t * 3 + p.da); cx.fillStyle = '#ffe14d'; // tomoe swirl
      for (let k = 0; k < 3; k++) { cx.rotate(TAU / 3); cx.beginPath(); cx.arc(5, 0, 3, 0, TAU); cx.fill(); cx.beginPath(); cx.arc(5, 0, 6, -1.6, 0); cx.lineWidth = 2; cx.strokeStyle = '#ffe14d'; cx.stroke(); }
      cx.restore();
      if (((CAM.t * 7 + p.da * 3) | 0) % 9 === 0) FX.bolt(p.x, p.y, b.x, b.y, '#bfe6ff', .5);
    }
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.4, col, .45);
    cx.fillStyle = '#eef6ff'; // wild hair
    cx.beginPath(); for (let k = 0; k < 14; k++) { const a = k * TAU / 14 + Math.sin(CAM.t * 3 + k) * .05, r1 = b.r + 4, r2 = b.r + 16 + (k % 2) * 8; cx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); cx.lineTo(Math.cos(a + .22) * r1, Math.sin(a + .22) * r1); } cx.closePath(); cx.fill();
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#26324e'; cx.beginPath(); cx.arc(0, 0, b.r, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 4; cx.stroke();
    const a = Math.atan2(P.y - b.y, P.x - b.x); cx.rotate(a);
    cx.fillStyle = '#f0e6c8'; cx.beginPath(); cx.moveTo(b.r * .3, -b.r * .55); cx.lineTo(b.r * .05, -b.r * 1.15); cx.lineTo(b.r * .5, -b.r * .62); cx.closePath(); cx.moveTo(b.r * .3, b.r * .55); cx.lineTo(b.r * .05, b.r * 1.15); cx.lineTo(b.r * .5, b.r * .62); cx.closePath(); cx.fill(); // horns
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#ffe14d'; cx.beginPath(); cx.ellipse(b.r * .45, -b.r * .3, 6, 4, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.ellipse(b.r * .45, b.r * .3, 6, 4, 0, 0, TAU); cx.fill(); // eyes
    cx.strokeStyle = '#05060f'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(b.r * .75, -b.r * .3); cx.lineTo(b.r * .75, b.r * .3); cx.stroke(); // grimace
    cx.fillStyle = '#ffffff'; for (let k = -2; k <= 2; k++) cx.fillRect(b.r * .66, k * 5 - 1.5, 6, 3);
    cx.restore();
  }
};
