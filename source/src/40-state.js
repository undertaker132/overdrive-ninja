/* =====================================================================
   STATE + INPUT — game state, player, entity pools, input with buffer
   ===================================================================== */
const EN = new Pool(CFG.maxEnemies + 4, () => ({
  x: 0, y: 0, vx: 0, vy: 0, r: 15, hp: 1, mhp: 1, type: 0, col: '#f00', v: 100, spd: 100, coins: 2,
  t: 0, cd: 0, st: 0, stT: 0, ang: 0, sh: 0, bub: 0, fl: 0, fuse: 0, hid: -1, al: 0, elite: 0,
  vis: 1, ox: 0, oy: 0, link: null, linkG: 0, wcd: 0, spawnT: 0, kind: 0, scale: 1, hpBar: 0, aff: 0, bt: 0, gt: 0, wv: 0, uid: 0,
  mb: 0, pseq: 0, da: 0, sa: 0, dir: 1, mt: 0, stun: 0, kbx: 0, kby: 0, slw: 0, fix: 0, pz: 0
}));
const BU = new Pool(140, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 6, rf: false, gz: false, kind: 0, t: 0, d: 1, o: -1 })); // hostile + reflected; o = who fired it
const PB = new Pool(60, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 6, c: '#00ff88', d: 1, l: 3, hm: 1, k: 0 }));        // player projectiles
const CO = new Pool(110, () => ({ x: 0, y: 0, vx: 0, vy: 0, v: 2, t: 0 }));
const PU = new Pool(10, () => ({ x: 0, y: 0, k: 0, l: 10, t: 0 }));      // pickups: 0 weapon core, 1 shield chip
const TETH = new Pool(6, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, l: 0 }));
const ECHO = new Pool(3, () => ({ x: 0, y: 0, vx: 0, vy: 0, l: 0, cd: 0, ang: 0, seq: 0 }));

const G = {
  state: 'BOOT', mode: 'story', stage: null, diff: DIFFS[1], di: 1,
  runTrack: '', gspd: 1, ts: 1, hs: 0, freeze: 0, time: 0, rtime: 0, score: 0, combo: 0, ct: 0, maxCombo: 0, kills: 0, hits: 0,
  od: 0, odT: 0, skill: .5, parries: 0, grazes: 0, zan: 0, clashes: 0, trainKills: 0, armsCut: 0, crits: 0,
  slowT: 0, slowK: 1, aimHold: 0, seqCar: 1, carKills: 0, carNeed: 10, bossIdx: 0, narrow: 0,
  msg: '', msgT: 0, msgC: '#ffd700', hint: '', hintT: 0, hintSeen: {},
  ev: '', evT: 0, dark: 0, spawnT: 0, mods: {}, spdMul: 1, scoreMul: 1, dmgMod: 1, credMul: 1,
  obj: null, objV: 0, objN: 0, cine: null, lastCrit: false, runCredits: 0, chalDone: false,
  train: [{ y: -9999, warn: 0, t: 12 }, { y: -9999, warn: 0, t: 18 }], perkQueue: 0, rankK: 0, rankPop: 0, won: false,
  shooter: -1, ngp: 0, lastHit: '', lastWho: -1, vampK: 0, assist: 0, maxRk: 0, rule: null, euid: 0, dockL: 76, seed: 1, contracts: [], ctr: {}, heat: 0, carKind: 'std', mystery: 0, mbKills: 0, pz: null
};
const P = {
  x: 210, y: 400, vx: 0, vy: 0, r: 18, hp: 3, maxHp: 3, ch: 2, maxCh: 2, rt: 0, rc: .65,
  dodgeCd: 0, dashT: 0, pw: 0, pwMax: .16, inv: 0, heat: 0, lock: 0, ang: -Math.PI / 2, face: -Math.PI / 2, mvA: -Math.PI / 2, spd: 0, walkPh: 0, swing: 0, sx: 1, sy: 1, bounced: false, wallRunT: 0,
  w: WEAPONS[0], ca: '#00f2fe', cb: '#ff0844', seq: 0, anim: 0, aft: 0,
  cds: { grapple: 0, hijack: 0, web: 0, echo: 0 }, has: { od: 1, grapple: 1, hijack: 1, web: 1, echo: 1 },
  perks: {}, dmgMul: 1, critAdd: 0, reach: 1, heatMul: 1, odMul: 1, magR: 100, credMul: 1, cdMul: 1, vampN: 0, wind: 0,
  dA: 0, dCd: 1, stolen: 0, stolenCd: 0, orb: 0, sig: '', mlv: 0, flN: 0, reapN: 0, kuN: 0, wcr: 0, otN: 0, evo: {}, gch: 0, gchT: 0, glast: -1, gprev: -1,
  lk: [null, null, null, null, null], lkg: [0, 0, 0, 0, 0], nlk: 0, cq: [null, null, null, null, null], cqg: [0, 0, 0, 0, 0], ncq: 0, cqi: 0, lockMax: 4, tal: {},
  scarf: new Float32Array(20)
};

