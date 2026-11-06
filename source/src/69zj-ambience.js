/* ---------------- AMBIENCE — rain, the train under your feet, thunder, a music hall ----------------
   Sound only (never touches the simulation or the seeded RNG).
   - RAIN: in every rainy place a soft hiss of rain with heavier gusts, louder
     during a run than in the menus.
   - THE TRAIN: on the train roofs a low rumble and the clack-clack of the rail
     joints, faster as the run speeds up.
   - THUNDER: every lightning flash in a storm rolls a thunderclap after it.
   - MUSIC: a hall reverb so the soundtrack sounds wide and deep.
   - IMPACT: critical kills add a sub-bass thump. */
const TRAIN_THEMES = { maglev: 1, undercity: 1, ghost: 1, spire: 1, core: 1, storm: 1, harbor: 1, temple: 1, summit: 1, sakura: 1, abyss: 1, ruins: 1, origin: 1, winter: 1, parade: 1, apex: 1 };
const Amb = {
  ok: false, rain: null, train: null, clackT: 0, fl0: 0, cr0: 0, gust: 0,
  setup() {
    const A = Aud, c = A.c; if (this.ok || !c || !A.nb) return; this.ok = true;
    try {
      const mk = (f1, type, q) => { const s = c.createBufferSource(); s.buffer = A.nb; s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = f1; f.Q.value = q || .7; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(A.sfxBus); s.start(0, Math.random()); return { s, f, g }; };
      this.rain = mk(2600, 'bandpass', .5); this.rain2 = mk(7000, 'highpass', .5); this.train = mk(120, 'lowpass', 1.2);
      // a hall reverb for the music: decaying stereo noise as the impulse
      const len = Math.floor(c.sampleRate * 2.4), ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      const cv = c.createConvolver(); cv.buffer = ir; const wet = c.createGain(); wet.gain.value = .22; A.md.connect(cv); cv.connect(wet); wet.connect(A.out); this.wet = wet;
    } catch (e) { errLog(e); }
  },
  set(node, v) { if (!node) return; try { node.g.gain.setTargetAtTime(v, Aud.c.currentTime, .4); } catch (e) { errLog(e); } },
  tick(rd) {
    const A = Aud; if (!A.c || A.c.state !== 'running') return; this.setup(); if (!this.rain) return;
    const T = BG.T || {}, run = typeof inRun === 'function' && inRun(), on = !A.quiet && (+Store.data.settings.sfx || 0) > 0;
    const paused = G.state === 'PAUSE' || G.photo;
    this.gust = Math.max(0, this.gust - rd); if (T.rain && Math.random() < rd * .08) this.gust = 1.2 + Math.random();
    const rv = !on || !T.rain ? 0 : (run ? (paused ? .05 : .12) : .07) * (1 + (this.gust > 0 ? .6 : 0));
    this.set(this.rain, rv); this.set(this.rain2, rv * .35);
    const train = on && run && TRAIN_THEMES[BG.theme] && G.mode !== 'highway' && !paused, spd = 1 + Math.min(1, (G.time || 0) / 240);
    this.set(this.train, train ? .16 : 0);
    if (train) { this.clackT -= rd * spd; if (this.clackT <= 0) { this.clackT = .95; const t = A.c.currentTime; A.tone(95, 55, .06, .07, 'triangle', t); A.tone(90, 50, .06, .06, 'triangle', t + .12); A.noise(.04, .05, 1800, 600, 'bandpass', t); } }
    // thunder after a lightning flash
    const fl = BG.flash || 0; if (on && T.rain && fl > .7 && this.fl0 <= .7) { const t = A.c.currentTime + .25 + Math.random() * .6; A.noise(1.8, .22, 260, 40, 'lowpass', t); A.tone(48, 30, 1.6, .12, 'sine', t); }
    this.fl0 = fl;
    // critical kills: a sub-bass thump
    const cr = G.crits | 0; if (run && cr > this.cr0 && on && A.gate('subthump', 90)) A.tone(58, 34, .22, .16, 'sine'); this.cr0 = cr;
  }
};
Pipe.on('post', 'ambience', rd => Amb.tick(rd), 40);
