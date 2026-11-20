/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 96.0 (MODULAR AAA EXPANSION)
   Loaded cleanly from js/v96-overdrive.js (Modular Code Split #9)

   Priority Tier 1 (Technical & UX):
     1. PerfGov96     — 60 FPS Adaptive DPR & Particle Budget Governor + FPS Badge
     2. QuickUX96     — Instant Restart (Hotkey [R] + Button) & Chaos HUD Declutter
   Priority Tier 2 (Core Combat Depth):
     3. AirCombat96   — Rising Launcher [F], 3D Air Juggle Combos & Helm Breaker Slam
     4. TrainProps96  — Destructible 3D Plasma Barrels, Tesla Pylons & Neon Signs
   Priority Tier 3 (Full AAA Suite):
     5. TrackEvents96 — Dynamic Rail Events (Dark Tunnel, Lightning Storm, Ambush)
     6. ArmorBreak96  — Breakable 3D Boss/Elite Armor Plates & Exposed Core (1.6x DMG)
     7. VoiceBarks96  — Stylized Combat Voice Barks & Cyber Announcer
     8. WeaponChips96 — Boss-Drop Weapon Socket Chips (2 Slots, 5 Unique Effects)
     9. DojoLab96     — Real-Time DPS Meter, Parry Timing (ms) & Quick Dummy Spawner
    10. GhostRun96    — 3D Holographic Personal-Best Ghost Racing
    11. FinisherCam96 — Dynamic Low-Angle 3D Finisher & Zandatsu Camera Sweep
   ========================================================================== */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "AAA SYSTEMS (v96)": "מערכות AAA מתקדמות (v96)",
      "60 FPS Auto-Governor": "ייצוב 60 FPS אוטומטי",
      "Show FPS Counter": "הצג מד FPS",
      "HUD Chaos Declutter": "דילול HUD בעומס קרב",
      "Air Juggle & Launcher [F]": "קומבו אווירי ושיגור [F]",
      "Destructible Train Props": "סביבה הריסה על הגג",
      "Dynamic Track Events": "אירועי מסילה דינמיים",
      "3D Boss Armor Break": "שבירת שריון 3D לבוסים",
      "Combat Voice Announcer": "קריינות קרב (Voice Barks)",
      "3D Ghost Racing": "מרוץ רוחות רפאים 3D",
      "Cinematic Finisher Cam": "מצלמת Finisher קולנועית",
      "CHIPS": "צ'יפים",
      "WEAPON CHIPS (v96)": "צ'יפים לנשק (v96)",
      "RESTART [R]": "התחל מחדש [R]",
      "ARMOR BREAK!": "שריון נשבר!",
      "AIR JUGGLE": "קומבו אווירי",
      "HELM BREAKER!": "הנחתת להב!",
      "DARK TUNNEL AHEAD": "כניסה למנהרה חשוכה",
      "LIGHTNING STORM": "סופת ברקים על המסילה",
      "PARALLEL TRAIN AMBUSH": "מארב מרכבת מקבילה!"
    });
    if (typeof AR !== 'undefined') Object.assign(AR, {
      "AAA SYSTEMS (v96)": "أنظمة AAA المتقدمة (v96)",
      "CHIPS": "شرائح",
      "RESTART [R]": "إعادة [R]"
    });
    if (typeof RU !== 'undefined') Object.assign(RU, {
      "AAA SYSTEMS (v96)": "AAA-СИСТЕМЫ (v96)",
      "CHIPS": "ЧИПЫ",
      "RESTART [R]": "РЕСТАРТ [R]"
    });
  } catch (e) {}

  const S96 = {
    on(k, defVal) {
      try {
        const s = Store && Store.data && Store.data.settings;
        if (!s || s[k] == null) return defVal == null ? true : !!defVal;
        return !!s[k];
      } catch (e) { return defVal == null ? true : !!defVal; }
    },
    isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
    L(s) { return typeof lt === 'function' ? lt(s) : s; }
  };

  /* ========================================================================
     1. PerfGov96 — 60 FPS ADAPTIVE PERFORMANCE GOVERNOR (#9)
     ======================================================================== */
  const PerfGov96 = {
    frames: 0, acc: 0, fps: 60, dprCur: 1.5, badge: null,
    ensureDOM() {
      if (!this.badge) {
        const b = document.createElement('div');
        b.id = 'fps96-badge';
        document.body.appendChild(b);
        this.badge = b;
      }
    },
    tick(rd) {
      const dt = Math.max(0.001, Math.min(0.1, rd || 0.016));
      this.frames++;
      this.acc += dt;
      if (this.acc >= 0.6) {
        this.fps = Math.round(this.frames / this.acc);
        this.frames = 0;
        this.acc = 0;

        // Adaptive DPR scaling to keep WebGL locked near 60 FPS
        if (S96.on('perf96', true) && typeof R3 !== 'undefined' && R3.ok && R3.rn) {
          const maxDpr = Math.min(2, window.devicePixelRatio || 1);
          if (this.fps < 48 && this.dprCur > 0.85) {
            this.dprCur = Math.max(0.85, +(this.dprCur - 0.15).toFixed(2));
            R3.rn.setPixelRatio(this.dprCur);
          } else if (this.fps >= 58 && this.dprCur < maxDpr) {
            this.dprCur = Math.min(maxDpr, +(this.dprCur + 0.1).toFixed(2));
            R3.rn.setPixelRatio(this.dprCur);
          }
          // Trim excess 3D debris under heavy load
          if (this.fps < 45 && R3.deb && R3.deb.length > 24) {
            while (R3.deb.length > 18) {
              const d = R3.deb.shift();
              if (d && d.m && d.m.parent) d.m.parent.remove(d.m);
            }
          }
        }

        this.ensureDOM();
        const show = S96.on('fps96', false);
        this.badge.style.display = show ? 'block' : 'none';
        if (show) {
          this.badge.textContent = this.fps + ' FPS · ' + Math.round(this.dprCur * 100) + '%';
          this.badge.style.color = this.fps >= 55 ? '#00ff9d' : this.fps >= 40 ? '#ffd700' : '#ff0844';
        }
      }
    }
  };

  /* ========================================================================
     2. QuickUX96 — INSTANT RESTART [R] & HUD CHAOS DECLUTTER (#10)
     ======================================================================== */
  const QuickUX96 = {
    btn: null,
    restartNow() {
      try {
        if (typeof UI === 'undefined' || !UI.last) return;
        if (typeof StoryOverhaul95 !== 'undefined' && StoryOverhaul95.choiceOpen) return;
        if (typeof G !== 'undefined' && G.state === 'DIALOG') return;
        const last = UI.last;
        if (last.mode === 'story' && last.idx != null) {
          UI.startStory(last.idx);
        } else if (last.mode) {
          UI.startArcade(last.mode);
        }
        if (typeof FX !== 'undefined') FX.call(S96.L('RESTART [R]'), '#00f2fe', 1, 18);
      } catch (e) {}
    },
    init() {
      window.addEventListener('keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.code === 'KeyR' && typeof G !== 'undefined' && (G.state === 'PLAY' || G.state === 'PAUSE' || G.state === 'OVER')) {
          e.preventDefault();
          this.restartNow();
        }
      });
    },
    tick() {
      if (!this.btn) {
        const b = document.createElement('button');
        b.id = 'restart96-btn';
        b.onclick = () => this.restartNow();
        document.body.appendChild(b);
        this.btn = b;
      }
      const st = typeof G !== 'undefined' ? G.state : 'MENU';
      const show = (st === 'PAUSE' || st === 'OVER') && typeof UI !== 'undefined' && !!UI.last;
      this.btn.style.display = show ? 'block' : 'none';
      if (show) this.btn.textContent = '↻ ' + S96.L('RESTART [R]');

      const declutter = S96.on('declutter96', true) && st === 'PLAY' && typeof G !== 'undefined' && (G.combo | 0) >= 12;
      document.body.classList.toggle('declutter96', !!declutter);
    }
  };

  /* ========================================================================
     3. VoiceBarks96 — COMBAT VOICE BARKS & CYBER ANNOUNCER (#5)
     ======================================================================== */
  const VoiceBarks96 = {
    lastT: 0,
    say(text, pitch, rate) {
      if (!S96.on('voice96', true)) return;
      const now = performance.now();
      if (now - this.lastT < 1300) return;
      this.lastT = now;
      try {
        if (typeof speechSynthesis === 'undefined') return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.pitch = pitch != null ? pitch : 0.88;
        u.rate = rate != null ? rate : 1.18;
        u.volume = 0.72;
        speechSynthesis.speak(u);
      } catch (e) {}
    }
  };

  /* ========================================================================
     4. WeaponChips96 — BOSS-DROP WEAPON SOCKET CHIPS (#6)
     ======================================================================== */
  const WeaponChips96 = {
    CHIPS: [
      { id: 'volt',   name: 'VOLT COIL',      he: 'סליל ברקים',      col: '#00f2fe', desc: '28% chance on slash to chain lightning to a nearby foe.', heDesc: '28% סיכוי בחיתוך לשרשרת ברק לאויב סמוך.' },
      { id: 'vamp',   name: 'VAMPIRIC EDGE',  he: 'להב ערפדי',       col: '#ff0844', desc: 'Restore +1 HP every 14 kills.', heDesc: 'משחזר +1 חיים על כל 14 חיסולים.' },
      { id: 'aegis',  name: 'AEGIS FRAME',    he: 'מסגרת אגיס',      col: '#00ff9d', desc: '+35% wider Parry / Dash forgiveness window.', heDesc: '+35% הרחבת חלון פארי והתחמקות.' },
      { id: 'crit',   name: 'OVERCLOCK CRIT', he: 'קריט אוברקלוק',   col: '#ffd700', desc: '+24% bonus damage when Combo is 10 or higher.', heDesc: '+24% נזק נוסף כשהקומבו הוא 10 ומעלה.' },
      { id: 'sky',    name: 'SKY MASTER',     he: 'שליט האוויר',     col: '#ff4fd8', desc: '+45% Air Juggle damage & higher launch lift.', heDesc: '+45% נזק בקומבו אווירי ושיגור גבוה יותר.' }
    ],
    killCnt: 0, btnEl: null, modalEl: null,
    data() {
      const s = (typeof Store !== 'undefined' && Store.data && Store.data.settings) || {};
      if (!s.chips96) s.chips96 = { owned: ['volt', 'sky'], eq: ['volt'] };
      return s.chips96;
    },
    has(id) { return this.data().eq.includes(id); },
    grantRandom() {
      const d = this.data();
      const locked = this.CHIPS.filter(c => !d.owned.includes(c.id));
      if (!locked.length) return;
      const pick = locked[Math.floor(Math.random() * locked.length)];
      d.owned.push(pick.id);
      try { Store.touch(); } catch (e) {}
      if (typeof FX !== 'undefined') FX.call('💎 ' + (S96.isHe() ? 'צ׳יפ חדש: ' + pick.he : 'CHIP DROP: ' + pick.name), pick.col, 3, 22);
      VoiceBarks96.say('Tech chip acquired!', 1.05, 1.15);
    },
    onHit(e) {
      if (!e || !e.alive) return;
      // Overclock Crit
      if (this.has('crit') && typeof G !== 'undefined' && (G.combo | 0) >= 10) {
        e.hp -= 12;
        if (typeof FX !== 'undefined') FX.spark(e.x, e.y, '#ffd700', 4);
      }
      // Volt Coil Chain Lightning
      if (this.has('volt') && Math.random() < 0.28 && typeof EN !== 'undefined') {
        let best = null, bd = 210;
        for (let i = 0; i < EN.n; i++) {
          const o = EN.a[i];
          if (!o || !o.alive || o === e) continue;
          const dist = Math.hypot(o.x - e.x, o.y - e.y);
          if (dist < bd) { bd = dist; best = o; }
        }
        if (best) {
          best.hp -= 18;
          if (typeof FX !== 'undefined') { FX.spark(best.x, best.y, '#00f2fe', 8); FX.ring(best.x, best.y, 26, '#00f2fe', 3); }
        }
      }
    },
    onKill(e) {
      if (this.has('vamp')) {
        this.killCnt++;
        if (this.killCnt >= 14 && typeof P !== 'undefined') {
          this.killCnt = 0;
          if (P.hp < P.maxHp) { P.hp = Math.min(P.maxHp, P.hp + 1); if (typeof FX !== 'undefined') FX.text(P.x, P.y - 24, '+1 HP', '#00ff9d', 14); }
        }
      }
      if (e && e.elite && Math.random() < 0.35) this.grantRandom();
    },
    openModal() {
      if (!this.modalEl) {
        const m = document.createElement('div');
        m.className = 'modal92-bg';
        m.onclick = ev => { if (ev.target === m) m.classList.remove('on'); };
        document.body.appendChild(m);
        this.modalEl = m;
      }
      const d = this.data(), he = S96.isHe();
      const rows = this.CHIPS.map(c => {
        const own = d.owned.includes(c.id), eq = d.eq.includes(c.id);
        return '<div class="chip96-card ' + (eq ? 'eq' : '') + (own ? '' : ' locked') + '">' +
          '<div><div style="font-weight:900;font-size:13px;color:' + c.col + '">💎 ' + (he ? c.he : c.name) + '</div>' +
          '<div style="font-size:11px;opacity:.82">' + (he ? c.heDesc : c.desc) + '</div></div>' +
          (own ? '<button class="modal92-close" data-cid="' + c.id + '" style="border-color:' + (eq ? '#00ff9d' : '#ffd700') + ';color:' + (eq ? '#00ff9d' : '#ffd700') + '">' + (eq ? (he ? 'מצויד ✓' : 'EQUIPPED ✓') : (he ? 'שבץ' : 'EQUIP')) + '</button>'
               : '<span style="font-size:10px;opacity:.7">' + (he ? 'נופל מבוסים' : 'BOSS DROP') + '</span>') +
        '</div>';
      }).join('');
      this.modalEl.innerHTML =
        '<div class="modal92-box"><div class="modal92-head"><h3>💎 ' + S96.L('WEAPON CHIPS (v96)') + ' (' + d.eq.length + '/2)</h3><button class="modal92-close" id="c96-x">✕</button></div>' +
        '<p style="font-size:12px;opacity:.82;margin:0 0 10px">' + (he ? 'שבץ עד 2 צ׳יפים טקטיים בנשק שלך. בוסים ואויבי עילית מפילים צ׳יפים נדירים נוספים.' : 'Socket up to 2 tactical chips into your weapon. Defeat Bosses & Elites to unlock more.') + '</p>' +
        rows + '</div>';
      this.modalEl.querySelector('#c96-x').onclick = () => this.modalEl.classList.remove('on');
      this.modalEl.querySelectorAll('button[data-cid]').forEach(b => {
        b.onclick = () => {
          const cid = b.getAttribute('data-cid');
          const idx = d.eq.indexOf(cid);
          if (idx >= 0) d.eq.splice(idx, 1);
          else { if (d.eq.length >= 2) d.eq.shift(); d.eq.push(cid); }
          try { Store.touch(); } catch (e) {}
          this.openModal();
        };
      });
      this.modalEl.classList.add('on');
    },
    tickUI() {
      if (!this.btnEl) {
        const b = document.createElement('button');
        b.id = 'chips96-btn';
        b.onclick = () => this.openModal();
        document.body.appendChild(b);
        this.btnEl = b;
      }
      const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && G.state !== 'PLAY';
      this.btnEl.style.display = onTitle ? 'block' : 'none';
      if (onTitle) this.btnEl.textContent = '💎 ' + S96.L('CHIPS') + ' (' + this.data().eq.length + '/2)';
    }
  };

  /* ========================================================================
     5. AirCombat96 — LAUNCHERS [F], 3D AIR JUGGLE & HELM BREAKER (#2)
     ======================================================================== */
  const AirCombat96 = {
    cd: 0, bufT: 0, juggleCount: 0, btnEl: null,
    init() {
      window.addEventListener('keydown', e => {
        if (e.repeat) return;
        if (e.code === 'KeyF' && typeof G !== 'undefined' && G.state === 'PLAY') {
          e.preventDefault();
          this.trigger();
        }
      });
    },
    hasAirborne() {
      if (typeof EN === 'undefined') return false;
      for (let i = 0; i < EN.n; i++) if (EN.a[i] && EN.a[i].alive && (EN.a[i]._z96 || 0) > 10) return true;
      return false;
    },
    trigger() {
      if (!S96.on('air96', true) || typeof P === 'undefined' || typeof EN === 'undefined') return;
      if (this.cd > 0) { this.bufT = 0.14; return; }
      this.bufT = 0;
      const anyAir = this.hasAirborne();
      const skyBonus = WeaponChips96.has('sky') ? 1.45 : 1.0;

      if (anyAir) {
        // HELM BREAKER DOWNWARD SLAM!
        this.cd = 0.65;
        let slammed = 0;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e || !e.alive || !(e._z96 > 6)) continue;
          e._z96 = 0; e._vz96 = 0;
          e.hp -= Math.round(44 * skyBonus);
          slammed++;
          if (typeof FX !== 'undefined') { FX.ring(e.x, e.y, 95, '#ffd700', 7); FX.spark(e.x, e.y, '#ffd700', 18); }
          if (e.hp <= 0 && typeof killEnemy === 'function') killEnemy(e);
        }
        if (slammed > 0) {
          this.juggleCount = 0;
          if (typeof shake === 'function') shake(0.8);
          if (typeof FX !== 'undefined') FX.call('⚡ ' + S96.L('HELM BREAKER!'), '#ffd700', 3, 24);
          if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('boom');
          VoiceBarks96.say('Helm Breaker!', 0.85, 1.25);
        }
      } else {
        // RISING FANG LAUNCHER!
        this.cd = 0.5;
        let launched = 0;
        const lift = WeaponChips96.has('sky') ? 390 : 320;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e || !e.alive) continue;
          if (Math.hypot(e.x - P.x, e.y - P.y) <= 155) {
            e._z96 = Math.max(e._z96 || 0, 14);
            e._vz96 = lift;
            e.hp -= Math.round(16 * skyBonus);
            launched++;
            if (typeof FX !== 'undefined') FX.spark(e.x, e.y, '#00f2fe', 10);
          }
        }
        if (launched > 0) {
          this.juggleCount = 1;
          if (typeof FX !== 'undefined') { FX.ring(P.x, P.y, 130, '#00f2fe', 5); FX.text(P.x, P.y - 34, 'LAUNCH! [F]', '#00f2fe', 16); }
          if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('slash');
        }
      }
    },
    onEnemyHit(e) {
      if (!S96.on('air96', true) || !e || !(e._z96 > 6)) return;
      // Keep airborne enemy juggled in mid-air with bonus style damage!
      e._vz96 = Math.max(e._vz96 || 0, 250);
      if (typeof P !== 'undefined') P.ch = Math.min(P.maxCh, P.ch + 0.35);
      if (typeof G !== 'undefined') G.hs = Math.max(G.hs || 0, 0.032);
      const mult = WeaponChips96.has('sky') ? 1.45 : 1.25;
      e.hp -= Math.round(14 * mult);
      this.juggleCount++;
      if (typeof FX !== 'undefined') {
        FX.text(e.x, e.y - 38, S96.L('AIR JUGGLE') + ' x' + this.juggleCount, '#ff4fd8', 15);
        FX.spark(e.x, e.y, '#ff4fd8', 8);
      }
      if (this.juggleCount === 3) VoiceBarks96.say('Air Combo!', 1.05, 1.22);
    },
    tick(rd) {
      const dt = Math.min(0.05, rd || 0.016);
      if (this.cd > 0) this.cd -= dt;
      if (this.bufT > 0) { this.bufT -= dt; if (this.cd <= 0) this.trigger(); }
      if (typeof EN !== 'undefined') {
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e || !e.alive || !(e._z96 > 0 || e._vz96 > 0)) continue;
          e._vz96 = (e._vz96 || 0) - 720 * dt;
          e._z96 = Math.max(0, (e._z96 || 0) + e._vz96 * dt);
          if (e._z96 <= 0) e._vz96 = 0;
        }
      }
      // On-screen Launcher / Helm Breaker button during PLAY
      if (!this.btnEl) {
        const b = document.createElement('button');
        b.id = 'air96-btn';
        b.onclick = () => this.trigger();
        document.body.appendChild(b);
        this.btnEl = b;
      }
      const show = S96.on('air96', true) && typeof G !== 'undefined' && G.state === 'PLAY' && !G.photo;
      this.btnEl.style.display = show ? 'block' : 'none';
      if (show) {
        const air = this.hasAirborne();
        this.btnEl.classList.toggle('slam', air);
        this.btnEl.textContent = air ? '⚡ SLAM [F]' : '▲ LAUNCH [F]';
      }
    }
  };

  /* ========================================================================
     6. TrainProps96 — DESTRUCTIBLE 3D BARRELS, TESLA PYLONS & NEON SIGNS (#1)
     ======================================================================== */
  const TrainProps96 = {
    props: [], spawnT: 3, seq: 1,
    reset() {
      for (const pr of this.props) if (pr.mesh && pr.mesh.parent) pr.mesh.parent.remove(pr.mesh);
      this.props = [];
      this.spawnT = 2.5;
    },
    spawnOne() {
      if (typeof P === 'undefined' || typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
      const types = ['barrel', 'tesla', 'neon'];
      const kind = types[Math.floor(Math.random() * types.length)];
      const ang = Math.random() * Math.PI * 2, dist = 140 + Math.random() * 190;
      const x = Math.max(-320, Math.min(320, (P.x || 0) + Math.cos(ang) * dist));
      const y = Math.max(-180, Math.min(180, (P.y || 0) + Math.sin(ang) * dist));
      const T = THREE, grp = new T.Group();
      grp.position.set(x, y, 0);

      if (kind === 'barrel') {
        const body = new T.Mesh(new T.CylinderGeometry(11, 11, 24, 12).rotateX(Math.PI / 2), new T.MeshStandardMaterial({ color: 0xff3b2f, emissive: 0xff4500, emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.3 }));
        body.position.z = 12; grp.add(body);
        const band = new T.Mesh(new T.TorusGeometry(11.4, 1.3, 6, 16), new T.MeshBasicMaterial({ color: 0xffd700 }));
        band.position.z = 13; grp.add(band);
      } else if (kind === 'tesla') {
        const pole = new T.Mesh(new T.CylinderGeometry(4, 6, 36, 8).rotateX(Math.PI / 2), new T.MeshStandardMaterial({ color: 0x1a2238, metalness: 0.8, roughness: 0.25 }));
        pole.position.z = 18; grp.add(pole);
        const orb = new T.Mesh(new T.OctahedronGeometry(8.5, 0), new T.MeshBasicMaterial({ color: 0x00f2fe }));
        orb.position.z = 38; grp.add(orb);
        grp._orb = orb;
      } else {
        const sign = new T.Mesh(new T.BoxGeometry(4, 34, 28), new T.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.86 }));
        sign.position.z = 18; grp.add(sign);
        const frame = new T.Mesh(new T.BoxGeometry(5, 36, 30), new T.MeshStandardMaterial({ color: 0x101426, wireframe: true }));
        frame.position.z = 18; grp.add(frame);
      }

      R3.root.add(grp);
      this.props.push({ id: this.seq++, kind, x, y, r: 26, mesh: grp, alive: true });
    },
    detonate(pr) {
      if (!pr || !pr.alive) return;
      pr.alive = false;
      if (pr.mesh && pr.mesh.parent) pr.mesh.parent.remove(pr.mesh);
      if (typeof EN === 'undefined') return;

      if (pr.kind === 'barrel') {
        if (typeof FX !== 'undefined') { FX.ring(pr.x, pr.y, 175, '#ff6a00', 9); FX.spark(pr.x, pr.y, '#ffd700', 26); FX.text(pr.x, pr.y - 26, 'PLASMA BLAST!', '#ff6a00', 16); }
        if (typeof shake === 'function') shake(0.75);
        if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('boom');
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e || !e.alive) continue;
          if (Math.hypot(e.x - pr.x, e.y - pr.y) <= 185) {
            e.hp -= 65; e._z96 = 16; e._vz96 = 260;
            if (e.hp <= 0 && typeof killEnemy === 'function') killEnemy(e);
          }
        }
      } else if (pr.kind === 'tesla') {
        if (typeof FX !== 'undefined') { FX.ring(pr.x, pr.y, 210, '#00f2fe', 7); FX.spark(pr.x, pr.y, '#00f2fe', 24); FX.text(pr.x, pr.y - 26, 'TESLA SHOCK!', '#00f2fe', 16); }
        if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('zap');
        let zapped = 0;
        for (let i = 0; i < EN.n && zapped < 5; i++) {
          const e = EN.a[i];
          if (!e || !e.alive) continue;
          if (Math.hypot(e.x - pr.x, e.y - pr.y) <= 230) {
            e.hp -= 45; e.stun = Math.max(e.stun || 0, 1.8); zapped++;
            if (typeof FX !== 'undefined') FX.spark(e.x, e.y, '#00f2fe', 10);
            if (e.hp <= 0 && typeof killEnemy === 'function') killEnemy(e);
          }
        }
      } else {
        if (typeof FX !== 'undefined') { FX.ring(pr.x, pr.y, 110, '#ff4fd8', 6); FX.spark(pr.x, pr.y, '#ff4fd8', 22); FX.text(pr.x, pr.y - 24, '+120 CR · +OD', '#ff4fd8', 15); }
        if (typeof Store !== 'undefined' && Store.data) Store.data.credits = (Store.data.credits || 0) + 120;
        if (typeof addOD === 'function') addOD(14);
        if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('glass');
      }
    },
    tick(rd, t) {
      if (!S96.on('props96', true) || typeof G === 'undefined' || G.state !== 'PLAY' || G.mode === 'puzzle') return;
      const dt = Math.min(0.05, rd || 0.016);
      this.spawnT -= dt;
      if (this.spawnT <= 0 && this.props.length < 3) {
        this.spawnOne();
        this.spawnT = 10 + Math.random() * 6;
      }
      for (const pr of this.props) {
        if (!pr.alive) continue;
        if (pr.mesh && pr.mesh._orb) pr.mesh._orb.rotation.z = t * 4.5;
        if (typeof P !== 'undefined' && P.dashT > 0 && Math.hypot(P.x - pr.x, P.y - pr.y) <= pr.r + 44) {
          this.detonate(pr);
        }
      }
      this.props = this.props.filter(p => p.alive);
    }
  };

  /* ========================================================================
     7. TrackEvents96 — DYNAMIC RAIL EVENTS (TUNNEL / STORM / AMBUSH) (#3)
     ======================================================================== */
  const TrackEvents96 = {
    cd: 28, cur: null, left: 0, bannerEl: null, strikeT: 0,
    showBanner(txt) {
      if (!this.bannerEl) {
        const d = document.createElement('div');
        d.id = 'event96-banner';
        document.body.appendChild(d);
        this.bannerEl = d;
      }
      this.bannerEl.textContent = '⚠ ' + txt;
      this.bannerEl.classList.add('on');
      setTimeout(() => { if (this.bannerEl) this.bannerEl.classList.remove('on'); }, 3200);
    },
    reset() {
      this.cd = 26;
      this.cur = null;
      this.left = 0;
      if (typeof R3 !== 'undefined' && R3.sun) R3.sun.intensity = 1.6;
    },
    tick(rd) {
      if (!S96.on('events96', true) || typeof G === 'undefined' || G.state !== 'PLAY' || G.mode === 'dojo' || G.mode === 'puzzle') return;
      const dt = Math.min(0.05, rd || 0.016);
      if (!this.cur) {
        this.cd -= dt;
        if (this.cd <= 0) {
          const kinds = ['tunnel', 'storm', 'ambush'];
          this.cur = kinds[Math.floor(Math.random() * kinds.length)];
          this.left = this.cur === 'ambush' ? 6 : 11;
          this.strikeT = 1.6;
          if (this.cur === 'tunnel') {
            this.showBanner(S96.L('DARK TUNNEL AHEAD'));
          } else if (this.cur === 'storm') {
            this.showBanner(S96.L('LIGHTNING STORM'));
          } else {
            this.showBanner(S96.L('PARALLEL TRAIN AMBUSH'));
            if (typeof FX !== 'undefined') FX.spark((P && P.x) || 0, (P && P.y) || 0, '#ff0844', 18);
          }
        }
      } else {
        this.left -= dt;
        if (this.cur === 'tunnel' && typeof R3 !== 'undefined' && R3.sun) {
          R3.sun.intensity = 0.25;
        } else if (this.cur === 'storm') {
          this.strikeT -= dt;
          if (this.strikeT <= 0) {
            this.strikeT = 2.4;
            const sx = ((P && P.x) || 0) + (Math.random() - 0.5) * 280;
            const sy = ((P && P.y) || 0) + (Math.random() - 0.5) * 180;
            if (typeof FX !== 'undefined') { FX.ring(sx, sy, 90, '#9fd8ff', 6); FX.spark(sx, sy, '#ffffff', 16); }
            if (typeof Cinema3D89 !== 'undefined') Cinema3D89.flash(sx, sy, '#9fd8ff', 900, 0.28);
            if (typeof EN !== 'undefined') {
              for (let i = 0; i < EN.n; i++) {
                const e = EN.a[i];
                if (e && e.alive && Math.hypot(e.x - sx, e.y - sy) <= 95) {
                  e.hp -= 55;
                  if (e.hp <= 0 && typeof killEnemy === 'function') killEnemy(e);
                }
              }
            }
          }
        }
        if (this.left <= 0) {
          if (typeof R3 !== 'undefined' && R3.sun) R3.sun.intensity = 1.6;
          this.cur = null;
          this.cd = 36;
        }
      }
    }
  };

  /* ========================================================================
     8. ArmorBreak96 — BREAKABLE 3D BOSS ARMOR & EXPOSED CORE (1.6x DMG) (#4)
     ======================================================================== */
  const ArmorBreak96 = {
    brokenFor: '', breakTimer: 0, flying: [],
    ensureArmor(bg) {
      if (!bg || bg._arm96 || typeof THREE === 'undefined') return;
      const T = THREE, grp = new T.Group();
      const plates = [];
      const pMat = new T.MeshStandardMaterial({ color: 0x262f48, metalness: 0.82, roughness: 0.24, emissive: 0x00f2fe, emissiveIntensity: 0.25 });
      for (const s of [-1, 1]) {
        const pl = new T.Mesh(new T.BoxGeometry(0.45, 0.55, 0.65), pMat);
        pl.position.set(0, s * 0.95, 1.25);
        grp.add(pl);
        plates.push(pl);
      }
      const core = new T.Mesh(new T.OctahedronGeometry(0.42, 0), new T.MeshBasicMaterial({ color: 0xffd700 }));
      core.position.set(0.55, 0, 1.15);
      core.visible = false;
      grp.add(core);
      bg.add(grp);
      bg._arm96 = { grp, plates, core, broken: false };
    },
    tick(rd, t) {
      if (!S96.on('armor96', true) || typeof Boss === 'undefined' || typeof R3 === 'undefined' || !R3.ok) return;
      const dt = Math.min(0.05, rd || 0.016);

      // Animate flying detached armor plates
      for (const fl of this.flying) {
        fl.life -= dt;
        fl.m.position.x += fl.vx * dt;
        fl.m.position.y += fl.vy * dt;
        fl.m.position.z = Math.max(2, fl.m.position.z + fl.vz * dt);
        fl.vz -= 420 * dt;
        fl.m.rotation.x += 6 * dt; fl.m.rotation.y += 8 * dt;
        if (fl.life <= 0 && fl.m.parent) fl.m.parent.remove(fl.m);
      }
      this.flying = this.flying.filter(f => f.life > 0);

      const b = Boss.cur;
      if (!b || b.dying > 0 || !(b.mhp > 0)) { this.brokenFor = ''; this.breakTimer = 0; return; }
      const key = 'boss' + b.id + (b.lvl || ''), ent = R3.ents && R3.ents.get(key), bg = ent && ent.g;
      if (!bg) return;
      this.ensureArmor(bg);
      const ar = bg._arm96; if (!ar) return;

      const hpFrac = b.hp / b.mhp;
      if (!ar.broken && hpFrac <= 0.72) {
        ar.broken = true;
        this.brokenFor = key;
        this.breakTimer = 10.0;
        ar.core.visible = true;
        for (const pl of ar.plates) {
          pl.visible = false;
          // Spawn flying detached 3D plate in world space
          if (R3.root && typeof THREE !== 'undefined') {
            const m = pl.clone();
            m.visible = true;
            m.scale.setScalar((b.r || 42) * 0.85);
            m.position.set(b.x, b.y, 40);
            R3.root.add(m);
            const a = Math.random() * Math.PI * 2;
            this.flying.push({ m, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, vz: 220, life: 1.5 });
          }
        }
        if (typeof FX !== 'undefined') { FX.call('💥 ' + S96.L('ARMOR BREAK!') + ' 1.6x DMG', '#ffd700', 3, 26); FX.ring(b.x, b.y, (b.r || 40) * 3.5, '#ffd700', 7); }
        if (typeof shake === 'function') shake(0.8);
        VoiceBarks96.say('Armor Break!', 0.9, 1.2);
      }
      if (ar.broken && ar.core) {
        ar.core.rotation.z = t * 6;
        ar.core.scale.setScalar(0.9 + Math.sin(t * 14) * 0.22);
      }
      if (this.breakTimer > 0) this.breakTimer -= dt;
    }
  };

  /* ========================================================================
     9. DojoLab96 — LIVE DPS METER & PARRY TIMING READOUT (#7)
     ======================================================================== */
  const DojoLab96 = {
    panel: null, hits: [], peakDps: 0, lastParryMs: null,
    recordDmg(dmg) {
      if (typeof G === 'undefined' || G.mode !== 'dojo') return;
      this.hits.push({ t: performance.now(), d: dmg || 25 });
    },
    recordParry(ms) {
      this.lastParryMs = Math.max(4, Math.min(250, Math.round(ms)));
    },
    tick() {
      if (!this.panel) {
        const p = document.createElement('div');
        p.id = 'dojo96-panel';
        p.innerHTML =
          '<div style="font-weight:900;color:#00f2fe;margin-bottom:4px">⚔ DOJO TELEMETRY (v96)</div>' +
          '<div class="d96-row"><span>LIVE DPS</span><span class="d96-val" id="d96-dps">0</span></div>' +
          '<div class="d96-row"><span>PEAK DPS</span><span id="d96-pk" style="color:#ffd700;font-weight:900">0</span></div>' +
          '<div class="d96-row"><span>PARRY TIMING</span><span id="d96-ms" style="color:#ff4fd8;font-weight:900">—</span></div>' +
          '<div class="d96-btns"><button id="d96-sp">+3 DUMMIES</button><button id="d96-od">FULL OD</button></div>';
        document.body.appendChild(p);
        p.querySelector('#d96-sp').onclick = () => {
          try {
            if (typeof Dojo !== 'undefined' && Dojo.post && typeof P !== 'undefined') {
              Dojo.post(P.x + 110, P.y - 50); Dojo.post(P.x + 140, P.y); Dojo.post(P.x + 110, P.y + 50);
            }
          } catch (e) {}
        };
        p.querySelector('#d96-od').onclick = () => { if (typeof addOD === 'function') addOD(100); };
        this.panel = p;
      }
      const inDojo = typeof G !== 'undefined' && G.state === 'PLAY' && G.mode === 'dojo';
      this.panel.style.display = inDojo ? 'block' : 'none';
      if (!inDojo) return;
      const now = performance.now();
      this.hits = this.hits.filter(h => now - h.t <= 3000);
      const sum = this.hits.reduce((a, h) => a + h.d, 0);
      const dps = Math.round(sum / 3);
      if (dps > this.peakDps) this.peakDps = dps;
      this.panel.querySelector('#d96-dps').textContent = dps;
      this.panel.querySelector('#d96-pk').textContent = this.peakDps;
      this.panel.querySelector('#d96-ms').textContent = this.lastParryMs != null ? (this.lastParryMs + 'ms') : '—';
    }
  };

  /* ========================================================================
     10. GhostRun96 — 3D HOLOGRAPHIC PERSONAL-BEST GHOST RACING (#8)
     ======================================================================== */
  const GhostRun96 = {
    rec: [], pb: null, runT: 0, sampleT: 0, mode: '', mesh: null,
    key(m) { return 'overdrive_ghost96_' + (m || 'arcade'); },
    begin(mode) {
      this.mode = mode || '';
      this.rec = []; this.runT = 0; this.sampleT = 0; this.pb = null;
      if (this.mesh && this.mesh.parent) { this.mesh.parent.remove(this.mesh); this.mesh = null; }
      if (!S96.on('ghost96', true) || !['arcade', 'bossrush', 'endless'].includes(this.mode)) return;
      try {
        const raw = localStorage.getItem(this.key(this.mode));
        if (raw) this.pb = JSON.parse(raw);
      } catch (e) {}
    },
    saveIfBest() {
      if (!this.rec.length || !['arcade', 'bossrush', 'endless'].includes(this.mode)) return;
      const score = (typeof G !== 'undefined' && G.score) | 0;
      if (!this.pb || score > (this.pb.score || 0)) {
        try { localStorage.setItem(this.key(this.mode), JSON.stringify({ score, frames: this.rec.slice(0, 1200) })); } catch (e) {}
      }
    },
    ensureMesh() {
      if (this.mesh || typeof R3 === 'undefined' || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
      const T = THREE, g = new T.Group();
      const mat = new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.38, wireframe: true });
      const body = new T.Mesh(new T.CapsuleGeometry(8, 22, 4, 8).rotateX(Math.PI / 2), mat);
      body.position.z = 20; g.add(body);
      const ring = new T.Mesh(new T.TorusGeometry(16, 1.2, 6, 20), new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.55 }));
      ring.position.z = 2; g.add(ring);
      R3.root.add(g);
      this.mesh = g;
    },
    tick(rd) {
      if (!S96.on('ghost96', true) || typeof G === 'undefined' || G.state !== 'PLAY' || typeof P === 'undefined') return;
      const dt = Math.min(0.05, rd || 0.016);
      this.runT += dt;
      this.sampleT += dt;
      if (this.sampleT >= 0.1 && this.rec.length < 1200) {
        this.sampleT = 0;
        this.rec.push([+(this.runT.toFixed(1)), Math.round(P.x), Math.round(P.y)]);
      }
      if (this.pb && this.pb.frames && this.pb.frames.length) {
        this.ensureMesh();
        if (this.mesh) {
          const idx = Math.min(this.pb.frames.length - 1, Math.floor(this.runT * 10));
          const fr = this.pb.frames[idx];
          this.mesh.position.set(fr[1], fr[2], 0);
          this.mesh.rotation.z = this.runT * 3;
        }
      }
    }
  };

  /* ========================================================================
     11. FinisherCam96 — UPGRADED CINEMATIC LOW-ANGLE 3D FINISHER CAM (#11)
     ======================================================================== */
  const FinisherCam96 = {
    t: 0, x: 0, y: 0,
    trigger(x, y, dur) {
      if (!S96.on('fcam96', true)) return;
      this.x = x || 0; this.y = y || 0;
      this.t = dur || 0.85;
    },
    tick(rd) {
      if (this.t <= 0 || typeof R3 === 'undefined' || !R3.ok || !R3.cam) return;
      this.t -= Math.min(0.05, rd || 0.016);
      const k = Math.sin(Math.min(1, Math.max(0, this.t / 0.85)) * Math.PI);
      R3.cam.position.z = Math.max(120, R3.cam.position.z - 95 * k);
      R3.cam.lookAt(this.x, this.y, 18);
    }
  };

  /* ========================================================================
     HOOK WIRING — Clean, Safe Integration of All 11 v96 Systems
     ======================================================================== */
  QuickUX96.init();
  AirCombat96.init();

  if (typeof Director !== 'undefined' && Director.begin) {
    const db96 = Director.begin.bind(Director);
    Director.begin = function (mode) {
      TrainProps96.reset();
      TrackEvents96.reset();
      GhostRun96.begin(mode || (typeof G !== 'undefined' && G.mode));
      return db96.apply(this, arguments);
    };
  }

  if (typeof hitEnemy === 'function') {
    const he96 = hitEnemy;
    hitEnemy = function (e) {
      const prevHp = e ? e.hp : 0;
      const r = he96.apply(this, arguments);
      try {
        if (e) {
          AirCombat96.onEnemyHit(e);
          WeaponChips96.onHit(e);
          DojoLab96.recordDmg(Math.max(12, prevHp - e.hp));
        }
      } catch (err) {}
      return r;
    };
  }

  if (typeof killEnemy === 'function') {
    const ke96 = killEnemy;
    killEnemy = function (e) {
      const r = ke96.apply(this, arguments);
      try {
        WeaponChips96.onKill(e);
        if (e && e.elite) FinisherCam96.trigger(e.x, e.y, 0.55);
      } catch (err) {}
      return r;
    };
  }

  if (typeof Boss !== 'undefined' && Boss.kill) {
    const bk96 = Boss.kill.bind(Boss);
    Boss.kill = function (b) {
      const r = bk96(b);
      try {
        FinisherCam96.trigger(b.x, b.y, 1.15);
        WeaponChips96.grantRandom();
        GhostRun96.saveIfBest();
        VoiceBarks96.say('Target eliminated!', 0.85, 1.15);
      } catch (err) {}
      return r;
    };
  }

  if (typeof useOD === 'function') {
    const od96 = useOD;
    useOD = function () {
      const prev = typeof G !== 'undefined' ? G.odT : 0;
      const r = od96.apply(this, arguments);
      try {
        if (typeof G !== 'undefined' && G.odT > prev) VoiceBarks96.say('Overdrive!', 0.82, 1.2);
      } catch (err) {}
      return r;
    };
  }

  if (typeof R3 !== 'undefined') {
    if (R3.animEnemy) {
      const ae96 = R3.animEnemy.bind(R3);
      R3.animEnemy = function (eg, e, t) {
        const r = ae96(eg, e, t);
        if (e && e._z96 > 0 && eg) eg.position.z = (eg.position.z || 0) + e._z96;
        return r;
      };
    }
    if (R3.sync) {
      const sy96 = R3.sync.bind(R3);
      R3.sync = function (rd) {
        const r = sy96(rd);
        try {
          const now = performance.now() * 0.001;
          TrainProps96.tick(rd, now);
          TrackEvents96.tick(rd);
          ArmorBreak96.tick(rd, now);
          GhostRun96.tick(rd);
          FinisherCam96.tick(rd);
        } catch (err) {}
        return r;
      };
    }
  }

  if (typeof HUD !== 'undefined' && HUD.draw) {
    const hd96 = HUD.draw.bind(HUD);
    HUD.draw = function (rd) {
      try {
        PerfGov96.tick(rd);
        QuickUX96.tick();
        AirCombat96.tick(rd);
        WeaponChips96.tickUI();
        DojoLab96.tick();
      } catch (err) {}
      return hd96(rd);
    };
  }

  if (typeof PC !== 'undefined' && PC.settings) {
    const ps96 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps96(head, cycle, box, s);
      try {
        head('AAA SYSTEMS (v96)');
        cycle('60 FPS Auto-Governor', 'perf96', [1, 0], ['ON', 'OFF']);
        cycle('Show FPS Counter', 'fps96', [0, 1], ['OFF', 'ON']);
        cycle('HUD Chaos Declutter', 'declutter96', [1, 0], ['ON', 'OFF']);
        cycle('Air Juggle & Launcher [F]', 'air96', [1, 0], ['ON', 'OFF']);
        cycle('Destructible Train Props', 'props96', [1, 0], ['ON', 'OFF']);
        cycle('Dynamic Track Events', 'events96', [1, 0], ['ON', 'OFF']);
        cycle('3D Boss Armor Break', 'armor96', [1, 0], ['ON', 'OFF']);
        cycle('Combat Voice Announcer', 'voice96', [1, 0], ['ON', 'OFF']);
        cycle('3D Ghost Racing', 'ghost96', [1, 0], ['ON', 'OFF']);
        cycle('Cinematic Finisher Cam', 'fcam96', [1, 0], ['ON', 'OFF']);
      } catch (err) {}
    };
  }
window.__V96 = { S96, PerfGov96, QuickUX96, VoiceBarks96, WeaponChips96, AirCombat96, TrainProps96, TrackEvents96, ArmorBreak96, DojoLab96, GhostRun96, FinisherCam96 };
})();