/* ---------------- ACT II BOSS 2: BENKEI.SYS — the monastery guardian ----------------
   Its body is sealed. Four bronze bells orbit it; the LIT bell is the next one in the
   order (the number on each bell is its place). Ring all four in order and the seal
   breaks: it staggers and is open for a few seconds. A wrong bell tolls a ring of
   shots back at you and the order starts over. Its naginata sweeps a red sector
   after a wind-up. Phase 2: the bells toll on their own. Phase 3: double sweeps,
   faster bells, a new order every time. */
const BELL_R = 108;
BOSSDEF.benkei = {
  init(b) {
    b.r = 40; b.hp = 340; b.hy = V.VH * .33; b.wpOn = false; b.shield = true; b.shieldMsg = 'RING THE BELLS IN ORDER';
    b.spin = 0; b.oi = 0; b.open = 0; b.order = [0, 1, 2, 3]; b.swT = 2.6; b.sw = null; b.tollT = 4; b.ang = Math.PI / 2;
    for (let k = 0; k < 4; k++) { const p = mkPart('BELL', 0, 0, 19, 1e9); p.abs = true; p.k = k; p.rung = 0; p.lit = 0; p.wrong = 0; b.parts.push(p); }
    this.shuffle(b);
  },
  shuffle(b) { const o = b.order; for (let i = 3; i > 0; i--) { const j = R.i(i + 1), t = o[i]; o[i] = o[j]; o[j] = t; } b.oi = 0; for (const p of b.parts) p.rung = 0; },
  restore(b, ck) { b.shield = true; b.open = 0; },
  pos(b) { for (const p of b.parts) { const a = b.spin + p.k * Math.PI / 2; p.x = b.x + Math.cos(a) * BELL_R; p.y = b.y + Math.sin(a) * BELL_R * .82; } },
  partHit(b, p) {
    if (b.open > 0 || b.dying > 0 || p.rung || p.cool > 0) { Aud.bell(880, .3, .05); return true; } // a bell already rung this round just clangs
    p.cool = .5;
    if (p.k === b.order[b.oi]) {
      p.rung = 1; p.lit = 1; b.oi++; styleAdd(ST_HACK, 40);
      Aud.bell(523 * Math.pow(1.26, b.oi), .9, .09); Aud.bell(1046 * Math.pow(1.26, b.oi), .6, .04);
      FX.ring(p.x, p.y, 70, '#ffd23f', 4); FX.text(p.x, p.y - 30, b.oi + '/4', '#ffd23f', 16);
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && !e.mb && dist(e.x, e.y, p.x, p.y) < 110) damageEnemy(e, 2, Math.atan2(e.y - p.y, e.x - p.x), 2); }
      if (b.oi >= 4) { // the seal breaks
        b.open = b.ph >= 3 ? 4.5 : 5.5; b.openN = (b.openN | 0) + 1; b.shield = false; b.stag = 2.4; b.zanN = 0; b.sw = null;
        FX.call(lt('THE BELLS RING TRUE'), '#ffd23f', 3, 24); flash(.3, '#ffd23f'); shake(.4); Aud.sfx('stagger'); vibe('stagger');
      }
    } else { // wrong bell: it tolls back
      p.wrong = 1; Aud.bell(140, 1, .16, 'triangle'); Aud.sfx('deny');
      FX.ring(p.x, p.y, 60, '#ff0844', 4); FX.text(p.x, p.y - 30, lt('WRONG BELL'), '#ff3b5c', 14); hint('bells', lt('HIT THE LIT BELL: THE NUMBERS SHOW THE ORDER'));
      const a0 = Math.atan2(P.y - p.y, P.x - p.x); for (let k = -3; k <= 3; k++) shoot(p.x, p.y, a0 + k * .3, 210, 1);
      if (b.ph >= 3) this.shuffle(b); // in the last phase a wrong bell scrambles the order; before that you only pay with the toll
    }
    return true;
  },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .6) { b.ph = 2; FX.call(lt('THE BELLS AWAKEN'), '#ff9a3d', 3); Aud.sfx('roar'); Boss.saveCk(b); Comms.say('ben2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .3) { b.ph = 3; FX.call(lt('HUNDRED-YEAR VOW'), '#ff0844', 3); glitch(.3); Aud.sfx('roar'); Boss.saveCk(b); Comms.say('ben3', true); Aud.intensity = 3; }
    b.spin += dt * (b.ph >= 3 ? 1 : b.ph >= 2 ? .7 : .45);
    if (b.t > 1.2) { const n = b.parts.find(p => p.k === b.order[b.oi]); if (n && b.open <= 0) Tut.check('bells', n.x, n.y, 34); }
    b.x = damp(b.x, V.CX + Math.sin(b.t * .4) * 40, 2, dt); b.y = damp(b.y, b.hy + Math.sin(b.t * .9) * 10, 2, dt);
    for (const p of b.parts) { if (p.lit > 0) p.lit -= dt * 1.5; if (p.wrong > 0) p.wrong -= dt * 2; if (p.cool > 0) p.cool -= dt; }
    if (b.open > 0) { b.open -= dt; if (b.open <= 0) { b.shield = true; this.shuffle(b); FX.call(lt('SEALED'), '#ff9a3d', 1, 16); Aud.bell(220, .8, .1); } }
    if (!b.sw) { // naginata sweep: wind-up shows the red sector, then it cuts
      if (b.stag > 0) return;
      b.swT -= dt * G.diff.fire;
      if (b.swT <= 0) { const a = Math.atan2(P.y - b.y, P.x - b.x); b.sw = { a, w: .8, t: b.ph >= 3 ? .75 : .95, cut: 0, two: b.ph >= 3 }; Aud.sfx('warn'); }
    } else {
      const s = b.sw; s.t -= dt; b.ang = s.a;
      if (s.t <= 0 && !s.cut) {
        s.cut = .22; Aud.wslash('scythe', 8); shake(.3);
        const inSec = a => { const d = dist(P.x, P.y, b.x, b.y), q = Math.atan2(P.y - b.y, P.x - b.x); return d < 270 && d > 20 && Math.abs(angDiff(q, a)) < s.w; };
        if (P.inv <= 0 && P.dashT <= 0 && G.odT <= 0 && (inSec(s.a) || (s.two && inSec(s.a + Math.PI)))) hurt('sweep');
      }
      if (s.cut) { s.cut -= dt; if (s.cut <= 0) { b.sw = null; b.swT = b.ph >= 3 ? 1.9 : b.ph >= 2 ? 2.4 : 3.1; } }
    }
    if (b.ph >= 2) { b.tollT -= dt; if (b.tollT <= 0) { b.tollT = b.ph >= 3 ? 3 : 4.2; const p = b.parts[R.i(4)]; FX.ring(p.x, p.y, 40, '#ff9a3d', 2); for (let k = 0; k < 8; k++) shoot(p.x, p.y, k * TAU / 8 + b.t, 140, 1); } }
  },
  draw(b) {
    const s = b.sw;
    if (s) { // the sweep sector
      for (const off of s.two ? [0, Math.PI] : [0]) {
        const a = s.a + off; cx.beginPath(); cx.moveTo(b.x, b.y); cx.arc(b.x, b.y, 270, a - s.w, a + s.w); cx.closePath();
        if (!s.cut) { const k = 1 - s.t / .95; cx.globalAlpha = .1 + k * .25; cx.fillStyle = '#ff0844'; cx.fill(); cx.globalAlpha = .6; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
        else { cx.globalAlpha = s.cut / .22 * .6; cx.fillStyle = '#ffffff'; cx.fill(); cx.globalAlpha = 1; }
      }
    }
    cx.strokeStyle = 'rgba(255,154,61,.25)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(b.x, b.y, BELL_R, BELL_R * .82, 0, 0, TAU); cx.stroke();
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.2, b.open > 0 ? '#ffd23f' : '#ff9a3d', .35);
    cx.fillStyle = '#7a2a10'; cx.beginPath(); cx.ellipse(0, 6, b.r * 1.15, b.r * .95, 0, 0, TAU); cx.fill(); // robe
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#2a1a14'; cx.beginPath(); cx.arc(0, 0, b.r * .8, 0, TAU); cx.fill(); cx.strokeStyle = '#ff9a3d'; cx.lineWidth = 3; cx.stroke();
    cx.strokeStyle = '#d9b46a'; cx.lineWidth = 2; for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.arc(k * 8, b.r * .55, 4, 0, TAU); cx.stroke(); } // prayer beads
    cx.fillStyle = '#f0e6c8'; cx.beginPath(); cx.moveTo(-b.r * .62, -b.r * .3); cx.quadraticCurveTo(0, -b.r * 1.15, b.r * .62, -b.r * .3); cx.lineTo(b.r * .5, -b.r * .1); cx.quadraticCurveTo(0, -b.r * .7, -b.r * .5, -b.r * .1); cx.closePath(); cx.fill(); // head cloth
    cx.fillStyle = b.stag > 0 || b.open > 0 ? '#ffd23f' : '#ff3b1f'; cx.fillRect(-14, -6, 9, 4); cx.fillRect(5, -6, 9, 4); hglow(0, -4, 20, '#ff3b1f', .35);
    cx.rotate(b.ang - Math.PI / 2); cx.strokeStyle = '#8a6a3a'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(0, -20); cx.lineTo(0, 120); cx.stroke(); // naginata
    cx.fillStyle = '#e8eef8'; cx.beginPath(); cx.moveTo(-6, 112); cx.quadraticCurveTo(16, 140, 4, 170); cx.lineTo(6, 112); cx.closePath(); cx.fill();
    cx.restore();
    if (b.shield && b.dying <= 0) { cx.strokeStyle = 'rgba(255,154,61,.6)'; cx.lineWidth = 3; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(b.x, b.y, b.r + 14, CAM.t, CAM.t + TAU); cx.stroke(); cx.setLineDash(NODASH); }
    if (b.open > 0) { cx.fillStyle = '#ffd23f'; cx.font = '700 12px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(Math.ceil(b.open) + 's', b.x, b.y - b.r - 22); }
    for (const p of b.parts) { // the bells
      const next = b.open <= 0 && p.k === b.order[b.oi], place = b.order.indexOf(p.k) + 1, pulse = next ? 1 + Math.sin(CAM.t * 8) * .1 : 1;
      if (next) glow(p.x, p.y, 54, '#ffd23f', .7);
      if (p.wrong > 0) glow(p.x, p.y, 50, '#ff0844', p.wrong);
      cx.save(); cx.translate(p.x, p.y); cx.scale(pulse, pulse);
      cx.fillStyle = p.rung ? '#5a7a2a' : '#8a5a20'; cx.beginPath(); cx.moveTo(-16, 12); cx.quadraticCurveTo(-16, -18, 0, -18); cx.quadraticCurveTo(16, -18, 16, 12); cx.lineTo(19, 15); cx.lineTo(-19, 15); cx.closePath(); cx.fill();
      cx.strokeStyle = next ? '#ffd23f' : p.rung ? '#7dff9a' : '#d9a050'; cx.lineWidth = next ? 3 : 2; cx.stroke();
      cx.fillStyle = next ? '#ffd23f' : p.rung ? '#7dff9a' : '#f0e6c8'; cx.font = '700 13px ' + FONT_D; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(p.rung ? '✓' : String(place), 0, 0); cx.textBaseline = 'alphabetic';
      cx.restore();
    }
  }
};
