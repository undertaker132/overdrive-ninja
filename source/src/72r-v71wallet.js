/* =====================================================================
   VERSION 71: THE WALLET — every currency in one place
   Tap your credits (the gold chip at the top of the home screen, the
   Arsenal and the Hideout) and a card opens with everything you hold:
   credits, crates, cores, prisms, shards and your season tier, each with
   one line on where it comes from and what it is for, and buttons
   straight to the crates and the season. Display only.
   ===================================================================== */
const Wallet = {
  open() {
    document.querySelectorAll('.wal71').forEach(x => x.remove());
    const d = Store.data, b = Crates.bag(); let tier = 0; try { tier = Season.tier(); } catch (e) { errLog(e); }
    const ov = el('div', 'wal71'), card = el('div', 'panel wal71-card'); ov.appendChild(card);
    card.appendChild(el('div', 'eyebrow', lt('YOUR WALLET')));
    const rows = [
      ['◎', fmtNum(d.credits) + ' CR', lt('Earned in every run and stage, from bounties and achievements. Spent on weapons, heroes, upgrades and crates.'), '#ffd23f'],
      ['▣', ltf('{0} CRATES', b.crates | 0), lt('Earned with stage stars, the season and your journey. Open them on the CRATES screen.'), '#7df9ff'],
      ['◆', ltf('{0} CORES', b.cores | 0), lt('Drop from stages and runs. Used to evolve blades and heroes.'), '#00ff88'],
      ['◈', ltf('{0} PRISMS', b.prisms | 0), lt('Rare. Drop from stages, legends and big crates.'), '#c45bff'],
      ['✦', ltf('{0} SHARDS', b.shards | 0), lt('From legendary and mythic crates. Spend them in the forge.'), '#ff9a3d'],
      ['★', ltf('SEASON TIER {0} / {1}', tier, SEASON_TIERS), lt('Every run earns season XP. Tiers pay credits and season-only rewards.'), '#ff2bd6']
    ];
    for (const [k, n, dsc, c] of rows) { const r = el('div', 'wal71-row'), ic = el('b', '', k); ic.style.color = c; r.appendChild(ic); const tx = el('span', 'col'); tx.style.gap = '0'; const nm = el('span', 'wal71-n', n); nm.style.color = c; tx.appendChild(nm); tx.appendChild(el('span', 'small mute', dsc)); r.appendChild(tx); card.appendChild(r); }
    const bar = el('div', 'row'); bar.style.gap = '8px'; bar.style.marginTop = '10px';
    const go = (label, fn) => { const x = el('button', 'btn', lt(label)); x.onclick = () => { Aud.sfx('ui'); ov.remove(); fn(); }; bar.appendChild(x); };
    go('CRATES', () => Crates.screen()); go('SEASON', () => UI.openSeason());
    const cl = el('button', 'btn ghost', lt('BACK')); cl.onclick = () => { Aud.sfx('back'); ov.remove(); }; bar.appendChild(cl); card.appendChild(bar);
    ov.onclick = e => { if (e.target === ov) ov.remove(); };
    document.body.appendChild(ov); Aud.sfx('ui'); try { cl.focus(); } catch (e) { }
  }
};
{
  for (const id of ['tCredits', 'asCredits', 'hdCredits']) { const c = $(id); if (!c) continue; c.style.cursor = 'pointer'; c.setAttribute('role', 'button'); c.tabIndex = 0; c.title = lt('YOUR WALLET');
    c.addEventListener('click', () => Wallet.open()); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Wallet.open(); } }); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.wal71').forEach(x => x.remove()); });
  const css = document.createElement('style'); css.id = 'v71css';
  css.textContent = `.wal71 { position: fixed; inset: 0; z-index: 60; background: rgba(3, 4, 12, .72); display: flex; align-items: center; justify-content: center; padding: 16px; animation: wal71 .18s ease-out; }
.wal71-card { background: #0a0f24 !important; width: min(100%, 420px); max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.wal71-row { display: flex; gap: 12px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, .06); }
.wal71-row b { font-size: 22px; line-height: 1; width: 26px; text-align: center; flex: none; } .wal71-n { font-weight: 700; letter-spacing: .04em; }
@keyframes wal71 { from { opacity: 0; } } @media (prefers-reduced-motion: reduce) { .wal71 { animation: none; } }`;
  document.head.appendChild(css);
}
