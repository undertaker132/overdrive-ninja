/* =====================================================================
   BOSS FRAMEWORK — modular parts, rotating weakpoint, stagger + Zandatsu,
   intro cinematic, kill-cam. Defs: warden, hydra (here), kage, shogun.
   ===================================================================== */
const BOSSDEF = {};
const BOSS_CODE = { warden: 40, hydra: 41, kage: 42, shogun: 43, raijin: 44, renull: 45, leviathan: 46, benkei: 47, prime: 48, valkyrie: 49, chimera: 50, genesis: 51, oryu: 52, tenkai: 53, izanami: 54, hyakki: 55 }; // bullet owner ids (cause of death)
function mkPart(name, ox, oy, r, hp) { return { name, ox, oy, x: 0, y: 0, r, hp, mhp: hp, alive: true, hid: -1, fl: 0, abs: false, cd: 1.5 }; }
const Boss = {
  cur: null, zanCd: 0,
  saveCk(b) { // phase/part checkpoint: a failed fight can resume from here
    if (G.mode !== 'story' || b.dying > 0 || (G.obj && G.obj.chain)) return; // a chain of bosses restarts from the first
    const parts = []; for (const p of b.parts) parts.push(p.alive ? Math.max(.05, p.hp / p.mhp) : 0);
    G.ckpt = { id: b.id, ph: b.ph, hpF: Math.max(.05, b.hp / b.mhp), parts, shield: b.shield, wpOn: b.wpOn, hits: G.hits, time: G.time, score: G.score, od: G.od, armsCut: G.armsCut, zan: G.zan, clashes: G.clashes };
    toast(lt('CHECKPOINT SAVED'), '#00ff88'); Comms.say('checkpoint', true);
  },
  restoreCk(b, ck) {
    b.ph = ck.ph; b.hp = b.mhp * ck.hpF;
    if (b.def.restore) b.def.restore(b, ck);
    for (let i = 0; i < b.parts.length && i < ck.parts.length; i++) { const p = b.parts[i]; if (ck.parts[i] <= 0) p.alive = false; else p.hp = p.mhp * ck.parts[i]; }
    b.shield = ck.shield; b.wpOn = ck.wpOn;
    Object.assign(G, { hits: ck.hits, time: ck.time, score: ck.score, od: ck.od, armsCut: ck.armsCut, zan: ck.zan, clashes: ck.clashes });
    FX.call(ltf('RESUMED — PHASE {0}', ck.ph), '#00ff88', 3, 22);
  },
  spawn(id, lvl) {
    Stats.boss(id, 'f');
    const def = BOSSDEF[id], info = BOSS_INFO[id];
    const b = {
      id, def, info, x: V.CX, y: -120, r: 44, hp: 60, mhp: 60, ph: 1, t: 0, st: 'idle', stT: 1.5, wp: 0, wpOn: true, stag: 0, fl: 0,
      shield: false, parts: [], hid: -1, echoHit: -1, cd: 1.5, enter: 0, dying: 0, boomT: 0, ang: Math.PI / 2, vx: 0, vy: 0,
      beam: { on: 0, tele: 0, a: 0, va: 0, n: 0, len: 900, w: 7 }, hx: V.CX, hy: V.VH * .22, aIdx: 0, lvl: lvl || 1, bodyMul: 1, guard: false, minions: 0
    };
    def.init(b); codexBoss(id, false);
    b.mhp = b.hp = b.hp * G.diff.bhp * (1 + (b.lvl - 1) * .35) * (G.ngp ? 1.3 : 1) * (G.mode === 'raid' ? Live.hpMul : 1) * (G.mode === 'arena' ? BossArena.hpMul() : 1) * (1 + (G.tune | 0) * .1) * (G.obj && G.obj.chain && G.mode === 'story' ? G.obj.hp || 1 : 1); b.lastHp = b.hp;
    for (const p of b.parts) { p.mhp = p.hp = p.hp * G.diff.bhp * (1 + (b.lvl - 1) * .25); }
    this.cur = b; G.freeze = 2.6; G.cine = { k: 'boss', t: 0, d: 2.6, id };
    Aud.sfx('roar'); Aud.say(info.name.replace('.EXE', '').replace('.SYS', ''), 1); Aud.music('run', true); glitch(.4); shake(.5);
    Aud.intensity = 2;
    return b;
  },
  partPos(b) { if (b.def.pos) b.def.pos(b); for (const p of b.parts) if (!p.abs) { p.x = b.x + p.ox; p.y = b.y + p.oy; } },
  update(dt, rd) {
    const b = this.cur; if (!b) return; G.shooter = BOSS_CODE[b.id] || 40;
    if (this.zanCd > 0) this.zanCd -= rd;
    if (b.dying > 0) { // kill-cam
      b.dying -= rd; b.boomT -= rd;
      if (b.boomT <= 0) { b.boomT = .14; const x = b.x + (rnd() - .5) * b.r * 2.4, y = b.y + (rnd() - .5) * b.r * 2.4; FX.boom(x, y, 60 + rnd() * 60, b.info.col); Aud.sfx('boom', 1); }
      if (b.dying <= 0) { FX.boom(b.x, b.y, 360, '#ffffff'); flash(.9); punch(.15); this.cur = null; Director.onBossDead(b.id); }
      return;
    }
    if (b.enter < 1) { b.enter = Math.min(1, b.enter + rd / 2.2); b.y = lerp(-140, b.hy, 1 - Math.pow(1 - b.enter, 3)); this.partPos(b); if (G.freeze > 0) return; }
    if (G.mode === 'raid') Live.bossSync(b); // shared health: send my damage, take my friends'
    if (G.freeze > 0) return;
    b.t += dt; if (b.fl > 0) b.fl -= dt * 5;
    if (b.wpCd > 0) b.wpCd -= dt;
    if (b.stag > 0) { b.stag -= dt; this.partPos(b); return; }
    if (b.wpOn) b.wp += (b.ph >= 2 ? 1.6 : 1.1) * dt;
    const st0 = b.st, bt0 = b.beam.tele;
    b.def.update(b, G.mode === 'arena' ? dt * BossArena.spd() : dt);
    if (b.st !== st0 && (b.st === 'tele' || b.st === 'stomp' || b.st === 'dive') || (b.beam.tele > 0 && bt0 <= 0)) this.teleCue(b);
    this.partPos(b);
    for (const p of b.parts) { if (p.fl > 0) p.fl -= dt * 5; }
  },
  teleCue(b) { // an attack is winding up: a bright chime and a red ring, so it can be heard as well as seen
    if (!Aud.quiet) Aud.tone(1860, 2240, .09, .18, 'triangle'); FX.ring(b.x, b.y, b.r + 38, '#ff0844', 4); vibe('tele'); Pet.onTele();
  },
  /* collisions with the dashing player (called from sim) */
  collide(dashing) {
    const b = this.cur; if (!b || b.dying > 0 || b.enter < 1) return;
    const hitR = P.r + (dashing ? 20 * P.reach + P.w.reach : 0);
    for (const p of b.parts) {
      if (p.hitCd > 0) p.hitCd -= 1 / 60;
      if (!p.alive || !dashing || p.hid === P.seq || p.hitCd > 0) continue;
      if (dist(P.x, P.y, p.x, p.y) < hitR + p.r) { p.hid = P.seq; p.hitCd = .3; this.hitPart(b, p, calcDmg(), Math.atan2(p.y - P.y, p.x - P.x)); WFX.hit(p.x, p.y, Math.atan2(p.y - P.y, p.x - P.x), G.lastCrit); onBladeHit(); }
    }
    if (b.def.noBody && b.def.noBody(b)) return;
    const d = dist(P.x, P.y, b.x, b.y);
    if (b.hitCd > 0) b.hitCd -= 1 / 60;
    if (d < hitR + b.r) {
      if (dashing) {
        if (b.hid !== P.seq && !(b.hitCd > 0)) {
          b.hid = P.seq; b.hitCd = .3; this.hitBody(b, calcDmg(), Math.atan2(b.y - P.y, b.x - P.x), false); WFX.hit(b.x - Math.cos(Math.atan2(b.y - P.y, b.x - P.x)) * b.r * .7, b.y - Math.sin(Math.atan2(b.y - P.y, b.x - P.x)) * b.r * .7, Math.atan2(b.y - P.y, b.x - P.x), G.lastCrit); onBladeHit();
          const a = Math.atan2(P.y - b.y, P.x - b.x), sp = Math.hypot(P.vx, P.vy) * .5; P.vx = Math.cos(a) * sp; P.vy = Math.sin(a) * sp;
        }
      } else if (P.inv <= 0 && !b.def.noContact) { if (hurt('boss')) { const a = Math.atan2(P.y - b.y, P.x - b.x); P.vx = Math.cos(a) * 700; P.vy = Math.sin(a) * 700; } }
      const cr = b.r + P.r * (b.def.noContact ? .9 : .6);
      if (d < cr) { const a = Math.atan2(P.y - b.y, P.x - b.x); P.x = b.x + Math.cos(a) * cr; P.y = b.y + Math.sin(a) * cr; }
    }
  },
  hitPart(b, p, d, a) {
    if (b.def.partHit && b.def.partHit(b, p, d)) return; // parts with their own rules (Benkei's bells)
    p.hp -= d; p.fl = 1; styleAdd(ST_BOSS, 18); FX.spark(p.x, p.y, '#ffd700', 8); dmgNum(p.x, p.y - p.r - 6, Math.round(d * 100), G.lastCrit, false);
    Aud.sfx('hit', 1);
    if (p.hp <= 0) {
      p.alive = false; FX.boom(p.x, p.y, 120, b.info.col); Aud.sfx('boom', 1); shake(.5); G.hs = .1;
      FX.call(ltf('{0} DOWN', lt(p.name)), '#00ff88', 3, 24);
      b.def.onPart && b.def.onPart(b, p);
      this.saveCk(b);
    }
  },
  hitBody(b, d, a, ignoreShield, fx, fy) {
    if (!b || b.dying > 0 || b.enter < 1) return;
    const melee = fx == null;
    if (b.shield && !ignoreShield) {
      if (melee) { P.vx *= -.8; P.vy *= -.8; P.ch = P.maxCh; G.hs = .05; Aud.sfx('deny'); if (b.t - (b.msgT || -9) > 1.4) { b.msgT = b.t; FX.call(lt(b.shieldMsg || 'SHIELDED'), '#7df9ff', 1, 17); } }
      FX.ring(b.x, b.y, b.r + 18, '#7df9ff', 3); return;
    }
    if (melee && b.def.guardCheck && !ignoreShield && b.def.guardCheck(b)) return;
    let mul = b.bodyMul;
    if (b.wpOn && !ignoreShield && !(b.wpCd > 0)) {
      const hs = Math.atan2((melee ? P.y : fy) - b.y, (melee ? P.x : fx) - b.x);
      if (Math.abs(angDiff(hs, b.wp)) < .85) {
        mul *= 3; b.stag = 2; b.zanN = 0; b.wpCd = 3.5; b.wp += Math.PI; styleAdd(ST_WEAK, 90); G.hs = .11; punch(.06); shake(.5); flash(.25, '#ffd700');
        Aud.sfx('stagger'); vibe('stagger'); FX.call(lt('WEAKPOINT — TAP THE BOSS'), '#ffd700', 2, 22); FX.ring(b.x, b.y, b.r + 40, '#ffd700', 5);
      }
    }
    if (b.stag > 0) mul *= 1.25;
    const dd = d * mul; b.hp -= dd; b.fl = 1; if (melee && mul < 3) styleAdd(ST_BOSS, 18);
    if (b.id === 'shogun' && b.hp < b.mhp * .15 && b.hp + dd >= b.mhp * .15) Comms.say('bossLow', true);
    dmgNum(b.x + (rnd() - .5) * 30, b.y - b.r * .5, Math.round(dd * 100), mul >= 3 || G.lastCrit, mul >= 3);
    FX.spark(b.x + Math.cos(a + Math.PI) * b.r * .7, b.y + Math.sin(a + Math.PI) * b.r * .7, b.info.col, 8);
    Aud.sfx('hit', 1); addOD(2);
    b.def.onHit && b.def.onHit(b);
    if (b.hp <= 0) this.kill(b);
  },
  zanTap(x, y) {
    const b = this.cur; if (!b || b.stag <= 0 || b.dying > 0 || b.shield) return false;
    if (REC.live()) { const qx = Math.round(x * 4), qy = Math.round(y * 4); x = qx / 4; y = qy / 4; REC.act(RA.ZAN, qx, qy); }
    if (dist(x, y, b.x, b.y) > b.r + 110) return false;
    if (this.zanCd > 0 || (b.zanN | 0) >= 8) return true; this.zanCd = .07; b.zanN = (b.zanN | 0) + 1; styleAdd(ST_ZAN, 22);
    const a = (rnd() - .5) * Math.PI;
    FX.arc(b.x + (rnd() - .5) * 30, b.y + (rnd() - .5) * 30, a, 60 + rnd() * 30, '#ffd700', 7); FX.streak(b.x, b.y, a, '#ffffff', 4);
    const d = P.w.dmg * P.dmgMul * .42 * G.dmgMod; b.hp -= d; b.fl = 1; G.zan++; bounty('zandatsu', 1);
    G.score += Math.round(150 * G.diff.score * G.scoreMul); G.combo++; G.ct = 3.4; if (G.combo > G.maxCombo) G.maxCombo = G.combo;
    FX.call(lt(ZAN_TXT[b.zanN]), '#ffd700', 2); Aud.sfx('zan'); shake(.12); vibe('zan');
    if (b.hp <= 0) this.kill(b);
    return true;
  },
  kill(b) {
    if (b.dying > 0) return;
    b.dying = 2.2; b.boomT = 0; b.stag = 0; G.slowT = 1.8; G.slowK = .25; G.hs = .2; glitch(.5); shake(1); flash(.6, '#ffffff'); punch(.14);
    CAM.fin = CAM.finD; CAM.fx = b.x; CAM.fy = b.y; // finisher cam: zoom onto the last hit
    G.score += Math.round(5000 * b.lvl * G.diff.score * G.scoreMul); addOD(40);
    for (let i = 0; i < 40; i++) { const c = CO.get(); if (!c) break; const q = R.f() * TAU, s = 80 + R.f() * 260; c.x = b.x; c.y = b.y; c.vx = Math.cos(q) * s; c.vy = Math.sin(q) * s; c.v = 3; c.t = 0; }
    for (let i = 0; i < BU.n; i++) BU.a[i].alive = false;
    if (G.mode === 'raid') Live.bossKilled();
    codexBoss(b.id, true); Stats.boss(b.id, 'w');
    bounty('boss', 1); ach(b.id); vibe('boss'); REC.mark('boss', 5); if (G.ngp && b.id === 'shogun') ach('ngplus'); FX.call(ltf('{0} DESTROYED', lt(b.info.name)), '#ffd700', 3, 26); Aud.say('Boss destroyed', 1);
  },
  beamHits(x1, y1, x2, y2, w) {
    if (P.inv > 0 || P.dashT > 0 || G.odT > 0) return;
    if (distToSeg(P.x, P.y, x1, y1, x2, y2) < P.r * .6 + w) hurt('beam');
  },
  draw() {
    const b = this.cur; if (!b) return;
    b.def.draw(b);
    if (b.stag > 0) { cx.globalAlpha = .6; cx.strokeStyle = '#ffd700'; cx.lineWidth = 1.5; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(b.x, b.y, b.r + 60, CAM.t * 2, CAM.t * 2 + TAU); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
    if (b.wpOn && b.stag <= 0 && b.dying <= 0) { cx.globalAlpha = b.wpCd > 0 ? .25 : 1; cx.strokeStyle = '#ffd700'; cx.lineWidth = 6; cx.beginPath(); cx.arc(b.x, b.y, b.r + 9, b.wp - .65, b.wp + .65); cx.stroke(); glow(b.x + Math.cos(b.wp) * (b.r + 9), b.y + Math.sin(b.wp) * (b.r + 9), 26, '#ffd700', b.wpCd > 0 ? .15 : .7); cx.globalAlpha = 1; }
    if (b.shield && b.dying <= 0) { cx.strokeStyle = 'rgba(125,249,255,.7)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(b.x, b.y, b.r + 16 + Math.sin(CAM.t * 5) * 2, 0, TAU); cx.stroke(); glow(b.x, b.y, b.r + 40, '#7df9ff', .15); }
    for (const p of b.parts) if (p.alive) {
      const w = p.r * 2; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(p.x - w / 2, p.y + p.r + 5, w, 4);
      cx.fillStyle = '#00ff88'; cx.fillRect(p.x - w / 2, p.y + p.r + 5, w * Math.max(0, p.hp / p.mhp), 4);
    }
  }
};
const ZAN_TXT = ['', 'ZANDATSU x1', 'ZANDATSU x2', 'ZANDATSU x3', 'ZANDATSU x4', 'ZANDATSU x5', 'ZANDATSU x6', 'ZANDATSU x7', 'ZANDATSU MAX'];
function bossPartsAlive(b) { let n = 0; for (const p of b.parts) if (p.alive) n++; return n; }
function drawMech(b, col, sides, spin) {
  cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.2, col, .4);
  cx.rotate(spin); poly(0, 0, b.r, sides, 0); cx.fillStyle = b.fl > .3 ? '#ffffff' : '#1a0d16'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 4; cx.stroke();
  poly(0, 0, b.r * .62, sides, Math.PI / sides); cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke();
  cx.restore();
  cx.fillStyle = b.stag > 0 ? '#ffd700' : '#05050d'; cx.beginPath(); cx.arc(b.x, b.y, b.r * .32, 0, TAU); cx.fill();
  glow(b.x, b.y, b.r * .5, b.stag > 0 ? '#ffd700' : col, .6);
}

/* ---------------- BOSS 1: WARDEN MK-II ---------------- */
BOSSDEF.warden = {
  init(b) {
    b.r = 44; b.hp = 120; b.hy = V.VH * .2;
    b.parts.push(mkPart('MISSILE POD', -62, 4, 19, 16), mkPart('PLASMA CANNON', 62, 4, 19, 16));
  },
  onPart(b, p) { G.armsCut++; dropPickup(p.x, p.y, 0); hint('core', lt('GRAB THE GREEN WEAPON CORE FOR A BOSS CANNON')); b.bodyMul = bossPartsAlive(b) ? .45 : 1; },
  update(b, dt) {
    const pod = b.parts[0], can = b.parts[1];
    if (b.ph === 1 && b.hp < b.mhp * .5) { b.ph = 2; FX.call(lt('OVERCLOCK'), '#ff0844', 3); Aud.sfx('roar'); glitch(.3); Boss.saveCk(b); Comms.say('warden2', true); }
    b.bodyMul = bossPartsAlive(b) ? .45 : 1;
    const fast = b.ph >= 2 ? .72 : 1;
    if (b.st === 'stomp') {
      b.stT -= dt;
      if (b.stT > .45) { b.vx = b.tx; b.vy = b.ty; } // telegraph: target circle shown
      else { b.x = damp(b.x, b.tx, 12, dt); b.y = damp(b.y, b.ty, 12, dt); }
      if (b.stT <= 0) {
        FX.boom(b.x, b.y, 130, '#ff6a00'); shake(.7); Aud.sfx('boom', 1);
        if (dist(P.x, P.y, b.x, b.y) < 120 + P.r) hurt('stomp');
        for (let k = 0; k < 10; k++) shoot(b.x, b.y, k * TAU / 10, 230, 0);
        b.st = 'return'; b.stT = 1;
      }
      return;
    }
    if (b.st === 'return') { b.stT -= dt; b.x = damp(b.x, b.hx, 3, dt); b.y = damp(b.y, b.hy, 3, dt); if (b.stT <= 0) b.st = 'idle'; return; }
    b.hx = damp(b.hx, clamp(P.x, V.L + 70, V.R - 70), .8, dt);
    b.x = damp(b.x, b.hx, 2, dt); b.y = b.hy + Math.sin(b.t * 1.6) * 10;
    if (b.st === 'plasma') {
      b.stT -= dt; b.ang = Math.atan2(P.y - can.y, P.x - can.x);
      if (b.stT <= 0) { for (let k = 0; k < 5; k++) shoot(can.x, can.y, b.ang, 480 + k * 60, 4); Aud.sfx('laser'); b.st = 'idle'; }
      return;
    }
    b.cd -= dt * G.diff.fire;
    if (b.cd > 0) return;
    const opts = ['ring', 'stomp']; if (pod.alive) opts.push('missile', 'missile'); if (can.alive) opts.push('plasma', 'plasma');
    const pick = opts[(b.aIdx++ * 7 + R.i(3)) % opts.length];
    if (pick === 'ring') {
      const n = 10 + bossPartsAlive(b) * 3, off = b.t;
      for (let k = 0; k < n; k++) shoot(b.x, b.y, off + k * TAU / n, 210, 0);
      if (b.ph >= 2) for (let k = 0; k < n; k++) shoot(b.x, b.y, off + (k + .5) * TAU / n, 160, 1);
      if (G.ngp) for (let k = -1; k <= 1; k++) shoot(b.x, b.y, Math.PI / 2 + k * .7, 160, 2); // NG+: homing missile volley
      b.cd = 1.7 * fast;
    } else if (pick === 'missile') {
      for (let k = -1; k <= 1; k++) shoot(pod.x, pod.y, Math.PI / 2 + k * .6, 170, 2);
      Aud.sfx('warn'); b.cd = 2 * fast;
    } else if (pick === 'plasma') {
      b.st = 'plasma'; b.stT = .8; b.cd = 1.6 * fast;
    } else {
      b.st = 'stomp'; b.stT = 1.25; b.tx = clamp(P.x, V.L + b.r, V.R - b.r); b.ty = clamp(P.y, b.r + 20, V.VH - b.r - 20); b.cd = 2.2 * fast; Aud.sfx('warn');
    }
  },
  draw(b) {
    const pod = b.parts[0], can = b.parts[1], col = b.info.col;
    if (b.st === 'stomp' && b.stT > .45) { cx.strokeStyle = '#ff3b3b'; cx.lineWidth = 3; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(b.tx, b.ty, 120, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = .15; cx.fillStyle = '#ff0844'; cx.fill(); cx.globalAlpha = 1; }
    if (b.st === 'plasma' && can.alive) { cx.globalAlpha = .4 + (1 - b.stT / .8) * .5; cx.strokeStyle = '#00f2fe'; cx.lineWidth = 2 + (1 - b.stT / .8) * 3; cx.beginPath(); cx.moveTo(can.x, can.y); cx.lineTo(can.x + Math.cos(b.ang) * 900, can.y + Math.sin(b.ang) * 900); cx.stroke(); cx.globalAlpha = 1; }
    cx.strokeStyle = '#3a2a3a'; cx.lineWidth = 8;
    for (const p of b.parts) if (p.alive) { cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(p.x, p.y); cx.stroke(); }
    if (pod.alive) { cx.fillStyle = pod.fl > .3 ? '#fff' : '#ff6a00'; cx.fillRect(pod.x - 18, pod.y - 22, 36, 44); cx.fillStyle = '#2a1000'; for (let k = 0; k < 3; k++) cx.fillRect(pod.x - 12 + k * 9, pod.y - 16, 6, 10); glow(pod.x, pod.y, 40, '#ff6a00', .4); }
    if (can.alive) { cx.fillStyle = can.fl > .3 ? '#fff' : '#00b8d4'; cx.fillRect(can.x - 16, can.y - 20, 32, 40); cx.fillStyle = '#00f2fe'; cx.fillRect(can.x - 5, can.y + 14, 10, 18); glow(can.x, can.y, 40, '#00f2fe', .4); }
    drawMech(b, col, 8, b.t * .4);
  }
};

/* ---------------- BOSS 2: HYDRA CARRIER ---------------- */
BOSSDEF.hydra = {
  init(b) {
    b.r = 56; b.hp = 100; b.hy = V.VH * .17; b.shield = true; b.wpOn = false; b.shieldMsg = 'SHIELDED — DESTROY THE HEADS';
    b.parts.push(mkPart('LEFT HEAD', -84, 30, 20, 18), mkPart('LASER HEAD', 0, 70, 22, 20), mkPart('HANGAR HEAD', 84, 30, 20, 18));
    b.parts[0].cd = 1.2; b.parts[1].cd = 3; b.parts[2].cd = 4;
  },
  onPart(b, p) {
    if (p === b.parts[1]) b.beam.on = b.beam.tele = 0;
    if (bossPartsAlive(b) === 0) { b.shield = false; b.wpOn = true; b.ph = 2; b.stag = 2; b.zanN = 0; FX.call(lt('CORE EXPOSED'), '#ffd700', 3); Aud.say('Core exposed', 1); Comms.say('hydra2', true); }
  },
  update(b, dt) {
    const [L, C, Rh] = b.parts, bm = b.beam;
    b.x = V.CX + Math.sin(b.t * .45) * 60; b.y = (b.ph >= 2 ? damp(b.y, V.VH * .3, .5, dt) : b.hy) + Math.sin(b.t * 1.3) * 6;
    if (L.alive) { L.cd -= dt * G.diff.fire; if (L.cd <= 0) { L.cd = 1.5; const a = Math.atan2(P.y - L.y, P.x - L.x); for (let k = -1; k <= 1; k++) shoot(L.x, L.y, a + k * .18, 300, 0); } }
    if (C.alive) {
      if (bm.tele > 0) { bm.tele -= dt; if (bm.tele <= 0) { bm.on = 1.5; Aud.sfx('laser'); } }
      else if (bm.on > 0) { bm.on -= dt; bm.a += bm.va * dt; Boss.beamHits(C.x, C.y, C.x + Math.cos(bm.a) * bm.len, C.y + Math.sin(bm.a) * bm.len, 6); if (bm.on <= 0) C.cd = 4.2; }
      else { C.cd -= dt * G.diff.fire; if (C.cd <= 0) { const side = P.x < V.CX ? 1 : -1; bm.a = Math.PI / 2 + side * .95; bm.va = -side * 1.3 * (G.ngp ? 1.35 : 1); bm.tele = 1; Aud.sfx('warn'); } }
    }
    if (Rh.alive) { Rh.cd -= dt; if (Rh.cd <= 0) { Rh.cd = 6.5; if (EN.n < 8) for (let k = 0; k < 2; k++) { const e = spawnEnemy(ET.DRONE, Rh.x + (k ? 14 : -14), Rh.y + 20, 0); if (e) e.spawnT = .2; } FX.ring(Rh.x, Rh.y, 50, '#00ffd0', 3); } }
    if (b.ph >= 2 && G.ngp) { b.ngT = (b.ngT || 6) - dt; if (b.ngT <= 0) { b.ngT = 6; if (EN.n < 8) for (let k = 0; k < 2; k++) { const e = spawnEnemy(ET.DRONE, b.x + (k ? 40 : -40), b.y + 40, 0); if (e) e.spawnT = .2; } } }
    if (b.ph >= 2) { // exposed core: twin spiral + aimed bursts
      b.cd -= dt * G.diff.fire;
      if (b.cd <= 0) { b.cd = .09; const a = b.t * 2.3; shoot(b.x, b.y, a, 190, 0); shoot(b.x, b.y, a + Math.PI, 190, 0); }
      b.stT -= dt; if (b.stT <= 0) { b.stT = 2.2; const a = Math.atan2(P.y - b.y, P.x - b.x); for (let k = -2; k <= 2; k++) shoot(b.x, b.y, a + k * .15, 330, 1); }
    }
  },
  draw(b) {
    const C = b.parts[1], bm = b.beam, col = b.info.col;
    if (C.alive && (bm.tele > 0 || bm.on > 0)) {
      const ex = C.x + Math.cos(bm.a) * bm.len, ey = C.y + Math.sin(bm.a) * bm.len;
      if (bm.tele > 0) { cx.globalAlpha = .5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.beginPath(); cx.moveTo(C.x, C.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1; }
      else { cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 12; cx.beginPath(); cx.moveTo(C.x, C.y); cx.lineTo(ex, ey); cx.stroke(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.stroke(); glow(C.x, C.y, 50, '#ff2bd6', .8); }
    }
    cx.save(); cx.translate(b.x, b.y); glow(0, 0, b.r * 2.4, col, .35);
    cx.fillStyle = b.fl > .3 ? '#fff' : '#08201e'; cx.beginPath(); cx.ellipse(0, 0, b.r * 1.5, b.r * .8, 0, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 4; cx.stroke();
    cx.strokeStyle = 'rgba(0,255,208,.5)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(0, 0, b.r * 1.1, b.r * .5, 0, 0, TAU); cx.stroke();
    cx.restore();
    for (const p of b.parts) if (p.alive) {
      cx.strokeStyle = '#1f4a46'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(p.x, p.y); cx.stroke();
      cx.save(); cx.translate(p.x, p.y); cx.rotate(Math.atan2(P.y - p.y, P.x - p.x)); poly(0, 0, p.r, 6, 0); cx.fillStyle = p.fl > .3 ? '#fff' : '#0c3a35'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
      cx.fillStyle = col; cx.fillRect(4, -4, p.r + 6, 8); cx.restore();
    }
    cx.fillStyle = b.stag > 0 ? '#ffd700' : (b.shield ? '#0a3a3a' : '#ff0844'); cx.beginPath(); cx.arc(b.x, b.y, b.r * .38, 0, TAU); cx.fill();
    glow(b.x, b.y, b.r * .6, b.shield ? '#00ffd0' : '#ff0844', .6);
  }
};
