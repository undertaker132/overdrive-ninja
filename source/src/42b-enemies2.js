/* =====================================================================
   ENEMIES 2 — medic, mimic, miner, mirror and the three mini-bosses
   (enforcer, spider tank, void wraith): their bodies, plus the knockback
   collisions the Titan Gauntlets cause. Drawn in the enemy's local frame.
   ===================================================================== */
function drawEnemy2(e, t, r, col) {
  if (t === ET.MEDIC) { // hovering medic drone: white hull, green cross, spinning rotor ring
    cx.save(); cx.rotate(e.t * 3); cx.strokeStyle = col; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, r + 4, 0, 4.2); cx.stroke(); cx.restore();
    cx.fillStyle = e.fl > .3 ? '#ffffff' : '#e8fff6'; cx.beginPath(); cx.arc(0, 0, r * .85, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = col; cx.fillRect(-r * .18, -r * .58, r * .36, r * 1.16); cx.fillRect(-r * .58, -r * .18, r * 1.16, r * .36);
  } else if (t === ET.MINER) { // squat crawler with a mine hopper on its back
    cx.rotate(e.ang); cx.strokeStyle = col; cx.lineWidth = 2; cx.beginPath();
    for (let l = -1; l <= 1; l += 2) for (let k = -1; k <= 1; k++) { const w = Math.sin(e.t * 12 + k * 2 + l) * 3; cx.moveTo(k * r * .45, l * r * .5); cx.lineTo(k * r * .55 + w, l * (r + 7)); }
    cx.stroke();
    rrect(-r * .9, -r * .7, r * 1.8, r * 1.4, 5); cx.fillStyle = '#2a1a00'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = col; cx.beginPath(); cx.arc(-r * .25, 0, r * .42, 0, TAU); cx.fill();
    cx.fillStyle = '#2a1a00'; for (let k = 0; k < 4; k++) { const q = k * TAU / 4 + e.t; cx.fillRect(-r * .25 + Math.cos(q) * r * .3 - 1.5, Math.sin(q) * r * .3 - 1.5, 3, 3); }
    cx.fillStyle = ((e.t * 4) | 0) % 2 ? '#ff0844' : '#ffd700'; cx.fillRect(r * .5, -2.5, 5, 5);
  } else if (t === ET.MIRROR) { // hexagonal core; the mirror arc orbits around it
    poly(0, 0, r * .8, 6, e.t); cx.fillStyle = e.fl > .3 ? '#ffffff' : '#1a2a3a'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = col; cx.beginPath(); cx.arc(0, 0, r * .28, 0, TAU); cx.fill();
    cx.rotate(e.sa); cx.lineCap = 'round';
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 6; cx.beginPath(); cx.arc(0, 0, r + 7, -1.05, 1.05); cx.stroke();
    cx.strokeStyle = col; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, r + 7, -1.05, 1.05); cx.stroke();
    cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(0, 0, r + 12, -.6, .2); cx.stroke();
  } else if (t === ET.ENFORCER) { // armored captain: plated hull, a big front shield, a visor
    cx.rotate(e.ang);
    poly(0, 0, r, 8, Math.PI / 8); cx.fillStyle = e.fl > .3 ? '#ffffff' : '#0c2a1c'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3.5; cx.stroke();
    poly(0, 0, r * .62, 8, 0); cx.strokeStyle = 'rgba(61,255,138,.5)'; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = e.st === 3 ? '#ffd700' : '#ff0844'; cx.fillRect(r * .25, -r * .3, r * .3, r * .6); // visor (gold while stunned)
    for (let k = -1; k <= 1; k += 2) { cx.fillStyle = '#1e5a3a'; cx.fillRect(-r * .6, k * r * .75 - 5, r * .9, 10); }
    if (e.st === 3) { cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; for (let k = 0; k < 3; k++) { const q = CAM.t * 5 + k * 2.1; cx.beginPath(); cx.arc(Math.cos(q) * r * .5, Math.sin(q) * r * .5 - r * .2, 3, 0, TAU); cx.stroke(); } }
  } else if (t === ET.SPIDER) { // spider tank: eight legs, turret on top
    cx.strokeStyle = col; cx.lineWidth = 3; cx.beginPath();
    for (let k = 0; k < 8; k++) { const q = k * TAU / 8 + .2, w = Math.sin(e.t * 9 + k * 1.3) * .14; cx.moveTo(Math.cos(q) * r * .55, Math.sin(q) * r * .55); cx.lineTo(Math.cos(q + w) * (r + 12), Math.sin(q + w) * (r + 12)); cx.lineTo(Math.cos(q + w + .25) * (r + 18), Math.sin(q + w + .25) * (r + 18)); }
    cx.stroke();
    cx.beginPath(); cx.arc(0, 0, r * .75, 0, TAU); cx.fillStyle = e.fl > .3 ? '#ffffff' : '#2a1206'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    cx.rotate(e.ang); cx.fillStyle = col; cx.fillRect(0, -4, r * 1.05, 8); cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(0, 0, r * .32, 0, TAU); cx.fill();
    cx.fillStyle = '#ff0844'; for (let k = -1; k <= 1; k++) cx.fillRect(r * .3, k * 6 - 1.5, 3, 3);
  } else if (t === ET.WRAITH) { // void wraith: tattered cloak, a mask, an orbit of void motes
    cx.rotate(e.ang);
    cx.beginPath(); for (let k = 0; k <= 12; k++) { const q = Math.PI * .55 + k * (Math.PI * .9) / 12, rr = r * (1.2 + (k % 2) * .35) + Math.sin(e.t * 8 + k) * 3; cx.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); } cx.lineTo(0, 0); cx.closePath();
    cx.fillStyle = 'rgba(40,16,70,.85)'; cx.fill();
    cx.beginPath(); cx.arc(0, 0, r * .8, 0, TAU); cx.fillStyle = e.fl > .3 ? '#ffffff' : '#120826'; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = '#e8e0ff'; cx.beginPath(); cx.ellipse(r * .25, 0, r * .4, r * .5, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#ff2bd6'; cx.fillRect(r * .38, -r * .26, 4, 3); cx.fillRect(r * .38, r * .14, 4, 3);
    for (let k = 0; k < 4; k++) { const q = e.t * 2.4 + k * TAU / 4; cx.fillStyle = col; cx.beginPath(); cx.arc(Math.cos(q) * (r + 10), Math.sin(q) * (r + 10), 2.5, 0, TAU); cx.fill(); }
  }
}
function drawMimicBody(e, col) { // the mimic wears your own hero's body, in its magenta colors
  const o = HO; heroSetSkin(o, P.skin || skinOf('cyan'));
  o.ca = e.fl > .3 ? '#ffffff' : col; o.cb = '#2a0020'; o.c1 = ''; o.c2 = '';
  o.x = e.x; o.y = e.y; o.face = o.mvA = e.st === 1 ? e.da : e.ang; o.spd = e.st === 2 ? 900 : 70; o.ph = e.t * 9; o.sx = o.sy = e.scale;
  o.dashing = e.st === 2; o.blade = o.face + (e.st === 2 ? .2 : e.st === 1 ? -1.2 : 1.8); o.alpha = e.vis * .9; o.w = P.w ? P.w.id : 'katana'; o.fx = null; o.bl = 46; o.t = CAM.t; o.hot = 0; o.od = 0;
  drawHero(o);
}
function knockHit(e) { // a gauntlet-launched enemy smashes into whoever it flies into
  for (let i = 0; i < EN.n; i++) {
    const o = EN.a[i]; if (o === e || !o.alive || o.al > 0 || o.spawnT > 0) continue;
    if (dist(o.x, o.y, e.x, e.y) < o.r + e.r) {
      const a = Math.atan2(o.y - e.y, o.x - e.x), sp = Math.hypot(e.kbx, e.kby) * .6;
      e.kbx = e.kby = 0; FX.ring((o.x + e.x) / 2, (o.y + e.y) / 2, 40, '#ffd23f', 3); shake(.15); Aud.sfx('hit', 1);
      damageEnemy(o, 1.2 * P.dmgMul * G.dmgMod, a, 2); if (o.alive && !o.mb) { o.kbx = Math.cos(a) * sp; o.kby = Math.sin(a) * sp; }
      damageEnemy(e, .8 * P.dmgMul * G.dmgMod, a + Math.PI, 2);
      return;
    }
  }
}
