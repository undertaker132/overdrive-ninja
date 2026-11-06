/* =====================================================================
   SEASONAL EVENTS (version 22) — a limited-time run with its own world,
   costumed enemies, a special rule and an event currency to spend on
   rewards that only this event gives.
     NEON HALLOWEEN (Oct 20 - Nov 7): the night parade streets, pumpkin
       and witch-hat enemies, and every 6th kill leaves a JACK-O-BOMB that
       blows up the enemies around it. Boss: HYAKKI. Currency: CANDY.
     FROSTBYTE WINTER (Dec 15 - Jan 10): snowy rooftops, Santa hats and
       scarves, and every 3rd dash throws a SNOWBALL that freezes what it
       hits. Boss: VALKYRIE.SYS. Currency: SNOWFLAKES.
   An event run is a Maglev Run with the event switched on (hdr.evt): the
   rule is part of the simulation, so replays and ghosts stay exact. Event
   runs are not ranked against normal Maglev Runs.
   ===================================================================== */
const EVENTS = [
  { id: 'halloween', from: 1020, to: 1107, name: 'NEON HALLOWEEN', icon: '🎃', col: '#ff7a1a', theme: 'parade', boss: 'hyakki', cur: 'CANDY',
    desc: 'The night parade takes over the maglev line. Enemies come in costume, and every 6th kill leaves a JACK-O-BOMB that blows up the enemies around it.',
    rewards: [{ tab: 'heroes', id: 'pumpking', cost: 250 }, { tab: 'fx', id: 'candycorn', cost: 150 }, { tab: 'pets', id: 'batling', cost: 200 }] },
  { id: 'winter', from: 1215, to: 110, name: 'FROSTBYTE WINTER', icon: '❄', col: '#9fe8ff', theme: 'winter', boss: 'valkyrie', cur: 'SNOWFLAKES',
    desc: 'Snow on every rooftop. Enemies wear Santa hats and scarves, and every 3rd dash throws a SNOWBALL that freezes what it hits.',
    rewards: [{ tab: 'heroes', id: 'yeti', cost: 250 }, { tab: 'fx', id: 'frostbite', cost: 150 }, { tab: 'pets', id: 'penguin', cost: 200 }] }
];
function eventOn(dk) { // the event running on that day (YYYYMMDD), or null
  const md = (dk | 0) % 10000;
  for (const E of EVENTS) { if (E.from <= E.to ? md >= E.from && md <= E.to : md >= E.from || md <= E.to) return E; }
  return null;
}
function eventDaysLeft(E, dk) { // days until the event closes (inclusive)
  const y = Math.floor(dk / 10000), m = Math.floor(dk / 100) % 100, d = dk % 100, now = Date.UTC(y, m - 1, d);
  let ey = y; const em = Math.floor(E.to / 100), ed = E.to % 100; if (E.from > E.to && m * 100 + d >= E.from) ey = y + 1;
  return Math.max(1, Math.round((Date.UTC(ey, em - 1, ed) - now) / 864e5) + 1);
}
const Events = {
  go: 0, bombs: [], balls: [], k: 0, dN: 0,
  data(id) { const d = Store.data; d.evt = d.evt && typeof d.evt === 'object' ? d.evt : {}; const o = d.evt[id] || (d.evt[id] = { cur: 0, best: 0, runs: 0, got: 0 }); return o; },
  cur() { return G.event ? EVENTS.find(E => E.id === G.event) : null; },
  begin() { this.bombs.length = 0; this.balls.length = 0; this.k = 0; this.dN = 0; G.evCur = 0; G.evBombKills = 0; },
  /* ---- simulation ---- */
  onKill(e) {
    if (!G.event || G.state !== 'PLAY') return;
    const eb = e.evBomb; e.evBomb = 0;
    if (G.event === 'halloween' && !eb && ++this.k % 6 === 0 && this.bombs.length < 6) this.bombs.push({ x: e.x, y: e.y, t: 1, uid: e.uid });
  },
  onSlash(a) {
    if (G.event !== 'winter') return;
    if (++this.dN % 3 === 0 && this.balls.length < 6) this.balls.push({ x: P.x + Math.cos(a) * 16, y: P.y + Math.sin(a) * 16, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, l: 1.1 });
  },
  update(dt) {
    if (!G.event) return;
    for (let i = this.bombs.length - 1; i >= 0; i--) { const b = this.bombs[i]; b.t -= dt; if (b.t > 0) continue; this.bombs.splice(i, 1);
      const D = 1.5 * P.w.dmg * P.dmgMul * G.dmgMod; FX.boom(b.x, b.y, 95, '#ff7a1a'); shake(.25); Aud.sfx('boom', 0);
      for (let j = 0; j < EN.n; j++) { const e = EN.a[j]; if (!e.alive || e.al > 0 || e.spawnT > 0 || dist(e.x, e.y, b.x, b.y) > 95 + e.r) continue; e.evBomb = 1; if (damageEnemy(e, D, Math.atan2(e.y - b.y, e.x - b.x), 2)) G.evBombKills++; else e.evBomb = 0; }
      const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, b.x, b.y) < 95 + B.r) Boss.hitBody(B, D, 0, false, b.x, b.y); }
    for (let i = this.balls.length - 1; i >= 0; i--) { const s = this.balls[i]; s.l -= dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.l <= 0 || s.x < V.L - 20 || s.x > V.R + 20 || s.y < -20 || s.y > V.VH + 20) { this.balls.splice(i, 1); continue; }
      let hit = false;
      for (let j = 0; j < EN.n && !hit; j++) { const e = EN.a[j]; if (!e.alive || e.al > 0 || e.spawnT > 0 || dist(e.x, e.y, s.x, s.y) > e.r + 8) continue; hit = true; if (!damageEnemy(e, .6 * P.w.dmg * P.dmgMul * G.dmgMod, Math.atan2(s.vy, s.vx), 2) && e.alive) e.stun = Math.max(e.stun, e.mb ? .25 : .9); FX.spark(s.x, s.y, '#ffffff', 8); FX.ring(s.x, s.y, 26, '#bff4ff', 2); }
      const B = Boss.cur; if (!hit && B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, s.x, s.y) < B.r + 8) { hit = true; Boss.hitBody(B, .6 * P.w.dmg * P.dmgMul * G.dmgMod, 0, false, s.x, s.y); }
      if (hit) this.balls.splice(i, 1); }
  },
  earned() { // the event currency for this run
    return Math.floor(G.kills / 3) + (G.bossIdx | 0) * 15 + (G.seqCar | 0) * 2 + (G.evBombKills | 0);
  },
  /* ---- drawing ---- */
  draw() {
    if (!G.event) return;
    for (const b of this.bombs) { const k = 1 - b.t, p = 1 + Math.sin(CAM.t * 30) * .08 * k; glow(b.x, b.y, 30 + k * 20, '#ff7a1a', .5 + k * .4);
      cx.save(); cx.translate(b.x, b.y); cx.scale(p, p); cx.fillStyle = '#ff7a1a'; cx.beginPath(); cx.ellipse(0, 0, 13, 11, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#a04000'; cx.lineWidth = 1.5; for (const x of [-6, 0, 6]) { cx.beginPath(); cx.ellipse(x, 0, 3.5, 10.5, 0, 0, TAU); cx.stroke(); }
      cx.fillStyle = '#ffe14d'; cx.beginPath(); cx.moveTo(-7, -3); cx.lineTo(-3, -6); cx.lineTo(-2, -2); cx.fill(); cx.beginPath(); cx.moveTo(7, -3); cx.lineTo(3, -6); cx.lineTo(2, -2); cx.fill(); cx.beginPath(); cx.moveTo(-7, 3); cx.lineTo(-4, 6); cx.lineTo(0, 4); cx.lineTo(4, 6); cx.lineTo(7, 3); cx.lineTo(0, 5); cx.fill();
      cx.strokeStyle = '#3a6a10'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(0, -11); cx.lineTo(2, -16); cx.stroke(); cx.restore();
      cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.beginPath(); cx.arc(b.x, b.y, 20, -Math.PI / 2, -Math.PI / 2 + TAU * k); cx.stroke(); }
    for (const s of this.balls) { glow(s.x, s.y, 16, '#bff4ff', .6); cx.fillStyle = '#ffffff'; dot(s.x, s.y, 6); cx.fillStyle = '#d8f0ff'; dot(s.x - 2, s.y - 2, 2.5); }
    if (G.event === 'winter' && !CALM) { cx.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 40; k++) { const x = V.L + ((k * 97 + CAM.t * (20 + k % 5 * 8)) % (V.R - V.L)), y = (k * 151 + CAM.t * (60 + k % 7 * 12)) % V.VH; dot(x + Math.sin(CAM.t * 2 + k) * 6, y, 1 + (k % 3) * .6); } }
  },
  costume(e) { // event costumes over the enemies (render only)
    if (!G.event || !e.alive || e.vis < .3 || !(e.scale > .3)) return; const r = e.r * Math.min(1.6, e.scale), w = e.uid % 2;
    cx.save(); cx.translate(e.x, e.y - r * .9);
    if (G.event === 'halloween') {
      if (w) { cx.fillStyle = '#ff7a1a'; cx.beginPath(); cx.ellipse(0, 0, r * .55, r * .42, 0, 0, TAU); cx.fill(); cx.fillStyle = '#1a0a00'; cx.beginPath(); cx.moveTo(-r * .3, -r * .05); cx.lineTo(-r * .12, -r * .2); cx.lineTo(-r * .08, 0); cx.fill(); cx.beginPath(); cx.moveTo(r * .3, -r * .05); cx.lineTo(r * .12, -r * .2); cx.lineTo(r * .08, 0); cx.fill(); cx.fillRect(-r * .25, r * .12, r * .5, r * .08); cx.strokeStyle = '#3a6a10'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, -r * .4); cx.lineTo(r * .08, -r * .6); cx.stroke(); }
      else { cx.fillStyle = '#1a0a24'; cx.beginPath(); cx.ellipse(0, r * .1, r * .7, r * .16, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.moveTo(-r * .38, r * .05); cx.lineTo(r * .1, -r * .95); cx.lineTo(r * .38, r * .05); cx.fill(); cx.fillStyle = '#b537f2'; cx.fillRect(-r * .34, -r * .06, r * .68, r * .1); }
    } else {
      if (w) { cx.fillStyle = '#e02030'; cx.beginPath(); cx.moveTo(-r * .45, r * .1); cx.quadraticCurveTo(0, -r * .9, r * .5, -r * .5); cx.lineTo(r * .45, r * .1); cx.fill(); cx.fillStyle = '#ffffff'; cx.fillRect(-r * .5, 0, r, r * .18); dot(r * .5, -r * .5, r * .14); }
      else { cx.strokeStyle = '#2ecf8a'; cx.lineWidth = Math.max(3, r * .22); cx.beginPath(); cx.moveTo(-r * .6, r * .9); cx.quadraticCurveTo(0, r * 1.2, r * .6, r * .9); cx.stroke(); cx.strokeStyle = '#e02030'; cx.lineWidth = 2; cx.stroke(); }
    }
    cx.restore();
  },
  /* ---- the run ends: bank the currency ---- */
  bank() {
    const E = this.cur(); if (!E || REPLAY.on) return 0; const o = this.data(E.id), n = this.earned();
    o.cur += n; o.runs++; if (G.score > o.best) o.best = G.score; Store.touch(); return n;
  }
};
/* ---------------- hooks ---------------- */
{
  const begin0 = Director.begin.bind(Director);
  Director.begin = function (mode, stage) {
    G.event = ''; const want = Events.go; Events.go = 0;
    begin0(mode, stage);
    const ev = REPLAY.on ? (REPLAY.hdr.evt || '') : want && mode === 'endless' ? ((eventOn(G.dayKey) || {}).id || '') : '';
    G.event = mode === 'endless' ? ev : ''; Events.begin();
    if (G.event) { G.scoreMul *= 1.25; this.setupCar(1); FX.call(lt(Events.cur().name), Events.cur().col, 3, 26); }
  };
  const car0 = Director.setupCar.bind(Director);
  Director.setupCar = function (k, kind) {
    car0(k, kind); const E = Events.cur(); if (!E) return;
    BG.set(E.theme); if (this.bossPending) this.bossPending = E.boss;
  };
  const post0 = EAnim.post.bind(EAnim);
  EAnim.post = function (e) { post0(e); Events.costume(e); };
}
Object.assign(Flow, {
  startEvent() { if (!eventOn(todayKey())) { toastDom(lt('The event is over. See you at the next one!')); return; } Events.go = 1; this.startArcade('endless'); }
});
{ // event runs are not ranked as Maglev Runs: they bank their currency instead
  const end0 = Flow.arcadeEnd.bind(Flow);
  Flow.arcadeEnd = function (win) {
    const E = Events.cur(); if (!E) return end0(win);
    const d = Store.data, keep = d.best.endless, n = Events.bank(); end0(win); d.best.endless = keep; Store.touch();
    const box = $('rsNotes'); if (box) { const r = el('div', 'gold', E.icon + ' ' + ltf('+{0} {1} for the {2} rewards', n, lt(E.cur), lt(E.name))); box.prepend(r); }
    const main = $('rsMain'); if (main) main.onclick = () => { Aud.sfx('ui'); this.startEvent(); };
  };
}
/* ---------------- the event screen and the title banner ---------------- */
Object.assign(UI, {
  eventBanner() {
    const E = eventOn(todayKey()); let b = $('bEvent');
    if (!E || !Gate.open('arcade')) { if (b) b.classList.add('hidden'); return; } // new players see the story first
    if (!b) { b = el('button', 'panel evbanner'); b.id = 'bEvent'; $('bStory').before(b); b.onclick = () => { Aud.sfx('ui'); this.openEvent(); }; }
    b.classList.remove('hidden'); b.textContent = ''; b.style.setProperty('--ec', E.col);
    b.appendChild(el('span', 'evic', E.icon)); const t = el('span', 'evtx'); t.appendChild(el('b', '', lt(E.name))); t.appendChild(el('span', 'small mute', ltf('EVENT LIVE · {0} DAYS LEFT', eventDaysLeft(E, todayKey())))); b.appendChild(t); b.appendChild(el('span', 'chip gold', lt('PLAY')));
  },
  openEvent() {
    const E = eventOn(todayKey()); if (!E) { toastDom(lt('The event is over. See you at the next one!')); return; }
    let s = $('s-event'); if (!s) { s = el('section', 'scr hidden'); s.id = 's-event'; $('ov').appendChild(s); }
    G.state = 'MENU'; this.backFn = null; this.show('event'); this.renderEvent();
  },
  renderEvent() {
    const E = eventOn(todayKey()), s = $('s-event'); if (!E || !s) return; s.textContent = ''; const d = Store.data, o = Events.data(E.id);
    const col = el('div', 'col'); s.appendChild(col);
    const top = el('div', 'topbar'); top.appendChild(el('h2', '', E.icon + ' ' + lt(E.name))); top.appendChild(el('span', 'chip gold', ltf('{0} {1}', fmtNum(o.cur), lt(E.cur)))); col.appendChild(top);
    const p = el('div', 'panel evpanel'); p.style.setProperty('--ec', E.col); p.appendChild(el('div', 'small', lt(E.desc)));
    p.appendChild(el('div', 'small mute', ltf('{0} days left · best {1} · {2} runs', eventDaysLeft(E, todayKey()), fmtNum(o.best), o.runs)));
    const go = el('button', 'btn pri', lt('PLAY THE EVENT')); go.onclick = () => { Aud.sfx('ui'); Flow.startEvent(); }; p.appendChild(go); col.appendChild(p);
    col.appendChild(el('div', 'eyebrow', lt('EVENT REWARDS')));
    for (const R0 of E.rewards) {
      const own = R0.tab === 'heroes' ? !!d.skins[R0.id] : R0.tab === 'fx' ? !!d.blades[R0.id] : !!(d.pets && d.pets[R0.id]);
      const it = R0.tab === 'heroes' ? skinOf(R0.id) : R0.tab === 'fx' ? bladeOf(R0.id) : PET_BY_ID[R0.id];
      const row = el('div', 'panel evrow'), cv = document.createElement('canvas'); cv.width = cv.height = 112; cv.className = 'evic2'; try { drawIcon(cv.getContext('2d'), { tab: R0.tab, id: R0.id, state: 'own' }, 112); } catch (e) { errLog(e); } row.appendChild(cv);
      const tx = el('div', 'evtx'); tx.appendChild(el('b', '', lt(it.name))); tx.appendChild(el('span', 'small mute', lt(it.desc))); row.appendChild(tx);
      const b = el('button', own ? 'btn' : 'btn gold', own ? lt('OWNED') : ltf('{0} {1}', fmtNum(R0.cost), lt(E.cur))); b.disabled = own || o.cur < R0.cost;
      b.onclick = () => { if (own || o.cur < R0.cost) { Aud.sfx('deny'); return; } o.cur -= R0.cost; if (R0.tab === 'heroes') d.skins[R0.id] = 1; else if (R0.tab === 'fx') d.blades[R0.id] = 1; else { d.pets = d.pets || {}; d.pets[R0.id] = 1; }
        Aud.sfx('star', 2); vibe('reward'); Store.touch(); Store.flush(); toastDom(ltf('{0} UNLOCKED — EQUIP IT IN THE ARSENAL', lt(it.name))); this.renderEvent(); };
      row.appendChild(b); col.appendChild(row);
    }
    col.appendChild(el('div', 'small mute', lt('Event rewards are yours to keep after the event ends.')));
    const back = el('button', 'btn ghost', lt('BACK')); back.onclick = () => { Aud.sfx('back'); this.openTitle(); }; col.appendChild(back);
  }
});
{ const t0 = UI.openTitle.bind(UI); UI.openTitle = function () { t0(); try { this.eventBanner(); } catch (e) { errLog(e); } }; }
