// Cached references to every DOM element the game touches.
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBox = document.getElementById('scoreBox');
const scoreTextEl = document.getElementById('scoreText');
const msgEl = document.getElementById('msg');

// ---- Elements for setup (name + character select) and leaderboard ----
const playerTag = document.getElementById('playerTag');
const playerTagIcon = document.getElementById('playerTagIcon');
const playerTagName = document.getElementById('playerTagName');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const lobbyBtn = document.getElementById('lobbyBtn');
const lobbyFromLeaderboardBtn = document.getElementById('lobbyFromLeaderboardBtn');
const setupOverlay = document.getElementById('setupOverlay');
const playerNameInput = document.getElementById('playerNameInput');
const charOptions = document.querySelectorAll('.char-option');
const startBtn = document.getElementById('startBtn');
const openLeaderboardFromSetupBtn = document.getElementById('openLeaderboardFromSetupBtn');
const leaderboardOverlay = document.getElementById('leaderboardOverlay');
const leaderboardListEl = document.getElementById('leaderboardList');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
