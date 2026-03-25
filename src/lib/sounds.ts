const SOUND_BASE = 'https://5e.tools/audio';

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function createBeep(freq: number, duration: number): () => void {
  return () => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore AudioContext errors (e.g. no audio device)
    }
  };
}

const UI_SOUNDS = {
  guess: createBeep(440, 0.1),
  correct: createBeep(880, 0.3),
  wrong: createBeep(220, 0.15),
};

export function playMonsterSound(soundPath?: string): void {
  if (!soundEnabled || !soundPath) return;
  try {
    const url = `${SOUND_BASE}/${soundPath}`;
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {
    // Ignore playback errors
  }
}

export function playUISound(type: 'guess' | 'correct' | 'wrong'): void {
  UI_SOUNDS[type]();
}
