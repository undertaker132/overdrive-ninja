#!/usr/bin/env python3
"""Builds the game from source/src into index.html (this site's page: source/site_head.html, then the game),
and moves the offline cache in sw.js to the new version so players get the update.
  python3 source/build.py                 -> index.html + sw.js
  python3 source/build.py --core out.html -> also the page for the claude.ai artifact (no document skeleton)
The Arabic and Russian tables in src/13c-ar.js and src/13d-ru.js are generated: edit i18n/tr/*.tsv and run i18n/gen.py."""
import pathlib, re, sys
here = pathlib.Path(__file__).resolve().parent; repo = here.parent
sys.path.insert(0, str(here)); from assemble import parts
head, body, js, dicts = parts(here / 'src')
core = head + '\n' + body + '\n' + dicts + '\n<script>\n' + js + '\n</script>\n'
A = '<meta name="claude:viewport-fit-sides"'; q = core.find(A); assert q >= 0
page = (here / 'site_head.html').read_text(encoding='utf-8') + core[q:] + '</body></html>\n'
(repo / 'index.html').write_text(page, encoding='utf-8')
ver = re.search(r"const VERSION = '([0-9]+)", js).group(1)
sw = repo / 'sw.js'; sw.write_text(re.sub(r"const CACHE = 'overdrive-v[0-9]+';", "const CACHE = 'overdrive-v%s';" % ver, sw.read_text()))
if '--core' in sys.argv: pathlib.Path(sys.argv[sys.argv.index('--core') + 1]).write_text(core, encoding='utf-8')
print('index.html', len(page.encode()), 'bytes, version', ver)
