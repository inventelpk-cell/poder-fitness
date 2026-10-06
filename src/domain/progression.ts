import { e1rm } from './e1rm'
import { formatWeight } from './units'
import type { ExerciseMemory, Unit } from './types'

export interface WorkingPoint {
  weightKg: number
  reps: number
}

export interface MemoryApplyResult {
  memory: ExerciseMemory
  loadRecord: boolean
  repRecord: boolean
  progressed: boolean
  sessionE1rm: number | null
  note: string | null
}

function sameWeight(sets: WorkingPoint[]): boolean {
  const first = sets[0]?.weightKg ?? 0
  return sets.every((set) => Math.abs(set.weightKg - first) < 0.001)
}

function weightKey(weightKg: number): string {
  return weightKg.toFixed(2)
}

export function applyWorkingSets(
  prev: ExerciseMemory | undefined,
  input: {
    exerciseId: string
    nombre: string
    working: WorkingPoint[]
    minReps: number
    maxReps: number
    plannedSets: number
    incrementKg: number
    deload: boolean
    plank: boolean
    unit: Unit
  },
): MemoryApplyResult {
  const base: ExerciseMemory = prev ?? {
    exerciseId: input.exerciseId,
    lastWorkingSets: [],
    nextWeightKg: null,
    nextReps: null,
    bestE1rmKg: null,
    bestReps: [],
  }
  if (input.working.length === 0) {
    return { memory: base, loadRecord: false, repRecord: false, progressed: false, sessionE1rm: null, note: null }
  }

  let sessionBest = 0
  for (const set of input.working) {
    const value = e1rm(set.weightKg, set.reps)
    if (value != null && value > sessionBest) sessionBest = value
  }
  const sessionE1rm = sessionBest > 0 ? Math.round(sessionBest * 10) / 10 : null
  const loadRecord = base.bestE1rmKg != null && sessionBest > base.bestE1rmKg + 1e-9
  let repRecord = false
  if (!loadRecord && base.bestReps.length > 0) {
    repRecord = input.working.some((set) => {
      const hist = base.bestReps.find((item) => Math.abs(item.weightKg - set.weightKg) <= 0.01)
      return Boolean(hist && set.reps > hist.reps)
    })
  }

  const bestReps = [...base.bestReps]
  for (const set of input.working) {
    const index = bestReps.findIndex((item) => weightKey(item.weightKg) === weightKey(set.weightKg))
    if (index === -1) bestReps.push({ weightKg: set.weightKg, reps: set.reps })
    else if (set.reps > bestReps[index].reps) bestReps[index] = { weightKg: set.weightKg, reps: set.reps }
  }

  const next: ExerciseMemory = {
    ...base,
    lastWorkingSets: input.working.map((set) => ({ weightKg: set.weightKg, reps: set.reps })),
    bestE1rmKg: sessionBest > 0 ? Math.max(base.bestE1rmKg ?? 0, sessionBest) : base.bestE1rmKg,
    bestReps,
  }

  let progressed = false
  let note: string | null = null
  if (!input.deload) {
    if (input.plank) {
      const objective = base.nextReps ?? input.minReps
      const allHit = input.working.length >= input.plannedSets && input.working.every((set) => set.reps >= objective)
      if (allHit && objective >= 45) next.nextReps = 45
      else if (allHit && objective < 45) {
        next.nextReps = Math.min(45, objective + 5)
        progressed = next.nextReps !== objective
      } else {
        next.nextReps = Math.min(45, input.working[input.working.length - 1]?.reps ?? objective)
      }
      if (progressed && next.nextReps != null) note = `La próxima, ${next.nextReps} s`
    } else {
      const allTop = input.working.length >= input.plannedSets
        && input.working.every((set) => set.reps >= input.maxReps)
        && sameWeight(input.working)
      const last = input.working[input.working.length - 1]
      if (allTop && last) {
        next.nextWeightKg = Math.round((last.weightKg + input.incrementKg) * 1000) / 1000
        next.nextReps = input.minReps
        progressed = true
        note = `La próxima, ${formatWeight(next.nextWeightKg, input.unit)} desde ${input.minReps} repeticiones`
      } else if (last) {
        next.nextWeightKg = last.weightKg
        next.nextReps = Math.min(last.reps, input.maxReps)
      }
    }
  }

  return { memory: next, loadRecord, repRecord, progressed, sessionE1rm, note }
}

export function formatLastTime(sets: { weightKg: number; reps: number }[] | undefined, unit: Unit, plank: boolean): string {
  if (!sets || sets.length === 0) return 'Todavía no hay una marca tuya'
  if (plank) return `La última: ${sets.map((set) => `${set.reps} s`).join(', ')}`
  const same = sets.every((set) => Math.abs(set.weightKg - sets[0].weightKg) < 0.01)
  if (same) return `La última: ${formatWeight(sets[0].weightKg, unit)} × ${sets.map((set) => set.reps).join(', ')}`
  return `La última: ${sets.map((set) => `${formatWeight(set.weightKg, unit)} × ${set.reps}`).join(', ')}`
}
