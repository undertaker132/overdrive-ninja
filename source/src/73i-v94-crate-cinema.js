/* ==========================================================================
   VERSION 94.0 — AAA CINEMATIC CRATE OVERHAUL (CrateCinema94)
   1. Interactive 3D Crate Stage (Three.js): reflective pedestal, orbital
      energy rings, 3D splitable cyber-armored crate + volumetric Sky Beam
   2. Slash-to-Open: drag/swipe across the crate with a glowing katana trail
      (or press Space / click) -> 3-frame hitstop -> Zandatsu 3D bisection!
   3. Rarity Fake-Out: dramatic glitch freeze & upgrade explosion from lower
      rarity into EPIC / LEGENDARY / MYTHIC with heartbeat & RGB flash
   4. Audio Ducking & Signature Rarity Fanfares
   5. Multi-Slash (OPEN ×5): swipe across a fan of crates in one continuous
      motion + sleek Multi-Loot Summary Grid
   ========================================================================== */

try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "CINEMATIC CRATES (v94)": "פתיחת תיבות קולנועית (v94)",
    "3D Slash-to-Open Crates": "תיבות 3D בחיתוך קטאנה",
    "Rarity Fake-Out Surprises": "הפתעות שדרוג נדירות (Fake-Out)",
    "SLASH TO OPEN!": "חתוך עם הקטאנה לפתיחה!",
    "SWIPE ACROSS THE CRATE · OR PRESS SPACE": "החלק על התיבה · או לחץ רווח / קליק",
    "MULTI-SLASH!": "חיתוך מרובה!",
    "OVERCLOCK UPGRADE!": "שדרוג נדירות מפתיע!",
    "RARITY BREAK!": "פריצת נדירות!",
    "OPEN ×{0} (MULTI-SLASH)": "פתח ×{0} (חיתוך מרובה)",
    "MULTI-CRATE HAUL": "שלל פתיחה מרובה",
    "3D CINEMATIC STAGE": "במת פתיחה תלת־ממדית"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "CINEMATIC CRATES (v94)": "صناديق سينمائية (v94)",
    "3D Slash-to-Open Crates": "صناديق 3D بالقطع",
    "Rarity Fake-Out Surprises": "مفاجآت ترقية الندرة",
    "SLASH TO OPEN!": "اقطع بالسيف للفتح!",
    "OVERCLOCK UPGRADE!": "ترقية ندرة مفاجئة!"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "CINEMATIC CRATES (v94)": "КИНЕМАТОГРАФИЧНЫЕ ЯЩИКИ (v94)",
    "3D Slash-to-Open Crates": "3D ящики (разрез катаной)",
    "Rarity Fake-Out Surprises": "Сюрпризы повышения редкости",
    "SLASH TO OPEN!": "РАЗРУБИ КАТАНОЙ!",
    "OVERCLOCK UPGRADE!": "ПОВЫШЕНИЕ РЕДКОСТИ!"
  });
} catch (e) { errLog(e); }

const S94 = {
  on(k, defVal) {
    try {
      const s = Store && Store.data && Store.data.settings;
      if (!s || s[k] == null) return defVal == null ? true : !!defVal;
      return !!s[k];
    } catch (e) { return defVal == null ? true : !!defVal; }
  }
};

