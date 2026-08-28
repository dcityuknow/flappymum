// Small visual effects + canvas sizing + zoom-lock (anti pinch/scroll-zoom).
// Glow + pop effect when scoring
let popTimeout = null;
function popScore() {
  scoreBox.classList.remove('pop');
  // force reflow so the animation can replay back-to-back
  void scoreBox.offsetWidth;
  scoreBox.classList.add('pop');
  if (popTimeout) clearTimeout(popTimeout);
  popTimeout = setTimeout(() => scoreBox.classList.remove('pop'), 280);
}

// ---- Fullscreen, auto-resizes with the window ----
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---- Lock zoom to avoid throwing off pipe spacing ----
// Block Ctrl + scroll wheel (common desktop zoom)
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// Block zoom shortcuts Ctrl/Cmd + '+' / '-' / '=' / '0'
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
    e.preventDefault();
  }
}, { passive: false });

// Block pinch-zoom / double-tap zoom on mobile (extra safeguard besides CSS touch-action)
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });
