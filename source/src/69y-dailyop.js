/* ---------------- DAILY OP — one story stage a day, with a twist ----------------
   Every day the game picks one story stage the player has already cleared and
   one rule (glass body, blackout, no skills…). Clearing it pays a bonus that
   grows with the daily streak. The pick comes from the date, so it is the same
   all day on every device. Story runs are not recorded, so the rule never
   touches a replay. */
const DOP_RULES = [
  { id: 'glass', name: 'GLASS CANNON', desc: '1 shield, x2 damage', score: 2, col: '#ff3d6e' },
  { id: 'turbo', name: 'TURBO', desc: 'Everything moves 20% faster', score: 1.5, col: '#ffb000' },
  { id: 'dark', name: 'LIGHTS OUT', desc: 'Permanent blackout', score: 1.6, col: '#8a7bff' },
  { id: 'elite', name: 'ELITE GUARD', desc: 'Many more elite enemies', score: 1.5, col: '#ff8a00' },
  { id: 'ice', name: 'ZERO FRICTION', desc: 'ZERO FRICTION: ICE ROOF', score: 1.4, col: '#7fe8ff' },
  { id: 'noskill', name: 'BLADE ONLY', desc: 'No skills: only your blade and Overdrive', score: 1.6, col: '#00ff88' }
];
function dopHash(n) { n = (n ^ 0x9e3779b9) >>> 0; n = Math.imul(n ^ (n >>> 16), 0x85ebca6b) >>> 0; n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35) >>> 0; return (n ^ (n >>> 16)) >>> 0; }
function dopDayNum(dk) { return Math.round(Date.UTC(Math.floor(dk / 10000), Math.floor(dk / 100) % 100 - 1, dk % 100) / 86400000); }
const DOP = {
  need: 3,
  pool() { // cleared main-story stages; tutorials and secret stages are left out
    const sv = Store.data.story, a = [];
    for (let i = 0; i < STAGES.length; i++) { const s = STAGES[i]; if (s.safe || s.secret || s.ex || !stageOpen(i) || !sv.diffMax.hasOwnProperty(s.id)) continue; a.push(i); }
    return a;
  },
  today(dk) {
    dk = dk || todayKey(); const p = this.pool(); if (p.length < this.need) return null;
    const h = dopHash(dk), h2 = dopHash(dk * 7 + 3);
    return { dk, idx: p[h % p.length], rule: DOP_RULES[h2 % DOP_RULES.length] };
  },
  data() { const d = Store.data; if (!d.dop || typeof d.dop !== 'object') d.dop = {}; const o = d.dop; o.dk = o.dk | 0; o.streak = o.streak | 0; o.total = o.total | 0; return o; },
  doneToday() { return this.data().dk === todayKey(); },
  streakNow() { const o = this.data(), t = dopDayNum(todayKey()); return o.dk && t - dopDayNum(o.dk) <= 1 ? o.streak : 0; },
  reward(streak) { return 450 + 50 * Math.min(6, Math.max(0, streak - 1)); }
};
/* ---------------- starting, rules, and the bonus ---------------- */
{
  for (const k of ['startStory', 'startArcade', 'startSpeedrun', 'startPuzzle']) if (Flow[k]) { const f0 = Flow[k].bind(Flow); Flow[k] = function () { if (!this.dopGo) this.dop = null; return f0.apply(this, arguments); }; }
  Flow.startDailyOp = function () {
    const t = DOP.today(); if (!t) { toastDom(ltf('Clear {0} story stages to unlock the DAILY OP.', DOP.need)); return; }
    const s = STAGES[t.idx]; Aud.init(); this.dopGo = 1; this.sr = null; this.dop = t;
    this.last = { mode: 'story', idx: t.idx }; this.endT = 0; REC.on = false; this.dopGo = 0;
    Director.begin('story', s); G.cine = null; G.freeze = 0; this.enterPlay();
    G.cine = { k: 'stage', t: 0, d: 1.6 }; G.freeze = 1.6; FX.call(lt('DAILY OP') + ' · ' + lt(t.rule.name), t.rule.col, 3, 26);
  };
  const begin0 = Director.begin.bind(Director);
  Director.begin = function (mode, stage) {
    const t = Flow.dop, on = !!(t && mode === 'story' && stage && stage.idx === t.idx && !REPLAY.on);
    G.dop = on ? t.rule.id : null;
    begin0(mode, stage);
    if (!on) return;
    const r = t.rule.id; G.mods[r] = 1; G.scoreMul *= t.rule.score;
    if (r === 'turbo') G.spdMul = 1.2;
    if (r === 'glass') G.dmgMod = 2;
    if (r === 'dark') G.dark = 1;
    if (r === 'elite') this.elite += .55;
    if (r === 'noskill') for (const k of ['grapple', 'hijack', 'web', 'echo']) P.has[k] = false;
    P.hp = Math.min(P.hp, P.maxHp);
  };
  const lo0 = applyLoadout; applyLoadout = function () { lo0(); if (G.dop === 'glass') P.maxHp = 1; };
  const res0 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    const t = Flow.dop;
    if (t && G.mode === 'story' && G.stage && G.stage.idx === t.idx && o && !o.dopDone) {
      o.dopDone = 1; o.notes = o.notes || [];
      const clear = G.state === 'CLEAR';
      if (clear && t.dk === todayKey() && !DOP.doneToday()) {
        const D = DOP.data(), st = DOP.streakNow() + 1, cr = DOP.reward(st);
        D.dk = t.dk; D.streak = st; D.total++; D.best = Math.max(D.best | 0, st); Store.data.credits += cr;
        if (st >= 7) ach('dop7'); if (D.total >= 30) ach('dop30');
        Store.touch(); Store.flush(true);
        o.notes.unshift({ t: ltf('DAILY OP COMPLETE: +{0} CR · streak {1}', fmtNum(cr), st), c: 'gold' });
      } else if (clear) o.notes.unshift({ t: lt('DAILY OP already completed today. A new one starts tomorrow.'), c: 'mute' });
      o.eyebrow = lt('DAILY OP') + ' · ' + lt(t.rule.name) + ' · ' + (o.eyebrow || '');
      if (clear) o.main = [lt('BACK TO TITLE'), () => { Flow.dop = null; Flow.quit(); UI.openTitle(); }];
    }
    return res0(o);
  };
  const fin0 = Flow.finishStory.bind(Flow);
  Flow.finishStory = function () { // a Daily Op skips the stage's story dialogue
    if (!this.dop) return fin0();
    const s = G.stage, keep = s.post; s.post = []; try { fin0(); } finally { s.post = keep; }
  };
  const quit0 = Flow.quit.bind(Flow); Flow.quit = function () { G.dop = null; const r = quit0.apply(this, arguments); this.dop = null; return r; };
}
/* ---------------- the title card ---------------- */
Object.assign(UI, {
  dopBanner() {
    let b = $('bDop'); const t = DOP.today();
    if (!b) { b = el('button', 'panel evbanner dopbanner'); b.id = 'bDop'; $('bStory').before(b); b.onclick = () => { Aud.sfx('ui'); Flow.startDailyOp(); }; }
    b.textContent = ''; b.classList.toggle('hidden', !t && !Gate.open('arcade')); // hidden for brand-new players
    if (!t) { b.style.setProperty('--ec', '#5a6378'); b.appendChild(el('span', 'evic', '🎯')); const x = el('span', 'evtx'); x.appendChild(el('b', '', lt('DAILY OP'))); x.appendChild(el('span', 'small mute', ltf('Clear {0} story stages to unlock the DAILY OP.', DOP.need))); b.appendChild(x); b.classList.add('locked'); return; }
    b.classList.remove('locked'); const s = STAGES[t.idx], done = DOP.doneToday(), st = DOP.streakNow();
    b.style.setProperty('--ec', done ? '#3a4a5a' : t.rule.col); b.appendChild(el('span', 'evic', done ? '✅' : '🎯'));
    const x = el('span', 'evtx'); x.appendChild(el('b', '', lt('DAILY OP') + ' · ' + s.id + ' ' + lt(s.name)));
    x.appendChild(el('span', 'small mute', lt(t.rule.name) + ' — ' + lt(t.rule.desc))); b.appendChild(x);
    b.appendChild(el('span', 'chip ' + (done ? '' : 'gold'), done ? ltf('STREAK {0}', st) : '+' + fmtNum(DOP.reward(st + 1)) + ' CR'));
  }
});
{ const t0 = UI.openTitle.bind(UI); UI.openTitle = function () { t0(); try { this.dopBanner(); } catch (e) { errLog(e); } }; }
