/* =====================================================================
   ENDLESS BOSS ARENA — every boss you have already met, in a seeded
   shuffle, forever. From the second boss on, each round adds a mutation
   (they stack): ARMORED, FRENZY, SWIFT, REGEN, ESCORT. After a full lap
   the bosses also level up. Perk after every boss, as in Boss Rush.
   The boss pool comes from your codex, so it is stored in the replay
   header and a replay never depends on the viewer's save.
   ===================================================================== */
const ARENA_BOSSES = ['warden', 'hydra', 'kage', 'shogun', 'raijin', 'renull', 'leviathan', 'benkei', 'prime', 'valkyrie', 'chimera', 'genesis', 'oryu', 'tenkai', 'izanami', 'hyakki'];
const BOSS_THEME = { warden: 'maglev', hydra: 'undercity', kage: 'ghost', shogun: 'core', raijin: 'storm', renull: 'void', leviathan: 'harbor', benkei: 'temple', prime: 'summit', valkyrie: 'orbital', oryu: 'abyss', tenkai: 'starring', izanami: 'origin', hyakki: 'hollow', chimera: 'datavoid', genesis: 'apex' };
const MUTATIONS = [
  { id: 'armored', name: 'ARMORED', desc: 'Bosses have 40% more health' },
  { id: 'frenzy', name: 'FRENZY', desc: 'Everything fires 25% faster' },
  { id: 'swift', name: 'SWIFT', desc: 'Bosses move and attack 20% faster' },
  { id: 'regen', name: 'REGEN', desc: 'Bosses heal when you stop hitting them' },
  { id: 'escort', name: 'ESCORT', desc: 'Snipers and weavers join the fight' }
];
const BossArena = {
  q: [], last: '', idle: 0, prevHp: 0,
  met() { const bs = pcodex().bs; return ARENA_BOSSES.filter(id => bs[id]); },
  unlocked() { return this.met().length >= 3; },
  begin() {
    G.ab = REPLAY.on ? (REPLAY.hdr.ab || BOSS_ORDER.slice(0, 3)).slice() : this.met(); if (G.ab.length < 3) G.ab = BOSS_ORDER.slice(0, 3);
    G.amut = {}; G.amutN = 0; this.q.length = 0; this.last = ''; this.idle = 0; this.prevHp = 0;
    G.diff = Object.assign({}, G.diff); // FRENZY edits this run's copy, never the shared table
    this.round(0);
  },
  pick() {
    if (!this.q.length) { // a fresh shuffled lap, never the same boss twice in a row
      const a = G.ab.slice(); for (let i = a.length - 1; i > 0; i--) { const j = R.i(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
      if (a[0] === this.last && a.length > 1) { const t = a[0]; a[0] = a[1]; a[1] = t; }
      this.q = a;
    }
    return this.last = this.q.shift();
  },
  round(k) { // k bosses already beaten
    const D = Director, id = this.pick(); BG.set(BOSS_THEME[id] || 'maglev');
    D.bossPending = id; D.bossLvl = 1 + (k / G.ab.length | 0);
    if (k > 0 && G.amutN < MUTATIONS.length) {
      const left = MUTATIONS.filter(m => !G.amut[m.id]), m = left[R.i(left.length)]; G.amut[m.id] = 1; G.amutN++;
      if (m.id === 'frenzy') G.diff.fire *= 1.25;
      if (m.id === 'escort') { D.setPool({ drone: 2, sniper: 1, weaver: 1 }); D.max = 4; D.rate = 2.6; }
      G.amutNew = m; FX.call(ltf('MUTATION: {0}', lt(m.name)), '#ff2bd6', 3, 24); toast(lt(m.desc), '#ff2bd6');
    }
  },
  hpMul() { return G.amut && G.amut.armored ? 1.4 : 1; },
  spd() { return G.amut && G.amut.swift ? 1.2 : 1; },
  update(dt) {
    const b = Boss.cur; if (!b || !G.amut || !G.amut.regen || b.dying > 0 || b.enter < 1) { this.prevHp = b ? b.hp : 0; this.idle = 0; return; }
    if (b.hp < this.prevHp - 1e-6) this.idle = 0; else this.idle += dt;
    if (this.idle > 2.5 && b.hp < b.mhp) { b.hp = Math.min(b.mhp, b.hp + b.mhp * .012 * dt); if ((G.time * 4 | 0) % 4 === 0) FX.spark(b.x, b.y, '#00ff88', 1); }
    this.prevHp = b.hp;
  },
  onBossDead() {
    G.bossIdx++; if (G.bossIdx >= 5) ach('arena5'); if (G.bossIdx >= 10) ach('arena10'); G.score += Math.round((5000 + Math.max(0, 150 - G.time / G.bossIdx) * 60) * G.diff.score * (1 + G.amutN * .2));
    Flow.perk(() => { this.round(G.bossIdx); G.cine = { k: 'car', t: 0, d: 1.4 }; G.freeze = 1.4; Aud.music('run', true); });
  },
  hud() { // the active mutations, for the top line
    if (!G.amutN) return ''; let s = ''; for (const m of MUTATIONS) if (G.amut[m.id]) s += (s ? ' · ' : '') + lt(m.name); return s;
  }
};
