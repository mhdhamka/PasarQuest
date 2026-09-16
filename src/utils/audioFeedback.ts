/**
 * Web Audio API synthesized sound feedback for Pasar Malam app actions.
 * Generates pure, lightweight browser-synthesized audio without external sound assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

const SOUND_PREF_KEY = 'cpm_audio_feedback_enabled';

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(SOUND_PREF_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * A crisp, light bell 'ding' for checking in.
 */
export function playCheckInDing(): void {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Primary bell tone (B5 ~ 987.77 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now);
    // Subtle initial bend down for a bell tap feel
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.28);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.14, now + 0.008);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Harmonic sparkle overtone (B6 ~ 1975.5 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.5, now);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.006);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.25);
  } catch (e) {
    console.debug('Audio playback error', e);
  }
}

/**
 * A sparkling, magical cascading chime for unlocking new badges.
 */
export function playBadgeChime(): void {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Magical ascending notes: E5 (659Hz), G#5 (830Hz), B5 (988Hz), E6 (1318Hz), G#6 (1661Hz)
    const notes = [659.25, 830.61, 987.77, 1318.51, 1661.22];
    const noteGap = 0.075;

    notes.forEach((freq, idx) => {
      const noteStart = now + idx * noteGap;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.5);
    });
  } catch (e) {
    console.debug('Badge chime playback error', e);
  }
}

/**
 * A triumphant, uplifting level-up sound for leveling up in the Pasar Dex.
 */
export function playLevelUpFanfare(): void {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Quick ascending fanfare: C5 (523Hz), G5 (784Hz), C6 (1046Hz), E6 (1318Hz)
    const arpeggio = [
      { freq: 523.25, time: 0.0, dur: 0.12 },
      { freq: 659.25, time: 0.08, dur: 0.12 },
      { freq: 783.99, time: 0.16, dur: 0.14 },
      { freq: 1046.5, time: 0.24, dur: 0.16 },
    ];

    arpeggio.forEach(({ freq, time, dur }) => {
      const noteStart = now + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.13, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + dur + 0.05);
    });

    // Sustained triumphant chord at the climax: C5 + G5 + C6
    const chordTime = now + 0.35;
    const chordNotes = [523.25, 659.25, 783.99, 1046.5];

    chordNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === 3 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, chordTime);

      gain.gain.setValueAtTime(0.001, chordTime);
      gain.gain.linearRampToValueAtTime(0.09, chordTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(chordTime);
      osc.stop(chordTime + 0.7);
    });
  } catch (e) {
    console.debug('Level-up fanfare playback error', e);
  }
}
