
/* --- MODULE 15: v107.0 STAGE PACING — combo stages keep a combo alive, reflect stages always have shots to send back --- */
(function () {
  'use strict';
  // Story stages only (they are never recorded as replays). Dice go through R like every simulation rule.
  // Bot runs at a human pace showed combo stages swinging from 25 s to never (enemies spawn at the edges and the
  // combo ends 3.4 s after the last kill) and reflect stages dragging past two minutes when no one was shooting.
  const near = r => { for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.type !== ET.TREASURE && Math.hypot(e.x - P.x, e.y - P.y) < r) return true; } return false; };
  const count = t => { let n = 0; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.type === t) n++; } return n; };
  const incoming = () => { for (let i = 0; i < BU.n; i++) { const b = BU.a[i]; if (b.alive && !b.rf) return true; } return false; };
  let feedT = 0, quietT = 0, lastK = 0;
  Sim98.steps.push(dt => {
    if (G.mode !== 'story' || G.state !== 'PLAY' || G.freeze > 0 || !G.obj || G.won) { feedT = quietT = 0; lastK = G.kills | 0; return; }
    const o = G.obj; feedT -= dt;
    if (o.t === 'combo') {
      if ((G.kills | 0) > lastK && G.combo > 0) G.ct = Math.max(G.ct, 4.2); // a little more time between kills on the stage built around them
      lastK = G.kills | 0;
      // the combo is about to run out and nothing is in reach: one more enemy steps in close enough to reach
      if (G.combo > 0 && G.ct < 2 && feedT <= 0 && !near(320) && Director.liveHostiles() < CFG.maxEnemies - 2) {
        const a = R.f() * Math.PI * 2, d = 200 + R.f() * 80;
        const x = clamp(P.x + Math.cos(a) * d, V.L + 40, V.R - 40), y = clamp(P.y + Math.sin(a) * d, 80, V.VH - 140);
        const e = spawnEnemy(Director.pool.length ? Director.pickType() : ET.DRONE, x, y, false); if (e) e.spawnT = .35;
        feedT = 1.2;
      }
    } else if (o.t === 'reflect') {
      // no shot in the air for a while and fewer than two snipers on the roof: a sniper climbs up
      quietT = incoming() ? 0 : quietT + dt;
      if (quietT > 2.2 && feedT <= 0 && count(ET.SNIPER) < 2 && Director.liveHostiles() < CFG.maxEnemies - 2) {
        const e = spawnEnemy(ET.SNIPER, V.L + 60 + R.f() * (V.R - V.L - 120), 70 + R.f() * 60, false); if (e) e.spawnT = .5;
        feedT = 3; quietT = 0;
      }
    }
  });

  // on a combo stage every hit that lands keeps the combo alive (in later chapters an enemy can take several cuts,
  // and the combo used to run out while you were still cutting the one in front of you); kills still count it up
  const de107 = damageEnemy;
  damageEnemy = function (e, d) {
    const r = de107.apply(this, arguments);
    try { if (G.mode === 'story' && G.obj && G.obj.t === 'combo' && G.state === 'PLAY' && G.combo > 0 && e && d > 0) G.ct = Math.max(G.ct, 2.6); } catch (er) { }
    return r;
  };
})();
