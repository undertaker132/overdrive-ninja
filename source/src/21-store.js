/* =====================================================================
   STORE — crash-safe local save (debounced) + hybrid cloud sync
   ===================================================================== */
const BOUNTY_TYPES = [
  { k: 'kills', d: 'Destroy {n} enemies', n: 40, r: 120 },
  { k: 'parry', d: 'Land {n} perfect parries', n: 6, r: 150 },
  { k: 'combo', d: 'Reach a x{n} combo', n: 15, r: 180, abs: true },
  { k: 'boss', d: 'Defeat {n} boss', n: 1, r: 250 },
  { k: 'graze', d: 'Get {n} near misses', n: 15, r: 120 },
  { k: 'zandatsu', d: 'Land {n} Zandatsu slashes', n: 6, r: 160 },
  { k: 'hijack', d: 'Hijack {n} enemies', n: 6, r: 140 },
  { k: 'crit', d: 'Land {n} critical hits', n: 30, r: 130 },
  { k: 'floor', d: 'Reach floor {n} of the Neon Tower', n: 6, r: 220, abs: true },
  { k: 'relic', d: 'Collect {n} Tower relics', n: 3, r: 180 },
  { k: 'custom', d: 'Clear {n} custom levels', n: 2, r: 150 },
  { k: 'road', d: 'Ride {n} m in Highway Chase', n: 2500, r: 160, abs: true }
];
function newBounty(not) {
  let t, guard = 0;
  do { t = BOUNTY_TYPES[(rnd() * BOUNTY_TYPES.length) | 0]; } while (not && not.indexOf(t.k) >= 0 && ++guard < 20);
  return { k: t.k, d: t.d.replace('{n}', t.n), p: 0, n: t.n, r: t.r, abs: !!t.abs };
}

