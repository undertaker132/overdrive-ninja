/* =====================================================================
   PETS — a small companion that runs (or swims, or flies) beside you.
   Each has one simple, deterministic trick, so replays and ghosts stay
   exact: the pet is part of the replay header (hdr.pt) and every timer
   runs on sim time. Bought and equipped in the Arsenal (PETS tab);
   V cycles your pets in the menus.
     KAYA    chihuahua: a bigger credit magnet, and she barks before boss attacks
     BUCHI   boxer: once per boss, at half health, a body-slam that staggers it
     TIGER   neon tiger: every 6s pounces on the nearest enemy
     SHARK   holo-shark: swims in the roof and bites from below every 5s
     RAVEN   cyber-raven: every 7s dives on a shooter and silences it
     DRAKE   plasma drake: every 3rd dash it spits a homing plasma bolt
   ===================================================================== */
const PETS = [
  { id: 'kaya', name: 'KAYA', kind: 'Chihuahua', col: '#ffffff', cost: 900, desc: 'A tiny white chihuahua with huge ears. Pulls credits from farther away and barks right before a boss attacks.' },
  { id: 'buchi', name: 'BUCHI', kind: 'Boxer', col: '#ff9a3d', cost: 1400, desc: 'A strong boxer with a neon collar. Once per boss, at half health, he body-slams it and staggers it.' },
  { id: 'tiger', name: 'NEON TIGER', kind: 'Cyber tiger', col: '#ff0844', cost: 1800, desc: 'A red-and-black cyber tiger. Every 6 seconds it pounces on the nearest enemy.' },
  { id: 'shark', name: 'HOLO-SHARK', kind: 'Hologram', col: '#00f2fe', cost: 2000, desc: 'A hologram shark that swims inside the roof. Every 5 seconds it bites an enemy from below.' },
  { id: 'raven', name: 'CYBER-RAVEN', kind: 'Drone bird', col: '#c9a8ff', cost: 1600, desc: 'A mechanical raven. Every 7 seconds it dives on a sniper or weaver and silences it.' },
  { id: 'drake', name: 'PLASMA DRAKE', kind: 'Mini dragon', col: '#ffd23f', cost: 2400, desc: 'A pocket dragon on your shoulder. Every third dash it spits a homing plasma bolt.' },
  { id: 'fox', name: 'SPIRIT FOX', kind: 'Three-tailed spirit', col: '#ff9ad5', cost: 2600, desc: 'A three-tailed fox spirit of pale fire. Every 30 seconds it mends one of your shields.' },
  { id: 'owl', name: 'NIGHT OWL', kind: 'Scout owl', col: '#ffe066', cost: 1700, desc: 'A silent scout with lamp eyes. Every 8 seconds it marks the toughest enemy near you: marked enemies take 50% more damage.' },
  { id: 'scarab', name: 'SUN SCARAB', kind: 'Ancient scarab', col: '#ffd23f', cost: 2300, desc: 'A golden scarab from a desert tomb. Every 9 seconds it rolls a small sun at the nearest enemy, and the sun bursts.' },
  { id: 'komainu', name: 'KOMAINU', kind: 'Shrine guardian', col: '#7dd8c8', cost: 2500, desc: 'A jade lion-dog that guarded an old shrine gate. Every 12 seconds it roars and stuns every enemy near you.' },
  { id: 'phoenix', name: 'FIRE PHOENIX', kind: 'Mythic bird', col: '#ff6a00', cost: 2800, desc: 'A small bird of everlasting fire. Every 14 seconds it circles you in flame: it burns nearby enemies and their bullets.' },
  { id: 'saucer', name: 'MINI SAUCER', kind: 'Alien drone', col: '#7dff6a', cost: 2400, desc: 'A palm-sized flying saucer. Every 10 seconds it beams up a weak enemy, or zaps a strong one.' },
  { id: 'nano', name: 'NANO SWARM', kind: 'Nanobot cloud', col: '#c9d6ff', cost: 2600, desc: 'A cloud of tiny repair bots that circles you and keeps grinding at every enemy that gets close.' },
  { id: 'k9', name: 'K9-UNIT', kind: 'Robot dog', col: '#ff9a3d', cost: 2700, desc: 'A police robot dog with a missile pack. Every 8 seconds it fires three homing missiles.' },
  { id: 'batling', name: 'BATLING', kind: 'Neon bat', col: '#b537f2', cost: -1, ev: 'halloween', desc: 'A tiny neon bat. Every 7 seconds it screeches and stuns the two enemies nearest to you. NEON HALLOWEEN event reward.' },
  { id: 'penguin', name: 'PENGUIN BOT', kind: 'Ice slider', col: '#9fe8ff', cost: -1, ev: 'winter', desc: 'A round robot penguin. Every 9 seconds it belly-slides through an enemy and freezes it. FROSTBYTE WINTER event reward.' },
  { id: 'turtle', name: 'SHELL BOT', kind: 'Mech turtle', col: '#5ee6a8', cost: 2200, desc: 'A little armored mech turtle. Every 10 seconds it charges a shell that blocks the next bullet that would hit you.' }
];
const PET_BY_ID = {}; for (const p of PETS) PET_BY_ID[p.id] = p;
/* pet levels: every enemy defeated with a pet along gives it 1 XP. Level 2-5 make its trick stronger.
   The level is frozen at the start of a run (and stored in the replay header). */
