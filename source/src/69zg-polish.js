/* ---------------- POLISH — wet roofs, screen transitions, counting results, Overdrive bursts, material sounds ----------------
   Drawing and sound only: nothing here is read by the simulation. */
const Polish = {
  od0: 0, odT: 0, bossD: 0, gk: '', gc: null,
  grads(L, R, rail) {
    const k = L + ':' + R + ':' + rail; if (this.gk === k && this.gc) return this.gc; this.gk = k;
    const l = cx.createLinearGradient(L, 0, L + 60, 0); l.addColorStop(0, rail); l.addColorStop(1, 'rgba(0,0,0,0)');
    const r = cx.createLinearGradient(R, 0, R - 60, 0); r.addColorStop(0, rail); r.addColorStop(1, 'rgba(0,0,0,0)');
    const s = cx.createLinearGradient(0, -120, 0, 120); s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(.5, 'rgba(170,200,255,.05)'); s.addColorStop(1, 'rgba(255,255,255,0)');
    return (this.gc = { l, r, s });
  },
  /* the roof: a slow wet sheen, rail-light reflections and drifting neon fog */
  roof() {
    if (CALM || Q.lvl < 1) return;
    const L = V.L, R = V.R, H = V.VH, t = BG.t || 0, T = BG.T || {}, rail = T.rail || '#00f2fe';
    cx.save(); cx.globalCompositeOperation = 'lighter';
    const G0 = this.grads(L, R, rail); // built once per arena size and rail color
    cx.globalAlpha = .07; cx.fillStyle = G0.l; cx.fillRect(L, 0, 60, H); cx.fillStyle = G0.r; cx.fillRect(R - 60, 0, 60, H);
    const y = ((t * 26) % (H + 300)) - 150;
    cx.globalAlpha = 1; cx.fillStyle = G0.s; cx.save(); cx.beginPath(); cx.rect(L, 0, R - L, H); cx.clip(); cx.translate(V.CX, y); cx.rotate(-.35); cx.fillRect(L - 200 - V.CX, -120, R - L + 400, 240); cx.restore();
    if (Q.lvl >= 2) for (let i = 0; i < 3; i++) { const fx = L + (R - L) * (.2 + .3 * i) + Math.sin(t * .3 + i * 2) * 40, fy = (H * (.25 + .3 * i) + t * 14 * (i + 1)) % (H + 200) - 100; glow(fx, fy, 160, i === 1 ? '#ff2bd6' : rail, .035); }
    cx.restore();
  },
  /* screens slide and fade in, their cards one after another */
  enter(id) {
    const s = $('s-' + id); if (!s || id === 'photo' || id === 'comic') return;
    s.classList.remove('enter'); void s.offsetWidth; s.classList.add('enter');
    clearTimeout(this.et); this.et = setTimeout(() => s.classList.remove('enter'), 900);
  },
  /* result numbers count up (the final text is there from the start for screen readers) */
  countUp() {
    const bs = document.querySelectorAll('#rsStats b'); const t0 = performance.now(), D = 850;
    const items = []; bs.forEach(b => { const m = /^([+x]?)([\d,]+)$/.exec(b.textContent.trim()); if (!m) return; const v = +m[2].replace(/,/g, ''); if (!(v > 0)) return; b.classList.add('cnt'); items.push([b, m[1], v]); });
    if (!items.length) return;
    const step = now => { const p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3);
      for (const [b, pre, v] of items) b.dataset.show = pre + fmtNum(Math.round(v * e));
      if (p < 1 && UI.cur === 'result') requestAnimationFrame(step); else for (const [b] of items) b.classList.remove('cnt'); };
    requestAnimationFrame(step);
  },
  /* Overdrive: a burst of speed lines when it starts, an aura while it lasts */
  od(rd) {
    if (!inRun()) { this.od0 = 0; return; }
    const on = G.odT > 0;
    if (on && !this.od0) this.odT = .6;
    this.od0 = on ? 1 : 0;
    if (CALM || Juice.flashMode() === 'off') return;
    const k = V.s * V.dpr;
    if (on) { cx.save(); W3D.flatT(k); cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { const a = CAM.t * (3 + i) + i * 2.1, r = 26 + i * 7; cx.globalAlpha = .35 - i * .08; cx.beginPath(); cx.arc(P.x, P.y, r, a, a + Math.PI * 1.2); cx.stroke(); } cx.restore(); }
    if (this.odT > 0) { this.odT -= rd; const p = 1 - this.odT / .6, W = cv.width, Hh = cv.height, q = W3D.proj(P.x, P.y, 20), sx = q[0], sy = q[1], R = Math.hypot(W, Hh);
      cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = (1 - p) * .8; cx.strokeStyle = '#ffd23f';
      for (let i = 0; i < 40; i++) { const a = i / 40 * TAU + cmRand(i) * .1, r0 = (40 + p * 500 + cmRand(i * 3) * 120) * k; cx.lineWidth = (2 + 3 * cmRand(i * 7)) * k; cx.beginPath(); cx.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); cx.lineTo(sx + Math.cos(a) * R, sy + Math.sin(a) * R); cx.stroke(); }
      cx.restore(); }
  },
  /* the last shield: the screen edges pulse red with the heartbeat (soft with SOFT flashes or calm effects, none with flashes OFF) */
  lastSpr: null,
  last(rd) {
    if (Juice.flashMode() === 'off') { this.lastA = 0; return; }
    const on = inRun() && G.state === 'PLAY' && P.hp === 1 && P.maxHp > 1 && G.mode !== 'dojo';
    this.lastA = damp(this.lastA || 0, on ? 1 : 0, on ? 3 : 6, rd); if (this.lastA < .02) return;
    if (!this.lastSpr) { const c = this.lastSpr = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 26, 64, 64, 66);
      r.addColorStop(0, 'rgba(255,8,68,0)'); r.addColorStop(.55, 'rgba(255,8,68,.14)'); r.addColorStop(1, 'rgba(255,8,68,.85)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }
    const t = (CAM.t * 1.15) % 1, beat = Math.max(Math.exp(-t * 9), .7 * Math.exp(-Math.max(0, t - .22) * 9) * (t > .22 ? 1 : 0)); // lub-dub
    const soft = CALM || Juice.flashMode() === 'soft' ? .5 : 1;
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = this.lastA * soft * (.22 + .3 * beat); cx.drawImage(this.lastSpr, -cv.width * .04, -cv.height * .04, cv.width * 1.08, cv.height * 1.08); cx.restore();
  },
  /* kills sound like what they are made of; a boss going down gets a moment of silence first */
  material(e) {
    if (!Aud.c || Aud.quiet || !Aud.gate('mat', 45)) return;
    const T = ET, t = e.type;
    if (t === T.BRUTE || t === T.ENFORCER || t === T.WARDEN || t === T.MIRROR) { Aud.tone(1400, 900, .16, .05, 'triangle'); Aud.tone(2100, 1500, .1, .03, 'square'); } // metal
    else if (t === T.PHANTOM || t === T.WRAITH || t === T.MIMIC) Aud.noise(.3, .06, 2400, 300, 'bandpass'); // a ghostly whoosh
    else if (t === T.BOMBER || t === T.SPLITTER) Aud.noise(.22, .09, 900, 120, 'lowpass');
    else Aud.tone(900, 180, .09, .04, 'sawtooth'); // circuits
  },
  boss() {
    const b = Boss.cur, d = !!(b && b.dying > 0);
    if (d && !this.bossD && Aud.c && Aud.musBus && !Aud.quiet) { try { const g = Aud.musBus.gain, now = Aud.c.currentTime, v = g.value; g.cancelScheduledValues(now); g.setValueAtTime(v, now); g.linearRampToValueAtTime(v * .08, now + .05); g.setValueAtTime(v * .08, now + .45); g.linearRampToValueAtTime(v, now + 1.2); Aud.tone(60, 30, 1.1, .12, 'sine'); } catch (e) { errLog(e); } }
    this.bossD = d ? 1 : 0;
  }
};
{
  const bg0 = BG.draw.bind(BG); BG.draw = function (arena) { bg0(arena); if (arena) try { Polish.roof(); } catch (e) { errLog(e); } };
  const show0 = UI.show.bind(UI); UI.show = function (id) { const prev = this.cur; show0(id); if (id && id !== prev) try { Polish.enter(id); } catch (e) { errLog(e); } };
  const res0 = UI.openResult.bind(UI); UI.openResult = function (o) { const r = res0(o); try { Polish.countUp(); } catch (e) { errLog(e); } return r; };
  Pipe.on('post', 'polish', rd => { if (!(REPLAY.on && REPLAY.fast) && !G.photo) { Polish.od(rd); Polish.boss(); Polish.last(rd); } }, 30);
  const dth0 = EAnim.death.bind(EAnim); EAnim.death = function (e, a) { dth0(e, a); try { Polish.material(e); } catch (er) { errLog(er); } };
}
