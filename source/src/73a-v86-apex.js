
/* ==========================================================================
   VERSION 86.0 — THE APEX UPDATE
   1. Impact86   — Anime/manga impact frames, radial focus speed-lines &
                   chromatic punch on executions, perfect parries, elemental
                   reactions and boss phase/finisher breaks (render only)
   2. Slash3D86  — 3D glowing crescent slash ribbons, molten roof slash scars
                   that cool over time, and 3D shockwave rings in Three.js
   3. World86    — 3D wet-roof rain splash ripples, passing neon pulses &
                   blazing Overdrive dynamic 3D lighting + bloom surge
   4. Tact86     — Tactical aim kill/execution prediction brackets, parryable
                   bullet highlight rings along the dash line & off-screen
                   threat radar chevrons (render only)
   5. HeroRing86 — Diegetic circular combat ring around the hero (dash ticks,
                   blade heat arc & S/SS/SSS style aura; toggleable)
   6. Apex86     — Phantom Step (close-graze dash refill + afterimage) &
                   Style Overcharge (SS/SSS faster recharge), gated on simV(86)
   7. Audio86    — Slow-mo & hit-stop low-pass sweep on Aud.mf, rising combo
                   pentatonic steel harmonics & sub-bass impact drops
   ========================================================================== */

/* ---- 4-language translations for v86 ---- */
try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "APEX EDITION": "מהדורת APEX",
    "IMPACT FRAMES": "פריימי אימפקט",
    "Impact frames": "פריימי אימפקט (אנימה)",
    "Hero combat ring": "טבעת קרב סביב הגיבור",
    "PHANTOM STEP": "צעד רפאים",
    "STYLE OVERCHARGE": "טעינת סטייל",
    "KILL": "חיסול",
    "EXEC": "הוצאה להורג",
    "PARRY": "פארי",
    "ANIME IMPACT FRAMES": "פריימי אימפקט בסגנון אנימה",
    "Executions, perfect parries, elemental reactions and boss breaks now trigger razor-sharp manga impact frames with radial speed-lines and chromatic punch (toggleable in Settings).": "הוצאות להורג, פארי מושלם, תגובות יסוד ושבירת שלבי בוס מפעילים כעת פריימי אימפקט חדים בסגנון אנימה עם קווי מהירות רדיאליים והבזק כרומטי (ניתן לכיבוי בהגדרות).",
    "3D SLASH RIBBONS & ROOF SCARS": "שובלי חיתוך בתלת־ממד וצלקות גג",
    "In 3D, every dash carves a glowing crescent energy ribbon through the air and burns a cooling neon scar into the wet train roof, alongside 3D shockwave rings, rain ripples and blazing Overdrive lighting.": "בתלת־ממד, כל זינוק חורט באוויר שובל אנרגיה זוהר ומשאיר צלקת להב לוהטת על גג הרכבת הרטוב, לצד גלי הלם תלת־ממדיים, אדוות גשם ותאורת אוברדרייב עוצמתית.",
    "TACTICAL AIM & HERO RING": "כיוון טקטי וטבעת קרב",
    "Holding aim now previews lethal hits, executions and parryable bullets right along your trajectory (including wall bounces), adds off-screen threat chevrons, and wraps a sleek charge/heat ring around your hero.": "החזקת כיוון מציגה כעת מראש פגיעות קטלניות, הוצאות להורג וכדורים שניתן להדוף לאורך המסלול (כולל קפיצה מקיר), מוסיפה חצי איום מחוץ למסך, ועוטפת את הגיבור בטבעת מטענים וחום.",
    "PHANTOM STEP & DYNAMIC AUDIO": "צעד רפאים ואודיו דינמי",
    "Last-millisecond bullet grazes trigger PHANTOM STEP (+1 dash charge & Overdrive), SS/SSS style ranks boost dash recharge, slow-motion sweeps a cinematic low-pass filter over the soundtrack, and combos ring with rising steel harmonics.": "כמעט־פגיעות ברגע האחרון מפעילות צעד רפאים (טעינת זינוק + אוברדרייב), דרגות SS/SSS מאיצות טעינת זינוק, ההילוך האיטי מעמעם קולנועית את הפסקול, ורצפי קומבו מצלצלים בהרמוניות פלדה עולות."
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "APEX EDITION": "إصدار APEX",
    "Impact frames": "إطارات الصدمة (أنمي)",
    "Hero combat ring": "حلقة القتال حول البطل",
    "PHANTOM STEP": "خطوة الشبح",
    "STYLE OVERCHARGE": "شحن الأسلوب",
    "KILL": "قضاء",
    "EXEC": "إعدام",
    "ANIME IMPACT FRAMES": "إطارات صدمة بأسلوب الأنمي",
    "3D SLASH RIBBONS & ROOF SCARS": "أشرطة قطع ثلاثية الأبعاد وندوب السطح",
    "TACTICAL AIM & HERO RING": "تصويب تكتيكي وحلقة البطل",
    "PHANTOM STEP & DYNAMIC AUDIO": "خطوة الشبح وصوت ديناميكي"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "APEX EDITION": "APEX EDITION",
    "Impact frames": "Кадры удара (аниме)",
    "Hero combat ring": "Боевое кольцо героя",
    "PHANTOM STEP": "ПРИЗРАЧНЫЙ ШАГ",
    "STYLE OVERCHARGE": "ПЕРЕГРУЗКА СТИЛЯ",
    "KILL": "ДОБИТЬ",
    "EXEC": "КАЗНЬ",
    "ANIME IMPACT FRAMES": "АНИМЕ-КАДРЫ УДАРА",
    "3D SLASH RIBBONS & ROOF SCARS": "3D-ШЛЕЙФЫ И СЛЕДЫ НА КРЫШЕ",
    "TACTICAL AIM & HERO RING": "ТАКТИЧЕСКИЙ ПРИЦЕЛ И КОЛЬЦО",
    "PHANTOM STEP & DYNAMIC AUDIO": "ПРИЗРАЧНЫЙ ШАГ И ДИНАМИЧНЫЙ ЗВУК"
  });
} catch (e) { errLog(e); }

