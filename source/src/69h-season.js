/* =====================================================================
   SEASON + HERO MASTERY — a free monthly season: every run, puzzle and
   live game earns season XP, three weekly missions give big chunks, and
   20 tiers pay out credits plus two season-only rewards (a hero skin at
   tier 10, a blade skin at tier 20). Hero mastery: kills with a
   hero level it up: 2 = alternate colors, 3 = victory pose, 4 = hero
   burst when Overdrive starts.
   ===================================================================== */
const SEASONS = [ // one per calendar month (UTC); the rewards return only with that month next year
  { n: 'NEON NEW YEAR', c: '#ffd700', skin: { body: 'ninja', a: '#ffd700', b: '#ff2bd6', name: 'FIREWORK NINJA' }, fx: { name: 'FIREWORK', blade: '#ff2bd6', edge: '#ffd700', trail: 'spark', kill: 'rainbow', deco: 'bolt' } },
  { n: 'FROST CIRCUIT', c: '#9fe8ff', skin: { body: 'wolf', a: '#e8f6ff', b: '#4d7cff', name: 'FROST OOKAMI' }, fx: { name: 'WHITEOUT', blade: '#e8f6ff', edge: '#9fe8ff', trail: 'snow', kill: 'shatter', deco: 'ice' } },
  { n: 'SAKURA RAIN', c: '#ff7ab8', skin: { body: 'kitsune', a: '#ff9ad8', b: '#ffe0ee', name: 'BLOSSOM KITSUNE' }, fx: { name: 'HANAMI', blade: '#ffb7d5', edge: '#fff4fa', trail: 'petal', kill: 'petal', deco: 'petal' } },
  { n: 'CHROME SPRING', c: '#00ff88', skin: { body: 'mecha', a: '#00ff88', b: '#e8eef8', name: 'CHROME MECH' }, fx: { name: 'CHROME', blade: '#e8eef8', edge: '#00ff88', trail: 'spark', kill: 'shred', deco: 'saw' } },
  { n: 'GHOST MARKET', c: '#bfe6ff', skin: { body: 'yurei', a: '#7dff6a', b: '#0a0a12', name: 'MARKET GHOST' }, fx: { name: 'WILL-O-WISP', blade: '#7dff6a', edge: '#e8fbff', trail: 'void', kill: 'implode', deco: 'void' } },
  { n: 'MIDSUMMER MAGLEV', c: '#ff6a00', skin: { body: 'ronin', a: '#ff6a00', b: '#1a1a36', name: 'SUNSET RONIN' }, fx: { name: 'HEATWAVE', blade: '#ff9a00', edge: '#ffe14d', trail: 'ember', kill: 'burn', deco: 'flame' } },
  { n: 'TIDE OF STEEL', c: '#4d7cff', skin: { body: 'viking', a: '#7df9ff', b: '#1e3a6e', name: 'TIDE JARL' }, fx: { name: 'UNDERTOW', blade: '#4d7cff', edge: '#9fe8ff', trail: 'snow', kill: 'ink', deco: 'crack' } },
  { n: 'NEON FESTIVAL', c: '#ff2bd6', skin: { body: 'neko', a: '#ff2bd6', b: '#ffd23f', name: 'FESTIVAL NEKO' }, fx: { name: 'LANTERN', blade: '#ffd23f', edge: '#ff2bd6', trail: 'gold', kill: 'coins', deco: 'scale' } },
  { n: 'HARVEST MOON', c: '#ffb347', skin: { body: 'tengu', a: '#ffb347', b: '#3a1a08', name: 'MOON TENGU' }, fx: { name: 'MOONLIGHT', blade: '#fff4c2', edge: '#ffb347', trail: 'smoke', kill: 'bones', deco: 'bone' } },
  { n: 'NIGHT OF ONI', c: '#ff0844', skin: { body: 'oni', a: '#b537f2', b: '#0a0410', name: 'MIDNIGHT ONI' }, fx: { name: 'NIGHTMARE', blade: '#24242f', edge: '#b537f2', trail: 'void', kill: 'implode', deco: 'crack' } },
  { n: 'IRON STORM', c: '#9fd8ff', skin: { body: 'knight', a: '#9fd8ff', b: '#2a3550', name: 'STORM PALADIN' }, fx: { name: 'TEMPEST', blade: '#9fd8ff', edge: '#ffffff', trail: 'spark', kill: 'zap', deco: 'bolt' } },
  { n: 'WINTER LIGHTS', c: '#7df9ff', skin: { body: 'dragon', a: '#7df9ff', b: '#ffffff', name: 'AURORA RYU' }, fx: { name: 'AURORA', blade: 'prism', edge: '#ffffff', trail: 'prism', kill: 'rainbow', deco: 'prism' } }
];
SEASONS.forEach((S, m) => { // season-only cosmetics join the regular lists (shown only in their month, or once owned)
  SKINS.push(Object.assign({ id: 'season' + m, cost: -1, season: m, unlock: { t: 'season', m }, desc: 'A season-only hero skin: the tier 10 reward of its season.' }, S.skin));
  BLADE_FX.push(Object.assign({ id: 'seasonfx' + m, cost: -1, season: m, unlock: { t: 'season', m }, desc: 'A season-only blade skin: the tier 20 reward of its season.' }, S.fx));
});
const SEASON_TIERS = 20, SEASON_XP = 600;
const MISSIONS = [
  { id: 'parry', d: 'Land {n} perfect parries', n: 30 }, { id: 'kills', d: 'Destroy {n} enemies', n: 400 }, { id: 'mini', d: 'Defeat {n} mini-bosses', n: 3 },
  { id: 'puzzle', d: 'Clear {n} puzzles', n: 5 }, { id: 'car', d: 'Reach car {n} in Maglev Run', n: 6, abs: true }, { id: 'ta', d: 'Score {n} in one Time Attack run', n: 250000, abs: true },
  { id: 'skills', d: 'Use skills {n} times', n: 25 }, { id: 'live', d: 'Play {n} live games with friends', n: 2 }, { id: 'story', d: 'Clear {n} story stages', n: 3 },
  { id: 'daily', d: 'Finish {n} daily runs', n: 2 }, { id: 'rank', d: 'Reach style rank S in {n} runs', n: 2 }, { id: 'heat', d: 'Finish an arcade run with {n} contract heat', n: 4, abs: true }
];
function seasonNow() { const t = new Date(); return { id: t.getUTCFullYear() * 12 + t.getUTCMonth(), m: t.getUTCMonth(), left: Math.max(0, Math.ceil((Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1) - t.getTime()) / 86400000)) }; }
const Season = {
  st() { // this month's state; a new month starts a fresh track (titles/frames earned stay)
    const d = Store.data, now = seasonNow(); if (!d.season || typeof d.season !== 'object') d.season = {};
    const s = d.season; if (s.id !== now.id) { s.id = now.id; s.xp = 0; s.cl = {}; }
    const wk = weekKey(); if (s.wk !== wk) { s.wk = wk; s.mp = {}; s.md = {}; }
    s.cl = s.cl || {}; s.mp = s.mp || {}; s.md = s.md || {}; return s;
  },
  cur() { return SEASONS[seasonNow().m]; },
  tier() { return Math.min(SEASON_TIERS, Math.floor((this.st().xp | 0) / SEASON_XP)); },
  missions() { const r = pzRng(weekKey() * 31 + 7), pool = MISSIONS.slice(), out = []; while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return out; },
  gain(xp) {
    if (REPLAY.on || !(xp > 0)) return; const s = this.st(), t0 = this.tier(); s.xp = (s.xp | 0) + Math.round(xp); Store.touch();
    const t1 = this.tier(); if (t1 > t0) toastDom(ltf('SEASON TIER {0} REACHED — CLAIM IT IN SEASON', t1));
  },
  track(id, v, abs) { // weekly mission progress
    if (REPLAY.on || G.mode === 'dojo') return; const ms = this.missions().find(m => m.id === id); if (!ms) return;
    const s = this.st(); if (s.md[id]) return;
    s.mp[id] = abs ? Math.max(s.mp[id] | 0, v | 0) : (s.mp[id] | 0) + (v | 0); Store.dirty = true;
    if (s.mp[id] >= ms.n) { s.md[id] = 1; this.gain(400); const msg = ltf('MISSION COMPLETE  +{0} SEASON XP', 400); if (G.state === 'PLAY') toast(msg, '#ffd23f'); else toastDom(msg); }
  },
  runXp(score, kills) { return 60 + Math.min(500, Math.floor(ii(score) / 1500)) + Math.min(300, (kills | 0) * 2); },
  onRun() { // a run is banked (any mode but puzzles and the dojo): season XP + weekly missions
    if (REPLAY.on || G.mode === 'dojo' || G.mode === 'puzzle') return;
    const short = (G.rtime || 0) < 20; // quitting at once earns kills only, no base XP
    this.gain(short ? Math.min(300, (G.kills | 0) * 2) : this.runXp(G.score, G.kills));
    if (G.parries) this.track('parry', G.parries); if (G.kills) this.track('kills', G.kills); if (G.mbKills) this.track('mini', G.mbKills);
    if ((G.maxRk | 0) >= 4) this.track('rank', 1);
    if (G.mode === 'endless' && G.seqCar) this.track('car', G.seqCar, true);
  },
  reward(t) { // what tier t pays
    const m = seasonNow().m;
    if (t === 10) return { k: 'skin', id: 'season' + m, cr: 300 };
    if (t === 20) return { k: 'fx', id: 'seasonfx' + m, cr: 600 };
    return { k: 'cr', cr: (t < 10 ? 100 : 180) + t * 20 };
  },
  claim(t) {
    const s = this.st(), d = Store.data; if (t > this.tier() || s.cl[t]) return false;
    const r = this.reward(t); s.cl[t] = 1; d.credits += r.cr;
    if (r.k === 'skin') { d.skins[r.id] = 1; s.t10 = 1; d.seasonT10 = 1; } else if (r.k === 'fx') { d.blades[r.id] = 1; s.champ = 1; d.seasonChamp = 1; }
    Store.touch(); Store.flush(); return true;
  }
};
/* ---------------- hero mastery ---------------- */
const HM_XP = [0, 60, 250, 700, 1500]; // kills with the hero
const HM_PERKS = ['', 'Mastery badge', 'Alternate colors', 'Victory pose', 'Hero burst when Overdrive starts'];
const HERO_BURST = { ninja: 'SHURIKEN STORM', ronin: 'WANDERING STEEL', neko: 'NINE LIVES', oni: 'ONI RAGE', kitsune: 'FOX FIRE', tengu: 'BLACK FEATHERS', mecha: 'MISSILE SWARM', skull: 'BONE RAIN', yurei: 'SPIRIT WAIL',
  shogun: 'IMPERIAL DECREE', raijin: 'THUNDER DRUMS', wolf: 'HOWL OF THE PACK', knight: 'HOLY LANCE', viking: 'BERSERKER HORN', dragon: 'DRAGON BREATH', goo: 'SLIME SPLASH' };
