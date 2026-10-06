import { catalogEquipToProfile } from '../domain/labels'
import type { EquipId, LibraryExercise, SessionExercise, WorkoutSet } from '../domain/types'

function uid(): string {
  return crypto.randomUUID()
}

function workSet(logging: SessionExercise['logging'], reps: number, weightKg: number | null): WorkoutSet {
  if (logging === 'tiempo') {
    return { id: uid(), kind: 'trabajo', weightKg: null, reps: null, seconds: reps, km: null, done: false }
  }
  if (logging === 'distancia') {
    return { id: uid(), kind: 'trabajo', weightKg: null, reps: null, seconds: null, km: null, done: false }
  }
  return { id: uid(), kind: 'trabajo', weightKg, reps, seconds: null, km: null, done: false }
}

export function profileEquip(exercise: LibraryExercise): EquipId[] {
  return exercise.pool?.equipo ?? catalogEquipToProfile(exercise.equipo)
}

export function blockFromLibrary(exercise: LibraryExercise): SessionExercise {
  const logging = exercise.logging
  const reps = logging === 'tiempo' ? 20 : 8
  const sets = Array.from({ length: 3 }, () => workSet(logging, reps, null))
  return {
    id: uid(),
    exerciseId: exercise.id,
    nombre: exercise.nombre,
    logging,
    compound: exercise.compound,
    equipo: profileEquip(exercise),
    catalogEquip: exercise.equipo,
    muscleGroup: exercise.muscleGroup,
    musculosPrimarios: exercise.musculosPrimarios,
    role: null,
    setsPlanned: 3,
    minReps: logging === 'tiempo' ? 20 : 8,
    maxReps: logging === 'tiempo' ? 45 : 12,
    restSec: 90,
    incrementKg: exercise.compound ? 2.5 : 1.25,
    skipped: false,
    substituted: false,
    note: '',
    sets,
    groupId: null,
  }
}

export function inheritedBlock(previous: SessionExercise, exercise: LibraryExercise): SessionExercise {
  const count = Math.max(1, previous.setsPlanned)
  const seed = previous.logging === 'tiempo' ? previous.minReps : previous.minReps
  const sets = Array.from({ length: count }, () => workSet(exercise.logging, seed, null))
  return {
    ...blockFromLibrary(exercise),
    sets,
    setsPlanned: previous.setsPlanned,
    minReps: previous.minReps,
    maxReps: previous.maxReps,
    restSec: previous.restSec,
    incrementKg: previous.incrementKg,
    substituted: true,
    role: previous.role,
  }
}
