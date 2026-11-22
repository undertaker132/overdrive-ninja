/* ==========================================================================
   v98 · RULES THAT REPLAY. The systems added in 89-97 (blade clash, rail
   events, the shadow rival, the awakened blade, synergies, squads, heat pacts,
   the launcher, roof props, armor break...) are simulation rules now:
   · they run in the fixed simulation step, never once per drawn frame
   · their dice roll through R (the run's seeded random), never Math.random
   · their settings are taken once when a run begins and recorded in the replay
     header (x98), so a replay uses the recorded ones, not the viewer's
   · the keys they read are recorded actions: the launcher [F] (LAUNCH), a
     blade-clash mash (CLASH) and the WASD move mask (MOVE0-MOVE0+15)
   · they apply to runs recorded in 98 or later (simV(98)): older replays
     play back with the rules they were recorded under
   The title screen's own buttons and music get a menu loop of their own:
   HUD.draw runs only in a run.
   ========================================================================== */
const Sim98 = {
  KEYS: ['clash91', 'events91', 'rival91', 'awaken91', 'cutin91', 'syn92', 'squad92', 'air96', 'props96', 'events96', 'armor96'],
  cur: null, steps: [], menu: [],
  live(k) { try { const s = Store.data.settings; return s[k] == null ? true : !!s[k]; } catch (e) { return true; } },
  liveChips() { try { const W = window.__V96 && window.__V96.WeaponChips96; return W ? W.data().eq.slice(0, 2) : []; } catch (e) { return []; } },
  snap() { const f = {}; for (const k of this.KEYS) f[k] = this.live(k) ? 1 : 0; let heat = {}; try { heat = Object.assign({}, HeatPact92.getMap()); } catch (e) { } return { f, chips: this.liveChips(), heat }; },
  x() { return REPLAY.on ? (REPLAY.hdr && REPLAY.hdr.x98) || null : this.cur; },
  on(k) { if (!simV(98)) return false; const x = this.x(); return x ? !!x.f[k] : this.live(k); },
  chip(id) { if (!simV(98)) return false; const x = this.x(); return (x ? x.chips : this.liveChips()).indexOf(id) >= 0; }
};
RA.LAUNCH = 40; RA.CLASH = 41; RA.MOVE0 = 42; // (42-57: the WASD move mask 0-15; none of these carry a payload. 17 is RA.BEAT)
{
  const db98 = Director.begin.bind(Director);
  const clean98 = e => { e._z96 = 0; e._vz96 = 0; e._aegis92 = false; e._boost92 = false; };
  // every run starts from a clean enemy pool (what a v98 run saw as the first run after loading), whatever ran before it
  Director.begin = function () { if (!REPLAY.on) Sim98.cur = Sim98.snap(); PCMaster90.mask98 = 0; for (let i = 0; i < EN.a.length; i++) if (EN.a[i]) clean98(EN.a[i]); return db98.apply(this, arguments); };
  const h98 = REC.header.bind(REC);
  REC.header = function (mode) { const h = h98(mode); try { h.x98 = Sim98.cur || Sim98.snap(); } catch (e) { errLog(e); } return h; };
  const ap98 = REPLAY.apply.bind(REPLAY);
  REPLAY.apply = function (e) {
    const c = e[1] & 63;
    if (c === RA.LAUNCH) { const A = window.__V96 && window.__V96.AirCombat96; if (A) A.act(); return; }
    if (c === RA.CLASH) { BladeClash91.push98(); return; }
    if (c >= RA.MOVE0 && c < RA.MOVE0 + 16) { PCMaster90.mask98 = c - RA.MOVE0; return; }
    return ap98(e);
  };
  const s98 = sim;
  sim = function (dt, S) {
    const r = s98(dt, S);
    try {
      if (simV(98) && G.state === 'PLAY') {
        BladeClash91.simStep(S || dt); // (the clash runs on the unscaled step: it slows the world itself)
        SetPieces91.simStep(dt); Awakened91.simStep(); ShadowRival91.simStep(dt);
        for (const f of Sim98.steps) f(dt, S);
      }
      DojoLab91.simStep();
    } catch (e) { errLog(e); }
    return r;
  };
  // a recycled enemy starts clean: the pool kept the last one's air height and squad flags, so a run depended on the
  // runs before it (and its replay, which starts from a different pool, went another way)
  const se98 = spawnEnemy;
  spawnEnemy = function () { const e = se98.apply(this, arguments); if (e && simV(103)) clean98(e); return e; }; // v98 replays keep v98's recycled values
  // the final choice holds the game: no pause menu or resume behind it
  const tp98 = Flow.togglePause.bind(Flow);
  Flow.togglePause = function () { if (typeof StoryOverhaul95 !== 'undefined' && StoryOverhaul95.choiceOpen) return; return tp98.apply(this, arguments); };
  // the menu loop: title-screen buttons, the soundtrack engine and badges (HUD.draw does it during a run)
  let mT = performance.now();
  setInterval(() => {
    if (G.state === 'PLAY' || G.state === 'PAUSE' || G.state === 'PERK') { mT = performance.now(); return; }
    const now = performance.now(), rd = Math.min(.25, (now - mT) / 1000); mT = now;
    for (const f of [() => HeatPact92.tickUI(), () => CloudReady92.tickUI(), () => Auth93.tickUI(), () => StudioAudio95.step(rd), () => StudioAudio95.tickUI()].concat(Sim98.menu)) { try { f(rd); } catch (e) { } }
  }, 100);
}
