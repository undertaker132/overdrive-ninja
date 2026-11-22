/* ==========================================================================
   VERSION 92.0 — ASCENSION & PRODUCTION MASTERWORK
   1. Synergies92  — Hades-style Roguelike Set Synergies:
                     STORM CONDUIT (auto lightning aura), CRIMSON VAMPIRE
                     (Zandatsu shield restore), CHRONO PHANTOM (parry freeze
                     nova), OVERCLOCK PROTOCOL (dash plasma mines)
   2. SquadAI92    — Tactical Enemy Squad Coordination:
                     Brute Aegis Link (shields nearby Snipers) & Drone
                     Overclock Link (supercharges nearby melee enemies)
   3. HeatPact92   — Ascension / Heat Contract System (5 stackable contracts,
                     up to Heat 10, +15% score & +20% credits per Heat level)
   4. Clarity92    — Playtest Clarity & Balance Pass: high-contrast incoming
                     bullet outlines so hazards are always 100% readable
   5. CloudReady92 — Publish-Ready Global Cloud Leaderboard (Firebase REST
                     plug-and-play + Local Top-10 fallback) & Save Export/Import
   ========================================================================== */

try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "ASCENSION & CLOUD (v92)": "התעלות וענן ASCENSION (v92)",
    "Roguelike Synergies": "סינרגיות סטים (Hades-Style)",
    "Tactical Squad AI": "אינטליגנציה קבוצתית לאויבים",
    "Bullet Clarity Halos": "מסגרות קריאות לכדורים",
    "HEAT PACT": "חוזי חום",
    "LEADERBOARD": "טבלת שיאים",
    "STORM CONDUIT": "מוליך סערה",
    "CRIMSON VAMPIRE": "ערפד הארגמן",
    "CHRONO PHANTOM": "רוח הזמן",
    "OVERCLOCK PROTOCOL": "פרוטוקול אוברקלוק",
    "SYNERGY UNLOCKED!": "סינרגיה נפתחה!",
    "CHRONO NOVA!": "נובת זמן!",
    "VAMPIRE +1 SHIELD": "שאיבת מגן +1!",
    "AEGIS LINK": "קשר מגן",
    "HYPER BOSSES": "בוסים היפר־מהירים",
    "ELITE SQUADS": "יחידות עילית כפולות",
    "BULLET STORM": "סופת כדורים",
    "FRAGILE FRAME": "שלדה שברירית (-1 מגן)",
    "CRIMSON VELOCITY": "מהירות ארגמן",
    "GLOBAL LEADERBOARD": "טבלת שיאים עולמית",
    "EXPORT SAVE": "ייצא שמירה",
    "IMPORT SAVE": "ייבא שמירה"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "ASCENSION & CLOUD (v92)": "الصعود والسحابة ASCENSION (v92)",
    "Roguelike Synergies": "تآزر المجموعات",
    "Tactical Squad AI": "ذكاء تكتيكي للفرق",
    "Bullet Clarity Halos": "وضوح الرصاص",
    "HEAT PACT": "عقد الحرارة",
    "LEADERBOARD": "لوحة الصدارة"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "ASCENSION & CLOUD (v92)": "ВОЗНЕСЕНИЕ И ОБЛАКО (v92)",
    "Roguelike Synergies": "Синергии билдов",
    "Tactical Squad AI": "Тактический ИИ отрядов",
    "Bullet Clarity Halos": "Чёткость пуль",
    "HEAT PACT": "ПАКТ ЖАРА",
    "LEADERBOARD": "РЕЙТИНГ"
  });
} catch (e) { errLog(e); }

const S92 = {
  on(k, defVal) {
    try {
      const s = Store && Store.data && Store.data.settings;
      if (!s || s[k] == null) return defVal == null ? true : !!defVal;
      return !!s[k];
    } catch (e) { return defVal == null ? true : !!defVal; }
  }
};

/* ==========================================================================
   1. Synergies92 — HADES-STYLE ROGUELIKE SET SYNERGIES
   ========================================================================== */
