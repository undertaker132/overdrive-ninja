/* =====================================================================
   VERSION 67: ELEMENTS AND REACTIONS
   Hits can carry an element: FIRE, FROST, VOLT or VENOM. The elemental
   blades carry their own (Phoenix Blade: fire; Cryo: frost; Thunder Fang
   and Storm Caller: volt; Serpent Chain: venom), and four new upgrade
   cards add one each (EMBER, RIME, ARC and VIPER EDGE). With more than
   one element, a hit leaves one of them on the enemy for 4 seconds (a
   colored orb above it), and the next hit on that enemy brings a
   different one and sets off a REACTION:
   · fire + frost   MELT            a heavy burst on the target
   · fire + volt    OVERLOAD        an explosion that hits everything around
   · frost + volt   SUPERCONDUCT    stunned, and takes +40% damage for 4 s
   · venom + fire   TOXIC FLARE     a burning cloud around the target
   · venom + frost  SHATTER         a burst, and +40% damage taken for 4 s
   · venom + volt   PARALYSIS       everything nearby is stunned
   A sim rule, so it only applies to runs played or recorded with version
   67 or newer; the new cards are recorded after every older card, so older
   replays keep their numbers.
   ===================================================================== */
const ELEM_PERKS = [
  { id: 'efire', r: 1, el: 'fire', name: 'EMBER EDGE', desc: 'Your hits carry FIRE. Mix two elements on one enemy to set off a reaction', max: 1 },
  { id: 'efrost', r: 1, el: 'frost', name: 'RIME EDGE', desc: 'Your hits carry FROST. Mix two elements on one enemy to set off a reaction', max: 1 },
  { id: 'evolt', r: 1, el: 'volt', name: 'ARC EDGE', desc: 'Your hits carry VOLT. Mix two elements on one enemy to set off a reaction', max: 1 },
  { id: 'evenom', r: 1, el: 'venom', name: 'VIPER EDGE', desc: 'Your hits carry VENOM. Mix two elements on one enemy to set off a reaction', max: 1 }
];
const El = {
  COL: { fire: '#ff6a1a', frost: '#9be8ff', volt: '#ffe14d', venom: '#7dff5a' },
  WPN: { phoenix: 'fire', cryo: 'frost', thunder: 'volt', stormfang: 'volt', serpent: 'venom' },
  ORDER: ['fire', 'frost', 'volt', 'venom'],
  pk: null, i: 0, busy: 0, n: 0,
  /* the player's elements, in a fixed order: the blade's first, then the cards' */
  list() { const L = [], w = P.w && this.WPN[P.w.id]; if (w) L.push(w); for (const p of ELEM_PERKS) if (P.perks[p.id] && L.indexOf(p.el) < 0) L.push(p.el); return L; },
  on(e) { return e.elU > G.time && e.elId === e.uid; },
  vul(e) { return e.vulU > G.time && e.vulId === e.uid; },
  apply(e) {
    if (this.pk !== P.perks) { this.pk = P.perks; this.i = 0; this.n = 0; }
    const L = this.list(); if (!L.length) return;
    if (this.on(e)) { const k = L.find(x => x !== e.el); if (k) { const a = e.el; e.elU = 0; this.react(e, a, k); return; } } // a different element sets off the reaction
    const k = L[this.i++ % L.length];
    e.el = k; e.elId = e.uid; e.elU = G.time + 4;
  },
  around(e, r, fn) { for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o === e || !o.alive || o.al > 0) continue; const dx = o.x - e.x, dy = o.y - e.y; if (dx * dx + dy * dy < (r + (o.r || 0)) * (r + (o.r || 0))) fn(o, Math.atan2(dy, dx)); } },
  stun(o, s) { o.stun = Math.max(o.stun || 0, o.mb || o.elite ? s * .4 : s); },
  react(e, a, b) {
    const has = x => a === x || b === x, D = k => Leg.dmg(k), ang = Math.atan2(e.y - P.y, e.x - P.x); let nm = '', c = '#fff';
    this.busy = 1; this.n++;
    try {
      if (has('fire') && has('frost')) { nm = 'MELT'; c = '#ff9a6a'; FX.ring(e.x, e.y, 60, '#9be8ff', 4); FX.spark(e.x, e.y, '#ff6a1a', 14); damageEnemy(e, D(3), ang, 2); }
      else if (has('fire') && has('volt')) { nm = 'OVERLOAD'; c = '#ffb43d'; FX.ring(e.x, e.y, 130, '#ff6a1a', 6); FX.ring(e.x, e.y, 80, '#ffe14d', 3); shake(.25);
        const hit = []; this.around(e, 130, (o, q) => hit.push([o, q])); damageEnemy(e, D(1.6), ang, 2); for (const [o, q] of hit) { o.kbx = (o.kbx || 0) + Math.cos(q) * 220; o.kby = (o.kby || 0) + Math.sin(q) * 220; damageEnemy(o, D(1.6), q, 2); } }
      else if (has('frost') && has('volt')) { nm = 'SUPERCONDUCT'; c = '#bfe9ff'; FX.ring(e.x, e.y, 70, '#9be8ff', 4); FX.bolt(e.x - 30, e.y - 40, e.x + 20, e.y + 30, '#ffe14d', 1); this.stun(e, 1.2); e.vulU = G.time + 4; e.vulId = e.uid; damageEnemy(e, D(.8), ang, 2); }
      else if (has('venom') && has('fire')) { nm = 'TOXIC FLARE'; c = '#c8ff4d'; FX.ring(e.x, e.y, 150, '#7dff5a', 5); FX.ring(e.x, e.y, 100, '#ff6a1a', 3);
        const hit = []; this.around(e, 150, (o, q) => hit.push([o, q])); damageEnemy(e, D(1.2), ang, 2); for (const [o, q] of hit) damageEnemy(o, D(1.2), q, 2); }
      else if (has('venom') && has('frost')) { nm = 'SHATTER'; c = '#b8fff0'; FX.ring(e.x, e.y, 56, '#9be8ff', 4); FX.spark(e.x, e.y, '#e8fbff', 16); e.vulU = G.time + 4; e.vulId = e.uid; damageEnemy(e, D(2.2), ang, 2); }
      else if (has('venom') && has('volt')) { nm = 'PARALYSIS'; c = '#e6ff4d'; FX.ring(e.x, e.y, 140, '#ffe14d', 4); this.stun(e, 1); this.around(e, 140, o => { this.stun(o, .8); FX.bolt(e.x, e.y, o.x, o.y, '#7dff5a', 1); }); damageEnemy(e, D(.8), ang, 2); }
      FX.text(e.x, e.y - (e.r || 14) - 26, lt(nm) + '!', c, 15, true); Aud.sfx('zan');
      bounty('react', 1); try { Season.track('react', 1); } catch (er) { errLog(er); }
      if (!REPLAY.on) { const d = Store.data; d.reactN = (d.reactN | 0) + 1; ach('react1'); if (d.reactN >= 100) ach('react100'); }
      hint('react', lt('REACTION! Two different elements on one enemy set one off.'));
    } finally { this.busy = 0; }
  }
};
{
  // recorded picks: every older list first, the elemental cards after them
  PERK_ALL = function () { if (!PERK_ALL.c) PERK_ALL.c = PERKS.map(p => p.id).concat(SYNERGIES.map(s => s.id)).concat(RELICS.map(r => r.id)).concat(LEGENDS.map(l => l.id)).concat(ELEM_PERKS.map(p => p.id)); return PERK_ALL.c; };
  ELEM_PERKS.forEach(p => { LEG_BY[p.id] = p; }); // (the pause screen and the run summary find the cards here)
  // the cards: from version 67, sometimes one elemental card in the middle slot (at most two per run)
  const rp7 = UI.rollPerks.bind(UI);
  UI.rollPerks = function () {
    const out = rp7();
    if (simV(67) && out.length >= 2 && G.mode !== 'puzzle' && !out[1].leg && !out[1].need) {
      const own = ELEM_PERKS.filter(p => P.perks[p.id]).length, w = P.w && El.WPN[P.w.id], pool = ELEM_PERKS.filter(p => !P.perks[p.id] && p.el !== w);
      if (own < 2 && pool.length && R.f() < (w && !own ? .4 : .22)) out[1] = pool[Math.floor(R.f() * pool.length) % pool.length];
    }
    return out;
  };
  const rn7 = UI.renderPerks.bind(UI);
  UI.renderPerks = function (list) { rn7(list); try { const box = $('pkList'); list.forEach((p, i) => { if (p.el && box.children[i]) { box.children[i].classList.add('el67'); box.children[i].style.setProperty('--elc', El.COL[p.el]); } }); } catch (e) { errLog(e); } };
  const ap7 = applyPerk;
  applyPerk = function (id) {
    const p = ELEM_PERKS.find(q => q.id === id); if (!p) return ap7(id);
    P.perks[id] = (P.perks[id] | 0) + 1;
    try { FX.call(lt(p.name), El.COL[p.el], 2, 24); } catch (e) { errLog(e); }
  };
  // a new enemy carries no element (enemies are reused from a pool)
  const se7 = spawnEnemy;
  spawnEnemy = function () { const e = se7.apply(this, arguments); if (e) { e.el = ''; e.elU = 0; e.elId = -1; e.vulU = 0; e.vulId = -1; } return e; };
  // the hits
  const he7 = hitEnemy;
  hitEnemy = function (e) { const hp0 = e ? e.hp : 0; he7(e); if (simV(67) && e && e.alive && e.hp < hp0 && !(e.al > 0) && !El.busy) El.apply(e); };
  const de7 = damageEnemy;
  damageEnemy = function (e, d, a, src) { if (simV(67) && e && El.vul(e)) d *= 1.4; return de7(e, d, a, src); };
  // the mark: a small orb of the element above the enemy (2D and 3D)
  const orb = (x, y, r, col, p) => { cx.globalAlpha = .9; cx.fillStyle = col; cx.shadowColor = col; cx.shadowBlur = r * 1.6 * p; cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill(); cx.shadowBlur = 0; cx.globalAlpha = .8 * p; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x - r * .25, y - r * .25, r * .35, 0, TAU); cx.fill(); };
  const de8 = drawEnemy;
  drawEnemy = function (e) { de8(e); if (!e.alive || !El.on(e) || !El.COL[e.el]) return; const p = .7 + Math.sin(CAM.t * 9) * .3;
    cx.save(); orb(e.x + (e.exec ? 16 : 0), e.y - e.r * (e.scale || 1) - 22, 5.5, El.COL[e.el], p); cx.restore(); };
  Pipe.on('post', 'elem67', () => { if (!W3D.live || G.state === 'MENU') return; const k = V.s * V.dpr; let any = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || !El.on(e) || !El.COL[e.el]) continue; if (!any) { any = 1; cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); }
      const q = W3D.proj(e.x, e.y, e.r * 2.2 + 16); orb(q[0] + (e.exec ? 18 * k : 0), q[1] - (e.exec ? 0 : 4 * k), 6 * k, El.COL[e.el], .7 + Math.sin(CAM.t * 9) * .3); }
    if (any) cx.restore(); }, 99);
  // the 3D enemy glows in its element's color while it carries one
  const ae7 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) { ae7(g, e, t); if (!e.exec && El.on(e) && g.bodyMat && g.bodyMat.emissive && !(e.fl > .3)) { g.bodyMat.emissive.set(El.COL[e.el]); g.bodyMat.emissiveIntensity = .35 + Math.sin(t * 9) * .15; } };
  // a bounty, and from next week a weekly season mission (this week's three missions stay as they are)
  BOUNTY_TYPES.push({ k: 'react', d: 'Set off {n} elemental reactions', n: 8, r: 160 });
  { const W0 = 2967, plus = MISSIONS.concat([{ id: 'react', d: 'Set off {n} elemental reactions', n: 40 }]); // week 2967 starts Monday 16 Nov 2026
    Season.missions = function () { const r = pzRng(weekKey() * 31 + 7), pool = (weekKey() >= W0 ? plus : MISSIONS).slice(), out = []; while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return out; }; }
  // achievements
  ACHS.push({ id: 'react1', name: 'CHEMISTRY', d: 'Set off an elemental reaction', r: 100 }, { id: 'react100', name: 'ALCHEMIST', d: 'Set off 100 elemental reactions', r: 500 });
  const css = document.createElement('style'); css.id = 'v67css';
  css.textContent = `.perk.el67 { border-color: var(--elc) !important; box-shadow: 0 0 18px color-mix(in srgb, var(--elc) 55%, transparent), inset 0 0 14px color-mix(in srgb, var(--elc) 18%, transparent); }
.perk.el67 .nm { color: var(--elc); text-shadow: 0 0 10px var(--elc); }`;
  document.head.appendChild(css);
}