/* ==========================================================================
   1. Impact86 — ANIME IMPACT FRAMES, MANGA SPEED-LINES & CHROMATIC PUNCH
   ========================================================================== */
const Impact86 = {
  t: 0, dur: 0, x: 210, y: 380, col: '#00f2fe', heavy: 0, rings: [],
  enabled() {
    const s = Store.data && Store.data.settings;
    if (CALM) return false;
    if (typeof Juice !== 'undefined' && Juice.flashMode && Juice.flashMode() === 'off') return false;
    return !(s && s.imp86 === 0);
  },
  fire(x, y, col, heavy) {
    if (!this.enabled() || (REPLAY.on && REPLAY.fast)) return;
    this.x = x != null ? x : P.x;
    this.y = y != null ? y : P.y;
    this.col = col || P.ca || '#00f2fe';
    this.heavy = heavy ? 1 : 0;
    this.dur = heavy ? 0.14 : 0.085;
    this.t = this.dur;
    this.rings.push({ x: this.x, y: this.y, t: 0, dur: heavy ? 0.42 : 0.28, r: heavy ? 220 : 135, col: this.col, heavy: this.heavy });
    if (this.rings.length > 8) this.rings.shift();
  },
  draw(rd) {
    if (!inRun()) { this.t = 0; this.rings.length = 0; return; }
    const d = rd || 1 / 60;
    if (this.t > 0) {
      this.t = Math.max(0, this.t - d);
      const u = 1 - this.t / Math.max(0.01, this.dur);
      const sx = this.x, sy = this.y;
      cx.save();
      // High-contrast brief manga flash on the first 35% of the impact
      if (u < 0.35 && this.heavy) {
        const a = (1 - u / 0.35) * 0.34;
        cx.fillStyle = u < 0.14 ? '#05060f' : '#ffffff';
        cx.globalAlpha = a;
        cx.fillRect(-40, -40, V.VW + 80, V.VH + 80);
      }
      // Radial anime speed-lines focused on the impact point
      const rays = this.heavy ? 28 : 16;
      const alpha = (1 - u) * (this.heavy ? 0.72 : 0.46);
      cx.globalAlpha = alpha;
      cx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < rays; i++) {
        const ang = (i / rays) * TAU + (this.heavy ? 0.19 : 0.07) * (i % 3);
        const inner = (this.heavy ? 54 : 42) + u * 65 + (i % 4) * 14;
        const outer = Math.max(V.VW, V.VH) * 0.95;
        const w = (i % 3 === 0 ? 3.2 : 1.4) * (1 - u * 0.6);
        cx.strokeStyle = i % 4 === 0 ? '#ffffff' : this.col;
        cx.lineWidth = w;
        cx.beginPath();
        cx.moveTo(sx + Math.cos(ang) * inner, sy + Math.sin(ang) * inner);
        cx.lineTo(sx + Math.cos(ang) * outer, sy + Math.sin(ang) * outer);
        cx.stroke();
      }
      // Cross-star flash right at impact center
      if (u < 0.55) {
        const k = 1 - u / 0.55;
        cx.fillStyle = '#ffffff';
        cx.globalAlpha = k * 0.9;
        for (let b = 0; b < 2; b++) {
          cx.save();
          cx.translate(sx, sy);
          cx.rotate(b * Math.PI * 0.5 + (this.heavy ? 0.35 : 0));
          const len = (this.heavy ? 115 : 70) * k;
          const wid = (this.heavy ? 9 : 5) * k;
          cx.beginPath();
          cx.moveTo(-len, 0); cx.lineTo(0, -wid); cx.lineTo(len, 0); cx.lineTo(0, wid); cx.closePath();
          cx.fill();
          cx.restore();
        }
      }
      cx.restore();
    }
    // Crisp expanding neon shockwaves
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.t += d;
      if (r.t >= r.dur) { this.rings.splice(i, 1); continue; }
      const u = r.t / r.dur, e = 1 - Math.pow(1 - u, 3);
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.globalAlpha = (1 - u) * 0.78;
      cx.strokeStyle = r.col;
      cx.lineWidth = (r.heavy ? 5.5 : 3.2) * (1 - u * 0.75);
      cx.beginPath();
      cx.arc(r.x, r.y, 14 + r.r * e, 0, TAU);
      cx.stroke();
      if (r.heavy && u < 0.65) {
        cx.strokeStyle = '#ffffff';
        cx.lineWidth = 2 * (1 - u / 0.65);
        cx.beginPath();
        cx.arc(r.x, r.y, 8 + r.r * 0.65 * e, 0, TAU);
        cx.stroke();
      }
      cx.restore();
    }
  }
};

