/* =====================================================================
   VERSION 62: PORTRAITS FROM THE REAL MODEL
   Every hero portrait (the shop, the Arsenal, crate rewards, the profile)
   is now a render of the same 3D body you play with: head and shoulders,
   in the skin's own colors, gear, hair and face, lit like the Hero Forge
   studio. Portraits are rendered once in the background, a few at a time,
   and kept; until one is ready (or with 3D off) the drawn portrait stays.
   Display only.
   ===================================================================== */
const Portrait3D = {
  cache: new Map(), queue: [], busy: false, rn: null,
  key(sk) { return (sk.id || '') + '|' + (sk.body || 'ninja') + '|' + sk.a + '|' + sk.b; },
  ok() { try { return typeof THREE !== 'undefined' && Models.ok('xbot') && Mini.ok() && !CALM; } catch (e) { return false; } },
  init() {
    if (this.rn) return true; const T = THREE;
    try { const cv = document.createElement('canvas'); cv.width = cv.height = 320; const rn = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
      rn.outputColorSpace = T.SRGBColorSpace; rn.toneMapping = T.ACESFilmicToneMapping; rn.setSize(320, 320, false); this.rn = rn;
      const sc = new T.Scene(); this.scene = sc; sc.add(new T.HemisphereLight(0x9fb0ff, 0x201030, 1.6)); const key = new T.DirectionalLight(0xffffff, 2.6); key.position.set(1.5, 3, 3); sc.add(key);
      const rim = new T.DirectionalLight(0xff4fd8, 2); rim.position.set(-2.5, 2, -2); sc.add(rim); this.fill = new T.PointLight(0x00f2fe, 4, 4, 1.5); this.fill.position.set(0, 1.4, 1.2); sc.add(this.fill);
      const root = new T.Group(); root.rotation.x = -Math.PI / 2; const inner = new T.Group(); inner.scale.set(1 / 30, -1 / 30, 1 / 30); root.add(inner); sc.add(root); this.inner = inner;
      this.cam = new T.PerspectiveCamera(30, 1, .05, 20); this.cam.position.set(.2, 1.36, 1.9); this.cam.lookAt(0, 1.27, 0); return true; }
    catch (e) { errLog(e); this.dead = 1; return false; }
  },
  want(sk) { const k = this.key(sk); if (this.cache.has(k) || this.queue.some(q => q.k === k)) return; this.queue.push({ k, sk }); this.pump(); },
  pump() {
    if (this.busy || !this.queue.length || this.dead) return; this.busy = true;
    setTimeout(() => { try { const q = this.queue.shift(); if (q && this.init()) this.render(q); } catch (e) { errLog(e); } this.busy = false; if (this.queue.length) this.pump(); }, 60);
  },
  render(q) {
    const sk = q.sk, body = sk.body || 'ninja'; if (Human.HEAVY[body] && !Models.ok('soldier')) { Models.load('soldier'); this.queue.push(q); return; }
    const g = Human.build({ body, a: sk.a, b: sk.b }, (Store.data && Store.data.weapon) || 'katana'); if (g.pool) g.pool.visible = false;
    if (g.blade) g.blade.visible = false; if (g.blade2) g.blade2.visible = false; // (no weapon across the face)
    this.inner.add(g); try { for (let i = 0; i < 12; i++) Human.anim(g, { x: 0, y: 0, face: Math.PI / 2 + .35, spd: 0, dashing: false, alpha: 1 }, .05, i * .05); g.position.set(0, 0, 0); } catch (e) { errLog(e); } // (the idle pose settles in first)
    this.fill.color.set(sk.a); this.rn.setClearColor(0x000000, 0); this.rn.render(this.scene, this.cam);
    const c = document.createElement('canvas'); c.width = c.height = 320; c.getContext('2d').drawImage(this.rn.domElement, 0, 0); this.cache.set(q.k, c);
    this.inner.remove(g); g.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); });
    try { if (typeof UI !== 'undefined' && UI.cur && /arsenal|shop|crates|profile|me/.test(UI.cur)) this.refresh(); } catch (e) { errLog(e); }
  },
  refresh() { clearTimeout(this.rt); this.rt = setTimeout(() => { try { document.querySelectorAll('canvas[data-p3d]').forEach(cv => { const sk = SKINS.find(s => s.id === cv.dataset.p3d); if (sk) { const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); heroBust(g, sk, cv.width, 0); } }); } catch (e) { errLog(e); } }, 120); }
};
{
  const hb2 = heroBust;
  heroBust = function (g, sk, S, t) {
    if (!sk || !Portrait3D.ok()) return hb2(g, sk, S, t);
    const pc = Portrait3D.cache.get(Portrait3D.key(sk)); if (!pc) { Portrait3D.want(sk); try { if (g.canvas) g.canvas.dataset.p3d = sk.id; } catch (e) { } return hb2(g, sk, S, t); }
    // the backdrop (the skin's color, as the drawn portraits have it), then the render
    g.save(); g.setTransform(g.getTransform ? g.getTransform() : new DOMMatrix()); const gr = g.createRadialGradient(S / 2, S * .45, S * .05, S / 2, S * .5, S * .62); gr.addColorStop(0, bustMix(sk.a, -.35)); gr.addColorStop(.6, bustMix(sk.a, -.82)); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); g.drawImage(pc, 0, 0, S, S); g.restore();
  };
}
