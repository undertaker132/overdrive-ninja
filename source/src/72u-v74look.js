/* =====================================================================
   VERSION 74: BOSSES IN THEIR OWN COLORS, ENEMIES THAT FALL
   · the bosses on real bodies (the swordsmen and the armored giants)
     were painted in one flat color: every part of the body shared one
     material, and the boss glow lit all of it. Each part now keeps its
     own shade (armor, cloth, joints, trims), the body gets the ink
     outline and rim light of the heroes, and a hit flashes it white for
     a moment; a staggered boss glows gold.
   · the animated enemies (the oni, the demons, the robots) no longer
     vanish when they die: they play their own death, fall, and sink into
     the roof.
   Display only.
   ===================================================================== */
const BossLook = {
  sync() {
    const b = Boss.cur; if (!b || !R3.ok || !W3D.live) return; const E = R3.ents && R3.ents.get('boss' + b.id + (b.lvl || '')), g = E && E.g; if (!g || !g.bossMats) return;
    const d = g.bodyMat, fl = d && d.emissiveIntensity > 1, st = b.stag > 0, t = performance.now() / 1000, col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
    for (const m of g.bossMats) { const u = m.userData;
      if (fl) { m.emissive.set('#ffffff'); m.emissiveIntensity = Math.max(.55, u.i0 || 0); }
      else if (st) { m.emissive.set('#ffd23f'); m.emissiveIntensity = .22 + Math.sin(t * 10) * .1; }
      else if (b.dying > 0) { m.emissive.set(col); m.emissiveIntensity = .3 + Math.random() * .3; }
      else { if (u.e0) m.emissive.copy(u.e0); m.emissiveIntensity = u.i0 == null ? m.emissiveIntensity : u.i0; } }
  }
};
{
  const bm4 = R3.bossModel.bind(R3);
  R3.bossModel = function (b) { const g = bm4(b); try { if (g && g.ronin && !CALM && !(typeof Q !== 'undefined' && Q.lvl === 0)) Look.dress(g.ronin); } catch (e) { errLog(e); } return g; };
  Pipe.on('pre', 'bosslook74', () => { try { BossLook.sync(); } catch (e) { errLog(e); } }, 52);
}
/* ---------- the fall: a dead animated enemy plays its own death, then sinks and fades ---------- */
const Corpse = {
  L: [], MAX: 10,
  take(k, r) {
    const g = r.g, m = g && (g.mon || g.rob); if (!m || !m.acts || !m.acts.Death || this.L.length >= this.MAX || CALM) return false;
    const uid = +(String(k).slice(1).split(':')[0]); if (!(uid > 0)) return false;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.uid === uid && e.alive) return false; } // (only the dead: an enemy that faded out for a moment is not a corpse)
    try { Models.play(m, 'Death', .08, true); } catch (e) { errLog(e); return false; }
    g.traverse(o => { if (o.isMesh && o.material && !o.userData.ink) { o.material = o.material.clone(); o.material.transparent = true; } });
    for (const c of g.children) if (c.isMesh && c.material && c.material.blending === THREE.AdditiveBlending) c.visible = false; // (no glow pool under a corpse)
    this.L.push({ g, m, t: 0, z0: g.position.z, last: performance.now() }); return true;
  },
  tick() {
    const now = performance.now();
    for (let i = this.L.length - 1; i >= 0; i--) { const c = this.L[i], dt = Math.min(.05, Math.max(0, (now - c.last) / 1000)); c.last = now; c.t += dt;
      try { c.m.mixer.update(dt); } catch (e) { errLog(e); }
      if (c.t > 1.25) { const u = Math.min(1, (c.t - 1.25) / .75); c.g.position.z = c.z0 - u * u * 18; c.g.traverse(o => { if (o.isMesh && o.material && o.material.transparent && !o.userData.ink) o.material.opacity = Math.max(0, 1 - u); }); }
      if (c.t > 2 || !R3.ok || !W3D.live || G.state === 'MENU') { R3.root.remove(c.g); c.g.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); }); this.L.splice(i, 1); } }
  }
};
{
  const sw4 = R3.sweep.bind(R3);
  R3.sweep = function () {
    for (const [k, r] of this.ents) if (r.seen !== this.frame && k[0] === 'e' && /^e\d+:/.test(k) && Corpse.take(k, r)) this.ents.delete(k); // (taken out of the sweep, kept on the roof to fall)
    try { Corpse.tick(); } catch (e) { errLog(e); }
    return sw4();
  };
}
/* ---------- the hero stands out: on the real body it was drawn smaller than the old drawn hero (1.0 against 1.45), a speck beside the oni.
   In runs it is now drawn 1.3 times larger (display only: what hits and what is hit is unchanged). And the pools of light under the
   animated enemies were wide rings that crowded the roof: they are smaller and softer now. ---------- */
const Stage74 = { HERO: 1.3 };
{
  const en4 = R3.ent.bind(R3);
  R3.ent = function (key, mk) { const g = en4(key, mk); try { if (key === 'hero' && g && g.human && !g.big74) { g.big74 = 1; g.scale.multiplyScalar(Stage74.HERO); } } catch (e) { errLog(e); } return g; };
  const ei4 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) { const g = ei4(e); try { if (g && (g.mon || g.rob)) for (const c of g.children) if (c.isMesh && c.material && c.material.blending === THREE.AdditiveBlending && !c.isSkinnedMesh) c.visible = false; /* (on the roof the pool read as a hard ring around every enemy) */ } catch (er) { errLog(er); } return g; };
}
