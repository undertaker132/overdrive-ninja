
/* --- MODULE 17: v107.0 MOODS AND ENTRANCES — portraits that react to the line, bosses that arrive like bosses --- */
(function () {
  'use strict';
  if (typeof HE !== 'undefined') Object.assign(HE, { "The SECRETS chapter opens an EX boss for every act you finish.": "פרק הסודות פותח בוס EX לכל מערכה שתסיימו.", "Finish an act to open its EX stage": "סיימו מערכה כדי לפתוח את שלב ה-EX שלה", "An EX boss for every act": "בוס EX לכל מערכה", "FIRST ENCOUNTER": "מפגש ראשון", "TAP TO SKIP": "הקש כדי לדלג" });

  /* ---- dialogue moods, read from the line itself (any language): a shout, a question, a hesitation ---- */
  const moodOf = s => {
    s = String(s || ''); const lat = s.replace(/[^A-Za-z]/g, ''), caps = lat.length > 10 && lat.replace(/[^A-Z]/g, '').length / lat.length > .75;
    if (/!/.test(s) || caps) return 'shout';
    if (/(\.\.\.|…)/.test(s)) return 'sad';
    if (/\?\s*["'”]?\s*$/.test(s)) return 'q';
    return '';
  };
  const ld0 = Dlg.load.bind(Dlg);
  Dlg.load = function () {
    const r = ld0.apply(this, arguments);
    try {
      this.mood = moodOf(this.text); this.moodT = 0;
      this.cps = this.mood === 'shout' ? 60 : this.mood === 'sad' ? 34 : 48;
      const box = $('dlg').querySelector('.box'); box.classList.remove('mood-shout', 'mood-sad', 'mood-q'); void box.offsetWidth; if (this.mood) box.classList.add('mood-' + this.mood);
    } catch (e) { }
    return r;
  };
  Dlg.drawPortrait = function () {
    if (!this.ptx) { this.pc = $('dlgPort'); this.ptx = this.pc.getContext('2d'); }
    const g = this.ptx, W = 168, t = this.pt, talking = this.shown < this.text.length, mouth = talking ? Math.abs(Math.sin(t * 18)) : 0, col = this.c.col, m = this.mood || '';
    this.moodT = (this.moodT || 0) + RDT; const mt = this.moodT, calm = CALM;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05060f'; g.fillRect(0, 0, W, W);
    const bg = g.createLinearGradient(0, 0, 0, W); bg.addColorStop(0, m === 'sad' ? '#0a1026' : '#0d1433'); bg.addColorStop(1, '#05060f'); g.fillStyle = bg; g.fillRect(0, 0, W, W);
    if (m === 'shout' && !calm) { // speed lines and a flash in the speaker's color
      const f = Math.max(0, 1 - mt * 2.5); g.save(); g.translate(84, 90); g.globalAlpha = .18 + .3 * f; g.strokeStyle = col; g.lineWidth = 2;
      for (let k = 0; k < 18; k++) { const a = k / 18 * TAU + t * .4, r0 = 52 + ((t * 120 + k * 37) % 40); g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * (r0 + 40), Math.sin(a) * (r0 + 40)); g.stroke(); }
      g.restore(); if (f > 0) { g.globalAlpha = .35 * f; g.fillStyle = col; g.fillRect(0, 0, W, W); }
    }
    g.globalAlpha = .12; g.fillStyle = col; for (let y = (t * 30) % 6; y < W; y += 6) g.fillRect(0, y, W, 2); g.globalAlpha = 1;
    g.save();
    let x = 84, y = 96 + Math.sin(t * 2) * 2;
    if (m === 'shout' && talking && !calm) { x += (Math.random() - .5) * 3.5; y += (Math.random() - .5) * 2.5; }
    if (m === 'sad') y += 3 + Math.sin(t * 1.2) * 1.2; // the head a little lower
    g.translate(x, y);
    if (m === 'q') g.rotate(-.1 * Math.min(1, mt * 4)); // a tilt of the head on a question
    if (talking) g.scale(1, 1 - .022 * mouth); // small nods with the syllables
    charPortrait(g, this.cid, t, mouth, col);
    g.restore();
    if (m === 'sad') { g.globalAlpha = .22; g.fillStyle = '#1a2a6a'; g.fillRect(0, 0, W, W); g.globalAlpha = 1; }
    g.strokeStyle = col; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, W - 4);
  };

  /* ---- the first time the story meets a boss: a longer entrance with its name cut in and a line of its own ---- */
  const quote = id => { try { const L = StoryOverhaul95.LINES[id]; if (!L || !L.p2) return ''; return StoryOverhaul95.isHe() ? L.p2[1] : L.p2[0]; } catch (e) { return ''; } };
  const bs0 = Boss.spawn.bind(Boss);
  Boss.spawn = function (id) {
    const r = bs0.apply(this, arguments);
    try {
      const d = Store.data, k = 'bi107_' + id;
      if (G.mode === 'story' && !REPLAY.on && !d.seen[k] && G.cine && G.cine.k === 'boss' && !CALM) { // (story runs are never replays)
        d.seen[k] = 1; Store.touch();
        G.cine.d = 3.8; G.freeze = 3.8; G.cine.first = 1; G.cine.q = quote(id);
      }
    } catch (e) { errLog(e); }
    return r;
  };
  const ci0 = HUD.cine.bind(HUD);
  HUD.cine = function (rd) {
    const c = G.cine, r = ci0.apply(this, arguments);
    try {
      if (!c || !c.first || c.k !== 'boss' || G.cine !== c) return r;
      const info = BOSS_INFO[c.id] || {}, y = V.VH * .42, a = Math.min(1, c.t * 4, (c.d - c.t) * 4);
      cx.save(); cx.globalAlpha = a; cx.textAlign = 'center';
      // a blade cut across the band as the name lands
      const u = clamp((c.t - .25) / .35, 0, 1); if (u > 0 && u < 1) { cx.strokeStyle = '#ffffff'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-20 + u * (V.VW + 40) - 60, y + 60); cx.lineTo(-20 + u * (V.VW + 40), y + 40); cx.stroke(); }
      cx.font = '700 11px ' + FONT_M; cx.fillStyle = info.col || '#ff0844'; cx.fillText('— ' + lt('FIRST ENCOUNTER') + ' —', V.CX, y - 44);
      if (c.q) { const n = Math.max(0, Math.min(c.q.length, ((c.t - .9) * 38) | 0)); if (n > 0) { cx.font = 'italic 700 14px ' + FONT_D; cx.fillStyle = '#ffffff'; wrapText(c.q.slice(0, n), V.CX, y + 132, Math.min(V.VW - 40, 340), 18); } }
      cx.globalAlpha = a * .6; cx.font = '700 10px ' + FONT_M; cx.fillStyle = '#e8fbff'; cx.fillText(lt('TAP TO SKIP'), V.CX, V.VH - 78);
      cx.restore();
    } catch (e) { }
    return r;
  };
  function wrapText(s, x, y, w, lh) { const words = s.split(' '); let line = '', yy = y; for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (cx.measureText(tst).width > w && line) { cx.fillText(line, x, yy); line = wd; yy += lh; } else line = tst; } if (line) cx.fillText(line, x, yy); }
  // a tap skips the long entrance
  window.addEventListener('pointerdown', () => { const c = G.cine; if (c && c.first && c.k === 'boss' && G.freeze > .3) { G.freeze = .3; c.t = Math.max(c.t, c.d - .3); } }, true);

  // Mika's v95 'memory core' radio line came at the start of every story stage, the same eight lines each time,
  // and covered the boss entrance on boss stages: now once, on the first stage of the first chapter, and never over a boss
  const ss95 = StoryOverhaul95.onStoryStart.bind(StoryOverhaul95);
  StoryOverhaul95.onStoryStart = function (mode) {
    try { const d = Store.data; if (mode !== 'story' || d.seen.so95line || !G.stage || G.stage.idx !== 0) return; d.seen.so95line = 1; Store.touch(); } catch (e) { return; }
    return ss95.apply(this, arguments);
  };
  const say95 = StoryOverhaul95.say.bind(StoryOverhaul95);
  StoryOverhaul95.say = function () { if (G.cine && G.cine.k === 'boss') return; return say95.apply(this, arguments); };
})();
