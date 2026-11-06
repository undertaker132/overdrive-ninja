/* =====================================================================
   RENDER CORE — logical view scaling, quality governor, sprite caches,
   per-theme parallax backgrounds (pre-rendered strips, no shadowBlur)
   ===================================================================== */
const cv = $('c'); let cx = cv.getContext('2d') /* alpha: the 3D layer shows through in 3D mode */; // let: shop previews borrow the draw code (withCtx)
const V = { W: 390, H: 844, s: 1, dpr: 1, VW: 420, VH: 760, CX: 210, AW: CFG.arenaW, L0: 40, R0: 380, L: 40, R: 380, insL: 0, insR: 0 };
const Q = { lvl: 2, dprCap: 2, glow: 1, parts: 1, rain: 1, fps: 60, acc: 0, n: 0, ok: 0, bad: 0 };

function fit() {
  const w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
  V.W = Math.max(200, w); V.H = Math.max(300, h);
  if (REPLAY.on) { REPLAY.fitV(); applyDpr(); BG.dirty = true; return; } // a replay keeps the recorded arena size
  const ovw = V.VW, ovh = V.VH;
  V.s = Math.min(V.W / CFG.viewW, V.H / CFG.viewH);
  V.VW = V.W / V.s; V.VH = V.H / V.s; V.CX = V.VW / 2;
  V.L0 = V.CX - V.AW / 2; V.R0 = V.CX + V.AW / 2;
  if (!G || !G.narrow) { V.L = V.L0; V.R = V.R0; }
  if (REC.live() && (V.VW !== ovw || V.VH !== ovh)) REC.act(RA.FIT, V.VW, V.VH); // a resized arena mid-run replays the same way
  if (G && G.mode === 'puzzle' && G.pz && G.state === 'PLAY' && (V.VW !== ovw || V.VH !== ovh)) setTimeout(() => { if (G.mode === 'puzzle' && G.state === 'PLAY') Flow.startPuzzle(Puzzle.id); }, 0); // the box moved: start the puzzle over
  const sa = $('sa'); if (sa) { const cs = getComputedStyle(sa); V.insL = (parseFloat(cs.paddingLeft) || 0) / V.s; V.insR = (parseFloat(cs.paddingRight) || 0) / V.s; }
  applyDpr(); BG.dirty = true;
}
function applyDpr() {
  const st = Store.data && Store.data.settings;
  if (st && +st.rscale) { const r = +st.rscale; st.res = r >= 2 ? 'high' : r >= 1.5 ? 'med' : 'low'; st.rscale = 0; Q.dprCap = resK(); } // (version 40: PC > Render resolution became Settings > SCREEN > RESOLUTION)
  const d = Math.min(window.devicePixelRatio || 1, Q.dprCap); V.dpr = d; // RESOLUTION fixes the cap; AUTO follows the quality steps
  const pw = Math.round(V.W * d), ph = Math.round(V.H * d);
  if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
}
/* RESOLUTION setting: AUTO follows the quality steps; the others fix the pixel density (capped by the screen's own) */
const RES_K = { max: 3, high: 2, med: 1.5, low: 1 };
function resK() { const r = Store.data && Store.data.settings && Store.data.settings.res; return RES_K[r] || 0; }
function setQuality(l) {
  l = clamp(l, 0, 2); if (l === Q.lvl && Q.applied) return; Q.applied = 1; Q.lvl = l;
  Q.dprCap = resK() || [1, 1.5, 2][l]; Q.glow = l > 0 ? 1 : 0; Q.parts = [.45, .75, 1][l]; Q.rain = [0, .5, 1][l];
  applyDpr();
}
function governor(rd) { // measures real frame rate and steps quality with hysteresis
  Q.acc += rd; Q.n++;
  if (Q.acc < 1.25) return;
  const f = Q.n / Q.acc; Q.fps = f; Q.acc = 0; Q.n = 0;
  const m = Store.data.settings.fx;
  if (m === 'low') { setQuality(0); return; } if (m === 'high' || m === 'ultra') { setQuality(2); return; }
  // steps down after ~4 s below 47 fps, up only after ~20 s above 58, and never straight back up after a recent drop (no back-and-forth: every step changes the picture's sharpness)
  const now = performance.now();
  if (f < 47) { if (++Q.bad >= 3) { setQuality(Q.lvl - 1); Q.bad = 0; Q.downAt = now; } Q.ok = 0; }
  else if (f > 58) { if (++Q.ok >= 16 && now - (Q.downAt || -1e9) > 45000) { setQuality(Q.lvl + 1); Q.ok = 0; } Q.bad = 0; }
}

/* ---------- sprite caches ---------- */
const GLOW = {};
function glowSpr(c) {
  let k = GLOW[c]; if (k) return k;
  k = document.createElement('canvas'); k.width = k.height = 64;
  const g = k.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, c); r.addColorStop(.35, c); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = .55; g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return GLOW[c] = k;
}
function glow(x, y, s, c, a) { // additive soft light, ~1 drawImage (size capped: large additive blits are the costliest op)
  if (!Q.glow || a <= 0) return;
  if (s > 96) { a *= 96 / s; s = 96; }
  cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = a > 1 ? 1 : a;
  cx.drawImage(glowSpr(c), x - s, y - s, s * 2, s * 2);
  cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
}
let VIG = null;
function vigSpr() {
  if (VIG) return VIG;
  VIG = document.createElement('canvas'); VIG.width = VIG.height = 128;
  const g = VIG.getContext('2d'), r = g.createRadialGradient(64, 64, 30, 64, 64, 92);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return VIG;
}
let DARK = null; // blackout mask: a hole of light around the player
function darkSpr() {
  if (DARK) return DARK;
  DARK = document.createElement('canvas'); DARK.width = DARK.height = 256;
  const g = DARK.getContext('2d'), r = g.createRadialGradient(128, 128, 20, 128, 128, 128);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(.6, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,.96)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256); return DARK;
}

