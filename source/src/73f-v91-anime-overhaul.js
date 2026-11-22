/* ==========================================================================
   VERSION 91.0 — LEGENDARY ANIME OVERHAUL (2D-TO-3D + CINEMATIC SYSTEMS)
   1. AnimeToon91   — Faithful 2D-to-3D Cel-Shading (3-step MeshToonMaterial),
                      crisp Anime Ink Outlines (black standard, glowing gold
                      Elites, thick crimson/black Bosses), 2D-matched hero
                      silhouette proportions & vivid skin palette saturation,
                      plus live style toggle in Settings
   2. CutIn91       — Persona 5 / Dragon Ball-style Overdrive Anime Cut-In
                      banner + Weapon Ultimate Finisher (Judgment Cut Storm)
   3. BladeClash91  — Interactive Boss Blade Clash duel with sparks,
                      camera zoom-in & guard-shatter victory reward
   4. SetPieces91   — Living Train Roof Set-Pieces: Neon Tunnel Blackout,
                      Laser Gateway (Phase-Through bonus) & Parallel Express
   5. Awakened91    — Awakened Weapon Evolution at 20+ combo with radiant
                      blade aura & chain-lightning shockwaves
   6. ShadowRival91 — Surprise Shadow Rival Invasion mini-boss with big
                      coin & Overdrive bounty
   7. DojoLab91     — Live Dojo Combo Lab (DPS, Peak DPS, Infinite OD toggle
                      & Spawn Parry Dummy button)
   ========================================================================== */

try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "LEGENDARY OVERHAUL (v91)": "מהדורה אגדית LEGENDARY (v91)",
    "3D Visual Style": "סגנון תלת־ממד (אנימה 2D / מתכתי)",
    "ANIME 2D-STYLE": "אנימה 2D-STYLE",
    "CYBER METALLIC": "סייבר מתכתי",
    "Overdrive Anime Cut-In": "Cut-In אנימה באוברדרייב",
    "Boss Blade Clash": "התנגשות להבים מול בוסים",
    "Dynamic Roof Events": "אירועי מסילה דינמיים",
    "Shadow Rival Invasion": "פלישת יריב צללים",
    "Awakened Weapons": "אבולוציית נשק מעורר",
    "BLADE CLASH!": "התנגשות להבים!",
    "MASH CLICK / SPACE!": "לחץ מהר! LMB / SPACE",
    "CLASH VICTORY!": "ניצחון בהתנגשות!",
    "NEON TUNNEL BLACKOUT": "כניסה למנהרת ניאון!",
    "LASER GATEWAY AHEAD": "שערי לייזר על הגג!",
    "PARALLEL EXPRESS!": "רכבת אקספרס מקבילה!",
    "PHASE THROUGH! +OD": "חצייה מושלמת! +OD",
    "AWAKENED BLADE!": "להב מעורר!",
    "SHADOW RIVAL INVASION!": "פלישת יריב צללים!",
    "RIVAL DEFEATED!": "יריב הצללים הובס!",
    "JUDGMENT OVERDRIVE": "אוברדרייב עליון",
    "COMBO LAB": "מעבדת קומבואים",
    "INF OVERDRIVE": "אוברדרייב אינסופי",
    "PARRY DUMMY": "זמן בובת פארי"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "LEGENDARY OVERHAUL (v91)": "الإصدار الأسطوري LEGENDARY (v91)",
    "3D Visual Style": "نمط العرض ثلاثي الأبعاد",
    "ANIME 2D-STYLE": "أنمي 2D",
    "CYBER METALLIC": "سايبر معدني",
    "Overdrive Anime Cut-In": "مشهد أنمي للأوفردرايف",
    "Boss Blade Clash": "اشتباك السيوف مع الزعماء",
    "Dynamic Roof Events": "أحداث السقف الديناميكية",
    "Shadow Rival Invasion": "غزو خصم الظل",
    "Awakened Weapons": "الأسلحة المستيقظة"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "LEGENDARY OVERHAUL (v91)": "ЛЕГЕНДАРНОЕ ИЗДАНИЕ (v91)",
    "3D Visual Style": "Стиль 3D графики",
    "ANIME 2D-STYLE": "АНИМЕ 2D",
    "CYBER METALLIC": "КИБЕР МЕТАЛЛ",
    "Overdrive Anime Cut-In": "Аниме Cut-In Овердрайва",
    "Boss Blade Clash": "Столкновение клинков с боссом",
    "Dynamic Roof Events": "События на крыше поезда",
    "Shadow Rival Invasion": "Вторжение Теневого Соперника",
    "Awakened Weapons": "Пробуждённое оружие"
  });
} catch (e) { errLog(e); }

const S91 = {
  on(k, defVal) {
    try {
      const s = Store && Store.data && Store.data.settings;
      if (!s || s[k] == null) return defVal == null ? true : !!defVal;
      return !!s[k];
    } catch (e) { return defVal == null ? true : !!defVal; }
  },
  isAnime() {
    try {
      const s = Store && Store.data && Store.data.settings;
      return !s || s.style3d91 == null || s.style3d91 === 'anime';
    } catch (e) { return true; }
  }
};

