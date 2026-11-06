/* ARMS UI (version 22): the second-weapon button and the weapon tree in the Arsenal (see 41i-arms.js) */
/* ---------------- Arsenal: the second-weapon button and the tree ---------------- */
{
  const info0 = UI.renderShopInfo.bind(UI);
  UI.renderShopInfo = function (it) {
    info0(it); let tree = $('asTree'); if (!tree) { tree = el('div', 'panel wtree'); tree.id = 'asTree'; $('asPrev').after(tree); }
    tree.textContent = ''; if (!it || it.tab !== 'blades') { tree.classList.add('hidden'); return; }
    const d = Store.data, w = WEAPONS.find(q => q.id === it.id), own = !!d.owned[it.id]; tree.classList.toggle('hidden', !own);
    const alt = $('asAlt');
    if (own) { // second weapon
      const isMain = d.weapon === it.id, isSub = d.weapon2 === it.id; alt.classList.remove('hidden');
      alt.textContent = isSub ? lt('SECOND WEAPON: ON (TAP TO REMOVE)') : isMain ? lt('THIS IS YOUR MAIN WEAPON') : lt('SET AS SECOND WEAPON'); alt.disabled = isMain;
      alt.onclick = () => { d.weapon2 = isSub ? '' : it.id; Aud.sfx('ui'); Store.touch(); Store.flush(); this.renderArsenal(); if (!isSub) toastDom(lt('SWAP BLADES IN A RUN WITH THE SWAP BUTTON OR F')); };
    } else alt.disabled = false;
    if (!own) return;
    tree.appendChild(el('div', 'eyebrow', lt('WEAPON TREE')));
    const t = wtreeOf(it.id);
    WTREE.forEach((P0, i) => {
      const row = el('div', 'wt-row'), lv = t[i], max = lv >= WTREE_MAX, cost = max ? 0 : wtreeCost(w, i, lv);
      const head = el('div', 'wt-head'); const nm = el('b', '', lt(P0.n)); nm.style.color = P0.c; head.appendChild(nm);
      const pips = el('span', 'wt-pips'); for (let k = 0; k < WTREE_MAX; k++) { const p = el('i', k < lv ? 'on' : ''); if (k < lv) p.style.background = P0.c; pips.appendChild(p); } head.appendChild(pips); row.appendChild(head);
      row.appendChild(el('div', 'small mute', lt(P0.d)));
      const b = el('button', 'btn' + (max ? '' : ' pri'), max ? lt('MAX') : ltf('UPGRADE · {0} CR', fmtNum(cost))); b.disabled = max || d.credits < cost;
      b.onclick = () => { if (d.credits < cost || max) { Aud.sfx('deny'); return; } d.credits -= cost; d.wtree = d.wtree || {}; const nt = wtreeOf(it.id); nt[i]++; d.wtree[it.id] = nt; Aud.sfx('star', 2); vibe('reward'); Store.touch(); Store.flush(); toastDom(ltf('{0} · {1} LV {2}', lt(w.name), lt(P0.n), nt[i])); this.renderArsenal(); };
      row.appendChild(b); tree.appendChild(row);
    });
  };
}
{ // equipping your second weapon as the main one swaps the two
  const act0 = UI.shopAct.bind(UI);
  UI.shopAct = function (it) { const d = Store.data, prev = d.weapon; act0(it); if (it && it.tab === 'blades' && d.weapon !== prev && d.weapon2 === d.weapon) { d.weapon2 = prev; Store.touch(); } };
}
