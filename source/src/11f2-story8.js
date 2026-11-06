/* =====================================================================
   STORY ACT VIII — ENCORE (chapter 21, version 35). The Titan Express runs
   again and every old enemy is back for one last show, ending in a boss
   chain: SHOGUN.EXE, KUROGANE PRIME and HYAKKI back to back.
   The stages go in before the SECRETS stages, so a player who finished
   act VII finds chapter 21 open (the unlock index points at it).
   ===================================================================== */
CHAPTERS.push({ n: 21, name: 'ENCORE', sub: 'Every legend, one last time', theme: 'core', lock: 'Finish chapter 20 to unlock chapter 21' });
{
  const CH = CHAPTERS.length - 1, ENC = [
    { id: '21-1', ch: CH, name: 'REWIND', theme: 'maglev', obj: { t: 'kill', n: 50 },
      pool: { drone: 3, sniper: 2, brute: 1.5, bomber: 1.5, weaver: 1 }, max: 9, rate: .8, traps: { turrets: 1 },
      star: { t: 'combo', n: 40, d: 'Reach a x40 combo' },
      pre: [['M', 'Ren, the Titan Express is running again. Same train, same roof, but every car is full of old enemies.', 'רן, הטיטאן אקספרס נוסע שוב. אותה רכבת, אותו גג, אבל כל קרון מלא באויבים ישנים.'],
            ['R', 'Then it is an encore. Let us give them one.', 'אז זה הדרן. בוא ניתן להם אחד.']],
      post: [['K', 'Someone is replaying our whole war, piece by piece.', 'מישהו משחזר את כל המלחמה שלנו, חתיכה אחרי חתיכה.']] },
    { id: '21-2', ch: CH, name: 'MIRROR GARDEN', theme: 'sakura', obj: { t: 'reflect', n: 16 },
      pool: { sniper: 3, weaver: 2, mirror: 1.5, phantom: 1 }, max: 8, rate: .85,
      star: { t: 'parry', n: 16, d: 'Land 16 perfect parries' },
      pre: [['M', 'A garden of mirrors and cherry trees. The snipers here only miss on purpose.', 'גן של מראות ועצי דובדבן. הצלפים כאן מחטיאים רק בכוונה.'],
            ['R', 'Then I send every shot home.', 'אז אני מחזיר כל ירייה הביתה.']],
      post: [['M', 'The mirrors are showing a face. It looks like you, only older.', 'המראות מראות פנים. זה נראה כמוך, רק מבוגר יותר.']] },
    { id: '21-3', ch: CH, name: 'LAST LIGHTS', theme: 'undercity', obj: { t: 'survive', s: 80 }, mod: { dark: 1 },
      pool: { phantom: 3, mimic: 2, drone: 2, splitter: 2, wraith: .5 }, max: 9, rate: .8,
      star: { t: 'combo', n: 30, d: 'Reach a x30 combo' },
      pre: [['K', 'The city is turning its lights off, block by block. Stay alive until the last one comes back.', 'העיר מכבה את האורות שלה, בלוק אחרי בלוק. תישאר בחיים עד שהאחרון יחזור.'],
            ['R', 'I have fought in the dark before.', 'כבר נלחמתי בחושך.']],
      post: [['M', 'Signal found. Every boss you ever beat is waiting on one roof.', 'נמצא אות. כל בוס שאי פעם ניצחת מחכה על גג אחד.']] },
    { id: '21-4', ch: CH, name: 'ENCORE', theme: 'core', obj: { t: 'boss', b: 'shogun', chain: ['shogun', 'prime', 'hyakki'], hp: .5 },
      pool: { drone: 1.5, phantom: .5 }, max: 3, rate: 4,
      star: { t: 'time', n: 300, d: 'Win within 300s' },
      pre: [['M', 'Shogun, Kurogane Prime and the Night Parade. Back to back. This is the encore, Ren.', 'שוגון, קורוגאנה פריים ותהלוכת הלילה. ברצף. זה ההדרן, רן.'],
            ['R', 'Then let the curtain fall.', 'אז שהמסך ירד.']],
      post: [['M', 'That was the last bow. Neo-Edo is quiet. Thank you, Ren.', 'זו הייתה הקידה האחרונה. ניאו־אדו שקטה. תודה, רן.'],
             ['R', 'Thank you for watching.', 'תודה שצפיתם.']] }
  ];
  const at = STAGES.findIndex(s => s.secret); STAGES.splice(at < 0 ? STAGES.length : at, 0, ...ENC);
  STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
}
/* ---------------- CHAPTER 22: AFTERGLOW (version 36) ----------------
   After the encore the storm comes back: RAIJIN, REN.NULL and IZANAMI return as one last chain. */
