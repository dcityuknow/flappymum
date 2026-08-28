// Core game loop: physics update, collisions, and rendering.
function flap() {
  if (!setupDone) return; // no name / character chosen yet, so no playing
  if (gameState === 'ready') {
    gameState = 'playing';
    msgEl.style.display = 'none';
  }
  if (gameState === 'playing') {
    bird.vy = FLAP;
    playFlapSound();
  }
  if (gameState === 'over') {
    resetGame();
  }
}

function spawnPipe() {
  const gap = getPipeGap();
  const pipeW = getPipeW();
  const minTop = canvas.height * 0.08;
  const maxTop = canvas.height - gap - canvas.height * 0.08;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    gap: gap,
    w: pipeW // lock width in at spawn time so it doesn't change mid-flight on canvas resize
  });

  // Spawn an item right in the gap of this pipe pair so the player can fly through and collect it
  const itemW = getItemW();
  const itemH = getItemH();
  items.push({
    x: canvas.width + pipeW / 2,
    y: topHeight + gap / 2,
    w: itemW,
    h: itemH,
    collected: false
  });
}

function update() {
  if (gameState !== 'playing') return;

  frame++;

  const birdW = getBirdW();
  const birdH = getBirdH();

  // Bird falls under gravity
  bird.vy += GRAVITY;
  bird.y += bird.vy;

  // Spawn a new pipe
  if (frame % PIPE_INTERVAL === 0) {
    spawnPipe();
  }

  // Move pipes
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED;
  }

  // Remove pipes that are off-screen
  pipes = pipes.filter(p => p.x + p.w > 0);

  // Move items + check for collection
  const birdHalfW_forItem = (birdW * HITBOX_SHRINK) / 2;
  const birdHalfH_forItem = (birdH * HITBOX_SHRINK) / 2;
  for (const item of items) {
    item.x -= PIPE_SPEED;

    if (!item.collected) {
      const dx = Math.abs(item.x - bird.x);
      const dy = Math.abs(item.y - bird.y);
      const overlapX = dx < (birdHalfW_forItem + item.w / 2);
      const overlapY = dy < (birdHalfH_forItem + item.h / 2);
      if (overlapX && overlapY) {
        item.collected = true;
        score++;
        scoreTextEl.textContent = score;
        popScore();
        playScoreSound();
      }
    }
  }
  items = items.filter(it => !it.collected && it.x + it.w > 0);

  // Collision with ceiling / floor (uses shrunk hitbox for fairness)
  const birdHalfH = (birdH * HITBOX_SHRINK) / 2;
  if (bird.y + birdHalfH > canvas.height || bird.y - birdHalfH < 0) {
    endGame();
    return;
  }

  // Collision with pipes (shrunk hitbox matches the trimmed artwork)
  const birdHalfW = (birdW * HITBOX_SHRINK) / 2;
  for (const pipe of pipes) {
    const birdLeft = bird.x - birdHalfW;
    const birdRight = bird.x + birdHalfW;
    const birdTop = bird.y - birdHalfH;
    const birdBottom = bird.y + birdHalfH;

    const pipeMargin = pipe.w * (1 - HITBOX_SHRINK) / 2;
    const pipeLeft = pipe.x + pipeMargin;
    const pipeRight = pipe.x + pipe.w - pipeMargin;

    const overlapX = birdRight > pipeLeft && birdLeft < pipeRight;
    if (overlapX) {
      const hitTop = birdTop < pipe.topHeight;
      const hitBottom = birdBottom > pipe.topHeight + pipe.gap;
      if (hitTop || hitBottom) {
        endGame();
        return;
      }
    }
  }
}

function endGame() {
  gameState = 'over';
  playGameOverSound();

  // Save the score to the leaderboard (only once per run)
  if (!scoreAlreadySaved) {
    addScoreToLeaderboard(playerName, score, selectedCharNum);
    scoreAlreadySaved = true;
  }

  msgEl.style.display = 'block';
  msgEl.textContent = 'Game Over! Score: ' + score + '\nTap to play again';
}

function draw() {
  // Background
  if (bgLoaded) {
    // Draw the background image "cover"-style to fill the canvas (keeps ratio, no distortion)
    const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;
    let drawW, drawH, offsetX, offsetY;
    if (canvasRatio > imgRatio) {
      drawW = canvas.width;
      drawH = canvas.width / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawH) / 2;
    } else {
      drawH = canvas.height;
      drawW = canvas.height * imgRatio;
      offsetX = (canvas.width - drawW) / 2;
      offsetY = 0;
    }
    ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);
  } else {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const birdW = getBirdW();
  const birdH = getBirdH();

  // Pipes
  for (const pipe of pipes) {
    // Top pipe (flipped)
    ctx.save();
    ctx.translate(pipe.x + pipe.w / 2, pipe.topHeight);
    ctx.scale(1, -1);
    if (pipeSprite) {
      ctx.drawImage(pipeSprite, -pipe.w / 2, 0, pipe.w, pipe.topHeight);
    } else {
      ctx.fillStyle = '#3cb043';
      ctx.fillRect(-pipe.w / 2, 0, pipe.w, pipe.topHeight);
    }
    ctx.restore();

    // Bottom pipe
    const bottomY = pipe.topHeight + pipe.gap;
    const bottomH = canvas.height - bottomY;
    if (pipeSprite) {
      ctx.drawImage(pipeSprite, pipe.x, bottomY, pipe.w, bottomH);
    } else {
      ctx.fillStyle = '#3cb043';
      ctx.fillRect(pipe.x, bottomY, pipe.w, bottomH);
    }
  }

  // Collectible item
  const bobY = Math.sin(frame * 0.12) * (getItemH() * 0.12); // gentle bob to stand out
  for (const item of items) {
    if (item.collected) continue;
    const iy = item.y + bobY;
    if (itemSprite) {
      ctx.drawImage(itemSprite, item.x - item.w / 2, iy - item.h / 2, item.w, item.h);
    } else {
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(item.x, iy, item.w / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Character
  ctx.save();
  ctx.translate(bird.x, bird.y);
  const angle = Math.max(-0.5, Math.min(0.9, bird.vy / 10));
  ctx.rotate(angle);
  if (birdSprite) {
    ctx.drawImage(birdSprite, -birdW / 2, -birdH / 2, birdW, birdH);
  } else {
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.ellipse(0, 0, birdW / 2, birdH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
