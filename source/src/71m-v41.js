/* =====================================================================
   VERSION 41
   3D (render only, the simulation is untouched):
   · every weapon has its own 3D model (blades, long blades, twin daggers,
     hammer, cleaver, polearms, scythe, chain and wire, chakram, fan, bow,
     drill, gauntlets), and every hero skin dresses the 3D ninja its own
     way (horns, ears, tails, straw hat, crest, halo and wings, beak,
     antenna, pumpkin head, ghost robe...)
   · bullets are glowing 3D orbs: enemy fire red, reflected shots cyan,
     your own shots in their color
   · the 3D picture adjusts its resolution to the phone: if frames get slow
     it drops a step, when they are fast again it climbs back (only with
     Settings > SCREEN > RESOLUTION on AUTO)
   Menus:
   · the home screen is shorter: the daily bonus, events, the daily
     mission, legends, the daily run and bounties sit in one TODAY card
     that opens and closes (it opens by itself when a reward is waiting)
   · new things on the home screen are announced in a card instead of a
     long line of text, and NEW badges go away by themselves after a few
     visits
   · QUICK PLAY: one tap starts your last arcade mode again
   ===================================================================== */
Object.assign(R3, {
  /* ---------- weapons ---------- */
  wfam(id) {
    return { nodachi: 'long', daggers: 'dual', monarch: 'dual', kunai: 'dual', claws: 'dual', hammer: 'hammer', cleaver: 'cleaver', spear: 'pole', staff: 'staff', glaive: 'glaive', solarlance: 'pole',
      scythe: 'scythe', whip: 'chain', monowire: 'chain', chakram: 'ring', tessen: 'fan', bow: 'bow', drill: 'drill', fists: 'fists', beamsaber: 'saber' }[id] || 'blade';
  },
  weapon(g, id) {
    const T = THREE, P0 = this.part.bind(this), bl = g.blade, bm = g.bladeMat, fam = this.wfam(id), dark = this.M.dark, metal = this.M.metal, gold = this.M.gold;
    for (const c of [...bl.children]) { bl.remove(c); if (c.geometry) c.geometry.dispose(); }
    g.bladeMesh = null; g.wfam = fam; g.spin = null;
    const rz = geo => geo.rotateZ(Math.PI / 2), hilt = (len, x) => P0(rz(new T.CylinderGeometry(.9, .9, len, 8)), dark, x == null ? -1 : x, 0, 0, bl);
    if (fam === 'blade' || fam === 'long' || fam === 'saber') {
      const L = fam === 'long' ? 42 : 30; hilt(fam === 'long' ? 8 : 5, fam === 'long' ? -2 : -1);
      if (fam !== 'saber') P0(new T.BoxGeometry(1.2, 5, 1.6), gold, 1.6, 0, 0, bl);
      g.bladeMesh = P0(new T.BoxGeometry(L, fam === 'saber' ? 1.4 : .9, fam === 'saber' ? 1.4 : 2.4), bm, 2.2 + L / 2, 0, 0, bl);
      P0(new T.ConeGeometry(1.2, 4, 4).rotateZ(-Math.PI / 2), bm, 4.2 + L, 0, 0, bl);
    } else if (fam === 'dual') { // one in each hand
      for (const arm of [g.arms[1], g.arms[0]]) { const b = arm === g.arms[1] ? bl : (g.blade2 || (g.blade2 = new T.Group())); if (b !== bl) { b.position.set(7, 0, 0); arm.add(b); }
        P0(rz(new T.CylinderGeometry(.8, .8, 4, 8)), dark, -.5, 0, 0, b); const m = P0(new T.BoxGeometry(14, .8, 2), bm, 8, 0, 0, b); if (b === bl) g.bladeMesh = m;
        P0(new T.ConeGeometry(1, 3, 4).rotateZ(-Math.PI / 2), bm, 16.5, 0, 0, b); }
    } else if (fam === 'hammer') {
      P0(rz(new T.CylinderGeometry(.8, .8, 26, 8)), metal, 10, 0, 0, bl); P0(new T.BoxGeometry(9, 12, 9), this.M.armor2, 24, 0, 0, bl); P0(new T.BoxGeometry(9.4, 2, 9.4), bm, 24, 0, 0, bl);
    } else if (fam === 'cleaver') {
      hilt(6); g.bladeMesh = P0(new T.BoxGeometry(30, 1, 9), metal, 18, 0, 3, bl); P0(new T.BoxGeometry(30, 1.2, 1.2), bm, 18, 0, -1.4, bl);
    } else if (fam === 'pole' || fam === 'staff' || fam === 'glaive') {
      P0(rz(new T.CylinderGeometry(.7, .7, 48, 8)), fam === 'staff' ? gold : metal, 10, 0, 0, bl);
      if (fam === 'pole') g.bladeMesh = P0(new T.ConeGeometry(1.8, 12, 6).rotateZ(-Math.PI / 2), bm, 40, 0, 0, bl);
      else if (fam === 'glaive') { g.bladeMesh = P0(new T.BoxGeometry(14, .8, 5), bm, 39, 0, 1.5, bl); }
      else { P0(new T.SphereGeometry(2, 10, 8), bm, 34, 0, 0, bl); P0(new T.SphereGeometry(2, 10, 8), bm, -14, 0, 0, bl); }
    } else if (fam === 'scythe') {
      P0(rz(new T.CylinderGeometry(.7, .7, 38, 8)), metal, 12, 0, 0, bl); const s = P0(new T.BoxGeometry(3, 20, 1), bm, 30, 9, 0, bl); s.rotation.z = -.35; g.bladeMesh = null;
    } else if (fam === 'chain') {
      hilt(4); for (let i = 0; i < 9; i++) P0(new T.SphereGeometry(i === 8 ? 1.8 : .9, 8, 6), i === 8 ? bm : metal, 4 + i * 3.6, Math.sin(i * .9) * 1.6, 0, bl);
    } else if (fam === 'ring') {
      const r = P0(new T.TorusGeometry(8, 1.2, 8, 28), bm, 12, 0, 0, bl); r.rotation.x = Math.PI / 2; g.spin = r; P0(new T.TorusGeometry(6.4, .4, 6, 24), metal, 12, 0, 0, bl).rotation.x = Math.PI / 2;
    } else if (fam === 'fan') {
      const f = P0(new T.CircleGeometry(12, 20, 0, Math.PI), new T.MeshStandardMaterial({ color: 0x1a1d2c, emissive: bm.emissive, emissiveIntensity: .6, side: T.DoubleSide, metalness: .6, roughness: .4 }), 4, 0, 0, bl); f.rotation.x = Math.PI / 2; f.rotation.z = -Math.PI / 2;
    } else if (fam === 'bow') {
      const a = P0(new T.TorusGeometry(14, .8, 6, 24, Math.PI), metal, 4, 0, 0, bl); a.rotation.x = Math.PI / 2; a.rotation.z = -Math.PI / 2;
      P0(new T.BoxGeometry(.3, 28, .3), bm, 4, 0, 0, bl);
    } else if (fam === 'drill') {
      hilt(5); const d = P0(new T.ConeGeometry(4, 22, 10).rotateZ(-Math.PI / 2), metal, 14, 0, 0, bl); g.spin = d; P0(new T.TorusGeometry(4, .6, 6, 18).rotateY(Math.PI / 2), bm, 3.5, 0, 0, bl);
    } else if (fam === 'fists') {
      for (const arm of g.arms) { const k = P0(new T.BoxGeometry(5.5, 5, 5), this.M.armor2, 7.5, 0, 0, arm); void k; P0(new T.BoxGeometry(1.4, 5.2, 5.2), bm, 10.4, 0, 0, arm); }
    }
    bl.traverse(o => { if (o.isMesh) o.castShadow = true; });
  },
  /* ---------- hero skins ---------- */
  dress(g, body, ca, cb) {
    const T = THREE, P0 = this.part.bind(this), H = g.head, torso = g.torso, gold = this.M.gold, glow = c => this.glow(c, 2.4), std = o => this.std(o);
    const spike = (par, x, y, z, r, len, mat, ax, ay) => { const m = P0(new T.ConeGeometry(r, len, 8).rotateX(Math.PI / 2).translate(0, 0, len / 2), mat, x, y, z, par); m.rotation.set(ax || 0, ay || 0, 0); return m; };
    const horn = this.hornM || (this.hornM = std({ color: 0xe9dcc0, metalness: .1, roughness: .6 }));
    const bone = this.boneM || (this.boneM = std({ color: 0xe8e2d0, metalness: 0, roughness: .7 }));
    const b = body || 'ninja';
    if (['oni', 'ashura', 'raijin', 'dragon'].includes(b)) for (const s of [-1, 1]) spike(H, -.4, s * 2.6, 2.4, 1.3, 7, b === 'raijin' ? gold : b === 'dragon' ? std({ color: new T.Color(cb).multiplyScalar(.6) }) : horn, s * -.45, -.2);
    if (b === 'viking') for (const s of [-1, 1]) spike(H, 0, s * 3.4, 1.4, 1.4, 8, horn, s * -1.05, 0);
    if (['kitsune', 'neko', 'wolf'].includes(b)) for (const s of [-1, 1]) spike(H, -.6, s * 2.3, 2.8, 1.5, b === 'kitsune' ? 5.4 : 4.2, std({ color: new T.Color(b === 'wolf' ? '#4a5478' : cb).multiplyScalar(.7) }), s * -.3, 0);
    if (b === 'kitsune') for (let i = -1; i <= 1; i++) spike(torso, -4, i * 1.6, 3, 1.1, 9, glow(ca), Math.PI / 2 + .5 + i * .3 * 0, -1.9 + i * .25).rotation.x = i * .4 + 0;
    if (b === 'dragon' || b === 'wolf') spike(torso, -4, 0, 1, 1.2, 10, std({ color: new T.Color(b === 'wolf' ? '#4a5478' : cb).multiplyScalar(.6) }), 0, -2);
    if (b === 'tengu') spike(H, 3.6, 0, -.2, 1.4, 8, std({ color: 0xc8202c }), 0, Math.PI / 2);
    if (b === 'ronin') { const hat = P0(new T.ConeGeometry(7.5, 2.8, 20).rotateX(Math.PI / 2), this.M.wood, 0, 0, 3.6, H); hat.rotation.x = Math.PI; hat.rotation.x = 0; }
    if (b === 'witch') { P0(new T.CylinderGeometry(6, 6, .4, 20).rotateX(Math.PI / 2), this.M.dark, 0, 0, 2.8, H); spike(H, 0, 0, 2.9, 3.2, 8, this.M.dark, 0, -.3); }
    if (['shogun', 'chromesam', 'sovereign', 'knight'].includes(b)) {
      if (b === 'knight') { P0(new T.SphereGeometry(4.7, 16, 12), std({ color: 0xaab4c8, metalness: .9, roughness: .25 }), 0, 0, .2, H); P0(new T.BoxGeometry(1, 1.4, 6), glow(cb), 0, 0, 5, H); }
      else for (const s of [-1, 1]) { const c = P0(new T.BoxGeometry(.6, 1, 5), gold, 3, s * 1.6, 3.6, H); c.rotation.x = s * -.55; }
    }
    if (b === 'seraph') { const halo = P0(new T.TorusGeometry(3.4, .45, 8, 28), glow('#ffd23f'), 0, 0, 6.6, H); void halo; for (const s of [-1, 1]) { const w = P0(new T.BoxGeometry(1, 11, 7), glow('#e8f6ff'), -3.4, s * 6, 11, torso); w.rotation.x = s * .5; } }
    if (b === 'lich' || b === 'skull') { H.children[0].material = bone; if (b === 'lich') spike(H, -.6, 0, 1.4, 5, 7, this.M.dark, 0, -.25); }
    if (['mecha', 'exo', 'pixel', 'netrunner'].includes(b)) { P0(new T.CylinderGeometry(.25, .25, 5, 6).rotateX(Math.PI / 2), this.M.metal, -1, 2, 5, H); P0(new T.SphereGeometry(.7, 8, 6), glow(ca), -1, 2, 7.6, H); if (b !== 'netrunner') P0(new T.BoxGeometry(6.6, 8, 6.6), std({ color: 0x3a4262, metalness: .8, roughness: .3 }), 0, 0, 0, H); }
    if (b === 'rider') P0(new T.SphereGeometry(4.9, 16, 12), std({ color: 0x111118, metalness: .9, roughness: .12 }), 0, 0, .3, H);
    if (b === 'pumpkin') { H.children[0].material = std({ color: 0xff7a1a, roughness: .6, emissive: 0x401800, emissiveIntensity: .5 }); H.children[0].scale.set(1.25, 1.25, 1.05); P0(new T.CylinderGeometry(.5, .5, 1.6, 6).rotateX(Math.PI / 2), std({ color: 0x2a6a20 }), 0, 0, 5.4, H); }
    if (b === 'yurei') { for (const [hip] of g.legs) hip.visible = false; spike(g.hips, 0, 0, -13, 5.6, 15, this.ghostMat('#cfe8ff'), 0, 0); }
    if (b === 'blaze') for (let i = -1; i <= 1; i++) spike(H, -.8, i * 1.8, 2.4, 1.8, 7 - Math.abs(i) * 1.5, glow('#ff6a00'), i * -.3, -.3);
    if (b === 'idol') { const ring = P0(new T.TorusGeometry(4.6, .35, 6, 24), glow(ca), 0, 0, .4, H); ring.rotation.y = Math.PI / 2; for (const s of [-1, 1]) spike(H, -2, s * 3.6, 1.6, 1.1, 7, std({ color: new T.Color(cb).multiplyScalar(.7) }), s * -2.4, -.5); }
    if (b === 'yeti') { const fur = std({ color: 0xe8eef8, roughness: .95, metalness: 0 }); P0(new T.SphereGeometry(6.4, 14, 10), fur, 0, 0, 8, torso); H.children[0].material = fur; }
    if (b === 'goo') { const gm = new T.MeshStandardMaterial({ color: new T.Color(ca), transparent: true, opacity: .45, emissive: new T.Color(ca), emissiveIntensity: .4, roughness: .1 }); P0(new T.SphereGeometry(9, 18, 14), gm, 0, 0, 10, torso).scale.set(1, 1, 1.25); }
    if (b === 'ninja' || b === 'shinobi2') for (const s of [-1, 1]) { const t = P0(new T.BoxGeometry(5, .5, .9), glow(cb), -5.4, s * .7, .9, H); t.rotation.z = s * .25; }
  },
  /* ---------- bullets ---------- */
  bullets() {
    const T = THREE; if (!this.bu) { this.bu = new T.InstancedMesh(new T.SphereGeometry(1, 12, 8), new T.MeshBasicMaterial({ color: 0xffffff }), 220); this.bu.frustumCulled = false; this.bu.count = 0; this.root.add(this.bu); this.m4b = new T.Matrix4(); this.cb = new T.Color(); }
    const m4 = this.m4b, c = this.cb, M = this.bu; let n = 0;
    for (let i = 0; i < BU.n && n < 220; i++) { const b = BU.a[i]; if (!b.alive) continue; const r = Math.max(3, (b.r || 6) * .9); m4.makeScale(r, r, r); m4.setPosition(b.x, b.y, 7); M.setMatrixAt(n, m4); if (b.rf) c.setRGB(.4, 2.2, 2.4); else c.setRGB(2.6, .45, .7); M.setColorAt(n, c); n++; }
    for (let i = 0; i < PB.n && n < 220; i++) { const b = PB.a[i]; if (!b.alive) continue; const r = Math.max(3, (b.r || 6) * .8); m4.makeScale(r, r, r); m4.setPosition(b.x, b.y, 8); M.setMatrixAt(n, m4); c.set(b.c || '#00ff88').multiplyScalar(2.2); M.setColorAt(n, c); n++; }
    M.count = n; M.instanceMatrix.needsUpdate = true; if (M.instanceColor) M.instanceColor.needsUpdate = true;
  }
});
{ // the hero is rebuilt when the skin or the weapon changes
  const ent0 = R3.ent.bind(R3);
  R3.ent = function (key, mk) {
    if (key === 'hero') { const body = (P.skin && P.skin.body) || 'ninja', wid = (P.w && P.w.id) || 'katana', sig = body + '|' + wid, r = this.ents.get('hero');
      if (r && r.sig !== sig) { this.root.remove(r.g); r.g.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); this.ents.delete('hero'); }
      const g = ent0(key, () => { const h = mk(); try { const ca = (W3D.ho && W3D.ho.ca) || P.ca || '#00f2fe', cb = (W3D.ho && W3D.ho.cb) || P.cb || '#ff0844'; this.weapon(h, wid); this.dress(h, body, ca, cb); } catch (e) { errLog(e); } return h; });
      const rr = this.ents.get('hero'); if (rr) rr.sig = sig; if (g.spin) g.spin.rotation.z = this.t * 14; return g; }
    return ent0(key, mk);
  };
  // the dual blade in the off hand follows the swing too
  const ah0 = R3.animHero.bind(R3); R3.animHero = function (g, o, rd, t) { ah0(g, o, rd, t); if (g.blade2) g.arms[0].rotation.z = -(g.arms[1].rotation.z) * .6 - .5; };
  // bullets, and the picture follows the phone's speed
  const rn0 = R3.render.bind(R3);
  R3.render = function (rd) {
    const now = performance.now(), dt = this.tPrev ? now - this.tPrev : 16; this.tPrev = now;
    if (dt < 250) { this.ema = this.ema == null ? dt : this.ema * .94 + dt * .06; this.slowT = this.ema > 24 ? (this.slowT || 0) + dt : 0; this.fastT = this.ema < 14 ? (this.fastT || 0) + dt : 0; }
    if (!resK()) { if (this.slowT > 1500) { this.dyn = Math.max(.55, (this.dyn || 1) - .15); this.slowT = 0; this.fastT = 0; } else if (this.fastT > 5000 && (this.dyn || 1) < 1) { this.dyn = Math.min(1, this.dyn + .1); this.fastT = 0; } } else this.dyn = 1;
    rn0(rd); // (version 42: bullets are placed in the sweep hook, before the frame is drawn)
  };
}

