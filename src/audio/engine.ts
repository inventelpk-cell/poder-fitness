let context: AudioContext | null = null

export async function unlockAudio(): Promise<void> {
  const Ctx = window.AudioContext
  if (!context) context = new Ctx()
  if (context.state === 'suspended') await context.resume()
}

function tone(frequency: number, durationMs: number, type: OscillatorType, volume: number, delaySec = 0) {
  if (!context || volume <= 0) return
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume / 100, context.currentTime + delaySec)
  osc.connect(gain)
  gain.connect(context.destination)
  const start = context.currentTime + delaySec
  osc.start(start)
  osc.stop(start + durationMs / 1000)
}

export function playBeep(volume: number) {
  tone(880, 40, 'sine', volume)
}

export function playEnd(volume: number) {
  tone(523, 90, 'sine', volume)
  tone(784, 90, 'sine', volume, 0.1)
}

export function playRecord(volume: number) {
  tone(660, 120, 'square', volume)
}

export function audioAlive(): boolean {
  return context != null && context.state === 'running'
}
