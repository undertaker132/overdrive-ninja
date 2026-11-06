/* puzzle select screen: packs as tabs (they open with puzzle stars), the daily puzzle, a map of the selected one */
Object.assign(UI, {
  pzTab: 0, pzSel: null,
  openPuzzles() { G.state = 'MENU'; this.backFn = null; this.show('puzzle'); Aud.music('menu'); this.renderPuzzles(); },
  renderPuzzles() {
    const d = Store.data, st = d.puzzle.stars, tabs = $('pzTabs'); tabs.textContent = ''; tabs.style.gridTemplateColumns = 'repeat(' + (PZ_PACKS.length + 1) + ',1fr)';
    $('pzStars').textContent = '★ ' + Puzzles.stars() + '/' + Puzzles.total();
    PZ_PACKS.forEach((pk, i) => {
      const open = Puzzles.open(i), b = el('button', (i === this.pzTab ? 'on' : '') + (open ? '' : ' lock'));
      b.appendChild(el('b', '', open ? (i + 1) + '' : '🔒')); b.appendChild(document.createTextNode(lt(pk.n)));
      b.onclick = () => { if (!open) { Aud.sfx('deny'); toastDom(ltf('Earn {0} puzzle stars to open this pack', pk.need)); return; } Aud.sfx('ui'); this.pzTab = i; this.pzSel = null; this.renderPuzzles(); };
      tabs.appendChild(b);
    });
    const db = el('button', (this.pzTab === PZ_PACKS.length ? 'on' : '') + ' bonus'); db.appendChild(el('b', '', '★')); db.appendChild(document.createTextNode(lt('DAILY')));
    db.onclick = () => { Aud.sfx('ui'); this.pzTab = PZ_PACKS.length; this.pzSel = 'daily'; this.renderPuzzles(); }; tabs.appendChild(db);
    const grid = $('pzGrid'); grid.textContent = '';
    if (this.pzTab >= PZ_PACKS.length) { // the daily puzzle
      this.pzSel = 'daily'; grid.classList.add('hidden');
      const best = d.puzzle.daily[todayKey()] | 0;
      $('pzDesc').textContent = lt('A new puzzle every day, the same for everyone.') + (best ? ' ' + ltf('Today: {0} ★', best) : '');
    } else {
      grid.classList.remove('hidden'); const pk = PZ_PACKS[this.pzTab];
      $('pzDesc').textContent = ltf('Pack {0}: {1}. Clear each roof in as few dashes as you can. Par = 3 stars.', this.pzTab + 1, lt(pk.n));
      if (!this.pzSel || !this.pzSel.startsWith('p' + (this.pzTab + 1) + '-')) { // first puzzle without 3 stars
        let k = pk.list.findIndex((q, i) => (st['p' + (this.pzTab + 1) + '-' + (i + 1)] | 0) < 3); if (k < 0) k = 0; this.pzSel = 'p' + (this.pzTab + 1) + '-' + (k + 1);
      }
      pk.list.forEach((q, i) => {
        const id = 'p' + (this.pzTab + 1) + '-' + (i + 1), s = st[id] | 0, b = el('button', id === this.pzSel ? 'on' : '');
        b.appendChild(document.createTextNode((i + 1) + '')); const ss = el('span', 'st'); for (let k = 0; k < 3; k++) { if (k < s) ss.appendChild(el('b', '', '★')); else ss.appendChild(document.createTextNode('★')); } b.appendChild(ss);
        b.onclick = () => { Aud.sfx('ui'); this.pzSel = id; this.renderPuzzles(); };
        grid.appendChild(b);
      });
    }
    const def = Puzzles.get(this.pzSel); if (!def) return;
    pzMini($('pzCv').getContext('2d'), def, 224);
    $('pzName').textContent = Puzzles.name(this.pzSel);
    const kinds = []; if (def.t.some(t => t[0] === 's')) kinds.push(lt('shields: ricochet off a rail or hit them from behind')); if (def.t.some(t => t[0] === 'x')) kinds.push(lt('bomb posts blow up everything near them')); if (def.p) kinds.push(lt('gates teleport you'));
    const best = this.pzSel === 'daily' ? d.puzzle.daily[todayKey()] | 0 : st[this.pzSel] | 0;
    $('pzSub').textContent = ltf('{0} targets · par {1}', def.t.length, def.par) + (best ? ' · ' + ltf('best {0} ★', best) : '') + (kinds.length ? '. ' + kinds.join('; ') + '.' : '');
  }
});
