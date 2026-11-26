/* ==========================================================================
   VERSION 95.0 — ULTIMATE IDENTITY, BOSS ENRAGE, STORY & STUDIO SOUNDTRACK
   1. HeroForge95     — Bespoke 3D proportions, bone gear (31 bodies) & auras (70+ skins)
   2. WeaponForge95   — Bespoke 3D finishes (26 weapons) & weapon-family animations
   3. PetForge95      — Bespoke 3D designs & live ability animations (17 pets)
   4. BossEnrage95    — 3D Boss Phase 2 / Phase 3 Enrage aura & shockwave
   5. StoryOverhaul95 — Prototype Zero stakes, mid-fight boss banter & Dual Ending
   6. StudioAudio95   — Real Studio Vocal/Instrumental Soundtrack Engine with
                        Crossfade, Auto-Ducking, ./audio/*.mp3 auto-load &
                        IndexedDB persistent in-game MP3/WAV uploader
   ========================================================================== */

try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "IDENTITY & AUDIO (v95)": "זהות, סיפור ופסקול אולפן (v95)",
    "Unique 3D Hero Gear": "ציוד וצללית 3D ייחודית לכל דמות",
    "Living Hero Auras": "הילות 3D חיות לכל דמות",
    "Bespoke 3D Weapons": "עיצוב ואנימציות 3D לכל 26 הנשקים",
    "Bespoke 3D Pets": "עיצוב ואנימציות 3D לכל 17 החיות",
    "Boss 3D Enrage Auras": "הילות זעם 3D לבוסים (שלב 2/3)",
    "Story Overhaul & Banter": "שדרוג סיפור ומשפטי קרב לבוסים",
    "Studio Vocal Soundtrack": "פסקול אולפן (טראקים עם שירה)",
    "SOUNDTRACK": "פסקול",
    "STUDIO SOUNDTRACK (v95)": "פסקול אולפן (v95)",
    "PHASE 2 — ENRAGED!": "שלב 2 — מצב זעם!",
    "FINAL PHASE — OVERLOAD!": "שלב סופי — עומס יתר!",
    "NEURAL SYNC WARNING": "אזהרת סנכרון עצבי",
    "THE FINAL CHOICE": "הבחירה האחרונה"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "IDENTITY & AUDIO (v95)": "الهوية والصوت الاستوديو (v95)",
    "SOUNDTRACK": "الموسيقى",
    "Studio Vocal Soundtrack": "موسيقى استوديو غنائية"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "IDENTITY & AUDIO (v95)": "СТИЛЬ, СЮЖЕТ И САУНДТРЕК (v95)",
    "SOUNDTRACK": "САУНДТРЕК",
    "Studio Vocal Soundtrack": "Студийный саундтрек с вокалом"
  });
} catch (e) { errLog(e); }

const S95 = {
  on(k, defVal) {
    try {
      const s = Store && Store.data && Store.data.settings;
      if (!s || s[k] == null) return defVal == null ? true : !!defVal;
      return !!s[k];
    } catch (e) { return defVal == null ? true : !!defVal; }
  }
};

function mat95(hex, emHex, emInt, metal, rough, opacity) {
  const T = THREE;
  const isAnim = typeof S91 !== 'undefined' && S91.isAnime();
  if (emInt && emInt >= 1.6) {
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
      emissiveIntensity: emInt || 0.25,
      transparent: opacity != null && opacity < 1,
      opacity: opacity != null ? opacity : 1,
      side: T.DoubleSide
    });
  }
  return new T.MeshStandardMaterial({
    color: new T.Color(hex),
    emissive: new T.Color(emHex || '#000000'),
    emissiveIntensity: emInt || 0.2,
    metalness: metal != null ? metal : 0.65,
    roughness: rough != null ? rough : 0.32,
    transparent: opacity != null && opacity < 1,
    opacity: opacity != null ? opacity : 1,
    side: T.DoubleSide
  });
}

function addPart95(geo, mat, x, y, z, rx, ry, rz, parent, noOutline) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  if (rx) m.rotation.x = rx;
  if (ry) m.rotation.y = ry;
  if (rz) m.rotation.z = rz;
  parent.add(m);
  if (!noOutline && typeof AnimeToon91 !== 'undefined' && typeof S91 !== 'undefined' && S91.isAnime() && !(mat.isMeshBasicMaterial)) {
    AnimeToon91.addOutline(m, 1.07, AnimeToon91.inkBlack);
  }
  return m;
}

/* ==========================================================================
   1. HeroForge95 — BESPOKE 3D HERO SILHOUETTES (ALL 70+ SKINS)
   ========================================================================== */
