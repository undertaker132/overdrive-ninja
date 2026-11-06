"""Version 27 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('LIGHT, RAIN AND REFLECTIONS', 'אור, גשם והשתקפויות', 'الضوء والمطر والانعكاسات', 'СВЕТ, ДОЖДЬ И ОТРАЖЕНИЯ'),
 ('The 3D view now has real light: neon bloom, moving lights from your blade, every kill and Overdrive, shadows, and a wet roof with puddles that reflect the rails, the enemies and you. Rain falls in 3D and splashes on the roof.', 'לתלת־ממד יש עכשיו אור אמיתי: ניאון זוהר, אורות שזזים מהלהב, מכל הריגה ומהאוברדרייב, צללים, וגג רטוב עם שלוליות שמשקפות את המעקות, את האויבים ואותך. הגשם יורד בתלת־ממד ומתיז על הגג.', 'أصبح للعرض ثلاثي الأبعاد ضوء حقيقي: توهج النيون، وأضواء متحركة من نصلك ومن كل قتل ومن الأوفردرايف، وظلال، وسطح مبلل ببرك تعكس الحواجز والأعداء وأنت. المطر يهطل بأبعاد ثلاثية ويتناثر على السطح.', 'В 3D теперь настоящий свет: неоновое свечение, движущиеся огни от клинка, каждого убийства и Овердрайва, тени и мокрая крыша с лужами, в которых отражаются перила, враги и вы. Дождь идёт в 3D и разбивается о крышу.'),
 ('A CITY THAT LIVES', 'עיר חיה', 'مدينة نابضة بالحياة', 'ЖИВОЙ ГОРОД'),
 ('Flying cars cross overhead with their headlights, police drones sweep the roof with searchlights, the train runs under bridges, and the towers carry neon signs and holograms.', 'מכוניות מעופפות חולפות מעל עם הפנסים שלהן, רחפני משטרה סורקים את הגג בזרקורים, הרכבת עוברת מתחת לגשרים, ועל המגדלים יש שלטי ניאון והולוגרמות.', 'سيارات طائرة تعبر فوقك بأضوائها، وطائرات شرطة مسيّرة تمسح السطح بالكشافات، والقطار يمر تحت الجسور، والأبراج تحمل لافتات نيون وصورًا ثلاثية الأبعاد.', 'Над головой пролетают летающие машины с фарами, полицейские дроны обшаривают крышу прожекторами, поезд проходит под мостами, а на башнях горят неоновые вывески и голограммы.'),
 ('CINEMA CAMERA', 'מצלמה קולנועית', 'كاميرا سينمائية', 'КИНОКАМЕРА'),
 ('When a boss arrives and in the finisher, the camera lowers and turns for a moment. Touch aiming follows it exactly.', 'כשבוס מגיע ובחיתוך הסיום, המצלמה יורדת ומסתובבת לרגע. הכיוון במגע עוקב אחריה בדיוק.', 'عند وصول زعيم وفي الضربة النهائية، تنخفض الكاميرا وتدور للحظة. والتصويب باللمس يتبعها بدقة.', 'Когда появляется босс и во время добивания камера на мгновение опускается и поворачивается. Прицеливание касанием точно следует за ней.'),
 ('ULTRA GRAPHICS', 'גרפיקת ULTRA', 'رسومات ULTRA', 'ГРАФИКА ULTRA'),
 ('Settings, Effects quality: ULTRA takes the whole picture, characters and effects too, through the bloom, the color grading and the anti-aliasing. AUTO picks the best level your phone can hold.', 'בהגדרות, איכות אפקטים: ULTRA מעביר את כל התמונה, כולל הדמויות והאפקטים, דרך הזוהר, הצבעים והחלקת הקצוות. AUTO בוחר את הרמה הכי טובה שהטלפון שלך מחזיק.', 'الإعدادات، جودة المؤثرات: ULTRA تمرر الصورة كاملة، بما فيها الشخصيات والمؤثرات، عبر التوهج وتدرج الألوان وتنعيم الحواف. وAUTO يختار أفضل مستوى يتحمله هاتفك.', 'Настройки, качество эффектов: ULTRA пропускает всю картинку, включая персонажей и эффекты, через свечение, цветокоррекцию и сглаживание. AUTO выбирает лучший уровень, который потянет ваш телефон.'),
 ('A CLEANER SCREEN', 'מסך נקי יותר', 'شاشة أنظف', 'ЧИЩЕ ЭКРАН'),
 ('Less text in a run: one message at a time, tips only in your first runs, only big hits show numbers, and the skill buttons show just icons. Settings, HUD: FULL brings it all back.', 'פחות טקסט בזמן ריצה: הודעה אחת בכל פעם, טיפים רק בריצות הראשונות, מספרים רק על מכות גדולות, וכפתורי היכולות מראים רק אייקונים. בהגדרות, HUD: מלא מחזיר את הכול.', 'نص أقل أثناء الجولة: رسالة واحدة في كل مرة، ونصائح في جولاتك الأولى فقط، وأرقام للضربات الكبيرة فقط، وأزرار المهارات تعرض الأيقونات فقط. الإعدادات، HUD: كامل يعيد كل شيء.', 'Меньше текста в забеге: одно сообщение за раз, подсказки только в первых забегах, цифры только у сильных ударов, а на кнопках навыков только значки. Настройки, HUD: ПОЛНЫЙ возвращает всё.'),
 ('HUD', 'HUD', 'HUD', 'HUD'),
 ('CLEAN', 'נקי', 'نظيف', 'ЧИСТЫЙ'),
 ('FULL', 'מלא', 'كامل', 'ПОЛНЫЙ'),
 ('ULTRA', 'ULTRA', 'ULTRA', 'ULTRA'),
]
S = []
T += [(e, None, a, r) for e, a, r in S]
_seen = set(); T = [t for t in T if not (t[0] in _seen or _seen.add(t[0]))]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13u-he28.js').write_text('/* HEBREW — version 27 strings (3D light and life, ULTRA, clean HUD, news). Written by i18n/v28.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('029.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/029.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
