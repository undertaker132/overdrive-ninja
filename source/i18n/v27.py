"""Version 26 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('OVERDRIVE GOES 3D', 'OVERDRIVE עובר לתלת־ממד', 'OVERDRIVE تصبح ثلاثية الأبعاد', 'OVERDRIVE ПЕРЕХОДИТ В 3D'),
 ('The run is now drawn in real 3D: a tilted camera over the train roof, 3D heroes with glowing blades, solid enemies that break into pieces when you cut them, and a city around the tracks. Switch between 3D and 2D in Settings, under Graphics.', 'הריצה מצוירת עכשיו בתלת־ממד אמיתי: מצלמה בזווית מעל גג הרכבת, גיבורים בתלת־ממד עם להבים זוהרים, אויבים מוצקים שמתפרקים לחתיכות כשחותכים אותם, ועיר סביב המסילות. אפשר לעבור בין תלת־ממד לדו־ממד בהגדרות, תחת גרפיקה.', 'تُرسم الجولة الآن بأبعاد ثلاثية حقيقية: كاميرا مائلة فوق سطح القطار، وأبطال ثلاثيو الأبعاد بسيوف متوهجة، وأعداء صلبون يتحطمون قطعًا عند قطعهم، ومدينة حول القضبان. بدّل بين ثلاثي وثنائي الأبعاد من الإعدادات، تحت الرسومات.', 'Забег теперь нарисован в настоящем 3D: наклонная камера над крышей поезда, объёмные герои со светящимися клинками, твёрдые враги, разлетающиеся на куски от удара, и город вокруг путей. Переключайте 3D и 2D в настройках, в разделе «Графика».'),
 ('SIXTEEN 3D BOSSES', 'שישה־עשר בוסים בתלת־ממד', 'ستة عشر زعيمًا ثلاثي الأبعاد', 'ШЕСТНАДЦАТЬ 3D-БОССОВ'),
 ('Every boss has its own 3D model: the four-legged Warden, the coils of the Leviathan, the ox-cart of the Night Parade, the turning shells of the Final Machine and more.', 'לכל בוס יש מודל תלת־ממד משלו: הוורדן בעל ארבע הרגליים, הטבעות של הלווייתן, עגלת השוורים של מצעד הלילה, הקליפות המסתובבות של המכונה האחרונה ועוד.', 'لكل زعيم نموذج ثلاثي الأبعاد خاص به: الحارس ذو الأرجل الأربع، وحلقات اللوياثان، وعربة الثيران في موكب الليل، والأصداف الدوّارة للآلة الأخيرة والمزيد.', 'У каждого босса своя 3D-модель: четвероногий Страж, кольца Левиафана, повозка Ночного шествия, вращающиеся оболочки Последней машины и другие.'),
 ('LIGHT AND SHADOW', 'אור וצל', 'الضوء والظل', 'СВЕТ И ТЕНЬ'),
 ('Lit roof plates, contact shadows and rail light on the roof. Slower phones draw 3D at a lower resolution to stay smooth, and a phone that is still too slow goes back to 2D by itself.', 'לוחות גג מוארים, צללים מתחת לכל דמות ואור של המעקות על הגג. טלפונים איטיים מציירים תלת־ממד ברזולוציה נמוכה יותר כדי להישאר חלקים, וטלפון שעדיין איטי מדי חוזר לדו־ממד לבד.', 'ألواح سطح مضاءة، وظلال تحت كل جسم، وضوء الحواجز على السطح. الهواتف الأبطأ ترسم ثلاثي الأبعاد بدقة أقل لتبقى سلسة، والهاتف الذي يظل بطيئًا جدًا يعود إلى ثنائي الأبعاد تلقائيًا.', 'Освещённые плиты крыши, тени под каждым объектом и свет перил на крыше. Медленные телефоны рисуют 3D в меньшем разрешении, чтобы всё шло плавно, а слишком медленный телефон сам вернётся в 2D.'),
 ('Graphics', 'גרפיקה', 'الرسومات', 'Графика'),
 ('3D MODELS', 'מודלים בתלת־ממד', 'نماذج ثلاثية الأبعاد', '3D-МОДЕЛИ'),
 ('3D OFF FOR SPEED', 'תלת־ממד כבוי לטובת מהירות', 'إيقاف ثلاثي الأبعاد للسرعة', '3D ВЫКЛЮЧЕНО ДЛЯ СКОРОСТИ'),
]
S = []
T += [(e, None, a, r) for e, a, r in S]
_seen = set(); T = [t for t in T if not (t[0] in _seen or _seen.add(t[0]))]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13t-he27.js').write_text('/* HEBREW — version 26 strings (3D mode, news). Written by i18n/v27.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('028.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/028.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
