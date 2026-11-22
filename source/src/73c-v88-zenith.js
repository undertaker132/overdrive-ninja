/* ==========================================================================
   VERSION 88.0 — ZENITH EDITION (ULTIMATE OVERDRIVE)
   1. ZenithWorld88 — 3D flying cyber-traffic streams, sweeping volumetric
                      police searchlights, storm sheet-lightning + thunder &
                      BPM/bass-reactive neon maglev rails
   2. Resonance88   — MULTISLASH OVERCLOCK (3+ kills in one dash: geometric
                      constellation lines, +1 charge, +20 Overdrive, bonus) &
                      ZANSHIN Counter-Dash (+50% crit after Perfect Parry),
                      strictly gated on simV(88)
   3. Weapons88     — 3 new exotic weapons with unique combat mechanics:
                      PLASMA ODACHI, CYBER KUSARIGAMA, CHRONO GLAIVE
   4. BossZenith88  — Cinematic anime WARNING // PHASE II / FINAL PHASE
                      tactical banner & boss stagger pulse indicator
   5. AudioZenith88 — Real-time Web Audio AnalyserNode neon spectrum bar +
                      3 more flagship tracks (ZENITH OVERDRIVE, CYBER REQUIEM,
                      NEO-EDO DRIFT 2099)
   6. HudZenith88   — Crisp non-intrusive right-edge tactical kill-feed
                      ticker (toggleable in Settings -> ZENITH EDITION)
   ========================================================================== */

/* ---- 4-language translations for v88 ---- */
try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "ZENITH EDITION (v88)": "מהדורת ZENITH (v88)",
    "Tactical kill feed": "פיד קרב טקטי",
    "Audio spectrum bar": "אקולייזר מוזיקה חי",
    "TRIPLE SLASH!": "חיתוך משולש!",
    "QUADRA SLASH!": "חיתוך מרובע!",
    "GODLIKE SLASH!": "חיתוך אלוהי!",
    "ZANSHIN COUNTER!": "מתקפת זאנשין!",
    "STASIS FIELD": "שדה הקפאת זמן",
    "PHASE II": "שלב 2",
    "FINAL PHASE": "שלב סופי",
    "WARNING": "אזהרה",
    "PLASMA ODACHI": "אודאצ׳י פלזמה",
    "Colossal neon greatsword. Every dash launches a twin plasma wave that slices foes and melts bullets.": "חרב ניאון אדירה. כל זינוק משגר גל פלזמה כפול החותך אויבים וממיס כדורים.",
    "CYBER KUSARIGAMA": "קוסאריגאמה סייבר",
    "Weighted neon chain-sickle. Kills pull nearby enemies inward and arc lightning to the nearest target.": "מגל־שרשרת ניאון. חיסולים מושכים אויבים סמוכים פנימה ומשגרים ברק ליעד הקרוב.",
    "CHRONO GLAIVE": "גלייב הזמן",
    "Temporal twin-blade polearm. Wall ricochets drop a stasis field that slows enemies and bullets.": "חנית להב־כפול זמנית. קפיצות מקיר משאירות שדה הקפאת זמן המאט אויבים וכדורים.",
    "3D NEO-EDO TRAFFIC, SEARCHLIGHTS & LIGHTNING": "תנועה מעופפת, זרקורים וברקים בתלת־ממד",
    "In 3D, streams of flying cyber-traffic zip through the skyscrapers below, sweeping searchlights cut across the night sky, storm stages flash with lightning and thunder, and the train rails pulse with the music's bass.": "בתלת־ממד, זרמי רכבים מעופפים חולפים בין גורדי השחקים למטה, זרקורים סורקים את שמי הלילה, שלבי סערה מבזיקים בברקים ורעמים ומסילות הרכבת פועמות לפי הבס של הפסקול.",
    "MULTISLASH OVERCLOCK & ZANSHIN COUNTER": "מולטי־סלאש אוברקלוק ומתקפת זאנשין",
    "Cutting 3+ enemies in one dash triggers MULTISLASH OVERCLOCK (constellation lines, +1 dash charge & Overdrive). After a Perfect Parry, your next dash ignites ZANSHIN COUNTER for +50% damage and a golden 3D ribbon.": "חיסול 3+ אויבים בזינוק אחד מפעיל מולטי־סלאש אוברקלוק (קווי קונסטלציה, +1 זינוק ואוברדרייב). אחרי פארי מושלם, הזינוק הבא מצית מתקפת זאנשין עם +50% נזק ושובל זהב.",
    "3 NEW EXOTIC WEAPONS & LIVE SPECTRUM": "3 נשקים אקזוטיים חדשים ואקולייזר חי",
    "PLASMA ODACHI, CYBER KUSARIGAMA and CHRONO GLAIVE join the Arsenal with unique mechanics, alongside 3 new tracks (ZENITH OVERDRIVE, CYBER REQUIEM, NEO-EDO DRIFT 2099), a live audio spectrum bar, boss phase banners and a tactical kill feed.": "אודאצ׳י פלזמה, קוסאריגאמה סייבר וגלייב הזמן הצטרפו לארסנל עם מכניקות ייחודיות, לצד 3 שירים חדשים, אקולייזר מוזיקה חי, באנר אזהרת שלבי בוסים ופיד קרב טקטי."
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "ZENITH EDITION (v88)": "إصدار ZENITH (v88)",
    "Tactical kill feed": "شريط القتال التكتيكي",
    "Audio spectrum bar": "مُعادل الصوت المباشر",
    "TRIPLE SLASH!": "قطع ثلاثي!",
    "QUADRA SLASH!": "قطع رباعي!",
    "GODLIKE SLASH!": "قطع أسطوري!",
    "ZANSHIN COUNTER!": "هجوم زانشين!",
    "PLASMA ODACHI": "أوداتشي البلازما",
    "CYBER KUSARIGAMA": "كوساريغاما سايبر",
    "CHRONO GLAIVE": "رمح الزمن"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "ZENITH EDITION (v88)": "ZENITH EDITION (v88)",
    "Tactical kill feed": "Тактическая лента боя",
    "Audio spectrum bar": "Живой аудио-спектр",
    "TRIPLE SLASH!": "ТРОЙНОЙ РАЗРЕЗ!",
    "QUADRA SLASH!": "ЧЕТВЕРНОЙ РАЗРЕЗ!",
    "GODLIKE SLASH!": "БОЖЕСТВЕННЫЙ РАЗРЕЗ!",
    "ZANSHIN COUNTER!": "КОНТРУДАР ДЗАНСИН!",
    "PLASMA ODACHI": "ПЛАЗМЕННЫЙ ОДАТИ",
    "CYBER KUSARIGAMA": "КИБЕР-КУСАРИГАМА",
    "CHRONO GLAIVE": "ХРОНО-ГЛЕФА"
  });
} catch (e) { errLog(e); }

