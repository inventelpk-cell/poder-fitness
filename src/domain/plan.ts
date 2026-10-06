import { addDays, daysBetween, mondayOf, weekdayMon0 } from './dates'
import { arcName, equipmentCovered, weekLine } from './labels'
import { roundToIncrement } from './units'
import type {
  Arc,
  EquipId,
  ExerciseMemory,
  Goal,
  Level,
  Pattern,
  PlannedExercise,
  PlannedSession,
  PoolExercise,
  Profile,
  Role,
} from './types'

export const ROLE_ORDER: Record<Role, string[]> = {
  sentadilla: ['Barbell_Full_Squat', 'Goblet_Squat', 'Dumbbell_Squat', 'Leg_Press', 'Bodyweight_Squat'],
  bisagra: ['Barbell_Deadlift', 'Romanian_Deadlift', 'Stiff-Legged_Dumbbell_Deadlift', 'One-Arm_Kettlebell_Swings', 'Single_Leg_Glute_Bridge'],
  empuje_horizontal: ['Barbell_Bench_Press_-_Medium_Grip', 'Dumbbell_Bench_Press', 'Pushups', 'Decline_Push-Up', 'Incline_Push-Up'],
  tiron_horizontal: ['Bent_Over_Barbell_Row', 'Bent_Over_Two-Dumbbell_Row', 'Seated_Cable_Rows', 'Inverted_Row'],
  empuje_vertical: ['Standing_Military_Press', 'Dumbbell_Shoulder_Press', 'Seated_Dumbbell_Press'],
  tiron_vertical: ['Pullups', 'Chin-Up', 'Close-Grip_Front_Lat_Pulldown'],
  gluteo: ['Barbell_Hip_Thrust', 'Single_Leg_Glute_Bridge', 'Glute_Kickback'],
  unilateral: ['Dumbbell_Lunges', 'Bodyweight_Walking_Lunge', 'Leg_Extensions', 'Lying_Leg_Curls'],
  accesorio_empuje: ['Dumbbell_Flyes', 'Bench_Dips', 'Triceps_Pushdown', 'Push-Ups_-_Close_Triceps_Position', 'Dumbbell_One-Arm_Triceps_Extension'],
  accesorio_tiron: ['Face_Pull', 'Band_Pull_Apart', 'Hammer_Curls', 'Barbell_Curl'],
  hombro: ['Side_Lateral_Raise', 'Lateral_Raise_-_With_Bands'],
  pantorrilla: ['Rocking_Standing_Calf_Raise', 'Calf_Raise_On_A_Dumbbell', 'Seated_Calf_Raise', 'Calf_Raises_-_With_Bands'],
  core: ['Plank', 'Reverse_Crunch', 'Sit-Up', 'Cable_Crunch', 'Air_Bike'],
  finisher: ['Mountain_Climbers', 'Air_Bike'],
}

export const PATTERN_SLOTS: Record<Pattern, Role[]> = {
  cuerpo: ['sentadilla', 'empuje_horizontal', 'tiron_horizontal', 'bisagra', 'core', 'empuje_vertical', 'pantorrilla'],
  empuje: ['empuje_horizontal', 'empuje_vertical', 'empuje_horizontal', 'accesorio_empuje', 'hombro', 'core'],
  tiron: ['tiron_vertical', 'tiron_horizontal', 'tiron_horizontal', 'accesorio_tiron', 'core', 'pantorrilla'],
  pierna: ['sentadilla', 'bisagra', 'gluteo', 'unilateral', 'pantorrilla', 'core'],
  torso: ['empuje_horizontal', 'tiron_horizontal', 'empuje_vertical', 'tiron_vertical', 'accesorio_empuje', 'core'],
}

const FILLERS = ['Pushups', 'Bodyweight_Squat', 'Inverted_Row', 'Single_Leg_Glute_Bridge', 'Plank']

const HEAVY_ROLES = new Set<Role>([
  'sentadilla',
  'bisagra',
  'empuje_horizontal',
  'empuje_vertical',
  'tiron_horizontal',
  'tiron_vertical',
  'gluteo',
  'unilateral',
])

const INTENSITY: Record<Goal, number> = {
  fuerza: 0.8,
  hipertrofia: 0.7,
  resistencia: 0.6,
  perdida_grasa: 0.65,
}

