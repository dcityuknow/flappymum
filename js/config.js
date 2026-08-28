// Tunable game constants + size helpers (all sized relative to the canvas
// so the game stays fullscreen on any device).
// ---- Game config (sized as % of screen so it stays fullscreen) ----
const GRAVITY = 0.45;
const FLAP = -8;
const PIPE_SPEED = 5.5;
const PIPE_INTERVAL = 85; // frames between pipe columns

// Character size is noticeably bigger than before, based on screen height
function getBirdH() { return Math.max(60, canvas.height * 0.19); }
function getBirdW() { return getBirdH() * birdAspect; }
function getPipeW() { return Math.max(70, canvas.width * 0.13); }
function getPipeGap() { return Math.max(180, canvas.height * 0.35); }
function getItemH() { return Math.max(40, canvas.height * 0.07); }
function getItemW() { return getItemH() * itemAspect; }

// Hitbox is much smaller than the artwork for fairer, nicer-feeling collisions
// (shrunk a lot because some browsers block reading image pixels when opened via file://,
// which can prevent the auto-trim step above from running)
const HITBOX_SHRINK = 0.88;

