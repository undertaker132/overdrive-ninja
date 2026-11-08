/* =====================================================================
   VERSION 47: DUEL A FRIEND WITH A LINK
   · the challenge text now carries a link (the game's site with #c=ODC1…):
     whoever opens it gets a card "<name> challenges you · <mode> · <score>"
     and ACCEPT starts the very same roof (same seed), no code to paste
   · during a challenge a rival bar at the top shows their score against
     yours as it climbs, and the moment you pass them: "YOU PASSED <name>!"
   Built on the friend challenge from version 26: same codes, same seeds.
   ===================================================================== */
const DUEL_SITE = 'https://undertaker132.github.io/overdrive-ninja/';
const Duel = {
  pending: null, passed: false, el: null,
  link(code) { return DUEL_SITE + '#c=' + code; },
  fromHash() { try { const m = /[#&]c=(ODC1\.[A-Za-z0-9_+\/=-]+)/.exec(location.hash || ''); if (!m) return; const c = FChal.decode(m[1]); if (c) this.pending = c;
      history.replaceState(null, '', location.pathname + location.search); } catch (e) { errLog(e); } },
  offer() {
    const c = this.pending; if (!c || UI.cur !== 'title' || document.querySelector('.unlock39, .coach46')) return; this.pending = null;
    const m = MODES.find(q => q.id === c.m), ov = el('div', 'unlock39'), card = el('div', 'card'); card.style.borderColor = '#ff2bd6';
    card.appendChild(el('div', 'eyebrow', lt('CHALLENGE'))); const h = el('h2', '', ltf('{0} CHALLENGES YOU', c.n)); h.style.color = '#ff2bd6'; card.appendChild(h);
    const ul = el('div', 'ul'); ul.appendChild(el('span', '', lt(m ? m.name : c.m))); ul.appendChild(el('span', '', ltf('SCORE TO BEAT: {0}', fmtNum(c.sc)))); card.appendChild(ul);
    card.appendChild(el('div', 'small mute', lt('The very same roof: same cars, same enemies, same order.')));
    const row = el('div', 'row'), no = el('button', 'btn ghost', lt('LATER')), go = el('button', 'btn pri', lt('ACCEPT'));
    no.onclick = () => { Aud.sfx('ui'); ov.remove(); }; go.onclick = () => { Aud.sfx('ui'); ov.remove(); FChal.play(c); };
    row.appendChild(no); row.appendChild(go); card.appendChild(row); ov.appendChild(card); document.body.appendChild(ov); Aud.sfx('star');
  },
  tick() {
    const c = FChal.cur, e = this.el || (this.el = (() => { const x = el('div', 'objbar duel47 hidden'); x.innerHTML = '<span class="ob-l"></span><b class="ob-v"></b><span class="ob-bar"><i></i></span>'; document.body.appendChild(x); return x; })());
    const show = !!(c && G.mode === c.m && (G.state === 'PLAY' || G.state === 'PAUSE') && !REPLAY.on);
    e.classList.toggle('hidden', !show); if (!show) { if (G.state !== 'PLAY' && G.state !== 'PAUSE') this.passed = false; return; }
    const me = G.score | 0, them = c.sc | 0, ahead = me > them;
    e.querySelector('.ob-l').textContent = ltf('VS {0} · {1}', c.n, fmtNum(them)); e.querySelector('.ob-v').textContent = fmtNum(me) + (ahead ? ' ✓' : '');
    e.querySelector('.ob-bar i').style.width = Math.min(100, them ? me / them * 100 : 100).toFixed(1) + '%'; e.classList.toggle('done', ahead);
    if (ahead && !this.passed) { this.passed = true; try { FX.call(ltf('YOU PASSED {0}!', c.n), '#ffd700', 2.5, 26); Aud.sfx('win'); } catch (er) { errLog(er); } }
  }
};
{
  Duel.fromHash(); window.addEventListener('hashchange', () => { Duel.fromHash(); setTimeout(() => Duel.offer(), 300); });
  // the share text carries the link
  const sb0 = Share.build.bind(Share);
  Share.build = function (o) { const r = sb0(o); try { if (o && o.chal && typeof this.text === 'string' && this.text.indexOf('#c=') < 0) this.text += '\n' + lt('Play my exact run here:') + ' ' + Duel.link(o.chal); } catch (e) { errLog(e); } return r; };
  const ot5 = UI.openTitle.bind(UI);
  UI.openTitle = function () { const r = ot5.apply(this, arguments); if (Duel.pending) setTimeout(() => { try { Duel.offer(); } catch (e) { errLog(e); } }, 900); return r; };
  const sa1 = Flow.startArcade.bind(Flow); Flow.startArcade = function () { Duel.passed = false; return sa1.apply(this, arguments); };
  Pipe.on('post', 'duel47', () => { try { Duel.tick(); } catch (e) { errLog(e); } }, 96);
  const css = document.createElement('style'); css.id = 'v47css';
  css.textContent = `.duel47 { border-color: rgba(255, 43, 214, .55); box-shadow: 0 0 18px rgba(255, 43, 214, .25); } .duel47 .ob-l { color: #ff9ae8; } .duel47 .ob-bar i { background: linear-gradient(90deg, #ff2bd6, #ffd23f); }`;
  document.head.appendChild(css);
}
