
/* --- MODULE 27: v115.0 WORLD — the train reads as one train --- */
(function () {
  'use strict';
  // Between two cars the 3D train had a bare 46-unit gap: from the chase camera, the front of the next car stood up out
  // of it as a black wall across the roof. A gangway now joins every two cars: a grated steel bridge at roof level,
  // rubber bellows on both sides and a neon edge in the stage's color, the way a real train's cars are coupled.
  if (typeof R3 === 'undefined' || typeof THREE === 'undefined') return;
  let tex = null;
  function grate() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#1b2134'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#2c354f'; for (let i = 0; i < 8; i++) x.fillRect(0, i * 8 + 1, 64, 4);
    x.fillStyle = '#0b0e18'; for (let i = 0; i < 4; i++) x.fillRect(i * 16 + 7, 0, 2, 64);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function build(car) {
    const T = THREE, g = new T.Group(); tex = tex || grate();
    const plate = new T.Mesh(new T.BoxGeometry(1, 1, 3), new T.MeshStandardMaterial({ map: tex, metalness: .6, roughness: .55, color: 0xffffff })); plate.receiveShadow = true; plate.position.z = -1.6; g.add(plate);
    const bell = new T.MeshStandardMaterial({ color: 0x10131d, roughness: .9, metalness: .1 }), edgeM = new T.MeshStandardMaterial({ color: 0x000000, emissive: new T.Color('#00f2fe'), emissiveIntensity: 2 });
    g.bells = []; g.edges = [];
    for (const s of [-1, 1]) {
      const b = new T.Mesh(new T.BoxGeometry(1, 1, 1), bell); b.castShadow = true; g.add(b); g.bells.push([b, s]);
      const e = new T.Mesh(new T.BoxGeometry(1, 1, 1), edgeM); g.add(e); g.edges.push([e, s]);
    }
    g.plate = plate; g.edgeM = edgeM; car.add(g); car.gang115 = g; return g;
  }
  const lay0 = R3.layout.bind(R3);
  R3.layout = function () {
    const r = lay0.apply(this, arguments);
    try {
      const AW = V.R - V.L, carLen = V.VH + 120, gap = 46, w = AW * .62, rail = (BG.T && BG.T.rail) || '#00f2fe';
      for (const car of this.cars || []) {
        const g = car.gang115 || build(car); g.position.set(0, -(carLen / 2 + gap / 2), 0);
        g.plate.scale.set(w, gap + 8, 1); g.plate.material.map.repeat.set(w / 64, (gap + 8) / 64);
        for (const [b, s] of g.bells) { b.scale.set(6, gap + 4, 26); b.position.set(s * (w / 2 + 3), 0, 9); }
        for (const [e, s] of g.edges) { e.scale.set(1.6, gap + 8, 1.6); e.position.set(s * (w / 2 - 1), 0, .4); }
        g.edgeM.emissive.set(rail);
      }
    } catch (e) { errLog(e); }
    return r;
  };
})();
