"""Version 23 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('IMPACT FRAMES', 'פריימים של פגיעה', 'إطارات الاصطدام', 'КАДРЫ УДАРА'),
 ('Perfect parries and broken boss parts now flash an anime impact frame, and quick kills are called out: DOUBLE, TRIPLE, QUAD, RAMPAGE, MASSACRE.', 'הדיפות מושלמות וחלקי בוס שנשברים מציגים עכשיו פריים פגיעה בסגנון אנימה, והריגות מהירות מוכרזות: כפול, משולש, מרובע, השתוללות, טבח.', 'الصدّ المثالي وأجزاء الزعيم المحطمة تومض الآن بإطار اصطدام بأسلوب الأنمي، ويُعلن عن القتل السريع: مزدوج، ثلاثي، رباعي، هيجان، مجزرة.', 'Идеальные парирования и сломанные части боссов теперь вспыхивают аниме-кадром удара, а быстрые убийства объявляются: ДВОЙНОЕ, ТРОЙНОЕ, ЧЕТВЕРНОЕ, БУЙСТВО, РЕЗНЯ.'),
 ('A CLEANER START', 'התחלה נקייה יותר', 'بداية أوضح', 'ЧИСТЫЙ СТАРТ'),
 ('New players see the story first. Events and the Daily Op appear once the Arcade opens.', 'שחקנים חדשים רואים קודם את הסיפור. אירועים והמשימה היומית מופיעים כשהארקייד נפתח.', 'يرى اللاعبون الجدد القصة أولًا. تظهر الفعاليات والمهمة اليومية عند فتح الأركيد.', 'Новые игроки сначала видят сюжет. События и операция дня появляются, когда открывается Аркада.'),
 ('TEXT SIZE AND FLASHES', 'גודל טקסט והבזקים', 'حجم النص والوميض', 'РАЗМЕР ТЕКСТА И ВСПЫШКИ'),
 ('Two new settings: menu text at 100%, 115% or 130%, and flashes and impact frames at FULL, SOFT or OFF.', 'שתי הגדרות חדשות: טקסט התפריטים ב-100%, 115% או 130%, והבזקים ופריימי פגיעה במצב מלא, רך או כבוי.', 'إعدادان جديدان: نص القوائم بنسبة 100% أو 115% أو 130%، والوميض وإطارات الاصطدام كاملة أو خفيفة أو متوقفة.', 'Две новые настройки: текст меню 100%, 115% или 130%, а вспышки и кадры удара — ПОЛНЫЕ, МЯГКИЕ или ВЫКЛ.'),
 ('NEW APP ICON', 'אייקון חדש', 'أيقونة جديدة', 'НОВАЯ ИКОНКА'),
 ('A new icon for your home screen, and shortcuts: press and hold the icon to jump straight into the Story or a Maglev Run.', 'אייקון חדש למסך הבית, וקיצורי דרך: לוחצים לחיצה ארוכה על האייקון כדי לקפוץ ישר לסיפור או לריצת מגלב.', 'أيقونة جديدة للشاشة الرئيسية، واختصارات: اضغط مطولًا على الأيقونة للانتقال مباشرة إلى القصة أو جولة ماغليف.', 'Новая иконка на главном экране и ярлыки: зажмите иконку, чтобы сразу перейти в сюжет или забег на маглеве.'),
 ('DOUBLE', 'כפול', 'مزدوج', 'ДВОЙНОЕ'), ('TRIPLE', 'משולש', 'ثلاثي', 'ТРОЙНОЕ'), ('QUAD', 'מרובע', 'رباعي', 'ЧЕТВЕРНОЕ'), ('RAMPAGE', 'השתוללות', 'هيجان', 'БУЙСТВО'), ('MASSACRE', 'טבח', 'مجزرة', 'РЕЗНЯ'),
 ('{0} KILLS', '{0} הריגות', '{0} قتلى', 'УБИЙСТВ: {0}'),
 ('Flashes and impact frames', 'הבזקים ופריימי פגיעה', 'الوميض وإطارات الاصطدام', 'Вспышки и кадры удара'),
 ('Text size', 'גודל טקסט', 'حجم النص', 'Размер текста'),
 ('SOFT', 'רך', 'خفيف', 'МЯГКО'),
]
S = []
T += [(e, None, a, r) for e, a, r in S]
_seen = set(); T = [t for t in T if not (t[0] in _seen or _seen.add(t[0]))]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13q-he24.js').write_text('/* HEBREW — version 23 strings (impact frames, settings, news). Written by i18n/v24.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('025.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/025.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
