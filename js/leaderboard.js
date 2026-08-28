// Leaderboard: reads/writes the global Google Sheet backend when configured,
// otherwise falls back to a local (per-browser) leaderboard in localStorage.
// ---- Global leaderboard (Google Sheet via Google Apps Script) ----
// See README.md "Set up the global leaderboard" for the full setup steps.
// Paste your Web App URL below (looks like https://script.google.com/macros/s/XXXX/exec).
// Leave it as '' to keep using the local-only (per-browser) leaderboard instead.
const LEADERBOARD_API_URL = 'https://script.google.com/macros/s/AKfycbwUGT-b__AJsgvw-_jrPKSordEJ3AFwxcbn4L7Kjzxm28HjSew5RGj66OLCTogIpfgxOA/exec';

const LEADERBOARD_KEY = 'flappyGameLeaderboardV1';
const LEADERBOARD_MAX = 20;

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(list) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  } catch (e) {
    // Ignore if the browser blocks localStorage (e.g. strict private/incognito mode)
  }
}

// Fetches the global top scores from the Apps Script Web App.
// Returns null (instead of throwing) if not configured or unreachable, so callers can fall back.
async function fetchGlobalLeaderboard() {
  if (!LEADERBOARD_API_URL) return null;
  try {
    const res = await fetch(LEADERBOARD_API_URL + '?action=list');
    if (!res.ok) throw new Error('Bad response: ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (e) {
    console.warn('Could not reach the global leaderboard, falling back to local:', e);
    return null;
  }
}

// Submits one score to the Apps Script Web App.
// Uses 'text/plain' as the content type on purpose: it keeps this a "simple request"
// so the browser skips the CORS preflight, which Apps Script Web Apps don't handle well.
async function submitGlobalScore(name, scoreValue, charNum) {
  if (!LEADERBOARD_API_URL) return false;
  try {
    await fetch(LEADERBOARD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name: name, score: scoreValue, charNum: charNum })
    });
    return true;
  } catch (e) {
    console.warn('Could not submit the score to the global leaderboard:', e);
    return false;
  }
}

// Saves a finished run's score. Tries the global leaderboard first (if configured);
// falls back to the local per-browser leaderboard if that fails or isn't set up.
async function addScoreToLeaderboard(name, scoreValue, charNum) {
  const sentToGlobal = await submitGlobalScore(name, scoreValue, charNum);
  if (!sentToGlobal) {
    const list = loadLeaderboard();
    list.push({ name: name || 'Anonymous', score: scoreValue, charNum: charNum, date: Date.now() });
    list.sort((a, b) => b.score - a.score);
    saveLeaderboard(list.slice(0, LEADERBOARD_MAX));
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function renderLeaderboard() {
  leaderboardListEl.innerHTML = '<li class="empty">Loading...</li>';

  let list = null;
  if (LEADERBOARD_API_URL) {
    list = await fetchGlobalLeaderboard();
  }
  if (list === null) {
    list = loadLeaderboard();
  }

  leaderboardListEl.innerHTML = '';
  if (list.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No scores yet. Be the first!';
    leaderboardListEl.appendChild(li);
    return;
  }
  list.forEach((entry, idx) => {
    const li = document.createElement('li');
    const charLabel = entry.charNum === 2 ? 'Scotti' : 'Keng';
    li.innerHTML =
      '<span class="rank">#' + (idx + 1) + '</span>' +
      '<span class="name">' + escapeHtml(entry.name) + '</span>' +
      '<span class="char-badge">' + charLabel + '</span>' +
      '<span class="pts">' + entry.score + '</span>';
    leaderboardListEl.appendChild(li);
  });
}

function openLeaderboard() {
  renderLeaderboard();
  leaderboardOverlay.classList.remove('hidden');
}

function closeLeaderboard() {
  leaderboardOverlay.classList.add('hidden');
}

leaderboardBtn.addEventListener('click', openLeaderboard);
openLeaderboardFromSetupBtn.addEventListener('click', openLeaderboard);
closeLeaderboardBtn.addEventListener('click', closeLeaderboard);
leaderboardOverlay.addEventListener('click', (e) => {
  if (e.target === leaderboardOverlay) closeLeaderboard();
});

