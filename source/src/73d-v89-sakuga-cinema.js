/* ==========================================================================
   VERSION 89.0 — SAKUGA & CINEMA MASTERWORK
   1. SakugaRig89   — Full 16-bone Mixamo combat choreography (6-hit anime
                      combo, Iaido crouch focus stance, parry guard pose,
                      idle Chiburi flourish, dual-blade & heavy motion,
                      smooth corner banking & sprint lean)
   2. SakugaVFX89   — 3D volumetric crescent slash arcs in world space,
                      Sandevistan prismatic afterimage clones,
                      Zandatsu / Katana-ZERO enemy bisection (3D + 2D),
                      3D enemy hit-recoil & attack anticipation telegraphs
   3. Cinema3D89    — Procedural Cyber-Neon IBL EnvMap (PMREMGenerator),
                      Embossed Wet Normal-Mapped Train Roof,
                      4-Light Pooled Dynamic 3D Impact Flash Lights,
                      Style-Reactive Lighting & Fog, Anime RGB Split &
                      Low-HP Heartbeat Vignette
   4. KineticCam89  — Spring-damped dash zoom-punch, Iaido focus tighten,
                      directional impact kick & anime radial speedlines
   5. CrateSakuga89 — Next-gen gacha crate energy cracks, 3-frame anime
                      shatter flash & tumbling prismatic shards
   6. StyleRank89   — DMC-style animated Style Rank badge (D -> SSS)
   7. AudioCinema89 — Adaptive DMC soundtrack filter, Spatial Stereo Panning,
                      Iaido draw / robot-vs-demon / rank-up Foley &
                      2 new flagship tracks (SANDEVISTAN PULSE, BLADE OF ETERNITY)
   ========================================================================== */

/* ---- 4-language translations for v89 ---- */
try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "SAKUGA & CINEMA (v89)": "מהדורת SAKUGA & CINEMA (v89)",
    "3D Slash Arcs": "קשתות חיתוך 3D",
    "Sandevistan Clones": "כפילי סנדביסטן",
    "Zandatsu Slicing": "חיתוך אויבים לשניים",
    "Cinema 3D Reflections": "השתקפויות 3D וגג רטוב",
    "Dynamic Flash Lights": "הבזקי תאורה תלת־ממדיים",
    "Kinetic Action Camera": "מצלמת אקשן דינמית",
    "Style Rank Badge": "מד סגנון קרב (D-SSS)",
    "Spatial Stereo Foley": "סאונד סטריאו מרחבי",
    "DEADLY": "קטלני",
    "CYBER": "סייבר",
    "BRUTAL": "ברוטאלי",
    "APEX": "אפקס",
    "SAVAGE": "פראי",
    "SUPREME": "עליון",
    "OVERDRIVE GOD": "אל האוברדרייב"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "SAKUGA & CINEMA (v89)": "إصدار SAKUGA & CINEMA (v89)",
    "3D Slash Arcs": "أقواس قطع ثلاثية الأبعاد",
    "Sandevistan Clones": "أشباح سانديفيستان",
    "Zandatsu Slicing": "تقطيع الأعداء نصفين",
    "Cinema 3D Reflections": "انعكاسات 3D وسطح رطب",
    "Dynamic Flash Lights": "أضواء صدمة ديناميكية",
    "Kinetic Action Camera": "كاميرا أكشن ديناميكية",
    "Style Rank Badge": "شارة أسلوب القتال (D-SSS)",
    "Spatial Stereo Foley": "صوت ستيريو مكاني"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "SAKUGA & CINEMA (v89)": "SAKUGA & CINEMA (v89)",
    "3D Slash Arcs": "3D-дуги ударов",
    "Sandevistan Clones": "Клоны Сандевистана",
    "Zandatsu Slicing": "Разрубание врагов",
    "Cinema 3D Reflections": "3D-отражения и мокрая крыша",
    "Dynamic Flash Lights": "Динамические вспышки света",
    "Kinetic Action Camera": "Динамическая камера",
    "Style Rank Badge": "Ранг стиля (D-SSS)",
    "Spatial Stereo Foley": "Пространственный стерео-звук"
  });
} catch (e) { errLog(e); }

const S89 = {
  on(k) {
    try {
      const s = Store && Store.data && Store.data.settings;
      return !s || s[k] == null ? true : !!s[k];
    } catch (e) { return true; }
  }
};

/* ==========================================================================
   1. AudioCinema89 — ADAPTIVE MUSIC, SPATIAL STEREO FOLEY & 2 NEW TRACKS
   ========================================================================== */