/* ==========================================================================
   1. AudioZenith88 — 3 MORE MASTERPIECE TRACKS & LIVE SPECTRUM ANALYSER
   ========================================================================== */
try {
  if (typeof TRACKS !== 'undefined' && typeof mkTrack === 'function') {
    Object.assign(TRACKS, {
      zenith_anthem: mkTrack({
        name: 'ZENITH OVERDRIVE', style: 'Ultimate anime cyber-anthem', bpm: 158, root: 65.41, sc: 'yo',
        prog: [0, 3, 4, 2], form: ['A', 'B', 'B', 'D', 'B', 'B'], taiko: 1,
        dr: {
          A: { k: 'x...x...x...x...', s: '....x.......x...', t: 'X...x...X...x...', h: 'x.x.x.x.x.x.x.x.' },
          B: { k: 'x..x..x.x..x..x.', s: '....X.......X...', t: 'X..x..x.X..x..x.', c: '....x.......x...', o: '..o...o...o...o.', h: 'xxxxxxxxxxxxxxxx' },
          D: { t: 'X.......X.......', sh: 'x.x.x.x.x.x.x.x.' },
          F: { k: 'x.x.x.x.xxxxxxxx', t: 'XXXXXXXXXXXXXXXX', s: '....X...x.xxXXXX' }
        },
        bass: { pat: [0, 0, 12, 0, 0, 12, 7, 0, 0, 0, 12, 0, 5, 0, 7, 0], type: 'gtr', v: .07, len: .75 },
        pad: { type: 'brass', oct: 2, v: .024 },
        arp: { pat: [0, 1, 2, 4, 2, 1], rate: 2, oct: 3, type: 'koto', v: .024, sec: 'ABD' },
        lead: { type: 'gld', oct: 3, v: .036, sec: 'B', n: [
          [0, 4, 4], [4, 5, 2], [6, 4, 2], [8, 2, 4], [12, 4, 4], [16, 7, 6], [22, 5, 2], [24, 4, 8],
          [32, 4, 4], [36, 7, 2], [38, 9, 2], [40, 7, 4], [44, 5, 4], [48, 4, 4], [52, 5, 4], [56, 7, 8]
        ] },
        lead2: { type: 'brass', oct: 2, v: .028, sec: 'B', n: [[0, 0, 4], [8, 2, 4], [16, 4, 8], [32, 0, 4], [40, 3, 4], [48, 4, 8]] }
      }),
      cyber_requiem: mkTrack({
        name: 'CYBER REQUIEM', style: 'Gothic industrial synth', bpm: 132, root: 51.91, sc: 'phr',
        prog: [0, 5, 1, 0], form: ['A', 'A', 'B', 'B', 'D', 'B'],
        dr: {
          A: { k: 'x...x...x...x...', s: '....x.......x...', p: '..x.....x.....x.' },
          B: { k: 'x...x...x.x.x...', s: '....X.......X...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', p: '..x...x...x...x.' },
          D: { k: 'x.......x.......', p: '....x.......x...' },
          F: { k: 'x...x...x.x.xxxx', s: '....X...x.xxXXXX' }
        },
        bass: { pat: [0, null, 0, 12, null, 0, 1, null, 0, null, 0, 12, null, 6, 5, null], type: 'reese', v: .09, len: 1.1 },
        pad: { type: 'choir', oct: 2, v: .03 },
        arp: { pat: [0, 1, 4, 5, 4, 1], rate: 1, oct: 3, type: 'organ', v: .02, sec: 'ABD' },
        lead: { type: 'organ', oct: 3, v: .032, sec: 'B', n: [
          [0, 0, 6], [6, 1, 2], [8, 4, 4], [12, 3, 4], [16, 1, 8], [24, 0, 8],
          [32, 7, 6], [38, 5, 2], [40, 4, 4], [44, 1, 4], [48, 0, 16]
        ] }
      }),
      tokyo_drift_2099: mkTrack({
        name: 'NEO-EDO DRIFT 2099', style: 'Hyper-phonk night drive', bpm: 138, root: 55, sc: 'dor',
        prog: [0, 6, 3, 5], form: ['A', 'B', 'B', 'D', 'B'],
        dr: {
          A: { k: 'x..x..x...x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
          B: { k: 'x..x..x.x.x..x..', s: '....X.......X...', c: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '......o.......o.' },
          D: { k: 'x.........x.....', h: 'x.x.x.x.x.x.x.x.' },
          F: { k: 'x..x..x.x.xxxxxx', s: '....X...x.xxXXXX' }
        },
        bass: { pat: [0, null, 0, null, 12, null, 7, null, 0, null, 5, null, 3, null, 7, null], type: 'b808', v: .11, len: 1.4 },
        pad: { type: 'acid', oct: 2, v: .022, sec: 'BD' },
        arp: { pat: [0, 2, 3, 6, 3, 2], rate: 2, oct: 3, type: 'pluck', v: .022, sec: 'B' },
        lead: { type: 'cowbell', oct: 3, v: .034, sec: 'AB', n: [
          [0, 0, 2], [2, 3, 2], [4, 4, 2], [6, 6, 2], [8, 4, 2], [10, 3, 2], [12, 2, 4],
          [16, 0, 2], [18, 3, 2], [20, 7, 4], [24, 6, 4], [28, 4, 4],
          [32, 0, 2], [34, 4, 2], [36, 7, 2], [38, 9, 2], [40, 7, 4], [44, 6, 4], [48, 4, 8], [56, 3, 4], [60, 2, 4]
        ] }
      })
    });
    const ids88 = ['zenith_anthem', 'cyber_requiem', 'tokyo_drift_2099'];
    if (Array.isArray(TRACK_LIST)) for (const id of ids88) if (TRACK_LIST.indexOf(id) < 0) TRACK_LIST.push(id);
    if (Array.isArray(RUN_TRACKS)) for (const id of ids88) if (RUN_TRACKS.indexOf(id) < 0) RUN_TRACKS.push(id);
  }
} catch (e) { errLog(e); }

const AudioZenith88 = {
  an: null, bins: null, cv: null, ctx: null, bass: 0,
  enabled() {
    const s = Store.data && Store.data.settings;
    return !CALM && !(s && s.viz88 === 0);
  },
  ensure() {
    if (!this.an && Aud.c && Aud.out) {
      try {
        this.an = Aud.c.createAnalyser();
        this.an.fftSize = 64;
        this.an.smoothingTimeConstant = 0.78;
        Aud.out.connect(this.an);
        this.bins = new Uint8Array(this.an.frequencyBinCount);
      } catch (e) { this.an = null; }
    }
    if (!this.cv && typeof document !== 'undefined' && document.body) {
      const c = document.createElement('canvas');
      c.id = 'viz88';
      c.setAttribute('aria-hidden', 'true');
      document.body.appendChild(c);
      this.cv = c;
      this.ctx = c.getContext('2d');
    }
  },
  tick() {
    if (!this.enabled()) { if (this.cv) this.cv.style.display = 'none'; this.bass = 0; return; }
    this.ensure();
    if (!this.cv || !this.ctx) return;
    const active = !inRun() || (typeof UI !== 'undefined' && UI.cur === 'music');
    document.body.classList.toggle('in-run', inRun());
    this.cv.style.display = active ? 'block' : 'none';
    if (this.an && this.bins) {
      this.an.getByteFrequencyData(this.bins);
      this.bass = (this.bins[0] + this.bins[1] + this.bins[2]) / (3 * 255);
    } else {
      this.bass = 0;
    }
    if (!active) return;
    const w = Math.max(200, window.innerWidth | 0), h = 44;
    if (this.cv.width !== w) this.cv.width = w;
    if (this.cv.height !== h) this.cv.height = h;
    const g = this.ctx;
    g.clearRect(0, 0, w, h);
    const n = 28, bw = w / n;
    for (let i = 0; i < n; i++) {
      const raw = this.bins ? (this.bins[i % this.bins.length] / 255) : (0.1 + 0.08 * Math.sin(CAM.t * 3 + i * 0.4));
      const bh = Math.max(2, raw * (h - 6));
      const hue = 185 + (i / n) * 135;
      g.fillStyle = `hsla(${hue}, 100%, 62%, ${0.28 + raw * 0.65})`;
      g.fillRect(i * bw + 2, h - bh, Math.max(2, bw - 4), bh);
    }
  }
};

/* ==========================================================================
   2. ZenithWorld88 — 3D FLYING CYBER-TRAFFIC, SEARCHLIGHTS & STORM LIGHTNING
   ========================================================================== */
const ZenithWorld88 = {
  grp: null, cars: [], lights: [], flashT: 0, nextBolt: 6,
  ensure() {
    if (this.grp || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
    const T = THREE;
    this.grp = new T.Group();
    R3.root.add(this.grp);
    // 24 flying cyber-traffic streams zipping between the skyscrapers below
    const geo = new T.BoxGeometry(6, 26, 3.5);
    for (let i = 0; i < 24; i++) {
      const dir = i % 2 ? 1 : -1;
      const side = (i % 4 < 2) ? -1 : 1;
      const col = dir > 0 ? 0x00f2fe : 0xff1e56;
      const mat = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.88, blending: T.AdditiveBlending });
      const m = new T.Mesh(geo, mat);
      const laneX = side * (250 + (i % 5) * 95);
      const z = -90 - (i % 4) * 65;
      const y = (i / 24) * 3200 - 1400;
      m.position.set(V.CX + laneX, y, z);
      this.grp.add(m);
      this.cars.push({ m, side, laneX, y, z, spd: (360 + (i % 5) * 125) * dir });
    }
    // 4 sweeping atmospheric cyber searchlight cones
    const coneGeo = new T.ConeGeometry(68, 920, 12, 1, true);
    const coneCols = [0x00f2fe, 0xff2bd6, 0x7df9ff, 0xffd23f];
    for (let i = 0; i < 4; i++) {
      const mat = new T.MeshBasicMaterial({ color: coneCols[i], transparent: true, opacity: 0.085, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
      const m = new T.Mesh(coneGeo, mat);
      m.position.set(V.CX + (i % 2 ? 360 : -360), -300 + i * 420, -180);
      this.grp.add(m);
      this.lights.push({ m, mat, ph: i * 1.57, side: i % 2 ? 1 : -1 });
    }
  },
  tick(rd) {
    if (!R3.on || !R3.ok || CALM) return;
    this.ensure(); if (!this.grp) return;
    const d = Math.min(0.05, rd || 1 / 60), t = CAM.t || 0;
    const cx0 = (V.L + V.R) * 0.5;
    // Animate flying traffic
    for (const c of this.cars) {
      c.y += c.spd * d;
      if (c.y > 1900) c.y = -1500;
      if (c.y < -1500) c.y = 1900;
      c.m.position.set(cx0 + c.laneX, c.y, c.z);
    }
    // Sweep searchlights across the skyline
    for (const l of this.lights) {
      l.m.position.x = cx0 + l.side * 380;
      l.m.rotation.z = Math.sin(t * 0.55 + l.ph) * 0.42;
      l.m.rotation.x = Math.PI * 0.5 + Math.cos(t * 0.38 + l.ph) * 0.25;
      l.mat.opacity = 0.065 + AudioZenith88.bass * 0.06;
    }
    // Bass-reactive train rail glow pulse
    if (R3.cars && AudioZenith88.bass > 0.02) {
      const em = 1.15 + AudioZenith88.bass * 1.35 + (G.odT > 0 ? 0.8 : 0);
      for (const car of R3.cars) for (const [r] of car.rails) if (r.material && r.material.emissiveIntensity != null) r.material.emissiveIntensity = em;
    }
    // Dynamic storm sheet-lightning & subtle distant thunder on rainy stages
    const stormy = !!(BG.T && BG.T.rain && inRun() && R3.q >= 1);
    if (stormy) {
      this.nextBolt -= d;
      if (this.nextBolt <= 0) {
        this.nextBolt = 7 + Math.random() * 11;
        this.flashT = 0.24;
        if (Aud.c && !Aud.quiet && Aud.gate('thund88', 4000)) {
          try { Aud.noise(0.85, 0.06, 220, 48, 'lowpass', Aud.c.currentTime + 0.35); } catch (e) { }
        }
      }
    }
    if (this.flashT > 0) {
      this.flashT = Math.max(0, this.flashT - d);
      if (R3.moon) R3.moon.intensity = 1.1 + (this.flashT / 0.24) * 2.4;
    } else if (R3.moon && R3.moon.intensity > 1.15) {
      R3.moon.intensity = 1.1;
    }
  }
};

/* ==========================================================================
   3. Weapons88 — 3 NEW EXOTIC WEAPONS WITH UNIQUE COMBAT MECHANICS
   ========================================================================== */
const Weapons88 = {
  waves: [], fields: [],
  reset() { this.waves.length = 0; this.fields.length = 0; },
  onSlash(a) {
    if (!simV(88) || !P.w) return;
    if (P.w.id === 'plasma_odachi') {
      // Launch twin crescent plasma wave forward
      this.waves.push({ x: P.x + Math.cos(a) * 24, y: P.y + Math.sin(a) * 24, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, a, r: 44, t: 0, dur: 0.42, dmg: P.w.dmg * 0.72 * (P.dmgMul || 1) * (G.dmgMod || 1), hit: new Set() });
      if (Aud.c && !Aud.quiet) Aud.tone(420, 1280, 0.14, 0.08, 'sawtooth');
    }
  },
  onKill(e) {
    if (!simV(88) || !P.w || P.w.id !== 'cyber_kusari' || !e) return;
    // Magnetic pull + chain lightning arc to nearest surviving enemy
    let best = null, bestD = 220;
    for (let i = 0; i < EN.n; i++) {
      const o = EN.a[i];
      if (!o || !o.alive || o === e || o.al > 0) continue;
      const d = dist(e.x, e.y, o.x, o.y);
      if (d < 190) {
        const pullA = Math.atan2(e.y - o.y, e.x - o.x);
        o.x += Math.cos(pullA) * 34; o.y += Math.sin(pullA) * 34;
      }
      if (d < bestD) { bestD = d; best = o; }
    }
    if (best) {
      const ang = Math.atan2(best.y - e.y, best.x - e.x);
      damageEnemy(best, P.w.dmg * 0.85 * (P.dmgMul || 1), ang, 3);
      FX.streak(e.x, e.y, ang, '#00ff9d', 8);
      FX.ring(best.x, best.y, 34, '#00ff9d', 3);
      if (Aud.c && !Aud.quiet) Aud.tone(1500, 2900, 0.08, 0.05, 'square');
    }
  },
  spawnStasis(x, y) {
    if (!simV(88) || !P.w || P.w.id !== 'chrono_glaive') return;
    this.fields.push({ x, y, r: 108, t: 0, dur: 2.2 });
    if (this.fields.length > 3) this.fields.shift();
    FX.ring(x, y, 108, '#7df9ff', 4);
    FX.text(x, y - 24, lt('STASIS FIELD'), '#7df9ff', 10, 1);
  },
  step(dt) {
    // Update Plasma Odachi waves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i]; w.t += dt;
      w.x += w.vx * dt; w.y += w.vy * dt;
      if (w.t >= w.dur) { this.waves.splice(i, 1); continue; }
      for (let j = 0; j < EN.n; j++) {
        const e = EN.a[j]; if (!e || !e.alive || e.al > 0 || w.hit.has(e)) continue;
        if (dist(w.x, w.y, e.x, e.y) < w.r + e.r) {
          w.hit.add(e);
          damageEnemy(e, w.dmg, w.a, 3);
          FX.spark(e.x, e.y, '#ff2bd6', 7);
        }
      }
      for (let j = 0; j < BU.n; j++) {
        const b = BU.a[j]; if (!b || !b.alive || b.rf) continue;
        if (dist(w.x, w.y, b.x, b.y) < w.r + b.r) { b.alive = false; FX.spark(b.x, b.y, '#00f2fe', 4); }
      }
    }
    // Update Chrono Glaive stasis fields
    for (let i = this.fields.length - 1; i >= 0; i--) {
      const f = this.fields[i]; f.t += dt;
      if (f.t >= f.dur) { this.fields.splice(i, 1); continue; }
      for (let j = 0; j < EN.n; j++) {
        const e = EN.a[j]; if (!e || !e.alive || e.al > 0) continue;
        if (dist(f.x, f.y, e.x, e.y) < f.r + e.r) { e.x -= (e.vx || 0) * dt * 0.62; e.y -= (e.vy || 0) * dt * 0.62; }
      }
      for (let j = 0; j < BU.n; j++) {
        const b = BU.a[j]; if (!b || !b.alive || b.rf) continue;
        if (dist(f.x, f.y, b.x, b.y) < f.r + b.r) { b.x -= b.vx * dt * 0.68; b.y -= b.vy * dt * 0.68; }
      }
    }
  },
  draw() {
    if (!inRun()) return;
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (const w of this.waves) {
      const u = w.t / w.dur;
      cx.save(); cx.translate(w.x, w.y); cx.rotate(w.a);
      cx.globalAlpha = (1 - u) * 0.9;
      cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 7 * (1 - u * 0.5);
      cx.beginPath(); cx.arc(-18, 0, w.r, -0.85, 0.85); cx.stroke();
      cx.strokeStyle = '#ffffff'; cx.lineWidth = 3 * (1 - u * 0.5);
      cx.beginPath(); cx.arc(-15, 0, w.r - 4, -0.75, 0.75); cx.stroke();
      cx.restore();
    }
    for (const f of this.fields) {
      const u = f.t / f.dur, pulse = 0.7 + Math.sin(CAM.t * 10) * 0.3;
      cx.globalAlpha = (1 - u * 0.7) * 0.22;
      cx.fillStyle = '#00f2fe';
      cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, TAU); cx.fill();
      cx.globalAlpha = (1 - u * 0.6) * 0.8 * pulse;
      cx.strokeStyle = '#7df9ff'; cx.lineWidth = 2.5;
      cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, TAU); cx.stroke();
    }
    cx.restore();
  }
};

