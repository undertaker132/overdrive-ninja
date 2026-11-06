/* =====================================================================
   MAIN — fixed-step loop (hit-stop, aim slow-mo, spiral-of-death guard),
   boot sequence, lifecycle, test hooks
   ===================================================================== */
let lastT = 0, acc = 0;
function step() {
  const S = CFG.step;
  if (Tut.cur || G.state !== 'PLAY') return; // tutorial freeze-frame: the world waits (and nothing steps outside play)
  TICK.n++; REC.inTick = true;
  try {
    if (G.cine) { G.cine.t += S; if (G.cine.t > G.cine.d) G.cine = null; }
    if (REPLAY.on) REPLAY.pump(); else In.pump(S, G.hs > 0 || G.freeze > 0);
    REC.depth++; // nothing the simulation does on its own is recorded: it replays by itself
    try {
      if (G.freeze > 0) { G.freeze -= S; Boss.update(0, S); FX.update(S * .5, S); return; }
      if (G.hs > 0) { G.hs -= S; return; }
      let ts = 1;
      if (In.on && (P.ch > 0 || G.odT > 0) && P.lock <= 0 && G.mode !== 'puzzle') {
        G.aimHold += S; const deep = P.perks.chrono ? .1 : .18;
        ts = G.aimHold < 2.4 ? deep : Math.min(1, deep + (G.aimHold - 2.4) * 1.4);
      }
      if (G.slowT > 0) { G.slowT -= S; ts = Math.min(ts, G.slowK); }
      if (G.mods.superhot && !In.on && P.dashT <= 0 && P.spd < 90) ts = Math.min(ts, .3); // CHRONO LOCK: the world crawls while you stand still
      G.ts = ts;
      sim(S * ts * G.gspd, S);
    } finally { REC.depth--; }
  } finally { REC.inTick = false; REC.tick(); }
}
let simErr = 0;
function safeStep() { // a bad frame must never kill the run: log, scrub, and keep going
  try { Smooth.snap(); step(); if (simErr > 0) simErr -= .02; }
  catch (e) {
    simErr++; if (simErr < 3) console.error('sim recovered:', e && e.stack || e);
    LAST_ERR = String(e && e.message || e).slice(0, 160); errLog(e);
    for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (!(isFinite(o.x) && isFinite(o.y))) o.alive = false; } EN.sweep();
    for (let i = 0; i < BU.n; i++) { const o = BU.a[i]; if (!(isFinite(o.x) && isFinite(o.y))) o.alive = false; } BU.sweep();
    if (simErr > 30) { simErr = 0; Flow.quit(); toastDom(lt('RUN ENDED AFTER AN ERROR')); }
  }
}
function frame(t) {
  requestAnimationFrame(frame);
  if (FrameCap.skip(t)) return; // a frame-rate limit (Settings > PC): skip this refresh
  const rd = Math.min(.1, (t - lastT) / 1000 || 0); lastT = t; RDT = rd || 1 / 60; PC.tick(rd);
  governor(rd); camUpdate(rd); Pad.poll(rd);
  if (REPLAY.on) { REPLAY.frame(rd); acc = 0; }
  else if (G.state === 'PLAY') {
    acc += rd; let n = 0;
    while (acc >= CFG.step && n < CFG.maxSteps && G.state === 'PLAY') { acc -= CFG.step; n++; safeStep(); }
    if (acc > CFG.step) acc = 0;
  } else if (G.state === 'OVER' || G.state === 'CLEAR') { FX.update(rd * .4, rd); acc = 0; }
  else acc = 0;
  Flow.update(rd);
  const bgMul = G.state === 'PLAY' ? G.ts * (G.odT > 0 ? 1.6 : 1) : (G.state === 'MENU' || G.state === 'DIALOG' ? .55 : .15);
  BG.update(rd, bgMul);
  Dlg.tick(rd); Tut.tick(rd); if (G.state === 'PLAY' && !Tut.cur) Comms.tick(rd); // radio lines run on real time
  Live.tick(rd);
  Aud.mix();
  Smooth.render(rd);
  UI.tick(rd);
}
const BOOT_LINES = ['> OVERDRIVE KERNEL v' + VERSION + ' ONLINE', '> MOUNTING TITAN EXPRESS TELEMETRY ... OK', '> CALIBRATING PLASMA KATANA ... OK',
  '> LOADING ' + STAGES.length + ' STORY STAGES / ' + Object.keys(BOSS_INFO).length + ' BOSSES ... OK', '> SYNTH AUDIO ENGINE: ' + TRACK_LIST.length + ' TRACKS ... OK', '> ARSENAL: ' + WEAPONS.length + ' WEAPONS / ' + PETS.length + ' COMPANIONS ... OK', '> NEURAL LINK READY'];
