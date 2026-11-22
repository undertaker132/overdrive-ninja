// Record a replay on some build of the game, for the cross-version test.
// usage: node tests/record-fixture.js <folder of a game build> <out.json> [mode] [steps]
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const { serve, boot, BOT } = require('./lib');
(async () => {
  const [dir, out, mode = 'endless', steps = 2400] = process.argv.slice(2);
  const s = await serve(path.resolve(dir)), b = await chromium.launch();
  const p = await boot(b, s.url);
  const r = await p.evaluate(([bot, m, n]) => { const rep = eval(bot)(`Flow.startArcade('${m}')`, n); return { v: VERSION, rep }; }, [BOT, mode, +steps]);
  fs.writeFileSync(out, JSON.stringify({ recordedOn: r.v, mode, score: r.rep.hdr.sc, ticks: r.rep.hdr.tk, replay: r.rep }));
  console.log('recorded on', r.v, mode, 'score', r.rep.hdr.sc, 'ticks', r.rep.hdr.tk, '->', out, p.__errs.length ? p.__errs : '');
  await b.close(); s.close();
})();
