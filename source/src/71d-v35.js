/* =====================================================================
   VERSION 35 — PRESENTATION PACK. Drawing and sound only; the simulation,
   replays and leaderboards do not change.
   ===================================================================== */
/* ---- character voices: story dialogue is read aloud, a voice per character ---- */
const Voices = {
  list: [], lang: '',
  on() { const s = Store.data && Store.data.settings; return !!(s && s.cvoice !== 0) && typeof speechSynthesis !== 'undefined' && !Aud.quiet; },
  code() { return { he: 'he', ar: 'ar', ru: 'ru' }[LANG.id] || 'en'; },
  load() { try { const all = speechSynthesis.getVoices() || [], c = this.code(); this.list = all.filter(v => (v.lang || '').toLowerCase().startsWith(c)); this.lang = c; } catch (e) { this.list = []; } },
  speak(cid, text) {
    if (!this.on() || !text) return;
    try {
      if (this.lang !== this.code() || !this.list.length) this.load(); if (!this.list.length) return; // no voice for this language on this device: stay silent
      const ch = CHARS[cid] || {}, p = ch.pitch || 200, ai = /\.(EXE|SYS|NULL)$|HYAKKI|RAIJIN|IZANAMI/.test(ch.name || '');
      const u = new SpeechSynthesisUtterance(text.replace(/[*_~]/g, ''));
      let h = 0; for (const k of cid + 'v') h = (h * 31 + k.charCodeAt(0)) | 0; u.voice = this.list[Math.abs(h) % this.list.length]; u.lang = u.voice.lang;
      u.pitch = clamp(.35 + (p - 40) / 420 * 1.3, .2, 1.8); u.rate = ai ? .86 : p > 400 ? 1.12 : 1; u.volume = clamp(.75 * (Store.data.settings.sfx || .8), 0, 1);
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { errLog(e); }
  },
  stop() { try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) { } }
};
try { if (typeof speechSynthesis !== 'undefined' && speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', () => Voices.load()); } catch (e) { }
{ const l0 = Dlg.load.bind(Dlg); Dlg.load = function () { l0(); const ln = this.lines && this.lines[this.i]; Voices.speak(this.cid, this.text, ln && ln[1]); };
  const e0 = Dlg.end.bind(Dlg); Dlg.end = function () { Voices.stop(); e0(); }; }

/* ---- the camera leans a little toward where you aim ---- */
const Lean = { x: 0, y: 0,
  tick(rd) {
    let tx = 0, ty = 0; const s = Store.data && Store.data.settings;
    if (s && s.lean !== 0 && !CALM && G.state === 'PLAY' && !REPLAY.on && In.on) { const dx = In.cx - In.sx, dy = In.cy - In.sy, d = Math.hypot(dx, dy); if (d > 8) { tx = -dx / d * 14; ty = -dy / d * 14; } }
    const k = 1 - Math.exp(-rd * (In.on ? 6 : 4)); this.x += (tx - this.x) * k; this.y += (ty - this.y) * k;
  }
};
{ const cu0 = camUpdate; camUpdate = function (rd) { cu0(rd); Lean.tick(rd); CAM.ox += Lean.x; CAM.oy += Lean.y; };
  const ps0 = In.pos.bind(In); In.pos = function (e) { ps0(e); if (!W3D.live) { this.px -= Lean.x; this.py -= Lean.y; } }; }

/* ---- which way the hit came from: a red arc around the hero ---- */
const HitDir = { a: [],
  find() { let best = null, bd = 1e9; for (let i = 0; i < BU.n; i++) { const b = BU.a[i]; if (!b.alive || b.rf) continue; const d = dist(b.x, b.y, P.x, P.y); if (d < bd) { bd = d; best = b; } }
    for (let i = 0; i < EN.n; i++) { const e = EN.a[i]; if (!e.alive || e.al > 0) continue; const d = dist(e.x, e.y, P.x, P.y) - e.r; if (d < bd) { bd = d; best = e; } }
    const B = Boss.cur; if (B && dist(B.x, B.y, P.x, P.y) - B.r < bd) best = B; return best; },
  draw(rd) {
    if (!this.a.length) return; const k = V.s * V.dpr; let q = W3D.proj(P.x, P.y, 20); const x = q[0] / k, y = q[1] / k;
    cx.save(); cx.lineCap = 'round';
    for (const h of this.a) { h.t += rd; const u = h.t / 1.1; cx.globalAlpha = (1 - u) * .9; cx.strokeStyle = '#ff2a3d'; cx.lineWidth = 7 * (1 - u) + 2; cx.shadowColor = '#ff0844'; cx.shadowBlur = 12;
      const r = 58 + u * 10; cx.beginPath(); cx.arc(x, y, r, h.ang - .55, h.ang + .55); cx.stroke(); }
    cx.restore(); this.a = this.a.filter(h => h.t < 1.1);
  }
};
{ const h0 = hurt; hurt = function (src, who) { const hp = P.hp, o = G.state === 'PLAY' ? HitDir.find() : null; const r = h0(src, who); if (o && P.hp < hp && !REPLAY.fast) HitDir.a.push({ ang: Math.atan2(o.y - P.y, o.x - P.x), t: 0 }); return r; }; }

/* ---- stage clear: the camera swoops in on the hero (no slow motion) ---- */
const ClearCam = { won: false,
  tick() { const w = !!G.won && inRun(); if (w && !this.won && !CALM && !REPLAY.on) { CAM.finD = 1.5; CAM.fin = 1.5; CAM.fx = P.x; CAM.fy = P.y; if (Store.data.settings.voice) Aud.say('Stage clear', 1); } this.won = w; }
};

/* ---- the run graph: score and combo over the run, on the results screen ---- */
const RunLog = { s: [], lt: -1, hits: 0,
  tick() {
    if (G.state !== 'PLAY' || REPLAY.on) return; const t = G.time || 0;
    if (t < this.lt - .5 || this.lt < 0) { this.s = []; this.hits = G.hits | 0; this.lt = -1; }
    if (t - this.lt >= .5) { this.s.push([t, G.score | 0, G.combo | 0, (G.hits | 0) > this.hits ? 1 : 0]); this.hits = G.hits | 0; this.lt = t; if (this.s.length > 2400) this.s.splice(0, this.s.length - 2400); }
  },
  draw() {
    const box = $('rsGraphBox'), cvG = $('rsGraph'); if (!box || !cvG) return; const s = this.s;
    if (s.length < 6) { box.classList.add('hidden'); return; } box.classList.remove('hidden');
    const r = cvG.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1), W = Math.max(200, r.width | 0), H = 120; cvG.width = W * d; cvG.height = H * d;
    const g = cvG.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H);
    const t0 = s[0][0], t1 = s[s.length - 1][0] || 1, mS = Math.max(1, s[s.length - 1][1]), mC = Math.max(5, ...s.map(q => q[2])), X = t => 4 + (t - t0) / Math.max(1, t1 - t0) * (W - 8);
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, H * i / 4); g.lineTo(W, H * i / 4); g.stroke(); }
    g.fillStyle = 'rgba(255,43,214,.55)'; for (const q of s) { const h = q[2] / mC * (H - 20); g.fillRect(X(q[0]) - 1, H - h, 2, h); }
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(0,242,254,.35)'); gr.addColorStop(1, 'rgba(0,242,254,0)');
    g.beginPath(); g.moveTo(X(s[0][0]), H); for (const q of s) g.lineTo(X(q[0]), H - 6 - q[1] / mS * (H - 16)); g.lineTo(X(s[s.length - 1][0]), H); g.closePath(); g.fillStyle = gr; g.fill();
    g.beginPath(); s.forEach((q, i) => { const x = X(q[0]), y = H - 6 - q[1] / mS * (H - 16); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.strokeStyle = '#00f2fe'; g.lineWidth = 2; g.shadowColor = '#00f2fe'; g.shadowBlur = 8; g.stroke(); g.shadowBlur = 0;
    g.fillStyle = '#ff3b5c'; for (const q of s) if (q[3]) { g.beginPath(); g.moveTo(X(q[0]), 2); g.lineTo(X(q[0]) + 4, 10); g.lineTo(X(q[0]) - 4, 10); g.fill(); }
    const peak = s.reduce((a, q) => q[2] > a[2] ? q : a, s[0]); g.fillStyle = '#ffd23f'; g.font = '700 10px ' + FONT_M; g.textAlign = 'center'; g.fillText('x' + peak[2], clamp(X(peak[0]), 14, W - 14), H - peak[2] / mC * (H - 20) - 4);
    $('rsGraphKey').textContent = lt('Blue: score. Pink: combo. Red marks: hits taken.');
  }
};
{ const or0 = UI.openResult.bind(UI); UI.openResult = function (o) { or0(o); try { requestAnimationFrame(() => RunLog.draw()); } catch (e) { errLog(e); } }; }

