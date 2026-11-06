"""Runtime part: page text, aria labels, placeholders and data-table text from the built game.
Writes all.json = static literals + these, minus things that are clearly not text."""
import json
from playwright.sync_api import sync_playwright
TABLES = 'ACHS AFF_TXT BOSS_INFO BOUNTY_TYPES CHAPTERS CHARS CLUB_TABS CODEX_B CODEX_E COMICS COMMS CONTRACTS CREDITS_ROLL DAILY_MODS DIFFS DOJO_DRILLS EDEF HERO_BURST HM_PERKS MASTERY_PERKS MINI_BOSSES MISSIONS MODES NEWS PERKS PH_FILTERS RANKS RARITY ROUTES RSHOP SEASONS SHOP_TABS SIGS SKILLS SKILL_EVO SKINS BLADE_FX STAGES STY SYNERGIES TALENTS THEMES TITLES FRAMES TRACKS TUTS UPGRADES WEAPONS WEEKLY_RULES ZAN_TXT PZ_PACKS CALL VOX LIVE_TOPICS DOJO_DRILLS GATES INTRO_LINES LOGIN_CR'.split()
JS = r'''(names) => {
  const out = new Set(), seen = new Set();
  const ok = s => typeof s === 'string' && /[A-Za-z]{2,}/.test(s) && !/^#|^rgba?\(|^hsl|px |^[a-z0-9_.-]+$|^[a-z]+[A-Z]|^https?:/.test(s) && s.length < 400;
  const walk = (v, d) => { if (d > 6 || v == null) return; if (typeof v === 'string') { if (ok(v)) out.add(v); return; }
    if (typeof v !== 'object' || seen.has(v)) return; seen.add(v); if (Array.isArray(v)) { for (const x of v) walk(x, d + 1); return; }
    for (const k in v) { if (k === 'he' || k === 'id' || k === 'body' || k === 'theme' || k === 'c' || k === 'col') continue; walk(v[k], d + 1); } };
  for (const n of names) { let t; try { t = eval(n); } catch (e) { continue; } walk(t, 0); }
  const page = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let x;
  while ((x = w.nextNode())) { const s = x.nodeValue.trim(); if (s && /[A-Za-z]{2,}/.test(s) && !(x.parentElement && x.parentElement.closest('script,style,.logo'))) page.add(s); }
  document.querySelectorAll('[aria-label]').forEach(e => page.add(e.dataset.al || e.getAttribute('aria-label')));
  document.querySelectorAll('[placeholder]').forEach(e => page.add(e.dataset.ph || e.getAttribute('placeholder')));
  return { tables: [...out], page: [...page] };
}'''
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto('file:///home/claude/od/test/game.html'); pg.wait_for_timeout(1200)
    r = pg.evaluate(JS, TABLES)
    he = pg.evaluate("Object.keys(HE)")
    b.close()
st = json.load(open('/home/claude/od/i18n/static.json'))
json.dump({'static': st, 'tables': r['tables'], 'page': r['page'], 'he': he}, open('/home/claude/od/i18n/raw.json', 'w'), ensure_ascii=False)
H = set(he)
for k in ('static', 'tables', 'page'):
    src = st if k == 'static' else r[k]
    miss = [s for s in src if s not in H]
    print(k, len(src), 'missing in HE:', len(miss))
