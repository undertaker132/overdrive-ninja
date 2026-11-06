/* ---------------- MONSTERS 2 — enemies and bosses with depth, gloss and menace ----------------
   Drawn around the existing art, render only:
   - every enemy casts a contact shadow on the roof, gets a glossy highlight
     and a rim light in its own color; elites wear a rotating gold halo;
   - bosses stand on a pulsing aura, light up white when hit, and spit
     electric arcs when their health runs low. */
const Monster = {
  bh: {}, // boss health last frame, for the hit flash
  pre(e) {
    if (CALM || Q.lvl < 1 || e.vis < .3 || !(e.scale > .2)) return; const r = e.r * e.scale;
    cx.save(); cx.globalAlpha = .38 * e.vis; cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(e.x + r * .25, e.y + r * .55, r * 1.05, r * .45, 0, 0, TAU); cx.fill(); cx.restore();
  },
  post(e) {
    if (CALM || Q.lvl < 1 || !e.alive || e.vis < .3 || !(e.scale > .2)) return; const r = e.r * e.scale, c = e.col || '#ffffff';
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .22 * e.vis;
    glow(e.x - r * .35, e.y - r * .4, r * .7, '#ffffff', 1); // cached sprite: no gradient per enemy per frame
    cx.globalAlpha = .55 * e.vis; cx.strokeStyle = c; cx.lineWidth = 2; cx.shadowColor = c; cx.shadowBlur = 8; cx.beginPath(); cx.arc(e.x, e.y, r * 1.02, .2, 1.6); cx.stroke();
    cx.restore();
    if (e.elite) { cx.save(); cx.strokeStyle = '#ffd23f'; cx.globalAlpha = .75; cx.lineWidth = 2; cx.setLineDash([5, 6]); cx.lineDashOffset = -CAM.t * 30; cx.beginPath(); cx.arc(e.x, e.y, r + 9, 0, TAU); cx.stroke(); cx.setLineDash(NODASH);
      cx.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * .45; cx.beginPath(); cx.moveTo(e.x + Math.cos(a) * (r + 6), e.y + Math.sin(a) * (r + 6)); cx.lineTo(e.x + Math.cos(a) * (r + 16), e.y + Math.sin(a) * (r + 16)); cx.lineTo(e.x + Math.cos(a + .12) * (r + 6), e.y + Math.sin(a + .12) * (r + 6)); cx.fill(); } cx.restore(); }
  },
  bossPre(b) {
    if (CALM || Q.lvl < 1 || !b || b.enter < .2) return; const col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844', R = b.r * 2.3, p = .5 + .5 * Math.sin(CAM.t * 3);
    cx.save(); cx.globalAlpha = .5; cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(b.x + b.r * .2, b.y + b.r * .7, b.r * 1.4, b.r * .55, 0, 0, TAU); cx.fill();
    cx.globalCompositeOperation = 'lighter'; glow(b.x, b.y, R * (1 + p * .1), col, .12 + p * .06);
    cx.strokeStyle = col; cx.globalAlpha = .35; cx.lineWidth = 2; cx.setLineDash([14, 10]); cx.lineDashOffset = CAM.t * 40; cx.beginPath(); cx.arc(b.x, b.y, b.r * 1.55, 0, TAU); cx.stroke(); cx.setLineDash(NODASH); cx.restore();
  },
  bossPost(b) {
    if (CALM || Q.lvl < 1 || !b || b.dying > 0 || b.enter < .2) return; const col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
    const k = b.id + (b.lvl | 0), h0 = this.bh[k]; this.bh[k] = b.hp; if (h0 != null && b.hp < h0) b._fl = .12;
    if (b._fl > 0) { b._fl -= RDT; cx.save(); cx.globalCompositeOperation = 'lighter'; glow(b.x, b.y, b.r * 1.6, '#ffffff', .45 * b._fl / .12); cx.restore(); }
    cx.save(); cx.strokeStyle = '#ffffff'; cx.globalAlpha = .35; cx.lineWidth = 3; cx.shadowColor = col; cx.shadowBlur = 16; cx.beginPath(); cx.arc(b.x, b.y, b.r * .98, 3.6, 5.2); cx.stroke(); cx.restore();
    if (b.hp < b.mhp * .3) { cx.save(); cx.strokeStyle = col; cx.lineWidth = 2; cx.globalCompositeOperation = 'lighter'; const n = 3;
      for (let i = 0; i < n; i++) { const s = Math.floor(CAM.t * 12) + i * 17; if (cmRand(s) > .55) continue; const a = cmRand(s + 3) * TAU, r0 = b.r * .8, r1 = b.r * (1.3 + cmRand(s + 5) * .4);
        cx.globalAlpha = .8; cx.beginPath(); cx.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); for (let j = 1; j <= 4; j++) { const q = r0 + (r1 - r0) * j / 4, w = (cmRand(s + j * 7) - .5) * .35; cx.lineTo(b.x + Math.cos(a + w) * q, b.y + Math.sin(a + w) * q); } cx.stroke(); }
      cx.restore(); }
  }
};
{
  const de0 = drawEnemy; drawEnemy = function (e) { const body = EDRAW & ED_BODY; if (body) try { Monster.pre(e); } catch (er) { errLog(er); } de0(e); if (body) try { Monster.post(e); } catch (er) { errLog(er); } };
  const bd0 = Boss.draw.bind(Boss); Boss.draw = function () { const b = this.cur; try { Monster.bossPre(b); } catch (er) { errLog(er); } bd0(); try { Monster.bossPost(b); } catch (er) { errLog(er); } };
}
/* the hero on the roof: a contact shadow and a glossy rim, like the enemies */
{
  const dh0 = drawHero;
  drawHero = function (h) {
    const on = !CALM && Q.lvl >= 1 && h && (h.alpha == null || h.alpha > .3) && inRun();
    if (on) { cx.save(); cx.globalAlpha = .35 * (h.alpha == null ? 1 : h.alpha); cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(h.x + 3, h.y + 9, 15, 6, 0, 0, TAU); cx.fill(); cx.restore(); }
    dh0(h);
    if (on) { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .22; glow(h.x - 4, h.y - 5, 9, '#ffffff', 1); cx.globalAlpha = .5; cx.strokeStyle = h.ca || '#00f2fe'; cx.lineWidth = 1.5; cx.shadowColor = h.ca || '#00f2fe'; cx.shadowBlur = 8; cx.beginPath(); cx.arc(h.x, h.y, 12, .3, 1.5); cx.stroke(); cx.restore(); }
  };
}
