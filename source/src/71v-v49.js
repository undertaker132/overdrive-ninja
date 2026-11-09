/* =====================================================================
   VERSION 49: THE CINEMATIC UPDATE
   Gameplay (a new rule, so it only applies to runs played or recorded
   with version 49 or newer: older replays stay exact):
   · EXECUTION (after Doom's glory kills and Sekiro's deathblows): a
     wounded elite, mini-boss or champion below 30% health is marked
     EXECUTE!; dash through it to finish it at once. An execution refills
     your dash charges, gives Overdrive, a moment of safety and a big
     score bonus.
   Presentation (render only):
   · OVERDRIVE CUT-IN (after Zenless Zone Zero and Persona): a slanted
     band crosses the screen with your hero, speed lines and the word.
   · BOSS CAMERA in 3D: the camera circles a boss as it arrives, and pushes
     in on it as it dies.
   · KILLCAM: letterbox bars in the boss's color while the camera pushes in.
   · A LIVING HERO: your hero stands in 3D on the home screen and in the
     Hero Forge, breathes, twirls its blade and slashes when you tap it.
   · YOUR BUILD in the pause menu, and a neon wipe between menu screens.
   ===================================================================== */
ACHS.push({ id: 'exec1', name: 'NO MERCY', d: 'Execute a wounded elite', r: 100 }, { id: 'exec25', name: 'EXECUTIONER', d: 'Execute 25 elites in total', r: 500 });
{ // EXECUTION
  const se0 = spawnEnemy; spawnEnemy = function () { const e = se0.apply(this, arguments); if (e) e.exec = 0; return e; };
  const he0 = hitEnemy;
  hitEnemy = function (e) {
    if (simV(49) && e && e.alive && e.exec && !(e.al > 0) && e.hid !== P.seq && !(e.type === ET.COURIER && e.stT > 0) && !(G.stage && G.stage.mod && G.stage.mod.reflectOnly && G.mode === 'story')) {
      e.hid = P.seq; const a = Math.atan2(P.vy, P.vx) || P.ang; e.exec = 0; e.bub = 0; damageEnemy(e, e.hp + 1e6, a, 0);
      addOD(20); P.ch = P.maxCh; P.inv = Math.max(P.inv, .5); G.score += Math.round(800 * G.diff.score * G.scoreMul); G.hs = Math.max(G.hs, .14); G.execN = (G.execN | 0) + 1;
      shake(.6); flash(.35, '#ff2a4a'); FX.call(lt('EXECUTION'), '#ff2a4a', 1.4, 30); FX.ring(e.x, e.y, 150, '#ff2a4a', 6); FX.ring(e.x, e.y, 80, '#ffffff', 4); FX.spark(e.x, e.y, '#ffffff', 22);
      Aud.sfx('zan'); vibe('od'); if (typeof Leg !== 'undefined') Leg.onExec(e);
      if (!REPLAY.on) { const d = Store.data; d.execT = (d.execT | 0) + 1; ach('exec1'); if (d.execT >= 25) ach('exec25'); }
      return;
    }
    he0(e);
    if (simV(49) && e && e.alive && !e.exec && (e.elite || e.mb) && e.type !== ET.COURIER && e.type !== ET.TREASURE && e.mhp > 1.5 && e.hp > 0 && e.hp <= e.mhp * (typeof Leg !== 'undefined' ? Leg.execT() : .3)) {
      e.exec = 1; FX.text(e.x, e.y - e.r - 18, lt('EXECUTE!'), '#ff2a4a', 15, true); Aud.sfx('lock');
      hint('exec', lt('A wounded elite can be EXECUTED: dash through it to finish it at once.'));
    }
  };
  // the mark: a red diamond above the enemy (2D layer), a red pulse on the 3D model
  const de1 = drawEnemy;
  drawEnemy = function (e) { de1(e); if (!e.exec || !e.alive) return; const p = .6 + Math.sin(CAM.t * 14) * .4, y = e.y - e.r * (e.scale || 1) - 36;
    cx.save(); cx.globalAlpha = .9; cx.fillStyle = '#ff2a4a'; cx.shadowColor = '#ff2a4a'; cx.shadowBlur = 12 * p; cx.beginPath(); cx.moveTo(e.x, y - 9); cx.lineTo(e.x + 7, y); cx.lineTo(e.x, y + 9); cx.lineTo(e.x - 7, y); cx.closePath(); cx.fill();
    cx.strokeStyle = '#ff2a4a'; cx.lineWidth = 2; cx.globalAlpha = .5 * p; cx.beginPath(); cx.arc(e.x, e.y, e.r + 10 + p * 4, 0, TAU); cx.stroke(); cx.restore(); };
  Pipe.on('post', 'exec49', () => { if (!W3D.live || G.state === 'MENU') return; const k = V.s * V.dpr; let any = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || !e.exec) continue; if (!any) { any = 1; cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); }
      const q = W3D.proj(e.x, e.y, e.r * 2.2 + 16), p = .6 + Math.sin(CAM.t * 14) * .4, x = q[0], y = q[1], r = 8 * k;
      cx.globalAlpha = .95; cx.fillStyle = '#ff2a4a'; cx.shadowColor = '#ff2a4a'; cx.shadowBlur = 12 * p * k; cx.beginPath(); cx.moveTo(x, y - r * 1.2); cx.lineTo(x + r, y); cx.lineTo(x, y + r * 1.2); cx.lineTo(x - r, y); cx.closePath(); cx.fill();
      cx.shadowBlur = 0; cx.fillStyle = '#fff'; cx.globalAlpha = p; cx.beginPath(); cx.arc(x, y, r * .3, 0, TAU); cx.fill(); }
    if (any) cx.restore(); }, 99);
  const ae2 = R3.animEnemy.bind(R3); R3.animEnemy = function (g, e, t) { ae2(g, e, t); if (e.exec && g.bodyMat && g.bodyMat.emissive && !(e.fl > .3)) { g.bodyMat.emissive.set('#ff2a4a'); g.bodyMat.emissiveIntensity = .6 + Math.sin(t * 14) * .5; } };
}
/* ---------- OVERDRIVE CUT-IN ---------- */
const ODCut = {
  was: false,
  tick() { const on = G.odT > 0 && G.state === 'PLAY'; if (on && !this.was && !(REPLAY.on && REPLAY.fast) && !CALM) this.play(); this.was = on; },
  play() {
    const ov = el('div', 'odcut'), band = el('div', 'odc-band'), ca = P.ca || '#00f2fe', cb = P.cb || '#ff0844';
    band.style.setProperty('--ca', ca); band.style.setProperty('--cb', cb);
    const cv = document.createElement('canvas'); cv.width = cv.height = 220; cv.className = 'odc-face';
    try { if (!G.hero) drawIcon(cv.getContext('2d'), { tab: 'heroes', id: Store.data.skin }, 220); else { const g = cv.getContext('2d'); const o = Object.assign({}, HO); heroSetSkin(o, P.skin); o.w = P.w.id; o.fx = null; o.alpha = 1; o.sx = o.sy = 1; o.hot = 0; o.od = 1; o.bl = 48; o.face = o.mvA = -Math.PI / 2; o.blade = -Math.PI / 2 + 1.8; o.spd = 0; o.ph = 0; o.dashing = false; o.t = 1; o.x = 0; o.y = 0; g.fillStyle = '#070a18'; g.fillRect(0, 0, 220, 220); g.save(); g.translate(110, 120); g.scale(3.2, 3.2); withCtx(g, () => drawHero(o)); g.restore(); } } catch (e) { errLog(e); }
    band.appendChild(cv); const tx = el('div', 'odc-tx'); tx.appendChild(el('b', '', lt('OVERDRIVE'))); tx.appendChild(el('span', '', (P.skin && P.skin.name ? lt(P.skin.name) : '') + ' · ' + (P.w && P.w.name ? lt(P.w.name) : ''))); band.appendChild(tx);
    ov.appendChild(band); document.body.appendChild(ov); setTimeout(() => ov.remove(), 1000);
  }
};
/* ---------- BOSS CAMERA + KILLCAM ---------- */
{
  const cam0 = W3D.camera.bind(W3D);
  W3D.camera = function () {
    cam0();
    try { if (CALM || !this.live) return; const c = G.cine, B = Boss.cur, C = GL3D.cam; let k = 0, yaw = 0, z = 0;
      // (on top of the existing tilt of the entrance and the kill-cam: a wider orbit, a push-in and the boss in the middle)
      if (c && c.k === 'boss' && B && c.d > 0) { const u = clamp(c.t / c.d, 0, 1), s = Math.sin(u * Math.PI); yaw = Math.sin(u * Math.PI * 1.3) * .55 * s; z = .3 * s; k = s; }
      else if (B && B.dying > 0) { const u = clamp((2.2 - B.dying) / 2.2, 0, 1), s = Math.sin(Math.min(1, u * 1.6) * Math.PI * .5) * (1 - u * u); z = .5 * s; k = s; } // (dying counts down from 2.2: push in fast, ease out as it ends)
      if (k > .001) { GL3D.setView(GL3D.th, GL3D.yaw + yaw); C.z *= 1 + z; C.x += (B.x - C.x) * .6 * k; C.y += (B.y - C.y) * .6 * k; C.offY = this.offY(); }
    } catch (e) { errLog(e); }
  };
}
const KillCam = {
  seen: null,
  tick() { const B = Boss.cur; if (!B || !(B.dying > 0) || this.seen === B || G.state !== 'PLAY' || (REPLAY.on && REPLAY.fast)) return; this.seen = B; if (!CALM) this.play(B); },
  play(B) { const info = BOSS_INFO[B.id] || {}, ov = el('div', 'killcam'); ov.style.setProperty('--bc', info.col || '#ff0844'); // (letterbox bars and a color edge; the game's own banner names the boss)
    ov.appendChild(el('i', 'kc-top')); ov.appendChild(el('i', 'kc-bot')); document.body.appendChild(ov); setTimeout(() => ov.remove(), 2200); }
};
/* ---------- A LIVING HERO (3D) ---------- */
const Mini = {
  rn: null, cv: null, g: null, sig: '', t: 0, host: '', raf: 0, slashT: 0, last: 0,
  ok() { try { return typeof THREE !== 'undefined' && !Mini.dead && W3D.want() && R3.want() && !(typeof Power !== 'undefined' && Power.on()); } catch (e) { return false; } },
  init() {
    if (this.rn) return true; if (!this.ok()) return false;
    try { const T = THREE, cv = document.createElement('canvas'); cv.className = 'mini3d'; cv.setAttribute('aria-hidden', 'true'); this.cv = cv;
      const rn = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); rn.outputColorSpace = T.SRGBColorSpace; rn.toneMapping = T.ACESFilmicToneMapping; rn.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); this.rn = rn;
      const sc = new T.Scene(); this.scene = sc; sc.add(new T.HemisphereLight(0x9fb0ff, 0x201030, 1.5));
      const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(2, 4, 3); sc.add(key); const rim = new T.DirectionalLight(0xff4fd8, 1.8); rim.position.set(-3, 2, -3); sc.add(rim);
      this.fill = new T.PointLight(0x00f2fe, 6, 6, 1.5); this.fill.position.set(0, 1.1, 1.4); sc.add(this.fill);
      if (!R3.M.armor) R3.mats();
      const root = new T.Group(); root.rotation.x = -Math.PI / 2; const inner = new T.Group(); inner.scale.set(1 / 30, -1 / 30, 1 / 30); root.add(inner); sc.add(root); this.inner = inner;
      const disc = new T.Mesh(new T.RingGeometry(.55, .75, 48), new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: .45, side: T.DoubleSide })); disc.rotation.x = -Math.PI / 2; disc.position.y = .01; sc.add(disc); this.disc = disc;
      this.cam = new T.PerspectiveCamera(32, 1, .1, 50); this.cam.position.set(0, 1.0, 4.4); this.cam.lookAt(0, .82, 0);
      cv.addEventListener('pointerdown', e => { e.stopPropagation(); this.slashT = .5; try { Aud.sfx('slash'); vibe('tap'); } catch (er) { } });
      return true; } catch (e) { errLog(e); this.dead = 1; this.rn = null; return false; }
  },
  look() { // what to show: the forge hero in the forge, the equipped hero elsewhere
    const d = Store.data;
    if (this.host === 'forge') { const f = Hero.f(); return { body: f.body, a: f.a, b: f.b, w: HRANGE[f.w.range] }; }
    const s = skinLook(d.skin); return { body: s.body || 'ninja', a: s.a, b: s.b, w: d.weapon || 'katana' };
  },
  build() { const L = this.look(), sig = L.body + L.a + L.b + L.w; if (sig === this.sig && this.g) return; this.sig = sig;
    if (this.g) { this.inner.remove(this.g); this.g.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); }
    const g = R3.hero(L.a, L.b); R3.weapon(g, L.w); R3.dress(g, L.body, L.a, L.b); if (g.pool) g.pool.visible = false; this.g = g; this.inner.add(g); this.disc.material.color.set(L.a); this.fill.color.set(L.a); },
  mount(host, el0) { if (!this.init()) return false; this.host = host; this.el0 = el0; const p = el0.parentElement; if (this.cv.parentElement !== p || this.cv.previousElementSibling !== el0) el0.after(this.cv); el0.classList.add('mini-hidden'); this.cv.dataset.host = host; this.loop(); return true; },
  unmount(c) { if (c) c.classList.remove('mini-hidden'); if (this.cv && this.cv.previousElementSibling === c) this.cv.remove(); },
  loop() { if (this.raf) return; const f = now => { const vis = (this.host === 'title' && UI.cur === 'title') || (this.host === 'forge' && UI.cur === 'forge'); if (!vis || !this.cv.isConnected) { this.raf = 0; return; }
      this.raf = requestAnimationFrame(f); if (now - this.last < 33) return; const rd = Math.min(.05, (now - (this.last || now)) / 1000); this.last = now; this.t += rd; try { this.frame(rd); } catch (e) { errLog(e); this.dead = 1; this.raf = 0; } };
    this.raf = requestAnimationFrame(f); },
  frame(rd) {
    this.build(); const r = this.cv.getBoundingClientRect(), W = Math.max(2, Math.round(r.width)), H = Math.max(2, Math.round(r.height));
    if (this.W !== W || this.H !== H || this.camH !== this.host) { this.W = W; this.H = H; this.camH = this.host; const fz = this.host === 'forge'; this.cam.position.set(0, fz ? 1.05 : 1.0, fz ? 5.1 : 4.4); this.cam.lookAt(0, fz ? .8 : .82, 0); this.rn.setSize(W, H, false); this.cam.aspect = W / H; this.cam.updateProjectionMatrix(); }
    const t = this.t, sl = this.slashT > 0; this.slashT = Math.max(0, this.slashT - rd); const flo = (t % 6) > 5.2;
    const face = Math.PI / 2 + Math.sin(t * .45) * .7 + (sl ? Math.sin((.5 - this.slashT) * 12) * .3 : 0);
    const blade = sl ? face - 1.2 + (.5 - this.slashT) / .5 * 3.4 : flo ? face + 1.8 + ((t % 6) - 5.2) / .8 * TAU : face + 1.8 + Math.sin(t * 2) * .15;
    R3.animHero(this.g, { x: 0, y: 0, face, spd: 0, ph: t * 8, dashing: sl, blade, bl: 52, alpha: 1 }, rd, t); this.g.position.set(0, 0, 0);
    this.disc.scale.setScalar(1 + Math.sin(t * 2) * .05); this.disc.material.opacity = .35 + (sl ? .4 : 0);
    this.rn.render(this.scene, this.cam);
  }
};
{
  // the home screen: the hero strip gets the 3D hero
  const ot6 = UI.openTitle.bind(UI); UI.openTitle = function () { const r = ot6.apply(this, arguments); try { const c = $('thCv'); if (c && !(Mini.ok() && Mini.mount('title', c))) Mini.unmount(c); } catch (e) { errLog(e); } return r; };
  // the Hero Forge: the 3D hero over the stage (the 2D drawing keeps only the floor)
  const hs0 = Hero.screen.bind(Hero); Hero.screen = function () { hs0(); try { const c = $('hfCv'); if (c && Mini.ok() && Mini.mount('forge', c)) { c.classList.remove('mini-hidden'); c.classList.add('mini-under'); } } catch (e) { errLog(e); } };
  const hr0 = Hero.render.bind(Hero); Hero.render = function () { hr0(); try { const c = $('hfCv'); if (c && Mini.ok() && Mini.mount('forge', c)) { c.classList.remove('mini-hidden'); c.classList.add('mini-under'); Mini.sig = ''; } } catch (e) { errLog(e); } };
  const dp0 = Hero.drawPrev.bind(Hero); Hero.drawPrev = function () { const hc = $('hfCv'); if (!(Mini.rn && Mini.ok() && Mini.host === 'forge' && hc && Mini.cv.previousElementSibling === hc)) return dp0(); const cv = $('hfCv'); if (!cv) return; const g = cv.getContext('2d'), S = cv.width, C = this.cls();
    g.setTransform(1, 0, 0, 1, 0, 0); const bg = g.createLinearGradient(0, 0, 0, cv.height); bg.addColorStop(0, '#0a0e26'); bg.addColorStop(1, '#05060f'); g.fillStyle = bg; g.fillRect(0, 0, S, cv.height);
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(S / 2, cv.height * .7, 10, S / 2, cv.height * .7, S * .45); gr.addColorStop(0, hexA(C.c, .35)); gr.addColorStop(1, hexA(C.c, 0)); g.fillStyle = gr; g.fillRect(0, 0, S, cv.height); g.restore(); };
  // presentation ticks
  Pipe.on('post', 'cine49', () => { try { ODCut.tick(); KillCam.tick(); } catch (e) { errLog(e); } }, 98);
  // the pause menu shows your build
  const sh9 = UI.show.bind(UI);
  UI.show = function (id) {
    const prev = this.cur; sh9(id);
    try { if (id === 'pause') setTimeout(() => { const box = $('psInfo'), old = $('psBuild'); if (old) old.remove(); if (!box) return; // (the perk line becomes chips: name, level, and the description on a long press)
        const ks = Object.keys(P.perks || {}).filter(k => P.perks[k] > 0); if (!ks.length && !G.hero) return;
        const b = el('div', 'ps-build'); b.id = 'psBuild'; b.appendChild(el('div', 'eyebrow', lt('YOUR BUILD')));
        if (G.hero) b.appendChild(el('span', 'chip gold', lt(Hero.cls().n) + ' · ' + ltf('LV {0}', Hero.lvl())));
        for (const k of ks) { const pk = PERKS.find(q => q.id === k) || (typeof SYNERGIES !== 'undefined' && SYNERGIES.find(q => q.id === k)) || RELIC_BY_ID[k] || (typeof LEG_BY !== 'undefined' && LEG_BY[k]), c = el('span', 'chip' + (PERKS.some(q => q.id === k) ? '' : ' syn'), (pk ? lt(pk.name) : k) + (P.perks[k] > 1 ? ' ×' + P.perks[k] : '')); if (pk && pk.desc) c.title = lt(pk.desc); b.appendChild(c); }
        const pre = lt('PERKS') + ': '; for (const d of box.querySelectorAll('.mute')) if (d.textContent.indexOf(pre) === 0) d.remove();
        box.after(b); }, 0);
      // a neon wipe between menu screens
      if (id && prev && id !== prev && G.state === 'MENU' && !CALM && id !== 'boot') { const w = el('div', 'wipe49'); document.body.appendChild(w); setTimeout(() => w.remove(), 450); }
    } catch (e) { errLog(e); }
  };
  const css = document.createElement('style'); css.id = 'v49css';
  css.textContent = `
.odcut { position: fixed; inset: 0; z-index: 9; pointer-events: none; overflow: hidden; }
.odc-band { --ca: #00f2fe; --cb: #ff0844; position: absolute; left: -10%; right: -10%; top: 38%; height: min(22%, 40vw); transform: skewY(-9deg); display: flex; align-items: center; gap: 14px; padding: 0 calc(10% + 12px);
  background: repeating-linear-gradient(100deg, rgba(255,255,255,.22) 0 2px, transparent 2px 26px), linear-gradient(90deg, var(--cb), var(--ca)); box-shadow: 0 0 0 4px #fff, 0 0 60px var(--ca); animation: odcIn 1s cubic-bezier(.2,.9,.3,1) both; }
.odc-face { height: min(92%, 34vw); width: auto; aspect-ratio: 1; flex: none; transform: skewY(9deg); border: 4px solid #fff; background: #070a18; box-shadow: 0 0 30px rgba(0,0,0,.6); animation: odcFace 1s ease-out both; }
.odc-tx { display: flex; flex-direction: column; transform: skewY(9deg); color: #fff; text-shadow: 0 3px 0 rgba(0,0,0,.5); } .odc-tx { min-width: 0; } .odc-tx b { font: italic 700 clamp(26px, 8vw, 60px)/1 var(--fd); letter-spacing: 2px; } .odc-tx span { font: 700 12px var(--fm); letter-spacing: 1.5px; opacity: .9; }
@keyframes odcIn { 0% { transform: translateX(110%) skewY(-9deg); } 18% { transform: translateX(0) skewY(-9deg); } 78% { transform: translateX(-3%) skewY(-9deg); opacity: 1; } 100% { transform: translateX(-120%) skewY(-9deg); opacity: .6; } }
@keyframes odcFace { 0% { filter: brightness(3); } 30% { filter: brightness(1); } }
.killcam { --bc: #ff0844; position: fixed; inset: 0; z-index: 9; pointer-events: none; }
.killcam i { position: absolute; left: 0; right: 0; height: 11vh; background: #000; animation: kcBar 2.2s ease-in-out both; } .kc-top { top: 0; transform-origin: top; border-bottom: 2px solid var(--bc); } .kc-bot { bottom: 0; transform-origin: bottom; border-top: 2px solid var(--bc); }
@keyframes kcBar { 0% { transform: scaleY(0); } 15%, 80% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
.mini-hidden { visibility: hidden !important; position: absolute !important; } canvas.mini3d { display: block; width: 120px; height: 120px; cursor: pointer; touch-action: manipulation; }
.hero-strip canvas.mini3d { width: 120px; height: 120px; border-radius: 4px; background: radial-gradient(circle at 50% 70%, rgba(0,242,254,.18), transparent 70%); }
.hf-prev { position: relative; } .hf-prev canvas.mini-under { position: relative; } .hf-prev canvas.mini3d { position: absolute; inset: 0; width: 100%; height: 100%; }
.ps-build { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; } .ps-build .eyebrow { width: 100%; }
.wipe49 { position: fixed; inset: 0; z-index: 30; pointer-events: none; background: linear-gradient(100deg, transparent 0 40%, rgba(0,242,254,.55) 46%, #fff 50%, rgba(255,43,214,.55) 54%, transparent 60% 100%); background-size: 300% 100%; animation: wipe49 .42s cubic-bezier(.3,.7,.3,1) both; mix-blend-mode: screen; }
@keyframes wipe49 { from { background-position: 100% 0; } to { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) { .odcut, .killcam, .wipe49 { display: none; } }
`; document.head.appendChild(css);
}
