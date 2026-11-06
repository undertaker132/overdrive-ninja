/* =====================================================================
   HEROES 4 — eight new bodies (version 21), original designs on classic
   anime and cyberpunk archetypes:
     netrunner   a hooded hacker with a glowing implant eye, cables from
                 the neck jack and a ring of floating data
     shinobi2    a white cyber-ninja frame with a red visor slit and a
                 lit spine
     chromesam   a street samurai: long coat with neon lining, a mohawk,
                 round mirror shades and chrome arms
     witch       a wide pointed hat with a star band and a long cape
     blaze       a brawler with burning spiky hair and a long headband
     ashura      a six-armed, three-faced war god with a gold crown
     idol        an android pop idol: bob hair, big headphones, joint
                 seams and floating notes
     exo         a heavy exosuit: shoulder blocks, a shoulder cannon and
                 a reactor core
   Top-down, +x = facing direction (see 41b-hero.js).
   ===================================================================== */
Object.assign(FOOT, { netrunner: 'boot', shinobi2: 'steel', chromesam: 'boot', witch: 'boot', blaze: 'sandal', ashura: 'claw', idol: 'steel', exo: 'jet' });
Object.assign(FOOTC, { netrunner: '#1a1430', chromesam: '#1a1a1a', witch: '#2a1a40', idol: '#e8eef8', ashura: '#7a1a1a' });
Object.assign(HANDC, { netrunner: ['#d9b48a', '#3a2a1a'], shinobi2: ['#e8eef8', '#5a6478'], chromesam: ['#c9d2e0', '#5a6478'], witch: ['#f4dcc8', '#5a3a2a'], blaze: ['#e0a070', '#5a2a10'],
  ashura: ['#c0302a', '#3a0a10'], idol: ['#f4eef8', '#8a7a9a'], exo: ['#5a6478', '#1a2030'] });
