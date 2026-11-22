/* --- MODULE 3: v98 --- */
/* ==========================================================================
   OVERDRIVE: CYBER SLASH — VERSION 98.0 (AAA MASTERWORK OVERHAUL)
   1. BodyRework98   — Replaces old xbot/soldier mannequin with a brand-new
                       sculpted 3D Cyber-Anime Exo-Armor Body rigged to every
                       Mixamo bone (70+ skins, 4 archetypes, energy scarf)
   2. BossPure3D98   — Eliminates the Half-3D/Half-2D boss bug completely
                       (pure tactical telegraphs only in 3D + upgraded 3D
                       boss hulls, wings, cannons, cores & turret parts)
   3. HomeRedesign98 — Unifies all scattered floating title buttons into one
                       sleek in-flow Command Bar inside #s-title
   4. SmartHud98     — Strictly hides #dock outside active PLAY + adds Smart
                       Auto-Hide / Compact / Hidden modes ([B] to toggle),
                       hides PC hotkey bar by default, auto-fades run badge
   5. CrateCinema98  — Next-gen 3D/2D hybrid crate opening: orbital drop,
                       3-seal interactive cyber-slashes, Overclock Fake-Out,
                       85ms Anime Manga Impact Frame & 28-shard 3D shatter!
   ========================================================================== */