const AudioCinema89 = {
  wasAim: false,
  init() {
    try {
      if (typeof TRACKS !== 'undefined' && typeof mkTrack === 'function') {
        Object.assign(TRACKS, {
          sandevistan: mkTrack({
            name: 'SANDEVISTAN PULSE', style: 'Edgerunners hyper-synth', bpm: 164, root: 73.42, sc: 'min',
            drums: { k: 'x..x..x.x..x..x.', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' },
            bass:  [0, 0, 12, 0, 7, 7, 10, 7, 5, 5, 12, 5, 3, 3, 7, 10],
            lead:  [12, -1, 15, 19, 17, -1, 15, 12, 10, -1, 12, 15, 19, 22, 19, 15],
            arp:   [0, 7, 12, 15, 0, 7, 12, 19],
            pad:   [0, 7, 12, 15],
            timbre: { l: 'sawtooth', b: 'sawtooth', a: 'square', p: 'triangle' },
            col: '#00f2fe'
          }),
          eternity: mkTrack({
            name: 'BLADE OF ETERNITY', style: 'Anime boss orchestral rock', bpm: 146, root: 58.27, sc: 'hir',
            drums: { k: 'x...x.x.x...x.xx', s: '....x.......x..x', h: 'x.xxx.xxx.xxx.xx' },
            bass:  [0, 0, 0, 7, 5, 5, 3, 2, 0, 0, 10, 7, 5, 3, 2, 0],
            lead:  [12, 14, 15, -1, 19, 17, 15, 14, 12, -1, 10, 12, 15, 19, 24, 19],
            arp:   [0, 5, 7, 12, 15, 12, 7, 5],
            pad:   [0, 5, 12, 19],
            timbre: { l: 'sawtooth', b: 'triangle', a: 'sawtooth', p: 'sawtooth' },
            col: '#ff4fd8'
          })
        });
        const ids89 = ['sandevistan', 'eternity'];
        if (typeof TRACK_LIST !== 'undefined' && Array.isArray(TRACK_LIST))
          for (const id of ids89) if (TRACK_LIST.indexOf(id) < 0) TRACK_LIST.push(id);
        if (typeof RUN_TRACKS !== 'undefined' && Array.isArray(RUN_TRACKS))
          for (const id of ids89) if (RUN_TRACKS.indexOf(id) < 0) RUN_TRACKS.push(id);
      }
    } catch (e) { errLog(e); }
  },
  panForX(worldX) {
    try {
      const cx0 = (typeof GL3D !== 'undefined' && GL3D.cam && GL3D.cam.x) || (typeof P !== 'undefined' ? P.x : 0);
      return Math.max(-0.85, Math.min(0.85, ((worldX - cx0) / 360)));
    } catch (e) { return 0; }
  },
  /* Spatial stereo tone burst using StereoPannerNode */
  panTone(f1, f2, dur, vol, type, panVal, delay) {
    try {
      const A = Aud; if (!A || !A.c || A.c.state !== 'running' || A.quiet || !(+Store.data.settings.sfx || 0)) return;
      const c = A.c, t = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'triangle';
      o.frequency.setValueAtTime(Math.max(25, f1), t);
      o.frequency.exponentialRampToValueAtTime(Math.max(25, f2), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      if (S89.on('spatial89') && typeof c.createStereoPanner === 'function') {
        const p = c.createStereoPanner();
        p.pan.setValueAtTime(panVal || 0, t);
        g.connect(p); p.connect(A.sfxBus);
      } else {
        g.connect(A.sfxBus);
      }
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  },
  /* Crisp Iaido metallic unsheathe whisper when entering aim stance */
  iaidoDraw() {
    this.panTone(2200, 3850, 0.14, 0.055, 'sine', 0, 0);
    this.panTone(1150, 1900, 0.12, 0.04, 'triangle', 0, 0.015);
  },
  /* Velocity-pitched katana slice & sub-snap in stereo */
  sliceSfx(worldX, isCrit, comboIdx) {
    const pan = this.panForX(worldX);
    const pitchMul = 1 + (comboIdx || 0) * 0.06;
    this.panTone((isCrit ? 1980 : 1540) * pitchMul, 620, 0.14, isCrit ? 0.12 : 0.075, 'triangle', pan, 0);
    this.panTone((isCrit ? 3200 : 2450) * pitchMul, 1180, 0.09, 0.045, 'sine', pan, 0.014);
    this.panTone(74, 34, 0.16, isCrit ? 0.15 : 0.095, 'sine', pan * 0.35, 0);
  },
  /* Distinct enemy kill Foley: metallic spark for bots vs. dark resonance for demons */
  killFoley(e) {
    if (!e) return;
    const pan = this.panForX(e.x);
    const isMech = e.type === 1 || e.type === 2 || e.type === 5 || e.type === 7;
    if (isMech) {
      this.panTone(2800, 680, 0.11, 0.06, 'sawtooth', pan, 0);
      this.panTone(1450, 340, 0.14, 0.05, 'square', pan, 0.025);
    } else {
      this.panTone(420, 120, 0.2, 0.08, 'triangle', pan, 0);
      this.panTone(880, 290, 0.14, 0.045, 'sine', pan, 0.02);
    }
  },
  /* Electronic anime chord stab when climbing Style Rank (D -> SSS) */
  rankUpStab(rankIdx) {
    const roots = [330, 392, 440, 523.25, 587.33, 659.25, 783.99];
    const r = roots[Math.min(roots.length - 1, rankIdx || 0)];
    this.panTone(r, r * 1.01, 0.22, 0.07, 'sawtooth', -0.25, 0);
    this.panTone(r * 1.5, r * 1.51, 0.25, 0.065, 'triangle', 0.25, 0.02);
    if (rankIdx >= 4) this.panTone(r * 2, r * 2.02, 0.3, 0.06, 'sine', 0, 0.04);
  },
  /* Adaptive DMC-style music filter brightness & slow-mo focus ducking */
  tickAdaptive() {
    try {
      const A = Aud; if (!A || !A.c || !A.mf || A.c.state !== 'running') return;
      const inGame = typeof inRun === 'function' && inRun();
      const aiming = inGame && typeof In !== 'undefined' && (In.on || (typeof G !== 'undefined' && G.slowK < 0.82));
      if (aiming && !this.wasAim && G.state === 'PLAY') this.iaidoDraw();
      this.wasAim = aiming;
      if (!inGame) return;
      const combo = (typeof G !== 'undefined' && G.combo) | 0;
      const isOD = typeof G !== 'undefined' && G.odT > 0;
      const hasBoss = typeof Boss !== 'undefined' && !!Boss.cur;
      // Scale lowpass cutoff smoothly: muffled focus when aiming -> bright, electrifying brilliance at S/SS/SSS
      let targetFreq = 9500 + Math.min(9500, combo * 240) + (isOD ? 3000 : 0) + (hasBoss ? 2200 : 0);
      if (aiming) targetFreq = 1650;
      else if (typeof G !== 'undefined' && (G.state === 'PAUSE' || G.photo)) targetFreq = 1200;
      A.mf.frequency.setTargetAtTime(Math.min(20000, targetFreq), A.c.currentTime, 0.08);
    } catch (e) {}
  }
};
AudioCinema89.init();

/* ==========================================================================
   2. Cinema3D89 — PROCEDURAL NEON IBL, WET NORMAL ROOF, FLASH LIGHTS & RGB
   ========================================================================== */
const Cinema3D89 = {
  ready: false,
  flashes: [],
  rgbT: 0,
  vigEl: null,
  rgbEl: null,
  baseEnvBuilt: false,
  /* Build a rich Neon Cyber-Skyline IBL Environment Map via PMREMGenerator */
  buildEnvMap() {
    if (this.baseEnvBuilt || !S89.on('refl89') || typeof THREE === 'undefined' || !R3 || !R3.rn || !R3.scene) return;
    this.baseEnvBuilt = true;
    try {
      const T = THREE;
      if (typeof T.PMREMGenerator !== 'function') return;
      const pmrem = new T.PMREMGenerator(R3.rn);
      pmrem.compileEquirectangularShader();
      const envScene = new T.Scene();
      envScene.background = new T.Color(0x070a18);
      // Overhead cyber neon light strips & skyline glow panels for crisp metallic reflections
      const panels = [
        [0x00f2fe, 14, 3, 0, 12, 8, 2.8],
        [0xff4fd8, 16, 3, -12, 9, -6, 2.6],
        [0xffd700, 10, 2.5, 13, 8, -4, 2.4],
        [0x7b61ff, 18, 4, 0, -10, 0, 1.4],
        [0xffffff, 8, 2, 4, 15, 4, 3.2]
      ];
      for (const [col, w, h, x, y, z, inten] of panels) {
        const m = new T.Mesh(
          new T.PlaneGeometry(w, h),
          new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(inten), side: T.DoubleSide })
        );
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        envScene.add(m);
      }
      const rt = pmrem.fromScene(envScene, 0.04);
      R3.scene.environment = rt.texture;
      pmrem.dispose();
    } catch (e) { errLog(e); }
  },
  /* Upgrade the train roof with embossed steel seam Normal Map + wet reflections */
  upgradeRoof() {
    if (!S89.on('refl89') || typeof THREE === 'undefined' || !R3 || !R3.roofMat || R3.roofMat._v89) return;
    R3.roofMat._v89 = true;
    try {
      const T = THREE;
      const cvN = document.createElement('canvas');
      cvN.width = 256; cvN.height = 512;
      const g = cvN.getContext('2d');
      // Neutral normal base (128, 128, 255)
      g.fillStyle = 'rgb(128,128,255)';
      g.fillRect(0, 0, 256, 512);
      // Embossed steel plate seams & bevels
      for (let py = 0; py < 512; py += 64) {
        g.fillStyle = 'rgb(128,185,255)'; g.fillRect(0, py, 256, 2);
        g.fillStyle = 'rgb(128,70,255)';  g.fillRect(0, py + 2, 256, 2);
      }
      for (let px = 0; px < 256; px += 64) {
        g.fillStyle = 'rgb(185,128,255)'; g.fillRect(px, 0, 2, 512);
        g.fillStyle = 'rgb(70,128,255)';  g.fillRect(px + 2, 0, 2, 512);
      }
      // Subtle diagonal rain-sheen streaks
      g.strokeStyle = 'rgba(150,150,255,0.22)';
      g.lineWidth = 1;
      for (let i = 0; i < 42; i++) {
        const rx = (i * 59) % 256, ry = (i * 113) % 512;
        g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + 6, ry + 24); g.stroke();
      }
      const normTex = new T.CanvasTexture(cvN);
      normTex.wrapS = normTex.wrapT = T.RepeatWrapping;
      normTex.repeat.set(3, 6);
      R3.roofMat.normalMap = normTex;
      R3.roofMat.normalScale = new T.Vector2(0.85, 0.85);
      R3.roofMat.metalness = 0.52;
      R3.roofMat.roughness = 0.62;
      R3.roofMat.envMapIntensity = 1.9;
      R3.roofMat.needsUpdate = true;
    } catch (e) { errLog(e); }
  },
  /* Pool 4 dynamic 3D impact PointLights for zero-GC combat flashes */
  initFlashes() {
    if (this.flashes.length || typeof THREE === 'undefined' || !R3 || !R3.scene) return;
    try {
      const T = THREE;
      for (let i = 0; i < 4; i++) {
        const l = new T.PointLight(0x00f2fe, 0, 320, 1.6);
        l.position.set(0, 0, 28);
        R3.scene.add(l);
        this.flashes.push({ l, t: 0, d: 0.2, peak: 0 });
      }
    } catch (e) {}
  },
  flash(x, y, col, intensity, dur) {
    if (!S89.on('flash89') || CALM || !this.flashes.length) return;
    // Reuse oldest / inactive light
    let best = this.flashes[0];
    for (const f of this.flashes) if (f.t <= 0 || f.t < best.t) best = f;
    best.l.color.set(col || '#00f2fe');
    best.l.position.set(x, -y, 30);
    best.peak = intensity || 520;
    best.d = dur || 0.22;
    best.t = best.d;
    best.l.intensity = best.peak;
  },
  triggerRGB(strength) {
    if (CALM) return;
    this.rgbT = Math.max(this.rgbT, strength || 1);
  },
  ensureOverlays() {
    if (!this.vigEl) {
      this.vigEl = document.createElement('div');
      this.vigEl.id = 'cinema89-vig';
      document.body.appendChild(this.vigEl);
    }
    if (!this.rgbEl) {
      this.rgbEl = document.createElement('div');
      this.rgbEl.id = 'cinema89-rgb';
      document.body.appendChild(this.rgbEl);
    }
  },
  tick(rd) {
    const dt = Math.min(0.05, rd || 0.016);
    if (!this.ready && typeof R3 !== 'undefined' && R3.ok) {
      this.ready = true;
      this.buildEnvMap();
      this.upgradeRoof();
      this.initFlashes();
    }
    this.ensureOverlays();
    // 1. Decay dynamic 3D impact PointLights
    for (const f of this.flashes) {
      if (f.t > 0) {
        f.t = Math.max(0, f.t - dt);
        const u = f.t / f.d;
        f.l.intensity = f.peak * u * u;
      } else {
        f.l.intensity = 0;
      }
    }
    // 2. Style-reactive rim light & Overdrive atmosphere boost
    if (typeof R3 !== 'undefined' && R3.rim && typeof G !== 'undefined' && typeof inRun === 'function' && inRun()) {
      const c = G.combo | 0, isOD = G.odT > 0;
      if (isOD) {
        R3.rim.color.lerp(new THREE.Color('#ffd700'), dt * 4);
        R3.rim.intensity = 2.9;
      } else if (c >= 34) {
        R3.rim.color.lerp(new THREE.Color('#ff0844'), dt * 3);
        R3.rim.intensity = 2.6;
      } else if (c >= 22) {
        R3.rim.color.lerp(new THREE.Color('#ff4fd8'), dt * 3);
        R3.rim.intensity = 2.3;
      } else {
        R3.rim.color.lerp(new THREE.Color('#00f2fe'), dt * 2);
        R3.rim.intensity = 1.9;
      }
    }
    // 3. Chromatic Aberration RGB Split overlay decay
    if (this.rgbT > 0) {
      this.rgbT = Math.max(0, this.rgbT - dt * 5.2);
      this.rgbEl.style.opacity = Math.min(0.9, this.rgbT).toFixed(3);
    } else if (this.rgbEl.style.opacity !== '0') {
      this.rgbEl.style.opacity = '0';
    }
    // 4. Low-HP Heartbeat Vignette
    const lowHp = typeof inRun === 'function' && inRun() && typeof P !== 'undefined' && P.hp <= 1 && G.state === 'PLAY';
    if (lowHp && !CALM) {
      const pulse = 0.45 + Math.sin(performance.now() * 0.009) * 0.3;
      this.vigEl.style.opacity = pulse.toFixed(3);
    } else if (this.vigEl.style.opacity !== '0') {
      this.vigEl.style.opacity = '0';
    }
  }
};

