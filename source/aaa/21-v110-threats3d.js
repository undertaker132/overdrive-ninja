
/* --- MODULE 21: v110.0 THREATS IN 3D — the chase camera's warnings stand up off the roof --- */
(function () {
  'use strict';
  // From behind the hero a ring or a line painted on the roof is flat and easy to miss. In the chase view every attack that
  // is coming also stands in the air, in the same colors as the 2D warning:
  //  · an enemy winding up an attack: a column of light rising out of it, taller and brighter as the attack nears,
  //    and a ring on the roof that closes on it
  //  · an aimed attack (the sniper's shot, a charge, a lunge, a copied dash): a wall of light along its line
  //  · a bomber's lit fuse: a dome over the blast radius that beats faster to the end
  // Only the view changes; the simulation and the replays do not.
  if (typeof R3 === 'undefined' || typeof THREE === 'undefined') return;
  const on = () => { try { return window.ChaseCam108 && window.ChaseCam108.on(); } catch (e) { return false; } };
  const T = () => THREE;
  let built = false, root = null, grad = null;
  const cols = [], lanes = [], domes = [];
  const Z = () => new (T().Vector3)(0, 0, 1);
  function gradTex() {
    const c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 64, 0, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 4, 64); return new (T().CanvasTexture)(c);
  }
  const glowMat = (map, side) => new (T().MeshBasicMaterial)({ map: map || null, color: 0xff3b5c, transparent: true, opacity: 0, blending: T().AdditiveBlending, depthWrite: false, side: side || T().FrontSide, fog: false, toneMapped: false });
  function build() {
    const t = T(); built = true; grad = gradTex(); root = new t.Group(); root.name = 'threats110'; R3.scene.add(root);
    const cylG = new t.CylinderGeometry(1, 1, 1, 20, 1, true), ringG = new t.TorusGeometry(1, .07, 4, 40), planeG = new t.PlaneGeometry(1, 1), beamG = new t.BoxGeometry(1, 1, 1);
    const domeG = new t.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    for (let i = 0; i < 14; i++) {
      const c = new t.Mesh(cylG, glowMat(grad, t.DoubleSide)); c.rotation.x = Math.PI / 2; c.frustumCulled = false;
      const r = new t.Mesh(ringG, glowMat(null)); r.frustumCulled = false;
      root.add(c); root.add(r); cols.push({ c, r });
    }
    for (let i = 0; i < 8; i++) {
      const w = new t.Mesh(planeG, glowMat(grad, t.DoubleSide)); w.frustumCulled = false;
      const b = new t.Mesh(beamG, glowMat(null)); b.frustumCulled = false;
      root.add(w); root.add(b); lanes.push({ w, b });
    }
    for (let i = 0; i < 4; i++) {
      const d = new t.Mesh(domeG, glowMat(null, t.DoubleSide)); d.rotation.x = Math.PI / 2; d.frustumCulled = false;
      const r = new t.Mesh(ringG, glowMat(null)); r.frustumCulled = false;
      root.add(d); root.add(r); domes.push({ d, r });
    }
  }
  const hideAll = () => { for (const o of cols) { o.c.visible = o.r.visible = false; } for (const o of lanes) { o.w.visible = o.b.visible = false; } for (const o of domes) { o.d.visible = o.r.visible = false; } };
  // the line an enemy is about to attack along: [angle, length, color] or null
  function laneOf(e) {
    const t = ET;
    if (e.type === t.SNIPER && e.st === 1 && !G.dark) return [e.ang, 900, '#ff9a00'];
    if (e.type === t.CLONE && e.st === 1) return [e.ang, 280, '#ff0844'];
    if (e.type === t.MIMIC && e.st === 1) return [e.da, 264, '#ff6ad5'];
    if (e.type === t.ENFORCER && e.st === 1) return [e.da, 520, '#ff0844'];
    if (e.type === t.PHANTOM && e.st === 3) return [e.ang, 170, '#7df9ff'];
    return null;
  }
  function update() {
    if (!built) build();
    hideAll(); root.visible = true;
    const t = CAM.t || 0; let nc = 0, nl = 0, nd = 0;
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i]; if (!e.alive || e.al > 0 || (e.vis != null && e.vis < .2)) continue;
      let w = 0; try { w = EAnim.windup(e); } catch (er) { }
      const x = e.x, y = -e.y, r = Math.max(8, e.r * (e.scale || 1));
      // a column of light out of an enemy about to attack
      if (w > .05 && nc < cols.length) {
        const o = cols[nc++], col = e.type === ET.SNIPER ? '#ff9a3d' : '#ff3b5c', h = 22 + 48 * w, rr = r * (1.15 + .25 * Math.sin(t * 30) * w);
        o.c.visible = true; o.c.position.set(x, y, h / 2); o.c.scale.set(rr, h, rr); o.c.material.color.set(col); o.c.material.opacity = .14 + .42 * w;
        const rg = r * (1 + 1.6 * (1 - w)) + 4; o.r.visible = true; o.r.position.set(x, y, 1.2); o.r.scale.set(rg, rg, rg); o.r.material.color.set(col); o.r.material.opacity = .35 + .6 * w;
      }
      // a wall of light along an aimed attack
      const L = laneOf(e);
      if (L && nl < lanes.length) {
        const o = lanes[nl++], [a, len, col] = L, k = Math.max(w, .35), h = 12 + 26 * k, mx = e.x + Math.cos(a) * len / 2, my = e.y + Math.sin(a) * len / 2;
        o.w.visible = true; o.w.scale.set(len, h, 1); o.w.position.set(mx, -my, h / 2); o.w.rotation.set(Math.PI / 2, 0, 0); o.w.rotateOnWorldAxis(Z(), -a);
        o.w.material.color.set(col); o.w.material.opacity = .14 + .4 * k;
        o.b.visible = true; o.b.scale.set(len, 1.6 + 2 * k, 1.6 + 2 * k); o.b.position.set(mx, -my, 14); o.b.rotation.set(0, 0, -a);
        o.b.material.color.set(col); o.b.material.opacity = .35 + .55 * k * (.75 + .25 * Math.sin(t * 40));
      }
      // a dome over a bomber's blast radius, beating faster as the fuse burns down
      if (e.type === ET.BOMBER && e.fuse > 0 && nd < domes.length) {
        const o = domes[nd++], f = clamp(1 - e.fuse / .8, 0, 1), beat = .5 + .5 * Math.sin(t * (10 + 30 * f));
        o.d.visible = true; o.d.position.set(x, y, 0); o.d.scale.set(90, 90 * (.35 + .25 * f), 90); o.d.material.color.set('#ff5500'); o.d.material.opacity = .035 + .09 * f + .04 * beat;
        o.r.visible = true; o.r.position.set(x, y, 1.2); o.r.scale.set(90, 90, 90 * .6); o.r.material.color.set('#ff7a1a'); o.r.material.opacity = .45 + .4 * beat;
      }
    }
  }
  const sc0 = R3.syncCam.bind(R3);
  R3.syncCam = function () {
    const r = sc0.apply(this, arguments);
    try { if (on() && !CALM) update(); else if (root) root.visible = false; } catch (e) { errLog(e); if (root) root.visible = false; }
    return r;
  };
  window.Threats110 = { counts: () => [cols.filter(o => o.c.visible).length, lanes.filter(o => o.w.visible).length, domes.filter(o => o.d.visible).length] };
})();
