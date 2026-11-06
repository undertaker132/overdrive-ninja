/* ---------------- EX BOSSES (the SECRETS chapter) ----------------
   An EX stage spawns its act's final boss in EX form: 60% more health, it
   moves and attacks 15% faster, and every 5 seconds it throws a ring of
   shots (two rings below half health). A red aura and an EX tag mark it.
   Only story stages with `ex` use this, so nothing else changes. */
{
  const spawn0 = Boss.spawn.bind(Boss);
  Boss.spawn = function (id, lvl) {
    const b = spawn0(id, lvl);
    if (b && G.mode === 'story' && G.stage && G.stage.ex) { b.mhp = b.hp = b.hp * 1.6; b.lastHp = b.hp; for (const p of b.parts) p.mhp = p.hp = p.hp * 1.3; b.ex = 1; b.exT = 4; FX.call(lt('EX BOSS'), '#ff0844', 3, 30); }
    return b;
  };
  const upd0 = Boss.update.bind(Boss);
  Boss.update = function (dt, rd) {
    const b = this.cur;
    if (b && b.ex && b.dying <= 0 && b.enter >= 1 && G.freeze <= 0 && !(b.stag > 0)) {
      b.exT -= dt; if (b.exT <= 0) { b.exT = 5; const n = b.hp < b.mhp * .5 ? 2 : 1;
        for (let r = 0; r < n; r++) for (let k = 0; k < 16; k++) shoot(b.x, b.y, k * TAU / 16 + b.t + r * TAU / 32, 170 + r * 50, r ? 3 : 0);
        FX.ring(b.x, b.y, b.r + 60, '#ff0844', 5); Aud.sfx('laser'); }
      return upd0(dt * 1.15, rd);
    }
    return upd0(dt, rd);
  };
  const draw0 = Boss.draw.bind(Boss);
  Boss.draw = function () {
    const b = this.cur;
    if (b && b.ex && b.dying <= 0) { cx.save(); cx.globalAlpha = .35 + .15 * Math.sin(CAM.t * 6); glow(b.x, b.y, b.r * 3.2, '#ff0844', .5); cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(b.x, b.y, b.r + 26, -CAM.t, -CAM.t + TAU); cx.stroke(); cx.setLineDash(NODASH); cx.restore(); }
    draw0();
    if (b && b.ex && b.dying <= 0) { cx.save(); cx.font = '900 14px ' + FONT_D; cx.textAlign = 'center'; cx.fillStyle = '#ff0844'; cx.fillText('EX', b.x, b.y - b.r - 34); cx.restore(); }
  };
}