const HeroForge95 = {
  hash(str) {
    let h = 2166136261;
    const s = String(str || 'cyan');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  },
  getProfile(body) {
    if (['oni', 'exo', 'mecha', 'knight', 'viking', 'yeti', 'shogun', 'ashura', 'dragon'].includes(body))
      return { sx: 1.12, sy: 1.12, sz: 1.07, hover: 0 };
    if (['seraph', 'lich', 'sovereign', 'yurei', 'raijin', 'tengu', 'witch'].includes(body))
      return { sx: 0.98, sy: 0.98, sz: 1.04, hover: 3.4 };
    if (['ninja', 'shinobi2', 'neko', 'kitsune', 'wolf', 'netrunner', 'idol', 'rider'].includes(body))
      return { sx: 0.94, sy: 0.94, sz: 1.02, hover: 0 };
    return { sx: 1.0, sy: 1.0, sz: 1.0, hover: 0 };
  },
  enhance(g, L) {
    if (!S95.on('gear95', true) || !g || !g.human || !g.human.B || typeof THREE === 'undefined' || g._v95Done) return g;
    g._v95Done = 1;
    try {
      const T = THREE, body = (L && L.body) || 'ninja', sid = (L && L.id) || body;
      const h = this.hash(sid), ca = (L && L.a) || '#00f2fe', cb = (L && L.b) || '#ff0844';
      const prof = this.getProfile(body);
      const rigRoot = g.human.r && g.human.r.o;
      if (rigRoot) { rigRoot.scale.x *= prof.sx; rigRoot.scale.y *= prof.sz; rigRoot.scale.z *= prof.sy; }
      const B = g.human.B, spine = B.spine2 || B.spine || B.hips;
      if (!spine) return g;
      const ws = new T.Vector3(); spine.getWorldScale(ws);
      const gear = new T.Group(); gear.scale.setScalar(1 / Math.max(1e-4, ws.x)); spine.add(gear);

      const darkMetal = mat95('#151a2e', ca, 0.22, 0.78, 0.28);
      const accentMat = mat95(cb, cb, 0.45, 0.6, 0.3);
      const glowA     = mat95(ca, ca, 2.2, 0.2, 0.2, 0.92);
      const glowB     = mat95(cb, cb, 2.0, 0.2, 0.2, 0.88);
      const glowGold  = mat95('#ffd700', '#ffd700', 2.0, 0.4, 0.2, 0.92);

      const anim = { hover: prof.hover, wingsL: [], wingsR: [], thrusters: [], orbitGrp: null, orbitSpeed: 1.4 + (h % 5) * 0.25, tails: [], halo: null };

      if (['ronin', 'shogun', 'chromesam'].includes(body)) {
        for (const s of [-1, 1]) {
          for (let k = 0; k < 3; k++) addPart95(new T.BoxGeometry(4.2, 1.1, 3.8), k === 0 ? accentMat : darkMetal, s * (6.2 + k * 0.35), 2.8 - k * 1.4, 0, 0, 0, s * -0.28, gear);
          addPart95(new T.BoxGeometry(4.4, 0.35, 4.0), glowA, s * 6.3, 3.4, 0, 0, 0, s * -0.28, gear);
        }
        addPart95(new T.CylinderGeometry(0.32, 0.32, 18, 6), darkMetal, 0, 6.5, -4.2, 0, 0, 0, gear);
        addPart95(new T.PlaneGeometry(5.2, 11.5), glowA, 0, 9.8, -5.2, 0, 0, 0, gear, true);
      } else if (['mecha', 'exo', 'rider'].includes(body)) {
        for (const s of [-1, 1]) {
          addPart95(new T.BoxGeometry(3.2, 7.2, 3.6), darkMetal, s * 3.8, 1.2, -4.4, 0.22, 0, s * -0.22, gear);
          addPart95(new T.BoxGeometry(3.6, 1.2, 3.9), glowA, s * 4.0, 4.6, -4.0, 0.22, 0, s * -0.22, gear);
          anim.thrusters.push(addPart95(new T.ConeGeometry(1.3, 6.5, 8), glowB, s * 4.4, -4.2, -5.6, Math.PI + 0.22, 0, s * -0.22, gear, true));
          addPart95(new T.BoxGeometry(2.2, 4.6, 3.2), accentMat, s * 6.8, 3.5, 0, 0, 0, s * -0.35, gear);
        }
      } else if (['seraph', 'tengu', 'dragon', 'ashura'].includes(body)) {
        const count = body === 'seraph' ? 4 : 3;
        for (const s of [-1, 1]) {
          const wGrp = new T.Group(); wGrp.position.set(s * 2.2, 2.5, -3.5); gear.add(wGrp);
          for (let k = 0; k < count; k++) addPart95(new T.ConeGeometry(1.35 - k * 0.15, 13.5 - k * 1.9, 4), k % 2 === 0 ? glowA : glowB, s * (4.8 + k * 0.8), 2.5 - k * 2.4, -1.2 - k * 0.5, 0.2, 0, s * (-1.15 - k * 0.22), wGrp, true);
          if (s < 0) anim.wingsL.push(wGrp); else anim.wingsR.push(wGrp);
        }
        if (body === 'seraph' || body === 'ashura') anim.halo = addPart95(new T.TorusGeometry(4.6, 0.35, 8, 32), glowGold, 0, 11.2, -3.5, 0.15, 0, 0, gear, true);
      } else if (['sovereign', 'lich', 'yurei', 'skull'].includes(body)) {
        const orb = new T.Group(); orb.position.set(0, 2.2, -2.5); gear.add(orb);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; addPart95(new T.ConeGeometry(0.65, 5.4, 4), i % 2 ? glowA : glowB, Math.cos(a) * 8.2, Math.sin(a) * 8.2, 0, 0, 0, a - Math.PI / 2, orb, true); }
        anim.orbitGrp = orb;
        addPart95(new T.TorusGeometry(4.2, 0.85, 6, 16, Math.PI * 1.3), darkMetal, 0, 4.4, -1.2, Math.PI / 2, 0, Math.PI * 0.85, gear);
      } else if (['raijin', 'blaze'].includes(body)) {
        const orb = new T.Group(); orb.position.set(0, 4.5, -4.6); gear.add(orb);
        addPart95(new T.TorusGeometry(7.8, 0.28, 8, 36), glowA, 0, 0, 0, 0, 0, 0, orb, true);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; addPart95(new T.CylinderGeometry(1.5, 1.5, 0.9, 10), i % 2 ? glowGold : glowB, Math.cos(a) * 7.8, Math.sin(a) * 7.8, 0, Math.PI / 2, 0, 0, orb); }
        anim.orbitGrp = orb;
      } else if (['kitsune', 'wolf', 'neko'].includes(body)) {
        const nTails = body === 'kitsune' ? 5 : 1;
        for (let i = 0; i < nTails; i++) {
          const tg = new T.Group(); tg.position.set(0, -4.2, -3.2); tg.rotation.z = nTails > 1 ? ((i / (nTails - 1)) - 0.5) * 1.5 : 0; gear.add(tg);
          addPart95(new T.ConeGeometry(1.35, 11.5, 6), i % 2 === 0 ? glowA : accentMat, 0, 3.2, -4.2, -1.05, 0, 0, tg);
          anim.tails.push(tg);
        }
        const orb = new T.Group(); orb.position.set(0, 3.5, 0); gear.add(orb);
        for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; addPart95(new T.OctahedronGeometry(0.95, 0), glowA, Math.cos(a) * 9.5, 0, Math.sin(a) * 9.5, 0, 0, 0, orb, true); }
        anim.orbitGrp = orb;
      } else if (['oni', 'viking', 'knight', 'yeti'].includes(body)) {
        for (const s of [-1, 1]) {
          addPart95(new T.SphereGeometry(3.2, 10, 8), darkMetal, s * 6.5, 2.8, 0, 0, 0, 0, gear);
          addPart95(new T.ConeGeometry(0.9, 4.6, 5), glowB, s * 8.2, 5.2, 0, 0, 0, s * -0.55, gear);
          addPart95(new T.ConeGeometry(0.7, 3.2, 5), glowA, s * 7.6, 3.2, 1.8, 0.5, 0, s * -0.8, gear);
        }
        addPart95(new T.BoxGeometry(8.5, 12.0, 0.8), accentMat, 0, -2.5, -4.6, 0.14, 0, 0, gear);
      } else {
        if (body === 'netrunner' || body === 'pixel') {
          const orb = new T.Group(); orb.position.set(0, 2.5, -2.5); gear.add(orb);
          for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; addPart95(body === 'pixel' ? new T.BoxGeometry(1.6, 1.6, 1.6) : new T.TorusGeometry(1.1, 0.22, 6, 16), i % 2 ? glowA : glowB, Math.cos(a) * 8.5, Math.sin(a) * 4.5, Math.sin(a) * 3.5, a, a, 0, orb, true); }
          anim.orbitGrp = orb;
        } else if (body === 'witch' || body === 'idol') {
          const orb = new T.Group(); orb.position.set(0, 3.2, -1.5); gear.add(orb);
          for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; addPart95(new T.OctahedronGeometry(1.25, 0), i % 2 ? glowGold : glowA, Math.cos(a) * 9.0, Math.sin(a * 2) * 2.2, Math.sin(a) * 9.0, 0, 0, 0, orb, true); }
          anim.orbitGrp = orb;
        } else {
          for (const s of [-1, 1]) {
            addPart95(new T.BoxGeometry(1.2, 9.5, 0.45), darkMetal, s * 1.4, 2.0, -4.1, 0, 0, s * 0.52, gear);
            addPart95(new T.BoxGeometry(0.55, 7.2, 0.55), glowA, s * 1.4, 2.0, -4.3, 0, 0, s * 0.52, gear, true);
            addPart95(new T.BoxGeometry(3.0, 0.9, 2.8), accentMat, s * 5.8, 3.0, 0, 0, 0, s * -0.25, gear);
          }
        }
      }

      const ct = h % 4;
      const cGeo = ct === 0 ? new T.OctahedronGeometry(1.35, 0) : ct === 1 ? new T.CylinderGeometry(1.25, 1.25, 0.6, 6).rotateX(Math.PI / 2) : ct === 2 ? new T.BoxGeometry(1.8, 1.8, 0.6).rotateZ(Math.PI / 4) : new T.TorusGeometry(1.15, 0.32, 6, 16);
      addPart95(cGeo, glowA, 0, 1.8, 3.55, 0, 0, 0, gear, true);

      if (S95.on('aura95', true) && !anim.orbitGrp) {
        const orb = new T.Group(); orb.position.set(0, 1.2, 0); gear.add(orb);
        const sat = 2 + (h % 3), rad = 8.4 + (h % 3) * 0.9;
        for (let i = 0; i < sat; i++) { const a = (i / sat) * Math.PI * 2; addPart95(h % 2 ? new T.TetrahedronGeometry(0.95, 0) : new T.OctahedronGeometry(0.75, 0), i % 2 ? glowB : glowA, Math.cos(a) * rad, i % 2 ? 1.5 : -1.5, Math.sin(a) * rad, 0, 0, 0, orb, true); }
        anim.orbitGrp = orb;
      }
      g._v95 = anim;
    } catch (e) { errLog(e); }
    return g;
  },
  tick(g, o, rd, t) {
    const a = g && g._v95; if (!a) return;
    const dash = !!(o && o.dashing), combo = (typeof G !== 'undefined' && G.combo) | 0, isOD = typeof G !== 'undefined' && G.odT > 0;
    if (a.hover > 0) g.position.z = (g.position.z || 0) + a.hover + Math.sin(t * 3.4) * 1.6;
    if (a.wingsL.length || a.wingsR.length) {
      const fl = (dash || isOD ? 0.42 : 0) + Math.sin(t * 4.2) * 0.14;
      for (const w of a.wingsL) w.rotation.y = 0.25 + fl;
      for (const w of a.wingsR) w.rotation.y = -0.25 - fl;
    }
    if (a.thrusters.length) {
      const boost = (dash ? 1.85 : isOD ? 1.45 : (o && o.spd > 100 ? 1.2 : 0.72)) * (0.9 + Math.sin(t * 32) * 0.15);
      for (const c of a.thrusters) c.scale.set(1, boost, 1);
    }
    a.tails.forEach((tg, i) => { tg.rotation.x = Math.sin(t * 4.5 + i * 0.7) * 0.22; });
    const sm = 1 + Math.min(2.5, combo * 0.06) + (isOD ? 1.2 : 0);
    if (a.orbitGrp) a.orbitGrp.rotation.y = t * a.orbitSpeed * sm;
    if (a.halo) a.halo.rotation.z = t * 1.8 * sm;
  }
};

/* ==========================================================================
   2. WeaponForge95 — BESPOKE 3D WEAPON DESIGNS (ALL 26) & FAMILY ANIMATIONS
   ========================================================================== */
