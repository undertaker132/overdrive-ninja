/* =====================================================================
   PROFILE — titles and profile frames you earn, shown on the leaderboard,
   and the CODEX: every enemy and boss you have met, drawn, with how it
   fights and how many you have cut down.
   save: codex { seen: {type: 1}, k: {type: kills}, bs: {boss: 1}, b: {boss: wins} } · title · frame
   ===================================================================== */
const CODEX_E = [ // [type, how it fights / how to beat it]
  [ET.DRONE, 'Fast little skitter-bot that rams you. Cheap, but they come in swarms. Slash them before they touch you.'],
  [ET.SNIPER, 'Keeps its distance and aims with an orange laser before it fires. Step off the line, or parry the shot back.'],
  [ET.BRUTE, 'A green shield blocks hits from the front. Bounce off a rail first, hit it from behind, or break it with a perfect parry.'],
  [ET.BOMBER, 'Rushes you and blinks before it explodes. Slash it early or get out of the ring.'],
  [ET.WEAVER, 'Circles you and spins out rings of bullets. Dash through the gaps and parry what you can.'],
  [ET.PHANTOM, 'Fades out and reappears right next to you. Watch for the shimmer and strike first.'],
  [ET.SPLITTER, 'Splits into two minis when it dies. Save a dash for the pieces.'],
  [ET.MINI, 'The small half of a splitter. Weak, but quick.'],
  [ET.WARDEN, 'Tethers its friends to give them shield bubbles. Cut the warden first and the bubbles fall.'],
  [ET.MEDIC, 'Heals the most hurt enemy nearby and gives it a shield. Always cut the medic first.'],
  [ET.MIMIC, 'Copies your last dash a moment later. The pink line shows where it will go: step off it.'],
  [ET.MINER, 'Circles at mid range and drops proximity mines. Dash straight through a mine to disarm it.'],
  [ET.MIRROR, 'Its bright arc bounces your dash away. Hit the dark side, or use the bounce for a ricochet crit.'],
  [ET.COURIER, 'Carries stolen data and blinks to a far corner every time you hit it. Keep chasing before the timer runs out.'],
  [ET.TREASURE, 'A golden drone full of credits that runs away. Catch it before it escapes for a jackpot.'],
  [ET.CLONE, 'A shadow clone of Kage. It dashes along a red line after a short warning.'],
  [ET.ENFORCER, 'Mini-boss. A front shield and a charge along a red line. Step aside and let it hit the wall: that stuns it and drops the shield.'],
  [ET.SPIDER, 'Mini-boss. A slow walking tank that fires fans of bullets and drops mines. Stay close to its flank.'],
  [ET.WRAITH, 'Mini-boss. Spirals bullets, fades out, then blinks next to you with a ring of shots. Keep moving when it fades.']
];
const CODEX_B = {
  warden: 'A train security mech. Cut its weapon arms, then slash the gold weakpoint arc to stagger it.',
  hydra: 'A three-headed gunship. Destroy the heads to drop its shield, then go for the core.',
  kage: 'The shadow ronin. Dash into his red line to clash and stun him, then strike.',
  shogun: 'The rogue transit AI. Break the firewall nodes, then survive the glitch storm.',
  raijin: 'The storm god of the orbital ring. Break the thunder drums and find the gap in the lightning curtain.'
};
Object.assign(CODEX_B, {
  renull: 'Your own copy. Clash with its dash, break the mirror nodes, and expect every dash to strike twice.',
  leviathan: 'A harbor serpent mech. Break the hull plates along its body, never walk into it, and leave the circle when it dives.',
  benkei: 'The monastery guardian. Ring the four bells in the order the numbers show to break its seal, then strike.',
  prime: 'The founder in a war frame. Break both arm cannons, stay between the clock hands, and keep moving in the lightning.',
  valkyrie: 'An orbital angel-frame. Break the blade wings, and let her spear dive hit a rail to stun her.',
  chimera: 'Hydra, Kage and Shogun fused into one. Every head you delete takes its attack with it.',
  genesis: 'The final machine. Break the halo nodes, clash with its judgement dash, and survive the code rain.',
  hyakki: 'The night parade of a hundred demons: a lantern ox-cart with a demon face. Leave the red lane before it charges, cut its three spirit lanterns, and survive the blood moon.',
  tenkai: 'The orbital judge, an eye of white-gold glass. Break its four mirror panels to blind the solar lance, and step off the red line before it burns.',
  izanami: 'The first machine mind of all. Her two hands create and destroy: cut them both, dodge the slams and slip between her twin spirals.',
  oryu: 'The last echo of Kurogane, a serpent of deep-sea cable. Cut the three cable cores, stay off its body, and escape its closing rings.'
});