const BOOT_TIPS = [
  'Hold to aim: time slows down. Let go to slash.', 'Hit a rail mid-dash: the bounce is a guaranteed critical hit.',
  'Slash a bullet right as your dash starts for a perfect parry.', 'Dash into a boss\'s red line to clash.',
  'Tap a staggered boss for Zandatsu finishers.', 'A quick tap dashes to that spot.', 'Pets, heroes and blades wait in the Arsenal.',
  'A controller works too: left stick aims, A slashes, LT holds the slow-mo.'
];
const BootFx = { // the loading screen: a synthwave sun, a rushing neon grid, a skyline, rain, and a hero who slashes the logo open
  on: false, t: 0, g: null, cv: null, W: 0, H: 0, dpr: 1, cut: 0, sk: null,
  start() {
    const cv = $('bootCv'); if (!cv) return; this.cv = cv; this.g = cv.getContext('2d'); this.on = true; this.t = 0; this.cut = 0;
    this.sk = []; let x = 0; while (x < 1400) { const w = 18 + rnd() * 50; this.sk.push([x, w, 40 + rnd() * 140, rnd()]); x += w + rnd() * 6; }
    this.rain = []; for (let i = 0; i < 70; i++) this.rain.push([rnd(), rnd(), .6 + rnd() * .8]);
    let lt0 = 0; const loop = ts => { if (!this.on) return; this.draw(lt0 ? Math.min(.05, (ts - lt0) / 1000) : 1 / 60); lt0 = ts; requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  },
  stop() { this.on = false; },
  fit() { const r = this.cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); if (r.width !== this.W || r.height !== this.H) { this.W = r.width; this.H = r.height; this.dpr = d; this.cv.width = r.width * d; this.cv.height = r.height * d; } },
  draw(dt) {
    if (UI.cur !== 'boot') { this.stop(); return; }
    this.fit(); const g = this.g, W = this.W, H = this.H, t = (this.t += dt), hz = H * .58; g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#05030f'); sky.addColorStop(.6, '#1a0630'); sky.addColorStop(1, '#3a0a3a'); g.fillStyle = sky; g.fillRect(0, 0, W, hz);
    const sr = Math.min(W, H) * .22, sx = W / 2, sy = hz - sr * .25; // the sun, cut by stripes
    const sun = g.createLinearGradient(0, sy - sr, 0, sy + sr); sun.addColorStop(0, '#ffd23f'); sun.addColorStop(.55, '#ff2bd6'); sun.addColorStop(1, '#7928ca');
    g.save(); g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.clip(); g.fillStyle = sun; g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    g.fillStyle = '#1a0630'; for (let k = 0; k < 7; k++) { const yy = sy + sr * (.05 + k * .14) + ((t * 18) % (sr * .14)), h = 2 + k * 1.6; g.fillRect(sx - sr, yy, sr * 2, h); } g.restore();
    g.globalAlpha = .35; g.fillStyle = '#ff2bd6'; g.beginPath(); g.arc(sx, sy, sr * 1.25, 0, TAU); g.fill(); g.globalAlpha = 1; g.globalAlpha = .25; g.fillStyle = '#05030f'; g.beginPath(); g.arc(sx, sy, sr * 1.2, 0, TAU); g.fill(); g.globalAlpha = 1;
    const off = (t * 30) % 1400; g.fillStyle = '#0a0418'; // skyline with lit windows
    for (const [bx, bw, bh, s] of this.sk) { let x = bx - off; if (x < -bw) x += 1400; if (x > W) continue; g.fillRect(x, hz - bh, bw, bh); g.fillStyle = s < .3 ? 'rgba(0,242,254,.5)' : 'rgba(255,43,214,.45)'; for (let wy = hz - bh + 6; wy < hz - 4; wy += 9) for (let wx = x + 3; wx < x + bw - 3; wx += 7) if (((wx * 7 + wy * 3) | 0) % 5 === 0) g.fillRect(wx, wy, 2, 3); g.fillStyle = '#0a0418'; }
    const fl = g.createLinearGradient(0, hz, 0, H); fl.addColorStop(0, '#12052a'); fl.addColorStop(1, '#03020a'); g.fillStyle = fl; g.fillRect(0, hz, W, H - hz);
    g.strokeStyle = '#ff2bd6'; g.lineWidth = 1.2; g.globalAlpha = .7; g.beginPath(); // the rushing grid
    for (let k = -14; k <= 14; k++) { g.moveTo(W / 2 + k * 12, hz); g.lineTo(W / 2 + k * W * .16, H); }
    for (let k = 0; k < 14; k++) { const z = ((k + (t * 1.6) % 1) / 14), y = hz + (H - hz) * z * z; g.moveTo(0, y); g.lineTo(W, y); }
    g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(0,242,254,.9)'; g.lineWidth = 2; g.shadowColor = '#00f2fe'; g.shadowBlur = 12; g.beginPath(); g.moveTo(0, hz); g.lineTo(W, hz); g.stroke(); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(160,200,255,.35)'; g.lineWidth = 1; g.beginPath(); for (const r of this.rain) { const x = ((r[0] * W + t * 40 * r[2]) % W), y = ((r[1] * H + t * 520 * r[2]) % H); g.moveTo(x, y); g.lineTo(x - 3, y + 12 * r[2]); } g.stroke();
    if (this.cut > 0) { // the finishing slash across the screen
      const k = Math.min(1, (t - this.cut) / .35), a = 1 - Math.max(0, (t - this.cut - .35) / .6); if (a > 0) {
        const y0 = H * .22, y1 = H * .34; g.globalAlpha = a; g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.shadowColor = '#00f2fe'; g.shadowBlur = 24; g.beginPath(); g.moveTo(-20, y1); g.lineTo(-20 + (W + 40) * k, y1 + (y0 - y1) * k); g.stroke();
        g.lineWidth = 2; g.strokeStyle = '#ff2bd6'; g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
        if (k < 1) { g.fillStyle = '#e8fbff'; g.beginPath(); g.arc(-20 + (W + 40) * k, y1 + (y0 - y1) * k, 5, 0, TAU); g.fill(); } }
      if (t - this.cut < .12) { g.fillStyle = 'rgba(255,255,255,' + (.5 - (t - this.cut) * 4) + ')'; g.fillRect(0, 0, W, H); }
    }
  },
  slash() { this.cut = this.t; const lg = $('bootLogo'); if (lg) { lg.classList.remove('cut'); void lg.offsetWidth; lg.classList.add('cut'); } }
};
function bootSeq() {
  const term = $('bootTerm'), bar = $('bootBar'), lbl = $('bootLbl'), pct = $('bootPct'), tip = $('bootTip'), go = $('bootGo'); let p = 0, li = 0, ti = (Math.random() * BOOT_TIPS.length) | 0;
  BootFx.start(); tip.textContent = lt(BOOT_TIPS[ti]);
  let fontsOk = false; try { (document.fonts && document.fonts.ready || Promise.resolve()).then(() => { fontsOk = true; }); } catch (e) { fontsOk = true; } setTimeout(() => { fontsOk = true; }, 900);
  const iv = setInterval(() => {
    p = Math.min(fontsOk ? 100 : 88, p + (p < 60 ? 6 : 4)); bar.style.width = p + '%'; pct.textContent = p + '%'; lbl.textContent = lt('LOADING COMBAT OS');
    while (li < Math.floor(p / 100 * BOOT_LINES.length)) { term.appendChild(el('div', '', BOOT_LINES[li])); li++; term.scrollTop = 999; }
    if (p >= 100) { clearInterval(iv); lbl.textContent = lt('ALL SYSTEMS NOMINAL'); BootFx.slash(); go.classList.remove('hidden'); try { go.focus({ preventScroll: true }); } catch (e) { errLog(e); } }
  }, 40);
  const tipIv = setInterval(() => { if (UI.cur !== 'boot') { clearInterval(tipIv); return; } tip.style.opacity = 0; setTimeout(() => { ti = (ti + 1) % BOOT_TIPS.length; tip.textContent = lt(BOOT_TIPS[ti]); tip.style.opacity = 1; }, 300); }, 3200);
  go.onclick = () => { BootFx.stop(); Aud.init(); Aud.sfx('buy'); Aud.say('Neural link online', 1); UI.openTitle(); if (P2PQ.auto) P2PQ.handleAuto(); };
  const padGo = setInterval(() => { if (UI.cur !== 'boot') { clearInterval(padGo); return; } try { for (const gp of navigator.getGamepads ? navigator.getGamepads() : []) if (gp && gp.buttons.some(b => b && b.pressed) && !go.classList.contains('hidden')) { clearInterval(padGo); go.click(); } } catch (e) { errLog(e); } }, 100);
  window.addEventListener('keydown', function k(e) { if (UI.cur === 'boot' && !go.classList.contains('hidden') && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); window.removeEventListener('keydown', k); go.click(); } });
}
function start(hot) {
  Store.load();
  if (hot && hot.save && tsn(hot.save.ts) > tsn(Store.data.ts)) Store.data = Store.merge(Store.def(), hot.save);
  try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !Store.data.seen.rm) { Store.data.settings.shake = .5; Store.data.seen.rm = 1; } } catch (e) { errLog(e); }
  applyLang();
  window.addEventListener('error', ev => { LAST_ERR = String(ev && ev.message || 'error').slice(0, 160); });
  setQuality(Store.data.settings.fx === 'low' ? 0 : 2); applyUiSettings();
  fit(); const rc = cv.getBoundingClientRect(); In.ox = rc.left; In.oy = rc.top;
  let rzT = 0; const onRz = () => { fit(); const r = cv.getBoundingClientRect(); In.ox = r.left; In.oy = r.top; UI.measureDock(); };
  window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(onRz, 150); }); // (one refit after the size settles, not one per event while a phone's bars slide)
  bindInput(); Pad.init(); UI.init();
  $('dlgTap').addEventListener('pointerdown', e => { e.preventDefault(); Dlg.next(); });
  $('dlg').addEventListener('pointerdown', e => { if (e.target.id === 'dlgSkip') return; e.preventDefault(); Dlg.next(); });
  $('dlgSkip').addEventListener('click', e => { e.stopPropagation(); Aud.sfx('back'); Dlg.end(); });
  setInterval(() => Store.flush(), 4000);
  window.addEventListener('pagehide', () => Store.flush(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { try { if (Aud.c && Aud.c.state === 'running') Aud.c.suspend(); if (typeof Voices !== 'undefined') Voices.stop(); } catch (e) { errLog(e); } Store.flush(true); if (REPLAY.on) REPLAY.paused = true; else if (G.state === 'PLAY') Flow.togglePause(); } else if (Aud.c && Aud.c.state === 'suspended' && G.state !== 'BOOT') Aud.c.resume(); });
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ save: REPLAY.on && REPLAY.bak ? REPLAY.bak.data : Store.data })); } catch (e) { errLog(e); }
  BG.set('maglev'); G.state = 'BOOT'; UI.show('boot'); bootSeq();
  requestAnimationFrame(frame);
  Cloud.init();
}
/* ---------------- MENUS IN MOTION + APP (version 32) ----------------
   Touch ripples on every button, credits that count up, the INSTALL APP button
   (when the browser offers it) and the offline cache of the standalone app.
   Nothing here touches the simulation. */
