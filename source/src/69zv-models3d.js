/* =====================================================================
   MODELS 3D (v32) — real 3D bodies for the 3D view (render only).
   Every enemy is built in its own frame (forward = where it faces) from
   the GL3D meshes, with walking legs, eyes, weapons and glowing accents
   in its own color. The roof things are 3D too: turrets that turn and
   fire, data nodes, terminals, fuel barrels, mines, shards, pickups,
   coins and the escort drone; their 2D bodies are skipped in 3D and only
   their roof marks (rings, progress, health bars) stay on the roof.
   The simulation is untouched: this only reads positions and states.
   ===================================================================== */
const EM = {
  x: 0, y: 0, z0: 0, an: 0, cf: 1, sf: 0,
  set(x, y, an, z0) { this.x = x; this.y = y; this.an = an; this.cf = Math.cos(an); this.sf = Math.sin(an); this.z0 = z0 || 0; },
  px(f, s) { return this.x + this.cf * f - this.sf * s; }, py(f, s) { return this.y + this.sf * f + this.cf * s; },
  add(m, f, s, z, yaw, sx, sy, sz, col, em, pitch) { GL3D.add(m, this.px(f, s), this.py(f, s), this.z0 + z, this.an + (yaw || 0), sx, sy, sz, col, em || 0, 0, pitch); },
  seg(f0, s0, z0, f1, s1, z1, w, col, em, m) { GL3D.seg(this.px(f0, s0), this.py(f0, s0), this.z0 + z0, this.px(f1, s1), this.py(f1, s1), this.z0 + z1, w, col, em || 0, m); },
  glow(f, s, z, r, col, a, ring) { GL3D.glow(this.px(f, s), this.py(f, s), this.z0 + z, r, col, a, ring); },
  leg(f0, s0, z0, f1, s1, knee, w, col) { const fm = f0 + (f1 - f0) * .45, sm = s0 + (s1 - s0) * .6; this.seg(f0, s0, z0, fm, sm, knee, w, col); this.seg(fm, sm, knee, f1, s1, 0, w * .8, col); },
  shadow(r, k) { GL3D.add('cyl', this.x + r * .3, this.y + r * .45, .12, 0, r * 2.3 * (k || 1), r * 1.5 * (k || 1), .2, [.01, .01, .03], 0, 0); },
  /* a small figure: two legs, a torso, a head with a visor, arms; blade: a glowing sword in the right hand */
  figure(r, t, moving, body, dark, acc, blade) {
    const g = moving ? Math.sin(t * 12) * r * .35 : 0, H = r * 2.4;
    for (const sd of [-1, 1]) this.leg(0, sd * r * .25, H * .42, g * sd, sd * r * .32, H * .25, r * .26, dark);
    this.add('box', 0, 0, H * .4, 0, r * .55, r * .8, H * .32, body, 0); this.add('box', r * .28, 0, H * .58, 0, r * .05, r * .5, H * .08, acc, .9);
    this.add('ball', 0, 0, H * .7, 0, r * .62, r * .62, r * .62, dark, 0); this.add('box', r * .26, 0, H * .79, 0, r * .12, r * .44, r * .1, acc, 1); this.glow(r * .34, 0, H * .8, r * .4, acc, .5);
    for (const sd of [-1, 1]) { const hf = sd > 0 ? r * .55 : r * .1; this.seg(0, sd * r * .48, H * .68, hf, sd * r * .62, H * .44, r * .2, dark); }
    if (blade) { const a = .5 + Math.sin(t * 3) * .3; this.seg(r * .55, r * .62, H * .44, r * .55 + Math.cos(a) * r * 2.2, r * .62 + Math.sin(a) * r * .6, H * .5 + Math.sin(a) * r * 1.2, r * .12, blade, 1); }
  }
};
const shadeC = (c, k, add) => [Math.min(1, c[0] * k + (add || 0)), Math.min(1, c[1] * k + (add || 0)), Math.min(1, c[2] * k + (add || 0))];
const whiten = (c, k) => [c[0] + (1 - c[0]) * k, c[1] + (1 - c[1]) * k, c[2] + (1 - c[2]) * k];
/* one model per enemy type: (e, r, c = its color, body, dark, t, mv = moving, bob) */
const EMODEL = {};
{
  const T = ET, R3 = [1, .15, .3], WH = [1, 1, 1];
  const drone = (e, r, c, body, dark, t, mv, bob) => { const z = r * .6 + bob; // a six-legged crawler with one red eye
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { const ph = Math.sin(t * 16 + i * 2.1 + sd) * r * .25 * (mv ? 1 : .2); EM.leg((i - 1) * r * .45, sd * r * .45, z, (i - 1) * r * .85 + ph, sd * r * 1.35, z + r * .55, 2.2, dark); }
    EM.add('sph', 0, 0, z - r * .35, 0, r * 1.5, r * 1.25, r * .85, body, .05); EM.add('sph', -r * .15, 0, z + r * .05, 0, r * 1, r * .95, r * .55, dark, 0);
    EM.add('ball', r * .55, 0, z - r * .1, 0, r * .45, r * .45, r * .45, R3, 1); EM.glow(r * .75, 0, z + r * .1, r * .55, R3, .7);
    for (const sd of [-1, 1]) { EM.seg(r * .2, sd * r * .2, z + r * .4, r * .75, sd * r * .45, z + r * 1.1, 1.2, dark); EM.glow(r * .75, sd * r * .45, z + r * 1.1, 3, c, .9); }
    EM.add('box', -r * .2, 0, z + r * .38, 0, r * .9, r * .12, r * .08, c, .8); };
  EMODEL[T.DRONE] = drone; EMODEL[T.MINI] = drone;
  EMODEL[T.SNIPER] = (e, r, c, body, dark, t, mv) => { const hz = r * 1.3, aim = e.st === 1; // a tripod with a long rifle; the scope burns while it aims
    for (const a of [Math.PI, Math.PI * .35, -Math.PI * .35]) EM.seg(0, 0, hz, Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25, 0, 2.6, dark);
    EM.add('frustum', 0, 0, hz - r * .2, 0, r * 1.3, r * 1.3, r * .75, body, .05); EM.add('ball', 0, 0, hz + r * .45, 0, r * .85, r * .85, r * .75, dark, 0);
    EM.add('box', r * .38, 0, hz + r * .75, 0, r * .1, r * .55, r * .14, c, 1);
    EM.seg(r * .1, r * .35, hz + r * .55, r * 2.6, r * .35, hz + r * .55, 3.2, [.16, .1, .06], 0); EM.add('box', r * .9, r * .35, hz + r * .72, 0, r * .7, 3, 3, [.3, .3, .35], 0);
    EM.add('ball', r * 2.6, r * .35, hz + r * .45, 0, 4, 4, 4, aim ? [1, .8, .3] : c, aim ? 1 : .5); EM.glow(r * 2.7, r * .35, hz + r * .55, aim ? r * .9 : r * .4, [1, .55, .15], aim ? .9 : .35); };
  const heavy = (e, r, c, body, dark, t, mv, big) => { const H = r * 1.8, g = mv ? Math.sin(t * 7) * r * .3 : 0, acc = big ? [1, .15, .2] : c; // an armored walker; the brute blocks from the front
    for (const sd of [-1, 1]) { EM.seg(0, sd * r * .42, H * .5, g * sd, sd * r * .5, 0, r * .4, dark); EM.add('box', g * sd + r * .12, sd * r * .5, 0, 0, r * .6, r * .42, r * .22, body, 0); }
    EM.add('hex', 0, 0, H * .42, Math.PI / 6, r * 1.55, r * 1.45, H * .42, body, .04); EM.add('hex', 0, 0, H * .84, Math.PI / 6, r * 1.2, r * 1.1, H * .1, dark, 0);
    EM.add('box', 0, 0, H * .94, 0, r * .7, r * .7, r * .42, dark, 0); EM.add('box', r * .36, 0, H * .94 + r * .14, 0, r * .06, r * .5, r * .12, acc, 1); EM.glow(r * .4, 0, H + r * .2, r * .5, acc, .5);
    for (const sd of [-1, 1]) { EM.add('sph', 0, sd * r * .85, H * .72, 0, r * .62, r * .55, r * .5, shadeC(body, 1.2), 0); EM.seg(r * .1, sd * r * .95, H * .78, r * .55, sd * r * 1.05, H * .38, r * .28, dark); EM.add('ball', r * .55, sd * r * 1.05, H * .26, 0, r * .42, r * .42, r * .42, body, 0); }
    if (!big) { EM.add('box', r * .92, 0, H * .22, 0, r * .18, r * 1.35, H * .62, shadeC(c, .55), .25); EM.add('box', r * 1.02, 0, H * .5, 0, r * .04, r * 1.1, r * .08, c, .9); } // the front shield
    else { for (const sd of [-1, 1]) { EM.seg(-r * .1, sd * r * .9, H * 1.02, r * .9, sd * r * .9, H * 1.02, r * .24, [.2, .22, .3]); EM.glow(r * .95, sd * r * .9, H * 1.02, r * .3, acc, .6); } EM.glow(-r * .8, 0, H * .7, r * .7, c, .45); EM.add('cyl', -r * .75, 0, H * .55, 0, r * .45, r * .45, r * .45, c, .7); }
  };
  EMODEL[T.BRUTE] = (e, r, c, body, dark, t, mv) => heavy(e, r, c, body, dark, t, mv, false);
  EMODEL[T.ENFORCER] = (e, r, c, body, dark, t, mv) => heavy(e, r, c, body, dark, t, mv, true);
  EMODEL[T.BOMBER] = (e, r, c, body, dark, t, mv, bob) => { const lit = e.fuse > 0 && ((e.fuse * 14) | 0) % 2, bc = lit ? [1, .95, .8] : body; // a rolling bomb: a black band, a burning fuse
    EM.add('sph', 0, 0, 1 + bob, t * 4, r * 1.9, r * 1.9, r * 1.9, bc, lit ? .7 : .08); EM.add('tor', 0, 0, r * .95 + bob, 0, r * 2, r * 2, r * .35, [.08, .05, .04], 0);
    EM.add('box', r * .92, 0, r * .95 + bob, 0, r * .1, r * .5, r * .5, [1, .84, 0], .8); EM.add('cyl', 0, 0, r * 1.8 + bob, 0, r * .45, r * .45, r * .3, [.2, .2, .22], 0);
    EM.seg(0, 0, r * 2.1 + bob, -r * .3, r * .2, r * 2.6 + bob, 1.6, [.5, .4, .3]); EM.glow(-r * .3, r * .2, r * 2.65 + bob, lit ? r * 1.1 : r * .5, [1, .7, .2], lit ? 1 : .7); };
  EMODEL[T.WEAVER] = (e, r, c, body, dark, t, mv, bob) => { const z = r * .8 + bob; // a spinning crystal with motes in orbit
    EM.add('oct', 0, 0, z, t * 2, r * 1.5, r * 1.5, r * 1.9, shadeC(c, .75), .25); EM.add('ball', 0, 0, z + r * .7, 0, r * .5, r * .5, r * .5, WH, 1); EM.glow(0, 0, z + r * .95, r * .9, c, .45);
    EM.add('tor', 0, 0, z + r * .95, 0, r * 2.5, r * 2.5, r * .2, c, .6, .5 + Math.sin(t * 2) * .2);
    for (let k = 0; k < 3; k++) { const a = t * 5 + k * TAU / 3; EM.add('ball', Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4, z + r * .8 + Math.sin(a * 2) * r * .3, 0, 4, 4, 4, WH, 1); } };
  const ghost = (e, r, c, body, dark, t, mv, bob, skull) => { const z = r * 2.2 + bob * 2, fk = .55 + .45 * Math.sin(t * 9); // a hooded ghost; the wraith shows a skull
    EM.add('cone', 0, 0, z, 0, r * 1.9, r * 1.9, r * 1.9, shadeC(c, .6), .3 + fk * .15, Math.PI); EM.add('sph', 0, 0, z - r * .2, 0, r * 1.5, r * 1.5, r * 1.2, shadeC(c, .45), .1);
    for (let k = 0; k < 3; k++) { const a = Math.PI + (k - 1) * .5; EM.seg(Math.cos(a) * r * .6, Math.sin(a) * r * .6, z - r * .4, Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5 + Math.sin(t * 6 + k) * r * .3, z - r * 1.2, r * .25, shadeC(c, .4), .2); }
    if (skull) { EM.add('sph', r * .25, 0, z + r * .1, 0, r * 1, r * .95, r * .95, [.86, .84, .92], .25); for (const sd of [-1, 1]) EM.add('ball', r * .68, sd * r * .2, z + r * .5, 0, r * .25, r * .25, r * .22, [.05, 0, .1], 0); EM.glow(r * .75, 0, z + r * .55, r * .5, c, .6);
      for (let k = 0; k < 5; k++) { const a = t * 2 + k * TAU / 5; EM.add('ball', Math.cos(a) * r * 1.8, Math.sin(a) * r * 1.8, z - r * .5 + Math.sin(t * 3 + k) * r * .4, 0, 4, 4, 4, c, 1); } }
    else for (const sd of [-1, 1]) { EM.add('ball', r * .62, sd * r * .25, z + r * .45, 0, r * .28, r * .28, r * .22, WH, 1); EM.glow(r * .7, sd * r * .25, z + r * .55, r * .3, c, .8); }
    EM.glow(0, 0, z * .6, r * 2, c, .18 + fk * .1); };
  EMODEL[T.PHANTOM] = (e, r, c, body, dark, t, mv, bob) => ghost(e, r, c, body, dark, t, mv, bob, false);
  EMODEL[T.WRAITH] = (e, r, c, body, dark, t, mv, bob) => ghost(e, r, c, body, dark, t, mv, bob, true);
  EMODEL[T.SPLITTER] = (e, r, c, body, dark, t, mv, bob) => { const op = mv ? Math.abs(Math.sin(t * 6)) * r * .08 : 0; // two halves held by a dark seam
    for (const sd of [-1, 1]) EM.add('sph', 0, sd * (r * .42 + op), 2 + bob, 0, r * 1.5, r * 1.15, r * 1.5, body, .1); EM.add('box', 0, 0, r * .3 + bob, 0, r * 1.2, r * .14 + op * 2, r * 1, dark, 0);
    EM.add('ball', r * .68, 0, r * .9 + bob, 0, r * .45, r * .45, r * .45, [.04, .04, .06], 0); EM.add('ball', r * .82, 0, r * 1 + bob, 0, r * .18, r * .18, r * .18, WH, 1);
    for (const sd of [-1, 1]) EM.leg(0, sd * r * .6, r * .5 + bob, Math.sin(t * 12) * r * .3 * sd, sd * r * 1.1, r * .9, 2, dark); };
  EMODEL[T.WARDEN] = (e, r, c, body, dark, t, mv, bob) => { const z = r * .5 + bob; // a floating shield pylon with an antenna
    EM.add('hex', 0, 0, z, t * .5, r * 1.7, r * 1.7, r * .9, dark, 0); EM.add('hex', 0, 0, z + r * .9, t * .5, r * 1.3, r * 1.3, r * .2, body, .1);
    EM.add('sph', 0, 0, z + r * .95, 0, r * 1.05, r * 1.05, r * 1.05, c, .45); EM.glow(0, 0, z + r * 1.5, r * 1.1, c, .4);
    EM.seg(0, 0, z + r * 1.9, 0, 0, z + r * 3, 1.4, [.6, .65, .8]); EM.glow(0, 0, z + r * 3.05, 5, WH, .9);
    EM.add('tor', 0, 0, z + r * .9 + Math.sin(t * 3) * r * .2, 0, r * 2.8, r * 2.8, r * .22, c, .7, Math.sin(t * 1.5) * .25); };
  EMODEL[T.MEDIC] = (e, r, c, body, dark, t, mv, bob) => { const z = r * .9 + bob, pu = .5 + .5 * Math.sin(t * 4); // a white field medic drone
    EM.add('sph', 0, 0, z, 0, r * 1.6, r * 1.6, r * 1.2, [.85, .9, .92], .05); EM.add('box', 0, 0, z + r * 1.15, 0, r * 1.1, r * .3, r * .2, c, .9); EM.add('box', 0, 0, z + r * 1.15, 0, r * .3, r * 1.1, r * .2, c, .9);
    for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + .785; EM.seg(Math.cos(a) * r * .5, Math.sin(a) * r * .5, z + r * .6, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, z + r * .8, 1.6, [.5, .55, .6]); EM.add('tor', Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, z + r * .85, t * 20, r * .8, r * .8, r * .1, [.7, .8, .85], .2); }
    EM.add('tor', 0, 0, r * .3, 0, r * (2.4 + pu * .5), r * (2.4 + pu * .5), r * .12, c, .5 + pu * .4); EM.glow(0, 0, z + r * .4, r * 1.2, c, .3 + pu * .2); };
  EMODEL[T.MIMIC] = (e, r, c, body, dark, t, mv) => { EM.figure(r * 1.15, t, mv, [.22, .14, .26], [.1, .07, .13], c, c); EM.glow(0, 0, r * .6, r * 1.6, c, .15); }; // a dark copy of you, in pink
  EMODEL[T.CLONE] = (e, r, c, body, dark, t, mv) => { EM.figure(r * 1.1, t, mv, [.16, .08, .26], [.08, .04, .14], [.85, .6, 1], null); EM.glow(0, 0, r * .8, r * 1.8, c, .3); }; // a shadow of the hero
  EMODEL[T.MINER] = (e, r, c, body, dark, t, mv) => { const z = r * .55, bl = ((t * 3) | 0) % 2; // a mining crawler with a drill, a mine on its back
    for (const sd of [-1, 1]) for (const ff of [-1, 1]) { const g = mv ? Math.sin(t * 13 + ff + sd * 2) * r * .2 : 0; EM.leg(ff * r * .45, sd * r * .45, z, ff * r * .75 + g, sd * r * 1.05, z + r * .4, 2.8, dark); }
    EM.add('box', 0, 0, z, 0, r * 1.5, r * 1.15, r * .6, body, .05); EM.add('box', r * .78, 0, z + r * .1, 0, r * .08, r * .9, r * .3, c, .8);
    EM.add('cone', r * .8, 0, z + r * .3, t * 12, r * .55, r * .55, r * .95, [.75, .75, .8], .05, -Math.PI / 2); EM.add('cyl', -r * .25, 0, z + r * .6, 0, r * .75, r * .75, r * .22, [.16, .1, 0], 0);
    EM.add('ball', -r * .25, 0, z + r * .8, 0, r * .25, r * .25, r * .2, bl ? [1, .1, .2] : [.4, .05, .1], bl ? 1 : .2); };
  EMODEL[T.MIRROR] = (e, r, c, body, dark, t, mv, bob) => { const z = r * .3 + bob; // a hexagon body behind a curved mirror shield
    EM.add('hex', 0, 0, z, 0, r * 1.4, r * 1.4, r * 1.3, [.42, .46, .55], .02); EM.add('ball', r * .2, 0, z + r * 1.2, 0, r * .5, r * .5, r * .5, [.8, .9, 1], .6);
    for (let k = -2; k <= 2; k++) { const a = k * .38; EM.add('box', Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25, z - r * .1, a, r * .12, r * .5, r * 1.9, [.45, .62, .8], .12); }
    EM.glow(r * 1.3, 0, z + r * .9, r * .8, [.7, .9, 1], .15); };
  EMODEL[T.SPIDER] = (e, r, c, body, dark, t, mv) => { const z = r * .9; // eight legs, a turret dome and a yellow eye
    for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) { const ff = (k - 1.5) * r * .4, g = mv ? Math.sin(t * 9 + k * 1.7 + sd) * r * .25 : 0; EM.leg(ff * .5, sd * r * .5, z, ff * 1.4 + g, sd * r * 1.75, z + r * .7, r * .13, dark); }
    EM.add('sph', 0, 0, z - r * .4, 0, r * 1.9, r * 1.7, r * 1.05, body, .06); EM.add('sph', r * .1, 0, z + r * .25, 0, r * 1.1, r * 1.1, r * .75, shadeC(body, .6), 0);
    EM.add('ball', r * .55, 0, z + r * .35, 0, r * .45, r * .45, r * .4, [1, .9, .2], 1); EM.glow(r * .7, 0, z + r * .55, r * .6, [1, .8, .2], .6);
    EM.seg(r * .5, 0, z + r * .55, r * 1.7, 0, z + r * .65, r * .2, [.2, .18, .22]); EM.glow(r * 1.75, 0, z + r * .65, r * .3, c, .6); };
  EMODEL[T.TREASURE] = (e, r, c, body, dark, t, mv, bob) => { const z = r * 1.1 + bob; // a spinning gold coin
    GL3D.add('cyl', EM.x, EM.y, EM.z0 + z, t * 6, r * 2.1, r * 2.1, r * .35, [.9, .7, .15], .25, 0, Math.PI / 2); GL3D.add('box', EM.x, EM.y, EM.z0 + z - r * .3, t * 6, r * .5, r * .6, r * .6, [1, .95, .6], .9, 0, 0);
    EM.glow(0, 0, z, r * 1.8, [1, .8, .2], .35); if (((t * 4) | 0) % 3 === 0) EM.glow(r * .5, r * .3, z + r * .6, 6, WH, .9); };
  EMODEL[T.DUMMY] = (e, r, c, body, dark, t) => { // a training post with a target
    EM.add('cyl', 0, 0, 0, 0, r * .35, r * .35, r * 2.2, [.45, .32, .2], 0); EM.seg(0, -r * .9, r * 1.4, 0, r * .9, r * 1.4, r * .22, [.45, .32, .2]);
    GL3D.add('cyl', EM.px(r * .25, 0), EM.py(r * .25, 0), EM.z0 + r * .9, EM.an + Math.PI / 2, r * 1.5, r * 1.5, r * .2, [.85, .8, .7], 0, 0, Math.PI / 2);
    GL3D.add('cyl', EM.px(r * .36, 0), EM.py(r * .36, 0), EM.z0 + r * 1.4, EM.an + Math.PI / 2, r * .6, r * .6, r * .05, [1, .15, .2], .6, 0, Math.PI / 2); };
  EMODEL[T.COURIER] = (e, r, c, body, dark, t, mv, bob) => { const z = r * .5 + bob; // a hover cart with a gold crate
    EM.add('box', 0, 0, z, 0, r * 2.3, r * 1.6, r * .5, dark, 0); for (const sd of [-1, 1]) for (const ff of [-1, 1]) { EM.add('cyl', ff * r * .8, sd * r * .75, z - r * .15, 0, r * .55, r * .55, r * .2, [.2, .22, .3], 0); EM.glow(ff * r * .8, sd * r * .75, z - r * .2, r * .45, [1, .7, .2], .6); }
    EM.add('box', 0, 0, z + r * .5, 0, r * 1.5, r * 1.2, r * 1, body, .3); EM.add('box', 0, 0, z + r * 1.52, 0, r * 1.55, r * .2, r * .1, [.2, .14, 0], 0); EM.add('box', r * .76, 0, z + r * 1, 0, r * .04, r * .3, r * .55, [.1, .06, 0], 0);
    EM.glow(-r * 1.3, 0, z, r * .7, [1, .6, .2], .7); };
}
{
  const we0 = W3D.enemy.bind(W3D);
  W3D.enemy = function (e) {
    const m = EMODEL[e.type]; if (!m) return we0(e);
    if (!e.alive || e.vis < .2) return; const lift = W3D.inLift(e), r = Math.max(4, e.r * (e.scale || 1)), t = (e.t || 0) + (e.uid | 0) * .37;
    let c = rgb3(e.al > 0 ? '#00f2fe' : (e.col || '#ff3b5c')); const fl = e.fl > .3; if (fl) c = whiten(c, .8);
    const body = fl ? whiten(shadeC(c, .7), .6) : shadeC(c, .62, .02), dark = fl ? [.7, .7, .75] : [c[0] * .12 + .04, c[1] * .12 + .04, c[2] * .12 + .06];
    const mv = Math.abs(e.vx || 0) + Math.abs(e.vy || 0) > 20, bob = Math.sin(t * 4) * 1.5;
    EM.set(e.x, e.y, e.ang || 0, lift); if (!lift) EM.shadow(r); m(e, r, c, body, dark, t, mv, bob);
    if (e.elite) { EM.add('tor', 0, 0, r * 2.6, t, r * 1.6, r * 1.6, r * .14, [1, .82, .25], .9); GL3D.glow(e.x, e.y, lift + r * 2.4, r + 8, [1, .82, .25], .4, true); }
  };
}
/* ---------------- the roof things ---------------- */
{
  const DK = [.12, .13, .2], MT = [.3, .32, .42];
  W3D.props = function () {
    const g = GL3D, A = Arena, t = CAM.t;
    for (const tu of A.turrets || []) { // a turret on a pedestal: the head turns to its target, the barrel kicks when it fires
      const col = tu.hacked ? [0, 1, .55] : [1, .1, .3], fire = tu.hacked ? clamp((tu.cd - .55) / .15, 0, 1) : clamp((tu.cd - (2.4 / G.diff.fire - .15)) / .15, 0, 1);
      g.add('hex', tu.x, tu.y, 0, 0, 44, 44, 8, DK, 0, 0); g.add('hex', tu.x, tu.y, 8, 0, 36, 36, 2, col, .55, 0); g.add('cyl', tu.x, tu.y, 10, 0, 22, 22, 10, MT, 0, 0);
      EM.set(tu.x, tu.y, tu.ang || 0, 20); EM.add('box', -2, 0, 0, 0, 26, 22, 12, [.2, .22, .32], 0); EM.add('box', 9, 0, 3, 0, 8, 18, 6, col, .7);
      const kb = fire * 5; for (const sd of [-1, 1]) EM.seg(4 - kb, sd * 4.5, 6, 28 - kb, sd * 4.5, 6, 4, [.12, .13, .18], 0);
      EM.add('box', 27 - kb, 0, 2, 0, 4, 15, 8, MT, 0); if (fire > 0) { EM.glow(32, 0, 7, 16 * fire, col, .9 * fire); g.light(EM.px(32, 0), EM.py(32, 0), 26, 90, col, 1.2 * fire); }
      EM.add('ball', -8, 0, 12, 0, 6, 6, 6, col, 1); EM.glow(-8, 0, 15, 8, col, .6); g.floorGlow(tu.x, tu.y, .3, 46, col, .25); }
    for (const b of A.barrels || []) if (b.alive !== false) { const r = (b.r || 14) * 2, p = .6 + .4 * Math.sin(t * 4 + b.x); // a fuel drum: hazard bands, a glowing cap
      g.add('cyl', b.x, b.y, 0, 0, r, r, 30, [.72, .15, .08], .08, 0); for (const z of [8, 21]) g.add('cyl', b.x, b.y, z, 0, r * 1.04, r * 1.04, 2.5, [1, .78, .15], .6, 0);
      g.add('cyl', b.x, b.y, 30, 0, r * .9, r * .9, 1.2, [.25, .05, .03], 0, 0); g.add('box', b.x, b.y, 31, 0, 4, 9, 1.4, [1, .85, .2], .9 * p, 0); g.add('ball', b.x, b.y - 6, 30.6, 0, 3, 3, 2, [1, .85, .2], .9 * p, 0); g.glow(b.x, b.y, 18, 22, [1, .45, .1], .25 * p); }
    for (const n of A.nodes || []) if (n.alive) { const c = n.fl > .3 ? [1, 1, 1] : [.25, .95, 1]; // a data node: a pedestal under a floating crystal
      g.add('hex', n.x, n.y, 0, 0, 32, 32, 6, DK, 0, 0); g.add('hex', n.x, n.y, 6, 0, 26, 26, 2, [.25, .95, 1], .6, 0);
      g.add('oct', n.x, n.y, 14 + Math.sin(t * 2) * 3, t * 1.2, 24, 24, 34, c, .55, 0); g.add('tor', n.x, n.y, 30, 0, 40, 40, 4, [.25, .95, 1], .7, .4 * Math.sin(t)); g.glow(n.x, n.y, 30, 26, [.25, .95, 1], .4); }
    for (const tm of A.terms || []) { const c = tm.done ? [0, 1, .55] : [0, 1, .82]; // a terminal: a console with a lit screen
      g.add('box', tm.x, tm.y, 0, 0, 34, 24, 22, [.14, .16, .24], 0, 0); g.add('box', tm.x, tm.y - 4, 22, 0, 34, 14, 4, [.2, .22, .32], 0, 0);
      g.add('box', tm.x, tm.y + 12.4, 6, 0, 26, .8, 14, c, .9, 0); g.add('box', tm.x, tm.y - 8, 26, 0, 30, 2, 18, [.1, .12, .18], 0, 0); g.add('box', tm.x, tm.y - 6.8, 28, 0, 24, .6, 13, c, .7 + (tm.on || 0) * .3, 0); g.glow(tm.x, tm.y + 13, 14, 20, c, .3); }
    for (const m of A.mines || []) { const on = m.arm <= 0, bl = m.fuse > 0 ? ((m.fuse * 30) | 0) % 2 : ((t * (on ? 3 : 8)) | 0) % 2, lc = m.fuse > 0 ? [1, 1, 1] : [1, .1, .25]; // a disc mine with a blinking light
      g.add('cyl', m.x, m.y, 0, Math.PI / 8, 24, 24, 4, [.18, .12, .02], 0, 0); g.add('cyl', m.x, m.y, 4, 0, 14, 14, 2, [1, .7, 0], .35, 0); g.add('ball', m.x, m.y, 5, 0, 7, 7, 5, bl ? lc : [.35, .2, 0], bl ? 1 : .2, 0); if (bl) g.glow(m.x, m.y, 9, 12, lc, .7); }
    const u = A.uplink; if (u && !u.esc) { const c = u.fl > .3 ? [1, 1, 1] : [1, .3, .85]; // the uplink mast
      g.add('cyl', u.x, u.y, 0, 0, u.r * 1.8, u.r * 1.8, 10, DK, 0, 0); g.add('cyl', u.x, u.y, 10, 0, u.r * 1.2, u.r * 1.2, 8, c, .45, 0); g.add('cyl', u.x, u.y, 18, 0, 6, 6, 50, MT, 0, 0);
      g.add('cone', u.x, u.y, 62, t, 26, 26, 10, [.6, .62, .7], .1, 0, Math.PI); g.add('ball', u.x, u.y, 66, 0, 8, 8, 8, c, 1, 0); g.glow(u.x, u.y, 70, 16, c, .7); }
    if (u && u.esc) { const c = u.fl > .3 ? [1, 1, 1] : [.18, .9, .78], z = 22 + Math.sin(t * 3) * 3; // the escorted cargo drone
      g.add('box', u.x, u.y, z, 0, 48, 32, 10, u.fl > .3 ? c : [.05, .16, .19], 0, 0); g.add('box', u.x, u.y, z + 10, 0, 32, 14, 8, [1, .82, .25], .4, 0);
      for (const [rx, ry] of [[-26, -20], [26, -20], [-26, 20], [26, 20]]) { g.add('cyl', u.x + rx, u.y + ry, z + 4, 0, 6, 6, 6, MT, 0, 0); g.add('tor', u.x + rx, u.y + ry, z + 10, t * 30, 22, 22, 2, [.75, .98, .95], .5, 0); }
      g.glow(u.x, u.y, z - 4, 26, c, .4); }
    if (typeof Obj2 !== 'undefined' && G.mode === 'story' && G.obj && G.obj.t === 'collect') for (const sh of Obj2.sh) { const a = Math.min(1, sh.t * 3), z = 16 + Math.sin(sh.t * 3) * 4; // data shards
      g.add('oct', sh.x, sh.y, z, sh.t * 1.5, 18 * a, 18 * a, 26 * a, [.75, 1, .95], .7, 0); g.glow(sh.x, sh.y, z + 13, 28, [.18, .9, .78], .55); g.beam(sh.x, sh.y, 260, sh.x, sh.y, 0, 2, 6, [.18, .9, .78], 0, .25 * a); }
    for (let i = 0; i < PU.n; i++) { const p = PU.a[i]; if (p.l < 3 && ((p.l * 8) | 0) % 2) continue; const c = p.k === 0 ? [0, 1, .55] : [.5, 1, .7], z = 12 + Math.sin(p.t * 5) * 3; // pickups: floating gems
      g.add(p.k === 0 ? 'hex' : 'oct', p.x, p.y, z, p.t * 2, 18, 18, p.k === 0 ? 8 : 18, c, .6, 0); g.glow(p.x, p.y, z + 6, 22, c, .5); }
    for (let i = 0; i < CO.n; i++) { const o = CO.a[i]; g.add('cyl', o.x, o.y, 5, o.t * 9, 9, 9, 2.2, [1, .82, .2], .55, 0, Math.PI / 2); } // coins: little spinning discs
    for (const p of A.portals || []) { const c = rgb3(p.c || '#7df9ff'); g.add('tor', p.x, p.y, 2, 0, p.r * 2.2, p.r * 2.2, 5, c, .8, 0); g.beam(p.x, p.y, 0, p.x, p.y, 70, p.r * .8, p.r * .5, c, p.cd > 0 ? .08 : .25, 0); }
  };
}
/* the 2D layer asks this before drawing a roof thing's body: in 3D the 3D layer draws the body */
function in3D() { return W3D.live && cx === W3D.cx0; }
