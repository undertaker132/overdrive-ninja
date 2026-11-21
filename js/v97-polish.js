/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 97.0 (7-TOPIC AAA MASTER POLISH)
   Loaded cleanly from js/v97-polish.js

   Topic #1: CombatFeel97  — Perfect Parry reward (on the real parry)
   Topic #2: RosterPerks97 — WeaponForge95 cleanup/dispose, 31-body Archetypes, Pet Mastery
   Topic #3: EnemyBossAI97 — 0.65s cover when a boss enters a new phase (armor: ArmorBreak96)
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

  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const setShow = (el, on, disp) => { const v = on ? (disp || 'block') : 'none'; if (el && el.style.display !== v) el.style.display = v; };

  /* ---------------- TOPIC #1: CombatFeel97 — a perfect parry (parryBullet) gives charge and a breath of cover ---------------- */
  const CombatFeel97 = {
    onParry() { if (!simV(98)) return; P.ch = Math.min(P.maxCh, P.ch + 0.5); P.inv = Math.max(P.inv || 0, 0.22); }
  };

  /* ---------------- TOPIC #2: RosterPerks97 ---------------- */
  const RosterPerks97 = {
    ARCH: {
      heavy:  { bodies: ['oni','exo','mecha','knight','viking','yeti','shogun','ashura','dragon'],
                name: 'TITAN FRAME', he: 'שלדת טיטאן', col: '#ff6a00', desc: '+1 Max HP · +10% DMG', heDesc: '+1 חיים מקסימליים · +10% נזק' },
      agile:  { bodies: ['ninja','shinobi2','neko','kitsune','wolf','netrunner','idol','rider'],
                name: 'PHANTOM EDGE', he: 'להב פנטום', col: '#00f2fe', desc: '+12% Crit · -12% Dash CD', heDesc: '+12% קריט · -12% קולדאון דאש' },
      arcane: { bodies: ['seraph','lich','sovereign','yurei','raijin','tengu','witch'],
                name: 'ASTRAL CORE', he: 'ליבה אסטרלית', col: '#c45bff', desc: '+25% Overdrive · +18% Magnet', heDesc: '+25% טעינת אוברדרייב · +18% מגנט' },
      master: { bodies: ['ronin','chromesam','skull','blaze','pixel','goo','pumpkin'],
                name: 'SWORD SAINT', he: 'קדוש החרב', col: '#ffd700', desc: '+15% DMG · +30ms Crit Window', heDesc: '+15% נזק · +30ms חלון קריט' }
    },
    getArch(body) {
      const b = body || 'ninja';
      for (const k of Object.keys(this.ARCH)) if (this.ARCH[k].bodies.includes(b)) return { key: k, ...this.ARCH[k] };
      return { key: 'agile', ...this.ARCH.agile };
    },
    applyToPlayer() { // (inside applyLoadout: a rule since 98, so older replays keep their numbers)
      P._arch97 = null;
      if (!simV(98) || !P.skin) return;
      const arch = this.getArch(P.skin.body); P._arch97 = arch;
      const glass = G.mods.glass || (G.ctr && G.ctr.glass); // (a glass body stays at one shield)
      if (arch.key === 'heavy') { if (!glass) P.maxHp += 1; P.dmgMul = +(P.dmgMul * 1.10).toFixed(3); }
      else if (arch.key === 'agile') { P.critAdd = +(P.critAdd + 0.12).toFixed(3); P.rc = Math.max(0.24, +(P.rc * 0.88).toFixed(3)); }
      else if (arch.key === 'arcane') { P.odMul = +(P.odMul * 1.25).toFixed(3); P.magR = Math.round(P.magR * 1.18); }
      else if (arch.key === 'master') { P.dmgMul = +(P.dmgMul * 1.15).toFixed(3); if (P.pwMax > 0) P.pwMax = +(P.pwMax + 0.03).toFixed(3); } // (no window under a no-parry contract)
      if (G.pet && G.pet !== 'none') { const lv = Math.max(1, G.petLv | 0); P.odMul = +(P.odMul * (1 + 0.04 * (lv - 1))).toFixed(3); P.magR += 12 * lv; }
      if (Sim98.chip('aegis') && P.pwMax > 0) P.pwMax = +(P.pwMax * 1.35).toFixed(3);
    },
    patchWeaponForgeCleanup() {
      if (typeof WeaponForge95 === 'undefined' || !WeaponForge95.decorate || WeaponForge95._clean97) return;
      WeaponForge95._clean97 = true;
      const origDec = WeaponForge95.decorate.bind(WeaponForge95);
      const purge = grp => { if (!grp || !grp.children) return; for (const c of [...grp.children]) if (c && c.userData && c.userData.wdec95) { c.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); grp.remove(c); } };
      WeaponForge95.decorate = function (g, id) {
        if (g) { purge(g.blade); purge(g.blade2); }
        const r = origDec(g, id);
        for (const bl of [g && g.blade, g && g.blade2]) if (bl && bl.children.length) { const last = bl.children[bl.children.length - 1]; if (last && last.isGroup) last.userData.wdec95 = 1; }
        return r;
      };
    },
    badgeEl: null,
    tickUI() {
      if (!this.badgeEl) {
        const d = document.createElement('div'); d.id = 'arch97-badge';
        d.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:41;pointer-events:none;display:none;padding:5px 11px;border-radius:999px;background:rgba(6,10,24,.82);border:1px solid rgba(0,242,254,.45);font-family:Orbitron,Rajdhani,sans-serif;font-size:10px;font-weight:800;';
        document.body.appendChild(d); this.badgeEl = d;
      }
      const a = P._arch97, show = G.state === 'PLAY' && !G.photo && !!a;
      setShow(this.badgeEl, show);
      if (show && this.badgeKey !== a.key + LANG.id) { this.badgeKey = a.key + LANG.id; const he = S96.isHe(); this.badgeEl.style.borderColor = a.col; this.badgeEl.style.color = a.col; this.badgeEl.textContent = '★ ' + (he ? a.he + ' · ' + a.heDesc : a.name + ' · ' + a.desc); }
    }
  };

  /* ---------------- TOPIC #3: EnemyBossAI97 — a breath of cover when a boss enters a new phase ---------------- */
  const EnemyBossAI97 = {
    simStep() { // (the 1.6x armor damage lives in Boss.hitBody, v96; the stagger in ArmorBreak96)
      const b = Boss.cur; if (!b || b.dying > 0 || !(b.mhp > 0)) return;
      const f = b.hp / b.mhp, ph = Math.max(b.ph || 1, f <= 0.32 ? 3 : f <= 0.62 ? 2 : 1);
      if (b._ph98 == null) b._ph98 = ph;
      else if (ph > b._ph98) { b._ph98 = ph; P.inv = Math.max(P.inv || 0, 0.65); }
    }
  };

  /* ---------------- TOPIC #4: WorldCam97 — the finisher camera leans the game's own camera ---------------- */
  const WorldCam97 = {
    applyFixes() {
      if (!V96.FinisherCam96) return;
      V96.FinisherCam96.trigger = function (x, y, dur) {
        if (!S96.on('fcam96', true) || REPLAY.fast) return;
        this.x = x || P.x; this.y = y || P.y; this.t = dur || 0.75;
        CAM.fx = this.x * 0.65 + P.x * 0.35; CAM.fy = this.y * 0.65 + P.y * 0.35; CAM.zoom = Math.max(CAM.zoom || 0, 0.16);
      };
      V96.FinisherCam96.tick = function (rd) {
        if (this.t <= 0) return;
        this.t = Math.max(0, this.t - Math.min(0.05, rd || 0.016));
        if (R3.bloom) R3.bloom.strength = 0.45 + 0.38 * Math.sin(Math.min(1, this.t / 0.75) * Math.PI);
      };
    }
  };

  /* ---------------- TOPIC #5: StoryMeta97 ---------------- */
  const StoryMeta97 = {
    titleBadge: null, skipBtn: null,
    applyFixes() {
      if (typeof StoryOverhaul95 !== 'undefined' && !StoryOverhaul95._safe97) {
        StoryOverhaul95._safe97 = true;
        const origOpen = StoryOverhaul95.openChoiceModal.bind(StoryOverhaul95);
        StoryOverhaul95.openChoiceModal = function (b) { // the world holds while the choice is open (the pause menu cannot resume it: Sim98)
          const held = G.state === 'PLAY';
          if (held) { G.state = 'PAUSE'; In.cancel(); }
          origOpen(b);
          const watch = setInterval(() => {
            if (StoryOverhaul95.choiceOpen && G.state === 'PAUSE') return;
            clearInterval(watch);
            if (held && G.state === 'PAUSE' && !StoryOverhaul95.choiceOpen) G.state = 'PLAY';
          }, 180);
        };
        const origStart = StoryOverhaul95.onStoryStart.bind(StoryOverhaul95);
        StoryOverhaul95.onStoryStart = function (mode) { this.syncCount = 0; this.twistShown = false; return origStart(mode); };
      }
      try { // daily supply: by the player's own calendar day; the streak resets after a missed day
        const s = Store.data.settings, today = todayKey();
        if (s.lastDaily97 !== today) {
          const d = new Date(); d.setDate(d.getDate() - 1); const y = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
          s.streak97 = s.lastDaily97 === y ? (s.streak97 | 0) + 1 : 1; s.lastDaily97 = today;
          const bonusCr = 600 + Math.min(900, (s.streak97 - 1) * 150);
          Store.data.credits = (Store.data.credits || 0) + bonusCr;
          if (typeof Crates !== 'undefined' && Crates.give) Crates.give(1);
          Store.touch();
          setTimeout(() => { const he = S96.isHe(); if (typeof toast === 'function') toast(he ? ('🎁 אספקה יומית (יום ' + s.streak97 + '): +' + bonusCr + ' CR + תיבת ניאון!') : ('🎁 DAILY SUPPLY (DAY ' + s.streak97 + '): +' + bonusCr + ' CR + 1 CRATE!'), '#ffd700'); }, 1400);
        }
      } catch (e) {}
    },
    onBossDefeatReward(b) { // (rewards are for playing, not for watching a replay)
      if (!b || REPLAY.on) return;
      try {
        const s = Store.data.settings || (Store.data.settings = {});
        s.firstClear97 = s.firstClear97 || {};
        if (!s.firstClear97[b.id]) {
          s.firstClear97[b.id] = 1; Store.data.credits = (Store.data.credits || 0) + 1000;
          if (typeof Crates !== 'undefined' && Crates.give) Crates.give(1);
          Store.touch();
          FX.call(S96.isHe() ? '🏆 ניצחון ראשון! +1,000 CR + תיבה' : '🏆 FIRST CLEAR! +1,000 CR + 1 CRATE', '#ffd700', 3, 22);
        }
        const heatCount = G.ctr ? Object.values(G.ctr).filter(Boolean).length : 0;
        if (heatCount > 0) { const hb = heatCount * 350; Store.data.credits = (Store.data.credits || 0) + hb; Store.touch(); FX.text(b.x, b.y - 45, '+' + hb + ' HEAT CR', '#ff6a00', 15); }
      } catch (e) {}
    },
    tickUI() { // (the menu loop: title screen and dialogues)
      if (!this.titleBadge) {
        const d = document.createElement('div'); d.id = 'ending-badge97';
        d.style.cssText = 'position:fixed;top:52px;left:50%;transform:translateX(-50%);z-index:43;pointer-events:none;display:none;padding:4px 14px;border-radius:999px;background:rgba(8,12,28,.86);border:1.5px solid #ffd700;font-family:Orbitron,Rajdhani,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.2px;color:#ffd700;';
        document.body.appendChild(d); this.titleBadge = d;
      }
      const onTitle = UI.cur === 'title' && G.state !== 'PLAY', titleVal = (Store.data && Store.data.settings && Store.data.settings.endingTitle95) || '';
      setShow(this.titleBadge, onTitle && !!titleVal);
      if (onTitle && titleVal) {
        const isLib = titleVal.includes('LIBERATOR');
        this.titleBadge.style.borderColor = isLib ? '#00f2fe' : '#ff0844'; this.titleBadge.style.color = isLib ? '#00f2fe' : '#ff4fd8';
        setTxt(this.titleBadge, (isLib ? '✦ ' : '👑 ') + (S96.isHe() ? (isLib ? 'משחרר ניאו־אדו' : 'שליט הרשת העליון') : titleVal));
      }
      if (!this.skipBtn) {
        const b = document.createElement('button'); b.id = 'dlg-skip97';
        b.style.cssText = 'position:fixed;top:16px;right:16px;z-index:70;display:none;padding:6px 14px;border-radius:999px;cursor:pointer;background:rgba(10,14,30,.9);border:1.5px solid #00f2fe;color:#00f2fe;font-family:Orbitron,Rajdhani,sans-serif;font-size:11px;font-weight:900;';
        b.onclick = () => { try { if (Dlg.active && Dlg.lines) { Dlg.i = Dlg.lines.length - 1; Dlg.shown = 9999; Dlg.next(); } } catch (e) {} };
        document.body.appendChild(b); this.skipBtn = b;
      }
      const inDlg = G.state === 'DIALOG' && Dlg.active;
      setShow(this.skipBtn, inDlg);
      if (inDlg) setTxt(this.skipBtn, S96.isHe() ? 'דלג ⏭' : 'SKIP ⏭');
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
      for (const ex of extraSlots) if (!StudioAudio95.SLOTS.some(s => s.id === ex.id)) {
        StudioAudio95.SLOTS.push(ex); // (the folder's list, audio/tracks.json, attaches it when it is there)
        if (location.protocol === 'file:') StudioAudio95.attachTrack(ex.id, ex.file, false);
      }
      const origAttach = StudioAudio95.attachTrack.bind(StudioAudio95);
      StudioAudio95.attachTrack = function (id, src, fromUser) {
        if (AudioMix97.objUrls[id] && AudioMix97.objUrls[id] !== src) { try { URL.revokeObjectURL(AudioMix97.objUrls[id]); } catch (e) {} delete AudioMix97.objUrls[id]; }
        if (fromUser && String(src).startsWith('blob:')) AudioMix97.objUrls[id] = src;
        return origAttach(id, src, fromUser);
      };
      const origPick = StudioAudio95.pickDesiredSlot.bind(StudioAudio95);
      StudioAudio95.pickDesiredSlot = function () {
        if (document.hidden) return '';
        const has = id => !!this.loaded[id];
        if (typeof StoryOverhaul95 !== 'undefined' && StoryOverhaul95.choiceOpen && has('ending')) return 'ending';
        if (document.getElementById('crate94-ov') && has('crates')) return 'crates';
        if (G.state === 'PLAY') {
          if (typeof BladeClash91 !== 'undefined' && BladeClash91.active && has('rival')) return 'rival';
          if (V96.TrackEvents96 && V96.TrackEvents96.cur === 'storm' && has('storm')) return 'storm';
        }
        return origPick();
      };
      const origStep = StudioAudio95.step.bind(StudioAudio95); // the announcer ducks the music after the engine's own fade
      StudioAudio95.step = function (rd) {
        const r = origStep(rd);
        if (AudioMix97.voiceDuckT > 0) { AudioMix97.voiceDuckT = Math.max(0, AudioMix97.voiceDuckT - Math.min(0.25, rd || 0.016)); for (const sl of this.SLOTS) { const a = this.players[sl.id]; if (a && !a.paused && a.volume > 0.24) a.volume = 0.24; } }
        return r;
      };
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) for (const sl of StudioAudio95.SLOTS) { const a = StudioAudio95.players[sl.id]; if (a && !a.paused) { try { a.pause(); } catch (e) {} } }
      });
      if (V96.VoiceBarks96 && V96.VoiceBarks96.say && !V96.VoiceBarks96._duck97) {
        V96.VoiceBarks96._duck97 = true;
        const origSay = V96.VoiceBarks96.say.bind(V96.VoiceBarks96);
        V96.VoiceBarks96.say = function (text, pitch, rate) { AudioMix97.voiceDuckT = 1.15; return origSay(text, pitch, rate); };
      }
    }
  };

  /* ---------------- TOPIC #7: TechUX97 — the title dock and the controls guide [H] ---------------- */
  const TechUX97 = {
    dock: null, helpBtn: null, helpModal: null,
    ensureUI() {
      if (!this.dock) {
        const d = document.createElement('div'); d.id = 'dock97';
        d.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:45;display:none;flex-wrap:wrap;justify-content:center;gap:6px;max-width:94vw;pointer-events:auto;';
        document.body.appendChild(d); this.dock = d;
      }
      if (!this.helpBtn) {
        const b = document.createElement('button'); b.id = 'help97-btn';
        b.style.cssText = 'padding:6px 11px;border-radius:999px;cursor:pointer;background:rgba(8,12,26,.86);border:1.5px solid #00f2fe;color:#00f2fe;font-family:Orbitron,Rajdhani,sans-serif;font-size:11px;font-weight:900;';
        b.onclick = () => this.openHelp(); this.dock.appendChild(b); this.helpBtn = b;
      }
    },
    adoptTitleButtons() { // the floating title pills go into the dock, so they never overlap
      for (const id of ['ost95-btn', 'chips96-btn']) {
        const el = document.getElementById(id);
        if (el && el.parentNode !== this.dock) { el.style.position = 'static'; el.style.top = 'auto'; el.style.left = 'auto'; this.dock.insertBefore(el, this.helpBtn); }
      }
    },
    openHelp() {
      if (!this.helpModal) {
        const m = document.createElement('div'); m.className = 'modal92-bg';
        m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
        document.body.appendChild(m); this.helpModal = m;
      }
      const he = S96.isHe();
      this.helpModal.innerHTML =
        '<div class="modal92-box" style="max-width:520px;border-color:#00f2fe">' +
          '<div class="modal92-head"><h3>⌨ ' + (he ? 'מדריך מקשים ופיצ׳רים' : 'QUICK CONTROLS & FEATURES') + '</h3><button class="modal92-close" id="h97-x">✕</button></div>' +
          '<div style="font-size:13px;line-height:1.6">' +
            '<div><b>[F]</b> — ' + (he ? 'שיגור אויבים לאוויר / הנחתת Helm Breaker (עולה מטען דאש אחד)' : 'Rising Launcher / Helm Breaker Slam (spends one dash charge)') + '</div>' +
            '<div><b>[R]</b> — ' + (he ? 'בתפריט ההשהיה ובמסך התוצאות: התחלה מחדש. בריצה: Time Echo' : 'In the pause menu and results: restart. In a run: Time Echo') + '</div>' +
            '<div><b>[H]</b> — ' + (he ? 'פתיחת/סגירת מדריך מקשים זה' : 'Toggle this Quick Controls overlay') + '</div>' +
            '<div><b>💎 ' + (he ? 'צ׳יפים' : 'CHIPS') + '</b> — ' + (he ? 'שבץ עד 2 צ׳יפים טקטיים בנשק' : 'Socket up to 2 tactical Weapon Chips') + '</div>' +
            '<div><b>🎵 ' + (he ? 'פסקול' : 'SOUNDTRACK') + '</b> — ' + (he ? 'טען עד 10 טראקים אמיתיים (MP3/WAV)' : 'Load up to 10 Studio Vocal/OST tracks (MP3/WAV)') + '</div>' +
          '</div></div>';
      this.helpModal.querySelector('#h97-x').onclick = () => this.helpModal.classList.remove('on');
      this.helpModal.classList.add('on');
    },
    tick() { // (the menu loop)
      this.ensureUI();
      const onTitle = UI.cur === 'title' && G.state !== 'PLAY';
      if (onTitle) this.adoptTitleButtons();
      setShow(this.dock, onTitle, 'flex');
      setTxt(this.helpBtn, S96.isHe() ? '⌨ מקשים [H]' : '⌨ KEYS [H]');
    }
  };

  /* ---------------- WIRING ---------------- */
  RosterPerks97.patchWeaponForgeCleanup();
  WorldCam97.applyFixes();
  StoryMeta97.applyFixes();
  AudioMix97.applyFixes();

  window.addEventListener('keydown', e => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.code !== 'KeyH') return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (TechUX97.helpModal && TechUX97.helpModal.classList.contains('on')) TechUX97.helpModal.classList.remove('on'); else TechUX97.openHelp();
  });

  const origAL = applyLoadout;
  applyLoadout = function () { const r = origAL.apply(this, arguments); try { RosterPerks97.applyToPlayer(); } catch (e) { errLog(e); } return r; };

  const origPB = parryBullet; // (the real parry; a dash hit is not one)
  parryBullet = function () { const r = origPB.apply(this, arguments); try { CombatFeel97.onParry(); } catch (e) { errLog(e); } return r; };

  const origBK = Boss.kill.bind(Boss);
  Boss.kill = function (b) { const r = origBK(b); try { StoryMeta97.onBossDefeatReward(b); } catch (e) {} return r; };

  const origHD = HUD.draw.bind(HUD);
  HUD.draw = function (rd) { try { RosterPerks97.tickUI(); StoryMeta97.tickUI(); } catch (e) {} return origHD(rd); };

  Sim98.steps.push(() => { EnemyBossAI97.simStep(); });
  Sim98.menu.push(() => StoryMeta97.tickUI(), () => TechUX97.tick());
})();
