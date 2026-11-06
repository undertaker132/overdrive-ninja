"""Version 28 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('EVERY BOSS MAKES AN ENTRANCE', 'לכל בוס יש כניסה', 'لكل زعيم دخول خاص', 'У КАЖДОГО БОССА СВОЁ ПОЯВЛЕНИЕ'),
 ('The Warden drops from the sky, the Hydra flies in on its engines, Kage steps out of black smoke, Shogun cuts up through the roof, Raijin rides the lightning, the Leviathan bursts out of the water, Benkei walks in to tolling bells, Tenkai comes down a beam from orbit, Izanami forms from petals and the Night Parade brings its lanterns. Every boss has its own.', 'הוורדן נוחת מהשמיים, ההידרה טסה פנימה על המנועים, קאגה יוצא מתוך עשן שחור, שוגון חותך את דרכו למעלה דרך הגג, ראיג׳ין רוכב על הברק, הלווייתן מתפרץ מתוך המים, בנקיי נכנס לצלצול פעמונים, טנקאי יורד בקרן אור מהמסלול, איזנאמי נוצרת מעלי כותרת, ומצעד הלילה מביא את הפנסים שלו. לכל בוס יש כניסה משלו.', 'الحارس يهبط من السماء، والهيدرا تطير بمحركاتها، وكاغي يخرج من الدخان الأسود، وشوغون يشق طريقه عبر السطح، وراي-جين يمتطي البرق، واللوياثان ينفجر من الماء، وبنكي يدخل على قرع الأجراس، وتنكاي ينزل على شعاع من المدار، وإيزانامي تتكوّن من البتلات، وموكب الليل يأتي بفوانيسه. لكل زعيم دخوله.', 'Страж падает с неба, Гидра влетает на двигателях, Кагэ выходит из чёрного дыма, Сёгун прорубается сквозь крышу, Райдзин мчится на молнии, Левиафан вырывается из воды, Бэнкэй входит под звон колоколов, Тэнкай спускается по лучу с орбиты, Идзанами складывается из лепестков, а Ночное шествие приносит свои фонари. У каждого босса своё появление.'),
 ('AND EVERY BOSS FALLS ITS OWN WAY', 'וכל בוס נופל בדרך משלו', 'وكل زعيم يسقط بطريقته', 'И КАЖДЫЙ БОСС ПАДАЕТ ПО-СВОЕМУ'),
 ('Scrap, smoke, broken blades, lightning, glitches, water, bells, gold, feathers, cubes, dragon scales, petals and lanterns: each boss breaks apart in its own style, under a pillar of its own light, while the camera circles it.', 'גרוטאות, עשן, להבים שבורים, ברקים, גליצ׳ים, מים, פעמונים, זהב, נוצות, קוביות, קשקשי דרקון, עלי כותרת ופנסים: כל בוס מתפרק בסגנון משלו, תחת עמוד של האור שלו, כשהמצלמה מקיפה אותו.', 'خردة ودخان ونصال مكسورة وبرق وتشويش وماء وأجراس وذهب وريش ومكعبات وحراشف تنين وبتلات وفوانيس: كل زعيم يتحطم بأسلوبه تحت عمود من ضوئه، بينما تدور الكاميرا حوله.', 'Обломки, дым, сломанные клинки, молнии, глитчи, вода, колокола, золото, перья, кубы, драконья чешуя, лепестки и фонари: каждый босс разлетается по-своему под столбом собственного света, а камера облетает его.'),
 ('3D CHECKED AND POLISHED', 'תלת־ממד נבדק ולוטש', 'تم فحص الأبعاد الثلاثية وصقلها', '3D ПРОВЕРЕНО И ОТПОЛИРОВАНО'),
 ('Damage numbers stand up in 3D, the dark stages stay dark across the whole tilted view, and the bright worlds keep their roof from washing out.', 'מספרי הנזק עומדים זקופים בתלת־ממד, השלבים החשוכים נשארים חשוכים בכל המבט המוטה, והעולמות הבהירים שומרים על הגג שלהם מלהיראות דהוי.', 'أرقام الضرر تقف منتصبة في الأبعاد الثلاثية، والمراحل المظلمة تبقى مظلمة في كامل المشهد المائل، والعوالم الساطعة تحافظ على سطحها من الشحوب.', 'Цифры урона стоят вертикально в 3D, тёмные этапы остаются тёмными во всём наклонном виде, а у светлых миров крыша больше не выцветает.'),
]
S = []
T += [(e, None, a, r) for e, a, r in S]
_seen = set(); T = [t for t in T if not (t[0] in _seen or _seen.add(t[0]))]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13v-he29.js').write_text('/* HEBREW — version 28 strings (boss entrances and falls, news). Written by i18n/v29.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('030.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/030.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
