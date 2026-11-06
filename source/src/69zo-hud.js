/* =====================================================================
   CLEAN HUD (settings: HUD CLEAN / FULL) — less text on screen in a run.
   - one message in the middle at a time: toasts wait while a callout or a
     multi-kill call is showing; DOUBLE / TRIPLE calls are dropped
   - tips: each one once, only in the first runs, never during a boss fight
   - damage numbers: only critical and big hits; hits on the same spot add
     up into one number; at most a few numbers at once
   - radio chatter: less often, and quiet in boss fights and big fights
   - HUD labels: HEAT / OVERDRIVE labels only when they say something new
     (blade hot, overheated, ready, active); no +CR during the run; skill
     buttons show the icon and the timer without the name
   All of it is drawing only: the simulation and replays do not change.
   ===================================================================== */
const HUDC = () => { const s = Store.data && Store.data.settings; return !s || s.hud !== 'full'; };
const CleanHud = {
  q: [], lastCall: null,
  busy() { return G.msgT > .25 || CALL.l > .15 || !!(Juice.call && Juice.call.t < .9); },
  tick() { if (!HUDC() || !this.q.length || this.busy() || G.state !== 'PLAY') return; const m = this.q.shift(); this.show(m[0], m[1]); },
  show(m, c) { G.msg = m; G.msgT = 1.7; G.msgC = c || '#ffd700'; },
  enemiesOn() { let n = 0; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.y > 0 && e.y < V.VH) n++; } return n; },
  runsDone() { const s = Store.data && Store.data.stats; return s ? (s.runs | 0) : 0; },
  sync() { document.body.classList.toggle('hudclean', HUDC()); }
};
{
  // one message at a time
  const t0 = toast; toast = function (m, c) { if (!HUDC()) return t0(m, c); if (CleanHud.busy()) { if (!CleanHud.q.some(q => q[0] === m) && G.msg !== m) { CleanHud.q.push([m, c]); if (CleanHud.q.length > 2) CleanHud.q.shift(); } return; } CleanHud.show(m, c); };
  // multi-kill calls: from QUAD up, and not over another callout
  const jw0 = Juice.watch.bind(Juice); Juice.watch = function (rd) { const c0 = this.call; jw0(rd); const c = this.call; if (c && c !== c0 && HUDC() && (c.n < 4 || (CALL.l > .3 && CALL.p >= 2))) this.call = c0 && c0.t < 1.2 ? c0 : null; CleanHud.tick(); };
  // tips: once each, in the first runs, not in boss fights
  const h0 = hint; hint = function (id, text) { if (HUDC() && (Boss.cur || (Store.data.seen[id] | 0) >= 1 || CleanHud.runsDone() >= 12)) return; h0(id, text); };
  // damage numbers: crits and big hits only, merged, capped
  const dn0 = dmgNum; dmgNum = function (x, y, n, crit, big) {
    if (!HUDC()) return dn0(x, y, n, crit, big);
    const m = Store.data.settings.nums; if (m === 'off') return; if (!crit && !big) return;
    for (let i = 0; i < TX.n; i++) { const o = TX.a[i]; if (o.alive && o.num && o.l > .55 && Math.abs(o.x - x) < 34 && Math.abs(o.y - y) < 34) { o.num += n; o.t = o.num + '!'; o.ltr = true; o.l = 1; o.sz = Math.min(30, o.sz + 1.5); o.f = '900 ' + o.sz + 'px ' + FONT_D; return; } }
    let live = 0; for (let i = 0; i < TX.n; i++) if (TX.a[i].alive && TX.a[i].num) live++; if (live >= (Boss.cur ? 3 : 5) && !big) return; // (fewer in boss fights: every hit there is a big one)
    const k = TX.n; dn0(x, y, n, crit, big); if (TX.n > k) TX.a[TX.n - 1].num = n;
  };
  const tg0 = TX.get.bind(TX); TX.get = function () { const o = tg0(); if (o) o.num = 0; return o; };
  // radio chatter: calmer
  const cs0 = Comms.say.bind(Comms); Comms.say = function (key, force) { if (HUDC() && !force) { if (this.cd > 0 || (this.used[key] | 0) >= 1 || Boss.cur || CleanHud.enemiesOn() >= 4) return; } cs0(key, force); if (HUDC() && !force && this.cur) this.cd = Math.max(this.cd, 12); };
  const cr0 = Comms.reset.bind(Comms); Comms.reset = function () { cr0(); CleanHud.q.length = 0; };
}
{ // CLEAN HUD 2 (version 33): even less text on the roof. Drawing only, replays look the same.
  const NUMLIKE = /^[\d\s,.+x×!%-]+$/i; // damage, credits, multipliers: these stay
  const inPlay = () => HUDC() && G.state === 'PLAY' && !REPLAY.on;
  // small side callouts (priority 1) are dropped: what they say is already on screen
  const fc0 = FX.call; FX.call = function (t, c, p, sz) { if (inPlay() && (p || 1) < 2) return; return fc0.call(this, t, c, p, sz); };
  // word labels over the action: one at a time, a bit smaller; ON BEAT only from x3 up
  const ft0 = FX.text; FX.text = function (x, y, t, c, sz, pop, key) {
    if (!inPlay() || t == null) return ft0.call(this, x, y, t, c, sz, pop, key);
    const s = String(t);
    if (NUMLIKE.test(s)) return ft0.call(this, x, y, t, c, sz, pop, key);
    if (key === 'beat' && !/x[34]/.test(s)) return;
    for (let i = 0; i < TX.n; i++) { const o = TX.a[i]; if (o.alive && o.word && o.l > .12) o.l = .12; }
    const k = TX.n; ft0.call(this, x, y, t, c, Math.round((sz || 16) * .88), pop, key);
    if (TX.n > k) TX.a[TX.n - 1].word = 1;
  };
  const tg1 = TX.get.bind(TX); TX.get = function () { const o = tg1(); if (o) o.word = 0; return o; };
}
{ const au0 = applyUiSettings; applyUiSettings = function () { au0.apply(this, arguments); try { CleanHud.sync(); } catch (e) { errLog(e); } }; }
