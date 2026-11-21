// Copies the game (the same files the website serves) into desktop/web before a build.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(__dirname, 'web');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'icons'), { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest']) fs.copyFileSync(path.join(root, f), path.join(out, f));
for (const f of fs.readdirSync(path.join(root, 'icons'))) fs.copyFileSync(path.join(root, 'icons', f), path.join(out, 'icons', f));
fs.mkdirSync(path.join(out, 'models'), { recursive: true }); // (the real 3D models, version 56)
for (const f of fs.readdirSync(path.join(root, 'models'))) fs.copyFileSync(path.join(root, 'models', f), path.join(out, 'models', f));
for (const d of ['css', 'js', 'lang', 'audio']) { const src = path.join(root, d); if (!fs.existsSync(src)) continue; fs.mkdirSync(path.join(out, d), { recursive: true }); for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(out, d, f)); } // (v97: the game's code and the Arabic/Russian texts in their own files, the soundtrack folder)
console.log('web files ready in', out);