function migrateV8(o, base) { // v8 core build: {credits, best:{std,ta,br}, meta:{dmg,mag,shield}, weapon}
  base.credits = Math.max(base.credits, o.credits | 0);
  if (o.best) { base.best.endless = Math.max(base.best.endless, o.best.std | 0); base.best.timeattack = Math.max(base.best.timeattack, o.best.ta | 0); base.best.bossrush = Math.max(base.best.bossrush, o.best.br | 0); }
  if (o.meta) { base.upg.dmg = Math.max(base.upg.dmg, Math.min(10, o.meta.dmg | 0)); base.upg.magnet = Math.max(base.upg.magnet, Math.min(6, o.meta.mag | 0)); base.upg.shield = Math.max(base.upg.shield, Math.min(4, o.meta.shield | 0)); }
  if (o.weapon && o.weapon !== 'katana' && WEAPONS.some(w => w.id === o.weapon)) { base.owned[o.weapon] = 1; }
  if (o.chal && o.chal.n) base.chal = null;
  return base;
}
const Store = {
  key: 'od_v9', data: null, dirty: false,
  def() {
    return {
      v: 9, ts: 0, user: { id: 'guest', name: 'GUEST', guest: true },
      credits: 300, weapon: 'katana', owned: { katana: 1 }, skin: 'cyan', skins: { cyan: 1 }, blade: 'std', blades: { std: 1 }, talents: {},
      upg: { dmg: 0, shield: 0, cool: 0, parry: 0, magnet: 0, drone: 0, heat: 0 },
      story: { unlocked: 0, stars: {}, best: {}, diffMax: {}, done: {}, prologue: 0, ng: 0, starsNG: {}, doneNG: {} },
      best: { endless: 0, bossrush: 0, timeattack: 0, mayhem: 0, daily: 0, dailyDate: 0, arena: 0, highway: 0, tower: 0 },
      diff: 1, mode: 'endless', stats: { kills: 0, maxCombo: 0, parries: 0, runs: 0, time: 0 },
      ach: {}, bounties: [], settings: { hud: 'clean', d3: 1, res: 'auto', bat: 'auto', bop: 1, flashes: 'full', tsz: 0, sfx: .8, music: .55, voice: 1, haptics: 1, fx: 'auto', shake: 1, tips: 1, tap: 1, assist: 1, btn: 1, sens: 1, nums: 'all', calm: 0,
        lang: 'auto', cb: 0, lefty: 0, stick: 0, speed: 1, ahp: 0, fps: 0, share: 1, track: 'auto', rival: 1 },
      mastery: {}, tut: {}, weekly: { scores: {}, last: 0, claimed: 0 }, rivals: {}, seenVer: '', dojo: { done: 0, best: 0 },
      chal: null, seen: {}, skillEvo: {}, evoOwn: {}, skillUse: {}, contracts: [], puzzle: { stars: {}, daily: {}, fails: {} }, speed: { best: 0, splits: [], di: -1, runs: 0 },
      codex: { seen: {}, k: {}, bs: {}, b: {} }, title: 'rookie', frame: 'none', maxHeat: 0, live: { games: 0, raids: 0 },
      season: { id: 0, xp: 0, cl: {}, wk: 0, mp: {}, md: {} }, hmast: {}, alt: {}, seasonT10: 0, seasonChamp: 0, syncTs: 0,
      uiAll: null, uiSeen: {}, uiTold: {}, login: { day: 0, n: 0, total: 0 }, refBy: '', refName: '', refGot: 0, refPaid: {}, crew: '', introSeen: 0, hudPos: {}, weapon2: '', wtree: {}, evt: {}, dop: {}, pet: 'none', pets: {}, petXp: {}, tower: { sh: 0, alt: {}, best: 0, runs: 0 }, levels: []
    };
  },
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.key) || 'null'); } catch (e) { d = null; }
    const base = this.def();
    if (!d) { // migrate the v8 core save (credits, upgrades, bests) when present
      try { const o = JSON.parse(localStorage.getItem('od_core_v8') || 'null'); if (o) migrateV8(o, base); } catch (e) { errLog(e); }
      d = base;
    }
    this.data = this.merge(base, d);
    const s = this.data;
    if (!Array.isArray(s.bounties) || s.bounties.length < 3) { s.bounties = []; while (s.bounties.length < 3) s.bounties.push(newBounty(s.bounties.map(b => b.k))); }
    this.sanitize();
  },
  sanitize() {
    const s = this.data;
    if (!MODES.some(m => m.id === s.mode && !m.mp)) s.mode = 'endless';
    if (!WEAPONS.some(w => w.id === s.weapon) || !s.owned[s.weapon]) s.weapon = 'katana';
    if (s.weapon2 && (!WEAPONS.some(w => w.id === s.weapon2) || !s.owned[s.weapon2] || s.weapon2 === s.weapon)) s.weapon2 = '';
    if (!s.wtree || typeof s.wtree !== 'object' || Array.isArray(s.wtree)) s.wtree = {};
    if (!SKINS.some(k => k.id === s.skin) || !s.skins[s.skin]) s.skin = 'cyan';
    if (!BLADE_FX.some(k => k.id === s.blade) || !s.blades[s.blade]) s.blade = 'std';
    if (!s.talents || typeof s.talents !== 'object') s.talents = {};
    const ws = s.weekly.scores, wk = weekKey(); for (const k in ws) if ((k | 0) < wk - 6) delete ws[k]; // keep the last weeks only
    s.diff = clamp(s.diff | 0, 0, DIFFS.length - 1);
    if (typeof Gate !== 'undefined') Gate.init();
    if (typeof s.crew !== 'string') s.crew = '';
  },
  merge(base, d) { // deep-merge plain objects so new fields survive old saves
    const out = base;
    for (const k in d) {
      if (!Object.prototype.hasOwnProperty.call(d, k)) continue;
      const v = d[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) out[k] = this.merge(out[k], v);
      else out[k] = v;
    }
    return out;
  },
  touch() { this.dirty = true; },
  lock: 0, // set while a replay runs on a copy of the save: nothing may be written
  flush(force) {
    if (this.lock) return;
    if (!this.dirty && !force) return;
    this.dirty = false; this.data.ts = Date.now();
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { errLog(e); }
    Cloud.push(force);
  },
  stars() { let n = 0; const st = this.data.story.stars; for (const k in st) n += st[k] | 0; return n; }
};

