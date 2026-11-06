/* =====================================================================
   TUTORIAL FREEZE-FRAMES — the first time a mechanic appears, time
   stops, a spotlight marks it and one short instruction explains it.
   Each tip shows once per profile (Settings can turn tips off).
   ===================================================================== */
const TUTS = {
  bullet: { t: 'INCOMING BULLET', d: 'Slash through it to send it back. Do it right as your dash starts for a PERFECT PARRY.' },
  shield: { t: 'SHIELDED ENEMY', d: 'The green arc blocks hits from the front. Hit it from behind, bounce off a rail first, or perfect-parry.' },
  sniper: { t: 'SNIPER', d: 'The orange laser shows exactly where it will shoot. Step off the line or parry the shot.' },
  bomber: { t: 'BOMBER', d: 'It blinks, then explodes. Slash it fast or get out of the ring.' },
  phantom: { t: 'PHANTOM', d: 'It fades out and blinks next to you. Watch for the shimmer, then strike.' },
  warden: { t: 'WARDEN', d: 'Blue tethers give its friends a shield bubble. Cut the warden first.' },
  elite: { t: 'ELITE ENEMY', d: 'Gold ring: tougher and richer. Its tag is its trick: SWIFT is fast, VOLATILE explodes when it dies, SPLIT leaves two minis, AEGIS re-shields itself.' },
  weak: { t: 'WEAKPOINT', d: 'Slash the gold arc to stagger the boss. While it is staggered, tap the boss fast for finishing slashes.' },
  term: { t: 'DATA TERMINAL', d: 'Stand still inside the ring until it fills. Getting hit slows the upload.' },
  uplink: { t: 'THE UPLINK', d: 'Enemies that reach the uplink damage it. Bombers go for it first.' },
  train: { t: 'EXPRESS TRAIN', d: 'Red stripes mean a train is coming down that track. Get off it, or lure enemies onto it.' },
  od: { t: 'OVERDRIVE READY', d: 'Tap OVERDRIVE: a few seconds of invincibility, endless dashes and double damage.' },
  heat: { t: 'BLADE HEAT', d: 'A hot blade hits 25% harder. At 100 it overheats and locks for a moment.' },
  dodge: { t: 'OUT OF CHARGES', d: 'Swipe anyway to dodge. Charges refill over time and on every hit.' },
  highway: { t: 'HIGHWAY CHASE', d: 'Dash THROUGH a car to slice it in half. Without a dash, cars hurt. The bike swerves around cars on its own; trucks take two dashes.' },
  valk: { t: 'SPEAR DIVE', d: 'She dives along the red line. Step aside: if she hits a rail she crashes and is open to attack.' },
  hyakki: { t: 'THE CHARGE', d: 'A red column marks the lane the cart will charge down. Step out of it, then cut the spirit lanterns.' },
  tenkai: { t: 'SOLAR LANCE', d: 'A thin red line shows where the lance will burn. Step off the line before it fires, and break the mirror panels to blind it.' },
  izanami: { t: 'HAND OF DEATH', d: 'Her hand slams down inside the red circle. Dash out, then cut the hands to stop her attacks.' },
  oryu: { t: 'CONSTRICT', d: 'The serpent throws a ring around you. Dash out before it snaps shut, and never touch its body outside a dash.' },
  chimera: { t: 'THREE HEADS', d: 'Each head has its own attack. Break a head and its attack stops for good.' },
  clash: { t: 'JUDGEMENT DASH', d: 'The red line is its dash. Dash straight into it to clash and stagger it.' },
  kage: { t: 'KAGE ATTACKS', d: 'The red line is his dash. Dash straight into it to clash and stun him.' },
  shard: { t: 'DATA SHARDS', d: 'Touch a glowing shard to collect it. A new one appears somewhere else on the roof.' },
  escort: { t: 'THE CARGO DRONE', d: 'Enemies that reach the drone damage it. Bombers go for it first. Stay close as it moves.' },
  bells: { t: 'THE BELLS', d: 'Its body is sealed. Hit the lit bell, then the next: the numbers show the order. All four breaks the seal.' },
  nullren: { t: 'REN.NULL ATTACKS', d: 'The red line is its dash. Dash straight into it to clash. Hit it right after a dash, never from the front.' },
  courier: { t: 'THE COURIER', d: 'It blinks away every time you hit it. Keep chasing before the timer runs out.' },
  medic: { t: 'MEDIC DRONE', d: 'Its green beam heals an enemy and gives it a shield. Cut the medic first.' },
  mimic: { t: 'MIMIC', d: 'It copies your last dash a moment later. The pink line shows where it will go: step off it.' },
  mirror: { t: 'MIRROR', d: 'Dashing into the bright arc bounces you away. Hit the dark side, or use the bounce for a ricochet crit.' },
  mine: { t: 'PROXIMITY MINE', d: 'Walking near it sets it off. Dash straight through it to disarm it for points.' },
  miniboss: { t: 'MINI-BOSS', d: 'A tough enemy with its own attacks and a health bar. Learn its warning sign, then strike.' }
};
const Tut = {
  cur: null,
  on() { return Store.data.settings.tips !== 0; },
  check(id, x, y, r) {
    const seen = Store.data.tut; if (this.cur || seen[id] || !this.on() || G.state !== 'PLAY' || G.freeze > 0) return false;
    seen[id] = 1; Store.touch();
    this.cur = { id, x, y, r: r || 42, t: 0, def: TUTS[id], lines: null };
    In.cancel(); Aud.sfx('ui'); vibe('tip');
    return true;
  },
  dismiss() { if (this.cur && this.cur.t > .35) { this.cur = null; Aud.sfx('back'); REC.act(RA.TUTOFF); } },
  tick(rd) { if (this.cur) this.cur.t += rd; },
  wrap(text, maxW) {
    const words = text.split(' '), out = []; let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (cx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out;
  },
  draw() {
    const c = this.cur; if (!c) return;
    const k = Math.min(1, c.t * 5), pulse = 1 + Math.sin(c.t * 6) * .06, r = c.r * pulse;
    cx.globalAlpha = .78 * k; cx.fillStyle = '#02030a';
    cx.beginPath(); cx.rect(-20, -20, V.VW + 40, V.VH + 40); cx.arc(c.x, c.y, r, 0, TAU, true); cx.fill('evenodd');
    cx.globalAlpha = k; cx.strokeStyle = '#ffd700'; cx.lineWidth = 3; cx.beginPath(); cx.arc(c.x, c.y, r, 0, TAU); cx.stroke();
    cx.setLineDash(DASH6); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(c.x, c.y, r + 10, c.t, c.t + TAU); cx.stroke(); cx.setLineDash(NODASH);
    const w = Math.min(V.AW + 20, V.VW - 28), x0 = V.CX - w / 2;
    cx.font = '600 15px ' + "'Rajdhani', 'Rubik', 'Segoe UI', system-ui, sans-serif";
    if (!c.lines) c.lines = this.wrap(lt(c.def.d), w - 28);
    const h = 58 + c.lines.length * 19, below = c.y < V.VH * .5, y0 = below ? Math.min(V.VH - h - 90, c.y + r + 26) : Math.max(70, c.y - r - 26 - h);
    cx.fillStyle = 'rgba(8,12,30,.96)'; cx.fillRect(x0, y0, w, h); cx.strokeStyle = '#ffd700'; cx.lineWidth = 1.5; cx.strokeRect(x0 + .5, y0 + .5, w - 1, h - 1);
    const tx = tx0(x0, w, 14); cx.textAlign = talS(); cx.fillStyle = '#ffd700'; cx.font = '700 17px ' + FONT_D; cx.fillText(lt(c.def.t), tx, y0 + 26);
    cx.fillStyle = '#e8fbff'; cx.font = '600 15px ' + "'Rajdhani', 'Rubik', 'Segoe UI', system-ui, sans-serif";
    for (let i = 0; i < c.lines.length; i++) cx.fillText(c.lines[i], tx, y0 + 48 + i * 19);
    cx.fillStyle = c.t > .35 ? '#8fa4c8' : '#3a4466'; cx.font = '700 10px ' + FONT_M; cx.textAlign = LANG.rtl ? 'left' : 'right';
    cx.fillText(lt('TAP TO CONTINUE'), LANG.rtl ? x0 + 12 : x0 + w - 12, y0 + h - 10);
    cx.textAlign = 'left'; cx.globalAlpha = 1;
  }
};
function dockCenter(k) { // a dock button's center in logical units (for spotlighting it)
  const b = document.querySelector('#dock .sk[data-k="' + k + '"]'); if (!b) return null;
  const r = b.getBoundingClientRect(); if (!r.width) return null;
  return { x: (r.left + r.width / 2 - In.ox) / V.s, y: (r.top + r.height / 2 - In.oy) / V.s, r: Math.max(r.width, r.height) / V.s * .62 };
}