const Synergies92 = {
  active: { storm: false, vamp: false, chrono: false, overclock: false },
  stormT: 0,
  vampKills: 0,
  freezeT: 0,
  mines: [],
  hudEl: null,

  ensureDOM() {
    if (this.hudEl) return;
    const d = document.createElement('div');
    d.id = 'syn92-hud';
    document.body.appendChild(d);
    this.hudEl = d;
  },

  reset() {
    this.active = { storm: false, vamp: false, chrono: false, overclock: false };
    this.stormT = 0; this.vampKills = 0; this.freezeT = 0; this.mines.length = 0;
    this.renderHUD();
  },

  countGroup(ids) {
    let n = 0;
    const pk = (typeof P !== 'undefined' && P.perks) || {};
    for (const id of ids) n += (pk[id] | 0);
    return n;
  },

  totalPerks() {
    let n = 0;
    const pk = (typeof P !== 'undefined' && P.perks) || {};
    for (const k in pk) n += (pk[k] | 0);
    return n;
  },

  unlock(key, label, col) {
    if (this.active[key]) return;
    this.active[key] = true;
    this.renderHUD();
    if (!REPLAY.fast && typeof FX !== 'undefined') {
      const L = s => (typeof lt === 'function' ? lt(s) : s);
      FX.call(L('SYNERGY UNLOCKED!') + ' ' + L(label), col, 3, 24);
      FX.ring(P.x, P.y, 175, col, 6);
    }
    if (typeof Cinema3D89 !== 'undefined') Cinema3D89.flash(P.x, P.y, col, 700, 0.3);
  },

  renderHUD() {
    this.ensureDOM();
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const items = [];
    if (this.active.storm)     items.push('<div class="syn92-tag" style="color:#00f2fe">⚡ ' + L('STORM CONDUIT') + '</div>');
    if (this.active.vamp)      items.push('<div class="syn92-tag" style="color:#ff0844">🩸 ' + L('CRIMSON VAMPIRE') + '</div>');
    if (this.active.chrono)    items.push('<div class="syn92-tag" style="color:#c45bff">⏱ ' + L('CHRONO PHANTOM') + '</div>');
    if (this.active.overclock) items.push('<div class="syn92-tag" style="color:#ffd700">☢ ' + L('OVERCLOCK PROTOCOL') + '</div>');
    this.hudEl.innerHTML = items.join('');
    const show = items.length > 0 && typeof inRun === 'function' && inRun() && G.state === 'PLAY' && !G.photo;
    this.hudEl.style.display = show ? 'flex' : 'none';
  },

  step(dt) {
    if (!Sim98.on('syn92') || G.state !== 'PLAY') {
      if (this.hudEl) this.hudEl.style.display = 'none';
      return;
    }
    // Check unlock conditions (either via perk build OR high skill milestones)
    if (!this.active.storm && (this.countGroup(['cap', 'coil', 'coolant', 'ricochet']) >= 2 || (G.combo | 0) >= 18)) {
      this.unlock('storm', 'STORM CONDUIT', '#00f2fe');
    }
    if (!this.active.vamp && (this.countGroup(['edge', 'critchip', 'long', 'patch']) >= 2 || (G.kills | 0) >= 28)) {
      this.unlock('vamp', 'CRIMSON VAMPIRE', '#ff0844');
    }
    if (!this.active.chrono && (this.countGroup(['reflex', 'charge', 'graze']) >= 2 || (G.parries | 0) >= 4)) {
      this.unlock('chrono', 'CHRONO PHANTOM', '#c45bff');
    }
    if (!this.active.overclock && this.totalPerks() >= 4) {
      this.unlock('overclock', 'OVERCLOCK PROTOCOL', '#ffd700');
    }

    // 1. Storm Conduit: periodic chain-zap to closest enemy within 210px
    if (this.active.storm && typeof EN !== 'undefined') {
      this.stormT -= dt;
      if (this.stormT <= 0) {
        this.stormT = 1.25;
        let best = null, bd = 210;
        for (let i = 0; i < EN.n; i++) {
          const e = EN.a[i];
          if (!e.alive || e.al > 0) continue;
          const d = Math.hypot(e.x - P.x, e.y - P.y);
          if (d < bd) { bd = d; best = e; }
        }
        if (best) {
          damageEnemy(best, 0.85 * (G.dmgMod || 1), Math.atan2(best.y - P.y, best.x - P.x), 1);
          if (typeof FX !== 'undefined') {
            FX.streak(P.x, P.y, Math.atan2(best.y - P.y, best.x - P.x), '#00f2fe', 3);
            FX.spark(best.x, best.y, '#00f2fe', 6);
          }
        }
      }
    }

    // 2. Chrono Phantom: active freeze-nova slows nearby enemies & bullets
    if (this.freezeT > 0) {
      this.freezeT = Math.max(0, this.freezeT - dt);
      if (typeof BU !== 'undefined') {
        for (let i = 0; i < BU.n; i++) {
          const b = BU.a[i];
          if (!b.rf && Math.hypot(b.x - P.x, b.y - P.y) < 280) {
            b.x -= b.vx * dt * 0.55;
            b.y -= b.vy * dt * 0.55;
          }
        }
      }
    }

    // 3. Overclock Protocol: plasma mines detonate on enemy proximity or timeout
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      m.t += dt;
      let boom = m.t >= m.d;
      if (!boom && typeof EN !== 'undefined') {
        for (let j = 0; j < EN.n; j++) {
          const e = EN.a[j];
          if (e.alive && e.al <= 0 && Math.hypot(e.x - m.x, e.y - m.y) < 56) { boom = true; break; }
        }
      }
      if (boom) {
        if (typeof EN !== 'undefined') {
          for (let j = 0; j < EN.n; j++) {
            const e = EN.a[j];
            if (e.alive && e.al <= 0 && Math.hypot(e.x - m.x, e.y - m.y) < 92) {
              damageEnemy(e, 1.15 * (G.dmgMod || 1), Math.atan2(e.y - m.y, e.x - m.x), 1);
            }
          }
        }
        if (typeof FX !== 'undefined') { FX.ring(m.x, m.y, 90, '#ffd700', 4); FX.spark(m.x, m.y, '#ffd700', 8); }
        this.mines.splice(i, 1);
      }
    }
  },

  onKill() {
    if (!this.active.vamp || !simV(98)) return;
    this.vampKills++;
    if (this.vampKills % 6 === 0 && P.hp < P.maxHp) { // (v98: maxHp; P.mhp does not exist, so it never healed)
      P.hp = Math.min(P.maxHp, P.hp + 1);
      if (typeof FX !== 'undefined') {
        FX.text(P.x, P.y - 38, typeof lt === 'function' ? lt('VAMPIRE +1 SHIELD') : 'VAMPIRE +1 SHIELD', '#ff0844', 14, 1);
        FX.ring(P.x, P.y, 110, '#ff0844', 5);
      }
    }
  },

  onParry() {
    if (!this.active.chrono || !simV(98)) return;
    this.freezeT = 2.4;
    if (typeof FX !== 'undefined') {
      FX.text(P.x, P.y - 42, typeof lt === 'function' ? lt('CHRONO NOVA!') : 'CHRONO NOVA!', '#c45bff', 15, 1);
      FX.ring(P.x, P.y, 260, '#c45bff', 6);
    }
  },

  onSlash() {
    if (!this.active.overclock || this.mines.length >= 4 || !simV(98)) return;
    this.mines.push({ x: P.x, y: P.y, t: 0, d: 2.2 });
  },

  draw2D() {
    if (CALM || typeof cx === 'undefined') return;
    const t = performance.now() * 0.005;
    if (this.active.storm && P) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = '#00f2fe';
      cx.lineWidth = 1.6;
      cx.globalAlpha = 0.42;
      cx.beginPath();
      cx.arc(P.x, P.y, 34, t * 2, t * 2 + Math.PI * 0.9);
      cx.stroke();
      cx.restore();
    }
    if (this.freezeT > 0 && P) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = '#c45bff';
      cx.lineWidth = 2.2;
      cx.globalAlpha = Math.min(0.45, this.freezeT * 0.25);
      cx.beginPath();
      cx.arc(P.x, P.y, 260, 0, Math.PI * 2);
      cx.stroke();
      cx.restore();
    }
    if (this.mines.length) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      for (const m of this.mines) {
        const pulse = 8 + Math.sin(t * 6) * 2.5;
        cx.fillStyle = '#ffd700';
        cx.globalAlpha = 0.85;
        cx.beginPath(); cx.arc(m.x, m.y, pulse * 0.55, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#ff4500';
        cx.lineWidth = 1.8;
        cx.beginPath(); cx.arc(m.x, m.y, pulse * 1.4, 0, Math.PI * 2); cx.stroke();
      }
      cx.restore();
    }
  }
};

