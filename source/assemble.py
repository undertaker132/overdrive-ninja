"""Shared by build.py and build_standalone.py: the page parts in order.
The Arabic and Russian tables (13c-ar.js, 13d-ru.js) are not shipped as code: they go into
<script type="application/json"> blocks the browser never parses until a player picks that
language (12-i18n.js loadDict), so the game starts faster for everyone else."""
import json, pathlib, re
LAZY = {'13c-ar.js': 'ar', '13d-ru.js': 'ru'}
def parts(root):
    root = pathlib.Path(root)
    head = (root / '00-head.html').read_text(); body = (root / '01-body.html').read_text()
    js, blocks = [], []
    for f in sorted(p.name for p in root.glob('*.js')):
        src = (root / f).read_text()
        if f in LAZY:
            m = re.search(r'Object\.assign\(\w+, (\{.*\})\);\s*$', src, re.S)
            obj = json.loads(m.group(1))
            blob = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
            blocks.append('<script type="application/json" id="dict-%s">%s</script>' % (LAZY[f], blob))
        else: js.append(src)
    vendor = sorted(p.name for p in root.glob('02-*.html')) # (version 39: three.js, its own script before the game's)
    for f in vendor: blocks.append((root / f).read_text())
    return head, body, '\n'.join(js), '\n'.join(blocks)
