/* =====================================================================
   VERSION 53: THE SEALS — a crate opening you want to watch
   Every crate lands the same: steel, bound by four glowing seals, no
   color that gives it away. Your hero strikes. A common crate opens at
   the first strike. Anything better holds, and a seal breaks instead,
   and how it breaks is the hint:
     1st seal (RARE or better): blue sparks, the crate jolts
     2nd seal (EPIC or better): the lights die, purple lightning, the
       crate lifts off the floor
     3rd seal (LEGENDARY or better): the roof cracks open in gold light,
       slow motion, the hero's aura flares
     4th seal (MYTHIC): silence and darkness, a heartbeat, a red moon
   After every broken seal there is a beat of quiet (is that it?), then
   the crate starts to shake again. When it finally gives, the last cut
   (a giant powered-up cut for legendary and mythic) bursts it open in the
   rarity's color. Tap to skip, as before. Display only.
   ===================================================================== */
const Seals = {
  TELL: ['#e8f0ff', '#00b4ff', '#c45bff', '#ffb000', '#ff2b5e'],
  plan(r) { const L = [{ k: 'drop', d: 1.1 }]; for (let i = 1; i <= r; i++) { L.push({ k: 'strike', i, d: .62 }); L.push({ k: 'break', i, d: [0, 1.05, 1.35, 1.6, 2.1][i] }); L.push({ k: 'beat', i, d: i === 4 ? .35 : .55 }); }
    L.push({ k: 'strike', i: r + 1, fin: true, d: r >= 3 ? 1.25 : .62 }); L.push({ k: 'open', d: 1.7 }); let t = 0; for (const s of L) { s.t0 = t; t += s.d; } return { L, dur: t }; },
  run(res, done) {
    const ov = el('div', 'cr-film'), cv = document.createElement('canvas'); ov.appendChild(cv); const skip = el('button', 'chip cr-skip', lt('SKIP')); ov.appendChild(skip); document.body.appendChild(ov);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d');
    const k = Math.min(W / 400, H / 700), ox = (W - 400 * k) / 2, oy = (H - 700 * k) / 2, r = res.r | 0, R0 = RAR[r], T0 = CRATE_T[res.t || 'neon'] || CRATE_T.neon, calm = !!CALM;
    const box = document.createElement('canvas'), BS = 440; box.width = box.height = BS; const bg = box.getContext('2d');
    const sk = skinLook(Store.data.skin), o = Object.assign({}, HO); heroSetSkin(o, sk); o.w = Store.data.weapon || 'katana'; o.fx = bladeOf(Store.data.blade); o.alpha = 1; o.sx = o.sy = 1; o.hot = 0; o.od = 0; o.bl = 60;
    const P = this.plan(r), S = { t: 0, parts: [], shake: 0, flash: 0, sfx: {}, lvl: 0, col: '#9fb3d9', seals: [0, 0, 0, 0], shards: [], cracks: null, hx: 200, hy: 575, side: 1 };
    const label = lt(T0.n); let last = performance.now(), end = false;
    const finish = () => { if (end) return; end = true; ov.remove(); done(); };
    skip.onclick = e => { e.stopPropagation(); finish(); }; ov.addEventListener('click', () => { if (S.t > .6) finish(); });
    const once = (key, f) => { if (!S.sfx[key]) { S.sfx[key] = 1; try { f(); } catch (e) { } } };
    const CF = CrateFilm, sfx = n => { try { Aud.sfx(n); } catch (e) { } };
    const step = now => {
      if (end) return; let dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; if (!calm) dt = CineFX.time(S, dt); S.t += Math.max(0, dt); /* (a frame stamped before the film began gave a negative step: the film opened on its last scene, the reveal in the rarity's color) */ const t = S.t;
      let st = P.L[P.L.length - 1]; for (const s of P.L) if (t >= s.t0 && t < s.t0 + s.d) { st = s; break; } const u = clamp((t - st.t0) / st.d, 0, 1);
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#04050c'; g.fillRect(0, 0, W, H);
      const sh = S.shake > 0 ? S.shake * 9 * k : 0; S.shake = Math.max(0, S.shake - dt * 2.4); const cam = calm ? { z: 1, rot: 0 } : CineFX.cam(S, dt);
      g.translate(W / 2, H / 2); g.rotate(cam.rot); g.scale(cam.z, cam.z); g.translate(-W / 2 + ox + (Math.random() - .5) * sh, -H / 2 + oy + (Math.random() - .5) * sh); g.scale(k, k);
      withCtx(g, () => { try { this.frame(g, S, st, u, t, dt, o, R0, T0, r, bg, box, BS, once, sfx, CF); } catch (e) { errLog(e); } CF.particles(g, S, dt); });
      if (S.flash > 0) { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = hexA(S.fc || '#ffffff', Math.min(1, S.flash)); g.fillRect(0, 0, W, H); }
      if (!calm) try { CineFX.front(g, W, H, dpr, S, S.col, Math.max(0, S.lvl - 1), P.dur, label); } catch (e) { errLog(e); }
      S.flash = Math.max(0, S.flash - dt * 2.2);
      if (t >= P.dur) return finish(); requestAnimationFrame(step);
    };
    sfx('coin'); requestAnimationFrame(step);
  },
  frame(g, S, st, u, t, dt, o, R0, T0, r, bg, box, BS, once, sfx, CF) {
    const lv = S.lvl, cxp = 200, cyp0 = 330;
    // the world the seals have woken so far
    const sky = g.createLinearGradient(0, 0, 0, 700); sky.addColorStop(0, lv >= 4 ? '#1a0208' : lv >= 2 ? '#0a0618' : '#070a18'); sky.addColorStop(1, '#04050c'); g.fillStyle = sky; g.fillRect(-200, -200, 800, 1100);
    if (lv >= 4) { const m = clamp((t - (S.t4 || t)) / 1.2, 0, 1), gr = g.createRadialGradient(200, 150, 10, 200, 150, 150); gr.addColorStop(0, hexA('#ff2b5e', .9 * m)); gr.addColorStop(.45, hexA('#a0001e', .7 * m)); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 400, 320); g.fillStyle = hexA('#ff5a7a', .85 * m); g.beginPath(); g.arc(200, 150 + (1 - m) * 60, 62, 0, TAU); g.fill(); }
    CF.floor(g, S.col, t);
    if (lv >= 3 && S.cracks) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = hexA('#ffb000', .55 + Math.sin(t * 6) * .2); g.shadowColor = '#ffb000'; g.shadowBlur = 14; g.lineWidth = 3;
      for (const c of S.cracks) { g.beginPath(); g.moveTo(c[0][0], c[0][1]); for (let i = 1; i < c.length; i++) g.lineTo(c[i][0], c[i][1]); g.stroke(); } g.restore(); }
    if (lv >= 2 && Math.random() < .04 + lv * .02) { CF.bolt(g, 60 + Math.random() * 280, -20, cxp + (Math.random() - .5) * 60, cyp0 - 60, lv >= 4 ? '#ff2b5e' : '#c45bff'); }
    // the crate: drops, then trembles more before every strike, floats from the 2nd seal on
    let cy = cyp0, cx = cxp, tilt = 0;
    if (st.k === 'drop') { const e = Math.min(1, u / .45); cy = -200 + (cyp0 + 200) * (1 - Math.pow(1 - e, 3)) * (e < 1 ? 1 : 1); if (u >= .45) once('land', () => { S.shake = .7; sfx('wall'); CF.burst(S, cxp, cyp0 + 95, '#8a93a8', 26, 260, .8, 200); }); }
    if (lv >= 2) cy -= 18 + Math.sin(t * 2.2) * 6;
    const trem = (st.k === 'beat' ? Math.max(0, u - .5) * 2 : st.k === 'strike' ? 1 - u : 0) * (1 + lv * .5); if (trem > 0) { cx += (Math.random() - .5) * 6 * trem; tilt = (Math.random() - .5) * .05 * trem; }
    const crack = Math.min(1, lv / 4 + (st.k === 'open' ? u : 0)), lid = st.k === 'open' ? Math.min(1, u * 2.2) : 0;
    CratePre.drawBox(bg, BS, T0.c, (T0.k === 'lim' ? 'lim' : T0.k === 'basic' ? 'basic' : 'neon'), crack, lv ? S.col : T0.c, lid);
    g.save(); g.translate(cx, cy); g.rotate(tilt); g.drawImage(box, -110, -110, 220, 220); g.restore();
    // the seals: four bands of light around the crate; a broken one splits and falls
    const SEAL = [[-1.05, .9], [1.05, .9], [0, 1.25], [Math.PI / 2, 1.2]];
    for (let i = 0; i < 4; i++) { if (S.seals[i]) continue; const [a, L] = SEAL[i], c = Math.cos(a), s = Math.sin(a), len = 110 * L, pulse = .6 + Math.sin(t * 4 + i) * .25;
      g.save(); g.translate(cx, cy + 6); g.globalCompositeOperation = 'lighter'; g.strokeStyle = hexA('#dfe8ff', pulse); g.shadowColor = '#dfe8ff'; g.shadowBlur = 12; g.lineWidth = 5; g.setLineDash([10, 6]); g.lineDashOffset = -t * 30;
      g.beginPath(); g.moveTo(-c * len, -s * len); g.lineTo(c * len, s * len); g.stroke(); g.setLineDash([]); g.fillStyle = hexA('#ffffff', pulse); g.beginPath(); g.arc(0, 0, 0, 0, TAU); g.fill(); g.restore(); }
    for (let i = S.shards.length - 1; i >= 0; i--) { const q = S.shards[i]; q.l -= dt; if (q.l <= 0) { S.shards.splice(i, 1); continue; } q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; q.a += q.va * dt;
      g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.globalAlpha = Math.min(1, q.l * 2); g.strokeStyle = q.c; g.lineWidth = 5; g.shadowColor = q.c; g.shadowBlur = 10; g.beginPath(); g.moveTo(-q.len / 2, 0); g.lineTo(q.len / 2, 0); g.stroke(); g.restore(); }
    // the hero
    const fin = st.k === 'strike' && st.fin, big = fin && r >= 3;
    let hx = S.hx, hy = S.hy, face = -Math.PI / 2, blade = face + 1.8, dash = false, sc = 2.5;
    if (st.k === 'drop') { hy = 760 - Math.min(1, u * 1.4) * 185; hx = 200; }
    else if (st.k === 'strike') {
      const side = (st.i % 2 ? 1 : -1), x0 = 200 + side * 105, x1 = 200 - side * 105, wind = big ? .55 : .25;
      if (u < wind) { hx = x0; hy = 575; blade = face + 1.8 + u / wind * 1.2; if (big) { CF.aura(g, hx, hy, 40 + u / wind * 60, R0.c, t); if (Math.random() < .5) CF.bolt(g, hx + (Math.random() - .5) * 160, hy - 200, hx, hy, R0.c); S.shake = Math.max(S.shake, .35); sc = 2.5 + u / wind * 1.2; once('pw' + st.i, () => sfx('od')); } }
      else { const v = (u - wind) / (1 - wind), e = v < .5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; dash = v < .7; hx = x0 + (x1 - x0) * e; hy = 575 - Math.sin(e * Math.PI) * 245; face = Math.atan2(-1, -side * .4); blade = face - 1.6 + e * 3.4; sc = big ? 3.7 - v * 1.2 : 2.5;
        if (v > .35 && v < .8) CF.slashArc(g, cx, cy, big ? 150 : 95, -2.7 + side * .3, .5 + side * .3, big ? R0.c : '#ffffff', big ? 16 : 9, 1 - (v - .35) / .45);
        if (v >= .45) once('hit' + st.i, () => { sfx('slash'); S.shake = big ? 1 : .35; CF.burst(S, cx, cy, fin ? R0.c : '#ffffff', fin ? 30 : 14, fin ? 420 : 260, .6); if (big) { S.flash = .5; S.fc = R0.c; } }); }
      if (u >= .99) { S.hx = x1; S.side = -side; }
      if (big) CF.muscles(g, hx, hy, sc * .55, R0.c, face);
    } else { hx = S.hx; hy = 575; if (st.k === 'beat') blade = face + 1.8 + (1 - u) * .4; }
    CF.hero(g, o, hx, hy, face, sc, blade, dash, t);
    // a seal breaks: the hint
    if (st.k === 'break') { const i = st.i, c = this.TELL[i];
      once('br' + i, () => { S.seals[[2, 0, 1, 3][i - 1]] = 1; S.lvl = i; S.col = c; S.flash = .3 + i * .1; S.fc = c;
        const [a, L] = [[-1.05, .9], [1.05, .9], [0, 1.25], [Math.PI / 2, 1.2]][[2, 0, 1, 3][i - 1]]; for (const sd of [-1, 1]) S.shards.push({ x: cx + Math.cos(a) * 50 * sd * L, y: cy + Math.sin(a) * 50 * sd * L, vx: sd * (120 + i * 40), vy: -200 - i * 40, a, va: sd * 6, len: 90 * L, c: '#dfe8ff', l: 1.2 });
        CF.burst(S, cx, cy, c, 24 + i * 14, 300 + i * 80, .9);
        if (i === 1) { sfx('lock'); S.shake = .5; }
        if (i === 2) { sfx('boom'); S.shake = .8; for (let q = 0; q < 3; q++) CF.burst(S, cx + (q - 1) * 60, cy - 120, c, 10, 200, .5); }
        if (i === 3) { sfx('od'); S.shake = 1; S.cracks = this.cracks(cx, cyp0 + 100); }
        if (i === 4) { S.t4 = t + .7; } });
      if (i === 2 && u < .5) for (let q = 0; q < 2; q++) CF.bolt(g, cx + (Math.random() - .5) * 300, -30, cx, cy - 40, c);
      if (i === 3) { CF.aura(g, cx, cy, 90 + u * 40, c, t); g.save(); g.globalCompositeOperation = 'lighter'; for (let q = 0; q < 6; q++) { const a = q / 6 * TAU + t * .3; g.strokeStyle = hexA(c, .25); g.lineWidth = 14; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 400, cy + Math.sin(a) * 400); g.stroke(); } g.restore(); }
      if (i === 4) { // silence and darkness, the heartbeat, then the red moon rises
        if (u < .38) { g.fillStyle = hexA('#000000', .92); g.fillRect(-200, -200, 800, 1100); g.fillStyle = hexA('#ff2b5e', .8); g.beginPath(); g.arc(cx, cy, 6 + Math.sin(t * 20) * 2, 0, TAU); g.fill(); once('hb1', () => sfx('tick')); if (u > .2) once('hb2', () => sfx('tick')); }
        else once('roar', () => { sfx('roar'); S.shake = 1.2; S.flash = .7; S.fc = '#ff2b5e'; CF.burst(S, cx, cy, '#ff2b5e', 60, 520, 1.1); }); }
      const cap = [0, 'IT HOLDS…', 'SOMETHING STIRS', 'THE SEALS ARE BREAKING', '…'][i]; this.caption(g, lt(cap), c, u);
    }
    if (st.k === 'open') { once('open', () => { sfx('boom'); sfx('star'); S.flash = 1; S.fc = R0.c; S.col = R0.c; S.lvl = Math.max(S.lvl, r); CF.burst(S, cx, cy, R0.c, 70 + r * 20, 520, 1.2); CF.burst(S, cx, cy, '#ffffff', 30, 300, .8); });
      g.save(); g.globalCompositeOperation = 'lighter'; const bw = 80 + u * 140, gr = g.createLinearGradient(0, -100, 0, cy); gr.addColorStop(0, hexA(R0.c, 0)); gr.addColorStop(1, hexA(R0.c, .75)); g.fillStyle = gr; g.fillRect(cx - bw / 2, -100, bw, cy + 100); g.restore();
      CF.title(g, lt(R0.n), R0.c, u * 1.7 - .05, 140); if (r >= 3) for (let q = 0; q < 2; q++) if (Math.random() < .3) CF.burst(S, 60 + Math.random() * 280, 120, R0.c, 3, 120, .8, 300); }
  },
  cracks(x, y) { const out = []; for (let i = 0; i < 9; i++) { let a = Math.PI * .1 + i / 8 * Math.PI * .8 + (Math.random() - .5) * .2, px = x, py = y; const c = [[px, py]]; for (let j = 0; j < 6; j++) { a += (Math.random() - .5) * .6; px += Math.cos(a) * 34; py += Math.sin(a) * 22 + 4; c.push([px, py]); } out.push(c); } return out; },
  caption(g, txt, c, u) { if (!txt || u < .25) return; const a = Math.min(1, (u - .25) * 4) * Math.min(1, (1 - u) * 4); g.save(); g.globalAlpha = a; g.font = 'italic 700 20px ' + FONT_D; g.textAlign = 'center'; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 16; g.fillText(txt, 200, 660); g.restore(); }
};
{ CrateFilm.run = function (res, done) { Seals.run(res, done); }; }
