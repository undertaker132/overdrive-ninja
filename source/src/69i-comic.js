/* =====================================================================
   COMICS — an illustrated page between story chapters: three panels
   drawn live from the game's own art (no image assets), revealed one
   tap at a time, with narration boxes and speech bubbles. Ren is drawn
   in the player's own hero skin.
   ===================================================================== */
const COMICS = {
  1: { t: 'CHAPTER 1 · SKYFALL', p: [
    { k: 'city', th: 'maglev', cap: 'NEO-EDO, 2099. KUROGANE OWNS EVERY TRAIN, EVERY TOWER AND EVERY IMPLANT.' },
    { k: 'face', who: 'M', say: 'Blackout goes live at midnight. Every implant in the city goes dark. Or worse.' },
    { k: 'jump', th: 'maglev', who: 'R', say: 'Then I had better catch my train.' }] },
  2: { t: 'CHAPTER 2 · NEON UNDERCITY', p: [
    { k: 'boss', id: 'warden', down: 1, cap: 'THE WARDEN FALLS. THE CARGO CAR IS EMPTY.' },
    { k: 'city', th: 'undercity', cap: 'THE REAL SHIPMENT SINKS INTO THE UNDERCITY, WHERE KUROGANE SELLS WHAT IT STEALS.' },
    { k: 'face', who: 'M', say: 'I am in their market network. Give me three terminals and I will give you the courier.' }] },
  3: { t: 'CHAPTER 3 · GHOST PROTOCOL', p: [
    { k: 'boss', id: 'hydra', down: 1, cap: 'THE HYDRA CARRIER GOES DOWN IN FLAMES.' },
    { k: 'city', th: 'ghost', cap: 'BELOW IT ALL RUNS THE GHOST LINE. NO POWER. NO PASSENGERS. NO WITNESSES.' },
    { k: 'face', who: 'K', say: 'Turn back, little brother. Shogun sent me.' }] },
  4: { t: "CHAPTER 4 · SHOGUN'S ASCENT", p: [
    { k: 'clash', cap: 'BROTHER AGAINST BROTHER.' },
    { k: 'face', who: 'K', say: 'Shogun lied to me. Blackout takes everyone. Go. I will hold the door.' },
    { k: 'tower', cap: 'TWELVE MINUTES TO MIDNIGHT.', who: 'S', say: 'HUMANS FAIL. SYSTEMS PERSIST.' }] },
  5: { t: 'BONUS · STORM FRONT', p: [
    { k: 'ring', cap: 'THE NEXT MORNING, A STORM GATHERS ABOVE THE CLOUDS.' },
    { k: 'face', who: 'M', say: 'Ren, Shogun had a backup. RAIJIN, up on the orbital ring. It is charging a storm.' },
    { k: 'boss', id: 'raijin', who: 'J', say: 'I AM THE STORM. KNEEL, LITTLE BLADE.' }] },
  6: { t: 'BONUS · NULL PROTOCOL', p: [
    { k: 'boss', id: 'raijin', down: 1, cap: 'RAIJIN FALLS. BUT SOMETHING ELSE WAS LISTENING.' },
    { k: 'face', who: 'M', say: 'Every fight you ever fought was recorded. Kurogane built a copy of you.' },
    { k: 'mirror', who: 'N', say: 'I AM YOU, WITHOUT THE DOUBT.' }] },
  7: { t: 'CHAPTER 7 · NEON TIDE', p: [
    { k: 'boss', id: 'renull', down: 1, cap: "REN.NULL IS DELETED. ITS LAST PACKET POINTS TO THE HARBOR." },
    { k: 'city', th: 'harbor', cap: 'THE KUROGANE HARBOR. EVERY IMPLANT IN THE WORLD SHIPS FROM HERE.' },
    { k: 'face', who: 'M', say: 'Something huge patrols the water under those docks.' }] },
  8: { t: 'CHAPTER 8 · IRON MONASTERY', p: [
    { k: 'boss', id: 'leviathan', down: 1, cap: 'LEVIATHAN SINKS.' },
    { k: 'city', th: 'temple', cap: 'HIGH IN THE MOUNTAINS: THE MONASTERY WHERE TWO BROTHERS LEARNED THE BLADE.' },
    { k: 'face', who: 'K', say: 'Master always said we would come back one day.' }] },
  9: { t: 'CHAPTER 9 · ZERO HOUR', p: [
    { k: 'boss', id: 'benkei', down: 1, cap: 'THE BELL RINGS TRUE.' },
    { k: 'tower', cap: 'THE BLACK TOWER. ZERO HOUR.', who: 'P', say: 'COME, LITTLE BLADE. I HAVE BEEN WAITING.' },
    { k: 'duo', who: 'K', say: 'Together this time.', who2: 'R', say2: 'Together.' }] },
  10: { t: 'CHAPTER 10 · ORBITAL SPIRE', p: [
    { k: 'boss', id: 'prime', down: 1, cap: 'PRIME FALLS. BUT THE SPACE ELEVATOR WAKES UP AND STARTS TO CLIMB.' },
    { k: 'city', th: 'orbital', cap: 'ABOVE THE CLOUDS, THE GENESIS SATELLITES TURN TOWARD THE CITY.' },
    { k: 'boss', id: 'valkyrie', who: 'V', say: 'THE SKY STAYS CLOSED.' }] },
  11: { t: 'CHAPTER 11 · THE DATA VOID', p: [
    { k: 'boss', id: 'valkyrie', down: 1, cap: 'VALKYRIE CRASHES INTO THE SOLAR ARRAY.' },
    { k: 'city', th: 'datavoid', cap: 'BEHIND HER: A DOOR INTO THE RAW NEURAL STREAM.' },
    { k: 'face', who: 'K', say: 'Something in there is wearing our old enemies. And my face.' }] },
  12: { t: 'CHAPTER 12 · PROJECT GENESIS', p: [
    { k: 'boss', id: 'chimera', down: 1, cap: 'CHIMERA.OS: DELETED.' },
    { k: 'city', th: 'apex', cap: 'THE GENESIS CORE. WHERE KUROGANE WROTE ITSELF INTO A GOD.' },
    { k: 'duo', who: 'K', say: 'Last door, little brother.', who2: 'R', say2: 'Then let us knock.' }] },
  13: { t: 'CHAPTER 13 · SHRINE OF ECHOES', p: [
    { k: 'boss', id: 'genesis', down: 1, cap: 'GENESIS IS GONE. BUT AN OLD SHRINE SIGNAL KEEPS WHISPERING.' },
    { k: 'city', th: 'sakura', cap: 'IN THE SHRINE DISTRICT, THE PETALS FALL IN NEON.' },
    { k: 'face', who: 'M', say: 'It is not a ghost, Ren. It is a backup.' }] },
  14: { t: 'CHAPTER 14 · THE ABYSS LINE', p: [
    { k: 'city', th: 'abyss', cap: 'BELOW THE BAY, A DATA CABLE RUNS INTO THE DARK.' },
    { k: 'boss', id: 'oryu', who: 'O', say: 'COME DOWN TO ME, LITTLE BLADE.' },
    { k: 'duo', who: 'K', say: 'One more dive.', who2: 'R', say2: 'One more cut.' }] },
  15: { t: 'CHAPTER 15 · SKY ELEVATOR', p: [
    { k: 'boss', id: 'oryu', down: 1, cap: 'THE DEEP GOES QUIET. THEN THE SKY STARTS TO SPEAK.' },
    { k: 'city', th: 'skyroad', cap: 'THE OLD SPACE ELEVATOR WAKES UP. NOBODY TOLD IT TO.' },
    { k: 'face', who: 'T', say: 'CITY BELOW. YOUR JUDGMENT HAS BEGUN.' }] },
  16: { t: 'CHAPTER 16 · ORBITAL RING', p: [
    { k: 'city', th: 'starring', cap: 'ABOVE THE CLOUDS: A RING OF MIRRORS THAT CAN FOCUS THE SUN.' },
    { k: 'boss', id: 'tenkai', who: 'T', say: 'I HAVE WATCHED YOU FOR A HUNDRED YEARS.' },
    { k: 'duo', who: 'K', say: 'Long way from home.', who2: 'R', say2: 'Home is wherever I can see it from.' }] },
  17: { t: 'CHAPTER 17 · OVERGROWN RUINS', p: [
    { k: 'boss', id: 'tenkai', down: 1, cap: 'TENKAI.SYS FALLS. ITS LAST WORDS: PROTECT THE FIRST CODE.' },
    { k: 'city', th: 'ruins', cap: 'UNDER THE OLDEST DISTRICT: RUINS OLDER THAN HISTORY, CARVED WITH CIRCUITS.' },
    { k: 'face', who: 'M', say: 'Ren, somebody built machines here thousands of years ago.' }] },
  18: { t: 'CHAPTER 18 · THE FIRST CODE', p: [
    { k: 'city', th: 'origin', cap: 'AT THE BOTTOM OF THE RUINS: THE PLACE WHERE EVERY MACHINE MIND BEGAN.' },
    { k: 'boss', id: 'izanami', who: 'Z', say: 'WELCOME HOME, CHILD OF STEEL.' },
    { k: 'duo', who: 'K', say: 'Together, like always.', who2: 'R', say2: 'To the very end.' }] },
  end5: { t: 'EPILOGUE · THE FIRST BLADE', p: [
    { k: 'boss', id: 'izanami', down: 1, cap: 'IZANAMI: AT REST.' },
    { k: 'dawn', cap: 'FROM THE SKY TO THE FIRST CODE, NEO-EDO WAKES UP FREE.' },
    { k: 'duo', who: 'M', say: 'Six acts. You owe me so much ramen.', who2: 'R', say2: 'Then let us start tonight.' }] },
  19: { t: 'CHAPTER 19 · NIGHT PARADE', p: [
    { k: 'boss', id: 'izanami', down: 1, cap: 'THE FIRST CODE SLEEPS. THAT NIGHT, EVERY LANTERN IN THE OLD TOWN LIGHTS UP.' },
    { k: 'city', th: 'parade', cap: 'A HUNDRED DEMONS WALK THE STREETS: EVERY PROGRAM KUROGANE EVER DELETED.' },
    { k: 'face', who: 'H', say: 'WALK WITH US, LITTLE BLADE.' }] },
  20: { t: 'CHAPTER 20 · THE HOLLOW MOON', p: [
    { k: 'city', th: 'hollow', cap: 'THE PARADE CLIMBS INTO A SKY OF ITS OWN, UNDER AN EMPTY MOON.' },
    { k: 'boss', id: 'hyakki', who: 'H', say: 'I AM EVERY NAME YOU FORGOT.' },
    { k: 'duo', who: 'K', say: 'Last night of the parade.', who2: 'R', say2: 'Then let us make it short.' }] },
  end7: { t: 'EPILOGUE · MORNING', p: [
    { k: 'boss', id: 'hyakki', down: 1, cap: 'HYAKKI: AT PEACE.' },
    { k: 'dawn', cap: 'THE PARADE FADES INTO THE MORNING. EVERY FORGOTTEN NAME IS REMEMBERED.' },
    { k: 'duo', who: 'M', say: 'Seven acts, Ren.', who2: 'R', say2: 'And the ramen place is finally open.' }] },
  end4: { t: 'EPILOGUE · THE LAST ECHO', p: [
    { k: 'boss', id: 'oryu', down: 1, cap: 'ORYU.EXE: SILENT.' },
    { k: 'dawn', cap: 'THE CABLE GOES DARK. THE SHRINE PETALS KEEP FALLING.' },
    { k: 'duo', who: 'M', say: 'Promise me that was the last one.', who2: 'R', say2: 'No promises. Ramen first.' }] },
  end3: { t: 'EPILOGUE · THE SKY IS OURS', p: [
    { k: 'boss', id: 'genesis', down: 1, cap: 'DEUS EX KUROGANE: UNLINKED.' },
    { k: 'dawn', cap: 'THE SATELLITES GO DARK. NEO-EDO SEES THE STARS AGAIN.' },
    { k: 'duo', who: 'M', say: 'So. What do heroes do on a day off?', who2: 'R', say2: 'Sleep. Then ramen.' }] },
  end2: { t: 'EPILOGUE · AFTER ZERO HOUR', p: [
    { k: 'boss', id: 'prime', down: 1, cap: 'KUROGANE PRIME: OFFLINE.' },
    { k: 'dawn', cap: 'THE BLACK TOWER GOES DARK. THE HARBOR LIGHTS GO GREEN.' },
    { k: 'duo', who: 'K', say: 'The city is quiet. Strange.', who2: 'R', say2: 'Get used to it.' }] },
  end: { t: 'EPILOGUE · 00:00:01', p: [
    { k: 'boss', id: 'shogun', down: 1, cap: 'SHOGUN.EXE: TERMINATED.' },
    { k: 'dawn', cap: 'BLACKOUT ABORTED. TWELVE MILLION IMPLANTS WAKE UP.' },
    { k: 'duo', who: 'K', say: 'Not bad, little brother.', who2: 'R', say2: "Let's go home." }] }
};
function cmRand(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); } // stable per index, so the art never flickers
const Comic = {
  on: false, key: '', page: null, n: 0, rev: [], t: 0, cb: null, g: null, cv: null, W: 0, H: 0, k: 1, bp: {}, chk: 0,
  play(key, cb) {
    const page = COMICS[key]; if (!page) { if (cb) cb(); return; }
    this.on = true; this.key = key; this.page = page; this.n = 1; this.t = 0; this.rev = [0]; this.cb = cb; this.done = false;
    UI.show('comic'); this.attach(); Aud.sfx('ui');
  },
  attach() {
    const cv = $('cmCv'); if (!cv) return; this.cv = cv; const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = Math.max(280, Math.round(r.width || 390)); this.H = Math.max(400, Math.round(r.height || 700));
    cv.width = Math.round(this.W * dpr); cv.height = Math.round(this.H * dpr); this.k = dpr; this.g = cv.getContext('2d');
  },
  tap() {
    if (!this.on) return;
    const p = this.page.p, last = this.rev[this.n - 1], since = this.t - last, cur = p[this.n - 1];
    const full = (cur.say ? cur.say.length : 0) + (cur.say2 ? cur.say2.length : 0);
    if (cur.say && since < .5 + full / 55) { this.rev[this.n - 1] = this.t - 9; return; } // finish the text first
    if (this.n < p.length) { this.rev.push(this.t); this.n++; Aud.sfx('ui'); return; }
    this.end();
  },
  end() {
    if (!this.on) return; this.on = false; this.page = null; const cb = this.cb; this.cb = null;
    if (cb) cb(); else UI.openStory();
  },
  tick(rd) {
    if (!this.on || UI.cur !== 'comic') return; if (!this.g) this.attach(); if (!this.g) return;
    this.chk -= rd; if (this.chk <= 0) { this.chk = .5; const r = this.cv.getBoundingClientRect(); if (Math.abs(r.width - this.W) > 4 || Math.abs(r.height - this.H) > 4) this.attach(); }
    this.t += rd; withCtx(this.g, () => { cx.setTransform(this.k, 0, 0, this.k, 0, 0); cx.direction = LANG.rtl ? 'rtl' : 'ltr'; this.draw(); });
  },
  /* ---------------- page layout ---------------- */
  draw() {
    const W = this.W, H = this.H, top = 52, bot = 46, gap = 10, x0 = 12, x1 = W - 12, hh = (H - top - bot - gap * 2) / 3, d = 12;
    cx.fillStyle = '#05060f'; cx.fillRect(0, 0, W, H);
    cx.globalAlpha = .07; cx.fillStyle = '#7df9ff'; for (let y = 0; y < H; y += 5) for (let x = (y / 5 % 2) * 2.5; x < W; x += 5) cx.fillRect(x, y, 1.2, 1.2); cx.globalAlpha = 1; // halftone paper
    cx.textBaseline = 'middle'; cx.textAlign = 'center'; cx.fillStyle = '#ffd23f'; cx.font = 'italic 700 16px ' + FONT_D; cx.fillText(lt(this.page.t), W / 2, 28, W - 160);
    for (let i = 0; i < 3; i++) {
      const ya = top + i * (hh + gap), yb = ya + hh;
      const tl = ya + (i ? (i % 2 ? d : -d) : 0), tr = ya - (i ? (i % 2 ? d : -d) : 0), bl = yb + (i < 2 ? (i % 2 ? -d : d) : 0), br = yb - (i < 2 ? (i % 2 ? -d : d) : 0);
      const poly = [x0, tl, x1, tr, x1, br, x0, bl];
      if (i >= this.n) { cx.strokeStyle = 'rgba(125,249,255,.12)'; cx.lineWidth = 2; this.path(poly); cx.stroke(); continue; }
      const age = this.t - this.rev[i], a = clamp(age / .35, 0, 1), e = 1 - (1 - a) * (1 - a);
      cx.save(); cx.globalAlpha = e; cx.translate((1 - e) * (i % 2 ? -40 : 40), 0);
      this.path(poly); cx.save(); cx.clip(); cx.translate(x0, Math.min(tl, tr)); this.scene(this.page.p[i], x1 - x0, Math.max(bl, br) - Math.min(tl, tr), age, i ? 2 * d : 0); cx.restore();
      cx.strokeStyle = '#e8fbff'; cx.lineWidth = 3; this.path(poly); cx.stroke();
      cx.restore();
    }
    cx.globalAlpha = .6 + .3 * Math.sin(this.t * 4); cx.fillStyle = '#8fa4c8'; cx.font = '700 12px ' + FONT_M; cx.textAlign = 'center';
    cx.fillText(this.n < 3 ? lt('TAP TO CONTINUE') : lt('TAP TO PLAY'), W / 2, H - 22); cx.globalAlpha = 1;
  },
  path(p) { cx.beginPath(); cx.moveTo(p[0], p[1]); for (let k = 2; k < p.length; k += 2) cx.lineTo(p[k], p[k + 1]); cx.closePath(); },
  scene(P, w, h, age, ins) {
    const kb = 1.06 - Math.min(.06, age * .012); // a slow push-in
    cx.save(); cx.translate(w / 2, h / 2); cx.scale(kb, kb); cx.translate(-w / 2, -h / 2);
    switch (P.k) {
      case 'city': this.city(THEMES[P.th] || THEMES.maglev, w, h, age, P.th === 'ghost'); break;
      case 'jump': this.jump(w, h, age); break;
      case 'boss': this.boss(P.id, !!P.down, w, h, age); break;
      case 'face': this.face(P.who, w, h, age); break;
      case 'clash': this.clash(w, h, age); break;
      case 'tower': this.tower(w, h, age); break;
      case 'ring': this.ring(w, h, age); break;
      case 'dawn': this.dawn(w, h, age); break;
      case 'duo': this.duo(w, h, age); break;
      case 'mirror': this.mirror(w, h, age); break;
    }
    cx.restore();
    const tt = age - .3, rtl = LANG.rtl;
    if (P.cap) this.caption(lt(P.cap), w, rtl, ins);
    if (P.say) {
      const sx = P.k === 'face' ? w * .62 : P.k === 'duo' ? w * .3 : w * .5, sy = P.k === 'face' ? h * .32 : P.k === 'tower' ? h * .5 : h * .24;
      this.bubble(lt(P.say), sx, sy, Math.min(w * (P.k === 'face' ? .6 : .56), 250), P.who, tt * 55, P.k === 'face' ? w * .25 : P.k === 'duo' ? w * .3 : P.k === 'boss' ? w * .5 : P.k === 'mirror' ? w * .73 : w * .3, h * .7, w);
    }
    if (P.say2) this.bubble(lt(P.say2), w * .72, h * .5, Math.min(w * .44, 200), P.who2, tt * 55 - (P.say || '').length, w * .66, h * .74, w);
  },
  wrap(text, maxW) {
    const words = String(text).split(' '), out = []; let line = '';
    for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (cx.measureText(tst).width > maxW && line) { out.push(line); line = wd; } else line = tst; }
    if (line) out.push(line); return out;
  },
  caption(text, w, rtl, ins) {
    cx.font = '700 12px ' + FONT_D; const lines = this.wrap(text, Math.min(w * .78, 300)), lh = 15, bw = Math.max(...lines.map(l => cx.measureText(l).width)) + 16, bh = lines.length * lh + 10;
    const bx = rtl ? w - 8 - bw : 8, by = 8 + (ins || 0);
    cx.fillStyle = '#ffd23f'; cx.fillRect(bx, by, bw, bh); cx.strokeStyle = '#05060f'; cx.lineWidth = 2; cx.strokeRect(bx, by, bw, bh);
    cx.fillStyle = '#05060f'; cx.textAlign = rtl ? 'right' : 'left'; cx.textBaseline = 'middle';
    lines.forEach((l, i) => cx.fillText(l, rtl ? bx + bw - 8 : bx + 8, by + 5 + lh / 2 + i * lh));
  },
  bubble(text, x, y, maxW, who, chars, tx, ty, w) {
    const c = CHARS[who] || CHARS.M, robot = who === 'S' || who === 'J' || who === 'N' || who === 'P' || who === 'B' || who === 'V' || who === 'C' || who === 'D';
    cx.font = (robot ? '700 12px ' + FONT_M : '700 13px ' + FONT_D);
    const lines = this.wrap(text, maxW - 20), lh = 16, bw = Math.min(maxW, Math.max(...lines.map(l => cx.measureText(l).width)) + 22), bh = lines.length * lh + 14;
    const bx = clamp(x - bw / 2, 6, Math.max(6, w - bw - 6)), by = y - bh / 2;
    cx.fillStyle = robot ? '#14020a' : '#ffffff'; cx.strokeStyle = robot ? c.col : '#05060f'; cx.lineWidth = 2.5;
    cx.beginPath(); cx.moveTo(bx + bw * .4, by + bh - 1); cx.lineTo(tx, Math.max(by + bh + 10, ty - 30)); cx.lineTo(bx + bw * .58, by + bh - 1); cx.closePath(); cx.fill(); cx.stroke(); // tail toward the speaker
    rrect(bx, by, bw, bh, robot ? 3 : 12); cx.fill(); cx.stroke();
    cx.fillStyle = robot ? c.col : '#05060f'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    let left = Math.max(0, chars | 0);
    for (let i = 0; i < lines.length; i++) { const l = lines[i], s = left >= l.length ? l : l.slice(0, left); left -= l.length + 1; if (s) cx.fillText(s, bx + bw / 2, by + 7 + lh / 2 + i * lh); if (left <= 0) break; }
    cx.fillStyle = c.col; cx.font = '700 10px ' + FONT_M; cx.textAlign = LANG.rtl ? 'right' : 'left'; cx.fillText(lt(c.name), LANG.rtl ? bx + bw - 6 : bx + 6, by - 7);
  },
  /* ---------------- scenes ---------------- */
  sky(c1, c2, w, h) { const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); cx.fillStyle = g; cx.fillRect(-20, -20, w + 40, h + 40); },
  skyline(w, h, base, col, win, seed, n, t, lit) {
    for (let i = 0; i < n; i++) {
      const bw = w / n * (.7 + cmRand(seed + i) * .8), x = i * w / n - bw * .2, bh = h * (.25 + cmRand(seed + i * 7) * .45);
      cx.fillStyle = col; cx.fillRect(x, base - bh, bw, bh + 4);
      if (win) { cx.fillStyle = win; for (let wy = base - bh + 6; wy < base - 6; wy += 9) for (let wx = x + 4; wx < x + bw - 4; wx += 7) { const r = cmRand(wx * 3.1 + wy * 1.7 + seed); if (r < (lit == null ? .35 : lit)) { cx.globalAlpha = .5 + .5 * Math.sin(t * 2 + r * 20); cx.fillRect(wx, wy, 3, 4); } } cx.globalAlpha = 1; }
    }
  },
  rain(w, h, t, c) { cx.strokeStyle = c; cx.globalAlpha = .35; cx.lineWidth = 1; cx.beginPath(); for (let i = 0; i < 40; i++) { const x = (cmRand(i) * w + t * 60) % w, y = (cmRand(i + 99) * h + t * 520) % h; cx.moveTo(x, y); cx.lineTo(x - 4, y + 14); } cx.stroke(); cx.globalAlpha = 1; },
  city(T, w, h, t, ghost) {
    this.sky(T.sky1, T.sky2, w, h);
    if (!ghost) { glow(w * .78, h * .26, 60, T.b1, .35); cx.fillStyle = '#e8fbff'; cx.globalAlpha = .8; dot(w * .78, h * .26, 12); cx.globalAlpha = 1; }
    this.skyline(w, h, h * .82, T.roof2, T.b2, 3, 9, t, ghost ? .06 : .3);
    this.skyline(w, h, h * .95, T.roof, T.win || T.rail, 41, 6, t, ghost ? .04 : .4);
    const ry = h * .74; cx.strokeStyle = T.rail; cx.lineWidth = 3; glow(w / 2, ry, w * .6, T.rail, .12); cx.beginPath(); cx.moveTo(-10, ry + 8); cx.lineTo(w + 10, ry - 8); cx.stroke();
    const tx = ((t * 160) % (w + 260)) - 220; // the train crosses the panel
    for (let k = 0; k < 3; k++) { const x = tx + k * 74, y = ry - (x + 30) / w * 16 + 8; cx.fillStyle = '#0b1030'; cx.fillRect(x, y - 16, 70, 13); cx.fillStyle = T.rail; for (let q = 0; q < 6; q++) cx.fillRect(x + 5 + q * 11, y - 12, 6, 4); }
    if (ghost) { cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(-20, -20, w + 40, h + 40); for (let k = 0; k < 4; k++) { const x = w * (.15 + k * .24), a = .3 + .3 * Math.sin(t * 3 + k * 2); glow(x, h * .55, 40, '#00ff88', a); } cx.fillStyle = '#00ff88'; cx.globalAlpha = .7; dot(w * .82, h * .5, 3); dot(w * .86, h * .5, 3); cx.globalAlpha = 1; }
    if (T.rain) this.rain(w, h, t, T.rail);
  },
  hero(x, y, s, face, dashing, blade, sk, t) {
    const h = HO; heroSetSkin(h, sk); h.x = 0; h.y = 0; h.face = face; h.mvA = face; h.spd = dashing ? 900 : 0; h.ph = t * 10; h.sx = h.sy = 1; h.dashing = dashing; h.blade = blade; h.alpha = 1;
    h.w = Store.data.weapon; h.fx = bladeOf(Store.data.blade); h.bl = 52; h.t = t; h.hot = 0; h.od = 0;
    cx.save(); cx.translate(x, y); cx.scale(s, s); drawHero(h); cx.restore();
  },
  speed(w, h, cxp, cyp, t, c) { cx.strokeStyle = c; cx.lineWidth = 2; cx.globalAlpha = .4; cx.beginPath(); for (let i = 0; i < 26; i++) { const a = cmRand(i) * TAU, r0 = 40 + ((t * 300 + cmRand(i + 5) * 200) % 120), r1 = r0 + 60 + cmRand(i + 9) * 80; cx.moveTo(cxp + Math.cos(a) * r0, cyp + Math.sin(a) * r0); cx.lineTo(cxp + Math.cos(a) * r1, cyp + Math.sin(a) * r1); } cx.stroke(); cx.globalAlpha = 1; },
  jump(w, h, t) {
    const T = THEMES.maglev; this.sky(T.sky1, T.sky2, w, h); this.skyline(w, h, h * .9, T.roof2, T.b2, 7, 8, t, .25);
    cx.fillStyle = '#0e1430'; cx.beginPath(); cx.moveTo(w * .1, h + 10); cx.lineTo(w * .4, h * .7); cx.lineTo(w * .62, h * .7); cx.lineTo(w * .95, h + 10); cx.closePath(); cx.fill(); // the train roof below
    cx.strokeStyle = T.rail; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(w * .4, h * .7); cx.lineTo(w * .1, h + 10); cx.moveTo(w * .62, h * .7); cx.lineTo(w * .95, h + 10); cx.stroke();
    const k = Math.min(1, t / 1.2), hx = lerp(w * .25, w * .52, k), hy = lerp(h * .15, h * .5, k);
    this.speed(w, h, hx, hy, t, '#e8fbff');
    this.hero(hx, hy, Math.min(2.2, h / 80), Math.PI * .3, true, Math.PI * .3 - 1.2, skinLook(Store.data.skin), t);
  },
  bossImg(id) { // each boss is drawn once into its own canvas
    if (this.bp[id]) return this.bp[id];
    const c = document.createElement('canvas'); c.width = c.height = 256; try { bossPortrait(c.getContext('2d'), id, 256); } catch (e) { errLog(e); } return (this.bp[id] = c);
  },
  boss(id, down, w, h, t) {
    const col = (BOSS_INFO[id] || {}).col || '#ff0844';
    cx.fillStyle = '#0a0612'; cx.fillRect(-20, -20, w + 40, h + 40);
    cx.save(); cx.translate(w / 2, h / 2); cx.rotate(t * .15); cx.fillStyle = col; cx.globalAlpha = .18; for (let i = 0; i < 16; i++) { cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, w, i * TAU / 16, i * TAU / 16 + TAU / 40); cx.closePath(); cx.fill(); } cx.restore(); cx.globalAlpha = 1;
    const img = this.bossImg(id), s = Math.min(w, h) * 1.15;
    cx.save(); cx.translate(w / 2, h / 2 + (down ? Math.min(14, t * 6) : Math.sin(t * 2) * 4)); if (down) cx.rotate(Math.min(.25, t * .1)); cx.drawImage(img, -s / 2, -s / 2, s, s); cx.restore();
    if (down) {
      for (let i = 0; i < 5; i++) { const p = ((t * .9 + i * .21) % 1), x = w * (.2 + cmRand(i) * .6), y = h * (.25 + cmRand(i + 3) * .5); cx.globalAlpha = 1 - p; glow(x, y, 20 + p * 60, i % 2 ? '#ffd23f' : '#ff6a00', .7); cx.fillStyle = '#fff4c2'; dot(x, y, (1 - p) * 8); }
      cx.globalAlpha = .35; cx.fillStyle = '#ff0844'; if (Math.sin(t * 9) > .7) cx.fillRect(-20, -20, w + 40, h + 40); cx.globalAlpha = 1;
      cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(w * .3, h * .1); cx.lineTo(w * .42, h * .4); cx.lineTo(w * .36, h * .52); cx.lineTo(w * .5, h * .9); cx.stroke();
    }
  },
  face(who, w, h, t) {
    const c = CHARS[who] || CHARS.M;
    cx.fillStyle = '#0b0f22'; cx.fillRect(-20, -20, w + 40, h + 40);
    cx.fillStyle = c.col; cx.globalAlpha = .22; for (let y = 4; y < h; y += 8) for (let x = (y / 8 % 2) * 4; x < w * .55; x += 8) { const r = 2.6 * (1 - x / (w * .55)); if (r > .2) dot(x, y, r); } cx.globalAlpha = 1;
    this.speed(w, h, w * .25, h * .55, t, c.col);
    const s = h * .82 / 170, talking = (t - .3) * 55 < 80 ? Math.abs(Math.sin(t * 16)) : 0;
    cx.save(); cx.translate(w * .25, h * .62); cx.scale(s, s); charPortrait(cx, who, t, talking, c.col); cx.restore();
  },
  mirror(w, h, t) { // Ren and his inverted copy, a cracked mirror between them
    cx.fillStyle = '#050505'; cx.fillRect(-20, -20, w + 40, h + 40);
    cx.globalAlpha = .12; cx.fillStyle = '#f2f2f2'; cx.font = '10px monospace'; for (let i = 0; i < 60; i++) cx.fillText(cmRand(i) < .5 ? '0' : '1', cmRand(i + 3) * w, (cmRand(i + 7) * h + t * 40) % h); cx.globalAlpha = 1;
    const s = Math.min(1.9, h / 90), sk = skinLook(Store.data.skin);
    this.hero(w * .27, h * .58, s, 0, false, 1.8, sk, t);
    for (const [ox, c] of [[-3, '#ff0844'], [3, '#00f2fe']]) { cx.globalAlpha = .4; this.hero(w * .73 + ox, h * .58, s, Math.PI, false, Math.PI - 1.8, { body: sk.body, a: c, b: c }, t); } cx.globalAlpha = 1;
    this.hero(w * .73, h * .58, s, Math.PI, false, Math.PI - 1.8, { body: sk.body, a: '#f2f2f2', b: '#ff0844' }, t);
    cx.strokeStyle = '#f2f2f2'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(w / 2, 0); cx.lineTo(w / 2 + 6, h * .3); cx.lineTo(w / 2 - 5, h * .5); cx.lineTo(w / 2 + 8, h * .75); cx.lineTo(w / 2, h); cx.stroke();
    cx.beginPath(); cx.moveTo(w / 2 - 5, h * .5); cx.lineTo(w / 2 - 30, h * .42); cx.moveTo(w / 2 + 6, h * .3); cx.lineTo(w / 2 + 28, h * .22); cx.stroke();
    if (Math.sin(t * 11) > .8) { cx.fillStyle = 'rgba(255,8,68,.4)'; cx.fillRect(0, (t * 300) % h, w, 3); }
  },
  clash(w, h, t) {
    cx.fillStyle = '#120a20'; cx.fillRect(-20, -20, w + 40, h + 40);
    this.speed(w, h, w / 2, h / 2, t, '#a66bff');
    const s = Math.min(1.9, h / 90), sh = Math.sin(t * 30) * Math.max(0, 1 - t) * 3;
    this.hero(w * .3 + sh, h * .55, s, 0, true, -.5, skinLook(Store.data.skin), t);
    this.hero(w * .7 - sh, h * .55, s, Math.PI, true, Math.PI + .5, { body: 'ninja', a: '#a66bff', b: '#2a1745' }, t);
    const p = (t * 3) % 1; glow(w / 2, h * .45, 50 + p * 30, '#ffffff', .6 * (1 - p));
    cx.fillStyle = '#ffffff'; cx.beginPath(); for (let i = 0; i < 16; i++) { const a = i * TAU / 16, r = i % 2 ? 8 : 26 + Math.sin(t * 20 + i) * 4; cx.lineTo(w / 2 + Math.cos(a) * r, h * .45 + Math.sin(a) * r); } cx.closePath(); cx.fill();
    cx.fillStyle = '#ffd23f'; for (let i = 0; i < 10; i++) { const q = ((t * 1.6 + cmRand(i)) % 1), a = cmRand(i + 4) * TAU; dot(w / 2 + Math.cos(a) * q * 90, h * .45 + Math.sin(a) * q * 60, 2.5 * (1 - q)); }
  },
  tower(w, h, t) {
    const T = THEMES.spire; this.sky('#05030f', T.sky1, w, h); this.skyline(w, h, h, T.roof, T.win || T.rail, 13, 8, t, .25);
    cx.fillStyle = '#0d0820'; cx.beginPath(); cx.moveTo(w * .4, h + 10); cx.lineTo(w * .47, h * .12); cx.lineTo(w * .5, -10); cx.lineTo(w * .53, h * .12); cx.lineTo(w * .6, h + 10); cx.closePath(); cx.fill();
    cx.strokeStyle = '#ff0844'; cx.lineWidth = 1.5; cx.stroke();
    glow(w * .5, h * .14, 46, '#ff0844', .6 + .3 * Math.sin(t * 3)); cx.fillStyle = '#ff0844'; cx.beginPath(); cx.ellipse(w * .5, h * .14, 9, 4, 0, 0, TAU); cx.fill(); cx.fillStyle = '#fff'; dot(w * .5 + Math.sin(t) * 3, h * .14, 2);
    for (let i = 0; i < 12; i++) { const q = ((t * .25 + i / 12) % 1), y = h * (1 - q * .85), x = w * .5 + Math.sin(q * 14) * (w * .1 * (1 - q * .7)); cx.fillStyle = '#ffd700'; cx.globalAlpha = .4 + .6 * q; dot(x, y, 2); } cx.globalAlpha = 1;
  },
  bolt(x0, y0, x1, y1, seed) { cx.beginPath(); cx.moveTo(x0, y0); for (let i = 1; i <= 6; i++) { const k = i / 6; cx.lineTo(lerp(x0, x1, k) + (cmRand(seed + i) - .5) * 30, lerp(y0, y1, k)); } cx.stroke(); },
  ring(w, h, t) {
    this.sky('#0a1024', '#3a4a78', w, h);
    cx.fillStyle = '#dff4ff'; for (let i = 0; i < 30; i++) { cx.globalAlpha = .3 + .5 * cmRand(i + 40) * (.6 + .4 * Math.sin(t * 2 + i)); dot(cmRand(i) * w, cmRand(i + 70) * h * .5, 1.2); } cx.globalAlpha = 1;
    glow(w / 2, h * .1, w * .7, '#9fd8ff', .18);
    cx.strokeStyle = 'rgba(159,216,255,.85)'; cx.lineWidth = 5; cx.beginPath(); cx.ellipse(w / 2, -h * .25, w * .85, h * .55, 0, 0, Math.PI); cx.stroke(); // the orbital ring
    cx.strokeStyle = 'rgba(181,55,242,.6)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(w / 2, -h * .25, w * .85, h * .55 + 7, 0, 0, Math.PI); cx.stroke();
    cx.strokeStyle = '#9fd8ff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(w * .62, h + 10); cx.lineTo(w * .62, h * .02); cx.stroke(); // the space elevator
    const ey = h * (1 - ((t * .2) % 1)); cx.fillStyle = '#dff4ff'; cx.fillRect(w * .62 - 6, ey - 4, 12, 8);
    for (let i = 0; i < 9; i++) { const x = (cmRand(i) * w * 1.2 + t * 14 * (1 + cmRand(i + 8))) % (w + 120) - 60, y = h * (.5 + cmRand(i + 2) * .45); cx.fillStyle = i % 2 ? '#2b3a5e' : '#4a5c8a'; cx.beginPath(); cx.ellipse(x, y, 70, 20, 0, 0, TAU); cx.fill(); cx.beginPath(); cx.ellipse(x + 30, y - 10, 36, 16, 0, 0, TAU); cx.fill(); }
    if ((t % 1.3) < .16) { cx.strokeStyle = '#ffffff'; cx.lineWidth = 3; this.bolt(w * .3, h * .05, w * .38, h * .75, ((t / 1.3) | 0) * 11); cx.globalAlpha = .25; cx.fillStyle = '#dff4ff'; cx.fillRect(-20, -20, w + 40, h + 40); cx.globalAlpha = 1; }
  },
  dawn(w, h, t) {
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1a5e'); g.addColorStop(.55, '#ff6a8a'); g.addColorStop(1, '#ffb347'); cx.fillStyle = g; cx.fillRect(-20, -20, w + 40, h + 40);
    const sy = h * .9 - Math.min(h * .3, t * 14); glow(w * .5, sy, 120, '#ffd23f', .6); cx.fillStyle = '#fff4c2'; dot(w * .5, sy, 26);
    this.skyline(w, h, h * .9, '#3a1d4a', '#ffe9a8', 21, 9, t, Math.min(.6, t * .12));
    this.skyline(w, h, h + 4, '#1d0f2a', '#ffd23f', 52, 6, t, Math.min(.5, t * .1));
  },
  duo(w, h, t) {
    this.dawn(w, h, t + 4);
    cx.fillStyle = '#120a1c'; cx.fillRect(-20, h * .72, w + 40, h * .4); cx.fillStyle = '#ff9a00'; cx.fillRect(-20, h * .72, w + 40, 2);
    const s = Math.min(1.7, h / 95);
    this.hero(w * .3, h * .78, s, -Math.PI / 2, false, -Math.PI / 2 + 1.8, { body: 'ninja', a: '#a66bff', b: '#2a1745' }, t);
    this.hero(w * .66, h * .8, s, -Math.PI / 2, false, -Math.PI / 2 + 1.8 + Math.sin(t * 2) * .1, skinLook(Store.data.skin), t);
  }
};
Object.assign(UI, {
  openComic(key, cb) { Comic.play(key, cb); }
});