/* ==========================================================================
   1. AnimeToon91 — 2D-TO-3D CEL-SHADING, INK OUTLINES & FAITHFUL SILHOUETTES
   ========================================================================== */
const AnimeToon91 = {
  gradTex: null,
  inkBlack: null,
  inkGold: null,
  inkCrimson: null,

  ensureAssets() {
    if (this.gradTex || typeof THREE === 'undefined') return;
    const T = THREE;
    // Crisp 3-step anime cel-shading ramp: deep shadow -> rich midtone -> bright highlight
    const data = new Uint8Array([88, 88, 88, 255, 195, 195, 195, 255, 255, 255, 255, 255]);
    const tex = new T.DataTexture(data, 3, 1, T.RGBAFormat);
    tex.minFilter = T.NearestFilter;
    tex.magFilter = T.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    this.gradTex = tex;

    this.inkBlack   = new T.MeshBasicMaterial({ color: 0x05060e, side: T.BackSide, depthWrite: true });
    this.inkGold    = new T.MeshBasicMaterial({ color: 0xffd700, side: T.BackSide, depthWrite: false, transparent: true, opacity: .88 });
    this.inkCrimson = new T.MeshBasicMaterial({ color: 0x1a030b, side: T.BackSide, depthWrite: true });
  },

  /* Convert a MeshStandardMaterial to a vivid 2D-style MeshToonMaterial cleanly */
  toToonMat(mat, boostSat) {
    if (!mat || mat.isMeshToonMaterial || mat.isMeshBasicMaterial || mat.userData && mat.userData.noToon91) return mat;
    if (!mat.isMeshStandardMaterial && !mat.isMeshPhongMaterial) return mat;
    this.ensureAssets();
    try {
      const T = THREE;
      const col = mat.color ? mat.color.clone() : new T.Color(0xffffff);
      if (boostSat) {
        const hsl = {};
        col.getHSL(hsl);
        col.setHSL(hsl.h, Math.min(1, hsl.s * 1.28 + 0.06), Math.min(0.88, Math.max(0.18, hsl.l * 1.15)));
      }
      const tm = new T.MeshToonMaterial({
        color: col,
        map: mat.map || null,
        gradientMap: this.gradTex,
        emissive: mat.emissive ? mat.emissive.clone() : new T.Color(0x000000),
        emissiveMap: mat.emissiveMap || null,
        emissiveIntensity: mat.emissiveIntensity != null ? Math.max(mat.emissiveIntensity, 0.25) : 0.25,
        transparent: !!mat.transparent,
        opacity: mat.opacity != null ? mat.opacity : 1,
        side: mat.side != null ? mat.side : T.FrontSide,
        vertexColors: !!mat.vertexColors
      });
      tm.userData = Object.assign({}, mat.userData, { toon91: 1 });
      return tm;
    } catch (e) { return mat; }
  },

  /* Add crisp inverted-hull anime ink outline to non-skinned meshes */
  addOutline(mesh, thickness, inkMat) {
    if (!mesh || !mesh.isMesh || mesh.isSkinnedMesh || !mesh.geometry) return;
    if (mesh.userData && (mesh.userData.isOutline91 || mesh.userData.noOutline91)) return;
    if (mesh.material && (mesh.material.transparent && mesh.material.opacity < 0.5)) return;
    // Skip tiny/glowing pool discs or additive FX
    if (mesh.material && mesh.material.blending === THREE.AdditiveBlending) return;
    if (mesh.children && mesh.children.some(c => c.userData && c.userData.isOutline91)) return;
    try {
      const om = new THREE.Mesh(mesh.geometry, inkMat || this.inkBlack);
      om.scale.setScalar(thickness || 1.055);
      om.userData.isOutline91 = 1;
      om.castShadow = false;
      om.receiveShadow = false;
      mesh.add(om);
    } catch (e) {}
  },

  /* Style a 3D Hero (Human.build or R3.hero) to match the vibrant 2D anime look */
  stylizeHero(g, skin) {
    if (!S91.isAnime() || !g || typeof THREE === 'undefined') return g;
    this.ensureAssets();
    try {
      const ca = (skin && skin.a) || (typeof P !== 'undefined' && P.ca) || '#00f2fe';
      const cb = (skin && skin.b) || (typeof P !== 'undefined' && P.cb) || '#ff0844';
      const cA = new THREE.Color(ca);
      const cB = new THREE.Color(cb);

      const toProcess = [];
      g.traverse(o => { if (o.isMesh && !(o.userData && o.userData.isOutline91)) toProcess.push(o); });

      for (const m of toProcess) {
        if (m === g.pool) continue;
        if (Array.isArray(m.material)) {
          m.material = m.material.map(mm => this.toToonMat(mm, true));
        } else if (m.material) {
          const isBody = m.isSkinnedMesh;
          const tm = this.toToonMat(m.material, true);
          // Infuse 2D skin accent colors onto dull grey mannequin limbs so 3D matches 2D palette
          if (isBody && tm && tm.isMeshToonMaterial) {
            const hsl = {}; tm.color.getHSL(hsl);
            if (hsl.s < 0.22) {
              tm.color.lerp(cB, 0.35);
              tm.emissive.copy(cA).multiplyScalar(0.18);
              tm.emissiveIntensity = 0.45;
            }
          }
          m.material = tm;
          if (m === g.bladeMesh && tm && tm.emissive) {
            tm.emissiveIntensity = Math.max(tm.emissiveIntensity || 1.5, 2.4);
          }
        }
        // Crisp anime ink outlines on all hero gear, hair, head accessories, scarf & blade
        if (!m.isSkinnedMesh) {
          this.addOutline(m, 1.06, this.inkBlack);
        }
      }

      // Faithful 2D-style silhouette: slightly bolder blade & iconic head gear presence
      if (g.blade && !g.blade._s91) {
        g.blade._s91 = 1;
        g.blade.scale.multiplyScalar(1.14);
      }
      if (g.blade2 && !g.blade2._s91) {
        g.blade2._s91 = 1;
        g.blade2.scale.multiplyScalar(1.12);
      }
    } catch (e) { errLog(e); }
    return g;
  },

  /* Style 3D Enemies (standard + glowing gold outline for Elites) */
  stylizeEnemy(g, e) {
    if (!S91.isAnime() || !g || typeof THREE === 'undefined') return g;
    this.ensureAssets();
    try {
      const isElite = !!(e && e.elite);
      const ink = isElite ? this.inkGold : this.inkBlack;
      const thick = isElite ? 1.09 : 1.06;
      const toProcess = [];
      g.traverse(o => { if (o.isMesh && !(o.userData && o.userData.isOutline91)) toProcess.push(o); });

      let newBodyMat = null;
      for (const m of toProcess) {
        if (m.material && !Array.isArray(m.material)) {
          const wasBody = (m.material === g.bodyMat);
          const tm = this.toToonMat(m.material, true);
          m.material = tm;
          if (wasBody) newBodyMat = tm;
        }
        if (!m.isSkinnedMesh) this.addOutline(m, thick, ink);
      }
      if (newBodyMat) g.bodyMat = newBodyMat;
    } catch (er) { errLog(er); }
    return g;
  },

  /* Style 3D Bosses with dramatic anime cel-shading & thick outlines */
  stylizeBoss(g, b) {
    if (!S91.isAnime() || !g || typeof THREE === 'undefined') return g;
    this.ensureAssets();
    try {
      const toProcess = [];
      g.traverse(o => { if (o.isMesh && !(o.userData && o.userData.isOutline91)) toProcess.push(o); });
      let newBodyMat = null;
      for (const m of toProcess) {
        if (m.material && !Array.isArray(m.material)) {
          const wasBody = (m.material === g.bodyMat);
          const tm = this.toToonMat(m.material, true);
          m.material = tm;
          if (wasBody) newBodyMat = tm;
        }
        if (!m.isSkinnedMesh) this.addOutline(m, 1.065, this.inkCrimson);
      }
      if (newBodyMat) g.bodyMat = newBodyMat;
    } catch (er) { errLog(er); }
    return g;
  }
};

