/* =====================================================================
   LEGEND BOSSES and WEEKLY BOSS TWISTS (v29)
   LEGEND: every boss you have beaten in the story can be fought again as
   a legend: 35% more health, an enrage that speeds it up as it weakens,
   and one twist of its own (turbo, glass cannon, lights out, elite guard,
   ice roof or blade only). Stars: clear (1), take 2 hits or fewer (2),
   take none (3). First clear +1200 CR, first 3 stars +800 CR; 8 legends
   cleared earns the LEGEND HUNTER title, all 16 LEGEND SLAYER.
   Story runs are not recorded, so legends never touch a replay.
   WEEKLY TWISTS: in the Weekly Challenge every boss gets the week's twist
   (enrage, haste or swarm); recorded with v29+, so old replays stay exact.
   ===================================================================== */
const LEGEND_TWIST = { warden: 'turbo', hydra: 'elite', kage: 'dark', shogun: 'glass', raijin: 'ice', renull: 'noskill', leviathan: 'dark', benkei: 'turbo',
  prime: 'glass', valkyrie: 'ice', chimera: 'elite', genesis: 'noskill', oryu: 'dark', tenkai: 'turbo', izanami: 'glass', hyakki: 'ice' };
const Legend = {
  cur: null,
  data() { const d = Store.data; if (!d.legend || typeof d.legend !== 'object') d.legend = {}; return d.legend; },
  stage(id) { return STAGES.find(s => s.obj && s.obj.t === 'boss' && s.obj.b === id && !s.ex && !s.secret) || STAGES.find(s => s.obj && s.obj.t === 'boss' && s.obj.b === id); },
  open(id) { return (pcodex().b[id] | 0) > 0 && !!this.stage(id); },
  rule(id) { return DOP_RULES.find(r => r.id === (LEGEND_TWIST[id] || 'turbo')) || DOP_RULES[0]; },
  stars(id) { return (this.data()[id] | 0); },
  total() { return CODEX_BOSSES.reduce((a, id) => a + (this.stars(id) > 0 ? 1 : 0), 0); }
};
{
  Flow.startLegend = function (id) {
    const s = Legend.stage(id); if (!s || !Legend.open(id)) return; Aud.init();
    this.dop = null; this.sr = null; Legend.cur = { id, rule: Legend.rule(id) }; this.last = { mode: 'story', idx: s.idx }; this.endT = 0; REC.on = false;
    Director.begin('story', s); G.cine = null; G.freeze = 0; this.enterPlay();
    G.cine = { k: 'stage', t: 0, d: 1.6 }; G.freeze = 1.6; FX.call(lt('LEGEND') + ' · ' + lt(Legend.cur.rule.name), '#ffd700', 3, 26);
  };
  for (const k of ['startStory', 'startArcade', 'startSpeedrun', 'startPuzzle', 'startDailyOp']) if (Flow[k]) { const f0 = Flow[k].bind(Flow); Flow[k] = function () { Legend.cur = null; return f0.apply(this, arguments); }; }
  const b0 = Director.begin.bind(Director);
  Director.begin = function (mode, stage) {
    const L = Legend.cur, on = !!(L && mode === 'story' && stage && stage.obj && stage.obj.b === L.id && !REPLAY.on);
    G.legend = on ? L.id : null; b0(mode, stage); if (!on) return;
    const r = L.rule.id; G.mods[r] = 1; G.scoreMul *= 1.5;
    if (r === 'turbo') G.spdMul = 1.2; if (r === 'glass') G.dmgMod = 2; if (r === 'dark') G.dark = 1; if (r === 'elite') this.elite += .55;
    if (r === 'noskill') for (const k of ['grapple', 'hijack', 'web', 'echo']) P.has[k] = false;
    P.hp = Math.min(P.hp, P.maxHp);
  };
  const lo0 = applyLoadout; applyLoadout = function () { lo0(); if (G.legend && Legend.cur && Legend.cur.rule.id === 'glass') P.maxHp = 1; };
  // the boss itself: more health; the week's twist in the Weekly Challenge
  const sp0 = Boss.spawn.bind(Boss); Boss.spawn = function (id, lvl) { const b = sp0(id, lvl);
    if (b && G.legend) { b.mhp = b.hp = Math.round(b.hp * 1.35); b.legend = 1; }
    if (b && G.mode === 'weekly' && simV(29)) { b.twist = WEEK_TWISTS[((G.weekKey | 0) % WEEK_TWISTS.length + WEEK_TWISTS.length) % WEEK_TWISTS.length]; b.swT = 9; }
    return b; };
  const up0 = Boss.update.bind(Boss); Boss.update = function (dt, rd) {
    const b = this.cur; let k = 1;
    if (b && b.enter >= 1 && !(b.dying > 0)) {
      if (b.legend || b.twist === 'enrage') k *= 1 + (1 - b.hp / b.mhp) * .3; // enrage: faster as it weakens
      if (b.twist === 'haste') k *= 1.2;
      if (b.twist === 'swarm' && G.freeze <= 0) { b.swT -= dt; if (b.swT <= 0) { b.swT = 11; for (let i = 0; i < 3; i++) spawnEnemy(ET.DRONE, b.x + (i - 1) * 60, b.y + b.r + 30); FX.ring(b.x, b.y, b.r + 40, '#ff3b5c', 3); } }
    }
    return up0(dt * k, rd);
  };
  // the result: stars and rewards
  const res0 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    const L = Legend.cur;
    if (L && G.legend === L.id && o && !o.legDone) {
      o.legDone = 1; o.notes = o.notes || []; const clear = G.state === 'CLEAR';
      if (clear) { const st = G.hits === 0 ? 3 : G.hits <= 2 ? 2 : 1, D = Legend.data(), was = D[L.id] | 0; let cr = 0;
        if (!was) cr += 1200; if (st === 3 && was < 3) cr += 800; D[L.id] = Math.max(was, st); Store.data.credits += cr;
        const n = Legend.total(); if (n >= 8) unlockTitle('legend8'); if (n >= 16) unlockTitle('legend16');
        Store.touch(); Store.flush(true);
        o.notes.unshift({ t: ltf('LEGEND CLEARED: {0}', '★'.repeat(st) + '☆'.repeat(3 - st)) + (cr ? ' · +' + fmtNum(cr) + ' CR' : ''), c: 'gold' }); }
      o.eyebrow = lt('LEGEND') + ' · ' + lt(L.rule.name) + ' · ' + (o.eyebrow || '');
      const lid = L.id; o.main = [lt('LEGEND BOSSES'), () => { Flow.quit(); UI.openLegend(); }]; o.alt = [lt('RETRY'), () => { Flow.quit(); Flow.startLegend(lid); }];
    }
    return res0(o);
  };
  const fin0 = Flow.finishStory.bind(Flow); Flow.finishStory = function () { if (!G.legend) return fin0(); const s = G.stage, keep = s.post; s.post = []; try { fin0(); } finally { s.post = keep; } }; // no story dialogue in a legend
  const q0 = Flow.quit.bind(Flow); Flow.quit = function () { G.legend = null; Legend.cur = null; return q0.apply(this, arguments); };
}
const WEEK_TWISTS = ['enrage', 'haste', 'swarm'];
function unlockTitle(id) { const d = Store.data; d.titlesGot = d.titlesGot || {}; if (!d.titlesGot[id]) { d.titlesGot[id] = 1; toastDom(ltf('NEW TITLE: {0}', lt((TITLES.find(t => t.id === id) || {}).n || id))); } }
TITLES.push({ id: 'legend8', n: 'LEGEND HUNTER', d: 'Clear 8 legend bosses', ok: () => Legend.total() >= 8 }, { id: 'legend16', n: 'LEGEND SLAYER', d: 'Clear all 16 legend bosses', ok: () => Legend.total() >= 16 });
/* ---- the LEGEND BOSSES screen ---- */
Object.assign(UI, {
  openLegend() {
    let sc = $('s-legend');
    if (!sc) { sc = el('section', 'scr hidden'); sc.id = 's-legend'; const col = el('div', 'col'); col.appendChild(el('h2', '', '')); const pn = el('div', 'panel'); pn.id = 'lgList'; col.appendChild(pn); const bk = el('button', 'btn ghost', ''); bk.id = 'lgBack'; bk.onclick = () => { Aud.sfx('back'); this.back(); }; col.appendChild(bk); sc.appendChild(col); $('ov').appendChild(sc); }
    this.show('legend'); this.backFn = () => this.openTitle();
    sc.querySelector('h2').textContent = lt('LEGEND BOSSES'); $('lgBack').textContent = lt('BACK');
    const box = $('lgList'); box.textContent = '';
    box.appendChild(el('div', 'small mute', lt('Bosses you have beaten come back as legends: more health, an enrage and a twist of their own. Clear 2 hits or fewer for 2 stars, no hits for 3.')));
    box.appendChild(el('div', 'gold', ltf('{0} / {1} LEGENDS CLEARED', Legend.total(), CODEX_BOSSES.length)));
    for (const id of CODEX_BOSSES) { const info = BOSS_INFO[id], ok = Legend.open(id), st = Legend.stars(id), r = Legend.rule(id);
      const row = el('button', 'panel evbanner' + (ok ? '' : ' locked')); row.style.setProperty('--ec', ok ? info.col : '#3a4458'); row.disabled = !ok;
      const x = el('span', 'evtx'); x.appendChild(el('b', '', lt(info.name))); x.appendChild(el('span', 'small mute', ok ? lt(r.name) + ' — ' + lt(r.desc) : lt('Beat it in the story first'))); row.appendChild(x);
      row.appendChild(el('span', 'chip ' + (st ? 'gold' : ''), ok ? '★'.repeat(st) + '☆'.repeat(3 - st) : '🔒'));
      if (ok) row.onclick = () => { Aud.sfx('ui'); Flow.startLegend(id); };
      box.appendChild(row); }
  },
  legendBanner() {
    let b = $('bLegend'); const any = CODEX_BOSSES.some(id => Legend.open(id));
    if (!b) { b = el('button', 'panel evbanner'); b.id = 'bLegend'; const a = $('bDop') || $('bStory'); if (a) a.after(b); b.onclick = () => { Aud.sfx('ui'); UI.openLegend(); }; }
    b.textContent = ''; b.classList.toggle('hidden', !any); b.style.setProperty('--ec', '#ffd700'); b.appendChild(el('span', 'evic', '👑'));
    const x = el('span', 'evtx'); x.appendChild(el('b', '', lt('LEGEND BOSSES'))); x.appendChild(el('span', 'small mute', ltf('{0} / {1} LEGENDS CLEARED', Legend.total(), CODEX_BOSSES.length))); b.appendChild(x);
  }
});
{ const t0 = UI.openTitle.bind(UI); UI.openTitle = function () { t0(); try { this.legendBanner(); } catch (e) { errLog(e); } }; }
{ const bs0 = Boss.spawn.bind(Boss); Boss.spawn = function (id, lvl) { const b = bs0(id, lvl); if (b && b.twist) toast(ltf('WEEKLY TWIST: {0}', lt({ enrage: 'ENRAGE', haste: 'HASTE', swarm: 'SWARM' }[b.twist])), '#ff4fd8'); return b; }; }
