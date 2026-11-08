/* =====================================================================
   OVERDRIVE: CYBER SLASH v9 — DATA TABLES
   All tuning lives here. Logical units: the view is ~420 wide, the
   train roof (arena) is 340 wide. Speeds are units per second.
   ===================================================================== */
const VERSION = '47.0';
const SIM_COMPAT = ['11.0', '12.0', '13.0', '15.0', '16.0', '16.1', '17.0', '18.0', '19.0', '20.0', '21.0', '22.0', '23.0', '24.0', '25.0', '26.0', '26.1', '26.2', '26.3', '27.0', '28.0', '29.0', '30.0', '31.0', '32.0', '33.0', '34.0', '35.0', '36.0', '37.0', '38.0', '39.0', '40.0', '40.1', '41.0', '42.0', '43.0', '44.0', '45.0', '46.0', '47.0']; // replays recorded by these versions play back identically (arcade sim unchanged)
const CFG = { step: 1 / 60, maxSteps: 5, maxEnemies: 22, arenaW: 340, viewW: 420, viewH: 760 };
let RDT = 1 / 60; // version 34: the real time of the frame being drawn. Drawing code uses it instead of a fixed 1/60, so 120-480 Hz screens animate at the right speed

const DIFFS_V18 = [ // the tuning replays recorded before version 19 were played with
  { id: 'rookie', name: 'ROOKIE', desc: 'Forgiving. Extra shields, slower enemies.', ehp: .7, espd: .82, bspd: .8, fire: .75, spawn: .8, hp: 2, parry: .06, score: .75, cred: .8, bhp: .7, elite: 0, dda: [.15, .75] },
  { id: 'ronin', name: 'RONIN', desc: 'The intended challenge.', ehp: 1, espd: 1, bspd: 1, fire: 1, spawn: 1, hp: 0, parry: 0, score: 1, cred: 1, bhp: 1, elite: .04, dda: [.2, .9] },
  { id: 'samurai', name: 'SAMURAI', desc: 'Faster, tougher, one less shield.', ehp: 1.35, espd: 1.12, bspd: 1.15, fire: 1.25, spawn: 1.2, hp: -1, parry: -.03, score: 1.6, cred: 1.3, bhp: 1.35, elite: .1, dda: [.35, 1] },
  { id: 'overdrive', name: 'OVERDRIVE', desc: 'Nightmare. Two shields. No mercy.', ehp: 1.8, espd: 1.25, bspd: 1.3, fire: 1.5, spawn: 1.45, hp: -99, parry: -.05, score: 2.5, cred: 1.7, bhp: 1.8, elite: .2, dda: [.6, 1] }
];
const DIFFS = [ // version 19: every tier above ROOKIE is harder, and the adaptive difficulty can now push past 1 for players who play well
  { id: 'rookie', name: 'ROOKIE', desc: 'Forgiving. Extra shields, slower enemies.', ehp: .7, espd: .82, bspd: .8, fire: .75, spawn: .8, hp: 2, parry: .06, score: .75, cred: .8, bhp: .7, elite: 0, dda: [.15, .75] },
  { id: 'ronin', name: 'RONIN', desc: 'The intended challenge. The better you play, the harder it pushes back.', ehp: 1.15, espd: 1.06, bspd: 1.08, fire: 1.15, spawn: 1.12, hp: 0, parry: 0, score: 1, cred: 1, bhp: 1.15, elite: .07, dda: [.3, 1.15] },
  { id: 'samurai', name: 'SAMURAI', desc: 'Faster, tougher, one less shield.', ehp: 1.55, espd: 1.18, bspd: 1.22, fire: 1.4, spawn: 1.35, hp: -1, parry: -.04, score: 1.6, cred: 1.3, bhp: 1.55, elite: .14, dda: [.45, 1.25] },
  { id: 'overdrive', name: 'OVERDRIVE', desc: 'Nightmare. Two shields. No mercy.', ehp: 2.1, espd: 1.3, bspd: 1.38, fire: 1.7, spawn: 1.6, hp: -99, parry: -.06, score: 2.5, cred: 1.7, bhp: 2.1, elite: .25, dda: [.7, 1.3] },
  { id: 'shinigami', name: 'SHINIGAMI', desc: 'Death god. One shield, relentless enemies, and it only gets harder while you play well.', ehp: 2.6, espd: 1.4, bspd: 1.45, fire: 1.95, spawn: 1.8, hp: -100, parry: -.08, score: 4, cred: 2.2, bhp: 2.6, elite: .35, dda: [.9, 1.4] }
];
function diffTable() { return simV(19) ? DIFFS : DIFFS_V18; }

