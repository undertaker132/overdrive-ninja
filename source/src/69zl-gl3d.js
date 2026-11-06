/* =====================================================================
   GL3D — a small WebGL renderer written for this game (no libraries).
   One tilted orthographic camera ("diorama" view) that can also turn
   (yaw) and lower its tilt for cinematic moments. The roof stays a true
   plane, so the 2D layer (effects, rings, text, HUD) lines up with it
   through one affine transform, and touch aiming stays exact.
   - meshes: box, prisms, cone, frustum, sphere, made once in local space
   - every frame the scene is batched on the CPU into buffers:
     A solids, T the translucent wet roof, R mirrored solids (reflections),
     B additive glows, BR mirrored glows
   - lighting: a moon light with shadows (shadow map), up to 8 moving point
     lights (blade, Overdrive, kills, bosses), specular on the wet roof,
     rim light, contact darkening, emissive, distance fog
   - post (by quality): bloom in two sizes, FXAA, color grading per world,
     vignette, film grain, chromatic aberration, dash motion blur, heat
     haze; ULTRA also takes the 2D layer through the same post
   - one texture atlas painted in code: roof plates with puddles, a white
     texel, lit windows, neon signs, a soft glow and a ring
   ===================================================================== */
const GL3D = {
  ok: false, gl: null, cv: null, th0: 40 * Math.PI / 180, th: 40 * Math.PI / 180, yaw: 0, k: 0, s: 0, cy: 1, sy: 0, // (40°: the 3D models show their sides, and the front wall still ends the view)
  VS: 13, NL: 8, cam: { x: 0, y: 0, z: 1, offY: 0 }, tgt: 'A', mir: false, wet: 0, rip: 0, t: 0, L: [], lmul: 1,
  P: { on: false, bloom: 0, fxaa: 0, sm: false, ca: 0, mb: 0, mbC: [.5, .5], haze: 0, grain: 0, vig: .35, grade: null, ultra: false },
  init() {
    if (this.ok || this.failed) return this.ok;
    try {
      const c = document.createElement('canvas'); c.id = 'c3d'; c.setAttribute('aria-hidden', 'true');
      const gl = c.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      if (!gl) { this.failed = true; return false; }
      cv.parentNode.insertBefore(c, cv); this.cv = c; this.gl = gl;
      this.NL = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) >= 64 ? 8 : 4;
      this.setView(this.th0, 0);
      const hp = 'precision mediump float;\n';
      const vs = `attribute vec3 p; attribute vec3 n; attribute vec4 c; attribute float e; attribute vec2 uv;
        uniform vec2 scr; uniform vec2 ctr; uniform vec4 cam; uniform vec2 ks; uniform vec2 yw; uniform vec4 smo; uniform vec2 ld; uniform vec3 off;
        varying vec4 vc; varying float ve; varying vec2 vu; varying vec3 vn; varying float vd; varying vec3 vw; varying vec3 vs;
        void main() { vec3 q = p + off; vec2 d = q.xy - cam.xy; float rx = d.x * yw.x - d.y * yw.y; float ry = d.x * yw.y + d.y * yw.x;
          float sx = ctr.x + rx * cam.z; float sy = ctr.y + cam.w + (ry * ks.x - q.z * ks.y) * cam.z; float dd = ry * ks.y + q.z * ks.x;
          gl_Position = vec4(sx / scr.x * 2. - 1., 1. - sy / scr.y * 2., clamp(-dd / 3000., -1., 1.), 1.);
          vc = c; ve = e; vu = uv; vn = n; vw = q; vd = clamp((-dd - 260.) / 1300., 0., .85);
          vs = vec3((q.x - q.z * ld.x - smo.x) * smo.z, (q.y - q.z * ld.y - smo.y) * smo.w, clamp((q.z + 20.) / 300., 0., 1.)); }`;
      const fs = hp + `uniform sampler2D tx; uniform sampler2D sm; uniform vec3 fog; uniform vec4 lt; uniform float add; uniform float wet; uniform float tp;
        uniform float smOn; uniform vec2 smT; uniform float lmul; uniform float toon; uniform vec3 vv; uniform vec4 lp[NL]; uniform vec3 lc[NL]; uniform float nl;
        varying vec4 vc; varying float ve; varying vec2 vu; varying vec3 vn; varying float vd; varying vec3 vw; varying vec3 vs;
        float sh1(vec2 q) { return step(texture2D(sm, q).r, vs.z + .012); }
        void main() { vec4 t = texture2D(tx, vu); if (add > .5) { float m = vc.a < 0. ? t.r : t.a; gl_FragColor = vec4(vc.rgb * m * abs(vc.a), 1.); return; } // a negative alpha: the texture's red is the light (holograms)
          vec3 N = normalize(vn); vec3 base = vc.rgb * t.rgb; float sh = 1.;
          if (smOn > .5 && vs.x > .002 && vs.x < .998 && vs.y > .002 && vs.y < .998) sh = (sh1(vs.xy + vec2(smT.x, 0.)) + sh1(vs.xy - vec2(smT.x, 0.)) + sh1(vs.xy + vec2(0., smT.y)) + sh1(vs.xy - vec2(0., smT.y))) * .25;
          vec3 Ld0 = normalize(lt.xyz); float l = max(dot(N, Ld0), 0.) * sh; float rim = pow(1. - abs(N.z * .6 + N.y * .4), 3.) * .35;
          if (toon > .5 && ve < .5) { l = smoothstep(.16, .22, l) * .55 + smoothstep(.55, .6, l) * .45; rim = smoothstep(.12, .16, rim) * .45; } // toon: light in two bands, a crisp rim
          float ao = mix(1., .45 + .55 * clamp(vw.z / 16., 0., 1.), (1. - abs(N.z)) * (1. - ve)); float gls = N.z > .9 ? .25 + wet * .9 : .2; vec3 Vd = normalize(vv);
          vec3 col = (base * (lt.w * mix(.72, 1., sh) + l * (1. - lt.w)) + vc.rgb * rim) * ao * lmul;
          col += vec3(.5, .58, .78) * pow(max(dot(N, normalize(Ld0 + Vd)), 0.), 40.) * gls * sh;
          for (int i = 0; i < NL; i++) { if (float(i) >= nl) break; vec3 Lv = lp[i].xyz - vw; float dl = length(Lv); float at = max(1. - dl / lp[i].w, 0.); at *= at;
            vec3 Ld = Lv / max(dl, .001); float df = max(dot(N, Ld), 0.); float spc = pow(max(dot(N, normalize(Ld + Vd)), 0.), 28.) * gls * 2.; col += lc[i] * at * (base * df * 1.8 + spc); }
          if (toon > .5 && ve < .5 && N.z < .85) { float sil = 1. - abs(dot(N, normalize(vv))); col *= mix(1., .18, smoothstep(.78, .86, sil)); } // toon: dark silhouette edges
          col += base * ve * 1.4; col = mix(col, fog, vd * (1. - ve));
          float a = vc.a; if (tp > .5) a *= mix(1., t.a, wet); gl_FragColor = vec4(col, a); }`.replace(/NL\]/g, this.NL + ']').replace('i < NL', 'i < ' + this.NL);
      this.pr = this.prog(vs, fs, ['p', 'n', 'c', 'e', 'uv'], ['scr', 'ctr', 'cam', 'ks', 'yw', 'smo', 'ld', 'off', 'tx', 'sm', 'fog', 'lt', 'add', 'wet', 'tp', 'smOn', 'smT', 'lmul', 'vv', 'lp', 'lc', 'nl', 'toon']);
      // shadow pass: the height of the highest thing over each roof texel, seen from the moon
      this.prS = this.prog(`attribute vec3 p; uniform vec4 smo; uniform vec2 ld; varying float vh;
        void main() { vec2 q = vec2((p.x - p.z * ld.x - smo.x) * smo.z, (p.y - p.z * ld.y - smo.y) * smo.w); vh = clamp((p.z + 20.) / 300., 0., 1.); gl_Position = vec4(q * 2. - 1., 1. - vh * 2., 1.); }`,
        hp + `varying float vh; void main() { gl_FragColor = vec4(vh, 0., 0., 1.); }`, ['p'], ['smo', 'ld']);
      // post
      const qv = 'attribute vec2 q; varying vec2 vu; void main() { vu = q * .5 + .5; gl_Position = vec4(q, 0., 1.); }';
      const hq = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
      this.prB = this.prog(qv, hq + `uniform sampler2D sc; uniform vec2 px; uniform float thr; varying vec2 vu;
        void main() { vec3 c = (texture2D(sc, vu + px * vec2(-1., -1.)).rgb + texture2D(sc, vu + px * vec2(1., -1.)).rgb + texture2D(sc, vu + px * vec2(-1., 1.)).rgb + texture2D(sc, vu + px * vec2(1., 1.)).rgb) * .25;
          float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(thr, thr + .35, l), 1.); }`, ['q'], ['sc', 'px', 'thr']);
      this.prBl = this.prog(qv, hq + `uniform sampler2D sc; uniform vec2 dir; varying vec2 vu;
        void main() { vec3 c = texture2D(sc, vu).rgb * .227; c += (texture2D(sc, vu + dir * 1.3846).rgb + texture2D(sc, vu - dir * 1.3846).rgb) * .3162; c += (texture2D(sc, vu + dir * 3.2308).rgb + texture2D(sc, vu - dir * 3.2308).rgb) * .0703; gl_FragColor = vec4(c, 1.); }`, ['q'], ['sc', 'dir']);
      this.prC = this.prog(qv, hq + `uniform sampler2D sc; uniform sampler2D b1; uniform sampler2D b2; uniform vec2 px; uniform float bi; uniform float bi2; uniform float vig; uniform float grain; uniform float ca;
        uniform float tm; uniform float haze; uniform float mbS; uniform vec2 mbC; uniform vec3 gT; uniform vec3 gL; uniform float gS; uniform float gC; uniform float fxaa; varying vec2 vu;
        vec3 fx(vec2 uv) { vec3 m = texture2D(sc, uv).rgb; if (fxaa < .5) return m; vec3 W = vec3(.299, .587, .114);
          float lNW = dot(texture2D(sc, uv + vec2(-1., -1.) * px).rgb, W), lNE = dot(texture2D(sc, uv + vec2(1., -1.) * px).rgb, W), lSW = dot(texture2D(sc, uv + vec2(-1., 1.) * px).rgb, W), lSE = dot(texture2D(sc, uv + vec2(1., 1.) * px).rgb, W), lM = dot(m, W);
          float mn = min(lM, min(min(lNW, lNE), min(lSW, lSE))), mx = max(lM, max(max(lNW, lNE), max(lSW, lSE))); if (mx - mn < .06) return m;
          vec2 d = vec2(-((lNW + lNE) - (lSW + lSE)), ((lNW + lSW) - (lNE + lSE))); float rd = max((lNW + lNE + lSW + lSE) * .03125, .0078); d = clamp(d / (min(abs(d.x), abs(d.y)) + rd), -6., 6.) * px;
          vec3 A = .5 * (texture2D(sc, uv + d * -.1667).rgb + texture2D(sc, uv + d * .1667).rgb); vec3 B = A * .5 + .25 * (texture2D(sc, uv - d * .5).rgb + texture2D(sc, uv + d * .5).rgb);
          float lB = dot(B, W); return (lB < mn || lB > mx) ? A : B; }
        void main() { vec2 uv = vu;
          if (haze > 0.) { float r = length((uv - mbC) * vec2(1., px.x / px.y)); float m = haze * smoothstep(.45, .05, r); uv += vec2(sin(uv.y * 90. + tm * 7.), cos(uv.x * 70. + tm * 5.)) * .0028 * m; }
          vec3 c = fx(uv);
          if (ca > 0.) { vec2 o = (uv - .5) * ca * .014; c.r = texture2D(sc, uv + o).r; c.b = texture2D(sc, uv - o).b; }
          if (mbS > 0.) { vec2 dv = uv - mbC; float m = smoothstep(.05, .3, length(dv)) * mbS, j = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453); vec3 acc = c; for (int i = 1; i < 9; i++) acc += texture2D(sc, uv - dv * m * (float(i) - j) * .015).rgb; c = acc / 9.; }
          c += texture2D(b1, uv).rgb * bi + texture2D(b2, uv).rgb * bi2;
          c = (c - .5) * gC + .5; float lu = dot(c, vec3(.299, .587, .114)); c = mix(vec3(lu), c, gS); c = c * gT + gL * (1. - c);
          vec2 vq = uv - .5; c *= 1. - vig * pow(dot(vq, vq) * 2.4, 1.5);
          c += (fract(sin(dot(uv * (tm + 1.7), vec2(12.9898, 78.233))) * 43758.5453) - .5) * grain;
          gl_FragColor = vec4(clamp(c, 0., 1.), 1.); }`, ['q'], ['sc', 'b1', 'b2', 'px', 'bi', 'bi2', 'vig', 'grain', 'ca', 'tm', 'haze', 'mbS', 'mbC', 'gT', 'gL', 'gS', 'gC', 'fxaa']);
      this.prU = this.prog(qv, hq + 'uniform sampler2D sc; varying vec2 vu; void main() { gl_FragColor = texture2D(sc, vec2(vu.x, 1. - vu.y)); }', ['q'], ['sc']);
      this.qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const mk = cap => ({ d: new Float32Array(cap * this.VS), n: 0, cap, vb: gl.createBuffer() });
      this.bf = { A: mk(1 << 17), T: mk(1 << 12), R: mk(1 << 16), B: mk(1 << 15), BR: mk(1 << 13) };
      this.lpA = new Float32Array(this.NL * 4); this.lcA = new Float32Array(this.NL * 3);
      this.tex = this.atlas(gl); this.meshes();
      this.ok = true; return true;
    } catch (e) { console.error('3D off:', e); this.failed = true; if (this.cv) this.cv.remove(); return false; }
  },
  prog(vsrc, fsrc, attrs, unis) {
    const gl = this.gl, sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vsrc)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fsrc)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    const o = { pr, a: {}, u: {} }; for (const a of attrs) o.a[a] = gl.getAttribLocation(pr, a); for (const u of unis) o.u[u] = gl.getUniformLocation(pr, u); return o;
  },
  setView(th, yaw) { this.th = th; this.yaw = yaw; this.k = Math.cos(th); this.s = Math.sin(th); this.cy = Math.cos(yaw); this.sy = Math.sin(yaw); },
  atlas(gl) { // 1024 x 1024: roof plates with puddles (top strip), a white texel, lit windows, neon signs, a soft glow and a ring (bottom half)
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
    { const W = 1024, H = 288; // one roof plate across the whole roof width: side plates, the middle walkway grate, seams and rivets
      const pg = g.createLinearGradient(0, 0, W, 0); pg.addColorStop(0, '#454d6a'); pg.addColorStop(.3, '#646d90'); pg.addColorStop(.5, '#6e78a0'); pg.addColorStop(.7, '#646d90'); pg.addColorStop(1, '#454d6a'); g.fillStyle = pg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) { const r = cmRand(i * 3 + 1), q = cmRand(i * 7 + 2); g.fillStyle = r > .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.06)'; g.fillRect((cmRand(i * 11) * W) | 0, (q * H) | 0, 2 + ((r * 6) | 0), 2); } // worn metal
      const wx0 = W * .32, wx1 = W * .68; g.fillStyle = '#272c44'; g.fillRect(wx0, 0, wx1 - wx0, H); g.fillStyle = '#3b4264'; for (let y = 4; y < H; y += 16) g.fillRect(wx0 + 6, y, wx1 - wx0 - 12, 8); // the grate
      g.fillStyle = '#1a1e30'; g.fillRect(0, 0, W, 6); g.fillRect(wx0 - 4, 0, 4, H); g.fillRect(wx1, 0, 4, H); g.fillRect(0, H / 2 - 2, wx0 - 4, 4); g.fillRect(wx1 + 4, H / 2 - 2, W - wx1 - 4, 4); // seams
      g.fillStyle = 'rgba(255,255,255,.09)'; g.fillRect(0, 6, W, 2); g.fillRect(0, H / 2 + 2, wx0 - 4, 2); g.fillRect(wx1 + 4, H / 2 + 2, W - wx1 - 4, 2); // seam highlights
      g.fillStyle = '#a3acd0'; for (const x of [18, wx0 - 22, wx1 + 18, W - 22]) for (const y of [20, H / 2 - 18, H / 2 + 16, H - 18]) { g.beginPath(); g.arc(x, y, 3.5, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(30, 26, wx0 - 70, H / 2 - 54); g.fillRect(wx1 + 40, H / 2 + 26, W - wx1 - 80, H / 2 - 54); // sheen
      g.fillStyle = 'rgba(255,200,40,.5)'; for (let x = 0; x < 120; x += 24) { g.beginPath(); g.moveTo(wx0 - 30 - x, H - 6); g.lineTo(wx0 - 18 - x, H - 6); g.lineTo(wx0 - 6 - x, H - 22); g.lineTo(wx0 - 18 - x, H - 22); g.fill(); } // hazard marks
      // the alpha channel is the wet look: a thin film everywhere, puddles in the dips (the reflections show through it)
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) { const px = cmRand(i * 13 + 5) * W, py = cmRand(i * 17 + 3) * H, rw = 40 + cmRand(i * 5) * 120, rh = 16 + cmRand(i * 9) * 40;
        const pgr = g.createRadialGradient(px, py, 0, px, py, rw); pgr.addColorStop(0, 'rgba(0,0,0,.62)'); pgr.addColorStop(.7, 'rgba(0,0,0,.45)'); pgr.addColorStop(1, 'rgba(0,0,0,0)');
        g.save(); g.translate(px, py); g.scale(1, rh / rw); g.translate(-px, -py); g.fillStyle = pgr; g.beginPath(); g.arc(px, py, rw, 0, TAU); g.fill(); g.restore(); }
      g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = '#fff'; g.fillRect(0, 296, 24, 24); // the white texel
    g.fillStyle = '#20263a'; g.fillRect(512, 296, 512, 216); // windows: lit and dark panes
    for (let y = 0; y < 18; y++) for (let x = 0; x < 16; x++) { const r = cmRand(x * 31 + y * 7); g.fillStyle = r > .55 ? (r > .85 ? '#ffd6a0' : '#bfe8ff') : '#0a0d18'; g.fillRect(518 + x * 32, 300 + y * 12, 22, 7); }
    // neon signs (original words), white on black so any color tints them: three signs of 480 x 56
    g.fillStyle = '#000'; g.fillRect(28, 296, 484, 216); g.textAlign = 'center'; g.textBaseline = 'middle';
    const signs = ['電脳 ラーメン', 'NEON 24H', 'オーバードライブ']; signs.forEach((w, i) => { const y = 296 + 8 + i * 70 + 28; g.font = '900 40px sans-serif'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.35)'; g.strokeRect(36, y - 28, 468, 56); g.fillStyle = '#fff'; g.fillText(w, 270, y + 2, 440); });
    let gr = g.createRadialGradient(256, 768, 0, 256, 768, 250); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 512, 512, 512);
    g.strokeStyle = '#fff'; g.lineWidth = 22; g.beginPath(); g.arc(768, 768, 208, 0, TAU); g.stroke();
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const ext = gl.getExtension('EXT_texture_filter_anisotropic'); if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return t;
  },
  /* uv regions: 0 white, 1 windows, 2 roof plates, 3..5 the three neon signs */
  REG: [[.012, .012, .3, .3], [.502, 1, .292, .498], [.001, .999, .001, .28], [.036, .49, .297, .35], [.036, .49, .365, .418], [.036, .49, .433, .486]],
  /* ---- meshes: arrays of [x,y,z, nx,ny,nz, u,v] per vertex, triangles; unit size around the origin ---- */
  meshes() {
    const M = this.M = {};
    const quad = (out, a, b, c, d, n, uv) => { const U = uv || [0, 0, 1, 1]; const P = [[a, U[0], U[1]], [b, U[2], U[1]], [c, U[2], U[3]], [a, U[0], U[1]], [c, U[2], U[3]], [d, U[0], U[3]]]; for (const [v, u, w] of P) out.push(v[0], v[1], v[2], n[0], n[1], n[2], u, w); };
    { const o = []; const h = .5; // box: x,y in [-.5,.5], z in [0,1]
      quad(o, [-h, -h, 1], [h, -h, 1], [h, h, 1], [-h, h, 1], [0, 0, 1]);
      quad(o, [-h, h, 0], [h, h, 0], [h, h, 1], [-h, h, 1], [0, 1, 0], [0, 1, 1, 0]);
      quad(o, [h, -h, 0], [-h, -h, 0], [-h, -h, 1], [h, -h, 1], [0, -1, 0], [0, 1, 1, 0]);
      quad(o, [h, h, 0], [h, -h, 0], [h, -h, 1], [h, h, 1], [1, 0, 0], [0, 1, 1, 0]);
      quad(o, [-h, -h, 0], [-h, h, 0], [-h, h, 1], [-h, -h, 1], [-1, 0, 0], [0, 1, 1, 0]);
      M.box = o; }
    { const o = []; quad(o, [-.5, 0, 0], [.5, 0, 0], [.5, 0, 1], [-.5, 0, 1], [0, 1, 0], [0, 1, 1, 0]); M.plane = o; } // a vertical sign facing +y
    const prism = (n, topR) => { const o = []; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, c0 = Math.cos(a0) * .5, s0 = Math.sin(a0) * .5, c1 = Math.cos(a1) * .5, s1 = Math.sin(a1) * .5, am = (a0 + a1) / 2;
        const t = topR; o.push(c0, s0, 0, Math.cos(am), Math.sin(am), .2, 0, 1, c1, s1, 0, Math.cos(am), Math.sin(am), .2, 1, 1, c1 * t, s1 * t, 1, Math.cos(am), Math.sin(am), .2, 1, 0, c0, s0, 0, Math.cos(am), Math.sin(am), .2, 0, 1, c1 * t, s1 * t, 1, Math.cos(am), Math.sin(am), .2, 1, 0, c0 * t, s0 * t, 1, Math.cos(am), Math.sin(am), .2, 0, 0);
        if (t > 0) o.push(0, 0, 1, 0, 0, 1, .5, .5, c0 * t, s0 * t, 1, 0, 0, 1, .5, .5, c1 * t, s1 * t, 1, 0, 0, 1, .5, .5); } return o; };
    M.cyl = prism(12, 1); M.hex = prism(6, 1); M.tri = prism(3, 1); M.pent = prism(5, 1); M.cone = prism(10, 0); M.frustum = prism(8, .6);
    { const o = []; const N = 10, R = 8; for (let i = 0; i < R; i++) for (let j = 0; j < N; j++) { const v = (a, b) => { const t = a / R * Math.PI, p = b / N * TAU; return [Math.sin(t) * Math.cos(p) * .5, Math.sin(t) * Math.sin(p) * .5, Math.cos(t) * .5 + .5]; };
        const P = [v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1)]; for (const q of [0, 1, 2, 0, 2, 3]) { const w = P[q]; o.push(w[0], w[1], w[2], w[0] * 2, w[1] * 2, (w[2] - .5) * 2, 0, 0); } }
      M.sph = o; }
    { const o = []; const N = 6, R = 4; for (let i = 0; i < R; i++) for (let j = 0; j < N; j++) { const v = (a, b) => { const t = a / R * Math.PI, p = b / N * TAU; return [Math.sin(t) * Math.cos(p) * .5, Math.sin(t) * Math.sin(p) * .5, Math.cos(t) * .5 + .5]; }; // ball: a light sphere for small parts
        const P = [v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1)]; for (const q of [0, 1, 2, 0, 2, 3]) { const w = P[q]; o.push(w[0], w[1], w[2], w[0] * 2, w[1] * 2, (w[2] - .5) * 2, 0, 0); } }
      M.ball = o; }
    { const o = []; const U = 16, W = 6, R = .42, r = .08; // tor: a ring lying flat, outer diameter 1 (sz scales the tube's height)
      for (let i = 0; i < U; i++) for (let j = 0; j < W; j++) { const v = (a, b) => { const u = a / U * TAU, w = b / W * TAU; return [(R + r * Math.cos(w)) * Math.cos(u), (R + r * Math.cos(w)) * Math.sin(u), r * Math.sin(w) / .16, Math.cos(w) * Math.cos(u), Math.cos(w) * Math.sin(u), Math.sin(w)]; };
        const P = [v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1)]; for (const q of [0, 1, 2, 0, 2, 3]) { const w = P[q]; o.push(w[0], w[1], w[2], w[3], w[4], w[5], 0, 0); } }
      M.tor = o; }
    { const o = []; const E = [[.5, 0], [0, .5], [-.5, 0], [0, -.5]]; // oct: a crystal, two pyramids (z 0..1)
      for (let i = 0; i < 4; i++) { const a = E[i], b = E[(i + 1) % 4]; for (const [tz, sg] of [[1, 1], [0, -1]]) { const nx = (a[0] + b[0]), ny = (a[1] + b[1]), l = Math.hypot(nx, ny, .5), N = [nx / l, ny / l, sg * .5 / l];
        const T = sg > 0 ? [[a[0], a[1], .5], [b[0], b[1], .5], [0, 0, tz]] : [[b[0], b[1], .5], [a[0], a[1], .5], [0, 0, tz]]; for (const p of T) o.push(p[0], p[1], p[2], N[0], N[1], N[2], 0, 0); } }
      M.oct = o; }
  },
  /* a box from point a to point b (a limb, a strut, a barrel): w = thickness; the box's height axis follows the line */
  seg(ax, ay, az, bx, by, bz, w, col, em, m) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz); if (L < .01) return; const h = Math.hypot(dx, dy);
    this.add(m || 'box', ax, ay, az, h > .001 ? Math.atan2(dx, -dy) : 0, w, w, L, col, em, 0, Math.acos(clamp(dz / L, -1, 1)));
  },
  /* ---- static layers: geometry built once and drawn with an offset (the city, the track bed, the sleepers) ---- */
  layers: {}, lq: [],
  layer(name, key, build) { // (re)build a layer when its key changes
    let Ly = this.layers[name]; if (Ly && Ly.key === key) return Ly;
    const A = this.bf.A, n0 = A.n, mir = this.mir; this.mir = false; build(); this.mir = mir;
    const data = A.d.slice(n0 * this.VS, A.n * this.VS), n = A.n - n0; A.n = n0;
    const gl = this.gl; if (!Ly) Ly = this.layers[name] = { vb: gl.createBuffer() }; Ly.key = key; Ly.n = n;
    gl.bindBuffer(gl.ARRAY_BUFFER, Ly.vb); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return Ly;
  },
  drawLayer(name, ox, oy) { if (this.layers[name]) this.lq.push(name, ox || 0, oy || 0); },
  /* ---- batching ---- */
  begin() { for (const k in this.bf) this.bf[k].n = 0; this.L.length = 0; this.lq.length = 0; this.tgt = 'A'; this.mir = false; },
  /* add a mesh: position (x, y, z=height), yaw, scale (sx, sy, sz), color [r,g,b], emissive 0..1, uv region, pitch */
  add(m, x, y, z, yaw, sx, sy, sz, col, em, reg, pitch) {
    const V = this.M[m]; if (!V) return; const n = V.length / 8, Bf = this.bf[this.tgt]; if ((Bf.n + n) >= Bf.cap) return;
    const R = this.mir && this.wet > 0 && z > -2 ? this.bf.R : null, rr = R && (R.n + n) < R.cap;
    const A = Bf.d, VS = this.VS; let o = Bf.n * VS, o2 = rr ? R.n * VS : 0; const D = rr ? R.d : null, c = Math.cos(yaw || 0), s = Math.sin(yaw || 0), r = col[0], g = col[1], b = col[2], U = this.REG[reg | 0] || this.REG[0];
    const ua = U[0], ub = U[1], va = U[2], vb = U[3], pc = pitch ? Math.cos(pitch) : 1, ps = pitch ? Math.sin(pitch) : 0, rp = this.rip, rt = this.t * 4;
    for (let i = 0; i < n; i++) { const q = i * 8; let lx = V[q] * sx, ly = V[q + 1] * sy, lz = V[q + 2] * sz, nx = V[q + 3], ny = V[q + 4], nz = V[q + 5];
      if (pitch) { const ly2 = ly * pc - lz * ps, lz2 = ly * ps + lz * pc; ly = ly2; lz = lz2; const ny2 = ny * pc - nz * ps, nz2 = ny * ps + nz * pc; ny = ny2; nz = nz2; }
      const wx = x + lx * c - ly * s, wy = y + lx * s + ly * c, wz = z + lz, wnx = nx * c - ny * s, wny = nx * s + ny * c, u = ua + V[q + 6] * (ub - ua), v = va + V[q + 7] * (vb - va);
      A[o] = wx; A[o + 1] = wy; A[o + 2] = wz; A[o + 3] = wnx; A[o + 4] = wny; A[o + 5] = nz; A[o + 6] = r; A[o + 7] = g; A[o + 8] = b; A[o + 9] = 1; A[o + 10] = em || 0; A[o + 11] = u; A[o + 12] = v; o += VS;
      if (rr) { D[o2] = wx + Math.sin(wy * .08 + rt) * rp; D[o2 + 1] = wy; D[o2 + 2] = -wz; D[o2 + 3] = wnx; D[o2 + 4] = wny; D[o2 + 5] = -nz; D[o2 + 6] = r; D[o2 + 7] = g; D[o2 + 8] = b; D[o2 + 9] = 1; D[o2 + 10] = em || 0; D[o2 + 11] = u; D[o2 + 12] = v; o2 += VS; } }
    Bf.n += n; if (rr) R.n += n;
  },
  /* additive quad vertices */
  putB(Bf, x, y, z, col, a, u, v) { const B = Bf.d, o = Bf.n * this.VS; B[o] = x; B[o + 1] = y; B[o + 2] = z; B[o + 3] = 0; B[o + 4] = 0; B[o + 5] = 1; B[o + 6] = col[0]; B[o + 7] = col[1]; B[o + 8] = col[2]; B[o + 9] = a; B[o + 10] = 0; B[o + 11] = u; B[o + 12] = v; Bf.n++; },
  /* a glow sprite facing the camera (additive); mirrored into the wet roof when it is a roof-level light */
  glow(x, y, z, r, col, a, ring) {
    const Bf = this.bf.B; if (Bf.n + 6 >= Bf.cap) return;
    const k = this.k, s = this.s, cy = this.cy, sy = this.sy, u0 = ring ? .5 : 0, u1 = ring ? 1 : .5, BR = this.mir && this.wet > 0 && this.bf.BR.n + 6 < this.bf.BR.cap ? this.bf.BR : null;
    for (let gi = 0; gi < 6; gi++) { const G = this.GQ[gi], px = G[0], py = G[1], u = G[2], v = G[3]; // screen x is world (cy, -sy); screen up is world -(sy, cy) * k plus height * s
      const wx = x + px * r * cy - py * r * k * sy, wy = y - px * r * sy - py * r * k * cy, wz = z + py * r * s;
      this.putB(Bf, wx, wy, wz, col, a, u0 + u * (u1 - u0), v);
      if (BR) this.putB(BR, wx, wy, -wz, col, a * .5 * this.wet, u0 + u * (u1 - u0), v); }
  },
  GQ: [[-1, -1, 0, 1], [1, -1, 1, 1], [1, 1, 1, .5], [-1, -1, 0, 1], [1, 1, 1, .5], [-1, 1, 0, .5]],
  /* a flat glow lying on the roof */
  floorGlow(x, y, z, r, col, a) {
    const Bf = this.bf.B; if (Bf.n + 6 >= Bf.cap) return;
    for (let gi = 0; gi < 6; gi++) { const G = this.GQ[gi]; this.putB(Bf, x + G[0] * r, y + G[1] * r, z, col, a, G[2] * .5, G[3]); }
  },
  /* a camera-facing beam between two points, w0 / w1 half widths, a0 / a1 alpha at each end (light shafts, streaks, ribbons) */
  beam(x0, y0, z0, x1, y1, z1, w0, w1, col, a0, a1) { // (no arrays made per call: it runs hundreds of times a frame for rain and sparks)
    const Bf = this.bf.B; if (Bf.n + 6 >= Bf.cap) return; const ex = this.cy, ey = -this.sy;
    const ax = x0 - ex * w0, ay = y0 - ey * w0, bx = x0 + ex * w0, by = y0 + ey * w0, cx2 = x1 + ex * w1, cy2 = y1 + ey * w1, dx = x1 - ex * w1, dy = y1 - ey * w1;
    this.putB(Bf, ax, ay, z0, col, a0, .25, .75); this.putB(Bf, bx, by, z0, col, a0, .25, .75); this.putB(Bf, cx2, cy2, z1, col, a1, .25, .75);
    this.putB(Bf, ax, ay, z0, col, a0, .25, .75); this.putB(Bf, cx2, cy2, z1, col, a1, .25, .75); this.putB(Bf, dx, dy, z1, col, a1, .25, .75);
  },
  /* a moving point light for this frame: position, radius, color, strength (the strongest NL are kept) */
  LP: [], light(x, y, z, r, col, k) { const i = this.L.length; let q = this.LP[i]; if (!q) q = this.LP[i] = new Array(8); q[0] = x; q[1] = y; q[2] = z; q[3] = r; q[4] = col[0] * k; q[5] = col[1] * k; q[6] = col[2] * k; q[7] = k; this.L.push(q); }, // pooled: no arrays per frame
  /* ---- frame size and render targets ---- */
  size() {
    const c = this.cv; if (!c) return; const gd = Math.min(window.devicePixelRatio || 1, resK() || [1.5, 1.75, 2][Q.lvl] || 2), w = Math.round(V.W * gd), h = Math.round(V.H * gd);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } this.rs = w / cv.width; // the 3D layer keeps a sharp resolution of its own
  },
  rt(name, w, h, depth) { // a render target (texture + optional depth), remade when the size changes
    const gl = this.gl; this.RT = this.RT || {}; let r = this.RT[name];
    if (r && r.w === w && r.h === h) return r;
    if (r) { gl.deleteTexture(r.t); gl.deleteFramebuffer(r.f); if (r.d) gl.deleteRenderbuffer(r.d); }
    r = { w, h, t: gl.createTexture(), f: gl.createFramebuffer(), d: null };
    gl.bindTexture(gl.TEXTURE_2D, r.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, r.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, r.t, 0);
    if (depth) { r.d = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, r.d); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, r.d); }
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); throw new Error('render target ' + name); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); this.RT[name] = r; return r;
  },
  bind(P, Bf) { // upload a batch and point the attributes at it
    const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, Bf.vb); gl.bufferData(gl.ARRAY_BUFFER, Bf.d.subarray(0, Bf.n * this.VS), gl.DYNAMIC_DRAW);
    const st = this.VS * 4, a = P.a; gl.enableVertexAttribArray(a.p); gl.vertexAttribPointer(a.p, 3, gl.FLOAT, false, st, 0);
    if (a.n != null && a.n >= 0) { gl.enableVertexAttribArray(a.n); gl.vertexAttribPointer(a.n, 3, gl.FLOAT, false, st, 12); gl.enableVertexAttribArray(a.c); gl.vertexAttribPointer(a.c, 4, gl.FLOAT, false, st, 24); gl.enableVertexAttribArray(a.e); gl.vertexAttribPointer(a.e, 1, gl.FLOAT, false, st, 40); gl.enableVertexAttribArray(a.uv); gl.vertexAttribPointer(a.uv, 2, gl.FLOAT, false, st, 44); }
  },
  quad(P) { const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.qb); for (let i = 0; i < 6; i++) gl.disableVertexAttribArray(i); gl.enableVertexAttribArray(P.a.q); gl.vertexAttribPointer(P.a.q, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 6); },
  smArea() { const C = this.cam, w = V.VW * 1.4 / C.z, h = V.VH * 1.9 / C.z; return [C.x - w / 2, C.y - h * .55, 1 / w, 1 / h]; },
  /* ---- the frame: scene into the screen (no post) or into a render target (post) ---- */
  flush(sky) {
    const gl = this.gl; this.size(); const W = this.cv.width, H = this.cv.height, P = this.P, U = this.pr.u;
    for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
    // shadow map
    const smo = this.smArea(), ld = [.42, .55];
    if (P.sm && this.bf.A.n) { const S = this.rt('sm', 512, 1024, true); gl.bindFramebuffer(gl.FRAMEBUFFER, S.f); gl.viewport(0, 0, 512, 1024); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.prS.pr); gl.uniform4f(this.prS.u.smo, smo[0], smo[1], smo[2], smo[3]); gl.uniform2f(this.prS.u.ld, ld[0], ld[1]); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.disable(gl.BLEND); gl.depthMask(true);
      this.bind(this.prS, this.bf.A); gl.drawArrays(gl.TRIANGLES, 0, this.bf.A.n); gl.disableVertexAttribArray(this.prS.a.p); }
    const post = P.on; let target = null;
    if (post) target = this.rt('sc', W, H, true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null); gl.viewport(0, 0, W, H);
    gl.clearColor(sky[0], sky[1], sky[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.pr.pr); gl.uniform1f(U.toon, Store.data && Store.data.settings.toon3d !== 0 ? 1 : 0); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(U.tx, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, P.sm && this.RT && this.RT.sm ? this.RT.sm.t : this.tex); gl.uniform1i(U.sm, 1); gl.activeTexture(gl.TEXTURE0);
    const k = V.s * V.dpr; gl.uniform2f(U.scr, cv.width / k, cv.height / k); { const o = typeof W3D !== 'undefined' ? W3D.lb() : [0, 0]; gl.uniform2f(U.ctr, V.VW / 2 + o[0] / V.s, V.VH / 2 + o[1] / V.s); } // a replay's letterbox
    gl.uniform4f(U.cam, this.cam.x, this.cam.y, this.cam.z, this.cam.offY); gl.uniform2f(U.ks, this.k, this.s); gl.uniform2f(U.yw, this.cy, this.sy);
    gl.uniform4f(U.smo, smo[0], smo[1], smo[2], smo[3]); gl.uniform2f(U.ld, ld[0], ld[1]); gl.uniform1f(U.smOn, P.sm ? 1 : 0); gl.uniform2f(U.smT, 1.2 / 512, 1.2 / 1024);
    gl.uniform3f(U.fog, sky[0], sky[1], sky[2]); gl.uniform4f(U.lt, -.45, .35, .82, .34); gl.uniform1f(U.wet, this.wet); gl.uniform1f(U.lmul, this.lmul);
    gl.uniform3f(U.vv, this.sy * this.s, this.cy * this.s, this.k); gl.uniform3f(U.off, 0, 0, 0);
    // lights: the strongest NL
    const Ls = this.L.sort((a, b) => b[7] - a[7]), nl = Math.min(Ls.length, this.NL, this.nlMax || this.NL);
    for (let i = 0; i < nl; i++) { const q = Ls[i], A = this.lpA, C = this.lcA; A[i * 4] = q[0]; A[i * 4 + 1] = q[1]; A[i * 4 + 2] = q[2]; A[i * 4 + 3] = q[3]; C[i * 3] = q[4]; C[i * 3 + 1] = q[5]; C[i * 3 + 2] = q[6]; }
    gl.uniform4fv(U.lp, this.lpA); gl.uniform3fv(U.lc, this.lcA); gl.uniform1f(U.nl, nl);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    const draw = (name, add, tp) => { const Bf = this.bf[name]; if (!Bf.n) return; gl.uniform1f(U.add, add); gl.uniform1f(U.tp, tp); this.bind(this.pr, Bf); gl.drawArrays(gl.TRIANGLES, 0, Bf.n); };
    gl.disable(gl.BLEND); gl.depthMask(true);
    if (this.wet > 0) { draw('R', 0, 0); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false); draw('BR', 1, 0); gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); draw('T', 0, 1); gl.disable(gl.BLEND); }
    draw('A', 0, 0);
    if (this.lq.length) { gl.uniform1f(U.add, 0); gl.uniform1f(U.tp, 0); const st = this.VS * 4, a = this.pr.a;
      for (let i = 0; i < this.lq.length; i += 3) { const Ly = this.layers[this.lq[i]]; if (!Ly || !Ly.n) continue; gl.uniform3f(U.off, this.lq[i + 1], this.lq[i + 2], 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, Ly.vb); gl.enableVertexAttribArray(a.p); gl.vertexAttribPointer(a.p, 3, gl.FLOAT, false, st, 0); gl.enableVertexAttribArray(a.n); gl.vertexAttribPointer(a.n, 3, gl.FLOAT, false, st, 12); gl.enableVertexAttribArray(a.c); gl.vertexAttribPointer(a.c, 4, gl.FLOAT, false, st, 24); gl.enableVertexAttribArray(a.e); gl.vertexAttribPointer(a.e, 1, gl.FLOAT, false, st, 40); gl.enableVertexAttribArray(a.uv); gl.vertexAttribPointer(a.uv, 2, gl.FLOAT, false, st, 44);
        gl.drawArrays(gl.TRIANGLES, 0, Ly.n); }
      gl.uniform3f(U.off, 0, 0, 0); }
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false); draw('B', 1, 0); gl.depthMask(true); gl.disable(gl.BLEND);
    for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
    this.posted = !post; // without post the frame is already on the screen
  },
  /* post: called after the 2D layer is drawn (ULTRA takes it in too) */
  post() {
    if (this.posted || !this.RT || !this.RT.sc) return; this.posted = true;
    const gl = this.gl, P = this.P, sc = this.RT.sc, W = sc.w, H = sc.h;
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.disable(gl.BLEND);
    // bloom: bright parts at a quarter size, blurred; a wider eighth-size pass on top quality
    const b1 = this.rt('b1', Math.max(8, W >> 2), Math.max(8, H >> 2)), b1b = this.rt('b1b', b1.w, b1.h);
    const pass = (prog, src, dst, set) => { gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.f : null); gl.viewport(0, 0, dst ? dst.w : this.cv.width, dst ? dst.h : this.cv.height); gl.useProgram(prog.pr); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform1i(prog.u.sc, 0); if (set) set(prog.u); this.quad(prog); };
    if (P.bloom > 0) {
      pass(this.prB, sc, b1, u => { gl.uniform2f(u.px, 1 / W, 1 / H); gl.uniform1f(u.thr, .5); });
      for (let i = 0; i < 2; i++) { pass(this.prBl, b1, b1b, u => gl.uniform2f(u.dir, 1 / b1.w, 0)); pass(this.prBl, b1b, b1, u => gl.uniform2f(u.dir, 0, 1 / b1.h)); }
    }
    let b2 = b1; if (P.bloom > 1) { b2 = this.rt('b2', Math.max(4, W >> 3), Math.max(4, H >> 3)); const b2b = this.rt('b2b', b2.w, b2.h);
      pass(this.prBl, b1, b2, u => gl.uniform2f(u.dir, .5 / b1.w, .5 / b1.h)); pass(this.prBl, b2, b2b, u => gl.uniform2f(u.dir, 1 / b2.w, 0)); pass(this.prBl, b2b, b2, u => gl.uniform2f(u.dir, 0, 1 / b2.h)); }
    if (P.ultra) { // the 2D layer, premultiplied, over the 3D scene (after the bloom pass, so text and HUD stay crisp)
      const t = this.t2 || (this.t2 = gl.createTexture()); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, sc.f); gl.viewport(0, 0, W, H); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(this.prU.pr); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(this.prU.u.sc, 0); this.quad(this.prU); gl.disable(gl.BLEND); }
    const G0 = P.grade || { t: [1, 1, 1], l: [0, 0, 0], s: 1, c: 1 };
    pass(this.prC, sc, null, u => {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b1.t); gl.uniform1i(u.b1, 1); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, b2.t); gl.uniform1i(u.b2, 2); gl.activeTexture(gl.TEXTURE0);
      gl.uniform2f(u.px, 1 / W, 1 / H); gl.uniform1f(u.bi, P.bloom > 0 ? .95 : 0); gl.uniform1f(u.bi2, P.bloom > 1 ? .6 : 0); gl.uniform1f(u.vig, P.vig); gl.uniform1f(u.grain, P.grain); gl.uniform1f(u.ca, P.ca);
      gl.uniform1f(u.tm, (this.t % 100)); gl.uniform1f(u.haze, P.haze); gl.uniform1f(u.mbS, P.mb); gl.uniform2f(u.mbC, P.mbC[0], P.mbC[1]);
      gl.uniform3f(u.gT, G0.t[0], G0.t[1], G0.t[2]); gl.uniform3f(u.gL, G0.l[0], G0.l[1], G0.l[2]); gl.uniform1f(u.gS, G0.s); gl.uniform1f(u.gC, G0.c); gl.uniform1f(u.fxaa, P.fxaa);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.depthMask(true);
  }
};
function rgb3(hex) { // '#rrggbb' to [r,g,b] in 0..1 (cached)
  let c = rgb3.c[hex]; if (c) return c; const h = (hex || '#ffffff').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(q => q + q).join('') : h.slice(0, 6), 16) || 0;
  c = [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; rgb3.c[hex] = c; return c;
}
rgb3.c = {};
