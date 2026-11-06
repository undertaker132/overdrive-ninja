/* =====================================================================
   ARENA — hackable roof turrets, teleport gates, fuel barrels, data
   terminals, uplink, firewall nodes, express trains, EMP storm strikes,
   credits (magnet) and pickups
   ===================================================================== */
const Arena = {
  turrets: [], portals: [], barrels: [], terms: [], nodes: [], storm: [], uplink: null, lanes: 0, pend: [], mines: [],
  setup(tr, obj) {
    tr = tr || {}; const L = V.L0, RX = V.R0, H = V.VH, C = V.CX;
    this.turrets = []; this.portals = []; this.barrels = []; this.terms = []; this.nodes = []; this.storm = []; this.uplink = null; this.pend.length = 0; this.mines.length = 0;
    const tp = [[L + 70, H * .42], [RX - 70, H * .58]];
    for (let i = 0; i < (tr.turrets | 0) && i < 2; i++) this.turrets.push({ x: tp[i][0], y: tp[i][1], r: 20, hacked: false, ang: 0, cd: 2 + i, hid: -1 });
    if (tr.portals) this.portals.push({ x: L + 34, y: H * .3, r: 22, c: '#00f2fe', cd: 0 }, { x: RX - 34, y: H * .7, r: 22, c: '#b537f2', cd: 0 });
    if (tr.barrels) [[C - 80, H * .34], [C + 90, H * .64], [C + 10, H * .5]].forEach(q => this.barrels.push({ x: q[0], y: q[1], r: 16, alive: true }));
    if (obj && obj.t === 'hack') [[C - 92, H * .3], [C + 92, H * .46], [C - 40, H * .72]].forEach(q => this.terms.push({ x: q[0], y: q[1], r: 24, zr: 46, p: 0, done: false, on: 0, tick: 0, fl: 0 }));
    if (obj && obj.t === 'defend') this.uplink = { x: C, y: H * .56, r: 30, hp: obj.hp, mhp: obj.hp, fl: 0 };
    if (obj && obj.t === 'escort') this.uplink = { x: C, y: H * .5, r: 28, hp: obj.hp, mhp: obj.hp, fl: 0, esc: 1 };
    if (obj && obj.t === 'nodes') [[L + 64, H * .26], [RX - 64, H * .42], [C, H * .7]].forEach(q => this.nodes.push({ x: q[0], y: q[1], r: 26, hp: 24 * G.diff.ehp, mhp: 24 * G.diff.ehp, alive: true, cd: 2 + R.f(), hid: -1, fl: 0, bub: 1, bt: 7 }));
    this.lanes = tr.train | 0;
    G.train[0].y = G.train[1].y = -9999; G.train[0].warn = G.train[1].warn = 0; G.train[0].t = 9; G.train[1].t = 15;
  },
  blast(x, y, r, hostile) {
    for (const b of this.barrels) if (b.alive && dist(b.x, b.y, x, y) < r + b.r) { b.alive = false; this.barrelBoom(b); }
    for (const m of this.mines) if (m.fuse <= 0 && dist(m.x, m.y, x, y) < r + 14) m.fuse = .12; // blasts set off nearby mines
    if (hostile && this.uplink && dist(this.uplink.x, this.uplink.y, x, y) < r + this.uplink.r) { this.uplink.hp -= 3; this.uplink.fl = 1; FX.text(this.uplink.x, this.uplink.y - 40, lt('UPLINK HIT -3'), '#ff3b3b', 15); }
  },
  layMine(x, y, owner) { // proximity mine (miner, spider tank): arms after a moment, expires after 14 s
    if (this.mines.length >= 12) this.mines.shift();
    this.mines.push({ x, y, arm: .9, t: 14, fuse: 0, o: owner, seen: 0 });
    FX.ring(x, y, 24, '#ffb000', 2); Aud.sfx('lock', 0);
  },
  mineBoom(m) {
    FX.boom(m.x, m.y, 70, '#ffb000'); Aud.sfx('boom', 0); shake(.2);
    if (dist(P.x, P.y, m.x, m.y) < 70 + P.r * .5) hurt('mine', m.o);
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && !e.mb && dist(e.x, e.y, m.x, m.y) < 70 + e.r) damageEnemy(e, 2, Math.atan2(e.y - m.y, e.x - m.x), 2); }
    this.blast(m.x, m.y, 70, true);
  },
  barrelBoom(b) { this.pend.push({ x: b.x, y: b.y, t: .06 }); }, // chain blast a moment later (sim clock, so replays match)
  tickPend(rd) { for (let i = this.pend.length - 1; i >= 0; i--) { const q = this.pend[i]; q.t -= rd; if (q.t <= 0) { this.pend.splice(i, 1); if (G.state === 'PLAY') friendlyBlast(q.x, q.y, 150, 2); } } },
  update(dt, dashing) {
    // turrets
    G.shooter = 30;
    for (const t of this.turrets) {
      if (!t.hacked && dashing && dist(P.x, P.y, t.x, t.y) < P.r + t.r + 12) {
        t.hacked = true; t.cd = .4; ach('turret'); Aud.sfx('hack', 3); FX.spark(t.x, t.y, '#00ff88', 16); FX.call(lt('TURRET HACKED'), '#00ff88', 1);
      }
      t.cd -= dt;
      if (t.hacked) {
        const e = nearestEnemy(t.x, t.y, 700, true), bx = Boss.cur;
        if (e || bx) { const tx = e ? e.x : bx.x, ty = e ? e.y : bx.y; t.ang = Math.atan2(ty - t.y, tx - t.x); if (t.cd <= 0) { t.cd = .7; shard(t.x, t.y, t.ang, 520, '#00ff88', 1); } }
      } else {
        t.ang = Math.atan2(P.y - t.y, P.x - t.x);
        if (t.cd <= 0) { t.cd = 2.4 / G.diff.fire; shoot(t.x, t.y, t.ang, 320, 0); }
      }
    }
    // portals
    for (let i = 0; i < this.portals.length; i++) {
      const p = this.portals[i]; if (p.cd > 0) p.cd -= dt;
      if (p.cd <= 0 && dist(P.x, P.y, p.x, p.y) < P.r + p.r) {
        const o = this.portals[1 - i]; p.cd = o.cd = 1; P.x = o.x; P.y = o.y; P.vx *= 1.25; P.vy *= 1.25; P.dashT = Math.max(P.dashT, .18);
        Aud.sfx('warp'); FX.ring(o.x, o.y, 70, o.c, 4); FX.spark(o.x, o.y, o.c, 10);
      }
    }
    // barrels
    for (const b of this.barrels) if (b.alive && dashing && dist(P.x, P.y, b.x, b.y) < P.r + b.r + 8) { b.alive = false; friendlyBlast(b.x, b.y, 150, 2); }
    // proximity mines: walk near one and it blows; dash straight through it to disarm it
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i]; if (m.arm > 0) m.arm -= dt; m.t -= dt;
      if (m.fuse > 0) { m.fuse -= dt; if (m.fuse <= 0) { this.mines.splice(i, 1); this.mineBoom(m); if (G.state !== 'PLAY') return; } continue; }
      if (m.t <= 0) { this.mines.splice(i, 1); FX.spark(m.x, m.y, '#ffb000', 6); continue; }
      if (m.arm > 0) continue;
      if (!m.seen) { m.seen = 1; if (m.y > 60 && m.y < V.VH - G.dockL - 50) Tut.check('mine', m.x, m.y, 44); }
      const d = dist(P.x, P.y, m.x, m.y);
      if (dashing && d < P.r + 24) {
        this.mines.splice(i, 1); G.score += Math.round(150 * G.diff.score * G.scoreMul); styleAdd(ST_HACK, 20);
        FX.text(m.x, m.y - 18, lt('DISARMED'), '#ffb000', 13); FX.spark(m.x, m.y, '#ffb000', 10); Aud.sfx('hack', 1);
      } else if (!dashing && d < P.r + 34) { m.fuse = .3; Aud.sfx('warn'); }
    }
    // terminals (hack objective)
    for (const t of this.terms) {
      if (t.fl > 0) t.fl -= dt * 4;
      if (t.done) continue;
      if (dist(P.x, P.y, t.x, t.y) < t.zr && P.dashT <= 0) {
        t.p += dt / 2.6; t.on = 1; t.tick -= dt; if (t.tick <= 0) { t.tick = .3; Aud.sfx('hack', t.p * 4 | 0); FX.spark(t.x, t.y, '#00ffd0', 2); }
        if (t.p >= 1) { styleAdd(ST_HACK, 60); t.done = true; t.p = 1; G.objV++; FX.ring(t.x, t.y, 90, '#00ffd0', 5); FX.call(lt('TERMINAL CRACKED'), '#00ffd0', 2); Aud.say('Terminal cracked'); }
      } else { t.on = 0; t.p = Math.max(0, t.p - dt * .08); }
    }
    // uplink
    const u = this.uplink;
    if (u) {
      if (u.fl > 0) u.fl -= dt * 4;
      for (let i = 0; i < EN.n; i++) {
        const e = EN.a[i]; if (!e.alive || e.al > 0 || e.type === ET.BOMBER || e.mb) continue;
        if (dist(e.x, e.y, u.x, u.y) < u.r + e.r) { e.alive = false; u.hp -= 1; u.fl = 1; Comms.say('uplink'); FX.spark(e.x, e.y, e.col, 10); FX.text(u.x, u.y - 40, lt('UPLINK HIT'), '#ff3b3b', 14); Aud.sfx('hit', 1); }
      }
      if (u.hp <= 0 && G.state === 'PLAY') { FX.boom(u.x, u.y, 160, '#ff0844'); Flow.over(false, u.esc ? 'THE CARGO DRONE WAS DESTROYED' : 'UPLINK DESTROYED'); }
    }
    // firewall nodes
    G.shooter = 31;
    for (const n of this.nodes) {
      if (!n.alive) continue; if (n.fl > 0) n.fl -= dt * 4;
      n.cd -= dt * G.diff.fire; if (n.cd <= 0) { n.cd = 2.6; shoot(n.x, n.y, Math.atan2(P.y - n.y, P.x - n.x), 260, 1); }
      if (!n.bub) { n.bt -= dt; if (n.bt <= 0) { n.bub = 1; n.bt = 7; FX.ring(n.x, n.y, n.r + 20, '#4d7cff', 3); } }
      if (dashing && n.hid !== P.seq && dist(P.x, P.y, n.x, n.y) < P.r + 20 * P.reach + n.r) {
        n.hid = P.seq; onBladeHit();
        if (n.bub) { n.bub = 0; n.bt = 7; FX.ring(n.x, n.y, n.r + 22, '#4d7cff', 4); Aud.sfx('hit', 0); FX.text(n.x, n.y - n.r - 8, lt('SHIELD POP'), '#7da2ff', 13); continue; }
        const d = calcDmg(); n.hp -= d; n.fl = 1;
        FX.text(n.x, n.y - n.r - 6, '' + Math.round(d * 100), G.lastCrit ? '#ffd700' : '#fff', G.lastCrit ? 20 : 14, G.lastCrit); FX.spark(n.x, n.y, '#7df9ff', 8);
        if (n.hp <= 0) { styleAdd(ST_HACK, 60); n.alive = false; G.objV++; FX.boom(n.x, n.y, 130, '#7df9ff'); Aud.sfx('boom', 1); FX.call(lt('NODE DOWN'), '#7df9ff', 2); }
      }
    }
    // express trains
    for (let l = 0; l < this.lanes; l++) {
      const tr = G.train[l], x0 = l === 0 ? V.L : V.R - 76, x1 = x0 + 76;
      if (tr.y < -2000 && tr.warn <= 0) { tr.t -= dt; if (tr.t <= 0) { tr.warn = 2; Aud.sfx('warn'); Comms.say('train'); Tut.check('train', x0 + 38, clamp(P.y, 120, V.VH - 160), 70); toast(lt(l === 0 ? 'EXPRESS TRAIN — LEFT TRACK' : 'EXPRESS TRAIN — RIGHT TRACK'), '#ff3b3b'); } }
      if (tr.warn > 0) { tr.warn -= dt; if (tr.warn <= 0) { tr.y = -520; Aud.sfx('boom', 1); shake(.3); } }
      if (tr.y > -2000) {
        tr.y += 1900 * dt;
        for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.x > x0 - e.r * .5 && e.x < x1 + e.r * .5 && e.y > tr.y && e.y < tr.y + 470) killEnemy(e, Math.PI / 2, 6); }
        if (P.x > x0 - 4 && P.x < x1 + 4 && P.y > tr.y && P.y < tr.y + 470 && P.dashT <= 0 && P.inv <= 0) { if (hurt('train')) { P.vx = (l === 0 ? 1 : -1) * 900; } }
        if (tr.y > V.VH + 60) { tr.y = -9999; tr.t = 13 + R.f() * 6; }
      }
    }
    // EMP storm strikes
    for (let i = this.storm.length - 1; i >= 0; i--) {
      const s = this.storm[i]; s.t -= dt;
      if (s.t <= 0) {
        this.storm.splice(i, 1); Aud.sfx('boom', 0);
        if (s.k === 1) { FX.boom(s.x, s.y, 85, '#ff6a00'); if (dist(P.x, P.y, s.x, s.y) < 78 + P.r * .5) hurt('volatile'); continue; }
        if (s.k === 2) { // Raijin lightning strike: player only
          FX.bolt(s.sx != null ? s.sx : s.x + (rnd() - .5) * 60, s.sy != null ? s.sy : -20, s.x, s.y, '#e8f6ff', 1.2); FX.ring(s.x, s.y, 62, '#9fd8ff', 4); FX.spark(s.x, s.y, '#e8f6ff', 10); BG.flash = .5; shake(.12);
          if (dist(P.x, P.y, s.x, s.y) < 56 + P.r * .5) hurt('strike'); continue;
        }
        BG.flash = .8; FX.bolt(s.x + (rnd() - .5) * 60, -20, s.x, s.y, '#bfe6ff', 1.4); FX.boom(s.x, s.y, 75, '#7df9ff');
        for (let k = 0; k < EN.n; k++) { const e = EN.a[k]; if (e.alive && e.al <= 0 && dist(e.x, e.y, s.x, s.y) < 75 + e.r) damageEnemy(e, 2, Math.atan2(e.y - s.y, e.x - s.x), 2); }
        if (dist(P.x, P.y, s.x, s.y) < 70 + P.r * .5) hurt('storm');
      }
    }
    // credits
    const mr = P.magR + (P.perks.coil | 0) * 60;
    for (let i = 0; i < CO.n; i++) {
      const c = CO.a[i]; c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; const f = Math.pow(.04, dt); c.vx *= f; c.vy *= f;
      const dx = P.x - c.x, dy = P.y - c.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      if (d < mr || c.t > 6) { const s = c.t > 6 ? 900 : 560; c.x += dx / d * s * dt; c.y += dy / d * s * dt; }
      if (d < P.r + 10) {
        c.alive = false; const v = Math.max(1, Math.round(c.v * P.credMul * G.credMul * G.diff.cred * (1 + (P.perks.coil | 0) * .2)));
        Store.data.credits += v; G.runCredits += v; Store.touch(); Aud.sfx('coin');
      }
    }
    CO.sweep();
    // pickups
    for (let i = 0; i < PU.n; i++) {
      const p = PU.a[i]; p.l -= dt; p.t += dt; if (p.l <= 0) { p.alive = false; continue; }
      if (dist(P.x, P.y, p.x, p.y) < P.r + 18) {
        p.alive = false;
        if (p.k === 0) { P.stolen = 8; FX.call(lt('BOSS CANNON ONLINE'), '#00ff88', 2); Aud.say('Cannon acquired'); }
        else { P.hp = Math.min(P.maxHp, P.hp + 1); FX.text(P.x, P.y - 36, lt('+1 SHIELD'), '#00ff88', 15); }
        Aud.sfx('buy');
      }
    }
    PU.sweep();
  },
  drawFloor() { // items that sit on the roof, under entities
    Highway.drawFloor(); Obj2.drawFloor();
    for (const p of this.portals) {
      cx.strokeStyle = p.c; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, TAU); cx.stroke();
      cx.beginPath(); cx.arc(p.x, p.y, p.r * .6, CAM.t * 3, CAM.t * 3 + 4); cx.stroke(); glow(p.x, p.y, 50, p.c, p.cd > 0 ? .15 : .45);
    }
    const d3 = in3D(); // 3D: the 3D layer draws the bodies; the roof marks stay here
    for (const t of this.terms) {
      const c = t.done ? '#00ff88' : '#00ffd0';
      if (!d3) glow(t.x, t.y, 60, c, t.done ? .25 : .4 + t.on * .3);
      if (!t.done) {
        cx.strokeStyle = c; cx.lineWidth = 2; cx.globalAlpha = .5 + t.on * .4; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(t.x, t.y, t.zr, CAM.t * .8, CAM.t * .8 + TAU); cx.stroke(); cx.setLineDash(NODASH);
        cx.globalAlpha = 1; cx.lineWidth = 5; cx.beginPath(); cx.arc(t.x, t.y, t.zr, -Math.PI / 2, -Math.PI / 2 + TAU * t.p); cx.stroke();
      }
      const lbl = () => { cx.fillStyle = c; cx.font = '700 9px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(t.done ? lt('DONE') : t.on ? (t.p * 100 | 0) + '%' : lt('HOLD'), t.x, t.y + 3); };
      if (d3) W3D.stand(t.x, t.y, () => { cx.translate(0, -44); lbl(); }); // the label floats over the console
      else { cx.fillStyle = t.done ? '#06281a' : '#062a2a'; cx.fillRect(t.x - 20, t.y - 24, 40, 48); cx.strokeStyle = c; cx.lineWidth = 2; cx.strokeRect(t.x - 20, t.y - 24, 40, 48); lbl(); }
    }
    const u = this.uplink;
    if (u && u.esc) Obj2.drawDrone(u);
    else if (u && d3) { const w = 70; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(u.x - w / 2, u.y + u.r + 8, w, 6); cx.fillStyle = u.hp / u.mhp > .5 ? '#00ff88' : '#ff3b3b'; cx.fillRect(u.x - w / 2, u.y + u.r + 8, w * Math.max(0, u.hp / u.mhp), 6); }
    else if (u) {
      glow(u.x, u.y, 90, '#ff4fd8', .35 + u.fl * .4);
      cx.strokeStyle = '#ff4fd8'; cx.lineWidth = 3; cx.beginPath(); cx.arc(u.x, u.y, u.r, 0, TAU); cx.stroke();
      cx.beginPath(); cx.moveTo(u.x, u.y - u.r); cx.lineTo(u.x, u.y - u.r - 30); cx.stroke();
      for (let k = 1; k <= 3; k++) { cx.globalAlpha = .6 - ((CAM.t * 1.5 + k / 3) % 1) * .6; cx.beginPath(); cx.arc(u.x, u.y - u.r - 30, ((CAM.t * 1.5 + k / 3) % 1) * 40, Math.PI * 1.15, Math.PI * 1.85); cx.stroke(); }
      cx.globalAlpha = 1; const w = 70; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(u.x - w / 2, u.y + u.r + 8, w, 6);
      cx.fillStyle = u.hp / u.mhp > .5 ? '#00ff88' : '#ff3b3b'; cx.fillRect(u.x - w / 2, u.y + u.r + 8, w * Math.max(0, u.hp / u.mhp), 6);
    }
    if (!d3) for (const b of this.barrels) if (b.alive) {
      glow(b.x, b.y, 34, '#ff6a00', .35); cx.fillStyle = '#ff6a00'; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill();
      cx.fillStyle = '#2a1000'; cx.fillRect(b.x - b.r, b.y - 3, b.r * 2, 6); cx.fillStyle = '#ffd700'; cx.font = '900 10px ' + FONT_D; cx.textAlign = 'center'; cx.fillText('!', b.x, b.y - 5);
    }
    for (const m of this.mines) { // blinking octagon; the ring shows the blast radius once it is armed
      const on = m.arm <= 0, bl = m.fuse > 0 ? ((m.fuse * 30) | 0) % 2 : ((CAM.t * (on ? 3 : 8)) | 0) % 2;
      if (on) { cx.strokeStyle = 'rgba(255,176,0,.22)'; cx.lineWidth = 1.5; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(m.x, m.y, 70, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); }
      if (!d3) { glow(m.x, m.y, 26, m.fuse > 0 ? '#ff0844' : '#ffb000', bl ? .7 : .3);
      cx.fillStyle = '#2a1a00'; poly(m.x, m.y, 11, 8, Math.PI / 8); cx.fill(); cx.strokeStyle = m.fuse > 0 ? '#ff0844' : '#ffb000'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = bl ? (m.fuse > 0 ? '#ffffff' : '#ff0844') : '#5a3a00'; cx.beginPath(); cx.arc(m.x, m.y, 4, 0, TAU); cx.fill(); }
      if (m.t < 2) { cx.globalAlpha = .5; cx.strokeStyle = '#ffb000'; cx.beginPath(); cx.arc(m.x, m.y, 15, -Math.PI / 2, -Math.PI / 2 + TAU * m.t / 2); cx.stroke(); cx.globalAlpha = 1; }
    }
    for (const s of this.storm) { const sc = s.k === 1 ? '#ff6a00' : s.k === 2 ? '#9fd8ff' : '#7df9ff', sr = s.k === 1 ? 85 : s.k === 2 ? 58 : 72; cx.strokeStyle = sc; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(s.x, s.y, sr, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = .12 + (1 - s.t / 1.3) * .25; cx.fillStyle = sc; cx.fill(); cx.globalAlpha = 1; }
    for (let l = 0; l < this.lanes; l++) {
      const tr = G.train[l], x0 = l === 0 ? V.L : V.R - 76;
      if (tr.warn > 0) {
        cx.globalAlpha = .18 + .14 * Math.sin(CAM.t * 18); cx.fillStyle = '#ff0844'; cx.fillRect(x0, 0, 76, V.VH); cx.globalAlpha = .55; cx.fillStyle = '#ff3b3b';
        for (let y = (CAM.t * 300) % 60 - 60; y < V.VH; y += 60) { cx.beginPath(); cx.moveTo(x0 + 10, y); cx.lineTo(x0 + 38, y + 20); cx.lineTo(x0 + 66, y); cx.lineTo(x0 + 66, y + 10); cx.lineTo(x0 + 38, y + 30); cx.lineTo(x0 + 10, y + 10); cx.closePath(); cx.fill(); }
        cx.globalAlpha = 1;
      }
    }
  },
  drawTop() { // turrets, nodes, trains, pickups, coins
    const d3 = in3D(); // 3D: bodies are 3D models; the hack ring, health bars and shields stay here
    for (const t of this.turrets) {
      if (d3) { if (!t.hacked) { cx.strokeStyle = 'rgba(0,255,136,.4)'; cx.lineWidth = 1.5; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(t.x, t.y, t.r + 18, CAM.t, CAM.t + TAU); cx.stroke(); cx.setLineDash(NODASH); } continue; } // dash into it to hack it
      const c = t.hacked ? '#00ff88' : '#ff0844'; glow(t.x, t.y, 40, c, .35);
      cx.save(); cx.translate(t.x, t.y); cx.fillStyle = '#101830'; cx.beginPath(); cx.arc(0, 0, t.r, 0, TAU); cx.fill(); cx.strokeStyle = c; cx.lineWidth = 3; cx.stroke();
      cx.rotate(t.ang); cx.fillStyle = c; cx.fillRect(0, -4, t.r + 10, 8); cx.restore();
    }
    for (const n of this.nodes) if (n.alive) {
      if (!d3) { cx.save(); cx.translate(n.x, n.y); cx.rotate(CAM.t * 1.2); glow(0, 0, 56, '#7df9ff', .4);
      cx.fillStyle = n.fl > .3 ? '#fff' : '#06222a'; cx.fillRect(-n.r, -n.r, n.r * 2, n.r * 2); cx.strokeStyle = '#7df9ff'; cx.lineWidth = 3; cx.strokeRect(-n.r, -n.r, n.r * 2, n.r * 2);
      cx.rotate(-CAM.t * 2.4); cx.strokeRect(-n.r * .5, -n.r * .5, n.r, n.r); cx.restore(); }
      if (n.bub) { cx.strokeStyle = 'rgba(110,150,255,.85)'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(n.x, n.y, n.r + 14 + Math.sin(CAM.t * 6) * 1.5, 0, TAU); cx.stroke(); }
      const w = 52; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(n.x - w / 2, n.y + n.r + 8, w, 5); cx.fillStyle = '#7df9ff'; cx.fillRect(n.x - w / 2, n.y + n.r + 8, w * Math.max(0, n.hp / n.mhp), 5);
    }
    for (let l = 0; l < this.lanes; l++) {
      const tr = G.train[l]; if (tr.y < -2000) continue; const x0 = l === 0 ? V.L : V.R - 76;
      glow(x0 + 38, tr.y + 470, 90, '#ffd700', .6);
      cx.fillStyle = '#c0102e'; cx.fillRect(x0 + 4, tr.y, 68, 470); cx.fillStyle = '#ff3b5c'; cx.fillRect(x0 + 10, tr.y, 56, 470);
      cx.fillStyle = '#ffe9a6'; for (let y = tr.y + 20; y < tr.y + 450; y += 34) cx.fillRect(x0 + 16, y, 44, 14);
      cx.fillStyle = '#ffffff'; cx.fillRect(x0 + 14, tr.y + 458, 14, 8); cx.fillRect(x0 + 48, tr.y + 458, 14, 8);
    }
    if (!d3) for (let i = 0; i < PU.n; i++) {
      const p = PU.a[i], c = p.k === 0 ? '#00ff88' : '#7dffb0', s = 1 + Math.sin(p.t * 8) * .12;
      if (p.l < 3 && ((p.l * 8) | 0) % 2) continue;
      glow(p.x, p.y, 34 * s, c, .7); cx.fillStyle = c; poly(p.x, p.y, 12 * s, p.k === 0 ? 6 : 4, p.t * 2); cx.fill();
      cx.fillStyle = '#04120a'; cx.font = '900 10px ' + FONT_D; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(p.k === 0 ? 'W' : '+', p.x, p.y + 1); cx.textBaseline = 'alphabetic';
    }
    cx.fillStyle = '#ffd700';
    if (!d3) for (let i = 0; i < CO.n; i++) { const c = CO.a[i], w = 3 + Math.abs(Math.sin(c.t * 9)) * 3; cx.fillRect(c.x - w * .5, c.y - 3.5, w, 7); }
  }
};
