/* ==========================================================================
   VERSION 93.0 — SOCIAL LOGIN & CLOUD PROFILE (Auth93)
   Supports: Google, Facebook, GitHub, X/Twitter, Email & Password, and
   Instant Local/Guest Profile. Uses Firebase Auth SDK (auto-loaded from CDN
   when Firebase Config is provided) + syncs display name & avatar with
   Store.data and CloudReady92 Leaderboard.
   ========================================================================== */

try {
  if (typeof HE !== 'undefined') Object.assign(HE, {
    "LOGIN": "התחבר",
    "ACCOUNT & LOGIN": "חשבון והתחברות",
    "Continue with Google": "המשך עם Google",
    "Continue with Facebook": "המשך עם Facebook",
    "Continue with GitHub": "המשך עם GitHub",
    "Continue with X (Twitter)": "המשך עם X (טוויטר)",
    "OR EMAIL / GUEST": "או אימייל / אורח",
    "Sign in with Email": "התחבר עם אימייל",
    "Create Account": "צור חשבון חדש",
    "Quick Guest / Local Profile": "התחברות מהירה כאורח",
    "SIGN OUT": "התנתק",
    "SYNC CLOUD SAVE": "סנכרן שמירה לענן",
    "Firebase Auth Setup (Optional)": "הגדרת Firebase Auth (אופציונלי)"
  });
  if (typeof AR !== 'undefined') Object.assign(AR, {
    "LOGIN": "تسجيل الدخول",
    "ACCOUNT & LOGIN": "الحساب وتسجيل الدخول",
    "Continue with Google": "المتابعة باستخدام Google",
    "Continue with Facebook": "المتابعة باستخدام Facebook",
    "Continue with GitHub": "المتابعة باستخدام GitHub",
    "Continue with X (Twitter)": "المتابعة باستخدام X",
    "SIGN OUT": "تسجيل الخروج"
  });
  if (typeof RU !== 'undefined') Object.assign(RU, {
    "LOGIN": "ВОЙТИ",
    "ACCOUNT & LOGIN": "АККАУНТ И ВХОД",
    "Continue with Google": "Войти через Google",
    "Continue with Facebook": "Войти через Facebook",
    "Continue with GitHub": "Войти через GitHub",
    "Continue with X (Twitter)": "Войти через X (Twitter)",
    "SIGN OUT": "ВЫЙТИ"
  });
} catch (e) { errLog(e); }

