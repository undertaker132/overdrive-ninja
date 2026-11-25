
/* --- MODULE 20: v108.0 CHASE CAMERA (prototype) — 3D seen from behind the hero, low and close --- */
(function () {
  'use strict';
  // Settings > Graphics > 3D camera: TOP (the classic view) or CHASE. The simulation does not change, only the view:
  // a perspective camera behind and above the hero, looking up the roof where the enemies come from. It does not turn
  // with every dash (up on the screen stays forward), it only leans with the hero's sideways moves.
  if (typeof HE !== 'undefined') Object.assign(HE, { "3D camera": "מצלמת 3D", "TOP": "מלמעלה", "CHASE": "מרדף" });
  const on = () => { try { return Store.data.settings.chase108 === 1 && G.state === 'PLAY' && W3D.live && !CALM; } catch (e) { return false; } };
  let persp = null, ortho = null, cx0 = 0, cy0 = 0, lean = 0, ready = false, bk = 235, ht = 165;
  const sc0 = R3.syncCam.bind(R3);
  R3.syncCam = function () {
    if (!on()) {
      if (ortho && this.cam !== ortho) { this.cam = ortho; try { this.comp.passes[0].camera = ortho; } catch (e) { } }
      ready = false; return sc0.apply(this, arguments);
    }
    if (!ortho) ortho = this.cam;
    if (this.cam !== ortho) this.cam = ortho;
    sc0.apply(this, arguments); // (lights and shadow follow as before)
    const T = THREE, W = this.rn.domElement.width, H = this.rn.domElement.height;
    if (!persp) persp = new T.PerspectiveCamera(58, W / H, 4, 9000);
    persp.aspect = W / H;
    // follow the hero smoothly; a little of the roof's center keeps the lanes in view
    const tx = P.x * .8 + V.CX * .2, ty = P.y, k = ready ? 1 - Math.exp(-6 * (RDT || 1 / 60)) : 1; ready = true;
    cx0 += (tx - cx0) * k; cy0 += (ty - cy0) * k;
    lean += (clamp((P.vx || 0) / 900, -1, 1) * .09 - lean) * k;
    // with a boss on the roof the camera pulls back and up so the hero and the boss are both in frame
    const B = Boss.cur && Boss.cur.enter >= 1 ? Boss.cur : null, sep = B ? Math.max(0, cy0 - B.y) : 0;
    bk += ((B ? 330 + sep * .55 : 235) - bk) * k; ht += ((B ? 300 + sep * .45 : 165) - ht) * k;
    const lookY = B ? (cy0 + B.y) / 2 : cy0 - 190, lookX = B ? (cx0 + B.x) / 2 : cx0 + lean * 120;
    persp.position.set(cx0 - lean * 300, -(cy0 + bk), ht);
    persp.up.set(0, 0, 1);
    persp.lookAt(lookX, -lookY, 18);
    if (G.odT > 0) persp.fov = 64; else persp.fov += (58 - persp.fov) * .1;
    persp.updateProjectionMatrix(); persp.updateMatrixWorld();
    this.cam = persp; try { this.comp.passes[0].camera = persp; } catch (e) { }
  };
  window.ChaseCam108 = { on };
})();