const Motion2 = {
  rm: false, inst: null,
  init() {
    try { this.rm = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { errLog(e); }
    const sel = '.btn, .item, .stage, .perk, .chip, .seg button, .tabs button, .route, .lb-row, .crew-row, .pzgrid button, .ctrs button, .evbanner, .edtabs button, .edpal button';
    document.addEventListener('pointerdown', e => {
      if (CALM || this.rm || !e.target || !e.target.closest) return;
      const t = e.target.closest(sel); if (!t || t.disabled) return;
      const r = t.getBoundingClientRect(); if (r.width < 8 || !t.offsetWidth) return;
      const k = r.width / t.offsetWidth || 1; // (screens can be zoomed)
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      const d = Math.max(t.offsetWidth, t.offsetHeight) * 2.2, s = document.createElement('span'); s.className = 'rip'; s.setAttribute('aria-hidden', 'true');
      s.style.left = ((e.clientX - r.left) / k - d / 2) + 'px'; s.style.top = ((e.clientY - r.top) / k - d / 2) + 'px'; s.style.width = s.style.height = d + 'px';
      t.appendChild(s); setTimeout(() => s.remove(), 600);
    }, true);
    const ib = $('tInstall');
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.inst = e; if (ib) ib.classList.remove('hidden'); });
    window.addEventListener('appinstalled', () => { this.inst = null; if (ib) ib.classList.add('hidden'); toastDom(lt('INSTALLED')); });
    if (ib) ib.onclick = async () => { Aud.sfx('ui'); const p = this.inst; if (!p) return; this.inst = null; ib.classList.add('hidden'); try { p.prompt(); await p.userChoice; } catch (e) { errLog(e); } };
    // the standalone app (a page that links a manifest) caches itself for offline play
    try { if (offlineBuild() && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && document.querySelector('link[rel="manifest"]')) navigator.serviceWorker.register('sw.js').catch(e => errLog(e)); } catch (e) { errLog(e); }
  },
  roll(el, v, suf) { // a number that counts to its new value
    if (!el) return; const from = el._v; el._v = v;
    if (from == null || from === v || CALM || this.rm || !el.offsetParent) { el.textContent = fmtNum(v) + suf; return; }
    const t0 = performance.now(), D = 700; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    const step = now => { if (el._v !== v) return; const p = Math.min(1, (now - t0) / D), q = 1 - Math.pow(1 - p, 3); el.textContent = fmtNum(Math.round(from + (v - from) * q)) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
};
try { Motion2.init(); } catch (e) { errLog(e); }
/* ---------------- TITLE DECK (version 33): the living home screen ---------------- */
const TitleDeck = {
  on: false, cv: null, g: null, W: 0, H: 0, dpr: 1, t: 0, sk: null, pt: null, lastCut: 0, ca: '#00f2fe', cb: '#ff2bd6', lt: 0,
  decorate() {
    const b = $('bStory'); if (!b || b.dataset.deck) return; b.dataset.deck = '1';
    const label = el('span', 'sm-l'); while (b.firstChild) label.appendChild(b.firstChild); // (the text node moves with its translation)
    const fx = el('span', 'sm-fx'), cut = el('span', 'sm-cut'), eb = el('span', 'sm-e'), bar = el('span', 'sm-b'), bi = el('i'), play = el('span', 'sm-p', '▶');
    eb.id = 'smEye'; bi.id = 'smBar'; bar.appendChild(bi); [fx, cut, play].forEach(x => x.setAttribute('aria-hidden', 'true'));
    b.appendChild(fx); b.appendChild(cut); b.appendChild(eb); b.appendChild(label); b.appendChild(bar); b.appendChild(play);
    const cv = document.createElement('canvas'); cv.id = 'tdCv'; cv.setAttribute('aria-hidden', 'true'); const sc = $('s-title'); sc.insertBefore(cv, sc.firstChild);
    this.cv = cv; this.g = cv.getContext('2d');
    // tiles lean toward the finger or the mouse
    const tilt = (e, t) => { const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; t.style.setProperty('--ry', (x * 16).toFixed(1) + 'deg'); t.style.setProperty('--rx', (-y * 16).toFixed(1) + 'deg'); };
    const flat = t => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); };
    const grid = $('bArcade') && $('bArcade').parentElement;
    if (grid) for (const t of grid.children) {
      t.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && !Motion2.rm) tilt(e, t); });
      t.addEventListener('pointerdown', e => { if (!Motion2.rm) tilt(e, t); });
      ['pointerleave', 'pointerup', 'pointercancel'].forEach(k => t.addEventListener(k, () => flat(t)));
    }
  },
  refresh() {
    try {
      this.decorate();
      const d = Store.data, un = d.story.unlocked | 0, last = STAGES.findIndex(s => s.secret) - 1, i = Math.max(0, Math.min(un, last >= 0 ? last : STAGES.length - 1)), s = STAGES[i], ch = CHAPTERS[s.ch] || {};
      const e = $('smEye'); if (e) e.textContent = (un > last ? lt('ALL CHAPTERS CLEAR') : ltf('CHAPTER {0}', s.ch + 1) + ' · ' + lt(ch.name || '')) + '  //  ' + s.id + ' ' + lt(s.name);
      const bar = $('smBar'); if (bar) bar.style.width = Math.round(Store.stars() / (STAGES.length * 3) * 100) + '%';
      const sk = skinOf(d.skin); this.ca = sk.a || '#00f2fe'; this.cb = sk.b || '#ff2bd6';
      const h = $('tHero'); if (h) { h.style.setProperty('--hc', this.ca); h.style.setProperty('--hc2', this.cb); }
    } catch (er) { errLog(er); }
    this.start();
  },
  start() {
    if (this.on || !this.cv || CALM || Motion2.rm) return; this.on = true; this.t = 0; this.lastCut = 0;
    this.sk = []; for (let L = 0; L < 3; L++) { const row = []; let x = 0; while (x < 1600) { const w = 22 + rnd() * (40 + L * 30); row.push([x, w, 60 + rnd() * (90 + L * 90), rnd()]); x += w + 4 + rnd() * 10; } this.sk.push(row); }
    this.pt = []; for (let i = 0; i < 46; i++) this.pt.push([rnd(), rnd(), rnd(), rnd()]);
    const loop = ts => { if (!this.on) return; if (UI.cur !== 'title' || document.hidden) { this.on = false; return; } const dt = this.lt ? Math.min(.05, (ts - this.lt) / 1000) : 1 / 60; this.lt = ts; this.draw(dt); requestAnimationFrame(loop); };
    this.lt = 0; requestAnimationFrame(loop);
  },
  fit() { const W = window.innerWidth, H = window.innerHeight, d = Math.min(1.5, window.devicePixelRatio || 1); if (W !== this.W || H !== this.H || d !== this.dpr) { this.W = W; this.H = H; this.dpr = d; this.cv.width = W * d; this.cv.height = H * d; } },
  draw(dt) {
    this.fit(); const g = this.g, W = this.W, H = this.H, t = (this.t += dt), hz = H * .62; g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // night sky in the hero's colors
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#03040c'); sky.addColorStop(.55, '#0c0a24'); sky.addColorStop(1, '#040510'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // the moon, sliced by the last cut
    const mr = Math.min(W, H) * .2, mx = W * .5, my = H * .3;
    g.save(); g.globalCompositeOperation = 'lighter'; const halo = g.createRadialGradient(mx, my, mr * .6, mx, my, mr * 2.4); halo.addColorStop(0, 'rgba(255,40,140,.22)'); halo.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = halo; g.fillRect(mx - mr * 2.5, my - mr * 2.5, mr * 5, mr * 5); g.restore();
    const sl = Math.min(1, Math.max(0, (t - this.lastCut) / .5)), gap = this.lastCut ? 6 * (1 - sl) + 2 : 2;
    for (const side of [-1, 1]) { g.save(); g.beginPath(); const a = -.35; if (side < 0) { g.moveTo(mx - mr * 2, my - mr * 2); g.lineTo(mx + mr * 2, my - mr * 2); g.lineTo(mx + mr * 2, my + Math.tan(a) * mr * 2 - gap); g.lineTo(mx - mr * 2, my - Math.tan(a) * mr * 2 - gap); } else { g.moveTo(mx - mr * 2, my - Math.tan(a) * mr * 2 + gap); g.lineTo(mx + mr * 2, my + Math.tan(a) * mr * 2 + gap); g.lineTo(mx + mr * 2, my + mr * 2); g.lineTo(mx - mr * 2, my + mr * 2); } g.clip();
      const mg = g.createLinearGradient(0, my - mr, 0, my + mr); mg.addColorStop(0, '#ffe08a'); mg.addColorStop(.5, '#ff4fa0'); mg.addColorStop(1, '#7a2bd6'); g.fillStyle = mg; g.beginPath(); g.arc(mx + side * gap * .4, my + side * gap * .3, mr, 0, TAU); g.fill();
      g.fillStyle = 'rgba(12,10,36,.85)'; for (let k = 0; k < 6; k++) { const yy = my + mr * (.1 + k * .16) + ((t * 14) % (mr * .16)); g.fillRect(mx - mr, yy, mr * 2, 1.5 + k * 1.3); } g.restore(); }
    // searchlights
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) { const bx = W * (.2 + .6 * i), a = -Math.PI / 2 + Math.sin(t * .35 + i * 2.2) * .55, L = H; const bg = g.createLinearGradient(bx, hz, bx + Math.cos(a) * L, hz + Math.sin(a) * L); bg.addColorStop(0, i ? 'rgba(0,242,254,.16)' : 'rgba(255,43,214,.14)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.beginPath(); g.moveTo(bx, hz); g.lineTo(bx + Math.cos(a - .07) * L, hz + Math.sin(a - .07) * L); g.lineTo(bx + Math.cos(a + .07) * L, hz + Math.sin(a + .07) * L); g.closePath(); g.fill(); }
    g.restore();
    // three layers of skyline, the near ones faster
    const cols = ['#0d0b26', '#090820', '#05050f'];
    for (let L = 0; L < 3; L++) { const off = (t * (8 + L * 14)) % 1600, base = hz + L * 18; g.fillStyle = cols[L];
      for (const [bx, bw, bh, s] of this.sk[L]) { let x = bx - off; if (x < -bw) x += 1600; if (x > W) continue; g.fillRect(x, base - bh, bw, bh + H);
        if (L < 2) { g.fillStyle = s < .4 ? 'rgba(0,242,254,.35)' : s < .7 ? 'rgba(255,43,214,.32)' : 'rgba(255,210,63,.3)'; for (let wy = base - bh + 6; wy < base - 4; wy += 10) for (let wx = x + 4; wx < x + bw - 4; wx += 8) if (((wx * 13 + wy * 7 + L * 5) | 0) % 5 === 0 && ((t * 2 + wx) | 0) % 37 !== 0) g.fillRect(wx, wy, 3, 4); g.fillStyle = cols[L]; }
        if (L === 1 && s > .85) { g.fillStyle = s > .93 ? '#ff2bd6' : '#00f2fe'; g.globalAlpha = .55 + .45 * Math.sin(t * 3 + bx); g.fillRect(x + bw * .2, base - bh - 10, bw * .6, 6); g.globalAlpha = 1; g.fillStyle = cols[L]; } } }
    // the neon floor
    const fy = H * .8; const fl = g.createLinearGradient(0, fy, 0, H); fl.addColorStop(0, '#0a0420'); fl.addColorStop(1, '#020208'); g.fillStyle = fl; g.fillRect(0, fy, W, H - fy);
    g.strokeStyle = this.ca; g.globalAlpha = .45; g.lineWidth = 1; g.beginPath();
    for (let k = -16; k <= 16; k++) { g.moveTo(W / 2 + k * 10, fy); g.lineTo(W / 2 + k * W * .14, H); }
    for (let k = 0; k < 10; k++) { const z = (k + (t * 1.2) % 1) / 10, y = fy + (H - fy) * z * z; g.moveTo(0, y); g.lineTo(W, y); }
    g.stroke(); g.globalAlpha = 1; g.strokeStyle = this.ca; g.lineWidth = 2; g.shadowColor = this.ca; g.shadowBlur = 14; g.beginPath(); g.moveTo(0, fy); g.lineTo(W, fy); g.stroke(); g.shadowBlur = 0;
    // petals and embers drifting through
    for (const p of this.pt) { const x = ((p[0] * W + t * (18 + p[2] * 30)) % (W + 40)) - 20, y = ((p[1] * H + t * (26 + p[3] * 40)) % (H + 40)) - 20, petal = p[3] > .5;
      g.globalAlpha = .35 + p[2] * .5; g.fillStyle = petal ? '#ffb7d5' : (p[2] > .5 ? this.ca : '#ffd23f');
      if (petal) { g.beginPath(); g.ellipse(x, y, 3.5, 2, t * 2 + p[0] * 9, 0, TAU); g.fill(); } else g.fillRect(x, y, 2, 2); }
    g.globalAlpha = 1;
    // a katana cut across the screen every few seconds (and the logo splits with it)
    if (t - this.lastCut > 6.5) { this.lastCut = t; const c = document.querySelector('#s-title .logo.v2 .cut'); if (c) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; } }
    const ck = (t - this.lastCut) / .3; if (this.lastCut && ck < 2.4) { const k = Math.min(1, ck), a = 1 - Math.max(0, (ck - 1) / 1.4), y0 = H * .4, y1 = H * .18;
      g.save(); g.globalAlpha = a; g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.shadowColor = this.ca; g.shadowBlur = 20; g.beginPath(); g.moveTo(-20, y0); g.lineTo(-20 + (W + 40) * k, y0 + (y1 - y0) * k); g.stroke(); g.lineWidth = 1.2; g.strokeStyle = this.cb; g.stroke(); g.restore(); }
    // keep the deck readable
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(3,4,10,.25)'); sh.addColorStop(.35, 'rgba(3,4,10,.45)'); sh.addColorStop(1, 'rgba(3,4,10,.7)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
  }
};
{ const ot1 = UI.openTitle.bind(UI); UI.openTitle = function () { ot1(); TitleDeck.refresh(); }; }
/* ---------------- ARSENAL SHOWROOM (version 33) ---------------- */
function hexA(c, a) { // '#rrggbb' + alpha -> rgba()
  const m = /^#([0-9a-f]{6})$/i.exec(c || ''); if (!m) return 'rgba(0,242,254,' + a + ')';
  const n = parseInt(m[1], 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
{
  const ra1 = UI.renderArsenal.bind(UI);
  UI.renderArsenal = function () {
    ra1();
    try { const tab = SHOP_TABS[this.asTab].id, items = this.shopItems(tab); document.querySelectorAll('#asList button.item').forEach((b, i) => { const it = items[i]; if (it && it.tier >= 2) b.classList.add('foil', 't' + it.tier); }); } catch (e) { errLog(e); }
  };
  const rs1 = UI.renderShopInfo.bind(UI);
  UI.renderShopInfo = function (it) { rs1(it); const p = $('asPn'); if (p && !Motion2.rm) { p.classList.remove('slam'); void p.offsetWidth; p.classList.add('slam'); } };
}