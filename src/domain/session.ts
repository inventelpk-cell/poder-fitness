import { applyWorkingSets } from './progression'
import { sessionXp } from './xp'
import { resolveSessionDate } from './dates'
import { HERO_ABS, HERO_PUSHUPS, HERO_SQUATS } from './hero'
import type {
  ExerciseMemory,
  Goal,
  HeroQuota,
  Level,
  PlannedExercise,
  RoutineExercise,
  SessionExercise,
  Unit,
  VolumeSlice,
  WorkoutSession,
  WorkoutSet,
} from './types'

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

function workingSet(exercise: PlannedExercise, memory: ExerciseMemory | undefined): WorkoutSet {
  const weight = memory && memory.nextWeightKg != null ? memory.nextWeightKg : exercise.suggestedWeightKg
  const repsOrSeconds = memory?.nextReps ?? exercise.minReps
  if (exercise.logging === 'tiempo') {
    return { id: uid('set'), kind: 'trabajo', weightKg: null, reps: null, seconds: repsOrSeconds, km: null, done: false }
  }
  if (exercise.logging === 'distancia') {
    return { id: uid('set'), kind: 'trabajo', weightKg: null, reps: null, seconds: null, km: null, done: false }
  }
  return { id: uid('set'), kind: 'trabajo', weightKg: weight, reps: repsOrSeconds, seconds: null, km: null, done: false }
}

export function exerciseFromPlan(exercise: PlannedExercise, memory: ExerciseMemory | undefined): SessionExercise {
  const warmup: WorkoutSet[] = exercise.warmup.map((set) => ({
    id: uid('set'),
    kind: 'calentamiento',
    weightKg: set.weightKg,
    reps: exercise.logging === 'tiempo' ? null : set.reps,
    seconds: exercise.logging === 'tiempo' ? set.reps : null,
    km: null,
    done: false,
  }))
  const work = Array.from({ length: exercise.sets }, () => workingSet(exercise, memory))
  return {
    id: uid('blk'),
    exerciseId: exercise.exerciseId,
    nombre: exercise.nombre,
    logging: exercise.logging,
    compound: exercise.compound,
    equipo: exercise.equipo,
    catalogEquip: exercise.equipo.includes('cuerpo') ? 'peso-corporal' : exercise.equipo[0] ?? 'sin-especificar',
    muscleGroup: exercise.muscleGroup,
    musculosPrimarios: [],
    role: exercise.role,
    setsPlanned: exercise.sets,
    minReps: exercise.minReps,
    maxReps: exercise.maxReps,
    restSec: exercise.restSec,
    incrementKg: exercise.incrementKg,
    skipped: false,
    substituted: false,
    note: '',
    sets: [...warmup, ...work],
    groupId: null,
  }
}

export function exerciseFromRoutine(exercise: RoutineExercise, memory: ExerciseMemory | undefined): SessionExercise {
  const planned: PlannedExercise = {
    exerciseId: exercise.exerciseId,
    nombre: exercise.nombre,
    role: 'core',
    sets: exercise.sets,
    minReps: exercise.minReps,
    maxReps: exercise.maxReps,
    restSec: exercise.restSec,
    incrementKg: exercise.compound ? 2.5 : 1.25,
    compound: exercise.compound,
    logging: exercise.logging,
    equipo: exercise.equipo,
    muscleGroup: exercise.muscleGroup,
    suggestedWeightKg: null,
    warmup: [],
    groupId: null,
  }
  const block = exerciseFromPlan(planned, memory)
  return {
    ...block,
    catalogEquip: exercise.catalogEquip,
    musculosPrimarios: exercise.musculosPrimarios,
    note: exercise.note,
    role: null,
  }
}

export function blankSession(input: {
  id: string
  origin: WorkoutSession['origin']
  plannedSessionId: string | null
  routineId: string | null
  goal: Goal
  level: Level
  deload: boolean
  weekIndex: number | null
  pattern: WorkoutSession['pattern']
  exercises: SessionExercise[]
  now: Date
}): WorkoutSession {
  return {
    id: input.id,
    origin: input.origin,
    plannedSessionId: input.plannedSessionId,
    routineId: input.routineId,
    status: 'en_curso',
    startedAt: input.now.toISOString(),
    endedAt: null,
    date: resolveSessionDate(input.now.toISOString(), input.now),
    goal: input.goal,
    level: input.level,
    deload: input.deload,
    weekIndex: input.weekIndex,
    pattern: input.pattern,
    exercises: input.exercises,
    xp: 0,
    xpBreakdown: null,
    records: [],
    volumeByGroup: [],
    exerciseE1rm: [],
    progressNotes: [],
  }
}

function doneNumber(value: number | null): number {
  return value ?? 0
}

