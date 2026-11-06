/* =====================================================================
   VOICES 2 (version 38) — every character always has a voice:
     1. a voice installed on the device in the game's language
     2. otherwise an English voice reading the original English line
     3. otherwise (or with CHARACTER VOICES: SYNTH) a voice made by the game:
        speech-like syllables shaped by two vowel formants, pitched and
        timed per character, robotic for the AIs (REN.NULL, SHOGUN.EXE...)
   Mika's radio lines during a run are voiced too, quieter.
   ===================================================================== */
Object.assign(Voices, {
  until: 0,
  busy() { return performance.now() < this.until; },
  mode() { const v = Store.data && Store.data.settings.cvoice; return v === 0 ? 'off' : v === 2 ? 'synth' : 'auto'; },
  on() { return this.mode() !== 'off' && !Aud.quiet; },
  pick(code) { try { const all = (typeof speechSynthesis !== 'undefined' && speechSynthesis.getVoices()) || []; return all.filter(v => (v.lang || '').toLowerCase().startsWith(code)); } catch (e) { return []; } },
  speak(cid, text, english, vol) {
    if (!this.on() || !text) return; this.stop();
    const ch = CHARS[cid] || {}, p = ch.pitch || 200, ai = /\.(EXE|SYS|NULL)$|HYAKKI|RAIJIN|IZANAMI/.test(ch.name || '');
    const v = vol == null ? 1 : vol, synthOnly = this.mode() === 'synth';
    if (!synthOnly && typeof speechSynthesis !== 'undefined') {
      let list = this.pick(this.code()), say = text;
      if (!list.length && english && this.code() !== 'en') { list = this.pick('en'); say = english; }
      if (list.length) try {
        const u = new SpeechSynthesisUtterance(String(say).replace(/[*_~]/g, ''));
        let h = 0; for (const k of cid + 'v') h = (h * 31 + k.charCodeAt(0)) | 0; u.voice = list[Math.abs(h) % list.length]; u.lang = u.voice.lang;
        u.pitch = clamp(.35 + (p - 40) / 420 * 1.3, .2, 1.8); u.rate = ai ? .86 : p > 400 ? 1.12 : 1; u.volume = clamp(.8 * v * (Store.data.settings.sfx || .8), 0, 1);
        speechSynthesis.speak(u); this.until = performance.now() + Math.min(9000, say.length * 70); return;
      } catch (e) { errLog(e); }
    }
    this.babble(cid, text, v);
  },
  babble(cid, text, vol) { // the game's own voice: no device voice needed
    const A = Aud; if (!A.c || A.c.state !== 'running') return;
    const c = A.c, ch = CHARS[cid] || {}, p = ch.pitch || 200, ai = /\.(EXE|SYS|NULL)$|HYAKKI|RAIJIN|IZANAMI/.test(ch.name || '');
    const base = clamp(p * .85, 70, 380), s = String(text), n = Math.max(2, Math.min(42, Math.round(s.replace(/\s+/g, '').length / 2.4)));
    const F1 = [730, 530, 390, 300, 600, 450], F2 = [1090, 1840, 1990, 870, 1400, 1200], step = ai ? .1 : .085;
    let t = c.currentTime + .03; const v0 = .26 * (vol == null ? 1 : vol);
    const out = c.createGain(); out.gain.value = 1; out.connect(A.sfxBus);
    for (let i = 0; i < n; i++) {
      const ci = Math.min(s.length - 1, Math.round(i * s.length / n)), code = s.charCodeAt(ci) || 97, vw = code % 6, d = step * (.75 + (code % 3) * .2);
      if (/[\s,.!?…—-]/.test(s[ci]) && i > 0) { t += step * .9; continue; }
      const o = c.createOscillator(), b1 = c.createBiquadFilter(), b2 = c.createBiquadFilter(), g1 = c.createGain(), g2 = c.createGain(), env = c.createGain();
      o.type = ai ? 'square' : 'sawtooth'; const f = base * (1 + ((code % 7) - 3) * .035) * (1 + .04 * Math.sin(i * 1.7));
      o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (ai ? 1 : .93), t + d);
      b1.type = 'bandpass'; b1.frequency.value = F1[vw] * (p > 400 ? 1.2 : 1); b1.Q.value = ai ? 12 : 6; b2.type = 'bandpass'; b2.frequency.value = F2[vw] * (p > 400 ? 1.15 : 1); b2.Q.value = ai ? 14 : 8;
      g1.gain.value = 2.6; g2.gain.value = 1.7; // (narrow formant filters keep little of the raw wave)
      env.gain.setValueAtTime(.0001, t); env.gain.linearRampToValueAtTime(v0, t + .012); env.gain.setValueAtTime(v0, t + d * .7); env.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(b1); o.connect(b2); b1.connect(g1); b2.connect(g2); g1.connect(env); g2.connect(env); env.connect(out);
      o.start(t); o.stop(t + d + .02); o.onended = () => { try { o.disconnect(); b1.disconnect(); b2.disconnect(); g1.disconnect(); g2.disconnect(); env.disconnect(); } catch (e) { } };
      t += d + step * .25;
    }
    this.out = out; this.until = performance.now() + (t - c.currentTime) * 1000;
    setTimeout(() => { if (this.out === out) { try { out.disconnect(); } catch (e) { } } }, (t - c.currentTime) * 1000 + 400);
  },
  stop() { try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) { } if (this.out) { try { this.out.gain.setTargetAtTime(0, Aud.c.currentTime, .02); } catch (e) { } this.out = null; } this.until = 0; }
});
{ const cs1 = Comms.say.bind(Comms); Comms.say = function (key, force) { const before = this.cur; cs1(key, force);
    if (this.cur && this.cur !== before && !REPLAY.on) { const arr = COMMS[key], u = (this.used[key] | 0) - 1, ln = arr && arr[((u % arr.length) + arr.length) % arr.length]; Voices.speak(this.cur.cid, this.cur.text, ln && ln[1], .6); } }; }