/* =====================================================================
   V12 — a title screen that opens up as you play, a daily login bonus,
   invite codes, crews with a weekly crew table, and live story balancing
   from the creator dashboard.
   db: players/<uid> also carries rc (your invite code), rb (who invited
   you), un (story progress) and crew; clans/<founder uid> is a crew;
   mod/tune holds the owner's per-stage difficulty steps (all read it).
   ===================================================================== */

/* ---------------- progressive title screen ---------------- */
const GATES = [ // need = story.unlocked (1 = stage 1-1 cleared)
  { id: 'hero', el: 'tHero', need: 1 },
  { id: 'login', el: 'tLogin', need: 1 },
  { id: 'arsenal', el: 'bArsenal', need: 1, n: 'ARSENAL' },
  { id: 'dojo', el: 'bDojo', need: 1, n: 'DOJO' },
  { id: 'hideout', el: 'bHideout', need: 2, n: 'HIDEOUT' },
  { id: 'editor', el: 'bEditor', need: 3, n: 'LEVEL EDITOR' },
  { id: 'arcade', el: 'bArcade', need: 2, n: 'ARCADE' },
  { id: 'daily', el: 'bDaily', need: 2, n: 'DAILY RUN' },
  { id: 'bounty', el: 'tBountyBox', need: 2, n: 'BOUNTIES' },
  { id: 'profile', el: 'bProfile', need: 3, n: 'PROFILE & CODEX' },
  { id: 'season', el: 'bSeason', need: 3, n: 'SEASON' },
  { id: 'club', el: 'bClub', need: 3, n: 'CLUB' },
  { id: 'weekly', el: 'bWeekly', need: 4, n: 'WEEKLY' },
  { id: 'puzzle', el: 'bPuzzle', need: 4, n: 'PUZZLES' },
  { id: 'live', el: 'bLive', need: 6, n: 'PLAY LIVE' }
];
const Gate = {
  bound: false,
  init() { // players who already played keep everything open
    const d = Store.data;
    if (d.uiAll == null) { d.uiAll = ((d.stats && d.stats.runs) | 0) > 0 || (d.story.unlocked | 0) > 0 ? 1 : 0; Store.touch(); }
    if (!d.uiSeen || typeof d.uiSeen !== 'object') d.uiSeen = {};
    if (!d.uiTold || typeof d.uiTold !== 'object') d.uiTold = {};
  },
  lv() { return Store.data.story.unlocked | 0; },
  open(id) { this.init(); if (Store.data.uiAll) return true; const g = GATES.find(q => q.id === id); return !g || this.lv() >= g.need; },
  apply() {
    this.init(); const d = Store.data, fresh = [];
    if (!this.bound) { // the NEW badge goes away once the button is used
      this.bound = true;
      for (const g of GATES) { const e = $(g.el); if (e && g.n) e.addEventListener('click', () => { if (!Store.data.uiSeen[g.id]) { Store.data.uiSeen[g.id] = 1; Store.touch(); e.classList.remove('new'); } }, true); }
    }
    for (const g of GATES) {
      const e = $(g.el); if (!e) continue; const on = this.open(g.id);
      e.classList.toggle('hidden', !on);
      const isNew = !!(on && g.n && !d.uiAll && !d.uiSeen[g.id]);
      e.classList.toggle('new', isNew); if (isNew) e.dataset.new = lt('NEW');
      if (isNew && !d.uiTold[g.id]) { d.uiTold[g.id] = 1; fresh.push(lt(g.n)); }
    }
    if (fresh.length) { Store.touch(); setTimeout(() => { if (UI.cur === 'title') toastDom(ltf('NEW ON THE TITLE SCREEN: {0}', fresh.join(', '))); }, 650); }
    const rv = $('tRivals'); if (rv && !this.open('club')) rv.classList.add('hidden');
    this.renderNext();
  },
  renderNext() {
    const box = $('tNext'); if (!box) return; box.textContent = '';
    const d = Store.data, lv = this.lv();
    const locked = d.uiAll ? [] : GATES.filter(g => g.n && lv < g.need);
    if (!locked.length) { box.classList.add('hidden'); return; }
    const need = Math.min(...locked.map(g => g.need)), names = locked.filter(g => g.need === need).map(g => lt(g.n));
    box.classList.remove('hidden');
    box.appendChild(el('span', 'lk', '🔒'));
    const t = el('span', '');
    if (lv === 0) t.appendChild(el('div', '', lt('Start with the story. New modes open as you play.')));
    const ln = el('div', ''); ln.appendChild(document.createTextNode(ltf('Clear stage {0} to open:', STAGES[need - 1].id) + ' ')); ln.appendChild(el('b', '', names.join(', '))); t.appendChild(ln);
    box.appendChild(t);
  }
};

