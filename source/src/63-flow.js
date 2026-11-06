/* =====================================================================
   FLOW — boot, story/arcade entry, pause, stage clear, game over,
   rewards and progression, credits roll, wake lock
   ===================================================================== */
const Flow = {
  last: null, endT: 0, endCb: null, wake: null,
  async wakeOn() { try { if (navigator.wakeLock && !this.wake) { this.wake = await navigator.wakeLock.request('screen'); this.wake.addEventListener('release', () => { this.wake = null; }); } } catch (e) { this.wake = null; } },
  wakeOff() { try { if (this.wake) this.wake.release(); } catch (e) { errLog(e); } this.wake = null; },
  startStory(idx) {
    const s = STAGES[idx]; if (!s || !stageOpen(idx)) return;
    Aud.init(); this.last = { mode: 'story', idx }; this.endT = 0; REC.on = false; this.sr = null;
    Director.begin('story', s); G.cine = null; G.freeze = 0;
    const pre = () => Dlg.start(s.pre, () => this.enterPlay(), true);
    const intro = () => { if (idx === 0 && !Store.data.story.prologue) { Store.data.story.prologue = 1; Store.touch(); Dlg.start(PROLOGUE, pre, true); } else pre(); };
    const ck = 'cm' + (s.ch + 1), seen = Store.data.seen; // a comic page opens each chapter the first time
    const page = () => { if (s.idx === chFirst(s.ch) && COMICS[s.ch + 1] && !seen[ck] && !G.ngp) { seen[ck] = 1; Store.touch(); Comic.play(s.ch + 1, intro); } else intro(); };
    if (idx === 0 && !Store.data.introSeen && !Store.data.story.prologue) Intro.play(page); // the opening film, once, before the very first stage
    else page();
  },
  startArcade(mode) {
    Aud.init(); if (mode !== 'dojo' && !(MODES.find(q => q.id === mode) || {}).mp) Store.data.mode = mode; Store.touch(); this.last = { mode }; this.endT = 0; this.sr = null;
    const ch = Store.data.chal; if (ch && ch.m === mode && ch.id && (!Ghost.play || Ghost.play.id !== ch.id || Ghost.play.mode !== mode)) Ghost.fetch(ch.id, mode, ch.n);
    Director.begin(mode, null);
    if (REC_MODES[mode]) REC.begin(REC.header(mode)); else REC.on = false; // record the run so it can be replayed
    this.enterPlay();
    if (!Ghost.playOn && !(ch && ch.m === mode)) Ghost.autoRival(mode);
  },
  /* ---------------- story speedrun: the 12 main stages back to back, no dialogue, splits vs your best ---------------- */
  sr: null,
  startSpeedrun() {
    Aud.init(); const d = Store.data;
    this.sr = { i: 0, total: 0, cur: 0, splits: [], deaths: 0, di: d.diff, assist: (+d.settings.speed || 1) < 1 || (d.settings.ahp | 0) > 0 };
    this.srStage(0);
  },
  srStage(i) {
    const s = STAGES[i], sv = Store.data.story, keepNg = sv.ng; this.last = { mode: 'story', idx: i }; this.endT = 0; REC.on = false;
    sv.ng = 0; G.ckpt = null; Director.begin('story', s); sv.ng = keepNg; // speedruns are the normal story
    this.enterPlay(); G.cine = { k: 'stage', t: 0, d: 1.2 }; G.freeze = 1.2;
  },
  srNow() { const r = this.sr; return r ? (r.total + r.cur + G.rtime) * 1000 : 0; },
  srSplit() { // a stage is done: record the split and go straight on
    const r = this.sr, d = Store.data, i = r.i, t = r.cur + G.rtime; r.total += t; r.cur = 0; r.splits.push(Math.round(r.total * 1000));
    const pb = d.speed.splits[i], dl = pb ? r.total * 1000 - pb : 0;
    toast(ltf('SPLIT {0}: {1}', STAGES[i].id, fmtMs(r.total * 1000)) + (pb ? ' (' + (dl <= 0 ? '−' : '+') + fmtMs(Math.abs(dl)) + ')' : ''), pb && dl > 0 ? '#ff3b5c' : '#00ff88');
    if (i + 1 >= MAIN_STAGES) { this.srFinish(); return; }
    r.i = i + 1; this.later(.9, () => { if (this.sr) this.srStage(r.i); });
  },
  srRetry() { const r = this.sr; r.cur += G.rtime; r.deaths++; this.srStage(r.i); },
  srFinish() {
    const r = this.sr, d = Store.data, sp = d.speed, ms = Math.round(r.total * 1000), ranked = !r.assist && r.di >= 1;
    G.state = 'CLEAR'; this.wakeOff(); this.sr = null; sp.runs = (sp.runs | 0) + 1;
    const best = ranked && (!sp.best || ms < sp.best), prevBest = sp.best | 0;
    if (best) { sp.best = ms; sp.splits = r.splits.slice(); sp.di = r.di; }
    const reward = 300 + 60 * Math.max(0, Math.round(20 - r.total / 60)); d.credits += reward;
    Store.touch(); Store.flush(true); Cloud.publishStats();
    const notes = [{ t: '+' + fmtNum(reward) + ' CR', c: 'gold' }];
    if (!ranked) notes.push({ t: lt('Ranked speedruns need RONIN difficulty or harder, without assist mode.'), c: 'mute' });
    else if (prevBest) notes.push({ t: best ? ltf('New record! {0} faster than before.', fmtMs(prevBest - ms)) : ltf('{0} behind your record.', fmtMs(ms - prevBest)), c: best ? 'gold' : 'mute' });
    const spl = r.splits.map((t, i) => STAGES[i].id + ' ' + fmtMs(t)).join(' · '); notes.push({ t: lt('SPLITS') + ': ' + spl, c: 'mute' });
    UI.openResult({
      eyebrow: lt('STORY SPEEDRUN') + ' · ' + lt(DIFFS[r.di].name), title: fmtMs(ms), col: '#00f2fe', stars: null, best,
      stats: [[lt('TIME'), fmtMs(ms)], [lt('BEST'), fmtMs(sp.best | 0)], [lt('DEATHS'), '' + r.deaths], [lt('CREDITS'), '+' + fmtNum(reward)]],
      notes, share: null,
      main: [lt('RUN AGAIN'), () => this.startSpeedrun()], alt: [lt('STORY MAP'), () => this.quit()]
    });
  },
  runId: 0,
  enterPlay() {
    G.state = 'PLAY'; G.cine = { k: 'stage', t: 0, d: 2.3 }; G.freeze = 2.3; In.cancel();
    UI.show(null); UI.syncHud(); this.wakeOn(); Aud.music('run', false);
    const rid = ++this.runId, later = (ms, fn) => setTimeout(() => { if (this.runId === rid && G.state === 'PLAY') fn(); }, ms); // a hint never leaks into the next run
    if (G.stage && G.stage.tut === 'hack' && !Tut.on()) later(2600, () => hint('hack', lt('STAND STILL INSIDE A TERMINAL RING TO HACK IT')));
    if (G.stage && G.stage.tut === 'defend' && !Tut.on()) later(2600, () => hint('defend', lt('KEEP ENEMIES AWAY FROM THE PINK UPLINK')));
    if (G.stage && G.stage.tut === 'boss') later(5200, () => hint('boss', lt('SEVER THE ARMS, THEN SLASH THE GOLD ARC')));
    if (G.stage && G.stage.mod && G.stage.mod.storm) later(2500, () => toast(lt('ORBITAL STORM — WATCH THE BLUE CIRCLES'), '#9fd8ff'));
    if (G.mode === 'weekly' && G.rule) later(2500, () => toast(lt(G.rule.name) + ' — ' + lt(G.rule.desc), '#ff4fd8'));
  },
  startPuzzle(id) {
    const def = Puzzles.get(id); if (!def) return;
    Aud.init(); this.last = { mode: 'puzzle', id }; this.endT = 0; REC.on = false;
    Director.begin('puzzle', null); Puzzle.begin(def, id);
    const f = Store.data.puzzle.fails; Puzzle.hint = (f[id] | 0) >= 2; // stuck? the first move is drawn in gold
    this.enterPlay(); G.cine = { k: 'stage', t: 0, d: 1.4 }; G.freeze = 1.4;
  },
  puzzleEnd(win) {
    const id = Puzzle.id, def = Puzzle.def, d = Store.data, pz = d.puzzle; if (G.state !== 'PLAY') return;
    G.state = win ? 'CLEAR' : 'OVER'; In.cancel(); this.wakeOff(); UI.syncHud();
    const notes = [], st = win ? Puzzle.stars() : 0, prev = pz.stars[id] | 0;
    if (win) {
      if (st > prev) { pz.stars[id] = st; const cr = (st - prev) * 30; d.credits += cr; notes.push({ t: ltf('NEW BEST: {0} ★  +{1} CR', st, cr), c: 'gold' }); }
      if (id === 'daily') pz.daily[todayKey()] = Math.max(pz.daily[todayKey()] | 0, st);
      if (st < 3) notes.push({ t: ltf('Par is {0} dashes. Can you do it in {0}?', def.par), c: 'mute' });
      pz.fails[id] = 0; Aud.sfx('win'); Season.track('puzzle', 1); Season.gain(60);
    } else { pz.fails[id] = (pz.fails[id] | 0) + 1; notes.push({ t: pz.fails[id] >= 2 ? lt('Try again: the gold line now shows the first move.') : lt('Aim, and watch the gold rings: they show what a dash will cut.'), c: 'mute' }); Aud.sfx('lose'); }
    Store.touch(); Store.flush();
    const next = win ? Puzzles.next(id) : null;
    UI.openResult({
      eyebrow: lt('PUZZLE') + ' · ' + Puzzles.label(id), title: win ? lt('PUZZLE CLEARED') : lt('OUT OF MOVES'), col: win ? '#ffd700' : '#ff3b5c',
      stars: win ? [true, st >= 2, st >= 3] : null, best: false, stats: [[lt('MOVES'), Puzzle.moves + ''], [lt('PAR'), def.par + '']], notes,
      main: next ? [lt('NEXT PUZZLE'), () => this.startPuzzle(next)] : [lt('RETRY'), () => this.startPuzzle(id)],
      alt: next ? [lt('RETRY'), () => this.startPuzzle(id)] : [lt('PUZZLES'), () => { this.quit(); }]
    });
  },
  restart() { const l = this.last; if (!l) { UI.openTitle(); return; } Dlg.active = false; if (l.mode === 'puzzle') { this.startPuzzle(l.id); return; } if (l.mode === 'custom') { Custom.play(Custom.lv, Custom.from); return; } if (l.mode === 'story') { Aud.init(); REC.on = false; Director.begin('story', STAGES[l.idx]); this.enterPlay(); } else this.startArcade(l.mode); },
  togglePause() {
    if (Photo.on) { Photo.close(); return; } // Esc in photo mode goes back to the pause menu
    if (G.state === 'PLAY') {
      G.state = 'PAUSE'; In.cancel(); UI.show('pause'); this.wakeOff(); Store.flush();
      const info = $('psInfo'); info.textContent = '';
      info.appendChild(el('div', 'eyebrow', G.mode === 'story' ? ltf('STAGE {0} · {1}', G.stage.id, lt(G.stage.name)) + (G.ngp ? ' · NG+' : '') : G.mode === 'puzzle' ? lt('PUZZLE') + ' · ' + Puzzles.name(Puzzle.id) : lt(MODES.find(m => m.id === G.mode).name)));
      info.appendChild(el('div', '', HUD.objText() + ' · ' + lt(G.diff.name) + (G.assist ? ' · ' + lt('ASSIST') : '')));
      const pk = Object.keys(P.perks).map(k => { const p = PERKS.find(q => q.id === k) || SYNERGIES.find(q => q.id === k) || RELIC_BY_ID[k]; return (p ? lt(p.name) : k) + (P.perks[k] > 1 ? ' x' + P.perks[k] : ''); });
      if (pk.length) info.appendChild(el('div', 'mute', lt('PERKS') + ': ' + pk.join(', ')));
      info.appendChild(el('div', 'mute', lt(P.w.name) + ' · ' + ltf('MASTERY {0}/4', P.mlv) + (P.sig ? ' · ' + lt(SIGS[P.sig].n) + ': ' + lt(SIGS[P.sig].d) : '')));
      info.appendChild(el('div', 'mute', lt('Controls: drag to aim, release to slash. A quick tap dashes to that spot. Out of charges, a swipe dodges. Keys: Q W E R skills, Space Overdrive, Esc pause.')));
    } else if (G.state === 'PAUSE') { G.state = 'PLAY'; UI.show(null); UI.syncHud(); this.wakeOn(); }
  },
  quit(fromPause) {
    Photo.on = false; G.photo = false; FChal.cur = null;
    this.runId++; REC.on = false; this.sr = null;
    if (Live.r && (G.mode === 'race' || G.mode === 'raid') && Live.st === 'play') { // leaving a live game: back to the room
      this.endT = 0; this.wakeOff(); this.bankStats(); G.narrow = 0; V.L = V.L0; V.R = V.R0; CAM.fin = 0;
      Live.st = 'done'; Live.final = ii(G.score); Live.win = false; Live.bonus = 0; Live.pres({ st: 'dead', sc: Live.final }); G.state = 'MENU'; UI.openLive(); return;
    }
    if (fromPause && G.mode === 'story' && G.stage && !G.won) Stats.stage('q', G.stage.id, G.time);
    this.endT = 0; G.state = 'MENU'; Dlg.active = false; $('dlg').classList.add('hidden'); $('dlgTap').classList.add('hidden');
    this.wakeOff(); this.bankStats(); Store.flush(true);
    G.narrow = 0; V.L = V.L0; V.R = V.R0; CAM.fin = 0;
    if (this.last && this.last.mode === 'story') UI.openStory(); else if (this.last && this.last.mode === 'puzzle') UI.openPuzzles(); else UI.openTitle();
  },
  bankStats() {
    const st = Store.data.stats; if (G.banked) return; G.banked = true; Stats.run(G.state === 'CLEAR' || G.won ? 'w' : G.state === 'OVER' ? 'l' : 'q');
    st.kills += G.kills; st.parries += G.parries; st.maxCombo = Math.max(st.maxCombo, G.maxCombo); st.runs++; st.time += G.rtime | 0; Store.touch();
    Season.onRun();
  },
  later(t, cb) { this.endT = t; this.endCb = cb; },
  update(rd) { if (this.endT > 0) { this.endT -= rd; if (this.endT <= 0) { const cb = this.endCb; this.endCb = null; if (cb) cb(); } } },
  shareInfo(sub) { return { sub, chal: FChal.code(), score: G.score, rank: G.maxRk, stats: [[lt('MAX COMBO'), 'x' + G.maxCombo], [lt('PERFECT PARRIES'), '' + G.parries], [lt('KILLS'), '' + G.kills], [lt('TIME'), fmtTime(G.time)]] }; },
  /* ---------------- story clear ---------------- */
  resumeCk: false,
  stageClear() {
    G.ckpt = null;
    if (this.sr) { P.inv = 99; In.cancel(); for (let i = 0; i < BU.n; i++) BU.a[i].alive = false; G.cine = { k: 'clear', t: 0, d: .9, txt: STAGES[this.sr.i].id, col: '#00f2fe' }; Aud.sfx('win'); this.srSplit(); return; }
    P.inv = 99; G.slowT = 2; G.slowK = .3; In.cancel();
    G.cine = { k: 'clear', t: 0, d: 2, txt: lt('STAGE CLEAR'), col: '#00ff88' }; Aud.sfx('win'); vibe('win'); Aud.say('Stage clear', 1); flash(.4, '#00ff88'); poseStart();
    for (let i = 0; i < BU.n; i++) BU.a[i].alive = false;
    this.later(2, () => this.finishStory());
  },
  finishStory() {
    G.state = 'CLEAR'; this.wakeOff(); G.banked = false; this.bankStats();
    const s = G.stage, d = Store.data, sv = d.story, ng = !!G.ngp, starMap = ng ? sv.starsNG : sv.stars, stars = Director.stars(), got = stars.filter(Boolean).length, prev = starMap[s.id] | 0;
    const D = G.diff, firstClear = !sv.diffMax.hasOwnProperty(s.id);
    let reward = Math.round((120 + 30 * s.idx) * D.cred * (firstClear ? 2 : 1) * (ng ? 1.5 : 1)); const newStars = Math.max(0, got - prev); reward += newStars * 60;
    d.credits += reward; starMap[s.id] = Math.max(prev, got);
    const best = G.score > (sv.best[s.id] | 0); if (best) sv.best[s.id] = G.score;
    sv.diffMax[s.id] = Math.max(sv.diffMax[s.id] == null ? -1 : sv.diffMax[s.id], G.di);
    sv.unlocked = Math.max(sv.unlocked, Math.min(STAGES.length - 1, s.idx + 1)); Invite.friendCheck(); Season.track('story', 1);
    const notes = [];
    if (s.final) {
      if (!ng) { sv.done[D.id] = 1; sv.done.any = 1; if (D.id === 'overdrive') ach('nightmare'); if (!d.owned.muramasa) notes.push({ t: lt('MURAMASA.EXE is waiting in the Arsenal.'), c: 'gold' }); notes.push({ t: lt('Bonus chapter and New Game+ unlocked.'), c: 'gold' }); }
      else { sv.doneNG[D.id] = 1; notes.push({ t: lt('NEW GAME+ CLEARED: VOID ONI and VOID REAPER unlocked in the Arsenal.'), c: 'gold' }); }
    }
    if (s.bonusFinal) notes.push({ t: lt('RAIJIN hero and THUNDERCLAP blade skin unlocked in the Arsenal.'), c: 'gold' }, { t: lt('Chapter 6 is open: NULL PROTOCOL.'), c: 'gold' });
    if (s.nullFinal) { ach('nullren'); notes.push({ t: lt('NULL REN hero unlocked in the Arsenal.'), c: 'gold' }, { t: lt('Chapter 7 is open: NEON TIDE.'), c: 'gold' }); }
    if (s.actFinal === 7) notes.push({ t: lt('TIDE DRAGON hero unlocked in the Arsenal.'), c: 'gold' });
    if (s.actFinal === 8) notes.push({ t: lt('IRON MONK hero unlocked in the Arsenal.'), c: 'gold' });
    if (s.final2 && !ng) notes.push({ t: lt('PRIME FRAME hero unlocked in the Arsenal. ACT II complete!'), c: 'gold' }, { t: lt('Chapter 10 is open: ORBITAL SPIRE.'), c: 'gold' });
    if (s.actFinal === 10) notes.push({ t: lt('SERAPH FRAME hero unlocked in the Arsenal.'), c: 'gold' });
    if (s.actFinal === 11) notes.push({ t: lt('VOID LICH hero unlocked in the Arsenal.'), c: 'gold' });
    if (s.final3 && !ng) notes.push({ t: lt('DEUS FRAME hero unlocked in the Arsenal. ACT III complete!'), c: 'gold' });
    if (s.final4 && !ng) notes.push({ t: lt('ABYSS DRAGON hero unlocked in the Arsenal. ACT IV complete!'), c: 'gold' }, { t: lt('Chapter 15 is open: SKY ELEVATOR.'), c: 'gold' });
    if (s.actFinal === 16) notes.push({ t: lt('STAR FRAME hero unlocked in the Arsenal. ACT V complete!'), c: 'gold' }, { t: lt('Chapter 17 is open: OVERGROWN RUINS.'), c: 'gold' });
    if (s.final7 && !ng) notes.push({ t: lt('LANTERN ONI hero unlocked in the Arsenal. ACT VII complete!'), c: 'gold' }, { t: lt('The SECRETS chapter opens EX bosses for every act you finish with all stars.'), c: 'gold' });
    if (s.secret && !ng) { ach('exa' + s.secret); const nEx = EX_ACTS.filter((A, k) => Store.data.ach['exa' + (k + 1)]).length; if (nEx >= 3) ach('ex3'); if (nEx >= EX_ACTS.length) ach('exall'); notes.push({ t: ltf('EX bosses beaten: {0} of {1}', nEx, EX_ACTS.length), c: 'gold' }); }
    if (s.final5 && !ng) notes.push({ t: lt('FIRST BLADE hero and FIRST CODE blade unlocked in the Arsenal. ACT VI complete!'), c: 'gold' });
    let main12 = 0; for (let i = 0; i < MAIN_STAGES; i++) main12 += sv.stars[STAGES[i].id] | 0; if (main12 >= 36) ach('stars36');
    notes.unshift({ t: '+' + fmtNum(reward) + ' CR' + (firstClear ? ' ' + lt('(first clear x2)') : '') + (newStars ? ' · ' + ltf('+{0} new stars', newStars) : ''), c: 'gold' });
    if (G.runCredits) notes.push({ t: ltf('+{0} CR collected on the roof', fmtNum(G.runCredits)) });
    const nx = stageOpen(s.idx + 1) ? STAGES[s.idx + 1] : null;
    if (nx && nx.unlock && !s.final) notes.push({ t: ltf('Next stage unlocks {0}.', lt(nx.unlock === 'od' ? 'OVERDRIVE' : SKILLS.find(k => k.id === nx.unlock).name)), c: 'mute' });
    Stats.stage('c', s.id, G.time);
    Store.touch(); Store.flush(true); Cloud.publishStats();
    const show = () => UI.openResult({
      eyebrow: ltf('STAGE {0} · {1}', s.id, lt(D.name)) + (ng ? ' · NG+' : ''), title: lt('STAGE CLEAR'), col: '#00ff88', stars, best,
      stats: [[lt('SCORE'), fmtNum(G.score)], [lt('TIME'), fmtTime(G.time)], [lt('MAX COMBO'), 'x' + G.maxCombo], [lt('PERFECT PARRIES'), '' + G.parries], [lt('HITS TAKEN'), '' + G.hits], [lt('CREDITS'), '+' + fmtNum(reward + G.runCredits)]],
      notes, share: this.shareInfo(ltf('STAGE {0} · {1}', s.id, lt(s.name))),
      main: s.final && !ng ? [lt('ROLL CREDITS'), () => this.credits()] : s.final2 && !ng ? [lt('ROLL CREDITS'), () => this.credits(2)] : s.final3 && !ng ? [lt('ROLL CREDITS'), () => this.credits(3)] : s.final4 && !ng ? [lt('ROLL CREDITS'), () => this.credits(4)] : s.final5 && !ng ? [lt('ROLL CREDITS'), () => this.credits(5)] : s.final7 && !ng ? [lt('ROLL CREDITS'), () => this.credits(7)] : nx && !s.final ? [lt('NEXT STAGE'), () => this.startStory(s.idx + 1)] : [lt('STORY MAP'), () => this.quit()],
      alt: [lt('RETRY'), () => { Aud.init(); Director.begin('story', s); this.enterPlay(); }]
    });
    Dlg.start(s.post, show, true);
  },
  credits(act) {
    const ep = act === 7 ? 'end7' : act === 5 ? 'end5' : act === 4 ? 'end4' : act === 3 ? 'end3' : act === 2 ? 'end2' : 'end', ck = act === 7 ? 'cmEnd7' : act === 5 ? 'cmEnd5' : act === 4 ? 'cmEnd4' : act === 3 ? 'cmEnd3' : act === 2 ? 'cmEnd2' : 'cmEnd';
    if (!Store.data.seen[ck]) { Store.data.seen[ck] = 1; Store.touch(); Comic.play(ep, () => this.credits(act)); return; } // the epilogue page first
    G.state = 'MENU'; UI.show('credits'); const box = $('crRoll'); box.textContent = '';
    for (const l of act === 7 ? CREDITS_ROLL7 : act === 5 ? CREDITS_ROLL5 : act === 4 ? CREDITS_ROLL4 : act === 3 ? CREDITS_ROLL3 : act === 2 ? CREDITS_ROLL2 : CREDITS_ROLL) box.appendChild(el('div', /UNLOCKED$/.test(l) ? 'gold' : '', l ? lt(l) : ' '));
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
    Aud.intensity = 2; Aud.music('credits'); Aud.say('Neo Edo is free', 1);
  },
  /* ---------------- game over / arcade end ---------------- */
  over(win, reason) {
    if (G.state !== 'PLAY') return;
    if (REPLAY.on) { G.state = 'OVER'; In.cancel(); return; } // a replay ends here; its viewer decides what comes next
    if (REC.on) REC.end();
    G.state = 'OVER'; In.cancel(); this.wakeOff(); if (!win) Nemesis.onDeath();
    if (!win) { glitch(.6); shake(1); flash(.6, '#ff0844'); Aud.sfx('lose'); Aud.say('Mission failed', 1); G.cine = { k: 'clear', t: 0, d: 1.4, txt: reason ? lt('FAILED') : lt('TERMINATED'), col: '#ff0844' }; }
    else { Aud.sfx('win'); G.cine = { k: 'clear', t: 0, d: 1.4, txt: lt('TIME UP'), col: '#ffd700' }; poseStart(); }
    G.banked = false; this.bankStats();
    this.later(1.4, () => this.sr && G.mode === 'story' ? this.srRetry() : G.mode === 'story' ? this.storyFail(reason) : (G.mode === 'race' || G.mode === 'raid') ? Live.finish(win) : G.mode === 'custom' ? Custom.end(win) : this.arcadeEnd(win));
  },
  storyFail(reason) {
    const s = G.stage, ck = !!(G.ckpt && G.ckpt.id === (s.obj.b || '')), cause = deathCause(); Store.flush(true);
    Stats.stage('f', s.id, G.time, G.lastHit || (reason ? 'objective' : 'unknown'));
    const notes = [{ t: reason ? lt(reason) : (cause ? cause[0] : lt('Your shields were broken.')), c: 'gold' }];
    if (ck) notes.push({ t: ltf('Checkpoint saved: phase {0}, boss at {1}% integrity.', G.ckpt.ph, Math.max(1, Math.round(G.ckpt.hpF * 100))), c: 'gold' });
    notes.push({ t: lt('TIP') + ': ' + (cause && !reason ? cause[1] : failTip()), c: 'mute' });
    if (!Store.data.dojo.done && s.idx <= 5) notes.push({ t: lt('Practice every move in the Training Dojo (Title screen → DOJO).'), c: 'mute' });
    if (G.runCredits) notes.push({ t: ltf('+{0} CR kept from collected credits', fmtNum(G.runCredits)) });
    UI.openResult({
      eyebrow: ltf('STAGE {0} · {1}', s.id, lt(G.diff.name)) + (G.ngp ? ' · NG+' : ''), title: lt('MISSION FAILED'), col: '#ff0844', stars: null, best: false,
      stats: [[lt('SCORE'), fmtNum(G.score)], [lt('TIME'), fmtTime(G.time)], [lt('MAX COMBO'), 'x' + G.maxCombo], [lt('PERFECT PARRIES'), '' + G.parries]],
      notes, share: null, coach: Coach.ctx('story stage ' + s.id + ' (' + lt(s.name) + ')', false, cause),
      main: ck ? [lt('CONTINUE FROM CHECKPOINT'), () => { Aud.init(); this.resumeCk = true; Director.begin('story', s); this.enterPlay(); }]
        : [lt('RETRY'), () => { Aud.init(); Director.begin('story', s); this.enterPlay(); }],
      alt: ck ? [lt('RESTART BOSS'), () => { G.ckpt = null; Aud.init(); Director.begin('story', s); this.enterPlay(); }] : [lt('STORY MAP'), () => { this.quit(); }]
    });
  },
  arcadeEnd(win) {
    const d = Store.data, m = G.mode; let best = false;
    if (G.assist) { /* assist runs: no leaderboard bests, no ghosts */ }
    else if (m === 'daily') { if (d.best.dailyDate !== todayKey()) { d.best.dailyDate = todayKey(); d.best.daily = 0; } if (G.score > d.best.daily) { d.best.daily = G.score; best = true; } }
    else if (m === 'weekly') { const wk = weekKey(), ws = d.weekly.scores; if (G.score > (ii(ws[wk]))) { ws[wk] = G.score; best = true; } d.weekly.last = wk; ach('weekly'); }
    else if (m === 'tower' && G.twEv) { /* event climbs are not ranked */ }
    else if (G.score > (d.best[m] | 0)) { d.best[m] = G.score; best = true; }
    const rep = REC.last && REC.last.hdr && REC.last.hdr.m === m ? REC.last : null;
    if (best) { Ghost.upload(m, G.score); if (rep) Replays.upload(m, rep); }
    const bonus = Math.round(G.score / 400 * G.diff.cred); d.credits += bonus; if ((G.heat | 0) > (d.maxHeat | 0)) d.maxHeat = G.heat;
    if (m === 'daily') Season.track('daily', 1); if (m === 'timeattack') Season.track('ta', G.score, true); if (G.heat) Season.track('heat', G.heat, true);
    Stats.arcade(m, G.score, G.time);
    const twSh = m === 'tower' ? Tower.bank() : 0;
    Store.touch(); Store.flush(true); Cloud.publishStats();
    const mode = MODES.find(q => q.id === m), reach = m === 'tower' ? ltf('FLOOR {0}', Tower.floor) : m === 'highway' ? ltf('{0} M', fmtNum(Math.floor(Highway.dist))) : m === 'bossrush' || m === 'arena' ? ltf('BOSSES {0}', G.bossIdx) : m === 'timeattack' ? '90s' : ltf('CAR {0}', G.seqCar);
    const bestV = m === 'daily' ? d.best.daily : m === 'weekly' ? ii(d.weekly.scores[weekKey()]) : d.best[m];
    const cause = !win ? deathCause() : null, notes = [{ t: ltf('+{0} CR score bonus', fmtNum(bonus)), c: 'gold' }];
    if (m === 'tower') { notes.push({ t: ltf('+{0} SOUL SHARDS for the Tower Altar', twSh), c: 'gold' }); if (G.twEv) notes.push({ t: ltf('Event climb: {0}. Event climbs are not ranked.', lt((TOWER_EVENTS.find(q => q.id === G.twEv) || { name: '' }).name)), c: 'mute' }); const rl = RELICS.filter(r => P.perks[r.id]).map(r => lt(r.name)); if (rl.length) notes.push({ t: lt('RELICS') + ': ' + rl.join(', '), c: 'mute' }); }
    { const fc = FChal.note(); if (fc) notes.unshift(fc); }
    if (cause) notes.push({ t: cause[0] + ' · ' + lt('TIP') + ': ' + cause[1], c: 'mute' });
    if (G.assist) notes.push({ t: lt('Assist mode was on, so this run is not ranked.'), c: 'mute' });
    if (d.chal && d.chal.m === m) notes.push({ t: G.chalDone ? ltf('Challenge beaten: {0}', d.chal.n) : ltf('Challenge: {0} short of {1}', fmtNum(Math.max(0, d.chal.s - G.score)), d.chal.n), c: G.chalDone ? 'gold' : 'mute' });
    UI.openResult({
      eyebrow: lt(mode.name) + ' · ' + lt(G.diff.name), title: win ? lt('RUN COMPLETE') : lt('TERMINATED'), col: win ? '#ffd700' : '#ff0844', stars: null, best,
      stats: [[lt('SCORE'), fmtNum(G.score)], [lt('BEST'), fmtNum(ii(bestV))], [lt('REACHED'), reach], [lt('MAX COMBO'), 'x' + G.maxCombo], [lt('PERFECT PARRIES'), '' + G.parries], [lt('CREDITS'), '+' + fmtNum(bonus + G.runCredits)]],
      notes, share: this.shareInfo(lt(mode.name) + ' · ' + reach), replay: rep, coach: Coach.ctx(m, win, cause),
      main: [lt('RETRY'), () => this.startArcade(m)],
      alt: [lt('ARCADE'), () => { this.quit(); UI.openArcade(); }]
    });
  },
  route(go) { // pick the next car (Maglev Run); the black market opens a shop first
    G.state = 'ROUTE'; In.cancel(); P.gch = 0; P.wcr = 0;
    const opts = Route.roll();
    if (REPLAY.on) { REPLAY.routeCb = i => Route.pick(opts, i, go); return; }
    UI.openRoute(opts, i => { if (G.state !== 'ROUTE') return; REC.act(RA.ROUTE, i); G.state = 'PLAY'; UI.show(null); Route.pick(opts, i, go); });
  },
  perk(cb, relic) {
    G.state = 'PERK'; G.msgT = 0; CALL.l = 0; In.cancel(); P.gch = 0; P.wcr = 0; G.perkRelic = !!relic;
    if (REPLAY.on) { REPLAY.perkCb = cb; REPLAY.perkOpts = relic ? Tower.rollRelics() : UI.rollPerks(); return; } // same roll as the live card screen
    UI.openPerk(cb); UI.syncHud();
  }
};
function failTip() {
  const tips = ['Perfect parries refill every dash charge.', 'Bounce off a rail mid-dash: the next hit is always critical.', 'Drag across several enemies to lock them, then release for a chain slash.',
    'At one shield your Overdrive charges 60% faster. Popping it then repairs a shield.', 'Overheating locks your blade. Watch the heat bar under your shields.', 'Upgrades in the Arsenal carry over to every run.',
    'Out of dash charges? Swipe anyway: you dodge with a moment of invulnerability.', 'Style rank rises fastest when you mix moves: parries, bounces, chains, skills.', 'Arrows at the screen edge show enemies about to enter.'];
  return lt(tips[(G.time * 7 | 0) % tips.length]);
}
