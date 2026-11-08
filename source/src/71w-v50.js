/* =====================================================================
   VERSION 50: CRATES LIKE A MOVIE, A HERO THAT IS ALIVE
   Display only: nothing here touches a run.
   · CRATE FILMS get a camera: letterbox bars, a slow push-in, a punch-in
     and a tilt on every hit, slow motion for the moment of the cut, anime
     focus lines, light rays in the rarity's color, film grain and a
     vignette. The crate's landing gets the same bars, dust, a ring of the
     new color on every rarity step, a pulse of the camera and, at the
     end, a beam of light out of the open crate.
   · THE 3D HERO never just stands there: when you stop it breathes, shifts
     its weight, looks around and lowers its blade, and every few seconds
     it does something: twirls the blade, stretches, drops into a battle
     stance, or (on the home screen and in the Hero Forge) runs a short
     kata. Any move, aim or dash ends it at once.
   ===================================================================== */
const CineFX = {
  /* time: slow motion right after a hit (real time keeps running out) */
  time(S, dt) { if (S.slow > 0) { S.slow -= dt; return dt * .26; } return dt; },
  /* the camera: a slow push-in, a punch on hits, a small tilt */
  cam(S, dt) {
    S.punch = Math.max(0, (S.punch || 0) - dt * 3.2); S.tiltK = Math.max(0, (S.tiltK || 0) - dt * 1.6);
    const p = S.punch * S.punch;
    return { z: 1.03 + Math.min(.06, S.t * .018) + p * .16, rot: (S.tilt || 0) * .05 * Math.sin(Math.min(1, S.tiltK) * Math.PI * .5) };
  },
  hit(S, r) { S.slow = .3 + r * .05; S.punch = 1; S.tilt = Math.random() < .5 ? -1 : 1; S.tiltK = 1; S.lines = .4; S.hits = (S.hits || 0) + 1; try { vibe('crit'); } catch (e) { } },
  /* in front of the film: focus lines, light rays, vignette, grain, bars */
  front(g, W, H, dpr, S, c, r, dur, label) {
    if (S.flash > (S.pf || 0) + .15) this.hit(S, r); S.pf = S.flash;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); const cx0 = W / 2, cy0 = H * .45, R = Math.hypot(W, H);
    if (S.hits && r >= 1) { // rays in the rarity's color, turning slowly behind the moment
      g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx0, cy0); g.rotate(S.t * .25); const n = 10 + r * 2, a = .025 + r * .012;
      for (let i = 0; i < n; i++) { g.rotate(TAU / n); g.fillStyle = hexA(c, a * (.6 + .4 * Math.sin(S.t * 3 + i))); g.beginPath(); g.moveTo(0, 0); g.lineTo(R, -R * .06); g.lineTo(R, R * .06); g.closePath(); g.fill(); }
      g.restore(); }
    if (S.lines > 0) { // anime focus lines toward the middle
      S.lines -= 1 / 60; const al = Math.min(1, S.lines / .25); g.save(); g.translate(cx0, cy0); g.fillStyle = hexA('#ffffff', .55 * al);
      for (let i = 0; i < 64; i++) { const a = i / 64 * TAU + Math.random() * .05, r0 = R * (.32 + Math.random() * .18), w = .006 + Math.random() * .01;
        g.beginPath(); g.moveTo(Math.cos(a - w) * R, Math.sin(a - w) * R); g.lineTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a + w) * R, Math.sin(a + w) * R); g.closePath(); g.fill(); }
      g.restore(); }
    this.vignette(g, W, H); this.grain(g, W, H); this.bars(g, W, H, S.t, dur, c, label);
  },
  vignette(g, W, H) { const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.hypot(W, H) * .6); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); },
  grain(g, W, H) { g.save(); g.globalAlpha = .07; for (let i = 0; i < 90; i++) { g.fillStyle = Math.random() < .5 ? '#ffffff' : '#000000'; g.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5); } g.restore(); },
  bars(g, W, H, t, dur, c, label) {
    const k = Math.min(1, t / .3, Math.max(0, (dur - t) / .3)), e = 1 - Math.pow(1 - Math.max(0, k), 3), h = H * .085 * e; if (h < .5) return;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h);
    g.fillStyle = hexA(c, .8); g.fillRect(0, h - 1.5, W, 1.5); g.fillRect(0, H - h, W, 1.5);
    if (label && e > .9) { g.font = '700 11px ' + FONT_M; g.fillStyle = hexA(c, .85); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, W / 2, h / 2 + 2); }
  }
};
{ // the crate film with the camera
  CrateFilm.film = function (res, done) {
    const ov = el('div', 'cr-film'), cv = document.createElement('canvas'); ov.appendChild(cv); const skip = el('button', 'chip', lt('SKIP')); skip.className = 'chip cr-skip'; ov.appendChild(skip); document.body.appendChild(ov);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d');
    const k = Math.min(W / 400, H / 700), ox = (W - 400 * k) / 2, oy = (H - 700 * k) / 2, R0 = RAR[res.r], dur = [2.2, 2.6, 3.1, 4.4, 5.4][res.r];
    const sk = skinLook(Store.data.skin), o = Object.assign({}, HO); heroSetSkin(o, sk); o.w = Store.data.weapon || 'katana'; o.fx = bladeOf(Store.data.blade); o.alpha = 1; o.sx = o.sy = 1; o.hot = 0; o.od = 0; o.bl = 60;
    const S = { t: 0, parts: [], shake: 0, flash: 0, cut: -1, sfx: {} }, sc = this.scenes[res.r], calm = !!CALM, label = lt((CRATE_T[res.t || 'neon'] || CRATE_T.neon).n);
    let last = performance.now(), end = false;
    const finish = () => { if (end) return; end = true; ov.remove(); done(); };
    skip.onclick = e => { e.stopPropagation(); finish(); }; ov.addEventListener('click', () => { if (S.t > .5) finish(); });
    const once = (key, f) => { if (!S.sfx[key]) { S.sfx[key] = 1; try { f(); } catch (e) { } } };
    const step = now => {
      if (end) return; let dt = Math.min(.05, (now - last) / 1000); last = now; if (!calm) dt = CineFX.time(S, dt); S.t += dt;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#04050c'; g.fillRect(0, 0, W, H);
      const sh = S.shake > 0 ? S.shake * 8 * k : 0; S.shake = Math.max(0, S.shake - dt * 2.5);
      const cam = calm ? { z: 1, rot: 0 } : CineFX.cam(S, dt);
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.translate(W / 2, H / 2); g.rotate(cam.rot); g.scale(cam.z, cam.z); g.translate(-W / 2 + ox + (Math.random() - .5) * sh, -H / 2 + oy + (Math.random() - .5) * sh); g.scale(k, k);
      withCtx(g, () => { try { sc.call(this, g, S, o, R0, dt, once); } catch (e) { errLog(e); } this.particles(g, S, dt); });
      if (S.flash > 0) { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = hexA(S.fc || '#ffffff', Math.min(1, S.flash)); g.fillRect(0, 0, W, H); }
      if (!calm) try { CineFX.front(g, W, H, dpr, S, R0.c, res.r, dur, label); } catch (e) { errLog(e); }
      S.flash = Math.max(0, S.flash - dt * 2.2);
      if (S.t >= dur) return finish(); requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  CrateFilm.run = function (res, done) { CratePre.run(res, () => CrateFilm.film(res, done)); }; // (the landing, then the film)
  // the landing: the same bars, dust, a ring and a camera pulse on every rarity step, a beam out of the open crate
  CratePre.run = function (res, done) {
    const ov = el('div', 'cr-film'), cv = document.createElement('canvas'); ov.appendChild(cv); document.body.appendChild(ov);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d');
    const box = document.createElement('canvas'), BS = Math.round(Math.min(W, H) * .62 * dpr); box.width = box.height = BS; const bg = box.getContext('2d');
    const T = CRATE_T[res.t || 'neon'], steps = RAR.slice(0, res.r + 1).map(x => x.c), dur = 1.5 + res.r * .34, calm = !!CALM, label = lt(T.n);
    const S = { t: 0, flash: 0, rings: [], dust: [], pulse: 0 }; let last = performance.now(), end = false, tick = -1;
    const finish = () => { if (end) return; end = true; ov.remove(); done(); }; ov.addEventListener('click', () => { if (S.t > .3) finish(); });
    const step = now => { if (end) return; const dt = Math.min(.05, (now - last) / 1000); last = now; const t = S.t += dt;
      const u = t / dur, land = Math.min(1, t / .35), y = (1 - (1 - Math.pow(1 - land, 3))) * -H * .6 * dpr, sh = t > .35 ? Math.pow(Math.min(1, (t - .35) / (dur - .5)), 2) * 18 * dpr : 0;
      const ci = Math.min(steps.length - 1, Math.floor(Math.max(0, (t - .45) / Math.max(.2, (dur - .7) / steps.length)))), col = steps[Math.max(0, ci)], crack = t > .45 ? Math.min(1, (t - .45) / (dur - .7)) : 0;
      const bx = cv.width / 2, by = cv.height / 2;
      if (land >= 1 && !S.landed) { S.landed = 1; S.pulse = .6; try { Aud.sfx('wall'); vibe('tap'); } catch (e) { } for (let i = 0; i < 26; i++) { const a = Math.PI + Math.random() * Math.PI, v = (60 + Math.random() * 160) * dpr; S.dust.push({ x: bx + (Math.random() - .5) * BS * .6, y: by + BS * .4, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .4, l: .8 + Math.random() * .5 }); } }
      if (ci !== tick && t > .45) { tick = ci; try { Aud.sfx(ci >= 3 ? 'warn' : 'tick'); } catch (e) { } S.rings.push({ c: col, t: 0, big: ci >= 3 }); S.pulse = ci >= 3 ? 1 : .55; if (ci >= 3) { S.flash = .35; S.fc = col; try { vibe('od'); } catch (e) { } } }
      const lid = u > .86 ? (u - .86) / .14 : 0; S.pulse = Math.max(0, S.pulse - dt * 3);
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#04050c'; g.fillRect(0, 0, cv.width, cv.height);
      if (crack > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(bx, by); g.rotate(t * .8); for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.fillStyle = hexA(col, .08 * crack); g.beginPath(); g.moveTo(0, 0); g.lineTo(cv.width, -60 * dpr); g.lineTo(cv.width, 60 * dpr); g.closePath(); g.fill(); } g.restore(); }
      // the camera pushes in through the build-up and pulses on every step
      const z = calm ? 1 : 1 + crack * .14 + S.pulse * S.pulse * .08;
      g.save(); g.translate(bx, by); g.scale(z, z); g.translate(-bx, -by);
      this.drawBox(bg, BS, T.c, res.t || 'neon', crack, col, lid);
      if (lid > 0) { // a beam of the rarity's color out of the open crate
        g.save(); g.globalCompositeOperation = 'lighter'; const bw = BS * (.25 + lid * .35), gr = g.createLinearGradient(0, by - H * dpr, 0, by); gr.addColorStop(0, hexA(col, 0)); gr.addColorStop(1, hexA(col, .7 * Math.min(1, lid * 2)));
        g.fillStyle = gr; g.fillRect(bx - bw / 2, 0, bw, by); g.fillStyle = hexA('#ffffff', .5 * Math.min(1, lid * 2)); g.fillRect(bx - bw * .12, 0, bw * .24, by); g.restore(); }
      g.drawImage(box, bx - BS / 2 + (Math.random() - .5) * sh, by - BS / 2 + y + (Math.random() - .5) * sh);
      g.restore();
      if (land >= 1 && t < .5) { g.strokeStyle = hexA(T.c, 1 - (t - .35) / .15); g.lineWidth = 4 * dpr; g.beginPath(); g.ellipse(bx, by + BS * .42, BS * .5 * (1 + (t - .35) * 4), BS * .12 * (1 + (t - .35) * 4), 0, 0, TAU); g.stroke(); }
      for (let i = S.rings.length - 1; i >= 0; i--) { const q = S.rings[i]; q.t += dt; if (q.t > .7) { S.rings.splice(i, 1); continue; } const rr = BS * (.3 + q.t * (q.big ? 2.2 : 1.4)); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = hexA(q.c, 1 - q.t / .7); g.lineWidth = (q.big ? 10 : 5) * dpr; g.shadowColor = q.c; g.shadowBlur = 20 * dpr; g.beginPath(); g.arc(bx, by, rr, 0, TAU); g.stroke(); g.restore(); }
      g.fillStyle = 'rgba(160,170,200,.5)'; for (let i = S.dust.length - 1; i >= 0; i--) { const d = S.dust[i]; d.l -= dt; if (d.l <= 0) { S.dust.splice(i, 1); continue; } d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= .96; d.vy *= .96; g.globalAlpha = Math.min(1, d.l); g.beginPath(); g.arc(d.x, d.y, (3 + (1 - d.l) * 8) * dpr, 0, TAU); g.fill(); } g.globalAlpha = 1;
      if (S.flash > 0) { g.fillStyle = hexA(S.fc || '#ffffff', Math.min(1, S.flash)); g.fillRect(0, 0, cv.width, cv.height); S.flash = Math.max(0, S.flash - dt * 2.4); }
      if (!calm) { try { CineFX.vignette(g, cv.width, cv.height); CineFX.grain(g, cv.width, cv.height); g.save(); g.scale(dpr, dpr); CineFX.bars(g, W, H, t, dur + 9, T.c, label); g.restore(); } catch (e) { errLog(e); } }
      if (lid > 0) { g.fillStyle = hexA('#ffffff', Math.min(1, Math.max(0, lid - .3) * 1.8)); g.fillRect(0, 0, cv.width, cv.height); }
      if (t >= dur) { try { Aud.sfx('boom'); } catch (e) { } return finish(); } requestAnimationFrame(step); };
    try { Aud.sfx('coin'); } catch (e) { } requestAnimationFrame(step);
  };
}
/* ---------- THE 3D HERO, ALIVE WHEN IDLE ---------- */
const Idle3D = {
  ACTS: { twirl: 1.1, look: 2.2, stretch: 1.6, stance: 1.8, kata: 1.9, sheath: 1.4 },
  ez(u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; },
  pick(g, show) { const L = show ? ['twirl', 'kata', 'look', 'stance', 'stretch', 'twirl', 'kata', 'sheath'] : ['twirl', 'look', 'stretch', 'stance', 'look', 'sheath']; let k; do k = L[Math.floor(Math.random() * L.length)]; while (k === g.idleLast && L.length > 1); g.idleLast = k; return k; },
  reset(g) { g.idleT = 0; g.idleAct = null; g.idleNext = 2.5 + Math.random() * 2; if (g.head) g.head.rotation.set(0, 0, 0); if (g.blade) g.blade.rotation.set(0, 0, 0); if (g.hips) g.hips.position.y = 0; if (g.torso) { g.torso.rotation.z = 0; g.torso.position.y = 0; } if (g.arms) { g.arms[0].rotation.x = 0; g.arms[1].rotation.x = 0; } },
  /* g: a hero model after animHero; still: whether the hero stands idle; show: the home screen / forge (bigger moves)
     (the sword arm points to the side, so its rotation.x raises and lowers the blade and rotation.z swings it front to back) */
  apply(g, o, rd, t, still, show) {
    if (!g || !g.head || !g.arms) return;
    if (!still) { if (g.idleT) this.reset(g); return; }
    if (g.idleT == null) this.reset(g); g.idleT += rd; const it = g.idleT, w = Math.min(1, it / .6); // (eases in, so a short stop does not snap)
    const A0 = g.arms[0], A1 = g.arms[1], br = Math.sin(t * 2.6), sw = Math.sin(t * .9);
    // the base: a relaxed low guard (blade angled to the ground, a little forward), the free arm down, breath, weight from foot to foot, the head looking around
    let rx = (-.75 + br * .04) * w, rz = -.45 * w, ly = (.95 + br * .05) * w;
    g.hips.position.y = sw * .7 * w; g.torso.position.y = g.hips.position.y; g.torso.rotation.x = (g.lean || 0) + sw * .04 * w; // (absolute: the home-screen model has no lean of its own to reset it)
    for (const [hip, knee, s] of g.legs) { const b = Math.max(0, sw * s) * .18 * w; hip.rotation.y += -b; knee.rotation.y += b * 1.6; }
    g.head.rotation.z = (Math.sin(t * .55) * .35 + Math.sin(t * 1.7) * .08) * w; g.head.rotation.y = Math.sin(t * .8) * .06 * w; g.blade.rotation.set(0, 0, 0); g.torso.rotation.z = 0;
    // an action every few seconds
    g.idleNext -= rd; if (!g.idleAct && g.idleNext <= 0 && it > 1) { const k = this.pick(g, show); g.idleAct = { k, t: 0, d: this.ACTS[k] }; }
    const A = g.idleAct;
    if (A) { A.t += rd; const u = clamp(A.t / A.d, 0, 1), env = Math.sin(u * Math.PI), hold = Math.min(1, u * 4) * Math.min(1, (1 - u) * 4);
      if (A.k === 'twirl') { g.blade.rotation.z = this.ez(u) * TAU * 2; rx += .7 * env; rz += .5 * env; } // the blade spins twice in the hand
      else if (A.k === 'look') { const sd = u < .5 ? 1 : -1, e = Math.sin(Math.min(1, (u < .5 ? u : u - .5) * 2) * Math.PI); g.head.rotation.z += sd * .85 * e; g.torso.rotation.z = sd * .25 * e; }
      else if (A.k === 'stretch') { rx += 2.1 * env; ly -= 2.4 * env; g.torso.rotation.y -= .15 * env; g.head.rotation.y -= .3 * env; g.hips.position.z += .8 * env; g.torso.position.z = g.hips.position.z; }
      else if (A.k === 'stance') { g.hips.position.z -= 2.4 * hold; g.torso.position.z = g.hips.position.z; for (const [hip, knee] of g.legs) { hip.rotation.y -= .55 * hold; knee.rotation.y += 1 * hold; }
        g.torso.rotation.y += .25 * hold; rz -= 1.15 * hold; rx += 1.05 * hold; ly -= .5 * hold; g.head.rotation.z *= 1 - hold; } // a high guard, blade forward
      else if (A.k === 'sheath') { rz += 1.2 * hold; rx += .5 * hold; g.blade.rotation.y = .6 * hold; g.torso.rotation.z = -.2 * hold; } // the blade laid back along the arm
      else if (A.k === 'kata') { // three cuts: right to left, left to right, then down from overhead
        const seg = Math.min(2, Math.floor(u * 3)), v = this.ez(Math.min(1, u * 3 - seg));
        if (seg < 2) { const dir = seg === 0 ? 1 : -1; rz += dir * (1.3 - v * 2.6) - .5; rx += .75 + .2 * Math.sin(v * Math.PI); g.torso.rotation.z = dir * (.4 - v * .8); }
        else { rz -= .9; rx += 2.4 - v * 2.6; g.torso.rotation.y += v * .3; }
        g.hips.position.z -= .8 * env; g.torso.position.z = g.hips.position.z; ly -= .3 * env;
        if (g.kSeg !== seg) { g.kSeg = seg; g.kFlash = .18; } }
      if (u >= 1) { g.idleAct = null; g.kSeg = -1; g.idleNext = (show ? 2.2 : 3.5) + Math.random() * (show ? 2 : 4); } }
    A1.rotation.x = rx; A1.rotation.z += rz; A0.rotation.y += ly;
  }
};
{
  // in a run: the player's own ninja, when it stands still and nothing is aimed
  const ah5 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) {
    ah5(g, o, rd, t);
    try { const h = this.ents.get('hero'); if (!h || h.g !== g || CALM) return;
      const bl = o.blade == null ? 0 : o.blade, moved = g.iPb != null && (Math.abs(angDiff(bl, g.iPb)) > .12 || Math.abs(angDiff(o.face || 0, g.iPf || 0)) > .12); // (a real aim or turn, not the blade's own sway) g.iPb = bl; g.iPf = o.face || 0;
      const still = (o.spd || 0) < 25 && !o.dashing && !moved && G.state === 'PLAY' && !In.on;
      Idle3D.apply(g, o, rd, t, still, false);
    } catch (e) { errLog(e); }
  };
  // the home screen and the Hero Forge: the same life, bigger moves (the tap slash still wins)
  Mini.frame = function (rd) {
    this.build(); const r = this.cv.getBoundingClientRect(), W = Math.max(2, Math.round(r.width)), H = Math.max(2, Math.round(r.height));
    if (this.W !== W || this.H !== H || this.camH !== this.host) { this.W = W; this.H = H; this.camH = this.host; const fz = this.host === 'forge'; this.cam.position.set(0, fz ? 1.1 : 1.0, fz ? 6.4 : 4.4); this.cam.lookAt(0, fz ? .78 : .82, 0); this.rn.setSize(W, H, false); this.cam.aspect = W / H; this.cam.updateProjectionMatrix(); }
    const t = this.t, sl = this.slashT > 0; this.slashT = Math.max(0, this.slashT - rd);
    const face = Math.PI / 2 + Math.sin(t * .3) * .45 + (sl ? Math.sin((.5 - this.slashT) * 12) * .3 : 0);
    const blade = sl ? face - 1.2 + (.5 - this.slashT) / .5 * 3.4 : face + 1.8;
    R3.animHero(this.g, { x: 0, y: 0, face, spd: 0, ph: t * 8, dashing: sl, blade, bl: 52, alpha: 1 }, rd, t); this.g.position.set(0, 0, 0);
    Idle3D.apply(this.g, null, rd, t, !sl && !CALM, true); const s0 = this.g.s0 || 1.45; this.g.scale.set(s0, s0, s0 * (1 + Math.sin(t * 2.6) * .015));
    const kf = this.g.kFlash > 0 ? (this.g.kFlash -= rd, Math.max(0, this.g.kFlash) / .18) : 0;
    this.disc.scale.setScalar(1 + Math.sin(t * 2) * .05 + kf * .25); this.disc.material.opacity = .35 + (sl ? .4 : 0) + kf * .4; this.fill.intensity = 6 + kf * 10 + (sl ? 6 : 0);
    this.rn.render(this.scene, this.cam);
  };
}
