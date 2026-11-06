/* =====================================================================
   LEVEL EDITOR — build your own rooftop: up to 6 waves of hand-placed
   enemies, a theme, roof props, shields and an optional boss finale.
   Test it, save it (12 slots) and share it as a code anyone can paste
   in to play. Positions are stored 0..1 across the arena, so a level
   plays the same on every screen size. Custom levels are not ranked.
   ===================================================================== */
const ED_THEMES = ['maglev', 'undercity', 'ghost', 'spire', 'storm', 'orbital', 'datavoid', 'apex', 'sakura', 'abyss', 'skyroad', 'starring', 'ruins', 'origin', 'parade', 'hollow', 'dojo'];
const ED_TYPES = ['drone', 'sniper', 'brute', 'bomber', 'weaver', 'phantom', 'splitter', 'warden', 'medic', 'mimic', 'miner', 'mirror', 'enforcer', 'spider', 'wraith'];
const ED_MAXW = 6, ED_MAXE = 14, ED_MAXL = 12;
const ED_SAMPLES = [
  { id: 's1', n: 'CROSSFIRE', th: 'spire', hp: 3, tr: 1, br: 1, po: 0, boss: '', w: [
    [['sniper', .1, .1, 0], ['sniper', .9, .1, 0], ['drone', .5, .2, 0], ['drone', .3, .3, 0], ['drone', .7, .3, 0]],
    [['brute', .5, .1, 0], ['bomber', .2, .2, 0], ['bomber', .8, .2, 0], ['weaver', .1, .5, 0], ['weaver', .9, .5, 0]],
    [['warden', .5, .15, 1], ['sniper', .15, .1, 0], ['sniper', .85, .1, 0], ['splitter', .3, .35, 0], ['splitter', .7, .35, 0], ['medic', .5, .05, 0]]] },
  { id: 's2', n: 'GHOST HUNT', th: 'ghost', hp: 2, tr: 0, br: 2, po: 1, boss: 'kage', w: [
    [['phantom', .2, .2, 0], ['phantom', .8, .2, 0], ['phantom', .5, .35, 0]],
    [['mirror', .5, .15, 0], ['phantom', .15, .45, 1], ['phantom', .85, .45, 1], ['mimic', .5, .05, 0]]] }
];
function edEnc(lv) { // a compact share code: OD1. + base64url(JSON)
  const o = { n: lv.n, th: lv.th, hp: lv.hp, tr: lv.tr, br: lv.br, po: lv.po, boss: lv.boss, w: lv.w.map(w => w.map(e => [ED_TYPES.indexOf(e[0]), Math.round(e[1] * 100), Math.round(e[2] * 100), e[3] ? 1 : 0])) };
  const b = new TextEncoder().encode(JSON.stringify(o)); let s = ''; for (const c of b) s += String.fromCharCode(c);
  return 'OD1.' + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function edDec(code) { // never trusts the code: everything is clamped and checked
  try {
    const m = /OD1\.([A-Za-z0-9_+\/=-]+)/.exec(String(code || '').trim()); if (!m) return null;
    let s = m[1].replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    const bin = atob(s), b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    const o = JSON.parse(new TextDecoder().decode(b)); if (!o || !Array.isArray(o.w)) return null;
    const lv = edNew(); lv.n = String(o.n || 'CUSTOM').replace(/[<>]/g, '').slice(0, 18).toUpperCase() || 'CUSTOM';
    lv.th = ED_THEMES.indexOf(o.th) >= 0 ? o.th : 'maglev'; lv.hp = clamp(o.hp | 0, 1, 5); lv.tr = clamp(o.tr | 0, 0, 2); lv.br = o.br ? 1 : 0; lv.po = o.po ? 1 : 0;
    lv.boss = BOSS_CODE[o.boss] ? o.boss : '';
    lv.w = o.w.slice(0, ED_MAXW).map(w => (Array.isArray(w) ? w : []).slice(0, ED_MAXE).map(e => [ED_TYPES[e[0] | 0] || 'drone', clamp((+e[1] || 0) / 100, 0, 1), clamp((+e[2] || 0) / 100, 0, 1), e[3] ? 1 : 0])).filter(w => w.length);
    if (!lv.w.length && !lv.boss) return null; lv.imp = 1; return lv;
  } catch (e) { return null; }
}
function edNew() { return { id: (Date.now()).toString(36), n: 'MY ROOFTOP', th: 'maglev', hp: 3, tr: 0, br: 0, po: 0, boss: '', w: [[]] }; }
function edLevels() { const d = Store.data; if (!Array.isArray(d.levels)) d.levels = []; return d.levels; }
/* ---------------- playing a custom level ---------------- */
const Custom = {
  lv: null, wi: 0, done: false, from: null,
  play(lv, from) {
    this.lv = JSON.parse(JSON.stringify(lv)); this.from = from || null; Aud.init(); Flow.last = { mode: 'custom' }; Flow.endT = 0; Flow.sr = null;
    Director.begin('custom', null); REC.on = false; Flow.enterPlay();
    G.cine = { k: 'car', t: 0, d: 2.3, l2: this.lv.n, l3: lt('CUSTOM LEVEL') };
  },
  begin() { // from Director.begin
    const lv = this.lv, D = Director; this.wi = 0; this.done = false;
    BG.set(lv.th); D.setPool({}); D.max = 0; D.rate = 99; D.evOn = false; D.elite = 0;
    Arena.setup({ turrets: lv.tr, portals: lv.po, barrels: lv.br }, null);
    P.maxHp = lv.hp; P.hp = lv.hp;
  },
  waves() { return this.lv.w.filter(w => w.length).length + (this.lv.boss ? 1 : 0); },
  update() {
    if (G.freeze > 0 || G.won || G.state !== 'PLAY' || this.done) return;
    const D = Director; if (D.q.length || D.liveHostiles() > 0 || Boss.cur || D.bossPending) return;
    const ws = this.lv.w.filter(w => w.length);
    if (this.wi < ws.length) {
      const w = ws[this.wi++], L = V.L + 30, W = V.R - V.L - 60, top = 60, H = V.VH - 220;
      w.forEach((e, i) => { const t = ENAME2T[e[0]]; if (t == null) return; let x = L + e[1] * W, y = top + e[2] * H; if (dist(x, y, P.x, P.y) < 90) y = P.y > V.VH * .5 ? top : V.VH - 160; D.q.push({ t: .25 + i * .12, type: t, x, y, el: e[3] ? 1 : 0 }); });
      FX.call(ltf('WAVE {0}/{1}', this.wi, this.waves()), '#ff3b5c', 2, 20); Aud.sfx('warn'); return;
    }
    if (this.lv.boss && this.wi === ws.length) { this.wi++; D.bossPending = this.lv.boss; D.bossLvl = 1; FX.call(ltf('WAVE {0}/{1}', this.wi, this.waves()), '#ff3b5c', 2, 20); return; }
    this.done = true; G.won = true; Flow.over(true); if (G.cine) G.cine.txt = lt('LEVEL CLEAR');
  },
  end(win) {
    const lv = this.lv, back = () => { this.from ? this.from() : Editor.open(); };
    const notes = [{ t: lt('Custom levels are not ranked and give no credits.'), c: 'mute' }];
    if (win) bounty('custom', 1);
    if (win && lv.id) { const own = edLevels().find(q => q.id === lv.id); if (own) { own.won = 1; Store.touch(); } }
    UI.openResult({
      eyebrow: lt('CUSTOM LEVEL') + ' · ' + lv.n, title: win ? lt('LEVEL CLEAR') : lt('FAILED'), col: win ? '#00ff88' : '#ff0844', stars: null, best: false,
      stats: [[lt('TIME'), fmtTime(G.time)], [lt('KILLS'), '' + G.kills], [lt('MAX COMBO'), 'x' + G.maxCombo], [lt('HITS TAKEN'), '' + G.hits]],
      notes, share: null,
      main: [lt('RETRY'), () => this.play(lv, this.from)],
      alt: [lt('LEVEL EDITOR'), () => { Flow.quit(); back(); }]
    });
  }
};
/* ---------------- the editor screens ---------------- */
const Editor = {
  lv: null, wave: 0, tool: 'drone', elite: 0, cv: null, g: null, k: 1, t: 0,
  open() { G.state = 'MENU'; UI.backFn = null; UI.show('editor'); this.renderList(); },
  renderList() {
    const box = $('edList'); box.textContent = ''; const L = edLevels();
    const row = (lv, own) => {
      const c = el('div', 'panel edrow'); c.appendChild(el('div', 'nm', lv.n + (lv.won ? ' ✓' : '')));
      c.appendChild(el('div', 'small mute', ltf('{0} waves · {1} enemies · {2}', lv.w.filter(w => w.length).length, lv.w.reduce((s, w) => s + w.length, 0), lt((THEMES[lv.th] || {}).name || lv.th)) + (lv.boss ? ' · ' + lt((BOSS_INFO[lv.boss] || {}).name || '') : '')));
      const bt = el('div', 'edbtns');
      const b1 = el('button', 'btn pri', lt('PLAY')); b1.onclick = () => { Aud.sfx('ui'); Custom.play(lv); }; bt.appendChild(b1);
      if (own) { const b2 = el('button', 'btn', lt('EDIT')); b2.onclick = () => { Aud.sfx('ui'); this.edit(lv); }; bt.appendChild(b2); }
      const b3 = el('button', 'btn', own ? lt('SHARE') : lt('COPY')); b3.onclick = () => { Aud.sfx('ui'); if (own) this.share(lv); else { const n = JSON.parse(JSON.stringify(lv)); n.id = (Date.now()).toString(36); n.imp = 0; if (L.length >= ED_MAXL) { toast(lt('ALL 12 SLOTS ARE FULL'), '#ff3b5c'); return; } L.push(n); Store.touch(); this.renderList(); toast(lt('SAVED TO YOUR LEVELS'), '#00ff88'); } }; bt.appendChild(b3);
      if (own) { const b4 = el('button', 'btn ghost', lt('DELETE')); b4.onclick = () => { if (b4.dataset.k) { L.splice(L.indexOf(lv), 1); Store.touch(); Aud.sfx('back'); this.renderList(); } else { b4.dataset.k = 1; b4.textContent = lt('SURE?'); } }; bt.appendChild(b4); }
      c.appendChild(bt); box.appendChild(c);
    };
    box.appendChild(el('div', 'eyebrow', ltf('YOUR LEVELS · {0}/{1}', L.length, ED_MAXL)));
    if (!L.length) box.appendChild(el('div', 'small mute', lt('No levels yet. Make one, or try a creator pick below.')));
    for (const lv of L) row(lv, true);
    box.appendChild(el('div', 'eyebrow', lt('CREATOR PICKS')));
    for (const s of ED_SAMPLES) { const lv = edDec(edEnc(s)); lv.id = ''; row(lv, false); }
    $('edNew').onclick = () => { Aud.sfx('ui'); if (L.length >= ED_MAXL) { toast(lt('ALL 12 SLOTS ARE FULL'), '#ff3b5c'); return; } const lv = edNew(); this.edit(lv, true); };
    $('edImp').onclick = () => { const lv = edDec($('edCode').value); if (!lv) { Aud.sfx('deny'); toast(lt('THAT CODE DOES NOT WORK'), '#ff3b5c'); return; } Aud.sfx('buy'); $('edCode').value = ''; this.imported = lv; this.renderImported(); };
    this.renderImported();
  },
  renderImported() {
    const box = $('edImpBox'); box.textContent = ''; const lv = this.imported; box.classList.toggle('hidden', !lv); if (!lv) return;
    box.appendChild(el('div', 'nm', lv.n)); box.appendChild(el('div', 'small mute', ltf('{0} waves · {1} enemies', lv.w.length, lv.w.reduce((s, w) => s + w.length, 0))));
    const bt = el('div', 'edbtns'), p = el('button', 'btn pri', lt('PLAY')), s = el('button', 'btn', lt('SAVE'));
    p.onclick = () => { Aud.sfx('ui'); Custom.play(lv); };
    s.onclick = () => { const L = edLevels(); if (L.length >= ED_MAXL) { toast(lt('ALL 12 SLOTS ARE FULL'), '#ff3b5c'); return; } lv.id = (Date.now()).toString(36); lv.imp = 0; L.push(lv); Store.touch(); this.imported = null; Aud.sfx('buy'); this.renderList(); };
    bt.appendChild(p); bt.appendChild(s); box.appendChild(bt);
  },
  share(lv) {
    const code = edEnc(lv); $('edCode').value = code; $('edCode').select && $('edCode').select();
    try { navigator.clipboard.writeText(code).then(() => toast(lt('CODE COPIED — SEND IT TO A FRIEND'), '#00ff88'), () => toast(lt('COPY THE CODE FROM THE BOX'), '#ffd700')); } catch (e) { toast(lt('COPY THE CODE FROM THE BOX'), '#ffd700'); }
  },
  /* ---- editing one level ---- */
  edit(lv, fresh) {
    this.lv = JSON.parse(JSON.stringify(lv)); this.fresh = !!fresh; this.wave = 0; UI.show('edit'); UI.backFn = () => { this.save(true); this.open(); };
    this.attach(); this.renderEdit();
  },
  attach() {
    const c = $('edCv'); if (!c) return; this.cv = c; const r = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(220, Math.round(r.width || 300));
    c.width = Math.round(w * dpr); c.height = Math.round(w * 1.25 * dpr); this.g = c.getContext('2d'); this.k = c.width / 300; this.cw = w;
    if (!this.bound) { this.bound = true; c.addEventListener('pointerdown', e => { e.preventDefault(); const b = c.getBoundingClientRect(); this.tap((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height); }); }
  },
  tap(nx, ny) {
    const w = this.lv.w[this.wave]; if (!w) return;
    const mx = (nx * 300 - 20) / 260, my = (ny * 375 - 20) / 335; if (mx < -.05 || mx > 1.05 || my < -.05 || my > 1.05) return;
    if (this.tool === 'erase') { let bi = -1, bd = .12; w.forEach((e, i) => { const dd = Math.hypot(e[1] - mx, (e[2] - my) * 1.3); if (dd < bd) { bd = dd; bi = i; } }); if (bi >= 0) { w.splice(bi, 1); Aud.sfx('back'); } this.renderEdit(); return; }
    if (w.length >= ED_MAXE) { Aud.sfx('deny'); toast(ltf('MAX {0} ENEMIES PER WAVE', ED_MAXE), '#ff3b5c'); return; }
    w.push([this.tool, clamp(mx, 0, 1), clamp(my, 0, 1), this.elite && !EDEF[ENAME2T[this.tool]].mb ? 1 : 0]); Aud.sfx('ui'); this.renderEdit();
  },
  renderEdit() {
    const lv = this.lv;
    $('edName').value = lv.n;
    $('edName').oninput = () => { lv.n = $('edName').value.replace(/[<>]/g, '').slice(0, 18).toUpperCase() || 'MY ROOFTOP'; };
    const wv = $('edWaves'); wv.textContent = '';
    lv.w.forEach((w, i) => { const b = el('button', i === this.wave ? 'on' : '', ltf('WAVE {0}', i + 1)); b.appendChild(el('i', '', '' + w.length)); b.onclick = () => { this.wave = i; Aud.sfx('ui'); this.renderEdit(); }; wv.appendChild(b); });
    if (lv.w.length < ED_MAXW) { const b = el('button', '', '+'); b.onclick = () => { lv.w.push([]); this.wave = lv.w.length - 1; Aud.sfx('ui'); this.renderEdit(); }; wv.appendChild(b); }
    if (lv.w.length > 1) { const b = el('button', '', '−'); b.title = lt('Delete this wave'); b.onclick = () => { lv.w.splice(this.wave, 1); this.wave = Math.max(0, this.wave - 1); Aud.sfx('back'); this.renderEdit(); }; wv.appendChild(b); }
    const pal = $('edPal'); pal.textContent = '';
    for (const id of ED_TYPES.concat(['erase'])) {
      const t = ENAME2T[id], d = EDEF[t], b = el('button', this.tool === id ? 'on' : '');
      const sw = el('span', 'sw'); sw.style.background = id === 'erase' ? 'transparent' : d.col; if (id === 'erase') sw.textContent = '✕'; b.appendChild(sw);
      b.appendChild(document.createTextNode(id === 'erase' ? lt('ERASE') : lt(d.name))); b.onclick = () => { this.tool = id; Aud.sfx('ui'); this.renderEdit(); }; pal.appendChild(b);
    }
    const opt = $('edOpt'); opt.textContent = '';
    const cyc = (label, val, fn) => { const b = el('button', ''); b.appendChild(document.createTextNode(label)); b.appendChild(el('i', '', val)); b.onclick = () => { fn(); Aud.sfx('ui'); this.renderEdit(); }; opt.appendChild(b); };
    cyc(lt('ELITE'), this.elite ? lt('ON') : lt('OFF'), () => { this.elite = this.elite ? 0 : 1; });
    cyc(lt('THEME'), lt((THEMES[lv.th] || {}).name || lv.th), () => { lv.th = ED_THEMES[(ED_THEMES.indexOf(lv.th) + 1) % ED_THEMES.length]; });
    cyc(lt('SHIELDS'), '' + lv.hp, () => { lv.hp = lv.hp % 5 + 1; });
    cyc(lt('TURRETS'), '' + lv.tr, () => { lv.tr = (lv.tr + 1) % 3; });
    cyc(lt('BARRELS'), lv.br ? lt('ON') : lt('OFF'), () => { lv.br = lv.br ? 0 : 1; });
    cyc(lt('PORTALS'), lv.po ? lt('ON') : lt('OFF'), () => { lv.po = lv.po ? 0 : 1; });
    const met = Object.keys(BOSS_CODE).filter(b => pcodex().bs[b]), bl = [''].concat(met);
    cyc(lt('FINAL BOSS'), lv.boss ? lt((BOSS_INFO[lv.boss] || {}).name || lv.boss) : lt('NONE'), () => { lv.boss = bl[(bl.indexOf(lv.boss) + 1) % bl.length]; if (bl.length === 1) toast(lt('MEET BOSSES IN THE STORY TO USE THEM HERE'), '#ffd700'); });
    $('edTest').onclick = () => { Aud.sfx('ui'); this.save(true); Custom.play(this.lv, () => this.edit(this.lv)); };
    $('edSave').onclick = () => { this.save(); Aud.sfx('buy'); toast(lt('LEVEL SAVED'), '#00ff88'); };
    $('edShare').onclick = () => { this.save(true); this.open(); this.share(this.lv); };
    this.draw();
  },
  save(quiet) {
    const L = edLevels(), lv = this.lv, i = L.findIndex(q => q.id === lv.id);
    if (!lv.w.some(w => w.length) && !lv.boss) { if (!quiet) toast(lt('PLACE AT LEAST ONE ENEMY'), '#ff3b5c'); return false; }
    if (i >= 0) L[i] = JSON.parse(JSON.stringify(lv)); else if (L.length < ED_MAXL) L.push(JSON.parse(JSON.stringify(lv))); Store.touch(); return true;
  },
  draw() {
    if (!this.g) return; withCtx(this.g, () => {
      cx.setTransform(this.k, 0, 0, this.k, 0, 0); const T = THEMES[this.lv.th] || THEMES.maglev;
      cx.fillStyle = T.roof || '#10121c'; cx.fillRect(0, 0, 300, 375); cx.strokeStyle = T.seam || 'rgba(255,255,255,.05)'; cx.lineWidth = 1;
      for (let x = 20; x <= 280; x += 26) { cx.beginPath(); cx.moveTo(x, 20); cx.lineTo(x, 355); cx.stroke(); } for (let y = 20; y <= 355; y += 26) { cx.beginPath(); cx.moveTo(20, y); cx.lineTo(280, y); cx.stroke(); }
      cx.strokeStyle = T.rail || '#00f2fe'; cx.lineWidth = 2; cx.strokeRect(14, 14, 272, 347);
      cx.fillStyle = 'rgba(0,242,254,.6)'; cx.beginPath(); cx.arc(150, 20 + .7 * 335, 8, 0, TAU); cx.fill(); cx.font = '700 8px ' + FONT_M; cx.textAlign = 'center'; cx.fillStyle = '#7df9ff'; cx.fillText(lt('YOU'), 150, 20 + .7 * 335 + 18);
      this.lv.w.forEach((w, wi) => {
        if (wi !== this.wave) cx.globalAlpha = .18; else cx.globalAlpha = 1;
        for (const e of w) { const d = EDEF[ENAME2T[e[0]]], x = 20 + e[1] * 260, y = 20 + e[2] * 335, r = d.mb ? 11 : 7;
          cx.fillStyle = d.col; cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill(); if (e[3]) { cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y, r + 3, 0, TAU); cx.stroke(); }
          if (wi === this.wave) { cx.fillStyle = '#05060f'; cx.font = '700 8px ' + FONT_M; cx.fillText(lt(d.name).slice(0, 2), x, y + 3); } }
      });
      cx.globalAlpha = 1; cx.textAlign = 'start';
    });
  }
};
