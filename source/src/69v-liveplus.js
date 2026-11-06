/* =====================================================================
   LIVE PLAY 2 (version 22) — friends on your roof look and move like
   themselves: their own hero, weapon, blade skin and pet, the real swing
   animation every time they dash, their Overdrive glow, their shields
   over their head, and quick emotes (the 💬 button or keys 1-6) that
   pop up over their hero for everyone in the room.
   All of it is drawn from presence (about 10 updates a second) and never
   touches the simulation, so races and raids stay fair and replays exact.
   ===================================================================== */
const FRIEND_COL = ['#ff4fd8', '#ffd23f', '#7dff6a', '#ff8a3d'];
const EMOTES = ['NICE!', 'HELP!', 'GG', "LET'S GO!", 'ON MY WAY', 'SORRY!'];
const LivePlus = {
  em: -1, emN: 0, emT: 0, menu: null, btn: null,
  emote(i) {
    if (!Live.r || (G.mode !== 'race' && G.mode !== 'raid') || i < 0 || i >= EMOTES.length) return;
    this.em = i; this.emN = (this.emN + 1) % 1000; this.emT = 2.4; Live.pres({ em: i, en: this.emN }); Aud.sfx('ui'); this.closeMenu();
  },
  pres() { // the extra fields sent with every presence update during a run
    return { w: P.w ? P.w.id : 'katana', bl: Store.data.blade || 'std', a: Math.round((P.face || 0) * 100), q: P.seq % 1000, od: G.odT > 0 ? 1 : 0, pt: G.pet && G.pet !== 'none' ? G.pet : '', ds: P.dashT > 0 ? 1 : 0 };
  },
  ghost(p, g, o, rd) { // called for each friend after the base pose is set
    const pr = p.presence;
    const w = WEAPONS.some(x => x.id === pr.w) ? pr.w : 'katana'; o.w = w; o.fx = bladeOf(typeof pr.bl === 'string' ? pr.bl : 'std'); if (o.fx && !o.fx.blade) o.fx = null;
    o.bl = w === 'spear' || w === 'nodachi' || w === 'staff' ? 40 : 46; o.od = pr.od ? 1 : 0; o.dashing = !!pr.ds || o.dashing;
    if (typeof pr.a === 'number') { const fa = pr.a / 100; if (!(o.spd > 30)) o.face = fa; o.blade = fa + 1.8; }
    if (!g.sw) g.sw = swState();
    if (pr.q !== g.q) { if (g.q != null) { SWING.start(g.sw, w, o.face, CAM.t); g.sw.d = g.sd = -(g.sd || 1); } g.q = pr.q; }
    if (SWING.pose(g.sw, CAM.t, o.face + 1.8)) { SWING.rec(g.sw, CAM.t); SWING.apply(g.sw, o); g.swOn = true; } else { SWING.reset(o); g.swOn = false; }
    if (pr.en !== g.en) { if (g.en != null && typeof pr.em === 'number' && pr.em >= 0 && pr.em < EMOTES.length) { g.emT = 2.4; g.em = pr.em; } g.en = pr.en; }
  },
  col(p) { // each friend keeps one color: their ring, name and score
    const ids = Live.players().filter(q => !q.sameTab).map(q => q.peer).sort(); return FRIEND_COL[Math.max(0, ids.indexOf(p.peer)) % FRIEND_COL.length];
  },
  ring(g, col) { // (v32) a ring on the roof under a friend, so you always see where they are
    const t = CAM.t; cx.save(); cx.strokeStyle = col; cx.globalAlpha = .7; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(g.x, g.y, 25, 0, TAU); cx.stroke();
    cx.globalAlpha = .45 + .25 * Math.sin(t * 5); cx.lineWidth = 2; cx.setLineDash(DASH6); cx.lineDashOffset = -t * 30; cx.beginPath(); cx.arc(g.x, g.y, 33, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.lineDashOffset = 0;
    cx.globalAlpha = .16; cx.fillStyle = col; cx.beginPath(); cx.arc(g.x, g.y, 25, 0, TAU); cx.fill(); cx.restore();
  },
  after(p, g, o, col) { // shields, pet, name and emote over a friend
    const pr = p.presence;
    if (g.swOn) SWING.smear(g.sw, g.x, g.y, o.bl, SW_COL[o.w] || col, CAM.t);
    if (typeof pr.pt === 'string' && PET_BY_ID[pr.pt]) { cx.globalAlpha = .85; drawPet(pr.pt, g.x - 30, g.y + 16, g.x > (g.px || g.x) ? 0 : Math.PI, CAM.t * 10, CAM.t, false, 0, 0); cx.globalAlpha = 1; }
    g.px = g.x;
    if (pr.od) { cx.globalAlpha = .4 + .2 * Math.sin(CAM.t * 10); cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.beginPath(); cx.arc(g.x, g.y, 30, 0, TAU); cx.stroke(); cx.globalAlpha = 1; }
    const tag = () => { // over the head: shields, then the name on a tag (standing up in 3D)
      const hp = clamp(pr.hp | 0, 0, 8); if (hp) { cx.globalAlpha = .95; for (let k = 0; k < hp; k++) { cx.fillStyle = '#00ff88'; cx.fillRect(g.x - hp * 4 + k * 8 + 1, g.y - 44, 6, 4); } cx.globalAlpha = 1; }
      const nm = Live.nameOf(p).toUpperCase().slice(0, 12); cx.font = '800 11px ' + FONT_M; cx.textAlign = 'center'; const w = cx.measureText(nm).width + 12;
      cx.globalAlpha = .9; cx.fillStyle = 'rgba(8,10,24,.85)'; rrect(g.x - w / 2, g.y - 64, w, 16, 5); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 1.5; cx.stroke();
      cx.globalAlpha = 1; cx.fillStyle = col; cx.fillText(nm, g.x, g.y - 52);
      if (g.emT > 0) { g.emT -= RDT; this.bubble(g.x, g.y - 82, lt(EMOTES[g.em]), Math.min(1, g.emT * 3), col); }
    };
    if (in3D()) W3D.stand(g.x, g.y, tag); else tag();
  },
  bubble(x, y, t, a, col) {
    cx.save(); cx.globalAlpha = a; cx.font = '800 12px ' + FONT_D; cx.textAlign = 'center'; const w = cx.measureText(t).width + 16;
    cx.fillStyle = 'rgba(8,10,24,.92)'; rrect(x - w / 2, y - 12, w, 22, 6); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 1.5; cx.stroke();
    cx.fillStyle = 'rgba(8,10,24,.92)'; cx.beginPath(); cx.moveTo(x - 5, y + 10); cx.lineTo(x, y + 16); cx.lineTo(x + 5, y + 10); cx.fill();
    cx.fillStyle = '#ffffff'; cx.fillText(t, x, y + 4); cx.restore();
  },
  drawMine() { if (this.emT > 0 && this.em >= 0) { this.emT -= RDT; const f = () => this.bubble(P.x, P.y - 58, lt(EMOTES[this.em]), Math.min(1, this.emT * 3), '#00f2fe'); if (in3D()) W3D.stand(P.x, P.y, f); else f(); } },
  /* the 💬 button, only while you are in a live run */
  syncBtn() {
    const on = !!Live.r && (G.mode === 'race' || G.mode === 'raid') && G.state === 'PLAY';
    if (!this.btn) { const b = this.btn = el('button', 'hidden', '💬'); b.id = 'emoBtn'; b.setAttribute('aria-label', lt('Emotes')); b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); this.menu ? this.closeMenu() : this.openMenu(); }); document.body.appendChild(b); }
    this.btn.classList.toggle('hidden', !on); if (!on) this.closeMenu();
  },
  openMenu() {
    this.closeMenu(); const m = this.menu = el('div', 'emoMenu'); m.id = 'emoMenu';
    EMOTES.forEach((t, i) => { const b = el('button', '', lt(t)); b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); this.emote(i); }); m.appendChild(b); });
    m.addEventListener('pointerdown', e => e.stopPropagation()); document.body.appendChild(m);
  },
  closeMenu() { if (this.menu) { this.menu.remove(); this.menu = null; } }
};
{ // hook into the live code
  const tick0 = Live.tick.bind(Live);
  Live.extra = () => LivePlus.pres(); // (sent with the position, in the same presence update)
  Live.tick = function (rd) { tick0(rd); LivePlus.syncBtn(); };
  const draw0 = Live.drawGhosts.bind(Live);
  Live.r3f = [];
  Live.drawGhosts = function (rd) {
    Live.r3f.length = 0; // (the three.js view draws the friends listed here)
    if (!this.r || (G.mode !== 'race' && G.mode !== 'raid')) return;
    const keep = drawHero; // wrap drawHero for the friends only: their own gear, swing, then shields/pet/emote
    const list = this.players().filter(p => !p.sameTab && p.presence && p.presence.st === 'play'); let idx = 0;
    drawHero = function (o) {
      const p = list[idx++], g = p && Live.ghosts[p.peer], col = p ? LivePlus.col(p) : '#ff4fd8';
      if (g) { LivePlus.ghost(p, g, o, rd); LivePlus.ring(g, col); }
      if (g && in3D() && R3.on) Live.r3f.push({ peer: p.peer, x: g.x, y: g.y, face: o.face, spd: o.spd, ph: o.ph, dashing: o.dashing, blade: o.blade, bl: o.bl, alpha: 1, ca: o.ca, cb: o.cb }); // 3D: a real 3D ninja, like yours
      else if (g && in3D()) { W3D.skipHero = 1; try { keep(o); } finally { W3D.skipHero = 0; } } // CLASSIC 3D: stands up lit like you (neon rim, reflection)
      else keep(o);
      if (g) LivePlus.after(p, g, o, col); SWING.reset(o);
    };
    try { draw0(rd); } finally { drawHero = keep; }
    LivePlus.drawMine();
  };
  window.addEventListener('keydown', e => { if (G.state !== 'PLAY' || !Live.r) return; const k = e.code && /^Digit([1-6])$/.exec(e.code); if (k) LivePlus.emote(+k[1] - 1); });
}
