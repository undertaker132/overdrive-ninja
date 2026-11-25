/* --- MODULE 5: v101.0 ACTION MASTERWORK (26+ GAMEPLAY, ANIMATION & DESIGN UPGRADES) --- */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "v101.0 — ACTION MASTERWORK: LIVING HERO MOVEMENT, 3D ACTION CAM & 26+ UPGRADES": "v101.0 — מהדורת האקשן: תנועת דמות חיה, מצלמת 3D דינמית ו־26+ שדרוגים",
      "Complete gameplay & animation leap: Fixed R3.render 3D sync awakening all 3D Boss Enrage, Armor Break, Destructible Props & Track Events; New 50° Action 3D Camera with smooth hero tracking, turn banking & slash zoom-punch; Living Hero Locomotion (unthrottled 360° WASD inertia, velocity-synced stride speed, dynamic pitch/roll leaning, independent legs vs. torso/head aim tracking, alive breathing/weight-shift, 4-hit alternating slash combo, Sandevistan 3D ghost silhouettes & landing crouch); Overhead Neon Maglev Gantry Arches, Holographic Sky Billboards, High-Speed Wind Streaks, Flying 3D Crescent Slash Waves, Smart 3D Lock-On Reticle, 3D Ground Aim Ring, Enemy Drop-Pod Spawn Beams, Cinematic Top Boss HP+Armor Bar, Live Blade Rank Glow, Hero Ground Charge Ring & Damage/Parry Vignette.": "קפיצת מדרגה מלאה במשחקיות ובאנימציות: תוקן חיבור R3.render שהעיר לחיים את כל אפקטי התלת־ממד (זעם בוסים, שבירת שריון, אובייקטים הריסים ואירועי מסילה); מצלמת אקשן 3D חדשה ב־50° עם מעקב חלק, הטיית פנייה וזום־פאנץ׳; תנועת גיבור חיה ולא סטטית (WASD חלק ב־360° עם אינרציה, קצב צעדים מסונכרן מהירות, הטיית גוף בפניות, הפרדת רגליים מול פלג גוף עליון/ראש לכיוון המטרה, נשימה והעברת משקל בעמידה, קומבו 4 מכות מתחלפות, צלליות Sandevistan תלת־ממדיות וכפיפת נחיתה); קשתות מגלב זוהרות, שלטי הולוגרמה ענקיים, פסי רוח ומהירות, גלי חיתוך 3D מעופפים, נעילת מטרה חכמה, כוונת קרקע 3D, אלומות נחיתה לאויבים, מד בוס קולנועי משולב שריון, הילת להב לפי דירוג וטבעת אנרגיה מתחת לגיבור.",
      "Action 3D Camera": "מצלמת אקשן 3D",
      "ACTION 3D": "אקשן 3D",
      "CLASSIC 3D": "קלאסית 3D",
      "ARMOR": "שריון",
      "EXPOSED 1.6x!": "ליבה חשופה 1.6x!",
      "PHASE": "שלב"
    });
  } catch (e) {}

  const S101 = {
    on(k, d) {
      try {
        const s = Store && Store.data && Store.data.settings;
        return (!s || s[k] == null) ? (d == null ? true : !!d) : !!s[k];
      } catch (e) { return true; }
    },
    isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
    L(s) { return typeof lt === 'function' ? lt(s) : s; }
  };

  function angWrap(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  /* ========================================================================
     A. LivingHero101 — TRUE NON-STATIC, PHYSICALLY ALIVE CHARACTER MOVEMENT
        (Upgrades #1–#8: 360° WASD Inertia, Velocity-Synced Stride, Pitch/Roll
         Turn Banking, Independent Torso/Head Aim Tracking, Alive Breathing &
         Weight-Shift, 4-Hit Alternating Slash Combo, 3D Sandevistan Ghosts,
         Footstep Neon Sparks & Landing Crouch Compression)
     ======================================================================== */
  const LivingHero101 = {
    locVx: 0, locVy: 0,
    smoothYaw: -Math.PI / 2,
    leanPitch: 0, leanRoll: 0,
    torsoTwist: 0, headTwist: 0,
    comboStep: 0, comboTimer: 0, slashAnimT: 0,
    landSquash: 0, wasAir: false,
    stepDist: 0, stepFoot: 1,
    ghostTimer: 0, ghosts: [],

    reset() {
      this.locVx = 0; this.locVy = 0;
      this.leanPitch = 0; this.leanRoll = 0;
      this.torsoTwist = 0; this.headTwist = 0;
      this.comboStep = 0; this.comboTimer = 0; this.slashAnimT = 0;
      this.landSquash = 0; this.wasAir = false;
      this.stepDist = 0;
      for (const gh of this.ghosts) {
        if (gh.m && gh.m.parent) gh.m.parent.remove(gh.m);
        if (gh.m) { gh.m.geometry.dispose(); gh.m.material.dispose(); }
      }
      this.ghosts.length = 0;
    },

    // Upgrade #1: Unthrottled 360° WASD Locomotion with crisp acceleration & counter-strafe
    stepLocomotion(dt) {
      if (typeof G === 'undefined' || G.state !== 'PLAY' || !simV(103) || G.freeze > 0 || typeof P === 'undefined') return;
      if (typeof PCMaster90 === 'undefined') return;
      const k = PCMaster90.mask98; // (v103: the recorded WASD mask, not the live keys, so a replay walks the same way)
      const mx = (k & 8 ? 1 : 0) - (k & 2 ? 1 : 0);
      const my = (k & 4 ? 1 : 0) - (k & 1 ? 1 : 0);
      const dashing = P.dashT > 0.03;

      if (!dashing && (mx || my)) {
        const len = Math.hypot(mx, my) || 1;
        const nx = mx / len, ny = my / len;
        const topSpd = (G.odT > 0 ? 470 : 375) * (typeof In !== 'undefined' && In.on ? 0.58 : 1);
        const accel = 16;
        const k = 1 - Math.exp(-accel * dt);
        this.locVx += (nx * topSpd - this.locVx) * k;
        this.locVy += (ny * topSpd - this.locVy) * k;

        P.x = clamp(P.x + this.locVx * dt, (V.L || 40) + 16, (V.R || 380) - 16);
        P.y = clamp(P.y + this.locVy * dt, 40, (V.VH || 760) - 44);
        const spd = Math.hypot(this.locVx, this.locVy);
        P.spd = Math.max(P.spd || 0, spd);
        P.mvA = Math.atan2(this.locVy, this.locVx);
        P.walkPh = (P.walkPh || 0) + spd * dt * 0.085;

        // Upgrade #8: Rhythmic boot sparks on maglev steel roof
        this.stepDist += spd * dt;
        if (this.stepDist > 52) {
          this.stepDist = 0;
          this.stepFoot *= -1;
          if (typeof FX !== 'undefined') {
            const perp = P.mvA + Math.PI * 0.5 * this.stepFoot;
            FX.spark(P.x + Math.cos(perp) * 7, P.y + Math.sin(perp) * 7, G.odT > 0 ? '#ffd700' : (P.ca || '#00f2fe'), 2, 0.28);
          }
        }
      } else {
        const decel = Math.exp(-14 * dt);
        this.locVx *= decel;
        this.locVy *= decel;
      }
    },

    onSlash(a) {
      this.comboStep = (this.comboStep + 1) % 4;
      this.comboTimer = 1.15;
      this.slashAnimT = 0.28;
      this.smoothYaw = a;
    },

    // Upgrade #7: 3D Sandevistan translucent afterimage silhouettes during dash & Overdrive
    spawnGhost(heroG) {
      if (typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined' || !heroG || this.ghosts.length >= 6) return;
      const T = THREE;
      const col = (typeof G !== 'undefined' && G.odT > 0) ? 0xffd700 : new T.Color((typeof P !== 'undefined' && P.ca) || '#00f2fe');
      const geo = new T.ConeGeometry(10, 42, 6);
      geo.rotateX(Math.PI / 2);
      const mat = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.42, wireframe: false, blending: T.AdditiveBlending, depthWrite: false });
      const m = new T.Mesh(geo, mat);
      m.position.set(heroG.position.x, heroG.position.y, (heroG.position.z || 0) + 22);
      m.rotation.z = heroG.rotation.z;
      m.scale.set(0.95, 0.65, 1);
      R3.root.add(m);
      this.ghosts.push({ m, life: 0.28, maxL: 0.28 });
    },

    tickGhosts(rd) {
      const dt = Math.min(0.05, rd || 0.016);
      for (const gh of this.ghosts) {
        gh.life -= dt;
        const k = Math.max(0, gh.life / gh.maxL);
        gh.m.material.opacity = 0.44 * k;
        gh.m.scale.setScalar(0.85 + (1 - k) * 0.22);
        if (gh.life <= 0) {
          if (gh.m.parent) gh.m.parent.remove(gh.m);
          gh.m.geometry.dispose(); gh.m.material.dispose();
        }
      }
      this.ghosts = this.ghosts.filter(gh => gh.life > 0);
    },

    applyToHero(g, o, rd, t) {
      if (!g || !g.human || !g.human.r || !o) return;
      const dt = Math.min(0.05, rd || 0.016);
      const B = g.human.B || {};
      const r = g.human.r;
      const dash = !!o.dashing;
      const vx = dash ? (P.vx || 0) : (Math.abs(this.locVx) > 8 ? this.locVx : (P.vx || 0));
      const vy = dash ? (P.vy || 0) : (Math.abs(this.locVy) > 8 ? this.locVy : (P.vy || 0));
      const realSpd = Math.hypot(vx, vy);
      const moving = realSpd > 24;

      // Upgrade #2: Velocity-Synced Stride Playback (zero sliding or frozen walk!)
      const clipName = dash || realSpd > 195 ? 'run' : moving ? 'walk' : 'idle';
      if (typeof Models !== 'undefined' && typeof Human !== 'undefined') {
        Models.play(r, Human.clip(r, clipName), 0.14);
        const speedMult = dash ? 1.85 : moving ? clamp(realSpd / 240, 0.85, 1.75) : 1.0;
        r.mixer.update(dt * Math.max(0, speedMult - 1.0)); // top-up beyond base Human.anim update
      }

      // Compute desired leg yaw (movement direction when running, aim direction when idle/dashing)
      let aimAng = o.face || 0;
      if (typeof PC !== 'undefined' && PC.mouseOn() && typeof P !== 'undefined') {
        aimAng = Math.atan2(PC.wy() - P.y, PC.wx() - P.x);
      } else if (LockOn101.target && typeof P !== 'undefined') {
        aimAng = Math.atan2(LockOn101.target.y - P.y, LockOn101.target.x - P.x);
      }
      const legTarget = dash ? (P.ang || aimAng) : moving ? Math.atan2(vy, vx) : aimAng;
      const yawDiff = angWrap(legTarget - this.smoothYaw);
      this.smoothYaw = angWrap(this.smoothYaw + yawDiff * (1 - Math.exp(-(dash ? 26 : 15) * dt)));
      g.rotation.z = this.smoothYaw;

      // Upgrade #3: Dynamic Sprint Pitch Lean + Sharp-Turn Roll Banking!
      const wantPitch = dash ? 0.42 : moving ? clamp(realSpd / 400, 0, 1) * 0.26 : 0;
      const wantRoll = clamp(yawDiff * (moving ? 0.55 : 0.18), -0.32, 0.32);
      const kL = 1 - Math.exp(-12 * dt);
      this.leanPitch += (wantPitch - this.leanPitch) * kL;
      this.leanRoll += (wantRoll - this.leanRoll) * kL;

      // Upgrade #4: Independent Upper-Body Aim Tracking (Torso & Head track target while legs run!)
      const relAim = clamp(angWrap(aimAng - this.smoothYaw), -1.05, 1.05);
      this.torsoTwist += (relAim * 0.52 - this.torsoTwist) * kL;
      this.headTwist += (relAim * 0.42 - this.headTwist) * kL;

      if (B.spine) {
        B.spine.rotation.x += this.leanPitch;
        B.spine.rotation.z += this.leanRoll;
      }
      if (B.spine2) B.spine2.rotation.y += this.torsoTwist;
      if (B.head) B.head.rotation.y += this.headTwist;

      // Upgrade #5: Alive Idle Breathing, Hip Weight-Shift & Alert Head Scan
      if (!moving && !dash) {
        const breath = Math.sin(t * 2.9);
        const shift = Math.sin(t * 1.35);
        if (B.hips) {
          B.hips.position.y += breath * 0.85;
          B.hips.rotation.z += shift * 0.045;
        }
        if (B.spine2) B.spine2.rotation.x += breath * 0.045;
        if (B.head) B.head.rotation.y += Math.sin(t * 0.95) * 0.11;
      }

      // Upgrade #6: 4-Hit Alternating 3D Slash Combo Choreography!
      if (this.comboTimer > 0) this.comboTimer -= dt; else this.comboStep = 0;
      if (this.slashAnimT > 0) {
        this.slashAnimT = Math.max(0, this.slashAnimT - dt);
        const p = 1 - (this.slashAnimT / 0.28);
        const s = Math.sin(p * Math.PI);
        if (this.comboStep === 1 && B.spine2 && B.rArm) {
          // Forehand diagonal cut
          B.spine2.rotation.y += 0.72 * s;
          B.rArm.rotation.x -= 0.85 * s;
        } else if (this.comboStep === 2 && B.spine2 && B.rArm) {
          // Reverse backhand sweep
          B.spine2.rotation.y -= 0.88 * s;
          B.rArm.rotation.z += 0.95 * s;
        } else if (this.comboStep === 3 && B.spine2 && B.rArm) {
          // Low rising dragon fang
          B.spine2.rotation.x -= 0.35 * s;
          B.rArm.rotation.x += 1.05 * s;
        } else if (this.comboStep === 0) {
          // 360° Cyclone Finisher Spin!
          g.rotation.z = this.smoothYaw + p * Math.PI * 2;
        }
      }

      // Upgrade #8b: Landing Crouch Squash after Air Juggle / Helm Breaker!
      const inAir = (g.position.z || 0) > 4;
      if (this.wasAir && !inAir) {
        this.landSquash = 0.24;
        if (typeof FX !== 'undefined' && typeof P !== 'undefined') FX.ring(P.x, P.y, 46, P.ca || '#00f2fe', 4);
      }
      this.wasAir = inAir;
      if (this.landSquash > 0) {
        this.landSquash = Math.max(0, this.landSquash - dt);
        const sq = Math.sin((this.landSquash / 0.24) * Math.PI);
        g.scale.set(1 + 0.14 * sq, 1 + 0.14 * sq, 1 - 0.22 * sq);
      } else {
        g.scale.set(1, 1, 1);
      }

      // Upgrade #7b: Periodic Sandevistan 3D Ghost during Dash or Overdrive
      if (dash || (typeof G !== 'undefined' && G.odT > 0 && realSpd > 140)) {
        this.ghostTimer -= dt;
        if (this.ghostTimer <= 0) {
          this.ghostTimer = dash ? 0.045 : 0.095;
          this.spawnGhost(g);
        }
      }

      // Upgrade #21: Live Weapon Rank Energy Glow & Overdrive Blaze
      if (g.bladeMat && g.bladeMat.emissiveIntensity != null) {
        const rk = (typeof G !== 'undefined' && G.styleRk) | 0;
        const od = typeof G !== 'undefined' && G.odT > 0;
        g.bladeMat.emissiveIntensity = od ? (4.0 + Math.sin(t * 22) * 0.8) : (1.8 + rk * 0.35);
      }
    }
  };

  /* ========================================================================
     B. ActionCam101 — PREVIEW-STYLE 50° ACTION 3D CAMERA (100% ALIGNED!)
        Drives native GL3D.cam + GL3D.setView so 2D/3D/mouse stay pixel-locked!
     ======================================================================== */
  const ActionCam101 = {
    curX: 210, curY: 380, curZ: 1.0, curTh: 0.698, curYaw: 0, punchZ: 0,
    onSlash() { this.punchZ = Math.min(0.11, this.punchZ + 0.06); },
    apply() {
      if (!S101.on('actionCam101', true) || typeof GL3D === 'undefined' || typeof G === 'undefined' || G.state !== 'PLAY' || typeof P === 'undefined' || (typeof CALM !== 'undefined' && CALM)) return;
      if (G.mode === 'puzzle') return;

      const dt = 0.016;
      const k = 1 - Math.exp(-7.5 * dt);
      this.punchZ = Math.max(0, this.punchZ - dt * 0.42);

      // Dynamic 50° perspective tilt + subtle side-banking when strafing/dashing
      const wantTh = 50 * Math.PI / 180;
      const latV = clamp((P.vx || LivingHero101.locVx || 0) / 800, -1, 1);
      const wantYaw = -latV * 0.036;
      this.curTh += (wantTh - this.curTh) * k;
      this.curYaw += (wantYaw - this.curYaw) * k;
      GL3D.setView(this.curTh, this.curYaw);

      // Smooth hero-following zoom (1.20x base, 1.12x during boss for tactical overview, +slash punch!)
      const hasBoss = typeof Boss !== 'undefined' && !!Boss.cur;
      const wantZ = (hasBoss ? 1.11 : 1.20) + (G.odT > 0 ? 0.05 : 0) + this.punchZ;
      const C = GL3D.cam;
      this.curZ += (wantZ - this.curZ) * k;
      const finalZ = Math.max(C.z || 1, this.curZ);

      // Track hero + gentle mouse lookahead, safely clamped inside the roof arena
      let lx = 0, ly = 0;
      if (typeof PC !== 'undefined' && PC.mouseOn()) {
        lx = clamp((PC.wx() - P.x) * 0.12, -36, 36);
        ly = clamp((PC.wy() - P.y) * 0.12, -40, 40);
      }
      const tx = P.x * 0.72 + (V.CX || 210) * 0.28 + lx;
      const ty = P.y * 0.68 + ((V.VH || 760) * 0.5) * 0.32 + ly;
      this.curX += (tx - this.curX) * k;
      this.curY += (ty - this.curY) * k;

      const hw = (V.VW || 420) / (2 * finalZ);
      const hh = (V.VH || 760) / (2 * finalZ);
      const ox = (typeof CAM !== 'undefined' ? CAM.ox : 0) || 0;
      const oy = (typeof CAM !== 'undefined' ? CAM.oy : 0) || 0;
      C.x = clamp(this.curX, hw * 0.55, (V.VW || 420) - hw * 0.55) - ox;
      C.y = clamp(this.curY, hh * 0.55, (V.VH || 760) - hh * 0.55) - oy;
      C.z = finalZ;
    }
  };

  /* ========================================================================
     C. WorldDesign101 — OVERHEAD NEON MAGLEV ARCHES, SPEED STREAKS,
        HOLOGRAPHIC SKY BILLBOARDS, ROOF ENERGY RAILS & OVERDRIVE EMBERS
        (Upgrades #9–#14)
     ======================================================================== */
  const WorldDesign101 = {
    built: false,
    arches: [], streaks: [], billboards: [], rails: [], embers: [],
    railMat: null, archGlowMat: null,

    ensure() {
      if (this.built || typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
      this.built = true;
      const T = THREE;
      const g = new T.Group();
      R3.root.add(g);

      const steelMat = new T.MeshStandardMaterial({ color: 0x10172c, metalness: 0.85, roughness: 0.26 });
      this.archGlowMat = new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.85 });
      this.railMat = new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.9 });

      // Upgrade #9: 6 Overhead Rushing Neon Maglev Gantry Arches
      for (let i = 0; i < 6; i++) {
        const ag = new T.Group();
        const L = (V.L || 40) - 24, Rr = (V.R || 380) + 24, CX = (L + Rr) * 0.5, span = Rr - L;
        for (const s of [-1, 1]) {
          const post = new T.Mesh(new T.BoxGeometry(10, 12, 165), steelMat);
          post.position.set(s * (span * 0.5), 0, 82);
          ag.add(post);
          const strip = new T.Mesh(new T.BoxGeometry(3.2, 14, 150), this.archGlowMat);
          strip.position.set(s * (span * 0.5 - 5), 0, 82);
          ag.add(strip);
        }
        const beam = new T.Mesh(new T.BoxGeometry(span + 16, 12, 10), steelMat);
        beam.position.set(0, 0, 165); ag.add(beam);
        const topGlow = new T.Mesh(new T.BoxGeometry(span - 14, 14, 4), this.archGlowMat);
        topGlow.position.set(0, 0, 159); ag.add(topGlow);
        ag.position.set(CX, -900 + i * 520, 0);
        g.add(ag);
        this.arches.push(ag);
      }

      // Upgrade #10: Luminous Dual Roof Edge Energy Rails
      for (const s of [-1, 1]) {
        const rail = new T.Mesh(new T.BoxGeometry(4.5, 1100, 4.5), this.railMat);
        rail.position.set((V.CX || 210) + s * ((V.R - V.L) * 0.5 + 4), (V.VH || 760) * 0.5, 4);
        g.add(rail);
        this.rails.push({ m: rail, s });
      }

      // Upgrade #11: 24 High-Speed 3D Maglev Wind & Neon Streaks
      const stGeo = new T.BoxGeometry(2.2, 72, 2.2);
      for (let i = 0; i < 24; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const m = new T.Mesh(stGeo, new T.MeshBasicMaterial({
          color: i % 3 === 0 ? 0xff4fd8 : 0x00f2fe,
          transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false
        }));
        m.position.set((V.CX || 210) + side * (200 + Math.random() * 140), -600 + Math.random() * 2000, 18 + Math.random() * 110);
        g.add(m);
        this.streaks.push({ m, side, off: 200 + Math.random() * 140, spd: 1.1 + Math.random() * 0.9 });
      }

      // Upgrade #12: Floating Holographic Neo-Edo Sky Billboards
      const bbCols = [0x00f2fe, 0xff2bd6, 0xffd700, 0x00ff88];
      for (let i = 0; i < 6; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const bg = new T.Group();
        const col = bbCols[i % bbCols.length];
        const pane = new T.Mesh(new T.BoxGeometry(6, 130, 88), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false }));
        const frame = new T.Mesh(new T.BoxGeometry(7, 134, 92), new T.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.65 }));
        bg.add(pane); bg.add(frame);
        bg.position.set((V.CX || 210) + side * 340, -1000 + i * 560, 75 + (i % 3) * 35);
        g.add(bg);
        this.billboards.push({ m: bg, side });
      }

      // Upgrade #14: 14 Rising Overdrive Golden Energy Embers
      const emGeo = new T.OctahedronGeometry(3.4, 0);
      const emMat = new T.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false });
      for (let i = 0; i < 14; i++) {
        const em = new T.Mesh(emGeo, emMat);
        em.visible = false;
        g.add(em);
        this.embers.push({ m: em, ang: (i / 14) * Math.PI * 2, rad: 18 + (i % 4) * 11, z: Math.random() * 60 });
      }
    },

    tick(rd, t) {
      this.ensure();
      if (!this.built) return;
      const dt = Math.min(0.05, rd || 0.016);
      const play = typeof G !== 'undefined' && G.state === 'PLAY';
      const od = play && G.odT > 0;
      const dash = play && typeof P !== 'undefined' && P.dashT > 0;
      const boss = play && typeof Boss !== 'undefined' && !!Boss.cur;
      const spdMul = play ? (od ? 2.4 : dash ? 1.85 : 1.0) : 0.35;
      const CX = typeof V !== 'undefined' ? ((V.L + V.R) * 0.5) : 210;
      const halfW = typeof V !== 'undefined' ? ((V.R - V.L) * 0.5) : 170;

      // Dynamic neon theme tinting (Gold in Overdrive, Crimson/Magenta in Boss, Cyan default)
      const targetHex = od ? 0xffd700 : boss ? 0xff2bd6 : 0x00f2fe;
      if (this.railMat) this.railMat.color.lerp(new THREE.Color(targetHex), Math.min(1, dt * 6));
      if (this.archGlowMat) this.archGlowMat.color.lerp(new THREE.Color(targetHex), Math.min(1, dt * 6));

      // Scroll overhead neon maglev gantry arches
      const archSpd = 760 * spdMul;
      for (const a of this.arches) {
        a.position.x = CX;
        a.position.y += archSpd * dt;
        if (a.position.y > 1600) a.position.y -= 3120;
      }

      // Align dual glowing roof edge rails
      for (const r of this.rails) {
        r.m.position.x = CX + r.s * (halfW + 4);
      }

      // Scroll high-speed 3D wind/neon streaks
      const stSpd = 1450 * spdMul;
      for (const s of this.streaks) {
        s.m.position.x = CX + s.side * (halfW + 24 + (s.off - 200));
        s.m.position.y += stSpd * s.spd * dt;
        s.m.scale.y = od ? 2.1 : dash ? 1.6 : 1.0;
        if (s.m.position.y > 1200) s.m.position.y -= 2000;
      }

      // Scroll holographic Neo-Edo sky billboards
      for (const bb of this.billboards) {
        bb.m.position.x = CX + bb.side * (halfW + 170);
        bb.m.position.y += 340 * spdMul * dt;
        bb.m.position.z = 80 + Math.sin(t * 2 + bb.side) * 10;
        if (bb.m.position.y > 1700) bb.m.position.y -= 3360;
      }

      // Upgrade #13: Calibrated UnrealBloom glow & rim lighting
      if (typeof R3 !== 'undefined' && R3.bloom && !(window.__V96 && window.__V96.FinisherCam96 && window.__V96.FinisherCam96.t > 0)) {
        R3.bloom.strength = od ? 0.72 : 0.56;
      }

      // Upgrade #14: Rising golden embers around hero during Overdrive
      for (const em of this.embers) {
        em.m.visible = od && typeof P !== 'undefined';
        if (em.m.visible) {
          em.ang += dt * 4.5;
          em.z = (em.z + dt * 95) % 72;
          em.m.position.set(P.x + Math.cos(em.ang) * em.rad, P.y + Math.sin(em.ang) * em.rad, em.z);
          em.m.rotation.z = t * 8;
        }
      }
    }
  };

  /* ========================================================================
     D. CombatJuice101 — 3D CRESCENT SLASH WAVES, SMART LOCK-ON DIAMOND,
        GROUND CURSOR AIM RING, ENEMY DROP-POD BEAMS & IMPACT SHOCKWAVES
        (Upgrades #15–#19, #22–#25)
     ======================================================================== */
  const LockOn101 = {
    target: null,
    mesh: null,
    aimRing: null,
    heroRing: null,
    slashWaves: [],
    beams: [],
    shocks: [],
    seenEn: new Set(),

    ensure() {
      if (this.mesh || typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
      const T = THREE;
      // Upgrade #16: Smart 3D rotating lock-on diamond
      const lg = new T.Group();
      const d1 = new T.Mesh(new T.TorusGeometry(20, 1.8, 6, 4), new T.MeshBasicMaterial({ color: 0xff0844, transparent: true, opacity: 0.9 }));
      const d2 = new T.Mesh(new T.TorusGeometry(27, 1.0, 6, 24), new T.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.55 }));
      lg.add(d1); lg.add(d2); lg.visible = false;
      R3.root.add(lg);
      this.mesh = lg;

      // Upgrade #17: Glowing 3D Ground Cursor Aim Ring
      const ag = new T.Group();
      const a1 = new T.Mesh(new T.TorusGeometry(15, 1.3, 6, 24), new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.72 }));
      const a2 = new T.Mesh(new T.TorusGeometry(6, 1.0, 6, 4), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
      ag.add(a1); ag.add(a2); ag.visible = false;
      R3.root.add(ag);
      this.aimRing = ag;

      // Upgrade #23: Hero Ground Energy / Dash Charge Ring
      const hg = new T.Group();
      const h1 = new T.Mesh(new T.TorusGeometry(22, 1.4, 6, 28), new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.55 }));
      hg.add(h1); hg._mat = h1.material; hg.visible = false;
      R3.root.add(hg);
      this.heroRing = hg;
    },

    // Upgrade #15: Flying 3D Crescent Slash Wave on every slash!
    spawnSlashWave(x, y, ang) {
      if (typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined' || this.slashWaves.length >= 8) return;
      const T = THREE;
      const od = typeof G !== 'undefined' && G.odT > 0;
      const col = od ? 0xffd700 : new T.Color((typeof P !== 'undefined' && P.ca) || '#00f2fe');
      const wg = new T.Group();
      const arc = new T.Mesh(
        new T.TorusGeometry(28, od ? 4.2 : 2.8, 6, 18, Math.PI * 0.88),
        new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.92, blending: T.AdditiveBlending, depthWrite: false })
      );
      arc.rotation.z = -Math.PI * 0.44;
      const core = new T.Mesh(
        new T.TorusGeometry(28, 1.2, 6, 16, Math.PI * 0.78),
        new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })
      );
      core.rotation.z = -Math.PI * 0.39;
      wg.add(arc); wg.add(core);
      wg.position.set(x, y, 22);
      wg.rotation.z = ang;
      R3.root.add(wg);
      this.slashWaves.push({ g: wg, vx: Math.cos(ang) * 760, vy: Math.sin(ang) * 760, life: 0.28, maxL: 0.28, m1: arc.material, m2: core.material });
    },

    // Upgrade #18: Enemy Drop-Pod Holographic Spawn Beam
    spawnDropBeam(x, y, elite) {
      if (typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined' || this.beams.length >= 10) return;
      const T = THREE;
      const m = new T.Mesh(
        new T.CylinderGeometry(elite ? 18 : 11, elite ? 24 : 15, 220, 12, 1, true),
        new T.MeshBasicMaterial({ color: elite ? 0xffd700 : 0xff2b5e, transparent: true, opacity: 0.55, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })
      );
      m.rotation.x = Math.PI / 2;
      m.position.set(x, y, 110);
      R3.root.add(m);
      this.beams.push({ m, life: 0.34, maxL: 0.34 });
    },

    // Upgrade #25: 3D Expanding Impact Shockwave Ring (Crit / Parry / Kill)
    spawnShock(x, y, col, maxR) {
      if (typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined' || this.shocks.length >= 8) return;
      const T = THREE;
      const m = new T.Mesh(
        new T.TorusGeometry(14, 2.2, 6, 24),
        new T.MeshBasicMaterial({ color: new T.Color(col || '#00f2fe'), transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false })
      );
      m.position.set(x, y, 12);
      R3.root.add(m);
      this.shocks.push({ m, life: 0.32, maxL: 0.32, maxScale: (maxR || 75) / 14 });
    },

    tick(rd, t) {
      this.ensure();
      const dt = Math.min(0.05, rd || 0.016);
      const play = typeof G !== 'undefined' && G.state === 'PLAY' && typeof P !== 'undefined';

      // Update Lock-On Target nearest to mouse cursor (or player on touch)
      this.target = null;
      if (play && typeof EN !== 'undefined') {
        const refX = (typeof PC !== 'undefined' && PC.mouseOn()) ? PC.wx() : P.x;
        const refY = (typeof PC !== 'undefined' && PC.mouseOn()) ? PC.wy() : P.y;
        let bestD = 210;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e || !e.alive) continue;
          // Upgrade #18: Detect newly spawned enemies -> Drop-Pod Beam!
          if (!this.seenEn.has(e.uid)) {
            this.seenEn.add(e.uid);
            if (this.seenEn.size > 240) this.seenEn.clear();
            this.spawnDropBeam(e.x, e.y, !!e.elite);
          }
          const d = Math.hypot(e.x - refX, e.y - refY);
          if (d < bestD) { bestD = d; this.target = e; }
        }
        if (!this.target && typeof Boss !== 'undefined' && Boss.cur && !(Boss.cur.dying > 0)) {
          if (Math.hypot(Boss.cur.x - refX, Boss.cur.y - refY) < 250) this.target = Boss.cur;
        }
      }

      if (this.mesh) {
        this.mesh.visible = !!(play && this.target);
        if (this.target) {
          this.mesh.position.set(this.target.x, this.target.y, 4);
          this.mesh.rotation.z = t * 4.2;
          const sc = ((this.target.r || 18) / 18) * (1 + Math.sin(t * 14) * 0.08);
          this.mesh.scale.setScalar(sc);
        }
      }

      if (this.aimRing) {
        const showAim = play && typeof PC !== 'undefined' && PC.mouseOn();
        this.aimRing.visible = showAim;
        if (showAim) {
          this.aimRing.position.set(PC.wx(), PC.wy(), 3);
          this.aimRing.rotation.z = -t * 3.2;
          this.aimRing.scale.setScalar(P.ch > 0 ? 1.0 : 0.72);
        }
      }

      if (this.heroRing) {
        this.heroRing.visible = play;
        if (play) {
          this.heroRing.position.set(P.x, P.y, 2.5);
          this.heroRing.rotation.z = t * (G.odT > 0 ? 6 : 1.8);
          const col = G.odT > 0 ? 0xffd700 : P.ch <= 0 ? 0xff3b5c : (P.ca || '#00f2fe');
          this.heroRing._mat.color.set(col);
          this.heroRing.scale.setScalar(0.95 + (P.ch / Math.max(1, P.maxCh || 3)) * 0.22);
        }
      }

      // Tick flying 3D Slash Waves
      for (const sw of this.slashWaves) {
        sw.life -= dt;
        const k = Math.max(0, sw.life / sw.maxL);
        sw.g.position.x += sw.vx * dt; sw.g.position.y += sw.vy * dt;
        const sc = 1 + (1 - k) * 0.95;
        sw.g.scale.set(sc, sc, 1);
        sw.m1.opacity = 0.92 * k; sw.m2.opacity = 0.95 * k;
        if (sw.life <= 0) {
          if (sw.g.parent) sw.g.parent.remove(sw.g);
          sw.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      }
      this.slashWaves = this.slashWaves.filter(sw => sw.life > 0);

      // Tick Drop-Pod Beams
      for (const b of this.beams) {
        b.life -= dt;
        const k = Math.max(0, b.life / b.maxL);
        b.m.material.opacity = 0.55 * k;
        b.m.scale.set(0.35 + k * 0.65, 1, 0.35 + k * 0.65);
        if (b.life <= 0) {
          if (b.m.parent) b.m.parent.remove(b.m);
          b.m.geometry.dispose(); b.m.material.dispose();
        }
      }
      this.beams = this.beams.filter(b => b.life > 0);

      // Tick 3D Impact Shockwaves
      for (const sh of this.shocks) {
        sh.life -= dt;
        const p = 1 - Math.max(0, sh.life / sh.maxL);
        // v109: the ring grows, its line stays thin (scaled as a whole the tube grew with it: from the chase camera a fat
        // white crescent that covered the hero)
        const R = 14 * (1 + p * (sh.maxScale - 1)), q = Math.round(R);
        if (q !== sh.q) { sh.q = q; sh.m.geometry.dispose(); sh.m.geometry = new THREE.TorusGeometry(q, 2.2 * (1 - p * .5), 4, 40); }
        sh.m.material.opacity = 0.9 * (1 - p);
        if (sh.life <= 0) {
          if (sh.m.parent) sh.m.parent.remove(sh.m);
          sh.m.geometry.dispose(); sh.m.material.dispose();
        }
      }
      this.shocks = this.shocks.filter(sh => sh.life > 0);
    }
  };

  /* ========================================================================
     E. BossHud101 & Vig101 — CINEMATIC TOP BOSS HP+ARMOR BAR & COMBAT VIGNETTE
        (Upgrades #20 & #24)
     ======================================================================== */
  const BossHud101 = {
    el: null, nmEl: null, phEl: null, hpFill: null, hpLag: null, armLbl: null, armFill: null,
    vigEl: null, vigT: 0, vigCol: 'rgba(255,8,68,.55)',
    ensure() {
      if (!this.el) {
        const d = document.createElement('div');
        d.id = 'boss-hud101';
        d.innerHTML =
          '<div class="bh101-top"><span class="bh101-nm"></span><span class="bh101-ph"></span></div>' +
          '<div class="bh101-hp-bg"><div class="bh101-hp-lag"></div><div class="bh101-hp-fill"></div></div>' +
          '<div class="bh101-arm-row"><span class="bh101-arm-lbl"></span><div class="bh101-arm-bg"><div class="bh101-arm-fill"></div></div></div>';
        document.body.appendChild(d);
        this.el = d;
        this.nmEl = d.querySelector('.bh101-nm');
        this.phEl = d.querySelector('.bh101-ph');
        this.hpFill = d.querySelector('.bh101-hp-fill');
        this.hpLag = d.querySelector('.bh101-hp-lag');
        this.armLbl = d.querySelector('.bh101-arm-lbl');
        this.armFill = d.querySelector('.bh101-arm-fill');
      }
      if (!this.vigEl) {
        const v = document.createElement('div');
        v.id = 'vig101';
        document.body.appendChild(v);
        this.vigEl = v;
      }
    },
    flashVig(col, dur) {
      this.ensure();
      this.vigCol = col;
      this.vigT = Math.max(this.vigT, dur || 0.35);
    },
    tick(rd) {
      this.ensure();
      const dt = Math.min(0.05, rd || 0.016);
      const play = typeof G !== 'undefined' && G.state === 'PLAY' && !G.photo;
      const b = play && typeof Boss !== 'undefined' ? Boss.cur : null;
      const show = !!(b && !(b.dying > 0));
      this.el.style.display = show ? 'block' : 'none';

      if (show) {
        const info = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[b.id]) || { name: b.id };
        const hpPct = clamp((b.hp / Math.max(1, b.mhp)) * 100, 0, 100);
        const ph = Math.max(b.ph || 1, hpPct <= 32 ? 3 : hpPct <= 62 ? 2 : 1);
        this.nmEl.textContent = S101.L(info.name || b.id).toUpperCase();
        this.phEl.textContent = S101.L('PHASE') + ' ' + ph + '/3';
        this.hpFill.style.width = hpPct.toFixed(1) + '%';
        this.hpLag.style.width = hpPct.toFixed(1) + '%';

        const ab = window.__V96 && window.__V96.ArmorBreak96;
        const broken = ab && ab.breakTimer > 0;
        this.el.classList.toggle('broken', !!broken);
        if (broken) {
          this.armLbl.textContent = '💥 ' + S101.L('EXPOSED 1.6x!');
          this.armFill.style.width = clamp((ab.breakTimer / 10) * 100, 0, 100).toFixed(1) + '%';
          this.armFill.style.background = 'linear-gradient(90deg, #ff0844, #ffd700)';
        } else {
          const alivePlates = ab && ab.plates ? ab.plates.filter(p => p.alive).length : 4;
          const totalPlates = ab && ab.plates && ab.plates.length ? ab.plates.length : 4;
          this.armLbl.textContent = '🛡 ' + S101.L('ARMOR') + ' ' + alivePlates + '/' + totalPlates;
          this.armFill.style.width = ((alivePlates / Math.max(1, totalPlates)) * 100).toFixed(1) + '%';
          this.armFill.style.background = 'linear-gradient(90deg, #ffb020, #ffd700)';
        }
      }

      // Upgrade #24: Damage / Parry Flash + Low-HP Heartbeat Vignette
      if (this.vigT > 0) this.vigT = Math.max(0, this.vigT - dt);
      const lowHp = play && typeof P !== 'undefined' && P.hp === 1;
      if (this.vigT > 0) {
        this.vigEl.style.background = 'radial-gradient(circle at 50% 50%, transparent 52%, ' + this.vigCol + ' 100%)';
        this.vigEl.style.opacity = Math.min(1, this.vigT * 2.5).toFixed(2);
      } else if (lowHp) {
        const beat = 0.22 + 0.18 * Math.abs(Math.sin(performance.now() * 0.0045));
        this.vigEl.style.background = 'radial-gradient(circle at 50% 50%, transparent 56%, rgba(255,8,68,.52) 100%)';
        this.vigEl.style.opacity = beat.toFixed(2);
      } else {
        this.vigEl.style.opacity = '0';
      }
    }
  };

  /* ========================================================================
     HOOK WIRING — Clean v101.0 Integration into Core + R3.render
     ======================================================================== */
  // 1. Replace sluggish PCMaster90.stepWASD with unthrottled LivingHero101.stepLocomotion
  if (typeof PCMaster90 !== 'undefined') {
    const sw98 = PCMaster90.stepWASD.bind(PCMaster90); // (v103: a replay recorded in 98 keeps 98's walk)
    PCMaster90.stepWASD = function (dt) {
      if (!simV(103)) return sw98(dt);
      LivingHero101.stepLocomotion(dt);
    };
  }

  // 2. Hook Human.anim for LivingHero101 (alive movement, leaning, aim-tracking, 4-hit combo, ghosts)
  if (typeof Human !== 'undefined' && Human.anim) {
    const ha101 = Human.anim.bind(Human);
    Human.anim = function (g, o, rd, t) {
      ha101(g, o, rd, t);
      try {
        if (o && typeof P !== 'undefined' && Math.abs((o.x || 0) - P.x) < 3 && Math.abs((o.y || 0) - P.y) < 3) {
          LivingHero101.applyToHero(g, o, rd, t);
        }
      } catch (e) {}
    };
  }

  // 3. Hook slash(a) for 4-hit combo, 3D Flying Crescent Wave, Camera Punch & Subtle Lock-On Magnetism!
  if (typeof slash === 'function') {
    const sl101 = slash;
    slash = function (a) {
      let ang = a;
      // Subtle smart lock-on magnetism (within 22°) when clicking near a locked enemy
      if (LockOn101.target && typeof P !== 'undefined' && !REPLAY.on && REC.depth === 0) { // (v103: only the player's own input; the bent angle is what gets recorded)
        const ta = Math.atan2(LockOn101.target.y - P.y, LockOn101.target.x - P.x);
        if (Math.abs(angWrap(ta - ang)) < 0.38) ang = ta;
      }
      const r = sl101.call(this, ang);
      try {
        LivingHero101.onSlash(ang);
        ActionCam101.onSlash();
        if (typeof P !== 'undefined') LockOn101.spawnSlashWave(P.x, P.y, ang);
      } catch (e) {}
      return r;
    };
  }

  // 4. Hook W3D.camera for ActionCam101 (100% pixel-aligned 50° Action 3D Camera!)
  if (typeof W3D !== 'undefined' && W3D.camera) {
    const cam101 = W3D.camera.bind(W3D);
    W3D.camera = function () {
      const r = cam101();
      try { ActionCam101.apply(); } catch (e) {}
      return r;
    };
  }

  // 5. Hook R3.render, R3.animEnemy & R3.animPet for WorldDesign101, LockOn101, Ghosts, Enemy Lean & Pet Banking!
  if (typeof R3 !== 'undefined') {
    if (R3.render) {
      const rn101 = R3.render.bind(R3);
      R3.render = function (rd) {
        const r = rn101(rd);
        try {
          const now = performance.now() * 0.001;
          LivingHero101.tickGhosts(rd);
          WorldDesign101.tick(rd, now);
          LockOn101.tick(rd, now);
        } catch (e) {}
        return r;
      };
    }
    // Upgrade #19: Enemy Attack Lunge Lean
    if (R3.animEnemy) {
      const ae101 = R3.animEnemy.bind(R3);
      R3.animEnemy = function (eg, e, t) {
        const r = ae101(eg, e, t);
        try {
          if (eg && e && (e.wind > 0 || (e.atkT > 0 && e.atkT < 0.4))) {
            eg.rotation.x = 0.28;
          }
        } catch (err) {}
        return r;
      };
    }
    // Upgrade #22: Alive Pet Banking & Swoop Animation
    if (R3.animPet) {
      const ap101 = R3.animPet.bind(R3);
      R3.animPet = function (pg, t, mv) {
        const r = ap101(pg, t, mv);
        try {
          if (pg) {
            pg.rotation.x = mv ? 0.24 : Math.sin(t * 3.5) * 0.08;
            pg.rotation.y = Math.sin(t * 4.2) * (mv ? 0.22 : 0.07);
          }
        } catch (err) {}
        return r;
      };
    }
  }

  // 6. Hook hurt(), hitEnemy(), killEnemy(), Director.begin() & HUD.draw()
  if (typeof hurt === 'function') {
    const hu101 = hurt;
    hurt = function () {
      const r = hu101.apply(this, arguments);
      if (r) BossHud101.flashVig('rgba(255,8,68,.62)', 0.42);
      return r;
    };
  }
  if (typeof hitEnemy === 'function') {
    const he101 = hitEnemy;
    hitEnemy = function (e) {
      const r = he101.apply(this, arguments);
      try {
        if (e && typeof G !== 'undefined' && G.lastCrit) {
          LockOn101.spawnShock(e.x, e.y, '#ffd700', 68);
        }
        if (typeof P !== 'undefined' && P.pw > 0) {
          BossHud101.flashVig('rgba(0,242,254,.48)', 0.26);
        }
      } catch (err) {}
      return r;
    };
  }
  if (typeof killEnemy === 'function') {
    const ke101 = killEnemy;
    killEnemy = function (e) {
      const r = ke101.apply(this, arguments);
      try {
        if (e) LockOn101.spawnShock(e.x, e.y, e.elite ? '#ffd700' : '#ff4fd8', e.elite ? 95 : 58);
      } catch (err) {}
      return r;
    };
  }
  if (typeof Director !== 'undefined' && Director.begin) {
    const db101 = Director.begin.bind(Director);
    Director.begin = function () {
      LivingHero101.reset();
      LockOn101.seenEn.clear();
      return db101.apply(this, arguments);
    };
  }
  if (typeof HUD !== 'undefined' && HUD.draw) {
    const hd101 = HUD.draw.bind(HUD);
    HUD.draw = function (rd) {
      try { BossHud101.tick(rd); } catch (e) {}
      return hd101(rd);
    };
  }
})();


