const HIGH_SCORE_KEY = 'snakeHighScore';
const MUTE_KEY = 'snakeMuted';

export function getHighScore() {
  const value = localStorage.getItem(HIGH_SCORE_KEY);
  return value ? parseInt(value, 10) : 0;
}

export function saveHighScore(score) {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
    return true;
  }
  return false;
}

export function getMuted() {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function setMuted(muted) {
  localStorage.setItem(MUTE_KEY, String(muted));
}
