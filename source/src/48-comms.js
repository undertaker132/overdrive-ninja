/* =====================================================================
   RADIO CHATTER — short lines from Mika (and boss taunts) reacting to
   what happens in the fight. Never pauses play; rate-limited.
   ===================================================================== */
const COMMS = {
  parry: [['M', 'Nice parry!'], ['M', 'Clean deflect.']],
  combo: [['M', "You're on fire, Ren!"], ['M', 'Keep that chain going!']],
  rank: [['M', 'That style! Kurogane is watching.'], ['M', "Now we're talking."]],
  low: [['M', 'Shields critical! Pop Overdrive if you can!'], ['M', 'One more hit and you are done. Careful!']],
  od: [['M', "Overdrive's charged. Use it!"]],
  half: [['M', 'Halfway there. Keep moving.'], ['M', 'Good pace. Half done.']],
  train: [['M', 'Train incoming! Clear the track!']],
  uplink: [['M', "They're hitting the uplink!"], ['M', 'Uplink is taking damage!']],
  elite: [['M', 'Elite on the roof. Gold ring means a big payout.']],
  wave: [['M', 'Here comes a wave!'], ['M', 'Heads up, more incoming.']],
  stale: [['M', 'Mix it up, Ren. Style counts.']],
  hijack: [['M', "Ha! They're fighting each other."]],
  checkpoint: [['M', 'Checkpoint saved. If you fall, you restart from here.']],
  term: [['M', 'Upload started. Hold the ring!']],
  courier: [['M', "It's getting away! Fifteen seconds!"]],
  warden2: [['S', 'OVERCLOCK ENGAGED. ERASING PASSENGER.']],
  hydra2: [['S', 'CORE EXPOSED. RECALIBRATING DEFENSES.']],
  kage2: [['K', 'You were always faster, Ren. Not anymore.']],
  kage3: [['K', 'No more holding back, brother!']],
  clash: [['K', 'Not bad.'], ['K', 'Again!']],
  shogun2: [['S', 'FIREWALL ONLINE. YOU CANNOT PATCH ME.']],
  shogun3: [['S', 'GLITCH STORM. DELETE. DELETE. DELETE.']],
  bossLow: [['S', 'C-CORE INTEGRITY... FAILING...']],
  raijin2: [['J', 'THE SKY ANSWERS ME. RUN, LITTLE BLADE.']],
  raijin3: [['J', 'I AM THE STORM ITSELF!']],
  lev2: [['M', "It's diving! Watch for the circle where it comes up."]],
  lev3: [['M', 'It is thrashing now. Double lunges!']],
  ben2: [['B', 'THE BELLS RING WITHOUT A HAND.']],
  ben3: [['B', 'A HUNDRED-YEAR VOW DOES NOT BREAK.']],
  prime2: [['P', 'ZERO HOUR. EVERY SECOND OF THIS CITY IS MINE.']],
  prime3: [['P', 'LAST ORDER: ERASE HIM.']],
  valk2: [['V', 'ORBITAL LANCE ARMED. THE SKY ITSELF WILL CUT YOU.']],
  valk3: [['V', 'RAGNAROK PROTOCOL. I WILL NOT FALL ALONE.']],
  chim2: [['C', 'WE MERGE. WE MOVE. YOU CANNOT FOLLOW ALL OF US.']],
  chim3: [['M', 'It is corrupting the floor! Stay out of the purple circles!']],
  hyakki2: [['M', 'Yokai are pouring out of the cart! Keep moving!']],
  hyakki3: [['H', 'THE MOON BLEEDS. THE PARADE RUNS.']],
  tenkai2: [['M', 'Light is falling from the sky in columns! Find the gaps!']],
  tenkai3: [['T', 'I WILL BURN LIKE A SECOND SUN.']],
  izanami2: [['K', 'Gates to the underworld at the edges of the roof. Their shots follow you!']],
  izanami3: [['Z', 'FROM ME, EVERY GOD WAS BORN. WATCH THEM RISE.']],
  oryu2: [['O', 'EVERY CABLE IS A COIL. EVERY COIL IS A GRAVE.']],
  oryu3: [['M', 'Its tail broke off and it is hunting you too! Watch both of them!']],
  gen2: [['D', 'COMPILATION BEGINS. YOUR WORLD GROWS SMALLER.']],
  gen3: [['D', 'FINAL SCRIPT. EVERY LINE ENDS WITH YOU.'], ['K', 'Then we rewrite it!']],
  null2: [['N', 'ECHO PROTOCOL. EVERY STRIKE TWICE.']],
  null3: [['N', 'NULL OVERDRIVE. I AM WHAT YOU COULD BE.']],
  nullClash: [['N', 'UNEXPECTED.'], ['N', 'RECALCULATING.']],
  ghostAhead: [['M', "You're ahead of their ghost. Keep it up!"]],
  ghostBehind: [['M', "Their ghost is pulling ahead. Push!"]],
  mini: [['M', 'Mini-boss on the roof! Learn its pattern.'], ['M', 'Big one incoming. Wait for the opening.']],
  miniDown: [['M', 'Mini-boss down! Great work.'], ['M', 'That one hit hard. Nice.']]
};
const Comms = {
  cur: null, t: 0, cd: 0, used: {},
  say(key, force) {
    const arr = COMMS[key]; if (!arr || G.state !== 'PLAY') return;
    const u = this.used[key] | 0;
    if (!force && (this.cd > 0 || u >= 2)) return;
    const ln = arr[u % arr.length]; this.used[key] = u + 1;
    this.cur = { c: CHARS[ln[0]], cid: ln[0], text: lt(ln[1]), name: lt(CHARS[ln[0]].name) }; this.t = 2.8; this.cd = force ? 3 : 7;
    Aud.sfx('blip', this.cur.c.pitch);
  },
  reset() { this.cur = null; this.t = 0; this.cd = 3; this.used = {}; },
  tick(rd) { if (this.cd > 0) this.cd -= rd; if (this.t > 0) { this.t -= rd; if (this.t <= 0) this.cur = null; } },
  draw() {
    const c = this.cur; if (!c) return;
    const a = Math.min(1, this.t * 3, (2.8 - this.t) * 8);
    const y = V.VH - UI.dockH / V.s - (Boss.cur ? 104 : 64), w = Math.min(V.AW + 10, V.VW - 24), x0 = V.CX - w / 2;
    cx.globalAlpha = a; cx.fillStyle = 'rgba(6,9,24,.92)'; cx.fillRect(x0, y - 18, w, 36);
    cx.strokeStyle = c.c.col; cx.lineWidth = 1.2; cx.strokeRect(x0 + .5, y - 17.5, w - 1, 35);
    const ax = LANG.rtl ? x0 + w - 19 : x0 + 19, tx = LANG.rtl ? x0 + w - 38 : x0 + 38;
    cx.fillStyle = c.c.col; cx.beginPath(); cx.arc(ax, y, 11, 0, TAU); cx.fill();
    cx.fillStyle = '#05060f'; cx.font = '700 12px ' + FONT_D; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(c.name[0], ax, y + 1);
    cx.textAlign = talS(); cx.fillStyle = c.c.col; cx.font = '700 10px ' + FONT_M; cx.fillText(c.name, tx, y - 8);
    cx.fillStyle = '#e8fbff'; cx.font = "600 14px 'Rajdhani', 'Rubik', 'Segoe UI', system-ui, sans-serif"; cx.fillText(c.text, tx, y + 8, w - 46);
    cx.textBaseline = 'alphabetic'; cx.globalAlpha = 1;
  }
};
