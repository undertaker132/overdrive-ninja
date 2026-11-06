/* ---------------- ACT IV BOSS: ORYU.EXE — the last echo of Kurogane ----------------
   A serpent made of deep-sea data cable. The head hunts you across the roof and
   the body follows its trail; touching the body (outside a dash) hurts. Three
   CABLE CORES ride on the body: while any lives the head takes reduced damage.
   Phase 1 — VENOM: fans of data venom from the jaws.
   Phase 2 — CONSTRICT: the body throws a closing ring around you; get out
   before it snaps shut.
   Phase 3 — ECHO SPLIT: the tail tears loose and becomes a second, smaller
   serpent that hunts you on its own. Rings close faster. */
const ORYU_SEG = 14, ORYU_GAP = 20;
BOSSDEF.oryu = {
  init(b) {
    b.r = 30; b.hp = 640; b.hy = V.VH * .26; b.wpOn = true; b.bodyMul = .45; b.st = 'hunt'; b.stT = 3; b.fT = 1.6; b.trail = []; b.ring = null; b.twin = null; b.coilN = 0; b.head = Math.PI / 2; b.spd = 150;
    for (const k of [3, 7, 11]) { const p = mkPart('CABLE CORE', 0, 0, 15, 40); p.abs = true; p.seg = k; b.parts.push(p); }
  },
  restore(b) { b.st = 'hunt'; b.stT = 2; b.ring = null; if (b.ph >= 3) this.split(b); },
  split(b) { const s = this.segAt(b, ORYU_SEG); b.twin = { x: s.x, y: s.y, head: b.head + Math.PI, trail: [], fT: 1.2, t: 0 }; },
  noContact: true,
  pos(b) { // the cores ride on the body
    for (const p of b.parts) { const s = this.segAt(b, p.seg); p.x = s.x; p.y = s.y; }
  },
  segAt(b, k) { const T = b.trail, i = Math.min(T.length - 1, k * 3); return i >= 0 && T[i] ? T[i] : { x: b.x, y: b.y - k * ORYU_GAP }; },
  onPart(b) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n ? .65 : 1; FX.call(lt(n ? 'CORE CUT' : 'CABLES SEVERED'), '#2ee6c8', 2, 22); if (!n) { b.stag = 2.2; b.zanN = 0; } },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; b.st = 'hunt'; b.stT = 1.4; FX.call(lt('CONSTRICT'), '#2ee6c8', 3, 26); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('oryu2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; b.st = 'hunt'; b.stT = 1.2; FX.call(lt('ECHO SPLIT'), '#7a5cff', 3, 28); Aud.sfx('roar'); glitch(.6); Boss.saveCk(b); Comms.say('oryu3', true); Aud.intensity = 3; this.split(b); FX.boom(b.twin.x, b.twin.y, 110, '#7a5cff'); }
    const fast = b.ph >= 3 ? .75 : 1, sp = (b.ph >= 3 ? 210 : b.ph >= 2 ? 185 : 160) * G.diff.espd;
    // the trail the body follows (newest first)
    const T = b.trail; if (!T.length || dist(T[0].x, T[0].y, b.x, b.y) > ORYU_GAP / 3) { T.unshift({ x: b.x, y: b.y }); if (T.length > ORYU_SEG * 3 + 2) T.pop(); }
    { // the body hurts on contact
      for (let k = 1; k <= ORYU_SEG; k++) { const s = this.segAt(b, k); if (dist(s.x, s.y, P.x, P.y) < 13 + P.r && P.dashT <= 0 && P.inv <= 0 && G.odT <= 0) { hurt('coil', 52); break; } }
    }
    const tw = b.twin; if (tw) { // ECHO SPLIT: the second serpent
      tw.t += dt; const want = Math.atan2(P.y - tw.y, P.x - tw.x) + Math.sin(tw.t * 3) * .9; tw.head += clamp(angDiff(want, tw.head), -2.8 * dt, 2.8 * dt);
      tw.x = clamp(tw.x + Math.cos(tw.head) * sp * .9 * dt, V.L + 20, V.R - 20); tw.y = clamp(tw.y + Math.sin(tw.head) * sp * .9 * dt, 30, V.VH - 150);
      if (!tw.trail.length || dist(tw.trail[0].x, tw.trail[0].y, tw.x, tw.y) > ORYU_GAP / 3) { tw.trail.unshift({ x: tw.x, y: tw.y }); if (tw.trail.length > 7 * 3 + 2) tw.trail.pop(); }
      for (let k = 0; k <= 7; k++) { const q = tw.trail[Math.min(tw.trail.length - 1, k * 3)] || tw; if (dist(q.x, q.y, P.x, P.y) < 11 + P.r && P.dashT <= 0 && P.inv <= 0 && G.odT <= 0) { hurt('coil', 52); break; } }
      tw.fT -= dt * G.diff.fire; if (tw.fT <= 0) { tw.fT = 1.6; shoot(tw.x, tw.y, Math.atan2(P.y - tw.y, P.x - tw.x), 240, 1); }
    }
    if (b.st === 'hunt') {
      const want = Math.atan2(P.y - b.y, P.x - b.x) + Math.sin(b.t * 2.2) * .6; b.head += clamp(angDiff(want, b.head), -2.4 * dt, 2.4 * dt);
      b.x = clamp(b.x + Math.cos(b.head) * sp * dt, V.L + b.r, V.R - b.r); b.y = clamp(b.y + Math.sin(b.head) * sp * dt, b.r + 10, V.VH - b.r - 130);
      b.fT -= dt * G.diff.fire; if (b.fT <= 0) { b.fT = 1.8 * fast; const a = Math.atan2(P.y - b.y, P.x - b.x); for (let k = -2; k <= 2; k++) shoot(b.x + Math.cos(b.head) * 20, b.y + Math.sin(b.head) * 20, a + k * .2, 260, k ? 0 : 1); Aud.sfx('laser'); }
      b.stT -= dt;
      if (b.stT <= 0) {
        if (b.ph >= 2) { const d = b.ph >= 3 ? 1.35 : 1.7; b.st = 'coil'; b.coilN++; Tut.check('oryu', P.x, P.y, 60); b.ring = { x: P.x, y: P.y, r: 190, t: d, d }; Aud.sfx('warn'); Boss.teleCue(b); }
        else b.stT = 2.4 * fast;
      }
    } else if (b.st === 'coil') { // the ring closes; anyone still inside is crushed
      const g = b.ring; g.t -= dt; const k = 1 - g.t / g.d; g.r = 190 - 150 * k * k;
      b.head += 3.2 * dt; b.x = g.x + Math.cos(b.head) * g.r; b.y = clamp(g.y + Math.sin(b.head) * g.r, b.r + 10, V.VH - b.r - 130);
      if (g.t <= 0) { if (dist(P.x, P.y, g.x, g.y) < 48 && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0) hurt('coil', 52); FX.ring(g.x, g.y, 60, '#2ee6c8', 6); shake(.5); Aud.sfx('boom', 1); for (let q = 0; q < 12; q++) shoot(g.x, g.y, q * TAU / 12, 170, 0); b.ring = null; b.st = 'hunt'; b.stT = 2.6 * fast; }
    } else if (b.st === 'stunned') { b.stT -= dt; if (b.stT <= 0) { b.st = 'hunt'; b.stT = 2.2 * fast; } }
  },
  draw(b) {
    const g = b.ring;
    if (g) { const k = 1 - g.t / g.d; cx.globalAlpha = .3 + .5 * k; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + 3 * k; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(g.x, g.y, 48, 0, TAU); cx.stroke(); cx.setLineDash(NODASH);
      cx.strokeStyle = '#2ee6c8'; cx.globalAlpha = .2 + .3 * k; cx.lineWidth = 3; cx.beginPath(); cx.arc(g.x, g.y, g.r, 0, TAU); cx.stroke(); cx.globalAlpha = 1; }
    const tw = b.twin; if (tw) { // the echo serpent: smaller, violet
      for (let k = 7; k >= 0; k--) { const q = tw.trail[Math.min(tw.trail.length - 1, k * 3)] || tw, r = 10 - k * .6; hglow(q.x, q.y, r * 2.2, '#7a5cff', .2); cx.fillStyle = '#100a24'; cx.beginPath(); cx.arc(q.x, q.y, r, 0, TAU); cx.fill(); cx.strokeStyle = '#7a5cff'; cx.lineWidth = 2; cx.stroke(); }
      cx.save(); cx.translate(tw.x, tw.y); cx.rotate(tw.head); cx.fillStyle = '#100a24'; cx.beginPath(); cx.moveTo(18, 0); cx.lineTo(4, -10); cx.lineTo(-10, -8); cx.lineTo(-10, 8); cx.lineTo(4, 10); cx.closePath(); cx.fill(); cx.strokeStyle = '#7a5cff'; cx.lineWidth = 2; cx.stroke(); cx.fillStyle = '#e0d8ff'; dot(6, -4, 1.8); dot(6, 4, 1.8); cx.restore();
    }
    // the body: cable rings from the tail to the head
    for (let k = ORYU_SEG; k >= 1; k--) {
      const s = this.segAt(b, k), n = this.segAt(b, k - 1), a = Math.atan2(n.y - s.y, n.x - s.x), r = 14 - k * .45;
      cx.save(); cx.translate(s.x, s.y); cx.rotate(a); hglow(0, 0, r * 2.2, '#2ee6c8', .18);
      cx.fillStyle = b.fl > .3 ? '#ffffff' : '#081c20'; cx.beginPath(); cx.ellipse(0, 0, r * 1.1, r, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#2ee6c8'; cx.lineWidth = 2; cx.stroke();
      cx.strokeStyle = 'rgba(122,92,255,.7)'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(-r * .6, -r * .7); cx.lineTo(-r * .6, r * .7); cx.stroke();
      if (k % 2 === 0) { cx.fillStyle = '#2ee6c8'; cx.beginPath(); cx.moveTo(-3, -r); cx.lineTo(0, -r - 7); cx.lineTo(3, -r); cx.fill(); cx.beginPath(); cx.moveTo(-3, r); cx.lineTo(0, r + 7); cx.lineTo(3, r); cx.fill(); } // dorsal fins
      cx.restore();
    }
    for (const p of b.parts) if (p.alive) { hglow(p.x, p.y, 30, '#7a5cff', .5); cx.fillStyle = p.fl > .3 ? '#ffffff' : '#7a5cff'; poly(p.x, p.y, p.r * .8, 6, b.t); cx.fill(); cx.strokeStyle = '#e0d8ff'; cx.lineWidth = 2; cx.stroke(); }
    // the head
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.head); glow(0, 0, b.r * 2.4, '#2ee6c8', .4);
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#06181c'; cx.beginPath(); cx.moveTo(b.r * 1.3, 0); cx.lineTo(b.r * .5, -b.r * .75); cx.lineTo(-b.r * .7, -b.r * .65); cx.lineTo(-b.r, 0); cx.lineTo(-b.r * .7, b.r * .65); cx.lineTo(b.r * .5, b.r * .75); cx.closePath(); cx.fill();
    cx.strokeStyle = '#2ee6c8'; cx.lineWidth = 3; cx.stroke();
    cx.strokeStyle = '#7a5cff'; cx.lineWidth = 3; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(-b.r * .3, s * b.r * .55); cx.quadraticCurveTo(-b.r * 1.1, s * b.r * 1.2, -b.r * 1.6, s * b.r * .9); cx.stroke(); } // antenna horns
    const open = b.st === 'hunt' && b.fT < .3 ? .4 : .1; cx.fillStyle = '#ff0844'; cx.beginPath(); cx.moveTo(b.r * 1.3, 0); cx.lineTo(b.r * .6, -b.r * open); cx.lineTo(b.r * .6, b.r * open); cx.closePath(); cx.fill(); // the jaw glows before venom
    cx.fillStyle = b.stag > 0 || b.st === 'stunned' ? '#ffd700' : '#bff8ee'; for (const s of [-1, 1]) { hglow(b.r * .45, s * b.r * .4, 12, '#2ee6c8', .8); cx.beginPath(); cx.ellipse(b.r * .45, s * b.r * .4, 5, 2.6, s * .3, 0, TAU); cx.fill(); }
    cx.restore();
  }
};