/* ---------------- menus ---------------- */
{ const css = document.createElement('style'); css.id = 'v41css';
  css.textContent = `
.today { padding: 0; display: flex; flex-direction: column; overflow: hidden; }
.today-h { display: flex; align-items: center; gap: 10px; width: 100%; padding: 14px 14px; text-align: start; color: var(--fg); font: 700 16px var(--fd); letter-spacing: 1px; min-height: 52px; }
.today-h .tt { flex: 1; } .today-h .cv { transition: transform .2s; font-size: 14px; color: var(--cyan); } .today.open .today-h .cv { transform: rotate(180deg); }
.today-h .chip.rdy { animation: pulse .7s infinite alternate; }
.today-b { display: none; flex-direction: column; gap: 10px; padding: 0 10px 12px; } .today.open .today-b { display: flex; }
.today-b > .panel, .today-b > .evbanner { margin: 0; }
#bQuick { min-height: 48px; font-size: 15px; gap: 10px; border-color: rgba(0, 242, 254, .5); }
#bQuick .qm { color: var(--cyan); }
.unlock39 { position: fixed; inset: 0; z-index: 70; display: grid; place-items: center; padding: 18px; background: rgba(3, 4, 10, .72); animation: scrIn .25s ease-out; }
.unlock39 .card { width: min(380px, 100%); display: flex; flex-direction: column; gap: 12px; padding: 18px; background: linear-gradient(160deg, #1a1440, #0a0e26 70%); border: 1px solid var(--gold); clip-path: var(--cut); box-shadow: 0 0 40px rgba(255, 215, 0, .25); text-align: center; }
.unlock39 h2 { color: var(--gold); font-size: 22px; }
.unlock39 .ul { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.unlock39 .ul span { padding: 8px 12px; border: 1px solid rgba(0, 242, 254, .45); background: rgba(0, 242, 254, .08); clip-path: var(--cut); font: 700 14px var(--fd); animation: cardIn .35s cubic-bezier(.2, .9, .3, 1) both; }
@media (prefers-reduced-motion: reduce) { .unlock39, .unlock39 .ul span, .today-h .chip.rdy { animation: none; } }
`; document.head.appendChild(css); }

