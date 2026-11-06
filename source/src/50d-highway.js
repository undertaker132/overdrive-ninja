/* =====================================================================
   HIGHWAY CHASE — an arcade mode on a neon motorcycle. The road scrolls
   under you and keeps getting faster; traffic comes down the four lanes.
   Dash THROUGH a car to slice it in half (score, combo, Overdrive);
   touch one without dashing and it hurts. Trucks take two dashes.
   Boost orbs fill Overdrive, and every 1500 m Kurogane sends a pursuer
   (a mini-boss). Score = distance + slices + kills. Everything runs on
   sim time and the seeded R, so runs replay and ghost exactly.
   ===================================================================== */
const HW_LANES = 4;
const Highway = {
  S: 520, dist: 0, scroll: 0, cars: [], orbs: [], spT: 1.2, orbT: 6, nextP: 1500, tier: 0,
  begin() {
    this.S = 520; this.dist = 0; this.scroll = 0; this.cars.length = 0; this.orbs.length = 0; this.spT = 1.4; this.orbT = 6; this.nextP = 1500; this.tier = 0; this.pN = 0;
    G.cine = { k: 'car', t: 0, d: 1.6 }; G.freeze = 1.6; FX.call(lt('NEON CRUISER ENGAGED'), '#00ff88', 3, 24);
  },
  laneX(i) { return V.L + V.AW * (i + .5) / HW_LANES; },
  kmh() { return Math.round(this.S * .32); },
  spawnRow() {
    const free = R.i(HW_LANES), n = 1 + (this.S > 700 && R.f() < .45 ? 1 : 0);
    const lanes = []; for (let i = 0; i < HW_LANES; i++) if (i !== free) lanes.push(i);
    for (let k = 0; k < n && lanes.length; k++) {
      const li = lanes.splice(R.i(lanes.length), 1)[0], truck = R.f() < Math.min(.35, .1 + this.dist / 12000), lw = V.AW / HW_LANES;
      this.cars.push({ x: this.laneX(li), y: truck ? -130 : -70, w: Math.min(lw * .62, truck ? 44 : 38), h: truck ? 108 : 58, sp: 150 + R.f() * 220, hp: truck ? 2 : 1, truck, c: ['#ff2bd6', '#00f2fe', '#ffd23f', '#00ff88', '#ff6a3d'][R.i(5)], fl: 0, hc: 0 });
    }
  },
  update(dt) {
    if (G.freeze > 0 || G.won) return;
    this.S = Math.min(1150, this.S + dt * 9); const S = this.S;
    const d0 = this.dist; this.dist += S * dt / 12; this.scroll += S * dt; if ((d0 / 100 | 0) !== (this.dist / 100 | 0)) bounty('road', Math.floor(this.dist), true);
    G.score += Math.round(S * dt * 2 * G.diff.score * G.scoreMul); // distance
    const t = Math.floor(this.kmh() / 50); if (t > this.tier) { this.tier = t; if (t >= 4) FX.call(ltf('{0} KM/H', t * 50), '#00ff88', 2, 20); }
    this.spT -= dt * (S / 520); if (this.spT <= 0) { this.spT = 1.05 + R.f() * .5; this.spawnRow(); }
    this.orbT -= dt; if (this.orbT <= 0) { this.orbT = 7 + R.f() * 4; this.orbs.push({ x: this.laneX(R.i(HW_LANES)), y: -30, t: 0 }); }
    if (this.dist >= this.nextP && !Boss.cur) { // Kurogane sends a pursuer
      this.nextP += 1500; const tp = MINI_BOSSES[R.i(MINI_BOSSES.length)], e = spawnEnemy(tp, V.CX, -40, 1);
      if (e) { this.pN = (this.pN | 0) + 1; e.spawnT = .6; FX.call(lt('KUROGANE PURSUIT'), '#ff0844', 3, 24); Aud.sfx('warn'); Aud.sfx('roar'); }
    }
    const dashing = P.dashT > 0 || G.odT > 0;
    if (this.cars.length && this.cars[0].y > 120) Tut.check('highway', this.cars[0].x, this.cars[0].y, 46);
    if (!dashing) { // the rider swerves on its own around a car straight ahead (dashes stay yours)
      let th = null, td = 1e9; for (const c of this.cars) { const dy = P.y - c.y; if (dy > 0 && dy < 190 + c.h / 2 && Math.abs(c.x - P.x) < c.w / 2 + P.r + 4 && dy < td) { td = dy; th = c; } }
      if (th) { const lw = V.AW / HW_LANES; let dir = P.x >= th.x ? 1 : -1; if (P.x + dir * lw > V.R - 10 || P.x + dir * lw < V.L + 10) dir = -dir; P.vx += dir * 1500 * dt; th.honk = .4; }
    }
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const c = this.cars[i]; c.y += (S - c.sp) * dt; if (c.fl > 0) c.fl -= dt * 4; if (c.hc > 0) c.hc -= dt; if (c.honk > 0) c.honk -= dt;
      if (c.y - c.h / 2 > V.VH + 40) { this.cars.splice(i, 1); continue; }
      const nx = clamp(P.x, c.x - c.w / 2, c.x + c.w / 2), ny = clamp(P.y, c.y - c.h / 2, c.y + c.h / 2);
      if ((P.x - nx) * (P.x - nx) + (P.y - ny) * (P.y - ny) > P.r * P.r) continue;
      if (dashing && c.hc <= 0) {
        c.hp--; c.hc = .25; c.fl = 1;
        if (c.hp <= 0) { // sliced in half
          this.cars.splice(i, 1); const pts = Math.round((c.truck ? 900 : 400) * G.diff.score * G.scoreMul); G.score += pts; G.combo++; G.ct = 3.4; if (G.combo > G.maxCombo) G.maxCombo = G.combo; addOD(c.truck ? 10 : 6); styleAdd(ST_SLASH, c.truck ? 70 : 40);
          FX.slice({ x: c.x, y: c.y, r: c.w * .55, ang: -Math.PI / 2, type: 0, col: c.c }, P.ang); FX.boom(c.x, c.y, c.truck ? 110 : 70, c.c); FX.text(c.x, c.y - c.h / 2 - 10, '+' + fmtNum(pts), '#ffd700', 14); shake(c.truck ? .5 : .3); Aud.sfx('boom', 1); vibe('kill'); ach('road1');
          G.hwSlices = (G.hwSlices | 0) + 1; if (G.hwSlices >= 50) ach('road50');
        } else { P.vx *= -.4; P.vy *= -.4; FX.spark(c.x, c.y, '#ffffff', 12); FX.text(c.x, c.y - c.h / 2 - 10, lt('DENTED'), '#ffd23f', 12); Aud.sfx('clash'); }
      } else if (!dashing && P.inv <= 0) {
        if (hurt('car')) { this.cars.splice(i, 1); FX.boom(c.x, c.y, 90, '#ff6a3d'); P.vy = 500; }
      }
    }
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i]; o.y += S * dt; o.t += dt;
      if (o.y > V.VH + 30) { this.orbs.splice(i, 1); continue; }
      if (dist(o.x, o.y, P.x, P.y) < P.r + 16) { this.orbs.splice(i, 1); addOD(25); G.score += Math.round(200 * G.diff.score * G.scoreMul); FX.ring(o.x, o.y, 50, '#00ff88', 4); FX.text(o.x, o.y - 20, lt('BOOST'), '#00ff88', 14); Aud.sfx('coin', 3); }
    }
    if (this.dist >= 3000) ach('road3k');
  },
  drawFloor() {
    if (G.mode !== 'highway') return;
    const L = V.L, Wd = V.AW, H = V.VH, off = this.scroll % 64;
    cx.fillStyle = '#0c0d14'; cx.fillRect(L, 0, Wd, H);
    cx.fillStyle = 'rgba(255,255,255,.025)'; for (let y = -64 + (this.scroll * .5 % 64); y < H; y += 64) cx.fillRect(L, y, Wd, 2); // asphalt seams
    cx.fillStyle = 'rgba(232,240,255,.55)'; for (let k = 1; k < HW_LANES; k++) { const x = L + Wd * k / HW_LANES; for (let y = -64 + off; y < H; y += 64) cx.fillRect(x - 1.5, y, 3, 30); }
    cx.fillStyle = '#ffd23f'; cx.fillRect(L + 3, 0, 3, H); cx.fillRect(V.R - 6, 0, 3, H); // edge lines
    for (let y = -90 + (this.scroll % 90); y < H; y += 90) { glow(L - 4, y, 22, '#ff2bd6', .5); glow(V.R + 4, y + 45, 22, '#00f2fe', .5); } // barrier lights streaming past
    if (this.S > 800 && Q.lvl > 0) { cx.strokeStyle = 'rgba(255,255,255,.12)'; cx.lineWidth = 1; cx.beginPath(); for (let k = 0; k < 10; k++) { const x = L + (k * 53.7 % Wd), y = (k * 131 + this.scroll * 1.6) % (H + 120) - 120; cx.moveTo(x, y); cx.lineTo(x, y + 90); } cx.stroke(); }
    for (const o of this.orbs) { const p = 1 + Math.sin(o.t * 8) * .15; glow(o.x, o.y, 40 * p, '#00ff88', .6); cx.fillStyle = '#d8ffe8'; cx.beginPath(); cx.arc(o.x, o.y, 8 * p, 0, TAU); cx.fill(); cx.strokeStyle = '#00ff88'; cx.lineWidth = 2; cx.beginPath(); cx.arc(o.x, o.y, 13 * p, 0, TAU); cx.stroke(); }
    for (const c of this.cars) drawCar(c);
  }
};
function drawCar(c) { // a top-down car or truck driving up the road
  const x = c.x, y = c.y, w = c.w, h = c.h, wh = c.fl > .3;
  glow(x, y + h / 2, w * 1.2, '#ff0844', .35); // tail-light glow
  cx.fillStyle = 'rgba(0,0,0,.4)'; rrect(x - w / 2 + 3, y - h / 2 + 5, w, h, 8); cx.fill();
  if (c.truck) {
    cx.fillStyle = wh ? '#ffffff' : '#1c2030'; rrect(x - w / 2, y - h / 2 + 26, w, h - 26, 4); cx.fill(); cx.strokeStyle = c.c; cx.lineWidth = 2; cx.stroke(); // the trailer
    cx.strokeStyle = 'rgba(255,255,255,.08)'; for (let k = 1; k < 5; k++) { cx.beginPath(); cx.moveTo(x - w / 2 + 4, y - h / 2 + 26 + k * (h - 26) / 5); cx.lineTo(x + w / 2 - 4, y - h / 2 + 26 + k * (h - 26) / 5); cx.stroke(); }
    cx.fillStyle = wh ? '#ffffff' : c.c; rrect(x - w / 2 + 3, y - h / 2, w - 6, 24, 6); cx.fill(); cx.fillStyle = '#0a1a2a'; cx.fillRect(x - w / 2 + 7, y - h / 2 + 4, w - 14, 7);
  } else {
    cx.fillStyle = wh ? '#ffffff' : '#141824'; rrect(x - w / 2, y - h / 2, w, h, 10); cx.fill(); cx.strokeStyle = c.c; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = '#0a1a2a'; rrect(x - w / 2 + 5, y - h / 2 + 10, w - 10, 11, 4); cx.fill(); rrect(x - w / 2 + 6, y + h / 2 - 16, w - 12, 8, 3); cx.fill(); // windows
    cx.fillStyle = 'rgba(0,242,254,.35)'; cx.fillRect(x - w / 2 + 7, y - h / 2 + 11, w - 14, 3);
    cx.fillStyle = c.c; cx.fillRect(x - w / 2 + 2, y - 4, 2, 12); cx.fillRect(x + w / 2 - 4, y - 4, 2, 12); // neon side strips
  }
  cx.fillStyle = '#fff6d0'; cx.fillRect(x - w / 2 + 4, y - h / 2, 6, 3); cx.fillRect(x + w / 2 - 10, y - h / 2, 6, 3); // headlights
  if (c.honk > 0) { cx.globalCompositeOperation = 'lighter'; glow(x, y + h / 2 + 6, 26, '#ff0844', .7); cx.globalCompositeOperation = 'source-over'; } // brake lights flare when you close in
  cx.fillStyle = '#ff2a3a'; cx.fillRect(x - w / 2 + 3, y + h / 2 - 3, 7, 3); cx.fillRect(x + w / 2 - 10, y + h / 2 - 3, 7, 3); // tail-lights
  if (c.hp > 1 || c.fl > 0) { if (c.hp === 1 && c.truck) { cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(x - 8, y + 6); cx.lineTo(x + 2, y + 16); cx.lineTo(x - 4, y + 22); cx.stroke(); } }
}
function drawBike() { // the hero's neon cruiser, under the rider; it leans into sideways motion
  const lean = clamp(P.vx / 1600, -.45, .45), x = P.x, y = P.y + 4;
  cx.save(); cx.translate(x, y); cx.rotate(lean);
  cx.globalCompositeOperation = 'lighter'; glow(0, -40, 46, '#fff6d0', .22); cx.globalCompositeOperation = 'source-over'; // headlight beam
  glow(0, 6, 30, P.ca, .45); // underglow
  cx.fillStyle = '#05060a'; rrect(-4.5, -30, 9, 14, 4); cx.fill(); rrect(-5, 16, 10, 16, 4); cx.fill(); // tyres
  cx.strokeStyle = P.ca; cx.lineWidth = 1.4; cx.beginPath(); cx.ellipse(0, -23, 5.5, 8, 0, 0, TAU); cx.ellipse(0, 24, 6, 9, 0, 0, TAU); cx.stroke(); // neon rims
  cx.fillStyle = '#1a1e2c'; cx.beginPath(); cx.moveTo(-6, -18); cx.lineTo(6, -18); cx.lineTo(9, 6); cx.lineTo(6, 18); cx.lineTo(-6, 18); cx.lineTo(-9, 6); cx.closePath(); cx.fill(); cx.strokeStyle = P.cb; cx.lineWidth = 1.6; cx.stroke(); // tank and frame
  cx.fillStyle = P.ca; cx.fillRect(-1.2, -16, 2.4, 30);
  cx.strokeStyle = '#8a94a8'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(-11, -16); cx.lineTo(11, -16); cx.stroke(); // handlebar
  cx.fillStyle = '#fff6d0'; dot(0, -31, 2.4);
  if (P.dashT > 0 || G.odT > 0) { cx.fillStyle = G.odT > 0 ? '#ffd700' : '#ff9a3d'; cx.beginPath(); cx.moveTo(-4, 32); cx.lineTo(0, 46 + rnd() * 10); cx.lineTo(4, 32); cx.closePath(); cx.fill(); } // exhaust flame
  cx.restore();
}
