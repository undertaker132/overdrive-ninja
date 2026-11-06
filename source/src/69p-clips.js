/* =====================================================================
   CLIPS 2 — pick the moment, the length and share it straight away.
   The result screen's SAVE CLIP opens a picker with the run's best
   moments (boss kills, mini-bosses, nemesis, SSS rank, big combos and
   the finale). While a clip records, a small card with your name, the
   mode and the final score is burned into the corner so a shared clip
   explains itself. When it is done: SHARE (the phone's share sheet,
   when the browser allows files) or SAVE.
   ===================================================================== */
const CLIP_KIND = { boss: 'BOSS DOWN', mini: 'MINI-BOSS DOWN', nem: 'NEMESIS', combo: 'BIG COMBO', sss: 'SSS RANK' };
Object.assign(Replays, {
  clipLen: 10, clipCard: 1,
  moments(rep) {
    const hl = (rep.hdr.hl || []).slice().sort((a, b) => (b[2] - a[2]) || (b[0] - a[0])), out = [];
    for (const h of hl) { if (out.some(o => Math.abs(o.at - h[0]) < 420)) continue; out.push({ at: h[0], k: CLIP_KIND[h[1]] || 'HIGHLIGHT', w: h[2] }); if (out.length >= 3) break; }
    const end = Math.max(0, (rep.hdr.tk | 0) - 30); if (!out.some(o => Math.abs(o.at - end) < 420)) out.push({ at: end, k: 'FINALE', w: 0 });
    return out;
  },
  clipAt(rep, back, at) { // like clip(), but from a chosen moment and length
    if (!this.clipOk() || !this.clipMime()) { toastDom(lt('Video clips need a newer browser.')); return; }
    if (!this.usable(rep)) { toastDom(lt('This replay was recorded on an older version of the game.')); return; }
    if (REPLAY.on) REPLAY.stop();
    const len = this.clipLen * 60, from = Math.max(0, at - (len - 120)), to = Math.min(rep.hdr.tk | 0, at + 120);
    this.cur = rep; this.back = back || null; this.clipOn = true; this.clipHdr = rep.hdr;
    const s = REPLAY.start(rep, { speed: 1, label: lt('CLIP'), from, stopAt: to, onSeeked: () => this.recStart(), onEnd: () => this.recStop() });
    if (!s.ok) { this.clipOn = false; toastDom(lt('Could not start the replay.')); return; }
    UI.replayBar(true); $('rbClip').disabled = true;
  },
  drawCard() { // burned into the clip: who, which mode, what score
    if (!this.clipOn || !this.clipCard || !REPLAY.on || REPLAY.fast) return; const h = this.clipHdr || REPLAY.hdr; if (!h) return;
    const m = MODES.find(q => q.id === h.m), x = 10, y = V.VH - 70;
    cx.save(); cx.globalAlpha = .85; cx.fillStyle = 'rgba(5,6,15,.78)'; cx.fillRect(x, y, 190, 52); cx.fillStyle = '#ff0844'; cx.fillRect(x, y, 3, 52);
    cx.globalAlpha = 1; cx.textAlign = 'start'; cx.font = '700 13px ' + FONT_D; cx.fillStyle = '#ffffff'; cx.fillText(String(h.nm || 'PLAYER').slice(0, 16), x + 10, y + 17);
    cx.font = '700 10px ' + FONT_M; cx.fillStyle = '#00f2fe'; cx.fillText((m ? lt(m.name) : '') + ' · ' + fmtNum(h.sc | 0), x + 10, y + 32);
    cx.fillStyle = '#ffd700'; cx.fillText('OVERDRIVE: CYBER SLASH', x + 10, y + 46); cx.restore();
  },
  async shareBlob(blob, ext) {
    try {
      const f = new File([blob], 'overdrive-highlight.' + ext, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'OVERDRIVE: CYBER SLASH', text: lt('Check out this run!') }); return lt('SHARED'); }
    } catch (e) { if (e && e.name === 'AbortError') return lt('NOT SHARED'); }
    return this.saveBlob(blob, ext);
  },
  canShareFiles() { try { return !!(navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'], { type: 'video/webm' })], 'x.webm', { type: 'video/webm' })] })); } catch (e) { return false; } },
  async clipDone(blob, mime) {
    this.clipOn = false;
    const ext = mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm', back = this.back, share = this.canShareFiles();
    const show = msg => UI.openResult({ eyebrow: lt('HIGHLIGHT CLIP'), title: msg, col: '#ffd700', stars: null, best: false, stats: [[lt('LENGTH'), this.clipLen + 's'], [lt('SIZE'), (blob.size / 1048576).toFixed(1) + ' MB']],
      notes: share ? [] : [{ t: lt('Send the saved video from your gallery or downloads.'), c: 'mute' }],
      main: share ? [lt('SHARE'), () => this.shareBlob(blob, ext).then(r => show(r))] : [lt('SAVE AGAIN'), () => this.saveBlob(blob, ext).then(r => show(r))],
      alt: [lt('BACK'), () => { if (back) back(); else UI.openTitle(); }] });
    show(share ? lt('CLIP READY') : await this.saveBlob(blob, ext));
  }
});
Object.assign(UI, {
  openClipPick(rep, back) {
    this.show('clip'); const box = $('cpList'); box.textContent = '';
    const opts = $('cpOpt'); opts.textContent = '';
    const tog = (label, val, fn) => { const b = el('button', ''); b.appendChild(document.createTextNode(label)); b.appendChild(el('i', '', val)); b.onclick = () => { fn(); Aud.sfx('ui'); this.openClipPick(rep, back); }; opts.appendChild(b); };
    tog(lt('LENGTH'), Replays.clipLen + 's', () => { Replays.clipLen = Replays.clipLen === 10 ? 15 : Replays.clipLen === 15 ? 6 : 10; });
    tog(lt('SCORE CARD'), Replays.clipCard ? lt('ON') : lt('OFF'), () => { Replays.clipCard = Replays.clipCard ? 0 : 1; });
    for (const m of Replays.moments(rep)) {
      const b = el('button', 'route'); b.style.borderColor = m.k === 'FINALE' ? '#8fa4c8' : '#ffd700';
      b.appendChild(el('span', 'nm', lt(m.k))); b.appendChild(el('span', 'pr', fmtTime(m.at / 60)));
      b.appendChild(el('span', 'ds', ltf('{0} seconds ending just after this moment.', Replays.clipLen)));
      b.onclick = () => { Aud.sfx('buy'); Replays.clipAt(rep, back, m.at); }; box.appendChild(b);
    }
    $('cpBack').onclick = () => { Aud.sfx('back'); if (back) back(); else this.openTitle(); };
  }
});