/* ==========================================================================
   2. Slash3D86 & 3. World86 — 3D SLASH RIBBONS, ROOF SCARS, RAIN RIPPLES &
      DYNAMIC OVERDRIVE LIGHTING IN THREE.JS (R3)
   ========================================================================== */
const Slash3D86 = {
  grp: null, scars: [], ribbons: [], waves: [], ripples: [],
  odBoost: 0, neonPulse: 0, lastDashT: 0, lastPx: 0, lastPy: 0,
  ensure() {
    if (this.grp || !R3.ok || !R3.root || typeof THREE === 'undefined') return;
    this.grp = new THREE.Group();
    R3.root.add(this.grp);
  },
  addSlash(x0, y0, x1, y1, col) {
    if (!R3.on || !R3.ok || CALM) return;
    this.ensure(); if (!this.grp) return;
    const T = THREE, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 18) return;
    const ang = Math.atan2(dy, dx), mx = (x0 + x1) * 0.5, my = (y0 + y1) * 0.5;
    const c = new T.Color(col || P.ca || '#00f2fe');
    // Glowing molten scar on the wet train roof
    const scarMat = new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.92, blending: T.AdditiveBlending, depthWrite: false });
    const scar = new T.Mesh(new T.PlaneGeometry(len, 6.5), scarMat);
    scar.position.set(mx, my, 1.35);
    scar.rotation.z = ang;
    this.grp.add(scar);
    this.scars.push({ m: scar, mat: scarMat, t: 0, dur: 1.65, base: c.clone() });
    if (this.scars.length > 18) { const old = this.scars.shift(); this.grp.remove(old.m); old.m.geometry.dispose(); old.mat.dispose(); }
    // Elevated 3D crescent energy ribbon in the air
    const ribMat = new T.MeshBasicMaterial({ color: c.clone().lerp(new T.Color('#ffffff'), 0.45), transparent: true, opacity: 0.85, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
    const rib = new T.Mesh(new T.PlaneGeometry(len * 0.96, 22), ribMat);
    rib.position.set(mx, my, 19);
    rib.rotation.z = ang;
    rib.rotation.x = 0.55;
    this.grp.add(rib);
    this.ribbons.push({ m: rib, mat: ribMat, t: 0, dur: 0.32 });
    if (this.ribbons.length > 12) { const old = this.ribbons.shift(); this.grp.remove(old.m); old.m.geometry.dispose(); old.mat.dispose(); }
  },
  addWave(x, y, col, maxR) {
    if (!R3.on || !R3.ok || CALM) return;
    this.ensure(); if (!this.grp) return;
    const T = THREE;
    const mat = new T.MeshBasicMaterial({ color: new T.Color(col || '#00f2fe'), transparent: true, opacity: 0.9, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
    const m = new T.Mesh(new T.RingGeometry(0.76, 1.0, 28), mat);
    m.position.set(x, y, 2.2);
    m.scale.set(12, 12, 1);
    this.grp.add(m);
    this.waves.push({ m, mat, t: 0, dur: 0.42, maxR: maxR || 150 });
    if (this.waves.length > 10) { const old = this.waves.shift(); this.grp.remove(old.m); old.m.geometry.dispose(); old.mat.dispose(); }
  },
  tick(rd) {
    if (!R3.on || !R3.ok) return;
    this.ensure(); if (!this.grp) return;
    const d = Math.min(0.05, rd || 1 / 60);
    // Track dash endpoints automatically to spawn 3D slash ribbons & molten scars
    if (inRun() && G.state === 'PLAY') {
      if (P.dashT > 0 && this.lastDashT <= 0) {
        this.lastPx = P.x; this.lastPy = P.y;
      } else if (P.dashT > 0 && Math.hypot(P.x - this.lastPx, P.y - this.lastPy) > 62) {
        this.addSlash(this.lastPx, this.lastPy, P.x, P.y, typeof fxArcColor === 'function' ? fxArcColor() : P.ca);
        this.lastPx = P.x; this.lastPy = P.y;
      } else if (P.dashT <= 0 && this.lastDashT > 0) {
        this.addSlash(this.lastPx, this.lastPy, P.x, P.y, typeof fxArcColor === 'function' ? fxArcColor() : P.ca);
      }
      this.lastDashT = P.dashT;
    } else {
      this.lastDashT = 0;
    }
    // Cool roof scars (white-hot -> neon -> fade)
    for (let i = this.scars.length - 1; i >= 0; i--) {
      const s = this.scars[i]; s.t += d;
      if (s.t >= s.dur) { this.grp.remove(s.m); s.m.geometry.dispose(); s.mat.dispose(); this.scars.splice(i, 1); continue; }
      const u = s.t / s.dur;
      s.mat.opacity = (1 - u) * (1 - u) * 0.85;
      s.m.scale.y = Math.max(0.18, 1 - u * 0.72);
      if (u < 0.18) s.mat.color.copy(s.base).lerp(new THREE.Color('#ffffff'), 1 - u / 0.18);
      else s.mat.color.copy(s.base);
    }
    // Fade & lift 3D energy ribbons
    for (let i = this.ribbons.length - 1; i >= 0; i--) {
      const r = this.ribbons[i]; r.t += d;
      if (r.t >= r.dur) { this.grp.remove(r.m); r.m.geometry.dispose(); r.mat.dispose(); this.ribbons.splice(i, 1); continue; }
      const u = r.t / r.dur;
      r.mat.opacity = (1 - u) * 0.82;
      r.m.scale.y = 1 + u * 1.4;
      r.m.position.z = 19 + u * 12;
    }
    // Expand 3D shockwave rings
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i]; w.t += d;
      if (w.t >= w.dur) { this.grp.remove(w.m); w.m.geometry.dispose(); w.mat.dispose(); this.waves.splice(i, 1); continue; }
      const u = w.t / w.dur, e = 1 - Math.pow(1 - u, 3);
      const rad = 12 + w.maxR * e;
      w.m.scale.set(rad, rad, 1);
      w.mat.opacity = (1 - u) * 0.85;
    }
    // World86: Wet-roof rain ripples when raining in 3D
    const raining = !!(BG.T && BG.T.rain && Q.rain > 0 && !CALM && R3.q >= 1);
    if (raining && this.ripples.length < 14 && Math.random() < d * 24) {
      const rx = V.L + 16 + Math.random() * Math.max(40, V.R - V.L - 32);
      const ry = (P.y || V.VH * 0.5) + (Math.random() - 0.5) * 520;
      const mat = new THREE.MeshBasicMaterial({ color: 0xaad8ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const m = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.0, 14), mat);
      m.position.set(rx, ry, 1.1);
      this.grp.add(m);
      this.ripples.push({ m, mat, t: 0, dur: 0.36 + Math.random() * 0.18, maxR: 9 + Math.random() * 10 });
    }
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i]; rp.t += d;
      if (rp.t >= rp.dur) { this.grp.remove(rp.m); rp.m.geometry.dispose(); rp.mat.dispose(); this.ripples.splice(i, 1); continue; }
      const u = rp.t / rp.dur, rad = 2 + rp.maxR * u;
      rp.m.scale.set(rad, rad, 1);
      rp.mat.opacity = (1 - u) * 0.38;
    }
    // World86: Dynamic Overdrive & Style Rank 3D Lighting
    const targetOD = (inRun() && G.odT > 0) ? 1 : (inRun() && G.styleRk >= 5 ? 0.35 : 0);
    this.odBoost += (targetOD - this.odBoost) * Math.min(1, d * 7);
    if (R3.bloom && R3.q >= 1) {
      const baseBloom = R3.q >= 3 ? 0.52 : 0.45;
      R3.bloom.strength = baseBloom + this.odBoost * 0.28 + (Impact86.t > 0 ? 0.22 : 0);
    }
    if (R3.heroL && inRun()) {
      if (G.odT > 0) {
        R3.heroL.color.setHex(0xffd700);
        R3.heroL.intensity = 520 + Math.sin(CAM.t * 18) * 80;
        R3.heroL.distance = 320;
      } else {
        R3.heroL.intensity = 300 + (G.styleRk >= 4 ? 90 : 0);
        R3.heroL.distance = 220;
      }
    }
  }
};