const Auth93 = {
  KEY: 'overdrive_auth93_user',
  CFG_KEY: 'overdrive_auth93_fbcfg',
  user: null,
  fbReady: false,
  fbLoading: false,
  btnEl: null,
  avEl: null,
  lblEl: null,
  modalEl: null,

  loadSavedUser() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        this.user = JSON.parse(raw);
        this.applyUserToStore();
      }
    } catch (e) {}
  },

  saveUser(u) {
    this.user = u;
    try {
      if (u) localStorage.setItem(this.KEY, JSON.stringify(u));
      else localStorage.removeItem(this.KEY);
    } catch (e) {}
    this.applyUserToStore();
    this.tickUI();
  },

  applyUserToStore() {
    if (!this.user || typeof Store === 'undefined' || !Store.data) return;
    if (this.user.name) {
      Store.data.name = this.user.name.slice(0, 22);
      Store.touch();
    }
  },

  getFirebaseConfig() {
    if (window.OVERDRIVE_FIREBASE_CONFIG && typeof window.OVERDRIVE_FIREBASE_CONFIG === 'object') {
      return window.OVERDRIVE_FIREBASE_CONFIG;
    }
    try {
      const raw = localStorage.getItem(this.CFG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  },

  async ensureFirebaseAuth() {
    const cfg = this.getFirebaseConfig();
    if (!cfg || !cfg.apiKey) return null;
    if (location.protocol === 'file:') return null;
    if (this.fbReady && window.firebase && firebase.auth) return firebase.auth();
    if (this.fbLoading) return null;
    this.fbLoading = true;
    try {
      if (!window.firebase) {
        await this.loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
        await this.loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
      }
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      this.fbReady = true;
      const auth = firebase.auth();
      auth.onAuthStateChanged(u => {
        if (u) {
          const prov = (u.providerData && u.providerData[0] && u.providerData[0].providerId) || 'firebase';
          this.saveUser({
            uid: u.uid,
            name: u.displayName || (u.email ? u.email.split('@')[0] : 'CYBER NINJA'),
            email: u.email || '',
            photo: u.photoURL || '',
            provider: prov.replace('.com', ''),
            real: true
          });
        }
      });
      return auth;
    } catch (e) {
      this.fbLoading = false;
      return null;
    }
  },

  setStatus(msg) {
    if (!this.modalEl) return;
    const st = this.modalEl.querySelector('#auth93-st');
    if (st) { st.textContent = msg; st.style.display = msg ? 'block' : 'none'; }
  },

  async signInProvider(kind) {
    const auth = await this.ensureFirebaseAuth();
    if (auth && window.firebase) {
      try {
        let prov = null;
        if (kind === 'google')   prov = new firebase.auth.GoogleAuthProvider();
        if (kind === 'facebook') prov = new firebase.auth.FacebookAuthProvider();
        if (kind === 'github')   prov = new firebase.auth.GithubAuthProvider();
        if (kind === 'twitter')  prov = new firebase.auth.TwitterAuthProvider();
        this.setStatus('Connecting to ' + kind.toUpperCase() + '...');
        const res = await auth.signInWithPopup(prov);
        const u = res.user;
        this.saveUser({
          uid: u.uid,
          name: u.displayName || (u.email ? u.email.split('@')[0] : 'CYBER NINJA'),
          email: u.email || '',
          photo: u.photoURL || '',
          provider: kind,
          real: true
        });
        this.openModal();
        return;
      } catch (err) {
        this.setStatus('OAuth Error: ' + (err && err.message ? err.message : err));
        return;
      }
    }
    // Graceful Local/Demo fallback when running offline (file://) or before Firebase Config is pasted
    const defName = (Store && Store.data && Store.data.name) || 'CyberNinja';
    const picked = prompt('הכנס שם משתמש לפרופיל (' + kind.toUpperCase() + '):\n(להתחברות OAuth אמיתית של גוגל/פייסבוק, הדבק Firebase Config למטה והעלה ל-HTTPS)', defName);
    if (!picked) return;
    this.saveUser({
      uid: 'local_' + kind + '_' + Math.random().toString(36).slice(2, 8),
      name: picked.trim().slice(0, 22),
      email: '',
      photo: '',
      provider: kind + ' (local)',
      real: false
    });
    this.openModal();
  },

  async signInEmail(isSignup) {
    const emailEl = this.modalEl && this.modalEl.querySelector('#auth93-em');
    const passEl  = this.modalEl && this.modalEl.querySelector('#auth93-pw');
    const email = (emailEl && emailEl.value || '').trim();
    const pass  = (passEl && passEl.value || '').trim();
    if (!email || pass.length < 6) {
      this.setStatus('יש להזין אימייל תקין וסיסמה של לפחות 6 תווים.');
      return;
    }
    const auth = await this.ensureFirebaseAuth();
    if (auth) {
      try {
        this.setStatus(isSignup ? 'Creating account...' : 'Signing in...');
        const res = isSignup
          ? await auth.createUserWithEmailAndPassword(email, pass)
          : await auth.signInWithEmailAndPassword(email, pass);
        const u = res.user;
        this.saveUser({
          uid: u.uid,
          name: u.displayName || email.split('@')[0],
          email: u.email || email,
          photo: u.photoURL || '',
          provider: 'email',
          real: true
        });
        this.openModal();
        return;
      } catch (err) {
        this.setStatus('Auth Error: ' + (err && err.message ? err.message : err));
        return;
      }
    }
    // Local email profile fallback
    this.saveUser({
      uid: 'local_em_' + Math.random().toString(36).slice(2, 8),
      name: email.split('@')[0].slice(0, 22),
      email,
      photo: '',
      provider: 'email (local)',
      real: false
    });
    this.openModal();
  },

  async signOut() {
    try {
      if (this.fbReady && window.firebase && firebase.auth) await firebase.auth().signOut();
    } catch (e) {}
    this.saveUser(null);
    this.openModal();
  },

  ensureDOM() {
    if (!this.btnEl) {
      const b = document.createElement('button');
      b.id = 'auth93-btn';
      b.innerHTML = '<img id="auth93-av" alt=""><span id="auth93-lbl">👤 LOGIN</span>';
      b.onclick = () => this.openModal();
      document.body.appendChild(b);
      this.btnEl = b;
      this.avEl = b.querySelector('#auth93-av');
      this.lblEl = b.querySelector('#auth93-lbl');
    }
    if (!this.modalEl) {
      const m = document.createElement('div');
      m.className = 'modal92-bg';
      m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
      document.body.appendChild(m);
      this.modalEl = m;
    }
  },

  openModal() {
    this.ensureDOM();
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    const u = this.user;
    const savedCfg = localStorage.getItem(this.CFG_KEY) || '';

    let bodyHtml = '';
    if (u) {
      const avSrc = u.photo || ('https://api.dicebear.com/8.x/bottts-neutral/svg?seed=' + encodeURIComponent(u.name || 'ninja'));
      bodyHtml =
        '<div class="auth93-profile-card">' +
          '<img src="' + avSrc + '" alt="">' +
          '<div>' +
            '<div style="font-size:17px;font-weight:900;color:#fff">' + String(u.name || 'NINJA') + '</div>' +
            (u.email ? '<div style="font-size:12px;opacity:.78">' + u.email + '</div>' : '') +
            '<span class="auth93-badge">' + String(u.provider || 'USER').toUpperCase() + (u.real ? ' · VERIFIED' : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
          '<button class="auth93-prov auth93-guest" id="a93-sync" style="flex:1;margin:0">☁ ' + L('SYNC CLOUD SAVE') + '</button>' +
          '<button class="modal92-close" id="a93-out" style="border-color:#ff0844;color:#ff4f7b;padding:10px 14px">' + L('SIGN OUT') + '</button>' +
        '</div>';
    } else {
      bodyHtml =
        '<button class="auth93-prov auth93-google" id="a93-g">G &nbsp;' + L('Continue with Google') + '</button>' +
        '<button class="auth93-prov auth93-facebook" id="a93-fb">f &nbsp;' + L('Continue with Facebook') + '</button>' +
        '<button class="auth93-prov auth93-github" id="a93-gh">⌘ &nbsp;' + L('Continue with GitHub') + '</button>' +
        '<button class="auth93-prov auth93-twitter" id="a93-tw">𝕏 &nbsp;' + L('Continue with X (Twitter)') + '</button>' +
        '<div class="auth93-divider">' + L('OR EMAIL / GUEST') + '</div>' +
        '<input class="cloud92-inp" id="auth93-em" type="email" placeholder="Email (name@example.com)">' +
        '<input class="cloud92-inp" id="auth93-pw" type="password" placeholder="Password (min 6 chars)">' +
        '<div style="display:flex;gap:8px;margin-bottom:10px">' +
          '<button class="modal92-close" id="a93-em-in" style="flex:1;border-color:#00f2fe;color:#00f2fe;padding:8px">' + L('Sign in with Email') + '</button>' +
          '<button class="modal92-close" id="a93-em-up" style="flex:1;border-color:#ff4fd8;color:#ff4fd8;padding:8px">' + L('Create Account') + '</button>' +
        '</div>' +
        '<button class="auth93-prov auth93-guest" id="a93-guest">⚡ ' + L('Quick Guest / Local Profile') + '</button>';
    }

    this.modalEl.innerHTML =
      '<div class="modal92-box">' +
        '<div class="modal92-head"><h3>👤 ' + L('ACCOUNT & LOGIN') + '</h3><button class="modal92-close" id="a93-x">✕</button></div>' +
        '<div class="auth93-status" id="auth93-st"></div>' +
        bodyHtml +
        (DEV_UI ? '<details style="margin-top:12px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px">' +
          '<summary style="cursor:pointer;font-size:11px;font-weight:800;color:#00f2fe">' + L('Firebase Auth Setup (Optional)') + '</summary>' +
          '<div style="font-size:11px;opacity:.8;margin:6px 0">Paste your Firebase Web Config JSON to enable live Google / Facebook / GitHub OAuth popups (requires HTTPS hosting like GitHub Pages or itch.io):</div>' +
          '<textarea class="cloud92-inp" id="a93-cfg" rows="4" placeholder=\'{"apiKey":"...","authDomain":"...","projectId":"..."}\'>' + savedCfg + '</textarea>' +
          '<button class="modal92-close" id="a93-cfg-save" style="border-color:#ffd700;color:#ffd700">SAVE FIREBASE CONFIG</button>' +
        '</details>' : '') +
      '</div>';

    this.modalEl.querySelector('#a93-x').onclick = () => this.modalEl.classList.remove('on');
    const q = id => this.modalEl.querySelector(id);
    if (q('#a93-g'))     q('#a93-g').onclick     = () => this.signInProvider('google');
    if (q('#a93-fb'))    q('#a93-fb').onclick    = () => this.signInProvider('facebook');
    if (q('#a93-gh'))    q('#a93-gh').onclick    = () => this.signInProvider('github');
    if (q('#a93-tw'))    q('#a93-tw').onclick    = () => this.signInProvider('twitter');
    if (q('#a93-em-in')) q('#a93-em-in').onclick = () => this.signInEmail(false);
    if (q('#a93-em-up')) q('#a93-em-up').onclick = () => this.signInEmail(true);
    if (q('#a93-guest')) q('#a93-guest').onclick = () => this.signInProvider('guest');
    if (q('#a93-out'))   q('#a93-out').onclick   = () => this.signOut();
    if (q('#a93-sync'))  q('#a93-sync').onclick  = () => {
      try {
        const code = btoa(unescape(encodeURIComponent(JSON.stringify(Store.data))));
        navigator.clipboard && navigator.clipboard.writeText(code);
        this.setStatus('השמירה סונכרנה והועתקה ללוח (' + code.length + ' תווים)!');
      } catch (e) { this.setStatus('Sync error: ' + e.message); }
    };
    if (q('#a93-cfg-save')) q('#a93-cfg-save').onclick = () => {
      const txt = (q('#a93-cfg').value || '').trim();
      if (!txt) { localStorage.removeItem(this.CFG_KEY); this.setStatus('Firebase config cleared.'); return; }
      try {
        const obj = JSON.parse(txt);
        if (!obj.apiKey) throw new Error('Missing apiKey');
        localStorage.setItem(this.CFG_KEY, JSON.stringify(obj));
        this.fbReady = false;
        this.setStatus('Firebase Auth Config saved! Click Google / Facebook to test on HTTPS.');
      } catch (e) { this.setStatus('Invalid JSON: ' + e.message); }
    };

    this.modalEl.classList.add('on');
  },

  tickUI() {
    this.ensureDOM();
    const onTitle = typeof UI !== 'undefined' && UI.cur === 'title' && G.state !== 'PLAY';
    const L = s => (typeof lt === 'function' ? lt(s) : s);
    this.btnEl.style.display = onTitle ? 'inline-flex' : 'none';
    if (this.user) {
      if (this.user.photo) { this.avEl.src = this.user.photo; this.avEl.style.display = 'block'; }
      else { this.avEl.style.display = 'none'; }
      this.lblEl.textContent = '👤 ' + String(this.user.name || 'NINJA').slice(0, 14);
      this.btnEl.style.borderColor = '#00ff9d';
    } else {
      this.avEl.style.display = 'none';
      this.lblEl.textContent = '👤 ' + L('LOGIN');
      this.btnEl.style.borderColor = '#ff4fd8';
    }
  }
};

/* ---- Hook Auth93 into game lifecycle ---- */
{
  Auth93.loadSavedUser();
  const hd93 = HUD.draw.bind(HUD);
  HUD.draw = function (rd) {
    try { Auth93.tickUI(); } catch (e) {}
    return hd93(rd);
  };
}

