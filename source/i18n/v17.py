"""Version 16.1 strings. Hebrew -> src/13j-he17.js, Arabic + Russian -> keys.json + i18n/tr/018.tsv. Run gen.py after."""
import json, pathlib, glob
T = [
 ('REAL SWING ANIMATIONS', 'אנימציות הנפה אמיתיות', 'رسوم ضربات حقيقية', 'НАСТОЯЩИЕ АНИМАЦИИ УДАРОВ'),
 ('Every weapon now moves its own way on every dash: the katana sweeps left and right, the Muramasa cuts an X, the hammer winds up overhead and smashes with a shockwave, the spear pulls back and thrusts, daggers stab in a flurry, the whip lashes and cracks, the scythe spins the whole body, gauntlets throw a jab-cross and the Dominator fires with recoil.', 'כל נשק זז עכשיו בדרך משלו בכל דאש: הקטאנה מניפה ימינה ושמאלה, המוראמאסה חותכת X, הפטיש מתרומם מעל הראש ומתרסק עם גל הדף, החנית נמשכת לאחור ודוקרת, הפגיונות דוקרים ברצף, השוט מצליף ומצליף בקול, החרמש מסובב את כל הגוף, הכפפות מכות ג׳אב וקרוס והדומינייטור יורה עם רתע.', 'كل سلاح يتحرك الآن بطريقته في كل انقضاض: الكاتانا تكتسح يمينًا ويسارًا، والموراماسا تقطع على شكل X، والمطرقة ترتفع فوق الرأس وتهوي بموجة صدمة، والرمح يرتد ثم يطعن، والخناجر تطعن بسرعة متتالية، والسوط يلسع ويفرقع، والمنجل يدير الجسد كله، والقفازات تسدد لكمتين متتاليتين، والدومينيتور يطلق مع ارتداد.', 'Теперь каждое оружие двигается по-своему при каждом рывке: катана рубит то влево, то вправо, Мурамаса режет крест-накрест, молот замахивается из-за головы и бьёт с ударной волной, копьё отводится и колет, кинжалы наносят серию уколов, кнут хлещет со щелчком, коса раскручивает всё тело, перчатки бьют двойку, а Доминатор стреляет с отдачей.'),
]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13j-he17.js').write_text('/* HEBREW — version 16.1 strings (swing animations). Written by i18n/v16.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('018.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/018.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
