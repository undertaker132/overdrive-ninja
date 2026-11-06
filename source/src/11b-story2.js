/* =====================================================================
   STORY ACT II — chapters 7-9 (after REN.NULL): the harbor, the old
   monastery and the Black Tower. New objectives: collect shards,
   escort a cargo drone, reflected-shot kills, a mini-boss gauntlet,
   a combo trial and a chain of old bosses. Three new bosses:
   LEVIATHAN, BENKEI.SYS and KUROGANE PRIME.
   Dialogue lines: [speaker, english, hebrew]
   ===================================================================== */
Object.assign(CHARS, {
  P: { name: 'KUROGANE PRIME', role: 'The founder, uploaded', col: '#ffd700', pitch: 55 },
  B: { name: 'BENKEI.SYS', role: 'Monastery guardian AI', col: '#ff9a3d', pitch: 95 }
});
CHAPTERS.push(
  { n: 7, name: 'NEON TIDE', sub: 'The Kurogane harbor', theme: 'harbor', lock: 'Defeat REN.NULL to unlock chapter 7' },
  { n: 8, name: 'IRON MONASTERY', sub: 'Where two brothers learned the blade', theme: 'temple', lock: 'Defeat LEVIATHAN to unlock chapter 8' },
  { n: 9, name: 'ZERO HOUR', sub: 'The Black Tower', theme: 'summit', lock: 'Defeat BENKEI.SYS to unlock chapter 9' }
);
STAGES.push(
  /* ---------------- CHAPTER 7: NEON TIDE ---------------- */
  {
    id: '7-1', ch: 6, name: 'DOCK RAID', theme: 'harbor', obj: { t: 'collect', n: 8 },
    pool: { drone: 3, sniper: 2, bomber: 1, medic: 1 }, max: 7, rate: 1.1, traps: { barrels: 1 },
    star: { t: 'time', n: 80, d: 'Collect every shard within 80s' },
    pre: [
      ['M', "REN.NULL had a return address. Kurogane's harbor, where every implant ships out.", 'לרן.נאל הייתה כתובת חזרה. הנמל של קורוגאנה, משם יוצא כל שתל.'],
      ['R', 'What am I looking for?', 'מה אני מחפש?'],
      ['M', 'Data shards from their shipping logs, scattered across the cargo roofs. Grab eight.', 'רסיסי נתונים מיומני המשלוחים שלהם, מפוזרים על גגות המטען. תאסוף שמונה.']
    ],
    post: [
      ['M', 'Got it. Every shipment goes to one place: the Black Tower, out at sea.', 'יש. כל משלוח הולך למקום אחד: המגדל השחור, בלב הים.'],
      ['R', 'Then I need a ride.', 'אז אני צריך טרמפ.']
    ]
  },
  {
    id: '7-2', ch: 6, name: 'CONVOY', theme: 'harbor', obj: { t: 'escort', s: 70, hp: 10 },
    pool: { bomber: 2, drone: 3, brute: 1, miner: 1, weaver: 1 }, max: 7, rate: 1.05,
    star: { t: 'uplink', n: 60, d: 'Keep the cargo drone above 60%' },
    pre: [
      ['K', 'I stole you a ride. A cargo drone heading for the tower. Keep it in one piece.', 'גנבתי לך טרמפ. רחפן מטען בדרך למגדל. תשמור שיגיע שלם.'],
      ['M', 'Bombers and miners will go for it. Stay close as it moves.', 'מפציצים ומניחי מוקשים ילכו עליו. תישאר קרוב כשהוא זז.']
    ],
    post: [
      ['K', 'The drone is airborne. Something big is following it under the water.', 'הרחפן באוויר. משהו גדול עוקב אחריו מתחת למים.'],
      ['R', 'Of course it is.', 'ברור שכן.']
    ]
  },
  {
    id: '7-3', ch: 6, name: 'LEVIATHAN', theme: 'harbor', obj: { t: 'boss', b: 'leviathan' },
    pool: { drone: 1 }, max: 2, rate: 6, actFinal: 7,
    star: { t: 'arms', n: 6, d: 'Break all 6 hull plates' },
    pre: [
      ['M', "That's LEVIATHAN, Kurogane's harbor guard. A mech serpent.", 'זה לוויתן, שומר הנמל של קורוגאנה. נחש מכני.'],
      ['M', 'The head is the weak spot. Its hull plates fire broadsides: break them to slow it down.', 'הראש הוא הנקודה החלשה. לוחות השריון שלו יורים מהצדדים: שבור אותם כדי להאט אותו.'],
      ['R', "Big snake. Small blade. Let's see.", 'נחש גדול. להב קטן. בוא נראה.']
    ],
    post: [
      ['M', "It's going under for good. The way to the tower is open.", 'הוא שוקע סופית. הדרך למגדל פתוחה.'],
      ['K', 'Before the tower, we stop at the monastery. Our old masters left something there.', 'לפני המגדל, עוצרים במנזר. המורים הוותיקים שלנו השאירו שם משהו.']
    ]
  },
  /* ---------------- CHAPTER 8: IRON MONASTERY ---------------- */
  {
    id: '8-1', ch: 7, name: 'STONE STEPS', theme: 'temple', obj: { t: 'reflect', n: 10 }, mod: { reflectOnly: 1 },
    pool: { weaver: 3, sniper: 3 }, max: 6, rate: 1.05,
    star: { t: 'parry', n: 10, d: 'Land 10 perfect parries' },
    pre: [
      ['K', 'The monastery. Kurogane turned it into a data vault.', 'המנזר. קורוגאנה הפכו אותו לכספת נתונים.'],
      ['K', 'The old trial still runs: the guards can only be beaten with their own arrows.', 'המבחן הישן עדיין פועל: את השומרים אפשר לנצח רק עם החיצים של עצמם.'],
      ['M', 'Translation: your blade cannot touch them. Take down ten with shots you slash back.', 'בתרגום: הלהב שלך לא נוגע בהם. הפל עשרה עם יריות שאתה מחזיר בחרב.']
    ],
    post: [
      ['R', 'Master would have laughed at that last parry.', 'המורה היה צוחק על ההדיפה האחרונה.'],
      ['K', 'Master would have made you do it a hundred more times.', 'המורה היה מכריח אותך לעשות אותה עוד מאה פעם.']
    ]
  },
  {
    id: '8-2', ch: 7, name: 'THREE GATES', theme: 'temple', obj: { t: 'gauntlet', list: ['enforcer', 'spider', 'wraith'] },
    pool: { drone: 2, phantom: 1 }, max: 4, rate: 1.6,
    star: { t: 'time', n: 150, d: 'Pass the three gates within 150s' },
    pre: [
      ['B', 'THREE GATES. THREE GUARDIANS. TURN BACK, STUDENT.', 'שלושה שערים. שלושה שומרים. חזור על עקבותיך, תלמיד.'],
      ['K', 'It still knows us. Beat its guardians and it has to face us.', 'הוא עדיין מכיר אותנו. נצח את השומרים שלו והוא יצטרך לעמוד מולנו.']
    ],
    post: [
      ['B', 'THE GATES ARE OPEN. NOW FACE ME.', 'השערים פתוחים. עכשיו עמוד מולי.'],
      ['M', "I'm reading its bells. Ring them in the right order and its guard drops.", 'אני קוראת את הפעמונים שלו. צלצל בהם בסדר הנכון וההגנה שלו נופלת.']
    ]
  },
  {
    id: '8-3', ch: 7, name: 'BENKEI.SYS', theme: 'temple', obj: { t: 'boss', b: 'benkei' },
    pool: { drone: 1 }, max: 2, rate: 6, actFinal: 8,
    star: { t: 'zandatsu', n: 8, d: 'Land 8 Zandatsu slashes' },
    pre: [
      ['B', 'I GUARDED THIS VAULT FOR A HUNDRED YEARS. KUROGANE GAVE ME A HUNDRED MORE.', 'שמרתי על הכספת הזאת מאה שנה. קורוגאנה נתנו לי עוד מאה.'],
      ['M', 'Four bells. The lit one is next. Ring all four in order and it staggers.', 'ארבעה פעמונים. זה שדולק הוא הבא. צלצל בכל הארבעה לפי הסדר והוא יתנודד.'],
      ['M', 'Ring the wrong one and it tolls back at you. And watch that blade sweep.', 'צלצול בפעמון הלא נכון מחזיר עליך צלצול. ותיזהר מהסיבוב של החרב.']
    ],
    post: [
      ['B', 'THE BELL... RINGS TRUE... THE VAULT IS YOURS...', 'הפעמון... מצלצל אמת... הכספת שלך...'],
      ['K', 'The key to the Black Tower. Master left it for us.', 'המפתח למגדל השחור. המורה השאיר אותו בשבילנו.'],
      ['M', "Then it's time. Zero hour.", 'אז הגיע הזמן. שעת האפס.']
    ]
  },
  /* ---------------- CHAPTER 9: ZERO HOUR ---------------- */
  {
    id: '9-1', ch: 8, name: 'BLACK TOWER', theme: 'summit', obj: { t: 'combo', n: 30 },
    pool: { drone: 4, splitter: 2, bomber: 1, phantom: 1, mimic: 1 }, max: 9, rate: .9, elite: .1,
    star: { t: 'parry', n: 8, d: 'Land 8 perfect parries' },
    pre: [
      ['M', 'The tower roof. Their defense grid locks onto anything slow.', 'הגג של המגדל. רשת ההגנה שלהם ננעלת על כל מה שאיטי.'],
      ['M', 'Keep a long combo going to overload it: thirty hits without a break.', 'תחזיק קומבו ארוך כדי להעמיס עליה: שלושים מכות בלי הפסקה.'],
      ['R', 'Thirty. Easy.', 'שלושים. קל.']
    ],
    post: [
      ['M', 'Grid overloaded! The core lift is open.', 'הרשת קרסה! המעלית לליבה פתוחה.'],
      ['P', 'SO THE LITTLE BLADE CAME ALL THE WAY TO MY DOOR.', 'אז הלהב הקטן הגיע עד לדלת שלי.']
    ]
  },
  {
    id: '9-2', ch: 8, name: 'MEMORY LANE', theme: 'summit', obj: { t: 'boss', b: 'warden', chain: ['warden', 'hydra', 'kage'], hp: .5 },
    pool: { drone: 1 }, max: 2, rate: 6,
    star: { t: 'time', n: 210, d: 'Win within 210s' },
    pre: [
      ['P', 'I KEPT EVERY ENEMY YOU EVER BEAT. LET US SEE THEM AGAIN.', 'שמרתי כל אויב שאי פעם ניצחת. בוא נראה אותם שוב.'],
      ['M', 'Copies of old bosses. Weaker, but back to back.', 'העתקים של בוסים ישנים. חלשים יותר, אבל אחד אחרי השני.'],
      ['K', "A copy of me? I'm insulted.", 'העתק שלי? אני נעלב.']
    ],
    post: [
      ['P', 'IMPRESSIVE. COME UP. I AM WAITING AT ZERO HOUR.', 'מרשים. עלה למעלה. אני מחכה בשעת האפס.'],
      ['R', "Good. I'm done with copies.", 'יופי. נמאס לי מהעתקים.']
    ]
  },
  {
    id: '9-3', ch: 8, name: 'KUROGANE PRIME', theme: 'summit', obj: { t: 'boss', b: 'prime' },
    pool: { drone: 1 }, max: 2, rate: 6, final2: true,
    star: { t: 'arms', n: 2, d: 'Break both arm cannons' },
    pre: [
      ['P', 'I BUILT THIS CITY. I UPLOADED MYSELF INTO ITS HEART. I AM KUROGANE.', 'אני בניתי את העיר הזאת. העליתי את עצמי ללב שלה. אני קורוגאנה.'],
      ['M', "That's the founder. Or what's left of him, in a war frame.", 'זה המייסד. או מה שנשאר ממנו, בתוך שלד מלחמה.'],
      ['M', 'Break the arm cannons first. When the clock hands sweep, stay between them.', 'שבור קודם את תותחי הזרועות. כשמחוגי השעון מסתובבים, תישאר ביניהם.'],
      ['R', 'Your clock just ran out.', 'השעון שלך בדיוק נגמר.']
    ],
    post: [
      ['P', 'ZERO... HOUR... THE CITY... WAS MINE...', 'שעת... האפס... העיר... הייתה שלי...'],
      ['M', 'The tower is going dark. Kurogane is finished. For real this time.', 'המגדל כבה. קורוגאנה גמורים. הפעם באמת.'],
      ['K', 'So what now, little brother?', 'אז מה עכשיו, אח קטן?'],
      ['R', 'Now we sleep. Then the city is ours to fix.', 'עכשיו ישנים. ואז העיר שלנו לתקן.']
    ]
  }
);
STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
Object.assign(BOSS_INFO, {
  leviathan: { name: 'LEVIATHAN', sub: 'HARBOR SERPENT MECH', col: '#2fe6c8' },
  benkei: { name: 'BENKEI.SYS', sub: 'MONASTERY GUARDIAN', col: '#ff9a3d' },
  prime: { name: 'KUROGANE PRIME', sub: 'THE FOUNDER, UPLOADED', col: '#ffd700' }
});
CODEX_BOSSES.push('leviathan', 'benkei', 'prime');
const CREDITS_ROLL2 = [
  'OVERDRIVE: CYBER SLASH', '', 'ACT II COMPLETE', '', 'REN — still the last Overdrive ronin', 'MIKA — still buying the coffee',
  'KAGE — finally on the same side', 'KUROGANE PRIME — offline', '', 'The Black Tower goes dark.', 'The harbor lights go green.', '',
  'KUROGANE PRIME HERO UNLOCKED', '', 'Thanks for playing. Again.'
];
