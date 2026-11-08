/* =====================================================================
   VERSION 45: THE OBJECTIVE BAR
   Story stages with a goal show it at the top center, big enough to read
   mid-fight:
   · timed goals (defend the uplink, survive, catch the courier, escort the
     drone): the time left as a countdown and a bar that drains; red and
     pulsing in the last 10 seconds, a soft tick each of the last 5
   · counted goals (destroy enemies, shards, terminals, nodes, reflected
     kills, combo): "7 / 20" and a bar that fills, a bump on every step,
     and a green check when it is done
   Display only: it reads the run and changes nothing in it.
   ===================================================================== */
const ObjBar = {
  el: null, last: '', lastV: -1, tickS: -1,
  kinds: {
    defend: ['T', 'DEFEND THE UPLINK'], survive: ['T', 'SURVIVE'], courier: ['T', 'CATCH THE COURIER'], escort: ['T', 'ESCORT THE DRONE'],
    kill: ['N', 'ENEMIES DESTROYED'], collect: ['N', 'DATA SHARDS'], reflect: ['N', 'REFLECTED KILLS'], hack: ['N', 'TERMINALS HACKED'], nodes: ['N', 'NODES DESTROYED'], combo: ['N', 'COMBO']
  },
  make() {
    const e = el('div', 'objbar hidden'); e.id = 'objBar'; e.setAttribute('aria-live', 'polite');
    e.innerHTML = '<span class="ob-l"></span><b class="ob-v"></b><span class="ob-bar"><i></i></span>'; document.body.appendChild(e); this.el = e; return e;
  },
  tick() {
    const e = this.el || this.make(), o = G.obj, K = o && this.kinds[o.t];
    const show = G.mode === 'story' && K && (G.state === 'PLAY' || G.state === 'PAUSE') && !(G.cine && G.freeze > 0) && UI.cur !== 'photo';
    e.classList.toggle('hidden', !show); if (!show) { this.lastV = -1; return; }
    let txt, frac, done = false, warn = false;
    if (K[0] === 'T') { const left = Math.max(0, o.s - G.time); txt = fmtTime(left); frac = left / (o.s || 1); done = left <= 0; warn = left <= 10 && !done;
      const s = Math.ceil(left); if (left <= 5 && left > 0 && s !== this.tickS && G.state === 'PLAY') { this.tickS = s; try { Aud.sfx('tick'); } catch (er) { } } }
    else { const v = Math.min(G.objV | 0, o.n), n = o.n; txt = (o.t === 'combo' ? 'x' + v + ' / x' + n : v + ' / ' + n); frac = v / (n || 1); done = v >= n;
      if (this.lastV >= 0 && v > this.lastV) { e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); } this.lastV = v; }
    const key = K[1] + '|' + txt + '|' + done + warn;
    if (key !== this.last) { this.last = key; e.querySelector('.ob-l').textContent = lt(K[1]); e.querySelector('.ob-v').textContent = done ? '✓ ' + txt : txt; }
    e.querySelector('.ob-bar i').style.width = (Math.max(0, Math.min(1, frac)) * 100).toFixed(1) + '%';
    e.classList.toggle('warn', warn); e.classList.toggle('done', done); e.classList.toggle('timed', K[0] === 'T');
  }
};
{
  Pipe.on('post', 'objbar', () => { try { ObjBar.tick(); } catch (e) { errLog(e); } }, 95);
  const css = document.createElement('style'); css.id = 'v45css';
  css.textContent = `
.objbar { position: absolute; z-index: 7; top: calc(env(safe-area-inset-top, 0px) + 62px); left: 50%; transform: translateX(-50%); min-width: 150px; max-width: calc(100% - 140px);
  display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 14px 7px; pointer-events: none; text-align: center;
  background: rgba(6, 9, 26, .78); border: 1px solid rgba(0, 242, 254, .45); clip-path: var(--cut); box-shadow: 0 0 18px rgba(0, 242, 254, .2); }
.objbar .ob-l { font: 700 10px var(--fm); letter-spacing: 1.5px; color: #8fe9ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.objbar .ob-v { font: italic 700 24px/1.05 var(--fd); color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 0 12px rgba(0, 242, 254, .7); direction: ltr; }
.objbar .ob-bar { display: block; width: 100%; height: 4px; background: rgba(255, 255, 255, .12); margin-top: 2px; } .objbar .ob-bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #00f2fe, #ff2bd6); transition: width .15s linear; }
.objbar.timed .ob-bar i { background: linear-gradient(90deg, #ffd23f, #00f2fe); }
.objbar.warn { border-color: #ff2a4a; box-shadow: 0 0 22px rgba(255, 42, 74, .55); animation: obWarn .5s ease-in-out infinite alternate; } .objbar.warn .ob-v { color: #ff4a62; text-shadow: 0 0 14px rgba(255, 42, 74, .9); } .objbar.warn .ob-bar i { background: #ff2a4a; }
.objbar.done { border-color: #00ff88; } .objbar.done .ob-v { color: #00ff88; text-shadow: 0 0 14px rgba(0, 255, 136, .8); } .objbar.done .ob-bar i { background: #00ff88; }
.objbar.bump .ob-v { animation: obBump .35s cubic-bezier(.2, 1.6, .4, 1); }
@keyframes obWarn { to { transform: translateX(-50%) scale(1.06); } } @keyframes obBump { 40% { transform: scale(1.3); } }
body.hudedit .objbar { display: none; }
@media (prefers-reduced-motion: reduce) { .objbar.warn, .objbar.bump .ob-v { animation: none; } }
`; document.head.appendChild(css);
}
