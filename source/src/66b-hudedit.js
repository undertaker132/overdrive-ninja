/* =====================================================================
   BUTTON LAYOUT — drag the skill buttons anywhere on the screen.
   Offsets are stored as fractions of the screen (Store.data.hudPos), so a
   layout survives rotation and moves sensibly to another phone. Opened
   from Settings > Controls; while it is open the buttons do not fire.
   ===================================================================== */
const HudEdit = {
  on: false, ov: null, drag: null,
  pos() { const d = Store.data; if (!d.hudPos || typeof d.hudPos !== 'object') d.hudPos = {}; return d.hudPos; },
  apply() {
    const p = this.pos(), W = window.innerWidth || 390, H = window.innerHeight || 844;
    document.querySelectorAll('#dock .sk').forEach(b => { const o = p[b.dataset.k]; b.style.transform = o ? 'translate(' + Math.round(o.x * W) + 'px,' + Math.round(o.y * H) + 'px)' : ''; });
  },
  open() {
    if (this.on) return; this.on = true;
    const ov = this.ov = el('div', 'hudedit-ov'); ov.id = 'hudEditOv';
    ov.appendChild(el('div', 'eyebrow', lt('BUTTON LAYOUT')));
    ov.appendChild(el('div', 'small', lt('Drag the skill buttons where your thumbs rest. Tap DONE to save.')));
    const row = el('div', 'grid2'), done = el('button', 'btn pri', lt('DONE')), reset = el('button', 'btn', lt('RESET'));
    done.id = 'hudEditDone'; reset.id = 'hudEditReset';
    done.onclick = () => { Aud.sfx('ui'); this.close(); };
    reset.onclick = () => { Aud.sfx('back'); Store.data.hudPos = {}; Store.touch(); this.apply(); };
    row.appendChild(reset); row.appendChild(done); ov.appendChild(row);
    document.body.appendChild(ov); document.body.classList.add('hudedit'); $('dock').classList.remove('hidden'); this.apply();
  },
  close() {
    this.on = false; this.drag = null; if (this.ov) { this.ov.remove(); this.ov = null; }
    document.body.classList.remove('hudedit'); if (G.state !== 'PLAY' && G.state !== 'PAUSE' && G.state !== 'PERK') $('dock').classList.add('hidden');
    Store.touch(); UI.measureDock();
  },
  grab(b, e) {
    const k = b.dataset.k, p = this.pos(), W = window.innerWidth || 390, H = window.innerHeight || 844, o = p[k] || { x: 0, y: 0 };
    const r = b.getBoundingClientRect(), bx = r.left - o.x * W, by = r.top - o.y * H; // where the button sits with no offset
    const sx = e.clientX - o.x * W, sy = e.clientY - o.y * H;
    const mv = ev => {
      const x = clamp(ev.clientX - sx, -bx, W - r.width - bx), y = clamp(ev.clientY - sy, -by, H - r.height - by);
      p[k] = { x: x / W, y: y / H }; b.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); Store.touch(); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
};
window.addEventListener('resize', () => { try { HudEdit.apply(); } catch (e) { errLog(e); } });