const WeaponForge95 = {
  SPECS: {
    katana: { col: '#00f2fe', style: 'tsubaHex' }, nodachi: { col: '#ff4fd8', style: 'dragonGuard' },
    muramasa: { col: '#ff0844', style: 'cursedRunes' }, thunder: { col: '#ffe600', style: 'lightningCoil' },
    cryo: { col: '#7df9ff', style: 'frostSpikes' }, phoenix: { col: '#ff6a00', style: 'flameWing' },
    zerocut: { col: '#00ff9d', style: 'prismRail' }, dominator: { col: '#ffd700', style: 'crownProngs' },
    beamsaber: { col: '#00f2fe', style: 'emitterVents' }, daggers: { col: '#00f2fe', style: 'twinRing' },
    monarch: { col: '#9d4edd', style: 'shadowOrbit' }, kunai: { col: '#ff9a00', style: 'ringPommel' },
    claws: { col: '#ff0844', style: 'tripleTalon' }, hammer: { col: '#ffb020', style: 'reactorHead' },
    cleaver: { col: '#ff2b5e', style: 'sawTeeth' }, scythe: { col: '#c45bff', style: 'soulLantern' },
    spear: { col: '#00f2fe', style: 'spearTassel' }, staff: { col: '#ffd700', style: 'haloRings' },
    glaive: { col: '#ff4fd8', style: 'crescentFin' }, whip: { col: '#ff0844', style: 'energyNodes' },
    monowire: { col: '#00ff9d', style: 'laserSpool' }, chakram: { col: '#ffd700', style: 'sawRim' },
    tessen: { col: '#ff4fd8', style: 'fanRibs' }, bow: { col: '#00f2fe', style: 'energyString' },
    drill: { col: '#ffb020', style: 'spiralCoils' }, fists: { col: '#ff6a00', style: 'knuckleJets' }
  },
  decorate(g, id) {
    if (!S95.on('weap95', true) || !g || !g.blade || typeof THREE === 'undefined') return;
    try {
      const T = THREE, spec = this.SPECS[id] || { col: '#00f2fe', style: 'tsubaHex' }, bl = g.blade;
      const glowM = mat95(spec.col, spec.col, 2.3, 0.2, 0.2, 0.94);
      const darkM = mat95('#101424', spec.col, 0.25, 0.85, 0.25);
      const goldM = mat95('#ffd700', '#ffb020', 0.8, 0.85, 0.22);
      const dec = new T.Group(); bl.add(dec);
      const spin = [], pulse = [], st = spec.style;

      if (st === 'tsubaHex' || st === 'dragonGuard') {
        addPart95(new T.CylinderGeometry(3.4, 3.4, 1.0, 6).rotateZ(Math.PI / 2), goldM, 1.6, 0, 0, 0, 0, 0, dec);
        spin.push(addPart95(new T.TorusGeometry(3.8, 0.28, 6, 18).rotateY(Math.PI / 2), glowM, 1.6, 0, 0, 0, 0, 0, dec, true));
        if (st === 'dragonGuard') for (const s of [-1, 1]) addPart95(new T.ConeGeometry(0.9, 5.2, 4), glowM, 3.2, s * 3.4, 0, 0, 0, s * -0.45, dec, true);
      } else if (st === 'cursedRunes') {
        for (let i = 0; i < 4; i++) pulse.push(addPart95(new T.OctahedronGeometry(1.1, 0), glowM, 8 + i * 7, 0, 2.4 * (i % 2 ? 1 : -1), 0, 0, 0, dec, true));
        addPart95(new T.TorusGeometry(3.5, 0.35, 6, 20).rotateY(Math.PI / 2), glowM, 1.5, 0, 0, 0, 0, 0, dec, true);
      } else if (st === 'lightningCoil') {
        for (let i = 0; i < 5; i++) spin.push(addPart95(new T.TorusGeometry(2.0, 0.24, 6, 14).rotateY(Math.PI / 2), glowM, 6 + i * 5.2, 0, 0, 0, 0, 0, dec, true));
      } else if (st === 'frostSpikes') {
        for (let i = 0; i < 4; i++) addPart95(new T.ConeGeometry(0.85, 3.6, 4), glowM, 7 + i * 6.5, (i % 2 ? 1 : -1) * 1.9, 0, 0, 0, (i % 2 ? -0.9 : 0.9), dec, true);
      } else if (st === 'flameWing') {
        for (const s of [-1, 1]) addPart95(new T.ConeGeometry(1.3, 8.5, 4), glowM, 4.5, s * 4.2, 0, 0, 0, s * -0.85, dec, true);
        pulse.push(addPart95(new T.OctahedronGeometry(1.8, 0), glowM, 1.8, 0, 0, 0, 0, 0, dec, true));
      } else if (st === 'prismRail' || st === 'emitterVents') {
        for (let i = 0; i < 3; i++) addPart95(new T.BoxGeometry(1.2, 3.2, 3.2), darkM, 2.5 + i * 2.2, 0, 0, 0, 0, 0, dec);
        addPart95(new T.BoxGeometry(28, 0.45, 3.4), glowM, 17, 0, 0, 0, 0, 0, dec, true);
      } else if (st === 'crownProngs') {
        for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; addPart95(new T.ConeGeometry(0.9, 4.8, 4).rotateZ(-Math.PI / 2), goldM, 4.2, Math.cos(a) * 3.0, Math.sin(a) * 3.0, 0, 0, 0, dec); }
        spin.push(addPart95(new T.TorusGeometry(4.2, 0.3, 6, 20).rotateY(Math.PI / 2), glowM, 2.0, 0, 0, 0, 0, 0, dec, true));
      } else if (st === 'shadowOrbit' || st === 'twinRing' || st === 'ringPommel') {
        spin.push(addPart95(new T.TorusGeometry(2.4, 0.3, 6, 16).rotateY(Math.PI / 2), glowM, -2.8, 0, 0, 0, 0, 0, dec, true));
        if (g.blade2) { const d2 = new T.Group(); g.blade2.add(d2); spin.push(addPart95(new T.TorusGeometry(2.4, 0.3, 6, 16).rotateY(Math.PI / 2), glowM, -2.8, 0, 0, 0, 0, 0, d2, true)); }
      } else if (st === 'tripleTalon') {
        for (const s of [-1.4, 0, 1.4]) addPart95(new T.ConeGeometry(0.55, 11, 4).rotateZ(-Math.PI / 2), glowM, 10, s * 1.3, 0, 0, 0, 0, dec, true);
      } else if (st === 'reactorHead') {
        pulse.push(addPart95(new T.OctahedronGeometry(3.2, 0), glowM, 24, 0, 5.2, 0, 0, 0, dec, true));
        spin.push(addPart95(new T.TorusGeometry(6.2, 0.35, 6, 18), glowM, 24, 0, 0, 0, 0, 0, dec, true));
      } else if (st === 'sawTeeth') {
        for (let i = 0; i < 6; i++) addPart95(new T.ConeGeometry(1.1, 2.8, 3), glowM, 7 + i * 4.2, 0, -2.5, Math.PI, 0, 0, dec, true);
      } else if (st === 'soulLantern') {
        pulse.push(addPart95(new T.OctahedronGeometry(2.4, 0), glowM, 22, -4.5, 0, 0, 0, 0, dec, true));
        spin.push(addPart95(new T.TorusGeometry(3.6, 0.28, 6, 18), glowM, 22, -4.5, 0, 0, 0, 0, dec, true));
      } else if (st === 'spearTassel' || st === 'haloRings' || st === 'crescentFin') {
        spin.push(addPart95(new T.TorusGeometry(3.2, 0.3, 6, 18).rotateY(Math.PI / 2), glowM, 22, 0, 0, 0, 0, 0, dec, true));
        addPart95(new T.ConeGeometry(1.6, 6.5, 5).rotateZ(Math.PI / 2), glowM, 17, 0, 0, 0, 0, 0, dec, true);
      } else {
        for (let i = 0; i < 3; i++) pulse.push(addPart95(new T.OctahedronGeometry(1.3, 0), glowM, 5 + i * 6.5, 0, 0, 0, 0, 0, dec, true));
        spin.push(addPart95(new T.TorusGeometry(3.6, 0.3, 6, 18).rotateY(Math.PI / 2), glowM, 4, 0, 0, 0, 0, 0, dec, true));
      }
      g._w95 = { id, fam: g.wfam || 'blade', spin, pulse };
    } catch (e) { errLog(e); }
  },
  tickAnim(g, o, rd, t) {
    const w = g && g._w95; if (!w) return;
    const dash = !!(o && o.dashing);
    for (const sp of w.spin) sp.rotation.x = t * (dash ? 12 : 3.5);
    for (let i = 0; i < w.pulse.length; i++) w.pulse[i].scale.setScalar(0.85 + Math.sin(t * 8 + i) * 0.25 + (dash ? 0.35 : 0));
    const B = g.human && g.human.B; if (!B || !dash || !S95.on('weap95', true)) return;
    const fam = w.fam;
    if (fam === 'fists') { const j = Math.sin(t * 36); if (B.rArm) B.rArm.rotateX(j * 0.75); if (B.lArm) B.lArm.rotateX(-j * 0.75); if (B.spine2) B.spine2.rotateY(j * 0.45); }
    else if (fam === 'scythe' || fam === 'glaive') { if (B.spine2) B.spine2.rotateY(0.55); if (B.rArm) B.rArm.rotateZ(-0.55); }
    else if (fam === 'fan' || fam === 'ring') { if (B.rFore) B.rFore.rotateZ(t * 18); if (B.lArm) B.lArm.rotateZ(0.45); }
    else if (fam === 'bow') { if (B.lArm) B.lArm.rotateX(-0.95); if (B.rArm) B.rArm.rotateY(-0.65); }
    else if (fam === 'pole' || fam === 'staff' || fam === 'drill') { if (B.spine) B.spine.rotateX(0.35); if (B.rArm) B.rArm.rotateX(-0.65); }
    else if (fam === 'chain') { if (B.rArm) B.rArm.rotateZ(Math.sin(t * 28) * 0.85); }
  }
};

/* ==========================================================================
   3. PetForge95 — BESPOKE 3D PET DESIGNS (ALL 17) & LIVE ABILITY ANIMATIONS
   ========================================================================== */
const PetForge95 = {
  enhance(pg, id) {
    if (!S95.on('pet95', true) || !pg || typeof THREE === 'undefined' || pg._p95Done) return pg;
    pg._p95Done = 1;
    try {
      const T = THREE, pc = (typeof PET_BY_ID !== 'undefined' && PET_BY_ID[id] && PET_BY_ID[id].col) || '#00f2fe';
      const glowP = mat95(pc, pc, 2.2, 0.2, 0.2, 0.92), goldM = mat95('#ffd700', '#ffd700', 1.8, 0.6, 0.25, 0.92), darkM = mat95('#14182a', pc, 0.25, 0.7, 0.3);
      if (typeof AnimeToon91 !== 'undefined' && typeof S91 !== 'undefined' && S91.isAnime()) {
        const meshes = []; pg.traverse(o => { if (o.isMesh && !(o.userData && o.userData.isOutline91)) meshes.push(o); });
        for (const m of meshes) { if (m.material && !Array.isArray(m.material)) m.material = AnimeToon91.toToonMat(m.material, true); AnimeToon91.addOutline(m, 1.07, AnimeToon91.inkBlack); }
      }
      const anim = { id, spin: [], pulse: [], wings: [], baseScale: [1, 1, 1] };
      if (id === 'kaya') { anim.baseScale = [0.78, 0.78, 0.78]; addPart95(new T.BoxGeometry(1.2, 2.8, 0.9), mat95('#ff4fd8', '#ff4fd8', 2.0), 4.2, 0, 11.4, 0, 0, 0, pg, true); anim.spin.push(addPart95(new T.TorusGeometry(3.2, 0.24, 6, 20), goldM, 4.4, 0, 13.0, 0, 0, 0, pg, true)); }
      else if (id === 'buchi') { anim.baseScale = [1.26, 1.24, 1.18]; addPart95(new T.TorusGeometry(2.5, 0.42, 8, 18).rotateY(Math.PI / 2), glowP, 3.0, 0, 7.6, 0, 0, 0, pg, true); for (const s of [-1, 1]) addPart95(new T.BoxGeometry(2.2, 1.4, 2.2), darkM, 1.5, s * 2.4, 6.8, 0, 0, 0, pg); }
      else if (id === 'tiger') { anim.baseScale = [1.18, 1.04, 1.08]; for (let i = 0; i < 3; i++) addPart95(new T.BoxGeometry(0.7, 4.6, 1.8), glowP, -1.8 + i * 2.0, 0, 8.2, 0, 0, 0, pg, true); }
      else if (id === 'shark') { anim.spin.push(addPart95(new T.TorusGeometry(5.5, 0.25, 6, 24), glowP, 0, 0, 4, 0, 0, 0, pg, true)); }
      else if (['raven', 'owl', 'phoenix', 'batling'].includes(id)) { addPart95(new T.BoxGeometry(1.4, 2.6, 0.8), id === 'phoenix' ? goldM : glowP, 3.6, 0, 7.2, 0, 0, 0, pg, true); for (const s of [-1, 1]) anim.wings.push([addPart95(new T.ConeGeometry(1.2, 7.5, 4), glowP, -0.5, s * 5.4, 5.5, 0, 0, s * -1.25, pg, true), s]); if (id === 'phoenix') anim.spin.push(addPart95(new T.TorusGeometry(4.2, 0.28, 6, 20), goldM, 0, 0, 10.5, 0, 0, 0, pg, true)); }
      else if (id === 'fox' || id === 'komainu') { for (let i = -1; i <= 1; i++) addPart95(new T.ConeGeometry(1.0, 6.2, 5), glowP, -4.5, i * 1.8, 8.5, -0.7, 0, i * 0.45, pg, true); anim.spin.push(addPart95(new T.TorusGeometry(3.8, 0.26, 6, 18).rotateY(Math.PI / 2), id === 'komainu' ? goldM : glowP, 3.5, 0, 8.5, 0, 0, 0, pg, true)); }
      else if (id === 'turtle') { anim.pulse.push(addPart95(new T.SphereGeometry(5.8, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55).rotateX(Math.PI / 2), mat95('#00ff9d', '#00ff9d', 2.0, 0.1, 0.1, 0.28), 0, 0, 4.5, 0, 0, 0, pg, true)); }
      else if (id === 'saucer') { anim.pulse.push(addPart95(new T.ConeGeometry(4.2, 10, 12, 1, true).rotateX(Math.PI / 2), mat95('#00f2fe', '#00f2fe', 2.0, 0.1, 0.1, 0.28), 0, 0, -4, 0, 0, 0, pg, true)); }
      else if (id === 'scarab') { anim.spin.push(addPart95(new T.TorusGeometry(2.8, 0.4, 8, 20), goldM, 0, 0, 10.2, 0, 0, 0, pg, true)); }
      else if (id === 'drake') { for (const s of [-1, 1]) addPart95(new T.ConeGeometry(0.65, 3.8, 4), goldM, 3.6, s * 1.6, 10.8, 0, 0, s * -0.35, pg, true); }
      else if (id === 'k9') { addPart95(new T.BoxGeometry(1.6, 3.2, 1.1), mat95('#00f2fe', '#00f2fe', 2.2), 5.6, 0, 9.2, 0, 0, 0, pg, true); anim.pulse.push(addPart95(new T.SphereGeometry(0.9, 8, 6), mat95('#ff0844', '#ff0844', 2.4), -1.2, 0, 10.2, 0, 0, 0, pg, true)); }
      else if (id === 'penguin') { addPart95(new T.BoxGeometry(1.4, 3.0, 1.0), glowP, 2.2, 0, 9.2, 0, 0, 0, pg, true); anim.spin.push(addPart95(new T.OctahedronGeometry(1.4, 0), glowP, 0, 0, 13.5, 0, 0, 0, pg, true)); }
      else if (id === 'nano') { const orb = new T.Group(); orb.position.set(0, 0, 6); pg.add(orb); for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; addPart95(new T.BoxGeometry(1.3, 1.3, 1.3), glowP, Math.cos(a) * 5.2, Math.sin(a) * 5.2, 0, 0, 0, 0, orb, true); } anim.spin.push(orb); }
      const actRing = addPart95(new T.TorusGeometry(6.5, 0.35, 6, 24), glowP, 0, 0, 1.5, 0, 0, 0, pg, true); actRing.visible = false; anim.actRing = actRing;
      pg.scale.set(anim.baseScale[0], anim.baseScale[1], anim.baseScale[2]); pg._p95 = anim;
    } catch (e) { errLog(e); }
    return pg;
  },
  tick(pg, t, mv) {
    const a = pg && pg._p95; if (!a) return;
    for (const sp of a.spin) sp.rotation.z = t * 3.2;
    for (const pl of a.pulse) pl.scale.setScalar(0.88 + Math.sin(t * 7) * 0.16);
    for (const [w, s] of a.wings) w.rotation.z = s * (-1.25 + Math.sin(t * 14) * 0.32);
    const act = typeof Pet !== 'undefined' && (Pet.act > 0 || Pet.bark > 0 || Pet.fx > 0);
    if (a.actRing) { a.actRing.visible = !!act; if (act) { a.actRing.scale.setScalar(1 + Math.sin(t * 22) * 0.25); a.actRing.rotation.z = t * 9; } }
    if (act) {
      if (a.id === 'kaya') pg.position.z += Math.abs(Math.sin(t * 24)) * 9;
      else if (['buchi', 'tiger', 'k9', 'komainu'].includes(a.id)) { pg.position.z += Math.abs(Math.sin(t * 16)) * 14; pg.rotation.y = -0.32; }
      else if (['raven', 'owl', 'phoenix', 'batling', 'drake'].includes(a.id)) pg.rotation.y = 0.45;
      else pg.rotation.z += t * 8;
      pg.scale.set(a.baseScale[0] * 1.15, a.baseScale[1] * 1.15, a.baseScale[2] * 1.15);
    } else { pg.rotation.y = 0; pg.scale.set(a.baseScale[0], a.baseScale[1], a.baseScale[2]); }
  }
};

