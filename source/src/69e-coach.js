/* =====================================================================
   COACH — after a run, Mika looks at how it went and gives one concrete
   tip, in her voice and the player's language. Uses the artifact's
   `sample` capability (Claude, on the viewer's own account, asked only
   when the player taps the button); hidden wherever it is not available.
   ===================================================================== */
const COACH_FACTS = [
  'Controls: drag anywhere to aim, release to dash-slash; a quick tap dashes to that spot; out of dash charges, a swipe dodges.',
  'Perfect parry: dash into a bullet right as the dash starts; it reflects the shot, refills every charge and fills Overdrive.',
  'Near misses (grazes) charge Overdrive. Overdrive: a few seconds of invulnerability, endless dashes and double damage.',
  'Bouncing off a side rail mid-dash makes the next hit a guaranteed critical and breaks front shields.',
  'Chain slash: drag the aim line across several enemies to lock them, then release to cut them all in one move.',
  'Blade heat rises with every slash: above 75 the blade hits 25% harder, at 100 it overheats and locks for a moment.',
  'Skills: GRAPPLE pulls you onto the nearest enemy with a blast, HIJACK turns enemies into allies, LASER WEB stretches damaging wires, TIME ECHO adds a clone and repairs a shield.',
  'Enemies: BRUTE blocks from the front; SNIPER shows an orange laser before firing; BOMBER blinks then explodes; PHANTOM fades and reappears beside you; WARDEN gives shields to others; MEDIC heals others; MIMIC repeats your dash along a pink line; MINER drops proximity mines (dash through to disarm); MIRROR bounces your dash off its bright arc.',
  'Bosses have a rotating gold weakpoint arc: hitting it staggers the boss, then fast taps on the boss deal finishing slashes.'
];
const Coach = {
  s: null, inited: false, off: false, ctl: null,
  async init() { if (this.inited) return this.s; this.inited = true; try { this.s = window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch (e) { this.s = null; } return this.s; },
  ctx(m, win, cause) {
    return { m, win: !!win, cause: cause ? cause[0] + ' (' + cause[1] + ')' : '', score: ii(G.score), time: Math.round(G.time), kills: G.kills | 0, hits: G.hits | 0, combo: G.maxCombo | 0, parries: G.parries | 0, grazes: G.grazes | 0,
      crits: G.crits | 0, car: G.seqCar | 0, bosses: G.bossIdx | 0, rank: RANKS[G.maxRk | 0].r, weapon: P.w ? P.w.name : '', perks: Object.keys(P.perks || {}).join(', '), heat: G.heat | 0, diff: G.diff ? G.diff.name : '',
      skillsUsed: Object.keys(P.cds || {}).filter(k => P.cds[k] > 0).join(', ') };
  },
  attach(c) {
    const b = $('rsCoach'), t = $('rsCoachTxt'); if (!b || !t) return;
    b.classList.add('hidden'); t.classList.add('hidden'); t.textContent = ''; if (this.ctl) { try { this.ctl.abort(); } catch (e) { errLog(e); } this.ctl = null; }
    if (!c || this.off) return;
    this.init().then(s => { if (!s || this.off || UI.cur !== 'result') return; b.classList.remove('hidden'); b.disabled = false; b.onclick = () => { Aud.sfx('ui'); this.ask(c); }; });
  },
  langLine() {
    if (LANG.id === 'he') return 'Answer in Hebrew. Speak to the player as Ren, in masculine singular.';
    if (LANG.id === 'ar') return 'Answer in Modern Standard Arabic. Speak to the player as Ren, in masculine singular.';
    if (LANG.id === 'ru') return 'Answer in Russian. Speak to the player as Ren, informally (ty).';
    if (LANG.id === 'ar') return 'Answer in Arabic (Modern Standard, simple words).';
    if (LANG.id === 'ru') return 'Answer in Russian, informal "ты".';
    return 'Answer in English.';
  },
  prompt(c) {
    return [
      'You are Mika, the radio operator in the mobile action game OVERDRIVE: CYBER SLASH. Ren (the player) just finished a run and asks you for a tip.',
      'Game facts (use only these, do not invent mechanics):', ...COACH_FACTS.map(f => '- ' + f),
      'How the run went:', '- mode: ' + c.m + (c.diff ? ' on ' + c.diff : '') + '; result: ' + (c.win ? 'finished' : 'defeated') + (c.cause ? '; last hit: ' + c.cause : ''),
      '- score ' + c.score + ', time ' + c.time + 's, kills ' + c.kills + ', hits taken ' + c.hits + ', max combo x' + c.combo + ', perfect parries ' + c.parries + ', near misses ' + c.grazes + ', crits ' + c.crits + ', best style rank ' + c.rank,
      '- reached car ' + c.car + ', bosses beaten ' + c.bosses + ', blade ' + c.weapon + (c.perks ? ', perks: ' + c.perks : '') + (c.heat ? ', contract heat ' + c.heat : ''),
      'Write 2 or 3 short sentences in Mika\'s warm, upbeat radio voice: name the one thing that would help most next run, based on these numbers, and say exactly how to do it. No lists, no headings, no emojis, no greeting. ' + this.langLine()
    ].join('\n');
  },
  async ask(c) {
    const b = $('rsCoach'), t = $('rsCoachTxt'); if (!this.s) return;
    b.disabled = true; t.classList.remove('hidden'); t.textContent = lt('Mika is thinking…');
    const ctl = this.ctl = new AbortController();
    try {
      const r = await this.s(this.prompt(c), { modelTier: 'quick', signal: ctl.signal, onText: ({ text }) => { if (this.ctl === ctl) t.textContent = text; } });
      if (this.ctl === ctl) t.textContent = r.text;
    } catch (e) {
      if (this.ctl !== ctl) return; const code = e && e.code;
      if (code === 'cancelled') return;
      if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].indexOf(code) >= 0) { this.off = true; b.classList.add('hidden'); t.classList.add('hidden'); t.textContent = ''; return; }
      if (code === 'refused') t.textContent = '';
      else if (e && e.text) t.textContent = e.text;
      t.textContent = (t.textContent ? t.textContent + ' ' : '') + (code === 'rate_limited' ? lt('Mika is busy. Try again in a little while.') : lt('Mika could not answer right now. Try again later.'));
    } finally { if (this.ctl === ctl) b.disabled = false; }
  }
};
