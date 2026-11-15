/* ==========================================================================
   v82 · THE CRATE IS GUARDED. In the crate film a guardian ninja stands
   before the sealed crate and your hero has to win the duel: every strike
   is an exchange (the guardian blocks, sparks fly, it is driven back, a
   seal breaks), the last strike cuts the guardian down and the crate opens.
   The guardian and its fall tell the rarity:
     COMMON     a grey guardian: one clean cut, it fades
     RARE       a blue guardian: it blocks once, falls in blue sparks
     EPIC       a purple guardian: it blinks from side to side between
                exchanges, lightning, it shatters
     LEGENDARY  a golden samurai in a golden aura: it falls to its knees
                and scatters into gold dust
     MYTHIC     a red oni that splits into three: one giant cut takes all
                three, a red burst
   Your own 3D hero fights it (where 3D runs; elsewhere the film is as
   before). Display only.
   ========================================================================== */
const Duel82 = {
  LOOK: [['ninja', '#9aa4b8', '#2a2f3e'], ['shinobi2', '#4d7cff', '#0c1430'], ['kitsune', '#c45bff', '#1a0d26'], ['shogun', '#ffd23f', '#3a2a08'], ['oni', '#ff2b4e', '#2a0608']],
  rn: null, g: null, key: '', st: null, u: 0, r: 0, S: null,
  init() {
    if (this.rn) return true; const T = THREE;
    try { const cv = document.createElement('canvas'); cv.width = cv.height = 320; const rn = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
      rn.outputColorSpace = T.SRGBColorSpace; rn.toneMapping = T.ACESFilmicToneMapping; rn.setSize(320, 320, false); rn.setClearColor(0x000000, 0); this.rn = rn;
      const sc = new T.Scene(); this.scene = sc; sc.add(new T.HemisphereLight(0x9fb0ff, 0x201030, 1.4)); const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(-1.2, 3, 2.5); sc.add(key);
      this.rim = new T.DirectionalLight(0xffffff, 2.6); this.rim.position.set(0, 2.5, -3); sc.add(this.rim);
      const root = new T.Group(); root.rotation.x = -Math.PI / 2; const inner = new T.Group(); inner.scale.set(1 / 30, -1 / 30, 1 / 30); root.add(inner); sc.add(root); this.inner = inner;
      this.cam = new T.PerspectiveCamera(32, 1, .05, 30); this.cam.position.set(0, 1.5, 4.4); this.cam.lookAt(0, 1.05, 0); return true; }
    catch (e) { errLog(e); this.dead = 1; return false; }
  },
  begin(r) {
    this.on = false; this.r = r | 0; this.hits = 0; this.in82 = 0; this.lng = -1; this.arc = -9; this.dead82 = -1; this.blk = -9; this.off = 0; this.last = 0; this.hpv = 3;
    if (this.dead || typeof CrateHero === 'undefined' || !CrateHero.on || !this.init()) return;
    try { const L = this.LOOK[Math.min(4, this.r)], key = L.join('|');
      if (Human.HEAVY[L[0]] && !Models.ok('soldier')) Models.load('soldier');
      if (this.key !== key) { if (this.g) this.inner.remove(this.g); const g = Human.build({ body: L[0], a: L[1], b: L[2] }, this.r >= 3 ? 'nodachi' : 'katana'); if (g.pool) g.pool.visible = false; try { Look.dress(g); } catch (e) { errLog(e); } this.inner.add(g); this.g = g; this.key = key;
        this.mats = []; const C = new THREE.Color(L[1]); g.traverse(o => { if (o.isMesh && o.material) { const m = o.material = o.material.clone(); m.transparent = true; if (m.color && !m.isMeshBasicMaterial) m.color.lerp(C, .3); if (m.emissive) { m.emissive.copy(C); m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, .1); } this.mats.push(m); } }); } // (the guardian wears its rarity: tinted and lit in its color)
      this.g.mv = null; this.rim.color.set(L[1]); this.rim.intensity = 4.5; this.on = true;
    } catch (e) { errLog(e); this.on = false; }
  },
  /* one frame of the guardian, under the hero */
  draw(g, t) {
    const st = this.st; if (!this.on || !st || !this.g) return; const S = this.S, CF = CrateFilm, L = this.LOOK[Math.min(4, this.r)], c = L[1], r = this.r, u = this.u;
    const rd = this.last ? Math.min(.05, Math.max(0, t - this.last)) : .016; this.last = t;
    let gx = 200 + this.off, gy = 500, alpha = 1, dash = false, sc = 2.3;
    // the entrance: it drops in with a puff of smoke as the crate lands
    if (st.k === 'drop') { const k = Math.min(1, Math.max(0, (u - .55) / .25)); if (k <= 0) return; alpha = k; gy -= (1 - k) * 60; if (!this.in82) { this.in82 = 1; try { CF.burst(S, gx, gy - 40, '#cfd6e6', 22, 200, .7); CF.burst(S, gx, gy - 40, c, 10, 160, .6); Aud.sfx('warp'); } catch (e) { } } }
    // the exchanges: on each strike's hit the guardian blocks (or, on the last, is cut down)
    if (st.k === 'strike') { const big = st.fin && r >= 3, wind = big ? .55 : .25, v = (u - wind) / (1 - wind);
      if (v >= .4 && this.hits < st.i) { this.hits = st.i;
        if (st.fin) { this.dead82 = t; this.fall(S, gx, gy - 70, c, r); }
        else { this.blk = t; this.hpv--; this.arc = t; this.arcY = gy - 80; try { S.flash = Math.max(S.flash || 0, .25); S.fc = c; } catch (e) { } try { CF.burst(S, gx, gy - 80, '#ffffff', 16, 320, .5); CF.burst(S, gx, gy - 80, c, 12, 260, .6); } catch (e) { errLog(e); } try { Aud.sfx('clash'); } catch (e) { } } } }
    // EPIC and up: the guardian blinks aside between exchanges
    if (st.k === 'beat' && r >= 2 && this.dead82 < 0) { const side = (st.i % 2 ? 1 : -1), k = Math.min(1, Math.max(0, (u - .35) / .15));
      if (k > 0 && k < 1) alpha = Math.abs(.5 - k) * 2; this.off = side * 70 * k + (1 - k) * this.off; gx = 200 + this.off;
      if (k > 0 && k < .2) try { CF.burst(S, gx, gy - 70, c, 3, 120, .4); } catch (e) { } }
    // the guardian strikes back between the exchanges: a lunge at the hero, blades meet half way
    if (st.k === 'beat' && this.dead82 < 0 && u > .5 && u < .8) { const k = (u - .5) / .3; gy += Math.sin(k * Math.PI) * 48; dash = k < .7;
      if (k > .45 && this.lng !== st.i) { this.lng = st.i; try { CF.burst(S, 200, 540, '#ffffff', 14, 300, .45); CF.burst(S, 200, 540, c, 10, 240, .5); S.flash = Math.max(S.flash || 0, .22); S.fc = c; S.shake = Math.max(S.shake || 0, .3); Aud.sfx('clash'); } catch (e) { } this.arc = t; this.arcY = 540; } }
    if (t - (this.arc || -9) < .18) try { const q = 1 - (t - this.arc) / .18; CF.slashArc(g, 200, this.arcY || 470, 60, -2.6, -.5, c, 8, q); CF.slashArc(g, 200, this.arcY || 470, 60, .6, 2.6, '#ffffff', 5, q); } catch (e) { }
    const sinceBlk = t - this.blk; if (sinceBlk < .35) { gy -= 18 * (1 - sinceBlk / .35); dash = sinceBlk < .2; } // (driven back, its blade up)
    if (this.dead82 >= 0) { const k = (t - this.dead82) / .9; if (k >= 1) return; alpha = 1 - k; sc *= r === 3 ? 1 - k * .25 : 1; gy += r === 3 ? k * 30 : 0; } // (LEGENDARY: it sinks to its knees as it goes)
    // LEGENDARY: a golden aura; MYTHIC: two shadow clones beside it
    if (r === 3 && this.dead82 < 0) try { CF.aura(g, gx, gy - 70, 46 + Math.sin(t * 6) * 6, c, t); } catch (e) { }
    const G3 = this.g; Human.anim(G3, { x: 0, y: 0, face: Math.PI / 2, spd: 0, dashing: dash, alpha: 1, hp: this.hpv }, rd, t); G3.position.set(0, 0, 0);
    for (const m of this.mats) m.opacity = alpha;
    this.rn.render(this.scene, this.cam);
    const Z = sc * 100, img = this.rn.domElement, put = (x, a) => { g.save(); g.globalAlpha = a; g.drawImage(img, x - Z / 2, gy + sc * 16 - Z * .82, Z, Z); g.restore(); };
    if (r === 4 && this.dead82 < 0) { const sp = 85 + Math.sin(t * 3) * 6; put(gx - sp, .45 * alpha); put(gx + sp, .45 * alpha); }
    put(gx, 1);
  },
  /* the fall, by rarity */
  fall(S, x, y, c, r) {
    const CF = CrateFilm; try { Aud.sfx('zan'); } catch (e) { }
    try { CF.burst(S, x, y, c, [16, 26, 40, 60, 90][r], [240, 300, 380, 420, 520][r], [.6, .7, .9, 1.2, 1.3][r]); if (r >= 1) CF.burst(S, x, y, '#ffffff', 10 + r * 6, 300, .5);
      if (r === 4) { for (const dx of [-85, 85]) CF.burst(S, x + dx, y, c, 30, 360, 1); S.flash = .6; S.fc = c; }
      if (r >= 2) S.shake = Math.max(S.shake || 0, .4 + r * .15); } catch (e) { errLog(e); }
  }
};
{
  const run0 = Seals.run.bind(Seals);
  Seals.run = function (res, done) { const out = run0(res, done); try { Duel82.begin(res.r | 0); } catch (e) { errLog(e); } return out; };
  const fr0 = Seals.frame.bind(Seals);
  Seals.frame = function (g, S, st, u, t) { Duel82.st = st; Duel82.u = u; Duel82.S = S; return fr0.apply(this, arguments); };
  const hero0 = CrateFilm.hero.bind(CrateFilm);
  CrateFilm.hero = function (g, o, x, y, face, s, blade, dash, t) { if (Duel82.on && document.querySelector('.cr-film')) try { Duel82.draw(g, t); } catch (e) { errLog(e); Duel82.on = false; } return hero0.apply(this, arguments); };
}
