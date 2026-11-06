/* =====================================================================
   SOUND 2 — every blade swings with its own sound, and every enemy type
   has its own voice: a call when it lands on the roof, a warning before
   it attacks and a sound when it breaks. Pure synthesis, no files.
   Audio never touches the seeded RNG, so replays stay identical.
   ===================================================================== */
Object.assign(Aud, {
  bell(f, d, v, type) { if (!this.c || this.quiet) return; this.tone(f, f * .99, d, v, type || 'sine'); }, // sounds triggered from the simulation stay silent in fast replays
  wslash(id, p) { // the dash-slash, per weapon
    const c = this.c; if (!c || this.quiet || !this.gate('slash', 40)) return;
    const t = c.currentTime, b = Math.min((p | 0) * 16, 420);
    if (W4SND.slash[id]) { W4SND.slash[id].call(this, b, t); return; }
    switch (id) {
      case 'daggers': this.tone(900 + b, 1700 + b, .05, .08, 'sawtooth'); this.tone(1150 + b, 2000 + b, .05, .06, 'sawtooth', t + .06); this.noise(.05, .06, 8000, 3000, 'highpass'); break;
      case 'hammer': this.noise(.2, .15, 700, 140); this.tone(120, 52, .22, .17, 'sine'); this.tone(230 + b * .3, 140, .12, .06, 'square'); break;
      case 'scythe': this.tone(380 + b, 1100 + b, .14, .1, 'sawtooth'); this.tone(2300, 1900, .3, .035, 'sine', t + .04); this.noise(.12, .06, 4000, 9000, 'bandpass'); break;
      case 'kunai': for (let k = 0; k < 3; k++) this.tone(1800 + k * 320, 2700 + k * 320, .045, .05, 'sine', t + k * .035); this.noise(.05, .05, 9000, 5000, 'highpass'); break;
      case 'whip': this.noise(.09, .05, 1800, 6000, 'bandpass'); this.noise(.035, .24, 9000, 4000, 'highpass', t + .1); this.tone(3200, 1500, .03, .07, 'square', t + .1); break;
      case 'spear': this.tone(520 + b, 2500 + b, .08, .1, 'sine'); this.noise(.06, .08, 7000, 2500, 'highpass'); this.tone(170, 85, .07, .08, 'triangle', t + .05); break;
      case 'fists': this.noise(.1, .17, 900, 240); this.tone(160, 70, .11, .18, 'sine'); break;
      case 'muramasa': this.tone(200 + b, 620 + b, .13, .1, 'sawtooth'); this.tone(207 + b, 641 + b, .13, .08, 'sawtooth'); this.noise(.1, .08, 3000, 800, 'bandpass'); this.tone(92, 58, .2, .09, 'sine'); break;
      case 'monarch': this.tone(300 + b, 900 + b, .1, .09, 'sawtooth'); this.tone(1600, 2400, .06, .05, 'square', t + .05); this.noise(.08, .06, 5000, 2000, 'bandpass', t + .05); break;
      case 'dominator': this.tone(260 + b, 700 + b, .09, .1, 'sawtooth'); this.noise(.06, .06, 5000, 1500, 'highpass'); break;
      case 'nodachi': this.noise(.22, .1, 500, 2600, 'bandpass'); this.tone(140 + b * .3, 380 + b, .22, .09, 'sawtooth'); break;
      case 'chakram': for (let k = 0; k < 3; k++) this.tone(1300 + k * 200 + b, 1700 + k * 200 + b, .05, .05, 'triangle', t + k * .04); break;
      case 'tessen': this.noise(.04, .14, 6000, 2000, 'highpass'); this.noise(.12, .05, 1400, 3600, 'bandpass', t + .03); break;
      default: this.tone(240 + b, 760 + b, .09, .12, 'sawtooth'); this.noise(.07, .08, 6000, 1500, 'highpass');
    }
  },
  wbeat(id, k) { // a beat inside a swing animation: hammer impact, whip crack, dominator shot, monarch scissor snap, a punch, a dagger stab
    const c = this.c; if (!c || this.quiet || !this.gate('wbeat' + id + k, 30)) return; const t = c.currentTime;
    if (W4SND.beat[id]) { W4SND.beat[id].call(this, k, t); return; }
    switch (id) {
      case 'hammer': this.tone(80, 34, .32, .2, 'sine'); this.noise(.22, .2, 600, 80); this.tone(1400, 900, .05, .03, 'square', t + .01); break;
      case 'whip': this.noise(.03, .26, 9500, 5000, 'highpass'); this.tone(3600, 1800, .025, .08, 'square'); break;
      case 'dominator': this.noise(.12, .22, 2400, 300); this.tone(180, 60, .14, .16, 'square'); this.tone(2200, 3300, .04, .04, 'sine', t + .08); break;
      case 'monarch': this.tone(2400, 1200, .06, .06, 'sawtooth'); this.tone(2460, 1230, .06, .05, 'sawtooth'); this.noise(.04, .08, 7000, 3000, 'highpass'); break;
      case 'fists': this.tone(140 - k * 20, 60, .08, .14, 'sine'); this.noise(.05, .1, 1100, 300); break;
      case 'daggers': this.tone(2200 + k * 300, 2600 + k * 300, .03, .045, 'square'); break;
      case 'spear': this.tone(900, 3000, .07, .07, 'sine'); break;
      case 'scythe': this.noise(.3, .07, 900, 4000, 'bandpass'); this.tone(2600, 2000, .25, .03, 'sine'); break;
      case 'katana': case 'muramasa': this.tone(3200, 2400, .05, .03, 'sine'); break;
      case 'nodachi': this.noise(.35, .14, 400, 3000, 'bandpass'); this.tone(90, 55, .3, .12, 'sine'); break;
      case 'tessen': this.noise(.03, .2, 8000, 3000, 'highpass'); break;
      case 'chakram': this.tone(2200, 3100, .08, .04, 'sine'); break;
    }
  },
  wimpact(id) { // an extra layer on a kill, per weapon
    const c = this.c; if (!c || this.quiet || !this.gate('wimp', 45)) return; const t = c.currentTime;
    switch (id) {
      case 'hammer': case 'fists': this.tone(95, 45, .16, .14, 'sine'); this.noise(.08, .08, 500, 120); break;
      case 'daggers': case 'kunai': this.tone(2600, 2200, .03, .05, 'square'); break;
      case 'spear': this.tone(1700, 3400, .06, .05, 'sine'); break;
      case 'whip': this.noise(.03, .12, 9000, 5000, 'highpass'); break;
      case 'scythe': this.tone(1900, 1500, .22, .04, 'sine', t + .02); break;
      case 'muramasa': this.tone(150, 60, .25, .08, 'sawtooth'); break;
      case 'monarch': this.tone(110, 55, .3, .08, 'sawtooth'); this.tone(1900, 950, .1, .03, 'square'); break;
      case 'dominator': this.noise(.06, .12, 3000, 600); break;
    }
  },
  /* enemy voices — ev: 0 lands on the roof, 1 warns or attacks, 2 breaks */
  esfx(type, ev) {
    const c = this.c; if (!c || this.quiet || c.state !== 'running') return;
    if (!this.gate('e' + type + ':' + ev, ev === 0 ? 160 : ev === 2 ? 60 : 90)) return;
    const t = c.currentTime, T = ET;
    if (ev === 2 && EDEF[type] && EDEF[type].mb) { this.tone(320, 38, .6, .2, 'sawtooth'); this.noise(.6, .25, 1400, 60); return; } // mini-boss down
    if (ev === 0 && EDEF[type] && EDEF[type].mb) { this.tone(80, 210, .5, .16, 'sawtooth'); this.tone(83, 220, .5, .12, 'square'); this.noise(.5, .12, 300, 1200, 'bandpass'); return; }
    switch (type) {
      case T.DRONE: if (ev === 0) this.tone(1200, 1650, .04, .025, 'square'); else if (ev === 2) { this.noise(.06, .07, 6000, 2000, 'highpass'); this.tone(900, 320, .07, .05, 'square'); } break;
      case T.MINI: if (ev === 2) this.tone(1900, 1300, .04, .04, 'square'); break;
      case T.SNIPER: if (ev === 0) this.tone(700, 520, .08, .03, 'triangle'); else if (ev === 1) this.tone(600, 1900, .65, .035, 'sine'); else this.tone(2600, 2600, .18, .04, 'sine'); break;
      case T.BRUTE: if (ev === 0) { this.tone(72, 48, .22, .18, 'sine'); this.noise(.12, .08, 400, 120); } else if (ev === 2) { this.noise(.3, .18, 900, 90); this.tone(64, 34, .3, .16, 'sine'); } break;
      case T.BOMBER: if (ev === 1) for (let k = 0; k < 4; k++) this.tone(1400, 1400, .045, .06, 'square', t + k * .18); else if (ev === 0) this.tone(400, 640, .06, .03, 'square'); break;
      case T.WEAVER: if (ev === 1) for (let k = 0; k < 3; k++) this.tone(950, 420, .07, .04, 'triangle', t + k * .045); else if (ev === 2) { this.tone(600, 900, .08, .04, 'sine'); this.tone(900, 500, .08, .04, 'sine', t + .08); } else this.tone(500, 760, .07, .03, 'triangle'); break;
      case T.PHANTOM: if (ev === 1) { this.tone(2100, 3100, .2, .03, 'sine'); this.tone(3100, 2100, .2, .025, 'sine', t + .12); } else if (ev === 2) this.noise(.22, .07, 3000, 9000, 'bandpass'); break;
      case T.SPLITTER: if (ev === 2) { this.tone(500, 380, .05, .06, 'square'); this.tone(720, 520, .05, .06, 'square', t + .07); } break;
      case T.WARDEN: if (ev === 1) this.tone(300, 1250, .1, .05, 'square'); else if (ev === 2) this.tone(820, 110, .32, .06, 'sawtooth'); else this.tone(420, 840, .12, .03, 'triangle'); break;
      case T.COURIER: if (ev === 0) { this.tone(880, 880, .12, .05, 'square'); this.tone(660, 660, .12, .05, 'square', t + .14); } break;
      case T.TREASURE: if (ev === 0) [1320, 1760, 2093].forEach((f, k) => this.tone(f, f, .07, .04, 'sine', t + k * .06)); break;
      case T.MEDIC: if (ev === 1) { this.tone(1320, 1320, .16, .04, 'sine'); this.tone(1660, 1660, .2, .035, 'sine', t + .09); } else if (ev === 2) this.tone(1500, 600, .18, .04, 'sine'); break;
      case T.MIMIC: if (ev === 1) { this.tone(400, 1200, .14, .04, 'square'); this.tone(412, 1236, .14, .03, 'square'); } else if (ev === 2) this.tone(1100, 280, .14, .05, 'square'); break;
      case T.MINER: if (ev === 1) { this.tone(2100, 2100, .012, .06, 'square'); this.tone(900, 900, .06, .03, 'sine', t + .05); } else if (ev === 2) this.noise(.1, .09, 2500, 600, 'bandpass'); break;
      case T.MIRROR: if (ev === 1) { this.tone(3300, 3300, .3, .04, 'sine'); this.tone(4400, 4400, .22, .025, 'sine'); } else if (ev === 2) { this.noise(.18, .12, 9000, 3000, 'highpass'); this.tone(3000, 1200, .2, .04, 'sine'); } break;
      case T.CLONE: if (ev === 1) this.noise(.16, .06, 800, 4000, 'bandpass'); else if (ev === 2) this.tone(700, 240, .1, .04, 'triangle'); break;
    }
  }
});
