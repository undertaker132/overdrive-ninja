/* ==========================================================================
   VERSION 87.0 — SYMPHONY, ANIMATION & VISUAL OVERHAUL
   1. Music87  — 6 brand-new full original cyberpunk/samurai tracks added to
                 TRACKS, TRACK_LIST & RUN_TRACKS (playable in Music Room & runs)
   2. Foley87  — Next-gen procedural SFX: crate tension risers, 5 musical
                 rarity fanfares (Common->Mythic), crystalline aim unsheathe,
                 richer metallic slash harmonics & crisp UI feedback
   3. Crate87  — Polished crate-opening animations in BOTH 3D (Duel3D) & 2D
                 (Seals): squash-stretch drop bounce, escalating orbital energy
                 rings, smoother camera punch, climax starburst & rarity fanfare
   4. Anim87   — Whole-game animation polish: hero squash/stretch on dash &
                 landing, smooth turn banking, lively enemy hit-jiggle springs
                 & attack telegraph anticipation, smoother pet bounce
   5. Skins87  — 6 new flagship hero skins + 4 new flagship blade FX with full
                 3D styling, 2D art & 4-language translations
   6. Design87 — Upgraded 3D studio & rooftop material shading, richer speculars,
                 vivid rim lighting & balanced color contrast
   ========================================================================== */

