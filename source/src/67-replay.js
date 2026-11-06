/* =====================================================================
   REPLAY UI + CLOUD + MODERATION — watch a recorded run (yours or the
   #1 player's), upload personal-best replays, save a 10-second clip of a
   run's best moment, and the owner's leaderboard tools: re-simulate a
   score to verify it, remove a score, ban a player.
   db: replays/<uid>/m/<mode> = { v, m, s, at, h: header, e: actions }
       (everyone reads, each player writes only their own)
       mod/bans, mod/verified (everyone reads, only the owner writes)
   ===================================================================== */
const Replays = {
  pack(rep) { return { h: rep.hdr, e: REC.encode(rep) }; },
  unpack(o) { if (!o || !o.h || typeof o.e !== 'string') return null; try { const d = REC.decode(o.e); return { hdr: o.h, ev: d.ev, cs: d.cs }; } catch (e) { return null; } },
  path(uid, mode) { return 'replays/' + uid + '/m/' + mode; },
  async upload(mode, rep) { // a personal best: anyone can watch it, the owner can verify it
    if (!rep || !rep.hdr || !Cloud.ready || Cloud.readOnly || G.assist) return false;
    let e; try { e = REC.encode(rep); } catch (err) { return false; }
    if (e.length > 220000) return false; // a document holds at most 256 KiB
    const h = Object.assign({}, rep.hdr); delete h.nm; // names are resolved from ids, never stored
    try { await Cloud.db.doc(this.path(Cloud.uid, mode)).set({ v: VERSION, m: mode, s: ii(h.sc), at: Date.now(), h, e }); return true; } catch (err) { return false; }
  },
  async fetch(uid, mode) {
    if (!Cloud.ready || !uid) return null;
    try { const s = await Cloud.db.doc(this.path(uid, mode)).get(); if (!s.exists) return null; const o = s.data() || {}, r = this.unpack(o); if (r) r.meta = { s: ii(o.s), v: o.v, at: tsn(o.at) }; return r; } catch (e) { return null; }
  },
  usable(rep) { return !!(rep && rep.hdr && SIM_COMPAT.indexOf(rep.hdr.v) >= 0); },
  /* watch in real time (letterboxed), with the replay bar */
  watch(rep, label, back) {
    if (!this.usable(rep)) { toastDom(lt('This replay was recorded on an older version of the game.')); return false; }
    this.cur = rep; this.back = back || null; this.label = label || '';
    const s = REPLAY.start(rep, { speed: 1, label: this.label, onEnd: r => this.ended(r) });
    if (!s.ok) { toastDom(lt('Could not start the replay.')); return false; }
    UI.replayBar(true); return true;
  },
  ended(r) {
    if (this.clipOn) return; // a clip finishes in clipDone()
    const rep = this.cur, h = rep.hdr;
    UI.openResult({
      eyebrow: lt('REPLAY') + (this.label ? ' · ' + this.label : ''), title: r.stopped ? lt('REPLAY STOPPED') : lt('REPLAY OVER'), col: '#00f2fe', stars: null, best: false,
      stats: [[lt('SCORE'), fmtNum(r.score)], [lt('RECORDED'), fmtNum(ii(h.sc))], [lt('TIME'), fmtTime(r.time)], [lt('KILLS'), '' + r.kills]],
      notes: r.stopped ? [] : [{ t: r.match ? lt('The replay reproduced the recorded score exactly.') : lt('The replay did not reproduce the recorded score.'), c: r.match ? 'gold' : 'mute' }],
      main: [lt('WATCH AGAIN'), () => this.watch(rep, this.label, this.back)],
      alt: [lt('BACK'), () => { const b = this.back; this.back = null; if (b) b(); else UI.openTitle(); }]
    });
    $('rsMenu').onclick = () => { Aud.sfx('back'); UI.openTitle(); };
  },
  /* re-simulate without drawing and compare the score */
  async verify(rep) {
    if (!this.usable(rep)) return { match: false, why: 'version' };
    const s = REPLAY.start(rep, { fast: true }); if (!s.ok) return { match: false, why: s.why };
    const r = await REPLAY.runFast(); return r || { match: false };
  },
  /* highlight clip: 8 s before the best moment to 2 s after, recorded from the canvas */
  clipOk() { // video clips need a recorder and a strong enough device (4+ cores, 3+ GB when the browser says)
    const nav = typeof navigator !== 'undefined' ? navigator : {}, strong = (nav.hardwareConcurrency || 4) >= 4 && !(nav.deviceMemory && nav.deviceMemory < 3);
    return strong && typeof MediaRecorder !== 'undefined' && !!(cv && cv.captureStream);
  },
  clipMime() { for (const t of ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']) try { if (MediaRecorder.isTypeSupported(t)) return t; } catch (e) { errLog(e); } return ''; },
  best(rep) { const hl = (rep.hdr.hl || []).slice().sort((a, b) => (b[2] - a[2]) || (b[0] - a[0]))[0]; return hl ? hl[0] : Math.max(0, (rep.hdr.tk | 0) - 120); },
  clip(rep, back) {
    if (!this.clipOk() || !this.clipMime()) { toastDom(lt('Video clips need a newer browser.')); return; }
    if (!this.usable(rep)) { toastDom(lt('This replay was recorded on an older version of the game.')); return; }
    if (REPLAY.on) REPLAY.stop();
    const at = this.best(rep), from = Math.max(0, at - 480), to = Math.min(rep.hdr.tk | 0, at + 120);
    this.cur = rep; this.back = back || null; this.clipOn = true;
    const s = REPLAY.start(rep, { speed: 1, label: lt('CLIP'), from, stopAt: to, onSeeked: () => this.recStart(), onEnd: () => this.recStop() });
    if (!s.ok) { this.clipOn = false; toastDom(lt('Could not start the replay.')); return; }
    UI.replayBar(true); $('rbClip').disabled = true;
  },
  recStart() {
    try {
      const mime = this.clipMime(), stream = cv.captureStream(30), chunks = [];
      const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5e6 });
      mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); this.clipDone(new Blob(chunks, { type: mime.split(';')[0] }), mime); };
      mr.start(250); this.mr = mr; toastDom(lt('RECORDING CLIP…'));
    } catch (e) { this.mr = null; this.clipOn = false; REPLAY.stop(); toastDom(lt('Video clips need a newer browser.')); }
  },
  recStop() { const mr = this.mr; this.mr = null; if (mr && mr.state !== 'inactive') mr.stop(); else { this.clipOn = false; this.ended(REPLAY.result || { score: 0, time: 0, kills: 0, stopped: true }); } },
  async clipDone(blob, mime) {
    this.clipOn = false;
    const ext = mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm', back = this.back;
    const show = msg => UI.openResult({ eyebrow: lt('HIGHLIGHT CLIP'), title: msg, col: '#ffd700', stars: null, best: false, stats: [[lt('LENGTH'), '10s'], [lt('SIZE'), (blob.size / 1048576).toFixed(1) + ' MB']], notes: [],
      main: [lt('SAVE AGAIN'), () => this.saveBlob(blob, ext).then(r => show(r))], alt: [lt('BACK'), () => { if (back) back(); else UI.openTitle(); }] });
    show(await this.saveBlob(blob, ext));
  },
  async saveBlob(blob, ext) {
    const r = await saveFile(blob, 'overdrive-highlight.' + ext);
    return r === 'saved' ? lt('CLIP SAVED') : r === 'declined' ? lt('NOT SAVED') : lt('SAVING IS NOT AVAILABLE HERE');
  }
};
Object.assign(UI, {
  replayBar(on) {
    const b = $('replayBar'); if (!b) return; b.classList.toggle('hidden', !on);
    if (!on) return;
    $('rbName').textContent = REPLAY.label || lt('REPLAY'); $('rbPlay').textContent = '❚❚'; $('rbSpeed').textContent = REPLAY.speed + '×';
    $('rbClip').disabled = !Replays.clipOk() || Replays.clipOn; $('rbClip').classList.toggle('hidden', !Replays.clipOk());
  },
  replayTick() { // progress bar + clock while a replay plays
    if (!REPLAY.on || REPLAY.fast) return;
    const f = $('rbFill'); if (f) f.style.width = (REPLAY.progress() * 100).toFixed(1) + '%';
    const t = $('rbTime'); if (t) t.textContent = REPLAY.seekTo > TICK.n ? lt('LOADING…') + ' ' + Math.round(TICK.n / Math.max(1, REPLAY.seekTo) * 100) + '%' : fmtTime(TICK.n / 60) + ' / ' + fmtTime((REPLAY.hdr.tk | 0) / 60);
  },
  replayExit() { if (REPLAY.on) REPLAY.stop(); }
});
/* ---------------- moderation (owner) + what every viewer reads ---------------- */
const SCORE_CAPS = { bestStd: 5e9, bestTa: 5e8, bestBr: 2e8, bestAr: 4e8, bestHw: 4e8, bestMay: 1e10, bestDaily: 5e9, wk: 5e9, speedMs: 6e6 }; // anything past these is not a real run
const Mod = {
  bans: {}, ver: {}, loaded: 0,
  async load(force) {
    if (!Cloud.ready || (!force && Date.now() - this.loaded < 60000)) return;
    try { const a = await Cloud.db.doc('mod/bans').get(); this.bans = a.exists ? a.data() || {} : {}; } catch (e) { errLog(e); }
    try { const b = await Cloud.db.doc('mod/verified').get(); this.ver = b.exists ? b.data() || {} : {}; } catch (e) { errLog(e); }
    this.loaded = Date.now();
  },
  banned(uid) { return !!(this.bans[uid] && this.bans[uid].at); },
  plausible(field, v) { const cap = SCORE_CAPS[field.indexOf('wk') === 0 ? 'wk' : field]; return Number.isFinite(v) && v >= 0 && (!cap || v <= cap); },
  status(uid, mode, score) { const v = this.ver[uid + ':' + mode]; if (!v || (ii(v.s)) !== (ii(score))) return 0; return v.ok ? 1 : -1; }, // 1 verified, -1 failed, 0 unknown
  async put(doc, key, val) { const ref = Cloud.db.doc('mod/' + doc), s = await ref.get(), o = s.exists ? s.data() || {} : {}; if (val == null) delete o[key]; else o[key] = val; await ref.set(o); },
  async ban(uid, on) { await this.put('bans', uid, on ? { at: Date.now() } : null); await this.load(true); },
  async mark(uid, mode, score, ok) { await this.put('verified', uid + ':' + mode, { s: ii(score), ok: ok ? 1 : 0, at: Date.now() }); await this.load(true); },
  async remove(uid, field) { const o = {}; o[field] = 0; await Cloud.db.doc('players/' + uid).update(o); }
};
Object.assign(UI, {
  modTab: 0,
  async renderModTab(box) { // owner: check, remove and ban leaderboard entries
    const tabs = CLUB_TABS.filter(t => t[2] !== 'speed').concat([['bestMay', 'MAYHEM', 'mayhem'], ['speedMs', 'SPEED', 'speed']]), tab = tabs[this.modTab] || tabs[0], field = clubField(tab), asc = tab[0] === 'speedMs';
    box.textContent = ''; if (!Cloud.ready || !Cloud.owner) { box.appendChild(el('div', 'panel info', lt('Could not load. The dashboard only works for the game owner, signed in.'))); return; }
    const seg = el('div', 'seg'); seg.style.gridTemplateColumns = 'repeat(4,1fr)';
    tabs.forEach((t, i) => { const b = el('button', i === this.modTab ? 'on' : '', lt(t[1])); b.onclick = () => { this.modTab = i; this.renderModTab(box); }; seg.appendChild(b); }); box.appendChild(seg);
    box.appendChild(el('div', 'small mute', lt('VERIFY re-runs the saved replay and checks it lands on the same score. Removed scores are set to 0; banned players are hidden from every board.')));
    const list = el('div', 'list'); box.appendChild(list); list.appendChild(el('div', 'panel info mute', lt('Loading…')));
    let rows = null; try { rows = await Cloud.top(field, tab[0] === 'bestDaily', asc); await Mod.load(true); } catch (e) { rows = null; }
    if (this.cur !== 'dash') return; list.textContent = '';
    rows = (rows || []).filter(r => (ii(r[field])) > 0);
    if (!rows.length) { list.appendChild(el('div', 'panel info', lt('No scores here yet.'))); return; }
    rows.forEach((r, i) => {
      const p = el('div', 'panel small'), st = Mod.status(r.id, tab[2], r[field]), bad = !Mod.plausible(field, r[field]), ban = Mod.banned(r.id);
      p.appendChild(el('div', ban ? 'mute' : 'gold', '#' + (i + 1) + ' ' + r.name + ' · ' + (asc ? fmtMs(ii(r[field])) : fmtNum(ii(r[field]))) + ' · ' + (ban ? lt('BANNED') : bad ? lt('IMPOSSIBLE SCORE') : st === 1 ? lt('VERIFIED ✓') : st === -1 ? lt('FAILED CHECK ✗') : lt('NOT CHECKED'))));
      const row = el('div', 'chips'), msg = el('div', 'mute');
      const add = (t, fn) => { const b = el('button', 'chip', lt(t)); b.onclick = async () => { b.disabled = true; try { await fn(); } catch (e) { msg.textContent = lt('That did not work. Check the connection and try again.'); } b.disabled = false; }; row.appendChild(b); };
      if (tab[2] !== 'speed') {
        add('VERIFY', async () => {
          msg.textContent = lt('Re-running the replay…'); const rep = await Replays.fetch(r.id, tab[2]);
          if (!rep) { msg.textContent = lt('No replay saved for this run.'); return; }
          if (!Replays.usable(rep)) { msg.textContent = lt('This replay was recorded on an older version of the game.'); return; }
          const res = await Replays.verify(rep), ok = !!(res && res.match) && (ii(rep.hdr.sc)) === (ii(r[field]));
          await Mod.mark(r.id, tab[2], r[field], ok); this.cur = 'dash'; UI.show('dash');
          msg.textContent = ok ? lt('Verified: the replay lands exactly on this score.') : ltf('Failed: the replay ends on {0}, the board says {1}.', fmtNum(ii(res && res.score)), fmtNum(ii(r[field])));
          this.renderModTab(box);
        });
        add('WATCH', async () => { const rep = await Replays.fetch(r.id, tab[2]); if (rep) Replays.watch(rep, r.name, () => this.openDash()); else msg.textContent = lt('No replay saved for this run.'); });
      }
      add('REMOVE SCORE', async () => { await Mod.remove(r.id, field); msg.textContent = lt('Score removed.'); this.renderModTab(box); });
      add(ban ? 'UNBAN' : 'BAN', async () => { await Mod.ban(r.id, !ban); this.renderModTab(box); });
      p.appendChild(row); p.appendChild(msg); list.appendChild(p);
    });
  }
});
