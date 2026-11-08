/* =====================================================================
   VERSION 46: THE GUIDE
   · the newer systems open step by step for new players, like the rest of
     the home screen: CRATES after stage 2, the RANK strip after stage 3,
     the HERO FORGE after stage 5 (players who already played keep
     everything open)
   · the first time each system is there, a spotlight shows it: the screen
     dims around it, one short line says what it is, SHOW ME opens it.
     One spotlight per visit to the home screen, never during a reward
     card, each one shown once per profile.
   ===================================================================== */
GATES.push({ id: 'crates', el: 'bCrates', need: 2, n: 'CRATES' }, { id: 'journey', el: 'tRank', need: 3 }, { id: 'forge', el: 'bForge', need: 5, n: 'HERO FORGE' });
const GUIDE = [
  { id: 'journey', el: 'tRank', t: 'YOUR RANK', d: 'Everything you do raises your rank. Tap it to see your journey and your next goals.', go: () => Journey.open(false) },
  { id: 'crates', el: 'bCrates', t: 'CRATES', d: 'Open crates for blades, heroes and pets you do not own yet. Some are waiting for you.', go: () => Crates.screen() },
  { id: 'today', el: 'tToday', t: 'TODAY', d: 'Daily rewards, events, missions and the boss of the week live here. It opens by itself when a reward is waiting.' },
  { id: 'forge', el: 'bForge', t: 'HERO FORGE', d: 'Build your own fighter and weapon, then play HERO TRIALS and the WORLD BOSS.', go: () => Hero.screen() },
  { id: 'evo', el: 'bArsenal', t: 'EVOLUTION', d: 'You have enough materials to evolve a blade or hero. Open the Arsenal and pick it.', when: () => Guide.canEvolve(), go: () => UI.openArsenal() },
  { id: 'wboss', el: 'bForge', t: 'WORLD BOSS', d: 'The World Boss is open until Sunday. Fight it with your own hero for rare drops.', when: () => WBoss.open() && Gate.open('forge'), go: () => Hero.screen() }
];
const Guide = {
  seen() { const d = Store.data; if (!d.guide || typeof d.guide !== 'object') d.guide = {}; return d.guide; },
  canEvolve() { try { const d = Store.data; for (const id in d.owned) if (d.owned[id] && Evo.can('w', id)) return true; for (const id in d.skins) if (d.skins[id] && Evo.can('s', id)) return true; } catch (e) { errLog(e); } return false; },
  next() {
    const s = this.seen();
    for (const g of GUIDE) { if (s[g.id]) continue; const e = $(g.el); if (!e || e.classList.contains('hidden') || !e.offsetParent) continue; if (g.when && !g.when()) continue; return g; }
    return null;
  },
  show() {
    if (UI.cur !== 'title' || document.querySelector('.unlock39, .coach46, .cr-film') || !(Store.data.settings.tips | 0 || Store.data.settings.tips == null)) return;
    const g = this.next(); if (!g) return; const e = $(g.el); this.seen()[g.id] = 1; Store.touch();
    try { e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); } catch (er) { }
    const ov = el('div', 'coach46'), ring = el('div', 'coach-ring'), tip = el('div', 'coach-tip'); ov.appendChild(ring); ov.appendChild(tip);
    tip.appendChild(el('div', 'eyebrow', lt('NEW'))); tip.appendChild(el('h2', '', lt(g.t))); tip.appendChild(el('div', 'small', lt(g.d)));
    const row = el('div', 'row'); const later = el('button', 'btn ghost', lt('LATER')), go = el('button', 'btn pri', lt(g.go ? 'SHOW ME' : 'GOT IT'));
    const close = () => { ov.remove(); window.removeEventListener('resize', place); };
    later.onclick = () => { Aud.sfx('ui'); close(); }; go.onclick = () => { Aud.sfx('ui'); close(); if (g.go) g.go(); };
    if (g.go) row.appendChild(later); row.appendChild(go); tip.appendChild(row); document.body.appendChild(ov);
    const place = () => { const r = e.getBoundingClientRect(), pad = 8, W = innerWidth, H = innerHeight;
      Object.assign(ring.style, { left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' });
      const below = r.top + r.height / 2 < H / 2, tw = Math.min(340, W - 32); tip.style.width = tw + 'px'; tip.style.left = Math.max(16, Math.min(W - tw - 16, r.left + r.width / 2 - tw / 2)) + 'px';
      if (below) { tip.style.top = (r.bottom + 18) + 'px'; tip.style.bottom = ''; } else { tip.style.bottom = (H - r.top + 18) + 'px'; tip.style.top = ''; } };
    place(); window.addEventListener('resize', place); Aud.sfx('star');
  }
};
{
  const ot4 = UI.openTitle.bind(UI);
  UI.openTitle = function () {
    const r = ot4.apply(this, arguments);
    try { Gate.apply(); for (const id of ['bCrates', 'bForge']) { const b = $(id); if (b && !b.dataset.g46) { b.dataset.g46 = 1; b.addEventListener('click', () => { const gid = id === 'bCrates' ? 'crates' : 'forge'; if (!Store.data.uiSeen[gid]) { Store.data.uiSeen[gid] = 1; Store.touch(); b.classList.remove('new'); } }, true); } } } catch (e) { errLog(e); }
    setTimeout(() => { try { Guide.show(); } catch (e) { errLog(e); } }, 1300);
    return r;
  };
  const css = document.createElement('style'); css.id = 'v46css';
  css.textContent = `
.coach46 { position: fixed; inset: 0; z-index: 72; }
.coach-ring { position: fixed; border: 2px solid var(--gold); clip-path: none; border-radius: 10px; box-shadow: 0 0 0 9999px rgba(3, 4, 10, .74), 0 0 24px rgba(255, 215, 0, .7); animation: coachPulse 1.1s ease-in-out infinite alternate; pointer-events: none; }
.coach-tip { position: fixed; display: flex; flex-direction: column; gap: 8px; padding: 14px; background: linear-gradient(160deg, #1a1440, #0a0e26 70%); border: 1px solid var(--gold); clip-path: var(--cut); box-shadow: 0 0 30px rgba(255, 215, 0, .25); animation: cardIn .3s ease-out both; }
.coach-tip h2 { color: var(--gold); font-size: 20px; } .coach-tip .row .btn { min-height: 44px; font-size: 14px; }
@keyframes coachPulse { to { box-shadow: 0 0 0 9999px rgba(3, 4, 10, .74), 0 0 40px rgba(255, 215, 0, 1); } }
@media (prefers-reduced-motion: reduce) { .coach-ring, .coach-tip { animation: none; } }
`; document.head.appendChild(css);
}
