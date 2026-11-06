/* =====================================================================
   DIALOGUE — typewriter story panel with procedurally drawn,
   animated character portraits (no image assets)
   ===================================================================== */
const Dlg = {
  lines: null, i: 0, shown: 0, t: 0, done: null, inRun: false, active: false, cps: 48, c: null, text: '', pt: 0, pc: null, ptx: null, prev: 'MENU',
  start(lines, cb, inRun) {
    if (!lines || !lines.length) { if (cb) cb(); return; }
    this.lines = lines; this.i = 0; this.done = cb; this.inRun = !!inRun; this.active = true;
    this.prev = G.state; G.state = 'DIALOG'; In.cancel();
    UI.show(null); UI.syncHud();
    $('dlg').classList.remove('hidden'); $('dlgTap').classList.remove('hidden');
    this.load();
  },
  load() {
    const ln = this.lines[this.i]; this.c = CHARS[ln[0]]; this.cid = ln[0]; this.text = lineText(ln); this.shown = 0; this.t = 0;
    const w = $('dlgWho'); w.textContent = lt(this.c.name); w.style.color = this.c.col; $('dlgRole').textContent = lt(this.c.role);
    $('dlgTxt').textContent = ''; $('dlgHint').textContent = (this.i + 1) + '/' + this.lines.length + ' · ' + lt('TAP TO CONTINUE');
    $('dlg').querySelector('.box').style.borderColor = this.c.col;
    if (this.cid === 'S' || this.cid === 'N' || this.cid === 'P' || this.cid === 'C' || this.cid === 'D') glitch(.15);
  },
  tick(rd) {
    if (!this.active) return;
    if (this.shown < this.text.length) {
      this.t += rd * this.cps; const n = Math.min(this.text.length, this.t | 0);
      if (n !== this.shown) { this.shown = n; $('dlgTxt').textContent = this.text.slice(0, n); if (n % 2 === 0 && this.text[n - 1] !== ' ' && !(typeof Voices !== 'undefined' && Voices.busy())) Aud.sfx('blip', this.c.pitch); }
    }
    this.pt += rd; this.drawPortrait();
  },
  next() {
    if (!this.active) return;
    if (this.shown < this.text.length) { this.shown = this.text.length; this.t = this.shown; $('dlgTxt').textContent = this.text; return; }
    this.i++; if (this.i >= this.lines.length) this.end(); else { Aud.sfx('ui'); this.load(); }
  },
  end() {
    if (!this.active) return;
    this.active = false; $('dlg').classList.add('hidden'); $('dlgTap').classList.add('hidden');
    G.state = this.prev === 'DIALOG' ? 'MENU' : this.prev;
    const cb = this.done; this.done = null; if (cb) cb();
  },
  drawPortrait() {
    if (!this.ptx) { this.pc = $('dlgPort'); this.ptx = this.pc.getContext('2d'); }
    const g = this.ptx, W = 168, t = this.pt, talking = this.shown < this.text.length, mouth = talking ? Math.abs(Math.sin(t * 18)) : 0, col = this.c.col;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05060f'; g.fillRect(0, 0, W, W);
    const bg = g.createLinearGradient(0, 0, 0, W); bg.addColorStop(0, '#0d1433'); bg.addColorStop(1, '#05060f'); g.fillStyle = bg; g.fillRect(0, 0, W, W);
    g.globalAlpha = .12; g.fillStyle = col; for (let y = (t * 30) % 6; y < W; y += 6) g.fillRect(0, y, W, 2); g.globalAlpha = 1;
    g.save(); g.translate(84, 96 + Math.sin(t * 2) * 2); charPortrait(g, this.cid, t, mouth, col);
    g.restore();
    g.strokeStyle = col; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, W - 4);
  }
};
function charPortrait(g, id, t, mouth, col) { // a story character drawn around (0,0); also used by the comic pages
    if (id === 'R') {
    g.fillStyle = '#141c36'; g.fillRect(-60, 40, 120, 40); g.fillStyle = '#ff0844'; g.beginPath(); g.moveTo(-44, 30); g.lineTo(44, 30); g.lineTo(36, 48); g.lineTo(-36, 48); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(30, 40); g.quadraticCurveTo(70 + Math.sin(t * 4) * 6, 50, 76, 76); g.lineTo(62, 76); g.quadraticCurveTo(56, 56, 24, 46); g.fill();
    g.fillStyle = '#0c1228'; g.beginPath(); g.arc(0, -8, 40, 0, TAU); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke();
    g.fillStyle = col; g.globalAlpha = .9 + Math.sin(t * 6) * .1; g.fillRect(-32, -16, 64, 10); g.globalAlpha = 1;
    g.fillStyle = '#ffffff'; g.fillRect(-20 + Math.sin(t * 1.3) * 6, -14, 10, 6);
    g.fillStyle = '#1e2a52'; for (let k = 0; k < 4; k++) g.fillRect(-18 + k * 10, 8 + mouth * 3, 7, 12);
    g.strokeStyle = '#2a3a6e'; g.lineWidth = 2; g.beginPath(); g.moveTo(-26, 4); g.lineTo(26, 4); g.stroke();
  } else if (id === 'M') {
    g.fillStyle = '#2a1033'; g.fillRect(-58, 42, 116, 40);
    g.fillStyle = '#ff4fd8'; g.beginPath(); g.arc(0, -14, 46, Math.PI, 0); g.lineTo(46, 26); g.lineTo(30, 26); g.lineTo(30, -6); g.lineTo(-30, -6); g.lineTo(-30, 26); g.lineTo(-46, 26); g.closePath(); g.fill();
    g.fillStyle = '#f0d9e6'; g.beginPath(); g.ellipse(0, 4, 30, 34, 0, 0, TAU); g.fill();
    g.fillStyle = '#ff4fd8'; g.beginPath(); g.moveTo(-32, -20); g.quadraticCurveTo(0, -4, 32, -22); g.lineTo(32, -34); g.lineTo(-32, -34); g.closePath(); g.fill();
    const blink = (t % 3.2) < .12 ? 1 : 5;
    g.fillStyle = '#00c2d4'; g.fillRect(-18, -2, 10, blink); g.fillRect(8, -2, 10, blink);
    g.fillStyle = '#b0306e'; g.fillRect(-7, 18, 14, 2 + mouth * 6);
    g.fillStyle = '#00f2fe'; g.beginPath(); g.arc(-40, 4, 11, 0, TAU); g.fill(); g.beginPath(); g.arc(40, 4, 11, 0, TAU); g.fill();
    g.strokeStyle = '#00f2fe'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 44, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(-40, 14); g.quadraticCurveTo(-34, 30, -12, 30); g.stroke();
  } else if (id === 'K') {
    g.fillStyle = '#1b0f2e'; g.fillRect(-58, 40, 116, 40);
    g.strokeStyle = '#8a8aa0'; g.lineWidth = 5; g.beginPath(); g.moveTo(40, -60); g.lineTo(18, 30); g.stroke();
    g.fillStyle = '#2a1745'; g.beginPath(); g.moveTo(0, -62); g.lineTo(48, -6); g.lineTo(42, 44); g.lineTo(-42, 44); g.lineTo(-48, -6); g.closePath(); g.fill();
    g.fillStyle = '#120a20'; g.beginPath(); g.ellipse(0, 2, 28, 32, 0, 0, TAU); g.fill();
    g.fillStyle = '#0a0612'; g.fillRect(-28, 6, 56, 30);
    const glowA = .7 + Math.sin(t * 5) * .3; g.globalAlpha = glowA; g.fillStyle = '#ff2bd6'; g.fillRect(-20, -6, 14, 4); g.fillRect(6, -6, 14, 4); g.globalAlpha = 1;
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(-28, 6 + mouth * 2); g.lineTo(28, 6 + mouth * 2); g.stroke();
  } else if (id === 'J') { // Raijin: horned storm mask inside a ring of thunder drums
    g.strokeStyle = 'rgba(159,216,255,.45)'; g.lineWidth = 3; g.beginPath(); g.arc(0, -6, 62, Math.PI * .95, Math.PI * 2.05); g.stroke();
    for (let k = 0; k < 7; k++) { const a = Math.PI + k * Math.PI / 6, x = Math.cos(a) * 62, y = -6 + Math.sin(a) * 62; g.fillStyle = '#1d3350'; g.beginPath(); g.arc(x, y, 10, 0, TAU); g.fill(); g.strokeStyle = col; g.lineWidth = 2; g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); }
    g.fillStyle = '#0d1a2e'; g.fillRect(-56, 42, 112, 40);
    g.fillStyle = '#e8f6ff';
    g.beginPath(); g.moveTo(-26, -30); g.quadraticCurveTo(-46, -54, -38, -74); g.quadraticCurveTo(-30, -52, -14, -38); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(26, -30); g.quadraticCurveTo(46, -54, 38, -74); g.quadraticCurveTo(30, -52, 14, -38); g.closePath(); g.fill();
    g.fillStyle = '#16324f'; g.beginPath(); g.moveTo(0, -46); g.lineTo(36, -22); g.lineTo(32, 22); g.lineTo(0, 44); g.lineTo(-32, 22); g.lineTo(-36, -22); g.closePath(); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#ffffff'; g.globalAlpha = Math.sin(t * 9) > .6 ? 1 : .65;
    g.beginPath(); g.moveTo(-26, -10); g.lineTo(-8, -4); g.lineTo(-24, 0); g.closePath(); g.fill(); g.beginPath(); g.moveTo(26, -10); g.lineTo(8, -4); g.lineTo(24, 0); g.closePath(); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#0a1422'; g.fillRect(-18, 14, 36, 8 + mouth * 8); g.fillStyle = '#e8f6ff'; for (let k = 0; k < 5; k++) g.fillRect(-16 + k * 7, 14, 4, 4);
    g.strokeStyle = '#ffe66b'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, -40); g.lineTo(-5, -26); g.lineTo(4, -24); g.lineTo(-3, -12); g.stroke();
    if ((t % 2.6) < .08) { g.globalAlpha = .35; g.fillStyle = '#e8f6ff'; g.fillRect(-84, -96, 168, 168); g.globalAlpha = 1; }
  } else if (id === 'P') { // KUROGANE PRIME: a gold war-frame mask with a crown and one red eye
    g.fillStyle = '#1a1408'; g.fillRect(-60, 40, 120, 40); g.fillStyle = '#ffd700'; g.fillRect(-60, 40, 120, 4);
    g.fillStyle = '#ffd700'; for (let k = 0; k < 5; k++) { const x = -32 + k * 16, h2 = k === 2 ? 34 : 22; g.beginPath(); g.moveTo(x - 6, -36); g.lineTo(x, -36 - h2); g.lineTo(x + 6, -36); g.closePath(); g.fill(); }
    g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(Math.cos(a) * 46, -6 + Math.sin(a) * 46); } g.closePath(); g.fillStyle = '#0e0b06'; g.fill(); g.strokeStyle = '#ffd700'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#2a0006'; g.beginPath(); g.arc(0, -6, 18, 0, TAU); g.fill();
    g.fillStyle = '#ff0844'; g.globalAlpha = .8 + Math.sin(t * 5) * .2; g.beginPath(); g.arc(Math.sin(t * .8) * 4, -6, 9, 0, TAU); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#ffd700'; g.fillRect(-20, 22 + mouth * 3, 40, 4); g.strokeStyle = 'rgba(255,215,0,.4)'; g.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 8, 20); g.lineTo(k * 8, 32); g.stroke(); }
  } else if (id === 'V') { // VALKYRIE.SYS: a winged helm with a slit visor
    g.fillStyle = '#0c1a2e'; g.fillRect(-60, 40, 120, 40); g.fillStyle = '#00f2fe'; g.fillRect(-60, 40, 120, 3);
    g.fillStyle = '#cfe8ff'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 30, -20); g.lineTo(s * 70, -60); g.lineTo(s * 58, -18); g.lineTo(s * 76, -34); g.lineTo(s * 40, 4); g.closePath(); g.fill(); }
    g.fillStyle = '#16263c'; g.beginPath(); g.moveTo(0, -50); g.lineTo(34, -18); g.lineTo(26, 30); g.lineTo(0, 42); g.lineTo(-26, 30); g.lineTo(-34, -18); g.closePath(); g.fill(); g.strokeStyle = '#00f2fe'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#ff0844'; g.globalAlpha = .8 + Math.sin(t * 6) * .2; g.fillRect(-20, -6, 40, 6); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(232,251,255,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -62, 26, 7, 0, 0, TAU); g.stroke();
    g.fillStyle = '#0a1422'; g.fillRect(-12, 16, 24, 3 + mouth * 6);
  } else if (id === 'C') { // CHIMERA.OS: three fused faces — turret eye, shadow mask, gold crown
    g.fillStyle = '#160822'; g.fillRect(-60, 40, 120, 40);
    const jt = Math.sin(t * 23) > .8 ? Math.sin(t * 77) * 5 : 0; g.save(); g.translate(jt, 0);
    g.fillStyle = '#160822'; g.beginPath(); g.ellipse(0, 0, 50, 44, 0, 0, TAU); g.fill(); g.strokeStyle = '#c45bff'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#2a1206'; g.beginPath(); g.arc(-24, 4, 14, 0, TAU); g.fill(); g.strokeStyle = '#ff6a00'; g.lineWidth = 2.5; g.stroke(); g.fillStyle = '#ff6a00'; g.beginPath(); g.arc(-24, 4, 5, 0, TAU); g.fill();
    g.fillStyle = '#0a0610'; g.beginPath(); g.ellipse(0, -14, 13, 15, 0, 0, TAU); g.fill(); g.strokeStyle = '#a66bff'; g.stroke(); g.fillStyle = '#ff0844'; g.fillRect(-9, -16, 18, 4);
    g.fillStyle = '#ffd700'; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(24 + k * 7 - 3, -6); g.lineTo(24 + k * 7, -18 - (k ? 0 : 5)); g.lineTo(24 + k * 7 + 3, -6); g.closePath(); g.fill(); } g.fillStyle = '#00f2fe'; g.fillRect(18, 4, 12, 3);
    g.fillStyle = '#0a0410'; g.fillRect(-14, 22, 28, 4 + mouth * 7); g.restore();
  } else if (id === 'D') { // DEUS EX KUROGANE: a radiant golden mask inside turning rings
    g.fillStyle = '#120e04'; g.fillRect(-60, 40, 120, 40); g.fillStyle = '#ffd700'; g.fillRect(-60, 40, 120, 3);
    g.strokeStyle = 'rgba(255,215,0,.5)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(0, -4, 44 + k * 9, t * (k % 2 ? -1 : 1), t * (k % 2 ? -1 : 1) + 4.4); g.stroke(); }
    g.fillStyle = '#fff3c4'; g.beginPath(); g.moveTo(0, -46); g.quadraticCurveTo(38, -40, 32, 0); g.quadraticCurveTo(26, 34, 0, 40); g.quadraticCurveTo(-26, 34, -32, 0); g.quadraticCurveTo(-38, -40, 0, -46); g.fill(); g.strokeStyle = '#ffd700'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#120e04'; g.beginPath(); g.ellipse(-13, -6, 8, 4, -.2, 0, TAU); g.fill(); g.beginPath(); g.ellipse(13, -6, 8, 4, .2, 0, TAU); g.fill();
    g.fillStyle = '#ffd700'; g.globalAlpha = .7 + Math.sin(t * 4) * .3; dot2(g, -13, -6, 2.6); dot2(g, 13, -6, 2.6); g.globalAlpha = 1;
    g.fillStyle = '#120e04'; g.fillRect(-10, 18, 20, 2 + mouth * 5);
  } else if (id === 'B') { // BENKEI.SYS: a monk's head cloth over a dark mech face, burning eyes
    g.fillStyle = '#7a2a10'; g.fillRect(-60, 40, 120, 40); g.strokeStyle = '#d9b46a'; g.lineWidth = 2; for (let k = -3; k <= 3; k++) { g.beginPath(); g.arc(k * 14, 44, 5, 0, TAU); g.stroke(); }
    g.fillStyle = '#2a1a14'; g.beginPath(); g.ellipse(0, 0, 36, 40, 0, 0, TAU); g.fill(); g.strokeStyle = '#ff9a3d'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#f0e6c8'; g.beginPath(); g.moveTo(-44, 6); g.quadraticCurveTo(0, -78, 44, 6); g.lineTo(34, 14); g.quadraticCurveTo(0, -46, -34, 14); g.closePath(); g.fill();
    g.fillStyle = '#ff3b1f'; g.globalAlpha = .75 + Math.sin(t * 6) * .25; g.fillRect(-22, 2, 14, 6); g.fillRect(8, 2, 14, 6); g.globalAlpha = 1;
    g.fillStyle = '#120a08'; g.fillRect(-16, 20, 32, 8 + mouth * 6);
  } else if (id === 'N') { // REN.NULL: Ren's helmet, inverted, with a red split visor
    const gl = Math.sin(t * 17) > .85 ? (Math.sin(t * 91) * 6) : 0;
    g.save(); g.translate(gl, 0);
    g.fillStyle = '#d8d8dc'; g.fillRect(-60, 40, 120, 40); g.fillStyle = '#05060f'; g.beginPath(); g.moveTo(-44, 30); g.lineTo(44, 30); g.lineTo(36, 48); g.lineTo(-36, 48); g.closePath(); g.fill();
    for (const [ox, c] of [[-4, 'rgba(255,8,68,.55)'], [4, 'rgba(0,242,254,.45)']]) { g.fillStyle = c; g.beginPath(); g.arc(ox, -8, 40, 0, TAU); g.fill(); }
    g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(0, -8, 40, 0, TAU); g.fill(); g.strokeStyle = '#05060f'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#05060f'; g.fillRect(-32, -16, 64, 10);
    g.fillStyle = '#ff0844'; g.globalAlpha = .8 + Math.sin(t * 9) * .2; g.fillRect(-26, -14, 18, 6); g.fillRect(8, -14, 18, 6); g.globalAlpha = 1;
    g.fillStyle = '#b8b8c0'; for (let k = 0; k < 4; k++) g.fillRect(-18 + k * 10, 8 + mouth * 3, 7, 12);
    g.fillStyle = '#ff0844'; for (let k = 0; k < 3; k++) { const y = -50 + ((t * 70 + k * 37) % 110); g.globalAlpha = .5; g.fillRect(-50 + Math.sin(t * 13 + k) * 20, y, 30 + k * 12, 2); } g.globalAlpha = 1;
    g.restore();
  } else if (id === 'H') { // HYAKKI: a demon face on a lantern ox-cart
    g.fillStyle = '#1a0a04'; g.fillRect(-60, 40, 120, 40);
    for (const sd of [-1, 1]) { g.save(); g.translate(sd * 58, 30); g.rotate(t * sd); g.strokeStyle = '#5a3a1a'; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.stroke(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); g.stroke(); } g.restore(); }
    g.fillStyle = '#8a1010'; g.beginPath(); g.ellipse(0, -6, 44, 40, 0, 0, TAU); g.fill(); g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#f0e6c8'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 18, -40); g.quadraticCurveTo(sd * 40, -74, sd * 52, -64); g.quadraticCurveTo(sd * 36, -54, sd * 30, -36); g.fill(); }
    for (const sd of [-1, 1]) { g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(sd * 16, -14, 9, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#1a0000'; g.beginPath(); g.arc(sd * 16, -14, 3, 0, TAU); g.fill(); }
    g.fillStyle = '#1a0000'; g.beginPath(); g.ellipse(0, 14, 22, 6 + mouth * 9, 0, 0, TAU); g.fill(); g.fillStyle = '#f0e6c8'; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 8 - 3, 8); g.lineTo(k * 8, 16); g.lineTo(k * 8 + 3, 8); g.fill(); }
  } else if (id === 'T') { // TENKAI.SYS: a white-gold eye inside a ring of sun rays and mirror panels
    g.fillStyle = '#1a1608'; g.fillRect(-60, 40, 120, 40);
    for (let k = 0; k < 16; k++) { const a = k * TAU / 16 + t * .2; g.fillStyle = k % 2 ? '#ffd700' : '#fff3c4'; g.beginPath(); g.moveTo(Math.cos(a - .1) * 40, -8 + Math.sin(a - .1) * 40); g.lineTo(Math.cos(a) * 60, -8 + Math.sin(a) * 60); g.lineTo(Math.cos(a + .1) * 40, -8 + Math.sin(a + .1) * 40); g.closePath(); g.fill(); }
    for (let k = 0; k < 4; k++) { const a = t * .6 + k * TAU / 4; g.fillStyle = '#1a2a40'; g.strokeStyle = '#fff3c4'; g.lineWidth = 2; g.save(); g.translate(Math.cos(a) * 66, -8 + Math.sin(a) * 50); g.rotate(a + 1.57); g.fillRect(-12, -7, 24, 14); g.strokeRect(-12, -7, 24, 14); g.restore(); }
    g.fillStyle = '#f4ecd0'; g.beginPath(); g.arc(0, -8, 38, 0, TAU); g.fill(); g.strokeStyle = '#ffd700'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#2a6aff'; g.beginPath(); g.arc(Math.sin(t) * 6, -8, 18 + mouth * 2, 0, TAU); g.fill(); g.fillStyle = '#05060f'; g.beginPath(); g.arc(Math.sin(t) * 6, -8, 8, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(Math.sin(t) * 6 - 5, -14, 4, 0, TAU); g.fill();
  } else if (id === 'Z') { // IZANAMI: a white mask with red brows, half white, half black hair, a halo of old script
    g.strokeStyle = 'rgba(255,215,0,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(0, -10, 62, 0, TAU); g.stroke();
    g.fillStyle = '#ffd700'; g.font = '700 14px ' + FONT_M; g.textAlign = 'center'; const GL = '天地生死陰陽始終'; for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + t * .2; g.fillText(GL[k], Math.cos(a) * 62, -6 + Math.sin(a) * 62); }
    g.fillStyle = '#f0ece4'; g.fillRect(-60, 40, 60, 40); g.fillStyle = '#0c0a12'; g.fillRect(0, 40, 60, 40); g.strokeStyle = '#c0102e'; g.lineWidth = 4; g.beginPath(); g.moveTo(-20, 40); g.lineTo(0, 66); g.lineTo(20, 40); g.stroke();
    g.fillStyle = '#0a0a10'; g.beginPath(); g.arc(0, -12, 46, Math.PI, 0); g.lineTo(46, 44); g.lineTo(-46, 44); g.closePath(); g.fill(); // hair
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(0, -6, 30, 38, 0, 0, TAU); g.fill();
    g.strokeStyle = '#c0102e'; g.lineWidth = 3; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 6, -20); g.quadraticCurveTo(sd * 16, -26, sd * 24, -18); g.stroke(); }
    g.fillStyle = '#05060f'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 12, -10, 5, 2.6 + Math.max(0, Math.sin(t * 2)) * .8, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#c0102e'; g.beginPath(); g.ellipse(0, 14 + mouth * 2, 5, 2 + mouth * 3, 0, 0, TAU); g.fill();
  } else {
    const gl = Math.sin(t * 13) > .92 ? (Math.random() - .5) * 10 : 0;
    g.translate(gl, 0);
    g.fillStyle = '#2a0006'; g.beginPath(); g.arc(0, 0, 42, Math.PI, 0); g.lineTo(52, 30); g.lineTo(-52, 30); g.closePath(); g.fill(); g.strokeStyle = '#ff0844'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#ffd700'; g.lineWidth = 6; g.beginPath(); g.moveTo(-10, -40); g.quadraticCurveTo(-44, -56, -40, -80); g.moveTo(10, -40); g.quadraticCurveTo(44, -56, 40, -80); g.stroke();
    g.fillStyle = '#14020a'; g.fillRect(-36, -6, 72, 40);
    const r = 12 + mouth * 3; g.fillStyle = '#ff0844'; g.beginPath(); g.arc(0, 12, r, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(Math.sin(t) * 4, 12, 4, 0, TAU); g.fill();
    g.globalAlpha = .4; g.fillStyle = '#ff0844'; g.fillRect(-60, -20 + ((t * 60) % 80), 120, 3); g.globalAlpha = 1;
  }
}

function dot2(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
