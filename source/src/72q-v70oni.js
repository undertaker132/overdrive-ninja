/* =====================================================================
   VERSION 70: CHAPTER 23 — THE ONI KING
   A new chapter of four stages through the oni's city, ending with a new
   giant boss: OTAKEMARU.EXE, the oni king of the old legends, rebuilt as
   a machine as tall as a building. It stands at the far end of the roof
   and fights with its two fists:
   · FIST SLAM: a fist rises over you (a red circle marks where), then
     falls. Get out of the circle. A fallen fist stays down for a moment:
     that is when to cut it.
   · phase 2, WRATH: every slam sends a ring of shockwaves, and it roars
     oni out of the ground to fight beside it
   · phase 3, CATACLYSM: slams come faster and the roof above you breaks;
     falling rubble is marked before it lands
   Its body is armored while either fist still stands; break both and it
   falls to its knees, open to Zandatsu. In 3D it is the horned demon,
   huge, in its own colors, punching when it slams.
   New stages only; arcade replays are unchanged.
   ===================================================================== */
CHARS.OK = { name: 'OTAKEMARU.EXE', role: 'The oni king', col: '#ff3b2f', pitch: 62 }; // (its own key: 'O' is ORYU.EXE)
Object.assign(BOSS_INFO, { otakemaru: { name: 'OTAKEMARU.EXE', sub: 'THE ONI KING', col: '#ff3b2f' } });
CODEX_BOSSES.push('otakemaru'); BOSS_CODE.otakemaru = 56; BOSS_THEME.otakemaru = 'temple'; LEGEND_TWIST.otakemaru = 'turbo';
Object.assign(COMMS, {
  oni2: [['OK', 'THE OLD CITY REMEMBERS ITS KING. RISE, MY ONI!']],
  oni3: [['M', 'The roof is coming down, Ren! Watch the marks where the rubble falls!']],
  oni4: [['OK', 'NO HANDS... THEN I WILL CRUSH YOU WITH THE SKY ITSELF.']]
});
BOSSDEF.otakemaru = {
  init(b) {
    b.r = 58; b.hp = 980; b.hy = V.VH * .2; b.bodyMul = .3; b.slT = 2.4; b.side = 0; b.rocks = []; b.roarT = 7; b.rkT = 2;
    const L = mkPart('LEFT FIST', -100, 46, 27, 46), Rt = mkPart('RIGHT FIST', 100, 46, 27, 46);
    for (const [p, s] of [[L, -1], [Rt, 1]]) { p.abs = true; p.side = s; p.st = 'home'; p.t = 0; p.tx = 0; p.ty = 0; b.parts.push(p); }
  },
  restore(b) { b.rocks = []; for (const p of b.parts) { p.st = 'home'; p.t = 0; } },
  pos(b) {
    for (const p of b.parts) {
      const hx = b.x + p.side * 100 + Math.sin(b.t * 1.4 + p.side) * 6, hy = b.y + 46 + Math.cos(b.t * 1.7 + p.side) * 5;
      if (p.st === 'tele') { const k = 1 - Math.max(0, p.t) / p.d; p.x = lerp(hx, p.tx, Math.min(1, k * 1.8)); p.y = lerp(hy, p.ty - 70, Math.min(1, k * 1.8)) + Math.sin(b.t * 30) * k * 2; }
      else if (p.st === 'down') { p.x = p.tx; p.y = p.ty; }
      else if (p.st === 'back') { const k = 1 - Math.max(0, p.t) / .5; p.x = lerp(p.tx, hx, k); p.y = lerp(p.ty, hy, k); }
      else { p.x = hx; p.y = hy; }
    }
  },
  onPart(b, p) {
    G.armsCut++; const n = bossPartsAlive(b); b.bodyMul = n === 2 ? .3 : n === 1 ? .55 : 1;
    FX.call(ltf('{0} BROKEN', lt(p ? p.name : 'FIST')), '#ff3b2f', 2, 22); shake(.5);
    if (!n) { b.stag = 3; b.zanN = 0; FX.call(lt('THE KING KNEELS'), '#ffd700', 3, 26); Comms.say('oni4', true); }
  },
  slam(b, p) {
    p.st = 'down'; p.t = b.ph >= 3 ? 1.1 : 1.5; b.st = 'idle'; shake(.55); punch(.08); Aud.sfx('boom', 1);
    FX.ring(p.tx, p.ty, 80, '#ff3b2f', 6); FX.ring(p.tx, p.ty, 130, 'rgba(255,90,40,.5)', 3); FX.spark(p.tx, p.ty, '#ffb36b', 18);
    if (dist(P.x, P.y, p.tx, p.ty) < 78 + P.r * .5) hurt('slam');
    if (b.ph >= 2) { const n = b.ph >= 3 ? 12 : 10, a0 = R.f() * TAU; for (let k = 0; k < n; k++) shoot(p.tx, p.ty, a0 + k * TAU / n, 170, 1); }
  },
  update(b, dt) {
    if (b.ph === 1 && b.hp < b.mhp * .66) { b.ph = 2; FX.call(lt('WRATH'), '#ff3b2f', 3, 26); Aud.sfx('roar'); shake(.6); Boss.saveCk(b); Comms.say('oni2', true); b.roarT = 1.5; }
    if (b.ph === 2 && b.hp < b.mhp * .33) { b.ph = 3; FX.call(lt('CATACLYSM'), '#ffd23f', 3, 28); Aud.sfx('roar'); shake(.8); glitch(.5); Boss.saveCk(b); Comms.say('oni3', true); Aud.intensity = 3; }
    b.hx = damp(b.hx, clamp(P.x, V.L + 130, V.R - 130), .35, dt); b.x = damp(b.x, b.hx, 1.2, dt); b.y = damp(b.y, b.hy + Math.sin(b.t * .9) * 8, 2, dt); b.vx = 0; b.vy = 0;
    if (b.t > 1.5) Tut.check('otakemaru', b.x, b.y, 90);
    // the fists
    for (const p of b.parts) { if (!p.alive || p.st === 'home') continue; p.t -= dt;
      if (p.st === 'tele' && p.t <= 0) this.slam(b, p);
      else if (p.st === 'down' && p.t <= 0) { p.st = 'back'; p.t = .5; }
      else if (p.st === 'back' && p.t <= 0) p.st = 'home'; }
    b.slT -= dt * G.diff.fire;
    if (b.slT <= 0) { const live = b.parts.filter(p => p.alive && p.st === 'home');
      if (live.length) { b.side = (b.side + 1) % 2; const p = live.find(q => (q.side > 0 ? 1 : 0) === b.side) || live[0];
        p.st = 'tele'; p.d = p.t = b.ph >= 3 ? .8 : 1.05; p.tx = clamp(P.x + P.vx * .15, V.L + 60, V.R - 60); p.ty = clamp(P.y + P.vy * .15, b.y + 130, V.VH - 140); b.st = 'tele'; Aud.sfx('warn'); }
      b.slT = b.ph >= 3 ? 1.3 : b.ph >= 2 ? 1.9 : 2.5; }
    // phase 2: the oni rise
    if (b.ph >= 2) { b.roarT -= dt; if (b.roarT <= 0) { b.roarT = b.ph >= 3 ? 11 : 9; let n = 0; for (let i = 0; i < EN.n; i++) if (EN.a[i].alive && EN.a[i].type === ET.BRUTE) n++;
      for (let k = n; k < 2; k++) { const e = spawnEnemy(ET.BRUTE, clamp(b.x + (k ? 140 : -140), V.L + 40, V.R - 40), b.y + 150, false); if (e) FX.ring(e.x, e.y, 50, '#ff3b2f', 3); }
      Aud.sfx('roar'); FX.ring(b.x, b.y, 160, 'rgba(255,59,47,.6)', 4); } }
    // phase 3 (or with no fists left): the roof falls
    if (b.ph >= 3 || !bossPartsAlive(b)) { b.rkT -= dt; if (b.rkT <= 0) { b.rkT = bossPartsAlive(b) ? 1.4 : .9; b.rocks.push({ x: clamp(P.x + (R.f() - .5) * 90, V.L + 40, V.R - 40), y: clamp(P.y + (R.f() - .5) * 90, 80, V.VH - 140), r: 44, t: 1, d: 1, hit: 0 }); } }
    for (let i = b.rocks.length - 1; i >= 0; i--) { const r = b.rocks[i]; r.t -= dt;
      if (r.t <= 0 && !r.hit) { r.hit = 1; FX.spark(r.x, r.y, '#c9b8a6', 12); FX.ring(r.x, r.y, r.r, '#ffd23f', 3); shake(.2); if (dist(P.x, P.y, r.x, r.y) < r.r + P.r * .4) hurt('rubble'); }
      if (r.t <= -.5) b.rocks.splice(i, 1); }
  },
  draw(b) {
    // falling rubble: a marked circle that closes, then the rock
    for (const r of b.rocks) {
      if (r.t > 0) { const k = 1 - r.t / r.d; cx.globalAlpha = .35 + k * .5; cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.setLineDash(DASH6); cx.beginPath(); cx.arc(r.x, r.y, r.r, 0, TAU); cx.stroke(); cx.setLineDash(NODASH);
        cx.globalAlpha = .25 + k * .4; cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(r.x, r.y, r.r * k, 0, TAU); cx.fill();
        cx.globalAlpha = 1; cx.fillStyle = '#4a3a30'; const s = 10 + k * 14; cx.fillRect(r.x - s / 2, r.y - 120 * (1 - k) - s / 2, s, s); }
      else { cx.globalAlpha = Math.max(0, 1 + r.t * 2); cx.fillStyle = '#3a2c24'; for (let k = 0; k < 6; k++) { const a = k * 1.05, q = r.r * .55; cx.fillRect(r.x + Math.cos(a) * q - 6, r.y + Math.sin(a) * q - 6, 12, 12); } }
      cx.globalAlpha = 1;
    }
    // the slam marks
    for (const p of b.parts) if (p.alive && p.st === 'tele') { const k = 1 - p.t / p.d; cx.globalAlpha = .3 + k * .55; cx.strokeStyle = '#ff2a2a'; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.tx, p.ty, 78, 0, TAU); cx.stroke();
      cx.globalAlpha = .18 + k * .3; cx.fillStyle = '#ff2a2a'; cx.beginPath(); cx.arc(p.tx, p.ty, 78 * k, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
    if (W3D.live) return; // (in 3D the giant itself is drawn by the 3D layer)
    const col = '#ff3b2f', wh = b.fl > .3, kneel = b.stag > 0 ? 8 : 0;
    // arms
    for (const p of b.parts) { cx.strokeStyle = p.alive ? '#2a0c0c' : 'rgba(42,12,12,.4)'; cx.lineWidth = p.alive ? 16 : 9; cx.beginPath(); cx.moveTo(b.x + p.side * 44, b.y + 10 + kneel); cx.quadraticCurveTo(b.x + p.side * 90, b.y + 5, p.x, p.y); cx.stroke(); }
    cx.save(); cx.translate(b.x, b.y + kneel); glow(0, 0, b.r * 2.6, col, .45);
    // body and head
    cx.fillStyle = wh ? '#ffffff' : '#200808'; cx.beginPath(); cx.ellipse(0, 6, b.r * 1.05, b.r * .85, 0, 0, TAU); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 3; cx.stroke();
    cx.fillStyle = wh ? '#fff' : '#3a0e0e'; cx.beginPath(); cx.arc(0, -b.r * .35, b.r * .55, 0, TAU); cx.fill(); cx.stroke();
    // horns
    cx.fillStyle = '#e8d8b8'; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(s * b.r * .3, -b.r * .7); cx.quadraticCurveTo(s * b.r * .75, -b.r * 1.05, s * b.r * .62, -b.r * 1.45); cx.quadraticCurveTo(s * b.r * .5, -b.r * 1.0, s * b.r * .14, -b.r * .78); cx.fill(); }
    // eyes and fangs
    cx.fillStyle = b.stag > 0 ? '#ffd700' : '#ffe14d'; for (const s of [-1, 1]) { cx.beginPath(); cx.ellipse(s * b.r * .2, -b.r * .42, b.r * .1, b.r * .06, s * .3, 0, TAU); cx.fill(); } hglow(0, -b.r * .42, 26, '#ffe14d', .5);
    cx.fillStyle = '#f4ecd8'; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(s * b.r * .16, -b.r * .14); cx.lineTo(s * b.r * .1, b.r * .02); cx.lineTo(s * b.r * .04, -b.r * .14); cx.fill(); }
    cx.restore();
    // fists
    for (const p of b.parts) { if (!p.alive) { cx.fillStyle = '#2a0c0c'; dot(p.x, p.y, 10); continue; }
      const down = p.st === 'down'; cx.save(); cx.translate(p.x, p.y); glow(0, 0, p.r * 2, down ? '#ffd23f' : col, down ? .5 : .3);
      cx.fillStyle = p.fl > .3 ? '#fff' : '#2a0c0c'; cx.beginPath(); cx.arc(0, 0, p.r, 0, TAU); cx.fill(); cx.strokeStyle = down ? '#ffd23f' : col; cx.lineWidth = 3; cx.stroke();
      cx.strokeStyle = '#120404'; cx.lineWidth = 2; for (let k = -1; k <= 1; k++) { cx.beginPath(); cx.moveTo(k * p.r * .35, -p.r * .55); cx.lineTo(k * p.r * .35, p.r * .1); cx.stroke(); }
      cx.restore(); }
  }
};
Object.assign(TUTS, { otakemaru: { t: 'FIST SLAM', d: 'A red circle marks where a fist will fall. Get out, then cut the fist while it is down. Break both fists to bring the king to his knees.' } });
{
  const dc0 = deathCause;
  deathCause = function () { if (G.lastHit === 'slam') return [lt('Crushed by the ONI KING\'s fist'), lt('A red circle marks where a fist falls. Leave it, then cut the fist while it is down.')];
    if (G.lastHit === 'rubble') return [lt('Buried under the falling roof'), lt('Gold circles close where rubble lands. Step out before they close.')]; return dc0.apply(this, arguments); };
}
/* ---------- chapter 23 ---------- */
CHAPTERS.push({ n: 23, name: 'THE ONI KING', sub: 'The old legends wake in steel', theme: 'temple', lock: 'Finish chapter 22 to unlock chapter 23' });
{
  const CH = CHAPTERS.length - 1, ONI = [
    { id: '23-1', ch: CH, name: 'HORNED SHADOWS', theme: 'undercity', obj: { t: 'kill', n: 50 },
      pool: { brute: 2.5, wraith: .8, phantom: 2, drone: 2, sniper: 1 }, max: 9, rate: .8,
      star: { t: 'combo', n: 40, d: 'Reach a x40 combo' },
      pre: [['M', 'Ren, the undercity is full of oni. Real horns, real fangs, running on machine hearts.', 'רן, העיר התחתית מלאה באוני. קרניים אמיתיות, ניבים אמיתיים, על לבבות של מכונה.'],
            ['R', 'Someone is building monsters out of old stories.', 'מישהו בונה מפלצות מסיפורים ישנים.']],
      post: [['K', 'They all march the same way. Toward the old shrine on the mountain.', 'כולם צועדים לאותו כיוון. אל המקדש הישן על ההר.']] },
    { id: '23-2', ch: CH, name: 'SHRINE OF A THOUSAND LANTERNS', theme: 'temple', obj: { t: 'reflect', n: 16 },
      pool: { sniper: 3, phantom: 2, weaver: 1.5, brute: 1 }, max: 8, rate: .82,
      star: { t: 'parry', n: 16, d: 'Land 16 perfect parries' },
      pre: [['M', 'The shrine guards shoot from behind the lanterns. Send their shots back through the paper.', 'שומרי המקדש יורים מאחורי הפנסים. תחזיר את היריות שלהם דרך הנייר.']],
      post: [['M', 'There is a name carved on every gate here. OTAKEMARU. The oni king of the old tales.', 'על כל שער כאן חקוק שם. אוטקמרו. מלך האוני מהסיפורים הישנים.']] },
    { id: '23-3', ch: CH, name: 'THE MOUNTAIN PASS', theme: 'winter', obj: { t: 'survive', s: 85 },
      pool: { brute: 2.5, wraith: 1, phantom: 2, bomber: 1.5, medic: .8 }, max: 10, rate: .76, traps: { barrels: 1 },
      star: { t: 'combo', n: 35, d: 'Reach a x35 combo' },
      pre: [['K', 'The pass is narrow and the oni come down it in waves. Hold until the snow stops.', 'המעבר צר והאוני יורדים בו בגלים. תחזיק עד שהשלג ייפסק.'],
            ['R', 'Let them come. One at a time or all at once.', 'שיבואו. אחד אחד או כולם יחד.']],
      post: [['M', 'The ground is shaking. Something as tall as the tower is standing up behind the shrine.', 'האדמה רועדת. משהו גבוה כמו המגדל קם מאחורי המקדש.']] },
    { id: '23-4', ch: CH, name: 'THE ONI KING', theme: 'temple', obj: { t: 'boss', b: 'otakemaru' },
      pool: { drone: 1, phantom: .5 }, max: 3, rate: 4,
      star: { t: 'time', n: 240, d: 'Win within 240s' },
      pre: [['OK', 'A LITTLE MAN WITH A LITTLE BLADE. THE OLD HEROES WERE TALLER.', 'איש קטן עם להב קטן. הגיבורים של פעם היו גבוהים יותר.'],
            ['R', 'The old heroes cut you down anyway. So will I.', 'הגיבורים של פעם הפילו אותך בכל זאת. גם אני אפיל.'],
            ['M', 'Watch the red circles, Ren. And cut the fists when they hit the ground!', 'שים לב לעיגולים האדומים, רן. ותחתוך את האגרופים כשהם פוגעים בקרקע!']],
      post: [['M', 'The king is down. The oni are just machines again, standing still in the snow.', 'המלך נפל. האוני הם שוב רק מכונות, עומדות בשקט בשלג.'],
             ['R', 'Every legend ends the same way. Someone has to finish it.', 'כל אגדה נגמרת באותה דרך. מישהו צריך לסיים אותה.']] }
  ];
  const at = STAGES.findIndex(s => s.secret); STAGES.splice(at < 0 ? STAGES.length : at, 0, ...ONI);
  STAGES.forEach((s, i) => { s.idx = i; STAGE_BY_ID[s.id] = s; });
}
/* ---------- the giant in 3D: the horned demon, huge ---------- */
{
  const bm0 = R3.bossModel.bind(R3);
  R3.bossModel = function (b) {
    if (b.id !== 'otakemaru' || CALM || !Models.ok('demon')) { if (b.id === 'otakemaru') Models.load('demon'); return bm0(b); }
    try { const T = THREE, g = new T.Group(), wrap = new T.Group(), col = BOSS_INFO.otakemaru.col, r = Models.inst('demon', '#5a1010', .25, col);
      wrap.rotation.z = Math.PI / 2; g.add(wrap); r.o.rotation.x = Math.PI / 2; r.o.scale.setScalar(4.6 / r.h); wrap.add(r.o);
      g.mon = r; g.oniMats = r.mats.filter(m => m.emissive); g.bodyMat = new T.MeshStandardMaterial(); /* (the generic boss glow goes to a stand-in; the giant's own light is set below) */ g.add(this.pool(col, 3.6, .3)); Models.play(r, 'Idle', .01); g.giant70 = 1; return g; }
    catch (e) { errLog(e); return bm0(b); }
  };
  // its motion: the punch on every slam, the flinch when struck, the idle sway; the 3D body stands where the boss stands
  Pipe.on('pre', 'oni70', () => { const b = Boss.cur; if (!b || b.id !== 'otakemaru' || !R3.ok || !W3D.live) return; if (!Models.ok('demon')) { Models.load('demon'); return; }
    const bg = R3.ent('boss' + b.id + (b.lvl || ''), () => R3.bossModel(b)); if (!bg || !bg.mon) return; const r = bg.mon, now = performance.now() / 1000, dt = Math.min(.05, Math.max(0, now - (r.t || now))); r.t = now;
    const slam = b.parts.some(p => p.alive && (p.st === 'tele' || p.st === 'down' && p.t > .9));
    if (b.fl > .6 && !r.hurtT) { Models.play(r, 'HitReact', .05, true); r.hurtT = .35; }
    if (r.hurtT > 0) r.hurtT -= dt; else { r.hurtT = 0; Models.play(r, slam ? 'Punch' : b.stag > 0 ? 'HitReact' : 'Idle', .15, slam); }
    if (r.cur === 'Punch' && r.acts.Punch && !r.acts.Punch.isRunning()) r.cur = ''; r.mixer.update(dt);
    const fl = b.fl > .3 || b._fl > .3; for (const m of bg.oniMats || []) { if (fl) { m.emissive.set('#ffffff'); m.emissiveIntensity = .55; } else if (b.stag > 0) { m.emissive.set('#ffd23f'); m.emissiveIntensity = .2 + Math.sin(now * 10) * .1; } else { m.emissive.set(BOSS_INFO.otakemaru.col); m.emissiveIntensity = b.ph >= 3 ? .22 : .1; } }
  }, 50);
}
/* the oni king's portrait in the dialogue and the comics: a red oni face, horns, burning eyes and fangs; the mouth glows as it speaks */
{
  const cp7 = charPortrait;
  charPortrait = function (g, id, t, mouth, col) {
    if (id !== 'OK') return cp7(g, id, t, mouth, col);
    g.save(); const br = Math.sin(t * 1.4) * 1.5;
    g.fillStyle = '#1a0606'; g.beginPath(); g.moveTo(-70, 80); g.quadraticCurveTo(-60, 30, -30, 26); g.lineTo(30, 26); g.quadraticCurveTo(60, 30, 70, 80); g.closePath(); g.fill(); // shoulders
    g.fillStyle = '#2a2f3a'; g.fillRect(-56, 44, 112, 10); // the iron collar
    g.fillStyle = '#e8d8b8'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 18, -40); g.quadraticCurveTo(s * 50, -64, s * 42, -92 + br); g.quadraticCurveTo(s * 34, -62, s * 6, -48); g.closePath(); g.fill(); } // horns
    const fg = g.createRadialGradient(-8, -18, 6, 0, -6, 52); fg.addColorStop(0, '#c4281e'); fg.addColorStop(1, '#5a0c08'); g.fillStyle = fg; g.beginPath(); g.ellipse(0, -6, 44, 50, 0, 0, TAU); g.fill();
    g.strokeStyle = '#1a0404'; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 34, -30); g.lineTo(s * 8, -20); g.stroke(); } // brows
    g.shadowColor = '#ffe14d'; g.shadowBlur = 14; g.fillStyle = '#ffe14d'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 18, -12, 9, 5, s * .35, 0, TAU); g.fill(); } g.shadowBlur = 0;
    g.fillStyle = '#1a0404'; g.beginPath(); g.ellipse(0, 22, 24, 7 + mouth * 9, 0, 0, TAU); g.fill(); // the mouth
    if (mouth > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,120,40,' + (.5 * mouth) + ')'; g.beginPath(); g.ellipse(0, 22, 18, 4 + mouth * 7, 0, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = '#f4ecd8'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 16, 16); g.lineTo(s * 10, 34 + mouth * 4); g.lineTo(s * 4, 16); g.fill(); } // fangs
    g.restore();
  };
}