/* ==========================================================================
   2. CutIn91 — OVERDRIVE ANIME CUT-IN BANNER & JUDGMENT ULTIMATE FINISHER
   ========================================================================== */
const CutIn91 = {
  el: null, eyeEl: null, titleEl: null, subEl: null,
  timer: 0,
  slashes: [],

  ensureDOM() {
    if (this.el) return;
    const d = document.createElement('div');
    d.id = 'cutin91';
    d.innerHTML =
      '<div id="cutin91-bg"></div>' +
      '<div id="cutin91-inner">' +
        '<div id="cutin91-eye"></div>' +
        '<div><div id="cutin91-title">OVERDRIVE</div><div id="cutin91-sub">JUDGMENT OVERDRIVE</div></div>' +
      '</div>';
    document.body.appendChild(d);
    this.el = d;
    this.eyeEl = d.querySelector('#cutin91-eye');
    this.titleEl = d.querySelector('#cutin91-title');
    this.subEl = d.querySelector('#cutin91-sub');
  },

  trigger() {
    // v98: the shockwave (a rule) runs whatever the display settings are
    if (Sim98.on('cutin91') && typeof EN !== 'undefined' && (G.combo | 0) >= 12) {
      for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0) damageEnemy(e, 2.5 * (G.dmgMod || 1), Math.atan2(e.y - P.y, e.x - P.x), 1); }
    }
    if (!S91.on('cutin91', true) || CALM || REPLAY.fast) return;
    this.ensureDOM();
    const ca = (P && P.ca) || '#00f2fe';
    const cb = (P && P.cb) || '#ff0844';
    const heroName = (P && P.skin && P.skin.name) || 'CYBER NINJA';
    const wName = (P && P.w && P.w.name) || 'KATANA';

    this.el.style.borderTopColor = '#ffd700';
    this.el.style.borderBottomColor = ca;
    this.eyeEl.style.background = 'radial-gradient(circle at 58% 50%, #ffffff 0%, ' + ca + ' 28%, #0a0c1c 68%)';
    this.eyeEl.style.boxShadow = '0 0 28px ' + ca + ', inset 0 0 14px #fff';
    this.titleEl.textContent = heroName;
    this.titleEl.style.textShadow = '0 0 18px ' + ca + ', 4px 4px 0 ' + cb;
    this.subEl.textContent = (typeof lt === 'function' ? lt('JUDGMENT OVERDRIVE') : 'JUDGMENT OVERDRIVE') + ' · ' + wName;

    this.el.classList.add('on');
    this.timer = 0.68;

    // Judgment Cut screen-wide slash storm!
    this.slashes = [];
    const W = V.VW || 420, H = V.VH || 760;
    for (let i = 0; i < 16; i++) {
      const x1 = Math.random() * W, y1 = Math.random() * H;
      const a = Math.random() * Math.PI * 2;
      const len = 180 + Math.random() * 280;
      this.slashes.push({
        x1: x1 - Math.cos(a) * len, y1: y1 - Math.sin(a) * len,
        x2: x1 + Math.cos(a) * len, y2: y1 + Math.sin(a) * len,
        col: i % 2 ? ca : '#ffd700', t: -i * 0.025, d: 0.36
      });
    }

    if (typeof Cinema3D89 !== 'undefined') Cinema3D89.triggerRGB(1.0);
  },

  tickAndDraw(rd) {
    const dt = Math.min(0.05, rd || 0.016);
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0 && this.el) this.el.classList.remove('on');
    }
    if (!this.slashes.length || typeof cx === 'undefined') return;
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.t += dt;
      if (s.t < 0) continue;
      if (s.t >= s.d) { this.slashes.splice(i, 1); continue; }
      const a = 1 - s.t / s.d;
      cx.strokeStyle = s.col;
      cx.globalAlpha = a * 0.65;
      cx.lineWidth = 8 * a;
      cx.beginPath(); cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); cx.stroke();
      cx.strokeStyle = '#ffffff';
      cx.globalAlpha = a;
      cx.lineWidth = 2.5 * a;
      cx.stroke();
    }
    cx.restore();
  }
};