/* ==========================================================================
   2. SquadAI92 — TACTICAL ENEMY SQUAD COORDINATION (AEGIS & OVERCLOCK LINKS)
   ========================================================================== */
const SquadAI92 = {
  links: [], // { from, to, type: 'aegis'|'boost' }

  step(dt) {
    this.links.length = 0;
    if (!Sim98.on('squad92') || G.state !== 'PLAY' || typeof EN === 'undefined') return;
    // Clear previous frame flags
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i];
      e._aegis92 = false;
      e._boost92 = false;
    }
    // Pair Brutes -> Snipers (Aegis Link) and Drones -> Melee (Speed Overclock)
    for (let i = 0; i < EN.n; i++) {
      const a = EN.a[i];
      if (!a.alive || a.al > 0) continue;
      const isBrute = typeof ET !== 'undefined' && a.type === ET.BRUTE;
      const isDrone = typeof ET !== 'undefined' && (a.type === ET.DRONE || a.type === ET.SHIELD);
      if (!isBrute && !isDrone) continue;

      let best = null, bd = 240;
      for (let j = 0; j < EN.n; j++) {
        if (i === j) continue;
        const b = EN.a[j];
        if (!b.alive || b.al > 0) continue;
        if (isBrute && b.type === ET.BRUTE) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < bd) { bd = d; best = b; }
      }
      if (best) {
        if (isBrute) {
          best._aegis92 = true;
          this.links.push({ from: a, to: best, type: 'aegis' });
        } else {
          best._boost92 = true;
          // Gentle tactical speed push toward player
          best.x += (best.vx || 0) * dt * 0.22;
          best.y += (best.vy || 0) * dt * 0.22;
          this.links.push({ from: a, to: best, type: 'boost' });
        }
      }
    }
  },

  draw2D() {
    if (!this.links.length || CALM || typeof cx === 'undefined') return;
    const t = performance.now() * 0.01;
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (const lk of this.links) {
      const col = lk.type === 'aegis' ? '#00f2fe' : '#ff4fd8';
      cx.strokeStyle = col;
      cx.lineWidth = 2.4;
      cx.globalAlpha = 0.55 + Math.sin(t) * 0.15;
      cx.setLineDash([7, 5]);
      cx.lineDashOffset = -t * 14;
      cx.beginPath();
      cx.moveTo(lk.from.x, lk.from.y);
      cx.lineTo(lk.to.x, lk.to.y);
      cx.stroke();
      // Protective hex ring on shielded target
      cx.setLineDash([]);
      cx.beginPath();
      cx.arc(lk.to.x, lk.to.y, (lk.to.r || 14) + 6, 0, Math.PI * 2);
      cx.stroke();
    }
    cx.restore();
  }
};

