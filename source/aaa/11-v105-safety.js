
/* --- MODULE 11: v105.0 SAFETY NET — a bad number in a drawing call no longer stops an animation --- */
(function () {
  'use strict';
  // canvas arc / ellipse throw on a negative radius, and the throw ends the requestAnimationFrame loop that made it
  // (a frozen crate film, a stuck title effect). A negative radius is drawn as nothing instead.
  try {
    const C = CanvasRenderingContext2D.prototype, a0 = C.arc, e0 = C.ellipse;
    C.arc = function (x, y, r, s, e, ccw) { return a0.call(this, x, y, r > 0 ? r : 0, s, e, ccw); };
    if (e0) C.ellipse = function (x, y, rx, ry, rot, s, e, ccw) { return e0.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, rot, s, e, ccw); };
    const g0 = C.createRadialGradient;
    C.createRadialGradient = function (x0, y0, r0, x1, y1, r1) { return g0.call(this, x0, y0, r0 > 0 ? r0 : 0, x1, y1, r1 > 0 ? r1 : 0); };
  } catch (e) { }

  // the crate film is a full-screen layer: going to the title screen or into a run ends it (the reward is already granted)
  const closeCrate = () => { try { if (window.__crate98Close) window.__crate98Close(); } catch (e) { errLog(e); } };
  const db105 = Director.begin.bind(Director);
  Director.begin = function () { closeCrate(); return db105.apply(this, arguments); };
  const ot105 = UI.openTitle.bind(UI);
  UI.openTitle = function () { closeCrate(); return ot105.apply(this, arguments); };

  // the in-run hero perk chip stayed on the results screen (its updater runs only during play)
  Sim98.menu.push(() => { const a = document.getElementById('arch97-badge'); if (a && a.style.display !== 'none') a.style.display = 'none'; });
})();
