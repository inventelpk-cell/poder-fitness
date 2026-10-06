export type Level = 'principiante' | 'intermedio' | 'avanzado'
export type Goal = 'fuerza' | 'hipertrofia' | 'resistencia' | 'perdida_grasa'
export type EquipId =
  | 'cuerpo'
  | 'mancuernas'
  | 'barra'
  | 'banco'
  | 'poleas'
  | 'maquinas'
  | 'kettlebell'
  | 'bandas'
  | 'dominadas'
export type Pattern = 'cuerpo' | 'empuje' | 'tiron' | 'pierna' | 'torso'
export type Role =
  | 'sentadilla'
  | 'bisagra'
  | 'empuje_horizontal'
  | 'tiron_horizontal'
  | 'empuje_vertical'
  | 'tiron_vertical'
  | 'gluteo'
  | 'unilateral'
  | 'accesorio_empuje'
  | 'accesorio_tiron'
  | 'hombro'
  | 'pantorrilla'
  | 'core'
  | 'finisher'
export type Logging = 'reps_peso' | 'reps' | 'tiempo' | 'distancia'
export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'brazos'
  | 'piernas'
  | 'gluteos'
  | 'core'
  | 'pantorrillas'
export type ThemeIntensity = 'calma' | 'pulso' | 'maximo'
export type Unit = 'kg' | 'lb'
export type SetKind = 'trabajo' | 'calentamiento'
export type PlannedStatus = 'planificado' | 'omitido' | 'cancelado' | 'en_curso' | 'completado'
export type SessionStatus = 'en_curso' | 'completado' | 'descartado'
export type SessionOrigin = 'arco' | 'rutina' | 'suelta'

export interface Profile {
  name: string
  level: Level
  goal: Goal
  equipment: EquipId[]
  daysPerWeek: number
  weekdays: number[]
  disclaimerAcceptedAt: string
}

export interface HeroQuota {
  pushups: number
  abs: number
  squats: number
  km: number
}

export interface Settings {
  unit: Unit
  themeIntensity: ThemeIntensity
  restVolume: number
  barWeightKg: number
  heroQuotaOverride: HeroQuota | null
  lastRankSeen: string
}

export interface PoolExercise {
  id: string
  nombre: string
  pasos: string[]
  roles: Role[]
  compound: boolean
  logging: Logging
  equipo: EquipId[]
  muscleGroup: MuscleGroup
}

export interface DbExercise {
  id: string
  nombre: string
  nombreOriginal: string
  instrucciones: string[]
  instruccionesOriginal: string[]
  musculosPrimarios: string[]
  musculosSecundarios: string[]
  equipo: string
  categoria: string
  nivel: string
  fuerza: string | null
  mecanica: string | null
  imagenes: string[]
}

export interface CustomExercise {
  id: string
  nombre: string
  musculosPrimarios: string[]
  equipo: string
  mecanica: 'compuesto' | 'aislamiento' | null
  logging: Logging
  custom: true
}

export interface LibraryExercise {
  id: string
  nombre: string
  nombreOriginal: string
  pasos: string[]
  pasosDePool: boolean
  avisoIdioma: boolean
  musculosPrimarios: string[]
  musculosSecundarios: string[]
  equipo: string
  categoria: string
  nivel: string
  fuerza: string | null
  mecanica: string | null
  imagenes: string[]
  muscleGroup: MuscleGroup
  compound: boolean
  logging: Logging
  custom: boolean
  pool: PoolExercise | null
}

export interface WarmupPlan {
  reps: number
  weightKg: number
}

export interface PlannedExercise {
  exerciseId: string
  nombre: string
  role: Role
  sets: number
  minReps: number
  maxReps: number
  restSec: number
  incrementKg: number
  compound: boolean
  logging: Logging
  equipo: EquipId[]
  muscleGroup: MuscleGroup
  suggestedWeightKg: number | null
  warmup: WarmupPlan[]
  groupId: null
}

export interface PlannedSession {
  id: string
  date: string
  pattern: Pattern
  weekIndex: 1 | 2 | 3 | 4
  status: PlannedStatus
  exercises: PlannedExercise[]
}