/* ---------------- daily login bonus ---------------- */
const LOGIN_CR = [100, 150, 200, 250, 300, 400, 600];
function localDay() { const t = new Date(); return Math.floor((t.getTime() - t.getTimezoneOffset() * 60000) / 86400000); }
const Login = {
  L() { const d = Store.data; if (!d.login || typeof d.login !== 'object') d.login = { day: 0, n: 0, total: 0 }; return d.login; },
  state() { const L = this.L(), today = localDay(); if (L.day === today) return { claimed: true, n: L.n | 0 }; return { claimed: false, n: L.day === today - 1 ? (L.n | 0) % 7 + 1 : 1 }; },
  claim() {
    const s = this.state(); if (s.claimed || REPLAY.on) return 0;
    const L = this.L(), cr = LOGIN_CR[s.n - 1]; L.day = localDay(); L.n = s.n; L.total = (L.total | 0) + 1;
    Store.data.credits += cr; if (s.n === 7) Season.gain(150);
    Store.touch(); Store.flush(); Aud.sfx('buy'); vibe('reward');
    return cr;
  },
  render() {
    const box = $('tLogin'); if (!box) return; box.textContent = '';
    const s = this.state();
    if (s.claimed || !Gate.open('login')) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.appendChild(el('div', 'eyebrow', ltf('DAILY BONUS · DAY {0}/7', s.n)));
    const days = el('div', 'days');
    LOGIN_CR.forEach((cr, i) => { const sp = el('span', i + 1 < s.n ? 'got' : i + 1 === s.n ? 'now' : ''); sp.appendChild(el('b', '', i + 1 < s.n ? '✓' : ltf('DAY {0}', i + 1))); sp.appendChild(document.createTextNode(cr + (i === 6 ? '+' : ''))); days.appendChild(sp); });
    box.appendChild(days);
    const b = el('button', 'btn gold', ltf('CLAIM {0} CR', LOGIN_CR[s.n - 1]) + (s.n === 7 ? ' + ' + ltf('{0} SEASON XP', 150) : ''));
    b.onclick = () => { const cr = this.claim(); if (cr) { toastDom(ltf('DAILY BONUS +{0} CR', cr)); UI.refreshProfile(); UI.renderTitleHero(); this.render(); } };
    box.appendChild(b); box.appendChild(el('div', 'small mute', lt('Come back every day: day 7 pays the most.')));
  }
};

