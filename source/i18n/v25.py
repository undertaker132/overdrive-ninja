"""Version 24 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('SLICED IN TWO', 'חתוכים לשניים', 'مقطوع إلى نصفين', 'РАЗРУБЛЕНЫ НАДВОЕ'),
 ('Enemies you cut down now split in half along your blade, and critical kills freeze the picture for a beat. Heavy weapons bend the air when they dash.', 'אויבים שאתם חותכים נחצים עכשיו לשניים לאורך הלהב, והריגות קריטיות מקפיאות את התמונה לרגע. נשקים כבדים מעקמים את האוויר בכל דאש.', 'الأعداء الذين تقطعهم ينشطرون الآن نصفين على طول نصلك، والضربات الحرجة القاتلة تجمّد الصورة للحظة. والأسلحة الثقيلة تثني الهواء عند الاندفاع.', 'Сражённые враги теперь разваливаются надвое вдоль клинка, а критические убийства замирают на миг. Тяжёлое оружие искривляет воздух при рывке.'),
 ('HERO PORTRAITS', 'דיוקנאות גיבורים', 'صور الأبطال', 'ПОРТРЕТЫ ГЕРОЕВ'),
 ('Every hero and every story character has a new detailed portrait: on the title screen, in the Arsenal, in dialogue and on comic pages.', 'לכל גיבור ולכל דמות בסיפור יש דיוקן חדש ומפורט: במסך הראשי, בארסנל, בדיאלוגים ובקומיקס.', 'لكل بطل ولكل شخصية في القصة صورة جديدة مفصلة: في الشاشة الرئيسية والترسانة والحوارات وصفحات الكوميكس.', 'У каждого героя и персонажа сюжета новый подробный портрет: на главном экране, в Арсенале, в диалогах и в комиксах.'),
 ('NEW LOGO AND MENU', 'לוגו ותפריט חדשים', 'شعار وقائمة جديدان', 'НОВЫЙ ЛОГОТИП И МЕНЮ'),
 ('A new logo cut by a katana, a cleaner title menu with icons, and screens that slide in.', 'לוגו חדש שחתוך בקטאנה, תפריט ראשי נקי יותר עם אייקונים, ומסכים שנכנסים בהחלקה.', 'شعار جديد يقطعه سيف كاتانا، وقائمة رئيسية أوضح بأيقونات، وشاشات تنزلق إلى الداخل.', 'Новый логотип, разрубленный катаной, аккуратное главное меню с иконками и выезжающие экраны.'),
 ('WET NEON ROOFS', 'גגות ניאון רטובים', 'أسطح نيون مبللة', 'МОКРЫЕ НЕОНОВЫЕ КРЫШИ'),
 ('Roofs shine with rain, rail lights reflect and neon fog drifts by.', 'הגגות מבריקים מהגשם, אורות המעקות משתקפים, וערפל ניאון נסחף.', 'الأسطح تلمع بالمطر، وأضواء الحواجز تنعكس، وضباب النيون ينجرف.', 'Крыши блестят от дождя, огни перил отражаются, мимо плывёт неоновый туман.'),
 ('BIGGER MOMENTS', 'רגעים גדולים יותר', 'لحظات أكبر', 'МОМЕНТЫ ПОМОЩНЕЕ'),
 ('Overdrive bursts with speed lines and an aura, results count up, kills sound like what they are made of, and a falling boss gets a moment of silence.', 'אוברדרייב מתפרץ בקווי מהירות והילה, התוצאות נספרות למעלה, הריגות נשמעות כמו החומר שממנו האויב עשוי, ובוס שנופל מקבל רגע של שקט.', 'الأوفردرايف ينفجر بخطوط سرعة وهالة، والنتائج تُعدّ تصاعديًا، والقتلى يُسمع صوت مادتهم، والزعيم الساقط ينال لحظة صمت.', 'Овердрайв вспыхивает линиями скорости и аурой, результаты отсчитываются, враги звучат как то, из чего сделаны, а падающий босс получает миг тишины.'),
]
S = []
T += [(e, None, a, r) for e, a, r in S]
_seen = set(); T = [t for t in T if not (t[0] in _seen or _seen.add(t[0]))]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13r-he25.js').write_text('/* HEBREW — version 24 strings (news). Written by i18n/v25.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('026.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/026.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