/* ==========================================================================
   3. BladeClash91 — INTERACTIVE BOSS BLADE CLASH DUEL
   ========================================================================== */
const BladeClash91 = {
  active: false,
  prog: 0.42,
  t: 0,
  dur: 2.0,
  cd: 0,
  el: null, fillEl: null, lblEl: null, hintEl: null,

  ensureDOM() {
    if (this.el) return;
    const d = document.createElement('div');
    d.id = 'clash91';
    d.innerHTML =
      '<div id="clash91-lbl">BLADE CLASH!</div>' +
      '<div id="clash91-bar"><div id="clash91-fill"></div></div>' +
      '<div id="clash91-hint">MASH CLICK / SPACE!</div>';
    document.body.appendChild(d);
    this.el = d;
    this.lblEl = d.querySelector('#clash91-lbl');
    this.fillEl = d.querySelector('#clash91-fill');
    this.hintEl = d.querySelector('#clash91-hint');

    const push = () => {
      if (!this.active || REPLAY.on) return;
      REC.act(RA.CLASH); this.push98();
    };
    window.addEventListener('pointerdown', push, true);
    window.addEventListener('keydown', e => {
      if (this.active && (e.code === 'Space' || e.code === 'KeyC' || e.code === 'KeyF')) {
        e.preventDefault(); push();
      }
    }, true);
  },

  /* one mash (live, or a recorded one in a replay) */
  push98() {
      if (!this.active) return;
      this.prog = Math.min(1, this.prog + 0.14);
      if (typeof FX !== 'undefined' && Boss.cur) {
        FX.spark((P.x + Boss.cur.x) * .5, (P.y + Boss.cur.y) * .5, '#ffd700', 8);
      }
      if (typeof AudioCinema89 !== 'undefined') AudioCinema89.sliceSfx(P.x, true, 4);
      if (this.prog >= 1) this.win();
  },

  tryStart() {
    if (!Sim98.on('clash91') || this.active || this.cd > 0 || G.state !== 'PLAY') return;
    const b = typeof Boss !== 'undefined' && Boss.cur;
    if (!b || b.dying > 0 || b.stag > 0) return;
    if (Math.hypot(P.x - b.x, P.y - b.y) > (b.r || 36) + 74) return;
    this.ensureDOM();
    this.active = true;
    this.prog = 0.42;
    this.t = 0;
    this.cd = 18;
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    if (REPLAY.fast) return;
    this.lblEl.textContent = L('BLADE CLASH!');
    this.hintEl.textContent = L('MASH CLICK / SPACE!');
    this.el.style.display = 'flex';
    if (typeof Cinema3D89 !== 'undefined') Cinema3D89.flash((P.x + b.x) * .5, (P.y + b.y) * .5, '#ffd700', 800, 0.35);
    if (typeof FX !== 'undefined') FX.ring((P.x + b.x) * .5, (P.y + b.y) * .5, 160, '#ffd700', 6);
  },

  win() {
    this.active = false;
    if (this.el) this.el.style.display = 'none';
    const b = Boss.cur;
    if (b && b.hp > 0) {
      const dmg = Math.max(b.mhp * 0.14, 18);
      b.hp = Math.max(1, b.hp - dmg);
      b.stag = 2.4; b.fl = 1;
      P.ch = P.maxCh;
      if (typeof addOD === 'function') addOD(35);
      if (typeof FX !== 'undefined') {
        FX.call(typeof lt === 'function' ? lt('CLASH VICTORY!') : 'CLASH VICTORY!', '#ffd700', 3, 30);
        FX.ring(b.x, b.y, 240, '#ffd700', 8);
      }
      if (typeof Cinema3D89 !== 'undefined') Cinema3D89.triggerRGB(1.0);
      if (typeof shake === 'function') shake(.85);
    }
  },

  /* v98: the drawing side only (the duel itself runs in simStep) */
  tick(rd) {
    if (this.el && !this.active && this.el.style.display !== 'none') this.el.style.display = 'none';
    if (this.active && this.fillEl) this.fillEl.style.width = (this.prog * 100).toFixed(1) + '%';
  },
  simStep(dt) {
    if (this.cd > 0) this.cd = Math.max(0, this.cd - dt);
    if (!this.active) return;
    const b = Boss.cur;
    if (!b || b.dying > 0 || G.state !== 'PLAY') {
      this.active = false;
      if (this.el) this.el.style.display = 'none';
      return;
    }
    this.t += dt;
    // Boss pushes back steadily
    this.prog = Math.max(0, this.prog - dt * 0.30);
    G.slowT = 0.12; G.slowK = 0.18;
    if (!REPLAY.fast && typeof FX !== 'undefined' && (TICK.n & 1)) FX.spark((P.x + b.x) * .5, (P.y + b.y) * .5, '#ffd700', 2);
    if (this.t >= this.dur || this.prog <= 0) {
      // Draw / Knockback if player didn't finish in time
      this.active = false;
      if (this.el) this.el.style.display = 'none';
      const a = Math.atan2(P.y - b.y, P.x - b.x);
      P.vx = Math.cos(a) * 420; P.vy = Math.sin(a) * 420;
    }
  }
};

