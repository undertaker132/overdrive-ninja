/* =====================================================================
   VERSION 51: ACCOUNTS ON THE GAME'S SITE (email or Google)
   The claude.ai version already saves to the cloud with the viewer's
   account. The standalone site saved only in the browser; now a player
   can sign in with an email link/code or with Google, and the whole save
   lives in the cloud: every device, nothing lost when the browser is
   cleared. It runs on Supabase (auth + one table, see docs/ACCOUNTS.md)
   and plugs into the game's own cloud save (Cloud in 21-store.js) through
   a small adapter with the same doc / collection calls, so the same
   merge-on-two-devices rules apply. Until SB below is filled in, nothing
   of this shows. Signing in is optional: guests keep playing as before.
   ===================================================================== */
const SB = Object.assign({ url: '', key: '' }, (typeof window !== 'undefined' && window.__SB) || {}); // the project URL and its public anon key (docs/ACCOUNTS.md)
const Acct = {
  s: null, busy: false,
  on() { return !!(SB.url && SB.key) && offlineBuild(); },
  in() { return !!(this.s && this.s.uid); },
  load() { try { this.s = JSON.parse(localStorage.getItem('od_sb') || 'null'); } catch (e) { this.s = null; } },
  keep() { try { if (this.s) localStorage.setItem('od_sb', JSON.stringify(this.s)); else localStorage.removeItem('od_sb'); } catch (e) { errLog(e); } },
  site() { return location.origin + location.pathname; },
  name() { const d = Store.data, s = this.s || {}; return String(d.acctName || s.gname || (s.email || 'player').split('@')[0] || 'PLAYER').slice(0, 18); },
  async req(method, path, body, auth, extra) {
    const h = { apikey: SB.key, 'Content-Type': 'application/json' };
    if (auth) { await this.fresh(); if (this.s) h.Authorization = 'Bearer ' + this.s.at; }
    Object.assign(h, extra || {});
    const r = await fetch(SB.url + path, { method, headers: h, body: body == null ? undefined : JSON.stringify(body) });
    const tx = await r.text(); let j = null; try { j = tx ? JSON.parse(tx) : null; } catch (e) { j = null; }
    if (!r.ok) { const e = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ('HTTP ' + r.status)); e.status = r.status; e.code = r.status === 403 ? 'invalid_argument' : ''; throw e; }
    return j;
  },
  take(j) { const u = j.user || {}, m = u.user_metadata || {};
    this.s = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + ((j.expires_in | 0) || 3600) * 1000, uid: u.id || (this.s && this.s.uid), email: u.email || (this.s && this.s.email) || '', gname: m.full_name || m.name || (this.s && this.s.gname) || '' }; this.keep(); },
  fresh() {
    if (!this.s || Date.now() < this.s.exp - 60000) return Promise.resolve();
    if (!this.refreshing) this.refreshing = this.req('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token: this.s.rt }, false)
      .then(j => this.take(j), e => { if (e.status >= 400 && e.status < 500) { this.s = null; this.keep(); } }).then(() => { this.refreshing = null; });
    return this.refreshing;
  },
  /* back from Google or from the email link: the session is in the address (#access_token=…) */
  async fromHash() {
    const h = location.hash || ''; if (!/access_token=|error_description=/.test(h)) return false;
    const q = new URLSearchParams(h.slice(1)); history.replaceState(null, '', location.pathname + location.search);
    if (q.get('error_description')) { toastDom(lt('Sign-in failed:') + ' ' + q.get('error_description').slice(0, 80)); return false; }
    this.s = { at: q.get('access_token'), rt: q.get('refresh_token'), exp: Date.now() + ((+q.get('expires_in') | 0) || 3600) * 1000 };
    try { const u = await this.req('GET', '/auth/v1/user', null, true); this.take({ access_token: this.s.at, refresh_token: this.s.rt, expires_in: (this.s.exp - Date.now()) / 1000, user: u }); return true; }
    catch (e) { errLog(e); this.s = null; this.keep(); return false; }
  },
  google() { location.href = SB.url + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(this.site()); },
  async sendEmail(email) { await this.req('POST', '/auth/v1/otp?redirect_to=' + encodeURIComponent(this.site()), { email, create_user: true }, false); },
  async verify(email, code) { const j = await this.req('POST', '/auth/v1/verify', { type: 'email', email, token: code }, false); this.take(j); },
  /* the game's cloud save, through the adapter */
  async connect() {
    if (!this.in()) return; const keep = window.claude;
    window.claude = { use: async n => n === 'user' ? SUser : n === 'db' ? SDB : null }; // (only while the cloud save starts: the rest of the site stays the standalone build)
    try { await Cloud.init(); } catch (e) { errLog(e); } finally { window.claude = keep; }
    if (Cloud.ready) { try { await SDB.doc('profiles/' + this.s.uid).set({ name: this.name() }); } catch (e) { errLog(e); } }
    try { UI.refreshProfile(); } catch (e) { errLog(e); }
  },
  signOut(gone) {
    if (!gone) try { Store.flush(true); } catch (e) { errLog(e); }
    if (this.s) this.req('POST', '/auth/v1/logout', {}, true).catch(() => { });
    this.s = null; this.keep(); Object.assign(Cloud, { ready: false, db: null, u: null, uid: null, conflict: null });
    Store.data.user = { id: 'guest', name: 'GUEST', guest: true }; Store.data.syncTs = 0; Store.touch(); try { UI.refreshProfile(); } catch (e) { errLog(e); }
  },
  async del() { const was = Cloud.ready; Cloud.ready = false; try { await this.req('POST', '/rest/v1/rpc/delete_me', {}, true); } catch (e) { Cloud.ready = was; throw e; } this.signOut(true); } // (no last push may bring the save back)
};
/* a document store in one table (docs: path, col, owner, data), with the calls the game already makes */
const SDB = {
  doc(path) { const id = path.split('/').pop(), col = path.split('/')[0], e = encodeURIComponent(path);
    return { id,
      async get() { const r = await Acct.req('GET', '/rest/v1/docs?select=data&path=eq.' + e, null, true), row = r && r[0]; return { exists: !!row, id, data: () => (row ? row.data : undefined) }; },
      async set(o) { await Acct.req('POST', '/rest/v1/docs?on_conflict=path', { path, col, data: o }, true, { Prefer: 'resolution=merge-duplicates,return=minimal' }); },
      async update(o) { const s = await this.get(); await this.set(Object.assign({}, s.exists ? s.data() : {}, o)); },
      async delete() { await Acct.req('DELETE', '/rest/v1/docs?path=eq.' + e, null, true, { Prefer: 'return=minimal' }); } };
  },
  collection(col) { const q = { f: [], o: null, n: 100 };
    const api = { where(f, op, v) { q.f.push([f, op, v]); return api; }, orderBy(f, d) { q.o = [f, d]; return api; }, limit(n) { q.n = n; return api; },
      async get() { const E = encodeURIComponent; let u = '/rest/v1/docs?select=path,data&col=eq.' + E(col);
        for (const [f, op, v] of q.f) u += '&data->>' + E(f) + '=' + ({ '==': 'eq', '>': 'gt', '<': 'lt', '>=': 'gte', '<=': 'lte' }[op] || 'eq') + '.' + E(String(v));
        if (q.o) u += '&order=data->' + E(q.o[0]) + '.' + (q.o[1] === 'asc' ? 'asc' : 'desc') + '.nullslast';
        const r = await Acct.req('GET', u + '&limit=' + (q.n | 0), null, true) || [];
        return { docs: r.map(x => ({ id: x.path.split('/').pop(), data: () => x.data })) }; } };
    return api; }
};
const SUser = {
  async id() { return Acct.s && Acct.s.uid; }, async isOwner() { return false; }, async can() { return true; },
  async me() { return { name: Acct.name() }; },
  async profiles(ids) { const o = {}; if (!ids || !ids.length) return o;
    const r = await Acct.req('GET', '/rest/v1/docs?select=path,data&col=eq.profiles&path=in.' + encodeURIComponent('(' + ids.map(i => '"profiles/' + i + '"').join(',') + ')'), null, true) || [];
    for (const x of r) o[x.path.split('/')[1]] = { name: (x.data && x.data.name) || 'Player' }; return o; }
};
/* ---------- the account card ---------- */
const AcctUI = {
  open() {
    if (!Acct.on() || document.querySelector('.acct51')) return; const ov = el('div', 'unlock39 acct51'), card = el('div', 'card'); ov.appendChild(card);
    const close = () => ov.remove(); ov.addEventListener('click', e => { if (e.target === ov) close(); });
    const draw = () => { card.textContent = '';
      if (Acct.in()) {
        card.appendChild(el('div', 'eyebrow', lt('ACCOUNT'))); card.appendChild(el('h2', '', lt('YOUR PROGRESS IS SAFE')));
        card.appendChild(el('div', 'small mute', (Acct.s.email || '') + ' · ' + lt(Cloud.ready ? 'CLOUD SAVE' : 'CONNECTING…')));
        const nm = document.createElement('input'); nm.className = 'acct-in'; nm.maxLength = 18; nm.value = Acct.name(); nm.setAttribute('aria-label', lt('PLAYER NAME'));
        nm.onchange = () => { const v = nm.value.trim().slice(0, 18); if (!v) return; Store.data.acctName = v; Store.data.user.name = v; Store.touch(); SDB.doc('profiles/' + Acct.s.uid).set({ name: v }).catch(errLog); try { UI.refreshProfile(); } catch (e) { errLog(e); } };
        card.appendChild(el('div', 'eyebrow', lt('PLAYER NAME'))); card.appendChild(nm);
        const row = el('div', 'row'), out = el('button', 'btn ghost', lt('SIGN OUT')), ok = el('button', 'btn pri', lt('DONE'));
        out.onclick = () => { Aud.sfx('back'); Acct.signOut(); toastDom(lt('Signed out. This device keeps a local copy.')); draw(); }; ok.onclick = () => { Aud.sfx('ui'); close(); };
        row.appendChild(out); row.appendChild(ok); card.appendChild(row);
        const del = el('button', 'chip acct-del', lt('DELETE MY ACCOUNT')); let armed = false;
        del.onclick = async () => { if (!armed) { armed = true; del.textContent = lt('TAP AGAIN TO DELETE FOREVER'); return; } del.disabled = true; try { await Acct.del(); toastDom(lt('Your account and cloud save were deleted.')); draw(); } catch (e) { del.disabled = false; toastDom(lt('Could not delete right now. Try again later.')); } };
        card.appendChild(del); return;
      }
      card.appendChild(el('div', 'eyebrow', lt('ACCOUNT'))); card.appendChild(el('h2', '', lt('SAVE YOUR PROGRESS')));
      card.appendChild(el('div', 'small', lt('Sign in and your progress is kept in the cloud: play on any device, and nothing is lost if the browser is cleared. Your progress so far comes with you.')));
      const g = el('button', 'btn pri acct-g', lt('CONTINUE WITH GOOGLE')); g.onclick = () => { Aud.sfx('ui'); Store.flush(true); Acct.google(); }; card.appendChild(g);
      card.appendChild(el('div', 'eyebrow', lt('OR WITH EMAIL')));
      const em = document.createElement('input'); em.type = 'email'; em.className = 'acct-in'; em.placeholder = 'name@example.com'; em.autocomplete = 'email'; card.appendChild(em);
      const send = el('button', 'btn', lt('SEND ME A SIGN-IN LINK')), msg = el('div', 'small mute'); card.appendChild(send); card.appendChild(msg);
      send.onclick = async () => { const v = em.value.trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { msg.textContent = lt('Type a valid email address.'); return; }
        send.disabled = true; msg.textContent = lt('Sending…');
        try { await Acct.sendEmail(v); Store.flush(true); msg.textContent = lt('Check your email: tap the link in it on this device, or type the code from it here.');
          if (!card.querySelector('.acct-code')) { const code = document.createElement('input'); code.className = 'acct-in acct-code'; code.inputMode = 'numeric'; code.maxLength = 10; code.placeholder = lt('CODE'); const go = el('button', 'btn pri', lt('SIGN IN'));
            go.onclick = async () => { go.disabled = true; try { await Acct.verify(v, code.value.trim()); await Acct.connect(); Aud.sfx('star'); draw(); } catch (e) { go.disabled = false; msg.textContent = lt('That code did not work. Check it, or ask for a new one.'); } };
            card.appendChild(code); card.appendChild(go); } }
        catch (e) { msg.textContent = lt('Could not send right now. Try again in a minute.'); } send.disabled = false; };
      const later = el('button', 'btn ghost', lt('LATER')); later.onclick = () => { Aud.sfx('back'); close(); }; card.appendChild(later);
    };
    draw(); document.body.appendChild(ov); Aud.sfx('ui');
  },
  nudge() { // a guest with real progress gets asked, at most every 3 days
    const d = Store.data; if (!Acct.on() || Acct.in() || UI.cur !== 'title' || document.querySelector('.unlock39, .coach46, .cr-film')) return;
    if (Store.stars() < 6 || Date.now() - (d.acctNudge || 0) < 3 * 864e5) return; d.acctNudge = Date.now(); Store.touch(); this.open();
  }
};
{
  Acct.load();
  if (Acct.on()) {
    const boot = async () => { const back = await Acct.fromHash(); if (Acct.in()) { await Acct.fresh(); if (Acct.in()) await Acct.connect(); if (back) toastDom(ltf('Signed in as {0}. Your progress is saved in the cloud.', Acct.name())); } };
    boot().catch(errLog);
    // the profile chip on the home screen: a guest opens the account card, a signed-in player sees it at the top of the profile
    const rp0 = UI.refreshProfile.bind(UI); UI.refreshProfile = function () { rp0(); try { const p = $('tProfile'); if (p && Store.data.user.guest) p.textContent = lt('GUEST') + ' · ' + lt('SIGN IN'); } catch (e) { errLog(e); } };
    const tp = $('tProfile'); if (tp) tp.onclick = () => { Aud.sfx('ui'); if (!Acct.in()) AcctUI.open(); else UI.openProfile(); };
    const rm0 = UI.renderProfileMe.bind(UI); UI.renderProfileMe = function () { rm0(); try { const me = $('meTop'); if (me && !me.querySelector('.acct-chip')) { const c = el('button', 'chip acct-chip', Acct.in() ? lt('ACCOUNT') + ' · ' + (Acct.s.email || '') : lt('SIGN IN TO SAVE IN THE CLOUD')); c.onclick = () => AcctUI.open(); me.appendChild(c); } } catch (e) { errLog(e); } };
    const ot7 = UI.openTitle.bind(UI); UI.openTitle = function () { const r = ot7.apply(this, arguments); setTimeout(() => { try { AcctUI.nudge(); } catch (e) { errLog(e); } }, 2600); return r; };
    try { UI.refreshProfile(); } catch (e) { errLog(e); }
  }
  const css = document.createElement('style'); css.id = 'v51css';
  css.textContent = `.acct51 .card { gap: 10px; max-width: 360px; } .acct51 h2 { color: #00f2fe; }
.acct-in { width: 100%; box-sizing: border-box; min-height: 46px; padding: 0 12px; background: #070a18; color: #fff; border: 1px solid rgba(0, 242, 254, .45); font: 600 16px var(--fm); direction: ltr; }
.acct-in:focus { outline: 2px solid #00f2fe; } .acct-g { background: #fff !important; color: #1a1a1a !important; } .acct-del { align-self: center; color: #ff6b7d; border-color: rgba(255, 42, 74, .5); }
.acct-chip { margin-top: 8px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`;
  document.head.appendChild(css);
}