export function heroRepsFromSession(session: WorkoutSession): HeroQuota {
  const totals = { pushups: 0, abs: 0, squats: 0, km: 0 }
  for (const exercise of session.exercises) {
    const reps = exercise.sets
      .filter((set) => set.done && set.kind === 'trabajo')
      .reduce((sum, set) => sum + doneNumber(set.reps), 0)
    if (HERO_PUSHUPS.includes(exercise.exerciseId)) totals.pushups += reps
    if (HERO_ABS.includes(exercise.exerciseId) && exercise.logging !== 'tiempo') totals.abs += reps
    if (HERO_SQUATS.includes(exercise.exerciseId)) totals.squats += reps
  }
  return totals
}

export function workingDoneCount(session: WorkoutSession): number {
  return session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.kind === 'trabajo' && set.done).length, 0)
}

export interface CloseComputation {
  session: WorkoutSession
  memory: ExerciseMemory[]
  heroReps: HeroQuota
}

export function closeSession(session: WorkoutSession, memory: ExerciseMemory[], unit: Unit, now: Date): CloseComputation {
  const memoryMap = new Map(memory.map((item) => [item.exerciseId, item]))
  const grouped = new Map<string, { nombre: string; points: { weightKg: number; reps: number }[]; sample: WorkoutSession['exercises'][number] }>()
  for (const exercise of session.exercises) {
    const points = exercise.sets
      .filter((set) => set.done && set.kind === 'trabajo')
      .map((set) => ({
        weightKg: doneNumber(set.weightKg),
        reps: exercise.logging === 'tiempo' ? doneNumber(set.seconds) : doneNumber(set.reps),
      }))
    const current = grouped.get(exercise.exerciseId)
    if (current) current.points.push(...points)
    else grouped.set(exercise.exerciseId, { nombre: exercise.nombre, points, sample: exercise })
  }

  const records: WorkoutSession['records'] = []
  const notes: WorkoutSession['progressNotes'] = []
  const e1rms: WorkoutSession['exerciseE1rm'] = []
  let recordXp = 0
  for (const [exerciseId, group] of grouped) {
    const result = applyWorkingSets(memoryMap.get(exerciseId), {
      exerciseId,
      nombre: group.nombre,
      working: group.points,
      minReps: group.sample.minReps,
      maxReps: group.sample.maxReps,
      plannedSets: group.sample.setsPlanned,
      incrementKg: group.sample.incrementKg,
      deload: session.deload,
      plank: group.sample.logging === 'tiempo' && exerciseId === 'Plank',
      unit,
    })
    memoryMap.set(exerciseId, result.memory)
    if (result.loadRecord) {
      records.push({ exerciseId, nombre: group.nombre, type: 'carga' })
      recordXp += 30
    } else if (result.repRecord) {
      records.push({ exerciseId, nombre: group.nombre, type: 'reps' })
      recordXp += 15
    }
    if (result.note) notes.push({ exerciseId, text: result.note })
    if (result.sessionE1rm != null) e1rms.push({ exerciseId, nombre: group.nombre, e1rmKg: result.sessionE1rm })
  }

  const breakdown = sessionXp({
    goal: session.goal,
    recordXp,
    exercises: session.exercises.map((exercise) => ({
      skipped: exercise.skipped,
      setsPlanned: exercise.setsPlanned,
      compound: exercise.compound,
      logging: exercise.logging,
      sets: exercise.sets.map((set) => ({
        kind: set.kind,
        done: set.done,
        weightKg: doneNumber(set.weightKg),
        reps: doneNumber(set.reps),
        seconds: doneNumber(set.seconds),
        km: doneNumber(set.km),
      })),
    })),
  })

  const volumeMap = new Map<string, number>()
  for (const exercise of session.exercises) {
    const volume = exercise.sets
      .filter((set) => set.done && set.kind === 'trabajo')
      .reduce((sum, set) => sum + doneNumber(set.weightKg) * doneNumber(set.reps), 0)
    volumeMap.set(exercise.muscleGroup, (volumeMap.get(exercise.muscleGroup) ?? 0) + volume)
  }
  const volumeByGroup: VolumeSlice[] = [...volumeMap.entries()]
    .filter(([, kg]) => kg > 0)
    .map(([group, kg]) => ({ group: group as VolumeSlice['group'], kg }))

  const closed: WorkoutSession = {
    ...session,
    status: 'completado',
    endedAt: now.toISOString(),
    date: session.startedAt ? resolveSessionDate(session.startedAt, now) : session.date,
    xp: breakdown.total,
    xpBreakdown: breakdown,
    records,
    volumeByGroup,
    exerciseE1rm: e1rms,
    progressNotes: notes,
  }
  return { session: closed, memory: [...memoryMap.values()], heroReps: heroRepsFromSession(closed) }
}
