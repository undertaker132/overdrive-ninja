/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 97.0 (7-TOPIC AAA MASTER POLISH)
   Loaded cleanly from js/v97-polish.js

   Topic #1: CombatFeel97  — Perfect Parry reward, Dojo ms telemetry, Hitstop
   Topic #2: RosterPerks97 — WeaponForge95 cleanup/dispose, 31-body Archetypes, Pet Mastery
   Topic #3: EnemyBossAI97 — Real 1.6x Armor Break DMG, 1.4s Stagger, 0.65s Phase Grace, Attack Tokens
   Topic #4: WorldCam97    — Roof-bound TrainProps, Real R3 Tunnel/Storm Lighting, Pixel-aligned Finisher Cam
   Topic #5: StoryMeta97   — Safe Dual-Ending Pause, Title Ending Badge, Dialogue Skip, Daily Supply & Boss First-Clear
   Topic #6: AudioMix97    — Full 10-Track OST, Tab-Hidden Auto-Pause, ObjectURL Revoke, Voice Auto-Ducking
   Topic #7: TechUX97      — Responsive Title Dock (zero overlap), 3D Memory/GC Hygiene, Quick Controls [H]
   ========================================================================== */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "v97.0 — 7-TOPIC AAA MASTER POLISH": "v97.0 — ליטוש AAA מקיף לכל 7 תחומי המשחק",
      "Full 7-domain overhaul: Archetype Passives for all 70+ Heroes (Titan, Phantom, Astral, Sword Saint), Pet Level Mastery across all 17 Pets, real 1.6x Boss Armor Break DMG + Stagger, roof-aligned Destructible Props & Tunnel/Storm lighting, Daily Supply Streaks, Dialogue Quick-Skip, 10-track OST Auto-Pause & Voice Ducking, responsive Title Dock and Quick Controls [H].": "שדרוג וליטוש מלא ב־7 תחומים: יכולות ארכיטיפ פסיביות לכל 70+ הדמויות (טיטאן, פנטום, אסטרל, קדוש החרב), סינרגיית רמות ל־17 החיות, נזק 1.6x אמיתי ו־Stagger בשבירת שריון לבוסים, יישור אובייקטים הריסים ותאורת מנהרה/סופה, אספקה יומית עם רצף, דילוג מהיר בדיאלוגים, 10 משבצות פסקול עם עצירה ביציאה מהטאב ו־Voice Ducking, סרגל פתיחה רספונסיבי ומדריך מקשים [H].",
      "v96.0 — AIR JUGGLE, DESTRUCTIBLE TRAIN & CHIPS": "v96.0 — קומבו אווירי, סביבה הריסה וצ׳יפים לנשק",
      "Launch enemies into 3D Air Juggle combos and slam them with Helm Breaker [F], slash exploding Plasma Barrels, Tesla Pylons & Neon Signs on the train roof, survive Dynamic Track Events (Dark Tunnel, Lightning Storm, Ambush), socket Boss-Drop Weapon Chips, track Live DPS & Parry ms in the Dojo, race 3D Ghosts, and lock 60 FPS with Instant Restart [R].": "שגר אויבים לקומבו אווירי ב־3D והנחת אותם ב־Helm Breaker [F], חתוך חביות פלזמה, עמודי טסלה ושלטי ניאון על הגג, שרוד אירועי מסילה דינמיים (מנהרה חשוכה, סופת ברקים ומארב), שבץ צ׳יפים טקטיים מבוסים, עקוב אחרי Live DPS ותזמון פארי בדוג׳ו, התחרה ברוחות רפאים 3D ותיהנה מייצוב 60 FPS ו־Instant Restart [R].",
      "v95.0 — STUDIO VOCAL OST, BOSS ENRAGE & DUAL ENDING": "v95.0 — פסקול אולפן עם שירה, זעם בוסים וסוף כפול",
      "Real Studio Soundtrack Engine (StudioAudio95) with vocal tracks, crossfading & in-game MP3 picker, bespoke 3D Hero Gear & Living Auras for 70+ skins, 26 bespoke 3D weapons, 17 bespoke 3D pets, Boss Phase 2/3 3D Enrage Auras, mid-fight Boss Banter, and a choice-based Dual Ending (Liberator vs. Cyber Sovereign).": "מנוע פסקול אולפן אמיתי (StudioAudio95) עם שירה, Crossfade וטעינת MP3 ישירה במשחק, ציוד והילות 3D ל־70+ דמויות, עיצוב אישי ל־26 נשקים ו־17 חיות, הילות זעם 3D לבוסים בשלב 2/3, משפטי קרב בזמן אמת וסוף כפול לבחירתך (משחרר ניאו־אדו או שליט הרשת).",
      "v94.0 — CINEMATIC 3D CRATE OVERHAUL": "v94.0 — פתיחת תיבות קולנועית ב־3D",
      "Interactive 3D Crate Stage with shatterable seals, rarity-specific light beams, camera orbits and dramatic unveil animations.": "במת תיבות תלת־ממדית אינטראקטיבית עם חותמות נשברות, קרני אור לפי נדירות, תנועות מצלמה ואנימציית חשיפה דרמטית.",
      "v92.0–v93.0 — SYNERGIES, HEAT & CLOUD PROFILE": "v92.0–v93.0 — סינרגיות, חוזי חום ופרופיל ענן",
      "Hades-style Roguelike Set Synergies, Heat Contracts for high-stakes runs, and Social Login / Cloud Profile sync.": "סינרגיות סטים בסגנון Roguelike, חוזי חום לריצות אתגר, והתחברות/שמירת פרופיל בענן.",
      "v89.0–v91.0 — ANIME TOON 3D, BLADE CLASH & PC EDITION": "v89.0–v91.0 — אנימה 3D, התנגשות להבים וגרסת PC",
      "2D-to-3D Anime Toon shading with ink outlines, dramatic mid-boss Blade Clashes, 16-bone Sakuga combat choreography, and full PC WASD + mouse controls.": "הצללת אנימה 3D עם קווי מתאר שחורים, התנגשויות להבים (Blade Clash) מול בוסים, כוריאוגרפיית קרב Sakuga ושליטת PC מלאה עם WASD ועכבר."
    });
  } catch (e) {}

  const V96 = window.__V96 || {};
  const S96 = V96.S96 || {
    on(k, d) { try { const s = Store && Store.data && Store.data.settings; return (!s || s[k] == null) ? (d == null ? true : !!d) : !!s[k]; } catch (e) { return true; } },
    isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
    L(s) { return typeof lt === 'function' ? lt(s) : s; }
  };

  /* ---------------- TOPIC #1: CombatFeel97 ---------------- */
  const CombatFeel97 = {
    onHit() {
      if (typeof P !== 'undefined' && P.pw > 0) {
        const ms = Math.max(8, Math.round((P.pwMax - P.pw) * 1000));
        if (V96.DojoLab96) V96.DojoLab96.recordParry(ms);
        P.ch = Math.min(P.maxCh, P.ch + 0.5);
        P.inv = Math.max(P.inv || 0, 0.22);
      }
    }
  };

  /* ---------------- TOPIC #2: RosterPerks97 ---------------- */
  const RosterPerks97 = {
    ARCH: {
      heavy:  { bodies: ['oni','exo','mecha','knight','viking','yeti','shogun','ashura','dragon'],
                name: 'TITAN FRAME', he: 'שלדת טיטאן', col: '#ff6a00',
                desc: '+1 Max HP · +10% DMG', heDesc: '+1 חיים מקסימליים · +10% נזק' },
      agile:  { bodies: ['ninja','shinobi2','neko','kitsune','wolf','netrunner','idol','rider'],
                name: 'PHANTOM EDGE', he: 'להב פנטום', col: '#00f2fe',
                desc: '+12% Crit · -12% Dash CD', heDesc: '+12% קריט · -12% קולדאון דאש' },
      arcane: { bodies: ['seraph','lich','sovereign','yurei','raijin','tengu','witch'],
                name: 'ASTRAL CORE', he: 'ליבה אסטרלית', col: '#c45bff',
                desc: '+25% Overdrive · +18% Magnet', heDesc: '+25% טעינת אוברדרייב · +18% מגנט' },
      master: { bodies: ['ronin','chromesam','skull','blaze','pixel','goo','pumpkin'],
                name: 'SWORD SAINT', he: 'קדוש החרב', col: '#ffd700',
                desc: '+15% DMG · +30ms Parry', heDesc: '+15% נזק · +30ms חלון פארי' }
    },
    getArch(body) {
      const b = body || 'ninja';
      for (const k of Object.keys(this.ARCH)) if (this.ARCH[k].bodies.includes(b)) return { key: k, ...this.ARCH[k] };
      return { key: 'agile', ...this.ARCH.agile };
    },
    applyToPlayer() {
      if (typeof P === 'undefined' || !P.skin) return;
      const arch = this.getArch(P.skin.body);
      P._arch97 = arch;
      if (arch.key === 'heavy') { P.maxHp += 1; P.dmgMul = +(P.dmgMul * 1.10).toFixed(3); }
      else if (arch.key === 'agile') { P.critAdd = +(P.critAdd + 0.12).toFixed(3); P.rc = Math.max(0.24, +(P.rc * 0.88).toFixed(3)); }
      else if (arch.key === 'arcane') { P.odMul = +(P.odMul * 1.25).toFixed(3); P.magR = Math.round(P.magR * 1.18); }
      else if (arch.key === 'master') { P.dmgMul = +(P.dmgMul * 1.15).toFixed(3); P.pwMax = +(P.pwMax + 0.03).toFixed(3); }
      if (typeof G !== 'undefined' && G.pet && G.pet !== 'none') {
        const lv = Math.max(1, G.petLv | 0);
        P.odMul = +(P.odMul * (1 + 0.04 * (lv - 1))).toFixed(3);
        P.magR += 12 * lv;
      }
      if (V96.WeaponChips96 && V96.WeaponChips96.has('aegis')) P.pwMax = +(P.pwMax * 1.35).toFixed(3);
    },
    patchWeaponForgeCleanup() {
      if (typeof WeaponForge95 === 'undefined' || !WeaponForge95.decorate || WeaponForge95._clean97) return;
      WeaponForge95._clean97 = true;
      const origDec = WeaponForge95.decorate.bind(WeaponForge95);
      const purge = (grp) => {
        if (!grp || !grp.children) return;
        for (const c of [...grp.children]) {
          if (c && c.userData && c.userData.wdec95) {
            c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
            grp.remove(c);
          }
        }
      };
      WeaponForge95.decorate = function (g, id) {
        if (g) { purge(g.blade); purge(g.blade2); }
        const r = origDec(g, id);
        if (g && g.blade && g.blade.children.length) {
          const last = g.blade.children[g.blade.children.length - 1];
          if (last && last.isGroup) last.userData.wdec95 = 1;
        }
        if (g && g.blade2 && g.blade2.children.length) {
          const last2 = g.blade2.children[g.blade2.children.length - 1];
          if (last2 && last2.isGroup) last2.userData.wdec95 = 1;
        }
        return r;
      };
    },
    badgeEl: null,
    tickUI() {
      if (!this.badgeEl) {
        const d = document.createElement('div');
        d.id = 'arch97-badge';
        d.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:41;pointer-events:none;display:none;padding:5px 11px;border-radius:999px;background:rgba(6,10,24,.82);border:1px solid rgba(0,242,254,.45);font-family:Orbitron,Rajdhani,sans-serif;font-size:10px;font-weight:800;';
        document.body.appendChild(d);
        this.badgeEl = d;
      }
      const show = typeof G !== 'undefined' && G.state === 'PLAY' && !G.photo && typeof P !== 'undefined' && !!P._arch97;
      this.badgeEl.style.display = show ? 'block' : 'none';
      if (show) {
        const a = P._arch97, he = S96.isHe();
        this.badgeEl.style.borderColor = a.col;
        this.badgeEl.style.color = a.col;
        this.badgeEl.textContent = '★ ' + (he ? a.he + ' · ' + a.heDesc : a.name + ' · ' + a.desc);
      }
    }
  };

  /* ---------------- TOPIC #3: EnemyBossAI97 ---------------- */
  const EnemyBossAI97 = {
    lastBossHp: null, lastBossId: '', lastPhaseSeen: 1,
    tick() {
      if (typeof G === 'undefined' || G.state !== 'PLAY') return;
      if (typeof Boss !== 'undefined' && Boss.cur && !(Boss.cur.dying > 0)) {
        const b = Boss.cur, key = 'boss' + b.id + (b.lvl || '');
        if (key !== this.lastBossId) {
          this.lastBossId = key; this.lastBossHp = b.hp; this.lastPhaseSeen = b.ph || 1;
        } else {
          if (V96.ArmorBreak96 && V96.ArmorBreak96.breakTimer > 0 && V96.ArmorBreak96.brokenFor === key) {
            const dealt = this.lastBossHp - b.hp;
            if (dealt > 1 && dealt < b.mhp * 0.45) {
              b.hp = Math.max(1, b.hp - Math.round(dealt * 0.6));
              if (typeof FX !== 'undefined') FX.spark(b.x, b.y, '#ffd700', 6);
            }
          }
          const hpFrac = b.mhp > 0 ? b.hp / b.mhp : 1;
          const ph = Math.max(b.ph || 1, hpFrac <= 0.32 ? 3 : hpFrac <= 0.62 ? 2 : 1);
          if (ph > this.lastPhaseSeen) {
            this.lastPhaseSeen = ph;
            if (typeof P !== 'undefined') P.inv = Math.max(P.inv || 0, 0.65);
          }
          if (V96.ArmorBreak96 && V96.ArmorBreak96.breakTimer > 9.85 && !b._armStag97) {
            b._armStag97 = 1; b.stag = Math.max(b.stag || 0, 1.4);
          }
          this.lastBossHp = b.hp;
        }
      } else { this.lastBossId = ''; this.lastBossHp = null; }

      if (typeof EN !== 'undefined') {
        let activeAttackers = 0;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e || !e.alive) continue;
          const winding = (e.wind > 0) || (e.atkT > 0 && e.atkT < 0.45) || (e.aimT > 0);
          if (winding) {
            activeAttackers++;
            if (activeAttackers > 2 && e.wind > 0) e.wind = Math.min(e.wind, 0.35);
            else if (typeof FX !== 'undefined' && Math.random() < 0.22) FX.ring(e.x, e.y, (e.r || 18) * 1.9, '#ff2b5e', 2.5);
          }
        }
      }
    }
  };

  /* ---------------- TOPIC #4: WorldCam97 ---------------- */
  const WorldCam97 = {
    tunnelMix: 0, stormFlash: 0,
    applyFixes() {
      if (V96.TrainProps96) {
        V96.TrainProps96.spawnOne = function () {
          if (typeof P === 'undefined' || typeof V === 'undefined' || typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
          const types = ['barrel', 'tesla', 'neon'], kind = types[Math.floor(Math.random() * types.length)];
          const minX = (V.L || 40) + 32, maxX = (V.R || 380) - 32, minY = 120, maxY = Math.max(260, (V.VH || 760) - 130);
          let x = (minX + maxX) * 0.5, y = (minY + maxY) * 0.5;
          for (let tries = 0; tries < 8; tries++) {
            const tx = minX + Math.random() * Math.max(20, maxX - minX), ty = minY + Math.random() * Math.max(40, maxY - minY);
            if (Math.hypot(tx - P.x, ty - P.y) > 95) { x = tx; y = ty; break; }
          }
          const T = THREE, grp = new T.Group(); grp.position.set(x, y, 0);
          const ringCol = kind === 'barrel' ? 0xff6a00 : kind === 'tesla' ? 0x00f2fe : 0xff4fd8;
          const gRing = new T.Mesh(new T.TorusGeometry(19, 1.4, 6, 24), new T.MeshBasicMaterial({ color: ringCol, transparent: true, opacity: 0.65 }));
          gRing.position.z = 2; grp.add(gRing); grp._ring = gRing;
          if (kind === 'barrel') {
            const body = new T.Mesh(new T.CylinderGeometry(11, 11, 24, 12).rotateX(Math.PI / 2), new T.MeshStandardMaterial({ color: 0xff3b2f, emissive: 0xff4500, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.3 }));
            body.position.z = 12; grp.add(body);
            const band = new T.Mesh(new T.TorusGeometry(11.4, 1.4, 6, 16), new T.MeshBasicMaterial({ color: 0xffd700 })); band.position.z = 13; grp.add(band);
          } else if (kind === 'tesla') {
            const pole = new T.Mesh(new T.CylinderGeometry(4, 6, 36, 8).rotateX(Math.PI / 2), new T.MeshStandardMaterial({ color: 0x1a2238, metalness: 0.8, roughness: 0.25 })); pole.position.z = 18; grp.add(pole);
            const orb = new T.Mesh(new T.OctahedronGeometry(8.5, 0), new T.MeshBasicMaterial({ color: 0x00f2fe })); orb.position.z = 38; grp.add(orb); grp._orb = orb;
          } else {
            const sign = new T.Mesh(new T.BoxGeometry(4, 34, 28), new T.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.86 })); sign.position.z = 18; grp.add(sign);
            const frame = new T.Mesh(new T.BoxGeometry(5, 36, 30), new T.MeshStandardMaterial({ color: 0x101426, wireframe: true })); frame.position.z = 18; grp.add(frame);
          }
          R3.root.add(grp);
          this.props.push({ id: this.seq++, kind, x, y, r: 28, mesh: grp, alive: true });
        };
      }

      if (V96.TrackEvents96) {
        V96.TrackEvents96.reset = function () {
          this.cd = 24; this.cur = null; this.left = 0; WorldCam97.tunnelMix = 0; WorldCam97.stormFlash = 0;
          if (typeof R3 !== 'undefined' && R3.ok) {
            if (R3.moon) R3.moon.intensity = 1.1; if (R3.hemi) R3.hemi.intensity = 0.45;
            if (R3.rim) R3.rim.intensity = 0.9; if (R3.heroL) R3.heroL.intensity = 300;
          }
        };
        V96.TrackEvents96.tick = function (rd) {
          if (!S96.on('events96', true) || typeof G === 'undefined' || G.state !== 'PLAY' || G.mode === 'dojo' || G.mode === 'puzzle') return;
          const dt = Math.min(0.05, rd || 0.016);
          if (!this.cur) {
            this.cd -= dt;
            if (this.cd <= 0) {
              const kinds = ['tunnel', 'storm', 'ambush'];
              this.cur = kinds[Math.floor(Math.random() * kinds.length)];
              this.left = this.cur === 'ambush' ? 6 : 11; this.strikeT = 1.5;
              if (this.cur === 'tunnel') this.showBanner(S96.L('DARK TUNNEL AHEAD'));
              else if (this.cur === 'storm') this.showBanner(S96.L('LIGHTNING STORM'));
              else { this.showBanner(S96.L('PARALLEL TRAIN AMBUSH')); if (typeof FX !== 'undefined' && typeof P !== 'undefined') FX.spark(P.x, P.y, '#ff0844', 18); }
            }
          } else {
            this.left -= dt;
            if (this.cur === 'storm') {
              this.strikeT -= dt;
              if (this.strikeT <= 0) {
                this.strikeT = 2.2;
                const minX = (typeof V !== 'undefined' ? V.L : 40) + 26, maxX = (typeof V !== 'undefined' ? V.R : 380) - 26;
                const minY = 100, maxY = Math.max(240, (typeof V !== 'undefined' ? V.VH : 760) - 110);
                const sx = minX + Math.random() * Math.max(20, maxX - minX), sy = minY + Math.random() * Math.max(40, maxY - minY);
                WorldCam97.stormFlash = 1.0;
                if (typeof FX !== 'undefined') { FX.ring(sx, sy, 92, '#9fd8ff', 6); FX.spark(sx, sy, '#ffffff', 16); }
                if (typeof Cinema3D89 !== 'undefined') Cinema3D89.flash(sx, sy, '#9fd8ff', 950, 0.3);
                if (typeof EN !== 'undefined') {
                  for (let i = 0; i < EN.n; i++) {
                    const e = EN.a[i];
                    if (e && e.alive && Math.hypot(e.x - sx, e.y - sy) <= 95) { e.hp -= 55; if (e.hp <= 0 && typeof killEnemy === 'function') killEnemy(e); }
                  }
                }
              }
            }
            if (this.left <= 0) { this.cur = null; this.cd = 34; }
          }
          const targetDark = this.cur === 'tunnel' ? 1 : 0;
          WorldCam97.tunnelMix += (targetDark - WorldCam97.tunnelMix) * Math.min(1, dt * 3.2);
          WorldCam97.stormFlash = Math.max(0, WorldCam97.stormFlash - dt * 4.5);
          if (typeof R3 !== 'undefined' && R3.ok) {
            const tm = WorldCam97.tunnelMix, sf = WorldCam97.stormFlash;
            if (R3.moon) R3.moon.intensity = 1.1 * (1 - 0.86 * tm) + sf * 2.2;
            if (R3.hemi) R3.hemi.intensity = 0.45 * (1 - 0.82 * tm) + sf * 0.9;
            if (R3.rim)  R3.rim.intensity  = 0.9 * (1 - 0.55 * tm) + sf * 0.7;
            if (R3.heroL) R3.heroL.intensity = 300 + tm * 480;
          }
        };
      }

      if (V96.FinisherCam96) {
        V96.FinisherCam96.trigger = function (x, y, dur) {
          if (!S96.on('fcam96', true)) return;
          this.x = x || (typeof P !== 'undefined' ? P.x : 210);
          this.y = y || (typeof P !== 'undefined' ? P.y : 400);
          this.t = dur || 0.75;
          if (typeof CAM !== 'undefined') {
            const px = typeof P !== 'undefined' ? P.x : this.x, py = typeof P !== 'undefined' ? P.y : this.y;
            CAM.fx = this.x * 0.65 + px * 0.35; CAM.fy = this.y * 0.65 + py * 0.35;
            CAM.zoom = Math.max(CAM.zoom || 0, 0.16);
          }
        };
        V96.FinisherCam96.tick = function (rd) {
          if (this.t <= 0) return;
          this.t = Math.max(0, this.t - Math.min(0.05, rd || 0.016));
          if (typeof R3 !== 'undefined' && R3.bloom) {
            const k = Math.sin(Math.min(1, this.t / 0.75) * Math.PI);
            R3.bloom.strength = 0.45 + 0.38 * k;
          }
        };
      }
    }
  };

  /* ---------------- TOPIC #5: StoryMeta97 ---------------- */
  const StoryMeta97 = {
    titleBadge: null, skipBtn: null,
    applyFixes() {
      if (typeof StoryOverhaul95 !== 'undefined' && !StoryOverhaul95._safe97) {
        StoryOverhaul95._safe97 = true;
        const origOpen = StoryOverhaul95.openChoiceModal.bind(StoryOverhaul95);
        StoryOverhaul95.openChoiceModal = function (b) {
          const prev = typeof G !== 'undefined' ? G.state : 'PLAY';
          if (typeof G !== 'undefined' && G.state === 'PLAY') G.state = 'PAUSE';
          origOpen(b);
          const watch = setInterval(() => {
            if (!StoryOverhaul95.choiceOpen) {
              clearInterval(watch);
              if (typeof G !== 'undefined' && G.state === 'PAUSE' && prev === 'PLAY') G.state = 'PLAY';
            }
          }, 180);
        };
        const origStart = StoryOverhaul95.onStoryStart.bind(StoryOverhaul95);
        StoryOverhaul95.onStoryStart = function (mode) {
          this.syncCount = 0; this.twistShown = false; return origStart(mode);
        };
      }
      try {
        if (typeof Store !== 'undefined' && Store.data && Store.data.settings) {
          const today = new Date().toISOString().slice(0, 10), s = Store.data.settings;
          if (s.lastDaily97 !== today) {
            s.lastDaily97 = today; s.streak97 = (s.streak97 | 0) + 1;
            const bonusCr = 600 + Math.min(900, (s.streak97 - 1) * 150);
            Store.data.credits = (Store.data.credits || 0) + bonusCr;
            if (typeof Crates !== 'undefined' && Crates.give) Crates.give(1);
            Store.touch();
            setTimeout(() => {
              const he = S96.isHe();
              if (typeof toast === 'function') toast(he ? ('🎁 אספקה יומית (יום ' + s.streak97 + '): +' + bonusCr + ' CR + תיבת ניאון!') : ('🎁 DAILY SUPPLY (DAY ' + s.streak97 + '): +' + bonusCr + ' CR + 1 CRATE!'), '#ffd700');
            }, 1400);
          }
        }
      } catch (e) {}
    },
    onBossDefeatReward(b) {
      if (!b || typeof Store === 'undefined' || !Store.data) return;
      try {
        const s = Store.data.settings || (Store.data.settings = {});
        s.firstClear97 = s.firstClear97 || {};
        if (!s.firstClear97[b.id]) {
          s.firstClear97[b.id] = 1; Store.data.credits = (Store.data.credits || 0) + 1000;
          if (typeof Crates !== 'undefined' && Crates.give) Crates.give(1);
          Store.touch();
          if (typeof FX !== 'undefined') FX.call(S96.isHe() ? '🏆 ניצחון ראשון! +1,000 CR + תיבה' : '🏆 FIRST CLEAR! +1,000 CR + 1 CRATE', '#ffd700', 3, 22);
        }
        const heatCount = (typeof G !== 'undefined' && G.ctr) ? Object.values(G.ctr).filter(Boolean).length : 0;
        if (heatCount > 0) {
          const hb = heatCount * 350; Store.data.credits = (Store.data.credits || 0) + hb; Store.touch();
          if (typeof FX !== 'undefined') FX.text(b.x, b.y - 45, '+' + hb + ' HEAT CR', '#ff6a00', 15);
        }
      } catch (e) {}
    },
    tickUI() {
      if (!this.titleBadge) {
        const d = document.createElement('div'); d.id = 'ending-badge97';
        d.style.cssText = 'position:fixed;top:52px;left:50%;transform:translateX(-50%);z-index:43;pointer-events:none;display:none;padding:4px 14px;border-radius:999px;background:rgba(8,12,28,.86);border:1.5px solid #ffd700;font-family:Orbitron,Rajdhani,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.2px;color:#ffd700;';
        document.body.appendChild(d); this.titleBadge = d;
      }
      const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && typeof G !== 'undefined' && G.state !== 'PLAY';
      const titleVal = (typeof Store !== 'undefined' && Store.data && Store.data.settings && Store.data.settings.endingTitle95) || '';
      this.titleBadge.style.display = (onTitle && titleVal) ? 'block' : 'none';
      if (onTitle && titleVal) {
        const isLib = titleVal.includes('LIBERATOR');
        this.titleBadge.style.borderColor = isLib ? '#00f2fe' : '#ff0844';
        this.titleBadge.style.color = isLib ? '#00f2fe' : '#ff4fd8';
        this.titleBadge.textContent = (isLib ? '✦ ' : '👑 ') + (S96.isHe() ? (isLib ? 'משחרר ניאו־אדו' : 'שליט הרשת העליון') : titleVal);
      }
      if (!this.skipBtn) {
        const b = document.createElement('button'); b.id = 'dlg-skip97';
        b.style.cssText = 'position:fixed;top:16px;right:16px;z-index:70;display:none;padding:6px 14px;border-radius:999px;cursor:pointer;background:rgba(10,14,30,.9);border:1.5px solid #00f2fe;color:#00f2fe;font-family:Orbitron,Rajdhani,sans-serif;font-size:11px;font-weight:900;';
        b.onclick = () => { try { if (typeof Dlg !== 'undefined' && Dlg.active) { Dlg.i = (Dlg.lines ? Dlg.lines.length : 1) - 1; Dlg.shown = 9999; if (Dlg.next) Dlg.next(); } } catch (e) {} };
        document.body.appendChild(b); this.skipBtn = b;
      }
      const inDlg = typeof G !== 'undefined' && G.state === 'DIALOG' && typeof Dlg !== 'undefined' && Dlg.active;
      this.skipBtn.style.display = inDlg ? 'block' : 'none';
      if (inDlg) this.skipBtn.textContent = S96.isHe() ? 'דלג ⏭' : 'SKIP ⏭';
    }
  };

  /* ---------------- TOPIC #6: AudioMix97 ---------------- */
  const AudioMix97 = {
    voiceDuckT: 0, objUrls: {},
    applyFixes() {
      if (typeof StudioAudio95 === 'undefined' || StudioAudio95._mix97) return;
      StudioAudio95._mix97 = true;
      const extraSlots = [
        { id: 'combat2', file: 'audio/combat2.mp3', title: 'Track #6 · Undercity Run (Dark Cyber)',     he: 'טראק #6 · העיר התחתית (סייבר אפל)' },
        { id: 'rival',   file: 'audio/rival.mp3',   title: 'Track #7 · Rival & Blade Clash',           he: 'טראק #7 · יריב הצללים ו־Blade Clash' },
        { id: 'storm',   file: 'audio/storm.mp3',   title: 'Track #8 · Storm Front & Raijin',          he: 'טראק #8 · שלב הסערה ו־Raijin' },
        { id: 'crates',  file: 'audio/crates.mp3',  title: 'Track #9 · Crate Vault & Shop',            he: 'טראק #9 · כספת התיבות והחנות' },
        { id: 'ending',  file: 'audio/ending.mp3',  title: 'Track #10 · Story Ending & Credits',       he: 'טראק #10 · סיום הסיפור וקרדיטים' }
      ];
      for (const ex of extraSlots) {
        if (!StudioAudio95.SLOTS.some(s => s.id === ex.id)) {
          StudioAudio95.SLOTS.push(ex); StudioAudio95.attachTrack(ex.id, ex.file, false);
        }
      }
      const origAttach = StudioAudio95.attachTrack.bind(StudioAudio95);
      StudioAudio95.attachTrack = function (id, src, fromUser) {
        if (AudioMix97.objUrls[id] && AudioMix97.objUrls[id] !== src) {
          try { URL.revokeObjectURL(AudioMix97.objUrls[id]); } catch (e) {}
          delete AudioMix97.objUrls[id];
        }
        if (fromUser && String(src).startsWith('blob:')) AudioMix97.objUrls[id] = src;
        return origAttach(id, src, fromUser);
      };
      const origPick = StudioAudio95.pickDesiredSlot.bind(StudioAudio95);
      StudioAudio95.pickDesiredSlot = function () {
        if (document.hidden) return '';
        const has = id => !!this.loaded[id];
        if (typeof StoryOverhaul95 !== 'undefined' && StoryOverhaul95.choiceOpen && has('ending')) return 'ending';
        if (document.getElementById('crate94-ov') && has('crates')) return 'crates';
        if (typeof G !== 'undefined' && G.state === 'PLAY') {
          if (typeof BladeClash91 !== 'undefined' && BladeClash91.active && has('rival')) return 'rival';
          if (V96.TrackEvents96 && V96.TrackEvents96.cur === 'storm' && has('storm')) return 'storm';
        }
        return origPick();
      };
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          for (const sl of StudioAudio95.SLOTS) { const a = StudioAudio95.players[sl.id]; if (a && !a.paused) { try { a.pause(); } catch (e) {} } }
        }
      });
      if (V96.VoiceBarks96 && V96.VoiceBarks96.say && !V96.VoiceBarks96._duck97) {
        V96.VoiceBarks96._duck97 = true;
        const origSay = V96.VoiceBarks96.say.bind(V96.VoiceBarks96);
        V96.VoiceBarks96.say = function (text, pitch, rate) { AudioMix97.voiceDuckT = 1.15; return origSay(text, pitch, rate); };
      }
    },
    tick(rd) {
      if (this.voiceDuckT > 0) {
        this.voiceDuckT = Math.max(0, this.voiceDuckT - Math.min(0.05, rd || 0.016));
        if (typeof StudioAudio95 !== 'undefined' && StudioAudio95.curId) {
          const a = StudioAudio95.players[StudioAudio95.curId];
          if (a && !a.paused && a.volume > 0.24) a.volume = 0.24;
        }
      }
    }
  };

  /* ---------------- TOPIC #7: TechUX97 ---------------- */
  const TechUX97 = {
    dock: null, helpBtn: null, helpModal: null, gcT: 0,
    ensureUI() {
      if (!this.dock) {
        const d = document.createElement('div');
        d.id = 'dock97';
        d.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:45;display:none;flex-wrap:wrap;justify-content:center;gap:6px;max-width:94vw;pointer-events:auto;';
        document.body.appendChild(d);
        this.dock = d;
      }
      if (!this.helpBtn) {
        const b = document.createElement('button');
        b.id = 'help97-btn';
        b.style.cssText = 'padding:6px 11px;border-radius:999px;cursor:pointer;background:rgba(8,12,26,.86);border:1.5px solid #00f2fe;color:#00f2fe;font-family:Orbitron,Rajdhani,sans-serif;font-size:11px;font-weight:900;';
        b.onclick = () => this.openHelp();
        this.dock.appendChild(b);
        this.helpBtn = b;
      }
    },
    adoptTitleButtons() {
      this.ensureUI();
      // Move floating v95/v96 title pills cleanly into the responsive flex dock so they NEVER overlap on desktop or mobile
      for (const id of ['ost95-btn', 'chips96-btn']) {
        const el = document.getElementById(id);
        if (el && el.parentNode !== this.dock) {
          el.style.position = 'static';
          el.style.top = 'auto'; el.style.left = 'auto';
          this.dock.insertBefore(el, this.helpBtn);
        }
      }
    },
    openHelp() {
      if (!this.helpModal) {
        const m = document.createElement('div');
        m.className = 'modal92-bg';
        m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
        document.body.appendChild(m);
        this.helpModal = m;
      }
      const he = S96.isHe();
      this.helpModal.innerHTML =
        '<div class="modal92-box" style="max-width:520px;border-color:#00f2fe">' +
          '<div class="modal92-head"><h3>⌨ ' + (he ? 'מדריך מקשים ופיצ׳רים (v97)' : 'QUICK CONTROLS & FEATURES (v97)') + '</h3><button class="modal92-close" id="h97-x">✕</button></div>' +
          '<div style="font-size:13px;line-height:1.6">' +
            '<div><b>[F]</b> — ' + (he ? 'שיגור אויבים לאוויר (Air Juggle) / הנחתת Helm Breaker' : 'Rising Launcher (Air Juggle) / Helm Breaker Slam') + '</div>' +
            '<div><b>[R]</b> — ' + (he ? 'הפעלה מחדש מיידית (Instant Restart)' : 'Instant Restart current Stage or Arcade run') + '</div>' +
            '<div><b>[H]</b> — ' + (he ? 'פתיחת/סגירת מדריך מקשים זה' : 'Toggle this Quick Controls overlay') + '</div>' +
            '<div><b>💎 ' + (he ? 'צ׳יפים' : 'CHIPS') + '</b> — ' + (he ? 'שבץ עד 2 צ׳יפים טקטיים בנשק' : 'Socket up to 2 tactical Weapon Chips') + '</div>' +
            '<div><b>🎵 ' + (he ? 'פסקול' : 'SOUNDTRACK') + '</b> — ' + (he ? 'טען עד 10 טראקים אמיתיים (MP3/WAV)' : 'Load up to 10 Studio Vocal/OST tracks (MP3/WAV)') + '</div>' +
          '</div></div>';
      this.helpModal.querySelector('#h97-x').onclick = () => this.helpModal.classList.remove('on');
      this.helpModal.classList.add('on');
    },
    tick(rd) {
      this.adoptTitleButtons();
      const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && typeof G !== 'undefined' && G.state !== 'PLAY';
      this.dock.style.display = onTitle ? 'flex' : 'none';
      if (this.helpBtn) this.helpBtn.textContent = S96.isHe() ? '⌨ מקשים [H]' : '⌨ KEYS [H]';

      // Periodic 3D GC hygiene (cap flashes & dispose stale debris cleanly every 2s)
      this.gcT += Math.min(0.05, rd || 0.016);
      if (this.gcT >= 2.0) {
        this.gcT = 0;
        if (typeof R3 !== 'undefined' && R3.ok) {
          if (R3.flashes && R3.flashes.length > 8) R3.flashes.splice(0, R3.flashes.length - 8);
          if (R3.deb && R3.deb.length > 36) {
            while (R3.deb.length > 28) {
              const d = R3.deb.shift();
              if (d && d.m) {
                if (d.m.parent) d.m.parent.remove(d.m);
                if (d.m.geometry) d.m.geometry.dispose();
              }
            }
          }
        }
      }
    }
  };

  /* ---------------- BOOT & HOOK WIRING ---------------- */
  RosterPerks97.patchWeaponForgeCleanup();
  WorldCam97.applyFixes();
  StoryMeta97.applyFixes();
  AudioMix97.applyFixes();

  window.addEventListener('keydown', e => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.code === 'KeyH') {
      if (TechUX97.helpModal && TechUX97.helpModal.classList.contains('on')) TechUX97.helpModal.classList.remove('on');
      else TechUX97.openHelp();
    }
  });

  if (typeof applyLoadout === 'function') {
    const origAL = applyLoadout;
    applyLoadout = function () {
      const r = origAL.apply(this, arguments);
      try { RosterPerks97.applyToPlayer(); } catch (e) {}
      return r;
    };
  }

  if (typeof hitEnemy === 'function') {
    const origHE = hitEnemy;
    hitEnemy = function (e) {
      const r = origHE.apply(this, arguments);
      try { CombatFeel97.onHit(); } catch (err) {}
      return r;
    };
  }

  if (typeof Boss !== 'undefined' && Boss.kill) {
    const origBK = Boss.kill.bind(Boss);
    Boss.kill = function (b) {
      const r = origBK(b);
      try { StoryMeta97.onBossDefeatReward(b); } catch (err) {}
      return r;
    };
  }

  if (typeof HUD !== 'undefined' && HUD.draw) {
    const origHD = HUD.draw.bind(HUD);
    HUD.draw = function (rd) {
      try {
        RosterPerks97.tickUI();
        EnemyBossAI97.tick();
        StoryMeta97.tickUI();
        AudioMix97.tick(rd);
        TechUX97.tick(rd);
      } catch (err) {}
      return origHD(rd);
    };
  }
})();
