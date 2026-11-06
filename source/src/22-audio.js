/* =====================================================================
   AUDIO — procedural synth. Voice ledger (polyphony limiter that never
   depends on onended), per-sound rate limits, one shared noise buffer,
   lookahead music sequencer whose key rises with the combo rank.
   ===================================================================== */
const Aud = {
  c: null, out: null, sfxBus: null, musBus: null, nb: null, ends: new Float64Array(14), mends: new Float64Array(8),
  last: {}, lastSay: 0, intensity: 0, shift: 0, mf: null, md: null, duckV: 1, filtV: 20000, quiet: false, // quiet: a replay checked in the background
  mus: { on: false, id: '', tr: null, step: 0, next: 0, timer: 0, pending: '' },
  de: new Float64Array(12), me: new Float64Array(22), pe: new Float64Array(10), // music voice ledgers: drums, melody, pads
  init() {
    try {
      if (!this.c) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.c = new AC();
        const comp = this.c.createDynamicsCompressor();
        comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 5; comp.attack.value = .003; comp.release.value = .18;
        this.out = this.c.createGain(); this.out.gain.value = .9;
        this.sfxBus = this.c.createGain(); this.musBus = this.c.createGain();
        this.mf = this.c.createBiquadFilter(); this.mf.type = 'lowpass'; this.mf.frequency.value = 20000; this.mf.Q.value = .7; // pause/tutorial muffle
        this.md = this.c.createGain(); this.md.gain.value = 1; // dialogue ducking
        this.sfxBus.connect(comp); this.musBus.connect(this.mf); this.mf.connect(this.md); this.md.connect(comp); comp.connect(this.out); this.out.connect(this.c.destination);
        const n = this.c.sampleRate | 0, b = this.c.createBuffer(1, n, this.c.sampleRate), ch = b.getChannelData(0);
        for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
        this.nb = b; this.setVol();
      }
      if (this.c.state === 'suspended') this.c.resume();
    } catch (e) { this.c = null; }
  },
  setVol() {
    if (!this.c) return; const s = Store.data.settings;
    this.sfxBus.gain.value = s.sfx; this.musBus.gain.value = s.music * .55;
  },
  slot(arr, t, d) { // returns true when a voice slot is free (ledger of end times)
    for (let i = 0; i < arr.length; i++) if (arr[i] <= t) { arr[i] = t + d; return true; }
    return false;
  },
  gate(name, gap) { const now = performance.now(); if (now - (this.last[name] || 0) < gap) return false; this.last[name] = now; return true; },
  tone(f1, f2, d, v, type, when, bus) {
    const c = this.c; if (!c || c.state !== 'running') return;
    const t = when || c.currentTime, m = bus === 1;
    if (!this.slot(m ? this.mends : this.ends, t, d + .03)) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(Math.max(25, f1), t);
    if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(Math.max(25, f2), t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(m ? this.musBus : this.sfxBus);
    o.onended = () => { o.disconnect(); g.disconnect(); };
    o.start(t); o.stop(t + d + .02);
  },
  noise(d, v, f1, f2, ft, when, bus) {
    const c = this.c; if (!c || c.state !== 'running') return;
    const t = when || c.currentTime, m = bus === 1;
    if (!this.slot(m ? this.mends : this.ends, t, d + .03)) return;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.nb; f.type = ft || 'lowpass';
    f.frequency.setValueAtTime(f1, t); if (f2 !== f1) f.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f); f.connect(g); g.connect(m ? this.musBus : this.sfxBus);
    s.onended = () => { s.disconnect(); f.disconnect(); g.disconnect(); };
    s.start(t, Math.random() * .4, d + .05);
  },
  sfx(n, p) {
    if (!this.c || this.quiet) return; p = p || 0;
    switch (n) {
      case 'slash': this.wslash(typeof P !== 'undefined' && P.w ? P.w.id : 'katana', p); break;
      case 'hit': if (!this.gate(n, 30)) return; this.tone(p ? 520 : 340, p ? 260 : 170, .1, p ? .16 : .12, 'square'); if (p) this.noise(.08, .1, 3000, 800, 'bandpass'); break;
      case 'kill': if (!this.gate(n, 35)) return; { const f = 300 * Math.pow(1.0595, Math.min(p, 30)); this.tone(f, f * 1.5, .13, .14, 'sine'); this.tone(f * 2, f * 3, .07, .05, 'triangle'); } break;
      case 'parry': if (!this.gate(n, 50)) return; this.tone(980, 1960, .16, .17, 'triangle'); this.tone(1470, 735, .14, .12, 'sine'); if (p) this.tone(2637, 2637, .45, .06, 'sine'); break;
      case 'graze': if (!this.gate(n, 60)) return; this.tone(760, 1150, .07, .07, 'sine'); break;
      case 'boom': if (!this.gate(n, 70)) return; this.noise(p ? .6 : .32, p ? .32 : .22, 1100, 70); this.tone(120, 30, p ? .5 : .28, p ? .28 : .2, 'sine'); break;
      case 'coin': if (!this.gate(n, 45)) return; this.tone(990, 1480, .05, .05, 'sine'); break;
      case 'hurt': this.tone(200, 50, .3, .22, 'sawtooth'); this.noise(.25, .2, 900, 120); break;
      case 'ui': if (!this.gate(n, 40)) return; this.tone(620, 880, .06, .07, 'triangle'); break;
      case 'back': this.tone(520, 330, .07, .07, 'triangle'); break;
      case 'buy': this.tone(523, 1046, .18, .12, 'triangle'); this.tone(784, 1568, .22, .08, 'sine', this.c.currentTime + .08); break;
      case 'deny': this.tone(180, 140, .14, .1, 'square'); break;
      case 'warn': if (!this.gate(n, 400)) return; this.tone(660, 330, .25, .12, 'sawtooth'); this.tone(660, 330, .25, .12, 'sawtooth', this.c.currentTime + .3); break;
      case 'od': this.tone(110, 880, .45, .2, 'sawtooth'); this.noise(.5, .2, 400, 6000, 'bandpass'); break;
      case 'stagger': this.tone(1200, 300, .3, .14, 'square'); this.tone(90, 60, .3, .2, 'sine'); break;
      case 'clash': this.tone(1600, 800, .2, .16, 'triangle'); this.tone(2400, 1200, .25, .1, 'sine'); this.noise(.15, .15, 8000, 2000, 'highpass'); break;
      case 'blip': if (!this.gate(n, 45)) return; this.tone(p * (0.9 + Math.random() * .2), p, .03, .035, 'square'); break;
      case 'heart': this.tone(70, 45, .12, .22, 'sine'); this.tone(70, 45, .1, .16, 'sine', this.c.currentTime + .16); break;
      case 'roar': this.tone(70, 280, .7, .22, 'sawtooth'); this.tone(73, 290, .7, .18, 'square'); this.noise(.8, .18, 300, 1200, 'bandpass'); break;
      case 'laser': if (!this.gate(n, 120)) return; this.tone(1800, 200, .35, .08, 'sawtooth'); break;
      case 'hack': if (!this.gate(n, 60)) return; this.tone(500 + p * 220, 1300 + p * 220, .14, .12, 'square'); break;
      case 'zan': if (!this.gate(n, 40)) return; this.tone(1400, 2800, .08, .1, 'sawtooth'); this.noise(.06, .12, 9000, 3000, 'highpass'); break;
      case 'wall': if (!this.gate(n, 50)) return; this.tone(240, 380, .07, .1, 'square'); break;
      case 'warp': this.tone(500, 1400, .18, .1, 'sine'); break;
      case 'lock': this.tone(700 + p * 170, 900 + p * 170, .05, .08, 'sine'); break;
      case 'win': { const t = this.c.currentTime; [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, .25, .1, 'triangle', t + i * .1)); } break;
      case 'lose': { const t = this.c.currentTime; [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * .98, .3, .1, 'sawtooth', t + i * .14)); } break;
      case 'star': this.tone(880 + p * 220, 1760 + p * 440, .25, .12, 'triangle'); break;
      case 'tick': if (!this.gate(n, 30)) return; this.tone(1200, 1200, .025, .04, 'square'); break;
    }
  },
  say(text, force) {
    if (this.quiet || !Store.data.settings.voice || typeof speechSynthesis === 'undefined') return;
    const now = performance.now(); if (!force && now - this.lastSay < 3500) return; this.lastSay = now;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.pitch = .6; u.rate = 1.12; u.volume = .5 * Store.data.settings.sfx;
      speechSynthesis.speak(u);
    } catch (e) { errLog(e); }
  },
};
