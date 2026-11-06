/* =====================================================================
   INSIGHTS — balance from real play data. Every player's stats doc
   (only when they allow sharing in Settings) now also counts, without
   anything personal: which weapon each run used and how it ended, every
   boss fight (fights, wins, deaths, fight time), which perks and relics
   were offered and which were picked, how high Tower climbs got and what
   ended arcade runs. The creator dashboard's INSIGHTS tab adds it all up
   and flags what looks too hard, too easy or ignored.
   ===================================================================== */
Object.assign(Stats, {
  bt: {},
  x() { const a = this.agg(); a.w = a.w || {}; a.bs = a.bs || {}; a.pk = a.pk || {}; a.po = a.po || {}; a.tf = a.tf || {}; a.dc = a.dc || {}; return a; },
  run(out) { // out: w(on) l(ost) q(uit); called once per run from bankStats
    if (REPLAY.on || G.mode === 'dojo' || G.mode === 'puzzle' || G.mode === 'custom' || !P.w) return; const a = this.x();
    const w = a.w[P.w.id] || (a.w[P.w.id] = { r: 0, w: 0, l: 0, t: 0 }); w.r++; w[out === 'w' ? 'w' : out === 'l' ? 'l' : 'r'] += out === 'q' ? 0 : 1; w.t += Math.round(G.time || 0);
    if (G.mode === 'tower' && out !== 'q') { const f = Math.min(30, Tower.floor | 0); a.tf[f] = (a.tf[f] | 0) + 1; }
    if (out === 'l' && G.mode !== 'story') { const m = a.dc[G.mode] || (a.dc[G.mode] = {}), c = (G.lastHit || 'unknown') + (EDEF[G.lastWho] ? ':' + EDEF[G.lastWho].id : ''); m[c] = (m[c] | 0) + 1; }
    if (out === 'l' && Boss.cur) this.boss(Boss.cur.id, 'd');
    this.push();
  },
  boss(id, k) {
    if (REPLAY.on || G.mode === 'custom') return; const a = this.x(), b = a.bs[id] || (a.bs[id] = { f: 0, w: 0, d: 0, t: 0 });
    if (k === 'f') { b.f++; this.bt[id] = G.time; } else if (k === 'w') { b.w++; b.t += Math.round(G.time - (this.bt[id] != null ? this.bt[id] : G.time)); } else if (k === 'd') b.d++;
    Store.touch();
  },
  offer(list) { if (REPLAY.on) return; const a = this.x(); for (const p of list) a.po[p.id] = (a.po[p.id] | 0) + 1; },
  pick(id) { if (REPLAY.on) return; const a = this.x(); a.pk[id] = (a.pk[id] | 0) + 1; }
});
Object.assign(UI, {
  async renderInsights(box) {
    const rows = await Dash.load('stats'); if (this.cur !== 'dash') return; box.textContent = '';
    if (!rows) { box.appendChild(el('div', 'panel info', lt('Could not load. The dashboard only works for the game owner, signed in.'))); return; }
    const W = {}, B = {}, PK = {}, PO = {}, TF = {}, DC = {}; let players = 0;
    const add = (dst, src, keys) => { for (const k of keys) dst[k] = (dst[k] | 0) + (src[k] | 0); };
    for (const r of rows) {
      players++;
      for (const id in (r.w || {})) add(W[id] || (W[id] = {}), r.w[id], ['r', 'w', 'l', 't']);
      for (const id in (r.bs || {})) add(B[id] || (B[id] = {}), r.bs[id], ['f', 'w', 'd', 't']);
      add(PK, r.pk || {}, Object.keys(r.pk || {})); add(PO, r.po || {}, Object.keys(r.po || {})); add(TF, r.tf || {}, Object.keys(r.tf || {}));
      for (const m in (r.dc || {})) add(DC[m] || (DC[m] = {}), r.dc[m], Object.keys(r.dc[m]));
    }
    const flags = [], sec = t => box.appendChild(el('div', 'eyebrow', lt(t))), line = (a, b, cls) => { const r = el('div', 'bty'); r.appendChild(el('span', '', a)); r.appendChild(el('span', cls || 'mute', b)); box.appendChild(r); };
    // weapons
    const runs = Object.values(W).reduce((s, o) => s + (o.r | 0), 0);
    for (const w of WEAPONS) { const o = W[w.id]; if (!o) continue; const sh = o.r / Math.max(1, runs), wr = o.w / Math.max(1, o.w + o.l); if (runs >= 30 && sh < .04) flags.push([1, ltf('{0} is rarely used ({1}% of runs).', lt(w.name), Math.round(sh * 100))]); if (o.w + o.l >= 15 && wr < .25) flags.push([2, ltf('{0} wins only {1}% of its runs: buff it?', lt(w.name), Math.round(wr * 100))]); }
    // bosses
    for (const id of Object.keys(BOSS_CODE)) { const o = B[id]; if (!o || o.f < 5) continue; const wr = o.w / o.f, t = o.w ? o.t / o.w : 0, nm = lt((BOSS_INFO[id] || {}).name || id);
      if (wr < .35) flags.push([3, ltf('{0}: only {1}% of fights are won. Too hard?', nm, Math.round(wr * 100))]); else if (wr > .9 && t && t < 40) flags.push([1, ltf('{0}: {1}% wins in {2}s on average. Too easy?', nm, Math.round(wr * 100), Math.round(t))]); }
    // perks and relics
    for (const p of PERKS.concat(RELICS)) { const o = PO[p.id] | 0, k = PK[p.id] | 0; if (o >= 20 && k / o < .12) flags.push([1, ltf('{0} is picked in only {1}% of the drafts it shows up in.', lt(p.name), Math.round(k / o * 100))]); }
    box.appendChild(el('div', 'panel small', ltf('{0} players shared data · {1} runs with a recorded weapon', players, runs)));
    sec('WHAT TO LOOK AT');
    if (!flags.length) box.appendChild(el('div', 'small mute', lt('Nothing stands out yet. Flags appear once enough people have played.')));
    flags.sort((a, b) => b[0] - a[0]); for (const f of flags.slice(0, 14)) box.appendChild(el('div', 'panel small ' + (f[0] >= 3 ? 'gold' : ''), (f[0] >= 3 ? '⚠ ' : '• ') + f[1]));
    sec('WEAPONS');
    for (const w of WEAPONS) { const o = W[w.id]; if (!o) continue; line(lt(w.name), ltf('{0}% of runs · {1}% won · {2}s per run', Math.round(o.r / Math.max(1, runs) * 100), Math.round(o.w / Math.max(1, o.w + o.l) * 100), Math.round(o.t / Math.max(1, o.r)))); }
    sec('BOSSES');
    for (const id of Object.keys(BOSS_CODE)) { const o = B[id]; if (!o) continue; line(lt((BOSS_INFO[id] || {}).name || id), ltf('{0} fights · {1}% won · {2} deaths · {3}s to win', o.f, Math.round(o.w / Math.max(1, o.f) * 100), o.d, o.w ? Math.round(o.t / o.w) : '—'), o.f >= 5 && o.w / o.f < .35 ? 'gold' : 'mute'); }
    sec('PERKS AND RELICS');
    for (const p of PERKS.concat(SYNERGIES, RELICS)) { const o = PO[p.id] | 0, k = PK[p.id] | 0; if (!o && !k) continue; line(lt(p.name), ltf('offered {0} · picked {1} ({2}%)', o, k, o ? Math.round(k / o * 100) : 0)); }
    const tfk = Object.keys(TF).map(Number).sort((a, b) => a - b);
    if (tfk.length) { sec('NEON TOWER: WHERE CLIMBS END'); const mx = Math.max(...tfk.map(f => TF[f])); for (const f of tfk) { const r = el('div', 'bty'); r.appendChild(el('span', '', ltf('FLOOR {0}', f))); const bar = el('span', 'funnel'), i = el('i'); i.style.width = Math.round(TF[f] / mx * 100) + '%'; bar.appendChild(i); r.appendChild(bar); r.appendChild(el('span', 'mute', '' + TF[f])); box.appendChild(r); } }
    const dm = Object.keys(DC); if (dm.length) { sec('WHAT ENDS ARCADE RUNS'); for (const m of dm) { const top = Object.entries(DC[m]).sort((a, b) => b[1] - a[1]).slice(0, 3); line(lt((MODES.find(q => q.id === m) || { name: m }).name), top.map(t => t[0] + ' ×' + t[1]).join(' · ')); } }
  }
});
