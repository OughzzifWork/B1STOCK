let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Plays industrial sound cues simulating warehouse PDA terminal chimes
 */
export function playSound(type: 'scan' | 'success' | 'warning' | 'error') {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'scan') {
      // Classic crisp barcode scanner high-beep (1600 Hz, 75ms)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);

      // Light haptic
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(30);
      }
    } else if (type === 'success') {
      // Harmonic validation confirmation chime (two rising notes)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1318.5, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);

      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([40, 30, 60]);
      }
    } else if (type === 'warning') {
      // Double beep for discrepancy (discrepancy detected)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(660, now + 0.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      gain2.gain.setValueAtTime(0.15, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.start(now);
      osc.stop(now + 0.08);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.18);

      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([60, 40, 60]);
      }
    } else if (type === 'error') {
      // Low buzz for article not found or invalid input
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);

      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(120);
      }
    }
  } catch {
    // AudioContext blocked or not supported
  }
}
