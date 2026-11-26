
/* --- MODULE 26: v113.0 HERO GEAR — wings and halos that glow without blinding --- */
(function () {
  'use strict';
  // The hero's gear (wings, halos, thrusters, orbiting blades) glows at twice full strength. On a pale skin (the seraph
  // line: ASCENDANT, SERAPH, DEUS, AURORA SERAPH, STAR SERAPH...) a near-white part that bright went through the bloom as
  // a white blot bigger than the hero. Near-white glow parts are now tinted a little toward the skin's second color and
  // glow at a third of that; colored glow parts keep their light.
  if (typeof Human === 'undefined' || !Human.build || typeof THREE === 'undefined') return;
  const hb0 = Human.build.bind(Human);
  Human.build = function (L) {
    const g = hb0.apply(this, arguments);
    try {
      if (g && !g.gear113) {
        g.gear113 = 1; const tint = new THREE.Color((L && L.b) || '#7df9ff'), hsl = {}, seen = new Set();
        g.traverse(o => {
          const m = o.isMesh && o.material; if (!m || Array.isArray(m) || seen.has(m)) return;
          // unlit wing feathers, halos and thruster flames (cones and rings at full color): the brightest thing on screen
          if (m.isMeshBasicMaterial && o.geometry && /Cone|Torus/.test(o.geometry.type) && !(m.userData && m.userData.isOutline91) && m.blending !== THREE.AdditiveBlending) { seen.add(m); m.color.multiplyScalar(.62); m.transparent = true; m.opacity = Math.min(m.opacity, .78); return; }
          if (!m.emissive || !((m.emissiveIntensity || 0) >= 1)) return; seen.add(m);
          m.emissive.getHSL(hsl); if (hsl.l < .72 && hsl.s > .25) return; // (a colored glow: kept)
          m.emissive.lerp(tint, .35); if (m.color) { m.color.lerp(tint, .3); m.color.multiplyScalar(.8); } m.emissiveIntensity = Math.min(m.emissiveIntensity, .45);
        });
      }
    } catch (e) { errLog(e); }
    return g;
  };
})();
