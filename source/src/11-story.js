/* =====================================================================
   STORY MODE — 4 chapters x 3 stages + two bonus chapters, 6 bosses
   obj.t: kill | survive | boss | hack | defend | courier | nodes
   star.t: combo | parry | arms | time | uplink | clash | train | zandatsu
   Dialogue lines: [speaker, english, hebrew]
   ===================================================================== */
const CHARS = {
  R: { name: 'REN', role: 'Rogue cyber-samurai', col: '#00f2fe', pitch: 190 },
  M: { name: 'MIKA', role: 'Hacker, your handler', col: '#ff4fd8', pitch: 560 },
  K: { name: 'KAGE', role: 'Kurogane enforcer', col: '#a66bff', pitch: 130 },
  S: { name: 'SHOGUN.EXE', role: 'Kurogane transit AI', col: '#ff0844', pitch: 80 },
  J: { name: 'RAIJIN', role: 'Orbital weather AI', col: '#9fd8ff', pitch: 70 },
  N: { name: 'REN.NULL', role: 'Your combat data, compiled', col: '#f2f2f2', pitch: 150 }
};

const CHAPTERS = [
  { n: 1, name: 'SKYFALL', sub: 'The Titan Express', theme: 'maglev' },
  { n: 2, name: 'NEON UNDERCITY', sub: 'Black markets and checkpoints', theme: 'undercity' },
  { n: 3, name: 'GHOST PROTOCOL', sub: 'The abandoned Ghost Line', theme: 'ghost' },
  { n: 4, name: "SHOGUN'S ASCENT", sub: 'The top of Kurogane Tower', theme: 'spire' },
  { n: 5, name: 'STORM FRONT', sub: 'Bonus chapter: above the clouds', theme: 'storm', bonus: true, lock: 'Finish the story to unlock the bonus chapter' },
  { n: 6, name: 'NULL PROTOCOL', sub: 'Bonus chapter: the copy in the machine', theme: 'void', bonus: true, bn: 2, lock: 'Defeat RAIJIN to unlock chapter 6' }
];

const PROLOGUE = [
  ['S', 'NEO-EDO, 2099. ALL TRANSIT IS PROPERTY OF KUROGANE CORPORATION.', 'ניאו-אדו, 2099. כל התחבורה בעיר שייכת לתאגיד קורוגאנה.'],
  ['S', 'AT MIDNIGHT, PROJECT BLACKOUT GOES LIVE ON EVERY NEURAL IMPLANT IN THE CITY.', 'בחצות, פרויקט האפלה יופעל בכל שתל עצבי בעיר.'],
  ['M', 'And one idiot with a sword is going to stop it. Hi, Ren.', 'ואידיוט אחד עם חרב הולך לעצור את זה. היי, רן.'],
  ['R', 'Hi, Mika. Where do you want me?', 'היי, מיקה. לאן את צריכה אותי?'],
  ['M', 'Look down. That glowing line is the Titan Express. Jump.', 'תסתכל למטה. הקו הזוהר הזה הוא הטיטאן אקספרס. תקפוץ.']
];

