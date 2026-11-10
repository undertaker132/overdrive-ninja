/* =====================================================================
   VERSION 57: THE LOOK — light and line like an anime game
   · the heroes (in runs, on the home screen, in the Hero Forge) get a
     dark ink outline around every part, the way anime and cel-shaded
     games draw them, and a rim of cool light along their edges
   · the home-screen and Hero Forge hero stands in a small studio: a glossy
     floor that reflects them, a backlight in their color, and a glow
     (bloom) on everything that shines: visors, blades, auras, trims
   Display only.
   ===================================================================== */
const Look = {
  ink: null,
  inkMat() { if (this.ink) return this.ink; const m = new THREE.MeshBasicMaterial({ color: 0x05060c, side: THREE.BackSide });
    m.onBeforeCompile = sh => { sh.uniforms.inkW = { value: .22 }; sh.vertexShader = 'uniform float inkW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * inkW;'); };
    m.customProgramCacheKey = () => 'ink57'; return (this.ink = m); },
  rim(mat) { if (!mat || !mat.isMeshStandardMaterial || mat.userData.rim57 || mat.transparent) return; mat.userData.rim57 = 1;
    const prev = mat.onBeforeCompile; mat.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r);
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{ float rimK = 1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0); totalEmissiveRadiance += vec3(0.55, 0.8, 1.0) * pow(rimK, 4.0) * 0.4; }'); };
    mat.customProgramCacheKey = () => 'rim57' + (prev ? 'p' : ''); mat.needsUpdate = true; },
  /* ink + rim on a hero model, once */
  dress(g) {
    if (!g || g.look57 || CALM || (typeof Q !== 'undefined' && Q.lvl === 0)) return; g.look57 = 1; /* (the lowest quality tier draws no outlines) */ const ink = this.inkMat(), add = [];
    g.traverse(o => { if (!o.isMesh || o.isSkinnedMesh || !o.geometry || o.userData.ink) return; const m = o.material; if (!m || m.transparent || m.blending === THREE.AdditiveBlending || m.isMeshBasicMaterial && m.color && m.color.getHex() > 0x888888) return;
      this.rim(m); const p = o.geometry.parameters || {}; if (o === g.pool || (p.radius && p.radius > 20)) return; add.push(o); });
    for (const o of add) { const l = new THREE.Mesh(o.geometry, ink); l.userData.ink = 1; l.castShadow = false; l.receiveShadow = false; o.add(l); }
  }
};
{
  // the hero in runs
  const ent8 = R3.ent.bind(R3);
  R3.ent = function (key, mk) { const g = ent8(key, mk); if (key === 'hero' && g && !g.look57) try { Look.dress(g); } catch (e) { errLog(e); } return g; };
  // the home screen and the Hero Forge: the studio, the ink and the glow
  const bd8 = Mini.build.bind(Mini);
  Mini.build = function () { const had = this.g; bd8(); if (this.g && this.g !== had) try { Look.dress(this.g); this.studio(); } catch (e) { errLog(e); } };
  Mini.studio = function () {
    const T = THREE; if (!this.floor57) {
      const f = new T.Mesh(new T.CircleGeometry(2.2, 48), new T.MeshStandardMaterial({ color: 0x0b0f22, metalness: .75, roughness: .28 })); f.rotation.x = -Math.PI / 2; f.position.y = -.005; f.receiveShadow = true; this.scene.add(f); this.floor57 = f;
      const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), gr = x.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
      const back = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: .16 })); back.position.set(0, 1.0, -1.6); this.scene.add(back); this.back57 = back;
      this.scene.background = new T.Color(0x060815); this.rn.setClearColor(0x060815, 1);
      try { const C = THREE, comp = new C.EffectComposer(this.rn); comp.addPass(new C.RenderPass(this.scene, this.cam)); const bl = new C.UnrealBloomPass(new C.Vector2(256, 256), .45, .35, .88); comp.addPass(bl); comp.addPass(new C.OutputPass()); this.comp = comp; this.bloom = bl;
        const r0 = this.rn.render.bind(this.rn), sz0 = this.rn.setSize.bind(this.rn); let inner = false;
        this.rn.render = (s, c) => { if (inner || !this.comp || s !== this.scene || (typeof Q !== 'undefined' && Q.lvl === 0)) return r0(s, c); inner = true; try { this.comp.render(); } finally { inner = false; } };
        this.rn.setSize = (w, h, u) => { sz0(w, h, u); try { this.comp.setSize(w, h); this.bloom.resolution.set(w, h); } catch (e) { errLog(e); } };
        const r = this.cv.getBoundingClientRect(); this.W = 0; void r; } catch (e) { errLog(e); this.comp = null; }
    }
    const L = this.look(); this.back57.material.color.set(L.a);
  };
}
