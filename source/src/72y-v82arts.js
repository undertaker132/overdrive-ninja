/* ==========================================================================
   v82 · A SIGNATURE ART FOR EVERY CLASS. The Hero Forge classes only gave
   numbers (+damage, +charges). Now each plays its own way, with the same
   controls (dash, stand, parry):
     NINJA    SHADOW CLONE  three dashes in quick succession leave a shadow
                            clone that keeps cutting for a moment
     SAMURAI  IAI STANCE    stand still for a breath: the next dash draws a
                            huge iai cut in front of you
     SHINOBI  DEATH MARKS   cuts landed while vanished mark enemies; with
                            three marks, the next dash strikes all of them
     ONMYOJI  SPIRIT WARD   every 8th kill lays a ward circle that burns
                            enemy shots inside it
   Only in the forged hero's runs (Trials, World Boss, Raid), which are not
   replayed: replays and leaderboards are unchanged.
   ========================================================================== */
const ARTS = {
  ninja: { n: 'SHADOW CLONE', d: 'Three dashes in quick succession leave a shadow clone that keeps cutting.', c: '#00f2fe' },
  samurai: { n: 'IAI STANCE', d: 'Stand still for a breath: your next dash draws a huge iai cut.', c: '#ff0844' },
  shinobi: { n: 'DEATH MARKS', d: 'Cuts landed while vanished mark enemies. With three marks, your next dash strikes them all.', c: '#c45bff' },
  onmyoji: { n: 'SPIRIT WARD', d: 'Every 8th kill lays a ward circle that burns enemy shots inside it.', c: '#ffd23f' }
};
const Arts = {
  /* v83: every hero has its art, in every run (a simulation rule since 83: replays of older versions play back as before); the forged hero keeps its class's */
  BODY: { knight: 'samurai', shogun: 'samurai', chromesam: 'samurai', sovereign: 'samurai', mecha: 'samurai', exo: 'samurai', viking: 'samurai', rider: 'samurai', oni: 'samurai', raijin: 'samurai', ashura: 'samurai', ronin: 'samurai', wolf: 'samurai', yeti: 'samurai',
    shinobi2: 'shinobi', yurei: 'shinobi', reaper: 'shinobi', tengu: 'shinobi', netrunner: 'shinobi', veil: 'shinobi', kitsune: 'shinobi', hunter: 'shinobi',
    witch: 'onmyoji', lich: 'onmyoji', seraph: 'onmyoji', idol: 'onmyoji', foxsage: 'onmyoji', pumpkin: 'onmyoji', goo: 'onmyoji', skull: 'onmyoji' },
  on() { if (G.state !== 'PLAY') return false; if (G.hero) return !REPLAY.on && typeof Hero !== 'undefined'; return simV(83) && G.mode !== 'puzzle' && G.mode !== 'dojo' && !!P.skin; },
  cls() { if (G.hero && typeof Hero !== 'undefined') return Hero.f().cls; return this.BODY[(P.skin && P.skin.body) || 'ninja'] || 'ninja'; },
  reset() { this.dash = []; this.cd = 0; this.still = 0; this.ready = false; this.pulse = 0; this.marks = 0; this.mcd = 0; this.kills = 0; this.wards = []; },
  /* each sim step */
  step(dt) {
    const c = this.cls(); this.cd = Math.max(0, this.cd - dt); this.mcd = Math.max(0, this.mcd - dt);
    if (c === 'samurai') { // the stance: standing still with a charge ready
      const moving = P.dashT > 0 || Math.abs(P.vx) + Math.abs(P.vy) > 80;
      if (moving || P.ch <= 0) { this.still = 0; } else this.still += dt;
      if (!this.ready && this.still >= .75) { this.ready = true; this.pulse = 0; FX.ring(P.x, P.y, 70, '#ff0844', 5); FX.text(P.x, P.y - 40, lt('IAI STANCE'), '#ff0844', 14, true); Aud.sfx('lock'); }
      if (this.ready) { this.pulse -= dt; if (this.pulse <= 0) { this.pulse = .35; FX.ring(P.x, P.y, 46, '#ff0844', 3); } }
    }
    if (c === 'shinobi') { let n = 0; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.mk82) { n++; if (((G.time * 4) | 0) % 2 === 0 && (this.blink | 0) !== ((G.time * 4) | 0)) FX.ring(e.x, e.y, e.r * 1.6, '#c45bff', 2); } } this.marks = n; this.blink = (G.time * 4) | 0; }
    if (c === 'onmyoji') for (let k = this.wards.length - 1; k >= 0; k--) { const w = this.wards[k]; w.t -= dt; if (w.t <= 0) { this.wards.splice(k, 1); FX.spark(w.x, w.y, '#ffd23f', 10); continue; }
      w.p -= dt; if (w.p <= 0) { w.p = .45; FX.ring(w.x, w.y, w.r, '#ffd23f', 3); }
      for (let i = 0; i < BU.n; i++) { const b = BU.a[i]; if (b.rf || !b.alive) continue; if ((b.x - w.x) ** 2 + (b.y - w.y) ** 2 < w.r * w.r) { b.alive = false; FX.spark(b.x, b.y, '#ffd23f', 4); } } }
  },
  /* a dash */
  slash(a) {
    const c = this.cls(), t = G.time;
    if (c === 'ninja') { this.dash.push(t); while (this.dash.length && t - this.dash[0] > 1.1) this.dash.shift();
      if (this.dash.length >= 3 && this.cd <= 0) { const o = ECHO.get(); if (o) { o.x = P.x; o.y = P.y; o.vx = o.vy = 0; o.l = 2.6; o.cd = .1; o.ang = a; o.seq = 0; o.art82 = 1; }
        this.cd = 5; this.dash.length = 0; FX.ring(P.x, P.y, 110, '#00f2fe', 4); FX.call(lt('SHADOW CLONE'), '#00f2fe', 1.4); Aud.sfx('warp'); } }
    if (c === 'samurai' && this.ready) { this.ready = false; this.still = 0; this.iai(a); }
    if (c === 'shinobi' && this.marks >= 3 && this.mcd <= 0) { this.strike(); }
  },
  iai(a) { // the drawn cut: a wide, long arc in front of the dash
    const R = 240, dmg = 3 * P.w.dmg * P.dmgMul * G.dmgMod;
    FX.arc(P.x, P.y, a, R, '#ffffff', 14); FX.arc(P.x, P.y, a, R - 34, '#ff0844', 9); FX.call(lt('IAI'), '#ff0844', 1.6); shake(.5); Aud.sfx('zan');
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0) continue; const dx = e.x - P.x, dy = e.y - P.y; if (dx * dx + dy * dy > (R + e.r) ** 2 || Math.abs(angDiff(Math.atan2(dy, dx), a)) > 1.15) continue; e.sh = 0; damageEnemy(e, dmg, Math.atan2(dy, dx), 3); }
    const B = Boss.cur; if (B && B.dying <= 0 && B.enter >= 1 && dist(B.x, B.y, P.x, P.y) < R + B.r && Math.abs(angDiff(Math.atan2(B.y - P.y, B.x - P.x), a)) < 1.15) Boss.hitBody(B, dmg, a, false, P.x, P.y);
  },
  strike() { // every marked enemy is cut at once, a streak of shadow to each
    const dmg = 2.2 * P.w.dmg * P.dmgMul * G.dmgMod; let n = 0;
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || !e.mk82) continue; e.mk82 = 0; const a = Math.atan2(e.y - P.y, e.x - P.x); FX.streak(P.x, P.y, a, '#c45bff', 10); FX.arc(e.x, e.y, a, 40, '#ffffff', 6); damageEnemy(e, dmg, a, 3); n++; }
    if (n) { this.mcd = 2.5; FX.call(lt('DEATH MARKS'), '#c45bff', 1.4); Aud.sfx('zan'); shake(.35); }
  },
  /* a hit: the shinobi marks what it cuts while vanished */
  hit(e, src) { if (this.cls() === 'shinobi' && src === 0 && P.inv > 0 && e && e.alive && !e.mk82) { e.mk82 = 1; FX.text(e.x, e.y - e.r - 14, '✕', '#c45bff', 14); } },
  kill(e) { if (this.cls() === 'onmyoji') { this.kills++; if (this.kills % 8 === 0) { this.wards.push({ x: P.x, y: P.y, r: 135, t: 4.5, p: 0 }); FX.call(lt('SPIRIT WARD'), '#ffd23f', 1.4); FX.ring(P.x, P.y, 135, '#ffd23f', 5); Aud.sfx('star'); } } }
};
Arts.reset();
{
  const ha = Hero.apply.bind(Hero); Hero.apply = function () { const r = ha(); try { Arts.reset(); } catch (e) { errLog(e); } return r; };
  const al = applyLoadout; applyLoadout = function () { const r = al.apply(this, arguments); try { Arts.reset(); Arts.told = 0; } catch (e) { errLog(e); } return r; }; // (every run starts clean)
  Pipe.on('post', 'arts83', () => { try { if (Arts.told || typeof G === 'undefined' || G.state !== 'PLAY' || G.freeze > 0 || G.time < 1.2 || !Arts.on()) return; Arts.told = 1; const A = ARTS[Arts.cls()]; if (A) hint('art83' + Arts.cls(), lt('SIGNATURE ART') + ' · ' + lt(A.n) + ': ' + lt(A.d)); } catch (e) { errLog(e); } }, 50); // (what this hero can do, the first few runs)
  const ss = safeStep; safeStep = function () { const r = ss.apply(this, arguments); try { if (Arts.on() && G.freeze <= 0) Arts.step(CFG.step); } catch (e) { errLog(e); } return r; };
  const sl = slash; slash = function (a) { const s0 = P.seq, r = sl.apply(this, arguments); try { if (Arts.on() && P.seq !== s0) Arts.slash(P.ang); } catch (e) { errLog(e); } return r; };
  const de = damageEnemy; damageEnemy = function (e, d, a, src) { const r = de.apply(this, arguments); try { if (Arts.on()) Arts.hit(e, src); } catch (er) { errLog(er); } return r; };
  const ke = killEnemy; killEnemy = function (e) { const was = e && e.alive, r = ke.apply(this, arguments); try { if (was && Arts.on()) Arts.kill(e); } catch (er) { errLog(er); } return r; };
}
