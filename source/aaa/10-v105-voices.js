
/* --- MODULE 10: v105.0 VOICE DIRECTOR — one speech channel for the cast, the radio and the announcer --- */
(function () {
  'use strict';
  // Three systems used to share the device's one speech engine and each cancelled the others:
  // the v96 announcer cut story lines off mid-sentence. Now each line has a priority:
  //   3 story dialogue · 2 Mika's radio in a run · 1 the announcer
  // A line never interrupts a higher one; a story line replaces anything; the announcer waits its turn or is dropped.
  const SS = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
  const FEMALE = { M: 1, V: 1, Z: 1 };
  const FEM_RX = /female|woman|zira|samantha|victoria|karen|moira|tessa|fiona|susan|hazel|heera|carmit|hila|milena|katya|irina|alena|laila|mariam|salma|zeina|amira|serena|allison|ava\b|kate|nora|paulina|monica|amelie|anna\b|helena|kyoko|sara\b|elsa|google us english|google (русский|עברית)/i;
  const MALE_RX = /(^|[^e])male|\bman\b|david|mark\b|george|james|daniel|alex\b|fred\b|jorge|diego|thomas|asaf|maged|tarik|yuri|pavel|dmitri|rishi|aaron|arthur|oliver|guy\b|ryan|eric\b/i;
  const sexOf = v => { const n = (v.name || '') + ' ' + (v.voiceURI || ''); return FEM_RX.test(n) && !/(^|[^e])male/i.test(n) ? 'f' : MALE_RX.test(n) ? 'm' : '?'; };
  const wantF = cid => { const c = CHARS[cid] || {}; return !!FEMALE[cid] || (c.pitch || 200) >= 280; };
  const VD = {
    prio: 0, until: 0, cur: null,
    babUntil: 0, babPrio: 0,
    busy() { const now = performance.now(); return (!!(SS && SS.speaking) && now < this.until) || now < this.babUntil; },
    level() { return performance.now() < this.babUntil ? Math.max(this.babPrio, this.prio) : this.prio; },
    // a voice for this character: its own gender when the device has one, the same voice every time
    voiceFor(cid, list) {
      if (!list.length) return { v: null, mis: false };
      const f = wantF(cid), same = list.filter(v => sexOf(v) === (f ? 'f' : 'm')), unk = list.filter(v => sexOf(v) === '?');
      const pool = same.length ? same : unk.length ? unk : list;
      let h = 0; for (const k of cid + 'v') h = (h * 31 + k.charCodeAt(0)) | 0;
      const v = pool[Math.abs(h) % pool.length], s = sexOf(v);
      return { v, mis: s !== '?' && s !== (f ? 'f' : 'm') };
    },
    say(text, lang, voice, pitch, rate, vol, prio) {
      if (!SS || !text) return false;
      if (this.busy() && this.level() > prio) return false; // never over a more important line
      if (this.busy() && this.level() === prio && prio === 1) return false; // the announcer does not talk over itself
      try {
        SS.cancel();
        const u = new SpeechSynthesisUtterance(String(text).replace(/[*_~]/g, ''));
        if (voice) { u.voice = voice; u.lang = voice.lang; } else if (lang) u.lang = lang;
        u.pitch = clamp(pitch, .1, 2); u.rate = clamp(rate, .5, 1.6); u.volume = clamp(vol, 0, 1);
        const me = u; u.onend = u.onerror = () => { if (this.cur === me) { this.cur = null; this.prio = 0; this.until = 0; } };
        this.cur = u; this.prio = prio; this.until = performance.now() + Math.min(12000, 900 + String(text).length * 80);
        SS.speak(u);
        if (SS.paused) SS.resume(); // (Chrome can leave the engine paused after the tab was in the background)
        return true;
      } catch (e) { errLog(e); return false; }
    }
  };
  window.VoiceDirector = VD;
  const vol = () => clamp(Store.data.settings.sfx == null ? .8 : Store.data.settings.sfx, 0, 1);

  // the cast (story dialogue and the radio)
  Voices.speak = function (cid, text, english, v) {
    if (!this.on() || !text) return;
    const radio = v != null && v < 1, prio = radio ? 2 : 3, ch = CHARS[cid] || {}, p = ch.pitch || 200, ai = /\.(EXE|SYS|NULL|OS)$|HYAKKI|RAIJIN|IZANAMI|PRIME|DEUS/.test(ch.name || '');
    if (radio && VD.busy() && VD.level() > 2) return; // the radio keeps quiet while the story speaks
    if (this.mode() !== 'synth' && SS) {
      let list = this.pick(this.code()), say = text;
      if (!list.length && english && this.code() !== 'en') { list = this.pick('en'); say = english; }
      if (list.length) {
        const { v: voice, mis } = VD.voiceFor(cid, list), f = wantF(cid);
        // pitch from the character, corrected when the device only has a voice of the other gender
        const base = f ? 400 : 150; let pitch = clamp(1 + (p - base) / base * .6, .55, 1.45); if (mis) pitch += f ? .4 : -.3; if (ai) pitch = Math.min(pitch, .72); // (relative to a voice of the character's own gender: no chipmunks)
        const rate = ai ? .86 : p > 400 ? 1.08 : radio ? 1.06 : 1;
        if (VD.say(say, voice.lang, voice, pitch, rate, .85 * (v == null ? 1 : v) * vol(), prio)) { this.until = VD.until; return; }
        return;
      }
    }
    if (VD.busy() && VD.level() > prio) return;
    try { if (SS) SS.cancel(); if (this.out) { this.out.gain.setTargetAtTime(0, Aud.c.currentTime, .02); this.out = null; } } catch (e) { } // (one line at a time)
    this.babble(cid, text, v); VD.babUntil = this.until || 0; VD.babPrio = prio;
  };
  const st0 = Voices.stop.bind(Voices);
  Voices.stop = function () { st0(); VD.cur = null; VD.prio = 0; VD.until = 0; VD.babUntil = 0; };

  // the announcer: one steady English arcade voice, never over the cast
  let annV = null;
  const annVoice = () => { if (annV && SS.getVoices().indexOf(annV) >= 0) return annV; const en = (SS.getVoices() || []).filter(v => /^en/i.test(v.lang || '')); annV = en.find(v => sexOf(v) === 'm') || en[0] || null; return annV; };
  let lastAnn = 0;
  const announce = (text, pitch, rate, gap, force) => {
    if (!SS || Aud.quiet || !text) return;
    const now = performance.now(); if (!force && now - lastAnn < gap) return;
    if (VD.say(text, 'en-US', annVoice(), pitch, rate, .55 * vol(), 1)) lastAnn = now;
  };
  Aud.say = function (text, force) { if (this.quiet || !Store.data.settings.voice) return; announce(text, .6, 1.12, 3500, force); };
  try {
    const VB = window.__V96 && window.__V96.VoiceBarks96;
    if (VB) VB.say = function (text, pitch, rate) { if (!Store.data.settings.voice || Store.data.settings.voice96 === 0) return; announce(text, pitch != null ? pitch : .88, rate != null ? rate : 1.18, 1300); };
  } catch (e) { }

  // returning to the game: an engine left paused in the background speaks again
  document.addEventListener('visibilitychange', () => { try { if (!document.hidden && SS && SS.paused) SS.resume(); if (document.hidden && SS) { SS.cancel(); VD.cur = null; VD.prio = 0; VD.until = 0; } } catch (e) { } });
})();

/* track styles of the v86-v95 music, in Hebrew (Arabic and Russian are in lang/) */
if (typeof HE !== 'undefined') Object.assign(HE, {"Anime boss orchestral rock": "רוק תזמורתי לבוס אנימה", "Boss: war metal synth": "בוס: סינת' מטאל מלחמתי", "Cyber electro-rock": "סייבר אלקטרו-רוק", "Cyber taiko war drums": "תופי טאיקו מלחמה סייבריים", "Cyber zen lo-fi": "לו-פיי זן סייברי", "Darksynth war march": "מארש מלחמה דארקסינת'", "Edgerunners hyper-synth": "היפר-סינת' של רצי הקצה", "Gothic industrial synth": "סינת' תעשייתי גותי", "Hyper-arcade synth": "סינת' היפר-ארקייד", "Hyper-phonk night drive": "נסיעת לילה היפר-פונק", "Industrial drum and bass": "דראם אנד בייס תעשייתי", "Midnight cyber-phonk": "סייבר-פונק של חצות", "Neon shrine synthwave": "סינת'וויב של מקדש ניאון", "Orchestral cyber boss": "בוס סייבר תזמורתי", "Ultimate anime cyber-anthem": "המנון סייבר אנימה אולטימטיבי"});
