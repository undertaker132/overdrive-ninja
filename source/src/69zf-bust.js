/* ---------------- HERO BUSTS — a detailed portrait of every hero ----------------
   The in-run heroes are drawn top-down and small. Menus show this instead: a
   front-facing bust with shading, rim light and a headpiece for each body type,
   painted in the skin's own two colors. heroBust(g, skin, S, t) draws it into
   an S x S box; t animates the breathing and the visor glow. */
function bustShade(g, x0, y0, x1, y1, c0, c1) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }
function bustMix(c, k) { // c mixed toward black (k<0) or white (k>0)
  const n = parseInt(c.slice(1), 16), r = n >> 16, gg = n >> 8 & 255, b = n & 255, t = k < 0 ? 0 : 255, q = Math.abs(k);
  return 'rgb(' + Math.round(r + (t - r) * q) + ',' + Math.round(gg + (t - gg) * q) + ',' + Math.round(b + (t - b) * q) + ')';
}
const BUST_KIND = { ninja: 'hood', shinobi2: 'hood', netrunner: 'netrunner', ronin: 'kasa', mecha: 'mech', exo: 'mech', sovereign: 'crown', chromesam: 'kabuto', knight: 'knight', shogun: 'kabuto',
  oni: 'oni', ashura: 'oni', dragon: 'dragon', raijin: 'raijin', seraph: 'seraph', lich: 'lich', skull: 'skull', neko: 'ears', wolf: 'wolf', kitsune: 'fox', witch: 'witch', viking: 'viking',
  tengu: 'tengu', yurei: 'yurei', idol: 'idol', blaze: 'blaze', pixel: 'pixel', goo: 'goo', rider: 'rider', pumpkin: 'pumpkin', yeti: 'yeti' };
