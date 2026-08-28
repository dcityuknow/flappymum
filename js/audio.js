// Sound effects generated with the Web Audio API (no audio files needed).
// ---- Sound (generated with the Web Audio API, no external audio files needed) ----
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type, startTime, volume) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
    // Some browsers block audio before user interaction - safely ignore
  }
}

function playFlapSound() {
  playTone(500, 0.08, 'square', 0, 0.24);
  playTone(750, 0.06, 'square', 0.03, 0.16);
}

function playScoreSound() {
  playTone(880, 0.1, 'sine', 0, 0.36);
  playTone(1320, 0.15, 'sine', 0.08, 0.36);
}

function playGameOverSound() {
  playTone(300, 0.25, 'sawtooth', 0, 0.24);
  playTone(150, 0.35, 'sawtooth', 0.15, 0.24);
}
