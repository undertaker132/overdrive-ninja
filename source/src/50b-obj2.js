/* =====================================================================
   OBJECTIVES 2 (act II story stages)
   collect  — touch glowing data shards; two are on the roof at a time
   escort   — the cargo drone drifts across the roof; enemies that reach
              it damage it (the uplink rules, but it moves)
   reflect  — only kills with shots you slashed back count
   gauntlet — the three mini-bosses, one after another
   combo    — reach a combo of n without a break
   boss chain (obj.chain) — old bosses back to back at reduced health
   Everything uses the seeded R, so a stage plays the same for the same seed.
   ===================================================================== */
const Obj2 = {
  sh: [], shT: 0, gWait: 0,
  begin(s) {
    this.sh.length = 0; this.shT = .4; this.gWait = 2.2; G.objV = 0;
  },
  update(dt) {
    const o = G.obj; if (!o || G.freeze > 0 || G.won) return;
    if (o.t === 'collect') {
      for (let i = this.sh.length - 1; i >= 0; i--) {
        const s = this.sh[i]; s.t += dt;
        if (dist(P.x, P.y, s.x, s.y) < P.r + 20) {
          this.sh.splice(i, 1); G.objV++; this.shT = .6; styleAdd(ST_HACK, 40);
          FX.ring(s.x, s.y, 60, '#2fe6c8', 4); FX.spark(s.x, s.y, '#bffcf2', 14); FX.text(s.x, s.y - 30, G.objV + '/' + o.n, '#2fe6c8', 16);
          Aud.sfx('hack', Math.min(4, G.objV % 5)); vibe('reward');
        }
      }
      const want = Math.min(2 - this.sh.length, o.n - G.objV - this.sh.length); // two on the roof at a time
      if (want > 0) { this.shT -= dt; if (this.shT <= 0) { this.shT = .5; this.spawnShard(); } }
    } else if (o.t === 'escort') {
      const u = Arena.uplink; if (u) { const t = G.time; u.x = V.CX + Math.sin(t * .33) * V.AW * .3; u.y = V.VH * (.46 + Math.sin(t * .21 + 1) * .2); }
    } else if (o.t === 'reflect') G.objV = G.reflK | 0;
    else if (o.t === 'combo') G.objV = G.combo | 0;
    else if (o.t === 'gauntlet') {
      let mb = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].mb) mb++;
      if (!mb && G.objV < o.list.length) {
        this.gWait -= dt;
        if (this.gWait <= 0) {
          this.gWait = 9e9; const id = o.list[G.objV], e = spawnEnemy(ENAME2T[id], V.CX, -40, 1); // gate guardians are elite: tougher and faster
          if (e) { e.spawnT = .5; FX.call(ltf('GATE {0}: {1}', G.objV + 1, lt(EDEF[e.type].name)), '#ff9a3d', 2, 22); Aud.esfx(e.type, 0); }
        }
      }
    }
  },
  spawnShard() {
    let x = V.CX, y = V.VH * .4;
    for (let k = 0; k < 12; k++) { // somewhere on the roof, away from you and from the other shard
      x = V.L + 40 + R.f() * (V.AW - 80); y = 90 + R.f() * (V.VH - 300);
      if (dist(x, y, P.x, P.y) > 150 && this.sh.every(s => dist(s.x, s.y, x, y) > 120)) break;
    }
    this.sh.push({ x, y, t: 0 }); FX.ring(x, y, 40, '#2fe6c8', 2); if (G.objV === 0) Tut.check('shard', x, y, 30);
  },
  check(o) {
    if (o.t === 'collect') return G.objV >= o.n;
    if (o.t === 'reflect') { if (G.objV * 2 >= o.n) Comms.say('half'); return G.objV >= o.n; }
    if (o.t === 'combo') return G.objV >= o.n;
    if (o.t === 'gauntlet') return G.objV >= o.list.length;
    return false;
  },
  onKill(e) {
    const o = G.obj; if (!o) return;
    if (o.t === 'gauntlet' && e.mb) { G.objV++; this.gWait = 1.6; if (G.objV < o.list.length) toast(ltf('GATE {0} OPEN', G.objV), '#ff9a3d'); }
  },
  nextBoss() { // boss chain: the next old boss steps in
    const D = Director; G.chainN++; D.bossPending = D.bossChain.shift(); D.bossLvl = 1;
    for (let i = 0; i < BU.n; i++) BU.a[i].alive = false;
    FX.call(ltf('NEXT: {0}', lt(BOSS_INFO[D.bossPending].name)), BOSS_INFO[D.bossPending].col, 2, 24); G.freeze = 1.2;
  },
  drawFloor() {
    const o = G.obj; if (G.mode !== 'story' || !o || o.t !== 'collect' || in3D()) return; // (3D: the shards are 3D crystals)
    for (const s of this.sh) {
      const p = 1 + Math.sin(s.t * 5) * .12, a = Math.min(1, s.t * 3);
      cx.globalAlpha = a * .25; cx.fillStyle = '#2fe6c8'; cx.fillRect(s.x - 1.5, 0, 3, s.y); cx.globalAlpha = a; // a beacon from above
      glow(s.x, s.y, 46 * p, '#2fe6c8', .6);
      cx.save(); cx.translate(s.x, s.y); cx.rotate(s.t * 1.5); cx.fillStyle = '#bffcf2'; poly(0, 0, 11 * p, 4, 0); cx.fill(); cx.strokeStyle = '#2fe6c8'; cx.lineWidth = 2; cx.stroke();
      cx.rotate(-s.t * 3); cx.setLineDash(DASH6); cx.beginPath(); cx.arc(0, 0, 22, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.restore();
      cx.globalAlpha = 1;
    }
  },
  drawDrone(u) { // the escorted cargo drone
    if (in3D()) { const w = 70; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(u.x - w / 2, u.y + 30, w, 6); cx.fillStyle = u.hp / u.mhp > .5 ? '#00ff88' : '#ff3b3b'; cx.fillRect(u.x - w / 2, u.y + 30, w * Math.max(0, u.hp / u.mhp), 6); return; } // (3D: the 3D layer draws the drone)
    const t = CAM.t; glow(u.x, u.y, 80, '#2fe6c8', .3 + u.fl * .4);
    cx.save(); cx.translate(u.x, u.y);
    cx.fillStyle = u.fl > .3 ? '#ffffff' : '#0c2a30'; rrect(-24, -16, 48, 32, 6); cx.fill(); cx.strokeStyle = '#2fe6c8'; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = '#ffd23f'; cx.fillRect(-16, -5, 32, 10); cx.fillStyle = '#0c2a30'; for (let k = 0; k < 4; k++) cx.fillRect(-14 + k * 8, -5, 3, 10);
    for (const [rx, ry] of [[-26, -20], [26, -20], [-26, 20], [26, 20]]) { cx.strokeStyle = 'rgba(191,252,242,.8)'; cx.lineWidth = 2; cx.beginPath(); const a = t * 30 + rx; cx.moveTo(rx - Math.cos(a) * 10, ry - Math.sin(a) * 3); cx.lineTo(rx + Math.cos(a) * 10, ry + Math.sin(a) * 3); cx.stroke(); cx.fillStyle = '#2fe6c8'; dot(rx, ry, 2.5); }
    cx.restore();
    const w = 70; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(u.x - w / 2, u.y + 30, w, 6);
    cx.fillStyle = u.hp / u.mhp > .5 ? '#00ff88' : '#ff3b3b'; cx.fillRect(u.x - w / 2, u.y + 30, w * Math.max(0, u.hp / u.mhp), 6);
  }
};
