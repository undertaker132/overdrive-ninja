/* =====================================================================
   COSMETICS + TALENTS — hero skins (distinct bodies, not just colors),
   blade skins (blade color, trail, kill effect), star talent tree.
   Cosmetics never change gameplay numbers.
   unlock: { t: 'stars' | 'ach' | 'mastery' | 'story', n | id }
   ===================================================================== */
const SKINS = [
  { id: 'cyan', name: 'CYBER CYAN', body: 'ninja', a: '#00f2fe', b: '#ff0844', cost: 0, desc: 'The classic neon ninja.' },
  { id: 'crimson', name: 'BLOOD NINJA', body: 'ninja', a: '#ff0844', b: '#ffd700', cost: 300, desc: 'Red neon ninja with a gold scarf.' },
  { id: 'solar', name: 'SOLAR FLARE', body: 'ninja', a: '#ffd700', b: '#ff5500', cost: 450, desc: 'Gold neon ninja with a fire scarf.' },
  { id: 'void', name: 'VOID PHANTOM', body: 'ninja', a: '#b537f2', b: '#00f2fe', cost: 600, desc: 'Violet neon ninja with an ice scarf.' },
  { id: 'venom', name: 'VENOM MATRIX', body: 'ninja', a: '#00ff88', b: '#00f2fe', cost: 750, desc: 'Toxic green neon ninja.' },
  { id: 'ronin', name: 'STREET RONIN', body: 'ronin', a: '#ffb347', b: '#8a1b1b', cost: 900, desc: 'A wandering swordsman under a wide straw hat.' },
  { id: 'goo', name: 'NEON GOO', body: 'goo', a: '#7dff6a', b: '#ff4fd8', cost: 1000, desc: 'A wobbly slime monster. It bounces instead of walking.' },
  { id: 'neko', name: 'NEKO-NIN', body: 'neko', a: '#ff9ad8', b: '#7df9ff', cost: 1100, desc: 'A cat ninja. Ears up, tail swishing.' },
  { id: 'wolf', name: 'OOKAMI', body: 'wolf', a: '#ffd23f', b: '#8fa4d8', cost: 1300, desc: 'A wolf warrior with a fur mane and a bushy tail.' },
  { id: 'oni', name: 'ONI BERSERKER', body: 'oni', a: '#ff6a3d', b: '#3a0a10', cost: 1400, desc: 'A horned demon with a fanged war mask and spiked shoulders.' },
  { id: 'viking', name: 'JARL', body: 'viking', a: '#ff9a3c', b: '#3a6ea5', cost: 1500, desc: 'A viking berserker: horned helmet, braided beard, round shield.' },
  { id: 'kitsune', name: 'KITSUNE', body: 'kitsune', a: '#ff8a3d', b: '#ffffff', cost: 1600, desc: 'A fox spirit with three flowing tails.' },
  { id: 'knight', name: 'IRON PALADIN', body: 'knight', a: '#e8eef8', b: '#c0102e', cost: 1700, desc: 'A knight in a great helm with a red plume and a long cape.' },
  { id: 'tengu', name: 'KARASU TENGU', body: 'tengu', a: '#e8b030', b: '#2a2a3a', cost: 1800, desc: 'A crow warrior. Its wings spread when it dashes.' },
  { id: 'mecha', name: 'MECH-07', body: 'mecha', a: '#7df9ff', b: '#8fa4c8', cost: 2000, desc: 'A combat robot with jet boots and a visor.' },
  { id: 'skull', name: 'GASHADOKURO', body: 'skull', a: '#7dff6a', b: '#e8e2d0', cost: 2200, desc: 'A skeleton spirit with glowing eyes.' },
  { id: 'yurei', name: 'YUREI', body: 'yurei', a: '#bfe6ff', b: '#0a0a12', cost: 2400, desc: 'A ghost. It floats instead of walking.' },
  { id: 'ryu', name: 'RYU', body: 'dragon', a: '#6dff9e', b: '#ffd23f', cost: 3200, desc: 'A young dragon with horns, bat wings and a long spiked tail.' },
  { id: 'gold', name: 'GOLDEN SHOGUN', body: 'shogun', a: '#ffd700', b: '#c0102e', cost: -1, unlock: { t: 'stars', n: 30 }, desc: 'Gold armor with a horned kabuto helmet.' },
  { id: 'tide', name: 'TIDE DRAGON', body: 'dragon', a: '#2fe6c8', b: '#ffd23f', cost: -1, unlock: { t: 'ach', id: 'leviathan' }, desc: 'A sea-green dragon from the harbor. Defeat LEVIATHAN to claim it.' },
  { id: 'monk', name: 'IRON MONK', body: 'ronin', a: '#ff9a3d', b: '#7a2a10', cost: -1, unlock: { t: 'ach', id: 'benkei' }, desc: 'Saffron robes of the old monastery. Defeat BENKEI.SYS to claim it.' },
  { id: 'ascendant', name: 'ASCENDANT', body: 'seraph', a: '#ffd700', b: '#ff9a3d', cost: -1, unlock: { t: 'ach', id: 'tower5' }, desc: 'Gold wings from the top of the Neon Tower. Clear floor 5 to claim it.' },
  { id: 'cursed', name: 'CURSED CLIMBER', body: 'lich', a: '#ff2a2a', b: '#3a0610', cost: -1, unlock: { t: 'ach', id: 'tower10' }, desc: 'Wears every curse the tower threw at it. Clear floor 10 to claim it.' },
  { id: 'skybreak', name: 'SKYBREAKER', body: 'sovereign', a: '#7df9ff', b: '#ffffff', cost: -1, unlock: { t: 'ach', id: 'tower20' }, desc: 'Broke through the roof of the sky. Clear floor 20 to claim it.' },
  { id: 'abyssal', name: 'ABYSS DRAGON', body: 'dragon', a: '#2ee6c8', b: '#7a5cff', cost: -1, unlock: { t: 'ach', id: 'oryu' }, desc: 'Scales of deep-sea cable. Defeat ORYU.EXE to claim it.' },
  { id: 'primegold', name: 'PRIME FRAME', body: 'mecha', a: '#ffd700', b: '#ff0844', cost: -1, unlock: { t: 'ach', id: 'prime' }, desc: 'The founder\'s gold war frame, now yours. Defeat KUROGANE PRIME to claim it.' },
  { id: 'nullren', name: 'NULL REN', body: 'ninja', a: '#f2f2f2', b: '#ff0844', cost: -1, unlock: { t: 'ach', id: 'nullren' }, desc: 'Your own copy, white and red. Defeat REN.NULL to claim it.' },
  { id: 'twin', name: 'NEON TWINS', body: 'neko', a: '#00ff88', b: '#ff2bd6', cost: -1, unlock: { t: 'ref' }, desc: 'Invite reward: you and your friend both get it when the friend finishes chapter 1.' },
  { id: 'raijin', name: 'RAIJIN', body: 'raijin', a: '#9fd8ff', b: '#b537f2', cost: -1, unlock: { t: 'ach', id: 'raijin' }, desc: 'The thunder god, with a ring of storm drums.' },
  { id: 'retro', name: '8-BIT BRAWLER', body: 'pixel', a: '#00ff88', b: '#ff2bd6', cost: 2400, desc: 'A fighter straight out of an old arcade cabinet, drawn in chunky pixels.' },
  { id: 'rider', name: 'NEON RIDER', body: 'rider', a: '#00ff88', b: '#9fffcf', cost: 2600, desc: 'A riding jacket with neon piping and a full-face helmet with a comm unit.' },
  { id: 'sung', name: 'SHADOW SOVEREIGN', body: 'sovereign', a: '#7aa8ff', b: '#9b5bff', cost: 3400, desc: 'A long dark coat, glowing eyes and a ring of shadow wisps. Pairs with the SOVEREIGN DAGGERS.' },
  { id: 'eva', name: 'BIO-TITAN', body: 'mecha', a: '#2fe6c8', b: '#ff6a00', cost: 3000, desc: 'A bio-mechanical frame. On your last shield it goes berserk: red eyes and a blood aura.' },
  { id: 'seraph', name: 'SERAPH FRAME', body: 'seraph', a: '#00f2fe', b: '#e8fbff', cost: -1, unlock: { t: 'ach', id: 'valkyrie' }, desc: 'An angel-frame with folded blade wings. Defeat VALKYRIE.SYS to claim it.' },
  { id: 'voidlich', name: 'VOID LICH', body: 'lich', a: '#b537f2', b: '#2a1a3a', cost: -1, unlock: { t: 'ach', id: 'chimera' }, desc: 'A hooded lich in torn void robes that floats above the roof. Defeat CHIMERA.OS to claim it.' },
  { id: 'deus', name: 'DEUS FRAME', body: 'seraph', a: '#ffd700', b: '#fff3c4', cost: -1, unlock: { t: 'ach', id: 'genesis' }, desc: 'The final machine\'s golden frame, now yours. Defeat DEUS EX KUROGANE to claim it.' },
  { id: 'netrunner', name: 'NETRUNNER', body: 'netrunner', a: '#00f2fe', b: '#ff2bd6', cost: 2800, desc: 'A hooded hacker with a glowing implant eye, cables from the neck jack and a ring of floating data.' },
  { id: 'shinobi2', name: 'CYBER SHINOBI', body: 'shinobi2', a: '#7df9ff', b: '#ff0844', cost: 3000, desc: 'A white cyber-ninja frame with a red visor slit and a lit spine.' },
  { id: 'chromesam', name: 'CHROME SAMURAI', body: 'chromesam', a: '#ff2bd6', b: '#00f2fe', cost: 3200, desc: 'A street samurai: a long coat with neon lining, a mohawk, mirror shades and chrome arms.' },
  { id: 'witch', name: 'STARLIGHT WITCH', body: 'witch', a: '#b48cff', b: '#ff4fd8', cost: 3000, desc: 'A wide pointed hat with a band of stars, a long cape and a little star that follows her.' },
  { id: 'blaze', name: 'BLAZE FIST', body: 'blaze', a: '#ff6a00', b: '#ffd23f', cost: 2900, desc: 'A street brawler with burning spiky hair, a long headband and an aura that flares when he dashes.' },
  { id: 'ashura', name: 'ASHURA', body: 'ashura', a: '#ff3b3b', b: '#ffd23f', cost: 4000, desc: 'A war god with six arms, three faces and a gold crown. The extra arms punch when you dash.' },
  { id: 'idol', name: 'SYNTH IDOL', body: 'idol', a: '#ff9ad8', b: '#7df9ff', cost: 3100, desc: 'An android pop idol with big headphones. Leaves music notes behind her.' },
  { id: 'exo', name: 'EXO TITAN', body: 'exo', a: '#ffd23f', b: '#00f2fe', cost: 3500, desc: 'A heavy exosuit with shoulder blocks, a shoulder cannon, a reactor core and jet boots.' },
  { id: 'starframe', name: 'STAR FRAME', body: 'exo', a: '#fff3c4', b: '#7df9ff', cost: -1, unlock: { t: 'ach', id: 'tenkai' }, desc: 'A white-gold orbital exosuit from the mirror station. Defeat TENKAI.SYS to claim it.' },
  { id: 'firstblade', name: 'FIRST BLADE', body: 'shinobi2', a: '#ffd700', b: '#f4f4f4', cost: -1, unlock: { t: 'ach', id: 'izanami' }, desc: 'The armor of the first blade, gold and white. Defeat IZANAMI to claim it.' },
  { id: 'lanternoni', name: 'LANTERN ONI', body: 'oni', a: '#ff7a1a', b: '#1a0806', c1: '#3a1206', c2: '#c0102e', cost: -1, unlock: { t: 'ach', id: 'hyakki' }, desc: 'The parade leader\'s colors: lantern orange and night black. Defeat HYAKKI to claim it.' },
  { id: 'exframe', name: 'EX FRAME', body: 'mecha', a: '#ff0844', b: '#14141a', cost: -1, unlock: { t: 'ach', id: 'exall' }, desc: 'A black war frame with a red EX core. Beat every EX boss to claim it.' },
  { id: 'pumpking', name: 'PUMPKIN KING', body: 'pumpkin', a: '#ff7a1a', b: '#6a1aa0', cost: -1, unlock: { t: 'event', id: 'halloween' }, desc: 'A jack-o-lantern head with a burning grin and a tattered cape. NEON HALLOWEEN event reward.' },
  { id: 'yeti', name: 'NEON YETI', body: 'yeti', a: '#9fe8ff', b: '#ffffff', cost: -1, unlock: { t: 'event', id: 'winter' }, desc: 'A shaggy snow beast with ice horns and glowing eyes. FROSTBYTE WINTER event reward.' },
  { id: 'voidoni', name: 'VOID ONI', body: 'oni', a: '#7df9ff', b: '#1a0830', cost: -1, unlock: { t: 'ach', id: 'ngplus' }, desc: 'An oni from the void, cold and glowing.' }
];
const BLADE_FX_V35 = [ // version 35
  { id: 'aurora', name: 'AURORA', blade: '#00ff88', edge: '#e0ccff', trail: 'void', kill: 'implode', deco: 'prism', cost: 1700, desc: 'Northern lights on steel. Kills fold inward in green and violet.' },
  { id: 'goldleaf', name: 'GOLD LEAF', blade: '#ffd23f', edge: '#fff4c2', trail: 'gold', kill: 'coins', deco: 'flame', cost: 1900, desc: 'A blade wrapped in gold leaf. Kills burst into coins.' },
  { id: 'stormcall', name: 'STORM CALL', blade: '#7df9ff', edge: '#ffffff', trail: 'spark', kill: 'zap', deco: 'crack', cost: 2100, desc: 'An ice-blue edge. Every kill calls down lightning.' }
];
const BLADE_FX = [
  { id: 'std', name: 'STANDARD ISSUE', cost: 0, trail: '', kill: '', desc: "Takes your hero's neon color." },
  { id: 'sakura', name: 'SAKURA STORM', blade: '#ffb7d5', edge: '#ffffff', trail: 'petal', kill: 'petal', deco: 'petal', cost: 700, desc: 'Pink blade. Dashes leave cherry petals, kills burst into blossoms.' },
  { id: 'inferno', name: 'INFERNO EDGE', blade: '#ff6a00', edge: '#ffd700', trail: 'ember', kill: 'burn', deco: 'flame', cost: 900, desc: 'A burning blade. Dashes leave embers, kills explode in flame.' },
  { id: 'glacier', name: 'GLACIER', blade: '#9fe8ff', edge: '#ffffff', trail: 'snow', kill: 'shatter', deco: 'ice', cost: 900, desc: 'An ice blade. Enemies shatter like glass.' },
  { id: 'bone', name: 'BONE CLEAVER', blade: '#efe9d8', edge: '#ffffff', trail: 'smoke', kill: 'bones', deco: 'bone', cost: 1100, desc: 'A blade carved from a giant bone. Kills scatter into bone shards.' },
  { id: 'obsidian', name: 'OBSIDIAN', blade: '#24242f', edge: '#ff0844', trail: 'smoke', kill: 'ink', deco: 'crack', cost: 1200, desc: 'Black glass with a red edge. Kills splash ink.' },
  { id: 'chainsaw', name: 'NEON CHAINSAW', blade: '#ff9a00', edge: '#ffe14d', trail: 'spark', kill: 'shred', deco: 'saw', cost: 1350, desc: 'Spinning neon teeth. Kills shred into sparks and scrap metal.' },
  { id: 'prism', name: 'PRISM', blade: 'prism', edge: '#ffffff', trail: 'prism', kill: 'rainbow', deco: 'prism', cost: 1500, desc: 'Cycles through every color of the rainbow.' },
  { id: 'plasma', name: 'PLASMA ARC', blade: '#7a5cff', edge: '#e0d4ff', trail: 'plasma', kill: 'plasma', deco: 'arc', cost: 1300, desc: 'Violet plasma. Electric arcs crawl along the edge, kills burst in a plasma ring.' },
  { id: 'toxic', name: 'BIOHAZARD', blade: '#7dff3a', edge: '#e8ffd0', trail: 'acid', kill: 'acid', deco: 'drip', cost: 1200, desc: 'A dripping toxic blade. Dashes leave acid drops, kills splash green.' },
  { id: 'holo', name: 'HOLOGRAM', blade: '#00f2fe', edge: '#ffffff', trail: 'holo', kill: 'holo', deco: 'scan', cost: 1400, desc: 'A blade of light with scanlines. Kills break into wireframe cubes.' },
  { id: 'solar', name: 'SOLAR CROWN', blade: '#fff3c4', edge: '#ffd700', trail: 'sun', kill: 'nova', deco: 'rays', cost: 1500, desc: 'White-gold and blinding. Kills flash like a small star.' },
  { id: 'bloodmoon', name: 'CRIMSON MOON', blade: '#c0001a', edge: '#ff6a7a', trail: 'blood', kill: 'moon', deco: 'moon', cost: 1400, desc: 'A deep red blade under a red moon. Kills leave a crescent slash.' },
  { id: 'stardust', name: 'STARDUST', blade: '#2a3a8a', edge: '#ffffff', trail: 'stars', kill: 'stars', deco: 'stars', cost: 1600, desc: 'A night-sky blade full of stars. Kills burst into stars.' },
  { id: 'jade', name: 'ANCIENT JADE', blade: '#2ecf8a', edge: '#ffd23f', trail: 'leaf', kill: 'jade', deco: 'runes', cost: 1300, desc: 'Carved jade with gold runes, from a forgotten dynasty. Dashes scatter leaves.' },
  { id: 'circuit', name: 'CIRCUIT BOARD', blade: '#0d4a22', edge: '#3dff6a', trail: 'data', kill: 'data', deco: 'circuit', cost: 1200, desc: 'Green traces and solder points. Kills break into ones and zeros.' },
  { id: 'aurora2', name: 'NORTHERN LIGHTS', blade: '#5effc8', edge: '#ffffff', trail: 'aurora', kill: 'aurora', deco: 'aurora', cost: 1800, desc: 'Green and violet light that waves along the blade.' },
  { id: 'shadowflame', name: 'SHADOW FLAME', blade: '#2a0a3a', edge: '#c45bff', trail: 'shadow', kill: 'shadow', deco: 'sflame', cost: 1700, desc: 'Black fire with a violet edge. Kills burn away into shadow.' },
  { id: 'candycorn', name: 'CANDY CORN', blade: '#ff9a1a', edge: '#fff4d0', trail: 'candy', kill: 'candy', deco: 'stripes', cost: -1, unlock: { t: 'event', id: 'halloween' }, desc: 'Orange, yellow and white stripes. Kills burst into candy. NEON HALLOWEEN event reward.' },
  { id: 'frostbite', name: 'FROSTBITE', blade: '#7fd8ff', edge: '#ffffff', trail: 'snowstar', kill: 'snowburst', deco: 'snowflake', cost: -1, unlock: { t: 'event', id: 'winter' }, desc: 'Snowflakes spin along the blade. Kills burst into a snow cloud. FROSTBYTE WINTER event reward.' },
  { id: 'exedge', name: 'EX EDGE', blade: '#ff0844', edge: '#ffffff', trail: 'blood', kill: 'moon', deco: 'crack', cost: -1, unlock: { t: 'ach', id: 'ex3' }, desc: 'A red-hot blade with a white edge. Beat three EX bosses to claim it.' },
  { id: 'origin', name: 'FIRST CODE', blade: '#f4f4f4', edge: '#ffd700', trail: 'data', kill: 'nova', deco: 'runes', cost: -1, unlock: { t: 'ach', id: 'izanami' }, desc: 'White steel written with the first code in gold. Defeat IZANAMI to claim it.' },
  { id: 'glitch', name: 'GLITCH.EXE', blade: 'glitch', edge: '#ffffff', trail: 'pixel', kill: 'pixel', deco: 'glitch', cost: -1, unlock: { t: 'ach', id: 'sss' }, desc: 'An RGB-split blade. Kills break into pixels.' },
  { id: 'dragon', name: 'GOLDEN DRAGON', blade: '#ffd700', edge: '#fff4c2', trail: 'gold', kill: 'coins', deco: 'scale', cost: -1, unlock: { t: 'mastery', n: 4 }, desc: 'Gold sparks and a shower of coins.' },
  { id: 'thunder', name: 'THUNDERCLAP', blade: '#ffe14d', edge: '#ffffff', trail: 'spark', kill: 'zap', deco: 'bolt', cost: -1, unlock: { t: 'ach', id: 'raijin' }, desc: 'Kills crackle with lightning.' },
  { id: 'voidr', name: 'VOID REAPER', blade: '#b537f2', edge: '#00f2fe', trail: 'void', kill: 'implode', deco: 'void', cost: -1, unlock: { t: 'ach', id: 'ngplus' }, desc: 'Kills collapse into a tiny black hole.' }
];
const PRISM = []; for (let i = 0; i < 24; i++) PRISM.push('hsl(' + i * 15 + ',100%,64%)');
/* permanent talents: each tier opens at a star count; pick one of two, switch any time for free */
const TALENTS = [
  { need: 3, a: { id: 'quick', name: 'QUICK HANDS', desc: 'Dash charges recharge 12% faster' }, b: { id: 'steady', name: 'STEADY BLADE', desc: 'Blade heat builds 15% slower' } },
  { need: 8, a: { id: 'headstart', name: 'HEAD START', desc: 'Start every run with 40 Overdrive' }, b: { id: 'scav', name: 'SCAVENGER', desc: '+15% credits from the roof' } },
  { need: 14, a: { id: 'grazer', name: 'GRAZE RUNNER', desc: 'Near misses refund a dash charge' }, b: { id: 'lockon', name: 'LOCK-ON', desc: 'Chain slash can lock 5 targets' } },
  { need: 20, a: { id: 'regen', name: 'SECOND SKIN', desc: 'Repair 1 shield after 25 seconds without a hit' }, b: { id: 'keen', name: 'KEEN EDGE', desc: '+10% crit chance' } },
  { need: 27, a: { id: 'odlong', name: 'OVERCLOCKED', desc: 'Overdrive lasts 1.5 seconds longer' }, b: { id: 'surge', name: 'SKILL SURGE', desc: 'Skill cooldowns -20%' } },
  { need: 35, a: { id: 'laststand', name: 'LAST STAND', desc: 'Once per run, survive a fatal hit with 1 shield' }, b: { id: 'berserk', name: 'BERSERKER', desc: '+25% damage while on your last shield' } }
];
function unlockOk(u) {
  if (!u) return true; const d = Store.data;
  if (u.t === 'stars') return Store.stars() >= u.n;
  if (u.t === 'ach') return !!d.ach[u.id];
  if (u.t === 'story') return !!d.story.done.any;
  if (u.t === 'mastery') { for (const w of WEAPONS) if (masteryLevel(w.id) >= u.n) return true; return false; }
  return false; // season rewards are claimed on the SEASON screen
}
function unlockText(u) {
  if (!u) return '';
  if (u.t === 'stars') return ltf('Earn {0} story stars', u.n);
  if (u.t === 'mastery') return ltf('Reach mastery {0} with any blade', u.n);
  if (u.t === 'story') return lt('Finish the story');
  if (u.t === 'season') return ltf('Season reward: claim it on the SEASON screen ({0}).', lt(SEASONS[u.m].n));
  if (u.id === 'valkyrie') return lt('Defeat VALKYRIE.SYS in chapter 10');
  if (u.id === 'chimera') return lt('Defeat CHIMERA.OS in chapter 11');
  if (u.id === 'genesis') return lt('Defeat DEUS EX KUROGANE in chapter 12');
  if (u.id === 'oryu') return lt('Defeat ORYU.EXE in chapter 14');
  if (u.id === 'tenkai') return lt('Defeat TENKAI.SYS in chapter 16');
  if (u.id === 'izanami') return lt('Defeat IZANAMI in chapter 18');
  if (u.id === 'hyakki') return lt('Defeat HYAKKI in chapter 20');
  if (u.t === 'event') { const E = EVENTS.find(q => q.id === u.id); return ltf('Event reward: get it in the {0} event', lt(E ? E.name : 'EVENT')); }
  if (u.id === 'ex3') return lt('Beat three EX bosses in the SECRETS chapter');
  if (u.id === 'exall') return lt('Beat every EX boss in the SECRETS chapter');
  if (u.id === 'raijin') return lt('Defeat RAIJIN in the bonus chapter');
  if (u.id === 'nullren') return lt('Defeat REN.NULL in chapter 6');
  if (u.id === 'leviathan') return lt('Defeat LEVIATHAN in chapter 7');
  if (u.id === 'benkei') return lt('Defeat BENKEI.SYS in chapter 8');
  if (u.id === 'prime') return lt('Defeat KUROGANE PRIME in chapter 9');
  if (u.t === 'ref') return lt('Invite a friend from CLUB: when they finish chapter 1, you both get it.');
  if (u.id === 'ngplus') return lt('Clear New Game+');
  if (u.id === 'sss') return lt('Reach SSS style rank');
  return lt('Locked');
}
function skinOf(id) { return SKINS.find(s => s.id === id) || SKINS[0]; }
BLADE_FX.push(...BLADE_FX_V35,
  { id: 'riptide', name: 'RIPTIDE', blade: '#3dd8ff', edge: '#e8fbff', trail: 'snow', kill: 'shatter', deco: 'ice', cost: 2300, desc: 'A sea-blue edge. Kills break apart like ice in the surf.' },
  { id: 'neonink', name: 'NEON INK', blade: '#ff2bd6', edge: '#05060f', trail: 'smoke', kill: 'ink', deco: 'crack', cost: 2500, desc: 'Black ink with a pink glow. Kills splash across the roof.' });
