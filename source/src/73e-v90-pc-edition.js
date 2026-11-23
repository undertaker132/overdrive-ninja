/* ==========================================================================
   VERSION 90.0 — PC EDITION (DESKTOP MASTERWORK)
   1. PCMaster90   — Free WASD Movement with smooth acceleration & arena
                     clamping, instant Left-Click Slash toward cursor,
                     Hold Right-Click Iaido Focus / Quick Right-Click Dodge,
                     PC Hotkeys (1-4 Skills, Tab/F Swap, Shift Dodge, F11 Full)
   2. PCWide90     — True Widescreen/Ultrawide PC Arena expansion (up to 820px)
                     + Mouse-Lead Lookahead Camera for superior visibility
   3. PCHud90      — Reactive Target-Locking Cyber Reticle (snaps to enemies
                     with HP ring), sleek Desktop Hotkey Strip & Live FPS/ms
                     Telemetry Pill for 120Hz/144Hz/240Hz monitors
   4. PCUltra90    — Auto PC Ultra defaults (sharp shadows, full DPR, crisp
                     widescreen desktop menus) + 4-language Settings panel
   ========================================================================== */

try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "PC EDITION (v90)": "מהדורת מחשב PC EDITION (v90)",
    "WASD Free Movement": "תנועה חופשית במקשי WASD",
    "Instant Left-Click Slash": "חיתוך מיידי בקליק שמאלי",
    "Right-Click Iaido Focus": "איאיידו בהחזקת קליק ימני",
    "Ultrawide PC Arena": "זירה רחבה למסכי מחשב",
    "Mouse Lookahead Camera": "מצלמה עוקבת סמן עכבר",
    "PC Hotkey Bar": "סרגל מקשים בתחתית המסך",
    "Live FPS / ms Telemetry": "מד FPS וזמן פריים (ms)",
    "MOVE": "תנועה",
    "SLASH": "חיתוך",
    "IAIDO / DODGE": "איאיידו / התחמקות",
    "SKILLS": "יכולות",
    "SWAP": "החלף נשק",
    "OVERDRIVE": "אוברדרייב",
    "FULL": "מסך מלא"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "PC EDITION (v90)": "إصدار الكمبيوتر PC EDITION (v90)",
    "WASD Free Movement": "حركة حرة بمفاتيح WASD",
    "Instant Left-Click Slash": "قطع فوري بالنقر الأيسر",
    "Right-Click Iaido Focus": "تركيز إيايدو بالنقر الأيمن",
    "Ultrawide PC Arena": "ساحة عريضة لشاشات الكمبيوتر",
    "Mouse Lookahead Camera": "كاميرا تتبع المؤشر",
    "PC Hotkey Bar": "شريط الاختصارات",
    "Live FPS / ms Telemetry": "مؤشر FPS وزمن الإطار"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "PC EDITION (v90)": "ПК-ИЗДАНИЕ PC EDITION (v90)",
    "WASD Free Movement": "Свободное движение WASD",
    "Instant Left-Click Slash": "Мгновенный удар ЛКМ",
    "Right-Click Iaido Focus": "Фокус Иайдо на ПКМ",
    "Ultrawide PC Arena": "Широкоформатная арена ПК",
    "Mouse Lookahead Camera": "Камера слежения за курсором",
    "PC Hotkey Bar": "Панель горячих клавиш",
    "Live FPS / ms Telemetry": "Счётчик FPS и ms"
  });
} catch (e) { errLog(e); }

const S90 = {
  on(k, defVal) {
    try {
      const s = Store && Store.data && Store.data.settings;
      if (!s || s[k] == null) return defVal == null ? true : !!defVal;
      return !!s[k];
    } catch (e) { return defVal == null ? true : !!defVal; }
  },
  isDesk() {
    try { return !!(typeof PC !== 'undefined' && PC.isPC) || (window.innerWidth >= 900 && matchMedia('(pointer: fine)').matches); }
    catch (e) { return false; }
  }
};