/* ---- the last shield: a heartbeat you can hear ---- */
const Heart = { t: 0,
  tick(rd) { const s = Store.data.settings; if (G.state !== 'PLAY' || P.hp !== 1 || REPLAY.on || s.hb === 0 || Aud.quiet || G.mode === 'dojo') { this.t = 0; return; }
    this.t -= rd; if (this.t > 0) return; this.t = .9;
    try { Aud.tone(64, 42, .11, .32, 'sine'); setTimeout(() => { if (G.state === 'PLAY' && P.hp === 1) Aud.tone(58, 40, .1, .22, 'sine'); }, 170); } catch (e) { errLog(e); } }
};

/* ---- high-contrast enemies (accessibility): a bright outline on every enemy ---- */
{ const de0 = drawEnemy; drawEnemy = function (e) { de0(e); const s = Store.data.settings; if (s.hc && e.alive && (EDRAW & ED_BODY) && !W3D.live && e.vis > .3) { const r = e.r * (e.scale || 1) + 4; cx.save(); cx.lineWidth = 4; cx.strokeStyle = '#05060f'; cx.beginPath(); cx.arc(e.x, e.y, r, 0, TAU); cx.stroke(); cx.lineWidth = 2; cx.strokeStyle = e.type === ET.BOMBER ? '#ffd23f' : '#ffffff'; cx.stroke(); cx.restore(); } }; }