function heroLevel(id) { const xp = (Store.data.hmast && Store.data.hmast[id]) | 0; let l = 0; for (let i = 1; i < HM_XP.length; i++) if (xp >= HM_XP[i]) l = i; return l; }
function heroXp() { // a kill with the equipped hero (new perks apply from the next run, so replays stay exact)
  if (REPLAY.on || G.mode === 'puzzle' || G.mode === 'dojo') return;
  const d = Store.data, id = d.skin; if (!d.hmast) d.hmast = {}; const xp = (d.hmast[id] | 0) + 1; d.hmast[id] = xp;
  const lv = HM_XP.indexOf(xp); if (lv > 0) { FX.call(ltf('{0} MASTERY {1}', lt(skinOf(id).name), lv), '#ffd23f', 3, 20); toast(lt(HM_PERKS[lv]).toUpperCase(), '#ffd23f'); Aud.sfx('star', 2); }
}
function heroBurst() { // mastery 4: Overdrive opens with a ring of homing shards in the hero's colors
  for (let k = 0; k < 10; k++) shard(P.x, P.y, k * TAU / 10, 520, k % 2 ? P.ca : P.cb, 1.2);
  FX.ring(P.x, P.y, 120, P.cb, 5); FX.call(lt(HERO_BURST[P.skin.body] || 'HERO BURST'), P.ca, 3, 24);
}
/* mastery 2: an alternate look. Gold edition, or platinum for heroes that are already gold. */
const ALT_LOOK = {};
function isGoldish(c) { const n = parseInt(String(c).slice(1), 16); if (!(n >= 0)) return false; const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return r > 200 && g > 140 && b < 120; }
function skinLook(id) {
  const sk = skinOf(id), d = Store.data; if (!(d.alt && d.alt[sk.id]) || heroLevel(sk.id) < 2) return sk;
  return ALT_LOOK[sk.id] || (ALT_LOOK[sk.id] = Object.assign({}, sk, isGoldish(sk.a) ? { a: '#f4f6ff', b: sk.a } : { a: '#ffd23f', b: sk.a }));
}
/* mastery 3: a victory pose (a blade spin, then the blade held high in a shower of sparks) */
function heroPose(o, t) {
  o.face = Math.PI / 2; o.mvA = o.face; o.spd = 0; o.dashing = false;
  if (t < .55) { o.blade = -Math.PI / 2 + (t / .55) * TAU * 1.5; o.sx = o.sy = 1 + .1 * Math.sin(t / .55 * Math.PI); }
  else { o.blade = -Math.PI / 2 - .3 + Math.sin(t * 3) * .05; const k = Math.max(0, 1 - (t - .55) * 5); o.sx = o.sy = 1 + .14 * k; }
}
function poseFx(x, y, t, c, last) { // sparks rain from the raised blade (called while the pose is drawn)
  if (G.state === 'PAUSE') return; // frozen world: no particles
  if (t > .55 && ((t * 4) | 0) !== ((last * 4) | 0)) { FX.spark(x - 10, y - 46, '#ffd23f', 5); FX.spark(x - 10, y - 46, c, 3); }
  if (t > .5 && last <= .5) { FX.ring(x, y, 70, '#ffd23f', 4); FX.text(x, y - 64, lt('VICTORY'), '#ffd23f', 15); }
}
function poseStart() { if (heroLevel(Store.data.skin) >= 3) { P.poseS = CAM.t; P.poseL = 0; } }
/* ---------------- the SEASON screen ---------------- */
Object.assign(UI, {
  openSeason() { G.state = 'MENU'; this.backFn = null; this.show('season'); this.renderSeason(); },
  renderSeason() {
    const S = Season.cur(), s = Season.st(), now = seasonNow(), tier = Season.tier(), box = $('seBox'); box.textContent = '';
    const head = el('div', 'panel'); head.style.borderColor = S.c;
    head.appendChild(el('div', 'eyebrow', ltf('SEASON · {0} DAYS LEFT', now.left)));
    const h = el('h2', '', lt(S.n)); h.style.color = S.c; head.appendChild(h);
    const xpIn = (s.xp | 0) - tier * SEASON_XP; head.appendChild(el('div', 'small', tier >= SEASON_TIERS ? lt('ALL TIERS REACHED') : ltf('TIER {0}/{1} · {2}/{3} XP to the next tier', tier, SEASON_TIERS, xpIn, SEASON_XP)));
    const bar = el('span', 'mbar'), f = el('i'); f.style.width = (tier >= SEASON_TIERS ? 100 : xpIn / SEASON_XP * 100) + '%'; f.style.background = S.c; bar.appendChild(f); bar.style.display = 'block'; bar.style.marginTop = '6px'; head.appendChild(bar);
    const rw = el('div', 'se-rw'), m = now.m; // the two season-only rewards, drawn
    for (const [tab, id, t] of [['heroes', 'season' + m, 10], ['fx', 'seasonfx' + m, 20]]) {
      const c = el('div', 'se-r'), ic = document.createElement('canvas'); ic.width = ic.height = 112; drawIcon(ic.getContext('2d'), { tab, id }, 112); c.appendChild(ic);
      const tx = el('div', 'small'); tx.appendChild(el('div', 'gold', ltf('TIER {0}', t))); tx.appendChild(el('div', '', lt(tab === 'heroes' ? skinOf(id).name : bladeOf(id).name))); c.appendChild(tx); rw.appendChild(c);
    }
    head.appendChild(rw);
    head.appendChild(el('div', 'small mute', lt('Every run, puzzle and live game earns season XP. Weekly missions give 400 XP each.')));
    box.appendChild(head);
    box.appendChild(el('div', 'eyebrow', lt('THIS WEEK\'S MISSIONS')));
    for (const ms of Season.missions()) {
      const p = Math.min(ms.n, s.mp[ms.id] | 0), done = !!s.md[ms.id], r = el('div', 'bty');
      r.appendChild(el('span', done ? 'gold' : '', lt(ms.d).replace('{n}', fmtNum(ms.n)))); r.appendChild(el('span', 'gold small', done ? '✓' : '+400 XP'));
      const b2 = el('div', 'bar'), i2 = el('i'); i2.style.width = (done ? 100 : p / ms.n * 100) + '%'; b2.appendChild(i2); r.appendChild(b2); box.appendChild(r);
    }
    box.appendChild(el('div', 'eyebrow', lt('REWARDS')));
    let open = 0; for (let t = 1; t <= tier; t++) if (!s.cl[t]) open++;
    if (open > 1) { const all = el('button', 'btn gold', ltf('CLAIM ALL ({0})', open)); all.onclick = () => { let n = 0; for (let t = 1; t <= Season.tier(); t++) if (Season.claim(t)) n++; Aud.sfx('buy'); toastDom(ltf('{0} TIERS CLAIMED', n)); this.renderSeason(); this.refreshProfile(); }; box.appendChild(all); }
    const list = el('div', 'list');
    for (let t = 1; t <= SEASON_TIERS; t++) {
      const rw = Season.reward(t), got = !!s.cl[t], open = t <= tier, b = el('button', 'item' + (got ? ' on' : '') + (open ? '' : ' lock'));
      const name = rw.k === 'skin' ? lt(skinOf(rw.id).name) + ' + ' + fmtNum(rw.cr) + ' CR' : rw.k === 'fx' ? lt(bladeOf(rw.id).name) + ' + ' + fmtNum(rw.cr) + ' CR' : fmtNum(rw.cr) + ' CR';
      b.appendChild(el('span', 'nm', ltf('TIER {0}', t) + ' · ' + name)); b.appendChild(el('span', 'pr', got ? lt('CLAIMED') : open ? lt('CLAIM') : lt('LOCKED')));
      if (rw.k !== 'cr') b.appendChild(el('span', 'ds', rw.k === 'skin' ? lt('Season-only hero skin. Gone when the month ends.') : lt('Season-only blade skin. Gone when the month ends.')));
      b.onclick = () => { if (Season.claim(t)) { Aud.sfx('buy'); toastDom(ltf('TIER {0} CLAIMED', t)); this.renderSeason(); this.refreshProfile(); } else Aud.sfx('deny'); };
      list.appendChild(b);
    }
    box.appendChild(list);
  }
});
/* ---------------- your hero on the title screen ---------------- */
const TitleHero = {
  g: null, cv: null, t: 0, k: 1, sc: null,
  attach() {
    const cv = $('thCv'); if (!cv) return; this.cv = cv; const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.height = Math.round(92 * dpr); this.g = cv.getContext('2d'); this.k = cv.width / 92;
  },
  tick(rd) {
    if (UI.cur !== 'title') return; if (!this.g) this.attach(); if (!this.g) return;
    this.t += rd; withCtx(this.g, () => { cx.setTransform(this.k, 0, 0, this.k, 0, 0); this.draw(); });
  },
  draw() {
    const d = Store.data, t = this.t, lv = heroLevel(d.skin), h = HO, sk = skinLook(d.skin);
    cx.fillStyle = '#0b0f22'; cx.fillRect(0, 0, 92, 92);
    cx.strokeStyle = 'rgba(0,242,254,.12)'; cx.lineWidth = 1.5; cx.beginPath(); for (let y = (t * 30) % 23; y < 92; y += 23) { cx.moveTo(4, y); cx.lineTo(88, y); } cx.stroke();
    cx.fillStyle = sk.a; cx.globalAlpha = .7; cx.fillRect(2, 0, 2, 92); cx.fillRect(88, 0, 2, 92); cx.globalAlpha = 1;
    heroSetSkin(h, sk); h.x = 46; h.y = 56; h.ph = 0; h.alpha = 1; h.w = d.weapon; h.fx = bladeOf(d.blade); h.bl = 40; h.t = t; h.hot = h.od = 0; h.sx = h.sy = 1;
    const cyc = 6, p = t % cyc, posing = lv >= 3 && p >= 3;
    if (posing) {
      heroPose(h, p - 3);
      glow(46, 40, 46, '#ffd23f', .22 + .08 * Math.sin(t * 6));
      if (p - 3 > .55) { cx.fillStyle = '#ffd23f'; for (let i = 0; i < 6; i++) { const q = ((t * .9 + i / 6) % 1); dot(46 - 8 + Math.sin(i * 2.3 + t) * 16, 14 + q * 60, 1.6 * (1 - q)); } }
    } else {
      h.face = Math.PI / 2 + Math.sin(t * .8) * .25; h.mvA = h.face; h.spd = 0; h.dashing = false;
      h.blade = h.face + 1.8 + Math.sin(t * 2.5) * .2;
      if (p > 1.6 && p < 2.2) { const k = (p - 1.6) / .6; h.blade = h.face + 1.8 - k * TAU; } // a quick blade twirl
    }
    if (h.body !== 'tengu' && h.body !== 'yurei') { // a short scarf
      const sc = this.sc || (this.sc = new Float32Array(20)), a = h.face;
      for (let i = 0; i < 10; i++) { sc[i * 2] = h.x - Math.cos(a) * (8 + i * 3.6) + Math.sin(t * 5 + i * .6) * i * .4; sc[i * 2 + 1] = h.y - Math.sin(a) * (8 + i * 3.6); }
      drawHeroTrail(h.body, sc, h.ca, h.cb);
    }
    drawHero(h);
    if (lv >= 4 && p < 1) { cx.strokeStyle = sk.b; cx.globalAlpha = 1 - p; cx.lineWidth = 2; cx.beginPath(); cx.arc(46, 56, 12 + p * 40, 0, TAU); cx.stroke(); cx.globalAlpha = 1; }
    if (lv >= 1) { cx.fillStyle = '#ffd23f'; cx.font = '700 10px ' + FONT_M; cx.textAlign = 'left'; cx.fillText('★' + lv, 6, 12); }
  }
};
Object.assign(UI, {
  renderTitleHero() {
    const d = Store.data, sk = skinOf(d.skin), lv = heroLevel(d.skin), xp = (d.hmast && d.hmast[d.skin]) | 0, nx = HM_XP[lv + 1], lo = HM_XP[lv];
    $('thNm').textContent = lt(sk.name);
    $('thMs').textContent = ltf('HERO MASTERY {0}/4', lv) + (nx ? ' · ' + fmtNum(xp) + '/' + fmtNum(nx) : ' · ' + lt('MAXED'));
    $('thBar').style.width = (nx ? Math.round((xp - lo) / (nx - lo) * 100) : 100) + '%';
    $('thPk').textContent = nx ? ltf('Next: {0}', lt(lv + 1 === 4 ? HERO_BURST[sk.body] || 'HERO BURST' : HM_PERKS[lv + 1])) : lt(HERO_BURST[sk.body] || 'HERO BURST');
    $('tSeason').textContent = Season.tier() + '/' + SEASON_TIERS;
    const S = Season.cur(); $('bSeason').style.borderColor = S.c;
  },
  heroPerksText(id) { // the four mastery perks for one hero, ticked when reached
    const lv = heroLevel(id), body = skinOf(id).body, out = [];
    for (let i = 1; i <= 4; i++) out.push((lv >= i ? '✓ ' : i + '. ') + lt(i === 4 ? HERO_BURST[body] || 'HERO BURST' : HM_PERKS[i]));
    return lt('HERO MASTERY (kills with this hero)') + ': ' + out.join(' · ');
  }
});
