/* =====================================================================
   VERSION 43: CRATES, THE FORGE, EVOLUTION, A NAV BAR, SETTINGS TABS
   · CRATES: five rarities (COMMON 52%, RARE 28%, EPIC 14%, LEGENDARY 5%,
     MYTHIC 1%, odds shown in the game). Every crate gives something you do
     not own yet (or credits and materials). A pity counter guarantees a
     LEGENDARY or better within 30 crates and a MYTHIC within 100. Crates
     are bought with credits earned in the game or won: 3 to start, one per
     rank up, one per star-road step, one for the boss of the week, and a
     rare drop from stages. No real money anywhere.
   · Every rarity has its own opening film: a ninja cuts a fruit (common),
     a bamboo grove (rare), a car (epic), powers up into a giant and cuts a
     truck in half (legendary), splits a whole train car and shatters the
     screen (mythic).
   · LEGENDARY and MYTHIC blades you do not own yet come only from crates
     or the FORGE (shards from crates). Blades you own stay yours, and the
     tiers and prices are unchanged, so every replay stays exact.
   · MATERIALS: cores and rare prisms drop at the end of stages and runs.
   · EVOLUTION: blades and heroes evolve three times (mastery or hero level
     plus materials). Each step adds a look: a brighter blade, sparks on
     every swing, runes around the blade and a golden burst on every kill;
     a stronger aura, rising spirit embers, a halo and a burst on every dash.
     Looks only: the simulation and replays are untouched.
   · The home screen tiles become a nav bar at the bottom you scroll through.
   · Settings are split into tabs.
   ===================================================================== */
