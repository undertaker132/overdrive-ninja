
/* --- MODULE 28: v116.0 SELF-TEST — the game checks itself on the player's own machine and writes a report --- */
(function () {
  'use strict';
  // Open the game with ?selftest in the address (or SELF-TEST.html next to it). It plays itself for about a minute on
  // this machine's real screen and graphics card: 2D, the classic 3D, the 3D models from the top and the chase camera,
  // 15 seconds each, with an autopilot that cannot die. It measures the frame rate, the stutters (frames over 20 and
  // 33 ms), the draw calls, every error, the device and graphics card, takes one small picture per view, then downloads
  // a report file to send back. The save is put back exactly as it was afterwards (nothing earned, nothing lost).
  let on = false; try { on = /[?&]selftest\b/.test(location.search); } catch (e) { }
  if (!on) return;
  const QUICK = /[?&]selftest=quick\b/.test(location.search);
  const PHASES = [['2D', 0, 0], ['CLASSIC 3D', 2, 0], ['3D MODELS', 1, 0], ['CHASE CAMERA', 1, 1]], SECS = QUICK ? 15 : 12;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:99999;padding:10px 12px;border-radius:10px;background:rgba(5,8,20,.88);color:#cfefff;font:600 13px/1.45 system-ui,sans-serif;border:1px solid #00f2fe;pointer-events:none;direction:ltr;text-align:left';
  const say = t => { box.textContent = t; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const gpu = () => { try { const c = document.createElement('canvas'), g = c.getContext('webgl'); if (!g) return 'no WebGL'; const x = g.getExtension('WEBGL_debug_renderer_info'); return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) + ' | ' + g.getParameter(x.UNMASKED_VENDOR_WEBGL) : g.getParameter(g.RENDERER); } catch (e) { return 'unknown'; } };
  function shot() { // a small picture of what is on screen: the 3D layer under the 2D one, taken right after the game drew
    return new Promise(res => requestAnimationFrame(() => { try {
      const W = 240, k = W / cv.width, H = Math.round(cv.height * k), c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (const el of [typeof R3 !== 'undefined' && R3.on && R3.rn && R3.rn.domElement, typeof GL3D !== 'undefined' && GL3D.cv && GL3D.cv.style.display !== 'none' && GL3D.cv, cv]) if (el) try { g.drawImage(el, 0, 0, W, H); } catch (e) { }
      res(c.toDataURL('image/jpeg', .6)); } catch (e) { res(''); } }));
  }
  function bot() { // aim at the nearest enemy and dash; never die; pick the first perk and route; close tips
    try {
      if (Tut.cur) Tut.dismiss(); P.hp = Math.max(P.hp, 2);
      if (G.state === 'PERK') { const c = document.querySelector('#s-perk .perk'); if (c) c.click(); }
      if (UI.cur === 'route') { const c = document.querySelector('#s-route button.route'); if (c) c.click(); }
      if (G.state === 'PLAY' && In.buf <= 0) { let best = null, bd = 1e9; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0) continue; const q = Math.hypot(e.x - P.x, e.y - P.y); if (q < bd) { bd = q; best = e; } } const B = Boss.cur; if (B && B.enter >= 1 && (!best || Math.hypot(B.x - P.x, B.y - P.y) < bd * 1.5)) best = B; In.buf = .3; In.ba = best ? Math.atan2(best.y - P.y, best.x - P.x) : -1.57; }
    } catch (e) { }
  }
  async function run() {
    document.body.appendChild(box); say('Overdrive self-test: starting…');
    for (let i = 0; i < 100 && !(document.getElementById('bootGo') && !document.getElementById('bootGo').classList.contains('hidden')); i++) await wait(200);
    try { document.getElementById('bootGo').click(); } catch (e) { }
    await wait(1500);
    const snap = JSON.stringify(Store.data), errs = [], onErr = e => errs.push(String(e && (e.message || e.reason && e.reason.message || e.reason) || e).slice(0, 200));
    window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr);
    const err0 = (ERRLOG.a || []).length, rep = { v: VERSION, when: new Date().toISOString(), ua: navigator.userAgent, cores: navigator.hardwareConcurrency || 0, mem: navigator.deviceMemory || 0, screen: [screen.width, screen.height, devicePixelRatio], view: [innerWidth, innerHeight], gpu: gpu(), lang: LANG && LANG.id, phases: [] };
    for (const [name, d3, chase] of PHASES) {
      say('Self-test: ' + name + ' (' + SECS + ' s)…');
      const s = Store.data.settings; s.r3m = 1; s.d3 = d3; s.chase108 = chase; s.tips = 0; Store.data.uiAll = 1; Store.data.seenVer = VERSION;
      try { if (G.state !== 'MENU') Flow.quit(true); } catch (e) { }
      try { Flow.startArcade('endless'); } catch (e) { errs.push('start: ' + e.message); continue; }
      const bt = setInterval(bot, 80); await wait(2500); // (models load, the intro card passes)
      const dts = []; let last = 0, live = true; const tick = t => { if (last) dts.push(t - last); last = t; if (live) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      let calls = 0, tris = 0, n = 0, threeD = 0, chaseOn = 0; const t0 = performance.now();
      let rr0 = null; try { if (R3.rn) { R3.rn.info.autoReset = false; rr0 = R3.render; R3.render = function () { R3.rn.info.reset(); return rr0.apply(R3, arguments); }; } } catch (e) { } // (count every pass of a frame, not only the last)
      while (performance.now() - t0 < SECS * 1000) { await wait(500); try { if (R3.on && R3.rn) { calls += R3.rn.info.render.calls; tris += R3.rn.info.render.triangles; n++; } if (W3D.live) threeD++; if (window.ChaseCam108 && window.ChaseCam108.on()) chaseOn++; } catch (e) { } say('Self-test: ' + name + ' — ' + Math.ceil(SECS - (performance.now() - t0) / 1000) + ' s'); }
      live = false; const img = await shot(); clearInterval(bt); try { if (rr0) { R3.render = rr0; R3.rn.info.autoReset = true; } } catch (e) { }
      const sorted = dts.slice().sort((a, b) => a - b), avg = dts.reduce((a, b) => a + b, 0) / Math.max(1, dts.length), p99 = sorted[Math.floor(sorted.length * .99)] || 0;
      rep.phases.push({ name, frames: dts.length, fps: +(1000 / avg).toFixed(1), low1: +(1000 / Math.max(1, p99)).toFixed(1), over20ms: dts.filter(d => d > 20).length, over33ms: dts.filter(d => d > 33).length, worstMs: Math.round(sorted[sorted.length - 1] || 0),
        quality: typeof Q !== 'undefined' ? Q.lvl : null, r3: typeof R3 !== 'undefined' && R3.q, calls: n ? Math.round(calls / n) : 0, tris: n ? Math.round(tris / n) : 0, threeDOn: threeD, chaseOn, res: typeof R3 !== 'undefined' && R3.pr0, img });
    }
    if (!QUICK) { try { rep.checks = await fullCheck(errs); } catch (e) { errs.push('full check: ' + e.message); } }
    try { Flow.quit(true); } catch (e) { }
    window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr);
    rep.errors = errs.slice(0, 40); rep.gameErrors = (ERRLOG.a || []).slice(err0).map(e => ({ m: e.m, s: e.s, c: e.c }));
    try { Store.data = JSON.parse(snap); Store.touch(); Store.flush(true); } catch (e) { } // (the save exactly as it was)
    const txt = JSON.stringify(rep), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = 'overdrive-selftest-' + rep.when.slice(0, 19).replace(/[:T]/g, '-') + '.json';
    document.body.appendChild(a); a.click();
    box.style.pointerEvents = 'auto';
    box.innerHTML = '';
    const h = document.createElement('div'); h.textContent = 'Self-test done. The report was saved to your Downloads (' + a.download + '). Send that file back.'; box.appendChild(h);
    for (const p of rep.phases) { const d = document.createElement('div'); d.textContent = p.name + ': ' + p.fps + ' FPS (1% low ' + p.low1 + '), ' + p.over33ms + ' long frames, 3D ' + (p.threeDOn ? 'on' : 'off'); box.appendChild(d); }
    if (rep.checks) { const bad = rep.checks.filter(c => !c.ok); const d = document.createElement('div'); d.textContent = 'Full check: ' + (rep.checks.length - bad.length) + ' / ' + rep.checks.length + ' OK' + (bad.length ? ' — problems: ' + bad.slice(0, 6).map(c => c.what).join(', ') : ''); d.style.color = bad.length ? '#ff8a8a' : '#7dffb0'; box.appendChild(d); }
    const e = document.createElement('div'); e.textContent = 'Errors: ' + (rep.errors.length + rep.gameErrors.length); box.appendChild(e);
    const b = document.createElement('button'); b.textContent = 'Download the report again'; b.style.cssText = 'margin-top:6px;padding:6px 10px;border-radius:8px;border:0;background:#00f2fe;color:#000;font-weight:800'; b.onclick = () => a.click(); box.appendChild(b);
    window.__SELFTEST = rep;
  }
  // ---------------- the full check: every screen, every mode, a stage of every chapter, every skin ----------------
  async function fullCheck(errs) {
    const out = [], log0 = () => (ERRLOG.a || []).length, mark = () => [errs.length, log0()];
    const since = m => errs.slice(m[0]).concat((ERRLOG.a || []).slice(m[1]).map(q => q.m)).slice(0, 4);
    const put = (what, m, extra) => { const e = since(m); out.push(Object.assign({ what, ok: !e.length && !(extra && extra.bad), errors: e }, extra || {})); };
    const s = Store.data.settings; s.r3m = 1; s.d3 = 1; s.chase108 = 0; Store.data.story.unlocked = 999;
    const bt = setInterval(() => { bot(); try { if (Dlg.active) Dlg.next(); if (UI.cur === 'comic') Comic.end(); if (UI.cur === 'intro') Intro.end(); } catch (e) { } }, 90);
    // screens: opened one by one; anything that spills off the screen is reported
    try { Flow.quit(true); } catch (e) { }
    const screens = [['home', () => UI.openTitle()], ['story map', () => UI.openStory()], ['arcade', () => UI.openArcade()], ['arsenal', () => UI.openArsenal()], ['settings', () => UI.openSettings()], ['profile', () => UI.openProfile()], ['what\'s new', () => UI.openNews()], ['music', () => UI.openMusic()], ['device', () => UI.openDevice()], ['save code', () => UI.openSave()], ['season', () => UI.openSeason()], ['puzzles', () => UI.openPuzzles()], ['play live', () => UI.openLive()], ['legend bosses', () => UI.openLegend()]];
    for (const [name, open] of screens) {
      say('Full check: screen ' + name); const m = mark();
      try { open(); } catch (e) { errs.push(name + ': ' + e.message); }
      await wait(700);
      const spill = []; try { const sec = document.querySelector('section.scr:not(.hidden)'); if (sec) for (const el of sec.querySelectorAll('button, .btn, .chip, h1, h2, .panel, input')) { const r = el.getBoundingClientRect(); if (!r.width) continue; const sc = el.closest('[style*="overflow"], .settabs, .rail107, .tabs'); if (sc) continue; if (r.right > innerWidth + 2 || r.left < -2) spill.push((el.id || el.textContent || el.tagName).trim().slice(0, 24)); } } catch (e) { }
      put('screen: ' + name, m, { spill: spill.slice(0, 4), bad: spill.length > 0 });
    }
    // every mode, 5 seconds each with the autopilot
    for (const mode of ['endless', 'bossrush', 'arena', 'tower', 'highway', 'timeattack', 'mayhem', 'daily', 'weekly', 'dojo']) {
      say('Full check: mode ' + mode); const m = mark(); let st = '';
      try { try { if (G.state !== 'MENU') Flow.quit(true); } catch (e) { } Flow.startArcade(mode); await wait(5000); st = G.state; } catch (e) { errs.push(mode + ': ' + e.message); }
      put('mode: ' + mode, m, { state: st, bad: !/PLAY|PAUSE|PERK|DIALOG|OVER|CLEAR|ROUTE/.test(st) });
    }
    // a stage of every chapter (the first of each), 4 seconds each
    const stages = []; try { const seen = {}; STAGES.forEach((q, i) => { if (!q.secret && !seen[q.ch]) { seen[q.ch] = 1; stages.push(i); } }); } catch (e) { }
    for (const i of stages) {
      const id = STAGES[i].id; say('Full check: story ' + id); const m = mark(); let st = '';
      try { try { if (G.state !== 'MENU') Flow.quit(true); } catch (e) { } window.__OD.startStory(i); await wait(4000); st = G.state; } catch (e) { errs.push('story ' + id + ': ' + e.message); }
      put('story: ' + id, m, { state: st, bad: !/PLAY|PAUSE|PERK|DIALOG|OVER|CLEAR|ROUTE|MENU/.test(st) });
    }
    // every hero skin, on the 3D hero in a run
    try { if (G.state !== 'MENU') Flow.quit(true); } catch (e) { } Flow.startArcade('endless'); await wait(3000);
    const skins = [...new Set(SKINS.map(k => k.id))]; let badSk = [];
    for (const id of skins) { say('Full check: skin ' + id); const m = mark(); try { const sk = skinLook(id); P.skin = sk; P.ca = sk.a; P.cb = sk.b; } catch (e) { errs.push('skin ' + id + ': ' + e.message); } await wait(250); const e = since(m); if (e.length) badSk.push(id + ': ' + e[0]); }
    out.push({ what: 'skins: ' + skins.length + ' on the 3D hero', ok: !badSk.length, errors: badSk.slice(0, 6) });
    clearInterval(bt); return out;
  }
  window.addEventListener('load', () => setTimeout(() => run().catch(e => say('Self-test failed: ' + e.message)), 300));
})();
