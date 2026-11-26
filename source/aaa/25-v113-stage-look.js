
/* --- MODULE 25: v113.0 STAGE LOOK — every stage its own roof in 3D --- */
(function () {
  'use strict';
  // In 3D every stage stood on the same steel-blue roof; only the sky and the rails changed. The roof now takes the
  // stage's neon (magenta in the Undercity, green on the Ghost Line, gold on the Spire, red in the Shogun Core...),
  // softly, so the plates, seams and puddles still read. The chase view's edge walls glow in the same neon.
  if (typeof R3 === 'undefined' || typeof THREE === 'undefined') return;
  const ts0 = R3.themeSet.bind(R3);
  R3.themeSet = function (T0) {
    const was = this.theme, r = ts0.apply(this, arguments);
    try {
      if (this.theme !== was && this.roofMat && T0) {
        const c = new THREE.Color(T0.rail || '#00f2fe'), hsl = {}; c.getHSL(hsl);
        this.roofMat.color.setHSL(hsl.h, Math.min(.42, hsl.s * .5), .72);
        if (this.roofMat.emissive) { this.roofMat.emissive.setHSL(hsl.h, .6, .05); this.roofMat.emissiveIntensity = 1; }
      }
    } catch (e) { errLog(e); }
    return r;
  };
})();
