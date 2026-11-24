
/* --- MODULE 16: v107.0 RESULTS AS A SEQUENCE — one beat at a time, one main way on --- */
(function () {
  'use strict';
  const or0 = UI.openResult.bind(UI);
  UI.openResult = function (o) {
    const r = or0.apply(this, arguments);
    try {
      const sc = document.getElementById('s-result'), col = sc && sc.querySelector('.col'); if (!col) return r;
      sc.classList.remove('seq107', 'seqdone'); void sc.offsetWidth;
      let t = 0; const at = (e, d) => { if (e) e.style.setProperty('--d', d.toFixed(2) + 's'); };
      for (const e of col.children) {
        if (e.classList.contains('hidden')) continue;
        switch (e.id) {
          case 'rsEyebrow': at(e, 0); break;
          case 'rsTitle': at(e, .05); t = .45; break;
          case 'rsStars': case 'rsBest': at(e, t); t += .25; break;
          case 'rsGrade': at(e, t); t += .45; break;
          case 'rsStats': at(e, t); [...e.children].forEach((c, i) => at(c, t + .08 + i * .09)); t += .2 + e.children.length * .09; break;
          case 'rsMain': t += .15; at(e, t); t += .15; break;
          default: at(e, t); t += .07;
        }
      }
      sc.classList.add('seq107');
      // one main button: SHARE & CHALLENGE was a second gold button right under it
      const sh = document.getElementById('rsShare'); if (sh) { sh.classList.remove('gold'); sh.classList.add('ghost'); }
      // achievements earned in the run join the summary as gold lines, instead of a pop-up over the title
      const notes = document.getElementById('rsNotes');
      if (notes && UI.achQ.length) {
        for (const a of UI.achQ.splice(0)) notes.insertBefore(el('div', 'gold', '🏆 ' + lt('ACHIEVEMENT UNLOCKED') + ' · ' + lt(a.name) + '  +' + a.r + ' CR'), notes.firstChild);
        notes.classList.remove('hidden'); Aud.sfx('star', 2);
      }
      // a tap shows everything at once
      if (!sc.dataset.skip107) { sc.dataset.skip107 = 1; sc.addEventListener('pointerdown', () => { if (sc.classList.contains('seq107')) sc.classList.add('seqdone'); }, true); }
    } catch (e) { errLog(e); }
    return r;
  };
})();
