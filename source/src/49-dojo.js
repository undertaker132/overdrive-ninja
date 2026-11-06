/* =====================================================================
   TRAINING DOJO — guided drills on harmless training posts.
   You cannot lose here; every move gets its own short drill.
   ===================================================================== */
const DOJO_DRILLS = [
  { id: 'slash', t: 'SLASH 5 DUMMIES', d: 'Drag anywhere to aim, release to dash-slash. A quick tap dashes to that spot.', n: 5 },
  { id: 'bounce', t: '3 WALL-BOUNCE KILLS', d: 'Dash into a side rail: you bounce off and the next hit is always critical.', n: 3 },
  { id: 'chain', t: 'CHAIN-SLASH 3 TARGETS', d: 'Drag your aim line across 3 dummies to lock them, then release.', n: 1 },
  { id: 'parry', t: '3 PERFECT PARRIES', d: 'Slash into an orange bullet right as it reaches you.', n: 3 },
  { id: 'dodge', t: 'DODGE 3 TIMES', d: 'Use up your dash charges, then swipe again to sidestep.', n: 3 },
  { id: 'shield', t: 'BREAK A SHIELD', d: 'The green arc blocks hits from the front. Bounce off a rail first, or hit it from behind.', n: 1 },
  { id: 'od', t: 'TRIGGER OVERDRIVE', d: 'Your meter is full. Tap OVERDRIVE (or Space).', n: 1 }
];
const Dojo = {
  i: 0, n: 0, fire: 0, wait: 0, done: false, free: false,
  begin() { this.i = 0; this.n = 0; this.fire = 1.5; this.wait = 0; this.done = false; this.free = false; this.setup(); },
  cur() { return DOJO_DRILLS[Math.min(this.i, DOJO_DRILLS.length - 1)]; },
  clearPosts() { for (let i = 0; i < EN.n; i++) if (EN.a[i].type === ET.DUMMY) { FX.spark(EN.a[i].x, EN.a[i].y, '#d9b46a', 6); EN.a[i].alive = false; } EN.sweep(); for (let i = 0; i < BU.n; i++) BU.a[i].alive = false; },
  post(x, y, shield) { const e = spawnEnemy(ET.DUMMY, clamp(x, V.L + 26, V.R - 26), clamp(y, 90, V.VH - 170), false); if (e) { e.spawnT = .3; e.sh = shield ? 1 : 0; e.dsh = shield ? 1 : 0; } return e; },
  setup() {
    this.clearPosts();
    if (this.free) { for (let k = 0; k < 3; k++) this.post(V.L + 50 + R.f() * (V.AW - 100), 140 + R.f() * (V.VH - 340), k === 2); return; }
    const d = this.cur(), C = V.CX;
    if (d.id === 'slash') { this.post(C - 90, V.VH * .32); this.post(C + 80, V.VH * .4); this.post(C - 20, V.VH * .22); }
    else if (d.id === 'bounce') { this.post(V.L + 36, V.VH * .3); this.post(V.R - 36, V.VH * .38); this.post(V.L + 36, V.VH * .48); }
    else if (d.id === 'chain') { for (let k = 0; k < 4; k++) this.post(C - 105 + k * 70, V.VH * .28); }
    else if (d.id === 'shield') { this.post(C, V.VH * .32, true); }
    else if (d.id === 'od') { G.od = 100; }
    this.fire = 1.2;
  },
  update(dt) {
    if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) this.setup(); return; }
    const d = this.cur(), parry = !this.free && (d.id === 'parry' || d.id === 'dodge');
    let posts = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].type === ET.DUMMY) posts++;
    if (!parry && d.id !== 'od' && posts === 0) { // respawn a fresh set
      if (d.id === 'chain' || d.id === 'shield' || this.free) this.setup();
      else if (d.id === 'bounce') { this.post(R.f() < .5 ? V.L + 36 : V.R - 36, V.VH * (.25 + R.f() * .3)); this.post(R.f() < .5 ? V.L + 36 : V.R - 36, V.VH * (.25 + R.f() * .3)); }
      else { this.post(V.L + 50 + R.f() * (V.AW - 100), V.VH * (.2 + R.f() * .3)); this.post(V.L + 50 + R.f() * (V.AW - 100), V.VH * (.2 + R.f() * .3)); }
    }
    if (parry || this.free) { // the training turret lobs slow, easy-to-read shots
      this.fire -= dt; if (this.fire <= 0) { this.fire = this.free ? 2.6 : 1.7; G.shooter = 30; shoot(V.CX, 70, Math.atan2(P.y - 70, P.x - V.CX), 210, 0); Aud.sfx('tick'); }
    }
    if (d.id === 'od' && !this.free) { if (G.odT > 0) this.prog(); else if (G.od < 100) G.od = 100; }
  },
  prog() {
    if (this.free || this.wait > 0) return;
    const d = this.cur(); this.n++; Aud.sfx('star', Math.min(3, this.n)); FX.call(this.n + '/' + d.n, '#ffd700', 2, 20);
    if (this.n < d.n) return;
    this.i++; this.n = 0; Aud.sfx('win'); toast(lt('DRILL COMPLETE'), '#00ff88');
    if (this.i >= DOJO_DRILLS.length) this.finish(); else this.wait = 1.1;
  },
  finish() {
    this.done = true; this.free = true; const dj = Store.data.dojo;
    if (!dj.done) { dj.done = 1; Store.data.credits += 150; toast(lt('DOJO COMPLETE  +150 CR'), '#ffd700'); } else toast(lt('DOJO COMPLETE'), '#ffd700');
    ach('dojo'); Store.touch(); this.wait = 1.4;
  },
  onKill(e, src) { const d = this.cur(); if (this.free) return; if (d.id === 'slash' && src === 0) this.prog(); else if (d.id === 'bounce' && src === 0 && P.bounced) this.prog(); },
  onChain(n) { if (G.mode === 'dojo' && !this.free && this.cur().id === 'chain' && n >= 3) this.prog(); },
  onParry(perfect) { if (G.mode === 'dojo' && !this.free && this.cur().id === 'parry' && perfect) this.prog(); },
  onDodge() { if (G.mode === 'dojo' && !this.free && this.cur().id === 'dodge') this.prog(); },
  onShield() { if (G.mode === 'dojo' && !this.free && this.cur().id === 'shield') this.prog(); },
  drawWorld() { // the training turret
    const d = this.cur(); if (!this.free && d.id !== 'parry' && d.id !== 'dodge') return;
    glow(V.CX, 70, 40, '#ffb347', .35); cx.fillStyle = '#5a4428'; cx.beginPath(); cx.arc(V.CX, 70, 18, 0, TAU); cx.fill(); cx.strokeStyle = '#ffb347'; cx.lineWidth = 3; cx.stroke();
    const a = Math.atan2(P.y - 70, P.x - V.CX); cx.save(); cx.translate(V.CX, 70); cx.rotate(a); cx.fillStyle = '#ffb347'; cx.fillRect(0, -4, 28, 8); cx.restore();
  },
  drawHud() {
    const y = V.VH - UI.dockH / V.s - 118, w = Math.min(V.AW + 10, V.VW - 24), x0 = V.CX - w / 2, d = this.cur();
    const title = this.free ? lt('FREE PRACTICE') : lt(d.t) + '  ' + this.n + '/' + d.n, desc = this.free ? lt('Every drill done. Practice as long as you like, then pause to leave.') : lt(d.d);
    cx.fillStyle = 'rgba(14,10,6,.88)'; cx.fillRect(x0, y, w, 50); cx.strokeStyle = '#ffb347'; cx.lineWidth = 1.2; cx.strokeRect(x0 + .5, y + .5, w - 1, 49);
    const tx = tx0(x0, w, 10); cx.textAlign = talS(); cx.fillStyle = '#ffb347'; cx.font = '700 13px ' + FONT_D; cx.fillText((this.free ? '' : (Math.min(this.i + 1, DOJO_DRILLS.length) + '/' + DOJO_DRILLS.length + '  ')) + title, tx, y + 18, w - 20);
    cx.fillStyle = '#e8fbff'; cx.font = "600 12px 'Rajdhani', 'Rubik', system-ui, sans-serif"; cx.fillText(desc, tx, y + 38, w - 20); cx.textAlign = 'left';
  }
};
