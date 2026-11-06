/* =====================================================================
   BOSSES 3D — one model per boss for the 3D view (render only).
   Each model is built from the GL3D primitives around the boss position,
   faces the hero, rises in on entry and sinks when it dies. The breakable
   parts (heads, cannons, bells...) are drawn where the simulation puts them.
   ===================================================================== */
const BOSS3D = {
  hole: { kage: 3.7, renull: 2.6, benkei: 2.4, chimera: 2.4, valkyrie: 2.6, izanami: 2.4, hyakki: 2.4 }, // (how far around the boss its flat drawing is hidden in 3D: the cloaks, wings and carts reach further)
  mix(c, w, k) { return [c[0] + (w[0] - c[0]) * k, c[1] + (w[1] - c[1]) * k, c[2] + (w[2] - c[2]) * k]; },
  ctx(b) {
    const col = rgb3((BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844'), fl = b._fl > .02 ? Math.min(1, b._fl / .12) : 0;
    const sink = b.dying > 0 ? (b.dying / 1.6) * b.r * 1.2 : 0, ent = clamp(b.enter == null ? 1 : b.enter, 0, 1);
    const fa = Math.atan2(P.y - b.y, P.x - b.x), cf = Math.cos(fa), sf = Math.sin(fa);
    const W = [1, 1, 1], C = this.mix(col, W, fl * .7), dk = this.mix([col[0] * .16 + .03, col[1] * .16 + .03, col[2] * .16 + .05], W, fl * .5);
    const mid = this.mix([col[0] * .45 + .05, col[1] * .45 + .05, col[2] * .45 + .07], W, fl * .5);
    const c = { b, g: GL3D, col: C, dk, mid, r: b.r * 1.25 /* (a boss stands taller than its hit circle) */, x: b.x, y: b.y, t: b.t || CAM.t, Z: -sink + (1 - ent) * 220, fa, cf, sf, em: .6 + fl * .4 };
    // local frame: f = forward (toward the hero), s = to the side
    c.at = (f, s) => [c.x + cf * f - sf * s, c.y + sf * f + cf * s];
    c.add = (m, f, s, z, yaw, sx, sy, sz, cl, em, reg, pitch) => { const p = c.at(f, s); GL3D.add(m, p[0], p[1], c.Z + z, fa + (yaw || 0), sx, sy, sz, cl, em, reg, pitch); };
    c.glow = (f, s, z, rr, cl, a, ring) => { const p = c.at(f, s); GL3D.glow(p[0], p[1], c.Z + z, rr, cl, a, ring); };
    return c;
  },
  shadow(c, k) { GL3D.add('cyl', c.x + c.r * .25, c.y + c.r * .4, .1, 0, c.r * 2.4 * (k || 1), c.r * 1.7 * (k || 1), .2, [.01, .01, .03], 0, 0); GL3D.floorGlow(c.x, c.y, .3, c.r * 2.2, c.col, .22); },
  parts(c, shape) { // breakable parts: a socket, a glowing core
    for (const p of c.b.parts) if (p.alive) { const pr = p.r || 14, hit = (p.fl || 0) > .3, pc = hit ? [1, 1, 1] : c.col;
      GL3D.add(shape || 'cyl', p.x, p.y, c.Z + 8, 0, pr * 1.9, pr * 1.9, pr * 1.1, c.dk, 0, 0);
      GL3D.add('sph', p.x, p.y, c.Z + pr * 1.1 + 6, 0, pr * 1.2, pr * 1.2, pr * 1.2, pc, .9, 0); GL3D.glow(p.x, p.y, c.Z + pr * 1.6 + 6, pr * 1.5, c.col, .5); }
  },
  humanoid(c, S, body, acc, o) { // a big figure: legs, torso, shoulders, head; o: { hat, cloak, blade }
    o = o || {}; const step = Math.sin(c.t * 3) * 3 * S;
    for (const sd of [-1, 1]) c.add('box', step * sd * .3, sd * 7 * S, 0, 0, 9 * S, 8 * S, 22 * S, c.dk, 0, 0);
    if (o.cloak) c.add('frustum', -2 * S, 0, 0, 0, 34 * S, 30 * S, 34 * S, o.cloak, 0, 0);
    c.add('box', 0, 0, 20 * S, 0, 14 * S, 26 * S, 22 * S, body, 0, 0); c.add('box', 7.3 * S, 0, 30 * S, 0, .6, 12 * S, 6 * S, acc, c.em, 0);
    for (const sd of [-1, 1]) c.add('sph', 0, sd * 15 * S, 36 * S, 0, 13 * S, 12 * S, 10 * S, c.mid, 0, 0);
    c.add('sph', 1 * S, 0, 42 * S, 0, 15 * S, 15 * S, 15 * S, c.dk, 0, 0); c.add('box', 7 * S, 0, 48 * S, 0, 3 * S, 11 * S, 3 * S, acc, 1, 0); c.glow(9 * S, 0, 49 * S, 10 * S, acc, .6);
    if (o.hat === 'kasa') c.add('cone', 0, 0, 52 * S, 0, 38 * S, 38 * S, 10 * S, c.mid, 0, 0);
    if (o.hat === 'kabuto') { c.add('frustum', 0, 0, 52 * S, 0, 20 * S, 20 * S, 6 * S, c.mid, 0, 0); c.add('tri', 4 * S, 0, 57 * S, Math.PI / 2, 4 * S, 26 * S, 3 * S, [1, .82, .25], .8, 0); }
    if (o.hat === 'halo') c.glow(0, 0, 66 * S, 16 * S, acc, .8, true);
    if (o.blade) { const a = Math.sin(c.t * 2) * .6 + .8; for (const sd of o.blade === 2 ? [-1, 1] : [1]) { const L = 70 * S, p = c.at(6 * S, sd * 20 * S), ba = c.fa + sd * a;
      GL3D.add('box', p[0] + Math.cos(ba) * L / 2, p[1] + Math.sin(ba) * L / 2, c.Z + 30 * S, ba + Math.PI / 2, 3 * S, L, 2.4 * S, [.9, .95, 1], 1, 0);
      for (let i = 1; i <= 3; i++) GL3D.glow(p[0] + Math.cos(ba) * L * i / 3, p[1] + Math.sin(ba) * L * i / 3, c.Z + 31 * S, 8 * S, acc, .4); } }
  },
  M: {
    warden(c) { const r = c.r; BOSS3D.shadow(c); // a four-legged security mech
      for (const sf of [-1, 1]) for (const ff of [-1, 1]) { const ph = Math.sin(c.t * 5 + sf * 1.3 + ff) * 4; c.add('box', ff * r * .8 + ph, sf * r * .9, 0, ff * sf * .5, r * .3, r * .3, r * .9, c.dk, 0, 0, .3 * ff); c.add('box', ff * r * .55, sf * r * .62, r * .7, 0, r * .4, r * .28, r * .25, c.mid, 0, 0); }
      c.add('box', 0, 0, r * .75, 0, r * 1.7, r * 1.5, r * .7, c.mid, 0, 0); c.add('box', r * .1, 0, r * 1.45, 0, r * 1.1, r * 1.1, r * .45, c.dk, 0, 0);
      c.add('box', r * .7, 0, r * 1.15, 0, r * .3, r * .9, r * .2, c.col, c.em, 0); c.glow(r * .86, 0, r * 1.25, r * .5, c.col, .7);
      for (const sd of [-1, 1]) { c.add('cyl', r * .3, sd * r * .95, r * 1.35, 0, r * .45, r * .45, r * .4, c.dk, 0, 0); c.add('box', r * .9, sd * r * .95, r * 1.5, 0, r * 1.1, r * .16, r * .16, c.mid, .2, 0); c.glow(r * 1.45, sd * r * .95, r * 1.55, 6, c.col, .8); }
      BOSS3D.parts(c, 'box'); },
    hydra(c) { const r = c.r; BOSS3D.shadow(c, .9); // a hovering gunship; the heads are its parts
      const h = 30 + Math.sin(c.t * 2) * 6; c.add('pent', 0, 0, h, c.t * .2, r * 2, r * 2, r * .5, c.dk, 0, 0); c.add('pent', 0, 0, h + r * .5, c.t * .2, r * 1.5, r * 1.5, r * .25, c.mid, 0, 0);
      for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + .785, p = c.at(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); GL3D.add('cyl', p[0], p[1], c.Z + h - 4, 0, r * .55, r * .55, r * .2, c.mid, 0, 0); GL3D.floorGlow(p[0], p[1], .4, r * .5, c.col, .35); GL3D.glow(p[0], p[1], c.Z + h - 6, r * .35, c.col, .6); }
      c.add('sph', 0, 0, h + r * .7, 0, r * .8, r * .8, r * .6, c.col, c.em, 0); c.glow(0, 0, h + r * 1.1, r * .9, c.col, .6);
      for (const p of c.b.parts) if (p.alive) { const n = 5; for (let i = 1; i <= n; i++) { const q = i / n, nx = c.x + (p.x - c.x) * q, ny = c.y + (p.y - c.y) * q; GL3D.add('sph', nx, ny, c.Z + h + Math.sin(q * 3.14) * 22, 0, 12, 12, 10, c.mid, 0, 0); }
        const hit = (p.fl || 0) > .3; GL3D.add('cone', p.x, p.y, c.Z + h + 4, 0, 26, 26, 20, hit ? [1, 1, 1] : c.dk, 0, 0); GL3D.add('sph', p.x, p.y, c.Z + h + 14, 0, 16, 16, 14, hit ? [1, 1, 1] : c.col, .9, 0); GL3D.glow(p.x, p.y, c.Z + h + 20, 16, c.col, .6); } },
    kage(c) { BOSS3D.shadow(c, .7); const S = c.r / 26; BOSS3D.humanoid(c, S, c.dk, c.col, { hat: 'kasa', cloak: [.06, .04, .1], blade: 1 }); c.glow(0, 0, 20 * S, c.r * 1.3, c.col, .25); BOSS3D.parts(c); },
    shogun(c) { BOSS3D.shadow(c); const S = c.r / 24; BOSS3D.humanoid(c, S, c.mid, c.col, { hat: 'kabuto', blade: 2 });
      for (const sd of [-1, 1]) c.add('box', -2 * S, sd * 21 * S, 30 * S, sd * .3, 6 * S, 16 * S, 14 * S, c.col, .35, 0, sd * .4); // shoulder plates
      c.add('frustum', 0, 0, 14 * S, 0, 30 * S, 34 * S, 10 * S, c.dk, 0, 0); BOSS3D.parts(c, 'hex'); },
    raijin(c) { const r = c.r, h = 40 + Math.sin(c.t * 2.2) * 8; BOSS3D.shadow(c, .8); // a storm orb with a ring of drums
      c.add('sph', 0, 0, h, 0, r * 1.5, r * 1.5, r * 1.5, c.mid, .3, 0); c.add('sph', r * .2, 0, h + r * .4, 0, r * .9, r * .9, r * .8, c.col, c.em, 0); c.glow(0, 0, h + r * .75, r * 1.4, c.col, .55);
      for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + c.t * .8, p = c.at(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5); GL3D.add('cyl', p[0], p[1], c.Z + h + Math.sin(c.t * 4 + k) * 6, a, r * .5, r * .5, r * .3, [.9, .78, .4], .3, 0, 1.57); }
      if (((c.t * 6) | 0) % 3 === 0) for (let k = 0; k < 3; k++) { const a = c.t * 3 + k * 2.1; c.glow(Math.cos(a) * r * 2.2, Math.sin(a) * r * 2.2, h * .5, 10, [.8, .9, 1], .9); }
      BOSS3D.parts(c); },
    renull(c) { BOSS3D.shadow(c, .7); const S = c.r / 26; BOSS3D.humanoid(c, S, [.85, .86, .9], [1, .1, .25], { blade: 1 }); for (let i = 1; i <= 3; i++) c.add('box', -i * 9 * S, 0, (48 - i * 2) * S, 0, 6 * S, 8 * S, 2.4 * S, [1, .1, .25], .5, 0); BOSS3D.parts(c); },
    leviathan(c) { const b = c.b, a = b.vis == null ? 1 : b.vis; if (a < .3) { GL3D.floorGlow(c.x, c.y, .3, c.r * 2, c.col, .4 * (1 - a)); return; } // a serpent: head and the trailing coils
      const segs = b.seg || []; for (let i = segs.length - 1; i >= 0; i--) { const s = segs[i], z = 6 + Math.sin(c.t * 4 - i * .6) * 10 + 10;
        GL3D.add('cyl', s.x + 4, s.y + 6, .1, 0, s.r * 2, s.r * 1.3, .2, [.01, .01, .03], 0, 0);
        GL3D.add('sph', s.x, s.y, c.Z + z, 0, s.r * 2, s.r * 2, s.r * 1.6, i % 2 ? c.dk : c.mid, 0, 0); if (i % 2 === 0) GL3D.add('cone', s.x, s.y, c.Z + z + s.r * 1.3, 0, s.r * .5, s.r * .5, s.r * .7, c.col, .5, 0); }
      const an = b.ang || 0; c.fa = an; c.cf = Math.cos(an); c.sf = Math.sin(an); const r = c.r;
      c.add('sph', 0, 0, 18, 0, r * 2.2, r * 1.8, r * 1.4, c.mid, 0, 0); c.add('cone', r * .9, 0, 20, 0, r * 1.2, r * 1.2, r * .9, c.dk, 0, 0, 1.57);
      for (const sd of [-1, 1]) { c.add('sph', r * .5, sd * r * .55, 18 + r * .8, 0, r * .35, r * .35, r * .3, [1, .95, .4], 1, 0); c.add('cone', -r * .3, sd * r * .6, 18 + r * .9, 0, r * .3, r * .3, r * 1.1, c.col, .4, 0, -.4); }
      c.glow(r * .5, 0, 18 + r, r * .9, c.col, .4); BOSS3D.parts(c, 'sph'); },
    benkei(c) { BOSS3D.shadow(c); const S = c.r / 24; BOSS3D.humanoid(c, S * 1.1, [.55, .32, .14], c.col, { hat: 'kasa' });
      c.add('sph', 2 * S, 0, 18 * S, 0, 34 * S, 36 * S, 26 * S, [.5, .28, .12], 0, 0); // the robe
      const p = c.at(10 * S, 26 * S); GL3D.add('cyl', p[0], p[1], c.Z, 0, 4 * S, 4 * S, 90 * S, [.4, .3, .2], 0, 0); GL3D.add('tri', p[0], p[1], c.Z + 86 * S, c.fa, 10 * S, 4 * S, 22 * S, [.9, .95, 1], .8, 0);
      BOSS3D.parts(c, 'frustum'); },
    prime(c) { const r = c.r; BOSS3D.shadow(c); // the founder's golden tower core
      c.add('frustum', 0, 0, 0, c.t * .2, r * 2.2, r * 2.2, r * .6, c.dk, 0, 0); c.add('frustum', 0, 0, r * .6, -c.t * .3, r * 1.6, r * 1.6, r * .8, c.mid, 0, 0); c.add('frustum', 0, 0, r * 1.4, c.t * .4, r * 1.1, r * 1.1, r * .9, c.col, .4, 0);
      c.add('sph', 0, 0, r * 2.3, 0, r * .8, r * .8, r * .8, [1, .95, .6], 1, 0); c.glow(0, 0, r * 2.7, r * 1.2, c.col, .7);
      for (let k = 0; k < 2; k++) c.glow(0, 0, r * (1.2 + k * .8) + Math.sin(c.t * 2 + k) * 6, r * (1.6 - k * .3), c.col, .45, true); BOSS3D.parts(c, 'hex'); },
    valkyrie(c) { BOSS3D.shadow(c, .8); const S = c.r / 24, h = 14 + Math.sin(c.t * 2.4) * 5; c.Z += h; BOSS3D.humanoid(c, S, [.85, .9, 1], c.col, { hat: 'halo' });
      for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { const sp = Math.sin(c.t * 3) * .15; c.add('tri', -8 * S - k * 4 * S, sd * (24 + k * 12) * S, (36 + k * 6) * S, sd * (.5 + k * .25 + sp), 22 * S, 8 * S, 2 * S, k % 2 ? c.col : [.9, .95, 1], k % 2 ? .7 : .2, 0); }
      GL3D.floorGlow(c.x, c.y, .3, c.r * 1.6, c.col, .4); BOSS3D.parts(c); },
    chimera(c) { const r = c.r; BOSS3D.shadow(c, 1.1); // three heads on one body
      c.add('sph', 0, 0, 10, 0, r * 2.4, r * 2, r * 1.3, c.mid, 0, 0); for (const sd of [-1, 1]) for (const ff of [-1, 1]) c.add('box', ff * r * .7, sd * r * .8, 0, 0, r * .3, r * .3, r * .5, c.dk, 0, 0);
      c.add('box', r, 0, r * 1.1, 0, r * .8, r * .7, r * .7, c.dk, 0, 0); c.add('box', r * 1.4, 0, r * 1.3, 0, r * .1, r * .6, r * .15, [1, .2, .3], 1, 0);
      c.add('sph', r * .7, r * .9, r * 1.2, 0, r * .8, r * .8, r * .8, c.col, c.em * .6, 0); c.add('cone', r * .7, -r * .9, r * .9, 0, r * .8, r * .8, r * 1.1, [.3, .9, .5], .4, 0);
      for (let i = 0; i < 5; i++) c.add('sph', -r * (1 + i * .35), 0, r * (.9 + Math.sin(c.t * 4 + i) * .2 + i * .15), 0, r * (.45 - i * .05), r * (.45 - i * .05), r * .4, c.dk, 0, 0); // a tail
      BOSS3D.parts(c); },
    genesis(c) { const r = c.r; BOSS3D.shadow(c, 1.1); // the final machine: rotating shells around a core
      for (let k = 0; k < 3; k++) { const s = r * (2.2 - k * .5), z = r * .2 + k * r * .55; c.add('box', 0, 0, z, c.t * (k % 2 ? -.5 : .4) + k * .5, s, s, r * .35, k === 1 ? c.col : c.dk, k === 1 ? .35 : 0, 0); }
      c.add('sph', 0, 0, r * 1.8, 0, r, r, r, [1, .96, .7], 1, 0); c.glow(0, 0, r * 2.3, r * 1.6, c.col, .7);
      for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + c.t * .6, p = c.at(Math.cos(a) * r * 1.7, Math.sin(a) * r * 1.7); GL3D.add('box', p[0], p[1], c.Z + r * 1.6 + Math.sin(c.t * 3 + k) * 8, a, 8, 8, 30, c.col, .7, 0); }
      BOSS3D.parts(c, 'box'); },
    oryu(c) { const r = c.r; BOSS3D.shadow(c); // a dragon coiled around its core
      for (let i = 0; i < 18; i++) { const a = i / 18 * TAU * 1.3 + c.t * .9, rr = r * (1.4 - i * .03), p = c.at(Math.cos(a) * rr, Math.sin(a) * rr); GL3D.add('sph', p[0], p[1], c.Z + 10 + i * 3 + Math.sin(c.t * 3 + i * .5) * 5, a, r * (.6 - i * .015), r * (.6 - i * .015), r * .5, i % 2 ? c.dk : c.mid, 0, 0); if (i % 3 === 0) GL3D.add('cone', p[0], p[1], c.Z + 10 + i * 3 + r * .45, 0, 6, 6, 10, c.col, .6, 0); }
      c.add('cyl', 0, 0, 0, 0, r * 1.2, r * 1.2, r * .9, c.dk, 0, 0); c.add('sph', 0, 0, r * .9, 0, r * .8, r * .8, r * .7, c.col, c.em, 0); c.glow(0, 0, r * 1.2, r * 1.1, c.col, .6);
      c.add('box', r * .4, 0, r * 1.7, 0, r * 1, r * .6, r * .5, c.mid, 0, 0); for (const sd of [-1, 1]) { c.add('cone', r * .1, sd * r * .25, r * 2.1, 0, r * .2, r * .2, r * .7, [.95, .9, .8], 0, 0, -.5); c.add('sph', r * .7, sd * r * .2, r * 2, 0, r * .18, r * .18, r * .15, [1, .9, .3], 1, 0); }
      BOSS3D.parts(c); },
    tenkai(c) { const r = c.r, h = 24 + Math.sin(c.t * 1.6) * 6; BOSS3D.shadow(c); // the orbital judge on a floating throne
      for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + .785; c.add('box', Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4, 0, a, r * .3, r * .3, r * 2.2, [.85, .82, .7], .1, 0); c.glow(Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4, r * 2.3, 10, c.col, .8); }
      c.Z += h; c.add('box', -r * .2, 0, 0, 0, r * 1.4, r * 1.6, r * .4, [.85, .8, .6], .2, 0); c.add('box', -r * .7, 0, r * .4, 0, r * .3, r * 1.6, r * 1.4, [.85, .8, .6], .2, 0);
      const S = r / 30; BOSS3D.humanoid(c, S, [.95, .92, .8], c.col, { hat: 'halo' }); c.glow(0, 0, 70 * S, r * 1.2, c.col, .35, true); BOSS3D.parts(c, 'hex'); },
    izanami(c) { const r = c.r, S = r / 26, h = 8 + Math.sin(c.t * 1.8) * 6; BOSS3D.shadow(c, .7); c.Z += h; // a pale figure in a long robe, with drifting petals
      c.add('cone', 0, 0, 0, 0, 40 * S, 40 * S, 52 * S, [.92, .92, .96], .15, 0); BOSS3D.humanoid(c, S * .9, [.95, .95, 1], c.col, {});
      for (let i = 0; i < 10; i++) { const a = i * 2.4 + c.t * .7, rr = r * (1.2 + (i % 3) * .3); c.add('box', Math.cos(a) * rr, Math.sin(a) * rr, 20 + ((c.t * 20 + i * 13) % 60), a * 3, 6, 4, 1, [1, .6, .75], .6, 0); }
      for (let i = 1; i <= 4; i++) c.add('box', -i * 8 * S, 0, (46 - i * 4) * S, 0, 7 * S, 14 * S, 2 * S, [.1, .1, .14], 0, 0); BOSS3D.parts(c); },
    hyakki(c) { const r = c.r; BOSS3D.shadow(c, 1.1); // the night-parade ox-cart with lanterns
      c.fa = (c.b.dir || 1) > 0 ? Math.PI / 2 : -Math.PI / 2; c.cf = Math.cos(c.fa); c.sf = Math.sin(c.fa);
      for (const sd of [-1, 1]) { c.add('cyl', 0, sd * r * 1.05, r * .1, 0, r * 1.3, r * .25, r * 1.3, [.25, .15, .08], 0, 0, 1.57); c.add('cyl', 0, sd * r * 1.18, r * .7, 0, r * .3, r * .1, r * .3, [1, .8, .3], .6, 0, 1.57); }
      c.add('box', 0, 0, r * .5, 0, r * 1.9, r * 1.8, r * .9, [.22, .1, .08], 0, 0); c.add('box', 0, 0, r * 1.4, 0, r * 2.1, r * 2, r * .2, [.1, .05, .05], 0, 0);
      c.add('box', r * .96, 0, r * .7, 0, .6, r * 1.2, r * .5, c.col, c.em, 0); c.glow(r * 1.1, 0, r * .95, r * .8, c.col, .5);
      for (const sd of [-1, 1]) { c.add('sph', r * 1.3, sd * r * .5, r * .3, 0, r * .45, r * .45, r * .5, c.col, .9, 0); c.glow(r * 1.3, sd * r * .5, r * .55, r * .5, [1, .6, .2], .7); }
      c.add('cyl', r * 1.6, 0, r * 1.4, 0, 6, 6, r * .6, [.2, .12, .08], 0, 0); c.add('sph', r * 1.6, 0, r * 2, 0, r * .6, r * .6, r * .7, [1, .45, .1], .9, 0); c.glow(r * 1.6, 0, r * 2.3, r * .9, [1, .5, .15], .7);
      BOSS3D.parts(c, 'sph'); }
  },
  draw(b) {
    if (!b || b.dying > 1.6) return false; const id = b.id && b.id.replace(/^(ex_|ev_)/, ''), m = this.M[id] || this.M[b.def && b.def.model];
    if (!m) return false; const c = this.ctx(b);
    if (b.dying > 0) for (let k = 0; k < 4; k++) { const a = b.t * 7 + k * 1.6; c.glow(Math.cos(a) * c.r, Math.sin(a) * c.r, c.r * (.5 + k * .3), 14 + k * 4, [1, .7, .3], .8); }
    m(c); return true;
  }
};
{ const wb0 = W3D.boss.bind(W3D); W3D.boss = function (b) { if (b && BOSS3D.draw(b)) return; wb0(b); }; }
