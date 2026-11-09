/* =====================================================================
   VERSION 56: REAL 3D MODELS
   The 3D view can now load real, artist-made models (glTF, with a
   skeleton and recorded animations) next to the ones built in code:
   · the BRUTE, ENFORCER, WARDEN and SNIPER are animated robots (walk,
     run, punch when they strike, a death fall), each in its own colors
   · the dog-family pets (KAYA, BUCHI, NEON TIGER, SPIRIT FOX, KOMAINU)
     are an animated fox: it looks around, walks and runs with you, in
     each pet's own fur color
   The files live next to the page (models/*.glb), load in the
   background after the game starts, and are kept for offline play. Until
   they arrive, or if they cannot load, the models built in code stay.
   Credits: robot by Tomás Laulhé (Quaternius), CC0; fox by PixelMannen
   (CC0), rigged and animated by tomkranis (CC BY 4.0), glTF by
   @AsoboStudio and @scurest (CC BY 4.0).
   ===================================================================== */
const Models = {
  src: { robot: 'models/robot.glb', fox: 'models/fox.glb' },
  got: {}, busy: {}, failed: {},
  ok(id) { return !!this.got[id]; },
  load(id) {
    if (this.got[id] || this.busy[id] || this.failed[id] || typeof THREE_EX === 'undefined') return;
    const desk = location.protocol === 'file:' && typeof window !== 'undefined' && window.odDesktop && typeof window.odDesktop.model === 'function'; // (the desktop app reads the files for the page)
    if (location.protocol === 'file:' && !desk) { this.failed[id] = 1; return; } // (opened from disk, or the desktop app: a browser cannot fetch files there, the built-in models stay)
    this.busy[id] = 1;
    const done = gl => { this.busy[id] = 0;
        gl.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; if (o.geometry) o.geometry.userData.shared = true; } });
        gl.scene.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(gl.scene), sz = bb.getSize(new THREE.Vector3()); gl.h = sz.y || 1; gl.len = Math.max(sz.x, sz.z) || 1;
        this.got[id] = gl; for (const [k, r] of [...R3.ents]) if (/^e\d/.test(k) || /^pet/.test(k)) { R3.root.remove(r.g); R3.ents.delete(k); } // (the next frame rebuilds them with the real model)
      }, fail = () => { this.busy[id] = 0; this.failed[id] = 1; }; // (no file next to the page: the built-in models stay)
    const L = new THREE_EX.GLTFLoader(), viaJson = () => fetch(this.src[id].replace(/\.glb$/, '.json')).then(r => r.ok ? r.json() : Promise.reject(r.status)) // (where .glb files are not served: the same model as base64 in JSON)
      .then(j => { const b = atob(j.b64), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); L.parse(u.buffer, '', done, fail); }).catch(fail);
    if (desk) { window.odDesktop.model(this.src[id].split('/').pop()).then(u => { const b = u instanceof ArrayBuffer ? u : u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength); L.parse(b, '', done, fail); }, fail); return; }
    try { L.load(this.src[id], done, undefined, viaJson); } catch (e) { fail(); }
  },
  /* one animated copy: its own skeleton, materials in the given colors, a mixer with every clip */
  inst(id, tint, k, emis) {
    const gl = this.got[id], T = THREE, o = THREE_EX.SkeletonUtils.clone(gl.scene), mats = new Map();
    o.traverse(m => { if (!m.isMesh) return; const src = m.material; let c = mats.get(src); if (!c) { c = src.clone(); if (tint && c.color) { const base = c.color.clone(); c.color.lerp(new T.Color(tint), k == null ? .65 : k); if (src.name === 'Black' || src.name === 'Grey') c.color.copy(base).lerp(new T.Color(tint), .15); }
        if (c.emissive) { c.emissive = new T.Color(emis || tint || '#000000'); c.emissiveIntensity = emis ? .12 : .05; } c.side = THREE.DoubleSide; c.metalness = Math.min(.6, (c.metalness || 0) + .2); c.roughness = Math.max(.3, (c.roughness == null ? .6 : c.roughness) - .15); mats.set(src, c); } m.material = c; });
    const mixer = new T.AnimationMixer(o), acts = {}; for (const a of gl.animations) acts[a.name] = mixer.clipAction(a);
    return { o, mixer, acts, mats: [...mats.values()], h: gl.h, len: gl.len };
  },
  play(r, name, fade, once) { const a = r.acts[name]; if (!a || r.cur === name) return; const prev = r.acts[r.cur];
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = !!once; a.fadeIn(fade || .2).play(); if (prev) prev.fadeOut(fade || .2); r.cur = name; }
};
{
  const ROBOT = { [ET.BRUTE]: 1.25, [ET.ENFORCER]: 1.5, [ET.WARDEN]: 1, [ET.SNIPER]: .95 };
  // start loading once the 3D view is up
  const tryLoad = () => { if (R3.ok && W3D.live) { Models.load('robot'); Models.load('fox'); } };
  Pipe.on('post', 'models56', () => { if (!Models.got.robot || !Models.got.fox) tryLoad(); }, 99);
  /* ---------- enemies ---------- */
  const em2 = R3.enemyModel.bind(R3);
  R3.enemyModel = function (e) {
    const k = ROBOT[e.type]; if (!k || !Models.ok('robot')) return em2(e);
    const T = THREE, g = new T.Group(), wrap = new T.Group(), col = e.col || '#ff3b5c', r = Models.inst('robot', col, .5, col);
    wrap.rotation.z = Math.PI / 2; g.add(wrap); r.o.rotation.x = Math.PI / 2; const s = 2.6 * k / r.h; r.o.scale.setScalar(s); wrap.add(r.o);
    g.rob = r; g.bodyMat = r.mats.find(m => m.emissive) || r.mats[0]; g.anim = []; g.add(this.pool(col, 1.6 * k, .25));
    if (e.type === ET.ENFORCER || e.type === ET.WARDEN) { const sh = this.part(new T.TorusGeometry(1.45 * k, .07, 8, 30, 1.9), this.glow(col, 2.6), 0, 0, 1.1 * k, g); sh.rotation.z = -.95; } // the front shield
    Models.play(r, 'Idle', .01); return g;
  };
  const ae7 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) {
    if (!g.rob) return ae7(g, e, t);
    g.position.set(e.x, e.y, W3D.inLift(e)); g.rotation.z = e.ang != null && e.type !== ET.BRUTE ? e.ang : Math.atan2(P.y - e.y, P.x - e.x); g.scale.setScalar(Math.max(.01, (e.r || 14) * (e.scale == null ? 1 : e.scale)));
    const r = g.rob, sp = Math.hypot(e.vx || 0, e.vy || 0), dt = Math.min(.05, Math.max(0, t - (r.t || t))); r.t = t;
    if (e.st > 0 || e.fuse > 0 || e.wcd > 0 && e.wcd < .25) Models.play(r, 'Punch', .1, true); else Models.play(r, sp > 120 ? 'Running' : sp > 15 ? 'Walking' : 'Idle', .25);
    if (r.cur === 'Punch' && !r.acts.Punch.isRunning()) r.cur = '';
    r.mixer.update(dt * (sp > 120 ? 1.2 : 1));
    const m = g.bodyMat, fl = e.fl > .3; if (m && m.emissive) { if (fl) { m.emissive.setRGB(1, 1, 1); m.emissiveIntensity = 1.4; } else if (e.exec) { m.emissive.set('#ff2a4a'); m.emissiveIntensity = .6 + Math.sin(t * 14) * .5; } else { m.emissive.set(e.al > 0 ? '#00f2fe' : (e.col || '#ff3b5c')); m.emissiveIntensity = .12; } }
  };
  /* ---------- pets ---------- */
  const DOG = { kaya: '#f2e6d0', buchi: '#8a6a4a', tiger: '#ff9a3d', fox: '#ff7a3a', komainu: '#e8c060' };
  const pm1 = R3.petModel.bind(R3);
  R3.petModel = function (id) {
    if (!DOG[id] || !Models.ok('fox')) return pm1(id);
    const T = THREE, g = new T.Group(), wrap = new T.Group(), pc = (PET_BY_ID[id] && PET_BY_ID[id].col) || '#ffd23f', r = Models.inst('fox', DOG[id], .55, pc);
    wrap.rotation.z = Math.PI / 2; g.add(wrap); r.o.rotation.x = Math.PI / 2; r.o.scale.setScalar(13 / r.len); wrap.add(r.o);
    if (id === 'komainu' || id === 'tiger') { const c = this.part(this.zUp(new T.TorusGeometry(1.6, .3, 6, 16)), this.glow(pc, 2), 3.8, 0, 6, g); c.rotation.y = .4; }
    g.fox = r; g.kind = 'dog'; g.anim = []; g.add(this.pool(pc, 18, .3)); g.scale.setScalar(2.1); Models.play(r, 'Survey', .01); return g;
  };
  const ap1 = R3.animPet.bind(R3);
  R3.animPet = function (g, t, moving) {
    if (!g.fox) return ap1(g, t, moving);
    const r = g.fox, dt = Math.min(.05, Math.max(0, t - (r.t || t))); r.t = t; const fast = moving && Math.hypot(P.vx, P.vy) > 300;
    Models.play(r, fast ? 'Run' : moving ? 'Walk' : 'Survey', .3); r.mixer.update(dt);
  };
}
{ // enemies are copied from one model per type: robots are built fresh (a skeleton cannot be shared), and every copy keeps its moving parts
  const ei2 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) {
    if ({ [ET.BRUTE]: 1, [ET.ENFORCER]: 1, [ET.WARDEN]: 1, [ET.SNIPER]: 1 }[e.type] && Models.ok('robot')) { const g = this.enemyModel(e); this.root.add(g); try { this.ring(e.x, e.y, e.col || '#ff3b5c', (e.r || 14) * 3, .5); } catch (er) { errLog(er); } return g; }
    const g = ei2(e);
    try { const key = e.type + '|' + (e.col || '') + '|' + (e.elite ? 1 : 0) + '|' + (e.aff | 0), p = this.protos && this.protos.get(key);
      if (p && (p.fx54 || p.limbs)) { const A = [], B = []; p.traverse(o => A.push(o)); g.traverse(o => B.push(o)); const map = new Map(A.map((o, i) => [o, B[i]]));
        if (p.fx54) g.fx54 = p.fx54.map(([o, k, a, b]) => [map.get(o) || o, k, a, b]); if (p.limbs) g.limbs = p.limbs.map(([a, l, s]) => [map.get(a), map.get(l), s]); } } catch (er) { errLog(er); }
    return g;
  };
}
{ // the merge that makes enemy models cheap must leave the moving parts alone
  const bk0 = R3.bake.bind(R3);
  R3.bake = function (g) { const keep = (g.fx54 || []).map(f => f[0]).concat((g.limbs || []).flatMap(l => [l[0], l[1]])); const a0 = g.anim; g.anim = (a0 || []).concat(keep.map(o => ['keep', o]));
    try { return bk0(g); } finally { g.anim = a0; } };
}
