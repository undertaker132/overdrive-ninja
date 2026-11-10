/* =====================================================================
   VERSION 69: YOUR HERO OPENS THE CRATE
   In the crate film (the seals) the hero who strikes the crate is now
   your own 3D hero: the same body, skin, gear and blade as in a run,
   seen from behind as it walks in, takes its stance, leaps and cuts with
   the recorded sword moves, and raises the blade when the crate bursts.
   Where 3D is off (or cannot run) the drawn hero stays. Display only.
   ===================================================================== */
const CrateHero = {
  on: false, rn: null, g: null, sk: '', last: 0, cut: 0,
  ok() { try { return typeof THREE !== 'undefined' && Mini.ok() && Models.ok('xbot') && !CALM && !(typeof Q !== 'undefined' && Q.lvl === 0); } catch (e) { return false; } },
  init() {
    if (this.rn) return true; const T = THREE;
    try { const cv = document.createElement('canvas'); cv.width = cv.height = 384; const rn = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
      rn.outputColorSpace = T.SRGBColorSpace; rn.toneMapping = T.ACESFilmicToneMapping; rn.setSize(384, 384, false); rn.setClearColor(0x000000, 0); this.rn = rn;
      const sc = new T.Scene(); this.scene = sc; sc.add(new T.HemisphereLight(0x9fb0ff, 0x201030, 1.5)); const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(1.2, 3, 2.5); sc.add(key);
      this.rim = new T.DirectionalLight(0xff4fd8, 2.4); this.rim.position.set(0, 2.5, -3); sc.add(this.rim); this.glow = new T.PointLight(0x00f2fe, 0, 5, 1.5); this.glow.position.set(0, 2.2, -1.2); sc.add(this.glow);
      const root = new T.Group(); root.rotation.x = -Math.PI / 2; const inner = new T.Group(); inner.scale.set(1 / 30, -1 / 30, 1 / 30); root.add(inner); sc.add(root); this.inner = inner;
      this.cam = new T.PerspectiveCamera(32, 1, .05, 30); this.cam.position.set(.55, 1.55, 4.4); this.cam.lookAt(0, 1.05, 0); return true; }
    catch (e) { errLog(e); this.dead = 1; return false; }
  },
  begin() {
    this.on = false; if (this.dead || !this.ok() || !this.init()) return;
    try { const sk = skinLook(Store.data.skin), body = sk.body || 'ninja';
      if (Human.HEAVY[body] && !Models.ok('soldier')) { Models.load('soldier'); return; }
      const key = (sk.id || '') + '|' + body + '|' + sk.a + '|' + sk.b + '|' + (Store.data.weapon || 'katana');
      if (this.sk !== key) { this.drop(); const g = Human.build({ body, a: sk.a, b: sk.b }, Store.data.weapon || 'katana'); if (g.pool) g.pool.visible = false; try { Look.dress(g); } catch (e) { errLog(e); } this.inner.add(g); this.g = g; this.sk = key; }
      this.g.mv = null; this.g.mvDash = false; this.last = 0; this.cut = 0; this.glow.color.set(sk.a); this.glow.intensity = 0; this.on = true; Models.load('melee');
    } catch (e) { errLog(e); this.on = false; }
  },
  drop() { if (!this.g) return; this.inner.remove(this.g); this.g.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); this.g = null; this.sk = ''; },
  /* one frame of the hero onto the film's canvas (in place of the drawn one) */
  draw(g, x, y, face, s, blade, dash, t, win, col) {
    const G3 = this.g; if (!G3) return false;
    const rd = this.last ? Math.min(.05, Math.max(0, t - this.last)) : .016; this.last = t;
    Human.anim(G3, { x: 0, y: 0, face, spd: dash ? 600 : 0, dashing: !!dash, alpha: 1, win: !!win, hp: 3 }, rd, t); G3.position.set(0, 0, 0);
    if (col) { this.glow.color.set(col); this.glow.intensity = win ? 6 : dash ? 3 : 1.2; this.rim.color.set(col); }
    this.rn.render(this.scene, this.cam);
    const Z = s * 100; g.drawImage(this.rn.domElement, x - Z / 2, y + s * 16 - Z * .82, Z, Z); return true;
  }
};
{
  const run9 = Seals.run.bind(Seals);
  Seals.run = function (res, done) { try { CrateHero.begin(); CrateHero.col = (RAR[res.r | 0] || {}).c; CrateHero.tOpen = Seals.plan(res.r | 0).dur - 1.7; } catch (e) { errLog(e); } return run9(res, () => { CrateHero.on = false; done(); }); };
  const hero9 = CrateFilm.hero.bind(CrateFilm);
  CrateFilm.hero = function (g, o, x, y, face, s, blade, dash, t) {
    if (CrateHero.on && document.querySelector('.cr-film')) { try { if (CrateHero.draw(g, x, y, face, s, blade, dash, t, t >= CrateHero.tOpen, CrateHero.col)) return; } catch (e) { errLog(e); CrateHero.on = false; } }
    return hero9(g, o, x, y, face, s, blade, dash, t);
  };
}
