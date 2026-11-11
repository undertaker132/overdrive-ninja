/* =====================================================================
   VERSION 80: THE NEW CAST
   Every hero, the swordsman bosses and the armored giants are now
   hand-made stylized characters (KayKit Character Packs: Adventurers and
   Skeletons, by Kay Lousberg, CC0) instead of a plain mannequin with
   parts glued on. Each skin picks the body that suits it (hooded
   shinobi, ronin, knight, berserker, mage, skeleton), wears the skin's
   own colors (the cloth, leather and trims are repainted, the metal
   stays steel, the bright trims glow), and the weapon sits in the hand
   the way the rig was made to hold it. Every motion is the character's
   own recorded animation: combat stances, sword combos for one-handed,
   two-handed and twin blades, punches and kicks, blocks, hits, a cheer
   and a fall. An option (Settings > Presentation > Character style):
   the game's own character designs stay the default. Display only.
   ===================================================================== */
for (const n of ['knight', 'barbarian', 'mage', 'rogue', 'rogue_hooded', 'skeleton_warrior', 'skeleton_minion', 'skeleton_mage', 'skeleton_rogue', 'anims']) Models.src['kk_' + n] = 'models/kk_' + n + '.glb';
const Cast = {
  H: 44, // the hero's height in game units
  BODY: { // every character a ninja of its own: [model, { hood: its own hood, hat: its helmet, add: parts worn from other characters, hide: its parts they replace, horn, ears, skin, glass, mask: 0 no mask }]
    ninja: ['rogue_hooded', { hood: 1 }], shinobi2: ['rogue_hooded', { hood: 1, add: ['mage:Mage_Cape'], hide: /Rogue_Cape/ }], netrunner: ['rogue_hooded', { hood: 1, hide: /Rogue_Cape/, add: ['knight:Knight_ArmLeft', 'knight:Knight_ArmRight'] }],
    tengu: ['rogue_hooded', { hood: 1, add: ['barbarian:Barbarian_Cape'], hide: /Rogue_Cape/, horn: 'dragon' }], reaper: ['rogue_hooded', { hood: 1, add: ['mage:Mage_Cape'], hide: /Rogue_Cape/ }], hunter: ['rogue_hooded', { hood: 1, add: ['barbarian:Barbarian_Cape'], hide: /Rogue_Cape/ }],
    stormkid: ['rogue_hooded', { hood: 1, add: ['mage:Mage_ArmLeft', 'mage:Mage_ArmRight'], hide: /Rogue_Arm/ }], witch: ['rogue_hooded', { hood: 1, add: ['mage:Mage_Cape', 'mage:Mage_Body'], hide: /Rogue_Cape|Rogue_Body/ }], veil: ['rogue_hooded', { hood: 1, add: ['mage:Mage_Body'], hide: /Rogue_Body/ }],
    dragon: ['rogue_hooded', { hood: 1, horn: 'dragon', add: ['knight:Knight_ArmLeft', 'knight:Knight_ArmRight'], hide: /Rogue_Arm/ }],
    kitsune: ['rogue', { ears: 'fox', add: ['mage:Mage_Cape'], hide: /Rogue_Cape/ }], neko: ['rogue', { ears: 'cat' }], foxsage: ['rogue', { ears: 'fox', add: ['mage:Mage_Body'], hide: /Rogue_Body/ }], wolf: ['rogue', { ears: 'wolf', add: ['barbarian:Barbarian_Cape'], hide: /Rogue_Cape/ }],
    idol: ['rogue', { add: ['knight:Knight_Cape'], hide: /Rogue_Cape/ }], ronin: ['rogue', { add: ['barbarian:Barbarian_Body', 'knight:Knight_Cape'], hide: /Rogue_Body|Rogue_Cape/ }], pixel: ['rogue', { add: ['knight:Knight_ArmLeft', 'knight:Knight_ArmRight'], hide: /Rogue_Arm/ }],
    blaze: ['rogue', { horn: 'oni', add: ['barbarian:Barbarian_Cape'], hide: /Rogue_Cape/ }], breather: ['rogue', { add: ['knight:Knight_Body'], hide: /Rogue_Body/ }], captain: ['rogue', { add: ['knight:Knight_Body', 'knight:Knight_Cape'], hide: /Rogue_Body|Rogue_Cape/ }], pumpkin: ['rogue_hooded', { hood: 1, skin: '#ff8a2a' }], seraph: ['rogue', { add: ['knight:Knight_Body', 'mage:Mage_Cape'], hide: /Rogue_Body|Rogue_Cape/ }],
    saiyan: ['barbarian', { add: ['rogue:Rogue_Head', 'knight:Knight_ArmLeft', 'knight:Knight_ArmRight'], hide: /Barbarian_Head|Barbarian_Arm|Barbarian_Hat/ }], viking: ['barbarian', { add: ['rogue:Rogue_Head'], hide: /Barbarian_Head|Barbarian_Hat/, horn: 'oni' }], yeti: ['barbarian', { skin: '#dfe8f2', add: ['rogue_hooded:Rogue_Head_Hooded'], hide: /Barbarian_Head|Barbarian_Hat/, hood: 1 }],
    oni: ['barbarian', { skin: '#c4402e', horn: 'oni', mask: 0 }], raijin: ['barbarian', { skin: '#5d7fd6', horn: 'oni', add: ['mage:Mage_Cape'], mask: 0 }], ashura: ['barbarian', { skin: '#b4365c', horn: 'oni', add: ['knight:Knight_Body'], hide: /Barbarian_Body/, mask: 0 }],
    knight: ['knight', { add: ['rogue_hooded:Rogue_Head_Hooded'], hide: /Knight_Head|Knight_Helmet/, hood: 1 }], mecha: ['knight', { add: ['rogue:Rogue_Head'], hide: /Knight_Head|Knight_Helmet|Knight_Cape/ }], shogun: ['knight', { add: ['rogue:Rogue_Head'], hide: /Knight_Head|Knight_Helmet|Knight_Cape/, horn: 'dragon' }], sovereign: ['knight', { add: ['rogue:Rogue_Head', 'mage:Mage_Cape'], hide: /Knight_Head|Knight_Helmet|Knight_Cape/ }],
    rider: ['knight', { add: ['rogue_hooded:Rogue_Head_Hooded'], hide: /Knight_Head|Knight_Helmet|Knight_Cape/, hood: 1 }], chromesam: ['knight', { add: ['rogue:Rogue_Head', 'rogue:Rogue_Cape'], hide: /Knight_Head|Knight_Helmet|Knight_Cape/ }], exo: ['knight', { add: ['rogue_hooded:Rogue_Head_Hooded', 'mage:Mage_Cape'], hide: /Knight_Head|Knight_Helmet|Knight_Cape/, hood: 1 }],
    skull: ['skeleton_rogue', { hat: 1, mask: 0 }], lich: ['skeleton_rogue', { hat: 1, add: ['mage:Mage_Cape'], mask: 0 }], yurei: ['skeleton_rogue', { hat: 1, mask: 0 }], goo: ['skeleton_minion', { glass: 1, mask: 0 }]
  },


  // weapon family -> [model it comes from, right hand mesh, left hand mesh]
  WPN: { blade: ['knight', '1H_Sword'], saber: ['knight', '1H_Sword'], long: ['knight', '2H_Sword'], dual: ['rogue_hooded', 'Knife', 'Knife_Offhand'], hammer: ['barbarian', '2H_Axe'], cleaver: ['barbarian', '2H_Axe'],
    pole: ['mage', '2H_Staff'], staff: ['mage', '2H_Staff'], glaive: ['mage', '2H_Staff'], scythe: ['barbarian', '2H_Axe'], drill: ['mage', '2H_Staff'], chain: ['rogue_hooded', 'Knife'], ring: ['rogue_hooded', 'Throwable'],
    fan: ['barbarian', '1H_Axe'], bow: ['rogue_hooded', '2H_Crossbow'], fists: null },
  STYLE: { // weapon family -> [combat idle, attacks in combo order]
    one: ['Idle_Combat', ['1H_Melee_Attack_Slice_Diagonal', '1H_Melee_Attack_Slice_Horizontal', '1H_Melee_Attack_Chop', '1H_Melee_Attack_Stab']],
    two: ['2H_Melee_Idle', ['2H_Melee_Attack_Slice', '2H_Melee_Attack_Chop', '2H_Melee_Attack_Spin', '2H_Melee_Attack_Stab']],
    dual: ['Idle_Combat', ['Dualwield_Melee_Attack_Slice', 'Dualwield_Melee_Attack_Chop', 'Dualwield_Melee_Attack_Stab']],
    fists: ['Unarmed_Idle', ['Unarmed_Melee_Attack_Punch_A', 'Unarmed_Melee_Attack_Punch_B', 'Unarmed_Melee_Attack_Kick']],
    bow: ['2H_Ranged_Aiming', ['2H_Ranged_Shoot']], ring: ['Idle_Combat', ['Throw', '1H_Melee_Attack_Slice_Diagonal']]
  },
  TWO: { long: 1, hammer: 1, cleaver: 1, pole: 1, staff: 1, glaive: 1, scythe: 1, drill: 1 },
  style(fam) { return fam === 'dual' ? 'dual' : fam === 'fists' ? 'fists' : fam === 'bow' ? 'bow' : fam === 'ring' ? 'ring' : this.TWO[fam] ? 'two' : 'one'; },
  on() { return typeof THREE_EX !== 'undefined' && !CALM && !!(Store.data && Store.data.settings && Store.data.settings.cast !== 0); }, // (an option: the game's own designs stay the default)
  body(b) { return this.BODY[b] || ['rogue_hooded']; },
  need(body, wid) { const sp = this.body(body), m = sp[0], f = R3.wfam(wid || 'katana'), w = this.WPN[f], add = ((sp[1] || {}).add || []).map(x => 'kk_' + x.split(':')[0]); return [...new Set(['kk_anims', 'kk_' + m].concat(w ? ['kk_' + w[0]] : [], add))]; },
  /* a part from another character on this one: a skinned piece is bound to this rig (all share one skeleton), a rigid one goes on the same bone */
  part(o, spec, mats, a, b, kind, opt) { const [mid, name] = spec.split(':'), gl = Models.got['kk_' + mid]; if (!gl) return; let s = null; gl.scene.traverse(x => { if (!s && x.isMesh && x.name === name) s = x; }); if (!s) return;
    const bones = {}; o.traverse(x => { if (x.isBone) bones[x.name] = x; }); let m;
    if (s.isSkinnedMesh) { m = new THREE.SkinnedMesh(s.geometry, s.material); const bs = s.skeleton.bones.map(bn => bones[bn.name]); if (bs.some(x => !x)) return; let host = null; o.traverse(x => { if (!host && x.isSkinnedMesh) host = x; }); (host ? host.parent : o).add(m); m.bind(new THREE.Skeleton(bs, s.skeleton.boneInverses.map(q => q.clone())), s.bindMatrix.clone()); }
    else { const bn = s.parent && bones[s.parent.name]; if (!bn) return; m = s.clone(); m.position.copy(s.position); m.quaternion.copy(s.quaternion); m.scale.copy(s.scale); bn.add(m); }
    let c = mats.get(m.material); if (!c) { c = this.mat(m.material, a, b, kind, opt.skin); mats.set(m.material, c); } m.material = c; m.castShadow = true; m.frustumCulled = false; m.userData.part80 = 1; },
  ready(body, wid) { if (!this.on()) return false; const n = this.need(body, wid); for (const id of n) if (!Models.ok(id)) { Models.load(id); return false; } return true; },
  failed(body, wid) { return this.need(body, wid).some(id => Models.failed[id]); },
  broke() { for (const k in Models.failed) if (k.indexOf('kk_') === 0) return true; return false; }, // (a cast file did not load: the old mannequin takes over)
  fall() { return Models.ok('xbot') || (this.on() && !this.broke()); }, // (some 3D hero can be drawn)
  /* ---------- the paint: the skin's colors on the character's own atlas ---------- */
  texC: new Map(),
  paint(img, a, b, kind, sk, boost) {
    const key = (img.__id || (img.__id = Math.random())) + '|' + a + '|' + b + '|' + kind + '|' + (sk || '') + '|' + (boost || 0); const MT = boost ? .55 : .3, AMB = boost ? .3 : .16; let hit = this.texC.get(key); if (hit) return hit;
    const T = THREE, W = img.width, H = img.height, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, W, H), px = d.data, e = document.createElement('canvas'); e.width = W; e.height = H; const ge = e.getContext('2d'), ed = ge.createImageData(W, H), ep = ed.data;
    // (the KayKit atlas, measured: skin h 18-28 s .8+ l .7-.86; bone and cream h 25-36 s .45-.62 l .65+; leather h 10-30 s .3-.55 l .35-.62;
    //  metal and cloth-gray s < .2; dyed cloth any other hue; the bright gem and glow swatches s .85+ in pure hues)
    const A = new T.Color(a), B = new T.Color(b), SK = sk ? new T.Color(sk) : null, DK = new T.Color('#0b0e1a'), SUIT = new T.Color('#121626').lerp(A, .14), STRAP = new T.Color('#120d16').lerp(B, .55), hsl = {}, tmp = new T.Color();
    for (let i = 0; i < px.length; i += 4) {
      tmp.setRGB(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255); tmp.getHSL(hsl); const h = hsl.h * 360, s = hsl.s, l = hsl.l; let glow = 0;
      const skin = h >= 8 && h <= 36 && s >= .6 && l >= .62 && l <= .9, bone = h >= 22 && h <= 40 && s >= .4 && s < .66 && l >= .64, leather = h >= 8 && h <= 32 && s >= .28 && s < .6 && l < .64;
      if (kind === 'glass') { tmp.copy(A).lerp(B, .25).multiplyScalar(.55 + l * .7); glow = l > .7 ? .5 : 0; }
      else if (skin && SK && kind !== 'weapon') { tmp.copy(SK).multiplyScalar(.55 + l * .6); } // (an oni's red skin, a storm god's blue)
      else if (skin || bone) { if (skin && kind !== 'weapon') { ep[i] = px[i] * .22; ep[i + 1] = px[i + 1] * .2; ep[i + 2] = px[i + 2] * .18; ep[i + 3] = 255; continue; } } // (faces, hands and bones keep their tones; skin keeps a faint warmth of its own under the neon lights)
      else if (s < .2) { // metal and gray cloth: steel with a cool cast; on a weapon the light steel glows in the skin's color
        tmp.setRGB(tmp.r * .88, tmp.g * .94, tmp.b * 1.08); if (kind === 'weapon' && l > .5) glow = .8 + (l - .5); else if (kind === 'body') tmp.lerp(new T.Color(A.r * l * 1.5, A.g * l * 1.5, A.b * l * 1.5), MT); } // (armor takes a tint of the skin's color: no two knights alike)
      else if (leather) tmp.copy(DK).lerp(STRAP, Math.min(1, l / .55)); // belts, boots, straps: the secondary color, dark
      else if (s > .85 && l > .35) { tmp.copy(A); glow = 1; } // gems, eyes and glow swatches: neon
      else { // dyed cloth: a dark suit in the main color, its light folds lit, the brightest trims glowing
        if (l < .3) tmp.copy(DK).lerp(SUIT, l / .3); else if (l < .62) tmp.copy(SUIT).lerp(A, (l - .3) / .32 * .22); else { tmp.copy(SUIT).lerp(A, .4 + Math.min(.5, (l - .62) / .25 * .5)); glow = .75; } } // (a ninja's suit: dark, its brightest trims in the skin's neon)
      px[i] = tmp.r * 255; px[i + 1] = tmp.g * 255; px[i + 2] = tmp.b * 255;
      if (glow) { const gc = kind === 'weapon' ? new T.Color(1, 1, 1) : A; ep[i] = gc.r * 255 * glow; ep[i + 1] = gc.g * 255 * glow; ep[i + 2] = gc.b * 255 * glow; } else if (kind !== 'weapon') { ep[i] = tmp.r * 255 * AMB; ep[i + 1] = tmp.g * 255 * AMB; ep[i + 2] = tmp.b * 255 * AMB; } ep[i + 3] = 255; // (a faint light of its own: the cast stays readable on a night roof)
    }
    g.putImageData(d, 0, 0); ge.putImageData(ed, 0, 0);
    const mk = cv => { const t = new T.CanvasTexture(cv); t.flipY = false; t.colorSpace = T.SRGBColorSpace; t.magFilter = T.NearestFilter; t.minFilter = T.LinearFilter; t.generateMipmaps = false; return t; };
    hit = { map: mk(c), emi: mk(e) }; this.texC.set(key, hit); return hit;
  },
  mat(src, a, b, kind, sk, boost) {
    const m = src.clone(); const img = src.map && src.map.image; if (!img) return m; const p = this.paint(img, a, b, kind, sk, boost); m.map = p.map; m.emissiveMap = p.emi; m.emissive = new THREE.Color(kind === 'weapon' ? a : '#ffffff'); m.emissiveIntensity = kind === 'weapon' ? 1.6 : 1.1;
    m.roughness = .62; m.metalness = .18; m.side = THREE.DoubleSide; if (kind === 'glass') { m.transparent = true; m.opacity = .78; m.depthWrite = false; } else try { Look.rim(m); } catch (e) { errLog(e); } /* (a rim of cool light on the edges: the silhouette reads on a dark roof) */ m.needsUpdate = true; return m;
  },
  bone(o, n) { const k = n.replace(/[^a-z0-9]/gi, ''); let b = null; o.traverse(x => { if (!b && x.isBone && x.name.replace(/[^a-z0-9]/gi, '') === k) b = x; }); return b; }, // (the loader strips the dots from bone names: handslot.r is handslotr)
  /* ---------- a character: { group (z-up, facing +x), mixer, clips } ---------- */
  build(L, wid) {
    const T = THREE, body = L.body || 'ninja', spec = this.body(body), opt = spec[1] || {}, gl = Models.got['kk_' + spec[0]], lib = Models.got.kk_anims, fam = R3.wfam(wid || 'katana');
    const g = new T.Group(), wrap = new T.Group(); wrap.rotation.z = Math.PI / 2; g.add(wrap);
    const o = THREE_EX.SkeletonUtils.clone(gl.scene); o.rotation.x = Math.PI / 2; wrap.add(o);
    const mats = new Map(), a = L.a || '#00f2fe', b = L.b || '#ff0844', kind = opt.glass ? 'glass' : 'body';
    o.traverse(m => { if (!m.isMesh) return; const par = m.parent && m.parent.name || '';
      if (/^handslot/.test(par)) { m.visible = false; return; } // (the character's own props: our weapon goes in the hand)
      if (/Hat$|Helmet$|_Hood$/.test(m.name) && !opt.hat) { m.visible = false; return; }
      if (opt.hide && opt.hide.test(m.name)) { m.visible = false; return; } // (a part this character wears from another one instead)
      let c = mats.get(m.material); if (!c) { c = this.mat(m.material, a, b, kind, opt.skin, L.boss); mats.set(m.material, c); } m.material = c; m.castShadow = true; m.frustumCulled = false; });
    for (const sp2 of opt.add || []) try { this.part(o, sp2, mats, a, b, kind, opt); } catch (e) { errLog(e); } // (this character's own mix of parts)
    // the weapon, from the model that carries it, into the rig's hand slots
    const W = this.WPN[fam], B = { hips: this.bone(o, 'hips'), spine: this.bone(o, 'spine'), spine2: this.bone(o, 'chest'), head: this.bone(o, 'head'), rHand: this.bone(o, 'handslot.r'), lHand: this.bone(o, 'handslot.l'), rArm: this.bone(o, 'upperarm.r') };
    let blade = null, blade2 = null, bmat = null; const wmats = new Map();
    if (W) { const src = Models.got['kk_' + W[0]].scene;
      const put = (name, slot) => { let s = null; src.traverse(x => { if (!s && x.isMesh && x.name === name) s = x; }); if (!s || !slot) return null; const m = s.clone(); m.visible = true;
        let c = wmats.get(s.material); if (!c) { c = this.mat(s.material, a, b, 'weapon'); wmats.set(s.material, c); } m.material = c; bmat = bmat || c; m.position.copy(s.position); m.quaternion.copy(s.quaternion); m.scale.copy(s.scale); slot.add(m); m.castShadow = true; return m; };
      // each weapon in a holder whose +x runs from the grip to the tip (the blade trail and the older effects read the blade that way)
      const hold = (m, slot) => { if (!m) return null; m.geometry.computeBoundingBox(); const bx = m.geometry.boundingBox, cs = [];
        for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) cs.push(new T.Vector3(x, y, z).applyMatrix4(m.matrix).sub(m.position));
        const sz = bx.getSize(new T.Vector3()), ax = sz.x >= sz.y && sz.x >= sz.z ? new T.Vector3(1, 0, 0) : sz.y >= sz.z ? new T.Vector3(0, 1, 0) : new T.Vector3(0, 0, 1);
        const c = bx.getCenter(new T.Vector3()); if (c.dot(ax) < 0) ax.negate(); ax.applyQuaternion(m.quaternion).normalize();
        const grp = new T.Group(); grp.position.copy(m.position); grp.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), ax); slot.add(grp); slot.updateMatrixWorld(true); grp.attach(m);
        grp.userData.tip = Math.max(...cs.map(v => v.dot(ax))); return grp; };
      blade = hold(put(W[1], B.rHand), B.rHand); if (W[2]) blade2 = hold(put(W[2], B.lHand), B.lHand); }
    try { this.extras(B.head, opt, a, b); } catch (e) { errLog(e); }
    // the size: measured in the idle pose, feet on the roof
    const r = { o, mixer: new T.AnimationMixer(o), acts: {}, cur: '', base: 'kk_' + spec[0] }; for (const c of lib.animations) r.acts[c.name] = r.mixer.clipAction(c);
    this.play(r, 'Idle', 0); r.mixer.update(0); g.updateMatrixWorld(true);
    const hd = this.bone(o, 'head'), ft = this.bone(o, 'foot.l'), hv = new T.Vector3(), fv = new T.Vector3(); hd.getWorldPosition(hv); ft.getWorldPosition(fv); g.worldToLocal(hv); g.worldToLocal(fv);
    const vb = new T.Box3(); o.traverse(m => { if (m.isMesh && m.visible && !(m.parent && /^handslot/.test(m.parent.name))) vb.expandByObject(m); }); const tall = vb.isEmpty() ? (hv.z - fv.z) * 2 : (vb.max.y - vb.min.y); /* (the visible body only: the hidden props would count otherwise) */
    const k = this.H / Math.max(1e-6, tall); o.scale.multiplyScalar(k); g.updateMatrixWorld(true); ft.getWorldPosition(fv); g.worldToLocal(fv); wrap.position.z = -fv.z + 1.1; g.updateMatrixWorld(true); // (head to foot, measured on the bones; the feet on the roof)
    g.add(R3.pool(a, 40, .34)); g.pool = g.children[g.children.length - 1];
    g.human = { r, B, sway: [], kay: 1, dum: { torso: new T.Group(), head: new T.Group(), sway: [] } };
    g.kay = { fam, style: this.style(fam), n: 0, t: 0, dash: false, hp: null, par: null, zan: null };
    g.blade = blade || new T.Group(); if (blade) g.tipX = blade.userData.tip; g.blade2 = blade2; g.bladeMat = R3.std({ color: 0x000000 }); g.trim = R3.std({ color: 0x000000 }); g.visor = { material: R3.std({ color: 0x000000 }) }; g.plate = R3.std({ color: 0x000000 }); g.s0 = 1; g.wfam = fam; /* (bladeMat is a stand-in: the run's color refresh writes to it, the weapon keeps its own paint) */
    g.kayMats = [...mats.values(), ...wmats.values()]; g.kayW = [...wmats.values()];
    return g;
  },
  /* horns and ears, cut in the same faceted style as the characters, on the head bone */
  extras(head, opt, a, b) {
    if (!head) return; const T = THREE;
    if (opt.mask !== 0) { // the ninja's cloth mask over the nose and mouth, and the headband with its tails
      const cl = new T.MeshStandardMaterial({ color: new T.Color('#10131e').lerp(new T.Color(b), .18), roughness: .85, metalness: 0, side: T.DoubleSide });
      const mk2 = (geo, m) => { const q = new T.Mesh(geo, m); q.castShadow = true; head.add(q); return q; };
      const mask = mk2(new T.CylinderGeometry(.55, .5, .2, 24, 1, true, -1.85, 3.7), cl); mask.position.set(0, .1, .04);
      if (!opt.hood) { const bandM = new T.MeshStandardMaterial({ color: new T.Color(a).multiplyScalar(.6), emissive: new T.Color(a), emissiveIntensity: .55, roughness: .5 });
        const band = mk2(new T.CylinderGeometry(.565, .565, .09, 28, 1, true), bandM); band.position.set(0, .56, 0);
        for (const s2 of [-1, 1]) { const tl = mk2(new T.BoxGeometry(.09, .04, .55), bandM); tl.position.set(s2 * .1, .52, -.78); tl.rotation.set(.55, s2 * .25, 0); } }
    }
    if (!(opt.horn || opt.ears)) return;
    const mk = (geo, col, emi) => { const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: col, roughness: .55, metalness: .1, emissive: new T.Color(emi || '#000000'), emissiveIntensity: emi ? .5 : 0, flatShading: true })); m.castShadow = true; head.add(m); return m; };
    for (const s of [-1, 1]) {
      if (opt.horn) { const dr = opt.horn === 'dragon', h = mk(new T.ConeGeometry(dr ? .1 : .13, dr ? .55 : .45, 6), dr ? '#e8e0c8' : '#f0e2c0', null); h.position.set(s * (dr ? .3 : .36), dr ? 1.02 : .98, dr ? -.12 : .05); h.rotation.set(dr ? -.7 : -.15, 0, -s * (dr ? .35 : .55)); }
      if (opt.ears) { const w = opt.ears === 'wolf' ? .2 : .16, e = mk(new T.ConeGeometry(w, opt.ears === 'fox' ? .42 : .32, 4), new T.Color(b).lerp(new T.Color('#202436'), .4), a); e.position.set(s * .33, opt.ears === 'wolf' ? 1.2 : 1.06, -.02); e.rotation.set(-.1, Math.PI / 4, -s * .3);
        const inner = mk(new T.ConeGeometry(w * .55, (opt.ears === 'fox' ? .42 : .32) * .7, 4), '#ffb0c8', null); inner.position.set(s * .33, (opt.ears === 'wolf' ? 1.2 : 1.06) - .04, .05); inner.rotation.copy(e.rotation); }
    }
  },
  play(r, name, fade, once, ts) {
    const a = r.acts[name]; if (!a) return false; if (r.cur === name && !once) return true; const prev = r.acts[r.cur];
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = !!once; a.setEffectiveTimeScale(ts || 1); a.setEffectiveWeight(1);
    if (fade > 0 && prev && prev !== a) { a.fadeIn(fade); prev.fadeOut(fade); } else { if (prev && prev !== a) prev.stop(); a.play(); }
    a.play(); r.cur = name; r.once = !!once; r.left = once ? a.getClip().duration / (ts || 1) : 0; return true;
  },
  isRunHero(g) { const E = R3.ents && R3.ents.get('hero'); return !!(E && E.g === g); },
  /* ---------- the motion ---------- */
  anim(g, o, rd, t) {
    const h = g.human, r = h.r, K = g.kay, S = this.STYLE[K.style], dt = Math.min(.05, Math.max(0, rd || 0));
    g.position.set(o.x || 0, o.y || 0, 0); g.rotation.z = o.face || 0; g.visible = o.alpha == null || o.alpha > .5;
    const sp = o.spd || 0, dash = !!o.dashing, run = this.isRunHero(g), fight = run && G.state === 'PLAY';
    if (r.left > 0) r.left -= dt;
    // the one-shot moves, most important first
    let shot = null;
    if (r.pose76 === 'sad_pose') shot = ['Death_A', 1, true, 'hold'];
    else if (g.mv && g.mv.k === 'win') shot = ['Cheer', 1, false];
    if (run) { if (K.par == null) { K.par = G.parries | 0; K.zan = G.zan | 0; }
      if ((G.parries | 0) > K.par) { this.play(r, 'Block_Hit', .06, true, 1.6); } K.par = G.parries | 0;
      if ((G.zan | 0) > K.zan) { this.play(r, '1H_Melee_Attack_Jump_Chop', .06, true, 1.5); } K.zan = G.zan | 0; }
    if (o.hp != null) { if (K.hp != null && o.hp < K.hp) this.play(r, 'Hit_A', .05, true, 1.4); K.hp = o.hp; }
    if (g.mv && g.mv.k === 'flinch' && !K.fl) { K.fl = 1; this.play(r, 'Hit_A', .05, true, 1.3); } if (!(g.mv && g.mv.k === 'flinch')) K.fl = 0;
    if (dash && !K.dash) { const L = S[1], n = K.t > 1.1 ? 0 : (K.n + 1) % L.length; K.n = n; this.play(r, L[n], .05, true, run ? 1.9 : 1.25); }
    K.dash = dash; K.t = dash ? 0 : K.t + dt;
    if (shot) { if (r.cur !== shot[0]) this.play(r, shot[0], .2, shot[3] === 'hold'); }
    else if (!(r.once && r.left > 0)) { // locomotion when no move is playing
      const forge = g === Mini.g && Mini.host === 'forge', want = dash ? 'Running_A' : sp > 260 ? 'Running_A' : sp > 30 ? 'Walking_A' : fight || forge || o.stance ? S[0] : 'Idle';
      // on the home screen the hero is never a statue: every few seconds it looks around, stretches or cheers
      K.idle = (K.idle == null ? 4 + Math.random() * 3 : K.idle) - dt;
      if (want === 'Idle' && g === Mini.g && K.idle <= 0) { K.idle = 6 + Math.random() * 5; const pick = ['Idle_B', 'Cheer', 'Idle_B', S[0] === 'Idle_Combat' ? '1H_Melee_Attack_Stab' : S[1][0]]; this.play(r, pick[(Math.random() * pick.length) | 0], .3, true, 1); }
      else if (r.cur !== want) this.play(r, want, .22); }
    r.mixer.update(dt * (dash && !r.once ? 1.5 : 1));
    const be = g.bladeMat && g.bladeMat.emissive; if (be && (be.r + be.g + be.b) > .05) for (const m of g.kayW) m.emissive.copy(be); // (the blade glows in the blade skin's color)
    if (g.pool) g.pool.material.opacity = (dash ? .5 : .32) + Math.sin(t * 4) * .04;
  }
};
{
  // the gear and the swing of the old mannequin hero do not apply to the new cast
  const hb0 = Human.build.bind(Human), ha0 = Human.anim.bind(Human);
  Human.build = function (L, wid) { if (Cast.ready(L.body || 'ninja', wid)) try { return Cast.build(L, wid); } catch (e) { errLog(e); } return hb0(L, wid); };
  Human.anim = function (g, o, rd, t) { if (g && g.kay) { try { Cast.anim(g, o, rd, t); } catch (e) { errLog(e); } return; } return ha0(g, o, rd, t); };
  const hbase = Human.base.bind(Human); Human.base = function (body) { return Cast.ready(body || 'ninja', (P.w && P.w.id) || Store.data.weapon) ? 'kk_' + Cast.body(body)[0] : hbase(body); };
  // in runs: the hero is built from the cast as soon as its models are in (the mannequin and its models are no longer loaded)
  const en0 = R3.ent.bind(R3);
  R3.ent = function (key, mk) {
    if (key !== 'hero' || !Cast.on()) return en0(key, mk);
    const body = (P.skin && P.skin.body) || 'ninja', wid = (P.w && P.w.id) || 'katana'; if (!Cast.ready(body, wid)) return en0(key, mk);
    const a = (W3D.ho && W3D.ho.ca) || P.ca || '#00f2fe', b = (W3D.ho && W3D.ho.cb) || P.cb || '#ff0844', sig = 'K' + body + '|' + wid + '|' + a + b, r0 = this.ents.get('hero');
    if (r0 && r0.sig !== sig) { this.root.remove(r0.g); this.ents.delete('hero'); }
    let rr = this.ents.get('hero'); if (!rr) { const g = Cast.build({ body, a, b }, wid); rr = { g, seen: 0, sig }; this.root.add(g); this.ents.set('hero', rr); try { g.scale.multiplyScalar(typeof Stage74 !== 'undefined' ? Stage74.HERO : 1); g.big74 = 1; } catch (e) { errLog(e); } }
    rr.seen = this.frame; rr.sig = sig; return rr.g;
  };
  const ah0 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) { if (g && g.kay) { if (this.ents.get('hero') && this.ents.get('hero').g === g) { o.hp = P.hp; o.win = G.state === 'CLEAR'; if (o.win && (!g.mv || g.mv.k !== 'win')) g.mv = { k: 'win', t: 0 }; } try { Cast.anim(g, o, rd, t); } catch (e) { errLog(e); } return; } return ah0(g, o, rd, t); };
  // the home screen, the Hero Forge and the results
  const bd0 = Mini.build.bind(Mini);
  Mini.build = function () {
    const L = this.look(); if (!Cast.ready(L.body, L.w)) return bd0();
    const sig = 'K' + L.body + L.a + L.b + L.w; if (sig === this.sig && this.g) return; this.sig = sig;
    if (this.g) this.inner.remove(this.g); const g = Cast.build(L, L.w); if (g.pool) g.pool.visible = false; this.g = g; this.inner.add(g);
    this.disc.material.color.set(L.a); this.fill.color.set(L.a); try { this.studio(); } catch (e) { errLog(e); }
  };
  // the portraits and the crate hero use the cast too (their caches know which body drew them)
  const pk0 = Portrait3D.key.bind(Portrait3D); Portrait3D.key = function (sk) { return pk0(sk) + (Cast.ready(sk.body || 'ninja', Store.data.weapon) ? '|kk' : ''); };
  Portrait3D.ok = function () { try { return typeof THREE !== 'undefined' && Mini.ok() && !CALM && Cast.fall(); } catch (e) { return false; } };
  CrateHero.ok = function () { try { return typeof THREE !== 'undefined' && Mini.ok() && !CALM && !(typeof Q !== 'undefined' && Q.lvl === 0) && Cast.fall(); } catch (e) { return false; } };
  const ch0 = CrateHero.begin.bind(CrateHero); CrateHero.begin = function () { if (!Cast.on()) return ch0.apply(this, arguments); const sk = skinLook(Store.data.skin); if (!Cast.ready(sk.body || 'ninja', Store.data.weapon)) { if (Cast.failed(sk.body || 'ninja', Store.data.weapon) && Models.ok('xbot')) return ch0.apply(this, arguments); this.on = false; return; } this.sk = this.sk && this.sk.indexOf('|kk') > 0 ? this.sk : ''; return ch0.apply(this, arguments); };
  // no more mannequin downloads: the cast replaces them (the old models stay only as a fallback where the cast cannot load)
  const ld0 = Models.load.bind(Models);
  Models.load = function (id) { if ((id === 'xbot' || id === 'soldier' || id === 'melee') && Cast.on() && !Cast.broke()) return; return ld0(id); };
  const preload = () => { if (!Cast.on()) return; const sk = skinLook(Store.data.skin) || {}; Cast.ready(sk.body || 'ninja', Store.data.weapon || 'katana'); };
  Pipe.on('post', 'cast80', () => { try { if (Cast.on() && Cast.broke() && Mini.raf && !Models.got.xbot && !Models.failed.xbot) Models.load('xbot'); preload(); if (R3.ok && W3D.live) Cast.ready((P.skin && P.skin.body) || 'ninja', (P.w && P.w.id) || 'katana'); if (Mini.g && !Mini.g.kay && Mini.raf) { const L = Mini.look(); if (Cast.ready(L.body, L.w)) Mini.sig = ''; } /* (only once the cast is in: rebuilding every frame while it loads, or where it cannot load, would thrash) */ } catch (e) { errLog(e); } }, 99);
  const mt0 = Mini.mount.bind(Mini); Mini.mount = function () { try { preload(); } catch (e) { errLog(e); } return mt0.apply(this, arguments); };
}
/* ---------- portraits of the new cast: head and shoulders, framed on the head bone, a warm key light so faces keep their color ---------- */
{
  const rd0 = Portrait3D.render.bind(Portrait3D);
  Portrait3D.render = function (q) {
    const sk = q.sk, body = sk.body || 'ninja', wid = (Store.data && Store.data.weapon) || 'katana';
    if (!Cast.on()) return rd0(q);
    if (!Cast.ready(body, wid)) { if (!Cast.failed(body, wid)) { this.queue.push(q); return; } if (Models.ok('xbot')) return rd0(q); if (!Models.failed.xbot) Models.load('xbot'); return; } // (the cast could not load: the old hero once it is in, the flat portrait meanwhile)
    const T = THREE, g = Cast.build({ body, a: sk.a, b: sk.b }, wid); if (g.pool) g.pool.visible = false; if (g.blade) g.blade.visible = false; if (g.blade2) g.blade2.visible = false;
    this.inner.add(g);
    try { const r = g.human.r; Cast.play(r, 'Idle', 0); r.mixer.update(.6); g.rotation.z = Math.PI / 2 + .3; this.scene.updateMatrixWorld(true); // (the whole scene: on the first portrait its parents had never been placed)
      const hb = Cast.bone(r.o, 'head'), hp = hb.getWorldPosition(new T.Vector3()); const vb = new T.Box3(); r.o.traverse(m => { if (m.isMesh && m.visible && !/Hat$|Helmet$/.test(m.name)) vb.expandByObject(m); });
      const hh = Math.max(.1, vb.max.y - hp.y), ctr = new T.Vector3(hp.x, hp.y + hh * .36, hp.z), span = hh * 1.42; // (head and shoulders: the head is the upper half of these bodies)
      const cam = this.cam, d = span / (2 * Math.tan(T.MathUtils.degToRad(cam.fov / 2))) * 1.05; cam.position.set(ctr.x + d * .18, ctr.y + span * .06, ctr.z + d); cam.lookAt(ctr);
      this.fill.color.set('#ffe6cc').lerp(new T.Color(sk.a), .35); this.rn.setClearColor(0x000000, 0); this.rn.render(this.scene, cam);
      const c = document.createElement('canvas'); c.width = c.height = 320; c.getContext('2d').drawImage(this.rn.domElement, 0, 0); this.cache.set(q.k, c);
    } catch (e) { errLog(e); }
    this.inner.remove(g); this.cam.position.set(.2, 1.36, 1.9); this.cam.lookAt(0, 1.27, 0);
    try { if (typeof UI !== 'undefined' && UI.cur && /arsenal|shop|crates|profile|me/.test(UI.cur)) this.refresh(); } catch (e) { errLog(e); }
  };
}
/* ---------- the swordsman bosses and the armored giants on the new cast ---------- */
const CastBoss = { // boss -> [body, weapon, second color, size]
  kage: ['ninja', 'katana', '#14141e', 1.05], renull: ['ninja', 'katana', '#ff0844', 1.05], izanami: ['lich', 'katana', '#14141e', 1.1],
  warden: ['knight', 'hammer', '#c8d4ff', 1.3], shogun: ['shogun', 'nodachi', '#ffd23f', 1.3], benkei: ['oni', 'spear', '#ff9a3d', 1.35], prime: ['mecha', 'cleaver', '#ff2a4a', 1.3], genesis: ['sovereign', 'scythe', '#ffd700', 1.45]
};
{
  const bm8 = R3.bossModel.bind(R3);
  R3.bossModel = function (b) {
    const D = CastBoss[b.id]; if (!D || Array.isArray(b.seg) || !Cast.ready(D[0], D[1])) { if (D) Cast.ready(D[0], D[1]); return bm8(b); }
    try { const T = THREE, g = new T.Group(), col = (BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844', h = Cast.build({ body: D[0], a: col, b: D[2], boss: 1 }, D[1]);
      if (h.pool) h.pool.visible = false; const k = D[3] / 9; h.scale.setScalar(k); h.s0 = k; g.add(h); g.ronin = h; g.kind = 'ronin';
      for (const m of h.kayMats) { m.userData.e0 = m.emissive.clone(); m.userData.i0 = m.emissiveIntensity; } g.bossMats = h.kayMats; g.bodyMat = R3.std({ color: 0x000000 });
      g.add(this.pool(col, 4.2, .32)); return g; } catch (e) { errLog(e); return bm8(b); }
  };
  Pipe.on('post', 'castboss80', () => { const b = Boss.cur, D = b && CastBoss[b.id]; if (D && R3.ok && W3D.live) Cast.ready(D[0], D[1]); }, 99);
}
/* ---------- the enemies that walk on two legs join the cast: skeletons rise out of the roof when they appear and fall apart when they die ---------- */
Object.assign(Cast.BODY, { e_minion: ['skeleton_minion'], e_mage: ['skeleton_mage', { hat: 1 }], e_rogue: ['skeleton_rogue', { hat: 1 }], e_warrior: ['skeleton_warrior', { hat: 1 }], e_shade: ['rogue_hooded'], e_thief: ['rogue'],
  boss_shogun: ['knight', { hat: 1, horn: 'dragon' }], boss_prime: ['barbarian', { horn: 'oni', skin: '#c89a2a' }], boss_genesis: ['skeleton_warrior', { hat: 1 }] });
Object.assign(CastBoss, { shogun: ['boss_shogun', 'nodachi', '#ffd23f', 1.3], prime: ['boss_prime', 'cleaver', '#ff2a4a', 1.35], genesis: ['boss_genesis', 'scythe', '#ffd700', 1.45] });
const CastFoe = {
  T: null, // enemy type -> [body, weapon, size, second color, skeleton]
  init() { if (this.T) return; this.T = { [ET.SPLITTER]: ['e_minion', 'katana', 1.15, '#1a1020', 1], [ET.MINI]: ['e_minion', 'kunai', 1.25, '#1a1020', 1], [ET.MEDIC]: ['e_mage', 'staff', 1.2, '#10201a', 1],
    [ET.MIMIC]: ['e_rogue', 'kunai', 1.15, '#1a0d20', 1], [ET.MINER]: ['e_warrior', 'hammer', 1.1, '#20160c', 1], [ET.MIRROR]: ['e_warrior', 'katana', 1.1, '#0c1626', 1],
    [ET.CLONE]: ['e_shade', 'katana', 1.15, '#ff0844', 0], [ET.COURIER]: ['e_thief', 'kunai', 1.1, '#3a2a08', 0] }; },
  pick(e) { this.init(); const D = this.T[e.type]; return D && Cast.ready(D[0], D[1]) ? D : null; }
};
{
  const ei8 = R3.enemyInst.bind(R3);
  R3.enemyInst = function (e) {
    const D = CastFoe.pick(e); if (!D || CALM) { if (CastFoe.T && CastFoe.T[e.type]) Cast.ready(CastFoe.T[e.type][0], CastFoe.T[e.type][1]); return ei8(e); }
    try { const T = THREE, g = new T.Group(), col = e.type === ET.CLONE ? '#2a2a3a' : e.type === ET.COURIER ? '#ffd700' : (e.col || '#ff3b5c'), h = Cast.build({ body: D[0], a: col, b: D[3], boss: 1 }, D[1]);
      if (h.pool) h.pool.visible = false; h.scale.setScalar(2.4 * D[2] / 44); g.add(h); g.cast = h; g.mon = h.human.r; const r = g.mon; r.acts.Death = r.acts[D[4] ? 'Death_C_Skeletons' : 'Death_A'] || r.acts.Death_A;
      for (const m of h.kayMats) { m.userData.e0 = m.emissive.clone(); m.userData.i0 = m.emissiveIntensity; } g.skel = D[4]; g.anim = []; g.bodyMat = R3.std({ color: 0x000000 });
      if (e.type === ET.MIRROR && Models.ok('kk_knight')) { let sh = null; Models.got.kk_knight.scene.traverse(x => { if (!sh && x.isMesh && x.name === 'Spike_Shield') sh = x; }); if (sh && h.human.B.lHand) { const m = sh.clone(); m.material = Cast.mat(sh.material, col, D[3], 'weapon'); h.human.B.lHand.add(m); } }
      this.root.add(g); try { this.ring(e.x, e.y, col, (e.r || 14) * 3, .5); } catch (er) { errLog(er); } return g; } catch (er) { errLog(er); return ei8(e); }
  };
  const ae9 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) {
    if (!g || !g.cast) return ae9(g, e, t);
    g.position.set(e.x, e.y, W3D.inLift(e)); g.rotation.z = e.ang != null && e.type !== ET.MIRROR ? e.ang : Math.atan2(P.y - e.y, P.x - e.x); g.scale.setScalar(Math.max(.01, (e.r || 14) * (e.scale == null ? 1 : e.scale)));
    const r = g.mon, m = g.mv8 || (g.mv8 = { x: e.x, y: e.y, t, v: 0 }), dt = Math.min(.05, Math.max(0, t - (r.t || t))); r.t = t;
    if (t - m.t > .001) { const v = Math.hypot(e.x - m.x, e.y - m.y) / (t - m.t); m.v += ((v > 2000 ? 0 : v) - m.v) * Math.min(1, (t - m.t) * 10); m.x = e.x; m.y = e.y; m.t = t; }
    if (r.left > 0) r.left -= dt;
    if (!g.born) { g.born = 1; if (g.skel) Cast.play(r, 'Spawn_Ground_Skeletons', 0, true, 1.6); }
    if (e.fl > .6 && !g.hurt8) { Cast.play(r, 'Hit_A', .05, true, 1.4); g.hurt8 = 1; } if (e.fl < .2) g.hurt8 = 0;
    const atk = e.st > 0 || (e.wcd > 0 && e.wcd < .25); if (atk && !g.atk8) Cast.play(r, e.type === ET.MEDIC ? 'Spellcast_Shoot' : g.skel ? '1H_Melee_Attack_Chop' : 'Dualwield_Melee_Attack_Slice', .06, true, 1.3); g.atk8 = atk;
    if (!(r.once && r.left > 0)) { const want = m.v > 140 ? 'Running_A' : m.v > 15 ? 'Walking_A' : (g.skel ? 'Idle_Combat' : 'Idle'); if (r.cur !== want) Cast.play(r, want, .2); }
    r.mixer.update(dt);
    const fl = e.fl > .3, col = e.exec ? '#ff2a4a' : null;
    for (const mt of g.cast.kayMats) { if (fl) { mt.emissive.set('#ffffff'); mt.emissiveIntensity = 2.2; } else if (col) { mt.emissive.set(col); mt.emissiveIntensity = 1.4 + Math.sin(t * 14) * .6; } else if (mt.userData.e0) { mt.emissive.copy(mt.userData.e0); mt.emissiveIntensity = mt.userData.i0; } }
    if (e.type === ET.CLONE || e.type === ET.PHANTOM) { const vis = Math.max(.15, Math.min(1, e.vis == null ? 1 : e.vis)); for (const mt of g.cast.kayMats) { mt.transparent = vis < .98; mt.opacity = vis; } }
  };
  Pipe.on('post', 'castfoe80', () => { if (!R3.ok || !W3D.live) return; CastFoe.init(); for (let i = 0; i < EN.n; i++) { const e = EN.a[i], D = e.alive && CastFoe.T[e.type]; if (D) Cast.ready(D[0], D[1]); } }, 99);
}
/* the option itself: Settings > Presentation > Character style (CLASSIC is the game's own designs, STYLIZED the new cast) */
{
  const ps8 = PC.settings.bind(PC);
  PC.settings = function (head, cycle, box, s) { ps8(head, cycle, box, s); head('CHARACTERS');
    cycle('Character style', 'cast', [0, 1], ['CLASSIC', 'STYLIZED'], () => { try { Mini.sig = ''; Portrait3D.cache.clear(); CrateHero.sk = ''; for (const [k, r] of [...R3.ents]) if (k === 'hero' || /^e\d/.test(k) || /^boss/.test(k)) { R3.root.remove(r.g); R3.ents.delete(k); } if (Cast.on()) { const sk = skinLook(Store.data.skin) || {}; Cast.ready(sk.body || 'ninja', Store.data.weapon || 'katana'); } } catch (e) { errLog(e); } });
    box.appendChild(el('div', 'small mute', lt('STYLIZED: hand-made stylized characters with their own recorded animations, in your skins\' colors. CLASSIC: the game\'s own designs.'))); };
}
