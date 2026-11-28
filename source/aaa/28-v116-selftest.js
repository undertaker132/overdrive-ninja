
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
  let BOOT_MS = 0;
  async function run() {
    document.body.appendChild(box); say('Overdrive self-test: starting…');
    for (let i = 0; i < 100 && !(document.getElementById('bootGo') && !document.getElementById('bootGo').classList.contains('hidden')); i++) await wait(200);
    BOOT_MS = performance.now(); try { document.getElementById('bootGo').click(); } catch (e) { }
    await wait(1500);
    const snap = JSON.stringify(Store.data), errs = [], onErr = e => errs.push(String(e && (e.message || e.reason && e.reason.message || e.reason) || e).slice(0, 200));
    window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr);
    let wl = null; try { wl = navigator.wakeLock && await navigator.wakeLock.request('screen'); } catch (e) { } // (a phone must not sleep mid-test)
    const safe = (() => { try { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden'; document.body.appendChild(d); const c = getComputedStyle(d), r = [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft].map(v => parseFloat(v) || 0); d.remove(); return r; } catch (e) { return null; } })();
    const err0 = (ERRLOG.a || []).length, rep = { bootMs: Math.round(BOOT_MS), touch: navigator.maxTouchPoints || 0, phone: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent), orient: (screen.orientation && screen.orientation.type) || (innerWidth > innerHeight ? 'landscape' : 'portrait'), safe, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, v: VERSION, when: new Date().toISOString(), ua: navigator.userAgent, cores: navigator.hardwareConcurrency || 0, mem: navigator.deviceMemory || 0, screen: [screen.width, screen.height, devicePixelRatio], view: [innerWidth, innerHeight], gpu: gpu(), lang: LANG && LANG.id, phases: [] };
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
      const half = Math.floor(dts.length / 2), fpsOf = a => a.length ? +(1000 / (a.reduce((x, y) => x + y, 0) / a.length)).toFixed(1) : 0;
      rep.phases.push({ name, fpsFirst: fpsOf(dts.slice(0, half)), fpsLast: fpsOf(dts.slice(half)), frames: dts.length, fps: +(1000 / avg).toFixed(1), low1: +(1000 / Math.max(1, p99)).toFixed(1), over20ms: dts.filter(d => d > 20).length, over33ms: dts.filter(d => d > 33).length, worstMs: Math.round(sorted[sorted.length - 1] || 0),
        quality: typeof Q !== 'undefined' ? Q.lvl : null, r3: typeof R3 !== 'undefined' && R3.q, calls: n ? Math.round(calls / n) : 0, tris: n ? Math.round(tris / n) : 0, threeDOn: threeD, chaseOn, res: typeof R3 !== 'undefined' && R3.pr0, img });
    }
    try { rep.controls = await controlsCheck(); } catch (e) { errs.push('controls: ' + e.message); }
    if (!QUICK) { try { rep.checks = await fullCheck(errs); } catch (e) { errs.push('full check: ' + e.message); } }
    try { Flow.quit(true); } catch (e) { }
    window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr);
    rep.errors = errs.slice(0, 40); rep.gameErrors = (ERRLOG.a || []).slice(err0).map(e => ({ m: e.m, s: e.s, c: e.c }));
    try { Store.data = JSON.parse(snap); Store.touch(); Store.flush(true); } catch (e) { } // (the save exactly as it was)
    try { if (wl) wl.release(); } catch (e) { }
    try { rep.score = grade(rep); } catch (e) { rep.score = { err: e.message }; }
    const txt = JSON.stringify(rep), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = 'overdrive-selftest-' + rep.when.slice(0, 19).replace(/[:T]/g, '-') + '.json';
    document.body.appendChild(a); a.click();
    box.style.pointerEvents = 'auto'; box.style.maxHeight = '92vh'; box.style.overflowY = 'auto'; box.innerHTML = '';
    const he = LANG && LANG.id === 'he'; if (he) { box.style.direction = 'rtl'; box.style.textAlign = 'right'; }
    const add = (t, css) => { const d = document.createElement('div'); d.textContent = t; if (css) d.style.cssText = css; box.appendChild(d); return d; };
    const S = rep.score || {};
    add((he ? 'ציון כולל: ' : 'Overall: ') + (S.overall != null ? '\u2066' + S.overall + '/100 · ' + S.grade + '\u2069' : '?'), 'font:900 20px system-ui;color:' + (S.overall >= 90 ? '#7dffb0' : S.overall >= 75 ? '#ffd23f' : '#ff8a8a'));
    for (const [k, v] of Object.entries(S.parts || {})) add((S.names && S.names[k] || k) + ': \u2066' + v + '/100\u2069');
    if (S.good && S.good.length) { add(he ? 'טוב:' : 'Good:', 'margin-top:6px;color:#7dffb0;font-weight:800'); for (const t of S.good) add('✓ ' + t); }
    if (S.bad && S.bad.length) { add(he ? 'דורש תיקון:' : 'Needs work:', 'margin-top:6px;color:#ff8a8a;font-weight:800'); for (const t of S.bad) add('✗ ' + t); }
    add(he ? 'הדוח נשמר: ' + a.download + ' — שלח אותו.' : 'Report saved: ' + a.download + ' — send it back.', 'margin-top:6px;opacity:.8');
    const btn = (t, f) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'margin:6px 6px 0 0;padding:8px 12px;border-radius:8px;border:0;background:#00f2fe;color:#000;font-weight:800'; b.onclick = f; box.appendChild(b); };
    const file = (() => { try { return new File([txt], a.download, { type: 'application/json' }); } catch (e) { return null; } })();
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) btn(he ? 'שתף את הדוח' : 'Share the report', () => navigator.share({ files: [file], title: 'Overdrive self-test' }).catch(() => { }));
    btn(he ? 'הורד שוב' : 'Download again', () => a.click());
    btn(he ? 'העתק כטקסט' : 'Copy as text', () => { try { navigator.clipboard.writeText(txt); } catch (e) { } });
    window.__SELFTEST = rep;
  }
  // ---------------- controls: real pointer events on the canvas, the way a finger does it ----------------
  async function controlsCheck() {
    const s = Store.data.settings; s.r3m = 1; s.d3 = 1; s.chase108 = 0; s.tap = 1;
    try { if (G.state !== 'MENU') Flow.quit(true); } catch (e) { } Flow.startArcade('endless'); await wait(3000);
    try { if (Tut.cur) Tut.dismiss(); } catch (e) { }
    const r = cv.getBoundingClientRect(), cx0 = r.left + r.width / 2, cy0 = r.top + r.height * .6, ev = (type, x, y, tgt) => (tgt || cv).dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true }));
    const out = [];
    const ready = async () => { for (let i = 0; i < 160; i++) { try { if (Tut.cur) Tut.dismiss(); } catch (e) { } if (G.state === 'PLAY' && !(G.freeze > 0) && !(P.dashT > 0) && !(P.lock > 0)) return; await wait(50); } }; // (the run start freezes input for a moment)
    const tryMove = async (name, fn) => { await ready(); P.hp = Math.max(P.hp, 3); P.ch = Math.max(P.ch || 0, 2); const x0 = P.x, y0 = P.y; let dashed = false; const t0 = performance.now(); await fn(); while (performance.now() - t0 < 900) { if (P.dashT > 0 || Math.hypot(P.x - x0, P.y - y0) > 30) { dashed = true; break; } await wait(16); } out.push({ what: name, ok: dashed, ms: Math.round(performance.now() - t0) }); };
    await tryMove('swipe up', async () => { ev('pointerdown', cx0, cy0); for (let k = 1; k <= 6; k++) { await wait(16); ev('pointermove', cx0, cy0 - k * 18, window); } ev('pointerup', cx0, cy0 - 108, window); });
    await wait(600);
    await tryMove('swipe right', async () => { ev('pointerdown', cx0, cy0); for (let k = 1; k <= 6; k++) { await wait(16); ev('pointermove', cx0 + k * 18, cy0, window); } ev('pointerup', cx0 + 108, cy0, window); });
    await wait(600);
    await tryMove('quick tap', async () => { const q = W3D.live ? W3D.proj(P.x + 90, P.y - 60, 0) : null, k = V.s * V.dpr, x = q ? r.left + q[0] / k : cx0 + 70, y = q ? r.top + q[1] / k : cy0 - 50; ev('pointerdown', x, y); await wait(60); ev('pointerup', x, y, window); });
    return out;
  }
  // ---------------- the grade: what a player feels, scored and said plainly ----------------
  function grade(rep) {
    const he = LANG && LANG.id === 'he', T = (a, b) => he ? b : a, good = [], bad = [], L = x => '\u2066' + x + '\u2069'; // (numbers and FPS kept left-to-right inside Hebrew lines)
    const ph = n => rep.phases.find(p => p.name === n) || {};
    const smooth = p => { if (!p.frames) return 0; const f = Math.min(1, p.fps / 58), longs = p.frames ? p.over33ms / p.frames : 1; return Math.max(0, Math.round(100 * f - longs * 400)); };
    const w = { '2D': .2, 'CLASSIC 3D': .15, '3D MODELS': .4, 'CHASE CAMERA': .25 }; let perf = 0;
    for (const [n, k] of Object.entries(w)) { const p = ph(n), sc = smooth(p); perf += sc * k; const nm = T(n, { '2D': 'דו־ממד', 'CLASSIC 3D': 'תלת־ממד קלאסי', '3D MODELS': 'מודלי תלת־ממד', 'CHASE CAMERA': 'מצלמת מרדף' }[n]);
      if (sc >= 90) good.push(nm + ': ' + L(p.fps + ' FPS') + ' ' + T('smooth', 'חלק')); else bad.push(nm + ': ' + L(p.fps + ' FPS') + ' · ' + L(p.over33ms) + T(' long frames', ' פריימים ארוכים'));
      if (p.fpsFirst && p.fpsLast && p.fpsLast < p.fpsFirst * .85) bad.push(nm + T(': slows down as it runs (heat?) ', ': מאט תוך כדי (חום?) ') + L(p.fpsFirst + ' → ' + p.fpsLast + ' FPS')); }
    perf = Math.round(perf);
    const nErr = (rep.errors || []).length + (rep.gameErrors || []).length, stab = Math.max(0, 100 - nErr * 12);
    if (!nErr) good.push(T('No errors at all', 'אפס שגיאות')); else bad.push(nErr + T(' errors (in the report)', ' שגיאות (בדוח)'));
    const ch = rep.checks || [], okc = ch.filter(c => c.ok).length, content = ch.length ? Math.round(100 * okc / ch.length) : 100;
    if (ch.length) { if (okc === ch.length) good.push(T('All ', 'כל ') + ch.length + T(' screens, modes, stages and skins work', ' המסכים, המצבים, השלבים והסקינים עובדים')); else bad.push(ch.filter(c => !c.ok).map(c => c.what).slice(0, 5).join(', ')); }
    const ct = rep.controls || [], okt = ct.filter(c => c.ok).length, controls = ct.length ? Math.round(100 * okt / ct.length) : 0;
    if (ct.length && okt === ct.length) good.push(T('Touch controls answer (swipe and tap)', 'שליטת המגע מגיבה (החלקה ונגיעה)')); else bad.push(T('Touch: ', 'מגע: ') + ct.filter(c => !c.ok).map(c => c.what).join(', '));
    const small = ch.reduce((a, c) => a + (c.small || 0), 0), tiny = ch.reduce((a, c) => a + (c.tiny || 0), 0), spill = ch.filter(c => c.spill && c.spill.length).length;
    const layout = Math.max(0, 100 - spill * 10 - Math.min(30, small * 2) - Math.min(20, tiny));
    if (spill) bad.push(spill + T(' screens with parts off the screen', ' מסכים עם חלקים מחוץ למסך')); if (small) bad.push(small + T(' buttons smaller than a fingertip (under 36 px)', ' כפתורים קטנים מאצבע (מתחת ל־36 פיקסלים)')); if (tiny) bad.push(tiny + T(' texts smaller than 10 px', ' טקסטים קטנים מ־10 פיקסלים'));
    if (!spill && !small && !tiny) good.push(T('Every screen fits and reads well', 'כל המסכים נכנסים וקריאים'));
    if (rep.bootMs) (rep.bootMs < 4000 ? good : bad).push(T('Loads in ', 'נטען תוך ') + L((rep.bootMs / 1000).toFixed(1)) + T(' s', ' שניות'));
    const overall = Math.round(perf * .35 + stab * .25 + content * .2 + controls * .1 + layout * .1);
    return { overall, grade: overall >= 95 ? 'A+' : overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : 'D', parts: { perf, stability: stab, content, controls, layout },
      names: { perf: T('Smoothness', 'חלקות'), stability: T('Stability', 'יציבות'), content: T('Everything works', 'הכל עובד'), controls: T('Touch controls', 'שליטת מגע'), layout: T('Screens and layout', 'מסכים ופריסה') }, good, bad };
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
      const spill = []; try { const sec = document.querySelector('section.scr:not(.hidden)'); if (sec) for (const el of sec.querySelectorAll('button, .btn, .chip, h1, h2, .panel, input')) { const r = el.getBoundingClientRect(); if (!r.width) continue; let sc = false; for (let q = el.parentElement; q && q !== sec; q = q.parentElement) { const ox = getComputedStyle(q).overflowX; if (ox === 'auto' || ox === 'scroll') { sc = true; break; } } if (sc) continue; /* (a row that scrolls sideways holds more than fits, by design) */ if (r.right > innerWidth + 2 || r.left < -2) spill.push((el.id || el.textContent || el.tagName).trim().slice(0, 24)); } } catch (e) { }
      let small = 0, tiny = 0; try { const sec = document.querySelector('section.scr:not(.hidden)'); if (sec) { for (const el of sec.querySelectorAll('button')) { const r = el.getBoundingClientRect(); if (r.width && r.height && r.top < innerHeight && r.bottom > 0 && (r.height < 30 || r.width < 30)) small++; } for (const el of sec.querySelectorAll('div, span, p, button, label')) { if (!el.childNodes.length || el.children.length) continue; const r = el.getBoundingClientRect(); if (!r.width || r.top > innerHeight) continue; if (parseFloat(getComputedStyle(el).fontSize) < 9.5 && el.textContent.trim().length > 2) tiny++; } } } catch (e) { }
      put('screen: ' + name, m, { spill: spill.slice(0, 4), small, tiny, bad: spill.length > 0 });
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
