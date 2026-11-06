/* =====================================================================
   REPLAYS — arcade runs record every player action at tick level. With
   the deterministic math (05-dmath.js) and the seeded RNG, replaying the
   actions re-simulates the exact same run on any device. Used to watch a
   best run, to check a suspicious score, and to render highlight clips.
   TICK.n counts every step() that gets past the tutorial freeze (freeze
   and hit-stop ticks included). Actions between ticks ("pre") apply
   before the next tick; actions fired by the input buffer inside step()
   ("in-tick", flag 64) apply at the same point of step() on replay.
   Everything the run reads from the save (loadout, talents, mastery,
   tips already seen) and from the device (arena size, dock height, date)
   is stored in the header, so a replay never depends on the viewer.
   ===================================================================== */
const TICK = { n: 0 };
const REC_MODES = { tower: 1, endless: 1, bossrush: 1, arena: 1, highway: 1, timeattack: 1, mayhem: 1, daily: 1, weekly: 1 };
const RA = { SLASH: 1, DODGE: 2, CHAIN: 3, SKILL: 4, OD: 5, ZAN: 6, PERK: 7, REROLL: 8, DOWN: 9, UP: 10, CANCEL: 11, FIT: 12, ROUTE: 13, SHOP: 14, TUTOFF: 15, SWAP: 16 };
const SKILL_IDS = ['grapple', 'hijack', 'web', 'echo'];
const QA = 65536 / TAU;
function qAng(a) { let q = Math.round(a * QA) % 65536; if (q > 32767) q -= 65536; else if (q < -32768) q += 65536; return q; }
function dqAng(q) { return q / QA; }
function PERK_ALL() { if (!PERK_ALL.c) PERK_ALL.c = PERKS.map(p => p.id).concat(SYNERGIES.map(s => s.id)).concat(RELICS.map(r => r.id)); return PERK_ALL.c; } // relics go last so older recordings keep their indices
function simV(n) { return !REPLAY.on || parseFloat(REPLAY.hdr.v) >= n; } // sim rules added in version n apply to live play and to replays recorded with n or newer
function runDay() { return REPLAY.on ? REPLAY.hdr.dk : todayKey(); } // the recorded run's date, not the viewer's
function runWeek() { return REPLAY.on ? REPLAY.hdr.wk : weekKey(); }
function stateHash() { // a cheap fingerprint of the run, stored every 2 seconds to catch drift
  let h = 2166136261 >>> 0; const mix = v => { h ^= v | 0; h = Math.imul(h, 16777619) >>> 0; };
  mix(G.score); mix(G.kills); mix(P.x * 64); mix(P.y * 64); mix(P.hp); mix(EN.n); mix(BU.n); mix(R.s); mix(G.combo); mix(P.ch);
  return h >>> 0;
}
const REC = {
  on: false, depth: 0, inTick: false, ev: [], cs: [], hl: [], hdr: null, last: null,
  live() { return this.on && this.depth === 0 && !REPLAY.on; },
  header(mode) { // called right after Director.begin: everything the run depends on
    const d = Store.data, st = d.settings;
    return {
      v: VERSION, m: mode, seed: G.seed >>> 0, dk: G.dayKey, wk: G.weekKey, di: d.diff, w: d.weapon, sk: d.skin, bf: d.blade,
      upg: Object.assign({}, d.upg), tal: Object.keys(P.tal), pw: P.w.id, mx: (d.mastery[P.w.id] | 0), w2: P.w2 ? P.w2.id : '', mx2: P.w2 ? (d.mastery[P.w2.id] | 0) : 0, wt: armsTreeHdr(), evt: G.event || '',
      tut: Object.keys(d.tut).filter(k => d.tut[k]), sp: +st.speed || 1, ahp: st.ahp | 0, tips: st.tips === 0 ? 0 : 1,
      ctr: (G.contracts || []).slice(), cdx: Object.assign({}, G.cdxB || {}), ab: (G.ab || []).slice(), pt: G.pet || 'none', pl: G.petLv || 1, tw: Object.assign({}, G.twAlt || {}), tev: G.twEv || '', nem: G.nem ? Object.assign({}, G.nem) : null, evo: Object.assign({}, d.skillEvo || {}), hm: P.hmLv | 0,
      VW: V.VW, VH: V.VH, dockL: G.dockL, at: Date.now(), nm: (d.user && d.user.name) || 'PLAYER'
    };
  },
  begin(hdr) { this.on = true; this.depth = 0; this.inTick = false; this.ev = []; this.cs = []; this.hl = []; this.hdr = hdr; TICK.n = 0; this.last = null; },
  act(code, a, b) {
    if (!this.live()) return;
    const at = this.inTick ? TICK.n : TICK.n + 1, c = this.inTick ? code | 64 : code;
    this.ev.push(b === undefined ? (a === undefined ? [at, c] : [at, c, a]) : [at, c, a, b]);
  },
  mark(kind, w) { if (this.on && !REPLAY.on) this.hl.push([TICK.n, kind, w || 1]); }, // highlight moments for clips
  tick() { if (this.on && !REPLAY.on && TICK.n % 120 === 0) this.cs.push(stateHash()); },
  end() {
    if (!this.on) return this.last; this.on = false;
    const h = this.hdr; h.sc = ii(G.score); h.tk = TICK.n; h.tm = Math.round(G.time * 10) / 10; h.kl = G.kills | 0; h.mc = G.maxCombo | 0; h.rk = G.maxRk | 0; h.hl = this.hl.slice(-40);
    this.last = { hdr: h, ev: this.ev, cs: this.cs }; return this.last;
  },
  /* ---------- compact binary encoding (varints + base64) ---------- */
  encode(rep) {
    const out = []; const u = v => { v = Math.max(0, Math.floor(v)); while (v > 127) { out.push((v & 127) | 128); v = Math.floor(v / 128); } out.push(v); };
    const s = v => u(v >= 0 ? v * 2 : -v * 2 - 1);
    const f64 = v => { const b = new Uint8Array(new Float64Array([v]).buffer); for (let i = 0; i < 8; i++) out.push(b[i]); };
    u(1); u(rep.ev.length); let prev = 0;
    for (const e of rep.ev) {
      u(e[0] - prev); prev = e[0]; out.push(e[1]);
      switch (e[1] & 63) {
        case RA.SLASH: case RA.DODGE: s(e[2]); break;
        case RA.CHAIN: u(e[2].length); for (const id of e[2]) u(id); break;
        case RA.SKILL: case RA.PERK: case RA.ROUTE: case RA.SHOP: u(e[2]); break;
        case RA.ZAN: s(e[2]); s(e[3]); break;
        case RA.FIT: f64(e[2]); f64(e[3]); break;
      }
    }
    u(rep.cs.length); for (const c of rep.cs) { out.push(c & 255, (c >>> 8) & 255, (c >>> 16) & 255, (c >>> 24) & 255); }
    let str = ''; for (let i = 0; i < out.length; i += 4096) str += String.fromCharCode.apply(null, out.slice(i, i + 4096));
    return btoa(str);
  },
  decode(b64) {
    const bin = atob(b64), n = bin.length; let p = 0;
    const byte = () => { if (p >= n) throw new Error('replay: truncated'); return bin.charCodeAt(p++); };
    const u = () => { let v = 0, m = 1, c; do { c = byte(); v += (c & 127) * m; m *= 128; } while (c & 128); return v; };
    const s = () => { const v = u(); return v % 2 ? -(v + 1) / 2 : v / 2; };
    const f64 = () => { const b = new Uint8Array(8); for (let i = 0; i < 8; i++) b[i] = byte(); return new Float64Array(b.buffer)[0]; };
    if (u() !== 1) throw new Error('replay: format');
    const cnt = u(), ev = []; let at = 0;
    for (let i = 0; i < cnt; i++) {
      at += u(); const code = byte(), e = [at, code];
      switch (code & 63) {
        case RA.SLASH: case RA.DODGE: e.push(s()); break;
        case RA.CHAIN: { const k = u(), ids = []; for (let j = 0; j < k; j++) ids.push(u()); e.push(ids); break; }
        case RA.SKILL: case RA.PERK: case RA.ROUTE: case RA.SHOP: e.push(u()); break;
        case RA.ZAN: e.push(s(), s()); break;
        case RA.FIT: e.push(f64(), f64()); break;
      }
      ev.push(e);
    }
    const cc = u(), cs = []; for (let i = 0; i < cc; i++) cs.push((byte() | (byte() << 8) | (byte() << 16) | (byte() << 24)) >>> 0);
    return { ev, cs };
  }
};
/* ---------- playback ---------- */
const REPLAY = {
  on: false, hdr: null, ev: null, cs: null, i: 0, speed: 1, acc: 0, paused: false, fast: false, desync: -1, bak: null, onEnd: null,
  ox: 0, oy: 0, perkCb: null, perkOpts: null, routeCb: null, label: '', stopAt: 0, result: null, menuBG: 'maglev', seekTo: 0, onSeeked: null,
  /* opts: { fast } simulate without drawing · { label } HUD tag · { onEnd(result) } · { stopAt: tick } · { speed } */
  start(rep, opts) {
    opts = opts || {};
    if (!rep || !rep.hdr || !rep.ev) return { ok: false, why: 'empty' };
    if (SIM_COMPAT.indexOf(rep.hdr.v) < 0) return { ok: false, why: 'version' };
    if (this.on || G.state === 'PLAY' || G.state === 'PAUSE' || G.state === 'PERK') return { ok: false, why: 'busy' };
    Store.flush(true);
    this.bak = { data: Store.data, bg: BG.theme, mus: Aud.mus.id, ui: UI.cur };
    const h = rep.hdr, d = JSON.parse(JSON.stringify(Store.data));
    d.diff = h.di; d.weapon = h.w; d.skin = h.sk; d.blade = h.bf; d.upg = Object.assign({}, h.upg);
    d.mastery = {}; d.mastery[h.pw] = h.mx | 0; d.weapon2 = h.w2 || ''; if (h.w2) { d.mastery[h.w2] = h.mx2 | 0; d.owned[h.w2] = 1; } d.wtree = Object.assign({}, h.wt || {}); d.tut = {}; for (const id of (h.tut || [])) d.tut[id] = 1;
    d.settings.speed = h.sp; d.settings.ahp = h.ahp | 0; d.settings.tips = h.tips; d.chal = null; d.owned[h.w] = 1;
    d.contracts = (h.ctr || []).slice(); d.skillEvo = Object.assign({}, h.evo || {});
    Store.data = d; Store.lock = 1;
    this.on = true; this.hdr = Object.assign({}, h); this.ev = rep.ev; this.cs = rep.cs || []; this.i = 0; this.acc = 0; this.paused = false; this.desync = -1; this.result = null;
    this.seekTo = opts.from || 0; this.onSeeked = opts.onSeeked || null; // from: re-simulate silently up to that tick, then play (clips)
    this.fast = !!opts.fast || this.seekTo > 0; this.speed = opts.speed || 1; this.onEnd = opts.onEnd || null; this.label = opts.label || ''; this.stopAt = opts.stopAt || 0;
    Aud.quiet = this.fast; REC.on = false; this.perkCb = this.routeCb = null; this.perkOpts = null;
    this.fitV();
    Director.begin(h.m, null);
    G.state = 'PLAY'; G.cine = { k: 'stage', t: 0, d: 2.3 }; G.freeze = 2.3; In.cancel(); TICK.n = 0; Tut.cur = null;
    if (!opts.fast) { UI.show(null); $('dock').classList.add('hidden'); $('pauseBtn').classList.add('hidden'); UI.replayBar(true); }
    return { ok: true };
  },
  fitV() { // the arena keeps the recorded size; the screen letterboxes it
    const h = this.hdr; V.VW = h.VW; V.VH = h.VH; V.CX = V.VW / 2; V.L0 = V.CX - V.AW / 2; V.R0 = V.CX + V.AW / 2;
    if (!G.narrow) { V.L = V.L0; V.R = V.R0; }
    V.s = Math.min(V.W / V.VW, V.H / V.VH); this.ox = (V.W - V.VW * V.s) / 2; this.oy = (V.H - V.VH * V.s) / 2;
  },
  apply(e) {
    switch (e[1] & 63) {
      case RA.DOWN: In.on = true; G.aimHold = 0; break;
      case RA.UP: In.on = false; G.aimHold = 0; break;
      case RA.CANCEL: In.on = false; In.buf = 0; P.nlk = 0; break;
      case RA.TUTOFF: Tut.cur = null; break;
      case RA.SLASH: slash(dqAng(e[2])); break;
      case RA.DODGE: dodge(dqAng(e[2])); break;
      case RA.CHAIN: { P.nlk = 0; for (const id of e[2]) for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (o.alive && o.uid === id) { P.lk[P.nlk] = o; P.lkg[P.nlk] = o.gen; P.nlk++; break; } } startChain(); break; }
      case RA.SKILL: useSkill(SKILL_IDS[e[2]]); break;
      case RA.OD: overdrive(); break;
      case RA.SWAP: swapWeapon(); break;
      case RA.ZAN: Boss.zanTap(e[2] / 4, e[3] / 4); break;
      case RA.REROLL: if (G.state === 'PERK') { Store.data.credits -= 100; this.perkOpts = UI.rollPerks(); } break;
      case RA.PERK: if (G.state === 'PERK') {
        const id = PERK_ALL()[e[2]], p = PERKS.find(q => q.id === id) || SYNERGIES.find(q => q.id === id) || RELIC_BY_ID[id];
        applyPerk(id); const cb = this.perkCb; this.perkCb = null; G.state = 'PLAY'; if (cb) cb();
        if (p && !this.fast) toast('+ ' + lt(p.name), p.need ? '#ff2bd6' : '#ffd700');
      } break;
      case RA.ROUTE: if (G.state === 'ROUTE') { const cb = this.routeCb; this.routeCb = null; G.state = 'PLAY'; if (cb) cb(e[2]); } break;
      case RA.SHOP: if (typeof RouteShop !== 'undefined') RouteShop.buy(e[2]); break;
      case RA.FIT: this.hdr.VW = e[2]; this.hdr.VH = e[3]; this.fitV(); break;
    }
  },
  pump() { // in-tick actions of the current tick (called by step() where the live input buffer fires)
    const ev = this.ev; while (this.i < ev.length && ev[this.i][0] === TICK.n && (ev[this.i][1] & 64)) this.apply(ev[this.i++]);
  },
  tick() {
    const next = TICK.n + 1, ev = this.ev;
    while (this.i < ev.length && ev[this.i][0] <= next && !(ev[this.i][1] & 64)) this.apply(ev[this.i++]);
    if (G.state === 'PLAY') {
      if (Tut.cur) { Tut.cur = null; if (this.desync < 0) this.desync = next; } // a recorded tip always ends before the next tick
      safeStep();
    } else if (this.i >= ev.length || TICK.n >= this.hdr.tk) { this.finish(); return; }
    else { TICK.n = next; if (this.desync < 0) this.desync = next; }
    if (TICK.n % 120 === 0 && TICK.n > 0) { const want = this.cs[TICK.n / 120 - 1]; if (want != null && this.desync < 0 && stateHash() !== want) this.desync = TICK.n; }
    if (TICK.n >= this.hdr.tk || (this.stopAt && TICK.n >= this.stopAt) || (G.state !== 'PLAY' && G.state !== 'PERK' && G.state !== 'ROUTE')) this.finish();
  },
  frame(rd) {
    if (!this.on || this.paused) return;
    if (this.seekTo > TICK.n) { // seeking: simulate ahead without drawing, ~20 ms per frame
      const t0 = performance.now(); while (this.on && TICK.n < this.seekTo && performance.now() - t0 < 20) this.tick();
      if (this.on && TICK.n >= this.seekTo) { this.fast = false; Aud.quiet = false; this.acc = 0; const cb = this.onSeeked; this.onSeeked = null; if (cb) cb(); }
      return;
    }
    if (this.fast) return;
    this.acc += rd * this.speed; let n = 0;
    while (this.on && this.acc >= CFG.step && n < 5 * this.speed) { this.acc -= CFG.step; n++; this.tick(); }
    if (this.acc > CFG.step * 3) this.acc = 0;
  },
  runFast(onProgress) { // simulate without drawing, in slices so the page stays responsive
    return new Promise(res => {
      const slice = () => {
        if (!this.on) { res(this.result); return; }
        const t0 = performance.now();
        while (this.on && performance.now() - t0 < 24) for (let k = 0; k < 60 && this.on; k++) this.tick();
        if (onProgress && this.hdr) onProgress(Math.min(1, TICK.n / Math.max(1, this.hdr.tk)));
        if (this.on) setTimeout(slice, 0); else res(this.result);
      };
      slice();
    });
  },
  progress() { return this.hdr ? Math.min(1, TICK.n / Math.max(1, this.hdr.tk)) : 0; },
  finish() {
    if (!this.on) return;
    const h = this.hdr;
    this.result = { score: ii(G.score), want: ii(h.sc), match: (ii(G.score)) === (ii(h.sc)) && this.desync < 0, desync: this.desync, ticks: TICK.n, tk: h.tk, kills: G.kills, time: G.time, stopped: !!(this.stopAt && TICK.n >= this.stopAt && TICK.n < h.tk) };
    this.on = false; Aud.quiet = false; const bak = this.bak;
    Store.data = bak.data; Store.lock = 0; this.bak = null;
    G.state = 'MENU'; G.narrow = 0; In.cancel(); Tut.cur = null; CAM.fin = 0; this.perkCb = this.routeCb = null;
    EN.reset(); BU.reset(); PB.reset(); CO.reset(); PU.reset(); TETH.reset(); ECHO.reset(); FX.clear(); Boss.cur = null;
    fit(); BG.set(bak.bg || 'maglev'); UI.replayBar(false);
    if (bak.mus) Aud.music(bak.mus);
    const cb = this.onEnd; this.onEnd = null; if (cb) cb(this.result);
  },
  stop() { if (this.on) { this.hdr.tk = TICK.n; this.finish(); } }
};
