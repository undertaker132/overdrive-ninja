/* =====================================================================
   QR CODES — a small QR encoder (byte mode, error correction level L,
   versions 1-40, all eight masks scored by the standard penalty rules),
   used to show live-play invite and reply codes as a QR the other phone
   can scan. Written for this game; no external code.
   ===================================================================== */
const QR = (() => {
  // [ec codewords per block, blocks in group 1, data codewords each, blocks in group 2, data codewords each] — level L
  const RS_L = [null, [7, 1, 19], [10, 1, 34], [15, 1, 55], [20, 1, 80], [26, 1, 108], [18, 2, 68], [20, 2, 78], [24, 2, 97], [30, 2, 116], [18, 2, 68, 2, 69],
    [20, 4, 81], [24, 2, 92, 2, 93], [26, 4, 107], [30, 3, 115, 1, 116], [22, 5, 87, 1, 88], [24, 5, 98, 1, 99], [28, 1, 107, 5, 108], [30, 5, 120, 1, 121], [28, 3, 113, 4, 114], [28, 3, 107, 5, 108],
    [28, 4, 116, 4, 117], [28, 2, 111, 7, 112], [30, 4, 121, 5, 122], [30, 6, 117, 4, 118], [26, 8, 106, 4, 107], [28, 10, 114, 2, 115], [30, 8, 122, 4, 123], [30, 3, 117, 10, 118], [30, 7, 116, 7, 117], [30, 5, 115, 10, 116],
    [30, 13, 115, 3, 116], [30, 17, 115], [30, 17, 115, 1, 116], [30, 13, 115, 6, 116], [30, 12, 121, 7, 122], [30, 6, 121, 14, 122], [30, 17, 122, 4, 123], [30, 4, 122, 18, 123], [30, 20, 117, 4, 118], [30, 19, 118, 6, 119]];
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
  const mul = (a, b) => a && b ? EXP[LOG[a] + LOG[b]] : 0;
  function rsGen(n) { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[i]); } g = ng; } return g; }
  function rsEc(data, n) { const g = rsGen(n), r = new Array(n).fill(0); for (const d of data) { const f = d ^ r[0]; r.shift(); r.push(0); if (f) for (let j = 0; j < n; j++) r[j] ^= mul(g[j + 1], f); } return r; }
  const dataCap = v => { const t = RS_L[v]; return t[1] * t[2] + (t[3] || 0) * (t[4] || 0); };
  function alignPos(v) {
    if (v === 1) return []; const n = Math.floor(v / 7) + 2, last = v * 4 + 10, step = v === 32 ? 26 : Math.ceil((last - 6) / (n - 1) / 2) * 2, out = [6];
    for (let i = n - 1; i >= 1; i--) out.splice(1, 0, last - (n - 1 - i) * step); return out;
  }
  function bch(v, poly, deg) { let r = v << deg; const pd = Math.floor(Math.log2(poly)); for (let b = Math.floor(Math.log2(r || 1)); b >= deg; b--) if (r & (1 << b)) r ^= poly << (b - pd); return (v << deg) | r; }
  function encode(text, fm) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let v = 1; while (v <= 40 && 4 + (v < 10 ? 8 : 16) + bytes.length * 8 > dataCap(v) * 8) v++;
    if (v > 40) return null;
    // bit stream: mode 0100, length, bytes, terminator, pad
    const bits = []; const put = (x, n) => { for (let i = n - 1; i >= 0; i--) bits.push((x >> i) & 1); };
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); for (const b of bytes) put(b, 8);
    const cap = dataCap(v) * 8; for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(0); while (bits.length % 8) bits.push(0);
    const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    for (let p = 0; data.length < dataCap(v); p++) data.push(p % 2 ? 0x11 : 0xec);
    // blocks and interleave
    const t = RS_L[v], blocks = [], ecs = []; let k = 0;
    for (let g = 0; g < 2; g++) { const nb = g ? t[3] || 0 : t[1], nd = g ? t[4] || 0 : t[2]; for (let i = 0; i < nb; i++) { const d = data.slice(k, k + nd); k += nd; blocks.push(d); ecs.push(rsEc(d, t[0])); } }
    const words = []; const maxD = Math.max(...blocks.map(b => b.length));
    for (let i = 0; i < maxD; i++) for (const b of blocks) if (i < b.length) words.push(b[i]);
    for (let i = 0; i < t[0]; i++) for (const e of ecs) words.push(e[i]);
    // the matrix
    const N = v * 4 + 17, M = new Int8Array(N * N).fill(-1), F = new Uint8Array(N * N); // M: -1 empty, 0/1 module; F: function pattern
    const set = (x, y, b) => { M[y * N + x] = b ? 1 : 0; F[y * N + x] = 1; };
    const finder = (x0, y0) => { for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) { const X = x0 + x, Y = y0 + y; if (X < 0 || Y < 0 || X >= N || Y >= N) continue; const on = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)); set(X, Y, on); } };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (let i = 8; i < N - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); }
    const ap = alignPos(v);
    for (let i = 0; i < ap.length; i++) for (let j = 0; j < ap.length; j++) { const ax = ap[i], ay = ap[j], L = ap.length - 1; if ((i === 0 && j === 0) || (i === 0 && j === L) || (i === L && j === 0)) continue; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) set(ax + x, ay + y, Math.max(Math.abs(x), Math.abs(y)) !== 1); }
    set(8, N - 8, 1); // dark module
    for (let i = 0; i < 9; i++) { if (!F[8 * N + i]) { F[8 * N + i] = 1; M[8 * N + i] = 0; } if (!F[i * N + 8]) { F[i * N + 8] = 1; M[i * N + 8] = 0; } } // format areas (reserved)
    for (let i = 0; i < 8; i++) { F[8 * N + N - 1 - i] = 1; M[8 * N + N - 1 - i] = 0; F[(N - 1 - i) * N + 8] = 1; M[(N - 1 - i) * N + 8] = 0; }
    if (v >= 7) { const vi = bch(v, 0x1f25, 12); for (let i = 0; i < 18; i++) { const b = (vi >> i) & 1, a = Math.floor(i / 3), c = N - 11 + i % 3; set(a, c, b); set(c, a, b); } }
    // data in the zigzag
    let bi = 0; const total = words.length * 8;
    for (let right = N - 1; right >= 1; right -= 2) { if (right === 6) right = 5;
      for (let vert = 0; vert < N; vert++) for (let j = 0; j < 2; j++) { const x = right - j, up = ((right + 1) & 2) === 0, y = up ? N - 1 - vert : vert;
        if (F[y * N + x]) continue; M[y * N + x] = bi < total ? (words[bi >> 3] >> (7 - (bi & 7))) & 1 : 0; bi++; } }
    // masks: pick the one with the lowest penalty
    const MASK = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
      (x, y) => (x * y) % 2 + (x * y) % 3 === 0, (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0];
    const fmt = m => bch((1 << 3) | m, 0x537, 10) ^ 0x5412; // level L = 01
    const build = m => {
      const Q = Uint8Array.from(M, (b, i) => { const x = i % N, y = (i / N) | 0; return F[i] ? b : b ^ (MASK[m](x, y) ? 1 : 0); });
      const f = fmt(m);
      const put = (x, y, bit) => { Q[y * N + x] = bit; };
      for (let i = 0; i <= 5; i++) put(8, i, (f >> i) & 1);
      put(8, 7, (f >> 6) & 1); put(8, 8, (f >> 7) & 1); put(7, 8, (f >> 8) & 1);
      for (let i = 9; i < 15; i++) put(14 - i, 8, (f >> i) & 1);
      for (let i = 0; i < 8; i++) put(N - 1 - i, 8, (f >> i) & 1);
      for (let i = 8; i < 15; i++) put(8, N - 15 + i, (f >> i) & 1);
      Q[(N - 8) * N + 8] = 1; return Q; };
    const penalty = Q => { let p = 0;
      for (let y = 0; y < N; y++) for (let dir = 0; dir < 2; dir++) { let run = 1; for (let x = 1; x <= N; x++) { const a = x < N ? (dir ? Q[x * N + y] : Q[y * N + x]) : -1, b = dir ? Q[(x - 1) * N + y] : Q[y * N + x - 1]; if (a === b) run++; else { if (run >= 5) p += run - 2; run = 1; } } }
      for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) { const c = Q[y * N + x]; if (c === Q[y * N + x + 1] && c === Q[(y + 1) * N + x] && c === Q[(y + 1) * N + x + 1]) p += 3; }
      const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
      for (let y = 0; y < N; y++) for (let x = 0; x <= N - 11; x++) for (const P of [pat, pat2]) { let h = true, w = true; for (let k = 0; k < 11; k++) { if (Q[y * N + x + k] !== P[k]) h = false; if (Q[(x + k) * N + y] !== P[k]) w = false; } if (h) p += 40; if (w) p += 40; }
      let dark = 0; for (const b of Q) dark += b; p += Math.floor(Math.abs(dark * 20 / (N * N) - 10)) * 10; return p; };
    let best = null, bp = 1e9; for (let m = 0; m < 8; m++) { if (fm != null && m !== fm) continue; const Q = build(m), pp = penalty(Q); if (pp < bp) { bp = pp; best = Q; } }
    return { n: N, v, get: (x, y) => best[y * N + x] === 1 };
  }
  /* draw a QR into a canvas element, with a quiet zone */
  function canvas(text, px) {
    const q = encode(text); if (!q) return null; const quiet = 4, mod = Math.max(2, Math.floor((px || 320) / (q.n + quiet * 2))), S = mod * (q.n + quiet * 2);
    const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S); g.fillStyle = '#000000';
    for (let y = 0; y < q.n; y++) for (let x = 0; x < q.n; x++) if (q.get(x, y)) g.fillRect((x + quiet) * mod, (y + quiet) * mod, mod, mod);
    c.className = 'qr'; return c;
  }
  return { encode, canvas, dataCap };
})();
