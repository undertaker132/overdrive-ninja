/* --- MODULE 6: v102.0 STUDIO SOUND DESIGN ENGINE (StudioSFX102) --- */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "v102.0 — STUDIO SOUND FX OVERHAUL (SLASHS, CREDITS, VICTORY & MORE)": "v102.0 — שדרוג סאונד אולפן מלא (חיתוכים, כסף, סיום משימה ועוד)",
      "Brand-new multi-layered Studio Sound Design Engine (StudioSFX102) replacing retro beeps across the game: weapon-aware & combo-varied katana/heavy/fist slashes with metallic steel harmonics, crisp visceral hit & crit crunches, melodic combo-climbing kill chimes, authentic forged-steel parry & blade clashes, lush holographic credit-pickup & purchase chimes, heroic cyber-anime mission victory fanfares, escalating star chimes, bass-drop Overdrive surge, armor-shatter stagger, cinematic defeat power-down, and sleek sci-fi UI sounds — all with stereo panning and a Sound tab toggle.": "מנוע סאונד אולפן רב־שכבתי חדש (StudioSFX102) שמחליף את הצפצופים הישנים בכל המשחק: חיתוכי חרב/נשק כבד/אגרופים מותאמים לסוג הנשק ולקומבו עם צלצול פלדה, פגיעות וקריטים עוצמתיים, צלילי חיסול עולים עם הקומבו, פארי והתנגשות להבים ממתכת חישול, צלילי איסוף כסף ורכישות הולוגרפיים, תרועת ניצחון סייבר־אנימה בסיום משימה, כוכבי תוצאה מדורגים, הפעלת Overdrive עם באס־דרופ, שבירת שריון וממשק מודרני — כולל סטריאו ומתג בלשונית הסאונד.",
      "Sound FX Style": "סגנון אפקטי סאונד",
      "STUDIO": "אולפן (חדש)",
      "CLASSIC": "קלאסי"
    });
  } catch (e) {}

  const StudioSFX102 = {
    slashSeq: 0,
    coinSeq: 0,
    lastCoinT: 0,
    lastGate: {},
    shaper: null,

    enabled() {
      try {
        const s = Store && Store.data && Store.data.settings;
        return (!s || s.sfx102 == null) ? true : !!s.sfx102;
      } catch (e) { return true; }
    },

    gate(name, ms) {
      const now = performance.now();
      if (now - (this.lastGate[name] || 0) < ms) return false;
      this.lastGate[name] = now;
      return true;
    },

    getBus(c, panVal) {
      const target = (typeof Aud !== 'undefined' && Aud.sfxBus) ? Aud.sfxBus : c.destination;
      if (panVal && Math.abs(panVal) > 0.03 && c.createStereoPanner) {
        const pn = c.createStereoPanner();
        pn.pan.setValueAtTime(Math.max(-0.75, Math.min(0.75, panVal)), c.currentTime);
        pn.connect(target);
        return pn;
      }
      return target;
    },

    playerPan() {
      try {
        if (typeof P !== 'undefined' && typeof V !== 'undefined' && V.VW) {
          return ((P.x / V.VW) - 0.5) * 1.1;
        }
      } catch (e) {}
      return 0;
    },

    /* Clean enveloped oscillator (supports pitch curve & detune) */
    osc(c, bus, type, f1, f2, dur, vol, delay, detune) {
      const t = c.currentTime + (delay || 0);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      if (detune) o.detune.setValueAtTime(detune, t);
      o.frequency.setValueAtTime(Math.max(24, f1), t);
      if (f2 != null && f2 !== f1) {
        o.frequency.exponentialRampToValueAtTime(Math.max(24, f2), t + dur);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.18));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(bus);
      o.start(t); o.stop(t + dur + 0.03);
    },

    /* Filtered noise burst using Aud.nb buffer */
    noise(c, bus, dur, vol, f1, f2, ftype, q, delay) {
      if (typeof Aud === 'undefined' || !Aud.nb) return;
      const t = c.currentTime + (delay || 0);
      const src = c.createBufferSource();
      src.buffer = Aud.nb;
      const flt = c.createBiquadFilter();
      flt.type = ftype || 'bandpass';
      flt.Q.setValueAtTime(q || 1.2, t);
      flt.frequency.setValueAtTime(Math.max(40, f1), t);
      if (f2 != null && f2 !== f1) {
        flt.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur);
      }
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + Math.min(0.01, dur * 0.2));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(flt); flt.connect(g); g.connect(bus);
      src.start(t, Math.random() * 0.5, dur + 0.04);
    },

    /* Metallic FM Bell / Steel Ring generator (2-operator FM) */
    steel(c, bus, carrierF, modRatio, modIdx, dur, vol, delay) {
      const t = c.currentTime + (delay || 0);
      const car = c.createOscillator(), mod = c.createOscillator();
      const modG = c.createGain(), outG = c.createGain();
      car.type = 'sine'; mod.type = 'sine';
      car.frequency.setValueAtTime(carrierF, t);
      mod.frequency.setValueAtTime(carrierF * modRatio, t);
      modG.gain.setValueAtTime(carrierF * modIdx, t);
      modG.gain.exponentialRampToValueAtTime(1, t + dur * 0.85);
      outG.gain.setValueAtTime(0.0001, t);
      outG.gain.linearRampToValueAtTime(vol, t + 0.004);
      outG.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      mod.connect(modG); modG.connect(car.frequency);
      car.connect(outG); outG.connect(bus);
      car.start(t); mod.start(t);
      car.stop(t + dur + 0.03); mod.stop(t + dur + 0.03);
    },

    /* Weapon family detector */
    weaponFam() {
      try {
        const id = (typeof P !== 'undefined' && P.w && P.w.id) || 'katana';
        if (/hammer|axe|odachi|greatsword|claymore|scythe|glaive/i.test(id)) return 'heavy';
        if (/fist|claw|gauntlet|knuckle/i.test(id)) return 'fist';
        if (/twin|dual|dagger|kunai|kusarigama/i.test(id)) return 'fast';
        if (/plasma|laser|rail|chrono|beam/i.test(id)) return 'plasma';
      } catch (e) {}
      return 'blade';
    },

    play(n, p) {
      if (typeof Aud === 'undefined' || !Aud.c || Aud.quiet || Aud.c.state !== 'running') return false;
      const c = Aud.c;
      const pan = this.playerPan();

      switch (n) {
        /* 1. SLASHES — Weapon-aware, 4-step combo pitch variation, metallic blade air-cut */
        case 'slash': {
          if (!this.gate('slash', 38)) return true;
          const bus = this.getBus(c, pan);
          const fam = this.weaponFam();
          const od = typeof G !== 'undefined' && G.odT > 0;
          const step = (this.slashSeq++ % 4);
          const pitch = [1.0, 1.09, 0.94, 1.18][step] * (0.97 + Math.random() * 0.06);

          if (fam === 'heavy') {
            // Deep wind cleave + forged iron weight
            this.noise(c, bus, 0.24, 0.26, 1200 * pitch, 180, 'lowpass', 1.4, 0);
            this.osc(c, bus, 'sine', 155 * pitch, 44, 0.22, 0.24, 0);
            this.steel(c, bus, 620 * pitch, 2.41, 1.3, 0.22, 0.09, 0.01);
          } else if (fam === 'fist') {
            // Pressurized sonic punch snap
            this.noise(c, bus, 0.11, 0.22, 2600 * pitch, 420, 'bandpass', 1.8, 0);
            this.osc(c, bus, 'triangle', 260 * pitch, 58, 0.13, 0.24, 0);
          } else if (fam === 'plasma') {
            // High-tech plasma saber whoosh + electric hum
            this.noise(c, bus, 0.17, 0.2, 5200 * pitch, 950, 'bandpass', 2.4, 0);
            this.osc(c, bus, 'sawtooth', 420 * pitch, 150, 0.16, 0.09, 0);
            this.steel(c, bus, 1480 * pitch, 1.5, 1.1, 0.18, 0.1, 0.008);
          } else {
            // Razor Katana / Cyber-Blade air whip + cold steel zing!
            const dur = fam === 'fast' ? 0.13 : 0.17;
            this.noise(c, bus, dur, 0.24, 6200 * pitch, 900, 'bandpass', 2.2, 0);
            this.noise(c, bus, dur * 0.75, 0.14, 9500 * pitch, 2800, 'highpass', 0.9, 0.005);
            this.osc(c, bus, 'sine', 235 * pitch, 68, 0.11, 0.17, 0);
            this.steel(c, bus, 1680 * pitch, 2.76, 0.95, 0.15, 0.085, 0.008);
          }
          if (od) {
            // Overdrive golden harmonic sheen
            this.steel(c, bus, 2240 * pitch, 2.0, 0.6, 0.2, 0.08, 0.012);
          }
          return true;
        }

        /* 2. HIT & CRIT — Visceral impact thump + armor slice + anime crit ring */
        case 'hit': {
          if (!this.gate('hit', 28)) return true;
          const bus = this.getBus(c, pan);
          const crit = !!p;
          const j = 0.94 + Math.random() * 0.12;
          // Solid punch body
          this.osc(c, bus, 'sine', (crit ? 210 : 165) * j, 46, crit ? 0.14 : 0.095, crit ? 0.26 : 0.18, 0);
          // Crispy armor/blade transient
          this.noise(c, bus, crit ? 0.11 : 0.07, crit ? 0.22 : 0.15, 3600 * j, 750, 'bandpass', 1.6, 0);
          if (crit) {
            // Razor-sharp critical steel ring!
            this.steel(c, bus, 2380 * j, 2.76, 1.15, 0.22, 0.14, 0.004);
            this.osc(c, bus, 'triangle', 1180 * j, 590, 0.12, 0.1, 0.01);
          }
          return true;
        }

        /* 3. KILL — Combo-climbing crystalline cyber confirm + vaporize pop */
        case 'kill': {
          if (!this.gate('kill', 34)) return true;
          const bus = this.getBus(c, pan);
          const combo = Math.min(20, (p | 0));
          // Pentatonic scale (C D E G A) so high combos sound genuinely musical!
          const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5, 1567.98, 1760.0];
          const root = scale[combo % scale.length] * (combo >= 10 ? 1.189 : 1.0);
          this.osc(c, bus, 'sine', 145, 42, 0.12, 0.16, 0);
          this.noise(c, bus, 0.09, 0.11, 5400, 1600, 'highpass', 1.0, 0);
          this.osc(c, bus, 'triangle', root, root * 1.01, 0.16, 0.12, 0.01);
          this.osc(c, bus, 'sine', root * 1.5, root * 1.51, 0.2, 0.08, 0.025);
          return true;
        }

        /* 4. COIN / CREDITS — Lush holographic cyber-credit shimmer! */
        case 'coin': {
          if (!this.gate('coin', 38)) return true;
          const now = performance.now();
          if (now - this.lastCoinT > 650) this.coinSeq = 0;
          this.lastCoinT = now;
          const step = Math.min(8, this.coinSeq++);
          const mul = Math.pow(1.045, step);
          const bus = this.getBus(c, pan * 0.5);
          // Crisp twin-bell holographic credit pickup (B5 -> E6 -> B6 shimmer)
          this.osc(c, bus, 'sine', 1318.5 * mul, 1318.5 * mul, 0.09, 0.11, 0);
          this.osc(c, bus, 'triangle', 1975.5 * mul, 1985 * mul, 0.15, 0.095, 0.032);
          this.steel(c, bus, 2637 * mul, 2.0, 0.45, 0.18, 0.055, 0.042);
          return true;
        }

        /* 5. BUY / PURCHASE / UPGRADE — Rich cyber-vault confirmation chord */
        case 'buy': {
          const bus = this.getBus(c, 0);
          const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
          notes.forEach((f, i) => {
            this.osc(c, bus, i < 3 ? 'triangle' : 'sine', f, f * 1.003, 0.28 + i * 0.04, 0.09, i * 0.042);
          });
          this.steel(c, bus, 1567.98, 2.0, 0.5, 0.34, 0.07, 0.13);
          this.noise(c, bus, 0.12, 0.06, 4000, 9000, 'highpass', 1.0, 0.08);
          return true;
        }

        /* 6. MISSION COMPLETE / WIN — Heroic Cyber-Anime Victory Fanfare! */
        case 'win': {
          const bus = this.getBus(c, 0);
          // Deep cinematic arrival boom
          this.osc(c, bus, 'sine', 110, 42, 0.42, 0.24, 0);
          // Heroic rising synth-brass fanfare (D5 - F#5 - A5 - D6 + shimmering F#6)
          const melody = [
            [587.33, 0.00, 0.22, 0.11],
            [739.99, 0.11, 0.22, 0.11],
            [880.00, 0.22, 0.26, 0.12],
            [1174.66, 0.34, 0.62, 0.14]
          ];
          for (const [f, dl, dr, v] of melody) {
            this.osc(c, bus, 'triangle', f, f * 1.003, dr, v, dl, -6);
            this.osc(c, bus, 'sawtooth', f, f * 1.002, dr * 0.85, v * 0.35, dl, 7);
          }
          // Warm triumphant sustain chord underneath final note
          [293.66, 440.0, 587.33, 739.99, 1479.98].forEach((f, i) => {
            this.osc(c, bus, 'sine', f, f, 0.78, 0.065, 0.34 + i * 0.018);
          });
          this.steel(c, bus, 2349.3, 2.0, 0.4, 0.65, 0.075, 0.36);
          return true;
        }

        /* 7. STAR RATING CHIME (Results Screen 1/2/3 stars) */
        case 'star': {
          const bus = this.getBus(c, 0);
          const idx = Math.max(0, Math.min(3, p | 0));
          const freqs = [659.25, 880.0, 1174.66, 1567.98];
          const f = freqs[idx];
          this.osc(c, bus, 'sine', 190 + idx * 40, 75, 0.14, 0.15, 0);
          this.osc(c, bus, 'triangle', f, f * 1.006, 0.36, 0.14, 0.01);
          this.steel(c, bus, f * 2, 2.0, 0.55, 0.42, 0.095, 0.02);
          return true;
        }

        /* 8. MISSION FAILED / LOSE — Cinematic cyber system power-down */
        case 'lose': {
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'sine', 120, 34, 0.55, 0.24, 0);
          [440, 392, 329.63, 246.94].forEach((f, i) => {
            this.osc(c, bus, 'triangle', f, f * 0.94, 0.38, 0.1, i * 0.13);
            this.osc(c, bus, 'sawtooth', f * 0.5, f * 0.47, 0.42, 0.055, i * 0.13);
          });
          this.noise(c, bus, 0.45, 0.09, 1400, 180, 'lowpass', 1.2, 0.1);
          return true;
        }

        /* 9. PARRY & BLADE CLASH — Authentic Forged-Steel Ring! */
        case 'parry':
        case 'clash': {
          if (!this.gate(n, 45)) return true;
          const bus = this.getBus(c, pan);
          const perf = n === 'clash' || !!p;
          this.osc(c, bus, 'sine', 240, 62, 0.14, 0.22, 0);
          this.noise(c, bus, 0.09, 0.18, 7500, 1900, 'highpass', 1.2, 0);
          // Multi-partial forged katana clang
          this.steel(c, bus, 1240, 2.76, 1.6, perf ? 0.42 : 0.24, 0.16, 0);
          this.steel(c, bus, 1890, 1.82, 1.2, perf ? 0.48 : 0.26, 0.12, 0.006);
          if (perf) {
            this.osc(c, bus, 'sine', 2637, 2650, 0.52, 0.085, 0.015);
          }
          return true;
        }

        /* 10. OVERDRIVE SURGE — Time-warp bass drop + plasma turbine power-up */
        case 'od': {
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'sine', 135, 32, 0.55, 0.3, 0);
          this.osc(c, bus, 'sawtooth', 165, 880, 0.46, 0.12, 0, -8);
          this.osc(c, bus, 'sawtooth', 165, 885, 0.46, 0.12, 0, 8);
          this.noise(c, bus, 0.52, 0.18, 450, 7200, 'bandpass', 1.6, 0);
          [523.25, 783.99, 1046.5, 1567.98].forEach((f, i) => {
            this.osc(c, bus, 'triangle', f, f * 1.02, 0.48, 0.08, 0.16 + i * 0.025);
          });
          return true;
        }

        /* 11. ARMOR BREAK / STAGGER — Heavy armor shatter + sub break */
        case 'stagger': {
          const bus = this.getBus(c, pan);
          this.osc(c, bus, 'sine', 160, 36, 0.4, 0.28, 0);
          this.noise(c, bus, 0.28, 0.22, 4200, 480, 'bandpass', 1.2, 0);
          this.steel(c, bus, 920, 3.14, 2.2, 0.34, 0.14, 0.01);
          this.steel(c, bus, 2100, 2.4, 1.5, 0.26, 0.1, 0.03);
          return true;
        }

        /* 12. ZANDATSU / EXECUTION — Razor cyber sever */
        case 'zan': {
          if (!this.gate('zan', 36)) return true;
          const bus = this.getBus(c, pan);
          this.noise(c, bus, 0.14, 0.22, 9200, 2200, 'highpass', 1.0, 0);
          this.steel(c, bus, 2200, 2.76, 1.8, 0.28, 0.15, 0);
          this.osc(c, bus, 'sine', 190, 40, 0.22, 0.24, 0);
          return true;
        }

        /* 13. EXPLOSION (Barrels / Boss parts) */
        case 'boom': {
          if (!this.gate('boom', 65)) return true;
          const bus = this.getBus(c, pan);
          const big = !!p;
          this.osc(c, bus, 'sine', big ? 115 : 135, 26, big ? 0.58 : 0.34, big ? 0.3 : 0.23, 0);
          this.noise(c, bus, big ? 0.62 : 0.34, big ? 0.28 : 0.2, 1300, 75, 'lowpass', 0.9, 0);
          this.noise(c, bus, big ? 0.24 : 0.14, 0.14, 3400, 700, 'bandpass', 1.4, 0.02);
          return true;
        }

        /* 14. PLAYER HURT — Visceral shield crack + low thud */
        case 'hurt': {
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'sawtooth', 180, 44, 0.28, 0.22, 0);
          this.noise(c, bus, 0.22, 0.22, 1800, 180, 'bandpass', 1.2, 0);
          this.steel(c, bus, 460, 2.9, 2.5, 0.2, 0.11, 0.01);
          return true;
        }

        /* 15. BOSS ROAR — Detuned cyber-oni metallic growl */
        case 'roar': {
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'sawtooth', 72, 195, 0.68, 0.17, 0, -14);
          this.osc(c, bus, 'sawtooth', 75, 202, 0.68, 0.17, 0, 14);
          this.osc(c, bus, 'sine', 95, 38, 0.72, 0.24, 0);
          this.noise(c, bus, 0.72, 0.18, 320, 1400, 'bandpass', 2.0, 0.04);
          return true;
        }

        /* 16. SLEEK SCI-FI UI & TACTICAL SOUNDS (ui, back, deny, graze, lock, hack, warp) */
        case 'ui': {
          if (!this.gate('ui', 32)) return true;
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'sine', 740, 1180, 0.055, 0.085, 0);
          this.osc(c, bus, 'triangle', 1480, 1620, 0.045, 0.045, 0.012);
          return true;
        }
        case 'back': {
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'sine', 640, 380, 0.075, 0.08, 0);
          this.osc(c, bus, 'triangle', 480, 290, 0.07, 0.04, 0.01);
          return true;
        }
        case 'deny': {
          const bus = this.getBus(c, 0);
          this.osc(c, bus, 'triangle', 210, 145, 0.11, 0.11, 0);
          this.osc(c, bus, 'triangle', 175, 118, 0.13, 0.1, 0.075);
          return true;
        }
        case 'graze': {
          if (!this.gate('graze', 55)) return true;
          const bus = this.getBus(c, pan);
          this.osc(c, bus, 'sine', 960, 1680, 0.075, 0.07, 0);
          this.noise(c, bus, 0.06, 0.06, 6000, 9000, 'highpass', 1.0, 0);
          return true;
        }
        case 'lock': {
          const bus = this.getBus(c, pan);
          const f = 840 + (p | 0) * 180;
          this.osc(c, bus, 'sine', f, f * 1.28, 0.055, 0.075, 0);
          return true;
        }
        case 'hack': {
          if (!this.gate('hack', 55)) return true;
          const bus = this.getBus(c, 0);
          const f = 620 + (p | 0) * 190;
          this.osc(c, bus, 'triangle', f, f * 1.5, 0.12, 0.1, 0);
          this.steel(c, bus, f * 2, 1.5, 0.5, 0.15, 0.06, 0.02);
          return true;
        }
        case 'warp': {
          const bus = this.getBus(c, pan);
          this.osc(c, bus, 'sine', 340, 1420, 0.2, 0.12, 0);
          this.noise(c, bus, 0.18, 0.11, 900, 5200, 'bandpass', 2.0, 0);
          return true;
        }
      }
      return false;
    }
  };

  // Hook Aud.sfx cleanly — StudioSFX102 replaces retro beeps & old stock clips for handled events!
  if (typeof Aud !== 'undefined' && Aud.sfx) {
    const prevSfx = Aud.sfx.bind(Aud);
    Aud.sfx = function (n, p) {
      if (StudioSFX102.enabled()) {
        try {
          if (StudioSFX102.play(n, p)) return;
        } catch (e) {}
      }
      return prevSfx(n, p);
    };
  }
})();