/* ---------------- invite a friend ---------------- */
const INV_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', INV_CR = 300, INV_MAX = 10;
function invCode(uid) { let h = hashStr('od-invite:' + uid), s = ''; for (let i = 0; i < 6; i++) { s += INV_ABC[h & 31]; h >>>= 5; } return s; }
const Invite = {
  friends: [],
  code() { return Cloud.ready && Cloud.uid ? invCode(Cloud.uid) : ''; },
  canEnter() { const d = Store.data; return !d.refBy && (d.story.unlocked | 0) < 3; },
  async apply(raw) {
    const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) return 'bad';
    if (!Cloud.ready || Cloud.readOnly) return 'offline';
    if (code === this.code()) return 'self';
    if (!this.canEnter()) return 'late';
    let docs; try { docs = (await Cloud.db.collection('players').where('rc', '==', code).limit(3).get()).docs; } catch (e) { return 'net'; }
    const hit = docs.find(x => x.id !== Cloud.uid); if (!hit) return docs.length ? 'self' : 'none';
    const d = Store.data; d.refBy = hit.id; d.refName = '';
    try { const ps = await Cloud.u.profiles([hit.id]); d.refName = (ps[hit.id] && ps[hit.id].name) || ''; } catch (e) { errLog(e); }
    Store.touch(); Store.flush(true); try { await Cloud.publishStats(); } catch (e) { errLog(e); }
    return 'ok';
  },
  friendCheck() { // you were invited: finishing chapter 1 unlocks the hero for you too
    const d = Store.data; if (!d.refBy || d.refGot || (d.story.unlocked | 0) < 3 || REPLAY.on) return false;
    d.refGot = 1; d.skins.twin = 1; d.credits += INV_CR; Store.touch();
    toastDom(ltf('INVITE REWARD: NEON TWINS +{0} CR', INV_CR)); vibe('reward');
    return true;
  },
  async inviterCheck() { // your friends who finished chapter 1 with your code
    if (!Cloud.ready || !Cloud.uid || Store.lock) return;
    let docs; try { docs = (await Cloud.db.collection('players').where('rb', '==', Cloud.uid).limit(50).get()).docs; } catch (e) { return; }
    const d = Store.data; if (!d.refPaid || typeof d.refPaid !== 'object') d.refPaid = {};
    let n = 0;
    this.friends = docs.map(x => { const v = x.data() || {}; return { id: x.id, done: (v.un | 0) >= 3, name: '' }; });
    for (const f of this.friends) if (f.done && !d.refPaid[f.id] && Object.keys(d.refPaid).length < INV_MAX) { d.refPaid[f.id] = 1; n++; }
    try { const ps = await Cloud.u.profiles(this.friends.map(f => f.id).slice(0, 50)); for (const f of this.friends) f.name = (ps[f.id] && ps[f.id].name) || ''; } catch (e) { errLog(e); }
    if (n) { d.skins.twin = 1; d.credits += INV_CR * n; Store.touch(); Store.flush(); toastDom(ltf('FRIEND REWARD: NEON TWINS +{0} CR', INV_CR * n)); if (UI.refreshProfile) UI.refreshProfile(); }
    if (UI.cur === 'invite') UI.renderInvite();
  }
};

/* ---------------- crews ---------------- */
const CREW_COLS = ['#00f2fe', '#ff2bd6', '#ffd700', '#00ff88', '#ff6a00', '#a66bff'], CREW_MAX = 20;
function crewName(s) { return String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 18); }
function crewTag(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); }
const Crews = {
  rows: null, names: {}, err: false, loading: false,
  async load() {
    if (!Cloud.ready) return;
    this.loading = true; this.err = false;
    try {
      const [cs, ps] = await Promise.all([Cloud.db.collection('clans').limit(300).get(), Cloud.db.collection('players').limit(1000).get()]);
      try { await Mod.load(); } catch (e) { errLog(e); }
      const wk = 'wk' + weekKey(), crews = {};
      for (const x of cs.docs) {
        const v = x.data() || {}; if (Mod.banned(x.id)) continue;
        const name = crewName(v.name), tag = crewTag(v.tag); if (!name || tag.length < 2) continue;
        crews[x.id] = { id: x.id, name, tag, col: CREW_COLS[(v.col | 0) % CREW_COLS.length], members: [], total: 0 };
      }
      for (const x of ps.docs) {
        const v = x.data() || {}, c = crews[v.crew]; if (!c || Mod.banned(x.id)) continue;
        const sc = Mod.plausible(wk, ii(v[wk])) ? ii(v[wk]) : 0;
        c.members.push({ id: x.id, wk: sc, me: x.id === Cloud.uid });
      }
      const list = Object.values(crews).filter(c => c.members.some(m => m.id === c.id)); // a crew lives while its founder is in it
      for (const c of list) { c.members.sort((a, b) => b.wk - a.wk); c.members = c.members.slice(0, CREW_MAX); c.total = c.members.reduce((s, m) => s + m.wk, 0); }
      list.sort((a, b) => b.total - a.total || b.members.length - a.members.length);
      this.rows = list;
      const ids = []; for (const c of list) for (const m of c.members) if (!(m.id in this.names)) ids.push(m.id);
      for (let i = 0; i < ids.length; i += 50) { try { const p = await Cloud.u.profiles(ids.slice(i, i + 50)); for (const id of ids.slice(i, i + 50)) this.names[id] = (p[id] && p[id].name) || ''; } catch (e) { errLog(e); } }
    } catch (e) { this.err = true; }
    this.loading = false;
  },
  mine() { const id = Store.data.crew; return id && this.rows ? this.rows.find(c => c.id === id) || null : null; },
  async set(id) { Store.data.crew = id || ''; Store.touch(); Store.flush(true); try { await Cloud.publishStats(); } catch (e) { errLog(e); } },
  async create(name, tag, col) {
    name = crewName(name); tag = crewTag(tag);
    if (name.length < 3) return 'name'; if (tag.length < 2) return 'tag';
    if (!Cloud.ready || Cloud.readOnly) return 'offline';
    if (this.rows && this.rows.some(c => c.tag === tag && c.id !== Cloud.uid)) return 'taken';
    try { await Cloud.db.doc('clans/' + Cloud.uid).set({ name, tag, col: col | 0, at: Date.now() }); } catch (e) { return 'net'; }
    await this.set(Cloud.uid); ach('crew');
    return 'ok';
  },
  async join(id) {
    const c = this.rows && this.rows.find(q => q.id === id); if (!c) return 'gone';
    if (c.members.length >= CREW_MAX) return 'full';
    if (Store.data.crew === Cloud.uid && id !== Cloud.uid) await this.disband();
    await this.set(id); ach('crew'); return 'ok';
  },
  async leave() { if (Store.data.crew === Cloud.uid) await this.disband(); await this.set(''); },
  async disband() { try { await Cloud.db.doc('clans/' + Cloud.uid).delete(); } catch (e) { errLog(e); } },
  async remove(id) { try { await Cloud.db.doc('clans/' + id).delete(); } catch (e) { errLog(e); } } // owner moderation
};

