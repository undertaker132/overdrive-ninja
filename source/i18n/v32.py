"""Version 31 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('SHARPER CODE', 'קוד חד יותר', 'شيفرة أدق', 'ЧИЩЕ КОД'),
 ('The whole game went through an automatic code check: a hidden bug in replay verification is fixed, unused code is gone, and strict mode is back on, so mistakes show up instead of hiding.', 'כל המשחק עבר בדיקת קוד אוטומטית: באג חבוי באימות השידורים החוזרים תוקן, קוד שלא היה בשימוש נמחק, ומצב קפדני חזר לפעול, כך שטעויות מתגלות במקום להסתתר.', 'خضعت اللعبة كلها لفحص شيفرة آلي: أُصلح خطأ خفي في التحقق من الإعادات، وأُزيلت الشيفرة غير المستخدمة، وعاد الوضع الصارم للعمل، فتظهر الأخطاء بدل أن تختبئ.', 'Вся игра прошла автоматическую проверку кода: исправлена скрытая ошибка в проверке повторов, удалён неиспользуемый код, и снова включён строгий режим, чтобы ошибки проявлялись, а не прятались.'),
 ('LAST SHIELD', 'המגן האחרון', 'الدرع الأخير', 'ПОСЛЕДНИЙ ЩИТ'),
 ('On your last shield the edges of the screen pulse red with your heartbeat. It is softer with SOFT flashes and off with flashes OFF.', 'במגן האחרון שולי המסך פועמים באדום בקצב הלב. עם הבזקים רכים זה עדין יותר, ועם הבזקים כבויים זה לא מופיע.', 'على درعك الأخير تنبض حواف الشاشة بالأحمر مع دقات قلبك. يكون أخف مع الومضات الناعمة ويختفي مع إيقاف الومضات.', 'На последнем щите края экрана пульсируют красным в такт сердцу. Со вспышками SOFT мягче, со вспышками OFF выключено.'),
 ('CLEARER FIGHTS', 'קרבות ברורים יותר', 'معارك أوضح', 'БОИ ПОНЯТНЕЕ'),
 ('New enemies are marked on the roof in 2D too, only one ON BEAT label shows at a time, boss fights show fewer damage numbers, and the 3D motion blur is smoother.', 'גם בדו־ממד אויבים חדשים מסומנים על הגג, רק תווית ON BEAT אחת מופיעה בכל פעם, בקרבות בוס יש פחות מספרי נזק, וטשטוש התנועה בתלת־ממד חלק יותר.', 'الأعداء الجدد مُعلَّمون على السطح في الأبعاد الثنائية أيضًا، ولا تظهر إلا علامة ON BEAT واحدة في كل مرة، وأرقام ضرر أقل في معارك الزعماء، وضبابية حركة أنعم في الأبعاد الثلاثية.', 'Новые враги отмечаются на крыше и в 2D, одновременно показывается только одна надпись ON BEAT, в боях с боссами меньше чисел урона, а размытие движения в 3D плавнее.'),
 ('FIXES', 'תיקונים', 'إصلاحات', 'ИСПРАВЛЕНИЯ'),
 ("With echo clones out, the hero's light, rim and motion blur in 3D followed a clone; they follow you now. In Hebrew and Arabic, damage numbers read the right way round (400!, not !400).", 'כששיבוטי ההד היו בחוץ, האור, קו המתאר וטשטוש התנועה של הגיבור בתלת־ממד עקבו אחרי שיבוט; עכשיו הם עוקבים אחריך. בעברית ובערבית מספרי הנזק נכתבים בכיוון הנכון (400!, לא !400).', 'عند ظهور نسخ الصدى كان ضوء البطل وحافته المضيئة وضبابية الحركة في الأبعاد الثلاثية تتبع نسخة منها؛ الآن تتبعك أنت. في العبرية والعربية تُكتب أرقام الضرر بالاتجاه الصحيح (400! وليس !400).', 'Когда были вызваны эхо-клоны, свет героя, контур и размытие движения в 3D следовали за клоном; теперь — за вами. На иврите и арабском числа урона читаются правильно (400!, а не !400).'),
]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13w-he32.js').write_text('/* HEBREW — version 31 strings (news). Written by i18n/v32.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('033.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/033.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