/* ==========================================================================
   4. Tact86 — TACTICAL AIM KILL/EXECUTION PREVIEW & OFF-SCREEN THREAT RADAR
   ========================================================================== */
const Tact86 = {
  drawAimExtras() {
    if (!In.on || G.state !== 'PLAY' || REPLAY.on || G.mode === 'puzzle') return;
    if ((P.ch <= 0 && G.odT <= 0) || P.lock > 0) return;
    const dx = In.cx - In.sx, dy = In.cy - In.sy;
    if (dx * dx + dy * dy < 130) return;
    const a = Math.atan2(dy, dx), vx = Math.cos(a), vy = Math.sin(a), len = 300;
    const tw = vx > 0.001 ? (V.R - P.r - P.x) / vx : vx < -0.001 ? (V.L + P.r - P.x) / vx : 1e9;
    const segs = [];
    if (tw < len) {
      const bx = P.x + vx * tw, by = P.y + vy * tw;
      segs.push([P.x, P.y, bx, by, false]);
      segs.push([bx, by, bx - vx * (len - tw), by + vy * (len - tw), true]);
    } else {
      segs.push([P.x, P.y, P.x + vx * len, P.y + vy * len, false]);
    }
    const hitR = P.r + 22 * P.reach + P.w.reach;
    const baseDmg = (P.w ? P.w.dmg : 1) * (P.dmgMul || 1) * (G.dmgMod || 1) * (G.odT > 0 ? 2 : 1);
    const pulse = 0.65 + Math.sin(CAM.t * 16) * 0.35;
    cx.save();
    // Highlight enemies intersected by trajectory with KILL / EXEC tactical brackets
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i];
      if (!e || !e.alive || e.al > 0 || e.spawnT > 0 || e.vis <= 0.3 || e.alt > 0.35) continue;
      let hit = false, isRic = false;
      for (const s of segs) {
        if (distToSeg(e.x, e.y, s[0], s[1], s[2], s[3]) < hitR + e.r) { hit = true; isRic = s[4]; break; }
      }
      if (!hit) continue;
      const execNow = !!(e.exec || (e.elite && e.mhp > 0 && e.hp / e.mhp <= (P.perks && P.perks.reaper ? 0.5 : 0.3)));
      const estDmg = baseDmg * (isRic ? 1.85 : 1);
      const lethal = execNow || e.hp <= estDmg + 0.05;
      const col = execNow ? '#ff0844' : lethal ? '#ffd700' : '#00f2fe';
      const br = e.r + 8 + pulse * 3;
      cx.strokeStyle = col;
      cx.lineWidth = execNow || lethal ? 2.4 : 1.6;
      cx.globalAlpha = 0.92;
      // 4 crisp corner brackets around target
      const cl = 7;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        cx.beginPath();
        cx.moveTo(e.x + sx * br, e.y + sy * (br - cl));
        cx.lineTo(e.x + sx * br, e.y + sy * br);
        cx.lineTo(e.x + sx * (br - cl), e.y + sy * br);
        cx.stroke();
      }
      if (execNow || lethal) {
        cx.font = '900 9px ' + FONT_D;
        cx.textAlign = 'center';
        cx.fillStyle = col;
        cx.fillText(lt(execNow ? 'EXEC' : 'KILL'), e.x, e.y + e.r + 18);
      }
    }
    // Highlight parryable bullets intersecting the dash path
    for (let i = 0; i < BU.n; i++) {
      const b = BU.a[i];
      if (!b || !b.alive || b.rf) continue;
      let hit = false;
      for (const s of segs) {
        if (distToSeg(b.x, b.y, s[0], s[1], s[2], s[3]) < hitR + b.r + 6) { hit = true; break; }
      }
      if (!hit) continue;
      cx.strokeStyle = '#7df9ff';
      cx.lineWidth = 2;
      cx.globalAlpha = 0.85 * pulse;
      cx.beginPath();
      cx.arc(b.x, b.y, b.r + 7, 0, TAU);
      cx.stroke();
    }
    cx.restore();
  },
  drawRadar() {
    if (G.state !== 'PLAY' || REPLAY.on || G.mode === 'puzzle') return;
    const pad = 22, topY = 96, botY = V.VH - (G.dockL || 90) - 24;
    cx.save();
    for (let i = 0; i < EN.n; i++) {
      const e = EN.a[i];
      if (!e || !e.alive || e.al > 0) continue;
      const offTop = e.y < 24, offBot = e.y > V.VH - 40;
      const danger = e.type === ET.SNIPER || e.type === ET.DIVER || e.elite;
      if (!danger && !offTop && !offBot) continue;
      if (!offTop && !offBot) continue;
      const rx = clamp(e.x, V.L + pad, V.R - pad);
      const ry = offTop ? topY : botY;
      const ang = Math.atan2(e.y - ry, e.x - rx);
      const col = e.elite ? '#ffd700' : e.type === ET.DIVER ? '#ff4fd8' : '#ff3b5c';
      const pulse = 0.55 + Math.sin(CAM.t * 14 + i) * 0.45;
      cx.save();
      cx.translate(rx, ry);
      cx.rotate(ang);
      cx.globalAlpha = pulse * 0.9;
      cx.fillStyle = col;
      cx.beginPath();
      cx.moveTo(9, 0); cx.lineTo(-5, -6); cx.lineTo(-2, 0); cx.lineTo(-5, 6); cx.closePath();
      cx.fill();
      cx.restore();
    }
    cx.restore();
  }
};

