/* =====================================================================
   HERO RENDERER — every skin is its own body (ninja, ronin, oni,
   kitsune, tengu, mecha, skeleton, yurei, neko, shogun, raijin) with
   matching feet, trail and face; weapons have their own shapes and
   blade skins recolor the blade. Top-down, +x = facing direction.
   One shared parameter object (HO) keeps it allocation-free.
   ===================================================================== */
const HO = { x: 0, y: 0, face: 0, mvA: 0, spd: 0, ph: 0, sx: 1, sy: 1, ca: '#00f2fe', cb: '#ff0844', c1: '', c2: '', dashing: false, blade: 0, alpha: 1, body: 'ninja', w: 'katana', fx: null, bl: 52, t: 0, hot: 0, od: 0, main: 0 };
const FOOT = { seraph: 'steel', lich: 'none', pixel: 'boot', rider: 'boot', sovereign: 'boot', ninja: 'boot', ronin: 'sandal', neko: 'paw', oni: 'claw', kitsune: 'paw', tengu: 'talon', mecha: 'jet', skull: 'bone', yurei: 'none', shogun: 'armor', raijin: 'claw', wolf: 'claw', knight: 'steel', viking: 'fur', dragon: 'claw', goo: 'none' };
const FOOTC = { seraph: '#cfe8ff', rider: '#1a1a1a', sovereign: '#10101a', skull: '#e8e2d0', wolf: '#4a5478', knight: '#aab4c8', viking: '#6a4426', dragon: '#2a7a4e' };
function hglow(x, y, s, c, a) { const ga = cx.globalAlpha; glow(x, y, s, c, a * ga); cx.globalAlpha = ga; } // keeps the hero's alpha
function dot(x, y, r) { cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill(); }
function rrect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.lineTo(x + w - r, y); cx.quadraticCurveTo(x + w, y, x + w, y + r); cx.lineTo(x + w, y + h - r); cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); cx.lineTo(x + r, y + h); cx.quadraticCurveTo(x, y + h, x, y + h - r); cx.lineTo(x, y + r); cx.quadraticCurveTo(x, y, x + r, y); cx.closePath(); }
function heroSetSkin(o, sk) { SWING.reset(o); o.body = sk.body || 'ninja'; o.ca = sk.a; o.cb = sk.b; o.c1 = sk.c1 || ''; o.c2 = sk.c2 || ''; }
function drawHero(o) {
  cx.save(); cx.translate(o.x, o.y); cx.globalAlpha = o.alpha;
  const body = o.body, moving = o.spd > 35, run = Math.min(1, o.spd / 480), floaty = body === 'yurei' || body === 'lich', goo = body === 'goo';
  cx.fillStyle = 'rgba(0,0,0,.32)'; cx.beginPath(); cx.ellipse(2, floaty ? 11 : 6, floaty ? 11 : goo ? 17 : 15, floaty ? 7 : goo ? 13 : 11, 0, 0, TAU); cx.fill();
  if (floaty) cx.translate(0, -4 + Math.sin(o.t * 3) * 2.2);
  else if (goo) { const q = moving && !o.dashing ? Math.sin(o.ph * 2) * .12 : o.dashing ? .22 : Math.sin(o.t * 4) * .05; cx.rotate(moving ? o.mvA : o.face); cx.scale(1 + q, 1 - q * .8); cx.rotate(-(moving ? o.mvA : o.face)); } // a slime squashes and stretches instead of walking
  else { cx.save(); cx.rotate(moving ? o.mvA : o.face); heroLegs(o, moving, run); cx.restore(); }
  drawHeld(o);
  cx.save(); cx.rotate(o.face);
  const bob = moving && !o.dashing ? Math.abs(Math.sin(o.ph)) * .05 * (1 + run) : Math.sin(o.t * 3) * .018;
  cx.translate(o.dashing ? 3 : run * 2, 0); cx.scale(o.sx * (1 + bob), o.sy * (1 + bob));
  (BODY[body] || BODY.ninja)(o, moving && !o.dashing ? Math.sin(o.ph) * .2 : 0);
  cx.restore();
  drawHands(o);
  cx.restore(); cx.globalAlpha = 1;
}
/* ---------------- held weapons: the weapon sits in the hero's hand(s), the hands are drawn over the body ----------------
   GRIP[w] = [main grip point along the weapon, second hand point (two-handed) or 0, dual-wield flag]
   The main hand rides a circle of HAND_R around the body in the direction of the blade, so swings
   read as arm motion; the weapon is shifted so its grip sits in that hand and shortened by the same
   amount, which keeps the tip exactly where the slash reaches. */
