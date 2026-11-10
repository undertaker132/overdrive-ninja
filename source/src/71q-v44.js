/* =====================================================================
   VERSION 44: YOUR OWN HERO, THE WORLD BOSS, THREE CRATES
   · HERO FORGE: build your own fighter. Pick a class (NINJA, SAMURAI,
     SHINOBI, ONMYOJI), each with four abilities that open as the class
     levels up; pick a body and two colors; build your own weapon in the
     workshop: short, mid or long range, then upgrade its EDGE (damage),
     GRIP (charges and recharge) and CORE (critical hits) with materials.
   · HERO TRIALS: endless train cars played with your own hero. Not
     recorded and kept apart from the arcade boards.
   · WORLD BOSS (Thursday to Sunday): a boss with much more health, fought
     with your own hero, alone or with friends in a live raid. Every clear
     drops materials, and with luck a BROKEN RELIC piece (3 restore the
     mythic WORLD-EATER blade) or the WORLD-EATER hero (very rare).
   · THREE CRATES: BASIC (600 CR, mostly small things, a very small chance
     of the best), NEON (1,500 CR) and a LIMITED crate (3,000 CR) with a
     weapon that exists nowhere else, in the shop for two weeks at a time.
   · Opening a crate starts with the crate itself: it lands, shakes and
     cracks open in light that climbs through the rarity colors before the
     film; the reveal spins rays in the rarity color.
   New weapons borrow art and swings from a base weapon (like version 36),
   so every existing replay stays exact. Runs with your own hero are never
   recorded.
   ===================================================================== */
