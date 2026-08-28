# Flappy Game

A fullscreen Flappy-Bird-style game with a name/character lobby and an
optional global (shared) leaderboard, backed by a Google Sheet.

## Project structure

```
flappy-game/
├── index.html            Markup only — no inline CSS/JS
├── css/
│   └── style.css         All styling
├── js/                    Loaded in this exact order (see index.html)
│   ├── dom.js             Cached references to DOM elements
│   ├── effects.js         Score pop animation, canvas resize, zoom lock
│   ├── audio.js           Web Audio sound effects (flap/score/game over)
│   ├── sprites.js         Image loading + auto-trim of blank sprite space
│   ├── config.js          Tunable constants (gravity, speed, sizes...)
│   ├── state.js           Mutable run-time game state
│   ├── leaderboard.js     Global (Sheet) + local (localStorage) leaderboard
│   ├── lobby.js           Name entry / character select / start screen
│   ├── game.js            Physics update, collisions, rendering, game loop
│   └── main.js            Wires up input controls, boots the game
├── assets/                Put your game art here (see below)
└── backend/
    └── Code.gs            Google Apps Script leaderboard API
```

### Why plain `<script src>` tags instead of a bundler?

The game is small enough that a build step (Webpack/Vite/etc.) would add
more complexity than it saves. Each file is a classic (non-module) script,
and browsers run all classic scripts on a page in one shared global scope —
so splitting the code into files changes nothing at runtime as long as the
`<script>` tags stay in the order shown in `index.html` (each file relies on
things declared by the files before it). This also means you can still just
double-click `index.html` and it works, no local server required.

If this project grows much further, the natural next step is to convert
these into ES modules (`import`/`export`) with a small bundler — worth doing
once you're adding features regularly, not before.

## 1. Add your art assets

Drop these five images into `assets/` (same filenames the code expects):

| File | Used for |
|---|---|
| `nhanvat.png` | Character 1 ("Keng") |
| `nhanvat2.png` | Character 2 ("Scotti") |
| `ongkhoi.png` | Pipes |
| `bg.png` | Background |
| `item.png` | Collectible item |
| `diem.png` | Score icon (top-left HUD) |

## 2. (Optional) Set up the global leaderboard

By default the game stores scores per-browser (`localStorage`), so each
player only sees their own history. To share one leaderboard across every
player, deploy the included Apps Script as a tiny free backend:

1. Go to https://sheets.google.com and create a new blank spreadsheet.
2. Rename the bottom tab to exactly `Leaderboard`.
3. In row 1, add these 4 headers, one per column: `Name | Score | Character | Date`.
4. In the menu, go to **Extensions > Apps Script**.
5. Delete the sample code there and paste in the contents of `backend/Code.gs`.
6. Click **Deploy > New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything, e.g. "Flappy leaderboard".
   - Execute as: **Me**.
   - Who has access: **Anyone**.
7. Click **Deploy**. The first time, Google will ask you to authorize the
   script — click through "Advanced" > "Go to (project name) (unsafe)" if
   it warns you (this is normal for your own scripts).
8. Copy the "Web app URL" it gives you — it looks like:
   `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec`
9. Paste that URL into `LEADERBOARD_API_URL` at the top of `js/leaderboard.js`.

Leave `LEADERBOARD_API_URL` empty (`''`) to keep the local-only leaderboard.

## 3. Run it

Just open `index.html` in a browser (double-click works), or host the
`flappy-game/` folder on any static host (GitHub Pages, Netlify, etc.).
