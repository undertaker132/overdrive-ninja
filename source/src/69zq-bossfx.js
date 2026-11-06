/* =====================================================================
   BOSS ENTRANCES AND FALLS — a signature arrival and a signature death
   for every boss (render only; works in 2D and in 3D).
   The simulation already slides each boss in over 2.2 s (b.enter 0..1)
   and runs a 1.6 s kill-cam (b.dying). This layer dresses those moments:
     warden drops from the sky · hydra flies in on its engines · kage
     steps out of black smoke · shogun cuts its way up through the roof ·
     raijin rides the lightning · ren.null glitches together · leviathan
     bursts out of the water · benkei walks in to tolling bells · prime
     and chimera assemble from shards · valkyrie dives in on wings ·
     genesis builds itself from cubes · oryu coils in · tenkai comes down
     a beam from orbit · izanami forms from petals · hyakki brings its
     lantern parade.
   Each one has its own particles, sound sting, light and camera kick;
   each death throws its own debris (scrap, smoke, blades, bolts, data,
   water, bells, gold, feathers, cubes, scales, petals, lanterns).
   ===================================================================== */
const BOSS_FX = {
  warden: ['drop', 'scrap'], hydra: ['fly', 'scrap'], kage: ['smoke', 'smoke'], shogun: ['rise', 'blades'], raijin: ['thunder', 'thunder'],
  renull: ['glitch', 'glitch'], leviathan: ['splash', 'splash'], benkei: ['bells', 'bells'], prime: ['assemble', 'gold'], valkyrie: ['dive', 'feathers'],
  chimera: ['assemble', 'glitch'], genesis: ['cubes', 'cubes'], oryu: ['coil', 'scales'], tenkai: ['beam', 'gold'], izanami: ['petals', 'petals'], hyakki: ['parade', 'lanterns']
};
const BossFX = {
  ps: [], cur: null, last: null, t: 0,
  style(b) { const id = (b.id || '').replace(/^(ex_|ev_)/, ''); return BOSS_FX[id] || ['drop', 'scrap']; },
  col(b) { return (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || (b.info && b.info.col) || '#ff0844'; },
  add(o) { if (this.ps.length < 320) this.ps.push(Object.assign({ t: 0, l: 1, vx: 0, vy: 0, g: 0, r: 4, rot: 0, vr: 0, a: 1 }, o)); },
  rnd(a, b) { return a + Math.random() * (b - a); },
  /* ---- a frame: follow the boss, spawn the style's particles ---- */
  tick(rd) {
    this.t += rd; const b = Boss.cur;
    if (b && (!this.cur || this.cur.b !== b)) { const fresh = b.enter < 1 && !b.dying; this.cur = { b, st: this.style(b), t: 0, landed: !fresh, k: 0 }; if (fresh) this.start(this.cur); }
    const c = this.cur;
    if (c && c.b === b && b) {
      c.t += rd; const e = clamp(b.enter, 0, 1);
      if (e < 1) this.entering(c, b, e, rd);
      else if (!c.landed) { c.landed = true; this.arrive(c, b); }
      if (b.dying > 0) { if (!c.dead) { c.dead = true; c.dk = 0; } c.dk += rd; this.falling(c, b, rd); }
      c.x = b.x; c.y = b.y; c.r = b.r;
    }
    if (c && !b && c.dead && !c.done) { c.done = true; this.final(c); this.cur = null; }
    if (c && !b && !c.dead) this.cur = null;
    for (let i = this.ps.length - 1; i >= 0; i--) { const p = this.ps[i]; p.t += rd; if (p.t > p.l) { this.ps.splice(i, 1); continue; } p.vy += p.g * rd; p.x += p.vx * rd; p.y += p.vy * rd; p.rot += p.vr * rd; if (p.drag) { p.vx *= Math.pow(p.drag, rd); p.vy *= Math.pow(p.drag, rd); }
      if (p.to) { const k = Math.min(1, rd * p.to.k); p.x += (p.to.x - p.x) * k; p.y += (p.to.y - p.y) * k; } }
  },
  sting(st) { // a sound for each arrival
    try { switch (st) {
      case 'drop': Aud.sfx('warn'); Aud.tone(180, 60, .9, .25, 'sawtooth'); break;
      case 'fly': Aud.tone(120, 420, 1.6, .16, 'sawtooth'); break;
      case 'smoke': Aud.tone(520, 90, 1.4, .12, 'sine'); break;
      case 'rise': Aud.tone(60, 240, 1.8, .2, 'square'); break;
      case 'thunder': Aud.sfx('boom'); break;
      case 'glitch': Aud.sfx('hack'); break;
      case 'splash': Aud.tone(90, 40, 1.2, .25, 'triangle'); break;
      case 'bells': Aud.tone(392, 390, 1.4, .22, 'triangle'); break;
      case 'assemble': case 'cubes': Aud.sfx('warp'); break;
      case 'dive': Aud.tone(1200, 300, 1.1, .14, 'sawtooth'); break;
      case 'coil': Aud.sfx('roar'); break;
      case 'beam': Aud.tone(880, 1760, 1.6, .12, 'sine'); break;
      case 'petals': Aud.tone(660, 990, 1.4, .1, 'sine'); break;
      case 'parade': Aud.tone(262, 262, .5, .16, 'triangle'); break;
    } } catch (e) { errLog(e); }
  },
  start(c) { this.sting(c.st[0]); },
  /* ---- arrivals ---- */
  entering(c, b, e, rd) {
    const st = c.st[0], col = this.col(b), x = b.x, y = b.y, r = b.r, hy = b.hy != null ? b.hy : y; c.k += rd;
    const every = (dt, f) => { if (c.k >= dt) { c.k = 0; f(); } };
    switch (st) {
      case 'drop': every(.05, () => this.add({ k: 'spark', x: x + this.rnd(-r, r) * .6, y: y - r * .6, vx: this.rnd(-30, 30), vy: this.rnd(-260, -120), l: .5, c: '#ffb070', r: 2 })); break;
      case 'fly': every(.03, () => { for (const s of [-1, 1]) this.add({ k: 'trail', x: x + s * r * .7, y: y - r * .5, vy: -260, l: .5, c: col, r: 6 }); }); break;
      case 'smoke': every(.04, () => this.add({ k: 'puff', x: x + this.rnd(-r, r), y: y + this.rnd(-r, r), vx: this.rnd(-20, 20), vy: this.rnd(-30, 10), l: 1.4, c: '#120a1e', r: this.rnd(r * .5, r * 1.1), grow: 1.6 })); break;
      case 'rise': every(.03, () => this.add({ k: 'spark', x: x + this.rnd(-r * 1.6, r * 1.6), y: hy + r * .6, vx: this.rnd(-60, 60), vy: this.rnd(-320, -160), g: 520, l: .7, c: '#ffd27a', r: 2 })); break;
      case 'thunder': every(.22, () => { this.add({ k: 'bolt', x: x + this.rnd(-r, r), y, l: .18, c: '#dff4ff', r: 3, seed: Math.random() * 99 }); flash(.35, '#cfe8ff'); shake(.15); }); break;
      case 'glitch': every(.05, () => this.add({ k: 'bar', x: x + this.rnd(-r * 2, r * 2), y: y + this.rnd(-r * 1.4, r * 1.4), l: .18, c: Math.random() < .5 ? '#ff0844' : '#00f2fe', r: this.rnd(r * .4, r * 1.4) })); break;
      case 'splash': every(.025, () => this.add({ k: 'drop', x: x + this.rnd(-r, r), y: y + this.rnd(-r * .3, r * .3), vx: this.rnd(-160, 160), vy: this.rnd(-380, -160), g: 900, l: .8, c: '#8ff6ff', r: this.rnd(2, 4) })); break;
      case 'bells': every(.55, () => { this.add({ k: 'ring', x, y, l: .9, c: '#ffd27a', r: r * .6, grow: r * 3.2 }); try { Aud.tone(392 * (Math.random() < .5 ? 1 : 1.5), 390, 1, .14, 'triangle'); } catch (er) { errLog(er); } }); break;
      case 'assemble': every(.03, () => { const a = Math.random() * TAU, d = 220 + Math.random() * 120; this.add({ k: 'shard', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, to: { x, y, k: 3.2 }, l: .7, c: col, r: this.rnd(4, 9), vr: this.rnd(-8, 8) }); }); break;
      case 'dive': every(.03, () => { for (const s of [-1, 1]) this.add({ k: 'feather', x: x + s * this.rnd(r * .4, r * 1.6), y: y - this.rnd(0, r), vx: s * this.rnd(30, 90), vy: this.rnd(-60, 30), g: 40, l: 1.2, c: Math.random() < .5 ? '#ffffff' : col, r: this.rnd(4, 7), vr: this.rnd(-4, 4), drag: .4 }); }); break;
      case 'cubes': every(.025, () => { const a = Math.random() * TAU, d = 160 + Math.random() * 160; this.add({ k: 'cube', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, to: { x: x + this.rnd(-r, r) * .5, y: y + this.rnd(-r, r) * .5, k: 2.6 }, l: .8, c: col, r: this.rnd(4, 8), vr: this.rnd(-6, 6) }); }); break;
      case 'coil': every(.02, () => { const a = c.t * 7, d = r * (2.6 - e * 1.6); this.add({ k: 'scale', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * .8, l: .5, c: col, r: this.rnd(5, 8), rot: a }); }); break;
      case 'beam': every(.04, () => this.add({ k: 'mote', x: x + this.rnd(-r * .8, r * .8), y: y + this.rnd(-r, r), vy: this.rnd(-160, -60), l: .8, c: '#fff6cc', r: this.rnd(1.5, 3) })); break;
      case 'petals': every(.025, () => { const a = Math.random() * TAU, d = 200 + Math.random() * 100; this.add({ k: 'petal', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, to: { x: x + this.rnd(-r, r) * .4, y: y + this.rnd(-r, r) * .4, k: 1.8 }, l: 1.2, c: Math.random() < .5 ? '#ffb7d5' : '#ffe6f0', r: this.rnd(3, 6), vr: this.rnd(-6, 6) }); }); break;
      case 'parade': every(.16, () => { const s = Math.random() < .5 ? -1 : 1; this.add({ k: 'lantern', x: x + s * this.rnd(r * 1.4, r * 3), y: V.VH * this.rnd(.15, .85), to: { x: x + s * this.rnd(r, r * 1.6), y: y + this.rnd(-r, r), k: 1.2 }, l: 1.6, c: '#ff8a2a', r: this.rnd(6, 9) }); }); break;
    }
  },
  arrive(c, b) { // the moment it lands
    const st = c.st[0], col = this.col(b), x = b.x, y = b.y, r = b.r;
    this.add({ k: 'ring', x, y, l: .6, c: col, r: r * .8, grow: r * 4 }); this.add({ k: 'ring', x, y, l: .45, c: '#ffffff', r: r * .5, grow: r * 2.5 });
    shake(st === 'drop' || st === 'rise' || st === 'splash' ? .5 : .25); punch(.05);
    if (st === 'drop') { for (let i = 0; i < 26; i++) { const a = Math.random() * TAU, v = this.rnd(120, 320); this.add({ k: 'puff', x: x + Math.cos(a) * r * .6, y: y + Math.sin(a) * r * .4, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6, drag: .08, l: .9, c: '#3a3450', r: this.rnd(8, 16), grow: 1.4 }); } try { Aud.sfx('boom', 1); } catch (e) { errLog(e); } }
    if (st === 'thunder' || st === 'beam') flash(.5, st === 'beam' ? '#fff6cc' : '#cfe8ff');
    if (typeof FX3D !== 'undefined' && W3D.live) { FX3D.flashes.push({ x, y, c: rgb3(col), t: 0 }); FX3D.burst(x, y, rgb3(col), 22, 220, 14); }
  },
  /* ---- falls ---- */
  falling(c, b, rd) {
    const st = c.st[1], col = this.col(b), x = b.x, y = b.y, r = b.r; c.fk = (c.fk || 0) + rd; if (c.fk < .07) return; c.fk = 0;
    this.burst(st, col, x + this.rnd(-r, r) * .8, y + this.rnd(-r, r) * .8, r, 5);
  },
  final(c) {
    const st = c.st[1], col = this.col(c.b), x = c.x, y = c.y, r = c.r || 50;
    this.burst(st, col, x, y, r, 46); this.add({ k: 'ring', x, y, l: .8, c: col, r: r, grow: r * 6 }); this.add({ k: 'pillar', x, y, l: 1.1, c: col, r: r * 1.2 });
    if (typeof FX3D !== 'undefined' && W3D.live) { for (let i = 0; i < 3; i++) FX3D.flashes.push({ x: x + (i - 1) * 30, y, c: rgb3(col), t: -i * .1 }); FX3D.burst(x, y, rgb3(col), 40, 300, 20); }
  },
  burst(st, col, x, y, r, n) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = this.rnd(80, 340), vx = Math.cos(a) * v, vy = Math.sin(a) * v;
      switch (st) {
        case 'scrap': this.add({ k: 'shard', x, y, vx, vy, g: 380, drag: .5, l: this.rnd(.6, 1.2), c: Math.random() < .4 ? col : '#5a5f74', r: this.rnd(3, 8), vr: this.rnd(-12, 12) }); break;
        case 'smoke': this.add({ k: 'puff', x, y, vx: vx * .4, vy: vy * .4, drag: .2, l: this.rnd(.8, 1.6), c: '#140a22', r: this.rnd(r * .3, r * .7), grow: 2 }); break;
        case 'blades': this.add({ k: 'blade', x, y, vx, vy, drag: .4, l: this.rnd(.5, 1), c: Math.random() < .5 ? col : '#e8f2ff', r: this.rnd(8, 16), rot: a, vr: this.rnd(-10, 10) }); break;
        case 'thunder': if (i % 6 === 0) this.add({ k: 'bolt', x: x + this.rnd(-r, r), y, l: .2, c: '#dff4ff', r: 3, seed: Math.random() * 99 }); else this.add({ k: 'spark', x, y, vx, vy, g: 200, l: .6, c: '#cfe8ff', r: 2 }); break;
        case 'glitch': this.add({ k: 'bar', x: x + vx * .3, y: y + vy * .3, l: this.rnd(.15, .4), c: Math.random() < .5 ? '#ff0844' : '#00f2fe', r: this.rnd(10, 30) }); break;
        case 'splash': this.add({ k: 'drop', x, y, vx, vy: vy - 200, g: 900, l: .9, c: '#8ff6ff', r: this.rnd(2, 5) }); break;
        case 'bells': if (i % 9 === 0) this.add({ k: 'ring', x, y, l: .9, c: '#ffd27a', r: r * .4, grow: r * 4 }); else this.add({ k: 'spark', x, y, vx, vy, g: 260, l: .7, c: '#ffd27a', r: 2 }); break;
        case 'gold': this.add({ k: 'coin', x, y, vx, vy: vy - 160, g: 600, l: this.rnd(.7, 1.3), c: '#ffd700', r: this.rnd(3, 5), vr: this.rnd(-14, 14) }); break;
        case 'feathers': this.add({ k: 'feather', x, y, vx, vy, g: 60, drag: .3, l: this.rnd(1, 1.8), c: Math.random() < .6 ? '#ffffff' : col, r: this.rnd(4, 8), vr: this.rnd(-5, 5) }); break;
        case 'cubes': this.add({ k: 'cube', x, y, vx, vy, drag: .6, l: this.rnd(.6, 1.2), c: col, r: this.rnd(3, 8), vr: this.rnd(-8, 8) }); break;
        case 'scales': this.add({ k: 'scale', x, y, vx, vy, g: 300, drag: .5, l: this.rnd(.6, 1.2), c: col, r: this.rnd(4, 8), rot: a, vr: this.rnd(-8, 8) }); break;
        case 'petals': this.add({ k: 'petal', x, y, vx, vy: vy * .6, g: 40, drag: .4, l: this.rnd(1, 2), c: Math.random() < .5 ? '#ffb7d5' : '#ffe6f0', r: this.rnd(3, 6), vr: this.rnd(-6, 6) }); break;
        case 'lanterns': if (i % 4 === 0) this.add({ k: 'lantern', x, y, vx: vx * .3, vy: -this.rnd(40, 120), l: this.rnd(1.4, 2.2), c: '#ff8a2a', r: this.rnd(6, 9) }); else this.add({ k: 'spark', x, y, vx, vy, g: 200, l: .6, c: '#ffb36b', r: 2 }); break;
        default: this.add({ k: 'spark', x, y, vx, vy, g: 300, l: .7, c: col, r: 2 });
      } }
  },
  /* the boss sprite during its arrival: each style moves it its own way */
  sprite(b, f) {
    const c = this.cur; if (!c || c.b !== b || b.enter >= 1 || b.dying > 0 || CALM) return f();
    const e = clamp(b.enter, 0, 1), q = 1 - e, st = c.st[0], x = b.x, y = b.y;
    cx.save();
    switch (st) {
      case 'drop': { const s = 1 + q * q * 1.6; cx.translate(x, y); cx.scale(s, s); cx.translate(-x, -y); cx.globalAlpha = Math.min(1, e * 3); break; }
      case 'smoke': cx.globalAlpha = e * e; break;
      case 'rise': { const s = .2 + e * .8; cx.translate(x, y + b.r); cx.scale(1, s); cx.translate(-x, -y - b.r); break; }
      case 'thunder': cx.globalAlpha = ((this.t * 24) | 0) % 3 === 0 ? .3 : Math.min(1, .3 + e); break;
      case 'glitch': cx.translate(Math.sin(this.t * 90) * q * 18, 0); cx.globalAlpha = Math.random() < q * .5 ? .25 : 1; break;
      case 'splash': { const s = .1 + e * .9; cx.translate(x, y); cx.scale(1, s); cx.translate(-x, -y); break; }
      case 'assemble': case 'cubes': case 'petals': cx.globalAlpha = Math.min(1, e * 1.3); { const s = .6 + e * .4; cx.translate(x, y); cx.scale(s, s); cx.translate(-x, -y); } break;
      case 'dive': { const s = 1 + q * 1.1; cx.translate(x, y); cx.rotate(q * .6); cx.scale(s, s); cx.translate(-x, -y); break; }
      case 'coil': cx.translate(x, y); cx.rotate(q * q * 9); cx.translate(-x, -y); break;
      case 'beam': cx.globalAlpha = Math.min(1, e * 1.6); break;
      default: break;
    }
    try { f(); } finally { cx.restore(); }
  },
  /* ---- drawing, in world space (on the roof in 3D) ---- */
  draw() {
    const c = this.cur, b = Boss.cur;
    if (c && b && c.b === b && b.enter < 1 && !CALM) this.under(c, b, clamp(b.enter, 0, 1));
    if (!this.ps.length) return;
    cx.save();
    for (const p of this.ps) { const k = p.t / p.l, a = (1 - k) * p.a; if (a <= 0) continue; cx.globalAlpha = Math.min(1, a * 1.4);
      switch (p.k) {
        case 'spark': case 'mote': cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = p.c; cx.lineWidth = p.r; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); cx.stroke(); break;
        case 'trail': cx.globalCompositeOperation = 'lighter'; glow(p.x, p.y, p.r * 3 * (1 - k * .5), p.c, .6 * a); break;
        case 'puff': cx.globalCompositeOperation = 'source-over'; cx.fillStyle = p.c; cx.globalAlpha = a * .6; cx.beginPath(); cx.arc(p.x, p.y, p.r * (1 + k * (p.grow || 1)), 0, TAU); cx.fill(); break;
        case 'bolt': { cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = p.c; cx.lineWidth = 3; cx.beginPath(); let yy = p.y - 700, xx = p.x; cx.moveTo(xx, yy); for (let i = 1; i <= 9; i++) { yy = p.y - 700 + i * 700 / 9; xx = p.x + (cmRand(p.seed + i) - .5) * 60 * (1 - i / 9); cx.lineTo(xx, yy); } cx.stroke(); glow(p.x, p.y, 60, '#dff4ff', .7 * a); break; }
        case 'bar': cx.globalCompositeOperation = 'lighter'; cx.fillStyle = p.c; cx.fillRect(p.x - p.r, p.y - 2, p.r * 2, 4); break;
        case 'drop': cx.globalCompositeOperation = 'lighter'; cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, TAU); cx.fill(); break;
        case 'ring': cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = p.c; cx.lineWidth = 4 * (1 - k) + 1; cx.beginPath(); cx.arc(p.x, p.y, p.r + (p.grow || 0) * k, 0, TAU); cx.stroke(); break;
        case 'shard': cx.globalCompositeOperation = 'source-over'; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c; cx.beginPath(); cx.moveTo(0, -p.r); cx.lineTo(p.r * .6, p.r * .5); cx.lineTo(-p.r * .6, p.r * .5); cx.closePath(); cx.fill(); cx.restore(); break;
        case 'cube': cx.globalCompositeOperation = 'lighter'; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.strokeStyle = p.c; cx.lineWidth = 2; cx.strokeRect(-p.r, -p.r, p.r * 2, p.r * 2); cx.fillStyle = p.c; cx.globalAlpha *= .3; cx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); cx.restore(); break;
        case 'feather': case 'petal': cx.globalCompositeOperation = 'source-over'; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * (p.k === 'petal' ? .55 : .28), 0, 0, TAU); cx.fill(); cx.restore(); break;
        case 'scale': cx.globalCompositeOperation = 'lighter'; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.strokeStyle = p.c; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, p.r, Math.PI * .1, Math.PI * .9); cx.stroke(); cx.restore(); break;
        case 'coin': cx.globalCompositeOperation = 'lighter'; cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(p.x, p.y, p.r * Math.abs(Math.cos(p.rot)) + .6, p.r, 0, 0, TAU); cx.fill(); break;
        case 'blade': cx.globalCompositeOperation = 'lighter'; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.strokeStyle = p.c; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(-p.r, 0); cx.lineTo(p.r, 0); cx.stroke(); cx.restore(); break;
        case 'lantern': cx.globalCompositeOperation = 'lighter'; glow(p.x, p.y, p.r * 3, p.c, .5 * a); cx.globalCompositeOperation = 'source-over'; cx.fillStyle = '#ffb36b'; cx.beginPath(); cx.ellipse(p.x, p.y, p.r * .7, p.r, 0, 0, TAU); cx.fill(); cx.fillStyle = '#5a1a08'; cx.fillRect(p.x - p.r * .5, p.y - p.r * 1.05, p.r, 2); cx.fillRect(p.x - p.r * .5, p.y + p.r * .9, p.r, 2); break;
        case 'pillar': cx.globalCompositeOperation = 'lighter'; { const g = cx.createLinearGradient(p.x, p.y - 900, p.x, p.y); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, p.c); cx.fillStyle = g; cx.globalAlpha = a * .5; const w = p.r * (1 - k * .7); cx.fillRect(p.x - w, p.y - 900, w * 2, 900); } break;
      } }
    cx.restore();
  },
  under(c, b, e) { // ground marks under the arrival
    const st = c.st[0], col = this.col(b), x = b.x, hy = b.hy != null ? b.hy : b.y, r = b.r, q = 1 - e; cx.save();
    if (st === 'drop') { cx.fillStyle = '#000'; cx.globalAlpha = .45 * e; cx.beginPath(); cx.ellipse(x, hy, r * (.4 + e * .9), r * (.25 + e * .5), 0, 0, TAU); cx.fill(); cx.globalAlpha = 1; cx.strokeStyle = '#ff3b3b'; cx.lineWidth = 2; cx.setLineDash(DASH8); cx.beginPath(); cx.arc(x, hy, r * (1 + q * 1.5), 0, TAU); cx.stroke(); cx.setLineDash([]); }
    if (st === 'rise') { cx.globalCompositeOperation = 'lighter'; cx.fillStyle = '#ffd27a'; cx.globalAlpha = .8; cx.fillRect(x - r * 1.8 * e, hy + r * .6 - 2, r * 3.6 * e, 4); glow(x, hy + r * .6, r * 1.6 * e, '#ffb36b', .5); }
    if (st === 'splash') { cx.strokeStyle = '#8ff6ff'; cx.globalAlpha = .6 * q; cx.lineWidth = 3; for (let i = 0; i < 3; i++) { cx.beginPath(); cx.arc(x, hy, r * (.6 + ((this.t * 1.4 + i / 3) % 1) * 2.4), 0, TAU); cx.stroke(); } }
    if (st === 'beam') { cx.globalCompositeOperation = 'lighter'; const g = cx.createLinearGradient(x, hy - 1200, x, hy); g.addColorStop(0, 'rgba(255,246,204,0)'); g.addColorStop(1, 'rgba(255,246,204,.85)'); cx.fillStyle = g; cx.globalAlpha = Math.min(1, q * 2); const w = r * (.6 + Math.sin(this.t * 30) * .05); cx.fillRect(x - w, hy - 1200, w * 2, 1200); glow(x, hy, r * 2, '#fff6cc', .5 * q); }
    if (st === 'fly') { cx.globalCompositeOperation = 'lighter'; glow(x, b.y, r * 2.2, col, .35 * q); }
    if (st === 'coil' || st === 'petals' || st === 'assemble' || st === 'cubes') { cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = col; cx.globalAlpha = .5 * q; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, b.y, r * (1 + q * 2), this.t * 3, this.t * 3 + Math.PI * 1.3); cx.stroke(); }
    if (st === 'smoke') { cx.fillStyle = '#0a0612'; cx.globalAlpha = .5 * q; cx.beginPath(); cx.ellipse(x, hy, r * 2, r * 1.2, 0, 0, TAU); cx.fill(); }
    cx.restore();
  }
};
{
  // the boss sprite moves its own way during the arrival
  const bd = Boss.draw.bind(Boss); Boss.draw = function () { const b = this.cur; if (!b) return bd(); BossFX.sprite(b, bd); };
  // particles and ground marks are drawn over the boss in world space; ticked once a frame
  const fd = FX.drawHigh.bind(FX); FX.drawHigh = function () { fd(); try { if (inRun() && !(REPLAY.on && REPLAY.fast)) BossFX.draw(); } catch (e) { errLog(e); } };
  Pipe.on('pre', 'boss-fx', rd => { if (inRun() && !G.photo && !(REPLAY.on && REPLAY.fast)) BossFX.tick(rd * (G.state === 'PLAY' ? 1 : 0)); else if (!inRun()) { BossFX.ps.length = 0; BossFX.cur = null; } }, 5);
}