const HAND_R = 13;
const GRIP = { katana: [9, 3], muramasa: [9, 3], hammer: [7, 21], scythe: [5, 19], kunai: [5, 0], whip: [7, 0], spear: [3, 17], daggers: [5, 0, 1], monarch: [5, 0, 1], dominator: [10, 3], fists: null, nodachi: [12, 22], chakram: [3, 0], tessen: [4, 0] };
const HANDS = { n: 0, x: [0, 0, 0], y: [0, 0, 0], s: [1, 1, 1] };
const HANDC = { seraph: ['#cfe8ff', '#3a5a7a'], lich: ['#2a1a3a', '#0a0610'], rider: ['#1a1a1a', '#000000'], sovereign: ['#0e0e16', '#000000'], pixel: ['#ffcc99', '#5a3a20'], skull: ['#e8e2d0', '#8a8270'], knight: ['#9aa4b8', '#3a4458'], mecha: ['#7a8498', '#2a3340'], shogun: ['#d9b46a', '#5a3a10'], wolf: ['#5a3a22', '#2a1408'], neko: ['#f4efe6', '#7a6a58'], goo: ['', ''], yurei: ['#dff4ff', '#7aa0c0'], raijin: ['#3a6ad8', '#0a1a48'], oni: ['#c0302a', '#3a0a10'], dragon: ['#3a8a5a', '#0a2a18'], tengu: ['#1a1a24', '#555c70'], viking: ['#c49a6c', '#4a3020'] };
function handAt(x, y, side) { if (HANDS.n < 3) { HANDS.x[HANDS.n] = x; HANDS.y[HANDS.n] = y; HANDS.s[HANDS.n] = side || 1; HANDS.n++; } }
function drawHeld(o) {
  HANDS.n = 0; const g = GRIP[o.w];
  if (g === null) { drawWeapon(o, o.blade); return; } // gauntlets are the hands
  const G0 = g || GRIP.katana, a = o.blade, c = Math.cos(a), s = Math.sin(a), keep = o.bl, HR = HAND_R * (o.hk || 1), sh = HR - G0[0];
  o.bl = Math.max(20, keep - sh);
  if (G0[2]) { // dual wield: main blade in the right hand, a second one reverse-gripped in the left
    o.half = 1; cx.save(); cx.translate(c * sh, s * sh); drawWeapon(o, a); cx.restore(); handAt(c * HR, s * HR);
    const sw2 = o.swing && o.swa2 != null, la = sw2 ? o.swa2 - .25 * (o.swd || 1) : o.dashing ? a - .9 : o.face - 1.65, oa = sw2 ? o.swa2 : o.dashing ? a - .35 : o.face - 2.5, HR2 = HAND_R * (sw2 ? 1 + (o.swr2 - 1) * 1.3 : 1), lx = Math.cos(la) * HR2, ly = Math.sin(la) * HR2;
    o.half = 2; o.bl = Math.max(16, keep * .62 * (sw2 ? o.swr2 : 1) - sh); cx.save(); cx.translate(lx - Math.cos(oa) * G0[0], ly - Math.sin(oa) * G0[0]); drawWeapon(o, oa); cx.restore(); handAt(lx, ly, -1);
    o.half = 0;
  } else {
    cx.save(); cx.translate(c * sh, s * sh); drawWeapon(o, a); cx.restore();
    handAt(c * HR, s * HR); if (G0[1] && (o.dashing || o.swing)) handAt(c * (sh + G0[1]), s * (sh + G0[1]), -1); // both hands on the grip while swinging
  }
  o.bl = keep;
}
function drawHands(o) {
  if (!HANDS.n || o.body === 'goo') { HANDS.n = 0; return; }
  const hc = HANDC[o.body], fill = hc ? hc[0] : '#262e4c', line = hc ? hc[1] : '#05060f';
  if (o.body !== 'yurei') for (let i = 0; i < HANDS.n; i++) { // arms from the shoulders to the hands
    const sa = o.face + HANDS.s[i] * 1.5708, sx = Math.cos(sa) * 9 + Math.cos(o.face) * 2, sy = Math.sin(sa) * 9 + Math.sin(o.face) * 2;
    const x = HANDS.x[i], y = HANDS.y[i], mx = (sx + x) / 2 + Math.cos(sa) * 3, my = (sy + y) / 2 + Math.sin(sa) * 3; // a slight elbow bend outward
    cx.lineCap = 'round'; cx.strokeStyle = line; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(sx, sy); cx.quadraticCurveTo(mx, my, x, y); cx.stroke();
    cx.strokeStyle = fill; cx.lineWidth = 3.6; cx.stroke();
  }
  for (let i = 0; i < HANDS.n; i++) {
    const x = HANDS.x[i], y = HANDS.y[i];
    cx.fillStyle = fill; cx.beginPath(); cx.arc(x, y, 4.3, 0, TAU); cx.fill(); cx.strokeStyle = line; cx.lineWidth = 1.4; cx.stroke();
    cx.fillStyle = o.ca; cx.globalAlpha *= .9; cx.fillRect(x - 1.6, y - 1.6, 3.2, 1.2); cx.globalAlpha = o.alpha; // a glowing glove stud
  }
  HANDS.n = 0;
}
function heroLegs(o, moving, run) {
  const ft = FOOT[o.body] || 'boot'; if (ft === 'none') return;
  const fc = (o.body === 'oni' || o.body === 'raijin') ? (o.c2 || '#9a1a26') : FOOTC[o.body] || o.ca;
  if (o.dashing) { foot(-19, -7, fc, ft, o); foot(-25, 6, fc, ft, o); }
  else if (moving) { const s1 = Math.sin(o.ph) * (14 + run * 8); foot(s1, -8, fc, ft, o); foot(-s1, 8, fc, ft, o); }
  else { const br = Math.sin(o.t * 3) * .8; foot(11 + br, -8, fc, ft, o); foot(-10, 8, fc, ft, o); }
}
function foot(fx, fy, c, ft, o) {
  cx.strokeStyle = ft === 'bone' ? '#d8d0bc' : ft === 'jet' || ft === 'steel' ? '#55606e' : ft === 'fur' ? '#4a3020' : '#4656a0'; cx.lineWidth = ft === 'bone' ? 3 : 6;
  cx.beginPath(); cx.moveTo(fx * .2, fy * .55); cx.lineTo(fx, fy); cx.stroke();
  cx.lineWidth = 1.5; cx.strokeStyle = '#05060f';
  switch (ft) {
    case 'paw': cx.fillStyle = c; dot(fx, fy, 4.8); cx.stroke(); cx.fillStyle = '#05060f'; for (let k = -1; k <= 1; k++) dot(fx + 3.4, fy + k * 2.3, 1.1); break;
    case 'claw':
      cx.fillStyle = c; cx.fillRect(fx - 6, fy - 4.5, 12, 9); cx.strokeRect(fx - 6, fy - 4.5, 12, 9);
      cx.strokeStyle = '#f0e6c8'; cx.lineWidth = 1.6; cx.beginPath(); for (let k = -1; k <= 1; k++) { cx.moveTo(fx + 6, fy + k * 3); cx.lineTo(fx + 9.5, fy + k * 3.6); } cx.stroke(); break;
    case 'talon': cx.strokeStyle = c; cx.lineWidth = 2.2; cx.beginPath(); for (let k = -1; k <= 1; k++) { cx.moveTo(fx - 1, fy); cx.lineTo(fx + 7, fy + k * 4); } cx.moveTo(fx - 1, fy); cx.lineTo(fx - 6, fy); cx.stroke(); break;
    case 'jet':
      cx.fillStyle = '#2a3340'; cx.fillRect(fx - 6, fy - 4, 12, 8); cx.strokeStyle = c; cx.strokeRect(fx - 6, fy - 4, 12, 8);
      if (o.spd > 35 || o.dashing) { cx.fillStyle = rnd() < .5 ? '#ff9a00' : '#ffd700'; cx.beginPath(); cx.moveTo(fx - 6, fy - 3); cx.lineTo(fx - 13 - rnd() * 6, fy); cx.lineTo(fx - 6, fy + 3); cx.closePath(); cx.fill(); }
      break;
    case 'bone': cx.fillStyle = '#e8e2d0'; for (let k = -1; k <= 1; k++) dot(fx + 3, fy + k * 2.4, 1.6); break;
    case 'armor': cx.fillStyle = '#2a1a08'; cx.fillRect(fx - 6, fy - 3.8, 12, 7.6); cx.strokeStyle = c; cx.lineWidth = 1.8; cx.strokeRect(fx - 6, fy - 3.8, 12, 7.6); break;
    case 'steel': cx.fillStyle = '#7a8498'; cx.fillRect(fx - 6.5, fy - 4, 13, 8); cx.strokeStyle = c; cx.lineWidth = 1.6; cx.strokeRect(fx - 6.5, fy - 4, 13, 8); cx.fillStyle = '#e8eef8'; cx.fillRect(fx + 2, fy - 3, 2, 6); break;
    case 'fur': cx.fillStyle = '#5a3a22'; cx.fillRect(fx - 6, fy - 3.8, 12, 7.6); cx.strokeRect(fx - 6, fy - 3.8, 12, 7.6); cx.fillStyle = '#b8a890'; cx.fillRect(fx - 7, fy - 4.6, 3.4, 9.2); break;
    case 'sandal': cx.fillStyle = '#c9a25c'; cx.fillRect(fx - 6, fy - 3.4, 12, 6.8); cx.strokeRect(fx - 6, fy - 3.4, 12, 6.8); cx.strokeStyle = '#8a1b1b'; cx.beginPath(); cx.moveTo(fx - 2, fy - 3.4); cx.lineTo(fx + 1, fy + 3.4); cx.stroke(); break;
    default: cx.fillStyle = c; cx.fillRect(fx - 6, fy - 3.6, 12, 7.2); cx.strokeRect(fx - 6, fy - 3.6, 12, 7.2);
  }
}
/* ---------------- weapons ---------------- */
function bladeLine(c, s, r0, r1, bc, edge, wd, glitch) {
  if (glitch) {
    const ox = -s * 1.8, oy = c * 1.8; cx.lineWidth = wd;
    cx.strokeStyle = '#ff2bd6'; cx.beginPath(); cx.moveTo(c * r0 + ox, s * r0 + oy); cx.lineTo(c * r1 + ox, s * r1 + oy); cx.stroke();
    cx.strokeStyle = '#00f2fe'; cx.beginPath(); cx.moveTo(c * r0 - ox, s * r0 - oy); cx.lineTo(c * r1 - ox, s * r1 - oy); cx.stroke();
  }
  cx.strokeStyle = bc; cx.lineWidth = wd; cx.beginPath(); cx.moveTo(c * r0, s * r0); cx.lineTo(c * r1, s * r1); cx.stroke();
  cx.strokeStyle = edge; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(c * (r0 + 3), s * (r0 + 3)); cx.lineTo(c * (r1 - 1), s * (r1 - 1)); cx.stroke();
  if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, DECO.o);
}
const DECO = { f: null, o: null }; // blade skin being drawn (set by drawWeapon)
function bladeDeco(f, c, s, r0, r1, o) { // per-skin shape details along a blade line from the origin
  const px = -s, py = c, L = r1 - r0;
  switch (f.deco) {
    case 'petal': // sakura: blossoms along the blade and a flower guard
      cx.fillStyle = '#ffe0ee'; for (let k = 1; k < 4; k++) { const d = r0 + L * k / 4, sd = k % 2 ? 3 : -3; dot(c * d + px * sd, s * d + py * sd, 1.7); }
      cx.fillStyle = '#ff7ab8'; for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + o.t; dot(c * (r0 + 1) + Math.cos(a) * 3.2, s * (r0 + 1) + Math.sin(a) * 3.2, 1.9); }
      cx.fillStyle = '#ffe14d'; dot(c * (r0 + 1), s * (r0 + 1), 1.4); break;
    case 'flame': // inferno: flickering tongues of fire
      cx.fillStyle = 'rgba(255,154,0,.85)';
      for (let k = 0; k < 5; k++) { const d = r0 + L * (k + .5) / 5, h = 4 + rnd() * 6, bx = c * d, by = s * d; cx.beginPath(); cx.moveTo(bx + c * 2.2, by + s * 2.2); cx.lineTo(bx + px * h + c, by + py * h + s); cx.lineTo(bx - c * 2.2, by - s * 2.2); cx.closePath(); cx.fill(); }
      cx.fillStyle = 'rgba(255,225,77,.9)';
      for (let k = 0; k < 4; k++) { const d = r0 + L * (k + 1) / 5, h = 2 + rnd() * 4, bx = c * d, by = s * d; cx.beginPath(); cx.moveTo(bx + c * 1.6, by + s * 1.6); cx.lineTo(bx - px * h, by - py * h); cx.lineTo(bx - c * 1.6, by - s * 1.6); cx.closePath(); cx.fill(); }
      break;
    case 'ice': // glacier: crystal spikes
      cx.fillStyle = '#e8fbff';
      for (let k = 0; k < 4; k++) { const d = r0 + L * (k + .6) / 4.6, sd = k % 2 ? 1 : -1, bx = c * d, by = s * d; cx.beginPath(); cx.moveTo(bx - c * 3, by - s * 3); cx.lineTo(bx + px * sd * 6.5 + c * 2, by + py * sd * 6.5 + s * 2); cx.lineTo(bx + c * 2, by + s * 2); cx.closePath(); cx.fill(); }
      break;
    case 'crack': // obsidian: glowing red cracks
      cx.strokeStyle = '#ff2b4a'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(c * r0, s * r0);
      for (let k = 1; k <= 6; k++) { const d = r0 + L * k / 6, sd = k % 2 ? 1.6 : -1.6; cx.lineTo(c * d + px * sd, s * d + py * sd); }
      cx.stroke(); break;
    case 'bolt': // thunderclap: crackling arcs
      if (rnd() < .65) { cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.2; cx.beginPath(); let d = r0 + rnd() * L * .3; cx.moveTo(c * d, s * d); for (let k = 0; k < 4; k++) { d += L * .18; const sd = (rnd() - .5) * 13; cx.lineTo(c * d + px * sd, s * d + py * sd); } cx.stroke(); }
      break;
    case 'scale': { // golden dragon: scale ridges and a horned guard
      const a = Math.atan2(s, c); cx.strokeStyle = '#a07800'; cx.lineWidth = 1;
      for (let k = 1; k < 6; k++) { const d = r0 + L * k / 6; cx.beginPath(); cx.arc(c * d, s * d, 2.6, a + 1.9, a + 4.4); cx.stroke(); }
      cx.fillStyle = '#ffd700'; for (let sd = -1; sd <= 1; sd += 2) { cx.beginPath(); cx.moveTo(c * (r0 + 3) + px * 3 * sd, s * (r0 + 3) + py * 3 * sd); cx.lineTo(c * (r0 - 3) + px * 8 * sd, s * (r0 - 3) + py * 8 * sd); cx.lineTo(c * r0, s * r0); cx.closePath(); cx.fill(); }
      break;
    }
    case 'void': // void reaper: motes orbiting the blade
      for (let k = 0; k < 3; k++) { const d = r0 + L * ((o.t * .8 + k / 3) % 1), sd = Math.sin(o.t * 6 + k * 2) * 5; hglow(c * d + px * sd, s * d + py * sd, 7, k % 2 ? '#00f2fe' : '#b537f2', .9); }
      break;
    case 'glitch': // pixels breaking off
      if (rnd() < .55) { const d = r0 + rnd() * L, sd = (rnd() - .5) * 11; cx.fillStyle = rnd() < .5 ? '#ff2bd6' : '#00f2fe'; cx.fillRect(c * d + px * sd - 2, s * d + py * sd - 2, 4, 4); }
      break;
    case 'prism': { const d = r0 + L * ((o.t * 1.4) % 1); hglow(c * d, s * d, 9, '#ffffff', .9); break; } // a glint running up the blade
    case 'saw': { // neon chainsaw: teeth running along one edge
      cx.fillStyle = '#ffd700'; const n = 7, off = (o.t * 9) % 1;
      for (let k = 0; k < n; k++) { const d = r0 + 3 + (L - 4) * ((k + off) / n), bx = c * d, by = s * d; cx.beginPath(); cx.moveTo(bx + px * 2.2, by + py * 2.2); cx.lineTo(bx + px * 6.5 + c * 2.6, by + py * 6.5 + s * 2.6); cx.lineTo(bx + px * 2.2 + c * 4, by + py * 2.2 + s * 4); cx.closePath(); cx.fill(); }
      cx.fillStyle = '#05060f'; for (let k = 0; k < 4; k++) { const d = r0 + 4 + k * 3; cx.fillRect(c * d - 1, s * d - 1, 2, 2); } // hazard stripes on the motor
      break;
    }
    case 'bone': // bone cleaver: notches and a knuckle tip
      cx.fillStyle = '#3a3428'; for (let k = 1; k < 4; k++) { const d = r0 + L * k / 4; dot(c * d + px * 2.4, s * d + py * 2.4, 1.5); }
      cx.fillStyle = '#efe9d8'; dot(c * r1 + px * 2.2, s * r1 + py * 2.2, 3.1); dot(c * r1 - px * 2.2, s * r1 - py * 2.2, 3.1); break;
    default: if (DECO4[f.deco]) DECO4[f.deco](c, s, r0, r1, o, px, py, L);
  }
}
function bladeColor(o) {
  const f = o.fx; let bc = f && f.blade ? f.blade : o.ca;
  if (bc === 'prism') return PRISM[((o.t * 18) | 0) % 24];
  return bc;
}
function drawWeapon(o, a) {
  const f = o.fx, L = o.bl, c = Math.cos(a), s = Math.sin(a), w = o.w;
  let bc = bladeColor(o); const glitch = bc === 'glitch'; if (glitch) bc = '#e8fbff';
  const own = !(f && f.blade), mura = w === 'muramasa' && own; DECO.f = f && f.deco ? f : null; DECO.o = o;
  const edge = o.dashing ? '#ffffff' : mura ? '#ff0844' : (f && f.edge) || '#ffffff';
  const gc = o.od ? '#ffd700' : o.hot ? '#ff6a00' : glitch ? '#ff2bd6' : mura ? '#ff0844' : bc;
  hglow(c * L * .6, s * L * .6, 34, gc, .55);
  cx.lineCap = 'round';
  if (W4ART[w]) W4ART[w](o, c, s, L, bc, edge, gc, glitch, own);
  else if (w === 'daggers' && o.half) { // one holo-dagger per hand
    bladeLine(c, s, 8, L * .64 + 8, bc, edge, 4, glitch);
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(c * 1, s * 1); cx.lineTo(c * 9, s * 9); cx.stroke();
    cx.strokeStyle = '#d9b46a'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(c * 9 - s * 3.5, s * 9 + c * 3.5); cx.lineTo(c * 9 + s * 3.5, s * 9 - c * 3.5); cx.stroke();
    if (DECO.f) bladeDeco(DECO.f, c, s, 8, L * .64 + 8, o);
  } else if (w === 'monarch') { // sovereign daggers: curved violet-black fangs with a dark lightning edge
    const px = -s, py = c, r0 = 8, r1 = L * .7 + 8, cv0 = o.half === 2 ? -1 : 1;
    hglow(c * r1 * .6, s * r1 * .6, 24, '#9b5bff', .5);
    cx.strokeStyle = '#1a0a2a'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(c * 1, s * 1); cx.lineTo(c * r0, s * r0); cx.stroke();
    cx.beginPath(); cx.moveTo(c * r0 + px * 3.4, s * r0 + py * 3.4);
    cx.quadraticCurveTo(c * (r0 + r1) * .5 + px * 9 * cv0, s * (r0 + r1) * .5 + py * 9 * cv0, c * r1 + px * 4 * cv0, s * r1 + py * 4 * cv0);
    cx.quadraticCurveTo(c * (r0 + r1) * .5 + px * 1 * cv0, s * (r0 + r1) * .5 + py * 1 * cv0, c * r0 - px * 3.4, s * r0 - py * 3.4); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : '#140822'; cx.fill(); cx.strokeStyle = o.fx && o.fx.blade ? bc : '#9b5bff'; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = edge === '#ffffff' ? '#e0ccff' : edge; cx.lineWidth = 1; cx.beginPath(); // a little forked lightning along the blade
    for (let k = 0; k <= 4; k++) { const d = r0 + 3 + (r1 - r0 - 6) * k / 4, j = (k % 2 ? 2.2 : -1.2) * cv0 + Math.sin(o.t * 30 + k) * .8; k ? cx.lineTo(c * d + px * (j + 3 * cv0), s * d + py * (j + 3 * cv0)) : cx.moveTo(c * d + px * (j + 3 * cv0), s * d + py * (j + 3 * cv0)); }
    cx.stroke(); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  } else if (w === 'dominator') { // dominator: a broad blade with an under-slung plasma barrel
    const px = -s, py = c, r1 = L * 1.02;
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(c * 1, s * 1); cx.lineTo(c * 12, s * 12); cx.stroke();
    cx.fillStyle = '#3a4260'; cx.beginPath(); cx.moveTo(c * 12 + px * 7, s * 12 + py * 7); cx.lineTo(c * 16 + px * 7, s * 16 + py * 7); cx.lineTo(c * 16 - px * 7, s * 16 - py * 7); cx.lineTo(c * 12 - px * 7, s * 12 - py * 7); cx.closePath(); cx.fill();
    cx.beginPath(); cx.moveTo(c * 16 + px * 6, s * 16 + py * 6); cx.lineTo(c * (r1 - 10) + px * 6, s * (r1 - 10) + py * 6); cx.lineTo(c * r1 + px * 1, s * r1 + py * 1); cx.lineTo(c * (r1 - 6) - px * 2, s * (r1 - 6) - py * 2); cx.lineTo(c * 16 - px * 2, s * 16 - py * 2); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : '#1a1f34'; cx.fill(); cx.strokeStyle = bc; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = edge; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(c * 18 + px * 5, s * 18 + py * 5); cx.lineTo(c * (r1 - 10) + px * 5, s * (r1 - 10) + py * 5); cx.stroke();
    cx.fillStyle = '#4a5478'; const b0 = 14, b1 = r1 * .62; // the barrel
    cx.beginPath(); cx.moveTo(c * b0 - px * 2, s * b0 - py * 2); cx.lineTo(c * b1 - px * 2, s * b1 - py * 2); cx.lineTo(c * b1 - px * 6.5, s * b1 - py * 6.5); cx.lineTo(c * b0 - px * 6.5, s * b0 - py * 6.5); cx.closePath(); cx.fill();
    cx.fillStyle = '#ff9a3d'; dot(c * b1 - px * 4.2, s * b1 - py * 4.2, 1.8); for (let k = 0; k < 3; k++) { cx.fillStyle = k === ((o.t * 6) | 0) % 3 ? '#ffd23f' : '#5a3010'; dot(c * (b0 + 5 + k * 5) - px * 4.2, s * (b0 + 5 + k * 5) - py * 4.2, 1.3); }
    if (DECO.f) bladeDeco(DECO.f, c, s, 16, r1, o);
  } else if (w === 'nodachi') { // storm nodachi: a very long, gently curved blade with a long corded grip
    const px = -s, py = c, r0 = 22, r1 = L * 1.18, bend = 5;
    cx.strokeStyle = '#2a1a1a'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(-c * 4, -s * 4); cx.lineTo(c * r0, s * r0); cx.stroke();
    cx.strokeStyle = '#c0102e'; cx.lineWidth = 1.6; for (let k = 0; k < 5; k++) { const d = -2 + k * 5; cx.beginPath(); cx.moveTo(c * d + px * 3, s * d + py * 3); cx.lineTo(c * (d + 3) - px * 3, s * (d + 3) - py * 3); cx.stroke(); } // cord wraps
    cx.fillStyle = '#d9b46a'; cx.beginPath(); cx.ellipse(c * r0, s * r0, 5.5, 5.5, 0, 0, TAU); cx.fill(); cx.fillStyle = '#2a1a1a'; dot(c * r0, s * r0, 2.2); // round guard
    cx.beginPath(); cx.moveTo(c * (r0 + 2) + px * 2.6, s * (r0 + 2) + py * 2.6);
    cx.quadraticCurveTo(c * (r0 + r1) * .5 + px * (2.6 + bend), s * (r0 + r1) * .5 + py * (2.6 + bend), c * r1 + px * bend * .6, s * r1 + py * bend * .6);
    cx.quadraticCurveTo(c * (r0 + r1) * .5 + px * (bend - 2), s * (r0 + r1) * .5 + py * (bend - 2), c * (r0 + 2) - px * 2.2, s * (r0 + 2) - py * 2.2); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : '#d8f4ff'; cx.fill(); cx.strokeStyle = bc; cx.lineWidth = 1.6; cx.stroke();
    cx.strokeStyle = edge; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(c * (r0 + 6) + px * (2.4 + bend * .6), s * (r0 + 6) + py * (2.4 + bend * .6)); cx.quadraticCurveTo(c * (r0 + r1) * .5 + px * (2.4 + bend), s * (r0 + r1) * .5 + py * (2.4 + bend), c * (r1 - 3) + px * bend * .6, s * (r1 - 3) + py * bend * .6); cx.stroke();
    hglow(c * r1 * .7, s * r1 * .7, 30, gc, .45); if (DECO.f) bladeDeco(DECO.f, c, s, r0, r1, o);
  } else if (w === 'chakram') { // neon chakram: a bladed ring held at the rim
    const d = L * .42, x = c * d, y = s * d, rot = o.t * (o.dashing ? 16 : 2);
    cx.save(); cx.translate(x, y); hglow(0, 0, 22, gc, .5); cx.strokeStyle = glitch ? '#ff2bd6' : bc; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 9, 0, TAU); cx.stroke();
    cx.strokeStyle = '#1a1030'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(0, 0, 6.5, 0, TAU); cx.stroke(); cx.rotate(rot);
    cx.fillStyle = edge; for (let k = 0; k < 4; k++) { cx.rotate(TAU / 4); cx.beginPath(); cx.moveTo(9, -2.2); cx.lineTo(15, 0); cx.lineTo(9, 2.6); cx.closePath(); cx.fill(); }
    cx.restore(); cx.strokeStyle = '#2a3150'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(c * 2, s * 2); cx.lineTo(c * (d - 8), s * (d - 8)); cx.stroke();
    if (DECO.f) bladeDeco(DECO.f, c, s, d - 9, d + 9, o);
  } else if (w === 'tessen') { // steel fan: closed it is a slim iron bar, open it is a wedge of ribs
    const open = o.dashing || (o.swing && o.fan > 0), k = open ? Math.max(.25, o.swing ? o.fan : 1) : 0, R0 = L * .72;
    if (k > 0) {
      const spr = 1.5 * k; cx.fillStyle = glitch ? 'rgba(255,43,214,.6)' : 'rgba(200,240,255,.55)'; cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, R0, a - spr / 2, a + spr / 2); cx.closePath(); cx.fill();
      cx.strokeStyle = bc; cx.lineWidth = 1.6; cx.stroke(); cx.strokeStyle = '#2a3150'; cx.lineWidth = 1.2;
      for (let j = 0; j <= 6; j++) { const q = a - spr / 2 + spr * j / 6; cx.beginPath(); cx.moveTo(Math.cos(q) * 4, Math.sin(q) * 4); cx.lineTo(Math.cos(q) * R0, Math.sin(q) * R0); cx.stroke(); }
      cx.strokeStyle = edge; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, R0, a - spr / 2, a + spr / 2); cx.stroke(); hglow(c * R0 * .6, s * R0 * .6, 28, gc, .45);
    } else {
      cx.strokeStyle = '#2a3150'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(c * 1, s * 1); cx.lineTo(c * R0, s * R0); cx.stroke();
      cx.strokeStyle = bc; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(c * 3, s * 3); cx.lineTo(c * (R0 - 1), s * (R0 - 1)); cx.stroke();
      cx.fillStyle = '#d9b46a'; dot(c * 2, s * 2, 2.4);
    }
    if (DECO.f) bladeDeco(DECO.f, c, s, 4, R0, o);
  } else if (w === 'daggers') {
    for (let k = 0; k < 2; k++) {
      const aa = a + (k ? .95 : 0), l2 = L * (k ? .5 : .64), cc = Math.cos(aa), ss = Math.sin(aa);
      bladeLine(cc, ss, 8, l2, bc, edge, 4, glitch);
      cx.strokeStyle = '#2a3150'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(cc * 3, ss * 3); cx.lineTo(cc * 9, ss * 9); cx.stroke();
    }
  } else if (w === 'hammer') {
    cx.strokeStyle = '#4a5478'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(c * 4, s * 4); cx.lineTo(c * L * .8, s * L * .8); cx.stroke();
    cx.save(); cx.translate(c * L * .84, s * L * .84); cx.rotate(a);
    cx.fillStyle = '#1a2038'; cx.fillRect(-7, -12, 14, 24); cx.strokeStyle = bc; cx.lineWidth = 2.5; cx.strokeRect(-7, -12, 14, 24);
    cx.fillStyle = glitch ? '#ff2bd6' : bc; cx.fillRect(-2, -12, 4, 24); if (DECO.f) bladeDeco(DECO.f, 0, 1, -12, 12, o); cx.restore();
  } else if (w === 'scythe') {
    cx.strokeStyle = '#4a5478'; cx.lineWidth = 3.5; cx.beginPath(); cx.moveTo(-c * 6, -s * 6); cx.lineTo(c * L * .9, s * L * .9); cx.stroke();
    const ex = c * L * .9, ey = s * L * .9, pc = Math.cos(a + 1.5708), ps = Math.sin(a + 1.5708);
    cx.strokeStyle = bc; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(ex, ey);
    cx.quadraticCurveTo(ex + pc * 18 + c * 6, ey + ps * 18 + s * 6, ex + pc * 28 - c * 16, ey + ps * 28 - s * 16); cx.stroke();
    cx.strokeStyle = edge; cx.lineWidth = 1.4; cx.stroke();
    if (DECO.f) { const tx = pc * 28 - c * 16, ty = ps * 28 - s * 16, tl = Math.hypot(tx, ty); cx.save(); cx.translate(ex, ey); bladeDeco(DECO.f, tx / tl, ty / tl, 2, tl, o); cx.restore(); }
  } else if (w === 'kunai') { // shadow kunai: a leaf blade with a ring pommel
    const px = -s, py = c, b0 = 11, r1 = L * .66, bm = b0 + (r1 - b0) * .33;
    cx.strokeStyle = '#8fa4c8'; cx.lineWidth = 1.8; cx.beginPath(); cx.arc(-c * 2, -s * 2, 3.6, 0, TAU); cx.stroke();
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(c * 2, s * 2); cx.lineTo(c * b0, s * b0); cx.stroke();
    cx.beginPath(); cx.moveTo(c * b0 + px * 2.4, s * b0 + py * 2.4); cx.lineTo(c * bm + px * 5.6, s * bm + py * 5.6); cx.lineTo(c * r1, s * r1); cx.lineTo(c * bm - px * 5.6, s * bm - py * 5.6); cx.lineTo(c * b0 - px * 2.4, s * b0 - py * 2.4); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : '#141a30'; cx.fill(); cx.strokeStyle = bc; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = edge; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(c * (b0 + 2), s * (b0 + 2)); cx.lineTo(c * (r1 - 2), s * (r1 - 2)); cx.stroke();
    if (DECO.f) bladeDeco(DECO.f, c, s, b0, r1, o);
  } else if (w === 'whip') { // chain whip: a grip and a swaying chain of links with a blade tip
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(c * 2, s * 2); cx.lineTo(c * 12, s * 12); cx.stroke();
    const n = 9, sway = o.dashing ? .12 : .8, px = -s, py = c, lash = o.swing && o.lash >= 0 ? o.lash : -1; let x = c * 12, y = s * 12, lx = x, ly = y;
    cx.strokeStyle = glitch ? '#ff2bd6' : bc; cx.lineWidth = 2.4;
    for (let k = 1; k <= n; k++) {
      const d = 12 + (L * 1.05 - 12) * k / n, wv = lash >= 0 ? Math.sin(k * .8 - lash * 15) * (1 - lash) * k * 1.7 * (o.swd || 1) : Math.sin(o.t * 7 - k * .7) * sway * k * 1.1, nx = c * d + px * wv, ny = s * d + py * wv;
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(nx, ny); cx.stroke(); cx.fillStyle = k % 2 ? bc : '#e8fbff'; dot(nx, ny, 1.9); lx = x; ly = y; x = nx; y = ny;
    }
    const ta = Math.atan2(y - ly, x - lx), tc = Math.cos(ta), ts = Math.sin(ta);
    cx.fillStyle = edge; cx.beginPath(); cx.moveTo(x + tc * 9, y + ts * 9); cx.lineTo(x - ts * 3.5, y + tc * 3.5); cx.lineTo(x + ts * 3.5, y - tc * 3.5); cx.closePath(); cx.fill();
    if (DECO.f) bladeDeco(DECO.f, c, s, 12, L, o);
  } else if (w === 'spear') { // plasma spear: a long shaft with a glowing plasma head
    const r1 = L * 1.22, hb = r1 - 16, px = -s, py = c;
    cx.strokeStyle = '#4a5478'; cx.lineWidth = 3.5; cx.beginPath(); cx.moveTo(-c * 12, -s * 12); cx.lineTo(c * hb, s * hb); cx.stroke();
    cx.strokeStyle = '#d9b46a'; cx.lineWidth = 2; for (const d of [5, 13]) { cx.beginPath(); cx.moveTo(c * d + px * 2.6, s * d + py * 2.6); cx.lineTo(c * d - px * 2.6, s * d - py * 2.6); cx.stroke(); }
    hglow(c * (hb + 8), s * (hb + 8), 22, gc, .7);
    cx.beginPath(); cx.moveTo(c * (hb - 2) + px * 5, s * (hb - 2) + py * 5); cx.lineTo(c * r1, s * r1); cx.lineTo(c * (hb - 2) - px * 5, s * (hb - 2) - py * 5); cx.lineTo(c * (hb + 3), s * (hb + 3)); cx.closePath();
    cx.fillStyle = glitch ? '#ff2bd6' : bc; cx.fill(); cx.strokeStyle = edge; cx.lineWidth = 1.2; cx.stroke();
    if (DECO.f) bladeDeco(DECO.f, c, s, hb - 2, r1, o);
  } else if (w === 'fists') { // titan gauntlets: two armored fists; the lead one punches along the swing
    if (o.swing) { const d = o.swd || 1, pa = a + .18 * d, qa = a - .18 * d - .5 * d * (1 - o.p2); gauntlet(qa, L * (.28 + .42 * o.p2), bc, edge, gc, glitch); gauntlet(pa, L * (.36 + .4 * o.p1), bc, edge, gc, glitch); }
    else { const pa = o.dashing ? o.face + .25 : a, qa = o.dashing ? o.face - .55 : a + 1.2;
    gauntlet(qa, L * .28, bc, edge, gc, glitch); gauntlet(pa, L * (o.dashing ? .58 : .4), bc, edge, gc, glitch); }
  } else { // katana, muramasa
    bladeLine(c, s, 9, L, mura ? '#2a0610' : bc, edge, 5, glitch);
    const px = -s, py = c;
    cx.strokeStyle = '#d9b46a'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(c * 12 + px * 5, s * 12 + py * 5); cx.lineTo(c * 12 - px * 5, s * 12 - py * 5); cx.stroke();
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(c * 4, s * 4); cx.lineTo(c * 11, s * 11); cx.stroke();
    if (w === 'muramasa') hglow(c * L * .7, s * L * .7, 26, '#ff0844', .5);
  }
  DECO.f = null;
}
function gauntlet(a, d, bc, edge, gc, glitch) {
  cx.save(); cx.translate(Math.cos(a) * d, Math.sin(a) * d); cx.rotate(a);
  hglow(2, 0, 20, gc, .5);
  cx.fillStyle = '#4a5478'; cx.fillRect(-12, -4.5, 7, 9); // forearm cuff
  rrect(-6, -7.5, 14, 15, 4); cx.fillStyle = '#1a2038'; cx.fill(); cx.strokeStyle = glitch ? '#ff2bd6' : bc; cx.lineWidth = 2.4; cx.stroke();
  cx.fillStyle = glitch ? '#00f2fe' : bc; for (let j = -1; j <= 1; j++) cx.fillRect(6, j * 4.4 - 1.4, 3.5, 2.8); // knuckle studs
  cx.strokeStyle = edge; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(-3, -4.2); cx.lineTo(4, -4.2); cx.stroke();
  cx.restore();
}
/* ---------------- bodies (rotated frame, +x forward) ---------------- */
function pads(sw, fill, stroke, w, h, x) { cx.save(); cx.rotate(-sw); cx.fillStyle = fill; cx.strokeStyle = stroke; cx.lineWidth = 2; cx.fillRect(x, -20, w, h); cx.strokeRect(x, -20, w, h); cx.fillRect(x, 20 - h, w, h); cx.strokeRect(x, 20 - h, w, h); cx.restore(); }
const BODY = {
  seraph(o, sw) { // SERAPH / DEUS FRAME: an angel-frame with folded blade wings and a halo
    const fl = o.dashing ? .55 : .12 + Math.sin(o.t * 3) * .05;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { cx.save(); cx.rotate(Math.PI + s * (fl + k * .22)); cx.beginPath(); cx.moveTo(6, -2); cx.lineTo(26 - k * 4, -1); cx.lineTo(31 - k * 4, 0); cx.lineTo(26 - k * 4, 2); cx.lineTo(6, 2.5); cx.closePath(); cx.fillStyle = '#0c1a2e'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.4; cx.stroke(); cx.restore(); }
    pads(sw, '#1e3048', o.cb, 13, 9, -7);
    cx.beginPath(); cx.arc(-1, 0, 11.5, 0, TAU); cx.fillStyle = '#16263c'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 2; cx.stroke();
    cx.beginPath(); cx.arc(3, 0, 7, 0, TAU); cx.fillStyle = o.cb; cx.fill(); cx.fillStyle = o.ca; cx.fillRect(6, -3.5, 2.5, 7); hglow(8, 0, 12, o.ca, .6);
    cx.strokeStyle = o.ca; cx.lineWidth = 1.8; cx.globalAlpha *= .9; cx.beginPath(); cx.ellipse(1, 0, 10, 10, 0, 0, TAU); cx.stroke(); cx.globalAlpha = o.alpha; // the halo
  },
  lich(o, sw) { // VOID LICH: a hooded skull in torn void robes, drifting above the roof
    const wv = Math.sin(o.t * 4) * 3;
    cx.fillStyle = '#140a20'; for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.moveTo(-4, k * 4); cx.lineTo(-24 - (k % 2 ? 6 : 0), k * 6 + wv * (k % 2 ? 1 : -1)); cx.lineTo(-18, k * 5 + 2); cx.closePath(); cx.fill(); } // tattered hem
    hglow(0, 0, 32, o.ca, .4);
    cx.beginPath(); cx.ellipse(-2, 0, 12, 15, 0, 0, TAU); cx.fillStyle = '#1a0e2a'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.6; cx.stroke();
    cx.beginPath(); cx.arc(3, 0, 8.5, 0, TAU); cx.fillStyle = '#0a0612'; cx.fill(); cx.strokeStyle = '#3a1a5a'; cx.lineWidth = 2; cx.stroke(); // hood
    cx.fillStyle = '#d8cfe8'; cx.beginPath(); cx.arc(5, 0, 4.4, 0, TAU); cx.fill(); cx.fillStyle = o.ca; dot(7, -2, 1.2); dot(7, 2, 1.2); hglow(7, 0, 10, o.ca, .7);
    cx.fillStyle = o.ca; for (let k = 0; k < 3; k++) { const a = o.t * 2 + k * 2.1; cx.globalAlpha = o.alpha * .7; dot(Math.cos(a) * 16, Math.sin(a) * 16, 1.6); } cx.globalAlpha = o.alpha;
  },
  pixel(o, sw) { // 8-BIT BRAWLER: built from chunky pixels
    const P4 = (x, y, c) => { cx.fillStyle = c; cx.fillRect(x * 4 - 2, y * 4 - 2, 4, 4); };
    const jump = ((o.t * 6) | 0) % 2 && o.spd > 35 ? 1 : 0; // a two-frame bob
    for (const [x, y] of [[-2, -4], [-1, -4], [-2, 4], [-1, 4], [-1, -3], [-1, 3]]) P4(x - jump, y, o.cb); // shoulders
    for (let x = -3; x <= 1; x++) for (let y = -2; y <= 2; y++) P4(x, y, (x + y) % 2 ? '#1a1a3a' : '#22224a');
    for (let x = 0; x <= 2; x++) for (let y = -1; y <= 1; y++) P4(x + 1, y, '#ffcc99');
    P4(3, -1, '#05060f'); P4(3, 1, '#05060f'); P4(-1, 0, o.ca); P4(0, 0, o.ca); P4(-2, 0, o.ca); // eyes, back stripe
  },
  rider(o, sw) { // NEON RIDER: a leather riding jacket with neon piping and a full-face helmet
    pads(sw, '#141414', o.ca, 14, 8, -8);
    cx.beginPath(); cx.arc(-1, 0, 12, 0, TAU); cx.fillStyle = '#1a1a1a'; cx.fill(); cx.strokeStyle = '#2a2a2a'; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = o.ca; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(-12, -6); cx.lineTo(8, -6); cx.moveTo(-12, 6); cx.lineTo(8, 6); cx.stroke(); // piping
    cx.beginPath(); cx.ellipse(3, 0, 8.5, 7.5, 0, 0, TAU); cx.fillStyle = '#222'; cx.fill(); cx.strokeStyle = '#555'; cx.lineWidth = 1.4; cx.stroke(); // helmet
    cx.fillStyle = '#05060f'; cx.beginPath(); cx.ellipse(7, 0, 4, 6, 0, -1.5708, 1.5708); cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.2; cx.stroke(); // visor
    cx.fillStyle = o.ca; cx.fillRect(-2, -8.5, 5, 2); hglow(0, -8, 8, o.ca, .6); // a little comm unit on the side
  },
  sovereign(o, sw) { // SHADOW SOVEREIGN: a long dark coat that flares behind, glowing eyes, shadow wisps
    const fl = o.dashing ? 1 : Math.min(1, o.spd / 400), wv = Math.sin(o.t * 6) * 2;
    cx.fillStyle = '#0a0a12'; cx.beginPath(); cx.moveTo(-4, -11); cx.quadraticCurveTo(-18 - fl * 10, -14 - fl * 4 + wv, -26 - fl * 14, -6 + wv); cx.lineTo(-22 - fl * 12, 0); cx.lineTo(-26 - fl * 14, 6 - wv); cx.quadraticCurveTo(-18 - fl * 10, 14 + fl * 4 - wv, -4, 11); cx.closePath(); cx.fill();
    cx.strokeStyle = o.ca; cx.lineWidth = 1; cx.globalAlpha *= .6; cx.stroke(); cx.globalAlpha = o.alpha;
    pads(sw, '#101018', o.ca, 13, 8, -8);
    cx.beginPath(); cx.arc(-1, 0, 11.5, 0, TAU); cx.fillStyle = '#0e0e16'; cx.fill(); cx.strokeStyle = '#2a2a3a'; cx.lineWidth = 2; cx.stroke();
    cx.beginPath(); cx.arc(3, 0, 7, 0, TAU); cx.fillStyle = '#121220'; cx.fill();
    cx.fillStyle = '#1a1a2a'; for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.moveTo(-2, k * 2.6); cx.lineTo(-7, k * 3.4); cx.lineTo(0, k * 2.6 + 1.2); cx.closePath(); cx.fill(); } // spiky hair
    cx.fillStyle = o.ca; cx.fillRect(7, -3.5, 2.2, 1.6); cx.fillRect(7, 1.9, 2.2, 1.6); hglow(8, 0, 14, o.ca, .8); // eyes
    for (let k = 0; k < 4; k++) { const a = -o.t * 1.6 + k * 1.57, r = 18 + Math.sin(o.t * 3 + k) * 3; cx.globalAlpha = o.alpha * .45; cx.fillStyle = o.cb; dot(Math.cos(a) * r - 4, Math.sin(a) * r, 2.4); } cx.globalAlpha = o.alpha;
  },
  ninja(o, sw) {
    pads(sw, '#141c36', o.ca, 15, 8, -9);
    cx.beginPath(); cx.arc(-1, 0, 12, 0, TAU); cx.fillStyle = '#0c1228'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 2.5; cx.stroke();
    cx.beginPath(); cx.arc(3, 0, 7, 0, TAU); cx.fillStyle = '#161f3d'; cx.fill();
    cx.strokeStyle = o.ca; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(3, 0, 6, -.9, .9); cx.stroke();
    cx.beginPath(); cx.moveTo(12, 0); cx.lineTo(6, -4); cx.lineTo(8, 0); cx.lineTo(6, 4); cx.closePath(); cx.fillStyle = '#00ff88'; cx.fill();
  },
  ronin(o, sw) {
    cx.save(); cx.rotate(-sw); cx.fillStyle = '#2b2440'; cx.beginPath(); cx.ellipse(-3, 0, 10, 19, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#6b5b8a'; cx.lineWidth = 2; cx.stroke(); cx.restore();
    cx.strokeStyle = o.cb; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-10, -9); cx.lineTo(2, 10); cx.stroke();
    cx.beginPath(); cx.arc(2, 0, 15.5, 0, TAU); cx.fillStyle = '#c9a25c'; cx.fill(); cx.strokeStyle = '#7a5a22'; cx.lineWidth = 1.6; cx.stroke();
    cx.strokeStyle = 'rgba(122,90,34,.75)'; cx.lineWidth = 1; cx.beginPath();
    for (let k = 0; k < 12; k++) { const a = k * TAU / 12; cx.moveTo(2 + Math.cos(a) * 3.5, Math.sin(a) * 3.5); cx.lineTo(2 + Math.cos(a) * 15, Math.sin(a) * 15); }
    cx.stroke(); cx.fillStyle = '#e2c27a'; dot(2, 0, 3.2);
    cx.fillStyle = o.ca; cx.fillRect(14, -1.6, 4.5, 3.2);
  },
  neko(o, sw) {
    pads(sw, '#1a1a36', o.ca, 13, 7, -8);
    cx.beginPath(); cx.arc(-1, 0, 11, 0, TAU); cx.fillStyle = '#151530'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 2; cx.stroke();
    for (let sy = -1; sy <= 1; sy += 2) { cx.fillStyle = o.ca; cx.beginPath(); cx.moveTo(0, sy * 4); cx.lineTo(-6, sy * 12); cx.lineTo(5, sy * 8.5); cx.closePath(); cx.fill(); cx.fillStyle = '#ffd1ea'; cx.beginPath(); cx.moveTo(.5, sy * 5.5); cx.lineTo(-3.5, sy * 10); cx.lineTo(3.5, sy * 8); cx.closePath(); cx.fill(); }
    cx.beginPath(); cx.arc(3, 0, 7.5, 0, TAU); cx.fillStyle = '#20203e'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.5; cx.stroke();
    cx.fillStyle = o.cb; dot(7, -3, 1.6); dot(7, 3, 1.6);
    cx.fillStyle = '#ff9ad8'; cx.beginPath(); cx.moveTo(11, -1.4); cx.lineTo(12.6, 0); cx.lineTo(11, 1.4); cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = .9; cx.beginPath();
    for (let sy = -1; sy <= 1; sy += 2) { cx.moveTo(9.5, sy * 2.5); cx.lineTo(16, sy * 5.5); cx.moveTo(9.5, sy * 2); cx.lineTo(16.5, sy * 2.6); }
    cx.stroke();
  },
  oni(o, sw) {
    const t1 = o.c1 || '#4a0c12', t2 = o.c2 || '#9a1a26';
    cx.save(); cx.rotate(-sw);
    for (let sy = -1; sy <= 1; sy += 2) {
      cx.fillStyle = o.cb; cx.beginPath(); cx.moveTo(-12, sy * 11); cx.lineTo(4, sy * 13); cx.lineTo(-2, sy * 23); cx.lineTo(-8, sy * 26); cx.lineTo(-14, sy * 20); cx.closePath(); cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = '#f0e6c8'; cx.beginPath(); cx.moveTo(-6, sy * 22); cx.lineTo(-4, sy * 31); cx.lineTo(-1, sy * 21); cx.closePath(); cx.fill();
    }
    cx.restore();
    cx.beginPath(); cx.arc(-2, 0, 14, 0, TAU); cx.fillStyle = t1; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 2.5; cx.stroke();
    cx.fillStyle = '#120406'; cx.beginPath(); cx.moveTo(-3, -9); cx.lineTo(-15, -7); cx.lineTo(-10, -3); cx.lineTo(-17, 0); cx.lineTo(-10, 3); cx.lineTo(-15, 7); cx.lineTo(-3, 9); cx.closePath(); cx.fill();
    cx.beginPath(); cx.arc(4, 0, 8.5, 0, TAU); cx.fillStyle = t2; cx.fill(); cx.strokeStyle = '#2a0408'; cx.lineWidth = 1.5; cx.stroke();
    cx.fillStyle = '#f0e6c8';
    for (let sy = -1; sy <= 1; sy += 2) { cx.beginPath(); cx.moveTo(4, sy * 5); cx.quadraticCurveTo(-2, sy * 17, -11, sy * 16); cx.quadraticCurveTo(-3, sy * 11, 0, sy * 4); cx.closePath(); cx.fill(); }
    cx.fillStyle = '#ffd700'; cx.fillRect(8, -4.6, 3.2, 2.6); cx.fillRect(8, 2, 3.2, 2.6);
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(11.5, -3.2); cx.lineTo(15.5, -1.6); cx.lineTo(11.5, -.4); cx.closePath(); cx.moveTo(11.5, 3.2); cx.lineTo(15.5, 1.6); cx.lineTo(11.5, .4); cx.closePath(); cx.fill();
  },
  kitsune(o, sw) {
    cx.save(); cx.rotate(-sw); cx.fillStyle = '#f2efe9'; cx.strokeStyle = '#ff4d4d'; cx.lineWidth = 1.8;
    cx.beginPath(); cx.ellipse(-4, -14, 7, 5, 0, 0, TAU); cx.fill(); cx.stroke(); cx.beginPath(); cx.ellipse(-4, 14, 7, 5, 0, 0, TAU); cx.fill(); cx.stroke(); cx.restore();
    cx.beginPath(); cx.arc(-1, 0, 11, 0, TAU); cx.fillStyle = '#f2efe9'; cx.fill(); cx.strokeStyle = '#ff4d4d'; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = '#ff4d4d'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(-9, -6); cx.lineTo(-9, 6); cx.stroke();
    for (let sy = -1; sy <= 1; sy += 2) {
      cx.fillStyle = o.ca; cx.beginPath(); cx.moveTo(2, sy * 4.5); cx.lineTo(-9, sy * 12.5); cx.lineTo(6, sy * 9.5); cx.closePath(); cx.fill();
      cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(2.5, sy * 6.2); cx.lineTo(-4.5, sy * 10.8); cx.lineTo(4.5, sy * 9); cx.closePath(); cx.fill();
    }
    cx.beginPath(); cx.arc(4, 0, 7.5, 0, TAU); cx.fillStyle = o.ca; cx.fill();
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.ellipse(9.5, 0, 5.2, 4, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#ff2b2b'; cx.fillRect(5.5, -3.6, 3.4, 1.3); cx.fillRect(5.5, 2.3, 3.4, 1.3);
    cx.fillStyle = '#1a0a0a'; dot(14.2, 0, 1.5);
  },
  tengu(o, sw) {
    const sp = o.dashing ? 1 : Math.min(1, o.spd / 700) * .45;
    for (let sy = -1; sy <= 1; sy += 2) {
      cx.save(); cx.rotate(sy * (sp * .55 - .2)); cx.fillStyle = '#14141d'; cx.strokeStyle = o.ca; cx.lineWidth = 1.2;
      cx.beginPath(); cx.moveTo(-2, sy * 8); cx.quadraticCurveTo(-18, sy * (15 + sp * 16), -33, sy * (9 + sp * 15)); cx.lineTo(-25, sy * 5); cx.lineTo(-28, sy * (11 + sp * 10)); cx.lineTo(-15, sy * 4); cx.closePath(); cx.fill(); cx.stroke();
      cx.restore();
    }
    cx.beginPath(); cx.arc(-1, 0, 12, 0, TAU); cx.fillStyle = '#1b1b26'; cx.fill(); cx.strokeStyle = '#3c3c56'; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = '#2e2e44'; cx.lineWidth = 1; cx.beginPath(); for (let k = -1; k <= 1; k++) { cx.moveTo(-10, k * 5); cx.lineTo(-3, k * 4); } cx.stroke();
    cx.beginPath(); cx.arc(4, 0, 7.5, 0, TAU); cx.fillStyle = '#20202c'; cx.fill();
    cx.fillStyle = o.ca; cx.beginPath(); cx.moveTo(8, -3.6); cx.lineTo(21, 0); cx.lineTo(8, 3.6); cx.closePath(); cx.fill(); cx.strokeStyle = '#5a3a00'; cx.lineWidth = 1; cx.stroke();
    cx.fillStyle = '#ff2b2b'; dot(6, -4, 1.5); dot(6, 4, 1.5);
  },
  mecha(o, sw) {
    cx.save(); cx.rotate(-sw); cx.fillStyle = '#2a3340'; cx.strokeStyle = o.ca; cx.lineWidth = 2;
    cx.fillRect(-11, -22, 18, 9); cx.strokeRect(-11, -22, 18, 9); cx.fillRect(-11, 13, 18, 9); cx.strokeRect(-11, 13, 18, 9);
    cx.fillStyle = o.ca; cx.fillRect(-9, -20, 3, 5); cx.fillRect(-9, 15, 3, 5); cx.restore();
    cx.fillStyle = '#1a212b'; rrect(-13, -12, 22, 24, 5); cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 2; cx.stroke();
    hglow(-4, 0, 12, o.ca, .6); cx.fillStyle = o.ca; dot(-4, 0, 3);
    cx.fillStyle = '#2f3a4a'; rrect(1, -7, 12, 14, 3); cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.5; cx.stroke();
    cx.fillStyle = o.ca; cx.fillRect(10, -5, 3, 10);
    cx.strokeStyle = '#8fa4c8'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(2, -6); cx.lineTo(-6, -13); cx.stroke(); cx.fillStyle = '#ff2b2b'; dot(-6, -13, 1.8);
  },
  skull(o, sw) {
    cx.save(); cx.rotate(-sw); cx.fillStyle = '#e8e2d0'; dot(-3, -15, 4.6); dot(-3, 15, 4.6); cx.fillStyle = '#121212'; dot(-3, -15, 1.6); dot(-3, 15, 1.6); cx.restore();
    cx.beginPath(); cx.arc(-2, 0, 11, 0, TAU); cx.fillStyle = '#121212'; cx.fill();
    cx.strokeStyle = '#e8e2d0'; cx.lineWidth = 1.8; cx.beginPath(); cx.moveTo(-12, 0); cx.lineTo(5, 0);
    for (let k = 0; k < 4; k++) { const x = -9 + k * 3.6; cx.moveTo(x, -8 + k); cx.quadraticCurveTo(x + 2.5, 0, x, 8 - k); }
    cx.stroke();
    cx.beginPath(); cx.arc(4, 0, 8.5, 0, TAU); cx.fillStyle = '#efe9d8'; cx.fill(); cx.strokeStyle = '#9a927e'; cx.lineWidth = 1.2; cx.stroke();
    cx.fillStyle = '#121212'; dot(7, -3.4, 2.7); dot(7, 3.4, 2.7); cx.fillStyle = o.ca; dot(7.4, -3.4, 1.2); dot(7.4, 3.4, 1.2); hglow(7, 0, 10, o.ca, .45);
    cx.strokeStyle = '#121212'; cx.lineWidth = 1; cx.beginPath(); for (let k = -2; k <= 2; k++) { cx.moveTo(11, k * 1.4); cx.lineTo(12.5, k * 1.4); } cx.stroke();
  },
  yurei(o, sw) {
    const wv = Math.sin(o.t * 5) * 4;
    cx.fillStyle = 'rgba(233,244,255,.5)';
    cx.beginPath(); cx.moveTo(-4, -10); cx.quadraticCurveTo(-20, -8 + wv, -35, wv * 1.5); cx.quadraticCurveTo(-20, 8 + wv, -4, 10); cx.closePath(); cx.fill();
    hglow(0, 0, 30, o.ca, .35);
    cx.beginPath(); cx.ellipse(-1, 0, 11, 13, 0, 0, TAU); cx.fillStyle = '#f4f8ff'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.5; cx.stroke();
    cx.fillStyle = '#e2ebf6'; cx.beginPath(); cx.ellipse(6, -10, 6, 3.5, .5, 0, TAU); cx.fill(); cx.beginPath(); cx.ellipse(6, 10, 6, 3.5, -.5, 0, TAU); cx.fill();
    cx.beginPath(); cx.arc(3, 0, 8.5, 0, TAU); cx.fillStyle = o.cb; cx.fill();
    cx.strokeStyle = o.cb; cx.lineWidth = 2; cx.beginPath(); for (let k = -2; k <= 2; k++) { cx.moveTo(-2, k * 3); cx.quadraticCurveTo(-10, k * 3.4 + wv * .3, -17, k * 4 + wv * .5); } cx.stroke();
    cx.fillStyle = o.ca; dot(9.2, -2.5, 1.1);
  },
  shogun(o, sw) {
    cx.save(); cx.rotate(-sw);
    for (let sy = -1; sy <= 1; sy += 2) for (let k = 0; k < 3; k++) { cx.fillStyle = k % 2 ? '#7a4a00' : o.ca; cx.fillRect(-12 + k * 2, sy > 0 ? 11 + k * 3.4 : -14.4 - k * 3.4, 16 - k * 2, 3.4); }
    cx.restore();
    cx.beginPath(); cx.arc(-1, 0, 13, 0, TAU); cx.fillStyle = '#3a0a0a'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 2.5; cx.stroke();
    cx.strokeStyle = '#7a4a00'; cx.lineWidth = 1; cx.beginPath(); for (let k = -1; k <= 1; k++) { cx.moveTo(-12, k * 5); cx.lineTo(6, k * 5); } cx.stroke();
    cx.beginPath(); cx.arc(3, 0, 8.5, 0, TAU); cx.fillStyle = '#2a1a08'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = o.ca; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(8, -2); cx.quadraticCurveTo(15, -4, 19, -12); cx.moveTo(8, 2); cx.quadraticCurveTo(15, 4, 19, 12); cx.stroke();
    cx.fillStyle = o.cb; dot(10, 0, 2.3); hglow(14, 0, 16, o.ca, .35);
  },
  raijin(o, sw) {
    const rr = 21, spin = o.t * .8;
    cx.strokeStyle = o.cb; cx.lineWidth = 2; cx.beginPath(); cx.arc(-7, 0, rr, 0, TAU); cx.stroke();
    for (let k = 0; k < 6; k++) {
      const a = spin + k * TAU / 6, x = -7 + Math.cos(a) * rr, y = Math.sin(a) * rr;
      cx.fillStyle = '#3a1060'; dot(x, y, 4.8); cx.strokeStyle = o.ca; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(x, y, 4.8, 0, TAU); cx.stroke();
      cx.fillStyle = o.ca; dot(x, y, 1.5);
    }
    if (((o.t * 4) | 0) % 5 === 0) { cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(-7 + rr, 0); cx.lineTo(-7 + rr + 5, -4); cx.lineTo(-7 + rr + 2, -6); cx.lineTo(-7 + rr + 8, -11); cx.stroke(); }
    cx.beginPath(); cx.arc(-1, 0, 12, 0, TAU); cx.fillStyle = '#2a3550'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = '#eef6ff'; cx.beginPath(); cx.moveTo(0, -8); cx.lineTo(-13, -10); cx.lineTo(-8, -4); cx.lineTo(-15, 0); cx.lineTo(-8, 4); cx.lineTo(-13, 10); cx.lineTo(0, 8); cx.closePath(); cx.fill();
    cx.beginPath(); cx.arc(4, 0, 8, 0, TAU); cx.fillStyle = '#3a4a70'; cx.fill(); cx.strokeStyle = '#9fd8ff'; cx.lineWidth = 1.2; cx.stroke();
    cx.fillStyle = '#ffd700'; dot(8, -3, 1.7); dot(8, 3, 1.7);
    cx.fillStyle = '#f0e6c8'; cx.beginPath(); cx.moveTo(4, -6); cx.lineTo(1, -11); cx.lineTo(6, -7); cx.closePath(); cx.moveTo(4, 6); cx.lineTo(1, 11); cx.lineTo(6, 7); cx.closePath(); cx.fill();
  }
};
/* trails behind the hero: scarf, sash, cape, cable, cat tail, three fox tails */
function drawHeroTrail(body, sc, ca, cb) {
  if (body === 'tengu' || body === 'yurei' || body === 'ashura' || body === 'shinobi2' || body === 'chromesam') return;
  cx.lineCap = 'round'; cx.lineJoin = 'round';
  if (TRAIL4[body]) { TRAIL4[body](sc, ca, cb); return; }
  if (body === 'goo') { // drips of goo
    const ga = cx.globalAlpha; cx.fillStyle = ca;
    for (let i = 1; i < 10; i += 2) { cx.globalAlpha = ga * (.55 - i * .045); dot(sc[i * 2], sc[i * 2 + 1], 4.6 - i * .4); }
    cx.globalAlpha = ga; return;
  }
  if (body === 'wolf' || body === 'dragon') { // bushy wolf tail / spiked dragon tail
    const tc = body === 'wolf' ? '#4a5478' : '#1f5a3a';
    cx.strokeStyle = tc; cx.lineWidth = body === 'wolf' ? 9 : 7; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 7; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
    cx.lineWidth = body === 'wolf' ? 6 : 3.5; cx.beginPath(); cx.moveTo(sc[12], sc[13]); for (let i = 7; i < 10; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
    if (body === 'wolf') { cx.strokeStyle = '#c9d0e4'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(sc[16], sc[17]); cx.lineTo(sc[18], sc[19]); cx.stroke(); }
    else { cx.fillStyle = cb; for (let i = 2; i < 9; i += 2) dot(sc[i * 2], sc[i * 2 + 1], 2.2 - i * .12); }
    return;
  }
  if (body === 'kitsune') {
    for (let k = -1; k <= 1; k++) {
      cx.strokeStyle = ca; cx.beginPath();
      for (let i = 0; i < 10; i++) {
        const j = Math.min(9, i + 1), dx = sc[j * 2] - sc[i * 2], dy = sc[j * 2 + 1] - sc[i * 2 + 1], dl = Math.hypot(dx, dy) || 1, off = k * i * 1.1;
        const x = sc[i * 2] - dy / dl * off, y = sc[i * 2 + 1] + dx / dl * off; if (i) cx.lineTo(x, y); else cx.moveTo(x, y);
      }
      cx.lineWidth = 7; cx.stroke(); cx.strokeStyle = '#ffffff'; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(sc[14] - 0, sc[15]); for (let i = 8; i < 10; i++) cx.lineTo(sc[i * 2] + k * 3, sc[i * 2 + 1]); cx.stroke();
    }
    return;
  }
  const col = body === 'ronin' ? '#8a1b1b' : body === 'mecha' ? '#55606e' : body === 'skull' || body === 'oni' ? '#1a1418' : body === 'viking' ? '#4a2e18' : body === 'neko' ? ca : cb;
  const w1 = body === 'shogun' || body === 'knight' || body === 'viking' ? 9 : body === 'neko' ? 3.5 : body === 'mecha' ? 3 : 5, w2 = body === 'shogun' || body === 'knight' || body === 'viking' ? 6 : body === 'neko' ? 2.5 : 3;
  cx.strokeStyle = col;
  cx.lineWidth = w1; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 6; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
  cx.lineWidth = w2; cx.beginPath(); cx.moveTo(sc[10], sc[11]); for (let i = 6; i < 10; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
  if (body === 'mecha') { cx.fillStyle = ca; dot(sc[18], sc[19], 2.2); }
}
/* draw a hero into another canvas (shop icons and previews) */
function withCtx(g, fn) { const keep = cx; cx = g; try { fn(); } finally { cx = keep; } }

/* ---------------- more bodies: wolf warrior, knight, viking, dragon, slime ---------------- */
function spikyRing(x, n, r0, r1) { cx.beginPath(); for (let k = 0; k < n; k++) { const a = k * TAU / n, r = k % 2 ? r0 : r1, px = x + Math.cos(a) * r, py = Math.sin(a) * r; if (k) cx.lineTo(px, py); else cx.moveTo(px, py); } cx.closePath(); }
Object.assign(BODY, {
  wolf(o, sw) {
    pads(sw, '#262b40', o.ca, 12, 7, -8);
    spikyRing(-2, 18, 11, 15.5); cx.fillStyle = '#3a4260'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.5; cx.stroke(); // fur mane
    cx.beginPath(); cx.arc(-2, 0, 9.5, 0, TAU); cx.fillStyle = '#2a3048'; cx.fill();
    for (let sy = -1; sy <= 1; sy += 2) { // ears
      cx.fillStyle = '#3a4260'; cx.beginPath(); cx.moveTo(2, sy * 3); cx.lineTo(-5, sy * 11); cx.lineTo(5, sy * 7.4); cx.closePath(); cx.fill();
      cx.fillStyle = '#e88aa0'; cx.beginPath(); cx.moveTo(2, sy * 4.4); cx.lineTo(-2.6, sy * 9); cx.lineTo(3.6, sy * 6.8); cx.closePath(); cx.fill();
    }
    cx.beginPath(); cx.ellipse(5, 0, 8.5, 6.5, 0, 0, TAU); cx.fillStyle = '#4a5478'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.2; cx.stroke();
    cx.beginPath(); cx.ellipse(11.2, 0, 5.2, 3.7, 0, 0, TAU); cx.fillStyle = '#c9d0e4'; cx.fill(); // snout
    cx.fillStyle = '#0a0a12'; dot(15.8, 0, 1.7);
    hglow(7, 0, 12, o.ca, .45); cx.fillStyle = o.ca; dot(6.6, -3.5, 1.6); dot(6.6, 3.5, 1.6);
  },
  knight(o, sw) {
    cx.save(); cx.rotate(-sw);
    for (let sy = -1; sy <= 1; sy += 2) { // round pauldrons
      cx.beginPath(); cx.ellipse(-3, sy * 14, 8.5, 6.5, 0, 0, TAU); cx.fillStyle = '#8a94aa'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.6; cx.stroke();
      cx.strokeStyle = '#5a6478'; cx.lineWidth = 1; cx.beginPath(); cx.ellipse(-3, sy * 14, 5, 3.6, 0, 0, TAU); cx.stroke();
    }
    cx.restore();
    cx.beginPath(); cx.arc(-2, 0, 12, 0, TAU); cx.fillStyle = '#5c667c'; cx.fill(); cx.strokeStyle = '#c9d2e0'; cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = o.cb; cx.fillRect(-12, -2.2, 12, 4.4); cx.fillRect(-7.4, -9, 4.4, 18); // tabard cross on the back
    cx.fillStyle = '#a7b0c4'; rrect(-3, -7.5, 14, 15, 4); cx.fill(); cx.strokeStyle = '#e8eef8'; cx.lineWidth = 1.4; cx.stroke(); // great helm
    cx.fillStyle = '#0a0c14'; cx.fillRect(7.6, -5.5, 2.2, 11); cx.fillRect(3.6, -.9, 4.4, 1.8); // visor
    const pw = Math.sin(o.t * 6) * 1.5, pt = Math.sin(o.t * 5) * 3;
    cx.lineCap = 'round'; cx.strokeStyle = o.cb; cx.lineWidth = 4.5; cx.beginPath(); cx.moveTo(5, 0); cx.quadraticCurveTo(-4, pw, -15, pt); cx.stroke(); // plume
    cx.strokeStyle = '#ff7a8a'; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(4, 0); cx.quadraticCurveTo(-4, pw, -13, pt); cx.stroke();
  },
  viking(o, sw) {
    cx.beginPath(); cx.arc(-10, 0, 12.5, 0, TAU); cx.fillStyle = '#7a4a22'; cx.fill(); cx.strokeStyle = '#c9d2e0'; cx.lineWidth = 2; cx.stroke(); // round shield on the back
    cx.strokeStyle = o.cb; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-10, -11.5); cx.lineTo(-10, 11.5); cx.moveTo(-21.5, 0); cx.lineTo(1.5, 0); cx.stroke();
    cx.fillStyle = '#c9d2e0'; dot(-10, 0, 3);
    pads(sw, '#5a3a22', o.ca, 12, 7, -6);
    spikyRing(1, 14, 9, 11.8); cx.fillStyle = '#8a7a6a'; cx.fill(); // fur collar
    cx.beginPath(); cx.arc(3.5, 0, 7.5, 0, TAU); cx.fillStyle = '#a0a8b8'; cx.fill(); cx.strokeStyle = '#e8eef8'; cx.lineWidth = 1.2; cx.stroke(); // helmet
    cx.strokeStyle = '#6a7284'; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(-3, 0); cx.lineTo(11, 0); cx.stroke();
    cx.lineCap = 'round'; cx.strokeStyle = '#f0e6c8'; cx.lineWidth = 3.4; // horns
    for (let sy = -1; sy <= 1; sy += 2) { cx.beginPath(); cx.moveTo(3, sy * 6.5); cx.quadraticCurveTo(-3, sy * 15, 6, sy * 19); cx.stroke(); }
    cx.strokeStyle = o.ca; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(10, -2.4); cx.lineTo(16.5, -3.4); cx.moveTo(10, 2.4); cx.lineTo(16.5, 3.4); cx.stroke(); // braided beard
    cx.fillStyle = '#c9d2e0'; dot(16.8, -3.4, 1.3); dot(16.8, 3.4, 1.3);
  },
  dragon(o, sw) {
    const sp = o.dashing ? 1 : Math.min(1, o.spd / 700) * .5;
    for (let sy = -1; sy <= 1; sy += 2) { // bat wings open as it speeds up
      cx.save(); cx.rotate(sy * (sp * .5 - .15));
      cx.fillStyle = 'rgba(16,58,38,.92)'; cx.strokeStyle = o.ca; cx.lineWidth = 1.3;
      cx.beginPath(); cx.moveTo(-1, sy * 8); cx.lineTo(-10, sy * (24 + sp * 8)); cx.quadraticCurveTo(-14, sy * (18 + sp * 6), -20, sy * (21 + sp * 8)); cx.quadraticCurveTo(-21, sy * (14 + sp * 4), -27, sy * (14 + sp * 6)); cx.quadraticCurveTo(-20, sy * 9, -10, sy * 5); cx.closePath(); cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-1, sy * 8); cx.lineTo(-20, sy * (21 + sp * 8)); cx.moveTo(-1, sy * 8); cx.lineTo(-27, sy * (14 + sp * 6)); cx.stroke();
      cx.restore();
    }
    cx.beginPath(); cx.arc(-2, 0, 11.5, 0, TAU); cx.fillStyle = '#1f5a3a'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = 'rgba(109,255,158,.35)'; cx.lineWidth = 1; for (let k = -1; k <= 1; k++) { cx.beginPath(); cx.arc(-7, k * 4.6, 3.4, -1.2, 1.2); cx.stroke(); } // scales
    cx.fillStyle = o.cb; for (let k = 0; k < 3; k++) { const x = -5 - k * 4.5; cx.beginPath(); cx.moveTo(x + 2.2, 0); cx.lineTo(x - 1.6, -2.4); cx.lineTo(x - 1.6, 2.4); cx.closePath(); cx.fill(); } // spines
    cx.beginPath(); cx.ellipse(6, 0, 8.5, 6.2, 0, 0, TAU); cx.fillStyle = '#2a7a4e'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.2; cx.stroke();
    cx.beginPath(); cx.ellipse(12.5, 0, 4.6, 3.8, 0, 0, TAU); cx.fill(); // snout
    cx.lineCap = 'round'; cx.strokeStyle = o.cb; cx.lineWidth = 2.4; for (let sy = -1; sy <= 1; sy += 2) { cx.beginPath(); cx.moveTo(3, sy * 4.5); cx.quadraticCurveTo(-3, sy * 7, -9, sy * 10.5); cx.stroke(); } // horns
    cx.fillStyle = o.cb; dot(9, -3, 1.7); dot(9, 3, 1.7); cx.fillStyle = '#0a0a12'; cx.fillRect(8.6, -3.9, .8, 1.8); cx.fillRect(8.6, 2.1, .8, 1.8); // slit eyes
    cx.fillStyle = '#0a1a10'; dot(15.6, -1.4, .9); dot(15.6, 1.4, .9);
    if (o.dashing || o.od) hglow(19, 0, 14, '#ffb347', .7); // a breath of fire when it lunges
  },
  goo(o, sw) {
    const w = o.spd > 35 ? 1.5 : 1, ga = cx.globalAlpha;
    cx.beginPath();
    for (let k = 0; k <= 22; k++) { const a = k * TAU / 22, r = 14 + Math.sin(a * 3 + o.t * 5) * 1.3 * w + Math.cos(a * 2 - o.t * 4) * 1.1, px = -1 + Math.cos(a) * r, py = Math.sin(a) * r; if (k) cx.lineTo(px, py); else cx.moveTo(px, py); }
    cx.closePath(); cx.fillStyle = o.ca; cx.globalAlpha = ga * .5; cx.fill(); cx.globalAlpha = ga; cx.strokeStyle = o.ca; cx.lineWidth = 2; cx.stroke();
    hglow(-1, 0, 30, o.ca, .35);
    cx.fillStyle = o.cb; dot(-5 + Math.sin(o.t * 2) * 2, 3, 2.4); // floating core
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.ellipse(-6, -6, 4, 2.4, -.6, 0, TAU); cx.fill();
    for (let sy = -1; sy <= 1; sy += 2) { cx.fillStyle = '#ffffff'; dot(6, sy * 4.8, 3.7); cx.fillStyle = '#05060f'; dot(7.7, sy * 4.6, 1.9); }
    cx.strokeStyle = '#05060f'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(8.5, 0, 2.8, -1, 1); cx.stroke();
  }
});
