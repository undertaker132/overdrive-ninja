/* =====================================================================
   PUZZLES — "clear the roof in N dashes". A fixed 340 x 560 box (same on
   every screen), static targets, the katana, no slow-mo or aim assist:
   the full path of a dash is predictable and is drawn while aiming.
   Puzzles are built by construction (dash paths are simulated first and
   the targets placed on them, so every puzzle has a known solution) and
   checked by a solver that no shorter solution exists.
   Targets: d dummy · s shielded dummy (shield faces an angle) · x bomb
   dummy (blows up everything within 150 when it dies) · p portal pair.
   ===================================================================== */
const PZW = 340, PZH = 560, PZ_HIT = 46, PZ_TR = 17, PZ_SPD = 1450;
function pzBox() { const y0 = Math.max(100, Math.min(V.VH - G.dockL - 10 - PZH, (V.VH - G.dockL - PZH) / 2 + 24)); return { x0: V.L0, y0, x1: V.L0 + PZW, y1: y0 + PZH }; }
/* one dash from rest, in box coordinates, exactly as updatePlayer + Arena portals move the player.
   out: flat array [x, y, dashing, ...] per step; returns the rest position */
function pzPath(x, y, a, portals, out) {
  const dt = CFG.step, k = Math.pow(.004, dt), r = 18, pc = [0, 0]; let vx = Math.cos(a) * PZ_SPD, vy = Math.sin(a) * PZ_SPD, dT = .24;
  if (out) out.length = 0;
  for (let i = 0; i < 400; i++) {
    const dash = dT > 0; if (dT > 0) dT -= dt;
    x += vx * dt; y += vy * dt; vx *= k; vy *= k;
    if (x < r) { x = r; vx = Math.abs(vx) * .92; } else if (x > PZW - r) { x = PZW - r; vx = -Math.abs(vx) * .92; }
    if (y < r) { y = r; vy = Math.abs(vy) * .92; } else if (y > PZH - r) { y = PZH - r; vy = -Math.abs(vy) * .92; }
    if (dT <= 0 && vx * vx + vy * vy < 900) { vx = vy = 0; }
    if (portals) for (let q = 0; q < 2; q++) { // same order as Arena.update: each gate counts down, then checks
      if (pc[q] > 0) pc[q] -= dt; const p = portals[q], o = portals[1 - q];
      if (pc[q] <= 0 && Math.hypot(x - p[0], y - p[1]) < r + 22) { pc[0] = pc[1] = 1; x = o[0]; y = o[1]; vx *= 1.25; vy *= 1.25; dT = Math.max(dT, .18); }
    }
    if (out) out.push(x, y, dash ? 1 : 0);
    if (vx === 0 && vy === 0) break;
  }
  return [x, y];
}
/* the solver: plays a sequence of angles against the targets (kills, shield blocks, bombs, dash extension on hits) */
function pzPlay(def, angs, alive) {
  const T = def.t, n = T.length, sh = [], hid = [], dead = alive || []; for (let i = 0; i < n; i++) { dead[i] = 0; sh[i] = T[i][0] === 's' ? 1 : 0; hid[i] = -1; }
  const portals = def.p || null, dt = CFG.step, k = Math.pow(.004, dt), r = 18;
  let x = def.s[0], y = def.s[1];
  for (let m = 0; m < angs.length; m++) {
    let vx = Math.cos(angs[m]) * PZ_SPD, vy = Math.sin(angs[m]) * PZ_SPD, dT = .24, bounced = false, seq = m * 1000; const blasts = [], pc = [0, 0];
    for (let i = 0; i < 400; i++) {
      const dash = dT > 0; if (dT > 0) dT -= dt;
      x += vx * dt; y += vy * dt; vx *= k; vy *= k; let wall = false;
      if (x < r) { x = r; vx = Math.abs(vx) * .92; wall = true; } else if (x > PZW - r) { x = PZW - r; vx = -Math.abs(vx) * .92; wall = true; }
      if (y < r) { y = r; vy = Math.abs(vy) * .92; wall = true; } else if (y > PZH - r) { y = PZH - r; vy = -Math.abs(vy) * .92; wall = true; }
      if (wall && dash) { bounced = true; seq++; }
      if (dT <= 0 && vx * vx + vy * vy < 900) { vx = vy = 0; }
      if (portals) for (let q = 0; q < 2; q++) {
        if (pc[q] > 0) pc[q] -= dt; const p = portals[q], o = portals[1 - q];
        if (pc[q] <= 0 && Math.hypot(x - p[0], y - p[1]) < r + 22) { pc[0] = pc[1] = 1; x = o[0]; y = o[1]; vx *= 1.25; vy *= 1.25; dT = Math.max(dT, .18); }
      }
      for (let b = blasts.length - 1; b >= 0; b--) { const q = blasts[b]; q.t -= dt; if (q.t <= 0) { blasts.splice(b, 1); for (let j = 0; j < n; j++) if (!dead[j] && Math.hypot(T[j][1] - q.x, T[j][2] - q.y) < 150 + PZ_TR) { dead[j] = 1; if (T[j][0] === 'x') blasts.push({ x: T[j][1], y: T[j][2], t: .06 }); } } }
      if (dash) for (let j = 0; j < n; j++) {
        if (dead[j] || hid[j] === seq || Math.hypot(x - T[j][1], y - T[j][2]) >= PZ_HIT + PZ_TR) continue;
        hid[j] = seq; // like hitEnemy: one check per target per dash segment
        if (sh[j]) { const from = Math.atan2(y - T[j][2], x - T[j][1]); if (Math.abs(angDiff(from, T[j][3] * Math.PI / 180)) < 1.15 && !bounced) { vx *= -.8; vy *= -.8; continue; } sh[j] = 0; }
        dead[j] = 1; dT = Math.max(dT, .12); if (T[j][0] === 'x') blasts.push({ x: T[j][1], y: T[j][2], t: .06 });
      }
      if (vx === 0 && vy === 0 && !blasts.length) break;
    }
    for (const q of blasts) for (let j = 0; j < n; j++) if (!dead[j] && Math.hypot(T[j][1] - q.x, T[j][2] - q.y) < 150 + PZ_TR) dead[j] = 1;
  }
  let left = 0; for (let i = 0; i < n; i++) if (!dead[i]) left++;
  return left;
}
function pzQ(a) { return dqAng(qAng(a)); } // the exact angle a recorded slash would use
function pzShorter(def, moves, step) { // is there a solution with this many moves? (coarse search over angles)
  const N = Math.round(360 / step), angs = new Array(moves), buf = [];
  const rec = m => {
    for (let i = 0; i < N; i++) { angs[m] = pzQ(i * TAU / N - Math.PI); if (m + 1 < moves) { if (rec(m + 1)) return true; } else if (pzPlay(def, angs, buf) === 0) return true; }
    return false;
  };
  return moves <= 0 ? def.t.length === 0 : rec(0);
}
function pzRng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/* build a puzzle: simulate `par` dashes, put targets on the paths, then make sure it cannot be done in fewer */
function pzGen(seed, par, feat) {
  const rnd2 = pzRng(seed), path = [];
  for (let attempt = 0; attempt < 400; attempt++) {
    const portals = feat.portals && rnd2() < .85 ? [[40 + rnd2() * 60, 60 + rnd2() * 160], [PZW - 40 - rnd2() * 60, 300 + rnd2() * 200]] : null;
    if (portals && rnd2() < .5) { portals[0][0] = PZW - portals[0][0]; portals[1][0] = PZW - portals[1][0]; }
    let x = 50 + rnd2() * (PZW - 100), y = PZH - 70 - rnd2() * 110;
    if (portals && portals.some(p => Math.hypot(p[0] - x, p[1] - y) < 90)) continue;
    const def = { par, s: [Math.round(x), Math.round(y)], t: [], p: portals ? portals.map(p => [Math.round(p[0]), Math.round(p[1])]) : undefined, sol: [] };
    const used = [[x, y]]; let ok = true;
    for (let m = 0; m < par && ok; m++) {
      let placed = false;
      for (let tries = 0; tries < 40 && !placed; tries++) {
        const a = pzQ(-Math.PI / 2 + (rnd2() - .5) * (m ? 5.6 : 2.9));
        const end = pzPath(x, y, a, def.p, path);
        let bounce = -1, tele = -1; // first wall bounce / teleport inside the dash window
        for (let i = 3; i < path.length; i += 3) { if (!path[i + 2]) break; const dx = path[i] - path[i - 3], dy = path[i + 1] - path[i - 2]; if (tele < 0 && dx * dx + dy * dy > 60 * 60) tele = i / 3; }
        const dashN = path.filter((v, i) => i % 3 === 2 && v).length;
        if (dashN < 8) continue;
        for (let i = 6; i < dashN * 3; i += 3) { const ax = path[i - 3] - path[i - 6], bx = path[i] - path[i - 3], ay = path[i - 2] - path[i - 5], by = path[i + 1] - path[i - 2]; if (ax * bx < -1 || ay * by < -1) { bounce = i / 3; break; } }
        const want = feat.bounce && m === par - 1 && bounce < 0 && !(tele > 0) ? -1 : 1; if (want < 0) continue; // the last move must ricochet (or go through a portal)
        const nT = 1 + (rnd2() < (feat.many || .6) ? 1 : 0), picks = [];
        const late = Math.max(4, dashN - 1 - Math.floor(rnd2() * 3));
        picks.push(late); if (nT > 1) picks.push(Math.max(3, Math.floor(late * (.45 + rnd2() * .2))));
        const cand = [];
        for (const pi of picks) {
          const px = path[pi * 3], py = path[pi * 3 + 1];
          if (px < 26 || px > PZW - 26 || py < 26 || py > PZH - 26) { cand.length = 0; break; }
          if (used.some(u => Math.hypot(u[0] - px, u[1] - py) < 80) || cand.some(u => Math.hypot(u[1] - px, u[2] - py) < 80)) { cand.length = 0; break; }
          if (def.p && def.p.some(p => Math.hypot(p[0] - px, p[1] - py) < 60)) { cand.length = 0; break; }
          let kind = 'd', sa = 0;
          const after = (bounce > 0 && pi > bounce) || (tele > 0 && pi > tele);
          if (feat.shields && after && rnd2() < .7) { kind = 's'; sa = Math.round(Math.atan2(y - py, x - px) * 180 / Math.PI); } // shield faces the straight approach: ricochet past it
          else if (feat.bombs && rnd2() < .35) kind = 'x';
          cand.push([kind, Math.round(px), Math.round(py), sa]);
        }
        if (!cand.length) continue;
        if (cand.some(c => c[0] === 'x')) { // a bomb guards a little cluster off the path
          const b = cand.find(c => c[0] === 'x'), n2 = 1 + (rnd2() < .5 ? 1 : 0);
          for (let q = 0; q < n2; q++) { const qa = rnd2() * TAU, qd = 95 + rnd2() * 40, qx = b[1] + Math.cos(qa) * qd, qy = b[2] + Math.sin(qa) * qd; if (qx > 26 && qx < PZW - 26 && qy > 26 && qy < PZH - 26 && !used.some(u => Math.hypot(u[0] - qx, u[1] - qy) < 70)) cand.push(['d', Math.round(qx), Math.round(qy), 0]); }
        }
        for (const c of cand) { def.t.push(c); used.push([c[1], c[2]]); }
        def.sol.push(qAng(a)); x = end[0]; y = end[1]; used.push([x, y]); placed = true;
      }
      if (!placed) ok = false;
    }
    if (!ok || def.t.length < (feat.minT || par + (par > 1 ? 1 : 1))) continue; // enough targets to make it a puzzle
    if (pzPlay(def, def.sol.map(dqAng)) !== 0) continue; // the built solution must work (shields/bombs can change paths)
    if (par > 1 && pzShorter(def, par - 1, par > 3 ? 8 : par > 2 ? 5 : 3)) continue; // and no shorter one
    if (par === 1 && def.t.length < 2) continue;
    def.seed = seed; def.try = attempt; return def;
  }
  return null;
}
const Puzzle = {
  def: null, id: '', moves: 0, max: 0, done: 0, doneT: 0, fail: 0, box: null, hint: false, path: [], hits: [],
  begin(def, id) {
    this.def = def; this.id = id; this.moves = 0; this.max = def.par + 2; this.done = 0; this.doneT = 0; this.fail = 0; this.hint = false;
    const B = this.box = pzBox(); G.pz = B;
    EN.reset(); BU.reset(); PB.reset();
    Arena.setup({}, null);
    if (def.p) { Arena.portals.push({ x: B.x0 + def.p[0][0], y: B.y0 + def.p[0][1], r: 22, c: '#00f2fe', cd: 0 }, { x: B.x0 + def.p[1][0], y: B.y0 + def.p[1][1], r: 22, c: '#b537f2', cd: 0 }); }
    for (const t of def.t) {
      const e = spawnEnemy(ET.DUMMY, B.x0 + t[1], B.y0 + t[2], 0); if (!e) continue;
      e.hp = e.mhp = 1; e.spawnT = .2; e.fix = 1; e.pz = t[0] === 'x' ? 2 : t[0] === 's' ? 3 : 1; e.r = PZ_TR;
      if (t[0] === 's') { e.sh = 1; e.ang = t[3] * Math.PI / 180; }
      if (t[0] === 'x') e.col = '#ff6a00';
    }
    P.x = B.x0 + def.s[0]; P.y = B.y0 + def.s[1]; P.vx = P.vy = 0; P.ch = P.maxCh = 9; P.lockMax = 0; P.has = {}; P.pwMax = 0;
  },
  ready() { return !this.done && !this.fail && this.moves < this.max && P.vx === 0 && P.vy === 0; },
  onSlash() { this.moves++; },
  left() { let n = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].pz) n++; return n; },
  update(dt) {
    P.ch = P.maxCh; P.heat = 0; G.od = 0;
    if (this.done) { this.doneT -= dt; if (this.doneT <= 0 && G.state === 'PLAY') { this.done = 2; Flow.puzzleEnd(true); } return; }
    if (this.fail) return;
    if (this.left() === 0 && this.moves > 0) { this.done = 1; this.doneT = .9; FX.call(lt('CLEARED'), '#ffd700', 3, 30); Aud.sfx('win'); return; }
    if (this.moves >= this.max && P.vx === 0 && P.vy === 0 && !Arena.pend.length) { this.fail = 1; FX.call(lt('OUT OF MOVES'), '#ff3b5c', 3, 26); Aud.sfx('lose'); setTimeout(() => { if (G.state === 'PLAY' && G.mode === 'puzzle') Flow.puzzleEnd(false); }, 900); }
  },
  stars() { return this.moves <= this.def.par ? 3 : this.moves === this.def.par + 1 ? 2 : 1; },
  drawBox() { // rails at the top and bottom of the puzzle box, dim outside it
    const B = this.box; if (!B) return;
    cx.fillStyle = 'rgba(2,3,10,.55)'; cx.fillRect(0, 0, V.VW, B.y0); cx.fillRect(0, B.y1, V.VW, V.VH - B.y1);
    cx.strokeStyle = '#00f2fe'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(B.x0, B.y0); cx.lineTo(B.x1, B.y0); cx.moveTo(B.x0, B.y1); cx.lineTo(B.x1, B.y1); cx.stroke();
    glow(V.CX, B.y0, 60, '#00f2fe', .25); glow(V.CX, B.y1, 60, '#00f2fe', .25);
    if (this.hint && this.moves === 0 && this.def.sol) { const a = dqAng(this.def.sol[0]); this.drawPath(a, 'rgba(255,215,0,.55)', true); }
  },
  drawPath(a, col, faint) { // the full predicted dash: bounces, portals, the part that cuts (solid) and the slide (dashed)
    const B = this.box, pts = this.path; pzPath(P.x - B.x0, P.y - B.y0, a, this.def.p, pts);
    cx.lineWidth = faint ? 2 : 3; cx.strokeStyle = col; cx.beginPath(); cx.moveTo(P.x, P.y); let px = P.x, py = P.y, dashEnd = -1;
    for (let i = 0; i < pts.length; i += 3) { const x = B.x0 + pts[i], y = B.y0 + pts[i + 1]; if (Math.hypot(x - px, y - py) > 60) { cx.stroke(); cx.beginPath(); cx.moveTo(x, y); } else cx.lineTo(x, y); px = x; py = y; if (!pts[i + 2] && dashEnd < 0) { dashEnd = i; cx.stroke(); cx.setLineDash(DASH6); cx.globalAlpha = .55; cx.beginPath(); cx.moveTo(x, y); } }
    cx.stroke(); cx.setLineDash(NODASH); cx.globalAlpha = 1;
    if (pts.length) { const ex = B.x0 + pts[pts.length - 3], ey = B.y0 + pts[pts.length - 2]; cx.strokeStyle = col; cx.lineWidth = 2; cx.beginPath(); cx.arc(ex, ey, 12, 0, TAU); cx.stroke(); }
    if (faint) return;
    for (let j = 0; j < EN.n; j++) { // targets this dash would reach
      const e = EN.a[j]; if (!e.alive || !e.pz) continue;
      for (let i = 0; i < pts.length; i += 3) { if (!pts[i + 2]) break; if (Math.hypot(B.x0 + pts[i] - e.x, B.y0 + pts[i + 1] - e.y) < PZ_HIT + e.r) { cx.strokeStyle = '#ffd700'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(e.x, e.y, e.r + 10, 0, TAU); cx.stroke(); break; } }
    }
  }
};
/* ---------------- puzzle packs + the daily puzzle ---------------- */
const PZ_PACKS = []; // filled by 69b-packs.js: { id, n, need, list: [def...] }
const Puzzles = {
  dailyCache: null,
  get(id) {
    if (id === 'daily') return this.daily();
    if (id === 'test') return this.testDef || null; // used by the generator and the test suite
    const m = /^p(\d+)-(\d+)$/.exec(id || ''); if (!m) return null;
    const pk = PZ_PACKS[(m[1] | 0) - 1]; return pk ? pk.list[(m[2] | 0) - 1] || null : null;
  },
  daily() {
    const k = todayKey(); if (this.dailyCache && this.dailyCache.k === k) return this.dailyCache.def;
    let def = null;
    for (let s = 0; s < 6 && !def; s++) def = pzGen(k * 7919 + 13 + s * 101, 3, { shields: 1, bombs: 1, portals: k % 3 === 0 ? 1 : 0, bounce: 1, many: .5 });
    if (!def) def = PZ_PACKS[0].list[k % PZ_PACKS[0].list.length];
    this.dailyCache = { k, def }; return def;
  },
  label(id) { if (id === 'daily') return lt('DAILY'); const m = /^p(\d+)-(\d+)$/.exec(id || ''); return m ? m[1] + '-' + m[2] : ''; },
  name(id) { const d = this.get(id); return d && d.n ? lt(d.n) : id === 'daily' ? lt('PUZZLE OF THE DAY') : this.label(id); },
  next(id) { const m = /^p(\d+)-(\d+)$/.exec(id || ''); if (!m) return null; const p = m[1] | 0, i = m[2] | 0, pk = PZ_PACKS[p - 1]; if (pk && i < pk.list.length) return 'p' + p + '-' + (i + 1); const nx = PZ_PACKS[p]; return nx && this.open(p) ? 'p' + (p + 1) + '-1' : null; },
  stars() { let n = 0; const s = Store.data.puzzle.stars; for (const k in s) if (k !== 'daily') n += s[k] | 0; return n; },
  open(i) { const pk = PZ_PACKS[i]; return !!pk && this.stars() >= pk.need; },
  total() { let n = 0; for (const pk of PZ_PACKS) n += pk.list.length * 3; return n; }
};
function pzMini(g, def, S) { // a small map of the puzzle for the select screen
  const sc = S / PZH, w = PZW * sc, ox = (S - w) / 2; g.clearRect(0, 0, S, S); g.fillStyle = '#070a18'; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(0,242,254,.6)'; g.lineWidth = 1.5; g.strokeRect(ox + .5, .5, w - 1, S - 1);
  if (def.p) def.p.forEach((p, i) => { g.strokeStyle = i ? '#b537f2' : '#00f2fe'; g.beginPath(); g.arc(ox + p[0] * sc, p[1] * sc, 22 * sc, 0, TAU); g.stroke(); });
  for (const t of def.t) {
    const x = ox + t[1] * sc, y = t[2] * sc; g.fillStyle = t[0] === 'x' ? '#ff6a00' : '#d9b46a'; g.beginPath(); g.arc(x, y, 17 * sc + 1, 0, TAU); g.fill();
    if (t[0] === 's') { const a = t[3] * Math.PI / 180; g.strokeStyle = '#00ff88'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, 17 * sc + 4, a - 1.1, a + 1.1); g.stroke(); }
  }
  g.fillStyle = '#00f2fe'; g.beginPath(); g.arc(ox + def.s[0] * sc, def.s[1] * sc, 18 * sc + 1, 0, TAU); g.fill();
}
