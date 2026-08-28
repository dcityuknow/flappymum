# Flappy Game

A fullscreen Flappy-Bird-style game with a name/character lobby and a
real-time global leaderboard, backed by Firebase Realtime Database.

## Project structure

```
flappy-game/
├── index.html            Markup only — no inline CSS/JS
├── css/
│   └── style.css         All styling
├── js/                    Loaded in this exact order (see index.html)
│   ├── firebase-config.js  Your Firebase project keys — fill this in
│   ├── dom.js              Cached references to DOM elements
│   ├── effects.js          Score pop animation, canvas resize, zoom lock
│   ├── audio.js            Web Audio sound effects (flap/score/game over)
│   ├── sprites.js          Image loading + auto-trim of blank sprite space
│   ├── config.js           Tunable constants (gravity, speed, sizes...)
│   ├── state.js            Mutable run-time game state
│   ├── leaderboard.js      Global (Firebase) + local (localStorage) leaderboard
│   ├── lobby.js            Name entry / character select / start screen
│   ├── game.js             Physics update, collisions, rendering, game loop
│   └── main.js             Wires up input controls, boots the game
├── assets/                 Put your game art here (see below)
└── legacy-google-sheets-backend/
    └── Code.gs             Old Apps Script backend — kept for reference only, not used
```

### Why plain `<script src>` tags instead of a bundler?

The game is small enough that a build step (Webpack/Vite/etc.) would add
more complexity than it saves. Each file is a classic (non-module) script,
and browsers run all classic scripts on a page in one shared global scope —
so splitting the code into files changes nothing at runtime as long as the
`<script>` tags stay in the order shown in `index.html` (each file relies on
things declared by the files before it). This also means you can still just
double-click `index.html` and it works, no local server required — except
for the Firebase leaderboard, which needs an actual `http(s)://` origin
(see the note in step 2 below).

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

## 2. Set up the global leaderboard (Firebase)

The leaderboard uses **Firebase Realtime Database**. It's free for a
hobby/friends-scale game and updates every open browser instantly when
someone sets a new score, with no server code of your own to deploy or
misconfigure.

1. Go to https://console.firebase.google.com, click **Add project**, and
   follow the prompts (Google Analytics is optional, you can skip it).
2. In the left sidebar, open **Build > Realtime Database > Create Database**.
   Pick any region, and start in **locked mode** (you'll set proper rules in
   step 4 below).
3. Still in the console, click the gear icon (top-left) > **Project settings**
   > scroll to **Your apps** > click the Web icon (`</>`) to register a new
   web app (no need to check "Firebase Hosting"). It will show you a
   `firebaseConfig` object — copy the values into `js/firebase-config.js`:

   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     databaseURL: "...",   // <- make sure this one is filled in too
     projectId: "...",
   };
   ```

4. Back in **Realtime Database > Rules**, replace the rules with the
   following (allows anyone to read/write, but validates the shape of each
   score entry so a broken client can't corrupt the data) and click
   **Publish**:

   ```json
   {
     "rules": {
       "leaderboard": {
         ".read": true,
         ".write": true,
         "$entryId": {
           ".validate": "newData.hasChildren(['name','score','charNum','date'])
             && newData.child('name').isString() && newData.child('name').val().length <= 20
             && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 9999
             && newData.child('charNum').isNumber() && (newData.child('charNum').val() == 1 || newData.child('charNum').val() == 2)
             && newData.child('date').isNumber()"
         }
       }
     }
   }
   ```

   This is a hobby-appropriate level of protection: it stops malformed data,
   not a determined cheater editing their own client to submit a fake (but
   validly-shaped) high score — there's no way to fully prevent that without
   a server that verifies gameplay, which is overkill for this kind of game.

5. **Host it somewhere with a real origin.** The Firebase SDK (and most
   browsers' security rules around it) don't work reliably from a bare
   `file://` path — serve the folder over `http(s)://`. Easiest options:
   a static host like GitHub Pages/Netlify, or for local testing,
   `npx serve .` (or any simple local web server) inside the `flappy-game/`
   folder.

If you leave `js/firebase-config.js` with its placeholder `apiKey`, the game
still works — it just falls back to a leaderboard stored per-browser
(`localStorage`), same as before.

## 3. Run it

Host the `flappy-game/` folder on any static host (GitHub Pages, Netlify,
etc.), or run a local static server from inside the folder, e.g.:

```
npx serve .
```

then open the URL it prints.
