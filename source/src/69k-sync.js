/* =====================================================================
   TWO-DEVICE SAVES — when this device and the cloud both changed since
   they last synced (two phones, or a guest save meeting an account),
   nothing is overwritten: the player picks this device, the cloud, or
   a merge that keeps the best of both.
   ===================================================================== */
function mergeSaves(a, b) { // a = this device, b = the cloud; numbers keep the higher value, sets are joined
  const keepA = { user: 1, settings: 1, bounties: 1, chal: 1, contracts: 1, weapon: 1, weapon2: 1, skin: 1, blade: 1, mode: 1, diff: 1, title: 1, frame: 1, seenVer: 1, syncTs: 1, nem: 1 };
  const walk = (x, y) => {
    if (y === undefined) return x; if (x === undefined) return y;
    if (typeof x === 'number' && typeof y === 'number') return Math.max(x, y);
    if (x && y && typeof x === 'object' && typeof y === 'object' && !Array.isArray(x) && !Array.isArray(y)) {
      const o = {}; for (const k of new Set(Object.keys(x).concat(Object.keys(y)))) o[k] = walk(x[k], y[k]); return o;
    }
    return x; // strings, arrays, mixed types: this device's
  };
  const o = {}; for (const k of new Set(Object.keys(a).concat(Object.keys(b)))) o[k] = keepA[k] ? (a[k] !== undefined ? a[k] : b[k]) : walk(a[k], b[k]);
  // fields where "higher" is wrong
  const ba = a.best || {}, bb = b.best || {}; if ((ba.dailyDate | 0) !== (bb.dailyDate | 0)) { const n = (ba.dailyDate | 0) > (bb.dailyDate | 0) ? ba : bb; o.best.dailyDate = n.dailyDate | 0; o.best.daily = n.daily | 0; }
  const sa = a.speed || {}, sb = b.speed || {}; o.speed = ((sa.best | 0) && (!(sb.best | 0) || (sa.best | 0) <= (sb.best | 0))) ? JSON.parse(JSON.stringify(sa)) : JSON.parse(JSON.stringify(sb)); o.speed.runs = Math.max(sa.runs | 0, sb.runs | 0);
  const ea = a.season || {}, eb = b.season || {}; if ((ea.id | 0) !== (eb.id | 0)) o.season = JSON.parse(JSON.stringify((ea.id | 0) > (eb.id | 0) ? ea : eb)); // a different month: the newer season
  else if ((ea.wk | 0) !== (eb.wk | 0)) { const n = (ea.wk | 0) > (eb.wk | 0) ? ea : eb; o.season.wk = n.wk; o.season.mp = JSON.parse(JSON.stringify(n.mp || {})); o.season.md = JSON.parse(JSON.stringify(n.md || {})); }
  { const la = Array.isArray(a.levels) ? a.levels : [], lb = Array.isArray(b.levels) ? b.levels : [], seen = {}, L = []; // custom levels: both devices' levels, by id
    for (const lv of la.concat(lb)) if (lv && lv.id && !seen[lv.id] && L.length < 12) { seen[lv.id] = 1; L.push(lv); } o.levels = L; }
  { const ta = a.tower, tb = b.tower; if (ta && tb) { const n = tsn(a.ts) >= tsn(b.ts) ? ta : tb; o.tower.sh = n.sh | 0; } } // spent shards must stay spent: the newer save's count
  { const wa = a.wtree || {}, wb = b.wtree || {}, W = {}; for (const k of new Set(Object.keys(wa).concat(Object.keys(wb)))) { const x = Array.isArray(wa[k]) ? wa[k] : [], y = Array.isArray(wb[k]) ? wb[k] : []; W[k] = [0, 1, 2].map(i => Math.max(x[i] | 0, y[i] | 0)); } o.wtree = W; } // weapon trees: the higher level of each path
  { const ea = a.evt || {}, eb = b.evt || {}, newer = tsn(a.ts) >= tsn(b.ts) ? ea : eb; if (o.evt) for (const k in o.evt) if (newer[k]) o.evt[k].cur = newer[k].cur | 0; } // spent event currency stays spent
  o.ts = Math.max(tsn(a.ts), tsn(b.ts)); o.v = 9;
  return o;
}
function saveSummary(d) {
  const st = (d.story && d.story.stars) || {}; let stars = 0; for (const k in st) stars += st[k] | 0;
  const un = STAGES[Math.min(STAGES.length - 1, (d.story && d.story.unlocked) | 0)];
  let items = 0; for (const k of ['owned', 'skins', 'blades']) items += Object.keys(d[k] || {}).length;
  return [[lt('CREDITS'), fmtNum(d.credits | 0)], [lt('STORY'), ltf('STAGE {0}', un ? un.id : '1-1') + ' · ' + stars + ' ★'], [lt('BEST MAGLEV'), fmtNum(ii(d.best && d.best.endless))],
    [lt('RUNS'), fmtNum((d.stats && d.stats.runs) | 0)], [lt('GEAR'), ltf('{0} items', items)], [lt('LAST PLAYED'), agoText(tsn(d.ts))]];
}
function agoText(ts) {
  if (!ts) return '—'; const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  return m < 1 ? lt('just now') : m < 60 ? ltf('{0} min ago', m) : m < 1440 ? ltf('{0} h ago', Math.round(m / 60)) : ltf('{0} days ago', Math.round(m / 1440));
}
Object.assign(UI, {
  syncConflict() { if (!Cloud.conflict) return; if (G.state === 'MENU' && this.cur && this.cur !== 'boot') this.openSync(); }, // otherwise the title screen opens it
  openSync() {
    const cf = Cloud.conflict; if (!cf) return;
    G.state = 'MENU'; this.backFn = null; this.show('sync');
    const box = $('syBox'); box.textContent = '';
    const card = (title, d, hint) => {
      const p = el('div', 'panel'); p.appendChild(el('div', 'eyebrow', title)); p.appendChild(el('div', 'small mute', hint));
      for (const [k, v] of saveSummary(d)) { const r = el('div', 'bty'); r.appendChild(el('span', 'small', k)); r.appendChild(el('span', 'gold small', v)); p.appendChild(r); }
      return p;
    };
    box.appendChild(card(lt('THIS DEVICE'), Store.data, lt('Progress saved on this phone or computer.')));
    box.appendChild(card(lt('CLOUD SAVE'), cf.d, lt('Progress from your other device.')));
    const go = (how) => this.resolveSync(how);
    const m = el('button', 'btn gold', lt('MERGE: KEEP THE BEST OF BOTH')); m.onclick = () => go('merge'); box.appendChild(m);
    box.appendChild(el('div', 'small mute', lt('Merge keeps every item, star and record from both saves, and the higher credits.')));
    const g2 = el('div', 'grid2'), a = el('button', 'btn', lt('KEEP THIS DEVICE')), c = el('button', 'btn', lt('USE THE CLOUD SAVE'));
    a.onclick = () => go('local'); c.onclick = () => go('cloud'); g2.appendChild(a); g2.appendChild(c); box.appendChild(g2);
  },
  resolveSync(how) {
    const cf = Cloud.conflict; if (!cf) return; Aud.sfx('buy');
    const keepUser = Store.data.user, keepSettings = Store.data.settings;
    if (how === 'cloud') Store.data = Store.merge(Store.def(), cf.d);
    else if (how === 'merge') Store.data = Store.merge(Store.def(), mergeSaves(JSON.parse(JSON.stringify(Store.data)), cf.d));
    Store.data.user = keepUser; Store.data.settings = keepSettings; Store.data.syncTs = cf.ts;
    Cloud.conflict = null; Store.sanitize(); Store.touch(); Store.flush(true);
    toastDom(how === 'merge' ? lt('SAVES MERGED') : how === 'cloud' ? lt('CLOUD SAVE LOADED') : lt('THIS DEVICE KEPT'));
    applyLang(); this.openTitle(); Cloud.afterReady();
  }
});
