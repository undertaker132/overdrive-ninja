/* =====================================================================
   PIPE — the frame's drawing stages in one place.
   Modules register a hook in a phase instead of wrapping render():
     pre  — before the core draw (return false to keep the last picture)
     post — after the core draw (overlays, post effects, sound beds)
   Hooks run in their order number; each one is isolated: an error is
   logged (Settings > DEVICE CHECK) and a hook that keeps failing is
   switched off for the session, so one broken effect cannot stop the game.
   Pipe.list() shows the stages (also on the device check screen).
   ===================================================================== */
const Pipe = {
  pre: [], post: [],
  on(phase, name, fn, order) { const L = this[phase]; const i = L.findIndex(h => h.name === name); if (i >= 0) L.splice(i, 1); L.push({ name, fn, order: order || 0, err: 0, off: false }); L.sort((a, b) => a.order - b.order); },
  run(L, rd) { for (const h of L) { if (h.off) continue; try { if (h.fn(rd) === false) return false; if (h.err) h.err = Math.max(0, h.err - .02); } catch (e) { errLog(e); if (++h.err > 20) { h.off = true; errLog(new Error('stage switched off: ' + h.name)); } } } return true; },
  list() { return ['pre: ' + this.pre.map(h => h.order + ' ' + h.name + (h.off ? ' (off)' : '')).join(', '), 'post: ' + this.post.map(h => h.order + ' ' + h.name + (h.off ? ' (off)' : '')).join(', ')]; }
};
{ const core = render; render = function (rd) { if (!Pipe.run(Pipe.pre, rd)) return; core(rd); Pipe.run(Pipe.post, rd); }; }