const WEAPONS = [
  { id: 'katana', name: 'CYBER KATANA', desc: 'Balanced. Wide crescent arc.', dmg: 1, speed: 1450, ch: 2, crit: .15, cm: 2, heat: 20, reach: 6, cost: 0 },
  { id: 'daggers', name: 'TWIN HOLO-DAGGERS', desc: '4 dash charges. High crit chance, runs hot.', dmg: .72, speed: 1380, ch: 4, crit: .28, cm: 1.8, heat: 25, reach: 0, cost: 450 },
  { id: 'hammer', name: 'GRAVITY HAMMER', desc: 'Heavy hits. Wall bounces shatter armor in a shockwave.', dmg: 1.8, speed: 1260, ch: 2, crit: .08, cm: 2.4, heat: 24, reach: 4, cost: 800 },
  { id: 'scythe', name: 'VOID CHAIN-SCYTHE', desc: 'Pulls nearby enemies into your slash path.', dmg: 1.1, speed: 1400, ch: 3, crit: .15, cm: 2, heat: 22, reach: 10, cost: 1200 },
  { id: 'kunai', name: 'SHADOW KUNAI', desc: 'Every dash also throws 3 kunai in a fan.', dmg: .8, speed: 1420, ch: 3, crit: .2, cm: 2, heat: 18, reach: 2, cost: 1500 },
  { id: 'whip', name: 'CHAIN WHIP', desc: 'When a dash ends, the chain cracks a wide arc in front of you.', dmg: .9, speed: 1350, ch: 3, crit: .15, cm: 2.2, heat: 20, reach: 12, cost: 1800 },
  { id: 'spear', name: 'PLASMA SPEAR', desc: 'Fast and long. Pierces shields, bubbles and mirrors, and never bounces back.', dmg: 1.25, speed: 1700, ch: 2, crit: .12, cm: 2.2, heat: 24, reach: 20, cost: 2200 },
  { id: 'fists', name: 'TITAN GAUNTLETS', desc: 'Short, heavy punches that launch enemies into walls and each other.', dmg: 1.5, speed: 1150, ch: 3, crit: .1, cm: 2.3, heat: 18, reach: -4, cost: 2600 },
  { id: 'monarch', name: 'SOVEREIGN DAGGERS', desc: 'Twin curved shadow daggers. Kills store shadows; Overdrive releases them as a hunting swarm.', dmg: .95, speed: 1400, ch: 3, crit: .22, cm: 2.1, heat: 22, reach: 2, cost: 3200, v: 15 },
  { id: 'dominator', name: 'DOMINATOR', desc: 'A blade with a plasma barrel. Every dash ends in a point-blank spray of pellets.', dmg: 1.3, speed: 1260, ch: 2, crit: .12, cm: 2.3, heat: 28, reach: 6, cost: 3600, v: 15 },
  { id: 'nodachi', name: 'STORM NODACHI', desc: 'A huge two-handed blade. When a dash ends, it cuts a full circle around you.', dmg: 2.1, speed: 1180, ch: 2, crit: .12, cm: 2.6, heat: 26, reach: 22, cost: 3000, v: 20 },
  { id: 'chakram', name: 'NEON CHAKRAM', desc: 'Every dash throws a bladed ring that flies out and comes back, cutting everything both ways.', dmg: .85, speed: 1450, ch: 3, crit: .18, cm: 2, heat: 20, reach: 0, cost: 2800, v: 20 },
  { id: 'tessen', name: 'STEEL FAN', desc: 'A folding war fan. A wider perfect-parry window, and parried shots split into three.', dmg: .9, speed: 1400, ch: 3, crit: .15, cm: 2, heat: 18, reach: 4, cost: 2400, v: 20 },
  { id: 'cleaver', name: 'TITAN CLEAVER', desc: 'A slab of raw iron as tall as you. Every hit cleaves the enemies around the target too.', dmg: 1.9, speed: 1200, ch: 2, crit: .1, cm: 2.5, heat: 26, reach: 14, cost: 3400, v: 21 },
  { id: 'thunder', name: 'THUNDER FANG', desc: 'A lightning katana. Every hit jumps as lightning to two more enemies.', dmg: 1, speed: 1500, ch: 3, crit: .18, cm: 2.1, heat: 22, reach: 6, cost: 3000, v: 21 },
  { id: 'zerocut', name: 'ZERO-CUT', desc: 'The delayed cut. When a dash ends, the whole path you ran is cut a beat later.', dmg: .95, speed: 1650, ch: 3, crit: .2, cm: 2.2, heat: 20, reach: 4, cost: 3200, v: 21 },
  { id: 'staff', name: 'NYOI STAFF', desc: 'A red-and-gold war staff. When a dash ends it shoots out far ahead and knocks a whole line of enemies away.', dmg: 1.2, speed: 1350, ch: 2, crit: .12, cm: 2.2, heat: 22, reach: 10, cost: 2600, v: 21 },
  { id: 'monowire', name: 'MONO-WIRE', desc: 'A monofilament wire from a street-samurai implant. It stays strung along your dash and cuts anything that crosses it.', dmg: .8, speed: 1500, ch: 3, crit: .15, cm: 2, heat: 18, reach: 0, cost: 2900, v: 21 },
  { id: 'drill', name: 'SPIRAL DRILL', desc: 'A mecha drill arm. It pierces like the spear, and every enemy it drills through in one dash makes it hit harder.', dmg: 1.1, speed: 1550, ch: 2, crit: .12, cm: 2.2, heat: 26, reach: 8, cost: 3300, v: 21 },
  { id: 'bow', name: 'SPIRIT BOW', desc: 'A bow of light. When a dash ends, a piercing arrow flies at the nearest enemy.', dmg: .9, speed: 1420, ch: 3, crit: .2, cm: 2.2, heat: 18, reach: 2, cost: 2700, v: 21 },
  { id: 'claws', name: 'BEAST CLAWS', desc: 'Four dash charges and very fast claws. Every hit makes the enemy bleed.', dmg: .7, speed: 1520, ch: 4, crit: .25, cm: 1.9, heat: 24, reach: -2, cost: 2500, v: 21 },
  { id: 'glaive', name: 'SINGULARITY GLAIVE', desc: 'Where a dash ends it leaves a small black hole that pulls enemies in, then collapses.', dmg: 1, speed: 1380, ch: 2, crit: .14, cm: 2.2, heat: 24, reach: 10, cost: 3600, v: 21 },
  { id: 'phoenix', name: 'PHOENIX BLADE', desc: 'A blade of living fire. Every dash leaves burning ground behind it.', dmg: 1.05, speed: 1450, ch: 3, crit: .15, cm: 2.1, heat: 28, reach: 6, cost: 3100, v: 21 },
  { id: 'beamsaber', name: 'PHOTON SABER', desc: 'A beam sword. Every dash also throws a crescent sword beam ahead of you.', dmg: .9, speed: 1450, ch: 3, crit: .16, cm: 2, heat: 22, reach: 6, cost: 3000, v: 21 },
  { id: 'cryo', name: 'CRYO KATANA', desc: 'A katana colder than space. Every hit freezes the enemy for a moment.', dmg: 1, speed: 1450, ch: 2, crit: .15, cm: 2.1, heat: 16, reach: 6, cost: 2800, v: 21 },
  { id: 'muramasa', name: 'MURAMASA.EXE', desc: 'Cursed blade. Every kill feeds Overdrive. Story reward.', dmg: 2, speed: 1560, ch: 3, crit: .35, cm: 2.5, heat: 30, reach: 8, cost: -1 }
];


