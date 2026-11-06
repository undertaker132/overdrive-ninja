/* =====================================================================
   UI — DOM screens: title, story map, arcade, dock, achievement popups.
   Lists are rebuilt only when a screen opens or changes; the in-game
   dock refreshes at 10 Hz. (Arsenal: 65-shop.js, settings and extra
   screens: 66-menus.js)
   ===================================================================== */
function dailyInfo() {
  const keep = R.s; R.seed(todayKey() * 7919);
  const DM = dailyModPool(todayKey()), a = R.i(DM.length); let b = R.i(DM.length); if (b === a) b = (a + 1) % DM.length;
  const dw = DAILY_WEAPONS(todayKey()), w = dw[R.i(dw.length)]; R.s = keep;
  return { mods: [DM[a], DM[b]], weapon: w };
}
function weeklyInfo() { const keep = R.s; R.seed(weekKey() * 104729 + 17); const dw = DAILY_WEAPONS(todayKey()), w = dw[R.i(dw.length)]; R.s = keep; return { rule: weekRule(), weapon: w }; }
const UI = {
  cur: '', backTo: 'title', dockDirty: true, dockT: 0, dockH: 76, storyCh: 0, storySel: 0, asTab: 0, clTab: 0, achQ: [], achT: 0,
  init() {
    document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { Aud.sfx('back'); this.back(); }));
    $('bStory').onclick = () => { Aud.sfx('ui'); this.openStory(); };
    $('bArcade').onclick = () => { Aud.sfx('ui'); this.openArcade(); };
    $('bArsenal').onclick = () => { Aud.sfx('ui'); this.backTo = 'title'; this.openArsenal(); };
    $('bClub').onclick = () => { Aud.sfx('ui'); this.openClub(); };
    $('bSettings').onclick = () => { Aud.sfx('ui'); this.backTo = 'title'; this.openSettings(); };
    $('bDojo').onclick = () => { Aud.sfx('ui'); Flow.startArcade('dojo'); };
    $('bEditor').onclick = () => { Aud.sfx('ui'); Editor.open(); };
    $('bHideout').onclick = () => { Aud.sfx('ui'); Hideout.open(); $('hdCredits').textContent = fmtNum(Store.data.credits) + ' CR'; };
    $('bWeekly').onclick = () => { Aud.sfx('ui'); Store.data.mode = 'weekly'; this.openArcade(); };
    $('bDaily').onclick = () => { Aud.sfx('ui'); Flow.startArcade('daily'); };
    $('bPuzzle').onclick = () => { Aud.sfx('ui'); this.openPuzzles(); };
    $('bLive').onclick = () => { Aud.sfx('ui'); this.openLive(); };
    $('bProfile').onclick = () => { Aud.sfx('ui'); this.openProfile(); };
    $('bSeason').onclick = () => { Aud.sfx('ui'); this.openSeason(); }; this.photoInit();
    $('cmCv').addEventListener('pointerdown', e => { e.preventDefault(); Comic.tap(); });
    $('cmSkip').onclick = () => { Aud.sfx('back'); Comic.end(); };
    $('stComic').onclick = () => { Aud.sfx('ui'); Comic.play(this.storyCh + 1, () => this.openStory()); };
    $('stEpi').onclick = () => { Aud.sfx('ui'); Comic.play(this.storyCh === 19 ? 'end7' : this.storyCh === 17 ? 'end5' : this.storyCh === 13 ? 'end4' : this.storyCh === 11 ? 'end3' : this.storyCh === 8 ? 'end2' : 'end', () => this.openStory()); };
    $('stIntro').onclick = () => { Aud.sfx('ui'); Intro.play(() => this.openStory()); };
    $('tHero').onclick = () => { Aud.sfx('ui'); this.backTo = 'title'; this.asTab = 1; this.asSel = null; this.openArsenal(); };
    $('tProfile').onclick = () => { Aud.sfx('ui'); this.openProfile(); };
    $('pzPlay').onclick = () => { Aud.sfx('ui'); if (this.pzSel) Flow.startPuzzle(this.pzSel); };
    $('tCreator').onclick = () => { Aud.sfx('ui'); this.openDash(); };
    $('tNews').onclick = () => { Aud.sfx('ui'); this.openNews(); };
    $('stPlay').onclick = () => { Aud.sfx('ui'); Flow.startStory(this.storySel); };
    $('stNG').onclick = () => { Aud.sfx('ui'); const s = Store.data.story; s.ng = s.ng ? 0 : 1; Store.touch(); this.renderStory(); };
    $('stSpeed').onclick = () => { Aud.sfx('ui'); Flow.startSpeedrun(); };
    $('arPlay').onclick = () => { Aud.sfx('ui'); Flow.startArcade(Store.data.mode); };
    $('pauseBtn').addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); Flow.togglePause(); });
    $('rbPlay').onclick = () => { if (!REPLAY.on) return; REPLAY.paused = !REPLAY.paused; $('rbPlay').textContent = REPLAY.paused ? '▶' : '❚❚'; };
    $('rbSpeed').onclick = () => { if (!REPLAY.on) return; REPLAY.speed = ({ 1: 2, 2: 4, 4: .25, .25: .5, .5: 1 })[REPLAY.speed] || 1; $('rbSpeed').textContent = REPLAY.speed + '×'; };
    $('rbClip').onclick = () => { if (REPLAY.on && Replays.cur && !Replays.clipOn) { const r = Replays.cur, b = Replays.back; REPLAY.stop(); Replays.clip(r, b); } };
    $('rbExit').onclick = () => { if (Replays.clipOn) { Replays.clipOn = false; if (Replays.mr) { const m = Replays.mr; Replays.mr = null; try { m.onstop = null; m.stop(); } catch (e) { errLog(e); } } } UI.replayExit(); };
    this.dockEls = [];
    document.querySelectorAll('#dock .sk').forEach(b => {
      const k = b.dataset.k;
      this.dockEls.push({ b, k, t: b.querySelector('.t'), f: b.querySelector('.fill'), def: SKILLS.find(s => s.id === k), txt: '', h: -1 });
      b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); if (HudEdit.on) { HudEdit.grab(b, e); return; } if (k === 'od') overdrive(); else if (k === 'swap') swapWeapon(); else useSkill(k); this.dockDirty = true; });
    });
    $('psResume').onclick = () => Flow.togglePause();
    $('psRestart').onclick = () => { Aud.sfx('ui'); Flow.restart(); };
    $('psSettings').onclick = () => { Aud.sfx('ui'); this.backTo = 'pause'; this.openSettings(); };
    $('tReport').onclick = () => { Aud.sfx('ui'); this.openReport(() => this.openTitle()); };
    $('psReport').onclick = () => { Aud.sfx('ui'); this.openReport(() => { this.show('pause'); }); };
    $('psQuit').onclick = () => { Aud.sfx('back'); Flow.quit(true); };
    $('setReset').onclick = () => { $('setConfirm').classList.remove('hidden'); };
    $('setNo').onclick = () => { $('setConfirm').classList.add('hidden'); };
    $('setYes').onclick = () => {
      const keepUser = Store.data.user, keepSet = Store.data.settings;
      Store.data = Store.def(); Store.data.user = keepUser; Store.data.settings = keepSet;
      while (Store.data.bounties.length < 3) Store.data.bounties.push(newBounty(Store.data.bounties.map(b => b.k)));
      Store.touch(); Store.flush(true); $('setConfirm').classList.add('hidden'); toastDom(lt('PROGRESS RESET')); this.openSettings();
    };
    $('crDone').onclick = () => { Aud.sfx('ui'); this.openStory(); };
    $('clCrews').onclick = () => { Aud.sfx('ui'); this.openCrews(); };
    $('clInvite').onclick = () => { Aud.sfx('ui'); this.openInvite(); };
    $('inSkip').onclick = () => { Aud.sfx('back'); Intro.end(); };
    $('inCv').addEventListener('pointerdown', e => { e.preventDefault(); Intro.tap(); });
    this.measureDock();
  },
  measureDock() { const d = $('dock'); if (d && !d.classList.contains('hidden')) { const h = d.getBoundingClientRect().height; if (h > 20) this.dockH = h; } },
  show(id) {
    document.querySelectorAll('#ov .scr').forEach(s => s.classList.toggle('hidden', s.id !== 's-' + id));
    $('ov').classList.toggle('hidden', !id); this.cur = id || '';
    this.syncHud();
  },
  syncHud() {
    const play = G.state === 'PLAY';
    $('dock').classList.toggle('hidden', !(play || (G.state === 'PAUSE' && !G.photo) || G.state === 'PERK'));
    $('pauseBtn').classList.toggle('hidden', !play);
    if (play) { this.dockDirty = true; this.measureDock(); }
  },
  back() {
    if (this.goBack()) return;
    if (this.cur === 'settings' && this.backTo === 'pause') { this.show('pause'); return; }
    this.openTitle();
  },
  /* ---------------- title ---------------- */
  openTitle() {
    if (Cloud.conflict) { this.openSync(); return; } // two saves: the player decides first
    G.state = 'MENU'; this.backFn = null; this.show('title'); Aud.music('menu'); Aud.intensity = 0; BG.set('maglev');
    this.refreshProfile(); this.renderTitleHero();
    const di = dailyInfo(), d = Store.data;
    $('tDaily').textContent = lt(di.weapon.name) + ' · ' + lt(di.mods[0].name) + ' + ' + lt(di.mods[1].name) + (d.best.dailyDate === todayKey() ? ' · ' + lt('best') + ' ' + fmtNum(d.best.daily) : '');
    const box = $('tBounties'); box.textContent = '';
    for (const b of d.bounties) {
      const r = el('div', 'bty'); r.appendChild(el('span', '', bountyText(b))); r.appendChild(el('span', 'gold small', '+' + b.r + ' CR'));
      const bar = el('div', 'bar'), i = el('i'); i.style.width = Math.min(100, b.p / b.n * 100) + '%'; bar.appendChild(i); r.appendChild(bar); box.appendChild(r);
    }
    $('tFoot').textContent = 'v' + VERSION + ' · ★ ' + Store.stars() + '/' + STAGES.length * 3 + ' · ' + lt('Best Maglev') + ' ' + fmtNum(d.best.endless);
    $('tCreator').classList.toggle('hidden', !Cloud.owner);
    this.renderRivals(); this.titleV12();
    if (d.seenVer !== VERSION) { if (d.stats.runs > 0) setTimeout(() => { if (this.cur === 'title') this.openNews(); }, 400); else { d.seenVer = VERSION; Store.touch(); } }
  },
  refreshProfile() {
    const d = Store.data;
    const p = $('tProfile'); if (p) p.textContent = d.user.guest ? lt('GUEST · LOCAL SAVE') : d.user.name.toUpperCase() + ' · ' + lt('CLOUD SAVE');
    Motion2.roll($('tCredits'), d.credits, ' CR');
    const m = $('clMe'); if (m) m.textContent = d.user.guest ? lt('GUEST') : d.user.name.toUpperCase();
    Motion2.roll($('asCredits'), d.credits, ' CR');
  },
  /* ---------------- story map ---------------- */
  openStory() {
    G.state = 'MENU'; this.backFn = null; this.show('story'); Aud.music('menu');
    const un = Store.data.story.unlocked;
    this.storySel = Math.min(un, STAGES.findIndex(s => s.secret) - 1); this.storyCh = STAGES[this.storySel].ch;
    this.renderStory();
  },
  renderStory() {
    const d = Store.data, sv = d.story, un = sv.unlocked, ng = !!(sv.ng && sv.done.any), stars = ng ? sv.starsNG : sv.stars;
    let total = 0; for (const k in stars) total += stars[k] | 0;
    $('stStars').textContent = (ng ? 'NG+ ' : '') + '★ ' + total + '/' + STAGES.length * 3;
    const tabs = $('stTabs'); tabs.textContent = ''; tabs.style.gridTemplateColumns = 'repeat(' + (CHAPTERS.length > 5 ? 3 : CHAPTERS.length) + ',1fr)';
    CHAPTERS.forEach((c, i) => {
      const first = chFirst(i), lock = c.secret ? !EX_ACTS.some((A, k) => exActStars(k)) : first > un, b = el('button', (i === this.storyCh ? 'on' : '') + (lock ? ' lock' : '') + (c.bonus ? ' bonus' : ''));
      b.appendChild(el('b', '', c.bonus ? '★' + (c.bn || '') : lt('CH') + ' ' + c.n)); b.appendChild(document.createTextNode(lock ? lt('LOCKED') : lt(c.name)));
      b.onclick = () => { if (lock) { Aud.sfx('deny'); toastDom(c.lock ? lt(c.lock) : lt('LOCKED')); return; } Aud.sfx('ui'); this.storyCh = i; this.storySel = c.secret ? Math.max(first, STAGES.findIndex((s, j) => j >= first && stageOpen(j))) : Math.min(un, first + chLen(i) - 1); this.renderStory(); };
      tabs.appendChild(b);
    });
    const ch = CHAPTERS[this.storyCh]; $('stChap').textContent = (ch.bonus ? lt('BONUS') : lt('CHAPTER') + ' ' + ch.n) + ' // ' + lt(ch.sub).toUpperCase();
    { const sv0 = Store.data.story, open = chFirst(this.storyCh) <= sv0.unlocked && !!COMICS[this.storyCh + 1]; $('stComic').classList.toggle('hidden', !open); $('stEpi').classList.toggle('hidden', !((this.storyCh === 3 && sv0.done.any) || (this.storyCh === 8 && sv0.stars['9-3']) || (this.storyCh === 11 && sv0.stars['12-3']) || (this.storyCh === 13 && sv0.stars['14-3']) || (this.storyCh === 17 && sv0.stars['18-4']) || (this.storyCh === 19 && sv0.stars['20-4']))); $('stComics').classList.toggle('hidden', !open); $('stIntro').classList.toggle('hidden', this.storyCh !== 0); }
    const list = $('stList'); list.textContent = '';
    for (let i = chFirst(this.storyCh), i1 = i + chLen(this.storyCh); i < i1; i++) {
      const s = STAGES[i], lock = !stageOpen(i), st = stars[s.id] | 0;
      const b = el('button', 'stage' + (i === this.storySel ? ' on' : '') + (lock ? ' lock' : '') + (s.obj.t === 'boss' ? ' boss' : ''));
      b.appendChild(el('span', 'id', s.id)); b.appendChild(el('span', 'nm', lt(s.name)));
      const sp = el('span', 'stars'); for (let k = 0; k < 3; k++) { if (k < st) sp.appendChild(el('b', '', '★')); else sp.appendChild(document.createTextNode('★')); } b.appendChild(sp);
      b.appendChild(el('span', 'ob', lock ? (s.secret ? ltf('Earn 3 stars on every stage of act {0}', EX_ACTS[s.secret - 1].n) : lt('Clear the previous stage to unlock')) : stageObjLine(s)));
      b.onclick = () => { if (lock) { Aud.sfx('deny'); return; } Aud.sfx('ui'); this.storySel = i; this.renderStory(); };
      list.appendChild(b);
    }
    const s = STAGES[this.storySel], info = $('stInfo'); info.textContent = '';
    info.appendChild(el('div', 'eyebrow', lt('STAR GOALS')));
    [lt('Clear the stage'), lt('Take 2 hits or fewer'), lt(s.star.d)].forEach((tx, k) => { const r = el('div'); r.appendChild(el('span', (stars[s.id] | 0) > k ? 'gold' : 'mute', '★ ')); r.appendChild(document.createTextNode(tx)); info.appendChild(r); });
    const extra = [];
    if (s.unlock) extra.push(lt('NEW SKILL') + ': ' + lt(s.unlock === 'od' ? 'OVERDRIVE' : SKILLS.find(k => k.id === s.unlock).name));
    if (sv.best[s.id]) extra.push(lt('BEST') + ' ' + fmtNum(sv.best[s.id]));
    if (sv.diffMax[s.id] != null) extra.push(lt('CLEARED ON') + ' ' + lt(DIFFS[sv.diffMax[s.id]].name));
    if (ng) extra.push(lt('NEW GAME+: tougher enemies and new boss attacks'));
    if (extra.length) info.appendChild(el('div', 'small gold', extra.join(' · ')));
    const spb = $('stSpeed'), sb = d.speed.best | 0; spb.classList.toggle('hidden', !sv.done.any);
    spb.textContent = lt('SPEEDRUN: 12 STAGES IN A ROW') + (sb ? ' · ' + lt('BEST') + ' ' + fmtMs(sb) : '');
    const ngb = $('stNG'); ngb.classList.toggle('hidden', !sv.done.any); ngb.textContent = lt('NEW GAME+') + ': ' + lt(ng ? 'ON' : 'OFF'); ngb.classList.toggle('on', ng);
    this.renderDiff('stDiff', 'stDiffD');
  },
  renderDiff(boxId, descId) {
    const box = $(boxId); box.textContent = '';
    DIFFS.forEach((df, i) => {
      const b = el('button', i === Store.data.diff ? 'on' : '', lt(df.name));
      b.onclick = () => { Aud.sfx('ui'); Store.data.diff = i; Store.touch(); if (boxId === 'stDiff') this.renderStory(); else this.renderArcade(); };
      box.appendChild(b);
    });
    if (descId) $(descId).textContent = lt(DIFFS[Store.data.diff].desc) + ' ' + ltf('Score x{0} · Credits x{1}', DIFFS[Store.data.diff].score, DIFFS[Store.data.diff].cred);
  },
  /* ---------------- arcade ---------------- */
  openArcade() { G.state = 'MENU'; this.backFn = null; this.show('arcade'); this.renderArcade(); },
  renderArcade() {
    const d = Store.data, list = $('arList'); list.textContent = '';
    if (!MODES.some(m => m.id === d.mode && !m.mp) || (d.mode === 'arena' && !BossArena.unlocked())) d.mode = 'endless';
    for (const m of MODES) {
      if (m.mp) continue; // live modes start from the LIVE screen
      const locked = m.id === 'arena' && !BossArena.unlocked();
      const b = el('button', 'item' + (d.mode === m.id ? ' on' : '') + (locked ? ' lock' : ''));
      b.appendChild(el('span', 'nm', lt(m.name)));
      const best = m.id === 'daily' ? (d.best.dailyDate === todayKey() ? d.best.daily : 0) : m.id === 'weekly' ? ii(d.weekly.scores[weekKey()]) : m.id === 'dojo' ? 0 : d.best[m.id];
      if (locked) { b.appendChild(el('span', 'pr', lt('LOCKED'))); b.appendChild(el('span', 'ds', ltf('Meet 3 bosses in the story to open the arena ({0}/3).', BossArena.met().length))); b.onclick = () => Aud.sfx('deny'); list.appendChild(b); continue; }
      b.appendChild(el('span', 'pr', m.id === 'dojo' ? (d.dojo.done ? lt('COMPLETE') : lt('PRACTICE')) : best ? lt('BEST') + ' ' + fmtNum(best) : lt('NO RUN YET')));
      let desc = lt(m.desc);
      if (m.id === 'daily') { const di = dailyInfo(); desc += ' ' + ltf('Today: {0}, {1} ({2}), {3} ({4}).', lt(di.weapon.name), lt(di.mods[0].name), lt(di.mods[0].desc), lt(di.mods[1].name), lt(di.mods[1].desc)); }
      if (m.id === 'weekly') { const wi = weeklyInfo(); desc += ' ' + ltf('This week: {0} — {1}. Blade: {2}.', lt(wi.rule.name), lt(wi.rule.desc), lt(wi.weapon.name)); }
      b.appendChild(el('span', 'ds', desc));
      b.onclick = () => { Aud.sfx('ui'); d.mode = m.id; Store.touch(); this.renderArcade(); };
      list.appendChild(b);
    }
    this.renderDiff('arDiff');
    $('arDiffWrap').classList.toggle('hidden', d.mode === 'dojo');
    this.renderContracts(); this.renderAltar(); this.renderNemesis(); this.renderFChal();
  },
  /* ---------------- in-game dock ---------------- */
  tick(rd) {
    this.replayTick();
    if (this.achT > 0) { this.achT -= rd; if (this.achT <= 0) { $('achPop').classList.remove('show'); } }
    else if (this.achQ.length) { const a = this.achQ.shift(); $('achTxt').textContent = lt(a.name) + '  +' + a.r + ' CR'; $('achPop').classList.add('show'); this.achT = 2.6; Aud.sfx('star', 2); }
    if (this.cur === 'arsenal') Preview.tick(rd); else if (this.cur === 'title') TitleHero.tick(rd); else if (this.cur === 'comic') Comic.tick(rd); else if (this.cur === 'intro') Intro.tick(rd); else if (this.cur === 'photo') Photo.tick(rd); else if (this.cur === 'hideout') Hideout.tick(rd);
    if (G.state !== 'PLAY') return;
    this.dockT -= rd; if (this.dockT > 0 && !this.dockDirty) return;
    this.dockT = .1; this.dockDirty = false;
    for (const o of this.dockEls) {
      const b = o.b, k = o.k; let txt, h;
      if (k === 'od') {
        const pct = Math.floor(G.od), on = !!P.has.od;
        b.classList.toggle('hidden', !on); b.classList.toggle('ready', on && (pct >= 100 || G.odT > 0)); b.classList.toggle('cd', on && pct < 100 && G.odT <= 0);
        txt = !on ? lt('LOCKED') : G.odT > 0 ? lt('ACTIVE') : pct + '%'; h = on ? Math.min(100, pct) : 0;
      } else if (k === 'swap') {
        const on = !!P.w2, cd = P.swCd || 0; b.classList.toggle('hidden', !on); b.classList.toggle('cd', on && cd > 0); b.classList.toggle('ready', on && P.swapT > 0);
        txt = !on ? '' : cd > 0 ? cd.toFixed(1) + 's' : lt(P.w2.name).split(' ').pop(); h = on && cd > 0 ? Math.min(100, Math.round(cd / 1.2 * 100)) : 0;
      } else {
        const on = !!P.has[k], cd = P.cds[k], full = o.def.cd * P.cdMul;
        b.classList.toggle('hidden', !on); b.classList.toggle('cd', on && cd > 0);
        txt = !on ? lt('LOCKED') : cd > 0 ? cd.toFixed(1) + 's' : lt('READY'); h = on && cd > 0 ? Math.min(100, Math.round(cd / full * 100)) : 0;
      }
      if (txt !== o.txt) { o.txt = txt; o.t.textContent = txt; }
      if (h !== o.h) { o.h = h; o.f.style.height = h + '%'; }
    }
  }
};
function bountyText(b) { const T = BOUNTY_TYPES.find(q => q.k === b.k); return T ? lt(T.d).replace('{n}', b.n) : b.d; }
function toastDom(m) { if (G.state === 'PLAY') toast(m); else { const p = $('achPop'); $('achTxt').textContent = m; p.querySelector('.a').textContent = lt('SYSTEM'); p.classList.add('show'); UI.achT = 2; setTimeout(() => { p.querySelector('.a').textContent = lt('ACHIEVEMENT UNLOCKED'); }, 2100); } }
function ach(id) {
  if (REPLAY.on) return; // someone else's replay never awards you anything
  const d = Store.data; if (d.ach[id]) return;
  const a = ACHS.find(q => q.id === id); if (!a) return;
  d.ach[id] = 1; d.credits += a.r; Store.touch(); UI.achQ.push(a);
}
function bounty(k, v, abs) {
  if (REPLAY.on) return;
  const B = Store.data.bounties;
  for (let i = 0; i < B.length; i++) {
    const b = B[i]; if (b.k !== k) continue;
    const np = abs ? Math.max(b.p, v) : b.p + v; if (np === b.p) continue; b.p = np; Store.dirty = true;
    if (b.p >= b.n) {
      Store.data.credits += b.r; if (G.state === 'PLAY') toast(ltf('BOUNTY COMPLETE +{0} CR', b.r), '#00ff88'); Aud.sfx('buy');
      const keys = []; for (const o of B) keys.push(o.k); B[i] = newBounty(keys);
    }
  }
}