/* ==========================================================================
   4. SetPieces91 — DYNAMIC TRAIN ROOF EVENTS (TUNNEL, LASER GATE, EXPRESS)
   ========================================================================== */
const SetPieces91 = {
  nextT: 22,
  cur: null, // { type: 'tunnel'|'laser'|'express', t, d, y, phased }
  bannerEl: null,

  ensureDOM() {
    if (this.bannerEl) return;
    const d = document.createElement('div');
    d.id = 'event91-banner';
    document.body.appendChild(d);
    this.bannerEl = d;
  },

  reset() {
    this.nextT = null; // (rolled on the first step of the run, once the run's dice are seeded)
    this.cur = null; this.shown = null;
    if (this.bannerEl) this.bannerEl.style.display = 'none';
  },

  /* v98: the picture: banner and 3D light follow the current event */
  tick(rd) {
    const ev = this.cur;
    if (!ev || G.state !== 'PLAY' || CALM) { if (this.bannerEl && this.bannerEl.style.display !== 'none') this.bannerEl.style.display = 'none'; this.shown = ev; return; }
    this.ensureDOM();
    if (this.shown !== ev) {
      this.shown = ev; const L = s => (typeof lt === 'function' ? lt(s) : s), type = ev.type;
      this.bannerEl.textContent = '⚡ ' + (type === 'tunnel' ? L('NEON TUNNEL BLACKOUT') : type === 'laser' ? L('LASER GATEWAY AHEAD') : L('PARALLEL EXPRESS!'));
      this.bannerEl.style.borderColor = type === 'laser' ? '#ff0844' : type === 'tunnel' ? '#7b61ff' : '#00f2fe';
      this.bannerEl.style.display = 'block';
    }
    if (ev.t > 2.2 && this.bannerEl.style.display !== 'none') this.bannerEl.style.display = 'none';
    if (ev.type === 'tunnel' && typeof R3 !== 'undefined' && R3.hemi) R3.hemi.intensity = 0.45 * (1 - Math.sin(Math.min(1, ev.t / ev.d) * Math.PI) * 0.78);
  },
  /* v98: the rule, in the simulation step */
  simStep(dt) {
    if (!Sim98.on('events91') || G.state !== 'PLAY' || G.mode === 'puzzle' || G.mode === 'dojo') return;
    if (this.nextT == null) this.nextT = 20 + R.f() * 10;
    if (!this.cur) {
      this.nextT -= dt;
      const busy = typeof window.__V96 !== 'undefined' && window.__V96.TrackEvents96 && window.__V96.TrackEvents96.cur; // (one rail event at a time)
      if (this.nextT <= 0 && !Boss.cur && !busy) {
        const types = ['tunnel', 'laser', 'express'];
        const type = types[(R.f() * types.length) | 0];
        this.cur = { type, t: 0, d: type === 'tunnel' ? 7.5 : type === 'laser' ? 4.2 : 5.0, y: -40, phased: false };
      }
      return;
    }

    const ev = this.cur;
    ev.t += dt;

    // Laser Gate sweep physics + stylish Phase-Through bonus
    if (ev.type === 'laser') {
      ev.y = -40 + (ev.t / ev.d) * ((V.VH || 760) + 120);
      if (!ev.phased && Math.abs(P.y - ev.y) < 22) {
        if (P.dashing || P.dashT > 0.02) {
          ev.phased = true;
          if (typeof addOD === 'function') addOD(22);
          if (typeof FX !== 'undefined') {
            FX.text(P.x, P.y - 34, typeof lt === 'function' ? lt('PHASE THROUGH! +OD') : 'PHASE THROUGH! +OD', '#00f2fe', 14, 1);
            FX.ring(P.x, P.y, 95, '#00f2fe', 4);
          }
        }
      }
    }

    if (ev.t >= ev.d) {
      if (typeof R3 !== 'undefined' && R3.hemi) R3.hemi.intensity = 0.45;
      this.cur = null;
      this.nextT = 24 + R.f() * 14;
    }
  },

  draw2D() {
    if (!this.cur || CALM || typeof cx === 'undefined') return;
    const ev = this.cur;
    const W = V.VW || 420, H = V.VH || 760;

    if (ev.type === 'tunnel') {
      const k = Math.sin(Math.min(1, ev.t / ev.d) * Math.PI);
      cx.save();
      cx.fillStyle = 'rgba(2, 3, 10, ' + (0.48 * k).toFixed(3) + ')';
      cx.fillRect(0, 0, W, H);
      // Neon overhead tunnel arch ribs streaking past
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = 'rgba(123, 97, 255, ' + (0.45 * k).toFixed(3) + ')';
      cx.lineWidth = 3;
      const off = (ev.t * 950) % 140;
      for (let y = off - 140; y < H + 140; y += 140) {
        cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke();
      }
      cx.restore();
    } else if (ev.type === 'laser') {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = ev.phased ? '#00f2fe' : '#ff0844';
      cx.lineWidth = 10;
      cx.globalAlpha = 0.55;
      cx.beginPath(); cx.moveTo(V.L - 10, ev.y); cx.lineTo(V.R + 10, ev.y); cx.stroke();
      cx.strokeStyle = '#ffffff';
      cx.lineWidth = 2.5;
      cx.globalAlpha = 0.95;
      cx.stroke();
      cx.restore();
    } else if (ev.type === 'express') {
      const k = Math.sin(Math.min(1, ev.t / ev.d) * Math.PI);
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      const sx = V.R + 28;
      const off = (ev.t * 1400) % 90;
      cx.fillStyle = 'rgba(0, 242, 254, ' + (0.35 * k).toFixed(3) + ')';
      cx.fillRect(sx, 0, 14, H);
      cx.fillStyle = 'rgba(255, 215, 0, ' + (0.7 * k).toFixed(3) + ')';
      for (let y = off - 90; y < H + 90; y += 90) cx.fillRect(sx + 2, y, 8, 36);
      cx.restore();
    }
  }
};

