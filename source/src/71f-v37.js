/* =====================================================================
   VERSION 37 — SKILL. Swiping at random should not win:
   · a dash is invulnerable only for its first 0.12 s (whole dash before)
   · two or more dashes in a row that hit nothing heat the blade and cut the
     combo timer; a dash that hits cools the blade a little
   · less aim help on RONIN and above, none for mouse aim at the cursor;
     the adaptive difficulty forgives half as much after a hit
   · THORNS elites: a direct dash bounces off the spikes (and costs heat and
     a charge); a rail bounce or Overdrive cuts through
   · the results grade your play (accuracy, parries, rail bounces, hits)
     and give one concrete tip
   Rules that change the simulation are on for version 37 and newer, so
   older replays keep playing back exactly.
   ===================================================================== */
const Skill = {
  s: { dashes: 0, hit: 0, whiffs: 0, streak: 0, bounces: 0, thorns: 0 },
  reset() { this.s = { dashes: 0, hit: 0, whiffs: 0, streak: 0, bounces: 0, thorns: 0 }; },
  exempt() { const o = G.obj; return G.mode === 'puzzle' || G.mode === 'dojo' || G.mode === 'highway' || (G.mode === 'story' && o && (o.t === 'collect' || o.t === 'escort' || o.t === 'hack')); },
  targets() { for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.al <= 0 && e.y > 0 && e.y < V.VH && e.type !== ET.TREASURE) return true; } return !!(Boss.cur && Boss.cur.enter >= 1 && Boss.cur.dying <= 0); },
  onHit() { if (P.dHit) return; P.dHit = 1; if (simV(37) && G.odT <= 0) P.heat = Math.max(0, P.heat - 6); },
  dashEnd() {
    if (this.exempt() || !this.targets()) return; const s = this.s; s.dashes++;
    if (P.dHit) { s.hit++; s.streak = 0; return; }
    s.whiffs++; s.streak++;
    if (!simV(37) || s.streak < 2 || G.odT > 0) return;
    P.heat += 9 * Math.min(3, s.streak - 1) * (P.heatMul || 1); G.ct = Math.min(G.ct, .5);
    FX.text(P.x, P.y - 26, lt('MISS'), '#8fa4c8', 12, 0, 'miss');
    if (P.heat >= 100 && P.lock <= 0) { P.lock = 1.3; P.heat = 62; FX.call(lt('OVERHEAT'), '#ff3b3b', 2); Aud.sfx('deny'); }
    if (s.whiffs === 4) hint('miss', lt('DASHES THAT HIT NOTHING HEAT YOUR BLADE: AIM, THEN RELEASE'));
  },
  thorns(e) { // a direct dash into a THORNS elite bounces off
    this.s.thorns++; e.hid = P.seq; P.vx *= -.55; P.vy *= -.55; P.dashT = Math.min(P.dashT, .06);
    P.heat += 25 * (P.heatMul || 1); G.ct = Math.min(G.ct, .4); if (P.ch > 0 && G.odT <= 0) P.ch--;
    FX.spark(e.x, e.y, '#ff3b5c', 12); FX.text(e.x, e.y - e.r - 14, lt('THORNS'), '#ff3b5c', 13, 0, 'thorns'); Aud.sfx('deny'); shake(.15);
    hint('thorns', lt('THORNS: BOUNCE OFF A SIDE RAIL FIRST, OR USE OVERDRIVE, TO CUT THROUGH THE SPIKES'));
  }
};
{ const he0 = hitEnemy; hitEnemy = function (e) {
    if (simV(37) && e.aff === 5 && e.alive && e.hid !== P.seq && !P.bounced && G.odT <= 0 && G.mode !== 'dojo') { Skill.thorns(e); return; }
    const was = e.hid; he0(e); if (e.hid === P.seq && was !== P.seq) Skill.onHit(); };
  const pb0 = parryBullet; parryBullet = function (b) { pb0(b); Skill.onHit(); };
  const hb0 = Boss.hitBody.bind(Boss); Boss.hitBody = function (b, d, a, ig, fx, fy) { if (P.dashT > 0) Skill.onHit(); return hb0(b, d, a, ig, fx, fy); };
  const sl0 = slash; slash = function (a) { P.dHit = 0; return sl0(a); };
  const up0 = updatePlayer; updatePlayer = function (dt, rd) { const was = P.dashT > 0, wb = P.bounced; up0(dt, rd); if (was && !wb && P.bounced) Skill.s.bounces++; if (was && P.dashT <= 0) Skill.dashEnd(); };
  const db0 = Director.begin.bind(Director); Director.begin = function (m, s) { Skill.reset(); return db0(m, s); }; }
