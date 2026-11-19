/* ==========================================================================
   v84 · NO MORE MANNEQUIN POSE. On a dash the hero's body clock runs 1.6
   times faster, but the cut's own countdown ran on the plain frame clock:
   the recorded cut finished and stopped while the game still thought it was
   playing, so for a few frames nothing held the body and it fell back
   toward the mannequin's arms-out rest pose. The countdown now reads how
   much of the cut is really left, and the body is never left with less
   than a full pose: whatever is missing goes to the walk or run under it.
   Display only.
   ========================================================================== */
const Anim84 = {
  /* how long the cut playing on this body really has left, in frame time */
  left(a, dash) { const c = a.getClip(), ts = Math.abs(a.getEffectiveTimeScale()) || 1; return Math.max(0, c.duration - a.time) / ts / (dash ? 1.6 : 1); },
  /* the running actions must add up to a whole pose: top the locomotion up */
  fill(h) {
    const r = h.r, loco = r.acts[r.cur]; if (!loco) return; let s = 0;
    for (const a of r.mixer._actions) if (a.isRunning()) s += a.getEffectiveWeight();
    if (s < .999) { if (!loco.isRunning()) loco.play(); loco.setEffectiveWeight(Math.min(1, loco.getEffectiveWeight() + (1 - s))); }
  }
};
{
  const ap = Moves.apply.bind(Moves);
  Moves.apply = function (g, o, rd) {
    const h = g && g.human;
    try { if (h && h.cutA && h.melee) { const a = h.cutA; h.cutT = a.isRunning() ? Anim84.left(a, !!o.dashing) + (rd || 0) : 0; } } catch (e) { errLog(e); }
    const r = ap(g, o, rd);
    try { if (h && h.r && h.r.mixer) Anim84.fill(h); } catch (e) { errLog(e); }
    return r;
  };
}
/* the scarf on the classic hero: each of its six links bent up to a radian on a dash, so the
   whole scarf rolled into a ring around the head. Now the links only wave a little and the
   scarf streams straight back the faster the hero goes (its hinge at the neck does the aiming) */
{
  const an = Human.anim.bind(Human);
  Human.anim = function (g, o, rd, t) {
    const r = an(g, o, rd, t);
    try { const h = g && g.human; if (h && g.scarf73 && h.sway) { const sp = clamp((o.spd || 0) / 420, 0, 1), dash = !!o.dashing, k = dash ? 1 : sp; let i = 0;
      for (const s of h.sway) { if (s[1] !== 'cape2') continue; s[0].rotation.y = (i ? .1 * (1 - k) : 0) + Math.sin(t * (3 + k * 10) - i * .9) * (.05 + .1 * k) * Math.min(1, i * .5 + .3); i++; } } } catch (e) { errLog(e); }
    return r;
  };
}
