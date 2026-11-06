/* =====================================================================
   DRAW — world render with camera (incl. the boss finisher cam), aim
   prediction, blackout mask, canvas HUD (cached strings), cinematic
   cards, tutorial ghost hand. Canvas text follows the UI language.
   ===================================================================== */
function toast(m, c) { G.msg = m; G.msgT = 2.2; G.msgC = c || '#ffd700'; }
function inRun() { const s = G.state; return s === 'PLAY' || s === 'PAUSE' || s === 'PERK' || s === 'OVER' || s === 'CLEAR' || (s === 'DIALOG' && Dlg.inRun); }
function render(rd) {
  const fast = REPLAY.on && REPLAY.fast, run = inRun() && !fast, lb = REPLAY.on && !fast; // lb: a replay letterboxes the recorded arena
  if (lb && !W3D.live) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height); } // (in 3D the world shows around the replay's box)
  cx.setTransform(V.s * V.dpr, 0, 0, V.s * V.dpr, lb ? REPLAY.ox * V.dpr : 0, lb ? REPLAY.oy * V.dpr : 0);
  cx.direction = LANG.rtl ? 'rtl' : 'ltr';
  cx.save();
  let fk = 0;
  if (run) { // finisher cam: after a boss kill the camera eases in on the wreck, then lets go
    fk = CAM.fin > 0 ? Math.sin(clamp(Math.min((CAM.finD - CAM.fin) / .35, CAM.fin / .5), 0, 1) * 1.5708) : 0;
    const z = 1 + CAM.zoom + fk * .2, // (v32: no zoom while aiming, a gentler finisher zoom)
      hw = V.VW / (2 * z), hh = V.VH / (2 * z);
    const fx = clamp(V.VW / 2 + (CAM.fx - V.VW / 2) * fk * .65, hw, V.VW - hw), fy = clamp(V.VH / 2 + (CAM.fy - V.VH / 2) * fk * .65, hh, V.VH - hh);
    if (W3D.live) { const C3 = GL3D.cam; cx.translate(V.VW / 2, V.VH / 2 + W3D.offY()); cx.scale(C3.z, C3.z * W3D.k()); cx.rotate(GL3D.yaw); cx.translate(-C3.x, -C3.y); } else { cx.translate(V.VW / 2, V.VH / 2 + W3D.offY()); cx.scale(z, z * W3D.k()); cx.rotate(CAM.rot); cx.translate(-fx + CAM.ox, -fy + CAM.oy); } // 3D: the 2D layer lies on the tilted roof
  }
  BG.draw(true);
  if (run) {
    Arena.drawFloor(); FX.drawLow();
    if (G.mode === 'dojo') Dojo.drawWorld(); else if (G.mode === 'puzzle') Puzzle.drawBox();
    Ghost.draw();
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; drawEnemy(e); if (e.alive) EAnim.post(e); }
    if (G.nemE && G.nemE.alive && G.nemE.nem) Nemesis.drawTag(G.nemE);
    Boss.draw(); Live.drawGhosts(rd); drawPlayer(); Pet.draw(); Arena.drawTop(); drawBullets(); FX.drawHigh(); drawAim(); // (v32: friends in a live run over the enemies, under you)
    if (Q.glow && !CALM && G.state === 'PLAY' && (P.dashT > 0 || G.odT > 0)) { // reactive light: the blade lights up the roof around you
      const c = G.odT > 0 ? '#ffd700' : (P.fx && P.fx.blade && P.fx.blade !== 'prism' && P.fx.blade !== 'glitch' ? P.fx.blade : P.ca);
      cx.globalCompositeOperation = 'lighter'; glow(P.x, P.y, 230, c, G.odT > 0 ? .16 : .1 + P.dashT * .3); cx.globalCompositeOperation = 'source-over';
    }
    BG.rain(rd * (G.state === 'PLAY' ? G.ts : 1));
    drawDark();
  } else BG.rain(rd);
  cx.restore();
  if (run) {
    if (Q.glow && (In.on && G.state === 'PLAY' || G.odT > 0)) { cx.globalAlpha = G.odT > 0 ? .35 : .55; cx.drawImage(vigSpr(), -20, -20, V.VW + 40, V.VH + 40); cx.globalAlpha = 1; }
    if (In.on && G.state === 'PLAY') { cx.fillStyle = '#001a33'; cx.globalAlpha = .18; cx.fillRect(0, 0, V.VW, V.VH); cx.globalAlpha = 1; }
    if (G.odT > 0) { cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .07 + .03 * Math.sin(CAM.t * 9); cx.fillStyle = '#ffb300'; cx.fillRect(0, 0, V.VW, V.VH); cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1; if (!CALM) drawSpeedLines(); }
    if (G.combo >= 20 && G.state === 'PLAY' && P.hp > 1 && G.odT <= 0 && !CALM) { cx.strokeStyle = G.combo >= 50 ? '#ff2bd6' : P.ca; cx.globalAlpha = .12 + .06 * Math.sin(CAM.t * 5); cx.lineWidth = 10; cx.strokeRect(0, 0, V.VW, V.VH); cx.globalAlpha = 1; } // combo ambilight
    if (P.hp === 1 && G.state === 'PLAY') { cx.strokeStyle = '#ff0844'; cx.globalAlpha = .3 + .25 * Math.sin(CAM.t * 7); cx.lineWidth = 14; cx.strokeRect(0, 0, V.VW, V.VH); cx.globalAlpha = 1; }
    if (fk > .01) { const h = 54 * fk; cx.fillStyle = '#000'; cx.fillRect(0, 0, V.VW, h); cx.fillRect(0, V.VH - h, V.VW, h); }
  }
  if (CAM.flash > .01) { cx.fillStyle = CAM.fc; cx.globalAlpha = Math.min(.8, CAM.flash * .45); cx.fillRect(0, 0, V.VW, V.VH); cx.globalAlpha = 1; }
  const hudOn = !fast && !G.photo && (G.state === 'PLAY' || G.state === 'PAUSE' || G.state === 'PERK');
  if (hudOn) { HUD.draw(rd); FX.drawCall(); if (G.state === 'PLAY') Comms.draw(rd); Tut.draw(); } else if (run) HUD.cine(rd);
  Replays.drawCard();
  drawGlitch();
}
function drawSpeedLines() {
  cx.strokeStyle = '#fff3c4'; cx.globalAlpha = .25; cx.lineWidth = 1.5; cx.beginPath();
  for (let i = 0; i < 14; i++) { const x = (i * 97.3 + CAM.t * 30) % V.VW, y = (i * 211.7 + CAM.t * 1400) % (V.VH + 200) - 100; cx.moveTo(x, y); cx.lineTo(x, y + 60); }
  cx.stroke(); cx.globalAlpha = 1;
}
const LOCK_TXT = []; let LOCK_LANG = '';
function drawAim() {
  if (!In.on || G.state !== 'PLAY' || REPLAY.on) return;
  if (LOCK_LANG !== LANG.id) { LOCK_LANG = LANG.id; for (let i = 0; i < 5; i++) LOCK_TXT[i] = ltf('LOCK {0}', i + 1); }
  const dx = In.cx - In.sx, dy = In.cy - In.sy; if (dx * dx + dy * dy < 130) return;
  if ((P.ch <= 0 && G.odT <= 0) || P.lock > 0) { // no charges: preview the short dodge instead
    const a = Math.atan2(dy, dx), ex = clamp(P.x + Math.cos(a) * 112, V.L + P.r, V.R - P.r), ey = clamp(P.y + Math.sin(a) * 112, P.r, V.VH - P.r);
    cx.globalAlpha = P.dodgeCd > 0 ? .25 : .7; cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(P.x, P.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(NODASH);
    cx.beginPath(); cx.arc(ex, ey, 10, 0, TAU); cx.stroke(); cx.font = '700 9px ' + FONT_M; cx.textAlign = 'center'; cx.fillStyle = '#ffffff'; cx.fillText(lt(P.dodgeCd > 0 ? 'DODGE COOLING' : 'DODGE'), ex, ey - 16); cx.globalAlpha = 1;
    return;
  }
  if (G.mode === 'puzzle' && Puzzle.box) { if (Puzzle.ready()) Puzzle.drawPath(Math.atan2(dy, dx), P.ca, false); return; } // the whole predicted path
  const a = Math.atan2(dy, dx), vx = Math.cos(a), vy = Math.sin(a), len = 300;
  { const rx = P.x + vx * 58, ry = P.y + vy * 58; cx.save(); cx.translate(rx, ry); cx.rotate(a); cx.fillStyle = '#ffd700'; cx.globalAlpha = .85; // a heading arrow right in front of the hero
    cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(-6, -6); cx.lineTo(-3, 0); cx.lineTo(-6, 6); cx.closePath(); cx.fill(); cx.restore(); }
  cx.strokeStyle = P.ca; cx.lineWidth = 3; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(P.x, P.y);
  const tw = vx > .001 ? (V.R - P.r - P.x) / vx : vx < -.001 ? (V.L + P.r - P.x) / vx : 1e9;
  let bx = 0, by = 0, bounced = false;
  if (tw < len) { bx = P.x + vx * tw; by = P.y + vy * tw; cx.lineTo(bx, by); cx.lineTo(bx - vx * (len - tw), by + vy * (len - tw)); bounced = true; }
  else cx.lineTo(P.x + vx * len, P.y + vy * len);
  cx.stroke(); cx.setLineDash(NODASH);
  if (bounced) { glow(bx, by, 22, '#ffd700', .8); cx.fillStyle = '#ffd700'; poly(bx, by, 6, 4, 0); cx.fill(); cx.font = '700 9px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(lt('RICOCHET CRIT'), bx + (bx < V.CX ? 46 : -46), by - 8); }
  for (let k = 0; k < P.nlk; k++) {
    const e = P.lk[k]; if (!e || !e.alive || e.gen !== P.lkg[k]) continue;
    cx.strokeStyle = '#ffd700'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(e.x, e.y, e.r + 10, 0, TAU); cx.stroke();
    cx.fillStyle = '#ffd700'; cx.font = '900 11px ' + FONT_D; cx.textAlign = 'center'; cx.fillText(LOCK_TXT[k], e.x, e.y - e.r - 14);
  }
}
function drawDark() {
  if (!G.dark || G.odT > 0) return;
  const r = 185, x = P.x - r, y = P.y - r, M = W3D.live ? 1800 : 120; // 3D: the tilted view sees more of the world, so the dark has to reach further
  cx.drawImage(darkSpr(), x, y, r * 2, r * 2);
  cx.fillStyle = '#000'; cx.globalAlpha = .96;
  cx.fillRect(-M, -M, V.VW + M * 2, y + M); cx.fillRect(-M, y + r * 2, V.VW + M * 2, V.VH + M); cx.fillRect(-M, y, x + M, r * 2); cx.fillRect(x + r * 2, y, V.VW + M, r * 2);
  cx.globalAlpha = 1;
  for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && dist(e.x, e.y, P.x, P.y) > r * .8) { cx.fillStyle = '#ff0844'; cx.fillRect(e.x - 4, e.y - 1, 3, 2); cx.fillRect(e.x + 1, e.y - 1, 3, 2); } }
}
/* ---------------- HUD MOTION (version 32) ----------------
   Drawing only: nothing here is read by the simulation, and replays look the same.
   · the score rolls up to its new value and pops on a big gain
   · a lost shield shatters, a regained one pops in, the last one beats with your heart
   · a refilled dash charge flashes, the objective line pulses when it moves forward
   · the combo counter punches on every hit and drops away when the chain breaks
   · Overdrive READY shimmers instead of blinking, and the boss bar keeps a yellow
     trail of the damage you just did that drains a moment later */