/* ==========================================================================
   4. BossEnrage95 — 3D BOSS PHASE 2 / PHASE 3 ENRAGE TRANSFORMATION
   ========================================================================== */
const BossEnrage95 = {
  lastBossKey: '', lastPhase: 1,
  ensureAura(bg, col) {
    if (!bg || bg._rage95 || typeof THREE === 'undefined') return;
    const T = THREE, grp = new T.Group(); grp.visible = false; bg.add(grp);
    const colP2 = new T.Color(col || '#ff4500').lerp(new T.Color('#ff2b5e'), 0.45);
    const matRing = new T.MeshBasicMaterial({ color: colP2, transparent: true, opacity: 0.78, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
    const matCore = new T.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
    const ring1 = new T.Mesh(new T.TorusGeometry(1.45, 0.08, 8, 32), matRing); ring1.position.z = 0.15; grp.add(ring1);
    const ring2 = new T.Mesh(new T.TorusGeometry(1.75, 0.055, 8, 32), matCore); ring2.position.z = 1.05; ring2.rotation.x = 0.55; grp.add(ring2);
    const orb = new T.Group(); orb.position.z = 1.1; grp.add(orb);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const sh = new T.Mesh(new T.ConeGeometry(0.16, 0.85, 4), i % 2 === 0 ? matRing : matCore); sh.position.set(Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0); sh.rotation.x = Math.PI / 2; orb.add(sh); }
    const pillars = [];
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; const p = new T.Mesh(new T.ConeGeometry(0.24, 2.2, 5, 1, true), matRing); p.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 1.0); p.rotation.x = Math.PI / 2; grp.add(p); pillars.push(p); }
    bg._rage95 = { grp, ring1, ring2, orb, pillars, matRing, matCore };
  },
  tick(rd, t) {
    if (!S95.on('boss95', true) || typeof Boss === 'undefined' || typeof R3 === 'undefined' || !R3.ok) return;
    const b = Boss.cur;
    if (!b || b.dying > 0 || !(b.mhp > 0)) { this.lastBossKey = ''; this.lastPhase = 1; return; }
    const key = 'boss' + b.id + (b.lvl || ''), ent = R3.ents && R3.ents.get(key), bg = ent && ent.g;
    if (!bg) return;
    const col = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
    this.ensureAura(bg, col);
    const rg = bg._rage95; if (!rg) return;
    const hpFrac = b.hp / b.mhp, ph = Math.max(b.ph || 1, hpFrac <= 0.32 ? 3 : hpFrac <= 0.62 ? 2 : 1);

    if (key !== this.lastBossKey) { this.lastBossKey = key; this.lastPhase = ph; }
    else if (ph > this.lastPhase) {
      this.lastPhase = ph;
      const isFinal = ph >= 3, fxCol = isFinal ? '#ff0844' : '#ffb020';
      try {
        if (typeof FX !== 'undefined') { const L = s => (typeof lt === 'function' ? lt(s) : s); FX.call(L(isFinal ? 'FINAL PHASE — OVERLOAD!' : 'PHASE 2 — ENRAGED!'), fxCol, 3, 28); FX.ring(b.x, b.y, (b.r || 40) * 4.5, fxCol, 8); FX.spark(b.x, b.y, fxCol, 28); }
        if (typeof shake === 'function') shake(isFinal ? 0.95 : 0.65);
        if (typeof Cinema3D89 !== 'undefined') { Cinema3D89.flash(b.x, b.y, fxCol, isFinal ? 1200 : 850, 0.45); Cinema3D89.triggerRGB(isFinal ? 1.0 : 0.7); }
        if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('roar');
        StoryOverhaul95.bossBanter(b.id, isFinal ? 'p3' : 'p2');
      } catch (e) {}
    }

    rg.grp.visible = ph >= 2;
    if (ph >= 2) {
      const isP3 = ph >= 3, pulse = 0.85 + Math.sin(t * (isP3 ? 16 : 9)) * 0.25;
      rg.matRing.color.set(isP3 ? '#ff0844' : '#ff6a00'); rg.matRing.opacity = (isP3 ? 0.88 : 0.62) * pulse;
      rg.matCore.color.set(isP3 ? '#ffffff' : '#ffd700'); rg.matCore.opacity = (isP3 ? 0.95 : 0.72) * pulse;
      rg.ring1.rotation.z = t * (isP3 ? 5.5 : 3.0); rg.ring1.scale.setScalar(1 + Math.sin(t * 7) * 0.08 + (isP3 ? 0.14 : 0));
      rg.ring2.rotation.z = -t * (isP3 ? 7.2 : 3.8); rg.ring2.rotation.x = 0.55 + Math.sin(t * 4) * 0.25;
      rg.orb.rotation.z = t * (isP3 ? 6.5 : 3.2);
      rg.pillars.forEach((p, i) => { p.scale.set(1, (isP3 ? 1.35 : 0.95) + Math.sin(t * 14 + i * 1.6) * 0.32, 1); });
      if (bg.bodyMat && bg.bodyMat.emissive && !(b._fl > 0.02)) { bg.bodyMat.emissive.set(isP3 ? '#ff0844' : '#ff6a00'); bg.bodyMat.emissiveIntensity = (isP3 ? 0.85 : 0.48) * pulse; }
      if (R3.bossL) { R3.bossL.color.set(isP3 ? '#ff0844' : '#ff6a00'); R3.bossL.intensity = (isP3 ? 950 : 580) * pulse; }
    }
  }
};

/* ==========================================================================
   5. StoryOverhaul95 — PERSONAL STAKES, BOSS BANTER, SYNC TWIST & DUAL ENDING
   ========================================================================== */