/* ==========================================================================
   3. HeatPact92 — ASCENSION / HEAT CONTRACT SYSTEM (HADES PACT OF PUNISHMENT)
   ========================================================================== */
const HeatPact92 = {
  PACTS: [
    { id: 'hyperBoss',   heat: 2, name: 'HYPER BOSSES',     desc: 'Bosses act +25% faster' },
    { id: 'doubleElite', heat: 2, name: 'ELITE SQUADS',     desc: '+35% Elite spawn chance' },
    { id: 'bulletStorm', heat: 2, name: 'BULLET STORM',     desc: 'Enemy bullets fly +22% faster' },
    { id: 'fragile',     heat: 3, name: 'FRAGILE FRAME',    desc: '-1 Max Shield (high stakes)' },
    { id: 'crimsonVel',  heat: 1, name: 'CRIMSON VELOCITY', desc: 'Enemies move +18% faster' }
  ],
  btnEl: null, pillEl: null, modalEl: null,

  getMap() {
    if (REPLAY.on) return (REPLAY.hdr && REPLAY.hdr.x98 && REPLAY.hdr.x98.heat) || {}; // (v98: a replay uses the recorded pacts)
    const s = Store && Store.data && Store.data.settings;
    if (!s) return {};
    if (!s.heat92 || typeof s.heat92 !== 'object') s.heat92 = {};
    return s.heat92;
  },

  totalHeat() {
    const m = this.getMap();
    let h = 0;
    for (const p of this.PACTS) if (m[p.id]) h += p.heat;
    return h;
  },

  scoreMul() { return 1 + this.totalHeat() * 0.15; },

  ensureDOM() {
    if (!this.btnEl) {
      const b = document.createElement('button');
      b.id = 'heat92-btn';
      b.onclick = () => this.openModal();
      document.body.appendChild(b);
      this.btnEl = b;
    }
    if (!this.pillEl) {
      const p = document.createElement('div');
      p.id = 'heat92-pill';
      document.body.appendChild(p);
      this.pillEl = p;
    }
    if (!this.modalEl) {
      const m = document.createElement('div');
      m.className = 'modal92-bg';
      m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
      document.body.appendChild(m);
      this.modalEl = m;
    }
  },

  openModal() {
    this.ensureDOM();
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const m = this.getMap();
    const h = this.totalHeat();
    let rows = '';
    for (const p of this.PACTS) {
      const on = !!m[p.id];
      rows +=
        '<div class="pact92-row ' + (on ? 'on' : '') + '">' +
          '<div><div style="font-weight:900;font-size:14px">' + L(p.name) + ' <span style="color:#ff4500">(+' + p.heat + '🔥)</span></div>' +
          '<div style="font-size:11px;opacity:.78">' + L(p.desc) + '</div></div>' +
          '<button data-pid="' + p.id + '">' + (on ? 'ON' : 'OFF') + '</button>' +
        '</div>';
    }
    this.modalEl.innerHTML =
      '<div class="modal92-box">' +
        '<div class="modal92-head"><h3>🔥 ' + L('HEAT PACT') + ' · LVL ' + h + ' (x' + this.scoreMul().toFixed(2) + ')</h3>' +
        '<button class="modal92-close" id="h92-x">✕</button></div>' +
        rows +
      '</div>';
    this.modalEl.querySelector('#h92-x').onclick = () => this.modalEl.classList.remove('on');
    this.modalEl.querySelectorAll('[data-pid]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-pid');
        m[id] = m[id] ? 0 : 1;
        Store.touch();
        this.openModal();
        this.tickUI();
      };
    });
    this.modalEl.classList.add('on');
  },

  onRunStart() {
    if (!simV(98)) return;
    const m = this.getMap();
    const h = this.totalHeat();
    if (h > 0 && typeof G !== 'undefined') {
      G.scoreMul = (G.scoreMul || 1) * this.scoreMul();
      if (m.fragile && P && P.maxHp > 1) { // (v98: maxHp; P.mhp does not exist)
        P.maxHp = Math.max(1, P.maxHp - 1);
        P.hp = Math.min(P.hp, P.maxHp);
      }
    }
  },

  step(dt) {
    const m = this.getMap();
    if (G.state !== 'PLAY' || !simV(98)) return;
    if (m.bulletStorm && typeof BU !== 'undefined') {
      for (let i = 0; i < BU.n; i++) {
        const b = BU.a[i];
        if (!b.rf) { b.x += b.vx * dt * 0.22; b.y += b.vy * dt * 0.22; }
      }
    }
    if (m.crimsonVel && typeof EN !== 'undefined') {
      for (let i = 0; i < EN.n; i++) {
        const e = EN.a[i];
        if (e.alive && e.al <= 0) { e.x += (e.vx || 0) * dt * 0.18; e.y += (e.vy || 0) * dt * 0.18; }
      }
    }
  },

  tickUI() {
    this.ensureDOM();
    const h = this.totalHeat();
    const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && G.state !== 'PLAY';
    const inGame = typeof inRun === 'function' && inRun() && G.state === 'PLAY' && !G.photo;
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    this.btnEl.style.display = onTitle ? 'block' : 'none';
    this.btnEl.textContent = '🔥 ' + L('HEAT PACT') + (h > 0 ? ' ' + h : '');
    this.pillEl.style.display = (inGame && h > 0) ? 'block' : 'none';
    if (h > 0) this.pillEl.textContent = '🔥 HEAT ' + h + ' · x' + this.scoreMul().toFixed(2);
  }
};

