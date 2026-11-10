/* =====================================================================
   VERSION 77: EVERY MODE ITS EMBLEM
   The Arcade list was a column of text. Every mode now carries its own
   neon emblem in its own color (a maglev train, a horned boss mask,
   crossed blades in a ring, the tower, a bike, a stopwatch, a blast, the
   sun of the daily run, the weekly calendar, a training dummy), and the
   chosen mode's emblem glows. Display only.
   ===================================================================== */
const ModeArt = {
  COL: { endless: '#00f2fe', bossrush: '#ff3b5c', arena: '#ff2bd6', tower: '#c45bff', highway: '#ffd23f', timeattack: '#00ff88', mayhem: '#ff6a00', daily: '#7df9ff', weekly: '#ffd700', dojo: '#9fb3d9' },
  draw(cv, id) {
    const S = 112, g = cv.getContext('2d'); cv.width = cv.height = S; const c = this.COL[id] || '#00f2fe';
    g.clearRect(0, 0, S, S); g.save(); g.translate(S / 2, S / 2);
    const bg = g.createRadialGradient(0, 0, 4, 0, 0, S * .5); bg.addColorStop(0, hexA(c, .22)); bg.addColorStop(1, hexA(c, 0)); g.fillStyle = bg; g.fillRect(-S / 2, -S / 2, S, S);
    g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round'; g.shadowColor = c; g.shadowBlur = 10;
    const L = (pts, close) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if (close) g.closePath(); g.stroke(); };
    const C = (x, y, r, a0, a1) => { g.beginPath(); g.arc(x, y, r, a0 == null ? 0 : a0, a1 == null ? TAU : a1); g.stroke(); };
    const R = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.stroke(); };
    switch (id) {
      case 'endless': R(-24, -30, 48, 52, 14); R(-16, -22, 32, 16, 4); C(-11, 10, 4); C(11, 10, 4); L([[-30, 34], [30, 34]]); for (const y of [-28, -14]) L([[-46, y], [-32, y]]); break; // a maglev train, head on
      case 'bossrush': L([[-26, -10], [-34, -38], [-14, -22]]); L([[26, -10], [34, -38], [14, -22]]); g.beginPath(); g.moveTo(-26, -14); g.quadraticCurveTo(0, -34, 26, -14); g.lineTo(22, 18); g.quadraticCurveTo(0, 38, -22, 18); g.closePath(); g.stroke();
        L([[-14, -2], [-5, 4]]); L([[14, -2], [5, 4]]); L([[-10, 20], [-5, 14], [0, 20], [5, 14], [10, 20]]); break; // a horned boss mask
      case 'arena': C(0, 0, 36); L([[-24, -24], [24, 24]]); L([[24, -24], [-24, 24]]); L([[-30, -14], [-14, -30]]); L([[30, -14], [14, -30]]); break; // crossed blades in a ring
      case 'tower': L([[-14, 38], [-14, -12], [0, -40], [14, -12], [14, 38]]); for (const y of [-2, 12, 26]) L([[-14, y], [14, y]]); L([[-26, 38], [26, 38]]); break; // the tower
      case 'highway': C(-22, 16, 13); C(24, 16, 13); L([[-22, 16], [-4, -10], [14, -10], [24, 16]]); L([[-4, -10], [-14, -22]]); L([[8, -20], [20, -20]]); for (const y of [-30, -38]) L([[-44, y + 50], [-36, y + 50]]); break; // a bike
      case 'timeattack': C(0, 6, 30); L([[0, 6], [0, -12]]); L([[0, 6], [14, 14]]); L([[-6, -30], [6, -30]]); L([[0, -30], [0, -24]]); L([[24, -18], [30, -24]]); break; // a stopwatch
      case 'mayhem': { const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 16 : 38; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } L(pts, true); C(0, 0, 7); break; } // a blast
      case 'daily': C(0, 0, 14); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; L([[Math.cos(a) * 22, Math.sin(a) * 22], [Math.cos(a) * 34, Math.sin(a) * 34]]); } break; // the sun
      case 'weekly': R(-30, -26, 60, 58, 8); L([[-30, -12], [30, -12]]); L([[-16, -34], [-16, -20]]); L([[16, -34], [16, -20]]); g.shadowBlur = 0; for (let i = 0; i < 7; i++) { g.fillRect(-22 + (i % 4) * 13, -4 + (i / 4 | 0) * 14, 7, 7); } break; // a calendar week
      case 'dojo': C(0, -24, 9); L([[0, -15], [0, 24]]); L([[-24, -6], [24, -6]]); L([[-14, 38], [0, 24], [14, 38]]); L([[-30, 38], [30, 38]]); break; // a training dummy
      default: C(0, 0, 30);
    }
    g.restore();
  }
};
{
  const ra7 = UI.renderArcade.bind(UI);
  UI.renderArcade = function () {
    const r = ra7.apply(this, arguments);
    try { const list = $('arList'), ms = MODES.filter(m => !m.mp); [...list.children].forEach((b, i) => { const m = ms[i]; if (!m || b.querySelector('.ar77')) return;
      const cv = document.createElement('canvas'); cv.className = 'ar77'; ModeArt.draw(cv, m.id); b.classList.add('ar77i'); b.style.setProperty('--arc', ModeArt.COL[m.id] || '#00f2fe'); b.insertBefore(cv, b.firstChild); }); } catch (e) { errLog(e); }
    return r;
  };
  const css = document.createElement('style'); css.id = 'v77css';
  css.textContent = `#arList .item.ar77i { position: relative; padding-inline-start: 74px; min-height: 76px; }
#arList .item.ar77i > canvas.ar77 { position: absolute; inset-inline-start: 10px; top: 50%; width: 54px; height: 54px; transform: translateY(-50%); opacity: .75; transition: opacity .2s, transform .2s, filter .2s; pointer-events: none; }
#arList .item.ar77i.on > canvas.ar77 { opacity: 1; filter: drop-shadow(0 0 8px var(--arc)); animation: ar77 1.6s ease-in-out infinite alternate; }
#arList .item.ar77i.on { border-color: var(--arc) !important; box-shadow: 0 0 18px color-mix(in srgb, var(--arc) 35%, transparent), inset 0 0 14px color-mix(in srgb, var(--arc) 12%, transparent); }
#arList .item.ar77i.on .nm { color: var(--arc); }
#arList .item.ar77i.lock > canvas.ar77 { opacity: .3; filter: grayscale(1); }
@keyframes ar77 { from { transform: translateY(-50%) scale(1); } to { transform: translateY(-50%) scale(1.08); } }
@media (prefers-reduced-motion: reduce) { #arList .item.ar77i.on > canvas.ar77 { animation: none; } }`;
  document.head.appendChild(css);
}
/* ---------- the season as a track: every tier a lit node on a line, its reward drawn beside it (a coin, the season hero, the season blade),
   the tier you are working on with its own progress bar ---------- */
