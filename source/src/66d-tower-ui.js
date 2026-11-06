/* NEON TOWER altar panel and NEMESIS card on the arcade screen (see 50e-tower.js, 50f-nemesis.js) */
Object.assign(UI, {
  renderNemesis() {
    const box = $('arNem'); if (!box) return; const n = Store.data.nem; box.classList.toggle('hidden', !n); if (!n || !EDEF[n.t]) return; box.textContent = '';
    box.appendChild(el('div', 'eyebrow', lt('YOUR NEMESIS')));
    box.appendChild(el('div', 'nm', Nemesis.name(n) + ' · LV ' + n.lv));
    box.appendChild(el('div', 'small', '"' + Nemesis.taunt(n) + '"'));
    box.appendChild(el('div', 'small mute', ltf('It has broken your shields {0} times. It hunts you in Maglev Run, the Neon Tower and Hyper Mayhem. Bounty: {1} CR.', n.w | 0, fmtNum(400 * n.lv))));
  },
  renderAltar() {
    const d = Store.data, wrap = $('arAltWrap'); if (!wrap) return; const on = d.mode === 'tower'; wrap.classList.toggle('hidden', !on); if (!on) return;
    const t = towerData(); $('arAltH').textContent = ltf('TOWER ALTAR · {0} SOUL SHARDS', fmtNum(t.sh));
    const box = $('arAlt'); box.textContent = '';
    for (const a of ALTAR) {
      const lv = t.alt[a.id] | 0, done = lv >= a.max, c = done ? 0 : a.cost[lv], b = el('button', done ? 'on' : '');
      b.appendChild(document.createTextNode(lt(a.name) + (a.max > 1 ? ' ' + lv + '/' + a.max : ''))); b.appendChild(el('i', '', done ? lt('OWNED') : ltf('{0} SHARDS', c)));
      b.disabled = !done && t.sh < c;
      b.onclick = () => { if (done) return; if (Tower.buy(a.id)) { Aud.sfx('buy'); toast(lt(a.name), '#ff9a3d'); } else Aud.sfx('deny'); this.altLast = a.id; this.renderAltar(); };
      box.appendChild(b);
    }
    { const ev = towerEvent(), b = el('button', t.ev ? 'on' : ''); b.appendChild(document.createTextNode(lt('WEEKLY EVENT'))); b.appendChild(el('i', '', t.ev ? lt('ON') : lt('OFF')));
      b.onclick = () => { t.ev = t.ev ? 0 : 1; Store.touch(); Aud.sfx('ui'); this.altLast = 'ev'; this.renderAltar(); }; box.appendChild(b);
      if (this.altLast === 'ev') { $('arAltD').textContent = lt(ev.name) + ': ' + lt(ev.desc) + ' ' + lt('Event climbs are not ranked.'); return; } }
    const last = ALTAR.find(a => a.id === this.altLast) || ALTAR[0];
    $('arAltD').textContent = lt(last.name) + ': ' + lt(last.desc) + '. ' + ltf('Best floor: {0} · Climbs: {1}', t.best | 0, t.runs | 0);
  }
});