const CrateCinema94 = {
  /* Duck music briefly before climax so the slice + fanfare hit with maximum punch */
  duckAudio(level, durSec) {
    try {
      if (typeof Aud === 'undefined' || !Aud.c || !Aud.md) return;
      const t = Aud.c.currentTime;
      Aud.md.gain.cancelScheduledValues(t);
      Aud.md.gain.setTargetAtTime(level, t, 0.04);
      if (durSec > 0) Aud.md.gain.setTargetAtTime(1, t + durSec, 0.25);
    } catch (e) {}
  },

  sfxDrop() {
    try {
      if (typeof Aud === 'undefined' || !Aud.c || Aud.quiet) return;
      const t = Aud.c.currentTime;
      Aud.tone(110, 32, 0.34, 0.26, 'sine', t);
      Aud.noise(0.18, 0.14, 900, 120, 'lowpass', t);
    } catch (e) {}
  },

  sfxSlash(isBig) {
    try {
      if (typeof Aud === 'undefined' || !Aud.c || Aud.quiet) return;
      const t = Aud.c.currentTime;
      Aud.tone(isBig ? 2400 : 1850, 520, 0.18, 0.18, 'triangle', t);
      Aud.tone(3600, 1100, 0.11, 0.09, 'sine', t + 0.015);
      Aud.tone(80, 28, 0.26, isBig ? 0.28 : 0.18, 'sine', t);
      Aud.noise(0.14, 0.15, 2400, 420, 'bandpass', t);
    } catch (e) {}
  },

  sfxGlitchFakeout() {
    try {
      if (typeof Aud === 'undefined' || !Aud.c || Aud.quiet) return;
      const t = Aud.c.currentTime;
      // Heartbeat + digital crackle tension riser
      Aud.tone(62, 38, 0.16, 0.24, 'sine', t);
      Aud.tone(68, 40, 0.16, 0.26, 'sine', t + 0.26);
      Aud.tone(240, 1680, 0.65, 0.12, 'sawtooth', t + 0.12);
      Aud.noise(0.28, 0.11, 3200, 900, 'bandpass', t + 0.2);
    } catch (e) {}
  },

  sfxFanfare(r) {
    try {
      if (typeof Foley87 !== 'undefined' && Foley87.crateFanfare) {
        Foley87.crateFanfare(r);
      }
      if (typeof Aud === 'undefined' || !Aud.c || Aud.quiet) return;
      const t = Aud.c.currentTime;
      // Signature sub-impact + shimmering synth chord by rarity
      Aud.tone(92, 30, 0.48, 0.28, 'sine', t);
      const chords = [
        [440, 554.37],
        [440, 554.37, 659.25],
        [440, 523.25, 659.25, 783.99],
        [523.25, 659.25, 783.99, 1046.5],
        [587.33, 739.99, 880, 1174.66, 1479.98]
      ];
      const notes = chords[Math.min(4, r | 0)];
      notes.forEach((f, idx) => {
        Aud.tone(f, f * 1.004, 0.55 + r * 0.14, 0.085, r >= 3 ? 'sawtooth' : 'triangle', t + idx * 0.055);
      });
    } catch (e) {}
  },

  /* Build a crisp transparent icon canvas for the rising reward preview */
  buildRewardCanvas(res, col) {
    const c = document.createElement('canvas');
    c.width = c.height = 240;
    const g = c.getContext('2d');
    try {
      if (res.item && typeof drawIcon === 'function') {
        drawIcon(g, { tab: res.item.tab, id: res.item.id, tier: (res.r | 0) + 1 }, 240);
      } else if (typeof Crates !== 'undefined' && Crates.drawLoot) {
        Crates.drawLoot(g, 240, res, col);
      }
      // Remove dark background pixels so the item floats cleanly in the Sky Beam
      const D = g.getImageData(0, 0, 240, 240), q = D.data;
      for (let i = 0; i < q.length; i += 4) {
        const m = Math.max(q[i], q[i + 1], q[i + 2]);
        if (m < 62) q[i + 3] = Math.max(0, (m - 26) * 7);
      }
      g.putImageData(D, 0, 0);
    } catch (e) {}
    return c;
  },

  /* Main AAA 3D + 2D Hybrid Crate Opening Cinema */
  run(res, done, multiCount) {
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const r = Math.max(0, Math.min(4, res.r | 0));
    const R0 = (typeof RAR !== 'undefined' && RAR[r]) || { n: 'RARE', c: '#00f2fe' };
    const trueCol = R0.c || '#00f2fe';

    // Determine Rarity Fake-Out (Epic+: starts as lower rarity, then glitches & shatters into true rarity!)
    const canFake = S94.on('fakeout94', true) && r >= 2 && (r >= 3 || Math.random() < 0.65);
    const fakeR = canFake ? (r >= 4 ? 2 : r === 3 ? 1 : 0) : r;
    const fakeCol = ((typeof RAR !== 'undefined' && RAR[fakeR]) ? RAR[fakeR].c : '#00b4ff');

    // Build fullscreen overlay
    const ov = document.createElement('div');
    ov.id = 'crate94-ov';
    ov.innerHTML =
      '<canvas id="crate94-3d"></canvas>' +
      '<canvas id="crate94-2d"></canvas>' +
      '<div id="crate94-hud">' +
        '<div id="crate94-top">' +
          '<div id="crate94-badge">⚡ ' + L('3D CINEMATIC STAGE') + (multiCount > 1 ? ' · ×' + multiCount : '') + '</div>' +
          '<button id="crate94-skip">' + L('SKIP') + ' ⏭</button>' +
        '</div>' +
        '<div id="crate94-prompt">' +
          '<div class="p94-main">' + L(multiCount > 1 ? 'MULTI-SLASH!' : 'SLASH TO OPEN!') + '</div>' +
          '<div class="p94-sub">' + L('SWIPE ACROSS THE CRATE · OR PRESS SPACE') + '</div>' +
        '</div>' +
      '</div>' +
      '<div id="crate94-alert">' + L('OVERCLOCK UPGRADE!') + '</div>';
    document.body.appendChild(ov);

    const cv3 = ov.querySelector('#crate94-3d');
    const cv2 = ov.querySelector('#crate94-2d');
    const promptEl = ov.querySelector('#crate94-prompt');
    const alertEl  = ov.querySelector('#crate94-alert');
    const skipBtn  = ov.querySelector('#crate94-skip');

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = window.innerWidth, H = window.innerHeight;
    cv2.width = W * dpr; cv2.height = H * dpr;
    const g2 = cv2.getContext('2d');

    // ---------------- THREE.JS 3D CRATE STAGE ----------------
    let rn = null, sc = null, cam = null, crateGrp = null, halfA = null, halfB = null;
    let coreMesh = null, beamMesh = null, beamInner = null, ring1 = null, ring2 = null;
    let trimMats = [], crateLight = null, rimLight = null, beamMat = null, beamInMat = null;
    const use3D = typeof THREE !== 'undefined';

    if (use3D) {
      try {
        const T = THREE;
        rn = new T.WebGLRenderer({ canvas: cv3, antialias: true, alpha: true });
        rn.setPixelRatio(dpr);
        rn.setSize(W, H, false);
        rn.outputColorSpace = T.SRGBColorSpace;
        rn.toneMapping = T.ACESFilmicToneMapping;
        rn.toneMappingExposure = 1.2;

        sc = new T.Scene();
        sc.fog = new T.FogExp2(0x040610, 0.045);

        cam = new T.PerspectiveCamera(42, W / Math.max(1, H), 0.1, 100);
        cam.position.set(0, 2.35, 7.2);
        cam.lookAt(0, 0.4, 0);

        // Studio Cyber Lighting
        sc.add(new T.HemisphereLight(0x88b4ff, 0x0c0820, 1.0));
        const keyL = new T.DirectionalLight(0xffffff, 2.2);
        keyL.position.set(4, 7, 5);
        sc.add(keyL);
        rimLight = new T.DirectionalLight(new T.Color(fakeCol), 2.8);
        rimLight.position.set(-4, 4, -5);
        sc.add(rimLight);
        crateLight = new T.PointLight(new T.Color(fakeCol), 4.5, 16, 1.5);
        crateLight.position.set(0, 1.2, 2.2);
        sc.add(crateLight);

        // Reflective Dark Pedestal & Holographic Floor Grid
        const ped = new T.Mesh(
          new T.CylinderGeometry(2.3, 2.6, 0.35, 32),
          new T.MeshStandardMaterial({ color: 0x0e1326, metalness: 0.85, roughness: 0.2 })
        );
        ped.position.y = -1.25;
        sc.add(ped);
        const pedRing = new T.Mesh(
          new T.TorusGeometry(2.38, 0.055, 10, 48),
          new T.MeshBasicMaterial({ color: new T.Color(fakeCol) })
        );
        pedRing.rotation.x = Math.PI / 2;
        pedRing.position.y = -1.06;
        sc.add(pedRing);
        trimMats.push(pedRing.material);

        // Orbiting Energy Rings around the crate
        ring1 = new T.Mesh(
          new T.TorusGeometry(2.15, 0.032, 8, 64),
          new T.MeshBasicMaterial({ color: new T.Color(fakeCol), transparent: true, opacity: 0.72 })
        );
        ring1.position.y = 0.25;
        sc.add(ring1);
        ring2 = new T.Mesh(
          new T.TorusGeometry(2.65, 0.025, 8, 64),
          new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 })
        );
        ring2.position.y = 0.25;
        sc.add(ring2);
        trimMats.push(ring1.material);

        // Splitable 3D Cyber-Armored Crate (Upper Half + Lower Half + Glowing Core)
        crateGrp = new T.Group();
        crateGrp.position.y = 6.5; // Starts high above for dramatic drop-in!
        sc.add(crateGrp);

        const armorMat = new T.MeshStandardMaterial({ color: 0x161d36, metalness: 0.78, roughness: 0.26 });
        const darkMat  = new T.MeshStandardMaterial({ color: 0x0a0d1a, metalness: 0.65, roughness: 0.4 });
        const neonMat  = new T.MeshStandardMaterial({ color: 0x000000, emissive: new T.Color(fakeCol), emissiveIntensity: 3.2 });
        trimMats.push(neonMat);

        // Lower Half
        halfA = new T.Group();
        const botBox = new T.Mesh(new T.BoxGeometry(1.9, 0.92, 1.9), armorMat);
        botBox.position.y = -0.48;
        halfA.add(botBox);
        const botTrim = new T.Mesh(new T.BoxGeometry(1.98, 0.11, 1.98), neonMat);
        botTrim.position.y = -0.05;
        halfA.add(botTrim);
        // Corner armor brackets
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
          const br = new T.Mesh(new T.BoxGeometry(0.28, 0.96, 0.28), darkMat);
          br.position.set(sx * 0.88, -0.48, sz * 0.88);
          halfA.add(br);
        }
        crateGrp.add(halfA);

        // Upper Lid Half
        halfB = new T.Group();
        const topBox = new T.Mesh(new T.BoxGeometry(1.92, 0.92, 1.92), armorMat);
        topBox.position.y = 0.48;
        halfB.add(topBox);
        const topCap = new T.Mesh(new T.BoxGeometry(1.4, 0.2, 1.4), darkMat);
        topCap.position.y = 1.02;
        halfB.add(topCap);
        const topTrim = new T.Mesh(new T.BoxGeometry(2.0, 0.11, 2.0), neonMat);
        topTrim.position.y = 0.08;
        halfB.add(topTrim);
        const sealDia = new T.Mesh(new T.OctahedronGeometry(0.32, 0), neonMat);
        sealDia.position.set(0, 0.48, 1.04);
        halfB.add(sealDia);
        crateGrp.add(halfB);

        // Inner Rarity Core Orb
        coreMesh = new T.Mesh(
          new T.OctahedronGeometry(0.58, 1),
          new T.MeshBasicMaterial({ color: new T.Color(fakeCol), transparent: true, opacity: 0.95 })
        );
        crateGrp.add(coreMesh);

        // Volumetric Sky Beam shooting into the heavens
        beamMat = new T.MeshBasicMaterial({ color: new T.Color(fakeCol), transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
        beamMesh = new T.Mesh(new T.CylinderGeometry(1.35, 0.45, 28, 24, 1, true), beamMat);
        beamMesh.position.y = 12.8;
        sc.add(beamMesh);

        beamInMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
        beamInner = new T.Mesh(new T.CylinderGeometry(0.55, 0.18, 28, 16, 1, true), beamInMat);
        beamInner.position.y = 12.8;
        sc.add(beamInner);
      } catch (e) { errLog(e); }
    }

    const setStageColor = hex => {
      if (!use3D || !THREE) return;
      const c = new THREE.Color(hex);
      if (crateLight) crateLight.color.copy(c);
      if (rimLight) rimLight.color.copy(c);
      if (coreMesh) coreMesh.material.color.copy(c);
      if (beamMat) beamMat.color.copy(c);
      for (const m of trimMats) {
        if (m.emissive) m.emissive.copy(c);
        else if (m.color) m.color.copy(c);
      }
    };

    // ---------------- STATE MACHINE ----------------
    // Phases: 'drop' -> 'ready' (wait for Slash!) -> 'hitstop' -> 'split' -> ('fakeout') -> 'reveal'
    const S = {
      phase: 'drop',
      t: 0,
      pt: 0,
      shake: 0,
      flash: 0,
      flashCol: '#ffffff',
      curCol: fakeCol,
      slashPts: [],
      slashAng: -0.45,
      shards: [],
      embers: [],
      rewardCv: this.buildRewardCanvas(res, trueCol),
      slashed: false,
      ended: false
    };

    const spawnBurst = (col, n, spdMul) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (180 + Math.random() * 440) * (spdMul || 1);
        S.shards.push({
          x: W * 0.5, y: H * 0.48,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 110,
          rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 16,
          sz: 5 + Math.random() * 11,
          col: i % 3 === 0 ? '#ffffff' : col,
          life: 1
        });
      }
    };

    const triggerSlash = (ang) => {
      if (S.slashed || (S.phase !== 'ready' && S.phase !== 'drop')) return;
      S.slashed = true;
      S.slashAng = ang != null ? ang : -0.42;
      S.phase = 'hitstop';
      S.pt = 0;
      S.flash = 0.95;
      S.flashCol = '#ffffff';
      S.shake = 1.1;
      promptEl.style.opacity = '0';
      this.duckAudio(0.16, 1.35);
      this.sfxSlash(r >= 3);
      spawnBurst(fakeCol, 44, 1.1);
    };

    const finish = () => {
      if (S.ended) return;
      S.ended = true;
      window.removeEventListener('keydown', onKey);
      this.duckAudio(1.0, 0);
      try { if (rn) rn.dispose(); } catch (e) {}
      ov.remove();
      done();
    };

    // Interactive Slash Gesture + Click/Space Support
    let dragging = false, sx = 0, sy = 0;
    ov.addEventListener('pointerdown', e => {
      if (e.target === skipBtn) return;
      if (S.phase === 'reveal' && S.pt > 0.7) { finish(); return; }
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      S.slashPts = [{ x: sx, y: sy, t: 1 }];
    });
    ov.addEventListener('pointermove', e => {
      if (!dragging) return;
      const x = e.clientX, y = e.clientY;
      S.slashPts.push({ x, y, t: 1 });
      if (S.slashPts.length > 22) S.slashPts.shift();
      const dist = Math.hypot(x - sx, y - sy);
      if (dist > 65 && (S.phase === 'ready' || (S.phase === 'drop' && S.pt > 0.35))) {
        dragging = false;
        triggerSlash(Math.atan2(y - sy, x - sx));
      }
    });
    ov.addEventListener('pointerup', e => {
      if (!dragging) return;
      dragging = false;
      // Quick click also performs a stylish diagonal katana slash!
      if (S.phase === 'ready') {
        S.slashPts = [
          { x: W * 0.25, y: H * 0.66, t: 1 },
          { x: W * 0.5,  y: H * 0.48, t: 1 },
          { x: W * 0.78, y: H * 0.30, t: 1 }
        ];
        triggerSlash(-0.46);
      }
    });
    const onKey = e => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (S.phase === 'ready') {
          S.slashPts = [
            { x: W * 0.25, y: H * 0.66, t: 1 },
            { x: W * 0.5,  y: H * 0.48, t: 1 },
            { x: W * 0.78, y: H * 0.30, t: 1 }
          ];
          triggerSlash(-0.46);
        } else if (S.phase === 'reveal' && S.pt > 0.5) finish();
      } else if (e.code === 'Escape') {
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    skipBtn.onclick = e => { e.stopPropagation(); finish(); };

    // ---------------- RENDER LOOP ----------------
    let last = performance.now();
    this.sfxDrop();

    const loop = now => {
      if (S.ended) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      S.t += dt;
      S.pt += dt;

      // Phase transitions & 3D animation
      if (S.phase === 'drop') {
        const u = Math.min(1, S.pt / 0.55);
        const ease = 1 - Math.pow(1 - u, 3);
        if (crateGrp) {
          crateGrp.position.y = 6.5 - ease * 6.25;
          crateGrp.rotation.y = S.t * 1.4;
          // Squash & bounce on impact
          if (u > 0.85) {
            const b = Math.sin(((u - 0.85) / 0.15) * Math.PI);
            crateGrp.scale.set(1 + b * 0.18, 1 - b * 0.18, 1 + b * 0.18);
          }
        }
        if (u >= 1) {
          S.phase = 'ready'; S.pt = 0; S.shake = 0.65;
          if (crateGrp) crateGrp.scale.set(1, 1, 1);
          spawnBurst('#00f2fe', 22, 0.7);
        }
      } else if (S.phase === 'ready') {
        if (crateGrp) {
          crateGrp.position.y = 0.25 + Math.sin(S.t * 3.2) * 0.12;
          crateGrp.rotation.y += dt * 0.95;
          crateGrp.rotation.x = Math.sin(S.t * 2.1) * 0.08;
        }
        if (cam) {
          // Subtle dolly-in tension while waiting for the player's katana cut
          cam.position.z += (6.2 - cam.position.z) * dt * 2.2;
        }
      } else if (S.phase === 'hitstop') {
        // 3-frame razor-sharp anime Hitstop!
        if (S.pt >= 0.09) {
          S.phase = canFake ? 'fakeout' : 'split';
          S.pt = 0;
          if (S.phase === 'fakeout') {
            this.sfxGlitchFakeout();
            alertEl.textContent = '⚡ ' + L('OVERCLOCK UPGRADE!');
          } else {
            this.sfxFanfare(r);
          }
        }
      } else if (S.phase === 'fakeout') {
        // Starts cracking in fake color, freezes & trembles violently, then SHATTERS into true Legendary/Mythic!
        const u = Math.min(1, S.pt / 1.15);
        if (crateGrp) {
          const trem = 0.14 + u * 0.32;
          crateGrp.position.x = (Math.random() - 0.5) * trem;
          crateGrp.position.y = 0.25 + (Math.random() - 0.5) * trem;
          crateGrp.rotation.y += dt * (2.5 + u * 8);
          if (halfB) halfB.position.y = u * 0.28;
        }
        if (cam) cam.position.z += (4.8 - cam.position.z) * dt * 3.5;
        if (u > 0.35 && u < 0.95) alertEl.classList.add('on');
        if (u >= 1) {
          alertEl.classList.remove('on');
          S.phase = 'split'; S.pt = 0;
          S.curCol = trueCol;
          setStageColor(trueCol);
          S.flash = 1.0; S.flashCol = trueCol; S.shake = 1.5;
          if (crateGrp) crateGrp.position.set(0, 0.25, 0);
          spawnBurst(trueCol, 85, 1.55);
          this.sfxFanfare(r);
        }
      } else if (S.phase === 'split') {
        const u = Math.min(1, S.pt / 0.55);
        const e = 1 - Math.pow(1 - u, 3);
        if (halfA) {
          halfA.position.set(-e * 2.4, -e * 0.9, e * 0.6);
          halfA.rotation.set(e * 0.6, e * 0.9, e * 1.1);
        }
        if (halfB) {
          halfB.position.set(e * 2.5, e * 2.2, -e * 0.8);
          halfB.rotation.set(-e * 0.9, -e * 1.1, -e * 1.3);
        }
        if (coreMesh) {
          coreMesh.scale.setScalar(1 + e * 1.6);
          coreMesh.rotation.y += dt * 9;
        }
        if (beamMat) beamMat.opacity = Math.min(0.75, e * 0.85);
        if (beamInMat) beamInMat.opacity = Math.min(0.92, e * 1.0);
        if (cam) cam.position.z += (7.6 - cam.position.z) * dt * 4.5;
        if (u >= 1) {
          S.phase = 'reveal'; S.pt = 0;
          if (coreMesh) coreMesh.visible = false;
        }
      } else if (S.phase === 'reveal') {
        const u = Math.min(1, S.pt / 1.65);
        if (beamMat) beamMat.opacity = Math.max(0.18, 0.72 * (1 - u * 0.65));
        if (beamInMat) beamInMat.opacity = Math.max(0.1, 0.88 * (1 - u * 0.75));
        if (halfA) halfA.visible = false;
        if (halfB) halfB.visible = false;
        if (S.pt >= 1.75) { finish(); return; }
      }

      // Spin orbital rings & render 3D scene
      if (ring1) { ring1.rotation.x = Math.PI * 0.42 + Math.sin(S.t * 1.8) * 0.25; ring1.rotation.z = S.t * 2.2; }
      if (ring2) { ring2.rotation.x = Math.PI * 0.56 - Math.cos(S.t * 1.4) * 0.25; ring2.rotation.z = -S.t * 1.6; }

      if (rn && sc && cam) {
        const sh = S.shake > 0 ? S.shake * 0.28 : 0;
        const ox = cam.position.x, oy = cam.position.y;
        cam.position.x += (Math.random() - 0.5) * sh;
        cam.position.y += (Math.random() - 0.5) * sh;
        cam.lookAt(0, 0.35, 0);
        rn.render(sc, cam);
        cam.position.x = ox; cam.position.y = oy;
      }

      // ---------------- 2D VFX OVERLAY ----------------
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      g2.clearRect(0, 0, W, H);

      // 1. Animated Katana Slash Guide when waiting in 'ready'
      if (S.phase === 'ready') {
        const pulse = 0.45 + Math.sin(S.t * 7) * 0.35;
        g2.save();
        g2.globalCompositeOperation = 'lighter';
        g2.strokeStyle = '#00f2fe';
        g2.globalAlpha = pulse;
        g2.lineWidth = 3;
        g2.setLineDash([12, 10]);
        g2.lineDashOffset = -S.t * 90;
        g2.beginPath();
        g2.moveTo(W * 0.5 - 150, H * 0.5 + 85);
        g2.lineTo(W * 0.5 + 150, H * 0.5 - 85);
        g2.stroke();
        g2.restore();
      }

      // 2. Player's Glowing Katana Swipe Trail
      if (S.slashPts.length > 1) {
        g2.save();
        g2.globalCompositeOperation = 'lighter';
        g2.lineCap = 'round';
        for (let i = 1; i < S.slashPts.length; i++) {
          const a = S.slashPts[i - 1], b = S.slashPts[i];
          g2.strokeStyle = S.curCol;
          g2.globalAlpha = b.t * 0.7;
          g2.lineWidth = 14 * b.t;
          g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.stroke();
          g2.strokeStyle = '#ffffff';
          g2.globalAlpha = b.t;
          g2.lineWidth = 4 * b.t;
          g2.stroke();
        }
        g2.restore();
        for (let i = S.slashPts.length - 1; i >= 0; i--) {
          S.slashPts[i].t -= dt * 3.2;
          if (S.slashPts[i].t <= 0) S.slashPts.splice(i, 1);
        }
      }

      // 3. Tumbling Prismatic Shards
      g2.save();
      g2.globalCompositeOperation = 'lighter';
      for (let i = S.shards.length - 1; i >= 0; i--) {
        const sh = S.shards[i];
        sh.vy += 460 * dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.rot += sh.vr * dt;
        sh.life -= dt * 0.95;
        if (sh.life <= 0) { S.shards.splice(i, 1); continue; }
        g2.save();
        g2.translate(sh.x, sh.y);
        g2.rotate(sh.rot);
        g2.globalAlpha = Math.max(0, sh.life);
        g2.fillStyle = sh.col;
        g2.beginPath();
        g2.moveTo(0, -sh.sz);
        g2.lineTo(sh.sz * 0.6, 0);
        g2.lineTo(0, sh.sz);
        g2.lineTo(-sh.sz * 0.6, 0);
        g2.closePath();
        g2.fill();
        g2.restore();
      }
      g2.restore();

      // 4. Rising Holographic Reward + Rarity Title in 'reveal'
      if (S.phase === 'reveal') {
        const u = Math.min(1, S.pt / 0.55);
        const e = 1 - Math.pow(1 - u, 3);
        const sz = 110 + e * 130;
        const iy = H * 0.52 - e * 44;
        const spin = Math.cos(S.pt * 5 * (1 - e * 0.85));
        g2.save();
        g2.translate(W * 0.5, iy);
        g2.scale(Math.max(0.12, Math.abs(spin)), 1);
        g2.shadowColor = trueCol;
        g2.shadowBlur = 34;
        g2.drawImage(S.rewardCv, -sz * 0.5, -sz * 0.5, sz, sz);
        g2.restore();

        // Bold Rarity Title Banner
        g2.save();
        g2.textAlign = 'center';
        g2.font = 'italic 900 ' + Math.round(34 + (1 - e) * 18) + 'px Orbitron, sans-serif';
        g2.fillStyle = trueCol;
        g2.shadowColor = trueCol;
        g2.shadowBlur = 24;
        g2.fillText(L(R0.n), W * 0.5, H * 0.22);
        const subName = res.item ? L(res.item.name) : (res.cr ? '+' + fmtNum(res.cr) + ' CR' : '+' + fmtNum(res.shards) + ' ' + L('SHARDS'));
        g2.font = '800 20px Rajdhani, Orbitron, sans-serif';
        g2.fillStyle = '#ffffff';
        g2.fillText(subName, W * 0.5, H * 0.74);
        g2.restore();
      }

      // 5. Screen Impact Flash
      if (S.flash > 0) {
        g2.fillStyle = S.flashCol;
        g2.globalAlpha = Math.min(0.92, S.flash);
        g2.fillRect(0, 0, W, H);
        g2.globalAlpha = 1;
      }

      S.shake = Math.max(0, S.shake - dt * 2.8);
      S.flash = Math.max(0, S.flash - dt * 2.6);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  },

  /* Multi-Open (up to 5 crates at once!) -> Plays Cinematic Slash for the BEST drop, then shows full grid */
  openMulti(count) {
    if (typeof Crates === 'undefined') return;
    const bag = Crates.bag();
    const n = Math.min(count || 5, bag.crates | 0);
    if (n <= 0) { Aud.sfx('deny'); return; }
    Aud.init && Aud.init();
    const results = [];
    for (let i = 0; i < n; i++) {
      const r = Crates.open();
      if (r) results.push(r);
    }
    if (!results.length) return;
    // Pick highest-rarity drop to headline the 3D Slash Cinema!
    let best = results[0];
    for (const x of results) if ((x.r | 0) > (best.r | 0)) best = x;
    this.run(best, () => this.showMultiSummary(results), results.length);
  },

  showMultiSummary(results) {
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const ov = document.createElement('div');
    ov.className = 'modal92-bg on';
    const box = document.createElement('div');
    box.className = 'modal92-box';
    box.style.maxWidth = '680px';
    box.innerHTML =
      '<div class="modal92-head"><h3>✨ ' + L('MULTI-CRATE HAUL') + ' (×' + results.length + ')</h3>' +
      '<button class="modal92-close" id="m94-x">✕</button></div>';

    const grid = document.createElement('div');
    grid.className = 'multi94-grid';
    for (const res of results) {
      const R0 = (typeof RAR !== 'undefined' && RAR[res.r]) || { n: 'COMMON', c: '#00f2fe' };
      const card = document.createElement('div');
      card.className = 'multi94-card';
      card.style.borderColor = R0.c;
      card.style.boxShadow = '0 0 18px ' + hexA(R0.c, 0.28);
      const ic = this.buildRewardCanvas(res, R0.c);
      card.appendChild(ic);
      const rarEl = document.createElement('div');
      rarEl.className = 'm94-rar'; rarEl.style.color = R0.c; rarEl.textContent = L(R0.n);
      const nmEl = document.createElement('div');
      nmEl.className = 'm94-nm';
      nmEl.textContent = res.item ? L(res.item.name) : (res.cr ? '+' + fmtNum(res.cr) + ' CR' : '+' + fmtNum(res.shards) + ' ' + L('SHARDS'));
      card.appendChild(rarEl); card.appendChild(nmEl);
      grid.appendChild(card);
    }
    box.appendChild(grid);

    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn pri';
    doneBtn.style.width = '100%';
    doneBtn.textContent = L('DONE');
    const close = () => { Aud.sfx('ui'); ov.remove(); if (UI.cur === 'crates') Crates.render(); };
    doneBtn.onclick = close;
    box.querySelector('#m94-x').onclick = close;
    box.appendChild(doneBtn);
    ov.appendChild(box);
    document.body.appendChild(ov);
    Aud.sfx('win');
  }
};

