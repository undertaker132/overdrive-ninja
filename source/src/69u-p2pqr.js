/* =====================================================================
   LIVE ANYWHERE: QR CODES — the invite and the reply are also shown as
   QR codes. Outside claude.ai the QR holds a link to this very game with
   the code after #odp=, so any phone camera can scan it:
     · the friend scans the invite: the game opens and makes the reply
     · the host scans the reply: a new tab opens and hands the reply to
       the game tab that made the invite (BroadcastChannel, same site)
   Phones whose browser has a QR reader (BarcodeDetector) can also scan
   inside the game. Pasting the code by hand always works too.
   ===================================================================== */
const P2PQ = {
  auto: '', bc: null, gotAck: 0, scanning: null,
  base() { try { if (/^https?:$/.test(location.protocol) && offlineBuild() && window.top === window) return location.origin + location.pathname; } catch (e) { errLog(e); } return ''; },
  link(code) { const b = this.base(); return b ? b + '#odp=' + code : code; },
  grab() { // a link opened from a scanned QR
    try { const m = /[#&]odp=(ODP[01]\.[A-Za-z0-9_-]+)/.exec(location.hash || ''); if (m) { this.auto = m[1]; history.replaceState(null, '', location.pathname + location.search); } } catch (e) { errLog(e); }
  },
  listen() { try { this.bc = new BroadcastChannel('od-p2p'); this.bc.onmessage = ev => this.onMsg(ev.data); } catch (e) { this.bc = null; } },
  async onMsg(d) {
    if (!d || typeof d !== 'object') return;
    if (d.t === 'reply' && typeof d.code === 'string' && d.code.length < 20000 && P2P.role === 'host' && P2P.pend) {
      const ok = await P2P.accept(d.code); try { this.bc.postMessage({ t: 'got', ok: !!ok }); } catch (e) { errLog(e); }
      if (ok) { if (UI.p2pSt === 'host') UI.p2pSt = 'wait'; UI.p2pMore = 0; toastDom(lt('YOUR FRIEND IS JOINING')); } if (UI.cur === 'live') UI.renderLive();
    } else if (d.t === 'got') { this.gotAck = d.ok ? 1 : -1; if (UI.cur === 'live') UI.renderLive(); }
  },
  async handleAuto() {
    const code = this.auto; this.auto = ''; if (!code) return;
    const o = await P2P.unpack(code); if (!o) { toastDom(lt('That is not an invite code.')); return; }
    if (o.t === 'o') {
      UI.p2pSt = 'joining'; UI.openLive(); P2P.err = '';
      const r = await P2P.reply(code); if (r) { UI.p2pRep = r; UI.p2pSt = 'reply'; } else UI.p2pSt = 'join'; UI.renderLive();
    } else {
      UI.p2pSt = 'relay'; UI.p2pRep = code; this.gotAck = 0; UI.openLive();
      try { this.bc.postMessage({ t: 'reply', code }); } catch (e) { errLog(e); }
      setTimeout(() => { if (!this.gotAck) { this.gotAck = -2; if (UI.cur === 'live') UI.renderLive(); } }, 2500);
    }
  },
  qr(box, code, cap) { // the QR, big and crisp, with a caption under it
    const wrap = el('div', 'qrwrap'), c = QR.canvas(this.link(code), 900); if (!c) return;
    wrap.appendChild(c); wrap.appendChild(el('div', 'small mute', lt(cap))); box.appendChild(wrap);
  },
  canScan() { try { return typeof BarcodeDetector === 'function' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); } catch (e) { return false; } },
  async scan(onCode) { // the in-game QR reader: camera preview, a frame, and a cancel button
    let det; try { det = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { toastDom(lt('This phone cannot scan here. Scan with the camera app, or paste the code.')); return; }
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); } catch (e) { toastDom(lt('The camera is blocked. Allow it, or paste the code.')); return; }
    const ov = el('div', 'qrscan'), v = document.createElement('video'); v.setAttribute('playsinline', ''); v.muted = true; v.srcObject = stream; ov.appendChild(v); ov.appendChild(el('div', 'qrframe'));
    ov.appendChild(el('div', 'small', lt('Point the camera at the QR code on the other phone')));
    const stop = () => { clearInterval(iv); try { stream.getTracks().forEach(t => t.stop()); } catch (e) { errLog(e); } ov.remove(); this.scanning = null; };
    const x = el('button', 'btn', lt('CANCEL')); x.onclick = () => { Aud.sfx('back'); stop(); }; ov.appendChild(x); document.body.appendChild(ov);
    try { await v.play(); } catch (e) { errLog(e); }
    let busy = false; const iv = setInterval(async () => { if (busy || v.readyState < 2) return; busy = true;
      try { const r = await det.detect(v); for (const q of r) { const m = /ODP[01]\.[A-Za-z0-9_-]+/.exec(q.rawValue || ''); if (m) { stop(); Aud.sfx('buy'); vibe('reward'); onCode(m[0]); return; } } } catch (e) { errLog(e); }
      busy = false; }, 200);
    this.scanning = stop;
  }
};
P2PQ.grab(); P2PQ.listen();