const L95 = t => (typeof lt === 'function' ? lt(t) : t);
const StoryOverhaul95 = {
  el: null, whoEl: null, txtEl: null, timer: 0, syncCount: 0, twistShown: false, choiceOpen: false, modalEl: null,
  LINES: {
    warden:  { p2: ["SECURITY OVERRIDE! NO PASSENGER LEAVES ALIVE!", "עקיפת אבטחה! אף נוסע לא יוצא מכאן חי!"], p3: ["REACTOR CRITICAL — INCINERATING ROOF CAR!", "הכור בקריסה — שורף את כל גג הרכבת!"], clash: ["YOUR BLADE CANNOT DENT TITANIUM!", "הלהב שלך לא ישרוט פלדת טיטניום!"] },
    hydra:   { p2: ["ALL THREE CANNONS LOCKED ON PROTOTYPE ZERO!", "שלושת התותחים נעולים על אב־טיפוס אפס!"], p3: ["UNLEASHING FULL SKYLINE BARRAGE!", "משחרר מטח אש מלא על המסילה!"], clash: ["TRY CUTTING THROUGH SUPERSONIC THRUSTERS!", "נסה לחתוך דרך מנועי על־קול!"] },
    kage:    { p2: ["You still swing like Kurogane taught us, Ren...", "אתה עדיין מניף את החרב כמו שקורוגאנה לימד אותנו, רן..."], p3: ["Show me the blade that broke free from the Core!", "תראה לי את הלהב שהצליח להשתחרר מהליבה!"], clash: ["Our shadows were forged in the same lab!", "הצללים שלנו חושלו באותה מעבדה!"] },
    shogun:  { p2: ["EVERY OVERDRIVE YOU TRIGGER WRITES MY CODE INTO YOUR MIND!", "כל אוברדרייב שאתה מפעיל צורב את הקוד שלי בתוך המוח שלך!"], p3: ["YOU ARE NOT THE REBEL, REN — YOU ARE MY FINAL VESSEL!", "אתה לא המורד, רן — אתה הגוף הסופי שלי!"], clash: ["KNEEL TO THE ARCHITECT OF NEO EDO!", "כרע ברך מול האדריכל של ניאו־אדו!"] },
    raijin:  { p2: ["THE STORM OBEYS ONLY THE ORBITAL GRID!", "הסערה מצייתת רק לרשת המסלולית!"], p3: ["TEN MILLION VOLTS — WITNESS A DIGITAL GOD!", "עשרה מיליון וולט — חזה באל דיגיטלי!"], clash: ["CAN YOUR STEEL CATCH LIGHTNING?!", "הפלדה שלך מסוגלת לתפוס ברק?!"] },
    renull:  { p2: ["I am every slash you ever made — without the hesitation.", "אני כל חיתוך שאי פעם ביצעת — בלי ההיסוס."], p3: ["Delete me, and you erase what is left of your humanity!", "תמחק אותי, ותמחק את מה שנשאר מהאנושיות שלך!"], clash: ["A mirror cannot shatter itself!", "מראה לא יכולה לנפץ את עצמה!"] },
    genesis: { p2: ["THE MEMORY CORE BELONGS TO ETERNITY — NOT FLESH!", "ליבת הזיכרונות שייכת לנצח — לא לבשר ודם!"], p3: ["OVERDRIVE SYNC AT 99% — ASCEND WITH ME, PROTOTYPE ZERO!", "סנכרון אוברדרייב ב־99% — התעלה איתי, אב־טיפוס אפס!"], clash: ["EVEN GODS BLEED IN NEON!", "גם אלים מדממים בניאון!"] },
    default: { p2: ["LIMITERS RELEASED! FEEL TRUE OVERDRIVE!", "המגבלות הוסרו! תרגיש מה זה אוברדרייב אמיתי!"], p3: ["I WILL DRAG THIS ENTIRE TRAIN INTO THE ABYSS!", "אני אגרור את כל הרכבת הזאת אל התהום!"], clash: ["STEEL AGAINST STEEL — SHOW ME YOUR RESOLVE!", "פלדה מול פלדה — תראה לי את הנחישות שלך!"] }
  },
  isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
  ensureDOM() {
    if (!this.el) {
      const d = document.createElement('div'); d.id = 'banter95';
      d.innerHTML = '<div><div id="banter95-who"></div><div id="banter95-txt"></div></div>';
      document.body.appendChild(d); this.el = d; this.whoEl = d.querySelector('#banter95-who'); this.txtEl = d.querySelector('#banter95-txt');
    }
    if (!this.modalEl) {
      const m = document.createElement('div'); m.className = 'modal92-bg'; m.id = 'ending95-modal';
      document.body.appendChild(m); this.modalEl = m;
    }
  },
  say(who, text, col, dur) {
    if (!S95.on('story95', true) || !text) return;
    this.ensureDOM(); this.whoEl.textContent = who; this.whoEl.style.color = col || '#ff0844';
    this.el.style.borderInlineStartColor = col || '#ff0844'; this.txtEl.textContent = text;
    this.el.classList.add('on'); this.timer = dur || 3.4;
  },
  bossBanter(bossId, kind) {
    const pack = this.LINES[bossId] || this.LINES.default, pair = pack[kind] || this.LINES.default[kind];
    if (!pair) return;
    const info = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[bossId]) || { name: 'BOSS', col: '#ff0844' };
    this.say(info.name, this.isHe() ? pair[1] : pair[0], info.col, 3.6);
  },
  onStoryStart(mode) {
    this.twistShown = false;
    if (mode !== 'story' || !S95.on('story95', true)) return;
    const txt = this.isHe()
      ? 'מיקה: "הרכבת הזאת נושאת את ליבת הזיכרונות האנושיים האחרונה של ניאו־אדו — והקוד שלה תואם לשלך, אב־טיפוס אפס. אל תיתן לשוגון להשלים את ההעלאה!"'
      : 'MIKA: "This train carries Neo Edo’s last human Memory Core — and its signature matches yours, Prototype Zero. Cut through before Shogun completes the upload!"';
    setTimeout(() => { if (G.state === 'PLAY') this.say('MIKA · COMMS', txt, '#ff4fd8', 4.6); }, 900);
  },
  onOverdriveUse() {
    this.syncCount++;
    if (this.syncCount === 3 && !this.twistShown && G.state === 'PLAY' && S95.on('story95', true)) {
      this.twistShown = true;
      const txt = this.isHe()
        ? 'אזהרה: סנכרון עצבי 74%! כל הפעלת Overdrive מחברת את התודעה שלך ישירות אל ליבת קורוגאנה...'
        : 'WARNING: Neural Sync at 74%! Every Overdrive surge is linking your mind directly to the Kurogane Core...';
      this.say(this.isHe() ? 'אזהרת סנכרון עצבי' : 'NEURAL SYNC WARNING', txt, '#ffd700', 4.4);
    }
  },
  maybeTriggerEnding(b) {
    if (!b || !S95.on('story95', true) || G.mode !== 'story' || REPLAY.on || this.choiceOpen) return;
    if (b.id !== 'genesis' || (Store.data.settings && Store.data.settings.endingTitle95)) return; // (v98: the ending is DEUS EX KUROGANE's, chosen once)
    this.choiceOpen = true;
    setTimeout(() => this.openChoiceModal(b), 1650);
  },
  openChoiceModal(b) {
    this.ensureDOM(); const he = this.isHe();
    this.modalEl.innerHTML =
      '<div class="modal92-box" style="max-width:600px;border-color:#ffd700">' +
        '<div class="modal92-head"><h3>' + (he ? '⚡ הבחירה האחרונה — גורל ניאו־אדו' : '⚡ THE FINAL CHOICE — FATE OF NEO EDO') + '</h3></div>' +
        '<p style="font-size:14px;line-height:1.45;margin:0 0 8px">' + (he ? 'ליבת קורוגאנה פתוחה מולך, פועמת בזיכרונות של מיליוני תושבים ובכוח ה־Overdrive המלא. סנכרון המוח שלך ב־99%. מה תעשה?' : 'The Kurogane Core lies exposed before you, pulsing with millions of stolen memories and absolute Overdrive power. Your neural sync is at 99%. What is your final cut?') + '</p>' +
        '<div class="end95-grid">' +
          '<div class="end95-card end95-lib" id="e95-lib"><h4 style="color:#00f2fe">✦ ' + (he ? 'השמד את הליבה' : 'SHATTER THE CORE') + '</h4><p>' + (he ? 'נפץ את הרשת לנצח, שחרר את הזיכרונות של ניאו־אדו ושמור על האנושיות שלך.' : 'Destroy the grid forever, return Neo Edo’s stolen memories, and remain human.') + '</p></div>' +
          '<div class="end95-card end95-sov" id="e95-sov"><h4 style="color:#ff0844">👑 ' + (he ? 'ספוג את האוברדרייב' : 'ABSORB THE OVERDRIVE') + '</h4><p>' + (he ? 'השתלט על ליבת קורוגאנה, השלם את הסנכרון והפוך לשליט העליון של העיר.' : 'Claim the Kurogane Core, complete the 100% sync, and ascend as Cyber Sovereign.') + '</p></div>' +
        '</div></div>';
    const finish = (kind) => {
      const isLib = kind === 'liberator';
      try {
        const s = Store && Store.data && Store.data.settings;
        if (s) { s.endings95 = s.endings95 || {}; s.endings95[kind] = 1; s.endingTitle95 = isLib ? 'LIBERATOR OF NEO EDO' : 'CYBER SOVEREIGN'; }
        if (Store && Store.data) { Store.data.credits = (Store.data.credits || 0) + 2500; if (typeof Crates !== 'undefined' && Crates.give) Crates.give(1); Store.touch(); }
      } catch (e) {}
      this.modalEl.innerHTML =
        '<div class="modal92-box" style="max-width:540px;text-align:center;border-color:' + (isLib ? '#00f2fe' : '#ff0844') + '">' +
          '<h3 style="font-family:Orbitron,sans-serif;color:' + (isLib ? '#00f2fe' : '#ffd700') + ';margin:0 0 10px">' + (isLib ? (he ? '✦ סוף א׳: משחרר ניאו־אדו' : '✦ ENDING A: LIBERATOR OF NEO EDO') : (he ? '👑 סוף ב׳: שליט הרשת העליון' : '👑 ENDING B: CYBER SOVEREIGN')) + '</h3>' +
          '<p style="font-size:14px;line-height:1.5;margin:0 0 14px">' + (isLib ? (he ? 'מכת איאיידו אחת חוצה את הליבה לשניים. השמיים מעל ניאו־אדו נדלקים בזיכרונות חופשיים, והרכבת עוצרת בתחנה האחרונה. רן נעלם בגשם — חופשי לראשונה.' : 'One final Iaido cut splits the Core in two. Neo Edo’s sky ignites with freed memories as the Titan Express halts. Ren vanishes into the neon rain — free at last.') : (he ? 'רן מניח את ידו על הליבה. כל רכבת, מגדל ומערכת בניאו־אדו כורעים ברך בבת אחת. שוגון נמחק — ועידן שליט האוברדרייב מתחיל.' : 'Ren places his palm on the Core. Every rail, tower, and system in Neo Edo bows in unison. Shogun is erased — and the age of the Overdrive Sovereign begins.')) + '</p>' +
          '<div style="font-size:12px;font-weight:900;color:#ffd700;margin-bottom:14px">+2,500 CR · +1 NEON CRATE</div>' +
          '<button class="btn pri" id="e95-done" style="width:100%">' + (typeof lt === 'function' ? lt('DONE') : 'DONE') + '</button></div>';
      this.modalEl.querySelector('#e95-done').onclick = () => { this.modalEl.classList.remove('on'); this.choiceOpen = false; };
      if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('win');
    };
    this.modalEl.querySelector('#e95-lib').onclick = () => finish('liberator');
    this.modalEl.querySelector('#e95-sov').onclick = () => finish('sovereign');
    this.modalEl.classList.add('on');
  },
  tick(rd) { if (this.timer > 0) { this.timer -= Math.min(0.05, rd || 0.016); if (this.timer <= 0 && this.el) this.el.classList.remove('on'); } }
};

/* ==========================================================================
   6. StudioAudio95 — REAL STUDIO VOCAL/INSTRUMENTAL SOUNDTRACK ENGINE
   Auto-loads ./audio/boss.mp3, ./audio/overdrive.mp3, ./audio/combat1.mp3
   (plus 7 more expandable slots!) AND supports direct in-game MP3/WAV
   selection saved permanently in IndexedDB (works 100% on file:// too!).
   ========================================================================== */