const UPGRADES = [
  { k: 'dmg', name: 'BLADE CORE', desc: '+15% slash damage per level', base: 120, max: 10 },
  { k: 'shield', name: 'AEGIS PLATING', desc: '+1 max shield per level', base: 180, max: 4 },
  { k: 'cool', name: 'NEURAL OVERCLOCK', desc: 'Faster dash recharge and skill cooldowns', base: 140, max: 8 },
  { k: 'parry', name: 'PARRY MATRIX', desc: 'Wider perfect-parry window', base: 130, max: 6 },
  { k: 'magnet', name: 'CREDIT MAGNET', desc: 'Collect credits from further away', base: 90, max: 6 },
  { k: 'drone', name: 'LASER DRONE', desc: 'An orbiting drone zaps nearby enemies', base: 200, max: 5 },
  { k: 'heat', name: 'HEAT SINK', desc: 'Your blade cools faster', base: 110, max: 5 }
];
function upgCost(u, lv) { return Math.floor(u.base * Math.pow(1.5, lv)); }

const SKILLS = [
  { id: 'grapple', name: 'GRAPPLE', key: 'Q', cd: 6, desc: 'Zip to the nearest enemy and slam it. Breaks shields.' },
  { id: 'hijack', name: 'HIJACK', key: 'W', cd: 9, desc: 'Turn the two nearest enemies into allies for 8 seconds.' },
  { id: 'web', name: 'LASER WEB', key: 'E', cd: 10, desc: 'Three tripwire lasers across the roof for 6 seconds.' },
  { id: 'echo', name: 'TIME ECHO', key: 'R', cd: 14, desc: 'A clone of you fights for 7 seconds. Repairs 1 shield.' }
];

/* skill evolutions: use a skill enough times, then evolve it in the Arsenal (it can be switched back any time) */
const SKILL_EVO = {
  grapple: { n: 'CHAIN GRAPPLE', d: 'After the slam, the hook jumps on to 2 more enemies.', need: 25, cost: 1500, cd: 1.2 },
  hijack: { n: 'MIND STORM', d: 'Hijacks 4 enemies instead of 2, and their final blasts are bigger.', need: 25, cost: 1500, cd: 1.2 },
  web: { n: 'LASER CAGE', d: 'Five wires box you in. Enemies caught in the wires slow down.', need: 25, cost: 1500, cd: 1.25 },
  echo: { n: 'TWIN ECHO', d: 'Two time echoes fight for you instead of one.', need: 25, cost: 1500, cd: 1.25 }
};
/* difficulty contracts (arcade): each adds heat, and every point of heat adds +10% score */
const CONTRACTS = [
  { id: 'fast', n: 'OVERCLOCKED', d: 'Enemies move 20% faster', heat: 1 },
  { id: 'elites', n: 'ELITE GUARD', d: '15% more elite enemies', heat: 1 },
  { id: 'hot', n: 'HOT BLADE', d: 'Blade heat builds 50% faster', heat: 1 },
  { id: 'tough', n: 'ARMORED', d: 'Enemies have 40% more health, bosses 25%', heat: 2 },
  { id: 'bullets', n: 'BULLET HELL', d: 'Enemies fire more often and their shots fly faster', heat: 2 },
  { id: 'noparry', n: 'NO PERFECT PARRY', d: 'Only normal parries: the perfect window is gone', heat: 2 },
  { id: 'clock', n: 'SLOW RECHARGE', d: 'Dash charges refill 30% slower', heat: 2 },
  { id: 'glass', n: 'GLASS BODY', d: 'You have only 1 shield', heat: 3 },
  { id: 'noskill', n: 'BLADE ONLY', d: 'No grapple, hijack, laser web or time echo', heat: 3 }
];
const CTR_MODES = { tower: 1, endless: 1, bossrush: 1, arena: 1, timeattack: 1, mayhem: 1 };
/* branching route between Maglev Run cars */
const ROUTE_MODES = { endless: 1, mayhem: 1 };
const ROUTES = {
  std: { n: 'STANDARD CAR', d: 'A normal car.', c: '#00f2fe', tag: '' },
  elite: { n: 'ELITE CAR', d: 'A mini-boss and more elites. Double car bonus.', c: '#ffd700', tag: 'ELITE' },
  shop: { n: 'BLACK MARKET', d: 'Spend the credits from this run on boosts, then a normal car.', c: '#00ff88', tag: '' },
  repair: { n: 'REPAIR CAR', d: 'All shields restored, and a shorter car.', c: '#7dffb0', tag: 'REPAIR' },
  mystery: { n: 'MYSTERY CAR', d: 'Treasure, darkness or an ambush. Nobody knows which.', c: '#ff2bd6', tag: 'MYSTERY' }
};
const RSHOP = [
  { id: 'shield', n: 'SHIELD REPAIR', d: '+1 shield', cost: 120 },
  { id: 'od', n: 'OVERDRIVE CELL', d: '+50 Overdrive', cost: 150 },
  { id: 'edge', n: 'WHETSTONE', d: '+15% damage for this run', cost: 250 },
  { id: 'charge', n: 'EXTRA CHARGE', d: '+1 dash charge for this run', cost: 300 }
];
/* enemy type indices (hot loop uses numbers, not strings) */
const ET = { DRONE: 0, SNIPER: 1, BRUTE: 2, BOMBER: 3, WEAVER: 4, PHANTOM: 5, SPLITTER: 6, WARDEN: 7, MINI: 8, COURIER: 9, TREASURE: 10, CLONE: 11, DUMMY: 12,
  MEDIC: 13, MIMIC: 14, MINER: 15, MIRROR: 16, ENFORCER: 17, SPIDER: 18, WRAITH: 19 };
