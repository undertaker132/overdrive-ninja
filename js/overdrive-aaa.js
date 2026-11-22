/* ==========================================================================
   OVERDRIVE: CYBER SLASH — UNIFIED AAA ENGINE BUNDLE (v100.0 PRO)
   Consolidated & conflict-free single-file bundle:
     - v96 Core AAA Systems (60 FPS Governor, Air Juggle, Train Props, Chips, Dojo, Ghosts)
     - v97 7-Topic Master Polish (Zero DOM-thrashing, Roster Archetypes, 1.6x Armor Break)
     - v98 Masterwork Visuals & UX (Cyber-Anime 3D Body, Pure 3D Bosses, Clean Home & 5-Tab Settings, AAA Crates)
     - v100 Definitive Animations (3D Blade Ribbons, Weapon Stances, Braking Slides, 360° Somersault, Hit-Recoil & Boss Cinema)
   ========================================================================== */

/* --- MODULE 1: v96 (reworked in v98/v103: rules in the simulation step, recorded input) --- */
/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 96 SYSTEMS (reworked in 98)
     PerfGov96     — FPS badge (the resolution itself stays with the game's own governor)
     QuickUX96     — HUD declutter in a big combo (the pause menu already restarts: [R] / RESTART)
     VoiceBarks96  — combat announcer
     WeaponChips96 — boss-drop weapon chips (2 slots)
     AirCombat96   — launcher / helm breaker [F], air juggle
     TrainProps96  — destructible roof props (plasma barrel, tesla pylon, neon sign)
     TrackEvents96 — rail events (dark tunnel, lightning storm, ambush)
     ArmorBreak96  — boss armor breaks at 72% health: 10 s of 1.6x damage and a 1.4 s stagger
     GhostRun96    — personal-best ghost
     FinisherCam96 — finisher camera
   v98: every rule here runs in the simulation step (Sim98.steps), rolls its dice through R,
   reads the settings recorded for the run (Sim98.on) and deals its damage through
   damageEnemy, on the game's own health scale (most enemies have 1-3). The [F] key is a
   recorded action (RA.LAUNCH). The 3D props, plates and ghost are drawn from that state
   in R3.render (R3 has no sync()), with shared geometries and materials.
   ========================================================================== */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "AAA SYSTEMS (v96)": "מערכות AAA מתקדמות (v96)",
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
      "ARMOR BREAK!": "שריון נשבר!",
      "AIR JUGGLE": "קומבו אווירי",
      "HELM BREAKER!": "הנחתת להב!",
      "DARK TUNNEL AHEAD": "כניסה למנהרה חשוכה",
      "LIGHTNING STORM": "סופת ברקים על המסילה",
      "PARALLEL TRAIN AMBUSH": "מארב מרכבת מקבילה!",
      "NEEDS A CHARGE": "צריך מטען",
      "GAMEPLAY": "משחקיות",
      "Roof Set-Pieces": "אירועי גג",
      "Blade Clash": "התנגשות להבים",
      "Shadow Rival": "יריב הצללים",
      "Awakened Blade": "הלהב המתעורר",
      "Synergies": "סינרגיות",
      "Enemy Squads": "חוליות אויבים"
    });
    if (typeof AR !== 'undefined') Object.assign(AR, { "AAA SYSTEMS (v96)": "أنظمة AAA المتقدمة (v96)", "CHIPS": "شرائح" });
    if (typeof RU !== 'undefined') Object.assign(RU, { "AAA SYSTEMS (v96)": "AAA-СИСТЕМЫ (v96)", "CHIPS": "ЧИПЫ" });
  } catch (e) {}

  const S96 = {
    on(k, defVal) { // a display setting (live, the viewer's own)
      try {
        const s = Store && Store.data && Store.data.settings;
        if (!s || s[k] == null) return defVal == null ? true : !!defVal;
        return !!s[k];
      } catch (e) { return defVal == null ? true : !!defVal; }
    },
    isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
    L(s) { return typeof lt === 'function' ? lt(s) : s; }
  };
  const base = () => ((P.w && P.w.dmg) || 1) * (P.dmgMul || 1) * (G.dmgMod || 1); // (one slash's damage)
  const quiet = () => REPLAY.fast || (typeof Aud !== 'undefined' && Aud.quiet);
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const setShow = (el, on, disp) => { const v = on ? (disp || 'block') : 'none'; if (el && el.style.display !== v) el.style.display = v; };

  /* ---------------- PerfGov96 — FPS badge ---------------- */
  const PerfGov96 = {
    frames: 0, acc: 0, fps: 60, badge: null,
    tick(rd) {
      this.frames++; this.acc += Math.max(0.001, Math.min(0.1, rd || 0.016));
      if (this.acc < 0.6) return;
      this.fps = Math.round(this.frames / this.acc); this.frames = 0; this.acc = 0;
      const show = S96.on('fps96', false);
      if (!this.badge) { if (!show) return; const b = document.createElement('div'); b.id = 'fps96-badge'; document.body.appendChild(b); this.badge = b; }
      setShow(this.badge, show);
      if (show) { setTxt(this.badge, this.fps + ' FPS'); this.badge.style.color = this.fps >= 55 ? '#00ff9d' : this.fps >= 40 ? '#ffd700' : '#ff0844'; }
    }
  };

  /* ---------------- QuickUX96 — declutter ---------------- */
  const QuickUX96 = {
    dc: false,
    tick() {
      const on = S96.on('declutter96', true) && G.state === 'PLAY' && (G.combo | 0) >= 12;
      if (on !== this.dc) { this.dc = on; document.body.classList.toggle('declutter96', on); }
    }
  };

  /* ---------------- VoiceBarks96 ---------------- */
  const VoiceBarks96 = {
    lastT: 0,
    say(text, pitch, rate) {
      if (!S96.on('voice96', true) || quiet()) return;
      const now = performance.now();
      if (now - this.lastT < 1300) return;
      this.lastT = now;
      try {
        if (typeof speechSynthesis === 'undefined') return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.pitch = pitch != null ? pitch : 0.88; u.rate = rate != null ? rate : 1.18; u.volume = 0.72;
        speechSynthesis.speak(u);
      } catch (e) {}
    }
  };

  /* ---------------- WeaponChips96 ---------------- */
  const WeaponChips96 = {
    CHIPS: [
      { id: 'volt',  name: 'VOLT COIL',      he: 'סליל ברקים',    col: '#00f2fe', desc: '28% chance on a dash hit to chain lightning to a nearby foe.', heDesc: '28% סיכוי בפגיעת דאש לשרשרת ברק לאויב סמוך.' },
      { id: 'vamp',  name: 'VAMPIRIC EDGE',  he: 'להב ערפדי',     col: '#ff0844', desc: 'Restore +1 HP every 14 kills.', heDesc: 'משחזר +1 חיים על כל 14 חיסולים.' },
      { id: 'aegis', name: 'AEGIS FRAME',    he: 'מסגרת אגיס',    col: '#00ff9d', desc: '+35% wider dash crit window.', heDesc: '+35% הרחבת חלון הקריט של הדאש.' },
      { id: 'crit',  name: 'OVERCLOCK CRIT', he: 'קריט אוברקלוק', col: '#ffd700', desc: '+24% damage on dash hits at Combo 10 or higher.', heDesc: '+24% נזק בפגיעות דאש בקומבו 10 ומעלה.' },
      { id: 'sky',   name: 'SKY MASTER',     he: 'שליט האוויר',   col: '#ff4fd8', desc: '+45% Air Juggle damage & higher launch lift.', heDesc: '+45% נזק בקומבו אווירי ושיגור גבוה יותר.' }
    ],
    killCnt: 0, btnEl: null, modalEl: null,
    data() {
      const s = (typeof Store !== 'undefined' && Store.data && Store.data.settings) || {};
      if (!s.chips96) s.chips96 = { owned: ['volt', 'sky'], eq: ['volt'] };
      return s.chips96;
    },
    grantRandom() { // (a meta reward, outside the simulation: never in a replay)
      if (REPLAY.on) return;
      const d = this.data(), locked = this.CHIPS.filter(c => !d.owned.includes(c.id));
      if (!locked.length) return;
      const pick = locked[Math.floor(Math.random() * locked.length)];
      d.owned.push(pick.id);
      try { Store.touch(); } catch (e) {}
      FX.call('💎 ' + (S96.isHe() ? 'צ׳יפ חדש: ' + pick.he : 'CHIP DROP: ' + pick.name), pick.col, 3, 22);
      VoiceBarks96.say('Tech chip acquired!', 1.05, 1.15);
    },
    onHit(e) { // (a dash hit, in the simulation)
      if (!simV(98) || !e) return;
      if (e.alive && Sim98.chip('crit') && (G.combo | 0) >= 10) { damageEnemy(e, 0.24 * base(), -Math.PI / 2, 1); if (!REPLAY.fast) FX.spark(e.x, e.y, '#ffd700', 4); }
      if (Sim98.chip('volt') && R.f() < 0.28) {
        let best = null, bd = 210;
        for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (!o.alive || o === e || o.al > 0) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
        if (best) { damageEnemy(best, 0.5 * base(), Math.atan2(best.y - e.y, best.x - e.x), 1); if (!REPLAY.fast) { FX.spark(best.x, best.y, '#00f2fe', 8); FX.ring(best.x, best.y, 26, '#00f2fe', 3); } }
      }
    },
    onKill(e) {
      if (simV(98) && Sim98.chip('vamp')) {
        this.killCnt++;
        if (this.killCnt >= 14) { this.killCnt = 0; if (P.hp < P.maxHp) { P.hp = Math.min(P.maxHp, P.hp + 1); if (!REPLAY.fast) FX.text(P.x, P.y - 24, '+1 HP', '#00ff9d', 14); } }
      }
      if (e && e.elite && !REPLAY.on && Math.random() < 0.35) this.grantRandom();
    },
    openModal() {
      if (!this.modalEl) {
        const m = document.createElement('div'); m.className = 'modal92-bg';
        m.onclick = ev => { if (ev.target === m) m.classList.remove('on'); };
        document.body.appendChild(m); this.modalEl = m;
      }
      const d = this.data(), he = S96.isHe();
      const rows = this.CHIPS.map(c => {
        const own = d.owned.includes(c.id), eq = d.eq.includes(c.id);
        return '<div class="chip96-card ' + (eq ? 'eq' : '') + (own ? '' : ' locked') + '">' +
          '<div><div style="font-weight:900;font-size:13px;color:' + c.col + '">💎 ' + (he ? c.he : c.name) + '</div>' +
          '<div style="font-size:11px;opacity:.82">' + (he ? c.heDesc : c.desc) + '</div></div>' +
          (own ? '<button class="modal92-close" data-cid="' + c.id + '" style="border-color:' + (eq ? '#00ff9d' : '#ffd700') + ';color:' + (eq ? '#00ff9d' : '#ffd700') + '">' + (eq ? (he ? 'מצויד ✓' : 'EQUIPPED ✓') : (he ? 'שבץ' : 'EQUIP')) + '</button>'
               : '<span style="font-size:10px;opacity:.7">' + (he ? 'נופל מבוסים' : 'BOSS DROP') + '</span>') + '</div>';
      }).join('');
      this.modalEl.innerHTML =
        '<div class="modal92-box"><div class="modal92-head"><h3>💎 ' + S96.L('WEAPON CHIPS (v96)') + ' (' + d.eq.length + '/2)</h3><button class="modal92-close" id="c96-x">✕</button></div>' +
        '<p style="font-size:12px;opacity:.82;margin:0 0 10px">' + (he ? 'שבץ עד 2 צ׳יפים טקטיים בנשק שלך. בוסים ואויבי עילית מפילים צ׳יפים נדירים נוספים. השינוי חל מהריצה הבאה.' : 'Socket up to 2 tactical chips into your weapon. Defeat Bosses & Elites to unlock more. Changes apply from your next run.') + '</p>' + rows + '</div>';
      this.modalEl.querySelector('#c96-x').onclick = () => this.modalEl.classList.remove('on');
      this.modalEl.querySelectorAll('button[data-cid]').forEach(b => {
        b.onclick = () => {
          const cid = b.getAttribute('data-cid'), idx = d.eq.indexOf(cid);
          if (idx >= 0) d.eq.splice(idx, 1); else { if (d.eq.length >= 2) d.eq.shift(); d.eq.push(cid); }
          try { Store.touch(); } catch (e) {}
          this.openModal();
        };
      });
      this.modalEl.classList.add('on');
    },
    tickUI() { // (the menu loop: the title screen)
      if (!this.btnEl) { const b = document.createElement('button'); b.id = 'chips96-btn'; b.onclick = () => this.openModal(); document.body.appendChild(b); this.btnEl = b; }
      const onTitle = UI.cur === 'title' && G.state !== 'PLAY';
      setShow(this.btnEl, onTitle);
      if (onTitle) setTxt(this.btnEl, '💎 ' + S96.L('CHIPS') + ' (' + this.data().eq.length + '/2)');
    }
  };

  /* ---------------- AirCombat96 — launcher / helm breaker [F] ---------------- */
  const AirCombat96 = {
    cd: 0, juggleCount: 0, btnEl: null,
    reset() { this.cd = 0; this.juggleCount = 0; },
    init() {
      window.addEventListener('keydown', e => {
        if (e.repeat || e.code !== 'KeyF' || G.state !== 'PLAY') return;
        if (typeof BladeClash91 !== 'undefined' && BladeClash91.active) return; // ([F] mashes a blade clash)
        e.preventDefault(); this.press();
      });
    },
    hasAirborne() { for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && (e._z96 || 0) > 10) return true; } return false; },
    ready() { return this.cd <= 0 && P.ch >= 1; },
    press() { // the live key or button: a recorded action, applied at once
      if (REPLAY.on || G.state !== 'PLAY' || !Sim98.on('air96')) return;
      if (!this.ready()) { FX.text(P.x, P.y - 30, S96.L('NEEDS A CHARGE'), '#8890a8', 12); return; }
      REC.act(RA.LAUNCH); this.act();
    },
    act() { // (between two simulation steps, live and in a replay alike)
      if (!Sim98.on('air96') || G.state !== 'PLAY' || !this.ready()) return;
      P.ch -= 1; // a launcher or a slam spends one dash charge
      const sky = Sim98.chip('sky') ? 1.45 : 1, dmg = base() * sky;
      if (this.hasAirborne()) { // HELM BREAKER: everything in the air is slammed down
        this.cd = 0.65; let n = 0;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i]; if (!e.alive || !(e._z96 > 6)) continue;
          e._z96 = 0; e._vz96 = 0; damageEnemy(e, 1.6 * dmg, Math.PI / 2, 1); n++;
          if (!REPLAY.fast) { FX.ring(e.x, e.y, 95, '#ffd700', 7); FX.spark(e.x, e.y, '#ffd700', 18); }
        }
        if (n) { this.juggleCount = 0; if (!REPLAY.fast) { shake(0.8); FX.call('⚡ ' + S96.L('HELM BREAKER!'), '#ffd700', 3, 24); Aud.sfx('boom'); } VoiceBarks96.say('Helm Breaker!', 0.85, 1.25); }
      } else { // RISING FANG: everything near is thrown into the air
        this.cd = 0.5; let n = 0; const lift = Sim98.chip('sky') ? 390 : 320;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i]; if (!e.alive || e.al > 0 || Math.hypot(e.x - P.x, e.y - P.y) > 155) continue;
          e._z96 = Math.max(e._z96 || 0, 14); e._vz96 = lift; damageEnemy(e, 0.45 * dmg, Math.atan2(e.y - P.y, e.x - P.x), 1); n++;
          if (!REPLAY.fast) FX.spark(e.x, e.y, '#00f2fe', 10);
        }
        if (n) { this.juggleCount = 1; if (!REPLAY.fast) { FX.ring(P.x, P.y, 130, '#00f2fe', 5); FX.text(P.x, P.y - 34, 'LAUNCH! [F]', '#00f2fe', 16); Aud.sfx('slash'); } }
      }
    },
    onEnemyHit(e) { // (a dash hit on an enemy in the air keeps it up)
      if (!e || !e.alive || !(e._z96 > 6) || !Sim98.on('air96')) return;
      e._vz96 = Math.max(e._vz96 || 0, 250);
      P.ch = Math.min(P.maxCh, P.ch + 0.35); G.hs = Math.max(G.hs || 0, 0.032);
      damageEnemy(e, 0.3 * base() * (Sim98.chip('sky') ? 1.45 : 1.25), -Math.PI / 2, 1);
      this.juggleCount++;
      if (!REPLAY.fast) { FX.text(e.x, e.y - 38, S96.L('AIR JUGGLE') + ' x' + this.juggleCount, '#ff4fd8', 15); FX.spark(e.x, e.y, '#ff4fd8', 8); }
      if (this.juggleCount === 3) VoiceBarks96.say('Air Combo!', 1.05, 1.22);
    },
    simStep(dt) {
      if (this.cd > 0) this.cd -= dt;
      for (let i = 0; i < EN.n; i++) {
        const e = EN.a[i]; if (!e.alive || !(e._z96 > 0 || e._vz96 > 0)) continue;
        e._vz96 = (e._vz96 || 0) - 720 * dt; e._z96 = Math.max(0, (e._z96 || 0) + e._vz96 * dt); if (e._z96 <= 0) e._vz96 = 0;
      }
    },
    tick() { // the on-screen button (drawing side)
      if (!this.btnEl) { const b = document.createElement('button'); b.id = 'air96-btn'; b.onclick = () => this.press(); document.body.appendChild(b); this.btnEl = b; }
      const show = S96.on('air96', true) && G.state === 'PLAY' && !G.photo && !REPLAY.on;
      setShow(this.btnEl, show);
      if (!show) return;
      const air = this.hasAirborne();
      this.btnEl.classList.toggle('slam', air); this.btnEl.classList.toggle('off', !this.ready());
      setTxt(this.btnEl, air ? '⚡ SLAM [F]' : '▲ LAUNCH [F]');
    }
  };

  /* ---------------- TrainProps96 — destructible roof props ---------------- */
  const TrainProps96 = {
    props: [], spawnT: null, seq: 1, meshes: new Map(), G3: null,
    reset() { this.props = []; this.spawnT = null; this.clearMeshes(); },
    simStep(dt) {
      if (!Sim98.on('props96') || G.state !== 'PLAY' || G.mode === 'puzzle' || G.mode === 'dojo') return;
      if (this.spawnT == null) this.spawnT = 2.5 + R.f() * 2;
      this.spawnT -= dt;
      if (this.spawnT <= 0 && this.props.length < 3) { this.spawnOne(); this.spawnT = 10 + R.f() * 6; }
      for (const pr of this.props) if (pr.alive && P.dashT > 0 && Math.hypot(P.x - pr.x, P.y - pr.y) <= pr.r + 44) this.detonate(pr);
      this.props = this.props.filter(p => p.alive);
    },
    spawnOne() { // on the roof, away from the hero
      const kinds = ['barrel', 'tesla', 'neon'], kind = kinds[(R.f() * 3) | 0];
      const minX = V.L + 32, maxX = V.R - 32, minY = 120, maxY = Math.max(260, V.VH - 130);
      let x = (minX + maxX) / 2, y = (minY + maxY) / 2;
      for (let k = 0; k < 8; k++) { const tx = minX + R.f() * Math.max(20, maxX - minX), ty = minY + R.f() * Math.max(40, maxY - minY); if (Math.hypot(tx - P.x, ty - P.y) > 95) { x = tx; y = ty; break; } }
      this.props.push({ id: this.seq++, kind, x, y, r: 28, alive: true });
    },
    detonate(pr) {
      pr.alive = false;
      const fx = !REPLAY.fast;
      if (pr.kind === 'barrel') {
        if (fx) { FX.ring(pr.x, pr.y, 175, '#ff6a00', 9); FX.spark(pr.x, pr.y, '#ffd700', 26); FX.text(pr.x, pr.y - 26, 'PLASMA BLAST!', '#ff6a00', 16); shake(0.75); Aud.sfx('boom'); }
        for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || Math.hypot(e.x - pr.x, e.y - pr.y) > 185) continue; e._z96 = 16; e._vz96 = 260; damageEnemy(e, 2 * (G.dmgMod || 1), Math.atan2(e.y - pr.y, e.x - pr.x), 1); }
      } else if (pr.kind === 'tesla') {
        if (fx) { FX.ring(pr.x, pr.y, 210, '#00f2fe', 7); FX.spark(pr.x, pr.y, '#00f2fe', 24); FX.text(pr.x, pr.y - 26, 'TESLA SHOCK!', '#00f2fe', 16); Aud.sfx('zap'); }
        let n = 0;
        for (let i = 0; i < EN.n && n < 5; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || Math.hypot(e.x - pr.x, e.y - pr.y) > 230) continue; e.stun = Math.max(e.stun || 0, 1.8); damageEnemy(e, 1.5 * (G.dmgMod || 1), Math.atan2(e.y - pr.y, e.x - pr.x), 1); n++; if (fx) FX.spark(e.x, e.y, '#00f2fe', 10); }
      } else { // a neon sign: overdrive and score (no credits: those come with the run's own results)
        addOD(14); G.score += Math.round(300 * (G.scoreMul || 1));
        if (fx) { FX.ring(pr.x, pr.y, 110, '#ff4fd8', 6); FX.spark(pr.x, pr.y, '#ff4fd8', 22); FX.text(pr.x, pr.y - 24, '+OD', '#ff4fd8', 15); Aud.sfx('glass'); }
      }
    },
    /* the 3D side: one mesh per prop, from shared geometries and materials */
    geo() {
      if (this.G3) return this.G3; const T = THREE;
      return (this.G3 = {
        ring: new T.TorusGeometry(19, 1.4, 6, 24), barrel: new T.CylinderGeometry(11, 11, 24, 12).rotateX(Math.PI / 2), band: new T.TorusGeometry(11.4, 1.4, 6, 16),
        pole: new T.CylinderGeometry(4, 6, 36, 8).rotateX(Math.PI / 2), orb: new T.OctahedronGeometry(8.5, 0), sign: new T.BoxGeometry(4, 34, 28), frame: new T.BoxGeometry(5, 36, 30),
        m: { ringB: new T.MeshBasicMaterial({ color: 0xff6a00, transparent: true, opacity: .65 }), ringT: new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: .65 }), ringN: new T.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: .65 }),
          barrel: new T.MeshStandardMaterial({ color: 0xff3b2f, emissive: 0xff4500, emissiveIntensity: .5, metalness: .5, roughness: .3 }), gold: new T.MeshBasicMaterial({ color: 0xffd700 }),
          pole: new T.MeshStandardMaterial({ color: 0x1a2238, metalness: .8, roughness: .25 }), orb: new T.MeshBasicMaterial({ color: 0x00f2fe }),
          sign: new T.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: .86 }), frame: new T.MeshStandardMaterial({ color: 0x101426, wireframe: true }) }
      });
    },
    build(pr) {
      const T = THREE, g = this.geo(), M = g.m, grp = new T.Group(), add = (geo, mat, z) => { const m = new T.Mesh(geo, mat); m.position.z = z; grp.add(m); return m; };
      add(g.ring, pr.kind === 'barrel' ? M.ringB : pr.kind === 'tesla' ? M.ringT : M.ringN, 2);
      if (pr.kind === 'barrel') { add(g.barrel, M.barrel, 12); add(g.band, M.gold, 13); }
      else if (pr.kind === 'tesla') { add(g.pole, M.pole, 18); grp._orb = add(g.orb, M.orb, 38); }
      else { add(g.sign, M.sign, 18); add(g.frame, M.frame, 18); }
      grp.position.set(pr.x, pr.y, 0); R3.root.add(grp); return grp;
    },
    clearMeshes() { for (const m of this.meshes.values()) if (m.parent) m.parent.remove(m); this.meshes.clear(); },
    render(t) {
      if (!R3.ok || !R3.root) return;
      const live = new Set();
      for (const pr of this.props) { if (!pr.alive) continue; live.add(pr.id); let m = this.meshes.get(pr.id); if (!m) { m = this.build(pr); this.meshes.set(pr.id, m); } if (m._orb) m._orb.rotation.z = t * 4.5; }
      for (const [id, m] of this.meshes) if (!live.has(id)) { if (m.parent) m.parent.remove(m); this.meshes.delete(id); }
    }
  };

  /* ---------------- TrackEvents96 — rail events ---------------- */
  const TrackEvents96 = {
    cd: null, cur: null, left: 0, strikeT: 0, bannerEl: null, shown: null, tunnelMix: 0, stormFlash: 0, strikes: 0, seenStrikes: 0,
    reset() { this.cd = null; this.cur = null; this.left = 0; this.shown = null; this.tunnelMix = 0; this.stormFlash = 0; this.strikes = this.seenStrikes = 0; },
    simStep(dt) {
      if (!Sim98.on('events96') || G.state !== 'PLAY' || G.mode === 'dojo' || G.mode === 'puzzle') return;
      if (this.cd == null) this.cd = 24 + R.f() * 6;
      if (!this.cur) {
        this.cd -= dt;
        if (this.cd <= 0 && !(typeof SetPieces91 !== 'undefined' && SetPieces91.cur)) { // (one rail event at a time)
          this.cur = ['tunnel', 'storm', 'ambush'][(R.f() * 3) | 0];
          this.left = this.cur === 'ambush' ? 6 : 11; this.strikeT = 1.5;
        }
        return;
      }
      this.left -= dt;
      if (this.cur === 'storm') {
        this.strikeT -= dt;
        if (this.strikeT <= 0) {
          this.strikeT = 2.2; this.strikes++;
          const sx = V.L + 26 + R.f() * Math.max(20, V.R - V.L - 52), sy = 100 + R.f() * Math.max(40, V.VH - 210);
          if (!REPLAY.fast) { FX.ring(sx, sy, 92, '#9fd8ff', 6); FX.spark(sx, sy, '#ffffff', 16); if (typeof Cinema3D89 !== 'undefined') Cinema3D89.flash(sx, sy, '#9fd8ff', 950, 0.3); }
          for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && Math.hypot(e.x - sx, e.y - sy) <= 95) damageEnemy(e, 2 * (G.dmgMod || 1), Math.atan2(e.y - sy, e.x - sx), 1); }
        }
      }
      if (this.left <= 0) { this.cur = null; this.cd = 34; }
    },
    /* the picture: banner, and the light through the renderer's exposure (R3 sets its own lights every frame) */
    render(rd) {
      const dt = Math.min(0.05, rd || 0.016), c = G.state === 'PLAY' ? this.cur : null;
      if (c !== this.shown) {
        this.shown = c;
        if (c && !CALM) {
          if (!this.bannerEl) { const d = document.createElement('div'); d.id = 'event96-banner'; document.body.appendChild(d); this.bannerEl = d; }
          this.bannerEl.textContent = '⚠ ' + S96.L(c === 'tunnel' ? 'DARK TUNNEL AHEAD' : c === 'storm' ? 'LIGHTNING STORM' : 'PARALLEL TRAIN AMBUSH');
          this.bannerEl.classList.add('on'); clearTimeout(this.bT); this.bT = setTimeout(() => this.bannerEl && this.bannerEl.classList.remove('on'), 3200);
        }
      }
      if (this.strikes !== this.seenStrikes) { this.seenStrikes = this.strikes; this.stormFlash = 1; }
      this.tunnelMix += ((c === 'tunnel' ? 1 : 0) - this.tunnelMix) * Math.min(1, dt * 3.2);
      this.stormFlash = Math.max(0, this.stormFlash - dt * 4.5);
    },
    exposure() { // (applied right before R3 draws)
      let k = 1 - 0.6 * this.tunnelMix + 0.8 * this.stormFlash;
      const s91 = typeof SetPieces91 !== 'undefined' && SetPieces91.cur;
      if (s91 && s91.type === 'tunnel') k *= 1 - 0.55 * Math.sin(Math.min(1, s91.t / s91.d) * Math.PI);
      return CALM ? Math.max(k, 0.7) : k;
    }
  };

  /* ---------------- ArmorBreak96 ---------------- */
  const ArmorBreak96 = {
    flying: [], G3: null,
    simStep(dt) {
      if (!Sim98.on('armor96')) return;
      const b = Boss.cur; if (!b || b.dying > 0 || !(b.mhp > 0)) return;
      if (!b._arm98 && b.hp / b.mhp <= 0.72) {
        b._arm98 = { t: 10 }; b.stag = Math.max(b.stag || 0, 1.4);
        if (!REPLAY.fast) { FX.call('💥 ' + S96.L('ARMOR BREAK!') + ' 1.6x DMG', '#ffd700', 3, 26); FX.ring(b.x, b.y, (b.r || 40) * 3.5, '#ffd700', 7); shake(0.8); }
        VoiceBarks96.say('Armor Break!', 0.9, 1.2);
      } else if (b._arm98 && b._arm98.t > 0) b._arm98.t -= dt;
    },
    exposed(b) { return !!(b && b._arm98 && b._arm98.t > 0 && Sim98.on('armor96')); },
    get breakTimer() { const b = Boss.cur; return b && b._arm98 && b.dying <= 0 ? Math.max(0, b._arm98.t) : 0; }, // (read by the v101 boss bar)
    geo() { if (this.G3) return this.G3; const T = THREE; return (this.G3 = { plate: new T.BoxGeometry(0.45, 0.55, 0.65), core: new T.OctahedronGeometry(0.42, 0), pm: new T.MeshStandardMaterial({ color: 0x262f48, metalness: 0.82, roughness: 0.24, emissive: 0x00f2fe, emissiveIntensity: 0.25 }), cm: new T.MeshBasicMaterial({ color: 0xffd700 }) }); },
    render(rd, t) {
      if (!S96.on('armor96', true) || !R3.ok) return;
      const dt = Math.min(0.05, rd || 0.016);
      for (const fl of this.flying) { fl.life -= dt; fl.m.position.x += fl.vx * dt; fl.m.position.y += fl.vy * dt; fl.m.position.z = Math.max(2, fl.m.position.z + fl.vz * dt); fl.vz -= 420 * dt; fl.m.rotation.x += 6 * dt; fl.m.rotation.y += 8 * dt; if (fl.life <= 0 && fl.m.parent) fl.m.parent.remove(fl.m); }
      this.flying = this.flying.filter(f => f.life > 0);
      const b = Boss.cur; if (!b || !(b.mhp > 0)) return;
      const ent = R3.ents && R3.ents.get('boss' + b.id + (b.lvl || '')), bg = ent && ent.g; if (!bg) return;
      if (!bg._arm96) { const g = this.geo(), grp = new THREE.Group(), plates = []; for (const s of [-1, 1]) { const pl = new THREE.Mesh(g.plate, g.pm); pl.position.set(0, s * 0.95, 1.25); grp.add(pl); plates.push(pl); } const core = new THREE.Mesh(g.core, g.cm); core.position.set(0.55, 0, 1.15); core.visible = false; grp.add(core); bg.add(grp); bg._arm96 = { plates, core, broken: false }; }
      const ar = bg._arm96, broken = !!b._arm98;
      if (broken && !ar.broken) {
        ar.broken = true; ar.core.visible = true;
        for (const pl of ar.plates) { pl.visible = false; const m = new THREE.Mesh(this.G3.plate, this.G3.pm); m.scale.setScalar((b.r || 42) * 0.85); m.position.set(b.x, b.y, 40); R3.root.add(m); const a = Math.random() * Math.PI * 2; this.flying.push({ m, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, vz: 220, life: 1.5 }); }
      }
      if (ar.broken) { ar.core.rotation.z = t * 6; ar.core.scale.setScalar(this.exposed(b) ? 0.9 + Math.sin(t * 14) * 0.22 : 0.6); }
    }
  };

  /* ---------------- GhostRun96 (display only) ---------------- */
  const GhostRun96 = {
    rec: [], pb: null, runT: 0, sampleT: 0, mode: '', mesh: null,
    key(m) { return 'overdrive_ghost96_' + (m || 'arcade'); },
    begin(mode) {
      this.mode = mode || ''; this.rec = []; this.runT = 0; this.sampleT = 0; this.pb = null;
      if (this.mesh) this.mesh.visible = false;
      if (REPLAY.on || !S96.on('ghost96', true) || !['arcade', 'bossrush', 'endless'].includes(this.mode)) return;
      try { const raw = localStorage.getItem(this.key(this.mode)); if (raw) this.pb = JSON.parse(raw); } catch (e) {}
    },
    saveIfBest() {
      if (REPLAY.on || !this.rec.length || !['arcade', 'bossrush', 'endless'].includes(this.mode)) return;
      const score = G.score | 0;
      if (!this.pb || score > (this.pb.score || 0)) { try { localStorage.setItem(this.key(this.mode), JSON.stringify({ score, frames: this.rec.slice(0, 1200) })); } catch (e) {} }
    },
    tick(rd) {
      if (REPLAY.on || G.state !== 'PLAY' || !S96.on('ghost96', true)) { if (this.mesh) this.mesh.visible = false; return; }
      const dt = Math.min(0.05, rd || 0.016); this.runT += dt; this.sampleT += dt;
      if (this.sampleT >= 0.1 && this.rec.length < 1200) { this.sampleT = 0; this.rec.push([+(this.runT.toFixed(1)), Math.round(P.x), Math.round(P.y)]); }
      if (!(this.pb && this.pb.frames && this.pb.frames.length) || !R3.ok || !R3.root) return;
      if (!this.mesh) {
        const T = THREE, g = new T.Group();
        const body = new T.Mesh(new T.CapsuleGeometry(8, 22, 4, 8).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.38, wireframe: true })); body.position.z = 20; g.add(body);
        const ring = new T.Mesh(new T.TorusGeometry(16, 1.2, 6, 20), new T.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.55 })); ring.position.z = 2; g.add(ring);
        this.mesh = g; // (made once and kept: a run only moves it)
      }
      if (this.mesh.parent !== R3.root) R3.root.add(this.mesh);
      const fr = this.pb.frames[Math.min(this.pb.frames.length - 1, Math.floor(this.runT * 10))];
      this.mesh.visible = true; this.mesh.position.set(fr[1], fr[2], 0); this.mesh.rotation.z = this.runT * 3;
    }
  };

  /* ---------------- FinisherCam96 (display only) ---------------- */
  const FinisherCam96 = {
    t: 0, x: 0, y: 0,
    trigger(x, y, dur) { if (!S96.on('fcam96', true) || REPLAY.fast) return; this.x = x || 0; this.y = y || 0; this.t = dur || 0.85; },
    tick(rd) {
      if (this.t <= 0 || !R3.ok || !R3.cam) return;
      this.t -= Math.min(0.05, rd || 0.016);
      const k = Math.sin(Math.min(1, Math.max(0, this.t / 0.85)) * Math.PI);
      R3.cam.position.z = Math.max(120, R3.cam.position.z - 95 * k);
      R3.cam.lookAt(this.x, this.y, 18);
    }
  };

  /* ========================================================================
     WIRING
     ======================================================================== */
  AirCombat96.init();

  const db96 = Director.begin.bind(Director);
  Director.begin = function (mode) {
    TrainProps96.reset(); TrackEvents96.reset(); AirCombat96.reset(); WeaponChips96.killCnt = 0;
    GhostRun96.begin(mode || G.mode);
    return db96.apply(this, arguments);
  };

  const he96 = hitEnemy;
  hitEnemy = function (e) {
    const r = he96.apply(this, arguments);
    try { if (e) { AirCombat96.onEnemyHit(e); WeaponChips96.onHit(e); } } catch (err) { errLog(err); }
    return r;
  };

  const ke96 = killEnemy;
  killEnemy = function (e) {
    const r = ke96.apply(this, arguments);
    try { WeaponChips96.onKill(e); if (e && e.elite) FinisherCam96.trigger(e.x, e.y, 0.55); } catch (err) { errLog(err); }
    return r;
  };

  const hb96 = Boss.hitBody.bind(Boss);
  Boss.hitBody = function (b, d) { // the exposed core takes 1.6x
    if (ArmorBreak96.exposed(b)) { const a = [].slice.call(arguments); a[1] = d * 1.6; return hb96.apply(this, a); }
    return hb96.apply(this, arguments);
  };

  const bk96 = Boss.kill.bind(Boss);
  Boss.kill = function (b) {
    const r = bk96(b);
    try { FinisherCam96.trigger(b.x, b.y, 1.15); WeaponChips96.grantRandom(); GhostRun96.saveIfBest(); VoiceBarks96.say('Target eliminated!', 0.85, 1.15); } catch (err) { errLog(err); }
    return r;
  };

  const od96 = overdrive; // (there is no useOD: overdrive() starts it)
  overdrive = function () {
    const prev = G.odT, r = od96.apply(this, arguments);
    try { if (G.odT > prev) VoiceBarks96.say('Overdrive!', 0.82, 1.2); } catch (err) {}
    return r;
  };

  const ae96 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (eg, e, t) { const r = ae96(eg, e, t); if (e && e._z96 > 0 && eg) eg.position.z = (eg.position.z || 0) + e._z96; return r; };

  const rr96 = R3.render.bind(R3); // (the 3D frame: R3 has no sync())
  R3.render = function (rd) {
    try { if (R3.rn) R3.rn.toneMappingExposure = TrackEvents96.exposure(); } catch (err) {}
    const r = rr96(rd);
    try {
      const now = performance.now() * 0.001;
      TrainProps96.render(now); TrackEvents96.render(rd); ArmorBreak96.render(rd, now); GhostRun96.tick(rd); FinisherCam96.tick(rd);
    } catch (err) { errLog(err); }
    return r;
  };

  const hd96 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try { PerfGov96.tick(rd); QuickUX96.tick(); AirCombat96.tick(); } catch (err) { errLog(err); }
    return hd96(rd);
  };

  Sim98.steps.push(dt => { AirCombat96.simStep(dt); TrainProps96.simStep(dt); TrackEvents96.simStep(dt); ArmorBreak96.simStep(dt); });
  Sim98.menu.push(() => WeaponChips96.tickUI());

  if (PC.settings) {
    const ps96 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps96(head, cycle, box, s);
      try {
        head('AAA SYSTEMS (v96)');
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
  window.__V96 = { S96, PerfGov96, QuickUX96, VoiceBarks96, WeaponChips96, AirCombat96, TrainProps96, TrackEvents96, ArmorBreak96, GhostRun96, FinisherCam96 };
})();