const HudFx = {
  sd: 0, sc0: 0, sp: 0, hp: -1, shards: [], gain: [], ch: -1, chF: [], ov: 0, obT: 0, cb: 0, cbP: 0, brk: null, bk: null, bTr: 1, bHp: 1, bHold: 0, bFl: 0,
  tick(rd) {
    const s = G.score;
    if (s < this.sd || s - this.sd > 5e6) this.sd = s; // a new run (or a jump far too big to roll): snap
    if (s > this.sc0) this.sp = Math.min(1, this.sp + .22 + Math.min(.5, (s - this.sc0) / 2500));
    this.sc0 = s;
    if (this.sd < s) { this.sd += Math.max(1, (s - this.sd) * Math.min(1, rd * 11)); if (this.sd > s) this.sd = s; }
    this.sp = Math.max(0, this.sp - rd * 3.5);
    const ov = G.objV | 0; if (ov > this.ov) this.obT = 1; this.ov = ov; this.obT = Math.max(0, this.obT - rd * 2.2);
    const cb = G.combo | 0;
    if (cb > this.cb) this.cbP = 1;
    else if (cb < this.cb && this.cb >= 5 && G.state === 'PLAY') this.brk = { t: 0, s: ltf('x{0} COMBO', this.cb) };
    this.cb = cb; this.cbP = Math.max(0, this.cbP - rd * 5);
    if (this.brk) { this.brk.t += rd; if (this.brk.t > .8) this.brk = null; }
    return Math.round(this.sd);
  },
  shields(x0, rd) {
    const hp = P.hp, mx = P.maxHp, calm = CALM;
    if (this.hp >= 0 && hp < this.hp) for (let i = hp; i < this.hp && i < mx; i++) this.shards.push({ x: x0 + 7 + i * 17, y: 68, t: 0, c: this.hp === 2 ? '#00ff88' : i === 0 ? '#ff3b5c' : '#00ff88' });
    if (this.hp >= 0 && hp > this.hp) for (let i = this.hp; i < hp; i++) this.gain.push({ i, t: 0 });
    this.hp = hp;
    const beat = hp === 1 && G.state === 'PLAY' && !calm ? Math.pow(Math.max(0, Math.sin(CAM.t * 7)), 6) : 0;
    for (let i = 0; i < mx; i++) {
      const on = i < hp, x = x0 + 7 + i * 17; let k = 1;
      for (const g of this.gain) if (g.i === i) { const u = Math.min(1, g.t / .35); k = u < .6 ? u / .6 * 1.35 : 1.35 - (u - .6) / .4 * .35; }
      if (on && hp === 1) k *= 1 + beat * .28;
      const col = on ? (hp === 1 ? '#ff3b5c' : '#00ff88') : 'rgba(255,255,255,.12)';
      cx.fillStyle = col; poly(x, 68, 7 * k, 6, 0); cx.fill();
      if (on) glow(x, 68, 12 * k + beat * 6, hp === 1 ? '#ff3b5c' : '#00ff88', .35 + beat * .35);
    }
    for (const g of this.gain) g.t += rd;
    this.gain = this.gain.filter(g => g.t < .35);
    if (!calm) for (const s of this.shards) { // a white flash, a ring and six fragments that fall away
      const u = s.t / .6, a = 1 - u;
      if (u < .25) { cx.globalAlpha = 1 - u * 4; cx.fillStyle = '#ffffff'; poly(s.x, s.y, 8 + u * 8, 6, 0); cx.fill(); }
      cx.globalAlpha = a; cx.strokeStyle = s.c; cx.lineWidth = 2 * a + .5; poly(s.x, s.y, 7 + u * 16, 6, 0); cx.stroke();
      cx.fillStyle = s.c;
      for (let k = 0; k < 6; k++) {
        const b = k * TAU / 6 + .5, d = 4 + u * 20, fx = s.x + Math.cos(b) * d, fy = s.y + Math.sin(b) * d + u * u * 26;
        cx.save(); cx.translate(fx, fy); cx.rotate(b + u * 6); cx.beginPath(); cx.moveTo(3.5, 0); cx.lineTo(-2.5, 2.5); cx.lineTo(-2.5, -2.5); cx.closePath(); cx.fill(); cx.restore();
      }
      cx.globalAlpha = 1;
    }
    for (const s of this.shards) s.t += rd;
    this.shards = this.shards.filter(s => s.t < .6);
  },
  charges(x0, rd) {
    const ch = P.ch | 0;
    if (this.ch >= 0 && ch > this.ch && G.odT <= 0) for (let i = this.ch; i < ch; i++) this.chF.push({ i, t: 0 });
    this.ch = ch;
    if (!CALM) for (const f of this.chF) { const a = 1 - f.t / .3; cx.globalAlpha = a; cx.fillStyle = '#ffffff'; cx.fillRect(x0 + f.i * 19 - a * 2, 80 - a * 2, 15 + a * 4, 5 + a * 4); cx.globalAlpha = 1; }
    for (const f of this.chF) f.t += rd;
    this.chF = this.chF.filter(f => f.t < .3);
  },
  score(txt, x0) {
    const p = CALM ? 0 : this.sp;
    if (p < .02) { cx.fillStyle = '#000'; cx.fillText(txt, x0 + 1.5, 37.5); cx.fillStyle = '#e8fbff'; cx.fillText(txt, x0, 36); return; }
    const k = 1 + p * .2; cx.save(); cx.translate(x0, 36); cx.scale(k, k);
    cx.fillStyle = '#000'; cx.fillText(txt, 1.5, 1.5); cx.fillStyle = p > .45 ? '#fff4c2' : '#e8fbff'; cx.fillText(txt, 0, 0); cx.restore();
  },
  objective(txt, x0) {
    const p = CALM ? 0 : this.obT;
    if (p < .02) { cx.fillStyle = '#ffd700'; cx.fillText(txt, x0, 54); return; }
    const k = 1 + p * .12; cx.save(); cx.translate(x0, 54); cx.scale(k, k); cx.fillStyle = p > .5 ? '#ffffff' : '#ffd700'; cx.fillText(txt, 0, 0); cx.restore();
  },
  combo(txt, xr) {
    const p = CALM ? 0 : this.cbP;
    if (p < .02) { cx.fillText(txt, xr, 122); return; }
    const k = 1 + p * .3; cx.save(); cx.translate(xr, 122); cx.scale(k, k); cx.fillText(txt, 0, 0); cx.restore();
  },
  comboBreak(xr) {
    const b = this.brk; if (!b || CALM) return; const u = b.t / .8;
    cx.save(); cx.textAlign = 'right'; cx.font = '700 13px ' + FONT_D; cx.globalAlpha = 1 - u; cx.translate(xr + u * 10, 122 + u * u * 40); cx.rotate(u * .25);
    cx.fillStyle = '#ff3b5c'; cx.fillText(b.s, 0, 0); const w = cx.measureText(b.s).width; cx.fillRect(-w - 2, -5, w + 4, 2); cx.restore();
  },
  odShine(x, y, w, h) { // a soft light sweeping across the full Overdrive bar
    if (CALM) return; const u = (CAM.t * .9) % 1.4 - .2, sx = x + u * w;
    cx.save(); cx.beginPath(); cx.rect(x, y, w, h); cx.clip(); cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.moveTo(sx - 6, y + h); cx.lineTo(sx + 4, y); cx.lineTo(sx + 14, y); cx.lineTo(sx + 4, y + h); cx.closePath(); cx.fill(); cx.restore();
    glow(x + w, y + h / 2, 12 + Math.sin(CAM.t * 6) * 3, '#ffd700', .45);
  },
  boss(B, fr, rd) { // returns where the yellow damage trail ends
    if (B !== this.bk) { this.bk = B; this.bTr = this.bHp = fr; this.bHold = 0; this.bFl = 0; }
    if (fr < this.bHp - 1e-4) { this.bHold = .5; this.bFl = 1; }
    if (fr > this.bTr) this.bTr = fr;
    this.bHp = fr;
    if (this.bHold > 0) this.bHold -= rd; else this.bTr = Math.max(fr, this.bTr - rd * .5);
    this.bFl = Math.max(0, this.bFl - rd * 7);
    return this.bTr;
  }
};
/* ---------------- HUD ---------------- */
const HUD = {
  c: { sc: -1, scs: '0', ob: '', obk: '', cr: -1, crs: '' },
  objText() {
    const o = G.obj;
    if (G.mode === 'dojo') return lt('TRAINING DOJO');
    if (G.mode === 'custom') return ltf('WAVE {0}/{1}', Math.max(1, Custom.wi), Custom.waves());
    if (G.mode === 'tower') return ltf('FLOOR {0} · {1}/{2}', Tower.floor, Math.min(Tower.kills, Tower.need), Tower.need) + (Tower.curse ? ' · ' + lt(Tower.curse.name) : '') + (Tower.curse2 ? ' + ' + lt(Tower.curse2.name) : '');
    if (G.mode === 'highway') return ltf('{0} M · {1} KM/H', fmtNum(Math.floor(Highway.dist)), Highway.kmh());
    if (G.mode === 'puzzle') return Puzzle.def ? ltf('MOVES {0}/{1} · PAR {2}', Puzzle.moves, Puzzle.max, Puzzle.def.par) : '';
    if (G.mode === 'story') {
      if (o.t === 'kill') return ltf('DESTROY {0}/{1}', Math.min(G.objV, o.n), o.n);
      if (o.t === 'survive') return ltf('SURVIVE {0}', fmtTime(o.s - G.time));
      if (o.t === 'defend') return ltf('DEFEND UPLINK {0}', fmtTime(o.s - G.time));
      if (o.t === 'hack') return ltf('TERMINALS {0}/{1}', G.objV, o.n);
      if (o.t === 'nodes') return ltf('NODES {0}/{1}', G.objV, o.n);
      if (o.t === 'courier') return ltf('CATCH COURIER {0}', fmtTime(o.s - G.time));
      if (o.t === 'collect') return ltf('SHARDS {0}/{1}', Math.min(G.objV, o.n), o.n);
      if (o.t === 'escort') return ltf('ESCORT THE DRONE {0}', fmtTime(o.s - G.time));
      if (o.t === 'reflect') return ltf('REFLECT KILLS {0}/{1}', Math.min(G.objV, o.n), o.n);
      if (o.t === 'gauntlet') return ltf('GATE {0}/{1}', Math.min(G.objV + 1, o.list.length), o.list.length);
      if (o.t === 'combo') return ltf('COMBO x{0} / x{1}', G.objV, o.n);
      if (o.chain) return ltf('BOSS {0}/{1}', Math.min(G.chainN + 1, o.chain.length), o.chain.length);
      return lt('DEFEAT THE BOSS');
    }
    if (G.mode === 'bossrush') return ltf('BOSS {0} · {1} ELAPSED', G.bossIdx + 1, fmtTime(G.time));
    if (G.mode === 'arena') { const mu = BossArena.hud(); return ltf('BOSS {0}', G.bossIdx + 1) + (mu ? ' · ' + mu : ''); }
    if (G.mode === 'raid') return lt('BOSS RAID') + ' · ' + fmtTime(G.time);
    if (G.mode === 'timeattack' || G.mode === 'race') return ltf('TIME {0}', fmtTime(G.limit - G.time));
    if (Boss.cur || Director.bossPending) return ltf('CAR {0} · BOSS', G.seqCar);
    const tg = ROUTES[G.carKind] && ROUTES[G.carKind].tag; return ltf('CAR {0} · {1}/{2}', G.seqCar, G.carKills, G.carNeed) + (tg ? ' · ' + lt(tg) : '');
  },
  draw(rd) {
    const c = this.c, wide = V.L0 > 280, x0 = wide ? V.L0 - 270 : 12 + V.insL; this.hx = x0 + 62; // (the heat tip points here)
    const xr = wide ? V.R0 + 150 : V.VW - 12 - V.insR; this.xr = xr;
    const sv = HudFx.tick(rd); if (sv !== c.sc) { c.sc = sv; c.scs = fmtNum(sv); }
    cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    cx.font = '700 26px ' + FONT_D; HudFx.score(c.scs, x0);
    const obk = G.objV * 1e4 + Math.ceil(G.time) + G.carKills * 1e3 + G.seqCar * 1e7 + (Boss.cur || Director.bossPending ? 5e8 : 0) + G.bossIdx * 1e9 + (G.chainN | 0) * 7e9;
    if (obk !== c.obk) { c.obk = obk; c.ob = this.objText(); }
    cx.font = '700 12px ' + FONT_M; HudFx.objective(c.ob, x0);
    if (G.mode === 'puzzle') { this.edges(); return; } // a puzzle only needs its move counter
    // shields
    HudFx.shields(x0, rd);
    // dash charges
    for (let i = 0; i < P.maxCh; i++) { cx.fillStyle = i < P.ch || G.odT > 0 ? P.ca : 'rgba(255,255,255,.14)'; cx.fillRect(x0 + i * 19, 80, 15, 5); }
    HudFx.charges(x0, rd);
    if (P.ch < P.maxCh && G.odT <= 0) { cx.fillStyle = P.ca; cx.globalAlpha = .45; cx.fillRect(x0 + P.ch * 19, 80, 15 * (1 - P.rt / P.rc), 5); cx.globalAlpha = 1; }
    if (P.ch <= 0 && G.odT <= 0 && (!HUDC() || CleanHud.runsDone() < 6)) { cx.font = '700 9px ' + FONT_M; cx.fillStyle = P.dodgeCd > 0 ? '#5d6a8c' : '#ffffff'; cx.fillText(lt(P.dodgeCd > 0 ? 'DODGE COOLING' : 'SWIPE = DODGE'), x0 + P.maxCh * 19 + 4, 86); }
    // heat + overdrive
    const hw = 124, hot = P.heat >= 75;
    cx.fillStyle = 'rgba(255,255,255,.1)'; cx.fillRect(x0, 90, hw, 5);
    cx.fillStyle = P.lock > 0 ? '#ff3b3b' : hot ? '#ff6a00' : '#7df9ff'; cx.fillRect(x0, 90, hw * Math.min(1, P.heat / 100), 5);
    cx.font = '700 9px ' + FONT_M; cx.fillStyle = P.lock > 0 ? '#ff3b3b' : hot ? '#ff9a00' : '#8fa4c8';
    if (!HUDC() || P.lock > 0 || hot) cx.fillText(lt(P.lock > 0 ? 'OVERHEATED' : hot ? 'BLADE HOT +25% DMG' : 'HEAT'), x0 + hw + 6, 96);
    if (P.has.od) {
      cx.fillStyle = 'rgba(255,255,255,.1)'; cx.fillRect(x0, 100, hw, 6);
      const full = G.od >= 100 || G.odT > 0;
      cx.fillStyle = full && CALM ? (((CAM.t * 6) | 0) % 2 ? '#ffd700' : '#ff2bd6') : '#ffd700'; cx.fillRect(x0, 100, hw * (G.odT > 0 ? G.odT / 5 : G.od / 100), 6);
      if (full && G.odT <= 0) HudFx.odShine(x0, 100, hw, 6);
      cx.fillStyle = full ? '#ffd700' : '#8fa4c8'; if (!HUDC() || full) cx.fillText(lt(G.odT > 0 ? 'OVERDRIVE ACTIVE' : full ? 'OVERDRIVE READY' : 'OVERDRIVE'), x0 + hw + 6, 107);
    }
    // combo + rank (top right, below the pause button)
    cx.textAlign = 'right';
    if (G.styleRk >= 1 || G.combo >= 3) {
      const rk = G.styleRk, R0 = RANKS[rk], s = 1 + Math.max(0, G.rankPop) * .5;
      cx.save(); cx.translate(xr, 104); cx.scale(s, s); cx.font = 'italic 700 46px ' + FONT_D; cx.fillStyle = '#000'; cx.fillText(R0.r, 2, 2); cx.fillStyle = R0.c; cx.fillText(R0.r, 0, 0); cx.restore();
      if (c.cb !== G.combo) { c.cb = G.combo; c.cbs = ltf('x{0} COMBO', G.combo); }
      cx.font = '700 13px ' + FONT_D; cx.fillStyle = '#ffffff'; HudFx.combo(c.cbs, xr);
      cx.fillStyle = 'rgba(255,255,255,.15)'; cx.fillRect(xr - 80, 127, 80, 3); cx.fillStyle = R0.c; cx.fillRect(xr - 80, 127, 80 * clamp(G.ct / 3.4, 0, 1), 3);
      const lo = STYLE_RK[rk], hi = rk < 6 ? STYLE_RK[rk + 1] : 1000, sp = clamp((G.style - lo) / (hi - lo), 0, 1);
      cx.fillStyle = 'rgba(255,255,255,.1)'; cx.fillRect(xr - 80, 132, 80, 2); cx.fillStyle = rk < 6 ? RANKS[rk + 1].c : R0.c; cx.fillRect(xr - 80, 132, 80 * sp, 2);
    }
    HudFx.comboBreak(xr); cx.textAlign = 'right';
    if (G.runCredits !== c.cr) { c.cr = G.runCredits; c.crs = ltf('+{0} CR', fmtNum(G.runCredits)); }
    if (!HUDC()) { cx.font = '700 11px ' + FONT_M; cx.fillStyle = '#ffd700'; cx.fillText(c.crs, xr, 144); }
    if (G.ev) { const ek = Math.ceil(G.evT) + G.ev; if (ek !== c.evk) { c.evk = ek; c.evs = ltf(G.ev === 'blackout' ? 'BLACKOUT x2 {0}' : G.ev === 'surge' ? 'DATA SURGE {0}' : 'EMP STORM {0}', fmtTime(G.evT)); } cx.fillStyle = G.ev === 'surge' ? '#00ff88' : '#7df9ff'; cx.fillText(c.evs, xr, 158); }
    // boss bar
    const B = Boss.cur;
    if (B && B.enter >= 1) {
      const y = V.VH - UI.dockH / V.s - 26, w = wide ? V.AW : V.VW - 24 - V.insL - V.insR, bx = wide ? V.L0 : x0;
      cx.textAlign = 'center'; cx.font = '700 12px ' + FONT_D; cx.fillStyle = B.info.col; if (c.bk !== B.ph + B.info.name + LANG.id) { c.bk = B.ph + B.info.name + LANG.id; c.bs = lt(B.info.name) + (B.ph > 1 ? '  // ' + ltf('PHASE {0}', B.ph) : ''); } cx.fillText(c.bs, V.CX, y - 6);
      const bfr = Math.max(0, B.hp / B.mhp), btr = HudFx.boss(B, bfr, rd);
      cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(bx, y, w, 8);
      if (btr > bfr && !CALM) { cx.fillStyle = '#ffd23f'; cx.fillRect(bx + w * bfr, y, w * (btr - bfr), 8); }
      cx.fillStyle = '#ff0844'; cx.fillRect(bx, y, w * bfr, 8);
      if (HudFx.bFl > 0 && !CALM) { cx.globalAlpha = HudFx.bFl * .6; cx.fillStyle = '#ffffff'; cx.fillRect(bx, y, w * bfr, 8); cx.globalAlpha = 1; }
      cx.strokeStyle = B.info.col; cx.lineWidth = 1; cx.strokeRect(bx + .5, y + .5, w - 1, 7);
    }
    // challenge target
    const ch = Store.data.chal;
    if (ch && ch.m === G.mode) {
      if (c.chO !== ch || c.chD !== G.chalDone) { c.chO = ch; c.chD = G.chalDone; c.chs = ltf(G.chalDone ? 'BEAT {0} {1}' : 'VS {0} {1}', ch.n.toUpperCase(), fmtNum(ch.s)); }
      cx.textAlign = 'left'; cx.font = '700 11px ' + FONT_M; cx.fillStyle = G.chalDone ? '#00ff88' : '#ff4fd8'; cx.fillText(c.chs, x0, 122);
    }
    Ghost.hud(x0); Live.hud(x0);
    if (Flow.sr) { // speedrun clock + the split you are chasing
      const now = Flow.srNow(), pb = Store.data.speed.splits[Flow.sr.i], k = (now / 100) | 0;
      if (c.srk !== k) { c.srk = k; c.srs = lt('SPEEDRUN') + ' ' + fmtMs(now); c.srp = pb ? ltf('PB SPLIT {0}', fmtMs(pb)) : ''; }
      cx.textAlign = 'left'; cx.font = '700 13px ' + FONT_M; cx.fillStyle = pb && now > pb ? '#ff3b5c' : '#00f2fe'; cx.fillText(c.srs, x0, 124);
      if (c.srp) { cx.font = '700 10px ' + FONT_M; cx.fillStyle = '#8fa4c8'; cx.fillText(c.srp, x0, 138); }
    }
    if (Store.data.settings.fps) { // device check: live frame rate + quality level
      const fk = Math.round(Q.fps) * 10 + Q.lvl; if (c.fk !== fk) { c.fk = fk; c.fs = Math.round(Q.fps) + ' FPS · Q' + Q.lvl; }
      cx.textAlign = 'left'; cx.font = '700 10px ' + FONT_M; cx.fillStyle = Q.fps < 47 ? '#ff3b5c' : Q.fps < 57 ? '#ffd700' : '#00ff88'; cx.fillText(c.fs, x0, 150);
    }
    if (G.mode === 'dojo') Dojo.drawHud();
    this.edges();
    // toast
    if (G.msgT > 0) {
      const a = Math.min(1, G.msgT * 3, (2.2 - G.msgT) * 6); cx.globalAlpha = a; cx.font = '700 14px ' + FONT_D; cx.textAlign = 'center';
      const tw = cx.measureText(G.msg).width + 28, y = 214;
      cx.fillStyle = 'rgba(6,8,20,.85)'; cx.fillRect(V.CX - tw / 2, y - 18, tw, 28); cx.strokeStyle = G.msgC; cx.lineWidth = 1.5; cx.strokeRect(V.CX - tw / 2 + .5, y - 17.5, tw - 1, 27);
      cx.fillStyle = G.msgC; cx.fillText(G.msg, V.CX, y + 1); cx.globalAlpha = 1;
    }
    // hint
    if (G.hintT > 0) {
      const a = Math.min(1, G.hintT * 2); cx.globalAlpha = a; cx.font = '700 11px ' + FONT_M; cx.textAlign = 'center';
      const tw = Math.min(V.VW - 20, cx.measureText(G.hint).width + 20), y = V.VH - UI.dockH / V.s - (Boss.cur ? 70 : 30);
      cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(V.CX - tw / 2, y - 14, tw, 22); cx.fillStyle = '#e8fbff'; cx.fillText(G.hint, V.CX, y + 1); cx.globalAlpha = 1;
    }
    this.tutorial();
    this.cine(rd);
    cx.textAlign = 'left';
  },
  edges() { // chevrons for enemies above the screen or hidden behind the skill dock
    const bot = V.VH - UI.dockH / V.s - 8;
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i]; if (!e.alive || e.al > 0 || e.type === ET.TREASURE) continue;
      const up = e.y < 2; if (!up && e.y < bot) continue;
      const x = clamp(e.x, V.L + 9, V.R - 9), y = up ? 9 : bot - 2, k = up ? 1 : -1;
      cx.globalAlpha = e.type === ET.BOMBER ? .55 + .45 * Math.sin(CAM.t * 14) : .85; cx.fillStyle = e.col;
      cx.beginPath(); cx.moveTo(x, y - 6 * k); cx.lineTo(x + 8, y + 4 * k); cx.lineTo(x - 8, y + 4 * k); cx.closePath(); cx.fill();
      cx.strokeStyle = '#05060f'; cx.lineWidth = 1.5; cx.stroke();
    }
    cx.globalAlpha = 1;
  },
  tutorial() {
    const s = G.stage; if (G.mode !== 'story' || !s || s.tut !== 'aim' || G.kills >= 2 || In.on || G.freeze > 0 || G.state !== 'PLAY') return;
    const t = (CAM.t % 2) / 2, k = t < .2 ? 0 : Math.min(1, (t - .2) / .5);
    const x0 = V.CX + 10, y0 = V.VH * .78, x1 = x0 + 90 * k, y1 = y0 - 120 * k;
    cx.globalAlpha = t > .85 ? (1 - t) / .15 : 1;
    cx.strokeStyle = 'rgba(255,255,255,.5)'; cx.lineWidth = 3; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke(); cx.setLineDash(NODASH);
    cx.fillStyle = 'rgba(255,255,255,.85)'; cx.beginPath(); cx.arc(x1, y1, 14, 0, TAU); cx.fill(); glow(x1, y1, 30, '#ffffff', .5);
    cx.globalAlpha = 1; cx.font = '700 13px ' + FONT_D; cx.textAlign = 'center'; cx.fillStyle = '#ffffff';
    cx.fillText(lt('DRAG ANYWHERE TO AIM'), V.CX, y0 + 44); cx.fillStyle = '#ffd700'; cx.fillText(lt('RELEASE TO SLASH'), V.CX, y0 + 62);
  },
  cine(rd) {
    const c = G.cine; if (!c) return;
    if (G.state !== 'PLAY') c.t += rd;
    if (c.t > c.d) { G.cine = null; return; }
    const ein = Math.min(1, c.t * 4), eout = Math.min(1, (c.d - c.t) * 4), a = Math.min(ein, eout);
    const bar = 64 * a;
    cx.fillStyle = '#000'; cx.fillRect(0, 0, V.VW, bar); cx.fillRect(0, V.VH - bar, V.VW, bar);
    cx.textAlign = 'center'; cx.globalAlpha = a;
    if (c.k === 'boss') {
      const info = BOSS_INFO[c.id], y = V.VH * .42;
      cx.save(); cx.beginPath(); cx.rect(0, y - 30, V.VW, 60); cx.clip();
      cx.fillStyle = '#ffd700'; cx.fillRect(0, y - 30, V.VW, 60); cx.fillStyle = '#111';
      for (let x = -80 + (CAM.t * 120) % 40; x < V.VW + 40; x += 40) { cx.beginPath(); cx.moveTo(x, y - 30); cx.lineTo(x + 20, y - 30); cx.lineTo(x - 10, y + 30); cx.lineTo(x - 30, y + 30); cx.closePath(); cx.fill(); }
      cx.restore();
      cx.font = '700 40px ' + FONT_D; cx.fillStyle = ((CAM.t * 6) | 0) % 2 ? '#ff0844' : '#ffffff'; cx.fillText(lt('WARNING'), V.CX, y + 14);
      cx.font = '700 30px ' + FONT_D; cx.fillStyle = info.col; cx.fillText(lt(info.name), V.CX, y + 76);
      cx.font = '700 12px ' + FONT_M; cx.fillStyle = '#e8fbff'; cx.fillText(lt(info.sub), V.CX, y + 98);
    } else if (c.k === 'stage') {
      const y = V.VH * .4, slide = (1 - ein) * 60;
      if (!c.l1) {
        if (G.mode === 'story') { const s = G.stage, ch = CHAPTERS[s.ch]; c.l1 = ltf('CHAPTER {0} // {1}', ch.n, lt(ch.name)) + (G.ngp ? '  ·  NG+' : ''); c.l2 = s.id + '  ' + lt(s.name); c.l3 = stageObjLine(s); }
        else if (G.mode === 'puzzle') { c.l1 = lt('PUZZLE') + ' // ' + Puzzles.label(Puzzle.id); c.l2 = Puzzles.name(Puzzle.id); c.l3 = ltf('CLEAR THE ROOF IN {0} DASHES', Puzzle.def.par); }
        else {
          const m = MODES.find(q => q.id === G.mode); c.l1 = G.mode === 'dojo' ? lt('PRACTICE // NO DAMAGE') : (G.mode === 'race' || G.mode === 'raid') ? ltf('LIVE // ROOM {0}', Live.code) : ltf('ARCADE // {0}', lt(G.diff.name)); c.l2 = lt(m.name);
          c.l3 = G.mode === 'daily' ? G.dailyMods.map(q => lt(q.name)).join(' + ') : G.mode === 'weekly' && G.rule ? lt(G.rule.name) : lt(m.desc).split('.')[0].toUpperCase();
        }
        if (G.mode === 'story') c.l4 = '★★★  ' + lt(G.stage.star.d).toUpperCase();
      }
      const l1 = c.l1, l2 = c.l2, l3 = c.l3;
      cx.font = '700 12px ' + FONT_M; cx.fillStyle = '#00f2fe'; cx.fillText(l1, V.CX + slide, y - 34);
      cx.font = '700 34px ' + FONT_D; cx.fillStyle = '#000'; cx.fillText(l2, V.CX - slide + 2, y + 2); cx.fillStyle = '#ffffff'; cx.fillText(l2, V.CX - slide, y);
      cx.fillStyle = '#ff0844'; cx.fillRect(V.CX - 80 * a, y + 12, 160 * a, 3);
      cx.font = '700 13px ' + FONT_D; cx.fillStyle = '#ffd700'; cx.fillText(l3, V.CX + slide, y + 38);
      if (c.l4) { cx.font = '700 11px ' + FONT_M; cx.fillStyle = '#8fa4c8'; cx.fillText(c.l4, V.CX, y + 60); }
    } else if (c.k === 'car') {
      const y = V.VH * .4;
      cx.font = '700 12px ' + FONT_M; cx.fillStyle = '#00f2fe'; cx.fillText(lt(BG.T.name), V.CX, y - 30);
      cx.font = '700 36px ' + FONT_D; cx.fillStyle = '#ffffff';
      if (!c.l2) c.l2 = G.mode === 'bossrush' || G.mode === 'arena' || G.mode === 'raid' ? ltf('BOSS {0}', G.bossIdx + 1) : ltf(Director.bossPending ? 'BOSS CAR {0}' : 'CAR {0}', G.seqCar);
      cx.fillText(c.l2, V.CX, y + 4);
      if (c.l3) { cx.font = '700 13px ' + FONT_D; cx.fillStyle = '#ff9a3d'; cx.fillText(c.l3, V.CX, y + 34); }
    } else if (c.k === 'clear') {
      const y = V.VH * .42, s = 1 + Math.max(0, 1 - c.t * 3) * 1.5;
      cx.save(); cx.translate(V.CX, y); cx.scale(s, s); cx.font = '700 42px ' + FONT_D; cx.fillStyle = '#000'; cx.fillText(c.txt, 2, 2); cx.fillStyle = c.col; cx.fillText(c.txt, 0, 0); cx.restore();
    }
    cx.globalAlpha = 1;
  }
};
function stageObjLine(s) {
  const o = s.obj;
  if (o.t === 'kill') return ltf('DESTROY {0} ENEMIES', o.n);
  if (o.t === 'survive') return ltf('SURVIVE {0} SECONDS', o.s);
  if (o.t === 'boss' && o.chain) return ltf('DEFEAT {0} BOSSES IN A ROW', o.chain.length);
  if (o.t === 'boss') return ltf('DEFEAT {0}', lt(BOSS_INFO[o.b].name));
  if (o.t === 'collect') return ltf('COLLECT {0} DATA SHARDS', o.n);
  if (o.t === 'escort') return ltf('ESCORT THE CARGO DRONE FOR {0}s', o.s);
  if (o.t === 'reflect') return ltf('DESTROY {0} ENEMIES WITH REFLECTED SHOTS', o.n);
  if (o.t === 'gauntlet') return lt('DEFEAT THE THREE GATE GUARDIANS');
  if (o.t === 'combo') return ltf('REACH A x{0} COMBO', o.n);
  if (o.t === 'hack') return ltf('HACK {0} TERMINALS', o.n);
  if (o.t === 'defend') return ltf('PROTECT THE UPLINK FOR {0}s', o.s);
  if (o.t === 'courier') return ltf('DESTROY THE COURIER IN {0}s', o.s);
  if (o.t === 'nodes') return ltf('DESTROY {0} FIREWALL NODES', o.n);
  return '';
}