const EDEF = [
  { id: 'drone', name: 'DRONE', r: 15, hp: 1, spd: 140, col: '#ff3b5c', v: 100, coins: 2 },
  { id: 'sniper', name: 'SNIPER', r: 16, hp: 1, spd: 100, col: '#ff9a00', v: 180, coins: 3 },
  { id: 'brute', name: 'BRUTE', r: 24, hp: 3, spd: 78, col: '#00ff88', v: 350, coins: 4 },
  { id: 'bomber', name: 'BOMBER', r: 15, hp: 1, spd: 205, col: '#ff5500', v: 200, coins: 2 },
  { id: 'weaver', name: 'WEAVER', r: 16, hp: 2, spd: 130, col: '#c45bff', v: 260, coins: 3 },
  { id: 'phantom', name: 'PHANTOM', r: 15, hp: 2, spd: 160, col: '#7df9ff', v: 300, coins: 3 },
  { id: 'splitter', name: 'SPLITTER', r: 20, hp: 2, spd: 105, col: '#ffd23f', v: 240, coins: 2 },
  { id: 'warden', name: 'WARDEN', r: 17, hp: 2, spd: 85, col: '#4d7cff', v: 320, coins: 4 },
  { id: 'mini', name: 'MINI', r: 10, hp: 1, spd: 215, col: '#ffe58a', v: 60, coins: 1 },
  { id: 'courier', name: 'COURIER', r: 20, hp: 40, spd: 215, col: '#ffd700', v: 2500, coins: 30 },
  { id: 'treasure', name: 'TREASURE DRONE', r: 13, hp: 2, spd: 290, col: '#ffd700', v: 800, coins: 25 },
  { id: 'clone', name: 'SHADOW', r: 18, hp: 1, spd: 0, col: '#9b5cff', v: 150, coins: 1 },
  { id: 'dummy', name: 'DUMMY', r: 17, hp: 1, spd: 0, col: '#d9b46a', v: 0, coins: 0 },
  { id: 'medic', name: 'MEDIC', r: 14, hp: 2, spd: 125, col: '#5dffb4', v: 300, coins: 3 },
  { id: 'mimic', name: 'MIMIC', r: 17, hp: 2, spd: 95, col: '#ff6ad5', v: 320, coins: 3 },
  { id: 'miner', name: 'MINER', r: 18, hp: 2, spd: 100, col: '#ffb000', v: 300, coins: 3 },
  { id: 'mirror', name: 'MIRROR', r: 20, hp: 3, spd: 80, col: '#c9e6ff', v: 380, coins: 4 },
  { id: 'enforcer', name: 'ENFORCER', r: 32, hp: 24, spd: 72, col: '#3dff8a', v: 4000, coins: 22, mb: 1 },
  { id: 'spider', name: 'SPIDER TANK', r: 30, hp: 20, spd: 62, col: '#ff8a3d', v: 4000, coins: 22, mb: 1 },
  { id: 'wraith', name: 'VOID WRAITH', r: 22, hp: 16, spd: 120, col: '#b98cff', v: 4000, coins: 22, mb: 1 }
];
const MINI_BOSSES = [ET.ENFORCER, ET.SPIDER, ET.WRAITH];
/* colorblind-safe palette (Okabe-Ito based), same order as EDEF */
const EDEF_CB = ['#e69f00', '#f0e442', '#56b4e9', '#d55e00', '#cc79a7', '#ffffff', '#009e73', '#0072b2', '#ffe58a', '#ffd700', '#ffd700', '#cc79a7', '#d9b46a',
  '#7fffd4', '#ff6ad5', '#f0e442', '#ffffff', '#56b4e9', '#e69f00', '#cc79a7'];
const ENAME2T = {}; EDEF.forEach((d, i) => { ENAME2T[d.id] = i; });

const RARITY = [
  { n: 'COMMON', c: '#8fd3ff', w: 60 }, { n: 'RARE', c: '#00ff88', w: 28 },
  { n: 'EPIC', c: '#c45bff', w: 10 }, { n: 'LEGENDARY', c: '#ffd700', w: 3 }
];
const PERKS = [
  { id: 'edge', r: 0, name: 'EDGE+', desc: '+20% damage', max: 5 },
  { id: 'patch', r: 0, name: 'NANITE PATCH', desc: 'Repair 2 shields', max: 99 },
  { id: 'coolant', r: 0, name: 'COOLANT', desc: '-25% blade heat gain', max: 3 },
  { id: 'cap', r: 0, name: 'CAPACITOR', desc: '+40 Overdrive now, +25% Overdrive gain', max: 3 },
  { id: 'coil', r: 0, name: 'MAGNET COIL', desc: '+60 pickup radius, +20% credits', max: 3 },
  { id: 'reflex', r: 0, name: 'REFLEX', desc: '+0.05s perfect-parry window', max: 3 },
  { id: 'charge', r: 1, name: 'EXTRA CHARGE', desc: '+1 dash charge', max: 3 },
  { id: 'ricochet', r: 1, name: 'RICOCHET', desc: 'Wall bounces release a shockwave', max: 1 },
  { id: 'critchip', r: 1, name: 'CRIT CHIP', desc: '+12% crit chance', max: 3 },
  { id: 'long', r: 1, name: 'LONG BLADE', desc: '+40% slash reach', max: 2 },
  { id: 'graze', r: 1, name: 'GRAZE MASTER', desc: 'Near misses refund a dash and charge double Overdrive', max: 1 },
  { id: 'chain', r: 2, name: 'CHAIN LIGHTNING', desc: 'Crits arc to 2 nearby enemies', max: 1 },
  { id: 'vamp', r: 2, name: 'VAMPIRIC EDGE', desc: 'Every 12 kills repairs 1 shield', max: 1 },
  { id: 'boom', r: 2, name: 'DETONATOR', desc: 'Kills explode and hurt nearby enemies', max: 1 },
  { id: 'nova', r: 2, name: 'PARRY NOVA', desc: 'Perfect parries fire 8 homing shards', max: 1 },
  { id: 'wind', r: 3, name: 'SECOND WIND', desc: 'Once per run: revive with 2 shields and full Overdrive', max: 1 },
  { id: 'chrono', r: 3, name: 'CHRONO CORE', desc: 'Deeper aim slow-mo and -30% skill cooldowns', max: 1 }
];

