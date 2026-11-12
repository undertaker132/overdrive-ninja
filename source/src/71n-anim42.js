/* =====================================================================
   3D IN MOTION (version 42), render only:
   · HERO: every swing leaves a glowing 3D blade trail in the weapon's
     color; dashes leave three fading afterimages; the body leans into
     turns, stretches in a dash, squashes on the landing and breathes
     when standing
   · ENEMIES: a ring of light when they spawn (and a white glow while they
     form), a recoil away from your blade when hit
   · BOSSES: a shockwave when they land, a bigger one with a flash on every
     phase change, a pulsing glow and a crouch while they wind up an
     attack, mechs stomp as they walk, gunships and cores bank into their
     movement, a wobble with sparks while staggered, and a death that
     shakes, flickers and breaks the boss apart in waves
   ===================================================================== */
Object.assign(R3, {
  fxl: [], sparks: [],
  ring(x, y, col, r1, dur) {
    if (!this.on || this.fxl.length > 16) return; const T = THREE;
    const m = new T.Mesh(this.ringG || (this.ringG = new T.RingGeometry(.84, 1, 56)), new T.MeshBasicMaterial({ color: new T.Color(col), transparent: true, opacity: .9, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    m.position.set(x, y, 2); m.renderOrder = 3; this.root.add(m); this.fxl.push({ m, t: 0, d: dur || .6, r: r1 || 120 });
  },
  fxTick(rd) {
    for (let i = this.fxl.length - 1; i >= 0; i--) { const f = this.fxl[i]; f.t += rd; const u = f.t / f.d;
      if (u >= 1) { this.root.remove(f.m); f.m.material.dispose(); this.fxl.splice(i, 1); continue; }
      const s = 4 + f.r * (1 - Math.pow(1 - u, 3)); f.m.scale.set(s, s, 1); f.m.material.opacity = .9 * (1 - u); }
  },
  spark(x, y, z, col) {
    if (!this.on || this.sparks.length > 60) return; const T = THREE, k = 'sp' + col;
    const m = new T.Mesh(this.spG || (this.spG = new T.BoxGeometry(1, 1, 1)), this.M[k] || (this.M[k] = this.glow(col, 4))); m.scale.setScalar(2.2); this.root.add(m);
    const a = Math.random() * TAU, v = 80 + Math.random() * 160; this.sparks.push({ m, x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 120 + Math.random() * 180, t: 0 });
  },
  sparkTick(rd) {
    for (let i = this.sparks.length - 1; i >= 0; i--) { const s = this.sparks[i]; s.t += rd; if (s.t > .55) { this.root.remove(s.m); this.sparks.splice(i, 1); continue; }
      s.vz -= 700 * rd; s.x += s.vx * rd; s.y += s.vy * rd; s.z = Math.max(1, s.z + s.vz * rd); s.m.position.set(s.x, s.y, s.z); s.m.scale.setScalar(2.2 * (1 - s.t / .55) + .2); s.m.rotation.set(s.t * 9, s.t * 7, 0); }
  },
  /* ---------- the blade trail ---------- */
  trailInit() {
    const T = THREE, N = this.TN = 18, g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 6), 3)); g.setAttribute('color', new T.BufferAttribute(new Float32Array(N * 6), 3));
    const idx = []; for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } g.setIndex(idx);
    this.trail = new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    this.trail.frustumCulled = false; this.trail.renderOrder = 4; this.scene.add(this.trail); this.tq = []; this.tc = new T.Color();
  },
  tipOf(hg) {
    if (hg.tipX != null) return hg.tipX; let mx = 6;
    for (const c of hg.blade.children) { if (!c.geometry) continue; c.geometry.computeBoundingBox(); mx = Math.max(mx, c.position.x + c.geometry.boundingBox.max.x * c.scale.x); }
    return (hg.tipX = mx);
  },
  trailTick(hg, rd) {
    if (!this.trail) this.trailInit(); const T = THREE, bl = hg.blade, tip = this.tipOf(hg) * (hg.bladeMesh ? Math.max(1, hg.bladeMesh.scale.x) : 1);
    hg.updateMatrixWorld(true); const a = new T.Vector3(Math.max(2, tip * .3), 0, 0), b = new T.Vector3(tip, 0, 0); bl.localToWorld(a); bl.localToWorld(b);
    const q = this.tq, last = q[0], sp = last ? b.distanceTo(last.b) / Math.max(rd, 1 / 240) : 0;
    q.unshift({ a, b, t: 0, k: clamp((sp - 260) / 700, 0, 1) }); if (q.length > this.TN) q.length = this.TN;
    for (const s of q) s.t += rd;
    const pos = this.trail.geometry.attributes.position.array, colA = this.trail.geometry.attributes.color.array, c = this.tc.copy(hg.bladeMat ? hg.bladeMat.emissive : new T.Color('#00f2fe'));
    let any = false;
    for (let i = 0; i < this.TN; i++) { const s = q[Math.min(i, q.length - 1)], al = i < q.length ? Math.max(0, 1 - s.t / .16) * s.k * (1 - i / this.TN) : 0, o = i * 6; if (al > .02) any = true;
      pos[o] = s.a.x; pos[o + 1] = s.a.y; pos[o + 2] = s.a.z; pos[o + 3] = s.b.x; pos[o + 4] = s.b.y; pos[o + 5] = s.b.z;
      colA[o] = c.r * al * .35; colA[o + 1] = c.g * al * .35; colA[o + 2] = c.b * al * .35; colA[o + 3] = c.r * al * 1.6; colA[o + 4] = c.g * al * 1.6; colA[o + 5] = c.b * al * 1.6; }
    this.trail.visible = any && !CALM; this.trail.geometry.attributes.position.needsUpdate = true; this.trail.geometry.attributes.color.needsUpdate = true;
  },
  /* ---------- dash afterimages ---------- */
  ghostTick(hg, o, rd) {
    if (!this.gh) { this.gh = []; for (let i = 0; i < 3; i++) { const g = this.hero('#ffffff', '#ffffff', true); g.visible = false; this.root.add(g); this.gh.push({ g, t: 9 }); } this.ghT = 0; this.ghC = ''; }
    const col = o.ca || P.ca || '#00f2fe';
    if (this.ghC !== col) { this.ghC = col; for (const q of this.gh) q.g.traverse(m => { if (m.material && m.material.color) m.material.color.set(col); }); }
    if (o.dashing && !CALM) { this.ghT -= rd; if (this.ghT <= 0) { this.ghT = .04; let q = this.gh[0]; for (const x of this.gh) if (x.t > q.t) q = x; q.t = 0;
        this.animHero(q.g, { x: hg.position.x, y: hg.position.y, face: hg.rotation.z, spd: 900, ph: 0, dashing: true, blade: o.blade, bl: o.bl, alpha: 1 }, 0, this.t); q.g.scale.copy(hg.scale); } }
    for (const q of this.gh) { q.t += rd; const a = Math.max(0, 1 - q.t / .24); q.g.visible = a > .02; if (q.g.visible) q.g.traverse(m => { if (m.material && m.material.transparent) m.material.opacity = .42 * a; }); }
  },
  /* ---------- bosses ---------- */
  bossTick(rd) {
    const b = Boss.cur; if (!b) { this.bst = null; return; } const r = this.ents.get('boss' + b.id + (b.lvl || '')); if (!r || r.seen !== this.frame) return;
    const g = r.g, col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844', t = this.t, ent = b.enter == null ? 1 : b.enter;
    if (!this.bst || this.bst.b !== b) this.bst = { b, ent, ph: b.ph, sp: 0, ds: 0, dead: 0 }; const S = this.bst;
    if (S.ent < 1 && ent >= 1) { this.ring(b.x, b.y, col, b.r * 5.5, .75); this.ring(b.x, b.y, '#ffffff', b.r * 3, .45); for (let i = 0; i < 10; i++) this.spark(b.x, b.y, 4, col); } // the landing
    S.ent = ent;
    if (b.ph !== S.ph) { if (S.ph != null && !(b.dying > 0)) { this.ring(b.x, b.y, col, b.r * 8, 1); this.ring(b.x, b.y, '#ffffff', b.r * 4, .5); this.flashes.push({ x: b.x, y: b.y, c: col, t: 0 }); } S.ph = b.ph; } // a new phase
    const vx = b.vx || 0, vy = b.vy || 0, sp = Math.hypot(vx, vy), tele = /tele|aim|charge|wind|prep|lock/.test(b.st || '') || !!(b.beam && b.beam.tele > 0);
    g.scale.z *= 1 + Math.sin(t * 2.2) * .025 - (tele ? .07 : 0); // breathing, and a crouch before an attack
    if (!g.serpent && !g.hover && !g.ronin && ent >= 1) g.position.z += Math.abs(Math.sin(t * 9)) * Math.min(1, sp / 300) * b.r * .08; // the walk stomps
    let rx = 0, ry = 0; if (g.hover && sp > 1) { const k = Math.min(.32, sp / 900); ry = vx / sp * k; rx = -vy / sp * k; } // banking into the movement
    if (g.bodyMat && !(b._fl > .02) && !(b.dying > 0)) g.bodyMat.emissiveIntensity = .2 + (tele ? (.6 + Math.sin(t * 22) * .4) * 1.6 : 0);
    if (b.stag > 0) { rx += Math.sin(t * 27) * .12; ry += Math.cos(t * 23) * .12; S.sp -= rd; if (S.sp <= 0) { S.sp = .1; this.spark(b.x + (Math.random() - .5) * b.r, b.y + (Math.random() - .5) * b.r, b.r * 1.4, '#ffd23f'); } }
    g.rotation.x = rx; g.rotation.y = ry;
    if (b.dying > 0) {
      if (!S.dead) { S.dead = 1; for (let i = 0; i < 4; i++) this.debris({ x: b.x + (Math.random() - .5) * b.r, y: b.y + (Math.random() - .5) * b.r, r: b.r * .8, col }); this.ring(b.x, b.y, col, b.r * 10, 1.2); this.ring(b.x, b.y, '#ffffff', b.r * 5, .6); }
      const k = Math.max(0, 1 - b.dying / 1.6); g.position.x += (Math.random() - .5) * b.r * .25 * k; g.position.y += (Math.random() - .5) * b.r * .25 * k;
      if (g.bodyMat) g.bodyMat.emissiveIntensity = Math.random() < .5 ? 2.6 : .1;
      S.ds -= rd; if (S.ds <= 0) { S.ds = .16; this.debris({ x: b.x + (Math.random() - .5) * b.r * 1.5, y: b.y + (Math.random() - .5) * b.r * 1.5, r: b.r * .4, col }); for (let i = 0; i < 3; i++) this.spark(b.x, b.y, b.r, col); }
    }
  }
});
{
  // the hero's body language (only the player's own ninja)
  const ah1 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) {
    ah1(g, o, rd, t); const h = this.ents.get('hero'); if (!h || h.g !== g || CALM) return;
    const s0 = g.s0 || 1.45; let sx = 1, sz = 1;
    const df = g.pf == null ? 0 : angDiff(o.face, g.pf); g.pf = o.face; g.lean = (g.lean || 0) * .82 + clamp(-df * 4, -.4, .4) * .18; g.torso.rotation.x = g.lean; // leaning into turns
    if (g.wasDash && !o.dashing) g.sq = .16; g.wasDash = !!o.dashing;
    if (g.sq > 0) { g.sq -= rd; const k = Math.max(0, g.sq) / .16; sz = 1 - .18 * k; sx = 1 + .1 * k; } // the landing
    if (o.dashing) { sx *= 1.1; sz *= .93; } // stretched by the dash
    if ((o.spd || 0) < 30 && !o.dashing) sz *= 1 + Math.sin(t * 2.6) * .018; // breathing
    g.scale.set(s0 * sx, s0, s0 * sz);
  };
  // enemies: a ring when they appear, a glow while they form, a recoil when hit
  const ei1 = R3.enemyInst.bind(R3); R3.enemyInst = function (e) { const g = ei1(e); try { this.ring(e.x, e.y, e.col || '#ff3b5c', (e.r || 14) * 3, .5); } catch (er) { errLog(er); } return g; };
  const ae1 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) {
    ae1(g, e, t); if (CALM) return;
    if (e.spawnT > 0 && g.bodyMat && g.bodyMat.emissive) { g.bodyMat.emissive.set('#ffffff'); g.bodyMat.emissiveIntensity = Math.max(g.bodyMat.emissiveIntensity, 2.2 * e.spawnT / .45); }
    if (e.fl > .05) { const k = Math.min(1, e.fl), dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) || 1; g.scale.z *= 1 - .22 * k; g.scale.x *= 1 + .12 * k; g.scale.y *= 1 + .12 * k; g.rotation.y = dx / d * .45 * k; g.rotation.x = -dy / d * .45 * k; }
    else { g.rotation.x = 0; g.rotation.y = 0; }
  };
  // everything above runs once per frame, right before the frame is drawn
  const sw0 = R3.sweep.bind(R3);
  R3.sweep = function () {
    const rd = Math.min(.05, RDT || 1 / 60);
    try { this.fxTick(rd); this.sparkTick(rd); this.bossTick(rd); const h = this.ents.get('hero');
      if (h && W3D.ho && h.seen === this.frame) { this.trailTick(h.g, rd); this.ghostTick(h.g, W3D.ho, rd); } else { if (this.trail) this.trail.visible = false; if (this.gh) for (const q of this.gh) q.g.visible = false; }
      this.bullets(); } catch (e) { errLog(e); }
    return sw0();
  };
}
