// Lobby / setup screen: name entry, character selection, start button.
function goToLobby() {
  closeLeaderboard();
  setupDone = false;
  gameState = 'ready';
  msgEl.style.display = 'none';
  playerTag.style.display = 'none';

  // Refill the current name and keep the character selection for a quick restart
  playerNameInput.value = playerName;
  charOptions.forEach((o) => {
    o.classList.toggle('selected', parseInt(o.dataset.char, 10) === selectedCharNum);
  });
  updateStartBtnState();

  setupOverlay.classList.remove('hidden');
}

lobbyBtn.addEventListener('click', goToLobby);
lobbyFromLeaderboardBtn.addEventListener('click', goToLobby);

// ---- Handle the setup screen: name entry + character selection ----
function updateStartBtnState() {
  const nameOk = playerNameInput.value.trim().length > 0;
  startBtn.disabled = !(nameOk && selectedCharNum);
}

playerNameInput.addEventListener('input', updateStartBtnState);

charOptions.forEach((opt) => {
  opt.addEventListener('click', () => {
    charOptions.forEach((o) => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedCharNum = parseInt(opt.dataset.char, 10);
    updateStartBtnState();
  });
});

startBtn.addEventListener('click', () => {
  if (startBtn.disabled) return;
  playerName = playerNameInput.value.trim().slice(0, 20) || 'Anonymous';

  // Assign the sprite of the chosen character (if the image hasn't loaded yet, loadCharacterSprite
  // will reassign it once loaded, thanks to the selectedCharNum check above)
  birdSprite = birdSpritesByChar[selectedCharNum];
  birdAspect = birdAspectsByChar[selectedCharNum] || birdAspect;

  // Show the player's name + character icon in the corner of the screen
  playerTagIcon.src = selectedCharNum === 2 ? 'nhanvat2.png' : 'nhanvat.png';
  playerTagName.textContent = playerName;
  playerTag.style.display = 'flex';

  setupOverlay.classList.add('hidden');
  setupDone = true;
  resetGame();
});

// Allow pressing Enter in the name field to start quickly (if requirements are met)
playerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !startBtn.disabled) {
    startBtn.click();
  }
});

function resetGame() {
  bird = {
    x: canvas.width * 0.2,
    y: canvas.height / 2,
    vy: 0
  };
  pipes = [];
  items = [];
  frame = 0;
  score = 0;
  gameState = 'ready';
  scoreAlreadySaved = false;
  scoreTextEl.textContent = '0';
  scoreBox.classList.remove('pop');
  msgEl.style.display = 'block';
  msgEl.textContent = 'Tap or press Space to start';
}
