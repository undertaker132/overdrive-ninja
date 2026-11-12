/* =====================================================================
   MENUS 2 — full settings (language, assist, colorblind, left-handed,
   FPS), what's new, music room, device check, save codes, bug reports,
   share screen, creator dashboard, rival alerts, weekly + dojo entries.
   ===================================================================== */
const NEWS = [ // version 77
  ["THE ONI KING'S SPOILS", "Defeat OTAKEMARU to claim his armor as the ONI KING hero skin and his red-hot iron as the KING'S IRON blade. Chapters 21, 22 and 23 now open with comic pages, and the oni king has his own portrait."],
  ["EMBLEMS AND A SEASON TRACK", "Every Arcade mode now carries its own neon emblem in its own color, and the chosen one glows. The season rewards are a track: every tier a node that lights up as you reach it, its reward drawn beside it, and the tier you are working on with its own progress bar."],
  ["THE ONI KING'S FISTS", "In 3D, OTAKEMARU now fights with great armored fists: iron plates, a burning cuff and glowing knuckles. A fist rises high over its red circle as the slam winds up, crashes into the roof and squashes, then floats back. The pets are drawn larger too."],
  ["A FIGHTER'S BODY", "Three more recorded sword moves for your hero in a run: a perfect parry is a real block with the blade across the body, Zandatsu is a leaping chop, and standing still in a fight your hero holds a two-handed guard."],
  ["BOSSES IN FULL COLOR, ENEMIES THAT FALL", "The swordsman bosses and the armored giants were painted in one flat color; every part of them now keeps its own shade, with the heroes' ink outline and rim light, a white flash when you hit them and a gold glow when they stagger. The oni, the demons and the robots now fall when they die, play their own death and sink into the roof, and your hero stands a little taller on the roof."],
  ["ANIMATION FIXES", "The blade now sits in your hero's fist, pointing forward, at a real sword's length (it stuck out sideways from the hip, twice too long). The scarf hangs down the back and streams out behind on a dash. Enemies walk and run instead of gliding, the slime and the yeti lost their giant bubble, executions show the real damage, and a tap in the Hero Forge shows the whole cut."],
  ["THE SEALS KEEP THEIR SECRET", "Crate films sometimes flashed the crate's true color for a moment before the first strike, giving the ending away. They now always start on the plain steel crate."],
  ["EVERY STAGE ITS OWN AIR", "In 3D the stages now feel like their places: snow drifts over winter and the summit and turns the roof white, cherry petals fall at the shrines on warm wood, embers rise around the core and the ruins, and motes of light float through the data void and the stars."],
  ["THE WALLET", "Tap your credits at the top of the screen to see everything you hold: credits, crates, cores, prisms, shards and your season tier, with where each comes from and what it is for."],
  ["CHAPTER 23: THE ONI KING", "A new chapter of four stages through the oni's city, ending with a new giant boss: OTAKEMARU.EXE, the oni king of the old legends, as tall as a building. Get out of the red circles when his fists fall, cut the fists while they are down, and bring the king to his knees."],
  ["YOUR HERO OPENS THE CRATE", "In the crate film the hero who breaks the seals is now your own 3D hero, with your skin, gear and blade: it walks in, leaps and cuts with the recorded sword moves, and raises the blade when the crate bursts."],
  ["TEXT SIZE AND KEYBOARD", "A new Text size setting (Settings > Presentation) makes every menu and the words in a fight larger. Buttons show a clear ring when you move with Tab, and with the colorblind palette the element orbs carry a symbol."],
  ["ELEMENTS AND REACTIONS", "Hits can now carry fire, frost, volt or venom: the elemental blades carry their own, and four new upgrade cards add one each. Hit an enemy with two different elements to set off a reaction: MELT, OVERLOAD, SUPERCONDUCT, TOXIC FLARE, SHATTER or PARALYSIS."],
  ["YOUR HERO ON THE RESULTS", "After every run your own 3D hero stands at the top of the results: blade raised when you cleared the stage, staggering when you fell."],
  ["RECORDED SOUND", "The fight now sounds real: steel drawn and slicing on every cut, metal on hits and clashes, a heavy chop on Zandatsu, body blows when you are struck, crunching explosions, a force field on Overdrive, coins, lasers and short jingles when you win or lose."],
  ["ONI OF THE CYBER CITY", "Three more enemies are real animated monsters: the brute is a hulking green orc, the void wraith a horned purple demon, the phantom a red demon glowing ghostly cyan. They walk, run, strike and flinch when you hit them. The 3D models now load about twice as fast."],
  ["REAL SWORD ANIMATIONS", "Your hero's cuts are now recorded sword animations: a chop, a diagonal slice, a horizontal slice and a stab, one per dash, and dual-blade versions for twin weapons. The swordsman bosses fight with them too."],
  ["PORTRAITS FROM THE REAL MODEL", "Every hero portrait in the shop, the Arsenal, crate rewards and your profile is now a render of the very body you play with: the armor, the gear, the hair and the face, in the studio light of the Hero Forge."],
  ["THE SWORD COMBO", "Your hero now fights with real moves: every dash is the next cut of a three-cut combo (an overhead chop, a wide sweep, a rising cut), you flinch when you lose a shield, and you raise the blade when a stage is cleared. Tap your hero on the home screen or in the Hero Forge to see the combo."],
  ["BOSSES IN THE FLESH", "The swordsman bosses and the armored giants now stand on real bodies too, with recorded motion, in their own colors and with their own weapons. Your hero swings the sword overhead on every dash, and the desktop app now shows the real 3D models as well."],
  ["A BODY FOR EVERY HERO", "The armored and heavy heroes (knights, samurai lords, war frames, titans, oni) now wear a realistic armored soldier's body, and the agile ones a smooth athlete's body. Heads are fitted to the real head size: the anime-style heroes get a real face with eyes and full spiky hair, the ninjas a fitted hood, mask and visor, and horns, ears and hats sit where they belong."],
  ["A REAL BODY", "Your hero is now a real human body with real proportions and recorded motion for standing, walking and running, on the home screen, in the Hero Forge and in runs. Every skin keeps its look on it: a suit in its colors with glowing lines, its own helmet, hair, horns, ears, hat, cape, wings or tail, and the weapon in the hand."],
  ["LIGHT AND LINE", "Heroes are now drawn like an anime game: a dark ink outline around every part and a rim of cool light along their edges. On the home screen and in the Hero Forge your hero stands in a small studio: a glossy floor, a backlight in their color and a glow on everything that shines."],
  ["REAL 3D MODELS", "The 3D view now uses real, artist-made models with recorded animations: brutes, enforcers, wardens and snipers are robots that walk, run, punch and fall, each in its own colors, and the dog-family pets are a fox that looks around, walks and runs with you. The moving parts on every enemy now animate in runs too."],
  ["FACES AND PETS", "The anime-style heroes now have real portraits, each with its own face, eyes, hairstyle and outfit, and a face in 3D too, and names that nod to the legends behind them. Every pet was reworked: dogs wag, look around, wear a collar and sit when you stop; birds beat their wings and fan their tails, the phoenix burns, fish swim with fins, the saucer beams, and they all breathe and blink."],
  ["GIANTS AND MONSTERS", "The war-machine bosses are now armored giants with real bodies and their own weapons: a paladin with a hammer, a samurai lord with a nodachi, a warrior monk with a spear, a war frame with a cleaver, a winged sovereign with a scythe. Gunships flare their engines and track you with turrets, RAIJIN spins a ring of thunder drums, CHIMERA grows three serpent heads, and the LEVIATHAN opens its jaw. Drones beat their wings, phantoms float in tattered cloaks, bombers breathe with a lit fuse."],
  ["EIGHT ANIME-STYLE HEROES", "WUKONG SURGE, STRAWBERRY REAPER, FREE HUNTER, GODSPEED KID, NINE-TAILS SAGE, SKY-EYED SORCERER, WATER BREATH SLAYER and STRAW-HAT CAPTAIN: original heroes in the style of the great fighting anime, with their own hair, outfits and auras in 3D, in 2D and on their portraits. In the shop and in crates."],
  ["THE SEALS", "Every crate now lands the same: steel, bound by four seals. Your hero strikes, and either it opens or a seal breaks, and how it breaks tells you what is coming: blue sparks, then purple lightning, then the roof cracking in gold, then darkness and a red moon. Watch it to the end."],
  ["EVERY SKIN ITS OWN LOOK", "All 66 skins now wear their own colors in 3D, and every body type has its own shape: capes and coats, samurai shoulder guards and skirts, hoods, robes, wings, tails, a drum ring, extra arms. Capes fly when you run, tails sway, wings beat, and the body twists with every stride."],
  ["REAL BODIES", "Every 3D hero now has a real body: thighs, knee pads, shin guards and boots, a belt, an armored chest, shoulder pads, arms with elbows and bracers, and gloved hands that hold the weapon. The free arm guards, swings and tucks in for a dash. Brutes and enforcers got arms, fists and legs too."],
  ["LEGENDARY PERKS", "An upgrade screen sometimes holds a gold LEGENDARY card that changes the whole run: STORMCALLER, REAPER, OVERCLOCK, GLASS CANNON or ECHO EDGE. One per run, so choose well."],
  ["CRATES LIKE A MOVIE", "Crate openings now have a real camera: cinema bars, a slow push-in, slow motion and a punch-in on every cut, focus lines, light rays in the rarity's color and film grain. The crate lands in a cloud of dust, pulses with every rarity step and opens with a beam of light."],
  ["A HERO THAT IS ALIVE", "Stand still and your 3D hero breathes, shifts its weight, looks around and lowers its blade, and every few seconds it twirls the blade, stretches, takes a battle stance or lays the blade back. On the home screen and in the Hero Forge it also runs a short kata."],
  ["EXECUTIONS", "A wounded elite, mini-boss or champion below 30% health is marked with a red diamond: dash through it to EXECUTE it at once. It refills your dashes, fills Overdrive and pays a big bonus."],
  ["THE CINEMATIC UPDATE", "Overdrive now cuts in with your hero across the screen. In 3D the camera circles every boss as it arrives and pushes in as it falls. Your hero now stands in 3D on the home screen and in the Hero Forge: tap it to see it slash."],
  ["YOUR BUILD IN THE PAUSE MENU", "Pause shows every perk you picked as a chip, and a neon wipe now moves you between menu screens."],
  ["YOUR HERO SPEAKS", "Each class of your own hero has its own voice and lines: at the start of a run, on kill streaks, when a boss arrives, on your last shield and when a boss falls."],
  ["DUEL A FRIEND WITH A LINK", "The challenge text now has a link: whoever opens it gets your challenge and plays the very same roof. During the run a rival bar shows their score against yours, and tells you the moment you pass them."],
  ["A GUIDE FOR NEW PLAYERS", "Crates, your rank and the Hero Forge now open step by step as you play the story, and the first time each one is there a spotlight shows what it is. One at a time, once each."],
  ["THE OBJECTIVE BAR", "Story stages show their goal at the top of the screen: the time left to defend or survive, with a bar that drains and turns red in the last 10 seconds, or how many enemies, shards, terminals or nodes you have done so far."],
  ["HERO FORGE", "Build your own fighter: NINJA, SAMURAI, SHINOBI or ONMYOJI, each with four abilities that open as the class levels up. Pick a body and two colors, and build your own weapon: short, mid or long range, with an EDGE, GRIP and CORE you upgrade with materials."],
  ["HERO TRIALS", "Endless train cars with your own hero. Every run gives class XP."],
  ["THE WORLD BOSS", "Thursday to Sunday: a boss with much more health, fought with your hero, alone or with friends in a live raid. It drops materials, and with luck a broken relic piece (three restore the mythic WORLD-EATER blade) or the very rare WORLD-EATER hero."],
  ["THREE CRATES", "BASIC (600 CR, a very small chance of the best), NEON (1,500 CR) and a LIMITED crate (3,000 CR) with a blade that exists nowhere else, in the shop for two weeks at a time: ECLIPSE FANG, then STORM CALLER."],
  ["THE CRATE OPENS FIRST", "Every opening starts with the crate itself: it lands, shakes and cracks open in light that climbs through the rarity colors. The reveal spins rays in the rarity color."]
];
function deathCause() { // what hit you last, and how to avoid it next time
  const s = G.lastHit, w = G.lastWho, en = k => lt(EDEF[k] ? EDEF[k].name : 'ENEMY');
  const bid = Object.keys(BOSS_CODE).find(k => BOSS_CODE[k] === w), bossName = w >= 40 ? lt(BOSS_INFO[bid] ? BOSS_INFO[bid].name : 'THE BOSS') : '';
  switch (s) {
    case 'touch': return [ltf('Rammed by a {0}', en(w)), w === ET.BRUTE ? lt('Brutes block from the front: bounce off a rail first or hit them from behind.') : w === ET.PHANTOM ? lt('Phantoms shimmer before they lunge: dash away or strike first.') : w === ET.MIMIC ? lt('The mimic repeats your dash along the pink line. Step off the line after you dash.') : w === ET.ENFORCER ? lt('The red line is its charge. Step aside and let it hit the wall: that stuns it and drops its shield.') : w === ET.WRAITH ? lt('The wraith fades before it blinks next to you. Keep moving when it fades.') : lt('Slash enemies before they reach you, or dodge sideways.')];
    case 'mine': return [lt('Blown up by a mine'), lt('Do not walk near mines. Dash straight through a mine to disarm it.')];
    case 'bullet':
      if (w === ET.SNIPER) return [lt('Shot by a SNIPER'), lt('Snipers aim with an orange laser first: step off the line or parry the shot.')];
      if (w === 30) return [lt('Shot by a roof turret'), lt('Dash through a turret to hack it. It fights for you after that.')];
      if (w === 31) return [lt('Shot by a firewall node'), lt('Destroy the nodes quickly, and keep moving between them.')];
      if (w >= 40) return [ltf('Shot by {0}', bossName), lt('Watch the boss pattern, slash bullets back, and only commit when it is open.')];
      if (w === ET.SPIDER || w === ET.WRAITH || w === ET.ENFORCER) return [ltf('Shot by the {0}', en(w)), lt('Mini-bosses fire in patterns. Find the gap in the pattern, and slash the slow shots back.')];
      return [ltf('Shot by a {0}', en(w)), lt('Slash bullets as your dash starts for a perfect parry; near misses charge Overdrive.')];
    case 'boom': return [lt('Caught in a bomber blast'), lt('Bombers blink before they explode. Slash them early or step out of the ring.')];
    case 'storm': return [lt('Hit by an EMP strike'), lt('Blue circles mark the strikes. Step out before they land.')];
    case 'volatile': return [lt('Caught in a VOLATILE explosion'), lt('VOLATILE elites explode after they die. Dash away from the orange ring.')];
    case 'beam': return [lt('Burned by a laser beam'), lt('Beams show a dashed line first. Move aside, or dash straight through.')];
    case 'stomp': if ((Boss.cur && Boss.cur.id === 'prime') || (G.stage && G.stage.obj.b === 'prime')) return [lt("Crushed by KUROGANE PRIME's stomp"), lt('The red circle shows where it lands. Leave the circle.')];
      return [lt('Crushed by the Warden stomp'), lt('The red circle shows where it lands. Leave the circle.')];
    case 'kage': return [lt("Cut down by Kage's dash"), lt('Dash INTO his red line to clash and stun him.')];
    case 'train': return [lt('Hit by the express train'), lt('Red stripes mean a train is coming down that track.')];
    case 'boss': return [ltf('Rammed by {0}', bossName || lt('THE BOSS')), lt('Do not stand next to the boss; strike and bounce away.')];
    case 'curtain': return [lt("Fried by Raijin's lightning curtain"), lt('Go through the green gap, or dash straight through the wall.')];
    case 'leviathan': return [lt('Crushed by LEVIATHAN'), lt('Its body hurts to touch. Dash through it, never walk into it, and step off the red lunge line.')];
    case 'breach': return [lt('Caught by LEVIATHAN breaching'), lt('When it dives, a circle follows you. Leave the circle before it closes.')];
    case 'car': return [lt('Hit by traffic'), lt('Cars only hurt you when you are not dashing. Dash THROUGH them to slice them in half.')];
    case 'valkdive': return [lt("Speared by VALKYRIE.SYS's dive"), lt('She dives along the red line. Step aside and let her hit the rail.')];
    case 'lance': return [lt('Burned by the ORBITAL LANCE'), lt('Glowing columns burn a moment later. Leave the column.')];
    case 'firewall': return [lt("Caught in CHIMERA.OS's firewall bar"), lt('The dashed gold bar burns across the roof. Move up or down, or dash through.')];
    case 'corrupt': return [lt('Lost in the corrupted roof'), lt('Purple circles decay the floor. Do not stand in them.')];
    case 'palm': return [lt('Crushed by the HAND OF DEATH'), lt('Her hand slams down where you stood: watch the red circle and dash out of it.')];
    case 'coil': return [lt('Crushed by ORYU.EXE'), lt('Never touch its body outside a dash, and get out of the ring before it closes.')];
    case 'judgement': return [lt('Struck by the judgement dash'), lt('The red line is its dash. Dash straight into it to clash instead.')];
    case 'sweep': return [lt("Cut by BENKEI's sweep"), lt('The red sector shows the cut. Step out of it, or dash through as it swings.')];
    case 'bladerain': return [lt('Cut by the blade rain'), lt('Red lines strike a moment later. Stand between them.')];
    case 'nulldash': return [lt("Cut down by REN.NULL's dash"), lt('Dash INTO its red line to clash and stun it, or hit it right after it dashes.')];
    case 'echo': return [lt("Caught by REN.NULL's echo"), lt('After each dash, the same line strikes again a moment later. Step off it.')];
    case 'strike': if ((Boss.cur && Boss.cur.id === 'prime') || (G.stage && G.stage.obj.b === 'prime')) return [lt("Struck by KUROGANE PRIME's lightning"), lt('A blue circle follows you during ZERO HOUR. Keep moving.')];
      return [lt("Struck by Raijin's lightning"), lt('Each drum marks a blue circle on you. Keep moving, and break the drums.')];
  }
  return null;
}
Object.assign(UI, {
  backFn: null,
  goBack() { if (this.backFn) { const f = this.backFn; this.backFn = null; f(); return true; } return false; },
  /* ---------------- settings ---------------- */
  resNote() { // the picture size the RESOLUTION setting gives on this screen
    const n = $('set-resNote'); if (!n) return; const d = Math.min(window.devicePixelRatio || 1, resK() || Q.dprCap);
    n.textContent = ltf('Picture: {0} × {1} pixels', Math.round(V.W * d), Math.round(V.H * d)) + (resK() ? '' : ' · ' + lt('AUTO lowers it when the phone slows down'));
  },
  openSettings() {
    this.show('settings'); const s = Store.data.settings, box = $('setList'); box.textContent = '';
    const head = txt => box.appendChild(el('div', 'eyebrow set-h', lt(txt)));
    const slider = (label, key) => {
      const r = el('label', 'set'); r.appendChild(el('span', '', lt(label)));
      const i = document.createElement('input'); i.type = 'range'; i.min = 0; i.max = 100; i.value = Math.round(s[key] * 100); i.id = 'set-' + key;
      i.oninput = () => { s[key] = i.value / 100; Aud.setVol(); Store.touch(); }; r.appendChild(i); box.appendChild(r);
    };
    const cycle = (label, key, opts, names, after) => {
      const r = el('div', 'set'); r.appendChild(el('span', '', lt(label)));
      const b = el('button', 'tog on'); const idx = () => Math.max(0, opts.indexOf(s[key]));
      b.textContent = lt(names[idx()]); b.id = 'set-' + key;
      b.onclick = () => { s[key] = opts[(idx() + 1) % opts.length]; b.textContent = lt(names[idx()]); Aud.sfx('ui'); Store.touch(); if (key === 'fx') { Q.applied = 0; setQuality(s.fx === 'low' ? 0 : 2); } applyUiSettings(); if (after) after(); };
      r.appendChild(b); box.appendChild(r);
    };
    head('SOUND'); slider('Sound effects', 'sfx'); slider('Music', 'music');
    cycle('Voice callouts', 'voice', [1, 0], ['ON', 'OFF']); cycle('Vibration', 'haptics', [1, 0], ['ON', 'OFF']);
    head('LANGUAGE'); cycle('Language', 'lang', ['auto'].concat(LANGS.map(l => l.id)), ['AUTO'].concat(LANGS.map(l => l.n)), () => { applyLang(); this.openSettings(); });
    head('CONTROLS');
    cycle('Tap to dash', 'tap', [1, 0], ['ON', 'OFF']); cycle('Aim assist', 'assist', [1, 0], ['ON', 'OFF']);
    cycle('Swipe sensitivity', 'sens', [1, 2, 0], ['NORMAL', 'HIGH', 'LOW']); cycle('Skill button size', 'btn', [1, 2, 0], ['MEDIUM', 'LARGE', 'SMALL']);
    cycle('Left-handed dock', 'lefty', [0, 1], ['OFF', 'ON']); cycle('Skill button opacity', 'bop', [1, .75, .5], ['100%', '75%', '50%']);
    { const r = el('div', 'set'); r.appendChild(el('span', '', lt('Move the skill buttons'))); const b = el('button', 'tog', lt('EDIT')); b.id = 'set-hudEdit';
      b.onclick = () => { Aud.sfx('ui'); HudEdit.open(); }; r.appendChild(b); box.appendChild(r); }
    cycle('Aim joystick', 'stick', [0, 1], ['OFF', 'ON']);
    box.appendChild(el('div', 'small mute set-note', lt('A stick above the skill buttons: push it the way you want to strike, let go to slash. Dragging anywhere still works.')));
    cycle('Auto rival ghost', 'rival', [1, 0], ['ON', 'OFF']);
    head('CONTROLLER'); { const r = el('div', 'set'); r.appendChild(el('span', '', lt('Controller'))); const b = el('span', Pad.on ? 'gold' : 'mute', Pad.on ? (Pad.name || lt('CONNECTED')).slice(0, 28) : lt('NOT CONNECTED')); b.id = 'set-pad'; r.appendChild(b); box.appendChild(r); }
    box.appendChild(el('div', 'small mute set-note', Pad.on ? lt('Left stick aims · A slash · hold LT to aim in slow motion, release to slash · X grapple · Y hijack · B laser web · LB time echo · RB overdrive · START pause. In menus: stick to move, A to press, B to go back.') : lt('Connect a controller by Bluetooth or USB, then press any button on it. Xbox, PlayStation, Switch Pro and most phone controllers work.')));
    head('SCREEN'); cycle('Graphics', 'd3', [1, 2, 0], ['3D', 'CLASSIC 3D', '2D']);
    cycle('Resolution', 'res', ['auto', 'max', 'high', 'med', 'low'], ['AUTO', 'MAX', 'HIGH', 'MEDIUM', 'LOW'], () => { Q.applied = 0; setQuality(Q.lvl); if (GL3D.cv) GL3D.size(); this.resNote(); });
    { const n = el('div', 'small mute set-note'); n.id = 'set-resNote'; box.appendChild(n); this.resNote(); } cycle('HUD', 'hud', ['clean', 'full'], ['CLEAN', 'FULL'], () => CleanHud.sync());
    cycle('Effects quality', 'fx', ['auto', 'ultra', 'high', 'low'], ['AUTO', 'ULTRA', 'HIGH', 'LOW']); cycle('Battery saver', 'bat', ['auto', 'on', 'off'], ['AUTO', 'ON', 'OFF'], () => { Power.check(); this.openSettings(); }); if (Power.note()) box.appendChild(el('div', 'small mute set-note', Power.note())); cycle('Screen shake', 'shake', [1, .5, 0], ['FULL', 'LOW', 'OFF']);
    cycle('Damage numbers', 'nums', ['all', 'crit', 'off'], ['ALL', 'CRITS', 'OFF']); cycle('Calm effects', 'calm', [0, 1], ['OFF', 'ON']);
    cycle('Colorblind colors', 'cb', [0, 1], ['OFF', 'ON']); cycle('Flashes and impact frames', 'flashes', ['full', 'soft', 'off'], ['FULL', 'SOFT', 'OFF']); cycle('Text size', 'tsz', [0, 1, 2], ['100%', '115%', '130%']); cycle('Show FPS', 'fps', [0, 1], ['OFF', 'ON']);
    cycle('Tutorial tips', 'tips', [1, 0], ['ON', 'OFF']);
    { const r = el('div', 'set'); r.appendChild(el('span', '', lt('Show every tip again'))); const b = el('button', 'tog', lt('RESET')); b.id = 'set-tipsReset';
      b.onclick = () => { Store.data.tut = {}; Store.data.seen = { rm: Store.data.seen.rm }; Store.touch(); Aud.sfx('ui'); b.textContent = lt('DONE'); }; r.appendChild(b); box.appendChild(r); }
    head('ASSIST MODE');
    cycle('Game speed', 'speed', [1, .9, .8], ['100%', '90%', '80%']); cycle('Extra shields', 'ahp', [0, 1, 2], ['NONE', '+1', '+2']);
    box.appendChild(el('div', 'small mute', lt('Assist runs still count for the story, but not for leaderboards or ghosts.')));
    head('PRIVACY'); cycle('Share anonymous play stats', 'share', [1, 0], ['ON', 'OFF']);
    box.appendChild(el('div', 'small mute', lt('Stats are only where players fail or quit, so the game can be balanced. No names, no messages.')));
    try { PC.settings(head, cycle, box, s); } catch (e) { errLog(e); }
    const more = el('div', 'grid2'); more.style.marginTop = '12px';
    [['WHAT\'S NEW', () => this.openNews(() => this.openSettings())], ['MUSIC ROOM', () => this.openMusic()], ['DEVICE CHECK', () => this.openDevice()], ['SAVE CODE', () => this.openSave()], ['SEND FEEDBACK', () => this.openReport(() => this.openSettings())]]
      .forEach(([n, fn]) => { const b = el('button', 'btn', lt(n)); b.onclick = () => { Aud.sfx('ui'); fn(); }; more.appendChild(b); });
    box.appendChild(more);
    const ach = $('setAch'); ach.textContent = '';
    for (const a of ACHS) { const got = !!Store.data.ach[a.id], r = el('div', 'bty'); r.appendChild(el('span', got ? '' : 'mute', (got ? '✓ ' : '· ') + lt(a.name) + ' — ' + lt(a.d))); r.appendChild(el('span', 'gold small', '+' + a.r)); ach.appendChild(r); }
  },
  /* ---------------- what's new ---------------- */
  openNews(back) {
    this.show('news'); this.backFn = back || (() => this.openTitle());
    $('nwVer').textContent = ltf('VERSION {0}', VERSION); const box = $('nwList'); box.textContent = '';
    for (const n of NEWS) { const r = el('div', 'bty'); r.appendChild(el('span', 'gold', lt(n[0]))); r.appendChild(el('span', 'small', lt(n[1]))); r.style.gridTemplateColumns = '1fr'; box.appendChild(r); }
    $('nwOk').onclick = () => { Aud.sfx('ui'); Store.data.seenVer = VERSION; Store.touch(); this.goBack() || this.openTitle(); };
  },
  /* ---------------- music room ---------------- */
  openMusic() {
    this.show('music'); this.backFn = () => { Aud.music('menu'); Aud.intensity = 0; this.openSettings(); };
    const st = Store.data.settings, box = $('muList'); box.textContent = '';
    const pick = st.track || 'auto';
    box.appendChild(el('div', 'eyebrow', lt('MUSIC DURING RUNS')));
    const seg = el('div', 'seg'); seg.style.gridTemplateColumns = 'repeat(2,1fr)';
    [['auto', 'AUTO'], ['shuffle', 'SHUFFLE']].forEach(([k, n]) => { const b = el('button', pick === k ? 'on' : '', lt(n)); b.onclick = () => { Aud.sfx('ui'); st.track = k; Store.touch(); this.openMusic(); }; seg.appendChild(b); });
    box.appendChild(seg);
    box.appendChild(el('div', 'small mute', pick === 'auto' ? lt('AUTO: every area and boss has its own track.') : pick === 'shuffle' ? lt('SHUFFLE: a random track every run. Bosses keep their themes.') : ltf('Every run plays {0}, bosses included.', TRACKS[pick] ? TRACKS[pick].name : pick)));
    for (const id of TRACK_LIST) {
      const T = TRACKS[id], on = Aud.mus.id === id && Aud.mus.on, mine = pick === id, b = el('div', 'item' + (on ? ' on' : '') + (mine ? ' sel' : '')); b.setAttribute('role', 'button'); b.tabIndex = 0;
      b.appendChild(el('span', 'nm', T.name)); b.appendChild(el('span', 'pr', on ? '▮▮ ' + lt('PLAYING') : '▶ ' + lt('LISTEN'))); b.appendChild(el('span', 'ds', lt(T.style) + ' · ' + T.bpm + ' BPM'));
      const use = el('button', 'chip' + (mine ? ' gold' : ''), mine ? '✓ ' + lt('IN RUNS') : lt('USE IN RUNS'));
      use.onclick = e => { e.stopPropagation(); Aud.sfx('buy'); st.track = mine ? 'auto' : id; Store.touch(); this.openMusic(); };
      b.appendChild(use);
      b.onclick = () => { Aud.init(); Aud.intensity = 3; Aud.music(id); this.openMusic(); };
      box.appendChild(b);
    }
  },
  /* ---------------- device check ---------------- */
  openDevice() {
    this.show('device'); this.backFn = () => this.openSettings(); const box = $('dvList'); box.textContent = '';
    const rows = [
      ['Screen', Math.round(V.W) + ' × ' + Math.round(V.H) + ' @' + (window.devicePixelRatio || 1).toFixed(2)],
      ['Frame rate', Math.round(Q.fps || 0) + ' FPS'], ['Effects quality', lt(['LOW', 'MEDIUM', 'HIGH'][Q.lvl])],
      ['Touch', ('ontouchstart' in window) ? lt('YES') : lt('NO')], ['Vibration', navigator.vibrate ? lt('SUPPORTED') : lt('NOT SUPPORTED (normal on iPhone)')],
      ['Sound', Aud.c ? lt(Aud.c.state.toUpperCase()) : lt('NOT STARTED')], ['Cloud save', Cloud.ready ? (Cloud.readOnly ? lt('READ ONLY') : lt('ON')) : lt('OFF (guest)')],
      ['Language', (LANGS.find(l => l.id === LANG.id) || LANGS[0]).n], ['Version', VERSION]
    ];
    for (const r of rows) { const d = el('div', 'bty'); d.appendChild(el('span', 'mute', lt(r[0]))); d.appendChild(el('span', '', r[1])); box.appendChild(d); }
    box.appendChild(el('div', 'small mute', lt('Below 50 FPS the game lowers effects by itself. For testing on friends\' phones, turn on Show FPS.')));
    for (const l of Pipe.list()) box.appendChild(el('div', 'small mute', l)); // the frame's drawing stages
    // the error log: what went wrong on this device, so a report can say exactly where
    const L = ERRLOG.a.slice().sort((p, q) => q.t - p.t); box.appendChild(el('div', 'gold', ltf('ERROR LOG ({0})', L.length)));
    if (!L.length) box.appendChild(el('div', 'small mute', lt('No errors on this device.')));
    for (const r of L.slice(0, 12)) { const d = el('div', 'bty'); d.appendChild(el('span', 'small', (r.c > 1 ? '×' + r.c + ' ' : '') + r.m)); d.appendChild(el('span', 'small mute', r.v || '')); box.appendChild(d); }
    if (L.length) { const g = el('div', 'grid2'); const cp = el('button', 'btn', lt('COPY')), cl = el('button', 'btn', lt('CLEAR'));
      cp.onclick = () => { const t = L.map(r => `[${r.v}] x${r.c} ${r.m} @ ${r.s}`).join('\n'); try { navigator.clipboard.writeText(t).then(() => { cp.textContent = lt('COPIED'); }, () => { }); } catch (e) { errLog(e); } };
      cl.onclick = () => { ERRLOG.a.length = 0; try { localStorage.removeItem('od_errlog'); } catch (e) { errLog(e); } this.openDevice(); };
      g.appendChild(cp); g.appendChild(cl); box.appendChild(g); }
  },
  /* ---------------- save code ---------------- */
  openSave() {
    this.show('save'); this.backFn = () => this.openSettings();
    const json = JSON.stringify(Store.data), code = 'ODSAVE1:' + btoa(unescape(encodeURIComponent(json)));
    const out = $('svOut'); out.value = code; $('svMsg').textContent = '';
    $('svCopy').onclick = async () => { try { await navigator.clipboard.writeText(code); $('svMsg').textContent = lt('Copied.'); } catch (e) { out.focus(); out.select(); $('svMsg').textContent = lt('Select the code and copy it.'); } };
    $('svLoad').onclick = () => {
      const raw = $('svIn').value.trim();
      try {
        if (raw.indexOf('ODSAVE1:') !== 0) throw 0;
        const o = JSON.parse(decodeURIComponent(escape(atob(raw.slice(8)))));
        if (!o || o.v !== 9 || typeof o.credits !== 'number') throw 0;
        const keepUser = Store.data.user, keepSet = Store.data.settings;
        Store.data = Store.merge(Store.def(), o); Store.data.user = keepUser; Store.data.settings = keepSet; Store.sanitize();
        Store.data.ts = Date.now(); Store.touch(); Store.flush(true); Aud.sfx('buy'); $('svMsg').textContent = lt('Save loaded.'); this.refreshProfile();
      } catch (e) { Aud.sfx('deny'); $('svMsg').textContent = lt('That code is not a valid save.'); }
    };
  },
  /* ---------------- bug report / feedback ---------------- */
  openReport(back) {
    const prevState = G.state; this.show('report'); this.backFn = back || (() => this.openTitle());
    const cats = ['BUG', 'TOO HARD', 'TOO EASY', 'IDEA', 'OTHER']; let cat = 'BUG';
    const seg = $('rpCats'); seg.textContent = ''; seg.style.gridTemplateColumns = 'repeat(5,1fr)';
    cats.forEach(c => { const b = el('button', c === cat ? 'on' : '', lt(c)); b.onclick = () => { cat = c; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }; seg.appendChild(b); });
    $('rpText').value = ''; $('rpMsg').textContent = ''; $('rpCopy').classList.add('hidden'); $('rpInfo').checked = true;
    $('rpCtx').textContent = ltf('Attached: version {0}, {1}, screen {2}×{3}, {4} FPS', VERSION, G.stage ? G.stage.id : lt(prevState === 'MENU' ? 'menu' : G.mode), Math.round(V.W), Math.round(V.H), Math.round(Q.fps || 0));
    const gh = $('rpGh'), off = offlineBuild();
    gh.className = off ? 'btn pri' : 'btn gold hidden'; $('rpGhNote').classList.toggle('hidden', !off); $('rpSend').classList.toggle('hidden', off);
    gh.onclick = () => {
      const text = $('rpText').value.trim(); if (!text) { $('rpMsg').textContent = lt('Write a few words first.'); return; }
      Aud.sfx('ui'); const item = Object.assign({ ts: Date.now(), cat, text: text.slice(0, 600) }, $('rpInfo').checked ? Feedback.info() : { v: VERSION });
      let w = null; try { w = window.open(Feedback.ghUrl(item), '_blank', 'noopener'); } catch (e) { errLog(e); }
      if (!w) { $('rpMsg').textContent = lt('Could not send from here. Copy this and send it to the developer:'); const c = $('rpCopy'); c.classList.remove('hidden'); c.value = Feedback.plain(item); }
    };
    $('rpSend').onclick = async () => {
      const text = $('rpText').value.trim(); if (!text) { $('rpMsg').textContent = lt('Write a few words first.'); return; }
      $('rpSend').disabled = true; $('rpMsg').textContent = lt('Sending…');
      const r = await Feedback.send(cat, text, $('rpInfo').checked); $('rpSend').disabled = false;
      if (r.ok) { $('rpMsg').textContent = lt('Thanks! The developer will see it.'); Aud.sfx('buy'); $('rpText').value = ''; }
      else { $('rpMsg').textContent = lt('Could not send from here. Copy this and send it to the developer:'); const c = $('rpCopy'); c.classList.remove('hidden'); c.value = Feedback.plain(r.item); $('rpGh').className = 'btn gold'; }
    };
  },
  /* ---------------- share screen ---------------- */
  openShare(o, back) {
    this.show('share'); this.backFn = back;
    const k = Share.build(o); $('shImg').src = k.toDataURL('image/png'); $('shMsg').textContent = '';
    $('shSave').onclick = async () => { const r = await Share.save(); $('shMsg').textContent = r === 'saved' ? lt('Saved.') : r === 'declined' ? lt('Not saved.') : lt('Long-press the picture to save it.'); };
    $('shCopy').onclick = async () => { const ok = await Share.copy(); $('shMsg').textContent = ok ? lt('Challenge text copied. Paste it to a friend.') : Share.text; };
  },
  /* ---------------- creator dashboard ---------------- */
  dashTab: 0,
  async openDash() {
    this.show('dash'); this.backFn = () => this.openTitle();
    const tabs = $('dsTabs'); tabs.textContent = ''; tabs.style.gridTemplateColumns = 'repeat(5,1fr)';
    ['PLAY STATS', 'FEEDBACK', 'SCORES', 'BALANCE', 'INSIGHTS'].forEach((n, i) => { const b = el('button', i === this.dashTab ? 'on' : '', lt(n)); b.onclick = () => { this.dashTab = i; this.openDash(); }; tabs.appendChild(b); });
    const box = $('dsList'); box.textContent = ''; box.appendChild(el('div', 'panel info mute', lt('Loading…')));
    if (this.dashTab === 2) { this.renderModTab(box); return; }
    if (this.dashTab === 3) { this.renderBalance(box); return; }
    if (this.dashTab === 4) { this.renderInsights(box); return; }
    const rows = await Dash.load(this.dashTab ? 'feedback' : 'stats'); if (this.cur !== 'dash') return;
    box.textContent = '';
    if (!rows) { box.appendChild(el('div', 'panel info', lt('Could not load. The dashboard only works for the game owner, signed in.'))); return; }
    if (this.dashTab === 1) {
      const items = []; for (const r of rows) for (const it of (r.items || [])) items.push(it);
      items.sort((a, b) => tsn(b.ts) - tsn(a.ts));
      if (!items.length) box.appendChild(el('div', 'panel info', lt('No reports yet.')));
      for (const it of items.slice(0, 120)) {
        const p = el('div', 'panel small'); p.appendChild(el('div', 'gold', it.cat + ' · ' + new Date(it.ts).toLocaleString() + ' · v' + it.v));
        p.appendChild(el('div', '', it.text)); if (it.ua) p.appendChild(el('div', 'mute', [it.mode, it.stage, it.diff, it.t + 's', it.fps + ' FPS', it.w + '×' + it.h, it.ua].join(' · ') + (it.err ? ' · ERR ' + it.err : '')));
        box.appendChild(p);
      }
      return;
    }
    const st = {}, md = {}; let players = 0, time = 0, touch = 0, he = 0;
    for (const r of rows) {
      players++; time += r.time | 0; if (r.dev === 'touch') touch++; if (r.lang === 'he') he++;
      for (const id in (r.st || {})) { const a = r.st[id], o = st[id] || (st[id] = { p: 0, c: 0, f: 0, q: 0, t: 0, d: {} }); o.p += a.p | 0; o.c += a.c | 0; o.f += a.f | 0; o.q += a.q | 0; o.t += a.t | 0; for (const k in (a.d || {})) o.d[k] = (o.d[k] | 0) + (a.d[k] | 0); }
      for (const id in (r.md || {})) { const a = r.md[id], o = md[id] || (md[id] = { p: 0, best: 0, sum: 0 }); o.p += a.p | 0; o.best = Math.max(o.best, a.best | 0); o.sum += a.sum | 0; }
    }
    box.appendChild(el('div', 'panel small', ltf('{0} players · {1} hours played · {2} on phones · {3} in Hebrew', players, (time / 3600).toFixed(1), touch, he)));
    for (const s of STAGES) {
      const o = st[s.id]; if (!o) continue;
      let top = '', tn = 0; for (const k in o.d) if (o.d[k] > tn) { tn = o.d[k]; top = k; }
      const r = el('div', 'bty'); r.appendChild(el('span', '', s.id + ' ' + lt(s.name)));
      r.appendChild(el('span', o.p && o.c / o.p < .4 ? 'gold' : 'mute', ltf('{0} plays · {1}% clear · {2} quit', o.p, Math.round(o.c / Math.max(1, o.p) * 100), o.q) + (top ? ' · ' + ltf('most deaths: {0}', top) : '')));
      box.appendChild(r);
    }
    for (const m in md) { const o = md[m], r = el('div', 'bty'); r.appendChild(el('span', '', lt((MODES.find(q => q.id === m) || { name: m }).name))); r.appendChild(el('span', 'mute', ltf('{0} runs · best {1} · average {2}', o.p, fmtNum(o.best), fmtNum(o.sum / Math.max(1, o.p))))); box.appendChild(r); }
  },
  /* ---------------- rival alerts on the title screen ---------------- */
  renderRivals() {
    const box = $('tRivals'); if (!box) return; const al = Rivals.alerts; box.textContent = ''; box.classList.toggle('hidden', !al.length);
    if (!al.length) return;
    box.appendChild(el('div', 'eyebrow', lt('RIVAL ALERT')));
    for (const a of al) {
      const m = MODES.find(q => q.id === a.m), r = el('div', 'bty');
      r.appendChild(el('span', '', ltf('{0} beat your {1} score: {2} vs your {3}', a.name, lt(m.name), fmtNum(a.sc), fmtNum(a.mine))));
      const b = el('button', 'chip gold', lt('CHALLENGE BACK')); b.onclick = () => { Store.data.chal = { n: a.name, s: a.sc, m: a.m, id: a.id }; Store.touch(); Ghost.fetch(a.id, a.m, a.name); Flow.startArcade(a.m); };
      r.appendChild(b); box.appendChild(r);
    }
  }
});
function applyUiSettings() { // settings that touch layout or global flags
  const s = Store.data.settings; CALM = s.calm ? 1 : 0; CBM = s.cb ? 1 : 0;
  try { document.documentElement.style.setProperty('--skh', [50, 58, 68][clamp(s.btn | 0, 0, 2)] + 'px'); document.body.classList.toggle('lefty', !!s.lefty); document.documentElement.style.setProperty('--bop', String(clamp(+s.bop || 1, .3, 1))); } catch (e) { errLog(e); }
  UI.measureDock(); HudEdit.apply();
}