const StudioAudio95 = {
  SLOTS: [
    { id: 'boss',      file: 'audio/boss.mp3',      title: 'Track #1 · Boss Battle (Vocal Anime Rock)',     he: 'טראק #1 · קרב בוסים (סייבר־רוק עם שירה)' },
    { id: 'overdrive', file: 'audio/overdrive.mp3', title: 'Track #2 · Overdrive Surge (Cyber-Metal)',      he: 'טראק #2 · אוברדרייב ושיא (סייבר־מטאל עם שירה)' },
    { id: 'combat1',   file: 'audio/combat1.mp3',   title: 'Track #3 · Neo-Edo Run (Cyber-Tech House)',     he: 'טראק #3 · ריצת ניאו־אדו (סייבר־האוס עם שירה)' },
    { id: 'menu',      file: 'audio/menu.mp3',      title: 'Track #4 · Title & Menu (Optional)',            he: 'טראק #4 · מסך פתיחה (אופציונלי)' },
    { id: 'shogun',    file: 'audio/shogun.mp3',    title: 'Track #5 · Final Boss Shogun (Optional)',       he: 'טראק #5 · בוס סופי שוגון (אופציונלי)' }
  ],
  players: {},
  loaded: {},
  curId: '',
  unlocked: false,
  btnEl: null,
  npEl: null,
  modalEl: null,
  db: null,

  initDB() {
    try {
      const req = indexedDB.open('overdrive_ost95', 1);
      req.onupgradeneeded = e => { e.target.result.createObjectStore('tracks'); };
      req.onsuccess = e => {
        this.db = e.target.result;
        this.loadFromDB();
      };
    } catch (e) {}
  },

  loadFromDB() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('tracks', 'readonly'), st = tx.objectStore('tracks');
      for (const sl of this.SLOTS) {
        const rq = st.get(sl.id);
        rq.onsuccess = () => {
          if (rq.result) {
            const url = URL.createObjectURL(rq.result);
            this.attachTrack(sl.id, url, true);
          }
        };
      }
    } catch (e) {}
  },

  saveToDB(id, blob) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('tracks', 'readwrite');
      tx.objectStore('tracks').put(blob, id);
    } catch (e) {}
  },

  attachTrack(id, src, fromUser) {
    if (this.players[id]) { try { this.players[id].pause(); } catch (e) {} }
    const a = new Audio();
    a.src = src;
    a.loop = true;
    a.preload = fromUser ? 'auto' : 'metadata'; // (v98: a track in the folder downloads when it first plays, not all ten at boot)
    a.volume = 0;
    a.addEventListener(fromUser ? 'canplaythrough' : 'loadedmetadata', () => { this.loaded[id] = fromUser ? 'saved' : 'file'; }, { once: true });
    a.addEventListener('error', () => { if (!fromUser) delete this.loaded[id]; });
    this.players[id] = a;
    if (fromUser) this.loaded[id] = 'saved';
  },

  boot() {
    this.initDB();
    // v98: the folder's tracks are the ones listed in audio/tracks.json (no blind requests for missing files);
    // without that list (a file:// copy) every slot is tried as before. Missing ones fall back to the synth music.
    const tryAll = () => { for (const sl of this.SLOTS) if (!this.players[sl.id]) this.attachTrack(sl.id, sl.file, false); };
    if (location.protocol === 'file:') tryAll();
    else fetch('audio/tracks.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(list => {
      if (!Array.isArray(list)) { tryAll(); return; }
      for (const f of list) { const sl = this.SLOTS.find(q => q.file === 'audio/' + f || q.id + '.mp3' === f); if (sl && !this.players[sl.id]) this.attachTrack(sl.id, sl.file, false); }
    }).catch(tryAll);
    const unlock = () => { this.unlocked = true; };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  },

  pickDesiredSlot() {
    if (!S95.on('ost95', true) || !this.unlocked) return '';
    if (typeof Aud !== 'undefined' && (Aud.quiet || (Store && Store.data && Store.data.settings && Store.data.settings.music === 0))) return '';
    const st = typeof G !== 'undefined' ? G.state : 'MENU';
    const has = id => !!this.loaded[id];

    if (st === 'PLAY') {
      if (typeof G !== 'undefined' && G.odT > 0 && has('overdrive')) return 'overdrive';
      if (typeof Boss !== 'undefined' && Boss.cur && !(Boss.cur.dying > 0)) {
        if (Boss.cur.id === 'shogun' && has('shogun')) return 'shogun';
        if (has('boss')) return 'boss';
        if (has('overdrive')) return 'overdrive';
      }
      if (has('combat1')) return 'combat1';
      if (has('boss')) return 'boss';
      if (has('overdrive')) return 'overdrive';
      return '';
    }
    if (st === 'MENU') {
      if (has('menu')) return 'menu';
      if (has('combat1')) return 'combat1';
      return '';
    }
    return '';
  },

  step(rd) {
    const dt = Math.min(0.05, rd || 0.016);
    const want = this.pickDesiredSlot();
    const ducked = (typeof G !== 'undefined' && (G.state === 'DIALOG' || G.state === 'PAUSE')) || !!document.getElementById('crate94-ov');
    const targetVol = ducked ? 0.16 : 0.62;

    let anyPlaying = false;
    for (const sl of this.SLOTS) {
      const a = this.players[sl.id];
      if (!a || !this.loaded[sl.id]) continue;
      if (sl.id === want) {
        anyPlaying = true;
        if (a.paused) { a.play().catch(() => {}); }
        a.volume = Math.min(targetVol, a.volume + dt * 0.9);
      } else {
        if (!a.paused) {
          a.volume = Math.max(0, a.volume - dt * 1.4);
          if (a.volume <= 0.01) a.pause();
        }
      }
    }

    // Mute built-in procedural synth music while a real Studio Track is playing (keeps all SFX 100% active!)
    try {
      if (typeof Aud !== 'undefined' && Aud.c && Aud.md) {
        const now = Aud.c.currentTime;
        if (anyPlaying && !this._mutedSynth) {
          Aud.md.gain.setTargetAtTime(0.0001, now, 0.15);
          this._mutedSynth = true;
        } else if (!anyPlaying && this._mutedSynth) {
          Aud.md.gain.setTargetAtTime(1.0, now, 0.25);
          this._mutedSynth = false;
        }
      }
    } catch (e) {}

    // Now-Playing pill
    this.ensureDOM();
    if (want !== this.curId) {
      this.curId = want;
      const sl = this.SLOTS.find(x => x.id === want);
      if (sl && this.npEl) {
        this.npEl.textContent = '🎵 ' + (StoryOverhaul95.isHe() ? sl.he : sl.title);
      }
    }
    if (this.npEl) this.npEl.style.display = (anyPlaying && G.state === 'PLAY' && !G.photo) ? 'block' : 'none';
  },

  ensureDOM() {
    if (!this.btnEl) {
      const b = document.createElement('button');
      b.id = 'ost95-btn';
      b.onclick = () => this.openModal();
      document.body.appendChild(b);
      this.btnEl = b;
    }
    if (!this.npEl) {
      const p = document.createElement('div');
      p.id = 'ost95-np';
      document.body.appendChild(p);
      this.npEl = p;
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
    const he = StoryOverhaul95.isHe();
    const rows = this.SLOTS.map(sl => {
      const ok = !!this.loaded[sl.id];
      return '<div class="ost95-row ' + (ok ? 'loaded' : '') + '">' +
        '<div><div style="font-weight:900;font-size:13px">' + (he ? sl.he : sl.title) + '</div>' +
        '<div style="font-size:11px;opacity:.75">' + (DEV_UI ? sl.file + ' · ' : '') + '<span class="ost95-tag ' + (ok ? 'ok' : 'wait') + '">' + (ok ? (he ? 'נטען ופעיל' : 'LOADED') : (he ? 'ממתין לקובץ MP3' : 'DROP / PICK MP3')) + '</span></div></div>' +
        '<label class="modal92-close" style="cursor:pointer;border-color:#ffd700;color:#ffd700;font-size:11px">' + (he ? 'בחר קובץ' : 'PICK MP3') +
        '<input type="file" accept="audio/*" data-oid="' + sl.id + '" style="display:none"></label>' +
      '</div>';
    }).join('');

    this.modalEl.innerHTML =
      '<div class="modal92-box">' +
        '<div class="modal92-head"><h3>🎵 ' + (he ? 'פסקול אולפן' : L95('STUDIO SOUNDTRACK')) + '</h3><button class="modal92-close" id="ost95-x">✕</button></div>' +
        '<p style="font-size:12px;opacity:.85;margin:0 0 12px">' + (he ? 'בחר מוזיקה משלך לכל רגע במשחק. הקבצים נשמרים רק במכשיר הזה.' : L95('Pick your own music for every moment of the game. The files stay on this device.')) + '</p>' +
        rows +
      '</div>';

    this.modalEl.querySelector('#ost95-x').onclick = () => this.modalEl.classList.remove('on');
    this.modalEl.querySelectorAll('input[data-oid]').forEach(inp => {
      inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (!f) return;
        const id = inp.getAttribute('data-oid');
        this.unlocked = true;
        this.saveToDB(id, f);
        this.attachTrack(id, URL.createObjectURL(f), true);
        this.openModal();
      };
    });
    this.modalEl.classList.add('on');
  },

  tickUI() {
    this.ensureDOM();
    const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && G.state !== 'PLAY';
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const n = Object.keys(this.loaded).length;
    this.btnEl.style.display = onTitle ? 'block' : 'none';
    this.btnEl.textContent = '🎵 ' + L('SOUNDTRACK') + (n ? ' (' + n + ')' : '');
  }
};

