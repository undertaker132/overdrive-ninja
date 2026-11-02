<div align="center">

<img src="icons/icon-192.png" width="120" alt="Overdrive: Cyber Slash">

# OVERDRIVE: CYBER SLASH

**משחק אקשן נינג'ה סייברפאנקי — לזנק, לחתוך ולהדוף על גגות ניאו־אדו.**
*A neon cyberpunk ninja action game — dash, slash and parry across the rooftops of Neo Edo.*

### [▶ לשחק עכשיו / Play now](https://undertaker132.github.io/overdrive-ninja/)

[⭐ לתת ביקורת / Leave a review](https://github.com/undertaker132/overdrive-ninja/issues/new?template=feedback.yml) ·
[🐞 לדווח על באג / Report a bug](https://github.com/undertaker132/overdrive-ninja/issues/new?template=bug.yml) ·
[💡 להציע רעיון / Suggest an idea](https://github.com/undertaker132/overdrive-ninja/issues/new?template=idea.yml)

<img src="docs/screenshots.jpg" alt="Screenshots" width="100%">

</div>

---

## 🇮🇱 עברית

### איך מתקינים את האפליקציה
המשחק עובד ישר מהדפדפן, וגם אפשר להתקין אותו כאפליקציה לכל דבר (אייקון במסך הבית, מסך מלא, עובד גם בלי אינטרנט):

| מכשיר | איך מתקינים |
|---|---|
| **אנדרואיד** (Chrome) | פותחים את [הקישור](https://undertaker132.github.io/overdrive-ninja/) ← לוחצים על **התקנת האפליקציה** במסך הפתיחה של המשחק, או בתפריט ⋮ ← **התקנת אפליקציה** / **הוספה למסך הבית** |
| **אייפון / אייפד** (Safari) | פותחים את הקישור ב-Safari ← כפתור השיתוף ⬆️ ← **הוספה למסך הבית** |
| **מחשב** (Chrome / Edge) | פותחים את הקישור ← אייקון ההתקנה בצד ימין של שורת הכתובת |

### מה יש במשחק
- **מצב סיפור** — 7 מערכות, יותר מ-70 שלבים, בוסים עם כניסות ונפילות משלהם, קומיקס בין הפרקים ו-New Game+.
- **ארקייד** — Maglev אינסופי, התקפת בוסים, מגדל רוגלייט, מרדף על אופנוע, אתגר יומי ושבועי, פאזלים ודוג'ו.
- **ארסנל** — עשרות להבים, גיבורים, סקינים לחרבות, חיות מחמד ועץ שדרוגים.
- **חברים** — משחק חי עם חברים, רוחות (ghosts) של שיאים, ריפליי וקליפים, צוותים ועורך שלבים.
- **דו־ממד או תלת־ממד**, תמיכה בשלט (Xbox / PlayStation / Switch), עברית, ערבית, רוסית ואנגלית.

### נתתם ביקורת? תודה! 🙏
המשחק בפיתוח, וכל משוב עוזר:
- **מתוך המשחק:** מסך הפתיחה ← **דיווח על בעיה** ← כותבים ← **פתיחה ב-GitHub**. נפתח דיווח מוכן עם פרטי המכשיר.
- **מכאן:** [ביקורת ומשוב](https://github.com/undertaker132/overdrive-ninja/issues/new?template=feedback.yml) · [באג](https://github.com/undertaker132/overdrive-ninja/issues/new?template=bug.yml) · [רעיון](https://github.com/undertaker132/overdrive-ninja/issues/new?template=idea.yml)

(צריך חשבון GitHub חינמי כדי לשלוח.)

---

## 🇬🇧 English

### Install it as an app
The game runs straight in the browser and can also be installed as a real app (home-screen icon, full screen, works offline):

| Device | How |
|---|---|
| **Android** (Chrome) | Open the [link](https://undertaker132.github.io/overdrive-ninja/) → tap **INSTALL APP** on the title screen, or ⋮ menu → **Install app** / **Add to Home screen** |
| **iPhone / iPad** (Safari) | Open the link in Safari → Share ⬆️ → **Add to Home Screen** |
| **Desktop** (Chrome / Edge) | Open the link → the install icon at the right of the address bar |

### What's inside
- **Story** — 7 acts, 70+ stages, bosses with their own entrances and falls, comics between chapters, New Game+.
- **Arcade** — endless Maglev Run, boss rush, a rogue-lite tower, a highway chase, daily and weekly challenges, puzzles and a training dojo.
- **Arsenal** — dozens of blades, heroes, blade skins, pets and an upgrade tree.
- **Social** — live play with friends, ghost runs, replays and clips, crews and a level editor.
- **2D or 3D** graphics, gamepad support, English, Hebrew, Arabic and Russian.

### Controls
| | Touch | Keyboard / mouse | Gamepad |
|---|---|---|---|
| Dash-slash | drag & release, or tap | drag & release with the mouse | left stick + A (hold LT for slow-motion aim) |
| Skills | buttons at the bottom | Q W E R | X · Y · B · LB |
| Overdrive | ⚡ button | Space | RB |
| Pause | ‖ button | Esc | START |

### Feedback
- **In the game:** title screen → **REPORT A PROBLEM** → write → **OPEN ON GITHUB**. A ready report with your device info opens.
- **Here:** [review](https://github.com/undertaker132/overdrive-ninja/issues/new?template=feedback.yml) · [bug](https://github.com/undertaker132/overdrive-ninja/issues/new?template=bug.yml) · [idea](https://github.com/undertaker132/overdrive-ninja/issues/new?template=idea.yml) (a free GitHub account is needed).

---

## For the developer

The whole game is one self-contained file, [`index.html`](index.html) (no build step, no dependencies). Around it:

| File | What it does |
|---|---|
| `manifest.webmanifest` | makes the page installable (name, icons, full screen) |
| `sw.js` | offline cache: network first for the game, cache for icons and fonts |
| `icons/` | app icons (`icon.svg` is the source) |
| `.github/ISSUE_TEMPLATE/` | the review, bug and idea forms |

**Publishing (one time):** repository **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
After a minute the game is live at `https://undertaker132.github.io/overdrive-ninja/`. Every push to `main` updates it.

**Run locally:** `python3 -m http.server` in this folder, then open <http://localhost:8000>. (Opening the file directly also works, without the offline cache.)

Saves stay on the player's device (local storage). Cloud saves, leaderboards and the creator dashboard only work in the claude.ai version of the game.
