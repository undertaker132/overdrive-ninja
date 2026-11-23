
/* --- MODULE 12: v106.0 THE GRAND FINALE — the last stage of the story ends the whole game --- */
(function () {
  'use strict';
  const LAST = '23-4';
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "EPILOGUE · THE LAST LEGEND": "אפילוג · האגדה האחרונה",
    "OTAKEMARU.EXE: THE LAST LEGEND IS OVER.": "OTAKEMARU.EXE: האגדה האחרונה נגמרה.",
    "SNOW SETTLES ON THE SHRINE. FOR THE FIRST TIME IN A HUNDRED YEARS, NOTHING IN NEO-EDO IS HUNTING ANYONE.": "השלג שוקע על המקדש. לראשונה מזה מאה שנה, שום דבר בניאו-אדו לא צד אף אחד.",
    "Every machine that ran this city is asleep.": "כל מכונה שניהלה את העיר הזאת ישנה.",
    "Then the city is ours.": "אז העיר שלנו.",
    "From the Titan Express to the oni king. Same blade the whole way.": "מהטיטאן אקספרס ועד מלך האוני. אותו להב כל הדרך.",
    "THE END": "סוף",
    "THE WHOLE STORY IS COMPLETE": "כל הסיפור הושלם",
    "THE LEGENDS YOU ENDED": "האגדות שסיימת",
    "THE CAST": "הצוות",
    "REN — the blade": "רן — הלהב",
    "MIKA — the voice in your ear": "מיקה — הקול באוזן שלך",
    "KAGE — the shadow who came back": "קאגה — הצל שחזר",
    "YOUR JOURNEY": "המסע שלך",
    "{0} STAGES CLEARED": "{0} שלבים הושלמו",
    "{0} STARS": "{0} כוכבים",
    "{0} ENEMIES CUT DOWN": "{0} אויבים נחתכו",
    "BEST COMBO x{0}": "הקומבו הטוב ביותר x{0}",
    "NEW GAME+ IS WAITING ON THE STORY MAP": "משחק חדש+ מחכה במפת הסיפור",
    "LEGEND OF NEO-EDO": "אגדת ניאו-אדו",
    "Finish the whole story": "סיים את כל הסיפור",
    "Thank you for playing.": "תודה ששיחקת.",
    "You finished the whole story. Roll the credits.": "סיימת את כל הסיפור. הקרדיטים מחכים."
  });

  // the epilogue: four panels, from the fallen king to the morning after
  COMICS.end8 = { t: 'EPILOGUE · THE LAST LEGEND', p: [
    { k: 'boss', id: 'otakemaru', down: 1, cap: 'OTAKEMARU.EXE: THE LAST LEGEND IS OVER.' },
    { k: 'dawn', cap: 'SNOW SETTLES ON THE SHRINE. FOR THE FIRST TIME IN A HUNDRED YEARS, NOTHING IN NEO-EDO IS HUNTING ANYONE.' },
    { k: 'duo', who: 'M', say: 'Every machine that ran this city is asleep.', who2: 'R', say2: 'Then the city is ours.' },
    { k: 'face', who: 'K', say: 'From the Titan Express to the oni king. Same blade the whole way.' }] };

  ACHS.push({ id: 'legend', name: 'LEGEND OF NEO-EDO', d: 'Finish the whole story', r: 1000 });

  // the closing credits: the whole game, then the player's own journey
  const roll = () => {
    const d = Store.data, st = d.stats || {}, cleared = Object.keys(d.story.stars || {}).filter(k => d.story.stars[k] > 0).length;
    const L = lt, F = ltf;
    return [['OVERDRIVE: CYBER SLASH', 'big'], ['', ''], [L('THE END'), 'big gold'], [L('THE WHOLE STORY IS COMPLETE'), 'gold'], ['', ''],
      [L('THE LEGENDS YOU ENDED'), 'gold'], ...['shogun', 'prime', 'genesis', 'oryu', 'izanami', 'hyakki', 'otakemaru'].filter(id => BOSS_INFO[id]).map(id => [L(BOSS_INFO[id].name), '']), ['', ''],
      [L('THE CAST'), 'gold'], [L('REN — the blade'), ''], [L('MIKA — the voice in your ear'), ''], [L('KAGE — the shadow who came back'), ''], ['', ''],
      [L('YOUR JOURNEY'), 'gold'], [F('{0} STAGES CLEARED', cleared), ''], [F('{0} STARS', Store.stars()), ''],
      ...(st.kills ? [[F('{0} ENEMIES CUT DOWN', fmtNum(st.kills)), '']] : []), ...(st.maxCombo ? [[F('BEST COMBO x{0}', st.maxCombo), '']] : []), ['', ''],
      [L('LEGEND OF NEO-EDO'), 'gold'], [L('NEW GAME+ IS WAITING ON THE STORY MAP'), ''], ['', ''], [L('Thank you for playing.'), 'big']];
  };
  const cr0 = Flow.credits.bind(Flow);
  Flow.credits = function (act) {
    if (act !== 8) return cr0.apply(this, arguments);
    const d = Store.data;
    if (!d.seen.cmEnd8) { d.seen.cmEnd8 = 1; Store.touch(); Comic.play('end8', () => this.credits(8)); return; } // the epilogue first
    ach('legend');
    G.state = 'MENU'; UI.show('credits'); const box = $('crRoll'); box.textContent = '';
    for (const [t, c] of roll()) { const e = el('div', c, t || ' '); if (/big/.test(c)) { e.style.fontSize = '1.35em'; e.style.letterSpacing = '.12em'; e.style.margin = '.4em 0'; } box.appendChild(e); }
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = ''; box.style.animationDuration = '58s'; // (a longer roll: it is the whole game)
    Aud.intensity = 2; Aud.music('credits'); Aud.say('Neo Edo is free', 1);
  };

  // the last stage's results lead to the finale, the first time (not in New Game+)
  const or0 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    try {
      if (o && G.mode === 'story' && G.stage && G.stage.id === LAST && G.won && !G.ngp) {
        o.main = [lt('ROLL CREDITS'), () => Flow.credits(8)];
        (o.notes = o.notes || []).unshift({ t: lt('You finished the whole story. Roll the credits.'), c: 'gold' });
      }
    } catch (e) { errLog(e); }
    return or0.apply(this, arguments);
  };

  // the story map's EPILOGUE button for the oni chapter, once it is cleared
  const rs0 = UI.renderStory.bind(UI);
  UI.renderStory = function () {
    const r = rs0.apply(this, arguments);
    try { const ch = STAGE_BY_ID[LAST].ch, b = $('stEpi'); if (b && this.storyCh === ch && Store.data.story.stars[LAST]) { b.classList.remove('hidden'); b.onclick = () => { Aud.sfx('ui'); Comic.play('end8', () => this.openStory()); }; } } catch (e) { errLog(e); }
    return r;
  };
})();