const SeasonArt = {
  coin(cv, c) { const S = 88, g = cv.getContext('2d'); cv.width = cv.height = S; g.translate(S / 2, S / 2); g.shadowColor = c; g.shadowBlur = 10;
    const gr = g.createRadialGradient(-8, -10, 2, 0, 0, 30); gr.addColorStop(0, '#fff6c4'); gr.addColorStop(.5, '#ffd23f'); gr.addColorStop(1, '#a8740c'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 28, 0, TAU); g.fill();
    g.shadowBlur = 0; g.strokeStyle = '#7a520a'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 21, 0, TAU); g.stroke(); g.fillStyle = '#7a520a'; g.font = '900 22px ' + FONT_D; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CR', 0, 1); }
};
{
  const rs7 = UI.renderSeason.bind(UI);
  UI.renderSeason = function () {
    const r = rs7.apply(this, arguments);
    try { const S = Season.cur(), s = Season.st(), tier = Season.tier(), col = (S && S.c) || '#ffd23f', box = $('seBox'); const lists = box.querySelectorAll('.list'); const list = lists[lists.length - 1]; if (!list) return r;
      list.classList.add('se77'); list.style.setProperty('--sc', col);
      [...list.children].forEach((b, i) => { const t = i + 1, rw = Season.reward(t); if (b.querySelector('.se77n')) return; b.classList.add('se77i'); if (t <= tier) b.classList.add('se77lit'); if (t === tier + 1) b.classList.add('se77next');
        const node = el('div', 'se77n', String(t)); b.insertBefore(node, b.firstChild);
        const cv = document.createElement('canvas'); cv.className = 'se77r'; b.appendChild(cv);
        if (rw.k === 'skin') drawIcon(cv.getContext('2d'), { tab: 'heroes', id: rw.id }, (cv.width = cv.height = 88)); else if (rw.k === 'fx') drawIcon(cv.getContext('2d'), { tab: 'fx', id: rw.id }, (cv.width = cv.height = 88)); else SeasonArt.coin(cv, col);
        if (rw.k !== 'cr') b.classList.add('se77big');
        if (t === tier + 1) { const xp = (s.xp | 0) % SEASON_XP, bar = el('div', 'se77p'), fill = el('i'); fill.style.width = Math.round(xp / SEASON_XP * 100) + '%'; bar.appendChild(fill); bar.appendChild(el('span', '', xp + ' / ' + SEASON_XP + ' XP')); b.appendChild(bar); } });
    } catch (e) { errLog(e); }
    return r;
  };
  const css = document.createElement('style'); css.id = 'v77css2';
  css.textContent = `.list.se77 { position: relative; gap: 8px; }
.list.se77::before { content: ''; position: absolute; inset-inline-start: 23px; top: 18px; bottom: 18px; width: 3px; background: linear-gradient(var(--sc), rgba(255,255,255,.08)); opacity: .5; border-radius: 2px; }
.list.se77 .item.se77i { position: relative; padding-inline-start: 58px; padding-inline-end: 64px; min-height: 64px; }
.list.se77 .se77n { position: absolute; inset-inline-start: 8px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font: 800 13px var(--fd, sans-serif); color: #8a93b8; background: #0b1024; border: 2px solid #2a3358; z-index: 1; }
.list.se77 .se77lit .se77n { color: #05060f; background: var(--sc); border-color: var(--sc); box-shadow: 0 0 12px var(--sc); }
.list.se77 .se77next .se77n { color: var(--sc); border-color: var(--sc); animation: se77 1.2s ease-in-out infinite alternate; }
.list.se77 canvas.se77r { position: absolute; inset-inline-end: 8px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; border-radius: 8px; }
.list.se77 .se77big { border-color: var(--sc) !important; background: linear-gradient(90deg, color-mix(in srgb, var(--sc) 14%, transparent), transparent 70%) !important; }
.list.se77 .item.se77i.se77big { padding-inline-end: 78px; } .list.se77 .se77big canvas.se77r { width: 58px; height: 58px; box-shadow: 0 0 14px color-mix(in srgb, var(--sc) 60%, transparent); }
.list.se77 .se77p { grid-column: 1 / -1; margin-top: 6px; height: 14px; border-radius: 7px; background: rgba(255,255,255,.06); position: relative; overflow: hidden; }
.list.se77 .se77p i { position: absolute; inset-block: 0; inset-inline-start: 0; background: linear-gradient(90deg, var(--sc), #fff); border-radius: 7px; }
.list.se77 .se77p span { position: relative; font: 700 10px var(--fm, monospace); color: #fff; padding-inline-start: 6px; line-height: 14px; }
@keyframes se77 { to { box-shadow: 0 0 14px var(--sc); } } @media (prefers-reduced-motion: reduce) { .list.se77 .se77next .se77n { animation: none; } }`;
  document.head.appendChild(css);
}
/* the results screen films the hero like a showcase: the camera drifts slowly around it */
{
  const fr7 = Mini.frame.bind(Mini);
  Mini.frame = function (rd) { if (this.floor57) { this.floor57.material.roughness = this.host === 'result' ? .55 : .28; this.floor57.scale.setScalar(this.host === 'result' ? 2.6 : 1); } if (this.host === 'result' && this.cam && !CALM) { const a = Math.sin((this.t || 0) * .35) * .38, d = 4.4; this.cam.position.set(Math.sin(a) * d, 1.05 + Math.sin((this.t || 0) * .5) * .08, Math.cos(a) * d); this.cam.lookAt(0, .85, 0); if (this.back57) { this.back57.position.set(-Math.sin(a) * 1.6, 1.0, -Math.cos(a) * 1.6); this.back57.lookAt(this.cam.position); } } return fr7(rd); }; /* (the glow behind the hero turns with the camera, so it is never seen edge-on) */
}