/* ==========================================================================
   5. Awakened91 — AWAKENED WEAPON EVOLUTION (COMBO 20+ RADIANT FORM)
   ========================================================================== */
const Awakened91 = {
  active: false,
  dashCount: 0,
  reset() { this.active = false; this.dashCount = 0; },
  check() { }, // (v98: moved to simStep, the simulation step)
  simStep() {
    if (!Sim98.on('awaken91') || this.active || G.state !== 'PLAY') return;
    if ((G.combo | 0) >= 20) {
      this.active = true;
      if (typeof FX !== 'undefined' && !REPLAY.fast) {
        FX.call(typeof lt === 'function' ? lt('AWAKENED BLADE!') : 'AWAKENED BLADE!', '#ffd700', 3, 28);
        FX.ring(P.x, P.y, 180, '#ffd700', 6);
      }
      if (typeof Cinema3D89 !== 'undefined' && !REPLAY.fast) {
        Cinema3D89.flash(P.x, P.y, '#ffd700', 850, 0.35);
        Cinema3D89.triggerRGB(0.7);
      }
    }
  },
  onSlash() {
    if (!this.active || !Sim98.on('awaken91')) return;
    this.dashCount++;
    if (this.dashCount % 3 === 0 && typeof EN !== 'undefined') {
      // Awakened chain-lightning burst to nearest enemy!
      let best = null, bd = 240;
      for (let i = 0; i < EN.n; i++) {
        const e = EN.a[i];
        if (!e.alive || e.al > 0) continue;
        const d = Math.hypot(e.x - P.x, e.y - P.y);
        if (d < bd) { bd = d; best = e; }
      }
      if (best) {
        damageEnemy(best, 1.4 * (G.dmgMod || 1), Math.atan2(best.y - P.y, best.x - P.x), 1);
        if (typeof FX !== 'undefined') {
          FX.streak(P.x, P.y, Math.atan2(best.y - P.y, best.x - P.x), '#ffd700', 4);
          FX.spark(best.x, best.y, '#ffd700', 10);
        }
      }
    }
  },
  draw2D() {
    if (!this.active || CALM || typeof cx === 'undefined' || !P) return;
    const t = performance.now() * 0.006;
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.globalAlpha = 0.55;
    cx.beginPath();
    cx.arc(P.x, P.y, 26 + Math.sin(t * 2) * 3, t, t + Math.PI * 1.35);
    cx.stroke();
    cx.restore();
  }
};

