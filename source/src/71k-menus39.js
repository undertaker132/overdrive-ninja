/* MENUS 39: a sticky header with a back button on every screen that has one */
{ const BACK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const NAMES = { me: 'PROFILE', season: 'SEASON' };
  const wrap = sec => {
    if (!sec || sec.classList.contains('center')) return; const col = sec.querySelector(':scope > .col'); if (!col || col.querySelector(':scope > .hdr')) return;
    const back = col.querySelector(':scope > [data-back]') || [...col.querySelectorAll(':scope > button.btn.ghost')].reverse().find(x => x.id === 'lgBack' || x.textContent.trim() === lt('BACK')); if (!back) return;
    let title = col.querySelector(':scope > .topbar, :scope > h2'); const nm = NAMES[(sec.id || '').slice(2)];
    if (!title && nm) { title = document.createElement('h2'); title.textContent = lt(nm); title.dataset.lt39 = nm; col.insertBefore(title, col.firstChild); } if (!title) return;
    const hdr = document.createElement('div'); hdr.className = 'hdr';
    const hb = document.createElement('button'); hb.className = 'hback'; hb.type = 'button'; hb.innerHTML = BACK_SVG; hb.setAttribute('aria-label', lt('BACK')); hb.addEventListener('click', () => back.click());
    hdr.appendChild(hb); col.insertBefore(hdr, title); hdr.appendChild(title); back.classList.add('hdr-dup'); sec.classList.add('has-hdr');
  };
  document.querySelectorAll('#ov > .scr').forEach(wrap);
  const sh0 = UI.show.bind(UI); UI.show = function (id) { sh0(id); if (id) { const sc = () => { try { wrap(document.getElementById('s-' + id)); } catch (e) { errLog(e); } }; sc(); requestAnimationFrame(sc); } };
  const re0 = UI.renderEvent.bind(UI); UI.renderEvent = function () { re0(); try { wrap(document.getElementById('s-event')); } catch (e) { errLog(e); } };
  const relabel = () => { document.querySelectorAll('.hback').forEach(b => b.setAttribute('aria-label', lt('BACK'))); document.querySelectorAll('[data-lt39]').forEach(h => { h.textContent = lt(h.dataset.lt39); }); };
  const al0 = applyLang; applyLang = function () { const r = al0.apply(this, arguments); try { relabel(); } catch (e) { } return r; }; try { relabel(); } catch (e) { }
}
/* test + automation hooks (used by the headless test suite) */
window.__OD = { G, P, V, EN, BU, Boss, Director, Flow, UI, Store, STAGES, sim, step, startStory: i => Flow.startStory(i), startArcade: m => Flow.startArcade(m), Dlg, Arena, REC, REPLAY, TICK, R, In, Replays, DMATH };
try {
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
} catch (e) { start({}); }
