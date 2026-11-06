/* =====================================================================
   DIRECTOR — run setup per mode, weighted spawner with dynamic
   difficulty, objectives, random arena events, endless cars, boss rush
   ===================================================================== */
const ENDLESS_UNLOCK = [[1, 'drone', 5], [1, 'sniper', 2], [2, 'bomber', 2], [2, 'brute', 1], [2, 'medic', .8], [3, 'weaver', 2], [4, 'splitter', 2], [4, 'miner', 1], [5, 'phantom', 2], [5, 'mirror', 1], [6, 'warden', 1], [7, 'mimic', 1.2]];
const RUSH_THEMES = ['maglev', 'undercity', 'ghost', 'core', 'storm'];
const Director = {
  pool: [], wts: [], wsum: 0, max: 6, rate: 1.4, elite: 0, scratch: { x: 0, y: 0, d: 0 }, bossPending: null, bossLvl: 1, courier: null, evOn: false,
  q: [], waveT: 0, waveOn: false, wavePause: false, waveHT: 0, waveN: 0, lastWave: '', introTips: false, pendingCourier: false, mbPending: 0, mbForce: false,
  setPool(p) {
    this.pool.length = 0; this.wts.length = 0; this.wsum = 0;
    for (const k in p) { const t = ENAME2T[k]; if (t == null || !p[k]) continue; this.pool.push(t); this.wts.push(p[k]); this.wsum += p[k]; }
  },
  pickType() { let r = R.f() * this.wsum; for (let i = 0; i < this.pool.length; i++) { r -= this.wts[i]; if (r <= 0) return this.pool[i]; } return this.pool[0] || 0; },
  begin(mode, stage) {
    const d = Store.data;
    G.mode = mode; G.tune = 0; G.stage = stage || null; G.di = mode === 'puzzle' ? 1 : d.diff; G.diff = diffTable()[G.di] || DIFFS[1]; G.pz = null;
    G.dayKey = runDay(); G.weekKey = runWeek(); // replays use the recorded date, arena size and seed
    G.dockL = REPLAY.on ? REPLAY.hdr.dockL : Math.round(UI.dockH / V.s * 100) / 100;
    G.seed = (REPLAY.on ? REPLAY.hdr.seed : (mode === 'race' || mode === 'raid') ? Live.seed : FChal.seed() ? FChal.seed() : mode === 'daily' ? G.dayKey * 7919 : mode === 'weekly' ? G.weekKey * 104729 + 17 : (Date.now() ^ (rnd() * 1e9))) >>> 0;
    R.seed(G.seed);
    G.cdxB = REPLAY.on ? (REPLAY.hdr.cdx || {}) : (mode === 'puzzle' || mode === 'dojo' || mode === 'race' || mode === 'raid') ? {} : codexBonuses(); // codex mastery, frozen for the whole run
    G.pet = REPLAY.on ? (REPLAY.hdr.pt || 'none') : (mode === 'puzzle' || mode === 'dojo') ? 'none' : (PET_BY_ID[Store.data.pet] && Store.data.pets && Store.data.pets[Store.data.pet] ? Store.data.pet : 'none');
    G.petLv = REPLAY.on ? (REPLAY.hdr.pl || 1) : G.pet && G.pet !== 'none' ? petLevel(G.pet) : 1;
    G.mods = {}; G.spdMul = 1; G.scoreMul = 1; G.dmgMod = 1; G.credMul = 1; G.dailyWeapon = null; G.rule = null;
    G.contracts = CTR_MODES[mode] ? (d.contracts || []).filter(id => CONTRACTS.some(c => c.id === id)) : []; G.ctr = {}; G.heat = 0; // difficulty contracts
    for (const id of G.contracts) { G.ctr[id] = 1; G.heat += CONTRACTS.find(c => c.id === id).heat; }
    if (G.heat) {
      const D = G.diff = Object.assign({}, diffTable()[G.di] || DIFFS[1]);
      if (G.ctr.fast) D.espd *= 1.2; if (G.ctr.tough) { D.ehp *= 1.4; D.bhp *= 1.25; } if (G.ctr.bullets) { D.fire *= 1.35; D.bspd *= 1.15; } if (G.ctr.elites) D.elite += .15;
    }
    G.carKind = 'std'; this.pendingTreasure = 0;
    const st = d.settings; G.assist = st.speed < 1 || (st.ahp | 0) > 0 ? 1 : 0; G.gspd = mode === 'dojo' || mode === 'puzzle' ? 1 : clamp(+st.speed || 1, .7, 1); // assist: slower game
    G.ngp = mode === 'story' && d.story.ng && d.story.done.any ? 1 : 0;
    if (mode === 'weekly') {
      const rule = weekRule(G.weekKey); G.rule = rule; G.mods[rule.id] = 1; G.scoreMul = rule.score; const dw = DAILY_WEAPONS(G.dayKey); G.dailyWeapon = dw[R.i(dw.length)].id;
      if (rule.id === 'glass') G.dmgMod = 2; if (rule.id === 'hyper') G.spdMul = 1.3;
    }
    if (mode === 'mayhem') { G.mods.mayhem = 1; G.spdMul = 1.3; G.scoreMul = 2; }
    if (mode === 'daily') {
      const DM = dailyModPool(runDay()), a = R.i(DM.length); let b = R.i(DM.length); if (b === a) b = (a + 1) % DM.length;
      G.mods[DM[a].id] = 1; G.mods[DM[b].id] = 1; const dw = DAILY_WEAPONS(G.dayKey); G.dailyWeapon = dw[R.i(dw.length)].id; G.dailyMods = [DM[a], DM[b]];
      if (G.mods.turbo) G.spdMul = 1.2; if (G.mods.glass) G.dmgMod = 2; if (G.mods.rich) G.credMul = 2; G.scoreMul = 1.5;
    }
    Object.assign(G, {
      reflK: 0, rfHit: 0, chainN: 0, ts: 1, hs: 0, freeze: 0, time: 0, rtime: 0, score: 0, combo: 0, ct: 0, maxCombo: 0, kills: 0, hits: 0, od: 0, odT: 0,
      skill: clamp(.5, G.diff.dda[0], G.diff.dda[1]), parries: 0, grazes: 0, zan: 0, clashes: 0, trainKills: 0, armsCut: 0, crits: 0,
      slowT: 0, slowK: 1, aimHold: 0, seqCar: 1, carKills: 0, carNeed: 10, bossIdx: 0, narrow: 0, msgT: 0, hintT: 0, hint: '',
      ev: '', evT: 16, dark: 0, spawnT: .8, objV: 0, cine: null, runCredits: 0, chalDone: false, rankK: 0, rankPop: 0, won: false, carClearT: 0, mbKills: 0
    });
    G.euid = 0; G.lastCrit = false; G.shooter = -1; Boss.zanCd = 0; this.pendingCourier = false; this.courier = null; this.mbPending = 0; this.mbForce = false; // nothing carries over from the last run
    G.hintSeen = {}; styleReset(); Comms.reset(); Tut.cur = null; G.ckpt = Flow.resumeCk ? G.ckpt : null; G.lastHit = ''; G.lastWho = -1; G.maxRk = 0; G.stormT = 3;
    Ghost.begin(mode); Nemesis.begin(mode, stage);
    EN.reset(); BU.reset(); PB.reset(); CO.reset(); PU.reset(); TETH.reset(); ECHO.reset(); FX.clear();
    Boss.cur = null; this.bossPending = null; this.courier = null; this.introTips = false; this.waveT = 11 + R.f() * 4; this.q.length = 0; this.waveOn = this.wavePause = false; this.lastWave = ''; V.L = V.L0; V.R = V.R0;
    if (G.dailyWeapon) { G.savedWeapon = d.weapon; d.weapon = G.dailyWeapon; }
    resetPlayer(); Pet.begin();
    if (G.dailyWeapon) d.weapon = G.savedWeapon;
    const all = { od: 1, grapple: 1, hijack: 1, web: 1, echo: 1 };
    if (mode === 'story') {
      const s = stage, has = storySkillsFor(s.idx); P.has = has;
      G.obj = s.obj; G.objN = s.obj.n || s.obj.s || 1; this.max = s.max; tuneStage(s); this.rate = s.rate / (1 + G.tune * .08); this.elite = (s.elite || 0) + (G.ngp ? .12 : 0);
      const pool = Object.assign({}, s.pool); // New Game+ brings the new enemy types and a mini-boss into the story
      if (G.ngp && !s.safe && s.obj.t !== 'boss') { if (s.ch >= 1) { pool.medic = 1; pool.miner = .8; } if (s.ch >= 2) pool.mimic = 1; if (s.ch >= 3) pool.mirror = 1; if (s.ch >= 1 && s.obj.t !== 'courier') this.mbPending = MINI_BOSSES[s.ch % 3]; }
      this.setPool(pool);
      Arena.setup(s.traps, s.obj); BG.set(s.theme); G.dark = s.mod && s.mod.dark ? 1 : 0; this.evOn = false; if (s.mod && s.mod.superhot) G.mods.superhot = 1; // 12-1: CHRONO LOCK
      if (s.obj.t === 'boss') { this.bossPending = s.obj.b; this.bossLvl = 1; this.bossChain = s.obj.chain ? s.obj.chain.slice(1) : []; G.chainN = 0; }
      Obj2.begin(s);
      if (s.obj.t === 'courier') this.pendingCourier = true;
    } else {
      P.has = G.ctr.noskill ? { od: 1 } : all; G.obj = null; this.evOn = true; this.elite = 0;
      if (mode === 'dojo') { BG.set('dojo'); this.setPool({}); this.max = 0; this.rate = 99; Arena.setup({}, null); this.evOn = false; Dojo.begin(); }
      else if (mode === 'puzzle') { BG.set('spire'); this.setPool({}); this.max = 0; this.rate = 99; Arena.setup({}, null); this.evOn = false; P.has = {}; }
      else if (mode === 'bossrush') { BG.set('maglev'); this.setPool({ drone: 1 }); this.max = 2; this.rate = 4; Arena.setup({}, null); this.bossPending = BOSS_ORDER[0]; this.bossLvl = 1; this.evOn = false; }
      else if (mode === 'tower') { this.evOn = true; Tower.begin(); }
      else if (mode === 'custom') Custom.begin();
      else if (mode === 'highway') { BG.set('highway'); this.setPool({ drone: 3, bomber: 1, sniper: 1 }); this.max = 3; this.rate = 2.6; Arena.setup({}, null); this.evOn = false; Highway.begin(); }
      else if (mode === 'arena') { this.setPool({ drone: 1 }); this.max = 2; this.rate = 4; Arena.setup({}, null); this.evOn = false; BossArena.begin(); }
      else if (mode === 'raid') { BG.set(RUSH_THEMES[Math.max(0, BOSS_ORDER.indexOf(Live.boss)) % RUSH_THEMES.length]); this.setPool({ drone: 1 }); this.max = 2; this.rate = 4; Arena.setup({}, null); this.bossPending = Live.boss; this.bossLvl = 1; this.evOn = false; }
      else if (mode === 'timeattack' || mode === 'race') { BG.set('spire'); this.setPool({ drone: 5, sniper: 2, bomber: 2, weaver: 2, brute: 1, splitter: 1, medic: .8, miner: .8, mimic: .8 }); this.max = 10; this.rate = .7; Arena.setup({ turrets: 2, portals: 1, barrels: 1 }, null); G.limit = 90; this.mbPending = MINI_BOSSES[R.i(3)]; }
      else { this.setupCar(1); if (mode === 'daily') BG.set(['maglev', 'undercity', 'ghost', 'spire'][G.dayKey % 4]); if (mode === 'weekly') BG.set(['storm', 'spire', 'undercity', 'ghost'][((G.weekKey % 4) + 4) % 4]); }
      if (G.mods.dark) G.dark = 1;
    }
    if (G.heat) G.scoreMul *= 1 + G.heat * .1;
    G.cine = { k: 'stage', t: 0, d: 2.3 }; G.freeze = 2.3;
    Aud.intensity = 1; G.runTrack = runTrackPick(); Aud.music('run', false);
  },
  isBossCar(k) { return k % (G.mods.blitz ? 2 : 3) === 0; },
  setupCar(k, kind) {
    kind = kind || 'std'; G.carKind = kind; G.dark = G.mods.dark ? 1 : 0; this.pendingTreasure = 0;
    this.q.length = 0; this.waveOn = this.wavePause = false; this.waveT = 10 + R.f() * 4;
    G.seqCar = k; G.carKills = 0; G.carNeed = Math.min(40, 8 + k * 3);
    const pool = {}; for (const u of ENDLESS_UNLOCK) if (k >= u[0]) pool[u[1]] = u[2] + Math.max(0, k - u[0]) * .3;
    if (G.mods.bombs) { for (const q in pool) delete pool[q]; pool.bomber = 3 + k * .3; pool.splitter = 2; }
    if (G.mods.snipers) { for (const q in pool) delete pool[q]; pool.sniper = 3 + k * .2; pool.weaver = 2; }
    this.setPool(pool); this.max = Math.min(16, 3 + k); this.rate = Math.max(.55, 1.5 - k * .07); this.elite = Math.min(.25, k * .015);
    if (G.mods.swarm || G.mods.mayhem) { this.max = Math.min(20, this.max + 4); this.rate *= .6; }
    if (G.mods.elite) this.elite += .55;
    const theme = ['maglev', 'undercity', 'ghost', 'spire'][((k - 1) / 3 | 0) % 4];
    if (G.mode !== 'daily' && G.mode !== 'weekly') BG.set(theme);
    Arena.setup({ turrets: 1, portals: k % 2 === 0, barrels: k % 3 === 1, train: k >= 5 ? (k >= 8 ? 2 : 1) : 0 }, null);
    const every = G.mods.blitz ? 2 : 3;
    if (k % every === 0) { const bi = k / every - 1; this.bossPending = BOSS_ORDER[bi % BOSS_ORDER.length]; this.bossLvl = 1 + (bi / BOSS_ORDER.length | 0); this.max = 2; this.rate = 5; }
    if (kind === 'elite') { this.mbForce = true; this.elite += .25; } // the route picked between cars
    else if (kind === 'repair') { P.hp = P.maxHp; G.carNeed = Math.max(5, Math.round(G.carNeed * .6)); }
    else if (kind === 'mystery') { const m = R.i(3); G.mystery = m; if (m === 0) this.pendingTreasure = 3; else if (m === 1) G.dark = 1; else { this.elite += .4; this.mbForce = true; } }
    this.mbPending = 0; // a mini-boss joins about half of the later cars (always, on an elite route car)
    if (!this.bossPending && (this.mbForce || (k >= 4 && R.f() < .5))) this.mbPending = MINI_BOSSES[R.i(MINI_BOSSES.length)];
    this.mbForce = false;
  },
  mbReady() { // the mini-boss enters once the stage is about half done
    if (G.mode === 'story') return G.obj && G.objV >= G.objN * .45;
    if (G.mode === 'timeattack' || G.mode === 'race') return G.time >= 40;
    if (G.mode === 'tower') return Tower.kills >= Tower.need * .45;
    return G.carKills >= G.carNeed * .45;
  },
  liveHostiles() { let n = 0; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.type !== ET.TREASURE) n++; } return n; },
  update(dt, rd) {
    G.time += dt; G.rtime += rd; if (G.styleRk > G.maxRk) G.maxRk = G.styleRk;
    if (G.mode === 'dojo') { Dojo.update(dt); return; }
    if (G.mode === 'puzzle') { G.objV = Puzzle.moves; Puzzle.update(dt); return; }
    Ghost.update(dt);
    if (G.mode === 'arena') BossArena.update(dt);
    if (G.mode === 'highway') { Highway.update(dt); G.objV = Math.floor(Highway.dist / 10); }
    if (G.stage && G.stage.mod && G.stage.mod.storm && G.freeze <= 0 && !G.won) { // orbital storm: strikes all stage long
      G.stormT -= dt; if (G.stormT <= 0) { G.stormT = 2.6; Arena.storm.push({ x: clamp(P.x + (R.f() - .5) * 60, V.L + 30, V.R - 30), y: clamp(P.y + (R.f() - .5) * 60, 60, V.VH - 140), t: 1.3 }); Arena.storm.push({ x: V.L + 40 + R.f() * (V.AW - 80), y: 60 + R.f() * (V.VH - 220), t: 1.3 }); }
    }
    G.skill = damp(G.skill, .5, .02, dt); G.skill = clamp(G.skill, G.diff.dda[0], G.diff.dda[1]);
    if (G.won) return;
    if (this.bossPending && !Boss.cur && G.freeze <= 0) {
      const b = Boss.spawn(this.bossPending, this.bossLvl); this.bossPending = null;
      if (Flow.resumeCk && G.ckpt && G.ckpt.id === b.id) { Boss.restoreCk(b, G.ckpt); G.freeze = Math.min(G.freeze, 1.2); if (G.cine) G.cine.d = Math.min(G.cine.d, 1.2); }
      Flow.resumeCk = false;
    }
    if (!this.introTips && G.freeze <= 0) { // spotlight the stage's objective once play begins
      this.introTips = true; const t = Arena.terms[0], u = Arena.uplink;
      if (t) { Tut.check('term', t.x, t.y, t.zr + 8); Comms.say('term'); } else if (u) Tut.check(u.esc ? 'escort' : 'uplink', u.x, u.y, u.r + 30);
    }
    const B0 = Boss.cur; if (B0 && B0.enter >= 1 && B0.wpOn && B0.dying <= 0 && !B0.shield && G.freeze <= 0) Tut.check('weak', B0.x + Math.cos(B0.wp) * (B0.r + 9), B0.y + Math.sin(B0.wp) * (B0.r + 9), 34);
    if (this.pendingTreasure && G.freeze <= 0) { // mystery car: a treasure run
      for (let k = 0; k < this.pendingTreasure; k++) { const e = spawnEnemy(ET.TREASURE, V.L + 50 + k * (V.AW - 100) / 2, V.VH * (.3 + k * .12), 0); if (e) e.cd = 12; }
      this.pendingTreasure = 0; toast(lt('MYSTERY: TREASURE RUN!'), '#ffd700'); Aud.sfx('star', 2);
    }
    if (this.pendingCourier && G.freeze <= 0) {
      this.pendingCourier = false; const c = spawnEnemy(ET.COURIER, V.CX, V.VH * .25, 0);
      if (c) { c.hp = c.mhp = G.obj.hp * G.diff.ehp; c.spawnT = .3; this.courier = c; this.courierG = c.gen; toast(lt('CATCH THE COURIER'), '#ffd700'); }
    }
    if (this.mbPending && G.freeze <= 0 && !Boss.cur && !this.bossPending && this.mbReady()) {
      const t = this.mbPending; this.mbPending = 0; const top = P.y > V.VH * .5, e = spawnEnemy(t, V.CX, top ? -40 : V.VH + 40, 0);
      if (e) { e.spawnT = .6; FX.call(ltf('MINI-BOSS: {0}', lt(EDEF[t].name)), EDEF[t].col, 3, 22); Aud.sfx('warn'); Aud.sfx('roar'); shake(.3); Comms.say('mini', true); }
    }
    Nemesis.update(); if (G.mode === 'custom') Custom.update(); if (G.mode === 'tower') Tower.update(dt);
    this.waveTick(dt);
    // spawner with dynamic difficulty: interval and cap both follow the live skill estimate
    const cap = Math.min(CFG.maxEnemies - 2, this.max + Math.round(G.skill * 2) + (G.mode === 'timeattack' || G.mode === 'race' ? 4 : 0));
    G.spawnT -= dt;
    if (!this.wavePause && this.pool.length && this.max > 0 && G.spawnT <= 0 && this.liveHostiles() < cap) {
      const t = this.pickType(), el = R.f() < this.elite + G.diff.elite && t !== ET.MINI;
      spawnEnemy(t, null, null, el);
      G.spawnT = this.rate / (G.diff.spawn * (.75 + G.skill * .5));
    }
    // random arena events
    if (this.evOn) {
      G.evT -= dt;
      if (G.evT <= 0) {
        if (G.ev) { if (G.ev === 'blackout' && !G.mods.dark && !(G.stage && G.stage.mod)) G.dark = 0; G.ev = ''; G.evT = G.mode === 'timeattack' || G.mode === 'race' ? 8 : 14 + R.f() * 8; }
        else {
          const k = R.pick(['blackout', 'treasure', 'surge', 'storm']);
          if (k === 'blackout') { G.ev = k; G.dark = 1; G.evT = 9; toast(lt('SYSTEM BLACKOUT — SCORE x2'), '#7df9ff'); Aud.say('Blackout'); }
          else if (k === 'treasure') { const e = spawnEnemy(ET.TREASURE, null, null, 0); if (e) { e.cd = 8; e.y = V.VH * .5; e.x = V.CX; } G.ev = ''; G.evT = 15 + R.f() * 6; toast(lt('TREASURE DRONE — CATCH IT!'), '#ffd700'); }
          else if (k === 'surge') { G.ev = k; G.evT = 10; toast(lt('DATA SURGE — DOUBLE CREDITS'), '#00ff88'); }
          else { G.ev = k; G.evT = 8; G.stormT = 0; toast(lt('EMP STORM — WATCH THE CIRCLES'), '#7df9ff'); }
        }
      }
      if (G.ev === 'storm') { G.stormT -= dt; if (G.stormT <= 0) { G.stormT = 1.5; for (let k = 0; k < 2; k++) Arena.storm.push({ x: V.L + 40 + R.f() * (V.R - V.L - 80), y: 60 + R.f() * (V.VH - 120), t: 1.3 }); Arena.storm.push({ x: P.x, y: P.y, t: 1.3 }); } }
    }
    // objectives
    if (G.mode === 'story') {
      Obj2.update(dt);
      const o = G.obj;
      if (o.t === 'kill') { G.objV = G.kills; if (G.objV >= o.n) this.win(); else if (G.objV * 2 >= o.n) Comms.say('half'); }
      else if (o.t === 'survive' || o.t === 'defend') { G.objV = G.time; if (G.time >= o.s) this.win(); else if (G.time * 2 >= o.s) Comms.say('half'); }
      else if ((o.t === 'hack' || o.t === 'nodes') && G.objV >= o.n) this.win();
      else if (o.t === 'escort') { G.objV = G.time; if (G.time >= o.s) this.win(); else if (G.time * 2 >= o.s) Comms.say('half'); }
      else if (Obj2.check(o)) this.win();
      else if (o.t === 'courier') {
        G.objV = G.time; if (o.s - G.time < 15) Comms.say('courier');
        if (G.time >= o.s && G.state === 'PLAY') { const c = this.courier; if (c && c.alive) { FX.spark(c.x, c.y, '#ffd700', 20); c.alive = false; } Flow.over(false, 'THE COURIER ESCAPED'); }
      }
    } else if (G.mode === 'timeattack' || G.mode === 'race') {
      if (G.time >= G.limit) Flow.over(true);
    }
  },
  /* ---- designed waves: announced set pieces between the regular trickle ---- */
  waveOk() {
    if (Boss.cur || this.bossPending) return false;
    if (G.mode === 'story') { const s = G.stage, t = s.obj.t; return !s.safe && (t === 'kill' || t === 'survive' || t === 'defend' || t === 'hack' || t === 'nodes'); }
    return G.mode === 'tower' || G.mode === 'endless' || G.mode === 'mayhem' || G.mode === 'daily' || G.mode === 'weekly' || G.mode === 'timeattack' || G.mode === 'race';
  },
  waveTick(dt) {
    for (let i = this.q.length - 1; i >= 0; i--) { // queued wave members enter on their own timers
      const s = this.q[i]; s.t -= dt; if (s.t > 0) continue;
      this.q.splice(i, 1); const e = spawnEnemy(s.type, s.x, s.y, s.el); if (e) e.wv = 1;
    }
    if (this.waveOn) {
      this.waveHT += dt; let live = 0;
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.wv && e.al <= 0) live++; }
      this.wavePause = (this.q.length > 0 || live >= 2) && this.waveHT < 30;
      if (!this.q.length && live === 0) {
        this.waveOn = this.wavePause = false; this.waveT = 14 + R.f() * 6;
        if (this.waveHT < 50 && G.state === 'PLAY') { const pts = Math.round(150 * this.waveN * G.diff.score * G.scoreMul); G.score += pts; toast(ltf('WAVE CLEARED  +{0}', fmtNum(pts)), '#00ff88'); Aud.sfx('star', 1); }
      }
      return;
    }
    this.wavePause = false;
    if (!this.waveOk() || G.freeze > 0) return;
    this.waveT -= dt; if (this.waveT > 0) return;
    if (this.liveHostiles() > 5) { this.waveT = 3; return; } // let the roof thin out first
    if (!this.launchWave()) this.waveT = 9;
  },
  launchWave() {
    const has = k => this.pool.indexOf(ENAME2T[k]) >= 0, opts = [];
    for (const w of WAVES) { if (w.id === this.lastWave) continue; let ok = true; for (const k of w.need) if (!has(k)) ok = false; if (ok) opts.push(w); }
    if (!opts.length) return false;
    const w = opts[R.i(opts.length)]; this.lastWave = w.id;
    const sz = clamp((G.mode === 'story' ? .7 + G.stage.ch * .15 : .75 + (simV(17) ? Math.min(G.seqCar, 12) : G.seqCar) * .05) * (simV(19) ? [.7, 1.1, 1.22, 1.35, 1.45] : [.7, 1, 1.12, 1.25])[G.di], .5, simV(19) ? 1.5 : 1.3);
    const n = k => Math.max(2, Math.round(k * sz)), q = this.q, L = V.L + 34, W = V.R - V.L - 68, top = -30, bot = V.VH + 30;
    const far = P.y < V.VH * .5 ? bot : top, near = far === top ? bot : top;
    const add = (type, x, y, t) => q.push({ t, type, x: clamp(x, V.L + 22, V.R - 22), y, el: 0 });
    switch (w.id) {
      case 'pincer': { const k = n(3); for (let i = 0; i < k; i++) { const x = L + W * (i + .5) / k; add(ET.DRONE, x, top, i * .15); add(ET.DRONE, x, bot, .1 + i * .15); } break; }
      case 'swarm': { const k = n(7); for (let i = 0; i < k; i++) { const o = i - (k - 1) / 2; add(ET.DRONE, V.CX + o * 38, far, Math.abs(o) * .14); } break; }
      case 'nest': {
        const k = Math.min(4, n(4)), c = [[V.L + 34, 70], [V.R - 34, 70], [V.L + 34, V.VH - 160], [V.R - 34, V.VH - 160]]; let m = 0;
        for (let i = 0; i < 4 && m < k; i++) { if (dist(c[i][0], c[i][1], P.x, P.y) < 110) continue; add(ET.SNIPER, c[i][0], c[i][1], m * .35); m++; }
        break;
      }
      case 'rush': { const k = Arena.uplink ? 3 : n(5); for (let i = 0; i < k; i++) add(ET.BOMBER, L + R.f() * W, far, i * .32); break; }
      case 'escort': { add(ET.BRUTE, V.CX - 55, far, 0); add(ET.BRUTE, V.CX + 55, far, 0); if (has('warden')) add(ET.WARDEN, V.CX, far, .5); else if (has('sniper')) add(ET.SNIPER, V.CX, far, .5); if (sz > .95) add(ET.BRUTE, V.CX, near, 1.2); break; }
      case 'ambush': { const k = Math.min(4, n(3)), b0 = R.f() * TAU; for (let i = 0; i < k; i++) { const b = b0 + i * TAU / k; add(ET.PHANTOM, P.x + Math.cos(b) * 160, clamp(P.y + Math.sin(b) * 160, 70, V.VH - 150), i * .2); } break; }
      case 'cross': { const k = Math.min(4, n(3)), c = [[V.L + 30, top], [V.R - 30, top], [V.L + 30, bot], [V.R - 30, bot]]; for (let i = 0; i < k; i++) add(ET.WEAVER, c[i][0], c[i][1], i * .25); break; }
      case 'split': { const k = Math.min(5, n(4)); for (let i = 0; i < k; i++) add(ET.SPLITTER, L + W * (i + .5) / k, i % 2 ? top : bot, i * .3); break; }
      case 'guard': { add(ET.WARDEN, V.CX, far, 0); const k = n(3); for (let i = 0; i < k; i++) add(ET.DRONE, V.CX + (i - (k - 1) / 2) * 50, far, .3 + i * .15); break; }
      case 'field': { add(ET.MINER, V.CX - 70, far, 0); add(ET.MINER, V.CX + 70, far, .4); const k = n(3); for (let i = 0; i < k; i++) add(ET.DRONE, L + W * (i + .5) / k, near, .9 + i * .2); break; }
      case 'triage': { add(ET.BRUTE, V.CX - 60, far, 0); add(ET.BRUTE, V.CX + 60, far, 0); add(ET.MEDIC, V.CX, far, .5); if (sz > 1) add(ET.MEDIC, V.CX, near, 1.2); break; }
      case 'mirrors': { const k = Math.min(3, n(3)); for (let i = 0; i < k; i++) add(ET.MIRROR, L + W * (i + .5) / k, i % 2 ? top : bot, i * .3); const m = n(2); for (let i = 0; i < m; i++) add(ET.DRONE, V.CX + (i - (m - 1) / 2) * 60, far, 1 + i * .2); break; }
    }
    if (!q.length) return false;
    if (G.di > 0 && !(G.mode === 'story' && G.stage.ch === 0) && R.f() < .2 + this.elite + G.diff.elite) q[R.i(q.length)].el = 1; // no elite surprises in chapter 1
    this.waveOn = true; this.waveHT = 0; this.waveN = q.length;
    toast(ltf('WAVE: {0}', lt(w.name)), '#ff3b5c'); Aud.sfx('warn'); Comms.say('wave'); shake(.12);
    return true;
  },
  win() { if (G.state === 'PLAY' && !G.won) { G.won = true; Flow.stageClear(); } },
  onKill(e) {
    if (e.type === ET.COURIER && G.mode === 'story') { this.win(); return; }
    if (G.mode === 'story') Obj2.onKill(e);
    if (G.mode === 'tower' && e.type !== ET.MINI && e.type !== ET.CLONE && e.type !== ET.TREASURE) Tower.onKill(e);
    if (e.type !== ET.MINI && e.type !== ET.CLONE && e.type !== ET.TREASURE && (G.mode === 'endless' || G.mode === 'mayhem' || G.mode === 'daily' || G.mode === 'weekly')) {
      if (!Boss.cur && !this.bossPending) { G.carKills += e.mb ? 3 : 1; if (G.carKills >= G.carNeed) this.carClear(); }
    }
  },
  carClear() {
    if (G.state !== 'PLAY') return;
    this.q.length = 0; this.waveOn = this.wavePause = false;
    toast(ltf('CAR {0} CLEARED', G.seqCar), '#00ff88'); Aud.sfx('win'); G.score += Math.round(1000 * G.seqCar * G.diff.score * G.scoreMul * (G.carKind === 'elite' ? 2 : 1));
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.type !== ET.TREASURE && !e.nem) { FX.spark(e.x, e.y, e.col, 8); e.alive = false; } }
    for (let i = 0; i < BU.n; i++) BU.a[i].alive = false;
    const go = kind => { this.setupCar(G.seqCar + 1, kind); G.cine = { k: 'car', t: 0, d: 1.6 }; G.freeze = 1.6; Aud.music('run', false); if (kind && kind !== 'std') this.routeToast(kind); };
    Flow.perk(() => { if (ROUTE_MODES[G.mode] && !this.isBossCar(G.seqCar + 1)) Flow.route(go); else go('std'); });
  },
  routeToast(kind) {
    if (kind === 'repair') toast(lt('REPAIR CAR — SHIELDS RESTORED'), '#7dffb0');
    else if (kind === 'elite') toast(lt('ELITE CAR — DOUBLE CAR BONUS'), '#ffd700');
    else if (kind === 'mystery') toast(lt(['MYSTERY: TREASURE RUN!', 'MYSTERY: LIGHTS OUT — SCORE x2', 'MYSTERY: AMBUSH!'][G.mystery | 0]), '#ff2bd6');
  },
  onBossDead(id) {
    G.narrow = 0; V.L = V.L0; V.R = V.R0; Aud.intensity = 1;
    if (G.mode === 'story') { if (this.bossChain && this.bossChain.length) { Obj2.nextBoss(); return; } this.win(); return; }
    if (G.mode === 'raid') { G.bossIdx++; Live.bossDown(); return; }
    if (G.mode === 'arena') { BossArena.onBossDead(); return; }
    if (G.mode === 'tower') { Tower.onBossDead(); return; }
    if (G.mode === 'bossrush') {
      G.bossIdx++; G.score += Math.round(Math.max(0, 180 - G.time) * 50 * G.diff.score);
      Flow.perk(() => {
        const k = G.bossIdx, nb = BOSS_ORDER.length; BG.set(RUSH_THEMES[k % nb]); this.bossPending = BOSS_ORDER[k % nb]; this.bossLvl = 1 + (k / nb | 0);
        G.cine = { k: 'car', t: 0, d: 1.4 }; G.freeze = 1.4; Aud.music('run', true);
      });
      return;
    }
    this.carClear();
  },
  bomberTarget(e) {
    const s = this.scratch, u = Arena.uplink;
    const dp = dist(P.x, P.y, e.x, e.y);
    if (u && u.hp > 0) { const du = dist(u.x, u.y, e.x, e.y); if (du < dp * 1.4) { s.x = u.x; s.y = u.y; s.d = du; return s; } }
    s.x = P.x; s.y = P.y; s.d = dp; return s;
  },
  stars() {
    const s = G.stage, st = s.star; let s3 = false;
    if (st.t === 'combo') s3 = G.maxCombo >= st.n; else if (st.t === 'parry') s3 = G.parries >= st.n;
    else if (st.t === 'arms') s3 = G.armsCut >= st.n; else if (st.t === 'time') s3 = G.time <= st.n;
    else if (st.t === 'uplink') s3 = Arena.uplink && Arena.uplink.hp / Arena.uplink.mhp * 100 >= st.n;
    else if (st.t === 'clash') s3 = G.clashes >= st.n; else if (st.t === 'train') s3 = G.trainKills >= st.n;
    else if (st.t === 'zandatsu') s3 = G.zan >= st.n;
    return [true, G.hits <= 2, !!s3];
  }
};