const ACHS = [
  { id: 'first', name: 'FIRST BLOOD', d: 'Destroy your first enemy', r: 50 },
  { id: 'combo15', name: 'BLADE MASTER', d: 'Reach a x15 combo', r: 150 },
  { id: 'combo40', name: 'UNSTOPPABLE', d: 'Reach a x40 combo', r: 400 },
  { id: 'sss', name: 'SSS STYLE', d: 'Hit SSS style rank', r: 300 },
  { id: 'parry10', name: 'MIRROR EDGE', d: '10 perfect parries in one run', r: 200 },
  { id: 'warden', name: 'WARDEN DOWN', d: 'Defeat Warden MK-II', r: 150 },
  { id: 'hydra', name: 'HEADHUNTER', d: 'Defeat the Hydra Carrier', r: 200 },
  { id: 'kage', name: 'BROTHERHOOD', d: 'Defeat Kage', r: 250 },
  { id: 'shogun', name: 'SYSTEM OVERRIDE', d: 'Defeat Shogun.EXE', r: 500 },
  { id: 'turret', name: 'TURRET HACKER', d: 'Hack a roof turret', r: 80 },
  { id: 'hijack', name: 'MIND HACKER', d: 'Hijack an enemy', r: 80 },
  { id: 'train', name: 'RAIL JUSTICE', d: 'Crush an enemy with a train', r: 80 },
  { id: 'nightmare', name: 'OVERDRIVE LEGEND', d: 'Beat the story on Overdrive difficulty', r: 1000 },
  { id: 'stars36', name: 'PERFECTIONIST', d: 'Earn all 36 story stars', r: 1000 },
  { id: 'raijin', name: 'STORM BREAKER', d: 'Defeat Raijin in the bonus chapter', r: 500 },
  { id: 'ngplus', name: 'TWICE THE LEGEND', d: 'Clear New Game+', r: 1000 },
  { id: 'crew', name: 'CREW UP', d: 'Join or start a crew', r: 100 },
  { id: 'nullren', name: 'NULL AND VOID', d: 'Defeat REN.NULL in chapter 6', r: 800 },
  { id: 'leviathan', name: 'SERPENT SLAYER', d: 'Defeat LEVIATHAN', r: 600 },
  { id: 'benkei', name: 'BELL RINGER', d: 'Defeat BENKEI.SYS', r: 700 },
  { id: 'prime', name: 'ZERO HOUR', d: 'Defeat KUROGANE PRIME', r: 1500 },
  { id: 'valkyrie', name: 'SKY BREAKER', d: 'Defeat VALKYRIE.SYS', r: 1200 },
  { id: 'oryu', name: 'ABYSS WALKER', d: 'Defeat ORYU.EXE', r: 1800 },
  { id: 'tenkai', name: 'ORBIT BREAKER', d: 'Defeat TENKAI.SYS', r: 2000 },
  { id: 'izanami', name: 'THE FIRST BLADE', d: 'Defeat IZANAMI', r: 2500 },
  { id: 'hyakki', name: 'NIGHT WALKER', d: 'Defeat HYAKKI', r: 2800 },
  { id: 'exa1', name: 'EX I', d: 'Beat the EX boss of act I', r: 1500 }, { id: 'exa2', name: 'EX II', d: 'Beat the EX boss of act II', r: 1500 }, { id: 'exa3', name: 'EX III', d: 'Beat the EX boss of act III', r: 1500 },
  { id: 'exa4', name: 'EX IV', d: 'Beat the EX boss of act IV', r: 1500 }, { id: 'exa5', name: 'EX V', d: 'Beat the EX boss of act V', r: 1500 }, { id: 'exa6', name: 'EX VI', d: 'Beat the EX boss of act VI', r: 1500 },
  { id: 'exa7', name: 'EX VII', d: 'Beat the EX boss of act VII', r: 1500 },
  { id: 'ex3', name: 'EX HUNTER', d: 'Beat three EX bosses', r: 2500 }, { id: 'exall', name: 'EX MACHINA', d: 'Beat every EX boss', r: 6000 },
  { id: 'dop7', name: 'DAILY OPERATOR', d: 'Finish the DAILY OP 7 days in a row', r: 2000 }, { id: 'dop30', name: 'THIRTY OPS', d: 'Finish 30 DAILY OPS', r: 4000 },
  { id: 'chimera', name: 'HEAD HUNTER', d: 'Defeat CHIMERA.OS', r: 1400 },
  { id: 'genesis', name: 'THE ENDING', d: 'Defeat DEUS EX KUROGANE', r: 2500 },
  { id: 'road1', name: 'ROAD RAGE', d: 'Slice your first car on the highway', r: 300 },
  { id: 'revenge', name: 'REVENGE', d: 'Slay your nemesis', r: 400 },
  { id: 'revenge3', name: 'OLD SCORES', d: 'Slay a nemesis of level 3 or higher', r: 800 },
  { id: 'tower5', name: 'FIRST ASCENT', d: 'Clear floor 5 of the Neon Tower', r: 300 },
  { id: 'tower10', name: 'HIGH CLIMBER', d: 'Clear floor 10 of the Neon Tower', r: 600 },
  { id: 'tower20', name: 'SKYBREAKER', d: 'Clear floor 20 of the Neon Tower', r: 1500 },
  { id: 'road50', name: 'CAR CRUSHER', d: 'Slice 50 cars in one Highway Chase', r: 1200 },
  { id: 'road3k', name: 'LONG HAUL', d: 'Ride 3000 m in one Highway Chase', r: 1500 },
  { id: 'arena5', name: 'MUTANT HUNTER', d: 'Beat 5 bosses in one Boss Arena run', r: 800 },
  { id: 'arena10', name: 'APEX PREDATOR', d: 'Beat 10 bosses in one Boss Arena run', r: 2000 },
  { id: 'dojo', name: 'DOJO GRADUATE', d: 'Finish every Dojo drill', r: 150 },
  { id: 'weekly', name: 'WEEKLY WARRIOR', d: 'Finish a Weekly Challenge run', r: 100 },
  { id: 'podium', name: 'ON THE PODIUM', d: 'Finish top 3 in a Weekly Challenge', r: 300 }
];

const RANKS = [
  { r: 'D', n: 0, c: '#8fa4c8' }, { r: 'C', n: 3, c: '#00ff88' }, { r: 'B', n: 6, c: '#00f2fe' },
  { r: 'A', n: 10, c: '#c45bff' }, { r: 'S', n: 15, c: '#ff2bd6' }, { r: 'SS', n: 22, c: '#ff0844' }, { r: 'SSS', n: 32, c: '#ffd700' }
];

