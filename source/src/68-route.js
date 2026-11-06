/* =====================================================================
   ROUTE + CONTRACTS — between Maglev Run cars the player picks the next
   car (standard, elite, black market, repair, mystery); before an arcade
   run they can sign difficulty contracts for a score multiplier.
   Every choice is a recorded action (RA.ROUTE / RA.SHOP), so replays
   take the same route and buy the same things.
   ===================================================================== */
const Route = {
  roll() { // two special cars next to the standard one (seeded: the replay rolls the same)
    const pool = ['elite', 'repair', 'mystery']; if (G.runCredits >= RSHOP[0].cost) pool.push('shop');
    const a = pool.splice(R.i(pool.length), 1)[0], b = pool[R.i(pool.length)];
    return ['std', a, b];
  },
  pick(opts, i, go) {
    const k = opts[i] || 'std';
    if (k !== 'shop') { go(k); return; }
    G.state = 'ROUTE'; // black market: buy, then leave to a standard car
    if (REPLAY.on) { REPLAY.routeCb = () => go('std'); return; }
    UI.openRouteShop(() => { if (G.state !== 'ROUTE') return; REC.act(RA.ROUTE, 99); G.state = 'PLAY'; UI.show(null); go('std'); });
  }
};
const RouteShop = {
  buy(i) {
    const it = RSHOP[i]; if (!it || G.runCredits < it.cost) return false;
    G.runCredits -= it.cost; Store.data.credits = Math.max(0, Store.data.credits - it.cost); Store.touch();
    if (it.id === 'shield') P.hp = Math.min(P.maxHp, P.hp + 1);
    else if (it.id === 'od') G.od = Math.min(100, G.od + 50);
    else if (it.id === 'edge') P.dmgMul *= 1.15;
    else if (it.id === 'charge') { P.maxCh++; P.ch = P.maxCh; }
    return true;
  }
};
Object.assign(UI, {
  openRoute(opts, onPick) {
    this.show('route'); $('rtEyebrow').textContent = ltf('CAR {0} CLEARED', G.seqCar); $('rtTitle').textContent = lt('CHOOSE YOUR ROUTE');
    $('rtSub').textContent = ltf('Next: car {0}', G.seqCar + 1); $('rtLeave').classList.add('hidden');
    const box = $('rtList'); box.textContent = '';
    opts.forEach((k, i) => {
      const R0 = ROUTES[k], b = el('button', 'route'); b.style.borderColor = R0.c;
      const nm = el('span', 'nm', lt(R0.n)); nm.style.color = R0.c; b.appendChild(nm);
      b.appendChild(el('span', 'pr', k === 'shop' ? fmtNum(G.runCredits) + ' CR' : ''));
      b.appendChild(el('span', 'ds', lt(R0.d)));
      b.onclick = () => { Aud.sfx('buy'); onPick(i); };
      box.appendChild(b);
    });
  },
  openRouteShop(onLeave) {
    this.show('route'); $('rtEyebrow').textContent = lt('BLACK MARKET'); $('rtTitle').textContent = lt('SPEND YOUR RUN CREDITS');
    const lv = $('rtLeave'); lv.classList.remove('hidden'); lv.onclick = () => { Aud.sfx('ui'); onLeave(); };
    const render = () => {
      $('rtSub').textContent = ltf('You collected {0} CR this run.', fmtNum(G.runCredits));
      const box = $('rtList'); box.textContent = '';
      RSHOP.forEach((it, i) => {
        const b = el('button', 'route'); b.disabled = G.runCredits < it.cost;
        b.appendChild(el('span', 'nm', lt(it.n))); b.appendChild(el('span', 'pr', fmtNum(it.cost) + ' CR')); b.appendChild(el('span', 'ds', lt(it.d)));
        b.onclick = () => { if (G.state !== 'ROUTE' || G.runCredits < it.cost) { Aud.sfx('deny'); return; } REC.act(RA.SHOP, i); RouteShop.buy(i); Aud.sfx('buy'); toast('+ ' + lt(it.n), '#00ff88'); render(); };
        box.appendChild(b);
      });
    };
    render();
  },
  renderContracts() {
    const d = Store.data, on = CTR_MODES[d.mode], wrap = $('arCtrWrap'); wrap.classList.toggle('hidden', !on); if (!on) return;
    d.contracts = (d.contracts || []).filter(id => CONTRACTS.some(c => c.id === id));
    const box = $('arCtr'); box.textContent = ''; let heat = 0;
    for (const c of CONTRACTS) {
      const sel = d.contracts.indexOf(c.id) >= 0; if (sel) heat += c.heat;
      const b = el('button', sel ? 'on' : ''); b.appendChild(document.createTextNode(lt(c.n))); b.appendChild(el('i', '', ltf('HEAT {0}', c.heat)));
      b.onclick = () => { Aud.sfx(sel ? 'back' : 'ui'); const i = d.contracts.indexOf(c.id); if (i >= 0) d.contracts.splice(i, 1); else d.contracts.push(c.id); Store.touch(); this.ctrLast = c.id; this.renderContracts(); };
      box.appendChild(b);
    }
    $('arCtrH').textContent = heat ? ltf('CONTRACTS · HEAT {0} · SCORE x{1}', heat, (1 + heat * .1).toFixed(1)) : lt('CONTRACTS');
    const last = CONTRACTS.find(c => c.id === this.ctrLast);
    $('arCtrD').textContent = last ? lt(last.n) + ': ' + lt(last.d) + '.' : lt('Sign contracts to make the run harder. Every point of heat adds 10% to your score.');
  }
});
