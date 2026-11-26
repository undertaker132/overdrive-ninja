// The game's browser tests. usage: node tests/run.js [replay,compat,sweep] [--secs N]
//   replay  live bot runs vs their replays, compared tick by tick (every mode that records replays)
//   compat  replays recorded on older versions (tests/fixtures) must play back to the same score
//   pace    a new player starts with the newer systems closed; they open with the story
//   ghost   the daily saves your best attempt of the day and the next daily races it
//   voice   story lines, the radio and the announcer never cut each other off; voices match the character
//   story   one stage of every objective type is played to STAGE CLEAR and its results screen
//   leftovers nothing from the in-run HUD stays on the results or title screen
//   first   a new player on a phone sees only the story and is playing within 30 taps
//   economy two currencies (credits and cores); an old save's prisms and shards convert without loss
//   chase   the third-person camera: hero in frame, touch lands where it points, TOP restores the classic camera
//   sweep   every arcade mode and a story stage per chapter, played in real time in 2D and 3D; no errors allowed
// Needs Playwright with Chromium. Exit code 1 on any failure.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const { serve, boot, BOT, ROOT } = require('./lib');
const args = process.argv.slice(2), only = (args.find(a => !a.startsWith('--') && isNaN(+a)) || 'replay,compat,pace,ghost,voice,story,leftovers,first,economy,chase,sweep').split(',');
const SECS = +(args[args.indexOf('--secs') + 1] || 4);
let failed = 0; const fail = m => { failed++; console.log('  FAIL', m); }, ok = m => console.log('  ok  ', m);

const SNAP = `() => [TICK.n, Boss.cur ? Boss.cur.id + ':' + Math.round(Boss.cur.hp * 100) : '-', Math.round(P.x * 64), Math.round(P.y * 64), P.hp, +P.ch.toFixed(3), G.score | 0, G.kills | 0, EN.n, BU.n, R.s >>> 0, G.combo | 0, G.od | 0, Math.round(P.face * 1e4), Math.round(P.ang * 1e4)]`;
const FIELDS = ['tick', 'boss', 'x', 'y', 'hp', 'ch', 'score', 'kills', 'enemies', 'bullets', 'rng', 'combo', 'od', 'face', 'ang'];

