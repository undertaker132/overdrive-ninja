/* =====================================================================
   SIM — one fixed 60 Hz step: player, director, boss, arena, enemies,
   bullets (parry / graze / reflect), player projectiles, FX
   ===================================================================== */
const RANK_SHIFT = [0, 0, 2, 3, 5, 7, 8];
function onBladeHit() {
  P.ch = Math.min(P.maxCh, P.ch + 1); P.dashT = Math.max(P.dashT, .12); P.swing = -1.9;
  const v14 = simV(15); G.hs = Math.max(G.hs, G.lastCrit ? (v14 ? .095 : .065) : .035); shake(G.lastCrit ? .38 : .18);
  if (G.lastCrit) { punch(.065); flash(.1); FX.streak(P.x, P.y, P.ang, '#ffd700', 6); }
  vibe(G.lastCrit ? 'crit' : 'hit');
  if (P.sig === 'daggers' && ++P.flN >= 6) { P.flN = 0; for (let k = -1; k <= 1; k++) shard(P.x, P.y, P.ang + k * .5, 480, P.ca, 1); FX.text(P.x, P.y - 30, lt('FLURRY'), P.ca, 13); }
}
function hint(id, text) { if (G.hintSeen[id] || Store.data.seen[id] > 2) return; G.hintSeen[id] = 1; Store.data.seen[id] = (Store.data.seen[id] | 0) + 1; G.hint = text; G.hintT = 3.2; }
function tutEnemy(e) { // first sighting of an archetype pauses for a one-line explanation
  const t = e.type;
  if (t === ET.DUMMY) return false;
  if (e.elite && Tut.check('elite', e.x, e.y, e.r + 30)) { Comms.say('elite'); return true; }
  if (t === ET.BRUTE) return Tut.check('shield', e.x, e.y, e.r + 26);
  if (t === ET.SNIPER && e.st === 1) return Tut.check('sniper', e.x, e.y, 40);
  if (t === ET.BOMBER && e.fuse > 0) return Tut.check('bomber', e.x, e.y, 96);
  if (t === ET.PHANTOM && e.st === 3) return Tut.check('phantom', e.x, e.y, 42);
  if (t === ET.WARDEN && e.link) return Tut.check('warden', e.x, e.y, 60);
  if (t === ET.COURIER) return Tut.check('courier', e.x, e.y, 44);
  if (e.mb) return Tut.check('miniboss', e.x, e.y, e.r + 34);
  if (t === ET.MEDIC && e.st === 1) return Tut.check('medic', e.x, e.y, 46);
  if (t === ET.MIMIC && e.st === 1) return Tut.check('mimic', e.x, e.y, 44);
  if (t === ET.MIRROR) return Tut.check('mirror', e.x, e.y, e.r + 30);
  return false;
}
function hitEnemy(e) {
  if (e.hid === P.seq || (e.type === ET.COURIER && e.stT > 0)) return; e.hid = P.seq;
  if (G.stage && G.stage.mod && G.stage.mod.reflectOnly && G.mode === 'story') { // the monastery trial: only their own arrows hurt them
    P.vx *= -.6; P.vy *= -.6; P.ch = P.maxCh; G.hs = .04; Aud.sfx('deny'); FX.spark(e.x, e.y, '#ff9a3d', 8); FX.text(e.x, e.y - e.r - 10, lt('ONLY THEIR OWN SHOTS'), '#ff9a3d', 12);
    hint('reflectOnly', lt('SLASH THEIR SHOTS BACK AT THEM: YOUR BLADE CANNOT HURT THEM HERE')); return;
  }
  if (e.type === ET.MIRROR && P.w.id !== 'spear' && P.w.id !== 'drill') { // the mirror arc bounces your dash away like a rail (the plasma spear pierces it)
    const from = Math.atan2(P.y - e.y, P.x - e.x);
    if (Math.abs(angDiff(from, e.sa)) < 1.05) {
      const nx = Math.cos(from), ny = Math.sin(from), dot = P.vx * nx + P.vy * ny;
      if (dot < 0) { P.vx -= 2 * dot * nx; P.vy -= 2 * dot * ny; }
      P.x = e.x + nx * (e.r + P.r + 2); P.y = e.y + ny * (e.r + P.r + 2);
      P.bounced = true; P.ang = Math.atan2(P.vy, P.vx); P.seq++; P.swing = -1.9; P.sx = .62; P.sy = 1.45; P.dashT = Math.max(P.dashT, .14); e.hid = P.seq;
      FX.ring(e.x + nx * (e.r + 7), e.y + ny * (e.r + 7), 30, '#c9e6ff', 3); FX.spark(e.x + nx * (e.r + 7), e.y + ny * (e.r + 7), '#ffffff', 8);
      FX.text(e.x, e.y - e.r - 14, lt('MIRROR BOUNCE'), '#c9e6ff', 13); Aud.sfx('wall'); Aud.esfx(ET.MIRROR, 1); styleAdd(ST_RICO, 30); G.hs = Math.max(G.hs, .03);
      return;
    }
  }
  const a = Math.atan2(P.vy, P.vx) || P.ang;
  if (e.sh > 0) {
    const from = Math.atan2(P.y - e.y, P.x - e.x), front = Math.abs(angDiff(from, e.ang)) < 1.15;
    if (front && !(P.pw > 0 || P.bounced || P.heat >= 75 || G.odT > 0 || P.w.id === 'spear' || P.w.id === 'drill')) {
      P.vx *= -.8; P.vy *= -.8; P.ch = P.maxCh; G.hs = .045; Aud.sfx('deny'); FX.spark(e.x, e.y, '#00ff88', 8);
      FX.text(e.x, e.y - e.r - 10, lt('BLOCKED'), '#00ff88', 13);
      return;
    }
    e.sh = 0; FX.ring(e.x, e.y, e.r + 22, '#00ff88', 4); FX.call(lt('SHIELD BREAK'), '#00ff88', 1); Aud.sfx('parry', 0); if (e.type === ET.DUMMY && G.mode === 'dojo') Dojo.onShield();
  }
  const spear = P.w.id === 'spear' || P.w.id === 'drill', fists = P.w.id === 'fists';
  if (spear && e.bub) { e.bub = 0; FX.ring(e.x, e.y, e.r + 26, '#4d7cff', 3); } // the spear goes through bubbles too
  let d = calcDmg() * (1 + ((G.cdxB && G.cdxB[e.type]) || 0)); // codex mastery: more damage to an enemy type you have beaten many times
  if (fists && P.sig === 'fists' && ++P.otN >= 3) { P.otN = 0; d *= 3; FX.text(e.x, e.y - e.r - 16, lt('ONE-TWO!'), '#ffd23f', 17, true); shake(.25); }
  if (P.w.id === 'drill') { d *= Math.min(2.5, 1 + .25 * P.drN); P.drN++; W4.cnt.dr = Math.max(W4.cnt.dr | 0, P.drN); }
  const crit = G.lastCrit, killed = damageEnemy(e, d, a, 0); WFX.hit(e.x, e.y, a, crit); W4.onHit(e, d, a, killed);
  if (P.skin.body === 'wolf') { const pc = Math.cos(a + 1.5708), ps = Math.sin(a + 1.5708), c0 = Math.cos(a), s0 = Math.sin(a); for (let k = -1; k <= 1; k++) FX.decal(e.x + pc * k * 7 - c0 * 22, e.y + ps * k * 7 - s0 * 22, e.x + pc * k * 7 + c0 * 22, e.y + ps * k * 7 + s0 * 22, '#ffd23f', 2.5); } // claw marks on the roof
  onBladeHit();
  if (fists && !killed && e.alive && !e.mb) { e.kbx = Math.cos(a) * 860; e.kby = Math.sin(a) * 860; FX.ring(e.x, e.y, e.r + 18, '#ffd23f', 3); } // launched
  if (spear) { // pierce: no bounce back; the signature makes each pierce stretch the dash
    if (P.sig === 'spear') { P.dashT = Math.min(.3, P.dashT + .05); const sp = Math.hypot(P.vx, P.vy) || 1; if (sp < 1300) { P.vx *= 1300 / sp; P.vy *= 1300 / sp; } FX.streak(P.x, P.y, P.ang, '#7df9ff', 4); }
  } else if (!killed && e.alive) { P.vx *= -.45; P.vy *= -.45; }
  if ((crit || P.perks.storm) && P.perks.chain) {
    let n = 0; const nm = P.perks.storm ? 4 : 2;
    for (let i = 0; i < EN.n && n < nm; i++) { const o = EN.a[i]; if (o === e || !o.alive || o.al > 0 || dist(o.x, o.y, e.x, e.y) > 200) continue; FX.bolt(e.x, e.y, o.x, o.y, '#7df9ff', 1); damageEnemy(o, d * .5, a, 3); n++; }
  }
}
function parryBullet(b) {
  const perfect = P.pw > 0;
  b.rf = true; b.vx *= -1.8; b.vy *= -1.8; b.d = perfect ? 2 : 1.4; b.kind = b.kind === 2 ? 0 : b.kind;
  G.combo += perfect ? 2 : 1; G.ct = 3.4; if (G.combo > G.maxCombo) G.maxCombo = G.combo;
  G.score += Math.round((perfect ? 500 : 200) * G.diff.score * G.scoreMul * (perfect && G.mods.snipers ? 3 : 1)); addOD(perfect ? 18 : 8); P.ch = P.maxCh;
  if (P.orb < 6) P.orb++;
  if (P.w.id === 'tessen') tessenParry(b, perfect);
  FX.spark(b.x, b.y, '#ffd700', 10); FX.ring(b.x, b.y, 34, '#ffd700', 2);
  styleAdd(perfect ? ST_PERFECT : ST_PARRY, perfect ? 70 : 35);
  if (perfect) {
    if (G.parries === 0) Comms.say('parry');
    G.parries++; bounty('parry', 1); if (G.parries >= 10) ach('parry10'); G.skill = Math.min(G.diff.dda[1], G.skill + .03);
    if (simV(33)) G.hs = Math.max(G.hs, .035); else { G.hs = Math.max(G.hs, simV(15) ? .14 : .08); G.slowT = .35; G.slowK = .35; } // v33: a crisp beat, no slow motion punch(.09); flash(.18, '#ffd700'); vibe('perfect');
    FX.call(lt('PERFECT PARRY'), '#ffd700', 2); Aud.sfx('parry', 1);
    if (P.perks.nova) for (let k = 0; k < 8; k++) shard(P.x, P.y, k * TAU / 8, 420, '#ffd700', 1.2);
    Dojo.onParry(true);
    if (P.perks.mirror) { P.inv = Math.max(P.inv, 1); addOD(10); FX.ring(P.x, P.y, 70, '#ffd700', 3); }
    if (P.sig === 'katana') iaiWave();
    if (P.sig === 'monarch') ariseShadows();
  } else { FX.text(P.x, P.y - 30, lt('PARRY'), '#7df9ff', 13); Aud.sfx('parry', 0); vibe('parry'); }
}
function homeTo(o, sp, turn, dt) { // steer toward nearest enemy or boss
  let tx = 0, ty = 0, best = 1e9, found = false;
  for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!e.alive || e.al > 0) continue; const q = Math.abs(e.x - o.x) + Math.abs(e.y - o.y); if (q < best) { best = q; tx = e.x; ty = e.y; found = true; } }
  const B = Boss.cur; if (B && B.dying <= 0) { const q = Math.abs(B.x - o.x) + Math.abs(B.y - o.y); if (q < best) { tx = B.x; ty = B.y; found = true; } }
  if (!found) return;
  const cur = Math.atan2(o.vy, o.vx), want = Math.atan2(ty - o.y, tx - o.x), df = angDiff(want, cur), mx = turn * dt;
  const na = cur + (df > mx ? mx : df < -mx ? -mx : df); o.vx = Math.cos(na) * sp; o.vy = Math.sin(na) * sp;
}
function projHits(x, y, r, d, a) { // returns true when a friendly projectile hit something
  for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (e.alive && e.al <= 0 && dist(e.x, e.y, x, y) < e.r + r) { damageEnemy(e, d, a, 4); return true; } }
  const B = Boss.cur;
  if (B && B.dying <= 0 && B.enter >= 1) {
    for (const p of B.parts) if (p.alive && dist(p.x, p.y, x, y) < p.r + r) { Boss.hitPart(B, p, d, a); return true; }
    if (dist(B.x, B.y, x, y) < B.r + r) { Boss.hitBody(B, d, a, false, x, y); return true; }
  }
  for (const n of Arena.nodes) if (n.alive && dist(n.x, n.y, x, y) < n.r + r) { if (n.bub) { n.bub = 0; n.bt = 7; FX.ring(n.x, n.y, n.r + 22, '#4d7cff', 3); return true; } n.hp -= d; n.fl = 1; if (n.hp <= 0) { n.alive = false; G.objV++; FX.boom(n.x, n.y, 130, '#7df9ff'); } return true; }
  return false;
}
function sim(dt, rd) {
  FX.update(dt, rd); // effects age every step (slash arcs, sparks, numbers, rings)
  if (G.msgT > 0) G.msgT -= rd; if (G.hintT > 0) G.hintT -= rd; if (G.rankPop > 0) G.rankPop -= rd * 3;
  if (G.odT > 0) { G.odT -= rd; if (G.odT <= 0) { FX.text(P.x, P.y - 30, lt('OVERDRIVE ENDED'), '#ffd700', 13); } }
  if (G.combo > 0) { G.ct -= dt; if (G.ct <= 0) { if (G.combo >= 10) FX.text(P.x, P.y - 40, ltf('COMBO x{0} ENDED', G.combo), '#8fa4c8', 13); G.combo = 0; } }
  styleDecay(dt);
  const rk = G.styleRk; Aud.shift = RANK_SHIFT[rk];
  Aud.intensity = G.odT > 0 || (Boss.cur && Boss.cur.ph >= 3) || rk >= 4 ? 3 : (rk >= 3 || Boss.cur) ? 2 : 1;
  if (P.hp === 1 && G.time % 1.1 < dt) Aud.sfx('heart');

  if (P.x !== P.x || P.y !== P.y || P.vx !== P.vx || P.vy !== P.vy) { P.x = V.CX; P.y = V.VH * .6; P.vx = P.vy = 0; }
  const dashing = P.dashT > 0;
  updatePlayer(dt, rd);
  Pet.update(dt);
  if (G.state !== 'PLAY') return;
  Director.update(dt, rd);
  Boss.update(dt, rd);
  Boss.collide(dashing);
  Arena.update(dt, dashing); Arena.tickPend(rd);
  if (G.state !== 'PLAY') return;

  // enemies
  const hitR = P.r + (dashing ? 22 * P.reach + P.w.reach : 0);
  for (let i = 0; i < EN.n; i++) {
    const e = EN.a[i]; if (!e.alive) continue;
    if (e.x !== e.x || e.y !== e.y) { e.alive = false; continue; } // NaN guard
    updateEnemy(e, dt); if (!e.alive || e.al > 0 || e.spawnT > 0) continue;
    if (!Tut.cur && e.y > 60 && e.y < V.VH - G.dockL - 50 && tutEnemy(e)) return;
    const d = dist(P.x, P.y, e.x, e.y);
    if (dashing) { if (d < hitR + e.r && e.vis > .3 && !(e.alt > .35)) hitEnemy(e); } // (a sky diver high above is out of reach)
    else if (d < P.r + e.r - 2 && e.vis > .3 && !(e.alt > .35)) {
      if (e.type === ET.COURIER || e.type === ET.TREASURE || e.type === ET.DUMMY) continue;
      if (e.type === ET.BOMBER) { bomberBlast(e); continue; }
      if (hurt('touch', e.type)) {
        if (e.type === ET.DRONE || e.type === ET.MINI || e.type === ET.PHANTOM || e.type === ET.CLONE) { e.alive = false; FX.spark(e.x, e.y, e.col, 12); }
        else { const a = Math.atan2(e.y - P.y, e.x - P.x); e.x += Math.cos(a) * 40; e.y += Math.sin(a) * 40; }
      }
    }
    if (G.state !== 'PLAY') return;
  }
  EN.sweep();

  // hostile + reflected bullets
  for (let i = 0; i < BU.n; i++) {
    const b = BU.a[i]; if (!b.alive) continue; b.t += dt;
    if (b.x !== b.x || b.vx !== b.vx) { b.alive = false; continue; }
    if (b.rf) homeTo(b, Math.hypot(b.vx, b.vy), 3, dt);
    else if (b.kind === 2) { const sp = Math.hypot(b.vx, b.vy) || 1, cur = Math.atan2(b.vy, b.vx), want = Math.atan2(P.y - b.y, P.x - b.x), df = angDiff(want, cur), mx = 1.8 * dt, na = cur + (df > mx ? mx : df < -mx ? -mx : df); b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp; if (b.t > 6) b.alive = false; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < -40 || b.x > V.VW + 40 || b.y < -40 || b.y > V.VH + 40) { b.alive = false; continue; }
    if (!b.rf) {
      const d = dist(P.x, P.y, b.x, b.y);
      if (d < 230 && !dashing && Tut.check('bullet', b.x, b.y, 36)) return;
      if (dashing && d < hitR + b.r + 6) parryBullet(b);
      else if (!dashing && d < P.r + b.r - 3) { if (P.inv <= 0 && G.odT <= 0) { b.alive = false; if (Pet.shell > 0 && G.pet === 'turtle') { Pet.shell--; Pet.blocks++; Pet.happy = .8; FX.ring(P.x, P.y, 34, '#5ee6a8', 4); FX.spark(b.x, b.y, '#5ee6a8', 8); Aud.sfx('parry', 0); continue; } hurt('bullet', b.o); if (G.state !== 'PLAY') return; } }
      else if (!dashing && !b.gz && d < P.r + b.r + 22) {
        b.gz = true; G.grazes++; bounty('graze', 1); G.score += Math.round(100 * G.diff.score * G.scoreMul);
        addOD(P.perks.graze ? 10 : 5); if (P.perks.graze || P.tal.grazer) P.ch = Math.min(P.maxCh, P.ch + 1);
        FX.ring(b.x, b.y, 16, '#7df9ff', 2); Aud.sfx('graze'); styleAdd(ST_GRAZE, 15); hint('graze', lt('NEAR MISSES CHARGE OVERDRIVE'));
      }
    } else { G.rfHit = 1; const hit = projHits(b.x, b.y, b.r, b.d * P.dmgMul * G.dmgMod, Math.atan2(b.vy, b.vx)); G.rfHit = 0; if (hit) { b.alive = false; FX.spark(b.x, b.y, P.ca, 6); } }
  }
  BU.sweep();

  // player projectiles (shards, turret shots, stolen cannon)
  for (let i = 0; i < PB.n; i++) {
    const p = PB.a[i]; p.l -= dt; if (p.l <= 0) { p.alive = false; continue; }
    if (p.hm) homeTo(p, 540, 7, dt);
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < -40 || p.x > V.VW + 40 || p.y < -40 || p.y > V.VH + 40) { p.alive = false; continue; }
    if (projHits(p.x, p.y, p.r, p.d * P.dmgMul * G.dmgMod, Math.atan2(p.vy, p.vx))) { p.alive = false; FX.spark(p.x, p.y, p.c, 6); }
  }
  PB.sweep();
  Chakram.update(dt); W4.update(dt); Events.update(dt);

  // live "challenge this player" target
  const ch = Store.data.chal;
  if (ch && ch.m === G.mode && !G.chalDone && G.score > ch.s) {
    G.chalDone = true; Store.data.credits += 200; Store.touch(); toast(ltf('YOU BEAT {0}! +200 CREDITS', ch.n.toUpperCase()), '#00ff88'); Aud.sfx('win'); Aud.say('Challenge complete');
  }
}