/* --- MODULE 2: v97 (reworked in v98/v103) --- */
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
    ensureUI() { // (v103: the title's command bar, HomeRedesign98's cmdbar98, gathers the title buttons; this only makes the help button)
      if (!this.helpBtn) {
        const b = document.createElement('button'); b.id = 'help97-btn';
        b.style.cssText = 'padding:6px 11px;border-radius:999px;cursor:pointer;background:rgba(8,12,26,.86);border:1.5px solid #00f2fe;color:#00f2fe;font-family:Orbitron,Rajdhani,sans-serif;font-size:11px;font-weight:900;';
        b.onclick = () => this.openHelp(); document.body.appendChild(b); this.helpBtn = b;
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
      setShow(this.helpBtn, onTitle, 'inline-block');
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

/* --- MODULE 3: v98 --- */
/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 98.0 (AAA MASTERWORK OVERHAUL)
   1. BodyRework98   — Replaces old xbot/soldier mannequin with a brand-new
                       sculpted 3D Cyber-Anime Exo-Armor Body rigged to every
                       Mixamo bone (70+ skins, 4 archetypes, energy scarf)
   2. BossPure3D98   — Eliminates the Half-3D/Half-2D boss bug completely
                       (pure tactical telegraphs only in 3D + upgraded 3D
                       boss hulls, wings, cannons, cores & turret parts)
   3. HomeRedesign98 — Unifies all scattered floating title buttons into one
                       sleek in-flow Command Bar inside #s-title
   4. SmartHud98     — Strictly hides #dock outside active PLAY + adds Smart
                       Auto-Hide / Compact / Hidden modes ([B] to toggle),
                       hides PC hotkey bar by default, auto-fades run badge
   5. CrateCinema98  — Next-gen 3D/2D hybrid crate opening: orbital drop,
                       3-seal interactive cyber-slashes, Overclock Fake-Out,
                       85ms Anime Manga Impact Frame & 28-shard 3D shatter!
   ========================================================================== */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "v98.0 — CYBER-NINJA 3D BODY, PURE 3D BOSSES, CLEAN HOME & AAA CRATES": "v98.0 — גוף סייבר־נינג׳ה 3D חדש, בוסים 100% תלת־ממד, מסך בית נקי ותיבות AAA",
      "Brand-new sculpted 3D Cyber-Anime Exo-Body replaces the old mannequin across all 70+ skins (layered armor, visor helms, glowing sternum cores & energy scarves); Bosses are now 100% pure 3D with zero 2D body bleed-through and upgraded 3D models; Home Screen redesigned with a unified Command Bar; Ability Bar upgraded to Smart Auto-Hide [B]; and Crate Opening completely rebuilt with orbital drop, multi-slash seals, anime impact frame and 28-shard 3D shatter explosion.": "גוף סייבר־אנימה 3D חדש ומפוסל מחליף את הבובה הישנה בכל 70+ הדמויות (שריון שכבות, קסדות משקף, ליבת חזה זוהרת וצעיף אנרגיה); כל הבוסים תוקנו ל־100% תלת־ממד נקי בלי שום שאריות 2D ועם מודלים משודרגים; מסך הבית סודר מחדש עם סרגל פיקוד מאוחד; סרגל היכולות שודרג להסתרה חכמה [B]; ופתיחת התיבות נבנתה מחדש עם נפילת מסלול, 3 חותמות חיתוך, Impact Frame אנימה והתפוצצות ל־28 שברים תלת־ממדיים.",
      "VISUALS & HUD (v98)": "ויזואל, תיבות ו־HUD נקי (v98)",
      "New 3D Cyber-Anime Body": "גוף סייבר־אנימה 3D חדש",
      "Pure 3D Bosses (No 2D)": "בוסים 100% תלת־ממד (ללא 2D)",
      "Ability Bar Display": "תצוגת סרגל יכולות",
      "AAA Crate Cinema (v98)": "אנימציית תיבות AAA (v98)",
      "AUTO": "אוטומטי",
      "COMPACT": "קומפקטי",
      "HIDDEN": "מוסתר",
      "ALWAYS": "תמיד",
      "SLASH THE SEALS!": "חתוך את החותמות!",
      "SWIPE OR PRESS SPACE · 3 CUTS TO SHATTER": "החלק על המסך או לחץ רווח · 3 חיתוכים לשבירה",
      "OVERCLOCK BREAK!": "פריצת אוברקלוק!",
      "COLLECT REWARD": "אסוף פרס",
      "GRAPHICS": "גרפיקה",
      "GENERAL": "כללי",
      "RESET KEYS": "איפוס מקשים",
      "Calm / Reduced Flashes": "הפחתת הבזקים ואפקטים" 
    });
  } catch (e) {}

  const S98 = {
    val(k, defVal) {
      try {
        const s = Store && Store.data && Store.data.settings;
        if (!s || s[k] == null) return defVal;
        return s[k];
      } catch (e) { return defVal; }
    },
    on(k, defVal) { return !!this.val(k, defVal == null ? 1 : defVal); },
    isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
    L(s) { return typeof lt === 'function' ? lt(s) : s; }
  };

  function mkMat98(hex, emHex, emInt, metal, rough, opacity) {
    const T = THREE;
    const isAnim = typeof S91 !== 'undefined' && S91.isAnime();
    if (emInt && emInt >= 1.5) {
      return new T.MeshBasicMaterial({
        color: new T.Color(emHex || hex),
        transparent: opacity != null && opacity < 1,
        opacity: opacity != null ? opacity : 1,
        side: T.DoubleSide
      });
    }
    if (isAnim && typeof AnimeToon91 !== 'undefined') {
      AnimeToon91.ensureAssets();
      return new T.MeshToonMaterial({
        color: new T.Color(hex),
        gradientMap: AnimeToon91.gradTex,
        emissive: new T.Color(emHex || '#000000'),
        emissiveIntensity: emInt || 0.2,
        transparent: opacity != null && opacity < 1,
        opacity: opacity != null ? opacity : 1
      });
    }
    return new T.MeshStandardMaterial({
      color: new T.Color(hex),
      emissive: new T.Color(emHex || '#000000'),
      emissiveIntensity: emInt || 0.18,
      metalness: metal != null ? metal : 0.72,
      roughness: rough != null ? rough : 0.28,
      transparent: opacity != null && opacity < 1,
      opacity: opacity != null ? opacity : 1
    });
  }

  function addInk98(mesh, thick) {
    try {
      if (typeof AnimeToon91 !== 'undefined' && typeof S91 !== 'undefined' && S91.isAnime() && mesh && mesh.isMesh && !(mesh.material && mesh.material.isMeshBasicMaterial)) {
        AnimeToon91.addOutline(mesh, thick || 1.075, AnimeToon91.inkBlack);
      }
    } catch (e) {}
  }

  /* ========================================================================
     1. BodyRework98 — BRAND-NEW SCULPTED 3D CYBER-ANIME EXO-BODY (ALL 70+ SKINS)
        Hides the generic xbot/soldier mannequin meshes while preserving 100%
        of the Mixamo/KayKit skeletal animation, and mounts a sculpted,
        layered cyber-ninja / anime armor rig directly onto every bone!
     ======================================================================== */
  const BodyRework98 = {
    ARCH_MAP: {
      heavy:  ['oni', 'exo', 'mecha', 'knight', 'viking', 'yeti', 'shogun', 'ashura', 'dragon'],
      arcane: ['seraph', 'lich', 'sovereign', 'yurei', 'raijin', 'tengu', 'witch'],
      master: ['ronin', 'chromesam', 'skull', 'blaze', 'pixel', 'goo', 'pumpkin']
    },
    getArch(body) {
      for (const k of Object.keys(this.ARCH_MAP)) if (this.ARCH_MAP[k].includes(body)) return k;
      return 'agile';
    },

    findBone(root, name) {
      let found = null;
      root.traverse(o => {
        if (!found && o.isBone && o.name.replace(/[:]/g, '').endsWith(name)) found = o;
      });
      return found;
    },

    // Mounts a sculpted armor limb cleanly along the exact bone->childBone vector!
    buildLimb(parentBone, childBone, rTop, rBot, mats, style) {
      if (!parentBone || !childBone) return null;
      const T = THREE;
      const dir = childBone.position.clone();
      const len = dir.length();
      if (len < 1e-3) return null;

      const grp = new T.Group();
      grp.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
      parentBone.add(grp);

      // Sleek carbon undersuit core
      const under = new T.Mesh(new T.CylinderGeometry(rBot * 0.84, rTop * 0.84, len * 0.96, 8), mats.under);
      under.position.y = len * 0.5;
      under.castShadow = true;
      grp.add(under);

      // Faceted outer armor shell (6-sided cyber bevel)
      const shell = new T.Mesh(new T.CylinderGeometry(rBot * 1.06, rTop * 1.12, len * 0.68, 6), mats.armor);
      shell.position.y = len * 0.52;
      shell.castShadow = true;
      grp.add(shell);
      addInk98(shell, 1.07);

      // Glowing cyber energy seam ring at joint
      const ring = new T.Mesh(new T.TorusGeometry(rTop * 0.98, Math.max(0.45, rTop * 0.14), 6, 12), mats.glowA);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = len * 0.16;
      grp.add(ring);

      if (style === 'forearm') {
        // Flared cyber gauntlet cuff + neon blade fin
        const cuff = new T.Mesh(new T.BoxGeometry(rBot * 2.25, len * 0.42, rBot * 2.25), mats.trim);
        cuff.position.y = len * 0.72;
        grp.add(cuff);
        addInk98(cuff, 1.06);
        const strip = new T.Mesh(new T.BoxGeometry(rBot * 0.45, len * 0.58, rBot * 2.55), mats.glowA);
        strip.position.y = len * 0.6;
        grp.add(strip);
      } else if (style === 'shin') {
        // Sharp polygonal kneepad + armored cyber greave + fin
        const knee = new T.Mesh(new T.OctahedronGeometry(rTop * 1.12, 0), mats.trim);
        knee.scale.set(0.95, 1.25, 1.1);
        knee.position.set(0, len * 0.08, rTop * 0.68);
        grp.add(knee);
        addInk98(knee, 1.07);
        const vent = new T.Mesh(new T.BoxGeometry(rBot * 0.4, len * 0.55, rBot * 2.45), mats.glowB);
        vent.position.y = len * 0.54;
        grp.add(vent);
      } else if (style === 'thigh') {
        const plate = new T.Mesh(new T.BoxGeometry(rTop * 2.1, len * 0.45, rTop * 1.7), mats.trim);
        plate.position.set(0, len * 0.42, rTop * 0.25);
        grp.add(plate);
        addInk98(plate, 1.06);
      }
      return grp;
    },

    dressHuman(g, L) {
      if (!S98.on('body98', true) || !g || !g.human || !g.human.r || !g.human.r.o || typeof THREE === 'undefined' || g._body98Done) return g;
      g._body98Done = 1;
      try {
        const T = THREE;
        const root = g.human.r.o;
        const body = (L && L.body) || 'ninja';
        const arch = this.getArch(body);
        const ca = (L && L.a) || '#00f2fe';
        const cb = (L && L.b) || '#ff0844';
        const hasFace = typeof FACE !== 'undefined' && !!FACE[body];

        // 1. Hide ugly xbot / soldier mannequin SkinnedMeshes (skeleton keeps animating 100%!)
        root.traverse(o => {
          if (o.isSkinnedMesh || (o.isMesh && !o.userData._v98 && o.parent === root)) {
            o.visible = false;
          }
        });

        // 2. Sculpted Cyber-Anime Material Palette tailored to skin colors
        const baseCol = new T.Color('#13192c').lerp(new T.Color(ca), 0.24);
        const trimCol = new T.Color('#1c2440').lerp(new T.Color(cb), 0.48);
        const mats = {
          under: mkMat98('#0a0d1a', ca, 0.08, 0.45, 0.62),
          armor: mkMat98(baseCol, ca, 0.22, 0.78, 0.26),
          trim:  mkMat98(trimCol, cb, 0.32, 0.72, 0.28),
          glowA: mkMat98(ca, ca, 2.3, 0.1, 0.2),
          glowB: mkMat98(cb, cb, 2.0, 0.1, 0.2),
          gold:  mkMat98('#ffd700', '#ffb020', 0.55, 0.85, 0.22)
        };
        // Connect g.plate & g.visor to real armor materials so Overdrive / hit-flash light up the suit!
        g.plate = mats.armor;
        g.visor = { material: mats.glowA };

        const bulk = arch === 'heavy' ? 1.24 : arch === 'master' ? 1.1 : arch === 'arcane' ? 0.98 : 0.94;
        const bHips   = this.findBone(root, 'Hips');
        const bSpine  = this.findBone(root, 'Spine');
        const bSpine1 = this.findBone(root, 'Spine1');
        const bSpine2 = this.findBone(root, 'Spine2');
        const bNeck   = this.findBone(root, 'Neck');
        const bHead   = this.findBone(root, 'Head');
        const bTop    = this.findBone(root, 'HeadTop_End');
        const bLArm   = this.findBone(root, 'LeftArm');
        const bLFore  = this.findBone(root, 'LeftForeArm');
        const bLHand  = this.findBone(root, 'LeftHand');
        const bRArm   = this.findBone(root, 'RightArm');
        const bRFore  = this.findBone(root, 'RightForeArm');
        const bRHand  = this.findBone(root, 'RightHand');
        const bLUp    = this.findBone(root, 'LeftUpLeg');
        const bLLeg   = this.findBone(root, 'LeftLeg');
        const bLFoot  = this.findBone(root, 'LeftFoot');
        const bRUp    = this.findBone(root, 'RightUpLeg');
        const bRLeg   = this.findBone(root, 'RightLeg');
        const bRFoot  = this.findBone(root, 'RightFoot');

        // Derive exact skeleton scale unit from spine-to-neck length (works for BOTH xbot & soldier!)
        const refLen = (bNeck && bNeck.position.length() > 1) ? bNeck.position.length() : 15;
        const U = refLen / 15.0; // ~1.0 in Mixamo cm coordinates

        // 3. PELVIS, BELT & ARMORED TASSETS (Hips)
        if (bHips) {
          const hipG = new T.Group(); bHips.add(hipG);
          const pelvis = new T.Mesh(new T.CylinderGeometry(11.5 * U * bulk, 10.2 * U * bulk, 11.5 * U, 6), mats.under);
          pelvis.position.y = 1.5 * U; pelvis.castShadow = true; hipG.add(pelvis);

          const belt = new T.Mesh(new T.BoxGeometry(24.5 * U * bulk, 4.6 * U, 15.5 * U * bulk), mats.trim);
          belt.position.y = 5.5 * U; hipG.add(belt); addInk98(belt, 1.06);

          const buckle = new T.Mesh(new T.OctahedronGeometry(3.4 * U, 0), mats.glowA);
          buckle.position.set(0, 5.5 * U, 8.2 * U * bulk); hipG.add(buckle);

          // Left & Right armored hip tassets (cyber-samurai plates)
          for (const s of [-1, 1]) {
            const tas = new T.Mesh(new T.BoxGeometry(4.2 * U * bulk, 15.5 * U, 12.5 * U), mats.armor);
            tas.position.set(s * 12.6 * U * bulk, -3.5 * U, 0);
            tas.rotation.z = s * 0.16;
            hipG.add(tas); addInk98(tas, 1.06);
            const cell = new T.Mesh(new T.BoxGeometry(1.4 * U, 10 * U, 2.2 * U), mats.glowB);
            cell.position.set(s * 14.5 * U * bulk, -2.5 * U, 2.5 * U);
            hipG.add(cell);
          }
          // Arcane coat tail / rear armored flap
          const flap = new T.Mesh(new T.BoxGeometry(15 * U * bulk, arch === 'arcane' ? 28 * U : 16 * U, 2.6 * U), mats.trim);
          flap.position.set(0, arch === 'arcane' ? -12 * U : -5 * U, -8.8 * U * bulk);
          flap.rotation.x = 0.18;
          hipG.add(flap); addInk98(flap, 1.06);
        }

        // 4. SEGMENTED ABDOMEN (Spine / Spine1)
        const midSpine = bSpine1 || bSpine;
        if (midSpine) {
          const abG = new T.Group(); midSpine.add(abG);
          const waist = new T.Mesh(new T.CylinderGeometry(12.2 * U * bulk, 9.8 * U * bulk, 14 * U, 6), mats.under);
          waist.position.y = 4 * U; abG.add(waist);
          for (let i = 0; i < 2; i++) {
            const ab = new T.Mesh(new T.BoxGeometry((15 - i * 1.5) * U * bulk, 4.2 * U, 13.5 * U * bulk), mats.armor);
            ab.position.set(0, (1.5 + i * 5.2) * U, 1.2 * U);
            abG.add(ab); addInk98(ab, 1.06);
          }
        }

        // 5. V-TAPERED SCULPTED CHESTPLATE, COLLAR & ENERGY SCARF (Spine2)
        const scarfSegs = [];
        if (bSpine2) {
          const chG = new T.Group(); bSpine2.add(chG);
          // Heroic V-taper chest chassis
          const chest = new T.Mesh(new T.CylinderGeometry(17.2 * U * bulk, 11.4 * U * bulk, 18.5 * U, 6), mats.armor);
          chest.position.set(0, 8.5 * U, 0.5 * U); chest.scale.set(1.08, 1, 0.78);
          chest.castShadow = true; chG.add(chest); addInk98(chest, 1.07);

          // Left & Right sculpted angular pectoral plates
          for (const s of [-1, 1]) {
            const pec = new T.Mesh(new T.BoxGeometry(10.5 * U * bulk, 10.2 * U, 6.2 * U * bulk), mats.trim);
            pec.position.set(s * 6.8 * U * bulk, 10.5 * U, 7.6 * U * bulk);
            pec.rotation.y = s * -0.24; pec.rotation.z = s * 0.1;
            chG.add(pec); addInk98(pec, 1.06);
          }
          // Glowing Overdrive Sternum Reactor Core
          const core = new T.Mesh(new T.OctahedronGeometry(4.4 * U, 0), mats.glowA);
          core.scale.set(1, 1.35, 0.65);
          core.position.set(0, 10.5 * U, 11.2 * U * bulk);
          chG.add(core);
          // High cyber-ninja collar guard
          const collar = new T.Mesh(new T.CylinderGeometry(9.6 * U, 11.5 * U, 6.5 * U, 6, 1, true), mats.trim);
          collar.position.set(0, 18.5 * U, -0.8 * U);
          chG.add(collar);
          const colRim = new T.Mesh(new T.TorusGeometry(9.6 * U, 0.85 * U, 6, 16), mats.glowA);
          colRim.rotation.x = Math.PI / 2; colRim.position.set(0, 21.2 * U, -0.8 * U);
          chG.add(colRim);

          // Back spine power-pack + glowing spine nodes
          const pack = new T.Mesh(new T.BoxGeometry(13 * U * bulk, 14 * U, 6.5 * U), mats.under);
          pack.position.set(0, 9.5 * U, -9.2 * U * bulk);
          chG.add(pack); addInk98(pack, 1.06);
          for (let k = 0; k < 3; k++) {
            const node = new T.Mesh(new T.BoxGeometry(4.2 * U, 2.2 * U, 2.2 * U), k === 1 ? mats.glowB : mats.glowA);
            node.position.set(0, (4.5 + k * 4.5) * U, -12.6 * U * bulk);
            chG.add(node);
          }

          // Flowing dual cyber-energy scarf anchored to upper back!
          for (const s of [-1, 1]) {
            let prev = chG;
            for (let k = 0; k < 4; k++) {
              const piv = new T.Group();
              if (k === 0) piv.position.set(s * 5.2 * U, 17.5 * U, -8.5 * U * bulk);
              else piv.position.set(0, -10.5 * U, -4.2 * U);
              prev.add(piv);
              const rib = new T.Mesh(new T.BoxGeometry((4.2 - k * 0.65) * U, 11.5 * U, 1.1 * U), k % 2 === 0 ? mats.glowB : mats.glowA);
              rib.position.set(0, -5.2 * U, -2.0 * U);
              rib.rotation.x = 0.35;
              piv.add(rib);
              scarfSegs.push({ piv, s, k });
              prev = piv;
            }
          }
        }

        // 6. SCULPTED ARMS, PAULDRONS & GAUNTLETS (bone-vector aligned for both xbot & soldier)
        for (const [arm, fore, hand, s] of [[bLArm, bLFore, bLHand, 1], [bRArm, bRFore, bRHand, -1]]) {
          const armGrp = this.buildLimb(arm, fore, 5.6 * U * bulk, 4.7 * U * bulk, mats, 'arm');
          this.buildLimb(fore, hand, 4.9 * U * bulk, 4.2 * U * bulk, mats, 'forearm');
          if (armGrp) {
            // Angular beveled shoulder pauldron seated cleanly on the upper arm axis
            const pauld = new T.Mesh(new T.BoxGeometry(11.2 * U * bulk, 9.6 * U * bulk, 11.8 * U * bulk), mats.armor);
            pauld.position.set(0, 3.8 * U, 0);
            armGrp.add(pauld); addInk98(pauld, 1.07);
            const trim = new T.Mesh(new T.BoxGeometry(11.8 * U * bulk, 2.0 * U, 12.4 * U * bulk), mats.glowA);
            trim.position.set(0, 1.2 * U, 0);
            armGrp.add(trim);
            if (arch === 'heavy' || arch === 'master') {
              const fin = new T.Mesh(new T.ConeGeometry(2.8 * U, 9.5 * U, 4), mats.trim);
              fin.position.set(0, -1.8 * U, 0);
              fin.rotation.x = Math.PI;
              armGrp.add(fin); addInk98(fin, 1.06);
            }
          }
          if (hand) {
            const fist = new T.Mesh(new T.BoxGeometry(5.6 * U, 6.8 * U, 5.2 * U), mats.under);
            hand.add(fist);
          }
        }

        // 7. SCULPTED THIGHS, KNEEPADS, GREAVES & CYBER BOOTS (aligned to ToeBase)
        const bLToe = this.findBone(root, 'LeftToeBase'), bRToe = this.findBone(root, 'RightToeBase');
        for (const [up, leg, foot, toe] of [[bLUp, bLLeg, bLFoot, bLToe], [bRUp, bRLeg, bRFoot, bRToe]]) {
          this.buildLimb(up, leg, 7.6 * U * bulk, 5.8 * U * bulk, mats, 'thigh');
          this.buildLimb(leg, foot, 6.2 * U * bulk, 4.5 * U * bulk, mats, 'shin');
          if (foot) {
            const fg = new T.Group();
            if (toe && toe.position.length() > 1) {
              fg.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), toe.position.clone().normalize());
            }
            foot.add(fg);
            const boot = new T.Mesh(new T.BoxGeometry(8.2 * U * bulk, 6.4 * U, 17.0 * U), mats.armor);
            boot.position.set(0, 0, 6.5 * U);
            fg.add(boot); addInk98(boot, 1.06);
            const sole = new T.Mesh(new T.BoxGeometry(8.6 * U * bulk, 1.8 * U, 17.6 * U), mats.glowA);
            sole.position.set(0, -2.8 * U, 6.5 * U);
            fg.add(sole);
          }
        }

        // 8. SCULPTED CYBER-SHINOBI HELM & GLOWING VISOR (when not using painted anime face)
        if (bHead) {
          const hr = bTop ? bTop.position.length() * 0.5 : 10 * U;
          if (!hasFace) {
            const hG = new T.Group();
            hG.position.set(0, hr * 0.78, 0.5 * U);
            bHead.add(hG);
            // Faceted cyber helmet dome
            const dome = new T.Mesh(new T.OctahedronGeometry(hr * 0.96, 1), mats.armor);
            dome.scale.set(0.92, 1.06, 1.04);
            hG.add(dome); addInk98(dome, 1.07);
            // Sharp ninja respirator jawline mask
            const jaw = new T.Mesh(new T.BoxGeometry(hr * 1.18, hr * 0.68, hr * 0.95), mats.under);
            jaw.position.set(0, -hr * 0.42, hr * 0.36);
            hG.add(jaw); addInk98(jaw, 1.06);
            // Blazing angular V-visor slit
            const visor = new T.Mesh(new T.BoxGeometry(hr * 1.55, hr * 0.28, hr * 0.52), mats.glowA);
            visor.position.set(0, hr * 0.04, hr * 0.78);
            hG.add(visor);
            // Forehead crest / oni-mecha V-fin
            for (const s of [-1, 1]) {
              const ear = new T.Mesh(new T.ConeGeometry(hr * 0.22, hr * 1.25, 4), mats.trim);
              ear.position.set(s * hr * 0.78, hr * 0.48, -hr * 0.15);
              ear.rotation.z = s * -0.42; ear.rotation.x = -0.35;
              hG.add(ear); addInk98(ear, 1.06);
            }
            if (arch === 'heavy' || arch === 'master') {
              const crest = new T.Mesh(new T.ConeGeometry(hr * 0.24, hr * 1.35, 4), mats.gold);
              crest.position.set(0, hr * 0.85, hr * 0.55);
              crest.rotation.x = 0.45;
              hG.add(crest);
            }
          }
        }

        g._body98 = { scarfSegs, mats };
      } catch (e) { if (typeof errLog === 'function') errLog(e); }
      return g;
    },

    tickAnim(g, o, rd, t) {
      const b = g && g._body98;
      if (!b || !b.scarfSegs.length) return;
      const spd = (o && o.spd) || 0, dash = !!(o && o.dashing);
      const lift = dash ? 1.15 : Math.min(0.85, spd / 420);
      for (const seg of b.scarfSegs) {
        seg.piv.rotation.x = 0.22 + lift * 0.55 + Math.sin(t * (dash ? 22 : 9) - seg.k * 0.85 + seg.s) * (dash ? 0.22 : 0.12);
        seg.piv.rotation.z = seg.s * 0.1 + Math.cos(t * 7 - seg.k * 0.6) * 0.08;
      }
    }
  };

  /* ========================================================================
     2. BossPure3D98 — 100% PURE 3D BOSSES (ZERO 2D BODY BLEED-THROUGH!)
        Replaces Boss.draw in 3D mode with clean tactical telegraphs ONLY,
        and upgrades R3.bossModel & boss weapon parts to full AAA 3D!
     ======================================================================== */
  const BossPure3D98 = {
    drawTelegraphsOnly(b) {
      if (!b || typeof cx === 'undefined') return;
      const col = (b.info && b.info.col) || '#ff0844';
      const T2 = typeof TAU !== 'undefined' ? TAU : Math.PI * 2;
      const D8 = typeof DASH8 !== 'undefined' ? DASH8 : [8, 6];
      const D6 = typeof DASH6 !== 'undefined' ? DASH6 : [6, 5];
      const ND = typeof NODASH !== 'undefined' ? NODASH : [];
      const tm = (typeof CAM !== 'undefined' && CAM.t) || 0;

      cx.save();
      // 1. Stomp / Slam target circles (warden, prime)
      if (b.st === 'stomp' && b.stT > 0.4) {
        cx.strokeStyle = '#ff3b3b'; cx.lineWidth = 3; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(b.tx, b.ty, 120, 0, T2); cx.stroke(); cx.setLineDash(ND);
        cx.globalAlpha = 0.14; cx.fillStyle = '#ff0844'; cx.fill(); cx.globalAlpha = 1;
      }
      // 2. Aim / Dash telegraph lines (kage, leviathan, genesis, raijin)
      if (b.st === 'tele' && b.da != null) {
        const k = Math.max(0, Math.min(1, 1 - (b.stT || 0) / (b.teleD || 0.75)));
        cx.globalAlpha = 0.35 + k * 0.55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 4;
        cx.setLineDash(D8); cx.beginPath(); cx.moveTo(b.x, b.y);
        cx.lineTo(b.x + Math.cos(b.da) * 520, b.y + Math.sin(b.da) * 520); cx.stroke();
        cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      // 3. Warden plasma aim
      if (b.st === 'plasma' && b.parts && b.parts[1] && b.parts[1].alive) {
        const can = b.parts[1];
        cx.globalAlpha = 0.65; cx.strokeStyle = '#00f2fe'; cx.lineWidth = 3;
        cx.beginPath(); cx.moveTo(can.x, can.y); cx.lineTo(can.x + Math.cos(b.ang) * 900, can.y + Math.sin(b.ang) * 900); cx.stroke();
        cx.globalAlpha = 1;
      }
      // 4. Hydra sweeping beam
      if (b.beam && (b.beam.tele > 0 || b.beam.on > 0) && b.parts && b.parts[1] && b.parts[1].alive) {
        const C = b.parts[1], bm = b.beam;
        const ex = C.x + Math.cos(bm.a) * bm.len, ey = C.y + Math.sin(bm.a) * bm.len;
        if (bm.tele > 0) {
          cx.globalAlpha = 0.55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(D8);
          cx.beginPath(); cx.moveTo(C.x, C.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        } else {
          cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 12; cx.beginPath(); cx.moveTo(C.x, C.y); cx.lineTo(ex, ey); cx.stroke();
          cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.stroke();
        }
      }
      // 5. Shogun spinning laser spokes
      if (b.sp && (b.sp.tele > 0 || b.sp.on > 0)) {
        for (let k = 0; k < b.sp.n; k++) {
          const a = b.sp.a + k * T2 / b.sp.n, ex = b.x + Math.cos(a) * 900, ey = b.y + Math.sin(a) * 900;
          if (b.sp.tele > 0) {
            cx.globalAlpha = 0.45; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(D8);
            cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
          } else {
            cx.strokeStyle = '#ff0844'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke();
            cx.strokeStyle = '#ffd0da'; cx.lineWidth = 3; cx.stroke();
          }
        }
      }
      // 6. Raijin electric curtain
      if (b.cur && typeof V !== 'undefined') {
        const c = b.cur, live = c.tele <= 0, L = V.L, Rr = V.R;
        cx.globalAlpha = live ? 1 : 0.45 + 0.3 * Math.sin(tm * 20);
        cx.strokeStyle = live ? '#e8f6ff' : '#9fd8ff'; cx.lineWidth = live ? 4 : 2;
        if (!live) cx.setLineDash(D8);
        cx.beginPath();
        for (let seg = 0; seg < 2; seg++) {
          const x0 = seg ? c.gx + c.gw : L, x1 = seg ? Rr : c.gx; if (x1 - x0 < 4) continue;
          cx.moveTo(x0, c.y); for (let x = x0 + 14; x < x1; x += 14) cx.lineTo(x, c.y + (live ? Math.sin(x * 0.7 + tm * 50) * 5 : 0)); cx.lineTo(x1, c.y);
        }
        cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        cx.strokeStyle = '#00ff88'; cx.lineWidth = 2; cx.strokeRect(c.gx, c.y - 12, c.gw, 24);
      }
      // 7. Renull echo cut lines
      if (Array.isArray(b.echoes)) {
        for (const e of b.echoes) {
          if (e.t > 0) {
            cx.globalAlpha = 0.35 + (1 - e.t / e.d) * 0.5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(D6);
            cx.beginPath(); cx.moveTo(e.x1, e.y1); cx.lineTo(e.x2, e.y2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
          }
        }
      }
      // 8. Benkei sweep sector
      if (b.sw) {
        const s = b.sw;
        for (const off of s.two ? [0, Math.PI] : [0]) {
          const a = s.a + off;
          cx.beginPath(); cx.moveTo(b.x, b.y); cx.arc(b.x, b.y, 270, a - s.w, a + s.w); cx.closePath();
          cx.fillStyle = s.cut ? 'rgba(255,8,68,.35)' : 'rgba(255,176,32,.16)'; cx.fill();
          cx.strokeStyle = s.cut ? '#ff0844' : '#ffb020'; cx.lineWidth = 2.5; cx.stroke();
        }
      }
      // 9. Valkyrie orbital strike columns
      if (Array.isArray(b.cols) && typeof V !== 'undefined') {
        for (const c of b.cols) {
          if (c.t > 0) {
            const k = 1 - c.t / c.d;
            cx.globalAlpha = 0.14 + k * 0.25; cx.fillStyle = '#00f2fe'; cx.fillRect(c.x - c.w / 2, 0, c.w, V.VH);
            cx.globalAlpha = 0.65; cx.strokeStyle = '#00f2fe'; cx.lineWidth = 2; cx.strokeRect(c.x - c.w / 2, 0, c.w, V.VH); cx.globalAlpha = 1;
          }
        }
      }
      // 10. Chimera decay zones, Oryu ring, Izanami slam, Hyakki lane, Tenkai lances, Otakemaru rocks
      if (Array.isArray(b.zones)) {
        for (const z of b.zones) if (z.t > 0) {
          cx.globalAlpha = 0.45; cx.strokeStyle = '#c45bff'; cx.lineWidth = 2; cx.setLineDash(D6);
          cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        }
      }
      if (b.ring) {
        const g = b.ring, k = 1 - g.t / g.d;
        cx.globalAlpha = 0.4 + 0.5 * k; cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(g.x, g.y, 48, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      if (b.slam) {
        const s = b.slam, k = 1 - s.t / s.d;
        cx.globalAlpha = 0.35 + 0.5 * k; cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(s.x, s.y, 72, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      if (b.lane && (b.st === 'aim' || b.st === 'charge') && typeof V !== 'undefined') {
        cx.fillStyle = 'rgba(255,8,68,.2)'; cx.fillRect(b.lane.x - b.r - 6, 0, (b.r + 6) * 2, V.VH);
      }
      if (Array.isArray(b.lances)) {
        for (const L of b.lances) {
          const ex = L.x + Math.cos(L.a) * 1400, ey = L.y + Math.sin(L.a) * 1400;
          cx.strokeStyle = L.t > 0 ? '#ff6a00' : '#ffffff'; cx.lineWidth = L.t > 0 ? 2 : 9;
          cx.beginPath(); cx.moveTo(L.x, L.y); cx.lineTo(ex, ey); cx.stroke();
        }
      }
      if (Array.isArray(b.rocks)) {
        for (const r of b.rocks) if (r.t > 0) {
          const k = 1 - r.t / r.d;
          cx.globalAlpha = 0.35 + k * 0.5; cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.setLineDash(D6);
          cx.beginPath(); cx.arc(r.x, r.y, r.r, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        }
      }

      // 11. Core tactical HUD overlays (stagger ring, weak-point arc, shield, part HP bars)
      if (b.stag > 0) {
        cx.globalAlpha = 0.65; cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(b.x, b.y, b.r + 56, tm * 2, tm * 2 + T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      if (b.wpOn && b.stag <= 0 && b.dying <= 0) {
        cx.globalAlpha = b.wpCd > 0 ? 0.25 : 1; cx.strokeStyle = '#ffd700'; cx.lineWidth = 6;
        cx.beginPath(); cx.arc(b.x, b.y, b.r + 9, b.wp - 0.65, b.wp + 0.65); cx.stroke(); cx.globalAlpha = 1;
      }
      if (b.shield && b.dying <= 0) {
        cx.strokeStyle = 'rgba(125,249,255,.78)'; cx.lineWidth = 3;
        cx.beginPath(); cx.arc(b.x, b.y, b.r + 16 + Math.sin(tm * 5) * 2, 0, T2); cx.stroke();
      }
      for (const p of (b.parts || [])) if (p.alive) {
        const w = (p.r || 16) * 2;
        cx.fillStyle = 'rgba(0,0,0,.65)'; cx.fillRect(p.x - w / 2, p.y + (p.r || 16) + 5, w, 4);
        cx.fillStyle = '#00ff88'; cx.fillRect(p.x - w / 2, p.y + (p.r || 16) + 5, w * Math.max(0, p.hp / p.mhp), 4);
      }
      cx.restore();
    },

    upgradeBoss3D(bg, b) {
      if (!bg || bg._boss3d98 || typeof THREE === 'undefined') return bg;
      bg._boss3d98 = 1;
      try {
        const T = THREE;
        const col = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
        const glowM = mkMat98(col, col, 2.4, 0.2, 0.2);
        const darkM = mkMat98('#12182d', col, 0.28, 0.82, 0.24);
        const goldM = mkMat98('#ffd700', '#ffb020', 0.7, 0.85, 0.2);
        const kind = bg.kind || 'mech';

        // Add crisp 3D tactical wings / shoulder cannons / energy halo so bosses look 100% AAA 3D!
        if (kind === 'ship') {
          for (const s of [-1, 1]) {
            const wing = new T.Mesh(new T.BoxGeometry(0.95, 1.45, 0.16), darkM);
            wing.position.set(-0.25, s * 1.35, 1.35);
            wing.rotation.z = s * 0.28;
            bg.add(wing); addInk98(wing, 1.06);
            const thr = new T.Mesh(new T.ConeGeometry(0.24, 0.95, 8).rotateZ(Math.PI / 2), glowM);
            thr.position.set(-1.15, s * 0.85, 1.25);
            bg.add(thr);
          }
        } else if (kind === 'core') {
          const rOuter = new T.Mesh(new T.TorusGeometry(1.45, 0.08, 8, 28), glowM);
          rOuter.position.z = 1.6; rOuter.rotation.x = 0.75;
          bg.add(rOuter);
          if (bg.anim) bg.anim.push(['ring', rOuter, 2.2]);
        } else if (kind === 'mech') {
          for (const s of [-1, 1]) {
            const fin = new T.Mesh(new T.ConeGeometry(0.28, 1.15, 4), darkM);
            fin.position.set(-0.2, s * 1.15, 2.35); fin.rotation.x = s * 0.45;
            bg.add(fin); addInk98(fin, 1.06);
            const rail = new T.Mesh(new T.BoxGeometry(0.85, 0.16, 0.16), glowM);
            rail.position.set(0.35, s * 1.08, 2.15);
            bg.add(rail);
          }
          const crown = new T.Mesh(new T.TorusGeometry(0.55, 0.07, 6, 16), goldM);
          crown.position.set(0.15, 0, 2.62);
          bg.add(crown);
        }
      } catch (e) {}
      return bg;
    }
  };

  /* ========================================================================
     3. HomeRedesign98 — CLEAN, UNIFIED HOME SCREEN COMMAND BAR (#cmdbar98)
     ======================================================================== */
  const HomeRedesign98 = {
    bar: null,
    organize() {
      if (typeof UI !== 'undefined' && UI.cur !== 'title') return;
      const col = document.querySelector('#s-title > .col');
      if (!col) return;
      if (!this.bar) {
        const bar = document.createElement('div');
        bar.id = 'cmdbar98';
        // Place cleanly right after the topbar (profile + credits), before the logo!
        const topbar = col.querySelector('.topbar');
        if (topbar && topbar.nextSibling) col.insertBefore(bar, topbar.nextSibling);
        else col.prepend(bar);
        this.bar = bar;
      }

      // Absorb ALL floating title buttons cleanly into #cmdbar98 (zero position:fixed clutter!)
      const ids = ['auth93-btn', 'heat92-btn', 'lb92-btn', 'ost95-btn', 'chips96-btn', 'help97-btn'];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.parentNode !== this.bar) {
          this.bar.appendChild(el);
        }
      }

      // Move Dual Ending title badge cleanly into the flow right beneath the logo!
      const eb = document.getElementById('ending-badge97');
      const logo = col.querySelector('.logo');
      if (eb && logo && eb.parentNode !== col) {
        eb.classList.add('inflow98');
        if (logo.nextSibling) col.insertBefore(eb, logo.nextSibling);
        else col.appendChild(eb);
      }
    }
  };

  /* ========================================================================
     4. SmartHud98 — NON-INTRUSIVE ABILITY BAR & CLEAN COMBAT HUD
        - Strictly hides #dock outside active PLAY
        - Default AUTO mode: auto-hides on PC (slides up on bottom-edge hover
          or brief peek when skill/OD activates), compact semi-transparent on touch
        - Press [B] anytime to cycle AUTO / COMPACT / HIDDEN / ALWAYS
        - Turns off #pc90-bar hotkey strip by default; auto-fades #arch97-badge
     ======================================================================== */
  const SmartHud98 = {
    peekT: 0,
    zoneEl: null,
    archTimer: 0,
    lastODReady: false,

    init() {
      // Turn off bottom PC hotkey clutter bar by default on first v98 launch
      try {
        if (typeof Store !== 'undefined' && Store.data && Store.data.settings) {
          const s = Store.data.settings;
          if (s._v98HudInit == null) {
            s._v98HudInit = 1;
            s.bar90 = 0;
            if (s.dockMode98 == null) s.dockMode98 = 'auto';
            Store.touch();
          }
        }
      } catch (e) {}

      // Bottom-edge hover sensor for desktop AUTO mode
      if (!this.zoneEl) {
        const z = document.createElement('div');
        z.id = 'dock98-zone';
        z.addEventListener('pointerenter', () => this.peek(2.2));
        document.body.appendChild(z);
        this.zoneEl = z;
      }

      // Press [B] to cycle ability bar display mode; pressing Q/W/E/R/Space peeks briefly
      window.addEventListener('keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (typeof G !== 'undefined' && G.state === 'PLAY') {
          if (['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'Space', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
            this.peek(1.6);
          }
          if (e.code === 'KeyB') {
            const modes = ['auto', 'compact', 'hidden', 'always'];
            const cur = S98.val('dockMode98', 'auto');
            const next = modes[(modes.indexOf(cur) + 1) % modes.length];
            try { Store.data.settings.dockMode98 = next; Store.touch(); } catch (err) {}
            if (typeof toast === 'function') toast((S98.isHe() ? 'סרגל יכולות: ' : 'ABILITY BAR: ') + S98.L(next.toUpperCase()), '#00f2fe');
            this.peek(1.8);
          }
        }
      });
    },

    peek(sec) {
      this.peekT = Math.max(this.peekT, sec || 1.6);
    },

    onRunStart() {
      this.archTimer = 4.2;
      this.lastODReady = false;
    },

    tick(rd) {
      const dt = Math.min(0.05, rd || 0.016);
      const mode = S98.val('dockMode98', 'auto');
      const play = typeof G !== 'undefined' && G.state === 'PLAY' && !G.photo;

      document.body.classList.toggle('dock98-auto', mode === 'auto');
      document.body.classList.toggle('dock98-compact', mode === 'compact');
      document.body.classList.toggle('dock98-hidden', mode === 'hidden');

      const dock = document.getElementById('dock');
      if (dock) {
        // Strictly hide #dock whenever NOT in active PLAY!
        if (!play) dock.classList.add('hidden');
        // Brief peek when Overdrive hits 100%
        const odReady = play && typeof G !== 'undefined' && (G.od >= 100);
        if (odReady && !this.lastODReady) this.peek(2.2);
        this.lastODReady = odReady;

        if (this.peekT > 0) this.peekT = Math.max(0, this.peekT - dt);
        dock.classList.toggle('peek98', this.peekT > 0);
      }
      if (this.zoneEl) this.zoneEl.classList.toggle('on', play && mode === 'auto');

      // Auto-fade the Archetype badge after 4.2 seconds at run start so bottom-left stays clean!
      const archEl = document.getElementById('arch97-badge');
      if (archEl && play) {
        window.__archFade98 = this.archTimer;
        if (this.archTimer > 0) {
          this.archTimer -= dt;
          archEl.style.opacity = Math.min(1, this.archTimer * 1.4).toFixed(2);
        } else {
          archEl.style.display = 'none';
        }
      }
    }
  };

  /* ========================================================================
     5. CrateCinema98 — NEXT-GEN AAA 3D/2D CRATE OPENING OVERHAUL
        Orbital Drop -> Armored Cyber-Vault -> 3 Interactive Katana Seal Cuts
        -> Epic+ Overclock Glitch Fake-Out -> 85ms Anime Impact Frame
        -> 28-Shard 3D Explosion + Volumetric Sky Beam + Hero Camera Orbit!
     ======================================================================== */
  const CrateCinema98 = {
    run(res, done, multiCount) {
      const L = s => S98.L(s);
      const r = Math.max(0, Math.min(4, res.r | 0));
      const R0 = (typeof RAR !== 'undefined' && RAR[r]) || { n: 'RARE', c: '#00f2fe' };
      const trueCol = R0.c || '#00f2fe';
      const canFake = (typeof S94 === 'undefined' || S94.on('fakeout94', true)) && r >= 2 && (r >= 3 || Math.random() < 0.7);
      const fakeR = canFake ? (r >= 4 ? 2 : r === 3 ? 1 : 0) : r;
      const fakeCol = ((typeof RAR !== 'undefined' && RAR[fakeR]) ? RAR[fakeR].c : '#00b4ff');

      const ov = document.createElement('div');
      ov.id = 'crate98-ov';
      ov.innerHTML =
        '<canvas id="crate98-3d"></canvas>' +
        '<canvas id="crate98-2d"></canvas>' +
        '<div id="crate98-hud">' +
          '<div>' +
            '<div id="crate98-top">' +
              '<div id="crate98-badge">⚡ ' + (S98.isHe() ? 'כספת סייבר 3D' : 'CYBER VAULT 3D') + (multiCount > 1 ? ' · ×' + multiCount : '') + '</div>' +
              '<button id="crate98-skip">' + L('SKIP') + ' ⏭</button>' +
            '</div>' +
            '<div id="crate98-seals"><span class="c98-seal-pip"></span><span class="c98-seal-pip"></span><span class="c98-seal-pip"></span></div>' +
          '</div>' +
          '<div id="crate98-prompt">' +
            '<div class="c98-main">' + L('SLASH THE SEALS!') + '</div>' +
            '<div class="c98-sub">' + L('SWIPE OR PRESS SPACE · 3 CUTS TO SHATTER') + '</div>' +
          '</div>' +
        '</div>' +
        '<div id="crate98-alert">⚡ ' + L('OVERCLOCK BREAK!') + '</div>' +
        '<div id="crate98-reveal">' +
          '<div class="c98-rar" id="c98-rar"></div>' +
          '<div class="c98-nm" id="c98-nm"></div>' +
          '<div class="c98-sub2" id="c98-sub2"></div>' +
          '<button class="c98-btn" id="c98-ok">' + L('COLLECT REWARD') + '</button>' +
        '</div>';
      document.body.appendChild(ov);

      const cv3 = ov.querySelector('#crate98-3d');
      const cv2 = ov.querySelector('#crate98-2d');
      const pips = [...ov.querySelectorAll('.c98-seal-pip')];
      const promptEl = ov.querySelector('#crate98-prompt');
      const alertEl = ov.querySelector('#crate98-alert');
      const revEl = ov.querySelector('#crate98-reveal');
      const skipBtn = ov.querySelector('#crate98-skip');

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      let W = window.innerWidth, H = window.innerHeight;
      cv2.width = W * dpr; cv2.height = H * dpr;
      const g2 = cv2.getContext('2d');

      const rewardImg = (typeof CrateCinema94 !== 'undefined' && CrateCinema94.buildRewardCanvas)
        ? CrateCinema94.buildRewardCanvas(res, trueCol) : null;

      // Setup reward text
      const itemNm = res.item ? L(res.item.name) : (res.cr ? '+' + fmtNum(res.cr) + ' CR' : '+' + fmtNum(res.shards) + ' ' + L('SHARDS'));
      ov.querySelector('#c98-rar').textContent = '✦ ' + L(R0.n) + (multiCount > 1 ? ' · BEST OF ×' + multiCount : '');
      ov.querySelector('#c98-rar').style.color = trueCol;
      ov.querySelector('#c98-nm').textContent = itemNm;
      ov.querySelector('#c98-sub2').textContent = res.dup ? (S98.isHe() ? 'כפול — הומר לחלקיקי שדרוג!' : 'DUPLICATE — CONVERTED TO UPGRADE SHARDS!') : (S98.isHe() ? 'נוסף לארסנל שלך!' : 'ADDED TO YOUR ARSENAL!');
      revEl.style.borderColor = trueCol;
      revEl.style.boxShadow = '0 18px 60px rgba(0,0,0,.78), 0 0 42px ' + trueCol + '66';

      // --- THREE.JS 3D STAGE ---
      let rn = null, sc = null, cam = null, crateGrp = null, coreMesh = null;
      let beamOuter = null, beamInner = null, ring1 = null, ring2 = null, sealBands = [];
      let shards = [], neonMats = [], mainLight = null, rimLight = null;
      const use3D = typeof THREE !== 'undefined';

      if (use3D) {
        try {
          const T = THREE;
          rn = new T.WebGLRenderer({ canvas: cv3, antialias: true, alpha: true });
          rn.setPixelRatio(dpr); rn.setSize(W, H, false);
          rn.outputColorSpace = T.SRGBColorSpace;
          rn.toneMapping = T.ACESFilmicToneMapping; rn.toneMappingExposure = 1.25;

          sc = new T.Scene();
          cam = new T.PerspectiveCamera(42, W / Math.max(1, H), 0.1, 120);
          cam.position.set(0, 2.9, 8.8);
          cam.lookAt(0, 1.15, 0);

          sc.add(new T.HemisphereLight(0x88b4ff, 0x090c1a, 0.85));
          const key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(5, 10, 7); sc.add(key);
          mainLight = new T.PointLight(new T.Color(fakeCol), 18, 22, 1.5); mainLight.position.set(0, 2.6, 2.8); sc.add(mainLight);
          rimLight  = new T.PointLight(new T.Color(fakeCol), 14, 18, 1.5); rimLight.position.set(-4, 3.2, -3.5); sc.add(rimLight);

          // Hexagonal reflective cyber-pedestal + neon grid ring
          const ped = new T.Mesh(new T.CylinderGeometry(3.4, 3.9, 0.45, 6), new T.MeshStandardMaterial({ color: 0x0d1328, metalness: 0.85, roughness: 0.22 }));
          ped.position.y = -0.25; sc.add(ped);
          const pedRimMat = new T.MeshBasicMaterial({ color: new T.Color(fakeCol) });
          neonMats.push(pedRimMat);
          const pedRim = new T.Mesh(new T.TorusGeometry(3.48, 0.06, 8, 48), pedRimMat);
          pedRim.rotation.x = Math.PI / 2; pedRim.position.y = 0.0; sc.add(pedRim);

          // Armored Cyber-Vault Crate
          crateGrp = new T.Group();
          crateGrp.position.y = 14; // Starts high in orbit for dramatic drop!
          sc.add(crateGrp);

          const bodyMat = new T.MeshStandardMaterial({ color: 0x151d36, metalness: 0.82, roughness: 0.26 });
          const trimMat = new T.MeshStandardMaterial({ color: 0x26345c, metalness: 0.9, roughness: 0.2 });
          const glowMat = new T.MeshBasicMaterial({ color: new T.Color(fakeCol) });
          neonMats.push(glowMat);

          // Main beveled vault chassis
          crateGrp.add(new T.Mesh(new T.BoxGeometry(2.35, 2.05, 2.35), bodyMat));
          // Corner heavy armor bumpers
          for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
            const c = new T.Mesh(new T.BoxGeometry(0.55, 0.55, 0.55), trimMat);
            c.position.set(sx * 1.02, sy * 0.88, sz * 1.02);
            crateGrp.add(c);
          }
          // Glowing energy fissures along the vault faces
          for (let i = 0; i < 3; i++) {
            const band = new T.Mesh(new T.TorusGeometry(1.75 + i * 0.08, 0.055, 6, 4), glowMat);
            band.rotation.set(i === 0 ? Math.PI / 2 : 0.65 * i, i * 0.78, i * 0.5);
            crateGrp.add(band);
            sealBands.push(band);
          }
          // Inner pulsing core revealed as seals break
          coreMesh = new T.Mesh(new T.OctahedronGeometry(0.82, 0), new T.MeshBasicMaterial({ color: 0xffffff }));
          crateGrp.add(coreMesh);

          // Orbiting runic halo rings
          ring1 = new T.Mesh(new T.TorusGeometry(2.65, 0.045, 8, 48), glowMat);
          ring1.position.y = 1.25; ring1.rotation.x = Math.PI / 2.2; sc.add(ring1);
          ring2 = new T.Mesh(new T.TorusGeometry(3.15, 0.035, 8, 48), glowMat);
          ring2.position.y = 1.25; ring2.rotation.x = -Math.PI / 2.4; sc.add(ring2);

          // Volumetric Sky Beam (hidden until explosion)
          const bMat1 = new T.MeshBasicMaterial({ color: new T.Color(trueCol), transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
          const bMat2 = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
          beamOuter = new T.Mesh(new T.CylinderGeometry(1.4, 2.2, 24, 24, 1, true), bMat1);
          beamOuter.position.y = 11.5; sc.add(beamOuter);
          beamInner = new T.Mesh(new T.CylinderGeometry(0.45, 0.95, 24, 16, 1, true), bMat2);
          beamInner.position.y = 11.5; sc.add(beamInner);
        } catch (e) {}
      }

      // --- STATE MACHINE ---
      let state = 'drop'; // drop -> ready -> fakeout -> impact -> burst -> reveal
      let t = 0, stateT = 0, cuts = 0, shakeA = 0, activeCol = fakeCol;
      let slashes2D = [], sparks2D = [], rings2D = [], ended = false, raf = 0;

      const setThemeCol = (hex) => {
        activeCol = hex;
        if (typeof THREE !== 'undefined') {
          const c = new THREE.Color(hex);
          for (const m of neonMats) m.color.copy(c);
          if (mainLight) mainLight.color.copy(c);
          if (rimLight) rimLight.color.copy(c);
        }
      };

      const spawnSparks = (cx0, cy0, n, col, spd) => {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, s = (spd || 260) * (0.35 + Math.random() * 0.95);
          sparks2D.push({ x: cx0, y: cy0, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0.45 + Math.random() * 0.55, maxL: 1, col, sz: 2 + Math.random() * 4 });
        }
      };

      const explode3D = () => {
        if (!use3D || !sc || !crateGrp) return;
        const T = THREE;
        crateGrp.visible = false;
        const sMat1 = new T.MeshStandardMaterial({ color: 0x1a2442, metalness: 0.85, roughness: 0.25, emissive: new T.Color(trueCol), emissiveIntensity: 0.45 });
        const sMat2 = new T.MeshBasicMaterial({ color: new T.Color(trueCol) });
        for (let i = 0; i < 28; i++) {
          const geo = i % 3 === 0 ? new T.OctahedronGeometry(0.28 + Math.random() * 0.22, 0) : new T.BoxGeometry(0.45 + Math.random() * 0.35, 0.22 + Math.random() * 0.2, 0.4 + Math.random() * 0.3);
          const m = new T.Mesh(geo, i % 4 === 0 ? sMat2 : sMat1);
          m.position.set((Math.random() - 0.5) * 1.4, 1.2 + (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.4);
          sc.add(m);
          const ang = Math.random() * Math.PI * 2, spd = 5 + Math.random() * 10;
          shards.push({ m, vx: Math.cos(ang) * spd, vy: 4 + Math.random() * 9, vz: Math.sin(ang) * spd, rx: (Math.random() - 0.5) * 14, ry: (Math.random() - 0.5) * 14 });
        }
      };

      const doSlash = (x1, y1, x2, y2) => {
        if (state !== 'ready') return;
        cuts++;
        const p = pips[cuts - 1];
        if (p) { p.classList.add('cut'); p.style.background = activeCol; p.style.boxShadow = '0 0 14px ' + activeCol; }

        // Blazing katana ribbon across the crate
        const ang = (x1 != null) ? Math.atan2(y2 - y1, x2 - x1) : (-0.55 + cuts * 0.48);
        slashes2D.push({ cx: W * 0.5, cy: H * 0.48, ang, life: 0.42, maxL: 0.42, col: cuts >= 3 ? trueCol : activeCol, w: cuts >= 3 ? 22 : 12 });
        spawnSparks(W * 0.5, H * 0.48, cuts >= 3 ? 42 : 22, activeCol, cuts >= 3 ? 520 : 340);
        rings2D.push({ x: W * 0.5, y: H * 0.48, r: 20, maxR: cuts >= 3 ? 440 : 240, life: 0.36, col: activeCol });
        shakeA = Math.max(shakeA, cuts >= 3 ? 22 : 11);

        // Shatter one 3D seal band per slash
        if (sealBands[cuts - 1]) sealBands[cuts - 1].visible = false;
        if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxSlash) CrateCinema94.sfxSlash(cuts >= 3);

        if (cuts >= 3) {
          promptEl.classList.add('hide');
          if (canFake) {
            state = 'fakeout'; stateT = 0;
            if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxGlitchFakeout) CrateCinema94.sfxGlitchFakeout();
          } else {
            setThemeCol(trueCol);
            state = 'impact'; stateT = 0;
          }
        }
      };

      const finishReveal = () => {
        if (state === 'reveal') return;
        setThemeCol(trueCol);
        promptEl.classList.add('hide');
        alertEl.classList.remove('on');
        if (crateGrp && crateGrp.visible) explode3D();
        state = 'reveal'; stateT = 0;
        revEl.classList.add('on');
        if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxFanfare) CrateCinema94.sfxFanfare(r);
        spawnSparks(W * 0.5, H * 0.4, 65, trueCol, 560);
        rings2D.push({ x: W * 0.5, y: H * 0.42, r: 30, maxR: Math.max(W, H) * 0.65, life: 0.65, col: trueCol });
        rings2D.push({ x: W * 0.5, y: H * 0.42, r: 10, maxR: Math.max(W, H) * 0.42, life: 0.5, col: '#ffffff' });
      };

      const cleanup = () => {
        if (ended) return;
        ended = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        try { if (rn) rn.dispose(); } catch (e) {}
        ov.remove();
        if (typeof done === 'function') done();
      };

      let dragStart = null;
      ov.addEventListener('pointerdown', e => {
        if (e.target === skipBtn || e.target.id === 'c98-ok') return;
        dragStart = { x: e.clientX, y: e.clientY };
      });
      ov.addEventListener('pointerup', e => {
        if (!dragStart) return;
        const ds = dragStart; dragStart = null;
        if (state === 'ready') doSlash(ds.x, ds.y, e.clientX, e.clientY);
      });
      const onKey = e => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (state === 'ready') doSlash();
          else if (state === 'reveal' && stateT > 0.35) cleanup();
        } else if (e.code === 'Escape') {
          finishReveal();
        }
      };
      const onResize = () => {
        W = window.innerWidth; H = window.innerHeight;
        cv2.width = W * dpr; cv2.height = H * dpr;
        if (rn && cam) { cam.aspect = W / Math.max(1, H); cam.updateProjectionMatrix(); rn.setSize(W, H, false); }
      };
      window.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize);
      skipBtn.onclick = () => { if (state === 'reveal') cleanup(); else finishReveal(); };
      ov.querySelector('#c98-ok').onclick = cleanup;

      if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.duckAudio) CrateCinema94.duckAudio(0.14, 4.0);

      let last = performance.now();
      const loop = (now) => {
        if (ended) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) * 0.001);
        last = now; t += dt; stateT += dt;
        shakeA = Math.max(0, shakeA - dt * 36);

        // --- STATE PROGRESSION ---
        if (state === 'drop') {
          const p = Math.min(1, stateT / 0.55);
          const ease = p * p * p;
          if (crateGrp) {
            crateGrp.position.y = 14 * (1 - ease) + 1.25 * ease;
            crateGrp.rotation.y = (1 - ease) * 3.5;
          }
          if (p >= 1) {
            state = 'ready'; stateT = 0; shakeA = 20;
            if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxDrop) CrateCinema94.sfxDrop();
            spawnSparks(W * 0.5, H * 0.58, 36, activeCol, 420);
            rings2D.push({ x: W * 0.5, y: H * 0.56, r: 24, maxR: 360, life: 0.48, col: activeCol });
          }
        } else if (state === 'ready') {
          if (crateGrp) {
            crateGrp.position.y = 1.25 + Math.sin(t * 4.5) * 0.14;
            crateGrp.rotation.y += dt * (0.9 + cuts * 1.35);
            crateGrp.rotation.z = Math.sin(t * (10 + cuts * 12)) * (0.02 + cuts * 0.045);
          }
        } else if (state === 'fakeout') {
          shakeA = 14;
          if (crateGrp) {
            crateGrp.rotation.y += dt * 9;
            crateGrp.scale.setScalar(1 + Math.sin(stateT * 46) * 0.08);
          }
          if (stateT >= 0.42 && activeCol !== trueCol) {
            setThemeCol(trueCol);
            alertEl.classList.add('on');
            spawnSparks(W * 0.5, H * 0.48, 50, trueCol, 560);
            rings2D.push({ x: W * 0.5, y: H * 0.48, r: 20, maxR: 480, life: 0.45, col: trueCol });
          }
          if (stateT >= 1.05) {
            alertEl.classList.remove('on');
            state = 'impact'; stateT = 0;
          }
        } else if (state === 'impact') {
          // 85ms pure black & white anime manga impact frame!
          if (stateT >= 0.088) {
            explode3D();
            shakeA = 28;
            finishReveal();
          }
        }

        // --- 3D SCENE UPDATE ---
        if (use3D && rn && sc && cam) {
          if (ring1) ring1.rotation.z = t * (1.2 + cuts * 1.4);
          if (ring2) ring2.rotation.z = -t * (1.5 + cuts * 1.2);
          if (coreMesh) { coreMesh.rotation.y = t * 5; coreMesh.scale.setScalar(0.85 + cuts * 0.18 + Math.sin(t * 14) * 0.1); }
          for (const sh of shards) {
            sh.m.position.x += sh.vx * dt; sh.m.position.y += sh.vy * dt; sh.m.position.z += sh.vz * dt;
            sh.vy -= 18 * dt;
            if (sh.m.position.y < 0.15) { sh.m.position.y = 0.15; sh.vy *= -0.42; sh.vx *= 0.8; sh.vz *= 0.8; }
            sh.m.rotation.x += sh.rx * dt; sh.m.rotation.y += sh.ry * dt;
          }
          if (beamOuter && beamInner) {
            const targetOp = state === 'reveal' ? 0.34 : 0;
            beamOuter.material.opacity += (targetOp - beamOuter.material.opacity) * Math.min(1, dt * 8);
            beamInner.material.opacity += ((targetOp * 1.6) - beamInner.material.opacity) * Math.min(1, dt * 8);
            beamOuter.rotation.y = t * 1.4;
          }
          // Dynamic camera choreography
          const camRad = state === 'reveal' ? 7.6 : (8.8 - cuts * 0.55);
          const camAng = state === 'reveal' ? t * 0.45 : Math.sin(t * 0.6) * 0.22;
          cam.position.set(
            Math.sin(camAng) * camRad + (Math.random() - 0.5) * shakeA * 0.02,
            (state === 'reveal' ? 3.5 : 2.9) + (Math.random() - 0.5) * shakeA * 0.02,
            Math.cos(camAng) * camRad
          );
          cam.lookAt(0, state === 'reveal' ? 1.85 : 1.15, 0);
          rn.render(sc, cam);
        }

        // --- 2D VFX & HOLOGRAPHIC REWARD RENDER ---
        g2.save();
        g2.scale(dpr, dpr);
        g2.clearRect(0, 0, W, H);

        if (state === 'impact') {
          // Crisp Black & White Manga/Anime Impact Frame!
          g2.fillStyle = '#05050a';
          g2.fillRect(0, 0, W, H);
          g2.strokeStyle = '#ffffff';
          for (let i = 0; i < 42; i++) {
            const a = (i / 42) * Math.PI * 2;
            g2.lineWidth = 2 + (i % 4) * 2.5;
            g2.beginPath();
            g2.moveTo(W * 0.5 + Math.cos(a) * 90, H * 0.46 + Math.sin(a) * 90);
            g2.lineTo(W * 0.5 + Math.cos(a) * Math.max(W, H), H * 0.46 + Math.sin(a) * Math.max(W, H));
            g2.stroke();
          }
          g2.save();
          g2.translate(W * 0.5, H * 0.46); g2.rotate(-0.42);
          g2.fillStyle = '#ffffff'; g2.fillRect(-W, -18, W * 2, 36);
          g2.restore();
          g2.restore();
          return;
        }

        // Expanding shockwave rings
        for (const rg of rings2D) {
          rg.life -= dt;
          const p = 1 - Math.max(0, rg.life / 0.55);
          const rad = rg.r + (rg.maxR - rg.r) * p;
          g2.globalAlpha = Math.max(0, rg.life * 2);
          g2.strokeStyle = rg.col; g2.lineWidth = Math.max(1.5, 9 * (1 - p));
          g2.beginPath(); g2.arc(rg.x, rg.y, rad, 0, Math.PI * 2); g2.stroke();
        }
        rings2D = rings2D.filter(rg => rg.life > 0);

        // Glowing Katana Slash Ribbons
        for (const sl of slashes2D) {
          sl.life -= dt;
          const k = Math.max(0, sl.life / sl.maxL);
          g2.save();
          g2.translate(sl.cx, sl.cy); g2.rotate(sl.ang);
          g2.globalAlpha = k;
          g2.shadowColor = sl.col; g2.shadowBlur = 28;
          g2.fillStyle = sl.col;
          g2.fillRect(-W * 0.75, -sl.w * k * 0.5, W * 1.5, sl.w * k);
          g2.fillStyle = '#ffffff';
          g2.fillRect(-W * 0.75, -sl.w * k * 0.2, W * 1.5, sl.w * k * 0.4);
          g2.restore();
        }
        slashes2D = slashes2D.filter(sl => sl.life > 0);

        // Sparks
        for (const sp of sparks2D) {
          sp.life -= dt;
          sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 460 * dt;
          g2.globalAlpha = Math.max(0, sp.life);
          g2.fillStyle = sp.col;
          g2.fillRect(sp.x, sp.y, sp.sz, sp.sz);
        }
        sparks2D = sparks2D.filter(sp => sp.life > 0);

        // Floating Holographic Reward Preview in the Sky Beam!
        if (state === 'reveal' && rewardImg) {
          const rise = Math.min(1, stateT / 0.42);
          const ease = 1 - Math.pow(1 - rise, 3);
          const sz = Math.min(250, W * 0.52, H * 0.34);
          const rx = W * 0.5, ry = H * 0.36 + (1 - ease) * 90 + Math.sin(t * 3.4) * 8;
          g2.save();
          g2.globalAlpha = ease;
          // Rotating rarity aura halo behind item
          const grad = g2.createRadialGradient(rx, ry, sz * 0.1, rx, ry, sz * 0.78);
          grad.addColorStop(0, trueCol + 'cc'); grad.addColorStop(0.55, trueCol + '33'); grad.addColorStop(1, 'transparent');
          g2.fillStyle = grad;
          g2.beginPath(); g2.arc(rx, ry, sz * 0.78, 0, Math.PI * 2); g2.fill();
          g2.shadowColor = trueCol; g2.shadowBlur = 28;
          g2.drawImage(rewardImg, rx - sz / 2, ry - sz / 2, sz, sz);
          g2.restore();
        }

        g2.restore();
      };
      raf = requestAnimationFrame(loop);
    }
  };


  /* ========================================================================
     6. CleanSettings98 — SLIM AAA 5-TAB SETTINGS OVERHAUL
        Replaces 20 bloated version-debug tabs & 70+ toggles (including 4
        separate FPS toggles!) with 5 crisp, logical player-facing tabs:
        SOUND · GRAPHICS · CONTROLS · KEYS · GENERAL
     ======================================================================== */
  const CleanSettings98 = {
    open() {
      if (typeof UI === 'undefined' || typeof Store === 'undefined') return;
      UI.show('settings');
      const s = Store.data.settings, box = $('setList');
      if (!box) return;
      box.textContent = '';

      // Sync unified settings defaults cleanly
      if (s.fps != null) { s.fps90 = s.fps ? 1 : 0; s.fps96 = s.fps ? 1 : 0; }

      const groups = [];
      let cur = null;
      const head = (txt) => {
        const g = { name: S98.L(txt), items: [] };
        groups.push(g);
        cur = g;
      };
      const addItem = (node) => { if (cur) cur.items.push(node); };

      const slider = (label, key) => {
        const r = el('label', 'set');
        r.appendChild(el('span', '', S98.L(label)));
        const i = document.createElement('input');
        i.type = 'range'; i.min = 0; i.max = 100;
        i.value = Math.round((s[key] == null ? 1 : s[key]) * 100);
        i.id = 'set-' + key;
        i.oninput = () => { s[key] = i.value / 100; if (typeof Aud !== 'undefined' && Aud.setVol) Aud.setVol(); Store.touch(); };
        r.appendChild(i);
        addItem(r);
      };

      const cycle = (label, key, opts, names, after) => {
        const r = el('div', 'set');
        r.appendChild(el('span', '', S98.L(label)));
        const b = el('button', 'tog on');
        const idx = () => {
          const val = s[key] == null ? opts[0] : s[key];
          const k = opts.indexOf(val);
          return k >= 0 ? k : 0;
        };
        b.textContent = S98.L(names[idx()]);
        b.id = 'set-' + key;
        b.onclick = () => {
          s[key] = opts[(idx() + 1) % opts.length];
          b.textContent = S98.L(names[idx()]);
          if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('ui');
          Store.touch();
          if (key === 'fx' && typeof setQuality === 'function') { Q.applied = 0; setQuality(s.fx === 'low' ? 0 : 2); }
          if (typeof applyUiSettings === 'function') applyUiSettings();
          if (after) after(s[key]);
        };
        r.appendChild(b);
        addItem(r);
      };

      // --- TAB 1: SOUND ---
      head('SOUND');
      slider('Sound effects', 'sfx');
      slider('Music', 'music');
      cycle('Studio Vocal Soundtrack', 'ost95', [1, 0], ['ON', 'OFF']);
      cycle('Sound FX Style', 'sfx102', [1, 0], ['STUDIO', 'CLASSIC']);
      cycle('Voice callouts', 'voice', [1, 0], ['ON', 'OFF'], v => { s.voice96 = v; });
      cycle('Vibration', 'haptics', [1, 0], ['ON', 'OFF']);

      // --- TAB 2: GRAPHICS ---
      head('GRAPHICS');
      cycle('Graphics', 'd3', [1, 2, 0], ['3D', 'CLASSIC 3D', '2D']);
      cycle('3D Visual Style', 'style3d91', ['anime', 'metallic'], ['ANIME 2D-STYLE', 'CYBER METALLIC']);
      cycle('Action 3D Camera', 'actionCam101', [1, 0], ['ACTION 3D', 'CLASSIC 3D']);
      cycle('Resolution', 'res', ['auto', 'max', 'high', 'med', 'low'], ['AUTO', 'MAX', 'HIGH', 'MEDIUM', 'LOW'], () => {
        if (typeof setQuality === 'function') { Q.applied = 0; setQuality(Q.lvl); }
        if (typeof GL3D !== 'undefined' && GL3D.cv && GL3D.size) GL3D.size();
      });
      cycle('Effects quality', 'fx', ['auto', 'ultra', 'high', 'low'], ['AUTO', 'ULTRA', 'HIGH', 'LOW']);
      cycle('Frame rate limit', 'fpsCap', [0, 240, 165, 144, 120, 60], ['MAX', '240', '165', '144', '120', '60']);
      cycle('Screen shake', 'shake', [1, 0.5, 0], ['FULL', 'LOW', 'OFF']);
      cycle('Show FPS', 'fps', [0, 1], ['OFF', 'ON'], v => { s.fps90 = v ? 1 : 0; s.fps96 = v ? 1 : 0; });
      cycle('Calm / Reduced Flashes', 'calm', [0, 1], ['OFF', 'ON'], v => { s.flashes = v ? 'off' : 'full'; });

      // --- TAB 3: CONTROLS ---
      head('CONTROLS');
      cycle('Ability Bar Display', 'dockMode98', ['auto', 'compact', 'hidden', 'always'], ['AUTO', 'COMPACT', 'HIDDEN', 'ALWAYS']);
      cycle('HUD', 'hud', ['clean', 'full'], ['CLEAN', 'FULL'], () => { if (typeof CleanHud !== 'undefined' && CleanHud.sync) CleanHud.sync(); });
      cycle('WASD Free Movement', 'wasd90', [1, 0], ['ON', 'OFF']);
      cycle('Instant Left-Click Slash', 'instSlash90', [1, 0], ['ON', 'OFF']);
      cycle('Mouse aim', 'maim', ['cursor', 'drag'], ['AT THE CURSOR', 'DRAG']);
      cycle('Crosshair', 'xh', [1, 0], ['ON', 'OFF']);
      cycle('Tap to dash', 'tap', [1, 0], ['ON', 'OFF']);
      cycle('Aim assist', 'assist', [1, 0], ['ON', 'OFF']);
      cycle('Swipe sensitivity', 'sens', [1, 2, 0], ['NORMAL', 'HIGH', 'LOW']);
      cycle('Left-handed dock', 'lefty', [0, 1], ['OFF', 'ON']);
      if (typeof HudEdit !== 'undefined' && HudEdit.open) {
        const r = el('div', 'set');
        r.appendChild(el('span', '', S98.L('Move the skill buttons')));
        const b = el('button', 'tog', S98.L('EDIT'));
        b.onclick = () => { if (typeof Aud !== 'undefined') Aud.sfx('ui'); HudEdit.open(); };
        r.appendChild(b);
        addItem(r);
      }
      if (typeof Pad !== 'undefined') {
        const r = el('div', 'set');
        r.appendChild(el('span', '', S98.L('Controller')));
        r.appendChild(el('span', Pad.on ? 'gold' : 'mute', Pad.on ? (Pad.name || S98.L('CONNECTED')).slice(0, 26) : S98.L('NOT CONNECTED')));
        addItem(r);
      }

      // --- TAB 4: KEYS ---
      head('KEYS');
      if (typeof KEY_ACTS !== 'undefined' && typeof Keys !== 'undefined') {
        const m = Keys.map();
        for (const [id, name] of KEY_ACTS) {
          const r = el('div', 'set');
          r.appendChild(el('span', '', S98.L(name)));
          const b = el('button', 'tog kb', Keys.label(m[id]));
          b.id = 'key-' + id;
          b.onclick = () => {
            if (typeof Aud !== 'undefined') Aud.sfx('ui');
            b.classList.add('wait');
            b.textContent = S98.L('PRESS A KEY');
            Keys.capture = code => {
              b.classList.remove('wait');
              const keys = Store.data.settings.keys || (Store.data.settings.keys = {});
              if (code && code !== 'Escape' && code !== 'KeyP') {
                const curM = Keys.map();
                for (const k in curM) if (k !== id && Keys.norm(curM[k]) === Keys.norm(code)) keys[k] = curM[id];
                keys[id] = code; Store.touch(); if (typeof Aud !== 'undefined') Aud.sfx('buy');
              }
              UI.openSettings();
              if (typeof PC !== 'undefined' && PC.sync) PC.sync();
            };
          };
          r.appendChild(b);
          addItem(r);
        }
        const rr = el('div', 'set');
        rr.appendChild(el('span', '', S98.L('RESET KEYS')));
        const rb = el('button', 'tog', S98.L('RESET'));
        rb.onclick = () => {
          Store.data.settings.keys = {}; Store.touch();
          if (typeof Aud !== 'undefined') Aud.sfx('ui');
          UI.openSettings();
          if (typeof PC !== 'undefined' && PC.sync) PC.sync();
        };
        rr.appendChild(rb);
        addItem(rr);
      }

      // --- v103: the systems' own switches (dropped with the old 20 tabs); rules apply from the next run ---
      head('GAMEPLAY');
      cycle('Air Juggle & Launcher [F]', 'air96', [1, 0], ['ON', 'OFF']);
      cycle('Destructible Train Props', 'props96', [1, 0], ['ON', 'OFF']);
      cycle('Dynamic Track Events', 'events96', [1, 0], ['ON', 'OFF']);
      cycle('Roof Set-Pieces', 'events91', [1, 0], ['ON', 'OFF']);
      cycle('3D Boss Armor Break', 'armor96', [1, 0], ['ON', 'OFF']);
      cycle('Blade Clash', 'clash91', [1, 0], ['ON', 'OFF']);
      cycle('Shadow Rival', 'rival91', [1, 0], ['ON', 'OFF']);
      cycle('Awakened Blade', 'awaken91', [1, 0], ['ON', 'OFF']);
      cycle('Synergies', 'syn92', [1, 0], ['ON', 'OFF']);
      cycle('Enemy Squads', 'squad92', [1, 0], ['ON', 'OFF']);
      cycle('Combat Voice Announcer', 'voice96', [1, 0], ['ON', 'OFF']);
      cycle('3D Ghost Racing', 'ghost96', [1, 0], ['ON', 'OFF']);
      cycle('Cinematic Finisher Cam', 'fcam96', [1, 0], ['ON', 'OFF']);
      // --- TAB 5: GENERAL ---
      head('GENERAL');
      if (typeof LANGS !== 'undefined') {
        cycle('Language', 'lang', ['auto'].concat(LANGS.map(l => l.id)), ['AUTO'].concat(LANGS.map(l => l.n)), () => {
          if (typeof applyLang === 'function') applyLang();
          UI.openSettings();
        });
      }
      cycle('Text size', 'tsz', [0, 1, 2], ['100%', '115%', '130%']);
      cycle('Colorblind colors', 'cb', [0, 1], ['OFF', 'ON']);
      cycle('Damage numbers', 'nums', ['all', 'crit', 'off'], ['ALL', 'CRITS', 'OFF']);
      cycle('Game speed', 'speed', [1, 0.9, 0.8], ['100%', '90%', '80%']);
      cycle('Extra shields', 'ahp', [0, 1, 2], ['NONE', '+1', '+2']);
      cycle('Pause when the window loses focus', 'blurPause', [1, 0], ['ON', 'OFF']);
      cycle('Tutorial tips', 'tips', [1, 0], ['ON', 'OFF']);

      const more = el('div', 'grid2');
      more.style.marginTop = '12px';
      [
        ["WHAT'S NEW", () => UI.openNews(() => UI.openSettings())],
        ['MUSIC ROOM', () => UI.openMusic()],
        ['SAVE CODE', () => UI.openSave()],
        ['DEVICE CHECK', () => UI.openDevice()],
        ['SEND FEEDBACK', () => UI.openReport(() => UI.openSettings())]
      ].forEach(([n, fn]) => {
        const b = el('button', 'btn', S98.L(n));
        b.onclick = () => { if (typeof Aud !== 'undefined') Aud.sfx('ui'); fn(); };
        more.appendChild(b);
      });
      addItem(more);

      // Build clean 5-tab bar (#setTabs)
      let bar = $('setTabs');
      if (!bar) { bar = el('div', 'settabs'); bar.id = 'setTabs'; box.parentElement.insertBefore(bar, box); }
      bar.textContent = '';
      const pick = (UI.setTabN && groups.some(g => g.name === UI.setTabN)) ? UI.setTabN : groups[0].name;

      groups.forEach((g, i) => {
        const wrap = el('div', 'set-grp');
        for (const it of g.items) wrap.appendChild(it);
        wrap.classList.toggle('hidden', g.name !== pick);
        box.appendChild(wrap);

        const b = el('button', g.name === pick ? 'on' : '', g.name);
        b.type = 'button';
        b.onclick = () => {
          if (typeof Aud !== 'undefined') Aud.sfx('ui');
          UI.setTabN = g.name; UI.setTabI = i;
          [...bar.children].forEach(x => x.classList.toggle('on', x === b));
          [...box.children].forEach((w, j) => w.classList.toggle('hidden', j !== i));
        };
        bar.appendChild(b);
      });

      // Keep Achievements summary populated
      const ach = $('setAch');
      if (ach && typeof ACHS !== 'undefined') {
        ach.textContent = '';
        for (const a of ACHS) {
          const got = !!(Store.data.ach && Store.data.ach[a.id]);
          const r = el('div', 'bty');
          r.appendChild(el('span', got ? '' : 'mute', (got ? '✓ ' : '· ') + S98.L(a.name) + ' — ' + S98.L(a.d)));
          r.appendChild(el('span', 'gold small', '+' + a.r));
          ach.appendChild(r);
        }
      }
    }
  };

  /* ========================================================================
     HOOK WIRING — Clean v98 Integration
     ======================================================================== */
  SmartHud98.init();

  // 1. BodyRework98 hooks into Human.build & Human.anim
  if (typeof Human !== 'undefined') {
    if (Human.build) {
      const hb98 = Human.build.bind(Human);
      Human.build = function (L, wid) {
        const g = hb98(L, wid);
        BodyRework98.dressHuman(g, L);
        return g;
      };
    }
    if (Human.anim) {
      const ha98 = Human.anim.bind(Human);
      Human.anim = function (g, o, rd, t) {
        ha98(g, o, rd, t);
        try { BodyRework98.tickAnim(g, o, rd, t); } catch (e) {}
      };
    }
  }

  // 2. BossPure3D98 hooks into Boss.draw & R3.bossModel
  if (typeof Boss !== 'undefined' && Boss.draw) {
    const bd98 = Boss.draw.bind(Boss);
    Boss.draw = function () {
      const b = this.cur;
      const pure3D = S98.on('boss3d98', true) && typeof W3D !== 'undefined' && W3D.live && W3D.models() && typeof R3 !== 'undefined' && R3.on && typeof cx !== 'undefined' && cx === W3D.cx0;
      if (pure3D && b) {
        BossPure3D98.drawTelegraphsOnly(b);
        return;
      }
      return bd98();
    };
  }
  if (typeof R3 !== 'undefined' && R3.bossModel) {
    const bm98 = R3.bossModel.bind(R3);
    R3.bossModel = function (b) {
      return BossPure3D98.upgradeBoss3D(bm98(b), b);
    };
  }

  // 3. CrateCinema98 overrides CrateCinema94.run
  if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.run) {
    const cc94 = CrateCinema94.run.bind(CrateCinema94);
    CrateCinema94.run = function (res, done, multiCount) {
      if (S98.on('crate98', true)) {
        try { CrateCinema98.run(res, done, multiCount || 1); return; } catch (e) { if (typeof errLog === 'function') errLog(e); }
      }
      return cc94(res, done, multiCount);
    };
  }

  // 4. SmartHud98 strict UI.syncHud hook & Director.begin hook
  if (typeof UI !== 'undefined' && UI.syncHud) {
    const sh98 = UI.syncHud.bind(UI);
    UI.syncHud = function () {
      const r = sh98();
      const dock = document.getElementById('dock');
      if (dock && (typeof G === 'undefined' || G.state !== 'PLAY' || G.photo)) {
        dock.classList.add('hidden');
      }
      return r;
    };
  }
  if (typeof Director !== 'undefined' && Director.begin) {
    const db98 = Director.begin.bind(Director);
    Director.begin = function () {
      SmartHud98.onRunStart();
      return db98.apply(this, arguments);
    };
  }

  // 5. Continuous HUD/Home tick + Settings tab
  if (typeof HUD !== 'undefined' && HUD.draw) {
    const hd98 = HUD.draw.bind(HUD);
    HUD.draw = function (rd) {
      try {
        HomeRedesign98.organize();
        SmartHud98.tick(rd);
      } catch (e) {}
      return hd98(rd);
    };
  }

  // 6. Replace bloated 20-tab settings with CleanSettings98 (5 crisp AAA tabs)
  if (typeof UI !== 'undefined' && UI.openSettings) {
    UI.openSettings = function () {
      try { CleanSettings98.open(); } catch (e) { if (typeof errLog === 'function') errLog(e); }
    };
  }

  // Organize home screen immediately on load as well
  setTimeout(() => { try { HomeRedesign98.organize(); } catch (e) {} }, 250);
  if (typeof Sim98 !== 'undefined') Sim98.menu.push(() => { if (UI.cur === 'title') HomeRedesign98.organize(); }); // (v103: on the title too: HUD.draw runs only in a run)
})();

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
        sh.m.scale.setScalar(1 + p * (sh.maxScale - 1));
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