const PRESCRIPTION: Record<Goal, { sets: number; minReps: number; maxReps: number; rest: number }> = {
  fuerza: { sets: 4, minReps: 4, maxReps: 6, rest: 180 },
  hipertrofia: { sets: 3, minReps: 8, maxReps: 12, rest: 120 },
  resistencia: { sets: 3, minReps: 12, maxReps: 15, rest: 60 },
  perdida_grasa: { sets: 3, minReps: 10, maxReps: 15, rest: 75 },
}

export function weekPatterns(level: Level, daysPerWeek: number): Pattern[] {
  const beginner = level === 'principiante'
  const table: Record<number, Pattern[]> = beginner
    ? {
        1: ['cuerpo'],
        2: ['cuerpo', 'cuerpo'],
        3: ['cuerpo', 'cuerpo', 'cuerpo'],
        4: ['torso', 'pierna', 'torso', 'pierna'],
        5: ['torso', 'pierna', 'torso', 'pierna', 'cuerpo'],
        6: ['torso', 'pierna', 'torso', 'pierna', 'cuerpo', 'cuerpo'],
      }
    : {
        1: ['cuerpo'],
        2: ['cuerpo', 'cuerpo'],
        3: ['empuje', 'tiron', 'pierna'],
        4: ['torso', 'pierna', 'torso', 'pierna'],
        5: ['empuje', 'tiron', 'pierna', 'torso', 'pierna'],
        6: ['empuje', 'tiron', 'pierna', 'empuje', 'tiron', 'pierna'],
      }
  return table[daysPerWeek] ?? table[3]
}

export function sessionCap(level: Level): number {
  if (level === 'principiante') return 5
  if (level === 'intermedio') return 6
  return 7
}

export function onboardingWeekGoal(today: string, weekdays: number[]): number {
  const index = weekdayMon0(today)
  const remaining = weekdays.filter((day) => day >= index)
  if (remaining.length === 0) return 0
  return Math.max(remaining.length, weekdays.includes(index) ? 1 : 0)
}

function byId(pool: PoolExercise[]): Map<string, PoolExercise> {
  return new Map(pool.map((exercise) => [exercise.id, exercise]))
}

export function pickRole(
  role: Role,
  appearance: number,
  used: Set<string>,
  equipment: EquipId[],
  pool: Map<string, PoolExercise>,
): PoolExercise | null {
  const candidates = ROLE_ORDER[role]
    .map((id) => pool.get(id))
    .filter((exercise): exercise is PoolExercise => Boolean(exercise && equipmentCovered(exercise.equipo, equipment)))
  if (candidates.length === 0) return null
  for (let offset = 0; offset < candidates.length; offset += 1) {
    const exercise = candidates[(offset + appearance) % candidates.length]
    if (exercise && !used.has(exercise.id)) return exercise
  }
  return null
}

export function selectSessionExercises(input: {
  pattern: Pattern
  appearance: number
  level: Level
  goal: Goal
  week: number
  equipment: EquipId[]
  pool: PoolExercise[]
}): PoolExercise[] {
  const poolMap = byId(input.pool)
  const cap = sessionCap(input.level)
  const reserveFinisher = input.goal === 'perdida_grasa' && input.week !== 4
  const limit = reserveFinisher ? cap - 1 : cap
  const used = new Set<string>()
  const chosen: PoolExercise[] = []
  for (const role of PATTERN_SLOTS[input.pattern]) {
    if (chosen.length >= limit) break
    const exercise = pickRole(role, input.appearance, used, input.equipment, poolMap)
    if (!exercise) continue
    used.add(exercise.id)
    chosen.push(exercise)
  }
  if (chosen.length < 4) {
    for (const id of FILLERS) {
      if (chosen.length >= cap) break
      if (used.has(id)) continue
      const exercise = poolMap.get(id)
      if (!exercise || !equipmentCovered(exercise.equipo, input.equipment)) continue
      used.add(id)
      chosen.push(exercise)
    }
  }
  if (reserveFinisher && chosen.length < cap) {
    const finisher = pickRole('finisher', input.appearance, used, input.equipment, poolMap)
    if (finisher) chosen.push(finisher)
  }
  return chosen
}

