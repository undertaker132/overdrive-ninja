/* =====================================================================
   3D VIEW (version 37): a closer camera that follows the hero, and toon
   shading (two light bands, a crisp rim, dark silhouette edges).
   Settings > PRESENTATION > 3D CAMERA (CLOSE, CINEMATIC, TOP) and 3D STYLE.
   Aiming follows the camera exactly (it already reads GL3D.cam).
   ===================================================================== */
const Cam3 = { x: 0, y: 0, init: false,
  cfg() { const m = (Store.data && Store.data.settings.cam3d) || 'close'; return m === 'top' ? null : m === 'cine' ? { th: 58, z: 1.32, f: .7 } : { th: 49, z: 1.16, f: .5 }; },
  apply() {
    const c = this.cfg(), C = GL3D.cam; if (!c) { this.init = false; return; }
    if (Math.abs(GL3D.th - GL3D.th0) < 1e-6 && GL3D.yaw === 0) GL3D.setView(c.th * Math.PI / 180, 0); // (boss entrances and finishers keep their own view)
    const z = C.z * c.z, hw = V.VW / (2 * z), hh = V.VH / (2 * z * Math.max(.5, GL3D.k));
    const lo = Math.min(V.L0 - 40 + hw, V.CX), hi = Math.max(V.R0 + 40 - hw, V.CX);
    const tx = clamp(C.x + (P.x - C.x) * c.f, lo, hi), ty = clamp(C.y + (P.y - C.y) * c.f * .55, Math.min(hh, V.VH / 2), Math.max(V.VH - hh, V.VH / 2));
    if (!this.init || G.state !== 'PLAY') { this.x = tx; this.y = ty; this.init = true; }
    const k = 1 - Math.exp(-(RDT || 1 / 60) * 6); this.x += (tx - this.x) * k; this.y += (ty - this.y) * k;
    C.x = this.x; C.y = this.y; C.z = z; C.offY = W3D.offY();
  }
};
{ const wc0 = W3D.camera.bind(W3D); W3D.camera = function () { wc0(); if (inRun()) Cam3.apply(); else Cam3.init = false; }; }
{ const ps2 = PC.settings.bind(PC); PC.settings = function (head, cycle, box, s) {
    head('3D'); cycle('3D camera', 'cam3d', ['close', 'cine', 'top'], ['CLOSE', 'CINEMATIC', 'TOP']); cycle('3D style', 'toon3d', [1, 0], ['TOON', 'CLASSIC']); cycle('Reflections', 'refl', ['soft', 'full', 'off'], ['SOFT', 'FULL', 'OFF']);
    ps2(head, cycle, box, s); }; }