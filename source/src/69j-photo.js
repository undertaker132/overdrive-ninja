/* =====================================================================
   PHOTO MODE — from the pause menu: the HUD disappears, you zoom and
   drag the frozen scene, pick a filter, strike your victory pose
   (hero mastery 3) and save a PNG. The preview is the exact image that
   gets saved (same crop, same filter, same logo).
   ===================================================================== */
const PH_FILTERS = [{ id: 'none', n: 'NONE' }, { id: 'noir', n: 'NOIR' }, { id: 'neon', n: 'NEON' }, { id: 'vhs', n: 'VHS' }, { id: 'glitch', n: 'GLITCH' }];
async function saveFile(blob, name) { // the artifact's downloads capability, or a plain download in the standalone game
  const rt = typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function';
  if (rt) {
    let dl = null; try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
    if (!dl) return 'na';
    try { await dl.save({ filename: name, data: blob }); return 'saved'; } catch (e) { return e && e.code === 'declined' ? 'declined' : 'na'; }
  }
  try { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); return 'saved'; } catch (e) { return 'na'; }
}
function phFilter(g, W, H, f) {
  if (f === 'none') return;
  let img; try { img = g.getImageData(0, 0, W, H); } catch (e) { return; }
  const d = img.data, n = d.length;
  if (f === 'noir') for (let i = 0; i < n; i += 4) { const l = d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114, v = 255 * Math.pow(l / 255, .82) * 1.08; d[i] = d[i + 1] = d[i + 2] = v; }
  else if (f === 'neon') for (let i = 0; i < n; i += 4) { const r = d[i], gg = d[i + 1], b = d[i + 2], l = r * .299 + gg * .587 + b * .114; d[i] = (l + (r - l) * 1.9) * 1.1; d[i + 1] = (l + (gg - l) * 1.9) * 1.1; d[i + 2] = (l + (b - l) * 1.9) * 1.15; }
  else if (f === 'vhs') {
    const s = Math.max(2, Math.round(H / 260));
    for (let y = 0; y < H; y++) { const dark = (y % (s * 2)) < s ? .78 : 1; for (let x = 0, i = y * W * 4; x < W; x++, i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      d[i] = (r * .55 + (r * .393 + gg * .769 + b * .189) * .45) * dark * 1.05; d[i + 1] = (gg * .55 + (r * .349 + gg * .686 + b * .168) * .45) * dark; d[i + 2] = (b * .55 + (r * .272 + gg * .534 + b * .131) * .45) * dark * .92;
    } }
  } else if (f === 'glitch') {
    const src = new Uint8ClampedArray(d), sh = Math.max(3, Math.round(W / 130)), band = Math.max(8, Math.round(H / 40));
    for (let y = 0; y < H; y++) {
      const bi = (y / band) | 0, off = cmRand(bi * 3.7) < .18 ? Math.round((cmRand(bi + 11) - .5) * W * .08) : 0;
      for (let x = 0, i = y * W * 4; x < W; x++, i += 4) {
        const xr = clamp(x + sh + off, 0, W - 1), xb = clamp(x - sh + off, 0, W - 1), xg = clamp(x + off, 0, W - 1), row = y * W * 4;
        d[i] = src[row + xr * 4]; d[i + 1] = src[row + xg * 4 + 1]; d[i + 2] = src[row + xb * 4 + 2];
      }
    }
  }
  g.putImageData(img, 0, 0);
}
const Photo = {
  on: false, z: 1, px: 0, py: 0, f: 'none', logo: 1, cv: null, g: null, dirty: true, t: 0, drag: null,
  open() {
    if (G.state !== 'PAUSE') return;
    this.on = true; G.photo = true; this.z = 1; this.px = this.py = 0; this.f = 'none'; this.dirty = true;
    UI.show('photo'); UI.syncHud(); this.attach(); this.renderUi(); this.toggleBar(true); Aud.sfx('ui');
  },
  close() { if (!this.on) return; this.on = false; G.photo = false; if (G.state === 'PAUSE') { P.poseS = 0; UI.show('pause'); UI.syncHud(); } },
  attach() {
    const c = $('phCv'); if (!c) return; this.cv = c; c.width = cv.width; c.height = cv.height; this.g = c.getContext('2d');
    if (!this.bound) {
      this.bound = true;
      c.addEventListener('pointerdown', e => { e.preventDefault(); this.drag = { x: e.clientX, y: e.clientY, px: this.px, py: this.py }; try { c.setPointerCapture(e.pointerId); } catch (er) { errLog(er); } });
      c.addEventListener('pointermove', e => { const d = this.drag; if (!d || this.z <= 1.001) return; const k = cv.width / Math.max(1, c.getBoundingClientRect().width) / this.z; this.px = d.px - (e.clientX - d.x) * k; this.py = d.py - (e.clientY - d.y) * k; this.dirty = true; });
      const up = e => { const d = this.drag; this.drag = null; if (d && e.type === 'pointerup' && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) this.toggleBar(); }; // a tap shows or hides the controls
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    }
  },
  toggleBar(show) { const b = $('phBar'), h = show === undefined ? !b.classList.contains('hidden') : !show; b.classList.toggle('hidden', h); $('phHint').classList.toggle('hidden', !h); },
  renderUi() {
    const box = $('phF'); box.textContent = '';
    for (const F of PH_FILTERS) { const b = el('button', F.id === this.f ? 'on' : '', lt(F.n)); b.onclick = () => { Aud.sfx('ui'); this.f = F.id; this.dirty = true; this.renderUi(); }; box.appendChild(b); }
    $('phZ').value = Math.round(this.z * 100);
    $('phLogo').textContent = this.logo ? lt('LOGO: ON') : lt('LOGO: OFF');
    const pose = heroLevel(Store.data.skin) >= 3, pb = $('phPose'); pb.textContent = pose ? lt('VICTORY POSE') : lt('POSE: HERO MASTERY 3'); pb.disabled = !pose;
  },
  tick(rd) {
    if (!this.on || UI.cur !== 'photo' || !this.g) return;
    if (this.cv.width !== cv.width || this.cv.height !== cv.height) { this.attach(); this.dirty = true; }
    this.t += rd; const live = P.poseS > 0 && CAM.t - P.poseS < 1.2; // the pose animates for a moment, then holds
    if (this.dirty || (live && this.t > .08)) { this.t = 0; this.dirty = false; this.compose(this.g, this.cv.width, this.cv.height); }
  },
  crop(W, H) { // the source rectangle for the current zoom + pan, kept inside the frame
    const sw = cv.width / this.z, sh = cv.height / this.z, mx = (cv.width - sw) / 2, my = (cv.height - sh) / 2;
    this.px = clamp(this.px, -mx, mx); this.py = clamp(this.py, -my, my);
    return [mx + this.px, my + this.py, sw, sh];
  },
  compose(g, W, H) {
    const [sx, sy, sw, sh] = this.crop(W, H);
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true; const ul = typeof W3D !== 'undefined' && W3D.live && GL3D.cv && GL3D.P.on && GL3D.P.ultra; if (typeof W3D !== 'undefined' && W3D.live && GL3D.cv) { const r = GL3D.rs || 1; g.drawImage(GL3D.cv, sx * r, sy * r, sw * r, sh * r, 0, 0, W, H); } if (!ul) g.drawImage(cv, sx, sy, sw, sh, 0, 0, W, H);
    phFilter(g, W, H, this.f);
    if (this.logo) this.mark(g, W, H);
  },
  mark(g, W, H) { // a small logo + who + where, bottom corner
    const k = W / 390, d = Store.data, pad = 14 * k;
    g.save(); g.textBaseline = 'alphabetic'; g.direction = 'ltr';
    const grd = g.createLinearGradient(0, H - 90 * k, 0, H); grd.addColorStop(0, 'rgba(5,6,15,0)'); grd.addColorStop(1, 'rgba(5,6,15,.75)'); g.fillStyle = grd; g.fillRect(0, H - 90 * k, W, 90 * k);
    g.textAlign = 'left'; g.font = 'italic 700 ' + Math.round(26 * k) + 'px ' + FONT_D;
    g.fillStyle = '#ff0844'; g.fillText('OVERDRIVE', pad - 1.5 * k, H - 34 * k); g.fillStyle = '#00f2fe'; g.fillText('OVERDRIVE', pad + 1.5 * k, H - 34 * k); g.fillStyle = '#e8fbff'; g.fillText('OVERDRIVE', pad, H - 34 * k);
    g.font = '700 ' + Math.round(11 * k) + 'px ' + FONT_D; g.fillStyle = '#ff0844'; g.fillText('C Y B E R   S L A S H', pad, H - 18 * k);
    g.textAlign = 'right'; g.font = '700 ' + Math.round(12 * k) + 'px ' + FONT_M; g.fillStyle = '#ffd23f';
    const who = (d.user && !d.user.guest ? d.user.name : lt('GUEST')).toUpperCase().slice(0, 18), where = G.mode === 'story' && G.stage ? ltf('STAGE {0}', G.stage.id) : lt((MODES.find(m => m.id === G.mode) || { name: '' }).name);
    g.direction = LANG.rtl ? 'rtl' : 'ltr'; g.fillText(who, W - pad, H - 34 * k); g.fillStyle = '#8fa4c8'; g.fillText(where + ' · ' + fmtNum(G.score | 0), W - pad, H - 18 * k);
    g.restore();
  },
  async save() {
    const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; this.compose(c.getContext('2d'), c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) { toastDom(lt('SAVING IS NOT AVAILABLE HERE')); return 'na'; }
    const r = await saveFile(blob, 'overdrive-photo.png'); this.lastSize = blob.size;
    toastDom(r === 'saved' ? lt('PHOTO SAVED') : r === 'declined' ? lt('NOT SAVED') : lt('SAVING IS NOT AVAILABLE HERE')); if (r === 'saved') Aud.sfx('buy');
    return r;
  }
};
Object.assign(UI, {
  photoInit() {
    $('psPhoto').onclick = () => Photo.open();
    $('phBack').onclick = () => { Aud.sfx('back'); Photo.close(); };
    $('phSave').onclick = () => { Aud.sfx('ui'); Photo.save(); };
    $('phLogo').onclick = () => { Aud.sfx('ui'); Photo.logo = Photo.logo ? 0 : 1; Photo.dirty = true; Photo.renderUi(); };
    $('phPose').onclick = () => { if (heroLevel(Store.data.skin) < 3) return; Aud.sfx('star', 2); P.poseS = CAM.t; P.poseL = 0; Photo.dirty = true; };
    $('phZ').oninput = () => { const z0 = Photo.z; Photo.z = clamp((+$('phZ').value || 100) / 100, 1, 2.5); if (z0 <= 1.001 && Photo.z > 1.001) { const k = V.s * V.dpr; Photo.px = P.x * k - cv.width / 2; Photo.py = P.y * k - cv.height / 2; } Photo.dirty = true; }; // the first zoom centers on your hero
  }
});