try {
  if (typeof WEAPONS !== 'undefined' && Array.isArray(WEAPONS)) {
    const addW = [
      { id: 'plasma_odachi', name: 'PLASMA ODACHI', desc: 'Colossal neon greatsword. Every dash launches a twin plasma wave that slices foes and melts bullets.', dmg: 1.45, speed: 1360, ch: 2, crit: .20, cm: 2.2, heat: 24, reach: 12, cost: 2900 },
      { id: 'cyber_kusari', name: 'CYBER KUSARIGAMA', desc: 'Weighted neon chain-sickle. Kills pull nearby enemies inward and arc lightning to the nearest target.', dmg: 1.15, speed: 1460, ch: 3, crit: .24, cm: 2.0, heat: 20, reach: 10, cost: 3200 },
      { id: 'chrono_glaive', name: 'CHRONO GLAIVE', desc: 'Temporal twin-blade polearm. Wall ricochets drop a stasis field that slows enemies and bullets.', dmg: 1.25, speed: 1500, ch: 3, crit: .22, cm: 2.1, heat: 21, reach: 9, cost: 3400 }
    ];
    for (const w of addW) if (!WEAPONS.some(x => x.id === w.id)) WEAPONS.push(w);
  }
  if (typeof R3 !== 'undefined' && R3.wfam) {
    const wf88 = R3.wfam.bind(R3);
    R3.wfam = function (id) {
      return { plasma_odachi: 'long', cyber_kusari: 'chain', chrono_glaive: 'pole' }[id] || wf88(id);
    };
  }
} catch (e) { errLog(e); }

