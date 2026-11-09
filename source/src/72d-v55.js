/* =====================================================================
   VERSION 55: PORTRAITS WITH FACES, NAMES THAT WINK, PETS THAT LIVE
   · the eight anime-style heroes get names that nod to where they come
     from (the legends and meanings behind the originals), and portraits
     of their own: a face with eyes, brows and a mouth, a hairstyle each,
     and an outfit each, instead of the shared hood
   · in 3D they show a face too (skin, eyes) instead of the ninja visor
   · every pet is reworked: dogs get a snout, paws, a collar with a tag,
     a wagging tail, ears that twitch, a head that looks around and they
     sit when you stop; the tiger gets stripes, the komainu a mane, the K9
     a visor and an antenna; birds get a crest, tail feathers and
     beating wings, the phoenix flames; fish get fins and whiskers; bugs
     shell plates; the saucer a tractor beam; the penguin flippers and
     feet; all of them breathe and blink
   Display only.
   ===================================================================== */
{
  const REN = { surge: ['WUKONG SURGE', 'Golden hair that stands on end, an orange gi and an aura that crackles. After the Monkey King of legend.'],
    cleaver: ['STRAWBERRY REAPER', 'Orange hair, a black robe with a white collar, half a mask and a blade as big as a door.'],
    wildhunter: ['FREE HUNTER', 'Spiky black hair with green tips, a green jacket and an aura that never runs dry.'],
    stormkid: ['GODSPEED KID', 'Fluffy white hair, cat eyes and lightning dancing on the skin.'],
    foxsage: ['NINE-TAILS SAGE', 'Spiky blond hair, a metal headband, whisker marks and a fox cloak of flame.'],
    veil: ['SKY-EYED SORCERER', 'White hair, a black blindfold over sky-blue eyes and an orb that bends space.'],
    breather: ['WATER BREATH SLAYER', 'Dark red hair, a wave-patterned coat, a calm breath and water that follows the blade.'],
    captain: ['STRAW-HAT CAPTAIN', 'A straw hat, an open red vest and a grin that never leaves.'] };
  for (const s of SKINS) if (REN[s.id]) { s.name = REN[s.id][0]; s.desc = REN[s.id][1]; }
  ANIME.reaper.hair = '#e8742a';
}
/* ---------- the portraits ---------- */
const FACE = { // eyes, brows, mouth, skin, outfit, hair shape for each anime-style hero
  saiyan: { skin: '#f6d2b0', iris: '#1fae9a', brow: 'fierce', mouth: 'smirk', top: '#ff7a1a', under: '#1f4fff', collar: 'v', hair: { c: '#ffd23f', n: 9, len: 62, up: 1, spread: 2.5, bang: 1, glow: '#fff3a0' } },
  reaper: { skin: '#f4cfac', iris: '#7a4a1a', brow: 'frown', mouth: 'flat', top: '#121216', under: '#f2f2f2', collar: 'kimono', hair: { c: '#e8742a', n: 11, len: 34, up: .3, spread: 3.2, bang: 3 } },
  hunter: { skin: '#f2c9a2', iris: '#5a3a1a', brow: 'soft', mouth: 'grin', top: '#1e9a4a', under: '#14161c', collar: 'jacket', hair: { c: '#14161c', tip: '#2fbf5a', n: 7, len: 66, up: 1.2, spread: 1.9 } },
  stormkid: { skin: '#f8dcc4', iris: '#3a8ad8', cat: 1, brow: 'soft', mouth: 'cat', top: '#4a4ad8', under: '#e8ecff', collar: 'round', hair: { c: '#eef2ff', n: 15, len: 30, up: .2, spread: 4, bang: 4, fluffy: 1 } },
  foxsage: { skin: '#f4caa0', iris: '#2f6aff', brow: 'fierce', mouth: 'grin', top: '#ff8a00', under: '#14141c', collar: 'high', whisker: 1, band: 1, hair: { c: '#ffd23f', n: 12, len: 40, up: .4, spread: 3.4, bang: 3 } },
  veil: { skin: '#f6dccc', iris: '#7ab8ff', blind: 1, brow: 'none', mouth: 'smirk', top: '#20243a', under: '#20243a', collar: 'tall', hair: { c: '#f4f6ff', n: 10, len: 46, up: .9, spread: 2.6 } },
  breather: { skin: '#f4cfac', iris: '#8a2a3a', brow: 'soft', mouth: 'flat', top: '#1e8a5a', under: '#14161c', collar: 'haori', hair: { c: '#5a1a22', tip: '#a8342a', n: 10, len: 32, up: .3, spread: 3.2, bang: 3 } },
  captain: { skin: '#e8b98c', iris: '#14141c', round: 1, brow: 'soft', mouth: 'grin', top: '#d81e2a', under: '#e8b98c', collar: 'vest', hat: 1, hair: { c: '#14161c', n: 9, len: 22, up: .1, spread: 3.4, bang: 3 } }
};
function animeBust(g, sk, S, t) {
  const F = FACE[sk.body], A = ANIME[sk.body]; t = t || 0;
  g.save(); g.scale(S / 200, S / 200); g.translate(100, 106 + Math.sin(t * 2) * 1.2); g.lineJoin = 'round'; g.lineCap = 'round';
  const shade = (c, k) => bustMix(c, k);
  let gr = g.createRadialGradient(0, -20, 10, 0, 0, 110); gr.addColorStop(0, shade(A.aura || sk.a, -.3)); gr.addColorStop(.6, shade(A.aura || sk.a, -.82)); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, -10, 104, 0, TAU); g.fill();
  if (A.aura) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 6.5) * .25, l = 82 + Math.abs(Math.sin(t * 6 + i * 1.7)) * 26; g.fillStyle = hexA(A.aura, .14); g.beginPath(); g.moveTo(Math.cos(a - .14) * 46, 10 + Math.sin(a - .14) * 46); g.lineTo(Math.cos(a) * l * 1.2, 10 + Math.sin(a) * l * 1.2); g.lineTo(Math.cos(a + .14) * 46, 10 + Math.sin(a + .14) * 46); g.closePath(); g.fill(); }
    if (A.bolts) { g.strokeStyle = hexA(A.aura, .9); g.lineWidth = 2.5; for (let q = 0; q < 3; q++) { let x = -70 + q * 60 + Math.sin(t * 9 + q) * 8, y = -70; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - .5) * 22; y += 24; g.lineTo(x, y); } g.stroke(); } } g.restore(); }
  // shoulders and the outfit
  g.fillStyle = F.top; g.beginPath(); g.moveTo(-94, 104); g.quadraticCurveTo(-90, 46, -40, 32); g.lineTo(40, 32); g.quadraticCurveTo(90, 46, 94, 104); g.closePath(); g.fill();
  g.fillStyle = shade(F.top, -.35); g.beginPath(); g.moveTo(-94, 104); g.quadraticCurveTo(-90, 60, -60, 44); g.lineTo(-50, 104); g.closePath(); g.fill(); g.beginPath(); g.moveTo(94, 104); g.quadraticCurveTo(90, 60, 60, 44); g.lineTo(50, 104); g.closePath(); g.fill();
  const neck = () => { g.fillStyle = shade(F.skin, -.18); g.fillRect(-12, 8, 24, 30); };
  if (F.collar === 'v') { neck(); g.fillStyle = F.under; g.beginPath(); g.moveTo(-26, 32); g.lineTo(0, 74); g.lineTo(26, 32); g.closePath(); g.fill(); g.fillStyle = F.skin; g.beginPath(); g.moveTo(-14, 32); g.lineTo(0, 52); g.lineTo(14, 32); g.closePath(); g.fill(); }
  else if (F.collar === 'kimono') { neck(); g.fillStyle = F.under; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 24, 30); g.lineTo(s * 4, 104); g.lineTo(s * 12, 104); g.lineTo(s * 32, 32); g.closePath(); g.fill(); } }
  else if (F.collar === 'jacket') { neck(); g.fillStyle = F.under; g.beginPath(); g.moveTo(-16, 32); g.lineTo(0, 104); g.lineTo(16, 32); g.closePath(); g.fill(); g.strokeStyle = shade(F.top, -.5); g.lineWidth = 3; g.beginPath(); g.moveTo(-30, 34); g.lineTo(-10, 60); g.moveTo(30, 34); g.lineTo(10, 60); g.stroke(); }
  else if (F.collar === 'round') { neck(); g.fillStyle = F.under; g.beginPath(); g.ellipse(0, 34, 22, 9, 0, 0, Math.PI); g.fill(); }
  else if (F.collar === 'high') { neck(); g.fillStyle = F.under; g.fillRect(-26, 22, 52, 18); g.fillStyle = '#f2f2f2'; g.fillRect(-2, 40, 4, 64); }
  else if (F.collar === 'tall') { g.fillStyle = shade(F.top, -.2); g.beginPath(); g.moveTo(-28, 40); g.lineTo(-24, 0); g.lineTo(24, 0); g.lineTo(28, 40); g.closePath(); g.fill(); g.fillStyle = '#c8a040'; g.beginPath(); g.arc(0, 30, 3.5, 0, TAU); g.fill(); }
  else if (F.collar === 'haori') { neck(); g.fillStyle = F.under; g.beginPath(); g.moveTo(-30, 32); g.lineTo(-14, 104); g.lineTo(14, 104); g.lineTo(30, 32); g.closePath(); g.fill(); g.strokeStyle = hexA('#bfe8ff', .55); g.lineWidth = 2; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(s * (60 + i * 6), 60 + i * 12, 10, Math.PI, 0); g.stroke(); } }
  else if (F.collar === 'vest') { neck(); g.fillStyle = F.skin; g.beginPath(); g.moveTo(-22, 32); g.lineTo(-12, 104); g.lineTo(12, 104); g.lineTo(22, 32); g.closePath(); g.fill(); g.fillStyle = '#ffd23f'; g.fillRect(-40, 94, 80, 10); }
  // the face: an anime jaw, ears, eyes, brows and mouth
  const hx = 0, hy = -26;
  g.fillStyle = F.skin; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * 33, hy + 2, 6, 10, 0, 0, TAU); g.fill(); }
  g.beginPath(); g.moveTo(hx - 34, hy - 18); g.quadraticCurveTo(hx - 36, hy + 18, hx - 18, hy + 34); g.quadraticCurveTo(hx, hy + 46, hx + 18, hy + 34); g.quadraticCurveTo(hx + 36, hy + 18, hx + 34, hy - 18); g.quadraticCurveTo(hx, hy - 44, hx - 34, hy - 18); g.closePath(); g.fill();
  g.fillStyle = hexA('#000000', .08); g.beginPath(); g.moveTo(hx + 10, hy + 40); g.quadraticCurveTo(hx + 30, hy + 20, hx + 33, hy - 10); g.lineTo(hx + 34, hy + 14); g.quadraticCurveTo(hx + 26, hy + 32, hx + 10, hy + 40); g.fill();
  const blink = (t % 4.2) > 4.05;
  if (!F.blind) for (const s of [-1, 1]) {
    const ex = hx + s * 14, ey = hy + 4; g.fillStyle = '#ffffff';
    if (blink) { g.strokeStyle = '#1a1010'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(ex - 9, ey); g.lineTo(ex + 9, ey); g.stroke(); continue; }
    g.beginPath(); if (F.round) g.ellipse(ex, ey, 8, 9, 0, 0, TAU); else { g.moveTo(ex - 10, ey + 1); g.quadraticCurveTo(ex, ey - 9, ex + 10, ey - 1 * s); g.quadraticCurveTo(ex, ey + 9, ex - 10, ey + 1); } g.fill();
    g.fillStyle = F.iris; g.beginPath(); g.ellipse(ex + s * 1, ey + 1, F.cat ? 3.5 : 5.2, 6.5, 0, 0, TAU); g.fill(); g.fillStyle = '#05050a'; g.beginPath(); g.ellipse(ex + s * 1, ey + 1, F.cat ? 1.4 : 2.6, F.cat ? 5 : 3.2, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex - 1.5, ey - 2, 1.8, 0, TAU); g.fill(); g.strokeStyle = '#1a1010'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(ex - 10 * s * -1, ey - 1); g.quadraticCurveTo(ex, ey - 9.5, ex + 10 * s, ey - 2); g.stroke();
    if (F.brow !== 'none') { g.strokeStyle = shade(F.hair.c === '#eef2ff' || F.hair.c === '#f4f6ff' ? '#9aa4c0' : F.hair.c, -.2); g.lineWidth = 3.5; g.beginPath(); const tilt = F.brow === 'fierce' ? 6 : F.brow === 'frown' ? 8 : 1; g.moveTo(ex - 9 * s * -1 * -1 + (s < 0 ? -9 : 9) * 0, ey - 13 - (s < 0 ? -tilt : -tilt) * 0); g.moveTo(ex - s * 9, ey - 14 - tilt * .2); g.lineTo(ex + s * 9, ey - 12 + tilt * (s > 0 ? -.4 : -.4) + tilt * .6); g.stroke(); }
  }
  if (F.blind) { g.fillStyle = '#0a0a10'; g.fillRect(hx - 37, hy - 6, 74, 16); g.fillStyle = hexA(F.iris, .4); g.fillRect(hx - 30, hy + 8, 60, 1.5); }
  if (F.whisker) { g.strokeStyle = '#6a3a1a'; g.lineWidth = 1.8; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx + s * 16, hy + 16 + i * 4); g.lineTo(hx + s * 28, hy + 14 + i * 5); g.stroke(); } }
  g.strokeStyle = '#7a3a2a'; g.lineWidth = 2.5; g.fillStyle = '#5a1a1a'; const my = hy + 28;
  if (F.mouth === 'grin') { g.beginPath(); g.moveTo(hx - 12, my - 2); g.quadraticCurveTo(hx, my + 10, hx + 12, my - 2); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(hx - 9, my - 2, 18, 3); }
  else if (F.mouth === 'smirk') { g.beginPath(); g.moveTo(hx - 7, my); g.quadraticCurveTo(hx + 2, my + 3, hx + 10, my - 3); g.stroke(); }
  else if (F.mouth === 'cat') { g.beginPath(); g.moveTo(hx - 8, my); g.quadraticCurveTo(hx - 4, my + 4, hx, my); g.quadraticCurveTo(hx + 4, my + 4, hx + 8, my); g.stroke(); }
  else { g.beginPath(); g.moveTo(hx - 7, my); g.lineTo(hx + 7, my); g.stroke(); }
  if (A.mask) { g.fillStyle = '#f4f4f4'; g.beginPath(); g.moveTo(hx + 2, hy - 34); g.quadraticCurveTo(hx + 40, hy - 26, hx + 34, hy + 10); g.quadraticCurveTo(hx + 22, hy + 40, hx + 2, hy + 44); g.closePath(); g.fill(); g.fillStyle = '#c81e2a'; for (let i = 0; i < 3; i++) g.fillRect(hx + 12 + i * 6, hy - 30 + i * 2, 2.5, 26); g.fillStyle = '#05050a'; g.beginPath(); g.ellipse(hx + 15, hy + 4, 8, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(hx + 15, hy + 4, 2.4, 0, TAU); g.fill(); }
  // hair: a skull cap, then spikes radiating from it, then bangs over the forehead
  const H = F.hair, cap = () => { g.fillStyle = H.c; g.beginPath(); g.ellipse(hx, hy - 20, 38, 26, 0, Math.PI * .95, Math.PI * 2.05); g.fill(); };
  if (F.hat) { cap(); g.fillStyle = '#e8c66a'; g.beginPath(); g.ellipse(hx, hy - 30, 80, 18, -.04, 0, TAU); g.fill(); g.strokeStyle = '#b8964a'; g.lineWidth = 1.5; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(hx, hy - 30, 80 - i * 9, 18 - i * 2, -.04, 0, TAU); g.stroke(); }
    g.fillStyle = '#e8c66a'; g.beginPath(); g.ellipse(hx, hy - 42, 40, 28, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c81e2a'; g.fillRect(hx - 40, hy - 46, 80, 10);
    g.fillStyle = H.c; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(hx - 30 + i * 13, hy - 26); g.lineTo(hx - 26 + i * 13, hy - 8); g.lineTo(hx - 20 + i * 13, hy - 26); g.fill(); } g.restore(); return; }
  const glowH = H.glow ? (g.shadowColor = H.glow, g.shadowBlur = 18, 1) : 0;
  for (let i = 0; i < H.n; i++) { const u = H.n > 1 ? i / (H.n - 1) : .5, a = -Math.PI / 2 + (u - .5) * H.spread, l = 34 + H.len * (.7 + (i % 3) * .18) * (1 + H.up * Math.cos((u - .5) * Math.PI) * .45) + Math.sin(t * 3 + i) * (A.aura ? 2 : 0);
    const w = H.fluffy ? .32 : .2, bx = hx + Math.cos(a) * 26, by = hy - 18 + Math.sin(a) * 22; g.fillStyle = H.tip && (i % 2) ? H.tip : H.c;
    g.beginPath(); g.moveTo(hx + Math.cos(a - w) * 26, hy - 18 + Math.sin(a - w) * 22); g.quadraticCurveTo(bx + Math.cos(a) * l * .5, by + Math.sin(a) * l * .5 - 4, hx + Math.cos(a) * l, hy - 18 + Math.sin(a) * l * .9); g.lineTo(hx + Math.cos(a + w) * 26, hy - 18 + Math.sin(a + w) * 22); g.closePath(); g.fill(); }
  cap(); if (glowH) g.shadowBlur = 0;
  for (let i = 0; i < (H.bang || 0); i++) { const x0 = hx - 18 + i * (36 / Math.max(1, H.bang - 1 || 1)); g.fillStyle = H.c; g.beginPath(); g.moveTo(x0 - 9, hy - 22); g.lineTo(x0 + 3, hy - 2 + (i % 2) * 4); g.lineTo(x0 + 10, hy - 22); g.closePath(); g.fill(); }
  if (F.band) { g.fillStyle = '#1c1c28'; g.fillRect(hx - 36, hy - 22, 72, 10); g.fillStyle = '#b8c2d8'; g.fillRect(hx - 15, hy - 24, 30, 14); g.strokeStyle = '#7a849a'; g.lineWidth = 1.5; g.strokeRect(hx - 15, hy - 24, 30, 14); }
  if (A.orb) { g.save(); g.globalCompositeOperation = 'lighter'; const ox = 62, oy = 40 + Math.sin(t * 2) * 4; g.fillStyle = hexA(A.orb, .35); g.beginPath(); g.arc(ox, oy, 22, 0, TAU); g.fill(); g.fillStyle = A.orb; g.beginPath(); g.arc(ox, oy, 10, 0, TAU); g.fill(); g.restore(); }
  g.restore();
}
{
  const hb1 = heroBust;
  heroBust = function (g, sk, S, t) { if (sk && FACE[sk.body]) { try { return animeBust(g, sk, S, t); } catch (e) { errLog(e); } } return hb1(g, sk, S, t); };
  // in 3D: a face (skin, eyes) instead of the visor
  const b1 = Skin3D.build.bind(Skin3D);
  Skin3D.build = function (g, body, ca, cb) {
    b1(g, body, ca, cb); const F = FACE[body]; if (!F) return;
    const Th = THREE, P0 = R3.part.bind(R3), H = g.head; H.children[0].material = this.tint(F.skin, F.skin, 0, 0, .7);
    for (let i = 1; i < 4 && i < H.children.length; i++) H.children[i].visible = false; // the visor, the face mask, the hood ridge
    if (!F.blind) for (const s of [-1, 1]) { const e1 = P0(new Th.SphereGeometry(.75, 10, 8), R3.M.white, 3.25, s * 1.35, .5, H); e1.scale.set(.5, 1, 1.2); e1.userData.eye = 1; P0(new Th.SphereGeometry(.45, 8, 6), this.tint(F.iris, F.iris, 0, .2, .3), 3.6, s * 1.35, .45, H).userData.eye = 1; }
    if (F.blind) P0(R3.zUp(new Th.TorusGeometry(3.8, .75, 6, 24)), R3.M.dark, .1, 0, .5, H);
  };
}
/* ---------- pets with life ---------- */
{
  const pm0 = R3.petModel.bind(R3);
  R3.petModel = function (id) {
    const g = pm0(id), Th = THREE, P0 = this.part.bind(this), k = g.kind, pc = (PET_BY_ID[id] && PET_BY_ID[id].col) || '#ffd23f', fx = g.fx54 = [], dark = this.M.dark;
    const fur = (() => { let m = null; g.traverse(o => { if (!m && o.isMesh && o.material && o.material.isMeshStandardMaterial && o.material !== this.M.dark) m = o.material; }); return m || this.M.armor; })();
    const glow = c => this.glow(c, 3);
    try {
      const groups = g.children.filter(c => c.isGroup);
      if (k === 'dog') {
        const head = groups.find(c => c.position.x > 4 && c.position.z > 8), tails = groups.filter(c => c.position.x < -4);
        if (head) { P0(new Th.SphereGeometry(1.2, 10, 8), fur, 2.7, 0, -.9, head).scale.set(1.2, 1, .8); P0(R3.zUp(new Th.TorusGeometry(2.5, .35, 6, 18)), id === 'k9' ? this.M.metal : this.glow('#ff2a4a', 1.5), -1.2, 0, -1.8, head).rotation.y = .3; P0(new Th.CylinderGeometry(.5, .5, .2, 10).rotateX(Math.PI / 2), this.M.gold, -.2, 0, -3.2, head);
          head.children.forEach(c => { if (c.geometry && c.geometry.type === 'ConeGeometry') fx.push([c, 'pulse', 2.7, Math.random() * 6]); });
          if (id === 'komainu') for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; P0(new Th.SphereGeometry(1.1, 8, 6), this.M.gold, -.6, Math.cos(a) * 2.4, Math.sin(a) * 2.4, head); }
          if (id === 'k9') { P0(new Th.BoxGeometry(.5, 2.6, .8), glow(pc), 1.9, 0, .6, head); P0(R3.zUp(new Th.CylinderGeometry(.1, .1, 2.4, 6)), this.M.metal, -.8, .8, 2.6, head); const tip = P0(new Th.SphereGeometry(.3, 6, 5), glow('#ff2a4a'), -.8, .8, 3.9, head); fx.push([tip, 'blink', 4]); }
          fx.push([head, 'look', 1]); g.headG = head; }
        for (const L of g.legs || []) P0(new Th.SphereGeometry(.75, 8, 6), fur, .3, 0, -5, L).scale.set(1.3, 1, .6);
        for (const tl of tails) fx.push([tl, 'wag', 9]);
        if (id === 'tiger') for (let i = 0; i < 5; i++) P0(new Th.BoxGeometry(.5, 5.2, .4), dark, -2.4 + i * 1.3, 0, 8.3, g).rotation.x = Math.PI / 2;
        g.sitter = true;
      } else if (k === 'bird') {
        P0(new Th.ConeGeometry(.5, 2.4, 5), id === 'phoenix' ? glow('#ffd23f') : fur, 2.4, 0, 3.4, g).rotation.y = -.5;
        for (let i = -2; i <= 2; i++) { const f = P0(new Th.BoxGeometry(3.6, .9, .2), id === 'phoenix' || id === 'drake' ? glow(pc) : fur, -5, i * .7, .1, g); f.rotation.z = i * .25; fx.push([f, 'sway', 2 + Math.abs(i) * .3, i]); }
        if (id === 'owl') for (const s of [-1, 1]) { P0(new Th.ConeGeometry(.4, 1.6, 4), fur, 2.6, s * 1.2, 3.2, g); P0(new Th.SphereGeometry(.8, 10, 8), this.M.gold, 3.9, s * .9, 1.8, g); }
        if (id === 'phoenix') for (let i = 0; i < 5; i++) { const fl = P0(new Th.ConeGeometry(.7, 3.5, 6).rotateZ(Math.PI / 2), glow(i % 2 ? '#ffd23f' : '#ff6a00'), -5.5 - i * .6, (i - 2) * .8, -.6, g); fx.push([fl, 'flame']); }
      } else if (k === 'fish') {
        for (const s of [-1, 1]) { const pf = P0(new Th.BoxGeometry(1.8, 1.6, .15), fur, .6, s * 1.9, -.4, g); pf.rotation.x = s * .5; fx.push([pf, 'flap', 5, s]); }
        if (id === 'koi') { for (const s of [-1, 1]) { const wh = P0(new Th.BoxGeometry(2.6, .1, .1), this.M.gold, 5.4, s * .6, -.2, g); wh.rotation.z = s * .4; fx.push([wh, 'sway', 3, s]); } for (let i = 0; i < 4; i++) P0(new Th.SphereGeometry(.8, 8, 6), this.std({ color: 0xff5a2a, roughness: .5 }), -1.5 + i * 1.2, (i % 2 - .5) * 1.4, 1.6, g).scale.set(1, 1, .3); }
        if (id === 'shark') for (let i = 0; i < 3; i++) P0(new Th.BoxGeometry(.1, .8, .1), dark, 2 - i * .4, 1.8, .2, g);
      } else if (k === 'bug') {
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; P0(new Th.CylinderGeometry(.9, .9, .2, 6).rotateX(Math.PI / 2), id === 'scarab' ? glow(pc) : this.M.armor2, Math.cos(a) * 1.6, Math.sin(a) * 1.6, 3.5, g); }
        for (const s of [-1, 1]) { const an = P0(new Th.BoxGeometry(2.4, .12, .12), dark, 5, s * .6, 2.8, g); an.rotation.z = s * .5; an.rotation.y = -.4; fx.push([an, 'sway', 4, s]); }
      } else if (k === 'saucer') {
        const beam = P0(R3.zUp(new Th.ConeGeometry(3.4, 8, 18, 1, true)), new Th.MeshBasicMaterial({ color: new Th.Color(pc), transparent: true, opacity: .14, blending: Th.AdditiveBlending, depthWrite: false, side: Th.DoubleSide }), 0, 0, -4, g); beam.castShadow = false; fx.push([beam, 'pulse', 3]);
      } else if (k === 'penguin') {
        for (const s of [-1, 1]) { const fl = new Th.Group(); fl.position.set(0, s * 2.4, 6); g.add(fl); P0(new Th.BoxGeometry(1.2, .4, 3.4), dark, 0, 0, -1.6, fl); fx.push([fl, 'flap', 6, s]); P0(new Th.BoxGeometry(1.8, 1, .5), this.M.gold, 1, s * 1, .3, g); }
      }
      // everyone breathes; eyes blink
      const body = g.children.find(c => c.isMesh); if (body && k !== 'swarm' && k !== 'saucer') fx.push([body, 'breathe', 2.4]);
      g.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.geometry && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius < .5) fx.push([o, 'eyeblink', 0, Math.random() * 4]); });
    } catch (e) { errLog(e); }
    return g;
  };
  // pet motion: a head that looks around, a wagging tail, sitting when still, breathing, blinking
  const ft0 = FX54.tick.bind(FX54);
  FX54.tick = function (t) {
    ft0(t);
    for (const r of R3.ents.values()) { const L = r.g && r.g.fx54; if (!L) continue;
      for (const [o, k, a, b] of L) {
        if (k === 'wag') { const fast = r.g.moving ? 1.6 : 1; o.rotation.z = Math.sin(t * a * fast) * .5; }
        else if (k === 'look') o.rotation.z = Math.sin(t * .7) * .45 + Math.sin(t * 1.9) * .1;
        else if (k === 'breathe') { const s = 1 + Math.sin(t * a) * .035; o.scale.y = o.scale.y / (o.userData.bs || 1) * s; o.userData.bs = s; }
        else if (k === 'eyeblink') { const s = ((t + b) % 3.6) > 3.45 ? .15 : 1; o.scale.z = s; }
      }
      if (r.g.sitter) { const sit = r.g.moving ? 0 : Math.min(1, (r.g.sitK || 0) + .03); r.g.sitK = r.g.moving ? 0 : sit; r.g.rotation.y = -sit * .35; }
    }
  };
  const ap0 = R3.animPet.bind(R3); R3.animPet = function (g, t, moving) { g.moving = !!moving; return ap0(g, t, moving); };
}
