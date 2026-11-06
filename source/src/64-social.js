/* =====================================================================
   SOCIAL — ghost replays of a rival's best run, rival alerts, share card,
   in-game bug reports, anonymous play stats and the owner-only creator
   dashboard. Everything degrades quietly when the cloud is unavailable.
   db paths: ghosts/<id> (all read, own write) · feedback/<id> and
   stats/<id> (own write, only the artifact owner reads them all)
   ===================================================================== */
const SHARE_URL = 'https://claude.ai/artifact/U18tohBnWQgGaNoNG2fcjs';
const GHOST_MODES = { tower: 1, endless: 1, timeattack: 1, bossrush: 1, arena: 1, highway: 1, mayhem: 1, daily: 1, weekly: 1 };
let LAST_ERR = '';
/* ---------------- ghosts ---------------- */
const Ghost = {
  rec: null, play: null, playOn: false, cap: 3000, wasAhead: null, pt: { x: 0, y: 0, vx: 0, vy: 0 },
  begin(mode) {
    if (REPLAY.on) { this.rec = null; this.playOn = false; this.wasAhead = null; return; }
    this.rec = GHOST_MODES[mode] ? { pos: new Uint8Array(this.cap * 2), n: 0, sc: [], acc: 0, sacc: 0 } : null;
    const ch = Store.data.chal; this.wasAhead = null;
    this.playOn = !!(this.play && ch && ch.m === mode && this.play.mode === mode && this.play.id === ch.id);
  },
  update(dt) {
    const r = this.rec; if (!r) return;
    r.acc += dt; if (r.acc >= .2 && r.n < this.cap) { r.acc -= .2; r.pos[r.n * 2] = clamp(((P.x - V.L0) / V.AW * 250) | 0, 0, 250); r.pos[r.n * 2 + 1] = clamp((P.y / V.VH * 250) | 0, 0, 250); r.n++; }
    r.sacc += dt; if (r.sacc >= 1) { r.sacc -= 1; if (r.sc.length < 900) r.sc.push(ii(G.score)); }
    if (this.playOn && G.time > 12) { const ahead = G.score >= this.scoreAt(G.time); if (ahead !== this.wasAhead) { if (this.wasAhead !== null) Comms.say(ahead ? 'ghostAhead' : 'ghostBehind'); this.wasAhead = ahead; } }
  },
  async autoRival(mode) { // no challenge picked: race the ghost of the player just above your best
    const f = { endless: 'bestStd', timeattack: 'bestTa', bossrush: 'bestBr', arena: 'bestAr', highway: 'bestHw', tower: 'bestTw', mayhem: 'bestMay' }[mode];
    if (!f || !Cloud.ready || REPLAY.on || !Store.data.settings.rival) return;
    const mine = (Store.data.best[mode] | 0); let rows = null; try { rows = await Cloud.top(f); } catch (e) { return; }
    let pick = null; for (const r of rows || []) { if (r.me || !r.id) continue; const sc = ii(r[f]); if (sc > mine && (!pick || sc < ii(pick[f]))) pick = r; }
    if (!pick || G.state !== 'PLAY' || G.mode !== mode || this.playOn) return;
    const ok = await this.fetch(pick.id, mode, pick.name); if (!ok || G.state !== 'PLAY' || G.mode !== mode || this.playOn) return;
    this.playOn = true; this.wasAhead = null; toast(ltf('AUTO-RIVAL GHOST ACTIVE: {0}', pick.name || 'Player'), '#ff4fd8');
  },
  scoreAt(t) { const p = this.play; if (!p || !p.sc.length) return 0; return p.sc[clamp(Math.floor(t), 0, p.sc.length - 1)] | 0; },
  posAt(t) {
    const p = this.play, f = t / .2, i = Math.floor(f); if (!p || i < 0 || i >= p.n - 1) return null;
    const k = f - i, a = p.pos, x1 = a[i * 2], y1 = a[i * 2 + 1], x2 = a[i * 2 + 2], y2 = a[i * 2 + 3], o = this.pt;
    o.x = V.L0 + lerp(x1, x2, k) / 250 * V.AW; o.y = lerp(y1, y2, k) / 250 * V.VH; o.vx = (x2 - x1) / 250 * V.AW / .2; o.vy = (y2 - y1) / 250 * V.VH / .2;
    return o;
  },
  draw() {
    if (!this.playOn || G.mode !== this.play.mode) return;
    const q = this.posAt(G.time); if (!q) return;
    const sp = Math.hypot(q.vx, q.vy), o = HO; heroSetSkin(o, skinOf(this.play.sk));
    o.x = q.x; o.y = q.y; o.mvA = o.face = sp > 20 ? Math.atan2(q.vy, q.vx) : -Math.PI / 2; o.spd = Math.min(sp, 480); o.ph = G.time * 14; o.sx = o.sy = 1;
    o.dashing = sp > 700; o.blade = o.face + 1.8; o.alpha = .33; o.w = 'katana'; o.fx = bladeOf(this.play.bf); o.bl = 52; o.t = CAM.t; o.hot = o.od = 0;
    drawHero(o);
    cx.globalAlpha = .7; cx.font = '700 10px ' + FONT_D; cx.textAlign = 'center'; cx.fillStyle = '#ff4fd8'; cx.fillText(ltf('{0} (GHOST)', this.play.name.toUpperCase()), q.x, q.y - 30); cx.globalAlpha = 1;
  },
  hud(x0) {
    if (!this.playOn) return;
    const gs = this.scoreAt(G.time), df = G.score - gs, up = df >= 0;
    if (this.hk !== df) { this.hk = df; this.hs = ltf('GHOST {0} {1}', this.play.name.toUpperCase(), (up ? '+' : '-') + fmtNum(Math.abs(df))); }
    cx.textAlign = 'left'; cx.font = '700 11px ' + FONT_M; cx.fillStyle = up ? '#00ff88' : '#ff3b5c'; cx.fillText(this.hs, x0, 136);
  },
  enc(u8) { let s = ''; for (let i = 0; i < u8.length; i += 4096) s += String.fromCharCode.apply(null, u8.subarray(i, i + 4096)); return btoa(s); },
  dec(b64) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; },
  async upload(mode, score) { // personal best -> everyone can race your ghost
    const r = this.rec; if (!r || r.n < 10 || !Cloud.ready || Cloud.readOnly || G.assist) return;
    const data = { v: 1, s: ii(score), d: Math.round(G.time), sk: Store.data.skin, bf: Store.data.blade, p: this.enc(r.pos.subarray(0, r.n * 2)), sc: r.sc.slice(0, 900), at: Date.now() };
    const ref = Cloud.db.doc('ghosts/' + Cloud.uid), body = {}; body[mode] = data;
    try { await ref.update(body); } catch (e) { try { await ref.set(body); } catch (e2) { errLog(e2); } }
  },
  async fetch(uid, mode, name) {
    if (!Cloud.ready || !uid) return false;
    try {
      const s = await Cloud.db.doc('ghosts/' + uid).get(); if (!s.exists) return false;
      const g = (s.data() || {})[mode]; if (!g || typeof g.p !== 'string') return false;
      const pos = this.dec(g.p);
      this.play = { id: uid, name: name || 'Player', mode, pos, n: pos.length >> 1, sc: Array.isArray(g.sc) ? g.sc : [], sk: g.sk, bf: g.bf, s: ii(g.s) };
      const ch = Store.data.chal; if (G.state === 'PLAY' && G.mode === mode && ch && ch.id === uid) this.playOn = true;
      return true;
    } catch (e) { return false; }
  }
};
/* ---------------- rival alerts ---------------- */
const Rivals = {
  alerts: [],
  async check() {
    if (!Cloud.ready) return;
    const d = Store.data, boards = [['bestStd', 'endless', d.best.endless], ['bestTa', 'timeattack', d.best.timeattack], ['bestBr', 'bossrush', d.best.bossrush], ['bestAr', 'arena', d.best.arena | 0], ['bestHw', 'highway', d.best.highway | 0], ['bestTw', 'tower', d.best.tower | 0]], out = [];
    for (const b of boards) {
      const f = b[0], m = b[1], mine = b[2] | 0; if (!mine) continue;
      let rows = null; try { rows = await Cloud.top(f); } catch (e) { continue; }
      const prev = d.rivals[f], next = {};
      for (const r of rows || []) {
        if (r.me) continue; const sc = ii(r[f]); next[r.id] = sc;
        if (prev && sc > mine && (prev[r.id] == null || prev[r.id] <= mine)) out.push({ name: r.name, id: r.id, m, sc, mine });
      }
      d.rivals[f] = next; // the first check only records a baseline
    }
    Store.touch(); this.alerts = out.slice(0, 3);
    if (UI.cur === 'title') UI.renderRivals();
  }
};
/* ---------------- share card ---------------- */
const Share = {
  canvas: null, text: '',
  build(o) {
    const W = 1080, H = 1350, k = document.createElement('canvas'); k.width = W; k.height = H; const g = k.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b1030'); bg.addColorStop(.6, '#22093a'); bg.addColorStop(1, '#05060f'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(0,242,254,.12)'; g.lineWidth = 2; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = '#00f2fe'; g.lineWidth = 6; g.strokeRect(30, 30, W - 60, H - 60); g.strokeStyle = '#ff0844'; g.lineWidth = 3; g.strokeRect(46, 46, W - 92, H - 92);
    g.direction = LANG.rtl ? 'rtl' : 'ltr'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#e8fbff'; g.font = "italic 700 120px 'Chakra Petch', 'Rubik', 'Cairo', sans-serif"; g.fillText('OVERDRIVE', W / 2, 180);
    g.fillStyle = '#ff0844'; g.font = "700 46px 'Chakra Petch', 'Rubik', 'Cairo', sans-serif"; g.fillText('CYBER SLASH', W / 2, 238);
    g.fillStyle = '#00f2fe'; g.font = "700 40px 'Share Tech Mono', 'Rubik', 'Cairo', monospace"; g.fillText(o.sub, W / 2, 300, W - 140);
    withCtx(g, () => { // the player's hero, big, blade raised
      g.save(); g.setTransform(6, 0, 0, 6, W / 2 - 200, 560);
      const h = HO; heroSetSkin(h, skinOf(Store.data.skin)); h.x = 0; h.y = 0; h.face = h.mvA = -Math.PI / 2; h.spd = 0; h.ph = 0; h.sx = h.sy = 1; h.dashing = false; h.blade = -Math.PI / 2 + .75; h.alpha = 1;
      h.w = Store.data.weapon; h.fx = bladeOf(Store.data.blade); h.bl = 46; h.t = 1; h.hot = h.od = 0;
      const sc = new Float32Array(20); for (let i = 0; i < 10; i++) { sc[i * 2] = -i * 3; sc[i * 2 + 1] = 9 + i * 3; } drawHeroTrail(h.body, sc, h.ca, h.cb); // tail sweeps down-left, clear of the score
      drawHero(h); g.restore();
    });
    const R0 = RANKS[o.rank | 0];
    g.fillStyle = R0.c; g.font = "italic 700 230px 'Chakra Petch', sans-serif"; g.fillText(R0.r, W / 2 + 230, 610);
    g.fillStyle = '#8fa4c8'; g.font = "700 34px 'Share Tech Mono', 'Rubik', 'Cairo', monospace"; g.fillText(lt('STYLE RANK'), W / 2 + 230, 662);
    g.font = "700 150px 'Chakra Petch', sans-serif"; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = 'rgba(5,6,15,.85)'; g.strokeText(fmtNum(o.score), W / 2, 845, W - 120);
    g.fillStyle = '#ffd700'; g.fillText(fmtNum(o.score), W / 2, 845, W - 120);
    g.fillStyle = '#8fa4c8'; g.font = "700 36px 'Share Tech Mono', 'Rubik', 'Cairo', monospace"; g.fillText(lt('SCORE'), W / 2, 895);
    o.stats.forEach((s, i) => { const x = W / 2 + (i % 2 ? 230 : -230), y = 985 + ((i / 2) | 0) * 118;
      g.fillStyle = '#8fa4c8'; g.font = "600 38px 'Rajdhani', 'Rubik', 'Cairo', sans-serif"; g.fillText(s[0], x, y, 420);
      g.fillStyle = '#e8fbff'; g.font = "700 50px 'Chakra Petch', 'Rubik', 'Cairo', sans-serif"; g.fillText(s[1], x, y + 54, 420); });
    g.fillStyle = '#ff4fd8'; g.font = "700 50px 'Chakra Petch', 'Rubik', 'Cairo', sans-serif"; g.fillText(lt('CAN YOU BEAT ME?'), W / 2, H - 128, W - 140);
    g.fillStyle = '#8fa4c8'; g.font = "600 30px 'Share Tech Mono', monospace"; g.direction = 'ltr'; g.fillText(SHARE_URL.replace('https://', ''), W / 2, H - 78);
    this.canvas = k;
    this.text = ltf('I scored {0} in OVERDRIVE: CYBER SLASH ({1}). Think you can beat me? {2}', fmtNum(o.score), o.sub, SHARE_URL) + (o.chal ? ' ' + ltf('Same roof, same seed: paste this code in Arcade → Friend challenge: {0}', o.chal) : '');
    return k;
  },
  async save() {
    if (!this.canvas) return 'none';
    const blob = await new Promise(r => this.canvas.toBlob(r, 'image/png')); if (!blob) return 'unavailable';
    const r = await saveFile(blob, 'overdrive-score.png'); return r === 'saved' ? 'saved' : r === 'declined' ? 'declined' : 'unavailable';
  },
  async copy() { try { await navigator.clipboard.writeText(this.text); return true; } catch (e) { return false; } }
};
/* ---------------- feedback + stats ---------------- */
const GH_REPO = 'https://github.com/undertaker132/overdrive-ninja';
const Feedback = {
  info() {
    return { v: VERSION, lang: LANG.id, mode: G.mode || '', stage: G.stage ? G.stage.id : '', diff: G.diff ? G.diff.id : '', t: Math.round(G.time || 0), fps: Math.round(Q.fps || 0), q: Q.lvl,
      dpr: V.dpr, w: Math.round(V.W), h: Math.round(V.H), touch: ('ontouchstart' in window) ? 1 : 0, ua: (navigator.userAgent || '').slice(0, 180), err: LAST_ERR, errs: ERRLOG.a.slice(-5).map(r => r.c + 'x ' + r.m).join(' | ').slice(0, 400) };
  },
  async send(cat, text, withInfo) {
    const item = Object.assign({ ts: Date.now(), cat, text: String(text || '').slice(0, 600) }, withInfo ? this.info() : { v: VERSION });
    if (!Cloud.ready || !Cloud.db || Cloud.readOnly) return { ok: false, item };
    try {
      const ref = Cloud.db.doc('feedback/' + Cloud.uid), s = await ref.get();
      const items = s.exists && Array.isArray((s.data() || {}).items) ? s.data().items.slice(-24) : [];
      items.push(item); await ref.set({ items, n: items.length, last: item.ts });
      return { ok: true, item };
    } catch (e) { return { ok: false, item }; }
  },
  ghUrl(item) { // a ready-made GitHub issue (the standalone app has no cloud to send to)
    const title = '[' + item.cat + '] ' + String(item.text || '').replace(/\s+/g, ' ').slice(0, 70);
    const body = String(item.text || '') + '\n\n---\n```\n' + this.plain(item) + '\n```\n';
    return GH_REPO + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body.slice(0, 3500));
  },
  plain(item) { return 'OVERDRIVE ' + item.v + ' · ' + item.cat + '\n' + item.text + (item.ua ? '\n[' + item.mode + ' ' + item.stage + ' ' + item.diff + ' t=' + item.t + 's fps=' + item.fps + ' ' + item.w + 'x' + item.h + '@' + item.dpr + '] ' + item.ua + (item.err ? '\nERR ' + item.err : '') : ''); }
};
const Stats = {
  busy: false, again: false,
  agg() { const d = Store.data; if (!d.an || typeof d.an !== 'object') d.an = { runs: 0, time: 0, st: {}, md: {} }; return d.an; },
  stage(kind, id, t, cause) { // kind: c(lear) f(ail) q(uit)
    const a = this.agg(), s = a.st[id] || (a.st[id] = { p: 0, c: 0, f: 0, q: 0, t: 0, d: {} });
    s.p++; s[kind]++; s.t += Math.round(t || 0); if (cause) s.d[cause] = (s.d[cause] | 0) + 1; a.runs++; a.time += Math.round(t || 0);
    this.push();
  },
  arcade(m, score, t) { const a = this.agg(), s = a.md[m] || (a.md[m] = { p: 0, best: 0, sum: 0 }); s.p++; s.best = Math.max(s.best, ii(score)); s.sum += ii(score); a.runs++; a.time += Math.round(t || 0); this.push(); },
  async push() {
    if (Store.lock) return;
    Store.touch();
    if (!Store.data.settings.share || !Cloud.ready || !Cloud.db || Cloud.readOnly) return;
    if (this.busy) { this.again = true; return; }
    this.busy = true;
    const a = this.agg();
    try { await Cloud.db.doc('stats/' + Cloud.uid).set({ v: VERSION, runs: a.runs, time: a.time, st: a.st, md: a.md, w: a.w || {}, bs: a.bs || {}, pk: a.pk || {}, po: a.po || {}, tf: a.tf || {}, dc: a.dc || {}, lang: LANG.id, dev: ('ontouchstart' in window) ? 'touch' : 'desktop', last: Date.now() }); } catch (e) { errLog(e); }
    this.busy = false; if (this.again) { this.again = false; setTimeout(() => this.push(), 4000); }
  }
};
/* ---------------- creator dashboard (artifact owner only) ---------------- */
const Dash = {
  async load(kind) {
    if (!Cloud.ready || !Cloud.owner) return null;
    try { const q = await Cloud.db.collection(kind).limit(500).get(); return q.docs.map(x => Object.assign({ _id: x.id }, x.data())); } catch (e) { return null; }
  }
};
