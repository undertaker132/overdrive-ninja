
/* --- MODULE 30: v120.0 ORIGINALS — eight heroes redrawn as our own characters --- */
(function () {
  'use strict';
  // Eight heroes were close copies of famous anime characters (their names, hair, marks and outfits). They are now the
  // original characters of the player's character sheets: new names, new descriptions, and the hair, face and marks to
  // match (no whisker marks, no blindfold, no golden spikes). Unlocks, prices and ids stay the same.
  const NEW = {
    surge: ['COPPER SURGE', 'Swept copper hair with burning tips, a dark combat suit traced in orange and blue neon, and a tail that never stops moving.',
      'נחשול נחושת', 'שיער נחושת מוסט לאחור עם קצוות בוערים, חליפת קרב כהה עם קווי ניאון כתומים וכחולים, וזנב שלא מפסיק לזוז.',
      'اندفاعة النحاس', 'شعر نحاسي ممشط للخلف بأطراف مشتعلة، بدلة قتال داكنة بخطوط نيون برتقالية وزرقاء، وذيل لا يتوقف عن الحركة.',
      'МЕДНЫЙ ПОРЫВ', 'Зачёсанные медные волосы с горящими кончиками, тёмный боевой костюм с оранжевыми и синими неоновыми линиями и хвост, который не знает покоя.'],
    cleaver: ['LANTERN REAPER', 'A shaved head behind a white skull mask, a black robe with a white collar, two spirit lanterns at the hips and a blade as big as a door.',
      'קוצר הפנסים', 'ראש מגולח מאחורי מסכת גולגולת לבנה, גלימה שחורה עם צווארון לבן, שני פנסי רוחות במותניים ולהב גדול כמו דלת.',
      'حاصد الفوانيس', 'رأس حليق خلف قناع جمجمة أبيض، رداء أسود بياقة بيضاء، فانوسا أرواح على الخصر ونصل بحجم باب.',
      'ЖНЕЦ С ФОНАРЯМИ', 'Бритая голова за белой маской-черепом, чёрное одеяние с белым воротником, два фонаря духов на поясе и клинок размером с дверь.'],
    wildhunter: ['FOREST HUNTER', 'A green undercut, armor of living leaves over gold plates and the quiet aura of the deep woods.',
      'צייד היער', 'תספורת ירוקה מגולחת בצדדים, שריון של עלים חיים מעל לוחות זהב והילה שקטה של עומק היער.',
      'صياد الغابة', 'قصة شعر خضراء محلوقة الجانبين، درع من أوراق حية فوق صفائح ذهبية وهالة هادئة من عمق الغابة.',
      'ЛЕСНОЙ ОХОТНИК', 'Зелёный андеркат, доспех из живых листьев поверх золотых пластин и тихая аура лесной чащи.'],
    stormkid: ['VOLT COURIER', 'A silver buzz cut, a violet courier suit traced with lightning, and sparks that jump from the fingertips.',
      'שליח הברק', 'תספורת קצוצה בצבע כסף, חליפת שליח סגולה עם קווי ברק, וניצוצות שקופצים מקצות האצבעות.',
      'ساعي البرق', 'شعر فضي قصير جدًا، بدلة ساعٍ بنفسجية بخطوط برق، وشرارات تقفز من أطراف الأصابع.',
      'ВОЛЬТ-КУРЬЕР', 'Серебристый ёжик, фиолетовый костюм курьера с линиями молний и искры, прыгающие с кончиков пальцев.'],
    foxsage: ['FOXFIRE SAGE', 'A white fox mask, a long black ponytail, an orange robe licked with flame over violet hakama, and tails of foxfire.',
      'חכם אש השועל', 'מסכת שועל לבנה, קוקו שחור ארוך, גלימה כתומה מלוחכת בלהבות מעל מכנסי האקמה סגולים, וזנבות של אש שועלים.',
      'حكيم نار الثعلب', 'قناع ثعلب أبيض، ذيل حصان أسود طويل، رداء برتقالي تلعقه النيران فوق هاكاما بنفسجية، وذيول من نار الثعالب.',
      'МУДРЕЦ ЛИСЬЕГО ОГНЯ', 'Белая лисья маска, длинный чёрный хвост волос, оранжевое одеяние в языках пламени поверх фиолетовых хакама и хвосты из лисьего огня.'],
    veil: ['THIRD-EYE SORCERER', 'Long violet hair, a glowing third eye, a deep-blue robe full of stars and an orb that bends space.',
      'מכשף העין השלישית', 'שיער סגול ארוך, עין שלישית זוהרת, גלימה כחולה עמוקה מלאה כוכבים וכדור שמעקם את המרחב.',
      'ساحر العين الثالثة', 'شعر بنفسجي طويل، عين ثالثة متوهجة، رداء أزرق عميق مليء بالنجوم وكرة تثني الفضاء.',
      'ЧАРОДЕЙ ТРЕТЬЕГО ГЛАЗА', 'Длинные фиолетовые волосы, светящийся третий глаз, тёмно-синее одеяние, полное звёзд, и сфера, искривляющая пространство.'],
    breather: ['TIDE SWORDSMAN', 'Long sea-green braids, a teal robe printed with waves, and water that spirals along the blade.',
      'סייף הגאות', 'צמות ארוכות בירוק ים, גלימה טורקיז מודפסת בגלים, ומים שמסתלסלים לאורך הלהב.',
      'سيّاف المد', 'ضفائر طويلة بلون أخضر البحر، رداء فيروزي مطبوع بالأمواج، وماء يلتف حول النصل.',
      'МЕЧНИК ПРИЛИВА', 'Длинные косы цвета морской волны, бирюзовое одеяние с узором волн и вода, вьющаяся вдоль клинка.'],
    captain: ['NEON SKY CAPTAIN', 'A tricorn hat strung with lights, an eyepatch, a long red coat with gold trim and a grin for every storm.',
      'קפטן השמיים', 'כובע תלת־קרני עם אורות, רטייה על העין, מעיל אדום ארוך עם עיטורי זהב וחיוך לכל סערה.',
      'قبطان السماء', 'قبعة ثلاثية الزوايا مزينة بالأضواء، رقعة عين، معطف أحمر طويل بحواف ذهبية وابتسامة لكل عاصفة.',
      'НЕБЕСНЫЙ КАПИТАН', 'Треуголка с огоньками, повязка на глазу, длинный красный камзол с золотой отделкой и улыбка на любую бурю.']
  };
  try {
    const add = (D, a, b) => { try { if (D) D[a] = b; } catch (e) { } };
    for (const s of SKINS) { const n = NEW[s.id]; if (!n) continue; s.name = n[0]; s.desc = n[1];
      add(typeof HE !== 'undefined' && HE, n[0], n[2]); add(typeof HE !== 'undefined' && HE, n[1], n[3]);
      add(typeof AR !== 'undefined' && AR, n[0], n[4]); add(typeof AR !== 'undefined' && AR, n[1], n[5]);
      add(typeof RU !== 'undefined' && RU, n[0], n[6]); add(typeof RU !== 'undefined' && RU, n[1], n[7]);
      add(window.__DICT_AR, n[0], n[4]); add(window.__DICT_AR, n[1], n[5]); add(window.__DICT_RU, n[0], n[6]); add(window.__DICT_RU, n[1], n[7]); }
  } catch (e) { errLog(e); }
  // the looks of the character sheets: hair, face and marks (the 2D portrait tables and the 3D hair tables)
  try {
    const F = typeof FACE !== 'undefined' ? FACE : null, A = typeof ANIME !== 'undefined' ? ANIME : null;
    const set = (o, v) => { if (o) Object.assign(o, v); };
    if (F) {
      set(F.saiyan, { top: '#1a1f3a', under: '#ff7a1a' }); set(F.saiyan && F.saiyan.hair, { c: '#c8642a', n: 7, len: 44, up: .5, spread: 2.2, glow: '#ff9a3a' });
      set(F.reaper && F.reaper.hair, { c: '#2a2420', n: 4, len: 6, up: 0, spread: 2, bang: 0 });
      set(F.hunter && F.hunter.hair, { c: '#1e9a4a', tip: '#7dff9a', n: 6, len: 40, up: .5, spread: 1.6 });
      set(F.stormkid, { cat: 0, mouth: 'flat', top: '#5a3ad8' }); set(F.stormkid && F.stormkid.hair, { c: '#c8ccd8', n: 8, len: 12, up: 0, spread: 2, bang: 1, fluffy: 0 });
      set(F.foxsage, { whisker: 0, band: 0, top: '#ff7a1a', under: '#4a2a7a' }); set(F.foxsage && F.foxsage.hair, { c: '#141418', n: 6, len: 64, up: .1, spread: 1.6, bang: 1 });
      set(F.veil, { blind: 0, iris: '#9fd0ff', top: '#1a2a6a', under: '#1a2a6a' }); set(F.veil && F.veil.hair, { c: '#3a2a6a', n: 10, len: 72, up: .05, spread: 2.2 });
      set(F.breather, { iris: '#2fb08a', top: '#2fb0a0' }); set(F.breather && F.breather.hair, { c: '#2fb08a', tip: '#7dffd0', n: 8, len: 62, up: .1, spread: 2 });
    }
    if (A) {
      set(A.saiyan, { hair: '#c8642a', up: .6, aura: '#ff7a1a', spikes: 8 }); set(A.reaper, { hair: '#2a2420', spikes: 3, len: 1.2, up: 0 });
      set(A.hunter, { hair: '#1e9a4a', tip: '#7dff9a', up: .6 }); set(A.stormkid, { hair: '#c8ccd8', spikes: 6, up: .1, len: 1.6 });
      set(A.foxsage, { hair: '#141418', band: 0, up: .2, len: 6 }); set(A.veil, { hair: '#3a2a6a', blind: 0, up: .1, len: 6.5 });
      set(A.breather, { hair: '#2fb08a', len: 6, up: .1 });
    }
  } catch (e) { errLog(e); }
})();