/* ---- performance overlay (Show FPS on a computer): frame times, 1% low ---- */
const Perf = { ft: new Float32Array(180), i: 0,
  tick(rd) { this.ft[this.i] = rd * 1000; this.i = (this.i + 1) % this.ft.length; },
  draw() {
    const s = Store.data.settings; if (!s.fps || !PC.isPC) return; const a = Array.from(this.ft).filter(v => v > 0); if (a.length < 20) return;
    const sorted = a.slice().sort((p, q) => q - p), low = 1000 / sorted[Math.max(0, Math.floor(a.length * .01))], avg = 1000 / (a.reduce((p, q) => p + q, 0) / a.length);
    const W = 150, H = 40, x0 = V.VW - W - 12 - V.insR, y0 = V.VH - UI.dockH / V.s - H - 14;
    cx.save(); cx.globalAlpha = .9; cx.fillStyle = 'rgba(5,6,15,.75)'; cx.fillRect(x0, y0, W, H); cx.strokeStyle = 'rgba(0,242,254,.4)'; cx.strokeRect(x0 + .5, y0 + .5, W - 1, H - 1);
    const n = this.ft.length; cx.beginPath(); for (let k = 0; k < n; k++) { const v = this.ft[(this.i + k) % n], y = y0 + H - 4 - Math.min(1, v / 33.4) * (H - 16); const x = x0 + 2 + k / (n - 1) * (W - 4); if (k) cx.lineTo(x, y); else cx.moveTo(x, y); }
    cx.strokeStyle = '#00ff88'; cx.lineWidth = 1; cx.stroke();
    cx.font = '700 9px ' + FONT_M; cx.textAlign = 'left'; cx.fillStyle = '#e8fbff'; cx.fillText(Math.round(avg) + ' FPS · 1% ' + Math.round(low) + ' · ' + (1000 / avg).toFixed(1) + ' ms', x0 + 5, y0 + 11); cx.restore();
  }
};

/* ---- announcer: boss down ---- */
const Announce = { bd: false, tick() { const b = Boss.cur, d = !!(b && b.dying > 0); if (d && !this.bd && Store.data.settings.voice && !REPLAY.fast) Aud.say('Target down', 1); this.bd = d; } };

{ const hd1 = HUD.draw.bind(HUD); HUD.draw = function (rd) { hd1(rd); HitDir.draw(rd); Perf.draw(); }; }
{ const pt0 = PC.tick.bind(PC); PC.tick = function (rd) { pt0(rd); Perf.tick(rd); RunLog.tick(); ClearCam.tick(); Heart.tick(rd); Announce.tick(); }; }
{ const ps1 = PC.settings.bind(PC); PC.settings = function (head, cycle, box, s) {
    head('PRESENTATION');
    cycle('Character voices', 'cvoice', [1, 2, 0], ['ON', 'SYNTH', 'OFF']); cycle('Camera follows your aim', 'lean', [1, 0], ['ON', 'OFF']);
    cycle('Heartbeat on the last shield', 'hb', [1, 0], ['ON', 'OFF']); cycle('High-contrast enemies', 'hc', [0, 1], ['OFF', 'ON']);
    box.appendChild(el('div', 'small mute', lt('Character voices use the voices installed on your device, in the game\'s language.')));
    ps1(head, cycle, box, s); }; }