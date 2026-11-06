/* =====================================================================
   LIVE ANYWHERE: 6-DIGIT CODES (v32) — the host gets a short code like
   482 913 and friends just type it. The phones find each other through
   public MQTT relays (four of them, so one being down does not matter),
   then talk directly over WebRTC exactly as before.
   Only the connection setup goes through a relay, and it is encrypted
   (AES-GCM, with a key made from the code by PBKDF2) on a channel named
   by a hash of the code: the relay never sees the code, and without the
   code nobody can find the game or read what is sent.
   The long code / QR flow stays as the fallback (no relay needed).
   ===================================================================== */
const RELAY_URLS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt', 'wss://mqtt.eclipseprojects.io:443/mqtt'];
const MQ = { // MQTT 3.1.1, only what is needed: connect, subscribe, publish (QoS 0), ping
  str(s) { const b = new TextEncoder().encode(s), o = new Uint8Array(b.length + 2); o[0] = b.length >> 8; o[1] = b.length & 255; o.set(b, 2); return o; },
  len(n) { const o = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; o.push(d); } while (n > 0); return o; },
  pkt(h, ...parts) { let n = 0; for (const p of parts) n += p.length; const L = this.len(n), o = new Uint8Array(1 + L.length + n); o[0] = h; o.set(L, 1); let k = 1 + L.length; for (const p of parts) { o.set(p, k); k += p.length; } return o; },
  connect(id) { return this.pkt(0x10, this.str('MQTT'), [4, 2, 0, 60], this.str(id)); },
  sub(pid, t) { return this.pkt(0x82, [pid >> 8, pid & 255], this.str(t), [0]); },
  pub(t, payload) { return this.pkt(0x30, this.str(t), payload); }
};
function mqLink(url, topic, onMsg, onChange) { // one relay: connect, subscribe to the game's channel, pass its messages on
  const L = { up: false, dead: false, buf: new Uint8Array(0), ws: null, pingT: 0, to: 0,
    send(b) { try { if (this.ws && this.ws.readyState === 1) this.ws.send(b); } catch (e) { errLog(e); } },
    pub(t, payload) { this.send(MQ.pub(t, payload)); },
    close() { clearInterval(this.pingT); clearTimeout(this.to); this.up = false; this.dead = true; const ws = this.ws; this.ws = null; if (ws) { try { if (ws.readyState === 1) ws.send(new Uint8Array([0xe0, 0])); ws.close(); } catch (e) { errLog(e); } } }
  };
  const fail = () => { if (L.dead) return; L.close(); onChange(); };
  try { L.ws = new WebSocket(url, 'mqtt'); } catch (e) { L.dead = true; setTimeout(onChange, 0); return L; }
  const ws = L.ws; ws.binaryType = 'arraybuffer';
  L.to = setTimeout(() => { if (!L.up) fail(); }, 9000);
  ws.onopen = () => L.send(MQ.connect('od' + RELAY.rid(18)));
  ws.onerror = ws.onclose = () => fail();
  ws.onmessage = ev => {
    if (L.dead || !(ev.data instanceof ArrayBuffer)) return;
    const c = new Uint8Array(ev.data); let b = c; if (L.buf.length) { b = new Uint8Array(L.buf.length + c.length); b.set(L.buf); b.set(c, L.buf.length); }
    let i = 0;
    while (b.length - i >= 2) {
      let n = 0, m = 1, j = i + 1, d = 128;
      while (d & 128) { if (j >= b.length || m > 2097152) { j = -1; break; } d = b[j++]; n += (d & 127) * m; m *= 128; }
      if (j < 0 || b.length - j < n) break;
      const type = b[i] >> 4, fl = b[i] & 15, body = b.subarray(j, j + n); i = j + n;
      if (type === 2) { if (body.length >= 2 && body[1] === 0) L.send(MQ.sub(1, topic)); else { fail(); return; } } // CONNACK
      else if (type === 9) { clearTimeout(L.to); if (body.length >= 3 && body[2] < 0x80) { L.up = true; L.pingT = setInterval(() => L.send(new Uint8Array([0xc0, 0])), 25000); onChange(); } else { fail(); return; } } // SUBACK
      else if (type === 3 && body.length >= 2) { const tl = (body[0] << 8) | body[1], k = 2 + tl + (((fl >> 1) & 3) ? 2 : 0); if (k <= body.length && n < 20000 && new TextDecoder().decode(body.subarray(2, 2 + tl)) === topic) onMsg(body.slice(k)); } // PUBLISH
    }
    L.buf = b.slice(i); if (L.buf.length > 65536) fail();
  };
  return L;
}
const RELAY = {
  links: [], k: null, topic: '', id: '', seen: null, onMsg: null, onState: null, gen: 0, failed: false,
  ok() { try { return !window.__NORELAY && typeof WebSocket === 'function' && !!(window.crypto && crypto.subtle && crypto.getRandomValues) && P2P.ok(); } catch (e) { return false; } },
  rid(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); let s = ''; for (const v of a) s += 'abcdefghijklmnopqrstuvwxyz0123456789'[v % 36]; return s; },
  async start(code, onMsg) {
    this.stop(); const gen = this.gen; this.failed = false;
    try {
      const enc = new TextEncoder(), base = await crypto.subtle.importKey('raw', enc.encode('od-link|' + code), 'PBKDF2', false, ['deriveKey']);
      const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('overdrive-cyber-slash/relay/1'), iterations: 60000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode('od-topic|' + code))); let hx = ''; for (const v of h.subarray(0, 12)) hx += v.toString(16).padStart(2, '0');
      if (gen !== this.gen) return false; this.k = k; this.topic = 'odcs/v1/' + hx;
    } catch (e) { errLog(e); this.failed = true; return false; }
    this.id = this.rid(10); this.onMsg = onMsg; this.seen = new Set();
    for (const u of (window.__RELAY_URLS || RELAY_URLS)) this.links.push(mqLink(u, this.topic, b => this.recv(b, gen), () => this.changed(gen)));
    return true;
  },
  changed(gen) {
    if (gen !== this.gen) return; if (this.links.length && this.links.every(l => l.dead)) this.failed = true;
    if (this.onState) try { this.onState(); } catch (e) { errLog(e); }
    if (UI.cur === 'live' && (UI.p2pSt === 'hostc' || UI.p2pSt === 'joinw')) UI.renderLive();
  },
  state() { return this.links.some(l => l.up) ? 'up' : this.failed ? 'fail' : 'wait'; },
  stop() { this.gen++; for (const l of this.links) l.close(); this.links = []; this.k = null; this.onMsg = null; this.onState = null; this.topic = ''; },
  async send(o) {
    const k = this.k, gen = this.gen; if (!k) return; o.f = this.id; o.m = this.rid(8);
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(o))));
      if (gen !== this.gen) return; const b = new Uint8Array(12 + ct.length); b.set(iv); b.set(ct, 12); for (const l of this.links) if (l.up) l.pub(this.topic, b);
    } catch (e) { errLog(e); }
  },
  async recv(b, gen) { // untrusted: anything that does not decrypt with this code's key is dropped
    if (gen !== this.gen || !this.k || b.length < 29 || b.length > 16000) return; let o;
    try { o = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.subarray(0, 12) }, this.k, b.subarray(12)))); } catch (e) { return; }
    if (gen !== this.gen || !o || typeof o !== 'object' || typeof o.f !== 'string' || o.f === this.id || typeof o.m !== 'string' || this.seen.has(o.m)) return;
    if (o.to && o.to !== this.id) return; this.seen.add(o.m); if (this.seen.size > 500) this.seen.clear(); // (each relay delivers it: once is enough)
    if (this.onMsg) try { this.onMsg(o); } catch (e) { errLog(e); }
  }
};
Object.assign(P2P, {
  async hostCode() { // the host: a fresh code, open on the relays while friends come in
    this.reset(); this.role = 'host'; this.rcode = RCODE.make(); this.err = '';
    if (!(await RELAY.start(this.rcode, o => this.onRelayHost(o)))) RELAY.failed = true;
  },
  async onRelayHost(o) {
    if (this.role !== 'host') return; const gid = o.f.replace(/[^a-z0-9]/g, '').slice(0, 12); if (!gid) return;
    const now = performance.now(); for (const k in this.rpend) if (now - this.rpend[k].t > 40000) { try { this.rpend[k].l.pc.close(); } catch (e) { errLog(e); } delete this.rpend[k]; }
    if (o.t === 'hi') { // a friend typed the code: make them an invite
      const pe = this.rpend[gid]; if (pe) { if (pe.code) RELAY.send({ t: 'of', to: gid, c: pe.code }); return; }
      if (this.links.length + Object.keys(this.rpend).length >= P2P_MAX) { RELAY.send({ t: 'full', to: gid }); return; }
      const pc = this.newPc(), dc = pc.createDataChannel('od', { ordered: true }), l = { pc, dc, id: '' }, p = this.rpend[gid] = { l, code: '', t: now }; this.wire(l);
      try { await pc.setLocalDescription(await pc.createOffer()); await this.gather(pc); } catch (e) { errLog(e); delete this.rpend[gid]; return; }
      if (this.rpend[gid] !== p || this.role !== 'host') return;
      p.code = await this.pack({ t: 'o', s: pc.localDescription.sdp, id: this.id }); RELAY.send({ t: 'of', to: gid, c: p.code });
    } else if (o.t === 'an' && typeof o.c === 'string' && o.c.length < 20000) { // their reply: connect
      const p = this.rpend[gid]; if (!p || !p.code) return; const a = await this.unpack(o.c); if (!a || a.t !== 'a' || this.rpend[gid] !== p) return; delete this.rpend[gid];
      try { await p.l.pc.setRemoteDescription({ type: 'answer', sdp: a.s }); } catch (e) { errLog(e); try { p.l.pc.close(); } catch (er) { errLog(er); } return; }
      p.l.id = a.id; this.links.push(p.l);
    }
  },
  async joinCode(code, cb) { // a friend: find the host by the code, then connect directly
    this.reset(); this.role = 'guest'; this.rcode = code; this.err = ''; let got = false, n = 0;
    const fail = msg => { clearInterval(this.hiT); clearTimeout(this.linkT); if (this.role !== 'guest' || this.open) return; this.reset(); this.err = msg; cb('fail'); };
    const ok = await RELAY.start(code, async o => {
      if (o.t === 'full') fail(lt('That game is full.'));
      else if (o.t === 'of' && !got && typeof o.c === 'string' && o.c.length < 20000) {
        got = true; clearInterval(this.hiT); cb('link');
        const r = await this.reply(o.c, true); if (!r || this.role !== 'guest') { fail(this.err || lt('Could not connect. Try again, or both join the same Wi-Fi.')); return; }
        RELAY.send({ t: 'an', to: o.f, c: r });
        this.linkT = setTimeout(() => { if (!this.open && !Live.r) fail(lt('Could not connect. Try again, or both join the same Wi-Fi.')); }, 25000);
      }
    });
    if (!ok) { fail(lt('Could not reach the relay. Check the internet, or connect with a long code.')); return; }
    RELAY.onState = () => { if (!got && RELAY.state() === 'up') RELAY.send({ t: 'hi' }); };
    this.hiT = setInterval(() => {
      if (got || this.role !== 'guest') { clearInterval(this.hiT); return; } n++;
      const s = RELAY.state(); if (s === 'up') RELAY.send({ t: 'hi' }); else if (s === 'fail' || n > 10) { fail(lt('Could not reach the relay. Check the internet, or connect with a long code.')); return; }
      if (n > 15) fail(lt("No game found with this code. Check the digits, and that your friend's phone is showing it."));
    }, 1000);
  }
});
{ // typing a code survives a redraw of the LIVE screen (friends coming and going redraw it)
  const r0 = UI.renderLive.bind(UI);
  UI.renderLive = function () {
    const keep = []; for (const id of ['lvCode', 'p2pCode']) { const e = document.getElementById(id); if (e) keep.push([id, e.value, document.activeElement === e, e.selectionStart]); }
    r0();
    for (const [id, v, f, sel] of keep) { const e = document.getElementById(id); if (!e) continue; if (v && !e.value) e.value = v; if (f) { try { e.focus(); if (sel != null) e.setSelectionRange(sel, sel); } catch (er) { errLog(er); } } }
  };
}