/* ==========================================================================
   3. SakugaRig89 — FULL 16-BONE ANIME SKELETAL COMBAT CHOREOGRAPHY
   ========================================================================== */
const SakugaRig89 = {
  AX_X: null, AX_Y: null, AX_Z: null,
  COMBO: ['iaido', 'kesa', 'gyaku', 'cyclone', 'xcross', 'kabuto'],
  lastMoveIdx: 0,
  parryT: 0,
  initAxes() {
    if (!this.AX_X && typeof THREE !== 'undefined') {
      this.AX_X = new THREE.Vector3(1, 0, 0);
      this.AX_Y = new THREE.Vector3(0, 1, 0);
      this.AX_Z = new THREE.Vector3(0, 0, 1);
    }
  },
  bindExtraBones(g) {
    const h = g && g.human; if (!h || h._b89) return;
    h._b89 = true;
    const o = h.r && h.r.o; if (!o) return;
    const B = h.B;
    const f = n => Human.bone(o, n);
    B.neck   = B.neck   || f('Neck');
    B.rSh    = B.rSh    || f('RightShoulder');
    B.lSh    = B.lSh    || f('LeftShoulder');
    B.lArm   = B.lArm   || f('LeftArm');
    B.lFore  = B.lFore  || f('LeftForeArm');
    B.rUpLeg = B.rUpLeg || f('RightUpLeg');
    B.lUpLeg = B.lUpLeg || f('LeftUpLeg');
    B.rLeg   = B.rLeg   || f('RightLeg');
    B.lLeg   = B.lLeg   || f('LeftLeg');
  },
  easeOut(u) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3); },
  easeInOut(u) { u = Math.max(0, Math.min(1, u)); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
  evalMove(kind, u, dual, heavy) {
    const w = heavy ? 1.28 : 1;
    const eO = this.easeOut, eIO = this.easeInOut;
    const p = { rArmY: 0, rArmX: 0, rArmZ: 0, rForeX: 0, lArmY: 0, lArmX: 0, lForeX: 0, spineX: 0, spine2Y: 0, spine2Z: 0, headY: 0, crouch: 0, liftZ: 0, spinZ: 0 };
    if (kind === 'iaido') {
      const wind = eIO(Math.min(1, u / .24));
      const snap = eO(Math.max(0, Math.min(1, (u - .24) / .24)));
      const rec  = eIO(Math.max(0, (u - .68) / .32));
      p.crouch  = (0.45 * wind - 0.15 * snap) * (1 - rec);
      p.spineX  = (0.42 * wind + 0.18 * snap) * (1 - rec);
      p.spine2Y = (-1.15 * wind + 2.35 * snap) * (1 - rec);
      p.rArmY   = (-0.9 * wind + 2.4 * snap) * (1 - rec) * w;
      p.rArmZ   = (0.65 * wind - 1.15 * snap) * (1 - rec);
      p.rForeX  = (0.9 * wind - 0.7 * snap) * (1 - rec);
      p.lArmY   = (0.7 * wind - 1.2 * snap) * (1 - rec);
      p.headY   = (0.5 * wind - 0.5 * snap) * (1 - rec);
    } else if (kind === 'kesa') {
      const wind = eIO(Math.min(1, u / .28));
      const snap = eO(Math.max(0, Math.min(1, (u - .28) / .22)));
      const rec  = eIO(Math.max(0, (u - .68) / .32));
      p.spineX  = (-0.2 * wind + 0.65 * snap) * (1 - rec);
      p.spine2Y = (0.75 * wind - 1.75 * snap) * (1 - rec);
      p.spine2Z = (0.25 * wind - 0.5 * snap) * (1 - rec);
      p.rArmY   = (2.15 * wind - 2.95 * snap) * (1 - rec) * w;
      p.rArmX   = (0.55 * wind - 0.9 * snap) * (1 - rec);
      p.rForeX  = (0.6 * wind - 0.4 * snap) * (1 - rec);
      p.lArmY   = (dual ? (-1.2 * wind + 2.2 * snap) : (-0.5 * wind + 0.95 * snap)) * (1 - rec);
      p.crouch  = 0.32 * snap * (1 - rec);
    } else if (kind === 'gyaku') {
      const wind = eIO(Math.min(1, u / .22));
      const snap = eO(Math.max(0, Math.min(1, (u - .22) / .26)));
      const rec  = eIO(Math.max(0, (u - .7) / .3));
      p.crouch  = (0.52 * wind - 0.52 * snap) * (1 - rec);
      p.liftZ   = Math.sin(Math.max(0, Math.min(1, (u - .2) / .55)) * Math.PI) * 14;
      p.spineX  = (0.55 * wind - 0.85 * snap) * (1 - rec);
      p.spine2Y = (-0.85 * wind + 1.65 * snap) * (1 - rec);
      p.rArmY   = (-0.95 * wind + 3.1 * snap) * (1 - rec) * w;
      p.rArmZ   = (-0.4 * wind + 0.85 * snap) * (1 - rec);
      p.lArmY   = (0.55 * wind - 1.05 * snap) * (1 - rec);
    } else if (kind === 'cyclone') {
      const s = eIO(Math.min(1, u / .72));
      const rec = eIO(Math.max(0, (u - .72) / .28));
      p.spinZ   = s * Math.PI * 2;
      p.liftZ   = Math.sin(Math.min(1, u / .82) * Math.PI) * 20;
      p.spineX  = 0.35 * (1 - rec);
      p.rArmY   = 1.45 * (1 - rec);
      p.rArmZ   = -0.95 * (1 - rec);
      p.lArmY   = (dual ? 1.45 : -0.9) * (1 - rec);
    } else if (kind === 'xcross') {
      const wind = eIO(Math.min(1, u / .25));
      const snap = eO(Math.max(0, Math.min(1, (u - .25) / .24)));
      const rec  = eIO(Math.max(0, (u - .68) / .32));
      p.crouch  = 0.35 * wind * (1 - rec);
      p.spineX  = (0.25 * wind + 0.35 * snap) * (1 - rec);
      p.rArmY   = (1.4 * wind - 2.3 * snap) * (1 - rec);
      p.rArmZ   = (0.85 * wind - 1.65 * snap) * (1 - rec);
      p.lArmY   = (1.4 * wind - 2.3 * snap) * (1 - rec);
      p.lArmX   = (-0.75 * wind + 1.4 * snap) * (1 - rec);
    } else if (kind === 'kabuto') {
      const jump = Math.sin(Math.min(1, u / .66) * Math.PI);
      const slam = eO(Math.max(0, Math.min(1, (u - .38) / .22)));
      const rec  = eIO(Math.max(0, (u - .72) / .28));
      p.liftZ   = jump * 28;
      p.crouch  = (u > .58 ? 0.65 * (1 - rec) : 0);
      p.spineX  = (-0.45 * jump + 0.95 * slam) * (1 - rec);
      p.rArmY   = (2.4 * Math.min(1, u / .38) - 3.3 * slam) * (1 - rec) * w;
      p.lArmY   = (1.8 * Math.min(1, u / .38) - 2.5 * slam) * (1 - rec);
      p.rForeX  = (0.8 * Math.min(1, u / .38) - 0.6 * slam) * (1 - rec);
    }
    return p;
  },
  apply(g, o, rd, t) {
    if (!g || !g.human || !g.human.B) return;
    this.initAxes();
    this.bindExtraBones(g);
    const B = g.human.B;
    const isMainHero = typeof R3 !== 'undefined' && R3.ents && R3.ents.get('hero') && R3.ents.get('hero').g === g;
    const dash = !!o.dashing;
    const sp = o.spd || 0;
    const dt = Math.min(.05, rd || .016);
    const dual = !!g.blade2;
    const heavy = g.wfam === 'hammer' || g.wfam === 'heavy' || (typeof P !== 'undefined' && (P.w === 'odachi' || P.w === 'glaive'));

    if (dash && !g._s89Dash) {
      const idx = (g._s89Gap || 0) > 1.35 ? 0 : ((g._s89Idx == null ? -1 : g._s89Idx) + 1) % this.COMBO.length;
      g._s89Idx = idx;
      const kind = this.COMBO[idx];
      const dur = kind === 'cyclone' ? .52 : kind === 'kabuto' ? .54 : .42;
      g._s89Mv = { k: kind, t: 0, d: dur };
      if (isMainHero) {
        this.lastMoveIdx = idx;
        try {
          SakugaVFX89.spawnSlashArc(P.x, P.y, P.ang || o.face || 0, kind);
          Cinema3D89.flash(P.x, P.y, (G && G.odT > 0) ? '#ffd700' : (P.ca || '#00f2fe'), 480, 0.2);
        } catch (e) {}
      }
    }
    g._s89Dash = dash;
    g._s89Gap = dash ? 0 : (g._s89Gap || 0) + dt;

    const aiming = isMainHero && typeof In !== 'undefined' && (In.on || (typeof G !== 'undefined' && G.slowK < .82 && !dash && G.state === 'PLAY'));
    g._s89Aim = (g._s89Aim || 0) + ((aiming ? 1 : 0) - (g._s89Aim || 0)) * Math.min(1, dt * 14);

    const face = o.face || 0;
    let dAng = face - (g._s89PrevFace == null ? face : g._s89PrevFace);
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    g._s89PrevFace = face;
    const targetBank = Math.max(-.38, Math.min(.38, dAng * 4.5));
    g._s89Bank = (g._s89Bank || 0) + (targetBank - (g._s89Bank || 0)) * Math.min(1, dt * 11);

    if (!dash && sp < 25 && !aiming && !g._s89Mv) g._s89Idle = (g._s89Idle || 0) + dt;
    else g._s89Idle = 0;

    let liftZ = 0, spinZ = 0, crouch = 0;

    const mv = g._s89Mv;
    if (mv) {
      mv.t += dt;
      const u = mv.t / mv.d;
      if (u >= 1) {
        g._s89Mv = null;
      } else {
        const pose = this.evalMove(mv.k, u, dual, heavy);
        crouch += pose.crouch;
        liftZ += pose.liftZ;
        spinZ += pose.spinZ;
        if (B.spine)  B.spine.rotateX(pose.spineX);
        if (B.spine2) { B.spine2.rotateY(pose.spine2Y); if (pose.spine2Z) B.spine2.rotateZ(pose.spine2Z); }
        if (B.rArm)   { B.rArm.rotateOnAxis(this.AX_Y, pose.rArmY); if (pose.rArmX) B.rArm.rotateX(pose.rArmX); if (pose.rArmZ) B.rArm.rotateZ(pose.rArmZ); }
        if (B.rFore && pose.rForeX) B.rFore.rotateX(pose.rForeX);
        if (B.lArm)   { B.lArm.rotateOnAxis(this.AX_Y, pose.lArmY); if (pose.lArmX) B.lArm.rotateX(pose.lArmX); }
        if (B.head && pose.headY) B.head.rotateY(pose.headY);
      }
    }

    const am = g._s89Aim || 0;
    if (am > .02 && !mv) {
      crouch += 0.52 * am;
      const breath = Math.sin(t * 7) * .04 * am;
      if (B.spine)  B.spine.rotateX(0.38 * am + breath);
      if (B.spine2) B.spine2.rotateY(-0.78 * am);
      if (B.rArm)   { B.rArm.rotateOnAxis(this.AX_Y, -0.82 * am); B.rArm.rotateZ(0.45 * am); }
      if (B.rFore)  B.rFore.rotateX(0.95 * am);
      if (B.lArm)   { B.lArm.rotateOnAxis(this.AX_Y, 0.55 * am); B.lArm.rotateX(0.35 * am); }
      if (B.head)   B.head.rotateY(0.68 * am);
    }

    if (isMainHero && this.parryT > 0) {
      this.parryT = Math.max(0, this.parryT - dt);
      const pk = Math.sin(Math.min(1, this.parryT / .28) * Math.PI);
      if (B.spine2) B.spine2.rotateY(0.75 * pk);
      if (B.rArm)   { B.rArm.rotateOnAxis(this.AX_Y, 1.55 * pk); B.rArm.rotateZ(-0.65 * pk); }
      if (B.rFore)  B.rFore.rotateX(0.85 * pk);
      if (B.lArm)   B.lArm.rotateOnAxis(this.AX_Y, 0.9 * pk);
    }

    if (!dash && !mv && am < .1) {
      const br = Math.sin(t * 2.8) * .035;
      if (B.spine2) B.spine2.rotateX(br);
      if (g._s89Idle > 2.4 && g._s89Idle < 3.15) {
        const fu = (g._s89Idle - 2.4) / .75;
        const fk = Math.sin(fu * Math.PI);
        if (B.rArm) B.rArm.rotateOnAxis(this.AX_Y, 0.65 * fk);
        if (B.rFore) B.rFore.rotateZ(0.9 * Math.sin(fu * Math.PI * 2));
      }
    }

    if (crouch > .01) {
      if (B.rUpLeg) B.rUpLeg.rotateX(-0.55 * crouch);
      if (B.lUpLeg) B.lUpLeg.rotateX(-0.45 * crouch);
      if (B.rLeg)   B.rLeg.rotateX(0.85 * crouch);
      if (B.lLeg)   B.lLeg.rotateX(0.78 * crouch);
    }
    const spdLean = Math.min(.32, (sp / 520) * .28);
    if (B.spine && spdLean > .02 && !mv) B.spine.rotateX(spdLean);

    if (liftZ > .05) g.position.z = (g.position.z || 0) + liftZ;
    if (spinZ) g.rotation.z = (o.face || 0) + spinZ;
    g.rotation.x = g._s89Bank || 0;
  }
};