/* THORNS: red spikes around the body */
{ const de1 = drawEnemy; drawEnemy = function (e) { de1(e); if (e.aff !== 5 || !e.alive || !(EDRAW & ED_BODY)) return; const r = e.r * (e.scale || 1) + 3, t = CAM.t * 1.5;
    cx.save(); cx.fillStyle = '#ff3b5c'; cx.strokeStyle = '#ffffff'; cx.lineWidth = 1;
    for (let k = 0; k < 10; k++) { const a = t + k * TAU / 10, c = Math.cos(a), s = Math.sin(a); cx.beginPath(); cx.moveTo(e.x + c * (r + 9), e.y + s * (r + 9)); cx.lineTo(e.x + Math.cos(a + .2) * r, e.y + Math.sin(a + .2) * r); cx.lineTo(e.x + Math.cos(a - .2) * r, e.y + Math.sin(a - .2) * r); cx.closePath(); cx.fill(); cx.stroke(); }
    cx.restore(); }; }
/* the skill grade on the results screen */
const Grade = {
  show(o) {
    const box = $('rsGrade'); if (!box) return; const s = Skill.s; box.textContent = '';
    if (s.dashes < 5 || REPLAY.on) { box.classList.add('hidden'); return; }
    const acc = s.hit / s.dashes, par = G.parries | 0, hits = G.hits | 0, mc = G.maxCombo | 0;
    let sc = acc * 55 + Math.min(18, par * 2.5) + Math.min(12, s.bounces * 3) + Math.min(15, mc / 4) - hits * 7 - s.thorns * 2;
    sc = Math.max(0, Math.min(100, sc));
    const G0 = [[90, 'SSS', '#ff2bd6'], [82, 'SS', '#ff4fd8'], [74, 'S', '#ffd23f'], [62, 'A', '#00ff88'], [48, 'B', '#00f2fe'], [34, 'C', '#8fa4c8'], [0, 'D', '#ff3b5c']].find(g => sc >= g[0]);
    let tip;
    if (acc < .6) tip = ltf('{0} of your {1} dashes hit nothing. Hold to aim (time slows), then release on a target.', s.dashes - s.hit, s.dashes);
    else if (hits >= 2) tip = ltf('You took {0} hits. Watch the red rings: enemies flash before they attack.', hits);
    else if (par === 0) tip = lt('No parries yet: slash an orange bullet right as your dash starts to send it back.');
    else if (s.bounces === 0) tip = lt('Bounce off a side rail mid-dash: the next hit is a sure critical and cuts through THORNS.');
    else tip = lt('Clean run. Next: keep the combo alive between waves for a higher score.');
    const g = el('div', 'gl', G0[1]); g.style.color = G0[2]; box.appendChild(g);
    box.appendChild(el('div', 'gt', lt('SKILL GRADE')));
    box.appendChild(el('div', 'gs', ltf('ACCURACY {0}% · PARRIES {1} · RAIL BOUNCES {2} · HITS TAKEN {3}', Math.round(acc * 100), par, s.bounces, hits)));
    box.appendChild(el('div', 'tip', tip)); box.classList.remove('hidden');
  }
};
{ const or1 = UI.openResult.bind(UI); UI.openResult = function (o) { or1(o); try { Grade.show(o); } catch (e) { errLog(e); } }; }
