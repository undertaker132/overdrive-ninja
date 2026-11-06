"""Validate the Arabic/Russian translation tables and write src/13c-ar.js and src/13d-ru.js."""
import json, re, glob, sys
keys = json.load(open('/home/claude/od/i18n/keys.json'))
ar, ru, bad = {}, {}, []
for f in sorted(glob.glob('/home/claude/od/i18n/tr/*.tsv')):
    for ln, line in enumerate(open(f, encoding='utf-8').read().split('\n')):
        if not line.strip(): continue
        parts = line.split('\t')
        if len(parts) != 3: bad.append((f, ln, 'cols', line[:80])); continue
        i = int(parts[0])
        if i in ar: bad.append((f, ln, 'dup', i))
        ar[i], ru[i] = parts[1], parts[2]
missing = [i for i in range(len(keys)) if i not in ar]
if missing: bad.append(('missing', missing[:20]))
ph = re.compile(r'\{[0-9n]\}')
for i, k in enumerate(keys):
    if i not in ar: continue
    want = sorted(ph.findall(k))
    for lang, d in (('ar', ar), ('ru', ru)):
        v = d[i]
        if not v.strip(): bad.append((lang, i, 'empty'))
        if sorted(ph.findall(v)) != want: bad.append((lang, i, 'placeholders', k, v))
        if k.endswith(' ') != v.endswith(' '): bad.append((lang, i, 'trailing space', repr(k), repr(v)))
        if lang == 'ar' and re.search('[Ѐ-ӿ]', v): bad.append((lang, i, 'cyrillic in arabic'))
        if lang == 'ru' and re.search('[؀-ۿ]', v): bad.append((lang, i, 'arabic in russian'))
        r = len(v) / max(1, len(k))
        if len(k) > 12 and (r > 2.6 or r < 0.3): bad.append((lang, i, 'length ratio %.1f' % r, k, v))
for b in bad: print('BAD', b)
if bad and '--force' not in sys.argv: sys.exit(1)
extra = {'العربية': 'العربية', 'РУССКИЙ': 'РУССКИЙ', 'עברית': 'עברית', 'ENGLISH': 'ENGLISH'}
for lang, d, name, title in (('ar', ar, '13c-ar.js', 'ARABIC'), ('ru', ru, '13d-ru.js', 'RUSSIAN')):
    o = {keys[i]: d[i] for i in range(len(keys))}; o.update(extra)
    o['SKIP'] = 'تخطَّ' if lang == 'ar' else 'ПРОПУСТИТЬ'
    for line in open('/home/claude/od/i18n/tr/extra.txt', encoding='utf-8').read().split('\n'):
        if line.strip(): en, a_, r_ = line.split('\t'); o[en] = a_ if lang == 'ar' else r_
    body = ',\n'.join(json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False) for k, v in o.items())
    open('/home/claude/od/src/' + name, 'w', encoding='utf-8').write('/* ' + title + ' — every UI string and story line (keys: the English source). Generated from i18n/tr/*.tsv by i18n/gen.py */\nObject.assign(' + lang.upper() + ', {\n' + body + '\n});\n')
    print(name, len(o), 'entries')