/* ==========================================================================
   4. SakugaVFX89 — 3D VOLUMETRIC SLASH ARCS, SANDEVISTAN CLONES & ZANDATSU
   ========================================================================== */
const SakugaVFX89 = {
  arcs: [],
  splits3D: [],
  splits2D: [],
  sandev: [],
  sandevT: 0,
  arcGeo: null,
  getArcGeo() {
    if (this.arcGeo || typeof THREE === 'undefined') return this.arcGeo;
    const T = THREE, segs = 28, pos = [], uvs = [], idx = [];
    const span = Math.PI * 1.18, rOut = 58, rIn = 34;
    for (let i = 0; i <= segs; i++) {
      const f = i / segs;
      const a = -span * .5 + f * span;
      const taper = Math.sin(f * Math.PI);
      const ri = rOut - (rOut - rIn) * Math.pow(taper, .65);
      const ca = Math.cos(a), sa = Math.sin(a);
      pos.push(ca * rOut, sa * rOut, 0);
      pos.push(ca * ri, sa * ri, 0);
      uvs.push(f, 1, f, 0);
      if (i < segs) {
        const b = i * 2;
        idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    this.arcGeo = g;
    return g;
  },
  spawnSlashArc(x, y, ang, kind) {
    if (!S89.on('arcs89') || CALM || typeof THREE === 'undefined' || !R3 || !R3.root || !R3.ok) return;
    try {
      const T = THREE, geo = this.getArcGeo(); if (!geo) return;
      const isOD = typeof G !== 'undefined' && G.odT > 0;
      const colHex = isOD ? '#ffd700' : (P && P.ca) || '#00f2fe';
      const col2Hex = isOD ? '#ff4fd8' : (P && P.cb) || '#ff0844';
      const makeArc = (tiltX, tiltY, scaleMul, col, zOff) => {
        const grp = new T.Group();
        const matOuter = new T.MeshBasicMaterial({ color: new T.Color(col), transparent: true, opacity: .92, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
        const matCore  = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .98, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
        const m1 = new T.Mesh(geo, matOuter);
        const m2 = new T.Mesh(geo, matCore); m2.scale.set(.96, .96, 1); m2.position.z = .6;
        grp.add(m1, m2);
        grp.position.set(x, y, 22 + (zOff || 0));
        grp.rotation.order = 'ZYX';
        grp.rotation.set(tiltX, tiltY, ang);
        grp.scale.setScalar(scaleMul);
        R3.root.add(grp);
        this.arcs.push({ g: grp, m1, m2, t: 0, d: .24, baseAng: ang, baseScale: scaleMul, spin: kind === 'cyclone' ? 12 : 4.2 });
      };
      if (kind === 'iaido')        makeArc(0.08, 0, 1.35, colHex, 0);
      else if (kind === 'kesa')    makeArc(0.55, 0.25, 1.25, colHex, 4);
      else if (kind === 'gyaku')   makeArc(-0.58, -0.22, 1.25, col2Hex, 6);
      else if (kind === 'cyclone') { makeArc(0.05, 0, 1.45, colHex, 8); makeArc(-0.18, 0, 1.2, col2Hex, 14); }
      else if (kind === 'xcross')  { makeArc(0.62, 0.15, 1.28, colHex, 4); makeArc(-0.62, -0.15, 1.28, col2Hex, 4); }
      else if (kind === 'kabuto')  makeArc(1.25, 0, 1.4, colHex, 12);
      else makeArc(0.2, 0, 1.2, colHex, 0);
    } catch (e) { errLog(e); }
  },
  spawnZandatsu(e, slashAng) {
    if (!e || !S89.on('zandatsu89') || CALM) return;
    const x = e.x, y = e.y, r = Math.max(11, e.r || 14);
    const col = e.elite ? '#ffd700' : (e.col || '#ff3b5c');
    const a = slashAng != null ? slashAng : (P ? P.ang : 0);
    this.splits2D.push({ x, y, r, a, col, t: 0, d: .58 });
    Cinema3D89.flash(x, y, col, e.elite ? 760 : 420, 0.25);
    try {
      if (typeof THREE !== 'undefined' && R3 && R3.root && R3.ok) {
        const T = THREE;
        const nx = -Math.sin(a), ny = Math.cos(a);
        for (const side of [-1, 1]) {
          const geo = new T.BoxGeometry(r * 1.15, r * .65, r * 1.35);
          const mat = new T.MeshStandardMaterial({
            color: new T.Color(col).multiplyScalar(.45),
            emissive: new T.Color(col),
            emissiveIntensity: 1.9,
            roughness: .22, metalness: .78, transparent: true, opacity: .95
          });
          const m = new T.Mesh(geo, mat);
          m.position.set(x + nx * side * 3, y + ny * side * 3, r * .85);
          m.rotation.z = a;
          R3.root.add(m);
          this.splits3D.push({
            m, mat,
            vx: nx * side * (115 + Math.random() * 55) + Math.cos(a) * 65,
            vy: ny * side * (115 + Math.random() * 55) + Math.sin(a) * 65,
            vz: 130 + Math.random() * 90,
            rx: (Math.random() - .5) * 9, ry: side * (5 + Math.random() * 4),
            t: 0, d: .62
          });
        }
      }
    } catch (er) {}
  },
  tick(rd) {
    const dt = Math.min(.05, rd || .016);
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i]; a.t += dt;
      const u = a.t / a.d;
      if (u >= 1) {
        if (R3 && R3.root) R3.root.remove(a.g);
        a.m1.material.dispose(); a.m2.material.dispose();
        this.arcs.splice(i, 1);
        continue;
      }
      const e = 1 - Math.pow(1 - u, 3);
      a.g.scale.setScalar(a.baseScale * (0.72 + e * 0.62));
      a.g.rotation.z = a.baseAng + e * a.spin * .24;
      a.m1.material.opacity = (1 - u) * .92;
      a.m2.material.opacity = Math.max(0, (1 - u * 1.35)) * .98;
    }
    for (let i = this.splits3D.length - 1; i >= 0; i--) {
      const s = this.splits3D[i]; s.t += dt;
      if (s.t >= s.d) {
        if (R3 && R3.root) R3.root.remove(s.m);
        s.m.geometry.dispose(); s.mat.dispose();
        this.splits3D.splice(i, 1);
        continue;
      }
      s.vz -= 520 * dt;
      s.m.position.x += s.vx * dt;
      s.m.position.y += s.vy * dt;
      s.m.position.z = Math.max(2, s.m.position.z + s.vz * dt);
      s.m.rotation.x += s.rx * dt;
      s.m.rotation.y += s.ry * dt;
      const fade = 1 - s.t / s.d;
      s.mat.opacity = fade;
      s.m.scale.setScalar(0.55 + fade * 0.45);
    }
    if (S89.on('sandev89') && !CALM && typeof P !== 'undefined' && typeof inRun === 'function' && inRun()) {
      const fast = P.dashing || (typeof G !== 'undefined' && (G.odT > 0 || (G.combo | 0) >= 12));
      if (fast) {
        this.sandevT -= dt;
        if (this.sandevT <= 0) {
          this.sandevT = P.dashing ? .022 : .055;
          const palette = ['#00f2fe', '#7b61ff', '#ff4fd8', '#ffd700', '#00ff9d'];
          const col = palette[(this.sandev.length + ((G.combo | 0) % 5)) % palette.length];
          this.sandev.push({ x: P.x, y: P.y, ang: P.ang || 0, col, t: 0, d: P.dashing ? .34 : .24, r: 16 });
          if (this.sandev.length > 26) this.sandev.shift();
        }
      }
    }
    for (let i = this.sandev.length - 1; i >= 0; i--) {
      this.sandev[i].t += dt;
      if (this.sandev[i].t >= this.sandev[i].d) this.sandev.splice(i, 1);
    }
    for (let i = this.splits2D.length - 1; i >= 0; i--) {
      this.splits2D[i].t += dt;
      if (this.splits2D[i].t >= this.splits2D[i].d) this.splits2D.splice(i, 1);
    }
  },
  draw2D() {
    if (CALM || typeof cx === 'undefined') return;
    if (this.sandev.length) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      for (const s of this.sandev) {
        const a = Math.max(0, 1 - s.t / s.d);
        cx.save();
        cx.translate(s.x, s.y);
        cx.rotate(s.ang);
        cx.globalAlpha = a * .52;
        cx.fillStyle = s.col;
        cx.beginPath();
        cx.moveTo(16, 0);
        cx.lineTo(-10, -11);
        cx.lineTo(-5, 0);
        cx.lineTo(-10, 11);
        cx.closePath();
        cx.fill();
        cx.strokeStyle = s.col;
        cx.lineWidth = 3 * a;
        cx.beginPath();
        cx.moveTo(-6, 0);
        cx.lineTo(-26 - (1 - a) * 18, Math.sin(s.t * 20) * 5);
        cx.stroke();
        cx.restore();
      }
      cx.restore();
    }
    if (this.splits2D.length) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      for (const z of this.splits2D) {
        const u = z.t / z.d;
        const sep = (1 - Math.pow(1 - Math.min(1, u * 1.4), 3)) * (z.r * 1.9);
        const nx = -Math.sin(z.a), ny = Math.cos(z.a);
        if (u < .45) {
          const la = (1 - u / .45);
          const len = z.r * (2.8 + u * 3.5);
          cx.strokeStyle = '#ffffff';
          cx.lineWidth = 3.5 * la;
          cx.globalAlpha = la;
          cx.beginPath();
          cx.moveTo(z.x - Math.cos(z.a) * len, z.y - Math.sin(z.a) * len);
          cx.lineTo(z.x + Math.cos(z.a) * len, z.y + Math.sin(z.a) * len);
          cx.stroke();
          cx.strokeStyle = z.col;
          cx.lineWidth = 9 * la;
          cx.globalAlpha = la * .45;
          cx.stroke();
        }
        const ha = Math.max(0, 1 - u);
        for (const side of [-1, 1]) {
          cx.save();
          cx.translate(z.x + nx * side * sep, z.y + ny * side * sep);
          cx.rotate(z.a + side * u * .45);
          cx.globalAlpha = ha * .75;
          cx.fillStyle = z.col;
          cx.beginPath();
          cx.arc(0, 0, z.r * .82, side > 0 ? 0 : Math.PI, side > 0 ? Math.PI : Math.PI * 2);
          cx.closePath();
          cx.fill();
          cx.strokeStyle = '#ffffff';
          cx.lineWidth = 1.6;
          cx.stroke();
          cx.restore();
        }
      }
      cx.restore();
    }
  }
};

