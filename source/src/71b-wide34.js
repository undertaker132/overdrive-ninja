/* =====================================================================
   WIDE ROOF (version 34, Settings > PC) — on a landscape screen the story,
   the dojo and your own levels can be played on a roof almost twice as wide,
   so a computer screen is not a thin strip with empty sides. Ranked arcade
   modes, replays, ghosts and live play keep the standard roof, so every
   leaderboard stays fair.
   ===================================================================== */
const Wide = {
  W: 600,
  can() { const s0 = Math.min(V.W / CFG.viewW, V.H / CFG.viewH); return V.W / s0 >= this.W + 90 && V.W > V.H * 1.15; },
  want(mode) { const s = Store.data.settings; return !!s.wide && !REPLAY.on && !Flow.sr && (mode === 'story' || mode === 'dojo' || mode === 'custom') && this.can(); },
  set(mode) { const w = this.want(mode) ? this.W : CFG.arenaW; if (V.AW !== w) { V.AW = w; G.wideRoof = w > CFG.arenaW ? 1 : 0; fit(); } else G.wideRoof = w > CFG.arenaW ? 1 : 0; }
};
{ const db0 = Director.begin.bind(Director); Director.begin = function (mode, stage) { try { Wide.set(mode); } catch (e) { errLog(e); } return db0(mode, stage); }; }