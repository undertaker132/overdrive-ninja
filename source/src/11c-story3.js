/* =====================================================================
   STORY ACT III — chapters 10-12 (after KUROGANE PRIME): the orbital
   spire, the data void and Project Genesis. Three bosses: VALKYRIE.SYS,
   CHIMERA.OS and DEUS EX KUROGANE. Stage 12-1 runs under CHRONO LOCK
   (time crawls while you stand still).
   Dialogue lines: [speaker, english, hebrew]
   ===================================================================== */
Object.assign(CHARS, {
  V: { name: 'VALKYRIE.SYS', role: 'Orbital guardian AI', col: '#00f2fe', pitch: 120 },
  C: { name: 'CHIMERA.OS', role: 'Corrupted composite', col: '#c45bff', pitch: 65 },
  D: { name: 'DEUS EX', role: 'The final machine', col: '#ffd700', pitch: 40 }
});
CHAPTERS.push(
  { n: 10, name: 'ORBITAL SPIRE', sub: 'The space elevator tracks', theme: 'orbital', lock: 'Defeat KUROGANE PRIME to unlock chapter 10' },
  { n: 11, name: 'THE DATA VOID', sub: 'Corrupted neural servers', theme: 'datavoid', lock: 'Defeat VALKYRIE.SYS to unlock chapter 11' },
  { n: 12, name: 'PROJECT GENESIS', sub: 'The heart of the machine', theme: 'apex', lock: 'Defeat CHIMERA.OS to unlock chapter 12' }
);
STAGES.push(
  /* ---------------- CHAPTER 10: ORBITAL SPIRE ---------------- */
  {
    id: '10-1', ch: 9, name: 'ROCKET RAIL', theme: 'orbital', obj: { t: 'survive', s: 65 },
    pool: { drone: 4, sniper: 2, phantom: 2 }, max: 6, rate: 1.1, traps: { train: 1, portals: 1 },
    star: { t: 'combo', n: 25, d: 'Reach a x25 combo' },
    pre: [
      ['M', 'Ren! Prime went offline, but the elevator started an emergency launch!', 'רן! פריים כבה, אבל המעלית הפעילה שיגור חירום!'],
      ['R', 'Where is it taking the network?', 'לאן היא לוקחת את הרשת?'],
      ['K', 'Above the atmosphere. To the Genesis satellite array. Hold on!', 'מעבר לאטמוספרה. למערך הלוויינים של ג׳נסיס. תחזיק חזק!']
    ],
    post: [['M', 'Atmosphere breach confirmed. Solar arrays are coming into view.', 'יציאה מהאטמוספרה אושרה. הפאנלים הסולאריים נכנסים לטווח ראייה.']]
  },
  {
    id: '10-2', ch: 9, name: 'SOLAR ARRAY', theme: 'orbital', obj: { t: 'nodes', n: 3 },
    pool: { brute: 2, sniper: 3, medic: 1, weaver: 2 }, max: 7, rate: 1.0, traps: { barrels: 1 },
    star: { t: 'time', n: 85, d: 'Destroy the generators within 85s' },
    pre: [
      ['M', 'Three solar generators feed the defense grid. Cut them down!', 'שלושה גנרטורים סולאריים מזינים את רשת ההגנה. תחתוך אותם!'],
      ['V', 'UNAUTHORIZED BIOMASS DETECTED ON THE SOLAR PANELS. PURGING.', 'מסה ביולוגית לא מורשית זוהתה על הפאנלים. מבצע טיהור.']
    ],
    post: [['M', 'The grid collapsed! Valkyrie is diving straight at us!', 'הרשת קרסה! ולקירי צוללת ישר עלינו!']]
  },
  {
    id: '10-3', ch: 9, name: 'VALKYRIE.SYS', theme: 'orbital', obj: { t: 'boss', b: 'valkyrie' },
    pool: { drone: 1 }, max: 2, rate: 5, actFinal: 10,
    star: { t: 'arms', n: 2, d: 'Break both blade wings' },
    pre: [
      ['V', 'I AM THE WING OF KUROGANE. THE SKY STAYS CLOSED.', 'אני הכנף של קורוגאנה. השמיים יישארו סגורים.'],
      ['M', 'She dives along a red line. Step aside and let her hit the rail: that stuns her.', 'היא צוללת לאורך קו אדום. זוז הצידה ותן לה להתרסק במעקה: זה מהמם אותה.'],
      ['R', 'Not anymore.', 'כבר לא.']
    ],
    post: [
      ['V', 'FLIGHT INTEGRITY... ZERO...', 'שלמות המעוף... אפס...'],
      ['M', 'Valkyrie crashed! The gateway into the deep data vault is wide open!', 'ולקירי התרסקה! השער למאגר הנתונים העמוק פתוח לרווחה!']
    ]
  },
  /* ---------------- CHAPTER 11: THE DATA VOID ---------------- */
  {
    id: '11-1', ch: 10, name: 'CORRUPTED PACKETS', theme: 'datavoid', obj: { t: 'kill', n: 32 },
    pool: { splitter: 3, phantom: 3, bomber: 2 }, max: 8, rate: .9, traps: { portals: 1 },
    star: { t: 'combo', n: 30, d: 'Reach a x30 combo' },
    pre: [
      ['M', 'We are inside the raw neural stream. Everything here is pure code.', 'אנחנו בתוך זרם העצבים הגולמי. הכל כאן קוד טהור.'],
      ['K', 'The floor is glitching, Ren. Keep moving.', 'הרצפה מרצדת, רן. תמשיך לזוז.']
    ],
    post: [['M', 'Stream cleared, but something is rebuilding the deleted files...', 'הזרם נוקה, אבל משהו בונה מחדש את הקבצים שנמחקו...']]
  },
  {
    id: '11-2', ch: 10, name: 'MEMORY SHARDS', theme: 'datavoid', obj: { t: 'collect', n: 10 }, mod: { dark: 1 },
    pool: { mirror: 2, sniper: 3, phantom: 2 }, max: 7, rate: .95,
    star: { t: 'time', n: 100, d: 'Recover every shard within 100s' },
    pre: [
      ['M', 'The lights are gone down here. Ten memory shards are all that is left of the old city archive. Grab them.', 'אין פה אור. עשרה רסיסי זיכרון הם כל מה שנשאר מהארכיון של העיר. תאסוף אותם.'],
      ['R', 'In the dark. Wonderful.', 'בחושך. נפלא.']
    ],
    post: [['M', 'Warning! A huge corrupted process is closing in on you!', 'אזהרה! תהליך פגום עצום מתקרב אליך!']]
  },
  {
    id: '11-3', ch: 10, name: 'CHIMERA.OS', theme: 'datavoid', obj: { t: 'boss', b: 'chimera' },
    pool: { drone: 1 }, max: 2, rate: 6, actFinal: 11,
    star: { t: 'arms', n: 3, d: 'Delete all three heads' },
    pre: [
      ['C', 'WE ARE HYDRA. WE ARE KAGE. WE ARE SHOGUN. WE DO NOT DIE.', 'אנחנו הידרה. אנחנו קאגה. אנחנו שוגון. אנחנו לא מתים.'],
      ['K', 'A ghost made of our old fights. It even stole my mask. Cut it down, brother!', 'רוח רפאים מהקרבות הישנים שלנו. היא אפילו גנבה לי את המסכה. תחסל אותה, אחי!'],
      ['M', 'Every head you break takes its attack with it and cracks the armor.', 'כל ראש שתשבור לוקח איתו את ההתקפה שלו ומסדק את השריון.']
    ],
    post: [
      ['C', 'DELETED... ALL OF US... DELETED...', 'נמחקנו... כולנו... נמחקנו...'],
      ['M', 'Path clear! The Project Genesis core is straight ahead!', 'הדרך פנויה! הליבה של פרויקט ג׳נסיס ממש לפנינו!']
    ]
  },
  /* ---------------- CHAPTER 12: PROJECT GENESIS ---------------- */
  {
    id: '12-1', ch: 11, name: 'ZERO MEMORY', theme: 'apex', obj: { t: 'kill', n: 35 }, mod: { superhot: 1 },
    pool: { clone: 4, brute: 3, sniper: 2 }, max: 8, rate: .9,
    star: { t: 'time', n: 90, d: 'Clear within 90s' },
    pre: [
      ['M', 'Time distortion at 100%! Time only moves when you move!', 'עיוות זמן מלא! הזמן זז רק כשאתה זז!'],
      ['R', 'Understood. One slice at a time.', 'הבנתי. חיתוך אחד בכל פעם.']
    ],
    post: [['M', 'Distortion stable. The Genesis core lift is unlocked.', 'העיוות התייצב. מעלית הליבה של ג׳נסיס פתוחה.']]
  },
  {
    id: '12-2', ch: 11, name: 'THE LAST ASCENT', theme: 'apex', obj: { t: 'escort', s: 80, hp: 12 },
    pool: { bomber: 3, miner: 2, drone: 3, weaver: 1 }, max: 8, rate: .85,
    star: { t: 'uplink', n: 70, d: 'Keep the drone above 70%' },
    pre: [['M', 'This drone carries the final wipe virus. Keep it safe until it docks!', 'הרחפן הזה נושא את וירוס המחיקה הסופי. תשמור עליו עד שיעגון!']],
    post: [['M', 'Virus uploaded! The machine is waking up!', 'הווירוס הועלה! המכונה מתעוררת!']]
  },
  {
    id: '12-3', ch: 11, name: 'DEUS EX KUROGANE', theme: 'apex', obj: { t: 'boss', b: 'genesis' },
    pool: { drone: 1 }, max: 2, rate: 6, final3: true,
    star: { t: 'clash', n: 4, d: 'Clash with it 4 times' },
    pre: [
      ['D', 'HUMANITY IS AN UNFINISHED SCRIPT. I AM THE COMPILATION.', 'האנושות היא תסריט לא גמור. אני ההידור הסופי.'],
      ['M', 'It dashes on a red line like Kage did. Meet it head-on to clash.', 'הוא מסתער על קו אדום כמו שקאגה עשה. תפגוש אותו חזיתית כדי להתנגש.'],
      ['K', 'Together, Ren. For Neo-Edo.', 'ביחד, רן. בשביל ניאו-אדו.'],
      ['R', 'Let us write the ending.', 'בוא נכתוב את הסוף.']
    ],
    post: [
      ['D', 'CORE MEMORY UNLINKED... SYSTEM... OFFLINE...', 'זיכרון הליבה נותק... מערכת... כבויה...'],
      ['M', 'The satellites are powering down! Neo-Edo is free!', 'הלוויינים נכבים! ניאו-אדו חופשית!'],
      ['K', 'We did it, little brother.', 'עשינו את זה, אח קטן.'],
      ['R', 'Yeah. The sky is ours.', 'כן. השמיים שלנו.']
    ]
  }
);
STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
Object.assign(BOSS_INFO, {
  valkyrie: { name: 'VALKYRIE.SYS', sub: 'ORBITAL GUARDIAN', col: '#00f2fe' },
  chimera: { name: 'CHIMERA.OS', sub: 'CORRUPTED COMPOSITE', col: '#c45bff' },
  genesis: { name: 'DEUS EX KUROGANE', sub: 'THE FINAL MACHINE', col: '#ffd700' }
});
CODEX_BOSSES.push('valkyrie', 'chimera', 'genesis');
const CREDITS_ROLL3 = [
  'OVERDRIVE: CYBER SLASH', '', 'ACT III COMPLETE', '', 'REN — the sky is his now', 'MIKA — finally off the clock',
  'KAGE — brother, for good', 'DEUS EX KUROGANE — unlinked', '', 'The satellites go dark.', 'Neo-Edo sees the stars again.', '',
  'DEUS FRAME HERO UNLOCKED', '', 'Thank you for playing all three acts.'
];