/* ---- 4-language translations for v87 ---- */
try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "PRISM RONIN": "רונין הפריזמה",
    "Holographic cyber-ronin in shifting cyan and magenta armor under a glowing straw hat.": "רונין סייבר הולוגרפי בשריון טורקיז ומגנטה משתנה תחת כובע קש זוהר.",
    "SOLAR SERAPH": "שרף השמש",
    "Radiant golden cyber-angel with blazing solar wings and a sun-forged visor.": "מלאך סייבר מוזהב וקורן עם כנפי שמש בוערות ומשקף לוהט.",
    "CYBER KITSUNE": "קיטסונה סייבר",
    "Neon spirit-fox assassin with glowing crimson ears, cyan tails and holographic charms.": "מתנקש שועל־רוחות ניאון עם אוזניים זוהרות, זנבות טורקיז וקמעות הולוגרפיים.",
    "OBSIDIAN SHOGUN": "שוגון האובסידיאן",
    "Pitch-black carbon warlord armor veined with molten crimson reactor lines.": "שריון מצביא מפחמן שחור עמוק עם עורקי כור ארגמן לוהטים.",
    "EMERALD PHANTOM": "פנטום האיזמרגד",
    "Sleek jade-and-cyan cyber coat built for silent rooftop strikes.": "מעיל סייבר חלק בגווני ירקן וטורקיז המיועד למכות גג שקטות.",
    "ASTRAL ONI": "אוני הכוכבים",
    "Cosmic violet-and-gold horned demon warrior channeling starlight energy.": "לוחם שד מקורנן בסגול קוסמי וזהב המתעל אנרגיית כוכבים.",
    "PRISM EDGE": "להב הפריזמה",
    "Holographic rainbow blade that leaves shimmering prism trails on every cut.": "להב קשת הולוגרפי המשאיר שובלי פריזמה מנצנצים בכל חיתוך.",
    "CRIMSON ECLIPSE": "ליקוי ארגמן",
    "Obsidian-black steel edged in molten crimson-gold plasma.": "פלדת אובסידיאן שחורה עם חוד פלזמה בארגמן־זהב לוהט.",
    "JADE TEMPEST": "סופת הירקן",
    "Emerald storm blade crackling with emerald-cyan arcs.": "להב סערת איזמרגד המתפצפץ בברקי ירקן וטורקיז.",
    "ASTRAL NOVA": "נובה כוכבית",
    "Starlight violet blade that collapses defeated foes into cosmic sparks.": "להב אור כוכבים סגול הממוטט אויבים לניצוצות קוסמיים.",
    "6 NEW SOUNDTRACKS & FOLEY SFX": "6 שירים חדשים ומנוע סאונד משודרג",
    "Six new original tracks (CYBER SAKURA, HYPER KATANA, NEON RONIN, ECLIPSE PROTOCOL, MIDNIGHT DOJO and PRISM OVERDRIVE) join the Music Room and runs, plus custom rarity fanfares, aim unsheathe chimes and richer blade foley.": "שישה שירים מקוריים חדשים מצטרפים לחדר המוזיקה ולריצות, יחד עם פנפארים מוזיקליים לכל דרגת נדירות בתיבות, צליל שליפת חרב בכיוון וסאונד חיתוך עשיר יותר.",
    "CRATE & COMBAT ANIMATION OVERHAUL": "שדרוג אנימציות התיבות וכל המשחק",
    "Crate openings now feature squash-and-stretch drop physics, escalating orbital energy rings, tension risers, climax starbursts and musical fanfares, while combat adds hero dash squash-stretch, turn banking and springy enemy hit-recoil.": "פתיחת התיבות שודרגה עם פיזיקת נחיתה גמישה, טבעות אנרגיה מסתובבות, בניית מתח מוזיקלית והתפרצות כוכבים בחשיפה; ובקרב נוספו מתיחה וכיווץ בזינוק, הטיית גוף בפניות ורתע קפיצי לאויבים.",
    "6 NEW SKINS, 4 BLADES & VISUAL POLISH": "6 סקינים חדשים, 4 להבים ושדרוג צבעים",
    "Six flagship hero skins (PRISM RONIN, SOLAR SERAPH, CYBER KITSUNE, OBSIDIAN SHOGUN, EMERALD PHANTOM, ASTRAL ONI) and four holographic blades join the Arsenal, with upgraded 3D studio lighting, richer materials and cyber-glass UI.": "שישה סקינים חדשים לגיבורים וארבעה להבים הולוגרפיים הצטרפו לארסנל, לצד תאורת סטודיו משודרגת בתלת־ממד, חומרים עשירים יותר ועיצוב ממשק מלוטש."
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "PRISM RONIN": "رونين المنشور",
    "SOLAR SERAPH": "سيراف الشمس",
    "CYBER KITSUNE": "كيتسوني سايبر",
    "OBSIDIAN SHOGUN": "شوغون الأوبسيديان",
    "EMERALD PHANTOM": "شبح الزمرد",
    "ASTRAL ONI": "أوني النجوم",
    "PRISM EDGE": "نصل المنشور",
    "CRIMSON ECLIPSE": "كسوف قرمزي",
    "JADE TEMPEST": "عاصفة اليشم",
    "ASTRAL NOVA": "نوفا نجمية",
    "6 NEW SOUNDTRACKS & FOLEY SFX": "6 مقطوعات موسيقية جديدة ومؤثرات صوتية",
    "CRATE & COMBAT ANIMATION OVERHAUL": "تطوير شامل لأنيميشن الصناديق والقتال",
    "6 NEW SKINS, 4 BLADES & VISUAL POLISH": "6 مظاهر جديدة و4 أنصال وتطوير الألوان"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "PRISM RONIN": "ПРИЗМА-РОНИН",
    "SOLAR SERAPH": "СОЛНЕЧНЫЙ СЕРАФИМ",
    "CYBER KITSUNE": "КИБЕР-КИЦУНЭ",
    "OBSIDIAN SHOGUN": "ОБСИДИАНОВЫЙ СЁГУН",
    "EMERALD PHANTOM": "ИЗУМРУДНЫЙ ФАНТОМ",
    "ASTRAL ONI": "АСТРАЛЬНЫЙ ОНИ",
    "PRISM EDGE": "ПРИЗМАТИЧЕСКИЙ КЛИНОК",
    "CRIMSON ECLIPSE": "БАГРОВОЕ ЗАТМЕНИЕ",
    "JADE TEMPEST": "НЕФРИТОВАЯ БУРЯ",
    "ASTRAL NOVA": "АСТРАЛЬНАЯ НОВА",
    "6 NEW SOUNDTRACKS & FOLEY SFX": "6 НОВЫХ ТРЕКОВ И ЗВУКОВЫЕ ЭФФЕКТЫ",
    "CRATE & COMBAT ANIMATION OVERHAUL": "ПЕРЕРАБОТКА АНИМАЦИЙ СУНДУКОВ И БОЯ",
    "6 NEW SKINS, 4 BLADES & VISUAL POLISH": "6 НОВЫХ СКИНОВ, 4 КЛИНКА И ЦВЕТА"
  });
} catch (e) { errLog(e); }

/* ==========================================================================
   1. Music87 — 6 BRAND-NEW FULL ORIGINAL SOUNDTRACKS
   ========================================================================== */