const THEMES = {
  maglev: { name: 'TITAN EXPRESS', bg: '#05060f', sky1: '#0b1030', sky2: '#22093a', roof: '#0b0f22', roof2: '#0e1430', seam: 'rgba(0,242,254,.13)', rail: '#00f2fe', b1: '#ff0844', b2: '#b537f2', win: '#ffd36e', rain: 1, speed: 520 },
  undercity: { name: 'NEON UNDERCITY', bg: '#0a0410', sky1: '#2a0828', sky2: '#062028', roof: '#120a1c', roof2: '#1a0e26', seam: 'rgba(255,43,214,.14)', rail: '#ff2bd6', b1: '#00ffd0', b2: '#ff2bd6', win: '#7dfff0', rain: .6, speed: 300 },
  ghost: { name: 'GHOST LINE', bg: '#020806', sky1: '#03140c', sky2: '#010402', roof: '#06100c', roof2: '#081510', seam: 'rgba(0,255,136,.12)', rail: '#00ff88', b1: '#00ff88', b2: '#008f5a', win: '#00ff88', rain: 0, speed: 700, tunnel: 1 },
  spire: { name: 'ORBITAL SPIRE', bg: '#07041a', sky1: '#1d0b4a', sky2: '#ff6a3d', roof: '#100c26', roof2: '#151033', seam: 'rgba(255,215,0,.12)', rail: '#ffd700', b1: '#ffd700', b2: '#ff6a3d', win: '#ffe9a6', rain: 0, speed: 900, stars: 1 },
  core: { name: 'SHOGUN CORE', bg: '#0d0204', sky1: '#2a0006', sky2: '#050001', roof: '#12060a', roof2: '#1a080e', seam: 'rgba(255,8,68,.18)', rail: '#ff0844', b1: '#ff0844', b2: '#ff9a00', win: '#ff0844', rain: 0, speed: 0, grid: 1 },
  storm: { name: 'ORBITAL RING', bg: '#04060c', sky1: '#141c2e', sky2: '#2b3550', roof: '#0c1220', roof2: '#101a2c', seam: 'rgba(159,216,255,.14)', rail: '#9fd8ff', b1: '#9fd8ff', b2: '#b537f2', win: '#dff4ff', rain: 1, speed: 640, storm: 1 },
  void: { name: 'NULL SPACE', bg: '#050505', sky1: '#101012', sky2: '#1a0006', roof: '#0b0b0e', roof2: '#121216', seam: 'rgba(242,242,242,.10)', rail: '#f2f2f2', b1: '#ff0844', b2: '#f2f2f2', win: '#ff0844', rain: 0, speed: 380, grid: 1, glitchy: 1 },
  harbor: { name: 'NEON HARBOR', bg: '#03090c', sky1: '#06202a', sky2: '#0a0f24', roof: '#081418', roof2: '#0c1c22', seam: 'rgba(47,230,200,.13)', rail: '#2fe6c8', b1: '#ffd23f', b2: '#2fe6c8', win: '#ffd23f', rain: .8, speed: 260 },
  temple: { name: 'IRON MONASTERY', bg: '#0b0706', sky1: '#3a1a2a', sky2: '#ff8a4a', roof: '#1a1210', roof2: '#221814', seam: 'rgba(255,154,61,.12)', rail: '#ff9a3d', b1: '#ff3b1f', b2: '#ffd23f', win: '#ffd9a0', rain: 0, speed: 0 },
  summit: { name: 'BLACK TOWER', bg: '#05040a', sky1: '#120a24', sky2: '#2a0a12', roof: '#0b0a12', roof2: '#100e1a', seam: 'rgba(255,215,0,.12)', rail: '#ffd700', b1: '#ffd700', b2: '#ff0844', win: '#ffe9a6', rain: 1, speed: 700, storm: 1 },
  highway: { name: 'NEON HIGHWAY', bg: '#06060c', sky1: '#0a0618', sky2: '#2a0a2a', roof: '#0c0d14', roof2: '#12141e', seam: 'rgba(255,255,255,.04)', rail: '#ffd23f', b1: '#ff2bd6', b2: '#00f2fe', win: '#ffe9a6', rain: 1, speed: 900 },
  orbital: { name: 'ORBITAL ELEVATOR', bg: '#020205', sky1: '#000000', sky2: '#1a0b2e', roof: '#111522', roof2: '#1a2035', seam: 'rgba(0,242,254,.2)', rail: '#00f2fe', b1: '#ffffff', b2: '#00f2fe', win: '#ffffff', rain: 0, speed: 1200 },
  datavoid: { name: 'THE DATA VOID', bg: '#04020a', sky1: '#0a0414', sky2: '#1a0628', roof: '#0c0814', roof2: '#120c1e', seam: 'rgba(196,91,255,.18)', rail: '#c45bff', b1: '#c45bff', b2: '#ff2bd6', win: '#e0ccff', rain: 0, speed: 300 },
  apex: { name: 'PROJECT GENESIS', bg: '#0a0804', sky1: '#1a1408', sky2: '#3a2a08', roof: '#141008', roof2: '#1c160a', seam: 'rgba(255,215,0,.16)', rail: '#ffd700', b1: '#fff3c4', b2: '#ffd700', win: '#fff3c4', rain: 0, speed: 900 },
  sakura: { name: 'SHRINE OF ECHOES', bg: '#0b0610', sky1: '#2a0a2a', sky2: '#ff6aa8', roof: '#160c16', roof2: '#1e1020', seam: 'rgba(255,154,213,.14)', rail: '#ff9ad5', b1: '#ff4f8a', b2: '#ffd23f', win: '#ffd9ec', rain: .35, speed: 160 },
  abyss: { name: 'THE ABYSS LINE', bg: '#01070a', sky1: '#021418', sky2: '#04303a', roof: '#061214', roof2: '#08191c', seam: 'rgba(46,230,200,.14)', rail: '#2ee6c8', b1: '#2ee6c8', b2: '#7a5cff', win: '#bff8ee', rain: 0, speed: 220 },
  skyroad: { name: 'SKY ELEVATOR', bg: '#03040c', sky1: '#060a20', sky2: '#2a3a6a', roof: '#0a0e1c', roof2: '#0e1426', seam: 'rgba(159,184,255,.14)', rail: '#9fb8ff', b1: '#7df9ff', b2: '#ffd23f', win: '#e8eeff', rain: .2, speed: 260 },
  starring: { name: 'ORBITAL RING', bg: '#020208', sky1: '#000004', sky2: '#0a1a3a', roof: '#0c0e18', roof2: '#121624', seam: 'rgba(255,243,196,.14)', rail: '#fff3c4', b1: '#ffd700', b2: '#7df9ff', win: '#fff8e0', rain: 0, speed: 180 },
  ruins: { name: 'OVERGROWN RUINS', bg: '#040a06', sky1: '#06140a', sky2: '#1a3a18', roof: '#0e140c', roof2: '#141c10', seam: 'rgba(125,255,154,.12)', rail: '#7dff9a', b1: '#2ecf8a', b2: '#ffd23f', win: '#e0ffd8', rain: .15, speed: 150 },
  origin: { name: 'THE FIRST CODE', bg: '#0c0c10', sky1: '#e8e6e0', sky2: '#9a968e', roof: '#16161c', roof2: '#1c1c22', seam: 'rgba(255,215,0,.16)', rail: '#ffd700', b1: '#f4f4f4', b2: '#c0102e', win: '#ffffff', rain: 0, speed: 200 },
  winter: { name: 'FROSTBYTE WINTER', bg: '#05080e', sky1: '#0a1424', sky2: '#2a4a6a', roof: '#0e141e', roof2: '#141c28', seam: 'rgba(191,244,255,.16)', rail: '#bff4ff', b1: '#9fe8ff', b2: '#e02030', win: '#ffffff', rain: 0, speed: 170 },
  parade: { name: 'NIGHT PARADE', bg: '#0a0504', sky1: '#1a0806', sky2: '#4a1a08', roof: '#140a06', roof2: '#1c0e08', seam: 'rgba(255,122,26,.16)', rail: '#ff7a1a', b1: '#ff9a1a', b2: '#c0102e', win: '#ffe0b0', rain: .25, speed: 150 },
  hollow: { name: 'THE HOLLOW MOON', bg: '#06040c', sky1: '#0e0618', sky2: '#2a0a2a', roof: '#0e0a16', roof2: '#140e1e', seam: 'rgba(255,42,42,.14)', rail: '#ff4a6a', b1: '#ff2a2a', b2: '#b48cff', win: '#ffd0d8', rain: 0, speed: 190 },
  dojo: { name: 'TRAINING DOJO', bg: '#0a0806', sky1: '#1a120a', sky2: '#0a0604', roof: '#1c140c', roof2: '#22180e', seam: 'rgba(255,200,120,.10)', rail: '#ffb347', b1: '#ffb347', b2: '#c0102e', win: '#ffd9a0', rain: 0, speed: 0, dojo: 1 }
};