function pcodex() { const d = Store.data; if (!d.codex || typeof d.codex !== 'object') d.codex = {}; const c = d.codex; c.seen = c.seen || {}; c.k = c.k || {}; c.bs = c.bs || {}; c.b = c.b || {}; return c; }
function codexSeen(t) { if (REPLAY.on || G.mode === 'puzzle') return; const c = pcodex(); if (!c.seen[t]) { c.seen[t] = 1; Store.touch(); } }
function codexKill(t) {
  if (REPLAY.on || G.mode === 'puzzle' || G.mode === 'dojo') return; const c = pcodex(); c.k[t] = (c.k[t] | 0) + 1; c.seen[t] = 1; Store.dirty = true; petGainXp(1);
  if (c.k[t] === LORE_AT && CODEX_LORE[t] && EDEF[t]) toast(ltf('LORE UNLOCKED: {0}', lt(EDEF[t].name)), '#b48cff');
  else if (c.k[t] % 25 === 0 && c.k[t] <= 125 && EDEF[t]) toast(ltf('CODEX MASTERY: +{0}% DAMAGE TO {1}', codexBonus(c.k[t]) * 100 | 0, lt(EDEF[t].name)), '#ffd700');
}
/* codex mastery: every 25 kills of a type adds 3% damage against it, up to 15% at 125 */
const LORE_AT = 10;
function codexBonus(k) { return Math.min(.15, Math.floor((k | 0) / 25) * .03); }
function codexBonuses() { const k = pcodex().k, o = {}; for (const t in k) { const b = codexBonus(k[t]); if (b > 0) o[t] = b; } return o; }
const CODEX_LORE = {
  [ET.DRONE]: 'Kurogane MK-I swarm drone. Mass-produced in the Neon Harbor, a thousand a night.',
  [ET.SNIPER]: 'Optic sniper unit. Its neural laser predicts where you will be, not where you are.',
  [ET.BRUTE]: 'Aegis heavy brute. A riot frame built to hold a train door against a crowd.',
  [ET.BOMBER]: 'Volt bomber. Its core is a stolen battery cell: it was never meant to come back.',
  [ET.WEAVER]: 'Weaver drone. Its bullet rings were designed as crowd fences, not weapons.',
  [ET.PHANTOM]: 'Ghost-line phantom. A phase-shifting assassin first seen in the old subway.',
  [ET.SPLITTER]: 'Splitter. Two cheap frames bolted together, so one kill costs two.',
  [ET.MINI]: 'Splitter half. It keeps fighting with half a brain.',
  [ET.WARDEN]: 'Shield warden. Its tether borrows power from the train itself.',
  [ET.MEDIC]: 'Field medic. Kurogane would rather repair a drone than lose the data inside it.',
  [ET.MIMIC]: 'Mimic. It learns your last move from the camera on its face.',
  [ET.MINER]: 'Miner. It was built to lay track sensors. Kurogane taught it to lay mines.',
  [ET.MIRROR]: 'Mirror knight. Its arc is polished from an old solar sail.',
  [ET.COURIER]: "Data courier. Every package it carries is somebody's stolen memory.",
  [ET.TREASURE]: "Gold drone. A bank's armored courier, rerouted by someone in the undercity.",
  [ET.CLONE]: 'Shadow clone. A hard-light copy of Kage: three seconds of his old moves.',
  [ET.ENFORCER]: 'Enforcer. A charging riot captain. The train walls are stronger than it is.',
  [ET.SPIDER]: 'Spider tank. Built for the tunnels, it can walk upside down on a train roof.',
  [ET.WRAITH]: 'Wraith. Nobody has seen its frame. Only the bullets, and then the blink.'
};
function codexBoss(id, won) { if (REPLAY.on) return; const c = pcodex(); c.bs[id] = 1; if (won) c.b[id] = (c.b[id] | 0) + 1; Store.touch(); }
function codexDone() { const c = pcodex(); return CODEX_E.every(e => c.seen[e[0]]) && BOSS_ORDER.every(b => c.bs[b]); }
const TITLES = [
  { id: 'rookie', n: 'ROOKIE', d: 'Everyone starts here', ok: () => true },
  { id: 'slasher', n: 'SLASHER', d: 'Destroy 1,000 enemies', ok: d => d.stats.kills >= 1000 },
  { id: 'combo', n: 'COMBO ARTIST', d: 'Reach a x40 combo', ok: d => d.stats.maxCombo >= 40 },
  { id: 'parry', n: 'PARRY KING', d: 'Land 200 perfect parries', ok: d => d.stats.parries >= 200 },
  { id: 'mini', n: 'GIANT SLAYER', d: 'Defeat 10 mini-bosses', ok: () => MINI_BOSSES.reduce((a, t) => a + (pcodex().k[t] | 0), 0) >= 10 },
  { id: 'hunter', n: 'BOSS HUNTER', d: 'Defeat all five bosses', ok: () => BOSS_ORDER.every(b => (pcodex().b[b] | 0) > 0) },
  { id: 'sage', n: 'PUZZLE SAGE', d: 'Earn 60 puzzle stars', ok: () => Puzzles.stars() >= 60 },
  { id: 'heat', n: 'FIREWALKER', d: 'Finish an arcade run with 10 contract heat', ok: d => (d.maxHeat | 0) >= 10 },
  { id: 'speed', n: 'SPEED DEMON', d: 'Finish a story speedrun in under 20 minutes', ok: d => d.speed.best > 0 && d.speed.best < 1200000 },
  { id: 'raid', n: 'RAID LEADER', d: 'Win a boss raid with friends', ok: d => (d.live && d.live.raids | 0) > 0 },
  { id: 'archivist', n: 'ARCHIVIST', d: 'Fill every page of the codex', ok: () => codexDone() },
  { id: 'season', n: 'SEASON CHAMPION', d: 'Reach the last tier of a season', ok: d => !!(d.season && d.season.champ) },
  { id: 'legend', n: 'LEGEND OF NEO EDO', d: 'Beat the story on OVERDRIVE difficulty', ok: d => !!d.ach.nightmare }
];
const FRAMES = [
  { id: 'none', n: 'NO FRAME', c: '#23305e', d: '', ok: () => true },
  { id: 'neon', n: 'NEON', c: '#00f2fe', d: 'Clear chapter 1 of the story', ok: d => !!d.story.stars['1-3'] },
  { id: 'gold', n: 'GOLD', c: '#ffd700', d: 'Earn 24 story stars', ok: () => Store.stars() >= 24 },
  { id: 'sakura', n: 'SAKURA', c: '#ff7ab8', d: 'Earn 30 puzzle stars', ok: () => Puzzles.stars() >= 30 },
  { id: 'circuit', n: 'CIRCUIT', c: '#00ff88', d: 'Meet every enemy in the codex', ok: () => CODEX_E.every(e => pcodex().seen[e[0]]) },
  { id: 'flame', n: 'INFERNO', c: '#ff6a00', d: 'Finish an arcade run with 6 contract heat', ok: d => (d.maxHeat | 0) >= 6 },
  { id: 'team', n: 'TEAM', c: '#ff4fd8', d: 'Play 3 live games with friends', ok: d => (d.live && d.live.games | 0) >= 3 },
  { id: 'storm', n: 'STORM', c: '#9fd8ff', d: 'Defeat Raijin', ok: d => !!d.ach.raijin },
  { id: 'season', n: 'SEASON', c: '#ffd23f', d: 'Reach tier 10 of a season', ok: d => !!(d.season && d.season.t10) },
  { id: 'void', n: 'VOID', c: '#b537f2', d: 'Clear New Game+', ok: d => !!d.ach.ngplus }
];
function titleOf(id) { return TITLES.find(t => t.id === id) || TITLES[0]; }
function frameOf(id) { return FRAMES.find(f => f.id === id) || FRAMES[0]; }
function drawFrame(g, id, S) { // an ornamental border around a square portrait
  const f = frameOf(id), c = f.c, k = S / 112; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (id === 'none') { g.strokeStyle = c; g.lineWidth = 2 * k; g.strokeRect(1 * k, 1 * k, S - 2 * k, S - 2 * k); g.restore(); return; }
  g.shadowColor = c; g.shadowBlur = 10 * k; g.strokeStyle = c; g.lineWidth = 4 * k; g.strokeRect(4 * k, 4 * k, S - 8 * k, S - 8 * k); g.shadowBlur = 0;
  g.lineWidth = 1.5 * k; g.strokeRect(10 * k, 10 * k, S - 20 * k, S - 20 * k);
  const corner = (x, y, sx, sy) => {
    g.save(); g.translate(x, y); g.scale(sx * k, sy * k); g.fillStyle = c; g.strokeStyle = c;
    if (id === 'gold') { g.beginPath(); g.moveTo(0, 0); g.lineTo(22, 0); g.lineTo(0, 22); g.closePath(); g.fill(); g.fillStyle = '#fff6c4'; g.beginPath(); g.arc(7, 7, 3, 0, TAU); g.fill(); }
    else if (id === 'sakura') { for (let i = 0; i < 5; i++) { const a = i * TAU / 5; g.beginPath(); g.ellipse(12 + Math.cos(a) * 5, 12 + Math.sin(a) * 5, 4, 2.4, a, 0, TAU); g.fill(); } g.fillStyle = '#ffe14d'; g.beginPath(); g.arc(12, 12, 2, 0, TAU); g.fill(); }
    else if (id === 'circuit') { g.lineWidth = 2; g.beginPath(); g.moveTo(2, 20); g.lineTo(2, 8); g.lineTo(8, 2); g.lineTo(22, 2); g.moveTo(6, 26); g.lineTo(6, 12); g.lineTo(12, 6); g.lineTo(26, 6); g.stroke(); g.beginPath(); g.arc(22, 2, 2.5, 0, TAU); g.arc(26, 6, 2.5, 0, TAU); g.fill(); }
    else if (id === 'flame') { for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(4 + i * 8, 4); g.quadraticCurveTo(8 + i * 8, -10, 12 + i * 8, 4); g.closePath(); g.fill(); } g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(8, 8, 3, 0, TAU); g.fill(); }
    else if (id === 'storm') { g.lineWidth = 2.5; g.beginPath(); g.moveTo(4, 2); g.lineTo(14, 2); g.lineTo(8, 12); g.lineTo(18, 12); g.lineTo(4, 28); g.lineTo(10, 15); g.lineTo(2, 15); g.closePath(); g.fill(); }
    else if (id === 'void') { g.globalAlpha = .6; g.beginPath(); g.arc(10, 10, 9, 0, TAU); g.fill(); g.globalAlpha = 1; g.fillStyle = '#00f2fe'; g.beginPath(); g.arc(10, 10, 3, 0, TAU); g.fill(); }
    else if (id === 'team') { for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(6 + i * 7, 6 + (i % 2) * 4, 3.4, 0, TAU); g.fill(); } }
    else if (id === 'season') { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * TAU / 10, r = i % 2 ? 4 : 10; g.lineTo(12 + Math.cos(a) * r, 12 + Math.sin(a) * r); } g.closePath(); g.fill(); }
    else { g.lineWidth = 3; g.beginPath(); g.moveTo(0, 18); g.lineTo(0, 0); g.lineTo(18, 0); g.stroke(); }
    g.restore();
  };
  corner(2 * k, 2 * k, 1, 1); corner(S - 2 * k, 2 * k, -1, 1); corner(2 * k, S - 2 * k, 1, -1); corner(S - 2 * k, S - 2 * k, -1, -1);
  g.restore();
}
function enemyPortrait(g, t, S) { // the real in-game drawing of an enemy type, centered
  const d = EDEF[t], e = { x: 0, y: 0, r: d.r, type: t, col: d.col, scale: 1, vis: 1, fl: 0, al: 0, t: 1.2, ang: -Math.PI / 2 + .4, sh: t === ET.BRUTE || t === ET.ENFORCER ? 1 : 0, bub: t === ET.WARDEN ? 0 : 0, elite: 0, hpBar: 0, mhp: 1, hp: 1,
    st: 0, stT: 0, fuse: 0, link: null, mb: 0, sa: 0.8, da: 0, aff: 0, pz: 0, spawnT: 0, kbx: 0, kby: 0, uid: 1 };
  withCtx(g, () => { g.save(); const sc = S / Math.max(60, d.r * 4.4); g.translate(S / 2, S / 2); g.scale(sc, sc); try { drawEnemy(e); } catch (er) { errLog(er); } g.restore(); });
}
function bossPortrait(g, id, S) { // the boss itself, built like Boss.spawn but never placed in a run
  const def = BOSSDEF[id], info = BOSS_INFO[id];
  withCtx(g, () => {
    g.save(); g.translate(S / 2, S / 2);
    try {
      const b = { id, def, info, x: 0, y: 0, r: 44, hp: 60, mhp: 60, ph: 1, t: 1, st: 'idle', stT: 1.5, wp: -1, wpOn: true, stag: 0, fl: 0, shield: false, parts: [], hid: -1, echoHit: -1, cd: 1.5, enter: 1, dying: 0, boomT: 0, ang: Math.PI / 2, vx: 0, vy: 0,
        beam: { on: 0, tele: 0, a: 0, va: 0, n: 0, len: 0, w: 7 }, hx: 0, hy: 0, aIdx: 0, lvl: 1, bodyMul: 1, guard: false, minions: 0 };
      const keepV = { CX: V.CX, VH: V.VH }; def.init(b); V.CX = keepV.CX; V.VH = keepV.VH; b.x = 0; b.y = 0; b.enter = 1; b.wpOn = false; b.beam.on = 0; b.beam.tele = 0;
      Boss.partPos(b); let ext = b.r; for (const p of b.parts) ext = Math.max(ext, Math.hypot(p.x, p.y) + p.r);
      const sc = S * .42 / Math.max(40, ext); g.scale(sc, sc); def.draw(b);
    } catch (er) { g.restore(); g.save(); g.translate(S / 2, S / 2); g.fillStyle = info.col; g.beginPath(); g.arc(0, 0, S * .3, 0, TAU); g.fill(); }
    g.restore();
  });
}
Object.assign(UI, {
  meTab: 0, cdxSel: null,
  openProfile() { G.state = 'MENU'; this.backFn = null; this.show('me'); this.renderProfileMe(); },
  renderProfileMe() {
    const d = Store.data, me = $('meTop'); me.textContent = '';
    const cv = document.createElement('canvas'); cv.width = cv.height = 224; cv.className = 'pf'; const g = cv.getContext('2d');
    drawIcon(g, { tab: 'heroes', id: d.skin }, 224); drawFrame(g, d.frame || 'none', 224); me.appendChild(cv);
    const info = el('div', 'col'); info.style.gap = '4px';
    info.appendChild(el('h2', '', d.user.guest ? lt('GUEST') : d.user.name.toUpperCase()));
    info.appendChild(el('div', 'gold', lt(titleOf(d.title).n)));
    info.appendChild(el('div', 'small mute', ltf('★ {0} story · ★ {1} puzzles · {2} kills', Store.stars(), Puzzles.stars(), fmtNum(d.stats.kills))));
    me.appendChild(info);
    const tabs = $('meTabs'); tabs.textContent = ''; tabs.style.gridTemplateColumns = 'repeat(4,1fr)';
    ['TITLES', 'FRAMES', 'CODEX', 'STATS'].forEach((n, i) => { const b = el('button', i === this.meTab ? 'on' : '', lt(n)); b.onclick = () => { Aud.sfx('ui'); this.meTab = i; this.renderProfileMe(); }; tabs.appendChild(b); });
    const box = $('meList'); box.textContent = '';
    if (this.meTab === 0) {
      for (const T of TITLES) {
        const own = T.ok(d), on = (d.title || 'rookie') === T.id, b = el('button', 'item' + (on ? ' on' : '') + (own ? '' : ' lock'));
        b.appendChild(el('span', 'nm', lt(T.n))); b.appendChild(el('span', 'pr', on ? lt('ACTIVE') : own ? lt('AVAILABLE') : lt('LOCKED'))); b.appendChild(el('span', 'ds', lt(T.d)));
        b.onclick = () => { if (!own) { Aud.sfx('deny'); return; } Aud.sfx('ui'); d.title = T.id; Store.touch(); Store.flush(); Cloud.publishStats(); this.renderProfileMe(); };
        box.appendChild(b);
      }
    } else if (this.meTab === 1) {
      const grid = el('div', 'pzgrid'); grid.style.gridTemplateColumns = 'repeat(3,1fr)';
      for (const F of FRAMES) {
        const own = F.ok(d), on = (d.frame || 'none') === F.id, b = el('button', (on ? 'on' : '') + (own ? '' : ' lock'));
        const c = document.createElement('canvas'); c.width = c.height = 112; c.style.width = c.style.height = '64px'; const gg = c.getContext('2d'); gg.fillStyle = '#070a18'; gg.fillRect(0, 0, 112, 112); drawFrame(gg, F.id, 112); b.appendChild(c);
        b.appendChild(el('span', 'st', lt(F.n))); b.title = own ? lt(F.n) : lt(F.d);
        b.onclick = () => { if (!own) { Aud.sfx('deny'); toastDom(lt(F.d)); return; } Aud.sfx('ui'); d.frame = F.id; Store.touch(); Store.flush(); Cloud.publishStats(); this.renderProfileMe(); };
        grid.appendChild(b);
      }
      box.appendChild(grid); box.appendChild(el('div', 'small mute', lt('Locked frames show how to earn them when you tap them.')));
    } else if (this.meTab === 2) {
      const c = pcodex(), all = CODEX_E.length + CODEX_BOSSES.length, got = CODEX_E.filter(e => c.seen[e[0]]).length + CODEX_BOSSES.filter(b => c.bs[b]).length;
      box.appendChild(el('div', 'small mute', ltf('{0} of {1} entries found. Meet an enemy in a run to unlock its page.', got, all)));
      const grid = el('div', 'pzgrid'); grid.style.gridTemplateColumns = 'repeat(4,1fr)';
      const entry = (key, seen, draw, label) => {
        const b = el('button', (this.cdxSel === key ? 'on' : '') + (seen ? '' : ' lock')); const cc = document.createElement('canvas'); cc.width = cc.height = 112; cc.style.width = cc.style.height = '58px';
        const gg = cc.getContext('2d'); gg.fillStyle = '#070a18'; gg.fillRect(0, 0, 112, 112); if (seen) draw(gg); else { gg.fillStyle = '#23305e'; gg.font = '700 44px ' + FONT_D; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('?', 56, 58); }
        b.appendChild(cc); b.appendChild(el('span', 'st', seen ? label : '???'));
        b.onclick = () => { Aud.sfx(seen ? 'ui' : 'deny'); if (!seen) return; this.cdxSel = key; this.renderProfileMe(); };
        grid.appendChild(b);
      };
      for (const [t] of CODEX_E) entry('e' + t, !!c.seen[t], gg => enemyPortrait(gg, t, 112), lt(EDEF[t].name));
      for (const id of CODEX_BOSSES) entry('b' + id, !!c.bs[id], gg => bossPortrait(gg, id, 112), lt(BOSS_INFO[id].name));
      box.appendChild(grid);
      const sel = this.cdxSel, det = el('div', 'panel small');
      if (sel && sel[0] === 'e') { const t = +sel.slice(1), row = CODEX_E.find(e => e[0] === t); det.appendChild(el('div', 'gold', lt(EDEF[t].name) + (EDEF[t].mb ? ' · ' + lt('MINI-BOSS') : ''))); det.appendChild(el('div', '', lt(row[1]))); det.appendChild(el('div', 'mute', ltf('Defeated: {0}', fmtNum(c.k[t] | 0))));
        { const k = c.k[t] | 0, b = codexBonus(k); det.appendChild(el('div', 'gold', ltf('MASTERY BONUS: +{0}% DAMAGE', b * 100 | 0) + (b < .15 ? ' · ' + ltf('next at {0}', (Math.floor(k / 25) + 1) * 25) : ''))); }
        if (CODEX_LORE[t]) det.appendChild(el('div', 'mute lore', (c.k[t] | 0) >= LORE_AT ? lt(CODEX_LORE[t]) : ltf('LORE: defeat {0} to unlock ({1}/{0})', LORE_AT, c.k[t] | 0)));
        box.insertBefore(det, grid); }
      else if (sel && sel[0] === 'b') { const id = sel.slice(1); det.appendChild(el('div', 'gold', lt(BOSS_INFO[id].name) + ' · ' + lt(BOSS_INFO[id].sub))); det.appendChild(el('div', '', lt(CODEX_B[id]))); det.appendChild(el('div', 'mute', ltf('Defeated: {0}', fmtNum(c.b[id] | 0)))); box.insertBefore(det, grid); }
    } else {
      const s = d.stats, st = el('div', 'stat');
      const rows = [[lt('KILLS'), fmtNum(s.kills)], [lt('PERFECT PARRIES'), fmtNum(s.parries)], [lt('MAX COMBO'), 'x' + s.maxCombo], [lt('RUNS'), fmtNum(s.runs)], [lt('TIME PLAYED'), (s.time / 3600).toFixed(1) + 'h'],
        [lt('STORY STARS'), Store.stars() + '/' + MAIN_STAGES * 3], [lt('PUZZLE STARS'), Puzzles.stars() + '/' + Puzzles.total()], [lt('SPEEDRUN'), d.speed.best ? fmtMs(d.speed.best) : '—'],
        [lt('BEST MAGLEV'), fmtNum(d.best.endless)], [lt('BEST TIME ATTACK'), fmtNum(d.best.timeattack)], [lt('LIVE GAMES'), fmtNum((d.live && d.live.games) | 0)], [lt('MINI-BOSSES'), fmtNum(MINI_BOSSES.reduce((a, t) => a + (pcodex().k[t] | 0), 0))]];
      for (const [k, v] of rows) { const x = el('div', '', k); x.appendChild(el('b', '', v)); st.appendChild(x); }
      box.appendChild(st);
    }
  }
});
