/* ---------------- TIERS — the price of a thing is its power ----------------
   Every weapon, hero, blade skin and pet now has a tier (STARTER, COMMON, RARE,
   EPIC, LEGENDARY, MYTHIC) that comes from its price. Higher tiers are stronger:
   - weapons hit harder (up to +35%);
   - heroes add damage and Overdrive charge (up to +10% / +15%);
   - blade skins add critical chance (up to +3%);
   - pets trick more often and hit harder (up to +40%).
   Prices were redone along one curve, so there is always something worth
   saving for. Everything is bought with credits earned in the game.
   Runs recorded before version 25 replay without tiers, exactly as played. */
const TIERS = [
  { n: 'STARTER', c: '#9aa7c0' }, { n: 'COMMON', c: '#e8f0ff' }, { n: 'RARE', c: '#00b4ff' },
  { n: 'EPIC', c: '#c45bff' }, { n: 'LEGENDARY', c: '#ffb000' }, { n: 'MYTHIC', c: '#ff2b5e' }
];
const T_WPOW = [1, 1.05, 1.1, 1.17, 1.25, 1.35];
const T_SKIN = [[0, 0], [.02, .03], [.04, .06], [.06, .09], [.08, .12], [.1, .15]]; // damage, Overdrive charge
const T_FX = [0, .005, .01, .015, .02, .03]; // critical chance
const T_PET = [[1, 1], [1.08, .96], [1.16, .92], [1.24, .88], [1.32, .84], [1.4, .8]]; // power, cooldown
const NEW_PRICES = {
  w: { daggers: 900, hammer: 1100, scythe: 1300, kunai: 2000, whip: 2200, tessen: 2400, claws: 2600, spear: 2800, staff: 3000, fists: 4000, chakram: 4200, bow: 4400, monowire: 4600, cryo: 4800,
    beamsaber: 5000, thunder: 5200, monarch: 5500, nodachi: 7000, phoenix: 7500, zerocut: 8000, drill: 8500, cleaver: 9000, dominator: 9500, glaive: 13000 },
  s: { crimson: 600, solar: 800, void: 1000, venom: 1200, ronin: 1400, goo: 2000, neko: 2200, wolf: 2400, oni: 2600, viking: 2800, kitsune: 3000, knight: 3200, tengu: 3400, mecha: 4000, skull: 4300,
    yurei: 4600, retro: 4800, rider: 5000, ryu: 5200, netrunner: 5400, blaze: 5600, witch: 5800, eva: 7000, shinobi2: 7500, idol: 8000, chromesam: 8500, sung: 9000, exo: 9500, ashura: 13000 },
  f: { sakura: 700, inferno: 900, glacier: 900, bone: 1200, obsidian: 2000, chainsaw: 2200, toxic: 2200, circuit: 2400, jade: 2600, plasma: 2800, holo: 3000, bloodmoon: 4000, prism: 4500, solar: 4500,
    stardust: 5000, shadowflame: 7500, aurora2: 8000 },
  p: { kaya: 1200, raven: 2000, owl: 2200, buchi: 2400, tiger: 2800, shark: 3200, turtle: 4000, scarab: 4400, drake: 4800, saucer: 5200, komainu: 5600, nano: 7500, fox: 8000, k9: 8500, phoenix: 9500 }
};
for (const w of WEAPONS) if (NEW_PRICES.w[w.id] != null) w.cost = NEW_PRICES.w[w.id];
for (const s of SKINS) if (NEW_PRICES.s[s.id] != null) s.cost = NEW_PRICES.s[s.id];
for (const f of BLADE_FX) if (NEW_PRICES.f[f.id] != null) f.cost = NEW_PRICES.f[f.id];
for (const p of PETS) if (NEW_PRICES.p[p.id] != null) p.cost = NEW_PRICES.p[p.id];
const TIER_FIXED = { // items you win rather than buy
  muramasa: 5, deus: 5, firstblade: 5, starframe: 5, exframe: 5, voidoni: 5, voidlich: 4, ascendant: 4, primegold: 4, nullren: 4, seraph: 4, raijin: 4, twin: 4, abyssal: 4, skybreak: 4, cursed: 3, tide: 3, monk: 3, gold: 3, lanternoni: 4,
  pumpking: 3, yeti: 3, exedge: 4, origin: 5, voidr: 4, glitch: 3, dragon: 4, candycorn: 3, frostbite: 3, batling: 3, penguin: 3
};
function tierFromCost(c) { return c <= 0 ? 0 : c < 1500 ? 1 : c < 3500 ? 2 : c < 6000 ? 3 : c < 11000 ? 4 : 5; }
function itemTier(kind, id) {
  const L = kind === 'w' ? WEAPONS : kind === 's' ? SKINS : kind === 'f' ? BLADE_FX : PETS, it = L.find(q => q.id === id); if (!it) return 0;
  if (it.cost < 0 || it.ev) { if (TIER_FIXED[id] != null) return TIER_FIXED[id]; return /^season/.test(id) ? 2 : 3; }
  return it.tier != null ? it.tier : tierFromCost(it.cost);
}
function tierBonusText(kind, id) {
  const t = itemTier(kind, id); if (!t) return lt('No bonus');
  if (kind === 'w') return ltf('+{0}% damage', Math.round((T_WPOW[t] - 1) * 100));
  if (kind === 's') return ltf('+{0}% damage · +{1}% Overdrive charge', Math.round(T_SKIN[t][0] * 100), Math.round(T_SKIN[t][1] * 100));
  if (kind === 'f') return ltf('+{0}% critical chance', (T_FX[t] * 100).toFixed(1).replace(/\.0$/, ''));
  return ltf('Tricks {0}% stronger and {1}% more often', Math.round((T_PET[t][0] - 1) * 100), Math.round((1 / T_PET[t][1] - 1) * 100));
}
/* ---------------- power in the run (from version 25 on) ---------------- */
{
  const lo0 = applyLoadout;
  applyLoadout = function () {
    lo0();
    G.tierOn = simV(25) ? 1 : 0; G.petPow = 1; G.petCd = 1;
    if (!G.tierOn || G.mode === 'puzzle') return;
    const d = Store.data, H = REPLAY.on ? REPLAY.hdr : null, sk = H ? H.sk : d.skin, bf = H ? H.bf : d.blade;
    const st = itemTier('s', sk), ft = itemTier('f', bf), pt = G.pet && G.pet !== 'none' ? itemTier('p', G.pet) : 0;
    P.dmgMul *= T_WPOW[itemTier('w', P.w.id)] * (1 + T_SKIN[st][0]); P.odMul *= 1 + T_SKIN[st][1]; P.critAdd += T_FX[ft];
    G.petPow = T_PET[pt][0]; G.petCd = T_PET[pt][1];
  };
  const sw0 = swapWeapon;
  swapWeapon = function () { const w0 = P.w; const r = sw0.apply(this, arguments); if (G.tierOn && P.w !== w0) P.dmgMul *= T_WPOW[itemTier('w', P.w.id)] / T_WPOW[itemTier('w', w0.id)]; return r; };
  const pp0 = Pet.period.bind(Pet); Pet.period = function () { return pp0() * (G.tierOn ? G.petCd || 1 : 1); };
}
/* ---------------- the Arsenal shows tiers, sorts by them, and says what they give ---------------- */
{
  const KIND = { blades: 'w', heroes: 's', fx: 'f', pets: 'p' };
  const si0 = UI.shopItems.bind(UI);
  UI.shopItems = function (tab) {
    const out = si0(tab), k = KIND[tab]; if (!k) return out;
    for (const it of out) { it.tier = it.id === 'none' ? -1 : itemTier(k, it.id); }
    const first = out.filter(it => it.id === 'none'), rest = out.filter(it => it.id !== 'none');
    rest.sort((a, b) => (a.tier - b.tier) || ((a.price < 0 ? 1e9 : a.price) - (b.price < 0 ? 1e9 : b.price)));
    return first.concat(rest);
  };
  const ra0 = UI.renderArsenal.bind(UI);
  UI.renderArsenal = function () {
    ra0(); const tab = SHOP_TABS[this.asTab].id, k = KIND[tab]; if (!k) return;
    const items = this.shopItems(tab), btns = document.querySelectorAll('#asList button.item');
    btns.forEach((b, i) => { const it = items[i]; if (!it || it.tier < 0) return; const T = TIERS[it.tier]; const c = el('span', 'tierchip', lt(T.n)); c.style.setProperty('--tc', T.c); b.appendChild(c); b.style.setProperty('--tc', T.c); b.classList.add('tiered'); });
  };
  const rs0 = UI.renderShopInfo.bind(UI);
  UI.renderShopInfo = function (it) {
    rs0(it); if (!it) return; const k = KIND[it.tab]; if (!k || it.id === 'none') return;
    const t = itemTier(k, it.id), T = TIERS[t], pd = $('asPd'); if (!pd) return;
    const row = el('div', 'tierline'); const c = el('span', 'tierchip', lt(T.n)); c.style.setProperty('--tc', T.c); row.appendChild(c); row.appendChild(el('span', '', tierBonusText(k, it.id)));
    pd.prepend(row);
  };
}
