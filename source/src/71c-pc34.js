/* =====================================================================
   PC (version 34) — what a computer player expects:
   · mouse: hold to aim AT THE CURSOR (time slows), release to slash; right
     click dodges toward the cursor, the wheel swaps weapons, the middle
     button fires Overdrive; a neon crosshair shows your dash charges
   · keyboard: every action can be rebound; arrows aim, SHIFT holds the
     slow-motion aim, C slashes, V dodges; arrows + ENTER + ESC in menus;
     ALT+ENTER for fullscreen
   · controllers rumble, and the skill bar shows the controller's buttons
   · the game pauses when the window loses focus
   Every action goes through the same input paths as touch, so replays,
   ghosts and leaderboards work the same.
   ===================================================================== */
const KEY_ACTS = [['grapple', 'Grapple', 'KeyQ'], ['hijack', 'Hijack', 'KeyW'], ['web', 'Laser web', 'KeyE'], ['echo', 'Time echo', 'KeyR'], ['swap', 'Swap weapon', 'KeyF'], ['od', 'Overdrive', 'Space'],
  ['aim', 'Hold to aim (slow motion)', 'ShiftLeft'], ['slash', 'Slash', 'KeyC'], ['dodge', 'Dodge', 'KeyV'], ['up', 'Aim up', 'ArrowUp'], ['down', 'Aim down', 'ArrowDown'], ['left', 'Aim left', 'ArrowLeft'], ['right', 'Aim right', 'ArrowRight']];
