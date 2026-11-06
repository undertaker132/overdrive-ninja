/* =====================================================================
   UTIL — seeded RNG (gameplay), math, zero-allocation pools
   ===================================================================== */
const TAU = Math.PI * 2;
const rnd = Math.random; // cosmetic randomness only
const R = { // mulberry32 — every gameplay roll goes through here (daily seeds, replays)
  s: 1,
  seed(n) { this.s = (n >>> 0) || 1; },
  f() {
    let t = (this.s += 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  },
  r(a, b) { return a + (b - a) * this.f(); },
  i(n) { return (this.f() * n) | 0; },
  pick(a) { return a[(this.f() * a.length) | 0]; }
};
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function angDiff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function damp(v, target, k, dt) { return v + (target - v) * (1 - Math.exp(-k * dt)); }
function distToSeg(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1, vy = y2 - y1, l2 = vx * vx + vy * vy;
  let t = l2 ? ((px - x1) * vx + (py - y1) * vy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = x1 + t * vx - px, qy = y1 + t * vy - py;
  return Math.sqrt(qx * qx + qy * qy);
}
function fmtTime(s) { s = Math.max(0, Math.ceil(s)); const m = (s / 60) | 0, r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
function fmtMs(ms) { ms = Math.max(0, ms | 0); const m = (ms / 60000) | 0, s = ((ms / 1000) | 0) % 60, t = ((ms / 100) | 0) % 10; return m + ':' + (s < 10 ? '0' : '') + s + '.' + t; }
function offlineBuild() { return typeof window === 'undefined' || !window.claude || typeof window.claude.use !== 'function'; } // the standalone file, outside claude.ai
function tsn(x) { const n = +x; return n > 0 && isFinite(n) ? Math.floor(n) : 0; } // a millisecond timestamp (too big for | 0)
function ii(v) { v = +v; return v > 0 ? Math.floor(v) : 0; } // a non-negative whole number that stays exact past 2^31 (scores)
function fmtNum(n) { return Math.floor(n).toLocaleString('en-US'); }
function todayKey() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* Swap-remove pool. Objects are preallocated once; `gen` changes on every
   reuse so stale references can be detected (o.alive && o.gen === g).
   reset() also restores the original order, so every run starts from the
   same pool layout (replays iterate entities in the recorded order). */
class Pool {
  constructor(n, mk) { this.a = []; for (let i = 0; i < n; i++) { const o = mk(); o.alive = false; o.gen = 0; o.pid = i; this.a.push(o); } this.n = 0; }
  get() { if (this.n >= this.a.length) return null; const o = this.a[this.n++]; o.alive = true; o.gen++; return o; }
  sweep() {
    for (let i = this.n - 1; i >= 0; i--) {
      if (!this.a[i].alive) { const t = this.a[i]; this.a[i] = this.a[this.n - 1]; this.a[--this.n] = t; }
    }
  }
  reset() { for (let i = 0; i < this.n; i++) this.a[i].alive = false; this.n = 0; this.a.sort((p, q) => p.pid - q.pid); for (const o of this.a) o.gen = 0; }
}

/* safe DOM helpers */
const $ = id => document.getElementById(id);
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
/* haptics with a feel per moment: a short tick for a hit, a double knock for a crit, a long rumble when you are hurt.
   A pattern only interrupts a weaker one that is still playing. */
const HAPTIC = { // [priority, pattern ms] — stronger, layered patterns for the big moments
  tap: [1, [6]], hit: [1, [12]], kill: [1, [16]], wall: [2, [18, 30, 24]], dodge: [1, [8]], parry: [2, [25, 20, 25]], zan: [3, [40, 20, 60]], tip: [1, [12]],
  crit: [2, [20, 30, 25]], perfect: [3, [35, 15, 45, 15, 60]], clash: [3, [50, 30, 50]], stagger: [3, [30, 40, 30, 40, 80]], reward: [2, [15, 40, 15, 40, 40]],
  hurt: [3, [80, 40, 120]], od: [3, [30, 40, 30, 40, 40, 50, 110]], boss: [3, [50, 50, 150]], win: [3, [40, 80, 40, 80, 120]], tele: [2, [10, 30, 10]],
  // every weapon's swing has its own feel in the hand
  w_katana: [1, [10]], w_muramasa: [1, [10, 40, 12]], w_hammer: [2, [6, 120, 45]], w_spear: [1, [4, 50, 18]], w_kunai: [1, [5]], w_daggers: [1, [6, 45, 6, 45, 8]],
  w_monarch: [1, [5, 90, 22]], w_whip: [1, [4, 110, 14]], w_scythe: [2, [8, 30, 8, 30, 8, 30, 14]], w_fists: [1, [14, 70, 18]], w_dominator: [2, [8, 90, 30]], w_nodachi: [2, [6, 140, 40, 40, 20]], w_chakram: [1, [8, 60, 6]], w_tessen: [1, [4, 30, 10]]
};
const HAP = { until: 0, pri: 0 };
function vibe(kind) {
  const h = HAPTIC[kind]; if (!h || !Store.data || !Store.data.settings.haptics || REPLAY.on) return;
  const now = performance.now(); if (now < HAP.until && h[0] < HAP.pri) return;
  if (now < HAP.until && h[0] === 1 && HAP.pri === 1 && now < HAP.until - 2) return; // light taps never stack into a buzz
  let len = 0; for (const v of h[1]) len += v; HAP.until = now + len + 20; HAP.pri = h[0];
  try { if (navigator.vibrate) navigator.vibrate(h[1]); } catch (e) { }
}

/* ---------------- error log ----------------
   Every caught-and-ignored error lands here instead of vanishing: deduplicated by message and place,
   counted, kept for this device (last 25) and shown in Settings > DEVICE CHECK with a COPY button. */
const ERRLOG = { a: [], n: 0, t: 0 };
try { const o = JSON.parse(localStorage.getItem('od_errlog') || '[]'); if (Array.isArray(o)) ERRLOG.a = o.slice(-25); } catch (x) { }
function errLog(e) {
  try {
    const m = String(e && (e.message || e) || 'error').slice(0, 140), st = e && e.stack ? (String(e.stack).split('\n').find(l => /:\d+:\d+/.test(l)) || '').trim().slice(0, 120) : '', k = m + '|' + st;
    let r = ERRLOG.a.find(q => q.k === k); const now = Date.now();
    if (r) { r.c++; r.t = now; } else { ERRLOG.a.push({ k, m, s: st, c: 1, t: now, v: typeof VERSION !== 'undefined' ? VERSION : '' }); if (ERRLOG.a.length > 40) ERRLOG.a.shift(); }
    ERRLOG.n++; if (now - ERRLOG.t > 5000) { ERRLOG.t = now; localStorage.setItem('od_errlog', JSON.stringify(ERRLOG.a.slice(-25))); }
  } catch (x) { }
}
window.addEventListener('error', ev => errLog(ev && (ev.error || ev.message)));
window.addEventListener('unhandledrejection', ev => errLog(ev && ev.reason));