/* ---------- new weapons ---------- */
WEAPONS.push(
  { id: 'eclipse', name: 'ECLIPSE FANG', desc: 'A long blade forged in a solar eclipse. Limited crate only.', dmg: 1.55, speed: 1500, ch: 3, crit: .22, cm: 2.4, heat: 20, reach: 14, cost: -1, v: 44, lim: 1 },
  { id: 'stormfang', name: 'STORM CALLER', desc: 'A spear that hums with lightning. Limited crate only.', dmg: 1.3, speed: 1560, ch: 3, crit: .2, cm: 2.2, heat: 20, reach: 16, cost: -1, v: 44, lim: 1 },
  { id: 'worldeater', name: 'WORLD-EATER', desc: 'A relic cleaver rebuilt from the World Boss. Restore three broken pieces.', dmg: 1.9, speed: 1380, ch: 2, crit: .18, cm: 2.6, heat: 22, reach: 10, cost: -1, v: 44, relic: 1 }
);
Object.assign(W5_BASE, { eclipse: 'nodachi', stormfang: 'spear', worldeater: 'cleaver' });
Object.assign(W5_TINT, { eclipse: { id: 'w6ecl', blade: '#ffb000', edge: '#fff2c4' }, stormfang: { id: 'w6sto', blade: '#7df9ff', edge: '#ffffff' }, worldeater: { id: 'w6wor', blade: '#ff2b5e', edge: '#ffd0da' } });
for (const k of ['eclipse', 'stormfang', 'worldeater']) { const b = W5_BASE[k]; GRIP[k] = GRIP[b]; if (SW_DUR[b] != null) SW_DUR[k] = SW_DUR[b]; }
Object.assign(SW_COL, { eclipse: '#ffb000', stormfang: '#7df9ff', worldeater: '#ff2b5e' });
Object.assign(TIER_FIXED, { eclipse: 5, stormfang: 5, worldeater: 5, worldeater_s: 5 });
Object.assign(R3, { wfam0: R3.wfam }); R3.wfam = function (id) { return { eclipse: 'long', stormfang: 'pole', worldeater: 'cleaver' }[id] || this.wfam0(id); };
SKINS.push({ id: 'worldeater_s', name: 'WORLD-EATER', body: 'ashura', a: '#ff2b5e', b: '#1a0510', cost: -1, unlock: { t: 'feat', id: 'wbskin' }, desc: 'Worn by the World Boss itself. A very rare World Boss drop.' });
const LIMITED_W = ['eclipse', 'stormfang'];
/* ---------- three crates ---------- */
const CRATE_T = {
  basic: { n: 'BASIC CRATE', price: 600, odds: [70, 22, 6.5, 1.3, .2], pl: 60, pm: 300, c: '#9fb3d9', k: 'basic' },
  neon: { n: 'NEON CRATE', price: CRATE_PRICE, odds: RAR_ODDS, pl: PITY_LEG, pm: PITY_MYTH, c: '#00f2fe', k: 'crates' },
  lim: { n: 'LIMITED CRATE', price: 3000, odds: RAR_ODDS, pl: PITY_LEG, pm: PITY_MYTH, c: '#ffb000', k: 'lim' }
};
Object.assign(Crates, {
  period() { return Math.floor(Date.now() / 864e5 / 14); },
  featured() { return LIMITED_W[this.period() % LIMITED_W.length]; },
  leftDays() { const end = (this.period() + 1) * 14 * 864e5; return Math.max(0, Math.ceil((end - Date.now()) / 864e5)); },
  cnt(t) { const b = this.bag(); return b[CRATE_T[t].k] | 0; },
  rollT(t) { const T = CRATE_T[t], b = this.bag(), sl = 'sl_' + t, sm = 'sm_' + t; if (t === 'neon') return this.rollRarity();
    b[sl] = b[sl] | 0; b[sm] = b[sm] | 0; if (b[sm] >= T.pm - 1) return 4; let x = Math.random() * 100, r = 0; for (; r < 4; r++) { if (x < T.odds[r]) break; x -= T.odds[r]; } if (r < 3 && b[sl] >= T.pl - 1) r = 3; return r; },
  openT(t) {
    if (t === 'neon') return this.open(); const d = Store.data, b = this.bag(), T = CRATE_T[t]; if ((b[T.k] | 0) <= 0) return null; b[T.k]--; b.opened++;
    const r = this.rollT(t), sl = 'sl_' + t, sm = 'sm_' + t; b[sl] = r >= 3 ? 0 : (b[sl] | 0) + 1; b[sm] = r >= 4 ? 0 : (b[sm] | 0) + 1;
    const f = this.featured();
    if (t === 'lim' && r >= 3 && !d.owned[f] && Math.random() < (r === 4 ? .6 : .25)) { d.owned[f] = 1; b.shards += 40; Store.touch(); Store.flush && Store.flush(true); return { r: 4, item: { tab: 'blades', id: f, name: WEAPONS.find(w => w.id === f).name }, cr: 0, cores: 0, prisms: 0, shards: 40, lim: 1 }; }
    // the same draw as a neon crate, at this crate's rarity
    const keep = this.rollRarity, sl0 = b.sl, sm0 = b.sm, crates = b.crates; this.rollRarity = () => r; b.crates = 1; let res; try { res = this.open(); } finally { this.rollRarity = keep; b.crates = crates; b.opened--; b.sl = sl0; b.sm = sm0; }
    return res;
  },
  give(n, t) { const b = this.bag(), k = CRATE_T[t || 'neon'].k; b[k] = (b[k] | 0) + n; Store.touch(); this.badge(); },
  badge() { const s = $('bCratesN'); if (s) { const n = this.cnt('basic') + this.cnt('neon') + this.cnt('lim'); s.textContent = n; s.classList.toggle('hidden', !n); } },
  play(t) { t = t || 'neon'; const res = this.openT(t); if (!res) { Aud.sfx('deny'); return; } res.t = t; Aud.init && Aud.init(); CrateFilm.run(res, () => this.reveal(res)); },
  render() {
    const box = $('cx43Box'); if (!box) return; box.textContent = ''; const d = Store.data, b = this.bag(); $('cx43Cr').textContent = fmtNum(d.credits) + ' CR';
    for (const t of ['basic', 'neon', 'lim']) {
      const T = CRATE_T[t], n = this.cnt(t), p = el('div', 'panel cr-hero cr-' + t); p.style.setProperty('--crc', T.c);
      const cv = document.createElement('canvas'); cv.width = cv.height = 220; cv.className = 'cr-ic'; CratePre.drawBox(cv.getContext('2d'), 220, T.c, t); p.appendChild(cv);
      const hi = el('div', 'col'); hi.style.gap = '6px'; hi.appendChild(el('div', 'eyebrow', lt(T.n)));
      if (t === 'lim') { const f = WEAPONS.find(w => w.id === this.featured()); const fl = el('div', 'cr-feat'); fl.appendChild(el('b', '', lt(f.name))); fl.appendChild(el('span', 'small', ltf('IN THE SHOP FOR {0} MORE DAYS', this.leftDays()) + (d.owned[f.id] ? ' · ' + lt('OWNED') : ''))); hi.appendChild(fl); }
      hi.appendChild(el('b', 'cr-n', '× ' + n));
      const op = el('button', 'btn pri', lt('OPEN')); op.disabled = n <= 0; op.onclick = () => this.play(t);
      const buy = el('button', 'btn gold', ltf('BUY 1 · {0} CR', fmtNum(T.price))); buy.disabled = d.credits < T.price; buy.onclick = () => { if (d.credits < T.price) { Aud.sfx('deny'); return; } d.credits -= T.price; this.give(1, t); Aud.sfx('buy'); this.render(); };
      const row = el('div', 'row'); row.appendChild(op); row.appendChild(buy); hi.appendChild(row);
      const od = el('div', 'cr-odds'); RAR.forEach((R0, i) => { const s = el('span', '', T.odds[i] + '%'); s.style.color = R0.c; s.title = lt(R0.n); od.appendChild(s); }); hi.appendChild(od);
      hi.appendChild(el('div', 'small mute', t === 'basic' ? lt('Cheap. Mostly small things, a very small chance of the best.') : t === 'neon' ? ltf('LEGENDARY or better in at most {0} crates', PITY_LEG - b.sl) : lt('Same odds as NEON. A LEGENDARY or MYTHIC pull may be the limited blade.')));
      p.appendChild(hi); box.appendChild(p);
    }
    const mat = el('div', 'panel'); mat.appendChild(el('div', 'eyebrow', lt('MATERIALS')));
    mat.appendChild(el('div', 'cr-matl', '◆ ' + ltf('{0} CORES', b.cores) + '   ◈ ' + ltf('{0} PRISMS', b.prisms) + '   ✦ ' + ltf('{0} SHARDS', b.shards) + '   ⚒ ' + ltf('{0} RELIC PIECES', b.relic | 0))); box.appendChild(mat);
    const fg = el('div', 'panel'); fg.appendChild(el('div', 'eyebrow', lt('THE FORGE'))); fg.appendChild(el('div', 'small mute', lt('LEGENDARY and MYTHIC blades come only from crates or the forge.')));
    const list = WEAPONS.filter(w => w.cost > 0 && !w.ev && itemTier('w', w.id) >= 4 && !d.owned[w.id]);
    for (const w of list) { const t = itemTier('w', w.id), cost = FORGE_COST[t], row = el('div', 'cr-forge'); const nm = el('span', 'col'); nm.style.gap = '0'; nm.appendChild(el('b', '', lt(w.name))); const tc = el('span', 'small', lt(TIERS[t].n)); tc.style.color = TIERS[t].c; nm.appendChild(tc); row.appendChild(nm);
      const fb = el('button', 'btn', '✦ ' + fmtNum(cost)); fb.disabled = b.shards < cost; fb.onclick = () => { if (b.shards < cost) { Aud.sfx('deny'); return; } b.shards -= cost; d.owned[w.id] = 1; Store.touch(); Store.flush && Store.flush(true); this.reveal({ r: t - 1, item: { tab: 'blades', id: w.id, name: w.name }, cr: 0, cores: 0, prisms: 0, shards: 0, forged: 1 }); }; row.appendChild(fb); fg.appendChild(row); }
    if (!d.owned.worldeater) { const row = el('div', 'cr-forge'); const nm = el('span', 'col'); nm.style.gap = '0'; nm.appendChild(el('b', '', lt('WORLD-EATER'))); nm.appendChild(el('span', 'small mute', ltf('Restore 3 broken relic pieces ({0}/3) · 60 ◆ · 8 ◈', b.relic | 0))); row.appendChild(nm);
      const ok = (b.relic | 0) >= 3 && b.cores >= 60 && b.prisms >= 8, fb = el('button', 'btn', lt('RESTORE')); fb.disabled = !ok; fb.onclick = () => { if (!ok) { Aud.sfx('deny'); return; } b.relic -= 3; b.cores -= 60; b.prisms -= 8; d.owned.worldeater = 1; Store.touch(); Store.flush && Store.flush(true); this.reveal({ r: 4, item: { tab: 'blades', id: 'worldeater', name: 'WORLD-EATER' }, cr: 0, cores: 0, prisms: 0, shards: 0, forged: 1 }); }; row.appendChild(fb); fg.appendChild(row); }
    box.appendChild(fg);
    const how = el('div', 'panel small mute'); how.appendChild(el('div', 'eyebrow', lt('WHERE CRATES COME FROM'))); for (const t of ['Every rank up', 'Every step of the star road', 'The boss of the week', 'A rare drop at the end of stages and runs', 'The World Boss']) how.appendChild(el('div', '', '▸ ' + lt(t))); box.appendChild(how);
  }
});
{ // the reveal says LIMITED, and spins rays in the rarity color
  const rv0 = Crates.reveal.bind(Crates);
  Crates.reveal = function (res) { rv0(res); const ov = document.querySelectorAll('.cr-rev'), last = ov[ov.length - 1]; if (!last) return; const card = last.querySelector('.card'), c = RAR[res.r].c; card.style.setProperty('--rc', c);
    const rays = el('div', 'cr-rays'); rays.style.setProperty('--rc', c); last.insertBefore(rays, card); if (res.lim) { const e = card.querySelector('.eyebrow'); if (e) e.textContent = lt('LIMITED') + ' · ' + lt(RAR[res.r].n); }
    if (res.t && !res.forged) { const old = [...card.querySelectorAll('.btn.pri')].find(b => /\(/.test(b.textContent)); if (old) old.remove(); const t = res.t, n = Crates.cnt(t), row = card.querySelector('.row');
      if (n > 0 && row) { const again = el('button', 'btn pri', ltf('OPEN ANOTHER ({0})', n)); again.onclick = () => { last.remove(); Crates.play(t); }; row.insertBefore(again, row.firstChild); } } };
  // rewards keep giving neon crates; the old counter is the neon one
  const sc0 = Crates.screen.bind(Crates); Crates.screen = function () { sc0(); };
}
/* ---------- the crate before the film ---------- */
const CratePre = {
  drawBox(g, S, c, t, crack, glowC, lid) { // the crate in its type's color: crack 0..1 lights the seams, lid lifts it off
    g.save(); g.clearRect(0, 0, S, S); g.translate(S / 2, S / 2 + 10 * S / 220); const k = S / 220, gc = glowC || c;
    if (crack > 0) { const gr = g.createRadialGradient(0, 0, 10 * k, 0, 0, 140 * k); gr.addColorStop(0, hexA(gc, .55 * crack)); gr.addColorStop(1, hexA(gc, 0)); g.fillStyle = gr; g.fillRect(-S, -S, S * 2, S * 2); }
    g.shadowColor = c; g.shadowBlur = 20 * k; g.fillStyle = t === 'lim' ? '#2a1a06' : t === 'basic' ? '#1a1f2c' : '#141a38'; g.strokeStyle = c; g.lineWidth = 4 * k;
    g.beginPath(); g.moveTo(-80 * k, -30 * k); g.lineTo(0, -70 * k); g.lineTo(80 * k, -30 * k); g.lineTo(80 * k, 60 * k); g.lineTo(0, 100 * k); g.lineTo(-80 * k, 60 * k); g.closePath(); g.fill(); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = crack > 0 ? gc : (t === 'lim' ? '#ff2b5e' : '#ff2bd6'); g.lineWidth = (3 + crack * 3) * k; if (crack > 0) { g.shadowColor = gc; g.shadowBlur = 20 * k * crack; }
    g.beginPath(); g.moveTo(-80 * k, -30 * k); g.lineTo(0, 10 * k); g.lineTo(80 * k, -30 * k); g.moveTo(0, 10 * k); g.lineTo(0, 100 * k); g.stroke();
    if (crack > .2) { g.beginPath(); g.moveTo(-40 * k, 30 * k); g.lineTo(-25 * k, 55 * k); g.lineTo(-45 * k, 70 * k); g.moveTo(40 * k, 25 * k); g.lineTo(55 * k, 50 * k); g.lineTo(38 * k, 74 * k); g.stroke(); }
    g.shadowBlur = 0; const ly = -(lid || 0) * 140 * k; g.save(); g.translate(0, ly); g.rotate((lid || 0) * .6);
    g.fillStyle = t === 'lim' ? '#3a2408' : '#1c2450'; g.strokeStyle = c; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(-86 * k, -34 * k); g.lineTo(0, -78 * k); g.lineTo(86 * k, -34 * k); g.lineTo(0, 8 * k); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = t === 'lim' ? '#ffb000' : '#ffd23f'; g.beginPath(); g.moveTo(0, -48 * k); g.lineTo(22 * k, -36 * k); g.lineTo(0, -24 * k); g.lineTo(-22 * k, -36 * k); g.closePath(); g.fill(); g.restore(); g.restore();
  },
  run(res, done) { // land, shake, light climbing through the rarity colors, burst
    const ov = el('div', 'cr-film'), cv = document.createElement('canvas'); ov.appendChild(cv); document.body.appendChild(ov);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d');
    const box = document.createElement('canvas'), BS = Math.round(Math.min(W, H) * .62 * dpr); box.width = box.height = BS; const bg = box.getContext('2d');
    const T = CRATE_T[res.t || 'neon'], steps = RAR.slice(0, res.r + 1).map(x => x.c), dur = 1.3 + res.r * .28; let t = 0, last = performance.now(), end = false, tick = -1;
    const finish = () => { if (end) return; end = true; ov.remove(); done(); }; ov.addEventListener('click', () => { if (t > .3) finish(); });
    const step = now => { if (end) return; const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; t += dt;
      const u = t / dur, land = Math.min(1, t / .35), y = (1 - (1 - Math.pow(1 - land, 3))) * -H * .6, sh = t > .35 ? Math.pow(Math.min(1, (t - .35) / (dur - .5)), 2) * 18 * dpr : 0;
      const ci = Math.min(steps.length - 1, Math.floor(Math.max(0, (t - .45) / Math.max(.2, (dur - .7) / steps.length)))), col = steps[Math.max(0, ci)], crack = t > .45 ? Math.min(1, (t - .45) / (dur - .7)) : 0;
      if (ci !== tick && t > .45) { tick = ci; try { Aud.sfx(ci >= 3 ? 'warn' : 'tick'); } catch (e) { } }
      const lid = u > .88 ? (u - .88) / .12 : 0;
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#04050c'; g.fillRect(0, 0, cv.width, cv.height);
      if (crack > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cv.width / 2, cv.height / 2); g.rotate(t * .8); for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.fillStyle = hexA(col, .08 * crack); g.beginPath(); g.moveTo(0, 0); g.lineTo(cv.width, -60 * dpr); g.lineTo(cv.width, 60 * dpr); g.closePath(); g.fill(); } g.restore(); }
      this.drawBox(bg, BS, T.c, res.t || 'neon', crack, col, lid);
      g.drawImage(box, (cv.width - BS) / 2 + (Math.random() - .5) * sh, (cv.height - BS) / 2 + y + (Math.random() - .5) * sh);
      if (land >= 1 && t < .5) { g.strokeStyle = hexA(T.c, 1 - (t - .35) / .15); g.lineWidth = 4 * dpr; g.beginPath(); g.ellipse(cv.width / 2, cv.height / 2 + BS * .42, BS * .5 * (1 + (t - .35) * 4), BS * .12 * (1 + (t - .35) * 4), 0, 0, TAU); g.stroke(); }
      if (lid > 0) { g.fillStyle = hexA('#ffffff', Math.min(1, lid * 1.4)); g.fillRect(0, 0, cv.width, cv.height); }
      if (t >= dur) { try { Aud.sfx('boom'); } catch (e) { } return finish(); } requestAnimationFrame(step); };
    try { Aud.sfx('coin'); } catch (e) { } requestAnimationFrame(step);
  }
};
{ const fr0 = CrateFilm.run.bind(CrateFilm); CrateFilm.run = function (res, done) { CratePre.run(res, () => fr0(res, done)); }; }