/* ---------------- input ---------------- */
const SENS = [256, 121, 36]; // squared minimum swipe length in logical units: LOW, NORMAL, HIGH sensitivity
function swipeMin() { return SENS[clamp(Store.data.settings.sens | 0, 0, 2)]; }
function assistK() { if (In.cur) return 0; const d = G.di | 0; return d <= 0 ? 1 : d === 1 ? .6 : d === 2 ? .45 : .3; } // v37: ROOKIE keeps the full help, mouse aim at the cursor gets none
function assistAngle(a) { // aim assist: bend a swipe onto an enemy within ~15 degrees of it
  if (!Store.data.settings.assist || G.mode === 'puzzle') return a; // puzzles: the aim is exactly the swipe
  let best = a, bs = 1e9;
  for (let i = 0; i < EN.n; i++) {
    const e = EN.a[i]; if (!e.alive || e.al > 0 || e.vis < .5 || e.spawnT > 0) continue;
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.sqrt(dx * dx + dy * dy); if (d > 420 || d < 8) continue;
    const ea = Math.atan2(dy, dx), df = Math.abs(angDiff(ea, a)); if (df > .27 * assistK()) continue;
    const sc = df * 300 + d * .25; if (sc < bs) { bs = sc; best = ea; }
  }
  const B = Boss.cur;
  if (bs > 1e8 && B && B.enter >= 1 && B.dying <= 0) { const ea = Math.atan2(B.y - P.y, B.x - P.x); if (Math.abs(angDiff(ea, a)) < .22 * assistK()) best = ea; }
  return best;
}
const In = {
  on: false, id: -1, sx: 0, sy: 0, cx: 0, cy: 0, buf: 0, ba: 0, ox: 0, oy: 0, t0: 0,
  pos(e) { this.px = (e.clientX - this.ox) / V.s; this.py = (e.clientY - this.oy) / V.s; },
  down(e) {
    if (G.state !== 'PLAY' || REPLAY.on) return;
    if (Tut.cur) { Tut.dismiss(); return; }
    if (G.freeze > 0) return;
    Aud.init(); this.pos(e);
    if (Boss.cur && Boss.cur.stag > 0 && Boss.zanTap(this.px, this.py)) return; // finishing taps on a staggered boss
    this.on = true; this.id = e.pointerId; this.sx = this.cx = this.px; this.sy = this.cy = this.py; this.t0 = performance.now(); P.nlk = 0; G.aimHold = 0; REC.act(RA.DOWN);
    if (P.ch > 0 || G.odT > 0) { P.sx = .82; P.sy = .82; }
  },
  move(e) { if (!this.on || e.pointerId !== this.id) return; this.pos(e); this.cx = this.px; this.cy = this.py; lockScan(); },
  up(e) {
    if (!this.on || (e && e.pointerId !== this.id) || REPLAY.on) return;
    this.on = false; G.aimHold = 0; REC.act(RA.UP);
    const dx = this.cx - this.sx, dy = this.cy - this.sy;
    if (P.nlk >= 2) { this.buf = .22; this.ba = 99; return; } // chain release
    P.nlk = 0;
    if (dx * dx + dy * dy > swipeMin()) { this.buf = .22; this.ba = assistAngle(Math.atan2(dy, dx)); return; }
    // quick tap: dash toward the tapped spot (snaps to an enemy right under the finger)
    if (Store.data.settings.tap && performance.now() - this.t0 < 280) {
      let tx = this.sx, ty = this.sy, bd = (G.di | 0) >= 1 ? 42 : 70; // (v37: a tighter snap above ROOKIE)
      for (let i = 0; i < EN.n; i++) { const o = EN.a[i]; if (!o.alive || o.al > 0) continue; const q = dist(o.x, o.y, this.sx, this.sy); if (q < bd + o.r) { bd = q; tx = o.x; ty = o.y; } }
      if (dist(tx, ty, P.x, P.y) > 14) { this.buf = .22; this.ba = Math.atan2(ty - P.y, tx - P.x); }
    }
  },
  cancel() { this.on = false; this.buf = 0; P.nlk = 0; REC.act(RA.CANCEL); },
  pump(rd, frozen) { // buffered release fires the moment the blade can move again
    if (this.buf <= 0) return;
    if (G.mode === 'puzzle') { if (!frozen && Puzzle.ready() && this.ba !== 99) { slash(this.ba); this.buf = 0; } return; } // a puzzle move waits until you stop
    const canSlash = (P.ch > 0 || G.odT > 0) && P.lock <= 0;
    if (!frozen && P.dashT <= .05 && canSlash) { if (this.ba === 99) startChain(); else slash(this.ba); this.buf = 0; return; }
    if (!frozen && P.dashT <= .05 && !canSlash && this.ba !== 99 && dodge(this.ba)) { this.buf = 0; return; } // no charges: dodge instead
    this.buf -= rd; if (this.buf <= 0) P.nlk = 0;
  }
};
function lockScan() { // targets under the aim ray become chain-slash locks
  if ((P.ch <= 0 && G.odT <= 0) || REPLAY.on) return;
  const dx = In.cx - In.sx, dy = In.cy - In.sy; if (dx * dx + dy * dy < swipeMin() * 1.6) return;
  const a = Math.atan2(dy, dx), rx = Math.cos(a), ry = Math.sin(a);
  for (let i = 0; i < EN.n && P.nlk < P.lockMax; i++) {
    const e = EN.a[i]; if (!e.alive || e.al > 0 || e.vis < .5) continue;
    let dup = false; for (let k = 0; k < P.nlk; k++) if (P.lk[k] === e) dup = true; if (dup) continue;
    const ex = e.x - P.x, ey = e.y - P.y, pr = ex * rx + ey * ry;
    if (pr > 0 && pr < 380 && Math.abs(-ex * ry + ey * rx) < e.r + 30) {
      P.lk[P.nlk] = e; P.lkg[P.nlk] = e.gen; P.nlk++; Aud.sfx('lock', P.nlk);
    }
  }
}
function bindInput() {
  const tgt = cv;
  tgt.addEventListener('pointerdown', e => { e.preventDefault(); In.down(e); }, { passive: false });
  window.addEventListener('pointermove', e => In.move(e), { passive: true });
  window.addEventListener('pointerup', e => In.up(e));
  window.addEventListener('pointercancel', () => In.cancel());
  window.addEventListener('blur', () => In.cancel());
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    const tg = e.target && e.target.tagName; if (tg === 'TEXTAREA' || tg === 'INPUT') return; // typing a report must not pause or fire skills
    const k = e.code;
    if (REPLAY.on) { if (k === 'Escape') UI.replayExit(); else if (k === 'Space') { REPLAY.paused = !REPLAY.paused; e.preventDefault(); } return; }
    if (k === 'Escape' || k === 'KeyP') { Flow.togglePause(); return; }
    if (G.state === 'DIALOG' && (k === 'Space' || k === 'Enter')) { Dlg.next(); e.preventDefault(); return; }
    if (G.state === 'PLAY' && Tut.cur && (k === 'Space' || k === 'Enter')) { Tut.dismiss(); e.preventDefault(); return; }
    if (k === 'KeyR' && (UI.cur === 'result' || UI.cur === 'pause') && Flow.last && Flow.last.mode !== 'race' && Flow.last.mode !== 'raid') { Aud.sfx('ui'); Flow.restart(); return; } // quick restart
    if (G.state !== 'PLAY') return;
    Keys.game(k, e); // version 34: rebindable (Settings > PC > KEYS)
  });
}
