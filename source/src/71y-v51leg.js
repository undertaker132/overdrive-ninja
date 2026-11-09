/* =====================================================================
   VERSION 51: LEGENDARY PERKS (after Hades' Duo/Legendary boons and the
   run-defining items of Risk of Rain and Balatro)
   From version 51, an upgrade screen sometimes holds one gold LEGENDARY
   card (12% per screen, one legendary per run). Each one changes how the
   run plays:
   · STORMCALLER: every kill calls lightning onto the nearest enemy
   · REAPER: elites can be executed below 50% health, and every
     execution blasts the weak enemies around it
   · OVERCLOCK: Overdrive lasts 80% longer, and kills during it refill a
     dash charge
   · GLASS CANNON: double damage and more, but a single shield
   · ECHO EDGE: every dash hit strikes twice
   A sim rule (the cards are drawn from the run's own random numbers), so
   it only applies to runs played or recorded with version 51 or newer;
   picks are recorded after every older perk, so older replays keep their
   numbers.
   ===================================================================== */
const LEGENDS = [
  { id: 'lstorm', r: 3, leg: 1, name: 'STORMCALLER', desc: 'Every kill calls lightning onto the nearest enemy', max: 1 },
  { id: 'lreaper', r: 3, leg: 1, name: 'REAPER', desc: 'Execute elites below 50% health; every execution blasts the weak enemies around it', max: 1 },
  { id: 'lover', r: 3, leg: 1, name: 'OVERCLOCK', desc: 'Overdrive lasts 80% longer, and kills during it refill a dash charge', max: 1 },
  { id: 'lglass', r: 3, leg: 1, name: 'GLASS CANNON', desc: '+120% damage, but only 1 shield for the rest of the run', max: 1 },
  { id: 'lecho', r: 3, leg: 1, name: 'ECHO EDGE', desc: 'Every dash hit strikes twice', max: 1 }
];
const LEG_BY = {}; LEGENDS.forEach(l => { LEG_BY[l.id] = l; });
const Leg = {
  zap: 0,
  dmg(k) { return Math.max(1, (P.w.dmg || 1) * (P.dmgMul || 1) * (G.dmgMod || 1) * k); },
  execT() { return P.perks.lreaper ? .5 : .3; },
  onExec(e) { if (!P.perks.lreaper) return; FX.ring(e.x, e.y, 170, '#ffd700', 5);
    for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o === e || !o.alive || o.al > 0 || o.elite || o.mb) continue; const dx = o.x - e.x, dy = o.y - e.y; if (dx * dx + dy * dy < 170 * 170) damageEnemy(o, this.dmg(3), Math.atan2(dy, dx), 2); } }
};
{
  // recorded picks: every older list first, the legendaries after them
  PERK_ALL = function () { if (!PERK_ALL.c) PERK_ALL.c = PERKS.map(p => p.id).concat(SYNERGIES.map(s => s.id)).concat(RELICS.map(r => r.id)).concat(LEGENDS.map(l => l.id)); return PERK_ALL.c; };
  // the gold card: one slot, sometimes, from car/floor/boss 2 on, never two legendaries in a run
  const rp0 = UI.rollPerks.bind(UI);
  UI.rollPerks = function () {
    const out = rp0();
    if (simV(51) && out.length && G.mode !== 'puzzle') { const pool = LEGENDS.filter(l => !P.perks[l.id]);
      if (pool.length === LEGENDS.length && R.f() < .12) out[out.length - 1] = pool[Math.floor(R.f() * pool.length) % pool.length]; }
    return out;
  };
  const rn0 = UI.renderPerks.bind(UI);
  UI.renderPerks = function (list) { rn0(list); try { const box = $('pkList'); list.forEach((p, i) => { if (p.leg && box.children[i]) { box.children[i].classList.add('leg51'); try { Aud.sfx('star'); } catch (e) { } } }); } catch (e) { errLog(e); } };
  const ap0 = applyPerk;
  applyPerk = function (id) {
    if (!LEG_BY[id]) return ap0(id);
    P.perks[id] = (P.perks[id] | 0) + 1;
    if (id === 'lglass') { P.dmgMul *= 2.2; P.maxHp = 1; P.hp = 1; }
    try { FX.call(lt(LEG_BY[id].name), '#ffd700', 3, 28); flash(.3, '#ffd700'); } catch (e) { errLog(e); }
  };
  // the effects
  const ke0 = killEnemy;
  killEnemy = function (e, a, src) {
    ke0(e, a, src);
    if (P.perks.lover && G.odT > 0) P.ch = Math.min(P.maxCh, P.ch + 1);
    if (P.perks.lstorm && !Leg.zap) { let best = null, bd = 300 * 300;
      for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (!o.alive || o.al > 0 || o === e) continue; const dx = o.x - e.x, dy = o.y - e.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = o; } }
      if (best) { Leg.zap = 1; try { FX.bolt(e.x, e.y, best.x, best.y, '#7df9ff'); damageEnemy(best, Leg.dmg(.7), Math.atan2(best.y - e.y, best.x - e.x), 2); } finally { Leg.zap = 0; } } }
  };
  const od0 = overdrive;
  overdrive = function () { const was = G.odT; od0.apply(this, arguments); if (P.perks.lover && was <= 0 && G.odT > 0) G.odT *= 1.8; };
  const he5 = hitEnemy;
  hitEnemy = function (e) { const hp0 = e ? e.hp : 0; he5(e); if (P.perks.lecho && e && e.alive && e.hp < hp0 && !(e.al > 0)) { damageEnemy(e, Leg.dmg(.6), Math.atan2(P.vy, P.vx) || P.ang, 0); FX.arc(e.x, e.y, (Math.atan2(P.vy, P.vx) || 0) + 1.2, 46, '#ffd700', 5); } };
  const css = document.createElement('style'); css.id = 'v51legcss';
  css.textContent = `.perk.leg51 { border-width: 2px; background: linear-gradient(160deg, rgba(255, 215, 0, .22), rgba(10, 14, 38, .95) 60%) !important; box-shadow: 0 0 26px rgba(255, 215, 0, .55), inset 0 0 18px rgba(255, 215, 0, .18); animation: leg51 1.2s ease-in-out infinite alternate; }
.perk.leg51 .nm { color: #ffd700; text-shadow: 0 0 12px rgba(255, 215, 0, .8); } @keyframes leg51 { to { box-shadow: 0 0 40px rgba(255, 215, 0, .9), inset 0 0 26px rgba(255, 215, 0, .3); } }
@media (prefers-reduced-motion: reduce) { .perk.leg51 { animation: none; } }`;
  document.head.appendChild(css);
}