function heroBust(g, sk, S, t) {
  sk = sk || SKINS[0]; t = t || 0; const A = sk.a || '#00f2fe', B = sk.b || '#ff0844', kind = BUST_KIND[sk.body] || 'hood';
  g.save(); g.scale(S / 200, S / 200); g.translate(100, 104 + Math.sin(t * 2) * 1.2);
  g.lineJoin = 'round'; g.lineCap = 'round';
  // backlight
  let gr = g.createRadialGradient(0, -10, 10, 0, 0, 105); gr.addColorStop(0, bustMix(A, -.35)); gr.addColorStop(.55, bustMix(A, -.8)); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, -6, 100, 0, TAU); g.fill();
  if (kind === 'seraph') { // wings behind
    g.save(); g.globalAlpha = .9; for (const s of [-1, 1]) { g.fillStyle = bustShade(g, 0, -60, s * 90, 40, '#ffffff', A);
      g.beginPath(); g.moveTo(s * 30, 10); g.quadraticCurveTo(s * 110, -70, s * 96, 30); g.quadraticCurveTo(s * 80, 10, s * 70, 40); g.quadraticCurveTo(s * 60, 20, s * 40, 48); g.closePath(); g.fill(); } g.restore();
  }
  // torso and shoulders
  const armored = /mech|crown|kabuto|knight|dragon|raijin|viking|rider/.test(kind);
  g.fillStyle = bustShade(g, -80, 30, 80, 100, '#1c2246', '#080a1c');
  g.beginPath(); g.moveTo(-92, 100); g.quadraticCurveTo(-88, 46, -40, 34); g.lineTo(40, 34); g.quadraticCurveTo(88, 46, 92, 100); g.closePath(); g.fill();
  if (armored) { for (const s of [-1, 1]) { g.fillStyle = bustShade(g, s * 40, 30, s * 90, 70, bustMix(B, -.2), bustMix(B, -.6)); g.beginPath(); g.ellipse(s * 62, 52, 30, 18, s * .35, 0, TAU); g.fill(); g.strokeStyle = A; g.lineWidth = 2.5; g.stroke(); } }
  g.strokeStyle = A; g.lineWidth = 3; g.globalAlpha = .8; g.beginPath(); g.moveTo(-30, 100); g.lineTo(-22, 52); g.moveTo(30, 100); g.lineTo(22, 52); g.stroke(); g.globalAlpha = 1;
  g.fillStyle = A; g.shadowColor = A; g.shadowBlur = 12; g.beginPath(); g.arc(0, 74, 6, 0, TAU); g.fill(); g.shadowBlur = 0; // chest core
  // collar / scarf
  if (!/pumpkin|goo|pixel/.test(kind)) { g.fillStyle = bustShade(g, -50, 20, 50, 50, B, bustMix(B, -.4)); g.beginPath(); g.moveTo(-46, 30); g.quadraticCurveTo(0, 56, 46, 30); g.lineTo(42, 46); g.quadraticCurveTo(0, 70, -42, 46); g.closePath(); g.fill();
    if (/hood|netrunner|kasa|fox|ears|wolf/.test(kind)) { g.beginPath(); g.moveTo(36, 40); g.quadraticCurveTo(80, 36, 104 + Math.sin(t * 3) * 4, 8); g.quadraticCurveTo(82, 46, 96, 58); g.quadraticCurveTo(64, 58, 40, 50); g.closePath(); g.fill(); } }
  // the head
  const head = (col0, col1) => { g.fillStyle = bustShade(g, -40, -80, 40, 30, col0, col1); g.beginPath(); g.moveTo(-44, -6); g.quadraticCurveTo(-48, -78, 0, -82); g.quadraticCurveTo(48, -78, 44, -6); g.quadraticCurveTo(38, 30, 0, 38); g.quadraticCurveTo(-38, 30, -44, -6); g.fill(); };
  const rim = () => { g.save(); g.strokeStyle = A; g.lineWidth = 3; g.shadowColor = A; g.shadowBlur = 14; g.beginPath(); g.moveTo(42, -40); g.quadraticCurveTo(48, 0, 30, 26); g.stroke(); g.restore(); };
  const visor = (y, w, h, c) => { g.fillStyle = '#05060f'; g.beginPath(); g.moveTo(-w - 4, y - h); g.lineTo(w + 4, y - h); g.lineTo(w - 4, y + h); g.lineTo(-w + 4, y + h); g.closePath(); g.fill();
    g.save(); g.shadowColor = c; g.shadowBlur = 18 + Math.sin(t * 4) * 6; g.fillStyle = bustShade(g, -w, 0, w, 0, bustMix(c, -.2), '#ffffff'); g.beginPath(); g.moveTo(-w, y - h * .55); g.lineTo(w, y - h * .55); g.lineTo(w - 5, y + h * .55); g.lineTo(-w + 5, y + h * .55); g.closePath(); g.fill(); g.restore(); };
  const eyes = (y, c, sp, sz) => { g.save(); g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 14; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (sp || 16), y, sz || 7, (sz || 7) * .55, s * -.25, 0, TAU); g.fill(); } g.restore(); };
  const horns = (c, len, curve) => { g.fillStyle = c; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 22, -66); g.quadraticCurveTo(s * (40 + curve), -100, s * (30 + curve * .6), -66 - len); g.quadraticCurveTo(s * (36 + curve * .3), -94, s * 36, -60); g.closePath(); g.fill(); } };
  switch (kind) {
    case 'hood': case 'netrunner':
      g.fillStyle = bustShade(g, -60, -90, 60, 40, bustMix(A, -.55), '#07081a'); g.beginPath(); g.moveTo(-56, 30); g.quadraticCurveTo(-66, -96, 0, -96); g.quadraticCurveTo(66, -96, 56, 30); g.quadraticCurveTo(30, 10, 0, 12); g.quadraticCurveTo(-30, 10, -56, 30); g.fill();
      head('#1a1f3c', '#090b1e'); visor(-22, 34, 9, A);
      g.fillStyle = '#10142c'; g.beginPath(); g.moveTo(-36, 0); g.quadraticCurveTo(0, 14, 36, 0); g.lineTo(28, 30); g.quadraticCurveTo(0, 40, -28, 30); g.closePath(); g.fill();
      g.strokeStyle = bustMix(A, -.2); g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 9, 12); g.lineTo(i * 8, 30); g.stroke(); }
      if (kind === 'netrunner') { g.strokeStyle = B; g.lineWidth = 4; g.beginPath(); g.moveTo(40, -40); g.bezierCurveTo(80, -30, 70, 30, 96, 60); g.stroke(); g.fillStyle = B; g.fillRect(34, -50, 12, 18); }
      break;
    case 'kasa':
      head('#e8c9a8', '#a07a5a'); eyes(-18, A, 15, 6); g.fillStyle = '#3a2a1a'; g.fillRect(-14, 6, 28, 3);
      g.fillStyle = bustShade(g, -100, -70, 100, -30, '#f0c070', '#8a5a20'); g.beginPath(); g.moveTo(-104, -32); g.quadraticCurveTo(0, -120, 104, -32); g.quadraticCurveTo(0, -48, -104, -32); g.fill();
      g.strokeStyle = 'rgba(80,40,10,.5)'; g.lineWidth = 1.5; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(0, -84); g.lineTo(i * 24, -38); g.stroke(); }
      break;
    case 'mech': case 'crown': case 'knight': case 'rider':
      head(bustMix(B, -.1), bustMix(B, -.7)); rim();
      if (kind === 'rider') { g.fillStyle = bustShade(g, -50, -90, 50, 20, '#2a2a3a', '#0a0a14'); g.beginPath(); g.ellipse(0, -30, 52, 58, 0, 0, TAU); g.fill(); visor(-26, 40, 16, A); }
      else { visor(-24, 36, 10, A); g.fillStyle = bustMix(B, -.5); g.fillRect(-26, 4, 52, 20); g.strokeStyle = A; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 10, 6); g.lineTo(i * 10, 22); g.stroke(); } }
      if (kind === 'mech') { g.strokeStyle = A; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 40, -50); g.lineTo(s * 58, -96); g.stroke(); g.fillStyle = A; g.beginPath(); g.arc(s * 58, -96, 4, 0, TAU); g.fill(); } }
      if (kind === 'crown') { g.save(); g.shadowColor = '#ffd23f'; g.shadowBlur = 16; g.fillStyle = bustShade(g, 0, -120, 0, -70, '#fff4a0', '#d89a00'); g.beginPath(); g.moveTo(-40, -72); g.lineTo(-46, -112); g.lineTo(-22, -90); g.lineTo(0, -122); g.lineTo(22, -90); g.lineTo(46, -112); g.lineTo(40, -72); g.closePath(); g.fill(); g.restore(); }
      if (kind === 'knight') { g.fillStyle = B; g.beginPath(); g.moveTo(0, -82); g.quadraticCurveTo(70, -130, 90, -70); g.quadraticCurveTo(50, -100, 6, -70); g.fill(); }
      break;
    case 'kabuto': case 'shogun':
      head(bustMix(B, -.1), bustMix(B, -.75)); rim(); visor(-22, 34, 9, A);
      g.fillStyle = bustShade(g, -80, -60, 80, -20, bustMix(B, -.3), '#05060f'); g.beginPath(); g.moveTo(-82, -18); g.quadraticCurveTo(-60, -56, 0, -58); g.quadraticCurveTo(60, -56, 82, -18); g.quadraticCurveTo(50, -36, 0, -38); g.quadraticCurveTo(-50, -36, -82, -18); g.fill();
      g.save(); g.shadowColor = '#ffd23f'; g.shadowBlur = 18; g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(0, -118, 58, Math.PI * .18, Math.PI * .82); g.arc(0, -128, 50, Math.PI * .78, Math.PI * .22, true); g.closePath(); g.fill(); g.restore();
      g.fillStyle = '#ff0844'; g.beginPath(); g.moveTo(0, -84); g.lineTo(9, -72); g.lineTo(0, -60); g.lineTo(-9, -72); g.closePath(); g.fill();
      break;
    case 'oni':
      horns('#f0e0c0', 40, 14); head(bustMix(B, .05), bustMix(B, -.55)); rim(); eyes(-20, '#ffe14d', 17, 8);
      g.fillStyle = '#ffffff'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 18, 10); g.lineTo(s * 12, 26); g.lineTo(s * 6, 10); g.fill(); } g.strokeStyle = '#1a0505'; g.lineWidth = 4; g.beginPath(); g.moveTo(-26, 10); g.quadraticCurveTo(0, 20, 26, 10); g.stroke();
      g.strokeStyle = bustMix(B, -.6); g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 32, -36); g.lineTo(s * 8, -28); g.stroke(); }
      break;
    case 'dragon': case 'raijin':
      if (kind === 'raijin') { g.save(); g.strokeStyle = '#ffe14d'; g.lineWidth = 6; g.shadowColor = '#ffe14d'; g.shadowBlur = 16; g.beginPath(); g.arc(0, -30, 84, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); for (let i = 0; i < 6; i++) { const a = Math.PI * (1.08 + i * .17); g.fillStyle = '#ffe14d'; g.beginPath(); g.arc(Math.cos(a) * 84, -30 + Math.sin(a) * 84, 9, 0, TAU); g.fill(); } g.restore(); }
      horns(bustMix(A, .3), 46, 22); head(bustMix(B, -.05), bustMix(B, -.7)); rim(); visor(-22, 32, 9, A);
      g.strokeStyle = A; g.lineWidth = 3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 20, 14); g.quadraticCurveTo(s * 60, 30, s * 70 + Math.sin(t * 3 + s) * 6, 70); g.stroke(); }
      g.fillStyle = bustMix(B, -.4); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-10 + i * 0, -82 + i * 0); g.moveTo(-6, -80 - i * 10); g.lineTo(0, -92 - i * 10); g.lineTo(6, -80 - i * 10); g.fill(); }
      break;
    case 'seraph':
      head('#f4f0ff', '#a8a0d0'); visor(-22, 30, 8, A);
      g.save(); g.strokeStyle = '#ffe99a'; g.lineWidth = 5; g.shadowColor = '#ffd23f'; g.shadowBlur = 20; g.beginPath(); g.ellipse(0, -100, 44, 11, 0, 0, TAU); g.stroke(); g.restore();
      break;
    case 'lich': case 'skull':
      if (kind === 'lich') { g.fillStyle = bustShade(g, -60, -90, 60, 40, bustMix(B, -.5), '#05040c'); g.beginPath(); g.moveTo(-58, 34); g.quadraticCurveTo(-70, -100, 0, -104); g.quadraticCurveTo(70, -100, 58, 34); g.quadraticCurveTo(0, 0, -58, 34); g.fill(); }
      head('#e8e4d8', '#8a8478'); g.fillStyle = '#0a0812'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 16, -20, 12, 14, 0, 0, TAU); g.fill(); } eyes(-20, A, 16, 5);
      g.beginPath(); g.moveTo(0, -6); g.lineTo(-6, 6); g.lineTo(6, 6); g.closePath(); g.fill();
      g.strokeStyle = '#0a0812'; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 6, 14); g.lineTo(i * 6, 26); g.stroke(); }
      if (kind === 'lich') { g.save(); g.fillStyle = '#ffd23f'; g.shadowColor = A; g.shadowBlur = 12; g.beginPath(); g.moveTo(-34, -66); g.lineTo(-24, -92); g.lineTo(-10, -72); g.lineTo(0, -98); g.lineTo(10, -72); g.lineTo(24, -92); g.lineTo(34, -66); g.closePath(); g.fill(); g.restore(); }
      break;
    case 'ears': case 'wolf': case 'fox':
      for (const s of [-1, 1]) { g.fillStyle = kind === 'fox' ? '#ffffff' : bustMix(A, -.3); g.beginPath(); g.moveTo(s * 18, -70); g.lineTo(s * (kind === 'wolf' ? 46 : 40), -116); g.lineTo(s * 46, -56); g.closePath(); g.fill(); g.fillStyle = B; g.beginPath(); g.moveTo(s * 26, -70); g.lineTo(s * 39, -100); g.lineTo(s * 42, -64); g.closePath(); g.fill(); }
      if (kind === 'fox') { head('#ffffff', '#c8c0d8'); g.fillStyle = B; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 8, -30); g.quadraticCurveTo(s * 30, -42, s * 34, -18); g.quadraticCurveTo(s * 20, -26, s * 8, -24); g.fill(); } g.fillStyle = '#1a0a14'; g.beginPath(); g.arc(0, 10, 5, 0, TAU); g.fill(); eyes(-26, A, 18, 5); }
      else { head(bustMix(A, -.55), '#07081a'); visor(-22, 32, 8, A); if (kind === 'wolf') { g.fillStyle = bustMix(A, -.4); g.beginPath(); g.moveTo(-24, 0); g.lineTo(0, 34); g.lineTo(24, 0); g.closePath(); g.fill(); } }
      break;
    case 'witch':
      head('#f0d8e8', '#a888a0'); eyes(-16, A, 15, 6); g.fillStyle = B; g.beginPath(); g.ellipse(0, 12, 8, 3, 0, 0, TAU); g.fill();
      g.fillStyle = bustShade(g, -90, -60, 90, -40, bustMix(B, -.3), '#0a0618'); g.beginPath(); g.ellipse(0, -48, 92, 16, -.05, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(-50, -54); g.quadraticCurveTo(-10, -120, 30, -150 + Math.sin(t * 2) * 4); g.quadraticCurveTo(10, -110, 50, -54); g.closePath(); g.fill();
      g.fillStyle = A; g.shadowColor = A; g.shadowBlur = 14; phStar(g, 10, .45); g.save(); g.translate(14, -76); phStar(g, 10, .45); g.fill(); g.restore(); g.shadowBlur = 0;
      break;
    case 'viking':
      horns('#f0e0c0', 30, 30); head('#e8c9a8', '#a07a5a'); g.fillStyle = bustShade(g, -50, -90, 50, -30, '#c0c8d8', '#5a6478'); g.beginPath(); g.moveTo(-48, -30); g.quadraticCurveTo(-48, -94, 0, -94); g.quadraticCurveTo(48, -94, 48, -30); g.closePath(); g.fill();
      g.fillRect(-5, -36, 10, 34); eyes(-16, A, 18, 6); g.fillStyle = B; g.beginPath(); g.moveTo(-40, 4); g.quadraticCurveTo(0, 70, 40, 4); g.quadraticCurveTo(0, 26, -40, 4); g.fill();
      break;
    case 'tengu':
      head('#d8202a', '#6a0a10'); rim(); eyes(-22, '#ffe14d', 17, 6); g.fillStyle = '#b8101a'; g.beginPath(); g.moveTo(-8, -14); g.lineTo(54, 14); g.lineTo(-4, 8); g.closePath(); g.fill();
      g.strokeStyle = '#ffffff'; g.lineWidth = 5; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 8, -36); g.lineTo(s * 30, -44); g.stroke(); } g.fillStyle = '#101010'; g.fillRect(-16, -100, 32, 18);
      break;
    case 'yurei':
      head('#e8ecf4', '#9aa0b8'); g.fillStyle = bustShade(g, 0, -90, 0, 60, '#101018', '#000'); g.beginPath(); g.moveTo(-50, 60); g.quadraticCurveTo(-60, -96, 0, -92); g.quadraticCurveTo(60, -96, 50, 60); g.lineTo(18, 60); g.quadraticCurveTo(24, -20, 8, -50); g.quadraticCurveTo(-10, -20, -18, 60); g.closePath(); g.fill(); eyes(-14, A, 10, 4);
      break;
    case 'idol':
      for (const s of [-1, 1]) { g.fillStyle = bustShade(g, s * 40, -60, s * 90, 60, A, bustMix(A, -.5)); g.beginPath(); g.moveTo(s * 40, -60); g.quadraticCurveTo(s * 100, -40 + Math.sin(t * 3 + s) * 4, s * 84, 70); g.quadraticCurveTo(s * 70, 0, s * 36, -40); g.fill(); }
      head('#f6dde4', '#b898a4'); g.fillStyle = A; g.beginPath(); g.moveTo(-46, -20); g.quadraticCurveTo(-50, -92, 0, -88); g.quadraticCurveTo(50, -92, 46, -20); g.quadraticCurveTo(30, -60, 0, -58); g.quadraticCurveTo(-30, -60, -46, -20); g.fill();
      eyes(-14, B, 16, 7); g.strokeStyle = '#00f2fe'; g.lineWidth = 4; g.beginPath(); g.arc(0, -30, 54, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.moveTo(-50, -10); g.quadraticCurveTo(-40, 14, -16, 16); g.stroke();
      break;
    case 'blaze':
      g.save(); g.shadowColor = '#ff8a00'; g.shadowBlur = 20; g.fillStyle = bustShade(g, 0, -130, 0, -50, '#ffe14d', '#ff3d00'); g.beginPath(); g.moveTo(-46, -50);
      for (let i = 0; i <= 6; i++) { const x = -46 + i * 15.3, h = 90 + (i % 2 ? 0 : 30) + Math.sin(t * 6 + i) * 6; g.lineTo(x, -h); g.lineTo(x + 7.5, -60); } g.lineTo(46, -50); g.closePath(); g.fill(); g.restore();
      head('#e8b890', '#9a6a4a'); eyes(-18, '#ff8a00', 16, 6); g.fillStyle = B; g.fillRect(-46, -44, 92, 12);
      break;
    case 'pixel':
      g.fillStyle = A; for (let y = -5; y < 3; y++) for (let x = -4; x < 4; x++) { const r = (x * 7 + y * 13) & 3; g.fillStyle = r ? bustMix(A, -.2 * r) : A; g.fillRect(x * 12, -60 + (y + 5) * 12 - 20, 11, 11); }
      g.fillStyle = '#ffffff'; g.fillRect(-26, -40, 14, 14); g.fillRect(12, -40, 14, 14); g.fillStyle = '#05060f'; g.fillRect(-20, -36, 7, 7); g.fillRect(18, -36, 7, 7);
      break;
    case 'goo':
      g.fillStyle = bustShade(g, -60, -80, 60, 60, bustMix(A, .2), bustMix(A, -.5)); g.beginPath(); g.moveTo(-70, 60); g.quadraticCurveTo(-76, -80, 0, -82 + Math.sin(t * 3) * 4); g.quadraticCurveTo(76, -80, 70, 60); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-26, -50, 12, 20, -.4, 0, TAU); g.fill(); eyes(-14, '#ffffff', 20, 9); g.fillStyle = '#05060f'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 20, -12, 4, 0, TAU); g.fill(); }
      break;
    case 'pumpkin':
      g.fillStyle = bustShade(g, -60, -80, 60, 40, '#ffa040', '#c04a00'); g.beginPath(); g.ellipse(0, -20, 62, 54, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,40,0,.6)'; g.lineWidth = 3; for (const x of [-30, 0, 30]) { g.beginPath(); g.ellipse(x, -20, 16, 52, 0, 0, TAU); g.stroke(); }
      g.save(); g.fillStyle = '#ffe14d'; g.shadowColor = '#ff8a00'; g.shadowBlur = 18; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 34, -30); g.lineTo(s * 12, -46); g.lineTo(s * 10, -24); g.closePath(); g.fill(); }
      g.beginPath(); g.moveTo(-36, 0); g.lineTo(-24, 6); g.lineTo(-16, -2); g.lineTo(-6, 8); g.lineTo(6, -2); g.lineTo(16, 8); g.lineTo(26, -2); g.lineTo(36, 0); g.quadraticCurveTo(0, 40, -36, 0); g.fill(); g.restore();
      g.fillStyle = '#3a6a10'; g.fillRect(-5, -88, 10, 18);
      break;
    case 'yeti':
      horns('#cfe8ff', 26, 26); g.fillStyle = bustShade(g, -60, -80, 60, 40, '#ffffff', '#9ab0c8'); g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = 56 + (i % 2 ? 6 : 0); g.lineTo(Math.cos(a) * r, -16 + Math.sin(a) * r * .95); } g.closePath(); g.fill();
      g.fillStyle = '#1a2a40'; g.beginPath(); g.ellipse(0, -8, 30, 26, 0, 0, TAU); g.fill(); eyes(-14, A, 12, 6);
      break;
    default: head(bustMix(A, -.5), '#07081a'); visor(-22, 34, 9, A);
  }
  g.restore();
}
/* the title screen shows the bust next to the hero's name, breathing and glowing */
Object.assign(TitleHero, {
  attach() { const cv = $('thCv'); if (!cv) return; this.cv = cv; const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = cv.height = Math.round(120 * dpr); this.g = cv.getContext('2d'); this.k = cv.width / 120; },
  tick(rd) { if (UI.cur !== 'title') return; if (!this.g) this.attach(); if (!this.g) return; this.t += rd; const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); this.drawBust(g, this.cv.width); },
  drawBust(g, S) {
    const d = Store.data, sk = skinLook(d.skin), lv = heroLevel(d.skin), t = this.t;
    g.clearRect(0, 0, S, S); g.fillStyle = '#080b1c'; g.fillRect(0, 0, S, S);
    try { heroBust(g, sk, S, t); } catch (e) { errLog(e); }
    const k = S / 120; g.fillStyle = sk.a; g.globalAlpha = .7; g.fillRect(0, 0, 2 * k, S); g.fillRect(S - 2 * k, 0, 2 * k, S); g.globalAlpha = 1;
    if (lv >= 3) { g.save(); g.globalAlpha = .25 + .1 * Math.sin(t * 5); const gr = g.createLinearGradient(0, S, 0, S * .5); gr.addColorStop(0, '#ffd23f'); gr.addColorStop(1, 'rgba(255,210,63,0)'); g.fillStyle = gr; g.fillRect(0, S * .5, S, S * .5); g.restore(); }
    if (lv >= 1) { g.fillStyle = '#ffd23f'; g.font = '700 ' + Math.round(12 * k) + 'px ' + FONT_M; g.textAlign = 'left'; g.fillText('★' + lv, 6 * k, 15 * k); }
  }
});
/* hero cards in the Arsenal (and event rewards) use the bust too */
{
  const di0 = drawIcon;
  drawIcon = function (g, it, S) {
    if (!it || it.tab !== 'heroes') return di0(g, it, S);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S); g.fillStyle = '#070a18'; g.fillRect(0, 0, S, S);
    try { heroBust(g, skinLook(it.id), S, 1); } catch (e) { g.restore(); return di0(g, it, S); }
    g.restore();
  };
}
/* ---------------- the title menu as icon tiles ---------------- */
const TILE_ICONS = {
  bArcade: '<path d="M6 9h12a4 4 0 014 4v1a3 3 0 01-5 2l-2-2H9l-2 2a3 3 0 01-5-2v-1a4 4 0 014-4zM8 11v4M6 13h4M16 12h.01M18 14h.01"/>', bArsenal: '<path d="M5 19L19 5M15 5h4v4M8 13l3 3M4 20l3-3"/>', bWeekly: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  bDojo: '<path d="M3 6c6 1 12 1 18 0M5 10h14M7 6v14M17 6v14M12 10V6"/>', bPuzzle: '<path d="M9 4h6v3a2 2 0 104 0V4h1v16H4V4h5z"/>', bLive: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c1-3 3-4 5-4s4 1 5 4M11 19c1-3 3-4 5-4s4 1 5 4"/>',
  bProfile: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>', bClub: '<path d="M12 3l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/>', bSeason: '<path d="M6 4h12v4a6 6 0 01-12 0zM9 20h6M12 14v6"/>',
  bHideout: '<path d="M4 20V9l8-5 8 5v11zM9 20v-6h6v6"/>', bEditor: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>', bSettings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'
};
{
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () {
    ot0();
    try { const grid = $('bArcade') && $('bArcade').parentElement; if (grid && !grid.classList.contains('tiles')) { grid.classList.add('tiles');
      for (const id in TILE_ICONS) { const b = $(id); if (!b || b.querySelector('svg.ti')) continue; const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'ti'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = TILE_ICONS[id]; b.prepend(s); } } } catch (e) { errLog(e); }
  };
}
/* ---------------- story characters get busts too (dialogue and comic pages) ---------------- */
const CHAR_BUST = { R: ['ninja', '#00f2fe', '#ff0844'], M: ['idol', '#ff4fd8', '#00f2fe'], K: ['shinobi2', '#a66bff', '#2a1040'], S: ['shogun', '#ff0844', '#3a0a14'], J: ['raijin', '#9fd8ff', '#2a3a6a'],
  N: ['ninja', '#f2f2f2', '#3a3a4a'], P: ['sovereign', '#ffd700', '#3a3010'], B: ['ronin', '#ff9a3d', '#4a2a10'], V: ['seraph', '#00f2fe', '#2a3a5a'], C: ['dragon', '#c45bff', '#2a1040'],
  D: ['sovereign', '#ffd700', '#d8d8f0'], O: ['dragon', '#2ee6c8', '#0a3a3a'], T: ['seraph', '#fff3c4', '#6a5a2a'], Z: ['yurei', '#f4f4f4', '#202030'], H: ['oni', '#ff7a1a', '#3a1a08'] };
{
  const cp0 = charPortrait;
  charPortrait = function (g, id, t, mouth, col) {
    const m = CHAR_BUST[id]; if (!m) return cp0(g, id, t, mouth, col);
    g.save(); g.translate(-80, -94); try { heroBust(g, { body: m[0], a: m[1], b: m[2] }, 160, t); } catch (e) { g.restore(); return cp0(g, id, t, mouth, col); }
    if (mouth > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .25 * mouth; g.fillStyle = m[1]; g.beginPath(); g.ellipse(80, 96, 22, 8 + mouth * 4, 0, 0, TAU); g.fill(); } // speaking: the mask glows
    g.restore();
  };
}