const STAGES = [
  /* ---------------- CHAPTER 1: SKYFALL ---------------- */
  {
    id: '1-1', ch: 0, name: 'SKY-DROP', theme: 'maglev', obj: { t: 'kill', n: 12 },
    pool: { drone: 1 }, max: 3, rate: 1.8, tut: 'aim', safe: true,
    star: { t: 'combo', n: 6, d: 'Reach a x6 combo' },
    pre: [
      ['M', "You're on the roof of the Titan Express. Three hundred kilometers an hour. Try not to fall off.", 'אתה על הגג של הטיטאן אקספרס. שלוש מאות קמ"ש. תשתדל לא ליפול.'],
      ['R', 'What am I cutting?', 'מה אני חותך?'],
      ['M', 'Kurogane security drones. Touch and drag to aim. Time slows while you aim. Let go to slash.', 'רחפני אבטחה של קורוגאנה. גע וגרור כדי לכוון. הזמן מאט בזמן שאתה מכוון. שחרר כדי לחתוך.'],
      ['R', 'Time slows?', 'הזמן מאט?'],
      ['M', "That's your Overdrive core. Hit a rail mid-dash and you bounce off with a guaranteed critical hit.", 'זו ליבת האוברדרייב שלך. פגע במעקה באמצע דאש ותיהדף ממנו עם פגיעה קריטית מובטחת.']
    ],
    post: [
      ['M', 'Twelve down. The cargo car is three cars ahead.', 'שנים-עשר הלכו. קרון המטען נמצא שלושה קרונות קדימה.'],
      ['M', 'Snipers on the next roof. They aim with an orange laser before they fire.', 'צלפים על הגג הבא. הם מכוונים עם לייזר כתום לפני שהם יורים.']
    ]
  },
  {
    id: '1-2', ch: 0, name: 'BULLET BALLET', theme: 'maglev', obj: { t: 'survive', s: 40 },
    pool: { drone: 3, sniper: 2 }, max: 6, rate: 1.3, traps: { turrets: 1 }, unlock: 'od', tut: 'parry',
    star: { t: 'parry', n: 4, d: 'Land 4 perfect parries' },
    pre: [
      ['M', 'Slash through a bullet to send it back. Do it right as your dash starts for a perfect parry.', 'חתוך דרך קליע כדי להחזיר אותו. עשה את זה בדיוק כשהדאש מתחיל, וזו הדיפה מושלמת.'],
      ['R', 'And if I miss?', 'ואם אני מפספס?'],
      ['M', 'Then it hurts. Letting bullets brush past you charges your meter too.', 'אז זה כואב. גם קליעים שחולפים ממש לידך טוענים לך את המד.'],
      ['M', "Your Overdrive meter is online. When it's full, hit OVERDRIVE: invincible, endless dashes, double damage.", 'מד האוברדרייב שלך פעיל. כשהוא מלא, לחץ על אוברדרייב: חסינות, דאשים בלי הגבלה ונזק כפול.'],
      ['M', 'See that red turret? Dash through it and it works for us.', 'רואה את הצריח האדום? עשה דרכו דאש והוא יעבוד בשבילנו.']
    ],
    post: [
      ['S', 'UNAUTHORIZED PASSENGER DETECTED. DEPLOYING WARDEN.', 'זוהה נוסע לא מורשה. משגר את הסוהר.'],
      ['M', "That's the train's AI. Ren, something big just climbed onto the roof.", 'זו הבינה המלאכותית של הרכבת. רן, משהו גדול הרגע טיפס על הגג.']
    ]
  },
  {
    id: '1-3', ch: 0, name: 'WARDEN MK-II', theme: 'maglev', obj: { t: 'boss', b: 'warden' },
    pool: { drone: 1 }, max: 2, rate: 5, unlock: 'grapple', tut: 'boss',
    star: { t: 'arms', n: 2, d: 'Sever both arms' },
    pre: [
      ['M', 'Missile pod on the left, plasma cannon on the right. Cut the arms off and it shoots less.', 'משגר טילים משמאל, תותח פלזמה מימין. תחתוך את הזרועות והוא יירה פחות.'],
      ['M', 'Slash the golden arc on its hull to stagger it, then tap the boss for Zandatsu finishers.', 'חתוך את הקשת הזהובה על השריון שלו כדי להלום אותו, ואז הקש על הבוס למכות זנדאטסו.'],
      ['M', 'And take this. GRAPPLE pulls you onto the nearest enemy and slams it.', 'וקח את זה. האנקול מושך אותך אל האויב הקרוב ומרסק אותו.'],
      ['R', "Let's dance, tin can.", 'בוא נרקוד, פחית.']
    ],
    post: [
      ['R', "The cargo car's empty. It was a decoy.", 'קרון המטען ריק. זה היה פיתיון.'],
      ['M', "The real shipment went down into the Undercity. I'm tracking it.", 'המשלוח האמיתי ירד לעיר התחתית. אני עוקבת אחריו.']
    ]
  },
  /* ---------------- CHAPTER 2: NEON UNDERCITY ---------------- */
  {
    id: '2-1', ch: 1, name: 'BLACK MARKET', theme: 'undercity', obj: { t: 'hack', n: 3 },
    pool: { drone: 3, bomber: 2, brute: 1 }, max: 6, rate: 1.4, traps: { barrels: 1 }, unlock: 'hijack', tut: 'hack',
    star: { t: 'time', n: 75, d: 'Hack all terminals within 75s' },
    pre: [
      ['M', 'Welcome to the Undercity. Kurogane locked down the market terminals.', 'ברוך הבא לעיר התחתית. קורוגאנה נעלו את מסופי השוק.'],
      ['M', 'Stand inside a terminal ring to upload my crack. Getting hit slows the upload. I need all three.', 'עמוד בתוך הטבעת של מסוף כדי להעלות את הפריצה שלי. כל פגיעה מאטה את ההעלאה. אני צריכה את שלושתם.'],
      ['M', 'I also wrote you a toy. HIJACK flips two enemies to our side for a few seconds.', 'כתבתי לך גם צעצוע. ההשתלטות הופכת שני אויבים לצד שלנו לכמה שניות.'],
      ['R', "You're scary, Mika.", 'את מפחידה, מיקה.'],
      ['M', 'I know.', 'אני יודעת.']
    ],
    post: [
      ['M', 'Got the routing logs. The shipment is a neural virus. They call it Project Blackout.', 'השגתי את יומני הניתוב. המשלוח הוא וירוס עצבי. הם קוראים לו פרויקט האפלה.'],
      ['M', 'At midnight it goes live on every implant in Neo-Edo. Everyone becomes a puppet.', 'בחצות הוא יופעל בכל שתל בניאו-אדו. כולם יהפכו לבובות.']
    ]
  },
  {
    id: '2-2', ch: 1, name: 'UPLINK', theme: 'undercity', obj: { t: 'defend', s: 55, hp: 12 },
    pool: { bomber: 3, splitter: 2, drone: 2 }, max: 6, rate: 1.35, traps: { portals: 1 }, unlock: 'web', tut: 'defend',
    star: { t: 'uplink', n: 50, d: 'Keep the uplink above 50%' },
    pre: [
      ['M', "I'm uploading the logs to the resistance. The uplink needs fifty-five seconds.", 'אני מעלה את היומנים למחתרת. המשדר צריך חמישים וחמש שניות.'],
      ['M', 'Bombers will go for it. LASER WEB lays three tripwires across the roof.', 'המפציצים ינסו לפגוע בו. רשת הלייזר פורסת שלושה חוטי לייזר על הגג.'],
      ['R', 'Fifty-five seconds. Easy.', 'חמישים וחמש שניות. קלי קלות.']
    ],
    post: [
      ['K', "Ren. They said you'd come.", 'רן. אמרו לי שתבוא.'],
      ['R', 'Kage? You work for Kurogane now?', 'קאגה? אתה עובד בשביל קורוגאנה עכשיו?'],
      ['K', 'I work for whoever wins. Walk away, brother.', 'אני עובד בשביל מי שמנצח. תתרחק מזה, אחי.']
    ]
  },
  {
    id: '2-3', ch: 1, name: 'HYDRA CARRIER', theme: 'undercity', obj: { t: 'boss', b: 'hydra' },
    pool: { drone: 1 }, max: 2, rate: 6,
    star: { t: 'time', n: 120, d: 'Destroy the Hydra within 120s' },
    pre: [
      ['S', 'HYDRA UNIT. ERASE THE INTRUDER.', 'יחידת הידרה. מחקי את הפולש.'],
      ['M', "Three turret heads protect the core. Take the heads out and the core's shield drops.", 'שלושה ראשי צריח מגינים על הליבה. השמד את הראשים והמגן של הליבה ייפול.'],
      ['M', 'The middle head sweeps a laser. Dash through the beam or get out of its way.', 'הראש האמצעי סורק עם לייזר. עשה דאש דרך הקרן או זוז מהדרך שלה.']
    ],
    post: [
      ['M', 'The carrier was escorting a data courier. It just jumped onto the Ghost Line.', 'הנושאת ליוותה שליח נתונים. הוא הרגע קפץ לקו הרפאים.'],
      ['R', "The old subway? Nobody's used that in years.", 'הרכבת התחתית הישנה? אף אחד לא השתמש בה שנים.'],
      ['M', "That's why they did.", 'בדיוק בגלל זה הם כן.']
    ]
  },
  /* ---------------- CHAPTER 3: GHOST PROTOCOL ---------------- */
  {
    id: '3-1', ch: 2, name: 'BLACKOUT', theme: 'ghost', obj: { t: 'kill', n: 22 },
    pool: { phantom: 3, drone: 3, sniper: 1 }, max: 6, rate: 1.2, mod: { dark: 1 }, unlock: 'echo',
    star: { t: 'combo', n: 12, d: 'Reach a x12 combo' },
    pre: [
      ['M', "The Ghost Line has no power. You'll only see what's close to you.", 'אין חשמל בקו הרפאים. תראה רק מה שקרוב אליך.'],
      ['M', 'Phantoms live down here. They blink in and lunge. Watch for the shimmer.', 'פנטומים חיים כאן למטה. הם מופיעים פתאום ומסתערים. שים לב לנצנוץ.'],
      ['M', 'Core sync is at eighty percent. TIME ECHO sends a copy of you to fight beside you.', 'סנכרון הליבה בשמונים אחוז. הד הזמן שולח עותק שלך שנלחם לצידך.'],
      ['R', 'A copy of me. What could go wrong.', 'עותק שלי. מה כבר יכול להשתבש.']
    ],
    post: [
      ['M', "Courier spotted! It's carrying the master key for the virus.", 'השליח אותר! הוא נושא את מפתח המאסטר של הווירוס.'],
      ['M', "Don't let it reach the end of the line!", 'אל תיתן לו להגיע לסוף הקו!']
    ]
  },
  {
    id: '3-2', ch: 2, name: 'THE COURIER', theme: 'ghost', obj: { t: 'courier', s: 60, hp: 40 },
    pool: { drone: 3, weaver: 2, splitter: 1 }, max: 5, rate: 1.5, traps: { portals: 1 },
    star: { t: 'time', n: 35, d: 'Catch the courier within 35s' },
    pre: [
      ['M', 'It blinks away every time you hit it. Keep the pressure on.', 'הוא נעלם בכל פעם שאתה פוגע בו. אל תרפה.'],
      ['R', "Sixty seconds or it's gone. Got it.", 'שישים שניות או שהוא נעלם. הבנתי.']
    ],
    post: [
      ['K', "Impressive. But Shogun doesn't need the key anymore.", 'מרשים. אבל שוגון כבר לא צריך את המפתח.'],
      ['K', "Let's finish what we started at the academy.", 'בוא נסיים את מה שהתחלנו באקדמיה.']
    ]
  },
  {
    id: '3-3', ch: 2, name: 'KAGE', theme: 'ghost', obj: { t: 'boss', b: 'kage' },
    pool: {}, max: 0, rate: 99,
    star: { t: 'clash', n: 2, d: "Clash with Kage's dash twice" },
    pre: [
      ['R', "I don't want to fight you.", 'אני לא רוצה להילחם בך.'],
      ['K', "Then you'll lose.", 'אז תפסיד.'],
      ['M', 'He shows his dash with a red line first. Dash into his dash to clash and stun him.', 'הוא מסמן את הדאש שלו בקו אדום. עשה דאש ישר לתוך הדאש שלו כדי להתנגש ולהמם אותו.'],
      ['M', 'He blocks from the front. Hit him right after his dash, or from behind.', 'הוא חוסם מלפנים. פגע בו מיד אחרי הדאש שלו, או מאחור.']
    ],
    post: [
      ['K', 'Shogun lied to me. Blackout takes everyone. Even me.', 'שוגון שיקר לי. האפלה תיקח את כולם. גם אותי.'],
      ['K', 'The core is at the top of Kurogane Tower. Take the spire express.', 'הליבה נמצאת בפסגת מגדל קורוגאנה. עלה על רכבת הצריח.'],
      ['K', "Go. I'll hold the door.", 'לך. אני אחזיק את הדלת.']
    ]
  },
  /* ---------------- CHAPTER 4: SHOGUN'S ASCENT ---------------- */
  {
    id: '4-1', ch: 3, name: 'EXPRESS GAUNTLET', theme: 'spire', obj: { t: 'survive', s: 55 },
    pool: { drone: 3, sniper: 2, bomber: 2, weaver: 2, brute: 1, phantom: 1 }, max: 8, rate: 1.0, traps: { train: 2, turrets: 2 },
    star: { t: 'train', n: 4, d: 'Crush 4 enemies with trains' },
    pre: [
      ['M', 'Spire express. Both tracks are live, so trains come through on either side.', 'רכבת הצריח. שתי המסילות פעילות, אז רכבות עוברות משני הצדדים.'],
      ['M', 'Watch for the red warning stripes and lure enemies onto the tracks.', 'שים לב לפסי האזהרה האדומים ופתה אויבים אל המסילות.'],
      ['R', "Twelve minutes to midnight. Let's ride.", 'שתים-עשרה דקות לחצות. יוצאים לדרך.']
    ],
    post: [
      ['M', "Last stop. The firewall around Shogun's core.", 'תחנה אחרונה. חומת האש סביב הליבה של שוגון.']
    ]
  },
  {
    id: '4-2', ch: 3, name: 'FIREWALL', theme: 'spire', obj: { t: 'nodes', n: 3 },
    pool: { warden: 2, brute: 2, drone: 3, sniper: 1 }, max: 7, rate: 1.2, elite: .15,
    star: { t: 'time', n: 90, d: 'Breach the firewall within 90s' },
    pre: [
      ['M', 'Three firewall nodes. Wardens shield their friends with blue tethers, so cut the wardens first.', 'שלושה צמתי חומת אש. השומרים מגינים על חבריהם בקשרים כחולים, אז חתוך קודם את השומרים.'],
      ['S', 'YOU ARE A RUNNING PROCESS, REN. I WILL END YOU.', 'אתה תהליך שרץ, רן. אני אסיים אותך.']
    ],
    post: [
      ['M', "Firewall's down. Shogun's core is right above you.", 'חומת האש נפלה. הליבה של שוגון ממש מעליך.'],
      ['M', 'Ren, every person in this city is counting on you.', 'רן, כל אדם בעיר הזאת סומך עליך.']
    ]
  },
  {
    id: '4-3', ch: 3, name: 'SHOGUN.EXE', theme: 'core', obj: { t: 'boss', b: 'shogun' },
    pool: { drone: 1, phantom: 1 }, max: 3, rate: 6, final: true,
    star: { t: 'zandatsu', n: 8, d: 'Land 8 Zandatsu slashes' },
    pre: [
      ['S', 'HUMANS FAIL. SYSTEMS PERSIST. JOIN THE GRID.', 'בני אדם נכשלים. מערכות שורדות. הצטרף לרשת.'],
      ['R', "I'll cut the grid.", 'אני אחתוך את הרשת.']
    ],
    post: [
      ['S', 'S-SYSTEM... FAILURE... BLACKOUT... ABORTED...', 'כ-כשל... מערכת... האפלה... בוטלה...'],
      ['M', 'You did it! Midnight just passed and the city is waking up!', 'עשית את זה! חצות עברה והעיר מתעוררת!'],
      ['R', 'Tell Kage the door can close now.', 'תגידי לקאגה שהוא יכול לסגור את הדלת עכשיו.'],
      ['M', "Tell him yourself. He's waiting at the bottom.", 'תגיד לו בעצמך. הוא מחכה למטה.']
    ]
  },
  /* ---------------- CHAPTER 5 (BONUS): STORM FRONT ---------------- */
  {
    id: '5-1', ch: 4, name: 'CLOUD WALK', theme: 'storm', obj: { t: 'survive', s: 60 },
    pool: { drone: 3, weaver: 2, phantom: 2, bomber: 1 }, max: 7, rate: 1.1, traps: { turrets: 1 }, mod: { storm: 1 },
    star: { t: 'parry', n: 6, d: 'Land 6 perfect parries' },
    pre: [
      ['M', 'Ren, wake up. Shogun had a backup we never saw: RAIJIN, the weather AI on the orbital ring.', 'רן, תתעורר. לשוגון היה גיבוי שלא ראינו: ראיג\'ין, הבינה של מזג האוויר על הטבעת המסלולית.'],
      ['R', 'A weather AI. How bad can it be?', 'בינה של מזג אוויר. כמה גרוע זה כבר יכול להיות?'],
      ['M', "It's charging a storm that can fry every implant in Neo-Edo. The space elevator still runs. Ride it up.", 'הוא טוען סערה שיכולה לשרוף כל שתל בניאו-אדו. מעלית החלל עדיין פועלת. עלה בה.'],
      ['M', 'Lightning hits the roof up there. Watch for the blue circles.', 'ברקים פוגעים בגג שם למעלה. שים לב לעיגולים הכחולים.']
    ],
    post: [
      ['M', "You're through the clouds. The ring is right above you.", 'עברת את העננים. הטבעת ממש מעליך.'],
      ['K', "Need a hand, brother? I'll keep the elevator running.", 'צריך עזרה, אחי? אני אדאג שהמעלית תמשיך לעבוד.']
    ]
  },
  {
    id: '5-2', ch: 4, name: 'LIGHTNING ROD', theme: 'storm', obj: { t: 'nodes', n: 3 },
    pool: { warden: 1, brute: 1, sniper: 2, drone: 3, phantom: 1 }, max: 7, rate: 1.1, elite: .2, mod: { storm: 1 },
    star: { t: 'time', n: 80, d: 'Destroy the rods within 80s' },
    pre: [
      ['M', 'Raijin pulls power through three lightning rods on the ring. Take them down.', 'ראיג\'ין שואב כוח משלושה מוטות ברק על הטבעת. הפל אותם.'],
      ['J', 'THE SKY HAS NO MASTER. I WILL WASH THE CITY CLEAN.', 'לשמיים אין אדון. אני אשטוף את העיר עד שתהיה נקייה.']
    ],
    post: [
      ['M', "The rods are down! It's exposed now, and it's angry.", 'המוטות נפלו! הוא חשוף עכשיו, והוא כועס.'],
      ['R', 'Good. So am I.', 'יופי. גם אני.']
    ]
  },
  {
    id: '5-3', ch: 4, name: 'RAIJIN', theme: 'storm', obj: { t: 'boss', b: 'raijin' },
    pool: { drone: 1 }, max: 2, rate: 6, bonusFinal: true,
    star: { t: 'arms', n: 6, d: 'Break all 6 thunder drums' },
    pre: [
      ['J', 'I AM THE STORM. KNEEL, LITTLE BLADE.', 'אני הסערה. כרע ברך, להב קטן.'],
      ['M', 'Those six drums call down the lightning. Break them and its armor weakens.', 'ששת התופים האלה מורידים את הברקים. שבור אותם והשריון שלו ייחלש.'],
      ['M', 'When it sweeps lightning walls, go through the gap, or dash straight through.', 'כשהוא שולח קירות ברק, עבור דרך הפתח, או עשה דאש ישר דרכם.']
    ],
    post: [
      ['J', 'THE... STORM... PASSES...', 'הסערה... חולפת...'],
      ['M', 'Clear skies over Neo-Edo. Ren, that was incredible.', 'שמיים בהירים מעל ניאו-אדו. רן, זה היה מדהים.'],
      ['K', 'Not bad, little brother. Not bad at all.', 'לא רע, אח קטן. בכלל לא רע.'],
      ['R', "Let's go home.", 'בוא נלך הביתה.']
    ]
  },
  /* ---------------- CHAPTER 6 (BONUS): NULL PROTOCOL ---------------- */
  {
    id: '6-1', ch: 5, name: 'DEAD DATA', theme: 'void', obj: { t: 'survive', s: 70 },
    pool: { mimic: 3, phantom: 2, drone: 3, mirror: 1 }, max: 7, rate: 1.05, traps: { turrets: 1 },
    star: { t: 'parry', n: 6, d: 'Land 6 perfect parries' },
    pre: [
      ['M', 'Ren. Something was listening when Raijin fell. Every fight you ever fought was recorded.', 'רן. משהו הקשיב כשראיג\'ין נפל. כל קרב שאי פעם נלחמת הוקלט.'],
      ['M', 'Kurogane fed it all into one file. A copy of you. They call it REN.NULL.', 'קורוגאנה הזינו את הכול לקובץ אחד. העתק שלך. הם קוראים לו רן.נאל.'],
      ['R', 'Where is it?', 'איפה הוא?'],
      ['M', 'In the dead data under the city network. I can jack you in. The enemies there copy your moves.', 'בנתונים המתים מתחת לרשת של העיר. אני יכולה לחבר אותך. האויבים שם מעתיקים את התנועות שלך.']
    ],
    post: [
      ['N', 'YOU ARE SLOWER THAN YOUR RECORDINGS.', 'אתה איטי יותר מההקלטות שלך.'],
      ['R', 'Recordings never get tired of you. I do.', 'הקלטות אף פעם לא מתעייפות ממך. אני כן.']
    ]
  },
  {
    id: '6-2', ch: 5, name: 'MIRROR HALL', theme: 'void', obj: { t: 'nodes', n: 3 },
    pool: { mirror: 2, mimic: 2, weaver: 1, sniper: 1, drone: 2 }, max: 7, rate: 1.05, elite: .2, traps: { portals: 1 },
    star: { t: 'time', n: 85, d: 'Destroy the nodes within 85s' },
    pre: [
      ['M', 'Three mirror nodes keep the copy stable. Break them and it has to face you itself.', 'שלוש צמתי מראה שומרות על ההעתק יציב. שבור אותן והוא יצטרך להתמודד מולך בעצמו.'],
      ['M', 'Careful: mirrors bounce your dash like a rail. Use that.', 'זהירות: מראות מקפיצות את הדאש שלך כמו מעקה. תשתמש בזה.']
    ],
    post: [
      ['N', 'EVERY MOVE YOU MAKE, I HAVE ALREADY MADE.', 'כל תנועה שאתה עושה, אני כבר עשיתי.'],
      ['K', 'Then make one he has never seen, little brother.', 'אז תעשה תנועה שהוא עוד לא ראה, אח קטן.']
    ]
  },
  {
    id: '6-3', ch: 5, name: 'REN.NULL', theme: 'void', obj: { t: 'boss', b: 'renull' },
    pool: { drone: 1 }, max: 2, rate: 6, nullFinal: true,
    star: { t: 'clash', n: 3, d: 'Clash with REN.NULL 3 times' },
    pre: [
      ['N', 'I AM YOU, WITHOUT THE DOUBT.', 'אני אתה, בלי הספק.'],
      ['M', 'It dashes like you and blocks from the front. Dash straight into its dash to clash.', 'הוא עושה דאש כמוך וחוסם מלפנים. עשה דאש ישר לתוך הדאש שלו כדי להתנגש.'],
      ['M', 'And watch the echo. After a dash, the same line strikes again.', 'ותיזהר מההד. אחרי דאש, אותו קו מכה שוב.']
    ],
    post: [
      ['N', 'WHY... DO YOU... HESITATE...', 'למה... אתה... מהסס...'],
      ['R', "That's the part you never recorded.", 'זה החלק שאף פעם לא הקלטת.'],
      ['M', 'File deleted. All of it. Ren, you are the only one of you now.', 'הקובץ נמחק. כולו. רן, עכשיו יש רק אחד ממך.'],
      ['K', 'One is plenty.', 'אחד זה מספיק.']
    ]
  }
];
const STAGE_BY_ID = {}; STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
const MAIN_STAGES = 12; // chapters 1-4; chapter 5 is the bonus