/* ==========================================================================
   4. Resonance88 — MULTISLASH OVERCLOCK & ZANSHIN COUNTER (simV(88) gated)
   ========================================================================== */
const Resonance88 = {
  dashKills: [], zanshinT: 0, lines: [], wasRic: false,
  reset() { this.dashKills.length = 0; this.zanshinT = 0; this.lines.length = 0; this.wasRic = false; },
  onParry() {
    if (!simV(88)) return;
    this.zanshinT = 1.35;
    HudZenith88.push(lt('PARRY') + ' · ZANSHIN', '#7df9ff');
  },
  onKill(e) {
    if (!simV(88) || !e) return;
    if (P.dashT > 0) this.dashKills.push([e.x, e.y]);
  },
  step(dt) {
    if (!simV(88) || G.state !== 'PLAY') return;
    if (this.zanshinT > 0) this.zanshinT = Math.max(0, this.zanshinT - dt);
    // Chrono Glaive wall bounce trigger
    if (P.dashT > 0 && (P.x <= V.L + P.r + 3 || P.x >= V.R - P.r - 3)) {
      if (!this.wasRic) { this.wasRic = true; Weapons88.spawnStasis(P.x, P.y); }
    } else if (P.dashT <= 0) {
      this.wasRic = false;
    }
    // Check dash end for MULTISLASH OVERCLOCK (3+ kills in one dash!)
    if (P.dashT <= 0 && this.dashKills.length > 0) {
      if (this.dashKills.length >= 3) {
        const n = this.dashKills.length;
        const pts = this.dashKills.slice();
        if (P.ch < P.maxCh) P.ch = Math.min(P.maxCh, P.ch + 1);
        addOD(20);
        G.score += Math.round(n * 350 * (G.diff ? G.diff.score : 1) * (G.scoreMul || 1));
        if (!REPLAY.fast) {
          const label = n >= 5 ? lt('GODLIKE SLASH!') : n === 4 ? lt('QUADRA SLASH!') : lt('TRIPLE SLASH!');
          FX.call(label, '#ffd700', 2.4, 28);
          Impact86.fire(P.x, P.y, '#ffd700', 1);
          Slash3D86.addWave(P.x, P.y, '#ffd700', 210);
          Audio86.subDrop(true);
          HudZenith88.push(label + ' x' + n, '#ffd700');
          this.lines.push({ pts, t: 0, dur: 0.55 });
        }
      }
      this.dashKills.length = 0;
    }
  },
  draw(rd) {
    const d = rd || 1 / 60;
    // Zanshin gold counter-aura around player
    if (this.zanshinT > 0 && G.state === 'PLAY') {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = '#ffd700';
      cx.globalAlpha = 0.55 + Math.sin(CAM.t * 22) * 0.35;
      cx.lineWidth = 3;
      cx.beginPath();
      cx.arc(P.x, P.y, P.r + 24 + Math.sin(CAM.t * 16) * 3, 0, TAU);
      cx.stroke();
      cx.restore();
    }
    // Geometric Multislash constellation lines
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const L = this.lines[i]; L.t += d;
      if (L.t >= L.dur) { this.lines.splice(i, 1); continue; }
      const u = L.t / L.dur;
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.globalAlpha = (1 - u) * 0.92;
      cx.strokeStyle = '#ffd700';
      cx.lineWidth = 4 * (1 - u * 0.7);
      cx.beginPath();
      L.pts.forEach((p, idx) => idx ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]));
      cx.stroke();
      for (const p of L.pts) {
        cx.fillStyle = '#ffffff';
        cx.beginPath(); cx.arc(p[0], p[1], 7 * (1 - u), 0, TAU); cx.fill();
      }
      cx.restore();
    }
  }
};

