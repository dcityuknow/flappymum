// Entry point: wires up input controls and starts the game loop.
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ---- Controls ----
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  flap();
}, { passive: false });

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    // Allow typing a normal space while entering the player's name
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    flap();
  }
});

resetGame();
loop();