/* ==========================================================================
   5. HeroRing86 — DIEGETIC CIRCULAR COMBAT GAUGE AROUND THE HERO
   ========================================================================== */
const HeroRing86 = {
  enabled() {
    const s = Store.data && Store.data.settings;
    return !(s && s.ring86 === 0);
  },
  draw() {
    if (!this.enabled() || G.state !== 'PLAY' || REPLAY.on) return;
    const r = P.r + 18;
    const maxCh = Math.max(1, P.maxCh | 0);
    const ch = Math.max(0, Math.min(maxCh, P.ch | 0));
    const heat = clamp((P.heat || 0) / 100, 0, 1);
    const rk = G.styleRk || 0;
    cx.save();
    cx.translate(P.x, P.y);
    // Subtle Style Rank Aura (S / SS / SSS)
    if (rk >= 4 && !CALM) {
      const auraCol = rk >= 6 ? '#ffd700' : rk === 5 ? '#ff2bd6' : '#00f2fe';
      const p = 0.5 + Math.sin(CAM.t * (8 + rk)) * 0.5;
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = auraCol;
      cx.globalAlpha = 0.22 + p * 0.24;
      cx.lineWidth = rk >= 6 ? 2.5 : 1.6;
      cx.beginPath();
      cx.arc(0, 0, r + 6 + p * 3, 0, TAU);
      cx.stroke();
      cx.globalCompositeOperation = 'source-over';
    }
    // Segmented dash-charge arc (bottom semicircle, crisp & non-intrusive)
    const span = Math.PI * 0.78, startA = Math.PI * 0.5 - span * 0.5, gap = 0.11;
    const segA = (span - gap * (maxCh - 1)) / maxCh;
    for (let i = 0; i < maxCh; i++) {
      const a0 = startA + i * (segA + gap), a1 = a0 + segA;
      const filled = G.odT > 0 || i < ch;
      cx.strokeStyle = G.odT > 0 ? '#ffd700' : filled ? (P.ca || '#00f2fe') : 'rgba(255,255,255,.16)';
      cx.globalAlpha = filled ? 0.85 : 0.45;
      cx.lineWidth = filled ? 2.8 : 2;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.arc(0, 0, r, a0, a1);
      cx.stroke();
    }
    // Blade heat arc (only appears when blade is warming up > 25%)
    if (heat > 0.25 || P.lock > 0) {
      const hSpan = Math.PI * 0.55 * heat;
      const hStart = -Math.PI * 0.5 - hSpan * 0.5;
      cx.strokeStyle = P.lock > 0 ? '#ff3b3b' : heat >= 0.72 ? '#ff8c2b' : '#ffd23f';
      cx.globalAlpha = P.lock > 0 ? 0.95 : 0.75;
      cx.lineWidth = 2.4;
      cx.beginPath();
      cx.arc(0, 0, r, hStart, hStart + hSpan);
      cx.stroke();
    }
    cx.restore();
  }
};

