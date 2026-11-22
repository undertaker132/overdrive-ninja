
/* --- MODULE 7: v104.0 PACING — the Hyper Bosses pact, and the newer systems introduced one by one --- */
(function () {
  'use strict';
  const L = s => (typeof lt === 'function' ? lt(s) : s);
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "NEW IN BATTLE": "חדש בקרב",
    "Opens at stage {0}": "נפתח בשלב {0}",
    "HEAT PACT": "ברית החום",
    "Bosses act +25% faster, with +25% health": "הבוסים פועלים מהר יותר ב-25%, עם 25% יותר חיים",
    "Blade Clash: when blades lock, tap fast to win the push.": "התנגשות להבים: כשהלהבים ננעלים, הקש מהר כדי לנצח בדחיפה.",
    "Boss armor: hit the glowing plates until they shatter, then the body takes more damage.": "שריון בוס: פגע בלוחות הזוהרים עד שיתנפצו, ואז הגוף נפגע יותר.",
    "Roof props: crates and barrels on the train can be cut and kicked into enemies.": "חפצים על הגג: ארגזים וחביות על הרכבת אפשר לחתוך ולבעוט באויבים.",
    "Launcher [F]: spend a charge to throw enemies into the air and juggle them.": "מקפצה [F]: השקע מטען כדי להעיף אויבים לאוויר ולהמשיך קומבו באוויר.",
    "Rail events: tunnels, storms and ambushes change the fight as the train runs.": "אירועי מסילה: מנהרות, סופות ומארבים משנים את הקרב בזמן שהרכבת נוסעת.",
    "Enemy squads: some groups fight together, a shield bearer protects the rest.": "חוליות אויבים: חלק מהקבוצות נלחמות יחד, ונושא מגן מגן על השאר.",
    "Synergies: chain kills, parries and cuts to light up bonus effects.": "סינרגיות: שרשר הריגות, הדיפות וחיתוכים כדי להדליק בונוסים.",
    "Awakened Blade: long combos wake your weapon for a short burst of power.": "להב מתעורר: קומבו ארוך מעיר את הנשק לפרץ כוח קצר.",
    "Shadow Rival: a dark copy of you may appear to duel you.": "יריב הצל: עותק אפל שלך עלול להופיע לדו-קרב.",
    "Heat Pact: on the title screen, take on harder rules for a bigger score.": "ברית החום: במסך הפתיחה, קבל חוקים קשים יותר תמורת ניקוד גדול יותר."
  });

  /* ---- HYPER BOSSES: the boss's own clock runs 25% faster (its moves, patterns and timers). Runs recorded on 104 or later. ---- */
  try { const hb = HeatPact92.PACTS.find(q => q.id === 'hyperBoss'); if (hb) hb.desc = 'Bosses act +25% faster, with +25% health'; } catch (e) { }
  const bu104 = Boss.update.bind(Boss);
  Boss.update = function (dt, rd) {
    if (dt > 0 && Boss.cur && G.state === 'PLAY' && simV(104)) { try { if (HeatPact92.getMap().hyperBoss) dt *= 1.25; } catch (e) { } }
    return bu104(dt, rd);
  };
  // ...and they come with 25% more health, so the faster fight is not also a shorter one (the bot runs showed it ending sooner)
  const bs104 = Boss.spawn.bind(Boss);
  Boss.spawn = function () {
    const r = bs104.apply(this, arguments);
    try { const b = Boss.cur; if (b && simV(104) && HeatPact92.getMap().hyperBoss) b.mhp = b.hp = b.mhp * 1.25; } catch (e) { }
    return r;
  };

  /* ---- the newer systems open as the story goes on (players who already played keep everything) ---- */
  const SYS = [ // need = stages cleared, as on the title screen
    { k: 'clash91', need: 2, tip: 'Blade Clash: when blades lock, tap fast to win the push.' },
    { k: 'armor96', need: 3, tip: 'Boss armor: hit the glowing plates until they shatter, then the body takes more damage.' },
    { k: 'props96', need: 3, tip: 'Roof props: crates and barrels on the train can be cut and kicked into enemies.' },
    { k: 'air96', need: 4, tip: 'Launcher [F]: spend a charge to throw enemies into the air and juggle them.' },
    { k: 'events91', need: 5, tip: 'Rail events: tunnels, storms and ambushes change the fight as the train runs.' },
    { k: 'events96', need: 5, tip: null },
    { k: 'squad92', need: 6, tip: 'Enemy squads: some groups fight together, a shield bearer protects the rest.' },
    { k: 'syn92', need: 7, tip: 'Synergies: chain kills, parries and cuts to light up bonus effects.' },
    { k: 'awaken91', need: 8, tip: 'Awakened Blade: long combos wake your weapon for a short burst of power.' },
    { k: 'rival91', need: 9, tip: 'Shadow Rival: a dark copy of you may appear to duel you.' },
    { k: 'heat', need: 10, tip: 'Heat Pact: on the title screen, take on harder rules for a bigger score.' }
  ];
  const Pace104 = {
    SYS,
    open(k) {
      try { if (typeof Gate === 'undefined') return true; Gate.init(); if (Store.data.uiAll) return true; const q = SYS.find(s => s.k === k); return !q || Gate.lv() >= q.need; } catch (e) { return true; }
    },
    stageOf(k) { const q = SYS.find(s => s.k === k); return q && STAGES[q.need - 1] ? STAGES[q.need - 1].id : ''; },
    // a tip for each system that opened since the last visit to the title screen
    announce() {
      try {
        const d = Store.data; if (d.uiAll) return; if (!d.uiTold || typeof d.uiTold !== 'object') d.uiTold = {};
        const fresh = SYS.filter(s => s.tip && this.open(s.k) && !d.uiTold['sys_' + s.k]);
        if (!fresh.length) return;
        for (const s of fresh) d.uiTold['sys_' + s.k] = 1; Store.touch();
        fresh.forEach((s, i) => setTimeout(() => { if (UI.cur === 'title' && typeof toastDom === 'function') toastDom('⚔ ' + L('NEW IN BATTLE') + ' · ' + L(s.tip)); }, 1400 + i * 3800));
      } catch (e) { }
    }
  };
  window.Pace104 = Pace104;

  // a system that has not opened yet is off in the run (the run's switches are recorded in the replay, so replays are unaffected)
  const live0 = Sim98.live.bind(Sim98);
  Sim98.live = function (k) { return Pace104.open(k) && live0(k); };

  // the HEAT PACT button waits for its stage; pacts already chosen stay in force only once it is open
  const gm0 = HeatPact92.getMap.bind(HeatPact92);
  HeatPact92.getMap = function () { const m = gm0(); return REPLAY.on || Pace104.open('heat') ? m : {}; };
  const tu0 = HeatPact92.tickUI.bind(HeatPact92);
  HeatPact92.tickUI = function () { const r = tu0.apply(this, arguments); if (!Pace104.open('heat') && this.btnEl) this.btnEl.style.setProperty('display', 'none', 'important'); return r; }; // (important: the home command bar styles its buttons)

  // the GAMEPLAY switches of systems not opened yet show where they open
  const os0 = UI.openSettings.bind(UI);
  UI.openSettings = function () {
    const r = os0.apply(this, arguments);
    try { for (const s of SYS) { const b = document.getElementById('set-' + s.k); if (b && !Pace104.open(s.k)) { b.disabled = true; b.classList.remove('on'); b.textContent = '🔒 ' + (typeof ltf === 'function' ? ltf('Opens at stage {0}', Pace104.stageOf(s.k)) : Pace104.stageOf(s.k)); } } } catch (e) { }
    return r;
  };
  const ot0 = UI.openTitle.bind(UI);
  UI.openTitle = function () { const r = ot0.apply(this, arguments); Pace104.announce(); return r; };
})();