/* ==========================================================================
   5. KineticCam89 — DYNAMIC ACTION CAMERA & ANIME RADIAL SPEEDLINES
   ========================================================================== */
const KineticCam89 = {
  zoomBias: 0, targetZoom: 0, kickX: 0, kickY: 0, speedAlpha: 0,
  punch(ang, amt) {
    if (!S89.on('cam89') || CALM) return;
    this.kickX += Math.cos(ang) * amt;
    this.kickY += Math.sin(ang) * amt;
    this.zoomBias = Math.min(.09, this.zoomBias + .035);
    this.speedAlpha = Math.min(1, this.speedAlpha + .55);
  },
  tick(rd) {
    const dt = Math.min(.05, rd || .016);
    if (!S89.on('cam89') || CALM || typeof inRun !== 'function' || !inRun()) {
      this.zoomBias *= .85; this.kickX *= .8; this.kickY *= .8; this.speedAlpha *= .85;
      return;
    }
    const aiming = typeof In !== 'undefined' && (In.on || (typeof G !== 'undefined' && G.slowK < .82));
    const dashing = typeof P !== 'undefined' && P.dashing;
    const isOD = typeof G !== 'undefined' && G.odT > 0;
    this.targetZoom = dashing ? -.045 : (aiming ? .048 : (isOD ? -.02 : 0));
    this.zoomBias += (this.targetZoom - this.zoomBias) * Math.min(1, dt * 10);
    this.kickX *= Math.pow(.0006, dt);
    this.kickY *= Math.pow(.0006, dt);
    const wantSpeed = dashing ? .72 : (isOD ? .42 : 0);
    this.speedAlpha += (wantSpeed - this.speedAlpha) * Math.min(1, dt * 9);
  },
  drawSpeedlines() {
    if (CALM || this.speedAlpha < .04 || typeof cx === 'undefined' || typeof V === 'undefined') return;
    const W = V.VW, H = V.VH, mx = W * .5, my = H * .5;
    const rad = Math.hypot(mx, my);
    const t = performance.now() * .018;
    const col = (typeof G !== 'undefined' && G.odT > 0) ? '#ffd700' : ((typeof P !== 'undefined' && P.ca) || '#00f2fe');
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.strokeStyle = col;
    cx.globalAlpha = this.speedAlpha * .24;
    cx.lineWidth = 1.6;
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.sin(t + i * 1.7) * .03;
      const r0 = rad * (.62 + ((i * 37 + (t * 20 | 0)) % 17) * .014);
      cx.beginPath();
      cx.moveTo(mx + Math.cos(a) * r0, my + Math.sin(a) * r0);
      cx.lineTo(mx + Math.cos(a) * (rad * 1.08), my + Math.sin(a) * (rad * 1.08));
      cx.stroke();
    }
    cx.restore();
  }
};

