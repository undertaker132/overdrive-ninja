// Collect every translatable English string: lt/ltf literals in the sources, static page text,
// and the text fields of the game's data tables (read from the built page in a headless browser
// by extract.py). This file: static part.
const fs = require('fs'), path = require('path');
const dir = '/home/claude/od/src'; const out = new Set();
for (const f of fs.readdirSync(dir).sort()) {
  if (!/\.js$/.test(f) || /^13/.test(f)) continue;
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /\blt[f]?\(\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g; let m;
  while ((m = re.exec(s))) { try { out.add(eval(m[1])); } catch (e) { } }
}
fs.writeFileSync('/home/claude/od/i18n/static.json', JSON.stringify([...out], null, 0));
console.log('static literals', out.size);