function suggestWeight(
  exercise: PoolExercise,
  role: Role,
  memory: ExerciseMemory | undefined,
  goal: Goal,
  week: number,
  barWeightKg: number,
): number | null {
  let suggested: number | null = null
  if (memory && memory.nextWeightKg != null) suggested = memory.nextWeightKg
  else if (memory?.bestE1rmKg) suggested = memory.bestE1rmKg * INTENSITY[goal]
  if (suggested == null) return null
  if (week === 4) suggested *= 0.9
  if (exercise.equipo.includes('barra') && suggested < barWeightKg) suggested = barWeightKg
  return Math.round(suggested * 100) / 100
}

export function prescribeExercise(input: {
  exercise: PoolExercise
  role: Role
  level: Level
  goal: Goal
  week: number
  isFirst: boolean
  memory: ExerciseMemory | undefined
  barWeightKg: number
}): PlannedExercise {
  const base = PRESCRIPTION[input.goal]
  let sets = input.level === 'principiante' ? Math.max(2, base.sets - 1) : base.sets
  let minReps = base.minReps
  let maxReps = base.maxReps
  let rest = input.level === 'principiante' ? base.rest + 30 : base.rest
  if (input.exercise.id === 'Plank' || input.exercise.logging === 'tiempo') {
    minReps = 20
    maxReps = 45
    rest = 60
  }
  if (input.week === 3 && input.isFirst) sets = Math.min(5, sets + 1)
  if (input.week === 4) {
    sets = 2
    maxReps = minReps
  }
  const incrementKg = HEAVY_ROLES.has(input.role) ? 2.5 : 1.25
  const suggestedWeightKg = input.exercise.logging === 'tiempo'
    ? null
    : suggestWeight(input.exercise, input.role, input.memory, input.goal, input.week, input.barWeightKg)
  const warmup: PlannedExercise['warmup'] = []
  const wantsWarmup = input.week < 4
    && input.isFirst
    && input.exercise.compound
    && input.exercise.logging !== 'tiempo'
    && suggestedWeightKg != null
    && (suggestedWeightKg >= 40 || input.exercise.equipo.includes('barra'))
  if (wantsWarmup && suggestedWeightKg != null) {
    warmup.push(
      { reps: 8, weightKg: roundToIncrement(suggestedWeightKg * 0.5, 2.5) },
      { reps: 4, weightKg: roundToIncrement(suggestedWeightKg * 0.75, 2.5) },
    )
  }
  return {
    exerciseId: input.exercise.id,
    nombre: input.exercise.nombre,
    role: input.role,
    sets,
    minReps,
    maxReps,
    restSec: rest,
    incrementKg,
    compound: input.exercise.compound,
    logging: input.exercise.logging,
    equipo: input.exercise.equipo,
    muscleGroup: input.exercise.muscleGroup,
    suggestedWeightKg,
    warmup,
    groupId: null,
  }
}

function roleFor(exercise: PoolExercise, pattern: Pattern, indexInPattern: number): Role {
  const slots = PATTERN_SLOTS[pattern]
  if (exercise.roles.includes('finisher') && exercise.roles.length === 1) return 'finisher'
  const slot = slots[indexInPattern]
  if (slot && exercise.roles.includes(slot)) return slot
  return exercise.roles[0] ?? 'core'
}

export function buildPlannedExercises(input: {
  pattern: Pattern
  appearance: number
  level: Level
  goal: Goal
  week: number
  equipment: EquipId[]
  pool: PoolExercise[]
  memory: ExerciseMemory[]
  barWeightKg: number
}): PlannedExercise[] {
  const memoryMap = new Map(input.memory.map((item) => [item.exerciseId, item]))
  const selected = selectSessionExercises(input)
  return selected.map((exercise, index) => {
    const role = exercise.roles.includes('finisher') && index === selected.length - 1 && input.goal === 'perdida_grasa'
      ? 'finisher'
      : roleFor(exercise, input.pattern, index)
    return prescribeExercise({
      exercise,
      role: exercise.roles.includes(role) ? role : (exercise.roles[0] ?? role),
      level: input.level,
      goal: input.goal,
      week: input.week,
      isFirst: index === 0,
      memory: memoryMap.get(exercise.id),
      barWeightKg: input.barWeightKg,
    })
  })
}