const MODES = [
  { id: 'endless', name: 'MAGLEV RUN', desc: 'Endless train cars. Pick a perk after every car. Boss every third car.' },
  { id: 'bossrush', name: 'BOSS RUSH', desc: 'All five bosses back to back. Perk after each one.' },
  { id: 'arena', name: 'ENDLESS BOSS ARENA', desc: 'Fight endless mutated bosses with escalating modifiers.' },
  { id: 'tower', name: 'NEON TOWER', desc: 'A rogue-lite climb: one life, a curse on every floor, a boss every fifth, relics after bosses. Fallen climbs become soul shards for permanent upgrades.' },
  { id: 'highway', name: 'HIGHWAY CHASE', desc: 'Ride a neon bike through traffic. Dash through cars to slice them, dodge trucks, outrun Kurogane.' },
  { id: 'timeattack', name: 'TIME ATTACK', desc: '90 seconds. Score as much as you can.' },
  { id: 'mayhem', name: 'HYPER MAYHEM', desc: 'Faster game, double spawns, half cooldowns, double score.' },
  { id: 'daily', name: 'DAILY RUN', desc: 'One seed for everyone today, with a fixed blade and modifiers.' },
  { id: 'weekly', name: 'WEEKLY CHALLENGE', desc: 'A new seed and a special rule every week, with its own leaderboard. Top 3 win prizes.' },
  { id: 'dojo', name: 'TRAINING DOJO', desc: 'Practice every move on training dummies. You cannot lose here.' },
  { id: 'race', name: 'LIVE RACE', desc: '90 seconds on the same roof as your friends. Highest score wins.', mp: 1 },
  { id: 'raid', name: 'BOSS RAID', desc: 'One boss, fought together. Every hit anyone lands counts.', mp: 1 }
];
const WEEKLY_RULES = [
  { id: 'glass', name: 'GLASS SAMURAI', desc: '1 shield, double damage, double score', score: 2 },
  { id: 'hyper', name: 'HYPERSPEED', desc: 'Everything moves 30% faster', score: 1.6 },
  { id: 'elite', name: 'ELITE SQUAD', desc: 'Most enemies are elite', score: 1.8 },
  { id: 'dark', name: 'LIGHTS OUT', desc: 'Permanent blackout', score: 2 },
  { id: 'bombs', name: 'BOMB SQUAD', desc: 'Only bombers and splitters', score: 1.5 },
  { id: 'snipers', name: 'SNIPER ALLEY', desc: 'Snipers and weavers only, perfect parries score triple', score: 1.5 },
  { id: 'blitz', name: 'BOSS BLITZ', desc: 'A boss every second car', score: 1.7 },
  { id: 'vampire', name: 'BLOOD MOON', desc: 'Start with 1 shield, every 8 kills repairs one', score: 1.8 }
];
function weekKey() { return Math.floor((Date.now() / 86400000 - 4) / 7); } // weeks since Monday 5 Jan 1970
function weekRule(k) { return WEEKLY_RULES[((k == null ? weekKey() : k) % WEEKLY_RULES.length + WEEKLY_RULES.length) % WEEKLY_RULES.length]; }
const DAILY_MODS = [
  { id: 'glass', name: 'GLASS CANNON', desc: '1 shield, x2 damage' },
  { id: 'turbo', name: 'TURBO', desc: 'Everything moves 20% faster' },
  { id: 'dark', name: 'LIGHTS OUT', desc: 'Permanent blackout' },
  { id: 'swarm', name: 'SWARM', desc: '+50% enemies' },
  { id: 'rich', name: 'JACKPOT', desc: 'x2 credits' },
  { id: 'elite', name: 'ELITE GUARD', desc: 'Many more elite enemies' },
  { id: 'superhot', name: 'CHRONO LOCK', desc: 'SUPERHOT: TIME MOVES WHEN YOU MOVE' },
  { id: 'ice', name: 'ZERO FRICTION', desc: 'ZERO FRICTION: ICE ROOF' }
];
function dailyModPool(dk) { return dk >= 20261026 ? DAILY_MODS : DAILY_MODS.slice(0, 6); } // older dates keep the six original modifiers, so their replays stay exact