SKINS.push( // version 36
  { id: 'emberninja', name: 'EMBER SHINOBI', body: 'shinobi2', a: '#ff6a00', b: '#ffd23f', cost: 4600, desc: 'A cyber-ninja frame glowing like coals in the wind.' },
  { id: 'midnightwolf', name: 'MIDNIGHT WOLF', body: 'wolf', a: '#7d8cff', b: '#05060f', cost: 5800, desc: 'A wolf warrior in black armor with moonlit eyes.' },
  { id: 'sakurawitch', name: 'SAKURA WITCH', body: 'witch', a: '#ffb7d5', b: '#7928ca', cost: 7200, desc: 'A street witch whose hat sheds cherry petals.' });
SKINS.push( // version 35
  { id: 'encore', name: 'ENCORE RONIN', body: 'ronin', a: '#ff2bd6', b: '#ffd23f', cost: 3200, desc: 'A neon-pink ronin with a gold hat band, dressed for the last act.' },
  { id: 'glitchsam', name: 'GLITCH SAMURAI', body: 'chromesam', a: '#7df9ff', b: '#ff0844', cost: 6800, desc: 'A street samurai whose coat flickers between frames.' },
  { id: 'auroraseraph', name: 'AURORA SERAPH', body: 'seraph', a: '#00ff88', b: '#b537f2', cost: 9800, desc: 'Wings of green and violet light, like the northern sky.' }
);
function bladeOf(id) { return BLADE_FX.find(s => s.id === id) || BLADE_FX[0]; }