const TRAIL4 = {
  netrunner(sc, ca, cb) { // three data cables from the neck jack
    for (let k = -1; k <= 1; k++) { cx.strokeStyle = k ? '#2a2440' : ca; cx.lineWidth = k ? 2.2 : 1.6; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 8; i++) cx.lineTo(sc[i * 2] + k * i * .8, sc[i * 2 + 1] - k * i * .8); cx.stroke(); }
    cx.fillStyle = ca; dot(sc[14], sc[15], 1.8);
  },
  witch(sc, ca, cb) { // a long cape with a starry lining
    cx.strokeStyle = '#1a1030'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 7; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
    cx.strokeStyle = cb; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 7; i++) cx.lineTo(sc[i * 2], sc[i * 2 + 1]); cx.stroke();
    cx.fillStyle = '#ffffff'; for (let i = 1; i < 7; i += 2) dot(sc[i * 2], sc[i * 2 + 1], 1.2);
  },
  blaze(sc, ca, cb) { // two long headband tails
    for (let k = -1; k <= 1; k += 2) { cx.strokeStyle = cb; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(sc[0], sc[1]); for (let i = 1; i < 9; i++) cx.lineTo(sc[i * 2] + k * i * .9, sc[i * 2 + 1] + k * i * .5); cx.stroke(); }
  },
  exo(sc, ca, cb) { // a jet plume
    const ga = cx.globalAlpha; for (let i = 0; i < 6; i++) { cx.globalAlpha = ga * (.7 - i * .1); cx.fillStyle = i < 2 ? '#ffffff' : i < 4 ? '#ffd23f' : '#ff6a00'; dot(sc[i * 2], sc[i * 2 + 1], 4.5 - i * .6); } cx.globalAlpha = ga;
  },
  idol(sc, ca, cb) { // floating music notes left behind
    cx.fillStyle = cb; cx.font = '700 9px ' + FONT_D; cx.textAlign = 'center'; const ga = cx.globalAlpha;
    for (let i = 2; i < 10; i += 3) { cx.globalAlpha = ga * (1 - i / 11); cx.fillText(i % 2 ? '♪' : '♫', sc[i * 2], sc[i * 2 + 1]); } cx.globalAlpha = ga;
  }
};
Object.assign(BODY, {
  netrunner(o, sw) {
    pads(sw, '#1e1838', o.ca, 13, 8, -8);
    cx.beginPath(); cx.arc(-1, 0, 12, 0, TAU); cx.fillStyle = '#16122a'; cx.fill(); cx.strokeStyle = '#3a2e5a'; cx.lineWidth = 2; cx.stroke(); // jacket
    cx.strokeStyle = o.ca; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(-11, -4); cx.lineTo(-3, -9); cx.moveTo(-11, 4); cx.lineTo(-3, 9); cx.stroke(); // circuit piping
    cx.beginPath(); cx.arc(2, 0, 8.6, 0, TAU); cx.fillStyle = '#221a3e'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.4; cx.stroke(); // hood
    cx.beginPath(); cx.arc(6, 0, 5, -1.3, 1.3); cx.fillStyle = '#d9b48a'; cx.fill(); // face in the hood
    cx.fillStyle = '#05060f'; dot(8, 2.2, 1); hglow(8.2, -2.2, 10, o.cb, .9); cx.fillStyle = o.cb; dot(8.2, -2.2, 1.6); // the implant eye
    cx.strokeStyle = o.cb; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(8.2, -2.2); cx.lineTo(4, -5.5); cx.lineTo(1, -5.5); cx.stroke();
    cx.fillStyle = '#8a94aa'; cx.fillRect(-6, -1.5, 3, 3); // neck jack
    for (let k = 0; k < 5; k++) { const a = o.t * 1.4 + k * TAU / 5, r = 20 + Math.sin(o.t * 3 + k) * 2; cx.globalAlpha = o.alpha * .7; cx.fillStyle = k % 2 ? o.ca : '#ffffff'; cx.fillRect(Math.cos(a) * r - 1.6, Math.sin(a) * r - 1.6, 3.2, 3.2); } cx.globalAlpha = o.alpha; // data ring
  },
  shinobi2(o, sw) {
    cx.save(); cx.rotate(-sw);
    for (let sy = -1; sy <= 1; sy += 2) { cx.beginPath(); cx.moveTo(-9, sy * 9); cx.lineTo(3, sy * 11); cx.lineTo(1, sy * 18); cx.lineTo(-10, sy * 16); cx.closePath(); cx.fillStyle = '#d8dee8'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.2; cx.stroke(); }
    cx.restore();
    cx.beginPath(); cx.ellipse(-2, 0, 11, 11.5, 0, 0, TAU); cx.fillStyle = '#c9d2e0'; cx.fill(); cx.strokeStyle = '#5a6478'; cx.lineWidth = 1.6; cx.stroke();
    for (let k = 0; k < 4; k++) { const x = -11 + k * 3; cx.fillStyle = ((o.t * 8 | 0) + k) % 4 === 0 ? '#ffffff' : o.cb; cx.fillRect(x, -1.2, 2, 2.4); } hglow(-6, 0, 12, o.cb, .5); // lit spine
    cx.strokeStyle = '#2a3150'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-12, -8); cx.lineTo(-2, 9); cx.stroke(); // short back blade
    cx.beginPath(); cx.ellipse(4, 0, 7.4, 7, 0, 0, TAU); cx.fillStyle = '#e8eef8'; cx.fill(); cx.strokeStyle = '#8a94aa'; cx.lineWidth = 1.2; cx.stroke(); // helmet
    cx.fillStyle = '#0a0c14'; cx.beginPath(); cx.ellipse(8, 0, 2.6, 6, 0, 0, TAU); cx.fill(); hglow(9, 0, 12, o.cb, .9); cx.fillStyle = o.cb; cx.fillRect(8.4, -5, 1.6, 10); // visor slit
    cx.strokeStyle = '#8a94aa'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(0, -6.5); cx.lineTo(-4, -9); cx.moveTo(0, 6.5); cx.lineTo(-4, 9); cx.stroke(); // antenna fins
  },
  chromesam(o, sw) {
    const fl = o.dashing ? 1 : Math.min(1, o.spd / 400), wv = Math.sin(o.t * 6) * 1.5;
    cx.fillStyle = '#121218'; cx.beginPath(); cx.moveTo(-3, -12); cx.quadraticCurveTo(-16 - fl * 8, -13 + wv, -22 - fl * 10, -5); cx.lineTo(-22 - fl * 10, 5); cx.quadraticCurveTo(-16 - fl * 8, 13 - wv, -3, 12); cx.closePath(); cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.6; cx.stroke(); // long coat, neon lining
    pads(sw, '#9aa4b8', '#e8eef8', 12, 7, -7); // chrome shoulders
    cx.beginPath(); cx.arc(-1, 0, 11.5, 0, TAU); cx.fillStyle = '#18181f'; cx.fill(); cx.strokeStyle = '#3a3a48'; cx.lineWidth = 2; cx.stroke();
    cx.beginPath(); cx.arc(3, 0, 7.4, 0, TAU); cx.fillStyle = '#d0a07a'; cx.fill(); // head
    cx.fillStyle = o.cb; for (let k = 0; k < 6; k++) { const x = -3 + k * 1.9; cx.beginPath(); cx.moveTo(x - 1.4, 0); cx.lineTo(x, -1.6 - (k % 2) * 1.2); cx.lineTo(x + 1.4, 0); cx.lineTo(x, 1.6 + (k % 2) * 1.2); cx.closePath(); cx.fill(); } // mohawk
    cx.fillStyle = '#0a0a10'; dot(8, -2.8, 2.2); dot(8, 2.8, 2.2); cx.fillStyle = o.ca; dot(8.6, -3.4, .7); dot(8.6, 2.2, .7); // mirror shades
    cx.strokeStyle = '#0a0a10'; cx.lineWidth = .9; cx.beginPath(); cx.moveTo(8, -.6); cx.lineTo(8, .6); cx.stroke();
  },
  witch(o, sw) {
    pads(sw, '#2a1a40', o.cb, 12, 7, -8);
    cx.beginPath(); cx.arc(-1, 0, 11, 0, TAU); cx.fillStyle = '#1e1030'; cx.fill();
    const br = 17 + Math.sin(o.t * 3) * .6; cx.beginPath(); cx.ellipse(2, 0, br, br * .94, 0, 0, TAU); cx.fillStyle = '#140a28'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.6; cx.stroke(); // the wide brim
    cx.strokeStyle = o.cb; cx.lineWidth = 2.4; cx.beginPath(); cx.arc(2, 0, 10, 0, TAU); cx.stroke(); // hat band
    cx.fillStyle = '#ffe14d'; for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + .3, x = 2 + Math.cos(a) * 13.5, y = Math.sin(a) * 13.5; cx.beginPath(); for (let j = 0; j < 8; j++) { const q = j * Math.PI / 4, r = j % 2 ? .8 : 2.2; j ? cx.lineTo(x + Math.cos(q) * r, y + Math.sin(q) * r) : cx.moveTo(x + Math.cos(q) * r, y + Math.sin(q) * r); } cx.closePath(); cx.fill(); } // stars on the brim
    cx.beginPath(); cx.moveTo(2 + 9, 0); for (let k = 1; k <= 24; k++) { const a = k * .55, r = 9 - k * .35; cx.lineTo(2 + Math.cos(a) * r - k * .25, Math.sin(a) * r); } cx.strokeStyle = '#3a2a5a'; cx.lineWidth = 2; cx.stroke(); // the crown spirals to a tip that leans back
    cx.fillStyle = '#ffe14d'; dot(-4, 0, 1.6); hglow(-4, 0, 8, '#ffe14d', .6);
    cx.fillStyle = o.ca; cx.beginPath(); cx.moveTo(16, -3); cx.quadraticCurveTo(21, 0, 16, 3); cx.fill(); // a lock of hair under the brim
    const sa = o.t * 2.2, sx = Math.cos(sa) * 24, sy = Math.sin(sa) * 24; hglow(sx, sy, 10, '#ffe14d', .8); cx.fillStyle = '#ffffff'; dot(sx, sy, 1.6); // a little star familiar
  },
  blaze(o, sw) {
    pads(sw, '#3a2010', o.ca, 13, 8, -8);
    cx.beginPath(); cx.arc(-1, 0, 12.5, 0, TAU); cx.fillStyle = '#e0a070'; cx.fill(); cx.strokeStyle = '#7a4020'; cx.lineWidth = 1.4; cx.stroke(); // bare shoulders
    cx.fillStyle = '#2a2a3a'; cx.beginPath(); cx.moveTo(-12, -6); cx.lineTo(4, -10); cx.lineTo(6, -4); cx.lineTo(-10, -2); cx.closePath(); cx.fill(); cx.beginPath(); cx.moveTo(-12, 6); cx.lineTo(4, 10); cx.lineTo(6, 4); cx.lineTo(-10, 2); cx.closePath(); cx.fill(); // open vest
    if (o.dashing || o.od) hglow(0, 0, 40, o.ca, .45); // fighting aura
    for (let k = 0; k < 9; k++) { const a = Math.PI * .45 + k * Math.PI * 1.1 / 8, fl = 1 + .25 * Math.sin(o.t * 14 + k * 1.7), r = 11 * fl; // burning spiky hair, swept back
      cx.fillStyle = k % 2 ? o.ca : o.cb; cx.beginPath(); cx.moveTo(3 + Math.cos(a - .35) * 5, Math.sin(a - .35) * 5); cx.lineTo(3 + Math.cos(a) * r - 4, Math.sin(a) * r); cx.lineTo(3 + Math.cos(a + .35) * 5, Math.sin(a + .35) * 5); cx.closePath(); cx.fill(); }
    cx.beginPath(); cx.arc(4, 0, 6.6, 0, TAU); cx.fillStyle = o.ca; cx.fill(); hglow(4, 0, 16, o.ca, .5);
    cx.fillStyle = '#e0a070'; cx.beginPath(); cx.arc(7, 0, 4.4, -1.3, 1.3); cx.fill();
    cx.strokeStyle = o.cb; cx.lineWidth = 2.2; cx.beginPath(); cx.arc(4, 0, 6.2, -1.4, 1.4); cx.stroke(); // headband
    cx.fillStyle = '#05060f'; dot(9, -2, 1); dot(9, 2, 1);
  },
  ashura(o, sw) {
    const sw2 = Math.sin(o.t * 4) * .25, punch = o.dashing ? .4 : 0;
    for (let sy = -1; sy <= 1; sy += 2) for (let k = 0; k < 2; k++) { // four extra arms with fists
      const a = sy * (1.2 + k * .55) + (k ? -sw2 : sw2) * sy - punch * sy * .4, L = 15 + (o.dashing && !k ? 6 : 0), x = -2 + Math.cos(a) * L, y = Math.sin(a) * L;
      cx.strokeStyle = '#3a0a10'; cx.lineWidth = 5.5; cx.beginPath(); cx.moveTo(-2 + Math.cos(a) * 8, Math.sin(a) * 8); cx.lineTo(x, y); cx.stroke(); cx.strokeStyle = o.ca; cx.lineWidth = 3.4; cx.stroke();
      cx.fillStyle = o.ca; dot(x, y, 3.4); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, 3.4, 0, TAU); cx.stroke(); }
    cx.beginPath(); cx.arc(-2, 0, 12, 0, TAU); cx.fillStyle = '#3a0a10'; cx.fill(); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 2; cx.stroke();
    cx.strokeStyle = '#ffd23f'; cx.lineWidth = 1; cx.beginPath(); cx.arc(-2, 0, 8, 0, TAU); cx.stroke(); // a gold sash ring
    cx.beginPath(); cx.arc(3, 0, 8, 0, TAU); cx.fillStyle = o.ca; cx.fill(); cx.strokeStyle = '#3a0a10'; cx.lineWidth = 1.2; cx.stroke(); // head
    for (const [fx, fy, fa] of [[8.5, 0, 0], [3, -7.6, -1.57], [3, 7.6, 1.57]]) { cx.save(); cx.translate(fx, fy); cx.rotate(fa); cx.fillStyle = '#ffd23f'; dot(0, -2, 1.1); dot(0, 2, 1.1); cx.fillStyle = '#ffffff'; cx.fillRect(1.2, -.8, 1.4, 1.6); cx.restore(); } // three faces
    cx.fillStyle = '#ffd23f'; for (let k = 0; k < 5; k++) { const a = Math.PI + (k - 2) * .45; cx.beginPath(); cx.moveTo(3 + Math.cos(a - .15) * 6, Math.sin(a - .15) * 6); cx.lineTo(3 + Math.cos(a) * 11, Math.sin(a) * 11); cx.lineTo(3 + Math.cos(a + .15) * 6, Math.sin(a + .15) * 6); cx.closePath(); cx.fill(); } // crown
    hglow(3, 0, 26, '#ffd23f', .25); cx.strokeStyle = 'rgba(255,210,63,.5)'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(-4, 0, 22, 0, TAU); cx.stroke(); // a halo of fire behind
  },
  idol(o, sw) {
    pads(sw, '#e8eef8', o.ca, 12, 7, -8);
    cx.beginPath(); cx.arc(-1, 0, 11, 0, TAU); cx.fillStyle = '#f4eef8'; cx.fill(); cx.strokeStyle = '#b8b0c8'; cx.lineWidth = 1.4; cx.stroke();
    cx.strokeStyle = '#8a7a9a'; cx.lineWidth = .8; cx.beginPath(); cx.arc(-1, 0, 7, 0, TAU); cx.moveTo(-8, 0); cx.lineTo(-12, 0); cx.stroke(); // joint seams
    cx.fillStyle = o.cb; cx.fillRect(-10, -1, 4, 2); hglow(-8, 0, 8, o.cb, .6); // power light
    cx.beginPath(); cx.arc(3, 0, 8, 0, TAU); cx.fillStyle = o.ca; cx.fill(); // bob hair
    cx.fillStyle = '#f4eef8'; cx.beginPath(); cx.arc(6, 0, 5.4, -1.2, 1.2); cx.fill(); // face
    cx.fillStyle = o.cb; dot(8.4, -2, 1.2); dot(8.4, 2, 1.2); cx.fillStyle = '#ffffff'; dot(8.8, -2.4, .4); dot(8.8, 1.6, .4);
    for (let sy = -1; sy <= 1; sy += 2) { cx.beginPath(); cx.arc(2, sy * 8.4, 3.6, 0, TAU); cx.fillStyle = '#2a2a3a'; cx.fill(); cx.strokeStyle = o.cb; cx.lineWidth = 1.4; cx.stroke(); hglow(2, sy * 8.4, 8, o.cb, .5 + .3 * Math.sin(o.t * 8)); } // headphones
    cx.strokeStyle = '#2a2a3a'; cx.lineWidth = 2; cx.beginPath(); cx.arc(2, 0, 8.4, -1.57, 1.57, true); cx.stroke(); // headband over the back
    cx.strokeStyle = o.cb; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(2, 9); cx.quadraticCurveTo(10, 11, 12, 5); cx.stroke(); cx.fillStyle = o.cb; dot(12, 5, 1.2); // mic
  },
  exo(o, sw) {
    cx.save(); cx.rotate(-sw);
    for (let sy = -1; sy <= 1; sy += 2) { cx.fillStyle = '#3a4458'; rrect(-12, sy > 0 ? 11 : -22, 18, 11, 3); cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.6; cx.stroke(); cx.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) cx.fillRect(-10 + k * 5, sy > 0 ? 18 : -15, 3, 2); } // shoulder blocks with hazard marks
    cx.fillStyle = '#2a3340'; cx.fillRect(-8, -26, 18, 5); cx.strokeStyle = '#8a94aa'; cx.lineWidth = 1; cx.strokeRect(-8, -26, 18, 5); cx.fillStyle = o.cb; dot(10, -23.5, 1.8); // shoulder cannon
    cx.restore();
    rrect(-14, -12, 24, 24, 6); cx.fillStyle = '#2a3340'; cx.fill(); cx.strokeStyle = '#5a6478'; cx.lineWidth = 2; cx.stroke();
    hglow(-6, 0, 16, o.cb, .7); cx.fillStyle = o.cb; dot(-6, 0, 3.6); cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.beginPath(); cx.arc(-6, 0, 5.4, o.t * 4, o.t * 4 + 4); cx.stroke(); // reactor core
    rrect(1, -7, 12, 14, 4); cx.fillStyle = '#3a4458'; cx.fill(); cx.strokeStyle = o.ca; cx.lineWidth = 1.4; cx.stroke(); // helmet
    cx.fillStyle = o.ca; cx.fillRect(9.5, -5, 2.5, 10); hglow(11, 0, 10, o.ca, .6);
  }
});