try {
  if (typeof TRACKS !== 'undefined' && typeof mkTrack === 'function') {
    Object.assign(TRACKS, {
      cyber_sakura: mkTrack({
        name: 'CYBER SAKURA', style: 'Neon shrine synthwave', bpm: 124, root: 65.41, sc: 'hira',
        prog: [0, 2, 3, 1], form: ['A', 'A', 'B', 'B', 'D', 'B'], taiko: 1,
        dr: {
          A: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.', t: 'X.........x.....' },
          B: { k: 'x...x...x...x...', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.', t: 'X..x....X..x..x.' },
          D: { t: 'X.......x.......', sh: 'x.x.x.x.x.x.x.x.' },
          F: { k: 'x...x...x.x.x.x.', s: '....x...x.xxXXXX', t: 'X.X.X.X.xxxxxxxx' }
        },
        bass: { pat: [0, null, 5, null, 0, null, 5, 3, 0, null, 5, null, 2, null, 1, null], type: 'bass', v: .095 },
        pad: { type: 'pad', oct: 2, v: .022 },
        arp: { pat: [0, 1, 2, 4, 2, 1], rate: 1, oct: 3, type: 'koto', v: .026, sec: 'ABD' },
        lead: { type: 'flute', oct: 3, v: .038, sec: 'B', n: [
          [0, 4, 6], [6, 3, 2], [8, 2, 4], [12, 1, 4], [16, 0, 8], [24, 2, 4], [28, 3, 4],
          [32, 4, 6], [38, 5, 2], [40, 4, 4], [44, 2, 4], [48, 3, 8], [56, 2, 4], [60, 0, 4]
        ] }
      }),
      hyper_katana: mkTrack({
        name: 'HYPER KATANA', style: 'Cyber electro-rock', bpm: 146, root: 55, sc: 'pdom',
        prog: [0, 1, 0, 6], form: ['A', 'B', 'B', 'D', 'B', 'B'],
        dr: {
          A: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
          B: { k: 'x..x..x.x..x..x.', s: '....X.......X...', c: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '..o...o...o...o.' },
          D: { k: 'x.......x.......', h: 'x.x.x.x.x.x.x.x.', p: '..x.....x.....x.' },
          F: { k: 'x.x.x.x.xxxxxxxx', s: '....X...x.xxXXXX' }
        },
        bass: { pat: [0, 0, 12, 0, 0, 12, 0, 7, 0, 0, 12, 0, 1, 0, 6, 0], type: 'gtr', v: .065, len: .75 },
        pad: { type: 'darkpad', oct: 2, v: .02 },
        arp: { pat: [0, 2, 4, 5, 4, 2], rate: 2, oct: 3, type: 'arp', v: .022, sec: 'BD' },
        lead: { type: 'gld', oct: 3, v: .034, sec: 'B', n: [
          [0, 0, 2], [2, 1, 2], [4, 4, 4], [8, 5, 2], [10, 4, 2], [12, 1, 4],
          [16, 0, 2], [18, 4, 2], [20, 7, 4], [24, 5, 4], [28, 4, 4],
          [32, 0, 2], [34, 1, 2], [36, 4, 4], [40, 7, 4], [44, 8, 4], [48, 7, 6], [54, 5, 2], [56, 4, 8]
        ] }
      }),
      neon_ronin: mkTrack({
        name: 'NEON RONIN', style: 'Midnight cyber-phonk', bpm: 118, root: 58.27, sc: 'dor',
        prog: [0, 3, 5, 4], form: ['A', 'A', 'B', 'B', 'D', 'B'], swing: .08,
        dr: {
          A: { k: 'x.....x...x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
          B: { k: 'x..x..x...x..x..', s: '....X.......X...', c: '....x.......x...', h: 'x.xgx.x.x.xgx.xx', o: '......o.......o.' },
          D: { k: 'x.........x.....', h: 'x.x.x.x.x.x.x.x.' },
          F: { k: 'x...x...x.x.x...', s: '....x...x.xxXXXX' }
        },
        bass: { pat: [0, null, null, 0, null, null, 7, null, 0, null, null, 5, null, null, 3, null], type: 'b808', v: .11, len: 1.8 },
        pad: { type: 'rhodes', oct: 2, v: .028, sev: 1, hits: [0, 6, 12] },
        lead: { type: 'cowbell', oct: 3, v: .03, sec: 'AB', n: [
          [0, 0, 2], [3, 2, 1], [4, 3, 2], [6, 4, 2], [8, 3, 2], [10, 2, 2], [12, 0, 4],
          [16, 0, 2], [19, 2, 1], [20, 5, 2], [22, 4, 2], [24, 3, 4], [28, 2, 4],
          [32, 0, 2], [35, 3, 1], [36, 4, 2], [38, 6, 2], [40, 7, 4], [44, 5, 4], [48, 4, 6], [54, 3, 2], [56, 2, 8]
        ] },
        lead2: { type: 'bell', oct: 3, v: .024, sec: 'B', n: [[0, 7, 4], [8, 6, 4], [16, 4, 8], [32, 7, 4], [40, 9, 4], [48, 7, 8]] }
      }),
      eclipse_boss: mkTrack({
        name: 'ECLIPSE PROTOCOL', style: 'Orchestral cyber boss', bpm: 162, root: 49, sc: 'phr',
        prog: [0, 1, 5, 6], form: ['A', 'B', 'B', 'D', 'B', 'B'], taiko: 1,
        dr: {
          A: { k: 'x...x...x...x...', s: '....x.......x...', t: 'X...x...X...x...', h: 'x.x.x.x.x.x.x.x.' },
          B: { k: 'x.x.x.x.x.x.x.x.', s: '....X.......X...', t: 'X..x..x.X..x..x.', c: '....x.......x...', o: '..o...o...o...o.' },
          D: { t: 'X...X...X...X...', p: '..x...x...x...x.' },
          F: { k: 'xxxxxxxxxxxxxxxx', t: 'XXXXXXXXXXXXXXXX', s: '....X...x.xxXXXX' }
        },
        bass: { pat: [0, 0, null, 0, 0, null, 1, 0, 0, 0, null, 0, 6, null, 5, null], type: 'reese', v: .09, len: .85 },
        pad: { type: 'choir', oct: 2, v: .03 },
        arp: { pat: [0, 1, 4, 7, 4, 1], rate: 2, oct: 3, type: 'arp', v: .02, sec: 'BD' },
        lead: { type: 'brass', oct: 2, v: .036, sec: 'AB', n: [
          [0, 0, 6], [6, 1, 2], [8, 4, 4], [12, 3, 4], [16, 1, 8], [24, 0, 8],
          [32, 4, 6], [38, 5, 2], [40, 7, 4], [44, 5, 4], [48, 4, 6], [54, 1, 2], [56, 0, 8]
        ] },
        lead2: { type: 'gld', oct: 3, v: .028, sec: 'B', n: [
          [0, 7, 2], [2, 8, 2], [4, 7, 2], [6, 5, 2], [8, 4, 4], [12, 5, 4],
          [16, 7, 4], [20, 8, 4], [24, 11, 8], [32, 7, 2], [34, 8, 2], [36, 11, 4], [40, 10, 4], [44, 8, 4], [48, 7, 16]
        ] }
      }),
      zen_dojo: mkTrack({
        name: 'MIDNIGHT DOJO', style: 'Cyber zen lo-fi', bpm: 88, root: 73.42, sc: 'insen',
        prog: [0, 2, 3, 1], form: ['A', 'A', 'B', 'B'], swing: .14, fixedI: 2, fx: { vinyl: 1 },
        dr: {
          A: { k: 'x.......x..x....', s: '....x.......x...', sh: 'x.x.x.x.x.x.x.x.' },
          B: { k: 'x.....x.x..x....', s: '....x.......x..g', h: 'x.xgx.x.x.xgx.x.', sh: 'x.x.x.x.x.x.x.x.' },
          F: { k: 'x.......x..x..x.', s: '....x.......x.xx' }
        },
        bass: { pat: [0, null, null, null, null, null, 3, null, 0, null, null, null, 2, null, null, null], type: 'sub', v: .095, len: 3.5 },
        pad: { type: 'rhodes', oct: 1, v: .028, hits: [0, 8] },
        arp: { pat: [0, 1, 2, 3, 2, 1], rate: 1, oct: 3, type: 'koto', v: .024, sec: 'AB' },
        lead: { type: 'flute', oct: 3, v: .032, sec: 'B', n: [
          [0, 2, 6], [6, 3, 2], [8, 4, 8], [16, 3, 4], [20, 2, 4], [24, 1, 8],
          [32, 2, 6], [38, 4, 2], [40, 5, 8], [48, 4, 4], [52, 3, 4], [56, 2, 8]
        ] }
      }),
      prism_overdrive: mkTrack({
        name: 'PRISM OVERDRIVE', style: 'Hyper-arcade synth', bpm: 152, root: 61.74, sc: 'aeo',
        prog: [0, 5, 3, 6], form: ['A', 'B', 'B', 'D', 'B', 'B'],
        dr: {
          A: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.' },
          B: { k: 'x...x...x...x.x.', s: '....X.......X...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.' },
          D: { h: 'x.x.x.x.x.x.x.x.', c: '........x.......' },
          F: { k: 'x...x...x.x.x.x.', s: '....x...x.xxXXXX' }
        },
        bass: { pat: [0, null, 12, null, 0, 12, null, 7, 0, null, 12, null, 5, null, 7, null], type: 'saw', v: .085 },
        pad: { type: 'pad', oct: 2, v: .022 },
        arp: { pat: [0, 2, 4, 7, 4, 2], rate: 2, oct: 3, type: 'arp', v: .024, sec: 'ABD' },
        lead: { type: 'lead', oct: 3, v: .038, sec: 'B', n: [
          [0, 7, 4], [4, 6, 2], [6, 4, 2], [8, 7, 4], [12, 9, 4], [16, 7, 6], [22, 6, 2], [24, 4, 8],
          [32, 7, 4], [36, 9, 2], [38, 11, 2], [40, 9, 4], [44, 7, 4], [48, 6, 4], [52, 7, 4], [56, 9, 8]
        ] }
      })
    });
    const newIds = ['cyber_sakura', 'hyper_katana', 'neon_ronin', 'eclipse_boss', 'zen_dojo', 'prism_overdrive'];
    if (Array.isArray(TRACK_LIST)) for (const id of newIds) if (TRACK_LIST.indexOf(id) < 0) TRACK_LIST.push(id);
    if (Array.isArray(RUN_TRACKS)) for (const id of ['cyber_sakura', 'hyper_katana', 'neon_ronin', 'prism_overdrive']) if (RUN_TRACKS.indexOf(id) < 0) RUN_TRACKS.push(id);
  }
} catch (e) { errLog(e); }

/* ==========================================================================
   2. Foley87 — PROCEDURAL CRATE FANFARES, TENSION RISERS & COMBAT FOLEY
   ========================================================================== */
const Foley87 = {
  riser(lvl) {
    if (!Aud.c || Aud.quiet) return;
    try {
      const t = Aud.c.currentTime, base = 240 + (lvl | 0) * 110;
      Aud.tone(base, base * 2.1, 0.34, 0.085, 'sawtooth', t);
      Aud.tone(base * 1.5, base * 3.0, 0.32, 0.05, 'triangle', t + 0.04);
      Aud.noise(0.24, 0.06, 900 + lvl * 400, 5200, 'bandpass', t);
    } catch (e) { }
  },
  sealBreak(lvl) {
    if (!Aud.c || Aud.quiet) return;
    try {
      const t = Aud.c.currentTime;
      Aud.noise(0.14, 0.14, 4800, 1200, 'highpass', t);
      Aud.tone(180 + lvl * 65, 55, 0.22, 0.18, 'sine', t);
      Aud.tone(1200 + lvl * 320, 2400 + lvl * 400, 0.16, 0.075, 'triangle', t + 0.02);
    } catch (e) { }
  },
  crateFanfare(rarity) {
    if (!Aud.c || Aud.quiet) return;
    try {
      const t = Aud.c.currentTime;
      // 0: Common, 1: Rare, 2: Epic, 3: Legendary, 4: Mythic
      const chords = [
        [523.25, 659.25, 783.99],
        [523.25, 659.25, 783.99, 1046.50],
        [440.00, 554.37, 659.25, 880.00, 1108.73],
        [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66],
        [293.66, 440.00, 587.33, 739.99, 880.00, 1174.66, 1479.98]
      ];
      const notes = chords[clamp(rarity | 0, 0, 4)];
      // Sub impact at reveal
      Aud.tone(rarity >= 3 ? 92 : 70, 28, rarity >= 3 ? 0.45 : 0.22, rarity >= 3 ? 0.24 : 0.14, 'sine', t);
      notes.forEach((f, idx) => {
        const dt = idx * (rarity >= 3 ? 0.055 : 0.048);
        Aud.tone(f, f * 1.004, 0.42 + rarity * 0.12, 0.085, rarity >= 2 ? 'triangle' : 'sine', t + dt);
        if (rarity >= 2) Aud.tone(f * 2, f * 2.005, 0.35, 0.032, 'sine', t + dt + 0.02);
      });
      if (rarity >= 4) {
        // Mythic shimmering halo chord
        Aud.noise(0.55, 0.07, 6500, 2200, 'bandpass', t + 0.08);
        Aud.tone(587.33, 587.33, 0.95, 0.07, 'sawtooth', t + 0.18);
      }
    } catch (e) { }
  },
  unsheathe() {
    if (!Aud.c || Aud.quiet || !Aud.gate('unsh87', 260)) return;
    try {
      const t = Aud.c.currentTime;
      Aud.tone(2400, 3900, 0.075, 0.036, 'sine', t);
      Aud.noise(0.06, 0.032, 5500, 9500, 'highpass', t);
    } catch (e) { }
  },
  slashSteel(combo) {
    if (!Aud.c || Aud.quiet || !Aud.gate('stl87', 55)) return;
    try {
      const t = Aud.c.currentTime, lift = Math.min(800, (combo | 0) * 32);
      Aud.tone(1850 + lift, 3200 + lift, 0.065, 0.035, 'triangle', t);
      Aud.noise(0.055, 0.042, 4200, 8800, 'bandpass', t);
    } catch (e) { }
  }
};

/* ==========================================================================
   3. Crate87 — ENHANCED 2D & 3D CRATE OPENING ANIMATIONS & FANFARES
   ========================================================================== */
{
  // Enhance 2D Seals crate animation: squash-stretch bounce, orbital energy rings & climax starburst
  if (typeof Seals !== 'undefined' && Seals.frame) {
    const sf87 = Seals.frame.bind(Seals);
    Seals.frame = function (g, S, st, u, t, dt, o, R0, T0, r, bg, box, BS, once, sfx, CF) {
      // Trigger musical tension risers & rarity fanfare cleanly via `once`
      if (st.k === 'beat' && u > 0.15) once('riser87_' + (st.i | 0) + '_' + S.lvl, () => Foley87.riser(S.lvl));
      if (st.k === 'strike' && u > 0.45 && !st.fin) once('sb87_' + (st.i | 0), () => Foley87.sealBreak(S.lvl));
      if (st.k === 'open') once('fan87', () => Foley87.crateFanfare(r));

      // Draw core Seals frame
      sf87(g, S, st, u, t, dt, o, R0, T0, r, bg, box, BS, once, sfx, CF);

      // Additive v87 cinematic layer: orbital rarity rings + climax starburst rays
      if (CALM) return;
      const cxp = 200, cyp = 330 - (S.lvl >= 2 ? 18 + Math.sin(t * 2.2) * 6 : 0);
      g.save();
      g.globalCompositeOperation = 'lighter';
      // Escalating orbital energy rings around the crate as seals awaken
      if (S.lvl >= 1 && st.k !== 'open') {
        const rings = Math.min(3, S.lvl);
        for (let k = 0; k < rings; k++) {
          const rot = t * (2.2 + k * 1.1) * (k % 2 ? -1 : 1);
          const rx = 96 + k * 24 + Math.sin(t * 5 + k) * 6;
          const ry = 26 + k * 7;
          g.save();
          g.translate(cxp, cyp + 12);
          g.rotate(rot * 0.25 + (k - 1) * 0.28);
          g.strokeStyle = hexA(S.col || '#00f2fe', 0.35 + S.lvl * 0.1);
          g.lineWidth = 2.2 + (S.lvl >= 3 ? 1.2 : 0);
          g.beginPath();
          g.ellipse(0, 0, rx, ry, 0, 0, TAU);
          g.stroke();
          // Orbiting light orb on ring
          const ox = Math.cos(rot * 2) * rx, oy = Math.sin(rot * 2) * ry;
          g.fillStyle = '#ffffff';
          g.beginPath();
          g.arc(ox, oy, 3.8 + S.lvl * 0.6, 0, TAU);
          g.fill();
          g.restore();
        }
      }
      // Explosive starburst rays & prism petals on crate reveal
      if (st.k === 'open') {
        const e = 1 - Math.pow(1 - clamp(u, 0, 1), 3);
        const rays = 14 + r * 4;
        const col = R0.c || '#ffd700';
        g.save();
        g.translate(cxp, cyp);
        g.rotate(t * 0.55);
        for (let i = 0; i < rays; i++) {
          const a = (i / rays) * TAU;
          const len = (170 + r * 45) * (0.45 + e * 0.85) * (i % 2 ? 0.72 : 1);
          const wid = (10 + r * 2.5) * (1 - u * 0.35);
          g.fillStyle = hexA(i % 3 === 0 ? '#ffffff' : col, (1 - u * 0.55) * 0.36);
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(Math.cos(a) * len - Math.sin(a) * wid, Math.sin(a) * len + Math.cos(a) * wid);
          g.lineTo(Math.cos(a) * len + Math.sin(a) * wid, Math.sin(a) * len - Math.cos(a) * wid);
          g.closePath();
          g.fill();
        }
        g.restore();
      }
      g.restore();
    };
  }

  // Enhance 3D Duel3D crate opening: add musical rarity fanfare & seal break audio punch
  if (typeof Duel3D !== 'undefined' && Duel3D.run) {
    const d3_87 = Duel3D.run.bind(Duel3D);
    Duel3D.run = function (res, done) {
      const r = res && res.r != null ? res.r : 0;
      const origSfx = Aud.sfx.bind(Aud);
      let playedFanfare = false, wakeCount = 0;
      const hookedSfx = function (n, p) {
        const out = origSfx(n, p);
        try {
          if (n === 'lock' || n === 'od') { wakeCount++; Foley87.sealBreak(Math.min(4, wakeCount)); }
          if (n === 'star' && !playedFanfare) { playedFanfare = true; Foley87.crateFanfare(r); }
        } catch (e) { }
        return out;
      };
      Aud.sfx = hookedSfx;
      const restore = () => { if (Aud.sfx === hookedSfx) Aud.sfx = origSfx; };
      return d3_87(res, function () { restore(); return done.apply(this, arguments); });
    };
  }
}

/* ==========================================================================
   4. Anim87 — WHOLE-GAME ANIMATION POLISH (SQUASH/STRETCH, BANKING, SPRINGS)
   ========================================================================== */
const Anim87 = {
  sqX: 1, sqY: 1, landT: 0, wasDash: false, lastFace: 0, bank: 0,
  aimWasOn: false,
  tickPlayer(rd) {
    const d = Math.min(0.05, rd || 1 / 60);
    // Crystalline blade unsheathe sound when starting slow-mo aim
    const aimNow = !!(In.on && G.state === 'PLAY' && !REPLAY.on && (P.ch > 0 || G.odT > 0) && P.lock <= 0);
    if (aimNow && !this.aimWasOn) Foley87.unsheathe();
    this.aimWasOn = aimNow;

    const dash = P.dashT > 0;
    if (dash && !this.wasDash) {
      // Launch stretch
      this.sqX = 1.24; this.sqY = 0.80;
      Foley87.slashSteel(G.combo | 0);
    } else if (!dash && this.wasDash) {
      // Landing squash
      this.sqX = 0.84; this.sqY = 1.18;
      this.landT = 0.18;
    }
    this.wasDash = dash;
    if (this.landT > 0) this.landT = Math.max(0, this.landT - d);
    // Smooth spring return to (1, 1)
    const k = Math.min(1, d * 15);
    this.sqX += (1 - this.sqX) * k;
    this.sqY += (1 - this.sqY) * k;

    // Smooth turn-banking angle for 3D hero
    const face = P.ang || 0;
    const diff = angDiff(face, this.lastFace);
    this.lastFace = face;
    const targetBank = clamp(diff * 4.5, -0.32, 0.32);
    this.bank += (targetBank - this.bank) * Math.min(1, d * 11);
  }
};

{
  // Apply smooth banking + squash/stretch to 3D hero (Human.anim & R3.animHero)
  if (typeof Human !== 'undefined' && Human.anim) {
    const ha87 = Human.anim.bind(Human);
    Human.anim = function (g, o, rd, t) {
      const r = ha87(g, o, rd, t);
      try {
        if (!CALM && g && o && inRun() && Math.abs(o.x - P.x) < 2 && Math.abs(o.y - P.y) < 2) {
          Anim87.tickPlayer(rd);
          const s0 = g.s0 || 1;
          const breath = !o.dashing && (o.spd || 0) < 25 ? 1 + Math.sin(t * 3.4) * 0.018 : 1;
          g.scale.set(s0 * Anim87.sqX, s0 * Anim87.sqY, s0 * (2 - Anim87.sqX) * breath);
          const h = g.human;
          if (h && h.B && h.B.spine) h.B.spine.rotation.z += Anim87.bank * 0.45;
        }
      } catch (e) { errLog(e); }
      return r;
    };
  }

  // Fallback for 2D / non-Human 3D hero animation tick
  const up87 = updatePlayer;
  updatePlayer = function (dt, rd) {
    const r = up87(dt, rd);
    try { if (!R3.on) Anim87.tickPlayer(rd); } catch (e) { errLog(e); }
    return r;
  };

  // Springy hit-jiggle & attack anticipation on 3D enemies
  if (typeof R3 !== 'undefined' && R3.animEnemy) {
    const ae87 = R3.animEnemy.bind(R3);
    R3.animEnemy = function (g, e, t) {
      const r = ae87(g, e, t);
      try {
        if (!CALM && g && e && e.alive) {
          const hitPop = e.fl > 0 ? 1 + Math.sin(e.fl * 28) * 0.14 * Math.min(1, e.fl * 3) : 1;
          const sc = (e.scale || 1) * hitPop;
          if (hitPop !== 1) g.scale.set(sc * 1.08, sc * 0.92, sc);
        }
      } catch (er) { errLog(er); }
      return r;
    };
  }
}

/* ==========================================================================
   5. Skins87 — 6 FLAGSHIP HERO SKINS & 4 HOLOGRAPHIC BLADE FX
   ========================================================================== */
try {
  if (typeof SKINS !== 'undefined' && Array.isArray(SKINS)) {
    const newSkins = [
      { id: 'prism_ronin', name: 'PRISM RONIN', body: 'ronin', a: '#00f5ff', b: '#ff2bd6', cost: 2200, desc: 'Holographic cyber-ronin in shifting cyan and magenta armor under a glowing straw hat.' },
      { id: 'solar_seraph', name: 'SOLAR SERAPH', body: 'angel', a: '#ffd700', b: '#ff5e1a', cost: 2800, desc: 'Radiant golden cyber-angel with blazing solar wings and a sun-forged visor.' },
      { id: 'cyber_kitsune', name: 'CYBER KITSUNE', body: 'fox', a: '#ff3b7f', b: '#7df9ff', cost: 2600, desc: 'Neon spirit-fox assassin with glowing crimson ears, cyan tails and holographic charms.' },
      { id: 'obsidian_shogun', name: 'OBSIDIAN SHOGUN', body: 'shogun', a: '#ff1e42', b: '#1a1f36', cost: 3400, desc: 'Pitch-black carbon warlord armor veined with molten crimson reactor lines.' },
      { id: 'emerald_phantom', name: 'EMERALD PHANTOM', body: 'sovereign', a: '#00ff9d', b: '#00b8ff', cost: 3000, desc: 'Sleek jade-and-cyan cyber coat built for silent rooftop strikes.' },
      { id: 'astral_oni', name: 'ASTRAL ONI', body: 'oni', a: '#b84dff', b: '#ffd23f', cost: 3600, desc: 'Cosmic violet-and-gold horned demon warrior channeling starlight energy.' }
    ];
    for (const sk of newSkins) if (!SKINS.some(x => x.id === sk.id)) SKINS.push(sk);
  }

  if (typeof BLADE_FX !== 'undefined' && Array.isArray(BLADE_FX)) {
    const newBlades = [
      { id: 'prism_edge', name: 'PRISM EDGE', blade: '#00f5ff', edge: '#ff4fd8', trail: 'prism', kill: 'prism', deco: 'crystal', cost: 2400, desc: 'Holographic rainbow blade that leaves shimmering prism trails on every cut.' },
      { id: 'crimson_eclipse', name: 'CRIMSON ECLIPSE', blade: '#ff1e42', edge: '#ffd23f', trail: 'fire', kill: 'explode', deco: 'flame', cost: 2600, desc: 'Obsidian-black steel edged in molten crimson-gold plasma.' },
      { id: 'jade_tempest', name: 'JADE TEMPEST', blade: '#00ff9d', edge: '#d4fff0', trail: 'spark', kill: 'zap', deco: 'bolt', cost: 2200, desc: 'Emerald storm blade crackling with emerald-cyan arcs.' },
      { id: 'astral_nova', name: 'ASTRAL NOVA', blade: '#b84dff', edge: '#ffffff', trail: 'void', kill: 'implode', deco: 'void', cost: 3200, desc: 'Starlight violet blade that collapses defeated foes into cosmic sparks.' }
    ];
    for (const bf of newBlades) if (!BLADE_FX.some(x => x.id === bf.id)) BLADE_FX.push(bf);
  }
} catch (e) { errLog(e); }

/* ==========================================================================
   6. Design87 — UPGRADED 3D LIGHTING, RICH MATERIALS & STUDIO POLISH
   ========================================================================== */
{
  // Upgrade R3 scene exposure & material vibrancy once R3 initializes
  Pipe.on('post', 'design87_r3', () => {
    if (!R3.ok || R3.tuned87) return;
    R3.tuned87 = true;
    try {
      if (R3.rn) R3.rn.toneMappingExposure = 1.12;
      if (R3.rim) R3.rim.intensity = 1.15;
      if (R3.M && R3.M.armor) { R3.M.armor.metalness = 0.78; R3.M.armor.roughness = 0.24; R3.M.armor.envMapIntensity = 1.15; }
      if (R3.M && R3.M.gold) { R3.M.gold.emissiveIntensity = 0.68; R3.M.gold.roughness = 0.18; }
    } catch (e) { errLog(e); }
  }, 95);

  // Upgrade Hero Forge / Home / Results 3D Mini Studio lighting & color pop
  if (typeof Mini !== 'undefined' && Mini.studio) {
    const ms87 = Mini.studio.bind(Mini);
    Mini.studio = function () {
      const r = ms87.apply(this, arguments);
      try {
        if (this.rn) this.rn.toneMappingExposure = 1.18;
      } catch (e) { errLog(e); }
      return r;
    };
  }
}

