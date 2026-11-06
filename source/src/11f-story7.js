/* =====================================================================
   STORY ACT VII — THE NIGHT PARADE (chapters 19-20, after IZANAMI).
   When the first code went quiet, every program Kurogane ever deleted
   woke up at once as a yokai and marched through Neo-Edo behind a giant
   lantern ox-cart: HYAKKI, the night parade of a hundred demons.
   Then the SECRET chapter: one EX stage for every act, opened by earning
   all three stars on every stage of that act. EX bosses have 60% more
   health, move faster and throw a ring of shots every few seconds.
   Dialogue lines: [speaker, english, hebrew]
   ===================================================================== */
Object.assign(CHARS, { H: { name: 'HYAKKI', role: 'The night parade', col: '#ff7a1a', pitch: 40 } });
CHAPTERS.push(
  { n: 19, name: 'NIGHT PARADE', sub: 'A hundred demons walk', theme: 'parade', lock: 'Defeat IZANAMI to unlock chapter 19' },
  { n: 20, name: 'THE HOLLOW MOON', sub: 'Where the parade ends', theme: 'hollow', lock: 'Clear stage 19-4 to unlock chapter 20' }
);
STAGES.push(
  /* ---------------- CHAPTER 19: NIGHT PARADE ---------------- */
  {
    id: '19-1', ch: 18, name: 'LANTERN STREET', theme: 'parade', obj: { t: 'kill', n: 46 },
    pool: { phantom: 3, drone: 3, splitter: 2, mimic: 1.5, wraith: .3 }, max: 9, rate: .8, traps: { portals: 1 },
    star: { t: 'combo', n: 35, d: 'Reach a x35 combo' },
    pre: [
      ['M', 'Ren, every street in the old town just lit up with paper lanterns. Nobody hung them.', 'רן, כל רחוב בעיר העתיקה נדלק פתאום בפנסי נייר. אף אחד לא תלה אותם.'],
      ['K', 'And the things carrying them are not people.', 'והדברים שנושאים אותם הם לא אנשים.'],
      ['R', 'Then let us put the lanterns out.', 'אז בוא נכבה את הפנסים.']
    ],
    post: [['M', 'They are deleted programs. Every one Kurogane ever erased. They came back as yokai.', 'אלה תוכנות שנמחקו. כל אחת שקורוגאנה מחק אי פעם. הן חזרו בתור יוקאי.']]
  },
  {
    id: '19-2', ch: 18, name: 'PAPER GHOSTS', theme: 'parade', obj: { t: 'survive', s: 70 }, mod: { dark: 1 },
    pool: { phantom: 3, mimic: 2, mirror: 1, drone: 2, wraith: .5 }, max: 9, rate: .8,
    star: { t: 'parry', n: 10, d: 'Land 10 perfect parries' },
    pre: [
      ['M', 'The lanterns are going dark one by one. Hold on until the street lights come back.', 'הפנסים כבים אחד אחרי השני. תחזיק מעמד עד שאורות הרחוב יחזרו.'],
      ['H', 'WALK WITH US, LITTLE BLADE. EVERYONE WALKS WITH US IN THE END.', 'לך איתנו, להב קטן. כולם הולכים איתנו בסוף.']
    ],
    post: [['K', 'That voice came from the front of the parade. Something huge is leading it.', 'הקול הזה הגיע מראש התהלוכה. משהו ענק מוביל אותה.']]
  },
  {
    id: '19-3', ch: 18, name: 'SHRINE BELLS', theme: 'parade', obj: { t: 'hack', n: 3 },
    pool: { drone: 3, sniper: 2, warden: 1, medic: 1, bomber: 1.5 }, max: 8, rate: .9, traps: { turrets: 1, barrels: 1 },
    star: { t: 'time', n: 95, d: 'Ring all three bells within 95s' },
    pre: [
      ['M', 'Old legends say a shrine bell stops a night parade. Ring all three!', 'אגדות ישנות אומרות שפעמון מקדש עוצר תהלוכת לילה. צלצל בשלושתם!'],
      ['R', 'I like legends that come with a plan.', 'אני אוהב אגדות שמגיעות עם תוכנית.']
    ],
    post: [['M', 'The parade stopped in the street. It is turning toward us.', 'התהלוכה נעצרה ברחוב. היא מסתובבת אלינו.']]
  },
  {
    id: '19-4', ch: 18, name: 'FOX WEDDING', theme: 'parade', obj: { t: 'gauntlet', list: ['wraith', 'enforcer', 'spider'] },
    pool: { drone: 2, phantom: 2, sniper: 1 }, max: 6, rate: 1.1,
    star: { t: 'time', n: 120, d: 'Open all three gates within 120s' },
    pre: [
      ['H', 'A WEDDING PROCESSION GUARDS MY ROAD. THREE GUESTS. THREE GATES.', 'תהלוכת חתונה שומרת על הדרך שלי. שלושה אורחים. שלושה שערים.'],
      ['K', 'A fox wedding in the rain. My grandmother told me never to watch one.', 'חתונת שועלים בגשם. סבתא שלי אמרה לי לעולם לא להסתכל באחת.'],
      ['R', 'I will not watch. I will cut.', 'אני לא אסתכל. אני אחתוך.']
    ],
    post: [['H', 'THEN COME TO THE HOLLOW MOON, WHERE MY PARADE ENDS.', 'אז בוא אל הירח החלול, איפה שהתהלוכה שלי נגמרת.']]
  },
  /* ---------------- CHAPTER 20: THE HOLLOW MOON ---------------- */
  {
    id: '20-1', ch: 19, name: 'MOONLIGHT', theme: 'hollow', obj: { t: 'reflect', n: 14 },
    pool: { sniper: 3, weaver: 2, mirror: 1.5, drone: 1 }, max: 7, rate: .9,
    star: { t: 'parry', n: 14, d: 'Land 14 perfect parries' },
    pre: [
      ['M', 'You are in a sky the parade made. The moon here is empty inside. Their own shots are the only light.', 'אתה בשמיים שהתהלוכה יצרה. הירח כאן ריק מבפנים. היריות שלהם הן האור היחיד.'],
      ['R', 'Then I light the way with them.', 'אז אני אאיר את הדרך בעזרתן.']
    ],
    post: [['K', 'The moon is cracking. There are eyes behind it.', 'הירח נסדק. יש עיניים מאחוריו.']]
  },
  {
    id: '20-2', ch: 19, name: 'HUNDRED EYES', theme: 'hollow', obj: { t: 'nodes', n: 3 },
    pool: { bomber: 2, sniper: 2, miner: 2, phantom: 2 }, max: 8, rate: .85, traps: { barrels: 1 },
    star: { t: 'time', n: 90, d: 'Break the eyes within 90s' },
    pre: [
      ['M', 'Three giant eyes hold the moon together. Break them and the parade has nowhere left to go.', 'שלוש עיניים ענקיות מחזיקות את הירח. תשבור אותן ולתהלוכה לא יישאר לאן ללכת.']
    ],
    post: [['H', 'YOU BREAK MY MOON? THEN I WILL WALK ON YOU.', 'אתה שובר את הירח שלי? אז אני אדרוך עליך.']]
  },
  {
    id: '20-3', ch: 19, name: 'THE LAST LANTERN', theme: 'hollow', obj: { t: 'combo', n: 45 },
    pool: { drone: 4, phantom: 2, splitter: 2, bomber: 1, enforcer: .3 }, max: 10, rate: .7,
    star: { t: 'time', n: 80, d: 'Reach the combo within 80s' },
    pre: [
      ['K', 'Ren, every yokai here was a program someone deleted. Maybe they just wanted to be remembered.', 'רן, כל יוקאי כאן היה תוכנה שמישהו מחק. אולי הם רק רצו שיזכרו אותם.'],
      ['R', 'Then we remember them. And we still end the parade.', 'אז אנחנו נזכור אותם. ועדיין נסיים את התהלוכה.']
    ],
    post: [['M', 'The last lantern is lit. HYAKKI is here.', 'הפנס האחרון דלק. היאקי כאן.']]
  },
  {
    id: '20-4', ch: 19, name: 'HYAKKI', theme: 'hollow', obj: { t: 'boss', b: 'hyakki' },
    pool: { drone: 1 }, max: 2, rate: 6, final7: true,
    star: { t: 'arms', n: 3, d: 'Burn out all three lanterns' },
    pre: [
      ['H', 'I AM EVERY NAME YOU FORGOT. I AM THE PARADE THAT NEVER ENDS.', 'אני כל שם ששכחתם. אני התהלוכה שלא נגמרת לעולם.'],
      ['M', 'Three spirit lanterns feed it. Cut them, and watch the lane it charges down!', 'שלושה פנסי רוח מזינים אותו. חתוך אותם, ושים לב לנתיב שבו הוא מסתער!'],
      ['K', 'Last night of the parade.', 'הלילה האחרון של התהלוכה.'],
      ['R', 'Last cut of the night.', 'החיתוך האחרון של הלילה.']
    ],
    post: [
      ['H', 'THE... PARADE... REMEMBERS...', 'התהלוכה... זוכרת...'],
      ['M', 'The yokai are fading into the morning light. They look... calm.', 'היוקאי נמוגים באור הבוקר. הם נראים... שלווים.'],
      ['K', 'We remembered them. That was all they wanted.', 'זכרנו אותם. זה כל מה שהם רצו.'],
      ['R', 'Sun is up. Ramen is open. Let us go.', 'השמש זרחה. הראמן פתוח. בוא נלך.']
    ]
  }
);
/* ---------------- THE SECRET CHAPTER: one EX boss per act ---------------- */
const EX_ACTS = [ // act, the chapters it holds, its final boss
  { n: 'I', ch: [0, 1, 2, 3], b: 'shogun', th: 'core' }, { n: 'II', ch: [6, 7, 8], b: 'prime', th: 'summit' }, { n: 'III', ch: [9, 10, 11], b: 'genesis', th: 'apex' },
  { n: 'IV', ch: [12, 13], b: 'oryu', th: 'abyss' }, { n: 'V', ch: [14, 15], b: 'tenkai', th: 'starring' }, { n: 'VI', ch: [16, 17], b: 'izanami', th: 'origin' }, { n: 'VII', ch: [18, 19], b: 'hyakki', th: 'hollow' }
];
CHAPTERS.push({ n: 21, name: 'SECRETS', sub: 'EX bosses for the best', theme: 'void', bonus: true, bn: 'EX', secret: true, lock: 'Earn all three stars on every stage of an act to open its EX stage' });
EX_ACTS.forEach((A, i) => STAGES.push({
  id: 'EX-' + (i + 1), ch: 20, name: 'EX ' + A.n, theme: A.th, obj: { t: 'boss', b: A.b }, ex: 1, secret: i + 1,
  pool: { drone: 1.5, phantom: .5 }, max: 3, rate: 4,
  star: { t: 'time', n: 200, d: 'Win within 200s' },
  pre: [['M', 'This is the EX version: more health, faster, and it throws rings of shots. No mercy.', 'זו גרסת ה-EX: יותר חיים, מהירה יותר, והיא זורקת טבעות של יריות. בלי רחמים.']],
  post: [['M', 'EX boss down. You are something else, Ren.', 'בוס EX הובס. אתה משהו אחר, רן.']]
}));
STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
Object.assign(BOSS_INFO, { hyakki: { name: 'HYAKKI', sub: 'THE NIGHT PARADE', col: '#ff7a1a' } });
CODEX_BOSSES.push('hyakki');