/* ---------- your own hero ---------- */
const HCLASS = [
  { id: 'ninja', n: 'NINJA', c: '#00f2fe', body: 'ninja', d: 'Speed and dashes.', ab: [['SWIFT', '+1 dash charge'], ['QUICK RECOVERY', 'Dash charges recharge 15% faster'], ['KEEN EYE', '+10% critical chance'], ['SHADOW FLOW', '+1 more dash charge']] },
  { id: 'samurai', n: 'SAMURAI', c: '#ff0844', body: 'shogun', d: 'Raw power and armor.', ab: [['IRON CUT', '+30% damage'], ['ARMOR', '+1 shield'], ['IAI', 'Perfect-parry window +50%'], ['WARLORD', '+20% more damage']] },
  { id: 'shinobi', n: 'SHINOBI', c: '#c45bff', body: 'shinobi2', d: 'Untouchable in the shadows.', ab: [['VANISH', 'Every dash makes you untouchable for 0.35 s'], ['ASSASSIN', '+15% critical chance'], ['LONG REACH', '+20% reach'], ['SHADOW REFUND', 'Every 4th kill refunds a dash charge']] },
  { id: 'onmyoji', n: 'ONMYOJI', c: '#ffd23f', body: 'witch', d: 'Spirit magic.', ab: [['SPIRIT ORBS', 'Every 5th kill throws 2 spirit orbs'], ['WARD', '+1 shield'], ['ORB STORM', 'Spirit orbs come in threes'], ['OVERFLOW', 'Overdrive charges 30% faster']] }
];
const HLV = [0, 300, 900, 2000], HCOLS = ['#00f2fe', '#ff0844', '#ffd23f', '#00ff88', '#c45bff', '#ff2bd6', '#ff9a3d', '#ffffff', '#4d7cff', '#14141e'];
const HRANGE = { short: 'daggers', mid: 'katana', long: 'spear' };
const Hero = {
  f() { const d = Store.data; if (!d.forge || typeof d.forge !== 'object') d.forge = { cls: 'ninja', body: 'ninja', a: '#00f2fe', b: '#ff0844', xp: {}, w: { range: 'mid', edge: 0, grip: 0, core: 0 }, raid: 1 }; return d.forge; },
  cls() { return HCLASS.find(c => c.id === this.f().cls) || HCLASS[0]; },
  lvl(id) { const x = (this.f().xp[id || this.f().cls] | 0); let L = 0; for (let i = 0; i < HLV.length; i++) if (x >= HLV[i]) L = i + 1; return L; },
  weapon() { const f = this.f(), w = f.w, base = WEAPONS.find(q => q.id === HRANGE[w.range]) || WEAPONS[0];
    return Object.assign({}, base, { dmg: +(base.dmg * (1 + .06 * w.edge)).toFixed(3), ch: base.ch + Math.floor(w.grip / 2), crit: +(base.crit + .025 * w.core).toFixed(3), name: lt(['SHORT', 'MID', 'LONG'][['short', 'mid', 'long'].indexOf(w.range)]) + ' · ' + lt('FORGED BLADE') }); },
  partCost(n) { return [8 * (n + 1), n >= 3 ? n - 2 : 0]; },
  apply() { // after the normal loadout: the hero's look, weapon and class
    const f = this.f(), L = this.lvl(), c = f.cls, w = this.weapon(), base = P.w;
    P.w = w; P.maxCh += w.ch - base.ch; P.rc *= 1 - .03 * f.w.grip;
    P.skin = { id: 'forge', name: 'YOUR HERO', body: f.body, a: f.a, b: f.b }; P.ca = f.a; P.cb = f.b;
    if (c === 'ninja') { if (L >= 1) P.maxCh += 1; if (L >= 2) P.rc *= .85; if (L >= 3) P.critAdd += .1; if (L >= 4) P.maxCh += 1; }
    if (c === 'samurai') { if (L >= 1) P.dmgMul *= 1.3; if (L >= 2) P.maxHp += 1; if (L >= 3) P.pwMax *= 1.5; if (L >= 4) P.dmgMul *= 1.2; }
    if (c === 'shinobi') { if (L >= 2) P.critAdd += .15; if (L >= 3) P.reach *= 1.2; }
    if (c === 'onmyoji') { if (L >= 2) P.maxHp += 1; if (L >= 4) P.odMul *= 1.3; }
    this.kN = 0; this.seq = -1;
  },
  onKill(e) {
    const f = this.f(), L = this.lvl(); this.kN = (this.kN | 0) + 1;
    if (f.cls === 'shinobi' && L >= 4 && this.kN % 4 === 0 && P.ch < P.maxCh) P.ch++;
    if (f.cls === 'onmyoji' && L >= 1 && this.kN % 5 === 0) { let tg = null, bd = 1e9; for (let i = 0; i < EN.n; i++) { const q = EN.a[i]; if (!q.alive || q === e) continue; const dd = (q.x - P.x) ** 2 + (q.y - P.y) ** 2; if (dd < bd) { bd = dd; tg = q; } }
      const a0 = tg ? Math.atan2(tg.y - P.y, tg.x - P.x) : P.face, n = L >= 3 ? 3 : 2; for (let i = 0; i < n; i++) shard(P.x, P.y, a0 + (i - (n - 1) / 2) * .28, 560, '#ffd23f', P.w.dmg * P.dmgMul * .9); }
  },
  onStep() { if (this.f().cls === 'shinobi' && P.seq !== this.seq) { if (this.seq >= 0 && P.seq > this.seq) P.inv = Math.max(P.inv, .35); this.seq = P.seq; } },
  give(xp) { const f = this.f(), was = this.lvl(); f.xp[f.cls] = (f.xp[f.cls] | 0) + xp; Store.touch(); return this.lvl() > was; },
  /* the HERO FORGE screen */
  screen() {
    let sc = $('s-forge');
    if (!sc) { sc = el('section', 'scr hidden'); sc.id = 's-forge'; const col = el('div', 'col'); col.appendChild(el('h2', '', '')); const box = el('div', 'col'); box.id = 'hfBox'; col.appendChild(box);
      const bk = el('button', 'btn ghost', ''); bk.id = 'hfBack'; bk.onclick = () => { Aud.sfx('back'); UI.openTitle(); }; col.appendChild(bk); sc.appendChild(col); $('ov').appendChild(sc); }
    G.state = 'MENU'; UI.backFn = () => UI.openTitle(); UI.show('forge'); sc.querySelector('h2').textContent = lt('HERO FORGE'); $('hfBack').textContent = lt('BACK'); this.render(); this.loop();
  },
  loop() { if (this.raf) return; let last = performance.now(); const f = now => { if (UI.cur !== 'forge') { this.raf = 0; return; } this.t = (this.t || 0) + Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; this.drawPrev(); this.raf = requestAnimationFrame(f); }; this.raf = requestAnimationFrame(f); },
  drawPrev() {
    const cv = $('hfCv'); if (!cv) return; const g = cv.getContext('2d'), S = cv.width, f = this.f(), C = this.cls(), t = this.t || 0;
    g.setTransform(1, 0, 0, 1, 0, 0); const bg = g.createLinearGradient(0, 0, 0, S * .55); bg.addColorStop(0, '#0a0e26'); bg.addColorStop(1, '#05060f'); g.fillStyle = bg; g.fillRect(0, 0, S, cv.height);
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(S / 2, cv.height * .62, 10, S / 2, cv.height * .62, S * .45); gr.addColorStop(0, hexA(C.c, .35)); gr.addColorStop(1, hexA(C.c, 0)); g.fillStyle = gr; g.fillRect(0, 0, S, cv.height);
    g.strokeStyle = hexA(C.c, .6); g.lineWidth = 3; g.beginPath(); g.ellipse(S / 2, cv.height * .62, S * .3, S * .08, 0, 0, TAU); g.stroke(); g.restore();
    const o = this.o || (this.o = Object.assign({}, HO)); heroSetSkin(o, { body: f.body, a: f.a, b: f.b }); o.w = HRANGE[f.w.range]; o.fx = null; o.alpha = 1; o.sx = o.sy = 1; o.hot = 0; o.od = 0; o.bl = 52 + (f.w.range === 'long' ? 14 : f.w.range === 'short' ? -10 : 0);
    const k = S / 140, sw = (t % 2.4) < .35, face = -Math.PI / 2 + Math.sin(t * .7) * .5; o.x = 0; o.y = 0; o.face = o.mvA = face; o.spd = 0; o.ph = t * 8; o.dashing = sw; o.blade = sw ? face + Math.sin((t % 2.4) / .35 * Math.PI) * 2.4 - 1.2 : face + 1.8 + Math.sin(t * 2) * .15; o.t = t;
    g.save(); g.translate(S / 2, cv.height * .58); g.scale(k * 2.2, k * 2.2); withCtx(g, () => drawHero(o)); g.restore();
  },
  render() {
    const box = $('hfBox'); if (!box) return; box.textContent = ''; const f = this.f(), C = this.cls(), L = this.lvl(), b = Crates.bag(), d = Store.data;
    const pv = el('div', 'panel hf-prev'); const cv = document.createElement('canvas'); cv.id = 'hfCv'; cv.width = 560; cv.height = 360; pv.appendChild(cv);
    const tag = el('div', 'hf-tag'); const cn = el('b', '', lt(C.n)); cn.style.color = C.c; tag.appendChild(cn); tag.appendChild(el('span', 'small', ltf('CLASS LEVEL {0}/4', L))); pv.appendChild(tag); box.appendChild(pv);
    // class
    const cp = el('div', 'panel'); cp.appendChild(el('div', 'eyebrow', lt('CLASS'))); const grid = el('div', 'hf-cls');
    for (const c of HCLASS) { const bt = el('button', 'item' + (c.id === f.cls ? ' on' : '')); bt.style.setProperty('--cc', c.c); const nm = el('span', 'nm', lt(c.n)); nm.style.color = c.c; bt.appendChild(nm); bt.appendChild(el('span', 'pr', ltf('LV {0}', this.lvl(c.id)))); bt.appendChild(el('span', 'ds', lt(c.d)));
      bt.onclick = () => { Aud.sfx('ui'); f.cls = c.id; if (!f.custom) { f.body = c.body; f.a = c.c; } Store.touch(); this.render(); }; grid.appendChild(bt); }
    cp.appendChild(grid);
    const xpN = f.xp[f.cls] | 0, nx = HLV[Math.min(3, L)]; const ab = el('div', 'hf-ab');
    C.ab.forEach((a, i) => { const on = L >= i + 1, r = el('div', 'hf-a' + (on ? ' on' : '')); r.appendChild(el('b', '', (on ? '✓ ' : '🔒 ') + lt(a[0]))); r.appendChild(el('span', 'small', lt(a[1]) + (on ? '' : ' · ' + ltf('{0} XP', fmtNum(HLV[i]))))); ab.appendChild(r); });
    cp.appendChild(ab); if (L < 4) cp.appendChild(el('div', 'small mute', ltf('{0} / {1} XP · earned in HERO TRIALS and the WORLD BOSS', fmtNum(xpN), fmtNum(nx)))); box.appendChild(cp);
    // look
    const lk = el('div', 'panel'); lk.appendChild(el('div', 'eyebrow', lt('LOOK'))); const bodies = Object.keys(BODY), bi = Math.max(0, bodies.indexOf(f.body));
    const br = el('div', 'hf-row'); const pb = el('button', 'btn', '‹'), nb = el('button', 'btn', '›'); const bn = el('b', '', lt('BODY') + ' ' + (bi + 1) + '/' + bodies.length);
    pb.onclick = () => { f.body = bodies[(bi - 1 + bodies.length) % bodies.length]; f.custom = 1; Store.touch(); this.render(); }; nb.onclick = () => { f.body = bodies[(bi + 1) % bodies.length]; f.custom = 1; Store.touch(); this.render(); };
    br.appendChild(pb); br.appendChild(bn); br.appendChild(nb); lk.appendChild(br);
    for (const [key, lab] of [['a', 'MAIN COLOR'], ['b', 'ACCENT']]) { lk.appendChild(el('div', 'small mute', lt(lab))); const sw = el('div', 'cols'); for (const c of HCOLS) { const s = el('button', f[key] === c ? 'on' : ''); s.style.background = c; s.setAttribute('aria-label', c); s.onclick = () => { f[key] = c; f.custom = 1; Store.touch(); this.render(); }; sw.appendChild(s); } lk.appendChild(sw); }
    box.appendChild(lk);
    // weapon
    const wp = el('div', 'panel'); wp.appendChild(el('div', 'eyebrow', lt('WEAPON WORKSHOP'))); const seg = el('div', 'seg'); seg.style.gridTemplateColumns = 'repeat(3,1fr)';
    for (const r of ['short', 'mid', 'long']) { const bt = el('button', f.w.range === r ? 'on' : '', lt({ short: 'SHORT RANGE', mid: 'MID RANGE', long: 'LONG RANGE' }[r])); bt.onclick = () => { Aud.sfx('ui'); f.w.range = r; Store.touch(); this.render(); }; seg.appendChild(bt); }
    wp.appendChild(seg); const W = this.weapon(); wp.appendChild(el('div', 'small', ltf('DMG {0} · CHARGES {1} · CRIT {2}%', W.dmg, W.ch, Math.round(W.crit * 100))));
    for (const [k, nm, ds] of [['edge', 'EDGE', '+6% damage per level'], ['grip', 'GRIP', '+1 charge every 2 levels, faster recharge'], ['core', 'CORE', '+2.5% critical chance per level']]) {
      const n = f.w[k], [cc, pp] = this.partCost(n), row = el('div', 'cr-forge'); const tx = el('span', 'col'); tx.style.gap = '0'; tx.appendChild(el('b', '', lt(nm) + ' ' + n + '/5')); tx.appendChild(el('span', 'small mute', lt(ds))); row.appendChild(tx);
      const ok = n < 5 && b.cores >= cc && b.prisms >= pp, bt = el('button', 'btn', n >= 5 ? lt('MAX') : cc + ' ◆' + (pp ? ' · ' + pp + ' ◈' : '')); bt.disabled = !ok;
      bt.onclick = () => { if (!ok) { Aud.sfx('deny'); return; } b.cores -= cc; b.prisms -= pp; f.w[k]++; Store.touch(); Aud.sfx('buy'); this.render(); }; row.appendChild(bt); wp.appendChild(row); }
    wp.appendChild(el('div', 'small mute', '◆ ' + b.cores + '  ◈ ' + b.prisms)); box.appendChild(wp);
    // play
    const play = el('button', 'btn pri', lt('PLAY HERO TRIALS')); play.onclick = () => { Aud.sfx('ui'); Flow.startArcade('trials'); }; box.appendChild(play);
    box.appendChild(WBoss.card());
    const rr = el('div', 'set'); rr.appendChild(el('span', '', lt('Use my hero in live raids'))); const tg = el('button', 'tog' + (f.raid ? ' on' : ''), lt(f.raid ? 'ON' : 'OFF')); tg.onclick = () => { f.raid = f.raid ? 0 : 1; Store.touch(); this.render(); }; rr.appendChild(tg); box.appendChild(rr);
  }
};
/* ---------- the World Boss ---------- */
const WBoss = {
  cur: null,
  open() { const g = new Date().getUTCDay(); return g === 4 || g === 5 || g === 6 || g === 0; },
  boss() { const BS = Journey.bossStages(); return BS[(Journey.week() * 7 + 3) % BS.length]; },
  card() {
    const B = this.boss(), info = BOSS_INFO[B.id], on = this.open(), d = Store.data, b = Crates.bag(), p = el('div', 'panel evbanner wb44'); p.style.setProperty('--ec', '#ff2b5e');
    p.appendChild(el('span', 'evic', '☠')); const x = el('span', 'evtx'); x.appendChild(el('b', '', lt('WORLD BOSS') + ': ' + lt(info ? info.name : B.s.name)));
    x.appendChild(el('span', 'small mute', on ? lt('Open now until Sunday. Much more health. Fight it with your hero.') : lt('Opens on Thursday. Thursday to Sunday every week.')));
    x.appendChild(el('span', 'small', lt('Drops: materials · broken relic pieces (3 restore the WORLD-EATER) · the WORLD-EATER hero (very rare)') + ' · ⚒ ' + (b.relic | 0) + '/3'));
    p.appendChild(x); const bt = el('button', 'chip gold', on ? lt('FIGHT') : lt('CLOSED')); p.appendChild(bt);
    p.onclick = () => { if (!on) { Aud.sfx('deny'); toastDom(lt('The World Boss opens on Thursday.')); return; } Aud.sfx('ui'); this.start(); }; void d; return p;
  },
  start() { const B = this.boss(), s = B.s; if (!s) return; Aud.init(); Flow.dop = null; Flow.sr = null; Legend.cur = null; this.cur = { id: B.id }; Flow.last = { mode: 'story', idx: s.idx }; Flow.endT = 0; REC.on = false;
    Director.begin('story', s); G.cine = null; G.freeze = 0; Flow.enterPlay(); G.cine = { k: 'stage', t: 0, d: 1.6 }; G.freeze = 1.6; FX.call(lt('WORLD BOSS'), '#ff2b5e', 3, 28); },
  drops(o) { // a cleared world boss (alone or in a raid)
    const d = Store.data, b = Crates.bag(), notes = []; const n = 6 + Math.floor(Math.random() * 6); b.cores += n; notes.push('+' + n + ' ◆'); const pz = 1 + (Math.random() < .5 ? 1 : 0); b.prisms += pz; notes.push('+' + pz + ' ◈');
    if (Math.random() < .12) { b.relic = (b.relic | 0) + 1; notes.push(lt('BROKEN RELIC PIECE') + ' ⚒ ' + b.relic + '/3'); }
    if (!d.skins.worldeater_s && Math.random() < .04) { d.skins.worldeater_s = 1; notes.push(lt('WORLD-EATER HERO!')); Journey.card(lt('VERY RARE DROP'), lt('WORLD-EATER'), [lt('A hero only the World Boss drops')], '#ff2b5e'); }
    const wk = Journey.week(); if (d.wbCrate !== wk) { d.wbCrate = wk; b.crates++; notes.push('+1 ' + lt('CRATE')); }
    Store.touch(); Store.flush && Store.flush(true); o.notes = o.notes || []; o.notes.push({ t: lt('WORLD BOSS') + ': ' + notes.join(' · '), c: 'gold' });
  }
};
{
  /* the new mode and the hooks (all gated on your own hero: nothing changes for anything else) */
  MODES.push({ id: 'trials', name: 'HERO TRIALS', desc: 'Endless train cars with your own hero, class and weapon.', mp: 1 });
  for (const k of ['startStory', 'startArcade', 'startSpeedrun', 'startPuzzle', 'startDailyOp', 'startLegend']) if (Flow[k]) { const f0 = Flow[k].bind(Flow); Flow[k] = function () { WBoss.cur = null; return f0.apply(this, arguments); }; }
  const db0 = Director.begin.bind(Director);
  Director.begin = function (mode, stage) {
    const wb = !!(WBoss.cur && mode === 'story' && stage && stage.obj && stage.obj.b === WBoss.cur.id && !REPLAY.on);
    G.hero = !REPLAY.on && (mode === 'trials' || wb || (mode === 'raid' && Hero.f().raid)) ? 1 : 0; G.wboss = wb || (mode === 'raid' && WBoss.open() && G.hero) ? 1 : 0;
    const r = db0(mode, stage); G.hero = !REPLAY.on && (mode === 'trials' || wb || (mode === 'raid' && Hero.f().raid)) ? 1 : 0; G.wboss = wb || (mode === 'raid' && WBoss.open() && G.hero) ? 1 : 0;
    if (wb) { G.diff = Object.assign({}, G.diff, { bhp: G.diff.bhp * 2.6, ehp: G.diff.ehp * 1.25, fire: G.diff.fire * 1.15 }); G.scoreMul *= 2; }
    return r;
  };
  const al0 = applyLoadout; applyLoadout = function () { al0(); if (G.hero && !REPLAY.on) { try { Hero.apply(); } catch (e) { errLog(e); } } };
  const ke0 = killEnemy; killEnemy = function (e, a, src) { const was = e && e.alive; const r = ke0(e, a, src); if (G.hero && was && !REPLAY.on) { try { Hero.onKill(e); } catch (er) { errLog(er); } } return r; };
  const ss0 = safeStep; safeStep = function () { const r = ss0(); if (G.hero && !REPLAY.on && G.state === 'PLAY') { try { Hero.onStep(); } catch (e) { errLog(e); } } return r; };
  const or3 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    try { if (o && !o.heroDone && G.hero) { o.heroDone = 1; const clear = G.state === 'CLEAR', xp = (G.kills | 0) * 3 + ((G.seqCar | 0) * 40) + (clear ? 200 : 0) + (G.wboss && clear ? 400 : 0);
        o.notes = o.notes || []; if (Hero.give(xp)) o.notes.push({ t: lt('CLASS LEVEL UP') + ' · ' + lt(Hero.cls().n) + ' ' + Hero.lvl() + '/4', c: 'gold' }); else o.notes.push({ t: '+' + fmtNum(xp) + ' ' + lt('CLASS XP'), c: 'gold' });
        if (G.wboss && clear) WBoss.drops(o); } } catch (e) { errLog(e); }
    return or3(o);
  };
  const fin1 = Flow.finishStory.bind(Flow); Flow.finishStory = function () { if (!G.wboss) return fin1(); const s = G.stage, keep = s.post; s.post = []; try { fin1(); } finally { s.post = keep; } };
  // the arsenal: limited and relic blades are never free to claim
  const si1 = UI.shopItems.bind(UI);
  UI.shopItems = function (tab) { const out = si1(tab), d = Store.data;
    if (tab === 'blades') for (const it of out) { const w = WEAPONS.find(q => q.id === it.id); if (w && (w.lim || w.relic) && !d.owned[it.id]) { it.state = 'lock'; it.can = false; it.lock = lt(w.lim ? 'Only from the LIMITED crate' : 'Restore 3 broken relic pieces from the World Boss'); } }
    if (tab === 'heroes') for (const it of out) if (it.id === 'worldeater_s' && !d.skins.worldeater_s) { it.state = 'lock'; it.can = false; it.lock = lt('A very rare World Boss drop'); }
    return out; };
  const ut1 = unlockText; unlockText = function (u) { if (u && u.t === 'feat' && u.id === 'wbskin') return lt('A very rare World Boss drop'); return ut1(u); };
  // the nav bar gets the forge; old neon crates counted as before
  const ot3 = UI.openTitle.bind(UI);
  UI.openTitle = function () { if (!$('bForge')) { const b = el('button', 'btn'); b.id = 'bForge'; b.type = 'button'; b.innerHTML = '<svg class="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l7-7 M13 11l7-7 M14 4h6v6 M6 14l4 4 M3 21l3-3"/></svg>'; b.appendChild(el('span', '', '')); b.onclick = () => { Aud.sfx('ui'); Hero.screen(); }; const row = $('tNavRow'); if (row) row.appendChild(b); else document.body.appendChild(b); }
    $('bForge').lastChild.textContent = lt('HERO FORGE'); return ot3.apply(this, arguments); };
  const css = document.createElement('style'); css.id = 'v44css';
  css.textContent = `
.cr-hero { --crc: #00f2fe; border-color: color-mix(in srgb, var(--crc) 50%, transparent); } .cr-hero .row .btn { min-height: 46px; font-size: 14px; }
.cr-lim { background: linear-gradient(135deg, rgba(255, 176, 0, .16), rgba(10, 12, 30, .9) 60%); box-shadow: 0 0 26px rgba(255, 176, 0, .25); }
.cr-feat { display: flex; flex-direction: column; } .cr-feat b { font: italic 700 18px var(--fd); color: #ffb000; text-shadow: 0 0 12px rgba(255, 176, 0, .6); }
.cr-odds { display: flex; gap: 8px; font: 700 12px var(--fm); flex-wrap: wrap; } .cr-matl { font: 14px var(--fm); line-height: 1.8; }
.cr-rays { position: absolute; inset: -50%; pointer-events: none; background: repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--rc) 30%, transparent) 0 8deg, transparent 8deg 22deg); animation: crSpin 9s linear infinite;
  -webkit-mask: radial-gradient(circle at 50% 50%, #000 0, #000 18%, transparent 52%); mask: radial-gradient(circle at 50% 50%, #000 0, #000 18%, transparent 52%); }
.cr-rev .card { position: relative; z-index: 1; } @keyframes crSpin { to { transform: rotate(360deg); } }
.hf-prev { position: relative; padding: 0; overflow: hidden; } .hf-prev canvas { display: block; width: 100%; height: auto; aspect-ratio: 560 / 360; }
.hf-tag { position: absolute; top: 10px; inset-inline-start: 12px; display: flex; flex-direction: column; } .hf-tag b { font: italic 700 22px var(--fd); text-shadow: 0 0 12px currentColor; }
.hf-cls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; } .hf-cls .item { border-color: color-mix(in srgb, var(--cc) 40%, transparent); } .hf-cls .item.on { box-shadow: inset 3px 0 0 var(--cc); border-color: var(--cc); background: color-mix(in srgb, var(--cc) 12%, rgba(11,16,36,.9)); }
.hf-ab { display: flex; flex-direction: column; gap: 6px; margin: 10px 0 6px; } .hf-a { display: flex; flex-direction: column; padding: 7px 10px; border: 1px solid var(--line); clip-path: var(--cut); opacity: .6; } .hf-a.on { opacity: 1; border-color: var(--gold); } .hf-a b { font: 700 14px var(--fd); }
.hf-row { display: grid; grid-template-columns: 52px 1fr 52px; gap: 8px; align-items: center; text-align: center; margin: 6px 0 10px; } .hf-row .btn { min-height: 44px; font-size: 22px; padding: 0; }
.wb44 { cursor: pointer; } .wb44 .evic { font-size: 34px; color: #ff2b5e; }
@media (prefers-reduced-motion: reduce) { .cr-rays { animation: none; } }
`; document.head.appendChild(css);
}