/* ==========================================================================
   6. Apex86 — PHANTOM STEP (CLOSE-GRAZE COUNTER) & STYLE OVERCHARGE (simV(86))
   ========================================================================== */
const Apex86 = {
  cd: 0, lastGrazes: 0, ghosts: [],
  reset() { this.cd = 0; this.lastGrazes = 0; this.ghosts.length = 0; },
  step(dt) {
    if (!simV(86) || G.state !== 'PLAY') return;
    if (this.cd > 0) this.cd = Math.max(0, this.cd - dt);
    // Style Rank Overcharge: SS (+10%) / SSS (+18%) faster dash recharge
    if (G.styleRk >= 5 && P.ch < P.maxCh && G.odT <= 0 && P.lock <= 0) {
      const bonus = G.styleRk >= 6 ? 0.18 : 0.10;
      if (typeof P.chT === 'number') P.chT += dt * bonus;
    }
    // Detect fresh graze for Phantom Step counter
    if ((G.grazes | 0) > this.lastGrazes) {
      this.lastGrazes = G.grazes | 0;
      if (this.cd <= 0 && P.dashT <= 0) {
        this.cd = 2.5;
        if (P.ch < P.maxCh) P.ch = Math.min(P.maxCh, P.ch + 1);
        addOD(12);
        if (!REPLAY.fast) {
          FX.text(P.x, P.y - 34, lt('PHANTOM STEP'), '#7df9ff', 12, 1);
          FX.ring(P.x, P.y, 44, '#7df9ff', 4);
          Slash3D86.addWave(P.x, P.y, '#7df9ff', 95);
          Audio86.phantom();
          this.ghosts.push({ x: P.x, y: P.y, r: P.r, t: 0, dur: 0.38 });
          if (this.ghosts.length > 5) this.ghosts.shift();
        }
      }
    }
  },
  drawGhosts(rd) {
    const d = rd || 1 / 60;
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i]; g.t += d;
      if (g.t >= g.dur) { this.ghosts.splice(i, 1); continue; }
      const u = g.t / g.dur;
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.globalAlpha = (1 - u) * 0.65;
      cx.strokeStyle = '#7df9ff';
      cx.lineWidth = 2.2;
      cx.beginPath();
      cx.arc(g.x, g.y, g.r * (1 + u * 0.9), 0, TAU);
      cx.stroke();
      cx.restore();
    }
  }
};