(function () {
  'use strict';

  try {
    if (typeof HE !== 'undefined') Object.assign(HE, {
      "v98.0 — CYBER-NINJA 3D BODY, PURE 3D BOSSES, CLEAN HOME & AAA CRATES": "v98.0 — גוף סייבר־נינג׳ה 3D חדש, בוסים 100% תלת־ממד, מסך בית נקי ותיבות AAA",
      "Brand-new sculpted 3D Cyber-Anime Exo-Body replaces the old mannequin across all 70+ skins (layered armor, visor helms, glowing sternum cores & energy scarves); Bosses are now 100% pure 3D with zero 2D body bleed-through and upgraded 3D models; Home Screen redesigned with a unified Command Bar; Ability Bar upgraded to Smart Auto-Hide [B]; and Crate Opening completely rebuilt with orbital drop, multi-slash seals, anime impact frame and 28-shard 3D shatter explosion.": "גוף סייבר־אנימה 3D חדש ומפוסל מחליף את הבובה הישנה בכל 70+ הדמויות (שריון שכבות, קסדות משקף, ליבת חזה זוהרת וצעיף אנרגיה); כל הבוסים תוקנו ל־100% תלת־ממד נקי בלי שום שאריות 2D ועם מודלים משודרגים; מסך הבית סודר מחדש עם סרגל פיקוד מאוחד; סרגל היכולות שודרג להסתרה חכמה [B]; ופתיחת התיבות נבנתה מחדש עם נפילת מסלול, 3 חותמות חיתוך, Impact Frame אנימה והתפוצצות ל־28 שברים תלת־ממדיים.",
      "VISUALS & HUD (v98)": "ויזואל, תיבות ו־HUD נקי (v98)",
      "New 3D Cyber-Anime Body": "גוף סייבר־אנימה 3D חדש",
      "Pure 3D Bosses (No 2D)": "בוסים 100% תלת־ממד (ללא 2D)",
      "Ability Bar Display": "תצוגת סרגל יכולות",
      "AAA Crate Cinema (v98)": "אנימציית תיבות AAA (v98)",
      "AUTO": "אוטומטי",
      "COMPACT": "קומפקטי",
      "HIDDEN": "מוסתר",
      "ALWAYS": "תמיד",
      "SLASH THE SEALS!": "חתוך את החותמות!",
      "SWIPE OR PRESS SPACE · 3 CUTS TO SHATTER": "החלק על המסך או לחץ רווח · 3 חיתוכים לשבירה",
      "OVERCLOCK BREAK!": "פריצת אוברקלוק!",
      "COLLECT REWARD": "אסוף פרס",
      "GRAPHICS": "גרפיקה",
      "GENERAL": "כללי",
      "RESET KEYS": "איפוס מקשים",
      "Calm / Reduced Flashes": "הפחתת הבזקים ואפקטים" 
    });
  } catch (e) {}

  const S98 = {
    val(k, defVal) {
      try {
        const s = Store && Store.data && Store.data.settings;
        if (!s || s[k] == null) return defVal;
        return s[k];
      } catch (e) { return defVal; }
    },
    on(k, defVal) { return !!this.val(k, defVal == null ? 1 : defVal); },
    isHe() { return typeof LANG !== 'undefined' && LANG.id === 'he'; },
    L(s) { return typeof lt === 'function' ? lt(s) : s; }
  };

  function mkMat98(hex, emHex, emInt, metal, rough, opacity) {
    const T = THREE;
    const isAnim = typeof S91 !== 'undefined' && S91.isAnime();
    if (emInt && emInt >= 1.5) {
      return new T.MeshBasicMaterial({
        color: new T.Color(emHex || hex),
        transparent: opacity != null && opacity < 1,
        opacity: opacity != null ? opacity : 1,
        side: T.DoubleSide
      });
    }
    if (isAnim && typeof AnimeToon91 !== 'undefined') {
      AnimeToon91.ensureAssets();
      return new T.MeshToonMaterial({
        color: new T.Color(hex),
        gradientMap: AnimeToon91.gradTex,
        emissive: new T.Color(emHex || '#000000'),
        emissiveIntensity: emInt || 0.2,
        transparent: opacity != null && opacity < 1,
        opacity: opacity != null ? opacity : 1
      });
    }
    return new T.MeshStandardMaterial({
      color: new T.Color(hex),
      emissive: new T.Color(emHex || '#000000'),
      emissiveIntensity: emInt || 0.18,
      metalness: metal != null ? metal : 0.72,
      roughness: rough != null ? rough : 0.28,
      transparent: opacity != null && opacity < 1,
      opacity: opacity != null ? opacity : 1
    });
  }

  function addInk98(mesh, thick) {
    try {
      if (typeof AnimeToon91 !== 'undefined' && typeof S91 !== 'undefined' && S91.isAnime() && mesh && mesh.isMesh && !(mesh.material && mesh.material.isMeshBasicMaterial)) {
        AnimeToon91.addOutline(mesh, thick || 1.075, AnimeToon91.inkBlack);
      }
    } catch (e) {}
  }

  /* ========================================================================
     1. BodyRework98 — BRAND-NEW SCULPTED 3D CYBER-ANIME EXO-BODY (ALL 70+ SKINS)
        Hides the generic xbot/soldier mannequin meshes while preserving 100%
        of the Mixamo/KayKit skeletal animation, and mounts a sculpted,
        layered cyber-ninja / anime armor rig directly onto every bone!
     ======================================================================== */
  const BodyRework98 = {
    ARCH_MAP: {
      heavy:  ['oni', 'exo', 'mecha', 'knight', 'viking', 'yeti', 'shogun', 'ashura', 'dragon'],
      arcane: ['seraph', 'lich', 'sovereign', 'yurei', 'raijin', 'tengu', 'witch'],
      master: ['ronin', 'chromesam', 'skull', 'blaze', 'pixel', 'goo', 'pumpkin']
    },
    getArch(body) {
      for (const k of Object.keys(this.ARCH_MAP)) if (this.ARCH_MAP[k].includes(body)) return k;
      return 'agile';
    },

    findBone(root, name) {
      let found = null;
      root.traverse(o => {
        if (!found && o.isBone && o.name.replace(/[:]/g, '').endsWith(name)) found = o;
      });
      return found;
    },

    // Mounts a sculpted armor limb cleanly along the exact bone->childBone vector!
    buildLimb(parentBone, childBone, rTop, rBot, mats, style) {
      if (!parentBone || !childBone) return null;
      const T = THREE;
      const dir = childBone.position.clone();
      const len = dir.length();
      if (len < 1e-3) return null;

      const grp = new T.Group();
      grp.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
      parentBone.add(grp);

      // Sleek carbon undersuit core
      const under = new T.Mesh(new T.CylinderGeometry(rBot * 0.84, rTop * 0.84, len * 0.96, 8), mats.under);
      under.position.y = len * 0.5;
      under.castShadow = true;
      grp.add(under);

      // Faceted outer armor shell (6-sided cyber bevel)
      const shell = new T.Mesh(new T.CylinderGeometry(rBot * 1.06, rTop * 1.12, len * 0.68, 6), mats.armor);
      shell.position.y = len * 0.52;
      shell.castShadow = true;
      grp.add(shell);
      addInk98(shell, 1.07);

      // Glowing cyber energy seam ring at joint
      const ring = new T.Mesh(new T.TorusGeometry(rTop * 0.98, Math.max(0.45, rTop * 0.14), 6, 12), mats.glowA);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = len * 0.16;
      grp.add(ring);

      if (style === 'forearm') {
        // Flared cyber gauntlet cuff + neon blade fin
        const cuff = new T.Mesh(new T.BoxGeometry(rBot * 2.25, len * 0.42, rBot * 2.25), mats.trim);
        cuff.position.y = len * 0.72;
        grp.add(cuff);
        addInk98(cuff, 1.06);
        const strip = new T.Mesh(new T.BoxGeometry(rBot * 0.45, len * 0.58, rBot * 2.55), mats.glowA);
        strip.position.y = len * 0.6;
        grp.add(strip);
      } else if (style === 'shin') {
        // Sharp polygonal kneepad + armored cyber greave + fin
        const knee = new T.Mesh(new T.OctahedronGeometry(rTop * 1.12, 0), mats.trim);
        knee.scale.set(0.95, 1.25, 1.1);
        knee.position.set(0, len * 0.08, rTop * 0.68);
        grp.add(knee);
        addInk98(knee, 1.07);
        const vent = new T.Mesh(new T.BoxGeometry(rBot * 0.4, len * 0.55, rBot * 2.45), mats.glowB);
        vent.position.y = len * 0.54;
        grp.add(vent);
      } else if (style === 'thigh') {
        const plate = new T.Mesh(new T.BoxGeometry(rTop * 2.1, len * 0.45, rTop * 1.7), mats.trim);
        plate.position.set(0, len * 0.42, rTop * 0.25);
        grp.add(plate);
        addInk98(plate, 1.06);
      }
      return grp;
    },

    dressHuman(g, L) {
      if (!S98.on('body98', true) || !g || !g.human || !g.human.r || !g.human.r.o || typeof THREE === 'undefined' || g._body98Done) return g;
      g._body98Done = 1;
      try {
        const T = THREE;
        const root = g.human.r.o;
        const body = (L && L.body) || 'ninja';
        const arch = this.getArch(body);
        const ca = (L && L.a) || '#00f2fe';
        const cb = (L && L.b) || '#ff0844';
        const hasFace = typeof FACE !== 'undefined' && !!FACE[body];

        // 1. Hide ugly xbot / soldier mannequin SkinnedMeshes (skeleton keeps animating 100%!)
        root.traverse(o => {
          if (o.isSkinnedMesh || (o.isMesh && !o.userData._v98 && o.parent === root)) {
            o.visible = false;
          }
        });

        // 2. Sculpted Cyber-Anime Material Palette tailored to skin colors
        const baseCol = new T.Color('#13192c').lerp(new T.Color(ca), 0.24);
        const trimCol = new T.Color('#1c2440').lerp(new T.Color(cb), 0.48);
        const mats = {
          under: mkMat98('#0a0d1a', ca, 0.08, 0.45, 0.62),
          armor: mkMat98(baseCol, ca, 0.22, 0.78, 0.26),
          trim:  mkMat98(trimCol, cb, 0.32, 0.72, 0.28),
          glowA: mkMat98(ca, ca, 2.3, 0.1, 0.2),
          glowB: mkMat98(cb, cb, 2.0, 0.1, 0.2),
          gold:  mkMat98('#ffd700', '#ffb020', 0.55, 0.85, 0.22)
        };
        // Connect g.plate & g.visor to real armor materials so Overdrive / hit-flash light up the suit!
        g.plate = mats.armor;
        g.visor = { material: mats.glowA };

        const bulk = arch === 'heavy' ? 1.24 : arch === 'master' ? 1.1 : arch === 'arcane' ? 0.98 : 0.94;
        const bHips   = this.findBone(root, 'Hips');
        const bSpine  = this.findBone(root, 'Spine');
        const bSpine1 = this.findBone(root, 'Spine1');
        const bSpine2 = this.findBone(root, 'Spine2');
        const bNeck   = this.findBone(root, 'Neck');
        const bHead   = this.findBone(root, 'Head');
        const bTop    = this.findBone(root, 'HeadTop_End');
        const bLArm   = this.findBone(root, 'LeftArm');
        const bLFore  = this.findBone(root, 'LeftForeArm');
        const bLHand  = this.findBone(root, 'LeftHand');
        const bRArm   = this.findBone(root, 'RightArm');
        const bRFore  = this.findBone(root, 'RightForeArm');
        const bRHand  = this.findBone(root, 'RightHand');
        const bLUp    = this.findBone(root, 'LeftUpLeg');
        const bLLeg   = this.findBone(root, 'LeftLeg');
        const bLFoot  = this.findBone(root, 'LeftFoot');
        const bRUp    = this.findBone(root, 'RightUpLeg');
        const bRLeg   = this.findBone(root, 'RightLeg');
        const bRFoot  = this.findBone(root, 'RightFoot');

        // Derive exact skeleton scale unit from spine-to-neck length (works for BOTH xbot & soldier!)
        const refLen = (bNeck && bNeck.position.length() > 1) ? bNeck.position.length() : 15;
        const U = refLen / 15.0; // ~1.0 in Mixamo cm coordinates

        // 3. PELVIS, BELT & ARMORED TASSETS (Hips)
        if (bHips) {
          const hipG = new T.Group(); bHips.add(hipG);
          const pelvis = new T.Mesh(new T.CylinderGeometry(11.5 * U * bulk, 10.2 * U * bulk, 11.5 * U, 6), mats.under);
          pelvis.position.y = 1.5 * U; pelvis.castShadow = true; hipG.add(pelvis);

          const belt = new T.Mesh(new T.BoxGeometry(24.5 * U * bulk, 4.6 * U, 15.5 * U * bulk), mats.trim);
          belt.position.y = 5.5 * U; hipG.add(belt); addInk98(belt, 1.06);

          const buckle = new T.Mesh(new T.OctahedronGeometry(3.4 * U, 0), mats.glowA);
          buckle.position.set(0, 5.5 * U, 8.2 * U * bulk); hipG.add(buckle);

          // Left & Right armored hip tassets (cyber-samurai plates)
          for (const s of [-1, 1]) {
            const tas = new T.Mesh(new T.BoxGeometry(4.2 * U * bulk, 15.5 * U, 12.5 * U), mats.armor);
            tas.position.set(s * 12.6 * U * bulk, -3.5 * U, 0);
            tas.rotation.z = s * 0.16;
            hipG.add(tas); addInk98(tas, 1.06);
            const cell = new T.Mesh(new T.BoxGeometry(1.4 * U, 10 * U, 2.2 * U), mats.glowB);
            cell.position.set(s * 14.5 * U * bulk, -2.5 * U, 2.5 * U);
            hipG.add(cell);
          }
          // Arcane coat tail / rear armored flap
          const flap = new T.Mesh(new T.BoxGeometry(15 * U * bulk, arch === 'arcane' ? 28 * U : 16 * U, 2.6 * U), mats.trim);
          flap.position.set(0, arch === 'arcane' ? -12 * U : -5 * U, -8.8 * U * bulk);
          flap.rotation.x = 0.18;
          hipG.add(flap); addInk98(flap, 1.06);
        }

        // 4. SEGMENTED ABDOMEN (Spine / Spine1)
        const midSpine = bSpine1 || bSpine;
        if (midSpine) {
          const abG = new T.Group(); midSpine.add(abG);
          const waist = new T.Mesh(new T.CylinderGeometry(12.2 * U * bulk, 9.8 * U * bulk, 14 * U, 6), mats.under);
          waist.position.y = 4 * U; abG.add(waist);
          for (let i = 0; i < 2; i++) {
            const ab = new T.Mesh(new T.BoxGeometry((15 - i * 1.5) * U * bulk, 4.2 * U, 13.5 * U * bulk), mats.armor);
            ab.position.set(0, (1.5 + i * 5.2) * U, 1.2 * U);
            abG.add(ab); addInk98(ab, 1.06);
          }
        }

        // 5. V-TAPERED SCULPTED CHESTPLATE, COLLAR & ENERGY SCARF (Spine2)
        const scarfSegs = [];
        if (bSpine2) {
          const chG = new T.Group(); bSpine2.add(chG);
          // Heroic V-taper chest chassis
          const chest = new T.Mesh(new T.CylinderGeometry(17.2 * U * bulk, 11.4 * U * bulk, 18.5 * U, 6), mats.armor);
          chest.position.set(0, 8.5 * U, 0.5 * U); chest.scale.set(1.08, 1, 0.78);
          chest.castShadow = true; chG.add(chest); addInk98(chest, 1.07);

          // Left & Right sculpted angular pectoral plates
          for (const s of [-1, 1]) {
            const pec = new T.Mesh(new T.BoxGeometry(10.5 * U * bulk, 10.2 * U, 6.2 * U * bulk), mats.trim);
            pec.position.set(s * 6.8 * U * bulk, 10.5 * U, 7.6 * U * bulk);
            pec.rotation.y = s * -0.24; pec.rotation.z = s * 0.1;
            chG.add(pec); addInk98(pec, 1.06);
          }
          // Glowing Overdrive Sternum Reactor Core
          const core = new T.Mesh(new T.OctahedronGeometry(4.4 * U, 0), mats.glowA);
          core.scale.set(1, 1.35, 0.65);
          core.position.set(0, 10.5 * U, 11.2 * U * bulk);
          chG.add(core);
          // High cyber-ninja collar guard
          const collar = new T.Mesh(new T.CylinderGeometry(9.6 * U, 11.5 * U, 6.5 * U, 6, 1, true), mats.trim);
          collar.position.set(0, 18.5 * U, -0.8 * U);
          chG.add(collar);
          const colRim = new T.Mesh(new T.TorusGeometry(9.6 * U, 0.85 * U, 6, 16), mats.glowA);
          colRim.rotation.x = Math.PI / 2; colRim.position.set(0, 21.2 * U, -0.8 * U);
          chG.add(colRim);

          // Back spine power-pack + glowing spine nodes
          const pack = new T.Mesh(new T.BoxGeometry(13 * U * bulk, 14 * U, 6.5 * U), mats.under);
          pack.position.set(0, 9.5 * U, -9.2 * U * bulk);
          chG.add(pack); addInk98(pack, 1.06);
          for (let k = 0; k < 3; k++) {
            const node = new T.Mesh(new T.BoxGeometry(4.2 * U, 2.2 * U, 2.2 * U), k === 1 ? mats.glowB : mats.glowA);
            node.position.set(0, (4.5 + k * 4.5) * U, -12.6 * U * bulk);
            chG.add(node);
          }

          // Flowing dual cyber-energy scarf anchored to upper back!
          for (const s of [-1, 1]) {
            let prev = chG;
            for (let k = 0; k < 4; k++) {
              const piv = new T.Group();
              if (k === 0) piv.position.set(s * 5.2 * U, 17.5 * U, -8.5 * U * bulk);
              else piv.position.set(0, -10.5 * U, -4.2 * U);
              prev.add(piv);
              const rib = new T.Mesh(new T.BoxGeometry((4.2 - k * 0.65) * U, 11.5 * U, 1.1 * U), k % 2 === 0 ? mats.glowB : mats.glowA);
              rib.position.set(0, -5.2 * U, -2.0 * U);
              rib.rotation.x = 0.35;
              piv.add(rib);
              scarfSegs.push({ piv, s, k });
              prev = piv;
            }
          }
        }

        // 6. SCULPTED ARMS, PAULDRONS & GAUNTLETS (bone-vector aligned for both xbot & soldier)
        for (const [arm, fore, hand, s] of [[bLArm, bLFore, bLHand, 1], [bRArm, bRFore, bRHand, -1]]) {
          const armGrp = this.buildLimb(arm, fore, 5.6 * U * bulk, 4.7 * U * bulk, mats, 'arm');
          this.buildLimb(fore, hand, 4.9 * U * bulk, 4.2 * U * bulk, mats, 'forearm');
          if (armGrp) {
            // Angular beveled shoulder pauldron seated cleanly on the upper arm axis
            const pauld = new T.Mesh(new T.BoxGeometry(11.2 * U * bulk, 9.6 * U * bulk, 11.8 * U * bulk), mats.armor);
            pauld.position.set(0, 3.8 * U, 0);
            armGrp.add(pauld); addInk98(pauld, 1.07);
            const trim = new T.Mesh(new T.BoxGeometry(11.8 * U * bulk, 2.0 * U, 12.4 * U * bulk), mats.glowA);
            trim.position.set(0, 1.2 * U, 0);
            armGrp.add(trim);
            if (arch === 'heavy' || arch === 'master') {
              const fin = new T.Mesh(new T.ConeGeometry(2.8 * U, 9.5 * U, 4), mats.trim);
              fin.position.set(0, -1.8 * U, 0);
              fin.rotation.x = Math.PI;
              armGrp.add(fin); addInk98(fin, 1.06);
            }
          }
          if (hand) {
            const fist = new T.Mesh(new T.BoxGeometry(5.6 * U, 6.8 * U, 5.2 * U), mats.under);
            hand.add(fist);
          }
        }

        // 7. SCULPTED THIGHS, KNEEPADS, GREAVES & CYBER BOOTS (aligned to ToeBase)
        const bLToe = this.findBone(root, 'LeftToeBase'), bRToe = this.findBone(root, 'RightToeBase');
        for (const [up, leg, foot, toe] of [[bLUp, bLLeg, bLFoot, bLToe], [bRUp, bRLeg, bRFoot, bRToe]]) {
          this.buildLimb(up, leg, 7.6 * U * bulk, 5.8 * U * bulk, mats, 'thigh');
          this.buildLimb(leg, foot, 6.2 * U * bulk, 4.5 * U * bulk, mats, 'shin');
          if (foot) {
            const fg = new T.Group();
            if (toe && toe.position.length() > 1) {
              fg.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), toe.position.clone().normalize());
            }
            foot.add(fg);
            const boot = new T.Mesh(new T.BoxGeometry(8.2 * U * bulk, 6.4 * U, 17.0 * U), mats.armor);
            boot.position.set(0, 0, 6.5 * U);
            fg.add(boot); addInk98(boot, 1.06);
            const sole = new T.Mesh(new T.BoxGeometry(8.6 * U * bulk, 1.8 * U, 17.6 * U), mats.glowA);
            sole.position.set(0, -2.8 * U, 6.5 * U);
            fg.add(sole);
          }
        }

        // 8. SCULPTED CYBER-SHINOBI HELM & GLOWING VISOR (when not using painted anime face)
        if (bHead) {
          const hr = bTop ? bTop.position.length() * 0.5 : 10 * U;
          if (!hasFace) {
            const hG = new T.Group();
            hG.position.set(0, hr * 0.78, 0.5 * U);
            bHead.add(hG);
            // Faceted cyber helmet dome
            const dome = new T.Mesh(new T.OctahedronGeometry(hr * 0.96, 1), mats.armor);
            dome.scale.set(0.92, 1.06, 1.04);
            hG.add(dome); addInk98(dome, 1.07);
            // Sharp ninja respirator jawline mask
            const jaw = new T.Mesh(new T.BoxGeometry(hr * 1.18, hr * 0.68, hr * 0.95), mats.under);
            jaw.position.set(0, -hr * 0.42, hr * 0.36);
            hG.add(jaw); addInk98(jaw, 1.06);
            // Blazing angular V-visor slit
            const visor = new T.Mesh(new T.BoxGeometry(hr * 1.55, hr * 0.28, hr * 0.52), mats.glowA);
            visor.position.set(0, hr * 0.04, hr * 0.78);
            hG.add(visor);
            // Forehead crest / oni-mecha V-fin
            for (const s of [-1, 1]) {
              const ear = new T.Mesh(new T.ConeGeometry(hr * 0.22, hr * 1.25, 4), mats.trim);
              ear.position.set(s * hr * 0.78, hr * 0.48, -hr * 0.15);
              ear.rotation.z = s * -0.42; ear.rotation.x = -0.35;
              hG.add(ear); addInk98(ear, 1.06);
            }
            if (arch === 'heavy' || arch === 'master') {
              const crest = new T.Mesh(new T.ConeGeometry(hr * 0.24, hr * 1.35, 4), mats.gold);
              crest.position.set(0, hr * 0.85, hr * 0.55);
              crest.rotation.x = 0.45;
              hG.add(crest);
            }
          }
        }

        g._body98 = { scarfSegs, mats };
      } catch (e) { if (typeof errLog === 'function') errLog(e); }
      return g;
    },

    tickAnim(g, o, rd, t) {
      const b = g && g._body98;
      if (!b || !b.scarfSegs.length) return;
      const spd = (o && o.spd) || 0, dash = !!(o && o.dashing);
      const lift = dash ? 1.15 : Math.min(0.85, spd / 420);
      for (const seg of b.scarfSegs) {
        seg.piv.rotation.x = 0.22 + lift * 0.55 + Math.sin(t * (dash ? 22 : 9) - seg.k * 0.85 + seg.s) * (dash ? 0.22 : 0.12);
        seg.piv.rotation.z = seg.s * 0.1 + Math.cos(t * 7 - seg.k * 0.6) * 0.08;
      }
    }
  };

  /* ========================================================================
     2. BossPure3D98 — 100% PURE 3D BOSSES (ZERO 2D BODY BLEED-THROUGH!)
        Replaces Boss.draw in 3D mode with clean tactical telegraphs ONLY,
        and upgrades R3.bossModel & boss weapon parts to full AAA 3D!
     ======================================================================== */
  const BossPure3D98 = {
    drawTelegraphsOnly(b) {
      if (!b || typeof cx === 'undefined') return;
      const col = (b.info && b.info.col) || '#ff0844';
      const T2 = typeof TAU !== 'undefined' ? TAU : Math.PI * 2;
      const D8 = typeof DASH8 !== 'undefined' ? DASH8 : [8, 6];
      const D6 = typeof DASH6 !== 'undefined' ? DASH6 : [6, 5];
      const ND = typeof NODASH !== 'undefined' ? NODASH : [];
      const tm = (typeof CAM !== 'undefined' && CAM.t) || 0;

      cx.save();
      // 1. Stomp / Slam target circles (warden, prime)
      if (b.st === 'stomp' && b.stT > 0.4) {
        cx.strokeStyle = '#ff3b3b'; cx.lineWidth = 3; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(b.tx, b.ty, 120, 0, T2); cx.stroke(); cx.setLineDash(ND);
        cx.globalAlpha = 0.14; cx.fillStyle = '#ff0844'; cx.fill(); cx.globalAlpha = 1;
      }
      // 2. Aim / Dash telegraph lines (kage, leviathan, genesis, raijin)
      if (b.st === 'tele' && b.da != null) {
        const k = Math.max(0, Math.min(1, 1 - (b.stT || 0) / (b.teleD || 0.75)));
        cx.globalAlpha = 0.35 + k * 0.55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2 + k * 4;
        cx.setLineDash(D8); cx.beginPath(); cx.moveTo(b.x, b.y);
        cx.lineTo(b.x + Math.cos(b.da) * 520, b.y + Math.sin(b.da) * 520); cx.stroke();
        cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      // 3. Warden plasma aim
      if (b.st === 'plasma' && b.parts && b.parts[1] && b.parts[1].alive) {
        const can = b.parts[1];
        cx.globalAlpha = 0.65; cx.strokeStyle = '#00f2fe'; cx.lineWidth = 3;
        cx.beginPath(); cx.moveTo(can.x, can.y); cx.lineTo(can.x + Math.cos(b.ang) * 900, can.y + Math.sin(b.ang) * 900); cx.stroke();
        cx.globalAlpha = 1;
      }
      // 4. Hydra sweeping beam
      if (b.beam && (b.beam.tele > 0 || b.beam.on > 0) && b.parts && b.parts[1] && b.parts[1].alive) {
        const C = b.parts[1], bm = b.beam;
        const ex = C.x + Math.cos(bm.a) * bm.len, ey = C.y + Math.sin(bm.a) * bm.len;
        if (bm.tele > 0) {
          cx.globalAlpha = 0.55; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(D8);
          cx.beginPath(); cx.moveTo(C.x, C.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        } else {
          cx.strokeStyle = '#ff2bd6'; cx.lineWidth = 12; cx.beginPath(); cx.moveTo(C.x, C.y); cx.lineTo(ex, ey); cx.stroke();
          cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.stroke();
        }
      }
      // 5. Shogun spinning laser spokes
      if (b.sp && (b.sp.tele > 0 || b.sp.on > 0)) {
        for (let k = 0; k < b.sp.n; k++) {
          const a = b.sp.a + k * T2 / b.sp.n, ex = b.x + Math.cos(a) * 900, ey = b.y + Math.sin(a) * 900;
          if (b.sp.tele > 0) {
            cx.globalAlpha = 0.45; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(D8);
            cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
          } else {
            cx.strokeStyle = '#ff0844'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(ex, ey); cx.stroke();
            cx.strokeStyle = '#ffd0da'; cx.lineWidth = 3; cx.stroke();
          }
        }
      }
      // 6. Raijin electric curtain
      if (b.cur && typeof V !== 'undefined') {
        const c = b.cur, live = c.tele <= 0, L = V.L, Rr = V.R;
        cx.globalAlpha = live ? 1 : 0.45 + 0.3 * Math.sin(tm * 20);
        cx.strokeStyle = live ? '#e8f6ff' : '#9fd8ff'; cx.lineWidth = live ? 4 : 2;
        if (!live) cx.setLineDash(D8);
        cx.beginPath();
        for (let seg = 0; seg < 2; seg++) {
          const x0 = seg ? c.gx + c.gw : L, x1 = seg ? Rr : c.gx; if (x1 - x0 < 4) continue;
          cx.moveTo(x0, c.y); for (let x = x0 + 14; x < x1; x += 14) cx.lineTo(x, c.y + (live ? Math.sin(x * 0.7 + tm * 50) * 5 : 0)); cx.lineTo(x1, c.y);
        }
        cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        cx.strokeStyle = '#00ff88'; cx.lineWidth = 2; cx.strokeRect(c.gx, c.y - 12, c.gw, 24);
      }
      // 7. Renull echo cut lines
      if (Array.isArray(b.echoes)) {
        for (const e of b.echoes) {
          if (e.t > 0) {
            cx.globalAlpha = 0.35 + (1 - e.t / e.d) * 0.5; cx.strokeStyle = '#ff0844'; cx.lineWidth = 2; cx.setLineDash(D6);
            cx.beginPath(); cx.moveTo(e.x1, e.y1); cx.lineTo(e.x2, e.y2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
          }
        }
      }
      // 8. Benkei sweep sector
      if (b.sw) {
        const s = b.sw;
        for (const off of s.two ? [0, Math.PI] : [0]) {
          const a = s.a + off;
          cx.beginPath(); cx.moveTo(b.x, b.y); cx.arc(b.x, b.y, 270, a - s.w, a + s.w); cx.closePath();
          cx.fillStyle = s.cut ? 'rgba(255,8,68,.35)' : 'rgba(255,176,32,.16)'; cx.fill();
          cx.strokeStyle = s.cut ? '#ff0844' : '#ffb020'; cx.lineWidth = 2.5; cx.stroke();
        }
      }
      // 9. Valkyrie orbital strike columns
      if (Array.isArray(b.cols) && typeof V !== 'undefined') {
        for (const c of b.cols) {
          if (c.t > 0) {
            const k = 1 - c.t / c.d;
            cx.globalAlpha = 0.14 + k * 0.25; cx.fillStyle = '#00f2fe'; cx.fillRect(c.x - c.w / 2, 0, c.w, V.VH);
            cx.globalAlpha = 0.65; cx.strokeStyle = '#00f2fe'; cx.lineWidth = 2; cx.strokeRect(c.x - c.w / 2, 0, c.w, V.VH); cx.globalAlpha = 1;
          }
        }
      }
      // 10. Chimera decay zones, Oryu ring, Izanami slam, Hyakki lane, Tenkai lances, Otakemaru rocks
      if (Array.isArray(b.zones)) {
        for (const z of b.zones) if (z.t > 0) {
          cx.globalAlpha = 0.45; cx.strokeStyle = '#c45bff'; cx.lineWidth = 2; cx.setLineDash(D6);
          cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        }
      }
      if (b.ring) {
        const g = b.ring, k = 1 - g.t / g.d;
        cx.globalAlpha = 0.4 + 0.5 * k; cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(g.x, g.y, 48, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      if (b.slam) {
        const s = b.slam, k = 1 - s.t / s.d;
        cx.globalAlpha = 0.35 + 0.5 * k; cx.strokeStyle = '#ff0844'; cx.lineWidth = 3; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(s.x, s.y, 72, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      if (b.lane && (b.st === 'aim' || b.st === 'charge') && typeof V !== 'undefined') {
        cx.fillStyle = 'rgba(255,8,68,.2)'; cx.fillRect(b.lane.x - b.r - 6, 0, (b.r + 6) * 2, V.VH);
      }
      if (Array.isArray(b.lances)) {
        for (const L of b.lances) {
          const ex = L.x + Math.cos(L.a) * 1400, ey = L.y + Math.sin(L.a) * 1400;
          cx.strokeStyle = L.t > 0 ? '#ff6a00' : '#ffffff'; cx.lineWidth = L.t > 0 ? 2 : 9;
          cx.beginPath(); cx.moveTo(L.x, L.y); cx.lineTo(ex, ey); cx.stroke();
        }
      }
      if (Array.isArray(b.rocks)) {
        for (const r of b.rocks) if (r.t > 0) {
          const k = 1 - r.t / r.d;
          cx.globalAlpha = 0.35 + k * 0.5; cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.setLineDash(D6);
          cx.beginPath(); cx.arc(r.x, r.y, r.r, 0, T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
        }
      }

      // 11. Core tactical HUD overlays (stagger ring, weak-point arc, shield, part HP bars)
      if (b.stag > 0) {
        cx.globalAlpha = 0.65; cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.setLineDash(D8);
        cx.beginPath(); cx.arc(b.x, b.y, b.r + 56, tm * 2, tm * 2 + T2); cx.stroke(); cx.setLineDash(ND); cx.globalAlpha = 1;
      }
      if (b.wpOn && b.stag <= 0 && b.dying <= 0) {
        cx.globalAlpha = b.wpCd > 0 ? 0.25 : 1; cx.strokeStyle = '#ffd700'; cx.lineWidth = 6;
        cx.beginPath(); cx.arc(b.x, b.y, b.r + 9, b.wp - 0.65, b.wp + 0.65); cx.stroke(); cx.globalAlpha = 1;
      }
      if (b.shield && b.dying <= 0) {
        cx.strokeStyle = 'rgba(125,249,255,.78)'; cx.lineWidth = 3;
        cx.beginPath(); cx.arc(b.x, b.y, b.r + 16 + Math.sin(tm * 5) * 2, 0, T2); cx.stroke();
      }
      for (const p of (b.parts || [])) if (p.alive) {
        const w = (p.r || 16) * 2;
        cx.fillStyle = 'rgba(0,0,0,.65)'; cx.fillRect(p.x - w / 2, p.y + (p.r || 16) + 5, w, 4);
        cx.fillStyle = '#00ff88'; cx.fillRect(p.x - w / 2, p.y + (p.r || 16) + 5, w * Math.max(0, p.hp / p.mhp), 4);
      }
      cx.restore();
    },

    upgradeBoss3D(bg, b) {
      if (!bg || bg._boss3d98 || typeof THREE === 'undefined') return bg;
      bg._boss3d98 = 1;
      try {
        const T = THREE;
        const col = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[b.id] && BOSS_INFO[b.id].col) || '#ff0844';
        const glowM = mkMat98(col, col, 2.4, 0.2, 0.2);
        const darkM = mkMat98('#12182d', col, 0.28, 0.82, 0.24);
        const goldM = mkMat98('#ffd700', '#ffb020', 0.7, 0.85, 0.2);
        const kind = bg.kind || 'mech';

        // Add crisp 3D tactical wings / shoulder cannons / energy halo so bosses look 100% AAA 3D!
        if (kind === 'ship') {
          for (const s of [-1, 1]) {
            const wing = new T.Mesh(new T.BoxGeometry(0.95, 1.45, 0.16), darkM);
            wing.position.set(-0.25, s * 1.35, 1.35);
            wing.rotation.z = s * 0.28;
            bg.add(wing); addInk98(wing, 1.06);
            const thr = new T.Mesh(new T.ConeGeometry(0.24, 0.95, 8).rotateZ(Math.PI / 2), glowM);
            thr.position.set(-1.15, s * 0.85, 1.25);
            bg.add(thr);
          }
        } else if (kind === 'core') {
          const rOuter = new T.Mesh(new T.TorusGeometry(1.45, 0.08, 8, 28), glowM);
          rOuter.position.z = 1.6; rOuter.rotation.x = 0.75;
          bg.add(rOuter);
          if (bg.anim) bg.anim.push(['ring', rOuter, 2.2]);
        } else if (kind === 'mech') {
          for (const s of [-1, 1]) {
            const fin = new T.Mesh(new T.ConeGeometry(0.28, 1.15, 4), darkM);
            fin.position.set(-0.2, s * 1.15, 2.35); fin.rotation.x = s * 0.45;
            bg.add(fin); addInk98(fin, 1.06);
            const rail = new T.Mesh(new T.BoxGeometry(0.85, 0.16, 0.16), glowM);
            rail.position.set(0.35, s * 1.08, 2.15);
            bg.add(rail);
          }
          const crown = new T.Mesh(new T.TorusGeometry(0.55, 0.07, 6, 16), goldM);
          crown.position.set(0.15, 0, 2.62);
          bg.add(crown);
        }
      } catch (e) {}
      return bg;
    }
  };

  /* ========================================================================
     3. HomeRedesign98 — CLEAN, UNIFIED HOME SCREEN COMMAND BAR (#cmdbar98)
     ======================================================================== */
  const HomeRedesign98 = {
    bar: null,
    organize() {
      if (typeof UI !== 'undefined' && UI.cur !== 'title') return;
      const col = document.querySelector('#s-title > .col');
      if (!col) return;
      if (!this.bar) {
        const bar = document.createElement('div');
        bar.id = 'cmdbar98';
        // Place cleanly right after the topbar (profile + credits), before the logo!
        const topbar = col.querySelector('.topbar');
        if (topbar && topbar.nextSibling) col.insertBefore(bar, topbar.nextSibling);
        else col.prepend(bar);
        this.bar = bar;
      }

      // Absorb ALL floating title buttons cleanly into #cmdbar98 (zero position:fixed clutter!)
      const ids = ['auth93-btn', 'heat92-btn', 'lb92-btn', 'ost95-btn', 'chips96-btn', 'help97-btn'];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.parentNode !== this.bar) {
          this.bar.appendChild(el);
        }
      }

      // Move Dual Ending title badge cleanly into the flow right beneath the logo!
      const eb = document.getElementById('ending-badge97');
      const logo = col.querySelector('.logo');
      if (eb && logo && eb.parentNode !== col) {
        eb.classList.add('inflow98');
        if (logo.nextSibling) col.insertBefore(eb, logo.nextSibling);
        else col.appendChild(eb);
      }
    }
  };

  /* ========================================================================
     4. SmartHud98 — NON-INTRUSIVE ABILITY BAR & CLEAN COMBAT HUD
        - Strictly hides #dock outside active PLAY
        - Default AUTO mode: auto-hides on PC (slides up on bottom-edge hover
          or brief peek when skill/OD activates), compact semi-transparent on touch
        - Press [B] anytime to cycle AUTO / COMPACT / HIDDEN / ALWAYS
        - Turns off #pc90-bar hotkey strip by default; auto-fades #arch97-badge
     ======================================================================== */
  const SmartHud98 = {
    peekT: 0,
    zoneEl: null,
    archTimer: 0,
    lastODReady: false,

    init() {
      // Turn off bottom PC hotkey clutter bar by default on first v98 launch
      try {
        if (typeof Store !== 'undefined' && Store.data && Store.data.settings) {
          const s = Store.data.settings;
          if (s._v98HudInit == null) {
            s._v98HudInit = 1;
            s.bar90 = 0;
            if (s.dockMode98 == null) s.dockMode98 = 'auto';
            Store.touch();
          }
        }
      } catch (e) {}

      // Bottom-edge hover sensor for desktop AUTO mode
      if (!this.zoneEl) {
        const z = document.createElement('div');
        z.id = 'dock98-zone';
        z.addEventListener('pointerenter', () => this.peek(2.2));
        document.body.appendChild(z);
        this.zoneEl = z;
      }

      // Press [B] to cycle ability bar display mode; pressing Q/W/E/R/Space peeks briefly
      window.addEventListener('keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (typeof G !== 'undefined' && G.state === 'PLAY') {
          if (['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'Space', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
            this.peek(1.6);
          }
          if (e.code === 'KeyB') {
            const modes = ['auto', 'compact', 'hidden', 'always'];
            const cur = S98.val('dockMode98', 'auto');
            const next = modes[(modes.indexOf(cur) + 1) % modes.length];
            try { Store.data.settings.dockMode98 = next; Store.touch(); } catch (err) {}
            if (typeof toast === 'function') toast((S98.isHe() ? 'סרגל יכולות: ' : 'ABILITY BAR: ') + S98.L(next.toUpperCase()), '#00f2fe');
            this.peek(1.8);
          }
        }
      });
    },

    peek(sec) {
      this.peekT = Math.max(this.peekT, sec || 1.6);
    },

    onRunStart() {
      this.archTimer = 4.2;
      this.lastODReady = false;
    },

    tick(rd) {
      const dt = Math.min(0.05, rd || 0.016);
      const mode = S98.val('dockMode98', 'auto');
      const play = typeof G !== 'undefined' && G.state === 'PLAY' && !G.photo;

      document.body.classList.toggle('dock98-auto', mode === 'auto');
      document.body.classList.toggle('dock98-compact', mode === 'compact');
      document.body.classList.toggle('dock98-hidden', mode === 'hidden');

      const dock = document.getElementById('dock');
      if (dock) {
        // Strictly hide #dock whenever NOT in active PLAY!
        if (!play) dock.classList.add('hidden');
        // Brief peek when Overdrive hits 100%
        const odReady = play && typeof G !== 'undefined' && (G.od >= 100);
        if (odReady && !this.lastODReady) this.peek(2.2);
        this.lastODReady = odReady;

        if (this.peekT > 0) this.peekT = Math.max(0, this.peekT - dt);
        dock.classList.toggle('peek98', this.peekT > 0);
      }
      if (this.zoneEl) this.zoneEl.classList.toggle('on', play && mode === 'auto');

      // Auto-fade the Archetype badge after 4.2 seconds at run start so bottom-left stays clean!
      const archEl = document.getElementById('arch97-badge');
      if (archEl && play) {
        window.__archFade98 = this.archTimer;
        if (this.archTimer > 0) {
          this.archTimer -= dt;
          archEl.style.opacity = Math.min(1, this.archTimer * 1.4).toFixed(2);
        } else {
          archEl.style.display = 'none';
        }
      }
    }
  };

  /* ========================================================================
     5. CrateCinema98 — NEXT-GEN AAA 3D/2D CRATE OPENING OVERHAUL
        Orbital Drop -> Armored Cyber-Vault -> 3 Interactive Katana Seal Cuts
        -> Epic+ Overclock Glitch Fake-Out -> 85ms Anime Impact Frame
        -> 28-Shard 3D Explosion + Volumetric Sky Beam + Hero Camera Orbit!
     ======================================================================== */
  const CrateCinema98 = {
    run(res, done, multiCount) {
      const L = s => S98.L(s);
      const r = Math.max(0, Math.min(4, res.r | 0));
      const R0 = (typeof RAR !== 'undefined' && RAR[r]) || { n: 'RARE', c: '#00f2fe' };
      const trueCol = R0.c || '#00f2fe';
      const canFake = (typeof S94 === 'undefined' || S94.on('fakeout94', true)) && r >= 2 && (r >= 3 || Math.random() < 0.7);
      const fakeR = canFake ? (r >= 4 ? 2 : r === 3 ? 1 : 0) : r;
      const fakeCol = ((typeof RAR !== 'undefined' && RAR[fakeR]) ? RAR[fakeR].c : '#00b4ff');

      const ov = document.createElement('div');
      ov.id = 'crate98-ov';
      ov.innerHTML =
        '<canvas id="crate98-3d"></canvas>' +
        '<canvas id="crate98-2d"></canvas>' +
        '<div id="crate98-hud">' +
          '<div>' +
            '<div id="crate98-top">' +
              '<div id="crate98-badge">⚡ ' + (S98.isHe() ? 'כספת סייבר 3D' : 'CYBER VAULT 3D') + (multiCount > 1 ? ' · ×' + multiCount : '') + '</div>' +
              '<button id="crate98-skip">' + L('SKIP') + ' ⏭</button>' +
            '</div>' +
            '<div id="crate98-seals"><span class="c98-seal-pip"></span><span class="c98-seal-pip"></span><span class="c98-seal-pip"></span></div>' +
          '</div>' +
          '<div id="crate98-prompt">' +
            '<div class="c98-main">' + L('SLASH THE SEALS!') + '</div>' +
            '<div class="c98-sub">' + L('SWIPE OR PRESS SPACE · 3 CUTS TO SHATTER') + '</div>' +
          '</div>' +
        '</div>' +
        '<div id="crate98-alert">⚡ ' + L('OVERCLOCK BREAK!') + '</div>' +
        '<div id="crate98-reveal">' +
          '<div class="c98-rar" id="c98-rar"></div>' +
          '<div class="c98-nm" id="c98-nm"></div>' +
          '<div class="c98-sub2" id="c98-sub2"></div>' +
          '<button class="c98-btn" id="c98-ok">' + L('COLLECT REWARD') + '</button>' +
        '</div>';
      document.body.appendChild(ov);

      const cv3 = ov.querySelector('#crate98-3d');
      const cv2 = ov.querySelector('#crate98-2d');
      const pips = [...ov.querySelectorAll('.c98-seal-pip')];
      const promptEl = ov.querySelector('#crate98-prompt');
      const alertEl = ov.querySelector('#crate98-alert');
      const revEl = ov.querySelector('#crate98-reveal');
      const skipBtn = ov.querySelector('#crate98-skip');

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      let W = window.innerWidth, H = window.innerHeight;
      cv2.width = W * dpr; cv2.height = H * dpr;
      const g2 = cv2.getContext('2d');

      const rewardImg = (typeof CrateCinema94 !== 'undefined' && CrateCinema94.buildRewardCanvas)
        ? CrateCinema94.buildRewardCanvas(res, trueCol) : null;

      // Setup reward text
      const itemNm = res.item ? L(res.item.name) : (res.cr ? '+' + fmtNum(res.cr) + ' CR' : '+' + fmtNum(res.shards) + ' ' + L('SHARDS'));
      ov.querySelector('#c98-rar').textContent = '✦ ' + L(R0.n) + (multiCount > 1 ? ' · BEST OF ×' + multiCount : '');
      ov.querySelector('#c98-rar').style.color = trueCol;
      ov.querySelector('#c98-nm').textContent = itemNm;
      ov.querySelector('#c98-sub2').textContent = res.dup ? (S98.isHe() ? 'כפול — הומר לחלקיקי שדרוג!' : 'DUPLICATE — CONVERTED TO UPGRADE SHARDS!') : (S98.isHe() ? 'נוסף לארסנל שלך!' : 'ADDED TO YOUR ARSENAL!');
      revEl.style.borderColor = trueCol;
      revEl.style.boxShadow = '0 18px 60px rgba(0,0,0,.78), 0 0 42px ' + trueCol + '66';

      // --- THREE.JS 3D STAGE ---
      let rn = null, sc = null, cam = null, crateGrp = null, coreMesh = null;
      let beamOuter = null, beamInner = null, ring1 = null, ring2 = null, sealBands = [];
      let shards = [], neonMats = [], mainLight = null, rimLight = null;
      const use3D = typeof THREE !== 'undefined';

      if (use3D) {
        try {
          const T = THREE;
          rn = new T.WebGLRenderer({ canvas: cv3, antialias: true, alpha: true });
          rn.setPixelRatio(dpr); rn.setSize(W, H, false);
          rn.outputColorSpace = T.SRGBColorSpace;
          rn.toneMapping = T.ACESFilmicToneMapping; rn.toneMappingExposure = 1.25;

          sc = new T.Scene();
          cam = new T.PerspectiveCamera(42, W / Math.max(1, H), 0.1, 120);
          cam.position.set(0, 2.9, 8.8);
          cam.lookAt(0, 1.15, 0);

          sc.add(new T.HemisphereLight(0x88b4ff, 0x090c1a, 0.85));
          const key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(5, 10, 7); sc.add(key);
          mainLight = new T.PointLight(new T.Color(fakeCol), 18, 22, 1.5); mainLight.position.set(0, 2.6, 2.8); sc.add(mainLight);
          rimLight  = new T.PointLight(new T.Color(fakeCol), 14, 18, 1.5); rimLight.position.set(-4, 3.2, -3.5); sc.add(rimLight);

          // Hexagonal reflective cyber-pedestal + neon grid ring
          const ped = new T.Mesh(new T.CylinderGeometry(3.4, 3.9, 0.45, 6), new T.MeshStandardMaterial({ color: 0x0d1328, metalness: 0.85, roughness: 0.22 }));
          ped.position.y = -0.25; sc.add(ped);
          const pedRimMat = new T.MeshBasicMaterial({ color: new T.Color(fakeCol) });
          neonMats.push(pedRimMat);
          const pedRim = new T.Mesh(new T.TorusGeometry(3.48, 0.06, 8, 48), pedRimMat);
          pedRim.rotation.x = Math.PI / 2; pedRim.position.y = 0.0; sc.add(pedRim);

          // Armored Cyber-Vault Crate
          crateGrp = new T.Group();
          crateGrp.position.y = 14; // Starts high in orbit for dramatic drop!
          sc.add(crateGrp);

          const bodyMat = new T.MeshStandardMaterial({ color: 0x151d36, metalness: 0.82, roughness: 0.26 });
          const trimMat = new T.MeshStandardMaterial({ color: 0x26345c, metalness: 0.9, roughness: 0.2 });
          const glowMat = new T.MeshBasicMaterial({ color: new T.Color(fakeCol) });
          neonMats.push(glowMat);

          // Main beveled vault chassis
          crateGrp.add(new T.Mesh(new T.BoxGeometry(2.35, 2.05, 2.35), bodyMat));
          // Corner heavy armor bumpers
          for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
            const c = new T.Mesh(new T.BoxGeometry(0.55, 0.55, 0.55), trimMat);
            c.position.set(sx * 1.02, sy * 0.88, sz * 1.02);
            crateGrp.add(c);
          }
          // Glowing energy fissures along the vault faces
          for (let i = 0; i < 3; i++) {
            const band = new T.Mesh(new T.TorusGeometry(1.75 + i * 0.08, 0.055, 6, 4), glowMat);
            band.rotation.set(i === 0 ? Math.PI / 2 : 0.65 * i, i * 0.78, i * 0.5);
            crateGrp.add(band);
            sealBands.push(band);
          }
          // Inner pulsing core revealed as seals break
          coreMesh = new T.Mesh(new T.OctahedronGeometry(0.82, 0), new T.MeshBasicMaterial({ color: 0xffffff }));
          crateGrp.add(coreMesh);

          // Orbiting runic halo rings
          ring1 = new T.Mesh(new T.TorusGeometry(2.65, 0.045, 8, 48), glowMat);
          ring1.position.y = 1.25; ring1.rotation.x = Math.PI / 2.2; sc.add(ring1);
          ring2 = new T.Mesh(new T.TorusGeometry(3.15, 0.035, 8, 48), glowMat);
          ring2.position.y = 1.25; ring2.rotation.x = -Math.PI / 2.4; sc.add(ring2);

          // Volumetric Sky Beam (hidden until explosion)
          const bMat1 = new T.MeshBasicMaterial({ color: new T.Color(trueCol), transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
          const bMat2 = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
          beamOuter = new T.Mesh(new T.CylinderGeometry(1.4, 2.2, 24, 24, 1, true), bMat1);
          beamOuter.position.y = 11.5; sc.add(beamOuter);
          beamInner = new T.Mesh(new T.CylinderGeometry(0.45, 0.95, 24, 16, 1, true), bMat2);
          beamInner.position.y = 11.5; sc.add(beamInner);
        } catch (e) {}
      }

      // --- STATE MACHINE ---
      let state = 'drop'; // drop -> ready -> fakeout -> impact -> burst -> reveal
      let t = 0, stateT = 0, cuts = 0, shakeA = 0, activeCol = fakeCol;
      let slashes2D = [], sparks2D = [], rings2D = [], ended = false, raf = 0;

      const setThemeCol = (hex) => {
        activeCol = hex;
        if (typeof THREE !== 'undefined') {
          const c = new THREE.Color(hex);
          for (const m of neonMats) m.color.copy(c);
          if (mainLight) mainLight.color.copy(c);
          if (rimLight) rimLight.color.copy(c);
        }
      };

      const spawnSparks = (cx0, cy0, n, col, spd) => {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, s = (spd || 260) * (0.35 + Math.random() * 0.95);
          sparks2D.push({ x: cx0, y: cy0, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0.45 + Math.random() * 0.55, maxL: 1, col, sz: 2 + Math.random() * 4 });
        }
      };

      const explode3D = () => {
        if (!use3D || !sc || !crateGrp) return;
        const T = THREE;
        crateGrp.visible = false;
        const sMat1 = new T.MeshStandardMaterial({ color: 0x1a2442, metalness: 0.85, roughness: 0.25, emissive: new T.Color(trueCol), emissiveIntensity: 0.45 });
        const sMat2 = new T.MeshBasicMaterial({ color: new T.Color(trueCol) });
        for (let i = 0; i < 28; i++) {
          const geo = i % 3 === 0 ? new T.OctahedronGeometry(0.28 + Math.random() * 0.22, 0) : new T.BoxGeometry(0.45 + Math.random() * 0.35, 0.22 + Math.random() * 0.2, 0.4 + Math.random() * 0.3);
          const m = new T.Mesh(geo, i % 4 === 0 ? sMat2 : sMat1);
          m.position.set((Math.random() - 0.5) * 1.4, 1.2 + (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.4);
          sc.add(m);
          const ang = Math.random() * Math.PI * 2, spd = 5 + Math.random() * 10;
          shards.push({ m, vx: Math.cos(ang) * spd, vy: 4 + Math.random() * 9, vz: Math.sin(ang) * spd, rx: (Math.random() - 0.5) * 14, ry: (Math.random() - 0.5) * 14 });
        }
      };

      const doSlash = (x1, y1, x2, y2) => {
        if (state !== 'ready') return;
        cuts++;
        const p = pips[cuts - 1];
        if (p) { p.classList.add('cut'); p.style.background = activeCol; p.style.boxShadow = '0 0 14px ' + activeCol; }

        // Blazing katana ribbon across the crate
        const ang = (x1 != null) ? Math.atan2(y2 - y1, x2 - x1) : (-0.55 + cuts * 0.48);
        slashes2D.push({ cx: W * 0.5, cy: H * 0.48, ang, life: 0.42, maxL: 0.42, col: cuts >= 3 ? trueCol : activeCol, w: cuts >= 3 ? 22 : 12 });
        spawnSparks(W * 0.5, H * 0.48, cuts >= 3 ? 42 : 22, activeCol, cuts >= 3 ? 520 : 340);
        rings2D.push({ x: W * 0.5, y: H * 0.48, r: 20, maxR: cuts >= 3 ? 440 : 240, life: 0.36, col: activeCol });
        shakeA = Math.max(shakeA, cuts >= 3 ? 22 : 11);

        // Shatter one 3D seal band per slash
        if (sealBands[cuts - 1]) sealBands[cuts - 1].visible = false;
        if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxSlash) CrateCinema94.sfxSlash(cuts >= 3);

        if (cuts >= 3) {
          promptEl.classList.add('hide');
          if (canFake) {
            state = 'fakeout'; stateT = 0;
            if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxGlitchFakeout) CrateCinema94.sfxGlitchFakeout();
          } else {
            setThemeCol(trueCol);
            state = 'impact'; stateT = 0;
          }
        }
      };

      const finishReveal = () => {
        if (state === 'reveal') return;
        setThemeCol(trueCol);
        promptEl.classList.add('hide');
        alertEl.classList.remove('on');
        if (crateGrp && crateGrp.visible) explode3D();
        state = 'reveal'; stateT = 0;
        revEl.classList.add('on');
        if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxFanfare) CrateCinema94.sfxFanfare(r);
        spawnSparks(W * 0.5, H * 0.4, 65, trueCol, 560);
        rings2D.push({ x: W * 0.5, y: H * 0.42, r: 30, maxR: Math.max(W, H) * 0.65, life: 0.65, col: trueCol });
        rings2D.push({ x: W * 0.5, y: H * 0.42, r: 10, maxR: Math.max(W, H) * 0.42, life: 0.5, col: '#ffffff' });
      };

      const cleanup = () => {
        if (ended) return;
        ended = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        try { if (rn) rn.dispose(); } catch (e) {}
        ov.remove();
        if (window.__crate98Close === closeQuiet) window.__crate98Close = null;
        if (typeof done === 'function') done();
      };
      const closeQuiet = () => { done = null; cleanup(); }; // (no summary window over the next screen)
      window.__crate98Close = closeQuiet; // (v105: leaving the screen or starting a run closes the film, which used to stay on top of everything)

      let dragStart = null;
      ov.addEventListener('pointerdown', e => {
        if (e.target === skipBtn || e.target.id === 'c98-ok') return;
        dragStart = { x: e.clientX, y: e.clientY };
      });
      ov.addEventListener('pointerup', e => {
        if (!dragStart) return;
        const ds = dragStart; dragStart = null;
        if (state === 'ready') doSlash(ds.x, ds.y, e.clientX, e.clientY);
      });
      const onKey = e => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (state === 'ready') doSlash();
          else if (state === 'reveal' && stateT > 0.35) cleanup();
        } else if (e.code === 'Escape') {
          finishReveal();
        }
      };
      const onResize = () => {
        W = window.innerWidth; H = window.innerHeight;
        cv2.width = W * dpr; cv2.height = H * dpr;
        if (rn && cam) { cam.aspect = W / Math.max(1, H); cam.updateProjectionMatrix(); rn.setSize(W, H, false); }
      };
      window.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize);
      skipBtn.onclick = () => { if (state === 'reveal') cleanup(); else finishReveal(); };
      ov.querySelector('#c98-ok').onclick = cleanup;

      if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.duckAudio) CrateCinema94.duckAudio(0.14, 4.0);

      let last = performance.now();
      const loop = (now) => {
        if (ended) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) * 0.001);
        last = now; t += dt; stateT += dt;
        shakeA = Math.max(0, shakeA - dt * 36);

        // --- STATE PROGRESSION ---
        if (state === 'drop') {
          const p = Math.min(1, stateT / 0.55);
          const ease = p * p * p;
          if (crateGrp) {
            crateGrp.position.y = 14 * (1 - ease) + 1.25 * ease;
            crateGrp.rotation.y = (1 - ease) * 3.5;
          }
          if (p >= 1) {
            state = 'ready'; stateT = 0; shakeA = 20;
            if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.sfxDrop) CrateCinema94.sfxDrop();
            spawnSparks(W * 0.5, H * 0.58, 36, activeCol, 420);
            rings2D.push({ x: W * 0.5, y: H * 0.56, r: 24, maxR: 360, life: 0.48, col: activeCol });
          }
        } else if (state === 'ready') {
          if (crateGrp) {
            crateGrp.position.y = 1.25 + Math.sin(t * 4.5) * 0.14;
            crateGrp.rotation.y += dt * (0.9 + cuts * 1.35);
            crateGrp.rotation.z = Math.sin(t * (10 + cuts * 12)) * (0.02 + cuts * 0.045);
          }
        } else if (state === 'fakeout') {
          shakeA = 14;
          if (crateGrp) {
            crateGrp.rotation.y += dt * 9;
            crateGrp.scale.setScalar(1 + Math.sin(stateT * 46) * 0.08);
          }
          if (stateT >= 0.42 && activeCol !== trueCol) {
            setThemeCol(trueCol);
            alertEl.classList.add('on');
            spawnSparks(W * 0.5, H * 0.48, 50, trueCol, 560);
            rings2D.push({ x: W * 0.5, y: H * 0.48, r: 20, maxR: 480, life: 0.45, col: trueCol });
          }
          if (stateT >= 1.05) {
            alertEl.classList.remove('on');
            state = 'impact'; stateT = 0;
          }
        } else if (state === 'impact') {
          // 85ms pure black & white anime manga impact frame!
          if (stateT >= 0.088) {
            explode3D();
            shakeA = 28;
            finishReveal();
          }
        }

        // --- 3D SCENE UPDATE ---
        if (use3D && rn && sc && cam) {
          if (ring1) ring1.rotation.z = t * (1.2 + cuts * 1.4);
          if (ring2) ring2.rotation.z = -t * (1.5 + cuts * 1.2);
          if (coreMesh) { coreMesh.rotation.y = t * 5; coreMesh.scale.setScalar(0.85 + cuts * 0.18 + Math.sin(t * 14) * 0.1); }
          for (const sh of shards) {
            sh.m.position.x += sh.vx * dt; sh.m.position.y += sh.vy * dt; sh.m.position.z += sh.vz * dt;
            sh.vy -= 18 * dt;
            if (sh.m.position.y < 0.15) { sh.m.position.y = 0.15; sh.vy *= -0.42; sh.vx *= 0.8; sh.vz *= 0.8; }
            sh.m.rotation.x += sh.rx * dt; sh.m.rotation.y += sh.ry * dt;
          }
          if (beamOuter && beamInner) {
            const targetOp = state === 'reveal' ? 0.34 : 0;
            beamOuter.material.opacity += (targetOp - beamOuter.material.opacity) * Math.min(1, dt * 8);
            beamInner.material.opacity += ((targetOp * 1.6) - beamInner.material.opacity) * Math.min(1, dt * 8);
            beamOuter.rotation.y = t * 1.4;
          }
          // Dynamic camera choreography
          const camRad = state === 'reveal' ? 7.6 : (8.8 - cuts * 0.55);
          const camAng = state === 'reveal' ? t * 0.45 : Math.sin(t * 0.6) * 0.22;
          cam.position.set(
            Math.sin(camAng) * camRad + (Math.random() - 0.5) * shakeA * 0.02,
            (state === 'reveal' ? 3.5 : 2.9) + (Math.random() - 0.5) * shakeA * 0.02,
            Math.cos(camAng) * camRad
          );
          cam.lookAt(0, state === 'reveal' ? 1.85 : 1.15, 0);
          rn.render(sc, cam);
        }

        // --- 2D VFX & HOLOGRAPHIC REWARD RENDER ---
        g2.save();
        g2.scale(dpr, dpr);
        g2.clearRect(0, 0, W, H);

        if (state === 'impact') {
          // Crisp Black & White Manga/Anime Impact Frame!
          g2.fillStyle = '#05050a';
          g2.fillRect(0, 0, W, H);
          g2.strokeStyle = '#ffffff';
          for (let i = 0; i < 42; i++) {
            const a = (i / 42) * Math.PI * 2;
            g2.lineWidth = 2 + (i % 4) * 2.5;
            g2.beginPath();
            g2.moveTo(W * 0.5 + Math.cos(a) * 90, H * 0.46 + Math.sin(a) * 90);
            g2.lineTo(W * 0.5 + Math.cos(a) * Math.max(W, H), H * 0.46 + Math.sin(a) * Math.max(W, H));
            g2.stroke();
          }
          g2.save();
          g2.translate(W * 0.5, H * 0.46); g2.rotate(-0.42);
          g2.fillStyle = '#ffffff'; g2.fillRect(-W, -18, W * 2, 36);
          g2.restore();
          g2.restore();
          return;
        }

        // Expanding shockwave rings
        for (const rg of rings2D) {
          rg.life -= dt;
          const p = Math.min(1, Math.max(0, 1 - rg.life / 0.55)); // (v105: a ring born with more life than 0.55 s gave a negative radius)
          const rad = Math.max(0, rg.r + (rg.maxR - rg.r) * p);
          g2.globalAlpha = Math.max(0, rg.life * 2);
          g2.strokeStyle = rg.col; g2.lineWidth = Math.max(1.5, 9 * (1 - p));
          g2.beginPath(); g2.arc(rg.x, rg.y, rad, 0, Math.PI * 2); g2.stroke();
        }
        rings2D = rings2D.filter(rg => rg.life > 0);

        // Glowing Katana Slash Ribbons
        for (const sl of slashes2D) {
          sl.life -= dt;
          const k = Math.max(0, sl.life / sl.maxL);
          g2.save();
          g2.translate(sl.cx, sl.cy); g2.rotate(sl.ang);
          g2.globalAlpha = k;
          g2.shadowColor = sl.col; g2.shadowBlur = 28;
          g2.fillStyle = sl.col;
          g2.fillRect(-W * 0.75, -sl.w * k * 0.5, W * 1.5, sl.w * k);
          g2.fillStyle = '#ffffff';
          g2.fillRect(-W * 0.75, -sl.w * k * 0.2, W * 1.5, sl.w * k * 0.4);
          g2.restore();
        }
        slashes2D = slashes2D.filter(sl => sl.life > 0);

        // Sparks
        for (const sp of sparks2D) {
          sp.life -= dt;
          sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 460 * dt;
          g2.globalAlpha = Math.max(0, sp.life);
          g2.fillStyle = sp.col;
          g2.fillRect(sp.x, sp.y, sp.sz, sp.sz);
        }
        sparks2D = sparks2D.filter(sp => sp.life > 0);

        // Floating Holographic Reward Preview in the Sky Beam!
        if (state === 'reveal' && rewardImg) {
          const rise = Math.min(1, stateT / 0.42);
          const ease = 1 - Math.pow(1 - rise, 3);
          const sz = Math.min(250, W * 0.52, H * 0.34);
          const rx = W * 0.5, ry = H * 0.36 + (1 - ease) * 90 + Math.sin(t * 3.4) * 8;
          g2.save();
          g2.globalAlpha = ease;
          // Rotating rarity aura halo behind item
          const grad = g2.createRadialGradient(rx, ry, sz * 0.1, rx, ry, sz * 0.78);
          grad.addColorStop(0, trueCol + 'cc'); grad.addColorStop(0.55, trueCol + '33'); grad.addColorStop(1, 'transparent');
          g2.fillStyle = grad;
          g2.beginPath(); g2.arc(rx, ry, sz * 0.78, 0, Math.PI * 2); g2.fill();
          g2.shadowColor = trueCol; g2.shadowBlur = 28;
          g2.drawImage(rewardImg, rx - sz / 2, ry - sz / 2, sz, sz);
          g2.restore();
        }

        g2.restore();
      };
      raf = requestAnimationFrame(loop);
    }
  };


  /* ========================================================================
     6. CleanSettings98 — SLIM AAA 5-TAB SETTINGS OVERHAUL
        Replaces 20 bloated version-debug tabs & 70+ toggles (including 4
        separate FPS toggles!) with 5 crisp, logical player-facing tabs:
        SOUND · GRAPHICS · CONTROLS · KEYS · GENERAL
     ======================================================================== */
  const CleanSettings98 = {
    open() {
      if (typeof UI === 'undefined' || typeof Store === 'undefined') return;
      UI.show('settings');
      const s = Store.data.settings, box = $('setList');
      if (!box) return;
      box.textContent = '';

      // Sync unified settings defaults cleanly
      if (s.fps != null) { s.fps90 = s.fps ? 1 : 0; s.fps96 = s.fps ? 1 : 0; }

      const groups = [];
      let cur = null;
      const head = (txt) => {
        const g = { name: S98.L(txt), items: [] };
        groups.push(g);
        cur = g;
      };
      const addItem = (node) => { if (cur) cur.items.push(node); };

      const slider = (label, key) => {
        const r = el('label', 'set');
        r.appendChild(el('span', '', S98.L(label)));
        const i = document.createElement('input');
        i.type = 'range'; i.min = 0; i.max = 100;
        i.value = Math.round((s[key] == null ? 1 : s[key]) * 100);
        i.id = 'set-' + key;
        i.oninput = () => { s[key] = i.value / 100; if (typeof Aud !== 'undefined' && Aud.setVol) Aud.setVol(); Store.touch(); };
        r.appendChild(i);
        addItem(r);
      };

      const cycle = (label, key, opts, names, after) => {
        const r = el('div', 'set');
        r.appendChild(el('span', '', S98.L(label)));
        const b = el('button', 'tog on');
        const idx = () => {
          const val = s[key] == null ? opts[0] : s[key];
          const k = opts.indexOf(val);
          return k >= 0 ? k : 0;
        };
        b.textContent = S98.L(names[idx()]);
        b.id = 'set-' + key;
        b.onclick = () => {
          s[key] = opts[(idx() + 1) % opts.length];
          b.textContent = S98.L(names[idx()]);
          if (typeof Aud !== 'undefined' && Aud.sfx) Aud.sfx('ui');
          Store.touch();
          if (key === 'fx' && typeof setQuality === 'function') { Q.applied = 0; setQuality(s.fx === 'low' ? 0 : 2); }
          if (typeof applyUiSettings === 'function') applyUiSettings();
          if (after) after(s[key]);
        };
        r.appendChild(b);
        addItem(r);
      };

      // --- TAB 1: SOUND ---
      head('SOUND');
      slider('Sound effects', 'sfx');
      slider('Music', 'music');
      cycle('Studio Vocal Soundtrack', 'ost95', [1, 0], ['ON', 'OFF']);
      cycle('Sound FX Style', 'sfx102', [1, 0], ['STUDIO', 'CLASSIC']);
      cycle('Voice callouts', 'voice', [1, 0], ['ON', 'OFF'], v => { s.voice96 = v; });
      cycle('Vibration', 'haptics', [1, 0], ['ON', 'OFF']);

      // --- TAB 2: GRAPHICS ---
      head('GRAPHICS');
      cycle('Graphics', 'd3', [1, 2, 0], ['3D', 'CLASSIC 3D', '2D']);
      cycle('3D Visual Style', 'style3d91', ['anime', 'metallic'], ['ANIME 2D-STYLE', 'CYBER METALLIC']);
      cycle('Action 3D Camera', 'actionCam101', [1, 0], ['ACTION 3D', 'CLASSIC 3D']);
      cycle('Resolution', 'res', ['auto', 'max', 'high', 'med', 'low'], ['AUTO', 'MAX', 'HIGH', 'MEDIUM', 'LOW'], () => {
        if (typeof setQuality === 'function') { Q.applied = 0; setQuality(Q.lvl); }
        if (typeof GL3D !== 'undefined' && GL3D.cv && GL3D.size) GL3D.size();
      });
      cycle('Effects quality', 'fx', ['auto', 'ultra', 'high', 'low'], ['AUTO', 'ULTRA', 'HIGH', 'LOW']);
      cycle('Frame rate limit', 'fpsCap', [0, 240, 165, 144, 120, 60], ['MAX', '240', '165', '144', '120', '60']);
      cycle('Screen shake', 'shake', [1, 0.5, 0], ['FULL', 'LOW', 'OFF']);
      cycle('Show FPS', 'fps', [0, 1], ['OFF', 'ON'], v => { s.fps90 = v ? 1 : 0; s.fps96 = v ? 1 : 0; });
      cycle('Calm / Reduced Flashes', 'calm', [0, 1], ['OFF', 'ON'], v => { s.flashes = v ? 'off' : 'full'; });

      // --- TAB 3: CONTROLS ---
      head('CONTROLS');
      cycle('Ability Bar Display', 'dockMode98', ['auto', 'compact', 'hidden', 'always'], ['AUTO', 'COMPACT', 'HIDDEN', 'ALWAYS']);
      cycle('HUD', 'hud', ['clean', 'full'], ['CLEAN', 'FULL'], () => { if (typeof CleanHud !== 'undefined' && CleanHud.sync) CleanHud.sync(); });
      cycle('WASD Free Movement', 'wasd90', [1, 0], ['ON', 'OFF']);
      cycle('Instant Left-Click Slash', 'instSlash90', [1, 0], ['ON', 'OFF']);
      cycle('Mouse aim', 'maim', ['cursor', 'drag'], ['AT THE CURSOR', 'DRAG']);
      cycle('Crosshair', 'xh', [1, 0], ['ON', 'OFF']);
      cycle('Tap to dash', 'tap', [1, 0], ['ON', 'OFF']);
      cycle('Aim assist', 'assist', [1, 0], ['ON', 'OFF']);
      cycle('Swipe sensitivity', 'sens', [1, 2, 0], ['NORMAL', 'HIGH', 'LOW']);
      cycle('Left-handed dock', 'lefty', [0, 1], ['OFF', 'ON']);
      if (typeof HudEdit !== 'undefined' && HudEdit.open) {
        const r = el('div', 'set');
        r.appendChild(el('span', '', S98.L('Move the skill buttons')));
        const b = el('button', 'tog', S98.L('EDIT'));
        b.onclick = () => { if (typeof Aud !== 'undefined') Aud.sfx('ui'); HudEdit.open(); };
        r.appendChild(b);
        addItem(r);
      }
      if (typeof Pad !== 'undefined') {
        const r = el('div', 'set');
        r.appendChild(el('span', '', S98.L('Controller')));
        r.appendChild(el('span', Pad.on ? 'gold' : 'mute', Pad.on ? (Pad.name || S98.L('CONNECTED')).slice(0, 26) : S98.L('NOT CONNECTED')));
        addItem(r);
      }

      // --- TAB 4: KEYS ---
      head('KEYS');
      if (typeof KEY_ACTS !== 'undefined' && typeof Keys !== 'undefined') {
        const m = Keys.map();
        for (const [id, name] of KEY_ACTS) {
          const r = el('div', 'set');
          r.appendChild(el('span', '', S98.L(name)));
          const b = el('button', 'tog kb', Keys.label(m[id]));
          b.id = 'key-' + id;
          b.onclick = () => {
            if (typeof Aud !== 'undefined') Aud.sfx('ui');
            b.classList.add('wait');
            b.textContent = S98.L('PRESS A KEY');
            Keys.capture = code => {
              b.classList.remove('wait');
              const keys = Store.data.settings.keys || (Store.data.settings.keys = {});
              if (code && code !== 'Escape' && code !== 'KeyP') {
                const curM = Keys.map();
                for (const k in curM) if (k !== id && Keys.norm(curM[k]) === Keys.norm(code)) keys[k] = curM[id];
                keys[id] = code; Store.touch(); if (typeof Aud !== 'undefined') Aud.sfx('buy');
              }
              UI.openSettings();
              if (typeof PC !== 'undefined' && PC.sync) PC.sync();
            };
          };
          r.appendChild(b);
          addItem(r);
        }
        const rr = el('div', 'set');
        rr.appendChild(el('span', '', S98.L('RESET KEYS')));
        const rb = el('button', 'tog', S98.L('RESET'));
        rb.onclick = () => {
          Store.data.settings.keys = {}; Store.touch();
          if (typeof Aud !== 'undefined') Aud.sfx('ui');
          UI.openSettings();
          if (typeof PC !== 'undefined' && PC.sync) PC.sync();
        };
        rr.appendChild(rb);
        addItem(rr);
      }

      // --- v103: the systems' own switches (dropped with the old 20 tabs); rules apply from the next run ---
      head('GAMEPLAY');
      cycle('Air Juggle & Launcher [F]', 'air96', [1, 0], ['ON', 'OFF']);
      cycle('Destructible Train Props', 'props96', [1, 0], ['ON', 'OFF']);
      cycle('Dynamic Track Events', 'events96', [1, 0], ['ON', 'OFF']);
      cycle('Roof Set-Pieces', 'events91', [1, 0], ['ON', 'OFF']);
      cycle('3D Boss Armor Break', 'armor96', [1, 0], ['ON', 'OFF']);
      cycle('Blade Clash', 'clash91', [1, 0], ['ON', 'OFF']);
      cycle('Shadow Rival', 'rival91', [1, 0], ['ON', 'OFF']);
      cycle('Awakened Blade', 'awaken91', [1, 0], ['ON', 'OFF']);
      cycle('Synergies', 'syn92', [1, 0], ['ON', 'OFF']);
      cycle('Enemy Squads', 'squad92', [1, 0], ['ON', 'OFF']);
      cycle('Combat Voice Announcer', 'voice96', [1, 0], ['ON', 'OFF']);
      cycle('3D Ghost Racing', 'ghost96', [1, 0], ['ON', 'OFF']);
      cycle('Cinematic Finisher Cam', 'fcam96', [1, 0], ['ON', 'OFF']);
      // --- TAB 5: GENERAL ---
      head('GENERAL');
      if (typeof LANGS !== 'undefined') {
        cycle('Language', 'lang', ['auto'].concat(LANGS.map(l => l.id)), ['AUTO'].concat(LANGS.map(l => l.n)), () => {
          if (typeof applyLang === 'function') applyLang();
          UI.openSettings();
        });
      }
      cycle('Text size', 'tsz', [0, 1, 2], ['100%', '115%', '130%']);
      cycle('Colorblind colors', 'cb', [0, 1], ['OFF', 'ON']);
      cycle('Damage numbers', 'nums', ['all', 'crit', 'off'], ['ALL', 'CRITS', 'OFF']);
      cycle('Game speed', 'speed', [1, 0.9, 0.8], ['100%', '90%', '80%']);
      cycle('Extra shields', 'ahp', [0, 1, 2], ['NONE', '+1', '+2']);
      cycle('Pause when the window loses focus', 'blurPause', [1, 0], ['ON', 'OFF']);
      cycle('Tutorial tips', 'tips', [1, 0], ['ON', 'OFF']);

      const more = el('div', 'grid2');
      more.style.marginTop = '12px';
      [
        ["WHAT'S NEW", () => UI.openNews(() => UI.openSettings())],
        ['MUSIC ROOM', () => UI.openMusic()],
        ['SAVE CODE', () => UI.openSave()],
        ['DEVICE CHECK', () => UI.openDevice()],
        ['SEND FEEDBACK', () => UI.openReport(() => UI.openSettings())]
      ].forEach(([n, fn]) => {
        const b = el('button', 'btn', S98.L(n));
        b.onclick = () => { if (typeof Aud !== 'undefined') Aud.sfx('ui'); fn(); };
        more.appendChild(b);
      });
      addItem(more);

      // Build clean 5-tab bar (#setTabs)
      let bar = $('setTabs');
      if (!bar) { bar = el('div', 'settabs'); bar.id = 'setTabs'; box.parentElement.insertBefore(bar, box); }
      bar.textContent = '';
      const pick = (UI.setTabN && groups.some(g => g.name === UI.setTabN)) ? UI.setTabN : groups[0].name;

      groups.forEach((g, i) => {
        const wrap = el('div', 'set-grp');
        for (const it of g.items) wrap.appendChild(it);
        wrap.classList.toggle('hidden', g.name !== pick);
        box.appendChild(wrap);

        const b = el('button', g.name === pick ? 'on' : '', g.name);
        b.type = 'button';
        b.onclick = () => {
          if (typeof Aud !== 'undefined') Aud.sfx('ui');
          UI.setTabN = g.name; UI.setTabI = i;
          [...bar.children].forEach(x => x.classList.toggle('on', x === b));
          [...box.children].forEach((w, j) => w.classList.toggle('hidden', j !== i));
        };
        bar.appendChild(b);
      });

      // Keep Achievements summary populated
      const ach = $('setAch');
      if (ach && typeof ACHS !== 'undefined') {
        ach.textContent = '';
        for (const a of ACHS) {
          const got = !!(Store.data.ach && Store.data.ach[a.id]);
          const r = el('div', 'bty');
          r.appendChild(el('span', got ? '' : 'mute', (got ? '✓ ' : '· ') + S98.L(a.name) + ' — ' + S98.L(a.d)));
          r.appendChild(el('span', 'gold small', '+' + a.r));
          ach.appendChild(r);
        }
      }
    }
  };

  /* ========================================================================
     HOOK WIRING — Clean v98 Integration
     ======================================================================== */
  SmartHud98.init();

  // 1. BodyRework98 hooks into Human.build & Human.anim
  if (typeof Human !== 'undefined') {
    if (Human.build) {
      const hb98 = Human.build.bind(Human);
      Human.build = function (L, wid) {
        const g = hb98(L, wid);
        BodyRework98.dressHuman(g, L);
        return g;
      };
    }
    if (Human.anim) {
      const ha98 = Human.anim.bind(Human);
      Human.anim = function (g, o, rd, t) {
        ha98(g, o, rd, t);
        try { BodyRework98.tickAnim(g, o, rd, t); } catch (e) {}
      };
    }
  }

  // 2. BossPure3D98 hooks into Boss.draw & R3.bossModel
  if (typeof Boss !== 'undefined' && Boss.draw) {
    const bd98 = Boss.draw.bind(Boss);
    Boss.draw = function () {
      const b = this.cur;
      const pure3D = S98.on('boss3d98', true) && typeof W3D !== 'undefined' && W3D.live && W3D.models() && typeof R3 !== 'undefined' && R3.on && typeof cx !== 'undefined' && cx === W3D.cx0;
      if (pure3D && b) {
        BossPure3D98.drawTelegraphsOnly(b);
        return;
      }
      return bd98();
    };
  }
  if (typeof R3 !== 'undefined' && R3.bossModel) {
    const bm98 = R3.bossModel.bind(R3);
    R3.bossModel = function (b) {
      return BossPure3D98.upgradeBoss3D(bm98(b), b);
    };
  }

  // 3. CrateCinema98 overrides CrateCinema94.run
  if (typeof CrateCinema94 !== 'undefined' && CrateCinema94.run) {
    const cc94 = CrateCinema94.run.bind(CrateCinema94);
    CrateCinema94.run = function (res, done, multiCount) {
      if (S98.on('crate98', true)) {
        try { CrateCinema98.run(res, done, multiCount || 1); return; } catch (e) { if (typeof errLog === 'function') errLog(e); }
      }
      return cc94(res, done, multiCount);
    };
  }

  // 4. SmartHud98 strict UI.syncHud hook & Director.begin hook
  if (typeof UI !== 'undefined' && UI.syncHud) {
    const sh98 = UI.syncHud.bind(UI);
    UI.syncHud = function () {
      const r = sh98();
      const dock = document.getElementById('dock');
      if (dock && (typeof G === 'undefined' || G.state !== 'PLAY' || G.photo)) {
        dock.classList.add('hidden');
      }
      return r;
    };
  }
  if (typeof Director !== 'undefined' && Director.begin) {
    const db98 = Director.begin.bind(Director);
    Director.begin = function () {
      SmartHud98.onRunStart();
      return db98.apply(this, arguments);
    };
  }

  // 5. Continuous HUD/Home tick + Settings tab
  if (typeof HUD !== 'undefined' && HUD.draw) {
    const hd98 = HUD.draw.bind(HUD);
    HUD.draw = function (rd) {
      try {
        HomeRedesign98.organize();
        SmartHud98.tick(rd);
      } catch (e) {}
      return hd98(rd);
    };
  }

  // 6. Replace bloated 20-tab settings with CleanSettings98 (5 crisp AAA tabs)
  if (typeof UI !== 'undefined' && UI.openSettings) {
    UI.openSettings = function () {
      try { CleanSettings98.open(); } catch (e) { if (typeof errLog === 'function') errLog(e); }
    };
  }

  // Organize home screen immediately on load as well
  setTimeout(() => { try { HomeRedesign98.organize(); } catch (e) {} }, 250);
  if (typeof Sim98 !== 'undefined') Sim98.menu.push(() => { if (UI.cur === 'title') HomeRedesign98.organize(); }); // (v103: on the title too: HUD.draw runs only in a run)
})();

