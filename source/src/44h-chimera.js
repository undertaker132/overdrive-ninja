/* ---------------- ACT III BOSS 2: CHIMERA.OS — the corrupted composite ----------------
   Three old bosses rebuilt as heads on one body. HYDRA HEAD spins bullet spirals,
   KAGE MASK sends shadow clones that dash along red lines, SHOGUN CROWN drops
   firewall bars across the roof. Each head you break takes its attack with it and
   weakens the body's armor. Phase 2 — MERGE: the body blinks to a new spot with a
   burst. Phase 3 — CORRUPTION: marked circles of the roof decay, and the heads
   that remain attack faster. */
BOSSDEF.chimera = {
  init(b) {
    b.r = 40; b.hp = 640; b.hy = V.VH * .25; b.wpOn = true; b.bodyMul = .35; b.sa = 0; b.blT = 6; b.zones = []; b.zT = 3; b.bars = []; b.barT = 3.5; b.cloneT = 4; b.spT = .2; b.blink = 0;
    const h = mkPart('HYDRA HEAD', -52, 22, 20, 30), k = mkPart('KAGE MASK', 0, -44, 19, 30), s = mkPart('SHOGUN CROWN', 52, 22, 20, 30);
    h.kind = 'hydra'; k.kind = 'kage'; s.kind = 'shogun'; b.parts.push(h, k, s);
  },
  restore(b) { b.zones = []; b.bars = []; },
  onPart(b, p) { G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = [1, .8, .55, .35][n]; FX.call(ltf('{0} DELETED', lt(p ? p.name : 'HEAD')), '#c45bff', 2, 22); if (!n) { b.stag = 2.6; b.zanN = 0; FX.call(lt('NO HEADS LEFT'), '#ffd700', 3); } },
  head(b, kind) { for (const p of b.parts) if (p.alive && p.kind === kind) return p; return null; },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; FX.call(lt('MERGE'), '#c45bff', 3, 26); Aud.sfx('roar'); glitch(.5); Boss.saveCk(b); Comms.say('chim2', true); }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; FX.call(lt('CORRUPTION'), '#ff0844', 3, 28); Aud.sfx('roar'); glitch(.8); Boss.saveCk(b); Comms.say('chim3', true); Aud.intensity = 3; }
    const fast = b.ph >= 3 ? .7 : 1;
    if (b.blink > 0) { b.blink -= dt; if (b.blink <= 0) { b.x = b.bx; b.y = b.by; b.hx = b.bx; FX.ring(b.x, b.y, 140, '#c45bff', 5); for (let k = 0; k < 14; k++) shoot(b.x, b.y, k * TAU / 14, 210, 1); shake(.4); Aud.sfx('warp'); } return; }
    b.hx = damp(b.hx, clamp(P.x, V.L + 90, V.R - 90), .5, dt); b.x = damp(b.x, b.hx, 1.6, dt); b.y = damp(b.y, b.hy + Math.sin(b.t * 1.2) * 14, 2, dt);
    if (b.t > 1.5) Tut.check('chimera', b.x, b.y, 70);
    const hy = this.head(b, 'hydra'), kg = this.head(b, 'kage'), sg = this.head(b, 'shogun');
    if (hy) { b.spT -= dt * G.diff.fire; if (b.spT <= 0) { b.spT = .16 / fast; b.sa += .42; shoot(hy.x, hy.y, b.sa, 230, 0); if (b.ph >= 2) shoot(hy.x, hy.y, b.sa + Math.PI, 230, 0); } }
    if (kg) { b.cloneT -= dt; if (b.cloneT <= 0) { b.cloneT = 6.5 * fast; let n = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].type === ET.CLONE) n++; for (let k = n; k < 2; k++) { const c = spawnEnemy(ET.CLONE, kg.x + (k ? 40 : -40), kg.y, 0); if (c) { c.spawnT = .4; b.cloneN = (b.cloneN | 0) + 1; } } FX.ring(kg.x, kg.y, 60, '#a66bff', 3); } }
    if (sg) { b.barT -= dt; if (b.barT <= 0) { b.barT = 4.2 * fast; const y = clamp(P.y + (R.f() - .5) * 60, 80, V.VH - 150); b.bars.push({ y, t: 1, d: 1, h: 22 }); b.barN = (b.barN | 0) + 1; if (b.ph >= 3) b.bars.push({ y: clamp(V.VH - 150 - (y - 80), 80, V.VH - 150), t: 1, d: 1, h: 22 }); Aud.sfx('warn'); Boss.teleCue(b); } }
    for (let i = b.bars.length - 1; i >= 0; i--) { const r = b.bars[i]; r.t -= dt; if (r.t <= 0 && r.t > -.6 && Math.abs(P.y - r.y) < r.h / 2 + P.r * .5 && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0) hurt('firewall'); if (r.t <= -.6) b.bars.splice(i, 1); }
    if (b.ph >= 2) { b.blT -= dt; if (b.blT <= 0) { b.blT = 6.5 * fast; b.blink = .7; b.bx = V.L + 80 + R.f() * (V.AW - 160); b.by = V.VH * (.18 + R.f() * .18); FX.ring(b.x, b.y, 80, '#c45bff', 3); FX.ring(b.bx, b.by, 80, '#ff0844', 3); Aud.sfx('warn'); } }
    if (b.ph >= 3) { b.zT -= dt; if (b.zT <= 0) { b.zT = 2.2; b.zones.push({ x: clamp(P.x + (R.f() - .5) * 40, V.L + 50, V.R - 50), y: clamp(P.y + (R.f() - .5) * 40, 60, V.VH - 160), r: 62, t: 1.2, d: 1.2 }); } }
    for (let i = b.zones.length - 1; i >= 0; i--) { const z = b.zones[i]; z.t -= dt; if (z.t <= 0 && z.t > -1.6 && dist(P.x, P.y, z.x, z.y) < z.r && P.inv <= 0 && P.dashT <= 0 && G.odT <= 0) hurt('corrupt'); if (z.t <= -1.6) b.zones.splice(i, 1); }
  },
  draw(b) {
    for (const z of b.zones) { // decaying roof
      if (z.t > 0) { cx.globalAlpha = .3 + (1 - z.t / z.d) * .5; cx.strokeStyle = '#c45bff'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); }
      else { cx.globalAlpha = .55 + Math.sin(b.t * 20) * .1; cx.fillStyle = '#2a0838'; cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, TAU); cx.fill(); cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 2; cx.stroke();
        cx.fillStyle = '#ff2bd6'; for (let k = 0; k < 6; k++) { const a = k * 1.7 + b.t, q = (k * 13 % 7) / 7 * z.r * .8; cx.fillRect(z.x + Math.cos(a) * q - 2, z.y + Math.sin(a) * q - 2, 4, 4); } }
      cx.globalAlpha = 1;
    }
    for (const r of b.bars) { // shogun's firewall bars
      if (r.t > 0) { cx.globalAlpha = .25 + (1 - r.t / r.d) * .5; cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.strokeRect(V.L, r.y - r.h / 2, V.AW, r.h); cx.setLineDash(NODASH); }
      else { cx.globalAlpha = Math.max(0, 1 + r.t / .6); cx.fillStyle = 'rgba(255,215,0,.35)'; cx.fillRect(V.L, r.y - r.h / 2, V.AW, r.h); cx.fillStyle = '#ffd700'; for (let x = V.L; x < V.R; x += 18) cx.fillRect(x, r.y - 2, 10, 4); }
      cx.globalAlpha = 1;
    }
    if (b.blink > 0) { cx.globalAlpha = .5; cx.strokeStyle = '#ff0844'; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(b.bx, b.by, b.r + 10, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
    const col = '#c45bff', jit = b.ph >= 3 ? Math.sin(b.t * 40) * 1.5 : 0;
    for (const p of b.parts) { // necks
      cx.strokeStyle = p.alive ? '#3a1050' : 'rgba(58,16,80,.4)'; cx.lineWidth = p.alive ? 10 : 6; cx.beginPath(); cx.moveTo(b.x, b.y); cx.quadraticCurveTo(b.x + p.ox * .5, b.y + p.oy * .2 - 10, p.x, p.y); cx.stroke();
    }
    cx.save(); cx.translate(b.x + jit, b.y); glow(0, 0, b.r * 2.4, col, .45);
    cx.fillStyle = b.fl > .3 ? '#ffffff' : '#160822'; cx.beginPath(); for (let k = 0; k < 14; k++) { const a = k * TAU / 14, rr = b.r * (k % 2 ? .82 : 1.05) + Math.sin(b.t * 4 + k) * 2; k ? cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : cx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } cx.closePath(); cx.fill();
    cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    cx.fillStyle = '#ff2bd6'; for (let k = 0; k < 5; k++) { const a = b.t * 1.5 + k * 1.26; dot(Math.cos(a) * b.r * .5, Math.sin(a) * b.r * .5, 2.5); } // corrupted code motes
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#ff0844'; cx.beginPath(); cx.arc(0, 0, b.r * .26, 0, TAU); cx.fill(); hglow(0, 0, 30, '#ff0844', .6);
    cx.restore();
    for (const p of b.parts) {
      if (!p.alive) { cx.fillStyle = '#2a0838'; dot(p.x, p.y, 8); continue; }
      const wh = p.fl > .3; cx.save(); cx.translate(p.x, p.y);
      if (p.kind === 'hydra') { glow(0, 0, 34, '#ff6a00', .4); cx.rotate(b.sa); cx.fillStyle = wh ? '#fff' : '#2a1206'; poly(0, 0, p.r, 6, 0); cx.fill(); cx.strokeStyle = '#ff6a00'; cx.lineWidth = 2.5; cx.stroke(); cx.fillStyle = '#ff6a00'; cx.fillRect(p.r - 4, -3, 12, 6); cx.fillRect(-p.r - 8, -3, 12, 6); }
      else if (p.kind === 'kage') { glow(0, 0, 34, '#a66bff', .4); cx.fillStyle = wh ? '#fff' : '#0a0610'; cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * 1.1, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#a66bff'; cx.lineWidth = 2.5; cx.stroke(); cx.fillStyle = '#ff0844'; cx.fillRect(-p.r * .6, -2, p.r * 1.2, 4); hglow(0, 0, 18, '#ff0844', .5); }
      else { glow(0, 0, 34, '#ffd700', .4); cx.fillStyle = wh ? '#fff' : '#1a1406'; cx.beginPath(); cx.arc(0, 2, p.r * .85, 0, TAU); cx.fill(); cx.strokeStyle = '#ffd700'; cx.lineWidth = 2.5; cx.stroke();
        cx.fillStyle = '#ffd700'; for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.moveTo(k * 6 - 3, -p.r * .55); cx.lineTo(k * 6, -p.r * .55 - 10 - (k === 0 ? 5 : 0)); cx.lineTo(k * 6 + 3, -p.r * .55); cx.closePath(); cx.fill(); } cx.fillStyle = '#00f2fe'; cx.fillRect(-6, 0, 12, 3); }
      cx.restore();
    }
  }
};
