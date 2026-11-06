/* =====================================================================
   PLAYER — dash-slash, chain slash, crit model, heat, parry, overdrive,
   tactical skills, laser drone, stolen boss cannon, time echo
   ===================================================================== */
function applyLoadout() {
  const d = Store.data, u = d.upg, st = d.settings;
  P.w = G.mode === 'puzzle' ? WEAPONS[0] : WEAPONS.find(w => w.id === d.weapon) || WEAPONS[0]; // puzzles: everyone dashes the same
  const sk = skinLook(d.skin); P.skin = sk; P.ca = sk.a; P.cb = sk.b; P.fx = bladeOf(d.blade);
  P.hmLv = REPLAY.on ? (REPLAY.hdr.hm | 0) : heroLevel(d.skin); P.poseS = 0; // hero mastery (a replay uses the recorded level)
  const dh = G.diff.hp;
  P.maxHp = dh === -100 ? 1 : dh === -99 ? 2 : Math.max(2, 3 + u.shield + dh);
  if (G.mods.glass) P.maxHp = 1;
  if (G.ctr && G.ctr.glass) P.maxHp = 1; // contract: glass body
  P.maxHp += clamp(st.ahp | 0, 0, 2); // assist mode: extra shields
  P.maxCh = P.w.ch + (G.mode === 'highway' ? 1 : 0); P.rc = Math.max(.3, .66 - u.cool * .04);
  P.cdMul = 1 - u.cool * .05; P.pwMax = Math.max(.08, .15 + u.parry * .025 + G.diff.parry) + (P.w.id === 'tessen' ? .05 : 0);
  P.magR = 100 + u.magnet * 32 + (G.pet === 'kaya' ? 60 + 20 * ((G.petLv || 1) - 1) : 0); P.heatCool = 12 + u.heat * 3;
  P.dmgMul = 1 + u.dmg * .15; P.critAdd = 0; P.reach = 1; P.heatMul = 1; P.odMul = 1; P.credMul = 1; P.vampN = 0; P.wind = 0; P.perks = {};
  const ml = masteryLevel(P.w.id); P.mlv = ml; P.sig = ml >= 2 ? P.w.id : ''; P.flN = 0; P.reapN = 0; P.kuN = 0; P.wcr = 0; P.otN = 0; P.dcr = 0; P.shd = 0; P.ncr = 0; P.ncr2 = 0; Chakram.reset(); W4.reset();
  if (ml >= 1) P.dmgMul *= 1.05; if (ml >= 3) P.critAdd += .08; if (ml >= 4) P.maxCh += 1;
  P.tal = {}; // star talents (a replay uses the talents the recorded run had)
  if (REPLAY.on) { for (const id of REPLAY.hdr.tal || []) P.tal[id] = 1; }
  else { const stars = Store.stars(); for (let i = 0; i < TALENTS.length; i++) { const T = TALENTS[i], pk = d.talents[i]; if ((pk === 'a' || pk === 'b') && stars >= T.need) P.tal[T[pk].id] = 1; } }
  if (P.tal.quick) P.rc *= .88; if (P.tal.steady) P.heatMul *= .85; if (P.tal.scav) P.credMul *= 1.15; if (P.tal.keen) P.critAdd += .1; if (P.tal.surge) P.cdMul *= .8;
  P.lockMax = P.tal.lockon ? 5 : 4;
  if (G.ctr) { if (G.ctr.noparry) P.pwMax = 0; if (G.ctr.hot) P.heatMul *= 1.5; if (G.ctr.clock) P.rc *= 1.3; } // contracts
  P.evo = {}; const ev = d.skillEvo || {}; for (const k in SKILL_EVO) if (ev[k]) P.evo[k] = 1; // evolved skills (a replay uses the recorded ones)
  armsLoadout(); // weapon tree and second weapon
}
function resetPlayer() {
  applyLoadout();
  P.hp = P.maxHp; P.ch = P.maxCh; P.rt = 0; P.x = V.CX; P.y = V.VH * .62; P.vx = P.vy = 0;
  P.dashT = P.pw = P.lock = P.heat = 0; P.inv = 1; P.ang = P.face = P.mvA = -Math.PI / 2; P.spd = 0; P.walkPh = 0; P.swing = 0; P.sx = P.sy = 1; P.bounced = false; P.wallRunT = 0;
  P.cds.grapple = P.cds.hijack = P.cds.web = P.cds.echo = 0; P.dodgeCd = 0; P.stolen = 0; P.stolenCd = 0; P.orb = 0; P.nlk = 0; P.ncq = 0; P.cqi = 0;
  P.dA = 0; P.dCd = 1; P.seq = 0; P.anim = 0; P.aft = 0; P.gch = 0; P.gchT = 0; P.glast = -1; P.gprev = -1; // every run starts from the same player state (replays depend on it)
  P.lastStand = 0; P.regT = 0; P.trT = 0; G.vampK = 0; if (G.mods.vampire) P.hp = 1; if (P.tal.headstart) G.od = 40;
  for (let i = 0; i < 10; i++) { P.scarf[i * 2] = P.x; P.scarf[i * 2 + 1] = P.y; }
}
function slash(a) {
  if (G.mode === 'puzzle') { if (!Puzzle.ready()) return; Puzzle.onSlash(); }
  if (REC.live()) { const q = qAng(a); a = dqAng(q); REC.act(RA.SLASH, q); } // recorded runs use the exact angle the replay will use
  const w = P.w, sp = w.speed;
  P.vx = Math.cos(a) * sp; P.vy = Math.sin(a) * sp; P.dashT = .24; P.pw = P.pwMax; P.inv = Math.max(P.inv, simV(37) ? .12 : .26); P.bounced = false;
  if (G.odT <= 0) P.ch--; P.rt = P.rc; P.ang = a; P.seq++; P.swing = -1.9; P.sx = 1.6; P.sy = .58;
  P.heat += w.heat * P.heatMul * (G.odT > 0 ? .3 : 1);
  if (P.heat >= 75 && P.heat < 100) Tut.check('heat', HUD.hx || 70, 92, 54);
  if (P.heat >= 100 && G.odT <= 0) {
    if (P.perks.reactor) { P.heat = 25; G.odT = 2; P.ch = P.maxCh; FX.call(lt('COLD REACTOR'), '#7df9ff', 2); FX.ring(P.x, P.y, 140, '#7df9ff', 4); Aud.sfx('od'); }
    else { P.lock = 1.3; P.heat = 62; FX.call(lt('OVERHEAT'), '#ff3b3b', 2); Aud.sfx('deny'); FX.spark(P.x, P.y, '#ff6a00', 14); }
  }
  const ac = G.odT > 0 ? '#ffd700' : fxArcColor();
  FX.arc(P.x + Math.cos(a) * 10, P.y + Math.sin(a) * 10, a, 40 * P.reach + w.reach, ac, 6); FX.streak(P.x, P.y, a + Math.PI, ac, 7);
  FX.decal(P.x, P.y, P.x + Math.cos(a) * sp * .18, P.y + Math.sin(a) * sp * .18, ac, 3.5); WFX.swing(a);
  Aud.sfx('slash', G.combo);
  Pet.onDash();
  if (w.id === 'kunai') throwKunai(a);
  else if (w.id === 'whip') P.wcr = 1; // the chain cracks when this dash ends
  else if (w.id === 'dominator') P.dcr = 1; // the barrel fires when this dash ends
  else if (w.id === 'nodachi') P.ncr = 1; // the circle cut when this dash ends
  else if (w.id === 'chakram') Chakram.toss(a);
  W4.onSlash(a); Events.onSlash(a);
  if (w.id === 'scythe') {
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || e.type === ET.COURIER) continue; const d = dist(e.x, e.y, P.x, P.y); if (d < 240) { e.x += (P.x + Math.cos(a) * 90 - e.x) * .35; e.y += (P.y + Math.sin(a) * 90 - e.y) * .35; } }
    FX.ring(P.x, P.y, 240, '#b537f2', 2);
  }
  if (P.orb > 0) { // release absorbed bullets as homing shards
    for (let k = 0; k < (P.shd | 0); k++) { const a = -CAM.t * 3 + k * TAU / P.shd, r = 26 + Math.sin(CAM.t * 5 + k) * 3, x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r; hglow(x, y, 16, '#9b5bff', .7); cx.fillStyle = '#1a0830'; dot(x, y, 3.4); cx.fillStyle = '#c9a8ff'; dot(x + 1, y - 1, 1.2); }
  for (let k = 0; k < P.orb; k++) { const b = a + (k - (P.orb - 1) / 2) * .35; shard(P.x, P.y, b, 460, P.ca, 1.5); }
    FX.text(P.x, P.y - 30, ltf('VORTEX x{0}', P.orb), P.ca, 13); P.orb = 0;
  }
}
function dodge(a) { // movement without a charge: a short sidestep with brief invulnerability
  if (P.dodgeCd > 0 || G.state !== 'PLAY') return false;
  if (REC.live()) { const q = qAng(a); a = dqAng(q); REC.act(RA.DODGE, q); }
  P.vx = Math.cos(a) * 640; P.vy = Math.sin(a) * 640; P.inv = Math.max(P.inv, .26); P.dodgeCd = 1.05; P.mvA = a;
  FX.streak(P.x, P.y, a + Math.PI, '#ffffff', 5); FX.ring(P.x, P.y, 34, '#ffffff', 2); Aud.sfx('warp'); vibe('dodge'); styleAdd(ST_DODGE, 12); Dojo.onDodge();
  return true;
}
function startChain() {
  if (REC.live()) { const ids = []; for (let k = 0; k < P.nlk; k++) { const e = P.lk[k]; if (e && e.alive && e.gen === P.lkg[k]) ids.push(e.uid); } REC.act(RA.CHAIN, ids); }
  REC.depth++; try { startChain0(); } finally { REC.depth--; }
}
function startChain0() {
  P.ncq = 0;
  for (let k = 0; k < P.nlk; k++) { const e = P.lk[k]; if (e && e.alive && e.gen === P.lkg[k]) { P.cq[P.ncq] = e; P.cqg[P.ncq] = e.gen; P.ncq++; } }
  P.nlk = 0; P.cqi = 0;
  if (P.ncq === 0) return;
  const e = P.cq[0]; P.cqi = 1;
  slash(Math.atan2(e.y - P.y, e.x - P.x));
  if (P.ncq > 1) { FX.call(ltf('CHAIN x{0}', P.ncq), '#ffd700', 2); Aud.say('Chain'); }
  if (G.mode === 'dojo') Dojo.onChain(P.ncq);
}
function chainStep() { // called each sim step: next link fires near the end of each dash
  if (P.cqi <= 0 || P.cqi >= P.ncq || P.dashT > .06) return;
  while (P.cqi < P.ncq) {
    const e = P.cq[P.cqi], g = P.cqg[P.cqi]; P.cqi++;
    if (e && e.alive && e.gen === g) { const c = P.ch; slash(Math.atan2(e.y - P.y, e.x - P.x)); P.ch = c; return; }
  }
}
function calcDmg() {
  const w = P.w, spd = Math.hypot(P.vx, P.vy), hot = P.heat >= 75;
  const ch = w.crit + clamp((spd - 400) / 1000, 0, 1) * .25 + (hot ? .1 : 0) + (G.odT > 0 ? .2 : 0) + P.critAdd;
  const crit = P.pw > 0 || P.bounced || R.f() < ch;
  let d = w.dmg * P.dmgMul * (hot ? 1.25 : 1) * (G.odT > 0 ? 2 : 1) * G.dmgMod * (P.tal.berserk && P.hp === 1 ? 1.25 : 1);
  G.lastCrit = crit; if (crit) { d *= w.cm * P.cmMul; G.crits++; bounty('crit', 1); }
  if (P.swapT > 0) d = swapStrike(d);
  return d;
}
function addOD(n) {
  if (G.odT > 0) return; if (P.hp === 1) n *= 1.6; const was = G.od; G.od = Math.min(100, G.od + n * P.odMul);
  if (was < 100 && G.od >= 100 && P.has.od) { Comms.say('od'); const d = dockCenter('od') || { x: V.VW - 50, y: V.VH - 40, r: 34 }; Tut.check('od', d.x, d.y, d.r); } // always checked: replays must see the same tip
}
function hurt(src, who) {
  if (P.inv > 0 || (P.dashT > 0 && (!simV(37) || P.dashT > .12)) || G.odT > 0 || G.state !== 'PLAY') return false; // v37: only the start of a dash is safe
  if (G.mode === 'dojo') { P.inv = .8; shake(.3); flash(.2, '#ff0844'); FX.call(lt('HIT! (NO DAMAGE IN THE DOJO)'), '#ff3b5c', 2, 15); Aud.sfx('hurt'); return true; }
  G.lastHit = src; G.lastWho = who == null ? -1 : who; P.regT = 0;
  if (P.skin.body === 'skull') FX.spark(P.x, P.y, '#e8e2d0', 16); // the skeleton rattles apart, then snaps back
  for (const t of Arena.terms) if (!t.done && dist(P.x, P.y, t.x, t.y) < t.zr + 10) t.p = Math.max(0, t.p - .3);
  P.hp--; G.hits++; P.inv = 1.25; G.combo = 0; P.otN = 0; styleHurt(); if (P.hp === 1) Comms.say('low', true); P.heat = Math.max(0, P.heat - 30);
  G.skill = Math.max(G.diff.dda[0], G.skill - (simV(37) && G.di >= 1 ? .06 : .12)); G.hs = .08; shake(.65); flash(.35, '#ff0844'); glitch(.25); vibe('hurt');
  P.sx = 1.4; P.sy = .6; Aud.sfx('hurt'); FX.spark(P.x, P.y, '#ff0844', 20, 1.2); FX.call(lt('SHIELD BREACH'), '#ff0844', 2);
  if (P.hp <= 0 && G.stage && G.stage.safe && G.mode === 'story') { P.hp = P.maxHp; P.inv = 2; FX.call(lt('SHIELDS REBOOTED'), '#00ff88', 3); hint('safe', lt('SLASH DRONES BEFORE THEY TOUCH YOU')); return true; }
  if (P.hp <= 0 && P.tal.laststand && !P.lastStand) { P.lastStand = 1; P.hp = 1; P.inv = 2; FX.ring(P.x, P.y, 220, '#ff3b5c', 6); FX.call(lt('LAST STAND'), '#ff3b5c', 3); Aud.sfx('od'); return true; }
  if (P.hp <= 0) {
    if (P.perks.wind && !P.wind) { P.wind = 1; P.hp = 2; G.od = 100; P.inv = 2; FX.ring(P.x, P.y, 300, '#ffd700', 6); FX.call(lt('SECOND WIND'), '#ffd700', 3); Aud.say('Second wind', 1); return true; }
    if (G.mode === 'tower' && Tower.revive()) return true;
    Flow.over(false); return true;
  }
  if (P.hp === 1) { hint('last', lt('LAST SHIELD: OVERDRIVE CHARGES FASTER AND REPAIRS A SHIELD')); }
  return true;
}
function overdrive() {
  if (G.state !== 'PLAY' || !P.has.od || G.od < 100 || G.odT > 0 || G.freeze > 0) return;
  REC.act(RA.OD);
  if (P.w.id === 'monarch') ariseShadows();
  G.od = 0; G.odT = 5 + (P.hp === 1 ? 1.5 : 0) + (P.tal.odlong ? 1.5 : 0) + (P.perks.mask ? 2.5 : 0);
  if (P.hp === 1) { P.hp = 2; FX.text(P.x, P.y - 40, lt('+1 SHIELD'), '#00ff88', 15); }
  P.ch = P.maxCh; P.heat = 0; P.lock = 0; G.hs = .12; G.slowT = .6; G.slowK = .3;
  shake(.8); flash(.7, '#ffd700'); punch(.12); glitch(.3); vibe('od');
  FX.ring(P.x, P.y, Math.max(V.VW, V.VH), P.ca, 8); FX.ring(P.x, P.y, 260, '#ffd700', 5);
  for (let i = 0; i < BU.n; i++) { const b = BU.a[i]; if (!b.rf) { b.rf = true; b.vx *= -1.6; b.vy *= -1.6; } }
  for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && dist(e.x, e.y, P.x, P.y) < 260) { e.sh = 0; e.bub = 0; damageEnemy(e, 2 * G.dmgMod, Math.atan2(e.y - P.y, e.x - P.x), 1); } }
  Aud.sfx('od'); Aud.say('Overdrive', 1); FX.call(lt('OVERDRIVE'), '#ffd700', 3, 34);
  if ((P.hmLv | 0) >= 4) heroBurst(); // hero mastery 4
}
/* ---------------- tactical skills ---------------- */
function useSkill(id) {
  if (G.state !== 'PLAY' || G.freeze > 0 || !P.has[id] || P.cds[id] > 0) return;
  REC.act(RA.SKILL, SKILL_IDS.indexOf(id));
  if (P.dashT > .08 && simV(15)) { // dash cancel: the skill cuts the dash short, for a little heat
    P.dashT = 0; P.vx *= .15; P.vy *= .15; P.heat = Math.min(90, P.heat + 6 * P.heatMul);
    FX.spark(P.x, P.y, '#00f2fe', 12); if (CAM.t - (P.dcT || -9) > 1.5) { P.dcT = CAM.t; FX.text(P.x, P.y - 34, lt('DASH CANCEL'), '#00f2fe', 13); }
  }
  const def = SKILLS.find(s => s.id === id), cd = def.cd * P.cdMul * (P.perks.chrono ? .7 : 1) * (G.mods.mayhem ? .5 : 1) * (P.evo[id] ? SKILL_EVO[id].cd : 1);
  let ok = false;
  if (id === 'grapple') ok = skGrapple();
  else if (id === 'hijack') ok = skHijack();
  else if (id === 'web') ok = skWeb();
  else if (id === 'echo') ok = skEcho();
  if (ok) {
    P.cds[id] = cd; UI.dockDirty = true;
    const u = Store.data.skillUse || (Store.data.skillUse = {}), n = (u[id] | 0) + 1; u[id] = n; Store.touch(); // uses unlock the evolution
    if (n === SKILL_EVO[id].need && !REPLAY.on) toast(ltf('{0} CAN EVOLVE IN THE ARSENAL', lt(def.name)), '#ffd700');
    Season.track('skills', 1);
  } else Aud.sfx('deny');
}
function nearestEnemy(x, y, maxD, skipAllies) {
  let best = null, bd = maxD;
  for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || (skipAllies && e.al > 0) || e.vis < .3 || e.alt > .35) continue; const d = dist(e.x, e.y, x, y); if (d < bd) { bd = d; best = e; } }
  return best;
}
function skGrapple() {
  let tx, ty, e = nearestEnemy(P.x, P.y, 460, true);
  const b = Boss.cur;
  if (b && (!e || dist(b.x, b.y, P.x, P.y) < dist(e.x, e.y, P.x, P.y))) { tx = b.x; ty = b.y; e = null; }
  else if (e) { tx = e.x; ty = e.y; } else return false;
  grappleTo(tx, ty, b && !e ? b : null);
  P.glast = e ? e.uid : -1; P.gprev = -1; if (P.evo.grapple) { P.gch = 2; P.gchT = .24; } // chain grapple: two more hops
  FX.call(lt(P.evo.grapple ? 'CHAIN GRAPPLE' : 'GRAPPLE SLAM'), '#00ff88', 1); Aud.say('Grapple');
  return true;
}
function grappleHop() { // chain grapple: jump on to the nearest other enemy
  let best = null, bd = 460;
  for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || e.vis < .3 || e.alt > .35 || e.uid === P.glast || e.uid === P.gprev || e.spawnT > 0) continue; const d = dist(e.x, e.y, P.x, P.y); if (d < bd && d > 30) { bd = d; best = e; } }
  if (!best) return false;
  P.gprev = P.glast; P.glast = best.uid; grappleTo(best.x, best.y, null); FX.text(P.x, P.y - 34, lt('HOP'), '#00ff88', 13); return true;
}
function grappleTo(tx, ty, b) {
  const a = Math.atan2(ty - P.y, tx - P.x);
  FX.bolt(P.x, P.y, tx, ty, '#00ff88', 1.2);
  P.x = clamp(tx - Math.cos(a) * 34, V.L + P.r, V.R - P.r); P.y = clamp(ty - Math.sin(a) * 34, P.r, V.VH - P.r);
  P.inv = Math.max(P.inv, .5); P.ang = a; P.ch = P.maxCh; G.hs = .07;
  friendlyBlast(tx, ty, 150, 2.2);
  if (b) Boss.hitBody(b, 3 * P.dmgMul * G.dmgMod, a, true);
  Aud.sfx('boom', 0);
}
function skHijack() {
  let n = 0;
  for (let pass = 0, np = P.evo.hijack ? 4 : 2; pass < np; pass++) {
    let best = null, bd = 1e9;
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i]; if (!e.alive || e.al > 0 || e.alt > .35 || e.mb || e.nem || e.type === ET.COURIER || e.type === ET.CLONE || e.type === ET.TREASURE) continue;
      const d = dist(e.x, e.y, P.x, P.y); if (d < bd) { bd = d; best = e; }
    }
    if (!best) break;
    best.al = 8; best.sh = 0; best.bub = 0; best.fuse = 0; n++;
    FX.bolt(P.x, P.y, best.x, best.y, '#00f2fe', 1); FX.spark(best.x, best.y, '#00f2fe', 14);
  }
  if (!n) return false;
  bounty('hijack', n); ach('hijack');
  FX.call(ltf(P.evo.hijack ? 'MIND STORM x{0}' : 'HIJACKED x{0}', n), '#00f2fe', 1); Aud.sfx('hack', 2); Aud.say('Hijack');
  return true;
}
function skWeb() {
  for (let k = -1; k <= 1; k++) {
    const t = TETH.get(); if (!t) break; const y = clamp(P.y + k * 80, 60, V.VH - 60);
    t.x1 = V.L; t.y1 = y - 22 * k; t.x2 = V.R; t.y2 = y + 22 * k; t.l = 6;
  }
  if (P.evo.web) { // laser cage: two upright wires close the box
    for (let k = -1; k <= 1; k += 2) { const t = TETH.get(); if (!t) break; const x = clamp(P.x + k * 95, V.L + 18, V.R - 18); t.x1 = x - 14 * k; t.y1 = 30; t.x2 = x + 14 * k; t.y2 = V.VH - 30; t.l = 6; }
    FX.call(lt('LASER CAGE'), '#ffd700', 1);
  }
   Aud.sfx('laser'); Aud.say('Laser web');
  return true;
}
function skEcho() {
  const o = ECHO.get(); if (!o) return false;
  o.x = P.x; o.y = P.y; o.vx = o.vy = 0; o.l = 7; o.cd = .15; o.ang = P.ang; o.seq = 0;
  if (P.evo.echo) { const o2 = ECHO.get(); if (o2) { o2.x = clamp(P.x + 40, V.L + 16, V.R - 16); o2.y = P.y; o2.vx = o2.vy = 0; o2.l = 7; o2.cd = .4; o2.ang = P.ang; o2.seq = 0; o.x = clamp(P.x - 40, V.L + 16, V.R - 16); } }
  P.hp = Math.min(P.maxHp, P.hp + 1);
  FX.ring(P.x, P.y, 120, '#b537f2', 4); FX.text(P.x, P.y - 34, lt('+1 SHIELD'), '#c45bff', 14); Aud.sfx('warp'); Aud.say('Time echo');
  return true;
}
/* ---------------- weapon mastery: slash kills level each blade (stored per blade) ---------------- */
function masteryKill(e, a) {
  const id = P.w.id, m = Store.data.mastery, xp = (m[id] | 0) + 1; m[id] = xp;
  const lv = MASTERY_XP.indexOf(xp); if (lv > 0) masteryUp(lv);
  if (P.w.id === 'monarch' && P.shd < (P.sig === 'monarch' ? 6 : 3)) { P.shd++; FX.spark(e.x, e.y, '#9b5bff', 6); }
  if (P.sig === 'hammer' && P.bounced) quake(e.x, e.y);
  else if (P.sig === 'scythe') {
    for (let i = 0; i < CO.n; i++) if (CO.a[i].t < 6) CO.a[i].t = 6.01; // every credit on the roof flies to you
    if (++P.reapN >= 20) { P.reapN = 0; if (P.hp < P.maxHp) { P.hp++; FX.text(P.x, P.y - 40, lt('REAP +1 SHIELD'), '#c45bff', 15); } }
  } else if (P.sig === 'muramasa') for (let k = -1; k <= 1; k += 2) shard(e.x, e.y, a + k * .7, 420, '#ff0844', 1);
}
function masteryUp(lv) {
  if (lv === 1) P.dmgMul *= 1.05; else if (lv === 2) P.sig = P.w.id; else if (lv === 3) P.critAdd += .08; else if (lv === 4) { P.maxCh++; P.ch++; }
  P.mlv = lv; Store.touch(); Aud.sfx('star', 2);
  FX.call(ltf('MASTERY {0}', lv), '#ffd700', 3, 24);
  toast(lv === 2 ? ltf('SIGNATURE UNLOCKED: {0}', lt(SIGS[P.w.id].n)) : lt(P.w.name) + ': ' + lt(MASTERY_PERKS[lv]).toUpperCase(), '#ffd700');
}
function quake(x, y) { // hammer signature: a kill right after a wall bounce cracks the roof
  FX.ring(x, y, 110, '#ffd700', 5); FX.spark(x, y, '#ffd700', 10); shake(.3);
  for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && dist(e.x, e.y, x, y) < 110 + e.r) { e.sh = 0; damageEnemy(e, 2 * P.dmgMul * G.dmgMod, Math.atan2(e.y - y, e.x - x), 2); } }
}
function iaiWave() { // katana signature: a perfect parry answers with a slashing wave
  const a = P.ang, dmg = 1.5 * P.w.dmg * P.dmgMul * G.dmgMod;
  FX.arc(P.x, P.y, a, 150, '#ffffff', 10); FX.arc(P.x, P.y, a, 118, P.ca, 6); FX.text(P.x, P.y - 34, lt('IAI'), '#ffffff', 15, true);
  for (let i = 0; i < EN.n; i++) {
    const e = EN.a[i]; if (!e.alive || e.al > 0) continue;
    const dx = e.x - P.x, dy = e.y - P.y; if (dx * dx + dy * dy > (150 + e.r) * (150 + e.r) || Math.abs(angDiff(Math.atan2(dy, dx), a)) > 1.05) continue;
    e.sh = 0; damageEnemy(e, dmg, Math.atan2(dy, dx), 3);
  }
  const B = Boss.cur;
  if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, P.x, P.y) < 150 + B.r && Math.abs(angDiff(Math.atan2(B.y - P.y, B.x - P.x), a)) < 1.05) Boss.hitBody(B, dmg, a, false, P.x, P.y);
}
function friendlyBlast(x, y, r, dmg) {
  FX.boom(x, y, r, '#00ff88');
  for (let i = 0; i < EN.n; i++) {
    const e = EN.a[i]; if (!e.alive || e.al > 0) continue;
    if (dist(e.x, e.y, x, y) < r + e.r) { e.sh = 0; e.bub = 0; damageEnemy(e, dmg * P.dmgMul * G.dmgMod, Math.atan2(e.y - y, e.x - x), 2); }
  }
  Arena.blast(x, y, r);
}
function shard(x, y, a, s, c, d) { const p = PB.get(); if (!p) return; p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.r = 6; p.c = c; p.d = d; p.l = 2.5; p.hm = 1; p.k = 0; }
/* ---------------- weapon mechanics: kunai, chain whip ---------------- */
function throwKunai(a) { // a fan of straight throwing knives with every dash (every 4th dash: 6 with the signature)
  const rain = P.sig === 'kunai' && ++P.kuN >= 4; if (rain) P.kuN = 0;
  const n = rain ? 6 : 3, sp = rain ? .2 : .22;
  for (let k = 0; k < n; k++) {
    const b = a + (k - (n - 1) / 2) * sp, p = PB.get(); if (!p) break;
    p.x = P.x + Math.cos(b) * 14; p.y = P.y + Math.sin(b) * 14; p.vx = Math.cos(b) * 980; p.vy = Math.sin(b) * 980; p.r = 6; p.c = '#c9d6ff'; p.d = .5 * P.w.dmg; p.l = .5; p.hm = 0; p.k = 1;
  }
  if (rain) { FX.text(P.x, P.y - 30, lt('SHADOW RAIN'), '#c9d6ff', 13); Aud.sfx('lock', 3); }
}
function dominatorBlast() { // a point-blank spray of plasma pellets along the dash
  const a = P.ang, pb = P.sig === 'dominator', n = 5;
  for (let k = 0; k < n; k++) {
    const b = a + (k - (n - 1) / 2) * .13, p = PB.get(); if (!p) break;
    p.x = P.x + Math.cos(b) * 18; p.y = P.y + Math.sin(b) * 18; p.vx = Math.cos(b) * 900; p.vy = Math.sin(b) * 900; p.r = 5; p.c = '#ff9a3d'; p.d = (pb ? .66 : .44) * P.w.dmg; p.l = .3; p.hm = 0; p.k = 1;
  }
  FX.spark(P.x + Math.cos(a) * 22, P.y + Math.sin(a) * 22, '#ffd23f', 10); FX.ring(P.x + Math.cos(a) * 22, P.y + Math.sin(a) * 22, 26, '#ff9a3d', 3); shake(.18); Aud.sfx('laser'); WFX.shells(a);
  if (pb) { P.vx -= Math.cos(a) * 320; P.vy -= Math.sin(a) * 320; }
}
function ariseShadows(why) { // SOVEREIGN DAGGERS: every stored shadow hunts the nearest enemy
  const n = P.shd | 0; if (!n) return; P.shd = 0;
  for (let k = 0; k < n; k++) shard(P.x, P.y, P.ang + k * TAU / n, 380, '#9b5bff', 1.6 * P.w.dmg);
  FX.call(lt('ARISE!'), '#9b5bff', 2, 22); FX.ring(P.x, P.y, 120, '#9b5bff', 4); Aud.sfx('warp');
}
function whipCrack() { // the chain cracks a wide arc in front of you as the dash ends
  const a = P.ang, R0 = 112 + (P.reach - 1) * 40, dmg = .85 * P.w.dmg * P.dmgMul * G.dmgMod; let n = 0;
  FX.arc(P.x, P.y, a, R0, '#ffffff', 8); FX.arc(P.x, P.y, a, R0 - 18, fxArcColor(), 5); Aud.sfx('slash', 3);
  for (let i = 0; i < EN.n; i++) {
    const e = EN.a[i]; if (!e.alive || e.al > 0 || e.spawnT > 0 || e.vis < .3 || e.alt > .35) continue;
    const dx = e.x - P.x, dy = e.y - P.y, rr = R0 + e.r; if (dx * dx + dy * dy > rr * rr || Math.abs(angDiff(Math.atan2(dy, dx), a)) > 1.05) continue;
    const crit = R.f() < P.w.crit + P.critAdd + (P.heat >= 75 ? .1 : 0), q = Math.atan2(dy, dx);
    e.sh = 0; n++; FX.spark(e.x, e.y, crit ? '#ffd700' : '#ffffff', 6);
    if (!damageEnemy(e, dmg * (crit ? P.w.cm : 1), q, 3) && e.alive && crit && P.sig === 'whip') { e.stun = e.mb ? .4 : 1; FX.text(e.x, e.y - e.r - 10, lt('SNAP!'), '#ffd700', 13); }
  }
  const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, P.x, P.y) < R0 + B.r && Math.abs(angDiff(Math.atan2(B.y - P.y, B.x - P.x), a)) < 1.05) { Boss.hitBody(B, dmg, a, false, P.x, P.y); n++; }
  if (n) { G.hs = Math.max(G.hs, .03); shake(.15); }
}
/* ---------------- per-step player update ---------------- */
function updatePlayer(dt, rd) {
  const dashing = P.dashT > 0;
  if (P.dodgeCd > 0) P.dodgeCd -= rd;
  if (P.ch <= 0 && G.odT <= 0 && !Tut.cur) { const e = nearestEnemy(P.x, P.y, 150, true); if (e) Tut.check('dodge', P.x, P.y, 48); }
  if (P.inv > 0) P.inv -= rd; if (P.pw > 0) P.pw -= dt; if (P.dashT > 0) P.dashT -= dt; if (P.lock > 0) P.lock -= rd;
  for (const k in P.cds) if (P.cds[k] > 0) { P.cds[k] -= rd; if (P.cds[k] <= 0) { P.cds[k] = 0; UI.dockDirty = true; } }
  P.heat = Math.max(0, P.heat - P.heatCool * dt);
  P.x += P.vx * dt; P.y += P.vy * dt; let k = Math.pow(G.mods.ice && !dashing ? .12 : .004, dt); // ZERO FRICTION: you keep sliding after a dash
  if (!dashing) for (const t of Arena.terms) if (!t.done && dist(P.x, P.y, t.x, t.y) < t.zr) { k = Math.pow(1e-6, dt); break; }
  P.vx *= k; P.vy *= k;
  P.sx = damp(P.sx, 1, 12, rd); P.sy = damp(P.sy, 1, 12, rd); P.swing = damp(P.swing, 1.8, 14, rd); P.anim += rd;
  P.spd = Math.hypot(P.vx, P.vy); if (P.spd > 35) P.mvA = Math.atan2(P.vy, P.vx);
  const ph0 = P.walkPh; P.walkPh += Math.min(P.spd, 700) * dt * .1;
  if (!dashing && P.spd > 70 && Math.floor(P.walkPh / Math.PI + .5) !== Math.floor(ph0 / Math.PI + .5)) { // heel strike: a puff of roof dust under the front boot
    const sd = Math.sin(P.walkPh) > 0 ? 1 : -1, amp = 14 + Math.min(1, P.spd / 480) * 8, ca = Math.cos(P.mvA), sa = Math.sin(P.mvA), lx = amp, ly = -8 * sd;
    FX.spark(P.x + ca * lx - sa * ly, P.y + sa * lx + ca * ly, P.skin.body === 'shogun' ? '#ffd700' : 'rgba(160,180,220,.55)', P.skin.body === 'shogun' ? 4 : 2, .18);
  }
  { let want = P.ang;
    if (dashing) P.face = P.ang;
    else {
      if (P.spd > 60) want = P.mvA; else { const e = nearestEnemy(P.x, P.y, 420, true), b = Boss.cur; if (e) want = Math.atan2(e.y - P.y, e.x - P.x); else if (b) want = Math.atan2(b.y - P.y, b.x - P.x); }
      const d = angDiff(want, P.face), step = d * (1 - Math.exp(-(P.spd > 60 ? 14 : 6) * rd)); P.face += step;
      if (P.spd <= 35) P.walkPh += Math.abs(step) * 5; // shuffle the feet while turning in place
    } }
  if (P.ch < P.maxCh) { P.rt -= dt; if (P.rt <= 0) { P.ch++; P.rt = P.rc; } }
  if (G.odT > 0) P.ch = P.maxCh;
  let wall = false;
  if (P.x < V.L + P.r) { P.x = V.L + P.r; P.vx = Math.abs(P.vx) * .92; wall = true; } else if (P.x > V.R - P.r) { P.x = V.R - P.r; P.vx = -Math.abs(P.vx) * .92; wall = true; }
  const top = G.pz ? G.pz.y0 + P.r : P.r + 4, bot = G.pz ? G.pz.y1 - P.r : V.VH - P.r - 4; // a puzzle box has its own top and bottom rails
  if (P.y < top) { P.y = top; P.vy = Math.abs(P.vy) * .92; wall = true; } else if (P.y > bot) { P.y = bot; P.vy = -Math.abs(P.vy) * .92; wall = true; }
  if (P.wallRunT > 0) P.wallRunT -= dt;
  if (dashing && P.wallRunT <= 0 && G.mode !== 'puzzle' && (P.x <= V.L + P.r + 3 || P.x >= V.R - P.r - 3) && Math.abs(P.vy) > Math.abs(P.vx) * 1.35 && simV(15)) { // wall run: a dash along the rail
    P.wallRunT = .55; P.bounced = true; P.dashT = Math.max(P.dashT, .22);
    FX.spark(P.x, P.y, '#00ff88', 10); FX.text(P.x, P.y - 32, lt('WALL RUN! +CRIT'), '#00ff88', 12); Aud.sfx('wall'); vibe('wall');
  }
  if (wall && dashing) {
    P.bounced = true; P.ang = Math.atan2(P.vy, P.vx); P.sx = .62; P.sy = 1.45; P.swing = -1.9; P.seq++;
    Aud.sfx('wall'); vibe('wall'); FX.spark(P.x, P.y, '#ffd700', 10); FX.streak(P.x, P.y, P.ang, '#ffd700', 5);
    if (P.perks.pinball) P.ch = Math.min(P.maxCh, P.ch + 1);
    if (P.w.id === 'hammer' || P.perks.ricochet) {
      const wr = P.perks.pinball ? 240 : 160; FX.ring(P.x, P.y, wr, '#ffd700', 5); shake(.35);
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && dist(e.x, e.y, P.x, P.y) < wr) { e.sh = 0; damageEnemy(e, P.w.dmg * 1.4 * P.dmgMul * G.dmgMod, Math.atan2(e.y - P.y, e.x - P.x), 2); } }
      if (Boss.cur && dist(Boss.cur.x, Boss.cur.y, P.x, P.y) < wr + Boss.cur.r) Boss.hitBody(Boss.cur, 1.5 * P.dmgMul * G.dmgMod, P.ang, true);
    }
  }
  if (G.pz && P.dashT <= 0 && P.vx * P.vx + P.vy * P.vy < 900) { P.vx = P.vy = 0; } // puzzle: you stop dead, so the next move starts from an exact spot
  // afterimages while moving fast
  if (Math.abs(P.vx) + Math.abs(P.vy) > 500) { P.aft -= rd; if (P.aft <= 0) { P.aft = .025; FX.ghost(P.x, P.y, P.ang, G.odT > 0 ? '#ffd700' : fxArcColor()); } }
  if (dashing && P.fx.trail && !CALM) { P.trT -= rd; if (P.trT <= 0) { P.trT = .018; FX.trail(P.x - Math.cos(P.ang) * 12, P.y - Math.sin(P.ang) * 12, P.ang, P.fx.trail); } } // blade-skin trail
  if (P.tal.regen && P.hp < P.maxHp && G.mode !== 'dojo') { P.regT += rd; if (P.regT >= 25) { P.regT = 0; P.hp++; FX.text(P.x, P.y - 40, lt('+1 SHIELD'), '#00ff88', 15); Aud.sfx('buy'); } }
  // scarf chain
  P.scarf[0] = P.x - Math.cos(P.ang) * 9; P.scarf[1] = P.y - Math.sin(P.ang) * 9;
  for (let i = 1; i < 10; i++) {
    let x = P.scarf[i * 2], y = P.scarf[i * 2 + 1]; const px = P.scarf[i * 2 - 2], py = P.scarf[i * 2 - 1];
    y += (120 - P.vy * .3) * rd; x += (Math.sin(P.anim * 4 + i * .7) * 60 - P.vx * .3 - 30) * rd;
    const dx = x - px, dy = y - py, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d > 5.5) { x = px + dx / d * 5.5; y = py + dy / d * 5.5; }
    P.scarf[i * 2] = x; P.scarf[i * 2 + 1] = y;
  }
  chainStep();
  if (P.wcr && P.dashT <= 0 && !(P.cqi > 0 && P.cqi < P.ncq)) { P.wcr = 0; whipCrack(); }
  if (P.ncr && P.dashT <= 0 && !(P.cqi > 0 && P.cqi < P.ncq)) { P.ncr = 0; nodachiSweep(); }
  if (P.ncr2 > 0) { P.ncr2 -= dt; if (P.ncr2 <= 0) nodachiSweep(true); }
  if (P.swapT > 0) P.swapT -= dt; if (P.swCd > 0) { P.swCd -= dt; if (P.swCd <= 0) UI.dockDirty = true; }
  if (P.w4e && P.dashT <= 0 && !(P.cqi > 0 && P.cqi < P.ncq)) { P.w4e = 0; W4.dashEnd(); }
  if (P.dcr && P.dashT <= 0 && !(P.cqi > 0 && P.cqi < P.ncq)) { P.dcr = 0; dominatorBlast(); }
  if (P.gch > 0) { P.gchT -= dt; if (P.gchT <= 0) { P.gch--; P.gchT = .24; if (!grappleHop()) P.gch = 0; } } // chain grapple hops
  // laser drone (upgrade)
  const dl = Store.data.upg.drone;
  if (dl > 0) {
    P.dA += 3 * dt; P.dCd -= dt;
    if (P.dCd <= 0) {
      const dx = P.x + Math.cos(P.dA) * 42, dy = P.y + Math.sin(P.dA) * 42, e = nearestEnemy(dx, dy, 240 + dl * 20, true);
      P.dCd = Math.max(.45, 1.35 - dl * .17);
      if (e) { FX.bolt(dx, dy, e.x, e.y, '#00ff88', .8); damageEnemy(e, (.5 + dl * .15) * G.dmgMod, Math.atan2(e.y - dy, e.x - dx), 3); }
    }
  }
  // stolen boss cannon
  if (P.stolen > 0) {
    P.stolen -= rd; P.stolenCd -= rd;
    if (P.stolenCd <= 0) { P.stolenCd = .2; const e = nearestEnemy(P.x, P.y, 600, true); const a = e ? Math.atan2(e.y - P.y, e.x - P.x) : (Boss.cur ? Math.atan2(Boss.cur.y - P.y, Boss.cur.x - P.x) : -Math.PI / 2); shard(P.x, P.y, a, 560, '#00ff88', 1); }
  }
  // time echoes
  for (let i = 0; i < ECHO.n; i++) {
    const o = ECHO.a[i]; o.l -= dt; if (o.l <= 0) { o.alive = false; FX.spark(o.x, o.y, '#b537f2', 12); continue; }
    o.cd -= dt;
    if (o.cd <= 0) {
      o.cd = .5; o.seq++; let tx = null, ty = 0;
      const e = nearestEnemy(o.x, o.y, 700, true);
      if (e) { tx = e.x; ty = e.y; } else if (Boss.cur) { tx = Boss.cur.x; ty = Boss.cur.y; }
      if (tx !== null) { o.ang = Math.atan2(ty - o.y, tx - o.x); o.vx = Math.cos(o.ang) * 1150; o.vy = Math.sin(o.ang) * 1150; FX.arc(o.x, o.y, o.ang, 46, '#c45bff', 6); }
    }
    o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= Math.pow(.02, dt); o.vy *= Math.pow(.02, dt);
    o.x = clamp(o.x, V.L + 16, V.R - 16); o.y = clamp(o.y, 16, V.VH - 16);
    if (Math.abs(o.vx) + Math.abs(o.vy) > 300) {
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (e.alive && e.al <= 0 && e.wcd <= 0 && dist(e.x, e.y, o.x, o.y) < e.r + 26) { e.wcd = .3; damageEnemy(e, P.w.dmg * P.dmgMul * G.dmgMod, o.ang, 3); } }
      if (Boss.cur && Boss.cur.echoHit !== o.seq && dist(Boss.cur.x, Boss.cur.y, o.x, o.y) < Boss.cur.r + 24) { Boss.cur.echoHit = o.seq; Boss.hitBody(Boss.cur, P.w.dmg * P.dmgMul * G.dmgMod, o.ang, true); }
    }
  }
  ECHO.sweep();
  // laser web tethers
  for (let i = 0; i < TETH.n; i++) {
    const t = TETH.a[i]; t.l -= dt; if (t.l <= 0) { t.alive = false; continue; }
    for (let j = 0; j < EN.n; j++) {
      const e = EN.a[j]; if (!e.alive || e.al > 0) continue;
      if (distToSeg(e.x, e.y, t.x1, t.y1, t.x2, t.y2) < e.r + 5) {
        if (P.evo.web) e.slw = .6; // laser cage: caught enemies slow down
        if (e.wcd <= 0) { e.wcd = .35; damageEnemy(e, .8 * P.dmgMul * G.dmgMod, Math.atan2(t.y2 - t.y1, t.x2 - t.x1) + 1.57, 3); FX.spark(e.x, e.y, '#ffd700', 4); }
      }
    }
  }
  TETH.sweep();
}
/* ---------------- draw ---------------- */
function fxArcColor() { // slash arcs and afterimages take the blade skin's color
  const f = P.fx; if (!f || !f.blade) return P.ca;
  if (f.blade === 'prism') return PRISM[((CAM.t * 18) | 0) % 24];
  if (f.blade === 'glitch') return ((CAM.t * 20) | 0) % 2 ? '#ff2bd6' : '#00f2fe';
  return f.id === 'obsidian' ? '#ff0844' : f.blade;
}
function heroFromPlayer(dashing, blade, alpha) {
  const o = HO; heroSetSkin(o, P.skin); if (G.odT > 0) o.ca = '#ffd700';
  o.x = P.x; o.y = P.y; o.face = P.face; o.mvA = P.mvA; o.spd = P.spd; o.ph = P.walkPh; o.sx = P.sx; o.sy = P.sy;
  o.dashing = dashing; o.blade = blade; o.alpha = alpha; o.w = P.w.id; o.fx = P.fx; o.bl = P.r + 34 + P.w.reach + (P.reach - 1) * 30;
  o.t = CAM.t; o.hot = P.heat >= 75 ? 1 : 0; o.od = G.odT > 0 ? 1 : 0;
  return o;
}
function drawPlayer() {
  if (G.mode === 'highway') drawBike();
  drawHeroTrail(P.skin.body, P.scarf, P.ca, P.cb);
  const dashing = P.dashT > 0 || Math.abs(P.vx) + Math.abs(P.vy) > 480;
  if (G.odT > 0) { glow(P.x, P.y, 70, '#ffd700', .5 + .2 * Math.sin(CAM.t * 20)); }
  if (P.wallRunT > .2) glow(P.x, P.y, 44, '#00ff88', .45);
  if (G.combo >= 20 && G.state === 'PLAY') { // combo aura: gold from x20, red-hot from x50
    const hot = G.combo >= 50, r = 34 + Math.sin(CAM.t * 12) * 6 + (hot ? 14 : 0);
    glow(P.x, P.y, r * 1.6, hot ? '#ff0844' : '#ffd700', .35 + Math.sin(CAM.t * 25) * .08);
    if (hot) { cx.strokeStyle = '#ff2bd6'; cx.globalAlpha = .35; cx.lineWidth = 2; cx.beginPath(); cx.arc(P.x, P.y, r, CAM.t * 4, CAM.t * 4 + 4.2); cx.stroke(); cx.globalAlpha = 1; }
  }
  if (dashing && G.combo >= 30 && Q.lvl > 0) { // speed lines trailing the dash
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; const c = Math.cos(P.ang), s = Math.sin(P.ang), px = -s, py = c;
    for (let k = -2; k <= 2; k++) { const o = k * 7, L = 70 + ((k * 37 + (CAM.t * 60 | 0)) % 40); cx.globalAlpha = .5 - Math.abs(k) * .08; cx.beginPath(); cx.moveTo(P.x + px * o - c * 14, P.y + py * o - s * 14); cx.lineTo(P.x + px * o - c * L, P.y + py * o - s * L); cx.stroke(); }
    cx.globalAlpha = 1;
  }
  if (P.skin.id === 'nullren' && dashing) { const c = Math.cos(P.ang), s = Math.sin(P.ang); for (let k = 1; k <= 2; k++) { cx.globalAlpha = .28 / k; cx.fillStyle = '#ff0844'; cx.beginPath(); cx.arc(P.x + c * 46 * k, P.y + s * 46 * k, 11, 0, TAU); cx.fill(); } cx.globalAlpha = 1; } // NULL REN: afterimages that run ahead
  if (P.skin.id === 'eva' && P.hp === 1 && G.state === 'PLAY') { glow(P.x, P.y, 56 + Math.sin(CAM.t * 18) * 8, '#ff0000', .5); if (((CAM.t * 30) | 0) % 5 === 0) FX.spark(P.x, P.y, '#ff2a2a', 1); }
  if (P.pw > 0) { cx.strokeStyle = '#ffd700'; cx.lineWidth = 3; cx.beginPath(); cx.arc(P.x, P.y, P.r + 8 + (1 - P.pw / P.pwMax) * 16, 0, TAU); cx.stroke(); }
  if (P.lock > 0) { cx.strokeStyle = '#ff3b3b'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(P.x, P.y, P.r + 10, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); }
  const fl = P.inv > 0 && G.odT <= 0 && ((P.inv * 18) | 0) % 2 ? .35 : 1;
  let blade = (dashing ? P.ang + P.swing : P.face + Math.sin(P.anim * 2.5) * .2 + 1.8);
  if (P.spd > 25 || dashing || In.on || G.state !== 'PLAY' || !P.lastAct) P.lastAct = CAM.t;
  const idle = CAM.t - P.lastAct;
  if (idle > 3 && !dashing && P.w.id !== 'fists') { // idle flourish: a full blade twirl, then a sharp chiburi flick
    const k = (idle - 3) % 4.5;
    if (k < .8) { const u = k / .8; blade += TAU * u * u * (3 - 2 * u); }
    else if (k < 1.15) { const u = (k - .8) / .35; blade += Math.sin(u * Math.PI) * -.9; if (u > .45 && P.flN2 !== ((idle - 3) / 4.5 | 0)) { P.flN2 = (idle - 3) / 4.5 | 0; const r = P.r + 30; FX.spark(P.x + Math.cos(blade) * r, P.y + Math.sin(blade) * r, P.ca, 6); if (!Aud.quiet) Aud.tone(1800, 2700, .05, .035, 'sine'); } }
  }
  const ho = heroFromPlayer(dashing, blade, fl);
  if (SWP.seq !== P.seq) { if (SWP.seq >= 0 && P.seq > SWP.seq && G.state === 'PLAY') { SWING.start(SWP, P.w.id, P.ang, CAM.t); vibe('w_' + P.w.id); } SWP.seq = P.seq; } // a new dash: start this weapon's swing
  if (SWING.pose(SWP, CAM.t, P.face + Math.sin(P.anim * 2.5) * .2 + 1.8)) {
    const bl0 = ho.bl; SWING.apply(SWP, ho); SWING.rec(SWP, CAM.t); SWING.beats(SWP, P.x, P.y, bl0, false);
    SWING.smear(SWP, P.x, P.y, bl0, G.odT > 0 ? '#ffd700' : SW_COL[P.w.id] || WFX.col(), CAM.t);
  }
  if (P.poseS > 0) { const pt = CAM.t - P.poseS; if (pt < 8 || G.photo) { heroPose(ho, pt); ho.alpha = 1; hglow(P.x, P.y - 20, 60, '#ffd23f', .25 + .1 * Math.sin(pt * 6)); poseFx(P.x, P.y, pt, P.ca, P.poseL); P.poseL = pt; } }
  ho.main = 1; drawHero(ho); ho.main = 0; // (main: the 3D layer follows this one, not the echo clones drawn with the same object below)
  if (Store.data.upg.drone > 0) { const dx = P.x + Math.cos(P.dA) * 42, dy = P.y + Math.sin(P.dA) * 42; glow(dx, dy, 14, '#00ff88', .7); cx.fillStyle = '#00ff88'; cx.fillRect(dx - 4, dy - 4, 8, 8); }
  for (let k = 0; k < P.orb; k++) { const a = P.anim * 4 + k * TAU / P.orb; cx.fillStyle = P.ca; cx.beginPath(); cx.arc(P.x + Math.cos(a) * 32, P.y + Math.sin(a) * 32, 4, 0, TAU); cx.fill(); }
  for (let i = 0; i < ECHO.n; i++) { // time-echo clones: your body, in violet
    const e = ECHO.a[i], sp = Math.hypot(e.vx, e.vy), o = heroFromPlayer(sp > 600, e.ang + 1.8, .55 + .3 * Math.sin(CAM.t * 12));
    o.x = e.x; o.y = e.y; o.face = e.ang; o.mvA = Math.atan2(e.vy, e.vx); o.spd = sp; o.ph = CAM.t * 18; o.sx = o.sy = 1; o.ca = '#c45bff'; o.cb = '#00f2fe'; o.fx = null; o.hot = o.od = 0;
    drawHero(o);
  }
  for (let i = 0; i < TETH.n; i++) {
    const t = TETH.a[i]; cx.globalAlpha = Math.min(1, t.l); cx.strokeStyle = '#ffd700'; cx.lineWidth = 2.5 + Math.sin(CAM.t * 30 + i) * .8;
    cx.beginPath(); cx.moveTo(t.x1, t.y1); cx.lineTo(t.x2, t.y2); cx.stroke(); glow((t.x1 + t.x2) / 2, (t.y1 + t.y2) / 2, 60, '#ffd700', .25);
  }
  cx.globalAlpha = 1;
}
const DASH6 = [6, 6], DASH8 = [8, 8], NODASH = [];