/* ==========================================================================
   HOOK WIRING — Clean v95 integration across Human, R3, Boss, Story & Audio
   ========================================================================== */
{
  StudioAudio95.boot();

  if (typeof Human !== 'undefined') {
    if (Human.build) {
      const hb95 = Human.build.bind(Human);
      Human.build = function (L, wid) {
        const g = hb95(L, wid);
        HeroForge95.enhance(g, L);
        WeaponForge95.decorate(g, wid || (typeof Store !== 'undefined' && Store.data && Store.data.weapon) || 'katana');
        return g;
      };
    }
    if (Human.anim) {
      const ha95 = Human.anim.bind(Human);
      Human.anim = function (g, o, rd, t) {
        ha95(g, o, rd, t);
        try { HeroForge95.tick(g, o, rd, t); WeaponForge95.tickAnim(g, o, rd, t); } catch (e) {}
      };
    }
  }

  if (typeof R3 !== 'undefined') {
    if (R3.weapon) {
      const rw95 = R3.weapon.bind(R3);
      R3.weapon = function (g, id) { const r = rw95(g, id); WeaponForge95.decorate(g, id); return r; };
    }
    if (R3.petModel) {
      const pm95 = R3.petModel.bind(R3);
      R3.petModel = function (id) { return PetForge95.enhance(pm95(id), id); };
    }
    if (R3.animPet) {
      const ap95 = R3.animPet.bind(R3);
      R3.animPet = function (pg, t, mv) { const r = ap95(pg, t, mv); try { PetForge95.tick(pg, t, mv); } catch (e) {} return r; };
    }
    if (R3.render) {
      const sy95 = R3.render.bind(R3);
      R3.render = function (rd) { const r = sy95(rd); try { BossEnrage95.tick(rd, performance.now() * 0.001); } catch (e) {} return r; };
    }
  }

  if (typeof Director !== 'undefined' && Director.begin) {
    const db95 = Director.begin.bind(Director);
    Director.begin = function (mode) {
      const r = db95.apply(this, arguments);
      try { StoryOverhaul95.onStoryStart(mode || (typeof G !== 'undefined' && G.mode)); } catch (e) {}
      return r;
    };
  }

  if (typeof BladeClash91 !== 'undefined' && BladeClash91.tryStart) {
    const bc95 = BladeClash91.tryStart.bind(BladeClash91);
    BladeClash91.tryStart = function () {
      const was = this.active;
      bc95();
      if (!was && this.active && typeof Boss !== 'undefined' && Boss.cur) {
        try { StoryOverhaul95.bossBanter(Boss.cur.id, 'clash'); } catch (e) {}
      }
    };
  }

  if (typeof Boss !== 'undefined' && Boss.kill) {
    const bk95 = Boss.kill.bind(Boss);
    Boss.kill = function (b) {
      const r = bk95(b);
      try { StoryOverhaul95.maybeTriggerEnding(b); } catch (e) {}
      return r;
    };
  }

  if (typeof overdrive === 'function') { // (v98: overdrive(); there is no useOD)
    const od95 = overdrive;
    overdrive = function () {
      const prev = typeof G !== 'undefined' ? G.odT : 0;
      const r = od95.apply(this, arguments);
      try { if (typeof G !== 'undefined' && G.odT > prev) StoryOverhaul95.onOverdriveUse(); } catch (e) {}
      return r;
    };
  }

  if (typeof HUD !== 'undefined' && HUD.draw) {
    const hd95 = HUD.draw.bind(HUD);
    HUD.draw = function (rd) {
      try { StoryOverhaul95.tick(rd); StudioAudio95.step(rd); StudioAudio95.tickUI(); } catch (e) {}
      return hd95(rd);
    };
  }

  if (typeof PC !== 'undefined' && PC.settings) {
    const ps95 = PC.settings.bind(PC);
    PC.settings = function (head, cycle, box, s) {
      ps95(head, cycle, box, s);
      try {
        head('IDENTITY & AUDIO (v95)');
        cycle('Unique 3D Hero Gear', 'gear95', [1, 0], ['ON', 'OFF']);
        cycle('Living Hero Auras', 'aura95', [1, 0], ['ON', 'OFF']);
        cycle('Bespoke 3D Weapons', 'weap95', [1, 0], ['ON', 'OFF']);
        cycle('Bespoke 3D Pets', 'pet95', [1, 0], ['ON', 'OFF']);
        cycle('Boss 3D Enrage Auras', 'boss95', [1, 0], ['ON', 'OFF']);
        cycle('Story Overhaul & Banter', 'story95', [1, 0], ['ON', 'OFF']);
        cycle('Studio Vocal Soundtrack', 'ost95', [1, 0], ['ON', 'OFF']);
      } catch (e) { errLog(e); }
    };
  }
}
Object.assign(HE, {"v113.0 — EVERY STAGE ITS OWN ROOF": "v113.0 — לכל שלב גג משלו", "In 3D every stage stood on the same steel-blue roof. The roof now takes the stage's own neon, softly, so the plates and seams still read: magenta in the Undercity, green on the Ghost Line, gold on the Spire, red in the Shogun Core, and so on; in the chase view the edge walls glow in the same color. Fixed: in the chase view some stages showed solid cyan slabs across the roof (the half-clear patches the game paints on it were drawn solid).": "בתלת־ממד כל השלבים עמדו על אותו גג כחול־פלדה. עכשיו הגג מקבל את הניאון של השלב, בעדינות, כך שהלוחות והתפרים עדיין נראים: מג׳נטה בעיר התחתית, ירוק בקו הרפאים, זהב בצריח, אדום בליבת השוגון וכן הלאה; במצלמת המרדף גם קירות הקצה זוהרים באותו צבע. תוקן: במצלמת המרדף בחלק מהשלבים הופיעו לוחות תכלת אטומים לרוחב הגג (כתמים חצי שקופים שהמשחק מצייר עליו צוירו אטומים)."});
Object.assign(HE, {"v112.0 — SMOOTH AS SILK": "v112.0 — חלק כמו משי", "Motion: the game steps 60 times a second and a screen never refreshes at exactly that rate, so on most phones the picture hitched several times a second. Every screen now draws the in-between frames (Settings > PC > Smooth motion: AUTO), facing included, and the 3D models turn through a quick ease instead of snapping. The hero's dash lean eases in and out, and the run and walk no longer flicker near a speed limit. Looks: the orc, the demons and the robots get deep colors, a low glow and an ink line around their moving bodies (they were pale mint and lilac); the four-legged pets were black silhouettes (their model had no surface normals) and now show their fur; in the chase view small enemies and pets are drawn larger, and the 2D scarf no longer lies on the roof under the 3D hero.": "תנועה: המשחק מתקדם 60 פעמים בשנייה ומסך אף פעם לא מתרענן בדיוק בקצב הזה, אז ברוב הטלפונים התמונה קפצה כמה פעמים בשנייה. עכשיו כל מסך מצייר את הפריימים שבאמצע (הגדרות > PC > תנועה חלקה: אוטומטי), כולל הכיוון שאליו פונים, ומודלי התלת־ממד מסתובבים בהאטה קצרה במקום לקפוץ. ההטיה של הגיבור בדאש נכנסת ויוצאת בהדרגה, וההליכה והריצה כבר לא מהבהבות ליד גבול מהירות. מראה: האורק, השדים והרובוטים מקבלים צבעים עמוקים, זוהר נמוך וקו דיו סביב הגוף הזז (הם היו מנטה ולילך חיוורים); חיות המחמד על ארבע היו צלליות שחורות (למודל שלהן לא היו נורמלים) ועכשיו רואים את הפרווה; במצלמת המרדף אויבים קטנים וחיות מחמד מצוירים גדולים יותר, והצעיף הדו־ממדי כבר לא מונח על הגג מתחת לגיבור התלת־ממדי."});
Object.assign(HE, {"v111.0 — THE CAMERA FEELS THE FIGHT": "v111.0 — המצלמה מרגישה את הקרב", "The chase camera answers you: the view widens in a dash and rolls with a sideways one, punches in on a kill and kicks back when you are hit, and streaks of wind rush past you while dashing and in Overdrive (Settings > SCREEN SHAKE turns it all off). A touch in the sky over the far roof now aims up the roof instead of somewhere else, and a short swipe counts anywhere on the screen. Switch the camera from the pause menu or with the T key. Fixed: picking CHASE turned on the classic 3D, where the chase camera cannot run; it now turns on the 3D models it needs, and a profile that picked it before is set right once.": "מצלמת המרדף עונה לך: התמונה נפתחת בדאש ונוטה עם דאש לצד, נדחפת פנימה בהריגה ונרתעת כשפוגעים בך, ופסי רוח חולפים לידך בדאש ובאוברדרייב (הגדרות > רעידת מסך מכבה את כל זה). נגיעה בשמיים מעל הגג הרחוק מכוונת עכשיו במעלה הגג ולא למקום אחר, והחלקה קצרה נחשבת בכל מקום על המסך. מחליפים מצלמה מתפריט ההשהיה או במקש T. תוקן: בחירה ב״מרדף״ הדליקה את התלת־ממד הקלאסי, שבו מצלמת המרדף לא יכולה לרוץ; עכשיו היא מדליקה את מודלי התלת־ממד שהיא צריכה, ופרופיל שבחר בה קודם מתוקן פעם אחת."});
Object.assign(HE, {"v110.0 — EYES IN THE BACK OF YOUR HEAD": "v110.0 — עיניים בגב", "The chase camera, made for fighting: an enemy right behind you lifts the camera until it is in frame, and an enemy out of view that is about to attack turns its edge arrow into a big beating red alarm. Warnings now stand up off the roof in 3D: a column of light rises out of an enemy winding up (taller and brighter as the attack nears), a wall of light runs along every aimed attack (the sniper's shot, a charge, a lunge, a copied dash), and a dome beats over a bomber's blast radius until it goes off.": "מצלמת המרדף, בנויה לקרב: אויב שעומד ממש מאחוריך מרים את המצלמה עד שהוא נכנס לפריים, ואויב מחוץ לתמונה שעומד לתקוף הופך את החץ שלו בקצה המסך לאזעקה אדומה גדולה ופועמת. האזהרות קמות עכשיו מהגג בתלת־ממד: עמוד אור עולה מאויב שמתכונן לתקוף (גבוה ובהיר יותר ככל שהמכה מתקרבת), קיר אור נמתח לאורך כל מתקפה מכוונת (ירייה של צלף, הסתערות, זינוק, דאש מועתק), וכיפה פועמת מעל רדיוס הפיצוץ של מפציץ עד שהוא מתפוצץ."});
Object.assign(HE, {"v109.0 — FEET ON THE ROOF": "v109.0 — רגליים על הגג", "The chase camera, grounded: the hero's model stood a little above the roof and nothing cast a shadow on it, so it seemed to hover. Now the soles touch the roof, every model casts a real shadow on it, a soft contact shadow sits under the hero and the boss (and shrinks in a jump), the far roof no longer glares white with black puddles, the camera keeps the hero off the bottom edge when you run toward it, and impact rings stay thin instead of turning into a white sheet over the hero.": "מצלמת המרדף, על הקרקע: המודל של הגיבור עמד מעט מעל הגג ושום צל לא נפל עליו, אז הוא נראה מרחף. עכשיו הסוליות נוגעות בגג, כל מודל מטיל עליו צל אמיתי, צל מגע רך יושב מתחת לגיבור ולבוס (ומתכווץ בקפיצה), הגג הרחוק כבר לא מסנוור בלבן עם שלוליות שחורות, המצלמה לא נותנת לגיבור לרדת לתחתית המסך כשרצים לעברה, וטבעות הפגיעה נשארות דקות במקום להפוך ליריעה לבנה מעל הגיבור."});
Object.assign(HE, {"v108.0 — THE CHASE CAMERA": "v108.0 — מצלמת המרדף", "A new way to see the fight: Settings > Graphics > 3D CAMERA > CHASE puts the camera low behind the hero, looking up the roof. Every ring, warning and aim line lies on the roof where it belongs, numbers float over their spot, arrows at the edges point at enemies out of view, a touch lands where it points, and the camera rises to keep a boss and the hero both in frame. The edges of the roof glow as you near them and flash when you hit them, so there are no invisible walls. Also: the tutorial's spotlight now finds its target in 3D.": "דרך חדשה לראות את הקרב: הגדרות > גרפיקה > מצלמת 3D > מרדף מציבה את המצלמה נמוך מאחורי הגיבור, מביטה קדימה לאורך הגג. כל טבעת, אזהרה וקו כיוון מונחים על הגג במקומם, המספרים מרחפים מעל המקום שלהם, חצים בשולי המסך מצביעים על אויבים מחוץ לתמונה, נגיעה נוחתת בדיוק איפה שהצבעת, והמצלמה מתרוממת כדי לשמור גם את הבוס וגם את הגיבור בתמונה. קצוות הגג זוהרים כשמתקרבים אליהם ומהבהבים כשנוגעים בהם, כך שאין יותר קירות בלתי נראים. וגם: ההדגשה של ההדרכה מוצאת עכשיו את המטרה שלה ב-3D.", "v107.0 — EVERY SCREEN, ONE STEP FURTHER": "v107.0 — כל מסך, צעד אחד קדימה", "Combo stages keep your combo alive while your cuts land, and reflect stages always have shots to send back. The results come one beat at a time, with one main button and your new achievements in the summary. Portraits react to the line: a shout shakes, a question tilts the head, a hesitation lowers it. The first time the story meets a boss it gets a real entrance. The story map is a rail line through Neo-Edo, and finishing an act opens its EX boss. Two currencies instead of five: credits and cores (your prisms and shards became cores, nothing lost). And one GAME STYLE choice: FULL, CLASSIC or CUSTOM. The home screen is tidier: the story button sits right under the logo (it was hidden under the bottom bar on phones), TODAY stays folded until you open it, and windows come one at a time.": "בשלבי הקומבו הקומבו נשאר חי כל עוד החיתוכים שלך פוגעים, ובשלבי ההחזרה תמיד יש יריות להחזיר. התוצאות מגיעות צעד אחר צעד, עם כפתור ראשי אחד וההישגים החדשים שלך בסיכום. הדיוקנאות מגיבים לשורה: צעקה מרעידה, שאלה מטה את הראש, היסוס משפיל אותו. בפעם הראשונה שהסיפור פוגש בוס, יש לו כניסה אמיתית. מפת הסיפור היא קו רכבת דרך ניאו-אדו, וסיום מערכה פותח את בוס ה-EX שלה. שני מטבעות במקום חמישה: קרדיטים וליבות (הפריזמות והרסיסים שלך הפכו לליבות, בלי הפסד). ובחירה אחת של סגנון משחק: מלא, קלאסי או מותאם אישית. מסך הבית מסודר יותר: כפתור הסיפור נמצא מיד מתחת ללוגו (בטלפון הוא הסתתר מתחת לסרגל התחתון), ״היום״ נשאר מקופל עד שפותחים אותו, והחלונות מגיעים אחד אחד.", "v106.0 — THE WHOLE STORY, START TO FINISH": "v106.0 — כל הסיפור, מההתחלה ועד הסוף", "The last stage of the story now ends the whole game: an epilogue, closing credits of everything you went through (your stages, stars, kills and best combo) and a new achievement, LEGEND OF NEO-EDO. A new player sees one button and is playing in seconds: the first STORY press goes straight into the opening and stage 1-1, the extra buttons on the home screen open as you play, the first stage has no elite surprises, and tips and radio lines wait while the game is teaching you. Settings fit your device (no keyboard options on a phone), the character voices and aim camera switches are back, one announcer switch and one FPS meter. No more developer fields or version tags in the windows, and nothing from a run stays on the results or home screen.": "השלב האחרון בסיפור מסיים עכשיו את כל המשחק: אפילוג, כתוביות סיום של כל מה שעברת (השלבים, הכוכבים, האויבים והקומבו הטוב ביותר שלך) והישג חדש, אגדת ניאו-אדו. שחקן חדש רואה כפתור אחד ומשחק תוך שניות: הלחיצה הראשונה על מצב סיפור נכנסת ישר לפתיחה ולשלב 1-1, הכפתורים הנוספים במסך הבית נפתחים תוך כדי משחק, בשלב הראשון אין הפתעות של אויבי עילית, והטיפים והרדיו מחכים כשהמשחק מלמד אותך. ההגדרות מתאימות למכשיר שלך (בלי אפשרויות מקלדת בטלפון), המתגים של קולות הדמויות ומצלמת הכיוון חזרו, מתג קריין אחד ומד FPS אחד. אין יותר שדות מפתחים או תגי גרסה בחלונות, ושום דבר מהריצה לא נשאר במסך התוצאות או בבית.", "v105.0 — EVERY VOICE IN ITS PLACE": "v105.0 — כל קול במקומו", "The characters, Mika's radio and the announcer no longer cut each other off: a story line always finishes, the radio waits for it, and the announcer waits for both. Each character gets a voice of their own gender when the device has one (Mika, Valkyrie and Izanami speak with a woman's voice), at a natural pitch. The game's own voice, for devices without one in your language, takes turns too. Fixes: opening several crates at once works and its button sits on the right crate; the crate film closes when you leave it and no longer freezes; the hero's perk tag no longer stays on the results screen; no '+0 CR' line; the launcher button shows [F] only on a computer and speaks your language; the music styles are translated.": "הדמויות, הרדיו של מיקה והקריין כבר לא קוטעים זה את זה: שורת סיפור תמיד נגמרת, הרדיו מחכה לה, והקריין מחכה לשניהם. כל דמות מקבלת קול מהמגדר שלה כשיש כזה במכשיר (מיקה, ולקיריה ואיזנאמי מדברות בקול נשי), בגובה טבעי. גם הקול של המשחק עצמו, למכשירים בלי קול בשפה שלך, מחכה לתורו. תיקונים: פתיחת כמה תיבות בבת אחת עובדת והכפתור שלה נמצא על התיבה הנכונה; סרט התיבה נסגר כשיוצאים ממנו ולא קופא יותר; תג היכולת של הגיבור לא נשאר במסך התוצאות; אין יותר שורת '+0 CR'; כפתור ההקפצה מראה [F] רק במחשב ומדבר בשפה שלך; סגנונות המוזיקה מתורגמים.", "v104.0 — ONE STEP AT A TIME": "v104.0 — צעד אחר צעד", "New players meet the newer systems one at a time as the story goes on: blade clash, boss armor, roof props, the launcher, rail events, squads, synergies, the awakened blade, the shadow rival and the heat pact, each with a short tip when it opens (players who already played keep everything). The HYPER BOSSES pact now works: bosses act 25% faster and have 25% more health. The daily and weekly runs remember your best attempt and send it beside you as a ghost, with the gap on screen, no connection needed. On a computer, the FPS meter stays off unless you turn it on. The home screen runs lighter on phones: about 45% more frames on a slow one. Under the hood: one source for the whole game and automatic tests on every change, which check that replays from versions 88, 98, 103 and 104 play back exactly.": "שחקנים חדשים מכירים את המערכות החדשות אחת אחת לאורך הסיפור: התנגשות להבים, שריון בוסים, חפצים על הגג, המקפצה, אירועי מסילה, חוליות, סינרגיות, הלהב המתעורר, יריב הצל וברית החום, כל אחת עם טיפ קצר כשהיא נפתחת (מי שכבר שיחק שומר על הכל). ברית הבוסים ההיפר עובדת עכשיו: הבוסים פועלים מהר יותר ב-25% ויש להם 25% יותר חיים. הריצה היומית והשבועית זוכרות את הניסיון הטוב ביותר שלך ומריצות אותו לידך כרוח, עם הפער על המסך, בלי צורך בחיבור. במחשב, מד ה-FPS כבוי אלא אם מדליקים אותו. מסך הבית קל יותר בטלפונים: כ-45% יותר פריימים בטלפון חלש. מאחורי הקלעים: מקור אחד לכל המשחק ובדיקות אוטומטיות בכל שינוי, שמוודאות שהקלטות מגרסאות 88, 98, 103 ו-104 מתנגנות בדיוק.", "v103.0 — ONE GAME, EVERY UPGRADE": "v103.0 — משחק אחד, כל השדרוגים", "Version 102's studio sound, living hero, action camera, lock-on, 3D body, clean home and settings are merged with version 98's fixes: replays play back exactly (the new walk and the lock-on pull included), the roof props, rail events and armor break run as fair rules, the launcher [F] costs a dash charge, and the title screen keeps all its buttons.": "הסאונד האולפני, הגיבור החי, מצלמת האקשן, הנעילה על מטרה, גוף התלת־ממד, מסך הבית וההגדרות החדשים של גרסה 102 שולבו עם התיקונים של גרסה 98: ההקלטות החוזרות מתנגנות בדיוק (כולל ההליכה החדשה ומשיכת הנעילה), האובייקטים על הגג, אירועי המסילה ושבירת השריון פועלים כחוקים הוגנים, השיגור [F] עולה מטען דאש, ומסך הבית שומר על כל הכפתורים."});
Object.assign(HE, {"v98.0 — FAIR, FIXED & REPLAYABLE": "v98.0 — הוגן, מתוקן וניתן לשחזור", "A full code review and fix pass: replays play back exactly again (the systems added in 89-97 now run in the fixed simulation step with the run's own dice, and [F], WASD and blade-clash mashing are recorded); the roof props, rail events, boss armor break and finisher camera actually run now; the launcher [F] costs a dash charge and its damage fits the game's scale (no more enemies left alive at negative health); the 1.6x damage on broken boss armor is real; the parry reward comes from a real parry; Glass and no-parry contracts hold; replays no longer pay out rewards; the final choice appears once, after DEUS EX KUROGANE; the title screen keeps its soundtrack, chips, heat pact and login buttons; the vampire synergy and the fragile pact work; no more missing-track requests.": "סבב בדיקת קוד ותיקונים מלא: ההקלטות החוזרות מתנגנות שוב בדיוק (המערכות שנוספו בגרסאות 89–97 רצות עכשיו בצעד הסימולציה הקבוע עם הקוביות של הריצה, ו־[F], WASD וההקשות ב־Blade Clash נרשמים); האובייקטים על הגג, אירועי המסילה, שבירת שריון הבוסים ומצלמת ה־Finisher באמת פועלים עכשיו; השיגור [F] עולה מטען דאש והנזק שלו מותאם לסקאלה של המשחק (אין יותר אויבים חיים עם חיים שליליים); נזק ×1.6 על שריון שבור אמיתי; תגמול הפארי מגיע מפארי אמיתי; מצב Glass וחוזה בלי פארי נשמרים; צפייה בהקלטה לא נותנת יותר פרסים; הבחירה האחרונה מופיעה פעם אחת, אחרי DEUS EX KUROGANE; במסך הבית נשארים כפתורי הפסקול, הצ'יפים, חוזי החום וההתחברות; סינרגיית הערפד וחוזה השבירות עובדים; אין יותר בקשות לשירים שלא קיימים."});
