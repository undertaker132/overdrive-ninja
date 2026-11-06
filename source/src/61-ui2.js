/* =====================================================================
   UI 2 — community club (leaderboards, profiles, head-to-head,
   challenge + ghost race), roguelite perk cards, result screens
   ===================================================================== */
const CLUB_TABS = [['bestStd', 'MAGLEV', 'endless'], ['bestTa', 'TIME', 'timeattack'], ['bestBr', 'RUSH', 'bossrush'], ['bestAr', 'ARENA', 'arena'], ['bestHw', 'ROAD', 'highway'], ['bestTw', 'TOWER', 'tower'], ['bestDaily', 'DAILY', 'daily'], ['wk', 'WEEK', 'weekly'], ['speedMs', 'SPEED', 'speed']];
function clubField(tab) { return tab[0] === 'wk' ? 'wk' + weekKey() : tab[0]; }
Object.assign(UI, {
  async openClub() {
    G.state = 'MENU'; this.backFn = null; this.show('club'); this.refreshProfile(); this.renderClubTabs(); $('clProf').classList.add('hidden');
    const list = $('clList'); list.textContent = '';
    if (!Cloud.ready) { list.appendChild(el('div', 'panel info', offlineBuild() ? lt('This copy of the game runs offline: your progress is saved on this device. The club, live play, cloud saves and Ask Mika are in the online version.') : lt('You are playing as a guest, so scores stay on this device. Open the game while signed in to join the club, see other players and challenge them.'))); return; }
    list.appendChild(el('div', 'panel info mute', lt('Loading the leaderboard…')));
    Cloud.publishStats();
    const tab = CLUB_TABS[this.clTab], field = clubField(tab);
    try {
      const asc = tab[0] === 'speedMs', rows = await Cloud.top(field, tab[0] === 'bestDaily', asc); await Mod.load();
      if (this.cur !== 'club') return;
      list.textContent = '';
      if (Cloud.readOnly) list.appendChild(el('div', 'panel info small', lt('This link is view-only: you can see the board, but your scores stay on this device. Ask the owner to invite you by email to join the board.')));
      if (asc) list.appendChild(el('div', 'panel info small', lt('Story speedrun: all 12 main stages in a row. Lowest time wins. Ranked on RONIN or harder.')));
      if (tab[2] === 'weekly') { const wi = weeklyInfo(); list.appendChild(el('div', 'panel info small', ltf('This week: {0} — {1}. Top 3 at the end of the week win 500 / 300 / 200 CR.', lt(wi.rule.name), lt(wi.rule.desc)))); }
      const shown = (rows || []).filter(r => (ii(r[field])) > 0 && !Mod.banned(r.id) && Mod.plausible(field, r[field]) && Mod.status(r.id, tab[2], r[field]) >= 0); // banned, impossible and failed-check scores stay off the board
      if (!shown.length) { list.appendChild(el('div', 'panel info', lt('No scores here yet. Finish a run in this mode to take the top spot.'))); return; }
      shown.forEach((r, i) => {
        const b = el('button', 'lb-row' + (r.me ? ' me' : ''));
        const ok = Mod.status(r.id, tab[2], r[field]) === 1;
        const tt = r.title && r.title !== 'rookie' ? titleOf(r.title) : null; b.style.borderColor = r.frame && r.frame !== 'none' ? frameOf(r.frame).c : '';
        b.appendChild(el('span', 'rk', '#' + (i + 1))); b.appendChild(el('span', 'nm', r.name + (r.me ? ' ' + lt('(YOU)') : '') + (ok ? ' ✓' : '') + (tt ? ' · ' + lt(tt.n) : ''))); b.appendChild(el('span', 'sc', asc ? fmtMs(ii(r[field])) : fmtNum(ii(r[field]))));
        if (ok) b.title = lt('Verified: the replay reproduces this score exactly.');
        b.onclick = () => { Aud.sfx('ui'); this.renderProfile(r, tab); };
        list.appendChild(b);
      });
    } catch (e) {
      if (this.cur !== 'club') return;
      list.textContent = ''; list.appendChild(el('div', 'panel info', lt('The leaderboard did not load. Check your connection and open the club again.')));
    }
  },
  renderClubTabs() {
    const box = $('clTabs'); box.style.gridTemplateColumns = 'repeat(3,1fr)'; box.textContent = '';
    CLUB_TABS.forEach((t, i) => { const b = el('button', i === this.clTab ? 'on' : '', lt(t[1])); b.onclick = () => { Aud.sfx('ui'); this.clTab = i; this.openClub(); }; box.appendChild(b); });
  },
  renderProfile(r, tab) {
    const box = $('clProf'), d = Store.data, field = clubField(tab); box.classList.remove('hidden'); box.textContent = '';
    box.appendChild(el('div', 'eyebrow', lt('PLAYER PROFILE')));
    const top = el('div', 'prof-top'); const ic = document.createElement('canvas'); ic.width = ic.height = 112; ic.className = 'ic';
    drawIcon(ic.getContext('2d'), { tab: 'heroes', id: r.skin && SKINS.some(s => s.id === r.skin) ? r.skin : 'cyan' }, 112); drawFrame(ic.getContext('2d'), FRAMES.some(f => f.id === r.frame) ? r.frame : 'none', 112); top.appendChild(ic);
    const nb = el('div'); nb.appendChild(el('h2', '', r.name)); if (r.title && TITLES.some(t => t.id === r.title)) nb.appendChild(el('div', 'gold small', lt(titleOf(r.title).n))); top.appendChild(nb); box.appendChild(top);
    box.appendChild(el('div', 'small mute', ltf('Story chapter {0}/5 · ★ {1} · max combo x{2} · {3} perfect parries · {4} kills', r.chapter | 0, r.stars | 0, r.combo | 0, fmtNum(r.parries | 0), fmtNum(r.kills | 0))));
    const vs = el('div', 'vs'); vs.style.marginTop = '10px';
    const wk = 'wk' + weekKey();
    const mine = { bestStd: d.best.endless, bestTa: d.best.timeattack, bestBr: d.best.bossrush, bestAr: d.best.arena, bestHw: d.best.highway, bestTw: d.best.tower | 0, bestDaily: d.best.dailyDate === todayKey() ? d.best.daily : 0, stars: Store.stars(), combo: d.stats.maxCombo };
    mine[wk] = ii(d.weekly.scores[weekKey()]);
    vs.appendChild(el('div', 'l small mute', lt('YOU'))); vs.appendChild(el('div', 'm', lt('HEAD TO HEAD'))); vs.appendChild(el('div', 'small mute', r.me ? lt('YOU') : r.name.toUpperCase()));
    [['bestStd', 'MAGLEV'], ['bestTa', 'TIME ATTACK'], ['bestBr', 'BOSS RUSH'], ['bestAr', 'BOSS ARENA'], ['bestHw', 'HIGHWAY'], ['bestTw', 'NEON TOWER'], ['bestDaily', 'DAILY'], [wk, 'WEEKLY'], ['stars', 'STARS'], ['combo', 'MAX COMBO']].forEach(([k, n]) => {
      const a = ii(mine[k]), b = (k === 'bestDaily' && r.dailyDate !== todayKey()) ? 0 : ii(r[k]);
      vs.appendChild(el('div', 'l' + (a > b ? ' win' : ''), fmtNum(a))); vs.appendChild(el('div', 'm', lt(n))); vs.appendChild(el('div', b > a ? 'win' : '', fmtNum(b)));
    });
    box.appendChild(vs);
    if (tab[2] !== 'speed') { // watch their best run (re-simulated from the recorded actions)
      const w = el('button', 'btn', lt('WATCH THIS RUN')); w.style.marginTop = '12px'; w.disabled = true; box.appendChild(w);
      const note = el('div', 'small mute', lt('Looking for the replay…')); box.appendChild(note);
      Replays.fetch(r.id, tab[2]).then(rep => {
        const h = rep && rep.hdr, fresh = h && (tab[2] !== 'daily' || h.dk === todayKey()) && (tab[2] !== 'weekly' || h.wk === weekKey());
        if (!rep || !fresh) { note.textContent = lt('No replay saved for this run.'); return; }
        if (!Replays.usable(rep)) { note.textContent = lt('This replay was recorded on an older version of the game.'); return; }
        w.disabled = false; note.textContent = ltf('Replay of {0} points.', fmtNum(ii(h.sc))) + (Mod.status(r.id, tab[2], r[field]) === 1 ? ' ' + lt('Verified ✓') : '');
        w.onclick = () => { Aud.sfx('ui'); Replays.watch(rep, r.name, () => this.openClub()); };
      });
    }
    if (!r.me && tab[2] !== 'speed') {
      const target = tab[0] === 'bestDaily' && r.dailyDate !== todayKey() ? 0 : ii(r[field]);
      const c = el('button', 'btn pri', ltf('CHALLENGE {0}', r.name.toUpperCase())); c.style.marginTop = '12px';
      if (!target) c.disabled = true;
      c.onclick = async () => {
        d.chal = { n: r.name, s: target, m: tab[2], id: r.id }; d.mode = tab[2]; Store.touch(); Store.flush(); Aud.sfx('buy');
        c.textContent = ltf('TARGET SET: {0} IN {1}', fmtNum(target), lt(tab[1])); c.disabled = true;
        const go = el('button', 'btn gold', ltf('PLAY {0} NOW', lt(tab[1]))); go.style.marginTop = '8px'; go.onclick = () => Flow.startArcade(tab[2]); box.appendChild(go);
        const note = el('div', 'small mute', lt('Looking for their ghost…')); box.appendChild(note);
        const ok = await Ghost.fetch(r.id, tab[2], r.name); note.textContent = ok ? lt('Ghost found: race their best run, live on the roof.') : lt('No ghost saved for this run yet. Their score is still your live target.');
      };
      box.appendChild(c);
      box.appendChild(el('div', 'small mute', lt('Their score appears live on your HUD in that mode. Beat it for +200 CR.')));
    }
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  /* ---------------- perk cards ---------------- */
  rollPerks() {
    const pool = PERKS.filter(p => (P.perks[p.id] | 0) < p.max && !(p.id === 'charge' && P.maxCh >= 6) && !(p.id === 'reflex' && G.ctr && G.ctr.noparry));
    const out = [];
    for (const s of SYNERGIES) if (!P.perks[s.id] && P.perks[s.need[0]] && P.perks[s.need[1]]) { out.push(s); break; } // owning both parents guarantees the evolved card
    for (let k = out.length; k < 3 && pool.length; k++) {
      let tot = 0; for (const p of pool) tot += RARITY[p.r].w;
      let r = R.f() * tot, pick = pool[0];
      for (const p of pool) { r -= RARITY[p.r].w; if (r <= 0) { pick = p; break; } }
      out.push(pick); pool.splice(pool.indexOf(pick), 1);
    }
    return out;
  },
  openPerk(cb) {
    this.show('perk'); this.perkCb = cb; this.renderPerks(G.perkRelic ? Tower.rollRelics() : this.rollPerks()); $('pkTitle').textContent = lt(G.perkRelic ? 'CHOOSE A RELIC' : 'CHOOSE AN UPGRADE');
    $('pkEyebrow').textContent = G.mode === 'tower' ? (G.perkRelic ? ltf('FLOOR {0} CLEARED · CHOOSE A RELIC', Tower.floor) : ltf('FLOOR {0} CLEARED', Tower.floor)) : G.mode === 'bossrush' || G.mode === 'arena' ? ltf('BOSS {0} DOWN', G.bossIdx) : ltf('CAR {0} CLEARED', G.seqCar);
    const rr = $('pkReroll'); rr.disabled = Store.data.credits < 100; rr.classList.toggle('hidden', !!G.perkRelic);
    rr.onclick = () => { if (Store.data.credits < 100) { Aud.sfx('deny'); return; } REC.act(RA.REROLL); Store.data.credits -= 100; Store.touch(); Aud.sfx('buy'); this.renderPerks(this.rollPerks()); rr.disabled = Store.data.credits < 100; };
  },
  renderPerks(list) {
    const box = $('pkList'); box.textContent = ''; Stats.offer(list);
    const pn = id => lt((PERKS.find(q => q.id === id) || { name: id }).name);
    for (const p of list) {
      const syn = !!p.need, R0 = p.relic ? { n: 'RELIC', c: p.c } : syn ? { n: 'SYNERGY', c: '#ff2bd6' } : RARITY[p.r], b = el('button', 'perk' + (syn ? ' syn' : '')); b.style.borderColor = R0.c;
      const rar = el('span', 'rar', lt(R0.n)); rar.style.color = R0.c; b.appendChild(rar);
      b.appendChild(el('span', 'lv', p.relic ? '' : syn ? pn(p.need[0]) + ' + ' + pn(p.need[1]) : p.max > 1 && p.max < 99 ? ltf('LV {0}/{1}', P.perks[p.id] | 0, p.max) : ''));
      b.appendChild(el('span', 'nm', lt(p.name))); b.appendChild(el('span', 'ds', lt(p.desc)));
      if (!syn && !p.relic) { const s = SYNERGIES.find(q => !P.perks[q.id] && q.need.indexOf(p.id) >= 0 && P.perks[q.need[0] === p.id ? q.need[1] : q.need[0]]); if (s) b.appendChild(el('span', 'syn-tag', ltf('COMPLETES SYNERGY: {0}', lt(s.name)))); }
      b.onclick = () => { if (G.state !== 'PERK') return; Stats.pick(p.id); REC.act(RA.PERK, PERK_ALL().indexOf(p.id)); applyPerk(p.id); Aud.sfx('buy'); const cb = this.perkCb; this.perkCb = null; G.state = 'PLAY'; this.show(null); if (cb) cb(); if (syn) toast(ltf('SYNERGY ONLINE: {0}', lt(p.name)), '#ff2bd6'); };
      box.appendChild(b);
    }
  },
  /* ---------------- results ---------------- */
  openResult(o) {
    this.show('result'); this.backFn = null;
    $('rsEyebrow').textContent = o.eyebrow; $('rsTitle').textContent = o.title; $('rsTitle').style.color = o.col || '';
    const st = $('rsStars'); st.textContent = ''; st.classList.toggle('hidden', !o.stars);
    if (o.stars) o.stars.forEach((on, i) => { const s = el('span', on ? 'on' : '', '★'); s.style.animationDelay = (.25 + i * .28) + 's'; st.appendChild(s); if (on) setTimeout(() => Aud.sfx('star', i), 250 + i * 280); });
    $('rsBest').classList.toggle('hidden', !o.best);
    const box = $('rsStats'); box.textContent = '';
    for (const [k, v] of o.stats) { const d = el('div', '', k); d.appendChild(el('b', '', v)); box.appendChild(d); }
    const notes = $('rsNotes'); notes.textContent = ''; notes.classList.toggle('hidden', !o.notes.length);
    for (const n of o.notes) notes.appendChild(el('div', n.c || '', n.t));
    const m = $('rsMain'), a = $('rsAlt'), mn = $('rsMenu');
    m.textContent = o.main[0]; m.onclick = () => { Aud.sfx('ui'); o.main[1](); };
    a.textContent = o.alt[0]; a.onclick = () => { Aud.sfx('ui'); o.alt[1](); };
    mn.onclick = () => { Aud.sfx('back'); Flow.quit(); };
    const sh = $('rsShare'); sh.classList.toggle('hidden', !o.share);
    sh.onclick = () => { Aud.sfx('ui'); this.openShare(o.share, () => this.show('result')); };
    $('rsReport').onclick = () => { Aud.sfx('ui'); this.openReport(() => this.show('result')); };
    const rx = $('rsExtra'), rep = o.replay; rx.classList.toggle('hidden', !rep);
    if (rep) {
      const back = () => this.openResult(o);
      $('rsWatch').onclick = () => { Aud.sfx('ui'); Replays.watch(rep, lt('YOUR RUN'), back); };
      const cb = $('rsClip'); cb.classList.toggle('hidden', !Replays.clipOk()); cb.onclick = () => { Aud.sfx('ui'); this.openClipPick(rep, back); };
    }
    Coach.attach(o.coach || null);
  }
});
function applyPerk(id) {
  P.perks[id] = (P.perks[id] | 0) + 1; if (RELIC_BY_ID[id]) { Tower.applyRelic(id); return; }
  switch (id) {
    case 'edge': P.dmgMul *= 1.2; break;
    case 'patch': P.hp = Math.min(P.maxHp, P.hp + 2); break;
    case 'coolant': P.heatMul *= .75; break;
    case 'cap': G.od = Math.min(100, G.od + 40); P.odMul *= 1.25; break;
    case 'reflex': P.pwMax += .05; break;
    case 'charge': P.maxCh++; P.ch++; break;
    case 'critchip': P.critAdd += .12; break;
    case 'long': P.reach += .4; break;
  }
}