/* ==========================================================================
   1. PCMaster90 — WASD MOVEMENT, INSTANT LMB SLASH & RMB IAIDO/DODGE
   ========================================================================== */
const PCMaster90 = {
  wasd: { w: false, a: false, s: false, d: false },
  rmbDown: false,
  rmbT0: 0,
  lmbDown: false,
  lmbT0: 0,
  lookX: 0,
  lookY: 0,
  inited: false,

  init() {
    if (this.inited) return;
    this.inited = true;

    // 1. Capture WASD & PC-native hotkeys (1-4 skills, Tab swap, F11 fullscreen)
    window.addEventListener('keydown', e => {
      const tg = e.target && e.target.tagName;
      if (tg === 'TEXTAREA' || tg === 'INPUT') return;
      const c = e.code;

      // F11 toggles clean browser fullscreen
      if (c === 'F11' && S90.isDesk()) {
        e.preventDefault();
        if (typeof PC !== 'undefined' && PC.fullscreen) PC.fullscreen();
        return;
      }

      if (G.state !== 'PLAY' || REPLAY.on) return;

      // WASD Free Movement (intercepts KeyW before legacy hijack binding)
      if (S90.isDesk() && S90.on('wasd90', true)) {
        if (c === 'KeyW') { this.wasd.w = true; this.sync98(); e.preventDefault(); e.stopImmediatePropagation(); return; }
        if (c === 'KeyA') { this.wasd.a = true; this.sync98(); e.preventDefault(); e.stopImmediatePropagation(); return; }
        if (c === 'KeyS') { this.wasd.s = true; this.sync98(); e.preventDefault(); e.stopImmediatePropagation(); return; }
        if (c === 'KeyD') { this.wasd.d = true; this.sync98(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      }

      if (e.repeat) return;
      // Number row 1-4 for instant PC skills
      if (c === 'Digit1') { useSkill('grapple'); e.preventDefault(); return; }
      if (c === 'Digit2') { useSkill('hijack');  e.preventDefault(); return; }
      if (c === 'Digit3') { useSkill('web');     e.preventDefault(); return; }
      if (c === 'Digit4') { useSkill('echo');    e.preventDefault(); return; }
      // Tab swaps weapons cleanly on PC
      if (c === 'Tab' && S90.isDesk()) { swapWeapon(); e.preventDefault(); return; }
      // Left Shift quick-dodges in WASD direction (or toward cursor) when not holding aim
      if ((c === 'ShiftLeft' || c === 'ShiftRight') && S90.isDesk() && S90.on('wasd90', true)) {
        const vx = (this.wasd.d ? 1 : 0) - (this.wasd.a ? 1 : 0);
        const vy = (this.wasd.s ? 1 : 0) - (this.wasd.w ? 1 : 0);
        const ang = (vx || vy) ? Math.atan2(vy, vx) : Math.atan2(PC.wy() - P.y, PC.wx() - P.x);
        if (typeof dodge === 'function') dodge(ang);
        e.preventDefault(); e.stopImmediatePropagation();
        return;
      }
    }, true);

    window.addEventListener('keyup', e => {
      const c = e.code;
      if (c === 'KeyW') this.wasd.w = false;
      if (c === 'KeyA') this.wasd.a = false;
      if (c === 'KeyS') this.wasd.s = false;
      if (c === 'KeyD') this.wasd.d = false;
      this.sync98();
    });

    window.addEventListener('blur', () => {
      this.wasd.w = this.wasd.a = this.wasd.s = this.wasd.d = false; this.sync98();
      this.rmbDown = false; this.lmbDown = false;
    });

    // 2. Right-Click Hold = Iaido Focus Aim, Quick Right-Click Tap = Dodge toward cursor
    window.addEventListener('pointerup', e => {
      if (e && e.pointerType === 'mouse' && e.button === 2 && this.rmbDown) {
        this.rmbDown = false;
        const heldMs = performance.now() - this.rmbT0;
        if (G.state === 'PLAY' && !REPLAY.on && G.freeze <= 0) {
          if (heldMs < 185) {
            // Quick right-click tap -> crisp dodge toward cursor
            if (In.on && In.id === 'rmb90') In.cancel();
            const a = Math.atan2(PC.wy() - P.y, PC.wx() - P.x);
            if (typeof dodge === 'function') dodge(a);
          } else if (In.on && In.id === 'rmb90') {
            // Release Iaido focus -> unleash slash toward cursor
            In.cx = PC.wx(); In.cy = PC.wy();
            In.up({ pointerId: 'rmb90' });
          }
        }
      }
      if (e && e.pointerType === 'mouse' && e.button === 0 && this.lmbDown) {
        this.lmbDown = false;
      }
    });

    // Keep cursor aim updated continuously when holding RMB Iaido focus
    window.addEventListener('pointermove', e => {
      if (e && e.pointerType === 'mouse' && this.rmbDown && In.on && In.id === 'rmb90') {
        In.sx = P.x; In.sy = P.y;
        In.cx = PC.wx(); In.cy = PC.wy();
        if (typeof lockScan === 'function') lockScan();
      }
    }, { passive: true });
  },

  /* Smooth WASD movement integrated cleanly into sim(dt, rd) */
  /* v98: the held keys reach the simulation only as a recorded move mask (w1 a2 s4 d8), so a replay moves the same way */
  mask98: 0,
  sync98() {
    const m = (this.wasd.w ? 1 : 0) | (this.wasd.a ? 2 : 0) | (this.wasd.s ? 4 : 0) | (this.wasd.d ? 8 : 0);
    if (REPLAY.on || m === this.mask98 || G.state !== 'PLAY') return;
    this.mask98 = m; REC.act(RA.MOVE0 + m);
  },
  stepWASD(dt) {
    if (!simV(98) || G.state !== 'PLAY' || G.freeze > 0) return;
    if (!P || P.dashing || P.dashT > 0.04) return;
    const k = this.mask98, mx = (k & 8 ? 1 : 0) - (k & 2 ? 1 : 0);
    const my = (k & 4 ? 1 : 0) - (k & 1 ? 1 : 0);
    if (!mx && !my) return;
    const len = Math.hypot(mx, my) || 1;
    const nx = mx / len, ny = my / len;
    const spd = (G.odT > 0 ? 390 : 305) * (In.on ? 0.55 : 1);
    P.vx = P.vx * Math.pow(0.01, dt) + nx * spd * (1 - Math.pow(0.01, dt));
    P.vy = P.vy * Math.pow(0.01, dt) + ny * spd * (1 - Math.pow(0.01, dt));
    P.x = clamp(P.x + P.vx * dt * 0.55, V.L + 16, V.R - 16);
    P.y = clamp(P.y + P.vy * dt * 0.55, 42, V.VH - 48);
    P.spd = Math.max(P.spd || 0, Math.hypot(P.vx, P.vy));
    P.face = Math.atan2(ny, nx); // (v98: the movement direction; the mouse is not recorded)
  },

  /* Subtle Hotline-Miami / Hades mouse lookahead offset */
  stepLookahead(rd) {
    const dt = Math.min(0.05, rd || 0.016);
    let tx = 0, ty = 0;
    if (S90.isDesk() && S90.on('look90', true) && !CALM && G.state === 'PLAY' && !REPLAY.on && typeof PC !== 'undefined' && PC.mouseOn()) {
      const dx = PC.wx() - P.x, dy = PC.wy() - P.y;
      const d = Math.hypot(dx, dy) || 1;
      const mag = Math.min(54, d * 0.16);
      tx = (dx / d) * mag;
      ty = (dy / d) * mag;
    }
    const k = 1 - Math.exp(-dt * 8);
    this.lookX += (tx - this.lookX) * k;
    this.lookY += (ty - this.lookY) * k;
  }
};

/* ==========================================================================
   2. PCHud90 — REACTIVE TARGET-LOCK RETICLE, HOTKEY STRIP & FPS TELEMETRY
   ========================================================================== */
const PCHud90 = {
  barEl: null,
  fpsEl: null,
  fpsAcc: 0,
  fpsCnt: 0,
  fpsText: '60 FPS',
  recoil: 0,

  ensureDOM() {
    if (!this.barEl) {
      const b = document.createElement('div');
      b.id = 'pc90-bar';
      document.body.appendChild(b);
      this.barEl = b;
      this.refreshBarText();
    }
    if (!this.fpsEl) {
      const f = document.createElement('div');
      f.id = 'pc90-fps';
      document.body.appendChild(f);
      this.fpsEl = f;
    }
  },

  refreshBarText() {
    if (!this.barEl) return;
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    this.barEl.innerHTML =
      '<span><b class="k90">WASD</b>' + L('MOVE') + '</span>' +
      '<span><b class="k90">LMB</b>' + L('SLASH') + '</span>' +
      '<span><b class="k90">RMB</b>' + L('IAIDO / DODGE') + '</span>' +
      '<span><b class="k90">1-4</b>' + L('SKILLS') + '</span>' +
      '<span><b class="k90">SPACE</b>' + L('OVERDRIVE') + '</span>' +
      '<span><b class="k90">TAB / ⇳</b>' + L('SWAP') + '</span>' +
      '<span><b class="k90">M</b>♫</span>' +
      '<span><b class="k90">F11</b>' + L('FULL') + '</span>';
  },

  tick(rd) {
    this.ensureDOM();
    const isDesk = S90.isDesk();
    const playing = typeof inRun === 'function' && inRun() && G.state === 'PLAY' && !G.photo;

    // Hotkey bar visibility
    const showBar = isDesk && playing && S90.on('bar90', true);
    this.barEl.style.display = showBar ? 'flex' : 'none';

    // FPS / Frame-Time telemetry
    const showFps = false; // (v106: never — one FPS meter: the frame-time graph on a computer, the badge on a phone)
    if (showFps) {
      this.fpsAcc += (rd || 0.016);
      this.fpsCnt++;
      if (this.fpsAcc >= 0.35) {
        const ms = (this.fpsAcc / this.fpsCnt) * 1000;
        const fps = Math.round(1000 / Math.max(0.5, ms));
        this.fpsText = fps + ' FPS · ' + ms.toFixed(1) + 'ms';
        this.fpsEl.textContent = this.fpsText;
        this.fpsEl.style.color = fps >= 100 ? '#00ff9d' : fps >= 55 ? '#00f2fe' : '#ffb020';
        this.fpsAcc = 0; this.fpsCnt = 0;
      }
      this.fpsEl.style.display = 'block';
    } else {
      this.fpsEl.style.display = 'none';
    }

    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - (rd || 0.016) * 5.5);
  },

  /* Reactive Target-Locking Cyber Reticle drawn over PC.cross() */
  drawReticle() {
    if (!S90.isDesk() || typeof PC === 'undefined' || !PC.cr0 || typeof cx === 'undefined') return;
    if (G.state !== 'PLAY' || REPLAY.on) return;
    const mx = PC.mx, my = PC.my;
    if (mx < 0) return;

    // Detect closest enemy near cursor in world space
    const wx = PC.wx(), wy = PC.wy();
    let best = null, bd = 54;
    if (typeof EN !== 'undefined') {
      for (let i = 0; i < EN.n; i++) {
        const e = EN.a[i];
        if (!e.alive || e.al > 0 || e.vis < 0.3) continue;
        const d = Math.hypot(e.x - wx, e.y - wy);
        if (d < bd + (e.r || 14)) { bd = d; best = e; }
      }
    }

    const col = best ? '#ff0844' : (G.odT > 0 ? '#ffd700' : (P.ca || '#00f2fe'));
    const r = (best ? 17 : 14) + this.recoil * 9;
    const t = performance.now() * 0.004;

    cx.save();
    cx.translate(mx, my);
    // Rotating outer target-lock diamond when hovering an enemy
    if (best) {
      cx.save();
      cx.rotate(t * 1.4);
      cx.strokeStyle = '#ff0844';
      cx.lineWidth = 2;
      cx.shadowColor = '#ff0844';
      cx.shadowBlur = 10;
      cx.strokeRect(-r * 0.78, -r * 0.78, r * 1.56, r * 1.56);
      cx.restore();
      // Enemy HP arc around cursor
      if (best.hp > 0 && best.mhp > 0) {
        const frac = Math.max(0, Math.min(1, best.hp / best.mhp));
        cx.strokeStyle = '#ff4fd8';
        cx.lineWidth = 2.5;
        cx.beginPath();
        cx.arc(0, 0, r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        cx.stroke();
      }
    } else if (this.recoil > 0.05) {
      // Crisp slash recoil pulse ring
      cx.strokeStyle = col;
      cx.globalAlpha = this.recoil * 0.65;
      cx.lineWidth = 1.6;
      cx.beginPath();
      cx.arc(0, 0, r + 4, 0, Math.PI * 2);
      cx.stroke();
    }
    cx.restore();
  }
};

/* ==========================================================================
   HOOK WIRING — Clean, isolated, zero-regression v90 PC EDITION integration
   ========================================================================== */
{
  PCMaster90.init();

  // 1. Expand Wide Roof for PC Widescreen / Ultrawide monitors (up to 820px)
  if (typeof Wide !== 'undefined') {
    const wc90 = Wide.can.bind(Wide);
    const ww90 = Wide.want.bind(Wide);
    const ws90 = Wide.set.bind(Wide);
    Wide.want = function (mode) {
      if (S90.isDesk() && S90.on('wide90', true) && !REPLAY.on && !Flow.sr && wc90()) {
        // Dynamically scale arena width for 16:9 and 21:9 PC screens
        const s0 = Math.min(V.W / CFG.viewW, V.H / CFG.viewH);
        const availW = V.W / Math.max(0.2, s0);
        Wide.W = Math.round(Math.max(600, Math.min(820, availW - 96)));
        return mode === 'story' || mode === 'dojo' || mode === 'custom' || mode === 'arcade' || mode === 'endless' || mode === 'boss';
      }
      Wide.W = 600;
      return ww90(mode);
    };
    Wide.set = function (mode) { return ws90(mode); };
  }

  // 2. Hook PC.init / In.down / PC.rclick for Instant Left-Click Slash & Right-Click Iaido Focus
  const wirePCMouse90 = () => {
    if (typeof PC === 'undefined' || PC._v90Wired) return;
    PC._v90Wired = true;

    // PC Ultra graphics boost on desktop if user hasn't forced low
    try {
      const s = Store && Store.data && Store.data.settings;
      if (s && S90.isDesk() && !s.pc90Init) {
        s.pc90Init = 1;
        s.maim = 'cursor';
        s.wide = 1;
        s.xh = 1;
        if (!s.fx || s.fx === 'auto') s.fx = 'ultra';
        Store.touch();
      }
    } catch (e) {}

    // Override PC.rclick: Hold RMB = Iaido Slow-Mo Focus, Quick Tap RMB = Dodge
    const rc0 = PC.rclick.bind(PC);
    PC.rclick = function (e) {
      if (!S90.on('rmbIaido90', true)) return rc0(e);
      if (G.state !== 'PLAY' || REPLAY.on || G.freeze > 0) return;
      if (Tut.cur) { Tut.dismiss(); return; }
      Aud.init();
      PCMaster90.rmbDown = true;
      PCMaster90.rmbT0 = performance.now();
      In.on = true; In.id = 'rmb90'; In.cur = 1;
      In.sx = P.x; In.sy = P.y;
      In.cx = PC.wx(); In.cy = PC.wy();
      In.t0 = performance.now() - 1000;
      P.nlk = 0; G.aimHold = 0;
      REC.act(RA.DOWN);
      if (typeof lockScan === 'function') lockScan();
    };

    // Instant Left-Click Slash toward cursor on quick click
    const up90 = In.up.bind(In);
    In.up = function (e) {
      if (S90.isDesk() && S90.on('instSlash90', true) && e && e.pointerType === 'mouse' && e.button === 0 && In.on && In.id === e.pointerId) {
        const heldMs = performance.now() - (In.t0 || 0);
        if (heldMs < 240 && P.nlk < 2 && G.state === 'PLAY' && !REPLAY.on) {
          In.on = false; G.aimHold = 0; REC.act(RA.UP);
          P.nlk = 0;
          const a = Math.atan2(PC.wy() - P.y, PC.wx() - P.x);
          In.buf = 0.22; In.ba = typeof assistAngle === 'function' ? assistAngle(a) : a;
          return;
        }
      }
      return up90(e);
    };

    // Enhance PC.cross() with Reactive Target-Lock Reticle
    const cr0 = PC.cross.bind(PC);
    PC.cross = function () {
      cr0();
      try { PCHud90.drawReticle(); } catch (e) {}
    };
  };

  if (typeof PC !== 'undefined' && PC.init) {
    const pi90 = PC.init.bind(PC);
    PC.init = function () {
      const r = pi90.apply(this, arguments);
      wirePCMouse90();
      return r;
    };
    // Also wire immediately if PC.init already ran
    if (PC.isPC || Store.data) wirePCMouse90();
  }

  // 3. Hook sim() for smooth WASD free movement
  const sim90 = sim;
  sim = function (dt, rd) {
    const r = sim90(dt, rd);
    try { PCMaster90.stepWASD(dt); } catch (e) {}
    return r;
  };

  // 4. Hook R3.syncCam for smooth Mouse-Lead Lookahead Camera
  if (typeof R3 !== 'undefined' && R3.syncCam) {
    const sc90 = R3.syncCam.bind(R3);
    R3.syncCam = function () {
      const C = typeof GL3D !== 'undefined' && GL3D.cam;
      if (!C || !S90.isDesk() || !S90.on('look90', true) || CALM) return sc90();
      const ox = C.x, oy = C.y;
      C.x = ox + PCMaster90.lookX;
      C.y = oy + PCMaster90.lookY;
      try { return sc90(); } finally { C.x = ox; C.y = oy; }
    };
  }

  // 5. Hook slash() for reticle recoil pulse
  const sl90 = slash;
  slash = function (a) {
    const r = sl90.apply(this, arguments);
    PCHud90.recoil = 1;
    return r;
  };

  // 6. Hook HUD.draw for PC Hotkey Bar, FPS Telemetry & Lookahead smoothing
  const hd90 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try {
      PCMaster90.stepLookahead(rd);
      PCHud90.tick(rd);
    } catch (e) {}
    return hd90(rd);
  };

  // 7. Settings panel for v90 PC EDITION
  if (typeof PC !== 'undefined' && PC.settings) {
    const ps90 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps90(head, cycle, box, s);
      try {
        head('PC EDITION (v90)');
        cycle('WASD Free Movement', 'wasd90', [1, 0], ['ON', 'OFF']);
        cycle('Instant Left-Click Slash', 'instSlash90', [1, 0], ['ON', 'OFF']);
        cycle('Right-Click Iaido Focus', 'rmbIaido90', [1, 0], ['ON', 'OFF']);
        cycle('Ultrawide PC Arena', 'wide90', [1, 0], ['ON', 'OFF']);
        cycle('Mouse Lookahead Camera', 'look90', [1, 0], ['ON', 'OFF']);
        cycle('PC Hotkey Bar', 'bar90', [1, 0], ['ON', 'OFF']);
        cycle('Live FPS / ms Telemetry', 'fps90', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

