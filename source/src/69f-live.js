/* =====================================================================
   LIVE — play with friends who have the game open right now (the
   artifact's `room` capability). A room has a 6-digit code (v32); the host
   picks LIVE RACE (90 s on the same seed, highest score wins) or BOSS
   RAID (one boss with shared health: every hit anyone lands counts).
   Presence carries each player's state, score and position (so friends
   appear as ghosts on your roof); events carry the start, raid damage
   and the kill. Everything received is untrusted and range-checked.
   ===================================================================== */
const LIVE_TOPICS = ['mp.start', 'mp.dmg', 'mp.kill'];
/* room codes (v32): 6 digits, shown as 482 913. Five random digits and a
   check digit (Damm: every single wrong digit and every swap of two
   neighbours is caught before anything is sent). The code itself never
   goes to the server: the room is named by a scrambled key made from it,
   and a room is private (not listed) unless its host opens it. */
const RCODE = {
  T: '0317598642709215486342068713591750983426612304597836742095815869720134894536201794386172052581436790',
  dm(s) { let i = 0; for (const ch of s) i = +this.T[i * 10 + (+ch)]; return i; },
  make() { let n; try { const a = new Uint32Array(1); crypto.getRandomValues(a); n = a[0]; } catch (e) { n = (Math.random() * 4294967296) >>> 0; } const s = String(10000 + n % 90000); return s + this.dm(s); },
  clean(v) { return String(v == null ? '' : v).replace(/[^0-9]/g, '').slice(0, 6); },
  ok(c) { return /^[0-9]{6}$/.test(c) && this.dm(c) === 0; },
  fmt(c) { c = this.clean(c); return c.length > 3 ? c.slice(0, 3) + ' ' + c.slice(3) : c; },
  key(c) { // the room's name on the server: a 64-bit hash of the code, never the code
    const s = 'overdrive-room|' + c; let h1 = 0xdeadbeef ^ 0x51, h2 = 0x41c6ce57 ^ 0x51;
    for (let r = 0; r < 64; r++) for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i) + r; h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  },
  input(inp) { // a code box: digits only, shown as 123 456, the number pad on phones
    inp.maxLength = 7; inp.inputMode = 'numeric'; inp.autocomplete = 'off'; inp.setAttribute('pattern', '[0-9 ]*'); inp.placeholder = '000 000';
    inp.addEventListener('input', () => { const v = this.fmt(inp.value); if (inp.value !== v) inp.value = v; });
  }
};
const Live = {
  room: null, r: null, code: '', key: '', pub: false, host: false, kind: 'race', boss: 'warden', seed: 1, hpMul: 1, n: 1, st: 'off', ready: false,
  peers: [], names: {}, ghosts: {}, dmgOut: 0, dmgIn: 0, myDmg: 0, sendT: 0, presT: 0, startT: 0, killed: false, unsub: [], lobbyRooms: [], err: '',
  async init() {
    if (this.inited) return this.room; this.inited = true;
    try { this.room = window.claude && window.claude.use ? await window.claude.use('room') : null; } catch (e) { this.room = null; }
    if (this.room) { try { this.room.onPeers(ch => { this.lobbyRooms = this.openRooms(ch.peers); this.resolveIds(this.lobbyRooms.map(o => o.by)); if (UI.cur === 'live') UI.renderLive(); }); } catch (e) { errLog(e); } }
    return this.room;
  },
  openRooms(peers) { // rooms other hosts advertise in the shared lobby
    const out = []; for (const p of peers || []) { const o = p.presence && p.presence.open; if (p.sameTab || typeof o !== 'string' || !/^[a-f0-9]{16}$/.test(o)) continue; out.push({ code: o, n: clamp(p.presence.n | 0, 1, 8), kind: p.presence.kind === 'raid' ? 'raid' : 'race', by: p.by }); }
    return out;
  },
  newCode() { return RCODE.make(); },
  async create() { const c = this.newCode(); return this.enter(RCODE.key(c), c, true); },
  async join(code, host) {
    code = RCODE.clean(code); if (code.length !== 6) { this.err = lt('A room code has 6 digits.'); return false; }
    if (!RCODE.ok(code)) { this.err = lt('That code is not right. Check the 6 digits.'); return false; }
    return this.enter(RCODE.key(code), code, host);
  },
  async joinKey(key) { return /^[a-f0-9]{16}$/.test(key) ? this.enter(key, '', false) : false; }, // an open room picked from the list
  async enter(key, code, host) {
    if (!(await this.init())) { this.err = lt('Live play needs the shared game link, signed in.'); return false; }
    await this.leave();
    try { this.r = await this.room.join('od-' + key); } catch (e) { this.r = null; this.err = lt('Could not join that room. Try again in a moment.'); return false; }
    this.code = code; this.key = key; this.host = !!host; this.pub = false; this.st = 'lobby'; this.ready = false; this.err = ''; this.sawHost = false; this.joinT = performance.now();
    clearTimeout(this.migT); this.migT = setTimeout(() => { if (this.r) { this.migrate(); if (UI.cur === 'live') UI.renderLive(); } }, 4200);
    const r = this.r;
    this.unsub.push(r.onPeers(ch => { this.peers = ch.peers; this.resolveNames(); this.migrate(); this.advertise(); if (UI.cur === 'live') UI.renderLive(); }));
    this.unsub.push(r.on('mp.start', m => this.onStart(m)));
    this.unsub.push(r.on('mp.dmg', m => { if (!m.sameTab && G.mode === 'raid' && G.state === 'PLAY') { const d = +(m.data && m.data.d); if (d > 0 && d < 1e6) this.dmgIn += d; } }));
    this.unsub.push(r.on('mp.kill', m => { if (!m.sameTab && (G.mode === 'raid' || this.kind === 'raid')) this.remoteKill(); }));
    this.pres({ v: 1, id: Cloud.uid || '', nm: String((Store.data.user && Store.data.user.name) || '').slice(0, 14), st: 'lobby', host: this.host, rdy: 0, sk: Store.data.skin, kind: this.kind, boss: this.boss, sc: 0, cd: this.host ? code : '' });
    this.advertise();
    return true;
  },
  async leave() {
    for (const u of this.unsub) try { u(); } catch (e) { errLog(e); } this.unsub = [];
    if (this.r) { try { await this.r.leave(); } catch (e) { errLog(e); } } this.r = null; this.code = ''; this.key = ''; this.pub = false; this.host = false; this.st = 'off'; this.peers = []; this.ghosts = {};
    if (this.room && !this.p2p && this.advK !== '{"open":null,"n":null,"kind":null}') { this.advK = '{"open":null,"n":null,"kind":null}'; try { this.room.presence({ open: null, n: null, kind: null }); } catch (e) { errLog(e); } }
  },
  pres(patch) { if (this.r) this.r.presence(patch).catch(() => { }); },
  advertise() { // the open-rooms list: only sent when it changes (room updates arrive many times a second during a run)
    if (!this.room || this.p2p) return; const v = this.pub && this.key && this.amHost() && this.st === 'lobby' ? { open: this.key, n: this.players().length, kind: this.kind } : { open: null, n: null, kind: null }, k = JSON.stringify(v);
    if (k === this.advK) return; this.advK = k; try { this.room.presence(v); } catch (e) { errLog(e); }
  },
  setPub(on) { this.pub = !!on; this.pres({ pub: on ? 1 : 0 }); this.advertise(); },
  roomCode() { // the code to show: yours, or the host's (when you came in from the open list)
    if (this.code) return this.code; const h = this.hostPeer(), c = h && h.presence && RCODE.clean(h.presence.cd); return c && RCODE.ok(c) ? c : '';
  },
  players() { return (this.peers || []).filter(p => p.kind !== 'agent'); },
  me() { return this.players().find(p => p.sameTab); },
  hostPeer() { const ps = this.players().filter(p => p.presence && p.presence.host); ps.sort((a, b) => a.peer < b.peer ? -1 : 1); return ps[0] || null; },
  amHost() { const h = this.hostPeer(); return !!(h ? h.sameTab : this.host); },
  migrate() { // (v32) the host left: the player who joined first takes over, so the room can still start games
    if (!this.code) { const c = this.roomCode(); if (c) this.code = c; } // (keep the code to show it after the host is gone)
    if (this.hostPeer()) { this.sawHost = true; return; }
    if (this.p2p || this.host || (!this.sawHost && performance.now() - this.joinT < 4000)) return; // (just joined: the host's presence may not be here yet)
    const ps = this.players().filter(p => p.presence && p.presence.st); if (!ps.length) return;
    ps.sort((a, b) => a.peer < b.peer ? -1 : 1); if (!ps[0].sameTab) return;
    this.host = true; this.pres({ host: true, cd: this.code || '', kind: this.kind, boss: this.boss }); toastDom(lt('YOU ARE THE HOST NOW'));
  },
  busy() { return this.players().some(p => !p.sameTab && p.presence && p.presence.st === 'play'); }, // someone is still in the last game
  resolveNames() { return this.resolveIds(this.players().map(p => p.by || (p.presence && p.presence.id))); },
  async resolveIds(list) {
    const ids = [...new Set((list || []).filter(id => typeof id === 'string' && id && !(id in this.names)))]; if (!ids.length || !Cloud.u) return;
    for (const id of ids) this.names[id] = ''; // (asked once)
    try { const ps = await Cloud.u.profiles(ids); for (const id of ids) this.names[id] = (ps[id] && ps[id].name) || ''; if (UI.cur === 'live') UI.renderLive(); } catch (e) { errLog(e); }
  },
  nameOf(p) { if (p.sameTab) return lt('YOU'); const id = p.by || (p.presence && p.presence.id); return (id && this.names[id]) || lt('PLAYER'); },
  setReady(on) { this.ready = !!on; this.pres({ rdy: on ? 1 : 0 }); },
  setKind(k, boss) { if (k === 'race' || k === 'raid') this.kind = k; if (BOSS_ORDER.indexOf(boss) >= 0) this.boss = boss; this.pres({ kind: this.kind, boss: this.boss }); this.advertise(); },
  start() { // host: everyone in the room starts in 3 seconds
    if (!this.r || !this.amHost() || this.st !== 'lobby' || this.busy()) return;
    const seed = (Date.now() ^ ((Math.random() * 4294967296) >>> 0)) >>> 0;
    this.r.emit('mp.start', { kind: this.kind, boss: this.boss, seed, n: clamp(this.players().length, 1, 8) }).catch(() => { this.err = lt('Could not start. Check the connection.'); UI.renderLive(); });
  },
  onStart(m) {
    const d = m.data || {}; if ((this.st !== 'lobby' && this.st !== 'done') || G.state === 'PLAY' || G.state === 'PAUSE' || REPLAY.on) return; // (a player still on the results screen comes along)
    const kind = d.kind === 'raid' ? 'raid' : 'race', boss = BOSS_ORDER.indexOf(d.boss) >= 0 ? d.boss : 'warden', seed = (d.seed >>> 0) || 1, n = clamp(d.n | 0, 1, 8);
    this.kind = kind; this.boss = boss; this.seed = seed; this.n = n; this.hpMul = 1 + .6 * (n - 1); this.st = 'count'; this.startT = performance.now() + 3000;
    this.dmgOut = this.dmgIn = this.myDmg = 0; this.killed = false; this.ghosts = {};
    if (UI.cur !== 'live') UI.openLive(); else UI.renderLive();
    clearInterval(this.cdT); this.cdT = setInterval(() => { if (this.st !== 'count') { clearInterval(this.cdT); return; } if (UI.cur === 'live') UI.renderLive(); }, 250); // 3, 2, 1
    setTimeout(() => { clearInterval(this.cdT); if (this.st === 'count' && this.r) this.go(); }, 3000);
  },
  go() {
    this.st = 'play'; this.pres({ st: 'play', sc: 0, x: 500, y: 600, hp: 3, dmg: 0, rdy: 0 }); this.advertise();
    Flow.startArcade(this.kind);
  },
  /* ---- during a run ---- */
  tick(rd) {
    if (!this.r || (G.mode !== 'race' && G.mode !== 'raid')) return;
    this.presT -= rd;
    if (this.presT <= 0 && (G.state === 'PLAY' || G.state === 'PAUSE')) { this.presT = .12; const pr = { st: 'play', sc: ii(G.score), x: Math.round(clamp((P.x - V.L0) / V.AW, 0, 1) * 1000), y: Math.round(clamp(P.y / V.VH, 0, 1) * 1000), hp: P.hp, dmg: Math.round(this.myDmg) }; if (this.extra) Object.assign(pr, this.extra()); this.pres(pr); } // (one update, with the gear and swing from LivePlus)
    if (G.mode === 'raid') { this.sendT -= rd; if (this.sendT <= 0 && this.dmgOut > 0) { this.sendT = .25; const d = Math.round(this.dmgOut * 1000) / 1000; this.dmgOut = 0; this.r.emit('mp.dmg', { d }).catch(() => { }); } }
  },
  bossSync(b) { // called every boss update during a raid
    if (b.lastHp == null) b.lastHp = b.hp;
    const mine = b.lastHp - b.hp; if (mine > 0) { this.dmgOut += mine; this.myDmg += mine; }
    if (this.dmgIn > 0 && b.dying <= 0) { b.hp = Math.max(1, b.hp - this.dmgIn); this.dmgIn = 0; b.fl = Math.max(b.fl, .4); }
    b.lastHp = b.hp;
  },
  bossKilled() { if (this.killed) return; this.killed = true; if (this.r) this.r.emit('mp.kill', {}).catch(() => { }); },
  remoteKill() {
    if (this.st === 'done' && this.kind === 'raid' && !this.win) { // you fell, your friends finished it: the raid is cleared for you too
      this.win = true; const lv = Store.data.live || (Store.data.live = { games: 0, raids: 0 }); lv.raids = (lv.raids | 0) + 1; this.bonus = (this.bonus | 0) + 300; Store.data.credits += 300; Store.touch(); Store.flush();
      this.pres({ st: 'done' }); if (UI.cur === 'live') UI.renderLive(); return;
    }
    if (this.st !== 'play' || G.state !== 'PLAY') return; const b = Boss.cur; this.killed = true; if (b && b.dying <= 0) { b.hp = 0; Boss.kill(b); }
  },
  bossDown() { // the raid boss is gone (anyone's kill)
    if (G.state !== 'PLAY') return; G.state = 'OVER'; In.cancel(); Flow.wakeOff();
    G.cine = { k: 'clear', t: 0, d: 1.6, txt: lt('RAID CLEARED'), col: '#ffd700' }; Aud.sfx('win'); G.banked = false; Flow.bankStats();
    Flow.later(1.8, () => this.finish(true));
  },
  finish(win) { // this player's run is over: wait for the others on the results screen
    this.st = 'done'; this.win = !!win; this.final = ii(G.score);
    const lv = Store.data.live || (Store.data.live = { games: 0, raids: 0 }); lv.games = (lv.games | 0) + 1; if (win && G.mode === 'raid') lv.raids = (lv.raids | 0) + 1;
    this.pres({ st: win ? 'done' : 'dead', sc: this.final, dmg: Math.round(this.myDmg) });
    const d = Store.data, bonus = Math.round(G.score / 500 * G.diff.cred) + (win && G.mode === 'raid' ? 300 : 0); d.credits += bonus; Store.touch(); Store.flush();
    Season.track('live', 1); Season.gain(100);
    this.bonus = bonus; G.state = 'MENU'; UI.openLive();
  },
  again() { this.st = 'lobby'; this.ready = false; this.pres({ st: 'lobby', rdy: 0, sc: 0, dmg: 0 }); this.advertise(); UI.renderLive(); },
  /* friends on your roof */
  drawGhosts(rd) {
    if (!this.r || (G.mode !== 'race' && G.mode !== 'raid')) return;
    for (const p of this.players()) {
      if (p.sameTab || !p.presence || p.presence.st !== 'play') continue;
      const tx = V.L0 + clamp(+p.presence.x || 0, 0, 1000) / 1000 * V.AW, ty = clamp(+p.presence.y || 0, 0, 1000) / 1000 * V.VH;
      const g = this.ghosts[p.peer] || (this.ghosts[p.peer] = { x: tx, y: ty });
      const k = Math.min(1, rd * 12), ox = g.x, oy = g.y; g.x += (tx - g.x) * k; g.y += (ty - g.y) * k;
      const sp = Math.hypot(g.x - ox, g.y - oy) / Math.max(rd, .001), o = HO;
      heroSetSkin(o, skinOf(SKINS.some(s => s.id === p.presence.sk) ? p.presence.sk : 'cyan'));
      o.x = g.x; o.y = g.y; o.face = o.mvA = sp > 30 ? Math.atan2(g.y - oy, g.x - ox) : -Math.PI / 2; o.spd = sp; o.ph = CAM.t * 12; o.sx = o.sy = 1; o.dashing = sp > 600; o.blade = o.face + 1.8; o.alpha = .95; o.w = 'katana'; o.fx = null; o.bl = 46; o.t = CAM.t; o.hot = o.od = 0;
      drawHero(o); // (the name, shields and emote over the friend: LivePlus.after)
    }
  },
  hud(x0) { // live scores under the HUD
    if (!this.r || (G.mode !== 'race' && G.mode !== 'raid')) return;
    const ps = this.players().filter(p => p.presence && p.presence.st);
    const key = G.mode === 'raid' ? 'dmg' : 'sc';
    ps.sort((a, b) => (+b.presence[key] || 0) - (+a.presence[key] || 0));
    cx.textAlign = 'left'; cx.font = '700 11px ' + FONT_M; let y = 124;
    for (const p of ps.slice(0, 4)) {
      const v = p.sameTab ? (key === 'sc' ? ii(G.score) : Math.round(this.myDmg)) : ii(p.presence[key]);
      cx.fillStyle = p.sameTab ? '#00f2fe' : p.presence.st === 'dead' ? '#5d6a8c' : LivePlus.col(p);
      cx.fillText(this.nameOf(p).toUpperCase().slice(0, 10) + ' ' + (key === 'sc' ? fmtNum(v) : ltf('{0} DMG', fmtNum(v * 100))), x0, y); y += 13;
    }
  }
};
/* ---------------- the LIVE screen: rooms, lobby, results ---------------- */
Object.assign(UI, {
  async openLive() {
    if (G.state !== 'MENU') G.state = 'MENU'; this.backFn = null; this.show('live'); Aud.music('menu');
    this.renderLive(); await Live.init(); this.renderLive();
  },
  renderLive() {
    if (this.cur !== 'live') return;
    const box = $('lvBox'); box.textContent = '';
    const head = el('div', 'small mute'); box.appendChild(head);
    if (!Live.room) {
      if (!offlineBuild() && !Live.inited) { head.textContent = lt('Connecting…'); Live.init().then(() => this.renderLive()); return; }
      head.textContent = offlineBuild() ? lt('This copy of the game runs without claude.ai, so live play connects phones directly.') : lt('Live rooms on claude.ai need the shared link, signed in. You can also connect directly:');
      if (P2P.ok()) this.renderP2P(box); else box.appendChild(el('div', 'small mute', lt('This browser cannot connect directly. Try Chrome or Safari.')));
      return;
    }
    if (Live.err) box.appendChild(el('div', 'panel info small gold', Live.err));
    if (!Live.r) { // no room yet: create, join by code, or pick an open room
      head.textContent = lt('Play with friends who have the game open right now. Create a room and send them the code, or join theirs.');
      const c = el('button', 'btn pri', lt('CREATE ROOM')); c.onclick = async () => { Aud.sfx('ui'); Live.err = ''; c.disabled = true; await Live.create(); this.renderLive(); }; box.appendChild(c);
      const row = el('div', 'row'), inp = document.createElement('input'); inp.id = 'lvCode'; inp.className = 'code'; RCODE.input(inp); inp.setAttribute('aria-label', lt('Room code'));
      const j = el('button', 'btn', lt('JOIN')); j.onclick = async () => { Aud.sfx('ui'); Live.err = ''; j.disabled = true; await Live.join(inp.value, false); this.renderLive(); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') j.click(); });
      row.appendChild(inp); row.appendChild(j); box.appendChild(row);
      if (Live.lobbyRooms.length) {
        box.appendChild(el('div', 'eyebrow', lt('OPEN ROOMS')));
        for (const o of Live.lobbyRooms) { const b = el('button', 'item'), hn = (o.by && Live.names[o.by]) || lt('ROOM'); b.appendChild(el('span', 'nm', String(hn).replace(/[<>]/g, '').slice(0, 14) + ' · ' + lt(o.kind === 'raid' ? 'BOSS RAID' : 'LIVE RACE'))); b.appendChild(el('span', 'pr', o.n === 1 ? lt('1 PLAYER') : ltf('{0} PLAYERS', o.n))); b.onclick = async () => { Aud.sfx('ui'); Live.err = ''; await Live.joinKey(o.code); this.renderLive(); }; box.appendChild(b); }
      }
      return;
    }
    const ps = Live.players();
    if (Live.st === 'done') { // results: everyone's scores, live as they finish
      const raid = Live.kind === 'raid', key = raid ? 'dmg' : 'sc';
      head.textContent = ltf('ROOM {0}', RCODE.fmt(Live.roomCode()) || '·');
      box.appendChild(el('h2', '', raid ? (Live.win ? lt('RAID CLEARED') : lt('RAID FAILED')) : lt('RACE RESULTS')));
      const rows = ps.map(p => ({ p, v: p.sameTab ? (raid ? Live.myDmg : Live.final) : +(p.presence && p.presence[key]) || 0, st: p.sameTab ? 'done' : (p.presence && p.presence.st) || '' }));
      rows.sort((a, b) => b.v - a.v);
      rows.forEach((r, i) => { const b = el('div', 'lb-row' + (r.p.sameTab ? ' me' : '')); b.appendChild(el('span', 'rk', '#' + (i + 1))); b.appendChild(el('span', 'nm', this.liveName(r.p) + (r.st === 'play' ? ' · ' + lt('STILL PLAYING') : ''))); b.appendChild(el('span', 'sc', raid ? ltf('{0} DMG', fmtNum(r.v * 100)) : fmtNum(r.v))); box.appendChild(b); });
      box.appendChild(el('div', 'small gold', '+' + fmtNum(Live.bonus | 0) + ' CR'));
      const a = el('button', 'btn pri', lt('BACK TO THE ROOM')); a.onclick = () => { Aud.sfx('ui'); Live.again(); }; box.appendChild(a);
      const l = el('button', 'btn ghost', lt('LEAVE ROOM')); l.onclick = async () => { Aud.sfx('back'); await Live.leave(); this.renderLive(); }; box.appendChild(l);
      return;
    }
    const rc = Live.p2p ? (P2P.rcode || '') : Live.roomCode();
    head.textContent = Live.p2p ? lt('DIRECT LINK') + ' · ' + ltf('{0} connected', Math.max(0, Live.players().length - 1)) : lt('Send this code to your friends.');
    if (rc) { box.appendChild(el('div', 'eyebrow', lt('ROOM CODE'))); const big = el('div', 'roomcode', RCODE.fmt(rc)); big.setAttribute('dir', 'ltr'); box.appendChild(big); this.copyCode(box, rc); }
    if (Live.st === 'count') { box.appendChild(el('h2', 'gold', lt('GET READY…'))); box.appendChild(el('div', 'roomcode cdown', String(Math.max(1, Math.ceil((Live.startT - performance.now()) / 1000))))); return; }
    const host = Live.amHost(), hp = Live.hostPeer(), kind = (hp && hp.presence && hp.presence.kind) || Live.kind, boss = (hp && hp.presence && hp.presence.boss) || Live.boss;
    box.appendChild(el('div', 'eyebrow', ltf('PLAYERS · {0}', ps.length)));
    for (const p of ps) { const b = el('div', 'lb-row' + (p.sameTab ? ' me' : '')); b.appendChild(el('span', 'rk', p.presence && p.presence.host ? '★' : '·')); b.appendChild(el('span', 'nm', this.liveName(p))); b.appendChild(el('span', 'sc', p.presence && p.presence.st === 'play' ? lt('PLAYING') : p.presence && p.presence.rdy ? lt('READY') : '')); box.appendChild(b); }
    box.appendChild(el('div', 'eyebrow', lt('GAME')));
    const seg = el('div', 'seg'); seg.style.gridTemplateColumns = 'repeat(2,1fr)';
    for (const k of ['race', 'raid']) { const b = el('button', kind === k ? 'on' : '', lt(k === 'raid' ? 'BOSS RAID' : 'LIVE RACE')); b.disabled = !host; b.onclick = () => { Aud.sfx('ui'); Live.setKind(k, boss); this.renderLive(); }; seg.appendChild(b); }
    box.appendChild(seg);
    box.appendChild(el('div', 'small mute', lt((MODES.find(m => m.id === kind) || {}).desc || '')));
    if (!Live.p2p) { // (v32) private rooms by default; the host can list the room for everyone playing now
      box.appendChild(el('div', 'eyebrow', lt('WHO CAN JOIN'))); const ps2 = el('div', 'seg'); ps2.style.gridTemplateColumns = 'repeat(2,1fr)';
      const pubNow = host ? Live.pub : !!(hp && hp.presence && hp.presence.pub);
      for (const on of [false, true]) { const b = el('button', pubNow === on ? 'on' : '', lt(on ? 'OPEN TO ALL' : 'PRIVATE')); b.disabled = !host; b.onclick = () => { Aud.sfx('ui'); Live.setPub(on); this.renderLive(); }; ps2.appendChild(b); }
      box.appendChild(ps2); box.appendChild(el('div', 'small mute', lt(pubNow ? 'Anyone playing now can see this room and join.' : 'Only friends with the code can join.')));
    }
    if (kind === 'raid') {
      const bs = el('div', 'seg'); bs.style.gridTemplateColumns = 'repeat(3,1fr)';
      for (const id of BOSS_ORDER) { const b = el('button', boss === id ? 'on' : '', lt(BOSS_INFO[id].name)); b.disabled = !host; b.onclick = () => { Aud.sfx('ui'); Live.setKind('raid', id); this.renderLive(); }; bs.appendChild(b); }
      box.appendChild(bs);
    }
    const rd = el('button', 'btn', Live.ready ? lt('READY ✓') : lt('I AM READY')); rd.onclick = () => { Aud.sfx('ui'); Live.setReady(!Live.ready); this.renderLive(); }; box.appendChild(rd);
    if (host) { const s = el('button', 'btn pri', lt('START')), bz = Live.busy(); s.disabled = bz; s.onclick = () => { Aud.sfx('buy'); Live.start(); }; box.appendChild(s); if (bz) box.appendChild(el('div', 'small mute', lt('Waiting for everyone to finish the last game…'))); }
    else box.appendChild(el('div', 'small mute', lt('The host starts the game.')));
    this.renderP2PInvite(box);
    const l = el('button', 'btn ghost', lt('LEAVE ROOM')); l.onclick = async () => { Aud.sfx('back'); await Live.leave(); this.p2pSt = ''; this.p2pMore = 0; this.renderLive(); }; box.appendChild(l);
  },
  liveName(p) { return Live.nameOf(p) + (p.guest ? ' · ' + lt('GUEST') : ''); },
  copyCode(box, code) { // copy the room code (digits only) to send it
    const b = el('button', 'btn', lt('COPY CODE')); b.onclick = async () => { Aud.sfx('ui'); let ok = false; try { await navigator.clipboard.writeText(code); ok = true; } catch (e) { ok = false; } toastDom(ok ? lt('CODE COPIED — SEND IT TO A FRIEND') : RCODE.fmt(code)); }; box.appendChild(b);
  }
});
