/* ---------------- PHOTO MODE 2 — more filters, frames, stickers and captions ----------------
   Five more filters (SUNSET, CYBER duotone, MANGA screen-tone, BLOOM, THERMAL),
   six frames, ten vector stickers you tap onto the photo, drag, resize, turn
   and delete, and a caption in four styles. Everything is drawn into the
   picture itself, so the preview is still exactly the PNG that gets saved. */
PH_FILTERS.push({ id: 'sunset', n: 'SUNSET' }, { id: 'duo', n: 'CYBER' }, { id: 'manga', n: 'MANGA' }, { id: 'bloom', n: 'BLOOM' }, { id: 'thermal', n: 'THERMAL' });
const PH_FRAMES = [{ id: 'none', n: 'NONE' }, { id: 'neon', n: 'NEON' }, { id: 'cine', n: 'CINEMA' }, { id: 'cam', n: 'CAMERA' }, { id: 'pola', n: 'INSTANT' }, { id: 'manga', n: 'MANGA PANEL' }, { id: 'wanted', n: 'WANTED' }];
const PH_STICKERS = ['slash', 'ko', 'boom', 'gg', 'zap', 'star', 'heart', 'seal', 'crown', 'spark'];
const PH_TEXT = [{ id: 'neon', n: 'NEON' }, { id: 'manga', n: 'MANGA' }, { id: 'sub', n: 'SUBTITLE' }, { id: 'gold', n: 'GOLD' }];
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function phLerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function phRamp(stops, t) { t = clamp(t, 0, 1) * (stops.length - 1); const i = Math.min(stops.length - 2, Math.floor(t)); return phLerp3(stops[i], stops[i + 1], t - i); }
{
  const f0 = phFilter;
  phFilter = function (g, W, H, f) {
    if (f === 'bloom') { // a blurred, brightened copy added on top: neon light spills
      const t = document.createElement('canvas'); t.width = W; t.height = H; t.getContext('2d').drawImage(g.canvas, 0, 0);
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .7; g.filter = 'blur(' + Math.max(4, Math.round(W / 70)) + 'px) brightness(.85) saturate(1.4)'; g.drawImage(t, 0, 0); g.filter = 'none'; g.globalAlpha = .35; g.filter = 'blur(' + Math.max(10, Math.round(W / 28)) + 'px)'; g.drawImage(t, 0, 0); g.restore(); return;
    }
    if (f !== 'sunset' && f !== 'duo' && f !== 'manga' && f !== 'thermal') return f0(g, W, H, f);
    let img; try { img = g.getImageData(0, 0, W, H); } catch (e) { return; }
    const d = img.data;
    if (f === 'sunset') {
      const top = [255, 70, 160], bot = [255, 170, 40];
      for (let y = 0; y < H; y++) { const c = phLerp3(top, bot, y / H); for (let x = 0, i = y * W * 4; x < W; x++, i += 4) {
        const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255; // soft-light blend with the sky gradient, then a warm grade
        const sl = (a, s) => s < .5 ? a - (1 - 2 * s) * a * (1 - a) : a + (2 * s - 1) * (Math.sqrt(a) - a);
        d[i] = sl(r, c[0] / 255) * 270; d[i + 1] = sl(gg, c[1] / 255) * 238; d[i + 2] = sl(b, c[2] / 255) * 215;
      } }
    } else if (f === 'duo') {
      const st = [[16, 0, 40], [255, 8, 68], [0, 242, 254], [235, 255, 255]];
      for (let i = 0; i < d.length; i += 4) { const l = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255, c = phRamp(st, Math.pow(l, .8) * 1.1); d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
    } else if (f === 'thermal') {
      const st = [[0, 0, 20], [70, 0, 140], [220, 0, 90], [255, 120, 0], [255, 240, 60], [255, 255, 255]];
      for (let i = 0; i < d.length; i += 4) { const l = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255, c = phRamp(st, Math.pow(l, .7) * 1.15); d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
    } else if (f === 'manga') { // ink and screen-tone: black lines, a dithered middle, white paper
      const s = Math.max(1, Math.round(W / 390));
      for (let y = 0; y < H; y++) for (let x = 0, i = y * W * 4; x < W; x++, i += 4) {
        const l = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255, v = Math.pow(l, .6), th = (BAYER4[(((y / s) | 0) & 3) * 4 + (((x / s) | 0) & 3)] + .5) / 16;
        const o = v < .16 ? 18 : v > .82 ? 246 : (v - .16) / .66 > th ? 238 : 28; d[i] = o; d[i + 1] = o; d[i + 2] = o * .97;
      }
    }
    g.putImageData(img, 0, 0);
  };
}
/* ---------------- stickers: vector art drawn at any size ---------------- */
function phBurst(g, n, r1, r2, seed) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - Math.PI / 2, r = i % 2 ? r2 * (.82 + .3 * cmRand(seed + i)) : r1; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }
function phWord(g, txt, s, fill, line, skew) { g.save(); g.transform(1, 0, skew || -.12, 1, 0, 0); g.font = 'italic 900 ' + Math.round(s) + 'px ' + FONT_D; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = s * .2; g.strokeStyle = line; g.strokeText(txt, 0, 0); g.fillStyle = fill; g.fillText(txt, 0, 0); g.restore(); }
function phStar(g, r, k) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, q = i % 2 ? r * k : r; i ? g.lineTo(Math.cos(a) * q, Math.sin(a) * q) : g.moveTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); }
function phSticker(g, id, s) { // drawn around (0, 0), about s wide
  const r = s / 2; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (id === 'slash' || id === 'ko' || id === 'boom') {
    const C = { slash: ['#ffe14d', '#ff0844', 'SLASH!'], ko: ['#ff0844', '#ffe14d', 'K.O.!'], boom: ['#ff8a00', '#fff6d0', 'BOOM'] }[id];
    phBurst(g, id === 'boom' ? 14 : 11, r * 1.02, r * .7, id.length * 9); g.fillStyle = '#111'; g.save(); g.translate(r * .05, r * .06); g.fill(); g.restore();
    g.fillStyle = C[0]; g.fill(); g.lineWidth = r * .07; g.strokeStyle = '#111'; g.stroke();
    phWord(g, C[2], r * (id === 'boom' ? .5 : .44), C[1], '#111');
  } else if (id === 'gg') {
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = r * .08;
    g.beginPath(); g.ellipse(0, -r * .1, r * .95, r * .68, 0, 0, TAU); g.moveTo(-r * .3, r * .45); g.lineTo(-r * .55, r * .95); g.lineTo(r * .05, r * .5); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, -r * .1, r * .95, r * .68, 0, 0, TAU); g.fill();
    phWord(g, 'GG', r * .7, '#00b4ff', '#111', -.05);
  } else if (id === 'zap') {
    g.shadowColor = '#00f2fe'; g.shadowBlur = r * .5; g.fillStyle = '#e8ffff'; g.strokeStyle = '#00c8ff'; g.lineWidth = r * .1;
    g.beginPath(); g.moveTo(r * .2, -r); g.lineTo(-r * .55, r * .12); g.lineTo(-r * .02, r * .12); g.lineTo(-r * .25, r); g.lineTo(r * .6, -r * .2); g.lineTo(r * .06, -r * .2); g.closePath(); g.stroke(); g.fill();
  } else if (id === 'star') {
    g.shadowColor = '#ffd23f'; g.shadowBlur = r * .4; phStar(g, r * .95, .45); const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff6b0'); gr.addColorStop(1, '#ffae00'); g.fillStyle = gr; g.fill(); g.shadowBlur = 0; g.lineWidth = r * .07; g.strokeStyle = '#5a3a00'; g.stroke();
  } else if (id === 'heart') {
    g.shadowColor = '#ff2d95'; g.shadowBlur = r * .55; g.strokeStyle = '#ff7ac4'; g.lineWidth = r * .16; g.fillStyle = 'rgba(255,45,149,.35)';
    g.beginPath(); g.moveTo(0, r * .8); g.bezierCurveTo(-r * 1.25, -r * .05, -r * .55, -r * 1.05, 0, -r * .38); g.bezierCurveTo(r * .55, -r * 1.05, r * 1.25, -r * .05, 0, r * .8); g.fill(); g.stroke(); g.shadowBlur = 0; g.lineWidth = r * .05; g.strokeStyle = '#fff'; g.stroke();
  } else if (id === 'seal') { // a red hanko stamp with a slash mark
    g.rotate(-.12); g.fillStyle = 'rgba(214,20,40,.92)'; g.beginPath(); g.roundRect(-r * .8, -r * .8, r * 1.6, r * 1.6, r * .22); g.fill();
    g.strokeStyle = '#fff3e8'; g.lineWidth = r * .07; g.beginPath(); g.roundRect(-r * .66, -r * .66, r * 1.32, r * 1.32, r * .14); g.stroke();
    g.lineWidth = r * .16; g.beginPath(); g.moveTo(-r * .42, r * .38); g.quadraticCurveTo(-r * .05, -r * .05, r * .44, -r * .42); g.stroke();
    g.lineWidth = r * .1; g.beginPath(); g.moveTo(-r * .3, -r * .32); g.lineTo(r * .02, -r * .04); g.moveTo(r * .06, r * .1); g.lineTo(r * .34, r * .38); g.stroke();
  } else if (id === 'crown') {
    const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(1, '#e09a00'); g.fillStyle = gr; g.strokeStyle = '#4a3000'; g.lineWidth = r * .07; g.shadowColor = '#ffd23f'; g.shadowBlur = r * .3;
    g.beginPath(); g.moveTo(-r * .9, r * .55); g.lineTo(-r * .95, -r * .45); g.lineTo(-r * .45, 0); g.lineTo(0, -r * .7); g.lineTo(r * .45, 0); g.lineTo(r * .95, -r * .45); g.lineTo(r * .9, r * .55); g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke();
    for (const [x, c] of [[-r * .45, '#ff0844'], [0, '#00f2fe'], [r * .45, '#00ff88']]) { g.fillStyle = c; g.beginPath(); g.arc(x, r * .3, r * .11, 0, TAU); g.fill(); g.stroke(); }
  } else if (id === 'spark') {
    g.shadowColor = '#c4b5ff'; g.shadowBlur = r * .5; g.fillStyle = '#fff';
    for (const [x, y, q] of [[0, 0, 1], [r * .6, -r * .55, .38], [-r * .55, r * .5, .3]]) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = (i % 2 ? .16 : 1) * r * .9 * q; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.closePath(); g.fill(); }
  }
  g.restore();
}
function phRtl(t) { return /[֐-ࣿ]/.test(t); }
function phCaption(g, it, W, H) { // the caption is centered on (0, 0)
  const s = it.s * W * .09, txt = it.t; if (!txt) return;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.direction = phRtl(txt) ? 'rtl' : 'ltr';
  if (it.st === 'neon') { g.font = 'italic 800 ' + Math.round(s) + 'px ' + FONT_D; g.shadowColor = '#00f2fe'; g.shadowBlur = s * .5; g.fillStyle = '#ff0844'; g.fillText(txt, -s * .05, 0); g.fillStyle = '#00f2fe'; g.fillText(txt, s * .05, 0); g.shadowBlur = s * .2; g.fillStyle = '#f0ffff'; g.fillText(txt, 0, 0); }
  else if (it.st === 'manga') { g.transform(1, 0, -.14, 1, 0, 0); g.font = '900 ' + Math.round(s * 1.1) + 'px ' + FONT_D; g.lineWidth = s * .3; g.strokeStyle = '#fff'; g.strokeText(txt, 0, 0); g.lineWidth = s * .1; g.strokeStyle = '#000'; g.strokeText(txt, 0, 0); g.fillStyle = '#111'; g.fillText(txt, 0, 0); }
  else if (it.st === 'sub') { g.font = '600 ' + Math.round(s * .72) + 'px ' + FONT_D; const w = g.measureText(txt).width; g.fillStyle = 'rgba(0,0,0,.62)'; g.fillRect(-w / 2 - s * .4, -s * .55, w + s * .8, s * 1.1); g.fillStyle = '#ffe14d'; g.fillText(txt, 0, s * .02); }
  else { g.font = '900 ' + Math.round(s) + 'px ' + FONT_D; const gr = g.createLinearGradient(0, -s / 2, 0, s / 2); gr.addColorStop(0, '#fff7c0'); gr.addColorStop(.5, '#ffc21a'); gr.addColorStop(1, '#b06a00'); g.lineWidth = s * .16; g.strokeStyle = '#2a1600'; g.strokeText(txt, 0, 0); g.fillStyle = gr; g.shadowColor = 'rgba(255,200,40,.6)'; g.shadowBlur = s * .35; g.fillText(txt, 0, 0); }
  g.restore();
}
/* ---------------- frames ---------------- */
function phFrame(g, W, H, id) {
  if (id === 'none') return; const k = W / 390, d = Store.data; g.save();
  if (id === 'neon') {
    const m = 12 * k, c = 22 * k;
    const path = (o) => { g.beginPath(); g.moveTo(m + c + o, m + o); g.lineTo(W - m - o, m + o); g.lineTo(W - m - o, H - m - c - o); g.lineTo(W - m - c - o, H - m - o); g.lineTo(m + o, H - m - o); g.lineTo(m + o, m + c + o); g.closePath(); };
    g.lineWidth = 3 * k; g.shadowBlur = 16 * k; g.shadowColor = '#ff0844'; g.strokeStyle = '#ff3b6e'; path(0); g.stroke(); g.shadowColor = '#00f2fe'; g.strokeStyle = '#7ffaff'; path(7 * k); g.stroke();
  } else if (id === 'cine') {
    const bh = Math.max(0, (H - W / 2.39) / 2) * .62; g.fillStyle = '#000'; g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh);
    g.font = '600 ' + Math.round(11 * k) + 'px ' + FONT_M; g.fillStyle = '#9aa7c0'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(G.mode === 'story' && G.stage ? lt(G.stage.name) : 'OVERDRIVE', W / 2, bh / 2);
  } else if (id === 'cam') {
    const m = 22 * k, L = 30 * k; g.strokeStyle = 'rgba(240,255,255,.9)'; g.lineWidth = 3 * k;
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke(); }
    g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(m + 14 * k, m + 46 * k, 6 * k, 0, TAU); g.fill();
    g.font = '700 ' + Math.round(13 * k) + 'px ' + FONT_M; g.fillStyle = '#f0ffff'; g.textBaseline = 'middle'; g.fillText('REC', m + 26 * k, m + 46 * k);
    const t = G.time | 0; g.textAlign = 'right'; g.fillText(String(t / 3600 | 0).padStart(2, '0') + ':' + String((t / 60 | 0) % 60).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') + ':' + String((G.time * 24 | 0) % 24).padStart(2, '0'), W - m - 10 * k, m + 46 * k);
    g.lineWidth = 1.5 * k; g.beginPath(); g.moveTo(W / 2 - 14 * k, H / 2); g.lineTo(W / 2 + 14 * k, H / 2); g.moveTo(W / 2, H / 2 - 14 * k); g.lineTo(W / 2, H / 2 + 14 * k); g.stroke();
    g.textAlign = 'left'; g.fillText('ISO 800  1/250  F2.8', m + 10 * k, H - m - 54 * k);
  } else if (id === 'pola') {
    const m = 16 * k, bm = 96 * k; g.fillStyle = '#f4f1ea'; g.beginPath(); g.rect(0, 0, W, H); g.rect(m, m, W - m * 2, H - m - bm); g.fill('evenodd');
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5 * k; g.strokeRect(m, m, W - m * 2, H - m - bm);
    g.font = 'italic 700 ' + Math.round(20 * k) + 'px ' + FONT_D; g.fillStyle = '#2a2a3a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const who = (d.user && !d.user.guest ? d.user.name : lt('GUEST')); g.direction = phRtl(who) ? 'rtl' : 'ltr';
    g.fillText(who + ' · ' + (G.mode === 'story' && G.stage ? G.stage.id : fmtNum(G.score | 0)), W / 2, H - bm / 2 - 4 * k);
  } else if (id === 'manga') {
    const m = 14 * k; g.fillStyle = '#fbfbf8'; g.beginPath(); g.rect(0, 0, W, H); g.rect(m, m, W - m * 2, H - m * 2); g.fill('evenodd');
    g.strokeStyle = '#111'; g.lineWidth = 4 * k; g.strokeRect(m, m, W - m * 2, H - m * 2);
    g.save(); g.beginPath(); g.rect(m, m, W - m * 2, H - m * 2); g.clip(); g.strokeStyle = 'rgba(10,10,10,.55)'; const cx0 = W / 2, cy0 = H / 2, R = Math.hypot(W, H) / 2;
    for (let i = 0; i < 90; i++) { const a = i / 90 * TAU + cmRand(i) * .05, r0 = R * (.62 + .2 * cmRand(i * 3.3)); g.lineWidth = (1 + 2.5 * cmRand(i * 7.1)) * k; g.beginPath(); g.moveTo(cx0 + Math.cos(a) * r0, cy0 + Math.sin(a) * r0); g.lineTo(cx0 + Math.cos(a) * R, cy0 + Math.sin(a) * R); g.stroke(); }
    g.restore();
  } else if (id === 'wanted') {
    const m = 14 * k, top = 70 * k, bot = 80 * k; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1a08'); gr.addColorStop(1, '#120a04');
    g.fillStyle = gr; g.beginPath(); g.rect(0, 0, W, H); g.rect(m, top, W - m * 2, H - top - bot); g.fill('evenodd');
    g.strokeStyle = '#d9a62e'; g.lineWidth = 3 * k; g.strokeRect(m, top, W - m * 2, H - top - bot); g.lineWidth = 1 * k; g.strokeRect(m - 5 * k, top - 5 * k, W - m * 2 + 10 * k, H - top - bot + 10 * k);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 ' + Math.round(40 * k) + 'px ' + FONT_D; const tg = g.createLinearGradient(0, 14 * k, 0, 60 * k); tg.addColorStop(0, '#ffe9a0'); tg.addColorStop(1, '#c7871a'); g.fillStyle = tg; g.fillText(lt('WANTED'), W / 2, top / 2 + 2 * k);
    g.font = '700 ' + Math.round(13 * k) + 'px ' + FONT_M; g.fillStyle = '#d9a62e'; g.fillText(lt('DEAD OR ALIVE'), W / 2, H - bot + 24 * k);
    g.font = '900 ' + Math.round(24 * k) + 'px ' + FONT_D; g.fillStyle = '#ffe9a0'; g.fillText(ltf('BOUNTY {0} CR', fmtNum(Math.max(1000, G.score | 0))), W / 2, H - bot + 52 * k);
  }
  g.restore();
}
/* ---------------- the editor ---------------- */
Object.assign(Photo, {
  fr: 'none', items: [], sel: -1, arm: '', tab: 'filter', tst: 'neon', idrag: null,
  itemAt(u, v) { const W = this.cv.width, H = this.cv.height; for (let i = this.items.length - 1; i >= 0; i--) { const it = this.items[i], r = it.k === 'tx' ? Math.max(.08, it.s * .05) : it.s * .11; const dx = (u - it.u) * W / H, dy = v - it.v; if (it.k === 'tx' ? Math.abs(u - it.u) < Math.max(.2, it.s * .02 * it.t.length) && Math.abs(dy) < r : Math.hypot(dx, dy) < r * 1.15) return i; } return -1; },
  uv(e) { const b = this.cv.getBoundingClientRect(); return [(e.clientX - b.left) / Math.max(1, b.width), (e.clientY - b.top) / Math.max(1, b.height)]; },
  add(it) { if (this.items.length >= 12) { toastDom(lt('UP TO 12 STICKERS AND CAPTIONS')); return; } this.items.push(it); this.sel = this.items.length - 1; this.dirty = true; Aud.sfx('ui'); this.renderUi(); },
  drawItems(g, W, H, selOnly) {
    this.items.forEach((it, i) => {
      if (selOnly && i !== this.sel) return;
      g.save(); g.translate(it.u * W, it.v * H); g.rotate(it.r || 0);
      if (!selOnly) { if (it.k === 'st') phSticker(g, it.id, it.s * W * .22); else phCaption(g, it, W, H); }
      else { const q = it.k === 'st' ? it.s * W * .13 : it.s * W * .065, hw = it.k === 'tx' ? Math.max(q * 2, W * .36) : q; g.setLineDash([6, 5]); g.lineWidth = Math.max(2, W / 260); g.strokeStyle = '#ffd23f'; g.strokeRect(-hw, -q, hw * 2, q * 2); }
      g.restore();
    });
  }
});
{
  const open0 = Photo.open.bind(Photo); Photo.open = function () { this.fr = 'none'; this.items = []; this.sel = -1; this.arm = ''; this.tab = 'filter'; this.draft = ''; open0(); };
  const comp0 = Photo.compose.bind(Photo);
  Photo.compose = function (g, W, H) {
    const logo = this.logo; this.logo = 0; comp0(g, W, H); this.logo = logo;
    g.setTransform(1, 0, 0, 1, 0, 0); this.drawItems(g, W, H, false); phFrame(g, W, H, this.fr);
    if (this.logo && this.fr !== 'pola' && this.fr !== 'wanted') this.mark(g, W, H);
    if (g === this.g && this.sel >= 0) this.drawItems(g, W, H, true); // the selection box is only in the preview
  };
  const att0 = Photo.attach.bind(Photo);
  Photo.attach = function () {
    att0(); const c = this.cv; if (!c || this.bound2) return; this.bound2 = true;
    c.addEventListener('pointerdown', e => {
      const [u, v] = this.uv(e);
      if (this.arm) { e.stopImmediatePropagation(); e.preventDefault(); this.add({ k: 'st', id: this.arm, u, v, s: 1, r: (cmRand(this.items.length + 3) - .5) * .4 }); this.arm = ''; this.renderUi(); return; }
      const i = this.itemAt(u, v); if (i < 0) { if (this.sel >= 0) { this.sel = -1; this.dirty = true; this.renderUi(); } return; }
      e.stopImmediatePropagation(); e.preventDefault(); this.sel = i; const it = this.items[i]; this.idrag = { u, v, iu: it.u, iv: it.v }; this.dirty = true; this.renderUi();
      try { c.setPointerCapture(e.pointerId); } catch (er) { errLog(er); }
    }, true);
    c.addEventListener('pointermove', e => { const d = this.idrag; if (!d) return; e.stopImmediatePropagation(); const [u, v] = this.uv(e), it = this.items[this.sel]; if (!it) return; it.u = clamp(d.iu + u - d.u, 0, 1); it.v = clamp(d.iv + v - d.v, 0, 1); this.dirty = true; }, true);
    const up = e => { if (!this.idrag) return; e.stopImmediatePropagation(); this.idrag = null; }; c.addEventListener('pointerup', up, true); c.addEventListener('pointercancel', up, true);
  };
  const ui0 = Photo.renderUi.bind(Photo);
  Photo.renderUi = function () {
    ui0(); const bar = $('phBar'); if (!bar) return;
    let tabs = $('phTabs'); if (!tabs) { tabs = el('div', 'seg ph-tabs'); tabs.id = 'phTabs'; $('phF').before(tabs); for (const id of ['phFr', 'phSt', 'phTx']) { const p = el('div', 'ph-pane'); p.id = id; $('phF').after(p); } }
    tabs.textContent = ''; for (const [id, n] of [['filter', 'FILTER'], ['frame', 'FRAME'], ['sticker', 'STICKERS'], ['text', 'TEXT']]) { const b = el('button', id === this.tab ? 'on' : '', lt(n)); b.onclick = () => { Aud.sfx('ui'); this.tab = id; this.arm = ''; this.renderUi(); }; tabs.appendChild(b); }
    $('phF').classList.toggle('hidden', this.tab !== 'filter');
    const fr = $('phFr'); fr.classList.toggle('hidden', this.tab !== 'frame'); fr.textContent = ''; const fg = el('div', 'seg ph-grid3'); fr.appendChild(fg);
    for (const F of PH_FRAMES) { const b = el('button', F.id === this.fr ? 'on' : '', lt(F.n)); b.onclick = () => { Aud.sfx('ui'); this.fr = F.id; this.dirty = true; this.renderUi(); }; fg.appendChild(b); }
    const st = $('phSt'); st.classList.toggle('hidden', this.tab !== 'sticker'); st.textContent = ''; const sg = el('div', 'ph-stk'); st.appendChild(sg);
    for (const id of PH_STICKERS) { const b = el('button', id === this.arm ? 'on' : ''), q = document.createElement('canvas'); q.width = q.height = 96; const g = q.getContext('2d'); g.translate(48, 48); try { phSticker(g, id, 78); } catch (e) { errLog(e); } b.appendChild(q); b.setAttribute('aria-label', id); b.dataset.st = id;
      b.onclick = () => { Aud.sfx('ui'); this.arm = this.arm === id ? '' : id; this.renderUi(); }; sg.appendChild(b); }
    st.appendChild(el('div', 'small mute', this.arm ? lt('Tap the photo to place the sticker.') : lt('Pick a sticker, then tap the photo. Drag a sticker to move it.')));
    const tx = $('phTx'); tx.classList.toggle('hidden', this.tab !== 'text'); tx.textContent = '';
    const row = el('div', 'ph-row'), inp = document.createElement('input'); inp.id = 'phIn'; inp.maxLength = 32; inp.placeholder = lt('Write a caption'); inp.className = 'ph-in'; inp.value = this.draft || ''; inp.oninput = () => { this.draft = inp.value; }; row.appendChild(inp);
    const addB = el('button', 'chip gold', lt('ADD')); addB.onclick = () => { const t = inp.value.trim(); if (!t) { Aud.sfx('deny'); return; } this.draft = ''; this.add({ k: 'tx', t, st: this.tst, u: .5, v: .16 + .08 * (this.items.filter(q => q.k === 'tx').length % 6), s: 1, r: 0 }); }; row.appendChild(addB); tx.appendChild(row);
    const sty = el('div', 'seg ph-grid4'); for (const S of PH_TEXT) { const b = el('button', S.id === this.tst ? 'on' : '', lt(S.n)); b.onclick = () => { Aud.sfx('ui'); this.tst = S.id; const it = this.items[this.sel]; if (it && it.k === 'tx') { it.st = S.id; this.dirty = true; } this.renderUi(); }; sty.appendChild(b); } tx.appendChild(sty);
    let ed = $('phEd'); if (!ed) { ed = el('div', 'ph-row ph-ed'); ed.id = 'phEd'; $('phPose').before(ed); }
    ed.textContent = ''; const it = this.items[this.sel]; ed.classList.toggle('hidden', !it || (this.tab !== 'sticker' && this.tab !== 'text'));
    if (it) for (const [n, fn] of [['−', () => { it.s = Math.max(.35, it.s / 1.2); }], ['+', () => { it.s = Math.min(3.5, it.s * 1.2); }], ['⟲', () => { it.r = (it.r || 0) - .26; }], ['⟳', () => { it.r = (it.r || 0) + .26; }], [lt('DELETE'), () => { this.items.splice(this.sel, 1); this.sel = -1; }]]) { const b = el('button', 'chip', n); b.onclick = () => { Aud.sfx('ui'); fn(); this.dirty = true; this.renderUi(); }; ed.appendChild(b); }
    if (this.items.length) { const b = el('button', 'chip', lt('CLEAR ALL')); b.onclick = () => { Aud.sfx('back'); this.items = []; this.sel = -1; this.dirty = true; this.renderUi(); }; ed.appendChild(b); if (!it) ed.classList.toggle('hidden', this.tab !== 'sticker' && this.tab !== 'text'); }
  };
}
