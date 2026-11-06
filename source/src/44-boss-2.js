/* ---------------- BOSS 3: KAGE, THE SHADOW RONIN ---------------- */
BOSSDEF.kage = {
  init(b) { b.r = 21; b.hp = 80; b.hy = V.VH * .3; b.wpOn = false; b.st = 'stalk'; b.stT = 1.6; b.orb = -Math.PI / 2; b.dir = 1; b.cloneT = 5; b.stun = 0; b.da = 0; },
  noContact: true,
  noBody(b) { return b.st === 'dash'; },
  guardCheck(b) {
    if (b.st === 'recover' || b.stun > 0) return false;
    const from = Math.atan2(P.y - b.y, P.x - b.x);
    if (Math.abs(angDiff(from, b.ang)) < 1.3) {
      if (P.pw > 0 || P.bounced) { b.stun = .9; b.st = 'recover'; b.stT = .9; FX.call(lt('GUARD BREAK'), '#ffd700', 2); Aud.sfx('clash'); return false; }
      P.vx *= -.8; P.vy *= -.8; P.ch = P.maxCh; G.hs = .06; FX.spark(b.x, b.y, '#d9c2ff', 12); FX.text(b.x, b.y - 36, lt('BLOCKED'), '#d9c2ff', 13); hint('kage', lt('KAGE BLOCKS FROM THE FRONT: CLASH WITH HIS DASH OR HIT HIM AFTER IT'));
      Aud.sfx('clash'); b.st = 'tele'; b.stT = .38; b.da = Math.atan2(P.y - b.y, P.x - b.x); return true;
    }
    return false;
  },
  clash(b) {
    b.stun = 1.7; b.stag = 1.7; b.zanN = 0; b.st = 'recover'; styleAdd(ST_CLASH, 120); Comms.say('clash'); b.stT = 1.7; b.vx = b.vy = 0;
    P.inv = Math.max(P.inv, .5); P.vx *= -.4; P.vy *= -.4; P.ch = P.maxCh; G.clashes++; if (simV(33)) G.hs = .05; else { G.hs = .16; G.slowT = .5; G.slowK = .3; }
    flash(.5, '#d9c2ff'); shake(.6); punch(.08); Aud.sfx('clash'); vibe('clash');
    FX.ring((b.x + P.x) / 2, (b.y + P.y) / 2, 140, '#ffffff', 6); FX.streak((b.x + P.x) / 2, (b.y + P.y) / 2, 0, '#ffd700', 12);
    FX.call(lt('CLASH — TAP KAGE'), '#ffd700', 3);
  },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .6) { b.ph = 2; FX.call(lt('SHADOW CLONES'), '#a66bff', 3); Boss.saveCk(b); Comms.say('kage2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .3) { b.ph = 3; FX.call(lt('NO MORE GAMES'), '#ff0844', 3); glitch(.3); Boss.saveCk(b); Comms.say('kage3', true); }
    if (b.stun > 0) b.stun -= dt;
    const dx = P.x - b.x, dy = P.y - b.y;
    if (b.st === 'stalk') {
      b.orb += dt * 1.3 * b.dir; if (R.f() < dt * .3) b.dir = -b.dir;
      const tx = P.x + Math.cos(b.orb) * 175, ty = P.y + Math.sin(b.orb) * 175;
      const q = dist(tx, ty, b.x, b.y) || 1, s = Math.min(330, q * 4);
      b.x += (tx - b.x) / q * s * dt; b.y += (ty - b.y) / q * s * dt; b.ang = Math.atan2(dy, dx);
      b.stT -= dt;
      if (b.ph >= 2) { b.cloneT -= dt; if (b.cloneT <= 0) { b.cloneT = 9; let n = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].type === ET.CLONE) n++; for (let k = n; k < 2; k++) { const c = spawnEnemy(ET.CLONE, b.x + (k ? 50 : -50), b.y, 0); if (c) { c.spawnT = .2; c.stT = .6 + k * .5; } } FX.ring(b.x, b.y, 80, '#a66bff', 3); } }
      if (b.stT <= 0) {
        Tut.check('kage', b.x, b.y, 46); b.st = 'tele'; b.stT = b.teleD = b.ph >= 3 ? .48 : b.ph >= 2 ? .58 : .75; b.da = Math.atan2(dy, dx); Aud.sfx('warn');
        if (G.ngp && b.ph >= 2) for (let i = 0; i < EN.n; i++) { const c = EN.a[i]; if (c.alive && c.type === ET.CLONE && c.st === 0) { c.st = 1; c.stT = .55; c.ang = Math.atan2(P.y - c.y, P.x - c.x); } } // NG+: clones dash with him
      }
    } else if (b.st === 'tele') {
      b.stT -= dt; if (b.stT > .22) b.da = Math.atan2(dy, dx); b.ang = b.da;
      if (b.stT <= 0) { b.st = 'dash'; b.stT = .3; b.vx = Math.cos(b.da) * 1500 * G.diff.espd; b.vy = Math.sin(b.da) * 1500 * G.diff.espd; FX.streak(b.x, b.y, b.da + Math.PI, '#a66bff', 8); }
    } else if (b.st === 'dash') {
      b.stT -= dt; b.x += b.vx * dt; b.y += b.vy * dt; FX.ghost(b.x, b.y, b.da, '#a66bff');
      if (dist(b.x, b.y, P.x, P.y) < b.r + P.r + 4) {
        if (P.dashT > 0) { this.clash(b); return; }
        if (hurt('kage')) { b.st = 'recover'; b.stT = .8; }
      }
      if (b.stT <= 0) {
        b.st = 'recover'; b.stT = b.ph >= 3 ? .55 : .75;
        if (b.ph >= 3) { const a = Math.atan2(P.y - b.y, P.x - b.x); for (let k = -2; k <= 2; k++) shoot(b.x, b.y, a + k * .22, 300, 3); }
      }
    } else if (b.st === 'recover') {
      b.stT -= dt; b.vx *= Math.pow(.01, dt); b.vy *= Math.pow(.01, dt); b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.stT <= 0 && b.stun <= 0) { b.st = 'stalk'; b.stT = (b.ph >= 3 ? .7 : 1.2) + R.f() * .8; }
    }
    b.x = clamp(b.x, V.L + b.r, V.R - b.r); b.y = clamp(b.y, b.r + 10, V.VH - b.r - 10);
  },
  draw(b) {
    if (b.st === 'tele') {
      const k = 1 - b.stT / (b.teleD || .75); cx.globalAlpha = .35 + k * .55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 4;
      cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.cos(b.da) * 480, b.y + Math.sin(b.da) * 480); cx.stroke(); cx.globalAlpha = 1;
    }
    const vulnerable = b.st === 'recover' || b.stun > 0;
    glow(b.x, b.y, 60, vulnerable ? '#ffd700' : '#a66bff', .5);
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.ang);
    const f1 = Math.sin(b.t * 9) * b.r * .25, f2 = Math.sin(b.t * 9 + 1.7) * b.r * .3, cl = b.st === 'dash' ? 3.6 : 2.7;
    cx.fillStyle = '#2a1745'; cx.strokeStyle = '#a66bff'; cx.lineWidth = 1.5;
    cx.beginPath(); cx.moveTo(-b.r * .4, -b.r * .85); cx.quadraticCurveTo(-b.r * 1.8, -b.r * .9 + f1, -b.r * cl, -b.r * .5 + f2); cx.lineTo(-b.r * (cl - .3), f1 * .5);
    cx.lineTo(-b.r * cl, b.r * .5 + f2); cx.quadraticCurveTo(-b.r * 1.8, b.r * .9 + f1, -b.r * .4, b.r * .85); cx.closePath(); cx.fill(); cx.stroke();
    cx.fillStyle = b.fl > .3 ? '#fff' : '#1b0f2e'; cx.beginPath(); cx.arc(0, 0, b.r, 0, TAU); cx.fill(); cx.strokeStyle = '#a66bff'; cx.lineWidth = 3; cx.stroke();
    cx.fillStyle = '#3a1f60'; cx.beginPath(); cx.moveTo(b.r * .2, -b.r); cx.lineTo(-b.r * .9, -b.r * .3); cx.lineTo(-b.r * .9, b.r * .3); cx.lineTo(b.r * .2, b.r); cx.closePath(); cx.fill();
    cx.fillStyle = '#ff2bd6'; cx.fillRect(b.r * .3, -b.r * .45, 6, 3); cx.fillRect(b.r * .3, b.r * .3, 6, 3);
    cx.strokeStyle = b.st === 'dash' ? '#ffffff' : '#d9c2ff'; cx.lineWidth = 4; cx.lineCap = 'round';
    const sw = b.st === 'tele' ? -1.2 : b.st === 'dash' ? .2 : .9;
    cx.beginPath(); cx.moveTo(4, 6); cx.lineTo(Math.cos(sw) * 48, Math.sin(sw) * 48 + 6); cx.stroke();
    if (!vulnerable) { cx.strokeStyle = 'rgba(217,194,255,.8)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, b.r + 7, -1.3, 1.3); cx.stroke(); }
    cx.restore();
  }
};

