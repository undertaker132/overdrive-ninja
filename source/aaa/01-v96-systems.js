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

