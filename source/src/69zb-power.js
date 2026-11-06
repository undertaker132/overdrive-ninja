/* ---------------- BATTERY SAVER ----------------
   ON: the screen is drawn at 30 frames a second and effects drop a level
   (the game itself still runs its fixed 60 Hz steps, so nothing plays
   differently and replays stay exact). AUTO turns it on by itself when the
   phone is unplugged at 20% battery or less, or in the system's power-saving
   mode signals we can read. */
const Power = {
  bat: null, auto: false, lt: 0, told: 0,
  mode() { const m = Store.data && Store.data.settings && Store.data.settings.bat; return m === 'on' || m === 'off' ? m : 'auto'; },
  on() { const m = this.mode(); return m === 'on' || (m === 'auto' && this.auto); },
  check() {
    const b = this.bat, was = this.auto; this.auto = !!(b && !b.charging && b.level <= .2);
    if (this.auto && !was && this.mode() === 'auto' && !this.told) { this.told = 1; try { toastDom(lt('BATTERY SAVER ON: LOW BATTERY')); } catch (e) { errLog(e); } }
    if (!this.on()) try { Q.applied = 0; const m = Store.data.settings.fx; setQuality(m === 'low' ? 0 : m === 'high' ? 2 : Q.lvl); } catch (e) { errLog(e); }
  },
  note() { const m = this.mode(); return m === 'auto' ? (this.bat ? ltf('Battery {0}% · {1}', Math.round(this.bat.level * 100), this.bat.charging ? lt('charging') : this.auto ? lt('saver is on') : lt('saver turns on at 20%')) : lt('Turns on at 20% battery, where the phone tells us.')) : m === 'on' ? lt('30 FPS and lighter effects: longer battery life.') : ''; },
  init() {
    try { if (navigator.getBattery) navigator.getBattery().then(b => { this.bat = b; const f = () => this.check(); b.addEventListener('levelchange', f); b.addEventListener('chargingchange', f); f(); }).catch(() => { }); } catch (e) { errLog(e); }
  }
};
{
  const frame0 = frame;
  frame = function (t) { // battery saver: skip every other display frame; the next one catches the simulation up
    if (Power.on() && t - Power.lt < 30 && t >= Power.lt) { requestAnimationFrame(frame); return; }
    Power.lt = t; frame0(t);
  };
  const gov0 = governor;
  governor = function (rd) {
    if (!Power.on()) return gov0(rd);
    Q.acc += rd; Q.n++; if (Q.acc >= 1.25) { Q.fps = Q.n / Q.acc; Q.acc = 0; Q.n = 0; }
    if (Q.lvl > 1 || !Q.applied) setQuality(Math.min(1, Store.data.settings.fx === 'low' ? 0 : 1));
  };
  Power.init();
}