/* ==========================================================================
   5. BossZenith88 — ANIME BOSS PHASE WARNING BANNER
   ========================================================================== */
const BossZenith88 = {
  t: 0, dur: 1.5, title: '', sub: '', col: '#ff0844', lastPh: 0,
  trigger(title, sub, col) {
    if (CALM || (REPLAY.on && REPLAY.fast)) return;
    this.title = title; this.sub = sub; this.col = col || '#ff0844';
    this.t = this.dur;
  },
  draw(rd) {
    if (!inRun()) { this.t = 0; this.lastPh = 0; return; }
    const b = Boss.cur;
    if (b && b.ph > this.lastPh && this.lastPh > 0) {
      const lbl = b.ph >= 3 ? lt('FINAL PHASE') : lt('PHASE II');
      this.trigger(lt('WARNING') + ' // ' + lbl, lt(b.name || 'BOSS'), b.ph >= 3 ? '#ffd700' : '#ff2bd6');
    }
    this.lastPh = b ? (b.ph || 0) : 0;
    if (this.t <= 0) return;
    this.t = Math.max(0, this.t - (rd || 1 / 60));
    const u = 1 - this.t / this.dur;
    const a = u < 0.15 ? u / 0.15 : u > 0.78 ? (1 - u) / 0.22 : 1;
    const y = 128;
    cx.save();
    cx.globalAlpha = a * 0.92;
    cx.fillStyle = 'rgba(6, 7, 16, .82)';
    cx.fillRect(0, y - 22, V.VW, 44);
    cx.fillStyle = this.col;
    cx.fillRect(0, y - 22, V.VW, 2.5);
    cx.fillRect(0, y + 19.5, V.VW, 2.5);
    cx.textAlign = 'center';
    cx.font = '900 13px ' + FONT_D;
    cx.fillStyle = this.col;
    cx.fillText(this.title, V.VW * 0.5, y - 2);
    cx.font = '700 10px ' + FONT_M;
    cx.fillStyle = '#e8fbff';
    cx.fillText(this.sub, V.VW * 0.5, y + 13);
    cx.restore();
  }
};

