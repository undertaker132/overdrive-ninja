/* =====================================================================
   I18N — English source strings are the keys; HE (13-he*.js), AR
   (13c-ar.js) and RU (13d-ru.js) map them to Hebrew, Arabic and Russian.
   lt(s) translates, ltf(s, ...args) also fills {0} {1} {2} ...
   Story lines carry their Hebrew inline as a third element; Arabic and
   Russian story lines live in their dictionaries, keyed by the English.
   Hebrew and Arabic switch the page to right-to-left.
   ===================================================================== */
const LANG = { id: 'en', rtl: false };
const HE = {}, AR = {}, RU = {};
const DICTS = { he: HE, ar: AR, ru: RU };
const LANGS = [{ id: 'en', n: 'ENGLISH' }, { id: 'he', n: 'עברית', rtl: 1 }, { id: 'ar', n: 'العربية', rtl: 1 }, { id: 'ru', n: 'РУССКИЙ' }];
const DICT_OK = { en: 1, he: 1 };
function loadDict(id) { // Arabic and Russian ship as JSON blocks, parsed only when a player picks that language
  if (DICT_OK[id] || !DICTS[id]) return; DICT_OK[id] = 1;
  try { const s = document.getElementById('dict-' + id); if (s) Object.assign(DICTS[id], JSON.parse(s.textContent)); } catch (e) { errLog(e); }
}
const T_MISS = new Set(); // keys asked for in the current language with no translation (the test suite reads this)
function lt(s) {
  if (LANG.id === 'en' || s == null) return s;
  const D = DICTS[LANG.id], h = D && D[s]; if (h !== undefined) return h;
  if (T_MISS.size < 4000) T_MISS.add(s);
  return s;
}
function ltf(s, ...args) { // fills {0} {1} {2} ... (any number of arguments)
  let o = lt(s);
  if (o.indexOf('{') < 0) return o;
  for (let i = 0; i < args.length; i++) if (args[i] !== undefined) o = o.split('{' + i + '}').join(args[i]);
  return o;
}
function talS() { return LANG.rtl ? 'right' : 'left'; } // start-aligned canvas text for panels
function tx0(x0, w, pad) { return LANG.rtl ? x0 + w - pad : x0 + pad; } // panel text x at the start side
function lineText(ln) { if (LANG.id === 'he' && ln[2]) return ln[2]; if (LANG.id === 'en') return ln[1]; const D = DICTS[LANG.id], t = D && D[ln[1]]; if (t === undefined && T_MISS.size < 4000) T_MISS.add(ln[1]); return t || ln[1]; } // [speaker, english, hebrew]
function pickLang() {
  const s = Store.data.settings.lang;
  if (LANGS.some(l => l.id === s)) return s;
  try { const l = (navigator.languages && navigator.languages[0]) || navigator.language || ''; if (/^(he|iw)\b/i.test(l)) return 'he'; if (/^ar\b/i.test(l)) return 'ar'; if (/^(ru|be|uk|kk)\b/i.test(l)) return 'ru'; } catch (e) { errLog(e); }
  return 'en';
}
const I18N_NODES = []; // [textNode, englishOriginal] for the static page text
function i18nScan() {
  if (I18N_NODES.length) return;
  const roots = ['ov', 'dock', 'dlg', 'achPop', 'replayBar'];
  for (const id of roots) {
    const r = $(id); if (!r) continue;
    const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      const s = n.nodeValue.trim(); if (!s || /^[\d\s\W]+$/.test(s)) continue;
      const p = n.parentElement; if (p && p.closest('.logo')) continue;
      I18N_NODES.push([n, s, n.nodeValue]);
    }
  }
  document.querySelectorAll('[aria-label]').forEach(e => { e.dataset.al = e.getAttribute('aria-label'); });
  document.querySelectorAll('[placeholder]').forEach(e => { e.dataset.ph = e.getAttribute('placeholder'); });
  document.querySelectorAll('img[alt]').forEach(e => { e.dataset.alt = e.getAttribute('alt'); });
}
function applyLang() {
  LANG.id = pickLang(); LANG.rtl = !!(LANGS.find(l => l.id === LANG.id) || {}).rtl; loadDict(LANG.id);
  const de = document.documentElement; de.lang = LANG.id; de.dir = LANG.rtl ? 'rtl' : 'ltr';
  i18nScan();
  for (const [n, s, raw] of I18N_NODES) n.nodeValue = raw.replace(s, lt(s));
  document.querySelectorAll('[data-al]').forEach(e => e.setAttribute('aria-label', lt(e.dataset.al)));
  document.querySelectorAll('[data-ph]').forEach(e => e.setAttribute('placeholder', lt(e.dataset.ph)));
  document.querySelectorAll('[data-alt]').forEach(e => e.setAttribute('alt', lt(e.dataset.alt)));
  if (typeof HUD !== 'undefined') HUD.c = { sc: -1, scs: '0', ob: '', obk: '', cr: -1, crs: '' };
}