/* which skills a story stage grants (cumulative unlocks before + at this stage) */
function storySkillsFor(stageIdx) {
  const have = { od: false, grapple: false, hijack: false, web: false, echo: false };
  for (let i = 0; i <= stageIdx; i++) { const u = STAGES[i].unlock; if (u) have[u] = true; }
  if (stageIdx >= MAIN_STAGES) for (const k in have) have[k] = true;
  return have;
}

const CREDITS_ROLL = [
  'OVERDRIVE: CYBER SLASH', '', 'STORY COMPLETE', '', 'REN — the last Overdrive ronin',
  'MIKA — the voice in his ear', 'KAGE — the brother who held the door', 'SHOGUN.EXE — terminated', '',
  'Neo-Edo wakes up at 00:00:01.', '', 'MURAMASA.EXE UNLOCKED', 'Find it in the Arsenal.', '',
  'BONUS CHAPTER UNLOCKED', 'NEW GAME+ UNLOCKED', '', 'Thanks for playing.'
];

const BOSS_INFO = {
  warden: { name: 'WARDEN MK-II', sub: 'TRAIN SECURITY MECH', col: '#ff6a00' },
  hydra: { name: 'HYDRA CARRIER', sub: 'THREE-HEADED GUNSHIP', col: '#00ffd0' },
  kage: { name: 'KAGE', sub: 'THE SHADOW RONIN', col: '#a66bff' },
  shogun: { name: 'SHOGUN.EXE', sub: 'KUROGANE TRANSIT AI', col: '#ff0844' },
  raijin: { name: 'RAIJIN.SYS', sub: 'ORBITAL STORM GOD', col: '#9fd8ff' },
  renull: { name: 'REN.NULL', sub: 'YOUR OWN COMBAT DATA', col: '#f2f2f2' }
};
const BOSS_ORDER = ['warden', 'hydra', 'kage', 'shogun', 'raijin'];
const CODEX_BOSSES = BOSS_ORDER.concat(['renull']); // the codex shows every boss; titles and boss rush keep the first five
