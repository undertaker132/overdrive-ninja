/* =====================================================================
   ARMS (version 22) — two ways to grow a favorite blade:
   · WEAPON TREE: every weapon has three upgrade paths bought with credits,
     five levels each.
       EDGE   +6% damage per level; level 5 also +5% crit chance
       GRIP   dash charges recharge 4% faster per level; level 5 +1 charge
       CORE   critical hits +8% harder per level; level 5 widens the
              perfect-parry window
   · SECOND WEAPON: pick one more owned weapon in the Arsenal. In a run the
     SWAP button (key F) trades blades in an instant; the first hit within
     1.6 seconds of a swap is a SWAP STRIKE for 60% more damage.
   Both are part of the replay header (w2, mx2, wt) and the swap is a
   recorded action, so replays and ghosts stay exact. Without a tree or a
   second weapon every number is multiplied by exactly 1.
   ===================================================================== */
const WTREE = [
  { k: 'e', n: 'EDGE', d: '+6% damage per level · level 5: +5% crit chance', c: '#ff4d6d' },
  { k: 'g', n: 'GRIP', d: 'Dash charges recharge 4% faster per level · level 5: +1 dash charge', c: '#00f2fe' },
  { k: 'c', n: 'CORE', d: 'Critical hits 8% harder per level · level 5: wider perfect-parry window', c: '#ffd23f' }
];
const WTREE_MAX = 5;
function wtreeOf(id) { const d = Store.data, t = d.wtree && d.wtree[id]; return Array.isArray(t) ? [clamp(t[0] | 0, 0, 5), clamp(t[1] | 0, 0, 5), clamp(t[2] | 0, 0, 5)] : [0, 0, 0]; }
function wtreeCost(w, path, lv) { const base = 260 + Math.max(0, w.cost < 0 ? 3000 : w.cost) * .12; return Math.round(base * Math.pow(1.55, lv) * (path === 2 ? 1.15 : 1) / 10) * 10; }
function wMods(id) { // the multipliers one weapon's tree gives
  const t = wtreeOf(id);
  return { dmg: 1 + .06 * t[0], crit: t[0] >= 5 ? .05 : 0, rc: 1 - .04 * t[1], ch: t[1] >= 5 ? 1 : 0, cm: 1 + .08 * t[2], pw: t[2] >= 5 ? .03 : 0 };
}
function wModsApply(m, sgn) { // sgn 1 puts a weapon's tree on the player, -1 takes it off
  if (sgn > 0) { P.dmgMul *= m.dmg; P.rc *= m.rc; P.cmMul *= m.cm; } else { P.dmgMul /= m.dmg; P.rc /= m.rc; P.cmMul /= m.cm; }
  P.critAdd += sgn * m.crit; P.maxCh += sgn * m.ch; if (P.pwMax > 0) P.pwMax += sgn * m.pw;
}
function armsLoadout() { // called at the end of applyLoadout
  const d = Store.data; P.cmMul = 1; P.swapT = 0; P.swCd = 0; P.swN = 0;
  P.wm = wMods(P.w.id); wModsApply(P.wm, 1);
  const id2 = d.weapon2, ok = id2 && id2 !== P.w.id && G.mode !== 'puzzle' && G.mode !== 'dojo' && !G.dailyWeapon && d.owned[id2];
  P.w2 = ok ? WEAPONS.find(w => w.id === id2) || null : null;
}
function wBaseMods(w) { const ml = masteryLevel(w.id); return { ch: w.ch + (ml >= 4 ? 1 : 0), pw: w.id === 'tessen' ? .05 : 0, dmg: ml >= 1 ? 1.05 : 1, crit: ml >= 3 ? .08 : 0, ml }; }
function swapWeapon() {
  if (G.state !== 'PLAY' || G.freeze > 0 || !P.w2 || P.swCd > 0 || G.mode === 'puzzle') return;
  REC.act(RA.SWAP);
  const from = P.w, to = P.w2, a = wBaseMods(from), b = wBaseMods(to);
  wModsApply(P.wm, -1);
  P.maxCh += b.ch - a.ch; if (P.pwMax > 0) P.pwMax += b.pw - a.pw; P.dmgMul = P.dmgMul / a.dmg * b.dmg; P.critAdd += b.crit - a.crit;
  P.w = to; P.w2 = from; P.mlv = b.ml; P.sig = b.ml >= 2 ? to.id : '';
  P.wm = wMods(to.id); wModsApply(P.wm, 1);
  P.ch = clamp(P.ch, 0, P.maxCh); P.ncr = P.ncr2 = P.wcr = P.dcr = 0; P.w4e = 0; P.drN = 0; P.flN = P.kuN = P.otN = 0;
  P.swCd = 1.2; P.swapT = 1.6; P.swN++;
  FX.ring(P.x, P.y, 46, '#ffffff', 3); FX.ring(P.x, P.y, 30, SW_COL[to.id] || P.ca, 4); FX.spark(P.x, P.y, SW_COL[to.id] || '#ffffff', 10); FX.text(P.x, P.y - 36, lt(to.name), SW_COL[to.id] || '#ffffff', 12);
  Aud.sfx('warp'); Aud.wslash(to.id, 0); vibe('w_' + to.id); UI.dockDirty = true;
}
function swapStrike(d) { // the first blade hit after a swap (enemies, boss parts and bodies)
  if (!(P.swapT > 0)) return d;
  P.swapT = 0; styleAdd(ST_SKILL, 60); G.hs = Math.max(G.hs, .08); shake(.3); punch(.05); G.swapStrikes = (G.swapStrikes | 0) + 1;
  const x = P.x + Math.cos(P.ang) * 30, y = P.y + Math.sin(P.ang) * 30;
  FX.call(lt('SWAP STRIKE'), '#ffffff', 2, 20); FX.ring(x, y, 70, '#ffffff', 5); FX.ring(x, y, 46, SW_COL[P.w.id] || P.ca, 4); FX.streak(P.x, P.y, P.ang, '#ffffff', 8);
  return d * 1.6;
}
function armsTreeHdr() { const o = {}; for (const w of [P.w, P.w2]) if (w) { const t = wtreeOf(w.id); if (t[0] || t[1] || t[2]) o[w.id] = t; } return o; }
