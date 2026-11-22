#!/usr/bin/env python3
"""Build the game's scripts from source/.

    python3 source/build.py            write js/game-core.js, js/overdrive-aaa.js and the sw.js cache name
    python3 source/build.py --check    only check that the committed files match the source (CI uses this)
    python3 source/build.py --artifact DIR
                                       also write the single-page artifact copy into DIR

Layout:
    source/src/*.js   the core game, one file per system, joined in name order  -> js/game-core.js
    source/aaa/*.js   the later upgrade modules (v96+), joined in name order    -> js/overdrive-aaa.js
    lang/*.js         Arabic / Russian dictionaries, edited in place, loaded lazily by the game
    index.html, css/  edited in place
The game version is VERSION in source/src/10-config.js; the service worker cache is named after it.
"""
import os, re, sys, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, AAA = os.path.join(ROOT, 'source', 'src'), os.path.join(ROOT, 'source', 'aaa')


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def parts(d):
    return [read(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.endswith('.js')]


def outputs():
    core = '\n' + '\n'.join(parts(SRC))
    aaa = ''.join(parts(AAA))
    m = re.search(r"const VERSION = '(\d+)(?:\.\d+)?'", core)
    if not m:
        sys.exit('VERSION not found in source/src/10-config.js')
    sw = re.sub(r"const CACHE = 'overdrive-v[^']*'", "const CACHE = 'overdrive-v%s'" % m.group(1), read(os.path.join(ROOT, 'sw.js')), count=1)
    return {'js/game-core.js': core, 'js/overdrive-aaa.js': aaa, 'sw.js': sw}, m.group(0)


def artifact(out):
    """One HTML page plus its files, as published on claude.ai (no service worker, no models)."""
    html = read(os.path.join(ROOT, 'index.html'))
    a, b = html.find('<meta name="claude:viewport-fit-sides"'), html.rfind('</body></html>')
    if a < 0 or b < 0:
        sys.exit('index.html: artifact markers not found')
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'artifact.html'), 'w', encoding='utf-8', newline='') as f:
        f.write('<title>Overdrive: Cyber Slash</title>\n' + html[a:b])
    files = ['css/overdrive.css', 'js/three-r160.min.js', 'js/game-core.js', 'js/overdrive-aaa.js', 'lang/ar.js', 'lang/ru.js', 'audio/tracks.json']
    for p in files:
        os.makedirs(os.path.dirname(os.path.join(out, p)), exist_ok=True)
        shutil.copyfile(os.path.join(ROOT, p), os.path.join(out, p))
    print('artifact:', os.path.join(out, 'artifact.html'), '+', len(files), 'files')


def main():
    args = sys.argv[1:]
    outs, ver = outputs()
    stale = [p for p, s in outs.items() if not os.path.exists(os.path.join(ROOT, p)) or read(os.path.join(ROOT, p)) != s]
    if '--check' in args:
        if stale:
            print('out of date (run python3 source/build.py):', ', '.join(stale))
            sys.exit(1)
        print('build is up to date,', ver)
        return
    for p in stale:
        with open(os.path.join(ROOT, p), 'w', encoding='utf-8', newline='') as f:
            f.write(outs[p])
    if shutil.which('node'):  # a syntax error in one part would stop the whole script in the browser
        for p in ('js/game-core.js', 'js/overdrive-aaa.js'):
            r = subprocess.run(['node', '--check', os.path.join(ROOT, p)], capture_output=True, text=True)
            if r.returncode:
                sys.exit('syntax error in %s:\n%s' % (p, r.stderr.strip()[:1500]))
    print(ver, '- wrote' if stale else '- nothing to write,', ', '.join(stale) or 'all files current')
    if '--artifact' in args:
        artifact(args[args.index('--artifact') + 1])


if __name__ == '__main__':
    main()
