"""Version 19 strings. Run gen.py after."""
import json, pathlib, glob
T = [
 ('SHINIGAMI', 'שיניגאמי', 'شينيغامي', 'СИНИГАМИ'),
 ('Death god. One shield, relentless enemies, and it only gets harder while you play well.', 'אל המוות. מגן אחד, אויבים בלי רחמים, וזה רק נהיה קשה יותר כשאתה משחק טוב.', 'إله الموت. درع واحد، أعداء لا يرحمون، ويزداد الأمر صعوبة كلما لعبت جيدًا.', 'Бог смерти. Один щит, беспощадные враги, и чем лучше играешь, тем сложнее.'),
 ('The intended challenge. The better you play, the harder it pushes back.', 'האתגר המתוכנן. ככל שתשחק טוב יותר, המשחק ילחץ חזק יותר.', 'التحدي المقصود. كلما لعبت أفضل، ازداد الضغط عليك.', 'Задуманная сложность. Чем лучше играешь, тем сильнее давит игра.'),
 ('HARDER', 'קשה יותר', 'أصعب', 'СЛОЖНЕЕ'),
 ('Every difficulty above ROOKIE is tougher: enemies have more health, move and shoot faster, come in bigger waves, and bosses hit harder. The game also watches how well you play and keeps pushing back while you are on a roll.', 'כל רמת קושי מעל טירון קשה יותר: לאויבים יש יותר חיים, הם זזים ויורים מהר יותר, מגיעים בגלים גדולים יותר, והבוסים מכים חזק יותר. המשחק גם עוקב אחרי איך שאתה משחק וממשיך ללחוץ כשאתה ברצף.', 'كل مستوى صعوبة فوق المبتدئ أصعب: للأعداء صحة أكبر، ويتحركون ويطلقون أسرع، ويأتون في موجات أكبر، والزعماء يضربون أقوى. واللعبة تراقب أداءك وتواصل الضغط ما دمت في أوج تألقك.', 'Каждая сложность выше НОВИЧКА стала труднее: у врагов больше здоровья, они быстрее двигаются и стреляют, приходят большими волнами, а боссы бьют сильнее. Игра следит за тем, как ты играешь, и давит сильнее, пока ты в ударе.'),
 ('A fifth difficulty for the best: one shield, relentless enemies and x4 score.', 'רמת קושי חמישית לטובים ביותר: מגן אחד, אויבים בלי רחמים ופי 4 ניקוד.', 'مستوى صعوبة خامس للأفضل: درع واحد، أعداء لا يرحمون، ونقاط ×4.', 'Пятая сложность для лучших: один щит, беспощадные враги и x4 очков.'),
]
he = {en: h for en, h, a, r in T if h is not None}
body = ',\n'.join('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in he.items())
pathlib.Path('/home/claude/od/src/13m-he20.js').write_text('/* HEBREW — version 19 strings (difficulty). Written by i18n/v20.py */\nObject.assign(HE, {\n' + body + '\n});\n', encoding='utf-8')
kp = pathlib.Path('/home/claude/od/i18n/keys.json'); keys = json.loads(kp.read_text())
have = set()
for f in glob.glob('/home/claude/od/i18n/tr/*.tsv'):
    if f.endswith('021.tsv'): continue
    for ln in open(f, encoding='utf-8').read().split('\n'):
        if ln.strip(): have.add(int(ln.split('\t')[0]))
rows = []
for en, h, a, r in T:
    if en in keys: i = keys.index(en)
    else: keys.append(en); i = len(keys) - 1
    if i not in have: rows.append('%d\t%s\t%s' % (i, a, r))
kp.write_text(json.dumps(keys, ensure_ascii=False))
pathlib.Path('/home/claude/od/i18n/tr/021.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
print('HE', len(he), 'keys', len(keys), 'tsv rows', len(rows))
