/* =====================================================================
   ARSENAL SHOP — five tabs (blades, heroes, blade skins, upgrades,
   talents). Every row has a drawn icon; tapping a row shows an animated
   preview of exactly what it does, with one clear buy/equip button.
   ===================================================================== */
const SHOP_TABS = [{ id: 'blades', n: 'BLADES' }, { id: 'heroes', n: 'HEROES' }, { id: 'fx', n: 'BLADE FX' }, { id: 'upg', n: 'UPGRADES' }, { id: 'tal', n: 'TALENTS' }, { id: 'skills', n: 'SKILLS' }, { id: 'pets', n: 'PETS' }];
function upgStat(k, lv) { // human-readable value of an upgrade at a level
  switch (k) {
    case 'dmg': return '+' + Math.round(lv * 15) + '% ' + lt('damage');
    case 'shield': return (3 + lv) + ' ' + lt('shields');
    case 'cool': return Math.max(.3, .66 - lv * .04).toFixed(2) + 's ' + lt('recharge');
    case 'parry': return (Math.max(.08, .15 + lv * .025)).toFixed(3) + 's ' + lt('window');
    case 'magnet': return (100 + lv * 32) + ' ' + lt('range');
    case 'drone': return lv ? Math.max(.45, 1.35 - lv * .17).toFixed(2) + 's ' + lt('per zap') : lt('no drone');
    case 'heat': return (12 + lv * 3) + '/s ' + lt('cooling');
  }
  return '';
}
Object.assign(UI, {
  asSel: null,
  openArsenal() { this.show('arsenal'); this.renderArsenal(); Preview.attach(); },
  shopItems(tab) {
    const d = Store.data, out = [];
    if (tab === 'blades') for (const w of WEAPONS) {
      const own = !!d.owned[w.id], secret = w.cost < 0, can = secret ? !!d.story.done.any : d.credits >= w.cost, ml = masteryLevel(w.id);
      out.push({ tab, id: w.id, name: lt(w.name), desc: lt(w.desc), state: d.weapon === w.id ? 'eq' : own ? 'own' : secret ? (can ? 'claim' : 'lock') : 'buy', price: w.cost, can, lock: secret ? lt('Clear the story to unlock.') : '',
        sub: ltf('DMG {0} · CHARGES {1} · CRIT {2}%', w.dmg, w.ch, Math.round(w.crit * 100)), ml, xp: d.mastery[w.id] | 0 });
    }
    else if (tab === 'heroes') for (const s of SKINS) {
      const own = !!d.skins[s.id], secret = s.cost < 0, can = secret ? unlockOk(s.unlock) : d.credits >= s.cost;
      if (s.season != null && !own && s.season !== seasonNow().m) continue; // other months' season rewards stay hidden
      out.push({ tab, id: s.id, name: lt(s.name), desc: lt(s.desc), state: d.skin === s.id ? 'eq' : own ? 'own' : secret ? (can ? 'claim' : 'lock') : 'buy', price: s.cost, can, lock: secret ? unlockText(s.unlock) : '',
        hl: heroLevel(s.id), hxp: (d.hmast && d.hmast[s.id]) | 0, own });
    }
    else if (tab === 'fx') for (const s of BLADE_FX) {
      const own = !!d.blades[s.id], secret = s.cost < 0, can = secret ? unlockOk(s.unlock) : d.credits >= s.cost;
      if (s.season != null && !own && s.season !== seasonNow().m) continue;
      out.push({ tab, id: s.id, name: lt(s.name), desc: lt(s.desc), state: d.blade === s.id ? 'eq' : own ? 'own' : secret ? (can ? 'claim' : 'lock') : 'buy', price: s.cost, can, lock: secret ? unlockText(s.unlock) : '' });
    }
    else if (tab === 'pets') {
      const pp = d.pets || {}; out.push({ tab, id: 'none', name: lt('NO PET'), desc: lt('Run alone.'), state: (d.pet || 'none') === 'none' ? 'eq' : 'own', price: 0, can: true });
      for (const p of PETS) { const own = !!pp[p.id]; out.push({ tab, id: p.id, name: lt(p.name), desc: lt(p.desc), state: d.pet === p.id && own ? 'eq' : own ? 'own' : p.ev ? 'lock' : 'buy', lock: p.ev ? unlockText({ t: 'event', id: p.ev }) : '', price: p.cost, can: d.credits >= p.cost, own, pl: petLevel(p.id), pxp: petXp(p.id) }); }
    }
    else if (tab === 'upg') for (const u of UPGRADES) {
      const lv = d.upg[u.k] | 0, max = lv >= u.max, cost = upgCost(u, lv);
      out.push({ tab, id: u.k, name: lt(u.name), desc: lt(u.desc), state: max ? 'max' : 'up', price: cost, can: d.credits >= cost, lv, maxLv: u.max });
    }
    else if (tab === 'skills') for (const sk of SKILLS) {
      const E = SKILL_EVO[sk.id], uses = (d.skillUse && d.skillUse[sk.id]) | 0, own = !!(d.evoOwn && d.evoOwn[sk.id]), on = !!(d.skillEvo && d.skillEvo[sk.id]);
      out.push({ tab, id: sk.id, name: lt(E.n), base: lt(sk.name), desc: lt(E.d), state: on ? 'evo' : own ? 'evoOff' : uses >= E.need ? 'evolve' : 'lock', price: E.cost, can: d.credits >= E.cost, uses, need: E.need, cdUp: Math.round((E.cd - 1) * 100) });
    }
    else {
      const st = Store.stars();
      TALENTS.forEach((T, i) => { for (const side of ['a', 'b']) { const o = T[side]; out.push({ tab, id: i + side, tier: i, side, name: lt(o.name), desc: lt(o.desc), state: st < T.need ? 'lock' : d.talents[i] === side ? 'pick' : 'free', need: T.need, tid: o.id }); } });
    }
    return out;
  },
  renderArsenal() {
    const d = Store.data; $('asCredits').textContent = fmtNum(d.credits) + ' CR';
    const tabs = $('asTabs'); tabs.textContent = ''; tabs.style.gridTemplateColumns = 'repeat(4,1fr)';
    SHOP_TABS.forEach((T, i) => { const b = el('button', i === this.asTab ? 'on' : '', lt(T.n)); b.onclick = () => { Aud.sfx('ui'); this.asTab = i; this.asSel = null; this.renderArsenal(); }; tabs.appendChild(b); });
    const tab = SHOP_TABS[this.asTab].id, items = this.shopItems(tab);
    if (!this.asSel || this.asSel.tab !== tab || !items.some(it => it.id === this.asSel.id)) { const eq = items.find(it => it.state === 'eq' || it.state === 'pick') || items[0]; this.asSel = { tab, id: eq.id }; }
    const list = $('asList'); list.textContent = '';
    if (tab === 'tal') list.appendChild(el('div', 'panel info small', ltf('Talents open with story stars (you have {0} ★). Pick one per tier and switch any time for free.', Store.stars())));
    for (const it of items) {
      const sel = it.id === this.asSel.id, b = el('button', 'item shop' + (sel ? ' sel' : '') + (it.state === 'eq' || it.state === 'pick' ? ' on' : '') + (it.state === 'lock' ? ' lock' : ''));
      const ic = document.createElement('canvas'); ic.className = 'ic'; ic.width = ic.height = 112; b.appendChild(ic); drawIcon(ic.getContext('2d'), it, 112);
      b.appendChild(el('span', 'nm', (tab === 'tal' ? ltf('TIER {0} · ', it.tier + 1) : '') + it.name));
      b.appendChild(el('span', 'pr', this.priceTag(it)));
      b.appendChild(el('span', 'ds', it.desc));
      if (tab === 'blades') {
        const nx = MASTERY_XP[it.ml + 1], lo = MASTERY_XP[it.ml];
        b.appendChild(el('span', 'ms', ltf('MASTERY {0}/4', it.ml) + (nx ? ' · ' + it.xp + '/' + nx : ' · ' + lt('MAXED'))));
        const bar = el('span', 'mbar'), f = el('i'); f.style.width = (nx ? Math.round((it.xp - lo) / (nx - lo) * 100) : 100) + '%'; bar.appendChild(f); b.appendChild(bar);
      }
      if (tab === 'heroes' && (it.own || it.hxp > 0)) {
        const nx = HM_XP[it.hl + 1], lo = HM_XP[it.hl];
        b.appendChild(el('span', 'ms', ltf('HERO MASTERY {0}/4', it.hl) + (nx ? ' · ' + it.hxp + '/' + nx : ' · ' + lt('MAXED'))));
        const bar = el('span', 'mbar'), f = el('i'); f.style.width = (nx ? Math.round((it.hxp - lo) / (nx - lo) * 100) : 100) + '%'; bar.appendChild(f); b.appendChild(bar);
      }
      if (tab === 'pets' && it.own) {
        const nx = PET_XP[it.pl], lo = PET_XP[it.pl - 1];
        b.appendChild(el('span', 'ms', ltf('PET LEVEL {0}/5', it.pl) + (nx ? ' · ' + it.pxp + '/' + nx : ' · ' + lt('MAXED'))));
        const bar = el('span', 'mbar'), f = el('i'); f.style.width = (nx ? Math.round((it.pxp - lo) / (nx - lo) * 100) : 100) + '%'; bar.appendChild(f); b.appendChild(bar);
      }
      if (tab === 'upg') { const bar = el('span', 'mbar'), f = el('i'); f.style.width = Math.round(it.lv / it.maxLv * 100) + '%'; bar.appendChild(f); b.appendChild(bar); }
      if (tab === 'skills') {
        b.appendChild(el('span', 'ms', ltf('EVOLVES {0} · USED {1}/{2}', it.base, Math.min(it.uses, it.need), it.need)));
        const bar = el('span', 'mbar'), f = el('i'); f.style.width = Math.round(Math.min(1, it.uses / it.need) * 100) + '%'; bar.appendChild(f); b.appendChild(bar);
      }
      b.onclick = () => { Aud.sfx('ui'); this.asSel = { tab, id: it.id }; this.renderArsenal(); };
      list.appendChild(b);
    }
    this.renderShopInfo(items.find(it => it.id === this.asSel.id));
  },
  priceTag(it) {
    switch (it.state) {
      case 'eq': return lt('EQUIPPED'); case 'own': return lt('OWNED'); case 'claim': return lt('UNLOCKED');
      case 'lock': return it.tab === 'tal' ? ltf('{0} ★', it.need) : lt('LOCKED');
      case 'max': return lt('MAX'); case 'up': return ltf('LV {0}/{1}', it.lv, it.maxLv);
      case 'pick': case 'evo': return lt('ACTIVE'); case 'free': return lt('AVAILABLE'); case 'evoOff': return lt('OFF');
      default: return fmtNum(it.price) + ' CR';
    }
  },
  renderShopInfo(it) {
    if (!it) return; Preview.sel = it; Preview.reset();
    $('asPn').textContent = it.name;
    let desc = it.desc;
    if (it.tab === 'blades') { desc += ' · ' + it.sub + ' · ' + ltf('Signature (mastery 2): {0} — {1}', lt(SIGS[it.id].n), lt(SIGS[it.id].d)); }
    if (it.tab === 'heroes') desc += ' · ' + this.heroPerksText(it.id);
    if (it.tab === 'pets' && it.id !== 'none') desc += ' · ' + ltf('LEVEL {0}: {1}', it.pl, petLevelText(it.id, it.pl)) + (it.pl < 5 ? ' · ' + ltf('Next: {0}', petLevelText(it.id, it.pl + 1)) + ' · ' + lt('Pets gain XP from every enemy you defeat with them.') : '') + ' · ' + lt('Tap the preview to pet it.');
    if (it.tab === 'upg') desc += ' · ' + (it.state === 'max' ? upgStat(it.id, it.lv) : upgStat(it.id, it.lv) + '  →  ' + upgStat(it.id, it.lv + 1));
    if (it.state === 'lock' && it.lock) desc += ' · ' + it.lock;
    if (it.tab === 'tal' && it.state === 'lock') desc += ' · ' + ltf('Opens at {0} story stars.', it.need);
    if (it.tab === 'skills') desc += ' · ' + ltf('Cooldown +{0}%.', it.cdUp) + ' ' + (it.state === 'lock' ? ltf('Use {0} {1} more times in any mode to unlock it.', it.base, it.need - it.uses) : lt('You can switch back to the normal skill any time.'));
    $('asPd').textContent = desc;
    const a = $('asAct'); a.disabled = false; a.className = 'btn pri';
    let label = '';
    switch (it.state) {
      case 'eq': label = lt('EQUIPPED'); a.disabled = true; break;
      case 'own': label = lt('EQUIP'); break;
      case 'claim': label = lt('CLAIM'); a.className = 'btn gold'; break;
      case 'lock': label = lt('LOCKED'); a.disabled = true; break;
      case 'max': label = lt('MAXED'); a.disabled = true; break;
      case 'pick': label = lt('ACTIVE'); a.disabled = true; break;
      case 'free': label = lt('PICK THIS TALENT'); break;
      case 'evo': label = lt('SWITCH TO THE NORMAL SKILL'); a.className = 'btn'; break;
      case 'evoOff': label = lt('SWITCH THE EVOLUTION ON'); break;
      case 'evolve': label = it.can ? ltf('EVOLVE · {0} CR', fmtNum(it.price)) : ltf('NEED {0} CR', fmtNum(it.price)); a.disabled = !it.can; if (it.can) a.className = 'btn gold'; break;
      case 'up': label = it.can ? ltf('UPGRADE · {0} CR', fmtNum(it.price)) : ltf('NEED {0} CR', fmtNum(it.price)); a.disabled = !it.can; break;
      default: label = it.can ? ltf('BUY · {0} CR', fmtNum(it.price)) : ltf('NEED {0} CR', fmtNum(it.price)); a.disabled = !it.can;
    }
    a.textContent = label;
    a.onclick = () => this.shopAct(it);
    const alt = $('asAlt'), canAlt = it.tab === 'heroes' && it.own && it.hl >= 2, d = Store.data; alt.classList.toggle('hidden', !canAlt);
    if (canAlt) {
      const on = !!(d.alt && d.alt[it.id]); alt.textContent = on ? lt('ALTERNATE COLORS: ON') : lt('ALTERNATE COLORS: OFF');
      alt.onclick = () => { d.alt = d.alt || {}; d.alt[it.id] = on ? 0 : 1; Aud.sfx('ui'); Store.touch(); Store.flush(); this.renderArsenal(); };
    }
  },
  shopAct(it) {
    const d = Store.data;
    if (it.tab === 'tal') { if (it.state !== 'free') return; d.talents[it.tier] = it.side; Aud.sfx('buy'); }
    else if (it.tab === 'skills') {
      d.skillEvo = d.skillEvo || {}; d.evoOwn = d.evoOwn || {};
      if (it.state === 'evolve') { if (d.credits < it.price) { Aud.sfx('deny'); return; } d.credits -= it.price; d.evoOwn[it.id] = 1; d.skillEvo[it.id] = 1; Aud.sfx('star', 2); FX.call(lt('SKILL EVOLVED'), '#ffd700', 2); toast(ltf('{0} EVOLVED', it.base), '#ffd700'); }
      else if (it.state === 'evo') { d.skillEvo[it.id] = 0; Aud.sfx('ui'); }
      else if (it.state === 'evoOff') { d.skillEvo[it.id] = 1; Aud.sfx('ui'); }
      else { Aud.sfx('deny'); return; }
    }
    else if (it.tab === 'upg') { if (it.state !== 'up' || d.credits < it.price) { Aud.sfx('deny'); return; } d.credits -= it.price; d.upg[it.id] = it.lv + 1; Aud.sfx('buy'); }
    else {
      if (it.tab === 'pets') d.pets = d.pets || {};
      const ownK = it.tab === 'blades' ? 'owned' : it.tab === 'heroes' ? 'skins' : it.tab === 'pets' ? 'pets' : 'blades', eqK = it.tab === 'blades' ? 'weapon' : it.tab === 'heroes' ? 'skin' : it.tab === 'pets' ? 'pet' : 'blade';
      if (it.state === 'own') { d[eqK] = it.id; Aud.sfx('ui'); }
      else if (it.state === 'claim') { d[ownK][it.id] = 1; d[eqK] = it.id; Aud.sfx('buy'); }
      else if (it.state === 'buy' && it.can) { d.credits -= it.price; d[ownK][it.id] = 1; d[eqK] = it.id; Aud.sfx('buy'); FX.call(lt('NEW GEAR'), '#ffd700', 2); }
      else { Aud.sfx('deny'); return; }
    }
    Store.touch(); Store.flush(); this.renderArsenal(); this.refreshProfile();
  }
});
/* ---------------- icons (drawn once per list render) ---------------- */
function drawIcon(g, it, S) {
  g.clearRect(0, 0, S, S); g.fillStyle = '#070a18'; g.fillRect(0, 0, S, S);
  withCtx(g, () => {
    g.save(); const k = S / 56; g.setTransform(k, 0, 0, k, 0, 0);
    if (it.tab === 'heroes') { const h = HO; heroSetSkin(h, skinLook(it.id)); iconHero(h, 30, 31, .95, Store.data.weapon, bladeOf(Store.data.blade)); }
    else if (it.tab === 'blades') { const h = HO; heroSetSkin(h, skinOf(Store.data.skin)); h.w = it.id; h.fx = bladeOf(Store.data.blade); h.bl = 44; h.t = CAM.t; h.dashing = false; h.od = h.hot = 0; g.translate(14, 42); drawWeapon(h, -.78); }
    else if (it.tab === 'fx') {
      const h = HO, f = bladeOf(it.id); heroSetSkin(h, skinOf(Store.data.skin)); h.w = 'katana'; h.fx = f; h.bl = 46; h.t = 1; h.dashing = false; h.od = h.hot = 0;
      const tc = f.blade && f.blade !== 'prism' && f.blade !== 'glitch' ? (f.id === 'obsidian' ? '#ff0844' : f.blade) : f.blade === 'prism' ? PRISM[6] : f.blade === 'glitch' ? '#ff2bd6' : h.ca;
      g.strokeStyle = tc; g.globalAlpha = .5; g.lineWidth = 3; g.beginPath(); g.arc(26, 30, 20, -2.4, -.3); g.stroke(); g.globalAlpha = 1;
      for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#ffffff' : tc; g.globalAlpha = .4 + i * .08; g.fillRect(8 + i * 3, 44 - i * 2.4 + (i % 2) * 3, 2.5, 2.5); } g.globalAlpha = 1;
      g.translate(12, 46); drawWeapon(h, -.8);
    }
    else if (it.tab === 'pets') { if (it.id === 'none') { g.strokeStyle = '#5a6488'; g.lineWidth = 3; g.beginPath(); g.arc(28, 28, 14, 0, TAU); g.moveTo(18, 38); g.lineTo(38, 18); g.stroke(); } else { g.translate(26, 30); g.scale(1.7, 1.7); drawPet(it.id, 0, 0, 0, CAM.t * 6, 1, false, 0); } }
    else if (it.tab === 'upg') upgIcon(g, it.id);
    else if (it.tab === 'skills') skillIcon(g, it.id, it.state === 'evo' || it.state === 'evoOff', it.state === 'lock');
    else talIcon(g, it.tid);
    g.restore();
  });
}
function iconHero(h, x, y, sc, w, fx) {
  cx.save(); cx.translate(x, y); cx.scale(sc, sc);
  h.x = 0; h.y = 0; h.face = h.mvA = -.5; h.spd = 0; h.ph = 0; h.sx = h.sy = 1; h.dashing = false; h.blade = -.5 + 1.8; h.alpha = 1; h.w = w; h.fx = fx; h.bl = 44; h.t = 1.3; h.hot = h.od = 0;
  drawHero(h); cx.restore();
}
function upgIcon(g, k) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (k === 'dmg') { g.strokeStyle = '#00f2fe'; g.lineWidth = 4; g.beginPath(); g.moveTo(12, 44); g.lineTo(40, 16); g.stroke(); g.fillStyle = '#ffd700'; g.font = '900 20px ' + FONT_D; g.textAlign = 'center'; g.fillText('+', 42, 46); }
  else if (k === 'shield') { for (let i = 0; i < 3; i++) { g.fillStyle = i === 2 ? '#ffd700' : '#00ff88'; poly(14 + i * 14, 28, 6.5, 6, 0); g.fill(); } g.fillStyle = '#ffd700'; g.font = '900 14px ' + FONT_D; g.textAlign = 'center'; g.fillText('+1', 42, 48); }
  else if (k === 'cool') { g.strokeStyle = '#7df9ff'; g.lineWidth = 3; g.beginPath(); g.arc(28, 28, 15, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(28, 28); g.lineTo(28, 18); g.moveTo(28, 28); g.lineTo(36, 32); g.stroke(); for (let i = 0; i < 3; i++) { g.fillStyle = '#00f2fe'; g.fillRect(12 + i * 12, 48, 9, 4); } }
  else if (k === 'parry') { g.strokeStyle = '#ffd700'; g.lineWidth = 3; g.beginPath(); g.arc(24, 30, 14, 0, TAU); g.stroke(); g.fillStyle = '#ff9a00'; dot(44, 16, 4); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(44, 16); g.lineTo(34, 24); g.lineTo(46, 38); g.stroke(); g.setLineDash([]); }
  else if (k === 'magnet') { g.strokeStyle = '#ff3b5c'; g.lineWidth = 6; g.beginPath(); g.arc(20, 26, 10, Math.PI * .5, Math.PI * 1.5); g.stroke(); g.strokeStyle = '#c0c8e0'; g.beginPath(); g.moveTo(20, 16); g.lineTo(26, 16); g.moveTo(20, 36); g.lineTo(26, 36); g.stroke(); g.fillStyle = '#ffd700'; for (let i = 0; i < 3; i++) g.fillRect(34 + i * 6, 22 + (i % 2) * 6, 4, 6); }
  else if (k === 'drone') { g.strokeStyle = 'rgba(0,255,136,.4)'; g.lineWidth = 1.5; g.beginPath(); g.arc(28, 28, 16, 0, TAU); g.stroke(); g.fillStyle = '#00ff88'; g.fillRect(40, 16, 8, 8); g.strokeStyle = '#00ff88'; g.lineWidth = 2; g.beginPath(); g.moveTo(44, 20); g.lineTo(18, 42); g.stroke(); g.fillStyle = '#ff3b5c'; dot(16, 44, 4); }
  else if (k === 'heat') { g.strokeStyle = '#ff6a00'; g.lineWidth = 6; g.beginPath(); g.moveTo(20, 12); g.lineTo(20, 40); g.stroke(); g.fillStyle = '#ff6a00'; dot(20, 44, 6); g.strokeStyle = '#bff4ff'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(38 + Math.cos(a) * 9, 26 + Math.sin(a) * 9); g.lineTo(38 - Math.cos(a) * 9, 26 - Math.sin(a) * 9); g.stroke(); } }
}
function skillIcon(g, id, evolved, locked) { // the dock icon, tripled / caged / twinned once evolved
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 3; const c = { grapple: '#00ff88', hijack: '#00f2fe', web: '#ffd700', echo: '#c45bff' }[id];
  g.strokeStyle = c; g.fillStyle = c; g.globalAlpha = locked ? .45 : 1;
  if (id === 'grapple') {
    const hook = (x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, -14); g.lineTo(0, 2); g.arc(-5, 2, 5, 0, Math.PI, false); g.stroke(); g.beginPath(); g.moveTo(-4, -11); g.lineTo(0, -14); g.lineTo(4, -11); g.stroke(); g.restore(); };
    if (evolved) { hook(16, 30, .75); hook(30, 24, .9); hook(42, 32, .75); g.setLineDash([3, 3]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(16, 40); g.lineTo(30, 36); g.lineTo(42, 42); g.stroke(); g.setLineDash([]); } else hook(30, 30, 1.2);
  } else if (id === 'hijack') {
    const chip = (x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.strokeRect(-6, -6, 12, 12); g.beginPath(); for (const q of [-3, 3]) { g.moveTo(q, -6); g.lineTo(q, -10); g.moveTo(q, 6); g.lineTo(q, 10); g.moveTo(-6, q); g.lineTo(-10, q); g.moveTo(6, q); g.lineTo(10, q); } g.stroke(); g.restore(); };
    if (evolved) { chip(18, 18, .7); chip(38, 18, .7); chip(18, 38, .7); chip(38, 38, .7); } else chip(28, 28, 1.4);
  } else if (id === 'web') {
    g.beginPath(); g.moveTo(8, 16); g.lineTo(48, 20); g.moveTo(8, 28); g.lineTo(48, 28); g.moveTo(8, 40); g.lineTo(48, 36); if (evolved) { g.moveTo(16, 8); g.lineTo(18, 48); g.moveTo(40, 8); g.lineTo(38, 48); } g.stroke();
  } else {
    const chev = (x, s) => { g.beginPath(); g.moveTo(x + 6 * s, 16); g.lineTo(x - 6 * s, 28); g.lineTo(x + 6 * s, 40); g.stroke(); };
    chev(24, 1); chev(36, 1); if (evolved) { g.strokeStyle = '#00f2fe'; chev(14, .8); chev(46, .8); }
  }
  g.globalAlpha = 1; if (evolved) { g.fillStyle = '#ffd700'; poly(48, 9, 5, 5, -1.57); g.fill(); }
}
function talIcon(g, id) {
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 3;
  const c = { quick: '#00f2fe', steady: '#bff4ff', headstart: '#ff2bd6', scav: '#ffd700', grazer: '#7df9ff', lockon: '#ffd700', regen: '#00ff88', keen: '#ffd700', odlong: '#ff2bd6', surge: '#c45bff', laststand: '#ff3b5c', berserk: '#ff0844' }[id] || '#ffffff';
  g.strokeStyle = c; g.fillStyle = c;
  switch (id) {
    case 'quick': case 'headstart': case 'odlong': g.beginPath(); g.moveTo(31, 8); g.lineTo(17, 31); g.lineTo(28, 31); g.lineTo(24, 48); g.lineTo(40, 23); g.lineTo(29, 23); g.closePath(); g.fill(); if (id === 'odlong') { g.strokeStyle = '#fff'; g.beginPath(); g.arc(42, 42, 7, 0, TAU); g.stroke(); } break;
    case 'steady': for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(28 + Math.cos(a) * 16, 28 + Math.sin(a) * 16); g.lineTo(28 - Math.cos(a) * 16, 28 - Math.sin(a) * 16); g.stroke(); } break;
    case 'scav': for (let i = 0; i < 3; i++) g.fillRect(14 + i * 10, 34 - i * 8, 8, 12); break;
    case 'grazer': g.beginPath(); g.moveTo(10, 40); g.quadraticCurveTo(28, 10, 46, 38); g.stroke(); g.fillStyle = '#ff9a00'; dot(30, 34, 4); break;
    case 'lockon': g.beginPath(); g.arc(28, 28, 14, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(28, 8); g.lineTo(28, 18); g.moveTo(28, 38); g.lineTo(28, 48); g.moveTo(8, 28); g.lineTo(18, 28); g.moveTo(38, 28); g.lineTo(48, 28); g.stroke(); break;
    case 'regen': poly(28, 28, 16, 6, 0); g.stroke(); g.font = '900 20px ' + FONT_D; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+', 28, 29); g.textBaseline = 'alphabetic'; break;
    case 'keen': poly(28, 28, 16, 4, 0); g.fill(); g.fillStyle = '#05060f'; poly(28, 28, 6, 4, 0); g.fill(); break;
    case 'surge': g.beginPath(); g.arc(28, 28, 10, 0, TAU); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g.beginPath(); g.moveTo(28 + Math.cos(a) * 12, 28 + Math.sin(a) * 12); g.lineTo(28 + Math.cos(a) * 18, 28 + Math.sin(a) * 18); g.stroke(); } break;
    case 'laststand': poly(28, 28, 17, 6, 0); g.stroke(); g.beginPath(); g.moveTo(24, 14); g.lineTo(31, 26); g.lineTo(25, 32); g.lineTo(32, 44); g.stroke(); break;
    case 'berserk': g.lineWidth = 5; g.beginPath(); g.moveTo(12, 44); g.lineTo(44, 12); g.stroke(); g.fillStyle = '#ff0844'; for (let i = 0; i < 3; i++) dot(16 + i * 6, 16 + i * 3, 2.5); break;
  }
}
/* ---------------- animated preview of the selected item ---------------- */
const Preview = {
  sel: null, t: 0, g: null, cv: null, W: 400, coins: [], last: 0, hit: false,
  attach() {
    if (!this.petBound && $('asCv')) { this.petBound = 1; $('asCv').addEventListener('pointerdown', () => { if (this.sel && this.sel.tab === 'pets' && this.sel.id !== 'none') { this.petT = 1.6; Aud.tone(900, 1300, .08, .05, 'sine'); vibe('tap'); } }); }
    const cv = $('asCv'); if (!cv) return; this.cv = cv; const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(200, Math.round(r.width || 360)), h = Math.max(100, Math.round(r.height || 170)); // the scene is 170 units tall and scales to the box
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); this.g = cv.getContext('2d'); this.cw = w; this.k = cv.height / 170; this.W = cv.width / this.k; this.chk = .5;
  },
  reset() { this.t = 0; this.hit = false; this.coins.length = 0; this.kn = []; this.cr = false; FX.clear(); },
  tick(rd) {
    if (UI.cur !== 'arsenal' || !this.g || !this.sel) return;
    this.chk -= rd; if (this.chk <= 0) { this.chk = .5; const r = this.cv.getBoundingClientRect(); if (r.width > 0 && Math.abs(r.width - this.cw) > 4) this.attach(); }
    this.t += rd; FX.update(rd, rd);
    withCtx(this.g, () => { cx.setTransform(this.k, 0, 0, this.k, 0, 0); cx.direction = LANG.rtl ? 'rtl' : 'ltr'; this.draw(rd); });
  },
  floor() { // version 33: a showroom stage lit in the item's rarity color, with a reveal flash on every new pick
    if (CALM) return this.floor0();
    const W = this.W, t = this.t, s = this.sel || {}, c = (s.tier >= 0 && TIERS[s.tier] ? TIERS[s.tier].c : null) || skinLook(s.tab === 'heroes' ? s.id : Store.data.skin).a || '#00f2fe';
    const bg = cx.createLinearGradient(0, 0, 0, 170); bg.addColorStop(0, '#070a18'); bg.addColorStop(.6, '#0c1230'); bg.addColorStop(1, '#05060f'); cx.fillStyle = bg; cx.fillRect(0, 0, W, 170);
    cx.save(); cx.globalCompositeOperation = 'lighter';
    // spotlight cone from above
    const sp = cx.createLinearGradient(0, 0, 0, 150); sp.addColorStop(0, hexA(c, .28)); sp.addColorStop(1, hexA(c, 0)); cx.fillStyle = sp;
    cx.beginPath(); cx.moveTo(W / 2 - 30, 0); cx.lineTo(W / 2 + 30, 0); cx.lineTo(W / 2 + 120, 150); cx.lineTo(W / 2 - 120, 150); cx.closePath(); cx.fill();
    // hex grid drifting on the back wall
    cx.strokeStyle = hexA(c, .1); cx.lineWidth = 1; cx.beginPath(); const hs = 16, off = (t * 8) % (hs * 1.5);
    for (let row = -1; row < 170 / (hs * .87) + 1; row++) for (let col = -1; col < W / (hs * 1.5) + 2; col++) { const hx = col * hs * 1.5 - off + (row % 2) * hs * .75, hy = row * hs * .87; cx.moveTo(hx + hs * .5, hy); cx.lineTo(hx + hs * .25, hy - hs * .43); }
    cx.stroke();
    // a turning ring of light under the action
    cx.translate(W / 2, 104); cx.scale(1, .32); cx.lineWidth = 3;
    for (let k = 0; k < 3; k++) { cx.strokeStyle = hexA(c, .5 - k * .14); cx.beginPath(); cx.arc(0, 0, 70 + k * 16, t * (1.2 - k * .5), t * (1.2 - k * .5) + 4.2); cx.stroke(); }
    cx.restore();
    // floating motes
    cx.fillStyle = c; for (let i = 0; i < 14; i++) { const mx = (i * 97.3 + t * (10 + i % 5 * 6)) % W, my = 170 - ((i * 53.1 + t * (14 + i % 3 * 9)) % 170); cx.globalAlpha = .25 + .25 * Math.sin(t * 3 + i); cx.fillRect(mx, my, 2, 2); } cx.globalAlpha = 1;
    // rails in the rarity color
    cx.save(); cx.shadowColor = c; cx.shadowBlur = 10; cx.fillStyle = c; cx.globalAlpha = .75 + .25 * Math.sin(t * 4); cx.fillRect(10, 0, 3, 170); cx.fillRect(W - 13, 0, 3, 170); cx.restore();
    // the reveal: a flash and a ring burst when something new is picked
    if (t < .6) { const k = t / .6; cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = (1 - k) * .55; cx.fillStyle = c; cx.fillRect(0, 0, W, 170);
      cx.globalAlpha = 1 - k; cx.strokeStyle = '#ffffff'; cx.lineWidth = 3 * (1 - k) + 1; cx.beginPath(); cx.ellipse(W / 2, 100, 20 + k * 160, (20 + k * 160) * .4, 0, 0, TAU); cx.stroke(); cx.restore(); }
  },
  floor0() {
    const W = this.W; cx.fillStyle = '#0b0f22'; cx.fillRect(0, 0, W, 170); cx.fillStyle = '#0e1430'; cx.fillRect(W * .3, 0, W * .4, 170);
    cx.strokeStyle = 'rgba(0,242,254,.12)'; cx.lineWidth = 2; cx.beginPath(); for (let y = (-this.t * 60) % 48; y < 170; y += 48) { cx.moveTo(14, y); cx.lineTo(W - 14, y); } cx.stroke();
    cx.fillStyle = '#00f2fe'; cx.fillRect(10, 0, 3, 170); cx.fillRect(W - 13, 0, 3, 170);
  },
  hero(x, y, face, spd, dashing, blade) {
    const d = Store.data, s = this.sel, h = HO;
    heroSetSkin(h, skinLook(s.tab === 'heroes' ? s.id : d.skin));
    h.x = x; h.y = y; h.face = face; h.mvA = face; h.spd = spd; h.ph = this.t * 13; h.sx = h.sy = 1; h.dashing = dashing; h.blade = blade; h.alpha = 1;
    h.w = s.tab === 'blades' ? s.id : d.weapon; h.fx = bladeOf(s.tab === 'fx' ? s.id : d.blade); h.bl = 54; h.t = this.t; h.hot = h.od = 0;
    if (h.body !== 'tengu' && h.body !== 'yurei') { // short scarf so heroes look complete
      const sc = this.sc || (this.sc = new Float32Array(20)); for (let i = 0; i < 10; i++) { sc[i * 2] = x - Math.cos(face) * (8 + i * 4.5); sc[i * 2 + 1] = y - Math.sin(face) * (8 + i * 4.5) + Math.sin(this.t * 6 + i * .6) * i * .5; }
      drawHeroTrail(h.body, sc, h.ca, h.cb);
    }
    if (this.swOn) { SWING.apply(SWV, h); this.swOn = false; }
    drawHero(h);
  },
  poseScene(t) {
    const W = this.W, h = HO, x = W / 2, y = 100; heroSetSkin(h, skinLook(this.sel.id));
    h.x = x; h.y = y; h.ph = 0; h.alpha = 1; h.w = Store.data.weapon; h.fx = bladeOf(Store.data.blade); h.bl = 54; h.t = this.t; h.hot = h.od = 0;
    heroPose(h, t); glow(x, y - 20, 70, '#ffd23f', .2 + .08 * Math.sin(t * 6)); poseFx(x, y, t, h.ca, t < this.pl ? 0 : this.pl || 0); this.pl = t;
    FX.drawLow(); drawHero(h); FX.drawHigh();
  },
  dummy(x, y, alive) { if (!alive) return; cx.fillStyle = '#5a4428'; cx.beginPath(); cx.arc(x, y, 15, 0, TAU); cx.fill(); cx.strokeStyle = '#d9b46a'; cx.lineWidth = 3; cx.stroke(); cx.strokeStyle = '#2a1e10'; cx.beginPath(); cx.moveTo(x - 10, y - 10); cx.lineTo(x + 10, y + 10); cx.moveTo(x + 10, y - 10); cx.lineTo(x - 10, y + 10); cx.stroke(); },
  slashScene(walkOnly) { // walk, dash through a dummy, walk back
    const W = this.W, T = 3.2, p = this.t % T, x0 = W * .27, x1 = W * .52, dx = W * .68, y = 92;
    const s = this.sel, fx = bladeOf(s.tab === 'fx' ? s.id : Store.data.blade);
    let x, face, spd = 0, dash = false, blade;
    if (p < 1.5) { x = lerp(x0, x1, p / 1.5); face = 0; spd = 200; }
    else if (p < 1.85) { const k = (p - 1.5) / .35; x = lerp(x1, dx + 22, k); face = 0; spd = 1200; dash = true; if (!this.hit && x > dx - 8) { this.hit = true; const e = { x: dx, y, r: 15, ang: 0, type: ET.DUMMY, col: '#d9b46a' }; FX.slice(e, 0); FX.ring(dx, y, 40, '#d9b46a', 3); if (fx.kill) FX.bladeKill(e, 0, fx.kill); else FX.spark(dx, y, '#d9b46a', 10); Aud.sfx('kill', 2); } if (fx.trail && rnd() < .8) FX.trail(x - 12, y, 0, fx.trail); }
    else { const k = (p - 1.85) / (T - 1.85); x = lerp(dx + 22, x0, k); face = Math.PI; spd = 190; }
    if (p < .05) { this.hit = false; this.cr = false; this.kt = false; }
    blade = dash ? face - 1.2 : face + Math.sin(this.t * 2.5) * .2 + 1.8;
    const wid = s.tab === 'blades' ? s.id : Store.data.weapon; // each blade shows its own trick
    if (wid === 'kunai' && dash && !this.kt) { this.kt = true; for (let k = -1; k <= 1; k++) this.kn.push({ x: x + 10, y, a: k * .2 }); }
    if (wid === 'chakram' && dash && !this.ckr) { this.ckr = { x: x + 10, y, t: 0 }; }
    if (this.ckr) { const q = this.ckr; q.t += RDT; if (q.t < .4) q.x += 640 * RDT * (1 - q.t / .4); else { const dx = x - q.x, dy = y - q.y, d = Math.hypot(dx, dy) || 1; q.x += dx / d * 720 * RDT; q.y += dy / d * 720 * RDT; if (d < 14) this.ckr = null; }
      if (this.ckr) { cx.save(); cx.translate(q.x, q.y); cx.rotate(this.t * 24); glow(0, 0, 22, '#ff4fd8', .5); cx.strokeStyle = '#ff4fd8'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 9, 0, TAU); cx.stroke(); cx.fillStyle = '#ffd6f3'; for (let k = 0; k < 4; k++) { cx.rotate(TAU / 4); cx.beginPath(); cx.moveTo(9, -2); cx.lineTo(14, 0); cx.lineTo(9, 2.4); cx.closePath(); cx.fill(); } cx.restore(); } }
    if (p < .05) this.ckr = null;
    if (wid === 'whip' && p >= 1.85 && !this.cr) { this.cr = true; FX.arc(dx + 22, y, 0, 70, '#ffffff', 8); FX.arc(dx + 22, y, 0, 56, HO.ca, 5); }
    for (let i = this.kn.length - 1; i >= 0; i--) { const q = this.kn[i]; q.x += Math.cos(q.a) * 560 * RDT; q.y += Math.sin(q.a) * 560 * RDT; if (q.x > W + 10) { this.kn.splice(i, 1); continue; }
      cx.save(); cx.translate(q.x, q.y); cx.rotate(q.a); cx.fillStyle = '#1a2038'; cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(0, -3.6); cx.lineTo(-6, 0); cx.lineTo(0, 3.6); cx.closePath(); cx.fill(); cx.strokeStyle = '#c9d6ff'; cx.lineWidth = 1.6; cx.stroke(); cx.restore(); }
    if (wid === 'fists' && this.hit && p < 2.4) { this.dummy(dx + (p - 1.7) * 260, y - Math.sin(Math.min(1, (p - 1.7) / .7) * Math.PI) * 20, true); }
    if (dash && p < 1.6) FX.arc(x + 10, y, 0, 46, fx.blade && fx.blade !== 'glitch' && fx.blade !== 'prism' ? (fx.id === 'obsidian' ? '#ff0844' : fx.blade) : fx.blade === 'prism' ? PRISM[(this.t * 18 | 0) % 24] : HO.ca, 6);
    if (!walkOnly) this.dummy(dx, y, !this.hit || p > 2.6);
    { const d = Store.data, wid2 = s.tab === 'blades' ? s.id : d.weapon; WFX.use(wid2, fx, skinLook(s.tab === 'heroes' ? s.id : d.skin).a); // weapon FX in the preview
      if (dash && !this.sw) { this.sw = true; WFX.swing(face, x, y); SWV.d = 1; SWING.start(SWV, wid2, face, this.t); } if (!dash) this.sw = false;
      if (SWING.pose(SWV, this.t, face + Math.sin(this.t * 2.5) * .2 + 1.8)) { this.swOn = true; SWING.rec(SWV, this.t); SWING.beats(SWV, x, y, 54, true); SWING.smear(SWV, x, y, 54, SW_COL[wid2] || WFX.col(), this.t); }
      if (this.hit && !this.wh) { this.wh = true; WFX.hit(dx, y, 0, p % 6.4 > 3.2); WFX.kill({ x: dx, y, r: 15 }, 0); } if (!this.hit) this.wh = false; }
    FX.drawLow(); this.hero(x, y, face, spd, dash, blade); FX.drawHigh(); WFX.use('', null, '');
  },
  skillScene(id) { // the evolved skill in action: hero on the left, targets on the right
    const W = this.W, y = 92, hx = W * .22, p = this.t % 3, c = { grapple: '#00ff88', hijack: '#00f2fe', web: '#ffd700', echo: '#c45bff' }[id];
    const tg = [[W * .5, 52], [W * .66, 120], [W * .82, 60], [W * .6, 86]];
    if (id === 'grapple') { // the hook slams three targets in a row
      const k = Math.min(2, Math.floor(p / .6)), at = tg[k];
      for (let i = 0; i < 3; i++) this.dummy(tg[i][0], tg[i][1], p < .6 * i + .3 || p > 2.4);
      cx.strokeStyle = c; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.moveTo(hx, y); for (let i = 0; i <= k; i++) cx.lineTo(tg[i][0], tg[i][1]); cx.stroke(); cx.setLineDash(NODASH);
      this.hero(p < 1.8 ? at[0] - 26 : hx, p < 1.8 ? at[1] : y, 0, 0, p < 1.8, p < 1.8 ? -1.2 : 1.8);
      if ((p % .6) < .05) FX.ring(at[0], at[1], 46, c, 4);
    } else if (id === 'hijack') { // four drones turn to your side
      this.hero(hx, y, 0, 0, false, 1.8);
      for (let i = 0; i < 4; i++) { const on = p > .4 + i * .25, q = tg[i]; cx.fillStyle = on ? '#00f2fe' : '#ff3b5c'; poly(q[0], q[1], 13, 5, CAM.t + i); cx.fill(); if (on) { cx.strokeStyle = 'rgba(0,242,254,.5)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(hx, y); cx.lineTo(q[0], q[1]); cx.stroke(); } }
    } else if (id === 'web') { // a cage of five wires
      this.hero(W * .5, y, 0, 0, false, 1.8); cx.strokeStyle = c; cx.lineWidth = 2.5; cx.globalAlpha = .55 + .35 * Math.sin(this.t * 10);
      cx.beginPath(); for (const k of [-1, 0, 1]) { cx.moveTo(14, y + k * 40 - k * 10); cx.lineTo(W - 14, y + k * 40 + k * 10); } for (const k of [-1, 1]) { cx.moveTo(W * .5 + k * 80 - k * 10, 6); cx.lineTo(W * .5 + k * 80 + k * 10, 164); } cx.stroke(); cx.globalAlpha = 1;
      for (let i = 0; i < 2; i++) { const x = W * (.12 + i * .76) + Math.sin(this.t * .7 + i) * 6; this.dummy(x, 50 + i * 70, true); }
    } else { // two echoes fight beside you
      this.hero(hx, y, 0, 0, false, 1.8);
      for (let i = 0; i < 2; i++) { const t = (this.t * 1.3 + i * .5) % 2, x = lerp(W * .38, W * .78, Math.min(1, t)), yy = y + (i ? 40 : -40); cx.globalAlpha = .7; cx.fillStyle = '#c45bff'; cx.beginPath(); cx.arc(x, yy, 11, 0, TAU); cx.fill(); cx.globalAlpha = 1; if (t < 1) FX.ghost(x, yy, 0, '#c45bff'); }
      this.dummy(W * .86, y - 40, true); this.dummy(W * .86, y + 40, true);
    }
    FX.drawHigh();
  },
  draw(rd) {
    this.floor();
    const s = this.sel, W = this.W;
    if (s.tab === 'heroes' || s.tab === 'fx' || s.tab === 'blades') { // zoomed in so the hero and the blade read clearly
      const Z = 1.42; cx.save(); cx.translate(W / 2, 92); cx.scale(Z, Z); cx.translate(-W / 2, -92);
      const pz = this.t % 6.4; if (s.tab === 'heroes' && heroLevel(s.id) >= 3 && pz >= 3.2) this.poseScene(pz - 3.2); else this.slashScene(false); // mastery 3: the victory pose
      cx.restore(); return;
    }
    if (s.tab === 'pets') { // the hero runs, the pet follows and shows its trick
      const Z = 1.42; cx.save(); cx.translate(W / 2, 92); cx.scale(Z, Z); cx.translate(-W / 2, -92);
      const p = this.t % 4, x = W * .3 + Math.sin(this.t * .8) * 40, y = 92; this.hero(x, y, Math.cos(this.t * .8) > 0 ? 0 : Math.PI, 200, false, 1.8);
      if (s.id !== 'none') { const fx = s.id === 'drake' ? x - 6 : x - 40, fy = s.id === 'drake' ? y - 20 : y + 16, hap = (this.petT || 0) > 0; if (hap) this.petT -= RDT; drawPet(s.id, fx, fy - (hap ? Math.abs(Math.sin(this.t * 14)) * 6 : 0), Math.cos(this.t * .8) > 0 ? 0 : Math.PI, this.t * 14, this.t, p > 3 && !hap, s.id === 'kaya' && p > 3 ? 1 - (p - 3) : 0, hap ? 3 : 0);
        if ((s.id === 'tiger' || s.id === 'shark') && p > 3) { this.dummy(W * .78, y, true); FX.spark(W * .78, y, PET_BY_ID[s.id].col, 2); } }
      cx.restore(); return;
    }
    if (s.tab === 'tal') { cx.save(); cx.translate(W / 2 - 50, 35); cx.scale(1.8, 1.8); talIcon(cx, s.tid); cx.restore(); return; }
    if (s.tab === 'skills') { this.skillScene(s.id); return; }
    const lv = Store.data.upg[s.id] | 0, y = 92, hx = W * .3;
    switch (s.id) {
      case 'dmg': { this.slashScene(false); if (this.hit && !this.dn) { this.dn = 1; FX.text(W * .8, 60, '' + Math.round(100 * (1 + (lv + 1) * .15)), '#ffd700', 22, true); } if (!this.hit) this.dn = 0; break; }
      case 'shield': { this.hero(hx, y, 0, 0, false, 1.8); const n = 3 + lv; for (let i = 0; i <= n; i++) { const nx = i === n, x = W * .48 + i * 22; if (x > W - 20) break; cx.globalAlpha = nx ? .45 + .4 * Math.sin(this.t * 6) : 1; cx.fillStyle = nx ? '#ffd700' : '#00ff88'; poly(x, 60, 8, 6, 0); cx.fill(); cx.globalAlpha = 1; } cx.fillStyle = '#ffd700'; cx.font = '700 13px ' + FONT_D; cx.textAlign = 'left'; cx.fillText(ltf('NEXT: {0}', upgStat('shield', lv + 1)), W * .48, 100); break; }
      case 'cool': { this.hero(hx, y, 0, 0, false, 1.8); const rc = Math.max(.3, .66 - (lv + 1) * .04), f = (this.t % (rc * 2.2)) / (rc * 2.2); for (let i = 0; i < 2; i++) { cx.fillStyle = 'rgba(255,255,255,.15)'; cx.fillRect(W * .5 + i * 46, 70, 40, 8); cx.fillStyle = '#00f2fe'; cx.fillRect(W * .5 + i * 46, 70, 40 * clamp(f * 2 - i, 0, 1), 8); } cx.fillStyle = '#7df9ff'; cx.font = '700 13px ' + FONT_D; cx.textAlign = 'left'; cx.fillText(upgStat('cool', lv) + '  →  ' + upgStat('cool', lv + 1), W * .5, 104); break; }
      case 'parry': {
        const p = this.t % 2, bx = lerp(W - 20, hx + 20, Math.min(1, p / 1.1)), ref = p > 1.1; const r = 22 + (lv + 1) * 4;
        this.hero(hx, y, 0, 0, p > 1 && p < 1.3, p > 1 && p < 1.3 ? -1.2 : 1.8);
        cx.strokeStyle = '#ffd700'; cx.lineWidth = 3; cx.globalAlpha = .4 + .4 * Math.sin(this.t * 8); cx.beginPath(); cx.arc(hx, y, r, 0, TAU); cx.stroke(); cx.globalAlpha = 1;
        cx.fillStyle = ref ? HO.ca : '#ff9a00'; dot(ref ? lerp(hx + 20, W - 20, (p - 1.1) / .9) : bx, y - 6, 6);
        if (ref && !this.pf) { this.pf = 1; FX.ring(hx + 20, y - 6, 34, '#ffd700', 2); FX.text(hx + 20, y - 40, lt('PERFECT PARRY'), '#ffd700', 14); } if (!ref) this.pf = 0;
        break;
      }
      case 'magnet': {
        const r = (100 + (lv + 1) * 32) * .45; this.hero(hx, y, 0, 0, false, 1.8);
        cx.strokeStyle = 'rgba(255,215,0,.35)'; cx.setLineDash(DASH6); cx.lineWidth = 2; cx.beginPath(); cx.arc(hx, y, r, 0, TAU); cx.stroke(); cx.setLineDash(NODASH);
        if (this.coins.length < 10) this.coins.push({ x: hx + 30 + rnd() * (W * .65), y: 20 + rnd() * 130 });
        cx.fillStyle = '#ffd700';
        for (let i = this.coins.length - 1; i >= 0; i--) { const c = this.coins[i], d = dist(c.x, c.y, hx, y); if (d < r) { c.x += (hx - c.x) / d * 260 * rd; c.y += (y - c.y) / d * 260 * rd; } if (d < 14) { this.coins.splice(i, 1); continue; } cx.fillRect(c.x - 2.5, c.y - 3.5, 5, 7); }
        break;
      }
      case 'drone': {
        this.hero(hx, y, 0, 0, false, 1.8); const a = this.t * 3, dx = hx + Math.cos(a) * 34, dy = y + Math.sin(a) * 34; glow(dx, dy, 14, '#00ff88', .7); cx.fillStyle = '#00ff88'; cx.fillRect(dx - 4, dy - 4, 8, 8);
        const per = Math.max(.45, 1.35 - (lv + 1) * .17), tx = W * .78, ty = 70 + Math.sin(this.t) * 20; this.dummy(tx, ty, true);
        if ((this.t % per) < rd * 1.5) { FX.bolt(dx, dy, tx, ty, '#00ff88', .8); FX.spark(tx, ty, '#00ff88', 5); }
        FX.drawHigh(); break;
      }
      case 'heat': {
        this.hero(hx, y, 0, 0, false, 1.8); const cool = 12 + (lv + 1) * 3, hv = 100 - ((this.t * cool * 2) % 100);
        cx.fillStyle = 'rgba(255,255,255,.12)'; cx.fillRect(W * .5, 70, 150, 8); cx.fillStyle = hv > 75 ? '#ff6a00' : '#7df9ff'; cx.fillRect(W * .5, 70, 1.5 * hv, 8);
        if (rnd() < .3) { FX.trail(W * .5 + 1.5 * hv, 74, -1.5708, 'snow'); } FX.drawHigh();
        cx.fillStyle = '#7df9ff'; cx.font = '700 13px ' + FONT_D; cx.textAlign = 'left'; cx.fillText(upgStat('heat', lv) + '  →  ' + upgStat('heat', lv + 1), W * .5, 104); break;
      }
    }
  }
};
