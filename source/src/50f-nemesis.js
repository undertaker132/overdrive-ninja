/* =====================================================================
   NEMESIS — the enemy type that last broke your shields remembers you.
   It gets a name and a title, and in a later run (Maglev Run, Neon Tower,
   Hyper Mayhem) it comes back as a named elite: bigger,
   tougher, taunting you. Every time it kills you again it levels up
   (max level 5). Slay it for a big credit bounty and the REVENGE medal.
   The run copies the nemesis into the replay header, so replays and
   ghosts meet the same one; the save only changes outside replays.
   It hunts in arcade runs only, never in story stages.
   ===================================================================== */
const NEM_TITLES = ['THE BUTCHER', 'THE GRUDGE', 'RED HAND', 'BONE-SAW', 'THE COLLECTOR', 'IRONJAW', 'THE WIDOW', 'NEVERMORE', 'LAST LIGHT', 'THE HUNGRY', 'SMILE', 'THE PATIENT'];
const NEM_TAUNTS = [
  ['Remember me?', 'Back for more?', 'I kept your shield as a trophy.'],
  ['Again? I was hoping you would come.', 'Your rooftop. My rules.', 'I learned your dash.'],
  ['Every fall makes me stronger.', 'You run the same way every time.', 'I hear your heartbeat from here.'],
  ['Neo Edo belongs to me now.', 'I am what you left behind.', 'Kneel, and I make it quick.'],
  ['You made me. Now face me.', 'Five times I took you. Five.', 'There is no sixth.']
];
const NEM_MODES = { endless: 1, tower: 1, mayhem: 1 }; // never in the story: struggling players should not meet a tougher enemy there
const NEM_TYPES = (() => { const s = {}; for (const k of ['DRONE', 'SNIPER', 'BRUTE', 'BOMBER', 'WEAVER', 'PHANTOM', 'SPLITTER', 'WARDEN', 'MEDIC', 'MIMIC', 'MINER', 'MIRROR', 'ENFORCER', 'SPIDER', 'WRAITH']) s[ET[k]] = 1; return s; })();
const Nemesis = {
  name(n) { return n ? lt(EDEF[n.t].name) + ' "' + lt(NEM_TITLES[n.ti % NEM_TITLES.length]) + '"' : ''; },
  taunt(n) { const l = NEM_TAUNTS[Math.min(4, n.lv - 1)]; return lt(l[(n.w + n.ti) % l.length]); },
  /* run start (Director.begin): copy the nemesis into the run */
  begin(mode, stage) {
    G.nemOut = false; G.nemDone = false; G.nemE = null;
    if (REPLAY.on) { G.nem = REPLAY.hdr.nem || null; return; }
    const n = Store.data.nem, ok = NEM_MODES[mode] && !(mode === 'story' && (!stage || stage.safe || stage.obj.t === 'boss' || stage.obj.t === 'courier' || stage.ch < 1));
    G.nem = n && ok && EDEF[n.t] ? { t: n.t, lv: n.lv, ti: n.ti, w: n.w | 0 } : null;
  },
  /* spawned once the run is warmed up and no boss is around */
  update() {
    const n = G.nem; if (!n || G.nemOut || G.freeze > 0 || Boss.cur || Director.bossPending || G.won || G.state !== 'PLAY') return;
    if (G.kills < 12) return;
    G.nemOut = true; const top = P.y > V.VH * .5, d = EDEF[n.t], e = spawnEnemy(n.t, V.CX, top ? -40 : V.VH + 40, d.mb ? 0 : 1);
    if (!e) return;
    e.nem = 1; e.hp = e.mhp = e.mhp * (3 + n.lv * 1.5); e.r *= 1.3; e.spd *= 1 + n.lv * .04; e.coins *= 5; e.v *= 6; e.spawnT = .8; G.nemE = e;
    FX.call(ltf('NEMESIS: {0}', this.name(n)), '#ff2a2a', 3, 22); FX.text(V.CX, V.VH * .3, '"' + this.taunt(n) + '"', '#ffb3b3', 15, true);
    Aud.sfx('warn'); Aud.sfx('roar'); shake(.4); flash(.2, '#ff0000'); REC.mark('nem', 4);
  },
  /* the nemesis dies */
  slain(e) {
    G.nemDone = true; G.nemE = null; const n = G.nem;
    FX.boom(e.x, e.y, 170, '#ff2a2a'); FX.ring(e.x, e.y, 260, '#ffd700', 6); FX.call(lt('NEMESIS SLAIN'), '#ffd700', 3, 26); punch(.1); flash(.3, '#ffd700'); dropPickup(e.x, e.y, 1); REC.mark('nem', 6);
    G.score += Math.round(2500 * n.lv * G.diff.score * G.scoreMul); Aud.say('Nemesis slain', 1);
    if (REPLAY.on) return;
    const d = Store.data, bounty = 400 * n.lv; d.credits += bounty; d.nemSlain = (d.nemSlain | 0) + 1; d.nem = null; Store.touch();
    toast(ltf('REVENGE  +{0} CR', fmtNum(bounty)), '#ffd700'); ach('revenge'); if (n.lv >= 3) ach('revenge3');
  },
  /* the run ended in defeat: the killer becomes (or levels up) the nemesis */
  onDeath() {
    if (REPLAY.on || G.mode === 'dojo' || G.mode === 'puzzle' || G.mode === 'custom' || G.assist) return;
    const t = G.lastWho, d = Store.data; if (!NEM_TYPES[t]) return;
    const n = d.nem;
    if (n && n.t === t) { n.lv = Math.min(5, n.lv + 1); n.w = (n.w | 0) + 1; toast(ltf('{0} GREW STRONGER · LV {1}', this.name(n), n.lv), '#ff2a2a'); }
    else if (!n) { d.nem = { t, lv: 1, ti: (Date.now() / 1000 | 0) % NEM_TITLES.length, w: 1 }; toast(ltf('A NEMESIS IS BORN: {0}', this.name(d.nem)), '#ff2a2a'); }
    Store.touch();
  },
  drawTag(e) { // name tag, crown of spikes and a red pulse over the nemesis
    const n = G.nem; if (!n) return; const y = e.y - e.r * e.scale - 22, p = .5 + .5 * Math.sin(CAM.t * 8);
    cx.save(); glow(e.x, e.y, e.r * 3, '#ff0000', .25 + p * .2);
    cx.strokeStyle = '#ff2a2a'; cx.lineWidth = 2; cx.globalAlpha = .6 + p * .4; cx.beginPath(); cx.arc(e.x, e.y, e.r + 8 + p * 4, 0, TAU); cx.stroke();
    cx.fillStyle = '#ff2a2a'; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .38, r0 = e.r + 6, r1 = e.r + 16 + (k === 2 ? 6 : 0); cx.beginPath(); cx.moveTo(e.x + Math.cos(a - .1) * r0, e.y + Math.sin(a - .1) * r0); cx.lineTo(e.x + Math.cos(a) * r1, e.y + Math.sin(a) * r1); cx.lineTo(e.x + Math.cos(a + .1) * r0, e.y + Math.sin(a + .1) * r0); cx.fill(); }
    cx.globalAlpha = 1; cx.font = '700 11px ' + FONT_M; cx.textAlign = 'center'; const s = this.name(n) + ' · LV ' + n.lv, w = cx.measureText(s).width + 12;
    cx.fillStyle = 'rgba(20,0,0,.8)'; cx.fillRect(e.x - w / 2, y - 12, w, 16); cx.strokeStyle = '#ff2a2a'; cx.lineWidth = 1; cx.strokeRect(e.x - w / 2, y - 12, w, 16);
    cx.fillStyle = '#ffd0d0'; cx.fillText(s, e.x, y);
    const f = Math.max(0, e.hp / e.mhp); cx.fillStyle = '#300'; cx.fillRect(e.x - 30, y + 6, 60, 4); cx.fillStyle = '#ff2a2a'; cx.fillRect(e.x - 30, y + 6, 60 * f, 4);
    cx.restore();
  }
};
