/* =====================================================================
   WAR SOUNDTRACK (version 38, Settings > SOUND > SOUNDTRACK: WAR / CLASSIC).
   Runs play SIEGE PROTOCOL, STEEL RAIN or FRONTLINE (by area), bosses play
   TOTAL WAR with an air-raid siren as they arrive; distant explosions roll
   across the city during a run, and every kill lands with a low thump.
   The Music Room still lets you pick any single track. Sound only.
   ===================================================================== */
const War = {
  on() { const s = Store.data && Store.data.settings; return !!s && s.sndtrk !== 'classic'; },
  auto() { const t = Store.data.settings.track; return !t || t === 'auto'; },
  run() { const L = ['war1', 'war2', 'war3'], th = BG.theme || 'maglev'; let h = 0; for (const ch of th + (G.mode || '')) h = (h * 31 + ch.charCodeAt(0)) | 0; return L[Math.abs(h) % 3]; },
  boomT: 9, boss0: '',
  siren(t) { const A = Aud; if (!A.c || A.quiet) return; for (let k = 0; k < 2; k++) { const t0 = t + k * 1.7; A.tone(520, 880, .85, .03, 'sawtooth', t0); A.tone(880, 520, .85, .03, 'sawtooth', t0 + .85); } },
  tick(rd) {
    const A = Aud; if (!this.on() || !A.c || A.c.state !== 'running' || A.quiet || G.state !== 'PLAY' || REPLAY.fast) return;
    this.boomT -= rd; if (this.boomT <= 0) { this.boomT = 12 + Math.random() * 16; const t = A.c.currentTime + .05; A.noise(1.6, .07, 220, 40, 'lowpass', t); A.tone(46, 26, 1.5, .07, 'sine', t); }
    const b = Boss.cur, id = b && b.dying <= 0 ? b.id + (b.lvl || '') : ''; if (id && id !== this.boss0) this.siren(A.c.currentTime + .1); this.boss0 = id;
  }
};
{ const rp0 = runTrackPick; runTrackPick = function () { if (G.mode !== 'dojo' && War.on() && War.auto()) return War.run(); return rp0(); };
  const mu0 = Aud.music.bind(Aud); Aud.music = function (id, boss) { if (boss && War.on() && War.auto()) return mu0('warboss', false); return mu0(id, boss); };
  const ed1 = EAnim.death.bind(EAnim); EAnim.death = function (e, a) { ed1(e, a); try { if (War.on() && Aud.c && !Aud.quiet && !(REPLAY.on && REPLAY.fast)) Aud.tone(78, 34, .14, .085, 'sine'); } catch (er) { errLog(er); } };
  const pt1 = PC.tick.bind(PC); PC.tick = function (rd) { pt1(rd); War.tick(rd); };
  const ps3 = PC.settings.bind(PC); PC.settings = function (head, cycle, box, s) {
    head('SOUND'); cycle('Soundtrack', 'sndtrk', ['war', 'classic'], ['WAR', 'CLASSIC'], () => { if (inRun()) { G.runTrack = runTrackPick(); Aud.music('run', !!Boss.cur); } });
    ps3(head, cycle, box, s); }; }