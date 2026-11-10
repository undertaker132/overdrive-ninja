/* =====================================================================
   VERSION 66: YOUR HERO ON THE RESULTS SCREEN
   After a run your own 3D hero stands at the top of the results: it raises
   the blade when you cleared the stage, staggers when you fell, and a tap
   plays a cut. Same studio light as the Hero Forge. Display only.
   ===================================================================== */
{
  // the 3D hero can live on any screen that hosts it (home, Hero Forge, results)
  Mini.loop = function () { if (this.raf) return;
    const f = now => { const vis = UI.cur === this.host; if (!vis || !this.cv.isConnected) { this.raf = 0; return; }
      this.raf = requestAnimationFrame(f); if (now - this.last < 33) return; const rd = Math.min(.05, (now - (this.last || now)) / 1000); this.last = now; this.t += rd; try { this.frame(rd); } catch (e) { errLog(e); this.dead = 1; this.raf = 0; } };
    this.raf = requestAnimationFrame(f); };
  const or0 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    const r = or0(o);
    try { if (!Mini.ok()) return r; const scr = $('s-result'); if (!scr) return r; let box = scr.querySelector('.res3d');
      if (!box) { box = el('div', 'res3d'); const ph = document.createElement('canvas'); ph.className = 'res3d-ph'; box.appendChild(ph); const t = $('rsTitle'); t.parentNode.insertBefore(box, t.nextSibling); }
      const won = G.state === 'CLEAR' || !!(o && o.stars && o.stars.some(Boolean)); Mini.mount('result', box.querySelector('.res3d-ph'));
      setTimeout(() => { try { if (Mini.g && Mini.g.human) Moves.start(Mini.g, won ? 'win' : 'flinch'); } catch (e) { errLog(e); } }, 250);
    } catch (e) { errLog(e); }
    return r;
  };
  // keep the raised blade on the results (the pose holds while the screen is up)
  const fr6 = Mini.frame.bind(Mini);
  Mini.frame = function (rd) { if (this.host === 'result' && this.g && this.g.mv && this.g.mv.k === 'win') this.g.mv.t = Math.min(this.g.mv.t, .9); return fr6(rd); };
  const css = document.createElement('style'); css.id = 'v66css';
  css.textContent = `.res3d { display: flex; justify-content: center; margin: -4px 0 4px; } .res3d canvas.mini3d { width: min(100%, 320px); height: 190px; border-radius: 6px; }`;
  document.head.appendChild(css);
}
