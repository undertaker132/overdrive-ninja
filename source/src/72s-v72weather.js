/* =====================================================================
   VERSION 72: EVERY STAGE ITS OWN AIR (3D)
   In 3D every stage used to be the same steel roof under its own sky.
   Now the place shows: snow drifts over the winter and summit stages and
   settles the roof white, cherry petals fall at the shrines and the
   sakura gardens on a roof of warm wood, embers rise around the core and
   the burning ruins, and motes of light float through the data void and
   the stars. Rain stays where it rains. Display only; skipped at the
   lowest quality and with calm effects.
   ===================================================================== */
const Weather3D = {
  KIND: { winter: 'snow', summit: 'snow', sakura: 'petal', temple: 'petal', parade: 'petal', core: 'ember', apex: 'ember', ruins: 'ember', origin: 'ember', hollow: 'ash',
    datavoid: 'mote', void: 'mote', starring: 'mote', orbital: 'mote', abyss: 'mote', skyroad: 'mote' },
  STYLE: { snow: ['#f4f8ff', 3.2, -60, 18, .8], petal: ['#ffb7d5', 3.6, -45, 40, .9], ember: ['#ffb34d', 2.4, 70, 22, .9], ash: ['#b8b0c8', 2.6, -25, 20, .55], mote: ['#7df9ff', 2.2, 10, 14, .7] }, // color, size, fall speed (+ rises), sway, opacity
  ROOF: { winter: '#eef3ff', summit: '#e6ecf8', temple: '#f2d2b0', sakura: '#f6dbe6', parade: '#f0c8b0', ruins: '#d8c4b4', hollow: '#c8c2d4', core: '#dcd0e4', apex: '#e0d4e8', origin: '#ece4d8' },
  pts: null, kind: '', N: 260, d: null,
  build() {
    const T = THREE, pos = new Float32Array(this.N * 3); this.d = []; for (let i = 0; i < this.N; i++) this.d.push([Math.random(), Math.random(), Math.random() * 420, Math.random() * 6.3]);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    const cv = document.createElement('canvas'); cv.width = cv.height = 32; const x = cv.getContext('2d'), gr = x.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.5, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
    const m = new T.PointsMaterial({ size: 3, map: new T.CanvasTexture(cv), transparent: true, depthWrite: false, opacity: .8, color: 0xffffff, sizeAttenuation: true });
    this.pts = new T.Points(g, m); this.pts.frustumCulled = false; this.pts.visible = false; R3.root.add(this.pts);
  },
  set(theme) {
    const k = this.KIND[theme] || ''; this.kind = k; if (!R3.roofMat) return;
    try { R3.roofMat.color.set(this.ROOF[theme] || '#ffffff'); } catch (e) { errLog(e); }
    if (!k) { if (this.pts) this.pts.visible = false; return; }
    if (!this.pts) this.build(); const S = this.STYLE[k]; const m = this.pts.material; m.color.set(S[0]); m.size = S[1]; m.opacity = S[4]; m.blending = k === 'ember' || k === 'mote' ? THREE.AdditiveBlending : THREE.NormalBlending; m.needsUpdate = true;
  },
  tick(rd) {
    const p = this.pts; if (!p) return; const on = !!this.kind && R3.ok && W3D.live && !CALM && !(typeof Q !== 'undefined' && Q.lvl === 0) && !(BG.T && BG.T.rain); p.visible = on; if (!on) return;
    const S = this.STYLE[this.kind], A = p.geometry.attributes.position.array, C = GL3D.cam, w = V.VW / C.z * 1.5, h = V.VH / C.z * 1.7, t = performance.now() / 1000, vz = S[2], sw = S[3];
    for (let i = 0; i < this.N; i++) { const d = this.d[i]; d[2] += vz * rd * (.7 + (i % 5) * .12);
      if (d[2] < 0) { d[2] = 400 + Math.random() * 60; d[0] = Math.random(); d[1] = Math.random(); } else if (d[2] > 460) { d[2] = Math.random() * 30; d[0] = Math.random(); d[1] = Math.random(); }
      const o = i * 3; A[o] = C.x + (d[0] - .5) * w + Math.sin(t * .9 + d[3]) * sw; A[o + 1] = C.y + (d[1] - .55) * h + Math.cos(t * .7 + d[3]) * sw * .5; A[o + 2] = d[2]; }
    p.geometry.attributes.position.needsUpdate = true;
  }
};
{
  const ts0 = R3.themeSet.bind(R3);
  R3.themeSet = function (T0) { const was = this.theme; const r = ts0(T0); if (this.theme !== was || !Weather3D.applied) { Weather3D.applied = 1; try { Weather3D.set(this.theme); } catch (e) { errLog(e); } } return r; };
  let last = 0;
  Pipe.on('pre', 'weather72', () => { const now = performance.now(), rd = last ? Math.min(.05, (now - last) / 1000) : .016; last = now; try { Weather3D.tick(rd); } catch (e) { errLog(e); } }, 60);
}