/* ==========================================================================
   6. StyleRank89 — DMC-STYLE ANIMATED STYLE RANK BADGE (D -> SSS)
   ========================================================================== */
const StyleRank89 = {
  el: null, gradeEl: null, subEl: null, fillEl: null,
  lastIdx: -1, popT: 0,
  RANKS: [
    { g: 'D',   min: 1,  col: '#8fa4c8', sub: 'DEADLY' },
    { g: 'C',   min: 4,  col: '#00f2fe', sub: 'CYBER' },
    { g: 'B',   min: 8,  col: '#00ff9d', sub: 'BRUTAL' },
    { g: 'A',   min: 14, col: '#ffb020', sub: 'APEX' },
    { g: 'S',   min: 22, col: '#ff4fd8', sub: 'SAVAGE' },
    { g: 'SS',  min: 34, col: '#ff0844', sub: 'SUPREME' },
    { g: 'SSS', min: 50, col: '#ffd700', sub: 'OVERDRIVE GOD' }
  ],
  ensure() {
    if (this.el) return;
    const d = document.createElement('div');
    d.id = 'style89-badge';
    d.innerHTML = '<div id="style89-grade">D</div><div id="style89-sub">DEADLY</div><div id="style89-bar"><div id="style89-fill"></div></div>';
    document.body.appendChild(d);
    this.el = d;
    this.gradeEl = d.querySelector('#style89-grade');
    this.subEl = d.querySelector('#style89-sub');
    this.fillEl = d.querySelector('#style89-fill');
  },
  tick(rd) {
    this.ensure();
    const show = S89.on('style89') && typeof inRun === 'function' && inRun() && typeof G !== 'undefined' && (G.combo | 0) >= 2 && G.state === 'PLAY';
    if (!show) {
      this.el.style.display = 'none';
      this.lastIdx = -1;
      return;
    }
    this.el.style.display = 'flex';
    const c = G.combo | 0;
    let idx = 0;
    for (let i = this.RANKS.length - 1; i >= 0; i--) {
      if (c >= this.RANKS[i].min) { idx = i; break; }
    }
    const R = this.RANKS[idx];
    const next = this.RANKS[idx + 1];
    const pct = next ? Math.min(100, ((c - R.min) / Math.max(1, next.min - R.min)) * 100) : 100;
    if (idx !== this.lastIdx) {
      if (idx > this.lastIdx && this.lastIdx >= 0) AudioCinema89.rankUpStab(idx);
      this.lastIdx = idx;
      this.popT = 1;
      this.gradeEl.textContent = R.g;
      this.gradeEl.style.color = R.col;
      this.subEl.textContent = typeof lt === 'function' ? lt(R.sub) : R.sub;
      this.subEl.style.color = R.col;
      this.subEl.style.borderColor = R.col;
    }
    this.fillEl.style.width = pct.toFixed(1) + '%';
    if (this.popT > 0) this.popT = Math.max(0, this.popT - (rd || .016) * 4.5);
    const pulse = 1 + this.popT * .42 + (idx >= 5 ? Math.sin(performance.now() * .018) * .05 : 0);
    this.el.style.transform = 'scale(' + pulse.toFixed(3) + ')';
  }
};

