// Mutable run-time state for the current game session.
let bird, pipes, items, frame, score, gameState; // gameState: 'ready' | 'playing' | 'over'
let setupDone = false; // only true after the player enters a name + picks a character + clicks Start
let playerName = '';
let scoreAlreadySaved = false; // avoid saving the score more than once per run if endGame() is called again
