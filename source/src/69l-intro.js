/* =====================================================================
   INTRO — an 11-second opening film before the first stage: the city
   at night, the Titan Express crossing it, your hero on a rooftop in
   the rain, the blade lights up, the title slams in. Drawn live from
   the game's own art (no video), in the player's own hero skin.
   Tap to skip ahead; it can be watched again from the story map.
   ===================================================================== */
const INTRO_LINES = [
  [0.4, 'NEO-EDO, 2099.'],
  [1.5, 'KUROGANE OWNS EVERY TRAIN, EVERY STREET, EVERY MIND.'],
  [3.0, 'AT MIDNIGHT, PROJECT BLACKOUT GOES LIVE.'],
  [5.6, 'ONE BLADE STANDS IN ITS WAY.']
];
const INTRO_LEN = 11.2, INTRO_LOGO = 8.4;
const Intro = {
  on: false, t: 0, cb: null, g: null, cv: null, W: 0, H: 0, k: 1, cues: 0, chk: 0,
  play(cb) {
    this.on = true; this.t = 0; this.cb = cb; this.cues = 0;
    UI.show('intro'); this.attach(); Aud.init(); Aud.music('menu');
  },
  attach() {
    const cv = $('inCv'); if (!cv) return; this.cv = cv; const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = Math.max(280, Math.round(r.width || 390)); this.H = Math.max(400, Math.round(r.height || 700));
    cv.width = Math.round(this.W * dpr); cv.height = Math.round(this.H * dpr); this.k = dpr; this.g = cv.getContext('2d');
  },
  tap() { if (!this.on) return; if (this.t < INTRO_LOGO - .2) { this.t = INTRO_LOGO - .2; this.cues = Math.max(this.cues, 3); } else if (this.t > INTRO_LOGO + .8) this.end(); },
  end() {
    if (!this.on) return; this.on = false; Store.data.introSeen = 1; Store.touch();
    const cb = this.cb; this.cb = null; if (cb) cb(); else UI.openStory();
  },
  tick(rd) {
    if (!this.on || UI.cur !== 'intro') return; if (!this.g) this.attach(); if (!this.g) return;
    this.chk -= rd; if (this.chk <= 0) { this.chk = .5; const r = this.cv.getBoundingClientRect(); if (Math.abs(r.width - this.W) > 4 || Math.abs(r.height - this.H) > 4) this.attach(); }
    this.t += rd; this.sound();
    if (this.t >= INTRO_LEN) { this.end(); return; }
    withCtx(this.g, () => { cx.setTransform(this.k, 0, 0, this.k, 0, 0); cx.direction = LANG.rtl ? 'rtl' : 'ltr'; this.draw(); });
  },
  sound() { // one-shot cues on the timeline
    const t = this.t, cue = (i, at, fn) => { if (this.cues === i && t >= at) { this.cues++; try { fn(); } catch (e) { errLog(e); } } };
    cue(0, 2.9, () => { Aud.noise(1.4, .14, 300, 2400, 'bandpass'); Aud.tone(90, 60, 1.2, .08, 'sawtooth'); }); // the train passes
    cue(1, 5.5, () => Aud.sfx('roar'));
    cue(2, 7.6, () => { Aud.wslash(Store.data.weapon, 6); Aud.sfx('clash'); });
    cue(3, INTRO_LOGO, () => { Aud.sfx('od'); vibe('od'); });
    cue(4, INTRO_LOGO + .5, () => Aud.sfx('win'));
  },
  draw() {
    const W = this.W, H = this.H, t = this.t, C = Comic;
    cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
    const fade = Math.min(1, t / .6, (INTRO_LEN - t) / .5);
    cx.save(); cx.globalAlpha = clamp(fade, 0, 1);
    if (t < 2.8) { // 1: the city at night, the camera rising
      const k = t / 2.8, T = THEMES.maglev; cx.save(); cx.translate(0, (1 - k) * 60);
      C.sky(T.sky1, T.sky2, W, H); glow(W * .76, H * .2, 90, T.b1, .3); cx.fillStyle = '#e8fbff'; cx.globalAlpha *= .85; dot(W * .76, H * .2, 18); cx.globalAlpha = clamp(fade, 0, 1);
      C.skyline(W, H, H * .78, T.roof2, T.b2, 3, 10, t, .32); C.skyline(W, H, H * .96, T.roof, T.win || T.rail, 41, 7, t, .42);
      for (let i = 0; i < 5; i++) { const x = W * (.1 + cmRand(i + 50) * .8), y = H * (.45 + cmRand(i + 60) * .3), on = Math.sin(t * (3 + i) + i) > -.4; if (on) glow(x, y, 26, i % 2 ? '#ff2bd6' : '#00f2fe', .55); }
      cx.restore(); C.rain(W, H, t, '#7df9ff');
    } else if (t < 5.4) { // 2: the Titan Express crosses the city
      const k = (t - 2.8) / 2.6, T = THEMES.maglev; C.sky(T.sky1, T.sky2, W, H); C.skyline(W, H, H * .72, T.roof2, T.b2, 9, 9, t, .3);
      const ry = H * .6; cx.strokeStyle = T.rail; cx.lineWidth = 4; glow(W / 2, ry, W * .7, T.rail, .18); cx.beginPath(); cx.moveTo(-10, ry); cx.lineTo(W + 10, ry); cx.stroke();
      const len = W * 2.4, x0 = W + 40 - k * (len + W * 1.2);
      for (let c2 = 0; c2 < 6; c2++) { const x = x0 + c2 * len / 6, w = len / 6 - 8; if (x > W + 10 || x + w < -10) continue; cx.fillStyle = '#0b1030'; cx.fillRect(x, ry - 40, w, 34); cx.fillStyle = T.rail; for (let q = 0; q < 8; q++) cx.fillRect(x + 8 + q * (w - 16) / 8, ry - 32, (w - 16) / 8 - 6, 9); cx.fillStyle = '#ff0844'; cx.fillRect(x, ry - 8, w, 3); }
      if (x0 < W && x0 > -60) glow(x0, ry - 22, 70, '#ffffff', .7); // the headlight
      cx.strokeStyle = '#e8fbff'; cx.globalAlpha *= .35; cx.lineWidth = 2; cx.beginPath(); for (let i = 0; i < 24; i++) { const y = cmRand(i) * H, x = ((cmRand(i + 7) * W - t * 900) % W + W) % W; cx.moveTo(x, y); cx.lineTo(x + 80, y); } cx.stroke(); cx.globalAlpha = clamp(fade, 0, 1);
      C.skyline(W, H * .42, H * 1.04, T.roof, T.win || T.rail, 77, 6, t, .2); C.rain(W, H, t, '#7df9ff');
    } else if (t < 7.9) { // 3: the hero on a rooftop edge, rain, lightning
      const k = (t - 5.4) / 2.5, T = THEMES.maglev; C.sky('#05060f', T.sky2, W, H);
      if (Math.sin(t * 7) > .93 || (t > 6.2 && t < 6.3)) { cx.fillStyle = 'rgba(200,230,255,.35)'; cx.fillRect(0, 0, W, H); }
      C.skyline(W, H, H * .8, T.roof2, T.b2, 21, 8, t, .25);
      cx.fillStyle = '#080b1c'; cx.fillRect(-10, H * .74, W + 20, H); cx.strokeStyle = '#00f2fe'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-10, H * .74); cx.lineTo(W + 10, H * .74); cx.stroke();
      const s = Math.min(W / 70, H / 110) * (1 + k * .15), hx = W * .5, hy = H * .62;
      const sc = this.sc || (this.sc = new Float32Array(20)), ss = s * .55; for (let i = 0; i < 10; i++) { sc[i * 2] = -i * 4.2 + Math.sin(t * 7 + i * .8) * i * .5; sc[i * 2 + 1] = 7 + i * 1.6 + Math.sin(t * 9 + i) * i * .35; } // the scarf streams in the wind
      const sk = skinLook(Store.data.skin); heroSetSkin(HO, sk);
      cx.save(); cx.translate(hx, hy); cx.scale(ss, ss); drawHeroTrail(HO.body, sc, HO.ca, HO.cb); cx.restore();
      C.hero(hx, hy, s * .55, -Math.PI / 2 + Math.sin(t) * .05, false, -Math.PI / 2 + 1.8, sk, t);
      C.rain(W, H, t, '#7df9ff'); C.rain(W, H, t + 3.3, '#bfe6ff');
    } else { // 4: the blade lights up, one huge slash, the title
      const k = t - 7.9; cx.fillStyle = '#05060f'; cx.fillRect(0, 0, W, H);
      C.speed(W, H, W / 2, H * .45, t, '#00f2fe');
      if (k < .5) { const a = k / .5; cx.strokeStyle = '#ffffff'; cx.lineWidth = 10 * (1 - a) + 2; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(-20, H * (.75 - a * .1)); cx.lineTo(W * a * 1.2, H * (.75 - a * .5)); cx.stroke(); glow(W * a, H * (.75 - a * .5), 120, '#00f2fe', .8); }
      if (k > .45 && k < .75) { cx.fillStyle = '#ffffff'; cx.globalAlpha = (1 - (k - .45) / .3) * .9; cx.fillRect(0, 0, W, H); cx.globalAlpha = clamp(fade, 0, 1); }
      if (t >= INTRO_LOGO) this.logo(W, H, t - INTRO_LOGO);
    }
    cx.restore();
    const bar = Math.round(H * .09); cx.fillStyle = '#000'; cx.fillRect(0, 0, W, bar); cx.fillRect(0, H - bar, W, bar); // letterbox
    for (const [at, s] of INTRO_LINES) { // captions, typed out
      const end = (INTRO_LINES.find(q => q[0] > at) || [INTRO_LOGO - .1])[0];
      if (t < at || t > end + .25) continue;
      const a = Math.min(1, (t - at) / .3, (end + .25 - t) / .3), txt = lt(s), n = Math.floor((t - at) * 45);
      cx.globalAlpha = a; cx.fillStyle = '#e8fbff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = '700 ' + (s.length < 20 ? 22 : 15) + 'px ' + FONT_D;
      const lines = C.wrap(txt, W - 48); let left = n;
      lines.forEach((l, i) => { const sh = left >= l.length ? l : l.slice(0, Math.max(0, left)); left -= l.length + 1; if (sh) cx.fillText(sh, W / 2, H - bar - 40 - (lines.length - 1 - i) * 22); });
      cx.globalAlpha = 1;
    }
    if (t < INTRO_LOGO - .3) { cx.globalAlpha = .55; cx.fillStyle = '#8fa4c8'; cx.font = '700 11px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(lt('TAP TO SKIP'), W / 2, H - bar / 2); cx.globalAlpha = 1; }
  },
  logo(W, H, k) {
    const s = 1 + Math.max(0, 1 - k * 4) * 1.4, y = H * .44, fs = Math.min(64, W / 6.2);
    cx.save(); cx.translate(W / 2, y); cx.scale(s, s); cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.font = 'italic 700 ' + Math.round(fs) + 'px ' + FONT_D; const gl = Math.sin(k * 40) > .85 ? 4 : 1.5;
    cx.direction = 'ltr';
    cx.fillStyle = '#ff0844'; cx.fillText('OVERDRIVE', -gl, 0); cx.fillStyle = '#00f2fe'; cx.fillText('OVERDRIVE', gl, 0); cx.fillStyle = '#e8fbff'; cx.fillText('OVERDRIVE', 0, 0);
    cx.font = '700 ' + Math.round(fs * .3) + 'px ' + FONT_D; cx.fillStyle = '#ff0844'; cx.fillText('C Y B E R   S L A S H', 0, fs * .72);
    cx.restore();
    cx.fillStyle = '#ff0844'; const lw = Math.min(1, k * 2) * W * .6; cx.fillRect(W / 2 - lw / 2, y + fs * .98, lw, 3);
    if (k > .8) { cx.globalAlpha = .55 + .35 * Math.sin(k * 5); cx.fillStyle = '#ffd23f'; cx.font = '700 13px ' + FONT_M; cx.textAlign = 'center'; cx.fillText(lt('TAP TO BEGIN'), W / 2, H * .7); cx.globalAlpha = 1; }
  }
};