export function estimateDurationSec(exercises: PlannedExercise[]): number {
  const rests: number[] = []
  for (const exercise of exercises) {
    const count = exercise.warmup.length + exercise.sets
    for (let i = 0; i < count; i += 1) rests.push(exercise.restSec)
  }
  if (rests.length === 0) return 0
  const work = rests.length * 45
  const rest = rests.slice(0, -1).reduce((sum, value) => sum + value, 0)
  return work + rest
}

export function createArc(input: {
  profile: Pick<Profile, 'level' | 'goal' | 'equipment' | 'daysPerWeek' | 'weekdays'>
  pool: PoolExercise[]
  memory: ExerciseMemory[]
  arcIndex: number
  startsOn: string
  today: string
  barWeightKg: number
}): Arc {
  const id = `arco-${input.arcIndex}-${input.startsOn}`
  const patterns = weekPatterns(input.profile.level, input.profile.daysPerWeek)
  const weekdays = [...input.profile.weekdays].sort((a, b) => a - b)
  const sessions: PlannedSession[] = []
  for (let week = 1; week <= 4; week += 1) {
    const seen = new Map<Pattern, number>()
    weekdays.forEach((weekday, dayIndex) => {
      const date = addDays(input.startsOn, (week - 1) * 7 + weekday)
      const pattern = patterns[dayIndex] ?? patterns[0] ?? 'cuerpo'
      const appearance = seen.get(pattern) ?? 0
      seen.set(pattern, appearance + 1)
      const exercises = buildPlannedExercises({
        pattern,
        appearance,
        level: input.profile.level,
        goal: input.profile.goal,
        week,
        equipment: input.profile.equipment,
        pool: input.pool,
        memory: input.memory,
        barWeightKg: input.barWeightKg,
      })
      sessions.push({
        id: `plan-${id}-${date}`,
        date,
        pattern,
        weekIndex: week as 1 | 2 | 3 | 4,
        status: date < input.today ? 'omitido' : 'planificado',
        exercises,
      })
    })
  }
  return {
    id,
    index: input.arcIndex,
    name: arcName(input.arcIndex),
    startsOn: input.startsOn,
    status: 'activo',
    profileSnapshot: {
      level: input.profile.level,
      goal: input.profile.goal,
      equipment: [...input.profile.equipment],
      daysPerWeek: input.profile.daysPerWeek,
      weekdays,
    },
    sessions,
  }
}

export function regenerateFuture(arc: Arc, input: {
  profile: Pick<Profile, 'level' | 'goal' | 'equipment' | 'daysPerWeek' | 'weekdays'>
  pool: PoolExercise[]
  memory: ExerciseMemory[]
  today: string
  barWeightKg: number
}): Arc {
  const kept = arc.sessions.filter((session) => session.status !== 'planificado' || session.date < input.today)
  const fresh = createArc({ ...input, arcIndex: arc.index, startsOn: arc.startsOn })
  const keptIds = new Set(kept.map((session) => session.date))
  const future = fresh.sessions.filter((session) => session.date >= input.today && !keptIds.has(session.date) && session.status !== 'omitido')
  return {
    ...arc,
    profileSnapshot: fresh.profileSnapshot,
    sessions: [...kept, ...future].sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export function swapPlannedDates(arc: Arc, dateA: string, dateB: string): Arc {
  const first = arc.sessions.find((session) => session.date === dateA && (session.status === 'planificado' || session.status === 'omitido'))
  const second = arc.sessions.find((session) => session.date === dateB && (session.status === 'planificado' || session.status === 'omitido'))
  if (!first || !second) {
    const only = arc.sessions.find((session) => (session.date === dateA || session.date === dateB) && session.status === 'planificado')
    if (!only) return arc
    const target = only.date === dateA ? dateB : dateA
    return {
      ...arc,
      sessions: arc.sessions.map((session) => session.id === only.id ? { ...session, date: target, id: session.id } : session),
    }
  }
  return {
    ...arc,
    sessions: arc.sessions.map((session) => {
      if (session.id === first.id) return { ...session, date: dateB }
      if (session.id === second.id) return { ...session, date: dateA }
      return session
    }),
  }
}

export function arcEnd(startsOn: string): string {
  return addDays(startsOn, 27)
}

export function currentWeekIndex(startsOn: string, today: string): number {
  const diff = daysBetween(startsOn, mondayOf(today))
  return Math.min(4, Math.max(1, Math.floor(diff / 7) + 1))
}

export function describeWeek(week: number): string {
  return weekLine(week)
}

export { weekLine }