export interface Arc {
  id: string
  index: number
  name: string
  startsOn: string
  status: 'activo' | 'cerrado'
  profileSnapshot: Pick<Profile, 'level' | 'goal' | 'equipment' | 'daysPerWeek' | 'weekdays'>
  sessions: PlannedSession[]
}

export interface WorkoutSet {
  id: string
  kind: SetKind
  weightKg: number | null
  reps: number | null
  seconds: number | null
  km: number | null
  done: boolean
}

export interface SessionExercise {
  id: string
  exerciseId: string
  nombre: string
  logging: Logging
  compound: boolean
  equipo: EquipId[]
  catalogEquip: string
  muscleGroup: MuscleGroup
  musculosPrimarios: string[]
  role: Role | null
  setsPlanned: number
  minReps: number
  maxReps: number
  restSec: number
  incrementKg: number
  skipped: boolean
  substituted: boolean
  note: string
  sets: WorkoutSet[]
  groupId: null
}

export interface SessionRecord {
  exerciseId: string
  nombre: string
  type: 'carga' | 'reps'
}

export interface VolumeSlice {
  group: MuscleGroup
  kg: number
}

export interface SessionE1rm {
  exerciseId: string
  nombre: string
  e1rmKg: number
}

export interface WorkoutSession {
  id: string
  origin: SessionOrigin
  plannedSessionId: string | null
  routineId: string | null
  status: SessionStatus
  startedAt: string | null
  endedAt: string | null
  date: string
  goal: Goal
  level: Level
  deload: boolean
  weekIndex: number | null
  pattern: Pattern | null
  exercises: SessionExercise[]
  xp: number
  xpBreakdown: XpBreakdown | null
  records: SessionRecord[]
  volumeByGroup: VolumeSlice[]
  exerciseE1rm: SessionE1rm[]
  progressNotes: { exerciseId: string; text: string }[]
}

export interface XpBreakdown {
  series: number
  volumen: number
  records: number
  sesion: number
  total: number
}

export interface ExerciseMemory {
  exerciseId: string
  lastWorkingSets: { weightKg: number; reps: number }[]
  nextWeightKg: number | null
  nextReps: number | null
  bestE1rmKg: number | null
  bestReps: { weightKg: number; reps: number }[]
}

export interface RoutineExercise {
  id: string
  exerciseId: string
  nombre: string
  logging: Logging
  compound: boolean
  equipo: EquipId[]
  catalogEquip: string
  muscleGroup: MuscleGroup
  musculosPrimarios: string[]
  sets: number
  minReps: number
  maxReps: number
  restSec: number
  note: string
  groupId: null
}

export interface Routine {
  id: string
  name: string
  exercises: RoutineExercise[]
}

export interface BodyWeightEntry {
  id: string
  at: string
  date: string
  kg: number
}

export interface HeroDay {
  date: string
  quota: HeroQuota
  manual: HeroQuota
  manualXp: number
  bonusGranted: boolean
  shield: boolean
}

export interface XpEvent {
  id: string
  at: string
  amount: number
  kind: 'session' | 'achievement' | 'hero'
  breakdown?: XpBreakdown
  ref?: string
}

export interface AchievementUnlock {
  id: string
  unlockedAt: string
  xp: number
}

export interface GymStreakState {
  streak: number
  countedWeeks: string[]
  closedWeeks: string[]
  weekGoals: Record<string, number>
}

export interface HeroStreakState {
  streak: number
  lastActiveDate: string | null
  shield: number
  shieldWeek: string
  shieldedDates: string[]
}

export interface StreakState {
  gym: GymStreakState
  hero: HeroStreakState
  xpTotal: number
  level: number
}

export interface BackupFile {
  schemaVersion: 1
  exportedAt: string
  app: 'poder-fitness'
  profile: Profile | null
  settings: Settings
  exercisesCustom: CustomExercise[]
  routines: Routine[]
  arcs: Arc[]
  sessions: WorkoutSession[]
  memory: ExerciseMemory[]
  bodyWeight: BodyWeightEntry[]
  heroManual: HeroQuotaLog[]
  heroDays: HeroDay[]
  xpEvents: XpEvent[]
  achievements: AchievementUnlock[]
  streaks: StreakState
}

export interface HeroQuotaLog {
  id: string
  date: string
  pushups: number
  abs: number
  squats: number
  km: number
  xp: number
}
