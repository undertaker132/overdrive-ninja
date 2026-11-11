/* ==========================================================================
   v80 · THE CLASSIC HEROES, SUITED. The game's own heroes keep their bodies,
   their gear and their colors, but stop looking like store mannequins:
   - the smooth body wears a tailored cyber suit: a dark matte weave, armor
     plates on the chest, the shoulders, the forearms, the thighs and the shins,
     neon seams in the skin's color along the plates, the arms and the legs,
     a belt with a lit buckle and an eye slit on the hood. All of it is drawn in
     the shader from the body's own rest pose, so it stays on the body in every
     clip, at every size, for free (one program for every skin).
   - the skeleton, the dragon and the slime bodies get their own patterns
     (ribs and a skull, scales, a glossy slime).
   - the armored body loses its beige army paint: its plates are repainted in
     the skin's colors, its stripes and its visor light up, its cloth goes dark.
   Display only; nothing in the simulation changes.
   ========================================================================== */
const Suit = {
  /* per body: [pattern, plate color, plate mix toward the skin color, plate metalness] (0 suit, 1 bones, 2 scales, 3 slime, 4 ghost) */
  KIND: { skull: [1], lich: [1], reaper: [1], pumpkin: [1], dragon: [2], goo: [3], yurei: [4], veil: [4],
    seraph: [0, '#efe6cc', .3, .7], idol: [0, '#f2e8f8', .25, .6], ronin: [0, '#3a2a1c', .12, .35], hunter: [0, '#33301f', .1, .4], yeti: [0, '#d8e4ee', .2, .3] },
  mats: new Map(),
  /* where the body is: the rest pose of the smooth body, in its own units (feet -100, head +100, front +z) */
  VERT: `
    vec3 sp80 = position * uSc80;
    vSuit80 = sp80;`,
  FRAG_HEAD: `
    varying vec3 vSuit80; uniform vec3 uA80; uniform vec3 uB80; uniform vec3 uS80; uniform vec3 uP80; uniform vec4 uK80; uniform vec4 uM80;
    float line80(float d, float w) { float f = fwidth(d) + 1e-4; return 1.0 - smoothstep(w - f, w + f, abs(d)); }`,
  /* the masks and the colors (after the base color) */
  FRAG_COLOR: `
    float plate80 = 0.0, bones80 = 0.0, scale80 = 0.0, belly80 = 0.0, glow80 = 0.0, buckle80 = 0.0, sock80 = 0.0; {
    vec3 sp = vSuit80; float ax = abs(sp.x), y = sp.y, z = sp.z;
    float isArm = step(18.0, ax) * step(46.0, y), isHead = step(68.0, y) * (1.0 - isArm), isLeg = step(y, 6.0), isTorso = (1.0 - isArm) * (1.0 - isHead) * (1.0 - isLeg);
    float armAng = atan(y - 59.3, z + 7.4), armR = length(vec2(y - 59.3, z + 7.4)); // (0: the front of the arm, +1.57: its top)
    float legAng = atan(ax - 9.07, z + 1.0); // (0: the front of the leg, +1.57: its outside)
    float front = step(0.0, z);
    // the plates, as distances inside them (positive inside)
    // (outside its region a plate is far away: -99)
    float dChest = mix(-99.0, min(min(14.5 - ax, y - (37.0 + ax * .6)), 61.5 - y), isTorso);
    float dPaul = mix(-99.0, min(min(ax - 14.0, 31.0 - ax), (armAng - .15) * max(armR, 1.0) + (31.0 - ax) * .15), step(14.0, ax) * step(50.0, y));
    float dFore = mix(-99.0, min(ax - 51.0, 74.0 - ax), isArm);
    float dThigh = mix(-99.0, min(min(y + 31.0, -3.0 - y), (1.15 - abs(legAng)) * 8.0), isLeg);
    float dShin = mix(-99.0, min(min(y + 86.0, -47.0 - y), (1.3 - abs(legAng)) * 6.5), isLeg);
    float dBelt = mix(-99.0, min(y - 9.0, 14.0 - y), isTorso);
    float dP = max(max(max(dChest, dPaul), max(dFore, dThigh)), dShin);
    float plate = step(0.0, dP) * uK80.x;
    float belt = step(0.0, dBelt);
    // the seams: inset trims on the plates, a spine and a sternum line, lines down the arms and the outside of the legs, cuffs, the collar
    float trim = plate * line80(dP - 1.2, .42);
    float seams = 0.0;
    seams = max(seams, isTorso * line80(ax, .38) * step(14.0, y) * step(y, 37.0 + ax * .6) * front);
    seams = max(seams, isTorso * line80(ax, .45) * (1.0 - front) * step(16.0, y) * step(y, 64.0));
    seams = max(seams, isArm * step(31.0, ax) * step(ax, 77.0) * line80((armAng - 1.57) * armR, .45) * (1.0 - step(0.0, dFore)));
    seams = max(seams, isLeg * line80((legAng - 1.57) * 7.0, .45) * step(-88.0, y) * (1.0 - step(0.0, dShin)) * (1.0 - step(0.0, dThigh)));
    seams = max(seams, isArm * line80(ax - 76.5, .5));
    seams = max(seams, isLeg * line80(y + 87.5, .5));
    seams = max(seams, isTorso * line80(y - 64.8, .45));
    seams *= uK80.x;
    float buckle = belt * step(ax, 3.2) * front * uK80.x;
    float groove = isTorso * front * step(ax, 10.0) * step(16.0, y) * step(y, 34.0) * line80(mod(y - 16.0, 6.0) - 3.0, .35) * uK80.x;
    // the hood: a lit eye slit, a dark mask under it
    float face = isHead * front * step(ax, 11.0) * step(.5, uM80.x) * step(uM80.x, 1.5);
    float slit = face * step(83.6, y) * step(y, 87.0 - ax * ax * .012) * step(3.0, z);
    float mask = face * step(y, 83.6) * step(73.0, y) * step(2.0, z);
    float band = isHead * uM80.z * step(88.4, y - z * .08) * step(y - z * .08, 90.8);
    float eyes = isHead * front * step(1.5, uM80.x) * step(3.0, z) * step(length(vec2((ax - 4.4) * .8, (y - 85.2) * 1.7 + (ax - 4.4) * .5)), 1.6);
    // the bones: ribs, a sternum, a spine, the long bones, a skull with sockets
    float bones = 0.0, sock = 0.0;
    if (uK80.y > .5) {
      float ribs = isTorso * step(33.0, y) * step(y, 60.0) * step(ax, 13.0) * step(1.6, mod(y - 33.0, 5.2)) * step(1.6, ax);
      float sternum = isTorso * front * step(ax, 1.6) * step(36.0, y) * step(y, 61.0);
      float spine = isTorso * (1.0 - front) * step(ax, 1.8) * step(mod(y, 4.2), 3.2) * step(8.0, y);
      float pelvis = isTorso * step(7.0, y) * step(y, 17.0) * step(3.0, ax) * step(ax, 12.0);
      float longb = (isArm * step(abs(armAng - 1.57), .45) + isLeg * step(abs(legAng), .4)) * (1.0 - step(0.0, dFore) * 0.0);
      float skull = isHead;
      sock = isHead * front * (step(length(vec2(ax - 4.3, y - 85.0)), 2.6) + step(length(vec2(ax, y - 80.5)), 1.1) * step(ax, 1.2));
      float teeth = isHead * front * step(75.0, y) * step(y, 78.0) * step(ax, 5.5) * step(.35, fract(sp.x * .45));
      bones = clamp(ribs + sternum + spine + pelvis + longb + skull, 0.0, 1.0) * (1.0 - sock) * (1.0 - teeth * .6);
    }
    // the scales: rows of rounded scales, a lighter belly
    float scale = 0.0, belly = 0.0;
    if (uK80.z > .5) {
      float row = floor(y * .16); vec2 q = vec2((sp.x * .8 + sp.z * .8) * .16 + row * .5, y * .16); vec2 f = fract(q) - vec2(.5, .0);
      scale = smoothstep(.72, .25, length(f * vec2(1.0, 1.15)));
      belly = isTorso * front * step(ax, 8.0 - max(0.0, y - 50.0) * .3) * step(9.0, y) * step(y, 60.0) * (1.0 - line80(mod(y - 9.0, 4.6) - 2.3, .3) * .8);
    }
    vec3 suit = uS80, plateC = uP80;
    vec3 col = mix(suit, plateC, plate);
    col = mix(col, suit * .55, belt * (1.0 - plate));
    col *= 1.0 - groove * .55;
    col = mix(col, vec3(.012, .013, .02), mask);
    col = mix(col, mix(suit, vec3(.78, .74, .64), .92), bones);
    col = mix(col, vec3(.004), sock);
    col = mix(col, col * (.55 + .7 * scale), uK80.z);
    col = mix(col, mix(uB80, vec3(.6), .35) * .7, belly);
    col = mix(col, uA80 * .09 + vec3(.003), uK80.w);
    float gh80 = 0.0;
    if (uM80.w > .5) { // (the ghost's kimono: a crossed collar, an obi, two lights for eyes)
      float collar = isTorso * front * line80(ax - (61.0 - y) * .32, .5) * step(36.0, y) * step(y, 63.0);
      float obi = isTorso * step(14.0, y) * step(y, 24.0);
      float ey = isHead * front * step(3.0, z) * step(length(vec2((ax - 4.2) * .9, (y - 84.6) * 1.6)), 1.5);
      col = mix(col, uB80 * .5 + vec3(.02), obi); col = mix(col, vec3(.02), ey);
      gh80 = collar * .9 + ey * 3.0 + obi * line80(y - 19.0, .5) * .8; }
    diffuseColor.rgb = col;
    diffuseColor.a *= mix(1.0, smoothstep(-98.0, -30.0, y), uM80.w); // (the ghost fades out below the knees)
    glow80 = max(trim * .9, seams) + slit * 2.4 + eyes * 2.6 + gh80; buckle += band * .7; plate80 = plate; bones80 = bones; scale80 = scale; belly80 = belly; buckle80 = buckle; sock80 = sock; }`,
  FRAG_PBR: `
    roughnessFactor = mix(mix(.74, .3, plate80), .45, bones80); roughnessFactor = mix(roughnessFactor, .12, uK80.w); roughnessFactor *= 1.0 - scale80 * uK80.z * .4;
    metalnessFactor = mix(mix(.12, uM80.y, plate80), .05, bones80); metalnessFactor = mix(metalnessFactor, .1, uK80.w);`,
  FRAG_EMIS: `
    totalEmissiveRadiance += uA80 * (glow80 * 1.7 + .025) + uB80 * buckle80 * 1.6 + uA80 * sock80 * 1.8 * uK80.y + uA80 * uK80.w * .1 + uA80 * belly80 * .08 + uA80 * uM80.w * .18;
    { float fr = 1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0); totalEmissiveRadiance += uA80 * pow(fr, 2.0) * (uK80.w * 1.1 + uM80.w * .9); } // (the slime and the ghost glow at their edges)
    { float rimK = 1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0); totalEmissiveRadiance += vec3(0.55, 0.8, 1.0) * pow(rimK, 4.0) * 0.4; }`,
  /* the material of one skin on the smooth body */
  mat(L, body, sc, band) {
    const K = this.KIND[body] || [0], key = body + '|' + L.a + '|' + L.b + '|' + sc + '|' + (band ? 1 : 0); let m = this.mats.get(key); if (m) return m;
    const T = THREE, A = new T.Color(L.a), B = new T.Color(L.b || L.a), kind = K[0];
    const S = kind === 4 ? new T.Color('#b8c6dc').lerp(A, .2) : kind === 3 ? new T.Color(L.a).multiplyScalar(.5) : new T.Color('#0c0f17').lerp(A, .055);
    const P = new T.Color(K[1] || '#262d3e').lerp(A, K[2] != null ? K[2] : .12);
    const bare = !(typeof FACE !== 'undefined' && FACE[body]) && !(typeof ANIME !== 'undefined' && ANIME[body]), paintHead = !bare ? 0 : kind === 0 ? 1 : kind === 1 ? 0 : 2;
    const U = { uA80: { value: A }, uB80: { value: B }, uS80: { value: S }, uP80: { value: P }, uSc80: { value: sc },
      uK80: { value: new T.Vector4(kind === 0 ? 1 : 0, kind === 1 ? 1 : 0, kind === 2 ? 1 : 0, kind === 3 ? 1 : 0) }, uM80: { value: new T.Vector4(paintHead, K[3] != null ? K[3] : .6, band && paintHead === 1 ? 1 : 0, kind === 4 ? 1 : 0) } };
    m = this.make(U, kind); this.mats.set(key, m); return m;
  },
  /* one suit material from its uniforms (its copies keep the shader: the bosses wear their own copies) */
  make(U, kind) {
    const T = THREE, m = new T.MeshStandardMaterial({ color: 0xffffff, roughness: .6, metalness: .2, side: T.DoubleSide, transparent: kind >= 3, opacity: kind === 3 ? .84 : 1 });
    m.emissive.set(0x000000); m.userData.rim57 = 1; m.userData.suit80 = 1; // (the rim light is in this shader already)
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vSuit80; uniform float uSc80;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>' + this.VERT);
      sh.fragmentShader = this.FRAG_HEAD + '\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>' + this.FRAG_COLOR)
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>' + this.FRAG_PBR).replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>' + this.FRAG_EMIS); };
    m.customProgramCacheKey = () => 'suit80';
    m.clone = () => { const U2 = {}; for (const k in U) U2[k] = { value: U[k].value && U[k].value.clone ? U[k].value.clone() : U[k].value }; const c = this.make(U2, kind); c.emissive.copy(m.emissive); c.emissiveIntensity = m.emissiveIntensity; return c; };
    return m;
  },
  /* the joints of the smooth body: dark flexible rings with a soft inner glow */
  jmats: new Map(),
  joint(L) { const k = L.a; let m = this.jmats.get(k); if (m) return m; const T = THREE;
    m = R3.std({ color: new T.Color('#06070b').lerp(new T.Color(L.a), .05), metalness: .15, roughness: .82 }); m.emissive = new T.Color(L.a); m.emissiveIntensity = .05; m.side = T.DoubleSide; this.jmats.set(k, m); return m; },
  /* the smooth body's units: the rest pose spans feet -100 .. head +100 */
  scaleOf(geo) { if (geo.userData.sc80) return geo.userData.sc80; if (!geo.boundingBox) geo.computeBoundingBox(); const h = Math.max(1e-6, geo.boundingBox.max.y); return (geo.userData.sc80 = 100 / h); },
  dressBot(g, L, body) {
    const hb = g.human && g.human.B && g.human.B.head, K = this.KIND[body] || [0], bare = !(typeof FACE !== 'undefined' && FACE[body]) && !(typeof ANIME !== 'undefined' && ANIME[body]); let band = false;
    if (hb && bare) hb.traverse(o => { if (!o.isMesh || !o.geometry || o.geometry.type !== 'BoxGeometry') return; const q = o.geometry.parameters;
      if (Math.abs(q.width - 2.2) < .01 && (Math.abs(q.height - 5.8) < .01 || Math.abs(q.height - 4.8) < .01)) o.visible = false; // (the old visor and mask: the suit paints the face)
      else if (Math.abs(q.width - 5) < .01 && Math.abs(q.height - .5) < .01) band = true; });
    g.traverse(m => { if (!m.isSkinnedMesh) return;
      if (/Joints/i.test(m.name) || m.material === g.trim) { m.material = K[0] >= 3 ? this.mat(L, body, this.scaleOf(m.geometry), band) : this.joint(L); return; } // (the slime and the ghost: one body, no joints)
      if (/Surface/i.test(m.name) || /Beta/i.test(m.name)) m.material = this.mat(L, body, this.scaleOf(m.geometry), band); });
  },
  /* ---------- the armored body: its atlas repainted ---------- */
  tex: new Map(),
  /* per body: plate color and how far toward the skin color (the armor), the trims */
  ARMOR: { knight: ['#cfd6e4', .45], shogun: ['#3a2c10', .45], chromesam: ['#a8b4c8', .25], sovereign: ['#ece4cf', .3], mecha: ['#3a4256', .35], exo: ['#2a303e', .15],
    viking: ['#3a3430', .12], rider: ['#16181f', .06], oni: ['#2a0c0c', .35], raijin: ['#1c1a30', .2], ashura: ['#240a10', .3] },
  paintArmor(img, L, body) {
    const key = body + '|' + L.a + '|' + L.b; let t = this.tex.get(key); if (t) return t;
    const T = THREE, N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N; const x = cv.getContext('2d'); x.drawImage(img, 0, 0, N, N);
    const d = x.getImageData(0, 0, N, N), a = d.data, ev = document.createElement('canvas'); ev.width = ev.height = N; const ex = ev.getContext('2d'), ed = ex.createImageData(N, N), e = ed.data;
    const mr = document.createElement('canvas'); mr.width = mr.height = N; const mx = mr.getContext('2d'), md = mx.createImageData(N, N), q = md.data;
    const hex = h => { const c = new T.Color(h); c.convertLinearToSRGB(); return [c.r * 255, c.g * 255, c.b * 255]; };
    const AR = this.ARMOR[body] || ['#262d3e', .15], plate = new T.Color(AR[0]).lerp(new T.Color(L.a), AR[1]), PL = hex(plate), A = hex(L.a), CL = hex(new T.Color('#0e1018').lerp(new T.Color(L.b || L.a), .1)), MT = hex(new T.Color('#5a6274').lerp(new T.Color(L.a), .15));
    for (let i = 0; i < a.length; i += 4) {
      const r = a[i] / 255, gg = a[i + 1] / 255, bb = a[i + 2] / 255, mxv = Math.max(r, gg, bb), mnv = Math.min(r, gg, bb), l = (mxv + mnv) / 2, s = mxv === mnv ? 0 : (mxv - mnv) / (1 - Math.abs(2 * l - 1));
      let h = 0; if (mxv !== mnv) { h = mxv === r ? ((gg - bb) / (mxv - mnv)) % 6 : mxv === gg ? (bb - r) / (mxv - mnv) + 2 : (r - gg) / (mxv - mnv) + 4; h *= 60; if (h < 0) h += 360; }
      let o, em = 0, rough = .7, metal = .1;
      if ((h < 12 || h > 345) && s > .45 && l > .2) { o = A; em = 1; rough = .3; metal = .2; } // (the red stripes: neon)
      else if (h >= 12 && h < 45 && s > .2 && l > .42) { const k = .55 + (l - .42) * 1.1; o = [PL[0] * k, PL[1] * k, PL[2] * k]; rough = .34; metal = .55; em = .06; } // (the beige plates: the armor, its wear kept as shade)
      else if (h >= 10 && h < 45 && s > .18 && l <= .42 && l > .12) { const k = .35 + l; o = [PL[0] * k, PL[1] * k, PL[2] * k]; rough = .45; metal = .45; } // (the scratches and the plate shadows)
      else if (h >= 45 && h < 120 && s > .12) { const k = .7 + l * .9; o = [CL[0] * k, CL[1] * k, CL[2] * k]; rough = .8; } // (the olive cloth: the dark suit)
      else if (s < .14 && l > .18) { const k = .5 + l * .8; o = [MT[0] * k, MT[1] * k, MT[2] * k]; rough = .35; metal = .65; em = .03; } // (the grey metal)
      else { const k = .8 + l * 2; o = [CL[0] * k * .8, CL[1] * k * .8, CL[2] * k * .8]; rough = .75; } // (the black cloth)
      a[i] = Math.min(255, o[0]); a[i + 1] = Math.min(255, o[1]); a[i + 2] = Math.min(255, o[2]);
      e[i] = em * A[0]; e[i + 1] = em * A[1]; e[i + 2] = em * A[2]; e[i + 3] = 255; q[i] = 0; q[i + 1] = rough * 255; q[i + 2] = metal * 255; q[i + 3] = 255;
    }
    x.putImageData(d, 0, 0); ex.putImageData(ed, 0, 0); mx.putImageData(md, 0, 0);
    const mk = (c, srgb) => { const tt = new T.CanvasTexture(c); tt.flipY = false; tt.colorSpace = srgb ? T.SRGBColorSpace : T.NoColorSpace; return tt; };
    t = { map: mk(cv, 1), emis: mk(ev, 1), mr: mk(mr, 0) }; this.tex.set(key, t); return t;
  },
  amats: new Map(),
  dressArmor(g, L, body) {
    g.traverse(m => { if (!m.isSkinnedMesh) return; const src = m.material; if (!src) return; // (only the armored body itself: the glow pool and the gear keep their own looks)
      if (/visor/i.test(m.name)) { const k = 'v' + L.a; let v = this.amats.get(k); if (!v) { v = R3.std({ color: new THREE.Color('#04050a'), metalness: .95, roughness: .08 }); v.emissive = new THREE.Color(L.a); v.emissiveIntensity = .32; v.side = THREE.DoubleSide; this.amats.set(k, v); } m.material = v; return; }
      const img = src.map && src.map.image; if (!img) return;
      const k = body + '|' + L.a + '|' + L.b; let am = this.amats.get(k);
      if (!am) { const t = this.paintArmor(img, L, body); am = new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emis, emissive: new THREE.Color(1.6, 1.6, 1.6), roughnessMap: t.mr, metalnessMap: t.mr, roughness: 1, metalness: 1, normalMap: src.normalMap || null, side: THREE.DoubleSide }); try { Look.rim(am); } catch (e) { errLog(e); } this.amats.set(k, am); }
      m.material = am; });
  },
  /* the old code-built head pieces that fight the armored body's own helmet */
  helm(g, L) {
    const hb = g.human && g.human.B && g.human.B.head; if (!hb) return;
    hb.traverse(o => { if (!o.isMesh || !o.geometry || o.geometry.type !== 'BoxGeometry') return; const q = o.geometry.parameters;
      if (q.width > 6 && q.height > 7) o.visible = false; // (the mecha's box helmet)
      else if (Math.abs(q.width - .6) < .01 && Math.abs(q.depth - 5) < .01 && o.material && o.material.isMeshBasicMaterial) { // (the shogun's crest: polished gold)
        const k = 'crest' + L.a; let c = this.amats.get(k); if (!c) { c = R3.std({ color: new THREE.Color(L.a).lerp(new THREE.Color('#ffd27a'), .5), metalness: 1, roughness: .2 }); c.emissive = new THREE.Color(L.a); c.emissiveIntensity = .25; this.amats.set(k, c); } o.material = c; } });
  },
  /* ---------- cloth: capes and flaps as draped sheets, scarves as ribbons, tails as one tapering body ---------- */
  sheet(w, len, kind) {
    const key = w + '|' + len + '|' + kind; this.geos = this.geos || new Map(); let gq = this.geos.get(key); if (gq) return gq;
    const T = THREE, nx = 12, nz = 8, pos = [], idx = [], wide = w >= 5.5, top = kind === 'cape2' ? .5 : 0, span = kind === 'cape2' ? .5 : 1;
    for (let j = 0; j <= nz; j++) { const tl = j / nz, t = top + tl * span; // (t: 0 at the shoulders, 1 at the hem)
      const hw = w / 2 * (wide ? .62 + .5 * Math.sqrt(t) : 1 - .25 * tl); // (gathered at the shoulders, flaring to the hem)
      for (let i = 0; i <= nx; i++) { const u = i / nx * 2 - 1, yv = u * hw, zv = len / 2 - tl * len;
        const xv = (wide ? .16 * w * u * u * (1 - t * .45) : 0) + Math.sin(u * Math.PI * (wide ? 3 : 1.5) + .4) * (wide ? .55 : .16) * Math.pow(t, .8) - (wide ? t * t * .8 : 0); pos.push(xv, yv, zv); } }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    gq = new T.BufferGeometry(); gq.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); gq.setIndex(idx); gq.computeVertexNormals(); gq.userData.shared = 1; this.geos.set(key, gq); return gq;
  },
  cloth(g) {
    const T = THREE, sw = (g.human && g.human.sway) || [], kinds = new Map(); for (const e of sw) kinds.set(e[0], e[1]);
    g.traverse(o => { if (!o.isMesh || !o.geometry || o.isSkinnedMesh) return; const q = o.geometry.parameters || {}, kind = kinds.get(o.parent);
      if (o.geometry.type === 'BoxGeometry' && Math.abs(q.width - .5) < .01 && q.depth > 2 && kind) { // (a flap: cape, cape2, loincloth, hair)
        o.geometry = this.sheet(q.height, q.depth, kind); o.userData.cloth80 = 1; if (o.material) o.material.side = T.DoubleSide; }
      else if (o.geometry.type === 'BoxGeometry' && Math.abs(q.width - 3.4) < .01 && Math.abs(q.depth - .9) < .01) { // (a scarf segment: a thin ribbon, overlapping the next)
        const k = 'rib' + q.height; this.geos = this.geos || new Map(); let gq = this.geos.get(k); if (!gq) { gq = new T.BoxGeometry(3.9, q.height, .2); gq.userData.shared = 1; this.geos.set(k, gq); } o.geometry = gq; o.userData.cloth80 = 1; o.userData.scarf80 = 1; }
      else if (o.geometry.type === 'SphereGeometry' && kind === 'tail') { // (a tail bead: a tapering capsule that meets the next one)
        const r = q.radius, k = 'tail' + r; this.geos = this.geos || new Map(); let gq = this.geos.get(k); if (!gq) { gq = new T.CapsuleGeometry(r * .92, 2.2, 4, 10).rotateZ(Math.PI / 2); gq.userData.shared = 1; this.geos.set(k, gq); }
        o.geometry = gq; o.scale.set(1, 1, 1); o.position.x = -1.5; o.userData.cloth80 = 1; } });
    // one tail is enough: the old spike goes where the body has a real tail
    if (sw.some(e => e[1] === 'tail')) g.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'ConeGeometry' && Math.abs(o.geometry.parameters.height - 10) < .01 && Math.abs(o.geometry.parameters.radius - 1.2) < .01) o.visible = false; });
    // the tip of each tail: a point
    for (const e of sw) if (e[1] === 'tail' && !e[0].children.some(c => c.userData.seg80 !== undefined && !c.isMesh)) { const seg = e[0]; if (seg.children.some(c => !c.isMesh)) continue; const m = seg.children.find(c => c.isMesh); if (!m || seg.userData.tip80) continue; seg.userData.tip80 = 1;
      const r = m.geometry.parameters ? m.geometry.parameters.radius : 1, tip = new T.Mesh(new T.ConeGeometry(r * .9, 3.4, 10).rotateZ(Math.PI / 2), m.material); tip.position.x = -1.5 - 1.1 - 1.7; tip.userData.cloth80 = 1; seg.add(tip); }
  },
  on() { return !CALM && !window.__noSuit80; } // (__noSuit80: a test switch for before/after captures)
};
{
  const hb = Human.build.bind(Human);
  Human.build = function (L, wid) {
    const g = hb(L, wid);
    try { if (g && !g.kay && g.human && g.human.r && Suit.on()) { const body = L.body || 'ninja'; if (g.human.r.base === 'xbot') Suit.dressBot(g, L, body); else if (g.human.r.base === 'soldier') { Suit.dressArmor(g, L, body); Suit.helm(g, L); } Suit.cloth(g); g.suit80 = 1; } } catch (e) { errLog(e); }
    return g;
  };
}
/* ---------- dash afterimages of the hero itself: its own pose, its gear and its blade, in light ---------- */
const Ghost80 = {
  src: null, list: [], nodes: null, t: 0,
  build(hg, col) {
    for (const q of this.list) { if (q.g.parent) q.g.parent.remove(q.g); q.mat.dispose(); } this.list = []; this.src = hg;
    const T = THREE, srcNodes = []; hg.traverse(o => srcNodes.push(o)); this.nodes = srcNodes;
    for (let i = 0; i < 3; i++) {
      const g = THREE_EX.SkeletonUtils.clone(hg), mat = new T.MeshBasicMaterial({ color: new T.Color(col), transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }), nodes = [];
      g.traverse(o => { nodes.push(o); if (o.isMesh) { if (o.userData.ink || o === hg.pool || (o.material && o.material.blending === T.AdditiveBlending)) o.visible = false; else { o.material = mat; o.castShadow = false; o.receiveShadow = false; } } });
      if (g.pool) g.pool.visible = false; g.visible = false; R3.root.add(g); this.list.push({ g, mat, nodes, t: 9 });
    }
    this.col = col;
  },
  /* the pose of the moment, copied node by node (the clone has the same tree) */
  stamp(q, hg) { const a = this.nodes, b = q.nodes, n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) { const s = a[i], d = b[i]; d.position.copy(s.position); d.quaternion.copy(s.quaternion); d.scale.copy(s.scale); if (i) d.visible = d.visible && s.visible; } q.g.position.copy(hg.position); q.g.quaternion.copy(hg.quaternion); q.g.scale.copy(hg.scale); },
  tick(hg, o, rd) {
    const col = o.ca || P.ca || '#00f2fe';
    if (this.src !== hg || !this.list.length || this.list[0].g.parent !== R3.root) this.build(hg, col);
    if (this.col !== col) { this.col = col; for (const q of this.list) q.mat.color.set(col); }
    if (o.dashing && !CALM) { this.t -= rd; if (this.t <= 0) { this.t = .045; let q = this.list[0]; for (const x of this.list) if (x.t > q.t) q = x; q.t = 0; this.stamp(q, hg); } }
    for (const q of this.list) { q.t += rd; const a = Math.max(0, 1 - q.t / .26); q.g.visible = a > .02; q.mat.opacity = .34 * a * a; }
  }
};
{
  const gt0 = R3.ghostTick.bind(R3);
  R3.ghostTick = function (hg, o, rd) {
    if (!hg || !hg.human || hg.kay || CALM || typeof THREE_EX === 'undefined') return gt0(hg, o, rd);
    try { if (this.gh) for (const q of this.gh) q.g.visible = false; Ghost80.tick(hg, o, rd); } catch (e) { errLog(e); return gt0(hg, o, rd); }
  };
}
Pipe.on('post', 'ghost80', () => { if (!Ghost80.list.length) return; const h = typeof R3 !== 'undefined' && R3.ents && R3.ents.get('hero'); if (!h || h.seen !== R3.frame || h.g !== Ghost80.src) for (const q of Ghost80.list) q.g.visible = false; }, 99);
{
  // cloth and tails draw no outline (a thin sheet would get a dark shell), but they keep their own materials for the bosses' flashes
  const ld0 = Look.dress.bind(Look);
  Look.dress = function (g) { const marked = []; if (g) g.traverse(o => { if (o.userData.cloth80 && !o.userData.ink) { o.userData.ink = 1; marked.push(o); } }); try { return ld0(g); } finally { for (const o of marked) o.userData.ink = 0; } };
}
/* ---------- the rival clan: the enemies that were bare shapes (a pyramid, a box, a capsule) are now suited fighters in their own colors ---------- */
const Clan80 = {
  T: null,
  init() { if (this.T) return; this.T = { [ET.MIMIC]: ['shinobi2', 'claws', 1.2, 0], [ET.MIRROR]: ['knight', 'katana', 1.1, 'shield'], [ET.MEDIC]: ['ninja', 'staff', 1.3, 'cross'], [ET.MINER]: ['mecha', 'drill', 1.15, 0], [ET.COURIER]: ['ninja', 'kunai', 1.05, 'crate'] }; },
  ok() { return !CALM && typeof THREE_EX !== 'undefined' && Models.ok('xbot') && !(typeof Q !== 'undefined' && Q.lvl === 0) && !(typeof Cast !== 'undefined' && Cast.on()); },
  pick(e) { this.init(); const D = this.T[e.type]; return D && this.ok() ? D : null; },
  /* a group on a bone, in the hero's own units and axes (x forward, y side, z up) */
  onBone(h, bone) { const T = THREE, grp = new T.Group(), ws = new T.Vector3(); h.updateMatrixWorld(true); bone.getWorldScale(ws); grp.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0))); grp.scale.setScalar(1 / ws.x); bone.add(grp); return grp; },
  extra(h, kind, col) {
    const T = THREE, B = h.human.B, glow = R3.glow(col, 2.4);
    if (kind === 'shield' && B.lHand) { const s = this.onBone(h, B.lHand); s.position.y = 2 / s.scale.x; const d = new T.Mesh(new T.CylinderGeometry(7, 7, .7, 6).rotateZ(Math.PI / 2), R3.M.mirror || R3.std({ color: 0xcfe6ff, metalness: 1, roughness: .05 })); d.position.set(1.5, -2, 0); s.add(d); const rim = new T.Mesh(new T.TorusGeometry(7, .45, 6, 6).rotateY(Math.PI / 2), glow); rim.position.copy(d.position); rim.rotation.x = Math.PI / 6; s.add(rim); }
    if (kind === 'cross') { const c = new T.Group(); c.position.z = 54; h.add(c); const m = R3.glow('#00ff88', 3); c.add(new T.Mesh(new T.BoxGeometry(1.4, 1.4, 6), m)); c.add(new T.Mesh(new T.BoxGeometry(1.4, 6, 1.4), m)); h.cross80 = c; }
    if (kind === 'crate' && B.spine2) { const s = this.onBone(h, B.spine2); const box = new T.Mesh(new T.BoxGeometry(7, 10, 9), R3.M.gold || R3.std({ color: 0xd8a830, metalness: .9, roughness: .3 })); box.position.set(-7, 0, 1); s.add(box); for (const z of [-2.5, 2.5]) { const st = new T.Mesh(new T.BoxGeometry(7.3, 10.3, .8), glow); st.position.set(-7, 0, 1 + z); s.add(st); } }
  }
};
{
  const ei0 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) {
    let D = null; try { D = Clan80.pick(e); } catch (er) { errLog(er); } if (!D) return ei0(e);
    try {
      const T = THREE, g = new T.Group(), col = e.col || '#ff3b5c', h = Human.build({ body: D[0], a: col, b: '#14141e' }, D[1]);
      if (h.pool) h.pool.visible = false; if (D[3]) Clan80.extra(h, D[3], col); h.traverse(o => { if (o.userData.scarf80) o.visible = false; }); // (no scarf: theirs would trail like the hero's)
      const own = new Map(), mats = []; h.traverse(o => { if (!o.isMesh || !o.material || !o.material.emissive) return; let c = own.get(o.material); if (!c) { c = o.material.clone(); c.userData.e0 = c.emissive.clone(); c.userData.i0 = c.emissiveIntensity; own.set(o.material, c); mats.push(c); } o.material = c; }); // (its own copies: a hit lights this one only)
      h.scale.setScalar(2.4 * D[2] / Human.H); g.add(h); g.clan80 = h; g.clanMats = mats; g.bodyMat = R3.std({ color: 0x000000 }); g.anim = [];
      g.add(this.pool(col, 1.6 * D[2], .22)); this.root.add(g); try { this.ring(e.x, e.y, col, (e.r || 14) * 3, .5); } catch (er) { errLog(er); }
      return g;
    } catch (er) { errLog(er); return ei0(e); }
  };
  const ae0 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) {
    if (!g.clan80) return ae0(g, e, t);
    const h = g.clan80, dt = Math.min(.05, Math.max(0, t - (g.t80 == null ? t : g.t80))); g.t80 = t;
    g.position.set(e.x, e.y, W3D.inLift(e)); g.rotation.z = e.ang != null ? e.ang : Math.atan2(P.y - e.y, P.x - e.x); g.scale.setScalar(Math.max(.01, (e.r || 14) * (e.scale == null ? 1 : e.scale)));
    if (g.lp && dt > 0) { const v = Math.hypot(e.x - g.lp[0], e.y - g.lp[1]) / dt; g.sp = (g.sp || 0) + (v - (g.sp || 0)) * Math.min(1, dt * 8); } g.lp = [e.x, e.y]; // (most enemies move by position: the speed is measured)
    const atk = e.st > 0 || (e.wcd > 0 && e.wcd < .25);
    try { Human.anim(h, { x: 0, y: 0, face: 0, spd: (g.sp || 0) * 1.6, dashing: atk, hp: e.hp, alpha: e.vis == null ? 1 : Math.max(.6, e.vis) }, dt, t); } catch (er) { errLog(er); }
    if (h.cross80) { h.cross80.rotation.z = t * 2; h.cross80.position.z = 54 + Math.sin(t * 3) * 1.5; }
    const fl = e.fl > .3; for (const m of g.clanMats) { if (fl) { m.emissive.setRGB(1, 1, 1); m.emissiveIntensity = 1; } else if (e.exec) { m.emissive.set('#ff2a4a'); m.emissiveIntensity = .5 + Math.sin(t * 14) * .4; } else { m.emissive.copy(m.userData.e0); m.emissiveIntensity = m.userData.i0; } }
  };
  Pipe.on('post', 'clan80', () => { if (typeof R3 !== 'undefined' && R3.ok && W3D.live && !CALM && !Models.got.xbot && !Models.failed.xbot) Models.load('xbot'); }, 99);
}
{
  // a loaded model's geometry belongs to every copy of it (the hero, the clan, the robots, the monsters): a dead enemy's cleanup no longer
  // throws it away, which made the next frame upload the whole body again
  const in0 = Models.inst.bind(Models);
  Models.inst = function (id) { const gl = this.got[id]; if (gl && !gl.shared80) { gl.shared80 = 1; gl.scene.traverse(o => { if (o.geometry) o.geometry.userData.shared = 1; }); } return in0.apply(this, arguments); };
}
Pipe.on('post', 'shared80', () => { for (const id in Models.got) { const gl = Models.got[id]; if (gl && gl.scene && !gl.shared80) { gl.shared80 = 1; gl.scene.traverse(o => { if (o.geometry) o.geometry.userData.shared = 1; }); } } }, 99);
/* ---------- the clan falls: a death clip made for the smooth and the armored bodies (they came without one) ---------- */
const Fall80 = {
  /* the idle pose of every bone, held, and on top of it: the hips tip back and drop, the spine curls, the head rolls back, the arms fly out, the knees give */
  clip(gl, idle) {
    if (gl.fall80) return gl.fall80; const T = THREE, D = .62, tracks = [], ease = [0, .18, .4, .62], k = [0, .35, .8, 1];
    const rot = (q0, ax, ang) => ease.map((tt, i) => q0.clone().multiply(new T.Quaternion().setFromAxisAngle(ax, ang * k[i])));
    const X = new T.Vector3(1, 0, 0), Z = new T.Vector3(0, 0, 1);
    for (const tr of idle.tracks) {
      const [node, prop] = tr.name.split('.'), n = node.replace(/^mixamorig:?/, ''), v = tr.values, sz = tr.getValueSize();
      if (prop === 'quaternion') { const q0 = new T.Quaternion(v[0], v[1], v[2], v[3]); let qs = null;
        if (n === 'Hips') qs = rot(q0, X, -1.35); else if (n === 'Spine' || n === 'Spine1') qs = rot(q0, X, .22); else if (n === 'Neck' || n === 'Head') qs = rot(q0, X, -.35);
        else if (n === 'LeftArm') qs = rot(q0, Z, .7); else if (n === 'RightArm') qs = rot(q0, Z, -.7); else if (n === 'LeftUpLeg' || n === 'RightUpLeg') qs = rot(q0, X, .45); else if (n === 'LeftLeg' || n === 'RightLeg') qs = rot(q0, X, -.6);
        const out = []; for (let i = 0; i < 4; i++) { const q = qs ? qs[i] : q0; out.push(q.x, q.y, q.z, q.w); } tracks.push(new T.QuaternionKeyframeTrack(tr.name, ease.map(x => x * D / .62), out)); }
      else if (prop === 'position' && n === 'Hips') { const p0 = new T.Vector3(v[0], v[1], v[2]), out = []; for (let i = 0; i < 4; i++) { out.push(p0.x, p0.y * (1 - .72 * k[i]), p0.z - Math.abs(p0.y) * .35 * k[i]); } tracks.push(new T.VectorKeyframeTrack(tr.name, ease.map(x => x * D / .62), out)); }
      else if (sz === 3 && prop !== 'scale') { tracks.push(new T.VectorKeyframeTrack(tr.name, [0], Array.from(v.slice(0, 3)))); }
    }
    return (gl.fall80 = new T.AnimationClip('Death', D, tracks));
  },
  give(h) { const r = h.human && h.human.r; if (!r || r.acts.Death) return r; const gl = Models.got[r.base]; if (!gl) return r; const idle = gl.animations.find(a => /^idle$/i.test(a.name)); if (!idle) return r;
    r.acts.Death = r.mixer.clipAction(this.clip(gl, idle)); return r; }
};
{
  const ei1 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) { const g = ei1(e); try { if (g && g.clan80) g.mon = Fall80.give(g.clan80); } catch (er) { errLog(er); } return g; };
}
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