/* ==========================================================================
   6. ShadowRival91 — SURPRISE SHADOW RIVAL INVASION MINI-BOSS
   ========================================================================== */
const ShadowRival91 = {
  rival: null,
  spawnedThisRun: false,
  timer: 35,
  reset() { this.rival = null; this.spawnedThisRun = false; this.timer = null; },
  tick() { }, // (v98: moved to simStep, the simulation step)
  simStep(dt) {
    if (!Sim98.on('rival91') || G.state !== 'PLAY' || G.mode === 'puzzle' || G.mode === 'dojo') return;
    if (this.timer == null) this.timer = 32 + R.f() * 14;
    if (this.rival) {
      if (!this.rival.alive) {
        this.rival = null;
        G.score += 1500;
        if (typeof addOD === 'function') addOD(100);
        if (typeof FX !== 'undefined') {
          FX.call(typeof lt === 'function' ? lt('RIVAL DEFEATED!') : 'RIVAL DEFEATED!', '#ff4fd8', 3, 28);
          FX.ring(P.x, P.y, 200, '#ff4fd8', 7);
        }
      }
      return;
    }
    if (this.spawnedThisRun || Boss.cur) return;
    this.timer -= dt;
    if (this.timer <= 0 && typeof spawnEnemy === 'function' && typeof ET !== 'undefined') {
      this.spawnedThisRun = true;
      const sx = V.CX, sy = 110;
      const e = spawnEnemy(ET.CLONE != null ? ET.CLONE : ET.RONIN || 0, sx, sy, true);
      if (e) {
        e.hp = Math.max(e.hp * 2.2, 8);
        e.mhp = e.hp;
        e.col = '#ff0844';
        this.rival = e;
        if (typeof FX !== 'undefined') {
          FX.call(typeof lt === 'function' ? lt('SHADOW RIVAL INVASION!') : 'SHADOW RIVAL INVASION!', '#ff0844', 3, 26);
          FX.ring(sx, sy, 160, '#ff0844', 6);
        }
        if (typeof Cinema3D89 !== 'undefined') Cinema3D89.triggerRGB(0.8);
      }
    }
  }
};

/* ==========================================================================
   7. DojoLab91 — LIVE DOJO COMBO LAB (DPS METER, INF OD & PARRY DUMMY)
   ========================================================================== */
const DojoLab91 = {
  el: null, dpsEl: null, peakEl: null, totEl: null, odBtn: null,
  infOD: false,
  dmgLog: [],
  totalDmg: 0,
  peakDps: 0,

  ensureDOM() {
    if (this.el) return;
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const d = document.createElement('div');
    d.id = 'dojo91-lab';
    d.innerHTML =
      '<div class="d91-title">⚡ ' + L('COMBO LAB') + '</div>' +
      '<div class="d91-row"><span>DPS</span><span class="d91-val" id="d91-dps">0</span></div>' +
      '<div class="d91-row"><span>PEAK</span><span class="d91-val" id="d91-peak">0</span></div>' +
      '<div class="d91-row"><span>TOTAL</span><span class="d91-val" id="d91-tot">0</span></div>' +
      '<button id="d91-od">' + L('INF OVERDRIVE') + ': OFF</button>' +
      '<button id="d91-dum">+ ' + L('PARRY DUMMY') + '</button>';
    document.body.appendChild(d);
    this.el = d;
    this.dpsEl = d.querySelector('#d91-dps');
    this.peakEl = d.querySelector('#d91-peak');
    this.totEl = d.querySelector('#d91-tot');
    this.odBtn = d.querySelector('#d91-od');
    this.odBtn.onclick = () => {
      this.infOD = !this.infOD;
      this.odBtn.classList.toggle('on', this.infOD);
      this.odBtn.textContent = L('INF OVERDRIVE') + ': ' + (this.infOD ? 'ON' : 'OFF');
    };
    d.querySelector('#d91-dum').onclick = () => {
      if (typeof spawnEnemy === 'function' && typeof ET !== 'undefined') {
        const e = spawnEnemy(ET.SNIPER != null ? ET.SNIPER : 1, V.CX + (Math.random() - .5) * 140, 150, false);
        if (e) { e.hp = 12; e.mhp = 12; }
      }
    };
  },

  simStep() { if (this.infOD && !REPLAY.on && G.mode === 'dojo' && G.state === 'PLAY') { G.od = 100; P.ch = P.maxCh; } },
  recordDmg(amt) {
    if (G.mode !== 'dojo' || !(amt > 0)) return;
    const now = performance.now();
    this.dmgLog.push([now, amt * 100]);
    this.totalDmg += amt * 100;
  },

  tick() {
    const show = G && G.mode === 'dojo' && G.state === 'PLAY' && !G.photo;
    if (!show) { if (this.el) this.el.style.display = 'none'; return; }
    this.ensureDOM();
    this.el.style.display = 'flex';
    const now = performance.now();
    while (this.dmgLog.length && now - this.dmgLog[0][0] > 3000) this.dmgLog.shift();
    let sum = 0;
    for (const x of this.dmgLog) sum += x[1];
    const dps = Math.round(sum / 3);
    if (dps > this.peakDps) this.peakDps = dps;
    this.dpsEl.textContent = dps;
    this.peakEl.textContent = this.peakDps;
    this.totEl.textContent = Math.round(this.totalDmg);
  }
};

