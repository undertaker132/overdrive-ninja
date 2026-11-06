/* =====================================================================
   SKY DIVER — an enemy that uses height (new in v29).
   It flies high above the roof, out of reach of the blade; then it marks
   a spot under you with a red ring, dives onto it with a shockwave, and
   stays on the roof for a moment, where it can be cut, before it climbs
   again. Dodge the ring, then punish the landing.
   - sim: e.alt is its height (0 on the roof, 1 high). High divers cannot
     be hit or targeted (blade, aim assist, grapple). It spawns only in
     runs recorded with v29 or newer (old replays stay exact), in endless
     from car 4, in the tower, and in the later story chapters.
   - drawing: 2D lifts the sprite over its shadow; 3D lifts it for real.
   ===================================================================== */
ET.DIVER = EDEF.length;
EDEF.push({ id: 'diver', name: 'SKY DIVER', r: 16, hp: 2, spd: 175, col: '#ff4fd8', v: 420, coins: 4 });
EDEF_CB.push('#f0e442'); ENAME2T.diver = ET.DIVER;
ENDLESS_UNLOCK.push([4, 'diver', 1.2]);
CODEX_E.push([ET.DIVER, 'Flies high, out of reach. When a red ring appears under you, move: it dives onto the ring. Cut it while it is on the roof, before it climbs again.']);
CODEX_LORE[ET.DIVER] = 'Kurogane sky-diver. Built to drop on rooftop runners from the clouds over the line.';
for (const s of STAGES) if (s.ch >= 10 && s.pool && !s.pool.diver && s.obj && s.obj.t !== 'boss') s.pool.diver = .7; // the later chapters (story runs are not recorded)
const DIVE = { soar: 0, mark: 1, dive: 2, ground: 3, rise: 4, high: .35 };
function diverUpdate(e, dt, sp) {
  if (e.alt == null) e.alt = 1;
  switch (e.st) {
    case DIVE.soar: { // drift high above, near the hero
      if (!e.stT) e.stT = 2.2 + R.f() * 1.4;
      const hx = clamp(P.x + Math.sin(e.t * 1.3 + e.uid) * 110, V.L + 30, V.R - 30), hy = clamp(P.y - 170 + Math.cos(e.t * .9) * 40, 40, V.VH - 140), dx = hx - e.x, dy = hy - e.y, d = Math.hypot(dx, dy) || 1;
      const v = Math.min(d / Math.max(dt, 1e-4), sp); e.x += dx / d * v * dt; e.y += dy / d * v * dt; e.ang = Math.atan2(dy, dx); e.alt = Math.min(1, e.alt + dt * 2);
      if (e.spawnT <= 0) { e.stT -= dt; if (e.stT <= 0) { e.st = DIVE.mark; e.stT = .75; e.tx = P.x; e.ty = P.y; Aud.esfx(e.type, 1); } }
      break;
    }
    case DIVE.mark: e.stT -= dt; e.ang = Math.atan2(e.ty - e.y, e.tx - e.x); if (e.stT <= 0) { e.st = DIVE.dive; e.stT = .32; e.dx0 = e.x; e.dy0 = e.y; } break; // the ring is set: it will land there
    case DIVE.dive: {
      e.stT -= dt; const k = 1 - Math.max(0, e.stT) / .32; e.x = lerp(e.dx0, e.tx, k); e.y = lerp(e.dy0, e.ty, k); e.alt = 1 - k * k;
      if (e.stT <= 0) { e.alt = 0; e.st = DIVE.ground; e.stT = 1.5; FX.ring(e.x, e.y, 70, e.col, 4); shake(.25); Aud.sfx('boom', 0);
        if (dist(P.x, P.y, e.x, e.y) < 58 + P.r * .5) hurt('touch', ET.DIVER); }
      break;
    }
    case DIVE.ground: e.stT -= dt; e.alt = 0; if (e.stT <= 0) { e.st = DIVE.rise; e.stT = .45; } break; // open to the blade
    case DIVE.rise: e.stT -= dt; e.alt = 1 - Math.max(0, e.stT) / .45; if (e.stT <= 0) { e.alt = 1; e.st = DIVE.soar; e.stT = 2 + R.f() * 1.6; } break;
  }
}
function diverHigh(e) { return e.type === ET.DIVER && e.alt > DIVE.high; }
{
  // spawn: grounded fields reset for every pooled enemy; divers start high
  const se0 = spawnEnemy; spawnEnemy = function (t, x, y, elite) { const e = se0(t, x, y, elite); if (e) { e.alt = t === ET.DIVER ? 1 : 0; e.tx = e.ty = 0; } return e; };
  // behavior
  const ue0 = updateEnemy; updateEnemy = function (e, dt) {
    if (e.type !== ET.DIVER || e.al > 0 || e.stun > 0 || e.kbx || e.kby) return ue0(e, dt);
    if (e.spawnT > 0) { e.spawnT -= dt; e.scale = 1 - Math.max(0, e.spawnT) / .45; if (e.spawnT <= 0) { e.scale = 1; Aud.esfx(e.type, 0); } } else e.scale = damp(e.scale, 1, 10, dt);
    if (e.fl > 0) e.fl -= 5 * dt; if (e.slw > 0) e.slw -= dt; if (e.mark > 0) e.mark -= dt; e.t += dt; G.shooter = e.type;
    const sp = e.spd * (.85 + G.skill * .3) * (e.slw > 0 ? .45 : 1); diverUpdate(e, dt, sp);
  };
  // old replays never meet a diver
  const sp0 = Director.setPool.bind(Director); Director.setPool = function (p) { if (p && p.diver && !simV(29)) { p = Object.assign({}, p); delete p.diver; } sp0(p); };
}
/* ---- drawing ---- */
function drawDiverArt(e, col) { // an original winged dart: delta wings, twin thrusters, one eye
  const r = e.r;
  cx.fillStyle = '#1a0a1e'; cx.strokeStyle = col; cx.lineWidth = 2.2;
  cx.beginPath(); cx.moveTo(r * 1.3, 0); cx.lineTo(-r * .7, -r * 1.25); cx.lineTo(-r * .35, 0); cx.lineTo(-r * .7, r * 1.25); cx.closePath(); cx.fill(); cx.stroke();
  cx.fillStyle = col; cx.globalAlpha *= .9; for (const s of [-1, 1]) { cx.fillRect(-r * .95, s * r * .45 - 2.5, r * .5, 5); glow(-r * 1.05, s * r * .45, 9, col, .7); }
  cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(r * .35, 0, r * .22, 0, TAU); cx.fill(); cx.fillStyle = col; cx.beginPath(); cx.arc(r * .42, 0, r * .11, 0, TAU); cx.fill();
}
{
  const de0 = drawEnemy; drawEnemy = function (e) {
    if (e.type !== ET.DIVER) return de0(e);
    const col = e.fl > .3 ? '#ffffff' : e.col, a = e.alt || 0, lift = a * 62;
    // the target ring on the roof
    if ((e.st === DIVE.mark || e.st === DIVE.dive) && e.alive) { const k = e.st === DIVE.mark ? 1 - e.stT / .75 : 1; cx.save(); cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.globalAlpha = .5 + .5 * Math.sin(CAM.t * 24); cx.beginPath(); cx.arc(e.tx, e.ty, 58 * (1.4 - k * .4), 0, TAU); cx.stroke(); cx.globalAlpha = .18; cx.fillStyle = '#ff0844'; cx.beginPath(); cx.arc(e.tx, e.ty, 58, 0, TAU); cx.fill(); cx.restore(); }
    if (!(W3D.live && cx === W3D.cx0)) { cx.save(); cx.globalAlpha = .35 * (1 - a * .6) * e.vis; cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(e.x, e.y + 4, e.r * (1.1 - a * .4), e.r * (.5 - a * .2), 0, 0, TAU); cx.fill(); cx.restore(); } // its shadow on the roof (3D casts its own)
    const body = () => { cx.save(); cx.translate(e.x, e.y - lift); cx.globalAlpha = e.vis * (a > DIVE.high ? .85 : 1); const s = (e.scale || 1) * (1 + a * .22); cx.scale(s, s);
      glow(0, 0, e.r * 2.4, col, .4); cx.rotate(e.ang || 0); drawDiverArt(e, col); cx.restore(); };
    if (W3D.live && cx === W3D.cx0) { if (W3D.models()) return; W3D.stand(e.x, e.y, body); } else body(); // 3D: upright over its real shadow (3D MODELS: the 3D layer draws it)
  };
  // 3D models: a real height
  const we0 = W3D.enemy.bind(W3D); W3D.enemy = function (e) {
    if (e.type !== ET.DIVER) return we0(e); if (!e.alive || e.vis < .2) return;
    const g = GL3D, c = rgb3(e.fl > .3 ? '#ffffff' : e.col), z = 10 + (e.alt || 0) * 120, r = e.r, f = e.ang || 0;
    g.add('cyl', e.x + r * .3, e.y + r * .45, .12, 0, r * 2.3 * (1 - (e.alt || 0) * .4), r * 1.5 * (1 - (e.alt || 0) * .4), .2, [.01, .01, .03], 0, 0);
    g.add('tri', e.x, e.y, z, f, r * 2.4, r * 2.4, r * .35, [.1, .04, .12], 0, 0); g.add('tri', e.x, e.y, z + r * .35, f, r * 1.6, r * 1.6, r * .2, c, .7, 0);
    for (const sd of [-1, 1]) { const px = e.x - Math.cos(f) * r * .9 - Math.sin(f) * sd * r * .45, py = e.y - Math.sin(f) * r * .9 + Math.cos(f) * sd * r * .45; g.glow(px, py, z + 2, 8, c, .8); }
    if (e.st === DIVE.mark || e.st === DIVE.dive) g.floorGlow(e.tx, e.ty, .4, 60, [1, .05, .25], .35);
  };
}
/* ---- targeting: a high diver is out of reach ---- */
{
  const he0 = hitEnemy; hitEnemy = function (e) { if (diverHigh(e)) return; return he0.apply(this, arguments); };
}
{ const dm0 = damageEnemy; damageEnemy = function (e) { if (diverHigh(e)) return false; return dm0.apply(this, arguments); }; } // nothing reaches it up there: blades, skills, blasts, pets
