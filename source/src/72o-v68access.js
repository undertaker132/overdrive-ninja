/* =====================================================================
   VERSION 68: EASIER TO READ, EASIER TO REACH
   · TEXT SIZE (Settings > Presentation): normal, large or largest, for
     every menu (the home screen keeps its art) and for the words that pop up in a fight
   · keyboard: every button shows a clear focus ring when you move with
     Tab, so the menus can be played without a mouse or a touch screen
   · the element orbs carry a symbol too (flame, flake, bolt, drop), so
     colorblind players can tell them apart
   Display only.
   ===================================================================== */
const TextSize = {
  K: [1, 1.15, 1.3],
  k() { const s = Store.data && Store.data.settings; return this.K[(s && s.ts) | 0] || 1; },
  apply() { const k = this.k(); document.documentElement.style.setProperty('--ts', k); document.documentElement.dataset.ts = k > 1 ? '1' : ''; }
};
{
  const au0 = applyUiSettings;
  applyUiSettings = function () { const r = au0.apply(this, arguments); try { TextSize.apply(); } catch (e) { errLog(e); } return r; };
  const ps2 = PC.settings.bind(PC);
  PC.settings = function (head, cycle, box, s) { ps2(head, cycle, box, s); head('READABILITY'); cycle('Text size', 'ts', [0, 1, 2], ['NORMAL', 'LARGE', 'LARGEST']); };
  // words in a fight
  const tx0 = FX.text.bind(FX);
  FX.text = function (x, y, t, c, sz, pop, key) { return tx0(x, y, t, c, sz ? Math.round(sz * TextSize.k()) : sz, pop, key); };
  // the element orbs: a symbol on each
  const GL = { fire: 'flame', frost: 'flake', volt: 'bolt', venom: 'drop' };
  const sym = (g, k, x, y, r) => { g.save(); g.fillStyle = '#05060f'; g.strokeStyle = '#05060f'; g.lineWidth = Math.max(1, r * .22); g.globalAlpha = .85; g.beginPath();
    if (k === 'flame') { g.moveTo(x, y - r * .7); g.quadraticCurveTo(x + r * .6, y, x, y + r * .6); g.quadraticCurveTo(x - r * .6, y, x, y - r * .7); g.fill(); }
    else if (k === 'flake') { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.moveTo(x - Math.cos(a) * r * .65, y - Math.sin(a) * r * .65); g.lineTo(x + Math.cos(a) * r * .65, y + Math.sin(a) * r * .65); } g.stroke(); }
    else if (k === 'bolt') { g.moveTo(x + r * .2, y - r * .7); g.lineTo(x - r * .35, y + r * .05); g.lineTo(x + r * .05, y + r * .05); g.lineTo(x - r * .2, y + r * .7); g.lineTo(x + r * .35, y - r * .1); g.lineTo(x - r * .02, y - r * .1); g.closePath(); g.fill(); }
    else { g.moveTo(x, y - r * .7); g.quadraticCurveTo(x + r * .55, y + r * .1, x, y + r * .55); g.quadraticCurveTo(x - r * .55, y + r * .1, x, y - r * .7); g.fill(); }
    g.restore(); };
  const de9 = drawEnemy;
  drawEnemy = function (e) { de9(e); if (!CBM || !e.alive || !El.on(e) || !GL[e.el]) return; sym(cx, GL[e.el], e.x + (e.exec ? 16 : 0), e.y - e.r * (e.scale || 1) - 22, 5.5); };
  Pipe.on('post', 'elem68', () => { if (!CBM || !W3D.live || G.state === 'MENU') return; const k = V.s * V.dpr; let any = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || !El.on(e) || !GL[e.el]) continue; if (!any) { any = 1; cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); }
      const q = W3D.proj(e.x, e.y, e.r * 2.2 + 16); sym(cx, GL[e.el], q[0] + (e.exec ? 18 * k : 0), q[1] - (e.exec ? 0 : 4 * k), 6 * k); }
    if (any) cx.restore(); }, 100);
  const css = document.createElement('style'); css.id = 'v68css';
  css.textContent = `html[data-ts="1"] .scr:not(#s-title):not(#s-boot) { zoom: var(--ts); }
html[data-ts="1"] .scr:not(#s-title):not(#s-boot) > * { max-width: 100%; box-sizing: border-box; }
button:focus-visible, [tabindex]:focus-visible, select:focus-visible, input:focus-visible { outline: 3px solid #ffd23f !important; outline-offset: 2px; box-shadow: 0 0 0 6px rgba(255, 210, 63, .25) !important; }`;
  document.head.appendChild(css);
  try { TextSize.apply(); } catch (e) { errLog(e); }
}
