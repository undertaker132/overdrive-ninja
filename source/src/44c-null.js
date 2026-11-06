/* ---------------- BONUS BOSS 2: REN.NULL — your own combat data ----------------
   Kurogane recorded every fight Ren ever fought and compiled a copy of him.
   REN.NULL fights like you: it aims (red line), dash-slashes, guards from the
   front and is open right after a dash. Dash INTO its dash to clash and stun it.
   Phase 2: dashes come in pairs, and each dash leaves an ECHO that re-traces the
   same line a moment later. Phase 3 (NULL OVERDRIVE): three-dash chains, the roof
   narrows, and mines drop where its chains end. Drawn in YOUR hero's body, inverted. */
const NULL_LOOK = { body: 'ninja', a: '#f2f2f2', b: '#ff0844' }, NULLO = {};
BOSSDEF.renull = {
  init(b) {
    b.r = 20; b.hp = 230; b.hy = V.VH * .3; b.wpOn = false; b.st = 'stalk'; b.stT = 1.5; b.orb = Math.PI / 2; b.dir = 1; b.stun = 0; b.da = 0;
    b.chain = 0; b.echoes = []; b.sx = 0; b.sy = 0; b.ang = Math.PI / 2;
  },
  restore(b, ck) { if (ck.ph >= 3) G.narrow = 1; },
  noContact: true,
  noBody(b) { return b.st === 'dash'; },
  guardCheck(b) { // it blocks from the front, like you would
    if (b.st === 'recover' || b.stun > 0) return false;
    const from = Math.atan2(P.y - b.y, P.x - b.x);
    if (Math.abs(angDiff(from, b.ang)) < 1.25) {
      if (P.pw > 0 || P.bounced) { b.stun = .9; b.st = 'recover'; b.stT = .9; FX.call(lt('GUARD BREAK'), '#ffd700', 2); Aud.sfx('clash'); return false; }
      P.vx *= -.8; P.vy *= -.8; P.ch = P.maxCh; G.hs = .06; FX.spark(b.x, b.y, '#f2f2f2', 12); FX.text(b.x, b.y - 36, lt('BLOCKED'), '#f2f2f2', 13);
      hint('nullg', lt('REN.NULL BLOCKS FROM THE FRONT: CLASH WITH ITS DASH OR HIT IT RIGHT AFTER'));
      Aud.sfx('clash'); b.st = 'tele'; b.stT = b.teleD = .4; b.chain = 0; b.da = Math.atan2(P.y - b.y, P.x - b.x); return true;
    }
    return false;
  },
  clash(b) {
    b.stun = 1.6; b.stag = 1.6; b.zanN = 0; b.st = 'recover'; b.stT = 1.6; b.chain = 0; b.vx = b.vy = 0; styleAdd(ST_CLASH, 120); Comms.say('nullClash');
    P.inv = Math.max(P.inv, .5); P.vx *= -.4; P.vy *= -.4; P.ch = P.maxCh; G.clashes++; if (simV(33)) G.hs = .05; else { G.hs = .16; G.slowT = .5; G.slowK = .3; }
    flash(.5, '#ffffff'); shake(.6); punch(.08); glitch(.25); Aud.sfx('clash'); vibe('clash');
    FX.ring((b.x + P.x) / 2, (b.y + P.y) / 2, 140, '#ffffff', 6); FX.streak((b.x + P.x) / 2, (b.y + P.y) / 2, 0, '#ff0844', 12);
    FX.call(lt('CLASH — TAP REN.NULL'), '#ffd700', 3);
  },
  teleFor(b) { return b.chain > 0 ? (b.ph >= 3 ? .3 : .36) : b.ph >= 3 ? .45 : b.ph >= 2 ? .55 : .7; },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .65) { b.ph = 2; FX.call(lt('ECHO PROTOCOL'), '#f2f2f2', 3); glitch(.3); Boss.saveCk(b); Comms.say('null2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .3) { b.ph = 3; G.narrow = 1; FX.call(lt('NULL OVERDRIVE'), '#ffd700', 3, 26); glitch(.6); Aud.sfx('od'); Boss.saveCk(b); Comms.say('null3', true); Aud.intensity = 3; }
    if (G.narrow) { V.L = damp(V.L, V.L0 + 40, 1.2, dt); V.R = damp(V.R, V.R0 - 40, 1.2, dt); }
    if (b.stun > 0) b.stun -= dt;
    for (let i = b.echoes.length - 1; i >= 0; i--) { // echoes re-trace a finished dash
      const e = b.echoes[i]; e.t -= dt;
      if (e.t <= 0 && e.t > -.28 && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0 && distToSeg(P.x, P.y, e.x1, e.y1, e.x2, e.y2) < P.r * .6 + 7) hurt('echo');
      if (e.t <= -.28) b.echoes.splice(i, 1);
    }
    const dx = P.x - b.x, dy = P.y - b.y;
    if (b.st === 'stalk') {
      b.orb += dt * 1.5 * b.dir; if (R.f() < dt * .35) b.dir = -b.dir;
      const tx = P.x + Math.cos(b.orb) * 190, ty = P.y + Math.sin(b.orb) * 190;
      const q = dist(tx, ty, b.x, b.y) || 1, s = Math.min(360, q * 4);
      b.x += (tx - b.x) / q * s * dt; b.y += (ty - b.y) / q * s * dt; b.ang = Math.atan2(dy, dx); b.stT -= dt;
      if (b.stT <= 0) { Tut.check('nullren', b.x, b.y, 44); b.st = 'tele'; b.chain = 0; b.stT = b.teleD = this.teleFor(b); b.da = Math.atan2(dy, dx); Aud.sfx('warn'); }
    } else if (b.st === 'tele') {
      b.stT -= dt; if (b.stT > .2) b.da = Math.atan2(dy, dx); b.ang = b.da;
      if (b.stT <= 0) { b.st = 'dash'; b.stT = .28; b.sx = b.x; b.sy = b.y; b.vx = Math.cos(b.da) * 1600 * G.diff.espd; b.vy = Math.sin(b.da) * 1600 * G.diff.espd; FX.streak(b.x, b.y, b.da + Math.PI, '#f2f2f2', 8); Aud.wslash(Store.data.weapon, 4); }
    } else if (b.st === 'dash') {
      b.stT -= dt; b.x += b.vx * dt; b.y += b.vy * dt; FX.ghost(b.x, b.y, b.da, '#f2f2f2');
      if (dist(b.x, b.y, P.x, P.y) < b.r + P.r + 4) {
        if (P.dashT > 0) { this.clash(b); return; }
        if (hurt('nulldash')) { b.st = 'recover'; b.stT = .8; b.chain = 0; }
      }
      if (b.stT <= 0) {
        if (b.ph >= 2) { b.echoes.push({ x1: b.sx, y1: b.sy, x2: b.x, y2: b.y, t: .75, d: .75 }); b.echoN = (b.echoN | 0) + 1; }
        const max = b.ph >= 3 ? 3 : b.ph >= 2 ? 2 : 1;
        b.chain++;
        if (b.chain < max) { b.st = 'tele'; b.stT = b.teleD = this.teleFor(b); b.da = Math.atan2(P.y - b.y, P.x - b.x); b.vx *= .2; b.vy *= .2; }
        else {
          b.st = 'recover'; b.stT = b.ph >= 3 ? .6 : .8; b.chain = 0;
          const a = Math.atan2(P.y - b.y, P.x - b.x); for (let k = -1; k <= 1; k++) shoot(b.x, b.y, a + k * .25, 290, 3); // the slash wave you also throw
          if (b.ph >= 3) Arena.layMine(b.x, b.y, BOSS_CODE.renull);
        }
      }
    } else if (b.st === 'recover') {
      b.stT -= dt; b.vx *= Math.pow(.01, dt); b.vy *= Math.pow(.01, dt); b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.stT <= 0 && b.stun <= 0) { b.st = 'stalk'; b.stT = (b.ph >= 3 ? .6 : 1.1) + R.f() * .7; }
    }
    b.x = clamp(b.x, V.L + b.r, V.R - b.r); b.y = clamp(b.y, b.r + 10, V.VH - b.r - 10);
  },
  draw(b) {
    for (const e of b.echoes) { // the echo: dashed while waiting, a white blade line when it strikes
      if (e.t > 0) { cx.globalAlpha = .25 + (1 - e.t / e.d) * .5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(e.x1, e.y1); cx.lineTo(e.x2, e.y2); cx.stroke(); cx.setLineDash(NODASH); }
      else { cx.globalAlpha = 1 + e.t / .28; cx.strokeStyle = '#ffffff'; cx.lineWidth = 9; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(e.x1, e.y1); cx.lineTo(e.x2, e.y2); cx.stroke(); cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.stroke(); }
      cx.globalAlpha = 1;
    }
    if (b.st === 'tele') {
      const k = 1 - b.stT / (b.teleD || .7); cx.globalAlpha = .35 + k * .55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 4;
      cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.cos(b.da) * 480, b.y + Math.sin(b.da) * 480); cx.stroke(); cx.globalAlpha = 1;
    }
    const vulnerable = b.st === 'recover' || b.stun > 0, od = b.ph >= 3;
    glow(b.x, b.y, 64, vulnerable ? '#ffd700' : od ? '#ffd700' : '#f2f2f2', .45);
    const sk = typeof Store !== 'undefined' && Store.data ? skinOf(Store.data.skin) : SKINS[0], o = NULLO;
    heroSetSkin(o, { body: sk.body, a: NULL_LOOK.a, b: NULL_LOOK.b }); o.c1 = '#d8d8d8'; o.c2 = '#ffffff';
    const face = b.st === 'dash' || b.st === 'tele' ? b.da : b.ang, sp = b.st === 'dash' ? 1200 : b.st === 'stalk' ? 260 : 0;
    o.face = o.mvA = face; o.spd = sp; o.ph = b.t * 12; o.sx = o.sy = 1; o.dashing = b.st === 'dash'; o.blade = b.st === 'tele' ? face - 1.2 : b.st === 'dash' ? face - .4 : face + 1.8;
    o.w = Store.data.weapon || 'katana'; o.fx = null; o.bl = 52; o.t = b.t; o.hot = 0; o.od = od ? 1 : 0;
    const s = 1.25, split = (b.fl > .3 ? 5 : 2) + (Math.sin(b.t * 31) > .9 ? 4 : 0);
    cx.save(); cx.translate(b.x, b.y); cx.scale(s, s);
    for (const [ox, a] of [[-split, .35], [split, .35]]) { o.x = ox; o.y = 0; o.alpha = a; heroSetSkin(o, { body: sk.body, a: ox < 0 ? '#ff0844' : '#00f2fe', b: ox < 0 ? '#ff0844' : '#00f2fe' }); drawHero(o); } // RGB split
    heroSetSkin(o, { body: sk.body, a: b.fl > .3 ? '#ffffff' : NULL_LOOK.a, b: NULL_LOOK.b }); o.x = 0; o.y = 0; o.alpha = 1; drawHero(o);
    cx.restore();
    if (rnd() < .25) { cx.fillStyle = rnd() < .5 ? '#ff0844' : '#ffffff'; cx.fillRect(b.x - 30 + rnd() * 50, b.y - 26 + rnd() * 50, 6 + rnd() * 18, 2 + rnd() * 3); } // glitch slivers
    if (!vulnerable) { cx.strokeStyle = 'rgba(242,242,242,.8)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(b.x, b.y, b.r + 10, b.ang - 1.25, b.ang + 1.25); cx.stroke(); }
  }
};
