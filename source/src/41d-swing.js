/* =====================================================================
   SWING ANIMATIONS — every weapon moves its own way when you dash.
   Purely visual (render clock only, no simulation state): a swing starts
   when P.seq changes and plays a short keyframed motion per weapon:
     katana    wide sweeping cut, alternating left / right each dash
     muramasa  a double "X" cut, out and back
     hammer    overhead wind-up, a heavy smash with a shockwave
     spear     pull back, a long piercing thrust, retract
     kunai     a quick backhand flick
     daggers   a three-stab flurry, alternating hands
   monarch   a scissor cut: both fangs spread, then snap across
     whip      a lash: the chain rolls out as a wave and cracks
     scythe    a full reaping spin of the whole body
     fists     a jab-cross, the arms really extend
     dominator a cut that ends in a shot with recoil
   nodachi   a far wind-up, then a full circle sweep that turns the body
   chakram   a quick forward throw (the ring itself flies, see 41e)
   tessen    the fan snaps open and sweeps a wide wedge
   A smear (anime-style motion blur crescent) follows the real swept arc
   in the hero's own frame, so it hugs the hero instead of streaking off.
   ===================================================================== */
const SW_DUR = { nodachi: .62, chakram: .3, tessen: .42, katana: .34, muramasa: .46, hammer: .56, spear: .38, kunai: .26, daggers: .42, monarch: .42, whip: .5, scythe: .55, fists: .36, dominator: .4 };
const SW_COL = { nodachi: '#9fe8ff', chakram: '#ff4fd8', tessen: '#bff3ff', katana: '#e8fbff', muramasa: '#ff0844', hammer: '#ffb347', scythe: '#b537f2', kunai: '#c9d6ff', spear: '#7df9ff', fists: '#ffd23f', monarch: '#9b5bff', dominator: '#ff9a3d' };
function eo(u) { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u) * (1 - u); } // ease out
function ei(u) { u = Math.max(0, Math.min(1, u)); return u * u * u; } // ease in
function seg(u, a, b) { return Math.max(0, Math.min(1, (u - a) / (b - a))); }
function swState() { return { seq: -1, w: 'katana', t0: -9, a: 0, d: 1, ev: 0, n: 0, ha: new Float32Array(12), hr: new Float32Array(12), ht: new Float32Array(12), out: { on: false, u: 0, a: 0, r: 1, face: 0, sx: 1, sy: 1, a2: null, r2: 1, p1: 0, p2: 0, lash: -1, mix: 1 } }; }
const SWP = swState(), SWV = swState(); // the player's swing and the Arsenal preview's
const SWING = {
  start(s, w, a, now) { s.w = w; s.t0 = now; s.a = a; s.d = -s.d || 1; s.ev = 0; s.n = 0; },
  /* fills s.out with the pose at time `now`; returns false once the swing is over */
  pose(s, now, idleA) {
    const o = s.out, dur = SW_DUR[s.w] || .34, u = (now - s.t0) / dur;
    o.on = u >= 0 && u < 1; if (!o.on) { s.n = 0; return false; }
    const a = s.a, d = s.d; o.u = u; o.r = 1; o.face = 0; o.sx = o.sy = 1; o.a2 = null; o.r2 = 1; o.p1 = o.p2 = 0; o.lash = -1; o.fan = 0;
    let off = 0;
    switch (s.w) {
      case 'katana': off = d * (-2.2 + 4.1 * eo(u / .42)) - d * .35 * seg(u, .42, .7); o.r = 1 + .1 * Math.sin(Math.PI * seg(u, 0, .42)); o.face = off * .25; o.sx = 1 + .15 * (1 - seg(u, 0, .4)); break;
      case 'muramasa': off = u < .45 ? d * (-2.1 + 4.0 * eo(u / .45)) : d * (1.9 - 3.6 * eo(seg(u, .45, .85))); o.r = 1.06; o.face = off * .22; break;
      case 'hammer': {
        const w1 = seg(u, 0, .3), sm = seg(u, .3, .44);
        off = sm <= 0 ? -d * 2.7 * eo(w1) : -d * 2.7 + d * 2.85 * ei(sm);
        o.r = sm <= 0 ? 1 - .22 * eo(w1) : .78 + .4 * sm; if (u > .44) o.r = 1.18 - .18 * seg(u, .44, 1);
        o.face = off * .3; if (sm <= 0) { o.sx = 1 - .12 * w1; o.sy = 1 + .14 * w1; } else if (u < .62) { const k = 1 - seg(u, .44, .62); o.sx = 1 + .28 * k; o.sy = 1 - .22 * k; }
        break; }
      case 'spear': { const pb = seg(u, 0, .16), th = seg(u, .16, .36), rt = seg(u, .5, 1);
        off = d * .12 * Math.sin(u * 9); o.r = pb < 1 ? 1 - .28 * eo(pb) : th < 1 ? .72 + .78 * eo(th) : 1.5 - .5 * eo(rt);
        o.sx = th > 0 && th < 1 ? 1.25 : 1; o.sy = th > 0 && th < 1 ? .85 : 1; break; }
      case 'kunai': off = d * (-1.4 + 2.5 * eo(u / .5)); o.r = 1.12; o.face = off * .3; break;
      case 'monarch': { const sp = eo(seg(u, 0, .35)), cr = eo(seg(u, .35, .6)); // a scissor cut: both fangs spread wide, then snap across each other
        off = d * (1.3 * sp - 1.9 * cr); o.a2 = a - d * (1.3 * sp - 1.9 * cr); o.r = o.r2 = 1 + .35 * Math.sin(Math.PI * seg(u, .3, .7)); o.face = d * .2 * Math.sin(Math.PI * u); break; }
      case 'daggers': { const k = Math.min(2, (u * 3) | 0), lu = u * 3 - k, st = Math.sin(Math.PI * lu);
        if (k % 2 === 0) { off = d * (k ? -.35 : .35) + st * d * .15; o.r = 1 + .5 * st; o.a2 = a - d * .9; o.r2 = .9; }
        else { off = d * .7; o.r = .9; o.a2 = a - d * .15 * st; o.r2 = 1 + .7 * st; }
        o.face = (k % 2 ? -.25 : .25) * d * st; break; }
      case 'whip': off = d * (-2.5 + 3.9 * eo(u / .55)); o.r = u < .55 ? .6 + .7 * ei(u / .55) : 1.3 - .3 * seg(u, .55, 1); o.lash = u; o.face = off * .25; break;
      case 'scythe': { const sp = eo(u / .82); off = d * (-1.2 + (TAU + 1.6) * sp); o.r = 1.08; o.face = d * TAU * sp; o.sx = 1 + .12 * Math.sin(Math.PI * u); break; }
      case 'fists': o.p1 = Math.sin(Math.PI * seg(u, 0, .45)); o.p2 = Math.sin(Math.PI * seg(u, .38, .86)); o.face = d * (.3 * o.p1 - .35 * o.p2); off = 0; o.sx = 1 + .12 * (o.p1 + o.p2); break;
      case 'dominator': { const fr = seg(u, .42, .56);
        off = u < .42 ? d * (-1.6 + 2.6 * eo(u / .42)) : d * (1.0 - .4 * eo(seg(u, .42, .8))); o.r = u < .42 ? 1 : fr < 1 ? 1 - .2 * Math.sin(Math.PI * fr) : 1;
        if (fr > 0 && fr < 1) off -= d * .35 * Math.sin(Math.PI * fr); o.face = off * .2; break; }
      case 'nodachi': { const w1 = seg(u, 0, .24), sw = seg(u, .24, .58); // wind up far back, then a full circle sweep that drags the body round
        off = sw <= 0 ? -d * 2.4 * eo(w1) : -d * 2.4 + d * (TAU + .3) * eo(sw); o.r = 1.05 + .1 * Math.sin(Math.PI * sw); o.face = sw <= 0 ? -d * .5 * w1 : d * (TAU * .55) * eo(sw) - d * .5;
        if (sw <= 0) { o.sx = 1 - .1 * w1; o.sy = 1 + .1 * w1; } break; }
      case 'chakram': { const th = seg(u, 0, .35); off = d * (-1.1 + 1.5 * eo(th)); o.r = 1 + .45 * Math.sin(Math.PI * th); o.face = off * .25; o.sx = 1 + .1 * Math.sin(Math.PI * th); break; }
      case 'tessen': { const op = seg(u, 0, .18), sw = seg(u, .12, .55); off = d * (-1.5 + 2.8 * eo(sw)); o.fan = eo(op) * (1 - seg(u, .8, 1)); o.r = 1; o.face = off * .3; break; }
      default: off = SW4[s.w] ? SW4[s.w](o, u, d) : d * (-2 + 3.8 * eo(u / .45));
    }
    o.a = a + off;
    const mx = s.w === 'scythe' ? 1 - seg(u, .88, 1) : 1 - seg(u, .72, 1); o.mix = mx; // blend back into the idle stance at the end
    if (mx < 1 && idleA != null) { o.a = idleA + angDiff(o.a, idleA) * mx; o.face *= mx; o.r = 1 + (o.r - 1) * mx; }
    return true;
  },
  /* one-off beats inside a swing: hammer impact, whip crack, dominator shot, scythe whoosh */
  beats(s, x, y, bl, quiet) {
    if (CALM) return; const o = s.out, u = o.u, tx = x + Math.cos(o.a) * bl * o.r, ty = y + Math.sin(o.a) * bl * o.r;
    if (s.w === 'hammer' && u >= .44 && !(s.ev & 1)) { s.ev |= 1; FX.ring(tx, ty, 58, 'rgba(255,179,71,.9)', 6); FX.ring(tx, ty, 32, '#ffffff', 3); for (let k = 0; k < 5; k++) { const b = o.a + (k - 2) * .7; FX.decal(tx, ty, tx + Math.cos(b) * 26, ty + Math.sin(b) * 26, '#ffb347', 2); } FX.spark(tx, ty, '#ffd23f', 8); if (!quiet) { shake(.12); Aud.wbeat('hammer', 0); } }
    if (s.w === 'whip' && u >= .55 && !(s.ev & 1)) { s.ev |= 1; FX.ring(tx, ty, 26, '#ffffff', 3); FX.spark(tx, ty, '#ffffff', 6); for (let k = 0; k < 6; k++) WFX.line(tx, ty, k * TAU / 6, 18, '#ffffff', 1.6, 7); if (!quiet) Aud.wbeat('whip', 0); }
    if (s.w === 'dominator' && u >= .42 && !(s.ev & 1)) { s.ev |= 1; glow(tx, ty, 40, '#ff9a3d', .9); FX.spark(tx, ty, '#ffd23f', 8); WFX.line(tx + Math.cos(o.a) * 20, ty + Math.sin(o.a) * 20, o.a, 60, '#fff3c4', 5, 8); for (let k = 0; k < 2; k++) WFX.chip(x, y, o.a + 1.6 + (rnd() - .5) * .6, 150, '#ffd23f', 3.4, 1.6); if (!quiet) Aud.wbeat('dominator', 0); }
    if (s.w === 'spear' && u >= .2 && !(s.ev & 1)) { s.ev |= 1; WFX.line(tx, ty, o.a, 90, '#7df9ff', 2.4, 6); FX.ring(tx, ty, 18, '#7df9ff', 2); if (!quiet) Aud.wbeat('spear', 0); }
    if (s.w === 'monarch' && u >= .5 && !(s.ev & 1)) { s.ev |= 1; const L = bl * .75 * o.r; FX.spark(x + Math.cos(s.a) * L, y + Math.sin(s.a) * L, '#c9a8ff', 7); FX.ring(x + Math.cos(s.a) * L, y + Math.sin(s.a) * L, 22, '#9b5bff', 3); if (!quiet) Aud.wbeat('monarch', 0); }
    if (s.w === 'daggers') { const k = Math.min(2, (u * 3) | 0); if (!(s.ev & (2 << k)) && u * 3 - k > .45) { s.ev |= 2 << k; const aa = k % 2 ? o.a2 : o.a, rr = k % 2 ? o.r2 : o.r; FX.spark(x + Math.cos(aa) * bl * .7 * rr, y + Math.sin(aa) * bl * .7 * rr, '#ffffff', 3); if (!quiet) Aud.wbeat('daggers', k); } }
    if (s.w === 'fists') for (let k = 0; k < 2; k++) { const p = k ? o.p2 : o.p1; if (p > .9 && !(s.ev & (2 << k))) { s.ev |= 2 << k; const aa = o.a + (k ? -.18 : .18) * s.d, L = bl * .62; FX.ring(x + Math.cos(aa) * L, y + Math.sin(aa) * L, 20, '#ffd23f', 3); if (!quiet) Aud.wbeat('fists', k); } }
    if (s.w === 'scythe' && u >= .3 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat('scythe', 0); }
    if (s.w === 'nodachi' && u >= .36 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat('nodachi', 0); FX.ring(x, y, bl * 1.15, '#9fe8ff', 3); }
    if (s.w === 'tessen' && u >= .1 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat('tessen', 0); for (let k = -1; k <= 1; k++) WFX.line(x + Math.cos(o.a + k * .4) * bl * .9, y + Math.sin(o.a + k * .4) * bl * .9, o.a + k * .4 + 1.57, 26, '#bff3ff', 1.6, 6); }
    if (s.w === 'chakram' && u >= .15 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat('chakram', 0); }
    if ((s.w === 'katana' || s.w === 'muramasa') && u >= .3 && !(s.ev & 1)) { s.ev |= 1; if (!quiet) Aud.wbeat(s.w, 0); }
    if (SW4[s.w]) sw4Beat(s, o, u, x, y, tx, ty, bl, quiet);
  },
  /* record the swept arc (hero-relative) for the smear */
  rec(s, now) {
    const o = s.out; if (!o.on) return;
    for (let i = Math.min(11, s.n); i > 0; i--) { s.ha[i] = s.ha[i - 1]; s.hr[i] = s.hr[i - 1]; s.ht[i] = s.ht[i - 1]; }
    s.ha[0] = o.a; s.hr[0] = o.r; s.ht[0] = now; s.n = Math.min(12, s.n + 1);
  },
  /* the smear crescent, drawn under the hero; bl = blade length, col = the weapon's color */
  smear(s, x, y, bl, col, now) {
    if (CALM || s.n < 2 || !s.out.on) return; const w = s.w, o = s.out;
    const age = w === 'nodachi' ? .14 : .11, W = w === 'scythe' || w === 'hammer' ? 1.15 : 1;
    cx.save(); cx.translate(x, y); cx.globalCompositeOperation = 'lighter';
    if (w === 'spear' || w === 'drill') { // a thrust: a bright streak along the shaft instead of an arc
      const ext = Math.max(0, o.r - 1); if (ext > .05) { const L = bl * 1.22 * o.r, c = Math.cos(o.a), sn = Math.sin(o.a);
        for (let k = 0; k < 3; k++) { const px = -sn * (k - 1) * 6, py = c * (k - 1) * 6; cx.globalAlpha = Math.min(1, ext * 2) * (k === 1 ? .9 : .4); cx.strokeStyle = k === 1 ? '#ffffff' : col; cx.lineWidth = k === 1 ? 3 : 2; cx.beginPath(); cx.moveTo(px + c * L * .3, py + sn * L * .3); cx.lineTo(px + c * L, py + sn * L); cx.stroke(); } }
      cx.restore(); return;
    }
    if (w === 'fists') { // punch streaks behind each extended fist
      for (let k = 0; k < 2; k++) { const p = k ? o.p2 : o.p1; if (p < .3) continue; const aa = o.a + (k ? -.18 : .18) * s.d, c = Math.cos(aa), sn = Math.sin(aa), L = bl * (.28 + .4 * p);
        for (let j = -1; j <= 1; j++) { cx.globalAlpha = p * (j ? .35 : .7); cx.strokeStyle = j ? col : '#ffffff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(c * L * .2 - sn * j * 6, sn * L * .2 + c * j * 6); cx.lineTo(c * L - sn * j * 6, sn * L + c * j * 6); cx.stroke(); } }
      cx.restore(); return;
    }
    let m = 0; while (m < s.n && now - s.ht[m] < age) m++; m = Math.max(2, Math.min(s.n, m));
    const r4 = SW4R[w], rin = r4 ? r4[0] : w === 'whip' ? .55 : w === 'scythe' || w === 'nodachi' ? .62 : w === 'hammer' ? .7 : w === 'tessen' ? .2 : .38, rout = r4 ? r4[1] : w === 'spear' ? 1.22 : w === 'whip' ? 1.05 : w === 'nodachi' ? 1.18 : w === 'tessen' ? .75 : 1;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < m - 1; i++) { // one quad per step: bright at the blade, fading behind
        const a0 = s.ha[i], a1 = s.ha[i + 1], r0 = bl * s.hr[i] * rout * W + (pass ? 0 : 6), r1 = bl * s.hr[i + 1] * rout * W + (pass ? 0 : 6), k = 1 - i / (m - 1);
        const i0 = r0 * (pass ? (1 - (1 - rin) * .45) : rin), i1 = r1 * (pass ? (1 - (1 - rin) * .45) : rin);
        cx.globalAlpha = (pass ? .75 : .38) * k * Math.min(1, (1 - o.u) * 3);
        cx.fillStyle = pass ? '#ffffff' : col;
        const da = angDiff(a1, a0), ro = (r0 + r1) / 2, ri = (i0 + i1) / 2; // a true annular sector, so fast swings stay smooth
        cx.beginPath(); cx.arc(0, 0, ro, a0, a0 + da, da < 0); cx.arc(0, 0, ri, a0 + da, a0, da > 0); cx.closePath(); cx.fill();
      }
    }
    if (w === 'monarch' && m > 3) { cx.strokeStyle = '#c9a8ff'; cx.lineWidth = 1.4; cx.globalAlpha = .8; cx.beginPath(); for (let i = 0; i < m; i++) { const r = bl * s.hr[i] * (.8 + rnd() * .2); i ? cx.lineTo(Math.cos(s.ha[i]) * r, Math.sin(s.ha[i]) * r) : cx.moveTo(Math.cos(s.ha[i]) * r, Math.sin(s.ha[i]) * r); } cx.stroke(); }
    if (w === 'muramasa' && m > 2) { cx.globalAlpha = .5; cx.fillStyle = '#3a0610'; for (let i = 0; i < m; i += 2) dot(Math.cos(s.ha[i]) * bl * s.hr[i] * .8, Math.sin(s.ha[i]) * bl * s.hr[i] * .8, 2.2); }
    cx.restore();
  },
  /* apply the pose to a hero parameter object */
  apply(s, ho) {
    const o = s.out; ho.hk = 1 + Math.max(-.3, o.r - 1) * 1.2; ho.blade = o.a; ho.bl = ho.bl * o.r + HAND_R * (ho.hk - 1); ho.face += o.face; ho.sx *= o.sx; ho.sy *= o.sy; ho.swa2 = o.a2; ho.swr2 = o.r2; ho.p1 = o.p1; ho.p2 = o.p2; ho.lash = o.lash; ho.fan = o.fan || 0; ho.swd = s.d; ho.swing = 1;
  },
  reset(ho) { ho.hk = 1; ho.swa2 = null; ho.swr2 = 1; ho.p1 = ho.p2 = 0; ho.lash = -1; ho.swing = 0; }
};
