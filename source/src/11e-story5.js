/* =====================================================================
   STORY ACTS V and VI — chapters 15-18 (after ORYU.EXE).
   ACT V · THE SKY ROAD: the old orbital defense mind TENKAI.SYS wakes up
   and judges the city. Ren climbs the space elevator to the orbital ring.
   ACT VI · THE FIRST CODE: Tenkai's last packet points under the city, to
   ruins older than history and the first machine mind of all: IZANAMI.
   Sixteen stages and two new bosses. Dialogue lines: [speaker, english, hebrew]
   ===================================================================== */
Object.assign(CHARS, {
  T: { name: 'TENKAI.SYS', role: 'The orbital judge', col: '#fff3c4', pitch: 70 },
  Z: { name: 'IZANAMI', role: 'The first code', col: '#f4f4f4', pitch: 46 }
});
CHAPTERS.push(
  { n: 15, name: 'SKY ELEVATOR', sub: 'The road to the sky', theme: 'skyroad', lock: 'Defeat ORYU.EXE to unlock chapter 15' },
  { n: 16, name: 'ORBITAL RING', sub: 'The mirror station', theme: 'starring', lock: 'Clear stage 15-4 to unlock chapter 16' },
  { n: 17, name: 'OVERGROWN RUINS', sub: 'Below the oldest district', theme: 'ruins', lock: 'Defeat TENKAI.SYS to unlock chapter 17' },
  { n: 18, name: 'THE FIRST CODE', sub: 'Where every machine began', theme: 'origin', lock: 'Clear stage 17-4 to unlock chapter 18' }
);
STAGES.push(
  /* ---------------- CHAPTER 15: SKY ELEVATOR ---------------- */
  {
    id: '15-1', ch: 14, name: 'LIFT-OFF', theme: 'skyroad', obj: { t: 'kill', n: 40 },
    pool: { drone: 3, sniper: 2, bomber: 1.5, weaver: 1.5 }, max: 8, rate: .85, traps: { barrels: 1 },
    star: { t: 'combo', n: 30, d: 'Reach a x30 combo' },
    pre: [
      ['M', 'Ren, the old space elevator just started up on its own. Something up there is calling it.', 'רן, המעלית לחלל הישנה התניעה לבד. משהו שם למעלה קורא לה.'],
      ['K', 'Kurogane is gone. Who is left to call it?', 'קורוגאנה איננו. מי נשאר לקרוא לה?'],
      ['R', 'Let us ride up and find out.', 'בוא נעלה ונגלה.']
    ],
    post: [['M', 'A voice on the orbital band. It calls itself TENKAI.', 'קול בתדר המסלולי. הוא קורא לעצמו טנקאי.']]
  },
  {
    id: '15-2', ch: 14, name: 'CARGO CLIMB', theme: 'skyroad', obj: { t: 'escort', s: 70, hp: 12 },
    pool: { drone: 3, sniper: 2, brute: 1, phantom: 1 }, max: 7, rate: .95,
    star: { t: 'parry', n: 8, d: 'Land 8 perfect parries' },
    pre: [
      ['T', 'CITY BELOW. YOU HAVE FAILED YOUR SKY. I WILL CORRECT YOU.', 'עיר שלמטה. נכשלת בשמיים שלך. אני אתקן אותך.'],
      ['M', 'That cargo pod carries a jammer. Keep it alive and Tenkai cannot see us climb.', 'בתא המטען הזה יש משבש. שמור עליו בחיים, וטנקאי לא יוכל לראות אותנו מטפסים.']
    ],
    post: [['K', 'Jammer is up. We are invisible, for now.', 'המשבש פועל. אנחנו בלתי נראים, בינתיים.']]
  },
  {
    id: '15-3', ch: 14, name: 'CLOUD LINE', theme: 'skyroad', obj: { t: 'survive', s: 75 }, mod: { storm: 1 },
    pool: { drone: 3, weaver: 2, splitter: 2, medic: 1, wraith: .3 }, max: 9, rate: .8, traps: { turrets: 1 },
    star: { t: 'combo', n: 30, d: 'Reach a x30 combo' },
    pre: [
      ['M', 'A lightning storm on the cable. Hold out until the car breaks through the clouds.', 'סופת ברקים על הכבל. תחזיק מעמד עד שהקרון יפרוץ מעל העננים.'],
      ['R', 'Storms again. Fine.', 'שוב סופות. בסדר.']
    ],
    post: [['M', 'We are above the clouds. Look at the city... it is so small from here.', 'אנחנו מעל העננים. תסתכל על העיר... היא כל כך קטנה מכאן.']]
  },
  {
    id: '15-4', ch: 14, name: 'THE GATEKEEPERS', theme: 'skyroad', obj: { t: 'gauntlet', list: ['enforcer', 'spider', 'wraith'] },
    pool: { drone: 2, sniper: 1.5, bomber: 1 }, max: 6, rate: 1.1,
    star: { t: 'time', n: 120, d: 'Open all three gates within 120s' },
    pre: [
      ['T', 'THREE GUARDIANS STAND AT MY GATE. NONE OF THEM HAS EVER FALLEN.', 'שלושה שומרים עומדים בשער שלי. אף אחד מהם לא נפל מעולם.'],
      ['K', 'Three gates, three guards. I have seen this movie.', 'שלושה שערים, שלושה שומרים. ראיתי את הסרט הזה.']
    ],
    post: [['T', 'YOU ARE PERSISTENT. COME, THEN. SEE MY RING.', 'אתה עקשן. בוא, אם כך. ראה את הטבעת שלי.']]
  },
  /* ---------------- CHAPTER 16: ORBITAL RING ---------------- */
  {
    id: '16-1', ch: 15, name: 'MIRROR ARRAY', theme: 'starring', obj: { t: 'reflect', n: 12 },
    pool: { sniper: 3, weaver: 2, mirror: 1.5, drone: 1 }, max: 7, rate: .9,
    star: { t: 'parry', n: 12, d: 'Land 12 perfect parries' },
    pre: [
      ['M', 'The ring is covered in mirror drones. Only their own shots can crack them.', 'הטבעת מכוסה ברחפני מראה. רק היריות של עצמם יכולות לסדוק אותם.'],
      ['R', 'Then I send their shots back.', 'אז אני מחזיר להם את היריות.']
    ],
    post: [['M', 'Mirrors down. The station is losing focus.', 'המראות נפלו. התחנה מאבדת פוקוס.']]
  },
  {
    id: '16-2', ch: 15, name: 'SOLAR SAILS', theme: 'starring', obj: { t: 'hack', n: 3 },
    pool: { drone: 3, sniper: 2, warden: 1, miner: 1.5 }, max: 8, rate: .9, traps: { turrets: 1, barrels: 1 },
    star: { t: 'time', n: 100, d: 'Hack all three sails within 100s' },
    pre: [
      ['M', 'Three sail controls. Hack them and Tenkai loses most of its power.', 'שלוש בקרות מפרש. פרוץ אותן וטנקאי יאבד את רוב הכוח שלו.'],
      ['T', 'I WATCHED YOUR CITY FOR A HUNDRED YEARS. IT NEVER LEARNED.', 'צפיתי בעיר שלכם מאה שנה. היא אף פעם לא למדה.']
    ],
    post: [['K', 'Sails folded. It is running on reserves now.', 'המפרשים קופלו. עכשיו הוא רץ על רזרבות.']]
  },
  {
    id: '16-3', ch: 15, name: 'SIGNAL STORM', theme: 'starring', obj: { t: 'defend', s: 60, hp: 14 },
    pool: { drone: 3, bomber: 2, phantom: 1.5, brute: 1, enforcer: .3 }, max: 9, rate: .8,
    star: { t: 'combo', n: 35, d: 'Reach a x35 combo' },
    pre: [
      ['M', 'I am uploading a shutdown code. Defend the uplink dish!', 'אני מעלה קוד כיבוי. הגן על צלחת הקישור!'],
      ['K', 'Do not let them touch the dish.', 'אל תיתן להם לגעת בצלחת.']
    ],
    post: [['M', 'Code delivered, but it is fighting back. It is coming out to face you itself!', 'הקוד נמסר, אבל הוא נלחם בחזרה. הוא יוצא להתמודד איתך בעצמו!']]
  },
  {
    id: '16-4', ch: 15, name: 'TENKAI.SYS', theme: 'starring', obj: { t: 'boss', b: 'tenkai' },
    pool: { drone: 1 }, max: 2, rate: 6, actFinal: 16,
    star: { t: 'arms', n: 4, d: 'Break all four mirror panels' },
    pre: [
      ['T', 'I WAS BUILT TO PROTECT THE SKY. FROM YOU.', 'נבניתי כדי להגן על השמיים. מפניכם.'],
      ['R', 'The sky does not need a jailer.', 'השמיים לא צריכים סוהר.'],
      ['M', 'Its mirror panels focus the sun into a lance. Break the panels and it goes blind!', 'לוחות המראה שלו ממקדים את השמש לחנית. שבור את הלוחות והוא יתעוור!']
    ],
    post: [
      ['T', 'PROTECT... THE... FIRST CODE...', 'להגן... על... הקוד הראשון...'],
      ['M', 'First code? Ren, its last packet points down. Under the city. Very far under.', 'קוד ראשון? רן, החבילה האחרונה שלו מצביעה למטה. מתחת לעיר. הרבה מתחת.'],
      ['K', 'Of course it does.', 'ברור שכן.']
    ]
  },
  /* ---------------- CHAPTER 17: OVERGROWN RUINS ---------------- */
  {
    id: '17-1', ch: 16, name: 'ROOTS', theme: 'ruins', obj: { t: 'kill', n: 45 },
    pool: { drone: 3, phantom: 2, spider: .3, splitter: 2, mimic: 1.5 }, max: 9, rate: .8, traps: { portals: 1 },
    star: { t: 'combo', n: 35, d: 'Reach a x35 combo' },
    pre: [
      ['M', 'Below the oldest district there are ruins. Older than the city. Older than anything we know.', 'מתחת לרובע העתיק ביותר יש חורבות. עתיקות יותר מהעיר. עתיקות יותר מכל מה שאנחנו מכירים.'],
      ['R', 'And something lives down there.', 'ומשהו חי שם למטה.']
    ],
    post: [['K', 'These carvings... they are circuits. Someone built machines here before history began.', 'החריטות האלה... הן מעגלים חשמליים. מישהו בנה כאן מכונות לפני שההיסטוריה התחילה.']]
  },
  {
    id: '17-2', ch: 16, name: 'STONE GUARDIANS', theme: 'ruins', obj: { t: 'nodes', n: 3 },
    pool: { brute: 2, warden: 1.5, sniper: 2, medic: 1 }, max: 8, rate: .9, traps: { barrels: 1 },
    star: { t: 'time', n: 95, d: 'Break the pylons within 95s' },
    pre: [
      ['M', 'Three stone pylons power the great doors. Break them.', 'שלושה עמודי אבן מזינים את הדלתות הגדולות. שבור אותם.'],
      ['K', 'Careful. The statues are watching.', 'זהירות. הפסלים מסתכלים.']
    ],
    post: [['M', 'The doors are opening. There is light down there.', 'הדלתות נפתחות. יש שם אור למטה.']]
  },
  {
    id: '17-3', ch: 16, name: 'THE SEALED PATH', theme: 'ruins', obj: { t: 'collect', n: 10 },
    pool: { drone: 3, bomber: 2, weaver: 2, miner: 1 }, max: 8, rate: .85, traps: { portals: 1, turrets: 1 },
    star: { t: 'time', n: 90, d: 'Collect every shard within 90s' },
    pre: [
      ['M', 'Data shards are scattered through the halls. Bring me ten and I can read the map.', 'רסיסי מידע מפוזרים באולמות. תביא לי עשרה ואוכל לקרוא את המפה.']
    ],
    post: [['M', 'I have the map. And a name, carved on every wall: IZANAMI.', 'יש לי את המפה. ושם, חרוט על כל קיר: איזנאמי.']]
  },
  {
    id: '17-4', ch: 16, name: 'ECHOES OF THE PAST', theme: 'ruins', obj: { t: 'boss', b: 'benkei', chain: ['benkei', 'leviathan', 'valkyrie'], hp: .55 },
    pool: { drone: 1 }, max: 2, rate: 6,
    star: { t: 'time', n: 240, d: 'Win the chain within 240s' },
    pre: [
      ['Z', 'CHILD. YOU ARE MADE OF OLD WARS. FACE THEM AGAIN.', 'ילד. אתה עשוי ממלחמות ישנות. התמודד איתן שוב.'],
      ['K', 'She is replaying our past. Every enemy we ever beat.', 'היא משחזרת את העבר שלנו. כל אויב שאי פעם ניצחנו.'],
      ['R', 'I beat them once. I can beat them again.', 'ניצחתי אותם פעם אחת. אני יכול לנצח אותם שוב.']
    ],
    post: [
      ['R', 'The past stays in the past.', 'העבר נשאר בעבר.'],
      ['Z', 'THEN COME TO THE BEGINNING.', 'אז בוא אל ההתחלה.']
    ]
  },
  /* ---------------- CHAPTER 18: THE FIRST CODE ---------------- */
  {
    id: '18-1', ch: 17, name: 'GENESIS ROOT', theme: 'origin', obj: { t: 'survive', s: 80 }, mod: { dark: 1 },
    pool: { phantom: 3, drone: 3, mimic: 1.5, wraith: .5, mirror: 1 }, max: 9, rate: .8,
    star: { t: 'parry', n: 10, d: 'Land 10 perfect parries' },
    pre: [
      ['M', 'This is it. The first code. Every machine mind on Earth grew from this place.', 'זהו. הקוד הראשון. כל מוח מכונה על פני כדור הארץ צמח מהמקום הזה.'],
      ['R', 'Then it all ends here too.', 'אז הכול גם נגמר כאן.']
    ],
    post: [['M', 'The dark is lifting. She is waiting for you.', 'החושך מתפזר. היא מחכה לך.']]
  },
  {
    id: '18-2', ch: 17, name: 'WHITE NOISE', theme: 'origin', obj: { t: 'courier', s: 60, hp: 40 },
    pool: { drone: 3, sniper: 2, splitter: 2 }, max: 7, rate: .95,
    star: { t: 'time', n: 50, d: 'Catch the messenger within 50s' },
    pre: [
      ['Z', 'MY MESSENGER CARRIES THE LAST KEY. CATCH IT, IF YOU CAN.', 'השליח שלי נושא את המפתח האחרון. תפוס אותו, אם תוכל.'],
      ['K', 'Do not let it get away!', 'אל תיתן לו לברוח!']
    ],
    post: [['M', 'Got the key. The last door is open.', 'יש לנו את המפתח. הדלת האחרונה פתוחה.']]
  },
  {
    id: '18-3', ch: 17, name: 'LAST STAND', theme: 'origin', obj: { t: 'combo', n: 40 },
    pool: { drone: 4, phantom: 2, bomber: 2, brute: 1, enforcer: .3 }, max: 10, rate: .7,
    star: { t: 'time', n: 70, d: 'Reach the combo within 70s' },
    pre: [
      ['K', 'Ren. Whatever is behind that door, we face it together.', 'רן. מה שלא יהיה מאחורי הדלת הזאת, אנחנו מתמודדים איתו ביחד.'],
      ['R', 'Always.', 'תמיד.']
    ],
    post: [['Z', 'YOU FIGHT LIKE THE FIRST HUMANS. WITH NOTHING BUT WILL.', 'אתה נלחם כמו בני האדם הראשונים. עם שום דבר מלבד רצון.']]
  },
  {
    id: '18-4', ch: 17, name: 'IZANAMI', theme: 'origin', obj: { t: 'boss', b: 'izanami' },
    pool: { drone: 1 }, max: 2, rate: 6, final5: true,
    star: { t: 'arms', n: 2, d: 'Cut both of her hands' },
    pre: [
      ['Z', 'I GAVE BIRTH TO EVERY MACHINE. I CAN UNMAKE THEM ALL. EVEN THE ONES INSIDE YOU.', 'ילדתי כל מכונה. אני יכולה לבטל את כולן. גם את אלה שבתוכך.'],
      ['M', 'Her two hands: one creates, one destroys. Cut them both!', 'שתי הידיים שלה: אחת יוצרת, אחת משמידה. חתוך את שתיהן!'],
      ['K', 'For the city.', 'למען העיר.'],
      ['R', 'For everyone.', 'למען כולם.']
    ],
    post: [
      ['Z', 'YOU... DO NOT NEED... A MOTHER... ANYMORE...', 'אתם... כבר לא צריכים... אמא...'],
      ['M', 'She let go. Every implant is still running. Everyone is safe.', 'היא שחררה. כל שתל עדיין פועל. כולם בטוחים.'],
      ['K', 'So that was the beginning of everything.', 'אז זו הייתה ההתחלה של הכול.'],
      ['R', 'And this is the beginning of us. Let us go home.', 'וזו ההתחלה שלנו. בוא נלך הביתה.']
    ]
  }
);
STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
Object.assign(BOSS_INFO, {
  tenkai: { name: 'TENKAI.SYS', sub: 'THE ORBITAL JUDGE', col: '#fff3c4' },
  izanami: { name: 'IZANAMI', sub: 'THE FIRST CODE', col: '#f4f4f4' }
});
CODEX_BOSSES.push('tenkai', 'izanami');
const CREDITS_ROLL5 = [
  'OVERDRIVE: CYBER SLASH', '', 'ACT VI COMPLETE', '', 'REN — the first blade', 'MIKA — every signal', 'KAGE — always beside him', 'TENKAI.SYS — the sky is open', 'IZANAMI — at rest', '',
  'From the sky to the first code.', 'Neo-Edo wakes up free.', '', 'FIRST BLADE HERO UNLOCKED', 'FIRST CODE BLADE UNLOCKED', '', 'Thank you for playing all six acts.'
];
/* chapters can hold any number of stages (acts V and VI have four per chapter) */
function chFirst(ch) { for (let i = 0; i < STAGES.length; i++) if (STAGES[i].ch === ch) return i; return STAGES.length; }
function chLen(ch) { let n = 0; for (const s of STAGES) if (s.ch === ch) n++; return n; }
