"""Version 40 strings (the v32 work merged into version 39). Run v33.py first, then this, then gen.py."""
import json, pathlib, glob
T = [
 ('SEE YOUR FRIENDS', 'רואים את החברים', 'شاهد أصدقاءك', 'ВИДНО ДРУЗЕЙ'),
 ('In live games each friend is a 3D ninja in their own colors, with a ring and a name tag (their full hero in 2D and CLASSIC 3D). The countdown counts down, START waits for everyone, and if the host leaves another player takes over.', 'במשחק חי כל חבר הוא נינג׳ה בתלת־ממד בצבעים שלו, עם טבעת ותגית שם (ובדו־ממד ובתלת־ממד הקלאסי, הדמות המלאה שלו). הספירה לאחור סופרת, כפתור ההתחלה מחכה לכולם, ואם המארח עוזב שחקן אחר מחליף אותו.', 'في الألعاب المباشرة يظهر كل صديق كنينجا ثلاثي الأبعاد بألوانه، مع حلقة وبطاقة اسم (وبطله الكامل في الوضع الثنائي وفي ثلاثي الأبعاد الكلاسيكي). العد التنازلي يعدّ، وزر البدء ينتظر الجميع، وإذا غادر المضيف يتولى لاعب آخر.', 'В живой игре каждый друг — 3D-ниндзя в своих цветах, с кольцом и табличкой с именем (в 2D и классическом 3D — его герой целиком). Обратный отсчёт идёт по секундам, СТАРТ ждёт всех, а если хозяин выйдет, его место займёт другой игрок.'),
 ('THE WHOLE ROOF IN 3D', 'כל הגג בתלת־ממד', 'السطح كله ثلاثي الأبعاد', 'ВСЯ КРЫША В 3D'),
 ('The hackable turret no longer has a flat drawing on top of it, and mines, pickups, coins, data shards, the uplink, the cargo drone and portals are 3D models too. CLASSIC 3D gets new models for every enemy and bigger bosses.', 'על הצריח שאפשר להשתלט עליו כבר אין ציור שטוח, וגם מוקשים, פריטים לאיסוף, מטבעות, רסיסי מידע, משדר האפלינק, רחפן המטען והפורטלים הם מודלים בתלת־ממד. בתלת־ממד הקלאסי יש מודלים חדשים לכל האויבים, והבוסים גדולים יותר.', 'لم يعد فوق البرج القابل للاختراق رسم مسطح، وصارت الألغام والعناصر القابلة للالتقاط والعملات وشظايا البيانات وهوائي الإرسال وطائرة الشحن والبوابات نماذج ثلاثية الأبعاد أيضًا. وفي ثلاثي الأبعاد الكلاسيكي نماذج جديدة لكل الأعداء وزعماء أكبر.', 'На взламываемой турели больше нет плоского рисунка поверх модели, а мины, бонусы, монеты, осколки данных, антенна, грузовой дрон и порталы теперь тоже 3D-модели. В классическом 3D у всех врагов новые модели, а боссы стали крупнее.'),
 ('New in Settings: an aim joystick (off unless you turn it on), the controller\'s status and button map, and one RESOLUTION setting from LOW to MAX that sets the 3D picture too.', 'חדש בהגדרות: ג׳ויסטיק כיוון (כבוי אלא אם מפעילים אותו), מצב השלט ומפת הכפתורים שלו, והגדרת רזולוציה אחת מנמוכה ועד מקסימום שקובעת גם את תמונת התלת־ממד.', 'جديد في الإعدادات: عصا تصويب (معطلة ما لم تفعّلها)، وحالة وحدة التحكم وخريطة أزرارها، وإعداد دقة واحد من منخفضة إلى قصوى يضبط صورة ثلاثي الأبعاد أيضًا.', 'Новое в настройках: джойстик прицела (выключен, пока его не включить), состояние контроллера и схема кнопок и одна настройка РАЗРЕШЕНИЯ от НИЗКОГО до МАКСИМУМА, которая задаёт и картинку 3D.'),
]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13y-he40.js').write_text('/* HEBREW — version 40 strings (news). Written by i18n/v40.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('035.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/035.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