/* ---- perk synergies: owning both parents puts the evolved perk in the next draft ---- */
const SYNERGIES = [
  { id: 'pinball', name: 'PINBALL WIZARD', need: ['ricochet', 'long'], desc: 'Wall bounces refund a dash charge and their shockwave is 50% bigger' },
  { id: 'storm', name: 'STORM EDGE', need: ['chain', 'critchip'], desc: 'Chain lightning fires on every hit and jumps to 4 enemies' },
  { id: 'mirror', name: 'MIRROR WARD', need: ['nova', 'reflex'], desc: 'Perfect parries give 1 second of invulnerability and +10 Overdrive' },
  { id: 'bloom', name: 'BLOOD BLOOM', need: ['vamp', 'boom'], desc: 'Vampiric Edge repairs a shield every 6 kills instead of 12' },
  { id: 'reactor', name: 'COLD REACTOR', need: ['coolant', 'cap'], desc: 'Overheating triggers a free 2-second Overdrive instead of locking' }
];
/* ---- weapon mastery: slash kills with a blade level it up ---- */
const MASTERY_XP = [0, 60, 200, 500, 1200];
const MASTERY_PERKS = ['', '+5% damage', 'Signature move unlocked', '+8% crit chance', '+1 dash charge'];
const SIGS = {
  katana: { n: 'IAI COUNTER', d: 'Perfect parries release a slashing wave in front of you' },
  daggers: { n: 'FLURRY', d: 'Every 6th hit throws 3 homing daggers' },
  hammer: { n: 'QUAKE', d: 'Kills right after a wall bounce set off a shockwave' },
  scythe: { n: 'REAP', d: 'Kills pull in every credit on the roof; every 20 kills repairs a shield' },
  muramasa: { n: 'CURSE', d: 'Slash kills release 2 cursed homing shards' },
  kunai: { n: 'SHADOW RAIN', d: 'Every 4th dash throws 6 kunai instead of 3' },
  whip: { n: 'SNAP', d: 'Critical cracks stun enemies for a second' },
  spear: { n: 'LANCE', d: 'Every enemy you pierce makes the dash longer' },
  fists: { n: 'ONE-TWO', d: 'Every 3rd punch in a row hits three times as hard' },
  monarch: { n: 'ARISE', d: 'Store up to 6 shadows, and perfect parries release them too' },
  dominator: { n: 'POINT BLANK', d: 'Pellets hit 50% harder and the recoil throws you back to safety' },
  nodachi: { n: 'TEMPEST', d: 'The circle cut strikes twice' },
  chakram: { n: 'ORBIT', d: 'The ring flies a second loop before it comes home' },
  tessen: { n: 'GALE', d: 'Perfect parries blow nearby enemies away and stun them' },
  cleaver: { n: 'RAGE', d: 'Every 5th hit sets off a quake around the target' },
  thunder: { n: 'STORMCALLER', d: 'Lightning jumps to 4 enemies and stuns them' },
  zerocut: { n: 'AFTERIMAGE', d: 'The path is cut a second time' },
  staff: { n: 'HEAVEN PILLAR', d: 'The staff strike stuns everything it knocks away' },
  monowire: { n: "CAT'S CRADLE", d: 'The wire stays twice as long and cuts deeper' },
  drill: { n: 'GIGA SPIRAL', d: 'Every dash ends in a spiral burst around you' },
  bow: { n: 'HUNDRED ARROWS', d: 'Fires three arrows instead of one' },
  claws: { n: 'FERAL', d: 'A bleeding enemy that dies spreads the bleed to its friends' },
  glaive: { n: 'EVENT HORIZON', d: 'A much bigger black hole that collapses harder' },
  phoenix: { n: 'FIREBIRD', d: 'Kills in the fire launch homing fire' },
  beamsaber: { n: 'OVERCHARGE', d: 'The sword beam is twice as wide' },
  cryo: { n: 'SHATTER', d: 'Frozen enemies burst into ice shards when they die' }
};
const DAILY_WEAPONS = dk => WEAPONS.filter(w => w.cost >= 0 && (!w.v || (dk || todayKey()) >= (w.v >= 21 ? 20261116 : w.v >= 20 ? 20261102 : 20261026))); // the daily/weekly blade can be any shop blade
function masteryLevel(id) { const xp = (Store.data.mastery && Store.data.mastery[id]) | 0; let l = 0; for (let i = 1; i < MASTERY_XP.length; i++) if (xp >= MASTERY_XP[i]) l = i; return l; }
/* ---- designed waves: set pieces announced on the roof ---- */
const WAVES = [
  { id: 'pincer', name: 'PINCER ATTACK', need: ['drone'] },
  { id: 'swarm', name: 'DRONE SWARM', need: ['drone'] },
  { id: 'nest', name: 'SNIPER NEST', need: ['sniper'] },
  { id: 'rush', name: 'BOMBER RUSH', need: ['bomber'] },
  { id: 'escort', name: 'ARMORED ESCORT', need: ['brute'] },
  { id: 'ambush', name: 'PHANTOM AMBUSH', need: ['phantom'] },
  { id: 'cross', name: 'CROSSFIRE', need: ['weaver'] },
  { id: 'split', name: 'SPLIT STORM', need: ['splitter'] },
  { id: 'guard', name: 'WARDEN GUARD', need: ['warden'] },
  { id: 'field', name: 'MINEFIELD', need: ['miner'] },
  { id: 'triage', name: 'FIELD HOSPITAL', need: ['medic', 'brute'] },
  { id: 'mirrors', name: 'HALL OF MIRRORS', need: ['mirror'] }
];
const AFF_TXT = ['', 'SWIFT', 'VOLATILE', 'SPLIT', 'AEGIS', 'THORNS']; // elite traits (THORNS: version 37)
