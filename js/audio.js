import { getMuted, setMuted } from './storage.js';

let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let musicInterval = null;
let musicStep = 0;
let muted = getMuted();

const MELODY = [
  262, 294, 330, 349, 392, 349, 330, 294,
  262, 330, 392, 523, 392, 330, 294, 262,
];

const BASS = [
  131, 131, 165, 165, 196, 196, 165, 131,
  131, 165, 196, 262, 196, 165, 131, 131,
];

function ensureContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    sfxGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    applyMute();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function applyMute() {
  if (!masterGain) return;
  masterGain.gain.value = muted ? 0 : 0.4;
}

function playTone(frequency, duration, type = 'square', gainNode = sfxGain, volume = 0.15) {
  if (!audioCtx || muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(gainNode);
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

function playMusicStep() {
  if (!audioCtx || muted) return;
  const note = MELODY[musicStep % MELODY.length];
  const bass = BASS[musicStep % BASS.length];
  playTone(note, 0.12, 'square', musicGain, 0.06);
  playTone(bass, 0.18, 'triangle', musicGain, 0.08);
  musicStep++;
}

export function initAudio() {
  ensureContext();
}

export function startMusic() {
  ensureContext();
  if (musicInterval) return;
  musicStep = 0;
  playMusicStep();
  musicInterval = setInterval(playMusicStep, 200);
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

export function playEatSfx() {
  ensureContext();
  playTone(523, 0.08, 'square', sfxGain, 0.12);
  setTimeout(() => playTone(784, 0.1, 'square', sfxGain, 0.1), 60);
}

export function playGameOverSfx() {
  ensureContext();
  const notes = [392, 330, 262, 196];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sawtooth', sfxGain, 0.12), i * 150);
  });
}

export function toggleMute() {
  ensureContext();
  muted = !muted;
  setMuted(muted);
  applyMute();
  if (muted) {
    stopMusic();
  } else if (musicInterval === null) {
    startMusic();
  }
  return muted;
}

export function isMuted() {
  return muted;
}

export function resumeMusicIfPlaying(wasPlaying) {
  if (!muted && wasPlaying) startMusic();
}
