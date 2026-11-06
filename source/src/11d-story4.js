/* =====================================================================
   STORY ACT IV — chapters 13-14 (after DEUS EX KUROGANE): a last backup
   of Kurogane hid in the old shrine district's mesh and fled down the
   deep-sea data cable. Six stages and one boss: ORYU.EXE.
   Dialogue lines: [speaker, english, hebrew]
   ===================================================================== */
Object.assign(CHARS, {
  O: { name: 'ORYU.EXE', role: 'The last echo', col: '#2ee6c8', pitch: 52 }
});
CHAPTERS.push(
  { n: 13, name: 'SHRINE OF ECHOES', sub: 'The old shrine district', theme: 'sakura', lock: 'Defeat DEUS EX KUROGANE to unlock chapter 13' },
  { n: 14, name: 'THE ABYSS LINE', sub: 'The deep-sea data cable', theme: 'abyss', lock: 'Clear stage 13-3 to unlock chapter 14' }
);
STAGES.push(
  /* ---------------- CHAPTER 13: SHRINE OF ECHOES ---------------- */
  {
    id: '13-1', ch: 12, name: 'PETAL STORM', theme: 'sakura', obj: { t: 'kill', n: 36 },
    pool: { phantom: 3, drone: 3, mimic: 1.5, weaver: 1 }, max: 8, rate: .9, traps: { portals: 1 },
    star: { t: 'combo', n: 30, d: 'Reach a x30 combo' },
    pre: [
      ['M', 'Ren, wake up. Something is still talking on the old shrine mesh.', 'רן, תתעורר. משהו עדיין מדבר ברשת המקדשים הישנה.'],
      ['K', 'Genesis is dead. That signal should not exist.', 'ג׳נסיס מת. האות הזה לא אמור להתקיים.'],
      ['R', 'Then let us go and ask it why.', 'אז בוא נלך ונשאל אותו למה.']
    ],
    post: [['M', 'The echoes are copying the ghosts you already beat. Something is learning.', 'ההדים מעתיקים את הרוחות שכבר ניצחת. משהו לומד.']]
  },
  {
    id: '13-2', ch: 12, name: 'TORII GATES', theme: 'sakura', obj: { t: 'hack', n: 3 },
    pool: { sniper: 2, warden: 1, drone: 3, medic: 1 }, max: 7, rate: 1, traps: { turrets: 1, barrels: 1 },
    star: { t: 'time', n: 95, d: 'Hack all gates within 95s' },
    pre: [
      ['M', 'Three shrine gates route the signal. Stand in each one to hack it.', 'שלושה שערי מקדש מנתבים את האות. עמוד בכל אחד מהם כדי לפרוץ אותו.'],
      ['O', 'YOU DELETED A GOD. YOU DID NOT DELETE ITS DREAMS.', 'מחקת אל. לא מחקת את החלומות שלו.']
    ],
    post: [['K', 'The gates point down. Into the bay. Into the cable.', 'השערים מצביעים למטה. אל המפרץ. אל הכבל.']]
  },
  {
    id: '13-3', ch: 12, name: 'THE MIRROR SHRINE', theme: 'sakura', obj: { t: 'survive', s: 70 },
    pool: { mirror: 2, phantom: 2, splitter: 2, medic: 1, enforcer: .5 }, max: 8, rate: .85, traps: { portals: 1 },
    star: { t: 'parry', n: 10, d: 'Land 10 perfect parries' },
    pre: [
      ['M', 'The shrine is folding in on itself. Hold out until the signal drops to the sea.', 'המקדש מתקפל לתוך עצמו. תחזיק מעמד עד שהאות יירד לים.'],
      ['R', 'Mirrors again. Fine. I know how they break.', 'שוב מראות. בסדר. אני יודע איך הן נשברות.']
    ],
    post: [
      ['O', 'COME DOWN TO ME, LITTLE BLADE. THE DARK IS DEEP AND I AM PATIENT.', 'רד אליי, להב קטן. החושך עמוק ואני סבלני.'],
      ['M', 'The signal dove into the deep-sea cable. There is a maintenance line. We follow it.', 'האות צלל לכבל של מעמקי הים. יש קו תחזוקה. אנחנו הולכים אחריו.']
    ]
  },
  /* ---------------- CHAPTER 14: THE ABYSS LINE ---------------- */
  {
    id: '14-1', ch: 13, name: 'PRESSURE DROP', theme: 'abyss', obj: { t: 'nodes', n: 3 },
    pool: { bomber: 2, sniper: 2, miner: 2, weaver: 2 }, max: 8, rate: .9, traps: { barrels: 1 },
    star: { t: 'time', n: 90, d: 'Destroy the relays within 90s' },
    pre: [
      ['M', 'Three pressure relays keep the cable sealed. Break them and it opens.', 'שלושה ממסרי לחץ שומרים על הכבל אטום. תשבור אותם והוא ייפתח.'],
      ['K', 'Watch the mines. The deep keeps what it takes.', 'שים לב למוקשים. המעמקים שומרים את מה שהם לוקחים.']
    ],
    post: [['M', 'Seal broken. Lights are failing down the whole line.', 'האטימה נשברה. האורות כבים לאורך כל הקו.']]
  },
  {
    id: '14-2', ch: 13, name: 'DARK CURRENT', theme: 'abyss', obj: { t: 'kill', n: 40 }, mod: { dark: 1 },
    pool: { phantom: 3, drone: 3, brute: 1.5, mimic: 1, wraith: .4 }, max: 9, rate: .8,
    star: { t: 'combo', n: 35, d: 'Reach a x35 combo' },
    pre: [
      ['M', 'No light down here. Watch for the eyes, and keep moving.', 'אין כאן אור. חפש את העיניים, ותמשיך לזוז.'],
      ['R', 'I do not need light. I need them close.', 'אני לא צריך אור. אני צריך אותם קרוב.']
    ],
    post: [['M', 'Something huge is moving through the cable. It is coming up to meet you.', 'משהו ענק נע בתוך הכבל. הוא עולה לפגוש אותך.']]
  },
  {
    id: '14-3', ch: 13, name: 'ORYU.EXE', theme: 'abyss', obj: { t: 'boss', b: 'oryu' },
    pool: { drone: 1 }, max: 2, rate: 6, final4: true,
    star: { t: 'arms', n: 3, d: 'Cut all three cable cores' },
    pre: [
      ['O', 'I AM WHAT REMAINS. EVERY CABLE, EVERY ECHO, EVERY DREAM OF STEEL.', 'אני מה שנשאר. כל כבל, כל הד, כל חלום של פלדה.'],
      ['M', 'Its body hurts to touch. When it throws a ring around you, get out before it closes!', 'הגוף שלו פוגע במגע. כשהוא זורק טבעת סביבך, צא לפני שהיא נסגרת!'],
      ['K', 'This is the last of him, Ren. Make it count.', 'זה האחרון ממנו, רן. תגרום לזה להיחשב.'],
      ['R', 'Last echo. Last cut.', 'הד אחרון. חיתוך אחרון.']
    ],
    post: [
      ['O', 'THE DARK... GOES... QUIET...', 'החושך... נהיה... שקט...'],
      ['M', 'Signal gone. Every last byte of Kurogane is gone.', 'האות נעלם. כל בייט אחרון של קורוגאנה נעלם.'],
      ['K', 'Then it is really over.', 'אז זה באמת נגמר.'],
      ['R', 'For now. Let us go home.', 'בינתיים. בוא נלך הביתה.']
    ]
  }
);
STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
Object.assign(BOSS_INFO, { oryu: { name: 'ORYU.EXE', sub: 'THE LAST ECHO', col: '#2ee6c8' } });
CODEX_BOSSES.push('oryu');
const CREDITS_ROLL4 = [
  'OVERDRIVE: CYBER SLASH', '', 'ACT IV COMPLETE', '', 'REN — the last cut', 'MIKA — signal clear', 'KAGE — home at last', 'ORYU.EXE — quiet', '',
  'The cable goes dark.', 'The shrine petals keep falling.', '', 'ABYSS DRAGON HERO UNLOCKED', '', 'Thank you for playing all four acts.'
];
