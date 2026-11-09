/* =====================================================================
   VERSION 63: REAL SWORD ANIMATIONS
   The human hero's cuts are now recorded sword animations (KayKit
   Character Animations by Kay Lousberg, CC0): a chop, a diagonal slice, a
   horizontal slice, a stab and a spinning cut, with dual-blade versions
   for twin weapons. They were made for another skeleton, so they are
   carried over to the hero's bodies here: each bone takes the same turn
   from its resting pose as the original did, frame by frame, once per
   body, when the game starts. Until they are ready (or if they cannot
   load) the keyed cuts of version 61 play. Display only.
   ===================================================================== */
Models.src.melee = 'models/melee.glb';
const Melee = {
  MAP: { hips: 'Hips', spine: 'Spine', chest: 'Spine2', head: 'Head', 'upperarm.l': 'LeftArm', 'lowerarm.l': 'LeftForeArm', 'wrist.l': 'LeftHand', 'upperarm.r': 'RightArm', 'lowerarm.r': 'RightForeArm', 'wrist.r': 'RightHand',
    'upperleg.l': 'LeftUpLeg', 'lowerleg.l': 'LeftLeg', 'foot.l': 'LeftFoot', 'upperleg.r': 'RightUpLeg', 'lowerleg.r': 'RightLeg', 'foot.r': 'RightFoot' },
  ONE: ['Melee_1H_Attack_Chop', 'Melee_1H_Attack_Slice_Diagonal', 'Melee_1H_Attack_Slice_Horizontal', 'Melee_1H_Attack_Stab', 'Melee_2H_Attack_Spin'],
  DUAL: ['Melee_Dualwield_Attack_Chop', 'Melee_Dualwield_Attack_Slice', 'Melee_Dualwield_Attack_Stab'],
  clips: {}, // base model id -> { name: AnimationClip }
  bone(root, name) { let b = null; root.traverse(x => { if (!b && x.isBone && x.name.replace(/[:.]/g, '') === name.replace(/[:.]/g, '')) b = x; }); return b; },
  tbone(root, n) { let b = null; root.traverse(x => { if (!b && x.isBone && x.name.replace(/[:]/g, '').endsWith(n) && !/Thumb|Index|Middle|Ring|Pinky/.test(x.name)) b = x; }); return b; },
  /* carry the clips over to one body (by the turn of each bone from its rest pose, in world space) */
  build(base) {
    if (this.clips[base] || !Models.ok('melee') || !Models.ok(base)) return this.clips[base];
    const T = THREE, src = THREE_EX.SkeletonUtils.clone(Models.got.melee.scene), tgt = THREE_EX.SkeletonUtils.clone(Models.got[base].scene);
    const pairs = []; for (const s in this.MAP) { const a = this.bone(src, s), b = this.tbone(tgt, this.MAP[s]); if (a && b) pairs.push([a, b]); }
    const depth = o => { let d = 0; while (o.parent) { d++; o = o.parent; } return d; }; pairs.sort((x, y) => depth(x[1]) - depth(y[1]));
    src.updateMatrixWorld(true); tgt.updateMatrixWorld(true);
    // facing: turn the source around if its toes point the other way
    const fw = (r, foot, toe) => { const f = new T.Vector3(), t = new T.Vector3(); foot.getWorldPosition(f); toe.getWorldPosition(t); return t.z - f.z; };
    const sf = fw(src, this.bone(src, 'foot.l'), this.bone(src, 'toes.l')), tf = fw(tgt, this.tbone(tgt, 'LeftFoot'), this.tbone(tgt, 'LeftToeBase'));
    if (sf * tf < 0) { src.rotation.y = Math.PI; src.updateMatrixWorld(true); }
    const rest = pairs.map(([a, b]) => [a.getWorldQuaternion(new T.Quaternion()), b.getWorldQuaternion(new T.Quaternion()), b.quaternion.clone()]);
    const mixer = new T.AnimationMixer(src), out = {}, q = new T.Quaternion(), pw = new T.Quaternion(), d = new T.Quaternion();
    for (const name of this.ONE.concat(this.DUAL)) {
      const clip = Models.got.melee.animations.find(c => c.name === name); if (!clip) continue;
      const act = mixer.clipAction(clip); act.reset().play(); const fps = 30, n = Math.max(2, Math.ceil(clip.duration * fps)), times = [], vals = pairs.map(() => []);
      for (let i = 0; i <= n; i++) { const t = Math.min(clip.duration, i / fps); mixer.setTime(t); src.updateMatrixWorld(true); times.push(t);
        pairs.forEach(([a, b], k) => b.quaternion.copy(rest[k][2])); tgt.updateMatrixWorld(true);
        pairs.forEach(([a, b], k) => { a.getWorldQuaternion(q); d.copy(q).multiply(rest[k][0].clone().invert()); // the bone's turn from rest
          const want = d.multiply(rest[k][1]); b.parent.getWorldQuaternion(pw); b.quaternion.copy(pw.invert().multiply(want)); b.updateMatrixWorld(true); vals[k].push(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w); }); }
      act.stop(); out[name] = new T.AnimationClip(name, clip.duration, pairs.map(([a, b], k) => new T.QuaternionKeyframeTrack(b.name + '.quaternion', times, vals[k])));
    }
    return (this.clips[base] = out);
  },
  /* the cuts on a hero instance: actions on its own mixer */
  arm(g) { const h = g.human; if (!h || h.melee) return !!h && !!h.melee; const C = this.build(h.r.base); if (!C) return false; h.melee = {}; for (const k in C) { const a = h.r.mixer.clipAction(C[k]); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false; h.melee[k] = a; } return true; }
};
{
  // on each dash: the next recorded cut, sped up to the dash, then back to the locomotion
  const ap1 = Moves.apply.bind(Moves);
  Moves.apply = function (g, o, rd) {
    if (!Melee.arm(g)) return ap1(g, o, rd);
    const h = g.human, dash = !!o.dashing, L = g.blade2 ? Melee.DUAL : Melee.ONE.slice(0, 4);
    if (dash && !g.mvDash) { const n = (g.mvT || 0) > 1.2 ? 0 : ((g.mvN || 0) + 1) % L.length; g.mvN = n; const a = h.melee[L[n]]; if (a) { if (h.cutA && h.cutA !== a) h.cutA.stop(); a.reset(); a.setEffectiveTimeScale(1.9); a.setEffectiveWeight(1); a.play(); h.cutA = a; h.cutT = a.getClip().duration / 1.9; } }
    g.mvDash = dash; g.mvT = dash ? 0 : (g.mvT || 0) + (rd || 0);
    const loco = h.r.acts[h.r.cur];
    if (h.cutA) { h.cutT -= rd || 0; const k = Math.max(0, Math.min(1, h.cutT / .12)); // (the locomotion steps back while the cut plays, and returns as it ends)
      h.cutA.setEffectiveWeight(k); if (loco) loco.setEffectiveWeight(Math.max(.08, 1 - k)); if (h.cutT <= 0) { h.cutA.stop(); h.cutA = null; if (loco) loco.setEffectiveWeight(1); } }
    // the flinch and the victory pose stay keyed
    if (o.hp != null) { if (g.mvHp != null && o.hp < g.mvHp) this.start(g, 'flinch'); g.mvHp = o.hp; }
    if (o.win && (!g.mv || g.mv.k !== 'win')) this.start(g, 'win');
    const m = g.mv; if (!m || (m.k !== 'flinch' && m.k !== 'win')) return; const M = this.M[m.k]; m.t += rd || 0; let u = m.t / M.d; if (u >= 1) { if (M.hold && o.win) u = 1; else { g.mv = null; return; } }
    const [raise, twist, bend] = M.f(Math.min(1, u)), B = h.B; if (B.rArm) B.rArm.rotateOnAxis(this.Y, raise); if (B.spine2) B.spine2.rotateY(twist); if (B.spine) B.spine.rotateX(bend);
  };
  // the cuts must play over the locomotion clip: the recorded clip mixer keeps running, the cut takes the arms and chest
  Pipe.on('post', 'models63', () => { if (Models.got.xbot && !Models.got.melee && !Models.failed.melee) Models.load('melee'); }, 99);
  const mt2 = Mini.mount.bind(Mini); Mini.mount = function () { const r = mt2.apply(this, arguments); if (r) Models.load('melee'); return r; };
}
