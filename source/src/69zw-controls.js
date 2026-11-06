/* =====================================================================
   CONTROLS (v32)
   AIM JOYSTICK (Settings > CONTROLS, off by default): a stick drawn above
   the skill buttons. Push the knob the way you want to strike and let go
   to slash; dragging anywhere else on the screen still works as before.
   It feeds the same input path as touch (In), so replays stay exact.
   CONTROLLER: a pad already plugged in is found without waiting for the
   browser's connect event, and Settings shows its status and the button
   map (the pad's rumble: PC.rumble, version 34).
   ===================================================================== */
const Stick = {
  R: 58, kx: 0, ky: 0,
  enabled() { const s = Store.data && Store.data.settings; return !!(s && s.stick); },
  center() { // css pixels on the game canvas: above the skill buttons, on the thumb's side
    const s = Store.data.settings, R = this.R, dock = UI.dockH || 70;
    return [s.lefty ? V.W - (R + 30 + (V.insR || 0) * V.s) : R + 30 + (V.insL || 0) * V.s, V.H - dock - R - 30];
  },
  hit(e) { const c = this.center(); return Math.hypot(e.clientX - In.ox - c[0], e.clientY - In.oy - c[1]) <= this.R + 26; },
  draw() {
    const c = this.center(), R = this.R, act = In.on && In.stk, m = Math.hypot(this.kx, this.ky), k = act && m > R ? R / m : 1, kx = act ? this.kx * k : 0, ky = act ? this.ky * k : 0;
    const ready = P.ch > 0 || G.odT > 0, col = ready ? '#00f2fe' : '#ff9a3d';
    cx.save(); cx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0); cx.globalAlpha = act ? .95 : .55;
    cx.fillStyle = 'rgba(6,10,26,.45)'; cx.beginPath(); cx.arc(c[0], c[1], R, 0, TAU); cx.fill();
    cx.strokeStyle = col; cx.lineWidth = 2; cx.beginPath(); cx.arc(c[0], c[1], R, 0, TAU); cx.stroke();
    cx.globalAlpha *= .5; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(c[0], c[1], R * .55, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = act ? .95 : .55;
    if (act && m > 4) { const a = Math.atan2(ky, kx); cx.strokeStyle = col; cx.lineWidth = 3; cx.beginPath(); cx.arc(c[0], c[1], R + 6, a - .35, a + .35); cx.stroke(); } // which way the slash goes
    const g = cx.createRadialGradient(c[0] + kx - 6, c[1] + ky - 6, 2, c[0] + kx, c[1] + ky, 26); g.addColorStop(0, '#ffffff'); g.addColorStop(.35, col); g.addColorStop(1, 'rgba(0,40,60,.9)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(c[0] + kx, c[1] + ky, 24, 0, TAU); cx.fill();
    cx.restore();
  }
};
{
  const d0 = In.down.bind(In), m0 = In.move.bind(In), u0 = In.up.bind(In);
  In.down = function (e) {
    this.stk = 0; if (!Stick.enabled() || G.state !== 'PLAY' || REPLAY.on || !Stick.hit(e)) return d0(e);
    d0(e); if (!this.on) return; // (a tutorial tap or a finisher tap does not start an aim)
    const c = Stick.center(); this.stk = 1; Stick.kx = e.clientX - this.ox - c[0]; Stick.ky = e.clientY - this.oy - c[1];
    this.pos({ clientX: c[0] + this.ox, clientY: c[1] + this.oy }); this.sx = this.px; this.sy = this.py; // the aim starts at the stick's center
    this.pos(e); this.cx = this.px; this.cy = this.py; lockScan();
  };
  In.move = function (e) { if (this.on && this.stk && e.pointerId === this.id) { const c = Stick.center(); Stick.kx = e.clientX - this.ox - c[0]; Stick.ky = e.clientY - this.oy - c[1]; } return m0(e); };
  In.up = function (e) { if (this.stk && (!e || e.pointerId === this.id)) { this.t0 = -1e9; this.stk = 0; } return u0(e); }; // a stick that was not pushed does nothing (no tap-dash)
  Pipe.on('post', 'stick', () => { if (Stick.enabled() && inRun() && G.state === 'PLAY' && !G.photo && !REPLAY.on) Stick.draw(); }, 27);
}
/* ---- the controller ---- */
{
  const p0 = Pad.poll.bind(Pad);
  Pad.scanT = 0;
  Pad.poll = function (rd) {
    if (!this.on && navigator.getGamepads && (this.scanT -= rd) <= 0) { this.scanT = 1; // a pad that was plugged in before the game started
      try { const L = navigator.getGamepads() || []; for (const gp of L) if (gp && gp.connected !== false && gp.buttons && gp.buttons.length >= 4) { this.idx = gp.index; this.on = true; this.name = gp.id || 'Controller'; toast(lt('CONTROLLER CONNECTED'), '#00ff88'); break; } } catch (e) { errLog(e); } }
    return p0(rd);
  };
  Pad.rumble = function (ms, strong) { // the pad's own vibration, when it has one
    if (!this.on || !navigator.getGamepads) return; try { const gp = navigator.getGamepads()[this.idx], va = gp && gp.vibrationActuator; if (va && va.playEffect) va.playEffect(va.type || 'dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: Math.min(1, strong + .2) }).catch(() => { }); } catch (e) { errLog(e); }
  };
}