const PAD_GLYPH = { grapple: 'X', hijack: 'Y', web: 'B', echo: 'LB', od: 'RB', swap: '' };
const Keys = {
  held: {}, aiming: false, capture: null,
  map() { const s = Store.data.settings; if (!s.keys || typeof s.keys !== 'object') s.keys = {}; const m = {}; for (const a of KEY_ACTS) m[a[0]] = s.keys[a[0]] || a[2]; return m; },
  norm(c) { return c === 'ShiftRight' ? 'ShiftLeft' : c === 'ControlRight' ? 'ControlLeft' : c === 'AltRight' ? 'AltLeft' : c; },
  act(code) { const m = this.map(), c = this.norm(code); for (const k in m) if (this.norm(m[k]) === c) return k; return ''; },
  label(code) {
    if (!code) return '—'; const L = { Space: 'SPACE', ShiftLeft: 'SHIFT', ControlLeft: 'CTRL', AltLeft: 'ALT', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'ENTER', Tab: 'TAB', Backspace: '⌫', CapsLock: 'CAPS' };
    const c = this.norm(code); if (L[c]) return L[c]; return c.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'NUM ').toUpperCase();
  },
  dir() { const h = this.held, x = (h.right ? 1 : 0) - (h.left ? 1 : 0), y = (h.down ? 1 : 0) - (h.up ? 1 : 0); return x || y ? Math.atan2(y, x) : (PC.mouseOn() ? Math.atan2(PC.wy() - P.y, PC.wx() - P.x) : P.face); },
  canPlay() { return G.state === 'PLAY' && !REPLAY.on && G.freeze <= 0; },
  aimStart() {
    if (In.on || !this.canPlay()) return false; if (Tut.cur) { Tut.dismiss(); return false; } Aud.init();
    this.aiming = true; In.on = true; In.id = 'kb'; In.cur = 0; In.sx = In.sy = 0; In.t0 = performance.now() - 1000; P.nlk = 0; G.aimHold = 0; REC.act(RA.DOWN); this.aimMove(); return true;
  },
  aimMove() { if (!this.aiming || !In.on) return; const a = this.dir(); In.cx = Math.cos(a) * 120; In.cy = Math.sin(a) * 120; },
  aimEnd() { if (!this.aiming) return; this.aiming = false; if (!In.on || In.id !== 'kb') return; this.aimMove(); In.up(); },
  game(k, e) { // a key went down during a run (called by the game's own key handler)
    const a = this.act(k); if (!a) return;
    if (a === 'grapple' || a === 'hijack' || a === 'web' || a === 'echo') useSkill(a);
    else if (a === 'swap') swapWeapon();
    else if (a === 'od') { overdrive(); e.preventDefault(); }
    else if (a === 'slash') { if (Boss.cur && Boss.cur.stag > 0) { Boss.zanTap(Boss.cur.x, Boss.cur.y); return; } if (!this.aiming && this.aimStart()) this.aimEnd(); }
    else if (a === 'aim') { this.aimStart(); e.preventDefault(); }
    else if (a === 'dodge') { if (this.canPlay()) dodge(this.dir()); }
    if (a === 'up' || a === 'down' || a === 'left' || a === 'right') e.preventDefault();
  },
  down(e) {
    if (this.capture) { e.preventDefault(); e.stopImmediatePropagation(); const f = this.capture; this.capture = null; f(e.code === 'Escape' ? null : e.code); return; }
    const tg = e.target && e.target.tagName; if (tg === 'TEXTAREA' || tg === 'INPUT') return;
    if (e.code === 'Enter' && e.altKey) { e.preventDefault(); PC.fullscreen(); return; }
    const a = this.act(e.code); if (a === 'up' || a === 'down' || a === 'left' || a === 'right') this.held[a] = true;
    if (e.repeat) return;
    if (G.state !== 'PLAY' && G.state !== 'BOOT') this.menuKey(e);
  },
  up(e) { const a = this.act(e.code); if (a === 'up' || a === 'down' || a === 'left' || a === 'right') this.held[a] = false; if (a === 'aim') this.aimEnd(); },
  menuKey(e) { // arrows move between buttons, ESC goes back
    const k = e.code; const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[k];
    if (d && UI.cur !== 'comic' && UI.cur !== 'photo') { e.preventDefault(); const ax = Pad.ax, ay = Pad.ay; Pad.ax = d[0]; Pad.ay = d[1]; Pad.navT = 0; try { Pad.menu({ buttons: [], axes: [] }, 0); } catch (er) { errLog(er); } Pad.ax = ax; Pad.ay = ay; return; }
    if (k === 'Escape' && G.state === 'MENU' && UI.cur && UI.cur !== 'title' && UI.cur !== 'boot') { const b = document.querySelector('#s-' + UI.cur + ' [data-back]'); if (b) { e.preventDefault(); b.click(); } }
  },
  clear() { this.held = {}; if (this.aiming) this.aimEnd(); }
};
const PC = {
  isPC: false, mx: -1, my: -1, mt: 0, wheelT: 0, rm: false,
  mouseOn() { return this.mt > 0 && performance.now() - this.mt < 4000; },
  wx() { return W3D.live ? W3D.unproj(this.mx, this.my)[0] : this.mx; }, wy() { return W3D.live ? W3D.unproj(this.mx, this.my)[1] : this.my; },
  init() {
    const s = Store.data.settings;
    try { const mq = matchMedia('(hover: hover) and (pointer: fine)'); this.isPC = mq.matches; mq.addEventListener && mq.addEventListener('change', () => { this.isPC = mq.matches; this.sync(); }); } catch (e) { errLog(e); }
    if (s.pcInit == null) { s.pcInit = 1; s.maim = this.isPC ? 'cursor' : 'drag'; s.wide = this.isPC ? 1 : 0; if (s.xh == null) s.xh = 1; Store.touch(); }
    for (const [k, v] of [['fpsCap', 0], ['smooth', 'auto'], ['rscale', 0], ['blurPause', 1], ['maim', 'drag'], ['wide', 0], ['xh', 1]]) if (s[k] == null) s[k] = v;
    window.addEventListener('keydown', e => Keys.down(e), true);
    window.addEventListener('keyup', e => Keys.up(e));
    window.addEventListener('blur', () => { Keys.clear(); if (Store.data.settings.blurPause && G.state === 'PLAY' && !REPLAY.on && !G.photo) Flow.togglePause(); });
    window.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { this.mx = (e.clientX - (In.ox || 0)) / V.s; this.my = (e.clientY - (In.oy || 0)) / V.s; this.mt = performance.now(); } }, { passive: true });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('wheel', e => { if (G.state !== 'PLAY' || REPLAY.on) return; e.preventDefault(); const n = performance.now(); if (n - this.wheelT < 260) return; this.wheelT = n; swapWeapon(); }, { passive: false });
    const d0 = In.down.bind(In);
    In.down = function (e) {
      if (e && e.pointerType === 'mouse' && e.button === 2) { PC.rclick(e); return; }
      if (e && e.pointerType === 'mouse' && e.button === 1) { if (G.state === 'PLAY' && !REPLAY.on) overdrive(); return; }
      d0(e); this.cur = this.on && e && e.pointerType === 'mouse' && Store.data.settings.maim === 'cursor' ? 1 : 0;
      if (this.cur) { this.sx = P.x; this.sy = P.y; }
    };
    const c0 = In.cancel.bind(In); In.cancel = function () { this.cur = 0; c0(); };
    const v0 = vibe; vibe = function (kind) { v0(kind); PC.rumble(kind); };
    const hd0 = HUD.draw.bind(HUD); HUD.draw = function (rd) { hd0(rd); PC.cross(); };
    const ot0 = UI.openTitle.bind(UI); UI.openTitle = function () { ot0(); PC.titleLayout(); PC.sync(); };
    const oa0 = UI.openArsenal.bind(UI); UI.openArsenal = function () { PC.arsenalLayout(); oa0.apply(this, arguments); };
    const full = () => { Aud.sfx('ui'); PC.fullscreen(); };
    if ($('tFull')) $('tFull').onclick = full; if ($('psFull')) $('psFull').onclick = full;
    document.addEventListener('fullscreenchange', () => this.sync());
    document.querySelectorAll('#dock .sk').forEach(b => { if (!b.querySelector('.kc')) { const k = el('span', 'kc'); k.setAttribute('aria-hidden', 'true'); b.appendChild(k); } });
    window.addEventListener('gamepadconnected', () => setTimeout(() => this.sync(), 50)); window.addEventListener('gamepaddisconnected', () => setTimeout(() => this.sync(), 50));
    this.sync();
  },
  sync() {
    document.body.classList.toggle('pc', this.isPC);
    document.body.classList.toggle('padon', !!Pad.on);
    const fsOk = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen), fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    for (const id of ['tFull', 'psFull']) { const b = $(id); if (b) { b.classList.toggle('hidden', !fsOk || (id === 'tFull' && !this.isPC)); b.textContent = lt(fs ? 'EXIT FULLSCREEN' : 'FULLSCREEN'); } }
    const m = Keys.map();
    document.querySelectorAll('#dock .sk').forEach(b => { const k = b.querySelector('.kc'); if (!k) return; const a = b.dataset.k, t = Pad.on ? PAD_GLYPH[a] : Keys.label(m[a]); k.textContent = t || ''; k.style.display = t ? '' : 'none'; b.title = lt(((KEY_ACTS.find(q => q[0] === a) || [])[1]) || '') + (t ? ' (' + t + ')' : ''); });
  },
  fullscreen() {
    try { const d = document, el0 = d.documentElement; if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else (el0.requestFullscreen || el0.webkitRequestFullscreen).call(el0, { navigationUI: 'hide' }); } catch (e) { errLog(e); }
  },
  rclick(e) { // right click: dodge toward the cursor
    if (G.state !== 'PLAY' || REPLAY.on || G.freeze > 0) return; if (Tut.cur) { Tut.dismiss(); return; }
    In.pos(e); const a = Math.atan2(In.py - P.y, In.px - P.x); dodge(a);
  },
  tick(rd) {
    if (In.on && In.cur) { In.sx = P.x; In.sy = P.y; } // cursor aim: the aim line starts at the hero, wherever the hero is
    if (Keys.aiming) Keys.aimMove();
    const cross = this.isPC && G.state === 'PLAY' && Store.data.settings.xh && this.mouseOn() && !REPLAY.on;
    if (cross !== this.cr0) { this.cr0 = cross; document.body.classList.toggle('pcross', !!cross); }
  },
  cross() { // the crosshair, drawn in screen space: dash charges around it, red when the blade is locked
    if (!this.cr0) return; const x = this.mx, y = this.my; if (x < 0) return;
    const lock = P.lock > 0, c = lock ? '#ff3b3b' : G.odT > 0 ? '#ffd700' : P.ca || '#00f2fe', n = Math.max(1, P.maxCh), aim = In.on ? 1 : 0;
    cx.save(); cx.lineCap = 'round'; cx.strokeStyle = '#05060f'; cx.lineWidth = 4; cx.globalAlpha = .55;
    const r = aim ? 8 : 11; cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.stroke(); cx.globalAlpha = 1;
    for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + i * TAU / n + .12, a1 = a0 + TAU / n - .24, on = i < P.ch || G.odT > 0; cx.strokeStyle = on ? c : 'rgba(255,255,255,.25)'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(x, y, r, a0, a1); cx.stroke(); }
    cx.strokeStyle = c; cx.lineWidth = 1.6; cx.beginPath(); const g = aim ? 3 : 5, L = aim ? 7 : 5;
    cx.moveTo(x - g - L, y); cx.lineTo(x - g, y); cx.moveTo(x + g, y); cx.lineTo(x + g + L, y); cx.moveTo(x, y - g - L); cx.lineTo(x, y - g); cx.moveTo(x, y + g); cx.lineTo(x, y + g + L); cx.stroke();
    cx.fillStyle = c; cx.beginPath(); cx.arc(x, y, 1.4, 0, TAU); cx.fill(); cx.restore();
  },
  rumble(kind) { // controllers rumble with the same moments as phones vibrate
    try {
      const s = Store.data.settings; if (!s.haptics || REPLAY.on || !Pad.on || !navigator.getGamepads) return;
      const gp = navigator.getGamepads()[Pad.idx], h = HAPTIC[kind]; if (!gp || !h || !gp.vibrationActuator) return;
      let len = 0; for (const v of h[1]) len += v; const pri = h[0];
      gp.vibrationActuator.playEffect('dual-rumble', { duration: Math.min(320, len), strongMagnitude: pri >= 3 ? .85 : pri === 2 ? .45 : .12, weakMagnitude: pri >= 2 ? .7 : .35 });
    } catch (e) { }
  },
  titleLayout() { // two wrappers around the title: one column on a phone (display: contents), two on a computer
    const col = document.querySelector('#s-title > .col'); if (!col) return;
    let w = col.querySelector('.deckWrap'), L, R;
    if (!w) { w = el('div', 'deckWrap'); L = el('div', 'deckL'); R = el('div', 'deckR'); w.appendChild(L); w.appendChild(R); const chips = col.querySelector('.chips'); col.insertBefore(w, chips); }
    else { L = w.querySelector('.deckL'); R = w.querySelector('.deckR'); }
    const toL = [col.querySelector('.logo'), $('tHero'), $('tLogin')], toR = [$('bArcade') && $('bArcade').parentElement, $('tRivals'), $('bDaily'), $('tBountyBox')];
    for (const x of toL) if (x && x.parentElement !== L) L.appendChild(x);
    for (const x of [...col.querySelectorAll(':scope > .evbanner')]) L.appendChild(x);
    for (const id of ['bStory', 'tNext']) { const x = $(id); if (x && x.parentElement !== L) L.appendChild(x); }
    for (const x of toR) if (x && x.parentElement !== R) R.appendChild(x);
  },
  arsenalLayout() {
    const col = document.querySelector('#s-arsenal > .col'); if (!col || col.querySelector('.arWrap')) return;
    const w = el('div', 'arWrap'), L = el('div', 'arL'), R = el('div', 'arR'); w.appendChild(L); w.appendChild(R);
    const prev = $('asPrev'), list = $('asList'); if (!prev || !list) return; col.insertBefore(w, prev);
    L.appendChild(prev); const tree = $('asTree'); if (tree) L.appendChild(tree); R.appendChild(list);
  },
  settings(head, cycle, box, s) {
    head('PC & DISPLAY');
    cycle('Frame rate limit', 'fpsCap', [0, 480, 360, 240, 165, 144, 120, 90, 60], ['MAX', '480', '360', '240', '165', '144', '120', '90', '60']);
    cycle('Smooth motion (120-480 Hz)', 'smooth', ['auto', 'on', 'off'], ['AUTO', 'ON', 'OFF']);
    cycle('Show FPS', 'fps', [0, 1], ['OFF', 'ON']);
    cycle('Mouse aim', 'maim', ['cursor', 'drag'], ['AT THE CURSOR', 'DRAG']);
    cycle('Crosshair', 'xh', [1, 0], ['ON', 'OFF']);
    cycle('Wide roof (story, dojo, your levels)', 'wide', [1, 0], ['ON', 'OFF']);
    cycle('Pause when the window loses focus', 'blurPause', [1, 0], ['ON', 'OFF']);
    box.appendChild(el('div', 'small mute', lt('Mouse: hold to aim at the cursor, release to slash. Right click dodges, the wheel swaps weapons, the middle button is Overdrive. ALT+ENTER: fullscreen.')));
    head('KEYS');
    const m = Keys.map();
    for (const [id, name] of KEY_ACTS) {
      const r = el('div', 'set'); r.appendChild(el('span', '', lt(name)));
      const b = el('button', 'tog kb', Keys.label(m[id])); b.id = 'key-' + id;
      b.onclick = () => {
        Aud.sfx('ui'); b.classList.add('wait'); b.textContent = lt('PRESS A KEY');
        Keys.capture = code => {
          b.classList.remove('wait'); const keys = Store.data.settings.keys || (Store.data.settings.keys = {});
          if (code && code !== 'Escape' && code !== 'KeyP') { const cur = Keys.map(); for (const k in cur) if (k !== id && Keys.norm(cur[k]) === Keys.norm(code)) keys[k] = cur[id]; keys[id] = code; Store.touch(); Aud.sfx('buy'); }
          UI.openSettings(); PC.sync();
        };
      };
      r.appendChild(b); box.appendChild(r);
    }
    { const r = el('div', 'set'); r.appendChild(el('span', '', lt('Default keys'))); const b = el('button', 'tog', lt('RESET')); b.onclick = () => { Store.data.settings.keys = {}; Store.touch(); Aud.sfx('ui'); UI.openSettings(); PC.sync(); }; r.appendChild(b); box.appendChild(r); }
    box.appendChild(el('div', 'small mute', lt('ESC and P always pause. On the result screen R restarts.')));
  }
};
{ const st0 = start; start = function () { const r = st0.apply(this, arguments); try { PC.init(); } catch (e) { errLog(e); console.error(e); } return r; }; } // after the save has loaded