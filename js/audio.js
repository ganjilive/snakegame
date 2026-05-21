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
  playScheduledTone(frequency, 0, duration, type, gainNode, volume);
}

function playScheduledTone(
  frequency,
  startOffset,
  duration,
  type = 'square',
  gainNode = sfxGain,
  volume = 0.15,
) {
  if (!audioCtx || muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(gainNode);
  const start = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration);
}

function playScheduledSlide(
  startFreq,
  endFreq,
  startOffset,
  duration,
  type = 'square',
  gainNode = sfxGain,
  volume = 0.14,
) {
  if (!audioCtx || muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(gainNode);
  const start = audioCtx.currentTime + startOffset;
  osc.frequency.setValueAtTime(startFreq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration);
}

const MARIO_DEATH = [
  { freq: 659, duration: 0.15 },
  { freq: 523, duration: 0.15 },
  { freq: 392, duration: 0.15 },
  { freq: 330, duration: 0.15 },
  { freq: 392, duration: 0.12 },
  { freq: 330, duration: 0.12 },
  { freq: 262, duration: 0.12 },
  { freq: 196, endFreq: 130, duration: 0.4, slide: true },
  { freq: 131, endFreq: 65, duration: 0.6, slide: true },
];

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

export function playEvilDieSfx() {
  ensureContext();
  playTone(220, 0.1, 'sawtooth', sfxGain, 0.1);
  setTimeout(() => playTone(110, 0.15, 'sawtooth', sfxGain, 0.08), 80);
}

export function playHeartSfx() {
  ensureContext();
  playTone(523, 0.08, 'square', sfxGain, 0.1);
  setTimeout(() => playTone(784, 0.1, 'square', sfxGain, 0.12), 70);
}

export function playMushroomSfx() {
  ensureContext();
  playTone(330, 0.1, 'triangle', sfxGain, 0.1);
  setTimeout(() => playTone(220, 0.12, 'triangle', sfxGain, 0.08), 80);
}

export function playLoseLifeSfx() {
  ensureContext();
  playTone(196, 0.12, 'square', sfxGain, 0.1);
  setTimeout(() => playTone(147, 0.15, 'square', sfxGain, 0.08), 90);
}

export function playGameOverSfx() {
  ensureContext();
  let offset = 0;
  const volume = 0.14;
  for (const note of MARIO_DEATH) {
    if (note.slide) {
      playScheduledSlide(note.freq, note.endFreq, offset, note.duration, 'square', sfxGain, volume);
      playScheduledSlide(
        note.freq / 2,
        note.endFreq / 2,
        offset,
        note.duration,
        'triangle',
        sfxGain,
        0.06,
      );
    } else {
      playScheduledTone(note.freq, offset, note.duration, 'square', sfxGain, volume);
      playScheduledTone(note.freq / 2, offset, note.duration, 'triangle', sfxGain, 0.06);
    }
    offset += note.duration;
  }
}

export function toggleMute() {
  ensureContext();
  muted = !muted;
  setMuted(muted);
  applyMute();
  if (muted) {
    stopMusic();
  }
  return muted;
}

export function isMuted() {
  return muted;
}

export function resumeMusicIfPlaying(wasPlaying) {
  if (!muted && wasPlaying) startMusic();
}
