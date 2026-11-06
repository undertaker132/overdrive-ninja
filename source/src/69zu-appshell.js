/* =====================================================================
   APP SHELL — hooks for the Android app built by .github/workflows/android.yml
   (Capacitor). The phone's back button calls window.odBack():
     in a run         → pause
     on the pause menu → resume
     dialogue / comic → next line / skip the page
     any other screen → that screen's own BACK (or MENU) button
     the title screen → false: the app goes to the background
   Returns true when the game used the press. Works the same in a browser,
   where nothing calls it.
   ===================================================================== */
window.odBack = function () {
  try {
    if (REPLAY.on) { UI.replayExit(); return true; }
    if (Photo.on) { Photo.close(); return true; }
    if (G.state === 'DIALOG' && typeof Dlg !== 'undefined' && Dlg.active) { Dlg.next(); return true; }
    if (UI.cur === 'comic' && typeof Comic !== 'undefined') { Comic.end(); return true; }
    if (G.state === 'PLAY') { Flow.togglePause(); return true; }
    if (G.state === 'PAUSE' && UI.cur === 'pause') { Flow.togglePause(); return true; }
    if (G.state === 'ROUTE' || G.state === 'PERK') return true; // a choice is waiting: the press does nothing
    const cur = UI.cur; if (!cur || cur === 'title' || cur === 'boot') return false;
    const sc = document.getElementById('s-' + cur);
    if (sc) { // the screen's own way out, exactly as if it were tapped
      const b = sc.querySelector('[data-back]:not([disabled])') || sc.querySelector('#rsMenu') || [...sc.querySelectorAll('button.ghost')].find(x => /Back$/.test(x.id) || x.textContent.trim() === lt('BACK'));
      if (b && b.offsetParent !== null) { b.click(); return true; }
    }
    Aud.sfx('back'); UI.back(); return true;
  } catch (e) { errLog(e); return false; }
};
window.odApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); // running inside the app
