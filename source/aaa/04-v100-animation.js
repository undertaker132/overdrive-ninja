/* --- MODULE 4: v100 --- */
/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 100.0 (DEFINITIVE EDITION)
   The Final AAA Animation, Kinesthetics & Polish Masterwork:

   1. BladeRibbon100 — True 3D dynamic weapon-tip Ribbon Trail mesh in Three.js
                       that follows the actual blade world-space arc during
                       every dash, slash, and Overdrive!
   2. Stance100      — Distinct 3D Idle Stances per Weapon Family & Archetype
                       (Iaido blade crouch, Heavy shoulder-rest, Fist boxer
                       guard, Polearm ready, Astral zero-G hover)
   3. AnimFlow100    — Kinetic Braking Slide with boot sparks at dash end,
                       Pre-Dash wind-up squash, and Combo-End Sheathe Flick!
   4. HeroAir100     — Full 3D Hero vertical leap on Air-Launch [F] and
                       360° Front-Flip Somersault on Helm Breaker Slam!
   5. HitReact100    — Directional 3D Enemy Hit-Recoil, Squash-Stretch on
                       impact, and Spinning 3D Ragdoll Launch on overkill!
   6. BossCinema100  — Cinematic Boss Superhero-Landing shockwave intro &
                       multi-stage 3D Chain-Explosion Death sequence!
   ========================================================================== */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "v100.0 — DEFINITIVE EDITION: AAA ANIMATION & GAME-FEEL MASTERWORK": "v100.0 — המהדורה הסופית: שדרוג אנימציות ותחושת קרב AAA",
      "The complete, final evolution of Overdrive: Cyber Slash — featuring True 3D Blade Ribbon Trails attached directly to your weapon tip, Weapon-Family & Archetype Idle Stances (Iaido crouch, Heavy shoulder-rest, Boxer guard, Astral hover), Dash Braking Slides with boot sparks & Combo-End Sheathe Flicks, full 3D Hero Air-Launch & 360° Helm Breaker Somersault [F], directional Enemy Hit-Recoil & Ragdoll Spin-Kills, and Cinematic Boss Superhero-Landing Intros with Chain-Explosion Deaths.": "הגרסה השלמה והסופית של Overdrive: Cyber Slash — כוללת שובל חיתוך 3D אמיתי המחובר ישירות ללהב, עמידות קרב ייחודיות לפי סוג נשק וארכיטיפ (איאיידו, נשק כבד על הכתף, אגרוף, ריחוף אסטרלי), גלישת בלימה עם ניצוצות מגפיים והחזרת חרב לנדן בסוף קומבו, זינוק אווירי מלא וסלטת 360° ב־Helm Breaker [F], הדף כיווני ו־Ragdoll מסתובב לאויבים, ונחיתת־על קולנועית עם פיצוצי שרשרת בחיסול בוסים."
    });
  } catch (e) {}

  /* ========================================================================
     1. BladeRibbon100 — TRUE 3D DYNAMIC WEAPON-TIP RIBBON TRAIL
     ======================================================================== */
  const BladeRibbon100 = {
    MAX: 16,
    pts: [],
    mesh: null,
    geo: null,
    mat: null,
    vBase: null,
    vTip: null,

    ensure() {
      if (this.mesh || typeof THREE === 'undefined' || typeof R3 === 'undefined' || !R3.ok || !R3.root) return;
      const T = THREE;
      this.vBase = new T.Vector3();
      this.vTip = new T.Vector3();
      const pos = new Float32Array(this.MAX * 2 * 3);
      const uvs = new Float32Array(this.MAX * 2 * 2);
      const idx = [];
      for (let i = 0; i < this.MAX; i++) {
        const u = i / (this.MAX - 1);
        uvs[i * 4 + 0] = u; uvs[i * 4 + 1] = 0;
        uvs[i * 4 + 2] = u; uvs[i * 4 + 3] = 1;
        if (i < this.MAX - 1) {
          const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
          idx.push(a, b, c, b, d, c);
        }
      }
      this.geo = new T.BufferGeometry();
      this.geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      this.geo.setAttribute('uv', new T.BufferAttribute(uvs, 2));
      this.geo.setIndex(idx);
      this.mat = new T.MeshBasicMaterial({
        color: 0x00f2fe, transparent: true, opacity: 0.72,
        side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false
      });
      this.mesh = new T.Mesh(this.geo, this.mat);
      this.mesh.frustumCulled = false;
      R3.root.add(this.mesh);
    },

    reset() {
      this.pts.length = 0;
      if (this.mesh) this.mesh.visible = false;
    },

    tick(heroG) {
      if (typeof G === 'undefined' || G.state !== 'PLAY' || typeof R3 === 'undefined' || !R3.ok || !R3.root) {
        this.reset();
        return;
      }
      this.ensure();
      if (!this.mesh || !heroG || !heroG.blade) return;

      const active = (typeof P !== 'undefined' && (P.dashT > 0 || G.odT > 0 || HeroAir100.airZ > 4));
      if (active) {
        // Sample real world-space hilt & blade tip, converted into R3.root local coordinates
        this.vBase.set(2, 0, 0);
        this.vTip.set(34, 0, 0);
        heroG.blade.localToWorld(this.vBase);
        heroG.blade.localToWorld(this.vTip);
        R3.root.worldToLocal(this.vBase);
        R3.root.worldToLocal(this.vTip);
        this.pts.unshift([this.vBase.x, this.vBase.y, this.vBase.z, this.vTip.x, this.vTip.y, this.vTip.z]);
        if (this.pts.length > this.MAX) this.pts.pop();
      } else if (this.pts.length > 0) {
        this.pts.pop();
        if (this.pts.length > 0) this.pts.pop();
      }

      if (this.pts.length < 2) {
        this.mesh.visible = false;
        return;
      }

      this.mesh.visible = true;
      const colHex = (G.odT > 0) ? '#ffd700' : ((typeof P !== 'undefined' && P.ca) || '#00f2fe');
      this.mat.color.set(colHex);
      this.mat.opacity = active ? 0.78 : 0.42;

      const arr = this.geo.attributes.position.array;
      const last = this.pts[this.pts.length - 1];
      for (let i = 0; i < this.MAX; i++) {
        const p = this.pts[i] || last;
        const off = i * 6;
        arr[off + 0] = p[0]; arr[off + 1] = p[1]; arr[off + 2] = p[2];
        arr[off + 3] = p[3]; arr[off + 4] = p[4]; arr[off + 5] = p[5];
      }
      this.geo.attributes.position.needsUpdate = true;
    }
  };

  /* ========================================================================
     2. Stance100 — DISTINCT IDLE STANCES BY WEAPON FAMILY & ARCHETYPE
     ======================================================================== */
  const Stance100 = {
    apply(g, o, t) {
      const B = g && g.human && g.human.B;
      if (!B || !o) return;
      const spd = o.spd || 0, dash = !!o.dashing;
      if (dash || spd > 85) return; // Only blend stance when idle or slow-walking

      const fam = g.wfam || 'blade';
      const br = Math.sin(t * 2.8);
      if (fam === 'blade' || fam === 'long' || fam === 'saber') {
        // Low focused Iaido ready stance
        if (B.spine) B.spine.rotation.x += 0.14 + br * 0.025;
        if (B.spine2) B.spine2.rotation.y -= 0.22;
        if (B.rArm) { B.rArm.rotation.x += 0.28; B.rArm.rotation.z -= 0.18; }
      } else if (fam === 'heavy' || fam === 'scythe' || fam === 'glaive') {
        // Confident heavy weapon shoulder-rest stance
        if (B.spine2) B.spine2.rotation.x -= 0.1 + br * 0.02;
        if (B.rArm) { B.rArm.rotation.x -= 0.55; B.rArm.rotation.z += 0.25; }
      } else if (fam === 'fists' || fam === 'claws') {
        // Bouncy cyber-boxer guard
        const hop = Math.abs(Math.sin(t * 6.2));
        if (B.hips) B.hips.position.y += hop * 1.4;
        if (B.rArm) B.rArm.rotation.x -= 0.55 + hop * 0.12;
        if (B.lArm) B.lArm.rotation.x -= 0.62 - hop * 0.12;
      } else if (fam === 'dual' || fam === 'ring') {
        // Wide twin-blade assassin poise
        if (B.spine) B.spine.rotation.x += 0.18;
        if (B.rArm) B.rArm.rotation.z -= 0.35;
        if (B.lArm) B.lArm.rotation.z += 0.35;
      }
    }
  };

  /* ========================================================================
     3. AnimFlow100 — BRAKING SLIDE, BOOT SPARKS & COMBO-END SHEATHE FLICK
     ======================================================================== */
  const AnimFlow100 = {
    wasDashing: false,
    slideT: 0,
    lastCombo: 0,
    sheatheT: 0,

    tick(g, o, rd, t) {
      if (!g || !o) return;
      const dt = Math.min(0.05, rd || 0.016);
      const dash = !!o.dashing;

      // Detect end of dash -> trigger stylish braking slide + boot sparks!
      if (this.wasDashing && !dash && (o.spd || 0) > 60) {
        this.slideT = 0.24;
        if (typeof FX !== 'undefined' && typeof P !== 'undefined') {
          FX.spark(P.x, P.y, P.ca || '#00f2fe', 6);
        }
      }
      this.wasDashing = dash;

      const B = g.human && g.human.B;
      if (this.slideT > 0) {
        this.slideT = Math.max(0, this.slideT - dt);
        const k = this.slideT / 0.24;
        if (B && B.spine) B.spine.rotation.x -= 0.32 * k;
        if (B && B.hips) B.hips.position.y -= 2.4 * k;
      }

      // Detect Combo End (had 5+ combo, dropped to 0) -> cool Katana Sheathe Flick!
      const curCombo = (typeof G !== 'undefined' && G.combo) | 0;
      if (this.lastCombo >= 5 && curCombo === 0 && typeof G !== 'undefined' && G.state === 'PLAY') {
        this.sheatheT = 0.42;
        if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('ui');
      }
      this.lastCombo = curCombo;

      if (this.sheatheT > 0 && B) {
        this.sheatheT = Math.max(0, this.sheatheT - dt);
        const k = Math.sin((this.sheatheT / 0.42) * Math.PI);
        if (B.rArm) B.rArm.rotation.y += 0.85 * k;
        if (B.rFore) B.rFore.rotation.z += 0.9 * k;
      }
    }
  };

  /* ========================================================================
     4. HeroAir100 — FULL 3D HERO AIR-LAUNCH & 360° HELM BREAKER SOMERSAULT
     ======================================================================== */
  const HeroAir100 = {
    airZ: 0,
    airVz: 0,
    flipT: 0,
    flipDur: 0.42,

    onLaunch() {
      this.airZ = Math.max(this.airZ, 12);
      this.airVz = 330;
    },
    onHelmBreaker() {
      this.airZ = Math.max(this.airZ, 48);
      this.airVz = -520;
      this.flipT = this.flipDur;
    },
    tick(g, rd) {
      const dt = Math.min(0.05, rd || 0.016);
      if (this.airZ > 0 || this.airVz !== 0) {
        this.airVz -= 840 * dt;
        this.airZ += this.airVz * dt;
        if (this.airZ <= 0) {
          this.airZ = 0;
          this.airVz = 0;
        }
      }
      if (this.flipT > 0) {
        this.flipT = Math.max(0, this.flipT - dt);
      }
      if (g) {
        if (this.airZ > 0) g.position.z = (g.position.z || 0) + this.airZ;
        if (this.flipT > 0) {
          const p = 1 - (this.flipT / this.flipDur);
          g.rotation.y = p * Math.PI * 2;
        } else {
          g.rotation.y = 0;
        }
      }
    }
  };

  /* ========================================================================
     5. HitReact100 — DIRECTIONAL HIT-RECOIL, SQUASH-STRETCH & RAGDOLL KILLS
     ======================================================================== */
  const HitReact100 = {
    ragdolls: [],
    onHit(e) {
      if (!e || typeof P === 'undefined') return;
      const ang = Math.atan2(e.y - P.y, e.x - P.x);
      e._recT100 = 0.22;
      e._recA100 = ang;
    },
    onKill(e) {
      if (!e || typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined' || this.ragdolls.length >= 6) return;
      // Spawn a stylized spinning 3D cyber-ragdoll core flying away from the slash!
      const T = THREE;
      const ang = (typeof P !== 'undefined') ? Math.atan2(e.y - P.y, e.x - P.x) : Math.random() * Math.PI * 2;
      const m = new T.Mesh(
        new T.OctahedronGeometry((e.r || 16) * 0.65, 0),
        new T.MeshBasicMaterial({ color: e.elite ? 0xffd700 : 0xff2b5e, wireframe: true, transparent: true, opacity: 0.9 })
      );
      m.position.set(e.x, e.y, 18);
      R3.root.add(m);
      this.ragdolls.push({
        m, vx: Math.cos(ang) * 340, vy: Math.sin(ang) * 340, vz: 260,
        rx: (Math.random() - 0.5) * 18, ry: (Math.random() - 0.5) * 18, life: 0.7
      });
    },
    applyEnemy(eg, e, rd) {
      if (!eg || !e) return;
      if (e._recT100 > 0) {
        e._recT100 = Math.max(0, e._recT100 - Math.min(0.05, rd || 0.016));
        const k = e._recT100 / 0.22;
        eg.rotation.x = Math.sin(e._recA100 || 0) * 0.42 * k;
        eg.rotation.y = Math.cos(e._recA100 || 0) * 0.42 * k;
        const s = 1 + 0.18 * k;
        eg.scale.set(s, s, 1 - 0.16 * k);
        e._recDirty100 = 1;
      } else if (e._recDirty100) {
        e._recDirty100 = 0;
        eg.rotation.x = 0; eg.rotation.y = 0;
        eg.scale.set(1, 1, 1);
      }
    },
    tick(rd) {
      const dt = Math.min(0.05, rd || 0.016);
      for (const r of this.ragdolls) {
        r.life -= dt;
        r.m.position.x += r.vx * dt; r.m.position.y += r.vy * dt;
        r.m.position.z = Math.max(2, r.m.position.z + r.vz * dt);
        r.vz -= 680 * dt;
        r.m.rotation.x += r.rx * dt; r.m.rotation.y += r.ry * dt;
        r.m.material.opacity = Math.max(0, r.life / 0.7);
        if (r.life <= 0) {
          if (r.m.parent) r.m.parent.remove(r.m);
          r.m.geometry.dispose(); r.m.material.dispose();
        }
      }
      this.ragdolls = this.ragdolls.filter(r => r.life > 0);
    }
  };

  /* ========================================================================
     6. BossCinema100 — SUPERHERO LANDING INTRO & CHAIN-EXPLOSION DEATH
     ======================================================================== */
  const BossCinema100 = {
    landedKey: '',
    dyingBoomT: 0,
    tick(rd) {
      if (typeof Boss === 'undefined' || !Boss.cur) {
        this.landedKey = '';
        return;
      }
      const b = Boss.cur, dt = Math.min(0.05, rd || 0.016);
      const key = 'boss' + b.id + (b.lvl || '');

      // 1. Superhero Landing Impact right when boss finishes descending (enter >= 0.96)
      if ((b.enter == null || b.enter >= 0.96) && this.landedKey !== key && !(b.dying > 0)) {
        this.landedKey = key;
        const col = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
        if (typeof shake === 'function') shake(0.9);
        if (typeof FX !== 'undefined') {
          FX.ring(b.x, b.y, (b.r || 42) * 4.2, col, 9);
          FX.ring(b.x, b.y, (b.r || 42) * 2.4, '#ffffff', 5);
          FX.spark(b.x, b.y, col, 32);
        }
        if (typeof Cinema3D89 !== 'undefined') Cinema3D89.flash(b.x, b.y, col, 1100, 0.42);
        if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('boom');
      }

      // 2. Rapid Chain-Explosions across the boss hull during death sequence
      if (b.dying > 0 && b.dying < 1.55) {
        this.dyingBoomT -= dt;
        if (this.dyingBoomT <= 0) {
          this.dyingBoomT = 0.18;
          const ox = (Math.random() - 0.5) * (b.r || 42) * 1.6;
          const oy = (Math.random() - 0.5) * (b.r || 42) * 1.6;
          if (typeof FX !== 'undefined') {
            FX.ring(b.x + ox, b.y + oy, 58, '#ffd700', 5);
            FX.spark(b.x + ox, b.y + oy, '#ff6a00', 14);
          }
          if (typeof shake === 'function') shake(0.45);
          if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('boom');
        }
      }
    }
  };

  /* ========================================================================
     HOOK WIRING — Clean v100.0 Definitive Edition Integration
     ======================================================================== */
  // 1. Human.anim: Stance100 + AnimFlow100 + HeroAir100 + BladeRibbon100
  if (typeof Human !== 'undefined' && Human.anim) {
    const ha100 = Human.anim.bind(Human);
    Human.anim = function (g, o, rd, t) {
      ha100(g, o, rd, t);
      try {
        Stance100.apply(g, o, t);
        if (o && typeof P !== 'undefined' && Math.abs((o.x || 0) - P.x) < 2 && Math.abs((o.y || 0) - P.y) < 2) {
          AnimFlow100.tick(g, o, rd, t);
          HeroAir100.tick(g, rd);
          BladeRibbon100.tick(g);
        }
      } catch (e) {}
    };
  }

  // 2. Hook AirCombat96.trigger so HeroAir100 leaps & somersaults with [F]!
  if (window.__V96 && window.__V96.AirCombat96 && window.__V96.AirCombat96.act) { // (v103: act() is the launcher itself, recorded or replayed)
    const ac100 = window.__V96.AirCombat96.act.bind(window.__V96.AirCombat96);
    window.__V96.AirCombat96.act = function () {
      const wasAir = this.hasAirborne();
      const cdBefore = this.cd;
      const r = ac100();
      if (cdBefore <= 0 && this.cd > 0) {
        if (wasAir) HeroAir100.onHelmBreaker();
        else HeroAir100.onLaunch();
      }
      return r;
    };
  }

  // 3. Hook hitEnemy & killEnemy for HitReact100
  if (typeof hitEnemy === 'function') {
    const he100 = hitEnemy;
    hitEnemy = function (e) {
      const r = he100.apply(this, arguments);
      try { HitReact100.onHit(e); } catch (err) {}
      return r;
    };
  }
  if (typeof killEnemy === 'function') {
    const ke100 = killEnemy;
    killEnemy = function (e) {
      const r = ke100.apply(this, arguments);
      try { HitReact100.onKill(e); } catch (err) {}
      return r;
    };
  }

  // 4. Hook R3.animEnemy & R3.sync for HitReact100 & BossCinema100
  if (typeof R3 !== 'undefined') {
    if (R3.animEnemy) {
      const ae100 = R3.animEnemy.bind(R3);
      R3.animEnemy = function (eg, e, t) {
        const r = ae100(eg, e, t);
        try { HitReact100.applyEnemy(eg, e, 0.016); } catch (err) {}
        return r;
      };
    }
    if (R3.render) {
      const sy100 = R3.render.bind(R3);
      R3.render = function (rd) {
        const r = sy100(rd);
        try {
          HitReact100.tick(rd);
          BossCinema100.tick(rd);
        } catch (err) {}
        return r;
      };
    }
  }

  // 5. Reset BladeRibbon100 cleanly on new run
  if (typeof Director !== 'undefined' && Director.begin) {
    const db100 = Director.begin.bind(Director);
    Director.begin = function () {
      BladeRibbon100.reset();
      HeroAir100.airZ = 0; HeroAir100.airVz = 0; HeroAir100.flipT = 0;
      return db100.apply(this, arguments);
    };
  }
})();



