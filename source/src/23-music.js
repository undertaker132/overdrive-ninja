/* =====================================================================
   MUSIC — layered procedural soundtrack. Each track has drums, bass,
   chords, arpeggios and melodies in sections (A, B, breakdown, fills).
   Layers follow the fight: calm -> groove -> full as style rank,
   bosses and Overdrive raise Aud.intensity. Every area and boss has its
   own track. Lookahead scheduling, separate voice ledgers per family.
   ===================================================================== */
const SCALES = {
  aeo: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], phr: [0, 1, 3, 5, 7, 8, 10], maj: [0, 2, 4, 5, 7, 9, 11],
  pdom: [0, 1, 4, 5, 7, 8, 10], hira: [0, 2, 3, 7, 8], insen: [0, 1, 5, 7, 10], yo: [0, 2, 5, 7, 9]
};
function sdeg(sc, d) { const n = sc.length, o = Math.floor(d / n); return sc[d - o * n] + 12 * o; }
function dpat(s) { const a = new Float32Array(16); for (let i = 0; i < 16; i++) { const ch = s[i] || '.'; a[i] = ch === 'X' ? 1.3 : ch === 'x' || ch === 'o' ? 1 : ch === 'g' ? .4 : 0; } return a; }
const VOX = {
  saw: { o: [['sawtooth', 0, 1, 1]], f0: 2000, f1: 800, q: 2, a: .005, s: .6, r: .08 },
  bass: { o: [['sawtooth', 0, .8, 1], ['square', 0, .3, .5]], f0: 1400, f1: 520, q: 3, a: .004, s: .65, r: .07 },
  sub: { o: [['triangle', 0, 1, 1], ['sine', 0, .6, .5]], f0: 1600, f1: 1200, q: .5, a: .006, s: .9, r: .1 },
  reese: { o: [['sawtooth', -16, .55, 1], ['sawtooth', 16, .55, 1]], f0: 900, f1: 480, q: 3, a: .01, s: .85, r: .1 },
  acid: { o: [['sawtooth', 0, 1, 1]], f0: 2800, f1: 280, q: 13, a: .003, s: .5, r: .05 },
  pad: { o: [['sawtooth', -9, .5, 1], ['sawtooth', 9, .5, 1]], f0: 1500, f1: 1200, q: .8, a: .4, s: .9, r: .7 },
  darkpad: { o: [['sawtooth', -11, .45, 1], ['triangle', 6, .6, 2]], f0: 700, f1: 560, q: 1, a: .7, s: .9, r: 1 },
  choir: { o: [['sine', -6, .5, 1], ['triangle', 6, .35, 2], ['sine', 0, .2, 3]], f0: 1000, f1: 850, q: 1.6, ft: 'bandpass', a: .55, s: .95, r: .9, g: 2.2 },
  organ: { o: [['sine', 0, .6, 1], ['sine', 0, .3, 2], ['sine', 0, .14, 3]], f0: 5000, f1: 5000, q: .5, a: .03, s: .9, r: .15 },
  rhodes: { o: [['triangle', 0, .7, 1], ['sine', 0, .3, 2]], f0: 2600, f1: 900, q: .8, a: .004, s: .32, r: .55 },
  pluck: { o: [['triangle', 0, .7, 1], ['square', 0, .25, 1]], f0: 3400, f1: 500, q: 2, a: .002, s: .12, r: .25, pb: 1.012 },
  koto: { o: [['triangle', 0, .75, 1], ['sawtooth', 0, .22, 1]], f0: 3800, f1: 700, q: 3, a: .002, s: .1, r: .55, pb: 1.03 },
  bell: { o: [['sine', 0, .7, 1], ['sine', 0, .28, 2.76]], f0: 7000, f1: 7000, q: .5, a: .002, s: .22, r: 1.2 },
  lead: { o: [['square', -7, .45, 1], ['sawtooth', 7, .4, 1]], f0: 3200, f1: 1900, q: 1.5, a: .01, s: .7, r: .12 },
  brass: { o: [['sawtooth', -6, .55, 1], ['sawtooth', 6, .55, 1]], f0: 650, f1: 2800, q: 1.3, a: .05, s: .8, r: .14 },
  flute: { o: [['sine', 0, .85, 1], ['triangle', 0, .12, 2]], f0: 3200, f1: 3200, q: .5, a: .08, s: .85, r: .2, breath: 1 },
  arp: { o: [['square', 0, .8, 1]], f0: 3800, f1: 1400, q: 1.5, a: .002, s: .3, r: .05 },
  cowbell: { o: [['square', 0, .5, 1], ['square', 0, .42, 1.48]], f0: 2400, f1: 1500, q: 3, ft: 'bandpass', a: .002, s: .12, r: .2, g: 1.7 }, // phonk cowbell
  b808: { o: [['sine', 0, 1, 1], ['triangle', 0, .18, 2]], f0: 1200, f1: 700, q: .5, a: .004, s: .9, r: .3, pb: 1.7 }, // 808 bass with a punchy pitch drop
  pulse: { o: [['square', 0, .55, 1]], f0: 7000, f1: 7000, q: .3, a: .002, s: .65, r: .02 }, // chip lead
  tri: { o: [['triangle', 0, 1, 1]], f0: 9000, f1: 9000, q: .3, a: .002, s: .9, r: .02 }, // chip bass
  gtr: { o: [['sawtooth', -9, .45, 1], ['sawtooth', 9, .45, 1], ['sawtooth', 0, .4, 1.4983]], f0: 2600, f1: 1400, q: 1.1, a: .003, s: .75, r: .07, dist: 1 }, // distorted power chord
  gld: { o: [['sawtooth', 0, .6, 1], ['square', 5, .3, 1]], f0: 3200, f1: 2400, q: 1.4, a: .006, s: .85, r: .12, dist: 1 } // distorted lead guitar
};
/* drum keys: k kick, s snare, c clap, h hat, o open hat, t taiko, m tom, r shime, p metal, sh shaker */
function mkTrack(T) {
  for (const sec in T.dr) { const D = T.dr[sec]; for (const k in D) D[k] = dpat(D[k]); }
  for (const key of ['lead', 'lead2']) { const L = T[key]; if (!L) continue; L.at = []; for (let i = 0; i < 64; i++) L.at.push(null); for (const n of L.n) { const i = n[0] & 63; (L.at[i] || (L.at[i] = [])).push(n); } }
  return T;
}
const TRACKS = {
  menu: mkTrack({ name: 'NEO-EDO NIGHTS', style: 'Lo-fi', bpm: 82, root: 98, sc: 'dor', prog: [0, 3, 6, 4], swing: .16, form: ['A', 'A', 'B', 'B'], fixedI: 2, fx: { vinyl: 1 },
    dr: { A: { k: 'x.....x...x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x.....x.x.x.....', s: '....x.......x..g', h: 'x.xgx.x.x.xgx.x.' }, F: { k: 'x.....x...x...x.', s: '....x.......x.xx', h: 'x.x.x.x.' } },
    bass: { pat: [0, null, null, null, null, null, 7, null, 0, null, null, null, null, null, 5, null], type: 'sub', v: .1, len: 3 },
    pad: { type: 'rhodes', oct: 1, v: .03, sev: 1, hits: [0, 6, 10] },
    lead: { type: 'bell', oct: 2, v: .03, sec: 'B', n: [[0, 4, 4], [6, 6, 2], [8, 7, 6], [16, 6, 4], [22, 4, 2], [24, 2, 8], [32, 4, 4], [38, 6, 2], [40, 9, 6], [48, 7, 4], [52, 6, 4], [56, 4, 8]] } }),
  maglev: mkTrack({ name: 'NEON EXPRESS', style: 'Synthwave', bpm: 116, root: 55, sc: 'aeo', prog: [0, 5, 2, 6], form: ['A', 'A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.' }, B: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.' }, D: { h: 'x.x.x.x.x.x.x.x.' }, F: { k: 'x...x...x...x.x.', s: '....x...x.x.xxxx', h: 'x.x.x.x.' } },
    bass: { pat: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, null, 12, 7], type: 'bass', v: .1 },
    pad: { type: 'pad', oct: 2, v: .022 },
    arp: { pat: [0, 1, 2, 3, 2, 1], rate: 1, oct: 3, type: 'arp', v: .02, sec: 'BD' },
    lead: { type: 'lead', oct: 3, v: .04, sec: 'B', n: [[0, 4, 6], [6, 5, 2], [8, 4, 4], [12, 2, 4], [16, 0, 8], [24, 2, 4], [28, 4, 4], [32, 5, 6], [38, 4, 2], [40, 2, 4], [44, 4, 4], [48, 6, 8], [56, 4, 4], [60, 2, 4]] } }),
  undercity: mkTrack({ name: 'BLACK MARKET', style: 'Dark techno', bpm: 126, root: 49, sc: 'phr', prog: [0, 0, 1, 0], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', o: '..o...o...o...o.', c: '....x.......x...', p: '...x.....x....x.' }, B: { k: 'x...x...x...x...', o: '..o...o...o...o.', c: '....x.......x...', h: 'xgxgxgxgxgxgxgxg', p: '...x.....x....x.' }, D: { o: '..o...o...o...o.', p: '...x.....x....x.' }, F: { k: 'x...x...x...xxxx', c: '....x...x...x.x.' } },
    bass: { pat: [0, 0, 12, 0, null, 0, 13, 0, 0, null, 12, 0, 1, 0, 12, null], type: 'acid', v: .075, len: .9 },
    pad: { type: 'darkpad', oct: 2, v: .02 },
    lead: { type: 'pluck', oct: 3, v: .035, sec: 'B', n: [[0, 0, 2], [3, 1, 1], [6, 0, 2], [10, 3, 2], [14, 1, 2], [16, 0, 2], [19, 1, 1], [22, 0, 2], [26, 4, 2], [30, 3, 2], [32, 0, 2], [35, 1, 1], [38, 0, 2], [42, 3, 2], [46, 1, 2], [48, 7, 4], [52, 6, 4], [56, 4, 8]] } }),
  ghost: mkTrack({ name: 'GHOST LINE', style: 'Taiko horror', bpm: 84, root: 82.4, sc: 'hira', prog: [0, 0, 3, 1], form: ['A', 'B', 'D', 'B'], fx: { whisper: 1 }, taiko: 1,
    dr: { A: { t: 'X.......x..x....', r: '....x.......x...' }, B: { t: 'X..x....X..x..x.', r: '..x...x...x...x.', sh: 'x.x.x.x.x.x.x.x.' }, D: { t: 'X...............' }, F: { t: 'X.X.X.X.x.x.xxxx', r: 'xxxxxxxx' } },
    bass: { pat: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null], type: 'sub', v: .1, len: 6 },
    pad: { type: 'darkpad', oct: 1, v: .03 },
    lead: { type: 'koto', oct: 2, v: .04, sec: 'B', n: [[0, 4, 2], [2, 3, 2], [4, 2, 4], [12, 0, 4], [16, 4, 2], [18, 5, 2], [20, 4, 6], [32, 7, 2], [34, 5, 2], [36, 4, 4], [44, 2, 4], [48, 3, 2], [50, 2, 2], [52, 0, 8]] },
    lead2: { type: 'bell', oct: 3, v: .022, sec: 'AD', n: [[0, 7, 8], [24, 5, 8], [40, 4, 8]] } }),
  spire: mkTrack({ name: 'SPIRE RUSH', style: 'Drum & bass', bpm: 172, root: 61.7, sc: 'aeo', prog: [0, 5, 3, 4], chordLen: 2, form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x.........x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x.........x..x..', s: '....x..g....x..g', h: 'xxx.xxx.xxx.xxx.', sh: 'x.x.x.x.x.x.x.x.' }, D: { h: 'x...x...x...x...' }, F: { k: 'x.....x...x.....', s: '....x..x.xx.xxxx' } },
    bass: { pat: [0, null, null, null, null, null, null, null, null, null, 0, null, null, null, null, null], type: 'reese', v: .085, len: 9 },
    pad: { type: 'pad', oct: 2, v: .018 },
    arp: { pat: [0, 2, 1, 3, 2, 4, 1, 2], rate: 1, oct: 3, type: 'arp', v: .017, sec: 'BD' },
    lead: { type: 'lead', oct: 3, v: .038, sec: 'B', n: [[0, 7, 2], [2, 6, 2], [4, 4, 4], [8, 2, 2], [10, 4, 2], [12, 6, 4], [16, 7, 2], [18, 9, 2], [20, 7, 4], [24, 6, 4], [28, 4, 4], [32, 7, 2], [34, 6, 2], [36, 4, 4], [40, 2, 2], [42, 4, 2], [44, 6, 4], [48, 4, 8], [56, 2, 8]] } }),
  core: mkTrack({ name: 'SHOGUN CORE', style: 'Industrial', bpm: 138, root: 73.4, sc: 'pdom', prog: [0, 1, 0, 6], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x..x..x.x..x..x.', c: '....X.......X...', p: 'x.......x.......' }, B: { k: 'x..x..x.x..x..x.', c: '....X.......X...', h: 'x.xxx.xxx.xxx.xx', m: '.......x......x.', p: 'x.......x.......' }, D: { p: 'x...x...x...x...', t: 'X.......X.......' }, F: { k: 'x..x..x.x.xxxxxx', c: '....X...X.X.XXXX' } },
    bass: { pat: [0, 0, null, 0, null, 0, 1, null, 0, 0, null, 0, null, 12, 1, null], type: 'bass', v: .085 },
    pad: { type: 'choir', oct: 2, v: .03, sec: 'BD' },
    lead: { type: 'brass', oct: 2, v: .04, sec: 'B', n: [[0, 0, 4], [4, 1, 4], [8, 4, 8], [16, 5, 4], [20, 4, 4], [24, 1, 8], [32, 0, 4], [36, 1, 4], [40, 4, 4], [44, 7, 4], [48, 6, 8], [56, 4, 8]] } }),
  storm: mkTrack({ name: 'STORM FRONT', style: 'Storm synth', bpm: 128, root: 87.3, sc: 'dor', prog: [0, 6, 5, 3], form: ['A', 'B', 'A', 'B', 'D'], fx: { thunder: 1 },
    dr: { A: { k: 'x...x...x...x...', h: '..x...x...x...x.', s: '....x.......x...', t: 'X...............' }, B: { k: 'x...x...x...x...', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.', s: '....x.......x...', t: 'X.......X.....x.' }, D: { t: 'X.......X.......', h: 'x...x...x...x...' }, F: { k: 'x...x...x...x.x.', s: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, null, 12, 10], type: 'bass', v: .09 },
    pad: { type: 'pad', oct: 1, v: .02 },
    arp: { pat: [0, 1, 2, 1], rate: 2, oct: 2, type: 'pluck', v: .026, sec: 'AB' },
    lead: { type: 'lead', oct: 2, v: .038, sec: 'B', n: [[0, 4, 4], [4, 3, 2], [6, 4, 2], [8, 6, 8], [16, 7, 4], [20, 6, 4], [24, 4, 8], [32, 4, 4], [36, 3, 2], [38, 4, 2], [40, 6, 6], [46, 7, 2], [48, 9, 8], [56, 7, 8]] } }),
  warden: mkTrack({ name: 'STEEL WARDEN', style: 'Boss march', bpm: 132, root: 55, sc: 'aeo', prog: [0, 6, 5, 4], form: ['A', 'B', 'A', 'B'],
    dr: { A: { k: 'x...x...x...x...', s: 'x.x.x.xxx.x.x.xx' }, B: { k: 'x...x...x...x...', s: 'x.x.xxx.x.x.xxxx', t: 'X...........X...', h: '..x...x...x...x.' }, F: { k: 'x...x...x...x...', s: 'xxxxxxxxxxxxxxxx' } },
    bass: { pat: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 3, null, 5, null], type: 'bass', v: .1 },
    pad: { type: 'pad', oct: 2, v: .02 },
    lead: { type: 'brass', oct: 3, v: .042, sec: 'B', n: [[0, 0, 4], [4, 2, 2], [6, 4, 2], [8, 7, 8], [16, 6, 4], [20, 5, 4], [24, 4, 8], [32, 0, 4], [36, 2, 2], [38, 4, 2], [40, 7, 6], [46, 9, 2], [48, 7, 8], [56, 6, 8]] } }),
  hydra: mkTrack({ name: 'HYDRA', style: 'Boss techno', bpm: 150, root: 49, sc: 'phr', prog: [0, 1, 0, 5], form: ['A', 'B', 'A', 'B'],
    dr: { A: { k: 'xx..x..xx..x..x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', m: '..x...x...x...xx' }, B: { k: 'xx..x..xx..x..x.', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '......o.......o.', m: '..x...x...x...xx' }, F: { k: 'x...x...x...x...', m: 'xxxxxxxxxxxxxxxx' } },
    bass: { pat: [0, null, 0, 1, null, 0, 12, null, 0, null, 0, 1, null, 13, 12, null], type: 'acid', v: .08 },
    pad: { type: 'darkpad', oct: 2, v: .02 },
    lead: { type: 'lead', oct: 3, v: .038, sec: 'B', n: [[0, 7, 2], [2, 8, 2], [4, 7, 2], [6, 5, 2], [8, 4, 4], [12, 1, 4], [16, 0, 8], [24, 1, 4], [28, 4, 4], [32, 7, 2], [34, 8, 2], [36, 10, 4], [40, 8, 4], [44, 7, 4], [48, 5, 8], [56, 4, 8]] } }),
  kage: mkTrack({ name: 'BROTHERHOOD', style: 'Taiko duel', bpm: 140, root: 92.5, sc: 'insen', prog: [0, 0, 3, 2], form: ['A', 'B', 'A', 'B', 'D'], taiko: 1,
    dr: { A: { t: 'X..x..x.X..x..x.', r: 'x.x.x.x.x.x.x.x.', k: 'x.......x.......' }, B: { t: 'X.xX.xx.X.xX.xxx', r: 'xgxgxgxgxgxgxgxg', k: 'x...x...x...x...' }, D: { t: 'X.......X.......' }, F: { t: 'XxXxXxXxXXXXXXXX' } },
    bass: { pat: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, null, 3, null], type: 'bass', v: .075 },
    pad: { type: 'darkpad', oct: 1, v: .022 },
    lead: { type: 'koto', oct: 2, v: .042, sec: 'AB', n: [[0, 5, 2], [2, 4, 2], [4, 3, 2], [6, 2, 2], [8, 1, 4], [12, 0, 4], [16, 5, 2], [18, 6, 2], [20, 7, 4], [24, 6, 2], [26, 5, 2], [28, 4, 4], [32, 5, 2], [34, 4, 2], [36, 3, 2], [38, 4, 2], [40, 5, 8], [48, 3, 4], [52, 2, 4], [56, 0, 8]] },
    lead2: { type: 'flute', oct: 3, v: .03, sec: 'BD', n: [[0, 5, 16], [16, 7, 16], [32, 6, 16], [48, 5, 16]] } }),
  shogun: mkTrack({ name: 'SYSTEM OVERRIDE', style: 'Final boss', bpm: 156, root: 73.4, sc: 'pdom', prog: [0, 6, 5, 1], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', t: 'X.......X.......' }, B: { k: 'x.x.x...x.x.x.x.', c: '....x.......x...', t: 'X..x..x.X..x..x.', h: 'xxxxxxxxxxxxxxxx', p: '...x.......x....' }, D: { t: 'X...X...X...X...' }, F: { t: 'XXXXXXXXXXXXXXXX', k: 'x...x...x...x...' } },
    bass: { pat: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 1, null, 0, null], type: 'reese', v: .085, len: 1.6 },
    pad: { type: 'choir', oct: 2, v: .032 },
    arp: { pat: [0, 1, 2, 3, 4, 3, 2, 1], rate: 1, oct: 3, type: 'arp', v: .016, sec: 'B' },
    lead: { type: 'brass', oct: 3, v: .042, sec: 'B', n: [[0, 0, 6], [6, 1, 2], [8, 4, 8], [16, 5, 6], [22, 4, 2], [24, 1, 8], [32, 0, 6], [38, 1, 2], [40, 4, 4], [44, 5, 4], [48, 7, 16]] } }),
  raijin: mkTrack({ name: 'THUNDER GOD', style: 'Storm taiko', bpm: 164, root: 82.4, sc: 'insen', prog: [0, 3, 2, 0], form: ['A', 'B', 'A', 'B', 'D'], fx: { thunder: 1 }, taiko: 1,
    dr: { A: { t: 'X.xX.x.xX.xX.x.x', k: 'x...x...x...x...', r: 'x.x.x.x.x.x.x.x.' }, B: { t: 'XxXxX.xXXxXxX.xX', k: 'x.x.x.x.x.x.x.x.', c: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' }, D: { t: 'X...X...X...XXXX' }, F: { t: 'XXXXXXXXXXXXXXXX' } },
    bass: { pat: [0, 0, null, 0, 0, null, 0, null, 0, 0, null, 0, 3, null, 5, null], type: 'bass', v: .08 },
    pad: { type: 'choir', oct: 2, v: .03 },
    lead: { type: 'koto', oct: 2, v: .04, sec: 'AB', n: [[0, 7, 1], [1, 8, 1], [2, 9, 2], [4, 8, 2], [6, 7, 2], [8, 5, 4], [12, 4, 4], [16, 7, 1], [17, 8, 1], [18, 9, 2], [20, 10, 4], [24, 9, 4], [28, 7, 4], [32, 5, 2], [34, 7, 2], [36, 8, 4], [40, 7, 4], [44, 5, 4], [48, 4, 8], [56, 5, 8]] } }),
  void: mkTrack({ name: 'NULL SPACE', style: 'Glitch ambient', bpm: 96, root: 69.3, sc: 'phr', prog: [0, 1, 0, 5], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x.......x..x....', h: '..x...x...x...x.', p: '.......x........' }, B: { k: 'x..x....x..x....', s: '....x.......x...', h: 'x.xxx.x.x.xxx.x.', p: '.......x......x.' }, D: { p: 'x...............' }, F: { k: 'x..x..x.xxxxxxxx', s: '....x...x.xxxxxx' } },
    bass: { pat: [0, null, null, 0, null, null, 1, null, 0, null, null, 0, null, 5, null, null], type: 'reese', v: .075, len: 1.4 },
    pad: { type: 'darkpad', oct: 2, v: .03 },
    arp: { pat: [0, 2, 4, 7, 4, 2], rate: 1, oct: 3, type: 'bell', v: .014, sec: 'B' },
    lead: { type: 'pluck', oct: 3, v: .03, sec: 'B', n: [[0, 0, 4], [4, 1, 4], [8, 4, 8], [16, 3, 4], [20, 1, 4], [24, 0, 8], [32, 4, 4], [36, 5, 4], [40, 7, 8], [48, 5, 8], [56, 4, 8]] } }),
  renull: mkTrack({ name: 'MIRROR MATCH', style: 'Glitch breakbeat', bpm: 168, root: 69.3, sc: 'phr', prog: [0, 1, 5, 4], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x.....x...x.....', s: '....x.......x..x', h: 'xxxxxxxxxxxxxxxx' }, B: { k: 'x.x...x..xx.....', s: '....x..x....x.x.', h: 'x.xxx.xxx.xxx.xx', p: '.......x.......x' }, D: { p: 'x...x...x...x...', k: 'x...............' }, F: { k: 'xxxxxxxxxxxxxxxx', s: '....x.x.xxxxxxxx' } },
    bass: { pat: [0, null, 0, 12, null, 0, null, 1, 0, null, 0, 12, null, 5, null, 4], type: 'acid', v: .07 },
    pad: { type: 'choir', oct: 2, v: .028, sec: 'BD' },
    arp: { pat: [0, 3, 7, 10, 7, 3], rate: 1, oct: 3, type: 'arp', v: .016, sec: 'B' },
    lead: { type: 'lead', oct: 3, v: .038, sec: 'B', n: [[0, 0, 2], [2, 1, 2], [4, 0, 2], [6, 4, 2], [8, 5, 8], [16, 4, 2], [18, 5, 2], [20, 7, 4], [24, 5, 8], [32, 0, 2], [34, 1, 2], [36, 0, 2], [38, 4, 2], [40, 5, 4], [44, 4, 4], [48, 1, 16]] } }),
  harbor: mkTrack({ name: 'NEON TIDE', style: 'Dub techno', bpm: 118, root: 58.3, sc: 'dor', prog: [0, 0, 5, 3], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', h: '..x...x...x...x.', sh: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x...x...x...x...', c: '....x.......x...', h: '..x...x...x..xx.', o: '......x.......x.' }, D: { sh: 'x.x.x.x.x.x.x.x.' }, F: { k: 'x...x...x.x.xxxx', c: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 5, null, null], type: 'sub', v: .085 },
    pad: { type: 'pad', oct: 2, v: .026 },
    arp: { pat: [0, 2, 4, 2], rate: 2, oct: 3, type: 'rhodes', v: .02, sec: 'AB' },
    lead: { type: 'bell', oct: 3, v: .03, sec: 'B', n: [[0, 4, 4], [6, 2, 2], [8, 0, 8], [16, 4, 4], [22, 5, 2], [24, 4, 8], [32, 2, 4], [38, 0, 2], [40, -1, 8], [48, 0, 16]] } }),
  temple: mkTrack({ name: 'IRON MONASTERY', style: 'Shakuhachi and taiko', bpm: 96, root: 87.3, sc: 'yo', prog: [0, 3, 2, 0], form: ['A', 'B', 'A', 'B', 'D'], taiko: 1,
    dr: { A: { t: 'X.......x.......', r: '....x.......x...' }, B: { t: 'X..x....X..x.x..', r: 'x.x.x.x.x.x.x.x.', k: 'x.......x.......' }, D: { t: 'X...............' }, F: { t: 'X.x.X.x.XxXxXXXX' } },
    bass: { pat: [0, null, null, null, 0, null, null, null, 3, null, null, null, 2, null, null, null], type: 'sub', v: .07 },
    pad: { type: 'organ', oct: 2, v: .016 },
    lead: { type: 'flute', oct: 3, v: .04, sec: 'AB', n: [[0, 2, 6], [6, 3, 2], [8, 4, 8], [16, 3, 4], [20, 2, 4], [24, 0, 8], [32, 4, 6], [38, 5, 2], [40, 4, 4], [44, 3, 4], [48, 2, 16]] },
    lead2: { type: 'koto', oct: 2, v: .03, sec: 'B', n: [[0, 0, 2], [4, 2, 2], [8, 4, 2], [12, 2, 2], [16, 0, 2], [20, 3, 2], [24, 2, 4], [32, 0, 2], [36, 2, 2], [40, 4, 2], [44, 5, 2], [48, 4, 8]] } }),
  summit: mkTrack({ name: 'ZERO HOUR', style: 'Dark synthwave', bpm: 124, root: 61.7, sc: 'aeo', prog: [0, 5, 3, 6], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x...x...x...x...', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '..x...x...x...x.' }, D: { k: 'x...............' }, F: { k: 'x...x...x.x.xxxx', s: '....x...x.xxxxxx' } },
    bass: { pat: [0, 0, 12, 0, 0, 12, 0, 12, 0, 0, 12, 0, 0, 12, 0, 12], type: 'bass', v: .06 },
    pad: { type: 'pad', oct: 2, v: .028 },
    arp: { pat: [0, 2, 4, 7, 4, 2], rate: 2, oct: 3, type: 'arp', v: .016, sec: 'B' },
    lead: { type: 'lead', oct: 3, v: .036, sec: 'B', n: [[0, 0, 4], [4, 2, 4], [8, 4, 8], [16, 5, 4], [20, 4, 4], [24, 2, 8], [32, 0, 4], [36, 2, 4], [40, 4, 4], [44, 7, 4], [48, 6, 16]] } }),
  orbital: mkTrack({ name: 'ESCAPE VELOCITY', style: 'Trance', bpm: 138, root: 65.4, sc: 'aeo', prog: [0, 5, 2, 6], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', h: '..x...x...x...x.', o: '..x...x...x...x.' }, B: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '..x...x...x...x.' }, D: { h: '..x...x...x...x.' }, F: { k: 'x...x...xxxxxxxx', s: '........x.x.xxxx' } },
    bass: { pat: [null, 0, 0, 0, null, 0, 0, 0, null, 0, 0, 0, null, 0, 0, 0], type: 'bass', v: .06 },
    pad: { type: 'pad', oct: 2, v: .028 },
    arp: { pat: [0, 4, 7, 11, 7, 4], rate: 2, oct: 3, type: 'pluck', v: .02, sec: 'AB' },
    lead: { type: 'lead', oct: 3, v: .036, sec: 'B', n: [[0, 4, 4], [4, 5, 4], [8, 7, 8], [16, 6, 4], [20, 4, 4], [24, 2, 8], [32, 4, 4], [36, 5, 4], [40, 7, 4], [44, 9, 4], [48, 7, 16]] } }),
  datavoid: mkTrack({ name: 'NULL SECTOR', style: 'Glitch ambient', bpm: 100, root: 51.9, sc: 'phr', prog: [0, 1, 0, 5], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x.........x.....', h: '...x.......x....', p: '.......x.......x' }, B: { k: 'x.....x...x.....', s: '....x.......x...', h: 'x.xx..x.x.xx..x.', p: '.......x.......x' }, D: { p: 'x.......x.......' }, F: { k: 'x.x.x.x.xxxxxxxx', s: '....x...x.xxxxxx' } },
    bass: { pat: [0, null, null, null, null, null, 1, null, 0, null, null, null, 5, null, null, null], type: 'reese', v: .07, len: 1.6 },
    pad: { type: 'darkpad', oct: 2, v: .032 },
    arp: { pat: [0, 1, 7, 3], rate: 1, oct: 3, type: 'bell', v: .016, sec: 'B' },
    lead: { type: 'pulse', oct: 3, v: .026, sec: 'B', n: [[0, 0, 6], [6, 1, 2], [8, 3, 8], [16, 1, 6], [22, 0, 2], [24, -1, 8], [32, 0, 4], [36, 3, 4], [40, 4, 8], [48, 1, 16]] } }),
  apex: mkTrack({ name: 'GENESIS PROTOCOL', style: 'Cinematic synth', bpm: 112, root: 73.4, sc: 'dor', prog: [0, 3, 5, 4], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x.......x.......', s: '........x.......', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.xxx.xxx.xxx.xx', c: 'x...............' }, D: { k: 'x...............' }, F: { k: 'x...x...x.x.xxxx', s: '....x.x.xxxxxxxx' } },
    bass: { pat: [0, null, null, 0, null, null, 0, null, 3, null, null, 3, null, null, 5, null], type: 'sub', v: .08 },
    pad: { type: 'choir', oct: 2, v: .032 },
    arp: { pat: [0, 2, 4, 7], rate: 2, oct: 3, type: 'rhodes', v: .018, sec: 'AB' },
    lead: { type: 'brass', oct: 3, v: .036, sec: 'B', n: [[0, 0, 8], [8, 2, 4], [12, 4, 4], [16, 5, 8], [24, 4, 8], [32, 2, 8], [40, 4, 4], [44, 2, 4], [48, 0, 16]] } }),
  valkyrie: mkTrack({ name: 'WING OF KUROGANE', style: 'Boss trance', bpm: 150, root: 69.3, sc: 'aeo', prog: [0, 6, 5, 4], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' }, B: { k: 'x...x...x...x...', s: '....x..x....x.x.', h: 'xxxxxxxxxxxxxxxx', o: '..x...x...x...x.' }, D: { k: 'x...x...x...x...' }, F: { k: 'xxxxxxxxxxxxxxxx', s: '....x.x.xxxxxxxx' } },
    bass: { pat: [0, 0, 12, 0, 0, 12, 0, 12, 0, 0, 12, 0, 0, 12, 0, 12], type: 'acid', v: .065 },
    pad: { type: 'pad', oct: 2, v: .03 },
    arp: { pat: [0, 3, 7, 12, 7, 3], rate: 2, oct: 3, type: 'arp', v: .018, sec: 'B' },
    lead: { type: 'lead', oct: 3, v: .04, sec: 'B', n: [[0, 0, 2], [2, 2, 2], [4, 4, 4], [8, 7, 8], [16, 6, 4], [20, 4, 4], [24, 2, 8], [32, 0, 2], [34, 2, 2], [36, 4, 4], [40, 9, 8], [48, 7, 16]] } }),
  chimera: mkTrack({ name: 'THREE HEADS', style: 'Boss industrial', bpm: 132, root: 49, sc: 'pdom', prog: [0, 1, 0, 4], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x..x..x...x..x..', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.', m: '.......x.......x' }, B: { k: 'x..x..x.x.xx..x.', s: '....X..x....X.x.', h: 'xxxxxxxxxxxxxxxx', m: '...x...x...x...x' }, D: { m: 'x.x.x.x.x.x.x.x.' }, F: { k: 'xxxxxxxxxxxxxxxx', s: 'X.X.X.X.XXXXXXXX' } },
    bass: { pat: [0, null, 0, 1, null, 0, null, 1, 0, null, 0, 6, null, 5, null, 4], type: 'reese', v: .085, len: 1.2 },
    pad: { type: 'darkpad', oct: 2, v: .03 },
    lead: { type: 'brass', oct: 2, v: .04, sec: 'B', n: [[0, 0, 4], [4, 1, 4], [8, 4, 8], [16, 5, 4], [20, 4, 4], [24, 1, 8], [32, 0, 4], [36, 1, 4], [40, 6, 4], [44, 5, 4], [48, 4, 16]] } }),
  genesis: mkTrack({ name: 'DEUS EX MACHINA', style: 'Boss choir', bpm: 160, root: 73.4, sc: 'hira', prog: [0, 3, 2, 4], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', c: 'x...............' }, B: { k: 'x.x.x...x.x.x...', s: '....x..x....x..x', h: 'xxxxxxxxxxxxxxxx', o: '..x...x...x...x.' }, D: { c: 'x.......x.......' }, F: { k: 'xxxxxxxxxxxxxxxx', s: 'xxxxxxxxxxxxxxxx' } },
    bass: { pat: [0, 0, 12, 0, 3, 3, 15, 3, 2, 2, 14, 2, 4, 4, 16, 4], type: 'bass', v: .065 },
    pad: { type: 'choir', oct: 2, v: .036 },
    arp: { pat: [0, 2, 3, 4, 3, 2], rate: 2, oct: 3, type: 'bell', v: .018, sec: 'AB' },
    lead: { type: 'lead', oct: 3, v: .04, sec: 'B', n: [[0, 0, 4], [4, 4, 4], [8, 3, 4], [12, 2, 4], [16, 4, 8], [24, 3, 8], [32, 0, 4], [36, 4, 4], [40, 5, 4], [44, 4, 4], [48, 2, 16]] } }),
  leviathan: mkTrack({ name: 'DEEP CURRENT', style: 'Boss dub', bpm: 140, root: 55, sc: 'phr', prog: [0, 1, 0, 6], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x..x..x.x..x..x.', c: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x..x..x.x..x..x.', c: '....X.......X...', h: 'xxxxxxxxxxxxxxxx', m: '.......x......x.' }, D: { m: 'x...x...x...x...' }, F: { k: 'x..x..x.x.xxxxxx', c: '....X...X.X.XXXX' } },
    bass: { pat: [0, null, 0, null, 1, null, 0, null, 0, null, 0, null, 6, null, 5, null], type: 'reese', v: .085, len: 1.4 },
    pad: { type: 'darkpad', oct: 2, v: .03 },
    lead: { type: 'brass', oct: 2, v: .04, sec: 'B', n: [[0, 0, 4], [4, 1, 4], [8, 0, 8], [16, 6, 4], [20, 5, 4], [24, 4, 8], [32, 0, 4], [36, 1, 4], [40, 3, 4], [44, 4, 4], [48, 1, 16]] } }),
  benkei: mkTrack({ name: 'TEMPLE BELL', style: 'Boss taiko', bpm: 150, root: 82.4, sc: 'insen', prog: [0, 3, 2, 0], form: ['A', 'B', 'A', 'B', 'D'], taiko: 1,
    dr: { A: { t: 'X..x..x.X..x..x.', k: 'x.......x.......', r: 'x.x.x.x.x.x.x.x.' }, B: { t: 'XxX.XxX.XxX.XxXx', k: 'x...x...x...x...', c: '....x.......x...' }, D: { t: 'X.......X.......' }, F: { t: 'XXXXXXXXXXXXXXXX' } },
    bass: { pat: [0, null, 0, null, 0, null, 3, null, 0, null, 0, null, 2, null, 4, null], type: 'bass', v: .075 },
    pad: { type: 'choir', oct: 2, v: .03 },
    lead: { type: 'bell', oct: 3, v: .04, sec: 'AB', n: [[0, 0, 4], [4, 2, 4], [8, 3, 8], [16, 4, 4], [20, 3, 4], [24, 2, 8], [32, 0, 4], [36, 4, 4], [40, 5, 8], [48, 4, 16]] } }),
  prime: mkTrack({ name: 'KUROGANE PRIME', style: 'Final boss', bpm: 160, root: 69.3, sc: 'pdom', prog: [0, 1, 5, 6], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', t: 'X.......X.......' }, B: { k: 'x.x.x...x.x.x.x.', c: '....x.......x...', t: 'X..x..x.X..x..x.', h: 'xxxxxxxxxxxxxxxx', p: '...x.......x....' }, D: { t: 'X...X...X...X...' }, F: { t: 'XXXXXXXXXXXXXXXX', k: 'x...x...x...x...' } },
    bass: { pat: [0, null, 0, null, 0, null, 1, null, 0, null, 0, null, 5, null, 6, null], type: 'reese', v: .085, len: 1.6 },
    pad: { type: 'choir', oct: 2, v: .034 },
    arp: { pat: [0, 1, 2, 3, 4, 3, 2, 1], rate: 1, oct: 3, type: 'arp', v: .016, sec: 'B' },
    lead: { type: 'brass', oct: 3, v: .044, sec: 'B', n: [[0, 0, 8], [8, 1, 4], [12, 4, 4], [16, 5, 8], [24, 4, 8], [32, 0, 6], [38, 1, 2], [40, 4, 4], [44, 5, 4], [48, 7, 16]] } }),
  sakura: mkTrack({ name: 'PETAL STORM', style: 'Koto trap', bpm: 104, root: 92.5, sc: 'yo', prog: [0, 3, 2, 0], form: ['A', 'B', 'A', 'B', 'D'], taiko: 1,
    dr: { A: { t: 'X.......x.......', r: '....x.......x...' }, B: { t: 'X..x....X..x.x..', r: 'x.x.x.x.x.x.x.x.', k: 'x.......x.......' }, D: { t: 'X...............' }, F: { t: 'X.x.X.x.XxXxXXXX' } },
    bass: { pat: [0, null, null, null, 0, null, null, null, 3, null, null, null, 2, null, null, null], type: 'sub', v: .07 },
    pad: { type: 'organ', oct: 2, v: .016 },
    lead: { type: 'flute', oct: 3, v: .04, sec: 'AB', n: [[0, 2, 6], [6, 3, 2], [8, 4, 8], [16, 3, 4], [20, 2, 4], [24, 0, 8], [32, 4, 6], [38, 5, 2], [40, 4, 4], [44, 3, 4], [48, 2, 16]] },
    lead2: { type: 'koto', oct: 2, v: .03, sec: 'B', n: [[0, 0, 2], [4, 2, 2], [8, 4, 2], [12, 2, 2], [16, 0, 2], [20, 3, 2], [24, 2, 4], [32, 0, 2], [36, 2, 2], [40, 4, 2], [44, 5, 2], [48, 4, 8]] } }),  abyss: mkTrack({ name: 'PRESSURE', style: 'Deep dub', bpm: 110, root: 51.9, sc: 'dor', prog: [0, 0, 5, 3], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', h: '..x...x...x...x.', sh: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x...x...x...x...', c: '....x.......x...', h: '..x...x...x..xx.', o: '......x.......x.' }, D: { sh: 'x.x.x.x.x.x.x.x.' }, F: { k: 'x...x...x.x.xxxx', c: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 5, null, null], type: 'sub', v: .085 },
    pad: { type: 'pad', oct: 2, v: .026 },
    arp: { pat: [0, 2, 4, 2], rate: 2, oct: 3, type: 'rhodes', v: .02, sec: 'AB' },
    lead: { type: 'bell', oct: 3, v: .03, sec: 'B', n: [[0, 4, 4], [6, 2, 2], [8, 0, 8], [16, 4, 4], [22, 5, 2], [24, 4, 8], [32, 2, 4], [38, 0, 2], [40, -1, 8], [48, 0, 16]] } }),  oryu: mkTrack({ name: 'THE LAST ECHO', style: 'Boss taiko dub', bpm: 146, root: 61.7, sc: 'phr', prog: [0, 1, 0, 6], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x..x..x.x..x..x.', c: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x..x..x.x..x..x.', c: '....X.......X...', h: 'xxxxxxxxxxxxxxxx', m: '.......x......x.' }, D: { m: 'x...x...x...x...' }, F: { k: 'x..x..x.x.xxxxxx', c: '....X...X.X.XXXX' } },
    bass: { pat: [0, null, 0, null, 1, null, 0, null, 0, null, 0, null, 6, null, 5, null], type: 'reese', v: .085, len: 1.4 },
    pad: { type: 'darkpad', oct: 2, v: .03 },
    lead: { type: 'brass', oct: 2, v: .04, sec: 'B', n: [[0, 0, 4], [4, 1, 4], [8, 0, 8], [16, 6, 4], [20, 5, 4], [24, 4, 8], [32, 0, 4], [36, 1, 4], [40, 3, 4], [44, 4, 4], [48, 1, 16]] } }),  dojo: mkTrack({ name: 'DOJO', style: 'Koto and flute', bpm: 72, root: 110, sc: 'yo', prog: [0, 2, 3, 0], form: ['A', 'B'], fixedI: 2, taiko: 1,
    dr: { A: { t: 'X...............', r: '........x.......', sh: '..x...x...x...x.' }, B: { t: 'X.......x.......', r: '....x.......x...', sh: '..x...x...x...x.' } },
    bass: { pat: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], type: 'sub', v: .07, len: 12 },
    pad: { type: 'darkpad', oct: 1, v: .018 },
    lead: { type: 'koto', oct: 2, v: .04, sec: 'AB', n: [[0, 2, 4], [4, 3, 4], [8, 4, 8], [16, 3, 4], [20, 2, 4], [24, 0, 8], [32, 2, 4], [36, 4, 4], [40, 5, 8], [48, 4, 4], [52, 3, 4], [56, 2, 8]] },
    lead2: { type: 'flute', oct: 3, v: .028, sec: 'B', n: [[0, 7, 12], [16, 6, 12], [32, 5, 12], [48, 4, 16]] } }),
  credits: mkTrack({ name: 'NEW DAWN', style: 'Anthem', bpm: 110, root: 65.4, sc: 'maj', prog: [0, 4, 5, 3], form: ['A', 'B', 'B'], fixedI: 2,
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.' }, B: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.' }, F: { k: 'x...x...x...x...', s: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 12, null], type: 'bass', v: .09 },
    pad: { type: 'pad', oct: 2, v: .022 },
    arp: { pat: [0, 1, 2, 1], rate: 2, oct: 3, type: 'arp', v: .02, sec: 'B' },
    lead: { type: 'lead', oct: 3, v: .04, sec: 'AB', n: [[0, 4, 4], [4, 4, 2], [6, 5, 2], [8, 7, 8], [16, 6, 4], [20, 5, 4], [24, 4, 8], [32, 2, 4], [36, 3, 2], [38, 4, 2], [40, 5, 8], [48, 4, 4], [52, 2, 4], [56, 0, 8]] } })
};
Object.assign(TRACKS, {
  phonk: mkTrack({ name: 'DRIFT PHONK', style: 'Phonk', bpm: 132, root: 69.3, sc: 'phr', prog: [0, 0, 5, 1], form: ['A', 'B', 'B', 'D', 'B'], fx: { vinyl: 1 },
    dr: { A: { k: 'x.....x...x.....', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x.....x...x...x.', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', hr: '......x.......x.', o: '..........o.....' }, D: { h: 'x...x...x...x...' }, F: { k: 'x.....x...x.....', c: '....x...x.x.xxxx', hr: 'xxxxxxxx' } },
    bass: { pat: [0, null, null, null, null, null, 0, null, null, null, 0, null, null, null, 12, null], type: 'b808', v: .12, len: 5 },
    pad: { type: 'darkpad', oct: 2, v: .016, sec: 'BD' },
    lead: { type: 'cowbell', oct: 3, v: .05, sec: 'ABD', n: [[0, 7, 1], [3, 7, 1], [6, 6, 1], [8, 4, 2], [10, 5, 1], [12, 4, 2], [14, 1, 1], [16, 7, 1], [19, 7, 1], [22, 8, 1], [24, 7, 2], [26, 6, 1], [28, 5, 2], [30, 4, 1],
      [32, 7, 1], [35, 7, 1], [38, 6, 1], [40, 4, 2], [42, 5, 1], [44, 4, 2], [46, 1, 1], [48, 0, 2], [50, 1, 1], [52, 4, 2], [54, 5, 1], [56, 4, 4], [60, 1, 2]] } }),
  chip: mkTrack({ name: '8-BIT RONIN', style: 'Chiptune', bpm: 150, root: 110, sc: 'aeo', prog: [0, 5, 2, 6], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { b: 'x.......x.......', n: '....x.......x...', h: '..x...x...x...x.' }, B: { b: 'x.......x.x.....', n: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, D: { h: '..x...x...x...x.' }, F: { b: 'x...x...x...x...', n: '....x...x.xxxxxx' } },
    bass: { pat: [0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 0, 12, 7, 12], type: 'tri', v: .12, len: .9 },
    arp: { pat: [0, 1, 2, 1], rate: 1, oct: 3, type: 'pulse', v: .02, sec: 'AB' },
    lead: { type: 'pulse', oct: 3, v: .05, sec: 'B', n: [[0, 4, 2], [2, 4, 1], [3, 5, 1], [4, 7, 4], [8, 6, 2], [10, 4, 2], [12, 2, 4], [16, 3, 2], [18, 4, 2], [20, 5, 2], [22, 4, 2], [24, 2, 4], [28, 0, 4],
      [32, 4, 2], [34, 4, 1], [35, 5, 1], [36, 7, 4], [40, 9, 2], [42, 8, 2], [44, 7, 4], [48, 8, 2], [50, 7, 2], [52, 6, 2], [54, 4, 2], [56, 7, 8]] } }),
  metal: mkTrack({ name: 'STEEL TEMPEST', style: 'Cyber metal', bpm: 172, root: 82.4, sc: 'pdom', prog: [0, 1, 0, 6], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', d: '..x...x...x...x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', y: 'x...............' }, B: { d: 'xxxxxxxxxxxxxxxx', s: '....x.......x...', y: 'x.......x.......' }, D: { s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, F: { d: 'xxxxxxxxxxxxxxxx', s: 'x.x.x.x.xxxxxxxx' } },
    bass: { pat: [0, 0, null, 0, 0, null, 0, 0, null, 0, 0, null, 1, null, 0, null], type: 'gtr', v: .05, len: .6 },
    pad: { type: 'choir', oct: 2, v: .024 },
    lead: { type: 'gld', oct: 3, v: .03, sec: 'B', n: [[0, 0, 2], [2, 1, 2], [4, 4, 2], [6, 5, 2], [8, 4, 4], [12, 1, 4], [16, 7, 2], [18, 6, 2], [20, 5, 2], [22, 4, 2], [24, 5, 8],
      [32, 0, 2], [34, 1, 2], [36, 4, 2], [38, 5, 2], [40, 7, 4], [44, 8, 4], [48, 7, 2], [50, 5, 2], [52, 4, 4], [56, 1, 4], [60, 0, 4]] } }),
  trap: mkTrack({ name: 'NEON TRAP', style: 'Trap', bpm: 140, root: 77.8, sc: 'aeo', prog: [0, 5, 3, 4], chordLen: 2, form: ['A', 'B', 'B', 'D'],
    dr: { A: { k: 'x......x..x.....', c: '........x.......', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x......x..x...x.', c: '........x.......', h: 'x.x.x.x.x.x.x.x.', hr: '.....x......xx..', o: '...........o....' }, D: { h: 'x...x...x...x...' }, F: { k: 'x......x..x.....', c: '........x...x.xx', hr: 'xxxxxxxxxxxxxxxx' } },
    bass: { pat: [0, null, null, null, null, null, null, 0, null, null, 0, null, null, null, -2, null], type: 'b808', v: .12, len: 6 },
    pad: { type: 'darkpad', oct: 2, v: .018 },
    lead: { type: 'bell', oct: 3, v: .034, sec: 'BD', n: [[0, 4, 2], [3, 2, 1], [4, 4, 2], [6, 6, 2], [8, 7, 4], [12, 6, 2], [14, 4, 2], [16, 2, 4], [20, 4, 2], [22, 2, 2], [24, 0, 8],
      [32, 4, 2], [35, 2, 1], [36, 4, 2], [38, 6, 2], [40, 9, 4], [44, 7, 2], [46, 6, 2], [48, 7, 4], [52, 6, 4], [56, 4, 8]] } })
});
Object.assign(TRACKS, { // version 21: acts V and VI
  skyroad: mkTrack({ name: 'SKY ROAD', style: 'Synthwave climb', bpm: 118, root: 73.4, sc: 'aeo', prog: [0, 5, 3, 4], form: ['A', 'B', 'A', 'B', 'D'],
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.' }, B: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.' }, D: { h: '..x...x...x...x.' }, F: { k: 'x...x...x.x.xxxx', s: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, 0, 12, 0, null, 0, 12, 0, null, 0, 12, 0, null, 7, null], type: 'bass', v: .085 },
    pad: { type: 'pad', oct: 2, v: .024 },
    arp: { pat: [0, 2, 4, 7, 4, 2], rate: 2, oct: 3, type: 'arp', v: .018, sec: 'AB' },
    lead: { type: 'lead', oct: 3, v: .038, sec: 'B', n: [[0, 4, 4], [4, 5, 4], [8, 7, 8], [16, 6, 4], [20, 4, 4], [24, 2, 8], [32, 4, 4], [36, 5, 2], [38, 7, 2], [40, 9, 8], [48, 7, 16]] } }),
  starring: mkTrack({ name: 'MIRROR STATION', style: 'Space ambient', bpm: 96, root: 61.7, sc: 'maj', prog: [0, 3, 5, 4], form: ['A', 'B', 'B', 'D'],
    dr: { A: { k: 'x.......x.......', sh: '..x...x...x...x.' }, B: { k: 'x.......x.......', c: '....x.......x...', sh: 'x.x.x.x.x.x.x.x.' }, D: { sh: '..x...x...x...x.' }, F: { k: 'x...x...x.x.xxxx' } },
    bass: { pat: [0, null, null, null, null, null, 0, null, null, null, null, null, 5, null, null, null], type: 'sub', v: .08, len: 4 },
    pad: { type: 'choir', oct: 2, v: .03 },
    arp: { pat: [0, 4, 7, 11, 7, 4], rate: 2, oct: 3, type: 'rhodes', v: .02, sec: 'AB' },
    lead: { type: 'bell', oct: 3, v: .034, sec: 'B', n: [[0, 7, 6], [6, 9, 2], [8, 7, 8], [16, 4, 6], [22, 5, 2], [24, 4, 8], [32, 2, 6], [38, 4, 2], [40, 5, 8], [48, 4, 16]] } }),
  ruins: mkTrack({ name: 'OLD ROOTS', style: 'Jungle tribal', bpm: 124, root: 82.4, sc: 'dor', prog: [0, 0, 3, 6], form: ['A', 'B', 'A', 'B', 'D'], taiko: 1,
    dr: { A: { t: 'X..x..X...x.X...', sh: 'x.x.x.x.x.x.x.x.' }, B: { t: 'X..x..X.x.x.X..x', k: 'x.......x.......', sh: 'xxxxxxxxxxxxxxxx', r: '....x.......x...' }, D: { t: 'X.......X.......' }, F: { t: 'X.X.X.X.XXXXXXXX' } },
    bass: { pat: [0, null, null, 0, null, null, 0, null, 3, null, null, 3, null, null, 6, null], type: 'sub', v: .085 },
    pad: { type: 'organ', oct: 2, v: .014 },
    lead: { type: 'flute', oct: 3, v: .04, sec: 'AB', n: [[0, 4, 4], [4, 3, 2], [6, 2, 2], [8, 0, 8], [16, 2, 4], [20, 3, 4], [24, 4, 8], [32, 6, 4], [36, 4, 4], [40, 3, 8], [48, 0, 16]] },
    lead2: { type: 'koto', oct: 2, v: .028, sec: 'B', n: [[0, 0, 2], [2, 4, 2], [4, 7, 2], [8, 4, 2], [12, 0, 2], [16, 3, 2], [18, 7, 2], [24, 3, 4], [32, 0, 2], [36, 4, 2], [40, 6, 2], [48, 4, 8]] } }),
  origin: mkTrack({ name: 'THE FIRST CODE', style: 'Sacred techno', bpm: 128, root: 65.4, sc: 'phr', prog: [0, 1, 0, 6], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', h: '..x...x...x...x.', t: 'X...............' }, B: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', t: 'X.......X.......' }, D: { t: 'X...X...X...X...' }, F: { k: 'x...x...x.x.xxxx', c: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, 0, null, 0, null, 1, null, 0, null, 0, null, 6, null, 5, null], type: 'reese', v: .08, len: 1.4 },
    pad: { type: 'choir', oct: 2, v: .034 },
    lead: { type: 'koto', oct: 3, v: .036, sec: 'AB', n: [[0, 0, 4], [4, 1, 4], [8, 4, 8], [16, 5, 4], [20, 4, 4], [24, 1, 8], [32, 0, 4], [36, 1, 4], [40, 5, 4], [44, 6, 4], [48, 7, 16]] } }),
  tenkai: mkTrack({ name: 'SOLAR LANCE', style: 'Boss trance', bpm: 150, root: 77.8, sc: 'aeo', prog: [0, 5, 3, 4], form: ['A', 'B', 'B', 'D', 'B'],
    dr: { A: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, B: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '..o...o...o...o.' }, D: { h: 'x...x...x...x...' }, F: { k: 'x.x.x.x.x.x.xxxx', c: '....x...x.x.xxxx' } },
    bass: { pat: [null, 0, 0, null, null, 0, 0, null, null, 0, 0, null, null, 5, 7, null], type: 'reese', v: .085, len: .9 },
    pad: { type: 'pad', oct: 2, v: .026 },
    arp: { pat: [0, 2, 4, 7, 9, 7, 4, 2], rate: 1, oct: 3, type: 'arp', v: .018, sec: 'B' },
    lead: { type: 'brass', oct: 3, v: .04, sec: 'B', n: [[0, 7, 4], [4, 9, 4], [8, 11, 8], [16, 9, 4], [20, 7, 4], [24, 4, 8], [32, 7, 4], [36, 9, 4], [40, 12, 8], [48, 11, 16]] } }),
  izanami: mkTrack({ name: 'MOTHER OF MACHINES', style: 'Final boss', bpm: 164, root: 69.3, sc: 'pdom', prog: [0, 1, 5, 6], form: ['A', 'B', 'B', 'D', 'B'], taiko: 1,
    dr: { A: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', t: 'X.......X.......' }, B: { k: 'x.x.x...x.x.x.x.', c: '....x.......x...', t: 'X..x..x.X..x..x.', h: 'xxxxxxxxxxxxxxxx' }, D: { t: 'X...X...X...X...' }, F: { t: 'XXXXXXXXXXXXXXXX', k: 'x.x.x.x.xxxxxxxx' } },
    bass: { pat: [0, null, 0, null, 0, null, 1, null, 0, null, 0, null, 5, null, 6, null], type: 'reese', v: .085, len: 1.6 },
    pad: { type: 'choir', oct: 2, v: .036 },
    lead: { type: 'koto', oct: 3, v: .042, sec: 'B', n: [[0, 0, 8], [8, 1, 4], [12, 4, 4], [16, 5, 8], [24, 4, 8], [32, 0, 6], [38, 1, 2], [40, 4, 4], [44, 5, 4], [48, 7, 16]] },
    lead2: { type: 'brass', oct: 2, v: .03, sec: 'B', n: [[0, 0, 16], [16, 5, 16], [32, 1, 16], [48, 0, 16]] } })
});
Object.assign(TRACKS, { // version 22: act VII
  parade: mkTrack({ name: 'NIGHT PARADE', style: 'Festival trap', bpm: 112, root: 87.3, sc: 'yo', prog: [0, 3, 2, 0], form: ['A', 'B', 'A', 'B', 'D'], taiko: 1,
    dr: { A: { t: 'X..x....X..x....', r: '....x.......x...', sh: 'x.x.x.x.x.x.x.x.' }, B: { t: 'X..x..x.X..x.x..', k: 'x......x..x.....', h: 'x.x.x.x.x.x.x.x.', r: 'x.x.x.x.x.x.x.x.' }, D: { t: 'X.......X.......' }, F: { t: 'X.x.X.x.XxXxXXXX' } },
    bass: { pat: [0, null, null, null, null, null, null, 0, null, null, 0, null, null, null, 3, null], type: 'b808', v: .11, len: 5 },
    pad: { type: 'organ', oct: 2, v: .014 },
    lead: { type: 'flute', oct: 3, v: .042, sec: 'AB', n: [[0, 4, 3], [3, 3, 1], [4, 2, 4], [8, 0, 8], [16, 2, 2], [18, 3, 2], [20, 4, 4], [24, 5, 8], [32, 4, 3], [35, 3, 1], [36, 2, 4], [40, 3, 4], [44, 2, 4], [48, 0, 16]] },
    lead2: { type: 'koto', oct: 2, v: .03, sec: 'B', n: [[0, 0, 2], [2, 2, 2], [4, 4, 2], [6, 2, 2], [8, 0, 2], [12, 5, 2], [16, 4, 4], [24, 2, 4], [32, 0, 2], [36, 4, 2], [40, 5, 2], [48, 4, 8]] } }),
  hollow: mkTrack({ name: 'HOLLOW MOON', style: 'Dark wave', bpm: 100, root: 58.3, sc: 'phr', prog: [0, 1, 0, 5], form: ['A', 'B', 'B', 'D'],
    dr: { A: { k: 'x.......x.......', sh: '..x...x...x...x.' }, B: { k: 'x.......x.......', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, D: { sh: 'x...x...x...x...' }, F: { k: 'x...x...x.x.xxxx', c: '....x...x.x.xxxx' } },
    bass: { pat: [0, null, null, 0, null, null, 1, null, 0, null, null, 0, null, 5, null, null], type: 'reese', v: .08, len: 2 },
    pad: { type: 'darkpad', oct: 2, v: .032 },
    lead: { type: 'bell', oct: 3, v: .034, sec: 'B', n: [[0, 0, 6], [6, 1, 2], [8, 0, 8], [16, 5, 6], [22, 4, 2], [24, 1, 8], [32, 0, 6], [38, 1, 2], [40, 4, 8], [48, 0, 16]] } }),
  hyakki: mkTrack({ name: 'HUNDRED DEMONS', style: 'Boss festival metal', bpm: 168, root: 73.4, sc: 'pdom', prog: [0, 1, 0, 6], form: ['A', 'B', 'B', 'D', 'B'], taiko: 1,
    dr: { A: { k: 'x...x...x...x...', d: '..x...x...x...x.', t: 'X.......X.......', h: 'x.x.x.x.x.x.x.x.' }, B: { d: 'xxxxxxxxxxxxxxxx', s: '....x.......x...', t: 'X..x..x.X..x..x.' }, D: { t: 'X...X...X...X...' }, F: { d: 'xxxxxxxxxxxxxxxx', t: 'XXXXXXXXXXXXXXXX' } },
    bass: { pat: [0, 0, null, 0, 0, null, 0, 0, null, 0, 0, null, 1, null, 0, null], type: 'gtr', v: .05, len: .6 },
    pad: { type: 'choir', oct: 2, v: .026 },
    lead: { type: 'flute', oct: 3, v: .04, sec: 'B', n: [[0, 0, 2], [2, 1, 2], [4, 4, 2], [6, 5, 2], [8, 4, 4], [12, 1, 4], [16, 7, 2], [18, 6, 2], [20, 5, 2], [22, 4, 2], [24, 5, 8], [32, 0, 2], [34, 1, 2], [36, 4, 2], [38, 5, 2], [40, 7, 4], [44, 8, 4], [48, 7, 16]] } })
});
const TRACK_LIST = ['menu', 'maglev', 'undercity', 'ghost', 'spire', 'core', 'storm', 'void', 'harbor', 'temple', 'summit', 'orbital', 'datavoid', 'apex', 'phonk', 'chip', 'metal', 'trap', 'warden', 'hydra', 'kage', 'shogun', 'raijin', 'renull', 'leviathan', 'benkei', 'prime', 'valkyrie', 'chimera', 'genesis', 'sakura', 'abyss', 'oryu', 'dojo', 'credits', 'skyroad', 'starring', 'ruins', 'origin', 'tenkai', 'izanami', 'parade', 'hollow', 'hyakki'];
const RUN_TRACKS = ['maglev', 'undercity', 'ghost', 'spire', 'core', 'storm', 'phonk', 'chip', 'metal', 'trap'];
const MODE_TRACK = { tower: 'metal', highway: 'phonk', mayhem: 'metal', timeattack: 'phonk', daily: 'chip', weekly: 'trap' }; // AUTO picks these for arcade modes
Object.assign(TRACKS, { // version 38: the WAR soundtrack
  war1: mkTrack({ name: 'SIEGE PROTOCOL', style: 'Darksynth war march', bpm: 128, root: 46.25, sc: 'phr', prog: [0, 5, 3, 6], form: ['A', 'A', 'B', 'B', 'D', 'B', 'B'], taiko: 1,
    dr: { A: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.', t: 'x.......x..x....' },
          B: { k: 'x...x...x...x...', d: '..x...x...x...xx', s: '....X.......X...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', t: 'x..x..x.x..x..x.', y: 'x...............' },
          D: { t: 'x.......x.......', h: '....x.......x...', p: '..x.......x.....' },
          F: { k: 'x...x...x.x.x.x.', s: '....x...x.xxXXXX', t: 'x.x.x.x.xxxxxxxx', y: '...............x' } },
    bass: { pat: [0, null, 0, null, 0, 0, null, 0, 0, null, 0, null, 1, null, 0, null], type: 'reese', v: .085, len: .9 },
    pad: { type: 'darkpad', oct: 2, v: .02 },
    lead: { type: 'gld', oct: 3, v: .03, sec: 'B', n: [[0, 4, 3], [3, 5, 1], [4, 4, 2], [6, 3, 2], [8, 1, 4], [12, 0, 4], [16, 4, 3], [19, 5, 1], [20, 7, 4], [24, 5, 2], [26, 4, 2], [28, 3, 4],
      [32, 4, 3], [35, 5, 1], [36, 4, 2], [38, 3, 2], [40, 1, 4], [44, 0, 4], [48, 7, 6], [54, 8, 2], [56, 7, 4], [60, 5, 4]] },
    lead2: { type: 'brass', oct: 2, v: .024, sec: 'B', n: [[0, 0, 2], [8, 0, 2], [16, 1, 2], [24, 0, 2], [32, 0, 2], [40, 0, 2], [48, 3, 2], [56, 1, 4]] } }),
  war2: mkTrack({ name: 'STEEL RAIN', style: 'Industrial drum and bass', bpm: 172, root: 49, sc: 'aeo', prog: [0, 5, 3, 4], form: ['A', 'B', 'B', 'D', 'B', 'B'],
    dr: { A: { k: 'x.........x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', p: '..x.......x...x.' },
          B: { k: 'x.........x.x...', s: '....x.......x..g', h: 'x.x.x.x.x.x.x.x.', o: '......o.......o.', p: '..x.......x...x.', y: 'x...............' },
          D: { h: 'x...x...x...x...', p: '..x...x...x...x.' },
          F: { k: 'x.........x.....', s: '....x..x.xx.xxxx', y: '...............x' } },
    bass: { pat: [0, null, null, 0, null, null, 0, null, null, null, 3, null, null, 2, null, null], type: 'reese', v: .09, len: 1.4 },
    pad: { type: 'pad', oct: 2, v: .016, sec: 'BD' },
    arp: { pat: [0, 2, 4, 2], rate: 2, oct: 3, type: 'pluck', v: .018, sec: 'B' },
    lead: { type: 'lead', oct: 3, v: .026, sec: 'B', n: [[0, 7, 4], [4, 6, 2], [6, 4, 2], [8, 3, 6], [16, 4, 4], [20, 3, 2], [22, 1, 2], [24, 0, 8], [32, 7, 4], [36, 8, 2], [38, 7, 2], [40, 6, 6], [48, 4, 4], [52, 6, 4], [56, 7, 8]] } }),
  war3: mkTrack({ name: 'FRONTLINE', style: 'Cyber taiko war drums', bpm: 140, root: 51.9, sc: 'insen', prog: [0, 0, 3, 2], form: ['A', 'A', 'B', 'B', 'D', 'B'], taiko: 1,
    dr: { A: { t: 'x..x..x.x..x..x.', r: '..x...x...x...x.', k: 'x.......x.......' },
          B: { t: 'x..x..x.x..x..x.', k: 'x...x...x...x...', s: '....x.......x...', m: '.........x.x.x..', h: 'x.x.x.x.x.x.x.x.', y: 'x...............' },
          D: { t: 'x.......x.......', r: '..x...x...x...x.' },
          F: { t: 'x.x.x.x.xxxxXXXX', s: '....x...x.x.xxxx', y: '...............x' } },
    bass: { pat: [0, null, null, null, 0, null, null, null, 0, null, null, 0, null, null, 2, null], type: 'sub', v: .1, len: 2 },
    pad: { type: 'choir', oct: 2, v: .02 },
    lead: { type: 'koto', oct: 3, v: .034, sec: 'AB', n: [[0, 0, 2], [2, 1, 2], [4, 2, 2], [6, 4, 4], [12, 2, 2], [14, 1, 2], [16, 0, 4], [24, 4, 2], [26, 3, 2], [28, 2, 4],
      [32, 0, 2], [34, 1, 2], [36, 2, 2], [38, 4, 4], [44, 5, 2], [46, 4, 2], [48, 3, 8], [56, 2, 4], [60, 1, 4]] },
    lead2: { type: 'brass', oct: 2, v: .022, sec: 'B', n: [[0, 0, 8], [16, 2, 8], [32, 3, 8], [48, 2, 8]] } }),
  warboss: mkTrack({ name: 'TOTAL WAR', style: 'Boss: war metal synth', bpm: 152, root: 41.2, sc: 'phr', prog: [0, 1, 0, 6], form: ['A', 'B', 'B', 'D', 'B', 'B'], taiko: 1,
    dr: { A: { d: 'x.x.x.x.x.x.x.x.', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.', t: 'x.......x.......' },
          B: { d: 'xxxxxxxxxxxxxxxx', s: '....X.......X...', c: '....x.......x...', y: 'x.......x.......', h: 'x.x.x.x.x.x.x.x.' },
          D: { t: 'x..x..x.x..x..x.', k: 'x...............', r: '..x...x...x...x.' },
          F: { d: 'xxxxxxxxxxxxxxxx', s: 'x.x.x.x.xxxxXXXX', y: '...............x' } },
    bass: { pat: [0, null, 0, null, 0, null, 1, null, 0, null, 0, null, 0, null, 6, null], type: 'reese', v: .09, len: .8 },
    pad: { type: 'choir', oct: 2, v: .022 },
    lead: { type: 'gtr', oct: 2, v: .03, sec: 'AB', n: [[0, 0, 1], [2, 0, 1], [4, 1, 2], [6, 0, 1], [8, 0, 1], [10, 3, 2], [12, 1, 2], [14, 0, 2], [16, 0, 1], [18, 0, 1], [20, 1, 2], [22, 0, 1], [24, 5, 2], [26, 4, 2], [28, 3, 4],
      [32, 0, 1], [34, 0, 1], [36, 1, 2], [38, 0, 1], [40, 0, 1], [42, 3, 2], [44, 1, 2], [46, 0, 2], [48, 7, 4], [52, 6, 4], [56, 5, 4], [60, 4, 4]] },
    lead2: { type: 'brass', oct: 3, v: .02, sec: 'B', n: [[0, 4, 8], [8, 3, 8], [16, 4, 8], [24, 5, 8], [32, 4, 8], [40, 3, 8], [48, 7, 8], [56, 6, 8]] } })
});
TRACK_LIST.push('war1', 'war2', 'war3', 'warboss');
function runTrackPick() { // once per run: AUTO (area or mode), SHUFFLE, or the track the player chose in the Music Room
  if (G.mode === 'dojo') return 'dojo';
  const s = Store.data.settings.track || 'auto';
  if (s === 'shuffle') return RUN_TRACKS[(Math.random() * RUN_TRACKS.length) | 0];
  if (s !== 'auto' && TRACKS[s]) return s;
  return MODE_TRACK[G.mode] || BG.theme;
}
Object.assign(Aud, {
  /* ---------- instruments (music bus) ---------- */
  hit(t, d, v, ft, f, q) { // filtered noise burst
    const c = this.c; if (!this.slot(this.de, t, d + .02)) return;
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.nb; fl.type = ft; fl.frequency.value = f; fl.Q.value = q || .7;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    s.connect(fl); fl.connect(g); g.connect(this.musBus); s.onended = () => { s.disconnect(); fl.disconnect(); g.disconnect(); };
    s.start(t, rnd() * .5, d + .03);
  },
  thump(t, f1, f2, d, v, type) { // pitched drum body
    const c = this.c; if (!this.slot(this.de, t, d + .02)) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d * .35);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    o.connect(g); g.connect(this.musBus); o.onended = () => { o.disconnect(); g.disconnect(); }; o.start(t); o.stop(t + d + .02);
  },
  kick(t, v) { this.thump(t, 160, 46, .34, v); this.hit(t, .012, v * .35, 'highpass', 3000); },
  snare(t, v) { this.hit(t, .16, v, 'bandpass', 1900, .7); this.thump(t, 190, 150, .1, v * .55, 'triangle'); },
  clap(t, v) { this.hit(t, .05, v, 'bandpass', 1150, 1.2); this.hit(t + .012, .05, v * .8, 'bandpass', 1150, 1.2); this.hit(t + .026, .13, v * .7, 'bandpass', 1050, 1); },
  hat(t, v, open) { this.hit(t, open ? .24 : .045, v, 'highpass', 7600, .6); },
  taiko(t, v) { this.thump(t, 98, 52, .5, v); this.hit(t, .07, v * .45, 'lowpass', 700); },
  tom(t, f, v) { this.thump(t, f, f * .65, .28, v); },
  shime(t, v) { this.thump(t, 440, 330, .08, v, 'triangle'); this.hit(t, .03, v * .5, 'bandpass', 2600, 2); },
  metal(t, v) { this.thump(t, 547, 540, .22, v, 'square'); this.thump(t, 821, 815, .18, v * .7, 'square'); },
  shaker(t, v) { this.hit(t, .06, v, 'bandpass', 6500, 1.5); },
  chipKick(t, v) { this.thump(t, 220, 55, .11, v, 'square'); },
  chipSnare(t, v) { this.hit(t, .09, v, 'highpass', 2500, .5); },
  dkick(t, v) { this.thump(t, 140, 52, .12, v); }, // short double-bass kick
  crash(t, v) { this.hit(t, .8, v, 'highpass', 5200, .4); },
  distIn() { // one shared amp for distorted voices: soft clip + a lowpass to tame the fizz
    if (this.ws) return this.ws;
    const c = this.c, ws = c.createWaveShaper(), cv = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 1023 * 2 - 1; cv[i] = Math.tanh(x * 7) * .8; }
    ws.curve = cv; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; const g = c.createGain(); g.gain.value = .55;
    ws.connect(lp); lp.connect(g); g.connect(this.musBus); return this.ws = ws;
  },
  voice(t, f, d, v, X, padBus) {
    const c = this.c, end = t + d + X.r; if (!this.slot(padBus ? this.pe : this.me, t, d + X.r + .05)) return;
    const fl = c.createBiquadFilter(), g = c.createGain(), nodes = [fl, g];
    fl.type = X.ft || 'lowpass'; fl.Q.value = X.q; fl.frequency.setValueAtTime(X.f0, t); if (X.f1 !== X.f0) fl.frequency.exponentialRampToValueAtTime(X.f1, t + Math.min(d, .6) + .01);
    const vv = v * (X.g || 1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vv, t + X.a); g.gain.setTargetAtTime(vv * X.s, t + X.a, Math.max(.02, d * .3)); g.gain.setTargetAtTime(0, t + d, Math.max(.02, X.r / 3));
    fl.connect(g); g.connect(X.dist ? this.distIn() : this.musBus);
    const n = this.lite ? 1 : X.o.length; let last = null;
    for (let i = 0; i < n; i++) {
      const spec = X.o[i], o = c.createOscillator(), og = c.createGain();
      o.type = spec[0]; o.detune.value = spec[1]; og.gain.value = spec[2];
      const fr = f * spec[3]; o.frequency.setValueAtTime(fr * (X.pb || 1), t); if (X.pb) o.frequency.exponentialRampToValueAtTime(fr, t + .06);
      o.connect(og); og.connect(fl); o.start(t); o.stop(end + .05); nodes.push(o, og); last = o;
    }
    if (X.breath && !this.lite) { const s = c.createBufferSource(), bf = c.createBiquadFilter(), bg = c.createGain(); s.buffer = this.nb; bf.type = 'bandpass'; bf.frequency.value = f * 2; bf.Q.value = 3; bg.gain.value = .25; s.connect(bf); bf.connect(bg); bg.connect(fl); s.start(t, rnd() * .4, d + .1); nodes.push(s, bf, bg); }
    if (last) last.onended = () => { for (const x of nodes) x.disconnect(); };
  },
  thunder(t) { this.hit(t, 1.8, .16, 'lowpass', 500, .6); this.thump(t, 60, 32, 1.4, .14); },
  whisper(t) { if (!this.slot(this.de, t, 1.3)) return; const c = this.c, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; fl.type = 'bandpass'; fl.Q.value = 8; fl.frequency.setValueAtTime(700, t); fl.frequency.exponentialRampToValueAtTime(1700, t + 1.2); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .5); g.gain.linearRampToValueAtTime(0, t + 1.25); s.connect(fl); fl.connect(g); g.connect(this.musBus); s.onended = () => { s.disconnect(); fl.disconnect(); g.disconnect(); }; s.start(t, rnd() * .3, 1.3); },
  riser(t, d) { if (!this.slot(this.de, t, d)) return; const c = this.c, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; fl.type = 'highpass'; fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(6000, t + d); g.gain.setValueAtTime(.0008, t); g.gain.exponentialRampToValueAtTime(.06, t + d); s.connect(fl); fl.connect(g); g.connect(this.musBus); s.onended = () => { s.disconnect(); fl.disconnect(); g.disconnect(); }; s.start(t, 0, d + .02); },
  /* ---------- transport ---------- */
  music(id, boss) {
    if (this.quiet) return;
    let tid = id === 'run' ? (G.runTrack || BG.theme) : id;
    const pick = Store.data.settings.track, fixed = id === 'run' && pick && pick !== 'auto' && pick !== 'shuffle' && TRACKS[pick];
    if (boss && !fixed && Boss.cur && TRACKS[Boss.cur.id]) tid = Boss.cur.id;
    if (!TRACKS[tid]) tid = 'maglev';
    const m = this.mus;
    if (!m.timer) m.timer = setInterval(() => this.tick(), 30);
    if (m.on && m.id === tid) return;
    m.id = tid; m.tr = TRACKS[tid]; m.step = 0; m.on = true;
    if (this.c) { m.next = this.c.currentTime + .06; if (boss) this.kick(m.next, .3); }
  },
  stopMusic() { this.mus.on = false; },
  hbT: 0,
  mix() { // dialogue ducks the music; pause, tutorials and aim slow-mo muffle it; the last shield adds a heartbeat
    if (!this.c || !this.md || this.quiet) return;
    const st = G.state, play = st === 'PLAY' && !Tut.cur, aim = play && G.ts < .6 && G.freeze <= 0, low = play && P.hp === 1 && G.mode !== 'dojo';
    const d = st === 'DIALOG' ? .38 : Tut.cur ? .55 : (st === 'PAUSE' || st === 'PERK') ? .7 : aim ? .82 : 1;
    const f = (st === 'PAUSE' || st === 'PERK' || Tut.cur) ? 1100 : aim ? 480 : low ? 2200 : 20000, now = this.c.currentTime;
    if (d !== this.duckV) { this.duckV = d; this.md.gain.setTargetAtTime(d, now, .1); }
    if (f !== this.filtV) { this.filtV = f; this.mf.frequency.setTargetAtTime(f, now, aim ? .025 : .12); }
    if (low && now >= this.hbT && this.c.state === 'running') { this.hbT = now + .85; this.thump(now + .03, 64, 40, .17, .34); this.thump(now + .27, 58, 38, .15, .24); }
  },
  tick() {
    const c = this.c, m = this.mus; if (!c || !m.on || c.state !== 'running' || !m.tr) return;
    this.lite = Q.lvl === 0;
    if (m.next < c.currentTime - .25) m.next = c.currentTime + .03; // recovered from a stall: don't burst
    const T = m.tr, sd = 60 / (T.bpm * (this.bpmMul || 1)) / 4; // (boss phase 3 pushes the tempo a little)
    while (m.next < c.currentTime + .14) { this.step16(T, m.next, m.step, sd); m.next += sd; m.step++; }
  },
  step16(T, t0, step, sd) {
    const s = step & 15, bar = step >> 4, sec = T.form[((bar >> 3) % T.form.length)], barIn = bar & 7;
    const I = T.fixedI || Math.max(1, this.intensity), fill = barIn === 7 && T.dr.F, brk = sec === 'D';
    const D = fill ? T.dr.F : (T.dr[sec] || T.dr.A), t = t0 + ((s & 1) && T.swing ? T.swing * sd : 0);
    if (D.k && D.k[s] && (!brk || I >= 3)) this.kick(t, .34 * D.k[s]);
    if (D.s && D.s[s] && (I >= 2 || sec === 'B') && !brk) this.snare(t, .17 * D.s[s]);
    if (D.c && D.c[s] && (I >= 2 || sec === 'B') && !brk) this.clap(t, .14 * D.c[s]);
    if (D.h && D.h[s]) this.hat(t, .042 * D.h[s], false);
    if (D.o && D.o[s]) this.hat(t, .05 * D.o[s], true);
    if (D.t && D.t[s] && (I >= 2 || T.taiko)) this.taiko(t, .3 * D.t[s]);
    if (D.m && D.m[s] && I >= 2) this.tom(t, 150 - (s & 3) * 20, .17 * D.m[s]);
    if (D.r && D.r[s] && I >= 2) this.shime(t, .09 * D.r[s]);
    if (D.p && D.p[s] && I >= 2) this.metal(t, .05 * D.p[s]);
    if (D.sh && D.sh[s]) this.shaker(t, .03 * D.sh[s]);
    if (D.b && D.b[s] && (!brk || I >= 3)) this.chipKick(t, .3 * D.b[s]);
    if (D.n && D.n[s] && (I >= 2 || sec === 'B') && !brk) this.chipSnare(t, .11 * D.n[s]);
    if (D.d && D.d[s] && (I >= 2 || sec === 'B') && !brk) this.dkick(t, .27 * D.d[s]);
    if (D.y && D.y[s] && I >= 2) this.crash(t, .055 * D.y[s]);
    if (D.hr && D.hr[s]) { this.hat(t, .034, false); this.hat(t + sd * .5, .028, false); }
    const sc = SCALES[T.sc], cl = T.chordLen || 1, cd = T.prog[((bar / cl) | 0) % T.prog.length];
    const root = T.root * Math.pow(2, this.shift / 12), F = semi => root * Math.pow(2, semi / 12);
    const B = T.bass; if (B && !(brk && I < 2)) { const v = B.pat[s]; if (v != null) this.voice(t, F(sdeg(sc, cd) + v + 12 * (B.oct || 0)), (B.len || 1.6) * sd, B.v, VOX[B.type], false); }
    const PD = T.pad;
    if (PD && (!PD.sec || PD.sec.indexOf(sec) >= 0)) {
      const hits = PD.hits, chordStart = s === 0 && bar % cl === 0, hit = hits ? hits.indexOf(s) >= 0 : chordStart;
      if (hit) {
        const len = hits ? sd * 5 : sd * 16 * cl * .98, n = PD.sev ? 4 : 3;
        for (let k = 0; k < n; k++) this.voice(t, F(sdeg(sc, cd + k * 2) + 12 * PD.oct), len, PD.v, VOX[PD.type], true);
      }
    }
    const A = T.arp;
    if (A && !this.lite && (I >= 2 || sec === 'B') && s % A.rate === 0 && (!A.sec || A.sec.indexOf(sec) >= 0)) {
      const idx = A.pat[((s / A.rate) | 0) % A.pat.length]; this.voice(t, F(sdeg(sc, cd + idx * 2) + 12 * A.oct), sd * A.rate * .9, A.v, VOX[A.type], false);
    }
    const ls = step & 63;
    for (let q = 0; q < 2; q++) {
      const L = q ? T.lead2 : T.lead; if (!L || (q && this.lite)) continue;
      const ok = L.sec.indexOf(sec) >= 0 && (I >= 2 || T.fixedI) || (I >= 3 && !q);
      const ns = ok && L.at[ls]; if (!ns) continue;
      for (const n of ns) this.voice(t, F(sdeg(sc, n[1]) + 12 * L.oct), n[2] * sd, L.v, VOX[L.type], false);
    }
    const fx = T.fx;
    if (fx) {
      if (fx.thunder && s === 0 && (bar & 1) && rnd() < .5) this.thunder(t);
      if (fx.whisper && s === 8 && (bar & 3) === 2) this.whisper(t);
      if (fx.vinyl && rnd() < .18) this.hit(t + rnd() * sd, .004, .03 + rnd() * .03, 'highpass', 3000);
    }
    if (fill && s === 0 && !T.fixedI && I >= 2) this.riser(t, sd * 16);
  }
});