async function replay(b, url) {
  console.log('replay: live run vs its replay, tick by tick');
  const p = await boot(b, url); await p.evaluate(pet => { Store.data.story.unlocked = 999; if (pet) { Store.data.pet = pet; Store.data.pets = Object.assign(Store.data.pets || {}, { [pet]: 1 }); } }, process.env.PET || '');
  for (const [label, start, n] of [['endless', "Flow.startArcade('endless')", 6000], ['bossrush', "Flow.startArcade('bossrush')", 6000], ['arena', "Flow.startArcade('arena')", 4000], ['tower', "Flow.startArcade('tower')", 4000], ['highway', "Flow.startArcade('highway')", 4000], ['timeattack', "Flow.startArcade('timeattack')", 4000], ['mayhem', "Flow.startArcade('mayhem')", 4000], ['daily', "Flow.startArcade('daily')", 4000], ['weekly', "Flow.startArcade('weekly')", 4000], ['bossrush, every heat pact', "Store.data.settings.heat92 = { hyperBoss: 1, doubleElite: 1, bulletStorm: 1, fragile: 1, crimsonVel: 1 }; Flow.startArcade('bossrush')", 5000]]) {
    const r = await p.evaluate(([bot, snapSrc, start, n]) => {
      const snap = eval(snapSrc); let rec = null; const s0 = step;
      step = function () { const r = s0.apply(this, arguments); if (rec && G.state === 'PLAY' && (REC.on || REPLAY.on)) rec.push(snap()); return r; };
      try {
        rec = []; const live = rec; const rep = eval(bot)(start, n);
        try { Flow.quit(true); } catch (e) { }
        rec = []; const again = rec; const st = REPLAY.start(rep, { fast: true }); let k = 0; while (REPLAY.on && k < 40000) { REPLAY.tick(); k++; }
        rec = null; try { Flow.quit(true); } catch (e) { } Store.data.settings.heat92 = {}; UI.openTitle();
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

async function pace(b, url) {
  console.log('pace: a new player meets the newer systems one by one');
  const p = await boot(b, url);
  const r = await p.evaluate(() => { const d = Store.data, keep = [d.uiAll, d.story.unlocked, d.uiTold], o = {};
    d.uiAll = 0; d.uiTold = {}; d.settings.heat92 = { hyperBoss: 1 };
    d.story.unlocked = 0; o.fresh = Object.entries(Sim98.snap().f).filter(([k, v]) => v && k !== 'cutin91').map(([k]) => k); o.heat0 = HeatPact92.totalHeat(); HeatPact92.tickUI(); o.btn0 = HeatPact92.btnEl.style.display;
    d.story.unlocked = 99; o.later = Object.values(Sim98.snap().f).every(Boolean); o.heat = HeatPact92.totalHeat(); HeatPact92.tickUI(); o.btn = HeatPact92.btnEl.style.display;
    [d.uiAll, d.story.unlocked, d.uiTold] = keep; d.settings.heat92 = {}; return o; });
  if (r.fresh.length || r.heat0 || r.btn0 !== 'none') fail('new player: systems already on ' + JSON.stringify(r)); else ok('new player: the newer systems and the heat pact start closed');
  if (!r.later || r.heat !== 2) fail('later in the story: not everything opened ' + JSON.stringify(r)); else ok('later in the story: every system and the heat pact are open');
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function ghost(b, url) {
  console.log('ghost: the daily remembers your best attempt of the day and races you with it');
  const p = await boot(b, url);
  const r = await p.evaluate(bot => { const o = {}; localStorage.removeItem('overdrive_ghost104_daily');
    eval(bot)("Flow.startArcade('daily')", 3000);
    // (a daily can reach a perk choice inside the bot's first seconds, depending on the day: pick one and go on)
    for (let i = 0; i < 600 && (G.state === 'PLAY' || G.state === 'PERK'); i++) { if (G.state === 'PERK') { const c = document.querySelector('#s-perk .perk'); if (c) c.click(); continue; } P.hp = 0; P.inv = 0; safeStep(); }
    o.over = G.state; o.score = G.score | 0; try { Flow.quit(true); } catch (e) { } UI.openTitle();
    const g = JSON.parse(localStorage.getItem('overdrive_ghost104_daily') || 'null'); o.saved = g && g.s;
    Flow.startArcade('daily'); o.playOn = Ghost.playOn; o.frames = Ghost.play && Ghost.play.n;
    try { Flow.quit(true); } catch (e) { } UI.openTitle(); localStorage.removeItem('overdrive_ghost104_daily'); return o; }, BOT);
  if (r.over !== 'OVER' || r.saved !== r.score) fail('the daily ghost was not saved ' + JSON.stringify(r)); else ok(`daily ghost saved at ${r.score}`);
  if (!r.playOn || !(r.frames > 5)) fail('the next daily does not race the ghost ' + JSON.stringify(r)); else ok(`the next daily races it (${r.frames} positions)`);
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function voice(b, url) {
  console.log('voice: the cast, the radio and the announcer share one speech engine without cutting each other off');
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    const V = [['Microsoft Asaf - Hebrew (Israel)', 'he-IL'], ['Carmit', 'he-IL'], ['Microsoft David - English (United States)', 'en-US'], ['Microsoft Zira - English (United States)', 'en-US']].map(([name, lang]) => ({ name, lang, voiceURI: name }));
    window.__said = []; let cur = null;
    const SS = { speaking: false, paused: false, getVoices: () => V, cancel() { cur = null; this.speaking = false; }, speak(u) { cur = u; this.speaking = true; window.__said.push(u.voice ? u.voice.name : '-'); }, resume() { }, addEventListener() { } };
    Object.defineProperty(window, 'speechSynthesis', { value: SS }); window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    window.__end = () => { if (cur && cur.onend) { const u = cur; cur = null; SS.speaking = false; u.onend(); } };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url + 'index.html'); await p.waitForSelector('#bootGo:not(.hidden)'); await p.click('#bootGo'); await p.waitForTimeout(800);
  const said = await p.evaluate(() => { const d = Store.data; d.uiAll = 1; d.settings.lang = 'he'; applyLang(); d.settings.voice = 1; d.settings.cvoice = 1; __end(); __said.length = 0;
    Voices.speak('M', 'שלום', 'hi'); Aud.say('Boss destroyed', 1); Voices.speak('K', 'רדיו', 'radio', .6); __end();
    Voices.speak('K', 'שלום', 'hi'); __end(); Aud.say('Boss destroyed', 1); return __said; });
  const want = ['Carmit', 'Microsoft Asaf - Hebrew (Israel)', 'Microsoft David - English (United States)'];
  if (JSON.stringify(said) !== JSON.stringify(want)) fail('voices: expected ' + JSON.stringify(want) + ', got ' + JSON.stringify(said)); else ok('Mika speaks with a female voice, Kage with a male one, nothing cuts a story line off');
  for (const e of errs) fail('page error: ' + e);
  await ctx.close();
}

// a bot that knows each objective (stand on terminals, touch shards, cut nodes, catch the courier, reflect shots...);
// it cannot die and the cargo cannot be lost: this checks that every kind of stage can be finished, not how hard it is
const STORY_BOT = `(function (i) {
  const st = STAGES[i], o = st.obj || {};
  const step1 = () => { safeStep(); Flow.update(CFG.step); if (Dlg.active) Dlg.next(); if (UI.cur === 'comic') Comic.end(); if (UI.cur === 'intro') Intro.end(); if (Tut.cur) { Tut.cur.t = 1; Tut.dismiss(); }
    if (G.state === 'PERK') { const c = document.querySelector('#pkList .perk, #s-perk .perk'); if (c) c.click(); } if (G.state === 'ROUTE') { const c = document.querySelector('#s-route .route, #s-route button'); if (c) c.click(); } };
  const near = () => { let best = null, bd = 1e9; for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!e.alive || e.al > 0) continue; const q = Math.hypot(e.x - P.x, e.y - P.y); if (q < bd) { bd = q; best = e; } } const B = Boss.cur; if (B && B.enter >= 1 && (!best || Math.hypot(B.x - P.x, B.y - P.y) < bd * 1.5)) best = B; return best; };
  const go = (x, y) => { P.x = x; P.y = y; P.vx = P.vy = 0; };
  __OD.startStory(i); let k = 0;
  for (; k < 30000; k++) {
    if (G.state === 'CLEAR' || G.state === 'OVER') break;
    if (G.state === 'PLAY') {
      P.hp = Math.max(P.hp, 3); if (o.t === 'combo') P.inv = Math.max(P.inv, .3); if (Arena.uplink) Arena.uplink.hp = Math.max(Arena.uplink.hp, Arena.uplink.mhp * .5);
      let tg = null, stay = false;
      if (o.t === 'hack') { const t = Arena.terms.find(t => !t.done); if (t) { go(t.x, t.y); stay = true; } }
      else if (o.t === 'collect') { const s2 = Obj2.sh[0]; if (s2) go(s2.x, s2.y); }
      else if (o.t === 'nodes') { const nd = Arena.nodes.find(q => q.alive); if (nd) { if (k % 20 === 0) go(nd.x, nd.y + 90); tg = nd; } }
      else if (o.t === 'courier') { const c = Director.courier; if (c && c.alive) tg = c; }
      else if (o.t === 'reflect') { let bb = null, bd = 1e9; for (let j = 0; j < BU.n; j++) { const q = BU.a[j]; if (!q.alive || q.rf) continue; const dd = Math.hypot(q.x - P.x, q.y - P.y); if (dd < bd) { bd = dd; bb = q; } } if (bb && bd < 140) tg = bb; }
      const cad = o.t === 'combo' ? 12 : 18; if (!stay && k % cad === 0) { const t = tg || near(); slash(t ? Math.atan2(t.y - P.y, t.x - P.x) : (k / cad) % 6.28); }
    }
    step1();
  }
  const end = G.state; let k2 = 0; if (end === 'CLEAR') for (; k2 < 4000 && UI.cur !== 'result'; k2++) step1();
  const out = { id: st.id, obj: o.t, end, ui: UI.cur, t: G.time | 0, err: ERRLOG.a.map(q => q.m).slice(0, 2) };
  try { Flow.quit(true); } catch (e) { } UI.openTitle(); return out;
})`;

async function story(b, url) {
  console.log('story: one stage of every objective type is played to STAGE CLEAR and its results screen');
  const p = await boot(b, url);
  const picks = await p.evaluate(() => { Store.data.story.unlocked = 999; const seen = {}, out = []; STAGES.forEach((s, i) => { const t = s.obj && s.obj.t; if (t && !seen[t] && stageOpen(i)) { seen[t] = 1; out.push(i); } }); return out; });
  for (const i of picks) {
    const r = await p.evaluate(([bot, i]) => { ERRLOG.a.length = 0; return eval(bot)(i); }, [STORY_BOT, i]);
    if (r.end !== 'CLEAR' || r.ui !== 'result' || r.err.length) fail(`${r.id} (${r.obj}): ended ${r.end} on ${r.ui} after ${r.t}s ${r.err.join(' | ')}`); else ok(`${r.id} (${r.obj}): cleared in ${r.t}s, results shown`);
  }
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function leftovers(b, url) {
  console.log('leftovers: nothing from the in-run HUD stays on the results or title screen');
  const p = await boot(b, url); let bad = 0;
  for (const m of ['endless', 'bossrush']) {
    await p.evaluate(m => { Flow.startArcade(m); window.__b = setInterval(() => { try { if (Tut.cur) Tut.dismiss(); if (G.state === 'PERK') { const c = document.querySelector('#s-perk .perk'); if (c) c.click(); } if (G.state === 'PLAY' && In.buf <= 0) { In.buf = .2; In.ba = Math.random() * 6.28; } } catch (e) { } }, 150); }, m);
    await p.waitForTimeout(7000);
    await p.evaluate(() => { clearInterval(window.__b); for (let i = 0; i < 900 && G.state === 'PLAY'; i++) { P.hp = 0; P.inv = 0; safeStep(); } }); await p.waitForTimeout(2500);
    for (const where of ['results', 'title']) {
      if (where === 'title') { await p.evaluate(() => UI.openTitle()); await p.waitForTimeout(1200); }
      const left = await p.evaluate(() => { const out = [], scr = document.querySelector('.scr:not(.hidden)');
        for (const e of document.body.querySelectorAll('*')) { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05 || e.closest('.scr') || e.closest('.unlock39') || e.id === 'viz88') continue;
          const r = e.getBoundingClientRect(), t = (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40); if (r.width < 4 || r.height < 4 || !t) continue; if (/modal|toast|ach/i.test(e.className + e.id)) continue; out.push('#' + e.id + ' "' + t + '"'); }
        return out; });
      if (left.length) { bad++; fail(`${m} ${where}: still on screen ${left.slice(0, 4).join(', ')}`); }
    }
  }
  if (!bad) ok('results and title screens are clean after endless and boss rush');
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function first(b, url) {
  console.log('first: a new player on a phone, tapping through, is playing within 30 taps');
  const { devices } = require('playwright');
  const ctx = await b.newContext({ ...devices['Pixel 5'], locale: 'he-IL' }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url + 'index.html'); await p.waitForSelector('#bootGo:not(.hidden)'); await p.tap('#bootGo'); await p.waitForTimeout(1200);
  const bar = await p.evaluate(() => [...document.querySelectorAll('#cmdbar98 > *')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.id));
  if (bar.length) fail('new player home screen shows extra buttons: ' + bar.join(', ')); else ok('the home screen shows a new player only the story');
  await p.tap('#bStory'); let taps = 1, st = '';
  for (; taps < 40; taps++) { await p.waitForTimeout(600); st = await p.evaluate(() => G.state + '/' + UI.cur); if (st.startsWith('PLAY')) break; await p.tap('body', { position: { x: 195, y: 650 } }); }
  if (!st.startsWith('PLAY')) fail(`not playing after ${taps} taps (${st})`); else ok(`playing stage 1-1 after ${taps} taps`);
  for (const e of errs) fail('page error: ' + e);
  await ctx.close();
}

async function economy(b, url) {
  console.log('economy: two currencies; an old save keeps everything it had');
  const p = await boot(b, url);
  const r = await p.evaluate(() => { const d = Store.data; delete d.cur107; d.bag = { crates: 2, opened: 0, sl: 0, sm: 0, shards: 345, cores: 20, prisms: 5, relic: 3 };
    const bg = Crates.bag(), once = bg.cores; Crates.bag(); return { cores: bg.cores, again: Crates.bag().cores === once, prisms: bg.prisms, shards: bg.shards, forge: FORGE_COST[5], evo: EVO_REQ.every(q => !q[2]) }; });
  if (r.cores !== 85 || !r.again || r.prisms || r.shards) fail('old save conversion: ' + JSON.stringify(r)); else ok('20 cores + 5 prisms + 345 shards became 85 cores, once');
  if (r.forge !== 80 || !r.evo) fail('prices still in old materials: ' + JSON.stringify(r)); else ok('forge and evolution are priced in cores');
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function chase(b, url) {
  console.log('chase: the third-person camera, its roof layer, its walls, its touch aim and its 3D warnings');
  const p = await boot(b, url, { width: 390, height: 844 });
  await p.evaluate(() => { window.__TEST3D = true; try { Object.defineProperty(W3D, 'slow', { get: () => false, set() { }, configurable: true }); } catch (e) { } const d = Store.data; d.settings.r3m = 1; d.settings.d3 = 1; d.settings.chase108 = 1; Flow.startArcade('endless'); });
  let r = null;
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); r = await p.evaluate(() => { if (!(window.ChaseCam108 && ChaseCam108.on()) || !R3.cam || R3.cam.type !== 'PerspectiveCamera') return null;
    // the hero's spot on the screen, cast back onto the roof, lands on the hero
    const v = new THREE.Vector3(P.x, -P.y, 0).project(R3.cam), sx = (v.x * .5 + .5) * V.VW, sy = (-v.y * .5 + .5) * V.VH, q = W3D.unproj(sx, sy);
    return { err: Math.hypot(q[0] - P.x, q[1] - P.y), onScreen: Math.abs(v.x) < 1 && Math.abs(v.y) < 1, fog: !!R3.scene.fog }; }); if (r) break; }
  if (!r) { fail('the chase camera did not come on (3D models off in this browser?)'); await p.close(); return; }
  if (!r.onScreen) fail('the hero is out of the chase frame'); else ok('the camera is behind the hero and the hero is in frame');
  if (!(r.err < 3)) fail('a touch on the hero lands ' + r.err.toFixed(1) + ' units away'); else ok('a touch lands where it points (' + r.err.toFixed(2) + ' units)');
  // v110: threats in 3D, and an enemy behind the hero brings the camera up until it is in frame
  const th = await p.evaluate(() => new Promise(res => {
    for (let i = 0; i < EN.n; i++) EN.a[i].alive = false;
    const s = spawnEnemy(ET.SNIPER, P.x + 40, P.y - 260), bk = spawnEnemy(ET.BRUTE, P.x, Math.min(V.VH - 30, P.y + 150)), bo = spawnEnemy(ET.BOMBER, P.x - 120, P.y - 120);
    const hold = () => { for (const e of [s, bk, bo]) { e.spawnT = 0; e.vx = e.vy = 0; } s.st = 1; s.stT = .35; bo.fuse = .4; bk.x = P.x; bk.y = Math.min(V.VH - 30, P.y + 150); P.hp = Math.max(P.hp, 3); };
    const t0 = setInterval(hold, 16); hold();
    setTimeout(() => { clearInterval(t0); const v = new THREE.Vector3(bk.x, -bk.y, 10).project(R3.cam); for (let i = 0; i < EN.n; i++) EN.a[i].alive = false; P.hp = Math.max(P.hp, 3); P.inv = 3; /* (the run goes on for the TOP check) */ res({ c: Threats110.counts(), behind: v.y > -1 && v.y < 1 && v.z < 1, dbg: [v.x, v.y, v.z, P.y, bk.y, bk.alive, R3.cam.position.z, V.VH] }); }, 1400);
  }));
  if (!(th.c[0] >= 1 && th.c[1] >= 1 && th.c[2] >= 1)) fail('3D warnings missing (columns, walls, domes): ' + th.c.join(', ')); else ok('3D warnings stand up: ' + th.c[0] + ' column(s), ' + th.c[1] + ' wall(s), ' + th.c[2] + ' dome(s)');
  if (!th.behind) fail('an enemy right behind the hero stays out of the chase frame ' + JSON.stringify(th.dbg)); else ok('an enemy behind the hero is brought into frame');
  // v111: a touch in the sky over the far roof aims up the roof, the wind streaks run in a dash, the pause menu switches the camera
  const fe = await p.evaluate(() => new Promise(res => {
    const sky = W3D.unproj(V.VW / 2, 4), o = { skyAhead: sky[1] < P.y - 400 && Math.abs(sky[0] - P.x) < 400 && isFinite(sky[0]) };
    const hold = setInterval(() => { P.dashT = .3; P.vx = 0; P.vy = -900; P.hp = Math.max(P.hp, 3); }, 16), f0 = R3.frame, t0 = performance.now();
    const wait = () => { const s = R3.scene.children.find(c => c.isLineSegments && c.renderOrder === 6); if (!(s && s.visible) && performance.now() - t0 < 8000 || R3.frame < f0 + 3) return setTimeout(wait, 100); clearInterval(hold); o.streaks = !!(s && s.visible); /* (software 3D: a few frames a second) */
      Flow.togglePause(); const b = document.getElementById('psCam'); o.btn = b ? b.textContent : null; if (b) { b.click(); o.after = Store.data.settings.chase108; b.click(); } Flow.togglePause(); res(o); }; wait();
  }));
  if (!fe.skyAhead) fail('a touch above the horizon does not aim up the roof'); else ok('a touch above the horizon aims up the roof');
  if (!fe.streaks) fail('no wind streaks in a dash'); else ok('wind streaks run in a dash');
  if (!fe.btn || fe.after !== 0) fail('the pause menu camera switch is missing or does nothing ' + JSON.stringify(fe)); else ok('the pause menu switches the camera (' + fe.btn + ')');
  await p.waitForTimeout(1000);
  const back = await p.evaluate(() => { P.hp = Math.max(P.hp, 3); P.inv = 9; Store.data.settings.chase108 = 0; const f0 = R3.frame; return new Promise(res => { const t0 = performance.now(), chk = () => { if (R3.frame >= f0 + 3 || performance.now() - t0 > 12000) res({ cam: R3.cam && R3.cam.type, fog: !!R3.scene.fog, frames: R3.frame - f0 }); else setTimeout(chk, 100); }; chk(); }); }); // (software 3D draws a few frames a second: wait for real frames)
  if (back.cam !== 'OrthographicCamera') fail('TOP did not bring the classic camera back: ' + back.cam + ' ' + JSON.stringify(back)); else ok('TOP brings the classic camera back');
  for (const e of p.__errs) fail('page error: ' + e);
  await p.close();
}

async function sweep(b, url) {
  console.log(`sweep: every mode and a stage per chapter, ${SECS}s each in real time, in 2D, 3D, 3D MODELS and the chase camera`);
  const p = await boot(b, url, { width: 1280, height: 720 });
  await p.evaluate(() => {
    window.__TEST3D = true; // (the game keeps 3D off in automated browsers unless asked: before v108 this sweep's '3D' pass ran in 2D)
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
  const GFX = ['2D', 'CLASSIC 3D', '3D MODELS', 'CHASE CAMERA'];
  for (const gfx of [0, 1, 2, 3]) {
    await p.evaluate(g => { Store.data.settings.r3m = 1; Store.data.settings.d3 = [0, 2, 1, 1][g]; Store.data.settings.chase108 = g === 3 ? 1 : 0; /* (2D, CLASSIC 3D, 3D models, chase; r3m: no migration of the value) */ }, gfx);
    const runs = modes.map(m => [m, `Flow.startArcade('${m}')`]).concat(stages.map(id => ['story ' + id, `__OD.startStory(STAGES.findIndex(s => s.id === '${id}'))`]));
    let bad = 0, live3d = 0;
    for (const [label, start] of runs) {
      p.__errs.length = 0; await p.evaluate(() => { ERRLOG.a.length = 0; });
      await p.evaluate(start); await p.waitForTimeout(SECS * 1000);
      const r = await p.evaluate(() => ({ st: G.state, live: W3D.live, log: ERRLOG.a.map(q => q.c + 'x ' + q.m + ' @ ' + (q.s || '')).concat(typeof R3 !== 'undefined' && R3.err ? ['R3 ' + R3.err] : []) }));
      await p.evaluate(() => { try { if (G.state === 'PAUSE') Flow.togglePause(); Flow.quit(true); } catch (e) { } try { UI.openTitle(); } catch (e) { } }); await p.waitForTimeout(250);
      const errs = p.__errs.concat(r.log);
      if (errs.length) { bad++; fail(`${GFX[gfx]} ${label}: ${errs.slice(0, 3).join(' | ')}`); }
      if (gfx && r.live) live3d++;
    }
    if (!bad) ok(`${GFX[gfx]}: ${runs.length} runs, no errors` + (gfx ? ` (3D really on in ${live3d})` : ''));
    if (gfx && live3d < runs.length / 2) fail(`3D was on in only ${live3d} of ${runs.length} runs`);
  }
  await p.close();
}

(async () => {
  const s = await serve(ROOT), b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const t0 = Date.now();
  try { for (const [k, fn] of [['replay', replay], ['compat', compat], ['pace', pace], ['ghost', ghost], ['voice', voice], ['story', story], ['leftovers', leftovers], ['first', first], ['economy', economy], ['chase', chase], ['sweep', sweep]]) if (only.includes(k)) await fn(b, s.url); }
  catch (e) { fail('test crashed: ' + (e.stack || e)); }
  await b.close(); s.close();
  console.log(failed ? `\n${failed} FAILED` : '\nall passed', `(${((Date.now() - t0) / 1000) | 0}s)`);
  process.exit(failed ? 1 : 0);
})();
