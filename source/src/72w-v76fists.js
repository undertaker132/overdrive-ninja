/* =====================================================================
   VERSION 76: THE ONI KING'S FISTS
   In 3D, OTAKEMARU's fists were the same small glowing orbs every
   boss's parts use. They are now great armored fists: iron plates over
   red, a glowing cuff at the wrist and four burning knuckles. A fist
   rises high over its red circle while the slam winds up, drops, and
   squashes into the roof when it lands, then floats back to the king.
   Display only.
   ===================================================================== */
const OniFist = {
  build() {
    const T = THREE, g = new T.Group(), lift = new T.Group(); g.add(lift); g.lift = lift;
    const iron = R3.std({ color: 0x2a2f3a, metalness: .75, roughness: .35 }), red = R3.std({ color: 0x5a1010, metalness: .2, roughness: .6, emissive: new T.Color('#ff3b2f'), emissiveIntensity: .12 });
    const fist = new T.Group(); lift.add(fist); g.fist = fist;
    const box = (w, d, h, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, d, h), m); b.position.set(x, y, z); b.castShadow = true; fist.add(b); return b; };
    box(1.5, 1.3, 1.05, red, 0, 0, .55);                       // the fist
    box(1.6, 1.4, .3, iron, 0, 0, 1.12);                        // the iron plate on the back of the hand
    box(.45, 1.35, .7, iron, -.95, 0, .55);                     // the thumb guard
    const core = new T.Mesh(new T.TorusGeometry(.62, .16, 8, 20), R3.glow('#ff3b2f', 2.8)); core.position.set(.95, 0, .55); core.rotation.y = Math.PI / 2; fist.add(core); g.core = core; // the cuff (the generic code drives its glow)
    const kn = R3.glow('#ffb34d', 2.2); for (let i = 0; i < 4; i++) { const k = new T.Mesh(new T.BoxGeometry(.28, .26, .26), kn); k.position.set(-.62, -.48 + i * .32, 1.1); fist.add(k); }
    g.add(R3.pool('#ff3b2f', 3, .22)); return g;
  },
  tick() {
    const b = Boss.cur; if (!b || b.id !== 'otakemaru' || !R3.ok || !W3D.live) return; const t = performance.now() / 1000;
    b.parts.forEach((p, i) => { const E = R3.ents.get('bpotakemaru' + i), g = E && E.g; if (!g || !g.lift) return;
      let z = .8 + Math.sin(t * 1.6 + i) * .15, sq = 1, tilt = 0;
      if (p.st === 'tele') { const k = 1 - Math.max(0, p.t) / (p.d || 1); z = 1 + k * 2.6; tilt = -k * .6; }
      else if (p.st === 'down') { const k = Math.max(0, p.t) / 1.5; z = 0; sq = 1 - Math.min(.25, k * .3); tilt = .15; }
      else if (p.st === 'back') { z = .5; }
      g.lift.position.z = z; g.fist.scale.set(1 + (1 - sq) * .6, 1 + (1 - sq) * .6, sq); g.fist.rotation.y = tilt;
      g.rotation.z = Math.atan2(P.y - p.y, P.x - p.x) + Math.PI; });
  }
};
{
  const en6 = R3.ent.bind(R3);
  R3.ent = function (key, mk) { if (typeof key === 'string' && key.slice(0, 11) === 'bpotakemaru' && !CALM) return en6(key, () => OniFist.build()); return en6(key, mk); };
  Pipe.on('pre', 'onifist76', () => { try { OniFist.tick(); } catch (e) { errLog(e); } }, 53);
}
/* after a lost run, the hero on the results screen no longer just flinches and goes back to its stand: it holds a defeated pose,
   head down (the X Bot body's own recorded pose; the armored body, which has none, keeps the flinch). Back to normal when the screen changes. */
{
  const cl6 = Human.clip.bind(Human);
  Human.clip = function (r, n) { if (r && r.pose76 && n === 'idle' && r.acts[r.pose76]) return r.pose76; return cl6(r, n); };
  const or7 = UI.openResult.bind(UI);
  UI.openResult = function (o) { const res = or7(o);
    try { const won = G.state === 'CLEAR' || !!(o && o.stars && o.stars.some(Boolean)); setTimeout(() => { try { const h = Mini.g && Mini.g.human; if (h && UI.cur === 'result') h.r.pose76 = won ? null : 'sad_pose'; } catch (e) { errLog(e); } }, 700); } catch (e) { errLog(e); }
    return res; };
  const mt7 = Mini.mount.bind(Mini);
  Mini.mount = function (host) { try { const h = Mini.g && Mini.g.human; if (h && host !== 'result') h.r.pose76 = null; } catch (e) { errLog(e); } return mt7.apply(this, arguments); };
}
