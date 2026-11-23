
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