function weeklyFields(d) { const o = {}; const ws = d.weekly.scores; for (const k in ws) o['wk' + k] = ii(ws[k]); return o; }
/* ---------- Cloud: viewer identity = account; guest = local only ----------
   data/users/<id>/save : private save (whole document, last writer wins)
   players/<id>         : public leaderboard stats (everyone reads, each writes own)
   ghosts/<id>, feedback/<id>, stats/<id> : see 64-social.js
   Viewers who may not write (view-only links) still read the boards. */
const Cloud = {
  db: null, u: null, uid: null, ready: false, lastPush: 0, pending: false, busy: false, readOnly: false, owner: false,
  async init() {
    if (typeof window === 'undefined' || !window.claude || typeof window.claude.use !== 'function') return;
    try {
      const u = await window.claude.use('user'), db = await window.claude.use('db');
      if (!u || !db) return;
      const id = await u.id(); if (!id) return;
      this.u = u; this.db = db; this.uid = id;
      try { this.owner = !!(await u.isOwner()); } catch (e) { this.owner = false; }
      try { if ((await u.can('data.write')) === false) this.readOnly = true; } catch (e) { errLog(e); }
      let me = null; try { me = await u.me(); } catch (e) { errLog(e); }
      const d = Store.data;
      d.user = { id, name: (me && me.name) || 'PLAYER', guest: false };
      try {
        const s = await db.doc('data/users/' + id + '/save').get();
        const c = s.exists ? s.data() : null;
        if (c && c.d && c.d.v === 9) {
          const cts = tsn(c.ts), lts = tsn(d.ts), sync = tsn(d.syncTs);
          const cloudChanged = sync ? cts > sync : cts > lts, localChanged = sync ? lts > sync + 1500 : ((d.stats && d.stats.runs) | 0) > 0;
          if (cts !== lts && cloudChanged && localChanged) this.conflict = { ts: cts, d: JSON.parse(JSON.stringify(c.d)) }; // played on two devices: the player chooses
          else if (cts > lts) {
            const keepUser = d.user, keepSettings = d.settings;
            Store.data = Store.merge(Store.def(), JSON.parse(JSON.stringify(c.d)));
            Store.data.user = keepUser; Store.data.settings = keepSettings; Store.data.syncTs = cts;
          }
        } else if (c && c.d && c.d.v !== 9) migrateV8(c.d, Store.data); // older cloud save: carry credits, bests, upgrades
        Store.sanitize();
      } catch (e) { errLog(e); }
      this.ready = true;
      if (this.conflict) { if (typeof UI !== 'undefined' && UI.syncConflict) UI.syncConflict(); return; } // nothing is written until the player decides
      Store.touch(); Store.flush(true);
      if (typeof UI !== 'undefined' && UI.refreshProfile) UI.refreshProfile();
      this.afterReady();
    } catch (e) { errLog(e); }
  },
  conflict: null,
  async afterReady() { // leaderboard row, last week's prize, rival alerts, play stats
    try { await this.publishStats(); } catch (e) { errLog(e); }
    try { await Tune.load(true); } catch (e) { errLog(e); }
    try { await Invite.inviterCheck(); } catch (e) { errLog(e); }
    try { await this.weeklyPrize(); } catch (e) { errLog(e); }
    try { await Rivals.check(); } catch (e) { errLog(e); }
    try { Stats.push(); } catch (e) { errLog(e); }
    if (UI.cur === 'title') { $('tCreator').classList.toggle('hidden', !this.owner); UI.renderRivals(); UI.titleV12(); }
  },
  async weeklyPrize() { // the top 3 of last week's board get credits once
    const w = Store.data.weekly, last = weekKey() - 1;
    if ((w.claimed | 0) >= last || !((ii(w.scores[last])) > 0)) return;
    const f = 'wk' + last, rows = await this.top(f); if (!rows) return;
    const i = rows.filter(r => (ii(r[f])) > 0).findIndex(r => r.me);
    w.claimed = last; Store.touch();
    if (i >= 0 && i < 3) { const pr = [500, 300, 200][i]; Store.data.credits += pr; ach('podium'); toastDom(ltf('WEEKLY PRIZE: #{0} LAST WEEK  +{1} CR', i + 1, pr)); if (UI.refreshProfile) UI.refreshProfile(); }
  },
  push(force) {
    if (!this.ready || this.readOnly || this.conflict) return;
    if (Store.lock) { if (!this.pending) { this.pending = true; setTimeout(() => { this.pending = false; this.push(true); }, 3000); } return; }
    const now = Date.now();
    if (!force && now - this.lastPush < 15000) { // throttle: schedule one trailing push
      if (!this.pending) { this.pending = true; setTimeout(() => { this.pending = false; this.push(true); }, 15000 - (now - this.lastPush)); }
      return;
    }
    if (this.busy) { this.pending = true; return; }
    this.lastPush = now; this.busy = true;
    const d = Store.data, snap = tsn(d.ts);
    this.db.doc('data/users/' + this.uid + '/save').set({ ts: snap, d: JSON.parse(JSON.stringify(d)) })
      .then(() => { // remember the last synced version (written straight to the local save, so ts stays the same)
        if (Store.data === d && !Store.lock) { d.syncTs = snap; try { localStorage.setItem(Store.key, JSON.stringify(d)); } catch (e) { errLog(e); } }
      }, e => { if (e && e.code === 'invalid_argument') this.readOnly = true; })
      .then(() => { this.busy = false; });
  },
  async publishStats() {
    if (!this.ready || this.readOnly || Store.lock) return;
    const d = Store.data, b = d.best;
    let ch = 0; for (let i = 0; i < STAGES.length; i++) if (d.story.stars[STAGES[i].id]) ch = STAGES[i].ch + 1;
    try {
      await this.db.doc('players/' + this.uid).set({
        bestStd: ii(b.endless), bestTa: ii(b.timeattack), bestBr: ii(b.bossrush), bestAr: ii(b.arena), bestHw: ii(b.highway), bestTw: ii(b.tower), bestMay: ii(b.mayhem),
        bestDaily: ii(b.daily), dailyDate: b.dailyDate | 0, stars: Store.stars(), chapter: ch,
        combo: d.stats.maxCombo | 0, parries: d.stats.parries | 0, kills: d.stats.kills | 0, v: 12, un: d.story.unlocked | 0, rc: invCode(this.uid), rb: d.refBy || '', crew: d.crew || '', skin: d.skin, blade: d.blade, title: d.title || 'rookie', frame: d.frame || 'none', speedMs: d.speed.best | 0, speedDi: d.speed.di | 0,
        ...weeklyFields(d)
      });
    } catch (e) { if (e && e.code === 'invalid_argument') this.readOnly = true; }
  },
  async top(field, dailyOnly, asc) {
    if (!this.ready) return null;
    let q = this.db.collection('players');
    if (dailyOnly) q = q.where('dailyDate', '==', todayKey());
    if (asc) q = q.where(field, '>', 0); // lower is better (speedrun times)
    const snap = await q.orderBy(field, asc ? 'asc' : 'desc').limit(20).get();
    const rows = snap.docs.map(x => Object.assign({ id: x.id }, x.data()));
    let names = {}; try { names = await this.u.profiles(rows.map(r => r.id)); } catch (e) { errLog(e); }
    rows.forEach(r => { r.name = (names[r.id] && names[r.id].name) || 'Player'; r.me = r.id === this.uid; });
    return rows;
  }
};
