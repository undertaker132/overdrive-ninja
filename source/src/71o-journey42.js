/* =====================================================================
   THE JOURNEY (version 42): reasons to keep playing after the credits.
   Built from what the best games do: a rank to climb (ranked ladders),
   one completion number (Hollow Knight's 112%), harder tiers you prove
   one by one (Dead Cells' boss cells), rewards for raising the stakes
   (Hades' heat), a weekly target, and things money cannot buy.
   · PLAYER RANK: Bronze I to Legend, from everything you have done. It is
     computed from your saved progress, so old players get their real
     rank at once. Every rank up pays credits; Platinum, Master and Legend
     unlock heroes you can only earn
   · COMPLETION %: one number for the whole game, with what is missing
   · BOSS CROWNS: every chapter boss has three crowns: cleared on SAMURAI,
     OVERDRIVE and SHINIGAMI (from the stage records already saved)
   · STAR ROAD: story stars pay out at 20, 40 ... 243
   · BOSS OF THE WEEK: one legend boss a week pays 1,000 CR on its first
     clear that week
   · YOUR JOURNEY screen: rank, completion, crowns, star road and the next
     three goals; it opens by itself once the story is over ("the real
     game starts now")
   Nothing here touches the simulation.
   ===================================================================== */
const RANK_T = [['BRONZE', '#d08a4a'], ['SILVER', '#c8d2e6'], ['GOLD', '#ffd23f'], ['PLATINUM', '#7df9ff'], ['DIAMOND', '#a98bff'], ['MASTER', '#ff4fd8'], ['LEGEND', '#ff2a4a']];
const STAR_ROAD = [[20, 300], [40, 400], [60, 500], [90, 700], [120, 900], [150, 1200], [180, 1500], [210, 2000], [243, 3000]];
const Journey = {
  need(L) { return 50 * L * L + 150 * L; }, // xp to go from level L to L + 1
  week() { return Math.floor((Date.now() / 864e5 + 3) / 7); },
  bossStages() { if (this._bs) return this._bs; const seen = {}, out = []; for (const s of STAGES) { if (!(s.obj && s.obj.t === 'boss' && !s.ex && !s.secret)) continue; const id = s.obj.b; if (!seen[id]) { seen[id] = { id, s, all: [] }; out.push(seen[id]); } seen[id].all.push(s); } return (this._bs = out); },
  calc() {
    const d = Store.data, sv = d.story, cdx = pcodex(), sum = o => { let n = 0; for (const k in o || {}) n += o[k] | 0; return n; };
    const BS = this.bossStages(), dm1 = id => (sv.diffMax && sv.diffMax[id] != null ? sv.diffMax[id] : -1), dm = B => Math.max(...B.all.map(x => dm1(x.id)));
    const crowns = [2, 3, 4].map(di => BS.filter(B => dm(B) >= di).length);
    const stars = Store.stars(), starMax = STAGES.length * 3, ng = sum(sv.starsNG);
    const beaten = CODEX_BOSSES.filter(id => (cdx.b[id] | 0) > 0).length, legS = CODEX_BOSSES.reduce((a, id) => a + Legend.stars(id), 0);
    const ach = Object.keys(d.ach || {}).filter(k => d.ach[k]).length, achMax = ACHS.length || 1;
    const pz = Puzzles.stars(), pzMax = PZ_PACKS.reduce((a, p) => a + (p.list ? p.list.length * 3 : 0), 0) || 1;
    const tower = (d.best && d.best.tower) | 0, runs = (d.stats.runs | 0), kills = (d.stats.kills | 0);
    let mast = 0; for (const w of WEAPONS) mast += masteryLevel(w.id) | 0;
    const xp = stars * 18 + ng * 40 + beaten * 50 + legS * 60 + ach * 15 + pz * 15 + Math.min(tower, 30) * 40 + (crowns[0] + crowns[1] + crowns[2]) * 60 + Math.min(runs, 600) * 3 + Math.floor(kills / 50) + mast * 40; // (a whole story in one night lands near GOLD; LEGEND needs the endgame)
    let L = 1; while (L < 30 && xp >= this.need(L)) L++;
    const parts = [
      ['STORY STARS', stars, starMax, 25], ['NEW GAME+ STARS', ng, starMax, 10], ['BOSSES BEATEN', beaten, CODEX_BOSSES.length, 10], ['LEGEND STARS', legS, CODEX_BOSSES.length * 3, 15],
      ['ACHIEVEMENTS', ach, achMax, 15], ['PUZZLE STARS', pz, pzMax, 10], ['BOSS CROWNS', crowns[0] + crowns[1] + crowns[2], BS.length * 3, 10], ['NEON TOWER', Math.min(tower, 10), 10, 5]];
    let pct = 0; for (const p of parts) pct += p[3] * Math.min(1, p[1] / (p[2] || 1));
    return { xp, L, pct: Math.floor(pct), parts, crowns, BS, dm, stars, legS, beaten };
  },
  rank(L) { const i = L <= 3 ? 0 : L <= 6 ? 1 : L <= 9 ? 2 : L <= 12 ? 3 : L <= 15 ? 4 : L <= 20 ? 5 : 6, base = [1, 4, 7, 10, 13, 16, 21][i], sub = L - base;
    const name = lt(RANK_T[i][0]) + (i < 6 ? ' ' + ['I', 'II', 'III', 'IV', 'V'][sub] : sub ? ' ★' + sub : ''); return { i, name, col: RANK_T[i][1] }; },
  badge(L, big) { const r = this.rank(L), b = el('span', 'rk42' + (big ? ' big' : '')); b.style.setProperty('--rc', r.col); b.appendChild(el('i', '', String(L))); return b; },
  weekBoss() { const open = CODEX_BOSSES.filter(id => Legend.open(id)); return open.length ? open[this.week() % open.length] : null; },
  goals(c) {
    const d = Store.data, out = [], nextRoad = STAR_ROAD.find(r => c.stars < r[0]);
    if (!d.story.done.any) out.push(lt('Finish the story to open the endgame'));
    if (nextRoad) out.push(ltf('Earn {0} more story stars: +{1} CR on the star road', nextRoad[0] - c.stars, fmtNum(nextRoad[1])));
    const noCrown = c.BS.find(B => c.dm(B) < 2 && (Store.data.story.unlocked | 0) > B.s.idx); if (noCrown) out.push(ltf('Clear {0} on SAMURAI for its first crown', lt(BOSS_INFO[noCrown.id] ? BOSS_INFO[noCrown.id].name : noCrown.s.name)));
    const wb = this.weekBoss(); if (wb && d.wbDone !== this.week()) out.push(ltf('Boss of the week: clear the legend {0} for +1,000 CR', lt(BOSS_INFO[wb].name)));
    const leg = CODEX_BOSSES.find(id => Legend.open(id) && Legend.stars(id) < 3); if (leg) out.push(ltf('Take {0} as a legend without a hit for 3 stars', lt(BOSS_INFO[leg].name)));
    if (c.crowns[2] === 0 && d.story.done.any) out.push(lt('Beat any chapter boss on SHINIGAMI to earn the reaper hero'));
    return out.slice(0, 3);
  },
  /* the cards that pop up on the home screen */
  card(eyebrow, title, chips, col) { // one card at a time: the next waits until this one is closed
    this.cq = this.cq || []; if (document.querySelector('.unlock39')) { this.cq.push([eyebrow, title, chips, col]); return; }
    const ov = el('div', 'unlock39'), card = el('div', 'card'); if (col) card.style.borderColor = col;
    card.appendChild(el('div', 'eyebrow', eyebrow)); const h = el('h2', '', title); if (col) h.style.color = col; card.appendChild(h);
    const ul = el('div', 'ul'); chips.forEach((t, i) => { const s = el('span', '', t); s.style.animationDelay = (i * .06) + 's'; ul.appendChild(s); }); card.appendChild(ul);
    const ok = el('button', 'btn pri', lt('GOT IT')); card.appendChild(ok); ov.appendChild(card); document.body.appendChild(ov);
    const close = () => { if (!ov.parentNode) return; ov.remove(); const n = this.cq.shift(); if (n) setTimeout(() => this.card(...n), 120); };
    ok.onclick = () => { Aud.sfx('ui'); close(); }; ov.addEventListener('click', e => { if (e.target === ov) close(); });
  },
  payouts() { // rank ups and star road, paid once
    const d = Store.data, c = this.calc(), cards = [];
    if (d.rankSeen == null) d.rankSeen = 1;
    if (c.L > d.rankSeen) { let cr = 0; for (let L = d.rankSeen + 1; L <= c.L; L++) cr += 150 * L; d.credits += cr; const was = d.rankSeen; d.rankSeen = c.L;
      const chips = ['+' + fmtNum(cr) + ' CR']; for (const [lv, sk] of [[10, 'apex'], [16, 'neonmaster'], [21, 'legendk']]) if (was < lv && c.L >= lv) { const S = SKINS.find(s => s.id === sk); if (S) chips.push(lt(S.name)); }
      cards.push([lt('RANK UP'), this.rank(c.L).name, chips, this.rank(c.L).col]); }
    d.sroad = d.sroad | 0; let n = 0, cr2 = 0; const got = []; while (d.sroad < STAR_ROAD.length && c.stars >= STAR_ROAD[d.sroad][0]) { cr2 += STAR_ROAD[d.sroad][1]; got.push(STAR_ROAD[d.sroad][0]); d.sroad++; n++; }
    if (n) { d.credits += cr2; cards.push([lt('STAR ROAD'), ltf('{0} STORY STARS', c.stars), ['+' + fmtNum(cr2) + ' CR'].concat(got.includes(150) ? [lt('STARBORN')] : []), '#ffd23f']); }
    if (cards.length) { Store.touch(); Store.flush && Store.flush(); }
    return cards;
  },
  /* the YOUR JOURNEY screen */
  open(first) {
    let sc = $('s-journey');
    if (!sc) { sc = el('section', 'scr hidden'); sc.id = 's-journey'; const col = el('div', 'col'); col.appendChild(el('h2', '', '')); const box = el('div', 'col'); box.id = 'jBox'; col.appendChild(box);
      const bk = el('button', 'btn ghost', ''); bk.id = 'jBack'; bk.onclick = () => { Aud.sfx('back'); UI.openTitle(); }; col.appendChild(bk); sc.appendChild(col); $('ov').appendChild(sc); }
    G.state = 'MENU'; UI.backFn = () => UI.openTitle(); UI.show('journey');
    sc.querySelector('h2').textContent = lt('YOUR JOURNEY'); $('jBack').textContent = lt('BACK'); this.render(first);
  },
  render(first) {
    const box = $('jBox'); if (!box) return; box.textContent = ''; const c = this.calc(), r = this.rank(c.L), d = Store.data;
    if (first) { const p = el('div', 'panel j-hero'); p.appendChild(el('div', 'eyebrow', lt('THE STORY IS OVER'))); p.appendChild(el('h2', '', lt('THE REAL GAME STARTS NOW'))); p.appendChild(el('div', 'small', lt('Raise the difficulty, earn crowns, hunt legends and climb to LEGEND rank. Everything below counts.'))); box.appendChild(p); }
    // rank
    const rk = el('div', 'panel j-rank'); rk.style.setProperty('--rc', r.col); rk.appendChild(this.badge(c.L, true));
    const ri = el('div', 'col'); ri.style.gap = '4px'; ri.appendChild(el('div', 'eyebrow', lt('PLAYER RANK'))); ri.appendChild(el('h2', '', r.name));
    const lo = c.L > 1 ? this.need(c.L - 1) : 0, hi = this.need(c.L), bar = el('span', 'mbar'), fill = el('i'); fill.style.width = (c.L >= 30 ? 100 : Math.min(100, (c.xp - lo) / (hi - lo) * 100)) + '%'; fill.style.background = r.col; bar.appendChild(fill); ri.appendChild(bar);
    ri.appendChild(el('div', 'small mute', c.L >= 30 ? lt('MAX RANK') : ltf('{0} / {1} XP · next rank +{2} CR', fmtNum(c.xp), fmtNum(hi), fmtNum(150 * (c.L + 1))))); rk.appendChild(ri); box.appendChild(rk);
    // completion
    const cp = el('div', 'panel'); const top = el('div', 'topbar'); top.appendChild(el('div', 'eyebrow', lt('COMPLETION'))); top.appendChild(el('b', 'j-pct', c.pct + '%')); cp.appendChild(top);
    for (const [k, v, mx] of c.parts) { const row = el('div', 'j-row'); row.appendChild(el('span', '', lt(k))); row.appendChild(el('span', 'mute', fmtNum(Math.min(v, mx)) + '/' + fmtNum(mx))); const b = el('span', 'mbar'), f = el('i'); f.style.width = Math.min(100, v / (mx || 1) * 100) + '%'; b.appendChild(f); row.appendChild(b); cp.appendChild(row); }
    box.appendChild(cp);
    // next goals
    const gl = this.goals(c); if (gl.length) { const g = el('div', 'panel'); g.appendChild(el('div', 'eyebrow', lt('NEXT GOALS'))); for (const t of gl) g.appendChild(el('div', 'j-goal', '▸ ' + t)); box.appendChild(g); }
    // crowns
    const cr = el('div', 'panel'); cr.appendChild(el('div', 'eyebrow', lt('BOSS CROWNS'))); cr.appendChild(el('div', 'small mute', lt('Clear each chapter boss on SAMURAI, OVERDRIVE and SHINIGAMI.')));
    const grid = el('div', 'j-crowns'); for (const B of c.BS) { const m = c.dm(B), cell = el('div', 'j-cr'), info = BOSS_INFO[B.id]; cell.appendChild(el('span', 'nm', lt(info ? info.name : B.s.name)));
      const pips = el('span', 'pp'); [2, 3, 4].forEach((di, i) => pips.appendChild(el('b', m >= di ? 'on c' + i : '', '♛'))); cell.appendChild(pips); grid.appendChild(cell); }
    cr.appendChild(grid); box.appendChild(cr);
    // star road
    const sr = el('div', 'panel'); sr.appendChild(el('div', 'eyebrow', lt('STAR ROAD'))); const road = el('div', 'j-road');
    for (const [n, cr0] of STAR_ROAD) { const s = el('span', c.stars >= n ? 'on' : ''); s.appendChild(el('b', '', '★' + n)); s.appendChild(document.createTextNode(fmtNum(cr0))); road.appendChild(s); }
    sr.appendChild(road); box.appendChild(sr);
    // boss of the week
    const wb = this.weekBoss(); if (wb) { const b = el('button', 'panel evbanner'); b.style.setProperty('--ec', '#ffd23f'); b.appendChild(el('span', 'evic', '👑')); const x = el('span', 'evtx'); x.appendChild(el('b', '', lt('BOSS OF THE WEEK') + ': ' + lt(BOSS_INFO[wb].name)));
      x.appendChild(el('span', 'small mute', d.wbDone === this.week() ? lt('Cleared this week. A new boss on Monday.') : lt('First legend clear this week: +1,000 CR'))); b.appendChild(x); b.onclick = () => { Aud.sfx('ui'); Flow.startLegend(wb); }; box.appendChild(b); }
  },
  /* the line on the home screen */
  strip() {
    const hero = $('tHero'); if (!hero) return; let b = $('tRank');
    if (!b) { b = el('button', 'panel j-strip'); b.id = 'tRank'; b.type = 'button'; b.onclick = () => { Aud.sfx('ui'); this.open(false); }; }
    if (b.previousElementSibling !== hero) hero.after(b);
    const c = this.calc(), r = this.rank(c.L); b.textContent = ''; b.style.setProperty('--rc', r.col); b.appendChild(this.badge(c.L));
    const t = el('span', 'tx'); t.appendChild(el('b', '', r.name)); t.appendChild(el('span', 'small mute', ltf('{0}% COMPLETE · YOUR JOURNEY', c.pct))); b.appendChild(t); b.appendChild(el('span', 'cv', '›'));
  },
  weekCard() {
    const wb = this.weekBoss(); let b = $('tWeekBoss'); const d = Store.data;
    if (!wb || d.wbDone === this.week()) { if (b) b.classList.add('hidden'); return; }
    if (!b) { b = el('button', 'panel evbanner'); b.id = 'tWeekBoss'; b.type = 'button'; const st = $('bStory'); if (st) st.after(b); }
    b.classList.remove('hidden'); b.textContent = ''; b.style.setProperty('--ec', '#ffd23f'); b.appendChild(el('span', 'evic', '👑'));
    const x = el('span', 'evtx'); x.appendChild(el('b', '', lt('BOSS OF THE WEEK') + ': ' + lt(BOSS_INFO[wb].name))); x.appendChild(el('span', 'small mute', lt('First legend clear this week: +1,000 CR'))); b.appendChild(x);
    b.onclick = () => { Aud.sfx('ui'); Flow.startLegend(wb); };
  }
};
/* heroes you can only earn */
SKINS.push(
  { id: 'apex', name: 'APEX RONIN', body: 'chromesam', a: '#ffffff', b: '#ffd23f', cost: -1, unlock: { t: 'feat', id: 'rank10' }, desc: 'White chrome and gold. Reach PLATINUM rank.' },
  { id: 'neonmaster', name: 'NEON MASTER', body: 'ninja', a: '#ff2bd6', b: '#00f2fe', cost: -1, unlock: { t: 'feat', id: 'rank16' }, desc: 'The colors of the city itself. Reach MASTER rank.' },
  { id: 'legendk', name: 'LIVING LEGEND', body: 'sovereign', a: '#ffd700', b: '#ff0844', cost: -1, unlock: { t: 'feat', id: 'rank21' }, desc: 'Worn by very few. Reach LEGEND rank.' },
  { id: 'reaper', name: 'DEATH GOD', body: 'lich', a: '#c9c2ff', b: '#4b1a8a', cost: -1, unlock: { t: 'feat', id: 'reaper' }, desc: 'Beat any chapter boss on SHINIGAMI.' },
  { id: 'crowned', name: 'CROWNED SHOGUN', body: 'shogun', a: '#ffd23f', b: '#14141e', cost: -1, unlock: { t: 'feat', id: 'crown8' }, desc: 'Win 8 OVERDRIVE crowns from chapter bosses.' },
  { id: 'starborn', name: 'STARBORN', body: 'kitsune', a: '#00f2fe', b: '#ffd23f', cost: -1, unlock: { t: 'stars', n: 150 }, desc: 'A spirit fox made of starlight. Earn 150 story stars.' },
  { id: 'complete', name: 'THE COMPLETE', body: 'seraph', a: '#ffffff', b: '#00f2fe', cost: -1, unlock: { t: 'feat', id: 'comp75' }, desc: 'Reach 75% completion.' }
);
{
  const FEAT = { rank10: c => c.L >= 10, rank16: c => c.L >= 16, rank21: c => c.L >= 21, reaper: c => c.crowns[2] >= 1, crown8: c => c.crowns[1] >= 8, comp75: c => c.pct >= 75 };
  const FEAT_T = { rank10: 'Reach PLATINUM rank', rank16: 'Reach MASTER rank', rank21: 'Reach LEGEND rank', reaper: 'Beat any chapter boss on SHINIGAMI', crown8: 'Win 8 OVERDRIVE boss crowns', comp75: 'Reach 75% completion' };
  const uo0 = unlockOk; unlockOk = function (u) { if (u && u.t === 'feat') { try { return !!(FEAT[u.id] && FEAT[u.id](Journey.calc())); } catch (e) { errLog(e); return false; } } return uo0(u); };
  const ut0 = unlockText; unlockText = function (u) { if (u && u.t === 'feat') return lt(FEAT_T[u.id] || 'LOCKED'); return ut0(u); };
  TITLES.push(
    { id: 'jplat', n: 'PLATINUM', d: 'Reach PLATINUM rank', ok: () => Journey.calc().L >= 10 },
    { id: 'jmaster', n: 'MASTER', d: 'Reach MASTER rank', ok: () => Journey.calc().L >= 16 },
    { id: 'jascend', n: 'ASCENDED', d: 'Clear every chapter boss on OVERDRIVE', ok: () => { const c = Journey.calc(); return c.crowns[1] >= c.BS.length; } },
    { id: 'jreaper', n: 'DEATH GOD', d: 'Beat any chapter boss on SHINIGAMI', ok: () => Journey.calc().crowns[2] >= 1 },
    { id: 'jcomplete', n: 'COMPLETIONIST', d: 'Reach 100% completion', ok: () => Journey.calc().pct >= 100 }
  );
  // the home screen: rank strip, boss of the week in TODAY, payouts, and the endgame screen once the story is done
  const ot1 = UI.openTitle.bind(UI);
  UI.openTitle = function () {
    const r = ot1.apply(this, arguments);
    try { Journey.strip(); Journey.weekCard(); if (typeof Today !== 'undefined') { if (!Today.ids.includes('tWeekBoss')) Today.ids.splice(1, 0, 'tWeekBoss'); Today.build(); }
      const d = Store.data; Journey.pend = (Journey.pend || []).concat(Journey.payouts()); if (Journey.pend.length) setTimeout(() => { if (UI.cur === 'title' && Journey.pend.length && !document.querySelector('.unlock39')) { const k = Journey.pend; Journey.pend = []; for (const c of k) Journey.card(...c); Journey.strip(); } }, 700);
      if (d.story.done.any && !d.jIntro) { d.jIntro = 1; Store.touch(); setTimeout(() => { if (UI.cur === 'title') Journey.open(true); }, 400); } } catch (e) { errLog(e); }
    return r;
  };
  // boss of the week pays on its first legend clear of the week
  const or1 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    try { const L = Legend.cur, d = Store.data, wk = Journey.week();
      if (L && G.legend === L.id && o && !o.wbDone && G.state === 'CLEAR' && L.id === Journey.weekBoss() && d.wbDone !== wk) { o.wbDone = 1; d.wbDone = wk; d.credits += 1000; Store.touch(); o.notes = o.notes || []; o.notes.push({ t: lt('BOSS OF THE WEEK') + ' · +1,000 CR', c: 'gold' }); } } catch (e) { errLog(e); }
    return or1(o);
  };
  const css = document.createElement('style'); css.id = 'j42css';
  css.textContent = `
.rk42 { --rc: #ffd23f; position: relative; flex: none; width: 40px; height: 44px; display: grid; place-items: center; clip-path: polygon(50% 0, 100% 22%, 100% 74%, 50% 100%, 0 74%, 0 22%);
  background: linear-gradient(160deg, color-mix(in srgb, var(--rc) 85%, #fff), color-mix(in srgb, var(--rc) 45%, #05060f)); box-shadow: 0 0 16px var(--rc); }
.rk42 i { font: italic 700 15px var(--fd); color: #05060f; font-style: normal; } .rk42.big { width: 64px; height: 70px; } .rk42.big i { font-size: 24px; }
.j-strip { --rc: #ffd23f; display: flex; align-items: center; gap: 12px; width: 100%; text-align: start; color: var(--fg); border-color: color-mix(in srgb, var(--rc) 55%, transparent); }
.j-strip .tx { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; } .j-strip .tx b { font: 700 16px var(--fd); letter-spacing: 1px; color: var(--rc); } .j-strip .cv { display: inline-block; font-size: 24px; color: var(--rc); }
[dir="rtl"] .j-strip .cv { transform: scaleX(-1); }
.j-rank { --rc: #ffd23f; display: flex; gap: 14px; align-items: center; border-color: var(--rc); } .j-rank h2 { color: var(--rc); } .j-rank .col { flex: 1; min-width: 0; }
.j-rank .mbar, .j-row .mbar { display: block; height: 6px; background: rgba(255, 255, 255, .1); } .j-rank .mbar i, .j-row .mbar i { display: block; height: 100%; background: var(--cyan); }
.j-pct { font: italic 700 30px var(--fd); color: var(--gold); }
.j-row { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; font-size: 14px; padding: 6px 0; } .j-row .mbar { grid-column: 1 / -1; height: 4px; }
.j-goal { padding: 6px 0; font-size: 15px; border-bottom: 1px solid rgba(255, 255, 255, .06); } .j-goal:last-child { border-bottom: 0; }
.j-crowns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
.j-cr { min-width: 0; display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 7px 9px; background: rgba(255, 255, 255, .04); border: 1px solid var(--line); clip-path: var(--cut); font-size: 12px; }
.j-cr .nm { font: 700 12px var(--fd); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .j-cr .pp { display: flex; gap: 2px; flex: none; }
.j-cr .pp b { color: #2a3150; font-size: 15px; } .j-cr .pp b.on.c0 { color: #d08a4a; } .j-cr .pp b.on.c1 { color: #c8d2e6; } .j-cr .pp b.on.c2 { color: #ffd23f; text-shadow: 0 0 8px #ffd23f; }
.j-road { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; margin-top: 8px; }
.j-road span { display: flex; flex-direction: column; align-items: center; padding: 6px 2px; border: 1px solid var(--line); font: 11px var(--fm); color: var(--mute); clip-path: var(--cut); }
.j-road span b { font: 700 12px var(--fd); color: var(--fg); } .j-road span.on { border-color: var(--gold); color: var(--gold); background: rgba(255, 215, 0, .08); }
.j-hero { border-color: var(--gold); background: linear-gradient(135deg, rgba(255, 8, 68, .25), rgba(121, 40, 202, .25)); text-align: center; display: flex; flex-direction: column; gap: 6px; }
.j-hero h2 { color: var(--gold); font-size: 24px; }
`; document.head.appendChild(css);
}