const RAR = [{ n: 'COMMON', c: '#e8f0ff' }, { n: 'RARE', c: '#00b4ff' }, { n: 'EPIC', c: '#c45bff' }, { n: 'LEGENDARY', c: '#ffb000' }, { n: 'MYTHIC', c: '#ff2b5e' }];
const RAR_ODDS = [52, 28, 14, 5, 1];
const CRATE_PRICE = 1500, PITY_LEG = 30, PITY_MYTH = 100, FORGE_COST = [0, 0, 0, 0, 300, 800];
const EVO_REQ = [[1, 10, 0], [2, 25, 2], [4, 50, 6]];
const NAV = ['bArcade', 'bArsenal', 'bCrates', 'bForge', 'bDojo', 'bPuzzle', 'bLive', 'bWeekly', 'bSeason', 'bClub', 'bProfile', 'bHideout', 'bEditor', 'bSettings']; // the home screen nav bar, in order (missing buttons are skipped) // level gate (mastery / hero level), cores, prisms
const Crates = {
  bag() { const d = Store.data; if (!d.bag || typeof d.bag !== 'object') d.bag = { crates: 3, opened: 0, sl: 0, sm: 0, shards: 0, cores: 0, prisms: 0 }; return d.bag; },
  pool(r) { // things you do not own yet, of item tier r + 1 (COMMON = tier 1 ... MYTHIC = tier 5)
    const d = Store.data, t = r + 1, out = [], ok = it => it.cost > 0 && !it.ev && it.season == null && !it.unlock;
    for (const w of WEAPONS) if (ok(w) && !d.owned[w.id] && itemTier('w', w.id) === t) out.push({ tab: 'blades', id: w.id, name: w.name });
    for (const s of SKINS) if (ok(s) && !d.skins[s.id] && itemTier('s', s.id) === t) out.push({ tab: 'heroes', id: s.id, name: s.name });
    for (const f of BLADE_FX) if (ok(f) && !d.blades[f.id] && itemTier('f', f.id) === t) out.push({ tab: 'fx', id: f.id, name: f.name });
    for (const p of PETS) if (ok(p) && !(d.pets && d.pets[p.id]) && itemTier('p', p.id) === t) out.push({ tab: 'pets', id: p.id, name: p.name });
    return out;
  },
  rollRarity() {
    const b = this.bag(); if (b.sm >= PITY_MYTH - 1) return 4; let x = Math.random() * 100, r = 0; for (; r < 4; r++) { if (x < RAR_ODDS[r]) break; x -= RAR_ODDS[r]; }
    if (r < 3 && b.sl >= PITY_LEG - 1) r = 3; return r;
  },
  open() {
    const d = Store.data, b = this.bag(); if (b.crates <= 0) return null; b.crates--; b.opened++;
    const r = this.rollRarity(); b.sl = r >= 3 ? 0 : b.sl + 1; b.sm = r >= 4 ? 0 : b.sm + 1;
    const pool = this.pool(r), res = { r, item: null, cr: 0, cores: 0, prisms: 0, shards: 0 };
    if (pool.length && Math.random() < (r >= 3 ? .85 : .6)) { const it = pool[Math.floor(Math.random() * pool.length)]; res.item = it;
      if (it.tab === 'blades') d.owned[it.id] = 1; else if (it.tab === 'heroes') d.skins[it.id] = 1; else if (it.tab === 'fx') d.blades[it.id] = 1; else { d.pets = d.pets || {}; d.pets[it.id] = 1; } }
    else { const C = [[200, 3, 0, 0], [500, 6, 1, 0], [1200, 12, 2, 0], [0, 0, 3, 150], [0, 0, 6, 400]][r]; res.cr = C[0]; res.cores = C[1]; res.prisms = C[2]; res.shards = C[3]; }
    if (r >= 3 && res.item) res.shards = r === 4 ? 60 : 25; // a little forge credit with every big pull
    d.credits += res.cr; b.cores += res.cores; b.prisms += res.prisms; b.shards += res.shards; Store.touch(); Store.flush && Store.flush(true);
    return res;
  },
  give(n) { this.bag().crates += n; Store.touch(); this.badge(); },
  badge() { const s = $('bCratesN'); if (s) { const n = this.bag().crates; s.textContent = n; s.classList.toggle('hidden', !n); } },
  /* ---------- the crates screen ---------- */
  screen() {
    let sc = $('s-crates');
    if (!sc) { sc = el('section', 'scr hidden'); sc.id = 's-crates'; const col = el('div', 'col'); const top = el('div', 'topbar'); top.appendChild(el('h2', '', '')); const ch = el('span', 'chip gold'); ch.id = 'cx43Cr'; top.appendChild(ch); col.appendChild(top);
      const box = el('div', 'col'); box.id = 'cx43Box'; col.appendChild(box); const bk = el('button', 'btn ghost', ''); bk.id = 'cx43Back'; bk.onclick = () => { Aud.sfx('back'); UI.openTitle(); }; col.appendChild(bk); sc.appendChild(col); $('ov').appendChild(sc); }
    G.state = 'MENU'; UI.backFn = () => UI.openTitle(); UI.show('crates'); sc.querySelector('h2').textContent = lt('CRATES'); $('cx43Back').textContent = lt('BACK'); this.render();
  },
  render() {
    const box = $('cx43Box'); if (!box) return; box.textContent = ''; const d = Store.data, b = this.bag(); $('cx43Cr').textContent = fmtNum(d.credits) + ' CR';
    const hero = el('div', 'panel cr-hero'), cv = document.createElement('canvas'); cv.width = cv.height = 220; cv.className = 'cr-ic'; this.drawCrate(cv.getContext('2d'), 220, 3); hero.appendChild(cv);
    const hi = el('div', 'col'); hi.style.gap = '8px'; hi.appendChild(el('div', 'eyebrow', lt('NEON CRATES'))); hi.appendChild(el('b', 'cr-n', '× ' + b.crates));
    const op = el('button', 'btn pri', lt('OPEN')); op.disabled = b.crates <= 0; op.onclick = () => this.play();
    const buy = el('button', 'btn gold', ltf('BUY 1 · {0} CR', fmtNum(CRATE_PRICE))); buy.disabled = d.credits < CRATE_PRICE; buy.onclick = () => { if (d.credits < CRATE_PRICE) { Aud.sfx('deny'); return; } d.credits -= CRATE_PRICE; this.give(1); Aud.sfx('buy'); this.render(); };
    hi.appendChild(op); hi.appendChild(buy); hero.appendChild(hi); box.appendChild(hero);
    const pity = el('div', 'panel small'); pity.appendChild(el('div', '', ltf('LEGENDARY or better in at most {0} crates', PITY_LEG - b.sl))); pity.appendChild(el('div', '', ltf('MYTHIC in at most {0} crates', PITY_MYTH - b.sm))); box.appendChild(pity);
    const odds = el('div', 'panel'); odds.appendChild(el('div', 'eyebrow', lt('ODDS')));
    RAR.forEach((R0, i) => { const row = el('div', 'cr-odd'); const n = el('span', '', lt(R0.n)); n.style.color = R0.c; row.appendChild(n); row.appendChild(el('span', 'mute', RAR_ODDS[i] + '%')); odds.appendChild(row); });
    odds.appendChild(el('div', 'small mute', lt('Every crate gives a blade, hero, blade skin or pet you do not own yet, or credits and materials.'))); box.appendChild(odds);
    const mat = el('div', 'panel'); mat.appendChild(el('div', 'eyebrow', lt('MATERIALS')));
    for (const [k, n, dsc] of [['◆', ltf('{0} CORES', b.cores), lt('Drop from stages and runs. Used to evolve blades and heroes.')], ['◈', ltf('{0} PRISMS', b.prisms), lt('Rare. Drop from stages, legends and big crates.')], ['✦', ltf('{0} SHARDS', b.shards), lt('From legendary and mythic crates. Spend them in the forge.')]]) {
      const row = el('div', 'cr-mat'); row.appendChild(el('b', '', k)); const tx = el('span', 'col'); tx.style.gap = '0'; tx.appendChild(el('span', '', n)); tx.appendChild(el('span', 'small mute', dsc)); row.appendChild(tx); mat.appendChild(row); }
    box.appendChild(mat);
    const fg = el('div', 'panel'); fg.appendChild(el('div', 'eyebrow', lt('THE FORGE'))); fg.appendChild(el('div', 'small mute', lt('LEGENDARY and MYTHIC blades come only from crates or the forge.')));
    const list = WEAPONS.filter(w => w.cost > 0 && !w.ev && itemTier('w', w.id) >= 4 && !d.owned[w.id]);
    if (!list.length) fg.appendChild(el('div', 'small gold', lt('You own every forgeable blade.')));
    for (const w of list) { const t = itemTier('w', w.id), cost = FORGE_COST[t], row = el('div', 'cr-forge'); const nm = el('span', 'col'); nm.style.gap = '0'; nm.appendChild(el('b', '', lt(w.name))); const tc = el('span', 'small', lt(TIERS[t].n)); tc.style.color = TIERS[t].c; nm.appendChild(tc); row.appendChild(nm);
      const fb = el('button', 'btn', '✦ ' + fmtNum(cost)); fb.disabled = b.shards < cost; fb.onclick = () => { if (b.shards < cost) { Aud.sfx('deny'); return; } b.shards -= cost; d.owned[w.id] = 1; Store.touch(); Store.flush && Store.flush(true); this.reveal({ r: t - 1, item: { tab: 'blades', id: w.id, name: w.name }, cr: 0, cores: 0, prisms: 0, shards: 0, forged: 1 }); }; row.appendChild(fb); fg.appendChild(row); }
    box.appendChild(fg);
    const how = el('div', 'panel small mute'); how.appendChild(el('div', 'eyebrow', lt('WHERE CRATES COME FROM'))); for (const t of ['Every rank up', 'Every step of the star road', 'The boss of the week', 'A rare drop at the end of stages and runs', 'The shop: 1,500 CR']) how.appendChild(el('div', '', '▸ ' + lt(t))); box.appendChild(how);
  },
  drawCrate(g, S, glowK) { // a neon crate, drawn at S×S
    g.save(); g.clearRect(0, 0, S, S); g.translate(S / 2, S / 2); const k = S / 220;
    g.shadowColor = '#00f2fe'; g.shadowBlur = 24 * k * (glowK || 1);
    g.fillStyle = '#141a38'; g.strokeStyle = '#00f2fe'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(-80 * k, -40 * k); g.lineTo(0, -80 * k); g.lineTo(80 * k, -40 * k); g.lineTo(80 * k, 50 * k); g.lineTo(0, 90 * k); g.lineTo(-80 * k, 50 * k); g.closePath(); g.fill(); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = '#ff2bd6'; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(-80 * k, -40 * k); g.lineTo(0, 0); g.lineTo(80 * k, -40 * k); g.moveTo(0, 0); g.lineTo(0, 90 * k); g.stroke();
    g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(0, -44 * k); g.lineTo(22 * k, -32 * k); g.lineTo(0, -20 * k); g.lineTo(-22 * k, -32 * k); g.closePath(); g.fill(); g.restore();
  },
  /* ---------- opening ---------- */
  play() { const res = this.open(); if (!res) { Aud.sfx('deny'); return; } Aud.init && Aud.init(); CrateFilm.run(res, () => this.reveal(res)); },
  reveal(res) {
    const R0 = RAR[res.r], ov = el('div', 'unlock39 cr-rev'), card = el('div', 'card'); card.style.borderColor = R0.c; card.style.boxShadow = '0 0 50px ' + hexA(R0.c, .45);
    card.appendChild(el('div', 'eyebrow', res.forged ? lt('FORGED') : lt(R0.n))); const cv = document.createElement('canvas'); cv.width = cv.height = 280; cv.className = 'cr-ic big';
    const g = cv.getContext('2d'); if (res.item) { try { drawIcon(g, { tab: res.item.tab, id: res.item.id, tier: res.r + 1 }, 280); } catch (e) { errLog(e); } } else this.drawLoot(g, 280, res, R0.c);
    card.appendChild(cv); const h = el('h2', '', res.item ? lt(res.item.name) : res.cr ? '+' + fmtNum(res.cr) + ' CR' : '+' + fmtNum(res.shards) + ' ' + lt('SHARDS')); h.style.color = R0.c; card.appendChild(h);
    const chips = el('div', 'ul'); const add = t => chips.appendChild(el('span', '', t));
    if (res.item) add(lt('NEW') + ' · ' + lt({ blades: 'BLADES', heroes: 'HEROES', fx: 'BLADE FX', pets: 'PETS' }[res.item.tab] || ''));
    if (res.cores) add('+' + res.cores + ' ◆'); if (res.prisms) add('+' + res.prisms + ' ◈'); if (res.shards && res.item) add('+' + res.shards + ' ✦'); card.appendChild(chips);
    const row = el('div', 'row'); const b = this.bag();
    if (b.crates > 0 && !res.forged) { const again = el('button', 'btn pri', ltf('OPEN ANOTHER ({0})', b.crates)); again.onclick = () => { ov.remove(); this.play(); }; row.appendChild(again); }
    const done = el('button', 'btn', lt('DONE')); done.onclick = () => { Aud.sfx('ui'); ov.remove(); if (UI.cur === 'crates') this.render(); }; row.appendChild(done); card.appendChild(row);
    ov.appendChild(card); document.body.appendChild(ov); Aud.sfx(res.r >= 3 ? 'win' : 'star');
  },
  drawLoot(g, S, res, c) { // credits, cores or shards as a glowing stack
    g.save(); g.translate(S / 2, S / 2); const k = S / 280; g.shadowColor = c; g.shadowBlur = 30 * k;
    if (res.cr) { for (let i = 0; i < 5; i++) { g.fillStyle = '#ffc83a'; g.beginPath(); g.ellipse(0, 50 * k - i * 18 * k, 70 * k, 22 * k, 0, 0, TAU); g.fill(); g.strokeStyle = '#7a5200'; g.lineWidth = 3 * k; g.stroke(); } }
    else { g.fillStyle = res.shards ? '#ff7ad9' : '#7df9ff'; g.beginPath(); g.moveTo(0, -90 * k); g.lineTo(60 * k, 0); g.lineTo(0, 90 * k); g.lineTo(-60 * k, 0); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(0, -90 * k); g.lineTo(60 * k, 0); g.lineTo(0, 0); g.closePath(); g.fill(); }
    g.restore();
  },
  /* ---------- drops at the end of a stage or run ---------- */
  drop(o) {
    if (!o || o.cdrop || REPLAY.on || G.mode === 'dojo' || G.mode === 'puzzle') return; o.cdrop = 1;
    const won = G.state === 'CLEAR', long = (G.time || 0) > 45; if (!won && !long) return;
    const b = this.bag(), boss = !!(G.stage && G.stage.obj && G.stage.obj.t === 'boss') || !!G.legend, hard = (G.di | 0) >= 2, notes = [];
    if (Math.random() < .5) { const n = 1 + Math.floor(Math.random() * 3) + (hard ? 1 : 0) + (boss ? 2 : 0); b.cores += n; notes.push('+' + n + ' ◆ ' + lt('CORES')); }
    if (Math.random() < (boss ? .2 : .06) * (hard ? 1.5 : 1)) { b.prisms++; notes.push('+1 ◈ ' + lt('PRISM')); }
    if (Math.random() < (boss ? .15 : .05)) { b.crates++; notes.push('+1 ' + lt('CRATE')); }
    if (notes.length) { Store.touch(); o.notes = o.notes || []; o.notes.push({ t: notes.join(' · '), c: 'gold' }); }
  }
};
/* ---------- the opening films ---------- */
const CrateFilm = {
  run(res, done) {
    const ov = el('div', 'cr-film'), cv = document.createElement('canvas'); ov.appendChild(cv); const skip = el('button', 'chip', lt('SKIP')); skip.className = 'chip cr-skip'; ov.appendChild(skip); document.body.appendChild(ov);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d');
    const k = Math.min(W / 400, H / 700), ox = (W - 400 * k) / 2, oy = (H - 700 * k) / 2, R0 = RAR[res.r], dur = [2.2, 2.6, 3.1, 4.4, 5.4][res.r];
    const sk = skinLook(Store.data.skin), o = Object.assign({}, HO); heroSetSkin(o, sk); o.w = Store.data.weapon || 'katana'; o.fx = bladeOf(Store.data.blade); o.alpha = 1; o.sx = o.sy = 1; o.hot = 0; o.od = 0; o.bl = 60;
    const S = { t: 0, parts: [], shake: 0, flash: 0, cut: -1, sfx: {} }, sc = this.scenes[res.r];
    let last = performance.now(), end = false;
    const finish = () => { if (end) return; end = true; ov.remove(); done(); };
    skip.onclick = e => { e.stopPropagation(); finish(); }; ov.addEventListener('click', () => { if (S.t > .5) finish(); });
    const once = (key, f) => { if (!S.sfx[key]) { S.sfx[key] = 1; try { f(); } catch (e) { } } };
    const step = now => {
      if (end) return; const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; S.t += dt;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#04050c'; g.fillRect(0, 0, W, H);
      const sh = S.shake > 0 ? S.shake * 8 * k : 0; S.shake = Math.max(0, S.shake - dt * 2.5);
      g.setTransform(dpr * k, 0, 0, dpr * k, dpr * (ox + (Math.random() - .5) * sh), dpr * (oy + (Math.random() - .5) * sh));
      withCtx(g, () => { try { sc.call(this, g, S, o, R0, dt, once); } catch (e) { errLog(e); } this.particles(g, S, dt); });
      if (S.flash > 0) { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = hexA(S.fc || '#ffffff', Math.min(1, S.flash)); g.fillRect(0, 0, W, H); S.flash = Math.max(0, S.flash - dt * 2.2); }
      if (S.t >= dur) return finish(); requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  /* helpers */
  hero(g, o, x, y, face, s, blade, dashing, t) { o.x = 0; o.y = 0; o.face = o.mvA = face; o.spd = dashing ? 900 : 0; o.ph = t * 10; o.dashing = !!dashing; o.blade = blade; o.t = t; g.save(); g.translate(x, y); g.scale(s, s); drawHero(o); g.restore(); },
  burst(S, x, y, c, n, sp, life, grav) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (.3 + Math.random() * .7); S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: life * (.6 + Math.random() * .4), l0: life, c, s: 2 + Math.random() * 4, gr: grav == null ? 600 : grav }); } },
  particles(g, S, dt) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = S.parts.length - 1; i >= 0; i--) { const p = S.parts[i]; p.l -= dt; if (p.l <= 0) { S.parts.splice(i, 1); continue; } p.vy += p.gr * dt; p.x += p.vx * dt; p.y += p.vy * dt; g.globalAlpha = Math.min(1, p.l / p.l0 * 1.5); g.fillStyle = p.c; g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); } g.restore(); },
  half(g, side, nx, ny, off, rot, cx0, cy0, draw) { // one side of a cut thing, pushed apart along the cut normal
    g.save(); g.translate(cx0 + side * nx * off, cy0 + side * ny * off); g.rotate(side * rot); g.translate(-cx0, -cy0);
    g.beginPath(); const L = 2000, tx = -ny, ty = nx; g.moveTo(cx0 + tx * L, cy0 + ty * L); g.lineTo(cx0 - tx * L, cy0 - ty * L); g.lineTo(cx0 - tx * L + side * nx * L, cy0 - ty * L + side * ny * L); g.lineTo(cx0 + tx * L + side * nx * L, cy0 + ty * L + side * ny * L); g.closePath(); g.clip(); draw(); g.restore();
  },
  slashArc(g, x, y, r, a0, a1, c, w, al) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = al; g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.shadowColor = c; g.shadowBlur = 24; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = w * .35; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); g.restore(); },
  title(g, txt, c, t, y) { if (t <= 0) return; const a = Math.min(1, t * 3), s = 1 + Math.max(0, .4 - t) * 2; g.save(); g.translate(200, y || 120); g.scale(s, s); g.globalAlpha = a; g.font = 'italic 700 46px ' + FONT_D; g.textAlign = 'center'; g.shadowColor = c; g.shadowBlur = 28; g.fillStyle = c; g.fillText(txt, 0, 0); g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = a * .55; g.fillText(txt, 0, 0); g.restore(); },
  floor(g, c, t) { const gr = g.createRadialGradient(200, 470, 10, 200, 470, 300); gr.addColorStop(0, hexA(c, .22)); gr.addColorStop(1, hexA(c, 0)); g.fillStyle = gr; g.fillRect(0, 0, 400, 700);
    g.strokeStyle = hexA(c, .16); g.lineWidth = 1; for (let i = 0; i < 12; i++) { const y = 380 + i * i * 2.6 + (t * 40 % 26); g.beginPath(); g.moveTo(0, y); g.lineTo(400, y); g.stroke(); } },
  aura(g, x, y, r, c, t) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const rr = r * (1 + ((t * 1.6 + i / 3) % 1) * .9); g.globalAlpha = .55 * (1 - ((t * 1.6 + i / 3) % 1)); g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.stroke(); }
    const gr = g.createRadialGradient(x, y, 4, x, y, r * 1.6); gr.addColorStop(0, hexA(c, .5)); gr.addColorStop(1, hexA(c, 0)); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(x - r * 2, y - r * 2, r * 4, r * 4); g.restore(); },
  bolt(g, x0, y0, x1, y1, c) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = c; g.lineWidth = 3; g.shadowColor = c; g.shadowBlur = 16; g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i < 8; i++) { const u = i / 8; g.lineTo(x0 + (x1 - x0) * u + (Math.random() - .5) * 30, y0 + (y1 - y0) * u + (Math.random() - .5) * 30); } g.lineTo(x1, y1); g.stroke(); g.restore(); },
  muscles(g, x, y, s, c, face) { // the powered-up hero gets huge shoulders and arms
    g.save(); g.translate(x, y); g.rotate(face + Math.PI / 2); g.scale(s, s); g.fillStyle = c; g.strokeStyle = '#05060f'; g.lineWidth = 2;
    for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 17, 2, 11, 9, sd * .3, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.ellipse(sd * 25, -8, 7, 10, sd * .5, 0, TAU); g.fill(); g.stroke(); }
    g.restore();
  },
  /* the five films */
  scenes: [
    function common(g, S, o, R0, dt, once) { // a watermelon tossed up and cut in two
      const t = S.t; this.floor(g, R0.c, t); const fx = 200 + Math.min(1, t / .7) * 0 - (1 - Math.min(1, t / .7)) * 90, fy = 640 - Math.sin(Math.min(1, t / .7) * Math.PI / 2) * 340, cut = t > .78;
      const melon = () => { g.save(); g.translate(fx, fy); g.rotate(t * 3); g.fillStyle = '#1f8a3a'; g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.fill(); g.strokeStyle = '#0d4a1d'; g.lineWidth = 6; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 14, 0, 6, 44, 0, 0, TAU); g.stroke(); }
        if (cut) { g.fillStyle = '#ff3b5c'; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fill(); g.fillStyle = '#111'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(Math.cos(i * 2.4) * 22, Math.sin(i * 2.4) * 22, 3, 5, i, 0, TAU); g.fill(); } } g.restore(); };
      if (!cut) melon(); else { const u = Math.min(1, (t - .78) / .9); once('cut', () => { Aud.sfx('slash'); this.burst(S, fx, fy, '#ff3b5c', 40, 420, .9); S.flash = .35; S.fc = R0.c; });
        for (const sd of [-1, 1]) this.half(g, sd, 1, 0, 10 + u * 120, u * .6, fx, fy, melon); }
      const dashing = t > .62 && t < .82, hx = 200, hy = dashing ? 640 - (t - .62) / .2 * 330 : t >= .82 ? 300 : 560;
      this.hero(g, o, hx, hy, -Math.PI / 2, 1.9, dashing ? -Math.PI / 2 + Math.sin((t - .62) * 20) * 2 : -Math.PI / 2 + 1.8, dashing, t);
      if (t > .7 && t < 1.1) this.slashArc(g, fx, fy, 70, -2.6, .4, R0.c, 10, 1 - (t - .7) / .4);
      this.title(g, lt(R0.n), R0.c, t - 1.2);
    },
    function rare(g, S, o, R0, dt, once) { // three bamboo stalks, three cuts
      const t = S.t; this.floor(g, R0.c, t); const xs = [130, 200, 270];
      const stalk = x => () => { g.fillStyle = '#3fa34d'; g.fillRect(x - 13, 180, 26, 300); g.fillStyle = '#2a7a36'; for (let y = 230; y < 480; y += 60) g.fillRect(x - 15, y, 30, 6); g.fillStyle = '#6fd37c'; g.fillRect(x - 9, 180, 4, 300); };
      xs.forEach((x, i) => { const tc = .7 + i * .25, cut = t > tc;
        if (!cut) stalk(x)(); else { const u = Math.min(1, (t - tc) / .9); once('c' + i, () => { Aud.sfx('slash'); this.burst(S, x, 330, R0.c, 22, 380, .7); S.shake = .3; });
          for (const sd of [-1, 1]) this.half(g, sd, .45, .9, sd < 0 ? 0 : 6 + u * 40, sd < 0 ? 0 : u * .9, x, 330, stalk(x)); } });
      const seg = Math.max(0, Math.min(2.99, (t - .6) / .25)), i0 = Math.floor(seg), hx = t < .6 ? 200 : xs[i0] + (xs[Math.min(2, i0 + 1)] - xs[i0]) * (seg - i0), hy = t < .6 ? 580 : 360 + Math.sin(seg * Math.PI) * 20;
      this.hero(g, o, hx, hy, t < .6 ? -Math.PI / 2 : 0, 1.8, t < .6 ? -Math.PI / 2 + 1.8 : t * 18, t > .6 && t < 1.4, t);
      for (let i = 0; i < 3; i++) { const tc = .7 + i * .25; if (t > tc && t < tc + .35) this.slashArc(g, xs[i], 330, 60, -1.2, 1.9, R0.c, 8, 1 - (t - tc) / .35); }
      this.title(g, lt(R0.n), R0.c, t - 1.6);
    },
    function epic(g, S, o, R0, dt, once) { // a car rushes in and is cut through
      const t = S.t; this.floor(g, R0.c, t); const cut = t > 1.05, cxp = cut ? 200 - (t - 1.05) * 40 : 520 - Math.min(1, t / 1.05) * 320, cyp = 300;
      const car = () => { g.save(); g.translate(cxp, cyp); g.fillStyle = '#c0102e'; g.beginPath(); g.roundRect ? g.roundRect(-95, -45, 190, 90, 26) : g.rect(-95, -45, 190, 90); g.fill(); g.fillStyle = '#1a2440'; g.fillRect(-48, -36, 46, 72); g.fillRect(14, -36, 36, 72); g.fillStyle = '#ffe58a'; g.fillRect(84, -38, 10, 16); g.fillRect(84, 22, 10, 16); g.fillStyle = '#111'; for (const [wx, wy] of [[-60, -50], [50, -50], [-60, 44], [50, 44]]) g.fillRect(wx - 14, wy - 4, 28, 10); g.restore(); };
      if (!cut) car(); else { const u = Math.min(1, (t - 1.05) / 1.3); once('cut', () => { Aud.sfx('slash'); Aud.sfx('boom'); this.burst(S, cxp, cyp, R0.c, 50, 520, 1); this.burst(S, cxp, cyp, '#ffd23f', 30, 300, .8); S.flash = .5; S.fc = R0.c; S.shake = .8; });
        for (const sd of [-1, 1]) this.half(g, sd, .55, .83, 8 + u * 90, u * .25, cxp, cyp, car); if (t < 1.6) for (let i = 0; i < 2; i++) this.bolt(g, cxp - 120, cyp - 80, cxp + 120, cyp + 80, R0.c); }
      const dashing = t > .9 && t < 1.15, hy = dashing ? 600 - (t - .9) / .25 * 420 : t >= 1.15 ? 180 : 600;
      this.hero(g, o, 200, hy, -Math.PI / 2, 2, dashing ? -Math.PI / 2 : -Math.PI / 2 + 1.8, dashing, t);
      if (t > 1 && t < 1.45) this.slashArc(g, cxp, cyp, 130, -2.8, .5, R0.c, 14, 1 - (t - 1) / .45);
      this.title(g, lt(R0.n), R0.c, t - 1.8);
    },
    function legendary(g, S, o, R0, dt, once) { this.giant(g, S, o, R0, dt, once, false); },
    function mythic(g, S, o, R0, dt, once) { this.giant(g, S, o, R0, dt, once, true); }
  ],
  giant(g, S, o, R0, dt, once, myth) { // the hero powers up, grows huge, and cuts a truck (or a whole train car) in two
    const t = S.t, P1 = myth ? 1.9 : 1.6, P2 = P1 + .8, c = R0.c;
    if (myth) { g.fillStyle = '#12020a'; g.fillRect(0, 0, 400, 700); if (t > .3) { g.save(); g.strokeStyle = hexA('#ff2b5e', Math.min(1, (t - .3))); g.lineWidth = 3; g.shadowColor = '#ff2b5e'; g.shadowBlur = 20; g.beginPath(); g.moveTo(40, 0); g.lineTo(150, 120); g.lineTo(120, 170); g.lineTo(260, 260); g.lineTo(230, 330); g.lineTo(400, 420); g.stroke(); g.restore(); } }
    this.floor(g, c, t);
    const pw = Math.min(1, t / P1), s = 1.6 + pw * 1.4 * (t < P2 + .2 ? 1 : 1), hx = 200, hy = 520 - pw * 30;
    if (t < P2) { this.aura(g, hx, hy, 50 + pw * 50, c, t); if (Math.random() < .35 + pw * .4) this.bolt(g, hx + (Math.random() - .5) * 200, hy - 220, hx, hy, myth ? '#ff2b5e' : '#ffd23f'); if (pw > .2) S.shake = Math.max(S.shake, pw * .5); }
    once('pw', () => { Aud.sfx('od'); }); if (t > P1 * .6) once('roar', () => { Aud.sfx('roar'); });
    // the target
    const tgtY = t < P1 ? -260 : Math.min(300, -260 + (t - P1) / .8 * 560), cut = t > P2;
    const truck = () => { g.save(); g.translate(200, cut ? 300 : tgtY);
      if (myth) { g.fillStyle = '#1a2440'; g.fillRect(-70, -230, 140, 460); g.fillStyle = '#7df9ff'; for (let y = -210; y < 210; y += 34) { g.fillRect(-60, y, 18, 22); g.fillRect(42, y, 18, 22); } g.fillStyle = '#ff2b5e'; g.fillRect(-72, -232, 144, 8); g.fillRect(-72, 224, 144, 8); g.fillStyle = '#00f2fe'; g.fillRect(-4, -230, 8, 460); }
      else { g.fillStyle = '#d0d8e8'; g.fillRect(-60, -200, 120, 280); g.fillStyle = '#9aa4b8'; for (let y = -190; y < 80; y += 22) g.fillRect(-56, y, 112, 4); g.fillStyle = '#ffb000'; g.fillRect(-56, 90, 112, 90); g.fillStyle = '#1a2440'; g.fillRect(-46, 150, 92, 24); g.fillStyle = '#fff6c0'; g.fillRect(-52, 176, 20, 8); g.fillRect(32, 176, 20, 8); g.fillStyle = '#111'; for (const [wx, wy] of [[-66, -150], [54, -150], [-66, -40], [54, -40], [-66, 120], [54, 120]]) g.fillRect(wx, wy, 12, 34); }
      g.restore(); };
    if (!cut) truck(); else { const u = Math.min(1, (t - P2) / 1.4);
      once('cut', () => { Aud.sfx('zan'); Aud.sfx('boom'); this.burst(S, 200, 300, c, 90, 700, 1.3); this.burst(S, 200, 300, '#ffffff', 40, 500, .8); this.burst(S, 200, 300, '#ffd23f', 60, 400, 1.2); S.flash = .9; S.fc = c; S.shake = 1.4; });
      for (const sd of [-1, 1]) this.half(g, sd, 1, 0, 6 + u * 150, u * .35, 200, 300, truck);
      g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const rr = u * 520 + i * 40; g.strokeStyle = hexA(c, Math.max(0, .7 - u)); g.lineWidth = 10 - i * 3; g.beginPath(); g.arc(200, 300, rr, 0, TAU); g.stroke(); } g.restore(); }
    // the giant hero
    const dashing = t > P2 - .15 && t < P2 + .1, gy = dashing ? hy - (t - (P2 - .15)) / .25 * 240 : t >= P2 + .1 ? 280 : hy;
    this.muscles(g, hx, gy, s * .9, o.ca || '#00f2fe', -Math.PI / 2);
    this.hero(g, o, hx, gy, -Math.PI / 2, s, dashing ? -Math.PI / 2 : -Math.PI / 2 + 1.6 + Math.sin(t * 6) * .2, dashing, t);
    if (t > P2 - .05 && t < P2 + .5) this.slashArc(g, 200, 300, 240, -3.0, 0.1, c, 26, 1 - (t - (P2 - .05)) / .55);
    if (myth && t > P2 + .6) { const u = Math.min(1, (t - P2 - .6) / 1.2); g.save(); for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, d0 = 40 + u * 520; g.fillStyle = hexA(i % 2 ? '#ff2b5e' : '#ffd23f', .7 * (1 - u)); g.beginPath(); g.moveTo(200 + Math.cos(a) * d0, 350 + Math.sin(a) * d0); g.lineTo(200 + Math.cos(a + .2) * (d0 + 60), 350 + Math.sin(a + .2) * (d0 + 60)); g.lineTo(200 + Math.cos(a - .15) * (d0 + 40), 350 + Math.sin(a - .15) * (d0 + 40)); g.closePath(); g.fill(); } g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .5; g.strokeStyle = hexA('#ffd23f', .25 * u); g.lineWidth = 10; g.beginPath(); g.moveTo(200, 350); g.lineTo(200 + Math.cos(a) * 600, 350 + Math.sin(a) * 600); g.stroke(); } g.restore(); }
    if (t < P2) this.title(g, lt('POWER UP'), myth ? '#ff2b5e' : '#ffd23f', t - .3, 640);
    this.title(g, lt(R0.n), c, t - P2 - .5);
  }
};
/* ---------- evolution ---------- */
const Evo = {
  data() { const d = Store.data; if (!d.evo || typeof d.evo !== 'object') d.evo = { w: {}, s: {} }; return d.evo; },
  lvl(kind, id) { return (this.data()[kind][id] | 0); },
  gate(kind, id) { return kind === 'w' ? masteryLevel(id) : heroLevel(id); },
  look(kind, n) { return lt((kind === 'w' ? ['A brighter blade and trail', 'Sparks fly from every swing', 'Runes orbit the blade and every kill bursts in gold'] : ['A stronger aura', 'Spirit embers rise around you', 'A halo of light and a burst on every dash'])[n - 1]); },
  can(kind, id) { const L = this.lvl(kind, id); if (L >= 3) return false; const [g, c, p] = EVO_REQ[L], b = Crates.bag(); return this.gate(kind, id) >= g && b.cores >= c && b.prisms >= p; },
  up(kind, id) { if (!this.can(kind, id)) return false; const L = this.lvl(kind, id), [, c, p] = EVO_REQ[L], b = Crates.bag(); b.cores -= c; b.prisms -= p; this.data()[kind][id] = L + 1; Store.touch(); Store.flush && Store.flush(true); return true; },
  panel() { // under the arsenal preview, for an owned blade or hero
    let box = $('asEvo'); const s = UI.asSel, d = Store.data, prev = $('asPrev'); if (!prev) return;
    const kind = s && s.tab === 'blades' ? 'w' : s && s.tab === 'heroes' ? 's' : null, own = kind && (kind === 'w' ? d.owned[s.id] : d.skins[s.id]);
    if (!kind || !own) { if (box) box.classList.add('hidden'); return; }
    if (!box) box = el('div', 'panel evo43'); box.id = 'asEvo'; if (box.previousElementSibling !== prev) prev.after(box); box.classList.remove('hidden'); box.textContent = '';
    const L = this.lvl(kind, s.id), top = el('div', 'topbar'); top.appendChild(el('div', 'eyebrow', lt('EVOLUTION'))); const pips = el('span', 'evo-p'); for (let i = 0; i < 3; i++) pips.appendChild(el('b', i < L ? 'on' : '', '◆')); top.appendChild(pips); box.appendChild(top);
    if (L > 0) box.appendChild(el('div', 'small gold', '✓ ' + this.look(kind, L)));
    if (L >= 3) { box.appendChild(el('div', 'small mute', lt('Fully evolved.'))); return; }
    const [g, c, p] = EVO_REQ[L], b = Crates.bag(), gl = this.gate(kind, s.id);
    box.appendChild(el('div', 'small', ltf('NEXT: {0}', this.look(kind, L + 1))));
    const req = el('div', 'evo-req'); const line = (ok, t) => req.appendChild(el('span', ok ? 'ok' : '', (ok ? '✓ ' : '· ') + t));
    line(gl >= g, ltf(kind === 'w' ? 'MASTERY {0}' : 'HERO LEVEL {0}', g) + ' (' + gl + ')'); line(b.cores >= c, ltf('{0} CORES', c) + ' (' + b.cores + ')'); if (p) line(b.prisms >= p, ltf('{0} PRISMS', p) + ' (' + b.prisms + ')'); box.appendChild(req);
    const btn = el('button', 'btn pri', lt('EVOLVE')); btn.disabled = !this.can(kind, s.id);
    btn.onclick = () => { if (!this.up(kind, s.id)) { Aud.sfx('deny'); return; } Aud.sfx('win'); Journey.card(lt('EVOLVED'), lt(kind === 'w' ? WEAPONS.find(w => w.id === s.id).name : SKINS.find(k => k.id === s.id).name) + ' · ' + ['I', 'II', 'III'][L], [this.look(kind, L + 1)], '#ffd23f'); UI.renderArsenal(); };
    box.appendChild(btn);
  }
};
{
  /* evolution looks in the 3D view */
  const sw1 = R3.sweep.bind(R3);
  R3.sweep = function () {
    try { const h = this.ents.get('hero'); if (h && h.seen === this.frame && W3D.ho) { const hg = h.g, rd = Math.min(.05, RDT || 1 / 60), we = Evo.lvl('w', (P.w && P.w.id) || ''), se = Evo.lvl('s', Store.data.skin), T = THREE, col = W3D.ho.ca || P.ca || '#00f2fe';
        this.trailK = 1 + we * .45;
        if (we >= 1 && hg.bladeMat) hg.bladeMat.emissiveIntensity = (hg.bm0 || (hg.bm0 = hg.bladeMat.emissiveIntensity)) * (1 + we * .3);
        if (we >= 2 && this.trail && this.trail.visible && Math.random() < .45 && this.tq && this.tq[0]) { const b = this.tq[0].b; this.spark(b.x, -b.y, b.z, we >= 3 ? '#ffd23f' : col); }
        if (we >= 3 && !hg.runes) { hg.runes = new T.Group(); for (let i = 0; i < 3; i++) { const m = this.part(new T.OctahedronGeometry(1.2, 0), this.glow('#ffd23f', 4), 0, 0, 0, hg.runes); m.userData.i = i; } hg.blade.add(hg.runes); }
        if (hg.runes) { hg.runes.visible = we >= 3; const tip = this.tipOf(hg); hg.runes.children.forEach((m, i) => { const a = this.t * 5 + i * TAU / 3; m.position.set(tip * .55 + Math.cos(a) * 6, Math.sin(a) * 6, Math.sin(a * 1.3) * 3); m.rotation.set(a, a, 0); }); }
        if (hg.pool) hg.pool.material.opacity *= 1 + se * .35; this.heroL.intensity = 300 * (1 + se * .45);
        if (se >= 2) { this.embT = (this.embT || 0) - rd; if (this.embT <= 0) { this.embT = se >= 3 ? .05 : .09; this.ember(P.x + (Math.random() - .5) * 30, P.y + (Math.random() - .5) * 30, col); } }
        if (se >= 3 && !hg.halo) { hg.halo = this.part(new T.TorusGeometry(4, .5, 8, 30), this.glow('#ffd23f', 3.5), 0, 0, 7.4, hg.head); }
        if (hg.halo) hg.halo.visible = se >= 3;
        if (se >= 3 && W3D.ho.dashing && !this.dWas) this.ring(P.x, P.y, col, 90, .45); this.dWas = !!W3D.ho.dashing; } } catch (e) { errLog(e); }
    try { this.emberTick(Math.min(.05, RDT || 1 / 60)); } catch (e) { errLog(e); }
    return sw1();
  };
  Object.assign(R3, {
    embers: [],
    ember(x, y, col) { if (!this.on || this.embers.length > 40) return; const k = 'em' + col; const m = new THREE.Mesh(this.spG || (this.spG = new THREE.BoxGeometry(1, 1, 1)), this.M[k] || (this.M[k] = this.glow(col, 3.5))); this.root.add(m); this.embers.push({ m, x, y, z: 2, t: 0, vx: (Math.random() - .5) * 20, vy: (Math.random() - .5) * 20 }); },
    emberTick(rd) { for (let i = this.embers.length - 1; i >= 0; i--) { const e = this.embers[i]; e.t += rd; if (e.t > .9) { this.root.remove(e.m); this.embers.splice(i, 1); continue; } e.z += 70 * rd; e.x += e.vx * rd; e.y += e.vy * rd; e.m.position.set(e.x, e.y, e.z); e.m.scale.setScalar(2.4 * (1 - e.t / .9) + .2); e.m.rotation.set(e.t * 6, e.t * 4, 0); } }
  });
  const db1 = R3.debris.bind(R3); R3.debris = function (e) { db1(e); try { if (Evo.lvl('w', (P.w && P.w.id) || '') >= 3) { this.ring(e.x, e.y, '#ffd23f', (e.r || 14) * 4, .5); for (let i = 0; i < 4; i++) this.spark(e.x, e.y, 8, '#ffd23f'); } } catch (er) { errLog(er); } };
  // the trail gets brighter with the blade's evolution
  const tt0 = R3.trailTick.bind(R3); R3.trailTick = function (hg, rd) { tt0(hg, rd); const k = this.trailK || 1; if (k !== 1 && this.trail) { const a = this.trail.geometry.attributes.color; for (let i = 0; i < a.array.length; i++) a.array[i] *= k; a.needsUpdate = true; } };
  // and in 2D: a glow under an evolved hero
  const dp2 = drawPlayer; drawPlayer = function () { dp2(); try { const se = Evo.lvl('s', Store.data.skin); if (se && !(typeof R3 !== 'undefined' && R3.on)) glow(P.x, P.y, 34 + se * 10, P.ca || '#00f2fe', .14 * se); } catch (e) { errLog(e); } };

  /* the arsenal: crate-only blades, and the evolution panel */
  const si0 = UI.shopItems.bind(UI);
  UI.shopItems = function (tab) { const out = si0(tab); if (tab === 'blades') for (const it of out) if (it.state === 'buy' && itemTier('w', it.id) >= 4) { it.state = 'lock'; it.can = false; it.lock = lt('Only from crates or the forge'); } return out; };
  const ra0 = UI.renderArsenal.bind(UI); UI.renderArsenal = function () { const r = ra0.apply(this, arguments); try { Evo.panel(); } catch (e) { errLog(e); } return r; };

  /* drops at the end of a stage or a run, and crates as rewards */
  const or2 = UI.openResult.bind(UI); UI.openResult = function (o) { const wb0 = Store.data.wbDone; try { Crates.drop(o); } catch (e) { errLog(e); } const r = or2(o); try { if (Store.data.wbDone !== wb0) Crates.give(1); } catch (e) { errLog(e); } return r; };
  const po0 = Journey.payouts.bind(Journey); Journey.payouts = function () { const d = Store.data, r0 = d.rankSeen == null ? 1 : d.rankSeen, s0 = d.sroad | 0, cards = po0(); const n = Math.max(0, (d.rankSeen | 0) - r0) + Math.max(0, (d.sroad | 0) - s0);
    if (n > 0) { Crates.bag().crates += n; Store.touch(); for (const c of cards) c[2].push('+' + n + ' ' + lt('CRATES')); } return cards; };

  /* ---------- the nav bar at the bottom of the home screen ---------- */
  const Nav = {
    build() {
      const sec = $('s-title'), grid = $('tGrid') || ($('bArcade') && $('bArcade').parentElement); if (!sec || !grid) return; if (!grid.id && grid.classList.contains('grid2')) grid.id = 'tGrid';
      let nav = $('tNav'), row = $('tNavRow');
      if (!nav) { nav = el('nav', 'tnav'); nav.id = 'tNav'; row = el('div', 'tnav-row'); row.id = 'tNavRow'; nav.appendChild(row); }
      if (row.parentElement !== nav) nav.appendChild(row);
      let cb = $('bCrates'); if (!cb) { cb = el('button', 'btn'); cb.id = 'bCrates'; cb.type = 'button'; cb.innerHTML = '<svg class="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5 M12 13v8"/></svg>'; cb.appendChild(el('span', '', lt('CRATES'))); const n = el('i', 'nav-n'); n.id = 'bCratesN'; cb.appendChild(n); cb.onclick = () => { Aud.sfx('ui'); Crates.screen(); }; }
      cb.lastChild.previousSibling.textContent = lt('CRATES');
      const want = NAV.map(id => id === 'bCrates' ? cb : $(id)).filter(Boolean); if (want.some((b, i) => row.children[i] !== b)) for (const b of want) row.appendChild(b);
      if (nav.parentElement !== sec) sec.appendChild(nav); grid.classList.add('tgrid-empty'); Crates.badge();
    }
  };
  const ot2 = UI.openTitle.bind(UI); UI.openTitle = function () { const r = ot2.apply(this, arguments); try { Nav.build(); } catch (e) { errLog(e); } return r; };
  if (typeof PC !== 'undefined' && PC.titleLayout) { const tl1 = PC.titleLayout.bind(PC); PC.titleLayout = function () { tl1(); try { Nav.build(); } catch (e) { errLog(e); } }; }

  /* ---------- settings in tabs ---------- */
  const SetTabs = {
    apply() {
      const box = $('setList'); if (!box) return; const kids = [...box.children], groups = []; let cur = null;
      for (const k of kids) { if (k.classList.contains('set-h')) { cur = groups.find(g => g.name === k.textContent) || null; if (cur) cur.items.push(k); else { cur = { name: k.textContent, items: [k] }; groups.push(cur); } } else { if (!cur) { cur = { name: lt('GENERAL'), items: [] }; groups.push(cur); } cur.items.push(k); } }
      if (groups.length < 2) return;
      let bar = $('setTabs'); if (!bar) { bar = el('div', 'settabs'); bar.id = 'setTabs'; box.parentElement.insertBefore(bar, box); } bar.textContent = '';
      const pick = UI.setTabN && groups.find(g => g.name === UI.setTabN) ? UI.setTabN : groups[Math.min(UI.setTabI | 0, groups.length - 1)].name;
      box.textContent = '';
      groups.forEach((g, i) => { const wrap = el('div', 'set-grp'); for (const k of g.items) wrap.appendChild(k); wrap.classList.toggle('hidden', g.name !== pick); box.appendChild(wrap);
        const b = el('button', g.name === pick ? 'on' : '', g.name); b.type = 'button'; b.onclick = () => { Aud.sfx('ui'); UI.setTabN = g.name; UI.setTabI = i; [...bar.children].forEach(x => x.classList.toggle('on', x === b)); [...box.children].forEach((w, j) => w.classList.toggle('hidden', j !== i)); }; bar.appendChild(b); });
      const on = bar.querySelector('.on'); if (on && on.scrollIntoView) try { on.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { }
    }
  };
  const os0 = UI.openSettings.bind(UI); UI.openSettings = function () { const r = os0.apply(this, arguments); try { SetTabs.apply(); } catch (e) { errLog(e); } return r; };

  const css = document.createElement('style'); css.id = 'v43css';
  css.textContent = `
.tgrid-empty { display: none !important; }
.tnav { position: sticky; bottom: 0; z-index: 6; align-self: stretch; margin: auto calc(-1 * max(16px, env(safe-area-inset-left, 0px))) -26px; padding: 14px 8px calc(10px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, rgba(6, 8, 22, 0), rgba(6, 8, 22, .92) 26%, rgba(6, 8, 22, .98)); }
.tnav-row { display: flex; gap: 8px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; scrollbar-width: none; padding: 2px 8px 4px; touch-action: pan-x pan-y; justify-content: safe center; }
.tnav-row::-webkit-scrollbar { display: none; }
.tnav-row > .btn { position: relative; flex: 0 0 auto; width: 82px; min-height: 74px; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 8px 4px; font-size: 10.5px; letter-spacing: .5px; line-height: 1.1; text-align: center; }
.tnav-row > .btn svg.ti { width: 24px; height: 24px; fill: none; stroke: var(--cyan); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.tnav-row > .btn:nth-child(3n+2) svg.ti { stroke: #ff4fd8; } .tnav-row > .btn:nth-child(3n) svg.ti { stroke: #ffd23f; }
.tnav-row > .btn.new::after { top: 2px; inset-inline-end: 2px; font-size: 8px; padding: 1px 4px; }
.nav-n { position: absolute; top: 4px; inset-inline-start: 6px; min-width: 18px; padding: 1px 5px; background: var(--red); color: #fff; font: 700 11px var(--fm); font-style: normal; border-radius: 9px; }
.settabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; position: sticky; top: 64px; z-index: 3; background: rgba(6, 8, 22, .96); }
.settabs::-webkit-scrollbar { display: none; }
.settabs button { flex: 0 0 auto; padding: 10px 14px; border: 1px solid rgba(110, 140, 255, .3); clip-path: var(--cut); font: 700 12px var(--fd); color: #b3c3e4; background: rgba(255, 255, 255, .04); white-space: nowrap; }
.settabs button.on { color: #fff; border-color: var(--cyan); background: linear-gradient(180deg, rgba(0, 242, 254, .22), rgba(0, 242, 254, .06)); box-shadow: inset 0 -2px 0 var(--cyan); }
.set-grp > .set-h { display: none; }
.cr-hero { display: flex; gap: 14px; align-items: center; } .cr-hero .col { flex: 1; } .cr-ic { width: 110px; height: 110px; flex: none; } .cr-ic.big { width: 150px; height: 150px; align-self: center; }
.cr-n { font: italic 700 34px var(--fd); color: var(--gold); }
.cr-odd { display: flex; justify-content: space-between; padding: 5px 0; font: 700 14px var(--fd); border-bottom: 1px solid rgba(255, 255, 255, .06); }
.cr-mat { display: flex; gap: 12px; align-items: center; padding: 7px 0; } .cr-mat > b { font-size: 26px; color: var(--cyan); width: 30px; text-align: center; }
.cr-forge { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, .06); } .cr-forge .btn { min-height: 40px; min-width: 96px; font-size: 14px; }
.cr-film { position: fixed; inset: 0; z-index: 80; background: #04050c; } .cr-film canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.cr-skip { position: absolute; top: max(14px, env(safe-area-inset-top, 0px)); inset-inline-end: 14px; z-index: 2; }
.cr-rev .card { gap: 10px; } .cr-rev .row { margin-top: 6px; }
.evo43 { display: flex; flex-direction: column; gap: 8px; border-color: rgba(255, 210, 63, .45); }
.evo-p { display: flex; gap: 4px; } .evo-p b { color: #2a3150; font-size: 16px; } .evo-p b.on { color: var(--gold); text-shadow: 0 0 10px var(--gold); }
.evo-req { display: flex; flex-direction: column; gap: 3px; font: 13px var(--fm); color: var(--mute); } .evo-req .ok { color: var(--green); }
@media (prefers-reduced-motion: reduce) { .cr-film { display: none; } }
`; document.head.appendChild(css);
}