/* ==========================================================================
   7. CrateSakuga89 — NEXT-GEN GACHA CRATE SHATTER, CRACKS & IMPACT FLASH
   ========================================================================== */
const CrateSakuga89 = {
  shards: [],
  initShards(col, r) {
    this.shards = [];
    const n = 22 + (r | 0) * 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (Math.random() - .5) * .35;
      const sp = 140 + Math.random() * (220 + (r | 0) * 45);
      this.shards.push({
        x: 200, y: 325,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 70,
        rot: Math.random() * 6.28, vr: (Math.random() - .5) * 14,
        sz: 5 + Math.random() * 9,
        col: i % 3 === 0 ? '#ffffff' : (i % 2 ? col : '#ffd700')
      });
    }
  }
};

/* ==========================================================================
   HOOK WIRING — Clean, isolated, zero-regression v89 integration
   ========================================================================== */
{
  if (typeof Human !== 'undefined' && Human.anim) {
    const ha89 = Human.anim.bind(Human);
    Human.anim = function (g, o, rd, t) {
      ha89(g, o, rd, t);
      try { SakugaRig89.apply(g, o, rd, t); } catch (e) { errLog(e); }
    };
  }

  if (typeof R3 !== 'undefined' && R3.animEnemy) {
    const ae89 = R3.animEnemy.bind(R3);
    R3.animEnemy = function (g, e, t) {
      ae89(g, e, t);
      if (!g || !e) return;
      try {
        if (e.fl > .05) {
          const k = Math.min(1, e.fl);
          g.rotation.y = -0.45 * k;
          g.scale.x *= (1 + .18 * k);
          g.scale.z *= (1 - .14 * k);
        } else {
          const tel = e.tel > 0 || e.charge > 0 || e.fuse > 0;
          g.rotation.y = tel ? 0.28 : Math.sin(t * 6 + (e.uid | 0)) * .05;
        }
      } catch (er) {}
    };
  }

  if (typeof R3 !== 'undefined' && R3.syncCam) {
    const sc89 = R3.syncCam.bind(R3);
    R3.syncCam = function () {
      const C = typeof GL3D !== 'undefined' && GL3D.cam;
      if (!C || !S89.on('cam89') || CALM) return sc89();
      const ox = C.x, oy = C.y, oz = C.z;
      C.x = ox + KineticCam89.kickX;
      C.y = oy + KineticCam89.kickY;
      C.z = oz * (1 + KineticCam89.zoomBias);
      try { return sc89(); } finally { C.x = ox; C.y = oy; C.z = oz; }
    };
  }

  if (typeof R3 !== 'undefined' && R3.render) {
    const r3_89 = R3.render.bind(R3);
    R3.render = function (rd) {
      try {
        Cinema3D89.tick(rd);
        SakugaVFX89.tick(rd);
        KineticCam89.tick(rd);
        AudioCinema89.tickAdaptive();
      } catch (e) { errLog(e); }
      return r3_89(rd);
    };
  }

  const sl89 = slash;
  slash = function (a) {
    const r = sl89.apply(this, arguments);
    try {
      KineticCam89.punch(P.ang || a || 0, 12);
      AudioCinema89.sliceSfx(P.x, G && G.odT > 0, SakugaRig89.lastMoveIdx);
    } catch (e) {}
    return r;
  };

  const ke89 = killEnemy;
  killEnemy = function (e, a, src) {
    const r = ke89.apply(this, arguments);
    try {
      if (e && !REPLAY.fast) {
        SakugaVFX89.spawnZandatsu(e, a != null ? a : (P ? P.ang : 0));
        KineticCam89.punch(a != null ? a : (P ? P.ang : 0), e.elite ? 18 : 8);
        AudioCinema89.killFoley(e);
        if (e.exec || e.elite) Cinema3D89.triggerRGB(e.exec ? 0.95 : 0.55);
      }
    } catch (er) {}
    return r;
  };

  const pb89 = parryBullet;
  parryBullet = function (b) {
    const r = pb89.apply(this, arguments);
    try {
      SakugaRig89.parryT = .30;
      KineticCam89.punch(P ? P.ang : 0, 16);
      Cinema3D89.flash(P.x, P.y, '#ffd700', 820, 0.28);
      Cinema3D89.triggerRGB(0.85);
      AudioCinema89.sliceSfx(P.x, true, 5);
    } catch (e) {}
    return r;
  };

  const dp89 = drawPlayer;
  drawPlayer = function () {
    try { SakugaVFX89.draw2D(); } catch (e) {}
    return dp89.apply(this, arguments);
  };

  const hd89 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try { KineticCam89.drawSpeedlines(); StyleRank89.tick(rd); } catch (e) {}
    return hd89(rd);
  };

  const db89 = Director.begin.bind(Director);
  Director.begin = function () {
    SakugaVFX89.sandev.length = 0;
    SakugaVFX89.splits2D.length = 0;
    StyleRank89.lastIdx = -1;
    AudioCinema89.wasAim = false;
    return db89.apply(this, arguments);
  };

  if (typeof Seals !== 'undefined' && Seals.frame) {
    const sf89 = Seals.frame.bind(Seals);
    Seals.frame = function (g, S, st, u, t, dt, o, R0, T0, r, bg, box, BS, once, sfx, CF) {
      sf89(g, S, st, u, t, dt, o, R0, T0, r, bg, box, BS, once, sfx, CF);
      if (CALM) return;
      try {
        const col = (R0 && R0.c) || S.col || '#ffd700';
        if ((st.k === 'beat' || st.k === 'strike') && S.lvl >= 1) {
          g.save();
          g.globalCompositeOperation = 'lighter';
          g.strokeStyle = col;
          g.lineWidth = 1.8 + S.lvl * .4;
          g.globalAlpha = .35 + S.lvl * .14;
          for (let i = 0; i < 4 + S.lvl * 2; i++) {
            const a = (i / (4 + S.lvl * 2)) * Math.PI * 2 + S.lvl * .4;
            const len = 35 + S.lvl * 18 + Math.sin(t * 14 + i) * 8;
            g.beginPath();
            g.moveTo(200, 325);
            g.lineTo(200 + Math.cos(a) * len * .55, 325 + Math.sin(a) * len * .55);
            g.lineTo(200 + Math.cos(a + .22) * len, 325 + Math.sin(a + .22) * len);
            g.stroke();
          }
          g.restore();
        }
        if (st.k === 'open') {
          once('sh89', () => CrateSakuga89.initShards(col, r));
          if (u < .08) {
            g.save();
            g.fillStyle = u < .04 ? '#ffffff' : col;
            g.globalAlpha = (1 - u / .08) * .85;
            g.fillRect(0, 0, 400, 680);
            g.restore();
          }
          g.save();
          g.globalCompositeOperation = 'lighter';
          for (const sh of CrateSakuga89.shards) {
            sh.vy += 420 * (dt || .016);
            sh.x += sh.vx * (dt || .016);
            sh.y += sh.vy * (dt || .016);
            sh.rot += sh.vr * (dt || .016);
            const alpha = Math.max(0, 1 - u * 1.15);
            g.save();
            g.translate(sh.x, sh.y);
            g.rotate(sh.rot);
            g.globalAlpha = alpha;
            g.fillStyle = sh.col;
            g.beginPath();
            g.moveTo(0, -sh.sz);
            g.lineTo(sh.sz * .65, 0);
            g.lineTo(0, sh.sz);
            g.lineTo(-sh.sz * .65, 0);
            g.closePath();
            g.fill();
            g.restore();
          }
          g.restore();
        }
      } catch (e) {}
    };
  }

  if (typeof PC !== 'undefined' && PC.settings) {
    const ps89 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps89(head, cycle, box, s);
      try {
        head('SAKUGA & CINEMA (v89)');
        cycle('3D Slash Arcs', 'arcs89', [1, 0], ['ON', 'OFF']);
        cycle('Sandevistan Clones', 'sandev89', [1, 0], ['ON', 'OFF']);
        cycle('Zandatsu Slicing', 'zandatsu89', [1, 0], ['ON', 'OFF']);
        cycle('Cinema 3D Reflections', 'refl89', [1, 0], ['ON', 'OFF']);
        cycle('Dynamic Flash Lights', 'flash89', [1, 0], ['ON', 'OFF']);
        cycle('Kinetic Action Camera', 'cam89', [1, 0], ['ON', 'OFF']);
        cycle('Style Rank Badge', 'style89', [1, 0], ['ON', 'OFF']);
        cycle('Spatial Stereo Foley', 'spatial89', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