/* --- MODULE 7: v104.0 PACING — the Hyper Bosses pact, and the newer systems introduced one by one --- */
(function () {
  'use strict';
  const L = s => (typeof lt === 'function' ? lt(s) : s);
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "NEW IN BATTLE": "חדש בקרב",
    "Opens at stage {0}": "נפתח בשלב {0}",
    "HEAT PACT": "ברית החום",
    "Bosses act +25% faster, with +25% health": "הבוסים פועלים מהר יותר ב-25%, עם 25% יותר חיים",
    "Blade Clash: when blades lock, tap fast to win the push.": "התנגשות להבים: כשהלהבים ננעלים, הקש מהר כדי לנצח בדחיפה.",
    "Boss armor: hit the glowing plates until they shatter, then the body takes more damage.": "שריון בוס: פגע בלוחות הזוהרים עד שיתנפצו, ואז הגוף נפגע יותר.",
    "Roof props: crates and barrels on the train can be cut and kicked into enemies.": "חפצים על הגג: ארגזים וחביות על הרכבת אפשר לחתוך ולבעוט באויבים.",
    "Launcher [F]: spend a charge to throw enemies into the air and juggle them.": "מקפצה [F]: השקע מטען כדי להעיף אויבים לאוויר ולהמשיך קומבו באוויר.",
    "Rail events: tunnels, storms and ambushes change the fight as the train runs.": "אירועי מסילה: מנהרות, סופות ומארבים משנים את הקרב בזמן שהרכבת נוסעת.",
    "Enemy squads: some groups fight together, a shield bearer protects the rest.": "חוליות אויבים: חלק מהקבוצות נלחמות יחד, ונושא מגן מגן על השאר.",
    "Synergies: chain kills, parries and cuts to light up bonus effects.": "סינרגיות: שרשר הריגות, הדיפות וחיתוכים כדי להדליק בונוסים.",
    "Awakened Blade: long combos wake your weapon for a short burst of power.": "להב מתעורר: קומבו ארוך מעיר את הנשק לפרץ כוח קצר.",
    "Shadow Rival: a dark copy of you may appear to duel you.": "יריב הצל: עותק אפל שלך עלול להופיע לדו-קרב.",
    "Heat Pact: on the title screen, take on harder rules for a bigger score.": "ברית החום: במסך הפתיחה, קבל חוקים קשים יותר תמורת ניקוד גדול יותר."
  });

  /* ---- HYPER BOSSES: the boss's own clock runs 25% faster (its moves, patterns and timers). Runs recorded on 104 or later. ---- */
  try { const hb = HeatPact92.PACTS.find(q => q.id === 'hyperBoss'); if (hb) hb.desc = 'Bosses act +25% faster, with +25% health'; } catch (e) { }
  const bu104 = Boss.update.bind(Boss);
  Boss.update = function (dt, rd) {
    if (dt > 0 && Boss.cur && G.state === 'PLAY' && simV(104)) { try { if (HeatPact92.getMap().hyperBoss) dt *= 1.25; } catch (e) { } }
    return bu104(dt, rd);
  };
  // ...and they come with 25% more health, so the faster fight is not also a shorter one (the bot runs showed it ending sooner)
  const bs104 = Boss.spawn.bind(Boss);
  Boss.spawn = function () {
    const r = bs104.apply(this, arguments);
    try { const b = Boss.cur; if (b && simV(104) && HeatPact92.getMap().hyperBoss) b.mhp = b.hp = b.mhp * 1.25; } catch (e) { }
    return r;
  };

  /* ---- the newer systems open as the story goes on (players who already played keep everything) ---- */
  const SYS = [ // need = stages cleared, as on the title screen
    { k: 'clash91', need: 2, tip: 'Blade Clash: when blades lock, tap fast to win the push.' },
    { k: 'armor96', need: 3, tip: 'Boss armor: hit the glowing plates until they shatter, then the body takes more damage.' },
    { k: 'props96', need: 3, tip: 'Roof props: crates and barrels on the train can be cut and kicked into enemies.' },
    { k: 'air96', need: 4, tip: 'Launcher [F]: spend a charge to throw enemies into the air and juggle them.' },
    { k: 'events91', need: 5, tip: 'Rail events: tunnels, storms and ambushes change the fight as the train runs.' },
    { k: 'events96', need: 5, tip: null },
    { k: 'squad92', need: 6, tip: 'Enemy squads: some groups fight together, a shield bearer protects the rest.' },
    { k: 'syn92', need: 7, tip: 'Synergies: chain kills, parries and cuts to light up bonus effects.' },
    { k: 'awaken91', need: 8, tip: 'Awakened Blade: long combos wake your weapon for a short burst of power.' },
    { k: 'rival91', need: 9, tip: 'Shadow Rival: a dark copy of you may appear to duel you.' },
    { k: 'heat', need: 10, tip: 'Heat Pact: on the title screen, take on harder rules for a bigger score.' }
  ];
  const Pace104 = {
    SYS,
    open(k) {
      try { if (typeof Gate === 'undefined') return true; Gate.init(); if (Store.data.uiAll) return true; const q = SYS.find(s => s.k === k); return !q || Gate.lv() >= q.need; } catch (e) { return true; }
    },
    stageOf(k) { const q = SYS.find(s => s.k === k); return q && STAGES[q.need - 1] ? STAGES[q.need - 1].id : ''; },
    // a tip for each system that opened since the last visit to the title screen
    announce() {
      try {
        const d = Store.data; if (d.uiAll) return; if (!d.uiTold || typeof d.uiTold !== 'object') d.uiTold = {};
        const fresh = SYS.filter(s => s.tip && this.open(s.k) && !d.uiTold['sys_' + s.k]);
        if (!fresh.length) return;
        for (const s of fresh) d.uiTold['sys_' + s.k] = 1; Store.touch();
        fresh.forEach((s, i) => setTimeout(() => { if (UI.cur === 'title' && typeof toastDom === 'function') toastDom('⚔ ' + L('NEW IN BATTLE') + ' · ' + L(s.tip)); }, 1400 + i * 3800));
      } catch (e) { }
    }
  };
  window.Pace104 = Pace104;

  // a system that has not opened yet is off in the run (the run's switches are recorded in the replay, so replays are unaffected)
  const live0 = Sim98.live.bind(Sim98);
  Sim98.live = function (k) { return Pace104.open(k) && live0(k); };

  // the HEAT PACT button waits for its stage; pacts already chosen stay in force only once it is open
  const gm0 = HeatPact92.getMap.bind(HeatPact92);
  HeatPact92.getMap = function () { const m = gm0(); return REPLAY.on || Pace104.open('heat') ? m : {}; };
  const tu0 = HeatPact92.tickUI.bind(HeatPact92);
  HeatPact92.tickUI = function () { const r = tu0.apply(this, arguments); if (!Pace104.open('heat') && this.btnEl) this.btnEl.style.setProperty('display', 'none', 'important'); return r; }; // (important: the home command bar styles its buttons)

  // the GAMEPLAY switches of systems not opened yet show where they open
  const os0 = UI.openSettings.bind(UI);
  UI.openSettings = function () {
    const r = os0.apply(this, arguments);
    try { for (const s of SYS) { const b = document.getElementById('set-' + s.k); if (b && !Pace104.open(s.k)) { b.disabled = true; b.classList.remove('on'); b.textContent = '🔒 ' + (typeof ltf === 'function' ? ltf('Opens at stage {0}', Pace104.stageOf(s.k)) : Pace104.stageOf(s.k)); } } } catch (e) { }
    return r;
  };
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () { const r = ot0.apply(this, arguments); Pace104.announce(); return r; };
})();
