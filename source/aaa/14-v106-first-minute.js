
/* --- MODULE 14: v106.0 THE FIRST MINUTE — a new player sees one button and is playing a second later --- */
(function () {
  'use strict';
  const fresh = () => { try { const d = Store.data; return !d.uiAll && (d.story.unlocked | 0) === 0; } catch (e) { return false; } };
  const isDesk = () => { try { return S90.isDesk(); } catch (e) { return false; } };
  // the home screen's command bar (v92-v97) opens with the story like the rest of the title screen
  const NEED = { 'auth93-btn': 1, 'lb92-btn': 2, 'ost95-btn': 3, 'chips96-btn': 4 };
  const tidy = () => {
    try {
      const d = Store.data, lv = Gate.lv();
      for (const id in NEED) { const b = document.getElementById(id); if (b) b.style.setProperty('display', d.uiAll || lv >= NEED[id] ? '' : 'none', d.uiAll || lv >= NEED[id] ? '' : 'important'); }
      const k = document.getElementById('help97-btn'); if (k && !isDesk()) k.style.setProperty('display', 'none', 'important'); // (keyboard help: only with a keyboard)
      const bar = document.getElementById('cmdbar98'); if (bar) bar.style.display = [...bar.children].some(c => getComputedStyle(c).display !== 'none') ? '' : 'none';
    } catch (e) { }
  };
  Sim98.menu.push(() => { if (UI.cur === 'title') tidy(); });

  // the very first STORY press plays the opening and stage 1-1 at once (the story map comes after the first stage)
  const hook = () => {
    const b = document.getElementById('bStory'); if (!b || b.dataset.fm106) return; b.dataset.fm106 = 1;
    b.addEventListener('click', e => { if (!fresh() || Store.data.story.stars['1-1']) return; e.stopImmediatePropagation(); e.preventDefault(); Aud.sfx('ui'); Flow.startStory(0); }, true);
  };
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () { const r = ot0.apply(this, arguments); hook(); tidy(); return r; };

  // the very first run: after the prologue, only the two lines that matter before the first cut
  // (where you are, and how to aim); the full talk is there on every later visit to 1-1
  const ss0 = Flow.startStory.bind(Flow);
  Flow.startStory = function (idx) {
    const s = STAGES[idx];
    if (idx === 0 && s && !Store.data.story.prologue && !s.pre0) { s.pre0 = s.pre; s.pre = [s.pre[0], s.pre[2]].filter(Boolean); }
    return ss0.apply(this, arguments);
  };
  const ep0 = Flow.enterPlay.bind(Flow);
  Flow.enterPlay = function () { const s = STAGES[0]; if (s && s.pre0) { s.pre = s.pre0; s.pre0 = null; } return ep0.apply(this, arguments); };

  // while the tutorial shows an instruction, the tips and Mika's radio wait for it (they used to print over it)
  const waitT = [], waitC = [];
  const teaching = () => (typeof Tut !== 'undefined' && Tut.cur) || (G.mode === 'story' && G.stage && G.stage.tut === 'aim' && G.kills < 2); // (Tut prompts, and the drag-to-aim lesson of 1-1)
  const h0 = hint;
  hint = function (id, text) { if (teaching() && G.state === 'PLAY') { if (!waitT.some(q => q[0] === id)) waitT.push([id, text]); return; } return h0(id, text); };
  const cs0 = Comms.say.bind(Comms);
  Comms.say = function (key, force) { if (teaching() && G.state === 'PLAY') { if (force && !waitC.some(q => q[0] === key)) waitC.push([key, force]); return; } return cs0(key, force); };
  Pipe.on('post', 'wait106', () => {
    if (G.state !== 'PLAY') { waitT.length = 0; waitC.length = 0; return; }
    if (teaching() || G.hintT > 0) return;
    if (waitC.length) { const [k, f] = waitC.shift(); cs0(k, f); } else if (waitT.length) { const [id, t] = waitT.shift(); h0(id, t); }
  }, 60);
})();
