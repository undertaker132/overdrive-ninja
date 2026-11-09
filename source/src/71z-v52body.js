/* =====================================================================
   VERSION 52: REAL BODIES FOR THE 3D HEROES
   The hero model (every skin, friends, echoes, the ronin boss, the home
   screen and the Hero Forge) gets a proper body instead of blocks:
   thighs, knee pads, shins with guards, boots with toes; a belt with a
   glowing buckle, an abdomen, a broad armored chest, a collar and a back
   plate; shoulder pads; arms in two parts with elbows, bracers with a
   glowing stripe, and gloved hands that hold the weapon; a head with a
   visor and a face mask. The elbows and hands move: the free arm bends
   into a guard, swings when running and tucks in for a dash.
   The brutes and enforcers get arms with fists and legs too.
   Same parts and names as before (hips, legs, torso, head, arms, blade),
   so every skin, weapon and animation keeps working. Display only.
   ===================================================================== */
{
  R3.hero = function (col, col2, ghost) {
    const T = THREE, g = new T.Group(), P0 = this.part.bind(this), zU = this.zUp, M = this.M;
    const gm = ghost ? this.ghostMat(col) : null, pick = m => gm || m;
    const suit = pick(M.suit || (M.suit = this.std({ color: 0x1b2032, metalness: .25, roughness: .72 })));
    const bodyM = pick(M.armor), arm2 = pick(M.armor2), dark = pick(M.dark), cloth = pick(M.cloth), trim = ghost ? gm : this.glow(col, 2.4);
    const plate = ghost ? gm : this.std({ color: new T.Color(col2).multiplyScalar(.5), metalness: .7, roughness: .3, emissive: new T.Color(col2), emissiveIntensity: .12 }); g.plate = plate;
    const capZ = (r, len, mat, x, y, z, par) => P0(zU(new T.CapsuleGeometry(r, len, 4, 10)), mat, x, y, z, par); // standing up
    const capX = (r, len, mat, x, par) => P0(new T.CapsuleGeometry(r, len, 4, 10).rotateZ(-Math.PI / 2), mat, x, 0, 0, par); // along the limb (+x)
    // legs: thigh, knee pad, shin with a guard, boot with a toe
    const hips = new T.Group(); hips.position.z = 13; g.add(hips); g.hips = hips; g.legs = [];
    for (const s of [-1, 1]) {
      const hip = new T.Group(); hip.position.set(0, s * 2.6, 0); hips.add(hip);
      capZ(2.1, 3.2, suit, 0, 0, -3.3, hip); P0(new T.BoxGeometry(2.4, 3, 3.4), arm2, .95, 0, -2.6, hip);
      const knee = new T.Group(); knee.position.z = -6.6; hip.add(knee);
      P0(new T.SphereGeometry(1.5, 12, 10), arm2, .95, 0, .1, knee);
      capZ(1.7, 3.2, suit, 0, 0, -3, knee); P0(new T.BoxGeometry(2, 2.9, 3.6), bodyM, .75, 0, -2.9, knee); P0(new T.BoxGeometry(.45, .7, 3.2), trim, 1.8, 0, -2.9, knee);
      P0(new T.BoxGeometry(4.8, 2.9, 1.9), dark, .9, 0, -5.9, knee); P0(new T.BoxGeometry(2.2, 2.5, 1.4), dark, 3.6, 0, -6.15, knee);
      g.legs.push([hip, knee, s]);
    }
    // torso: belt and buckle, abdomen, chest, chest plate, collar, back plate
    const torso = new T.Group(); torso.position.z = 13; g.add(torso); g.torso = torso;
    P0(zU(new T.CylinderGeometry(3.9, 3.7, 1.7, 16)), cloth, 0, 0, 1, torso); P0(new T.BoxGeometry(.8, 1.8, 1.3), trim, 3.8, 0, 1, torso);
    capZ(3.3, 2.4, suit, 0, 0, 4, torso).scale.set(.9, 1.05, 1);
    capZ(4.3, 3, bodyM, 0, 0, 8.2, torso).scale.set(.84, 1.14, 1);
    P0(new T.BoxGeometry(3, 7.2, 4.6), plate, 2.4, 0, 8.6, torso);
    P0(new T.BoxGeometry(.8, 5.6, 1.1), trim, 3.95, 0, 9.6, torso); P0(new T.BoxGeometry(.8, 5.6, 1.1), trim, 3.95, 0, 6.8, torso);
    P0(new T.BoxGeometry(2.2, 6.4, 5), arm2, -3, 0, 8.4, torso);
    P0(zU(new T.CylinderGeometry(1.9, 2.3, 1.8, 12)), dark, 0, 0, 12.5, torso);
    // head: the skull first (skins recolor head.children[0]), visor, face mask, hood ridge
    const head = new T.Group(); head.position.z = 16; torso.add(head); g.head = head;
    P0(new T.SphereGeometry(3.7, 20, 16), bodyM, 0, 0, 0, head).scale.set(1, .95, 1.05);
    g.visor = P0(new T.BoxGeometry(2.2, 5.8, 1.6), ghost ? trim : this.glow(col, 4.5), 2.95, 0, .6, head);
    P0(new T.BoxGeometry(2.2, 4.8, 2.4), dark, 2.3, 0, -1.6, head);
    P0(new T.ConeGeometry(1.1, 3.6, 6), bodyM, -.5, 2.3, 3.3, head).rotation.x = -.6;
    // scarf: a chain of segments that trails and waves
    g.scarf = []; let prev = torso; for (let i = 0; i < 6; i++) { const sg = new T.Group(); sg.position.set(i ? -3.2 : -3.4, 0, i ? 0 : 12.2); prev.add(sg); P0(new T.BoxGeometry(3.4, 2.6 - i * .2, .9), ghost ? cloth : this.glow(col2, .6), -1.7, 0, 0, sg); g.scarf.push(sg); prev = sg; }
    // arms: shoulder pad, upper arm, elbow, forearm with a bracer, a gloved hand
    g.arms = []; g.elbows = []; g.hands = [];
    for (const s of [-1, 1]) {
      const sh = new T.Group(); sh.position.set(0, s * 5.5, 11); torso.add(sh);
      P0(new T.SphereGeometry(2.5, 14, 10), arm2, 0, s * .3, .6, sh).scale.set(1.05, 1.1, .8); P0(new T.BoxGeometry(3.4, .6, 2.6), trim, 0, s * 1.6, 1.2, sh).rotation.x = s * .5;
      capX(1.35, 2.8, suit, 2.6, sh);
      const el0 = new T.Group(); el0.position.x = 5.4; sh.add(el0); P0(new T.SphereGeometry(1.3, 10, 8), arm2, 0, 0, 0, el0);
      capX(1.25, 2.6, suit, 2.5, el0); P0(new T.BoxGeometry(3.2, 2.8, 2.8), bodyM, 2.8, 0, 0, el0); P0(new T.BoxGeometry(2.8, .5, .5), trim, 2.8, 0, 1.45, el0);
      const hand = new T.Group(); hand.position.x = 5.3; el0.add(hand);
      P0(new T.BoxGeometry(2.3, 2.2, 2.5), dark, .7, 0, 0, hand); P0(new T.BoxGeometry(1.2, .9, 1), dark, .9, -s * 1.2, .5, hand);
      g.arms.push(sh); g.elbows.push(el0); g.hands.push(hand);
    }
    // the weapon sits in the right hand
    const blade = new T.Group(); g.hands[1].add(blade); blade.position.set(.6, 0, 0); g.blade = blade;
    P0(new T.CylinderGeometry(.9, .9, 5, 8), M.dark, -1, 0, 0, blade).geometry.rotateZ(Math.PI / 2);
    P0(new T.BoxGeometry(1.2, 5, 1.6), M.gold, 1.6, 0, 0, blade);
    const bm = ghost ? gm : this.glow(col, 3.4); g.bladeMat = bm; g.bladeMesh = P0(new T.BoxGeometry(30, .9, 2.4), bm, 17, 0, 0, blade);
    P0(new T.ConeGeometry(1.2, 4, 4), bm, 34, 0, 0, blade).geometry.rotateZ(-Math.PI / 2);
    if (!ghost) { g.pool = this.pool(col, 46, .38); g.add(g.pool); }
    g.armN = g.arms.map(a => a.children.length);
    g.trim = trim; g.scale.setScalar(1.35); g.s0 = 1.35; return g;
  };
  // weapons that put things on the arms (a second blade, fist plates) put them in the hands instead
  const wp0 = R3.weapon.bind(R3);
  R3.weapon = function (g, id) {
    wp0(g, id); if (!g.hands) return;
    try { if (g.blade2 && g.blade2.parent !== g.hands[0]) { g.hands[0].add(g.blade2); g.blade2.position.set(.6, 0, 0); }
      g.arms.forEach((a, i) => { const extra = a.children.slice(g.armN[i]); for (const c of extra) { if (c === g.elbows[i]) continue; g.hands[i].add(c); c.position.x -= 7; } }); } catch (e) { errLog(e); }
  };
  // elbows and hands: a guard with the free arm, a swing when running, tucked in for a dash
  const ah6 = R3.animHero.bind(R3);
  R3.animHero = function (g, o, rd, t) {
    ah6(g, o, rd, t); if (!g.elbows) return;
    const sp = clamp((o.spd || 0) / 420, 0, 1), dash = !!o.dashing, sw = Math.sin(o.ph || t * 10);
    const E0 = g.elbows[0], E1 = g.elbows[1];
    E0.rotation.set(0, dash ? -.3 : -.35 - sp * (.3 + sw * .25), dash ? -1.6 : -1.15 + sp * .3); // the free forearm across the body
    E1.rotation.set(0, dash ? 0 : -.12, 0); // the sword arm stays almost straight, so the blade still points where you aim
    if (g.blade2) E0.rotation.set(0, -.1, -.2); // two blades: both arms reach out
    g.hands[0].rotation.set(0, 0, 0);
  };
  // brutes and enforcers: arms with fists and legs
  const em0 = R3.enemyModel.bind(R3);
  R3.enemyModel = function (e) {
    const g = em0(e);
    try { if (e.type === ET.BRUTE || e.type === ET.ENFORCER) { const T = THREE, P0 = this.part.bind(this), zU = this.zUp; g.limbs = [];
      for (const s of [-1, 1]) {
        const arm = new T.Group(); arm.position.set(.2, s * 1.2, 1.25); g.add(arm); P0(new T.SphereGeometry(.42, 10, 8), this.M.armor2, 0, 0, 0, arm);
        P0(zU(new T.CylinderGeometry(.24, .2, .7, 8)), this.M.armor, 0, 0, -.4, arm); P0(new T.SphereGeometry(.34, 10, 8), g.bodyMat, .1, 0, -.85, arm);
        const leg = new T.Group(); leg.position.set(0, s * .5, .3); g.add(leg); P0(zU(new T.CylinderGeometry(.26, .22, .5, 8)), this.M.armor, 0, 0, -.2, leg); P0(new T.BoxGeometry(.6, .4, .2), this.M.dark, .12, 0, -.45, leg);
        g.limbs.push([arm, leg, s]);
      } } } catch (er) { errLog(er); }
    return g;
  };
  const ae6 = R3.animEnemy.bind(R3);
  R3.animEnemy = function (g, e, t) { ae6(g, e, t); if (!g.limbs) return; const mv = Math.hypot(e.vx || 0, e.vy || 0) > 8, ph = t * 9 + (e.uid || 0);
    for (const [arm, leg, s] of g.limbs) { const w = mv ? Math.sin(ph) * s : Math.sin(t * 2 + (e.uid || 0)) * .15; arm.rotation.y = w * .6; leg.rotation.y = -w * .5; } };
}
