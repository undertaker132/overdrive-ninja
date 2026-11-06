/* =====================================================================
   NEON TOWER — a rogue-lite climb. Every floor is a room with a kill
   target and (from floor 2) a curse; every 5th floor is a boss. Between
   floors you draft a perk; after a boss you pick one of three RELICS,
   run-long items with strong effects. One life: when you fall, the run
   ends and turns into SOUL SHARDS for the Tower Altar, where permanent
   upgrades make the next climb easier. Everything that changes the run
   is seeded or a recorded action, so replays and ghosts climb the same.
   ===================================================================== */
const TOWER_THEMES = ['maglev', 'undercity', 'ghost', 'spire', 'storm', 'orbital', 'datavoid', 'apex', 'sakura', 'abyss'];
const TOWER_CURSES = [
  { id: 'dark', name: 'LIGHTS OUT', desc: 'Permanent blackout' },
  { id: 'swarm', name: 'SWARM', desc: '+50% enemies' },
  { id: 'elite', name: 'ELITE GUARD', desc: 'Many more elite enemies' },
  { id: 'turbo', name: 'TURBO', desc: 'Everything moves 20% faster' },
  { id: 'ice', name: 'ZERO FRICTION', desc: 'ZERO FRICTION: ICE ROOF' },
  { id: 'bombs', name: 'BOMB FLOOR', desc: 'Only bombers and splitters' },
  { id: 'snipers', name: 'SNIPER NEST', desc: 'Only snipers and weavers' },
  { id: 'mines', name: 'MINEFIELD', desc: 'Mines keep appearing on the roof' },
  { id: 'heavy', name: 'HEAVY BLADE', desc: 'Dash charges refill 40% slower' }
];
const TOWER_EVENTS = [ // one featured climb per week; event climbs are not ranked
  { id: 'twin', name: 'TWIN CURSES', desc: 'Two curses on every floor. x2 soul shards.' },
  { id: 'glass', name: 'GLASS TOWER', desc: 'One shield for the whole climb, but a relic every third floor.' },
  { id: 'ascent', name: 'BOSS ASCENT', desc: 'A boss every third floor. x1.5 soul shards.' },
  { id: 'storm', name: 'RELIC STORM', desc: 'Start with two relics. Enemies have 25% more health.' }
];
function towerEvent() { return TOWER_EVENTS[((weekKey() % TOWER_EVENTS.length) + TOWER_EVENTS.length) % TOWER_EVENTS.length]; }
const RELICS = [
  { id: 'fang', name: 'VAMPIRE FANG', desc: 'Every 8 kills repairs 1 shield', c: '#ff3b5c' },
  { id: 'phoenix', name: 'PHOENIX FEATHER', desc: 'Survive a fatal hit once with full shields', c: '#ff9a3d' },
  { id: 'glass', name: 'GLASS FANG', desc: '+60% damage, -1 max shield', c: '#e8fbff' },
  { id: 'hourglass', name: 'HOURGLASS', desc: 'Every floor starts in slow motion with full charges', c: '#7df9ff' },
  { id: 'crown', name: 'GREED CROWN', desc: 'x2 credits and score, enemies +15% health', c: '#ffd700' },
  { id: 'thunder', name: 'THUNDER IDOL', desc: 'Every 5th kill strikes the 3 nearest enemies', c: '#9b8bff' },
  { id: 'mask', name: 'ONI MASK', desc: 'Overdrive charges 30% faster and lasts 2.5s longer', c: '#ff0844' },
  { id: 'heart', name: 'IRON HEART', desc: '+2 max shields', c: '#00ff88' },
  { id: 'storm', name: 'STORM BLADE', desc: '+1 dash charge and 20% more reach', c: '#7df9ff' },
  { id: 'clover', name: 'LUCKY CLOVER', desc: '+15% crit chance', c: '#7dff6a' },
  { id: 'halo', name: 'GUARDIAN HALO', desc: 'Every floor starts with 3s of invulnerability, and lifts you off your last shield', c: '#fff3c4' },
  { id: 'pact', name: 'BLOOD PACT', desc: 'Double damage, but every boss floor costs a shield', c: '#b0001e' }
];
const RELIC_BY_ID = {}; for (const r of RELICS) RELIC_BY_ID[r.id] = r;
const ALTAR = [ // permanent upgrades bought with soul shards
  { id: 'hp', name: 'SOUL ARMOR', desc: '+1 starting shield in the Tower', cost: [15, 40], max: 2 },
  { id: 'four', name: 'FOURTH OFFERING', desc: 'Relic choices show 4 relics', cost: [35], max: 1 },
  { id: 'start', name: 'HEIRLOOM', desc: 'Start every climb with a random relic', cost: [60], max: 1 },
  { id: 'rest', name: 'SHRINE', desc: 'Every 3rd floor repairs 1 shield (instead of every 4th)', cost: [45], max: 1 }
];
function towerData() { const d = Store.data; if (!d.tower) d.tower = { sh: 0, alt: {}, best: 0, runs: 0 }; return d.tower; }
const Tower = {
  alt: {}, floor: 1, need: 10, kills: 0, curse: null, relicNext: false,
  begin() {
    this.alt = REPLAY.on ? Object.assign({}, REPLAY.hdr.tw || {}) : Object.assign({}, towerData().alt); G.twAlt = this.alt;
    G.twBoss = 0; P.fangN = P.thN = 0; P.phx = 0; this.rc0 = P.rc; this.mineT = 0;
    G.twEv = REPLAY.on ? (REPLAY.hdr.tev || '') : FChal.cur && FChal.cur.m === 'tower' ? FChal.cur.ev : (towerData().ev ? towerEvent().id : '');
    if (this.alt.hp) { P.maxHp += this.alt.hp; P.hp = P.maxHp; }
    if (this.alt.start) { const r = this.rollRelics(1)[0]; if (r) applyPerk(r.id); }
    if (G.twEv === 'glass') { P.maxHp = 1; P.hp = 1; }
    if (G.twEv === 'storm') { for (const r of this.rollRelics(2)) applyPerk(r.id); G.diff = Object.assign({}, G.diff); G.diff.ehp *= 1.25; }
    this.setupFloor(1, true);
  },
  bossFloor(n) { return n % (G.twEv === 'ascent' ? 3 : 5) === 0; },
  relicFloor(n) { return G.twEv === 'glass' ? n % 3 === 0 || n === 2 : this.bossFloor(n) || n === 2; },
  setupFloor(n, first) {
    this.floor = n; G.seqCar = n; this.kills = 0; this.need = Math.min(40, 8 + n * 2);
    const D = Director; D.q.length = 0; D.waveOn = D.wavePause = false; D.waveT = 10 + R.f() * 4; D.bossPending = null; D.mbPending = 0;
    G.mods = {}; G.spdMul = 1; G.dark = 0; G.dmgMod = 1;
    const boss = this.bossFloor(n);
    this.curse = !boss && n >= 2 ? TOWER_CURSES[R.i(TOWER_CURSES.length)] : null; this.curse2 = null;
    if (this.curse && G.twEv === 'twin') { let c2 = TOWER_CURSES[R.i(TOWER_CURSES.length)]; if (c2 === this.curse) c2 = TOWER_CURSES[(TOWER_CURSES.indexOf(c2) + 1) % TOWER_CURSES.length]; this.curse2 = c2; G.mods[c2.id] = 1; }
    if (this.curse) G.mods[this.curse.id] = 1;
    P.rc = G.mods.heavy ? this.rc0 * 1.4 : this.rc0; this.mineT = 1.5;
    if (G.mods.turbo) G.spdMul = 1.2; if (G.mods.dark) G.dark = 1;
    const k = Math.min(n, 12), pool = {}; for (const u of ENDLESS_UNLOCK) if (k >= u[0]) pool[u[1]] = u[2] + Math.max(0, n - u[0]) * .25;
    if (G.mods.bombs) { for (const q in pool) delete pool[q]; pool.bomber = 3 + n * .3; pool.splitter = 2; }
    if (G.mods.snipers) { for (const q in pool) delete pool[q]; pool.sniper = 3 + n * .2; pool.weaver = 2; }
    D.setPool(pool); D.max = Math.min(16, 3 + n); D.rate = Math.max(.5, 1.45 - n * .06); D.elite = Math.min(.3, n * .018);
    if (G.mods.swarm) { D.max = Math.min(20, D.max + 4); D.rate *= .6; }
    if (G.mods.elite) D.elite += .5;
    BG.set(TOWER_THEMES[((n - 1) / 2 | 0) % TOWER_THEMES.length]);
    Arena.setup({ turrets: n >= 3 ? 1 : 0, portals: n % 2 === 0, barrels: n % 3 === 1, train: 0 }, null);
    if (boss) { const bi = n / (G.twEv === 'ascent' ? 3 : 5) - 1; D.bossPending = BOSS_ORDER[bi % BOSS_ORDER.length]; D.bossLvl = 1 + (bi / BOSS_ORDER.length | 0); D.max = 2; D.rate = 5; }
    else if (n >= 4 && n % 3 === 1) D.mbPending = MINI_BOSSES[R.i(MINI_BOSSES.length)];
    if (P.perks.hourglass) { G.slowT = 2.4; G.slowK = .4; P.ch = P.maxCh; }
    if (P.perks.halo) { P.inv = Math.max(P.inv, 3 + (first ? 2.3 : 1.8)); if (P.hp === 1 && P.maxHp > 1) P.hp = 2; }
    if (P.perks.pact && boss && P.hp > 1) { P.hp--; toast(lt('BLOOD PACT — -1 SHIELD'), '#b0001e'); }
    if (!first) { const every = this.alt.rest ? 3 : 4; if ((n - 1) % every === 0 && P.hp < P.maxHp) { P.hp++; toast(lt('SHRINE — +1 SHIELD'), '#7dffb0'); } }
    G.cine = { k: 'car', t: 0, d: first ? 2.3 : 1.8, l2: boss ? ltf('BOSS FLOOR {0}', n) : ltf('FLOOR {0}', n), l3: this.curse ? lt('CURSE') + ': ' + lt(this.curse.name) + (this.curse2 ? ' + ' + lt(this.curse2.name) : '') : '' };
    if (!first) G.freeze = 1.8;
  },
  onKill(e) {
    if (Boss.cur || Director.bossPending || G.state !== 'PLAY') return;
    this.kills += e.mb ? 3 : 1; if (this.kills >= this.need) this.clear();
  },
  onBossDead() { G.twBoss++; G.bossIdx++; this.clear(); },
  clear() {
    if (G.state !== 'PLAY') return; const n = this.floor, D = Director;
    D.q.length = 0; D.waveOn = D.wavePause = false;
    toast(ltf('FLOOR {0} CLEARED', n), '#00ff88'); Aud.sfx('win');
    G.score += Math.round(1200 * n * G.diff.score * G.scoreMul * (this.bossFloor(n) ? 2 : 1));
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.type !== ET.TREASURE && !e.nem) { FX.spark(e.x, e.y, e.col, 8); e.alive = false; } }
    for (let i = 0; i < BU.n; i++) BU.a[i].alive = false;
    if (n >= 5) ach('tower5'); if (n >= 10) ach('tower10'); if (n >= 20) ach('tower20');
    const go = () => { this.setupFloor(n + 1, false); Aud.music('run', false); };
    bounty('floor', n, true);
    Flow.perk(go, this.relicFloor(n)); // a relic after every boss, and one early so the first climb has one
  },
  rollRelics(want) {
    const pool = RELICS.filter(r => !P.perks[r.id]), out = [], n = want || (this.alt.four ? 4 : 3);
    while (out.length < n && pool.length) out.push(pool.splice(R.i(pool.length), 1)[0]);
    return out.map(r => ({ id: r.id, name: r.name, desc: r.desc, r: 3, max: 1, relic: 1, c: r.c }));
  },
  applyRelic(id) {
    if (id === 'glass') { P.dmgMul *= 1.6; P.maxHp = Math.max(1, P.maxHp - 1); P.hp = Math.min(P.hp, P.maxHp); }
    else if (id === 'crown') { G.credMul *= 2; G.scoreMul *= 2; G.diff = Object.assign({}, G.diff); G.diff.ehp *= 1.15; }
    else if (id === 'mask') P.odMul *= 1.3;
    else if (id === 'heart') { P.maxHp += 2; P.hp += 2; }
    else if (id === 'storm') { P.maxCh++; P.ch++; P.reach += .2; }
    else if (id === 'clover') P.critAdd += .15;
    else if (id === 'pact') P.dmgMul *= 2;
    bounty('relic', 1);
    if (G.state !== 'MENU') { const r = RELIC_BY_ID[id]; FX.call(ltf('RELIC: {0}', lt(r.name)), r.c, 3, 20); FX.ring(P.x, P.y, 120, r.c, 5); }
  },
  /* run-long relic effects, called from the kill and hurt code */
  kill(e) {
    if (P.perks.fang && ++P.fangN >= 8) { P.fangN = 0; if (P.hp < P.maxHp) { P.hp++; FX.text(P.x, P.y - 40, lt('+1 SHIELD'), '#ff3b5c', 15); } }
    if (P.perks.thunder && ++P.thN >= 5) {
      P.thN = 0; const hit = [];
      for (let k = 0; k < 3; k++) { let best = null, bd = 1e9; for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (!o.alive || o.al > 0 || o === e || hit.indexOf(o) >= 0) continue; const dd = dist(o.x, o.y, e.x, e.y); if (dd < bd) { bd = dd; best = o; } } if (!best) break; hit.push(best); }
      let px = e.x, py = e.y; for (const o of hit) { FX.streak(px, py, Math.atan2(o.y - py, o.x - px), '#c9b8ff', Math.min(8, dist(px, py, o.x, o.y) / 30)); FX.spark(o.x, o.y, '#9b8bff', 8); px = o.x; py = o.y; damageEnemy(o, 2, 0, 7); }
      if (hit.length) { Aud.bell(1800, .2, .06, 'square'); FX.ring(e.x, e.y, 50, '#9b8bff', 3); }
    }
  },
  revive() {
    if (!P.perks.phoenix || P.phx) return false;
    P.phx = 1; P.hp = P.maxHp; P.inv = 2.5; G.od = Math.min(100, G.od + 50);
    FX.ring(P.x, P.y, 320, '#ff9a3d', 7); FX.boom(P.x, P.y, 160, '#ff9a3d'); FX.call(lt('PHOENIX REBIRTH'), '#ff9a3d', 3, 24); Aud.sfx('od');
    for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o.al <= 0 && dist(o.x, o.y, P.x, P.y) < 160 + o.r) damageEnemy(o, 3, Math.atan2(o.y - P.y, o.x - P.x), 7); }
    return true;
  },
  shards(floor, bosses) { const b = Math.max(0, floor - 1) + bosses * 3; return Math.round(b * (G.twEv === 'twin' ? 2 : G.twEv === 'ascent' ? 1.5 : 1)); },
  update(dt) { // minefield curse: new mines keep landing away from you
    if (!G.mods.mines || G.freeze > 0 || G.state !== 'PLAY') return; this.mineT -= dt; if (this.mineT > 0) return; this.mineT = 7;
    for (let k = 0; k < 4; k++) { const x = V.L + 40 + R.f() * (V.R - V.L - 80), y = 70 + R.f() * (V.VH - 240); if (dist(x, y, P.x, P.y) > 110) Arena.layMine(x, y, ET.MINER); }
  },
  /* the end of a climb: shards go to the altar (never in replays) */
  bank() {
    const t = towerData(), got = this.shards(this.floor, G.twBoss | 0);
    t.sh += got; t.runs = (t.runs | 0) + 1; if (this.floor > (t.best | 0)) t.best = this.floor;
    Store.touch(); return got;
  },
  buy(id) {
    const t = towerData(), a = ALTAR.find(q => q.id === id), lv = t.alt[id] | 0; if (!a || lv >= a.max) return false;
    const c = a.cost[lv]; if (t.sh < c) return false; t.sh -= c; t.alt[id] = lv + 1; Store.touch(); return true;
  }
};
