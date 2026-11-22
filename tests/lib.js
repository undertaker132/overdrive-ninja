// Shared helpers for the browser tests: a static file server and a booted game page.
const http = require('http'), fs = require('fs'), path = require('path');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };

// Serve a folder on a free port; resolves to { url, close }.
function serve(root) {
  const srv = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.readFile(p.endsWith(path.sep) ? path.join(p, 'index.html') : p, (err, data) => {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(data);
    });
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}/`, close: () => srv.close() })));
}

// Errors that are not the game's fault: offline fonts / sign-in SDK in CI, missing optional music files.
const NOISE = /fonts\.(googleapis|gstatic)|gstatic\.com|firebase|Failed to load resource: the server responded with a status of 404|net::ERR_/;

// Open the game, press start, skip first-run guides; collects page errors into page.__errs.
async function boot(browser, url, viewport = { width: 390, height: 844 }) {
  const p = await browser.newPage({ viewport });
  p.__errs = [];
  p.on('pageerror', e => p.__errs.push('PAGEERR ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  p.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) p.__errs.push('CONSOLE ' + m.text().slice(0, 240)); });
  await p.addInitScript(() => { try { navigator.serviceWorker && Object.defineProperty(navigator, 'serviceWorker', { value: undefined }); } catch (e) { } });
  await p.goto(url + 'index.html');
  await p.waitForSelector('#bootGo:not(.hidden)', { timeout: 60000 });
  await p.click('#bootGo'); await p.waitForTimeout(800);
  await p.evaluate(() => { const d = Store.data; d.uiAll = 1; d.settings.d3 = 0; d.settings.tips = 0; d.seenVer = VERSION; d.guide = { journey: 1, crates: 1, today: 1, forge: 1, evo: 1, wboss: 1 }; UI.openTitle(); });
  return p;
}

// In-page: play a run with a simple deterministic bot for n sim steps (no drawing), then return the recorded replay.
// Runs inside page.evaluate, so it may only use the game's globals.
const BOT = `(function (start, n) {
  eval(start);
  const near = () => { let best = null, bd = 1e9; for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!e.alive || e.al > 0) continue; const q = Math.hypot(e.x - P.x, e.y - P.y); if (q < bd) { bd = q; best = e; } } const B = Boss.cur; if (B && B.enter >= 1 && (!best || Math.hypot(B.x - P.x, B.y - P.y) < bd)) best = B; return best; };
  for (let i = 0; i < n; i++) {
    if (typeof Dlg !== 'undefined' && Dlg.active) Dlg.next();
    if (UI.cur === 'comic') Comic.end(); if (UI.cur === 'intro') Intro.end();
    if (G.state === 'PERK') { const c = document.querySelector('#pkList .perk, #s-perk .perk'); if (c) c.click(); }
    if (G.state === 'ROUTE') { const c = document.querySelector('#s-route .route, #s-route button'); if (c) c.click(); }
    if (Tut.cur) { Tut.cur.t = 1; Tut.dismiss(); }
    if (G.state !== 'PLAY') { safeStep(); continue; }
    if (window.__V96 && i % 30 === 7) window.__V96.AirCombat96.press();
    if (typeof PCMaster90 !== 'undefined' && PCMaster90.sync98 && i % 45 === 3) { const W = PCMaster90, m = (i / 45 | 0) % 5; W.wasd.w = m === 0; W.wasd.d = m === 1; W.wasd.s = m === 2; W.wasd.a = m === 3; W.sync98(); }
    if (i % 25 === 0) { const t = near(); if (t) slash(Math.atan2(t.y - P.y, t.x - P.x)); }
    safeStep();
  }
  return REC.end();
})`;

module.exports = { serve, boot, BOT, ROOT: path.join(__dirname, '..') };