/* ==========================================================================
   HOOK WIRING — Clean v94 integration into CrateFilm, Crates & Settings
   ========================================================================== */
{
  // 1. Route CrateFilm.run through CrateCinema94 when enabled
  if (typeof CrateFilm !== 'undefined' && CrateFilm.run) {
    const cf94 = CrateFilm.run.bind(CrateFilm);
    CrateFilm.run = function (res, done) {
      if (S94.on('crate3d94', true) && !CALM) {
        try { CrateCinema94.run(res, done, 1); return; } catch (e) { errLog(e); }
      }
      return cf94(res, done);
    };
  }

  // 2. Inject "OPEN ×5 (MULTI-SLASH)" button in Crates.render when player has 2+ crates
  if (typeof Crates !== 'undefined' && Crates.render) {
    const cr94 = Crates.render.bind(Crates);
    Crates.render = function () {
      const r = cr94.apply(this, arguments);
      try {
        const b = this.bag(), n = Math.min(5, b.crates | 0);
        const hero = document.querySelector('#cx43Box .cr-hero .col');
        if (hero && n >= 2 && !hero.querySelector('#bMulti94')) {
          const mb = el('button', 'btn', ltf('OPEN ×{0} (MULTI-SLASH)', n));
          mb.id = 'bMulti94';
          mb.style.borderColor = '#ff4fd8';
          mb.style.color = '#ffb8f0';
          mb.onclick = () => CrateCinema94.openMulti(n);
          const firstBtn = hero.querySelector('button');
          if (firstBtn && firstBtn.nextSibling) hero.insertBefore(mb, firstBtn.nextSibling);
          else hero.appendChild(mb);
        }
      } catch (e) { errLog(e); }
      return r;
    };
  }

  // 3. Settings panel for v94 CINEMATIC CRATES
  if (typeof PC !== 'undefined' && PC.settings) {
    const ps94 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps94(head, cycle, box, s);
      try {
        head('CINEMATIC CRATES (v94)');
        cycle('3D Slash-to-Open Crates', 'crate3d94', [1, 0], ['ON', 'OFF']);
        cycle('Rarity Fake-Out Surprises', 'fakeout94', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