/* ---------------- BOSS 4: SHOGUN.EXE ---------------- */
BOSSDEF.shogun = {
  init(b) {
    b.r = 50; b.hp = 240; b.hy = V.VH * .24; b.ph = 1; b.wpOn = true;
    b.sp = { n: G.ngp ? 5 : 4, a: 0, va: G.ngp ? .75 : .6, tele: 0, on: 0, cd: 2.4 }; b.spT = 0; b.burst = 3; b.gT = 2;
  },
  restore(b, ck) {
    if (ck.ph >= 2 && !b.parts.length) this.addNodes(b);
    if (ck.ph >= 3) { G.narrow = 1; b.sp.n = G.ngp ? 6 : 5; b.sp.va = .85; Aud.intensity = 3; }
  },
  addNodes(b) {
    const pts = [[V.L + 46, V.VH * .52], [V.R - 46, V.VH * .52], [V.CX, V.VH * .82]];
    for (const q of pts) { const p = mkPart('FIREWALL NODE', 0, 0, 22, 14); p.abs = true; p.x = q[0]; p.y = q[1]; p.cd = 1 + R.f(); b.parts.push(p); }
  },
  onPart(b) {
    if (b.ph === 2 && bossPartsAlive(b) === 0) { b.shield = false; b.stag = 2.6; b.zanN = 0; FX.call(lt('CORE EXPOSED'), '#ffd700', 3); Aud.say('Core exposed', 1); }
  },
  update(b, dt) {
    const sp = b.sp;
    if (b.ph === 1 && b.hp < b.mhp * .66) {
      b.ph = 2; b.shield = true; b.shieldMsg = 'SHIELDED — DESTROY THE FIREWALL NODES'; this.addNodes(b); sp.on = sp.tele = 0; sp.cd = 3; Boss.saveCk(b); Comms.say('shogun2', true);
      FX.call(lt('PHASE 2 // FIREWALL'), '#ff0844', 3, 24); glitch(.6); Aud.sfx('roar'); Aud.say('Firewall online');
    }
    if (b.ph === 2 && !b.shield && b.hp < b.mhp * .33) {
      b.ph = 3; G.narrow = 1; sp.n = G.ngp ? 6 : 5; sp.va = .85; Boss.saveCk(b); Comms.say('shogun3', true); FX.call(lt('PHASE 3 // GLITCH STORM'), '#ff0844', 3, 24); glitch(1); Aud.sfx('roar'); Aud.say('Glitch storm'); Aud.intensity = 3;
    }
    if (G.narrow) { V.L = damp(V.L, V.L0 + 46, 1.2, dt); V.R = damp(V.R, V.R0 - 46, 1.2, dt); }
    b.x = V.CX + Math.sin(b.t * .5) * 70; b.y = b.hy + Math.sin(b.t) * 14;
    b.ang = Math.atan2(P.y - b.y, P.x - b.x);
    // laser spokes
    if (sp.tele > 0) { sp.tele -= dt; sp.a += sp.va * .2 * dt; if (sp.tele <= 0) { sp.on = b.ph >= 3 ? 3 : 2.6; Aud.sfx('laser'); } }
    else if (sp.on > 0) {
      sp.on -= dt; sp.a += sp.va * dt;
      for (let k = 0; k < sp.n; k++) { const a = sp.a + k * TAU / sp.n; Boss.beamHits(b.x, b.y, b.x + Math.cos(a) * 900, b.y + Math.sin(a) * 900, 5); }
      if (sp.on <= 0) { sp.cd = b.ph >= 3 ? 1.5 : 2.4; sp.va = -sp.va; }
    } else {
      sp.cd -= dt * G.diff.fire;
      b.spT -= dt; if (b.spT <= 0) { b.spT = b.ph >= 3 ? .075 : .11; const a = b.t * (b.ph >= 3 ? 3.1 : 2.2); shoot(b.x, b.y, a, 180, 0); shoot(b.x, b.y, a + Math.PI, 180, 0); if (b.ph >= 3) shoot(b.x, b.y, -a * .7, 150, 1); }
      if (sp.cd <= 0) { sp.tele = 1.1; Aud.sfx('warn'); }
    }
    b.burst -= dt * G.diff.fire;
    if (b.burst <= 0) { b.burst = b.ph >= 3 ? 1.9 : 3; for (let k = -3; k <= 3; k++) shoot(b.x, b.y, b.ang + k * .13, 300, 1); }
    for (const p of b.parts) if (p.alive) { p.cd -= dt * G.diff.fire; if (p.cd <= 0) { p.cd = 2.3; shoot(p.x, p.y, Math.atan2(P.y - p.y, P.x - p.x), 260, 0); } }
    if (b.ph >= 3) { b.gT -= dt; if (b.gT <= 0) { b.gT = 1.6 + R.f() * 1.5; glitch(.22); } }
  },
  draw(b) {
    const sp = b.sp, col = '#ff0844';
    if (sp.tele > 0 || sp.on > 0) {
      for (let k = 0; k < sp.n; k++) {
        const a = sp.a + k * TAU / sp.n, ex = b.x + Math.cos(a) * 900, ey = b.y + Math.sin(a) * 900;
        if (sp.tele > 0) { cx.globalAlpha = .45; cx.strokeStyle = col; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
        else { cx.strokeStyle = col; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.strokeStyle = '#ffd0da'; cx.lineWidth = 3; cx.stroke(); }
      }
    }
    for (const p of b.parts) if (p.alive) {
      cx.globalAlpha = .5; cx.strokeStyle = '#7df9ff'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(b.x, b.y); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(CAM.t * 1.5); glow(0, 0, 50, '#7df9ff', .4);
      cx.fillStyle = p.fl > .3 ? '#fff' : '#06222a'; cx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); cx.strokeStyle = '#7df9ff'; cx.lineWidth = 3; cx.strokeRect(-p.r, -p.r, p.r * 2, p.r * 2);
      cx.restore();
    }
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.6, col, .45);
    cx.strokeStyle = col; cx.lineWidth = 3;
    for (let k = 0; k < 3; k++) { cx.beginPath(); cx.arc(0, 0, b.r + 6 + k * 9, CAM.t * (k + 1) * .7, CAM.t * (k + 1) * .7 + 4.4); cx.stroke(); }
    cx.fillStyle = '#2a0006'; cx.beginPath(); cx.moveTo(-b.r * .9, -b.r * .35); cx.quadraticCurveTo(-b.r * 1.4, -b.r * 1.5, -b.r * .2, -b.r * 1.6); cx.lineTo(-b.r * .35, -b.r * .7); cx.closePath(); cx.fill();
    cx.beginPath(); cx.moveTo(b.r * .9, -b.r * .35); cx.quadraticCurveTo(b.r * 1.4, -b.r * 1.5, b.r * .2, -b.r * 1.6); cx.lineTo(b.r * .35, -b.r * .7); cx.closePath(); cx.fill();
    cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#14020a'; cx.beginPath(); cx.arc(0, 0, b.r, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 4; cx.stroke();
    const ex = Math.cos(b.ang) * b.r * .3, ey = Math.sin(b.ang) * b.r * .3;
    cx.fillStyle = b.stag > 0 ? '#ffd700' : col; cx.beginPath(); cx.arc(ex, ey, b.r * .3, 0, TAU); cx.fill();
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(ex * 1.2, ey * 1.2, b.r * .1, 0, TAU); cx.fill();
    cx.restore();
  }
};
