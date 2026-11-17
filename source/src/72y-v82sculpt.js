/* ==========================================================================
   v82 · THE HERO'S BODY, SCULPTED. The classic hero stands on a stock
   mannequin: a round belly, a narrow chest, a thick neck. Its own mesh is
   reshaped once, in its rest pose, by how much each vertex belongs to each
   bone, so every clip, the face, the hair and the gear stay as they are:
   a flatter, narrower belly and waist, a broader chest, wider shoulders, a
   slimmer neck. (__oldBody82: a test switch for before/after captures.)
   Display only.
   ========================================================================== */
const C4 = (a, i, k) => k === 0 ? a.getX(i) : k === 1 ? a.getY(i) : k === 2 ? a.getZ(i) : a.getW(i); // (one component of a 4-wide attribute)
const Sculpt82 = {
  /* region -> [side scale, front scale, back scale] around the region's own centre */
  R: { Spine: [.72, .55, .82], Spine1: [.8, .66, .88], Hips: [.92, .82, .96], Spine2: [1.2, 1.1, 1], LeftShoulder: [1.14, 1, 1], RightShoulder: [1.14, 1, 1], Neck: [.8, .8, .8] },
  apply(gl) {
    if (!gl || gl.sculpt82 || window.__oldBody82) return; gl.sculpt82 = 1;
    gl.scene.traverse(m => {
      if (!m.isSkinnedMesh || !m.geometry) return; const g = m.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight; if (!pos || !si || !sw) return;
      const names = m.skeleton.bones.map(b => b.name.replace(/mixamorig:?/, '')), R = this.R, sum = {}, cnt = {};
      // the centre of each region (where its vertices mostly belong)
      for (let i = 0; i < pos.count; i++) { let bi = -1, bw = 0; for (let k = 0; k < 4; k++) { const w = C4(sw, i, k); if (w > bw) { bw = w; bi = C4(si, i, k); } } const n = names[bi]; if (!R[n]) continue;
        const s = sum[n] || (sum[n] = [0, 0, 0]); s[0] += pos.getX(i); s[1] += pos.getY(i); s[2] += pos.getZ(i); cnt[n] = (cnt[n] | 0) + 1; }
      const C = {}; for (const n in sum) C[n] = sum[n].map(v => v / cnt[n]);
      // each vertex moves by its weight on every region
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); let dx = 0, dz = 0;
        for (let k = 0; k < 4; k++) { const w = C4(sw, i, k); if (w <= 0) continue; const n = names[C4(si, i, k)], r = R[n], c = C[n]; if (!r || !c) continue;
          dx += w * (c[0] + (x - c[0]) * r[0] - x); const fz = z >= c[2] ? r[1] : r[2]; dz += w * (c[2] + (z - c[2]) * fz - z); }
        pos.setX(i, x + dx); pos.setZ(i, z + dz); }
      pos.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
    });
  }
};
{
  const hb = Human.build.bind(Human);
  Human.build = function (L, wid) { try { if (!CALM) Sculpt82.apply(Models.got.xbot); } catch (e) { errLog(e); } return hb(L, wid); };
}
