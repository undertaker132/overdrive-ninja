/* =====================================================================
   GAMEPAD — any standard controller (Xbox, PlayStation, Switch Pro,
   8BitDo, GameSir, leverless/hitbox boards in XInput mode...). Polled
   once per frame, the same rate the game simulates at.
   In a run:  left stick aims · A slash/dash · hold LT to aim in slow
              motion, release to slash · X grapple · Y hijack · B laser
              web · LB time echo · RB overdrive · START pause
   In menus:  stick / d-pad move between buttons · A press · B back
   The pad drives the same input path as touch (In), so replays and
   ghosts record pad play exactly like finger play.
   ===================================================================== */
const Pad = {
  on: false, idx: -1, prev: [], ax: 0, ay: 0, aiming: false, navT: 0, focus: null, name: '',
  init() {
    window.addEventListener('gamepadconnected', e => { this.idx = e.gamepad.index; this.on = true; this.name = e.gamepad.id || 'Controller'; try { toast(lt('CONTROLLER CONNECTED'), '#00ff88'); } catch (er) { errLog(er); } });
    window.addEventListener('gamepaddisconnected', e => { if (e.gamepad.index === this.idx) { this.on = false; this.idx = -1; if (this.aiming) this.aimEnd(); } });
  },
  btn(gp, i) { const b = gp.buttons[i]; return !!(b && (b.pressed || b.value > .5)); },
  pressed(gp, i) { const now = this.btn(gp, i), was = !!this.prev[i]; return now && !was; },
  released(gp, i) { const now = this.btn(gp, i), was = !!this.prev[i]; return !now && was; },
  poll(rd) {
    if (!this.on || !navigator.getGamepads) return;
    const gp = navigator.getGamepads()[this.idx]; if (!gp) return;
    let x = gp.axes[0] || 0, y = gp.axes[1] || 0; const m = Math.hypot(x, y); if (m < .22) { x = 0; y = 0; }
    if (this.btn(gp, 14)) x = -1; if (this.btn(gp, 15)) x = 1; if (this.btn(gp, 12)) y = -1; if (this.btn(gp, 13)) y = 1; // d-pad
    this.ax = x; this.ay = y;
    if (G.state === 'PLAY' && !REPLAY.on) this.game(gp); else this.menu(gp, rd);
    for (let i = 0; i < gp.buttons.length; i++) this.prev[i] = this.btn(gp, i);
  },
  dir() { if (this.ax || this.ay) return Math.atan2(this.ay, this.ax); return P.face; },
  aimStart() {
    if (In.on) return; Aud.init(); this.aiming = true;
    if (Tut.cur) { Tut.dismiss(); this.aiming = false; return; }
    In.on = true; In.id = 'pad'; In.sx = In.cx = 0; In.sy = In.cy = 0; In.t0 = performance.now() - 1000; P.nlk = 0; G.aimHold = 0; REC.act(RA.DOWN);
  },
  aimMove() { if (!this.aiming || !In.on) return; const a = this.dir(); In.cx = Math.cos(a) * 120; In.cy = Math.sin(a) * 120; },
  aimEnd() { if (!this.aiming) return; this.aiming = false; if (!In.on) return; this.aimMove(); In.up(); },
  game(gp) {
    if (this.pressed(gp, 9)) { Flow.togglePause(); return; }
    if (Tut.cur && this.pressed(gp, 0)) { Tut.dismiss(); return; }
    if (this.btn(gp, 6)) { if (!this.aiming) this.aimStart(); this.aimMove(); } // LT: hold to aim in slow motion
    else if (this.aiming) this.aimEnd();
    if (this.pressed(gp, 0) && !this.aiming) { this.aimStart(); this.aimMove(); this.aimEnd(); } // A: an instant slash toward the stick
    if (this.pressed(gp, 7) && !this.aiming) { this.aimStart(); this.aimMove(); this.aimEnd(); } // RT: the same, for trigger players
    if (this.pressed(gp, 2)) useSkill('grapple'); if (this.pressed(gp, 3)) useSkill('hijack');
    if (this.pressed(gp, 1)) useSkill('web'); if (this.pressed(gp, 4)) useSkill('echo');
    if (this.pressed(gp, 5)) overdrive();
    if (Boss.cur && Boss.cur.stag > 0 && this.pressed(gp, 0)) Boss.zanTap(Boss.cur.x, Boss.cur.y); // zandatsu finishers
  },
  menu(gp, rd) {
    if (G.state === 'DIALOG' && (this.pressed(gp, 0) || this.pressed(gp, 1))) { Dlg.next(); return; }
    if (UI.cur === 'comic' && this.pressed(gp, 0)) { Comic.tap(); return; }
    if (G.state === 'PAUSE' && this.pressed(gp, 9)) { Flow.togglePause(); return; }
    const list = [...document.querySelectorAll('#ov section:not(.hidden) button:not([disabled]), #ov section:not(.hidden) .item[role=button]')].filter(b => b.offsetParent !== null);
    if (!list.length) return;
    if (this.focus && !list.includes(this.focus)) this.focus = null;
    this.navT -= rd;
    if ((this.ax || this.ay) && this.navT <= 0) {
      this.navT = .18; const cur = this.focus || document.activeElement; let i = list.indexOf(cur);
      if (i < 0) i = 0; else { // spatial: the nearest button in the stick direction
        const r0 = cur.getBoundingClientRect(), cx0 = r0.left + r0.width / 2, cy0 = r0.top + r0.height / 2; let best = -1, bd = 1e9;
        list.forEach((b, j) => { if (j === i) return; const r = b.getBoundingClientRect(), dx = r.left + r.width / 2 - cx0, dy = r.top + r.height / 2 - cy0, along = dx * this.ax + dy * this.ay; if (along <= 4) return; const d = Math.hypot(dx, dy) + Math.abs(dx * this.ay - dy * this.ax) * 1.5; if (d < bd) { bd = d; best = j; } });
        if (best >= 0) i = best;
      }
      this.focus = list[i]; try { this.focus.focus({ preventScroll: false }); this.focus.scrollIntoView({ block: 'nearest' }); } catch (e) { errLog(e); } Aud.sfx('tick');
    }
    if (!this.ax && !this.ay) this.navT = 0;
    if (this.pressed(gp, 0)) { const b = this.focus || (document.activeElement && list.includes(document.activeElement) ? document.activeElement : null) || list[0]; if (b) b.click(); }
    if (this.pressed(gp, 1)) { const back = document.querySelector('#ov section:not(.hidden) [data-back]'); if (back) back.click(); }
  }
};
