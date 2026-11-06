/* =====================================================================
   ENEMIES — 8 combat archetypes + mini, courier, treasure drone, clones.
   Each archetype has its own movement and attack pattern.
   ===================================================================== */
function enemyHp(t, elite) {
  const d = EDEF[t], D = G.diff;
  let hp = d.hp === 1 ? (D.ehp >= 1.7 ? 1.6 : 1) : d.hp * D.ehp;
  if (G.mode !== 'story' && t !== ET.COURIER) hp *= 1 + Math.max(0, G.seqCar - 1) * .06;
  if (G.ngp && t !== ET.COURIER) hp *= 1.35; // New Game+
  if (G.tune && d.hp > 1) hp *= 1 + G.tune * .1; // owner's story balance step
  return elite ? hp * 2.5 + 1 : hp;
}
function spawnEnemy(t, x, y, elite) {
  const e = EN.get(); if (!e) return null;
  const d = EDEF[t];
  e.evBomb = 0; e.type = t; e.elite = elite ? 1 : 0; e.r = d.r * (elite ? 1.2 : 1); e.hp = e.mhp = enemyHp(t, elite);
  e.col = CBM ? EDEF_CB[t] : d.col; e.v = d.v * (elite ? 3 : 1); e.coins = d.coins * (elite ? 3 : 1);
  e.spd = d.spd * G.diff.espd * G.spdMul * (elite ? 1.12 : 1) * (G.ngp ? 1.08 : 1) * (1 + (G.tune | 0) * .04);
  if (x == null) { x = V.L + 30 + R.f() * (V.R - V.L - 60); y = R.f() < .5 ? -30 : V.VH + 30; }
  e.x = x; e.y = y; e.vx = e.vy = 0; e.t = R.f() * 10; e.cd = 1 + R.f() * 1.2; e.st = 0; e.stT = 0;
  e.ang = Math.atan2(P.y - y, P.x - x); e.sh = t === ET.BRUTE ? 1 : 0; e.bub = 0; e.fl = 0; e.fuse = 0; e.hid = -1; e.al = 0;
  e.vis = 1; e.link = null; e.wcd = 0; e.spawnT = .45; e.scale = .2; e.hpBar = 0; e.kind = 0; e.aff = 0; e.bt = 0; e.gt = 0; e.wv = 0; e.uid = ++G.euid;
  codexSeen(t);
  e.mb = d.mb ? 1 : 0; e.pseq = P.seq; e.da = 0; e.sa = 0; e.dir = 1; e.mt = 3; e.stun = 0; e.kbx = e.kby = 0; e.slw = 0; e.fix = 0; e.pz = 0; e.nem = 0; e.ha = null; e.mark = 0;
  if (t === ET.MINER) e.dir = R.f() < .5 ? 1 : -1;
  else if (t === ET.MIRROR) e.sa = R.f() * TAU;
  else if (t === ET.ENFORCER) { e.sh = 1; e.cd = 2.4; }
  else if (t === ET.WRAITH) e.stT = 2.6;
  if (elite && !e.mb) { e.bub = 1; e.aff = 1 + R.i(simV(37) ? 5 : 4); if (e.aff === 1) e.spd *= 1.45; if (e.aff === 4) e.bt = 4; } else if (e.mb) e.elite = 0;
  return e;
}
function shoot(x, y, a, s, kind) {
  const b = BU.get(); if (!b) return null;
  s *= G.diff.bspd * G.spdMul;
  b.x = x; b.y = y; b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s; b.rf = false; b.gz = false; b.kind = kind || 0; b.t = 0; b.d = 1; b.o = G.shooter;
  b.r = kind === 1 ? 10 : kind === 2 ? 8 : kind === 4 ? 4 : 6;
  return b;
}
function bomberBlast(e) {
  e.alive = false; FX.boom(e.x, e.y, 95, '#ff5500'); Aud.sfx('boom', 0);
  if (dist(P.x, P.y, e.x, e.y) < 90 + P.r * .5) hurt('boom');
  for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o !== e && dist(o.x, o.y, e.x, e.y) < 90 + o.r) damageEnemy(o, 2, Math.atan2(o.y - e.y, o.x - e.x), 2); }
  Arena.blast(e.x, e.y, 90, true);
}
function updateEnemy(e, dt) {
  if (e.spawnT > 0) { e.spawnT -= dt; e.scale = 1 - Math.max(0, e.spawnT) / .45; if (e.spawnT <= 0) { e.scale = 1; FX.ring(e.x, e.y, e.r * 2.4, e.col, 2); Aud.esfx(e.type, 0); } }
  else e.scale = damp(e.scale, 1, 10, dt);
  if (e.mark > 0) e.mark -= dt;
  if (e.fl > 0) e.fl -= 5 * dt; if (e.wcd > 0) e.wcd -= dt; if (e.slw > 0) e.slw -= dt;
  if (e.aff === 4 && !e.bub) { e.bt -= dt; if (e.bt <= 0) { e.bub = 1; e.bt = 4; FX.ring(e.x, e.y, e.r + 22, '#4d7cff', 2); } }
  if (e.aff === 1) { e.gt -= dt; if (e.gt <= 0) { e.gt = .06; FX.ghost(e.x, e.y, 0, e.col); } }
  e.t += dt; G.shooter = e.type;
  if (e.kbx || e.kby) { // gauntlet knockback: a launched enemy slams into walls and other enemies
    e.x += e.kbx * dt; e.y += e.kby * dt; const k = Math.pow(.02, dt); e.kbx *= k; e.kby *= k; if (Math.abs(e.kbx) + Math.abs(e.kby) < 20) e.kbx = e.kby = 0;
    if ((e.x < V.L + e.r || e.x > V.R - e.r) && Math.abs(e.kbx) > 320) { const q = e.x < V.CX ? Math.PI : 0; e.kbx = e.kby = 0; e.x = clamp(e.x, V.L + e.r, V.R - e.r); FX.ring(e.x, e.y, 40, '#ffd23f', 3); FX.text(e.x, e.y - e.r - 10, lt('WALL SLAM'), '#ffd23f', 12); shake(.12); damageEnemy(e, .7 * P.dmgMul * G.dmgMod, q, 2); }
    else knockHit(e);
    if (!e.alive) return;
  }
  if (e.stun > 0) { e.stun -= dt; if (e.x < V.L + e.r) e.x = V.L + e.r; else if (e.x > V.R - e.r) e.x = V.R - e.r; return; } // whip snap: stunned enemies do nothing
  const dx = P.x - e.x, dy = P.y - e.y, d = Math.sqrt(dx * dx + dy * dy) || 1, a = Math.atan2(dy, dx);
  const sp = e.spd * (.85 + G.skill * .3) * (Boss.cur && Boss.cur.stag > 0 ? .5 : 1) * (e.slw > 0 ? .45 : 1); // laser cage slows
  if (e.al > 0) { updateAlly(e, dt); return; }
  switch (e.type) {
    case ET.DRONE: case ET.MINI: {
      const w = a + Math.sin(e.t * 3 + e.uid) * .45; e.x += Math.cos(w) * sp * dt; e.y += Math.sin(w) * sp * dt; e.ang = w; break;
    }
    case ET.SNIPER: {
      if (d < 190) { e.x -= dx / d * sp * dt; e.y -= dy / d * sp * dt; } else if (d > 320) { e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
      else { e.x += Math.cos(a + 1.57) * sp * .3 * dt; e.y += Math.sin(a + 1.57) * sp * .3 * dt; }
      e.ang = a;
      if (e.st === 0) { e.cd -= dt * G.diff.fire; if (e.cd <= 0 && e.spawnT <= 0) { e.st = 1; e.stT = .7; Aud.esfx(e.type, 1); } }
      else { e.stT -= dt; if (e.stT <= 0) { e.st = 0; e.cd = 2.2; shoot(e.x, e.y, a, 420, 4); Aud.sfx('hit', 0); } }
      break;
    }
    case ET.BRUTE: { e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; e.ang = a; break; }
    case ET.BOMBER: {
      const T = Director.bomberTarget(e);
      if (e.fuse > 0) { e.fuse -= dt; if (e.fuse <= 0) { bomberBlast(e); return; } }
      else if (T.d < 110 && e.spawnT <= 0) { e.fuse = .8; Aud.esfx(e.type, 1); }
      else { e.x += (T.x - e.x) / (T.d || 1) * sp * dt; e.y += (T.y - e.y) / (T.d || 1) * sp * dt; }
      e.ang += dt * 4; break;
    }
    case ET.WEAVER: {
      const ta = a + 1.5708, rad = (d - 200) * .8;
      e.x += (Math.cos(ta) * sp + Math.cos(a) * rad) * dt; e.y += (Math.sin(ta) * sp + Math.sin(a) * rad) * dt; e.ang += dt * 2;
      e.cd -= dt * G.diff.fire; if (e.cd <= 0 && e.spawnT <= 0) { e.cd = 2.4; for (let k = -1; k <= 1; k++) shoot(e.x, e.y, a + k * .28, 290, 0); Aud.esfx(e.type, 1); }
      break;
    }
    case ET.PHANTOM: {
      e.stT -= dt;
      if (e.st === 0) { e.x += dx / d * sp * .5 * dt; e.y += dy / d * sp * .5 * dt; e.vis = 1; e.ang = a; if (e.stT <= 0) { e.st = 1; e.stT = .35; Aud.esfx(e.type, 1); } }
      else if (e.st === 1) { e.vis = Math.max(.08, e.stT / .35); if (e.stT <= 0) { const r = 120 + R.f() * 50, b = R.f() * TAU; e.x = clamp(P.x + Math.cos(b) * r, V.L + 20, V.R - 20); e.y = clamp(P.y + Math.sin(b) * r, 30, V.VH - 30); e.st = 2; e.stT = .35; FX.spark(e.x, e.y, '#7df9ff', 8); } }
      else if (e.st === 2) { e.vis = 1 - e.stT / .35 * .9; if (e.stT <= 0) { e.st = 3; e.stT = .38; e.ang = a; } }
      else if (e.st === 3) { e.vis = 1; if (e.stT <= 0) { e.st = 4; e.stT = .32; e.vx = Math.cos(e.ang) * 520 * G.diff.espd; e.vy = Math.sin(e.ang) * 520 * G.diff.espd; } }
      else { e.x += e.vx * dt; e.y += e.vy * dt; if (e.stT <= 0) { e.st = 0; e.stT = 1.2 + R.f(); } }
      break;
    }
    case ET.SPLITTER: { const w = a + Math.sin(e.t * 2) * .3; e.x += Math.cos(w) * sp * dt; e.y += Math.sin(w) * sp * dt; e.ang += dt; break; }
    case ET.WARDEN: {
      if (d < 210) { e.x -= dx / d * sp * dt; e.y -= dy / d * sp * dt; } else if (d > 300) { e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
      e.ang = a; e.stT -= dt;
      if (e.stT <= 0) { // refresh one shield link
        e.stT = 3.5; let best = null, bd = 260;
        for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (!o.alive || o === e || o.al > 0 || o.type === ET.WARDEN || o.bub > 0) continue; const q = dist(o.x, o.y, e.x, e.y); if (q < bd) { bd = q; best = o; } }
        if (best) { best.bub = 1; e.link = best; e.linkG = best.gen; FX.bolt(e.x, e.y, best.x, best.y, '#4d7cff', .8); Aud.esfx(e.type, 1); }
      }
      if (e.link && (!e.link.alive || e.link.gen !== e.linkG)) e.link = null;
      e.cd -= dt * G.diff.fire; if (e.cd <= 0 && e.spawnT <= 0) { e.cd = 3; shoot(e.x, e.y, a, 240, 1); }
      break;
    }
    case ET.COURIER: {
      const flee = Math.atan2(e.y - P.y, e.x - P.x) + Math.sin(e.t * 2.3) * .9;
      const s2 = sp * (d < 160 ? 1.5 : .8) * (e.stT > 0 ? 2 : 1); if (e.stT > 0) e.stT -= dt;
      e.x += Math.cos(flee) * s2 * dt; e.y += Math.sin(flee) * s2 * dt; e.ang = flee;
      if (e.y < 40) e.y = 40; if (e.y > V.VH - 40) e.y = V.VH - 40;
      e.cd -= dt; if (e.cd <= 0) { e.cd = 1.6; for (let k = 0; k < 6; k++) shoot(e.x, e.y, k * TAU / 6 + e.t, 200, 0); }
      break;
    }
    case ET.TREASURE: {
      const flee = Math.atan2(e.y - P.y, e.x - P.x) + Math.sin(e.t * 4) * .6;
      e.x += Math.cos(flee) * sp * dt; e.y += Math.sin(flee) * sp * dt; e.ang += dt * 6;
      e.y = clamp(e.y, e.r, V.VH - e.r);
      e.cd -= dt; if (e.cd <= 0) { e.alive = false; FX.spark(e.x, e.y, '#ffd700', 14); FX.text(e.x, e.y, lt('ESCAPED'), '#ffd700', 14); }
      break;
    }
    case ET.DUMMY: { if (!e.fix) e.ang = a; break; } // training post: stands still, a shielded one turns to face you (puzzle posts keep their facing)
    case ET.MEDIC: { // keeps its distance and heals / re-shields the most hurt enemy nearby
      const want = d < 170 ? -1 : d > 280 ? 1 : 0;
      e.x += (dx / d * want * sp + Math.cos(a + 1.57) * sp * .35) * dt; e.y += (dy / d * want * sp + Math.sin(a + 1.57) * sp * .35) * dt; e.ang = a;
      e.cd -= dt * G.diff.fire;
      if (e.cd <= 0 && e.spawnT <= 0) {
        e.cd = 2.6; let best = null, bs = .05;
        for (let i = 0; i < EN.n; i++) {
          const o = EN.a[i]; if (!o.alive || o === e || o.al > 0 || o.type === ET.MEDIC || o.type === ET.DUMMY || o.spawnT > 0) continue;
          if (dist(o.x, o.y, e.x, e.y) > 240) continue;
          const need = (o.mhp - o.hp) / o.mhp + (o.bub ? 0 : .35) + ((o.type === ET.BRUTE || o.type === ET.ENFORCER) && !o.sh ? .3 : 0);
          if (need > bs) { bs = need; best = o; }
        }
        if (best) {
          best.hp = Math.min(best.mhp, best.hp + (best.mb ? 3 : Math.max(1, best.mhp * .35))); best.bub = 1; if (best.type === ET.BRUTE) best.sh = 1;
          e.link = best; e.linkG = best.gen; e.st = 1; e.stT = .55; FX.ring(best.x, best.y, best.r + 18, '#5dffb4', 3); Aud.esfx(e.type, 1);
        }
      }
      if (e.st === 1) { e.stT -= dt; if (e.stT <= 0 || !e.link || !e.link.alive || e.link.gen !== e.linkG) { e.st = 0; e.link = null; } }
      break;
    }
    case ET.MIMIC: { // copies your dash a moment later, in the same direction
      if (e.st === 0) {
        e.x += dx / d * sp * .6 * dt; e.y += dy / d * sp * .6 * dt; e.ang = a;
        if (e.pseq !== P.seq && P.dashT > 0 && e.spawnT <= 0) { e.pseq = P.seq; e.st = 1; e.stT = .45 / G.diff.espd; e.da = P.ang; Aud.esfx(e.type, 1); }
      } else if (e.st === 1) { e.stT -= dt; e.ang = e.da; if (e.stT <= 0) { e.st = 2; e.stT = .24; e.vx = Math.cos(e.da) * 1100 * G.diff.espd; e.vy = Math.sin(e.da) * 1100 * G.diff.espd; FX.streak(e.x, e.y, e.da + Math.PI, '#ff6ad5', 6); } }
      else { e.x += e.vx * dt; e.y += e.vy * dt; e.stT -= dt; FX.ghost(e.x, e.y, e.da, '#ff6ad5'); if (e.stT <= 0) { e.st = 0; e.pseq = P.seq; } }
      e.y = clamp(e.y, -40, V.VH + 40); break;
    }
    case ET.MINER: { // circles at mid range and drops proximity mines
      const ta = a + 1.5708 * e.dir, rad = (d - 250) * .7;
      e.x += (Math.cos(ta) * sp + Math.cos(a) * rad) * dt; e.y += (Math.sin(ta) * sp + Math.sin(a) * rad) * dt; e.ang = ta;
      if (e.x <= V.L + e.r + 2 || e.x >= V.R - e.r - 2) e.dir = -e.dir;
      e.cd -= dt * G.diff.fire;
      if (e.cd <= 0 && e.spawnT <= 0 && e.y > 30 && e.y < V.VH - 120) { e.cd = 3.4; Arena.layMine(e.x, e.y, ET.MINER); Aud.esfx(e.type, 1); }
      break;
    }
    case ET.MIRROR: { // a mirror shield orbits it; your dash bounces off the mirror like a rail
      e.sa += dt * 1.5;
      if (d < 150) { e.x -= dx / d * sp * dt; e.y -= dy / d * sp * dt; } else if (d > 260) { e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
      else { e.x += Math.cos(a + 1.57) * sp * .4 * dt; e.y += Math.sin(a + 1.57) * sp * .4 * dt; }
      e.ang = a; break;
    }
    case ET.ENFORCER: { // mini-boss: front shield and charges; a wall slam stuns it and drops the shield
      if (e.st === 0) {
        e.ang = a; e.x += dx / d * sp * dt; e.y += dy / d * sp * dt;
        e.cd -= dt * G.diff.fire; if (e.cd <= 0 && e.spawnT <= 0) { e.st = 1; e.stT = .75; e.da = a; Aud.sfx('warn'); }
      } else if (e.st === 1) { e.stT -= dt; e.ang = e.da; if (e.stT <= 0) { e.st = 2; e.stT = .9; e.vx = Math.cos(e.da) * 640 * G.diff.espd; e.vy = Math.sin(e.da) * 640 * G.diff.espd; } }
      else if (e.st === 2) {
        e.x += e.vx * dt; e.y += e.vy * dt; e.stT -= dt; FX.ghost(e.x, e.y, e.da, '#3dff8a');
        const wall = e.x <= V.L + e.r + 1 || e.x >= V.R - e.r - 1 || e.y <= e.r + 4 || e.y >= V.VH - e.r - 4;
        if (wall || e.stT <= 0) {
          e.st = 3; e.stT = wall ? 1.5 : .5; shake(.35); FX.ring(e.x, e.y, 90, '#3dff8a', 4);
          if (wall) { e.sh = 0; Aud.sfx('boom', 1); FX.call(lt('ENFORCER STUNNED'), '#3dff8a', 1, 16); for (let k = 0; k < 10; k++) shoot(e.x, e.y, k * TAU / 10, 200, 0); }
        }
      } else { e.stT -= dt; if (e.stT <= 0) { e.st = 0; e.cd = 3.2; e.sh = 1; } }
      e.y = clamp(e.y, e.spawnT > 0 ? -60 : e.r + 4, V.VH - e.r - 4); break;
    }
    case ET.SPIDER: { // mini-boss: slow walker, bullet fans and mine drops
      if (d < 200) { e.x -= dx / d * sp * dt; e.y -= dy / d * sp * dt; } else if (d > 300) { e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
      e.ang = a; e.cd -= dt * G.diff.fire; e.mt -= dt;
      if (e.cd <= 0 && e.spawnT <= 0) { e.cd = 1.7; for (let k = -2; k <= 2; k++) shoot(e.x, e.y, a + k * .16, 250, k === 0 ? 1 : 0); }
      if (e.mt <= 0 && e.spawnT <= 0) { e.mt = 4.5; for (let k = 0; k < 2; k++) { const q = R.f() * TAU; Arena.layMine(clamp(e.x + Math.cos(q) * 40, V.L + 20, V.R - 20), clamp(e.y + Math.sin(q) * 40, 40, V.VH - 140), ET.SPIDER); } }
      e.y = clamp(e.y, e.spawnT > 0 ? -60 : e.r + 4, V.VH - e.r - 4); break;
    }
    case ET.WRAITH: { // mini-boss: spiral shots, then fades out and blinks next to you with a ring of shots
      e.stT -= dt;
      if (e.st === 0) {
        const w = a + 1.2; e.x += Math.cos(w) * sp * .6 * dt; e.y += Math.sin(w) * sp * .6 * dt; e.vis = 1; e.ang = a;
        e.cd -= dt * G.diff.fire; if (e.cd <= 0 && e.spawnT <= 0) { e.cd = .55; shoot(e.x, e.y, e.t * 2.6, 170, 3); }
        if (e.stT <= 0 && e.spawnT <= 0) { e.st = 1; e.stT = .5; }
      } else if (e.st === 1) {
        e.vis = Math.max(.08, e.stT / .5);
        if (e.stT <= 0) {
          const q = R.f() * TAU, rr = 150 + R.f() * 60; e.x = clamp(P.x + Math.cos(q) * rr, V.L + 30, V.R - 30); e.y = clamp(P.y + Math.sin(q) * rr, 60, V.VH - 150);
          e.st = 2; e.stT = .45; for (let k = 0; k < 8; k++) shoot(e.x, e.y, k * TAU / 8, 140, 3); FX.ring(e.x, e.y, 60, '#b98cff', 4); Aud.sfx('warp');
        }
      } else { e.vis = 1 - e.stT / .45 * .7; if (e.stT <= 0) { e.st = 0; e.stT = 3 + R.f() * 1.2; } }
      e.y = clamp(e.y, e.spawnT > 0 ? -60 : e.r + 4, V.VH - e.r - 4); break;
    }
    case ET.CLONE: {
      e.stT -= dt;
      if (e.st === 0) { e.x += dx / d * 70 * dt; e.y += dy / d * 70 * dt; e.ang = a; if (e.stT <= 0) { e.st = 1; e.stT = .55; Aud.esfx(e.type, 1); } }
      else if (e.st === 1) { if (e.stT <= 0) { e.st = 2; e.stT = .25; e.vx = Math.cos(e.ang) * 1100; e.vy = Math.sin(e.ang) * 1100; } }
      else { e.x += e.vx * dt; e.y += e.vy * dt; if (e.stT <= 0) { e.st = 0; e.stT = 1 + R.f(); } }
      break;
    }
  }
  if (e.type !== ET.TREASURE && e.type !== ET.PHANTOM && e.spawnT <= 0) { if (e.y < -60) e.y = -60; else if (e.y > V.VH + 60) e.y = V.VH + 60; }
  if (e.x < V.L + e.r) e.x = V.L + e.r; else if (e.x > V.R - e.r) e.x = V.R - e.r;
}
function updateAlly(e, dt) {
  e.al -= dt; let b = null, bd = 1e9;
  for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o.al <= 0) { const q = dist(o.x, o.y, e.x, e.y); if (q < bd) { bd = q; b = o; } } }
  if (b) {
    const q = bd || 1; e.x += (b.x - e.x) / q * 330 * dt; e.y += (b.y - e.y) / q * 330 * dt; e.ang = Math.atan2(b.y - e.y, b.x - e.x);
    if (bd < e.r + b.r) { b.bub = 0; b.sh = 0; damageEnemy(b, 2.5 * P.dmgMul, e.ang, 5); allyPop(e); return; }
  } else if (Boss.cur) {
    const B = Boss.cur, q = dist(B.x, B.y, e.x, e.y) || 1;
    e.x += (B.x - e.x) / q * 330 * dt; e.y += (B.y - e.y) / q * 330 * dt;
    if (q < e.r + B.r) { Boss.hitBody(B, 3 * P.dmgMul, Math.atan2(B.y - e.y, B.x - e.x), true); allyPop(e); return; }
  }
  if (e.al <= 0) allyPop(e);
}
function allyPop(e) {
  const R0 = P.evo.hijack ? 125 : 90; // mind storm: bigger final blasts
  e.alive = false; FX.boom(e.x, e.y, R0, '#00f2fe'); Aud.sfx('boom', 0);
  for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o.al <= 0 && dist(o.x, o.y, e.x, e.y) < R0 + o.r) damageEnemy(o, 1.5, Math.atan2(o.y - e.y, o.x - e.x), 5); }
}
/* ---------------- damage + death ---------------- */
function damageEnemy(e, d, a, src) {
  if (!e.alive || e.al > 0) return false;
  if (e.bub > 0) { e.bub = 0; FX.ring(e.x, e.y, e.r + 26, '#4d7cff', 3); FX.spark(e.x, e.y, '#4d7cff', 8); if (src === 0) FX.text(e.x, e.y - e.r - 8, lt('SHIELD POP'), '#7da2ff', 13); Aud.sfx('hit', 0); return false; }
  if (e.mark > 0) d *= 1.5 + .1 * ((G.petLv || 1) - 1); // NIGHT OWL mark
  e.hp -= d; e.fl = 1; e.hpBar = 2; e.ha = a; // ha: hit direction, only for the hit animation
  if (src === 0) dmgNum(e.x + (rnd() - .5) * 14, e.y - e.r - 6, Math.max(1, Math.round(d * 100)), G.lastCrit, false);
  if (e.hp <= 0) { killEnemy(e, a, src); return true; }
  if (e.type !== ET.COURIER) { e.x += Math.cos(a) * 16; e.y += Math.sin(a) * 16; }
  else { // courier blinks to the corner farthest from the player and fires a ring
    FX.spark(e.x, e.y, '#ffd700', 12); let bx = e.x, by = e.y, bd = -1;
    for (let k = 0; k < 4; k++) { const cxp = k & 1 ? V.R - 40 : V.L + 40, cyp = k & 2 ? V.VH - 70 : 70, q = dist(cxp, cyp, P.x, P.y); if (q > bd) { bd = q; bx = cxp; by = cyp; } }
    e.x = bx; e.y = by; e.stT = .7; FX.ring(e.x, e.y, 60, '#ffd700', 3); G.shooter = ET.COURIER; for (let k = 0; k < 6; k++) shoot(e.x, e.y, k * TAU / 6 + e.t, 200, 0);
  }
  e.scale = 1.3; Aud.sfx('hit', G.lastCrit && src === 0 ? 1 : 0);
  return false;
}
function killEnemy(e, a, src) {
  EAnim.death(e, a || 0);
  e.alive = false; W4.onKill(e); Events.onKill(e); G.kills++; G.combo++; G.ct = 3.4; codexKill(e.type);
  if (G.combo > G.maxCombo) G.maxCombo = G.combo;
  ach('first'); if (G.combo >= 15) ach('combo15'); if (G.combo >= 40) ach('combo40');
  if (e.mb && simV(15)) { // execution: a mini-boss goes down with a cross cut and a short freeze
    G.hs = Math.max(G.hs, .12); punch(.08); shake(.6); flash(.25, '#ffffff'); FX.call(lt('EXECUTION!'), '#ff0844', 2, 26);
    FX.streak(e.x, e.y, .785, '#ffffff', 14); FX.streak(e.x, e.y, -.785, '#ffffff', 14); FX.ring(e.x, e.y, 90, '#ff0844', 5);
  }
  const bd = P.skin && P.skin.body; // hero flourishes
  if (bd === 'kitsune') { FX.ring(e.x, e.y, 46, '#00f2fe', 3); FX.spark(e.x, e.y, '#7df9ff', 10); } // blue fox-fire
  if (src === 0) styleAdd(P.ncq > 1 && P.cqi > 1 ? ST_CHAIN : P.bounced ? ST_RICO : ST_SLASH, P.ncq > 1 && P.cqi > 1 ? 50 : P.bounced ? 55 : 30);
  else if (src === 4) styleAdd(ST_REFLECT, 60); else if (src === 6) styleAdd(ST_TRAIN, 80); else styleAdd(ST_SKILL, 40);
  if (G.combo === 15) Comms.say('combo');
  if (src === 0) { masteryKill(e, a); WFX.kill(e, a); }
  heroXp();
  bounty('kills', 1); bounty('combo', G.combo, true);
  const pts = Math.round(e.v * Math.max(1, G.combo) * G.scoreMul * G.diff.score * (G.dark ? 2 : 1));
  G.score += pts;
  addOD(e.type === ET.COURIER ? 40 : 4 + (P.w.id === 'muramasa' ? 4 : 0));
  G.skill = Math.min(G.diff.dda[1], G.skill + .015);
  let nc = e.coins * (G.ev === 'surge' ? 2 : 1);
  for (let i = 0; i < nc; i++) { const c = CO.get(); if (!c) break; const b = R.f() * TAU, s = 60 + R.f() * 140; c.x = e.x; c.y = e.y; c.vx = Math.cos(b) * s; c.vy = Math.sin(b) * s; c.v = 2; c.t = 0; }
  FX.slice(e, a); FX.spark(e.x, e.y, e.col, 12); FX.ring(e.x, e.y, e.r * 2.6, e.col, 3); FX.streak(e.x, e.y, a, '#ffffff', 5);
  if (src === 0 && P.fx && P.fx.kill) FX.bladeKill(e, a, P.fx.kill);
  if (G.mods.vampire && ++G.vampK >= 8) { G.vampK = 0; if (P.hp < P.maxHp) { P.hp++; FX.text(P.x, P.y - 40, lt('+1 SHIELD'), '#ff3b5c', 15); } }
  if (e.type === ET.DUMMY && G.mode === 'dojo') Dojo.onKill(e, src);
  if (e.pz === 2) Arena.barrelBoom(e); // puzzle bomb post: blows up everything around it
  if (e.elite) { FX.boom(e.x, e.y, 80, '#ffd700'); if (R.f() < .35) dropPickup(e.x, e.y, 1); }
  if (e.mb) { // mini-boss down: a big blast, a shield pickup, a highlight for the replay clip
    FX.boom(e.x, e.y, 130, e.col); punch(.06); dropPickup(e.x, e.y, 1); G.mbKills = (G.mbKills | 0) + 1;
    FX.call(ltf('{0} DOWN', lt(EDEF[e.type].name)), e.col, 3, 22); Comms.say('miniDown', true); Aud.say('Mini boss down'); REC.mark('mini', 3);
  }
  if (src === 4 && G.rfHit) G.reflK++; // killed by a shot you slashed back
  Aud.sfx('kill', G.combo); Aud.esfx(e.type, 2); if (src === 0) Aud.wimpact(P.w.id);
  if (src === 0 && G.combo % 10 === 0) { punch(.05); FX.call(ltf('{0} COMBO', G.combo), RANKS[G.styleRk].c, 2); if (G.combo % 25 === 0) REC.mark('combo', 2 + G.combo / 50); }
  if (e.aff === 2) Arena.storm.push({ x: e.x, y: e.y, t: .75, k: 1 });
  if (e.type === ET.SPLITTER || e.aff === 3) for (let k = -1; k <= 1; k += 2) { const m = spawnEnemy(ET.MINI, e.x + k * 12, e.y, 0); if (m) { m.spawnT = .1; m.x += k * 6; } }
  if (e.type === ET.TREASURE) { FX.call(lt('JACKPOT'), '#ffd700', 2); Aud.say('Jackpot'); }
  if (src === 6) { G.trainKills++; ach('train'); FX.text(e.x, e.y, lt('TRAIN CRUSH'), '#ffd700', 16); }
  if (P.perks.vamp && ++P.vampN >= (P.perks.bloom ? 6 : 12)) { P.vampN = 0; if (P.hp < P.maxHp) { P.hp++; FX.text(P.x, P.y - 40, lt('+1 SHIELD'), '#00ff88', 15); } }
  if (G.mode === 'tower') Tower.kill(e);
  if (e.nem) Nemesis.slain(e);
  if (P.perks.boom && src !== 7) { FX.ring(e.x, e.y, 70, '#ff6a00', 3); for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o.al <= 0 && dist(o.x, o.y, e.x, e.y) < 70 + o.r) damageEnemy(o, 1, Math.atan2(o.y - e.y, o.x - e.x), 7); } }
  Director.onKill(e);
}
function dropPickup(x, y, k) { const p = PU.get(); if (!p) return; p.x = x; p.y = y; p.k = k; p.l = k ? 9 : 12; p.t = 0; }
/* ---------------- draw ---------------- */
/* what drawEnemy draws (3D draws the body standing up, the labels over it, and the rings, links and aim lines on the roof) */
const ED_BODY = 1, ED_LABEL = 2, ED_FLOOR = 4; let EDRAW = 7;
function easeBack(u) { u = u < 0 ? 0 : u > 1 ? 1 : u; const v = u - 1; return 1 + 2.70158 * v * v * v + 1.70158 * v * v; } // overshoots a little, then settles (spawn pop-in)
function drawEnemy(e) {
  const s = (e.spawnT > 0 && !CALM && !W3D.live ? easeBack(e.scale) : e.scale) * (1 + (e.fl > .5 ? .08 : 0)), col = e.fl > .3 ? '#ffffff' : e.al > 0 ? '#00f2fe' : e.col, t = e.type, r = e.r;
  if (EDRAW & ED_BODY) {
  cx.save(); cx.translate(e.x, e.y); cx.globalAlpha = e.vis;
  if (e.vis > .3) glow(0, 0, e.r * 2.4, e.al > 0 ? '#00f2fe' : e.col, .45 * e.vis);
  cx.scale(s, s); EAnim.pre(e);
  if (t === ET.DRONE || t === ET.MINI) { // spider drone with skittering legs
    cx.strokeStyle = col; cx.lineWidth = 2;
    cx.beginPath();
    for (let l = -1; l <= 1; l++) { const w = Math.sin(e.t * 14 + l * 1.7) * 4; cx.moveTo(-r * .3, l * r * .35); cx.lineTo(-r * 1.4, l * r * .75 + w); cx.moveTo(r * .3, l * r * .35); cx.lineTo(r * 1.4, l * r * .75 - w); }
    cx.stroke();
    cx.rotate(e.ang); poly(0, 0, r, 5, 0); cx.fillStyle = col; cx.fill();
    cx.fillStyle = '#05050d'; cx.beginPath(); cx.arc(r * .25, 0, r * .32, 0, TAU); cx.fill();
    cx.fillStyle = '#ff0844'; cx.fillRect(r * .2, -2, 5, 4);
  } else if (t === ET.SNIPER) {
    cx.rotate(e.ang); cx.fillStyle = col; poly(0, 0, r, 3, 0); cx.fill();
    cx.fillStyle = '#2a1500'; cx.fillRect(0, -3, r * 1.9, 6); cx.fillStyle = col; cx.fillRect(r * 1.2, -2, r * .8, 4);
    cx.fillStyle = '#05050d'; cx.beginPath(); cx.arc(-r * .15, 0, r * .3, 0, TAU); cx.fill();
  } else if (t === ET.BRUTE) {
    cx.rotate(e.t * .6); poly(0, 0, r, 6, 0); cx.fillStyle = '#0c2a1c'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    poly(0, 0, r * .55, 6, .5); cx.fillStyle = col; cx.fill();
  } else if (t === ET.BOMBER) {
    const blink = e.fuse > 0 && ((e.fuse * 14) | 0) % 2;
    cx.fillStyle = blink ? '#ffffff' : col; cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.fill();
    cx.rotate(e.ang); cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.beginPath();
    for (let k = 0; k < 6; k++) { const b = k * TAU / 6; cx.moveTo(Math.cos(b) * r, Math.sin(b) * r); cx.lineTo(Math.cos(b) * (r + 6), Math.sin(b) * (r + 6)); }
    cx.stroke(); cx.fillStyle = '#05050d'; cx.beginPath(); cx.arc(0, 0, r * .4, 0, TAU); cx.fill();
  } else if (t === ET.WEAVER) {
    cx.rotate(e.ang); poly(0, 0, r, 4, 0); cx.fillStyle = col; cx.fill();
    cx.fillStyle = '#ffffff'; for (let k = 0; k < 3; k++) { const b = e.t * 5 + k * TAU / 3; cx.fillRect(Math.cos(b) * (r + 7) - 2, Math.sin(b) * (r + 7) - 2, 4, 4); }
    cx.fillStyle = '#05050d'; cx.beginPath(); cx.arc(0, 0, r * .35, 0, TAU); cx.fill();
  } else if (t === ET.PHANTOM) {
    cx.rotate(e.ang); cx.fillStyle = col; poly(0, 0, r, 3, 0); cx.fill();
    cx.strokeStyle = 'rgba(125,249,255,.6)'; cx.lineWidth = 1.5; poly(0, 0, r + 5 + Math.sin(e.t * 20) * 2, 3, 0); cx.stroke();
    if (e.st === 3) { cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(r, 0); cx.lineTo(r + 40, 0); cx.stroke(); }
  } else if (t === ET.SPLITTER) {
    cx.rotate(e.ang); cx.fillStyle = col;
    cx.beginPath(); cx.arc(-r * .35, 0, r * .7, 0, TAU); cx.fill(); cx.beginPath(); cx.arc(r * .35, 0, r * .7, 0, TAU); cx.fill();
    cx.fillStyle = '#05050d'; cx.fillRect(-1.5, -r * .7, 3, r * 1.4);
  } else if (t === ET.WARDEN) {
    poly(0, 0, r, 5, -1.57); cx.fillStyle = col; cx.fill();
    cx.strokeStyle = '#bcd0ff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, -r); cx.lineTo(0, -r - 10); cx.stroke();
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(0, -r - 11, 3, 0, TAU); cx.fill();
    cx.fillStyle = '#05050d'; cx.beginPath(); cx.arc(0, 0, r * .38, 0, TAU); cx.fill();
  } else if (t === ET.COURIER) {
    if (e.stT > 0) cx.globalAlpha = .35 + .3 * Math.sin(e.t * 40);
    cx.rotate(e.ang); poly(0, 0, r, 6, 0); cx.fillStyle = '#3a2a00'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    cx.fillStyle = col; cx.fillRect(-r * .5, -r * .25, r, r * .5);
  } else if (t === ET.TREASURE) {
    cx.rotate(e.ang); poly(0, 0, r, 8, 0); cx.fillStyle = col; cx.fill(); cx.fillStyle = '#7a5a00'; cx.font = '900 12px ' + FONT_D; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.rotate(-e.ang); cx.fillText('¥', 0, 1);
  } else if (t === ET.DUMMY) { // straw-and-steel training post (a puzzle bomb post is red-hot)
    if (e.pz === 2) { cx.strokeStyle = 'rgba(255,106,0,.35)'; cx.lineWidth = 1.5; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(0, 0, 150, CAM.t * .3, CAM.t * .3 + TAU); cx.stroke(); cx.setLineDash(NODASH); }
    cx.fillStyle = e.fl > .3 ? '#ffffff' : e.pz === 2 ? '#6a2808' : '#5a4428'; cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    cx.strokeStyle = '#2a1e10'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-r * .7, -r * .7); cx.lineTo(r * .7, r * .7); cx.moveTo(r * .7, -r * .7); cx.lineTo(-r * .7, r * .7); cx.stroke();
    cx.fillStyle = '#c0102e'; cx.beginPath(); cx.arc(0, 0, r * .3, 0, TAU); cx.fill();
  } else if (t === ET.CLONE) {
    cx.globalAlpha = e.vis * .8; cx.rotate(e.ang); cx.fillStyle = col; cx.beginPath(); cx.arc(0, 0, r * .8, 0, TAU); cx.fill();
    cx.strokeStyle = '#d9c2ff'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(6, 0); cx.lineTo(r + 22, 0); cx.stroke();
  } else if (t >= ET.MEDIC && t !== ET.MIMIC) drawEnemy2(e, t, r, col);
  cx.restore(); cx.globalAlpha = 1;
  if (t === ET.MIMIC) drawMimicBody(e, col);
  }
  // overlays in world space: on the roof
  if (EDRAW & ED_FLOOR) {
  if (e.spawnT > 0 && !W3D.live && e.y > -10 && e.y < V.VH + 10) { // the spawn mark: a ring closing in on the spot (3D draws its own beam)
    const k = clamp(1 - e.spawnT / .45, 0, 1), r = e.r || 14; cx.strokeStyle = e.col; cx.globalAlpha = .85 * (1 - k * .4); cx.lineWidth = 2.5;
    cx.beginPath(); cx.arc(e.x, e.y, Math.min(52, r * (2.4 - 1.3 * k)), 0, TAU); cx.stroke(); cx.setLineDash(DASH6); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(e.x, e.y, Math.min(40, r * (1.5 + .3 * k)), CAM.t * 3, CAM.t * 3 + TAU); cx.stroke(); cx.setLineDash(NODASH);
    cx.globalAlpha = .16 * (1 - k); cx.fillStyle = e.col; cx.beginPath(); cx.arc(e.x, e.y, Math.min(52, r * 2.4), 0, TAU); cx.fill(); cx.globalAlpha = 1; }
  if (e.sh > 0) { cx.strokeStyle = '#00ff88'; cx.lineWidth = 5; cx.beginPath(); cx.arc(e.x, e.y, e.r + 7, e.ang - 1.1, e.ang + 1.1); cx.stroke(); }
  if (e.bub > 0) { cx.strokeStyle = 'rgba(110,150,255,.85)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(e.x, e.y, e.r + 9 + Math.sin(CAM.t * 6) * 1.5, 0, TAU); cx.stroke(); }
  if (e.elite) {
    cx.strokeStyle = '#ffd700'; cx.lineWidth = 1.5; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(e.x, e.y, e.r + 14, CAM.t, CAM.t + TAU); cx.stroke(); cx.setLineDash(NODASH);
    if (e.aff === 2) { cx.strokeStyle = '#ff6a00'; cx.globalAlpha = .4 + .4 * Math.sin(CAM.t * 10); cx.lineWidth = 2; cx.beginPath(); cx.arc(e.x, e.y, e.r + 20, 0, TAU); cx.stroke(); cx.globalAlpha = 1; }
  }
  if (e.type === ET.SNIPER && e.st === 1 && !G.dark) {
    const k = 1 - e.stT / .7; cx.globalAlpha = .35 + k * .5; cx.strokeStyle = '#ff9a00'; cx.lineWidth = 1.5 + k * 2;
    cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.x + Math.cos(e.ang) * 900, e.y + Math.sin(e.ang) * 900); cx.stroke(); cx.globalAlpha = 1;
  }
  if (e.type === ET.BOMBER && e.fuse > 0) { cx.strokeStyle = 'rgba(255,85,0,.5)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(e.x, e.y, 90, 0, TAU); cx.stroke(); }
  if (e.type === ET.CLONE && e.st === 1) { cx.strokeStyle = 'rgba(255,8,68,.7)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.x + Math.cos(e.ang) * 280, e.y + Math.sin(e.ang) * 280); cx.stroke(); }
  if (e.type === ET.WARDEN && e.link) { cx.strokeStyle = 'rgba(77,124,255,.7)'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.link.x, e.link.y); cx.stroke(); cx.setLineDash(NODASH); }
  if (e.type === ET.MEDIC && e.st === 1 && e.link && e.link.alive && e.link.gen === e.linkG) { cx.strokeStyle = 'rgba(93,255,180,.85)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.link.x, e.link.y); cx.stroke(); glow(e.link.x, e.link.y, 30, '#5dffb4', .5); }
  if (e.type === ET.MIMIC && e.st === 1) { cx.strokeStyle = 'rgba(255,106,213,.8)'; cx.lineWidth = 2.5; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.x + Math.cos(e.da) * 264, e.y + Math.sin(e.da) * 264); cx.stroke(); cx.setLineDash(NODASH); }
  if (e.type === ET.ENFORCER && e.st === 1) { cx.strokeStyle = 'rgba(255,8,68,.75)'; cx.lineWidth = 3; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.x + Math.cos(e.da) * 520, e.y + Math.sin(e.da) * 520); cx.stroke(); cx.setLineDash(NODASH); }
  }
  // labels and health bars: over the body
  if (EDRAW & ED_LABEL) {
  if (e.elite) { cx.font = '700 8px ' + FONT_M; cx.textAlign = 'center'; cx.fillStyle = '#ffd700'; cx.fillText(lt(AFF_TXT[e.aff]), e.x, e.y - e.r - 20); }
  if (e.al > 0) { cx.fillStyle = '#00f2fe'; cx.font = '900 10px ' + FONT_D; cx.textAlign = 'center'; cx.fillText(lt('ALLY'), e.x, e.y - e.r - 9); }
  if (e.mb) { // mini-boss: name + wide health bar
    const w = e.r * 2.8, y = e.y - e.r - 20; cx.fillStyle = 'rgba(0,0,0,.65)'; cx.fillRect(e.x - w / 2, y, w, 6); cx.fillStyle = e.col; cx.fillRect(e.x - w / 2, y, w * Math.max(0, e.hp / e.mhp), 6);
    cx.font = '700 9px ' + FONT_D; cx.textAlign = 'center'; cx.fillStyle = e.col; cx.fillText(lt(EDEF[e.type].name), e.x, y - 4);
  } else if ((e.hpBar > 0 && e.mhp > 1.5) || e.type === ET.COURIER) {
    if (e.hpBar > 0) e.hpBar -= 1 / 60;
    const w = e.r * 2.2; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(e.x - w / 2, e.y + e.r + 7, w, 4);
    cx.fillStyle = e.type === ET.COURIER ? '#ffd700' : '#ff3b5c'; cx.fillRect(e.x - w / 2, e.y + e.r + 7, w * Math.max(0, e.hp / e.mhp), 4);
  }
  }
}
function drawBullets() {
  for (let i = 0; i < BU.n; i++) {
    const b = BU.a[i], c = b.rf ? P.ca : b.kind === 2 ? '#ff2bd6' : b.kind === 3 ? '#d9c2ff' : '#ff9a00';
    glow(b.x, b.y, b.r * 3, c, .6);
    cx.fillStyle = c;
    if (b.rf) { // your reflected shots are diamonds in your color: never confused with incoming fire
      const a = Math.atan2(b.vy, b.vx), ca = Math.cos(a), sa = Math.sin(a), f = b.r + 4, w = b.r * .7;
      cx.beginPath(); cx.moveTo(b.x + ca * f, b.y + sa * f); cx.lineTo(b.x - sa * w, b.y + ca * w); cx.lineTo(b.x - ca * (b.r + 2), b.y - sa * (b.r + 2)); cx.lineTo(b.x + sa * w, b.y - ca * w); cx.closePath(); cx.fill();
    }
    else if (b.kind === 2) { const a = Math.atan2(b.vy, b.vx); cx.save(); cx.translate(b.x, b.y); cx.rotate(a); cx.fillRect(-9, -4, 18, 8); cx.fillStyle = '#ffd700'; cx.fillRect(-13, -2, 4, 4); cx.restore(); }
    else if (b.kind === 3) { cx.save(); cx.translate(b.x, b.y); cx.rotate(b.t * 18); poly(0, 0, b.r + 2, 4, 0); cx.fill(); cx.restore(); }
    else if (b.kind === 4) { cx.strokeStyle = c; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x - b.vx * .03, b.y - b.vy * .03); cx.stroke(); }
    else { // incoming round: dark rim + white-hot core reads on any background
      cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill(); cx.strokeStyle = 'rgba(25,4,0,.9)'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(b.x, b.y, b.r * .45, 0, TAU); cx.fill();
    }
  }
  for (let i = 0; i < PB.n; i++) {
    const p = PB.a[i], a = Math.atan2(p.vy, p.vx), ca = Math.cos(a), sa = Math.sin(a), f = p.r + 3, w = p.r * .6;
    if (p.k === 1) { // thrown kunai: dark leaf blade, bright edge, ring pommel
      glow(p.x, p.y, 14, '#c9d6ff', .45); cx.save(); cx.translate(p.x, p.y); cx.rotate(a);
      cx.fillStyle = '#1a2038'; cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(0, -3.6); cx.lineTo(-6, 0); cx.lineTo(0, 3.6); cx.closePath(); cx.fill();
      cx.strokeStyle = p.c; cx.lineWidth = 1.6; cx.stroke(); cx.strokeStyle = '#8fa4c8'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(-10, 0, 2.6, 0, TAU); cx.stroke();
      cx.restore(); continue;
    }
    glow(p.x, p.y, 16, p.c, .6); cx.fillStyle = p.c;
    cx.beginPath(); cx.moveTo(p.x + ca * f, p.y + sa * f); cx.lineTo(p.x - sa * w, p.y + ca * w); cx.lineTo(p.x - ca * p.r, p.y - sa * p.r); cx.lineTo(p.x + sa * w, p.y - ca * w); cx.closePath(); cx.fill();
  }
  Chakram.draw(); W4.draw(); Events.draw();
}