/* ==========================================================================
   6. HudZenith88 — NON-INTRUSIVE TACTICAL KILL-FEED TICKER
   ========================================================================== */
const HudZenith88 = {
  items: [],
  enabled() {
    const s = Store.data && Store.data.settings;
    return !(s && s.feed88 === 0);
  },
  push(text, col) {
    if (!this.enabled() || (REPLAY.on && REPLAY.fast)) return;
    this.items.unshift({ text, col: col || '#00f2fe', t: 0, dur: 1.65 });
    if (this.items.length > 4) this.items.pop();
  },
  draw(rd) {
    if (!inRun() || !this.enabled()) { this.items.length = 0; return; }
    const d = rd || 1 / 60;
    const xr = V.VW - 12;
    cx.save();
    cx.textAlign = 'right';
    cx.font = '800 9px ' + FONT_M;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i]; it.t += d;
      if (it.t >= it.dur) { this.items.splice(i, 1); continue; }
      const u = it.t / it.dur;
      const slide = u < 0.14 ? (1 - u / 0.14) * 28 : 0;
      const alpha = u > 0.72 ? (1 - u) / 0.28 : 0.88;
      const y = 148 + i * 17;
      const w = cx.measureText(it.text).width + 12;
      cx.globalAlpha = alpha * 0.65;
      cx.fillStyle = '#060812';
      cx.fillRect(xr - w + slide, y - 10, w, 13);
      cx.fillStyle = it.col;
      cx.fillRect(xr - 2 + slide, y - 10, 2, 13);
      cx.globalAlpha = alpha;
      cx.fillText(it.text, xr - 6 + slide, y);
    }
    cx.restore();
  }
};

