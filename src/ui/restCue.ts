export function cuesForSecond(previous: number | null, seconds: number): string[] {
  if (previous == null) {
    const cues = ['Empieza el descanso']
    if (seconds <= 10 && seconds > 5) cues.push('Quedan 10 segundos')
    else if (seconds <= 5 && seconds > 0) cues.push('Quedan 5 segundos')
    else if (seconds <= 0) cues.push('Descanso terminado')
    return cues
  }
  const cues: string[] = []
  if (previous > 10 && seconds <= 10 && seconds > 5) cues.push('Quedan 10 segundos')
  if (previous > 5 && seconds <= 5 && seconds > 0) cues.push('Quedan 5 segundos')
  if (previous > 0 && seconds <= 0) cues.push('Descanso terminado')
  return cues
}

export function cuesAcross(samples: number[]): string[] {
  const heard: string[] = []
  let previous: number | null = null
  for (const seconds of samples) {
    for (const cue of cuesForSecond(previous, seconds)) {
      if (!heard.includes(cue)) heard.push(cue)
    }
    previous = seconds
  }
  return heard
}
