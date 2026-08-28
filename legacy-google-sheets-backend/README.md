# (Legacy) Google Sheets + Apps Script backend

This was the original global-leaderboard backend, kept here for reference
only — the game now uses **Firebase Realtime Database** instead (see the
project root `README.md`).

Why it was replaced: Apps Script Web Apps are easy to misconfigure in ways
that fail silently from other browsers/accounts (wrong `/dev` vs `/exec`
URL, wrong "Who has access" setting, forgetting to redeploy after editing
the script) — the app looks like it works for the developer but silently
falls back to a per-browser local leaderboard for everyone else. Firebase's
SDK avoids that whole class of problem and adds free real-time updates.

`Code.gs` here still works exactly as documented if you'd rather use Google
Sheets as the storage (e.g. you want the data readable directly in a
spreadsheet). To use it instead of Firebase, revert `js/leaderboard.js` to
call this Apps Script's `doGet`/`doPost` endpoints via `fetch` (see the
project's git history / ask your assistant to regenerate that version).
