/* v81 · the last bare-shape enemies get real builds, in the game's own code-built style (display only) */
/* ---------- the last bare shapes: the diver, the splitter, the treasure and the weaver get real builds (the elite marks stay) ---------- */
{
  const em0 = R3.enemyModel.bind(R3);
  R3.enemyModel = function (e) {
    const g = em0(e), t = e.type; if (CALM || !g) return g;
    try {
      const T = THREE, P0 = this.part.bind(this), col = e.col || '#ff3b5c', body = g.bodyMat, glow = this.glow(col, 2.6), M = this.M;
      const drop = test => { for (const c of [...g.children]) if (c.isMesh && c.geometry && test(c.geometry.type, c.geometry.parameters || {}, c)) g.remove(c); };
      if (t === ET.DIVER) { // a torpedo: a dark nose, a lit eye, four fins, an engine
        drop((ty, q) => ty === 'SphereGeometry' && (Math.abs(q.radius - .85) < .01 || Math.abs(q.radius - .3) < .01));
        P0(new T.CapsuleGeometry(.46, 1.1, 6, 16).rotateZ(Math.PI / 2), body, 0, 0, .9, g); P0(new T.ConeGeometry(.46, .75, 16).rotateZ(-Math.PI / 2), M.dark, 1.0, 0, .9, g);
        P0(new T.SphereGeometry(.17, 10, 8), glow, .78, 0, 1.18, g); P0(new T.TorusGeometry(.47, .05, 6, 20).rotateY(Math.PI / 2), glow, .45, 0, .9, g);
        for (let i = 0; i < 4; i++) { const f = new T.Group(); f.position.set(-.85, 0, .9); f.rotation.x = i * Math.PI / 2 + Math.PI / 4; g.add(f); P0(new T.BoxGeometry(.5, .06, .42), M.armor2 || M.dark, 0, 0, .42, f); }
        P0(new T.CylinderGeometry(.24, .32, .22, 14).rotateZ(Math.PI / 2), glow, -1.12, 0, .9, g);
      } else if (t === ET.SPLITTER) { // two armored halves pressed together around a lit seam, about to come apart
        drop((ty, q) => (ty === 'SphereGeometry' && Math.abs(q.radius - .68) < .01) || (ty === 'BoxGeometry' && Math.abs(q.depth - 1.2) < .01));
        for (const s of [-1, 1]) { const h = P0(new T.SphereGeometry(.7, 18, 14, 0, Math.PI), body, 0, s * .06, .82, g); h.rotation.x = s > 0 ? -Math.PI / 2 : Math.PI / 2; h.scale.set(1, 1, .82);
          P0(new T.TorusGeometry(.52, .07, 6, 22).rotateX(Math.PI / 2), M.armor || M.dark, 0, s * .4, .82, g); P0(new T.SphereGeometry(.11, 8, 8), glow, .6, s * .26, 1.02, g); }
        P0(new T.CylinderGeometry(.66, .66, .05, 24), glow, 0, 0, .82, g); // (a cylinder stands along y: the seam between the halves)
      } else if (t === ET.TREASURE) { // the coin gets a raised rim and a lit emblem on both faces
        const c = g.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry' && Math.abs((o.geometry.parameters || {}).radiusTop - 1) < .01);
        if (c) { const gold = this.gold80 || (this.gold80 = (() => { const m = R3.std({ color: new T.Color('#ffc936'), metalness: .55, roughness: .32 }); m.emissive = new T.Color('#ffb000'); m.emissiveIntensity = .22; return m; })()); c.material = gold; const rim = new T.Mesh(new T.TorusGeometry(1, .11, 8, 28), gold); c.add(rim); // (the coin's own axis is its local z; a bright gold that reads on the night roof)
          for (const s of [-1, 1]) { const em = new T.Mesh(new T.OctahedronGeometry(.45, 0), glow); em.scale.set(1, 1, .3); em.position.z = s * .16; c.add(em); } }
      } else if (t === ET.WEAVER) { // threads of light from the heart to its three nodes
        const thread = this.glow(col, 1.6); for (const a of g.anim) if (a[0] === 'orbit' && a[1]) { const o = a[1]; P0(new T.CylinderGeometry(.03, .03, 1.3, 4).rotateZ(Math.PI / 2), thread, .7, 0, 0, o); }
        P0(new T.TorusGeometry(1.15, .05, 6, 32), glow, 0, 0, 1.6, g);
      }
    } catch (er) { errLog(er); }
    return g;
  };
}
/* the other shape enemies keep their shapes and gain the parts that make them read: treads and a lamp, thrusters and a cargo crate, a framed mirror, a healer's halo, a mimic's mask */
{
  const em1 = R3.enemyModel.bind(R3);
  R3.enemyModel = function (e) {
    const g = em1(e), t = e.type; if (CALM || !g || g.heroCl) return g;
    try {
      const T = THREE, P0 = this.part.bind(this), col = e.col || '#ff3b5c', glow = this.glow(col, 2.6), M = this.M, dark = M.dark, metal = M.metal || dark;
      if (t === ET.MINER) { // a mining crawler: two treads, a lit cab window, a headlamp over the drill
        for (const s of [-1, 1]) { P0(new T.BoxGeometry(1.6, .34, .46), dark, -.05, s * .74, .24, g); for (let i = -1; i <= 1; i++) P0(new T.CylinderGeometry(.2, .2, .38, 12), metal, i * .52, s * .74, .24, g); }
        P0(new T.BoxGeometry(.08, .7, .32), glow, .71, 0, .82, g); P0(new T.CylinderGeometry(.13, .16, .14, 12).rotateZ(Math.PI / 2), M.white || glow, .72, 0, 1.12, g);
      } else if (t === ET.COURIER) { // a hover courier: twin thrusters, a strapped loot crate, running lights
        for (const s of [-1, 1]) { P0(new T.CylinderGeometry(.2, .26, .5, 12).rotateZ(Math.PI / 2), metal, -.9, s * .42, .8, g); P0(new T.CylinderGeometry(.17, .17, .06, 12).rotateZ(Math.PI / 2), glow, -1.17, s * .42, .8, g); P0(new T.BoxGeometry(.12, .12, .12), glow, .7, s * .5, .95, g); }
        P0(new T.BoxGeometry(.62, .62, .5), M.gold || metal, -.15, 0, 1.42, g); P0(new T.BoxGeometry(.66, .1, .54), dark, -.15, 0, 1.42, g);
      } else if (t === ET.MIRROR) { // the mirror in a lit hexagonal frame, on a base ring
        const p = g.anim && g.anim.find(a => a[0] === 'face'); if (p && p[1]) { const fr = new T.Mesh(new T.TorusGeometry(1.2, .07, 6, 6), glow); fr.rotation.set(0, 0, Math.PI / 6); p[1].add(fr); fr.rotation.x = Math.PI / 2; }
        P0(new T.TorusGeometry(.95, .06, 6, 28), glow, 0, 0, .06, g); for (let i = 0; i < 3; i++) { const a = i * TAU / 3; P0(new T.BoxGeometry(.14, .14, .5), metal, Math.cos(a) * .7, Math.sin(a) * .7, 1.05, g); }
      } else if (t === ET.MEDIC) { // a healer: a halo ring and a lower body of light
        P0(new T.TorusGeometry(.75, .05, 6, 28), this.glow('#00ff88', 2.4), 0, 0, 2.15, g); P0(new T.ConeGeometry(.5, .9, 8).rotateX(Math.PI / 2).rotateX(Math.PI), this.glow('#00ff88', 1.2), 0, 0, .75, g);
      } else if (t === ET.MIMIC) { // a mimic: a mask with a grin on its face, a collar of spikes
        const f = new T.Group(); f.position.set(.5, 0, 1.55); g.add(f); P0(new T.BoxGeometry(.06, .7, .5), M.white || glow, 0, 0, 0, f); P0(new T.BoxGeometry(.08, .42, .06), dark, .02, 0, -.12, f);
        for (let i = 0; i < 6; i++) { const a = i * TAU / 6, sp = P0(new T.ConeGeometry(.08, .32, 5), glow, Math.cos(a) * .55, Math.sin(a) * .55, 1.0, g); sp.rotation.set(Math.PI / 2, 0, a - Math.PI / 2); }
      }
    } catch (er) { errLog(er); }
    return g;
  };
}
