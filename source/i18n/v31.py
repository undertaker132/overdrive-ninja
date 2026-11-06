"""Version 30 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('SEE THEM COMING', 'רואים אותם מגיעים', 'تراهم قادمين', 'ВИДНО, КТО ИДЁТ'),
 ('In 3D every new enemy arrives with a beam of light and a ring on the roof, and enemies that enter from outside the car fly in, so you always see where the next one lands.', 'בתלת־ממד כל אויב חדש מגיע עם עמוד אור וטבעת על הגג, ואויבים שנכנסים מחוץ לקרון עפים פנימה, כך שתמיד רואים איפה הבא ינחת.', 'في الأبعاد الثلاثية يصل كل عدو جديد مع شعاع ضوء وحلقة على السطح، والأعداء الذين يدخلون من خارج العربة يطيرون إلى الداخل، فترى دائمًا أين سيهبط التالي.', 'В 3D каждый новый враг появляется со столбом света и кольцом на крыше, а враги, входящие снаружи вагона, влетают внутрь, так что всегда видно, где приземлится следующий.'),
 ('ONE CAR AT A TIME', 'קרון אחד בכל פעם', 'عربة واحدة في كل مرة', 'ПО ОДНОМУ ВАГОНУ'),
 ('The 3D camera shows the car you are fighting on and ends at its front wall: no part of the map you cannot reach is in view any more.', 'מצלמת התלת־ממד מראה את הקרון שעליו נלחמים ונגמרת בקיר הקדמי שלו: כבר לא רואים חלק מהמפה שאי אפשר להגיע אליו.', 'كاميرا الأبعاد الثلاثية تُظهر العربة التي تقاتل عليها وتنتهي عند جدارها الأمامي: لم يعد يظهر أي جزء من الخريطة لا يمكنك الوصول إليه.', '3D-камера показывает вагон, на котором идёт бой, и заканчивается у его передней стенки: недоступной части карты больше не видно.'),
 ('CLEANER 3D', 'תלת־ממד נקי יותר', 'أبعاد ثلاثية أنظف', 'ЧИЩЕ 3D'),
 ('Rings, aim lines, shields and danger zones lie flat on the roof again, names and health bars stand above the enemies, reflections are softer, and in 3D MODELS enemies glow less so their shape stays clear.', 'טבעות, קווי כוונה, מגינים ואזורי סכנה שוכבים שוב על הגג, שמות וסרגלי חיים עומדים מעל האויבים, ההשתקפויות עדינות יותר, ובמצב מודלים תלת־ממדיים האויבים זוהרים פחות כך שהצורה שלהם ברורה.', 'الحلقات وخطوط التصويب والدروع ومناطق الخطر مسطّحة على السطح من جديد، والأسماء وأشرطة الصحة فوق الأعداء، والانعكاسات أنعم، وفي وضع النماذج ثلاثية الأبعاد يتوهج الأعداء أقل ليبقى شكلهم واضحًا.', 'Кольца, линии прицела, щиты и опасные зоны снова лежат на крыше, имена и полосы здоровья стоят над врагами, отражения мягче, а в режиме 3D-МОДЕЛЕЙ враги светятся слабее, и их форма хорошо видна.'),
 ('POLISH', 'ליטוש', 'تلميع', 'ПОЛИРОВКА'),
 ('A full check of every mode, story stage and legend boss in 2D, 3D and 3D MODELS, with fixes along the way.', 'בדיקה מלאה של כל מצב, כל שלב בסיפור וכל בוס אגדי בדו־ממד, בתלת־ממד ובמודלים תלת־ממדיים, עם תיקונים לאורך הדרך.', 'فحص كامل لكل وضع ومرحلة قصة وزعيم أسطوري في الأبعاد الثنائية والثلاثية ووضع النماذج، مع إصلاحات على طول الطريق.', 'Полная проверка всех режимов, этапов сюжета и легендарных боссов в 2D, 3D и 3D-МОДЕЛЯХ с исправлениями по ходу.'),
]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13w-he31.js').write_text('/* HEBREW — version 30 strings (news). Written by i18n/v31.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('032.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/032.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
