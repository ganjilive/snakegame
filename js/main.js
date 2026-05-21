import {
  createGame,
  resetGame,
  startGame,
  setDirection,
  tick,
  updateAnimations,
} from './game.js';
import { createRenderer, render } from './renderer.js';
import { getHighScore, saveHighScore } from './storage.js';
import {
  initAudio,
  startMusic,
  stopMusic,
  playEatSfx,
  playGameOverSfx,
  toggleMute,
  isMuted,
} from './audio.js';

const canvas = document.getElementById('game-canvas');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const scoreDisplay = document.getElementById('score-display');
const highScoreDisplay = document.getElementById('high-score-display');
const finalScoreDisplay = document.getElementById('final-score');
const newHighScoreEl = document.getElementById('new-high-score');
const muteBtn = document.getElementById('mute-btn');

const renderer = createRenderer(canvas);
const game = createGame();
let lastFrameTime = 0;
let musicPlaying = false;

const KEY_MAP = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT',
};

function updateHud() {
  scoreDisplay.textContent = `SCORE: ${game.score}`;
  highScoreDisplay.textContent = `HI: ${getHighScore()}`;
}

function updateMuteButton() {
  const muted = isMuted();
  muteBtn.textContent = muted ? 'SOUND OFF (M)' : 'SOUND ON (M)';
  muteBtn.classList.toggle('muted', muted);
  muteBtn.setAttribute('aria-pressed', String(muted));
  muteBtn.setAttribute('aria-label', muted ? 'Unmute sound (M)' : 'Mute sound (M)');
}

function handleMuteToggle() {
  const nowMuted = toggleMute();
  if (nowMuted) {
    musicPlaying = false;
  } else if (game.state === 'playing') {
    musicPlaying = true;
    startMusic();
  }
  updateMuteButton();
}

function showStartScreen() {
  startScreen.classList.remove('hidden');
  gameoverScreen.classList.add('hidden');
}

function showGameoverScreen(isNewHighScore) {
  gameoverScreen.classList.remove('hidden');
  finalScoreDisplay.textContent = `SCORE: ${game.score}`;
  newHighScoreEl.classList.toggle('hidden', !isNewHighScore);
}

function hideOverlays() {
  startScreen.classList.add('hidden');
  gameoverScreen.classList.add('hidden');
}

function beginGame() {
  initAudio();
  resetGame(game);
  startGame(game);
  hideOverlays();
  updateHud();
  if (!isMuted()) {
    musicPlaying = true;
    startMusic();
  }
}

function restartGame() {
  resetGame(game);
  startGame(game);
  hideOverlays();
  updateHud();
  if (!isMuted()) {
    musicPlaying = true;
    startMusic();
  } else {
    musicPlaying = false;
  }
}

function handleGameOver() {
  stopMusic();
  musicPlaying = false;
  playGameOverSfx();
  const isNewHighScore = saveHighScore(game.score);
  updateHud();
  showGameoverScreen(isNewHighScore);
}

function onKeyDown(e) {
  if (e.key === 'm' || e.key === 'M') {
    handleMuteToggle();
    return;
  }

  if (game.state === 'start') {
    beginGame();
    if (KEY_MAP[e.key]) {
      e.preventDefault();
      setDirection(game, KEY_MAP[e.key]);
    }
    return;
  }

  if (game.state === 'gameover') {
    if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
      restartGame();
    }
    return;
  }

  if (KEY_MAP[e.key]) {
    e.preventDefault();
    setDirection(game, KEY_MAP[e.key]);
  }
}

function gameLoop(timestamp) {
  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  updateAnimations(game, delta);

  if (game.state === 'playing') {
    if (timestamp - game.lastTick >= game.tickInterval) {
      game.lastTick = timestamp;
      const result = tick(game);
      if (result?.event === 'eat') {
        playEatSfx();
        updateHud();
      } else if (result?.event === 'gameover') {
        handleGameOver();
      }
    }
  }

  render(renderer, game);
  requestAnimationFrame(gameLoop);
}

updateHud();
updateMuteButton();
resetGame(game);
render(renderer, game);
window.addEventListener('keydown', onKeyDown);
muteBtn.addEventListener('click', handleMuteToggle);
requestAnimationFrame(gameLoop);
