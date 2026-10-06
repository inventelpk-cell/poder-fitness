import type { ThemeIntensity } from '../domain/model';

let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  const AudioCtx = window.AudioContext;
  ctx ??= new AudioCtx();
  if (ctx.state === 'suspended') void ctx.resume();
}

function tone(type: OscillatorType, freq: number, when: number, duration: number, gainValue: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue, when);
  gain.gain.setValueAtTime(0, when + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

export function playSetComplete(enabled: boolean): void {
  if (!ctx) return;
  const gain = enabled ? 0.08 : 0;
  const start = ctx.currentTime;
  tone('square', 880, start, 0.04, gain);
  tone('square', 1320, start + 0.09, 0.06, gain);
}

export function playTick(enabled: boolean, intensity: ThemeIntensity, reducedMotion: boolean): void {
  if (!ctx) return;
  const audible = enabled && intensity !== 'suave' && !reducedMotion;
  tone('sine', 660, ctx.currentTime, 0.03, audible ? 0.08 : 0);
}

export function playRestDone(enabled: boolean): void {
  if (!ctx) return;
  const gain = enabled ? 0.08 : 0;
  const start = ctx.currentTime;
  tone('sine', 523, start, 0.08, gain);
  tone('sine', 784, start + 0.08, 0.08, gain);
}
