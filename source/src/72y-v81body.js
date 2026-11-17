/* v81 · the classic hero's joints: the smooth body's joints (shoulders, elbows, waist, knees) were lit in the skin's glow, a string of
   bright beads between dark limbs that read as an insect's segments. They are now the suit's own matte dark tone; the neon stays on
   the gear, the trims and the blade. (__oldJoints81: a test switch for before/after captures.) Display only. */
const Joint81 = {
  mats: new Map(),
  mat(a) { let m = this.mats.get(a); if (m) return m; m = R3.std({ color: new THREE.Color('#0c0e16').lerp(new THREE.Color(a), .1), metalness: .3, roughness: .7 }); m.side = THREE.DoubleSide; this.mats.set(a, m); return m; }
};
{
  const hb = Human.build.bind(Human);
  Human.build = function (L, wid) {
    const g = hb(L, wid);
    try { if (g && g.human && g.human.r && g.human.r.base === 'xbot' && !window.__oldJoints81 && !CALM) g.human.r.o.traverse(m => { if (m.isMesh && /Joints/i.test(m.name)) m.material = Joint81.mat(L.a || '#00f2fe'); }); } catch (e) { errLog(e); }
    return g;
  };
}
