/* =====================================================================
   HIDEOUT — your loft above Neo Edo. Tap the floor to walk; tap a
   thing to walk to it and use it:
     · the weapon rack shows every blade (owned ones lit) — equip here
     · the trophy shelf holds a statue for every boss you have beaten
     · the arcade cabinet opens the Arcade, the holo-mirror the Arsenal
     · the shard crystal is the Neon Tower altar
     · a WANTED poster appears while you have a nemesis
     · your pet wanders around; tap it to pet it
   Purely a menu scene: no simulation state, nothing is recorded.
   ===================================================================== */
const HD_W = 360, HD_H = 540, HD_WALL = 150;
const HD_OBJ = [ // x, y = where the hero stands to use it; r = tap radius; box = what is drawn and tappable
  { id: 'rack', x: 70, y: 176, bx: 12, by: 18, bw: 118, bh: 116, n: 'WEAPON RACK', d: 'Every blade you have unlocked. Tap one to take it off the rack.' },
  { id: 'window', x: 180, y: 176, bx: 140, by: 22, bw: 80, bh: 92, n: 'WINDOW', d: 'Neo Edo never sleeps. Neither does Kurogane.' },
  { id: 'shelf', x: 290, y: 176, bx: 230, by: 18, bw: 118, bh: 116, n: 'TROPHY SHELF', d: 'A statue for every boss you have beaten. Empty plinths are still out there.' },
  { id: 'cab', x: 70, y: 268, bx: 22, by: 196, bw: 50, bh: 70, n: 'ARCADE CABINET', d: 'Every arcade mode, one coin slot.', act: 'PLAY ARCADE' },
  { id: 'mirror', x: 292, y: 268, bx: 300, by: 192, bw: 42, bh: 74, n: 'HOLO-MIRROR', d: 'Change your hero, blade skin and pet.', act: 'OPEN ARSENAL' },
  { id: 'crystal', x: 292, y: 400, bx: 300, by: 352, bw: 44, bh: 60, n: 'SHARD CRYSTAL', d: 'Soul shards from your Neon Tower climbs gather here.', act: 'CLIMB THE TOWER' },
  { id: 'poster', x: 68, y: 400, bx: 18, by: 340, bw: 56, bh: 70, n: 'WANTED', d: '', act: 'HUNT IT' },
  { id: 'tv', x: 180, y: 470, bx: 140, by: 496, bw: 80, bh: 36, n: 'SCORE TV', d: '' },
  { id: 'bed', x: 300, y: 488, bx: 262, by: 470, bw: 86, bh: 56, n: 'PET BED', d: '' }
];
const Hideout = {
  on: false, cv: null, g: null, k: 1, t: 0, x: 180, y: 320, tx: 180, ty: 320, face: -1.57, spd: 0, ph: 0, tgt: null, sel: null,
  px: 120, py: 440, pa: 0, pph: 0, ptx: 120, pty: 440, pwait: 2, happy: 0, sc: null, rain: null,
  open() {
    G.state = 'MENU'; UI.backFn = null; UI.show('hideout'); this.on = true; this.attach();
    this.x = this.tx = 180; this.y = this.ty = 330; this.tgt = null; this.sel = null; this.info(null);
    Aud.music('menu'); BG.set('undercity');
  },
  attach() {
    const c = $('hdCv'); if (!c) return; this.cv = c; const r = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(240, Math.round(r.width || 360)); c.width = Math.round(w * dpr); c.height = Math.round(w * HD_H / HD_W * dpr); this.g = c.getContext('2d'); this.k = c.width / HD_W; this.cw = w;
    if (!this.bound) {
      this.bound = true;
      c.addEventListener('pointerdown', e => { e.preventDefault(); const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * HD_W, y = (e.clientY - b.top) / b.height * HD_H; this.tap(x, y); });
    }
  },
  owned() { const d = Store.data; return WEAPONS.filter(w => d.owned[w.id]); },
  slot(i) { const c = i % 6, r = i / 6 | 0; return { x: 22 + c * 19, y: 26 + r * 21 }; }, // 6 x 5 grid, scaled down
  trophySlot(i) { const c = i % 5, r = i / 5 | 0; return { x: 243 + c * 23, y: 48 + r * 33 }; },
  tap(x, y) {
    Aud.init();
    if (Store.data.pet !== 'none' && Store.data.pets && Store.data.pets[Store.data.pet] && Math.hypot(x - this.px, y - this.py) < 22) { this.happy = 1.8; this.ptx = this.px; this.pty = this.py; this.pwait = 2; Aud.tone(900, 1300, .08, .05, 'sine'); vibe('tap'); this.info({ id: 'pet' }); return; }
    for (let i = 0; i < WEAPONS.length; i++) { const s = this.slot(i); if (Math.abs(x - s.x) < 9.5 && Math.abs(y - s.y - 2) < 10.5) { this.go(HD_OBJ[0], { id: 'weapon', w: WEAPONS[i] }); return; } }
    const bosses = Object.keys(BOSS_CODE); for (let i = 0; i < bosses.length; i++) { const s = this.trophySlot(i); if (Math.abs(x - s.x) < 11 && Math.abs(y - s.y) < 16) { this.go(HD_OBJ[2], { id: 'trophy', b: bosses[i] }); return; } }
    for (const o of HD_OBJ) { if (o.id === 'poster' && !Store.data.nem) continue; if (x >= o.bx && x <= o.bx + o.bw && y >= o.by && y <= o.by + o.bh) { this.go(o, { id: o.id, o }); return; } }
    if (y > HD_WALL + 10) { this.tx = clamp(x, 24, HD_W - 24); this.ty = clamp(y, HD_WALL + 26, HD_H - 20); this.tgt = null; this.info(null); Aud.sfx('ui'); }
  },
  go(o, sel) { this.tx = o.x; this.ty = o.y; this.tgt = sel; this.info(null); Aud.sfx('ui'); },
  info(sel) {
    this.sel = sel; const box = $('hdInfo'); if (!box) return; box.classList.toggle('hidden', !sel); if (!sel) return;
    const d = Store.data, act = $('hdAct'); let n = '', ds = '', a = null;
    const o = sel.o;
    switch (sel.id) {
      case 'weapon': { const w = sel.w, own = !!d.owned[w.id]; n = lt(w.name); ds = lt(w.desc) + (own ? '' : ' ' + lt('Locked: unlock it in the Arsenal.'));
        if (own && d.weapon !== w.id) a = [lt('EQUIP'), () => { d.weapon = w.id; Store.touch(); Aud.sfx('buy'); toast(lt(w.name), '#00f2fe'); this.info(sel); }];
        else if (own) ds += ' ' + lt('Equipped.'); else a = [lt('OPEN ARSENAL'), () => this.arsenal(1, w.id)]; break; }
      case 'trophy': { const b = sel.b, info = BOSS_INFO[b] || { name: b, sub: '' }, c = pcodex(), won = c.b[b] | 0; n = c.bs[b] ? lt(info.name) : '???';
        ds = won ? ltf('{0}. Defeated {1} times.', lt(info.sub), won) : c.bs[b] ? lt('You met this boss, but it still stands. Beat it to place its statue.') : lt('A boss you have not met yet.'); break; }
      case 'window': n = lt(o.n); ds = lt(o.d); break;
      case 'rack': n = lt(o.n); ds = lt(o.d) + ' ' + ltf('{0} of {1} unlocked.', this.owned().length, WEAPONS.length); break;
      case 'shelf': { const c = pcodex(), k = Object.keys(BOSS_CODE).filter(b => c.b[b]).length; n = lt(o.n); ds = lt(o.d) + ' ' + ltf('{0} of {1} statues.', k, Object.keys(BOSS_CODE).length); break; }
      case 'cab': n = lt(o.n); ds = lt(o.d); a = [lt(o.act), () => { this.on = false; UI.openArcade(); UI.backFn = () => this.open(); }]; break;
      case 'mirror': n = lt(o.n); ds = lt(o.d); a = [lt(o.act), () => this.arsenal(0)]; break;
      case 'crystal': { const t = towerData(); n = lt(o.n); ds = lt(o.d) + ' ' + ltf('{0} soul shards · best floor {1}.', fmtNum(t.sh), t.best | 0); a = [lt(o.act), () => { d.mode = 'tower'; Store.touch(); this.on = false; UI.openArcade(); UI.backFn = () => this.open(); }]; break; }
      case 'poster': { const nm = d.nem; n = lt('WANTED'); ds = nm ? Nemesis.name(nm) + ' · LV ' + nm.lv + '. ' + ltf('Bounty: {0} CR.', fmtNum(400 * nm.lv)) + ' "' + Nemesis.taunt(nm) + '"' : ''; a = [lt(o.act), () => { d.mode = 'endless'; Store.touch(); this.on = false; Flow.startArcade('endless'); }]; break; }
      case 'tv': n = lt(o.n); ds = ltf('Maglev {0} · Tower {1} · Highway {2} · Boss Rush {3}', fmtNum(d.best.endless | 0), fmtNum(d.best.tower | 0), fmtNum(d.best.highway | 0), fmtNum(d.best.bossrush | 0)); break;
      case 'bed': { const p = PET_BY_ID[d.pet]; n = lt(o.n); ds = p && d.pets && d.pets[d.pet] ? ltf('{0} sleeps here.', lt(p.name)) : lt('No pet yet. Adopt one in the Arsenal.'); if (!(p && d.pets && d.pets[d.pet])) a = [lt('OPEN ARSENAL'), () => this.arsenal(6)]; break; }
      case 'pet': { const p = PET_BY_ID[d.pet]; n = p ? lt(p.name) : ''; ds = p ? petLevelText(d.pet) : ''; break; }
    }
    $('hdName').textContent = n; $('hdDesc').textContent = ds;
    act.classList.toggle('hidden', !a); if (a) { act.textContent = a[0]; act.onclick = () => { Aud.sfx('ui'); a[1](); }; }
  },
  arsenal(tab, id) { this.on = false; UI.asTab = tab; UI.asSel = id ? { tab: 'blades', id } : null; UI.openArsenal(); UI.backFn = () => this.open(); },
  tick(rd) {
    if (UI.cur !== 'hideout' || !this.g) return; this.t += rd;
    const r = this.cv.getBoundingClientRect(); if (r.width > 0 && Math.abs(r.width - this.cw) > 4) this.attach();
    const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy);
    if (d > 2) { const s = Math.min(d, 170 * rd); this.x += dx / d * s; this.y += dy / d * s; this.spd = 170; this.face = Math.atan2(dy, dx); this.ph += rd * 13; }
    else { this.spd = 0; if (this.tgt) { const t = this.tgt; this.tgt = null; this.face = -1.57; this.info(t); } }
    // the pet wanders, and follows you when you walk away
    const pd = Math.hypot(this.x - this.px, this.y - this.py); this.pwait -= rd; if (this.happy > 0) this.happy -= rd;
    if (pd > 120) { this.ptx = this.x - 30; this.pty = this.y + 24; }
    else if (this.pwait <= 0) { this.pwait = 3 + Math.random() * 4; if (Math.random() < .35) { this.ptx = 290; this.pty = 500; } else { this.ptx = clamp(this.x + (Math.random() - .5) * 160, 30, HD_W - 30); this.pty = clamp(this.y + (Math.random() - .5) * 120, HD_WALL + 30, HD_H - 24); } }
    const qx = this.ptx - this.px, qy = this.pty - this.py, qd = Math.hypot(qx, qy); if (qd > 2) { const s = Math.min(qd, 120 * rd); this.px += qx / qd * s; this.py += qy / qd * s; this.pa = Math.atan2(qy, qx); this.pph += rd * 16; this.pmv = 1; } else this.pmv = 0;
    withCtx(this.g, () => { cx.setTransform(this.k, 0, 0, this.k, 0, 0); this.draw(); });
  },
  draw() {
    const t = this.t, d = Store.data;
    // floor and walls
    cx.fillStyle = '#0b0d18'; cx.fillRect(0, 0, HD_W, HD_H);
    const fg = cx.createLinearGradient(0, HD_WALL, 0, HD_H); fg.addColorStop(0, '#141826'); fg.addColorStop(1, '#0c0e18'); cx.fillStyle = fg; cx.fillRect(0, HD_WALL, HD_W, HD_H - HD_WALL);
    cx.strokeStyle = 'rgba(0,242,254,.07)'; cx.lineWidth = 1; for (let x = 0; x <= HD_W; x += 30) { cx.beginPath(); cx.moveTo(x, HD_WALL); cx.lineTo(x, HD_H); cx.stroke(); } for (let y = HD_WALL; y <= HD_H; y += 30) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(HD_W, y); cx.stroke(); }
    const wg = cx.createLinearGradient(0, 0, 0, HD_WALL); wg.addColorStop(0, '#1a1430'); wg.addColorStop(1, '#221a3a'); cx.fillStyle = wg; cx.fillRect(0, 0, HD_W, HD_WALL);
    cx.fillStyle = '#ff2bd6'; cx.fillRect(0, HD_WALL - 3, HD_W, 3); hglow(HD_W / 2, HD_WALL, 200, '#ff2bd6', .12);
    // window with the city and rain
    const W0 = HD_OBJ[1]; cx.fillStyle = '#05040c'; cx.fillRect(W0.bx, W0.by, W0.bw, W0.bh);
    cx.save(); cx.beginPath(); cx.rect(W0.bx, W0.by, W0.bw, W0.bh); cx.clip();
    const sky = cx.createLinearGradient(0, W0.by, 0, W0.by + W0.bh); sky.addColorStop(0, '#1a0630'); sky.addColorStop(1, '#ff2b6a'); cx.fillStyle = sky; cx.fillRect(W0.bx, W0.by, W0.bw, W0.bh);
    for (let i = 0; i < 9; i++) { const bx = W0.bx + i * 10 - 4, bh = 26 + ((i * 37) % 40); cx.fillStyle = '#0a0614'; cx.fillRect(bx, W0.by + W0.bh - bh, 9, bh); cx.fillStyle = i % 3 ? '#ffe9a6' : '#00f2fe'; for (let k = 0; k < bh / 7 - 1; k++) if ((i * 7 + k * 3) % 4) cx.fillRect(bx + 2 + (k % 2) * 3, W0.by + W0.bh - bh + 4 + k * 7, 2, 2); }
    cx.strokeStyle = 'rgba(180,200,255,.45)'; cx.lineWidth = 1; for (let i = 0; i < 14; i++) { const rx = W0.bx + ((i * 23 + t * 40) % W0.bw), ry = W0.by + ((i * 47 + t * 220) % W0.bh); cx.beginPath(); cx.moveTo(rx, ry); cx.lineTo(rx - 2, ry + 7); cx.stroke(); }
    cx.restore(); cx.strokeStyle = '#3a3460'; cx.lineWidth = 4; cx.strokeRect(W0.bx, W0.by, W0.bw, W0.bh); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(W0.bx + W0.bw / 2, W0.by); cx.lineTo(W0.bx + W0.bw / 2, W0.by + W0.bh); cx.stroke();
    // neon sign
    cx.textAlign = 'center'; cx.font = '700 13px ' + FONT_D; const fl = Math.sin(t * 17) > -.95 ? 1 : .3; cx.globalAlpha = fl; cx.fillStyle = '#00f2fe'; cx.fillText('OVERDRIVE', HD_W / 2, 136); hglow(HD_W / 2, 132, 50, '#00f2fe', .25 * fl); cx.globalAlpha = 1;
    // weapon rack
    const RK = HD_OBJ[0]; cx.fillStyle = '#120f22'; cx.fillRect(RK.bx, RK.by, RK.bw, RK.bh); cx.strokeStyle = '#3a3460'; cx.lineWidth = 2; cx.strokeRect(RK.bx, RK.by, RK.bw, RK.bh);
    const ho = { x: 0, y: 0, face: 0, mvA: 0, spd: 0, ph: 0, sx: 1, sy: 1, ca: '#00f2fe', cb: '#ff0844', dashing: false, alpha: 1, w: 'katana', fx: null, bl: 30, t, hot: 0, od: 0 };
    cx.save(); cx.beginPath(); cx.rect(RK.bx + 1, RK.by + 1, RK.bw - 2, RK.bh - 2); cx.clip();
    for (let i = 0; i < WEAPONS.length; i++) {
      const w = WEAPONS[i], s = this.slot(i), own = !!d.owned[w.id], on = d.weapon === w.id;
      cx.fillStyle = on ? 'rgba(0,242,254,.18)' : 'rgba(255,255,255,.03)'; cx.fillRect(s.x - 9, s.y - 8, 18, 20);
      cx.save(); cx.translate(s.x, s.y + 9); cx.scale(.68, .68); cx.globalAlpha = own ? 1 : .22; ho.w = w.id; ho.fx = own && on ? bladeOf(d.blade) : null; ho.bl = w.id === 'spear' || w.id === 'nodachi' || w.id === 'staff' || w.id === 'cleaver' ? 13 : w.id === 'scythe' || w.id === 'whip' ? 14 : 17; ho.half = 0;
      if (w.id === 'fists') { cx.translate(0, -10); } try { drawWeapon(ho, -1.5708); } catch (e) { errLog(e); }
      cx.restore(); cx.globalAlpha = 1;
      if (this.sel && this.sel.id === 'weapon' && this.sel.w.id === w.id) { cx.strokeStyle = '#ffd700'; cx.lineWidth = 1.5; cx.strokeRect(s.x - 9, s.y - 8, 18, 20); }
    }
    cx.restore();
    // trophy shelf
    const SH = HD_OBJ[2]; cx.fillStyle = '#120f22'; cx.fillRect(SH.bx, SH.by, SH.bw, SH.bh); cx.strokeStyle = '#3a3460'; cx.lineWidth = 2; cx.strokeRect(SH.bx, SH.by, SH.bw, SH.bh);
    const c = pcodex(), bosses = Object.keys(BOSS_CODE);
    for (let i = 0; i < bosses.length; i++) {
      const b = bosses[i], s = this.trophySlot(i), info = BOSS_INFO[b] || { col: '#888' }, won = c.b[b] | 0;
      cx.fillStyle = '#2a2440'; cx.fillRect(s.x - 11, s.y + 10, 22, 4); // shelf board
      if (won) {
        hglow(s.x, s.y, 16, info.col, .35 + .1 * Math.sin(t * 3 + i));
        cx.fillStyle = '#d9b46a'; cx.fillRect(s.x - 6, s.y + 5, 12, 5); cx.fillStyle = info.col; cx.beginPath(); cx.moveTo(s.x - 6, s.y + 5); cx.lineTo(s.x - 4, s.y - 6); cx.arc(s.x, s.y - 8, 4.5, Math.PI, 0); cx.lineTo(s.x + 6, s.y + 5); cx.closePath(); cx.fill();
        cx.fillStyle = '#fff'; dot(s.x - 1.5, s.y - 9, .9); dot(s.x + 1.5, s.y - 9, .9);
        if (won >= 5) { cx.fillStyle = '#ffd700'; cx.beginPath(); cx.moveTo(s.x - 4, s.y - 13); cx.lineTo(s.x - 2, s.y - 17); cx.lineTo(s.x, s.y - 14); cx.lineTo(s.x + 2, s.y - 17); cx.lineTo(s.x + 4, s.y - 13); cx.fill(); } // a crown after five wins
      } else { cx.fillStyle = '#1e1a30'; cx.fillRect(s.x - 6, s.y + 5, 12, 5); cx.fillStyle = c.bs[b] ? '#6a5a8a' : '#3a3458'; cx.font = '700 11px ' + FONT_M; cx.fillText('?', s.x, s.y + 2); }
      if (this.sel && this.sel.id === 'trophy' && this.sel.b === b) { cx.strokeStyle = '#ffd700'; cx.lineWidth = 1.5; cx.strokeRect(s.x - 12, s.y - 16, 24, 32); }
    }
    // arcade cabinet
    const CB = HD_OBJ[3]; cx.fillStyle = '#1c1030'; cx.fillRect(CB.bx, CB.by, CB.bw, CB.bh); cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 2; cx.strokeRect(CB.bx, CB.by, CB.bw, CB.bh);
    cx.fillStyle = '#05040c'; cx.fillRect(CB.bx + 6, CB.by + 8, CB.bw - 12, 28); const sc = ['#00f2fe', '#ff2bd6', '#ffd700'][(t * 2 | 0) % 3]; cx.fillStyle = sc; cx.fillRect(CB.bx + 12 + Math.sin(t * 3) * 10, CB.by + 18, 6, 6); cx.fillRect(CB.bx + 30, CB.by + 14 + Math.sin(t * 5) * 5, 3, 10); hglow(CB.bx + CB.bw / 2, CB.by + 22, 30, sc, .3);
    cx.fillStyle = '#ff0844'; dot(CB.bx + 16, CB.by + 50, 3); cx.fillStyle = '#00f2fe'; dot(CB.bx + 30, CB.by + 50, 3); cx.fillStyle = '#ffd700'; dot(CB.bx + 38, CB.by + 46, 2.4);
    // holo-mirror
    const MR = HD_OBJ[4]; cx.fillStyle = '#0a1420'; cx.fillRect(MR.bx, MR.by, MR.bw, MR.bh); cx.strokeStyle = '#7df9ff'; cx.lineWidth = 2; cx.strokeRect(MR.bx, MR.by, MR.bw, MR.bh);
    cx.globalAlpha = .4 + .15 * Math.sin(t * 4); cx.fillStyle = '#7df9ff'; for (let y = MR.by + 4; y < MR.by + MR.bh - 2; y += 4) cx.fillRect(MR.bx + 3, y, MR.bw - 6, 1); cx.globalAlpha = 1;
    // shard crystal
    const CR = HD_OBJ[5], sh = towerData().sh, cs = 1 + Math.min(1, sh / 200) * .6, cy = CR.by + 30 + Math.sin(t * 2) * 3;
    hglow(CR.bx + CR.bw / 2, cy, 40 * cs, '#ff9a3d', .4); cx.fillStyle = '#ff9a3d'; cx.beginPath(); cx.moveTo(CR.bx + CR.bw / 2, cy - 20 * cs); cx.lineTo(CR.bx + CR.bw / 2 + 10 * cs, cy); cx.lineTo(CR.bx + CR.bw / 2, cy + 20 * cs); cx.lineTo(CR.bx + CR.bw / 2 - 10 * cs, cy); cx.closePath(); cx.fill();
    cx.fillStyle = '#ffe0b0'; cx.beginPath(); cx.moveTo(CR.bx + CR.bw / 2, cy - 20 * cs); cx.lineTo(CR.bx + CR.bw / 2 + 4 * cs, cy); cx.lineTo(CR.bx + CR.bw / 2, cy + 6 * cs); cx.closePath(); cx.fill();
    cx.fillStyle = '#2a2440'; cx.fillRect(CR.bx + 6, CR.by + CR.bh - 8, CR.bw - 12, 8); cx.font = '700 10px ' + FONT_M; cx.fillStyle = '#ff9a3d'; cx.fillText(fmtNum(sh), CR.bx + CR.bw / 2, CR.by + CR.bh + 8);
    // wanted poster
    if (d.nem && EDEF[d.nem.t]) {
      const PO = HD_OBJ[6]; cx.save(); cx.translate(PO.bx + PO.bw / 2, PO.by + PO.bh / 2); cx.rotate(-.05);
      cx.fillStyle = '#e8dcc0'; cx.fillRect(-PO.bw / 2, -PO.bh / 2, PO.bw, PO.bh); cx.fillStyle = '#7a1010'; cx.font = '700 10px ' + FONT_D; cx.fillText(lt('WANTED'), 0, -PO.bh / 2 + 12);
      cx.fillStyle = EDEF[d.nem.t].col; cx.beginPath(); cx.arc(0, -2, 13, 0, TAU); cx.fill(); cx.strokeStyle = '#7a1010'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-15, -17); cx.lineTo(15, 13); cx.stroke();
      cx.fillStyle = '#3a1a10'; cx.font = '700 8px ' + FONT_M; cx.fillText('LV ' + d.nem.lv, 0, 22); cx.fillText(fmtNum(400 * d.nem.lv) + ' CR', 0, 31); cx.restore();
    }
    // score tv
    const TV = HD_OBJ[7]; cx.fillStyle = '#05040c'; cx.fillRect(TV.bx, TV.by, TV.bw, TV.bh); cx.strokeStyle = '#3a3460'; cx.lineWidth = 2; cx.strokeRect(TV.bx, TV.by, TV.bw, TV.bh);
    cx.font = '700 9px ' + FONT_M; cx.fillStyle = '#00ff88'; const ln = [['MAGLEV', d.best.endless], ['TOWER', d.best.tower], ['ROAD', d.best.highway]]; const li = (t / 2.5 | 0) % ln.length; cx.fillText(ln[li][0], TV.bx + TV.bw / 2, TV.by + 14); cx.fillStyle = '#ffd700'; cx.fillText(fmtNum(ln[li][1] | 0), TV.bx + TV.bw / 2, TV.by + 27);
    // pet bed
    const BD = HD_OBJ[8]; cx.fillStyle = '#2a1430'; cx.beginPath(); cx.ellipse(BD.bx + BD.bw / 2, BD.by + BD.bh / 2, BD.bw / 2, BD.bh / 2.4, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 2; cx.stroke();
    // pet
    const pid = d.pet, hasPet = pid && pid !== 'none' && d.pets && d.pets[pid];
    const draws = [];
    if (hasPet) draws.push([this.py, () => { const onBed = !this.pmv && Math.hypot(this.px - 290, this.py - 500) < 20, mood = this.happy > 0 ? 3 : this.pmv ? 0 : onBed ? 2 : 1; drawPet(pid, this.px, this.py - (mood === 3 ? Math.abs(Math.sin(t * 14)) * 6 : 0), this.pa, this.pph, t, false, 0, mood); if (mood === 2) { cx.fillStyle = '#c9d6ff'; cx.font = '700 10px ' + FONT_M; cx.fillText('z', this.px + 10, this.py - 14 - (t * 8 % 8)); } }]);
    draws.push([this.y, () => this.drawHero()]);
    draws.sort((a, b) => a[0] - b[0]); for (const q of draws) q[1]();
    if (this.tgt === null && this.spd > 0) { cx.strokeStyle = 'rgba(0,242,254,.5)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(this.tx, this.ty, 8 + Math.sin(t * 10) * 2, 0, TAU); cx.stroke(); }
    cx.textAlign = 'start';
  },
  drawHero() {
    const d = Store.data, h = HO; heroSetSkin(h, skinLook(d.skin));
    h.x = this.x; h.y = this.y; h.face = this.spd ? this.face : -1.5708 + Math.sin(this.t * .7) * .3; h.mvA = h.face; h.spd = this.spd; h.ph = this.ph; h.sx = h.sy = 1; h.dashing = false; h.alpha = 1;
    h.w = d.weapon; h.fx = bladeOf(d.blade); h.bl = 50; h.t = this.t; h.hot = h.od = 0; h.blade = h.face + Math.sin(this.t * 2.5) * .2 + 1.8;
    if (!this.spd) { const k = (this.t % 6); if (k > 4.6 && k < 5.4) { const u = (k - 4.6) / .8; h.blade += TAU * u * u * (3 - 2 * u); } } // an idle twirl now and then
    if (!this.sc) this.sc = new Float32Array(20); const sc = this.sc; for (let i = 0; i < 10; i++) { sc[i * 2] = this.x - Math.cos(h.face) * (8 + i * 4.5); sc[i * 2 + 1] = this.y - Math.sin(h.face) * (8 + i * 4.5) + Math.sin(this.t * 6 + i * .6) * i * .5; }
    if (h.body !== 'tengu' && h.body !== 'yurei') drawHeroTrail(h.body, sc, h.ca, h.cb);
    drawHero(h);
  }
};