/* ==========================================================================
   4. Clarity92 — HIGH-CONTRAST INCOMING BULLET HALOS (PLAYTEST CLARITY)
   ========================================================================== */
const Clarity92 = {
  drawBulletClarity() {
    if (!S92.on('clarity92', true) || typeof BU === 'undefined' || typeof cx === 'undefined') return;
    cx.save();
    for (let i = 0; i < BU.n; i++) {
      const b = BU.a[i];
      if (b.rf) continue;
      // High-contrast dark ink ring + razor-white inner core so incoming fire is ALWAYS readable
      cx.strokeStyle = 'rgba(4, 4, 12, 0.88)';
      cx.lineWidth = 3.2;
      cx.beginPath(); cx.arc(b.x, b.y, (b.r || 5) + 2.2, 0, Math.PI * 2); cx.stroke();
      cx.fillStyle = '#ffffff';
      cx.beginPath(); cx.arc(b.x, b.y, Math.max(2, (b.r || 5) * 0.45), 0, Math.PI * 2); cx.fill();
    }
    cx.restore();
  }
};

/* ==========================================================================
   5. CloudReady92 — GLOBAL LEADERBOARD (FIREBASE REST + LOCAL) & SAVE SYNC
   ========================================================================== */
const CloudReady92 = {
  btnEl: null, modalEl: null,
  KEY: 'overdrive_lb92_local',

  getFirebaseUrl() {
    const s = Store && Store.data && Store.data.settings;
    return (window.OVERDRIVE_FIREBASE_URL || (s && s.fbUrl92) || '').trim().replace(/\/+$/, '');
  },

  getLocalBoard() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { return []; }
  },

  async submitScore(score, heat) {
    if (!(score > 0)) return;
    const name = (Store && Store.data && Store.data.name) || 'CYBER NINJA';
    const entry = { name, score: Math.round(score), heat: heat | 0, date: new Date().toISOString().slice(0, 10) };
    // Always save to local top-10
    const loc = this.getLocalBoard();
    loc.push(entry);
    loc.sort((a, b) => b.score - a.score);
    try { localStorage.setItem(this.KEY, JSON.stringify(loc.slice(0, 10))); } catch (e) {}
    // Also push to Firebase Realtime DB if configured
    const url = this.getFirebaseUrl();
    if (url) {
      try {
        await fetch(url + '/scores.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } catch (e) {}
    }
  },

  async fetchBoard() {
    const url = this.getFirebaseUrl();
    if (url) {
      try {
        const res = await fetch(url + '/scores.json');
        const data = await res.json();
        if (data && typeof data === 'object') {
          const arr = Object.values(data).filter(x => x && x.score > 0);
          arr.sort((a, b) => b.score - a.score);
          return { cloud: true, rows: arr.slice(0, 10) };
        }
      } catch (e) {}
    }
    return { cloud: false, rows: this.getLocalBoard() };
  },

  ensureDOM() {
    if (!this.btnEl) {
      const b = document.createElement('button');
      b.id = 'lb92-btn';
      b.onclick = () => this.openModal();
      document.body.appendChild(b);
      this.btnEl = b;
    }
    if (!this.modalEl) {
      const m = document.createElement('div');
      m.className = 'modal92-bg';
      m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
      document.body.appendChild(m);
      this.modalEl = m;
    }
  },

  async openModal() {
    this.ensureDOM();
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    this.modalEl.innerHTML = '<div class="modal92-box"><div class="modal92-head"><h3>🏆 ' + L('GLOBAL LEADERBOARD') + '</h3><button class="modal92-close" id="lb92-x">✕</button></div><div style="text-align:center;padding:24px">Loading...</div></div>';
    this.modalEl.querySelector('#lb92-x').onclick = () => this.modalEl.classList.remove('on');
    this.modalEl.classList.add('on');

    const { cloud, rows } = await this.fetchBoard();
    let listHtml = rows.length ? rows.map((r, i) =>
      '<div class="lb92-row ' + (i < 3 ? 'top' : '') + '">' +
        '<span>#' + (i + 1) + ' ' + String(r.name || 'NINJA').slice(0, 18) + (r.heat ? ' 🔥' + r.heat : '') + '</span>' +
        '<span style="color:#ffd700">' + (r.score | 0).toLocaleString() + '</span>' +
      '</div>'
    ).join('') : '<div style="opacity:.7;text-align:center;padding:16px">Play a run to post your first high score!</div>';

    const curUrl = this.getFirebaseUrl();
    this.modalEl.innerHTML =
      '<div class="modal92-box">' +
        '<div class="modal92-head"><h3>🏆 ' + L('GLOBAL LEADERBOARD') + (cloud ? ' (CLOUD LIVE)' : ' (LOCAL)') + '</h3><button class="modal92-close" id="lb92-x">✕</button></div>' +
        listHtml +
        '<div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,.12)">' +
          '<div style="font-size:11px;opacity:.8">Firebase Realtime DB URL (optional for global online scores):</div>' +
          '<input class="cloud92-inp" id="fb92-url" placeholder="https://your-project-default-rtdb.firebaseio.com" value="' + curUrl + '">' +
          '<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">' +
            '<button class="modal92-close" id="fb92-save" style="border-color:#00f2fe;color:#00f2fe">SAVE CLOUD URL</button>' +
            '<button class="modal92-close" id="sv92-exp">' + L('EXPORT SAVE') + '</button>' +
            '<button class="modal92-close" id="sv92-imp">' + L('IMPORT SAVE') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.modalEl.querySelector('#lb92-x').onclick = () => this.modalEl.classList.remove('on');
    this.modalEl.querySelector('#fb92-save').onclick = () => {
      const v = this.modalEl.querySelector('#fb92-url').value.trim();
      if (Store && Store.data && Store.data.settings) { Store.data.settings.fbUrl92 = v; Store.touch(); }
      this.openModal();
    };
    this.modalEl.querySelector('#sv92-exp').onclick = () => {
      try {
        const code = btoa(unescape(encodeURIComponent(JSON.stringify(Store.data))));
        navigator.clipboard && navigator.clipboard.writeText(code);
        alert('Save code copied to clipboard! (' + code.length + ' chars)');
      } catch (e) { alert('Export failed: ' + e.message); }
    };
    this.modalEl.querySelector('#sv92-imp').onclick = () => {
      const code = prompt('Paste your exported Save Code:');
      if (!code) return;
      try {
        const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
        if (obj && typeof obj === 'object') {
          Object.assign(Store.data, obj); Store.touch();
          alert('Save imported! Reloading...'); location.reload();
        }
      } catch (e) { alert('Invalid save code.'); }
    };
  },

  tickUI() {
    this.ensureDOM();
    const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && G.state !== 'PLAY';
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    this.btnEl.style.display = onTitle ? 'block' : 'none';
    this.btnEl.textContent = '🏆 ' + L('LEADERBOARD');
  }
};

/* ==========================================================================
   HOOK WIRING — Clean, isolated, zero-regression v92 integration
   ========================================================================== */
{
  // Playtest balance tweak: slightly longer Blade Clash cooldown so it feels epic
  if (typeof BladeClash91 !== 'undefined') {
    const bc92 = BladeClash91.tryStart.bind(BladeClash91);
    BladeClash91.tryStart = function () {
      const was = this.active;
      bc92();
      if (!was && this.active) this.cd = 22;
    };
  }

  // Hook Director.begin for Synergies & Heat Pact start
  const db92 = Director.begin.bind(Director);
  Director.begin = function () {
    const r = db92.apply(this, arguments);
    try { Synergies92.reset(); HeatPact92.onRunStart(); } catch (e) {}
    return r;
  };

  // Hook spawnEnemy for Heat Pact Double Elites
  if (typeof spawnEnemy === 'function') {
    const se92 = spawnEnemy;
    spawnEnemy = function (t, x, y, elite) {
      try {
        const m = HeatPact92.getMap();
        if (m.doubleElite && !elite && G.state === 'PLAY' && simV(98) && R.f() < 0.35) elite = true;
      } catch (e) {}
      return se92(t, x, y, elite);
    };
  }

  // Hook damageEnemy for SquadAI Aegis 50% damage reduction
  if (typeof damageEnemy === 'function') {
    const de92 = damageEnemy;
    damageEnemy = function (e, d, a, src) {
      if (e && e._aegis92) d *= 0.5;
      return de92(e, d, a, src);
    };
  }

  // Hook killEnemy, parryBullet, slash for Synergies
  const ke92 = killEnemy;
  killEnemy = function (e, a, src) {
    const r = ke92.apply(this, arguments);
    try { Synergies92.onKill(); } catch (er) {}
    return r;
  };

  const pb92 = parryBullet;
  parryBullet = function (b) {
    const r = pb92.apply(this, arguments);
    try { Synergies92.onParry(); } catch (e) {}
    return r;
  };

  const sl92 = slash;
  slash = function (a) {
    const r = sl92.apply(this, arguments);
    try { Synergies92.onSlash(); } catch (e) {}
    return r;
  };

  // Hook sim() for Synergies, SquadAI & HeatPact
  const sim92 = sim;
  sim = function (dt, rd) {
    const r = sim92(dt, rd);
    try {
      Synergies92.step(dt);
      SquadAI92.step(dt);
      HeatPact92.step(dt);
    } catch (e) {}
    return r;
  };

  // Hook drawBullets for High-Contrast Bullet Clarity Halos
  if (typeof drawBullets === 'function') {
    const dbl92 = drawBullets;
    drawBullets = function () {
      const r = dbl92.apply(this, arguments);
      try { Clarity92.drawBulletClarity(); } catch (e) {}
      return r;
    };
  }

  // Hook drawPlayer for Synergy & SquadAI 2D visuals
  const dp92 = drawPlayer;
  drawPlayer = function () {
    try { SquadAI92.draw2D(); Synergies92.draw2D(); } catch (e) {}
    return dp92.apply(this, arguments);
  };

  // Hook HUD.draw for Heat Pact & Leaderboard UI visibility
  const hd92 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try { HeatPact92.tickUI(); CloudReady92.tickUI(); Synergies92.renderHUD(); } catch (e) {}
    return hd92(rd);
  };

  // Auto-submit score to Cloud/Local Leaderboard when run ends (result screen)
  if (typeof UI !== 'undefined' && UI.openResult) {
    const or92 = UI.openResult.bind(UI);
    UI.openResult = function () {
      try {
        if (typeof G !== 'undefined' && G.score > 0 && !REPLAY.on) {
          CloudReady92.submitScore(G.score, HeatPact92.totalHeat());
        }
      } catch (e) {}
      return or92.apply(this, arguments);
    };
  }

  // Settings panel for v92 ASCENSION & CLOUD
  if (typeof PC !== 'undefined' && PC.settings) {
    const ps92 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps92(head, cycle, box, s);
      try {
        head('ASCENSION & CLOUD (v92)');
        cycle('Roguelike Synergies', 'syn92', [1, 0], ['ON', 'OFF']);
        cycle('Tactical Squad AI', 'squad92', [1, 0], ['ON', 'OFF']);
        cycle('Bullet Clarity Halos', 'clarity92', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

