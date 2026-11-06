/* =====================================================================
   LIVE ANYWHERE — live play without claude.ai (the standalone file, a
   game site, or a player who is not signed in). Phones connect directly
   over WebRTC; there is no server, so the two connection codes travel
   by hand (WhatsApp, SMS…):
     1. the host taps HOST and sends the INVITE code
     2. the friend pastes it, taps CONNECT and sends back the REPLY code
     3. the host pastes the reply: both are in the same room
   The host can invite up to 3 friends and relays everything between them.
   P2P.api / the room it returns behave like the artifact's `room`, so
   the LIVE code (race, raid, ghosts, results) runs unchanged on top.
   Everything received is untrusted: size-capped, shape-checked, and
   only the three live topics plus presence are accepted.
   ===================================================================== */
const P2P_ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }];
const P2P_MAX = 3; // friends per host
const P2P = {
  id: '', role: '', links: [], pend: null, rcode: '', rpend: {}, pres: {}, peers: {}, on: {}, peerCbs: [], open: false, err: '',
  ok() { return typeof RTCPeerConnection === 'function'; },
  reset() { for (const l of this.links) try { l.pc.close(); } catch (e) { errLog(e); } if (this.pend) try { this.pend.pc.close(); } catch (e) { errLog(e); }
    RELAY.stop(); for (const k in this.rpend) try { this.rpend[k].l.pc.close(); } catch (e) { errLog(e); } this.rpend = {}; this.rcode = ''; clearInterval(this.hiT); clearTimeout(this.linkT);
    this.links = []; this.pend = null; this.pres = {}; this.peers = {}; this.on = {}; this.peerCbs = []; this.open = false; this.role = ''; this.id = Math.random().toString(36).slice(2, 10); },
  /* ---- codes: ODP1.<b64url(deflate(json))> or ODP0.<b64url(json)> when compression is missing ---- */
  async pack(o) {
    const raw = new TextEncoder().encode(JSON.stringify(o)); let bytes = raw, tag = 'ODP0.';
    try { if (typeof CompressionStream === 'function') { const s = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw')); bytes = new Uint8Array(await new Response(s).arrayBuffer()); tag = 'ODP1.'; } } catch (e) { bytes = raw; tag = 'ODP0.'; }
    let s = ''; for (const c of bytes) s += String.fromCharCode(c); return tag + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  async unpack(code) {
    try {
      const m = /ODP([01])\.([A-Za-z0-9_+\/=-]+)/.exec(String(code || '').replace(/\s+/g, '')); if (!m || m[2].length > 20000) return null;
      let s = m[2].replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
      const bin = atob(s); let b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
      if (m[1] === '1') { const st = new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw')); b = new Uint8Array(await new Response(st).arrayBuffer()); }
      const o = JSON.parse(new TextDecoder().decode(b));
      if (!o || (o.t !== 'o' && o.t !== 'a') || typeof o.s !== 'string' || o.s.length > 12000 || !/^v=0/.test(o.s)) return null;
      return { t: o.t, s: o.s, id: String(o.id || '').replace(/[^a-z0-9]/g, '').slice(0, 12) };
    } catch (e) { return null; }
  },
  gather(pc) { // wait for the ICE candidates (no trickle: the code carries them all)
    return new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 3500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); });
  },
  newPc() { return new RTCPeerConnection({ iceServers: P2P_ICE }); },
  /* ---- host side ---- */
  async invite() {
    if (!this.role) { this.reset(); this.role = 'host'; }
    if (this.links.length >= P2P_MAX) { this.err = lt('The room is full.'); return ''; }
    if (this.pend) try { this.pend.pc.close(); } catch (e) { errLog(e); }
    const pc = this.newPc(), dc = pc.createDataChannel('od', { ordered: true }), l = { pc, dc, id: '' }; this.pend = l; this.wire(l);
    await pc.setLocalDescription(await pc.createOffer()); await this.gather(pc);
    return this.pack({ t: 'o', s: pc.localDescription.sdp, id: this.id });
  },
  async accept(code) { // the host pastes a friend's reply
    const o = await this.unpack(code); if (!o || o.t !== 'a') { this.err = lt('That is not a reply code.'); return false; }
    const l = this.pend; if (!l) { this.err = lt('Make an invite first.'); return false; }
    try { await l.pc.setRemoteDescription({ type: 'answer', sdp: o.s }); } catch (e) { this.err = lt('That reply belongs to another invite. Send a new invite.'); return false; }
    l.id = o.id; this.pend = null; this.links.push(l); return true;
  },
  /* ---- guest side ---- */
  async reply(code, keep) { // (keep: the 6-digit code flow, whose relay must stay open to send the reply)
    const o = await this.unpack(code); if (!o || o.t !== 'o') { this.err = lt('That is not an invite code.'); return ''; }
    if (!keep) this.reset(); this.role = 'guest';
    const pc = this.newPc(), l = { pc, dc: null, id: o.id }; this.links.push(l);
    pc.ondatachannel = ev => { l.dc = ev.channel; this.wireDc(l); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { this.err = lt('Could not connect. Try again, or both join the same Wi-Fi.'); if (UI.cur === 'live') UI.renderLive(); } };
    try { await pc.setRemoteDescription({ type: 'offer', sdp: o.s }); await pc.setLocalDescription(await pc.createAnswer()); } catch (e) { this.err = lt('That is not an invite code.'); return ''; }
    await this.gather(pc);
    return this.pack({ t: 'a', s: pc.localDescription.sdp, id: this.id });
  },
  wire(l) { this.wireDc(l); l.pc.onconnectionstatechange = () => { if (l.pc.connectionState === 'failed' || l.pc.connectionState === 'closed') this.drop(l); }; },
  wireDc(l) {
    const dc = l.dc;
    const opened = () => { if (l.up) return; l.up = 1; this.open = true; this.send(l, { k: 'p', id: this.id, p: this.pres }); if (this.role === 'host') for (const id in this.peers) this.send(l, { k: 'p', id, p: this.peers[id] }); P2P.connected(); };
    dc.onopen = opened; dc.onclose = () => this.drop(l);
    dc.onmessage = ev => this.recv(l, ev.data);
    if (dc.readyState === 'open') opened(); // a channel handed over by ondatachannel can already be open
  },
  drop(l) {
    const i = this.links.indexOf(l); if (i < 0) return; this.links.splice(i, 1);
    if (l.id && this.peers[l.id]) { delete this.peers[l.id]; if (this.role === 'host') this.relay(null, { k: 'bye', id: l.id }); }
    if (this.role === 'guest') { this.peers = {}; this.open = false; }
    this.firePeers();
    if (this.role === 'guest' && !this.links.length && Live.p2p && Live.r) setTimeout(async () => { // (v32) the host is gone: back to the connect screen, saying why
      if (!Live.p2p || !Live.r) return; await Live.leave(); this.err = lt('The host left the game.'); UI.p2pSt = ''; if (UI.cur === 'live') UI.renderLive();
    }, 0);
  },
  send(l, m) { try { if (l.dc && l.dc.readyState === 'open') l.dc.send(JSON.stringify(m)); } catch (e) { errLog(e); } },
  relay(from, m) { for (const l of this.links) if (l !== from) this.send(l, m); },
  clean(p) { // a presence object: flat, small, primitive values only
    const o = {}; if (!p || typeof p !== 'object') return o; let n = 0;
    for (const k in p) { if (++n > 24 || k.length > 8) break; const v = p[k]; if (typeof v === 'number' && isFinite(v)) o[k] = v; else if (typeof v === 'boolean') o[k] = v; else if (typeof v === 'string') o[k] = v.slice(0, 24); else if (v === null) o[k] = null; }
    return o;
  },
  recv(l, raw) {
    if (typeof raw !== 'string' || raw.length > 4096) return; let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m !== 'object') return; const id = String(m.id || '').replace(/[^a-z0-9]/g, '').slice(0, 12); if (!id || id === this.id) return;
    if (m.k === 'p') { const p = this.clean(m.p); this.peers[id] = Object.assign(this.peers[id] || {}, p); if (this.role === 'host' && !l.id) l.id = id; this.firePeers(); if (this.role === 'host') this.relay(l, { k: 'p', id, p }); }
    else if (m.k === 'e' && LIVE_TOPICS.indexOf(m.topic) >= 0) { const data = this.clean(m.data); this.fire(m.topic, { data, sameTab: false, peer: id }); if (this.role === 'host') this.relay(l, { k: 'e', id, topic: m.topic, data }); }
    else if (m.k === 'bye' && this.role === 'guest') { delete this.peers[id]; this.firePeers(); }
  },
  fire(topic, msg) { for (const f of (this.on[topic] || [])) try { f(msg); } catch (e) { errLog(e); } },
  list() {
    const out = [{ peer: this.id, sameTab: true, kind: 'user', presence: Object.assign({}, this.pres) }];
    for (const id in this.peers) out.push({ peer: id, sameTab: false, kind: 'user', presence: Object.assign({}, this.peers[id]) });
    return out;
  },
  firePeers() { const ch = { peers: this.list() }; for (const f of this.peerCbs) try { f(ch); } catch (e) { errLog(e); } if (UI.cur === 'live') UI.renderLive(); },
  connected() { // a data channel opened: enter the room through the normal LIVE code
    if (this.role === 'guest') { RELAY.stop(); clearInterval(this.hiT); clearTimeout(this.linkT); } // in: the relay is no longer needed
    if (Live.r && Live.p2p) { this.firePeers(); return; }
    Live.inited = true; Live.room = this.api; Live.p2p = true;
    Live.enter('link', this.rcode, this.role === 'host').then(() => { if (UI.cur === 'live') UI.renderLive(); });
  },
  /* the room-like api the LIVE code talks to */
  api: {
    onPeers() { return () => { }; }, presence() { return Promise.resolve(); },
    join() {
      const P = P2P;
      return Promise.resolve({
        onPeers(cb) { P.peerCbs.push(cb); setTimeout(() => cb({ peers: P.list() }), 0); return () => { const i = P.peerCbs.indexOf(cb); if (i >= 0) P.peerCbs.splice(i, 1); }; },
        on(topic, cb) { (P.on[topic] || (P.on[topic] = [])).push(cb); return () => { const a = P.on[topic], i = a ? a.indexOf(cb) : -1; if (i >= 0) a.splice(i, 1); }; },
        presence(patch) { Object.assign(P.pres, P.clean(patch)); P.relay(null, { k: 'p', id: P.id, p: P.pres }); return Promise.resolve(); },
        emit(topic, data) { const d = P.clean(data); P.relay(null, { k: 'e', id: P.id, topic, data: d }); setTimeout(() => P.fire(topic, { data: d, sameTab: true, peer: P.id }), 0); return Promise.resolve(); },
        leave() { P.reset(); Live.p2p = false; Live.room = null; Live.inited = false; return Promise.resolve(); }
      });
    }
  }
};
/* names: without accounts the presence carries the player's own name */
{ const nm0 = Live.nameOf.bind(Live); Live.nameOf = function (p) { const n = nm0(p); if (n !== lt('PLAYER') || !p.presence || typeof p.presence.nm !== 'string' || !p.presence.nm) return n; return p.presence.nm.replace(/[<>]/g, '').slice(0, 14); }; }
Object.assign(UI, {
  renderP2P(box) { // the connect panel, shown when the artifact room is not available
    const sec = (t) => box.appendChild(el('div', 'eyebrow', lt(t)));
    const codeBox = (val, label) => { const ta = document.createElement('textarea'); ta.className = 'p2pcode'; ta.readOnly = !!val; ta.value = val || ''; ta.placeholder = label || ''; ta.setAttribute('aria-label', label || lt('Connection code')); ta.spellcheck = false; box.appendChild(ta); return ta; };
    const copyBtn = (ta) => { const b = el('button', 'btn', lt('COPY CODE')); b.onclick = async () => { ta.select(); let ok = false; try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) { try { ok = document.execCommand('copy'); } catch (er) { errLog(er); } } toastDom(ok ? lt('CODE COPIED — SEND IT TO A FRIEND') : lt('COPY THE CODE FROM THE BOX')); }; box.appendChild(b); };
    if (P2P.err) box.appendChild(el('div', 'panel info small gold', P2P.err));
    const st = this.p2pSt || '';
    const longHost = async (h) => { Aud.sfx('ui'); P2P.err = ''; P2P.reset(); if (h) h.disabled = true; this.p2pInv = await P2P.invite(); this.p2pSt = 'host'; this.renderLive(); };
    if (!st && RELAY.ok()) { // (v32) the short way: a 6-digit code
      box.appendChild(el('div', 'small', lt('Play live with friends anywhere, no account needed. One phone hosts and gets a 6-digit code; friends type it in.')));
      const h = el('button', 'btn pri', lt('HOST A GAME')); h.onclick = async () => { Aud.sfx('ui'); P2P.err = ''; h.disabled = true; this.p2pSt = 'hostc'; await P2P.hostCode(); this.renderLive(); }; box.appendChild(h);
      const j = el('button', 'btn', lt('JOIN A FRIEND')); j.onclick = () => { Aud.sfx('ui'); P2P.err = ''; this.p2pSt = 'joinc'; this.renderLive(); }; box.appendChild(j);
      const lg = el('button', 'btn ghost', lt('CONNECT WITH A LONG CODE OR QR')); lg.onclick = () => { Aud.sfx('ui'); P2P.err = ''; this.p2pSt = 'long'; this.renderLive(); }; box.appendChild(lg);
      return;
    }
    if (!st || st === 'long') { // the long code: works with no relay at all (codes travel by hand or QR)
      box.appendChild(el('div', 'small', lt('Play live with friends anywhere, no account needed. One phone hosts and sends an invite code; each friend sends back a reply code.')));
      const h = el('button', 'btn pri', lt('HOST A GAME')); h.onclick = () => longHost(h); box.appendChild(h);
      const j = el('button', 'btn', lt('JOIN A FRIEND')); j.onclick = () => { Aud.sfx('ui'); P2P.err = ''; this.p2pSt = 'join'; this.renderLive(); }; box.appendChild(j);
      if (st === 'long') { const x = el('button', 'btn ghost', lt('BACK')); x.onclick = () => { Aud.sfx('back'); this.p2pSt = ''; this.renderLive(); }; box.appendChild(x); }
      return;
    }
    const scanBtn = (label, fn) => { if (!P2PQ.canScan()) return; const b = el('button', 'btn', lt(label)); b.onclick = () => { Aud.sfx('ui'); P2PQ.scan(fn); }; box.appendChild(b); };
    if (st === 'hostc') { // the host's code, open on the relays until the room is full
      const rs = RELAY.state();
      box.appendChild(el('div', 'eyebrow', lt('YOUR GAME CODE')));
      if (P2P.rcode && rs !== 'fail') { const big = el('div', 'roomcode', RCODE.fmt(P2P.rcode)); big.setAttribute('dir', 'ltr'); box.appendChild(big); this.copyCode(box, P2P.rcode); }
      box.appendChild(el('div', 'small', lt('Friends tap JOIN A FRIEND and type this code. Up to 3 friends.')));
      box.appendChild(el('div', 'small ' + (rs === 'fail' ? 'gold' : 'mute'), lt(rs === 'up' ? 'Waiting for friends…' : rs === 'fail' ? 'Could not reach the relay. Check the internet, or connect with a long code.' : 'Opening the game…')));
      if (rs === 'fail') { const lg = el('button', 'btn', lt('CONNECT WITH A LONG CODE OR QR')); lg.onclick = () => longHost(lg); box.appendChild(lg); }
    } else if (st === 'joinc') { // type the friend's code
      box.appendChild(el('div', 'eyebrow', lt("YOUR FRIEND'S CODE")));
      const row = el('div', 'row'), inp = document.createElement('input'); inp.id = 'p2pCode'; inp.className = 'code'; RCODE.input(inp); inp.setAttribute('aria-label', lt('Room code')); inp.value = RCODE.fmt(this.p2pTyped || '');
      const j = el('button', 'btn pri', lt('JOIN')); row.appendChild(inp); row.appendChild(j); box.appendChild(row);
      j.onclick = () => { Aud.sfx('ui'); const c = RCODE.clean(inp.value); this.p2pTyped = c; P2P.err = '';
        if (c.length !== 6) { P2P.err = lt('A room code has 6 digits.'); this.renderLive(); return; }
        if (!RCODE.ok(c)) { P2P.err = lt('That code is not right. Check the 6 digits.'); this.renderLive(); return; }
        this.p2pSt = 'joinw'; this.renderLive();
        P2P.joinCode(c, k => { if (k === 'fail') this.p2pSt = 'joinc'; else if (k === 'link') this.p2pSt = 'joinl'; if (UI.cur === 'live') this.renderLive(); }); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') j.click(); });
      const lg = el('button', 'btn ghost', lt('CONNECT WITH A LONG CODE OR QR')); lg.onclick = () => { Aud.sfx('ui'); P2P.err = ''; this.p2pSt = 'join'; this.renderLive(); }; box.appendChild(lg);
      setTimeout(() => { try { if (!inp.value) inp.focus(); } catch (e) { errLog(e); } }, 50);
    } else if (st === 'joinw') box.appendChild(el('div', 'small', lt("Looking for your friend's game…")));
    else if (st === 'joinl') box.appendChild(el('div', 'small', lt('Found it! Connecting…')));
    else if (st === 'host') {
      const accept = async (code, c) => { Aud.sfx('ui'); P2P.err = ''; if (c) c.disabled = true; const ok = await P2P.accept(code); if (ok) { this.p2pSt = 'wait'; } this.renderLive(); };
      sec('1. SEND THIS INVITE'); P2PQ.qr(box, this.p2pInv, P2PQ.base() ? 'Your friend scans this with the phone camera.' : 'Your friend scans this QR in the game.'); copyBtn(codeBox(this.p2pInv, ''));
      sec("2. SCAN OR PASTE YOUR FRIEND'S REPLY"); scanBtn('SCAN REPLY QR', code => accept(code)); const ta = codeBox('', lt('Paste the reply code here'));
      const c = el('button', 'btn pri', lt('CONNECT')); c.onclick = () => accept(ta.value, c); box.appendChild(c);
    } else if (st === 'join') {
      const make = async (code, c) => { Aud.sfx('ui'); P2P.err = ''; if (c) c.disabled = true; this.p2pSt = 'joining'; this.renderLive(); const r = await P2P.reply(code); if (r) { this.p2pRep = r; this.p2pSt = 'reply'; } else this.p2pSt = 'join'; this.renderLive(); };
      sec("1. SCAN OR PASTE THE HOST'S INVITE"); scanBtn('SCAN INVITE QR', code => make(code)); const ta = codeBox('', lt('Paste the invite code here'));
      const c = el('button', 'btn pri', lt('MAKE MY REPLY')); c.onclick = () => make(ta.value, c); box.appendChild(c);
    } else if (st === 'joining') box.appendChild(el('div', 'small', lt('Making your reply…')));
    else if (st === 'reply') {
      sec('2. SHOW OR SEND THIS REPLY TO THE HOST'); P2PQ.qr(box, this.p2pRep, P2PQ.base() ? 'The host scans this with the phone camera or in the game.' : 'The host scans this QR in the game.'); copyBtn(codeBox(this.p2pRep, ''));
      box.appendChild(el('div', 'small mute', lt('You join the room as soon as the host scans or pastes it.')));
    } else if (st === 'relay') { // this tab was opened by scanning a reply with the camera app
      const g = P2PQ.gotAck;
      box.appendChild(el('div', 'panel info small' + (g === 1 ? ' gold' : ''), lt(g === 1 ? 'Done! Your friend is joining in the game tab where you made the invite. You can close this tab.' : g === 0 ? 'Handing the reply to your game…' : 'Open the game where you made the invite and scan this reply there, or copy it and paste it there.')));
      if (g < 0) copyBtn(codeBox(this.p2pRep, ''));
    } else if (st === 'wait') box.appendChild(el('div', 'small', lt('Connecting…')));
    const x = el('button', 'btn ghost', lt('CANCEL')); x.onclick = () => { Aud.sfx('back'); P2P.reset(); this.p2pSt = ''; P2P.err = ''; this.renderLive(); }; box.appendChild(x);
  },
  renderP2PInvite(box) { // in the lobby: the host can bring more friends in
    if (!Live.p2p || P2P.role !== 'host' || Live.st !== 'lobby') return;
    if (P2P.links.length >= P2P_MAX || (P2P.rcode && RELAY.state() === 'up')) return; // (with the 6-digit code open, friends just type it)
    if (!this.p2pMore) { const b = el('button', 'btn', lt('INVITE ANOTHER FRIEND')); b.onclick = async () => { Aud.sfx('ui'); b.disabled = true; this.p2pInv = await P2P.invite(); this.p2pMore = 1; this.renderLive(); }; box.appendChild(b); return; }
    const sec = (t) => box.appendChild(el('div', 'eyebrow', lt(t)));
    sec('1. SEND THIS INVITE'); P2PQ.qr(box, this.p2pInv || '', P2PQ.base() ? 'Your friend scans this with the phone camera.' : 'Your friend scans this QR in the game.'); const a = document.createElement('textarea'); a.className = 'p2pcode'; a.readOnly = true; a.value = this.p2pInv || ''; box.appendChild(a);
    const cp = el('button', 'btn', lt('COPY CODE')); cp.onclick = async () => { a.select(); try { await navigator.clipboard.writeText(a.value); toastDom(lt('CODE COPIED — SEND IT TO A FRIEND')); } catch (e) { toastDom(lt('COPY THE CODE FROM THE BOX')); } }; box.appendChild(cp);
    sec("2. SCAN OR PASTE YOUR FRIEND'S REPLY"); if (P2PQ.canScan()) { const sb = el('button', 'btn', lt('SCAN REPLY QR')); sb.onclick = () => P2PQ.scan(async code => { if (await P2P.accept(code)) this.p2pMore = 0; this.renderLive(); }); box.appendChild(sb); }
    const t = document.createElement('textarea'); t.className = 'p2pcode'; t.placeholder = lt('Paste the reply code here'); box.appendChild(t);
    const c = el('button', 'btn pri', lt('CONNECT')); c.onclick = async () => { c.disabled = true; if (await P2P.accept(t.value)) this.p2pMore = 0; this.renderLive(); }; box.appendChild(c);
  }
});
