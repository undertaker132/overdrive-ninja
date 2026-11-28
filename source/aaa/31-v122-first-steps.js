
/* --- MODULE 31: v122.0 FIRST STEPS — a clear goal for every minute of the first session --- */
(function () {
  'use strict';
  // A new player meets dozens of systems and, after the first stage, had no clear next thing to do. Now:
  //  · FIRST STEPS: seven short goals on the home screen, under the story, each with a reward you collect with a tap
  //    (clear 1-1, beat the first boss, a x10 combo, three stars, a new weapon, an arcade run, all of chapter 1).
  //    The card shows the next goals with progress and leaves once all seven are collected.
  //  · after every run the results screen names the closest goal ("NEXT GOAL"), or your best score to beat
  //  · in chapter 1 the letter grade is not shown: a first win is not answered with a D
  // Display and rewards only: the simulation and the replays do not change.
  const T = {
    "FIRST STEPS": ["צעדים ראשונים", "الخطوات الأولى", "ПЕРВЫЕ ШАГИ"],
    "Clear stage 1-1": ["סיים את שלב 1-1", "أنهِ المرحلة 1-1", "Пройди этап 1-1"],
    "Beat the first boss": ["נצח את הבוס הראשון", "اهزم الزعيم الأول", "Победи первого босса"],
    "Reach a x10 combo": ["הגע לקומבו x10", "حقق كومبو x10", "Сделай комбо x10"],
    "Earn 3 stars on a stage": ["השג 3 כוכבים בשלב", "احصل على 3 نجوم في مرحلة", "Получи 3 звезды на этапе"],
    "Equip a new weapon": ["צייד נשק חדש", "جهّز سلاحًا جديدًا", "Возьми новое оружие"],
    "Play an Arcade run": ["שחק ריצה בארקייד", "العب جولة أركيد", "Сыграй забег в аркаде"],
    "Clear chapter 1": ["סיים את פרק 1", "أنهِ الفصل 1", "Пройди главу 1"],
    "COLLECT": ["אסוף", "استلم", "ЗАБРАТЬ"],
    "NEXT GOAL": ["המטרה הבאה", "الهدف التالي", "СЛЕДУЮЩАЯ ЦЕЛЬ"],
    "Goal complete! Collect it on the home screen.": ["המטרה הושלמה! אסוף אותה במסך הבית.", "اكتمل الهدف! استلمه في الشاشة الرئيسية.", "Цель выполнена! Забери награду на главном экране."],
    "Beat your best: {0}": ["שבור את השיא שלך: {0}", "حطّم أفضل نتيجة لك: {0}", "Побей свой рекорд: {0}"],
    "New hero: {0}": ["גיבור חדש: {0}", "بطل جديد: {0}", "Новый герой: {0}"],
    "{0} of {1} done": ["{0} מתוך {1} הושלמו", "{0} من {1} مكتملة", "Выполнено {0} из {1}"]
  };
  try { for (const k in T) { HE[k] = T[k][0]; AR[k] = T[k][1]; RU[k] = T[k][2]; if (window.__DICT_AR) window.__DICT_AR[k] = T[k][1]; if (window.__DICT_RU) window.__DICT_RU[k] = T[k][2]; } } catch (e) { }

  const fs = () => { const d = Store.data; if (!d.fs122) d.fs122 = { claimed: {}, combo: 0, arcade: 0 }; return d.fs122; };
  const ch0 = () => STAGES.filter(s => s.ch === 0 && !s.secret && !s.ex);
  const cleared = id => { try { return Object.prototype.hasOwnProperty.call(Store.data.story.diffMax, id); } catch (e) { return false; } };
  const boss0 = () => ch0().find(s => s.obj && s.obj.t === 'boss');
  // [id, text, done?, progress 0..1, reward: credits or a hero]
  const GOALS = [
    ['c11', 'Clear stage 1-1', () => cleared(STAGES[0].id), () => cleared(STAGES[0].id) ? 1 : 0, { cr: 150 }],
    ['boss1', 'Beat the first boss', () => { const b = boss0(); return !!b && cleared(b.id); }, () => { const b = boss0(); return b && cleared(b.id) ? 1 : Math.min(.9, (Store.data.story.unlocked | 0) / Math.max(1, b ? b.idx : 3)); }, { hero: 'crimson', cr: 300 }],
    ['combo10', 'Reach a x10 combo', () => fs().combo >= 10, () => Math.min(1, fs().combo / 10), { cr: 150 }],
    ['stars3', 'Earn 3 stars on a stage', () => Object.values(Store.data.story.stars || {}).some(v => v >= 3), () => Math.min(1, Math.max(0, ...Object.values(Store.data.story.stars || {}).map(v => v | 0)) / 3), { cr: 200 }],
    ['weapon', 'Equip a new weapon', () => Store.data.weapon !== 'katana', () => Store.data.weapon !== 'katana' ? 1 : 0, { cr: 200 }],
    ['arcade', 'Play an Arcade run', () => fs().arcade >= 1, () => Math.min(1, fs().arcade), { cr: 150 }],
    ['ch1', 'Clear chapter 1', () => ch0().every(s => cleared(s.id)), () => ch0().filter(s => cleared(s.id)).length / Math.max(1, ch0().length), { cr: 500 }]
  ];
  const open = () => GOALS.filter(g => !fs().claimed[g[0]]);
  const rewardText = r => r.hero && !(Store.data.skins || {})[r.hero] ? ltf('New hero: {0}', lt((SKINS.find(s => s.id === r.hero) || {}).name || r.hero)) : '+' + (r.cr | 0) + ' CR';
  function claim(g) {
    const d = Store.data, f = fs(); if (f.claimed[g[0]] || !g[2]()) return;
    f.claimed[g[0]] = 1; const r = g[4];
    if (r.hero && !(d.skins || (d.skins = {}))[r.hero]) d.skins[r.hero] = 1; else d.credits += r.cr | 0;
    Store.touch(); Store.flush && Store.flush(); try { Aud.sfx('coin'); } catch (e) { } try { if (typeof toast === 'function') toast(rewardText(r)); } catch (e) { }
    try { if (UI.cur === 'title') UI.openTitle(); else render(); } catch (e) { render(); } // (the title redraws: credits and new hero show at once)
  }
  // ---------------- the home card ----------------
  function render() {
    try {
      if (UI.cur !== 'title') return; let box = document.getElementById('fs122');
      const left = open(), st = document.getElementById('bStory');
      if (!left.length || !st) { if (box) box.remove(); return; }
      if (!box) { box = el('div', 'panel fs122'); box.id = 'fs122'; }
      if (box.previousElementSibling !== st) st.parentElement.insertBefore(box, st.nextSibling);
      box.textContent = '';
      const hd = el('div', 'fs122-h'); hd.appendChild(el('span', 'fs122-t', lt('FIRST STEPS'))); hd.appendChild(el('span', 'fs122-n', ltf('{0} of {1} done', GOALS.length - left.length, GOALS.length))); box.appendChild(hd);
      // the goals ready to collect first, then the next two to work on
      const ready = left.filter(g => g[2]()), next = left.filter(g => !g[2]()).slice(0, Math.max(0, 3 - ready.length));
      for (const g of ready.concat(next)) {
        const done = g[2](), row = el('div', 'fs122-row' + (done ? ' ready' : ''));
        const tx = el('div', 'fs122-x'); tx.appendChild(el('div', 'fs122-g', lt(g[1]))); tx.appendChild(el('div', 'fs122-r', rewardText(g[4]))); row.appendChild(tx);
        if (done) { const b = el('button', 'btn fs122-b', lt('COLLECT')); b.type = 'button'; b.onclick = e => { e.stopPropagation(); claim(g); }; row.appendChild(b); }
        else { const bar = el('div', 'fs122-bar'), fill = el('i'); fill.style.width = Math.round(100 * Math.max(0, Math.min(1, g[3]()))) + '%'; bar.appendChild(fill); row.appendChild(bar); }
        box.appendChild(row);
      }
    } catch (e) { errLog(e); }
  }
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () { const r = ot0.apply(this, arguments); render(); return r; };
  Sim98.menu.push(() => { if (UI.cur === 'title' && !document.getElementById('fs122') && open().length) render(); });
  // ---------------- the results screen ----------------
  const or0 = UI.openResult.bind(UI);
  UI.openResult = function () {
    try { const f = fs(); f.combo = Math.max(f.combo | 0, G.maxCombo | 0); if (G.mode && G.mode !== 'story' && G.mode !== 'dojo' && G.mode !== 'puzzle') f.arcade = (f.arcade | 0) + 1; Store.touch(); } catch (e) { }
    const r = or0.apply(this, arguments);
    try {
      // chapter 1: no letter grade on a first win
      if (G.mode === 'story' && G.stage && G.stage.ch === 0) { const gb = $('rsGrade'); if (gb) gb.classList.add('hidden'); }
      // the closest goal, or the best score to beat
      let box = document.getElementById('rsNext122'); if (!box) { box = el('div', 'panel rsnext122'); box.id = 'rsNext122'; const m = $('rsMain'); if (m) m.parentElement.insertBefore(box, m); }
      box.textContent = ''; const left = open(), ready = left.find(g => g[2]());
      let t = '', sub = '', p = -1;
      if (ready) { t = lt(ready[1]); sub = lt('Goal complete! Collect it on the home screen.'); }
      else if (left.length) { const g = left.slice().sort((a, b) => b[3]() - a[3]())[0]; t = lt(g[1]); sub = rewardText(g[4]); p = g[3](); }
      else { const best = G.mode === 'story' && G.stage ? (Store.data.story.best[G.stage.id] | 0) : 0; if (best > 0 && G.score < best) { t = ltf('Beat your best: {0}', fmtNum ? fmtNum(best) : best); sub = '+' + (best - (G.score | 0)); } }
      if (!t) { box.remove(); return r; }
      box.appendChild(el('div', 'rsnext122-h', lt('NEXT GOAL'))); box.appendChild(el('div', 'rsnext122-t', t)); if (sub) box.appendChild(el('div', 'rsnext122-s', sub));
      if (p >= 0) { const bar = el('div', 'fs122-bar'), fill = el('i'); fill.style.width = Math.round(100 * p) + '%'; bar.appendChild(fill); box.appendChild(bar); }
      if (ready) box.classList.add('ready');
    } catch (e) { errLog(e); }
    return r;
  };
  window.FirstSteps122 = { GOALS, open, claim, render };
})();