/* ==========================================================================
   HOOK WIRING — Clean, isolated, zero-regression v88 integration
   ========================================================================== */
{
  const db88 = Director.begin.bind(Director);
  Director.begin = function () {
    Resonance88.reset(); Weapons88.reset(); HudZenith88.items.length = 0;
    return db88.apply(this, arguments);
  };

  const sl88 = slash;
  slash = function (a) {
    const wasZan = simV(88) && Resonance88.zanshinT > 0;
    const oldDmgMul = P.dmgMul;
    if (wasZan) {
      Resonance88.zanshinT = 0;
      P.dmgMul = (P.dmgMul || 1) * 1.5;
      if (!REPLAY.fast) {
        FX.text(P.x, P.y - 38, lt('ZANSHIN COUNTER!'), '#ffd700', 12, 1);
        Slash3D86.addWave(P.x, P.y, '#ffd700', 135);
        HudZenith88.push(lt('ZANSHIN COUNTER!'), '#ffd700');
      }
    }
    const r = sl88.apply(this, arguments);
    if (wasZan) P.dmgMul = oldDmgMul;
    try { Weapons88.onSlash(P.ang); } catch (e) { errLog(e); }
    return r;
  };

  const sim88 = sim;
  sim = function (dt, rd) {
    const r = sim88(dt, rd);
    try { Weapons88.step(dt); Resonance88.step(dt); } catch (e) { errLog(e); }
    return r;
  };

  const pb88 = parryBullet;
  parryBullet = function (b) {
    const r = pb88.apply(this, arguments);
    try { Resonance88.onParry(); } catch (e) { errLog(e); }
    return r;
  };

  const ke88 = killEnemy;
  killEnemy = function (e, a, src) {
    const wasExec = !!(e && e.exec);
    const r = ke88.apply(this, arguments);
    try {
      Resonance88.onKill(e);
      Weapons88.onKill(e);
      if (wasExec) HudZenith88.push(lt('EXECUTION'), '#ff0844');
    } catch (er) { errLog(er); }
    return r;
  };

  const dp88 = drawPlayer;
  drawPlayer = function () {
    try { Weapons88.draw(); Resonance88.draw(RDT); } catch (e) { errLog(e); }
    return dp88.apply(this, arguments);
  };

  const hd88 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try { BossZenith88.draw(rd); HudZenith88.draw(rd); } catch (e) { errLog(e); }
    return hd88(rd);
  };

  const r3_88 = R3.render.bind(R3);
  R3.render = function (rd) {
    try { ZenithWorld88.tick(rd); } catch (e) { errLog(e); }
    return r3_88(rd);
  };

  // Drive live spectrum bar every frame (menu + Music Room + bass feed for 3D)
  Pipe.on('post', 'zenith88_viz', () => {
    try { AudioZenith88.tick(); } catch (e) { errLog(e); }
  }, 98);

  if (typeof PC !== 'undefined' && PC.settings) {
    const ps88 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps88(head, cycle, box, s);
      try {
        head('ZENITH EDITION (v88)');
        cycle('Tactical kill feed', 'feed88', [1, 0], ['ON', 'OFF']);
        cycle('Audio spectrum bar', 'viz88', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

