
/* --- MODULE 13: v106.0 ORDER — settings that fit the device, one switch per thing, one ghost --- */
(function () {
  'use strict';
  if (typeof HE !== 'undefined') Object.assign(HE, { "ONLINE": "מקוון", "Play a run to post your first high score!": "שחק ריצה כדי לרשום את השיא הראשון שלך!", "STUDIO SOUNDTRACK": "פסקול אולפן", "Pick your own music for every moment of the game. The files stay on this device.": "בחר מוזיקה משלך לכל רגע במשחק. הקבצים נשמרים רק במכשיר הזה.", "WEAPON CHIPS": "צ'יפים לנשק", "+35% Elite spawn chance": "+35% סיכוי להופעת עילית", "Enemy bullets fly +22% faster": "יריות האויבים מהירות ב-22%", "-1 Max Shield (high stakes)": "-1 מגן מקסימלי (הימור גבוה)", "Enemies move +18% faster": "האויבים זזים מהר יותר ב-18%", "Character voices": "קולות הדמויות", "GAME VOICE": "קול המשחק", "Camera follows your aim": "המצלמה עוקבת אחרי הכיוון" });
  const isDesk = () => { try { return S90.isDesk(); } catch (e) { return false; } };
  const row = id => { const b = document.getElementById(id); return b ? b.closest('.set') || b.parentElement : null; };
  const hide = id => { const r = row(id); if (r) r.style.display = 'none'; };
  // a settings row like the others: a label and a button that cycles its values
  const cycleRow = (label, key, opts, names) => {
    const s = Store.data.settings, r = el('div', 'set'); r.appendChild(el('span', '', lt(label)));
    const b = el('button', 'tog on'); b.id = 'set-' + key; b.type = 'button';
    const idx = () => { const k = opts.indexOf(s[key] == null ? opts[0] : s[key]); return k < 0 ? 0 : k; };
    b.textContent = lt(names[idx()]);
    b.onclick = () => { s[key] = opts[(idx() + 1) % opts.length]; b.textContent = lt(names[idx()]); Aud.sfx('ui'); Store.touch(); if (key === 'cvoice' && s.cvoice) Voices.speak('M', lt('Hi, Mika. Where do you want me?'), 'Hi, Mika. Where do you want me?'); /* (a sample of the voice just chosen) */ };
    r.appendChild(b); return r;
  };
  const os0 = UI.openSettings.bind(UI);
  UI.openSettings = function () {
    const r = os0.apply(this, arguments);
    try {
      const s = Store.data.settings, desk = isDesk();
      // one announcer switch: the GAMEPLAY copy goes, "Voice callouts" (SOUND) rules both
      hide('set-voice96'); s.voice96 = null;
      // the character voices and the aim camera lost their switches in the v98 redesign
      const vr = row('set-voice');
      if (vr && !document.getElementById('set-cvoice')) vr.parentElement.insertBefore(cycleRow('Character voices', 'cvoice', [1, 2, 0], ['ON', 'GAME VOICE', 'OFF']), vr.nextSibling);
      const sr = row('set-shake');
      if (sr && !document.getElementById('set-lean')) sr.parentElement.insertBefore(cycleRow('Camera follows your aim', 'lean', [1, 0], ['ON', 'OFF']), sr.nextSibling);
      // settings for the device in hand
      if (!desk) { for (const id of ['set-wasd90', 'set-instSlash90', 'set-maim', 'set-xh']) hide(id); const kt = [...document.querySelectorAll('#setTabs button')].find(b => b.textContent === S98L('KEYS')); if (kt) kt.style.display = 'none'; const ar = row('set-air96'); if (ar && ar.firstChild) ar.firstChild.textContent = ar.firstChild.textContent.replace(/\s*\[F\]/, ''); }
      else for (const id of ['set-tap', 'set-sens', 'set-lefty', 'set-haptics']) hide(id);
      // the 3D options only matter in 3D
      if (!(s.d3 > 0)) { hide('set-style3d91'); hide('set-actionCam101'); }
      const d3b = document.getElementById('set-d3'); if (d3b && !d3b.dataset.o106) { d3b.dataset.o106 = 1; d3b.addEventListener('click', () => setTimeout(() => { if (UI.cur === 'settings') UI.openSettings(); }, 0)); }
    } catch (e) { errLog(e); }
    return r;
  };
  // v107: one choice instead of twelve switches: FULL (every newer system), CLASSIC (the game before them) or CUSTOM (the switches)
  const SYS107 = ['air96', 'props96', 'events96', 'events91', 'armor96', 'clash91', 'rival91', 'awaken91', 'syn92', 'squad92'], EXTRA107 = ['ghost96', 'fcam96'];
  const styleOf = s => { if (s.style107) return s.style107; const on = SYS107.filter(k => s[k] == null || !!s[k]).length; return on === SYS107.length ? 'full' : on === 0 ? 'classic' : 'custom'; };
  const os107 = UI.openSettings.bind(UI);
  UI.openSettings = function () {
    const r = os107.apply(this, arguments);
    try {
      const s = Store.data.settings, first = row('set-air96'); if (!first || document.getElementById('set-style107')) return r;
      const opts = ['full', 'classic', 'custom'], names = ['FULL', 'CLASSIC', 'CUSTOM'];
      const rr = el('div', 'set'); rr.appendChild(el('span', '', lt('Game style')));
      const b = el('button', 'tog on'); b.id = 'set-style107'; b.type = 'button';
      const show = () => { const st = styleOf(s); b.textContent = lt(names[opts.indexOf(st)]); for (const k of SYS107.concat(EXTRA107)) { const x = row('set-' + k); if (x) x.style.display = st === 'custom' ? '' : 'none'; }
        hint.textContent = st === 'full' ? lt('Every system in the game: blade clashes, boss armor, the launcher, rail events, squads and more.') : st === 'classic' ? lt('The pure slasher: the game without the newer systems.') : lt('Pick each system yourself.'); };
      const hint = el('div', 'small mute', ''); hint.style.margin = '-4px 0 8px';
      b.onclick = () => { const st = opts[(opts.indexOf(styleOf(s)) + 1) % 3]; s.style107 = st; if (st !== 'custom') for (const k of SYS107) s[k] = st === 'full' ? 1 : 0; Aud.sfx('ui'); Store.touch(); UI.openSettings(); };
      rr.appendChild(b); first.parentElement.insertBefore(rr, first); first.parentElement.insertBefore(hint, first); show();
    } catch (e) { errLog(e); }
    return r;
  };
  if (typeof HE !== 'undefined') Object.assign(HE, { "Game style": "סגנון משחק", "FULL": "מלא", "CLASSIC": "קלאסי", "CUSTOM": "מותאם אישית",
    "Every system in the game: blade clashes, boss armor, the launcher, rail events, squads and more.": "כל המערכות במשחק: התנגשות להבים, שריון בוסים, המקפצה, אירועי מסילה, חוליות ועוד.",
    "The pure slasher: the game without the newer systems.": "הסלאשר הטהור: המשחק בלי המערכות החדשות.", "Pick each system yourself.": "בחר כל מערכת בעצמך." });
  function S98L(t) { return typeof lt === 'function' ? lt(t) : t; }

  // one ghost: the 3D ghost also runs the challenge, rival and daily ghosts (it only knew its own best before)
  try {
    const GR = window.__V96 && window.__V96.GhostRun96;
    if (GR) {
      const t0 = GR.tick.bind(GR);
      GR.tick = function (rd) {
        if (Ghost.playOn && Ghost.play && G.state === 'PLAY' && !REPLAY.on && typeof R3 !== 'undefined' && R3.ok && R3.root) {
          const q = Ghost.posAt(G.time); const saved = this.pb;
          if (q) { this.pb = { frames: [[0, q.x, q.y]] }; this.runT = 0; } // (the next draw puts it where the race ghost is)
          const r = t0(rd); this.pb = saved; return r;
        }
        return t0(rd);
      };
    }
  } catch (e) { }
})();
