
/* --- MODULE 29: v120.0 SKIN ART — every hero's own painted portrait --- */
(function () {
  'use strict';
  // Every hero now has a painted card (icons/skins/<id>.jpg), made from the player's own character sheets. Wherever the
  // game shows a hero's portrait (the Arsenal list and stage, the shop, crate rewards, the profile, the home card) it
  // shows that painting; until it has loaded (or for a hero without one) the drawn portrait stays.
  const ART = new Set(["abyssal", "apex", "ascendant", "ashura", "astral_oni", "auroraseraph", "blaze", "breather", "captain", "chromeoni", "chromesam", "cleaver", "complete", "crimson", "crowned", "cursed", "cyan", "cyber_kitsune", "deus", "emberninja", "emerald_phantom", "encore", "eva", "exframe", "exo", "firstblade", "foxsage", "glitchsam", "gold", "goo", "idol", "kitsune", "knight", "lanternoni", "legendk", "mecha", "midnightwolf", "monk", "neko", "neonmaster", "neonshogun", "netrunner", "nullren", "obsidian_shogun", "oni", "oniking", "phantomfox", "primegold", "prism_ronin", "pumpking", "raijin", "reaper", "retro", "rider", "ronin", "ryu", "sakurawitch", "season0", "season1", "season10", "season11", "season2", "season3", "season4", "season5", "season6", "season7", "season8", "season9", "seraph", "shinobi2", "skull", "skybreak", "solar", "solar_seraph", "starborn", "starframe", "starseraph", "stormdragon", "stormkid", "sung", "surge", "tengu", "tide", "twin", "veil", "venom", "viking", "void", "voidking", "voidlich", "voidoni", "wildhunter", "witch", "wolf", "worldeater_s", "yeti", "yurei"]);
  const img = {}, wait = {};
  function get(id) {
    if (!ART.has(id)) return null; const i = img[id]; if (i && i.complete && i.naturalWidth) return i;
    if (!i) { const n = new Image(); n.decoding = 'async'; n.onload = () => { try { refresh(id); } catch (e) { } }; n.onerror = () => ART.delete(id); n.src = 'icons/skins/' + id + '.jpg'; img[id] = n; }
    return null;
  }
  // a canvas that asked for a portrait before it arrived is redrawn when it lands
  function refresh(id) { clearTimeout(wait.t); wait.t = setTimeout(() => { try { document.querySelectorAll('canvas[data-art120]').forEach(cv => { const sk = SKINS.find(s => s.id === cv.dataset.art120); if (sk && img[sk.id] && img[sk.id].complete) { const g = cv.getContext('2d'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); bust(g, sk, cv.width); g.restore(); } }); if (typeof Preview !== 'undefined' && Preview.sel) Preview.t = Math.max(Preview.t, .6); } catch (e) { } }, 80); }
  // head and shoulders, from the top of the card
  function bust(g, sk, S) {
    const i = get(sk.id); if (!i) return false; const w = i.naturalWidth, h = i.naturalHeight, s = w * .78;
    g.fillStyle = '#070a18'; g.fillRect(0, 0, S, S); g.drawImage(i, (w - s) / 2, h * .01, s, s, 0, 0, S, S);
    const gr = g.createLinearGradient(0, S * .7, 0, S); gr.addColorStop(0, 'rgba(7,10,24,0)'); gr.addColorStop(1, 'rgba(7,10,24,.55)'); g.fillStyle = gr; g.fillRect(0, S * .7, S, S * .3);
    return true;
  }
  if (typeof heroBust === 'function') {
    const hb0 = heroBust;
    heroBust = function (g, sk, S, t) { try { if (sk && ART.has(sk.id)) { if (bust(g, sk, S)) return; try { if (g.canvas) g.canvas.dataset.art120 = sk.id; } catch (e) { } get(sk.id); } } catch (e) { } return hb0.apply(this, arguments); };
  }
  // the shop and Arsenal list tiles of the heroes tab
  if (typeof drawIcon === 'function') {
    const di0 = drawIcon;
    drawIcon = function (g, it, S) { try { if (it && it.tab === 'heroes' && ART.has(it.id)) { const sk = SKINS.find(s => s.id === it.id) || { id: it.id }; if (bust(g, sk, S)) return; try { g.canvas.dataset.art120 = it.id; } catch (e) { } } } catch (e) { } return di0.apply(this, arguments); };
  }
  // the Arsenal stage: the full painted figure stands on the lit stage instead of the little drawn hero
  if (typeof Preview !== 'undefined' && Preview.hero) {
    const ph0 = Preview.hero.bind(Preview);
    Preview.hero = function (x, y) {
      try { const s = this.sel; if (s && s.tab === 'heroes') { const i = get(s.id); if (i) { const H = 158, W = H * i.naturalWidth / i.naturalHeight, bob = Math.sin((this.t || 0) * 2) * 1.5; cx.save(); cx.shadowColor = 'rgba(0,0,0,.6)'; cx.shadowBlur = 12; cx.drawImage(i, this.W / 2 - W / 2, 166 - H + bob, W, H); cx.restore(); return; } } } catch (e) { }
      return ph0.apply(this, arguments);
    };
  }
  window.SkinArt120 = { has: id => ART.has(id), get };
})();
