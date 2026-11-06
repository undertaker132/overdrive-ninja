/* fonts load without blocking the first paint: the stylesheet arrives as media=print and switches on here */
'use strict'; // (must be the very first statement of the game script, or it does nothing)
try { document.querySelectorAll('link[data-font]').forEach(l => { l.media = 'all'; }); } catch (e) { errLog(e); }
/* =====================================================================
   DETERMINISTIC MATH — browsers may round Math.sin / cos / atan2 / exp /
   pow / hypot differently in the last bit, which is enough to make a
   replayed run drift away from the recorded one on another phone. These
   versions use only + - * / and sqrt (exact in IEEE 754 on every JS
   engine), so the simulation gives bit-identical results everywhere.
   Accuracy is within ~1 ulp of the native functions for game inputs.
   ===================================================================== */
const DMATH = (() => {
  const nsin = Math.sin, ncos = Math.cos;
  const PIO2_1 = 1.57079632673412561417e+00, PIO2_1T = 6.07710050650619224932e-11, PIO2_2 = 6.07710050630396597660e-11,
    PIO2_2T = 2.02226624879595063154e-21, PIO2_3 = 2.02226624871116645580e-21, PIO2_3T = 8.47842766036889956997e-32, INVPIO2 = 6.36619772367581382433e-01;
  const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04, S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
  const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05, C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
  function ksin(x, y) { const z = x * x, v = z * x, r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6))); return x - ((z * (0.5 * y - v * r) - y) - v * S1); }
  function kcos(x, y) { const z = x * x, r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6))))), hz = 0.5 * z, w = 1 - hz; return w + (((1 - w) - hz) + (z * r - x * y)); }
  const red = [0, 0]; // y0, y1 of the reduced argument
  const Q1 = 1.5707963705062866, Q2 = -4.371138828673793e-08, Q3 = -1.7151245100058819e-15, Q4 = 1.056299898220315e-23, Q5 = 8.478427566216846e-32; // pi/2 in 24-bit pieces
  function rem(x) { // Cody-Waite reduction by pi/2 (fdlibm medium case); returns the quadrant
    const n = Math.round(x * INVPIO2);
    if (n > 524288 || n < -524288) { // big arguments: n * Qi is exact for |n| < 2^29
      const r = (((x - n * Q1) - n * Q2) - n * Q3) - n * Q4, y0 = r - n * Q5;
      red[0] = y0; red[1] = (r - y0) - n * Q5; return n;
    }
    const ax = x < 0 ? -x : x;
    let r = x - n * PIO2_1, w = n * PIO2_1T, y0 = r - w;
    const ay = y0 < 0 ? -y0 : y0;
    if (ay < ax * 1.52587890625e-5) { // cancellation: second pass, good to ~118 bits
      let t = r; w = n * PIO2_2; r = t - w; w = n * PIO2_2T - ((t - r) - w); y0 = r - w;
      const ay2 = y0 < 0 ? -y0 : y0;
      if (ay2 < ax * 1.7763568394002505e-15) { t = r; w = n * PIO2_3; r = t - w; w = n * PIO2_3T - ((t - r) - w); y0 = r - w; }
    }
    red[0] = y0; red[1] = (r - y0) - w; return n;
  }
  const BIG = 8.4e8; // beyond this only cosmetic timers can reach: fall back to the native function
  function sin(x) {
    if (x !== x || x === Infinity || x === -Infinity) return NaN;
    const ax = x < 0 ? -x : x; if (ax > BIG) return nsin(x);
    if (ax <= 0.7853981633974483) { if (ax < 7.450580596923828e-9) return x; return ksin(x, 0); }
    const n = rem(x) & 3, y0 = red[0], y1 = red[1];
    return n === 0 ? ksin(y0, y1) : n === 1 ? kcos(y0, y1) : n === 2 ? -ksin(y0, y1) : -kcos(y0, y1);
  }
  function cos(x) {
    if (x !== x || x === Infinity || x === -Infinity) return NaN;
    const ax = x < 0 ? -x : x; if (ax > BIG) return ncos(x);
    if (ax <= 0.7853981633974483) { if (ax < 7.450580596923828e-9) return 1; return kcos(x, 0); }
    const n = rem(x) & 3, y0 = red[0], y1 = red[1];
    return n === 0 ? kcos(y0, y1) : n === 1 ? -ksin(y0, y1) : n === 2 ? -kcos(y0, y1) : ksin(y0, y1);
  }
  /* atan (fdlibm, classification by value instead of bit patterns) */
  const AH = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
  const AL = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];
  const AT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01, 9.09088713343650656196e-02,
    -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02, 4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];
  function atan(x) {
    if (x !== x) return NaN;
    const neg = x < 0; let ax = neg ? -x : x, id = -1;
    if (ax >= 7.378697629483821e19) return neg ? -(AH[3] + AL[3]) : AH[3] + AL[3];
    if (ax < 0.4375) { if (ax < 1.862645149230957e-9) return x; }
    else if (ax < 1.1875) { if (ax < 0.6875) { id = 0; ax = (2 * ax - 1) / (2 + ax); } else { id = 1; ax = (ax - 1) / (ax + 1); } }
    else if (ax < 2.4375) { id = 2; ax = (ax - 1.5) / (1 + 1.5 * ax); }
    else { id = 3; ax = -1 / ax; }
    const z = ax * ax, w = z * z;
    const s1 = z * (AT[0] + w * (AT[2] + w * (AT[4] + w * (AT[6] + w * (AT[8] + w * AT[10]))))), s2 = w * (AT[1] + w * (AT[3] + w * (AT[5] + w * (AT[7] + w * AT[9]))));
    if (id < 0) return neg ? -(ax - ax * (s1 + s2)) : ax - ax * (s1 + s2);
    const r = AH[id] - ((ax * (s1 + s2) - AL[id]) - ax);
    return neg ? -r : r;
  }
  const PI = 3.1415926535897931160e+00, PI_LO = 1.2246467991473531772e-16;
  function atan2(y, x) {
    if (x !== x || y !== y) return NaN;
    if (x === 1) return atan(y);
    if (y === 0) { if (x > 0 || (x === 0 && 1 / x > 0)) return y; return (1 / y > 0 || y > 0) ? PI : -PI; } // +-0 and pi
    if (x === 0) return y > 0 ? PI / 2 : -PI / 2;
    if (x === Infinity) { if (y === Infinity) return PI / 4; if (y === -Infinity) return -PI / 4; return y > 0 ? 0 : -0; }
    if (x === -Infinity) { if (y === Infinity) return 3 * PI / 4; if (y === -Infinity) return -3 * PI / 4; return y > 0 ? PI : -PI; }
    if (y === Infinity) return PI / 2; if (y === -Infinity) return -PI / 2;
    const ay = y < 0 ? -y : y, axx = x < 0 ? -x : x;
    let z;
    if (ay / axx > 1.152921504606847e18) z = PI / 2 + 0.5 * PI_LO;
    else if (x < 0 && ay / axx < 8.673617379884035e-19) z = 0;
    else z = atan(ay / axx);
    if (x > 0) return y < 0 ? -z : z;
    const r = PI - (z - PI_LO);
    return y < 0 ? -r : r;
  }
  /* exp (fdlibm) with exact power-of-two scaling from a table */
  const P2 = new Float64Array(2098); { let v = 1; for (let k = 0; k <= 1023; k++) { P2[k + 1074] = v; v *= 2; } v = 1; for (let k = 0; k >= -1074; k--) { P2[k + 1074] = v; v /= 2; } }
  function pow2(k) { return k > 1023 ? Infinity : k < -1074 ? 0 : P2[k + 1074]; }
  const LN2HI = 6.93147180369123816490e-01, LN2LO = 1.90821492927058770002e-10, INVLN2 = 1.44269504088896338700e+00;
  const E1 = 1.66666666666666019037e-01, E2 = -2.77777777770155933842e-03, E3 = 6.61375632143793436117e-05, E4 = -1.65339022054652515390e-06, E5 = 4.13813679705723846039e-08;
  function exp(x) {
    if (x !== x) return NaN; if (x > 709.782712893384) return Infinity; if (x < -745.1332191019411) return 0;
    const ax = x < 0 ? -x : x; if (ax < 3.725290298461914e-9) return 1 + x;
    let k = 0, hi = x, lo = 0;
    if (ax > 0.34657359027997264) { k = Math.round(x * INVLN2); hi = x - k * LN2HI; lo = k * LN2LO; }
    const r = hi - lo, t = r * r, c = r - t * (E1 + t * (E2 + t * (E3 + t * (E4 + t * E5))));
    const y = 1 - ((lo - (r * c) / (2 - c)) - hi);
    if (k === 0) return y;
    if (k >= -1021) return k > 1023 ? y * 2 * pow2(k - 1) : y * pow2(k);
    return y * pow2(k + 1000) * pow2(-1000);
  }
  /* log (fdlibm) — frexp by comparisons against the exact power table */
  const LG1 = 6.666666666666735130e-01, LG2 = 3.999999999940941908e-01, LG3 = 2.857142874366239149e-01, LG4 = 2.222219843214978396e-01, LG5 = 1.818357216161805012e-01, LG6 = 1.531383769920937332e-01, LG7 = 1.479819860511658591e-01;
  function log(x) {
    if (x !== x || x < 0) return NaN; if (x === 0) return -Infinity; if (x === Infinity) return Infinity;
    let k = 0, m = x;
    if (m < 2.2250738585072014e-308) { m *= 18014398509481984; k -= 54; } // subnormal: scale by 2^54
    while (m >= 1.4142135623730951) { if (m >= 4294967296) { m /= 4294967296; k += 32; } else if (m >= 65536) { m /= 65536; k += 16; } else { m /= 2; k += 1; } }
    while (m < 0.7071067811865476) { if (m < 2.3283064365386963e-10) { m *= 4294967296; k -= 32; } else if (m < 1.52587890625e-5) { m *= 65536; k -= 16; } else { m *= 2; k -= 1; } }
    const f = m - 1, hfsq = 0.5 * f * f, s = f / (2 + f), z = s * s, w = z * z;
    const t1 = w * (LG2 + w * (LG4 + w * LG6)), t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7))), R = t2 + t1;
    return k * LN2HI - ((hfsq - (s * (hfsq + R) + k * LN2LO)) - f);
  }
  function pow(x, y) {
    if (y === 0) return 1; if (x !== x || y !== y) return NaN;
    if (y === 1) return x;
    if (y === (y | 0) && y > -1025 && y < 1025) { // integers: square-and-multiply, exact for small cases
      let n = y < 0 ? -y : y, b = x, r = 1; while (n) { if (n & 1) r *= b; b *= b; n >>>= 1; } return y < 0 ? 1 / r : r;
    }
    if (y === 0.5) return Math.sqrt(x);
    if (x < 0) { const yi = Math.round(y); if (yi !== y) return NaN; const v = exp(y * log(-x)); return (Math.abs(yi) % 2 === 1) ? -v : v; }
    if (x === 0) return y > 0 ? 0 : Infinity;
    if (x === 1) return 1;
    return exp(y * log(x));
  }
  function hypot(a, b) { if (arguments.length > 2) { let s = 0; for (let i = 0; i < arguments.length; i++) s += arguments[i] * arguments[i]; return Math.sqrt(s); } return Math.sqrt(a * a + (b === undefined ? 0 : b * b)); }
  const native = { sin: Math.sin, cos: Math.cos, atan2: Math.atan2, exp: Math.exp, pow: Math.pow, hypot: Math.hypot, atan: Math.atan, log: Math.log };
  return { sin, cos, atan, atan2, exp, log, pow, hypot, native };
})();
Math.sin = DMATH.sin; Math.cos = DMATH.cos; Math.atan = DMATH.atan; Math.atan2 = DMATH.atan2; Math.exp = DMATH.exp; Math.log = DMATH.log; Math.pow = DMATH.pow; Math.hypot = DMATH.hypot;
