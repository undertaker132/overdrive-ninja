
/* --- MODULE 22: v111.0 CHASE FEEL — the chase camera answers the fight, and the finger lands true --- */
(function () {
  'use strict';
  // Control: a touch above the horizon (the sky over the far roof) had no roof under it and fell back to the top view's
  // math: the aim jumped somewhere else. It now points along the roof toward the horizon, where the finger is.
  // A swipe is measured on the screen, not on the roof: near the camera a short swipe was too short on the roof to count.
  // Feel: the view widens in a dash and rolls with a sideways one, punches in on a kill, kicks back when you are hit;
  // streaks of wind rush past the hero while dashing and in Overdrive. A camera switch in the pause menu and on the T key (V is the dodge).
  // Only the view and the reading of the finger change; replays keep the angles they recorded.
  if (typeof R3 === 'undefined' || typeof THREE === 'undefined' || !window.ChaseCam108) return;
  const on = () => { try { return window.ChaseCam108.on(); } catch (e) { return false; } };
  const persp = () => R3.cam && R3.cam.isPerspectiveCamera ? R3.cam : null;
  if (typeof HE !== 'undefined') Object.assign(HE, { "CAMERA: CHASE": "מצלמה: מרדף", "CAMERA: TOP": "מצלמה: מלמעלה" });

  /* ---------------- the finger ---------------- */
  const up0 = W3D.unproj.bind(W3D);
  W3D.unproj = function (sx, sy) {
    const c = on() && persp(); if (!c) return up0(sx, sy);
    const t = THREE, rc = this._rc111 || (this._rc111 = new t.Raycaster()), v = this._v111 || (this._v111 = new t.Vector2());
    rc.setFromCamera(v.set(sx / V.VW * 2 - 1, -(sy / V.VH * 2 - 1)), c);
    const d = rc.ray.direction; if (d.z > -.035) { d.z = -.035; d.normalize(); } // (above the horizon: along the roof, toward it)
    const s = -rc.ray.origin.z / d.z; return [rc.ray.origin.x + d.x * s, -(rc.ray.origin.y + d.y * s)];
  };
  // the swipe threshold in roof units, scaled by how much roof one screen unit covers where the swipe starts
  const sm0 = swipeMin;
  swipeMin = function () {
    const b = sm0(); if (!on() || !persp() || !In.on && In.sx == null) return b;
    try {
      const q = W3D.proj(In.sx, In.sy, 0), k = V.s * V.dpr, sx = q[0] / k, sy = q[1] / k; if (!(sx > -9000)) return b;
      const a = W3D.unproj(sx, sy), r = W3D.unproj(sx + 10, sy), u = W3D.unproj(sx, sy + 10);
      const s2 = ((r[0] - a[0]) ** 2 + (r[1] - a[1]) ** 2 + (u[0] - a[0]) ** 2 + (u[1] - a[1]) ** 2) / 200; // (squared roof units per screen unit)
      return b * clamp(s2, .25, 16);
    } catch (e) { return b; }
  };

  /* ---------------- the camera answers ---------------- */
  const F = { fov: 0, roll: 0, punch: 0, recoil: 0, kills: 0, hp: 0, last: 0, ready: false };
  const sc0 = R3.syncCam.bind(R3);
  R3.syncCam = function () {
    const c0 = persp(); if (c0 && F.last) { c0.fov -= F.last; F.last = 0; } // (the chase camera eases its own fov: hand it back clean)
    const r = sc0.apply(this, arguments);
    const c = on() && persp();
    if (!c || CALM || !(Store.data.settings.shake == null || Store.data.settings.shake)) { F.ready = false; Streaks.show(false); return r; }
    const dt = Math.min(.05, RDT || 1 / 60);
    if (!F.ready) { F.ready = true; F.kills = G.kills | 0; F.hp = P.hp; }
    if ((G.kills | 0) > F.kills) F.punch = Math.min(1, F.punch + .55 + .1 * ((G.kills | 0) - F.kills - 1)); F.kills = G.kills | 0;
    if (P.hp < F.hp) F.recoil = 1; F.hp = P.hp;
    const dash = P.dashT > 0, od = G.odT > 0;
    F.fov += ((dash ? 7 : od ? 3 : 0) - F.fov) * (1 - Math.exp(-(dash ? 18 : 5) * dt));
    F.roll += ((dash ? clamp((P.vx || 0) / 1500, -1, 1) * .03 : 0) - F.roll) * (1 - Math.exp(-8 * dt));
    F.punch = Math.max(0, F.punch - dt * 5); F.recoil = Math.max(0, F.recoil - dt * 4);
    const fw = new THREE.Vector3(); c.getWorldDirection(fw);
    c.position.addScaledVector(fw, 22 * F.punch * F.punch - 16 * F.recoil); c.position.z += 10 * F.recoil;
    c.rotateZ(F.roll + Math.sin(performance.now() * .05) * .02 * F.recoil);
    F.last = F.fov - 2 * F.punch; c.fov += F.last; c.updateProjectionMatrix(); c.updateMatrixWorld();
    Streaks.update(dt, dash || od);
    return r;
  };

  /* ---------------- streaks of wind ---------------- */
  const Streaks = {
    n: 46, m: null, a: null, s: [],
    build() {
      const t = THREE, g = new t.BufferGeometry(); this.a = new Float32Array(this.n * 6); g.setAttribute('position', new t.BufferAttribute(this.a, 3));
      this.m = new t.LineSegments(g, new t.LineBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0, blending: t.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
      this.m.frustumCulled = false; this.m.renderOrder = 6; R3.scene.add(this.m);
      for (let i = 0; i < this.n; i++) this.s.push(this.seed({}, true));
    },
    seed(o, any) { /* (ahead of the hero and beside it, never between it and the camera, where a streak filled the screen) */ o.ox = (Math.random() < .5 ? -1 : 1) * (26 + Math.random() * 130); o.oy = -20 - Math.random() * 220; o.z = 3 + Math.random() * 45; o.p = any ? Math.random() : 0; o.sp = .9 + Math.random() * .8; return o; },
    show(v) { if (this.m) this.m.visible = v; },
    update(dt, live) {
      if (!this.m) this.build();
      const target = live ? (G.odT > 0 ? .28 : .42) : 0; this.m.material.opacity += (target - this.m.material.opacity) * (1 - Math.exp(-10 * dt));
      this.show(this.m.material.opacity > .02); if (!this.m.visible) return;
      this.m.material.color.set(G.odT > 0 ? '#ffd700' : (P.ca || '#bfefff'));
      const vx = P.vx || 0, vy = P.vy || 0, sp = Math.hypot(vx, vy), ux = sp > 40 ? vx / sp : 0, uy = sp > 40 ? vy / sp : -1, L = 16 + Math.min(40, sp * .035);
      for (let i = 0; i < this.n; i++) {
        const o = this.s[i]; o.p += dt * o.sp * 2.2; if (o.p > 1) this.seed(o, false);
        // each streak slides from ahead of the hero to behind it, along the run
        const along = (1 - 2 * o.p) * 110, x = P.x + o.ox + ux * along, y = P.y + o.oy + uy * along, j = i * 6;
        this.a[j] = x; this.a[j + 1] = -y; this.a[j + 2] = o.z; this.a[j + 3] = x - ux * L; this.a[j + 4] = -(y - uy * L); this.a[j + 5] = o.z;
      }
      this.m.geometry.attributes.position.needsUpdate = true;
    }
  };

  /* ---------------- switch the camera in the pause menu and on T ---------------- */
  const can = () => { try { return R3.ok && W3D.want && W3D.want(); } catch (e) { return !!R3.ok; } };
  function toggleCam() {
    const s = Store.data.settings; s.chase108 = s.chase108 === 1 ? 0 : 1; if (s.chase108 === 1) { s.d3 = 1; s.r3m = 1; } // (d3 1 is the three.js 3D the chase view needs; 2 is the classic 3D)
    Store.touch(); try { Aud.sfx('ui'); } catch (e) { } return s.chase108 === 1;
  }
  const label = () => lt(Store.data.settings.chase108 === 1 ? 'CAMERA: CHASE' : 'CAMERA: TOP');
  const tp0 = Flow.togglePause.bind(Flow);
  Flow.togglePause = function () {
    const r = tp0.apply(this, arguments);
    try {
      if (G.state === 'PAUSE' && can()) {
        let b = document.getElementById('psCam');
        if (!b) { b = el('button', 'btn'); b.id = 'psCam'; b.type = 'button'; b.onclick = () => { toggleCam(); b.textContent = label(); }; const ref = document.getElementById('psReport'); ref.parentElement.insertBefore(b, ref); }
        b.textContent = label(); b.classList.remove('hidden');
      }
    } catch (e) { errLog(e); }
    return r;
  };
  window.addEventListener('keydown', e => {
    if (e.code !== 'KeyT' || e.repeat || G.state !== 'PLAY' || REPLAY.on || !can()) return;
    const tg = e.target && e.target.tagName; if (tg === 'TEXTAREA' || tg === 'INPUT') return;
    const c = toggleCam(); try { FX.text(P.x, P.y - 46, label(), c ? '#00f2fe' : '#ffffff', '900 12px ' + FONT_D); } catch (er) { }
  });
  // v108-v110 put a player who picked CHASE on the classic 3D (d3 2), where the chase view cannot run: once, back on the 3D
  const ld0 = Store.load.bind(Store);
  Store.load = function () { const r = ld0.apply(this, arguments); try { const s = Store.data.settings; if (!s.m111) { if (s.chase108 === 1 && s.d3 === 2) { s.d3 = 1; s.r3m = 1; } s.m111 = 1; Store.touch(); } } catch (e) { } return r; };
  window.ChaseFeel111 = { F, toggleCam };
})();