/* ---------- parallax backgrounds ---------- */
const BG = {
  theme: 'maglev', T: THEMES.maglev, far: null, near: null, built: '', scroll: 0, t: 0, dirty: true,
  flash: 0, boltT: 3, bolt: [0, 0, 0, 0, 0, 0, 0, 0], rainX: new Float32Array(48), rainY: new Float32Array(48),
  set(id) { this.theme = THEMES[id] ? id : 'maglev'; this.T = THEMES[this.theme]; if (this.built !== this.theme) this.build(); },
  strip(w, h, fn) { const k = document.createElement('canvas'); k.width = w; k.height = h; fn(k.getContext('2d'), w, h); return k; },
  build() {
    const T = this.T, id = this.theme; this.built = id;
    this.far = null; this.near = null; // drop old strips first (memory)
    const W = 256, H = 1024;
    if (id === 'maglev' || id === 'undercity') {
      this.far = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 26 + rnd() * 40) {
          const bw = 30 + rnd() * 70, bx = rnd() * (W - bw), bh = 40 + rnd() * 90;
          g.fillStyle = id === 'maglev' ? '#0a0e26' : '#1a0820'; g.fillRect(bx, y, bw, bh);
          g.fillStyle = T.win; g.globalAlpha = .18;
          for (let wy = y + 6; wy < y + bh - 6; wy += 9) for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) if (rnd() < .35) g.fillRect(wx, wy, 3, 4);
          g.globalAlpha = 1;
        }
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 70 + rnd() * 80) {
          const bw = 50 + rnd() * 90, bx = rnd() * (W - bw), bh = 90 + rnd() * 150;
          g.fillStyle = id === 'maglev' ? '#0d1330' : '#200b2a'; g.fillRect(bx, y, bw, bh);
          g.strokeStyle = rnd() < .5 ? T.b1 : T.b2; g.globalAlpha = .7; g.lineWidth = 1.5; g.strokeRect(bx + .5, y + .5, bw - 1, bh - 1);
          g.globalAlpha = .55; g.fillStyle = T.win;
          for (let wy = y + 8; wy < y + bh - 8; wy += 11) for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) if (rnd() < .45) g.fillRect(wx, wy, 4, 5);
          if (id === 'undercity' && rnd() < .7) { // neon sign with glyph bars
            const sx = bx + 6, sy = y + 10, sw = Math.min(40, bw - 12), sh = 16;
            g.globalAlpha = .9; g.fillStyle = rnd() < .5 ? '#ff2bd6' : '#00ffd0'; g.fillRect(sx, sy, sw, sh);
            g.fillStyle = '#1a0820'; for (let k = 0; k < 4; k++) g.fillRect(sx + 3 + k * (sw / 4), sy + 4, sw / 8, sh - 8);
          }
          g.globalAlpha = 1;
        }
      });
    } else if (id === 'ghost') {
      this.far = this.strip(W, H, (g) => {
        g.font = '10px monospace'; g.fillStyle = '#00ff88';
        for (let x = 4; x < W; x += 14) { g.globalAlpha = .08 + rnd() * .18; for (let y = rnd() * 40; y < H; y += 12) if (rnd() < .6) g.fillText(String.fromCharCode(0x30A0 + (rnd() * 96 | 0)), x, y); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 64) {
          g.fillStyle = '#04110b'; g.fillRect(0, y, W, 18);
          g.fillStyle = '#0a2a1a'; g.fillRect(0, y + 2, W, 3);
          if (rnd() < .5) { g.fillStyle = '#00ff88'; g.globalAlpha = .8; g.fillRect(W - 30 - rnd() * 60, y + 7, 14, 4); g.globalAlpha = 1; }
        }
      });
    } else if (id === 'spire') {
      this.far = this.strip(W, H, (g) => {
        for (let i = 0; i < 160; i++) { g.globalAlpha = .3 + rnd() * .7; g.fillStyle = rnd() < .2 ? '#ffd700' : '#ffffff'; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 90 + rnd() * 80) {
          const cxp = rnd() * W, r = 30 + rnd() * 50;
          g.fillStyle = 'rgba(255,170,120,.10)';
          for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cxp + (k - 2) * r * .5, y + rnd() * 10, r * (.5 + rnd() * .4), 0, TAU); g.fill(); }
        }
      });
    } else if (id === 'storm') { // above the clouds: stars, cloud banks, orbital ring girders
      this.far = this.strip(W, H, (g) => {
        for (let i = 0; i < 120; i++) { g.globalAlpha = .2 + rnd() * .6; g.fillStyle = '#dff4ff'; g.fillRect(rnd() * W, rnd() * H, 1.2, 1.2); }
        for (let y = 0; y < H; y += 40 + rnd() * 50) {
          const c0 = rnd() * W, r = 26 + rnd() * 40; g.globalAlpha = 1; g.fillStyle = 'rgba(120,150,200,.13)';
          for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(c0 + (k - 3) * r * .45, y + rnd() * 12, r * (.45 + rnd() * .4), 0, TAU); g.fill(); }
        }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 110 + rnd() * 70) {
          g.fillStyle = '#121a2c'; g.fillRect(0, y, W, 10); g.fillStyle = '#1a2440'; g.fillRect(0, y + 10, W, 3);
          g.strokeStyle = 'rgba(159,216,255,.25)'; g.lineWidth = 1.2; g.beginPath();
          for (let x = 0; x < W; x += 22) { g.moveTo(x, y); g.lineTo(x + 11, y + 10); g.lineTo(x + 22, y); } g.stroke();
          g.fillStyle = '#9fd8ff'; for (let x = 8 + rnd() * 30; x < W; x += 60 + rnd() * 40) { g.globalAlpha = .9; g.fillRect(x, y + 3, 3, 3); g.globalAlpha = .25; g.fillRect(x - 3, y, 9, 9); }
          g.globalAlpha = 1;
        }
      });
    } else if (id === 'dojo') { // paper walls, dark pillars, red lanterns
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#2a1e12'; g.fillRect(0, 0, W, H);
        for (let y = 0; y < H; y += 128) {
          g.fillStyle = 'rgba(255,220,170,.10)'; g.fillRect(6, y + 6, W - 12, 116);
          g.strokeStyle = 'rgba(30,18,8,.9)'; g.lineWidth = 3; g.beginPath();
          for (let x = 6; x <= W - 6; x += 30) { g.moveTo(x, y + 6); g.lineTo(x, y + 122); }
          for (let yy = y + 6; yy <= y + 122; yy += 29) { g.moveTo(6, yy); g.lineTo(W - 6, yy); }
          g.stroke();
        }
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 180 + rnd() * 60) {
          const x = rnd() * (W - 40); g.fillStyle = '#140c06'; g.fillRect(x, y, 22, 170);
          const lx = rnd() * (W - 30) + 15, ly = y + 40 + rnd() * 80;
          g.fillStyle = 'rgba(255,170,80,.18)'; g.beginPath(); g.arc(lx, ly, 26, 0, TAU); g.fill();
          g.fillStyle = '#c0102e'; g.beginPath(); g.ellipse(lx, ly, 9, 13, 0, 0, TAU); g.fill(); g.fillStyle = '#ffb347'; g.fillRect(lx - 5, ly - 15, 10, 3); g.fillRect(lx - 5, ly + 12, 10, 3);
        }
      });
    } else if (id === 'highway') { // the city racing past both sides of the road: neon signs and streetlights
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#07060e'; g.fillRect(0, 0, W, H);
        for (let y = 0; y < H; y += 30 + rnd() * 40) { const bw = 30 + rnd() * 80, bx = rnd() * (W - bw); g.fillStyle = '#0e0a1c'; g.fillRect(bx, y, bw, 24 + rnd() * 30);
          g.fillStyle = rnd() < .5 ? 'rgba(255,43,214,.55)' : 'rgba(0,242,254,.5)'; g.fillRect(bx + 4, y + 4, bw * (.3 + rnd() * .5), 3); }
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 70) { g.fillStyle = '#2a2e3a'; g.fillRect(W - 14, y, 4, 40); g.fillRect(10, y + 35, 4, 40); g.fillStyle = 'rgba(255,246,208,.55)'; g.beginPath(); g.arc(W - 12, y, 6, 0, TAU); g.arc(12, y + 35, 6, 0, TAU); g.fill(); }
      });
    } else if (id === 'harbor') { // container stacks and cranes, dock edges with hazard stripes
      this.far = this.strip(W, H, (g) => {
        const cols = ['#0e3a40', '#3a2410', '#2a0e24', '#0e2a18'];
        for (let y = 0; y < H; y += 34 + rnd() * 30) { for (let x = 4; x < W; x += 30 + rnd() * 20) { if (rnd() < .3) continue; g.fillStyle = cols[(rnd() * 4) | 0]; g.fillRect(x, y, 24, 14); g.fillStyle = 'rgba(255,255,255,.08)'; for (let k = 3; k < 22; k += 4) g.fillRect(x + k, y + 2, 1.5, 10); } }
        g.strokeStyle = 'rgba(255,210,63,.35)'; g.lineWidth = 3; for (let y = 60; y < H; y += 260) { g.beginPath(); g.moveTo(20, y); g.lineTo(W - 20, y + 40); g.stroke(); }
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 120 + rnd() * 80) {
          g.fillStyle = '#0a1a1e'; g.fillRect(0, y, W, 16);
          for (let x = 0; x < W; x += 16) { g.fillStyle = (x / 16) % 2 ? '#ffd23f' : '#141414'; g.fillRect(x, y + 16, 16, 5); }
          g.fillStyle = '#2fe6c8'; for (let x = 20 + rnd() * 40; x < W; x += 70 + rnd() * 40) { g.globalAlpha = .9; g.fillRect(x, y + 4, 6, 6); g.globalAlpha = .2; g.fillRect(x - 6, y - 2, 18, 18); } g.globalAlpha = 1;
        }
      });
    } else if (id === 'temple') { // curved roof tiles, torii gates and stone lanterns, seen from above
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#1e1410'; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(255,154,61,.12)'; g.lineWidth = 2;
        for (let y = 0; y < H; y += 12) { g.beginPath(); for (let x = 0; x < W; x += 16) g.arc(x + 8, y, 8, 0, Math.PI); g.stroke(); }
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 150 + rnd() * 60) {
          const x = 20 + rnd() * (W - 120); g.fillStyle = '#c0281a'; g.fillRect(x, y, 90, 9); g.fillRect(x - 8, y + 14, 106, 6); g.fillStyle = '#1a0a08'; g.fillRect(x + 10, y + 9, 8, 30); g.fillRect(x + 72, y + 9, 8, 30);
          const lx = 30 + rnd() * (W - 60), ly = y + 70 + rnd() * 40; g.fillStyle = '#5a5048'; g.fillRect(lx - 10, ly - 10, 20, 20); g.fillStyle = 'rgba(255,200,120,.5)'; g.beginPath(); g.arc(lx, ly, 6, 0, TAU); g.fill();
          g.fillStyle = 'rgba(255,170,200,.5)'; for (let k = 0; k < 6; k++) g.fillRect(rnd() * W, y + rnd() * 140, 3, 2); // petals
        }
      });
    } else if (id === 'summit') { // the Black Tower: gold window grids and steel girders
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#0a0812'; g.fillRect(0, 0, W, H);
        for (let y = 4; y < H; y += 10) for (let x = 4; x < W; x += 12) if (rnd() < .18) { g.fillStyle = rnd() < .15 ? '#ff0844' : '#ffe9a6'; g.globalAlpha = .25 + rnd() * .3; g.fillRect(x, y, 5, 4); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 100 + rnd() * 60) {
          g.fillStyle = '#16121e'; g.fillRect(0, y, W, 12); g.strokeStyle = 'rgba(255,215,0,.35)'; g.lineWidth = 1.2; g.beginPath();
          for (let x = 0; x < W; x += 24) { g.moveTo(x, y); g.lineTo(x + 12, y + 12); g.lineTo(x + 24, y); } g.stroke();
          g.fillStyle = '#ffd700'; for (let x = 10 + rnd() * 30; x < W; x += 80) { g.globalAlpha = .9; g.fillRect(x, y + 4, 4, 4); } g.globalAlpha = 1;
        }
      });
    } else if (id === 'orbital') { // the space elevator: stars far below, cable lattices and solar panels
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#020208'; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 220; k++) { g.fillStyle = rnd() < .1 ? '#00f2fe' : '#ffffff'; g.globalAlpha = .2 + rnd() * .6; const r = rnd() < .08 ? 1.6 : .8; g.fillRect(rnd() * W, rnd() * H, r, r); }
        g.globalAlpha = .12; g.fillStyle = '#2a4aa8'; g.beginPath(); g.arc(W * .7, H * .4, 120, 0, TAU); g.fill(); g.globalAlpha = 1; // a planet's limb
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 160 + rnd() * 60) {
          const x = 10 + rnd() * (W - 120); g.fillStyle = '#0c1630'; g.fillRect(x, y, 100, 44); g.strokeStyle = 'rgba(0,242,254,.5)'; g.lineWidth = 1;
          for (let k = 0; k <= 100; k += 12.5) { g.beginPath(); g.moveTo(x + k, y); g.lineTo(x + k, y + 44); g.stroke(); } g.beginPath(); g.moveTo(x, y + 22); g.lineTo(x + 100, y + 22); g.stroke();
          g.strokeStyle = 'rgba(200,220,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 50, y + 44); g.lineTo(x + 50, y + 90); g.stroke();
        }
      });
    } else if (id === 'datavoid') { // corrupted servers: rack grids, falling hex, magenta faults
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#05020a'; g.fillRect(0, 0, W, H); g.font = '9px monospace';
        for (let k = 0; k < 160; k++) { g.fillStyle = rnd() < .15 ? '#ff2bd6' : '#7a4ab8'; g.globalAlpha = .15 + rnd() * .35; g.fillText(((rnd() * 256) | 0).toString(16).padStart(2, '0'), rnd() * W, rnd() * H); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 110 + rnd() * 70) {
          const x = rnd() * (W - 60); g.fillStyle = '#120a1e'; g.fillRect(x, y, 56, 70); g.strokeStyle = 'rgba(196,91,255,.45)'; g.lineWidth = 1; g.strokeRect(x, y, 56, 70);
          for (let k = 0; k < 6; k++) { g.fillStyle = rnd() < .2 ? '#ff2bd6' : '#00ff88'; g.globalAlpha = .7; g.fillRect(x + 6, y + 6 + k * 10, 4, 3); g.globalAlpha = .25; g.fillRect(x + 14, y + 7 + k * 10, 34, 1); } g.globalAlpha = 1;
          if (rnd() < .5) { g.fillStyle = 'rgba(255,43,214,.35)'; g.fillRect(0, y + 80, W, 2 + rnd() * 3); }
        }
      });
    } else if (id === 'sakura') { // the shrine district: dusk sky, pagoda silhouettes, torii gates and neon petals
      this.far = this.strip(W, H, (g) => {
        const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#1a0618'); sk.addColorStop(1, '#3a0a28'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 6; k++) { const x = rnd() * W, y = rnd() * H, w = 40 + rnd() * 50; g.fillStyle = '#12040f'; for (let f = 0; f < 4; f++) { const fw = w - f * 9; g.fillRect(x - fw / 2, y - f * 18, fw, 4); g.fillRect(x - 4, y - f * 18, 8, 18); } }
        for (let k = 0; k < 140; k++) { g.fillStyle = rnd() < .5 ? '#ff9ad5' : '#ffd9ec'; g.globalAlpha = .15 + rnd() * .4; g.beginPath(); g.ellipse(rnd() * W, rnd() * H, 2.2, 1.2, rnd() * 3, 0, TAU); g.fill(); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 170 + rnd() * 80) { // torii gates
          const x = 20 + rnd() * (W - 100), w = 70; g.fillStyle = '#c0102e'; g.fillRect(x, y, w, 6); g.fillRect(x - 6, y - 6, w + 12, 5); g.fillRect(x + 8, y, 6, 50); g.fillRect(x + w - 14, y, 6, 50); g.fillRect(x + 4, y + 16, w - 8, 4);
          g.globalAlpha = .35; g.fillStyle = '#ff4f8a'; g.fillRect(x - 6, y - 8, w + 12, 2); g.globalAlpha = 1;
          if (rnd() < .6) { g.fillStyle = '#ffd23f'; g.globalAlpha = .7; g.beginPath(); g.arc(x + w + 30, y + 30, 5, 0, TAU); g.fill(); g.globalAlpha = .2; g.beginPath(); g.arc(x + w + 30, y + 30, 14, 0, TAU); g.fill(); g.globalAlpha = 1; } // a paper lantern
        }
      });
    } else if (id === 'abyss') { // the deep-sea data cable: dark water, light shafts, cables and bubbles
      this.far = this.strip(W, H, (g) => {
        const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#010608'); sk.addColorStop(1, '#03161c'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 5; k++) { const x = rnd() * W; g.globalAlpha = .06; g.fillStyle = '#7ff8e8'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 0); g.lineTo(x + 120, H); g.lineTo(x + 60, H); g.closePath(); g.fill(); }
        for (let k = 0; k < 90; k++) { g.globalAlpha = .1 + rnd() * .3; g.strokeStyle = '#bff8ee'; g.lineWidth = 1; g.beginPath(); g.arc(rnd() * W, rnd() * H, 1 + rnd() * 3, 0, TAU); g.stroke(); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let k = 0; k < 4; k++) { const x0 = rnd() * W; g.strokeStyle = '#0c2a2e'; g.lineWidth = 10; g.beginPath(); g.moveTo(x0, 0); for (let y = 0; y <= H; y += 40) g.lineTo(x0 + Math.sin(y * .02 + k) * 30, y); g.stroke();
          g.strokeStyle = 'rgba(46,230,200,.4)'; g.lineWidth = 2; g.stroke(); for (let y = 30; y < H; y += 90) { g.fillStyle = rnd() < .3 ? '#7a5cff' : '#2ee6c8'; g.globalAlpha = .8; g.fillRect(x0 + Math.sin(y * .02 + k) * 30 - 3, y, 6, 6); g.globalAlpha = 1; } }
      });
    } else if (id === 'skyroad') { // the space elevator at night: clouds far below, the cable and its maintenance rings
      this.far = this.strip(W, H, (g) => {
        const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#03040c'); sk.addColorStop(1, '#0e1838'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 120; k++) { g.fillStyle = '#ffffff'; g.globalAlpha = .2 + rnd() * .6; g.fillRect(rnd() * W, rnd() * H, 1.4, 1.4); }
        for (let k = 0; k < 9; k++) { const x = rnd() * W, y = rnd() * H, r = 40 + rnd() * 70; g.globalAlpha = .07; g.fillStyle = '#9fb8ff'; for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(x + j * r * .4, y + (j % 2) * 8, r, r * .35, 0, 0, TAU); g.fill(); } }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        const x0 = W * .5; g.strokeStyle = '#1a2240'; g.lineWidth = 16; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0, H); g.stroke(); g.strokeStyle = 'rgba(159,184,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 6, 0); g.lineTo(x0 - 6, H); g.moveTo(x0 + 6, 0); g.lineTo(x0 + 6, H); g.stroke();
        for (let y = 40; y < H; y += 150 + rnd() * 60) { g.strokeStyle = '#2a3460'; g.lineWidth = 4; g.beginPath(); g.ellipse(x0, y, 90, 16, 0, 0, TAU); g.stroke(); g.fillStyle = rnd() < .5 ? '#7df9ff' : '#ffd23f'; g.globalAlpha = .8; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; g.fillRect(x0 + Math.cos(a) * 90 - 2, y + Math.sin(a) * 16 - 2, 4, 4); } g.globalAlpha = 1; }
      });
    } else if (id === 'starring') { // the orbital ring: deep space, the curve of the Earth and mirror panels
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#010106'; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 160; k++) { g.fillStyle = rnd() < .2 ? '#fff3c4' : '#ffffff'; g.globalAlpha = .2 + rnd() * .7; g.fillRect(rnd() * W, rnd() * H, 1.2 + rnd(), 1.2 + rnd()); }
        g.globalAlpha = .6; const eg = g.createRadialGradient(W * .5, H * 1.6, H * .9, W * .5, H * 1.6, H * 1.25); eg.addColorStop(0, '#0a3a7a'); eg.addColorStop(.85, '#1a6aff'); eg.addColorStop(1, 'rgba(125,249,255,0)'); g.fillStyle = eg; g.beginPath(); g.arc(W * .5, H * 1.6, H * 1.25, 0, TAU); g.fill();
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 140 + rnd() * 70) { const x = rnd() * (W - 90); g.fillStyle = '#121a2e'; g.fillRect(x, y, 86, 34); g.strokeStyle = 'rgba(255,243,196,.5)'; g.lineWidth = 1.5; g.strokeRect(x, y, 86, 34);
          g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 21.5, y); g.lineTo(x + k * 21.5, y + 34); g.stroke(); }
          g.strokeStyle = '#3a4460'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 43, y + 34); g.lineTo(x + 43, y + 60); g.stroke(); }
      });
    } else if (id === 'ruins') { // overgrown ruins: mossy stone blocks, roots and glowing carved circuits
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#050c06'; g.fillRect(0, 0, W, H);
        for (let y = 0; y < H; y += 44) for (let x = ((y / 44) % 2) * 32; x < W; x += 64) { g.fillStyle = rnd() < .5 ? '#0c160c' : '#0a120a'; g.fillRect(x + 2, y + 2, 60, 40); }
        g.strokeStyle = 'rgba(46,207,138,.18)'; g.lineWidth = 2; for (let k = 0; k < 14; k++) { let x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 4; j++) { if (j % 2) x += (rnd() - .5) * 80; else y += 30 + rnd() * 40; g.lineTo(x, y); } g.stroke(); g.fillStyle = 'rgba(255,210,63,.5)'; g.fillRect(x - 2, y - 2, 4, 4); }
      });
      this.near = this.strip(W, H, (g) => {
        for (let k = 0; k < 6; k++) { const x0 = rnd() * W; g.strokeStyle = '#1a2a12'; g.lineWidth = 6 + rnd() * 5; g.beginPath(); g.moveTo(x0, 0); for (let y = 0; y <= H; y += 50) g.lineTo(x0 + Math.sin(y * .015 + k * 2) * 40, y); g.stroke();
          for (let y = 30; y < H; y += 70) { g.fillStyle = rnd() < .3 ? '#7dff9a' : '#2a5a1a'; g.globalAlpha = .7; g.beginPath(); g.ellipse(x0 + Math.sin(y * .015 + k * 2) * 40 + 8, y, 7, 3.5, .5, 0, TAU); g.fill(); g.globalAlpha = 1; } }
      });
    } else if (id === 'origin') { // the first code: a pale void with black ink circuits and gold script
      this.far = this.strip(W, H, (g) => {
        const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#16161c'); sk.addColorStop(1, '#22202a'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(244,244,244,.08)'; g.lineWidth = 1; for (let k = 0; k < 10; k++) { const x = rnd() * W, y = rnd() * H, r = 30 + rnd() * 80; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, r * .6, 0, TAU); g.stroke(); }
        g.fillStyle = 'rgba(255,215,0,.22)'; g.font = '700 16px serif'; const GL = '天地生死陰陽始終一無'; for (let k = 0; k < 40; k++) g.fillText(GL[(rnd() * GL.length) | 0], rnd() * W, rnd() * H);
      });
      this.near = this.strip(W, H, (g) => {
        for (let k = 0; k < 5; k++) { let x = rnd() * W, y = 0; g.strokeStyle = 'rgba(244,244,244,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); while (y < H) { if (rnd() < .5) y += 40 + rnd() * 60; else x += (rnd() < .5 ? -1 : 1) * (20 + rnd() * 40); g.lineTo(x, y); } g.stroke();
          g.fillStyle = '#ffd700'; g.globalAlpha = .6; g.beginPath(); g.arc(x, Math.min(y, H), 3, 0, TAU); g.fill(); g.globalAlpha = 1; }
      });
    } else if (id === 'winter') { // snowy rooftops at night: snow drifts, chimneys and strings of lights
      this.far = this.strip(W, H, (g) => {
        const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#060a14'); sk.addColorStop(1, '#12243a'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
        for (let y = 40; y < H; y += 110) { g.fillStyle = '#0e1828'; g.fillRect(0, y, W, 50); g.fillStyle = '#e8f4ff'; g.globalAlpha = .55; g.fillRect(0, y - 4, W, 6); g.globalAlpha = 1;
          for (let x = 10 + rnd() * 40; x < W; x += 70 + rnd() * 40) { g.fillStyle = '#16243a'; g.fillRect(x, y - 22, 14, 22); g.fillStyle = '#e8f4ff'; g.fillRect(x - 2, y - 25, 18, 4); } }
        for (let k = 0; k < 120; k++) { g.globalAlpha = .3 + rnd() * .6; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(rnd() * W, rnd() * H, .8 + rnd() * 1.6, 0, TAU); g.fill(); } g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 20; y < H; y += 130 + rnd() * 60) { g.strokeStyle = '#1a2a3a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(W / 2, y + 22, W, y); g.stroke();
          for (let x = 14; x < W; x += 22) { const yy = y + 22 * (1 - Math.pow((x - W / 2) / (W / 2), 2)) * .9 + 4, c = ['#e02030', '#2ecf8a', '#ffd23f', '#3d8bff'][(x / 22 | 0) % 4]; g.fillStyle = c; g.globalAlpha = .9; g.beginPath(); g.arc(x, yy, 3, 0, TAU); g.fill(); g.globalAlpha = .2; g.beginPath(); g.arc(x, yy, 9, 0, TAU); g.fill(); g.globalAlpha = 1; } }
      });
    } else if (id === 'parade') { // the night parade: wet old-town street, paper lanterns on strings, shop curtains
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#0c0604'; g.fillRect(0, 0, W, H);
        for (let y = 0; y < H; y += 90) { g.fillStyle = '#160a06'; g.fillRect(0, y, W, 60); g.fillStyle = 'rgba(192,16,46,.25)'; for (let x = 0; x < W; x += 40) g.fillRect(x + 4, y + 8, 32, 26); } // shop fronts with noren curtains
        for (let k = 0; k < 60; k++) { g.globalAlpha = .15 + rnd() * .3; g.fillStyle = '#ff9a1a'; g.fillRect(rnd() * W, rnd() * H, 1.5, 6); } g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 30; y < H; y += 120 + rnd() * 60) { g.strokeStyle = '#2a1408'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(W / 2, y + 26, W, y); g.stroke();
          for (let x = 18; x < W; x += 34) { const yy = y + 26 * (1 - Math.pow((x - W / 2) / (W / 2), 2)) * .9 + 8; g.fillStyle = 'rgba(255,154,26,.18)'; g.beginPath(); g.arc(x, yy, 16, 0, TAU); g.fill(); g.fillStyle = rnd() < .2 ? '#c0102e' : '#ff7a1a'; g.beginPath(); g.ellipse(x, yy, 6, 8, 0, 0, TAU); g.fill(); g.fillStyle = '#2a0a00'; g.fillRect(x - 3, yy - 9, 6, 2); g.fillRect(x - 3, yy + 7, 6, 2); } }
      });
    } else if (id === 'hollow') { // the hollow moon: violet void, a cracked empty moon, floating torii
      this.far = this.strip(W, H, (g) => {
        const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#06030c'); sk.addColorStop(1, '#1a0618'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 90; k++) { g.globalAlpha = .2 + rnd() * .5; g.fillStyle = rnd() < .3 ? '#ff4a6a' : '#ffffff'; g.fillRect(rnd() * W, rnd() * H, 1.3, 1.3); }
        g.globalAlpha = .5; for (let k = 0; k < 3; k++) { const x = rnd() * W, y = rnd() * H, r = 30 + rnd() * 30; g.strokeStyle = '#ff4a6a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x - r * .4, y - r * .6); g.lineTo(x, y); g.lineTo(x + r * .3, y + r * .7); g.stroke(); }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 200 + rnd() * 80) { const x = 20 + rnd() * (W - 100), w = 60; g.fillStyle = 'rgba(122,16,40,.8)'; g.fillRect(x, y, w, 5); g.fillRect(x - 6, y - 5, w + 12, 4); g.fillRect(x + 8, y, 5, 40); g.fillRect(x + w - 13, y, 5, 40); }
      });
    } else if (id === 'apex') { // project genesis: a white-gold machine cathedral
      this.far = this.strip(W, H, (g) => {
        g.fillStyle = '#0c0904'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,215,0,.14)'; g.lineWidth = 1;
        for (let y = 0; y < H; y += 64) for (let x = 0; x < W; x += 64) { g.beginPath(); g.arc(x + 32, y + 32, 24, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x + 32, y + 4); g.lineTo(x + 32, y + 60); g.moveTo(x + 4, y + 32); g.lineTo(x + 60, y + 32); g.stroke(); }
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 130 + rnd() * 60) {
          g.fillStyle = '#1e1808'; g.fillRect(0, y, W, 10); g.fillStyle = '#ffd700'; for (let x = 6; x < W; x += 22) { g.globalAlpha = .55; g.fillRect(x, y + 3, 10, 4); } g.globalAlpha = 1;
          const x = 30 + rnd() * (W - 60), r = 14 + rnd() * 10; g.strokeStyle = 'rgba(255,243,196,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y + 60, r, 0, TAU); g.stroke(); g.fillStyle = 'rgba(255,215,0,.35)'; g.beginPath(); g.arc(x, y + 60, r * .4, 0, TAU); g.fill();
        }
      });
    } else if (id === 'void') { // null space: falling bits, broken mirror shards, red glitch bars
      this.far = this.strip(W, H, (g) => {
        g.font = '10px monospace';
        for (let x = 4; x < W; x += 13) { for (let y = rnd() * 50; y < H; y += 13) { if (rnd() < .5) continue; g.globalAlpha = .05 + rnd() * .16; g.fillStyle = rnd() < .12 ? '#ff0844' : '#f2f2f2'; g.fillText(rnd() < .5 ? '0' : '1', x, y); } }
        g.globalAlpha = 1;
      });
      this.near = this.strip(W, H, (g) => {
        for (let y = 0; y < H; y += 80 + rnd() * 90) {
          const x0 = rnd() * W, s = 24 + rnd() * 50; g.strokeStyle = 'rgba(242,242,242,.32)'; g.lineWidth = 1.2; g.fillStyle = 'rgba(242,242,242,.035)';
          g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + s, y + s * .4); g.lineTo(x0 + s * .3, y + s * 1.2); g.closePath(); g.fill(); g.stroke();
          if (rnd() < .6) { g.fillStyle = 'rgba(255,8,68,.35)'; g.fillRect(rnd() * W, y + rnd() * 40, 20 + rnd() * 70, 2 + rnd() * 3); }
        }
      });
    } else { // core: circuit columns
      this.far = this.strip(W, H, (g) => {
        g.strokeStyle = '#ff0844'; g.lineWidth = 1;
        for (let x = 8; x < W; x += 24) {
          g.globalAlpha = .12 + rnd() * .2; g.beginPath(); let y = 0, xx = x; g.moveTo(xx, 0);
          while (y < H) { y += 20 + rnd() * 60; if (rnd() < .4) xx += (rnd() < .5 ? -8 : 8); g.lineTo(xx, y); }
          g.stroke(); g.fillStyle = '#ff0844'; g.fillRect(xx - 2, y - 2, 4, 4);
        }
        g.globalAlpha = 1;
      });
      this.near = null;
    }
  },
  update(rd, mul) {
    this.t += rd; const sp = this.T.speed * mul; this.scroll += sp * rd;
    if (this.flash > 0) this.flash -= rd * 3;
    if (this.T.rain || this.theme === 'maglev') {
      this.boltT -= rd;
      if (this.boltT <= 0 && this.T.rain >= 1) { // lightning in the side sky
        this.boltT = this.T.storm ? 2.2 + rnd() * 3.5 : 6 + rnd() * 9; this.flash = 1; const side = rnd() < .5, x0 = side ? V.L0 * rnd() : V.R0 + (V.VW - V.R0) * rnd();
        for (let i = 0; i < 4; i++) { this.bolt[i * 2] = x0 + (rnd() - .5) * 40 * i; this.bolt[i * 2 + 1] = i * V.VH * .12; }
      }
    }
  },
  drawSide(img, speedK, alpha, flip) {
    if (!img) return;
    const H = img.height, w = img.width, off = (this.scroll * speedK) % H;
    cx.globalAlpha = alpha;
    for (let side = 0; side < 2; side++) {
      const x0 = side ? V.R0 + 6 : 0, x1 = side ? V.VW : V.L0 - 6; if (x1 - x0 <= 0) continue;
      cx.save(); cx.beginPath(); cx.rect(x0, 0, x1 - x0, V.VH); cx.clip();
      for (let x = side ? x0 : x1 - w; side ? x < x1 : x > x0 - w; x += side ? w : -w)
        for (let y = off - H; y < V.VH; y += H) cx.drawImage(img, x, y);
      cx.restore();
    }
    cx.globalAlpha = 1;
  },
  draw(arena) {
    const T = this.T, VW = V.VW, VH = V.VH;
    if (this.gk !== this.theme + VH) { this.gk = this.theme + VH; this.grad = cx.createLinearGradient(0, 0, 0, VH); this.grad.addColorStop(0, T.sky1); this.grad.addColorStop(1, T.sky2); }
    cx.fillStyle = this.grad; // sky only shows beside the roof, so paint just the side strips
    if (arena) { cx.fillRect(-60, -60, V.L - 16 + 60, VH + 120); cx.fillRect(V.R + 16, -60, VW - V.R - 16 + 60, VH + 120); }
    else cx.fillRect(0, 0, VW, VH);
    if (this.flash > 0 && T.rain) { cx.fillStyle = 'rgba(180,200,255,' + (this.flash * .25).toFixed(3) + ')'; cx.fillRect(0, 0, VW, VH); }
    this.drawSide(this.far, .25, .9);
    if (this.flash > .4 && T.rain) { cx.strokeStyle = '#e8f2ff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(this.bolt[0], this.bolt[1]); for (let i = 1; i < 4; i++) cx.lineTo(this.bolt[i * 2], this.bolt[i * 2 + 1]); cx.stroke(); }
    this.drawSide(this.near, .6, 1);
    if (!arena) return;
    const L = V.L, RX = V.R, sc = this.scroll;
    // track bed with sleepers just outside the rails
    cx.fillStyle = '#05060c'; cx.fillRect(L - 16, 0, 16, VH); cx.fillRect(RX, 0, 16, VH);
    cx.fillStyle = 'rgba(255,255,255,.07)';
    for (let y = -(sc * 1.4 % 22); y < VH; y += 22) { cx.fillRect(L - 15, y, 14, 5); cx.fillRect(RX + 1, y, 14, 5); }
    // roof
    cx.fillStyle = T.roof; cx.fillRect(L, 0, RX - L, VH);
    cx.fillStyle = T.roof2; cx.fillRect(L + (RX - L) * .32, 0, (RX - L) * .36, VH);
    if (T.grid) {
      const pulse = .5 + .5 * Math.sin(this.t * 3);
      cx.strokeStyle = T.seam; cx.lineWidth = 1; cx.beginPath();
      for (let x = L + 20; x < RX; x += 34) { cx.moveTo(x, 0); cx.lineTo(x, VH); }
      for (let y = (this.t * 40) % 34; y < VH; y += 34) { cx.moveTo(L, y); cx.lineTo(RX, y); }
      cx.stroke(); glow(V.CX, VH * .22, 100, '#ff0844', .1 + pulse * .08);
      if (T.glitchy && Math.sin(this.t * 5.3) > .9) { cx.fillStyle = 'rgba(255,8,68,.22)'; cx.fillRect(L, (this.t * 337) % VH, RX - L, 3); cx.fillStyle = 'rgba(242,242,242,.12)'; cx.fillRect(L, (this.t * 211 + 90) % VH, RX - L, 2); }
    } else {
      cx.strokeStyle = T.seam; cx.lineWidth = 2; cx.beginPath();
      for (let y = sc % 96 - 96; y < VH; y += 96) { cx.moveTo(L, y); cx.lineTo(RX, y); }
      cx.moveTo(L + (RX - L) * .32, 0); cx.lineTo(L + (RX - L) * .32, VH); cx.moveTo(L + (RX - L) * .68, 0); cx.lineTo(L + (RX - L) * .68, VH);
      cx.stroke();
      cx.fillStyle = 'rgba(255,255,255,.08)';
      for (let y = sc % 96 - 96; y < VH; y += 96) { cx.fillRect(L + 8, y + 6, 3, 3); cx.fillRect(RX - 11, y + 6, 3, 3); cx.fillRect(L + 8, y + 86, 3, 3); cx.fillRect(RX - 11, y + 86, 3, 3); }
      if (T.dojo) { cx.fillStyle = 'rgba(255,200,120,.05)'; for (let x = L + 14; x < RX; x += 28) cx.fillRect(x, 0, 1, VH); } // floor planks
      if (this.theme === 'undercity') { // crosswalk stripes
        cx.fillStyle = 'rgba(255,255,255,.05)';
        for (let y = sc % 300 - 300; y < VH; y += 300) for (let x = L + 14; x < RX - 20; x += 30) cx.fillRect(x, y, 16, 46);
      }
    }
    // glowing rails
    cx.fillStyle = T.rail; cx.fillRect(L - 3, 0, 3, VH); cx.fillRect(RX, 0, 3, VH);
    if (Q.glow) {
      cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .35;
      cx.drawImage(glowSpr(T.rail), L - 14, -40, 26, VH + 80); cx.drawImage(glowSpr(T.rail), RX - 11, -40, 26, VH + 80);
      cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
    }
  },
  rain(dt) {
    if (!this.T.rain || !Q.rain || CALM) return;
    const n = (48 * this.T.rain * Q.rain) | 0, VW = V.VW, VH = V.VH;
    cx.strokeStyle = 'rgba(160,220,255,.22)'; cx.lineWidth = 1.2; cx.beginPath();
    for (let i = 0; i < n; i++) {
      let x = this.rainX[i], y = this.rainY[i];
      if (y === 0 && x === 0) { x = rnd() * VW; y = rnd() * VH; }
      y += 900 * dt; x -= 90 * dt; if (y > VH) { y = -20; x = rnd() * VW; } if (x < 0) x += VW;
      this.rainX[i] = x; this.rainY[i] = y; cx.moveTo(x, y); cx.lineTo(x - 3, y + 16);
    }
    cx.stroke();
  }
};
