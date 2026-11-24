
/* --- MODULE 18: v107.0 THE RAIL MAP — the chapters as stations on one line through Neo-Edo --- */
(function () {
  'use strict';
  const rs0 = UI.renderStory.bind(UI);
  UI.renderStory = function () {
    const r = rs0.apply(this, arguments);
    try {
      const tabs = $('stTabs'); if (!tabs) return r;
      tabs.classList.add('rail107'); tabs.style.gridTemplateColumns = '';
      const st = Store.data.story.stars;
      [...tabs.children].forEach((b, i) => {
        const first = chFirst(i), n = chLen(i); let all = n > 0;
        for (let k = first; k < first + n; k++) if (!STAGES[k] || !(st[STAGES[k].id] > 0)) { all = false; break; }
        b.classList.toggle('done', all && !b.classList.contains('on')); // a station you have passed is lit
      });
      // the line rolls to where you are
      const on = tabs.querySelector('button.on');
      if (on && tabs.dataset.at !== String(this.storyCh)) { tabs.dataset.at = this.storyCh; requestAnimationFrame(() => { try { on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: tabs.dataset.seen ? 'smooth' : 'auto' }); tabs.dataset.seen = 1; } catch (e) { } }); }
    } catch (e) { errLog(e); }
    return r;
  };
})();