/* ==========================================================================
   7. Audio86 — SLOW-MO LOW-PASS SWEEP, COMBO HARMONICS & SUB-BASS DROPS
   ========================================================================== */
const Audio86 = {
  scale: [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51],
  tick(rd) {
    if (!Aud.c || !Aud.mf || Aud.quiet) return;
    try {
      const t = Aud.c.currentTime;
      if (G.state === 'PLAY') {
        // Muffle soundtrack smoothly during slow-mo aim or hit-stop, snap crystal clear on slash
        const slow = (In.on && !REPLAY.on) || G.hs > 0 || (G.ts != null && G.ts < 0.7);
        const want = G.hs > 0 ? 520 : slow ? 1150 : 20000;
        Aud.mf.frequency.setTargetAtTime(want, t, slow ? 0.045 : 0.07);
      }
    } catch (e) { }
  },
  subDrop(heavy) {
    if (!Aud.c || Aud.quiet || (REPLAY.on && REPLAY.fast)) return;
    if (!Aud.gate('sub86', 75)) return;
    try {
      Aud.tone(heavy ? 78 : 66, 28, heavy ? 0.28 : 0.16, heavy ? 0.24 : 0.15, 'sine');
      if (heavy) Aud.tone(1680, 920, 0.22, 0.06, 'triangle');
    } catch (e) { }
  },
  comboChime(combo) {
    if (!Aud.c || Aud.quiet || (REPLAY.on && REPLAY.fast)) return;
    if (combo < 3 || !Aud.gate('chime86', 65)) return;
    try {
      const idx = Math.min(this.scale.length - 1, Math.floor((combo - 3) / 2));
      const f = this.scale[idx];
      Aud.tone(f, f * 1.006, 0.11, 0.045, 'sine');
    } catch (e) { }
  },
  phantom() {
    if (!Aud.c || Aud.quiet) return;
    try {
      Aud.tone(620, 1480, 0.12, 0.09, 'triangle');
      Aud.tone(1240, 2100, 0.09, 0.05, 'sine');
    } catch (e) { }
  }
};

