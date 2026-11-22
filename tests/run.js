// The game's browser tests. usage: node tests/run.js [replay,compat,sweep] [--secs N]
//   replay  live bot runs vs their replays, compared tick by tick (every mode that records replays)
//   compat  replays recorded on older versions (tests/fixtures) must play back to the same score
//   sweep   every arcade mode and a story stage per chapter, played in real time in 2D and 3D; no errors allowed
// Needs Playwright with Chromium. Exit code 1 on any failure.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const { serve, boot, BOT, ROOT } = require('./lib');
const args = process.argv.slice(2), only = (args.find(a => !a.startsWith('--') && isNaN(+a)) || 'replay,compat,sweep').split(',');
const SECS = +(args[args.indexOf('--secs') + 1] || 4);
let failed = 0; const fail = m => { failed++; console.log('  FAIL', m); }, ok = m => console.log('  ok  ', m);

const SNAP = `() => [TICK.n, Boss.cur ? Boss.cur.id + ':' + Math.round(Boss.cur.hp * 100) : '-', Math.round(P.x * 64), Math.round(P.y * 64), P.hp, +P.ch.toFixed(3), G.score | 0, G.kills | 0, EN.n, BU.n, R.s >>> 0, G.combo | 0, G.od | 0]`;
const FIELDS = ['tick', 'boss', 'x', 'y', 'hp', 'ch', 'score', 'kills', 'enemies', 'bullets', 'rng', 'combo', 'od'];

