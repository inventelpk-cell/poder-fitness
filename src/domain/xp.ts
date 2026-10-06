import type { Goal, SetKind, XpBreakdown } from './types'

const BASE: Record<Goal, number> = {
  fuerza: 14,
  hipertrofia: 12,
  resistencia: 10,
  perdida_grasa: 11,
}

export function xpParaSubir(nivel: number): number {
  return Math.round(100 * Math.pow(nivel, 1.25))
}

export function levelFromTotal(totalXp: number): { level: number; xpInLevel: number; xpToNext: number } {
  let level = 1
  let rest = Math.max(0, totalXp)
  while (level < 400) {
    const need = xpParaSubir(level)
    if (rest < need) return { level, xpInLevel: rest, xpToNext: need }
    rest -= need
    level += 1
  }
  return { level, xpInLevel: rest, xpToNext: xpParaSubir(level) }
}

export function applyXpDelta(
  prev: { total: number; level: number },
  delta: number,
): { total: number; level: number; xpInLevel: number; xpToNext: number } {
  if (delta >= 0) {
    const total = prev.total + delta
    const next = levelFromTotal(total)
    return { total, ...next }
  }
  const total = Math.max(0, prev.total + delta)
  const computed = levelFromTotal(total)
  if (computed.level < prev.level) {
    return { total, level: prev.level, xpInLevel: 0, xpToNext: xpParaSubir(prev.level) }
  }
  return { total, ...computed }
}

export function setXp(input: {
  goal: Goal
  compound: boolean
  weightKg: number
  reps: number
  done: boolean
  kind: SetKind
  logging: 'reps_peso' | 'reps' | 'tiempo' | 'distancia'
  seconds: number
  km: number
}): { series: number; volumen: number } {
  if (!input.done || input.kind !== 'trabajo') return { series: 0, volumen: 0 }
  if (input.logging === 'tiempo') {
    if (input.seconds < 1) return { series: 0, volumen: 0 }
    return { series: BASE[input.goal] + (input.compound ? 4 : 0), volumen: 0 }
  }
  if (input.logging === 'distancia') {
    if (!(input.km > 0)) return { series: 0, volumen: 0 }
    return { series: BASE[input.goal] + (input.compound ? 4 : 0), volumen: 0 }
  }
  if (input.reps < 1) return { series: 0, volumen: 0 }
  const volumen = Math.min(20, Math.floor((input.weightKg * input.reps) / 100))
  return { series: BASE[input.goal] + (input.compound ? 4 : 0), volumen }
}

export function sessionXp(input: {
  goal: Goal
  exercises: {
    skipped: boolean
    setsPlanned: number
    compound: boolean
    logging: 'reps_peso' | 'reps' | 'tiempo' | 'distancia'
    sets: {
      kind: SetKind
      done: boolean
      weightKg: number
      reps: number
      seconds: number
      km: number
    }[]
  }[]
  recordXp: number
}): XpBreakdown {
  let series = 0
  let volumen = 0
  for (const exercise of input.exercises) {
    for (const set of exercise.sets) {
      const part = setXp({
        goal: input.goal,
        compound: exercise.compound,
        weightKg: set.weightKg,
        reps: set.reps,
        done: set.done,
        kind: set.kind,
        logging: exercise.logging,
        seconds: set.seconds,
        km: set.km,
      })
      series += part.series
      volumen += part.volumen
    }
  }
  const considered = input.exercises.filter((exercise) => !exercise.skipped)
  const ratio = considered.length === 0
    ? 0
    : considered.filter((exercise) => exercise.sets.filter((set) => set.kind === 'trabajo' && set.done).length >= exercise.setsPlanned).length / considered.length
  let sesion = 0
  if (ratio >= 0.7) sesion += 50
  if (ratio === 1) sesion += 20
  const raw = series + volumen + input.recordXp + sesion
  const total = Math.min(600, raw)
  if (raw <= 600) return { series, volumen, records: input.recordXp, sesion, total }
  const overflow = raw - 600
  let records = input.recordXp
  let sessionBonus = sesion
  let vol = volumen
  let ser = series
  let left = overflow
  const trim = (value: number) => {
    const cut = Math.min(value, left)
    left -= cut
    return value - cut
  }
  sessionBonus = trim(sessionBonus)
  records = trim(records)
  vol = trim(vol)
  ser = trim(ser)
  return { series: ser, volumen: vol, records, sesion: sessionBonus, total: 600 }
}