const Today = {
  ids: ['tLogin', 'bEvent', 'bDop', 'bLegend', 'bDaily', 'tBountyBox'],
  build() {
    const grid = $('bArcade') && $('bArcade').parentElement; if (!grid) return;
    let box = $('tToday');
    if (!box) { box = el('div', 'panel today'); box.id = 'tToday'; const h = el('button', 'today-h'); h.id = 'tTodayH'; h.type = 'button'; const b = el('div', 'today-b'); b.id = 'tTodayB'; box.appendChild(h); box.appendChild(b);
      h.onclick = () => { Aud.sfx('ui'); const s = Store.data.settings; s.today = box.classList.contains('open') ? 0 : 1; Store.touch(); this.sync(); }; }
    if (box.previousElementSibling !== grid) grid.after(box);
    const body = $('tTodayB'); const want = this.ids.map(id => $(id)).filter(Boolean); if (want.some((e, i) => body.children[i] !== e)) for (const e of want) body.appendChild(e);
    this.sync();
  },
  sync() {
    const box = $('tToday'), body = $('tTodayB'), h = $('tTodayH'); if (!box || !body || !h) return;
    const vis = [...body.children].filter(e => !e.classList.contains('hidden')), login = $('tLogin'), ready = !!(login && !login.classList.contains('hidden') && login.querySelector('button:not([disabled])'));
    box.classList.toggle('hidden', !vis.length);
    const s = Store.data.settings, open = ready || (s.today == null ? 0 : s.today);
    box.classList.toggle('open', !!open); h.setAttribute('aria-expanded', open ? 'true' : 'false');
    h.textContent = ''; h.appendChild(el('span', 'tt', lt('TODAY'))); if (ready) h.appendChild(el('span', 'chip gold rdy', lt('REWARD READY'))); else h.appendChild(el('span', 'chip', ltf('{0} ACTIVE', vis.length))); h.appendChild(el('span', 'cv', '▼'));
  }
};
const Quick = {
  sync() {
    const d = Store.data, m = d.lastMode && MODES.find(x => x.id === d.lastMode && !x.mp), story = $('bStory'); let b = $('bQuick');
    if (!m || !story) { if (b) b.classList.add('hidden'); return; }
    if (!b) { b = el('button', 'btn'); b.id = 'bQuick'; b.type = 'button'; b.onclick = () => { Aud.sfx('ui'); const id = Store.data.lastMode; if (id) Flow.startArcade(id); }; }
    if (b.previousElementSibling !== story) story.after(b);
    b.classList.remove('hidden'); b.textContent = ''; b.appendChild(el('span', '', '▶ ' + lt('QUICK PLAY'))); b.appendChild(el('span', 'qm', lt(m.name)));
  }
};
{ // the title screen: TODAY card, QUICK PLAY, NEW badges that fade out after a few visits
  const run = () => { try { Today.build(); Quick.sync(); } catch (e) { errLog(e); } };
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () {
    const r = ot0.apply(this, arguments);
    try { const d = Store.data; d.uiNewN = d.uiNewN || {}; let ch = false;
      for (const g of GATES) { const e = $(g.el); if (!e || !e.classList.contains('new')) continue; d.uiNewN[g.id] = (d.uiNewN[g.id] | 0) + 1;
        if (d.uiNewN[g.id] > 4) { d.uiSeen[g.id] = 1; e.classList.remove('new'); } ch = true; }
      if (ch) Store.touch(); } catch (e) { errLog(e); }
    run(); requestAnimationFrame(run); setTimeout(run, 900); return r;
  };
  if (typeof PC !== 'undefined' && PC.titleLayout) { const tl0 = PC.titleLayout.bind(PC); PC.titleLayout = function () { tl0(); run(); }; }
  const sa0 = Flow.startArcade.bind(Flow); Flow.startArcade = function (mode) { try { const m = MODES.find(x => x.id === mode); if (m && !m.mp) { Store.data.lastMode = mode; Store.touch(); } } catch (e) { errLog(e); } return sa0.apply(this, arguments); };
  // "NEW ON THE TITLE SCREEN: a, b, c" becomes a card
  const td0 = toastDom; toastDom = function (msg) {
    try { const pre = ltf('NEW ON THE TITLE SCREEN: {0}', ''); if (typeof msg === 'string' && pre && msg.startsWith(pre) && msg.length > pre.length) {
      const items = msg.slice(pre.length).split(', ').filter(Boolean), ov = el('div', 'unlock39'), card = el('div', 'card');
      card.appendChild(el('div', 'eyebrow', lt('UNLOCKED'))); card.appendChild(el('h2', '', lt('NEW ON THE TITLE SCREEN')));
      const ul = el('div', 'ul'); items.forEach((t, i) => { const s = el('span', '', t); s.style.animationDelay = (i * .05) + 's'; ul.appendChild(s); }); card.appendChild(ul);
      const ok = el('button', 'btn pri', lt('GOT IT')); card.appendChild(ok); ov.appendChild(card); document.body.appendChild(ov);
      const close = () => { ov.remove(); }; ok.onclick = () => { Aud.sfx('ui'); close(); }; ov.addEventListener('click', e => { if (e.target === ov) close(); }); setTimeout(close, 9000);
      return; } } catch (e) { errLog(e); }
    return td0.apply(this, arguments);
  };
}