async function replay(b, url) {
  console.log('replay: live run vs its replay, tick by tick');
  const p = await boot(b, url); await p.evaluate(() => { Store.data.story.unlocked = 999; });
  for (const [label, start, n] of [['endless', "Flow.startArcade('endless')", 6000], ['bossrush', "Flow.startArcade('bossrush')", 6000], ['arena', "Flow.startArcade('arena')", 4000], ['tower', "Flow.startArcade('tower')", 4000], ['highway', "Flow.startArcade('highway')", 4000], ['timeattack', "Flow.startArcade('timeattack')", 4000], ['mayhem', "Flow.startArcade('mayhem')", 4000], ['daily', "Flow.startArcade('daily')", 4000], ['weekly', "Flow.startArcade('weekly')", 4000]]) {
    const r = await p.evaluate(([bot, snapSrc, start, n]) => {
      const snap = eval(snapSrc); let rec = null; const s0 = step;
      step = function () { const r = s0.apply(this, arguments); if (rec && G.state === 'PLAY' && (REC.on || REPLAY.on)) rec.push(snap()); return r; };
      try {
        rec = []; const live = rec; const rep = eval(bot)(start, n);
        try { Flow.quit(true); } catch (e) { }
        rec = []; const again = rec; const st = REPLAY.start(rep, { fast: true }); let k = 0; while (REPLAY.on && k < 40000) { REPLAY.tick(); k++; }
        rec = null; try { Flow.quit(true); } catch (e) { } UI.openTitle();
        let first = null; for (let i = 0; i < Math.min(live.length, again.length) && !first; i++) for (let f = 0; f < live[i].length; f++) if (live[i][f] !== again[i][f]) { first = { i, f, live: live[i], rep: again[i] }; break; }
        return { st, n: live.length, m: again.length, first, score: rep.hdr.sc, desync: REPLAY.desync };
      } finally { step = s0; }
    }, [BOT, SNAP, start, n]);
    if (r.first) fail(`${label}: tick ${r.first.i} differs in ${FIELDS[r.first.f]} — live ${JSON.stringify(r.first.live)} replay ${JSON.stringify(r.first.rep)}`);
    else if (r.n < 50) fail(`${label}: the run did not start (${r.n} ticks)`);
    else if (r.m < r.n) fail(`${label}: replay stopped after ${r.m} of ${r.n} ticks`);
    else ok(`${label}: ${r.n} ticks identical, score ${r.score}`);
  }
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function compat(b, url) {
  console.log('compat: replays recorded on older versions');
  const p = await boot(b, url);
  for (const f of fs.readdirSync(path.join(__dirname, 'fixtures')).filter(f => f.endsWith('.json')).sort()) {
    const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8'));
    const r = await p.evaluate(rep => { const st = REPLAY.start(rep, { fast: true }); let n = 0; while (REPLAY.on && n < 40000) { REPLAY.tick(); n++; } const out = { st, score: G.score | 0, desync: REPLAY.desync, v: VERSION }; try { Flow.quit(true); } catch (e) { } UI.openTitle(); return out; }, fx.replay);
    if (r.score === fx.score && !(r.desync >= 0)) ok(`${f} (recorded on ${fx.recordedOn}): score ${r.score} on ${r.v}`);
    else fail(`${f} (recorded on ${fx.recordedOn}): expected score ${fx.score}, got ${r.score}, desync at ${r.desync}`);
  }
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function sweep(b, url) {
  console.log(`sweep: every mode and a stage per chapter, ${SECS}s each in real time, 2D and 3D`);
  const p = await boot(b, url, { width: 1280, height: 720 });
  await p.evaluate(() => {
    try { Object.defineProperty(W3D, 'slow', { get: () => false, set() { }, configurable: true }); } catch (e) { }
    Store.data.story.unlocked = 999;
    window.__bot = setInterval(() => { try {
      if (Dlg.active) Dlg.next(); if (UI.cur === 'comic') Comic.end(); if (UI.cur === 'intro') Intro.end(); if (Tut.cur) Tut.dismiss();
      if (G.state === 'PERK') { const c = document.querySelector('#s-perk .perk'); if (c) c.click(); } if (G.state === 'ROUTE') { const c = document.querySelector('#s-route .route'); if (c) c.click(); }
      if (G.state === 'PLAY' && In.buf <= 0) { let best = null, bd = 1e9; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0) continue; const q = Math.hypot(e.x - P.x, e.y - P.y); if (q < bd) { bd = q; best = e; } } const B = Boss.cur;
        if (B && B.enter >= 1 && (!best || Math.hypot(B.x - P.x, B.y - P.y) < bd)) best = B; In.buf = .22; In.ba = best ? Math.atan2(best.y - P.y, best.x - P.x) : Math.random() * 6.28; }
      if (G.state === 'PLAY') P.hp = Math.max(P.hp, 2);
    } catch (e) { } }, 180);
  });
  const stages = await p.evaluate(() => { const out = [], seen = {}; for (const s of STAGES) { if (s.secret) continue; if (!seen[s.ch]) { seen[s.ch] = 1; out.push(s.id); } } const z = STAGES.find(s => s.secret); if (z) out.push(z.id); return out; });
  const modes = ['endless', 'bossrush', 'arena', 'tower', 'highway', 'timeattack', 'mayhem', 'daily', 'weekly', 'dojo'];
  for (const gfx of [0, 1]) {
    await p.evaluate(g => { Store.data.settings.d3 = g; }, gfx);
    const runs = modes.map(m => [m, `Flow.startArcade('${m}')`]).concat(stages.map(id => ['story ' + id, `__OD.startStory(STAGES.findIndex(s => s.id === '${id}'))`]));
    let bad = 0;
    for (const [label, start] of runs) {
      p.__errs.length = 0; await p.evaluate(() => { ERRLOG.a.length = 0; });
      await p.evaluate(start); await p.waitForTimeout(SECS * 1000);
      const r = await p.evaluate(() => ({ st: G.state, log: ERRLOG.a.map(q => q.c + 'x ' + q.m + ' @ ' + (q.s || '')).concat(typeof R3 !== 'undefined' && R3.err ? ['R3 ' + R3.err] : []) }));
      await p.evaluate(() => { try { if (G.state === 'PAUSE') Flow.togglePause(); Flow.quit(true); } catch (e) { } try { UI.openTitle(); } catch (e) { } }); await p.waitForTimeout(250);
      const errs = p.__errs.concat(r.log);
      if (errs.length) { bad++; fail(`${gfx ? '3D' : '2D'} ${label}: ${errs.slice(0, 3).join(' | ')}`); }
    }
    if (!bad) ok(`${gfx ? '3D' : '2D'}: ${runs.length} runs, no errors`);
  }
  await p.close();
}

(async () => {
  const s = await serve(ROOT), b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const t0 = Date.now();
  try { for (const [k, fn] of [['replay', replay], ['compat', compat], ['sweep', sweep]]) if (only.includes(k)) await fn(b, s.url); }
  catch (e) { fail('test crashed: ' + (e.stack || e)); }
  await b.close(); s.close();
  console.log(failed ? `\n${failed} FAILED` : '\nall passed', `(${((Date.now() - t0) / 1000) | 0}s)`);
  process.exit(failed ? 1 : 0);
})();
