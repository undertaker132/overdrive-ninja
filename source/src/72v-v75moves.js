/* =====================================================================
   VERSION 75: A FIGHTER'S BODY
   Three more recorded sword moves (KayKit, CC0) on the hero in a run:
   · a perfect parry is a real block: the blade comes up across the body
     and takes the hit
   · Zandatsu is a leaping chop
   · standing still in a fight, the hero takes a two-handed guard
     instead of the mannequin's relaxed stand (the relaxed stand stays on
     the home screen and in the Hero Forge)
   Display only.
   ===================================================================== */
Melee.EXTRA = ['Melee_Block_Hit', 'Melee_1H_Attack_Jump_Chop', 'Melee_2H_Idle'];
const Moves75 = {
  /* one recorded move on top of the locomotion, through the same blend as the dash cuts */
  fire(h, name, ts) { const a = h.melee && h.melee[name]; if (!a) return false; if (h.cutA && h.cutA !== a) h.cutA.stop(); a.reset(); a.setLoop(THREE.LoopOnce, 1); a.setEffectiveTimeScale(ts); a.setEffectiveWeight(1); a.play(); h.cutA = a; h.cutT = a.getClip().duration / ts; return true; },
  isRunHero(g) { const E = R3.ents && R3.ents.get('hero'); return !!(E && E.g === g); }
};
{
  const ap8 = Moves.apply.bind(Moves);
  Moves.apply = function (g, o, rd) {
    const r = ap8(g, o, rd);
    try {
      const h = g && g.human; if (!h || !h.melee || !Moves75.isRunHero(g)) return r;
      if (g.par75 == null) { g.par75 = G.parries | 0; g.zan75 = G.zan | 0; }
      if ((G.parries | 0) > g.par75) Moves75.fire(h, 'Melee_Block_Hit', 1.7); g.par75 = G.parries | 0;
      if ((G.zan | 0) > g.zan75) Moves75.fire(h, 'Melee_1H_Attack_Jump_Chop', 1.6); g.zan75 = G.zan | 0;
      // the guard: standing still in a fight, nothing else playing
      const st = h.melee.Melee_2H_Idle; if (st) {
        if (!st.isRunning()) { st.setLoop(THREE.LoopRepeat, Infinity); st.reset(); st.setEffectiveWeight(0); st.play(); }
        const want = G.state === 'PLAY' && (o.spd || 0) < 30 && !o.dashing && !h.cutA && !(g.mv && (g.mv.k === 'win' || g.mv.k === 'flinch')) ? 1 : 0;
        g.gw75 = (g.gw75 || 0) + (want - (g.gw75 || 0)) * Math.min(1, (rd || .016) * 6); const w = g.gw75;
        st.setEffectiveWeight(w); const loco = h.r.acts[h.r.cur]; if (loco && !h.cutA) loco.setEffectiveWeight(Math.max(.05, 1 - w));
      }
    } catch (e) { errLog(e); }
    return r;
  };
}