/* ==========================================================================
   HOOK WIRING — Clean, isolated, zero-regression v91 integration
   ========================================================================== */
{
  // 1. Hook 3D builders for Anime 2D-to-3D Cel-Shading & Outlines
  if (typeof Human !== 'undefined' && Human.build) {
    const hb91 = Human.build.bind(Human);
    Human.build = function (L, wid) {
      const g = hb91(L, wid);
      return AnimeToon91.stylizeHero(g, L);
    };
  }
  if (typeof R3 !== 'undefined') {
    if (R3.hero) {
      const rh91 = R3.hero.bind(R3);
      R3.hero = function (col, col2, ghost) {
        const g = rh91(col, col2, ghost);
        if (!ghost) AnimeToon91.stylizeHero(g, { a: col, b: col2 });
        return g;
      };
    }
    if (R3.enemyInst) {
      const re91 = R3.enemyInst.bind(R3);
      R3.enemyInst = function (e) {
        const g = re91(e);
        return AnimeToon91.stylizeEnemy(g, e);
      };
    }
    if (R3.bossModel) {
      const rb91 = R3.bossModel.bind(R3);
      R3.bossModel = function (b) {
        const g = rb91(b);
        return AnimeToon91.stylizeBoss(g, b);
      };
    }
  }

  // 2. Hook overdrive() for Anime Cut-In & Judgment Ultimate Finisher
  if (typeof overdrive === 'function') {
    const od91 = overdrive;
    overdrive = function () {
      const before = G.odT;
      const r = od91.apply(this, arguments);
      if (G.odT > before) {
        try { CutIn91.trigger(); } catch (e) {}
      }
      return r;
    };
  }

  // 3. Hook slash() for Blade Clash check & Awakened lightning
  const sl91 = slash;
  slash = function (a) {
    const r = sl91.apply(this, arguments);
    try {
      BladeClash91.tryStart();
      Awakened91.onSlash();
    } catch (e) {}
    return r;
  };

  // 4. Hook damageEnemy() for Dojo DPS meter
  if (typeof damageEnemy === 'function') {
    const de91 = damageEnemy;
    damageEnemy = function (e, d, a, src) {
      try { DojoLab91.recordDmg(d); } catch (er) {}
      return de91.apply(this, arguments);
    };
  }

  // 5. Hook Director.begin for clean run resets
  const db91 = Director.begin.bind(Director);
  Director.begin = function () {
    SetPieces91.reset();
    Awakened91.reset();
    ShadowRival91.reset();
    BladeClash91.active = false; BladeClash91.cd = 0;
    DojoLab91.dmgLog.length = 0; DojoLab91.totalDmg = 0; DojoLab91.peakDps = 0;
    return db91.apply(this, arguments);
  };

  // 6. Hook drawPlayer & HUD.draw for 2D layers & system ticks
  const dp91 = drawPlayer;
  drawPlayer = function () {
    try {
      SetPieces91.draw2D();
      Awakened91.draw2D();
    } catch (e) {}
    return dp91.apply(this, arguments);
  };

  const hd91 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try {
      CutIn91.tickAndDraw(rd);
      BladeClash91.tick(rd);
      SetPieces91.tick(rd);
      Awakened91.check();
      ShadowRival91.tick(rd);
      DojoLab91.tick();
    } catch (e) {}
    return hd91(rd);
  };

  // 7. Settings panel for v91 LEGENDARY OVERHAUL
  if (typeof PC !== 'undefined' && PC.settings) {
    const ps91 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps91(head, cycle, box, s);
      try {
        head('LEGENDARY OVERHAUL (v91)');
        cycle('3D Visual Style', 'style3d91', ['anime', 'metallic'], ['ANIME 2D-STYLE', 'CYBER METALLIC']);
        cycle('Overdrive Anime Cut-In', 'cutin91', [1, 0], ['ON', 'OFF']);
        cycle('Boss Blade Clash', 'clash91', [1, 0], ['ON', 'OFF']);
        cycle('Dynamic Roof Events', 'events91', [1, 0], ['ON', 'OFF']);
        cycle('Awakened Weapons', 'awaken91', [1, 0], ['ON', 'OFF']);
        cycle('Shadow Rival Invasion', 'rival91', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}