/* ---------------- live story balancing (owner tunes, everyone reads) ---------------- */
const Tune = {
  st: {}, loaded: 0,
  async load(force) {
    if (!Cloud.ready || (!force && Date.now() - this.loaded < 120000)) return;
    try { const s = await Cloud.db.doc('mod/tune').get(); const v = s.exists ? s.data() || {} : {}; this.st = v.st && typeof v.st === 'object' ? v.st : {}; } catch (e) { errLog(e); }
    this.loaded = Date.now();
  },
  step(id) { return clamp((this.st[id] | 0), -3, 3); },
  async save(st) { await Cloud.db.doc('mod/tune').set({ st, at: Date.now() }); this.st = st; this.loaded = Date.now(); }
};
function tuneStage(s) { G.tune = s && !REPLAY.on ? Tune.step(s.id) : 0; } // called from Director.begin for story stages

/* ---------------- screens ---------------- */
Object.assign(UI, {
  titleV12() { Gate.apply(); Login.render(); Invite.friendCheck(); },
  async openCrews() {
    this.show('crew'); this.backFn = () => this.openClub();
    $('crWeek').textContent = lt('THIS WEEK');
    const box = $('crBox'); box.textContent = '';
    if (!Cloud.ready) { box.appendChild(el('div', 'panel info', lt(offlineBuild() ? 'Crews are in the online version of the game.' : 'Sign in to join or start a crew.'))); return; }
    box.appendChild(el('div', 'panel info mute', lt('Loading crews…')));
    await Crews.load(); if (this.cur !== 'crew') return;
    this.renderCrews();
  },
  renderCrews() {
    const box = $('crBox'); box.textContent = '';
    if (Crews.err || !Crews.rows) { box.appendChild(el('div', 'panel info', lt('Crews did not load. Check your connection and try again.'))); return; }
    const mine = Crews.mine(), tagEl = c => { const t = el('span', 'crew-tag', c.tag); t.style.background = c.col; return t; };
    box.appendChild(el('div', 'small mute', lt('A crew adds up its members\' WEEKLY scores. Play the weekly challenge to push your crew up the table.')));
    if (mine) {
      const p = el('div', 'panel'); const h = el('h2', ''); h.appendChild(tagEl(mine)); h.appendChild(document.createTextNode(mine.name)); p.appendChild(h);
      const rk = Crews.rows.indexOf(mine) + 1;
      p.appendChild(el('div', 'small gold', ltf('#{0} of {1} crews · {2} points this week · {3}/{4} members', rk, Crews.rows.length, fmtNum(mine.total), mine.members.length, CREW_MAX)));
      for (const m of mine.members) { const r = el('div', 'bty'); r.appendChild(el('span', m.me ? 'gold' : '', (Crews.names[m.id] || lt('Player')) + (m.id === mine.id ? ' ★' : '') + (m.me ? ' ' + lt('(YOU)') : ''))); r.appendChild(el('span', 'mute', fmtNum(m.wk))); p.appendChild(r); }
      const lv = el('button', 'btn ghost', mine.id === Cloud.uid ? lt('DISBAND CREW') : lt('LEAVE CREW')); lv.style.marginTop = '8px';
      lv.onclick = async () => { if (lv.dataset.sure !== '1') { lv.dataset.sure = '1'; lv.textContent = lt('TAP AGAIN TO CONFIRM'); return; } Aud.sfx('back'); lv.disabled = true; await Crews.leave(); await Crews.load(); if (this.cur === 'crew') this.renderCrews(); };
      if (!Cloud.readOnly) p.appendChild(lv); box.appendChild(p);
    }
    box.appendChild(el('div', 'eyebrow', lt('CREW TABLE')));
    if (!Crews.rows.length) box.appendChild(el('div', 'panel info', lt('No crews yet. Start the first one.')));
    Crews.rows.slice(0, 50).forEach((c, i) => {
      const r = el('div', 'crew-row' + (mine === c ? ' me' : '')); r.appendChild(el('span', 'rk', '#' + (i + 1)));
      const nm = el('span', 'nm'); nm.appendChild(tagEl(c)); nm.appendChild(document.createTextNode(c.name + ' · ' + (c.members.length === 1 ? lt('1 member') : ltf('{0} members', c.members.length)))); r.appendChild(nm);
      const right = el('span', ''); right.appendChild(el('span', 'sc', fmtNum(c.total)));
      if (!mine && !Cloud.readOnly && c.members.length < CREW_MAX) { const j = el('button', 'chip gold', lt('JOIN')); j.style.marginInlineStart = '8px'; j.onclick = async () => { Aud.sfx('buy'); j.disabled = true; const res = await Crews.join(c.id); if (res !== 'ok') toastDom(lt(res === 'full' ? 'That crew is full.' : 'That crew is gone.')); await Crews.load(); if (this.cur === 'crew') this.renderCrews(); }; right.appendChild(j); }
      if (Cloud.owner && c.id !== Cloud.uid) { const x = el('button', 'chip', lt('REMOVE')); x.style.marginInlineStart = '6px'; x.onclick = async () => { if (x.dataset.sure !== '1') { x.dataset.sure = '1'; x.textContent = lt('SURE?'); return; } await Crews.remove(c.id); await Crews.load(); if (this.cur === 'crew') this.renderCrews(); }; right.appendChild(x); }
      r.appendChild(right); box.appendChild(r);
    });
    if (!mine && !Cloud.readOnly) {
      const p = el('div', 'panel'); p.appendChild(el('div', 'eyebrow', lt('START A CREW')));
      const nm = document.createElement('input'); nm.className = 'txt'; nm.maxLength = 18; nm.placeholder = lt('Crew name'); nm.id = 'crName'; p.appendChild(nm);
      const tg = document.createElement('input'); tg.className = 'txt'; tg.maxLength = 4; tg.placeholder = lt('Tag (2-4 letters)'); tg.id = 'crTag'; tg.style.marginTop = '8px'; tg.style.textTransform = 'uppercase'; tg.dir = 'ltr'; p.appendChild(tg);
      let col = 0; const cols = el('div', 'cols'); cols.style.marginTop = '8px';
      CREW_COLS.forEach((c, i) => { const b = el('button', i === col ? 'on' : ''); b.style.background = c; b.setAttribute('aria-label', lt('Crew color') + ' ' + (i + 1)); b.onclick = () => { col = i; cols.querySelectorAll('button').forEach((q, k) => q.classList.toggle('on', k === i)); }; cols.appendChild(b); });
      p.appendChild(cols);
      const msg = el('div', 'small mute', '');
      const go = el('button', 'btn pri', lt('CREATE CREW')); go.style.marginTop = '8px'; go.id = 'crGo';
      go.onclick = async () => {
        go.disabled = true; const r = await Crews.create(nm.value, tg.value, col); go.disabled = false;
        if (r !== 'ok') { Aud.sfx('deny'); msg.textContent = lt({ name: 'The name needs at least 3 characters.', tag: 'The tag needs 2 to 4 letters or digits.', taken: 'Another crew already uses that tag.', offline: 'You need to be signed in.', net: 'Could not save. Check your connection.' }[r] || 'Could not save. Check your connection.'); return; }
        Aud.sfx('win'); await Crews.load(); if (this.cur === 'crew') this.renderCrews();
      };
      p.appendChild(go); p.appendChild(msg); box.appendChild(p);
    }
  },
  openInvite() {
    this.show('invite'); this.backFn = () => this.openClub();
    this.renderInvite(); if (Cloud.ready) Invite.inviterCheck();
  },
  renderInvite() {
    const box = $('ivBox'); box.textContent = ''; const d = Store.data;
    box.appendChild(el('div', 'small', ltf('When a friend you invite finishes chapter 1, you BOTH get the NEON TWINS hero and +{0} CR.', INV_CR)));
    const cv = document.createElement('canvas'); cv.width = cv.height = 112; cv.className = 'ic'; cv.style.width = cv.style.height = '84px'; cv.style.alignSelf = 'center';
    drawIcon(cv.getContext('2d'), { tab: 'heroes', id: 'twin' }, 112); box.appendChild(cv);
    if (!Cloud.ready) { box.appendChild(el('div', 'panel info', lt(offlineBuild() ? 'Invites work in the online version of the game.' : 'Sign in to get your invite code.'))); return; }
    const p = el('div', 'panel'); p.appendChild(el('div', 'eyebrow', lt('YOUR CODE')));
    const code = Invite.code(); p.appendChild(el('div', 'inv-code', code));
    const msg = el('div', 'small mute', '');
    const cp = el('button', 'btn', lt('COPY INVITE MESSAGE'));
    cp.onclick = async () => { const text = ltf('Play OVERDRIVE: CYBER SLASH with me! {0} — open CLUB → INVITE A FRIEND and enter my code {1}. We both get a free hero.', SHARE_URL, code); try { await navigator.clipboard.writeText(text); msg.textContent = lt('Copied. Paste it to a friend.'); } catch (e) { msg.textContent = text; } };
    p.appendChild(cp); p.appendChild(msg);
    p.appendChild(el('div', 'small mute', lt('The game link is private until you share it from the page\'s Share menu. Share it with your friend first.')));
    box.appendChild(p);
    if (Invite.friends.length) {
      const f = el('div', 'panel'); f.appendChild(el('div', 'eyebrow', ltf('FRIENDS YOU INVITED ({0})', Invite.friends.length)));
      for (const q of Invite.friends) { const r = el('div', 'bty'); r.appendChild(el('span', '', q.name || lt('Player'))); r.appendChild(el('span', q.done ? 'gold small' : 'mute small', q.done ? lt('CHAPTER 1 DONE ✓') : lt('PLAYING CHAPTER 1'))); f.appendChild(r); }
      box.appendChild(f);
    }
    const q = el('div', 'panel'); q.appendChild(el('div', 'eyebrow', lt('GOT A CODE FROM A FRIEND?')));
    if (d.refBy) {
      q.appendChild(el('div', 'small', d.refName ? ltf('Linked to {0}.', d.refName) : lt('Linked to your friend.')));
      q.appendChild(el('div', d.refGot ? 'small gold' : 'small mute', d.refGot ? lt('Reward collected: NEON TWINS is in your Arsenal.') : lt('Finish chapter 1 of the story and you both get the reward.')));
    } else if (!Invite.canEnter()) q.appendChild(el('div', 'small mute', lt('Codes are for new players who have not finished chapter 1 yet.')));
    else if (!Cloud.readOnly) {
      const inp = document.createElement('input'); inp.className = 'code'; inp.maxLength = 6; inp.id = 'ivIn'; inp.placeholder = 'ABC123'; inp.autocomplete = 'off'; q.appendChild(inp);
      const m2 = el('div', 'small mute', '');
      const go = el('button', 'btn pri', lt('USE CODE')); go.style.marginTop = '8px'; go.id = 'ivGo';
      go.onclick = async () => {
        go.disabled = true; m2.textContent = lt('Checking…'); const r = await Invite.apply(inp.value); go.disabled = false;
        if (r === 'ok') { Aud.sfx('buy'); this.renderInvite(); return; }
        Aud.sfx('deny'); m2.textContent = lt({ bad: 'A code has 6 letters and digits.', self: 'That is your own code.', none: 'No player has that code.', late: 'Codes are for new players who have not finished chapter 1 yet.', offline: 'You need to be signed in.', net: 'Could not check the code. Check your connection.' }[r] || 'Could not check the code. Check your connection.');
      };
      q.appendChild(go); q.appendChild(m2);
    }
    box.appendChild(q);
  },
  async renderBalance(box) { // creator dashboard: where players drop off, and per-stage difficulty steps
    const rows = await Dash.load('stats'); if (this.cur !== 'dash') return; await Tune.load(true);
    box.textContent = '';
    if (!rows) { box.appendChild(el('div', 'panel info', lt('Could not load. The dashboard only works for the game owner, signed in.'))); return; }
    const st = {}, reach = {}; let players = 0;
    for (const r of rows) {
      players++;
      for (const id in (r.st || {})) { const a = r.st[id], o = st[id] || (st[id] = { p: 0, c: 0, f: 0, q: 0 }); o.p += a.p | 0; o.c += a.c | 0; o.f += a.f | 0; o.q += a.q | 0; if ((a.p | 0) > 0) reach[id] = (reach[id] | 0) + 1; }
    }
    box.appendChild(el('div', 'small mute', lt('Each step makes a story stage about 10% easier (−) or harder (+): enemy and boss health, spawn speed. Changes reach every player the next time they open the game. Arcade modes and leaderboards are not affected.')));
    const base = Math.max(1, reach[STAGES[0].id] | 0), tune = Object.assign({}, Tune.st);
    if (!players) box.appendChild(el('div', 'panel info', lt('No play data yet. Share the game, and the numbers fill in as people play.')));
    for (const s of STAGES) {
      const o = st[s.id] || { p: 0, c: 0, f: 0, q: 0 }, n = reach[s.id] | 0, clr = o.p ? Math.round(o.c / o.p * 100) : 0;
      const r = el('div', 'panel small'); r.style.padding = '8px 10px';
      const top = el('div', 'topbar'); const nm = el('span', '', s.id + ' ' + lt(s.name)); top.appendChild(nm);
      const ctl = el('span', 'tune'), val = el('b', ''), show = () => { const v = tune[s.id] | 0; val.textContent = v ? (v > 0 ? '+' : '') + v : '0'; val.style.color = v < 0 ? 'var(--green)' : v > 0 ? 'var(--red)' : ''; };
      const mk = (t, dv) => { const b = el('button', 'chip', t); b.onclick = () => { tune[s.id] = clamp((tune[s.id] | 0) + dv, -3, 3); if (!tune[s.id]) delete tune[s.id]; show(); }; return b; };
      ctl.appendChild(mk('−', -1)); ctl.appendChild(val); ctl.appendChild(mk('+', 1)); show(); top.appendChild(ctl); r.appendChild(top);
      let hint = ''; if (o.p >= 5 && clr < 40) hint = lt('Many players fail here: try one step easier.'); else if (o.p >= 10 && clr > 92) hint = lt('Almost everyone clears it: it could be harder.');
      r.appendChild(el('div', o.p && clr < 40 ? 'gold' : 'mute', ltf('players reached it: {0} · {1} plays · {2}% clear · {3} quit', n, o.p, clr, o.q) + (hint ? ' · ' + hint : '')));
      const bar = el('span', 'funnel'), i = el('i'); i.style.width = Math.round(Math.min(1, n / base) * 100) + '%'; bar.appendChild(i); r.appendChild(bar);
      box.appendChild(r);
    }
    const msg = el('div', 'small mute', '');
    const sv = el('button', 'btn pri', lt('SAVE BALANCE')); sv.onclick = async () => { sv.disabled = true; try { await Tune.save(tune); msg.textContent = lt('Saved. Players get it the next time they open the game.'); Aud.sfx('buy'); } catch (e) { msg.textContent = lt('Could not save. Check your connection.'); } sv.disabled = false; };
    box.appendChild(sv); box.appendChild(msg);
  }
});
