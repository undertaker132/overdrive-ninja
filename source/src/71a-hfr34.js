/* =====================================================================
   HIGH REFRESH (version 34) — the simulation stays a fixed 60 Hz (replays and
   leaderboards do not change), and the screen draws every refresh up to 480 Hz:
   · Smooth: each moving thing is drawn between where it was before the last
     step and where it is now, so 120 / 144 / 240 / 360 / 480 Hz screens get
     really smooth motion (AUTO turns it on above 75 frames a second)
   · FrameCap: an optional frame-rate limit
   Drawing only: positions are put back right after the frame is drawn.
   ===================================================================== */
const Smooth = {
  list: [], vals: [], a: 1, act: false,
  want() { const m = (Store.data && Store.data.settings.smooth) || 'auto'; if (m === 'off') return false; if (m === 'on') return true; return Q.fps > 75; },
  snap() {
    if (G.state !== 'PLAY') return;
    P._px = P.x; P._py = P.y; P._pv = 1;
    const pools = this.pools || (this.pools = [EN, BU, PB, CO, PU, ECHO]);
    for (const pool of pools) for (let i = 0; i < pool.n; i++) { const o = pool.a[i]; o._px = o.x; o._py = o.y; o._pg = o.gen; }
    const b = Boss.cur; if (b) { b._px = b.x; b._py = b.y; b._pb = 1; if (b.parts) for (const p of b.parts) { p._px = p.x; p._py = p.y; p._pb = 1; } }
    if (typeof Pet !== 'undefined') { Pet._px = Pet.x; Pet._py = Pet.y; }
  },
  lerp1(o, a) { if (o._px == null) return; const dx = o.x - o._px, dy = o.y - o._py; if (!(dx * dx + dy * dy < 8100) || (dx === 0 && dy === 0)) return; this.list.push(o); this.vals.push(o.x, o.y); o.x = o._px + dx * a; o.y = o._py + dy * a; },
  render(rd) {
    this.act = G.state === 'PLAY' && !(REPLAY.on && (REPLAY.fast || REPLAY.paused)) && !G.photo && (this.want() || (REPLAY.on && REPLAY.speed < 1));
    if (!this.act) { render(rd); return; }
    const a = this.a = clamp((REPLAY.on ? REPLAY.acc : acc) / CFG.step, 0, 1);
    this.list.length = 0; this.vals.length = 0;
    try {
      if (P._pv) this.lerp1(P, a);
      for (const pool of this.pools || []) for (let i = 0; i < pool.n; i++) { const o = pool.a[i]; if (o.alive && o._pg === o.gen) this.lerp1(o, a); }
      const b = Boss.cur; if (b && b._pb) { this.lerp1(b, a); if (b.parts) for (const p of b.parts) if (p._pb) this.lerp1(p, a); }
      if (typeof Pet !== 'undefined' && Pet._px != null) this.lerp1(Pet, a);
      render(rd);
    } finally { for (let i = this.list.length - 1; i >= 0; i--) { const o = this.list[i]; o.x = this.vals[i * 2]; o.y = this.vals[i * 2 + 1]; } this.list.length = 0; }
  }
};
const FrameCap = {
  last: 0,
  skip(t) {
    const cap = +(Store.data && Store.data.settings.fpsCap) || 0; if (!cap) return false;
    const min = 1000 / cap; if (t - this.last < min - .75) return true;
    this.last = t - this.last > min * 2 ? t : this.last + min; return false;
  }
};
