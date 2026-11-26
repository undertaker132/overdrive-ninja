
/* --- MODULE 24: v112.0 LOOKS — enemies with weight: deep colors, an ink line, a size that reads --- */
(function () {
  'use strict';
  // The animated enemies (the orc, the demons, the robots) came out pale: their texture tinted toward the enemy color,
  // then the cel-shading pass lightened every color again, and a constant glow under the bloom washed them to mint and
  // lilac. Their skinned bodies also had no ink line (the line was only made for rigid meshes).
  //  · a deep, saturated body color and a low glow (a hit flash and an execution mark still light them up)
  //  · an ink line that follows the animated body (pushed out along the normals after the skinning, in the shader)
  //  · in the chase view the small enemies are drawn larger: next to the hero they were toys (the hit size is the same)
  if (typeof R3 === 'undefined' || typeof THREE === 'undefined') return;
  const T = () => THREE;
  let inkMat = null;
  function ink(th) {
    const t = T(), m = new t.MeshBasicMaterial({ color: 0x07060c, side: t.BackSide });
    m.onBeforeCompile = sh => { sh.uniforms.th112 = { value: th }; sh.vertexShader = 'uniform float th112;\n' + sh.vertexShader.replace('#include <skinning_vertex>', '#include <skinning_vertex>\n  transformed += normalize(objectNormal) * th112;'); };
    m.customProgramCacheKey = () => 'ink112' + th.toFixed(3); m.userData.isOutline91 = 1; m.userData.noToon91 = 1; return m;
  }
  function deepen(mat) {
    if (!mat || mat.userData && mat.userData.deep112 || !mat.color || mat.isMeshBasicMaterial) return;
    const hsl = {}; mat.color.getHSL(hsl); mat.color.setHSL(hsl.h, Math.min(1, hsl.s * 1.15 + .08), clamp(hsl.l * .68, .16, .58));
    if (mat.emissive && (mat.emissiveIntensity || 0) < .8) mat.emissiveIntensity = Math.min(mat.emissiveIntensity || 0, .07); // (parts made to glow, eyes and cores, keep their light)
    mat.userData = Object.assign({}, mat.userData, { deep112: 1 });
  }
  const ei0 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) {
    const g = ei0(e);
    try {
      if (g && (g.mon || g.rob) && !CALM) {
        const skinned = []; g.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); else if (o.isMesh && o.material && !o.material.transparent) deepen(o.material); });
        for (const m of skinned) {
          deepen(m.material);
          if (!m.geometry || !m.skeleton || m.userData.ink112) continue;
          m.geometry.computeBoundingSphere(); const th = (m.geometry.boundingSphere ? m.geometry.boundingSphere.radius : 1) * .028;
          const o = new (T().SkinnedMesh)(m.geometry, ink(th)); o.bind(m.skeleton, m.bindMatrix); o.frustumCulled = false; o.castShadow = false; o.userData.isOutline91 = 1;
          m.parent.add(o); o.position.copy(m.position); o.quaternion.copy(m.quaternion); o.scale.copy(m.scale); m.userData.ink112 = 1;
        }
        g.deep112 = 1;
      }
    } catch (er) { errLog(er); }
    return g;
  };
  const chase = () => { try { return window.ChaseCam108 && window.ChaseCam108.on(); } catch (e) { return false; } };
  const ae0 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e) {
    const r = ae0.apply(this, arguments);
    try {
      if (g.deep112 && g.bodyMat && g.bodyMat.emissive && !(e.fl > .3) && !e.exec) g.bodyMat.emissiveIntensity = Math.min(g.bodyMat.emissiveIntensity, .07);
      if (chase() && !e.mb && (e.r || 14) < 21 && e.type !== ET.DUMMY) g.scale.multiplyScalar(1.3);
    } catch (er) { }
    return r;
  };
})();