/* ==========================================================================
   HOOK WIRING — Clean, isolated, zero-regression integration
   ========================================================================== */
{
  // 1. Reset Apex86 on run start
  const db86 = Director.begin.bind(Director);
  Director.begin = function () { Apex86.reset(); return db86.apply(this, arguments); };

  // 2. Sim hook for Phantom Step & Style Overcharge
  const sim86 = sim;
  sim = function (dt, rd) {
    const r = sim86(dt, rd);
    try { Apex86.step(dt); } catch (e) { errLog(e); }
    return r;
  };

  // 3. Tactical Aiming overlay
  const da86 = drawAim;
  drawAim = function () {
    const r = da86.apply(this, arguments);
    try { Tact86.drawAimExtras(); } catch (e) { errLog(e); }
    return r;
  };

  // 4. Diegetic Hero Ring + Phantom Ghosts drawn right with player
  const dp86 = drawPlayer;
  drawPlayer = function () {
    try { Apex86.drawGhosts(RDT); HeroRing86.draw(); } catch (e) { errLog(e); }
    return dp86.apply(this, arguments);
  };

  // 5. Impact frames + Threat Radar + Audio low-pass in HUD/Post pipeline
  const hd86 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try { Tact86.drawRadar(); Impact86.draw(rd); Audio86.tick(rd); } catch (e) { errLog(e); }
    return hd86(rd);
  };

  // 6. 3D Slash Ribbons, Roof Scars, Rain Ripples & Dynamic Lighting inside R3.render
  const r3_86 = R3.render.bind(R3);
  R3.render = function (rd) {
    try { Slash3D86.tick(rd); } catch (e) { errLog(e); }
    return r3_86(rd);
  };

  // 7. Trigger Impact Frames, 3D Shockwaves & Sub-Bass on Parries, Kills, Overdrive, Boss Phase/Kill
  const pb86 = parryBullet;
  parryBullet = function (b) {
    const bx = b ? b.x : P.x, by = b ? b.y : P.y;
    const r = pb86.apply(this, arguments);
    try {
      Impact86.fire(bx, by, '#7df9ff', 0);
      Slash3D86.addWave(bx, by, '#7df9ff', 110);
      Audio86.subDrop(false);
    } catch (e) { errLog(e); }
    return r;
  };

  const ke86 = killEnemy;
  killEnemy = function (e, a, src) {
    const ex = e ? e.x : P.x, ey = e ? e.y : P.y, wasElite = !!(e && (e.elite || e.exec));
    const r = ke86.apply(this, arguments);
    try {
      Audio86.comboChime(G.combo | 0);
      if (wasElite) {
        Impact86.fire(ex, ey, '#ff0844', 1);
        Slash3D86.addWave(ex, ey, '#ff0844', 175);
        Audio86.subDrop(true);
      }
    } catch (er) { errLog(er); }
    return r;
  };

  const od86 = overdrive;
  overdrive = function () {
    const was = G.odT;
    const r = od86.apply(this, arguments);
    try {
      if (was <= 0 && G.odT > 0) {
        Impact86.fire(P.x, P.y, '#ffd700', 1);
        Slash3D86.addWave(P.x, P.y, '#ffd700', 240);
        Audio86.subDrop(true);
      }
    } catch (e) { errLog(e); }
    return r;
  };

  // Boss phase break & boss death impact frames
  let lastBossPh = 0, lastBossDying = false;
  Pipe.on('post', 'apex86_boss', () => {
    const b = Boss.cur;
    if (!b) { lastBossPh = 0; lastBossDying = false; return; }
    if (lastBossPh > 0 && b.ph > lastBossPh) {
      Impact86.fire(b.x, b.y, '#ff2bd6', 1);
      Slash3D86.addWave(b.x, b.y, '#ff2bd6', 240);
      Audio86.subDrop(true);
    }
    if (!lastBossDying && b.dying > 0) {
      Impact86.fire(b.x, b.y, '#ffd700', 1);
      Slash3D86.addWave(b.x, b.y, '#ffd700', 290);
      Audio86.subDrop(true);
    }
    lastBossPh = b.ph || 0;
    lastBossDying = !!(b.dying > 0);
  }, 85);

  // 8. Settings toggles under PRESENTATION
  if (typeof PC !== 'undefined' && PC.settings) {
    const ps86 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps86(head, cycle, box, s);
      try {
        head('APEX EDITION (v86)');
        cycle('Impact frames', 'imp86', [1, 0], ['ON', 'OFF']);
        cycle('Hero combat ring', 'ring86', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