const PET_XP = [0, 40, 120, 300, 700];
function petXp(id) { const d = Store.data; return (d.petXp && d.petXp[id]) | 0; }
function petLevel(id) { const x = petXp(id); let l = 1; for (let i = 1; i < PET_XP.length; i++) if (x >= PET_XP[i]) l = i + 1; return l; }
function petLevelText(id, lv) { // what the next level does, in words
  const n = lv - 1;
  switch (id) {
    case 'kaya': return ltf('Magnet +{0}', 60 + n * 20);
    case 'buchi': return lv >= 3 ? ltf('Two slams per boss · stagger {0}s', (1.6 + n * .3).toFixed(1)) : ltf('Stagger {0}s', (1.6 + n * .3).toFixed(1));
    case 'drake': return lv >= 4 ? ltf('A bolt every 2nd dash · damage +{0}%', n * 15) : ltf('Damage +{0}%', n * 15);
    case 'fox': return ltf('Mends a shield every {0}s', (30 * (1 - .08 * n)).toFixed(1));
    case 'owl': return ltf('Every {0}s · marked enemies take +{1}% damage', (8 * (1 - .08 * n)).toFixed(1), 50 + n * 10);
    case 'scarab': return ltf('Every {0}s · damage +{1}%', (9 * (1 - .08 * n)).toFixed(1), n * 15);
    case 'komainu': return ltf('Every {0}s · stun {1}s', (12 * (1 - .08 * n)).toFixed(1), (1 + n * .2).toFixed(1));
    case 'phoenix': return ltf('Every {0}s · damage +{1}%', (14 * (1 - .08 * n)).toFixed(1), n * 15);
    case 'saucer': return ltf('Every {0}s · damage +{1}%', (10 * (1 - .08 * n)).toFixed(1), n * 15);
    case 'nano': return ltf('Grinds nearby enemies · damage +{0}%', n * 15);
    case 'batling': return ltf('Every {0}s · stun {1}s', (7 * (1 - .08 * n)).toFixed(1), (1.2 + n * .2).toFixed(1));
    case 'penguin': return ltf('Every {0}s · damage +{1}%', (9 * (1 - .08 * n)).toFixed(1), n * 15);
    case 'k9': return lv >= 4 ? ltf('Four missiles every {0}s', (8 * (1 - .08 * n)).toFixed(1)) : ltf('Three missiles every {0}s', (8 * (1 - .08 * n)).toFixed(1));
    case 'turtle': return lv >= 4 ? ltf('Holds two shells · a new one every {0}s', (10 * (1 - .08 * n)).toFixed(1)) : ltf('A new shell every {0}s', (10 * (1 - .08 * n)).toFixed(1));
    default: return ltf('Every {0}s · damage +{1}%', ({ tiger: 6, shark: 5, raven: 7 }[id] * (1 - .08 * n)).toFixed(1), n * 15);
  }
}
function petGainXp(n) { // called on kills in real runs (never in replays)
  const id = G.pet; if (!id || id === 'none' || REPLAY.on || G.mode === 'puzzle' || G.mode === 'dojo') return;
  const d = Store.data; d.petXp = d.petXp || {}; const lv0 = petLevel(id); d.petXp[id] = (d.petXp[id] | 0) + n; const lv1 = petLevel(id);
  if (lv1 > lv0) { toast(ltf('{0} REACHED LEVEL {1}', lt(PET_BY_ID[id].name), lv1), '#ffd23f'); Pet.happy = 2; }
}
const Pet = {
  x: 0, y: 0, vx: 0, ang: 0, t: 0, cd: 0, act: 0, ax: 0, ay: 0, tg: null, bossDone: '', dashN: 0, bark: 0, ph: 0, slams: 0, happy: 0, still: 0,
  begin() {
    this.x = P.x - 30; this.y = P.y + 20; this.t = 0; this.cd = this.period() * (PET4[G.pet] ? .5 : 1); this.act = 0; this.tg = null; this.bossDone = ''; this.slams = 0; this.slamN = 0; this.dashN = 0; this.bark = 0; this.happy = 0; this.still = 0; this.shell = 0; this.blocks = 0; this.mends = 0; this.marks = 0; this.uses = 0; this.fx = 0; this.fxx = 0; this.fxy = 0;
  },
  lv() { return G.petLv || 1; },
  period() { const b = { tiger: 6, shark: 5, raven: 7, fox: 30, owl: 8, turtle: 10, scarab: 9, komainu: 12, phoenix: 14, saucer: 10, nano: .5, k9: 8, batling: 7, penguin: 9 }[G.pet] || 0; return b * (1 - .08 * (this.lv() - 1)); },
  near(x, y, r, pred) { let best = null, bd = r; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || e.type === ET.COURIER || (pred && !pred(e))) continue; const d = dist(x, y, e.x, e.y); if (d < bd) { bd = d; best = e; } } return best; },
  update(dt) { // sim time only
    const id = G.pet; if (!id || id === 'none' || G.mode === 'puzzle') return;
    this.t += dt; this.ph += dt * (Math.hypot(P.vx, P.vy) > 60 ? 14 : 4);
    if (this.act > 0) { // mid-attack: dash to the target, then come back
      this.act -= dt; const k = 1 - Math.pow(.0005, dt); this.x += (this.ax - this.x) * k; this.y += (this.ay - this.y) * k; if (this.act > 0) return;
    }
    const fx = id === 'drake' ? P.x - Math.sin(P.face) * 18 : P.x - Math.cos(P.face) * 34 + Math.cos(P.face + 1.57) * 18, fy = id === 'drake' ? P.y + Math.cos(P.face) * 18 - 14 : P.y - Math.sin(P.face) * 34 + Math.sin(P.face + 1.57) * 18;
    const k = 1 - Math.pow(id === 'drake' ? .0001 : .02, dt); this.vx = (fx - this.x) * k; this.x += this.vx; this.y += (fy - this.y) * k; if (Math.abs(this.vx) > .3) this.ang = this.vx > 0 ? 0 : Math.PI;
    if (this.bark > 0) this.bark -= dt;
    const W = P.w.dmg * P.dmgMul * G.dmgMod * (1 + .15 * (this.lv() - 1)) * (G.petPow || 1); // G.petPow: pet tier (v25), 1 before
    if (id === 'tiger' || id === 'shark' || id === 'raven') {
      this.cd -= dt;
      if (this.cd <= 0) {
        const e = id === 'raven' ? this.near(P.x, P.y, 420, q => q.type === ET.SNIPER || q.type === ET.WEAVER || q.type === ET.MINER) : this.near(this.x, this.y, id === 'shark' ? 300 : 280);
        if (e) {
          this.cd = this.period(); this.act = .35; this.happy = .6; this.ax = e.x; this.ay = e.y; this.tg = e;
          if (id === 'raven') { e.stun = Math.max(e.stun, 2.2); FX.text(e.x, e.y - e.r - 12, lt('SILENCED'), '#c9a8ff', 12); FX.ring(e.x, e.y, 30, '#c9a8ff', 2); }
          else { damageEnemy(e, W * (id === 'shark' ? 1.5 : 1.2), Math.atan2(e.y - this.y, e.x - this.x), 2); FX.spark(e.x, e.y, PET_BY_ID[id].col, 10); FX.ring(e.x, e.y, 34, PET_BY_ID[id].col, 3); }
          Aud.sfx('hit', 1);
        } else this.cd = .5;
      }
    }
    if (id === 'fox' || id === 'owl' || id === 'turtle') {
      this.cd -= dt;
      if (this.cd <= 0) {
        this.cd = this.period();
        if (id === 'fox') { if (P.hp < P.maxHp && G.state === 'PLAY') { P.hp++; this.mends++; this.happy = 1.2; FX.text(P.x, P.y - 40, lt('+1 SHIELD'), '#ff9ad5', 15); FX.ring(P.x, P.y, 46, '#ff9ad5', 3); Aud.bell(1320, .25, .05); } else this.cd = 1; }
        else if (id === 'owl') { let best = null, bh = 0; for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0 || e.type === ET.COURIER || dist(P.x, P.y, e.x, e.y) > 380) continue; if (e.hp > bh) { bh = e.hp; best = e; } }
          if (best) { best.mark = 4; this.marks++; this.act = .3; this.ax = best.x; this.ay = best.y - 20; FX.ring(best.x, best.y, best.r + 14, '#ffe066', 2); Aud.bell(660, .2, .04, 'triangle'); } else this.cd = .6; }
        else if (id === 'turtle') { const cap = this.lv() >= 4 ? 2 : 1; if (this.shell < cap) { this.shell++; this.happy = .6; FX.ring(P.x, P.y, 30, '#5ee6a8', 2); } }
      }
    }
    if (PET4[id]) { this.cd -= dt; if (this.cd <= 0) PET4[id].call(this, W); }
    const b = Boss.cur;
    if (id === 'buchi' && b && b.dying <= 0 && b.enter >= 1) { const key = b.id + G.bossIdx; if (this.bossDone !== key) { this.bossDone = key; this.slams = 0; } }
    const slamAt = this.lv() >= 3 ? [.66, .33] : [.5];
    if (id === 'buchi' && b && b.dying <= 0 && b.enter >= 1 && this.slams < slamAt.length && b.hp < b.mhp * slamAt[this.slams]) {
      this.slams++; this.slamN = (this.slamN | 0) + 1; this.act = .5; this.ax = b.x; this.ay = b.y; this.happy = 1;
      b.stag = Math.max(b.stag, 1.6 + .3 * (this.lv() - 1)); b.zanN = 0; Boss.hitBody(b, W * 1.5, Math.atan2(b.y - P.y, b.x - P.x), true);
      FX.call(lt('BUCHI INCOMING!'), '#ff9a3d', 2, 22); FX.boom(b.x, b.y, 160, '#ff9a3d'); shake(.6); Aud.sfx('boom', 1);
    }
  },
  onDash() { if (G.pet !== 'drake' || G.mode === 'puzzle') return; if (++this.dashN % (this.lv() >= 4 ? 2 : 3) === 0) { shard(this.x, this.y, P.ang, 520, '#ffd23f', 1.2 * P.w.dmg * (1 + .15 * (this.lv() - 1))); FX.spark(this.x, this.y, '#ffd23f', 6); } },
  onTele() { if (G.pet === 'kaya') { this.bark = .8; if (!Aud.quiet) Aud.tone(1400, 1700, .06, .05, 'square'); } },
  draw() {
    const id = G.pet; if (!id || id === 'none' || G.mode === 'puzzle' || !(G.state === 'PLAY' || G.state === 'PAUSE' || G.state === 'PERK')) return;
    const moving = Math.hypot(P.vx, P.vy) > 40 || P.dashT > 0; this.still = moving ? 0 : this.still + RDT; if (this.happy > 0) this.happy -= RDT;
    const mood = this.act > 0 ? 0 : this.happy > 0 ? 3 : this.still > 8 ? 2 : this.still > 2 ? 1 : 0; // 1 sits, 2 sleeps, 3 happy hop
    drawPet(id, this.x, this.y - (mood === 3 ? Math.abs(Math.sin(CAM.t * 14)) * 6 : 0), this.ang, mood ? 0 : this.ph, CAM.t, this.act > 0, this.bark, mood);
    if (id === 'turtle' && this.shell > 0) { cx.save(); cx.strokeStyle = '#5ee6a8'; cx.globalAlpha = .35 + .15 * Math.sin(CAM.t * 6); cx.lineWidth = 2; for (let k = 0; k < this.shell; k++) { cx.beginPath(); for (let j = 0; j <= 6; j++) { const q = j * TAU / 6 + CAM.t * .5, r = P.r + 10 + k * 6; j ? cx.lineTo(P.x + Math.cos(q) * r, P.y + Math.sin(q) * r) : cx.moveTo(P.x + Math.cos(q) * r, P.y + Math.sin(q) * r); } cx.stroke(); } cx.restore(); }
    if (PET4D[id]) PET4D[id].call(this);
    if (id === 'owl') for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (e.alive && e.mark > 0) { cx.save(); cx.globalAlpha = Math.min(1, e.mark) * (.6 + .3 * Math.sin(CAM.t * 10)); cx.strokeStyle = '#ffe066'; cx.lineWidth = 2; cx.beginPath(); cx.arc(e.x, e.y, e.r + 10, 0, TAU); cx.moveTo(e.x - e.r - 16, e.y); cx.lineTo(e.x - e.r - 6, e.y); cx.moveTo(e.x + e.r + 6, e.y); cx.lineTo(e.x + e.r + 16, e.y); cx.stroke(); cx.restore(); } }
  }
};
function drawPet(id, x, y, ang, ph, t, attacking, bark, mood) { // vector art, facing right before the flip; mood 1 sit, 2 sleep, 3 happy
  cx.save(); cx.translate(x, y); if (ang > 1.57) cx.scale(-1, 1);
  if (mood === 1 || mood === 2) { if (id === 'kaya' || id === 'buchi' || id === 'tiger') cx.scale(1, .86); if (id === 'raven' || id === 'drake') cx.translate(0, 6); } // sitting or curled up
  const leg = Math.sin(ph) * 3;
  cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(0, 9, id === 'shark' ? 14 : 11, 4, 0, 0, TAU); cx.fill();
  cx.lineCap = 'round';
  if (id === 'kaya') {
    cx.strokeStyle = '#d8d8d8'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-4, 4); cx.lineTo(-5 + leg, 9); cx.moveTo(4, 4); cx.lineTo(5 - leg, 9); cx.stroke();
    cx.fillStyle = '#f4f4f4'; cx.beginPath(); cx.ellipse(0, 1, 7.5, 5, 0, 0, TAU); cx.fill();
    cx.strokeStyle = '#f4f4f4'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-7, 0); cx.quadraticCurveTo(-11, -6 + Math.sin(t * 16) * 2, -9, -9); cx.stroke(); // wagging tail
    cx.beginPath(); cx.arc(7, -4, 5, 0, TAU); cx.fill(); cx.beginPath(); cx.moveTo(4, -7); cx.lineTo(2, -15); cx.lineTo(7.5, -8); cx.closePath(); cx.fill(); cx.beginPath(); cx.moveTo(8, -8); cx.lineTo(12, -15); cx.lineTo(11, -6); cx.closePath(); cx.fill();
    cx.fillStyle = '#ffb7c5'; cx.beginPath(); cx.moveTo(4.6, -8.5); cx.lineTo(3.4, -12.5); cx.lineTo(6.6, -8.6); cx.closePath(); cx.fill(); // inner ear
    cx.fillStyle = '#1a1a1a'; dot(9, -5, 1.1); dot(11.8, -3.2, 1.2);
  } else if (id === 'buchi') {
    cx.strokeStyle = '#8a5a2a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-6, 4); cx.lineTo(-7 + leg, 10); cx.moveTo(6, 4); cx.lineTo(7 - leg, 10); cx.stroke();
    cx.fillStyle = '#b8743a'; cx.beginPath(); cx.ellipse(0, 1, 10, 6.5, 0, 0, TAU); cx.fill(); cx.fillStyle = '#f4e6d0'; cx.beginPath(); cx.ellipse(3, 4, 5, 2.5, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#b8743a'; cx.beginPath(); cx.arc(9, -4, 6, 0, TAU); cx.fill(); cx.fillStyle = '#3a2410'; cx.beginPath(); cx.ellipse(13, -2.5, 3.2, 2.6, 0, 0, TAU); cx.fill(); // dark muzzle
    cx.fillStyle = '#8a5020'; cx.beginPath(); cx.ellipse(5, -8, 2.6, 3.6, -.5, 0, TAU); cx.fill();
    cx.strokeStyle = '#ff9a3d'; cx.lineWidth = 2; cx.beginPath(); cx.arc(9, -4, 6.4, 1.8, 3.4); cx.stroke(); hglow(5, -1, 10, '#ff9a3d', .5); // neon collar
    cx.fillStyle = '#1a1a1a'; dot(10.5, -6, 1.1);
  } else if (id === 'tiger') {
    cx.strokeStyle = '#2a0a10'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-7, 4); cx.lineTo(-8 + leg, 10); cx.moveTo(6, 4); cx.lineTo(7 - leg, 10); cx.stroke();
    hglow(0, 0, 22, '#ff0844', attacking ? .6 : .25);
    cx.fillStyle = '#1a0408'; cx.beginPath(); cx.ellipse(0, 0, 12, 6, 0, 0, TAU); cx.fill();
    cx.strokeStyle = '#ff0844'; cx.lineWidth = 1.6; for (let k = -2; k <= 2; k++) { cx.beginPath(); cx.moveTo(k * 4, -5); cx.lineTo(k * 4 + 1.5, 0); cx.stroke(); } // neon stripes
    cx.strokeStyle = '#1a0408'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(-11, -1); cx.quadraticCurveTo(-18, -8, -15, -12 + Math.sin(t * 5) * 2); cx.stroke();
    cx.fillStyle = '#1a0408'; cx.beginPath(); cx.arc(12, -3, 5.5, 0, TAU); cx.fill(); cx.fillStyle = '#ff0844'; cx.beginPath(); cx.moveTo(9, -7); cx.lineTo(9.5, -11); cx.lineTo(12, -8); cx.closePath(); cx.fill();
    cx.fillStyle = '#ffd23f'; dot(14, -4, 1.2);
  } else if (id === 'shark') { // only the fin cuts the roof, the body is a faint hologram below
    cx.globalAlpha *= .35; cx.fillStyle = '#00f2fe'; cx.beginPath(); cx.ellipse(0, 3, 15, 5, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.moveTo(-14, 3); cx.lineTo(-21, -2); cx.lineTo(-20, 8); cx.closePath(); cx.fill(); cx.globalAlpha /= .35;
    cx.fillStyle = attacking ? '#e8fbff' : '#00f2fe'; cx.beginPath(); cx.moveTo(-4, 2); cx.lineTo(2, -11); cx.lineTo(6, 2); cx.closePath(); cx.fill(); hglow(1, -2, 14, '#00f2fe', .5);
    cx.strokeStyle = 'rgba(0,242,254,.5)'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(-10, 2 + Math.sin(t * 8)); cx.lineTo(-18, 2 + Math.sin(t * 8 + 1) * 2); cx.stroke(); // wake
    if (attacking) { cx.fillStyle = '#e8fbff'; cx.beginPath(); cx.moveTo(6, -2); cx.lineTo(16, -8); cx.lineTo(14, 0); cx.lineTo(16, 6); cx.closePath(); cx.fill(); }
  } else if (id === 'raven') {
    const fl = Math.sin(t * 14) * .6;
    cx.translate(0, -10 + Math.sin(t * 3) * 2);
    cx.fillStyle = '#14101e'; for (const s of [-1, 1]) { cx.save(); cx.scale(1, s); cx.rotate(fl * .5); cx.beginPath(); cx.moveTo(-2, 0); cx.lineTo(-6, -14); cx.lineTo(4, -4); cx.closePath(); cx.fill(); cx.strokeStyle = '#c9a8ff'; cx.lineWidth = 1; cx.stroke(); cx.restore(); }
    cx.beginPath(); cx.ellipse(0, 0, 8, 4, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.arc(8, -1, 3.5, 0, TAU); cx.fill();
    cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.moveTo(10.5, -1.5); cx.lineTo(15, 0); cx.lineTo(10.5, .8); cx.closePath(); cx.fill(); cx.fillStyle = '#ff0844'; dot(9, -2, .9);
  } else if (id === 'drake') {
    const fl = Math.sin(t * 12) * .5; hglow(0, 0, 16, '#ffd23f', .35);
    cx.fillStyle = '#c0601a'; for (const s of [-1, 1]) { cx.save(); cx.scale(1, s); cx.rotate(-fl * .4); cx.beginPath(); cx.moveTo(-2, -2); cx.quadraticCurveTo(-4, -14, 4, -12); cx.lineTo(2, -3); cx.closePath(); cx.fill(); cx.restore(); }
    cx.fillStyle = '#ff9a3d'; cx.beginPath(); cx.ellipse(0, 0, 7, 4, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.arc(7, -2, 3.6, 0, TAU); cx.fill();
    cx.strokeStyle = '#ff9a3d'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-6, 1); cx.quadraticCurveTo(-11, 4, -13, 1); cx.stroke();
    cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.moveTo(6, -5); cx.lineTo(5, -9); cx.lineTo(8, -5.5); cx.closePath(); cx.fill(); cx.fillStyle = '#1a0a04'; dot(8.6, -2.6, .9);
  } else if (id === 'fox') { // a pale-fire fox spirit with three flame tails
    hglow(0, -2, 22, '#ff9ad5', .35);
    for (let k = -1; k <= 1; k++) { const w = Math.sin(t * 6 + k) * 3; cx.fillStyle = k ? '#ffc4e6' : '#ff9ad5'; cx.beginPath(); cx.moveTo(-6, 0); cx.quadraticCurveTo(-14, -4 + k * 5 + w, -19, -8 + k * 6 + w); cx.quadraticCurveTo(-12, 2 + k * 3, -6, 3); cx.fill(); cx.fillStyle = '#ffffff'; dot(-18, -8 + k * 6 + w, 1.3); }
    cx.strokeStyle = '#f0d0e8'; cx.lineWidth = 1.8; cx.beginPath(); cx.moveTo(-3, 3); cx.lineTo(-4 + leg, 9); cx.moveTo(4, 3); cx.lineTo(5 - leg, 9); cx.stroke();
    cx.fillStyle = '#fff4fb'; cx.beginPath(); cx.ellipse(0, 0, 7.5, 4.5, 0, 0, TAU); cx.fill();
    cx.beginPath(); cx.moveTo(4, -2); cx.lineTo(13, -3); cx.lineTo(6, 3); cx.closePath(); cx.fill(); cx.beginPath(); cx.arc(7, -3, 4, 0, TAU); cx.fill();
    cx.beginPath(); cx.moveTo(5, -6); cx.lineTo(5, -12); cx.lineTo(8, -7); cx.closePath(); cx.fill(); cx.beginPath(); cx.moveTo(8, -6); cx.lineTo(10, -11); cx.lineTo(10.5, -5); cx.closePath(); cx.fill();
    cx.strokeStyle = '#ff5cae'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(6, -1); cx.lineTo(9, -1.6); cx.stroke(); // a red face marking
    cx.fillStyle = '#1a0a14'; dot(9.5, -3.5, .9);
  } else if (id === 'owl') { // a round scout owl, floating, with lamp eyes
    const fl = Math.sin(t * 9) * .4; cx.translate(0, -12 + Math.sin(t * 2.5) * 2);
    cx.fillStyle = '#3a2e22'; for (const s of [-1, 1]) { cx.save(); cx.scale(1, s); cx.rotate(fl * .3); cx.beginPath(); cx.moveTo(-3, -2); cx.quadraticCurveTo(-8, -12, 3, -9); cx.lineTo(3, -3); cx.closePath(); cx.fill(); cx.restore(); }
    cx.fillStyle = '#6a5038'; cx.beginPath(); cx.ellipse(1, 0, 7, 6.5, 0, 0, TAU); cx.fill(); cx.fillStyle = '#c9a882'; cx.beginPath(); cx.ellipse(2, 2, 4, 3.5, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#6a5038'; cx.beginPath(); cx.moveTo(-3, -5); cx.lineTo(-2, -10); cx.lineTo(1, -6); cx.fill(); cx.beginPath(); cx.moveTo(4, -6); cx.lineTo(7, -10); cx.lineTo(7, -5); cx.fill();
    hglow(3, -2, 10, '#ffe066', attacking ? .9 : .45); cx.fillStyle = '#ffe066'; dot(1, -2.5, 2.2); dot(5.5, -2.5, 2.2); cx.fillStyle = '#1a1208'; dot(1.5, -2.5, 1); dot(6, -2.5, 1);
    cx.fillStyle = '#ffb347'; cx.beginPath(); cx.moveTo(3, -.5); cx.lineTo(4.5, -.5); cx.lineTo(3.7, 1.5); cx.closePath(); cx.fill();
  } else if (id === 'turtle') { // a squat mech turtle with a glowing hex shell
    cx.strokeStyle = '#3a6a58'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-6, 4); cx.lineTo(-7 + leg * .6, 8); cx.moveTo(5, 4); cx.lineTo(6 - leg * .6, 8); cx.stroke();
    cx.fillStyle = '#2a4a3e'; cx.beginPath(); cx.arc(10, 0, 3.6, 0, TAU); cx.fill(); cx.fillStyle = '#5ee6a8'; dot(11.5, -1, 1);
    cx.fillStyle = '#1c3a30'; cx.beginPath(); cx.ellipse(0, 0, 10, 7, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#5ee6a8'; cx.lineWidth = 1.4; cx.stroke();
    cx.strokeStyle = 'rgba(94,230,168,.8)'; cx.lineWidth = 1; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; cx.beginPath(); cx.moveTo(Math.cos(a) * 3, Math.sin(a) * 2.2); cx.lineTo(Math.cos(a) * 8, Math.sin(a) * 5.6); cx.stroke(); }
    hglow(0, 0, 14, '#5ee6a8', Pet.shell > 0 ? .5 : .15);
  }
  if (PET4ART[id]) PET4ART[id](leg, t, attacking);
  if (mood === 2) { cx.fillStyle = '#c9d6ff'; cx.font = '700 9px ' + FONT_D; cx.textAlign = 'center'; for (let k = 0; k < 2; k++) { const q = (t * .6 + k * .5) % 1; cx.globalAlpha = (1 - q) * .9; cx.fillText('z', 8 + q * 8 + k * 3, -14 - q * 14); } cx.globalAlpha = 1; }
  if (mood === 3) { cx.fillStyle = '#ff5c8a'; const q = (t * 1.5) % 1; cx.globalAlpha = 1 - q; cx.beginPath(); cx.arc(4, -18 - q * 10, 2.4, 0, TAU); cx.arc(8, -18 - q * 10, 2.4, 0, TAU); cx.moveTo(1.7, -17 - q * 10); cx.lineTo(6, -12 - q * 10); cx.lineTo(10.3, -17 - q * 10); cx.fill(); cx.globalAlpha = 1; }
  if (bark > 0) { cx.scale(ang > 1.57 ? -1 : 1, 1); cx.fillStyle = '#ffd23f'; cx.font = '900 13px ' + FONT_D; cx.textAlign = 'center'; cx.fillText('!', 4, -20 - (1 - bark) * 6); }
  cx.restore();
}
/* V cycles your pets outside a run */
window.addEventListener('keydown', e => {
  if (e.code !== 'KeyV' || e.repeat || G.state === 'PLAY' || REPLAY.on) return; const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA') return;
  const d = Store.data, own = ['none'].concat(PETS.filter(p => d.pets && d.pets[p.id]).map(p => p.id)); if (own.length < 2) return;
  d.pet = own[(own.indexOf(d.pet || 'none') + 1) % own.length]; Store.touch(); Aud.sfx('ui'); toast(d.pet === 'none' ? lt('NO PET') : ltf('PET: {0}', lt(PET_BY_ID[d.pet].name)), '#ffd23f');
  if (UI.cur === 'arsenal') UI.renderArsenal();
});
