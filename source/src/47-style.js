/* =====================================================================
   STYLE METER — rank D..SSS earned by varied play. Each action adds
   points; repeating the same action recently is worth less, a fresh
   one is worth more. Style drains over time and drops when you're hit.
   ===================================================================== */
const ST_SLASH = 1, ST_CHAIN = 2, ST_RICO = 3, ST_PARRY = 4, ST_PERFECT = 5, ST_SKILL = 6, ST_REFLECT = 7,
  ST_ZAN = 8, ST_GRAZE = 9, ST_TRAIN = 10, ST_BOSS = 11, ST_WEAK = 12, ST_CLASH = 13, ST_DODGE = 14, ST_HACK = 15;
const STYLE_RK = [0, 90, 200, 340, 500, 680, 860];
const STY = { recent: new Int8Array(6), ri: 0, stale: 0 };
function styleRank() { let k = 0; for (let i = 0; i < 7; i++) if (G.style >= STYLE_RK[i]) k = i; return k; }
function styleAdd(kind, base) {
  if (G.state !== 'PLAY') return;
  let n = 0; for (let i = 0; i < 6; i++) if (STY.recent[i] === kind) n++;
  const mult = n === 0 ? 1.25 : n === 1 ? 1 : n === 2 ? .7 : n === 3 ? .45 : .25;
  STY.recent[STY.ri] = kind; STY.ri = (STY.ri + 1) % 6;
  G.style = Math.min(1000, G.style + base * mult);
  if (mult <= .45) { if (++STY.stale >= 8) { STY.stale = 0; hint('stale', lt('MIX IT UP: REPEATING ONE MOVE RAISES STYLE SLOWLY')); Comms.say('stale'); } } else STY.stale = 0;
  const rk = styleRank();
  if (rk > G.styleRk) { G.styleRk = rk; G.rankPop = 1; if (rk === 6) { ach('sss'); Aud.say('Triple S'); REC.mark('sss', 3); } if (rk >= 4) Comms.say('rank'); }
}
function styleDecay(dt) {
  if (G.style <= 0) return;
  G.style = Math.max(0, G.style - dt * (10 + G.style * .055));
  const rk = styleRank(); if (rk < G.styleRk) G.styleRk = rk;
}
function styleHurt() { G.style *= .45; G.styleRk = styleRank(); }
function styleReset() { G.style = 0; G.styleRk = 0; STY.recent.fill(0); STY.ri = 0; STY.stale = 0; }
