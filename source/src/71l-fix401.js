/* =====================================================================
   NO SIDEWAYS SHIFT (version 40.1): if the page ever ends up scrolled
   sideways (an older browser without overflow: clip), put it back.
   ===================================================================== */
{ const fix = () => { try { if (window.scrollX) window.scrollTo(0, window.scrollY); const de = document.documentElement, b = document.body; if (de.scrollLeft) de.scrollLeft = 0; if (b.scrollLeft) b.scrollLeft = 0;
    document.querySelectorAll('#ov > .scr:not(.hidden)').forEach(s => { if (s.scrollLeft) s.scrollLeft = 0; }); } catch (e) { errLog(e); } };
  window.addEventListener('scroll', fix, { passive: true }); window.addEventListener('resize', fix);
  document.addEventListener('scroll', e => { const t = e.target; if (t && t.scrollLeft && t.classList && t.classList.contains('scr')) t.scrollLeft = 0; }, { capture: true, passive: true });
  const sh1 = UI.show.bind(UI); UI.show = function (id) { sh1(id); fix(); };
}