CHAPTERS.push({ n: 22, name: 'AFTERGLOW', sub: 'The storm after the show', theme: 'storm', lock: 'Finish chapter 21 to unlock chapter 22' });
{
  const CH = CHAPTERS.length - 1, AG = [
    { id: '22-1', ch: CH, name: 'STATIC SKY', theme: 'storm', obj: { t: 'kill', n: 55 }, mod: { storm: 1 },
      pool: { drone: 3, weaver: 2, bomber: 2, sniper: 1.5, splitter: 1 }, max: 9, rate: .78,
      star: { t: 'combo', n: 45, d: 'Reach a x45 combo' },
      pre: [['M', 'Ren, the sky over the tower is full of static again. The storm never really left.', 'רן, השמיים מעל המגדל שוב מלאים בחשמל סטטי. הסערה אף פעם לא באמת עזבה.'],
            ['R', 'Then we finish what the storm started.', 'אז נסיים את מה שהסערה התחילה.']],
      post: [['M', 'Lightning is striking the same roof again and again. Something is calling it.', 'ברקים פוגעים באותו גג שוב ושוב. משהו קורא להם.']] },
    { id: '22-2', ch: CH, name: 'GLASS RAIN', theme: 'winter', obj: { t: 'reflect', n: 18 },
      pool: { sniper: 3, mirror: 2, weaver: 1.5, wraith: .4 }, max: 8, rate: .82,
      star: { t: 'parry', n: 18, d: 'Land 18 perfect parries' },
      pre: [['K', 'The rain is freezing in the air. Every drop is a mirror.', 'הגשם קופא באוויר. כל טיפה היא מראה.'],
            ['R', 'Mirrors only show what is already there.', 'מראות מראות רק את מה שכבר שם.']],
      post: [['K', 'I saw my own face in the ice. It was smiling.', 'ראיתי את הפנים שלי בקרח. הן חייכו.']] },
    { id: '22-3', ch: CH, name: 'THE LAST TRAIN', theme: 'maglev', obj: { t: 'survive', s: 85 },
      pool: { brute: 2, phantom: 2, drone: 3, medic: 1, enforcer: .3 }, max: 10, rate: .76, traps: { turrets: 1, barrels: 1 },
      star: { t: 'combo', n: 35, d: 'Reach a x35 combo' },
      pre: [['M', 'The Titan Express is making one last run to the storm. Hold the roof until it gets there.', 'הטיטאן אקספרס יוצא לנסיעה אחרונה אל הסערה. תחזיק את הגג עד שהוא יגיע.']],
      post: [['M', 'Three signals at the end of the line. You know all of them.', 'שלושה אותות בסוף הקו. אתה מכיר את כולם.']] },
    { id: '22-4', ch: CH, name: 'AFTERGLOW', theme: 'storm', obj: { t: 'boss', b: 'raijin', chain: ['raijin', 'renull', 'izanami'], hp: .55 },
      pool: { drone: 1.5, weaver: .5 }, max: 3, rate: 4,
      star: { t: 'time', n: 320, d: 'Win within 320s' },
      pre: [['M', 'Raijin, your own data and the first code. All of them, one after another.', 'ראיג׳ין, הנתונים שלך והקוד הראשון. כולם, אחד אחרי השני.'],
            ['R', 'After the storm, the sky is always clearest.', 'אחרי הסערה, השמיים תמיד הכי בהירים.']],
      post: [['M', 'The storm is gone. The whole city is glowing in the afterlight.', 'הסערה נעלמה. כל העיר זוהרת באור שאחרי.'],
             ['K', 'Rest, Ren. You earned the morning.', 'תנוח, רן. הרווחת את הבוקר.']] }
  ];
  const at = STAGES.findIndex(s => s.secret); STAGES.splice(at < 0 ? STAGES.length : at, 0, ...AG);
  STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
}
function exActStars(i) { const A = EX_ACTS[i], st = Store.data.story.stars; return STAGES.every(s => A.ch.indexOf(s.ch) < 0 || (st[s.id] | 0) >= 3); }
function stageOpen(idx) { const s = STAGES[idx]; if (!s) return false; if (s.secret) return exActStars(s.secret - 1); return idx <= Store.data.story.unlocked; }
const CREDITS_ROLL7 = [
  'OVERDRIVE: CYBER SLASH', '', 'ACT VII COMPLETE', '', 'REN — the last cut of the night', 'MIKA — every lantern', 'KAGE — who remembered them', 'HYAKKI — at peace', '',
  'The parade fades into the morning.', 'Every forgotten name is remembered.', '', 'LANTERN ONI HERO UNLOCKED', '', 'Seven acts. Thank you for playing.'
];
