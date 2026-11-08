/* =====================================================================
   VERSION 48: YOUR HERO SPEAKS
   Each class of your own hero (HERO TRIALS, the WORLD BOSS, raids with
   your hero) has its own voice and lines: at the start of a run, on kill
   streaks, when a boss arrives, on the last shield and when a boss falls.
   The line also floats above the hero for a moment. At most one line
   every 6 seconds; follows Settings > Character voices. Display and sound
   only: it reads the run and changes nothing in it.
   ===================================================================== */
Object.assign(CHARS, {
  HN: { name: 'NINJA', role: 'Your hero', col: '#00f2fe', pitch: 230 },
  HS: { name: 'SAMURAI', role: 'Your hero', col: '#ff0844', pitch: 120 },
  HB: { name: 'SHINOBI', role: 'Your hero', col: '#c45bff', pitch: 175 },
  HO: { name: 'ONMYOJI', role: 'Your hero', col: '#ffd23f', pitch: 300 }
});
const HV_LINES = {
  ninja: { start: ['Swift as the wind.', 'Let us dance.'], streak: ['Too slow!', 'Next!', 'Keep up!'], boss: ['Big one. Good.', 'Speed beats size.'], low: ['Not yet!'], win: ['Like the wind.'] },
  samurai: { start: ['Face my blade.', 'For honor.'], streak: ['Kneel!', 'Who is next?', 'One cut.'], boss: ['A worthy foe.', 'Come, giant.'], low: ['I do not fall!'], win: ['Honor holds.'] },
  shinobi: { start: ['From the shadows.', 'They will not see me.'], streak: ['Gone.', 'Never saw me.', 'Silent.'], boss: ['Bigger shadow. Same blade.'], low: ['Into the dark!'], win: ['A whisper, then nothing.'] },
  onmyoji: { start: ['Spirits, answer me.', 'The seal is open.'], streak: ['Burn, wicked soul!', 'Bound!', 'Begone!'], boss: ['A great demon. I am ready.'], low: ['Spirits, shield me!'], win: ['The seal holds.'] }
};
const HeroVoice = {
  st: null,
  say(kind) {
    const f = Hero.f(), L = HV_LINES[f.cls]; if (!L || !L[kind]) return; const now = performance.now(), S = this.st; if (now - S.last < 6000) return; S.last = now;
    const arr = L[kind], line = arr[(S.n++) % arr.length], cid = { ninja: 'HN', samurai: 'HS', shinobi: 'HB', onmyoji: 'HO' }[f.cls];
    try { if (typeof Voices !== 'undefined' && Voices.on()) Voices.speak(cid, lt(line), line, .8); } catch (e) { errLog(e); }
    try { FX.text(P.x, P.y - 54, lt(line), CHARS[cid].col, 15); } catch (e) { errLog(e); }
  },
  tick() {
    if (!G.hero || REPLAY.on || G.state !== 'PLAY') { if (G.state !== 'PLAY' && G.state !== 'PAUSE') this.st = null; return; }
    let S = this.st; if (!S) S = this.st = { last: -1e9, n: 0, began: false, kills: 0, boss: null, low: false, bossDown: null };
    if (!S.began && G.freeze <= 0) { S.began = true; S.kills = G.kills | 0; this.say('start'); return; }
    const k = G.kills | 0; if (k - S.kills >= 12) { S.kills = k; this.say('streak'); }
    const B = Boss.cur; if (B && B.enter >= 1 && S.boss !== B) { S.boss = B; S.last = -1e9; this.say('boss'); }
    if (B && B.dying > 0 && S.bossDown !== B) { S.bossDown = B; S.last = -1e9; this.say('win'); }
    if (P.hp === 1 && P.maxHp > 1 && !S.low) { S.low = true; S.last = -1e9; this.say('low'); } else if (P.hp > 1) S.low = false;
  }
};
Pipe.on('post', 'herovoice', () => { try { HeroVoice.tick(); } catch (e) { errLog(e); } }, 97);
