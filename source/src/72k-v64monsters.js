/* =====================================================================
   VERSION 64: MONSTERS — oni and demons of the cyber city
   Three more enemies are real animated models (Quaternius "Ultimate
   Monsters", CC0): the BRUTE is a hulking green orc, the VOID WRAITH a
   horned purple demon, the PHANTOM a red demon that glows ghostly cyan.
   They idle, walk, run, strike when they attack and flinch when hit, in
   each enemy's own colors. As with the robots: they load in the
   background and the built-in models stay until they arrive.
   ===================================================================== */
Object.assign(Models.src, { orc: 'models/orc.glb', bluedemon: 'models/bluedemon.glb', demon: 'models/demon.glb' });
const Monsters = {
  // enemy type -> [model, size, clips (idle, walk, run, strike, hit)]
  T: null,
  clips: { idle: 'Idle', walk: 'Walk', run: 'Run', hit: 'Punch', hurt: 'HitReact' },
  pick(e) { const m = this.T[e.type]; return m && Models.ok(m[0]) ? m : null; }
};
{
  Monsters.T = { [ET.BRUTE]: ['orc', 1.35], [ET.WRAITH]: ['bluedemon', 1.4], [ET.PHANTOM]: ['demon', 1.05] };
  // the built model per enemy copy (a skeleton cannot be shared): like the robots
  const ei3 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) {
    const m = Monsters.pick(e); if (!m || CALM) return ei3(e);
    const T = THREE, g = new T.Group(), wrap = new T.Group(), col = e.col || '#ff3b5c', r = Models.inst(m[0], col, .35, col);
    wrap.rotation.z = Math.PI / 2; g.add(wrap); r.o.rotation.x = Math.PI / 2; r.o.scale.setScalar(2.4 * m[1] / r.h); wrap.add(r.o);
    if (e.type === ET.PHANTOM) r.mats.forEach(mt => { mt.transparent = true; mt.opacity = .82; if (mt.emissive) { mt.emissive.set('#7df9ff'); mt.emissiveIntensity = .35; } });
    g.mon = r; g.bodyMat = r.mats.find(mt => mt.emissive) || r.mats[0]; g.anim = []; g.add(this.pool(col, 1.6 * m[1], .25)); Models.play(r, 'Idle', .01);
    this.root.add(g); try { this.ring(e.x, e.y, col, (e.r || 14) * 3, .5); } catch (er) { errLog(er); } return g;
  };
  const ae8 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) {
    if (!g.mon) return ae8(g, e, t);
    g.position.set(e.x, e.y, W3D.inLift(e)); g.rotation.z = e.ang != null && e.type !== ET.BRUTE ? e.ang : Math.atan2(P.y - e.y, P.x - e.x); g.scale.setScalar(Math.max(.01, (e.r || 14) * (e.scale == null ? 1 : e.scale)));
    const r = g.mon, sp = Math.hypot(e.vx || 0, e.vy || 0), dt = Math.min(.05, Math.max(0, t - (r.t || t))); r.t = t; const C = Monsters.clips;
    if (e.fl > .6 && r.cur !== C.hurt && !r.hurtT) { Models.play(r, C.hurt, .05, true); r.hurtT = .35; }
    if (r.hurtT > 0) r.hurtT -= dt; else { r.hurtT = 0; if (e.st > 0 || e.wcd > 0 && e.wcd < .25) Models.play(r, C.hit, .1, true); else Models.play(r, sp > 120 ? C.run : sp > 15 ? C.walk : C.idle, .25); }
    if ((r.cur === C.hit || r.cur === C.hurt) && r.acts[r.cur] && !r.acts[r.cur].isRunning()) r.cur = '';
    r.mixer.update(dt);
    const m = g.bodyMat, fl = e.fl > .3; if (m && m.emissive) { if (fl) { m.emissive.setRGB(1, 1, 1); m.emissiveIntensity = 1.2; } else if (e.exec) { m.emissive.set('#ff2a4a'); m.emissiveIntensity = .6 + Math.sin(t * 14) * .5; } else { m.emissive.set(e.type === ET.PHANTOM ? '#7df9ff' : (e.col || '#ff3b5c')); m.emissiveIntensity = e.type === ET.PHANTOM ? .35 : e.type === ET.WRAITH ? .3 : .12; } }
    if (e.type === ET.PHANTOM) r.mats.forEach(mt => { mt.opacity = .5 + Math.max(0, Math.min(1, e.vis == null ? 1 : e.vis)) * .35; });
  };
  Pipe.on('post', 'models64', () => { if (!R3.ok || !W3D.live) return; for (const id of ['orc', 'bluedemon', 'demon']) if (!Models.got[id] && !Models.failed[id]) Models.load(id); }, 99);
}
